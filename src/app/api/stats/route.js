import { NextResponse } from 'next/server';

const TEAMS = {
  DUKE: 150, KANSAS: 2305, BYU: 252, UNC: 153, TENNESSEE: 2633,
  HOUSTON: 248, LOUISVILLE: 97, UCONN: 41, ARIZONA: 12, BAYLOR: 239,
  ASU: 9, MICHIGAN: 130, ALABAMA: 333, ARKANSAS: 8
};

const TRACKED_PLAYERS = [
  { name: "Darryn Peterson", teamId: TEAMS.KANSAS },
  { name: "Cameron Boozer", teamId: TEAMS.DUKE },
  { name: "AJ Dybantsa", teamId: TEAMS.BYU },
  { name: "Caleb Wilson", teamId: TEAMS.UNC },
  { name: "Nate Ament", teamId: TEAMS.TENNESSEE },
  { name: "Kingston Flemings", teamId: TEAMS.HOUSTON },
  { name: "Mikel Brown Jr.", teamId: TEAMS.LOUISVILLE },
  { name: "Braylon Mullins", teamId: TEAMS.UCONN },
  { name: "Koa Peat", teamId: TEAMS.ARIZONA },
  { name: "Tounde Yessoufou", teamId: TEAMS.BAYLOR },
  { name: "Jayden Quaintance", teamId: TEAMS.ASU },
  { name: "Labaron Philon", teamId: TEAMS.ALABAMA },
  { name: "Darius Acuff", teamId: TEAMS.ARKANSAS },
  { name: "Yaxel Lendeborg", teamId: TEAMS.MICHIGAN },
];

export async function GET() {
  try {
    const uniqueTeamIds = [...new Set(TRACKED_PLAYERS.map(p => p.teamId))];
    
    // Fetch Team Stats
    const allTeamStats = await Promise.all(
      uniqueTeamIds.map(async (teamId) => {
        try {
          const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/${teamId}/statistics`);
          if (!res.ok) return null;
          const data = await res.json();
          return { teamId, stats: data };
        } catch (e) { return null; }
      })
    );

    const results = TRACKED_PLAYERS.map(tracked => {
      const teamData = allTeamStats.find(t => t && t.teamId === tracked.teamId);
      if (!teamData || !teamData.stats || !teamData.stats.results) return null;

      // Helper to find a stat value for our specific player
      const findValue = (categoryName) => {
        // Find the category (e.g. "Scoring", "Rebounding")
        const cat = teamData.stats.results.find(c => 
          c.name.toLowerCase().includes(categoryName.toLowerCase())
        );
        if (!cat || !cat.leaders) return "0.0";

        // Find the player in that category's leaders
        const leader = cat.leaders.find(l => 
          l.athlete.displayName.toLowerCase().includes(tracked.name.split(' ').pop().toLowerCase())
        );
        return leader ? leader.value.toString() : "--";
      };

      // Extract all 5 stats
      const ppg = findValue("Scoring") === "--" ? findValue("Points") : findValue("Scoring");
      const rpg = findValue("Rebound");
      const apg = findValue("Assists");
      const fg = findValue("Field Goal Percentage");
      const threePt = findValue("3-Point Field Goal Percentage");

      // Don't return if we didn't find the main stat
      if (ppg === "--" || ppg === "0.0") return null;

      return {
        name: tracked.name,
        stats: {
          ppg: ppg,
          rpg: rpg,
          apg: apg,
          fg: fg + "%",
          threePt: threePt + "%"
        }
      };
    }).filter(p => p !== null);

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
