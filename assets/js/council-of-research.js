// ── THE COUNCIL OF RESEARCH ──────────────────────────────────
// Phase 1: Hero/Warning readiness checklist + Doctrine tab shell.
// Doctrine content (PvP, Breeder, K30, Roles) is added in later phases.

// ── READINESS CHECKLIST (localStorage: reResearchReadiness) ──
const COUNCIL_CHECKLIST_ITEMS = [
  { id: 'c1', text: 'My important build speed, research speed, and research cost upgrades are progressing.' },
  { id: 'c2', text: 'My current troop tier is researched well enough for my main army.' },
  { id: 'c3', text: 'Troop Damage and Troop Health are not badly behind.' },
  { id: 'c4', text: 'Healing Speed, army capacity, and battalion capacity are progressing.' },
  { id: 'c5', text: 'My primary noble line supports my army plan.' },
  { id: 'c6', text: 'I have resources reserved for the Keep upgrade plus follow-up research/building gates.' },
  { id: 'c7', text: 'I am not entering the next bracket weaker than established players already there.' },
  { id: 'c8', text: 'I have a reason for the next Keep unlock.' }
];
const COUNCIL_CHECKLIST_KEY = 'reResearchReadiness';

function councilLoadChecklist(){
  try {
    const raw = localStorage.getItem(COUNCIL_CHECKLIST_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e){ return {}; }
}
function councilSaveChecklist(state){
  try { localStorage.setItem(COUNCIL_CHECKLIST_KEY, JSON.stringify(state)); } catch(e){}
}
function councilRenderChecklist(){
  const state = councilLoadChecklist();
  const box = document.getElementById('council-checklist-items');
  if(!box) return;
  let html = '';
  for(let i=0;i<COUNCIL_CHECKLIST_ITEMS.length;i++){
    const item = COUNCIL_CHECKLIST_ITEMS[i];
    const done = !!state[item.id];
    html += '<div class="council-check-row" onclick="councilToggleCheck(\''+item.id+'\')" style="display:flex;align-items:flex-start;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;background:'+(done?'rgba(255,214,0,.08)':'rgba(255,255,255,.03)')+';border:1px solid '+(done?'rgba(255,214,0,.3)':'rgba(255,255,255,.08)')+';margin-bottom:8px;transition:all .15s;">';
    html += '<span style="min-width:22px;height:22px;border-radius:5px;border:2px solid '+(done?'var(--ee-yellow)':'rgba(255,255,255,.3)')+';display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;background:'+(done?'var(--ee-yellow)':'transparent')+';color:#07000f;font-weight:900;font-size:13px;">'+(done?'✓':'')+'</span>';
    html += '<span style="font-family:var(--font-b);font-size:13px;line-height:1.55;color:'+(done?'rgba(255,255,255,.9)':'rgba(255,255,255,.65)')+';">'+item.text+'</span>';
    html += '</div>';
  }
  box.innerHTML = html;
  councilUpdateChecklistProgress(state);
}
function councilToggleCheck(id){
  const state = councilLoadChecklist();
  state[id] = !state[id];
  councilSaveChecklist(state);
  councilRenderChecklist();
}
function councilUpdateChecklistProgress(state){
  const done = COUNCIL_CHECKLIST_ITEMS.filter(i => state[i.id]).length;
  const total = COUNCIL_CHECKLIST_ITEMS.length;
  const label = document.getElementById('council-checklist-progress');
  const bar = document.getElementById('council-checklist-bar');
  if(label) label.textContent = done+' / '+total+' ready';
  if(bar) bar.style.width = Math.round((done/total)*100)+'%';
}

// ── HERO CARD TOGGLE (whole card: K30 warning + checklist) ──
function councilToggleHero(){
  const body = document.getElementById('council-hero-body');
  const arrow = document.getElementById('council-hero-arrow');
  if(!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  if(arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

// ── DOCTRINE SELECTOR (shell — content added in later phases) ──
const COUNCIL_DOCTRINES = {
  pvp: {
    label: '⚔️ PvP War Doctrine',
    color: '#ff8080',
    stub: 'Full PvP War Doctrine content — Troop Damage/Health priorities, army capacity, and stage-by-stage combat progression — is being written next using verified Combat Research data.'
  },
  breeder: {
    label: '🧬 Noble Breeding Doctrine',
    color: '#c090ff',
    stub: 'Full Noble Breeding Doctrine content — Family Size, Baby Quality, bloodline preparation — is being written next using verified Noble Research data.'
  },
  k30: {
    label: '🏰 K30 Combat-Ready Progression',
    color: '#ffd600',
    stub: 'Full K30 Combat-Ready Progression — stage-by-stage guidance from K1 through K30 — is being written next.'
  },
  roles: {
    label: '🛡️ Alliance Role Paths',
    color: '#88aaff',
    stub: 'Full Alliance Role Paths — Rally Lead, Defense, Siege Specialist, Breeder, Economic — is being written next.'
  }
};
const COUNCIL_DOCTRINE_KEYS = {
  pvp: 'reResearchPvp',
  breeder: 'reResearchBreeder',
  k30: 'reResearchK30',
  roles: 'reResearchRoles'
};

function councilShowDoctrine(key){
  const d = COUNCIL_DOCTRINES[key];
  if(!d) return;
  document.querySelectorAll('.council-doctrine-btn').forEach(function(b){
    b.style.background = 'rgba(255,255,255,.05)';
    b.style.borderColor = 'rgba(255,255,255,.15)';
    b.style.color = 'rgba(255,255,255,.6)';
  });
  const btn = document.getElementById('council-doc-'+key);
  if(btn){
    btn.style.background = 'rgba(255,214,0,.1)';
    btn.style.borderColor = 'var(--ee-yellow)';
    btn.style.color = 'var(--ee-yellow)';
  }
  const body = document.getElementById('council-doctrine-body');
  if(body){
    if(key === 'pvp'){
      body.innerHTML = '<div style="text-align:center;margin-bottom:16px;"><div style="font-family:var(--font-d);font-weight:800;font-size:18px;color:'+d.color+';text-transform:uppercase;letter-spacing:.04em;">'+d.label+'</div></div>' + councilRenderPvpDoctrine();
      councilRenderPvpChecklist();
    } else if(key === 'breeder'){
      body.innerHTML = '<div style="text-align:center;margin-bottom:16px;"><div style="font-family:var(--font-d);font-weight:800;font-size:18px;color:'+d.color+';text-transform:uppercase;letter-spacing:.04em;">'+d.label+'</div></div>' + councilRenderBreederDoctrine();
      councilRenderBreederChecklist();
    } else if(key === 'k30'){
      body.innerHTML = '<div style="text-align:center;margin-bottom:16px;"><div style="font-family:var(--font-d);font-weight:800;font-size:18px;color:'+d.color+';text-transform:uppercase;letter-spacing:.04em;">'+d.label+'</div></div>' + councilRenderK30Doctrine();
      councilRenderK30Checklist();
    } else if(key === 'roles'){
      body.innerHTML = '<div style="text-align:center;margin-bottom:16px;"><div style="font-family:var(--font-d);font-weight:800;font-size:18px;color:'+d.color+';text-transform:uppercase;letter-spacing:.04em;">'+d.label+'</div></div>' + councilRenderRolesDoctrine();
    } else {
      body.innerHTML = '<div style="padding:24px;text-align:center;">'
        + '<div style="font-family:var(--font-d);font-weight:800;font-size:18px;color:'+d.color+';text-transform:uppercase;letter-spacing:.04em;margin-bottom:12px;">'+d.label+'</div>'
        + '<div style="font-family:var(--font-b);font-size:14px;color:rgba(255,255,255,.55);line-height:1.65;max-width:520px;margin:0 auto;">'+d.stub+'</div>'
        + '</div>';
    }
  }
}

// ── PVP WAR DOCTRINE — Phase 2 (verified Combat Research data) ──
const COUNCIL_PVP_CHECKLIST_ITEMS = [
  { id: 'p1', text: 'Militia tier (Swordsman/Archer/Cavalry) fully maxed, including Ranged/Infantry/Mounted Damage and Troop Health.' },
  { id: 'p2', text: 'Regular (T2) troop line unlocked for my primary army and Troop Damage is progressing.' },
  { id: 'p3', text: 'Veteran (T3) troop line unlocked for my primary army.' },
  { id: 'p4', text: 'Max Battalion Size, Max Staged Armies, and Armies per Stage are progressing or maxed.' },
  { id: 'p5', text: 'Army Heal Speed and Troop Health are not badly behind my troop tier.' },
  { id: 'p6', text: 'Troop Equipment tier (Uncommon/Rare/Epic) matches my current troop tier.' },
  { id: 'p7', text: 'Suspiciously Good PvP Damage is only being pursued after core basics above are handled.' }
];
const COUNCIL_PVP_KEY = 'reResearchPvp';

const COUNCIL_PVP_STAGES = [
  {
    id: 'pvp-s1',
    range: 'Foundation',
    title: 'Militia Tier — Build the Base',
    body: 'Max the full Militia line first: Militia Swordsman, Militia Archer, Militia Cavalry, Unit Training Speed, and their Ranged/Infantry/Mounted Damage and Troop Health branches. This is the cheapest, fastest tier to max and every later troop generation gates through it via the Advanced Training chain.'
  },
  {
    id: 'pvp-s2',
    range: 'Combat Setup',
    title: 'Regular (T2) Tier — Pick Your Primary Line',
    body: 'Unlock Regular Archer, Swordsman, Axeman, Crossbowman, or Cavalry for your chosen primary army first — not all five at once. Push Troop Damage, Ranged/Infantry/Mounted Health, and the matching Training Speed/Cost Efficiency nodes for that line before touching a second troop type.'
  },
  {
    id: 'pvp-s3',
    range: 'Main Army Specialization',
    title: 'Veteran (T3) Tier — Finish One Army',
    body: 'Unlock the Veteran tier (Veteran Archer/Swordsman/Axeman/Crossbowman/Cavalry) for your primary line and finish its Ranged/Infantry/Mounted Health and Damage vs Buildings branches. Then start your counter/secondary troop type — not before your primary is solid.'
  },
  {
    id: 'pvp-s4',
    range: 'Mature T3 Preparation',
    title: 'Capacity & Recovery — Don\u0027t Skip This',
    body: 'Max Battalion Size, Max Staged Armies, Armies per Stage, and Army Heal Speed matter as much as raw damage at this stage. A maxed-damage army that can\u0027t field enough troops or recover fast enough loses to a smaller, better-supported one.'
  },
  {
    id: 'pvp-s5',
    range: 'Competitive Refinement',
    title: 'Royal (T4) & Suspiciously Good Nodes — Last, Not First',
    body: 'The Royal tier and gold "Suspiciously Good" nodes (PvP Damage, Troop Training Speed, Healing Speed) exist in the tree but require Epic Troop Equipment and full Veteran completion first. Needs In-Game Confirmation: exact Keep level these unlock at was not visible in available screenshots.'
  }
];

const COUNCIL_PVP_DELAY = [
  'Unlocking a second full troop line before your primary is fully Veteran-tier.',
  'Chasing Royal (T4) unlocks while Troop Damage/Health on your current tier is still low progress.',
  'Suspiciously Good PvP Damage before Epic Troop Equipment and core Troop Damage/Health are handled.',
  'Damage vs Buildings research before your open-field army is solid — it\u0027s siege-context, not general PvP.'
];

function councilRenderPvpDoctrine(){
  const state = councilLoadDoctrineState(COUNCIL_PVP_KEY);
  let html = '<div style="padding:0 4px;">';

  html += '<div style="background:rgba(255,128,128,.08);border:1px solid rgba(255,128,128,.3);border-radius:10px;padding:14px 16px;margin-bottom:20px;font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.7);line-height:1.6;">';
  html += '<strong style="color:#ff8080;">Red Empire Rule:</strong> Build one army to win. Build a counter army to survive.';
  html += '</div>';

  // checklist
  html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--ee-yellow);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">PvP Readiness Checklist</div>';
  html += '<div id="council-pvp-checklist"></div>';

  // stages
  html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--ee-yellow);text-transform:uppercase;letter-spacing:.06em;margin:22px 0 10px;">Stage Progression — Strategic Recommendation</div>';
  for(let i=0;i<COUNCIL_PVP_STAGES.length;i++){
    const s = COUNCIL_PVP_STAGES[i];
    html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:14px 16px;margin-bottom:10px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap;">';
    html += '<span style="background:var(--ee-red);color:#fff;font-family:var(--font-d);font-weight:900;font-size:11px;padding:3px 9px;border-radius:20px;">'+s.range+'</span>';
    html += '<span style="font-family:var(--font-d);font-weight:800;font-size:14px;color:var(--ee-white);text-transform:uppercase;letter-spacing:.03em;">'+s.title+'</span>';
    html += '</div>';
    html += '<div style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.6);line-height:1.6;">'+s.body+'</div>';
    html += '</div>';
  }

  // delay panel
  html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 16px;margin-top:16px;">';
  html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">⏳ Delay Until Later</div>';
  html += '<ul style="margin:0;padding-left:18px;font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.55);line-height:1.8;">';
  for(let i=0;i<COUNCIL_PVP_DELAY.length;i++){ html += '<li>'+COUNCIL_PVP_DELAY[i]+'</li>'; }
  html += '</ul></div>';

  html += '</div>';
  return html;
}

function councilLoadDoctrineState(key){
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch(e){ return {}; }
}
function councilSaveDoctrineState(key, state){
  try { localStorage.setItem(key, JSON.stringify(state)); } catch(e){}
}
function councilRenderPvpChecklist(){
  const state = councilLoadDoctrineState(COUNCIL_PVP_KEY);
  const box = document.getElementById('council-pvp-checklist');
  if(!box) return;
  let html = '';
  for(let i=0;i<COUNCIL_PVP_CHECKLIST_ITEMS.length;i++){
    const item = COUNCIL_PVP_CHECKLIST_ITEMS[i];
    const done = !!state[item.id];
    html += '<div onclick="councilTogglePvpCheck(\''+item.id+'\')" style="display:flex;align-items:flex-start;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;background:'+(done?'rgba(255,214,0,.08)':'rgba(255,255,255,.03)')+';border:1px solid '+(done?'rgba(255,214,0,.3)':'rgba(255,255,255,.08)')+';margin-bottom:8px;transition:all .15s;">';
    html += '<span style="min-width:22px;height:22px;border-radius:5px;border:2px solid '+(done?'var(--ee-yellow)':'rgba(255,255,255,.3)')+';display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;background:'+(done?'var(--ee-yellow)':'transparent')+';color:#07000f;font-weight:900;font-size:13px;">'+(done?'✓':'')+'</span>';
    html += '<span style="font-family:var(--font-b);font-size:13px;line-height:1.55;color:'+(done?'rgba(255,255,255,.9)':'rgba(255,255,255,.65)')+';">'+item.text+'</span>';
    html += '</div>';
  }
  box.innerHTML = html;
}
function councilTogglePvpCheck(id){
  const state = councilLoadDoctrineState(COUNCIL_PVP_KEY);
  state[id] = !state[id];
  councilSaveDoctrineState(COUNCIL_PVP_KEY, state);
  councilRenderPvpChecklist();
}

// ── NOBLE BREEDING DOCTRINE — Phase 3 (verified Noble Research data) ──
const COUNCIL_BREEDER_CHECKLIST_ITEMS = [
  { id: 'b1', text: 'Merchant/Captain/Explorer roles are maxed and Family Size I is complete — foundation is set.' },
  { id: 'b2', text: 'Baby Quality Chance tier matches my bloodline goals (Impressive/Exceptional/Legendary).' },
  { id: 'b3', text: 'Family Size research supports the number of active breeding pairs I actually run.' },
  { id: 'b4', text: 'Noble Equipment tier (Uncommon/Rare/Epic) matches my combat noble\u0027s role.' },
  { id: 'b5', text: 'Suspiciously Good Genes/Offspring are only being pursued after core Family Size and Baby Quality are handled.' },
  { id: 'b6', text: 'I have not deleted or benched a strong breeder just because they are not my main combat noble.' }
];
const COUNCIL_BREEDER_KEY = 'reResearchBreeder';

const COUNCIL_BREEDER_STAGES = [
  {
    range: 'Early Setup',
    title: 'Core Roles & Family Size I',
    body: 'Max Merchant, Captain, and Explorer roles first, plus Boost XP and Baby Quality Chance: Impressive. This is the cheapest tier and unlocks Family Size I — the foundation every later breeding plan depends on.'
  },
  {
    range: 'Family Capacity & Baby Quality',
    title: 'Family Size II & Exceptional Quality',
    body: 'Push Family Size II, Baby Quality Chance: Exceptional, and Uncommon Noble Equipment. Subjugator and Agent roles open up here too — useful if your bloodline plan needs those lines.'
  },
  {
    range: 'Legendary/Mythical Prep',
    title: 'Family Size III & Legendary Quality',
    body: 'Family Size III, Baby Quality Chance: Legendary, and Rare Noble Equipment are the core of this stage. The gold Suspiciously Good Family Size and Suspiciously Good Nursery nodes live here too — but they\u0027re optional accelerants, not prerequisites.'
  },
  {
    range: 'K25\u2013K30 Optimization',
    title: 'Family Size IV & Endgame Genes',
    body: 'Family Size IV, Epic Noble Equipment, and Suspiciously Good Genes/Offspring round out a mature breeding program. Needs In-Game Confirmation: exact Keep level these unlock at was not visible in available screenshots.'
  }
];

const COUNCIL_BREEDER_TRAPS = [
  'Deleting good breeders too early — a noble\u0027s value isn\u0027t always visible yet.',
  'Pairing good combat lines with random utility lines without a specific trait goal.',
  'Assuming research can overcome weak parents — it improves odds, not outcomes.',
  'Spending all resources on combat while Family Size stays capped and couples sit idle.',
  'Pursuing too many breeding projects at once instead of finishing one bloodline first.'
];

function councilRenderBreederDoctrine(){
  let html = '<div style="padding:0 4px;">';

  html += '<div style="background:rgba(192,144,255,.08);border:1px solid rgba(192,144,255,.3);border-radius:10px;padding:14px 16px;margin-bottom:20px;font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.7);line-height:1.6;">';
  html += '<strong style="color:#c090ff;">Red Empire Rule:</strong> A noble is not weak just because they are not on the battlefield yet.';
  html += '</div>';

  html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--ee-yellow);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">Breeding Readiness Checklist</div>';
  html += '<div id="council-breeder-checklist"></div>';

  html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--ee-yellow);text-transform:uppercase;letter-spacing:.06em;margin:22px 0 10px;">Stage Progression — Strategic Recommendation</div>';
  for(let i=0;i<COUNCIL_BREEDER_STAGES.length;i++){
    const s = COUNCIL_BREEDER_STAGES[i];
    html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:14px 16px;margin-bottom:10px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap;">';
    html += '<span style="background:#7000ff;color:#fff;font-family:var(--font-d);font-weight:900;font-size:11px;padding:3px 9px;border-radius:20px;">'+s.range+'</span>';
    html += '<span style="font-family:var(--font-d);font-weight:800;font-size:14px;color:var(--ee-white);text-transform:uppercase;letter-spacing:.03em;">'+s.title+'</span>';
    html += '</div>';
    html += '<div style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.6);line-height:1.6;">'+s.body+'</div>';
    html += '</div>';
  }

  html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 16px;margin-top:16px;">';
  html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">⚠️ Breeding Traps</div>';
  html += '<ul style="margin:0;padding-left:18px;font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.55);line-height:1.8;">';
  for(let i=0;i<COUNCIL_BREEDER_TRAPS.length;i++){ html += '<li>'+COUNCIL_BREEDER_TRAPS[i]+'</li>'; }
  html += '</ul></div>';

  html += '</div>';
  return html;
}

