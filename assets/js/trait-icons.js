// ═══════════════════════════════════════════════════════════
// ── TRAIT ICON SYSTEM ──
//
// Contains all trait icons for the Red Empire Field Guide.
// Sprite sheets (7 categories) + individual Mythical icons.
//
// Usage:
//   const style = getTraitIconStyle("Fanatical", true, 56);
//   <div style="${style}"></div>
//
// Mythical icons: extracted directly from in-game screenshots.
// 7 confirmed: Cunning, Martial, Wise, Inspiring, Staunch, Fanatical, Tough.
//
// NOTE ON SPRITE OFFSETS (fixed 2026-07-01):
// The source PNGs each have a title header baked in ("Combat Traits" etc.)
// plus irregular padding, so the icon grid does NOT start at pixel (0,0).
// Each sheet below carries its own measured offsetX/offsetY (top-left of
// the actual grid) and pitchX/pitchY (spacing between cell starts), plus
// native image dimensions and per-cell size. getTraitIconStyle() uses
// these to compute correct background-position/background-size instead
// of assuming a clean zero-offset grid.
// ═══════════════════════════════════════════════════════════

const TRAIT_SPRITE_SHEETS = {
  combat:      { src: "assets/images/traits/trait-icon-1.png", nativeW: 338, nativeH: 202, offsetX: 11, offsetY: 64, pitchX: 64.5,  pitchY: 64,   cell: 60 },
  interaction: { src: "assets/images/traits/trait-icon-2.png", nativeW: 272, nativeH: 271, offsetX: 6,  offsetY: 53, pitchX: 44.4,  pitchY: 44.5, cell: 40 },
  trading:     { src: "assets/images/traits/trait-icon-3.png", nativeW: 320, nativeH: 175, offsetX: 0,  offsetY: 48, pitchX: 64.25, pitchY: 65,   cell: 60 },
  exploration: { src: "assets/images/traits/trait-icon-4.png", nativeW: 397, nativeH: 175, offsetX: 6,  offsetY: 42, pitchX: 64.4,  pitchY: 65,   cell: 60 },
  mining:      { src: "assets/images/traits/trait-icon-5.png", nativeW: 455, nativeH: 177, offsetX: 5,  offsetY: 37, pitchX: 64.5,  pitchY: 65,   cell: 59 },
  negative:    { src: "assets/images/traits/trait-icon-6.png", nativeW: 263, nativeH: 301, offsetX: 10, offsetY: 44, pitchX: 64.33, pitchY: 64.33,cell: 60 },
  special:     { src: "assets/images/traits/trait-icon-7.png", nativeW: 457, nativeH: 201, offsetX: 9,  offsetY: 53, pitchX: 64.5,  pitchY: 65,   cell: 60 },
};

