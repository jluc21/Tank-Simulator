import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

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

// The "Bloodhound" Function: Finds the data wherever it hides
function findPicksInJSON(obj) {
  if (!obj || typeof obj !== 'object') return null;

  // Check if THIS object is the list of picks
  if (Array.isArray(obj) && obj.length > 0) {
    // A draft pick object always has 'season' and 'round'
    const sample = obj[0];
    if (sample && typeof sample === 'object' && 'season' in sample && 'round' in sample && 'original_team' in sample) {
      return obj;
    }
  }

  // If not, dig deeper into children
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = findPicksInJSON(obj[key]);
      if (result) return result;
    }
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get('team');

  if (!teamCode || !TEAM_IDS[teamCode]) {
    return NextResponse.json({ error: 'Invalid Team' }, { status: 400 });
  }

  try {
    const { id, slug } = TEAM_IDS[teamCode];
    const url = `https://fanspo.com/nba/teams/${slug}/${id}/draft-picks`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 0 } // No caching, always fresh
    });

    if (!res.ok) throw new Error(`Fanspo Error: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // Get the big data blob
    const nextDataRaw = $('#__NEXT_DATA__').html();
    if (!nextDataRaw) throw new Error("Could not find data payload");

    const json = JSON.parse(nextDataRaw);
    
    // RUN THE BLOODHOUND: Find the array automatically
    const draftPicks = findPicksInJSON(json);

    if (!draftPicks) {
      throw new Error("Picks data not found in JSON structure");
    }

    // Process the data
    let assets = draftPicks.map(pick => {
      let fromTeam = "Own";
      // Handle the nested team object safely
      if (pick.original_team && pick.original_team.team_code !== teamCode) {
        fromTeam = pick.original_team.team_code;
      }

      let notes = pick.note || "Unprotected";
      notes = notes.replace("Protected ", "Prot ");
      
      return {
        year: parseInt(pick.season),
        round: pick.round,
        from: fromTeam,
        notes: notes
      };
    });

    assets.sort((a, b) => a.year - b.year || a.round - b.round);

    return NextResponse.json({ 
      success: true, 
      data: assets, 
      source: 'Fanspo Smart-Scrape' 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
