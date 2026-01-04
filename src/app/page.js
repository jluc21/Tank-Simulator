import React from 'react';

// SERVER-SIDE FETCH: This happens before the page even reaches your browser.
async function getLiveNBAStandings() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings',
      { next: { revalidate: 0 } } // Forces a fresh update on every single visit
    );
    
    if (!res.ok) return [];
    const data = await res.json();

    // Map the real-time ESPN data into the Tankathon format
    const teams = data.children[0].standings.entries.map((entry) => ({
      name: entry.team.displayName,
      logo: entry.team.logos[0].href,
      record: entry.stats.find(s => s.name === 'summary')?.displayValue || '0-0',
      winPct: entry.stats.find(s => s.name === 'winPercent')?.displayValue || '.000',
      streak: entry.stats.find(s => s.name === 'streak')?.displayValue || '-',
    }));

    // Sort by worst win percentage for the lottery order (Bottom 14)
    return teams.sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct)).slice(0, 14);
  } catch (error) {
    console.error("ESPN Data Fetch Failed:", error);
    return [];
  }
}

export default async function Home() {
  const standings = await getLiveNBAStandings();

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 md:p-12 font-sans text-[#2f3e4e]">
      <div className="max-w-4xl mx-auto">
        
        {/* CENTERED HEADER & BUTTONS (TANKATHON STYLE) */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-8">
            2026 NBA Draft Lottery Simulator
          </h1>
          
          <div className="flex justify-center gap-2">
            <button className="bg-[#2f3e4e] text-white px-10 py-2 rounded font-bold uppercase tracking-widest shadow-xl">
              Sim Lottery
            </button>
            <button className="bg-[#9ea3a8] text-white px-10 py-2 rounded font-bold uppercase tracking-widest shadow-md">
              Reset
            </button>
          </div>
        </div>

        {/* STANDINGS TABLE - NEVER BLANK */}
        <div className="bg-white border-t-2 border-[#2f3e4e] shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] font-bold uppercase border-b border-[#d1d1d1] text-[#2f3e4e]">
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
                <tr key={team.name} className="hover:bg-[#fcfcfc] transition-colors">
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
          
          {/* TANKATHON STYLE FOOTER */}
          <div className="bg-[#f5f5f5] text-center py-2 text-[10px] font-bold text-[#9ea3a8] uppercase tracking-[0.3em]">
            End of Lottery
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] font-bold text-[#9ea3a8] uppercase tracking-widest italic">
          Live Standings via ESPN API
        </p>
      </div>
    </div>
  );
}
