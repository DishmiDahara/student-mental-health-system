import { useMemo, useState } from 'react'
import {
  NEEDS, NEED_ORDER, MOOD_GAME_THEMES,
  getRecommendedGames, getExploreGames
} from '../../data/moodGames'
import Icon from '../ui/Icon'

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
  const accent = selectedMood ? selectedMood.color : 'var(--primary)'

  const countFor = key => (key === 'all' ? exploreAll.length : exploreAll.filter(game => game.needs.includes(key)).length)

  return (
    <div className="mg-root">
      <style>{`
        .mg-root { display: flex; flex-direction: column; gap: 24px; }
        .mg-panel {
          background: var(--surface);
          padding: 28px;
          border-radius: var(--r-card, 24px);
          border: 1px solid var(--line);
          box-shadow: var(--shadow-sm);
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .mg-rec-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .mg-rec-card {
          position: relative;
          display: flex;
          flex-direction: column;
          text-align: left;
          padding: 0;
          overflow: hidden;
          border-radius: 18px;
          background: var(--surface-2);
          border: 1px solid var(--line);
          cursor: pointer;
          font-family: inherit;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }
        .mg-rec-card:hover, .mg-rec-card:focus-visible {
          transform: translateY(-3px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
          outline: none;
        }
        .mg-rec-art {
          position: relative;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .mg-rec-icon {
          font-size: 42px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,.15));
        }
        .mg-badge-top {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 1;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .02em;
          padding: 3px 9px;
          border-radius: 999px;
          background: rgba(255,255,255,.94);
          box-shadow: 0 2px 6px rgba(0,0,0,.08);
        }
        .mg-rank {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 1;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 800;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15,23,42,.45);
        }
        .mg-rec-body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .mg-rec-title {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: var(--ink);
        }
        .mg-rec-desc {
          margin: 0;
          font-size: 12px;
          line-height: 1.45;
          color: var(--ink-3);
          flex: 1;
        }
        .mg-play {
          margin-top: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          background: var(--primary-fill);
          transition: background .2s ease;
        }
        .mg-chips {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 6px;
          margin-bottom: 16px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .mg-chip {
          flex: 0 0 auto;
          border: 1px solid var(--line);
          background: var(--surface-2);
          color: var(--ink-2);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          touch-action: manipulation;
          transition: all .15s ease;
        }
        .mg-chip:hover {
          border-color: var(--primary);
          background: var(--primary-soft);
          color: var(--primary-ink);
        }
        .mg-chip[aria-pressed="true"] {
          color: white;
          border-color: transparent;
        }
        .mg-explore-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
          gap: 12px;
        }
        .mg-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid var(--line);
          background: var(--surface-2);
          cursor: pointer;
          font-family: inherit;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
        }
        .mg-card:hover, .mg-card:focus-visible {
          transform: translateY(-2px);
          background: var(--surface);
          border-color: var(--primary);
          box-shadow: var(--shadow-sm);
          outline: none;
        }
        .mg-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .mg-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          background: var(--surface);
          border: 1px solid var(--line);
          flex: 0 0 auto;
        }
        .mg-card-title {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.25;
        }
        .mg-card-desc {
          margin: 0;
          font-size: 11.5px;
          line-height: 1.4;
          color: var(--ink-3);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .mg-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: auto;
        }
        .mg-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
        }
        .mg-search {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 16px;
          border-radius: var(--r-pill, 999px);
          border: 1.5px solid var(--line-strong);
          background: var(--surface-2);
          font-size: 13.5px;
          color: var(--ink);
          margin-bottom: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .mg-search:focus {
          border-color: var(--primary);
          background: var(--surface);
          box-shadow: var(--ring);
        }
        .mg-empty {
          border: 1.5px dashed var(--line-strong);
          border-radius: 16px;
          padding: 32px 20px;
          text-align: center;
          color: var(--ink-4);
          font-size: 13px;
        }
        @media (max-width: 520px) {
          .mg-panel { padding: 20px 16px; }
          .mg-rec-grid { grid-template-columns: 1fr; }
          .mg-explore-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ------------------------------------------------ Recommended */}
      <section
        id="sec-recommended"
        className="mg-panel mg-scroll-panel"
        aria-labelledby="mg-rec-title"
        style={{
          maxHeight: '480px',
          display: 'flex',
          flexDirection: 'column',
          ...(moodValue ? { borderColor: `${accent}40` } : {})
        }}
      >
        <div className="mg-scroll-header row-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <h3 id="mg-rec-title" className="serif" style={{ color: 'var(--ink)', margin: '0 0 4px', fontSize: '19px' }}>
              Recommended Therapeutic Interventions
            </h3>
            <p className="small muted" style={{ margin: 0 }}>
              {moodValue
                ? `Evidence-based coping exercises tailored specifically to your ${selectedMood.label.toLowerCase()} mood rating.`
                : 'Select an emotional score on the left to activate targeted coping recommendations.'}
            </p>
          </div>
          {moodValue && (
            <span className="chip" style={{ background: `${accent}22`, color: accent, borderColor: `${accent}44`, fontWeight: 700 }}>
              {selectedMood.label} (Level {moodValue}/5)
            </span>
          )}
        </div>

        <div className="mg-scroll-body custom-scrollbar">
          {moodValue ? (
            <>
              <div className="notice notice-primary mb-16" style={{ padding: '12px 16px', borderRadius: '14px', fontSize: '13px' }}>
                <strong>Clinical Insight:</strong> {theme.headline} — {theme.blurb}
              </div>

              <div className="mg-rec-grid">
                {recommended.map((game, idx) => {
                  const need = NEEDS[game.needs[0]]
                  return (
                    <button
                      key={game.id}
                      type="button"
                      className="mg-rec-card"
                      onClick={() => onPlay(game)}
                      aria-label={`Launch ${game.title}`}
                    >
                      <div className="mg-rec-art" style={{ background: `linear-gradient(135deg, ${need.color}, ${accent})` }}>
                        <span className="mg-badge-top" style={{ color: need.color }}>Curated Exercise</span>
                        <span className="mg-rank" aria-hidden="true">#{idx + 1}</span>
                        <span className="mg-rec-icon" aria-hidden="true">{game.icon}</span>
                      </div>
                      <div className="mg-rec-body">
                        <h4 className="mg-rec-title">{game.title}</h4>
                        <div className="mg-tags">
                          {game.needs.map(key => (
                            <span key={key} className="mg-tag" style={{ background: NEEDS[key].tint, color: NEEDS[key].color }}>
                              {NEEDS[key].short}
                            </span>
                          ))}
                          {game.badge && <span className="mg-tag" style={{ background: 'var(--surface-3)', color: 'var(--ink-2)' }}>{game.badge}</span>}
                        </div>
                        <p className="mg-rec-desc">{game.desc}</p>
                        <span className="mg-play" style={{ background: `linear-gradient(135deg, ${accent}, var(--primary-fill))` }}>
                          Launch Exercise
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="mg-empty">
              <Icon name="smile" size={24} style={{ display: 'block', margin: '0 auto 8px', color: 'var(--ink-4)' }} />
              Please select your mood rating above to view your personalized coping exercises.
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ Explore more */}
      <section
        id="sec-library"
        className="mg-panel mg-scroll-panel"
        aria-labelledby="mg-explore-title"
        style={{
          maxHeight: '560px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="mg-scroll-header">
          <div className="row-between mb-8">
            <div>
              <h3 id="mg-explore-title" className="serif" style={{ color: 'var(--ink)', margin: '0 0 4px', fontSize: '19px' }}>
                Therapeutic Exercise Library &amp; Games
              </h3>
              <p className="small muted" style={{ margin: 0 }}>
                Explore our full collection of sensory grounding, breathing, and refocusing activities.
              </p>
            </div>
          </div>

          <input
            type="search"
            className="mg-search"
            placeholder="Search therapeutic exercises or keywords…"
            aria-label="Search exercises"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ marginBottom: '10px' }}
          />

          <div className="mg-chips" role="group" aria-label="Filter exercises by therapeutic need" style={{ marginBottom: 0 }}>
            {[{ key: 'all', label: 'All Interventions', icon: '✨', color: 'var(--primary-fill)' }, ...NEED_ORDER.map(key => ({ key, label: NEEDS[key].label, icon: NEEDS[key].icon, color: NEEDS[key].color }))].map(chip => (
              <button
                key={chip.key}
                type="button"
                className="mg-chip"
                aria-pressed={filter === chip.key}
                onClick={() => setFilter(chip.key)}
                style={filter === chip.key ? { background: chip.color, color: 'white', borderColor: 'transparent' } : undefined}
              >
                {chip.icon} {chip.label} <span style={{ opacity: 0.8 }}>({countFor(chip.key)})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mg-scroll-body custom-scrollbar">
          {explore.length === 0 ? (
            <div className="mg-empty">No exercises found matching your filter criteria.</div>
          ) : (
            <div className="mg-explore-grid">
              {explore.map(game => (
                <button
                  key={game.id}
                  type="button"
                  className="mg-card"
                  onClick={() => onPlay(game)}
                  aria-label={`Open ${game.title}`}
                >
                  <div className="mg-card-top">
                    <span className="mg-card-icon" aria-hidden="true">{game.icon}</span>
                    <h4 className="mg-card-title">{game.title}</h4>
                  </div>
                  <p className="mg-card-desc">{game.desc}</p>
                  <div className="mg-tags">
                    {game.needs.slice(0, 2).map(key => (
                      <span key={key} className="mg-tag" style={{ background: NEEDS[key].tint, color: NEEDS[key].color }}>
                        {NEEDS[key].short}
                      </span>
                    ))}
                    {game.badge && <span className="mg-tag" style={{ background: 'var(--surface-3)', color: 'var(--ink-2)' }}>{game.badge}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
