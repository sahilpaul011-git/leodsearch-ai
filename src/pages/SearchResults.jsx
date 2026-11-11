import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import WebNetworkBackground from '../components/WebNetworkBackground.jsx'
import { runWebSearch, runKnowledgeSearch } from '../api/searchClient.js'
import './SearchResults.css'

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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

function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3h7v7M10 14 21 3M12 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </svg>
  )
}

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const initialMode = searchParams.get('mode') === 'knowledge' ? 'knowledge' : 'web'

  const [mode, setMode] = useState(initialMode)
  const [inputValue, setInputValue] = useState(query)
  const [status, setStatus] = useState('loading') // loading | success | error
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!query.trim()) {
      setStatus('error')
      return
    }
    let cancelled = false
    setStatus('loading')
    setData(null)

    const fetcher = mode === 'knowledge' ? runKnowledgeSearch : runWebSearch
    fetcher(query)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [query, mode])

  const handleResubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    navigate(`/search?q=${encodeURIComponent(inputValue.trim())}&mode=${mode}`)
  }

  return (
    <div className="results-page">
      <WebNetworkBackground />

      <header className="results-nav">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label="Back to home">
          <BackIcon />
        </button>

        <form className="results-search-bar glow-border" onSubmit={handleResubmit}>
          <span className="search-icon"><SearchIcon /></span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="search-input"
            aria-label="Search"
          />
        </form>
      </header>

      <div className="results-mode-tabs" role="tablist" aria-label="Search mode">
        <button
          role="tab"
          aria-selected={mode === 'web'}
          className={`results-tab ${mode === 'web' ? 'results-tab-active' : ''}`}
          onClick={() => setMode('web')}
        >
          Web Search
        </button>
        <button
          role="tab"
          aria-selected={mode === 'knowledge'}
          className={`results-tab ${mode === 'knowledge' ? 'results-tab-active' : ''}`}
          onClick={() => setMode('knowledge')}
        >
          <SparkIcon /> Knowledge Search
        </button>
      </div>

      <main className="results-body">
        {status === 'loading' && (
          <div className="state-panel">
            <div className="spinner" aria-hidden="true" />
            <p>Searching for "{query}"...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="state-panel state-panel-error">
            <p>{query.trim() ? 'Something went wrong with that search.' : 'Type something to search for.'}</p>
            <button className="retry-btn" onClick={() => navigate('/')}>
              Back to search
            </button>
          </div>
        )}

        {status === 'success' && data?.isMock && (
          <div className="mock-banner">
            Demo data — this will be replaced by live web results and real AI answers once the backend is connected.
          </div>
        )}

        {status === 'success' && mode === 'web' && data && (
          <div className="result-list">
            {data.results.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="result-card glow-border">
                <div className="result-source">
                  <LinkIcon /> {r.source}
                </div>
                <h3 className="result-title">{r.title}</h3>
                <p className="result-snippet">{r.snippet}</p>
              </a>
            ))}
          </div>
        )}

        {status === 'success' && mode === 'knowledge' && data && (
          <div className="knowledge-panel">
            <div className="ai-answer-card surface-card">
              <div className="ai-answer-label">
                <SparkIcon /> AI-generated explanation
              </div>
              <p className="ai-answer-summary">{data.aiAnswer.summary}</p>
              <ul className="ai-answer-points">
                {data.aiAnswer.keyPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="sources-card surface-card">
              <h4 className="sources-label">Supporting sources</h4>
              <ul className="sources-list">
                {data.supportingSources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer">
                      <LinkIcon /> {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
