import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// CONFIGURATION: Revalidate every 4 hours (14400 seconds).
// Fast enough to fix bugs same-day, slow enough to avoid IP bans.
export const revalidate = 14400; 

// RealGM Team IDs (Required for their specific URL structure)
const TEAM_IDS = {
  ATL: 1, BOS: 2, BKN: 38, CHA: 3, CHI: 4, CLE: 5, DAL: 6, DEN: 7, DET: 8, GSW: 9,
  HOU: 10, IND: 11, LAC: 12, LAL: 13, MEM: 14, MIA: 15, MIL: 16, MIN: 17, NOP: 18, NYK: 19,
  OKC: 25, ORL: 21, PHI: 22, PHX: 23, POR: 24, SAC: 26, SAS: 27, TOR: 28, UTA: 29, WAS: 30
};

const TEAM_SLUGS = {
  ATL: "Atlanta-Hawks", BOS: "Boston-Celtics", BKN: "Brooklyn-Nets", CHA: "Charlotte-Hornets",
  CHI: "Chicago-Bulls", CLE: "Cleveland-Cavaliers", DAL: "Dallas-Mavericks", DEN: "Denver-Nuggets",
  DET: "Detroit-Pistons", GSW: "Golden-State-Warriors", HOU: "Houston-Rockets", IND: "Indiana-Pacers",
  LAC: "Los-Angeles-Clippers", LAL: "Los-Angeles-Lakers", MEM: "Memphis-Grizzlies", MIA: "Miami-Heat",
  MIL: "Milwaukee-Bucks", MIN: "Minnesota-Timberwolves", NOP: "New-Orleans-Pelicans", NYK: "New-York-Knicks",
  OKC: "Oklahoma-City-Thunder", ORL: "Orlando-Magic", PHI: "Philadelphia-Sixers", PHX: "Phoenix-Suns",
  POR: "Portland-Trail-Blazers", SAC: "Sacramento-Kings", SAS: "San-Antonio-Spurs", TOR: "Toronto-Raptors",
  UTA: "Utah-Jazz", WAS: "Washington-Wizards"
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get('team');

  if (!teamCode || !TEAM_IDS[teamCode]) {
    return NextResponse.json({ error: 'Invalid Team' }, { status: 400 });
  }

  try {
    // 1. Construct the RealGM Team Page URL
    const slug = TEAM_SLUGS[teamCode];
    const id = TEAM_IDS[teamCode];
    const url = `https://basketball.realgm.com/nba/teams/${slug}/${id}/draft_picks`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!res.ok) throw new Error('RealGM Unreachable');
    const html = await res.text();
    const $ = cheerio.load(html);

    // 2. INITIALIZE THE LEDGER (2026-2032)
    // Start by assuming the team owns ALL their own picks initially.
    let assets = [];
    for (let year = 2026; year <= 2032; year++) {
      assets.push({ year, round: 1, from: "Own", notes: "Unprotected", original: true });
      assets.push({ year, round: 2, from: "Own", notes: "Unprotected", original: true });
    }

    // 3. PARSE THE TABLE (Incoming / Outgoing Logic)
    // Look for the "Future Traded Pick Details" table
    $('.basketball.compact tbody tr').each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length < 3) return; // Skip invalid rows

      const yearText = cols.eq(0).text().trim();
      const year = parseInt(yearText);
      
      if (year >= 2026 && year <= 2032) {
        const incomingText = cols.eq(1).text().trim();
        const outgoingText = cols.eq(2).text().trim();

        // --- A: PROCESS OUTGOING (Subtract or Swap) ---
        if (outgoingText && !outgoingText.includes("No picks outgoing")) {
          const isFirst = outgoingText.toLowerCase().includes("first round");
          const round = isFirst ? 1 : 2; 

          // Find the "Own" pick for this year/round
          const index = assets.findIndex(a => a.year === year && a.round === round && a.original);
          
          if (index !== -1) {
            // SCENARIO 1: SWAP (Keep the pick, but mark it)
            if (outgoingText.toLowerCase().includes("swap")) {
               assets[index].notes = `Subject to Swap (${extractSwapPartner(outgoingText)})`;
            } 
            // SCENARIO 2: TRADED AWAY (Delete the pick)
            else {
               assets.splice(index, 1); 
            }
          }
        }

        // --- B: PROCESS INCOMING (Add or Upgrade) ---
        if (incomingText && !incomingText.includes("No picks incoming")) {
          const picks = splitIncomingPicks(incomingText);
          
          picks.forEach(pickDesc => {
            const isFirst = pickDesc.toLowerCase().includes("first round");
            const round = isFirst ? 1 : 2;
            
            // Check if this is a Swap RIGHT (upgrading an existing pick)
            if (pickDesc.toLowerCase().includes("swap")) {
               const ownIndex = assets.findIndex(a => a.year === year && a.round === round && a.original);
               if (ownIndex !== -1) {
                 // Append the swap right to the existing pick
                 const currentNote = assets[ownIndex].notes === "Unprotected" ? "" : assets[ownIndex].notes + " & ";
                 assets[ownIndex].notes = `${currentNote}Swap Rights (${extractFromTeam(pickDesc)})`;
               }
            } else {
               // It is a pure extra pick. Add it to the list.
               assets.push({
                 year,
                 round,
                 from: extractFromTeam(pickDesc),
                 notes: extractProtections(pickDesc),
                 original: false
               });
            }
          });
        }
      }
    });

    // 4. SORT FINAL LIST
    assets.sort((a, b) => a.year - b.year || a.round - b.round);

    return NextResponse.json(assets);

  } catch (error) {
    console.error("Scraper Error:", error);
    return NextResponse.json({ error: 'Failed to scrape' }, { status: 500 });
  }
}

