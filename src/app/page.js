"use client";
import React, { useState, useEffect } from 'react';

export default function Home() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function forceSyncStandings() {
      try {
        // Cache Buster: Adds a unique timestamp so the browser can't use an old 'stuck' version
        const cacheBuster = Date.now();
        const targetUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings?cb=${cacheBuster}`;
        
        // Using AllOrigins proxy for better reliability in browser environments
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        const json = await res.json();
        const data = JSON.parse(json.contents);
        
        const teams = data.children[0].standings.entries.map((entry) => ({
          name: entry.team.displayName,
          logo: entry.team.logos[0].href,
          record: entry.stats.find(s => s.name === 'summary')?.displayValue || '0-0',
          winPct: entry.stats.find(s => s.name === 'winPercent')?.displayValue || '.000',
          streak: entry.stats.find(s => s.name === 'streak')?.displayValue || '-',
        }));

        // Lottery Order: Sort by win percentage (Worst to Best)
        const lotteryOrder = teams.sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct)).slice(0, 14);
        setStandings(lotteryOrder);
        setLoading(false);
      } catch (err) {
        console.error("Force Sync Failed:", err);
        setLoading(false);
      }
    }
    forceSyncStandings();
  }, []);

  const simulate = () => {
    setStandings([...standings].sort(() => Math.random() - 0.5));
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f5f5]">
      <p className="text-[#2f3e4e] font-black animate-pulse text-2xl uppercase italic tracking-widest">
        Syncing Rebuild Watch...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 md:p-12 font-sans text-[#2f3e4e]">
      <div className="max-w-5xl mx-auto">
        {/* HEADER CONTROLS */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-light mb-10 tracking-tight">2026 NBA Draft Lottery Simulator</h1>
          <div className="flex justify-center gap-4">
            <button 
              onClick={simulate}
              className="bg-[#2f3e4e] text-white px-12 py-3 rounded font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
            >
              Sim Lottery
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#9ea3a8] text-white px-12 py-3 rounded font-black uppercase tracking-widest shadow-md"
            >
              Reset
            </button>
          </div>
        </div>

        {/* TANKATHON STYLE TABLE */}
        <div className="bg-white border-t-4 border-[#2f3e4e] shadow-lg">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] font-black uppercase border-b border-[#d1d1d1] text-[#9ea3a8]">
                <th className="px-6 py-4">Pick</th>
                <th className="px-6 py-4">Team</th>
                <th className="px-6 py-4 text-center">Record</th>
                <th className="px-6 py-4 text-center">Win%</th>
                <th className="px-6 py-4 text-center">Streak</th>
                <th className="px-6 py-4 text-right">#1 OVR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {standings.map((team, i) => (
                <tr key={team.name} className="hover:bg-[#fcfcfc] transition-colors border-l-4 border-transparent hover:border-l-[#2f3e4e]">
                  <td className="px-6 py-4 font-bold text-[#d1d1d1]">{i + 1}</td>
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img src={team.logo} className="w-8 h-8 object-contain" alt="" />
                    <span className="font-black text-lg uppercase italic">{team.name}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-[#9ea3a8]">{team.record}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-[#9ea3a8]">{team.winPct}</td>
                  <td className={`px-6 py-4 text-center font-black uppercase ${team.streak.includes('W') ? 'text-green-600' : 'text-red-500'}`}>
                    {team.streak}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-xl text-[#2f3e4e]">
                    {i < 3 ? '14.0%' : i === 3 ? '12.5%' : '---'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-[#f5f5f5] text-center py-3 text-[10px] font-black text-[#9ea3a8] uppercase tracking-[0.4em]">
            End of Lottery
          </div>
        </div>
        <p className="text-center mt-10 text-[10px] font-bold text-[#9ea3a8] uppercase tracking-widest italic">
          Live Standings via ESPN API
        </p>
      </div>
    </div>
  );
}
