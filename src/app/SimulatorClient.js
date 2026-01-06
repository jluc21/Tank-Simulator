"use client";
import React, { useState, useRef } from 'react';

// Official NBA Weighted Odds (Weights per 1000 combinations)
const NBA_ODDS = [
  { p1: 140, p4: 521 }, { p1: 140, p4: 521 }, { p1: 140, p4: 521 },
  { p1: 125, p4: 481 }, { p1: 105, p4: 421 }, { p1: 90, p4: 372 },
  { p1: 75, p4: 319 }, { p1: 60, p4: 263 }, { p1: 45, p4: 203 },
  { p1: 30, p4: 139 }, { p1: 20, p4: 94 }, { p1: 15, p4: 71 },
  { p1: 10, p4: 48 }, { p1: 5, p4: 24 }
];

export default function SimulatorClient({ initialTeams, children }) {
  const [standings, setStandings] = useState(initialTeams);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shuffleLogos, setShuffleLogos] = useState([null, null, null, null]);
  const timer = useRef(null);

  const drawOne = (pool) => {
    const total = pool.reduce((s, t) => s + t.weight, 0);
    let r = Math.random() * total;
    for (const t of pool) { if (r < t.weight) return t; r -= t.weight; }
    return pool[0];
  };

  const sim = () => {
    setIsAnimating(true);
    let lottoPool = initialTeams.slice(0, 14).map((t, i) => ({ ...t, weight: NBA_ODDS[i].p1, orig: i }));
    const winners = [];
    for (let i = 0; i < 4; i++) {
      const remaining = lottoPool.filter(p => !winners.find(w => w.id === p.id));
      winners.push(drawOne(remaining));
    }
    const survivors = lottoPool.filter(p => !winners.find(w => w.id === p.id)).sort((a,b) => a.orig - b.orig);
    const result = [...winners, ...survivors, ...initialTeams.slice(14)];

    let count = 0;
    timer.current = setInterval(() => {
      setShuffleLogos(Array(4).fill(0).map(() => initialTeams[Math.floor(Math.random()*14)].logo));
      if (++count > 18) {
        clearInterval(timer.current);
        setStandings(result);
        setIsAnimating(false);
      }
    }, 90);
  };

  return children({ standings, sim, reset: () => setStandings(initialTeams), isAnimating, shuffleLogos, NBA_ODDS });
}
