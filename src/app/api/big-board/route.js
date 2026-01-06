import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const debugMode = searchParams.get('debug') === '1';

  try {
    // 1. Load Local JSON
    const jsonPath = path.join(process.cwd(), 'src/data/bigboard.json');
    const localData = JSON.parse(await fs.readFile(jsonPath, 'utf8'));

    // 2. Fetch Upstream Data (ESPN Prospects API)
    const upstreamUrl = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/draft/prospects';
    const res = await fetch(upstreamUrl, { cache: 'no-store' });
    const upstreamData = await res.json();
    const upstreamProspects = upstreamData?.prospects || [];

    // Helper: Normalize name for matching (e.g., "Mikel Brown Jr." -> "mikelbrown")
    const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\s/g, '') || '';

    // 3. Enrichment Mapping
    const enrichedPlayers = localData.map(local => {
      // Find match in upstream
      const match = upstreamProspects.find(p => {
        if (local.athleteId && p.id === local.athleteId) return true;
        const nameMatch = normalize(p.displayName) === normalize(local.name);
        const schoolMatch = p.school?.displayName?.toLowerCase().includes(local.school.toLowerCase().split(' ')[0]);
        return nameMatch && schoolMatch;
      });

      // Extract Headshot
      const image = match?.headshot?.href || 
                    match?.athlete?.headshot?.href || 
                    match?.athlete?.headshot?.url || 
                    match?.image?.href || null;

      // Extract Stats Safely
      const statsArray = match?.statistics || match?.athlete?.statistics || match?.stats || [];
      const getStat = (label) => {
        const found = statsArray.find(s => s.label === label || s.abbreviation === label || s.name === label);
        return found?.displayValue || "—";
      };

      return {
        ...local,
        image,
        ppg: getStat('PTS'),
        rpg: getStat('REB'),
        apg: getStat('AST'),
        matchConfidence: match ? (local.athleteId ? "high" : "medium") : "none"
      };
    });

    // 4. Debug Output
    if (debugMode) {
      const sample = upstreamProspects[0] || {};
      return NextResponse.json({
        debug: true,
        localPlayersSample: localData.slice(0, 3),
        upstreamRawSample: upstreamProspects.slice(0, 2),
        upstreamKeys: {
          root: Object.keys(sample),
          nested: sample.athlete ? Object.keys(sample.athlete) : []
        },
        mappingReport: enrichedPlayers.slice(0, 3).map(p => ({
          name: p.name,
          matchConfidence: p.matchConfidence,
          imageFound: !!p.image,
          statsFound: p.ppg !== "—"
        }))
      });
    }

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      source: "local+enriched",
      players: enrichedPlayers
    });

  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
} 
