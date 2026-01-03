"use client";
import { useState, useEffect } from 'react';

// --- STABLE FALLBACK DATA ---
// These images are hardcoded to 247Sports/official profiles so they will ALWAYS work.
const FALLBACK_PLAYERS = [
  { 
    rank: 1, name: "Darryn Peterson", team: "Kansas", pos: "G", 
    stats: { ppg: "19.3", rpg: "3.8", apg: "2.8", fg: "52.8%", threePt: "42.3%" },
    img: "https://s3media.247sports.com/Uploads/Assets/669/138/12138669.jpg"
  },
  { 
    rank: 2, name: "Cameron Boozer", team: "Duke", pos: "PF", 
    stats: { ppg: "22.1", rpg: "11.7", apg: "3.2", fg: "56.5%", threePt: "38.5%" },
    img: "https://s3media.247sports.com/Uploads/Assets/428/967/11967428.jpg"
  },
  { 
    rank: 3, name: "AJ Dybantsa", team: "BYU", pos: "SF", 
    stats: { ppg: "23.1", rpg: "7.2", apg: "3.8", fg: "59.1%", threePt: "33.3%" },
    img: "https://s3media.247sports.com/Uploads/Assets/822/283/12283822.jpg"
  },
  { 
    rank: 4, name: "Caleb Wilson", team: "UNC", pos: "PF", 
    stats: { ppg: "21.7", rpg: "11.0", apg: "5.0", fg: "54.0%", threePt: "36.0%" },
    img: "https://s3media.247sports.com/Uploads/Assets/325/71/12071325.jpg"
  },
  { 
    rank: 5, name: "Nate Ament", team: "Tennessee", pos: "SF", 
    stats: { ppg: "18.9", rpg: "10.0", apg: "2.2", fg: "48.5%", threePt: "41.2%" },
    img: "https://s3media.247sports.com/Uploads/Assets/564/252/12252564.jpg"
  },
  { 
    rank: 6, name: "Kingston Flemings", team: "Houston", pos: "PG", 
    stats: { ppg: "20.4", rpg: "6.4", apg: "6.8", fg: "46.0%", threePt: "35.0%" },
    img: "https://s3media.247sports.com/Uploads/Assets/839/840/11840839.jpg"
  },
  { 
    rank: 7, name: "Mikel Brown Jr.", team: "Louisville", pos: "PG", 
    stats: { ppg: "14.9", rpg: "3.3", apg: "6.1", fg: "44.0%", threePt: "38.0%" },
    img: "https://s3media.247sports.com/Uploads/Assets/349/335/12335349.jpg"
  },
  { 
    rank: 8, name: "Braylon Mullins", team: "UConn", pos: "SG", 
    stats: { ppg: "17.0", rpg: "5.4", apg: "2.1", fg: "50.0%", threePt: "47.6%" },
    img: "https://s3media.247sports.com/Uploads/Assets/693/178/12178693.jpg"
  },
  { 
    rank: 9, name: "Koa Peat", team: "Arizona", pos: "PF", 
    stats: { ppg: "18.0", rpg: "10.0", apg: "4.9", fg: "56.0%", threePt: "28.0%" },
    img: "https://s3media.247sports.com/Uploads/Assets/751/66/12066751.jpg"
  },
  { 
    rank: 10, name: "Tounde Yessoufou", team: "Baylor", pos: "SF", 
    stats: { ppg: "23.7", rpg: "7.2", apg: "2.7", fg: "49.0%", threePt: "36.0%" },
    img: "https://s3media.247sports.com/Uploads/Assets/479/931/11931479.jpg"
  },
  { 
    rank: 11, name: "Jayden Quaintance", team: "Arizona St", pos: "C", 
    stats: { ppg: "11.2", rpg: "14.4", apg: "1.2", fg: "60.0%", threePt: "0.0%" },
    img: "https://s3media.247sports.com/Uploads/Assets/985/904/11904985.jpg"
  },
  { 
    rank: 12, name: "Labaron Philon", team: "Alabama", pos: "PG", 
    stats: { ppg: "15.5", rpg: "4.5", apg: "7.0", fg: "48.0%", threePt: "39.0%" },
    img: "https://s3media.247sports.com/Uploads/Assets/855/123/12123855.jpg"
  },
  { 
    rank: 13, name: "Darius Acuff", team: "Arkansas", pos: "PG", 
    stats: { ppg: "16.2", rpg: "3.2", apg: "4.5", fg: "42.0%", threePt: "34.0%" },
    img: "https://s3media.247sports.com/Uploads/Assets/554/474/11474554.jpg"
  },
  { 
    rank: 14, name: "Yaxel Lendeborg", team: "Michigan", pos: "PF", 
    stats: { ppg: "21.0", rpg: "9.6", apg: "4.8", fg: "52.0%", threePt: "38.0%" },
    img: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png" // Fallback for less common players
  },
];

