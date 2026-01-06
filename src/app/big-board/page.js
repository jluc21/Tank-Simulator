import React from 'react';
import BigBoardClient from './BigBoardClient';

// FORCE DYNAMIC RENDERING - Bypasses build-time caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getBigBoardData() {
  const API_URL = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/draft/prospects';
  
  try {
    const res = await fetch(API_URL, { 
      cache: 'no-store', // Ensures fresh data every request
      next: { revalidate: 0 } 
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();

    // Defensive extraction of prospects array
    const prospects = data?.prospects || [];

    return {
      success: true,
      timestamp: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      players: prospects.map(p => {
        const stats = p.statistics || [];
        // Robust Stat Resolver with fallbacks
        const findStat = (label) => {
          const found = stats.find(s => s.label === label || s.abbreviation === label);
          return found?.displayValue || found?.value || "—";
        };

        return {
          id: p.id || `p-${Math.random()}`,
          rank: p.rank || "—",
          name: p.displayName || "Unknown Player",
          position: p.position?.[0]?.abbreviation || "N/A",
          school: p.school?.displayName || p.school?.name || "N/A",
          ppg: findStat('PTS'),
          rpg: findStat('REB'),
          apg: findStat('AST'),
          image: p.headshot?.href || null
        };
      })
    };
  } catch (error) {
    console.error("Big Board Fetch Failure:", error);
    return { success: false, error: error.message, players: [] };
  }
}

export default async function BigBoardPage() {
  const data = await getBigBoardData();

  return (
    <main className="min-h-screen bg-[#f5f5f5] p-4 md:p-8 font-sans text-[#2f3e4e]">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-2">
            2026 NBA BIG BOARD
          </h1>
          <p className="text-[10px] font-black text-[#9ea3a8] uppercase tracking-[0.4em]">
            {data.success ? `LAST UPDATED • ${data.timestamp} ET` : "SYNC ERROR"}
          </p>
        </header>

        {/* Surgical Fix: Always passing the status and players array */}
        <BigBoardClient 
          initialPlayers={data.players} 
          fetchError={!data.success ? data.error : null} 
        />
      </div>
    </main>
  );
} 
