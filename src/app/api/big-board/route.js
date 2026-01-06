import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const seeds = [
    { url: 'https://www.espn.com/nba/draft/bestavailable', kind: 'htmlSeed' },
    { url: 'https://site.api.espn.com/apis/v2/sports/basketball/nba/draft/prospects', kind: 'jsonCandidate' }
  ];

  const diag = { tried: [], foundExtractedCount: 0, lastSnippet: "" };
  const probeQueue = [...seeds];
  const visited = new Set();
  let successfulPlayers = null;
  let sourceUrl = "";
  let upstreamStatus = 0;

  const fetchWithTimeout = async (url) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000); // 8s timeout
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          "accept": "application/json, text/html",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      clearTimeout(id);
      return res;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  while (probeQueue.length > 0 && diag.tried.length < 25) {
    const { url, kind } = probeQueue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const res = await fetchWithTimeout(url);
      upstreamStatus = res.status;
      const text = await res.text();
      diag.tried.push({ url, status: res.status, kind });
      diag.lastSnippet = text.substring(0, 200);

      if (!res.ok) continue;

      // Attempt JSON discovery
      try {
        const json = JSON.parse(text);
        
        // Flexible Player Extraction logic
        const findArray = (obj) => {
          if (Array.isArray(obj)) return obj;
          for (let k in obj) {
            if (Array.isArray(obj[k]) && obj[k].length > 0 && (obj[k][0].displayName || obj[k][0].athlete)) return obj[k];
            if (typeof obj[k] === 'object' && obj[k] !== null) {
              const nested = findArray(obj[k]);
              if (nested) return nested;
            }
          }
          return null;
        };

        const potentialPlayers = findArray(json);
        if (potentialPlayers) {
          successfulPlayers = potentialPlayers.map((p, idx) => ({
            id: p.id || p.athlete?.id || `idx-${idx}`,
            rank: p.rank || p.overallRank || idx + 1,
            name: p.displayName || p.athlete?.displayName || "Unknown",
            position: p.position?.[0]?.abbreviation || p.athlete?.position?.abbreviation || "N/A",
            school: p.school?.displayName || p.athlete?.school?.displayName || "N/A",
            image: p.headshot?.href || p.athlete?.headshot?.href || null,
            ppg: "—", rpg: "—", apg: "—"
          }));
          sourceUrl = url;
          break;
        }

        // Recursive link harvesting in JSON
        const links = text.match(/https?:\/\/[^"'\s]+\/apis\/[^"'\s]+/g) || [];
        links.forEach(link => {
          if (!visited.has(link)) {
            probeQueue.push({ url: link, kind: 'jsonDiscovered' });
            diag.foundExtractedCount++;
          }
        });

      } catch (e) {
        // HTML Extraction logic if JSON parse fails
        const matches = text.match(/(https?:\/\/(site|sports|web)\.api\.espn\.com\/apis\/[^\s"']+)/g) || [];
        matches.forEach(m => {
          const clean = m.replace(/[\\;]$/, '');
          if (!visited.has(clean)) {
            probeQueue.push({ url: clean, kind: 'htmlExtracted' });
            diag.foundExtractedCount++;
          }
        });
      }
    } catch (err) {
      diag.tried.push({ url, error: err.message, kind });
    }
  }

  return NextResponse.json({
    ok: !!successfulPlayers,
    updatedAt: new Date().toISOString(),
    sourceUrl,
    upstreamStatus,
    probe: "big-board discovery active",
    diagnostics: diag,
    players: successfulPlayers || []
  }, { status: 200 });
} 
