"use client";
import React, { useState, useRef } from 'react';

// Official NBA Weighted Odds (14.0% = 140/1000)
const NBA_ODDS = [
  { p1: 140, p4: 521 }, { p1: 140, p4: 521 }, { p1: 140, p4: 521 },
  { p1: 125, p4: 481 }, { p1: 105, p4: 421 }, { p1: 90, p4: 372 },
  { p1: 75, p4: 319 }, { p1: 60, p4: 263 }, { p1: 45, p4: 203 },
  { p1: 30, p4: 139 }, { p1: 20, p4: 94 }, { p1: 15, p4: 71 },
  { p1: 10, p4: 48 }, { p1: 5, p4: 24 }
];

export default function SimulatorClient({ initialTeams }) {
  const [standings, setStandings] = useState(initialTeams);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shuffleLogos, setShuffleLogos] = useState([null, null, null, null]);
  const intervalRef = useRef(null);

  const weightedDraw = (pool) => {
    const totalWeight = pool.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;
    for (const team of pool) {
      if (random < team.weight) return team;
      random -= team.weight;
    }
    return pool[0];
  };

  const runLottery = () => {
    setIsAnimating(true);
    let lotteryPool = initialTeams.slice(0, 14).map((t, i) => ({ ...t, weight: NBA_ODDS[i].p1, origRank: i }));
    
    // NBA Drawing: 4 separate winners for top 4 picks
    const winners = [];
    for (let i = 0; i < 4; i++) {
      const remaining = lotteryPool.filter(p => !winners.find(w => w.id === p.id));
      winners.push(weightedDraw(remaining));
    }

    const others = lotteryPool.filter(p => !winners.find(w => w.id === p.id)).sort((a, b) => a.origRank - b.origRank);
    const result = [...winners, ...others, ...initialTeams.slice(14)];

    // Tankathon Logo Shuffle Animation
    let count = 0;
    intervalRef.current = setInterval(() => {
      setShuffleLogos(Array(4).fill(0).map(() => initialTeams[Math.floor(Math.random() * 14)].logo));
      if (++count > 15) {
        clearInterval(intervalRef.current);
        setStandings(result);
        setIsAnimating(false);
      }
    }, 80);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-center gap-4 mb-12">
        <button onClick={runLottery} disabled={isAnimating} className="bg-[#2f3e4e] text-white px-12 py-4 rounded font-black uppercase tracking-widest shadow-xl transition-all hover:bg-black active:scale-95 disabled:opacity-50">
          {isAnimating ? "Drawing..." : "Sim Lottery"}
        </button>
        <button onClick={() => setStandings(initialTeams)} className="bg-[#9ea3a8] text-white px-12 py-4 rounded font-black uppercase tracking-widest shadow-md">Reset</button>
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
            {standings.map((team, i) => {
              const baseIdx = initialTeams.findIndex(t => t.id === team.id);
              const change = baseIdx - i;
              return (
                <React.Fragment key={team.id}>
                  <tr className="hover:bg-gray-50/80 transition-all group">
                    <td className="px-8 py-5 text-2xl font-black text-gray-200 flex items-center gap-2">
                      {i + 1} {change !== 0 && <span className={`text-[10px] ${change > 0 ? 'text-green-600' : 'text-red-500'}`}>{change > 0 ? `+${change}` : change}</span>}
                    </td>
                    <td className="px-6 py-5 flex items-center gap-5">
                      <img src={(isAnimating && i < 4) ? shuffleLogos[i] : team.logo} className="w-10 h-10 object-contain drop-shadow-sm" alt="" />
                      <span className="font-black text-xl uppercase italic tracking-tighter">{team.name}</span>
                    </td>
                    <td className="px-6 py-5 text-center font-mono font-bold text-[#9ea3a8]">{team.record}</td>
                    <td className="px-4 py-5 text-center font-bold text-gray-300">{baseIdx < 14 ? `${(NBA_ODDS[baseIdx].p4 / 10).toFixed(1)}%` : '—'}</td>
                    <td className="px-8 py-5 text-right font-black text-2xl tabular-nums">{baseIdx < 14 ? `${(NBA_ODDS[baseIdx].p1 / 10).toFixed(1)}%` : '—'}</td>
                  </tr>
                  {i === 13 && (
                    <tr className="bg-[#2f3e4e]"><td colSpan="5" className="py-4 text-center text-white text-[12px] font-bold uppercase tracking-[0.5em]">End of Lottery</td></tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
