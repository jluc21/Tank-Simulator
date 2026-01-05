"use client";
import React, { useState, useEffect, useRef } from 'react';

// NBA Weighted Odds Table
const LOTTO_ODDS = [
  { p1: 140, p4: 521 }, { p1: 140, p4: 521 }, { p1: 140, p4: 521 },
  { p1: 125, p4: 481 }, { p1: 105, p4: 421 }, { p1: 90, p4: 372 },
  { p1: 75, p4: 319 }, { p1: 60, p4: 263 }, { p1: 45, p4: 203 },
  { p1: 30, p4: 139 }, { p1: 20, p4: 94 }, { p1: 15, p4: 71 },
  { p1: 10, p4: 48 }, { p1: 5, p4: 24 }
];

export default function SimulatorClient({ baselineTeams }) {
  const [standings, setStandings] = useState(baselineTeams);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shufflingLogos, setShufflingLogos] = useState([null, null, null, null]);
  const timerRef = useRef(null);

  const weightedDraw = (pool) => {
    const totalWeight = pool.reduce((acc, team) => acc + team.weight, 0);
    let random = Math.random() * totalWeight;
    for (let team of pool) {
      if (random < team.weight) return team;
      random -= team.weight;
    }
    return pool[0];
  };

  const runSimulation = () => {
    setIsAnimating(true);
    const lotteryTeams = baselineTeams.slice(0, 14).map((t, i) => ({ ...t, weight: LOTTO_ODDS[i].p1, originalPos: i }));
    const winners = [];

    // NBA Draft Rules: 4 separate drawings for picks 1-4
    for (let i = 0; i < 4; i++) {
      const remaining = lotteryTeams.filter(t => !winners.find(w => w.id === t.id));
      const winner = weightedDraw(remaining);
      winners.push(winner);
    }

    // Picks 5-14 filled by remaining lottery teams in original order
    const remainingLottery = lotteryTeams
      .filter(t => !winners.find(w => w.id === t.id))
      .sort((a, b) => a.originalPos - b.originalPos);

    const finalOrder = [...winners, ...remainingLottery, ...baselineTeams.slice(14)];

    // Tankathon Shuffle Animation
    let count = 0;
    timerRef.current = setInterval(() => {
      setShufflingLogos(Array(4).fill(0).map(() => lotteryTeams[Math.floor(Math.random() * 14)].logo));
      count++;
      if (count > 15) {
        clearInterval(timerRef.current);
        setStandings(finalOrder);
        setIsAnimating(false);
      }
    }, 100);
  };

  const reset = () => {
    clearInterval(timerRef.current);
    setStandings(baselineTeams);
    setIsAnimating(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-center gap-4 mb-12">
        <button 
          onClick={runSimulation} 
          disabled={isAnimating}
          className="bg-[#2f3e4e] text-white px-10 py-4 rounded font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
        >
          {isAnimating ? "Drawing..." : "Sim Lottery"}
        </button>
        <button onClick={reset} className="bg-[#9ea3a8] text-white px-10 py-4 rounded font-black uppercase tracking-widest shadow-md">
          Reset
        </button>
      </div>

      <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl rounded-sm overflow-hidden">
        <table className="w-full text-left text-sm">
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
              const isLottery = i < 14 || baselineTeams.slice(0, 14).some(t => t.id === team.id);
              const originalIdx = baselineTeams.findIndex(t => t.id === team.id);
              const move = originalIdx - i;

              return (
                <React.Fragment key={team.id}>
                  <tr className="hover:bg-gray-50 transition-all">
                    <td className="px-8 py-5 text-2xl font-black text-gray-200 flex items-center gap-2">
                      {i + 1}
                      {move !== 0 && (
                        <span className={`text-[10px] ${move > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {move > 0 ? `+${move}` : move}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 flex items-center gap-5">
                      <img 
                        src={(isAnimating && i < 4) ? shufflingLogos[i] : team.logo} 
                        className="w-10 h-10 object-contain" alt="" 
                      />
                      <span className="font-black text-lg uppercase italic">{team.name}</span>
                    </td>
                    <td className="px-6 py-5 text-center font-mono text-[#9ea3a8]">{team.record}</td>
                    <td className="px-4 py-5 text-center font-bold text-[#9ea3a8]">
                      {originalIdx < 14 ? `${(LOTTO_ODDS[originalIdx].p4 / 10).toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-8 py-5 text-right font-black text-xl">
                      {originalIdx < 14 ? `${(LOTTO_ODDS[originalIdx].p1 / 10).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                  {i === 13 && (
                    <tr className="bg-[#2f3e4e]"><td colSpan="5" className="py-3 text-center text-white text-[11px] font-black uppercase tracking-[0.5em]">End of Lottery</td></tr>
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
