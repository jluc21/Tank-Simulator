"use client";
import React, { useState } from 'react';

export default function SimulatorClient({ initialData }) {
  const [standings, setStandings] = useState(initialData);

  const simulate = () => {
    // Simple Tankathon-style shuffle
    const shuffled = [...standings].sort(() => Math.random() - 0.5);
    setStandings(shuffled);
  };

  return (
    <>
      {/* 1. CENTERED HEADER (TANKATHON STYLE) */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-light mb-10 tracking-tight">
          2026 NBA Draft Lottery Simulator
        </h1>
        
        <div className="flex justify-center gap-3">
          <button 
            onClick={simulate}
            className="bg-[#2f3e4e] text-white px-12 py-3 rounded font-black uppercase tracking-widest hover:bg-[#1a252f] shadow-xl active:scale-95 transition-all"
          >
            Sim Lottery
          </button>
          <button 
            onClick={() => setStandings(initialData)}
            className="bg-[#9ea3a8] text-white px-12 py-3 rounded font-black uppercase tracking-widest hover:bg-[#2f3e4e] transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 2. DATA TABLE */}
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
              <tr key={team.name} className="hover:bg-[#fcfcfc] transition-colors">
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
                <td className="px-6 py-4 text-right font-black text-xl">
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
    </>
  );
}
