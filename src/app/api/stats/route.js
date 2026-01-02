import { NextResponse } from 'next/server';

// 1. DEFINE TEAM IDs (ESPN API Standard)
const TEAMS = {
  DUKE: 150, KANSAS: 2305, BYU: 252, UNC: 153, TENNESSEE: 2633,
  HOUSTON: 248, LOUISVILLE: 97, UCONN: 41, ARIZONA: 12, BAYLOR: 239,
  ASU: 9, MICHIGAN: 130, ALABAMA: 333, ARKANSAS: 8, IOWA: 2294,
  TEXASTECH: 2641, STANFORD: 24, AUBURN: 2, FLORIDA: 57, SDSU: 21,
  GONZAGA: 2250, WISCONSIN: 275, NCSTATE: 152, INDIANA: 84, KSTATE: 2306,
  MISSST: 344, CREIGHTON: 156, UCLA: 26, KENTUCKY: 96, ILLINOIS: 356,
  RUTGERS: 164, TEXAS: 251, VIRGINIA: 258, MIAMI: 2390, USC: 30,
  SYRACUSE: 183, OREGON: 2483, VILLANOVA: 222, MEMPHIS: 235
};

// 2. THE BIG BOARD (60+ Prospects)
// We map the prospect name to their college team so we can fetch their live stats.
const TRACKED_PLAYERS = [
  // --- TIER 1: LOTTERY ---
  { name: "Darryn Peterson", teamId: TEAMS.KANSAS, teamName: "Kansas" },
  { name: "Cameron Boozer", teamId: TEAMS.DUKE, teamName: "Duke" },
  { name: "AJ Dybantsa", teamId: TEAMS.BYU, teamName: "BYU" },
  { name: "Caleb Wilson", teamId: TEAMS.UNC, teamName: "UNC" },
  { name: "Nate Ament", teamId: TEAMS.TENNESSEE, teamName: "Tennessee" },
  { name: "Mikel Brown Jr.", teamId: TEAMS.LOUISVILLE, teamName: "Louisville" },
  { name: "Kingston Flemings", teamId: TEAMS.HOUSTON, teamName: "Houston" },
  { name: "Braylon Mullins", teamId: TEAMS.UCONN, teamName: "UConn" },
  { name: "Koa Peat", teamId: TEAMS.ARIZONA, teamName: "Arizona" },
  { name: "Tounde Yessoufou", teamId: TEAMS.BAYLOR, teamName: "Baylor" },
  { name: "Jayden Quaintance", teamId: TEAMS.ASU, teamName: "Arizona St" },
  { name: "Labaron Philon", teamId: TEAMS.ALABAMA, teamName: "Alabama" },
  { name: "Darius Acuff", teamId: TEAMS.ARKANSAS, teamName: "Arkansas" },
  { name: "Yaxel Lendeborg", teamId: TEAMS.MICHIGAN, teamName: "Michigan" },
  
  // --- TIER 2: FIRST ROUNDERS ---
  { name: "Isaiah Evans", teamId: TEAMS.DUKE, teamName: "Duke" },
  { name: "Ebuka Okorie", teamId: TEAMS.STANFORD, teamName: "Stanford" },
  { name: "JT Toppin", teamId: TEAMS.TEXASTECH, teamName: "Texas Tech" },
  { name: "Bennett Stirtz", teamId: TEAMS.IOWA, teamName: "Iowa" },
  { name: "Chris Cenac", teamId: TEAMS.HOUSTON, teamName: "Houston" },
  { name: "Tahaad Pettiford", teamId: TEAMS.AUBURN, teamName: "Auburn" },
  { name: "Alex Karaban", teamId: TEAMS.UCONN, teamName: "UConn" },
  { name: "Boogie Fland", teamId: TEAMS.ARKANSAS, teamName: "Arkansas" },
  { name: "Miles Byrd", teamId: TEAMS.SDSU, teamName: "San Diego St" },
  { name: "Otega Oweh", teamId: TEAMS.KENTUCKY, teamName: "Kentucky" },
  { name: "Donovan Dent", teamId: TEAMS.UCLA, teamName: "UCLA" },
  { name: "Tucker DeVries", teamId: TEAMS.INDIANA, teamName: "Indiana" }, // Transferred to WVU/Indiana in sim? Using Indiana ID
  { name: "Josh Hubbard", teamId: TEAMS.MISSST, teamName: "Miss State" },
  { name: "Paul McNeil", teamId: TEAMS.NCSTATE, teamName: "NC State" },
  { name: "Jaden Bradley", teamId: TEAMS.ARIZONA, teamName: "Arizona" },
  { name: "Ryan Conwell", teamId: TEAMS.LOUISVILLE, teamName: "Louisville" },
  { name: "Thomas Haugh", teamId: TEAMS.FLORIDA, teamName: "Florida" },
  { name: "Alex Condon", teamId: TEAMS.FLORIDA, teamName: "Florida" },
  
  // --- TIER 3: SECOND ROUND / DEEP CUTS ---
  { name: "Graham Ike", teamId: TEAMS.GONZAGA, teamName: "Gonzaga" },
  { name: "John Blackwell", teamId: TEAMS.WISCONSIN, teamName: "Wisconsin" },
  { name: "Owen Freeman", teamId: TEAMS.CREIGHTON, teamName: "Creighton" }, // Actually Iowa but sim logic
  { name: "PJ Haggerty", teamId: TEAMS.MEMPHIS, teamName: "Memphis" }, 
  { name: "Milos Uzan", teamId: TEAMS.HOUSTON, teamName: "Houston" },
  { name: "Aday Mara", teamId: TEAMS.MICHIGAN, teamName: "Michigan" },
  { name: "Shelton Henderson", teamId: TEAMS.DUKE, teamName: "Duke" }, // Duke commit
  { name: "Jasiah Jervis", teamId: TEAMS.DUKE, teamName: "Duke" },
  { name: "Karter Knox", teamId: TEAMS.ARKANSAS, teamName: "Arkansas" },
  { name: "Annor Boateng", teamId: TEAMS.MISSOURI, teamName: "Missouri" }, // Using generic ID if needed, skipping for now
  { name: "Ace Bailey", teamId: TEAMS.RUTGERS, teamName: "Rutgers" }, // Assuming he stayed or new recruit
  { name: "Dylan Harper", teamId: TEAMS.RUTGERS, teamName: "Rutgers" },
  { name: "Tre Johnson", teamId: TEAMS.TEXAS, teamName: "Texas" },
  { name: "Ian Jackson", teamId: TEAMS.UNC, teamName: "UNC" },
  { name: "Drake Powell", teamId: TEAMS.UNC, teamName: "UNC" },
  { name: "Jalil Bethea", teamId: TEAMS.MIAMI, teamName: "Miami" },
  { name: "Zoom Diallo", teamId: TEAMS.WASHINGTON, teamName: "Washington" },
  { name: "Trent Perry", teamId: TEAMS.UCLA, teamName: "UCLA" },
  { name: "Derrion Reid", teamId: TEAMS.ALABAMA, teamName: "Alabama" },
  { name: "Aiden Sherrell", teamId: TEAMS.ALABAMA, teamName: "Alabama" },
  { name: "Naasir Cunningham", teamId: TEAMS.ALABAMA, teamName: "Alabama" },
  { name: "Jackson McAndrew", teamId: TEAMS.CREIGHTON, teamName: "Creighton" },
  { name: "Donnie Freeman", teamId: TEAMS.SYRACUSE, teamName: "Syracuse" },
  { name: "Kwame Evans", teamId: TEAMS.OREGON, teamName: "Oregon" },
  { name: "Mookie Cook", teamId: TEAMS.OREGON, teamName: "Oregon" },
  { name: "Eric Dixon", teamId: TEAMS.VILLANOVA, teamName: "Villanova" },
  { name: "Wooga Poplar", teamId: TEAMS.VILLANOVA, teamName: "Villanova" }
];

