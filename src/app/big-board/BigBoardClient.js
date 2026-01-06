"use client";
import React, { useState, useEffect } from 'react';

export default function BigBoardClient({ initialPlayers, fetchError }) {
  const [players, setPlayers] = useState(initialPlayers || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(fetchError);

  // Safety check: ensure players is always an array
  const safePlayers = Array.isArray(players) ? players : [];

  // Error State UI
  if (error) {
    return (
      <div className="bg-white border-t-4 border-red-600 p-12 text-center shadow-2xl rounded-sm">
        <h3 className="text-xl font-black uppercase italic text-[#2f3e4e] mb-2">Data Sync Failed</h3>
        <p className="text-[#9ea3a8] text-xs font-bold uppercase tracking-widest">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 bg-[#2f3e4e] text-white px-8 py-2 rounded font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Handle successful render with empty data
  if (!safePlayers.length && !isLoading) {
    return (
      <div className="bg-white border-t-4 border-[#2f3e4e] p-12 text-center shadow-2xl rounded-sm">
        <p className="text-[#9ea3a8] text-xs font-bold uppercase tracking-widest animate-pulse">
          No prospects found in current cycle.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="text-[10px] font-black uppercase text-[#9ea3a8] border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4 w-16">Rank</th>
              <th className="px-6 py-4">Player</th>
              <th className="px-6 py-4">School</th>
              <th className="px-6 py-4 text-center">PPG</th>
              <th className="px-6 py-4 text-center">RPG</th>
              <th className="px-6 py-4 text-center">APG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {safePlayers.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50/80 transition-colors group">
                <td className="px-6 py-4 text-2xl font-black text-[#9ea3a8] tabular-nums">
                  {player.rank}
                </td>
                <td className="px-6 py-4 flex items-center gap-4">
                  {player.image ? (
                    <img 
                      src={player.image} 
                      alt={player.name} 
                      className="w-10 h-10 rounded-full bg-gray-100 object-cover border border-gray-100" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-300 border border-gray-100">
                      N/A
                    </div>
                  )}
                  <div>
                    <div className="font-black text-base uppercase italic text-[#2f3e4e] leading-none">
                      {player.name}
                    </div>
                    <div className="text-[10px] font-bold text-[#9ea3a8] uppercase mt-1">
                      {player.position}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#2f3e4e]">
                  {player.school}
                </td>
                <td className="px-6 py-4 text-center font-mono font-black text-[#2f3e4e]">
                  {player.ppg}
                </td>
                <td className="px-6 py-4 text-center font-mono font-black text-[#2f3e4e]">
                  {player.rpg}
                </td>
                <td className="px-6 py-4 text-center font-mono font-black text-[#2f3e4e]">
                  {player.apg}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
