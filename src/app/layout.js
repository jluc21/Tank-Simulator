import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f5f5f5] text-[#2f3e4e]`}>
        {/* --- MASTER NAVIGATION --- */}
        <nav className="bg-[#2f3e4e] text-white px-8 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
          <div className="text-xl font-black tracking-tighter uppercase italic">
            REBUILD <span className="text-[#9ea3a8]">WATCH</span>
          </div>
          <div className="flex gap-8 text-xs font-bold tracking-widest uppercase">
            <a href="/" className="hover:text-[#d1d1d1] transition">Lotto Odds</a>
            <a href="/big-board" className="hover:text-[#d1d1d1] transition">Big Board</a>
            <a href="/team-assets" className="hover:text-[#d1d1d1] transition">Team Assets</a>
            <a href="/mock-draft" className="hover:text-[#d1d1d1] transition border-b border-[#9ea3a8] pb-1">Mock Draft</a>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
