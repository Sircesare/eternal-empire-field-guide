// ═══════════════════════════════════════════════════════════════
// ARMY SIMULATOR — single-noble screenshot AI analysis
// (upload handlers, prompt, API call, result rendering)
// ═══════════════════════════════════════════════════════════════
// ── NOBLE UPLOAD ──
let uploadedB64=null;
let uploadedMimeType=null;
let uploadedExtraB64=null;
let uploadedExtraMimeType=null;
function handleNobleUpload(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    uploadedB64=ev.target.result.split(',')[1];
    uploadedMimeType=(ev.target.result.match(/^data:([^;]+);/)||[])[1]||file.type||'image/jpeg';
    uploadedExtraB64=null;
    uploadedExtraMimeType=null;
    document.getElementById('noble-extra-preview').style.display='none';
    document.getElementById('preview-img').src=ev.target.result;
    document.getElementById('noble-preview').style.display='block';
    document.getElementById('analyze-btn-wrap').style.display='block';document.getElementById('analyze-btn').style.display='inline-block';
    document.getElementById('upload-area').style.borderColor='var(--ee-yellow)';
    document.getElementById('noble-extra-upload-area').style.display='block';
  };
  reader.readAsDataURL(file);
}
function handleNobleExtraUpload(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    uploadedExtraB64=ev.target.result.split(',')[1];
    uploadedExtraMimeType=(ev.target.result.match(/^data:([^;]+);/)||[])[1]||file.type||'image/jpeg';
    document.getElementById('noble-extra-preview-img').src=ev.target.result;
    document.getElementById('noble-extra-preview').style.display='block';
  };
  reader.readAsDataURL(file);
}

