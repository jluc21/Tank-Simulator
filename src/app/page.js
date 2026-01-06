// Inside async function getLiveStandings()
// Replace the mapping and sorting logic block with this:

    const rawTeams = allEntries.map(entry => {
      const stats = entry.stats || [];
      const getStat = (name) => stats.find(s => s.name === name)?.value;
      const displayStat = (name) => stats.find(s => s.name === name)?.displayValue;
      
      return {
        id: entry.team?.id || Math.random().toString(),
        name: entry.team?.displayName || "NBA Team",
        abbreviation: entry.team?.abbreviation || entry.team?.displayName?.substring(0,3).toUpperCase(),
        logo: entry.team?.logos?.[0]?.href || null,
        record: displayStat('summary') || `${getStat('wins') || 0}-${getStat('losses') || 0}`,
        winPct: displayStat('winPercent') || "0.000",
        wins: getStat('wins') || 0,
        losses: getStat('losses') || 0
      };
    }).sort((a, b) => parseFloat(a.winPct) - parseFloat(b.winPct)); // Sorted Worst-to-Best

    // TANKATHON GB LOGIC: Leader is the WORST team (Pick #1)
    const lotteryLeader = rawTeams[0]; // Lowest winPct team
    const finalTeams = rawTeams.map(t => {
      // GB = ((teamW - leaderW) + (leaderL - teamL)) / 2
      const gbVal = ((t.wins - lotteryLeader.wins) + (lotteryLeader.losses - t.losses)) / 2;
      return {
        ...t,
        gbDisplay: gbVal === 0 ? "--" : gbVal.toFixed(1)
      };
    });

    return {
      success: true,
      timestamp: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      }),
      teams: finalTeams
    };
