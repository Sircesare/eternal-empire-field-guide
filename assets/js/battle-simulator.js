// ── BATTLE SIMULATOR ──
const TROOP_TYPES=[
  {key:'cavalry',label:'Cavalry (Heavy Tank)',color:'#1a5c8a',tiers:[1,2,3,4],martialCat:'mounted'},
  {key:'swordsmen',label:'Swordsmen (Medium Tank)',color:'#8b0000',tiers:[1,2,3,4],martialCat:'infantry'},
  {key:'axemen',label:'Axemen (Light Tank)',color:'#5a2a00',tiers:[2,3,4],martialCat:'infantry'},
  {key:'archers',label:'Archers (Arrow DPS)',color:'#2a6a2a',tiers:[1,2,3,4],martialCat:'ranged'},
  {key:'crossbowmen',label:'Crossbowmen (Bolt DPS)',color:'#4a4a8a',tiers:[2,3,4],martialCat:'ranged'},
  {key:'catapults',label:'Catapults (Boulder DPS)',color:'#7a3a00',tiers:[2,3,4],martialCat:'machine'}
];
let lastAnalysis=null;

// ── SHARED TRAIT TAB TAXONOMY ──
// Every trait maps to one or more of these 9 tabs, exactly as the in-game trait card lists multiple
// stat lines on one card (e.g. Fanatical shows both +Army Damage and -Army Health on a single card).
// A trait appears under EVERY tab its confirmed stats touch — never forced into one bucket.
// Only traits tagged "Battle Damage" or "Battle Durability" ever feed the Battle Simulator's math.
const TRAIT_TABS=['Battle Damage','Battle Durability','Army Capacity','Recovery','Mobility & Map','City Defense','Noble Actions','Breeding Value','Negative Penalties'];
const TRAIT_TAB_MAP={
  // Positive combat traits
  Fanatical:['Battle Damage','Battle Durability','Negative Penalties'], // damage gain, health cost
  Inspiring:['Battle Damage','Battle Durability','Recovery','Mobility & Map'],
  Staunch:['Battle Damage','Recovery'],
  Cunning:['Army Capacity','Battle Durability','Battle Damage','Recovery'],
  Wise:['Army Capacity','Battle Durability','Battle Damage','Mobility & Map'],
  Martial:['Battle Damage'],
  Tough:['City Defense','Battle Durability'],
  Chivalrous:['Noble Actions','Breeding Value','Recovery'],
  Devoted:['Noble Actions','Army Capacity','Battle Durability'],
  // Mobility & mining
  Lightfooted:['Mobility & Map'], Thrillseeking:['Mobility & Map'], Perceptive:['Mobility & Map'],
  'Discerning (Grass)':['Mobility & Map'],'Discerning (Sand)':['Mobility & Map'],'Discerning (Snow)':['Mobility & Map'],'Discerning (Lava)':['Mobility & Map'],
  Exacting:['Mobility & Map'], 'Meticulous (Gem)':['Mobility & Map'], 'Meticulous (Metal)':['Mobility & Map'], 'Meticulous (Mineral)':['Mobility & Map'],
  Greedy:['Mobility & Map','Noble Actions'], Vigorous:['Mobility & Map','Recovery','Breeding Value'],
  Intrepid:['Mobility & Map'], Observant:['Mobility & Map'], Worldly:['Mobility & Map','Noble Actions'],
  // Trading
  Shrewd:['Noble Actions'], Astute:['Noble Actions','Mobility & Map'], Brilliant:['Noble Actions'],
  Engrossing:['Noble Actions'], Charismatic:['Noble Actions'], Engaging:['Noble Actions'],
  Likeable:['Noble Actions','Breeding Value'], Persuasive:['Noble Actions'], 'Silver-tongued':['Noble Actions'],
  // Interaction / breeding
  Fertile:['Breeding Value'], Enticing:['Breeding Value','Noble Actions'], Beguiling:['Breeding Value','Noble Actions'],
  Alluring:['Breeding Value','Noble Actions'], Sincere:['Breeding Value','Noble Actions'], Suave:['Breeding Value','Noble Actions'],
  Hardy:['Battle Durability','Recovery'], 'Well Endowed':['Breeding Value','Noble Actions'],
  // Negative — flat penalties
  Pacifistic:['Negative Penalties','Battle Damage','Battle Durability'],
  Scattered:['Negative Penalties','Battle Damage','Battle Durability'],
  Squeamish:['Negative Penalties','Recovery','City Defense'],
  'Glass Jawed':['Negative Penalties','Battle Durability','City Defense','Recovery'],
  Hemophilic:['Negative Penalties','City Defense','Recovery'],
  Feeble:['Negative Penalties','Mobility & Map'],
  Nervous:['Negative Penalties','Army Capacity','Mobility & Map'],
  Foolish:['Negative Penalties','Army Capacity'],
  Sickly:['Negative Penalties','Recovery'],
  Careless:['Negative Penalties','Mobility & Map'],
  Cowardly:['Negative Penalties','Noble Actions'],
  Melancholic:['Negative Penalties','Noble Actions'],
  Impressionable:['Negative Penalties','Noble Actions'],
  Irrational:['Negative Penalties','Noble Actions','Army Capacity'],
  Naive:['Negative Penalties','Noble Actions'],
  Dense:['Negative Penalties','Noble Actions'],
  Repulsive:['Negative Penalties','Noble Actions'],
  Unsightly:['Negative Penalties','Noble Actions'],
  Unreliable:['Negative Penalties','Noble Actions'],
  // Phobias — always severe, always Negative Penalties plus whatever stat domain they hit
  Acrophobic:['Negative Penalties','Mobility & Map','City Defense'],
  Agoraphobic:['Negative Penalties','Noble Actions'],
  Algophobic:['Negative Penalties','Battle Durability','Army Capacity','Mobility & Map'],
  Gamophobic:['Negative Penalties','Noble Actions','Breeding Value'],
  Genophobic:['Negative Penalties','Noble Actions','Breeding Value'],
  Koinoniphobic:['Negative Penalties','Noble Actions','Mobility & Map'],
  Nyctophobic:['Negative Penalties','Mobility & Map','Recovery'],
  Sociophobic:['Negative Penalties','Noble Actions','Army Capacity'],
  Claustrophobic:['Negative Penalties','Noble Actions','Army Capacity'],
  Inbred:['Negative Penalties','Battle Damage','Noble Actions','Army Capacity']
};
function getTraitTabs(name){
  if(!name)return [];
  const key=Object.keys(TRAIT_TAB_MAP).find(k=>name.includes(k));
  return key?TRAIT_TAB_MAP[key]:[];
}