function councilRenderBreederChecklist(){
  const state = councilLoadDoctrineState(COUNCIL_BREEDER_KEY);
  const box = document.getElementById('council-breeder-checklist');
  if(!box) return;
  let html = '';
  for(let i=0;i<COUNCIL_BREEDER_CHECKLIST_ITEMS.length;i++){
    const item = COUNCIL_BREEDER_CHECKLIST_ITEMS[i];
    const done = !!state[item.id];
    html += '<div onclick="councilToggleBreederCheck(\''+item.id+'\')" style="display:flex;align-items:flex-start;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;background:'+(done?'rgba(255,214,0,.08)':'rgba(255,255,255,.03)')+';border:1px solid '+(done?'rgba(255,214,0,.3)':'rgba(255,255,255,.08)')+';margin-bottom:8px;transition:all .15s;">';
    html += '<span style="min-width:22px;height:22px;border-radius:5px;border:2px solid '+(done?'var(--ee-yellow)':'rgba(255,255,255,.3)')+';display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;background:'+(done?'var(--ee-yellow)':'transparent')+';color:#07000f;font-weight:900;font-size:13px;">'+(done?'✓':'')+'</span>';
    html += '<span style="font-family:var(--font-b);font-size:13px;line-height:1.55;color:'+(done?'rgba(255,255,255,.9)':'rgba(255,255,255,.65)')+';">'+item.text+'</span>';
    html += '</div>';
  }
  box.innerHTML = html;
}
function councilToggleBreederCheck(id){
  const state = councilLoadDoctrineState(COUNCIL_BREEDER_KEY);
  state[id] = !state[id];
  councilSaveDoctrineState(COUNCIL_BREEDER_KEY, state);
  councilRenderBreederChecklist();
}

