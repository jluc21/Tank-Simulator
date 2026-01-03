import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

const TEAM_IDS = {
  ATL: { id: 1, slug: "atlanta-hawks" },
  BOS: { id: 2, slug: "boston-celtics" },
  BKN: { id: 3, slug: "brooklyn-nets" },
  CHA: { id: 4, slug: "charlotte-hornets" },
  CHI: { id: 5, slug: "chicago-bulls" },
  CLE: { id: 6, slug: "cleveland-cavaliers" },
  DAL: { id: 7, slug: "dallas-mavericks" },
  DEN: { id: 8, slug: "denver-nuggets" },
  DET: { id: 9, slug: "detroit-pistons" },
  GSW: { id: 10, slug: "golden-state-warriors" },
  HOU: { id: 11, slug: "houston-rockets" },
  IND: { id: 12, slug: "indiana-pacers" },
  LAC: { id: 13, slug: "la-clippers" },
  LAL: { id: 14, slug: "los-angeles-lakers" },
  MEM: { id: 15, slug: "memphis-grizzlies" },
  MIA: { id: 16, slug: "miami-heat" },
  MIL: { id: 17, slug: "milwaukee-bucks" },
  MIN: { id: 18, slug: "minnesota-timberwolves" },
  NOP: { id: 19, slug: "new-orleans-pelicans" },
  NYK: { id: 20, slug: "new-york-knicks" },
  OKC: { id: 21, slug: "oklahoma-city-thunder" },
  ORL: { id: 22, slug: "orlando-magic" },
  PHI: { id: 23, slug: "philadelphia-76ers" },
  PHX: { id: 24, slug: "phoenix-suns" },
  POR: { id: 25, slug: "portland-trail-blazers" },
  SAC: { id: 26, slug: "sacramento-kings" },
  SAS: { id: 27, slug: "san-antonio-spurs" },
  TOR: { id: 28, slug: "toronto-raptors" },
  UTA: { id: 29, slug: "utah-jazz" },
  WAS: { id: 30, slug: "washington-wizards" }
};

// This function hunts through the entire JSON object for any array containing 'season' and 'round'
function findPicksRecursively(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    const isPicksArray = obj.length > 0 && obj[0]?.season && obj[0]?.round;
    if (isPicksArray) return obj;
    for (const item of obj) {
      const result = findPicksRecursively(item);
      if (result) return result;
    }
  } else {
    for (const key in obj) {
      const result = findPicksRecursively(obj[key]);
      if (result) return result;
    }
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get('team');

  if (!teamCode || !TEAM_IDS[teamCode]) {
    return NextResponse.json({ success: false, error: 'Invalid Team' }, { status: 400 });
  }

  const { id, slug } = TEAM_IDS[teamCode];
  const url = `https://fanspo.com/nba/teams/${slug}/${id}/draft-picks`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      },
      next: { revalidate: 3600 }
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract the internal JSON state Fanspo uses
    const nextDataRaw = $('#__NEXT_DATA__').html();
    if (!nextDataRaw) throw new Error("Fanspo blocked access or changed layout");

    const json = JSON.parse(nextDataRaw);
    const draftPicks = findPicksRecursively(json);

    if (!draftPicks) throw new Error("Could not locate pick data in payload");

    const assets = draftPicks
      .map(pick => {
        // Identify if the pick belongs to the current team or is incoming
        let source = "Own";
        if (pick.original_team?.team_code && pick.original_team.team_code !== teamCode) {
          source = pick.original_team.team_code;
        }

        return {
          year: parseInt(pick.season),
          round: pick.round,
          from: source,
          notes: (pick.note || pick.description || "Unprotected").replace("Protected ", "Prot ")
        };
      })
      .filter(a => a.year >= 2025)
      .sort((a, b) => a.year - b.year || a.round - b.round);

    return NextResponse.json({ success: true, data: assets });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