// ── AI ANALYSIS ──
async function analyzeNoble(){
  if(!uploadedB64)return;
  document.getElementById('analyze-btn-wrap').style.display='none';
  document.getElementById('analyzing-msg').classList.add('visible');
  document.getElementById('loader').classList.add('visible');
  const prompt=`You are an expert Kingdom Maker strategist for the Red Empire alliance (leader: Aquila). Analyze this noble screenshot${uploadedExtraB64?'s (TWO images of the SAME noble — image 1 is the main trait view, image 2 is a scrolled-down view showing additional traits cut off in image 1; merge all traits from both images into one combined list, do not treat them as different nobles)':''} using Red Empire's current combat model and role doctrine:
COMBAT TRIANGLE: Heavy Tanks (Cavalry) beat Medium Tanks (Swordsmen), Swordsmen beat Light Tanks (Axemen), Axemen beat Cavalry. Archers counter Axemen and are countered by Cavalry and Catapults. Crossbowmen counter Swordsmen and are countered by Cavalry and Archers. Catapults (T3+) massively counter Cavalry, while Cavalry also counters Catapults — a mutual matchup. Trebuchets target Walls and Catapults specifically — never general troops. There are no Rams in this game.
TROOP TIERS: T2 Swords/Archers K11, T2 Axemen K12, T2 Crossbow/Cavalry K13. T3 Swords/Archers K21, T3 Axemen K22, T3 Crossbow/Cavalry K23. T4 Swords/Archers K31, T4 Axemen K32, T4 Crossbow/Cavalry K33. Catapults are the primary counter to Cavalry especially at T3+. Crossbowmen counter Swordsmen (Medium Tanks) only.
NOBLE ROLES — 3 tiers per combat line: Enforcer line (Swordsmen+Archers): Captain→Marshal→Justicar. Guardian line (Cavalry+Crossbows): Knight→Paladin→Sentinel. Harbinger line (Axemen+Catapults): Subjugator→Conqueror→Vanquisher. Non-combat: Merchant=trade, Explorer=dungeons, Collier=mining, Ranger=exploration T2.
COMBAT TRAITS TO IDENTIFY (read the trait's rarity tier from its border/icon color in the screenshot): Fanatical, Inspiring, Staunch, Cunning, Wise, Martial, Tough, Devoted, Inbred.
TIER COLOR REFERENCE (read the border/glow color around EACH INDIVIDUAL trait icon — this is completely independent of the noble's overall quality badge near their name; a Legendary-quality noble can still have individual Mythical-tier traits, and vice versa, so never use overall noble quality to guess or override a trait's own border color): Normal = plain gray/white border. Impressive = green border. Exceptional = blue border. Legendary = purple/violet border. Mythical = gold/orange ornate border, often with a brighter glow, sparkle, or sunburst effect behind the icon — visually distinct from purple Legendary and from blue Exceptional. Look at each trait icon's border color on its own merits every time; do not let earlier traits on the same noble, or the noble's quality badge, bias your read of a later trait. If a trait's tier color is genuinely illegible (not just because Mythical is rare), use "Normal" as the safest fallback — but a clearly visible gold border must always be reported as "Mythical", never downgraded to Legendary or Exceptional just because Mythical traits are uncommon.
NON-COMBAT TRAITS TO ALSO IDENTIFY (track separately — these affect breeding/utility/economy, never army builds or battle math): Mobility & Map Ops (Lightfooted, Thrillseeking, Perceptive, Discerning, Exacting, Meticulous, Fixated, Greedy, Vigorous, Intrepid, Observant, Worldly). Dynasty & Noble-Action (Fertile, Enticing, Beguiling, Alluring, Sincere, Suave, Hardy, Well Endowed, Chivalrous, Shrewd, Astute, Brilliant, Engrossing, Charismatic, Engaging, Likeable, Persuasive, Silver-tongued). Negative/Phobia traits (Careless, Cowardly, Foolish, Melancholic, Nervous, Pacifistic, Impressionable, Irrational, Naive, Scattered, Squeamish, Dense, Feeble, Glass Jawed, Hemophilic, Repulsive, Sickly, Unsightly, Unreliable, and any Phobic-suffix trait) — always flag these as red_flags regardless of category. NOTE:
TRAIT COMPLETENESS CHECK — DO THIS CAREFULLY: The noble's trait screen has TWO separate tabs/sections — "Inherited" and "Innate" — each labeled with a count in parentheses right in the screenshot itself, e.g. "Inherited (6)" and "Innate (7)". You MUST read these printed numbers directly off the screenshot; do not estimate or guess them. Then count the actual trait icons visible in each section. Report both: the printed label count for each section, and how many you actually identified by name. List EVERY trait icon you can see in BOTH sections combined inside detected_traits/non_combat_traits — do not stop early or skip icons that are harder to identify; if a trait icon is visible but you cannot confidently name it, still include it as {"name":"Unconfirmed Trait","tier":"Normal"} rather than omitting it, so the count stays accurate. IMPORTANT: A noble CAN have multiple copies of the same trait at different tiers (e.g. one Legendary Fanatical AND one Impressive Fanatical AND one Exceptional Fanatical — all three are real, all three stack, and all three must be listed as separate entries in detected_traits). Do NOT collapse or deduplicate traits with the same name — list each one individually with its own tier. If your total identified-trait count is lower than the sum of the two printed labels and only one image was provided, set "traits_possibly_incomplete":true (the grid likely scrolls and a 2nd screenshot is needed). If two images were provided, merge both into one combined list before comparing counts, and only flag true if the combined total still falls short.
Output ONLY valid JSON, no markdown, no backticks:
{"noble_name":"string","role":"Marshal/Captain/Paladin/Knight/Ranger/Siege","inherited_count_label":"number printed on screenshot next to Inherited, or null if not visible","inherited_count_identified":"number of inherited traits you actually listed","innate_count_label":"number printed on screenshot next to Innate, or null if not visible","innate_count_identified":"number of innate traits you actually listed","detected_traits":[{"name":"trait","tier":"Normal/Impressive/Exceptional/Legendary/Mythical"}],"non_combat_traits":[{"name":"trait","tier":"Normal/Impressive/Exceptional/Legendary/Mythical","category":"Mobility/Dynasty/Negative"}],"traits_possibly_incomplete":false,"power":"number or Unknown","pve_build":{"title":"PvE Fort Assault Build","primary_troop":"troop","primary_pct":50,"secondary_troop":"troop","secondary_pct":30,"support_troop":"troop","support_pct":20,"strategy_tip":"one sentence"},"pvp_attack_build":{"title":"PvP Attack Build","primary_troop":"troop","primary_pct":50,"secondary_troop":"troop","secondary_pct":30,"support_troop":"troop","support_pct":20,"strategy_tip":"one sentence"},"pvp_defense_build":{"title":"PvP Defense Build","primary_troop":"troop","primary_pct":40,"secondary_troop":"troop","secondary_pct":35,"support_troop":"troop","support_pct":25,"strategy_tip":"one sentence"},"counter_warning":"what army type counters this noble","re_tip":"one Red Empire specific tactical tip referencing the combat advantage system"}`;
  try{
    const imageBlocks=[{type:'image',source:{type:'base64',media_type:uploadedMimeType||'image/jpeg',data:uploadedB64}}];
    if(uploadedExtraB64) imageBlocks.push({type:'image',source:{type:'base64',media_type:uploadedExtraMimeType||'image/jpeg',data:uploadedExtraB64}});
    const resp=await fetch('https://eternalempire-ai.tr4k2tr4k.workers.dev',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:2500,messages:[{role:'user',content:[...imageBlocks,{type:'text',text:prompt}]}]})});
    if(!resp.ok){
      const errText=await resp.text().catch(()=>'');
      throw new Error(`Worker returned ${resp.status}: ${errText.slice(0,200)}`);
    }
    const data=await resp.json();
    if(data.error){throw new Error('API error: '+(data.error.message||JSON.stringify(data.error)));}
    const raw=data.content.map(b=>b.text||'').join('');
    let cleaned=raw.replace(/```json|```/g,'').trim();
    let result;
    try{
      result=JSON.parse(cleaned);
    }catch(parseErr){
      // Most common cause: response got cut off mid-JSON because it hit the token limit.
      // Try to recover by trimming to the last complete object/array close-bracket.
      const lastBrace=cleaned.lastIndexOf('}');
      if(lastBrace>0){
        try{ result=JSON.parse(cleaned.slice(0,lastBrace+1)); }
        catch(e2){ throw new Error('Could not parse AI response as JSON (likely truncated). Raw length: '+raw.length+' chars. Parse error: '+parseErr.message); }
      } else {
        throw new Error('Could not parse AI response as JSON. Parse error: '+parseErr.message+' — raw response started with: '+raw.slice(0,150));
      }
    }
    lastAnalysis=result;
    renderBuilds(result);
  }catch(err){
    console.error('Noble analysis failed:',err);
    document.getElementById('pve-result').innerHTML=`<p style="color:#ff7070;text-align:center;padding:20px;">Analysis failed — please try a clearer screenshot.<br><span style="font-size:11px;color:rgba(255,255,255,.4);display:block;margin-top:8px;">${(err&&err.message)?err.message.replace(/</g,'&lt;'):'Unknown error'}</span></p>`;
    switchSimTab(document.querySelectorAll('.sim-tab')[1],'pve');
  }finally{
    document.getElementById('loader').classList.remove('visible');
    document.getElementById('analyzing-msg').classList.remove('visible');
  }
}
function buildResultCard(b,counter){
  return`<div style="background:#fff;border-radius:10px;border:2px solid var(--ee-red);overflow:hidden;margin-bottom:10px;">
    <div style="background:var(--ee-red);padding:9px 15px;"><div style="font-family:var(--font-d);font-weight:800;font-size:16px;color:var(--ee-yellow);letter-spacing:.08em;text-transform:uppercase;">${b.title}</div></div>
    <div style="padding:12px 15px;">
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0e0e0;font-family:var(--font-b);font-size:12px;color:#1a0008;font-weight:600;"><span>${b.primary_troop}</span><span style="font-family:var(--font-d);font-weight:800;font-size:17px;color:var(--ee-red);">${b.primary_pct}%</span></div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0e0e0;font-family:var(--font-b);font-size:12px;color:#1a0008;font-weight:600;"><span>${b.secondary_troop}</span><span style="font-family:var(--font-d);font-weight:800;font-size:17px;color:var(--ee-red);">${b.secondary_pct}%</span></div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-family:var(--font-b);font-size:12px;color:#1a0008;font-weight:600;"><span>${b.support_troop}</span><span style="font-family:var(--font-d);font-weight:800;font-size:17px;color:var(--ee-red);">${b.support_pct}%</span></div>
      <div style="margin-top:9px;background:#fff8f8;border-left:3px solid var(--ee-red);padding:7px 9px;font-family:var(--font-b);font-size:11px;color:#4a1020;font-weight:600;border-radius:0 5px 5px 0;">💡 ${b.strategy_tip}</div>
      ${counter?`<div style="margin-top:7px;background:#ffe0e0;border-left:3px solid #ff4444;padding:7px 9px;font-family:var(--font-b);font-size:11px;color:#8b0000;font-weight:600;border-radius:0 5px 5px 0;">⚠ Counter: ${counter}</div>`:''}
    </div></div>`;
}
function renderBuilds(r){
  const roleAnchors={
    'Captain':'pvp-nobles','Marshal':'pvp-nobles','Justicar':'pvp-nobles',
    'Knight':'pvp-nobles','Paladin':'pvp-nobles','Sentinel':'pvp-nobles',
    'Subjugator':'pvp-nobles','Conqueror':'pvp-nobles','Vanquisher':'pvp-nobles'
  };
  const roleLabels={
    'Captain':'Enforcer','Marshal':'Enforcer','Justicar':'Enforcer',
    'Knight':'Guardian','Paladin':'Guardian','Sentinel':'Guardian',
    'Subjugator':'Harbinger','Conqueror':'Harbinger','Vanquisher':'Harbinger'
  };
  const anchor=roleAnchors[r.role]||'pvp-nobles';
  const line=roleLabels[r.role]||r.role;
  const crosslink=`
    <div style="margin-top:12px;padding:10px 14px;background:rgba(255,214,0,.06);border:1px solid rgba(255,214,0,.2);border-radius:8px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
      <div style="font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.55);">This noble is a <strong style="color:var(--ee-yellow);">${line}</strong> — read the full PvP doctrine for this line.</div>
      <button onclick="showView('pvp','${anchor}')" style="background:rgba(217,0,38,.15);border:1px solid rgba(217,0,38,.5);border-radius:6px;padding:6px 12px;cursor:pointer;font-family:var(--font-d);font-weight:700;font-size:12px;color:#ff8080;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;">⚔️ ${line} PvP Guide →</button>
    </div>`;
  document.getElementById('pve-result').innerHTML=buildResultCard(r.pve_build,null)+crosslink;
  document.getElementById('pvpatk-result').innerHTML=buildResultCard(r.pvp_attack_build,r.counter_warning)+crosslink;
  document.getElementById('pvpdef-result').innerHTML=buildResultCard(r.pvp_defense_build,r.counter_warning)+crosslink;

  // ── TRAIT COUNT RECONCILIATION ──
  // Shows what the screenshot's own "Inherited (N)" / "Innate (N)" labels say vs.
  // how many traits were actually identified, so a shortfall is visible at a glance.
  const hasCounts=(r.inherited_count_label!=null)||(r.innate_count_label!=null);
  if(hasCounts){
    const inhLabel=r.inherited_count_label, inhFound=r.inherited_count_identified;
    const innLabel=r.innate_count_label, innFound=r.innate_count_identified;
    const inhShort=inhLabel!=null&&inhFound!=null&&inhFound<inhLabel;
    const innShort=innLabel!=null&&innFound!=null&&innFound<innLabel;
    const rowHtml=(label,found,printed)=>printed==null?'':`<span style="font-family:var(--font-b);font-size:12px;color:${found<printed?'#ff8080':'rgba(255,255,255,.6)'};">${label}: <strong style="color:${found<printed?'#ff8080':'var(--ee-yellow)'};">${found??'?'}/${printed}</strong> identified</span>`;
    document.getElementById('pve-result').innerHTML+=`<div style="margin-top:12px;padding:10px 14px;background:rgba(255,255,255,.03);border:1px solid var(--ee-border);border-radius:8px;display:flex;gap:18px;flex-wrap:wrap;">${rowHtml('Inherited',inhFound,inhLabel)}${rowHtml('Innate',innFound,innLabel)}</div>`;
    if(inhShort||innShort){
      document.getElementById('pve-result').innerHTML+=`<div style="margin-top:8px;padding:12px 14px;background:rgba(217,0,38,.08);border:1px solid rgba(217,0,38,.3);border-radius:8px;font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.7);">⚠️ <strong style="color:var(--ee-red);">Fewer traits identified than the screenshot shows.</strong> ${inhShort?`Inherited is short by ${inhLabel-inhFound}. `:''}${innShort?`Innate is short by ${innLabel-innFound}. `:''}Scroll to the missing section in-game and add a 2nd screenshot, then re-analyze.</div>`;
    }
  } else if(r.traits_possibly_incomplete){
    document.getElementById('pve-result').innerHTML+=`<div style="margin-top:12px;padding:12px 14px;background:rgba(217,0,38,.08);border:1px solid rgba(217,0,38,.3);border-radius:8px;font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.7);">⚠️ <strong style="color:var(--ee-red);">Trait list may be incomplete.</strong> This noble's trait grid looked cropped — if they have more than 6 Innate or 6 Inherited traits, scroll down and re-analyze with a 2nd screenshot of the rest.</div>`;
  }

  const allDisplayTraits=[...(r.detected_traits||[]),...(r.non_combat_traits||[])];
  if(allDisplayTraits.length){
    const block=renderTabbedTraits(allDisplayTraits,{editable:true});
    const totalsBlock=renderTraitTotals(r.detected_traits||[]);
    const noteHtml=`<div style="margin-top:12px;padding:12px 14px;background:rgba(255,255,255,.03);border:1px solid var(--ee-border);border-radius:8px;">
      ${totalsBlock}
      <div style="font-family:var(--font-b);font-size:11px;color:rgba(255,255,255,.4);font-style:italic;margin-bottom:8px;margin-top:${totalsBlock?'12px':'0'};">Traits organized by stat category. Only Battle Damage and Battle Durability traits factor into the army build math above — everything else is reference only.</div>
      ${block}
    </div>`;
    document.getElementById('pve-result').innerHTML+=noteHtml;
  }
  switchSimTab(document.querySelectorAll('.sim-tab')[1],'pve');
  // Update the Army Sim Battle sub-tab text to show the noble's name
  const nameEl=document.getElementById('stab-battle-noble-name');
  if(nameEl && r.noble_name) nameEl.textContent=`${r.noble_name} (${r.role||'Unknown Role'}) — traits loaded and ready.`;
  // If the standalone Battle Sim view is already open, refresh its noble header too
  if(document.getElementById('view-battlesim').classList.contains('active')) initBattleSimStandalone();
}
// ── TROOP TIER EXPLORER ──
const TROOP_DATA={
  swordsmen:{name:'Swordsmen',type:'Medium Tank',icon:'🗡️',counters:'Axemen',counteredBy:'Cavalry',building:'Barracks',tiers:[
    {tier:'T1',name:'Militia',nickname:'Bronze',keep:'K1',color:'#cd7f32',desc:'Starter infantry. Low cost, low power. Use to fill early armies while saving resources.'},
    {tier:'T2',name:'Regular',nickname:'Silver',keep:'K11',color:'#aaaaaa',desc:'Significant power jump. Unlock Academy research at K11. Replace all T1 immediately.'},
    {tier:'T3',name:'Veteran',nickname:'Gold',keep:'K21',color:'#ffd600',desc:'Elite infantry. Strong combat advantage vs Axemen. Core of mid-game Enforcer armies.'},
    {tier:'T4',name:'Royal',nickname:'Diamond',keep:'K31',color:'#88eeff',desc:'Peak power. Devastating combat advantage. End-game backbone for Enforcer line Marshals.'}
  ]},
  archers:{name:'Archers',type:'Arrow DPS',icon:'🏹',counters:'Axemen',counteredBy:'Cavalry + Siege (Catapults)',building:'Archery Range',tiers:[
    {tier:'T1',name:'Militia',nickname:'Bronze',keep:'K4',color:'#cd7f32',desc:'Basic ranged support. Build Archery Range at K4. Good for wall defense early game.'},
    {tier:'T2',name:'Regular',nickname:'Silver',keep:'K11',color:'#aaaaaa',desc:'Unlocks alongside T2 Swordsmen at K11. Solid ranged damage against Axemen.'},
    {tier:'T3',name:'Veteran',nickname:'Gold',keep:'K21',color:'#ffd600',desc:'Strong Arrow DPS. Counter Axemen effectively. Pair with Enforcer noble line.'},
    {tier:'T4',name:'Royal',nickname:'Diamond',keep:'K31',color:'#88eeff',desc:'Maximum ranged power. Shreds Axemen at range. Essential in Enforcer rally builds.'}
  ]},
  cavalry:{name:'Cavalry',type:'Heavy Tank',icon:'🐴',counters:'Swordsmen',counteredBy:'Catapults (T3+)',building:'Stables',tiers:[
    {tier:'T1',name:'Militia',nickname:'Bronze',keep:'K6',color:'#cd7f32',desc:'First mounted unit. Expensive to train but bypasses watchtowers. Use sparingly early.'},
    {tier:'T2',name:'Regular',nickname:'Silver',keep:'K13',color:'#aaaaaa',desc:'Unlock at K13 alongside Crossbowmen. Heavy hitting mobile tank. Counters Swordsmen but watch for Axemen.'},
    {tier:'T3',name:'Veteran',nickname:'Gold',keep:'K23',color:'#ffd600',desc:'Strongest offensive T3 tank. T3+ Catapults counter this hard — watch your matchups.'},
    {tier:'T4',name:'Royal',nickname:'Diamond',keep:'K33',color:'#88eeff',desc:'Dominant heavy tank. Catapults are your primary counter at this tier. Guardian line nobles maximize this.'}
  ]},
  axemen:{name:'Axemen',type:'Light Tank',icon:'🪓',counters:'Cavalry',counteredBy:'Swordsmen + Archers',building:'Barracks',tiers:[
    {tier:'T1',name:'Militia',nickname:'Bronze',keep:'K12',color:'#cd7f32',desc:'Cheapest tank unit. Ideal for mining missions — low food cost keeps expeditions efficient.'},
    {tier:'T2',name:'Regular',nickname:'Silver',keep:'K12',color:'#aaaaaa',desc:'Unlocks same K as T1 via research. Anti-cavalry specialist. Harbinger line essential.'},
    {tier:'T3',name:'Veteran',nickname:'Gold',keep:'K22',color:'#ffd600',desc:'Powerful Cavalry counter. Pair with T3+ Catapults for devastating anti-cavalry combo.'},
    {tier:'T4',name:'Royal',nickname:'Diamond',keep:'K32',color:'#88eeff',desc:'Peak anti-cavalry weapon. Combined with Royal Catapults destroys heavy tank armies.'}
  ]},
  crossbowmen:{name:'Crossbowmen',type:'Bolt DPS · AoE',icon:'🎯',counters:'Swordsmen (Medium Tanks)',counteredBy:'Cavalry + Archers',building:'Archery Range',tiers:[
    {tier:'T1',name:'Militia',nickname:'Bronze',keep:'K4',color:'#cd7f32',desc:'AoE ranged support. Hits multiple targets. Useful against grouped Swordsmen early.'},
    {tier:'T2',name:'Regular',nickname:'Silver',keep:'K13',color:'#aaaaaa',desc:'Unlocks at K13 alongside Cavalry. AoE damage specialist — primary counter to Swordsmen.'},
    {tier:'T3',name:'Veteran',nickname:'Gold',keep:'K22',color:'#ffd600',desc:'Devastating AoE. Wrecks grouped Cavalry. Pair with Paladin/Sentinel nobles.'},
    {tier:'T4',name:'Royal',nickname:'Diamond',keep:'K32',color:'#88eeff',desc:'Maximum AoE bolt damage. Tears through Cavalry and Swordsmen formations. End-game DPS king.'}
  ]},
  catapults:{name:'Catapults',type:'Boulder DPS',icon:'💣',counters:'Cavalry (massively at T3+)',counteredBy:'N/A vs armies',building:'Siege Factory',tiers:[
    {tier:'T1',name:'Militia',nickname:'Bronze',keep:'K12',color:'#cd7f32',desc:'Entry siege DPS. Solid vs Cavalry but counter effect is modest at T1.'},
    {tier:'T2',name:'Regular',nickname:'Silver',keep:'K13',color:'#aaaaaa',desc:'Boulder DPS boost. Anti-cavalry role strengthens. Use with Subjugator/Conqueror nobles.'},
    {tier:'T3',name:'Veteran',nickname:'Gold',keep:'K23',color:'#ffd600',desc:'Massively counters Cavalry at this tier. The combat advantage bonus spikes hard here.'},
    {tier:'T4',name:'Royal',nickname:'Diamond',keep:'K33',color:'#88eeff',desc:'Destroys Cavalry armies. Nuclear option vs heavy tank players. Harbinger line maximizes damage.'}
  ]}
};
function showTroop(key){
  document.querySelectorAll('.troop-sel-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tbtn-'+key).classList.add('active');
  const t=TROOP_DATA[key];
  document.getElementById('troop-tier-display').innerHTML=t.tiers.map((tier,i)=>`
    <div style="background:rgba(255,255,255,.03);border:2px solid ${tier.color};border-radius:10px;padding:12px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <div style="width:28px;height:28px;border-radius:50%;background:${tier.color};display:flex;align-items:center;justify-content:center;font-family:var(--font-d);font-weight:900;font-size:11px;color:#07000f;">${tier.tier}</div>
        <div>
          <div style="font-family:var(--font-d);font-weight:800;font-size:15px;color:${tier.color};text-transform:uppercase;letter-spacing:.04em;">${tier.name} <span style="font-size:11px;opacity:.7;">(${tier.nickname})</span></div>
          <div style="font-family:var(--font-a);font-size:10px;color:rgba(255,255,255,.4);letter-spacing:.1em;text-transform:uppercase;">Unlocks ${tier.keep}</div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,.05);border-radius:4px;height:4px;margin-bottom:8px;overflow:hidden;">
        <div style="height:100%;width:${25*(i+1)}%;background:${tier.color};border-radius:4px;"></div>
      </div>
      <div style="font-family:var(--font-b);font-size:11px;color:rgba(255,255,255,.55);line-height:1.5;">${tier.desc}</div>
    </div>
  `).join('');
}
showTroop('swordsmen');
// ── TOOLTIP ──
function toggleHamburger(){
  const menu=document.getElementById('top-nav-links');
  const btn=document.getElementById('hamburger-btn');
  const open=menu.classList.toggle('open');
  btn.setAttribute('aria-expanded',open);
}
function closeHamburger(){
  document.getElementById('top-nav-links').classList.remove('open');
}
window.addEventListener('scroll',function(){
  const nav=document.querySelector('nav.top-nav');
  if(window.scrollY>40){
    nav.classList.add('top-nav-scrolled');
    closeHamburger();
  } else {
    nav.classList.remove('top-nav-scrolled');
  }
});
function closeTooltip(){document.getElementById('tooltip').classList.remove('visible');}
