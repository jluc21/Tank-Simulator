import React from 'react';
import SimulatorClient from './SimulatorClient';

// SERVER-SIDE DATA ENGINE (Master Code)
async function getLiveStandings() {
  const ESPN_URL = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings';
  
  try {
    const res = await fetch(ESPN_URL, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const conferences = data?.children || [];
    const allEntries = conferences.flatMap(conf => conf.standings?.entries || []);

    if (allEntries.length === 0) throw new Error("No league data found");

    return {
      success: true,
      timestamp: new Date().toISOString(),
      teams: allEntries.map(entry => {
        const stats = entry.stats || [];
        const getStat = (name) => stats.find(s => s.name === name)?.value;
        const displayStat = (name) => stats.find(s => s.name === name)?.displayValue;
        const summary = displayStat('summary');
        
        return {
          id: entry.team?.id || Math.random().toString(),
          name: entry.team?.displayName || "NBA Team",
          logo: entry.team?.logos?.[0]?.href || null,
          record: summary || `${getStat('wins') || 0}-${getStat('losses') || 0}`,
          winPct: displayStat('winPercent') || "0.000",
        };
      }).sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct))
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
          <p className="text-[#9ea3a8] mb-6 font-medium tracking-tight leading-relaxed">
            Real-time standings are unreachable. Please refresh or check back later.
          </p>
          <div className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">Trace: {report.error}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] p-6 md:p-12 font-sans text-[#2f3e4e]">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
            2026 NBA Lottery Simulator
          </h1>
          <div className="flex justify-center items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-[#9ea3a8] uppercase tracking-[0.4em]">
              Real-Time Sync • {new Date(report.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </header>

        {/* DATA BRIDGE: Passing teams directly to the interactive client */}
        <SimulatorClient initialTeams={report.teams} />

        <footer className="bg-[#f5f5f5] text-center py-4 border-t border-gray-100 mt-10">
           <p className="text-[9px] font-black text-[#9ea3a8] uppercase tracking-[0.5em]">Live Feed Active • 30 Teams Loaded</p>
        </footer>
      </div>
    </main>
  );
} 
