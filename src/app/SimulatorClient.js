"use client";
import React, { useState, useRef } from 'react';

const NBA_ODDS = [
  { p1: 14.0, p4: 52.1 }, { p1: 14.0, p4: 52.1 }, { p1: 14.0, p4: 52.1 },
  { p1: 12.5, p4: 48.1 }, { p1: 10.5, p4: 42.1 }, { p1: 9.0, p4: 37.2 },
  { p1: 7.5, p4: 31.9 }, { p1: 6.0, p4: 26.3 }, { p1: 4.5, p4: 20.3 },
  { p1: 3.0, p4: 13.9 }, { p1: 2.0, p4: 9.4 }, { p1: 1.5, p4: 7.1 },
  { p1: 1.0, p4: 4.8 }, { p1: 0.5, p4: 2.4 }
];

export default function SimulatorClient({ initialTeams }) {
  const [standings, setStandings] = useState(initialTeams || []);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shuffling, setShuffling] = useState([null, null, null, null]);
  const timer = useRef(null);

  const weightedDraw = (pool) => {
    const total = pool.reduce((s, t) => s + t.weight, 0);
    let r = Math.random() * total;
    for (const t of pool) { if (r < t.weight) return t; r -= t.weight; }
    return pool[0];
  };

  const simLottery = () => {
    setIsAnimating(true);
    let lotto = initialTeams.slice(0, 14).map((t, i) => ({ ...t, weight: NBA_ODDS[i].p1, origIdx: i }));
    const winners = [];
    for (let i = 0; i < 4; i++) {
      const remaining = lotto.filter(p => !winners.find(w => w.id === p.id));
      winners.push(weightedDraw(remaining));
    }
    const survivors = lotto.filter(p => !winners.find(w => w.id === p.id)).sort((a,b) => a.origIdx - b.origIdx);
    const result = [...winners, ...survivors, ...initialTeams.slice(14)];

    let count = 0;
    timer.current = setInterval(() => {
      setShuffling(Array(4).fill(0).map(() => initialTeams[Math.floor(Math.random()*14)].logo));
      if (++count > 16) {
        clearInterval(timer.current);
        setStandings(result);
        setIsAnimating(false);
      }
    }, 85);
  };

  return (
    <>
      <div className="flex justify-center gap-4 mb-10 px-4">
        <button onClick={simLottery} disabled={isAnimating} className="bg-[#2f3e4e] text-white px-8 md:px-12 py-3 rounded font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 hover:bg-black">
          {isAnimating ? "Drawing..." : "Sim Lottery"}
        </button>
        <button onClick={() => setStandings(initialTeams)} className="bg-[#9ea3a8] text-white px-8 md:px-12 py-3 rounded font-black uppercase tracking-widest shadow-md hover:bg-[#2f3e4e] transition-colors">Reset</button>
      </div>

      <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl rounded-sm overflow-hidden mx-auto max-w-5xl">
        {/* RESPONSIVE GRID HEADER: True columns for mobile and desktop */}
        <div className="grid grid-cols-[2.8rem_1fr_3.5rem_4rem_4.5rem] md:grid-cols-[4rem_1fr_6rem_6.5rem_7rem] text-[9px] md:text-[11px] font-black uppercase text-[#9ea3a8] border-b border-gray-100 bg-gray-50/50 px-2 md:px-6 py-3">
          <div>Pick</div>
          <div>Team</div>
          <div className="text-center">Rec</div>
          <div className="text-right">Top 4</div>
          <div className="text-right">#1 OVR</div>
        </div>

        <div className="divide-y divide-gray-50">
          {standings.map((team, index) => {
            const originalIdx = initialTeams.findIndex(t => t.id === team.id);
            const diff = originalIdx - index;
            // Abridged name for mobile (e.g., Indiana Pacers -> IND)
            const mobileName = team.abbreviation || team.name.substring(0, 3).toUpperCase();

            return (
              <React.Fragment key={team.id}>
                <div className="grid grid-cols-[2.8rem_1fr_3.5rem_4rem_4.5rem] md:grid-cols-[4rem_1fr_6rem_6.5rem_7rem] items-center hover:bg-gray-50 transition-all group px-2 md:px-6 py-3 md:py-4">
                  
                  {/* PICK NUMBER */}
                  <div className="text-xl md:text-3xl font-black text-[#9ea3a8] tabular-nums relative">
                    {index + 1}
                    {!isAnimating && diff !== 0 && (
                      <span className={`absolute -top-1 right-0 md:top-1 md:right-1 text-[8px] font-bold ${diff > 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    )}
                  </div>

                  {/* TEAM (Abbreviated on mobile) */}
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img src={(isAnimating && index < 4) ? shuffling[index] : team.logo} alt="" className="w-5 h-5 md:w-8 md:h-8 object-contain shrink-0" />
                    <span className="font-black text-xs md:text-lg uppercase italic tracking-tighter text-[#2f3e4e] truncate">
                      <span className="md:hidden">{mobileName}</span>
                      <span className="hidden md:inline">{team.name}</span>
                    </span>
                  </div>

                  {/* RECORD (Unified font size) */}
                  <div className="text-center font-mono font-black text-[#2f3e4e] text-[11px] md:text-base whitespace-nowrap">
                    {team.record}
                  </div>

                  {/* TOP 4 ODDS (Unified font size) */}
                  <div className="text-right font-black text-[#2f3e4e] text-[11px] md:text-base tabular-nums">
                    {originalIdx < 14 ? `${NBA_ODDS[originalIdx].p4.toFixed(1)}%` : '—'}
                  </div>

                  {/* #1 OVR ODDS (Unified font size) */}
                  <div className="text-right font-black text-[#2f3e4e] text-xs md:text-xl tabular-nums">
                    {originalIdx < 14 ? `${NBA_ODDS[originalIdx].p1.toFixed(1)}%` : '—'}
                  </div>
                </div>

                {/* BOUNDARY DIVIDER */}
                {index === 13 && (
                  <div className="bg-[#2f3e4e] py-3 text-center">
                    <span className="text-[10px] md:text-[11px] font-bold text-white uppercase tracking-[0.6em]">End of Lottery</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
} 
