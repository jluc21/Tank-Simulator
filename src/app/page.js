import React from 'react';

// SERVER-SIDE DATA ENGINE
async function getLiveStandings() {
  // Use the specific league-level endpoint for higher reliability
  const ESPN_URL = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings';
  
  try {
    const res = await fetch(ESPN_URL, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // DEEP-SEARCH CRAWLER: Find the 'entries' array regardless of nesting
    let rawEntries = null;
    
    // Check common ESPN nesting paths
    if (data?.children?.[0]?.standings?.entries) {
      rawEntries = data.children[0].standings.entries;
    } else if (data?.children?.[0]?.children?.[0]?.standings?.entries) {
      rawEntries = data.children[0].children[0].standings.entries;
    } else if (data?.standings?.entries) {
      rawEntries = data.standings.entries;
    }

    if (!rawEntries || !Array.isArray(rawEntries)) {
       throw new Error("Deep Search could not locate team entries");
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      teams: rawEntries.map(entry => ({
        id: entry.team?.id || Math.random().toString(),
        name: entry.team?.displayName || "NBA Team",
        abbreviation: entry.team?.abbreviation || "NBA",
        logo: entry.team?.logos?.[0]?.href || null,
        // ESPN provides a 'summary' stat like "10-25"
        record: entry.stats?.find(s => s.name === 'summary')?.displayValue || 
                entry.stats?.find(s => s.type === 'summary')?.displayValue || "0-0",
        // ESPN winPercent is usually a string like ".286"
        winPct: entry.stats?.find(s => s.name === 'winPercent')?.displayValue || "0.000",
      })).sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct))
    };
  } catch (error) {
    return { success: false, error: error.message, teams: [] };
  }
}

export default async function StandingsPage() {
  const report = await getLiveStandings();

  // ERROR PANEL: Only shown if Deep Search fails
  if (!report.success || report.teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-6">
        <div className="max-w-md w-full bg-white border-t-4 border-red-600 p-8 shadow-2xl rounded-xl">
          <h2 className="text-2xl font-black text-[#2f3e4e] uppercase italic mb-4">Sync Error</h2>
          <p className="text-[#9ea3a8] mb-6 font-medium leading-relaxed">
            Real-time standings are unreachable. Deep Search failed to locate the data stream.
          </p>
          <div className="text-[9px] font-mono text-gray-400 uppercase">
            Build Trace: {report.error}
          </div>
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

        <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl rounded-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-black uppercase text-[#9ea3a8] border-b border-gray-100 bg-gray-50/50">
                <th className="px-8 py-5">Pick</th>
                <th className="px-6 py-5">Team</th>
                <th className="px-6 py-5 text-center">Record</th>
                <th className="px-8 py-5 text-right">Win%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {report.teams.map((team, index) => (
                <tr key={team.id} className="hover:bg-gray-50/80 transition-all group">
                  <td className="px-8 py-5 text-2xl font-black text-gray-200 tabular-nums">
                    {index + 1}
                  </td>
                  <td className="px-6 py-5 flex items-center gap-5">
                    {team.logo && (
                      <img src={team.logo} alt="" className="w-10 h-10 object-contain drop-shadow-sm" />
                    )}
                    <span className="font-black text-xl uppercase italic group-hover:not-italic tracking-tighter">
                      {team.name}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-mono font-bold text-[#9ea3a8]">
                    {team.record}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-2xl tabular-nums">
                    {team.winPct}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <footer className="bg-[#f5f5f5] text-center py-4 border-t border-gray-100">
             <p className="text-[9px] font-black text-[#9ea3a8] uppercase tracking-[0.5em]">Live Feed Active</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
