import React from 'react';
import SimulatorClient from './SimulatorClient';

async function getLiveNBAStandings() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings',
      { next: { revalidate: 0 } } // Ensures fresh data on every load
    );
    
    if (!res.ok) return [];
    const data = await res.json();

    // Check if the data structure exists before mapping to avoid build errors
    if (!data?.children?.[0]?.standings?.entries) return [];

    const teams = data.children[0].standings.entries.map((entry) => ({
      name: entry.team.displayName,
      logo: entry.team.logos[0].href,
      record: entry.stats.find(s => s.name === 'summary')?.displayValue || '0-0',
      winPct: entry.stats.find(s => s.name === 'winPercent')?.displayValue || '.000',
      streak: entry.stats.find(s => s.name === 'streak')?.displayValue || '-',
    }));

    // Sort by worst record (lottery style)
    return teams.sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct)).slice(0, 14);
  } catch (error) {
    console.error("ESPN Sync Error:", error);
    return [];
  }
}

export default async function Home() {
  const standings = await getLiveNBAStandings();

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 md:p-12 font-sans text-[#2f3e4e]">
      <div className="max-w-5xl mx-auto">
        {/* Pass data to the client-side simulator */}
        <SimulatorClient initialData={standings} />
      </div>
    </div>
  );
}
