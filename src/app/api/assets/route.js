import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET() {
  // The URL from your screenshot
  // Note: '2' is likely the specific ID for the Spurs in Fanspo's database.
  const url = 'https://fanspo.com/nba/teams/Spurs/2/draft-picks';

  try {
    // 1. Fetch the HTML with a User-Agent to avoid being blocked
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 3600 } // Cache this for 1 hour so you don't spam their server
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Fanspo: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const picks = [];

    // 2. Locate the "Incoming Draft Picks" table
    // We look for the specific headers or table structure. 
    // Usually, these tables are inside a container. We'll target the rows (tr) in the tbody.
    
    // Strategy: Find the table that contains "Incoming Draft Picks" or just parse the first main table found.
    // Based on the screenshot, it's likely a standard <table> inside a specific section.
    
    $('table tbody tr').each((i, row) => {
      const cols = $(row).find('td');

      // Ensure we have enough columns to match the screenshot (Year, Round, #, From, Notes)
      if (cols.length >= 5) {
        const year = $(cols[0]).text().trim();
        const round = $(cols[1]).text().trim();
        const pickNum = $(cols[2]).text().trim();
        const from = $(cols[3]).text().trim();
        
        // The last column "Notes/Protection" is often dense text
        const details = $(cols[4]).text().trim();

        // Simple validation to ensure we aren't picking up empty rows or headers
        if (year && round) {
          picks.push({
            year,
            round,
            pickNum: pickNum === '-' ? null : pickNum,
            from,
            details
          });
        }
      }
    });

    // 3. Return the clean JSON
    return NextResponse.json({ 
      team: 'San Antonio Spurs', 
      source: 'Fanspo', 
      data: picks 
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape draft picks' },
      { status: 500 }
    );
  }
}
