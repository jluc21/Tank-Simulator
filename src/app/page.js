"use client";
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { draftPicks } from './picks/data';
import { prospects } from './big-board/data';

export default function LandingPage() {
  const [selections, setSelections] = useState({});
  const [activePickIndex, setActivePickIndex] = useState(0);

  const allPicks2026 = useMemo(() => {
    if (!draftPicks) return [];
    return Object.entries(draftPicks).flatMap(([team, picks]) => 
      picks.filter(p => p.year === 2026).map(p => ({ ...p, team }))
    ).sort((a, b) => a.round - b.round);
  }, []);

  const currentTeam = allPicks2026[activePickIndex]?.team;

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans">
      {/* 1. DARK MENU BAR */}
      <nav className="bg-[#2f3e4e] text-white px-8 py-4 flex justify-between items-center shadow-lg">
        <div className="text-xl font-black tracking-tighter uppercase italic">
          Rebuild <span className="text-[#9ea3a8]">Watch</span>
        </div>
        <div className="flex gap-8 text-xs font-bold tracking-widest uppercase">
          <a href="#" className="hover:text-[#d1d1d1] transition">Lotto Odds</a>
          <a href="#" className="hover:text-[#d1d1d1] transition">Big Board</a>
          <a href="#" className="hover:text-[#d1d1d1] transition">Team Assets</a>
          <a href="#" className="text-[#d1d1d1] transition underline decoration-2 underline-offset-4">Mock Draft</a>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* 2. WHITE SIDEBAR */}
        <aside className="w-[400px] bg-white border-r border-[#d1d1d1] p-8 flex flex-col justify-between">
          <div>
            <div className="mb-12">
              <h1 className="text-5xl font-black text-[#2f3e4e] leading-none uppercase">
                2026 NBA<br />
                <span className="text-[#9ea3a8]">Lottos</span>
              </h1>
              <p className="text-[#9ea3a8] font-bold uppercase tracking-widest mt-4">Daily Lottery Simulation</p>
            </div>

            <button className="w-full bg-[#2f3e4e] text-white py-5 rounded-xl font-black italic uppercase tracking-widest hover:bg-[#1a252f] transition-all transform active:scale-95 shadow-xl">
              Simulate Lottery
            </button>
          </div>

          <div className="border-t border-[#d1d1d1] pt-8">
            <h3 className="text-[#2f3e4e] font-black uppercase text-sm mb-4">Draft Order Control</h3>
            <div className="bg-[#f5f5f5] p-4 rounded-lg border border-[#d1d1d1] flex justify-between items-center">
              <span className="text-xs font-bold text-[#9ea3a8] uppercase">Current Pick: {activePickIndex + 1}</span>
              <button onClick={() => setActivePickIndex(0)} className="text-[10px] font-black text-red-500 uppercase">Reset</button>
            </div>
          </div>
        </aside>

        {/* 3. MAIN CONTENT AREA */}
        <main className="flex-1 p-12 overflow-y-auto bg-white m-6 rounded-3xl shadow-sm border border-[#d1d1d1]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-[#2f3e4e] uppercase italic tracking-tighter">Big Board</h2>
              {/* FIXED SYNTAX ERROR BELOW */}
              <p className="text-[#9ea3a8] text-sm font-bold tracking-widest mt-2 uppercase">
                Loading Live Stats...
              </p>
            </div>

            <div className="space-y-4">
              {prospects.slice(0, 10).map((player) => (
                <div key={player.rank} className="group flex items-center bg-[#f5f5f5] p-5 rounded-2xl border border-transparent hover:border-[#2f3e4e] transition-all">
                  <span className="text-3xl font-black text-[#d1d1d1] group-hover:text-[#2f3e4e] transition-colors w-12">{player.rank}</span>
                  <div className="w-16 h-16 relative mx-4">
                    <img src={player.img} alt={player.name} className="object-contain" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-black text-[#2f3e4e] uppercase italic leading-none">{player.name}</h4>
                    <p className="text-xs font-bold text-[#9ea3a8] uppercase mt-1">{player.pos} — {player.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#2f3e4e] leading-none">{player.stats.ppg}</p>
                    <p className="text-[10px] font-bold text-[#9ea3a8] uppercase tracking-widest">Points Per Game</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