const TRAIT_ICON_MAP = {
  "Fanatical": {sheet:"combat",row:0,col:0},
  "Inspiring": {sheet:"combat",row:0,col:1},
  "Staunch": {sheet:"combat",row:0,col:2},
  "Cunning": {sheet:"combat",row:0,col:3},
  "Wise": {sheet:"combat",row:0,col:4},
  "Martial": {sheet:"combat",row:1,col:0},
  "Tough": {sheet:"combat",row:1,col:1},
  "Chivalrous": {sheet:"combat",row:1,col:2},
  "Devoted": {sheet:"combat",row:1,col:3},
  "Inbred": {sheet:"combat",row:1,col:4},
  "Astute": {sheet:"trading",row:0,col:0},
  "Charismatic": {sheet:"trading",row:0,col:1},
  "Engaging": {sheet:"trading",row:0,col:2},
  "Engrossing": {sheet:"trading",row:0,col:3},
  "Likeable": {sheet:"trading",row:0,col:4},
  "Persuasive": {sheet:"trading",row:1,col:0},
  "Shrewd": {sheet:"trading",row:1,col:1},
  "Silver-tongued": {sheet:"trading",row:1,col:2},
  "Brilliant": {sheet:"trading",row:1,col:3},
  "Intrepid": {sheet:"exploration",row:0,col:0},
  "Observant": {sheet:"exploration",row:0,col:1},
  "Worldly": {sheet:"exploration",row:0,col:2},
  "Perceptive": {sheet:"exploration",row:0,col:3},
  "Thrillseeking": {sheet:"exploration",row:0,col:4},
  "Discerning (Grass)": {sheet:"exploration",row:0,col:5},
  "Discerning (Sand)": {sheet:"exploration",row:1,col:0},
  "Discerning (Snow)": {sheet:"exploration",row:1,col:1},
  "Discerning (Lava)": {sheet:"exploration",row:1,col:2},
  "Vigorous": {sheet:"exploration",row:1,col:3},
  "Lightfooted": {sheet:"exploration",row:1,col:4},
  // Mining sheet is actually 7 cols x 2 rows (not 6x3 as previously assumed)
  "Greedy": {sheet:"mining",row:0,col:0},
  "Exacting": {sheet:"mining",row:0,col:1},
  "Meticulous (Gem)": {sheet:"mining",row:0,col:2},
  "Meticulous (Metal)": {sheet:"mining",row:0,col:3},
  "Meticulous (Mineral)": {sheet:"mining",row:0,col:4},
  "Fixated (Bronze)": {sheet:"mining",row:0,col:5},
  "Fixated (Iron)": {sheet:"mining",row:0,col:6},
  "Fixated (Steel)": {sheet:"mining",row:1,col:0},
  "Fixated (Ruby)": {sheet:"mining",row:1,col:1},
  "Fixated (Emerald)": {sheet:"mining",row:1,col:2},
  "Fixated (Sapphire)": {sheet:"mining",row:1,col:3},
  "Fixated (Salt)": {sheet:"mining",row:1,col:4},
  "Fixated (Sulfur)": {sheet:"mining",row:1,col:5},
  "Fixated (Mercury)": {sheet:"mining",row:1,col:6},
  "Careless": {sheet:"negative",row:0,col:0},
  "Cowardly": {sheet:"negative",row:0,col:1},
  "Foolish": {sheet:"negative",row:0,col:2},
  "Melancholic": {sheet:"negative",row:0,col:3},
  "Nervous": {sheet:"negative",row:1,col:0},
  "Pacifistic": {sheet:"negative",row:1,col:1},
  "Impressionable": {sheet:"negative",row:1,col:2},
  "Irrational": {sheet:"negative",row:1,col:3},
  "Naive": {sheet:"negative",row:2,col:0},
  "Scattered": {sheet:"negative",row:2,col:1},
  "Squeamish": {sheet:"negative",row:2,col:2},
  "Dense": {sheet:"negative",row:2,col:3},
  "Feeble": {sheet:"negative",row:3,col:0},
  "Glass Jawed": {sheet:"negative",row:3,col:1},
  "Hemophilic": {sheet:"negative",row:3,col:2},
  "Repulsive": {sheet:"negative",row:3,col:3},
  "Small Dungeon Cooldown": {sheet:"special",row:0,col:0},
  "Medium Dungeon Cooldown": {sheet:"special",row:0,col:1},
  "Large Dungeon Cooldown": {sheet:"special",row:0,col:2},
  "Married": {sheet:"special",row:0,col:3},
  "Bastard": {sheet:"special",row:0,col:4},
  "Heartbreak": {sheet:"special",row:0,col:5},
  "Frail": {sheet:"special",row:0,col:6},
  "Prisoner": {sheet:"special",row:1,col:0},
  "Ransomed": {sheet:"special",row:1,col:1},
  "Condemned": {sheet:"special",row:1,col:2},
  "Drink Me Drink": {sheet:"special",row:1,col:3},
  "Eat Me Cookie": {sheet:"special",row:1,col:4},
  "Head Shrinking Powder": {sheet:"special",row:1,col:5},
};

// Mythical-tier icon overrides.
// Each is a full 90×90 px PNG cropped from in-game screenshots.
// When a trait is Mythical, getTraitIconStyle() uses these instead of the sprite sheet.
const TRAIT_ICON_MYTHICAL = {
  "Cunning": "assets/images/traits/trait-icon-8.png",
  "Martial": "assets/images/traits/trait-icon-9.png",
  "Wise": "assets/images/traits/trait-icon-10.png",
  "Inspiring": "assets/images/traits/trait-icon-11.png",
  "Staunch": "assets/images/traits/trait-icon-12.png",
  "Fanatical": "assets/images/traits/trait-icon-13.png",
  "Tough": "assets/images/traits/trait-icon-14.png",
};

// Permanent icon overrides — used regardless of tier.
// For traits that don't scale across Normal/Impressive/.../Mythical (fixed single
// version only) but still deserve dedicated high-res art instead of the small,
// awkwardly-cropped sprite-sheet cell. Checked before the Mythical override and
// before the sprite sheet in getTraitIconStyle().
const TRAIT_ICON_ALWAYS_OVERRIDE = {
  "Inbred": "assets/images/traits/trait-icon-15.png",
};

/**
 * Returns an inline style string that renders a trait icon as a div background.
 * @param {string} traitName  - exact trait name, e.g. "Fanatical"
 * @param {boolean} isMythical - pass true if the trait is Mythical tier
 * @param {number}  iconSize   - pixel size of the rendered icon (default 52)
 * @returns {string|null} CSS inline style string, or null if icon not found
 */
