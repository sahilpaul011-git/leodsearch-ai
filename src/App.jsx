import './App.css'
import { useState } from 'react'

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  )
}

const SUGGESTIONS = [
  'How does quantum computing work?',
  'Compare React and Vue in 2026',
  'History of the printing press',
  'Explain black holes simply',
]

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke="url(#logo-grad)" strokeWidth="1.5" opacity="0.6" />
      <circle cx="20" cy="20" r="4" fill="url(#logo-grad)" />
      <line x1="20" y1="20" x2="8" y2="10" stroke="url(#logo-grad)" strokeWidth="1.2" opacity="0.8" />
      <line x1="20" y1="20" x2="32" y2="10" stroke="url(#logo-grad)" strokeWidth="1.2" opacity="0.8" />
      <line x1="20" y1="20" x2="6" y2="26" stroke="url(#logo-grad)" strokeWidth="1.2" opacity="0.8" />
      <line x1="20" y1="20" x2="34" y2="28" stroke="url(#logo-grad)" strokeWidth="1.2" opacity="0.8" />
      <line x1="20" y1="20" x2="20" y2="36" stroke="url(#logo-grad)" strokeWidth="1.2" opacity="0.8" />
      <circle cx="8" cy="10" r="2" fill="#428DFF" />
      <circle cx="32" cy="10" r="2" fill="#956BFF" />
      <circle cx="6" cy="26" r="2" fill="#956BFF" />
      <circle cx="34" cy="28" r="2" fill="#E36BCE" />
      <circle cx="20" cy="36" r="2" fill="#E36BCE" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#428DFF" />
          <stop offset="100%" stopColor="#E36BCE" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('web')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    // Search execution wires up in a later stage once the backend exists.
    console.log('Search submitted:', { query, mode })
  }

  return (
    <div className="home">
      <header className="home-nav">
        <div className="brand">
          <LogoMark />
          <span className="brand-name">LeodSearch AI</span>
        </div>
      </header>

      <main className="hero">
        <h1 className="hero-title">
          The universe of <span className="text-gradient">knowledge</span> awaits.
        </h1>
        <p className="hero-subtitle">Search deeper. Discover connections. Think beyond.</p>

        <form className="search-bar glow-border" onSubmit={handleSubmit}>
          <span className="search-icon"><SearchIcon /></span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything, or search the web..."
            className="search-input"
            aria-label="Search"
          />
          <button type="submit" className="search-submit">Search</button>
        </form>

        <div className="mode-selector" role="tablist" aria-label="Search mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'web'}
            className={`mode-chip ${mode === 'web' ? 'mode-chip-active' : ''}`}
            onClick={() => setMode('web')}
          >
            <GlobeIcon /> Web Search
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'knowledge'}
            className={`mode-chip ${mode === 'knowledge' ? 'mode-chip-active' : ''}`}
            onClick={() => setMode('knowledge')}
          >
            <SparkIcon /> Knowledge Search
          </button>
        </div>

        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="suggestion-chip"
              onClick={() => setQuery(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}