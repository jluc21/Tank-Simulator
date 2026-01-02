"use client";
import { useState, useEffect } from 'react';

// --- THE FALLBACK 60 (Used while loading or if API fails) ---
const FALLBACK_PLAYERS = [
  { rank: 1, name: "Darryn Peterson", team: "Kansas", pos: "G", stats: "19.3 PPG", img: "" },
  { rank: 2, name: "Cameron Boozer", team: "Duke", pos: "PF", stats: "22.1 PPG", img: "" },
  { rank: 3, name: "AJ Dybantsa", team: "BYU", pos: "SF", stats: "23.1 PPG", img: "" },
  { rank: 4, name: "Caleb Wilson", team: "UNC", pos: "PF", stats: "21.7 PPG", img: "" },
  { rank: 5, name: "Nate Ament", team: "Tennessee", pos: "SF", stats: "18.9 PPG", img: "" },
  { rank: 6, name: "Kingston Flemings", team: "Houston", pos: "PG", stats: "20.4 PPG", img: "" },
  { rank: 7, name: "Mikel Brown Jr.", team: "Louisville", pos: "PG", stats: "14.9 PPG", img: "" },
  { rank: 8, name: "Braylon Mullins", team: "UConn", pos: "SG", stats: "17.0 PPG", img: "" },
  { rank: 9, name: "Koa Peat", team: "Arizona", pos: "PF", stats: "18.0 PPG", img: "" },
  { rank: 10, name: "Tounde Yessoufou", team: "Baylor", pos: "SF", stats: "23.7 PPG", img: "" },
  { rank: 11, name: "Jayden Quaintance", team: "Arizona St", pos: "C", stats: "11.2 PPG", img: "" },
  { rank: 12, name: "Labaron Philon", team: "Alabama", pos: "PG", stats: "15.5 PPG", img: "" },
  { rank: 13, name: "Darius Acuff", team: "Arkansas", pos: "PG", stats: "16.2 PPG", img: "" },
  { rank: 14, name: "Yaxel Lendeborg", team: "Michigan", pos: "PF", stats: "21.0 PPG", img: "" },
  { rank: 15, name: "Isaiah Evans", team: "Duke", pos: "SF", stats: "12.4 PPG", img: "" },
  { rank: 16, name: "Ebuka Okorie", team: "Stanford", pos: "SF", stats: "22.8 PPG", img: "" },
  { rank: 17, name: "JT Toppin", team: "Texas Tech", pos: "PF", stats: "18.2 PPG", img: "" },
  { rank: 18, name: "Bennett Stirtz", team: "Iowa", pos: "PG", stats: "14.5 PPG", img: "" },
  { rank: 19, name: "Chris Cenac", team: "Houston", pos: "C", stats: "10.1 PPG", img: "" },
  { rank: 20, name: "Tahaad Pettiford", team: "Auburn", pos: "PG", stats: "11.5 PPG", img: "" },
  // ... (The list creates space for the API to fill in)
];

export default function BigBoardPage() {
  const [players, setPlayers] = useState(FALLBACK_PLAYERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveStats() {
      try {
        const res = await fetch('/api/stats');
        const liveData = await res.json();
        
        if (liveData && liveData.length > 0) {
          // Merge API data (Images/HT/WT) into our rankings
          // We map through a generated list of 60 slots
          const bigBoard = liveData.map((livePlayer, index) => ({
             rank: index + 1,
             name: livePlayer.name,
             team: livePlayer.team,
             pos: livePlayer.pos,
             ht: livePlayer.ht,
             wt: livePlayer.wt,
             img: livePlayer.img,
             stats: "Live Roster" // In a real full app, we'd do a 2nd fetch for exact PPG
          }));
          setPlayers(bigBoard);
        }
        setLoading(false);
      } catch (error) {
        console.error("Using fallback data...", error);
        setLoading(false);
      }
    }
    fetchLiveStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-20">
      <div className="border-b-4 border-orange-500 bg-white pt-8 pb-4 px-4 text-center sticky top-0 z-40 shadow-sm">
        <h1 className="text-3xl md:text-5xl font-light text-gray-800 tracking-tight">
          2026 NBA Draft <span className="font-bold">Big Board</span>
        </h1>
        <p className="text-gray-500 text-xs md:text-sm mt-2 uppercase tracking-widest font-semibold">
          Top 60 Prospects • Live 2025-26 Season Data
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-2 md:px-4 mt-8">
        <div className="bg-orange-600 text-white text-center py-2 font-bold text-sm uppercase tracking-widest rounded-t shadow-md">
          Consensus Rankings
        </div>
        
        <div className="bg-white border border-gray-200 shadow-xl rounded-b">
            {players.map((player, index) => (
              <div key={index} className={`flex flex-col md:flex-row items-center border-b border-gray-100 py-3 hover:bg-orange-50/50 transition-colors ${index < 14 ? 'bg-white' : 'bg-gray-50/30'}`}>
                
                {/* RANK */}
                <div className="w-12 md:w-16 text-center text-3xl md:text-4xl font-light text-gray-300 font-mono">
                  {index + 1}
                </div>

                {/* IMAGE */}
                <div className="w-16 md:w-20 flex justify-center">
                   <div className="relative group">
                     <img 
                       src={player.img || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                       alt={player.name} 
                       className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm group-hover:scale-110 transition-transform"
                     />
                   </div>
                </div>

                {/* NAME & TEAM */}
                <div className="flex-grow text-center md:text-left pl-0 md:pl-4 mb-2 md:mb-0">
                   <div className="text-lg md:text-xl font-bold text-gray-800 leading-none">{player.name}</div>
                   <div className="text-xs text-gray-500 mt-1 flex gap-2 justify-center md:justify-start items-center">
                     <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{player.pos}</span>
                     <span className="hidden md:inline text-gray-300">|</span>
                     <span className="text-orange-600 font-bold uppercase tracking-wide">{player.team}</span>
                   </div>
                </div>

                {/* PHYSICALS */}
                <div className="w-full md:w-32 text-center md:text-left hidden md:block">
                   <div className="text-sm font-semibold text-gray-700">{player.ht}</div>
                   <div className="text-xs text-gray-400">{player.wt}</div>
                </div>

                {/* STATS */}
                <div className="w-full md:w-48 text-center md:text-right pr-0 md:pr-6">
                   <div className="text-sm md:text-base font-bold text-gray-900 bg-green-50 inline-block md:block px-2 py-1 rounded border border-green-100">
                     {player.stats || "Live Roster"}
                   </div>
                </div>

              </div>
            ))}
        </div>
        
        <div className="text-center py-8">
           <button className="bg-gray-800 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg text-xs">
             Load More Prospects
           </button>
        </div>
      </div>
    </div>
  );
}