// --- PARSING HELPERS ---

function splitIncomingPicks(text) {
  // Use a regex to split multiple picks in one cell
  // Splits on common delimiters or the start of a new pick description
  return text.split(/(?=\d{4} (?:first|second) round draft pick)/g)
             .map(s => s.trim())
             .filter(s => s.length > 10);
}

function extractFromTeam(text) {
  const match = text.match(/from ([A-Za-z0-9 .]+)/);
  if (match) {
    const rawName = match[1].replace("the", "").trim().split(" ")[0];
    return shortenName(rawName);
  }
  return "Trade";
}

function extractSwapPartner(text) {
  const match = text.match(/to ([A-Za-z0-9 .]+)/);
  return match ? shortenName(match[1].split(" ")[0]) : "Unknown";
}

function extractProtections(text) {
  const rangeMatch = text.match(/selections? (\d+-\d+)/);
  if (rangeMatch) return `Protected ${rangeMatch[1]}`;
  
  if (text.toLowerCase().includes("unprotected")) return "Unprotected";
  if (text.toLowerCase().includes("least favorable")) return "Least Favorable";
  
  return "Acquired via Trade"; 
}

function shortenName(name) {
  const map = {
    "Philadelphia": "PHI", "Milwaukee": "MIL", "Chicago": "CHI", "Cleveland": "CLE",
    "Boston": "BOS", "L.A.": "LAC", "Memphis": "MEM", "Atlanta": "ATL", 
    "Miami": "MIA", "Charlotte": "CHA", "Utah": "UTA", "Sacramento": "SAC", 
    "New": "NYK", "San": "SAS", "Oklahoma": "OKC", "Portland": "POR", 
    "Minnesota": "MIN", "Detroit": "DET", "Indiana": "IND", "Denver": "DEN", 
    "Dallas": "DAL", "Phoenix": "PHX", "Houston": "HOU", "Washington": "WAS", 
    "Golden": "GSW", "Orlando": "ORL", "Toronto": "TOR", "Brooklyn": "BKN"
  };
  return map[name] || name.substring(0, 3).toUpperCase();
}
