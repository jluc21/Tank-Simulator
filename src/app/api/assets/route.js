import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Force dynamic so we can scrape on request, but we will use fetch caching heavily
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get the list of all 30 Team URLs dynamically
    // We scrape the main teams page to find the correct ID for each team (e.g., Spurs is 2, others might be random)
    const teamsListUrl = 'https://fanspo.com/nba/teams';
    
    const teamsResponse = await fetch(teamsListUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      next: { revalidate: 86400 } // Cache the team list for 24 hours
    });

    if (!teamsResponse.ok) throw new Error('Failed to fetch team list');

    const teamsHtml = await teamsResponse.text();
    const $teams = cheerio.load(teamsHtml);
    const teamLinks = [];

    // Find all links that look like /nba/teams/[slug]/[id]
    // The main page usually lists them in a grid or list
    $teams('a[href^="/nba/teams/"]').each((i, el) => {
      const href = $teams(el).attr('href');
      const parts = href.split('/');
      // Expected format: ["", "nba", "teams", "team-slug", "team-id"]
      if (parts.length >= 5) {
        // Avoid duplicate links or sub-pages (like /roster)
        if (parts.length === 5) {
          const name = $teams(el).text().trim();
          const slug = parts[3];
          const id = parts[4];
          
          // Deduplicate based on ID
          if (!teamLinks.some(t => t.id === id)) {
            teamLinks.push({ name, slug, id });
          }
        }
      }
    });

    // 2. Fetch Draft Picks for all teams (Concurrent Fetching)
    // We map over the teams and fire off requests.
    // Note: 30 requests might hit a timeout on Vercel Free Tier (10s limit). 
    // If it times out, you might need to split this or run it locally.
    const allDraftPicks = await Promise.all(
      teamLinks.map(async (team) => {
        const picksUrl = `https://fanspo.com/nba/teams/${team.slug}/${team.id}/draft-picks`;
        
        try {
          const res = await fetch(picksUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            next: { revalidate: 3600 } // Cache individual team data for 1 hour
          });
          
          if (!res.ok) return { team: team.name, picks: [] };

          const html = await res.text();
          const $ = cheerio.load(html);
          const picks = [];

          // Parse the specific "Incoming Draft Picks" table
          $('table tbody tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 5) {
              const year = $(cols[0]).text().trim();
              const round = $(cols[1]).text().trim();
              const pickNum = $(cols[2]).text().trim();
              const from = $(cols[3]).text().trim();
              const notes = $(cols[4]).text().trim(); // Capture the protections/swaps text

              if (year && round) {
                picks.push({
                  year,
                  round,
                  pickNum: pickNum === '-' ? null : pickNum,
                  from,
                  notes
                });
              }
            }
          });

          return {
            team: team.slug, // e.g., 'spurs'
            teamId: team.id,
            data: picks
          };

        } catch (err) {
          console.error(`Error fetching ${team.slug}:`, err);
          return { team: team.slug, error: 'Failed to fetch' };
        }
      })
    );

    // 3. Return the huge JSON object
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      count: allDraftPicks.length,
      teams: allDraftPicks
    });

  } catch (error) {
    console.error('Global scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape data' }, { status: 500 });
  }
}
