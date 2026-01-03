"use client";
import React, { useState, useMemo } from 'react';
import { draftPicks } from '../picks/data'; // Cleaned pick data
import { prospects } from '../big-board/data'; // New prospect data file

export default function ManualMockDraft() {
  const [selections, setSelections] = useState({});
  const [activePickIndex, setActivePickIndex] = useState(0);

  // Generate a list of all 2026 picks from your asset data
  const allPicks2026 = useMemo(() => {
    if (!draftPicks) return [];
    
    return Object.entries(draftPicks)
      .flatMap(([team, picks]) => 
        picks
          .filter(p => p.year === 2026)
          .map(p => ({ ...p, team }))
      )
      .sort((a, b) => {
        // Sort by round first
        if (a.round !== b.round) return a.round - b.round;
        return 0; // Standard sort; can be adjusted based on standings
      });
  }, []);

  // Track drafted players to remove them from the available list
  const draftedPlayerIds = Object.values(selections).map(p => p.id);
  const availableProspects = prospects.filter(p => !draftedPlayerIds.includes(p.id));

  const handleSelectPlayer = (player) => {
    setSelections(prev => ({
      ...prev,
      [activePickIndex]: player
    }));
    
    // Automatically move to the next pick
    if (activePickIndex < allPicks2026.length - 1) {
      setActivePickIndex(activePickIndex + 1);
    }
  };

  const handleReset = () => {
    setSelections({});
    setActivePickIndex(0);
  };

  return (
    <div className="flex h-screen bg-black text-white p-4 gap-4">
      {/* LEFT: Draft Order Pane */}
      <div className="w-1/3 overflow-y-auto border border-gray-800 rounded-lg p-4 bg-gray-950">
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <h2 className="text-2xl font-bold text-green-500">2026 Order</h2>
          <button 
            onClick={handleReset}
            className="text-xs bg-red-900/30 hover:bg-red-900 text-red-400 px-2 py-1 rounded transition-all"
          >
            Reset Draft
          </button>
        </div>

        <div className="space-y-2">
          {allPicks2026.map((pick, index) => (
            <div 
              key={index}
              onClick={() => setActivePickIndex(index)}
              className={`p-3 cursor-pointer rounded-md border transition-all ${
                activePickIndex === index 
                  ? 'border-green-500 bg-green-900/20 ring-1 ring-green-500' 
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-gray-500 font-mono">PICK {index + 1}</span>
                <span className="bg-gray-800 px-1.5 rounded text-gray-300 font-bold">{pick.team}</span>
              </div>
              {selections[index] ? (
                <div className="flex justify-between items-center">
                  <p className="text-white font-bold text-sm truncate">{selections[index].name}</p>
                  <span className="text-[10px] text-green-500 font-bold">SELECTED</span>
                </div>
              ) : (
                <p className="text-gray-600 text-xs italic">On the clock...</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Prospect Selection Pane */}
      <div className="w-2/3 overflow-y-auto border border-gray-800 rounded-lg p-4 bg-gray-950">
        <div className="mb-6 border-b border-gray-800 pb-4">
          <h2 className="text-2xl font-bold text-green-500">Available Prospects</h2>
          <p className="text-gray-400 text-sm">Select a player for Pick {activePickIndex + 1}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableProspects.map(player => (
            <div 
              key={player.id} 
              className="bg-gray-900 p-4 rounded-lg flex justify-between items-center border border-gray-800 hover:bg-gray-800/50 transition-colors group"
            >
              <div>
                <p className="font-bold text-lg group-hover:text-green-400 transition-colors">{player.name}</p>
                <p className="text-sm text-gray-400">{player.position} — {player.school}</p>
              </div>
              <button 
                onClick={() => handleSelectPlayer(player)}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold transition-all active:scale-95"
              >
                DRAFT
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
