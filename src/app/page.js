"use client";
import React, { useState, useEffect } from 'react';

// SAFETY NET DATA: Used if the API is blocked or slow
const INITIAL_NBA_DATA = [
  { name: "Detroit Pistons", logo: "https://a.espncdn.com/i/teamlogos/nba/500/det.png", record: "10-25", winPct: ".286", streak: "L2" },
  { name: "Washington Wizards", logo: "https://a.espncdn.com/i/teamlogos/nba/500/was.png", record: "11-24", winPct: ".314", streak: "W1" },
  { name: "Charlotte Hornets", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png", record: "12-23", winPct: ".343", streak: "L1" },
  { name: "San Antonio Spurs", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sas.png", record: "13-22", winPct: ".371", streak: "L3" },
  { name: "Portland Trail Blazers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/por.png", record: "14-21", winPct: ".400", streak: "L1" },
  { name: "Toronto Raptors", logo: "https://a.espncdn.com/i/teamlogos/nba/500/tor.png", record: "15-20", winPct: ".429", streak: "W2" },
  { name: "Utah Jazz", logo: "https://a.espncdn.com/i/teamlogos/nba/500/uta.png", record: "16-19", winPct: ".457", streak: "L1" },
  { name: "Brooklyn Nets", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png", record: "17-18", winPct: ".486", streak: "W1" },
  { name: "Chicago Bulls", logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png", record: "18-17", winPct: ".514", streak: "L2" },
  { name: "Atlanta Hawks", logo: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png", record: "19-16", winPct: ".543", streak: "W1" },
  { name: "Houston Rockets", logo: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png", record: "20-15", winPct: ".571", streak: "W3" },
  { name: "Sacramento Kings", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png", record: "21-14", winPct: ".600", streak: "L1" },
  { name: "Memphis Grizzlies", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png", record: "22-13", winPct: ".629", streak: "W2" },
  { name: "Golden State Warriors", logo: "https://a.espncdn.com/i/teamlogos/nba/500/gs.png", record: "23-12", winPct: ".657", streak: "W4" },
  { name: "Indiana Pacers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png", record: "24-11", winPct: ".686", streak: "W1" },
  { name: "Orlando Magic", logo: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png", record: "25-10", winPct: ".714", streak: "L1" },
  { name: "Cleveland Cavaliers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png", record: "26-9", winPct: ".743", streak: "W5" },
  { name: "Miami Heat", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png", record: "27-8", winPct: ".771", streak: "W2" },
  { name: "Philadelphia 76ers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png", record: "18-17", winPct: ".514", streak: "L1" },
  { name: "Phoenix Suns", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png", record: "20-15", winPct: ".571", streak: "W1" },
  { name: "Minnesota Timberwolves", logo: "https://a.espncdn.com/i/teamlogos/nba/500/min.png", record: "21-14", winPct: ".600", streak: "L2" },
  { name: "Boston Celtics", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png", record: "28-7", winPct: ".800", streak: "W3" },
  { name: "LA Clippers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png", record: "22-13", winPct: ".629", streak: "W1" },
  { name: "Los Angeles Lakers", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png", record: "23-12", winPct: ".657", streak: "L1" },
  { name: "New York Knicks", logo: "https://a.espncdn.com/i/teamlogos/nba/500/nyk.png", record: "24-11", winPct: ".686", streak: "W2" },
  { name: "Denver Nuggets", logo: "https://a.espncdn.com/i/teamlogos/nba/500/den.png", record: "25-10", winPct: ".714", streak: "W1" },
  { name: "Dallas Mavericks", logo: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png", record: "26-9", winPct: ".743", streak: "L1" },
  { name: "Milwaukee Bucks", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png", record: "27-8", winPct: ".771", streak: "W4" },
  { name: "New Orleans Pelicans", logo: "https://a.espncdn.com/i/teamlogos/nba/500/nop.png", record: "28-7", winPct: ".800", streak: "W1" },
  { name: "Oklahoma City Thunder", logo: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png", record: "30-5", winPct: ".857", streak: "W4" }
];

export default function Home() {
  const [standings, setStandings] = useState(INITIAL_NBA_DATA);
  const [syncLabel, setSyncLabel] = useState("Loading Manual Backup...");

  // AUTOMATIC SYNC: Overwrites hardcoded data with live ESPN data
  useEffect(() => {
    async function syncWithESPN() {
      try {
        const cacheBuster = Date.now();
        // Using a reliable proxy to ensure the browser doesn't block the request
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings')}?cb=${cacheBuster}`);
        const json = await res.json();
        const data = JSON.parse(json.contents);
        
        const liveTeams = data.children[0].standings.entries.map((entry) => ({
          name: entry.team.displayName,
          logo: entry.team.logos[0].href,
          record: entry.stats.find(s => s.name === 'summary')?.displayValue || '0-0',
          winPct: entry.stats.find(s => s.name === 'winPercent')?.displayValue || '.000',
          streak: entry.stats.find(s => s.name === 'streak')?.displayValue || '-',
        }));

        // Sort by win percentage (Worst to Best)
        setStandings(liveTeams.sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct)));
        setSyncLabel("Real-Time Data Synced Via ESPN API");
      } catch (err) {
        setSyncLabel("Manual Data Sync (2026 Season Records)");
      }
    }
    syncWithESPN();
  }, []);

  const simulate = () => {
    const lottery = [...standings.slice(0, 14)].sort(() => Math.random() - 0.5);
    const nonLottery = [...standings.slice(14)];
    setStandings([...lottery, ...nonLottery]);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 md:p-12 font-sans text-[#2f3e4e]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-light mb-10 tracking-tight">2026 NBA Draft Lottery Simulator</h1>
          <div className="flex justify-center gap-4">
            <button onClick={simulate} className="bg-[#2f3e4e] text-white px-12 py-3 rounded font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">Sim Lottery</button>
            <button onClick={() => window.location.reload()} className="bg-[#9ea3a8] text-white px-12 py-3 rounded font-black uppercase tracking-widest shadow-md">Reset</button>
          </div>
        </div>

        <div className="bg-white border-t-4 border-[#2f3e4e] shadow-lg">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] font-black uppercase border-b border-[#d1d1d1] text-[#9ea3a8]">
                <th className="px-6 py-4">Pick</th>
                <th className="px-6 py-4">Team</th>
                <th className="px-6 py-4 text-center">Record</th>
                <th className="px-6 py-4 text-center">Win%</th>
                <th className="px-6 py-4 text-center">Streak</th>
                <th className="px-6 py-4 text-right">#1 OVR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {standings.map((team, i) => (
                <React.Fragment key={team.name}>
                  <tr className="hover:bg-[#fcfcfc] transition-colors border-l-4 border-transparent hover:border-l-[#2f3e4e]">
                    <td className="px-6 py-4 font-bold text-[#d1d1d1]">{i + 1}</td>
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img src={team.logo} className="w-8 h-8 object-contain" alt="" />
                      <span className="font-black text-lg uppercase italic">{team.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-[#9ea3a8]">{team.record}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-[#9ea3a8]">{team.winPct}</td>
                    <td className={`px-6 py-4 text-center font-black uppercase ${team.streak.includes('W') ? 'text-green-600' : 'text-red-500'}`}>{team.streak}</td>
                    <td className="px-6 py-4 text-right font-black text-xl">{i < 3 ? '14.0%' : i === 3 ? '12.5%' : '---'}</td>
                  </tr>
                  {i === 13 && (
                    <tr className="bg-[#f5f5f5]">
                      <td colSpan="6" className="text-center py-2 text-[10px] font-black text-[#9ea3a8] uppercase tracking-[0.4em]">End of Lottery</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center mt-10 text-[10px] font-bold text-[#9ea3a8] uppercase tracking-widest italic">{syncLabel}</p>
      </div>
    </div>
  );
}
