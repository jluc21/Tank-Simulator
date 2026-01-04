"use client";
import React, { useState, useEffect } from 'react';

export default function RebuildWatchHome() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load: Check LocalStorage first for "No Wait Time"
  useEffect(() => {
    const cachedData = localStorage.getItem('espn_standings');
    if (cachedData) {
      setStandings(JSON.parse(cachedData));
      setLoading(false);
    }
    fetchStandings();
  }, []);

  // 2. Background Sync: Fetch live NBA standings from ESPN API
  async function fetchStandings() {
    try {
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings');
      const data = await res.json();
      
      const teams = data.children[0].standings.entries.map((entry, index) => ({
        team: entry.team.displayName,
        logo: entry.team.logos[0].href,
        record: entry.stats.find(s => s.name === 'summary').displayValue,
        winPct: entry.stats.find(s => s.name === 'winPercent').displayValue,
        streak: entry.stats.find(s => s.name === 'streak')?.displayValue || 'N/A'
      }));

      const lotteryTeams = teams.slice(0, 14);
      setStandings(lotteryTeams);
      localStorage.setItem('espn_standings', JSON.stringify(lotteryTeams));
      setLoading(false);
    } catch (err) {
      console.error("ESPN Sync Failed:", err);
      setLoading(false); // Stop loading even on error to show cached or empty state
    }
  }

  const simulateLottery = () => {
    // Shuffles the current view based on simple random logic (Tankathon style)
    const shuffled = [...standings].sort(() => Math.random() - 0.5);
    setStandings(shuffled);
  };

  const resetSimulator = () => {
    const cachedData = localStorage.getItem('espn_standings');
    if (cachedData) setStandings(JSON.parse(cachedData));
    else fetchStandings();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* CENTERED HEADER & CONTROLS (TANKATHON STYLE) */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-[#2f3e4e] uppercase italic tracking-tighter mb-8">
            2026 NBA Draft Lottery Simulator
          </h1>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={simulateLottery}
              className="bg-[#2f3e4e] text-white px-12 py-4 rounded-lg font-black uppercase italic tracking-widest hover:bg-[#1a252f] transition-all transform active:scale-95 shadow-2xl"
            >
              Sim Lottery
            </button>
            <button 
              onClick={resetSimulator}
              className="bg-[#9ea3a8] text-white px-8 py-4 rounded-lg font-black uppercase italic tracking-widest hover:bg-[#2f3e4e] transition-all shadow-md"
            >
              Reset
            </button>
          </div>
        </div>

        {/* LOADING STATE (Only shows if there is NO cached data) */}
        {loading && standings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#9ea3a8] font-black uppercase tracking-[0.3em] animate-pulse">Syncing with ESPN...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-[#d1d1d1] overflow-hidden overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
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
                  <tr key={i} className="hover:bg-[#fcfcfc] transition-colors border-l-4 border-transparent hover:border-l-[#2f3e4e]">
                    <td className="px-6 py-4 text-xl font-black text-[#d1d1d1]">{i + 1}</td>
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img src={team.logo} className="w-8 h-8 object-contain" alt="" />
                      <span className="font-bold text-[#2f3e4e] uppercase italic">{team.team}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-[#9ea3a8]">{team.record}</td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-[#9ea3a8]">{team.winPct}</td>
                    <td className={`px-6 py-4 text-xs font-black uppercase ${team.streak.includes('W') ? 'text-green-600' : 'text-red-500'}`}>
                      {team.streak}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-[#2f3e4e]">
                      {/* Weighted odds based on 2026 structure */}
                      {i < 3 ? '14.0%' : i === 3 ? '12.5%' : i === 4 ? '10.5%' : '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