// ── K30 COMBAT-READY PROGRESSION — Phase 3b (verified City/Combat/Noble data + confirmed Keep costs) ──
const COUNCIL_K30_CHECKLIST_ITEMS = [
  { id: 'k1', text: 'Build Speed, Research Speed, and Research Cost are progressing across the City tree.' },
  { id: 'k2', text: 'Food/Wood/Stone Production is maxed or nearly maxed for my current Keep bracket.' },
  { id: 'k3', text: 'My current troop tier is not badly behind my Keep level.' },
  { id: 'k4', text: 'Army Heal Speed and battalion/army capacity are progressing.' },
  { id: 'k5', text: 'Family Size and Baby Quality Chance support my noble plan at this bracket.' },
  { id: 'k6', text: 'I have reviewed the total resource cost for my next Keep transition and have it reserved.' },
  { id: 'k7', text: 'I am not upgrading Keep just because I can afford it — I have a specific unlock reason.' }
];
const COUNCIL_K30_KEY = 'reResearchK30';

const COUNCIL_K30_STAGES = [
  {
    range: 'K1\u201310',
    title: 'Economy & Foundation',
    body: 'Build Speed, Research Speed, Food/Wood/Stone Production, and the Militia troop tier come first. Early Family Size and Baby Quality Chance: Impressive give your noble program a start without slowing combat progress.'
  },
  {
    range: 'K10\u201318',
    title: 'Core Infrastructure',
    body: 'City and Noble infrastructure matures here — Mining Capacity/Rate, Research Cost, Regular (T2) troop damage/health, and Army Heal Speed. This is also where Family Size II and Baby Quality Chance: Exceptional typically become relevant.'
  },
  {
    range: 'K18\u201325',
    title: 'Main Army Setup',
    body: 'Veteran (T3) troop support research, Troop Health/Damage, Max Battalion Size, and breeding infrastructure (Family Size III, Rare Noble Equipment) all develop together. Don\u0027t let one lag badly behind the others.'
  },
  {
    range: 'K25\u201328',
    title: 'Stop Broad Upgrading — Go Deep',
    body: 'This is where players get overextended. Focus on maturing your T3 line, champions, battalion equipment, your main noble line, healing, and army capacity. Do not chase every niche branch — pick your doctrine and finish it.'
  },
  {
    range: 'K28\u201330',
    title: 'Enter the Bracket Finished',
    body: 'K28+ is already competitive. Strengthen your counter troop line, complete recovery research, and build siege utility only where your doctrine actually needs it. Prepare deliberately — this is not a rush.'
  }
];

