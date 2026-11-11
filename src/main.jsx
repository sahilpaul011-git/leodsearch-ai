import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import SearchResults from './pages/SearchResults.jsx'
import './index.css'

// HashRouter is used (not BrowserRouter) because this site is hosted on
// GitHub Pages as a static site: a direct link to a path like /search
// would 404 on a real page refresh with BrowserRouter, since there's no
// server to redirect it back to index.html. Hash routes (#/search) always
// resolve to index.html first, so refreshes and shared links work.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
