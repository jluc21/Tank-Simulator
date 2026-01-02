"use client";
import { useState, useEffect } from 'react';

export default function TankathonReplica() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lotteryOrder, setLotteryOrder] = useState([]);
  const [isSimulated, setIsSimulated] = useState(false);

  // --- 1. FETCH DATA FROM ESPN ---
  useEffect(() => {
    async function fetchStandings() {
      try {
        const res = await fetch('https://site.api.espn.com/apis/v2/sports/basketball/nba/standings');
        const data = await res.json();
        
        let allTeams = [];

        // ESPN splits data by conference (East/West), so we loop through both
        data.children.forEach(conference => {
          conference.standings.entries.forEach(entry => {
            const team = entry.team;
            const stats = entry.stats;
            
            // Find wins/losses in the confusing ESPN stats array
            const wins = stats.find(s => s.name === 'wins')?.value || 0;
            const losses = stats.find(s => s.name === 'losses')?.value || 0;

            allTeams.push({
              name: team.displayName,
              shortName: team.abbreviation,
              logo: team.logos[0].href, // Real logo URL!
              wins: wins,
              losses: losses,
              winPct: wins / (wins + losses)
            });
          });
        });

        // Sort by WORST record first (Tankathon style)
        const sorted = allTeams.sort((a, b) => a.winPct - b.winPct);

        // Keep only the bottom 14 teams for the lottery
        const lotteryTeams = sorted.slice(0, 14);

        // Assign Lottery Odds
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

  // --- 2. LOTTERY ENGINE ---
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

    // Fill remaining picks
    pool.forEach((team, idx) => draftOrder.push({ ...team, pick: 5 + idx }));
    setLotteryOrder(draftOrder);
    setIsSimulated(true);
  };

  const reset = () => {
    setLotteryOrder(teams);
    setIsSimulated(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Live NBA Data...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER */}
        <header className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Tank Simulator
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Live 2025 Draft Order</p>
        </header>

        {/* CONTROLS */}
        <div className="flex gap-4 justify-center mb-10">
          <button 
            onClick={runSimulation}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 px-10 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transform hover:scale-105 transition-all text-xl"
          >
            {isSimulated ? "🔄 RESPIN" : "🎰 SIMULATE LOTTERY"}
          </button>
          {isSimulated && (
            <button onClick={reset} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full">
              Reset
            </button>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="grid grid-cols-12 bg-gray-950 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-1 text-center">Pick</div>
            <div className="col-span-7 pl-4">Team</div>
            <div className="col-span-4 text-right">Odds / Record</div>
          </div>

          {lotteryOrder.map((team, index) => {
             const diff = team.seed - (index + 1);
             const isWinner = isSimulated && index === 0;

             return (
              <div key={team.name} className={`grid grid-cols-12 p-4 border-b border-gray-700 items-center transition-colors ${isWinner ? "bg-emerald-900/30" : "hover:bg-gray-750"}`}>
                
                {/* PICK NUMBER */}
                <div className="col-span-1 flex justify-center">
                  <div className={`font-mono text-xl font-bold ${isWinner ? "text-emerald-400" : "text-gray-500"}`}>
                    {isSimulated ? index + 1 : team.seed}
                  </div>
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

                {/* ODDS / MOVEMENT */}
                <div className="col-span-4 text-right font-mono">
                  {isSimulated ? (
                     <span className={`font-bold text-lg ${diff > 0 ? "text-emerald-400" : diff < 0 ? "text-red-400" : "text-gray-600"}`}>
                       {diff > 0 && "▲"}{diff < 0 && "▼"}{Math.abs(diff) || "-"}
                     </span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-gray-300 font-bold">{team.wins}-{team.losses}</span>
                      <span className="text-xs text-gray-500">{team.chance}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center text-gray-600 text-xs mt-8 pb-8">
            Data provided by ESPN API • No affiliation with NBA
        </div>

      </div>
    </div>
  );
}