"use client";
import React, { useState } from 'react';

// Official NBA Lottery Odds for the top 14 seeds
const NBA_LOTTO_ODDS = [
  { p1: "14.0%", p4: "52.1%" }, { p1: "14.0%", p4: "52.1%" }, { p1: "14.0%", p4: "52.1%" },
  { p1: "12.5%", p4: "48.1%" }, { p1: "10.5%", p4: "42.1%" }, { p1: "9.0%", p4: "37.2%" },
  { p1: "7.5%", p4: "31.9%" }, { p1: "6.0%", p4: "26.3%" }, { p1: "4.5%", p4: "20.3%" },
  { p1: "3.0%", p4: "13.9%" }, { p1: "2.0%", p4: "9.4%" }, { p1: "1.5%", p4: "7.1%" },
  { p1: "1.0%", p4: "4.8%" }, { p1: "0.5%", p4: "2.4%" }
];

export default function SimulatorClient({ initialData }) {
  const [standings, setStandings] = useState(initialData);

  const simulate = () => {
    // Tankathon-style shuffle for the lottery section
    const shuffled = [...standings].sort(() => Math.random() - 0.5);
    setStandings(shuffled);
  };

  return (
    <>
      {/* 1. CENTERED HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-10 text-[#2f3e4e]">
          2026 NBA Lottery Simulator
        </h1>
        
        <div className="flex justify-center gap-3">
          <button 
            onClick={simulate}
            className="bg-[#2f3e4e] text-white px-12 py-3 rounded font-black uppercase tracking-widest hover:bg-black shadow-xl active:scale-95 transition-all"
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

      {/* 2. DATA TABLE - High Density Layout */}
      <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl overflow-hidden rounded-sm">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="text-[10px] font-black uppercase border-b border-[#f0f0f0] text-[#9ea3a8] bg-gray-50/50">
              <th className="w-16 px-4 py-3">Pick</th>
              <th className="w-56 md:w-72 px-4 py-3">Team</th>
              <th className="w-24 px-2 py-3 text-center">Record</th>
              <th className="w-24 px-4 py-3 text-right">Top 4</th>
              <th className="w-28 px-6 py-3 text-right">#1 OVR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {standings.map((team, i) => {
              const odds = NBA_LOTTO_ODDS[i] || { p1: '---', p4: '---' };
              
              return (
                <tr key={team.name} className="hover:bg-gray-50/80 transition-colors group">
                  {/* PICK: Darkened to brand gray for readability */}
                  <td className="px-4 py-3 font-black text-2xl text-[#9ea3a8] tabular-nums">
                    {i + 1}
                  </td>
                  
                  {/* TEAM: Tight spacing with logo */}
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={team.logo} className="w-7 h-7 object-contain drop-shadow-sm" alt="" />
                    <span className="font-black text-base md:text-lg uppercase italic tracking-tighter text-[#2f3e4e]">
                      {team.name}
                    </span>
                  </td>
                  
                  {/* RECORD: Matched to numeric column weight/size */}
                  <td className="px-2 py-3 text-center font-mono font-black text-[#2f3e4e] text-sm md:text-base">
                    {team.record}
                  </td>
                  
                  {/* TOP 4: Darkened to brand slate for contrast */}
                  <td className="px-4 py-3 text-right font-medium text-[#2f3e4e] text-sm md:text-base">
                    {odds.p4}
                  </td>
                  
                  {/* #1 OVR: Bold emphasis */}
                  <td className="px-6 py-4 text-right font-black text-xl text-[#2f3e4e] tabular-nums">
                    {odds.p1}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* BOUNDARY DIVIDER */}
        <div className="bg-[#2f3e4e] text-center py-3">
          <span className="text-[11px] font-bold text-white uppercase tracking-[0.6em]">
            End of Lottery
          </span>
        </div>
      </div>
    </>
  );
} 
