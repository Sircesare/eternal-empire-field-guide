// ── SHARD COUNTDOWN ──
(function(){
  const target=new Date('2027-01-01T00:00:00');
  function tick(){
    const now=new Date();
    const diff=target-now;
    if(diff<=0){
      document.getElementById('cd-days').textContent='00';
      document.getElementById('cd-hours').textContent='00';
      document.getElementById('cd-mins').textContent='00';
      document.getElementById('cd-secs').textContent='00';
      return;
    }
    const d=Math.floor(diff/86400000);
    const h=Math.floor((diff%86400000)/3600000);
    const m=Math.floor((diff%3600000)/60000);
    const s=Math.floor((diff%60000)/1000);
    document.getElementById('cd-days').textContent=String(d).padStart(2,'0');
    document.getElementById('cd-hours').textContent=String(h).padStart(2,'0');
    document.getElementById('cd-mins').textContent=String(m).padStart(2,'0');
    document.getElementById('cd-secs').textContent=String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick,1000);
})();
// ── TIP PANELS ──
function toggleTip(id){
  const body=document.getElementById(id);
  const chev=document.getElementById('chevron-'+id);
  const open=body.style.display==='block';
  body.style.display=open?'none':'block';
  chev.style.transform=open?'':'rotate(180deg)';
}
// ── PvP NOBLE CARDS ──
function togglePvpCard(id){
  const body=document.getElementById('pvpcard-'+id);
  const chev=document.getElementById('chevron-'+id);
  const open=body.style.display==='block';
  body.style.display=open?'none':'block';
  chev.style.transform=open?'':'rotate(180deg)';
}

// ── PvP ELEMENT TRIANGLE ──
const ELEM_DATA={
  lightning:{title:'⚡ Lightning',color:'#bb88ff',text:'Lightning deals bonus damage against Frost battalions. If your enemy is running Frost-element weapons (common on Graveborn NPCs), Lightning is the confirmed counter. Lightning\'s own counter target is unconfirmed — flagged for now, not guessed at.'},
  frost:{title:'❄️ Frost',color:'#66ddff',text:'Frost deals bonus damage against Fire battalions. If your enemy is running Fire-element weapons, answer with Frost. Frost troops also resist incoming Frost damage when paired with Frost armor. In PvP, Frost is your counter to aggressive fire-weapon users and Cinderbone-style Fire compositions. Be aware: Lightning counters you.'},
  fire:{title:'🔥 Fire',color:'#ff6644',text:'Fire deals bonus damage against Physical battalions. If your enemy is running Sparksteel or unequipped (default Physical) weapons, Fire counters them. Be aware: Frost counters you. Fire is strong against unprepared or unequipped enemies who haven\'t assigned weapon-slot battalion equipment.'},
  physical:{title:'⚙️ Physical (Sparksteel)',color:'#cccccc',text:'Confirmed in-game: Physical has no elemental advantage against any element. Sparksteel-forged weapons deal Physical damage and are the default for unequipped battalions, but they do not counter Frost or anything else — that older claim has been corrected. Be aware: Fire counters you.'}
};
function showElem(key){
  const d=ELEM_DATA[key];
  document.getElementById('elem-panel').style.display='block';
  document.getElementById('elem-text').innerHTML='<strong style="color:'+d.color+';font-family:var(--font-d);font-size:14px;letter-spacing:.04em;">'+d.title+'</strong><br><br>'+d.text;
  ['lightning','frost','fire','physical'].forEach(k=>{
    document.getElementById('ebtn-'+k).style.opacity=k===key?'1':'.5';
  });
}
