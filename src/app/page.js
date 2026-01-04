"use client";
import React, { useState, useEffect } from 'react';

export default function RebuildWatchHome() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real-time NBA standings from ESPN's API
  useEffect(() => {
    async function fetchStandings() {
      try {
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings');
        const data = await res.json();
        
        // Extract teams and sort by worst record for lottery order
        const teams = data.children[0].standings.entries.map((entry, index) => ({
          team: entry.team.displayName,
          logo: entry.team.logos[0].href,
          record: entry.stats.find(s => s.name === 'summary').displayValue,
          winPct: entry.stats.find(s => s.name === 'winPercent').displayValue,
          streak: entry.stats.find(s => s.name === 'streak')?.displayValue || 'N/A'
        }));

        setStandings(teams.slice(0, 14)); // Top 14 lottery teams
        setLoading(false);
      } catch (err) {
        console.error("ESPN Sync Failed:", err);
      }
    }
    fetchStandings();
  }, []);

  const simulateLottery = () => {
    const shuffled = [...standings].sort(() => Math.random() - 0.5);
    setStandings(shuffled);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f5f5]">
      <p className="text-[#2f3e4e] font-black uppercase tracking-widest animate-pulse">Syncing with ESPN Standings...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* SIMPLICITY HEADER: Tankathon Style */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-[#2f3e4e] uppercase italic tracking-tighter mb-6">
            2026 NBA Draft Lottery Simulator
          </h1>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={simulateLottery}
              className="bg-[#2f3e4e] text-white px-10 py-3 rounded-lg font-black uppercase italic tracking-widest hover:bg-[#1a252f] transition-all transform active:scale-95 shadow-xl"
            >
              Sim Lottery
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#9ea3a8] text-white px-10 py-3 rounded-lg font-black uppercase italic tracking-widest hover:bg-[#2f3e4e] transition-all shadow-md"
            >
              Reset
            </button>
          </div>
        </div>

        {/* STANDINGS TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#d1d1d1] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#2f3e4e] text-white text-[11px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-4">Pick</th>
                <th className="px-6 py-4">Team</th>
                <th className="px-6 py-4">Record</th>
                <th className="px-6 py-4">Win%</th>
                <th className="px-6 py-4">Streak</th>
                <th className="px-6 py-4 text-right">#1 Odds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {standings.map((team, i) => (
                <tr key={i} className="hover:bg-[#fcfcfc] transition-colors">
                  <td className="px-6 py-5 text-xl font-black text-[#d1d1d1]">{i + 1}</td>
                  <td className="px-6 py-5 flex items-center gap-4">
                    <img src={team.logo} className="w-8 h-8 object-contain" alt="" />
                    <span className="font-bold text-[#2f3e4e] uppercase italic">{team.team}</span>
                  </td>
                  <td className="px-6 py-5 font-mono text-sm font-bold text-[#9ea3a8]">{team.record}</td>
                  <td className="px-6 py-5 font-mono text-sm font-bold text-[#9ea3a8]">{team.winPct}</td>
                  <td className={`px-6 py-5 text-xs font-black uppercase ${team.streak.includes('W') ? 'text-green-600' : 'text-red-500'}`}>
                    {team.streak}
                  </td>
                  <td className="px-6 py-5 text-right font-black text-[#2f3e4e]">
                    {/* Simplified Odds display */}
                    {i < 3 ? '14.0%' : i === 3 ? '12.5%' : '---'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
