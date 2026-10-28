import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { games, searchGames } from '../data/games'
import { PAGE_TITLES, PORTAL_NAV } from '../portal/pages'
import type { PortalPage } from '../portal/pages'
import type { Game } from '../types/game'
import {
  addRecentlyPlayed,
  getFavorites,
  getRecentlyPlayed,
  getSettings,
  saveSettings,
  toggleFavorite,
  type PortalSettings,
} from '../utils/portalStorage'
import { GamePlayerModal } from './GamePlayerModal'
import { LeaderboardFullModal } from './LeaderboardSection'
import {
  ArticleModal,
  GameDetailDrawer,
  HelpTopicModal,
  type ArticlePayload,
} from './PortalOverlays'
import { PortalPageLoader } from './PortalPageLoader'
import { PortalPageViews } from './PortalPageViews'

export function GameDashboard() {
  const [page, setPage] = useState<PortalPage>('home')
  const [contentPage, setContentPage] = useState<PortalPage>('home')
  const [pageLoading, setPageLoading] = useState(false)
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [detailGame, setDetailGame] = useState<Game | null>(null)
  const [category, setCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites())
  const [recent, setRecent] = useState(() => getRecentlyPlayed())
  const [settings, setSettings] = useState<PortalSettings>(() => getSettings())
  const [article, setArticle] = useState<ArticlePayload | null>(null)
  const [helpTopic, setHelpTopic] = useState<string | null>(null)
  const [leaderboardFull, setLeaderboardFull] = useState(false)
  const [, setRatingTick] = useState(0)
  const mainRef = useRef<HTMLElement>(null)

  const favoriteSet = useMemo(() => new Set(favorites), [favorites])
  const searchResults = useMemo(
    () => (searchQuery.trim() ? searchGames(searchQuery).slice(0, 6) : []),
    [searchQuery],
  )

  const recordPlay = useCallback((game: Game) => {
    setRecent(addRecentlyPlayed(game))
  }, [])

  const handlePlay = useCallback(
    (game: Game) => {
      recordPlay(game)
      setActiveGame(game)
    },
    [recordPlay],
  )

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites(toggleFavorite(id))
  }, [])

  const scrollPortalTop = useCallback((behavior: ScrollBehavior = 'auto') => {
    window.scrollTo({ top: 0, left: 0, behavior })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior })
  }, [])

  const scrollToFaq = useCallback(() => {
    const behavior = settings.reducedAnimations ? ('auto' as const) : ('smooth' as const)
    document.getElementById('section-faq')?.scrollIntoView({ behavior, block: 'start' })
  }, [settings.reducedAnimations])

  const navigate = useCallback(
    (next: PortalPage) => {
      if (next === 'favorites') setCategory('Favorites')
      if (next === 'games' && category === 'Favorites' && page === 'favorites') setCategory('All')

      if (next === 'faq') {
        setPage(next)
        setContentPage(next)
        requestAnimationFrame(() => scrollToFaq())
        return
      }

      const scrollTop = () => {
        scrollPortalTop(settings.reducedAnimations ? 'auto' : 'smooth')
      }

      if (next === page && !pageLoading) {
        scrollTop()
        return
      }

      setPage(next)
      setPageLoading(true)
      requestAnimationFrame(() => {
        setContentPage(next)
        setPageLoading(false)
        scrollTop()
      })
    },
    [category, page, pageLoading, scrollPortalTop, scrollToFaq, settings.reducedAnimations],
  )

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    setPage('home')
    setContentPage('home')
    setPageLoading(false)

    const snapTop = () => scrollPortalTop('auto')
    snapTop()
    const raf = requestAnimationFrame(snapTop)
    const t = window.setTimeout(snapTop, 0)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
    }
  }, [scrollPortalTop])

  useEffect(() => {
    if (pageLoading || contentPage === 'faq') return
    scrollPortalTop(settings.reducedAnimations ? 'auto' : 'smooth')
  }, [contentPage, pageLoading, scrollPortalTop, settings.reducedAnimations])

  useEffect(() => {
    saveSettings(settings)
    document.documentElement.classList.toggle('portal-reduced-motion', settings.reducedAnimations)
    document.documentElement.classList.toggle('portal-compact', settings.compactCards)
  }, [settings])

  useEffect(() => {
    if (activeGame) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeGame])

  const recentGames = useMemo(() => {
    return recent
      .map((r) => games.find((g) => g.id === r.id))
      .filter((g): g is Game => g != null)
  }, [recent])

  return (
    <>
      <div className="mosaic-backdrop arcade-backdrop" aria-hidden>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <rect width="1440" height="900" fill="#12092c" />
          <circle cx="50" cy="-40" r="170" fill="#ff5d5d" opacity="0.85" />
          <circle cx="1360" cy="30" r="170" fill="#b8f52d" opacity="0.9" />
          <circle cx="70" cy="860" r="220" fill="#b8f52d" opacity="0.9" />
          <circle cx="1170" cy="740" r="270" fill="#ff5d5d" opacity="0.2" />
        </svg>
      </div>

      <div className="arcade-dashboard-shell">
        <aside className="arcade-sidebar" aria-label="LUCKYFLARE navigation">
          <div className="arcade-brand">
            <span className="arcade-brand-mark">LF</span>
            <span>LUCKYFLARE</span>
          </div>
          <nav className="arcade-nav-list">
            {PORTAL_NAV.map((item) => (
              <button
                key={item.page}
                type="button"
                className={`arcade-nav-item ${page === item.page ? 'is-active' : ''}`}
                onClick={() => navigate(item.page)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="arcade-workspace">
          <header className="arcade-topbar">
            <div>
              <p className="arcade-topbar-kicker">LUCKYFLARE Lobby</p>
              <h1>{PAGE_TITLES[page]}</h1>
            </div>
            <div className="arcade-search-wrap">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search games"
                aria-label="Search games"
              />
              {searchResults.length > 0 && (
                <div className="arcade-search-results">
                  {searchResults.map((game) => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => {
                        setDetailGame(game)
                        setSearchQuery('')
                      }}
                    >
                      <span>{game.name}</span>
                      <small>{game.category}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="arcade-player-pill">
              <span className="arcade-avatar">PX</span>
              <span>
                PlayerX
                <small>Level 25</small>
              </span>
            </div>
            <div className="arcade-wallet-pill">
              <span>●</span>
              2,450.00
            </div>
          </header>

          <main ref={mainRef} className="mosaic-main arcade-main">
            <div className="relative min-h-[50vh]">
              <AnimatePresence>{pageLoading ? <PortalPageLoader key="portal-page-load" page={page} /> : null}</AnimatePresence>
              <div
                className={`transition-opacity duration-300 ease-out ${pageLoading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
                aria-busy={pageLoading}
              >
                <PortalPageViews
                  page={contentPage}
                  onPlay={handlePlay}
                  onDetail={setDetailGame}
                  favorites={favoriteSet}
                  onToggleFavorite={handleToggleFavorite}
                  recentGames={recentGames}
                  category={category}
                  onCategoryChange={setCategory}
                  searchQuery={searchQuery}
                  settings={settings}
                  onSettingsChange={setSettings}
                  onOpenArticle={setArticle}
                  onOpenHelp={setHelpTopic}
                  onViewFullLeaderboard={() => setLeaderboardFull(true)}
                  onNavigate={navigate}
                  scrollToFaq={scrollToFaq}
                />
              </div>
            </div>
          </main>

          <div className="arcade-mobile-nav" aria-label="Mobile navigation">
            {PORTAL_NAV.slice(0, 5).map((item) => (
              <button
                key={`mobile-${item.page}`}
                type="button"
                className={page === item.page ? 'is-active' : ''}
                onClick={() => navigate(item.page)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GamePlayerModal game={activeGame} onClose={() => setActiveGame(null)} />

      <GameDetailDrawer
        game={detailGame}
        isFavorite={detailGame ? favoriteSet.has(detailGame.id) : false}
        onClose={() => setDetailGame(null)}
        onPlay={(g) => {
          setDetailGame(null)
          handlePlay(g)
        }}
        onToggleFavorite={handleToggleFavorite}
        onRated={() => setRatingTick((t) => t + 1)}
      />

      <ArticleModal article={article} onClose={() => setArticle(null)} />
      <LeaderboardFullModal open={leaderboardFull} onClose={() => setLeaderboardFull(false)} />
      <HelpTopicModal topic={helpTopic} onClose={() => setHelpTopic(null)} />
    </>
  )
}
