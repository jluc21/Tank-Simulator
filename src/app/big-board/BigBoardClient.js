"use client";
import React, { useState, useEffect } from 'react';

export default function BigBoardClient({ initialPlayers, initialOk, initialMeta }) {
  const [players, setPlayers] = useState(initialPlayers || []);
  const [isDataOk, setIsDataOk] = useState(initialOk);
  const [meta, setMeta] = useState(initialMeta || {});
  const [lastUpdated, setLastUpdated] = useState("");

  const refreshData = async () => {
    try {
      const res = await fetch("/api/big-board", { cache: "no-store" });
      const data = await res.json(); // Always status 200 per requirements
      
      setIsDataOk(data.ok);
      setMeta({ source: data.sourceUrl, status: data.upstreamStatus });
      
      if (data.ok) {
        setPlayers(data.players);
        setLastUpdated(new Date().toLocaleTimeString("en-US", {
          timeZone: "America/New_York", hour: 'numeric', minute: '2-digit', second: '2-digit'
        }));
      }
    } catch (err) {
      console.error("Polling failed:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isDataOk && !players.length) {
    return (
      <div className="bg-white border-t-4 border-[#2f3e4e] p-12 text-center shadow-2xl rounded-sm">
        <h3 className="text-xl font-black uppercase italic text-[#2f3e4e] mb-2">No Big Board Data Available</h3>
        <p className="text-[#9ea3a8] text-[10px] font-bold uppercase tracking-widest mb-6">Upstream source is currently unreachable or empty.</p>
        <div className="bg-gray-50 p-4 rounded text-left overflow-hidden">
          <p className="text-[8px] font-mono text-gray-400 break-all">Source: {meta.source || "None"}</p>
          <p className="text-[8px] font-mono text-gray-400">Status: {meta.status || 0}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl rounded-sm overflow-hidden">
      {lastUpdated && (
        <div className="bg-gray-50 px-6 py-2 border-b border-gray-100 text-right">
          <span className="text-[8px] font-bold text-[#9ea3a8] uppercase tracking-widest">Live ET: {lastUpdated}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="text-[10px] font-black uppercase text-[#9ea3a8] border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <th className="px-6 py-4 w-16">Rank</th>
              <th className="px-6 py-4">Player</th>
              <th className="px-6 py-4">School</th>
              <th className="px-6 py-4 text-center">PPG</th>
              <th className="px-6 py-4 text-center">RPG</th>
              <th className="px-6 py-4 text-center">APG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {players.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 text-2xl font-black text-[#9ea3a8] tabular-nums">{p.rank}</td>
                <td className="px-6 py-4 flex items-center gap-4">
                  {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded-full bg-gray-100 object-cover" />}
                  <div>
                    <div className="font-black text-base uppercase italic text-[#2f3e4e] leading-none">{p.name}</div>
                    <div className="text-[10px] font-bold text-[#9ea3a8] uppercase mt-1">{p.position}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#2f3e4e]">{p.school}</td>
                <td className="px-6 py-4 text-center font-mono font-black text-[#2f3e4e]">{p.ppg}</td>
                <td className="px-6 py-4 text-center font-mono font-black text-[#2f3e4e]">{p.rpg}</td>
                <td className="px-6 py-4 text-center font-mono font-black text-[#2f3e4e]">{p.apg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