const COUNCIL_K30_DO_NOT_RUSH = [
  'Do not upgrade Keep just because you have the resources.',
  'Do not leave Troop Damage and Troop Health multiple levels behind.',
  'Do not enter K28+ without a developed T3 plan.',
  'Do not neglect champions, battalion equipment, noble development, healing, and army capacity.',
  'Do not spend major resources on niche research while your main army research is incomplete.',
  'Do not try to max every branch before K30; prioritize your doctrine.'
];

// Verified Red Empire Player Data — total resource cost per Keep transition
const COUNCIL_K30_COSTS = [
  { t: 'K20 → K21', stone: '36,484,600', iron: '3,276 Common / 229 Uncommon', extra: 'Common Bronze 1,480 / Uncommon Bronze 100' },
  { t: 'K21 → K22', stone: '41,957,000', iron: '6,002 Common / 406 Uncommon', extra: '' },
  { t: 'K22 → K23', stone: '54,546,300', iron: '7,994 Common / 530 Uncommon', extra: '' },
  { t: 'K23 → K24', stone: '70,908,600', iron: '10,420 Common / 706 Uncommon', extra: '' },
  { t: 'K24 → K25', stone: '97,915,860', iron: '17,378 Common / 1,160 Uncommon', extra: '' },
  { t: 'K25 → K26', stone: '160,382,890', iron: '19,331 Common / 1,302 Uncommon', extra: '' },
  { t: 'K26 → K27', stone: '224,432,930', iron: '25,115 Common / 1,690 Uncommon', extra: '' },
  { t: 'K27 → K28', stone: '314,074,820', iron: '32,574 Common / 2,206 Uncommon', extra: '' },
  { t: 'K28 → K29', stone: '444,329,120', iron: '42,514 Common / 2,884 Uncommon', extra: '' },
  { t: 'K29 → K30', stone: '621,704,600', iron: '55,200 Common / 3,750 Uncommon', extra: '' }
];

function councilRenderK30Doctrine(){
  let html = '<div style="padding:0 4px;">';

  html += '<div style="background:rgba(255,214,0,.08);border:1px solid rgba(255,214,0,.3);border-radius:10px;padding:14px 16px;margin-bottom:20px;font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.7);line-height:1.6;">';
  html += '<strong style="color:var(--ee-yellow);">Red Empire Rule:</strong> A developed K28 is more dangerous than a rushed K30.';
  html += '</div>';

  html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--ee-yellow);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">K30 Readiness Checklist</div>';
  html += '<div id="council-k30-checklist"></div>';

  html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--ee-yellow);text-transform:uppercase;letter-spacing:.06em;margin:22px 0 10px;">Stage Progression — Strategic Recommendation</div>';
  for(let i=0;i<COUNCIL_K30_STAGES.length;i++){
    const s = COUNCIL_K30_STAGES[i];
    html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:14px 16px;margin-bottom:10px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap;">';
    html += '<span style="background:var(--ee-yellow);color:#07000f;font-family:var(--font-d);font-weight:900;font-size:11px;padding:3px 9px;border-radius:20px;">'+s.range+'</span>';
    html += '<span style="font-family:var(--font-d);font-weight:800;font-size:14px;color:var(--ee-white);text-transform:uppercase;letter-spacing:.03em;">'+s.title+'</span>';
    html += '</div>';
    html += '<div style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.6);line-height:1.6;">'+s.body+'</div>';
    html += '</div>';
  }

  html += '<div style="background:rgba(217,0,38,.08);border:1px solid rgba(217,0,38,.3);border-radius:10px;padding:14px 16px;margin-top:16px;margin-bottom:20px;">';
  html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:#ff8080;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">🚫 Do Not Rush This</div>';
  html += '<ul style="margin:0;padding-left:18px;font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.6);line-height:1.8;">';
  for(let i=0;i<COUNCIL_K30_DO_NOT_RUSH.length;i++){ html += '<li>'+COUNCIL_K30_DO_NOT_RUSH[i]+'</li>'; }
  html += '</ul></div>';

  html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--ee-yellow);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">K20\u2013K30 Total Upgrade Cost — Verified Red Empire Player Data</div>';
  html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-family:var(--font-b);font-size:12px;">';
  html += '<tr style="border-bottom:1px solid rgba(255,255,255,.15);"><th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,.5);">Transition</th><th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,.5);">Stone</th><th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,.5);">Iron</th></tr>';
  for(let i=0;i<COUNCIL_K30_COSTS.length;i++){
    const c = COUNCIL_K30_COSTS[i];
    html += '<tr style="border-bottom:1px solid rgba(255,255,255,.06);">';
    html += '<td style="padding:6px 8px;color:rgba(255,255,255,.8);white-space:nowrap;">'+c.t+'</td>';
    html += '<td style="padding:6px 8px;color:rgba(255,255,255,.6);">'+c.stone+'</td>';
    html += '<td style="padding:6px 8px;color:rgba(255,255,255,.6);">'+c.iron+(c.extra?'<br><span style="color:rgba(255,255,255,.4);font-size:11px;">'+c.extra+'</span>':'')+'</td>';
    html += '</tr>';
  }
  html += '</table></div>';
  html += '<div style="font-family:var(--font-a);font-size:11px;color:rgba(255,255,255,.35);margin-top:8px;line-height:1.6;">Totals include all buildings + research combined for that transition. Building/research prerequisites and durations: Needs In-Game Confirmation.</div>';

  html += '</div>';
  return html;
}

function councilRenderK30Checklist(){
  const state = councilLoadDoctrineState(COUNCIL_K30_KEY);
  const box = document.getElementById('council-k30-checklist');
  if(!box) return;
  let html = '';
  for(let i=0;i<COUNCIL_K30_CHECKLIST_ITEMS.length;i++){
    const item = COUNCIL_K30_CHECKLIST_ITEMS[i];
    const done = !!state[item.id];
    html += '<div onclick="councilToggleK30Check(\''+item.id+'\')" style="display:flex;align-items:flex-start;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;background:'+(done?'rgba(255,214,0,.08)':'rgba(255,255,255,.03)')+';border:1px solid '+(done?'rgba(255,214,0,.3)':'rgba(255,255,255,.08)')+';margin-bottom:8px;transition:all .15s;">';
    html += '<span style="min-width:22px;height:22px;border-radius:5px;border:2px solid '+(done?'var(--ee-yellow)':'rgba(255,255,255,.3)')+';display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;background:'+(done?'var(--ee-yellow)':'transparent')+';color:#07000f;font-weight:900;font-size:13px;">'+(done?'✓':'')+'</span>';
    html += '<span style="font-family:var(--font-b);font-size:13px;line-height:1.55;color:'+(done?'rgba(255,255,255,.9)':'rgba(255,255,255,.65)')+';">'+item.text+'</span>';
    html += '</div>';
  }
  box.innerHTML = html;
}
function councilToggleK30Check(id){
  const state = councilLoadDoctrineState(COUNCIL_K30_KEY);
  state[id] = !state[id];
  councilSaveDoctrineState(COUNCIL_K30_KEY, state);
  councilRenderK30Checklist();
}

