# Red Empire Field Guide — Split Version

Upload/deploy this entire folder to Cloudflare Pages. `index.html` must remain at the project root.

## Files
- `assets/css/styles.css` — all site styling
- `assets/js/trait-icons.js` — shared trait sprites and icon helpers
- `assets/js/core.js` — navigation, beginner tools, research tree, tabs
- `assets/js/battle-simulator.js` — troop tiers, combat math, battle simulator
- `assets/js/army-simulator.js` — single-noble upload and army analysis
- `assets/js/breeding-analyzer.js` — two-noble breeding analyzer
- `assets/js/site-widgets.js` — countdown, tips, PvP element panel

Load order matters. Keep the script tags in `index.html` in their existing order.

## Gen Alpha full-site redesign
The site now loads `assets/css/gen-alpha-theme.css` after the original stylesheet. This preserves all existing copy, IDs, navigation and JavaScript functionality while applying one coherent neon/glass/game-inspired design system across every view.

## Interactive motion layer
- `assets/css/interactive-effects.css`
- `assets/js/interactive-effects.js`

Adds desktop pointer tilt, shimmer sweeps, navigation icon motion, scroll reveals, ambient icon floating, button feedback, subtle footer parallax, and reduced-motion accessibility support.
