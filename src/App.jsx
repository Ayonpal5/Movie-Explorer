import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://api.tvmaze.com'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'

function stripHtml(value = '') { return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() }
function formatYear(show) { const date = show.premiered || show.ended; return date ? new Date(date).getFullYear() : 'TBA' }

function ShowCard({ show, onDetails }) {
  const image = show.image?.medium || show.image?.original || FALLBACK_IMAGE
  const rating = show.rating?.average ? show.rating.average.toFixed(1) : 'NR'
  return <article className="show-card">
    <button className="poster-button" type="button" onClick={() => onDetails(show)} aria-label={`View details for ${show.name}`}>
      <img src={image} alt={`${show.name} poster`} loading="lazy" />
      <span className="poster-overlay">View details <span aria-hidden="true">↗</span></span>
    </button>
    <div className="show-card__body"><div className="show-card__heading"><h3>{show.name}</h3><span className="score">{rating}</span></div>
      <div className="show-meta"><span>{formatYear(show)}</span><span className="dot">•</span><span>{show.genres?.[0] || 'Drama'}</span></div>
      <button className="text-button" type="button" onClick={() => onDetails(show)}>See details <span aria-hidden="true">→</span></button>
    </div>
  </article>
}

function DetailsModal({ show, onClose }) {
  useEffect(() => {
    if (!show) return undefined
    const handleKeyDown = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = '' }
  }, [show, onClose])
  if (!show) return null
  const image = show.image?.original || show.image?.medium || FALLBACK_IMAGE
  const summary = stripHtml(show.summary) || 'A new story is waiting to be discovered.'
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="close-button" type="button" onClick={onClose} aria-label="Close details">×</button>
      <div className="modal__image-wrap"><img src={image} alt={`${show.name} scene`} /></div>
      <div className="modal__content"><p className="eyebrow">Show profile</p><h2 id="modal-title">{show.name}</h2>
        <div className="modal__meta"><span className="modal-score">★ {show.rating?.average?.toFixed(1) || 'NR'}</span><span>{formatYear(show)}</span><span>{show.runtime ? `${show.runtime} min` : 'Series'}</span></div>
        <p className="modal__summary">{summary}</p>
        {show.genres?.length > 0 && <div className="genre-list">{show.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>}
        <a className="modal-link" href={show.officialSite || show.url} target="_blank" rel="noreferrer">Open TVMaze profile <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  </div>
}

function App() {
  const [page, setPage] = useState('home')
  const [shows, setShows] = useState([])
  const [query, setQuery] = useState('')
  const [selectedShow, setSelectedShow] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (page !== 'movies' || query.trim()) return undefined
    let cancelled = false
    setLoading(true); setError('')
    fetch(`${API_URL}/shows?page=0`).then((response) => { if (!response.ok) throw new Error(); return response.json() }).then((data) => !cancelled && setShows(data)).catch(() => !cancelled && setError('We could not reach TVMaze. Check your connection and try again.')).finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [page, query])

  useEffect(() => {
    if (page !== 'movies' || !query.trim()) return undefined
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setLoading(true); setError('')
      fetch(`${API_URL}/search/shows?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal }).then((response) => { if (!response.ok) throw new Error(); return response.json() }).then((results) => setShows(results.map((result) => result.show))).catch((requestError) => requestError.name !== 'AbortError' && setError('Search is unavailable right now.')).finally(() => !controller.signal.aborted && setLoading(false))
    }, 350)
    return () => { clearTimeout(timer); controller.abort() }
  }, [page, query])

  const goToMovies = () => { setPage('movies'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  return <div className="app-shell"><header className="site-header"><button className="brand" type="button" onClick={() => setPage('home')}><span className="brand-mark">M</span><span>Movie<span className="brand-light">Explorer</span></span></button><nav aria-label="Primary navigation"><button className={page === 'home' ? 'nav-link active' : 'nav-link'} type="button" onClick={() => setPage('home')}>Home</button><button className={page === 'movies' ? 'nav-link active' : 'nav-link'} type="button" onClick={goToMovies}>Movies</button></nav><button className="header-cta" type="button" onClick={goToMovies}>Explore shows <span aria-hidden="true">→</span></button></header>
    {page === 'home' ? <main><section className="hero-section"><div className="hero-copy"><p className="eyebrow">Your next great story</p><h1>Find the films<br /><em>that find you.</em></h1><p className="hero-description">A handpicked universe of remarkable shows, curious characters, and stories worth staying up for.</p><button className="primary-button" type="button" onClick={goToMovies}>Start exploring <span aria-hidden="true">↗</span></button></div><div className="hero-poster" aria-label="Featured show collage"><div className="hero-poster__main"><img src="https://static.tvmaze.com/uploads/images/original_untouched/1/4600.jpg" alt="Featured cinematic scene" /></div><div className="hero-poster__note"><span className="note-star">★</span><span><strong>Curated weekly</strong><small>Fresh picks for your watchlist</small></span></div><span className="hero-number">01</span></div></section><section className="intro-strip"><span>01 — DISCOVER</span><p>Browse beyond the box office. Explore a living library of stories from every genre and every era.</p><span>SCROLL TO EXPLORE ↓</span></section><section className="feature-section"><div><p className="eyebrow">A better way to browse</p><h2>Stories with<br /><em>somewhere to go.</em></h2></div><p>MovieExplorer makes the endless feel intentional. Search by title, follow your curiosity, and meet your next favorite show in a few clicks.</p><button className="outline-button" type="button" onClick={goToMovies}>Browse the library <span aria-hidden="true">→</span></button></section></main> : <main className="library-page"><section className="library-heading"><div><p className="eyebrow">The library</p><h1>Find your<br /><em>next watch.</em></h1></div><p>Every story has a starting point.<br />Take your time.</p></section><div className="search-wrap"><span className="search-icon" aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by show title..." aria-label="Search by show title" /><span className="search-hint">{query ? 'SEARCHING' : 'TRY “GIRLS”'}</span></div><section className="results-section"><div className="results-bar"><p>{query ? `Results for “${query}”` : 'All shows'}</p><span>{loading ? 'Loading...' : `${shows.length} titles`}</span></div>{error ? <div className="state-message"><h2>Something went quiet.</h2><p>{error}</p></div> : loading ? <div className="state-message"><div className="loader" /><p>Gathering stories...</p></div> : shows.length === 0 ? <div className="state-message"><h2>No titles found.</h2><p>Try a different search and we will keep looking.</p></div> : <div className="show-grid">{shows.map((show) => <ShowCard key={show.id} show={show} onDetails={setSelectedShow} />)}</div>}</section></main>}
  <footer className="site-footer"><div className="footer-brand"><span className="brand-mark">M</span><span>Movie<span className="brand-light">Explorer</span></span></div><p>Stories worth staying up for.</p><span>© 2026 MovieExplorer</span></footer><DetailsModal show={selectedShow} onClose={() => setSelectedShow(null)} /></div>
}

export default App