// ── ALLIANCE ROLE PATHS — Phase 3c (verified Combat/Siege/Noble/City data) ──
const COUNCIL_ROLES = [
  {
    id: 'rally',
    icon: '⚔️',
    name: 'Rally Lead',
    purpose: 'Leads offensive rallies and coordinated strikes. Fields the primary attacking force.',
    core: 'Max Battalion Size, Max Staged Armies, Armies per Stage, Troop Damage, and your primary troop line through Veteran (T3).',
    secondary: 'Army Deploy Cost Efficiency, matching Troop Equipment tier, Suspiciously Good PvP Damage (after core basics).',
    delay: 'Siege research (Catapult/Trebuchet/Rockbreaker lines), secondary troop lines before the primary is finished.',
    note: 'When Red Empire needs someone to lead the strike.'
  },
  {
    id: 'defense',
    icon: '🛡️',
    name: 'Reinforcement / Defense Player',
    purpose: 'Holds cities and rallies under attack. The wall Red Empire stands behind.',
    core: 'Troop Health, Army Heal Speed, Ranged/Infantry/Mounted Health, Watchtower Damage/Defense/Bonus Range, Garrison Size/Damage.',
    secondary: 'Keep Defense, Wall Strength, Mining Load Protection (resource protection while under siege).',
    delay: 'Damage vs Buildings research and siege-only lines — those are offensive tools, not defensive ones.',
    note: 'When Red Empire needs a wall that doesn\u0027t break.'
  },
  {
    id: 'siege',
    icon: '🎯',
    name: 'Siege Specialist',
    purpose: 'Breaks walls and gates to open the path for the main army.',
    core: 'Catapult line (Catapult Damage, Catapult AoE, Machine Health/Speed) and Trebuchet line (Trebuchet Damage/Range/Repair Speed).',
    secondary: 'Machine Cost Efficiency, the Advanced Mechanics gate nodes, Rockbreaker line for resource-focused siege play.',
    delay: 'Troop-line research unrelated to siege support — a Siege Specialist doesn\u0027t need a maxed Cavalry line.',
    note: 'Trebuchets are built for walls and gates; catapults carry real battlefield utility beyond siege alone. When Red Empire needs the gates open.'
  },
  {
    id: 'breeder',
    icon: '🧬',
    name: 'Noble Breeder',
    purpose: 'Builds and preserves Red Empire\u0027s bloodlines for the long term.',
    core: 'Family Size (I\u2013IV), Baby Quality Chance tiers, Suspiciously Good Genes/Offspring once core research is handled.',
    secondary: 'Noble Equipment tiers (Uncommon/Rare/Epic), role-specific Talent Bonus and Activity Bonus nodes.',
    delay: 'Combat troop research unrelated to supporting your breeding nobles\u0027 roles.',
    note: 'When Red Empire needs the next generation.'
  },
  {
    id: 'economy',
    icon: '💰',
    name: 'Economic / Support Player',
    purpose: 'Keeps the alliance\u0027s engine running — resources, research speed, and infrastructure.',
    core: 'Build Speed, Research Speed, Research Cost, Mining Capacity/Rate, Food/Wood/Stone Production.',
    secondary: 'Mining Load Protection (resource protection), enough baseline Troop Health/Damage to avoid being easy prey.',
    delay: 'Deep siege and niche combat branches beyond what\u0027s needed for basic self-defense.',
    note: 'When Red Empire needs the engine running.'
  }
];

function councilRenderRolesDoctrine(){
  let html = '<div style="padding:0 4px;">';
  html += '<div style="background:rgba(136,170,255,.08);border:1px solid rgba(136,170,255,.3);border-radius:10px;padding:14px 16px;margin-bottom:20px;font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.7);line-height:1.6;">';
  html += 'Not everyone should research the same way. Pick the role that fits how you actually play, then research toward it.';
  html += '</div>';

  for(let i=0;i<COUNCIL_ROLES.length;i++){
    const r = COUNCIL_ROLES[i];
    html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:10px;overflow:hidden;margin-bottom:10px;">';
    html += '<div onclick="councilToggleRole(\''+r.id+'\')" id="council-role-header-'+r.id+'" style="padding:14px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;">';
    html += '<span style="font-family:var(--font-d);font-weight:800;font-size:14px;color:var(--ee-white);text-transform:uppercase;letter-spacing:.03em;">'+r.icon+' '+r.name+'</span>';
    html += '<span id="council-role-arrow-'+r.id+'" style="color:rgba(255,255,255,.4);font-size:14px;transition:transform .2s;display:inline-block;">▾</span>';
    html += '</div>';
    html += '<div id="council-role-body-'+r.id+'" style="display:none;padding:0 16px 16px;font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.6);line-height:1.7;">';
    html += '<div style="margin-bottom:8px;"><strong style="color:var(--ee-yellow);">Purpose:</strong> '+r.purpose+'</div>';
    html += '<div style="margin-bottom:8px;"><strong style="color:#88cc88;">Core Research:</strong> '+r.core+'</div>';
    html += '<div style="margin-bottom:8px;"><strong style="color:#66aaff;">Useful Secondary:</strong> '+r.secondary+'</div>';
    html += '<div style="margin-bottom:8px;"><strong style="color:rgba(255,255,255,.5);">Delay:</strong> '+r.delay+'</div>';
    html += '<div style="font-style:italic;color:rgba(255,255,255,.45);">'+r.note+'</div>';
    html += '</div></div>';
  }
  html += '</div>';
  return html;
}