// ── SHARED NUMERIC TRAIT DATABASES ──
// Single source of truth for confirmed trait percentage values, used by BOTH the
// Battle Simulator's math (computeBattleResult) and the Army Sim's trait display
// cards (renderTabbedTraits / buildNobleCardTraitLine), so the numbers shown to
// the player always match what's actually fed into the damage/survival math.
// dmg = Army Damage. health = Army Health. Other keys (deploy/speed/healSpeed/
// assaultDef/defeatRecovery) are tracked for display only — see comments below.
const COMBAT_TRAIT_DB={};
const NEGATIVE_TRAIT_DB={};
Object.entries(TRAIT_DATABASE).forEach(([name,def])=>{
  if(!def.stats)return; // placeholder trait — no confirmed values yet, skip
  if(def.scaling==='tiered'){
    COMBAT_TRAIT_DB[name]={};
    Object.entries(def.stats).forEach(([tier,sections])=>{
      COMBAT_TRAIT_DB[name][tier]=sections.combat||{};
    });
  } else if(def.scaling==='flat'){
    NEGATIVE_TRAIT_DB[name]=(def.stats.flat&&def.stats.flat.combat)||{};
  }
});
// Phobias — confirmed -90% SEVERE penalties. Always flagged distinctly in the UI, never silently averaged in.
const PHOBIA_DB={
  Acrophobic:'Dungeon Speed, Mining Rate, Mine Defense, City Defense',
  Agoraphobic:'Trading Speed, Trading Payout, Trading Costs, Charm Success',
  Algophobic:'Assault Success, Defeat Recovery, Army Deploy Cost Eff, Army Speed',
  Gamophobic:'Propose Success, Charm Success, Kiss Success, Boink Success',
  Genophobic:'Kiss Success, Charm Success',
  Koinoniphobic:'Room Guarding, Travel Speed (Dungeon), Room Boosting/Helping',
  Nyctophobic:'Travel Speed (Dungeon), Explore Recovery, Dungeon Speed',
  Sociophobic:'Charm Success, Evict Success, Blackmail Success, Army Deploy Cost Eff',
  Claustrophobic:'Charm Success, Evict Success, Blackmail Success, Army Deploy Cost Eff'
};
// Human-readable stat key labels, used when printing numeric trait breakdowns in trait cards.
const STAT_LABELS={dmg:'Army Dmg',health:'Army Health',deploy:'Deploy Cost Eff',speed:'Army Speed',healSpeed:'Heal Speed',assaultDef:'Assault Defense',defeatRecovery:'Defeat Recovery',infantry:'Infantry Dmg',ranged:'Ranged Dmg',mounted:'Mounted Dmg',machine:'Machine Dmg'};
// Builds a short "+22% Army Dmg, -5% Army Health" style string for a trait+tier, or null if unconfirmed.
function getTraitStatLine(name,tier){
  if(!name)return null;
  const t=tier||'Normal';
  const posMatch=Object.keys(COMBAT_TRAIT_DB).find(ct=>name.includes(ct));
  if(posMatch){
    const stats=COMBAT_TRAIT_DB[posMatch][t]||COMBAT_TRAIT_DB[posMatch]['Normal'];
    if(!stats)return null;
    return Object.entries(stats).filter(([,v])=>v).map(([k,v])=>`${v>0?'+':''}${Math.round(v*100)}% ${STAT_LABELS[k]||k}`).join(', ');
  }
  const negKey=name.replace(/ /g,'_');
  const negMatch=Object.keys(NEGATIVE_TRAIT_DB).find(n=>negKey.includes(n)||name.includes(n.replace(/_/g,' ')));
  if(negMatch){
    const stats=NEGATIVE_TRAIT_DB[negMatch];
    const entries=Object.entries(stats).filter(([,v])=>v);
    if(!entries.length)return null;
    return entries.map(([k,v])=>`${v>0?'+':''}${Math.round(v*100)}% ${STAT_LABELS[k]||k}`).join(', ');
  }
  const phobiaMatch=Object.keys(PHOBIA_DB).find(p=>name.includes(p));
  if(phobiaMatch)return `-90% to ${PHOBIA_DB[phobiaMatch]}`;
  return null;
}
// Sums confirmed stat percentages (Army Dmg, Army Health, Deploy Cost Eff, etc.) across
// every combat trait on a noble, so the player can see a single combined total per stat
// instead of having to add up each trait card by hand. Only traits with confirmed
// numeric values in COMBAT_TRAIT_DB / NEGATIVE_TRAIT_DB contribute; phobias and
// non-combat traits without flat percentages are listed separately, not summed in.
function renderTraitTotals(combatTraitList){
  if(!combatTraitList||!combatTraitList.length)return '';
  const totals={};
  let contributingCount=0;
  combatTraitList.forEach(t=>{
    const name=typeof t==='object'?t.name:t;
    const tier=typeof t==='object'&&t.tier?t.tier:'Normal';
    if(!name)return;
    const posMatch=Object.keys(COMBAT_TRAIT_DB).find(ct=>name.includes(ct));
    if(posMatch){
      const stats=COMBAT_TRAIT_DB[posMatch][tier]||COMBAT_TRAIT_DB[posMatch]['Normal'];
      if(stats){contributingCount++;Object.entries(stats).forEach(([k,v])=>{if(v)totals[k]=(totals[k]||0)+v;});}
      return;
    }
    const negKey=name.replace(/ /g,'_');
    const negMatch=Object.keys(NEGATIVE_TRAIT_DB).find(n=>negKey.includes(n)||name.includes(n.replace(/_/g,' ')));
    if(negMatch){
      const stats=NEGATIVE_TRAIT_DB[negMatch];
      const entries=Object.entries(stats).filter(([,v])=>v);
      if(entries.length){contributingCount++;entries.forEach(([k,v])=>{totals[k]=(totals[k]||0)+v;});}
    }
  });
  if(!contributingCount)return '';
  // Each stat gets its own accent colour for variety and visual identity
  const statColors={
    dmg:      {text:'#ff6b6b',bg:'rgba(255,107,107,.15)',border:'rgba(255,107,107,.5)',glow:'rgba(255,107,107,.4)'},
    health:   {text:'#5dba70',bg:'rgba(93,186,112,.15)',border:'rgba(93,186,112,.5)',glow:'rgba(93,186,112,.4)'},
    infantry: {text:'#ff9f43',bg:'rgba(255,159,67,.15)',border:'rgba(255,159,67,.5)',glow:'rgba(255,159,67,.4)'},
    ranged:   {text:'#54a0ff',bg:'rgba(84,160,255,.15)',border:'rgba(84,160,255,.5)',glow:'rgba(84,160,255,.4)'},
    mounted:  {text:'#a29bfe',bg:'rgba(162,155,254,.15)',border:'rgba(162,155,254,.5)',glow:'rgba(162,155,254,.4)'},
    machine:  {text:'#fd79a8',bg:'rgba(253,121,168,.15)',border:'rgba(253,121,168,.5)',glow:'rgba(253,121,168,.4)'},
    deploy:   {text:'#ffd700',bg:'rgba(255,215,0,.15)',border:'rgba(255,215,0,.5)',glow:'rgba(255,215,0,.4)'},
    speed:    {text:'#00cec9',bg:'rgba(0,206,201,.15)',border:'rgba(0,206,201,.5)',glow:'rgba(0,206,201,.4)'},
    healSpeed:{text:'#55efc4',bg:'rgba(85,239,196,.15)',border:'rgba(85,239,196,.5)',glow:'rgba(85,239,196,.4)'},
    assaultDef:{text:'#e17055',bg:'rgba(225,112,85,.15)',border:'rgba(225,112,85,.5)',glow:'rgba(225,112,85,.4)'},
    defeatRecovery:{text:'#b2bec3',bg:'rgba(178,190,195,.15)',border:'rgba(178,190,195,.5)',glow:'rgba(178,190,195,.4)'},
  };
  const fallbackPos={text:'#5dba70',bg:'rgba(93,186,112,.15)',border:'rgba(93,186,112,.5)',glow:'rgba(93,186,112,.4)'};
  const fallbackNeg={text:'#ff7070',bg:'rgba(255,112,112,.15)',border:'rgba(255,112,112,.5)',glow:'rgba(255,112,112,.4)'};
  const statOrder=['dmg','health','infantry','ranged','mounted','machine','deploy','speed','healSpeed','assaultDef','defeatRecovery'];
  const cards=statOrder.filter(k=>totals[k]).map(k=>{
    const v=totals[k];
    const c=statColors[k]||(v>0?fallbackPos:fallbackNeg);
    return `<div style="background:rgba(10,6,20,.85);border:2px solid ${c.border};border-radius:12px;padding:18px 12px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;box-shadow:0 0 22px ${c.glow}, 0 0 8px ${c.glow}, inset 0 1px 0 rgba(255,255,255,.06);">
      <div style="font-family:var(--font-d);font-weight:900;font-size:34px;color:${c.text};line-height:1;text-shadow:0 0 16px ${c.glow}, 0 0 6px ${c.glow};">${v>0?'+':''}${Math.round(v*100)}%</div>
      <div style="font-family:var(--font-a);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#ffffff;">${STAT_LABELS[k]||k}</div>
    </div>`;
  }).join('');
  if(!cards)return '';
  return `<div style="margin-bottom:4px;">
    <div style="font-family:var(--font-a);font-size:11px;font-weight:700;letter-spacing:.15em;color:var(--re-yellow);text-transform:uppercase;margin-bottom:12px;">📊 Combined Totals — ${contributingCount} trait${contributingCount>1?'s':''} with confirmed values</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:10px;">${cards}</div>
    <div style="font-family:var(--font-b);font-size:11px;color:rgba(255,255,255,.3);font-style:italic;">Sum of each trait's confirmed bonus/penalty. Traits without numeric values (Chivalrous, Shrewd, phobias, etc.) aren't included.</div>
  </div>`;
}
function renderTabbedTraits(traitList,opts){
  // traitList: array of {name, tier?} objects. opts: {compact:bool, editable:bool}
  // Each unique trait is rendered ONCE, with small category chips showing which
  // tabs it touches — instead of duplicating the full card once per tab, which
  // made multi-category traits (Cunning, Wise, Inspiring, etc.) repeat 3-4 times.
  // When opts.editable is true, the tier badge becomes a dropdown the player can
  // correct by hand — AI tier-reading from screenshots (especially gold Mythical
  // vs purple Legendary borders) isn't always reliable, so this is the fallback.
  const editable=opts&&opts.editable;
  const tabColor={'Battle Damage':'#ff7070','Battle Durability':'#ffaa50','Army Capacity':'#ffd600','Recovery':'#5dba70','Mobility & Map':'#7fb8ff','City Defense':'#50ddff','Noble Actions':'#c090ff','Breeding Value':'#ff90d0','Negative Penalties':'#ff4444','Unclassified':'#888888'};
  const tierRank={Mythical:5,Legendary:4,Exceptional:3,Impressive:2,Normal:1};
  // Nobles CAN have multiple copies of the same trait at different tiers (e.g. 3x Fanatical).
  // Each copy stacks in the game, so all must be shown and counted separately.
  // We only de-dupe exact name+tier pairs (true duplicates from data merging), not same-name different-tier entries.
  const seen=new Set();
  const uniqueTraits=[];
  traitList.forEach(t=>{
    const name=typeof t==='object'?t.name:t;
    const tier=typeof t==='object'&&t.tier?t.tier:null;
    if(!name)return;
    const key=`${name}||${tier}`;
    if(!seen.has(key)){seen.add(key);uniqueTraits.push({name,tier});}
  });
  uniqueTraits.sort((a,b)=>{
    const negA=getTraitTabs(a.name).includes('Negative Penalties'),negB=getTraitTabs(b.name).includes('Negative Penalties');
    if(negA!==negB)return negA?1:-1;
    return (tierRank[b.tier]||0)-(tierRank[a.tier]||0);
  });
  const tierOptionsHtml=(current)=>['Normal','Impressive','Exceptional','Legendary','Mythical'].map(t=>`<option value="${t}"${t===current?' selected':''}>${t}</option>`).join('');
  return `<div style="display:flex;flex-direction:column;gap:8px;">${uniqueTraits.map(t=>{
    const tabs=getTraitTabs(t.name);
    const primaryTab=tabs[0]||'Unclassified';
    const color=tabColor[primaryTab]||tabColor['Unclassified'];
    const statLine=getTraitStatLine(t.name,t.tier);
    const isMythical=t.tier==='Mythical';
    const isNegative=tabs.includes('Negative Penalties');
    const chipColor=isNegative?tabColor['Negative Penalties']:color;
    const tagChips=tabs.filter(tab=>tab!=='Negative Penalties'||tabs.length===1).map(tab=>`<span style="font-family:var(--font-a);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${tabColor[tab]};background:${tabColor[tab]}1f;border-radius:4px;padding:2px 7px;white-space:nowrap;">${tab}</span>`).join('');
    const tierBadge=editable&&t.tier
      ? `<select onchange="correctTraitTier('${t.name.replace(/'/g,"\\'")}','${t.tier}',this.value)" style="font-weight:600;font-size:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:4px;color:${isMythical?'var(--re-yellow)':'rgba(255,255,255,.8)'};padding:1px 4px;font-family:var(--font-b);margin-left:6px;">${tierOptionsHtml(t.tier)}</select>`
      : (t.tier?`<span style="font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;background:${isMythical?'rgba(255,214,0,.18)':'rgba(255,255,255,.08)'};color:${isMythical?'var(--re-yellow)':'rgba(255,255,255,.55)'};border-radius:100px;padding:2px 8px;margin-left:6px;">${t.tier}</span>`:'');
    const nameOptionsHtml=(current)=>getAllTraitNames().map(n=>`<option value="${n.replace(/"/g,'&quot;')}"${n===current?' selected':''}>${n}</option>`).join('');
    const nameBadge=editable
      ? `<select onchange="correctTraitName('${t.name.replace(/'/g,"\\'")}','${t.tier||''}',this.value)" style="font-family:var(--font-d);font-size:16px;font-weight:800;color:${isMythical?'var(--re-yellow)':chipColor};background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:4px;padding:1px 4px;max-width:100%;">${nameOptionsHtml(t.name)}</select>`
      : t.name;
    const iconStyle=getTraitIconStyle(t.name,isMythical,42);
    const iconHtml=iconStyle
      ? `<div style="${iconStyle}border:2px solid ${isMythical?'var(--re-yellow)':chipColor+'80'};${isMythical?'box-shadow:0 0 0 3px rgba(255,214,0,.12),0 0 14px 5px rgba(255,214,0,.3);':''}"></div>`
      : `<div style="width:42px;height:42px;border-radius:50%;flex-shrink:0;background:${chipColor}22;border:2px solid ${chipColor}50;display:flex;align-items:center;justify-content:center;font-size:18px;">${isNegative?'⚠️':'⚔️'}</div>`;
    const barColor=isMythical?'#ffd600':chipColor;
    const barGlow=isMythical
      ? `box-shadow:0 0 10px 3px rgba(255,214,0,.5),0 -4px 18px 2px rgba(255,214,0,.25);`
      : `box-shadow:0 0 8px 2px ${chipColor}55,0 -3px 14px 1px ${chipColor}30;`;
    return `<div style="background:#060d1a;border:1px solid ${isMythical?'rgba(255,214,0,.35)':chipColor+'30'};border-radius:10px;overflow:hidden;${isMythical?'box-shadow:0 6px 24px 3px rgba(255,214,0,.12),0 14px 40px 5px rgba(255,214,0,.06);':'box-shadow:0 6px 20px 2px '+chipColor+'18,0 12px 36px 4px '+chipColor+'08;'}">
      <div style="display:flex;align-items:center;gap:11px;padding:10px 13px 0;">
        ${iconHtml}
        <div style="flex:1;min-width:0;">
          <div style="font-family:var(--font-d);font-size:16px;font-weight:800;color:${isMythical?'var(--re-yellow)':chipColor};line-height:1.2;display:flex;align-items:center;flex-wrap:wrap;">${nameBadge}${tierBadge}</div>
          <div style="display:flex;flex-wrap:wrap;gap:3px 5px;margin-top:5px;">${tagChips}</div>
        </div>
      </div>
      ${statLine?`<div style="font-family:var(--font-b);font-size:13px;color:rgba(200,220,255,.78);line-height:1.5;padding:6px 13px 9px;">${statLine}</div>`:`<div style="height:9px;"></div>`}
      <div style="height:3px;background:linear-gradient(90deg,${barColor},transparent);${barGlow}"></div>
    </div>`;
  }).join('')}${editable?`<div style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.4);font-style:italic;text-align:center;padding-top:6px;">Tier read wrong? Use the dropdown next to a trait name to correct it — totals and Battle Sim math update automatically.</div>`:''}</div>`;
}

// Manually correct a misread trait tier (e.g. AI read gold Mythical border as purple Legendary).
// Updates lastAnalysis in place, then re-renders the noble card. Battle Sim reads lastAnalysis
// fresh every time "Run Battle Simulation" is clicked, so the correction takes effect there
// automatically on the next run — no separate refresh needed.
function correctTraitTier(traitName,oldTier,newTier){
  if(!lastAnalysis)return;
  let changed=false;
  // Find the first entry matching both name AND old tier, so we fix the right copy
  // when a noble has e.g. 3x Fanatical at different tiers.
  const fixIn=(arr)=>{
    if(!arr)return;
    for(const t of arr){
      if(t.name===traitName&&t.tier===oldTier&&!changed){
        t.tier=newTier;changed=true;return;
      }
    }
  };
  fixIn(lastAnalysis.detected_traits);
  if(!changed)fixIn(lastAnalysis.non_combat_traits);
  if(!changed)return;
  renderBuilds(lastAnalysis);
}

// Manually correct a misidentified trait NAME (e.g. AI hallucinated "Devoted" or
// couldn't confidently read a small icon and fell back to "Unconfirmed Trait").
// Same pattern as correctTraitTier: matches the first entry with the given old
// name AND tier so the right copy gets fixed when duplicates exist, then re-renders.
function correctTraitName(oldName,tier,newName){
  if(!lastAnalysis||!newName||newName===oldName)return;
  let changed=false;
  const fixIn=(arr)=>{
    if(!arr)return;
    for(const t of arr){
      if(t.name===oldName&&t.tier===tier&&!changed){
        t.name=newName;changed=true;return;
      }
    }
  };
  fixIn(lastAnalysis.detected_traits);
  if(!changed)fixIn(lastAnalysis.non_combat_traits);
  if(!changed)return;
  renderBuilds(lastAnalysis);
}
// Full list of known trait names for the rename dropdown, so corrections are picked
// from a known list rather than typed freely (no typos, no made-up trait names).
function getAllTraitNames(){
  const names=new Set([...Object.keys(TRAIT_DATABASE),...Object.keys(PHOBIA_DB)]);
  return ['Unconfirmed Trait',...Array.from(names).sort()];
}

function buildSliderRow(t,containerId,inputPrefix){
  const tierOptions=t.tiers.map(n=>`<option value="${n}"${n===t.tiers[t.tiers.length-1]?' selected':''}>T${n}</option>`).join('');
  return `<div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.7);margin-bottom:4px;">
      <span>${t.label}</span>
      <div style="display:flex;align-items:center;gap:6px;">
        <select id="${inputPrefix}-${t.key}-tier" style="background:rgba(255,255,255,.06);border:1px solid var(--re-border);border-radius:4px;color:var(--re-yellow);font-family:var(--font-d);font-weight:700;font-size:11px;padding:2px 4px;">${tierOptions}</select>
        <span id="${inputPrefix}-${t.key}-val">0%</span>
      </div>
    </div>
    <input type="range" min="0" max="100" value="0" id="${inputPrefix}-${t.key}" oninput="updateCompTotal('${containerId}','${inputPrefix}')" style="width:100%;accent-color:${t.color};">
  </div>`;
}

function initBattleSim(){
  // Old Battle Sim sub-tab elements have been moved to the standalone view-battlesim.
  // This function is kept to avoid any stray calls erroring, but does nothing now.
}

function updateCompTotal(spanId,prefix){
  let total=0;
  TROOP_TYPES.forEach(t=>{
    const v=parseInt(document.getElementById(prefix+'-'+t.key).value)||0;
    total+=v;
  });

  if(total>100){
    let excess=total-100;
    for(let i=TROOP_TYPES.length-1;i>=0 && excess>0;i--){
      const el=document.getElementById(prefix+'-'+TROOP_TYPES[i].key);
      const v=parseInt(el.value)||0;
      const reduce=Math.min(v,excess);
      el.value=v-reduce;
      excess-=reduce;
    }
  }

  total=0;
  TROOP_TYPES.forEach(t=>{
    const v=parseInt(document.getElementById(prefix+'-'+t.key).value)||0;
    document.getElementById(prefix+'-'+t.key+'-val').textContent=v+'%';
    total+=v;
  });
  document.getElementById(spanId).textContent=total;
  const totalEl=document.getElementById(spanId).parentElement;
  if(totalEl) totalEl.style.color = total===100 ? '#5dba70' : 'var(--re-red)';
}

function setTargetMode(mode,btn){
  document.querySelectorAll('.target-btn').forEach(b=>{
    b.style.background='rgba(255,255,255,.05)';
    b.style.borderColor='var(--re-border)';
    b.style.color='rgba(255,255,255,.5)';
  });
  btn.style.background='rgba(255,214,0,.1)';
  btn.style.borderColor='var(--re-yellow)';
  btn.style.color='var(--re-yellow)';
  document.getElementById('target-fort').style.display=mode==='fort'?'block':'none';
  document.getElementById('target-custom').style.display=mode==='custom'?'block':'none';
  window.battleTargetMode=mode;
}

// ── STANDALONE BATTLE SIM (view-battlesim) ──
// Mirror of setTargetMode for the standalone view's own target buttons.
function setBsimTargetMode(mode,btn){
  document.querySelectorAll('.bsim-target-btn').forEach(b=>{
    b.style.background='rgba(255,255,255,.05)';
    b.style.borderColor='var(--re-border)';
    b.style.color='rgba(255,255,255,.5)';
  });
  btn.style.background='rgba(255,214,0,.1)';
  btn.style.borderColor='var(--re-yellow)';
  btn.style.color='var(--re-yellow)';
  document.getElementById('bsim-target-fort').style.display=mode==='fort'?'block':'none';
  document.getElementById('bsim-target-custom').style.display=mode==='custom'?'block':'none';
  window.bsimTargetMode=mode;
}
// Called by showView whenever 'battlesim' is the target — updates the noble header
// and either shows the locked state or initialises the sliders.
function initBattleSimStandalone(){
  const header=document.getElementById('bsim-noble-header');
  if(!lastAnalysis){
    document.getElementById('bsim-locked').style.display='block';
    document.getElementById('bsim-setup').style.display='none';
    header.innerHTML='';
    return;
  }
  document.getElementById('bsim-locked').style.display='none';
  document.getElementById('bsim-setup').style.display='block';
  // Noble identity card
  const role=lastAnalysis.role||'Unknown Role';
  const name=lastAnalysis.noble_name||'Unknown Noble';
  const power=lastAnalysis.power&&lastAnalysis.power!=='Unknown'?` · ${Number(lastAnalysis.power).toLocaleString()} Power`:'';
  header.innerHTML=`<div style="background:rgba(255,214,0,.06);border:1px solid rgba(255,214,0,.25);border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:14px;margin-bottom:4px;">
    <div style="font-size:1.8rem;">🎖️</div>
    <div>
      <div style="font-family:var(--font-d);font-weight:900;font-size:17px;color:var(--re-yellow);letter-spacing:.03em;">${name}</div>
      <div style="font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.5);margin-top:2px;">${role}${power} — traits loaded from Army Sim</div>
    </div>
    <button onclick="showView('simulator')" style="margin-left:auto;background:rgba(255,255,255,.06);border:1px solid var(--re-border);border-radius:6px;padding:6px 12px;font-family:var(--font-b);font-size:11px;color:rgba(255,255,255,.5);cursor:pointer;white-space:nowrap;">← Change Noble</button>
  </div>`;
  // Build sliders once (check if already initialised)
  if(!document.getElementById('bsim-comp-sliders').innerHTML){
    document.getElementById('bsim-comp-sliders').innerHTML=TROOP_TYPES.map(t=>buildSliderRow(t,'bsim-comp-total-val','bsim-comp')).join('');
    document.getElementById('bsim-enemy-sliders').innerHTML=TROOP_TYPES.map(t=>buildSliderRow(t,'bsim-enemy-total-val','bsim-enemy')).join('');
  }
  // Default target mode
  if(!window.bsimTargetMode) window.bsimTargetMode='fort';
}
// Standalone runner — same math as runBattleSim() but reads from bsim-prefixed elements
// and writes results to bsim-result. Shares all math helpers (computeAdvantageMultiplier,
// getWeightedTierMult, getActivePairs, etc.) which are prefix-agnostic.
// Builds a readable per-troop breakdown of why the Combat Advantage is what it is.
// Shows each troop type you're fielding, what it counters in the enemy army,
// what in the enemy army counters it back, and whether it's net positive or negative.
function buildMatchupBreakdown(myComp, enemyComp){
  const rows=[];
  TROOP_TYPES.forEach(t=>{
    const myPct=myComp[t.key]||0;
    if(myPct<=0)return;
    const c=COUNTER_MAP[t.key];
    const targetPct=enemyComp[c.beats]||0;
    const counterPct=(c.beatenBy||[]).reduce((s,k)=>s+(enemyComp[k]||0),0);
    const net=targetPct-counterPct;
    const sign=net>0?'+':net<0?'':'±';
    const color=net>0?'#5dba70':net<0?'#ff7070':'rgba(255,255,255,.4)';
    const countersLabel=c.beats.charAt(0).toUpperCase()+c.beats.slice(1);
    const beatenByLabel=(c.beatenBy||[]).map(k=>k.charAt(0).toUpperCase()+k.slice(1)).join(', ')||'Nothing';
    rows.push(`<div style="display:grid;grid-template-columns:1fr 1fr 1fr 60px;gap:6px;align-items:center;padding:7px 10px;border-radius:6px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);">
      <div style="font-family:var(--font-d);font-size:12px;font-weight:700;color:rgba(255,255,255,.8);">${t.label.split(' ')[0]} <span style="font-weight:500;color:rgba(255,255,255,.4);font-size:10px;">${myPct}%</span></div>
      <div style="font-family:var(--font-b);font-size:11px;color:#5dba70;">✓ Beats ${countersLabel} <span style="color:rgba(255,255,255,.35);">(${targetPct}%)</span></div>
      <div style="font-family:var(--font-b);font-size:11px;color:#ff7070;">⚠ Weak to ${beatenByLabel} <span style="color:rgba(255,255,255,.35);">(${counterPct}%)</span></div>
      <div style="font-family:var(--font-d);font-weight:800;font-size:14px;color:${color};text-align:right;">${sign}${Math.abs(net)}%</div>
    </div>`);
  });
  return rows.join('');
}
function runBattleSimStandalone(){
  const myComp=getComposition('bsim-comp');
  const myTiers=getCompositionTiers('bsim-comp');
  const myTotal=Object.values(myComp).reduce((a,b)=>a+b,0);
  if(myTotal!==100){alert('Your army composition must total exactly 100%. Currently: '+myTotal+'%');return;}
  let enemyComp,enemyLabel,enemyDefense=1.0;
  if((window.bsimTargetMode||'fort')==='fort'){
    const tier=document.getElementById('bsim-fort-tier').value;
    const fort=FORT_TIERS[tier];
    enemyComp=fort.composition; enemyLabel=fort.label; enemyDefense=fort.defense;
  }else{
    enemyComp=getComposition('bsim-enemy');
    const enemyTotal=Object.values(enemyComp).reduce((a,b)=>a+b,0);
    if(enemyTotal!==100){alert('Enemy army composition must total exactly 100%. Currently: '+enemyTotal+'%');return;}
    enemyLabel='Custom Enemy Army';
  }
  const advMult=computeAdvantageMultiplier(myComp,enemyComp);
  const activePairs=getActivePairs(myComp);
  const ELEM_COUNTER={lightning:'frost',frost:'fire',fire:'physical'};
  const myElement=document.getElementById('bsim-my-element').value;
  const enemyElement=document.getElementById('bsim-enemy-element').value;
  let elemMult=1.0;
  if(ELEM_COUNTER[myElement]===enemyElement)elemMult=1.15;
  else if(ELEM_COUNTER[enemyElement]===myElement)elemMult=0.87;
  let traitDmgBonus=0,traitHealthBonus=0,traitAssaultDefBonus=0,traitDeployBonus=0,traitSpeedBonus=0,traitDefeatRecoveryBonus=0,mythicalTraitsApplied=[],activePhobias=[],martialApplied=0;
  if(lastAnalysis&&lastAnalysis.detected_traits){
    lastAnalysis.detected_traits.forEach(t=>{
      const name=typeof t==='object'?t.name:t;
      const tier=typeof t==='object'&&t.tier?t.tier:'Normal';
      const match=Object.keys(COMBAT_TRAIT_DB).find(ct=>name&&name.includes(ct));
      if(match){
        const stats=COMBAT_TRAIT_DB[match][tier]||COMBAT_TRAIT_DB[match]['Normal'];
        if(tier==='Mythical')mythicalTraitsApplied.push(match);
        if(match==='Martial'){
          let weighted=0;
          TROOP_TYPES.forEach(tt=>{const pct=myComp[tt.key]||0;if(pct>0)weighted+=(stats[tt.martialCat]||0)*(pct/100);});
          traitDmgBonus+=weighted; traitHealthBonus+=(stats.health||0); martialApplied=weighted;
        } else {traitDmgBonus+=(stats.dmg||0);traitHealthBonus+=(stats.health||0);}
        traitAssaultDefBonus+=(stats.assaultDef||0);traitDeployBonus+=(stats.deploy||0);traitSpeedBonus+=(stats.speed||0);traitDefeatRecoveryBonus+=(stats.defeatRecovery||0);
      }
    });
  }
  const allTraitSources=[...(lastAnalysis&&lastAnalysis.detected_traits||[]),...(lastAnalysis&&lastAnalysis.non_combat_traits||[])];
  allTraitSources.forEach(t=>{
    const name=typeof t==='object'?t.name:t;
    if(!name)return;
    if(Object.keys(PHOBIA_DB).some(p=>name.includes(p)))activePhobias.push(name);
    const negKey=name.replace(/ /g,'_');
    const negMatch=Object.keys(NEGATIVE_TRAIT_DB).find(n=>negKey.includes(n)||name.includes(n.replace(/_/g,' ')));
    if(negMatch){const stats=NEGATIVE_TRAIT_DB[negMatch];traitDmgBonus+=(stats.dmg||0);traitHealthBonus+=(stats.health||0);traitAssaultDefBonus+=(stats.assaultDef||0);traitDeployBonus+=(stats.deploy||0);traitSpeedBonus+=(stats.speed||0);traitDefeatRecoveryBonus+=(stats.defeatRecovery||0);}
  });
  let champBonus=0;
  const champClass=document.getElementById('bsim-champ-class').value;
  const champRarity=document.getElementById('bsim-champ-rarity').value;
  if(champClass&&champRarity){const rarityMult={Common:.05,Uncommon:.08,Rare:.12,Epic:.18};champBonus=rarityMult[champRarity]||0;}
  const tierResult=getWeightedTierMult(myComp,myTiers);
  const finalMult=advMult*tierResult.dmgMult*elemMult*(1+traitDmgBonus+champBonus);
  const damageEstimate=Math.round(finalMult*100);
  const survivalEstimate=Math.max(10,Math.min(95,Math.round((60+(advMult-1)*80)*tierResult.healthMult*(1+traitHealthBonus+(champBonus*0.5)))));
  let verdict,verdictColor;
  if(activePhobias.length){verdict='⚠️ Severe Trait Penalty — Combat Risk Unclear';verdictColor='#ff4444';}
  else if(finalMult>=1.3){verdict='Strong Advantage — Favorable Engagement';verdictColor='#5dba70';}
  else if(finalMult>=1.05){verdict='Slight Edge — Likely Win';verdictColor='var(--re-yellow)';}
  else if(finalMult>=0.9){verdict='Even Matchup — Risky';verdictColor='var(--re-yellow)';}
  else{verdict='Disadvantage — Avoid This Engagement';verdictColor='#ff7070';}
  const champName=document.getElementById('bsim-champ-name').value;
  const champBonusText=document.getElementById('bsim-champ-bonus').value;
  const tierSummary=TROOP_TYPES.filter(t=>(myComp[t.key]||0)>0).map(t=>`${t.label.split(' ')[0]} T${myTiers[t.key]}`).join(', ');
  document.getElementById('bsim-result').innerHTML=`
    <div style="background:rgba(0,0,0,.5);border:2px solid ${verdictColor};border-radius:14px;padding:28px 24px;text-align:center;margin-bottom:16px;">
      <div style="font-family:var(--font-a);font-size:10px;font-weight:700;letter-spacing:.3em;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:6px;">vs ${enemyLabel}</div>
      <div style="font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.35);margin-bottom:10px;">${tierSummary}</div>
      <div style="font-family:var(--font-d);font-weight:900;font-size:64px;color:${verdictColor};line-height:1;">${damageEstimate}%</div>
      <div style="font-family:var(--font-a);font-size:12px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;margin-top:4px;">Relative Damage Output</div>
      <div style="font-family:var(--font-d);font-weight:800;font-size:18px;color:${verdictColor};text-transform:uppercase;margin-top:14px;letter-spacing:.04em;">${verdict}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:10px;padding:16px;text-align:center;">
        <div style="font-family:var(--font-a);font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px;">Survival Outlook</div>
        <div style="font-family:var(--font-d);font-weight:800;font-size:30px;color:var(--re-yellow);">${survivalEstimate}%</div>
      </div>
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:10px;padding:16px;text-align:center;">
        <div style="font-family:var(--font-a);font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px;">Combat Advantage</div>
        <div style="font-family:var(--font-d);font-weight:800;font-size:30px;color:var(--re-yellow);">${advMult>=1?'+':''}${Math.round((advMult-1)*100)}%</div>
      </div>
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:10px;padding:16px;text-align:center;">
        <div style="font-family:var(--font-a);font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px;">Elemental Edge</div>
        <div style="font-family:var(--font-d);font-weight:800;font-size:30px;color:${elemMult===1?'rgba(255,255,255,.4)':elemMult>1?'#5dba70':'#ff7070'};">${elemMult===1?'—':(elemMult>1?'+':'')+Math.round((elemMult-1)*100)+'%'}</div>
      </div>
    </div>
    ${(traitAssaultDefBonus||traitDeployBonus||traitSpeedBonus||traitDefeatRecoveryBonus)?`<div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:8px;padding:12px 14px;margin-bottom:14px;">
      <div style="font-family:var(--font-a);font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:6px;">Other Trait-Confirmed Stats (not yet factored into Damage/Survival above)</div>
      <div style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.7);">
        ${traitAssaultDefBonus?`Assault Defense: ${traitAssaultDefBonus>=0?'+':''}${Math.round(traitAssaultDefBonus*100)}%<br>`:''}
        ${traitDefeatRecoveryBonus?`Defeat Recovery: ${traitDefeatRecoveryBonus>=0?'+':''}${Math.round(traitDefeatRecoveryBonus*100)}%<br>`:''}
        ${traitDeployBonus?`Army Deploy Cost Eff: ${traitDeployBonus>=0?'+':''}${Math.round(traitDeployBonus*100)}%<br>`:''}
        ${traitSpeedBonus?`Army Speed: ${traitSpeedBonus>=0?'+':''}${Math.round(traitSpeedBonus*100)}%`:''}
      </div>
    </div>`:''}
    ${champName?`<div style="background:rgba(255,214,0,.06);border:1px solid rgba(255,214,0,.2);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.6);">🎖️ <strong style="color:var(--re-yellow);">${champName}</strong> (${champRarity} ${champClass})${champBonusText?' — '+champBonusText:''}</div>`:''}
    <div style="margin-bottom:14px;">
      <div style="font-family:var(--font-a);font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:8px;">Combat Advantage Breakdown — why you're winning or losing</div>
      <div style="display:flex;flex-direction:column;gap:5px;">${buildMatchupBreakdown(myComp,enemyComp)}</div>
      <div style="font-family:var(--font-b);font-size:10px;color:rgba(255,255,255,.3);font-style:italic;margin-top:6px;">Net column = % of enemy your troop counters minus % of enemy countering you. Positive = your troop is winning its matchup in this fight.</div>
    </div>
    ${activePairs.length?`<div style="background:rgba(93,186,112,.08);border:1px solid rgba(93,186,112,.3);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:16px;color:rgba(255,255,255,.95);">🤝 <strong style="color:#5dba70;">Pairing synergy: ${activePairs.map(p=>p.label).join(', ')}.</strong> +${activePairs.length*3}% included in Combat Advantage.</div>`
    :`<div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.4);">💡 No confirmed unit pairing active. Swordsmen+Archers, Axemen+Catapults, or Cavalry+Crossbowmen each add a +3% synergy bonus when both halves are ≥${PAIR_MIN_PCT}%.</div>`}
    ${activePhobias.length?`<div style="background:rgba(255,68,68,.1);border:1px solid rgba(255,68,68,.4);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:13px;color:#ffaaaa;">🚨 <strong>Severe phobia: ${activePhobias.join(', ')}.</strong> -90% penalties to multiple stats not fully reflected above.</div>`:''}
    ${martialApplied>0?`<div style="background:rgba(255,170,80,.08);border:1px solid rgba(255,170,80,.3);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:13px;color:#ffcc99;">⚔️ <strong>Martial trait: +${Math.round(martialApplied*100)}% weighted damage</strong> based on your troop mix.</div>`:''}
    ${mythicalTraitsApplied.length?`<div style="background:rgba(255,214,0,.1);border:1px solid var(--re-yellow);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.8);">✨ <strong style="color:var(--re-yellow);">Mythical traits applied: ${mythicalTraitsApplied.join(', ')}.</strong></div>`:''}
    <div style="font-family:var(--font-b);font-size:11px;color:rgba(255,255,255,.3);text-align:center;font-style:italic;padding-top:4px;">Estimate based on troop mix, tiers, element, verified trait effects, and champion bonuses. Elemental advantage magnitude is approximate — only the counter direction is confirmed.</div>
  `;
  document.getElementById('bsim-result').scrollIntoView({behavior:'smooth',block:'start'});
}
window.battleTargetMode='fort';

// Per-troop-type tier Damage and Health multipliers — derived from real confirmed in-game unit
// stat cards (exact Damage/Health numbers per tier, T3 = baseline 1.0 for each). Damage and Health
// scale almost identically for most troop types (~0.33/0.59/1.0/1.71-1.74), but Catapults' T4 Damage
// (1.64x) diverges meaningfully from its T4 Health (1.74x), so the two stats are kept separate rather
// than blended into one number. Axemen has no confirmed T3 card — its ratios are estimated from the
// cross-troop-type pattern (flagged below) until a real T3 Axemen screenshot is provided.
const TIER_MULT={
  cavalry:{1:{dmg:0.33,health:0.33},2:{dmg:0.59,health:0.58},3:{dmg:1.0,health:1.0},4:{dmg:1.71,health:1.73}},
  swordsmen:{1:{dmg:0.32,health:0.33},2:{dmg:0.59,health:0.58},3:{dmg:1.0,health:1.0},4:{dmg:1.72,health:1.74}},
  axemen:{2:{dmg:0.59,health:0.58,estimated:true},4:{dmg:1.71,health:1.73,estimated:true}}, // no T1 or T3 Axemen card confirmed — ratios estimated from cross-type pattern, not measured for this troop
  archers:{1:{dmg:0.33,health:0.32},2:{dmg:0.60,health:0.58},3:{dmg:1.0,health:1.0},4:{dmg:1.73,health:1.74}},
  crossbowmen:{2:{dmg:0.60,health:0.57},3:{dmg:1.0,health:1.0},4:{dmg:1.71,health:1.71}}, // no T1 tier exists for Crossbowmen
  catapults:{2:{dmg:0.54,health:0.58},3:{dmg:1.0,health:1.0},4:{dmg:1.64,health:1.74}} // no T1 tier exists for Catapults; T4 Damage and Health diverge — real, not a rounding artifact
};
function getComposition(prefix){
  const comp={};
  TROOP_TYPES.forEach(t=>{
    comp[t.key]=parseInt(document.getElementById(prefix+'-'+t.key).value)||0;
  });
  return comp;
}
function getCompositionTiers(prefix){
  const tiers={};
  TROOP_TYPES.forEach(t=>{
    const el=document.getElementById(prefix+'-'+t.key+'-tier');
    tiers[t.key]=el?parseInt(el.value):t.tiers[t.tiers.length-1];
  });
  return tiers;
}
// Weighted average tier Damage and Health multipliers across the full army composition, based on
// each troop type's own selected tier and its share of the army. Returns {dmgMult, healthMult,
// hasEstimated} separately instead of one blended number, since Damage and Health don't always
// scale identically by tier (Catapults T4 is the confirmed example).
function getWeightedTierMult(comp,tiers){
  let totalWeight=0,weightedDmg=0,weightedHealth=0,hasEstimated=false;
  TROOP_TYPES.forEach(t=>{
    const pct=comp[t.key]||0;
    if(pct<=0)return;
    const tier=tiers[t.key]||t.tiers[t.tiers.length-1];
    const cell=(TIER_MULT[t.key]&&TIER_MULT[t.key][tier])||{dmg:1.0,health:1.0};
    if(cell.estimated)hasEstimated=true;
    weightedDmg+=cell.dmg*pct;
    weightedHealth+=cell.health*pct;
    totalWeight+=pct;
  });
  if(totalWeight===0)return{dmgMult:1.0,healthMult:1.0,hasEstimated:false};
  return{dmgMult:weightedDmg/totalWeight,healthMult:weightedHealth/totalWeight,hasEstimated};
}


// beatenBy is an array (some troops have more than one confirmed counter). Catapults still has no
// confirmed beatenBy — left as an empty array rather than guessed at.
// Confirmed: Archers are countered by Cavalry and Siege machines (Catapults). Crossbowmen are
// countered by Cavalry and Archers. This supersedes the earlier (incorrect) assumption, sourced from
// the Kingdom Maker wiki, that DPS units have uniform defense with no specific counters.
const COUNTER_MAP={
  cavalry:{beats:'swordsmen',beatenBy:['catapults']},
  swordsmen:{beats:'axemen',beatenBy:['crossbowmen']},
  axemen:{beats:'cavalry',beatenBy:['archers']},
  archers:{beats:'axemen',beatenBy:['cavalry','catapults']},
  crossbowmen:{beats:'swordsmen',beatenBy:['cavalry','archers']},
  catapults:{beats:'cavalry',beatenBy:[]}
};

// ── CONFIRMED UNIT PAIRINGS ──
// Source: official Kingdom Maker Combat Guide / Units wiki. Tank units (single-target melee)
// and DPS units (AoE/splash projectile) are designed to fight as combined fronts, not as
// independent troop types: "Unit Pairings are compositions of battalions that complement
// each other in the Combat Advantage system... Both of these units will counter the main
// forces of [the opposing tank type]." Specifically:
//   Swordsmen (Medium Tank, single-target) + Archers (Arrow DPS, AoE)   → both counter Light Tank (Axemen)
//   Axemen (Light Tank, single-target)    + Catapults (Boulder DPS, AoE) → both counter Heavy Tank (Cavalry)
//   Cavalry (Heavy Tank, "Horde Breaker" AoE) + Crossbowmen (Bolt DPS, single-target) → counter Medium Tank (Swordsmen)
// Running a pair together is meant to be stronger than running either half alone, since the
// AoE half clears supporting troops around the tank's primary target. The Battle Simulator
// applies a small composition synergy bonus when both halves of a documented pair are present
// in meaningful proportion, and flags it in the result so players can see whether their build
// is taking advantage of the pairing or running a tank/DPS type in isolation.
const PAIR_MAP={
  swordsmen:{partner:'archers',countersTank:'axemen',label:'Swordsmen + Archers'},
  archers:{partner:'swordsmen',countersTank:'axemen',label:'Swordsmen + Archers'},
  axemen:{partner:'catapults',countersTank:'cavalry',label:'Axemen + Catapults'},
  catapults:{partner:'axemen',countersTank:'cavalry',label:'Axemen + Catapults'},
  cavalry:{partner:'crossbowmen',countersTank:'swordsmen',label:'Cavalry + Crossbowmen'},
  crossbowmen:{partner:'cavalry',countersTank:'swordsmen',label:'Cavalry + Crossbowmen'}
};
// Minimum presence (%) for a unit to count as "meaningfully fielded" toward pairing synergy —
// a stray 2% splash of a unit shouldn't trigger the bonus.
const PAIR_MIN_PCT=15;
function getActivePairs(comp){
  const seen=new Set();
  const active=[];
  Object.keys(PAIR_MAP).forEach(key=>{
    if(seen.has(key))return;
    const pair=PAIR_MAP[key];
    const myPct=comp[key]||0, partnerPct=comp[pair.partner]||0;
    if(myPct>=PAIR_MIN_PCT&&partnerPct>=PAIR_MIN_PCT){
      active.push({units:[key,pair.partner],label:pair.label,countersTank:pair.countersTank});
      seen.add(key);seen.add(pair.partner);
    }
  });
  return active;
}

const FORT_TIERS={
  1:{label:'Fort I — Easy',defense:0.6,composition:{swordsmen:40,archers:30,axemen:30}},
  2:{label:'Fort II — Moderate',defense:0.8,composition:{cavalry:30,swordsmen:40,archers:30}},
  3:{label:'Fort III — Challenging',defense:1.0,composition:{cavalry:35,crossbowmen:35,axemen:30}},
  4:{label:'Fort IV — Hard',defense:1.3,composition:{cavalry:40,catapults:30,crossbowmen:30}},
  5:{label:'Fort V — Brutal',defense:1.7,composition:{cavalry:30,catapults:35,crossbowmen:35}}
};

function computeAdvantageMultiplier(myComp,enemyComp){
  let totalAdv=0,totalWeight=0;
  TROOP_TYPES.forEach(t=>{
    const myPct=myComp[t.key]||0;
    if(myPct<=0)return;
    const c=COUNTER_MAP[t.key];
    const enemyTargetPct=enemyComp[c.beats]||0;
    const enemyCounterPct=(c.beatenBy||[]).reduce((sum,k)=>sum+(enemyComp[k]||0),0);
    const adv=(enemyTargetPct-enemyCounterPct)/100;
    totalAdv+=adv*myPct;
    totalWeight+=myPct;
  });
  if(totalWeight===0)return 1;
  let multiplier=1+(totalAdv/totalWeight)*0.6;
  // Pairing synergy: confirmed Tank+DPS pairs (Swordsmen+Archers, Axemen+Catapults,
  // Cavalry+Crossbowmen) fight as a combined front per the official Combat Guide. A small
  // flat bonus per active pair rewards building toward the documented synergy instead of
  // running tank and DPS types as unrelated independent percentages.
  const activePairs=getActivePairs(myComp);
  multiplier+=activePairs.length*0.03;
  return multiplier;
}

function runBattleSim(){
  const myComp=getComposition('comp');
  const myTiers=getCompositionTiers('comp');
  const myTotal=Object.values(myComp).reduce((a,b)=>a+b,0);
  if(myTotal!==100){
    alert('Your army composition must total exactly 100%. Currently: '+myTotal+'%');
    return;
  }

  let enemyComp,enemyLabel,enemyDefense=1.0;
  if(window.battleTargetMode==='fort'){
    const tier=document.getElementById('fort-tier').value;
    const fort=FORT_TIERS[tier];
    enemyComp=fort.composition;
    enemyLabel=fort.label;
    enemyDefense=fort.defense;
  }else{
    enemyComp=getComposition('enemy');
    const enemyTotal=Object.values(enemyComp).reduce((a,b)=>a+b,0);
    if(enemyTotal!==100){
      alert('Enemy army composition must total exactly 100%. Currently: '+enemyTotal+'%');
      return;
    }
    enemyLabel='Custom Enemy Army';
  }

  const advMult=computeAdvantageMultiplier(myComp,enemyComp);
  const activePairs=getActivePairs(myComp);

  // Elemental triangle — confirmed: Lightning beats Frost, Frost beats Fire, Fire beats Physical.
  // Physical has been confirmed to have NO elemental advantage against anything — it does not
  // counter Lightning or close the loop. This is a one-way 4-element chain, not a 3-element triangle.
  // This is a separate, smaller modifier from the troop-type Combat Advantage triangle above —
  // both apply, since one represents weapon element and the other represents troop matchup.
  // NOTE: the +15%/-13% magnitude below is an estimate, not a confirmed exact in-game elemental damage
  // percentage — only the direction (which element beats which) is confirmed. Flagged in the result footer.
  const ELEM_COUNTER={lightning:'frost',frost:'fire',fire:'physical'};
  const myElement=document.getElementById('my-element')?document.getElementById('my-element').value:'physical';
  const enemyElement=document.getElementById('enemy-element')?document.getElementById('enemy-element').value:'physical';
  let elemMult=1.0;
  if(ELEM_COUNTER[myElement]===enemyElement)elemMult=1.15; // we counter them
  else if(ELEM_COUNTER[enemyElement]===myElement)elemMult=0.87; // they counter us

  // Combat trait math uses the shared COMBAT_TRAIT_DB / NEGATIVE_TRAIT_DB / PHOBIA_DB
  // declared at module scope above (same data also powers the Army Sim trait cards).
  let traitDmgBonus=0, traitHealthBonus=0;
  let mythicalTraitsApplied=[];
  let activePhobias=[];
  let martialApplied=0;
  if(lastAnalysis && lastAnalysis.detected_traits){
    lastAnalysis.detected_traits.forEach(t=>{
      const name=typeof t==='object'?t.name:t;
      const tier=typeof t==='object'&&t.tier?t.tier:'Normal';
      const match=Object.keys(COMBAT_TRAIT_DB).find(ct=>name&&name.includes(ct));
      if(match){
        const stats=COMBAT_TRAIT_DB[match][tier]||COMBAT_TRAIT_DB[match]['Normal'];
        if(tier==='Mythical')mythicalTraitsApplied.push(match);
        if(match==='Martial'){
          // Martial's damage bonus is per-troop-category (Infantry/Ranged/Mounted/Machine), not flat Army Damage.
          // Weight each category's bonus by that category's share of the actual army composition.
          let weighted=0;
          TROOP_TYPES.forEach(tt=>{
            const pct=myComp[tt.key]||0;
            if(pct<=0)return;
            weighted+=(stats[tt.martialCat]||0)*(pct/100);
          });
          traitDmgBonus+=weighted;
          traitHealthBonus+=(stats.health||0);
          martialApplied=weighted;
        }
        else{traitDmgBonus+=(stats.dmg||0);traitHealthBonus+=(stats.health||0);}
      }
    });
  }
  // Negative/phobia traits can come from either detected_traits or non_combat_traits depending on AI categorization — check both
  const allTraitSources=[...(lastAnalysis&&lastAnalysis.detected_traits||[]),...(lastAnalysis&&lastAnalysis.non_combat_traits||[])];
  allTraitSources.forEach(t=>{
    const name=typeof t==='object'?t.name:t;
    if(!name)return;
    const phobiaMatch=Object.keys(PHOBIA_DB).find(p=>name.includes(p));
    if(phobiaMatch){activePhobias.push(phobiaMatch);return;}
    const negKey=name.replace(/ /g,'_');
    const negMatch=Object.keys(NEGATIVE_TRAIT_DB).find(n=>negKey.includes(n)||name.includes(n.replace(/_/g,' ')));
    if(negMatch){
      const stats=NEGATIVE_TRAIT_DB[negMatch];
      traitDmgBonus+=(stats.dmg||0);
      traitHealthBonus+=(stats.health||0);
    }
  });

  let champBonus=0;
  const champClass=document.getElementById('champ-class').value;
  const champRarity=document.getElementById('champ-rarity').value;
  if(champClass && champRarity){
    const rarityMult={Common:0.05,Uncommon:0.08,Rare:0.12,Epic:0.18};
    champBonus=rarityMult[champRarity]||0;
  }

  const tierResult=getWeightedTierMult(myComp,myTiers);
  const finalMult=advMult*tierResult.dmgMult*elemMult*(1+traitDmgBonus+champBonus);
  const damageEstimate=Math.round(finalMult*100);
  const survivalMult=tierResult.healthMult*(1+traitHealthBonus+(champBonus*0.5)); // champion bonus contributes half-weight to survival since it's primarily an offense stat
  const survivalEstimate=Math.max(10,Math.min(95,Math.round((60+(advMult-1)*80)*survivalMult)));

  let verdict,verdictColor;
  if(activePhobias.length){verdict='⚠️ Severe Trait Penalty — Combat Risk Unclear';verdictColor='#ff4444';}
  else if(finalMult>=1.3){verdict='Strong Advantage — Favorable Engagement';verdictColor='#5dba70';}
  else if(finalMult>=1.05){verdict='Slight Edge — Likely Win';verdictColor='var(--re-yellow)';}
  else if(finalMult>=0.9){verdict='Even Matchup — Risky';verdictColor='var(--re-yellow)';}
  else{verdict='Disadvantage — Avoid This Engagement';verdictColor='#ff7070';}

  const champName=document.getElementById('champ-name').value;
  const champBonusText=document.getElementById('champ-bonus').value;
  const tierSummary=TROOP_TYPES.filter(t=>(myComp[t.key]||0)>0).map(t=>`${t.label.split(' ')[0]} T${myTiers[t.key]}`).join(', ');

  document.getElementById('battle-result').style.display='block';
  document.getElementById('battle-result').innerHTML=`
    <div style="background:rgba(0,0,0,.4);border:2px solid ${verdictColor};border-radius:12px;padding:20px;text-align:center;margin-bottom:14px;">
      <div style="font-family:var(--font-a);font-size:10px;font-weight:700;letter-spacing:.3em;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:6px;">vs ${enemyLabel}</div>
      <div style="font-family:var(--font-b);font-size:11px;color:rgba(255,255,255,.35);margin-bottom:6px;">${tierSummary}</div>
      <div style="font-family:var(--font-d);font-weight:900;font-size:42px;color:${verdictColor};line-height:1;">${damageEstimate}%</div>
      <div style="font-family:var(--font-a);font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;margin-top:2px;">Relative Damage Output</div>
      <div style="font-family:var(--font-d);font-weight:800;font-size:16px;color:${verdictColor};text-transform:uppercase;margin-top:10px;">${verdict}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px;">
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:8px;padding:12px;text-align:center;">
        <div style="font-family:var(--font-a);font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;">Estimated Survival Outlook</div>
        <div style="font-family:var(--font-d);font-weight:800;font-size:24px;color:var(--re-yellow);">${survivalEstimate}%</div>
      </div>
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:8px;padding:12px;text-align:center;">
        <div style="font-family:var(--font-a);font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;">Combat Advantage</div>
        <div style="font-family:var(--font-d);font-weight:800;font-size:24px;color:var(--re-yellow);">${advMult>=1?'+':''}${Math.round((advMult-1)*100)}%</div>
      </div>
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:8px;padding:12px;text-align:center;">
        <div style="font-family:var(--font-a);font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;">Elemental Edge</div>
        <div style="font-family:var(--font-d);font-weight:800;font-size:24px;color:${elemMult===1?'rgba(255,255,255,.4)':elemMult>1?'#5dba70':'#ff7070'};">${elemMult===1?'Neutral':(elemMult>1?'+':'')+Math.round((elemMult-1)*100)+'%'}</div>
      </div>
    </div>
    ${champName?`<div style="background:rgba(255,214,0,.06);border:1px solid rgba(255,214,0,.2);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:15px;color:rgba(255,255,255,.92);">🎖️ <strong style="color:var(--re-yellow);">${champName}</strong> (${champRarity} ${champClass})${champBonusText?' — '+champBonusText:''} included as player-provided context.</div>`:''}
    ${activePairs.length?`<div style="background:rgba(93,186,112,.08);border:1px solid rgba(93,186,112,.3);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.7);">🤝 <strong style="color:#5dba70;">Pairing synergy active: ${activePairs.map(p=>p.label).join(', ')}.</strong> Per the official Combat Guide, these are designed to fight as a combined front — the single-target Tank unit holds the enemy's primary attacker while the AoE/DPS half clears supporting troops. +${activePairs.length*3}% included in Combat Advantage above.</div>`
      :`<div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.45);">💡 No confirmed unit pairing active in your composition. Swordsmen+Archers, Axemen+Catapults, and Cavalry+Crossbowmen are designed to fight together — pairing at least ${PAIR_MIN_PCT}% of each half can add a synergy bonus to Combat Advantage.</div>`}
    ${activePhobias.length?`<div style="background:rgba(255,68,68,.1);border:1px solid rgba(255,68,68,.4);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:12px;color:#ffaaaa;">🚨 <strong>Severe phobia trait${activePhobias.length>1?'s':''} detected: ${activePhobias.join(', ')}.</strong> These cause -90% penalties to specific stats (Assault Success, Army Deploy Cost Efficiency, Army Speed, and others depending on the phobia) that aren't fully reflected in the damage/survival numbers above. Treat this noble's combat reliability as significantly degraded until the phobia is addressed.</div>`:''}
    ${martialApplied>0?`<div style="background:rgba(255,170,80,.08);border:1px solid rgba(255,170,80,.3);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:12px;color:#ffcc99;">⚔️ <strong>Martial trait applied: +${Math.round(martialApplied*100)}% damage</strong>, weighted by your current army composition (Martial only boosts the specific troop categories it lists — Infantry/Ranged/Mounted/Machine — not the whole army equally). Changing your troop mix will change this contribution.</div>`:''}
    ${tierResult.hasEstimated?`<div style="background:rgba(255,214,0,.06);border:1px solid rgba(255,214,0,.2);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:15px;color:rgba(255,255,255,.92);">⚠️ Axemen tier ratios in this army are estimated from the cross-troop-type pattern, not measured from a confirmed Axemen stat card. Treat Axemen-heavy results as a rough estimate.</div>`:''}
    ${mythicalTraitsApplied.length?`<div style="background:rgba(255,214,0,.1);border:1px solid var(--re-yellow);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.8);box-shadow:0 0 10px rgba(255,214,0,.15);">✨ <strong style="color:var(--re-yellow);">Mythical trait${mythicalTraitsApplied.length>1?'s':''} applied: ${mythicalTraitsApplied.join(', ')}.</strong> Confirmed Mythical-tier values are included in this estimate.</div>`:''}
    <div style="font-family:var(--font-b);font-size:11px;color:rgba(255,255,255,.3);text-align:center;font-style:italic;">Estimate based on entered troop mix and tier, weapon element, verified trait effects, selected champion bonuses, and Red Empire's combat model. Troop tier scaling and elemental advantage magnitude are relative approximations, not exact in-game ratios (only the elemental counter direction is confirmed). Final battles can still vary because of gear, formations, buffs, defenses, terrain, and hidden enemy information.</div>
  `;
}
