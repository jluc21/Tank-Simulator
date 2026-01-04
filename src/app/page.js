import React from 'react';

// This function runs on the server to get live data before the page loads
async function getLiveStandings() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings',
      { next: { revalidate: 3600 } } // Updates every hour
    );
    const data = await res.json();

    // Mapping the ESPN data into the Tankathon format
    return data.children[0].standings.entries.map((entry) => ({
      name: entry.team.displayName,
      logo: entry.team.logos[0].href,
      record: entry.stats.find(s => s.name === 'summary').displayValue,
      winPct: entry.stats.find(s => s.name === 'winPercent').displayValue,
      streak: entry.stats.find(s => s.name === 'streak')?.displayValue || '-',
    })).sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct)).slice(0, 14);
  } catch (err) {
    return []; // Returns empty if API is down
  }
}

export default async function Home() {
  const standings = await getLiveStandings();

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-10 font-sans text-[#2f3e4e]">
      <div className="max-w-5xl mx-auto">
        
        {/* CENTERED HEADER & BUTTONS (TANKATHON STYLE) */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-8">
            2026 NBA Draft Lottery Simulator
          </h1>
          
          <div className="flex justify-center gap-2">
            <button className="bg-[#2f3e4e] text-white px-10 py-2 rounded font-bold uppercase tracking-widest hover:bg-[#1a252f]">
              Sim Lottery
            </button>
            <button className="bg-[#9ea3a8] text-white px-10 py-2 rounded font-bold uppercase tracking-widest hover:bg-[#2f3e4e]">
              Reset
            </button>
          </div>
        </div>

        {/* STANDINGS TABLE */}
        <div className="bg-white border-t-2 border-[#2f3e4e] shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] font-bold uppercase border-b border-[#d1d1d1]">
                <th className="px-4 py-3">Pick</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-center">Record</th>
                <th className="px-4 py-3 text-center">Win%</th>
                <th className="px-4 py-3 text-center">Streak</th>
                <th className="px-4 py-3 text-right">#1 OVR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {standings.map((team, i) => (
                <tr key={team.name} className="hover:bg-[#fcfcfc]">
                  <td className="px-4 py-3 font-medium text-[#9ea3a8]">{i + 1}</td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={team.logo} className="w-6 h-6 object-contain" alt="" />
                    <span className="font-bold">{team.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-[#9ea3a8]">{team.record}</td>
                  <td className="px-4 py-3 text-center text-[#9ea3a8]">{team.winPct}</td>
                  <td className={`px-4 py-3 text-center font-bold ${team.streak.includes('W') ? 'text-green-600' : 'text-red-500'}`}>
                    {team.streak}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {i < 3 ? '14.0%' : i === 3 ? '12.5%' : '---'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-[#f5f5f5] text-center py-2 text-[10px] font-bold text-[#9ea3a8] uppercase tracking-[0.3em]">
            End of Lottery
          </div>
        </div>
      </div>
    </div>
  );
}
