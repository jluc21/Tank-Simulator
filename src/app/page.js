import React from 'react';
import SimulatorClient from './SimulatorClient';

// This function runs on the server to get live data before the page loads
async function getLiveStandings() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings',
      { next: { revalidate: 0 } } // Forces fresh data on every visit
    );
    const data = await res.json();

    // Mapping ESPN data into the Tankathon format
    return data.children[0].standings.entries.map((entry) => ({
      name: entry.team.displayName,
      logo: entry.team.logos[0].href,
      record: entry.stats.find(s => s.name === 'summary')?.displayValue || '0-0',
      winPct: entry.stats.find(s => s.name === 'winPercent')?.displayValue || '.000',
      streak: entry.stats.find(s => s.name === 'streak')?.displayValue || '-',
    })).sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct)).slice(0, 14);
  } catch (err) {
    return []; // Returns empty if API is down
  }
}

export default async function Home() {
  const standings = await getLiveStandings();

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 md:p-12 font-sans text-[#2f3e4e]">
      <div className="max-w-4xl mx-auto">
        {/* Pass the live data to the interactive simulator */}
        <SimulatorClient initialData={standings} />
      </div>
    </div>
  );
}
