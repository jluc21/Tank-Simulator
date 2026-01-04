"use client";
import React, { useState, useEffect } from 'react';

export default function RebuildWatchHome() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandings() {
      try {
        // We use a proxy to prevent the browser from blocking the ESPN API
        const proxy = "https://corsproxy.io/?";
        const target = encodeURIComponent("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings");
        
        const res = await fetch(proxy + target);
        const data = await res.json();
        
        const teams = data.children[0].standings.entries.map((entry) => ({
          name: entry.team.displayName,
          logo: entry.team.logos[0].href,
          record: entry.stats.find(s => s.name === 'summary').displayValue,
          winPct: entry.stats.find(s => s.name === 'winPercent').displayValue,
          streak: entry.stats.find(s => s.name === 'streak')?.displayValue || 'N/A'
        }));

        // Tankathon Style: Worst records at the top for the lottery
        const lotteryOrder = teams.sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct)).slice(0, 14);
        
        setStandings(lotteryOrder);
        setLoading(false);
      } catch (err) {
        console.error("ESPN Sync Failed:", err);
        setLoading(false);
      }
    }
    fetchStandings();
  }, []);

  const simulateLottery = () => {
    const shuffled = [...standings].sort(() => Math.random() - 0.5);
    setStandings(shuffled);
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center bg-[#f5f5f5]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#2f3e4e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#2f3e4e] font-black uppercase tracking-[0.2em]">Syncing Live Standings...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* TANKATHON STYLE HEADER */}
        <div className="text-center mt-8 mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#2f3e4e] uppercase italic tracking-tighter mb-10">
            2026 NBA Draft Lottery Simulator
          </h1>
          
          <div className="flex justify-center gap-6">
            <button 
              onClick={simulateLottery}
              className="bg-[#2f3e4e] text-white px-14 py-4 rounded-xl font-black uppercase italic tracking-widest hover:bg-[#1a252f] transition-all transform active:scale-95 shadow-2xl"
            >
              Sim Lottery
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#9ea3a8] text-white px-10 py-4 rounded-xl font-black uppercase italic tracking-widest hover:bg-[#2f3e4e] transition-all shadow-md"
            >
              Reset
            </button>
          </div>
        </div>

        {/* STANDINGS TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#d1d1d1] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#2f3e4e] text-white text-[10px] font-black uppercase tracking-[0.25em]">
                <th className="px-8 py-5">Pick</th>
                <th className="px-6 py-5">Team</th>
                <th className="px-6 py-5">Record</th>
                <th className="px-6 py-5">Win%</th>
                <th className="px-6 py-5">Streak</th>
                <th className="px-8 py-5 text-right">#1 Odds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {standings.map((team, i) => (
                <tr key={team.name} className="hover:bg-[#fcfcfc] transition-colors border-l-4 border-transparent hover:border-l-[#2f3e4e]">
                  <td className="px-8 py-5 text-2xl font-black text-[#d1d1d1]">{i + 1}</td>
                  <td className="px-6 py-5 flex items-center gap-5">
                    <img src={team.logo} className="w-10 h-10 object-contain" alt="" />
                    <span className="text-lg font-black text-[#2f3e4e] uppercase italic">{team.name}</span>
                  </td>
                  <td className="px-6 py-5 font-mono text-sm font-bold text-[#9ea3a8]">{team.record}</td>
                  <td className="px-6 py-5 font-mono text-sm font-bold text-[#9ea3a8]">{team.winPct}</td>
                  <td className={`px-6 py-5 text-xs font-black uppercase ${team.streak.includes('W') ? 'text-green-600' : 'text-red-500'}`}>
                    {team.streak}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-[#2f3e4e] text-lg">
                    {i < 3 ? '14.0%' : i === 3 ? '12.5%' : i === 4 ? '10.5%' : '---'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-center mt-10 text-[10px] font-bold text-[#9ea3a8] uppercase tracking-widest italic">
          Real-Time Data Synced via ESPN API
        </p>
      </div>
    </div>
  );
}
