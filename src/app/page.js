"use client";
import React, { useState, useMemo } from 'react';
// These paths point to the data files in your picks and big-board folders
import { draftPicks } from '../picks/data'; 
import { prospects } from '../big-board/data';

// Helper to get official NBA logos from a static CDN
const getTeamLogo = (team) => `https://www.nba.com/.element/img/1.0/teams/logos/${team}.svg`;

// Mapping for team-specific neon accent colors
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

  // Flatten the picks data for the year 2026 and sort by round
  const allPicks2026 = useMemo(() => {
    if (!draftPicks) return [];
    return Object.entries(draftPicks).flatMap(([team, picks]) => 
      picks.filter(p => p.year === 2026).map(p => ({ ...p, team }))
    ).sort((a, b) => a.round - b.round);
  }, []);

  // Filter out players that have already been drafted
  const draftedPlayerIds = Object.values(selections).map(p => p.rank);
  const availableProspects = prospects.filter(p => !draftedPlayerIds.includes(p.rank));

  const handleSelect = (player) => {
    setSelections(prev => ({ ...prev, [activePickIndex]: player }));
    // Automatically advance to the next pick in the ticker
    if (activePickIndex < allPicks2026.length - 1) {
      setActivePickIndex(activePickIndex + 1);
    }
  };

  const currentTeam = allPicks2026[activePickIndex]?.team;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* 1. VERTICAL DRAFT TICKER (LEFT) */}
      <aside className="w-72 bg-black border-r border-gray-800 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-800 bg-gradient-to-b from-gray-900 to-black">
          <h1 className="text-xl font-black italic tracking-tighter uppercase text-green-500">Draft Command</h1>
          <div className="flex justify-between items-center mt-1">
            <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">2026 Simulation</p>
            <button 
              onClick={() => {setSelections({}); setActivePickIndex(0);}}
              className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase underline"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {allPicks2026.map((pick, index) => {
            const isSelected = !!selections[index];
            const isActive = activePickIndex === index;
            return (
              <div 
                key={index}
                onClick={() => setActivePickIndex(index)}
                className={`group relative p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-200 border ${
                  isActive ? 'bg-gray-900 border-green-500 ring-1 ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
              >
                <span className="text-[10px] font-mono text-gray-600 w-4 font-bold">{index + 1}</span>
                <img src={getTeamLogo(pick.team)} className="w-8 h-8 object-contain" alt={pick.team} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">{pick.team}</p>
                  {isSelected ? (
                    <p className="text-xs font-bold text-white truncate uppercase italic">{selections[index].name}</p>
                  ) : (
                    <p className="text-[10px] font-bold text-gray-600 uppercase italic">On the clock...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* 2. PROSPECT BOARD (RIGHT) */}
      <main className="flex-1 overflow-y-auto p-8 relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-900/20 via-black to-black">
        {/* Background Neon Accent */}
        <div 
          className="absolute top-0 right-0 w-full h-96 opacity-10 pointer-events-none transition-colors duration-500"
          style={{ background: `radial-gradient(circle at top right, ${TEAM_COLORS[currentTeam] || '#22c55e'}, transparent)` }}
        />

        <div className="flex justify-between items-end mb-8 relative z-10">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">The War Room</h2>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-1">
              Selecting for: <span className="text-green-500 px-2 py-0.5 bg-green-500/10 rounded ml-1">{currentTeam}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 relative z-10">
          {availableProspects.map((player) => (
            <div 
              key={player.rank}
              className="bg-[#111] border border-gray-800 rounded-xl p-5 hover:border-green-500/50 transition-all group relative overflow-hidden"
            >
              {/* Rank Watermark */}
              <div className="absolute -top-2 -right-2 text-6xl font-black text-white/[0.03] group-hover:text-white/[0.07] transition-colors italic">
                {player.rank}
              </div>

              <div className="flex items-start gap-4 mb-4">
                <img src={player.img} className="w-12 h-12 rounded bg-white p-1 shadow-md" alt={player.school} />
                <div>
                  <h3 className="text-xl font-black uppercase italic leading-none mb-1 group-hover:text-green-400 transition-colors">{player.name}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{player.pos} • {player.team}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 border-y border-gray-800 py-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase italic text-center">PPG</p>
                  <p className="text-lg font-black text-green-500 font-mono leading-none text-center">{player.stats.ppg}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase italic text-center">FG%</p>
                  <p className="text-lg font-black text-white font-mono leading-none text-center">{player.stats.fg}</p>
                </div>
              </div>

              <button 
                onClick={() => handleSelect(player)}
                className="w-full bg-white text-black font-black italic uppercase text-xs py-3 rounded-lg hover:bg-green-500 hover:text-white transition-all active:scale-[0.98] shadow-lg"
              >
                Draft into {currentTeam}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
