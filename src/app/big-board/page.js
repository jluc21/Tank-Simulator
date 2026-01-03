"use client";
import { useState, useEffect } from 'react';

// --- THE MASTER 61 (2026 NBA DRAFT CLASS) ---
// We start with NO images (using the fallback silhouette) to prevent broken links.
// The API will fill in the real ESPN headshots automatically.
const MASTER_PLAYERS = [
  // --- TIER 1: THE LOTTERY ---
  { rank: 1, name: "Darryn Peterson", team: "Kansas", pos: "G", stats: { ppg: "19.3", rpg: "3.8", apg: "2.8", fg: "52.8%", threePt: "42.3%" } },
  { rank: 2, name: "Cameron Boozer", team: "Duke", pos: "PF", stats: { ppg: "22.1", rpg: "11.7", apg: "3.2", fg: "56.5%", threePt: "38.5%" } },
  { rank: 3, name: "AJ Dybantsa", team: "BYU", pos: "SF", stats: { ppg: "23.1", rpg: "7.2", apg: "3.8", fg: "59.1%", threePt: "33.3%" } },
  { rank: 4, name: "Caleb Wilson", team: "UNC", pos: "PF", stats: { ppg: "21.7", rpg: "11.0", apg: "5.0", fg: "54.0%", threePt: "36.0%" } },
  { rank: 5, name: "Nate Ament", team: "Tennessee", pos: "SF", stats: { ppg: "18.9", rpg: "10.0", apg: "2.2", fg: "48.5%", threePt: "41.2%" } },
  { rank: 6, name: "Kingston Flemings", team: "Houston", pos: "PG", stats: { ppg: "20.4", rpg: "6.4", apg: "6.8", fg: "46.0%", threePt: "35.0%" } },
  { rank: 7, name: "Mikel Brown Jr.", team: "Louisville", pos: "PG", stats: { ppg: "14.9", rpg: "3.3", apg: "6.1", fg: "44.0%", threePt: "38.0%" } },
  { rank: 8, name: "Braylon Mullins", team: "UConn", pos: "SG", stats: { ppg: "17.0", rpg: "5.4", apg: "2.1", fg: "50.0%", threePt: "47.6%" } },
  { rank: 9, name: "Koa Peat", team: "Arizona", pos: "PF", stats: { ppg: "18.0", rpg: "10.0", apg: "4.9", fg: "56.0%", threePt: "28.0%" } },
  { rank: 10, name: "Tounde Yessoufou", team: "Baylor", pos: "SF", stats: { ppg: "23.7", rpg: "7.2", apg: "2.7", fg: "49.0%", threePt: "36.0%" } },
  { rank: 11, name: "Jayden Quaintance", team: "Arizona St", pos: "C", stats: { ppg: "11.2", rpg: "14.4", apg: "1.2", fg: "60.0%", threePt: "0.0%" } },
  { rank: 12, name: "Labaron Philon", team: "Alabama", pos: "PG", stats: { ppg: "15.5", rpg: "4.5", apg: "7.0", fg: "48.0%", threePt: "39.0%" } },
  { rank: 13, name: "Darius Acuff", team: "Arkansas", pos: "PG", stats: { ppg: "16.2", rpg: "3.2", apg: "4.5", fg: "42.0%", threePt: "34.0%" } },
  { rank: 14, name: "Yaxel Lendeborg", team: "Michigan", pos: "PF", stats: { ppg: "21.0", rpg: "9.6", apg: "4.8", fg: "52.0%", threePt: "38.0%" } },

  // --- TIER 4: MID-FIRST ROUND ---
  { rank: 15, name: "Chris Cenac", team: "Houston", pos: "C", stats: { ppg: "12.4", rpg: "8.5", apg: "1.2", fg: "62%", threePt: "0%" } },
  { rank: 16, name: "Meleek Thomas", team: "Arkansas", pos: "SG", stats: { ppg: "15.8", rpg: "4.2", apg: "3.1", fg: "45%", threePt: "37%" } },
  { rank: 17, name: "Jalen Haralson", team: "Notre Dame", pos: "SF", stats: { ppg: "14.2", rpg: "5.5", apg: "4.0", fg: "48%", threePt: "34%" } },
  { rank: 18, name: "Bryson Tiller", team: "Kansas", pos: "PF", stats: { ppg: "13.5", rpg: "7.8", apg: "1.5", fg: "55%", threePt: "30%" } },
  { rank: 19, name: "Jasper Johnson", team: "Kentucky", pos: "G", stats: { ppg: "16.1", rpg: "2.8", apg: "3.5", fg: "44%", threePt: "39%" } },
  { rank: 20, name: "Malachi Moreno", team: "Kentucky", pos: "C", stats: { ppg: "9.8", rpg: "9.2", apg: "1.0", fg: "68%", threePt: "0%" } },
  { rank: 21, name: "Eric Reibe", team: "UConn", pos: "C", stats: { ppg: "10.5", rpg: "8.0", apg: "2.2", fg: "58%", threePt: "33%" } },
  { rank: 22, name: "Nikolas Khamenia", team: "Gonzaga", pos: "SF", stats: { ppg: "12.2", rpg: "5.1", apg: "3.4", fg: "49%", threePt: "38%" } },
  { rank: 23, name: "Acaden Lewis", team: "Kentucky", pos: "PG", stats: { ppg: "14.5", rpg: "3.0", apg: "5.5", fg: "43%", threePt: "36%" } },
  { rank: 24, name: "Karim Lopez", team: "N. Zealand", pos: "SF", stats: { ppg: "15.4", rpg: "6.5", apg: "2.1", fg: "47%", threePt: "35%" } },
  { rank: 25, name: "Hugo Gonzalez", team: "R. Madrid", pos: "SF", stats: { ppg: "11.2", rpg: "4.0", apg: "1.8", fg: "50%", threePt: "32%" } },
  { rank: 26, name: "Will Riley", team: "Illinois", pos: "SF", stats: { ppg: "17.5", rpg: "5.5", apg: "2.5", fg: "46%", threePt: "41%" } },
  { rank: 27, name: "Morez Johnson", team: "Illinois", pos: "C", stats: { ppg: "11.0", rpg: "9.5", apg: "0.8", fg: "63%", threePt: "0%" } },
  { rank: 28, name: "Tre Johnson", team: "Texas", pos: "SG", stats: { ppg: "18.2", rpg: "4.5", apg: "2.5", fg: "45%", threePt: "38%" } },
  { rank: 29, name: "Jalil Bethea", team: "Miami", pos: "SG", stats: { ppg: "16.8", rpg: "3.2", apg: "2.0", fg: "44%", threePt: "40%" } },
  { rank: 30, name: "Ian Jackson", team: "UNC", pos: "SG", stats: { ppg: "15.5", rpg: "4.0", apg: "2.8", fg: "47%", threePt: "35%" } },

  // --- TIER 5: THE REST ---
  { rank: 31, name: "Drake Powell", team: "UNC", pos: "SF", stats: { ppg: "12.4", rpg: "6.0", apg: "3.2", fg: "51%", threePt: "34%" } },
  { rank: 32, name: "Derrion Reid", team: "Alabama", pos: "SF", stats: { ppg: "13.0", rpg: "5.5", apg: "2.0", fg: "49%", threePt: "36%" } },
  { rank: 33, name: "Aiden Sherrell", team: "Alabama", pos: "C", stats: { ppg: "10.2", rpg: "7.5", apg: "0.9", fg: "60%", threePt: "28%" } },
  { rank: 34, name: "Asa Newell", team: "Georgia", pos: "PF", stats: { ppg: "14.1", rpg: "8.2", apg: "1.1", fg: "54%", threePt: "32%" } },
  { rank: 35, name: "Khani Rooths", team: "Michigan", pos: "PF", stats: { ppg: "11.5", rpg: "6.0", apg: "1.5", fg: "50%", threePt: "31%" } },
  { rank: 36, name: "Donnie Freeman", team: "Syracuse", pos: "PF", stats: { ppg: "13.8", rpg: "7.8", apg: "1.2", fg: "52%", threePt: "30%" } },
  { rank: 37, name: "Kon Knueppel", team: "Duke", pos: "SF", stats: { ppg: "14.5", rpg: "4.5", apg: "2.5", fg: "48%", threePt: "42%" } },
  { rank: 38, name: "Cooper Koch", team: "Iowa", pos: "PF", stats: { ppg: "12.2", rpg: "5.0", apg: "1.8", fg: "47%", threePt: "40%" } },
  { rank: 39, name: "Jackson McAndrew", team: "Creighton", pos: "PF", stats: { ppg: "11.8", rpg: "5.2", apg: "1.0", fg: "46%", threePt: "41%" } },
  { rank: 40, name: "Jase Richardson", team: "Mich St", pos: "PG", stats: { ppg: "10.5", rpg: "3.5", apg: "4.2", fg: "44%", threePt: "35%" } },
  { rank: 41, name: "Kur Teng", team: "Mich St", pos: "SG", stats: { ppg: "12.1", rpg: "3.0", apg: "1.5", fg: "45%", threePt: "39%" } },
  { rank: 42, name: "Annor Boateng", team: "Missouri", pos: "SF", stats: { ppg: "11.4", rpg: "4.8", apg: "1.8", fg: "48%", threePt: "33%" } },
  { rank: 43, name: "Rakease Passmore", team: "Kansas", pos: "SG", stats: { ppg: "9.8", rpg: "3.2", apg: "1.2", fg: "46%", threePt: "37%" } },
  { rank: 44, name: "Carter Bryant", team: "Arizona", pos: "SF", stats: { ppg: "10.5", rpg: "5.5", apg: "2.0", fg: "47%", threePt: "34%" } },
  { rank: 45, name: "Jamari Phillips", team: "Arizona", pos: "SG", stats: { ppg: "11.2", rpg: "2.5", apg: "1.8", fg: "43%", threePt: "38%" } },
  { rank: 46, name: "Zoom Diallo", team: "Washington", pos: "PG", stats: { ppg: "13.5", rpg: "4.0", apg: "5.2", fg: "44%", threePt: "30%" } },
  { rank: 47, name: "Tahaad Pettiford", team: "Auburn", pos: "PG", stats: { ppg: "12.8", rpg: "2.8", apg: "4.5", fg: "42%", threePt: "35%" } },
  { rank: 48, name: "Jahki Howard", team: "Auburn", pos: "SF", stats: { ppg: "10.1", rpg: "4.2", apg: "1.1", fg: "51%", threePt: "32%" } },
  { rank: 49, name: "Vyctorius Miller", team: "LSU", pos: "SG", stats: { ppg: "13.2", rpg: "3.5", apg: "2.2", fg: "45%", threePt: "36%" } },
  { rank: 50, name: "Robert Wright III", team: "Baylor", pos: "PG", stats: { ppg: "11.5", rpg: "2.5", apg: "5.8", fg: "43%", threePt: "34%" } },
  { rank: 51, name: "Dink Pate", team: "G League", pos: "SG", stats: { ppg: "14.5", rpg: "5.2", apg: "3.8", fg: "41%", threePt: "31%" } },
  { rank: 52, name: "Joson Sanon", team: "Arizona St", pos: "SG", stats: { ppg: "15.2", rpg: "3.8", apg: "2.1", fg: "46%", threePt: "38%" } },
  { rank: 53, name: "Amier Ali", team: "Arizona St", pos: "SF", stats: { ppg: "10.8", rpg: "4.5", apg: "2.2", fg: "45%", threePt: "34%" } },
  { rank: 54, name: "Paul McNeil", team: "NC State", pos: "SG", stats: { ppg: "11.5", rpg: "3.2", apg: "1.5", fg: "44%", threePt: "39%" } },
  { rank: 55, name: "Mercy Miller", team: "Houston", pos: "SG", stats: { ppg: "12.1", rpg: "3.5", apg: "1.8", fg: "45%", threePt: "37%" } },
  { rank: 56, name: "Rocco Zikarsky", team: "Brisbane", pos: "C", stats: { ppg: "8.5", rpg: "7.2", apg: "0.5", fg: "65%", threePt: "0%" } },
  { rank: 57, name: "Somto Cyril", team: "Georgia", pos: "C", stats: { ppg: "7.8", rpg: "8.5", apg: "0.4", fg: "68%", threePt: "0%" } },
  { rank: 58, name: "Tyler Betsey", team: "Cincinnati", pos: "SF", stats: { ppg: "10.2", rpg: "4.1", apg: "1.2", fg: "44%", threePt: "38%" } },
  { rank: 59, name: "Chase McCarty", team: "Houston", pos: "SF", stats: { ppg: "9.5", rpg: "3.5", apg: "1.0", fg: "43%", threePt: "36%" } },
  { rank: 60, name: "James Brown", team: "UNC", pos: "C", stats: { ppg: "8.2", rpg: "6.5", apg: "0.8", fg: "61%", threePt: "0%" } },
  { rank: 61, name: "Pharaoh Compton", team: "SDSU", pos: "PF", stats: { ppg: "9.1", rpg: "7.2", apg: "0.5", fg: "64%", threePt: "0%" } },
];

