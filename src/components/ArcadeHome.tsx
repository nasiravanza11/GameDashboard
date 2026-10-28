import { useMemo, useState } from 'react'
import {
  gameCategories,
  games,
  newGames,
  popularGames,
  recommendedGames,
  searchGames,
} from '../data/games'
import type { Game } from '../types/game'
import { PlayButton } from './PlayButton'
import { TileArt } from './TileArt'

type ArcadeHomeProps = {
  onPlay: (game: Game) => void
  onDetail: (game: Game) => void
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
}

const quickFilters = ['All Games', 'Free Games', 'Slots', 'Fishing', 'Puzzle', 'Popular', 'New']

function gameMode(game: Game) {
  if (game.category === 'Slots' || game.category === 'Fishing') return 'CASH'
  return 'FREE'
}

function filterGames(filter: string) {
  if (filter === 'All Games') return games
  if (filter === 'Free Games') return games.filter((game) => gameMode(game) === 'FREE')
  if (filter === 'Popular') return popularGames
  if (filter === 'New') return newGames
  return searchGames(filter, games)
}

function ArcadeTile({
  game,
  featured = false,
  isFavorite,
  onPlay,
  onDetail,
  onToggleFavorite,
}: {
  game: Game
  featured?: boolean
  isFavorite: boolean
  onPlay: (game: Game) => void
  onDetail: (game: Game) => void
  onToggleFavorite: (id: string) => void
}) {
  const mode = gameMode(game)

  return (
    <article className={`arcade-tile ${featured ? 'arcade-tile-featured' : ''}`}>
      <button type="button" className="arcade-tile-art" onClick={() => onDetail(game)}>
        <TileArt game={game} />
        <span className={`arcade-mode-badge ${mode === 'CASH' ? 'is-cash' : ''}`}>{mode}</span>
      </button>
      <div className="arcade-tile-copy">
        <div>
          <p className="arcade-tile-title">{game.name}</p>
          <p className="arcade-tile-meta">{game.category}</p>
        </div>
        <div className="arcade-tile-actions">
          <button
            type="button"
            className={`arcade-heart ${isFavorite ? 'is-active' : ''}`}
            onClick={() => onToggleFavorite(game.id)}
            aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
          >
            ♥
          </button>
          <button type="button" className="arcade-mini-play" onClick={() => onPlay(game)}>
            Play
          </button>
        </div>
      </div>
    </article>
  )
}

export function ArcadeHome({ onPlay, onDetail, favorites, onToggleFavorite }: ArcadeHomeProps) {
  const [filter, setFilter] = useState('All Games')
  const heroGame = recommendedGames[0] ?? popularGames[0] ?? games[0]

  const filtered = useMemo(() => filterGames(filter), [filter])
  const freeGames = filtered.filter((game) => gameMode(game) === 'FREE').slice(0, 4)
  const cashGames = filtered.filter((game) => gameMode(game) === 'CASH').slice(0, 4)
  const fallbackCash = games.filter((game) => gameMode(game) === 'CASH').slice(0, 4)
  const secondRow = cashGames.length > 0 ? cashGames : fallbackCash
  const liveCategories = gameCategories.filter((category) => category !== 'Favorites').length

  if (!heroGame) return null

  return (
    <div className="arcade-home">
      <section className="arcade-hero-panel">
        <div className="arcade-hero-copy">
          <p className="arcade-kicker">01 - Unified Arcade Lobby</p>
          <h1>One lobby. Every game.</h1>
          <p>
            Browse, preview, and launch WebGL games from one neon portal built for LUCKYFLARE.
          </p>
          <div className="arcade-hero-actions">
            <PlayButton glow={heroGame.glow} onClick={() => onPlay(heroGame)} label="Play now" />
            <button type="button" className="arcade-secondary-btn" onClick={() => onDetail(heroGame)}>
              View details
            </button>
          </div>
        </div>
        <div className="arcade-hero-card">
          <div className="arcade-hero-art">
            <TileArt game={heroGame} />
          </div>
          <div>
            <p className="arcade-hero-label">Featured Launch</p>
            <h2>{heroGame.name}</h2>
            <p>{heroGame.tagline}</p>
          </div>
        </div>
      </section>

      <div className="arcade-filter-row" role="tablist" aria-label="Game filters">
        {quickFilters.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={filter === item}
            className={`arcade-filter-chip ${filter === item ? 'is-active' : ''}`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="arcade-section">
        <div className="arcade-section-head">
          <div>
            <p className="arcade-kicker">Free Games</p>
            <h2>Instant fun. No barriers.</h2>
          </div>
          <span>{freeGames.length} ready</span>
        </div>
        <div className="arcade-tile-grid">
          {freeGames.map((game, index) => (
            <ArcadeTile
              key={game.id}
              game={game}
              featured={index === 0}
              isFavorite={favorites.has(game.id)}
              onPlay={onPlay}
              onDetail={onDetail}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>

      <section className="arcade-section">
        <div className="arcade-section-head">
          <div>
            <p className="arcade-kicker">Cash / Demo Games</p>
            <h2>Try slots and fishing risk-free.</h2>
          </div>
          <span>{liveCategories} categories</span>
        </div>
        <div className="arcade-tile-grid">
          {secondRow.map((game) => (
            <ArcadeTile
              key={game.id}
              game={game}
              isFavorite={favorites.has(game.id)}
              onPlay={onPlay}
              onDetail={onDetail}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
