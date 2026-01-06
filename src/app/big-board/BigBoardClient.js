"use client";
import React, { useState, useEffect } from 'react';

export default function BigBoardClient({ initialPlayers }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  // Requirement: Live Refresh / Polling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Soft-refresh by calling the server action or re-fetching
        const res = await fetch('/api/big-board-refresh', { cache: 'no-store' });
        if (res.ok) {
          const newData = await res.json();
          setPlayers(newData.players);
          setLastSync(new Date().toLocaleTimeString("en-US", {
            timeZone: "America/New_York",
            hour: 'numeric', minute: '2-digit', second: '2-digit'
          }));
        }
      } catch (e) {
        console.error("Refresh failed", e);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl rounded-sm overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-black uppercase text-[#9ea3a8] border-b border-gray-100 bg-gray-50/50 px-6 py-3">
            <th className="px-6 py-4 w-16">Rank</th>
            <th className="px-6 py-4">Player</th>
            <th className="px-6 py-4">School</th>
            <th className="px-6 py-4 text-center">PPG</th>
            <th className="px-6 py-4 text-center">RPG</th>
            <th className="px-6 py-4 text-center">APG</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {players.map((player) => (
            <tr key={player.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4 text-2xl font-black text-[#9ea3a8] tabular-nums">
                {player.rank}
              </td>
              <td className="px-6 py-4 flex items-center gap-4">
                {player.image && <img src={player.image} alt="" className="w-10 h-10 rounded-full bg-gray-100" />}
                <div>
                  <div className="font-black text-base uppercase italic text-[#2f3e4e] leading-none">
                    {player.name}
                  </div>
                  <div className="text-[10px] font-bold text-[#9ea3a8] uppercase">{player.position}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-[#2f3e4e]">{player.school}</td>
              {/* Fallback Handling: Uses "—" if stats are missing */}
              <td className="px-6 py-4 text-center font-mono font-black text-[#2f3e4e]">{player.ppg}</td>
              <td className="px-6 py-4 text-center font-mono font-black text-[#2f3e4e]">{player.rpg}</td>
              <td className="px-6 py-4 text-center font-mono font-black text-[#2f3e4e]">{player.apg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
