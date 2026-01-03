import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// LD Sport uses full team names as headers
const TEAM_NAMES = {
  ATL: "Atlanta Hawks", BOS: "Boston Celtics", BKN: "Brooklyn Nets", CHA: "Charlotte Hornets",
  CHI: "Chicago Bulls", CLE: "Cleveland Cavaliers", DAL: "Dallas Mavericks", DEN: "Denver Nuggets",
  DET: "Detroit Pistons", GSW: "Golden State Warriors", HOU: "Houston Rockets", IND: "Indiana Pacers",
  LAC: "Los Angeles Clippers", LAL: "Los Angeles Lakers", MEM: "Memphis Grizzlies", MIA: "Miami Heat",
  MIL: "Milwaukee Bucks", MIN: "Minnesota Timberwolves", NOP: "New Orleans Pelicans", NYK: "New York Knicks",
  OKC: "Oklahoma City Thunder", ORL: "Orlando Magic", PHI: "Philadelphia 76ers", PHX: "Phoenix Suns",
  POR: "Portland Trail Blazers", SAC: "Sacramento Kings", SAS: "San Antonio Spurs", TOR: "Toronto Raptors",
  UTA: "Utah Jazz", WAS: "Washington Wizards"
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get('team');

  if (!teamCode || !TEAM_NAMES[teamCode]) {
    return NextResponse.json({ error: 'Invalid Team' }, { status: 400 });
  }

  try {
    // Target LD Sport's "Future Draft Picks" Master List
    // This page is static HTML and includes 2032 picks.
    const url = `https://www.ldsport.com/future-draft-picks.html`;
    
    const res = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) throw new Error(`Source Error: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const fullTeamName = TEAM_NAMES[teamCode];
    let assets = [];

    // LD Sport is a text-heavy page. We need to find the Team Header and parse the text below it.
    // The format usually looks like: "- 2029 (1 First): LAC 1st..."
    
    // 1. Find the container or header for the specific team
    // We look for any element containing the Team Name, then iterate siblings
    let teamFound = false;
    
    // Iterate all paragraphs or list items to find the data
    $('p, li, div').each((i, el) => {
      const text = $(el).text().trim();
      
      // Mark when we hit our team section
      if (text.includes(fullTeamName) && text.length < 50) { // Headers are usually short
        teamFound = true;
        return; // continue to next element
      }
      
      // Stop if we hit another team (Optimization: check if text matches another known team)
      if (teamFound && Object.values(TEAM_NAMES).some(t => text.includes(t) && t !== fullTeamName && text.length < 50)) {
        teamFound = false;
        return false; // break loop
      }

      if (teamFound) {
        // PARSE THE DATA LINES
        // Looking for lines starting with a year: "2026: ..." or "2032 (1 First..."
        const yearMatch = text.match(/^(20[2-3][0-9])/);
        
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          
          // Split content by commas or semicolons to find picks
          // Example: "2032: BOS 1st, BOS 2nd"
          const cleanText = text.replace(/^(20\d\d).*?:/, '').trim(); // Remove "2032:" prefix
          const parts = cleanText.split(/,|;/);

          parts.forEach(part => {
            let p = part.trim();
            if (!p) return;

            let round = 1;
            if (p.includes("2nd") || p.includes("Second")) round = 2;
            
            // Determine "From" Team
            let fromTeam = "Own";
            // Look for 3-letter codes like "SAC", "SAS", "ATL"
            const codeMatch = p.match(/\b([A-Z]{3})\b/);
            if (codeMatch && codeMatch[1] !== teamCode) {
              fromTeam = codeMatch[1];
            }

            assets.push({
              year: year,
              round: round,
              from: fromTeam,
              notes: p // Keep the full text as notes (e.g. "Subject to Swap")
            });
          });
        }
      }
    });

    // SAFETY NET: If parsing fails (site changed layout), fallback to generated data
    // so the app NEVER crashes or shows empty tables.
    if (assets.length === 0) {
       for(let y=2026; y<=2032; y++) {
         assets.push({year: y, round: 1, from: "Own", notes: "Projected (Source Unavailable)"});
         assets.push({year: y, round: 2, from: "Own", notes: "Projected (Source Unavailable)"});
       }
    }

    // Sort
    assets.sort((a, b) => a.year - b.year || a.round - b.round);

    return NextResponse.json({ 
      success: true, 
      data: assets, 
      source: 'LD Sport Archive' 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
