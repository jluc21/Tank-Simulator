import { NextResponse } from 'next/server';

// ESPN Team IDs (Static)
const TEAMS = {
  DUKE: 150,
  KANSAS: 2305,
  BYU: 252,
  UNC: 153,
  TENNESSEE: 2633,
  HOUSTON: 248,
  LOUISVILLE: 97,
  UCONN: 41,
  ARIZONA: 12,
  BAYLOR: 239,
  ASU: 9,
  MICHIGAN: 130,
  ALABAMA: 333
};

// The Players we want to track (mapped to their Team ID)
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
  { name: "Yaxel Lendeborg", teamId: TEAMS.MICHIGAN, teamName: "Michigan" }
];

export async function GET() {
  try {
    const playersData = await Promise.all(
      TRACKED_PLAYERS.map(async (player) => {
        // 1. Fetch the full team roster from ESPN
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/${player.teamId}/roster`
        );
        const data = await res.json();
        
        // 2. Find our specific player in the roster list
        const athlete = data.athletes.find(a => 
          a.fullName.toLowerCase().includes(player.name.split(' ')[1].toLowerCase())
        );

        if (!athlete) return null;

        // 3. Extract the "General Stats" summary (usually the first item in the stats list)
        // ESPN returns a summary string like "23.5 PPG, 10.2 RPG" in the 'displayValue' field sometimes,
        // or we access the stats object. Let's try to grab the raw stats.
        // Note: The public roster endpoint is lightweight. For deep stats we often need a second call,
        // but let's grab the summary if available or default to the manual overrides if ESPN is strict.
        
        // *Fallback Logic*: If this specific ESPN endpoint is thin on stats, we pass the image/metadata
        // and let the frontend fill the gaps, OR we can parse the `summary` field if present.
        
        return {
          name: player.name,
          team: player.teamName,
          img: athlete.headshot?.href || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
          pos: athlete.position?.abbreviation || "N/A",
          ht: athlete.displayHeight,
          wt: athlete.displayWeight,
          age: athlete.age || 19,
          // We attach the athlete ID so we can maybe fetch deeper stats later if needed
          espnId: athlete.id
        };
      })
    );

    return NextResponse.json(playersData.filter(p => p !== null));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
