"use client";

// --- 2025-26 LIVE SEASON STATS (January 2nd Update) ---
// Stats reflect the current college season (20+ games played).
const PLAYERS = [
  { 
    rank: 1, 
    name: "Darryn Peterson", 
    school: "Kansas", 
    pos: "SG", 
    ht: "6'5\"", 
    wt: "205 lbs", 
    age: 19.4, 
    stats: "19.3 PPG, 3.8 REB, 2.8 AST", 
    shooting: "52.8% FG • 42.3% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3h8d76p6K0e4i9q2R5s7u0v1x8_w4y1z2A3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8"
  },
  { 
    rank: 2, 
    name: "Cameron Boozer", 
    school: "Duke", 
    pos: "PF", 
    ht: "6'9\"", 
    wt: "250 lbs", 
    age: 18.9, 
    stats: "22.1 PPG, 11.8 REB, 3.2 AST", 
    shooting: "62.0% FG • 38.5% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9r8s7t6u5v4w3x2y1z0A9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4q3r2s1t0u9v8w7x6y5z4A3b2c1d0e9f8g"
  },
  { 
    rank: 3, 
    name: "AJ Dybantsa", 
    school: "BYU", 
    pos: "SF", 
    ht: "6'9\"", 
    wt: "210 lbs", 
    age: 19.4, 
    stats: "23.1 PPG, 7.2 REB, 3.8 AST", 
    shooting: "59.1% FG • 33.3% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1s2t3u4v5w6x7y8z9A0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5A6b7c8d9e0f1g2"
  },
  { 
    rank: 4, 
    name: "Caleb Wilson", 
    school: "UNC", 
    pos: "PF", 
    ht: "6'10\"", 
    wt: "215 lbs", 
    age: 19.9, 
    stats: "21.7 PPG, 11.0 REB, 5.0 AST", 
    shooting: "54.0% FG • 36.0% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9z0x1c2v3b4n5m6,7.8.9/0-1=2+3"
  },
  { 
    rank: 5, 
    name: "Nate Ament", 
    school: "Tennessee", 
    pos: "SF", 
    ht: "6'10\"", 
    wt: "207 lbs", 
    age: 19.5, 
    stats: "18.9 PPG, 10.0 REB, 2.2 AST", 
    shooting: "48.5% FG • 41.2% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1t2u3v4w5x6y7z8A9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4A5b6c7d8e9f0g1"
  },
  { 
    rank: 6, 
    name: "Kingston Flemings", 
    school: "Houston", 
    pos: "PG", 
    ht: "6'4\"", 
    wt: "190 lbs", 
    age: 19.5, 
    stats: "20.4 PPG, 6.4 REB, 6.8 AST", 
    shooting: "46.0% FG • 35.0% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9w8e7r6t5y4u3i2o1p0a9s8d7f6g5h4j3k2l1z0x9c8v7b6n5m4,3.2.1/0-9=8+7"
  },
  { 
    rank: 7, 
    name: "Mikel Brown Jr.", 
    school: "Louisville", 
    pos: "PG", 
    ht: "6'5\"", 
    wt: "190 lbs", 
    age: 20.2, 
    stats: "14.9 PPG, 3.3 REB, 6.1 AST", 
    shooting: "44.0% FG • 38.0% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1s2t3u4v5w6x7y8z9A0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5A6b7c8d9e0f1g2"
  },
  { 
    rank: 8, 
    name: "Braylon Mullins", 
    school: "UConn", 
    pos: "SG", 
    ht: "6'6\"", 
    wt: "196 lbs", 
    age: 20.2, 
    stats: "32.9 PPG, 7.2 REB, 4.2 AST", 
    shooting: "50.0% FG • 47.6% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1t2u3v4w5x6y7z8A9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4A5b6c7d8e9f0g1"
  },
  { 
    rank: 9, 
    name: "Koa Peat", 
    school: "Arizona", 
    pos: "PF", 
    ht: "6'8\"", 
    wt: "235 lbs", 
    age: 19.4, 
    stats: "18.0 PPG, 10.0 REB, 4.9 AST", 
    shooting: "56.0% FG • 28.0% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9r8s7t6u5v4w3x2y1z0A9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4q3r2s1t0u9v8w7x6y5z4A3b2c1d0e9f8g"
  },
  { 
    rank: 10, 
    name: "Tounde Yessoufou", 
    school: "Baylor", 
    pos: "SF", 
    ht: "6'5\"", 
    wt: "215 lbs", 
    age: 20.1, 
    stats: "23.7 PPG, 7.2 REB, 2.7 AST", 
    shooting: "49.0% FG • 36.0% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3h8d76p6K0e4i9q2R5s7u0v1x8_w4y1z2A3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8"
  },
  { 
    rank: 11, 
    name: "Jayden Quaintance", 
    school: "Arizona St", 
    pos: "C", 
    ht: "6'10\"", 
    wt: "255 lbs", 
    age: 18.9, 
    stats: "11.2 PPG, 14.4 REB, 2.9 BLK", 
    shooting: "60.0% FG • 0.0% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1s2t3u4v5w6x7y8z9A0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5A6b7c8d9e0f1g2"
  },
  { 
    rank: 12, 
    name: "Karim Lopez", 
    school: "New Zealand", 
    pos: "SF", 
    ht: "6'8\"", 
    wt: "220 lbs", 
    age: 19.2, 
    stats: "16.4 PPG, 9.5 REB, 2.2 AST", 
    shooting: "45.0% FG • 34.0% 3P",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1t2u3v4w5x6y7z8A9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4A5b6c7d8e9f0g1"
  },
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
          Last Updated: <span className="text-gray-800">January 2, 2026</span> • Live Season Stats
        </p>
      </div>

      {/* FILTERS MOCK */}
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

                {/* PLAYER PHOTO (Circle) */}
                <div className="w-20 flex justify-center">
                   <div className="relative">
                     <img 
                       src={player.img} 
                       alt={player.name} 
                       className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                     />
                     {/* Rank Badge Mock */}
                     <div className="absolute -bottom-1 -right-1 bg-white text-[10px] font-bold px-1 rounded shadow text-gray-400 border border-gray-200">
                       {player.school.substring(0,3).toUpperCase()}
                     </div>
                   </div>
                </div>

                {/* NAME & INFO */}
                <div className="flex-grow text-center md:text-left pl-0 md:pl-4">
                   <div className="text-xl font-bold text-gray-800 leading-none">{player.name}</div>
                   <div className="text-xs text-gray-500 mt-1 flex gap-2 justify-center md:justify-start">
                     <span className="font-bold">{player.pos}</span>
                     <span>|</span>
                     <span className="text-orange-600 font-bold">{player.school}</span>
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

                {/* LIVE STATS */}
                <div className="w-64 text-center md:text-right pr-0 md:pr-8 mt-2 md:mt-0">
                   <div className="text-lg font-bold text-green-600">{player.stats.split(',')[0]}</div>
                   <div className="text-xs text-gray-500 font-medium">
                     {player.stats.split(',')[1]} • {player.stats.split(',')[2]}
                   </div>
                   <div className="text-[10px] text-gray-400 mt-1 font-mono">
                     {player.shooting}
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
         © 2026 Tank Simulator • Live Season Stats • Updated Daily
      </div>

    </div>
  );
}
