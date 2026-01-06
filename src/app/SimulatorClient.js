/* src/app/SimulatorClient.js - Surgical Update */

/* ... (Keep existing imports and simulation logic) ... */

return (
  <>
    {/* Keep existing simulation controls buttons */}
    <div className="flex justify-center gap-4 mb-10 px-4">
      <button onClick={simLottery} disabled={isAnimating} className="bg-[#2f3e4e] text-white px-10 py-3 rounded font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 hover:bg-black">
        {isAnimating ? "Drawing..." : "Sim Lottery"}
      </button>
      <button onClick={() => setStandings(initialTeams)} className="bg-[#9ea3a8] text-white px-10 py-3 rounded font-black uppercase tracking-widest shadow-md hover:bg-[#2f3e4e] transition-colors">
        Reset
      </button>
    </div>

    <div className="bg-white border-t-4 border-[#2f3e4e] shadow-2xl rounded-sm overflow-hidden mx-auto max-w-5xl">
      {/* ADDED: Horizontal Scroll Container */}
      <div className="overflow-x-auto overflow-y-hidden touch-pan-x">
        {/* EDITED: Changed table-fixed to table-auto and added min-width for mobile parity */}
        <table className="w-full text-left min-w-[600px] md:min-w-full">
          <thead>
            <tr className="text-[10px] font-black uppercase text-[#9ea3a8] border-b border-gray-100 bg-gray-50/50">
              <th className="w-16 px-4 py-3">Pick</th>
              <th className="px-4 py-3">Team</th>
              <th className="w-24 px-2 py-3 text-center">Record</th>
              <th className="w-24 px-4 py-3 text-right">Top 4</th>
              <th className="w-28 px-4 py-3 text-right">#1 OVR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {standings.map((team, index) => {
              const originalIdx = initialTeams.findIndex(t => t.id === team.id);
              const diff = originalIdx - index;
              return (
                <React.Fragment key={team.id}>
                  <tr className="hover:bg-gray-50 transition-all group">
                    <td className="px-4 py-3 text-2xl font-black text-[#9ea3a8] tabular-nums relative">
                      {index + 1}
                      {!isAnimating && diff !== 0 && (
                        <span className={`absolute top-1 right-1 text-[8px] font-bold ${diff > 0 ? 'text-green-500' : 'text-red-400'}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-3 whitespace-nowrap">
                      <img src={(isAnimating && index < 4) ? shuffling[index] : team.logo} alt="" className="w-7 h-7 object-contain" />
                      <span className="font-black text-sm md:text-base uppercase italic tracking-tighter text-[#2f3e4e]">
                        {team.name}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center font-mono font-black text-[#2f3e4e] text-sm md:text-base whitespace-nowrap">
                      {team.record}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#2f3e4e] text-sm md:text-base whitespace-nowrap">
                      {originalIdx < 14 ? `${NBA_ODDS[originalIdx].p4.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-lg md:text-xl text-[#2f3e4e] whitespace-nowrap">
                      {originalIdx < 14 ? `${NBA_ODDS[originalIdx].p1.toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                  {index === 13 && (
                    <tr className="bg-[#2f3e4e]">
                      <td colSpan="5" className="py-3 text-center">
                        <span className="text-[11px] font-bold text-white uppercase tracking-[0.6em]">End of Lottery</span>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </>
);
