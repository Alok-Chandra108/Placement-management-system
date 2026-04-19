import { useState } from 'react'
import miteLogo from './assets/mite-logo.png'
import miteIcon from './assets/mite-icon.svg'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <img src={miteIcon} alt="MITE Icon" className="h-10 w-10 object-contain" />
            <div className="h-8 w-px bg-slate-200"></div>
            <img src={miteLogo} alt="MITE Logo" className="h-8 object-contain" />
          </div>
          
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#" className="font-medium text-slate-600 hover:text-primary transition-colors">Home</a>
            <a href="#" className="font-medium text-slate-600 hover:text-primary transition-colors">Drives</a>
            <a href="#" className="font-medium text-slate-600 hover:text-primary transition-colors">About</a>
            <button className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0">
              Portal Login
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold tracking-wide text-primary uppercase">
            MITE Mangalore Placement Portal
          </span>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            Where Ambition Meets <span className="text-secondary italic font-serif">Opportunity</span>.
          </h1>
          <p className="mb-10 text-xl leading-relaxed text-slate-600">
            A centralized platform for students, recruiters, and placement officers to streamline the recruitment lifecycle. Transform your potential into a career.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button className="rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-xl shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
              Get Started
            </button>
            <button className="rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 hover:border-primary hover:text-primary transition-all">
              View Recruiter Stats
            </button>
          </div>
        </div>

        {/* Dynamic Image / Visual */}
        <div className="mt-20 overflow-hidden rounded-3xl bg-slate-200 shadow-2xl">
          <div className="flex h-[400px] items-center justify-center bg-gradient-to-br from-primary to-slate-900 text-white">
            <p className="text-2xl font-medium opacity-50 italic">Professional Campus Imagery Placeholder</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p>© 2026 MITE Mangalore - MCA Mini Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
