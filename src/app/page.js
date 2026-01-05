// src/app/page.js
import { getLiveStandings } from '@/lib/espn';

export default async function StandingsPage() {
  const report = await getLiveStandings();

  // ERROR PANEL: Shown only if NO real data exists
  if (!report.success || report.teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-6">
        <div className="max-w-md w-full bg-white border-t-4 border-red-600 p-8 shadow-2xl rounded-lg">
          <h2 className="text-2xl font-black text-slate uppercase italic mb-4">Service Unavailable</h2>
          <p className="text-grayMuted mb-6 font-medium">
            Live ESPN standings are currently unreachable. Please check your connection or try again later.
          </p>
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
            Error: {report.error || "No data entries found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-light text-slate tracking-tight mb-4">
            2026 NBA Standings
          </h1>
          <p className="text-[10px] font-black text-grayMuted uppercase tracking-[0.3em]">
            Last Updated: {new Date(report.timestamp).toLocaleTimeString()}
          </p>
        </header>

        <div className="bg-white border-t-4 border-slate shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-black uppercase text-grayMuted border-b border-gray-100">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Team</th>
                <th className="px-6 py-4 text-center">W-L</th>
                <th className="px-6 py-4 text-right">Win %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {report.teams.map((team, index) => (
                <tr key={team.id || index} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-300">{index + 1}</td>
                  <td className="px-6 py-4 flex items-center gap-4">
                    {team.logo ? (
                      <img 
                        src={team.logo} 
                        alt="" 
                        className="w-8 h-8 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                      />
                    ) : null}
                    {/* Fallback abbreviation if logo fails */}
                    <span className="hidden w-8 h-8 bg-gray-100 rounded-full text-[10px] font-bold items-center justify-center">
                      {team.abbreviation}
                    </span>
                    <span className="font-black text-lg text-slate uppercase italic group-hover:not-italic">
                      {team.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-grayMuted">
                    {team.record}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate">
                    {team.winPct}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
