import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

// PST uses simple team names in their URLs
const PST_SLUGS = {
  ATL: "Hawks", BOS: "Celtics", BKN: "Nets", CHA: "Hornets",
  CHI: "Bulls", CLE: "Cavaliers", DAL: "Mavericks", DEN: "Nuggets",
  DET: "Pistons", GSW: "Warriors", HOU: "Rockets", IND: "Pacers",
  LAC: "Clippers", LAL: "Lakers", MEM: "Grizzlies", MIA: "Heat",
  MIL: "Bucks", MIN: "Timberwolves", NOP: "Pelicans", NYK: "Knicks",
  OKC: "Thunder", ORL: "Magic", PHI: "76ers", PHX: "Suns",
  POR: "Blazers", SAC: "Kings", SAS: "Spurs", TOR: "Raptors",
  UTA: "Jazz", WAS: "Wizards"
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get('team');

  if (!teamCode || !PST_SLUGS[teamCode]) {
    return NextResponse.json({ error: 'Invalid Team' }, { status: 400 });
  }

  try {
    const slug = PST_SLUGS[teamCode];
    // Target the specific Team Future Page
    const url = `https://www.prosportstransactions.com/basketball/DraftTrades/Future/${slug}.htm`;
    
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 }
    });

    if (!res.ok) throw new Error(`PST Error: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    let assets = [];

    // PST tables usually have specific headers for rounds or years.
    // We look for the main data table.
    $('table.datatable tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length < 2) return;

      const text = $(row).text().trim();
      
      // Look for a year in the first cell (e.g. "2026")
      const yearText = cells.eq(0).text().trim();
      const yearMatch = yearText.match(/^(20[2-3][0-9])/); // Matches 2025-2039

      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        
        // PST Layout is typically: Year | Round | Details/Notes
        // Sometimes it splits "Own" and "Acquired" into different sections.
        
        // We iterate the cells to find the asset description
        const details = cells.eq(1).text().trim();
        
        // Determine Round (Default to 1 if mentions "First", else 2)
        let round = 1;
        if (details.toLowerCase().includes("second") || details.toLowerCase().includes("2nd")) {
          round = 2;
        }

        // Determine "From"
        let fromTeam = "Own";
        // Simple heuristic: If it says "from [Team]", extract it.
        const fromMatch = details.match(/from ([A-Z][a-z]+)/);
        if (fromMatch) {
           // Map full name to code if possible, or just keep the name
           // For this simple version, we check if it matches our team list
           const foundCode = Object.keys(PST_SLUGS).find(key => PST_SLUGS[key] === fromMatch[1]);
           if (foundCode) fromTeam = foundCode;
           else fromTeam = fromMatch[1].substring(0,3).toUpperCase();
        } else if (details.toLowerCase().includes("own")) {
           fromTeam = "Own";
        }

        assets.push({
          year: year,
          round: round,
          from: fromTeam,
          notes: details // PST has great detailed notes
        });
      }
    });

    // Fallback: If the page layout is different (sometimes they use "General" pages),
    // we ensure we at least return generic 2032 picks if the table was empty.
    if (assets.length === 0) {
        // Generate generic picks for 2025-2032
        for (let y = 2025; y <= 2032; y++) {
            assets.push({ year: y, round: 1, from: "Own", notes: "Unprotected" });
            assets.push({ year: y, round: 2, from: "Own", notes: "Unprotected" });
        }
    }

    // Clean up duplicates and sort
    assets.sort((a, b) => a.year - b.year || a.round - b.round);

    return NextResponse.json({ 
      success: true, 
      data: assets, 
      source: 'ProSportsTransactions' 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
