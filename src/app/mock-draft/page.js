"use client";
import React, { useState, useMemo } from 'react';
// These paths are relative to src/app/mock-draft/page.js
import { draftPicks } from '../picks/data'; 
import { prospects } from '../big-board/data';

const getTeamLogo = (team) => `https://www.nba.com/.element/img/1.0/teams/logos/${team}.svg`;

const TEAM_COLORS = {
  ATL: '#E03A3E', BOS: '#007A33', BKN: '#FFFFFF', CHA: '#1D1160', CHI: '#CE1141',
  CLE: '#860038', DAL: '#0053BC', DEN: '#0E2240', DET: '#1D428A', GSW: '#FFC72C',
  HOU: '#CE1141', IND: '#002D62', LAC: '#C8102E', LAL: '#FDB927', MEM: '#5D76A9',
  MIA: '#98002E', MIL: '#00471B', MIN: '#0C2340', NOP: '#002B5C', NYK: '#006BB6',
  OKC: '#007AC1', ORL: '#0077C0', PHI: '#006BB6', PHX: '#1D1160', POR: '#E03A3E',
  SAC: '#5A2D81', SAS: '#C4CED4', TOR: '#CE1141', UTA: '#002B5C', WAS: '#002B5C'
};

export default function DraftCommand() {
  const [selections, setSelections] = useState({});
  const [activePickIndex, setActivePickIndex] = useState(0);

  const allPicks2026 = useMemo(() => {
    if (!draftPicks) return [];
    return Object.entries(draftPicks).flatMap(([team, picks]) => 
      picks.filter(p => p.year === 2026).map(p => ({ ...p, team }))
    ).sort((a, b) => a.round - b.round);
  }, []);

  const draftedPlayerIds = Object.values(selections).map(p => p.rank);
  const availableProspects = prospects.filter(p => !draftedPlayerIds.includes(p.rank));

  const handleSelect = (player) => {
    setSelections(prev => ({ ...prev, [activePickIndex]: player }));
    if (activePickIndex < allPicks2026.length - 1) {
      setActivePickIndex(activePickIndex + 1);
    }
  };

  const currentTeam = allPicks2026[activePickIndex]?.team;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {/* 1. LEFT SIDEBAR: DRAFT TICKER */}
      <aside className="w-80 bg-black border-r border-gray-800 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-gray-800 bg-gradient-to-b from-gray-900 to-black">
          <h1 className="text-xl font-black italic tracking-tighter uppercase text-green-500">Draft Command</h1>
          <div className="flex justify-between items-center mt-1">
            <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">2026 Simulation</p>
            <button onClick={() => {setSelections({}); setActivePickIndex(0);}} className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase underline">Reset</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {allPicks2026.map((pick, index) => (
            <div 
              key={index}
              onClick={() => setActivePickIndex(index)}
              className={`group relative p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all border ${
                activePickIndex === index ? 'bg-gray-900 border-green-500 ring-1 ring-green-500' : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <span className="text-[10px] font-mono text-gray-600 w-4 font-bold">{index + 1}</span>
              <img src={getTeamLogo(pick.team)} className="w-8 h-8 object-contain" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">{pick.team}</p>
                {selections[index] ? (
                  <p className="text-xs font-bold text-white truncate uppercase italic">{selections[index].name}</p>
                ) : (
                  <p className="text-[10px] font-bold text-gray-600 uppercase italic">On the clock</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 2. MAIN AREA: PROSPECT GRID */}
      <main className="flex-1 overflow-y-auto p-8 relative bg-black">
        {/* Neon Team Background Glow */}
        <div 
          className="absolute top-0 right-0 w-full h-[500px] opacity-20 pointer-events-none transition-colors duration-700"
          style={{ background: `radial-gradient(circle at top right, ${TEAM_COLORS[currentTeam] || '#22c55e'}, transparent)` }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter">The Board</h2>
             <div className="h-8 w-px bg-gray-800"></div>
             <div className="flex items-center gap-3">
                <img src={getTeamLogo(currentTeam)} className="w-10 h-10 object-contain" alt="" />
                <span className="text-2xl font-black text-green-500 uppercase italic tracking-widest">{currentTeam}</span>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
            {availableProspects.map((player) => (
              <div key={player.rank} className="bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all group relative overflow-hidden shadow-xl">
                <div className="absolute -top-4 -right-4 text-7xl font-black text-white/[0.03] group-hover:text-white/[0.07] transition-colors italic uppercase">
                  {player.rank}
                </div>
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <img src={player.img} className="w-14 h-14 rounded-lg bg-white p-1" alt="" />
                  <div>
                    <h3 className="text-xl font-black uppercase italic leading-none group-hover:text-green-400 transition-colors">{player.name}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{player.pos} • {player.team}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-800/50 my-4 relative z-10">
                  <div className="text-center border-r border-gray-800/50">
                    <p className="text-[10px] font-bold text-gray-500 uppercase italic">PPG</p>
                    <p className="text-xl font-black text-green-500 font-mono leading-none">{player.stats.ppg}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase italic">FG%</p>
                    <p className="text-xl font-black text-white font-mono leading-none">{player.stats.fg}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleSelect(player)}
                  className="w-full bg-white text-black font-black italic uppercase text-xs py-4 rounded-xl hover:bg-green-500 hover:text-white transition-all active:scale-95 shadow-lg relative z-10"
                >
                  Draft into {currentTeam}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
