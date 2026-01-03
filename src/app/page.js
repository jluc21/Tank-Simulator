"use client";
import React, { useState, useMemo } from 'react';
import { draftPicks } from '../picks/data';
import { prospects } from '../big-board/data';

// Helper to get NBA Team Logos dynamically
const getTeamLogo = (team) => `https://cdn.nba.com/logos/nba/${team === 'GSW' ? 1610612744 : 1610612737}/primary/L/logo.svg`; 
// Note: In a real app, you'd map every team ID. For now, we use a placeholder logic.

export default function DraftCommand() {
  const [selections, setSelections] = useState({});
  const [activePickIndex, setActivePickIndex] = useState(0);

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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden flex flex-col">
      {/* 1. STICKY PROGRESS HEADER */}
      <header className="h-16 border-b border-gray-800 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-tighter text-green-500 uppercase italic">Mock Draft 2.0</h1>
          <div className="h-4 w-px bg-gray-700" />
          <p className="text-xs font-mono text-gray-400">PICK {activePickIndex + 1} OF {allPicks2026.length}</p>
        </div>
        <button onClick={() => {setSelections({}); setActivePickIndex(0);}} className="text-[10px] font-bold tracking-widest text-red-500 border border-red-500/30 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-all uppercase">Reset</button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 2. SLIM DRAFT TICKER (LEFT) */}
        <aside className="w-64 overflow-y-auto border-r border-gray-900 bg-[#050505] p-2 custom-scrollbar">
          {allPicks2026.map((pick, index) => (
            <div 
              key={index}
              onClick={() => setActivePickIndex(index)}
              className={`relative mb-1 p-2 rounded flex items-center gap-3 cursor-pointer transition-all ${
                activePickIndex === index ? 'bg-green-500/10 border border-green-500/50' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="text-[10px] font-mono text-gray-600 w-4">{index + 1}</span>
              <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center p-1.5">
                <span className="text-[10px] font-bold text-gray-400">{pick.team}</span>
              </div>
              <div className="flex-1 min-w-0">
                {selections[index] ? (
                  <p className="text-[11px] font-bold text-white truncate uppercase">{selections[index].name}</p>
                ) : (
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{pick.team}</p>
                )}
              </div>
            </div>
          ))}
        </aside>

        {/* 3. DENSE PROSPECT GRID (RIGHT) */}
        <main className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-green-900/5 via-black to-black">
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {availableProspects.map(player => (
              <div key={player.rank} className="group relative bg-[#111] border border-gray-800 rounded-lg p-4 hover:border-green-500/50 transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold leading-none mb-1 group-hover:text-green-400 transition-colors uppercase">{player.name}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{player.position} • {player.school}</p>
                  </div>
                  <span className="text-2xl font-black italic text-gray-800 group-hover:text-gray-700 transition-colors">#{player.rank}</span>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 font-bold uppercase italic">PPG</p>
                      <p className="text-sm font-mono font-bold text-green-500">{player.stats.ppg}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 font-bold uppercase italic">FG%</p>
                      <p className="text-sm font-mono font-bold text-white">{player.stats.fg}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSelect(player)}
                    className="bg-white text-black text-[10px] font-black px-6 py-2 rounded-full hover:bg-green-500 hover:text-white transition-all transform active:scale-90 uppercase tracking-widest"
                  >
                    Select Pick
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
