import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-64px)]"> {/* Adjust height based on navbar */}

      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-1/3 bg-theme-secondary p-8 flex flex-col justify-between border-r border-theme-secondary">
        <div>
          {/* Logo & Title */}
          <div className="flex items-center gap-4 mb-12">
            {/* Replace with your actual logo */}
            <div className="w-16 h-16 relative">
              <Image src="https://a.espncdn.com/i/teamlogos/nba/500/atl.png" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-black leading-none uppercase">
                Rebuild<br />
                <span className="text-theme-green">Watch</span>
              </h1>
            </div>
          </div>

          {/* Main Headline */}
          <div className="mb-12">
            <h2 className="text-5xl font-black text-theme-green mb-4">
              LOT6 NBA LOTTOS
            </h2>
            <p className="text-2xl text-theme-secondary font-medium">
              Daily Lottery Simulation
            </p>
          </div>

          {/* Call to Action Button */}
          <button className="w-full py-4 bg-theme-blue text-white text-xl font-bold rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
            SIMULATE LOTTERY
          </button>
        </div>

        {/* Asset Manager Section (Simplified for example) */}
        <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-theme-green">Asset Manager v2.0</h3>
                <button className="text-sm text-theme-secondary bg-theme-tertiary px-3 py-1 rounded border border-theme-secondary hover:text-theme-primary">Reset Craft</button>
            </div>
            <div className="bg-theme-tertiary p-4 rounded-lg border border-theme-secondary flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image src="https://a.espncdn.com/i/teamlogos/nba/500/atl.png" width={24} height={24} alt="ATL" />
                    <span className="font-bold">ATL</span>
                </div>
                <span className="text-theme-secondary">ATL</span>
            </div>
        </div>
      </aside>


      {/* --- RIGHT CONTENT AREA (Big Board Preview) --- */}
      <main className="w-2/3 p-8 bg-theme-main flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold">
            2026 NBA Draft <span className="font-black">Big Board</span>
          </h2>
          <p className="text-theme-secondary text-sm font-bold tracking-widest mt-2 uppercase">
            Loading Live Stats...
          </button>
        </div>

        {/* Big Board Card */}
        <div className="flex-1 bg-theme-secondary rounded-2xl border-2 border-theme-green overflow-hidden shadow-2xl shadow-green-900/20 relative">
          {/* Decorative Green Glow */}
          <div className="absolute inset-x-0 top-0 h-1 bg-theme-green shadow-[0_0_20px_rgba(34,197,94,0.6)]"></div>

          <div className="bg-theme-tertiary py-3 px-6 text-center border-b border-theme-secondary">
            <h3 className="text-sm font-bold text-theme-green tracking-[0.15em] uppercase">Consensus Rankings</h3>
          </div>

          {/* Player List - Using a few static examples */}
          <div className="p-2">
            {[
              { rank: 1, name: "Darryn Peterson", team: "Kansas", ppg: "19.9", img: "https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png" },
              { rank: 2, name: "Cameron Boozer", team: "Duke", ppg: "21.1", img: "https://a.espncdn.com/i/teamlogos/ncaa/500/150.png" },
              { rank: 3, name: "AJ Dybantsa", team: "BYU", ppg: "20.4", img: "https://a.espncdn.com/i/teamlogos/ncaa/500/252.png" },
              { rank: 4, name: "Caleb Wilson", team: "UNC", ppg: "18.9", img: "https://a.espncdn.com/i/teamlogos/ncaa/500/153.png" },
              { rank: 5, name: "Nate Ament", team: "Tennessee", ppg: "17.5", img: "https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png" },
            ].map((player) => (
              <div key={player.rank} className="flex items-center p-4 m-2 bg-theme-tertiary rounded-xl border border-theme-secondary hover:border-theme-green transition-colors group">
                <div className="text-3xl font-black w-12 text-center text-theme-secondary group-hover:text-white">{player.rank}</div>
                <div className="w-16 h-16 relative mx-4">
                  <Image src={player.img} alt={player.team} fill className="object-contain drop-shadow-md" />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold leading-none">{player.name}</h4>
                  <div className="text-theme-secondary text-sm font-bold mt-1 flex items-center gap-2">
                    <span>G</span> • <span className="uppercase">{player.team}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-theme-green leading-none">{player.ppg} <span className="text-sm font-bold text-theme-secondary">PPG</span></div>
                  <div className="text-xs text-theme-secondary font-bold mt-1">
                    5.9 REB • 2.1 AST
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
