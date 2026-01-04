"use client";
import React, { useState, useEffect } from 'react';

export default function LotterySimulator() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch live NBA standings from ESPN API
  useEffect(() => {
    async function fetchStandings() {
      try {
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings');
        const data = await res.json();
        
        // Extract teams and sort by worst record for lottery order
        const teams = data.children[0].standings.entries.map((entry, index) => ({
          rank: index + 1,
          team: entry.team.displayName,
          logo: entry.team.logos[0].href,
          record: entry.stats.find(s => s.name === 'summary').displayValue,
          winPct: entry.stats.find(s => s.name === 'winPercent').displayValue,
          streak: entry.stats.find(s => s.name === 'streak')?.displayValue || 'N/A'
        }));

        // Tankathon-style: Only show the bottom 14 lottery teams
        setStandings(teams.slice(0, 14));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch ESPN data", err);
      }
    }
    fetchStandings();
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#f5f5f5]">
      {/* SIDEBAR: ACTION PANEL */}
      <aside className="w-[350px] bg-white border-r border-[#d1d1d1] p-10 flex flex-col justify-between shadow-sm">
        <div>
          <h1 className="text-5xl font-black text-[#2f3e4e] leading-[0.85] uppercase mb-2">
            2026 NBA<br /><span className="text-[#9ea3a8]">LOTTOS</span>
          </h1>
          <p className="text-[10px] font-bold text-[#9ea3a8] tracking-[0.2em] uppercase italic mb-10">
            Real-Time Simulation via ESPN API
          </p>
          <button className="w-full bg-[#2f3e4e] text-white py-6 rounded-xl font-black italic uppercase tracking-widest hover:bg-[#1a252f] transition-all transform active:scale-95 shadow-2xl">
            Simulate Lottery
          </button>
        </div>

        <div className="bg-[#f5f5f5] p-5 rounded-2xl border border-[#d1d1d1]">
          <p className="text-[10px] font-black text-[#2f3e4e] uppercase mb-2">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-[#9ea3a8] uppercase">Standings Live</span>
          </div>
        </div>
      </aside>

      {/* MAIN: TANKATHON STYLE TABLE */}
      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-sm border border-[#d1d1d1] overflow-hidden">
          <div className="p-6 border-b border-[#f5f5f5] flex justify-between items-center bg-white sticky top-0 z-10">
            <h2 className="text-2xl font-black text-[#2f3e4e] uppercase italic tracking-tighter">Current Lottery Odds</h2>
            <button className="text-[10px] font-black text-red-500 uppercase underline">Reset Simulator</button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-[#9ea3a8] uppercase tracking-widest border-b border-[#f5f5f5]">
                <th className="px-8 py-4">Pick</th>
                <th className="px-4 py-4">Team</th>
                <th className="px-4 py-4">Record</th>
                <th className="px-4 py-4">Win%</th>
                <th className="px-4 py-4">Streak</th>
                <th className="px-8 py-4 text-right">#1 Odds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-20 font-bold text-[#d1d1d1] animate-pulse">SYNCING WITH ESPN...</td></tr>
              ) : (
                standings.map((team, i) => (
                  <tr key={i} className="hover:bg-[#fcfcfc] transition-colors group">
                    <td className="px-8 py-5 text-xl font-black text-[#d1d1d1] group-hover:text-[#2f3e4e]">{i + 1}</td>
                    <td className="px-4 py-5 flex items-center gap-4">
                      <img src={team.logo} className="w-8 h-8 object-contain" alt="" />
                      <span className="font-black text-[#2f3e4e] uppercase italic">{team.team}</span>
                    </td>
                    <td className="px-4 py-5 font-mono text-sm font-bold text-[#9ea3a8]">{team.record}</td>
                    <td className="px-4 py-5 font-mono text-sm font-bold text-[#9ea3a8]">{team.winPct}</td>
                    <td className={`px-4 py-5 text-xs font-black uppercase ${team.streak.includes('W') ? 'text-green-500' : 'text-red-500'}`}>
                      {team.streak}
                    </td>
                    <td className="px-8 py-5 text-right font-black text-[#2f3e4e]">
                      {/* Example lottery odds mapping */}
                      {i === 0 ? '14.0%' : i === 1 ? '14.0%' : i === 2 ? '14.0%' : '---'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
