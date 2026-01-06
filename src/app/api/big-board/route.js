import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const isSmokeTest = searchParams.get('smoke') === '1';

  const seeds = [
    { url: 'https://www.espn.com/nba/draft/bestavailable', kind: 'htmlSeed' },
    { url: 'https://site.api.espn.com/apis/v2/sports/basketball/nba/draft/prospects', kind: 'jsonCandidate' }
  ];

  const diag = {
    tried: [],
    foundExtractedCount: 0,
    lastSnippet: "",
    probesAttempted: 0,
    queueStartSize: seeds.length,
    queueEndSize: 0,
    visitedCount: 0,
    errorsCount: 0,
    exitReason: "unknown",
    seedFetchBlocked: false,
    fatalReason: null
  };

  const probeQueue = [...seeds];
  const visited = new Set();
  let successfulPlayers = null;
  let sourceUrl = "";
  let upstreamStatus = 0;

  try {
    if (probeQueue.length === 0) {
      diag.fatalReason = "Seeds array is empty at initialization";
      diag.exitReason = "no_seeds";
    }

    while (probeQueue.length > 0 && diag.tried.length < 25) {
      const { url, kind } = probeQueue.shift();
      if (visited.has(url)) continue;
      
      // LOG BEFORE FETCH: Guarantees at least one entry if loop starts
      const currentProbe = { 
        url, 
        kind, 
        status: 'pending', 
        startTime: Date.now(),
        duration: null 
      };
      diag.tried.push(currentProbe);
      diag.probesAttempted++;
      visited.add(url);
      diag.visitedCount++;

      // SMOKE TEST MODE: Stop after seed HTML fetch
      if (isSmokeTest && kind !== 'htmlSeed') {
         continue;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch(url, {
          signal: controller.signal,
          cache: 'no-store',
          headers: {
            "accept": "application/json, text/html",
            "user-agent": "Mozilla/5.0 (Vercel Probe; Next.js)"
          }
        });
        clearTimeout(timeoutId);

        currentProbe.status = res.status;
        currentProbe.contentType = res.headers.get('content-type');
        currentProbe.duration = Date.now() - currentProbe.startTime;
        upstreamStatus = res.status;

        const text = await res.text();
        diag.lastSnippet = text.substring(0, 300);

        if (kind === 'htmlSeed' && !res.ok) {
          diag.seedFetchBlocked = true;
        }

        if (isSmokeTest) {
          diag.exitReason = "smoke_test_complete";
          const linksFound = text.match(/(site|sports|web)\.api\.espn\.com\/apis/g);
          return NextResponse.json({
            smoke: true,
            url,
            status: res.status,
            contentType: currentProbe.contentType,
            snippet: diag.lastSnippet,
            apiLinksFound: !!linksFound,
            linksCount: linksFound ? linksFound.length : 0,
            diag
          });
        }

        if (!res.ok) {
          diag.errorsCount++;
          continue;
        }

        // Try JSON parsing
        try {
          const json = JSON.parse(text);
          // Simple defensive check for any array that looks like prospects
          const findArray = (o) => {
            if (Array.isArray(o)) return o;
            for (let k in o) {
              if (Array.isArray(o[k]) && o[k].length > 0) return o[k];
            }
            return null;
          };

          const players = findArray(json);
          if (players && (players[0]?.displayName || players[0]?.athlete)) {
            successfulPlayers = players.map((p, i) => ({
              id: p.id || i,
              rank: p.rank || i + 1,
              name: p.displayName || p.athlete?.displayName || "Unknown",
              school: p.school?.displayName || "N/A"
            }));
            sourceUrl = url;
            diag.exitReason = "success";
            break; 
          }
        } catch (e) {
          // Fallback: Regex extract links from HTML or non-prospect JSON
          const matches = text.match(/(https?:\/\/[^\s"']+\/apis\/[^\s"']+)/g) || [];
          matches.forEach(m => {
            const clean = m.replace(/[\\;]$/, '');
            if (!visited.has(clean)) {
              probeQueue.push({ url: clean, kind: 'extracted' });
              diag.foundExtractedCount++;
            }
          });
        }

      } catch (fetchErr) {
        clearTimeout(timeoutId);
        currentProbe.status = fetchErr.name === 'AbortError' ? 'timeout' : 'error';
        currentProbe.error = fetchErr.message;
        diag.errorsCount++;
        if (kind === 'htmlSeed') diag.seedFetchBlocked = true;
      }
    }

    if (successfulPlayers) {
      diag.exitReason = "success";
    } else if (diag.tried.length >= 25) {
      diag.exitReason = "probe_limit";
    } else {
      diag.exitReason = "queue_empty";
    }

  } catch (fatalErr) {
    diag.exitReason = "fatal_error";
    diag.fatalReason = fatalErr.message;
  }

  diag.queueEndSize = probeQueue.length;

  return NextResponse.json({
    ok: !!successfulPlayers,
    updatedAt: new Date().toISOString(),
    sourceUrl,
    upstreamStatus,
    diag,
    players: successfulPlayers || []
  });
} 
