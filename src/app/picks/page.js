"use client";
import { useState, useEffect } from 'react';
import { TEAM_ASSETS } from './data'; // Import our massive database

// Helper to map Abbreviation -> Full Name
const TEAM_NAMES = {
  ATL: "Atlanta Hawks", BOS: "Boston Celtics", BKN: "Brooklyn Nets", CHA: "Charlotte Hornets",
  CHI: "Chicago Bulls", CLE: "Cleveland Cavaliers", DAL: "Dallas Mavericks", DEN: "Denver Nuggets",
  DET: "Detroit Pistons", GSW: "Golden State Warriors", HOU: "Houston Rockets", IND: "Indiana Pacers",
  LAC: "LA Clippers", LAL: "Los Angeles Lakers", MEM: "Memphis Grizzlies", MIA: "Miami Heat",
  MIL: "Milwaukee Bucks", MIN: "Minnesota Timberwolves", NOP: "New Orleans Pelicans", NYK: "New York Knicks",
  OKC: "Oklahoma City Thunder", ORL: "Orlando Magic", PHI: "Philadelphia 76ers", PHX: "Phoenix Suns",
  POR: "Portland Trail Blazers", SAC: "Sacramento Kings", SAS: "San Antonio Spurs", TOR: "Toronto Raptors",
  UTA: "Utah Jazz", WAS: "Washington Wizards"
};

export default function DraftPicksPage() {
  const [selectedTeam, setSelectedTeam] = useState("SAC");
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);

  // --- FETCH LIVE STANDINGS (For 2026 Projected Picks) ---
  useEffect(() => {
    async function fetchStandings() {
      try {
        const res = await fetch('https://site.api.espn.com/apis/v2/sports/basketball/nba/standings');
        const data = await res.json();
        let teamRanks = {};
        let allTeams = [];

        data.children.forEach(conference => {
          conference.standings.entries.forEach(entry => {
            allTeams.push({
              abbr: entry.team.abbreviation,
              pct: Number(entry.stats.find(s => s.name === 'winPercent')?.value || 0)
            });
          });
        });

        // Sort by WORST record (Draft Order)
        allTeams.sort((a, b) => a.pct - b.pct);

        // Create Map: { "SAC": 12, "DET": 1, ... }
        allTeams.forEach((team, index) => {
          teamRanks[team.abbr] = index + 1;
        });

        setStandings(teamRanks);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching standings:", error);
        setLoading(false);
      }
    }
    fetchStandings();
  }, []);

  // --- HELPER: CALCULATE CURRENT PICK # ---
  const getPickNumber = (asset) => {
    // Only 2026 1st Round picks have a "Live Number"
    if (asset.year === 2026 && asset.round === 1) {
      const teamToCheck = asset.from === "Own" ? selectedTeam : asset.from;
      // Handle edge cases like "DET, MIL or NYK" -> tough to calc live, return "-"
      if (teamToCheck.includes(",")) return "-";
      return standings[teamToCheck] || "-";
    }
    return "-";
  };

  // Get assets for selected team, or default to generic own picks if missing
  const currentAssets = TEAM_ASSETS[selectedTeam] || [
    { year: 2026, round: 1, from: "Own", notes: "" },
    { year: 2026, round: 2, from: "Own", notes: "" },
    { year: 2027, round: 1, from: "Own", notes: "" },
    { year: 2027, round: 2, from: "Own", notes: "" }
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2">
              Team Asset <span className="text-emerald-500">Manager</span>
            </h1>
            <p className="text-gray-400 text-sm">Future Draft Capital & Protections</p>
          </div>
          
          <div className="w-full md:w-64">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Select Team</label>
            <select 
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-3 font-bold focus:outline-none focus:border-emerald-500 appearance-none"
            >
              {Object.keys(TEAM_NAMES).sort().map(abbr => (
                <option key={abbr} value={abbr}>{TEAM_NAMES[abbr]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ASSET TABLE */}
        <div className="bg-[#121212] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 bg-[#1a1a1a] text-xs font-bold text-gray-500 uppercase tracking-wider py-3 border-b border-gray-800 px-4">
            <div className="col-span-2 md:col-span-1">Year</div>
            <div className="col-span-2 md:col-span-1">Round</div>
            <div className="col-span-2 md:col-span-1 text-center">Pick #</div>
            <div className="col-span-2 md:col-span-1">From</div>
            <div className="col-span-4 md:col-span-8">Protections / Notes</div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 font-mono animate-pulse">Syncing Live Standings...</div>
          ) : (
            currentAssets.map((pick, i) => {
              const pickNum = getPickNumber(pick);
              const isLottery = pickNum !== "-" && pickNum <= 14;
              
              return (
                <div key={i} className="grid grid-cols-12 py-4 px-4 border-b border-gray-800 text-sm hover:bg-gray-900 transition-colors items-center group">
                  
                  {/* Year */}
                  <div className="col-span-2 md:col-span-1 font-bold text-white font-mono">
                    {pick.year}
                  </div>

                  {/* Round */}
                  <div className="col-span-2 md:col-span-1 text-gray-400">
                    {pick.round === 1 ? "1st" : "2nd"}
                  </div>

                  {/* Pick # (Live) */}
                  <div className="col-span-2 md:col-span-1 text-center">
                    {pickNum !== "-" ? (
                      <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs border ${isLottery ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-gray-800 text-white border-gray-700'}`}>
                        {pickNum}
                      </span>
                    ) : (
                      <span className="text-gray-700">-</span>
                    )}
                  </div>

                  {/* From */}
                  <div className="col-span-2 md:col-span-1 font-bold text-gray-300">
                    {pick.from === "Own" ? <span className="text-gray-500">Own</span> : <span className="text-emerald-400">{pick.from}</span>}
                  </div>

                  {/* Notes */}
                  <div className="col-span-4 md:col-span-8 text-gray-400 text-xs md:text-sm flex items-center">
                    {pick.notes ? (
                      <span className="bg-gray-800/50 px-2 py-1 rounded border border-gray-800 group-hover:border-gray-700 transition-colors">
                        {pick.notes}
                      </span>
                    ) : (
                      <span className="text-gray-700 italic">Unprotected</span>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 flex justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          <span>* 2026 Pick Projections based on real-time standings</span>
          <span>Data Source: RealGM / Tankathon</span>
        </div>

      </div>
    </div>
  );
}
