"use client";
import React, { useState } from 'react';

export default function SimulatorClient({ initialTeams }) {
  const [standings, setStandings] = useState(initialTeams);

  const simulate = () => {
    // Tankathon-style shuffle
    const shuffled = [...standings].sort(() => Math.random() - 0.5);
    setStandings(shuffled);
  };

  const reset = () => {
    setStandings(initialTeams);
  };

  return (
    <>
      {/* 1. CENTERED CONTROLS (TANKATHON STYLE) */}
      <div className="text-center mt-12 mb-16">
        <h1 className="text-5xl font-black text-[#2f3e4e] uppercase italic tracking-tighter mb-10">
          2026 NBA Draft Lottery Simulator
        </h1>
        
        <div className="flex justify-center gap-6">
          <button 
            onClick={simulate}
            className="bg-[#2f3e4e] text-white px-16 py-5 rounded-2xl font-black uppercase italic tracking-[0.1em] hover:bg-[#1a252f] shadow-2xl transition-all active:scale-95"
          >
            Simulate Lottery
          </button>
          <button 
            onClick={reset}
            className="bg-[#9ea3a8] text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-[0.1em] hover:bg-[#2f3e4e] shadow-md transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME DATA TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-[#d1d1d1] overflow-hidden">
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
                  <img src={team.logo} className="w-10 h-10 object-contain drop-shadow-sm" alt="" />
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
      
      <p className="text-center mt-8 text-[10px] font-bold text-[#9ea3a8] uppercase tracking-widest italic">
        LIVE DATA SYNCED VIA ESPN API
      </p>
    </>
  );
}
