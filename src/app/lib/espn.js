// src/lib/espn.js
export async function getLiveStandings() {
  const ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings';
  
  try {
    const res = await fetch(ESPN_URL, {
      next: { 
        revalidate: 3600, // Cache for 1 hour, revalidate in background
        tags: ['standings'] 
      }
    });

    if (!res.ok) throw new Error(`ESPN API returned ${res.status}`);
    
    const data = await res.json();

    // VALIDATION: Ensure the nested structure exists
    const entries = data?.children?.[0]?.standings?.entries;
    if (!entries || !Array.isArray(entries)) {
      throw new Error("Invalid data structure received from ESPN");
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      teams: entries.map(entry => ({
        id: entry.team?.id,
        name: entry.team?.displayName || "Unknown Team",
        abbreviation: entry.team?.abbreviation || "NBA",
        logo: entry.team?.logos?.[0]?.href || null,
        record: entry.stats?.find(s => s.name === 'summary')?.displayValue || "0-0",
        winPct: entry.stats?.find(s => s.name === 'winPercent')?.displayValue || "0.000",
        streak: entry.stats?.find(s => s.name === 'streak')?.displayValue || "-",
      })).sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct))
    };
  } catch (error) {
    console.error("Critical Fetch Failure:", error.message);
    return { success: false, error: error.message, teams: [] };
  }
}