function councilToggleRole(id){
  const body = document.getElementById('council-role-body-'+id);
  const arrow = document.getElementById('council-role-arrow-'+id);
  if(!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  if(arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', function(){
  councilRenderChecklist();
});

// ── RESEARCH AUDIT TOOL — Phase 4 ──
// Strategic Red Empire Audit — Not an in-game power calculation.
const COUNCIL_AUDIT_CATEGORIES = [
  { id: 'buildspeed', label: 'Build Speed' },
  { id: 'researchspeed', label: 'Research Speed' },
  { id: 'researchcost', label: 'Research Cost' },
  { id: 'troopdamage', label: 'Troop Damage' },
  { id: 'troophealth', label: 'Troop Health' },
  { id: 'healspeed', label: 'Army Heal Speed' },
  { id: 'battalionsize', label: 'Max Battalion Size' },
  { id: 'armiesperstage', label: 'Armies Per Stage' },
  { id: 'primaryline', label: 'Primary Troop-Line Research' },
  { id: 'secondaryline', label: 'Secondary Counter Troop-Line Research' },
  { id: 'champion', label: 'Champion Setup' },
  { id: 'battalionequip', label: 'Battalion Equipment' },
  { id: 'familysize', label: 'Family Size' },
  { id: 'babyquality', label: 'Baby Quality' },
  { id: 'nobleline', label: 'Main Noble Line' },
  { id: 'siege', label: 'Siege Readiness' },
  { id: 'resourceprotection', label: 'Resource Protection' }
];
const COUNCIL_AUDIT_KEY = 'reResearchAudit';
const COUNCIL_AUDIT_LEVELS = [
  { v: 'behind', label: 'Behind', color: '#ff8080' },
  { v: 'ok', label: 'On Track', color: '#ffd600' },
  { v: 'strong', label: 'Strong', color: '#88cc88' }
];

function councilLoadAudit(){
  try {
    const raw = localStorage.getItem(COUNCIL_AUDIT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e){ return {}; }
}
function councilSaveAudit(state){
  try { localStorage.setItem(COUNCIL_AUDIT_KEY, JSON.stringify(state)); } catch(e){}
}
function councilSetAuditRating(id, level){
  const state = councilLoadAudit();
  state[id] = level;
  councilSaveAudit(state);
  councilRenderAuditCategories();
}
function councilRenderAuditCategories(){
  const state = councilLoadAudit();
  const box = document.getElementById('council-audit-categories');
  if(!box) return;
  let html = '';
  for(let i=0;i<COUNCIL_AUDIT_CATEGORIES.length;i++){
    const cat = COUNCIL_AUDIT_CATEGORIES[i];
    const current = state[cat.id];
    html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08);">';
    html += '<span style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.75);flex:1;min-width:160px;">'+cat.label+'</span>';
    html += '<div style="display:flex;gap:6px;">';
    for(let j=0;j<COUNCIL_AUDIT_LEVELS.length;j++){
      const lvl = COUNCIL_AUDIT_LEVELS[j];
      const active = current === lvl.v;
      html += '<button onclick="councilSetAuditRating(\''+cat.id+'\',\''+lvl.v+'\')" style="background:'+(active?lvl.color:'rgba(255,255,255,.05)')+';color:'+(active?'#07000f':'rgba(255,255,255,.5)')+';border:1px solid '+(active?lvl.color:'rgba(255,255,255,.15)')+';border-radius:6px;padding:5px 10px;cursor:pointer;font-family:var(--font-d);font-weight:700;font-size:11px;letter-spacing:.04em;text-transform:uppercase;">'+lvl.label+'</button>';
    }
    html += '</div></div>';
  }
  box.innerHTML = html;
}

function councilRunAudit(){
  const s = councilLoadAudit();
  const flags = [];

  const coreCombat = ['troopdamage','troophealth','healspeed','primaryline'];
  const coreBehindCount = coreCombat.filter(id => s[id] === 'behind').length;
  const coreStrongCount = coreCombat.filter(id => s[id] === 'strong' || s[id] === 'ok').length;

  if(coreBehindCount === 0 && coreStrongCount === coreCombat.length && (s.battalionsize === 'strong' || s.battalionsize === 'ok')){
    flags.push({ tag: 'Combat Ready', desc: 'Your primary troop line, damage, health, healing, and battalion size are all on track or strong. You are in reasonable shape to consider advancing.' });
  }
  if(coreBehindCount >= 2){
    flags.push({ tag: 'Rushed Keep Risk', desc: 'Multiple core combat categories (damage, health, healing, or primary line) are marked Behind. Advancing further before catching these up risks entering a bracket weaker than established players there.' });
  }
  if((s.healspeed === 'behind' || s.troophealth === 'behind') && (s.troopdamage === 'strong' || s.troopdamage === 'ok')){
    flags.push({ tag: 'Weak Recovery', desc: 'Your damage output is ahead of your healing/health. You can hit hard but you won\u0027t recover well from losses — prioritize Army Heal Speed and Troop Health next.' });
  }
  if((s.buildspeed === 'strong' && s.researchspeed === 'strong' && s.researchcost === 'strong') && (s.troopdamage === 'behind' || s.troophealth === 'behind')){
    flags.push({ tag: 'Overbuilt Economy', desc: 'Your economy research is well ahead of your combat research. A strong economy without matching military strength doesn\u0027t translate to safety or PvP results.' });
  }
  if((s.familysize === 'behind' || s.babyquality === 'behind') && coreStrongCount >= 2){
    flags.push({ tag: 'Breeding Bottleneck', desc: 'Your combat research is progressing but Family Size or Baby Quality is Behind. Your noble program will fall behind your account\u0027s combat strength if this continues.' });
  }
  if(s.secondaryline && s.secondaryline !== 'behind' && s.primaryline === 'behind'){
    flags.push({ tag: 'Too Spread Across Troop Lines', desc: 'You\u0027re investing in a secondary/counter troop line before your primary line is finished. Finish one army before starting the next.' });
  }
  if((s.champion === 'behind' || s.battalionequip === 'behind') && (s.troopdamage === 'strong' || s.troophealth === 'strong')){
    flags.push({ tag: 'Champion / Equipment Gap', desc: 'Your troop research is strong but Champion setup or Battalion Equipment is lagging. These directly amplify what your troop research already built — don\u0027t leave that value on the table.' });
  }
  if(s.siege === 'strong' && coreBehindCount >= 1){
    flags.push({ tag: 'Siege Specialist Candidate', desc: 'Your siege research is ahead of your general combat research. This profile fits a Siege Specialist role well — consider leaning into it rather than trying to also be a Rally Lead.' });
  }

  const box = document.getElementById('council-audit-result');
  if(!box) return;
  if(flags.length === 0){
    box.innerHTML = '<div style="text-align:center;padding:20px;font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.4);">Rate at least a few categories above, then run the audit again. No clear pattern detected yet.</div>';
    return;
  }
  let html = '<div style="font-family:var(--font-a);font-size:11px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:12px;">Strategic Red Empire Audit — Not an in-game power calculation</div>';
  for(let i=0;i<flags.length;i++){
    const f = flags[i];
    html += '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:14px 16px;margin-bottom:10px;">';
    html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--ee-yellow);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">'+f.tag+'</div>';
    html += '<div style="font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.6);line-height:1.6;">'+f.desc+'</div>';
    html += '</div>';
  }
  box.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function(){
  councilRenderAuditCategories();
});

// ── MAIN ARMY PLANNER — Phase 4b ──
// Red Empire Strategic Recommendation
const COUNCIL_ARMIES = {
  enforcer: {
    label: '🗡️ Swordsmen + Archers',
    nobleLine: 'Enforcer Line (Captain → Marshal → Justicar)',
    primary: 'Militia/Regular/Veteran Swordsman and Archer chains, Infantry/Ranged Damage and Health, the Advanced Training gate nodes between each troop generation.',
    secondary: 'Mounted Damage/Health only if you\u0027re regularly facing heavy Cavalry opponents — otherwise low priority.',
    delay: 'Axeman and Cavalry-specific troop research. You don\u0027t need Regular/Veteran Cavalry if this is your primary line.',
    siege: 'Lower priority than for an Axemen/Catapult army. Catapult support helps if you\u0027re pushing city walls, but it\u0027s not core to this doctrine.',
    next: 'Finish the Veteran (T3) tier for both Swordsman and Archer before touching Max Battalion Size or a second troop line.'
  },
  guardian: {
    label: '🐴 Cavalry + Crossbowmen',
    nobleLine: 'Guardian Line (Knight → Paladin → Sentinel)',
    primary: 'Militia/Regular/Veteran Cavalry and Crossbowman chains, Mounted/Ranged Damage and Health, the Advanced Training gate nodes between each troop generation.',
    secondary: 'Infantry Damage/Health helps against Swordsman-heavy opponents, since the in-game counter system has Cavalry beating Swords.',
    delay: 'Axeman-specific troop research — not part of this doctrine\u0027s counter loop.',
    siege: 'Trebuchet support is useful for breaking gates ahead of a fast cavalry raid, but it\u0027s a secondary investment, not a primary one.',
    next: 'Finish the Veteran (T3) tier for both Cavalry and Crossbowman, then prioritize Army Heal Speed — cavalry rallies take losses fast.'
  },
  harbinger: {
    label: '🪓 Axemen + Catapults',
    nobleLine: 'Harbinger Line (Subjugator → Conqueror → Vanquisher)',
    primary: 'Militia/Regular/Veteran Axeman chain, Infantry Damage and Health, plus the Catapult line (Catapult Damage, Catapult AoE, Machine Health/Speed).',
    secondary: 'The in-game counter system has Axemen beating Cavalry, so this line naturally counters Cavalry-heavy opponents without extra research.',
    delay: 'Ranged-specific troop research (Archer/Crossbowman lines) unless you\u0027re running a mixed composition.',
    siege: 'High priority — Catapults are core to this doctrine, not an add-on. Machine Cost Efficiency and the Advanced Mechanics gate nodes matter here.',
    next: 'Finish the Veteran Axeman line and Catapult Damage/AoE together — this doctrine leans on both halves equally.'
  }
};