export default function BigBoardPage() {
  const [players, setPlayers] = useState(FALLBACK_PLAYERS);
  const [lastUpdated, setLastUpdated] = useState("Loading live stats...");

  // --- FETCH LIVE STATS ONLY ---
  useEffect(() => {
    async function fetchLiveStats() {
      try {
        const res = await fetch('/api/stats');
        const liveData = await res.json();
        
        if (liveData && liveData.length > 0) {
          const updated = FALLBACK_PLAYERS.map(p => {
            const live = liveData.find(l => l.name === p.name);
            // We use our HARDCODED images (p.img) so they never break.
            // We only take the STATS from the live API.
            return live ? { ...p, stats: live.stats } : p;
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
      <div className="border-b-4 border-orange-500 bg-white pt-8 pb-4 px-4 text-center sticky top-0 z-40 shadow-sm">
        <h1 className="text-3xl md:text-5xl font-light text-gray-800 tracking-tight">
          2026 NBA Draft <span className="font-bold">Big Board</span>
        </h1>
        <p className="text-gray-500 text-xs md:text-sm mt-2 uppercase tracking-widest font-semibold animate-pulse">
          {lastUpdated}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-2 md:px-4 mt-8">
        <div className="bg-orange-600 text-white text-center py-2 font-bold text-sm uppercase tracking-widest rounded-t shadow-md">
          Consensus Rankings
        </div>
        
        <div className="bg-white border border-gray-200 shadow-xl rounded-b">
            {players.map((player, index) => (
              <div key={index} className={`flex flex-col md:flex-row items-center border-b border-gray-100 py-4 hover:bg-orange-50/50 transition-colors ${index < 14 ? 'bg-white' : 'bg-gray-50/30'}`}>
                
                {/* RANK */}
                <div className="w-12 md:w-16 text-center text-3xl md:text-4xl font-light text-gray-300 font-mono">
                  {player.rank}
                </div>

                {/* IMAGE */}
                <div className="w-16 md:w-20 flex justify-center">
                   <div className="relative group">
                     <img 
                       src={player.img} 
                       alt={player.name} 
                       className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm group-hover:scale-110 transition-transform"
                     />
                   </div>
                </div>

                {/* NAME & TEAM */}
                <div className="flex-grow text-center md:text-left pl-0 md:pl-4 mb-2 md:mb-0">
                   <div className="text-xl md:text-2xl font-bold text-gray-800 leading-none">{player.name}</div>
                   <div className="text-xs text-gray-500 mt-1 flex gap-2 justify-center md:justify-start items-center">
                     <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{player.pos}</span>
                     <span className="hidden md:inline text-gray-300">|</span>
                     <span className="text-orange-600 font-bold uppercase tracking-wide">{player.team}</span>
                   </div>
                </div>

                {/* STATS (Expanded) */}
                <div className="w-full md:w-auto text-center md:text-right pr-0 md:pr-6 flex flex-col items-center md:items-end gap-1">
                   {/* Main Stat (PPG) */}
                   <div className="text-2xl font-bold text-green-600 leading-none">
                     {player.stats.ppg} <span className="text-xs text-green-800 font-normal">PPG</span>
                   </div>
                   
                   {/* Sub Stats Row */}
                   <div className="flex gap-3 text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                     <div><span className="font-bold text-gray-700">{player.stats.rpg}</span> REB</div>
                     <div className="w-px bg-gray-300"></div>
                     <div><span className="font-bold text-gray-700">{player.stats.apg}</span> AST</div>
                     <div className="w-px bg-gray-300"></div>
                     <div><span className="font-bold text-gray-700">{player.stats.fg}</span> FG</div>
                     <div className="w-px bg-gray-300"></div>
                     <div><span className="font-bold text-gray-700">{player.stats.threePt}</span> 3P%</div>
                   </div>
                </div>

              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
