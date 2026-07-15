// ═══════════════════════════════════════════════════════════════
// JAVASCRIPT — see file-map comment at top of file for section list
// ═══════════════════════════════════════════════════════════════
  window.addEventListener('load', function(){ window.scrollTo(0,0); });

// ── VIEW SWITCHING ──
const VIEWS=['home','command','beginners','research','nobles','simulator','battlesim','pvp','tips','alliance'];
function showView(id, anchor){
  VIEWS.forEach(v=>{
    document.getElementById('view-'+v).classList.remove('active');
    const bn=document.getElementById('bnav-'+v);
    if(bn) bn.classList.remove('active');
  });
  document.getElementById('view-'+id).classList.add('active');
  const bn=document.getElementById('bnav-'+id);
  if(bn) bn.classList.add('active');
  if(id==='battlesim') initBattleSimStandalone();
  if(anchor){
    setTimeout(()=>{
      const el=document.getElementById(anchor);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    },80);
  } else {
    window.scrollTo(0,0);
  }
}

// ── PHASE TOGGLE ──
function togglePhase(id){
  document.getElementById(id).classList.toggle('open');
}

// ── COLLAPSIBLE SECTION ──
function toggleCollapsible(header){
  const body=header.nextElementSibling;
  const chevron=header.querySelector('.collapse-chevron');
  const isOpen=body.style.display==='block';
  body.style.display=isOpen?'none':'block';
  if(chevron) chevron.style.transform=isOpen?'rotate(0deg)':'rotate(180deg)';
}

// ── BEGINNER CHECKLIST ──
const BEG_TOTAL=17;
function toggleCheck(el){
  el.classList.toggle('done');
  updateBegProgress();
}
function updateBegProgress(){
  const done=document.querySelectorAll('#view-beginners .check-item.done').length;
  const pct=Math.round((done/BEG_TOTAL)*100);
  document.getElementById('beg-prog-bar').style.width=pct+'%';
  document.getElementById('beg-prog-label').textContent=done+' / '+BEG_TOTAL+' complete';
}

// ── BUILDING ADJUSTER ──
const levels={keep:10,farm:8,barracks:8,watch:5};
function adj(key,delta){
  levels[key]=Math.max(1,Math.min(25,levels[key]+delta));
  document.getElementById('disp-'+key).textContent=levels[key];
}
function saveLevels(){
  const card=document.getElementById('priority-card');
  const text=document.getElementById('priority-text');
  const blockers=document.getElementById('blockers-list');
  card.style.display='block';
  const issues=[];
  if(levels.farm<levels.keep-1) issues.push('⚠ Farm ('+levels.farm+') is behind Keep level — upgrade Farm first');
  if(levels.watch<levels.keep-3) issues.push('⚠ Watchtower ('+levels.watch+') is lagging — upgrade for better scout defense');
  if(levels.keep<25){
    text.textContent='Upgrade Keep from '+levels.keep+' → '+(levels.keep+1)+' to unlock new buildings and research.';
  } else {
    text.textContent='Keep is maxed at 25. Focus on noble training and breeding programs.';
  }
  if(issues.length){
    blockers.innerHTML='<div class="card-title" style="margin-top:12px;">🚫 Blockers to Fix First</div>'+issues.map(i=>'<div class="blocker-item">'+i+'</div>').join('');
  } else {
    blockers.innerHTML='<div class="good-text">✅ No critical blockers — your buildings are balanced!</div>';
  }
  document.getElementById('save-confirm').textContent='✓ Saved';
  setTimeout(()=>{ document.getElementById('save-confirm').textContent=''; },2000);
}

// ── ARMY SIM TABS ──
function switchSimTab(btn,tabId){
  document.querySelectorAll('.sim-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  ['upload','pve','pvp-atk','pvp-def','battle'].forEach(id=>{
    const el=document.getElementById('stab-'+id);
    if(el) el.style.display=id===tabId?'block':'none';
  });
  if(tabId==='battle') initBattleSim();
}
