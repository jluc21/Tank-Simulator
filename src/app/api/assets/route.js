import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// 1. The "Alphabetical" 1-30 ID List
// This is much faster than scraping the directory every time.
const TEAM_IDS = {
  ATL: { id: 1, slug: "atlanta-hawks" },
  BOS: { id: 2, slug: "boston-celtics" },
  BKN: { id: 3, slug: "brooklyn-nets" },
  CHA: { id: 4, slug: "charlotte-hornets" },
  CHI: { id: 5, slug: "chicago-bulls" },
  CLE: { id: 6, slug: "cleveland-cavaliers" },
  DAL: { id: 7, slug: "dallas-mavericks" },
  DEN: { id: 8, slug: "denver-nuggets" },
  DET: { id: 9, slug: "detroit-pistons" },
  GSW: { id: 10, slug: "golden-state-warriors" },
  HOU: { id: 11, slug: "houston-rockets" },
  IND: { id: 12, slug: "indiana-pacers" },
  LAC: { id: 13, slug: "la-clippers" },
  LAL: { id: 14, slug: "los-angeles-lakers" },
  MEM: { id: 15, slug: "memphis-grizzlies" },
  MIA: { id: 16, slug: "miami-heat" },
  MIL: { id: 17, slug: "milwaukee-bucks" },
  MIN: { id: 18, slug: "minnesota-timberwolves" },
  NOP: { id: 19, slug: "new-orleans-pelicans" },
  NYK: { id: 20, slug: "new-york-knicks" },
  OKC: { id: 21, slug: "oklahoma-city-thunder" },
  ORL: { id: 22, slug: "orlando-magic" },
  PHI: { id: 23, slug: "philadelphia-76ers" },
  PHX: { id: 24, slug: "phoenix-suns" },
  POR: { id: 25, slug: "portland-trail-blazers" },
  SAC: { id: 26, slug: "sacramento-kings" },
  SAS: { id: 27, slug: "san-antonio-spurs" },
  TOR: { id: 28, slug: "toronto-raptors" },
  UTA: { id: 29, slug: "utah-jazz" },
  WAS: { id: 30, slug: "washington-wizards" }
};

// 2. The "Loose Bloodhound" Helper
// Recursively hunts for the draft picks array inside Fanspo's complex JSON
function findPicksInJSON(obj) {
  if (!obj || typeof obj !== 'object') return null;

  if (Array.isArray(obj) && obj.length > 0) {
    const sample = obj[0];
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

// 3. Worker Function for a Single Team
async function fetchTeamPicks(teamCode) {
  const team = TEAM_IDS[teamCode];
  const url = `https://fanspo.com/nba/teams/${team.slug}/${team.id}/draft-picks`;
  
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) return { team: teamCode, error: `Status ${res.status}` };

    const html = await res.text();
    const $ = cheerio.load(html);

    // Grab the JSON Payload directly
    const nextDataRaw = $('#__NEXT_DATA__').html();
    if (!nextDataRaw) return { team: teamCode, error: "No Data Payload" };

    const json = JSON.parse(nextDataRaw);
    const rawPicks = findPicksInJSON(json);

    if (!rawPicks) return { team: teamCode, error: "Structure changed" };

    // Clean and Format
    const cleanPicks = rawPicks
      .map(pick => {
        // Logic to determine if it is "Incoming" or "Own"
        // If the source team ID != this team's ID, it's from someone else
        let fromTeam = "Own";
        const sourceObj = pick.original_team || pick.from_team || pick.source_team;
        
        // Check ID mismatch to identify traded picks
        if (sourceObj && String(sourceObj.team_id) !== String(team.id)) {
           fromTeam = sourceObj.team_code || "Traded";
        } else if (pick.original_team_id && String(pick.original_team_id) !== String(team.id)) {
           fromTeam = "Traded";
        }

        let notes = pick.note || pick.description || pick.text || "-";
        notes = notes.replace("Protected ", "Prot ");

        return {
          year: parseInt(pick.season),
          round: pick.round,
          from: fromTeam,
          notes: notes
        };
      })
      .filter(p => p.year >= 2025) // Only future picks
      .sort((a, b) => a.year - b.year || a.round - b.round);

    return {
      team: teamCode,
      id: team.id,
      slug: team.slug,
      assets: cleanPicks
    };

  } catch (err) {
    return { team: teamCode, error: err.message };
  }
}

// 4. Main Route Handler
export async function GET() {
  const teamKeys = Object.keys(TEAM_IDS);
  
  // Fetch all 30 teams in parallel
  const allData = await Promise.all(teamKeys.map(key => fetchTeamPicks(key)));

  return NextResponse.json({
    count: allData.length,
    timestamp: new Date().toISOString(),
    teams: allData
  });
}