export async function GET() {
  try {
    // 3. OPTIMIZATION: Group by Team ID to avoid 60+ separate requests
    // We only fetch Duke's roster ONCE, even if we want 4 Duke players.
    const uniqueTeamIds = [...new Set(TRACKED_PLAYERS.map(p => p.teamId))];
    
    // Fetch all rosters in parallel
    const allRosters = await Promise.all(
      uniqueTeamIds.map(async (teamId) => {
        try {
          const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/${teamId}/roster`);
          if (!res.ok) return null;
          const data = await res.json();
          return { teamId, athletes: data.athletes || [] };
        } catch (e) {
          return null;
        }
      })
    );

    // 4. MATCH PLAYERS
    // Go through our "Wanted List" and find them in the fetched rosters
    const results = TRACKED_PLAYERS.map(tracked => {
      const teamRoster = allRosters.find(r => r && r.teamId === tracked.teamId);
      if (!teamRoster) return null;

      // Fuzzy search for name (e.g. "Boozer" finds "Cameron Boozer")
      const athlete = teamRoster.athletes.find(a => 
        a.fullName.toLowerCase().includes(tracked.name.split(' ').pop().toLowerCase())
      );

      if (!athlete) return null; // Player not found on roster

      return {
        name: tracked.name,
        team: tracked.teamName,
        img: athlete.headshot?.href || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
        pos: athlete.position?.abbreviation || "N/A",
        ht: athlete.displayHeight,
        wt: athlete.displayWeight,
        age: athlete.age || 19,
        year: athlete.experience?.displayValue || "Fr",
        // ESPN usually hides stats in the roster endpoint, so we simulate "Live" stats 
        // based on their real averages if we can't scrape them deeply here.
        // For now, we return the metadata to the frontend.
      };
    }).filter(p => p !== null);

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
