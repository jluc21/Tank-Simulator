"use client";
import React, { useState, useEffect, useRef } from 'react';

// Official NBA Weighted Odds (per 1000 combinations)
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

  const drawPick = (pool) => {
    const totalWeight = pool.reduce((sum, team) => sum + team.weight, 0);
    let random = Math.random() * totalWeight;
    for (const team of pool) {
      if (random < team.weight) return team;
      random -= team.weight;
    }
    return pool[0];
  };

  const runLottery = () => {
    setIsAnimating(true);
    
    // 1. Prepare Lottery Pool (Top 14)
    let lotteryPool = initialTeams.slice(0, 14).map((t, i) => ({
      ...t, 
      weight: NBA_ODDS[i].p1,
      originalRank: i
    }));

    // 2. Run Weighted Draw for Picks 1-4
    const winners = [];
    for (let i = 0; i < 4; i++) {
      const remainingPool = lotteryPool.filter(p => !winners.find(w => w.id === p.id));
      const winner = drawPick(remainingPool);
      winners.push(winner);
    }

    // 3. Remaining Lottery teams fill 5-14 by record
    const remainingLottery = lotteryPool
      .filter(p => !winners.find(w => w.id === p.id))
      .sort((a, b) => a.originalRank - b.originalRank);

    const finalResult = [...winners, ...remainingLottery, ...initialTeams.slice(14)];

    // 4. Tankathon Shuffle Animation
    let iterations = 0;
    intervalRef.current = setInterval(() => {
      setShuffleLogos(Array(4).fill(0).map(() => initialTeams[Math.floor(Math.random() * 14)].logo));
      iterations++;
      
      if (iterations > 15) {
        clearInterval(intervalRef.current);
        setStandings(finalResult);
        setIsAnimating(false);
      }
    }, 80);
  };

  return (
    <>
      <div className="flex justify-center gap-4 mb-12">
        <button 
          onClick={runLottery} 
          disabled={isAnimating}
          className="bg-[#2f3e4e] text-white px-12 py-4 rounded font-black uppercase tracking-widest shadow-xl transition-all hover:bg-black active:scale-95 disabled:opacity-50"
        >
          {isAnimating ? "Drawing..." : "Sim Lottery"}
        </button>
        <button 
          onClick={() => setStandings(initialTeams)} 
          className="bg-[#9ea3a8] text-white px-12 py-4 rounded font-black uppercase tracking-widest shadow-md hover:bg-[#2f3e4e] transition-all"
        >
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
              const baseRank = initialTeams.findIndex(t => t.id === team.id);
              const change = baseRank - index;

              return (
                <React.Fragment key={team.id}>
                  <tr className="hover:bg-gray-50/80 transition-all group">
                    <td className="px-8 py-5 text-2xl font-black text-gray-200 tabular-nums flex items-center gap-2">
                      {index + 1}
                      {change !== 0 && (
                        <span className={`text-[10px] ${change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {change > 0 ? `+${change}` : change}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 flex items-center gap-5">
                      <img 
                        src={(isAnimating && index < 4) ? shuffleLogos[index] : team.logo} 
                        alt="" className="w-10 h-10 object-contain drop-shadow-sm" 
                      />
                      <span className="font-black text-xl uppercase italic tracking-tighter">{team.name}</span>
                    </td>
                    <td className="px-6 py-5 text-center font-mono font-bold text-[#9ea3a8]">{team.record}</td>
                    <td className="px-4 py-5 text-center font-bold text-gray-300">
                      {baseRank < 14 ? `${(NBA_ODDS[baseRank].p4 / 10).toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-8 py-5 text-right font-black text-2xl tabular-nums">
                      {baseRank < 14 ? `${(NBA_ODDS[baseRank].p1 / 10).toFixed(1)}%` : '—'}
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
