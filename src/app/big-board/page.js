"use client";
import { useState, useEffect } from 'react';

// --- FALLBACK DATA (Used if ESPN API is slow) ---
// Updated to reflect the Jan 2026 Reality
const FALLBACK_PLAYERS = [
  { rank: 1, name: "Darryn Peterson", team: "Kansas", stats: "19.3 PPG, 3.8 REB", shooting: "52.8% FG", img: "https://s3media.247sports.com/Uploads/Assets/669/138/12138669.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 2, name: "Cameron Boozer", team: "Duke", stats: "23.5 PPG, 10.2 REB", shooting: "56.5% FG", img: "https://s3media.247sports.com/Uploads/Assets/428/967/11967428.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  { rank: 3, name: "AJ Dybantsa", team: "BYU", stats: "23.1 PPG, 7.2 REB", shooting: "59.1% FG", img: "https://s3media.247sports.com/Uploads/Assets/822/283/12283822.jpg?fit=bounds&crop=150:200,offset-y0.50&width=150&height=200" },
  // ... (You can add the rest here)
];

export default function BigBoardPage() {
  const [players, setPlayers] = useState(FALLBACK_PLAYERS);
  const [loading, setLoading] = useState(true);

  // --- FETCH LIVE DATA FROM OUR API ---
  useEffect(() => {
    async function fetchLiveStats() {
      try {
        const res = await fetch('/api/stats');
        const liveData = await res.json();
        
        if (liveData && liveData.length > 0) {
          // Merge Live ESPN data (Images/Bio) with our Stat Tracker
          const merged = FALLBACK_PLAYERS.map(p => {
            const live = liveData.find(l => l.name === p.name);
            return live ? { ...p, img: live.img, ht: live.ht, wt: live.wt, pos: live.pos } : p;
          });
          setPlayers(merged);
        }
        setLoading(false);
      } catch (error) {
        console.error("Using fallback data...");
        setLoading(false);
      }
    }
    fetchLiveStats();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      
      {/* HEADER */}
      <div className="border-b-4 border-orange-500 bg-white pt-8 pb-4 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-light text-gray-800 tracking-tight">
          2026 NBA Draft <span className="font-bold">Big Board</span>
        </h1>
        <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest font-semibold">
          Live Updates • 2025-26 Season
        </p>
      </div>

      {/* TABLE */}
      <div className="max-w-6xl mx-auto px-2 md:px-4 mt-8">
        <div className="bg-orange-600 text-white text-center py-1 font-bold text-sm uppercase tracking-widest rounded-t">
          Top Prospects
        </div>
        
        <div className="bg-white border-l border-r border-b border-gray-300">
            {players.map((player, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors">
                
                {/* RANK */}
                <div className="w-16 text-center text-5xl font-light text-gray-400 font-mono">
                  {index + 1}
                </div>

                {/* IMAGE */}
                <div className="w-20 flex justify-center">
                   <div className="relative">
                     <img 
                       src={player.img} 
                       alt={player.name} 
                       className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                     />
                     <div className="absolute -bottom-1 -right-1 bg-white text-[10px] font-bold px-1 rounded shadow text-gray-400 border border-gray-200">
                       {player.team.substring(0,3).toUpperCase()}
                     </div>
                   </div>
                </div>

                {/* NAME */}
                <div className="flex-grow text-center md:text-left pl-0 md:pl-4">
                   <div className="text-xl font-bold text-gray-800 leading-none">{player.name}</div>
                   <div className="text-xs text-gray-500 mt-1 flex gap-2 justify-center md:justify-start">
                     <span className="font-bold">{player.pos || "Fr"}</span>
                     <span>|</span>
                     <span className="text-orange-600 font-bold">{player.team}</span>
                   </div>
                </div>

                {/* LIVE STATS */}
                <div className="w-64 text-center md:text-right pr-0 md:pr-8 mt-2 md:mt-0">
                   <div className="text-lg font-bold text-green-600">{player.stats.split(',')[0]}</div>
                   <div className="text-xs text-gray-500 font-medium">
                     {player.stats.split(',')[1]}
                   </div>
                   <div className="text-[10px] text-gray-400 mt-1 font-mono">
                     {player.shooting}
                   </div>
                </div>

              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
