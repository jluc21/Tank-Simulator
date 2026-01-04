import './globals.css'
import { Inter } from 'next/font/google'

// Using Inter as a clean, modern font. Feel free to change.
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Rebuild Watch',
  description: 'NBA Draft Simulator & Lottery Odds',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      {/* Applying base theme classes to the body:
        - bg-theme-main: Sets the global dark background.
        - text-theme-primary: Sets the default white text color.
      */}
      <body className={`${inter.className} bg-theme-main text-theme-primary min-h-screen flex flex-col`}>
        
        {/* A simple placeholder Navbar - replace with your actual Navbar component */}
        <nav className="flex items-center justify-between p-4 bg-theme-secondary border-b border-theme-secondary">
          <div className="font-black text-xl tracking-tighter">
            <span className="text-theme-blue">TANK</span>SIM
          </div>
          <div className="space-x-6 text-sm font-bold text-theme-secondary">
            <a href="/" className="hover:text-theme-primary transition">LOTTO ODDS</a>
            <a href="/big-board" className="hover:text-theme-primary transition">BIG BOARD</a>
            <a href="/team-assets" className="hover:text-theme-primary transition">TEAM ASSETS</a>
            <a href="/mock-draft" className="text-theme-green transition">MOCK DRAFT</a>
          </div>
        </nav>

        {/* Main content area */}
        <main className="flex-1">
          {children}
        </main>
        
      </body>
    </html>
  )
}
