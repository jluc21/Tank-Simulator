"use client";
import { useState, useEffect } from 'react';

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
  const [selectedTeam, setSelectedTeam] = useState("ATL");
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch('/api/assets');
        if (!res.ok) throw new Error("Failed to fetch live data");
        const data = await res.json();
        setAssets(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("System Offline. Using cached data.");
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);

  const currentAssets = assets[selectedTeam] || [];

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2">
              Team Asset <span className="text-emerald-500">Manager</span>
            </h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Data Source: RealGM Ledger
            </p>
          </div>
          
          <div className="w-full md:w-64">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Select Franchise</label>
            <select 
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-3 font-bold focus:outline-none focus:border-emerald-500 appearance-none hover:bg-gray-700 transition-colors"
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
            <div className="col-span-3 md:col-span-2">From</div>
            <div className="col-span-5 md:col-span-8">Details / Protections</div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-gray-500 font-mono text-sm">Syncing Trade Ledger...</p>
            </div>
          ) : currentAssets.length === 0 ? (
             <div className="p-12 text-center text-gray-500">
               No data found for this team. (Check Scraper)
             </div>
          ) : (
            currentAssets.map((pick, i) => (
              <div key={i} className="grid grid-cols-12 py-4 px-4 border-b border-gray-800 text-sm hover:bg-gray-900 transition-colors items-center group">
                
                {/* Year */}
                <div className="col-span-2 md:col-span-1 font-bold text-white font-mono text-lg">
                  {pick.year}
                </div>
                
                {/* Round */}
                <div className="col-span-2 md:col-span-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${pick.round === 1 ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
                    {pick.round === 1 ? "1st" : "2nd"}
                  </span>
                </div>

                {/* From */}
                <div className="col-span-3 md:col-span-2 font-bold text-gray-300">
                  {pick.from === "Own" ? <span className="text-gray-500">Own</span> : pick.from}
                </div>

                {/* Notes */}
                <div className="col-span-5 md:col-span-8 text-gray-400 text-xs md:text-sm">
                  {pick.notes || <span className="text-gray-700 italic">Unprotected</span>}
                </div>

              </div>
            ))
          )}
        </div>
        
        <div className="mt-6 text-center text-[10px] text-gray-600 uppercase font-bold tracking-widest">
          Trades Updated Daily • Simulating 2026-2032
        </div>

      </div>
    </div>
  );
}
