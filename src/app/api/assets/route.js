import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// Mapping team codes to their specific RealGM URL components
const TEAM_CONFIG = {
  ATL: { name: "Atlanta-Hawks", id: "1" },
  BOS: { name: "Boston-Celtics", id: "2" },
  BKN: { name: "Brooklyn-Nets", id: "3" },
  CHA: { name: "Charlotte-Hornets", id: "4" },
  CHI: { name: "Chicago-Bulls", id: "5" },
  CLE: { name: "Cleveland-Cavaliers", id: "6" },
  DAL: { name: "Dallas-Mavericks", id: "7" },
  DEN: { name: "Denver-Nuggets", id: "8" },
  DET: { name: "Detroit-Pistons", id: "9" },
  GSW: { name: "Golden-State-Warriors", id: "10" },
  HOU: { name: "Houston-Rockets", id: "11" },
  IND: { id: "12", name: "Indiana-Pacers" },
  LAC: { id: "13", name: "LA-Clippers" },
  LAL: { id: "14", name: "LA-Lakers" },
  MEM: { id: "15", name: "Memphis-Grizzlies" },
  MIA: { id: "16", name: "Miami-Heat" },
  MIL: { id: "17", name: "Milwaukee-Bucks" },
  MIN: { id: "18", name: "Minnesota-Timberwolves" },
  NOP: { id: "19", name: "New-Orleans-Pelicans" },
  NYK: { id: "20", name: "New-York-Knicks" },
  OKC: { id: "21", name: "Oklahoma-City-Thunder" },
  ORL: { id: "22", name: "Orlando-Magic" },
  PHI: { id: "22", name: "Philadelphia-Sixers" }, // Use RealGM's specific ID for Sixers
  PHX: { id: "24", name: "Phoenix-Suns" },
  POR: { id: "25", name: "Portland-Trail-Blazers" },
  SAC: { id: "26", name: "Sacramento-Kings" },
  SAS: { id: "27", name: "San-Antonio-Spurs" },
  TOR: { id: "28", name: "Toronto-Raptors" },
  UTA: { id: "29", name: "Utah-Jazz" },
  WAS: { id: "30", name: "Washington-Wizards" }
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get('team');

  if (!teamCode || !TEAM_CONFIG[teamCode]) {
    return NextResponse.json({ success: false, error: 'Invalid Team Code' }, { status: 400 });
  }

  const { name, id } = TEAM_CONFIG[teamCode];
  const url = `https://basketball.realgm.com/nba/teams/${name}/${id}/draft-picks`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) throw new Error(`RealGM responded with status: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const picks = [];

    // Targeting the table rows in the team-specific draft picks page
    $('.basketball tbody tr').each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length >= 2) {
        const year = parseInt($(cols[0]).text().trim());
        const info = $(cols[1]).text().trim();

        if (!isNaN(year) && year >= 2026) {
          // Identify round and source
          const round = info.toLowerCase().includes("1st") ? "1" : "2";
          let source = "Own";
          if (info.includes("from")) {
            const match = info.match(/from\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/);
            source = match ? match[1] : "Traded";
          }

          picks.push({
            year,
            rnd: round,
            source: source,
            notes: info.replace(/\s+/g, ' ')
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: picks
    });

  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
