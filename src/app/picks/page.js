"use client";
import React, { useState } from 'react';
import { draftPicks } from './data'; // This imports your manual list directly

export default function AssetManager() {
  const [selectedTeam, setSelectedTeam] = useState('ATL');

  // Instead of fetching from an API, we just look up the team in our data file
  const currentPicks = draftPicks[selectedTeam] || [];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Asset Manager v2.0</h1>
      
      {/* Team Selector Dropdown */}
      <select 
        value={selectedTeam} 
        onChange={(e) => setSelectedTeam(e.target.value)}
        className="bg-gray-800 text-white p-2 rounded mb-6"
      >
        {Object.keys(draftPicks).map(team => (
          <option key={team} value={team}>{team}</option>
        ))}
      </select>

      {/* Displaying the Picks */}
      <div className="space-y-4">
        {currentPicks.map((pick, index) => (
          <div key={index} className="border-b border-gray-700 pb-2">
            <p className="font-bold">{pick.year} Round {pick.round}</p>
            <p className="text-sm text-gray-400">From: {pick.from}</p>
            {pick.notes && <p className="text-xs italic text-gray-500">{pick.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
