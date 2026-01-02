"use client";
import { useState, useEffect } from 'react';

// --- THE 2026 MOCK DRAFT CLASS (Top 14 Lottery) ---
const PROSPECTS = [
  { rank: 1, name: "AJ Dybantsa", pos: "SF", school: "BYU", ht: "6'9\"", wt: "210 lbs", stats: "26.5 PTS" },
  { rank: 2, name: "Cameron Boozer", pos: "PF", school: "Duke", ht: "6'9\"", wt: "250 lbs", stats: "27.0 PTS" },
  { rank: 3, name: "Darryn Peterson", pos: "SG", school: "Kansas", ht: "6'6\"", wt: "205 lbs", stats: "26.4 PTS" },
  { rank: 4, name: "Caleb Wilson", pos: "PF", school: "UNC", ht: "6'10\"", wt: "215 lbs", stats: "23.7 PTS" },
  { rank: 5, name: "Nate Ament", pos: "SF", school: "Tennessee", ht: "6'10\"", wt: "207 lbs", stats: "20.6 PTS" },
  { rank: 6, name: "Kingston Flemings", pos: "PG", school: "Houston", ht: "6'4\"", wt: "190 lbs", stats: "18.2 PTS" },
  { rank: 7, name: "Mikel Brown Jr.", pos: "PG", school: "Louisville", ht: "6'5\"", wt: "190 lbs", stats: "22.0 PTS" },
  { rank: 8, name: "Koa Peat", pos: "PF", school: "Arizona", ht: "6'8\"", wt: "235 lbs", stats: "19.1 PTS" },
  { rank: 9, name: "Braylon Mullins", pos: "SG", school: "UConn", ht: "6'6\"", wt: "196 lbs", stats: "17.0 PTS" },
  { rank: 10, name: "Tounde Yessoufou", pos: "SF", school: "Baylor", ht: "6'5\"", wt: "215 lbs", stats: "23.7 PTS" },
  { rank: 11, name: "Jayden Quaintance", pos: "C", school: "Arizona St", ht: "6'10\"", wt: "255 lbs", stats: "20.2 PTS" },
  { rank: 12, name: "Karim Lopez", pos: "SF", school: "N. Zealand", ht: "6'8\"", wt: "220 lbs", stats: "16.4 PTS" },
  { rank: 13, name: "Yaxel Lendeborg", pos: "PF", school: "Michigan", ht: "6'9\"", wt: "235 lbs", stats: "21.0 PTS" },
  { rank: 14, name: "Labaron Philon", pos: "PG", school: "Alabama", ht: "6'4\"", wt: "175 lbs", stats: "27.4 PTS" },
];

export default function TankathonReplica() {
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

        // Sort by WORST record
        const sorted = allTeams.sort((a, b) => a.winPct - b.winPct);
        const lotteryTeams = sorted.slice(0, 14);
        
        // Assign Lottery Odds (2025 Standard)
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

  // --- SIMULATION ENGINE ---
  const runSimulation = () => {
    let pool = [...teams];
    let draftOrder = [];
    
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

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-bold">Loading Data...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 font-sans pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <header className="text-center mb-10 pt-8 border-b border-gray-800 pb-8">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white">
            Mock Draft <span className="text-emerald-500">Simulator</span>
          </h1>
          <p className="text-gray-400 mt-2 text-lg">2026 NBA Class Projection</p>
        </header>

        {/* CONTROLS */}
        <div className="flex justify-center gap-6 mb-12 sticky top-4 z-50">
          <button 
            onClick={runSimulation}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 px-8 rounded shadow-lg transform hover:scale-105 transition-all uppercase tracking-wide"
          >
            {isSimulated ? "Respin Lottery" : "Simulate Lottery"}
          </button>
          
          {isSimulated && (
            <button onClick={reset} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded shadow-lg transition-all uppercase tracking-wide">
              Reset
            </button>
          )}
        </div>

        {/* --- THE MOCK DRAFT TABLE --- */}
        <div className="bg-white rounded overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-gray-100 p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-300">
            <div className="col-span-1 text-center">Pick</div>
            <div className="col-span-5 md:col-span-4 pl-4">Team</div>
            <div className="col-span-6 md:col-span-7 pl-4">{isSimulated ? "Draft Selection" : "Current Standing"}</div>
          </div>

          {lotteryOrder.map((team, index) => {
             const diff = team.seed - (index + 1);
             const prospect = PROSPECTS[index]; // Get the player for this pick

             return (
              <div key={team.name} className="grid grid-cols-12 border-b border-gray-200 items-center hover:bg-gray-50 transition-colors py-3">
                
                {/* 1. PICK NUMBER */}
                <div className="col-span-1 flex flex-col items-center justify-center">
                  <div className="font-mono text-2xl text-gray-400 font-bold leading-none">
                    {isSimulated ? index + 1 : team.seed}
                  </div>
                  {/* Movement Arrow */}
                  {isSimulated && diff !== 0 && (
                    <div className={`text-[10px] font-bold mt-1 ${diff > 0 ? "text-green-600" : "text-red-500"}`}>
                       {diff > 0 ? "▲" : "▼"} {Math.abs(diff)}
                    </div>
                  )}
                </div>

                {/* 2. TEAM LOGO */}
                <div className="col-span-5 md:col-span-4 flex items-center gap-3 pl-4 border-r border-gray-100 h-full">
                  <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain" />
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-lg leading-tight">{team.name}</span>
                    <span className="text-xs text-gray-500">{team.wins}-{team.losses} • {team.chance} odds</span>
                  </div>
                </div>

                {/* 3. THE PLAYER (Mock Draft Mode) */}
                <div className="col-span-6 md:col-span-7 pl-4 h-full flex items-center">
                  {isSimulated && prospect ? (
                    <div className="flex items-center gap-4 w-full">
                       {/* Mock Draft View */}
                       <div className="hidden md:block text-2xl font-bold text-gray-200 w-8">{prospect.pos}</div>
                       <div className="flex flex-col">
                          <span className="text-xl font-bold text-gray-900 leading-none">{prospect.name}</span>
                          <div className="text-sm text-gray-500 mt-1 flex gap-2">
                            <span className="font-semibold text-emerald-600">{prospect.school}</span>
                            <span className="hidden md:inline text-gray-400">•</span>
                            <span className="hidden md:inline">{prospect.ht}, {prospect.wt}</span>
                          </div>
                       </div>
                       <div className="ml-auto pr-4 hidden md:block">
                          <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded">{prospect.stats}</span>
                       </div>
                    </div>
                  ) : (
                    /* Standard View (Just text when not simulated) */
                    <div className="text-gray-400 text-sm italic">
                       Simulate to see draft projection
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
        
        <div className="text-center text-gray-500 text-xs mt-8">
            *Mock Draft order based on consensus 2026 Big Board rankings
        </div>

      </div>
    </div>
  );
}
