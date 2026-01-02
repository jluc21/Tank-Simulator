"use client";
import { useState, useEffect } from 'react';

export default function StandingsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

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
              logo: team.logos[0].href,
              wins: wins,
              losses: losses,
              winPct: wins / (wins + losses)
            });
          });
        });
        const sorted = allTeams.sort((a, b) => a.winPct - b.winPct);
        const lotteryTeams = sorted.slice(0, 14);
        const weights = [140, 140, 140, 125, 105, 90, 75, 60, 45, 30, 20, 15, 10, 5];
        const teamsWithOdds = lotteryTeams.map((team, index) => ({
          ...team,
          seed: index + 1,
          chance: ((weights[index] || 0) / 10).toFixed(1) + "%"
        }));
        setTeams(teamsWithOdds);
        setLoading(false);
      } catch (error) { console.error("Failed to fetch data:", error); }
    }
    fetchStandings();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Standings...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Tank Standings
          </h1>
          <p className="text-gray-400 mt-2">Current Reverse Standings</p>
        </header>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="grid grid-cols-12 bg-gray-950 p-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-7 pl-4">Team</div>
            <div className="col-span-4 text-right">Odds / Record</div>
          </div>
          {teams.map((team, index) => (
            <div key={team.name} className="grid grid-cols-12 p-4 border-b border-gray-700 items-center hover:bg-gray-750">
              <div className="col-span-1 font-mono text-xl text-gray-500 text-center">{team.seed}</div>
              <div className="col-span-7 flex items-center gap-3 pl-4">
                <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg">{team.name}</span>
              </div>
              <div className="col-span-4 text-right font-mono">
                <div className="flex flex-col">
                  <span className="text-gray-300 font-bold">{team.wins}-{team.losses}</span>
                  <span className="text-xs text-gray-500">{team.chance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
