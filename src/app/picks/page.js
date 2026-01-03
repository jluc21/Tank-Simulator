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
  const [selectedTeam, setSelectedTeam] = useState("SAC");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchAssets() {
      setLoading(true);
      setErrorMsg("");
      setAssets([]);
      
      try {
        const res = await fetch(`/api/assets?team=${selectedTeam}`);
        const data = await res.json();
        
        if (data.error) {
          setErrorMsg(data.error);
        } else if (Array.isArray(data)) {
          setAssets(data);
        } else {
          setErrorMsg("Unexpected data format from source.");
        }
      } catch (error) {
        setErrorMsg("Connection failed. Please verify API.");
      }
      setLoading(false);
    }
    fetchAssets();
  }, [selectedTeam]);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2">
              Team Asset <span className="text-emerald-500">Manager</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Data Source: Fanspo Ledger
            </p>
          </div>
          
          <div className="w-full md:w-64">
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

        {/* ERROR STATE */}
        {errorMsg && (
          <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {/* ASSET TABLE */}
        <div className="bg-[#121212] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 bg-[#1a1a1a] text-xs font-bold text-gray-500 uppercase tracking-wider py-3 border-b border-gray-800 px-4">
            <div className="col-span-2 md:col-span-1">Year</div>
            <div className="col-span-2 md:col-span-1">Round</div>
            <div className="col-span-3 md:col-span-2">From</div>
            <div className="col-span-5 md:col-span-8">Protections / Notes</div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-gray-500 font-mono text-sm">Accessing Fanspo Database...</p>
            </div>
          ) : assets.length === 0 && !errorMsg ? (
            <div className="p-12 text-center text-gray-500">No assets found.</div>
          ) : (
            assets.map((pick, i) => (
              <div key={i} className="grid grid-cols-12 py-4 px-4 border-b border-gray-800 text-sm hover:bg-gray-900 transition-colors items-center group">
                
                <div className="col-span-2 md:col-span-1 font-bold text-white font-mono text-lg">{pick.year}</div>
                
                <div className="col-span-2 md:col-span-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${pick.round === 1 ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
                    {pick.round === 1 ? "1st" : "2nd"}
                  </span>
                </div>

                <div className="col-span-3 md:col-span-2 font-bold text-gray-300">
                  {/* Logic: If 'from' matches current team, say Own. Else show the origin team */}
                  {pick.from === selectedTeam ? <span className="text-gray-500">Own</span> : <span className="text-emerald-400">{pick.from}</span>}
                </div>

                <div className="col-span-5 md:col-span-8 text-gray-400 text-xs md:text-sm">
                  {pick.notes || <span className="text-gray-700 italic">Unprotected</span>}
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
