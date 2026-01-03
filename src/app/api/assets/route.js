import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Force dynamic to ensure we scrape live every time
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get('team');

  if (!teamCode || !TEAM_IDS[teamCode]) {
    return NextResponse.json({ error: 'Invalid Team' }, { status: 400 });
  }

  try {
    const { id, slug } = TEAM_IDS[teamCode];
    // Target Fanspo's Draft Picks Page
    const url = `https://fanspo.com/nba/teams/${slug}/${id}/draft-picks`;
    
    const res = await fetch(url, {
      headers: {
        // Look like a real Chrome browser to avoid blocks
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`Fanspo Error: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // THE HEIST: Extract the hidden JSON data Fanspo uses to hydrate the page
    const nextDataRaw = $('#__NEXT_DATA__').html();
    
    if (!nextDataRaw) {
      throw new Error("Could not find data payload");
    }

    const json = JSON.parse(nextDataRaw);
    const draftPicks = json?.props?.pageProps?.teamDraftPicks;

    if (!draftPicks || !Array.isArray(draftPicks)) {
      throw new Error("Data structure changed");
    }

    // Process the clean JSON data
    let assets = draftPicks.map(pick => {
      // Determine if it's "Own" or traded
      let fromTeam = "Own";
      if (pick.original_team && pick.original_team.team_code !== teamCode) {
        fromTeam = pick.original_team.team_code;
      }

      // Format the notes
      let notes = pick.note || "Unprotected";
      // Clean up common lengthy notes
      notes = notes.replace("Protected ", "Prot ");
      
      return {
        year: parseInt(pick.season),
        round: pick.round,
        from: fromTeam,
        notes: notes
      };
    });

    // Sort by Year -> Round
    assets.sort((a, b) => a.year - b.year || a.round - b.round);

    return NextResponse.json({ 
      success: true, 
      data: assets, 
      source: 'Fanspo Live Scrape' 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
