import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Tank Simulator',
  description: 'NBA Tanking Simulator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-900">
        
        {/* GLOBAL NAVIGATION BAR */}
        <nav className="bg-black border-b border-gray-800 p-4 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            {/* LOGO */}
            <div className="font-black text-xl tracking-tighter text-white">
              TANK<span className="text-emerald-500">SIM</span>
            </div>
            
            {/* NAVIGATION LINKS */}
            <div className="flex gap-6 text-sm font-bold uppercase tracking-wide">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Lotto Odds
              </Link>
              <Link href="/big-board" className="text-gray-400 hover:text-white transition-colors">
                Big Board
              </Link>
              <Link href="/picks" className="text-gray-400 hover:text-white transition-colors">
                Team Assets
              </Link>
              <Link href="/mock-draft" className="text-gray-400 hover:text-white transition-colors">
                Mock Draft
              </Link>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