function councilShowArmy(key){
  const a = COUNCIL_ARMIES[key];
  if(!a) return;
  document.querySelectorAll('.council-army-btn').forEach(function(b){
    b.style.background = 'rgba(255,255,255,.05)';
    b.style.borderColor = 'rgba(255,255,255,.15)';
    b.style.color = 'rgba(255,255,255,.6)';
  });
  const btn = document.getElementById('council-army-'+key);
  if(btn){
    btn.style.background = 'rgba(255,214,0,.1)';
    btn.style.borderColor = 'var(--ee-yellow)';
    btn.style.color = 'var(--ee-yellow)';
  }
  const body = document.getElementById('council-army-body');
  if(!body) return;
  let html = '<div style="font-family:var(--font-a);font-size:11px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:12px;">Red Empire Strategic Recommendation</div>';
  html += '<div style="font-family:var(--font-d);font-weight:800;font-size:16px;color:var(--ee-yellow);text-transform:uppercase;letter-spacing:.04em;margin-bottom:14px;">'+a.label+'</div>';
  html += '<div style="margin-bottom:10px;"><strong style="color:#88cc88;font-family:var(--font-b);font-size:13px;">Primary Research:</strong> <span style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.65);line-height:1.6;">'+a.primary+'</span></div>';
  html += '<div style="margin-bottom:10px;"><strong style="color:#66aaff;font-family:var(--font-b);font-size:13px;">Useful Secondary:</strong> <span style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.65);line-height:1.6;">'+a.secondary+'</span></div>';
  html += '<div style="margin-bottom:10px;"><strong style="color:rgba(255,255,255,.5);font-family:var(--font-b);font-size:13px;">Delay:</strong> <span style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.65);line-height:1.6;">'+a.delay+'</span></div>';
  html += '<div style="margin-bottom:10px;"><strong style="color:#c090ff;font-family:var(--font-b);font-size:13px;">Noble Line:</strong> <span style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.65);line-height:1.6;">'+a.nobleLine+'</span></div>';
  html += '<div style="margin-bottom:10px;"><strong style="color:#ffaa44;font-family:var(--font-b);font-size:13px;">Siege Relevance:</strong> <span style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.65);line-height:1.6;">'+a.siege+'</span></div>';
  html += '<div style="background:rgba(255,214,0,.08);border:1px solid rgba(255,214,0,.25);border-radius:8px;padding:12px 14px;margin-top:14px;"><strong style="color:var(--ee-yellow);font-family:var(--font-b);font-size:13px;">Next Focus:</strong> <span style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.7);line-height:1.6;">'+a.next+'</span></div>';
  body.innerHTML = html;
}

// ── RESEARCH ROI TABLE — Phase 5a (qualitative Strategic Recommendation, not exact math) ──
const COUNCIL_ROI_ROWS = [
  { cat:'Troop Damage', pvp:'High', pve:'High', keep:'Medium', breed:'Low', cost:'Medium', priority:'Core', notes:'Backbone of any troop line\u0027s output.' },
  { cat:'Troop Health', pvp:'High', pve:'Medium', keep:'Medium', breed:'Low', cost:'Medium', priority:'Core', notes:'Prevents losses from erasing your rally line.' },
  { cat:'Army Heal Speed', pvp:'High', pve:'Medium', keep:'Low', breed:'Low', cost:'Low', priority:'Core', notes:'Determines how fast you recover between fights.' },
  { cat:'Max Battalion Size', pvp:'High', pve:'Medium', keep:'Low', breed:'Low', cost:'Medium', priority:'Core', notes:'Raises how many troops you field per army.' },
  { cat:'Research Speed', pvp:'Low', pve:'Low', keep:'High', breed:'Medium', cost:'Low', priority:'Strong', notes:'Compounds across every future research investment.' },
  { cat:'Research Cost', pvp:'Low', pve:'Low', keep:'High', breed:'Medium', cost:'Low', priority:'Strong', notes:'Frees resources for combat/noble research sooner.' },
  { cat:'Build Speed', pvp:'Low', pve:'Low', keep:'High', breed:'Low', cost:'Low', priority:'Strong', notes:'Accelerates every future building upgrade.' },
  { cat:'Resource Protection', pvp:'Medium', pve:'Low', keep:'Low', breed:'Low', cost:'Low', priority:'Strong', notes:'Protects resources from raids during active play windows.' },
  { cat:'Family Size', pvp:'Low', pve:'Low', keep:'Medium', breed:'High', cost:'Medium', priority:'Core (Breeder)', notes:'Hard cap on how many couples you can run.' },
  { cat:'Baby Quality Chance', pvp:'Low', pve:'Low', keep:'Low', breed:'High', cost:'Medium', priority:'Core (Breeder)', notes:'Directly shapes trait inheritance odds.' },
  { cat:'Noble Equipment', pvp:'Low', pve:'Low', keep:'Low', breed:'Medium', cost:'Medium', priority:'Situational', notes:'Matters most for combat-role nobles.' },
  { cat:'Watchtower Damage/Defense', pvp:'Medium', pve:'Low', keep:'Low', breed:'Low', cost:'Low', priority:'Situational', notes:'Useful for defensive players, low value for Rally Leads.' },
  { cat:'Catapult Research', pvp:'Medium', pve:'Medium', keep:'Low', breed:'Low', cost:'Medium', priority:'Role-Specific', notes:'Core for Siege Specialists, secondary for others.' },
  { cat:'Trebuchet Research', pvp:'Medium', pve:'Low', keep:'Low', breed:'Low', cost:'High', priority:'Role-Specific', notes:'Wall/gate breaking — situational outside sieges.' },
  { cat:'Rockbreaker Capacity', pvp:'Low', pve:'Medium', keep:'Low', breed:'Low', cost:'High', priority:'Role-Specific', notes:'Mining-focused siege investment — niche.' }
];

function councilRenderRoiTable(filter){
  const box = document.getElementById('council-roi-table');
  if(!box) return;
  const rows = COUNCIL_ROI_ROWS.filter(r => !filter || filter === 'all' || r.priority.indexOf(filter) === 0);
  let html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-family:var(--font-b);font-size:12px;min-width:640px;">';
  html += '<tr style="border-bottom:1px solid rgba(255,255,255,.15);">';
  ['Category','PvP','PvE','Keep Prog.','Breeding','Cost','Priority','Notes'].forEach(function(h){
    html += '<th style="text-align:left;padding:8px;color:rgba(255,255,255,.5);white-space:nowrap;">'+h+'</th>';
  });
  html += '</tr>';
  const priorityColors = { 'Core':'#88cc88', 'Core (Breeder)':'#c090ff', 'Strong':'#66aaff', 'Situational':'#ffd600', 'Role-Specific':'#ffaa44', 'Delay':'rgba(255,255,255,.4)' };
  for(let i=0;i<rows.length;i++){
    const r = rows[i];
    html += '<tr style="border-bottom:1px solid rgba(255,255,255,.06);">';
    html += '<td style="padding:8px;color:rgba(255,255,255,.85);font-weight:700;white-space:nowrap;">'+r.cat+'</td>';
    html += '<td style="padding:8px;color:rgba(255,255,255,.6);">'+r.pvp+'</td>';
    html += '<td style="padding:8px;color:rgba(255,255,255,.6);">'+r.pve+'</td>';
    html += '<td style="padding:8px;color:rgba(255,255,255,.6);">'+r.keep+'</td>';
    html += '<td style="padding:8px;color:rgba(255,255,255,.6);">'+r.breed+'</td>';
    html += '<td style="padding:8px;color:rgba(255,255,255,.6);">'+r.cost+'</td>';
    html += '<td style="padding:8px;color:'+(priorityColors[r.priority]||'#fff')+';font-weight:700;white-space:nowrap;">'+r.priority+'</td>';
    html += '<td style="padding:8px;color:rgba(255,255,255,.5);min-width:200px;">'+r.notes+'</td>';
    html += '</tr>';
  }
  html += '</table></div>';
  box.innerHTML = html;
}
function councilFilterRoi(filter){
  document.querySelectorAll('.council-roi-filter-btn').forEach(function(b){
    b.style.background = 'rgba(255,255,255,.05)';
    b.style.color = 'rgba(255,255,255,.6)';
  });
  const btn = document.getElementById('council-roi-f-'+filter);
  if(btn){ btn.style.background = 'rgba(255,214,0,.15)'; btn.style.color = 'var(--ee-yellow)'; }
  councilRenderRoiTable(filter);
}

