import { useMemo, useState } from 'react'
import {
  NEEDS, NEED_ORDER, MOOD_GAME_THEMES,
  getRecommendedGames, getExploreGames
} from '../../data/moodGames'

// Mood-based games section for the existing Mood page.
//  - shows exactly 5 games recommended for the selected mood
//  - "Explore More Games": every other game, filterable and searchable
// It only decides WHAT to show; the Mood page's own launchers actually start
// the games through onPlay(game).
export default function MoodGamesSection({ selectedMood, onPlay }) {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const moodValue = selectedMood ? selectedMood.value : null
  const recommended = useMemo(() => (moodValue ? getRecommendedGames(moodValue) : []), [moodValue])
  const exploreAll = useMemo(() => getExploreGames(moodValue), [moodValue])

  const explore = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exploreAll.filter(game => {
      if (filter !== 'all' && !game.needs.includes(filter)) return false
      if (q && !`${game.title} ${game.desc}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [exploreAll, filter, query])

  const theme = moodValue ? MOOD_GAME_THEMES[moodValue] : null
  const accent = selectedMood ? selectedMood.color : '#6366f1'

  const countFor = key => (key === 'all' ? exploreAll.length : exploreAll.filter(game => game.needs.includes(key)).length)

  return (
    <div className="mg-root">
      <style>{`
        .mg-root { display: flex; flex-direction: column; gap: 24px; }
        .mg-panel { background: white; padding: 28px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .mg-rec-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }
        .mg-rec-card {
          position: relative; display: flex; flex-direction: column; text-align: left; padding: 0; overflow: hidden;
          border-radius: 20px; background: white; cursor: pointer; font-family: inherit;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .mg-rec-card:hover, .mg-rec-card:focus-visible { transform: translateY(-4px); outline: none; }
        .mg-rec-card:active { transform: translateY(-1px) scale(.99); }
        .mg-rec-art { position: relative; height: 92px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .mg-rec-icon { font-size: 44px; filter: drop-shadow(0 6px 10px rgba(0,0,0,.18)); animation: mgFloat 3.6s ease-in-out infinite; }
        .mg-rec-art::before, .mg-rec-art::after { content: ''; position: absolute; border-radius: 50%; background: rgba(255,255,255,.22); }
        .mg-rec-art::before { width: 90px; height: 90px; top: -34px; right: -20px; }
        .mg-rec-art::after { width: 56px; height: 56px; bottom: -22px; left: -12px; }
        .mg-badge-top { position: absolute; top: 8px; left: 8px; z-index: 1; font-size: 10.5px; font-weight: 800; letter-spacing: .02em; padding: 3px 9px; border-radius: 999px; background: rgba(255,255,255,.92); }
        .mg-rank { position: absolute; top: 8px; right: 8px; z-index: 1; width: 22px; height: 22px; border-radius: 50%; font-size: 11px; font-weight: 800; color: white; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,.35); }
        .mg-rec-body { padding: 14px 14px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .mg-rec-title { margin: 0; font-size: 14px; font-weight: 800; color: #1e293b; }
        .mg-rec-desc { margin: 0; font-size: 12px; line-height: 1.45; color: #64748b; flex: 1; }
        .mg-play { margin-top: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; border-radius: 12px; color: white; font-size: 12.5px; font-weight: 800; }
        .mg-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 14px; -webkit-overflow-scrolling: touch; }
        .mg-chip { flex: 0 0 auto; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; border-radius: 999px; padding: 7px 13px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; touch-action: manipulation; transition: all .15s ease; }
        .mg-chip:hover { border-color: #c7d2fe; background: #eef2ff; }
        .mg-chip[aria-pressed="true"] { color: white; border-color: transparent; }
        .mg-explore-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 12px; }
        .mg-card {
          display: flex; flex-direction: column; gap: 8px; text-align: left; padding: 14px; border-radius: 16px;
          border: 1px solid #e2e8f0; background: #f8fafc; cursor: pointer; font-family: inherit;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
        }
        .mg-card:hover, .mg-card:focus-visible { transform: translateY(-3px); background: white; border-color: #c7d2fe; box-shadow: 0 10px 22px rgba(99,102,241,.12); outline: none; }
        .mg-card-top { display: flex; align-items: center; gap: 10px; }
        .mg-card-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; background: white; border: 1px solid #e2e8f0; flex: 0 0 auto; }
        .mg-card-title { margin: 0; font-size: 13px; font-weight: 800; color: #1e293b; line-height: 1.25; }
        .mg-card-desc { margin: 0; font-size: 11.5px; line-height: 1.4; color: #64748b; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .mg-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: auto; }
        .mg-tag { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 999px; }
        .mg-search { width: 100%; box-sizing: border-box; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 13px; color: #1e293b; margin-bottom: 12px; font-family: inherit; }
        .mg-search:focus { outline: 2px solid #c7d2fe; background: white; }
        .mg-empty { border: 2px dashed #e2e8f0; border-radius: 16px; padding: 28px; text-align: center; color: #94a3b8; font-size: 13px; }
        .mg-ctrl-btn:hover { filter: brightness(1.08); }
        @keyframes mgFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
        @media (prefers-reduced-motion: reduce) { .mg-rec-icon { animation: none; } .mg-rec-card, .mg-card { transition: none; } }
        @media (max-width: 520px) {
          .mg-panel { padding: 20px 16px; border-radius: 20px; }
          .mg-rec-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .mg-rec-art { height: 76px; } .mg-rec-icon { font-size: 36px; }
          .mg-explore-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .mg-ctrl-label { display: none; }
        }
      `}</style>

      {/* ------------------------------------------------ Recommended */}
      <section className="mg-panel" aria-labelledby="mg-rec-title" style={moodValue ? { borderColor: `${accent}55`, boxShadow: `0 10px 30px ${accent}18` } : undefined}>
        <h3 id="mg-rec-title" style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold' }}>
          🎯 Recommended for Your Mood
        </h3>

        {moodValue ? (
          <>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 4px' }}>
              <strong style={{ color: accent }}>{selectedMood.emoji} {selectedMood.label}</strong> · {theme.headline}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: '0 0 18px' }}>
              {theme.blurb} Here are the {recommended.length} games we picked for you:
            </p>
            <div className="mg-rec-grid">
              {recommended.map((game, idx) => {
                const need = NEEDS[game.needs[0]]
                return (
                  <button
                    key={game.id}
                    type="button"
                    className="mg-rec-card"
                    onClick={() => onPlay(game)}
                    aria-label={`Play ${game.title}`}
                    style={{ border: `2px solid ${accent}55`, boxShadow: `0 6px 16px ${accent}1f` }}
                  >
                    <div className="mg-rec-art" style={{ background: `linear-gradient(135deg, ${need.color}, ${accent})` }}>
                      <span className="mg-badge-top" style={{ color: need.color }}>★ Recommended</span>
                      <span className="mg-rank" aria-hidden="true">{idx + 1}</span>
                      <span className="mg-rec-icon" aria-hidden="true">{game.icon}</span>
                    </div>
                    <div className="mg-rec-body">
                      <h4 className="mg-rec-title">{game.title}</h4>
                      <div className="mg-tags">
                        {game.needs.map(key => (
                          <span key={key} className="mg-tag" style={{ background: NEEDS[key].tint, color: NEEDS[key].color }}>
                            {NEEDS[key].icon} {NEEDS[key].short}
                          </span>
                        ))}
                        {game.badge && <span className="mg-tag" style={{ background: '#f1f5f9', color: '#475569' }}>{game.badge}</span>}
                      </div>
                      <p className="mg-rec-desc">{game.desc}</p>
                      <span className="mg-play" style={{ background: `linear-gradient(135deg, ${accent}, #764ba2)` }}>▶ Play now</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '18px' }}>
              Select a mood rating to get 5 games picked for how you feel right now.
            </p>
            <div className="mg-empty">Choose your mood rating first</div>
          </>
        )}
      </section>

      {/* ------------------------------------------------ Explore more */}
      <section className="mg-panel" aria-labelledby="mg-explore-title">
        <h3 id="mg-explore-title" style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold' }}>
          🧭 Explore More Games
        </h3>
        <p style={{ color: '#64748b', fontSize: '12.5px', margin: '0 0 16px' }}>
          {moodValue
            ? 'Everything else in the MindSpace collection. Play any game you like, even if it was not picked for your mood.'
            : 'The full MindSpace collection. Play any game you like.'}
        </p>

        <input
          type="search"
          className="mg-search"
          placeholder="Search games…"
          aria-label="Search games"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        <div className="mg-chips" role="group" aria-label="Filter games by what you need">
          {[{ key: 'all', label: 'All games', icon: '🎮', color: '#6366f1' }, ...NEED_ORDER.map(key => ({ key, label: NEEDS[key].label, icon: NEEDS[key].icon, color: NEEDS[key].color }))].map(chip => (
            <button
              key={chip.key}
              type="button"
              className="mg-chip"
              aria-pressed={filter === chip.key}
              onClick={() => setFilter(chip.key)}
              style={filter === chip.key ? { background: chip.color } : undefined}
            >
              {chip.icon} {chip.label} <span style={{ opacity: 0.75 }}>({countFor(chip.key)})</span>
            </button>
          ))}
        </div>

        {explore.length === 0 ? (
          <div className="mg-empty">No games match. Try another filter or search.</div>
        ) : (
          <div className="mg-explore-grid">
            {explore.map(game => (
              <button
                key={game.id}
                type="button"
                className="mg-card"
                onClick={() => onPlay(game)}
                aria-label={`Play ${game.title}`}
              >
                <div className="mg-card-top">
                  <span className="mg-card-icon" aria-hidden="true">{game.icon}</span>
                  <h4 className="mg-card-title">{game.title}</h4>
                </div>
                <p className="mg-card-desc">{game.desc}</p>
                <div className="mg-tags">
                  {game.needs.slice(0, 2).map(key => (
                    <span key={key} className="mg-tag" style={{ background: NEEDS[key].tint, color: NEEDS[key].color }}>
                      {NEEDS[key].icon} {NEEDS[key].short}
                    </span>
                  ))}
                  {game.badge && <span className="mg-tag" style={{ background: '#f1f5f9', color: '#475569' }}>{game.badge}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

