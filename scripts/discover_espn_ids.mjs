import fs from 'fs';
import path from 'path';

// The canonical roster provided
const ROSTER = [
  "Cameron Boozer", "Darryn Peterson", "A.J. Dybantsa", "Caleb Wilson",
  "Mikel Brown Jr.", "Nate Ament", "Koa Peat", "Bennett Stirtz",
  "Labaron Philon", "Jayden Quaintance", "Braylon Mullins", "Tounde Yessoufou",
  "Chris Cenac, Jr.", "Isaiah Evans", "Yaxel Lendeborg", "Thomas Haugh",
  "Neoklis Avdalas", "Dame Sarr", "Hannes Steinbach", "Kingston Flemings",
  "Meleek Thomas", "Darius Acuff, Jr.", "Patrick Ngongba II", "Christian Anderson",
  "Karim Lopez", "Shon Abaev", "Cameron Carr", "Cayden Boozer",
  "Tahaad Pettiford", "Ryan Conwell", "JT Toppin", "Nikolas Khamenia",
  "Brayden Burries", "Magoon Gwath", "Paul McNeil Jr.", "Flory Bidunga",
  "Tarris Reed Jr.", "Karter Knox", "Dwayne Aristode", "Billy Richmond III",
  "Henri Veesaar", "Tucker DeVries", "Matt Able", "Tyrone Riley IV",
  "Dash Daniels", "Chase Ross", "Andrej Stojakovic", "Tomislav Ivisic",
  "Alex Condon", "Boogie Fland", "Dailyn Swain", "Alex Karaban",
  "Miles Byrd", "Joshua Jefferson", "Isiah “Zai” Harwell", "Adrian Wooley",
  "Aday Mara Gomez", "Otega Oweh", "Zuby Ejiofor", "John Blackwell"
];

async function findAthleteId(name) {
  // ESPN's public search API used for their own website
  const url = `https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&query=${encodeURIComponent(name)}&limit=5&mode=prefix&type=player`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const item = data.items?.[0]; // Best match
    if (item && item.type === 'player') {
      return { 
        athleteId: item.id, 
        espnProfileUrl: `https://www.espn.com/player/_/id/${item.id}/${item.slug}`
      };
    }
  } catch (e) {
    console.error(`Error searching for ${name}:`, e.message);
  }
  return { athleteId: null, espnProfileUrl: null };
}

async function run() {
  const finalBoard = [];
  const missing = [];

  console.log("Starting ID discovery...");
  for (let i = 0; i < ROSTER.length; i++) {
    const name = ROSTER[i];
    const { athleteId, espnProfileUrl } = await findAthleteId(name);
    
    finalBoard.push({
      rank: i + 1,
      name,
      athleteId,
      espnProfileUrl
    });

    if (!athleteId) missing.push(name);
    process.stdout.write(`[${i+1}/60] ${athleteId ? '✓' : '✗'} ${name}\n`);
  }

  // Ensure directories exist
  const dataDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(path.join(dataDir, 'bigboard_2026.json'), JSON.stringify(finalBoard, null, 2));
  fs.writeFileSync(path.join(dataDir, 'bigboard_missing_ids.json'), JSON.stringify(missing, null, 2));
  console.log("\nDiscovery complete. Results saved to src/data/");
}

run();
