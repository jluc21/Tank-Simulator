"use client";
import React, { useState, useMemo } from 'react';
import { draftPicks } from '../picks/data';
import { prospects } from '../big-board/data';

// Helper for official logos
const getTeamLogo = (team) => `https://www.nba.com/.element/img/1.0/teams/logos/${team}.svg`;

export default function DraftCommand() {
  const [selections, setSelections] = useState({});
  const [activePickIndex, setActivePickIndex] = useState(0);

  // Flatten and sort the 2026 picks
  const allPicks2026 = useMemo(() => {
    return Object.entries(draftPicks).flatMap(([team, picks]) => 
      picks.filter(p => p.year === 2026).map(p => ({ ...p, team }))
    ).sort((a, b) => a.round - b.round);
  }, []);

  const draftedPlayerIds = Object.values(selections).map(p => p.rank);
  const availableProspects = prospects.filter(p => !draftedPlayerIds.includes(p.rank));

  const handleSelect = (player) => {
    setSelections(prev => ({ ...prev, [activePickIndex]: player }));
    if (activePickIndex < allPicks2026.length - 1) setActivePickIndex(activePickIndex + 1);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* LEFT: SLIM DRAFT TICKER */}
      <aside className="w-80 bg-[#0a0a0a] border-r border-gray-800 flex flex-col shadow-2xl">
        <div className="p-6 bg-gradient-to-br from-green-900/20 to-black border-b border-gray-800">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase text-green-500">Draft Command</h1>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">2026 Class</span>
            <button onClick={() => {setSelections({}); setActivePickIndex(0);}} className="text-[9px] text-red-500 hover:text-red-400 font-bold uppercase underline">Reset</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {allPicks2026.map((pick, index) => (
            <div 
              key={index}
              onClick={() => setActivePickIndex(index)}
              className={`group flex items-center gap-4 p-3 rounded-xl transition-all border ${
                activePickIndex === index ? 'bg-green-600/10 border-green-500 ring-1 ring-green-500' : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <span className="text-[10px] font-mono text-gray-600 font-bold w-5">{index + 1}</span>
              <img src={getTeamLogo(pick.team)} className="w-8 h-8 object-contain" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-gray-500 uppercase leading-none mb-1">{pick.team}</p>
                {selections[index] ? (
                  <p className="text-xs font-bold text-white truncate uppercase italic">{selections[index].name}</p>
                ) : (
                  <p className="text-[10px] font-bold text-gray-700 uppercase italic">On the clock</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT: PLAYER SELECTION GRID */}
      <main className="flex-1 overflow-y-auto p-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4">
              The Board <span className="text-lg font-normal text-gray-600 not-italic tracking-normal">/ Round {allPicks2026[activePickIndex]?.round}</span>
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Current Team:</span>
              <img src={getTeamLogo(allPicks2026[activePickIndex]?.team)} className="w-6 h-6" alt="" />
              <span className="text-green-500 font-black uppercase text-xl italic">{allPicks2026[activePickIndex]?.team}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableProspects.map((player) => (
              <div 
                key={player.rank}
                className="bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-green-500/40 hover:bg-[#151515] transition-all group relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute -top-4 -right-4 text-7xl font-black text-white/[0.03] group-hover:text-white/[0.07] italic transition-colors">
                  {player.rank}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={player.img} className="w-12 h-12 rounded-lg bg-white p-1 shadow-lg" alt="" />
                    <div>
                      <h3 className="text-xl font-bold uppercase italic leading-none group-hover:text-green-400 transition-colors">{player.name}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{player.pos} — {player.team}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-800/50 my-4">
                    <div>
                      <p className="text-[9px] font-bold text-gray-600 uppercase italic">Points</p>
                      <p className="text-xl font-black text-green-500 font-mono">{player.stats.ppg}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-600 uppercase italic">FG%</p>
                      <p className="text-xl font-black text-white font-mono">{player.stats.fg}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleSelect(player)}
                  className="w-full bg-white text-black font-black italic uppercase text-xs py-4 rounded-xl hover:bg-green-500 hover:text-white transition-all active:scale-95 shadow-lg relative z-10"
                >
                  Confirm Selection
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
