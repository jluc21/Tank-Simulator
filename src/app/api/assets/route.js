import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// 1. Validated ID Map
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

  // Validate Input
  if (!teamCode || !TEAM_IDS[teamCode]) {
    return NextResponse.json({ success: false, error: 'Invalid Team Code' }, { status: 400 });
  }

  const team = TEAM_IDS[teamCode];
  const url = `https://fanspo.com/nba/teams/${team.slug}/${team.id}/draft-picks`;

  try {
    // 2. Fetch with Heavy Anti-Bot Headers
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1'
      },
      next: { revalidate: 0 } // Disable Vercel Cache for debugging
    });

    if (!res.ok) throw new Error(`Fanspo Status: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    let picks = [];

    // --- DIAGNOSTIC: Check if we are blocked ---
    const pageTitle = $('title').text().trim();
    const isBlocked = pageTitle.includes("Just a moment") || pageTitle.includes("Security") || pageTitle.includes("Attention Required");

    if (isBlocked) {
       console.error("BLOCKED BY CLOUDFLARE");
       // Return a fake "empty" response with a special error note so the frontend doesn't crash
       return NextResponse.json({
         success: false,
         error: "Cloudflare Blocked Request",
         debug: { title: pageTitle }
       });
    }

    // --- STRATEGY A: Standard Table Scrape ---
    // Look for ANY table row, ignoring tbody/thead distinction
    $('tr').each((i, row) => {
      const cols = $(row).find('td');
      // Must have at least 4 columns to be a pick row
      if (cols.length >= 4) {
         const yearTxt = $(cols[0]).text().trim();
         // Check if the first column is a year 2025-2032
         if (/^20(2[5-9]|3[0-2])$/.test(yearTxt)) {
            const year = parseInt(yearTxt);
            const round = $(cols[1]).text().trim();
            const from = $(cols[3]).text().trim(); 
            let notes = $(cols[4]).text().trim();
            
            // Fallback for "From" column if table structure is weird
            const source = from || "Check Notes";
            if (!notes) notes = "-";
            notes = notes.replace("Protected ", "Prot ").replace(/[\n\r]+/g, " ");

            picks.push({ year, round, from: source, notes });
         }
      }
    });

    // --- STRATEGY B: The "Nuclear" Regex Fallback ---
    // If table scrape failed (0 picks) but we aren't blocked, try regex on the raw text.
    // This helps if they used <div>s instead of <table>s.
    if (picks.length === 0) {
      const bodyText = $('body').text();
      // Look for patterns like "2025 1 -" or "2025 Round 1"
      // This is a simplified regex to catch the raw text format seen on Fanspo
      const regex = /(202[5-9]|203[0-2])\s+([12])\s+(-|[A-Z]{3}|[a-zA-Z\s]+)\s+(.*?)(?=202[5-9]|203[0-2]|$)/gm;
      
      let match;
      while ((match = regex.exec(bodyText)) !== null) {
        // Simple sanity check: line shouldn't be too long (avoid capturing articles)
        if (match[0].length < 200) {
            picks.push({
                year: parseInt(match[1]),
                round: match[2],
                from: "Extracted", // Regex can't reliably get the "From" column structure
                notes: match[4].trim().substring(0, 50) + "..."
            });
        }
      }
    }

    // Sort
    picks.sort((a, b) => a.year - b.year || a.round - b.round);

    return NextResponse.json({
      success: true,
      data: picks,
      source: 'Fanspo',
      debug: {
        matches: picks.length,
        title: pageTitle, // This will tell us if we are on the right page
        scraped_url: url
      }
    });

  } catch (error) {
    console.error("Scrape Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
