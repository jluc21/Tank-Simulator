"use client";
import { useState, useEffect } from 'react';

export default function LottoOddsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lotteryOrder, setLotteryOrder] = useState([]);
  const [isSimulated, setIsSimulated] = useState(false);

  // --- FETCH ESPN DATA ---
  useEffect(() => {
    async function fetchStandings() {
      try {
        const res = await fetch('https://site.api.espn.com/apis/v2/sports/basketball/nba/standings');
        const data = await res.json();
        let allTeams = [];

        data.children.forEach(conference => {
          conference.standings.entries.forEach(entry => {
            const team = entry.team;
            const stats = entry.stats;
            const wins = stats.find(s => s.name === 'wins')?.value || 0;
            const losses = stats.find(s => s.name === 'losses')?.value || 0;

            allTeams.push({
              name: team.displayName,
              shortName: team.abbreviation,
              logo: team.logos[0].href,
              wins: wins,
              losses: losses,
              winPct: wins / (wins + losses)
            });
          });
        });

        const sorted = allTeams.sort((a, b) => a.winPct - b.winPct);
        const lotteryTeams = sorted.slice(0, 14);
        
        // Assign Odds
        const weights = [140, 140, 140, 125, 105, 90, 75, 60, 45, 30, 20, 15, 10, 5];
        const teamsWithOdds = lotteryTeams.map((team, index) => ({
          ...team,
          seed: index + 1,
          combinations: weights[index] || 0,
          chance: ((weights[index] || 0) / 10).toFixed(1) + "%"
        }));

        setTeams(teamsWithOdds);
        setLotteryOrder(teamsWithOdds);
        setLoading(false);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
    fetchStandings();
  }, []);

  // --- TEAM-ONLY SIMULATION ---
  const runSimulation = () => {
    let pool = [...teams];
    let draftOrder = [];
    
    // Draw top 4 picks
    for (let pick = 1; pick <= 4; pick++) {
      const totalCombs = pool.reduce((sum, t) => sum + t.combinations, 0);
      let randomNum = Math.floor(Math.random() * totalCombs);
      let currentSum = 0;
      
      for (let i = 0; i < pool.length; i++) {
        currentSum += pool[i].combinations;
        if (randomNum < currentSum) {
          draftOrder.push({ ...pool[i], pick });
          pool.splice(i, 1);
          break;
        }
      }
    }

    pool.forEach((team, idx) => draftOrder.push({ ...team, pick: 5 + idx }));
    setLotteryOrder(draftOrder);
    setIsSimulated(true);
  };

  const reset = () => {
    setLotteryOrder(teams);
    setIsSimulated(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-bold">Loading Live Data...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans pb-20">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER */}
        <header className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Lotto Odds
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Daily Lottery Simulation</p>
        </header>

        {/* CONTROLS */}
        <div className="flex gap-4 justify-center mb-10">
          <button 
            onClick={runSimulation}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 px-10 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transform hover:scale-105 transition-all uppercase tracking-widest text-lg"
          >
            {isSimulated ? "Respin" : "Simulate Lottery"}
          </button>
          {isSimulated && (
            <button onClick={reset} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full uppercase tracking-wide">
              Reset
            </button>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="grid grid-cols-12 bg-gray-950 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-2 text-center">Pick</div>
            <div className="col-span-7 pl-4">Team</div>
            <div className="col-span-3 text-right">Odds/Rec</div>
          </div>

          {lotteryOrder.map((team, index) => {
             const diff = team.seed - (index + 1);
             const isWinner = isSimulated && index === 0;
             const isTop4 = isSimulated && index < 4;

             return (
              <div key={team.name} className={`grid grid-cols-12 p-4 border-b border-gray-700 items-center transition-colors ${isWinner ? "bg-emerald-900/30" : "hover:bg-gray-750"}`}>
                
                {/* PICK NUMBER + ARROW */}
                <div className="col-span-2 flex flex-col items-center justify-center">
                  <div className={`font-mono text-xl font-bold ${isWinner ? "text-emerald-400" : isTop4 ? "text-white" : "text-gray-500"}`}>
                    {isSimulated ? index + 1 : team.seed}
                  </div>
                  {isSimulated && diff !== 0 && (
                    <div className={`text-[10px] font-bold ${diff > 0 ? "text-emerald-400" : "text-red-400"}`}>
                       {diff > 0 ? "▲" : "▼"} {Math.abs(diff)}
                    </div>
                  )}
                </div>

                {/* TEAM LOGO + NAME */}
                <div className="col-span-7 flex items-center gap-4 pl-4">
                  <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain drop-shadow-md" />
                  <div className="flex flex-col">
                    <span className={`font-bold text-lg leading-tight ${isWinner ? "text-emerald-300" : "text-white"}`}>
                      {team.name}
                    </span>
                    {isWinner && <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">Lottery Winner</span>}
                  </div>
                </div>

                {/* ODDS / RECORD */}
                <div className="col-span-3 text-right font-mono">
                  <div className="flex flex-col">
                    <span className="text-gray-300 font-bold">{team.wins}-{team.losses}</span>
                    <span className="text-xs text-gray-500">{team.chance}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
