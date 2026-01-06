"use client";
import React from 'react';

export default function BigBoardClient({ players, initialPlayers }) {
  // Task 1: Create a safe array regardless of prop naming
  const rows = Array.isArray(players) ? players : Array.isArray(initialPlayers) ? initialPlayers : [];

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return "—";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Fallback UI if no data is available
  if (rows.length === 0) {
    return (
      <div className="bg-white border-t-4 border-[#2f3e4e] p-12 text-center shadow-2xl rounded-sm">
        <h3 className="text-xl font-black uppercase italic text-[#2f3e4e] mb-2">No Player Data Available</h3>
        <p className="text-[#9ea3a8] text-[10px] font-bold uppercase tracking-widest mb-6">The big board is currently empty.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#2f3e4e] text-white px-8 py-2 rounded font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
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
            {rows.map((p) => (
              <tr key={p.id || p.rank} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-2xl font-black text-[#9ea3a8] tabular-nums">{p.rank}</td>
                <td className="px-6 py-4 flex items-center gap-4">
                  {p.image ? (
                    <img src={p.image} alt="" className="w-10 h-10 rounded-full bg-gray-100 object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[10px] font-black text-[#9ea3a8] border border-gray-100">
                      {getInitials(p.name)}
                    </div>
                  )}
                  <div>
                    <div className="font-black text-base uppercase italic text-[#2f3e4e] leading-none">{p.name || "Unknown Player"}</div>
                    <div className="text-[10px] font-bold text-[#9ea3a8] uppercase mt-1">{p.position || "N/A"}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#2f3e4e]">{p.school || "N/A"}</td>
                <td className={`px-6 py-4 text-center font-mono font-black ${p.ppg === "—" ? "text-gray-300" : "text-[#2f3e4e]"}`}>{p.ppg || "—"}</td>
                <td className={`px-6 py-4 text-center font-mono font-black ${p.rpg === "—" ? "text-gray-300" : "text-[#2f3e4e]"}`}>{p.rpg || "—"}</td>
                <td className={`px-6 py-4 text-center font-mono font-black ${p.apg === "—" ? "text-gray-300" : "text-[#2f3e4e]"}`}>{p.apg || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
