"use client";
import React, { useState, useRef } from 'react';

// Official 2026 NBA Lottery Odds
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
    let lotto = initialTeams.slice(0, 14).map((t, i) => ({ ...t, weight: NBA_ODDS[i].p1, orig: i }));
    const winners = [];
    for (let i = 0; i < 4; i++) {
      const remaining = lotto.filter(p => !winners.find(w => w.id === p.id));
      winners.push(weightedDraw(remaining));
    }
    const survivors = lotto.filter(p => !winners.find(w => w.id === p.id)).sort((a,b) => a.orig - b.orig);
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
      <div className="flex justify-center gap-4 mb-10">
        <button onClick={simLottery} disabled={isAnimating} className="bg-[#2f3e4e] text-white px-10 py-3 rounded font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 hover:bg-black">
          {isAnimating ? "Drawing..." : "Sim Lottery"}
        </button>
        <button onClick={() => setStandings(initialTeams)} className="bg-[#9ea3a8] text-white px-10 py-3 rounded font-black uppercase tracking-widest shadow-md">Reset</button>
      </div>

      <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl rounded-sm overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="text-[10px] font-black uppercase text-[#9ea3a8] border-b border-gray-100 bg-gray-50/50">
              <th className="w-14 md:w-16 px-4 py-3">Pick</th>
              <th className="w-48 md:w-64 px-4 py-3">Team</th>
              <th className="w-20 md:w-24 px-2 py-3 text-center">Record</th>
              <th className="w-20 md:w-24 px-4 py-3 text-right">Top 4</th>
              <th className="w-24 md:w-28 px-4 py-3 text-right">#1 OVR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {standings.map((team, index) => {
              const originalIdx = initialTeams.findIndex(t => t.id === team.id);
              const diff = originalIdx - index;
              return (
                <React.Fragment key={team.id}>
                  <tr className="hover:bg-gray-50/80 transition-all group">
                    {/* PICK: Darkened to brand gray for readability */}
                    <td className="px-4 py-3 text-2xl font-black text-[#9ea3a8] tabular-nums relative">
                      {index + 1}
                      {!isAnimating && diff !== 0 && (
                        <span className={`absolute top-1 right-1 text-[8px] font-bold ${diff > 0 ? 'text-green-500' : 'text-red-400'}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img src={(isAnimating && index < 4) ? shuffling[index] : team.logo} alt="" className="w-7 h-7 object-contain" />
                      <span className="font-black text-sm md:text-base uppercase italic tracking-tighter text-[#2f3e4e]">
                        {team.name}
                      </span>
                    </td>
                    {/* RECORD: Matched to numeric column weight/size */}
                    <td className="px-2 py-3 text-center font-mono font-black text-[#2f3e4e] text-sm md:text-base">
                      {team.record}
                    </td>
                    {/* TOP 4: Darkened for contrast */}
                    <td className="px-4 py-3 text-right font-medium text-[#2f3e4e] text-sm md:text-base">
                      {originalIdx < 14 ? `${NBA_ODDS[originalIdx].p4.toFixed(1)}%` : '—'}
                    </td>
                    {/* #1 OVR: Bold Primary Dark */}
                    <td className="px-4 py-3 text-right font-black text-lg md:text-xl text-[#2f3e4e]">
                      {originalIdx < 14 ? `${NBA_ODDS[originalIdx].p1.toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                  {index === 13 && (
                    <tr className="bg-[#2f3e4e]">
                      <td colSpan="5" className="py-3 text-center">
                        <span className="text-[11px] font-bold text-white uppercase tracking-[0.6em]">End of Lottery</span>
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
