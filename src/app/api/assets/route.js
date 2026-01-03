import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Force dynamic prevents Next.js from building this as a static page
export const dynamic = 'force-dynamic';

// --- UTILITY: The "Loose" Bloodhound (Your logic) ---
// Recursively searches the Fanspo data blob for the draft picks array
function findPicksInJSON(obj) {
  if (!obj || typeof obj !== 'object') return null;

  if (Array.isArray(obj) && obj.length > 0) {
    const sample = obj[0];
    // "Loose" Check: Does it have a Year and a Round?
    if (sample && typeof sample === 'object' && 'season' in sample && 'round' in sample) {
      return obj;
    }
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = findPicksInJSON(obj[key]);
      if (result) return result;
    }
  }
  return null;
}

// --- STEP 1: Discover Correct Team IDs ---
// Fanspo IDs change (e.g. Spurs might be 2, not 27). We scrape the main list first.
async function getTeamDirectory() {
  try {
    const res = await fetch('https://fanspo.com/nba/teams', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      next: { revalidate: 86400 } // Cache list for 24 hours
    });
    
    if (!res.ok) throw new Error('Failed to fetch team directory');

    const html = await res.text();
    const $ = cheerio.load(html);
    const teams = [];

    // Find links formatted like /nba/teams/[slug]/[id]
    $('a[href^="/nba/teams/"]').each((_, el) => {
      const href = $(el).attr('href');
      const parts = href.split('/'); // ["", "nba", "teams", "slug", "id"]
      
      if (parts.length === 5) {
        const slug = parts[3];
        const id = parts[4];
        
        // Deduplicate
        if (!teams.find(t => t.id === id)) {
          teams.push({ slug, id });
        }
      }
    });
    return teams;
  } catch (e) {
    console.error("Directory Error:", e);
    return [];
  }
}

// --- STEP 2: Fetch & Process Single Team ---
async function fetchTeamPicks(team) {
  const url = `https://fanspo.com/nba/teams/${team.slug}/${team.id}/draft-picks`;
  
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      next: { revalidate: 3600 } // Cache individual team data for 1 hour
    });

    if (!res.ok) return { team: team.slug, error: `Status ${res.status}` };

    const html = await res.text();
    const $ = cheerio.load(html);

    // Grab the JSON Payload (Cleaner than parsing HTML tables)
    const nextDataRaw = $('#__NEXT_DATA__').html();
    if (!nextDataRaw) return { team: team.slug, error: "No Data Payload" };

    const json = JSON.parse(nextDataRaw);
    const rawPicks = findPicksInJSON(json);

    if (!rawPicks) return { team: team.slug, error: "Structure changed" };

    // Process the raw picks
    const cleanPicks = rawPicks
      .map(pick => {
        // Determine "From"
        let fromTeam = "Own";
        const sourceObj = pick.original_team || pick.from_team || pick.source_team;
        // If the source team ID is different from the current team ID, it's incoming
        if (sourceObj && String(sourceObj.team_id) !== String(team.id)) {
          fromTeam = sourceObj.team_code || "Traded";
        } else if (pick.original_team_id && String(pick.original_team_id) !== String(team.id)) {
           fromTeam = "Traded";
        }

        // Clean Notes
        let notes = pick.note || pick.description || pick.text || "-";
        notes = notes.replace("Protected ", "Prot ");

        return {
          year: parseInt(pick.season),
          round: pick.round,
          from: fromTeam,
          notes: notes
        };
      })
      .filter(p => p.year >= 2025) // Filter old picks
      .sort((a, b) => a.year - b.year || a.round - b.round);

    return {
      team: team.slug,
      id: team.id,
      assets: cleanPicks
    };

  } catch (err) {
    return { team: team.slug, error: err.message };
  }
}

// --- MAIN ROUTE ---
export async function GET() {
  // 1. Get the real list of teams and IDs
  const teams = await getTeamDirectory();

  if (teams.length === 0) {
    return NextResponse.json({ error: "Could not discover teams" }, { status: 500 });
  }

  // 2. Fetch all 30 teams in parallel
  // Note: Vercel Free tier has a 10s timeout. If this times out, slice the array (e.g., teams.slice(0, 5))
  const allData = await Promise.all(teams.map(team => fetchTeamPicks(team)));

  // 3. Return aggregated data
  return NextResponse.json({
    count: allData.length,
    timestamp: new Date().toISOString(),
    teams: allData
  });
}
