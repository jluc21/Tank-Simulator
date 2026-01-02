import { NextResponse } from 'next/server';

// 1. TEAM IDs
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

// 2. PLAYERS TO TRACK
const TRACKED_PLAYERS = [
  { name: "Darryn Peterson", teamId: TEAMS.KANSAS, teamName: "Kansas" },
  { name: "Cameron Boozer", teamId: TEAMS.DUKE, teamName: "Duke" },
  { name: "AJ Dybantsa", teamId: TEAMS.BYU, teamName: "BYU" },
  { name: "Caleb Wilson", teamId: TEAMS.UNC, teamName: "UNC" },
  { name: "Nate Ament", teamId: TEAMS.TENNESSEE, teamName: "Tennessee" },
  { name: "Kingston Flemings", teamId: TEAMS.HOUSTON, teamName: "Houston" },
  { name: "Mikel Brown Jr.", teamId: TEAMS.LOUISVILLE, teamName: "Louisville" },
  { name: "Braylon Mullins", teamId: TEAMS.UCONN, teamName: "UConn" },
  { name: "Koa Peat", teamId: TEAMS.ARIZONA, teamName: "Arizona" },
  { name: "Tounde Yessoufou", teamId: TEAMS.BAYLOR, teamName: "Baylor" },
  { name: "Jayden Quaintance", teamId: TEAMS.ASU, teamName: "Arizona St" },
  { name: "Labaron Philon", teamId: TEAMS.ALABAMA, teamName: "Alabama" },
  { name: "Darius Acuff", teamId: TEAMS.ARKANSAS, teamName: "Arkansas" },
  { name: "Yaxel Lendeborg", teamId: TEAMS.MICHIGAN, teamName: "Michigan" },
  // ... Add more as needed
];

export async function GET() {
  try {
    // Group by Team ID to minimize API calls
    const uniqueTeamIds = [...new Set(TRACKED_PLAYERS.map(p => p.teamId))];
    
    // Fetch STATISTICS for each team
    const allTeamStats = await Promise.all(
      uniqueTeamIds.map(async (teamId) => {
        try {
          const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/${teamId}/statistics`);
          if (!res.ok) return null;
          const data = await res.json();
          return { teamId, stats: data };
        } catch (e) {
          return null;
        }
      })
    );

    // Match Players to their Stats
    const results = TRACKED_PLAYERS.map(tracked => {
      const teamData = allTeamStats.find(t => t && t.teamId === tracked.teamId);
      if (!teamData || !teamData.stats || !teamData.stats.results) return null;

      // The ESPN stats object has categories (Scoring, Rebounding, etc.)
      // We need to parse these lists to find our player.
      
      let ppg = "0.0";
      let rpg = "0.0";
      let apg = "0.0";
      let img = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"; // Default
      let pos = "N/A";

      // Helper to find value in a category list
      const findStat = (categoryName) => {
        const cat = teamData.stats.results.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (!cat || !cat.leaders) return "0.0";
        // Look for player in leaders
        const leader = cat.leaders.find(l => l.athlete.displayName.toLowerCase().includes(tracked.name.split(' ').pop().toLowerCase()));
        if (leader) {
            // Capture image if available from the first match
            if (leader.athlete.headshot?.href) img = leader.athlete.headshot.href;
            if (leader.athlete.position?.abbreviation) pos = leader.athlete.position.abbreviation;
            return leader.value.toString();
        }
        return "0.0";
      };

      ppg = findStat("Scoring");   // "Points" or "Scoring" depending on API version
      if (ppg === "0.0") ppg = findStat("Points"); // Try both names
      
      rpg = findStat("Rebounding");
      if (rpg === "0.0") rpg = findStat("Rebounds");

      apg = findStat("Assists");

      return {
        name: tracked.name,
        team: tracked.teamName,
        img: img,
        pos: pos,
        stats: `${ppg} PPG, ${rpg} REB`, // Formatted string
        rawPpg: parseFloat(ppg) // For sorting if needed
      };
    }).filter(p => p !== null);

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
