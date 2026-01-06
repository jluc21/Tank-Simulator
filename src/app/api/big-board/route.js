import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const candidates = [
    'https://site.api.espn.com/apis/v2/sports/basketball/nba/draft/prospects',
    'https://site.api.espn.com/apis/v2/sports/basketball/nba/draft/rankings',
    'https://site.web.api.espn.com/apis/v2/sports/basketball/nba/draft/prospects',
    'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/draft/prospects'
  ];

  const diag = { tried: [], lastSnippet: "" };
  let successfulPayload = null;
  let sourceUrl = "";
  let upstreamStatus = 0;

  for (const url of candidates) {
    try {
      const res = await fetch(url, { 
        cache: 'no-store',
        headers: { 
          "accept": "application/json",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
        }
      });
      
      upstreamStatus = res.status;
      const text = await res.text();
      diag.tried.push({ url, status: res.status });
      diag.lastSnippet = text.substring(0, 300);

      if (res.ok) {
        successfulPayload = JSON.parse(text);
        sourceUrl = url;
        break; 
      }
    } catch (e) {
      diag.tried.push({ url, error: e.message });
    }
  }

  // Defensive Parsing
  let rawPlayers = [];
  if (successfulPayload) {
    rawPlayers = successfulPayload.prospects || 
                 successfulPayload.items || 
                 successfulPayload.rankings || 
                 successfulPayload.draft?.prospects || 
                 successfulPayload.draft?.rankings || 
                 successfulPayload.page?.content?.items || [];
  }

  // Always return 200, even on failure
  return NextResponse.json({
    ok: rawPlayers.length > 0,
    updatedAt: new Date().toISOString(),
    sourceUrl,
    upstreamStatus,
    probe: "big-board route live",
    diagnostics: diag,
    players: rawPlayers.map(p => ({
      id: p.id || Math.random().toString(),
      rank: p.rank || "—",
      name: p.displayName || p.athlete?.displayName || "Unknown Player",
      position: p.position?.[0]?.abbreviation || "N/A",
      school: p.school?.displayName || p.athlete?.school?.displayName || "N/A",
      image: p.headshot?.href || p.athlete?.headshot?.href || null,
      ppg: "—", rpg: "—", apg: "—" // Stats optional for this pass
    }))
  }, { status: 200 });
} 
