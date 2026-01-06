import React from 'react';
import BigBoardClient from './BigBoardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getBigBoardData() {
  try {
    // Attempt to load the local data first
    const players = require('../../data/bigboard.json');
    return {
      success: true,
      timestamp: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      }),
      players: players || []
    };
  } catch (error) {
    console.error("Server data load error:", error);
    return { success: false, players: [], error: error.message };
  }
}

export default async function BigBoardPage() {
  const data = await getBigBoardData();

  return (
    <main className="min-h-screen bg-[#f5f5f5] p-4 md:p-8 font-sans text-[#2f3e4e]">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-2 text-[#2f3e4e]">
            2026 NBA BIG BOARD
          </h1>
          <p className="text-[10px] font-black text-[#9ea3a8] uppercase tracking-[0.4em]">
            LAST UPDATED • {data.timestamp || "SYNCING"} ET
          </p>
        </header>
        {/* Pass consistent players prop */}
        <BigBoardClient players={data.players} />
      </div>
    </main>
  );
} 
