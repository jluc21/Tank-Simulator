import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 1. Mapping for Team Abbreviations to BBGM IDs
// Note: You can expand this to include all 30 teams
const TEAM_MAP = {
  ATL: 0, BOS: 1, BKN: 2, CHA: 3, CHI: 4, CLE: 5, DAL: 6, DEN: 7, 
  DET: 8, GSW: 9, HOU: 10, IND: 11, LAC: 12, LAL: 13, MEM: 14, 
  MIA: 15, MIL: 16, MIN: 17, NOP: 18, NYK: 19, OKC: 20, ORL: 21, 
  PHI: 22, PHX: 23, POR: 24, SAC: 25, SAS: 26, TOR: 27, UTA: 28, WAS: 29
};

// Map IDs back to Codes for the "FROM" column
const ID_TO_CODE = Object.fromEntries(Object.entries(TEAM_MAP).map(([k, v]) => [v, k]));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamCode = searchParams.get('team');

  if (!teamCode || TEAM_MAP[teamCode] === undefined) {
    return NextResponse.json({ success: false, error: 'Invalid Team Code' }, { status: 400 });
  }

  const targetTid = TEAM_MAP[teamCode];

  try {
    // 2. Fetching the BBGM Source
    // Replace this URL with your actual BBGM JSON export or hosted endpoint
    const url = `https://your-bbgm-data-source.com/export.json`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Could not fetch BBGM data");

    const bbgmExport = await res.json();

    // 3. Precision Parsing of the Draft Picks Array
    // BBGM stores picks in 'draftPicks'. We filter for picks currently owned by targetTid.
    const picks = bbgmExport.draftPicks
      .filter(pick => pick.tid === targetTid)
      .map(pick => {
        const isIncoming = pick.originalTid !== targetTid;
        const fromCode = isIncoming ? (ID_TO_CODE[pick.originalTid] || "Traded") : "Own";

        return {
          year: pick.season,
          round: pick.round,
          from: fromCode,
          notes: isIncoming ? `Incoming from ${fromCode}` : "Original Pick"
        };
      })
      .filter(pick => pick.year >= 2026) // Focus on future assets
      .sort((a, b) => a.year - b.year || a.round - b.round);

    return NextResponse.json({
      success: true,
      data: picks
    });

  } catch (error) {
    console.error("BBGM Read Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
