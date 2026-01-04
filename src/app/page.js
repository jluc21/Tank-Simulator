// --- SERVER COMPONENT ---
// This handles the data fetch on the server to bypass browser CORS blocks
async function getLiveNBAStandings() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings',
      { cache: 'no-store' } // Ensures fresh standings on every visit
    );
    
    if (!res.ok) return [];
    const data = await res.json();

    // Map the real-time ESPN data
    const teams = data.children[0].standings.entries.map((entry) => ({
      name: entry.team.displayName,
      logo: entry.team.logos[0].href,
      record: entry.stats.find(s => s.name === 'summary').displayValue,
      winPct: entry.stats.find(s => s.name === 'winPercent').displayValue,
      streak: entry.stats.find(s => s.name === 'streak')?.displayValue || '-',
    }));

    // Sort by worst win percentage for the lottery (Bottom 14)
    return teams.sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct)).slice(0, 14);
  } catch (error) {
    console.error("ESPN Data Fetch Failed:", error);
    return [];
  }
}

import LotteryTable from './LotteryTable';

export default async function RebuildWatchHome() {
  const liveTeams = await getLiveNBAStandings();

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Pass the live data to our interactive client component */}
        <LotteryTable initialTeams={liveTeams} />
      </div>
    </div>
  );
}
