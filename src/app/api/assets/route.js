import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// 1. Team ID Map (Verified)
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
    return NextResponse.json({ success: false, error: 'Invalid Team Code' }, { status: 400 });
  }

  const team = TEAM_IDS[teamCode];
  const url = `https://fanspo.com/nba/teams/${team.slug}/${team.id}/draft-picks`;

  try {
    // 2. Fetch with "Real Browser" Headers
    // This tricks Fanspo/Cloudflare into thinking we are a real user, not a bot.
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://google.com',
        'Upgrade-Insecure-Requests': '1'
      },
      next: { revalidate: 3600 } 
    });

    if (!res.ok) throw new Error(`Status: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const picks = [];

    // Check if we got blocked (Cloudflare usually changes the title)
    const pageTitle = $('title').text();
    if (pageTitle.includes("Just a moment") || pageTitle.includes("Security")) {
      throw new Error("Bot detection triggered (Cloudflare)");
    }

    // 3. "Loose" Parsing Logic
    // Instead of counting strict columns, we look for rows that look like draft picks.
    $('tr').each((i, row) => {
      const txt = $(row).text().trim();
      // Only process rows that contain a future year (2025-2031)
      if (txt.match(/202[5-9]|203[0-1]/)) {
        
        const cols = $(row).find('td');
        if (cols.length >= 4) { // Accepted minimum columns
          const col0 = $(cols[0]).text().trim(); // Year
          const col1 = $(cols[1]).text().trim(); // Round
          const col2 = $(cols[2]).text().trim(); // Pick # (or source)
          const col3 = $(cols[3]).text().trim(); // Source (or notes)
          const col4 = $(cols[4]).text().trim(); // Notes (if exists)

          const year = parseInt(col0);
          
          if (!isNaN(year) && year >= 2025) {
            // Normalize data: sometimes column 2 is Pick#, sometimes it's "-"
            let from = col3 || col2; 
            let notes = col4 || col3;

            // Simple heuristic to clean "From"
            if (from.length > 20) from = "See Notes"; 

            // Clean Notes
            if (notes) notes = notes.replace("Protected ", "Prot ").replace(/[\n\r]+/g, " ");
            else notes = "-";

            picks.push({
              year,
              round: col1,
              from: from,
              notes: notes
            });
          }
        }
      }
    });

    picks.sort((a, b) => a.year - b.year || a.round - b.round);

    return NextResponse.json({
      success: true,
      data: picks,
      debug: {
        matches: picks.length,
        title: pageTitle, // Helps debug if we are on the wrong page
        url: url
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      hint: "If error is 'Bot detection', wait 5 mins or run locally."
    }, { status: 500 });
  }
}
