import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// 1. The ID List (Maps your dropdown codes to Fanspo IDs)
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

export async function GET(request) {
  // 1. READ THE QUERY PARAM (e.g., ?team=SAC)
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get('team');

  // If no team is selected, return an error or an empty state
  if (!teamCode || !TEAM_IDS[teamCode]) {
    return NextResponse.json({ error: 'Please select a valid team code (e.g. ?team=SAC)' }, { status: 400 });
  }

  const team = TEAM_IDS[teamCode];
  const url = `https://fanspo.com/nba/teams/${team.slug}/${team.id}/draft-picks`;

  try {
    // 2. Fetch only the ONE requested team
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) throw new Error(`Fanspo Error: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // 3. Robust JSON Parsing (The "Bloodhound" method)
    const nextDataRaw = $('#__NEXT_DATA__').html();
    if (!nextDataRaw) throw new Error("No Data Payload Found");

    const json = JSON.parse(nextDataRaw);
    const rawPicks = findPicksInJSON(json);

    if (!rawPicks) throw new Error("Picks data structure not found");

    // 4. Process the data
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

    return NextResponse.json({
      team: teamCode,
      data: cleanPicks
    });

  } catch (error) {
    console.error(`Error fetching ${teamCode}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
