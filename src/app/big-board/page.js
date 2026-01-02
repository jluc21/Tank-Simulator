"use client";

// --- 2026 BIG BOARD DATA (Consensus Rankings) ---
const PLAYERS = [
  { rank: 1, name: "Darryn Peterson", school: "Kansas", pos: "SG/PG", ht: "6'6\"", wt: "205 lbs", age: 19.4, stats: "26.4 PPG, 5.1 REB, 3.8 AST", blocks: "1.0", steals: "1.7" },
  { rank: 2, name: "Cameron Boozer", school: "Duke", pos: "PF", ht: "6'9\"", wt: "250 lbs", age: 18.9, stats: "27.0 PPG, 11.7 REB, 4.4 AST", blocks: "1.0", steals: "1.9" },
  { rank: 3, name: "AJ Dybantsa", school: "BYU", pos: "SF", ht: "6'9\"", wt: "210 lbs", age: 19.4, stats: "26.5 PPG, 8.2 REB, 4.4 AST", blocks: "0.5", steals: "1.6" },
  { rank: 4, name: "Caleb Wilson", school: "UNC", pos: "SF/PF", ht: "6'10\"", wt: "215 lbs", age: 19.9, stats: "23.7 PPG, 13.5 REB, 3.1 AST", blocks: "1.9", steals: "1.6" },
  { rank: 5, name: "Nate Ament", school: "Tennessee", pos: "SF", ht: "6'10\"", wt: "207 lbs", age: 19.5, stats: "20.6 PPG, 9.3 REB, 3.5 AST", blocks: "0.2", steals: "1.8" },
  { rank: 6, name: "Kingston Flemings", school: "Houston", pos: "PG", ht: "6'4\"", wt: "190 lbs", age: 19.5, stats: "18.2 PPG, 4.0 REB, 5.9 AST", blocks: "0.3", steals: "2.5" },
  { rank: 7, name: "Mikel Brown Jr.", school: "Louisville", pos: "PG", ht: "6'5\"", wt: "190 lbs", age: 20.2, stats: "22.0 PPG, 4.0 REB, 6.8 AST", blocks: "0.1", steals: "1.1" },
  { rank: 8, name: "Braylon Mullins", school: "UConn", pos: "SG", ht: "6'6\"", wt: "196 lbs", age: 20.2, stats: "17.0 PPG, 5.4 REB, 2.1 AST", blocks: "0.4", steals: "1.4" },
  { rank: 9, name: "Koa Peat", school: "Arizona", pos: "PF", ht: "6'8\"", wt: "235 lbs", age: 19.4, stats: "19.1 PPG, 7.6 REB, 3.8 AST", blocks: "0.8", steals: "1.0" },
  { rank: 10, name: "Tounde Yessoufou", school: "Baylor", pos: "SG/SF", ht: "6'5\"", wt: "215 lbs", age: 20.1, stats: "23.7 PPG, 7.2 REB, 2.7 AST", blocks: "0.9", steals: "2.9" },
  { rank: 11, name: "Jayden Quaintance", school: "Arizona St", pos: "PF/C", ht: "6'10\"", wt: "255 lbs", age: 18.9, stats: "20.2 PPG, 14.4 REB, 2.9 BLK", blocks: "2.9", steals: "0.5" },
  { rank: 12, name: "Karim Lopez", school: "New Zealand", pos: "SF", ht: "6'8\"", wt: "220 lbs", age: 19.2, stats: "16.4 PPG, 9.5 REB, 2.2 AST", blocks: "1.5", steals: "1.5" },
  { rank: 13, name: "Yaxel Lendeborg", school: "Michigan", pos: "PF", ht: "6'9\"", wt: "235 lbs", age: 23.7, stats: "21.0 PPG, 9.6 REB, 4.8 AST", blocks: "1.8", steals: "2.0" },
];

export default function BigBoardPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      
      {/* HEADER SECTION */}
      <div className="border-b-4 border-orange-500 bg-white pt-8 pb-4 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-light text-gray-800 tracking-tight">
          2026 NBA Draft <span className="font-bold">Big Board</span>
        </h1>
        <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest font-semibold">
          Player Rankings Updated: <span className="text-gray-800">January 2, 2026</span>
        </p>
      </div>

      {/* FILTERS MOCK (Visual only for now) */}
      <div className="flex justify-center gap-2 py-6 bg-gray-50 border-b border-gray-200">
         {['OVERALL RANK', 'BY SCHOOL', 'FRESHMEN', 'INTERNATIONAL'].map((filter, i) => (
           <button key={filter} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border rounded ${i === 0 ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100'}`}>
             {filter}
           </button>
         ))}
      </div>

      {/* TABLE */}
      <div className="max-w-6xl mx-auto px-2 md:px-4 mt-8">
        {/* TIER 1 HEADER */}
        <div className="bg-orange-600 text-white text-center py-1 font-bold text-sm uppercase tracking-widest rounded-t">
          Tier 1
        </div>
        
        <div className="bg-white border-l border-r border-b border-gray-300">
            {PLAYERS.map((player, index) => (
              <div key={player.rank} className={`flex flex-col md:flex-row items-center border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors ${index === 2 ? "border-b-4 border-orange-600" : ""}`}>
                
                {/* RANK */}
                <div className="w-16 text-center text-5xl font-light text-gray-400 font-mono">
                  {player.rank}
                </div>

                {/* LOGO MOCK (Circle) */}
                <div className="w-16 flex justify-center">
                   <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-300">
                     {player.school.substring(0,3).toUpperCase()}
                   </div>
                </div>

                {/* NAME & INFO */}
                <div className="flex-grow text-center md:text-left pl-0 md:pl-4">
                   <div className="text-xl font-bold text-gray-800 leading-none">{player.name}</div>
                   <div className="text-xs text-gray-500 mt-1 flex gap-2 justify-center md:justify-start">
                     <span className="font-bold">{player.pos}</span>
                     <span>|</span>
                     <span>{player.school}</span>
                   </div>
                </div>

                {/* PHYSICALS */}
                <div className="w-32 text-center hidden md:block">
                   <div className="text-sm font-semibold text-gray-700">{player.ht}</div>
                   <div className="text-xs text-gray-500">{player.wt}</div>
                </div>

                {/* AGE */}
                <div className="w-24 text-center hidden md:block">
                   <div className="text-xs text-gray-400 uppercase">Draft Age</div>
                   <div className="text-sm font-semibold text-gray-700">{player.age} yrs</div>
                </div>

                {/* STATS (Highlighted) */}
                <div className="w-64 text-center md:text-right pr-0 md:pr-8 mt-2 md:mt-0">
                   <div className="text-lg font-bold text-green-600">{player.stats.split(',')[0]}</div>
                   <div className="text-xs text-gray-500 font-medium">
                     {player.stats.split(',')[1]} • {player.stats.split(',')[2]}
                   </div>
                   <div className="text-[10px] text-gray-400 mt-1">
                     BLK: <span className="text-gray-600">{player.blocks}</span> • STL: <span className="text-gray-600">{player.steals}</span>
                   </div>
                </div>

              </div>
            ))}
            
            {/* TIER BREAK VISUAL */}
            <div className="bg-orange-600 text-white text-center py-1 font-bold text-sm uppercase tracking-widest mt-0">
               The Rest
            </div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-xs mt-12 pb-8">
         © 2026 Tank Simulator • Data provided by Sports Reference & ESPN Projections
      </div>

    </div>
  );
}
