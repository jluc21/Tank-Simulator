import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const jsonPath = path.join(process.cwd(), 'src/data/bigboard.json');
    const localData = JSON.parse(await fs.readFile(jsonPath, 'utf8'));

    // Enrichment logic (simplified for reliability)
    const upstreamUrl = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/draft/prospects';
    let enrichedPlayers = localData;

    try {
      const res = await fetch(upstreamUrl, { cache: 'no-store' });
      if (res.ok) {
        const upstreamData = await res.json();
        const upstreamProspects = upstreamData?.prospects || [];

        const normalize = (s) => s?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';

        enrichedPlayers = localData.map(local => {
          const match = upstreamProspects.find(p => normalize(p.displayName) === normalize(local.name));
          
          const stats = match?.statistics || match?.athlete?.statistics || [];
          const findS = (lbl) => stats.find(s => s.label === lbl || s.abbreviation === lbl)?.displayValue || "—";

          return {
            ...local,
            image: match?.headshot?.href || null,
            ppg: findS('PTS'),
            rpg: findS('REB'),
            apg: findS('AST'),
            ok: true
          };
        });
      }
    } catch (fetchErr) {
      console.warn("Upstream enrichment failed:", fetchErr.message);
    }

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      players: enrichedPlayers || []
    });

  } catch (error) {
    // Task 3: Guarantee players array and ok:false on failure
    return NextResponse.json({ 
      ok: false, 
      players: [], 
      error: error.message 
    }, { status: 200 }); // Status 200 so UI doesn't crash on fetch error
  }
} 
