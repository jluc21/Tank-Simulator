import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const API_URL = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/draft/prospects';
  
  try {
    const res = await fetch(API_URL, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!res.ok) return NextResponse.json({ error: `Upstream Error: ${res.status}` }, { status: res.status });
    
    const data = await res.json();
    const prospects = data?.prospects || [];

    // Canonical Response Shape for BigBoardClient
    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      players: prospects.map(p => {
        const stats = p.statistics || [];
        const findStat = (label) => {
          const found = stats.find(s => s.label === label || s.abbreviation === label);
          return found?.displayValue || found?.value || "—";
        };

        return {
          id: p.id || `p-${Math.random()}`,
          rank: p.rank || "—",
          name: p.displayName || "Unknown Player",
          position: p.position?.[0]?.abbreviation || "N/A",
          school: p.school?.displayName || "N/A",
          ppg: findStat('PTS'),
          rpg: findStat('REB'),
          apg: findStat('AST'),
          image: p.headshot?.href || null
        };
      })
    });
  } catch (error) {
    return NextResponse.json({ error: "Server Fetch Failed" }, { status: 500 });
  }
} 
