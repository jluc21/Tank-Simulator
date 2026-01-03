"use client";
import { useState, useEffect } from 'react';

const TEAMS = ["ATL","BOS","BKN","CHA","CHI","CLE","DAL","DEN","DET","GSW","HOU","IND","LAC","LAL","MEM","MIA","MIL","MIN","NOP","NYK","OKC","ORL","PHI","PHX","POR","SAC","SAS","TOR","UTA","WAS"];

export default function AssetManager() {
  const [team, setTeam] = useState("SAC");
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState("IDLE"); // IDLE, LOADING, SUCCESS, ERROR
  const [debugMsg, setDebugMsg] = useState("");

  useEffect(() => {
    async function fetchData() {
      setStatus("LOADING");
      setDebugMsg("");
      try {
        const res = await fetch(`/api/assets?team=${team}`, { cache: 'no-store' });
        const json = await res.json();

        if (json.success) {
          setAssets(json.data);
          setStatus("SUCCESS");
          setDebugMsg(`Successfully scraped: ${json.source}`);
        } else {
          setAssets([]);
          setStatus("ERROR");
          setDebugMsg(json.error || "Unknown API Error");
        }
      } catch (err) {
        setStatus("ERROR");
        setDebugMsg(err.message);
      }
    }
    fetchData();
  }, [team]);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold">Asset Manager <span className="text-emerald-500">v2.0</span></h1>
          <select 
            value={team} 
            onChange={(e) => setTeam(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded border border-gray-700 font-bold"
          >
            {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* DEBUG PANEL */}
        {status === "LOADING" && <div className="p-4 bg-blue-900/30 text-blue-200 rounded animate-pulse">📡 Contacting RealGM Database...</div>}
        {status === "ERROR" && <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded font-mono">❌ ERROR: {debugMsg}</div>}
        
        {/* DATA TABLE */}
        {status === "SUCCESS" && (
          <div className="border border-gray-800 rounded overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-900 text-gray-500 font-bold uppercase text-xs">
                <tr>
                  <th className="p-3">Year</th>
                  <th className="p-3">Rnd</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {assets.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500">No Assets Found (Check Source)</td></tr>
                ) : (
                  assets.map((a, i) => (
                    <tr key={i} className="hover:bg-gray-900">
                      <td className="p-3 font-mono font-bold">{a.year}</td>
                      <td className="p-3"><span className={a.round===1 ? "text-emerald-400" : "text-gray-500"}>{a.round===1 ? "1st" : "2nd"}</span></td>
                      <td className="p-3 font-bold">{a.from === "Own" ? <span className="opacity-50">Own</span> : <span className="text-emerald-400">{a.from}</span>}</td>
                      <td className="p-3 text-gray-400 text-xs">{a.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
