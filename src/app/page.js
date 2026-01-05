"use client";
import React, { useState, useEffect } from 'react';

export default function Home() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  // This automatically fetches the latest standings when the page loads
  useEffect(() => {
    async function getStandings() {
      try {
        const res = await fetch('/api/standings');
        const data = await res.json();
        setStandings(data);
        setLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setLoading(false);
      }
    }
    getStandings();
  }, []);

  const simulate = () => {
    const lottery = [...standings.slice(0, 14)].sort(() => Math.random() - 0.5);
    const nonLottery = [...standings.slice(14)];
    setStandings([...lottery, ...nonLottery]);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f5f5]">
      <p className="text-[#2f3e4e] font-black animate-pulse text-2xl uppercase italic">Syncing Live Standings...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 md:p-12 font-sans text-[#2f3e4e]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-light mb-10 tracking-tight">2026 NBA Draft Lottery Simulator</h1>
          <div className="flex justify-center gap-4">
            <button onClick={simulate} className="bg-[#2f3e4e] text-white px-12 py-3 rounded font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">Sim Lottery</button>
            <button onClick={() => window.location.reload()} className="bg-[#9ea3a8] text-white px-12 py-3 rounded font-black uppercase tracking-widest shadow-md">Reset</button>
          </div>
        </div>

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
                <React.Fragment key={team.name}>
                  <tr className="hover:bg-[#fcfcfc] transition-colors border-l-4 border-transparent hover:border-l-[#2f3e4e]">
                    <td className="px-6 py-4 font-bold text-[#d1d1d1]">{i + 1}</td>
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img src={team.logo} className="w-8 h-8 object-contain" alt="" />
                      <span className="font-black text-lg uppercase italic">{team.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-[#9ea3a8]">{team.record}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-[#9ea3a8]">{team.winPct}</td>
                    <td className={`px-6 py-4 text-center font-black uppercase ${team.streak.includes('W') ? 'text-green-600' : 'text-red-500'}`}>{team.streak}</td>
                    <td className="px-6 py-4 text-right font-black text-xl">{i < 3 ? '14.0%' : i === 3 ? '12.5%' : '---'}</td>
                  </tr>
                  {i === 13 && (
                    <tr className="bg-[#f5f5f5]">
                      <td colSpan="6" className="text-center py-2 text-[10px] font-black text-[#9ea3a8] uppercase tracking-[0.4em]">End of Lottery</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
