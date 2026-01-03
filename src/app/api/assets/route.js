import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// Mapping team codes to their EXACT header names on RealGM
const REALGM_TEAM_HEADERS = {
  ATL: "Atlanta Hawks Future Traded Pick Details",
  BOS: "Boston Celtics Future Traded Pick Details",
  BKN: "Brooklyn Nets Future Traded Pick Details",
  CHA: "Charlotte Hornets Future Traded Pick Details",
  CHI: "Chicago Bulls Future Traded Pick Details",
  CLE: "Cleveland Cavaliers Future Traded Pick Details",
  DAL: "Dallas Mavericks Future Traded Pick Details",
  DEN: "Denver Nuggets Future Traded Pick Details",
  DET: "Detroit Pistons Future Traded Pick Details",
  GSW: "Golden State Warriors Future Traded Pick Details",
  HOU: "Houston Rockets Future Traded Pick Details",
  IND: "Indiana Pacers Future Traded Pick Details",
  LAC: "L.A. Clippers Future Traded Pick Details",
  LAL: "L.A. Lakers Future Traded Pick Details",
  MEM: "Memphis Grizzlies Future Traded Pick Details",
  MIA: "Miami Heat Future Traded Pick Details",
  MIL: "Milwaukee Bucks Future Traded Pick Details",
  MIN: "Minnesota Timberwolves Future Traded Pick Details",
  NOP: "New Orleans Pelicans Future Traded Pick Details",
  NYK: "New York Knicks Future Traded Pick Details",
  OKC: "Oklahoma City Thunder Future Traded Pick Details",
  ORL: "Orlando Magic Future Traded Pick Details",
  PHI: "Philadelphia Sixers Future Traded Pick Details",
  PHX: "Phoenix Suns Future Traded Pick Details",
  POR: "Portland Trail Blazers Future Traded Pick Details",
  SAC: "Sacramento Kings Future Traded Pick Details",
  SAS: "San Antonio Spurs Future Traded Pick Details",
  TOR: "Toronto Raptors Future Traded Pick Details",
  UTA: "Utah Jazz Future Traded Pick Details",
  WAS: "Washington Wizards Future Traded Pick Details"
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get('team');

  if (!teamCode || !REALGM_TEAM_HEADERS[teamCode]) {
    return NextResponse.json({ success: false, error: 'Invalid Team Code' }, { status: 400 });
  }

  const targetHeader = REALGM_TEAM_HEADERS[teamCode];

  try {
    // 1. Fetch the main "Detailed" page (One URL for everyone)
    const url = 'https://basketball.realgm.com/nba/draft/future_drafts/detailed';
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) throw new Error("Failed to fetch RealGM");

    const html = await res.text();
    const $ = cheerio.load(html);
    const picks = [];

    // 2. Locate the team's specific section
    // RealGM uses <h2> or <h3> headers for team names followed by the table.
    const header = $(`h2:contains("${targetHeader}"), h3:contains("${targetHeader}")`).first();
    const table = header.nextAll('table').first();

    if (!table.length) throw new Error("Could not find data table for team");

    // 3. Parse the table
    table.find('tbody tr').each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length >= 2) {
        const year = parseInt($(cols[0]).text().trim());
        const incomingContent = $(cols[1]).html() || ""; // HTML to preserve breaks

        if (!isNaN(year) && year >= 2026) {
          // RealGM often lists multiple picks in one cell separated by <br> or <div>
          // We split them into individual assets
          const items = incomingContent.split(/<br>|<div>/).filter(t => t.trim().length > 10);

          items.forEach(item => {
            const cleanText = $(`<span>${item}</span>`).text().trim();
            
            // Basic "From" extraction: look for team names or "from X"
            let from = "Own";
            const fromMatch = cleanText.match(/from\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/);
            if (fromMatch) from = fromMatch[1];
            
            // Determine round
            const round = cleanText.toLowerCase().includes("first round") ? 1 : 2;

            picks.push({
              year,
              round,
              from,
              notes: cleanText.replace(/\s+/g, ' ')
            });
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: picks,
      source: 'RealGM Detailed'
    });

  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
