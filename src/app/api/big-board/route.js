import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Task 4: In-memory cache (TTL: 10 minutes)
const athleteCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const debugMode = searchParams.get('debug') === '1';
  let debugLog = { matches: [] };

  try {
    const jsonPath = path.join(process.cwd(), 'src/data/bigboard.json');
    const localData = JSON.parse(await fs.readFile(jsonPath, 'utf8'));

    const upstreamUrl = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/draft/prospects';
    const res = await fetch(upstreamUrl, { cache: 'no-store' });
    const upstreamData = await res.json();
    const upstreamProspects = upstreamData?.prospects || [];

    if (debugMode) {
      debugLog.upstreamKeys = Object.keys(upstreamProspects[0] || {});
      debugLog.upstreamSample = upstreamProspects.slice(0, 1);
    }

    const enrichedPlayers = await Promise.all(localData.map(async (local) => {
      // Task 2: athleteId-first matching with normalized fallback
      const normalize = (s) => s?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      const match = upstreamProspects.find(p => {
        const upstreamId = p.id || p.athlete?.id;
        if (local.athleteId && upstreamId === local.athleteId) return true;
        
        const nameMatch = normalize(p.displayName) === normalize(local.name);
        const schoolToken = local.school.toLowerCase().split(' ')[0];
        const schoolMatch = p.school?.displayName?.toLowerCase().includes(schoolToken);
        return nameMatch && schoolMatch;
      });

      let athleteDetail = null;
      let matchedId = match?.id || match?.athlete?.id;

      if (match) {
        // Task 4: Cache check
        if (athleteCache.has(matchedId) && (Date.now() - athleteCache.get(matchedId).fetchedAt < CACHE_TTL)) {
          athleteDetail = athleteCache.get(matchedId);
        } else {
          // Task 3: Athlete-detail endpoint discovery (profile scan)
          const athleteLink = match.athlete?.$ref || 
                             match.athlete?.links?.find(l => l.rel?.includes('athlete'))?.href ||
                             JSON.stringify(match).match(/https?:\/\/[^"']+\/athletes\/(\d+)/)?.[0];

          if (athleteLink) {
            try {
              const detailRes = await fetch(athleteLink.replace('http:', 'https:'), { cache: 'no-store' });
              athleteDetail = await detailRes.json();
              athleteDetail.fetchedAt = Date.now();
              athleteCache.set(matchedId, athleteDetail);
            } catch (e) { athleteDetail = null; }
          }
        }
      }

      // Task 3 helper: Robust stats extraction
      const extractStats = (detail) => {
        if (!detail) return { ppg: "—", rpg: "—", apg: "—" };
        const stats = detail.statistics || detail.athlete?.statistics || [];
        // Recursive search for stat categories
        const findVal = (labels) => {
          const s = stats.find(group => group.name?.toUpperCase() === 'STATISTICS' || group.name === 'season')
                      ?.stats?.find(item => labels.includes(item.abbreviation?.toUpperCase()) || labels.includes(item.label?.toUpperCase()));
          return s?.displayValue || "—";
        };
        return {
          ppg: findVal(['PTS', 'POINTS', 'PPG']),
          rpg: findVal(['REB', 'REBOUNDS', 'RPG']),
          apg: findVal(['AST', 'ASSISTS', 'APG'])
        };
      };

      const { ppg, rpg, apg } = extractStats(athleteDetail);
      const headshot = athleteDetail?.headshot?.href || athleteDetail?.athlete?.headshot?.url || match?.headshot?.href || null;

      if (debugMode && match) {
        debugLog.matches.push({
          localName: local.name,
          athleteId: local.athleteId,
          matchedId,
          detailKeys: athleteDetail ? Object.keys(athleteDetail) : 'None'
        });
      }

      return {
        ...local,
        image: headshot,
        ppg, rpg, apg,
        matchConfidence: match ? (local.athleteId ? "high" : "medium") : "none"
      };
    }));

    if (debugMode) return NextResponse.json({ ok: true, ...debugLog });

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      source: "local+enriched",
      players: enrichedPlayers
    });

  } catch (error) {
    return NextResponse.json({ ok: false, players: [], error: error.message }, { status: 200 });
  }
}
