import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// --- CONFIGURATION ---
// Revalidate once every 24 hours (86400 seconds)
// This makes us a "Good Citizen" bot that won't get banned.
export const revalidate = 86400; 

export async function GET() {
  try {
    // Fetch the "Detailed" ledger which has ALL picks for ALL teams
    const res = await fetch('https://basketball.realgm.com/nba/draft/future_drafts/detailed', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) throw new Error('RealGM Unreachable');
    const html = await res.text();
    const $ = cheerio.load(html);
    const assets = {};

    // RealGM Structure: <h2>Team Name</h2> ... <ul><li>Pick Details</li></ul>
    $('h2').each((i, header) => {
      const headerText = $(header).text();
      if (headerText.includes("Future Draft Pick Details")) {
        const teamName = headerText.replace(" Future Draft Pick Details", "").trim();
        const teamCode = getTeamCode(teamName);
        
        if (teamCode) {
          assets[teamCode] = [];
          
          // Find the list of picks following this header
          let nextElem = $(header).next();
          while (nextElem.length && !nextElem.is('h2')) {
            if (nextElem.is('ul')) {
              nextElem.find('li').each((j, li) => {
                const rawText = $(li).text();
                const cleanPick = parseRealGMText(rawText);
                if (cleanPick) {
                  assets[teamCode].push(cleanPick);
                }
              });
            }
            nextElem = nextElem.next();
          }
        }
      }
    });

    return NextResponse.json(assets);

  } catch (error) {
    console.error("Scraper Failed:", error);
    return NextResponse.json({ error: 'Failed to scrape' }, { status: 500 });
  }
}

// --- HELPER: MAP FULL NAMES TO CODES ---
function getTeamCode(name) {
  const map = {
    "Atlanta Hawks": "ATL", "Boston Celtics": "BOS", "Brooklyn Nets": "BKN", "Charlotte Hornets": "CHA",
    "Chicago Bulls": "CHI", "Cleveland Cavaliers": "CLE", "Dallas Mavericks": "DAL", "Denver Nuggets": "DEN",
    "Detroit Pistons": "DET", "Golden State Warriors": "GSW", "Houston Rockets": "HOU", "Indiana Pacers": "IND",
    "Los Angeles Clippers": "LAC", "Los Angeles Lakers": "LAL", "Memphis Grizzlies": "MEM", "Miami Heat": "MIA",
    "Milwaukee Bucks": "MIL", "Minnesota Timberwolves": "MIN", "New Orleans Pelicans": "NOP", "New York Knicks": "NYK",
    "Oklahoma City Thunder": "OKC", "Orlando Magic": "ORL", "Philadelphia 76ers": "PHI", "Phoenix Suns": "PHX",
    "Portland Trail Blazers": "POR", "Sacramento Kings": "SAC", "San Antonio Spurs": "SAS", "Toronto Raptors": "TOR",
    "Utah Jazz": "UTA", "Washington Wizards": "WAS"
  };
  return map[name];
}

// --- HELPER: CLEAN UP THE MESSY TEXT ---
function parseRealGMText(text) {
  // 1. Extract Year
  const yearMatch = text.match(/^(\d{4})/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[1]);
  if (year < 2026) return null; // Ignore old picks

  // 2. Extract Round
  const isFirst = text.toLowerCase().includes("first round");
  const isSecond = text.toLowerCase().includes("second round");
  if (!isFirst && !isSecond) return null;

  // 3. Smart "From" Detection
  // If it says "To [TEAM]", it's an outgoing pick (we ignore those for the asset list)
  // We want picks the team OWNS.
  
  // Logic: RealGM lists "Details" for a team. 
  // If the text starts with "2026 first round draft pick from...", it's incoming.
  // If it says "2026 first round draft pick to...", it's outgoing.
  
  let from = "Own";
  let notes = "Unprotected";

  if (text.includes("from")) {
    // Example: "2027 first round draft pick from Milwaukee"
    const fromMatch = text.match(/from ([A-Za-z\s]+)/);
    if (fromMatch) {
      from = fromMatch[1].replace("the", "").trim();
      // Shorten names
      from = shortenTeamName(from);
    }
  }

  // 4. Simplify the Notes (The "Fanspo" Look)
  if (text.toLowerCase().includes("swap")) {
    notes = "Swap Rights";
  } else if (text.toLowerCase().includes("protected")) {
    // Extract protection range if possible
    const protMatch = text.match(/top\s(\d+)\s/i) || text.match(/(\d+)-(\d+)/);
    notes = protMatch ? `Protected ${protMatch[0]}` : "Protected";
  } else {
    notes = ""; // Clean look for own picks
  }

  // Detect specific messy situations
  if (text.includes("least favorable")) notes += " (Least Favorable)";
  if (text.includes("most favorable")) notes += " (Most Favorable)";

  return {
    year,
    round: isFirst ? 1 : 2,
    from,
    notes: notes.substring(0, 40) // Keep it short for the table
  };
}

function shortenTeamName(name) {
  const map = {
    "Philadelphia": "PHI", "Milwaukee": "MIL", "Chicago": "CHI", "Cleveland": "CLE",
    "Boston": "BOS", "L.A. Clippers": "LAC", "L.A. Lakers": "LAL", "Memphis": "MEM",
    "Atlanta": "ATL", "Miami": "MIA", "Charlotte": "CHA", "Utah": "UTA",
    "Sacramento": "SAC", "New York": "NYK", "Los Angeles Lakers": "LAL", "Los Angeles Clippers": "LAC",
    "San Antonio": "SAS", "Oklahoma City": "OKC", "Portland": "POR", "Minnesota": "MIN",
    "Detroit": "DET", "Indiana": "IND", "Denver": "DEN", "Dallas": "DAL", "Phoenix": "PHX",
    "Houston": "HOU", "New Orleans": "NOP", "Washington": "WAS", "Golden State": "GSW",
    "Orlando": "ORL", "Toronto": "TOR", "Brooklyn": "BKN"
  };
  return map[name] || name;
}
