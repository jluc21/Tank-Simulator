import React from 'react';
import BigBoardClient from './BigBoardClient';

// This reads the data from the fixed JSON file above
import playersData from '../../data/bigboard_2026.json';

export default async function BigBoardPage() {
  // We fetch the enriched data from your API route
  let players = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/big-board`, { 
      cache: 'no-store' 
    });
    players = await res.json();
  } catch (e) {
    console.error("Failed to fetch enriched data, falling back to local list", e);
    players = playersData; // Use the local list if the API fails
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] p-4 md:p-8 font-sans text-[#2f3e4e]">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-2">
            2026 NBA BIG BOARD
          </h1>
        </header>
        <BigBoardClient players={players} />
      </div>
    </main>
  );
} 
