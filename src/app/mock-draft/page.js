"use client";
import React, { useState } from 'react';
import { draftPicks } from '../picks/data'; // Import your cleaned pick data
import { prospects } from '../big-board/data'; // Assuming your big board is here

export default function ManualMockDraft() {
  // 1. State to track which player is assigned to which pick index
  const [selections, setSelections] = useState({});
  const [activePickIndex, setActivePickIndex] = useState(0);

  // 2. Generate a flat list of 2026 picks (Round 1 and 2)
  const allPicks2026 = Object.entries(draftPicks).flatMap(([team, picks]) => 
    picks.filter(p => p.year === 2026).map(p => ({ ...p, team }))
  ).sort((a, b) => (a.round === b.round ? 0 : a.round - b.round)); 

  // 3. Filter out players who have already been drafted
  const draftedPlayerIds = Object.values(selections).map(p => p.id);
  const availableProspects = prospects.filter(p => !draftedPlayerIds.includes(p.id));

  const handleSelectPlayer = (player) => {
    setSelections({
      ...selections,
      [activePickIndex]: player
    });
    // Automatically advance to the next pick
    if (activePickIndex < allPicks2026.length - 1) {
      setActivePickIndex(activePickIndex + 1);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* LEFT PANE: The Draft Order */}
      <div className="w-1/3 overflow-y-auto border-r border-gray-800 p-4">
        <h2 className="text-xl font-bold mb-4">Draft Order</h2>
        {allPicks2026.map((pick, index) => (
          <div 
            key={index}
            onClick={() => setActivePickIndex(index)}
            className={`p-3 mb-2 cursor-pointer rounded border ${
              activePickIndex === index ? 'border-green-500 bg-gray-900' : 'border-gray-700'
            }`}
          >
            <div className="flex justify-between">
              <span>Pick {index + 1} ({pick.team})</span>
              <span className="text-xs text-gray-500">R{pick.round}</span>
            </div>
            {selections[index] ? (
              <p className="text-green-400 font-bold">{selections[index].name}</p>
            ) : (
              <p className="text-gray-600 italic">Select Player...</p>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT PANE: Available Prospects */}
      <div className="w-2/3 overflow-y-auto p-4">
        <h2 className="text-xl font-bold mb-4">Available Prospects</h2>
        <div className="grid grid-cols-2 gap-4">
          {availableProspects.map(player => (
            <div 
              key={player.id}
              className="bg-gray-900 p-4 rounded border border-gray-700 flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{player.name}</p>
                <p className="text-sm text-gray-400">{player.position} | {player.school}</p>
              </div>
              <button 
                onClick={() => handleSelectPlayer(player)}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
              >
                Draft
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
