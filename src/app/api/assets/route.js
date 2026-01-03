import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// FORCE DYNAMIC: No caching. This ensures you see changes INSTANTLY.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TEAM_MAP = {
  ATL: { id: 1, slug: "Atlanta-Hawks" },
  BOS: { id: 2, slug: "Boston-Celtics" },
  BKN: { id: 38, slug: "Brooklyn-Nets" },
  CHA: { id: 3, slug: "Charlotte-Hornets" },
  CHI: { id: 4, slug: "Chicago-Bulls" },
  CLE: { id: 5, slug: "Cleveland-Cavaliers" },
  DAL: { id: 6, slug: "Dallas-Mavericks" },
  DEN: { id: 7, slug: "Denver-Nuggets" },
  DET: { id: 8, slug: "Detroit-Pistons" },
  GSW: { id: 9, slug: "Golden-State-Warriors" },
  HOU: { id: 10, slug: "Houston-Rockets" },
  IND: { id: 11, slug: "Indiana-Pacers" },
  LAC: { id: 12, slug: "Los-Angeles-Clippers" },
  LAL: { id: 13, slug: "Los-Angeles-Lakers" },
  MEM: { id: 14, slug: "Memphis-Grizzlies" },
  MIA: { id: 15, slug: "Miami-Heat" },
  MIL: { id: 16, slug: "Milwaukee-Bucks" },
  MIN: { id: 17, slug: "Minnesota-Timberwolves" },
  NOP: { id: 18, slug: "New-Orleans-Pelicans" },
  NYK: { id: 19, slug: "New-York-Knicks" },
  OKC: { id: 25, slug: "Oklahoma-City-Thunder" },
  ORL: { id: 21, slug: "Orlando-Magic" },
  PHI: { id: 22, slug: "Philadelphia-Sixers" },
  PHX: { id: 23, slug: "Phoenix-Suns" },
  POR: { id: 24, slug: "Portland-Trail-Blazers" },
  SAC: { id: 26, slug: "Sacramento-Kings" },
  SAS: { id: 27, slug: "San-Antonio-Spurs" },
  TOR: { id: 28, slug: "Toronto-Raptors" },
  UTA: { id: 29, slug: "Utah-Jazz" },
  WAS: { id: 30, slug: "Washington-Wizards" }
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get('team');

  if (!teamCode || !TEAM_MAP[teamCode]) {
    return NextResponse.json({ error: 'Invalid Team Code' }, { status: 400 });
  }

  try {
    const { id, slug } = TEAM_MAP[teamCode];
    const url = `https://basketball.realgm.com/nba/teams/${slug}/${id}/draft_picks`;
    
    // FETCH WITH BROWSER HEADERS
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      cache: 'no-store'
    });

    if (!res.ok) throw new Error(`RealGM Error: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // INITIALIZE LEDGER (Assume they own everything)
    let assets = [];
    for (let y = 2026; y <= 2032; y++) {
      assets.push({ year: y, round: 1, from: "Own", notes: "Unprotected", original: true });
      assets.push({ year: y, round: 2, from: "Own", notes: "Unprotected", original: true });
    }

    // FIND THE SPECIFIC TABLE BY HEADER TEXT
    let targetTable = null;
    $('h2').each((i, el) => {
      if ($(el).text().includes("Future Traded Pick Details")) {
        targetTable = $(el).next('div').find('table'); // RealGM often wraps tables in divs
        if (targetTable.length === 0) targetTable = $(el).next('table');
      }
    });

    if (!targetTable) {
        // Fallback: Just grab the second table on the page (usually the trade table)
        targetTable = $('table').eq(1); 
    }

    // PARSE ROWS
    targetTable.find('tr').each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length < 3) return; // Need Year | Incoming | Outgoing

      const year = parseInt(cols.eq(0).text().trim());
      if (isNaN(year) || year < 2026 || year > 2032) return;

      const incoming = cols.eq(1).text().trim();
      const outgoing = cols.eq(2).text().trim();

      // LOGIC: PROCESS OUTGOING
      if (outgoing && !outgoing.includes("No picks outgoing")) {
        const isFirst = outgoing.toLowerCase().includes("first round");
        const round = isFirst ? 1 : 2;
        const idx = assets.findIndex(a => a.year === year && a.round === round && a.original);
        
        if (idx !== -1) {
          if (outgoing.toLowerCase().includes("swap")) {
            assets[idx].notes = `Subject to Swap (${extractTeam(outgoing)})`;
          } else {
            assets.splice(idx, 1); // Delete traded pick
          }
        }
      }

      // LOGIC: PROCESS INCOMING
      if (incoming && !incoming.includes("No picks incoming")) {
        const picks = splitPicks(incoming);
        picks.forEach(pText => {
          const isFirst = pText.toLowerCase().includes("first round");
          const round = isFirst ? 1 : 2;
          
          if (pText.toLowerCase().includes("swap")) {
            const idx = assets.findIndex(a => a.year === year && a.round === round && a.original);
            if (idx !== -1) {
               assets[idx].notes = (assets[idx].notes === "Unprotected") 
                  ? `Swap Rights (${extractTeam(pText)})` 
                  : `${assets[idx].notes} & Swap (${extractTeam(pText)})`;
            }
          } else {
            assets.push({
              year,
              round,
              from: extractTeam(pText),
              notes: extractProtections(pText),
              original: false
            });
          }
        });
      }
    });

    assets.sort((a, b) => a.year - b.year || a.round - b.round);
    return NextResponse.json({ success: true, data: assets, source: url });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

// HELPERS
function splitPicks(text) {
  return text.split(/(?=\d{4} (?:first|second) round)/).filter(t => t.length > 10);
}
function extractTeam(text) {
  const match = text.match(/from ([A-Z][a-z]+)/);
  return match ? match[1].substring(0,3).toUpperCase() : "Trade";
}
function extractProtections(text) {
  if (text.includes("unprotected")) return "Unprotected";
  const m = text.match(/protected [0-9-]+/);
  return m ? m[0] : "Acquired via Trade";
}
