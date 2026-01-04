import SimulatorClient from './SimulatorClient';

async function getLiveNBAStandings() {
  // Direct fetch on the server - no CORS/blocking issues
  const res = await fetch(
    'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings',
    { next: { revalidate: 0 } } // Always fresh data
  );
  const data = await res.json();

  // Map ESPN data to the Tankathon format
  return data.children[0].standings.entries.map((entry) => ({
    name: entry.team.displayName,
    logo: entry.team.logos[0].href,
    record: entry.stats.find(s => s.name === 'summary').displayValue,
    winPct: entry.stats.find(s => s.name === 'winPercent').displayValue,
    streak: entry.stats.find(s => s.name === 'streak')?.displayValue || '-',
  })).sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct)).slice(0, 14);
}

export default async function Home() {
  const standings = await getLiveNBAStandings();
  return <SimulatorClient initialData={standings} />;
}
