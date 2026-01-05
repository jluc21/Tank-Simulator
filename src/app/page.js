import React from 'react';
import SimulatorClient from './SimulatorClient';

async function getLiveStandings() {
  const ESPN_URL = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings';
  
  try {
    const res = await fetch(ESPN_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();

    // LEAGUE FLATTENING: Captures all 30 teams from both conferences
    const conferences = data?.children || [];
    const allEntries = conferences.flatMap(conf => conf.standings?.entries || []);

    if (!allEntries || allEntries.length === 0) return [];

    return allEntries.map(entry => {
      const stats = entry.stats || [];
      const getStat = (name) => stats.find(s => s.name === name)?.value;
      const displayStat = (name) => stats.find(s => s.name === name)?.displayValue;

      return {
        id: entry.team?.id || Math.random().toString(),
        name: entry.team?.displayName || "NBA Team",
        logo: entry.team?.logos?.[0]?.href || null,
        record: displayStat('summary') || `${getStat('wins') || 0}-${getStat('losses') || 0}`,
        winPct: displayStat('winPercent') || "0.000",
      };
    }).sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct));
  } catch (error) {
    return [];
  }
}

export default async function StandingsPage() {
  const teams = await getLiveStandings();

  // ERROR GATEKEEPER: Prevents ".map of undefined" build crash
  if (!teams || teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="max-w-md bg-white border-t-4 border-red-600 p-8 shadow-2xl rounded-xl">
          <h2 className="text-2xl font-black uppercase italic mb-4">Sync Error</h2>
          <p className="text-[#9ea3a8]">Live ESPN standings are temporarily unreachable.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] p-6 md:p-12 font-sans text-[#2f3e4e]">
      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">REBUILD WATCH</h1>
        <p className="text-[10px] font-black text-[#9ea3a8] uppercase tracking-[0.4em]">NBA Lottery Simulator</p>
      </header>
      <SimulatorClient initialTeams={teams} />
    </main>
  );
}
