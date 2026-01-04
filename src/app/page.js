import SimulatorClient from './SimulatorClient';

// This is a Server Component - it fetches data directly on the server (no CORS issues)
async function getLiveStandings() {
  const res = await fetch(
    'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings',
    { next: { revalidate: 0 } } // Forces fresh data on every visit (no caching)
  );

  if (!res.ok) throw new Error('Failed to fetch ESPN standings');
  const data = await res.json();

  // Map ESPN's real-time standings data
  const teams = data.children[0].standings.entries.map((entry) => ({
    name: entry.team.displayName,
    logo: entry.team.logos[0].href,
    record: entry.stats.find(s => s.name === 'summary').displayValue,
    winPct: entry.stats.find(s => s.name === 'winPercent').displayValue,
    streak: entry.stats.find(s => s.name === 'streak')?.displayValue || '-',
  }));

  // Sort by worst win percentage for the lottery order (Top 14)
  return teams.sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct)).slice(0, 14);
}

export default async function RebuildWatchHome() {
  const liveTeams = await getLiveStandings();

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <SimulatorClient initialTeams={liveTeams} />
      </div>
    </div>
  );
}