// ── RESEARCH TRAPS SECTION — Phase 5b ──
const COUNCIL_TRAPS = [
  { name: 'The Empty Keep Trap', desc: 'High Keep level but weak troops, healing, nobles, or research. Looks advanced, loses to a developed lower-Keep account.' },
  { name: 'The Even-Spread Trap', desc: 'Trying to level every troop line equally instead of building one main army. Spreads resources thin instead of finishing anything.' },
  { name: 'The Tower Trap', desc: 'Overinvesting in walls, gates, watchtowers, and city defense before core army development. Defense without offense still loses rallies.' },
  { name: 'The Rockbreaker Trap', desc: 'Investing heavily in mining-focused siege while core combat and progression research are unfinished.' },
  { name: 'The Golden Node Trap', desc: 'Rushing expensive advanced ("Suspiciously Good") research while basic Troop Damage, Troop Health, or recovery is still behind.' },
  { name: 'The Siege Trap', desc: 'Building advanced siege equipment while unable to reliably clear defending armies. Siege wins nothing if your army loses the fight first.' },
  { name: 'The Breeder Neglect Trap', desc: 'Rushing combat while family capacity, baby quality, and valuable couples are capped or ignored. Your bloodline falls behind your account.' }
];

function councilRenderTraps(){
  let html = '';
  for(let i=0;i<COUNCIL_TRAPS.length;i++){
    const t = COUNCIL_TRAPS[i];
    html += '<div style="background:rgba(217,0,38,.08);border:1px solid rgba(217,0,38,.25);border-radius:10px;padding:14px 16px;margin-bottom:10px;">';
    html += '<div style="font-family:var(--font-d);font-weight:800;font-size:14px;color:#ff8080;text-transform:uppercase;letter-spacing:.03em;margin-bottom:6px;">⚠️ '+t.name+'</div>';
    html += '<div style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.6);line-height:1.6;">'+t.desc+'</div>';
    html += '</div>';
  }
  const box = document.getElementById('council-traps-list');
  if(box) box.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function(){
  councilRenderRoiTable('all');
  councilRenderTraps();
});

// ── GENERIC SECTION TOGGLE (Doctrine Selector, Audit Tool, Army Planner, ROI Table, Traps) ──
function councilToggleSection(id){
  const body = document.getElementById('council-section-body-'+id);
  const arrow = document.getElementById('council-section-arrow-'+id);
  if(!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  if(arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

// ── K20-K30 KEEP UPGRADE PLANNER — Phase 6 ──
const COUNCIL_KEEP_CARDS = [
  { id:'k20-21', t:'K20 → K21', stone:'36,484,600', iron:'3,276 Common / 229 Uncommon', extra:'Common Bronze 1,480 / Uncommon Bronze 100', garrisonNote:false },
  { id:'k21-22', t:'K21 → K22', stone:'41,957,000', iron:'6,002 Common / 406 Uncommon', extra:'', garrisonNote:true },
  { id:'k22-23', t:'K22 → K23', stone:'54,546,300', iron:'7,994 Common / 530 Uncommon', extra:'', garrisonNote:true },
  { id:'k23-24', t:'K23 → K24', stone:'70,908,600', iron:'10,420 Common / 706 Uncommon', extra:'', garrisonNote:true },
  { id:'k24-25', t:'K24 → K25', stone:'97,915,860', iron:'17,378 Common / 1,160 Uncommon', extra:'', garrisonNote:true },
  { id:'k25-26', t:'K25 → K26', stone:'160,382,890', iron:'19,331 Common / 1,302 Uncommon', extra:'', garrisonNote:true },
  { id:'k26-27', t:'K26 → K27', stone:'224,432,930', iron:'25,115 Common / 1,690 Uncommon', extra:'', garrisonNote:true },
  { id:'k27-28', t:'K27 → K28', stone:'314,074,820', iron:'32,574 Common / 2,206 Uncommon', extra:'', garrisonNote:true },
  { id:'k28-29', t:'K28 → K29', stone:'444,329,120', iron:'42,514 Common / 2,884 Uncommon', extra:'', garrisonNote:true },
  { id:'k29-30', t:'K29 → K30', stone:'621,704,600', iron:'55,200 Common / 3,750 Uncommon', extra:'', garrisonNote:true }
];

function councilRenderKeepPlanner(){
  let html = '';
  for(let i=0;i<COUNCIL_KEEP_CARDS.length;i++){
    const c = COUNCIL_KEEP_CARDS[i];
    html += '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:10px;overflow:hidden;margin-bottom:10px;">';
    html += '<div onclick="councilToggleKeepCard(\''+c.id+'\')" style="padding:14px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;">';
    html += '<span style="font-family:var(--font-d);font-weight:800;font-size:16px;color:var(--ee-white);letter-spacing:.03em;">'+c.t+'</span>';
    html += '<span id="council-keep-arrow-'+c.id+'" style="color:rgba(255,255,255,.4);font-size:15px;transition:transform .2s;display:inline-block;">▾</span>';
    html += '</div>';
    html += '<div id="council-keep-body-'+c.id+'" style="display:none;padding:0 16px 16px;">';

    html += '<div style="font-family:var(--font-a);font-size:12px;font-weight:700;letter-spacing:.06em;color:#88cc88;text-transform:uppercase;margin-bottom:5px;">Verified Red Empire Player Data</div>';
    html += '<div style="font-family:var(--font-b);font-size:14px;color:rgba(255,255,255,.75);line-height:1.7;margin-bottom:14px;">Total Cost — Stone: '+c.stone+' · Iron: '+c.iron+(c.extra?' · '+c.extra:'')+'</div>';

    html += '<div style="font-family:var(--font-a);font-size:12px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:5px;">Needs In-Game Confirmation</div>';
    html += '<div style="font-family:var(--font-b);font-size:14px;color:rgba(255,255,255,.5);line-height:1.7;margin-bottom:14px;">Required building names/levels, Academy research gates, and upgrade duration — awaiting screenshots.</div>';

    if(c.garrisonNote){
      html += '<div style="background:rgba(217,0,38,.08);border:1px solid rgba(217,0,38,.25);border-radius:8px;padding:12px 14px;margin-bottom:8px;">';
      html += '<div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:#ff8080;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px;">🚫 Do Not Advance Yet If...</div>';
      html += '<div style="font-family:var(--font-b);font-size:14px;color:rgba(255,255,255,.65);line-height:1.65;">You don\u0027t have a full T3 Crossbowman garrison in every Watchtower, or full T3 Catapult coverage on every Platform, once those unlock. Verified Red Empire Player Data.</div>';
      html += '</div>';
    }

    html += '</div></div>';
  }
  const box = document.getElementById('council-keep-list');
  if(box) box.innerHTML = html;
}

function councilToggleKeepCard(id){
  const body = document.getElementById('council-keep-body-'+id);
  const arrow = document.getElementById('council-keep-arrow-'+id);
  if(!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  if(arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

document.addEventListener('DOMContentLoaded', function(){
  councilRenderKeepPlanner();
});