"use client";
import React, { useState, useRef } from 'react';

// Official NBA Lottery Odds (Weights per 1000 combinations)
const NBA_ODDS = [
  { p1: 140, p4: 521 }, { p1: 140, p4: 521 }, { p1: 140, p4: 521 },
  { p1: 125, p4: 481 }, { p1: 105, p4: 421 }, { p1: 90, p4: 372 },
  { p1: 75, p4: 319 }, { p1: 60, p4: 263 }, { p1: 45, p4: 203 },
  { p1: 30, p4: 139 }, { p1: 20, p4: 94 }, { p1: 15, p4: 71 },
  { p1: 10, p4: 48 }, { p1: 5, p4: 24 }
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
      {/* SIMULATION CONTROLS */}
      <div className="flex justify-center gap-4 mb-12">
        <button onClick={simLottery} disabled={isAnimating} className="bg-[#2f3e4e] text-white px-10 py-4 rounded font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 hover:bg-black">
          {isAnimating ? "Drawing..." : "Sim Lottery"}
        </button>
        <button onClick={() => setStandings(initialTeams)} className="bg-[#9ea3a8] text-white px-10 py-4 rounded font-black uppercase tracking-widest shadow-md hover:bg-[#2f3e4e] transition-colors">
          Reset
        </button>
      </div>

      <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl rounded-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-black uppercase text-[#9ea3a8] border-b border-gray-100 bg-gray-50/50">
              <th className="px-8 py-5">Pick</th>
              <th className="px-6 py-5">Team</th>
              <th className="px-6 py-5 text-center">Record</th>
              <th className="px-4 py-5 text-center">Top 4</th>
              <th className="px-8 py-5 text-right">#1 OVR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {standings.map((team, index) => {
              const baseIdx = initialTeams.findIndex(t => t.id === team.id);
              const diff = baseIdx - index;
              return (
                <React.Fragment key={team.id}>
                  <tr className="hover:bg-gray-50/80 transition-all group">
                    <td className="px-8 py-5 text-2xl font-black text-gray-200 tabular-nums flex items-center gap-2">
                      {index + 1}
                      {!isAnimating && diff !== 0 && (
                        <span className={`text-[10px] font-bold ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 flex items-center gap-5">
                      <img src={(isAnimating && index < 4) ? shuffling[index] : team.logo} alt="" className="w-10 h-10 object-contain drop-shadow-sm" />
                      <span className="font-black text-xl uppercase italic tracking-tighter">{team.name}</span>
                    </td>
                    <td className="px-6 py-5 text-center font-mono font-bold text-[#9ea3a8]">{team.record}</td>
                    <td className="px-4 py-5 text-center font-bold text-gray-300">
                      {baseIdx < 14 ? `${(NBA_ODDS[baseIdx].p4/10).toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-8 py-5 text-right font-black text-2xl tabular-nums">
                      {baseIdx < 14 ? `${(NBA_ODDS[baseIdx].p1/10).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                  {index === 13 && (
                    <tr className="bg-[#2f3e4e]">
                      <td colSpan="5" className="py-4 text-center">
                        <span className="text-[12px] font-bold text-white uppercase tracking-[0.5em]">End of Lottery</span>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
} 