export default function BigBoardPage() {
  const [players, setPlayers] = useState(MASTER_PLAYERS);
  const [lastUpdated, setLastUpdated] = useState("Loading live stats...");

  useEffect(() => {
    async function fetchLiveStats() {
      try {
        const res = await fetch('/api/stats');
        const liveData = await res.json();
        
        if (liveData && liveData.length > 0) {
          const updated = MASTER_PLAYERS.map(p => {
            const live = liveData.find(l => l.name === p.name);
            // CRITICAL FIX: If API finds the player, use their LIVE stats AND image.
            // If API fails, fall back to our existing stats (p.stats) and the Silhouette placeholder.
            if (live) {
              return { 
                ...p, 
                stats: live.stats, // Live PPG/REB/AST
                img: live.img      // Live ESPN Headshot
              };
            }
            return p;
          });
          setPlayers(updated);
          setLastUpdated("Live Updates • 2025-26 Season");
        }
      } catch (error) {
        console.error("API Error", error);
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
              <div key={index} className={`flex flex-col md:flex-row items-center border-b border-gray-100 py-4 hover:bg-orange-50/50 transition-colors ${index < 14 ? 'bg-white' : 'bg-gray-50/30'}`}>
                
                {/* RANK */}
                <div className="w-12 md:w-16 text-center text-3xl md:text-4xl font-light text-gray-300 font-mono">
                  {player.rank}
                </div>

                {/* IMAGE */}
                <div className="w-16 md:w-20 flex justify-center">
                   <div className="relative group">
                     {/* Safe fallback for images to prevent crashes/broken links */}
                     <img 
                       src={player.img || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                       alt={player.name} 
                       className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm group-hover:scale-110 transition-transform bg-white"
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

                {/* STATS (Expanded View) */}
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