function getTraitIconStyle(traitName, isMythical, iconSize) {
  iconSize = iconSize || 52;
  if (TRAIT_ICON_ALWAYS_OVERRIDE[traitName]) {
    return `background-image:url(${TRAIT_ICON_ALWAYS_OVERRIDE[traitName]});background-size:cover;background-position:center;width:${iconSize}px;height:${iconSize}px;border-radius:50%;flex-shrink:0;`;
  }
  if (isMythical && TRAIT_ICON_MYTHICAL[traitName]) {
    return `background-image:url(${TRAIT_ICON_MYTHICAL[traitName]});background-size:cover;background-position:center;width:${iconSize}px;height:${iconSize}px;border-radius:50%;flex-shrink:0;`;
  }
  const e = TRAIT_ICON_MAP[traitName];
  if (!e) return null;
  const sheet = TRAIT_SPRITE_SHEETS[e.sheet];
  if (!sheet) return null;
  const scale = iconSize / sheet.cell;
  const bgW = sheet.nativeW * scale;
  const bgH = sheet.nativeH * scale;
  const ox = -((sheet.offsetX + e.col * sheet.pitchX) * scale);
  const oy = -((sheet.offsetY + e.row * sheet.pitchY) * scale);
  return `background-image:url(${sheet.src});background-size:${bgW.toFixed(2)}px ${bgH.toFixed(2)}px;background-position:${ox.toFixed(2)}px ${oy.toFixed(2)}px;width:${iconSize}px;height:${iconSize}px;border-radius:50%;flex-shrink:0;overflow:hidden;`;
}

// ═══════════════════════════════════════════════════════════
// ── SITE-WIDE GEN ALPHA ICON REPLACER ──
// Replaces legacy emoji glyphs created in static HTML or by JavaScript
// with the same glossy icon family used by the navigation.
// ═══════════════════════════════════════════════════════════
(function(){
  const base = 'assets/images/icons/';
  const files = {
    home:'home-castle.png', guide:'guide-book.png', research:'research-scroll.png',
    nobles:'nobles-crown.png', army:'army-shield.png', battle:'battle-target.png',
    pvp:'pvp-swords.png', tips:'tips-bulb.png', alliance:'alliance-handshake.png'
  };

  const groups = {
    home:['🏠','🏰','🏯','🏗️','🏗','🗼','🚪','⛺'],
    guide:['📖','📜','📋','📸','🗺️','🗺','📦','📣'],
    research:['🔬','🧪','⚙️','⚙','📈','🔁','🔓','🔒','⛏️','⛏'],
    nobles:['👑','🏆','🏅','🏴','💎','💰','💼','⚜️','⚜','🪖'],
    army:['🛡️','🛡','⚔️','⚔','🗡️','🗡','🏹','🪓','🐴','💣','🔨','💪'],
    battle:['🎯','💥','🔥','❄️','❄','⚡','💀','☠️','☠','🚨','⛔','🔴','🌀','🧂'],
    pvp:['🥊','🤺'],
    tips:['💡','👀','🧠','🌟','✨','☀️','☀','🌑','🌱','🌾','✅','✓','❌','✕','⚠️','⚠'],
    alliance:['🤝','🕊️','🕊','🍼','🧬']
  };

  const emojiMap = {};
  Object.entries(groups).forEach(([key, chars]) => chars.forEach(ch => emojiMap[ch] = key));
  const tokens = Object.keys(emojiMap).sort((a,b)=>b.length-a.length);
  const escaped = tokens.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  const re = new RegExp('(' + escaped.join('|') + ')', 'g');

  window.eeIconMarkup = function(key, className){
    const file = files[key] || files.tips;
    return '<img src="'+base+file+'" alt="" aria-hidden="true" class="'+(className||'ee-auto-icon')+'">';
  };

  function replaceTextNode(node){
    const text = node.nodeValue;
    if(!text || !re.test(text)) return;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    text.replace(re, (match, _capture, offset) => {
      if(offset > last) frag.appendChild(document.createTextNode(text.slice(last, offset)));
      const key = emojiMap[match] || 'tips';
      const img = document.createElement('img');
      img.src = base + files[key];
      img.alt = '';
      img.setAttribute('aria-hidden','true');
      img.className = 'ee-auto-icon';
      img.dataset.eeIcon = key;
      frag.appendChild(img);
      last = offset + match.length;
      return match;
    });
    if(last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag,node);
  }

  function scan(root){
    if(!root || root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p = node.parentElement;
        if(!p || p.closest('script,style,textarea,input,select,option,.ee-icon-skip')) return NodeFilter.FILTER_REJECT;
        if(p.closest('.ee-auto-icon')) return NodeFilter.FILTER_REJECT;
        return re.test(node.nodeValue||'') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceTextNode);
  }

  function boot(){
    scan(document.body);
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => m.addedNodes.forEach(n => {
        if(n.nodeType===3) replaceTextNode(n);
        else if(n.nodeType===1) scan(n);
      }));
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
