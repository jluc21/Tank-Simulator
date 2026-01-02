"use client";
import { useState, useEffect } from 'react';

// --- FALLBACK DATA (Accurate 2026 Start) ---
// This displays immediately while the "Daily Update" API runs in the background.
const FALLBACK_PLAYERS = [
  { rank: 1, name: "Darryn Peterson", team: "Kansas", pos: "G", stats: "19.3 PPG", img: "https://s3media.247sports.com/Uploads/Assets/669/138/12138669.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 2, name: "Cameron Boozer", team: "Duke", pos: "PF", stats: "22.1 PPG", img: "https://s3media.247sports.com/Uploads/Assets/428/967/11967428.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 3, name: "AJ Dybantsa", team: "BYU", pos: "SF", stats: "23.1 PPG", img: "https://s3media.247sports.com/Uploads/Assets/822/283/12283822.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 4, name: "Caleb Wilson", team: "UNC", pos: "PF", stats: "21.7 PPG", img: "https://s3media.247sports.com/Uploads/Assets/325/71/12071325.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 5, name: "Nate Ament", team: "Tennessee", pos: "SF", stats: "18.9 PPG", img: "https://s3media.247sports.com/Uploads/Assets/564/252/12252564.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 6, name: "Kingston Flemings", team: "Houston", pos: "PG", stats: "20.4 PPG", img: "https://s3media.247sports.com/Uploads/Assets/839/840/11840839.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 7, name: "Mikel Brown Jr.", team: "Louisville", pos: "PG", stats: "14.9 PPG", img: "https://s3media.247sports.com/Uploads/Assets/349/335/12335349.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 8, name: "Braylon Mullins", team: "UConn", pos: "SG", stats: "17.0 PPG", img: "https://s3media.247sports.com/Uploads/Assets/693/178/12178693.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 9, name: "Koa Peat", team: "Arizona", pos: "PF", stats: "18.0 PPG", img: "https://s3media.247sports.com/Uploads/Assets/751/66/12066751.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 10, name: "Tounde Yessoufou", team: "Baylor", pos: "SF", stats: "23.7 PPG", img: "https://s3media.247sports.com/Uploads/Assets/479/931/11931479.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 11, name: "Jayden Quaintance", team: "Arizona St", pos: "C", stats: "11.2 PPG", img: "https://s3media.247sports.com/Uploads/Assets/985/904/11904985.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 12, name: "Labaron Philon", team: "Alabama", pos: "PG", stats: "15.5 PPG", img: "https://s3media.247sports.com/Uploads/Assets/855/123/12123855.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 13, name: "Darius Acuff", team: "Arkansas", pos: "PG", stats: "16.2 PPG", img: "https://s3media.247sports.com/Uploads/Assets/554/474/11474554.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 14, name: "Yaxel Lendeborg", team: "Michigan", pos: "PF", stats: "21.0 PPG", img: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png" },
];

export default function BigBoardPage() {
  const [players, setPlayers] = useState(FALLBACK_PLAYERS);
  const [lastUpdated, setLastUpdated] = useState("Loading live stats...");

  useEffect(() => {
    async function fetchLiveStats() {
      try {
        const res = await fetch('/api/stats');
        const liveData = await res.json();
        
        if (liveData && liveData.length > 0) {
          // Merge Live stats with our list
          // We keep the Manual Rank order but update the stats/images
          const updated = FALLBACK_PLAYERS.map(p => {
            const live = liveData.find(l => l.name === p.name);
            return live ? { ...p, stats: live.stats, img: live.img, pos: live.pos } : p;
          });
          
          setPlayers(updated);
          setLastUpdated("Live Updates • 2025-26 Season");
        }
      } catch (error) {
        console.error("Using fallback data...", error);
        setLastUpdated("Offline Mode • 2026 Projections");
      }
    }
    fetchLiveStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-20">
      
      {/* HEADER */}
      <div className="border-b-4 border-orange-500 bg-white pt-8 pb-4 px-4 text-center sticky top-0 z-40 shadow-sm">
        <h1 className="text-3xl md:text-5xl font-light text-gray-800 tracking-tight">
          2026 NBA Draft <span className="font-bold">Big Board</span>
        </h1>
        <p className="text-gray-500 text-xs md:text-sm mt-2 uppercase tracking-widest font-semibold animate-pulse">
          {lastUpdated}
        </p>
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto px-2 md:px-4 mt-8">
        <div className="bg-orange-600 text-white text-center py-2 font-bold text-sm uppercase tracking-widest rounded-t shadow-md">
          Consensus Rankings
        </div>
        
        <div className="bg-white border border-gray-200 shadow-xl rounded-b">
            {players.map((player, index) => (
              <div key={index} className={`flex flex-col md:flex-row items-center border-b border-gray-100 py-3 hover:bg-orange-50/50 transition-colors ${index < 14 ? 'bg-white' : 'bg-gray-50/30'}`}>
                
                {/* RANK */}
                <div className="w-12 md:w-16 text-center text-3xl md:text-4xl font-light text-gray-300 font-mono">
                  {player.rank}
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

                {/* STATS (Dynamic) */}
                <div className="w-full md:w-48 text-center md:text-right pr-0 md:pr-6">
                   <div className="text-base font-bold text-green-600">
                     {player.stats.split(',')[0]}
                   </div>
                   <div className="text-xs text-gray-400 font-medium">
                     {player.stats.split(',')[1] || ""}
                   </div>
                </div>

              </div>
            ))}
        </div>
        
        <div className="text-center py-8">
           <button className="bg-gray-800 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg text-xs">
             Load 60+ Prospects
           </button>
        </div>
      </div>
    </div>
  );
}
