"use client";
import React, { useState, useRef } from 'react';

const NBA_ODDS = [
  { p1: 14.0, p4: 52.1 }, { p1: 14.0, p4: 52.1 }, { p1: 14.0, p4: 52.1 },
  { p1: 12.5, p4: 48.1 }, { p1: 10.5, p4: 42.1 }, { p1: 9.0, p4: 37.2 },
  { p1: 7.5, p4: 31.9 }, { p1: 6.0, p4: 26.3 }, { p1: 4.5, p4: 20.3 },
  { p1: 3.0, p4: 13.9 }, { p1: 2.0, p4: 9.4 }, { p1: 1.5, p4: 7.1 },
  { p1: 1.0, p4: 4.8 }, { p1: 0.5, p4: 2.4 }
];

export default function SimulatorClient({ initialTeams, children }) {
  const [standings, setStandings] = useState(initialTeams);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shuffleLogos, setShuffleLogos] = useState([null, null, null, null]);
  const timer = useRef(null);

  const weightedDraw = (pool) => {
    const total = pool.reduce((s, t) => s + t.weight, 0);
    let r = Math.random() * total;
    for (const t of pool) { if (r < t.weight) return t; r -= t.weight; }
    return pool[0];
  };

  const sim = () => {
    setIsAnimating(true);
    let lotto = initialTeams.slice(0, 14).map((t, i) => ({ ...t, weight: NBA_ODDS[i].p1, orig: i }));
    const winners = [];
    for (let i = 0; i < 4; i++) {
      const remaining = lotto.filter(p => !winners.find(w => w.id === p.id));
      winners.push(weightedDraw(remaining));
    }
    const others = lotto.filter(p => !winners.find(w => w.id === p.id)).sort((a,b) => a.orig - b.orig);
    const result = [...winners, ...others, ...initialTeams.slice(14)];

    let count = 0;
    timer.current = setInterval(() => {
      setShuffleLogos(Array(4).fill(0).map(() => initialTeams[Math.floor(Math.random()*14)].logo));
      if (++count > 15) {
        clearInterval(timer.current);
        setStandings(result);
        setIsAnimating(false);
      }
    }, 80);
  };

  return children({ standings, sim, reset: () => setStandings(initialTeams), isAnimating, shuffleLogos, NBA_ODDS });
}
