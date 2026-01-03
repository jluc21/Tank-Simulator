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

// --- THE NEW "LOOSE" BLOODHOUND ---
// Finds any array where items have 'season' and 'round' (numbers)
// It stops caring about 'original_team' naming.
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
      next: { revalidate: 0 }
    });

    if (!res.ok) throw new Error(`Fanspo Error: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    const nextDataRaw = $('#__NEXT_DATA__').html();
    if (!nextDataRaw) throw new Error("No Data Payload Found");

    const json = JSON.parse(nextDataRaw);
    
    // RUN THE LOOSE SEARCH
    const draftPicks = findPicksInJSON(json);

    if (!draftPicks) {
      throw new Error("Picks data not found (Structure Unknown)");
    }

    // Process the data safely
    let assets = draftPicks.map(pick => {
      // 1. Try to find the "From" team using common names
      let fromTeam = "Own";
      // Check every possible property name for the source team
      const sourceObj = pick.original_team || pick.from_team || pick.source_team;
      
      if (sourceObj && sourceObj.team_code && sourceObj.team_code !== teamCode) {
        fromTeam = sourceObj.team_code;
      } else if (typeof pick.original_team_id === 'number' && pick.original_team_id !== id) {
        // Fallback: If we only have an ID, we assume it's a trade (simplification)
        fromTeam = "Traded"; 
      }

      // 2. Format Notes
      let notes = pick.note || pick.description || pick.text || "Unprotected";
      notes = notes.replace("Protected ", "Prot ");
      
      return {
        year: parseInt(pick.season),
        round: pick.round,
        from: fromTeam,
        notes: notes
      };
    });

    // Filter out past years (keep 2025+)
    assets = assets.filter(a => a.year >= 2025);
    
    assets.sort((a, b) => a.year - b.year || a.round - b.round);

    return NextResponse.json({ 
      success: true, 
      data: assets, 
      source: 'Fanspo Deep Search' 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
