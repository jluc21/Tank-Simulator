"use client";
import React from 'react';

export default function BigBoardClient({ players = [] }) {
  if (!players || players.length === 0) {
    return <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest">Loading Big Board...</div>;
  }

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="text-[10px] font-black uppercase text-[#9ea3a8] border-b border-gray-100 bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 w-16">Rank</th>
              <th className="px-6 py-4">Player</th>
              <th className="px-6 py-4 text-center">PPG</th>
              <th className="px-6 py-4 text-center">RPG</th>
              <th className="px-6 py-4 text-center">APG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {players.map((p) => (
              <tr key={p.rank} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-2xl font-black text-[#9ea3a8] tabular-nums">{p.rank}</td>
                <td className="px-6 py-4 flex items-center gap-4">
                  {p.image ? (
                    <img src={p.image} alt="" className="w-10 h-10 rounded-full bg-gray-100 object-cover border border-gray-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[10px] font-black text-[#9ea3a8] border border-gray-100">
                      {getInitials(p.name)}
                    </div>
                  )}
                  <div>
                    <div className="font-black text-base uppercase italic text-[#2f3e4e] leading-none">{p.name}</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">
                      {p.athleteId ? 'Verified Profile' : 'Needs Verification'}
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 text-center font-mono font-black ${p.ppg === "—" ? "text-gray-300" : "text-[#2f3e4e]"}`}>{p.ppg}</td>
                <td className={`px-6 py-4 text-center font-mono font-black ${p.rpg === "—" ? "text-gray-300" : "text-[#2f3e4e]"}`}>{p.rpg}</td>
                <td className={`px-6 py-4 text-center font-mono font-black ${p.apg === "—" ? "text-gray-300" : "text-[#2f3e4e]"}`}>{p.apg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
