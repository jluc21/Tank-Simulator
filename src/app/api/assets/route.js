import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// 1. Validated ID Map (SAS = 27)
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

  // Validate Request
  if (!teamCode || !TEAM_IDS[teamCode]) {
    return NextResponse.json({ success: false, error: 'Invalid Team Code' }, { status: 400 });
  }

  const team = TEAM_IDS[teamCode];
  const url = `https://fanspo.com/nba/teams/${team.slug}/${team.id}/draft-picks`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
        throw new Error(`Fanspo responded with ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const picks = [];

    // --- HTML TABLE PARSING ---
    $('table tbody tr').each((i, row) => {
      const cols = $(row).find('td');
      
      // Ensure row has enough columns (Year, Round, Pick, From, Notes)
      if (cols.length >= 5) {
        const yearTxt = $(cols[0]).text().trim();
        const year = parseInt(yearTxt);

        // Filter: Valid future year (2025+)
        if (!isNaN(year) && year >= 2025) {
            const round = $(cols[1]).text().trim();
            const pickNumStr = $(cols[2]).text().trim();
            const from = $(cols[3]).text().trim();
            let notes = $(cols[4]).text().trim();

            // Clean text
            notes = notes.replace("Protected ", "Prot ").replace(/[\n\r]+/g, " ");

            picks.push({
                year: year,
                round: round,
                from: from, // Used to distinguish between 'Own' and Traded picks
                notes: notes
            });
        }
      }
    });

    picks.sort((a, b) => a.year - b.year || a.round - b.round);

    // Return with success: true (Critical for your frontend)
    return NextResponse.json({
      success: true,
      data: picks,
      source: 'Fanspo Scraper'
    });

  } catch (error) {
    console.error(`Scrape Error [${teamCode}]:`, error);
    return NextResponse.json({ success: false, error: 'Failed to fetch draft data' }, { status: 500 });
  }
}
