"use client";
import { useState, useEffect } from 'react';

// --- ASSET DATABASE (MOCK DATA FOR DEMO) ---
// In a full app, you would add every team's future picks here.
// I have populated the SPURS and KINGS as examples based on your screenshot.
const ASSETS = {
  SAS: [ // SAN ANTONIO SPURS (The Draft Capital Kings)
    { year: 2026, round: 1, from: "Own", notes: "" },
    { year: 2026, round: 1, from: "ATL", notes: "Unprotected" },
    { year: 2026, round: 2, from: "Own", notes: "" },
    { year: 2026, round: 2, from: "LAL", notes: "via IND" },
    { year: 2027, round: 1, from: "Own", notes: "" },
    { year: 2027, round: 1, from: "ATL", notes: "Unprotected" },
    { year: 2028, round: 1, from: "Own", notes: "" },
    { year: 2028, round: 1, from: "BOS", notes: "Protected 1 via Swap" },
    { year: 2029, round: 1, from: "Own", notes: "" },
    { year: 2030, round: 1, from: "Own", notes: "" },
    { year: 2030, round: 1, from: "DAL", notes: "Pick Swap" },
    { year: 2031, round: 1, from: "Own", notes: "" },
    { year: 2031, round: 1, from: "SAC", notes: "Swap Rights" },
  ],
  SAC: [ // SACRAMENTO KINGS (Matching your Screenshot)
    { year: 2026, round: 1, from: "Own", notes: "" },
    { year: 2026, round: 2, from: "Own", notes: "" },
    { year: 2026, round: 2, from: "CHA", notes: "Protected 56-60" },
    { year: 2027, round: 1, from: "Own", notes: "" },
    { year: 2027, round: 1, from: "SAS", notes: "Protected 17-30" }, // Hypothetical based on img
    { year: 2027, round: 2, from: "CHA", notes: "No protections" },
    { year: 2027, round: 2, from: "Own", notes: "" },
    { year: 2028, round: 1, from: "Own", notes: "" },
    { year: 2029, round: 1, from: "Own", notes: "" },
    { year: 2029, round: 2, from: "DET, MIL or NYK", notes: "No protections" },
    { year: 2030, round: 1, from: "Own", notes: "" },
    { year: 2031, round: 1, from: "MIN", notes: "No protections" },
    { year: 2031, round: 1, from: "Own", notes: "SAS has right to swap for SAC 1st" },
    { year: 2032, round: 1, from: "Own", notes: "" },
    { year: 2032, round: 2, from: "Own", notes: "" },
  ],
  // ... You can add other teams (LAL, BOS, NYK) here following the same format
};

export default function DraftPicksPage() {
  const [selectedTeam, setSelectedTeam] = useState("SAC"); // Default to Sacramento (matches screenshot)
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH LIVE STANDINGS ---
  // We need this to calculate the specific pick # for 2026 rows
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
              wins: entry.stats.find(s => s.name === 'wins')?.value || 0,
              losses: entry.stats.find(s => s.name === 'losses')?.value || 0,
              pct: Number(entry.stats.find(s => s.name === 'winPercent')?.value || 0)
            });
          });
        });

        // Sort by WORST record (Draft Order)
        allTeams.sort((a, b) => a.pct - b.pct);

        // Map team abbreviation to their live draft rank (1-30)
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

  // --- 2. HELPER: GET PICK NUMBER ---
  const getPickNumber = (asset) => {
    // Only calculate specific numbers for the current 2026 season
    if (asset.year === 2026 && asset.round === 1) {
      // If it's their own pick, look up their rank
      if (asset.from === "Own") return standings[selectedTeam] || "-";
      // If it's from another team (e.g., "ATL"), look up that team's rank
      return standings[asset.from] || "-"; 
    }
    return "-"; // Future years are unknown
  };

  const currentAssets = ASSETS[selectedTeam] || [];

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-6 pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER & SELECTOR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Incoming Draft Picks</h1>
          
          <select 
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="SAC">Sacramento Kings</option>
            <option value="SAS">San Antonio Spurs</option>
            {/* Add more options as you populate the ASSETS object */}
          </select>
        </div>

        {/* DATA TABLE */}
        <div className="bg-[#121212] border border-gray-800 rounded-lg overflow-hidden shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-[#1a1a1a] text-xs font-bold text-gray-400 uppercase tracking-wider py-3 border-b border-gray-800 px-4">
            <div className="col-span-1">Year</div>
            <div className="col-span-1">Round</div>
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-2">From</div>
            <div className="col-span-7">Protections / Notes</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading Assets...</div>
          ) : (
            currentAssets.map((pick, i) => (
              <div key={i} className="grid grid-cols-12 py-4 px-4 border-b border-gray-800 text-sm hover:bg-gray-900 transition-colors items-center">
                
                {/* Year */}
                <div className="col-span-1 font-bold text-white">
                  {pick.year}
                </div>

                {/* Round */}
                <div className="col-span-1 text-gray-300">
                  {pick.round}
                </div>

                {/* Pick # (Dynamic) */}
                <div className="col-span-1 text-center">
                  {getPickNumber(pick) !== "-" ? (
                    <span className="bg-gray-800 text-white px-2 py-1 rounded font-mono font-bold text-xs border border-gray-700">
                      {getPickNumber(pick)}
                    </span>
                  ) : (
                    <span className="text-gray-600">-</span>
                  )}
                </div>

                {/* From */}
                <div className="col-span-2 font-semibold text-gray-200">
                  {pick.from}
                </div>

                {/* Notes */}
                <div className="col-span-7 text-gray-400 text-xs md:text-sm">
                  {pick.notes || <span className="text-gray-700 italic">No protections</span>}
                </div>

              </div>
            ))
          )}
          
          {currentAssets.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500 italic">
              No asset data available for this team yet.
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-600">
          * 2026 Pick numbers are live projections based on current standings. Future picks are static.
        </div>

      </div>
    </div>
  );
}
