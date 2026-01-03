import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// CONFIGURATION: Revalidate every 2 hours
export const revalidate = 7200; 

// Fanspo uses specific IDs for teams. We map your "SAS" code to their ID/Slug.
const FANSPO_TEAMS = {
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

  if (!teamCode || !FANSPO_TEAMS[teamCode]) {
    return NextResponse.json({ error: 'Invalid Team Code' }, { status: 400 });
  }

  try {
    // 1. Target the Fanspo Draft Picks Page
    const { id, slug } = FANSPO_TEAMS[teamCode];
    const url = `https://fanspo.com/nba/teams/${slug}/${id}/draft-picks`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 7200 }
    });

    if (!res.ok) throw new Error(`Fanspo responded with ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // 2. THE HEIST: Grab the hidden Next.js Data Blob
    // Fanspo stores all page data in this script tag. It's clean JSON.
    const jsonRaw = $('#__NEXT_DATA__').html();
    
    if (!jsonRaw) {
      throw new Error("Could not find Fanspo data blob. They may have changed their site structure.");
    }

    const jsonData = JSON.parse(jsonRaw);
    
    // 3. Navigate the JSON tree to find the picks
    // Structure usually: props -> pageProps -> teamDraftPicks
    const picksData = jsonData?.props?.pageProps?.teamDraftPicks;

    if (!picksData || !Array.isArray(picksData)) {
      // Fallback: Sometimes it's under 'team' -> 'draftPicks'
      const altData = jsonData?.props?.pageProps?.team?.draftPicks;
      if (!altData) throw new Error("Data parsing failed. JSON structure changed.");
      return NextResponse.json(cleanFanspoData(altData));
    }

    return NextResponse.json(cleanFanspoData(picksData));

  } catch (error) {
    console.error("Fanspo Scraper Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- CLEANUP HELPER ---
// Fanspo's raw JSON has a lot of noise. We sanitize it for your table.
function cleanFanspoData(rawPicks) {
  return rawPicks.map(p => {
    // Determine the "From" team
    let from = "Own";
    if (p.original_team && p.original_team.team_code) {
      // If original team is different from current owner, show it
      // Note: We need to know who "we" are to say "Own", but usually Fanspo handles this logic.
      // We will trust their "text" description often found in 'note'
      from = p.original_team.team_abbreviation;
    }

    // Logic for incoming vs own
    // Fanspo usually lists everything the team OWNS.
    
    // Extract Protections/Notes
    let notes = p.note || "";
    
    // Clean up "Unprotected" if it's redundant
    if (!notes && from !== "Own") notes = "Unprotected"; 
    
    // Clean up Year
    const year = parseInt(p.season);

    return {
      year,
      round: p.round,
      from: from, // e.g. "SAS" or "MIL"
      notes: notes.substring(0, 60), // Keep it short
      pickNum: p.overall_pick || "-"
    };
  }).sort((a, b) => a.year - b.year || a.round - b.round);
}
