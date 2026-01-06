import React from 'react';
import BigBoardClient from './BigBoardClient';

// Force the page to never cache so stats are always fresh
export const revalidate = 0;

async function getBigBoardData() {
  // Replace with your specific Draft API or ESPN Prospect endpoint
  const API_URL = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/draft/prospects';
  
  try {
    const res = await fetch(API_URL, { 
      cache: 'no-store', // Fix: Bypasses Next.js default fetch cache
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const prospects = data?.prospects || [];

    return {
      success: true,
      timestamp: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      }),
      players: prospects.map(p => {
        const stats = p.statistics || [];
        // Helper to find specific stats safely
        const findStat = (label) => stats.find(s => s.label === label)?.displayValue || "—";

        return {
          id: p.id || Math.random().toString(),
          rank: p.rank || "—",
          name: p.displayName || "Unknown Player",
          position: p.position?.[0]?.abbreviation || "N/A",
          school: p.school?.displayName || "N/A",
          ppg: findStat('PTS'), // Mapping Fix: Explicit key matching
          rpg: findStat('REB'),
          apg: findStat('AST'),
          image: p.headshot?.href || null
        };
      })
    };
  } catch (error) {
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
          {/* Requirement: Live Eastern Time Timestamp */}
          <p className="text-[10px] font-black text-[#9ea3a8] uppercase tracking-[0.4em]">
            LAST UPDATED • {data.timestamp} ET
          </p>
        </header>

        <BigBoardClient initialPlayers={data.players} />
      </div>
    </main>
  );
}  
