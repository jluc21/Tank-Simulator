import React from 'react';
import SimulatorClient from './SimulatorClient';

async function getLiveStandings() {
  const ESPN_URL = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings';
  try {
    const res = await fetch(ESPN_URL, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const conferences = data?.children || [];
    const allEntries = conferences.flatMap(conf => conf.standings?.entries || []);
    if (allEntries.length === 0) throw new Error("No league data found");

    // Map initial data and extract numeric wins/losses for GB calculation
    const rawTeams = allEntries.map(entry => {
      const stats = entry.stats || [];
      const getStat = (name) => stats.find(s => s.name === name)?.value;
      const displayStat = (name) => stats.find(s => s.name === name)?.displayValue;
      
      return {
        id: entry.team?.id || Math.random().toString(),
        name: entry.team?.displayName || "NBA Team",
        abbreviation: entry.team?.abbreviation || entry.team?.displayName?.substring(0,3).toUpperCase(),
        logo: entry.team?.logos?.[0]?.href || null,
        record: displayStat('summary') || `${getStat('wins') || 0}-${getStat('losses') || 0}`,
        winPct: displayStat('winPercent') || "0.000",
        wins: getStat('wins') || 0,
        losses: getStat('losses') || 0,
        gb: getStat('gamesBehind') // Primary GB source from ESPN
      };
    }).sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct));

    // Fallback GB Computation Logic
    // Leader is the team with the BEST record (last in our sorted lottery list)
    const leader = rawTeams[rawTeams.length - 1];
    const finalTeams = rawTeams.map(t => {
      let val = t.gb;
      if (val === undefined || val === null) {
        // Compute: ((leaderWins - teamWins) + (teamLosses - leaderLosses)) / 2
        val = ((leader.wins - t.wins) + (t.losses - leader.losses)) / 2;
      }
      return {
        ...t,
        gbDisplay: parseFloat(val) === 0 ? "--" : parseFloat(val).toFixed(1)
      };
    });

    return {
      success: true,
      timestamp: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      }),
      teams: finalTeams
    };
  } catch (error) {
    return { success: false, error: error.message, teams: [] };
  }
}

export default async function StandingsPage() {
  const report = await getLiveStandings();
  if (!report.success || report.teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-6">
        <div className="max-w-md w-full bg-white border-t-4 border-red-600 p-8 shadow-2xl rounded-xl">
          <h2 className="text-2xl font-black text-[#2f3e4e] uppercase italic mb-4">Sync Error</h2>
          <p className="text-[#9ea3a8] mb-6 font-medium">Real-time standings are unreachable.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] p-4 md:p-8 font-sans text-[#2f3e4e]">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-2">
            2026 NBA Lottery Simulator
          </h1>
          <div className="flex justify-center items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[9px] font-black text-[#9ea3a8] uppercase tracking-[0.4em]">
              REAL-TIME SYNC • {report.timestamp}
            </p>
          </div>
        </header>
        <SimulatorClient initialTeams={report.teams} />
        <footer className="mt-8 text-center py-4 border-t border-gray-100">
           <p className="text-[9px] font-black text-[#9ea3a8] uppercase tracking-[0.5em]">Live Feed Active • 30 Teams Loaded</p>
        </footer>
      </div>
    </main>
  );
} 
