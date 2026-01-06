import BigBoardClient from './BigBoardClient';

export default async function BigBoardPage() {
  // Use absolute URL or local function for server-side fetch
  const API_URL = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/big-board`;
  
  let players = [];
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    players = await res.json();
  } catch (e) {
    console.error("Failed to fetch Big Board data", e);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] p-4 md:p-8 font-sans text-[#2f3e4e]">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-2">
            2026 NBA BIG BOARD
          </h1>
        </header>
        <BigBoardClient players={players} />
      </div>
    </main>
  );
} 
