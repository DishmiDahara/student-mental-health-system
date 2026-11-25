# MindSpace — "Daybreak" design system

A calm, warm, private-feeling identity for student mental-health support.

## Concept
- **Daybreak (light)**: warm paper neutrals, sage-teal brand, apricot "sun" warmth, dusk-lavender accents.
- **Moonlit (dark)**: deep teal night with moon-mint accents (never pure black / neon purple).
- **Signature**: a theme-aware *Horizon* illustration (dawn by day, moonlit night in dark mode) and a *breathing orb*.
- **Mood faces**: custom SVG faces (1–5) replace emoji in the core mood interaction. The emoji is still saved to the API exactly as before.

## Where things live
| Path | Purpose |
|---|---|
| `src/index.css` | Design tokens (colour, type, radius, shadow, scene), base styles, shared component classes (`.card`, `.btn`, `.chip`, `.input`, `.seg`, `.tab`, `.modal`, `.alert`, `.nav-item`, …) and the shell/responsive rules |
| `src/App.css` | Page-level layouts (auth, dashboard bento, chat, resources, stepper, admin nav, mood picker) |
| `src/components/ui/Icon.jsx` | One consistent 106-icon stroke set (Feather, MIT) |
| `src/components/ui/Brand.jsx` | `Logo`, `Horizon`, `Orb`, `MoodFace` |
| `src/components/AppShell.jsx` + `Navbar.jsx` | Side rail (desktop) → icon rail (tablet) → top bar + bottom tabs (mobile) |
| `tools/tokenize_colors.py` | The codemod used to migrate the large legacy pages (MoodTracker, Booking, AdminDashboard) to tokens |

## Tokens (excerpt)
Use variables, never raw hex, so both themes work: `--bg --surface --surface-2 --surface-3 --line --ink --ink-2 --ink-3 --ink-4 --primary --primary-fill --primary-soft --primary-ink --sun/--dusk/--sky/--rose/--success/--warn/--danger` (each with `-fill`, `-soft`, `-ink`).
Fonts: **Fraunces** (display), **Figtree** (UI), **Noto Sans Sinhala** (Sinhala).

## Responsive
≥1181px full rail · 821–1180px icon rail · ≤820px top bar + bottom tab bar + "More" sheet. Safe-area insets respected (Capacitor).

## Accessibility
Visible focus rings, `prefers-reduced-motion` honoured, ≥44px touch targets, labelled icon buttons, `aria-current`/`aria-pressed`/radiogroup semantics.
