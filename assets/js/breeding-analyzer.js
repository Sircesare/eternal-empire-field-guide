// ═══════════════════════════════════════════════════════════════
// NOBLE PAIR ANALYZER — two-noble breeding compatibility AI
// (upload handlers incl. extra-trait screenshots, prompt, API call,
//  result rendering)
// ═══════════════════════════════════════════════════════════════
// ── NOBLE PAIR ANALYZER ──
let pairB64 = {1: null, 2: null};
let pairMimeType = {1: null, 2: null};
let pairExtraB64 = {1: null, 2: null};
let pairExtraMimeType = {1: null, 2: null};
function handlePairUpload(e, num){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    pairB64[num] = ev.target.result.split(',')[1];
    pairMimeType[num] = (ev.target.result.match(/^data:([^;]+);/)||[])[1]||file.type||'image/jpeg';
    pairExtraB64[num] = null;
    pairExtraMimeType[num] = null;
    document.getElementById('pair-extra-preview-'+num).style.display = 'none';
    document.getElementById('pair-img-'+num).src = ev.target.result;
    document.getElementById('pair-preview-'+num).style.display = 'block';
    document.getElementById('pair-upload-'+num).style.borderColor = 'var(--re-yellow)';
    document.getElementById('pair-extra-upload-'+num).style.display = 'block';
    if(pairB64[1] && pairB64[2]){
      document.getElementById('pair-analyze-btn').style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}
function handlePairExtraUpload(e, num){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    pairExtraB64[num] = ev.target.result.split(',')[1];
    pairExtraMimeType[num] = (ev.target.result.match(/^data:([^;]+);/)||[])[1]||file.type||'image/jpeg';
    document.getElementById('pair-extra-img-'+num).src = ev.target.result;
    document.getElementById('pair-extra-preview-'+num).style.display = 'block';
  };
  reader.readAsDataURL(file);
}
const BREEDING_STAT_LABELS = {
  dmg:'Army Damage', health:'Army Health', healSpeed:'Army Healing Speed', speed:'Army Speed',
  deploy:'Army Deploy Cost Eff', assaultDef:'Assault Defense', defeatRecovery:'Defeat Recovery',
  threatenSuccess:'Threaten Success', assaultSuccess:'Assault Success', bribeDefense:'Bribe Defense',
  blackmailDefense:'Blackmail Defense', charmDefense:'Charm Defense', charmSuccess:'Charm Success',
  boinkSuccess:'Boink Success', stealIdentityDefense:'Steal Identity Defense', threatenDefense:'Threaten Defense',
  kissDefense:'Kiss Defense', boinkDefense:'Boink Defense', tradePayout:'Trade Payout', tradingCosts:'Trading Costs', tradingSpeed:'Trading Speed',
  jailbreakSuccess:'Jailbreak Success', stealIdentitySuccess:'Steal Identity Success',
  blackmailSuccess:'Blackmail Success', bribeSuccess:'Bribe Success', kissSuccess:'Kiss Success',
  dungeonTravelSpeed:'Dungeon Travel Speed', dungeonSpeed:'Dungeon Speed', dungeonPayout:'Dungeon Payout',
  miningRate:'Mining Rate', mineDefense:'Mine Defense', loadProtection:'Load Protection',
  exploreRecovery:'Explore Recovery', heistSuccess:'Heist Success',
  loadProtectionMetal:'Load Protection (Metal)', loadProtectionGem:'Load Protection (Gem)',
  loadProtectionMineral:'Load Protection (Mineral)', proposeSuccess:'Propose Success', proposeDefense:'Propose Defense',
  exploreRecoverySmall:'Explore Recovery (Small Dungeon)', exploreRecoveryMed:'Explore Recovery (Medium Dungeon)', exploreRecoveryLarge:'Explore Recovery (Large Dungeon)',
  dungeonPayoutGrass:'Dungeon Payout (Grass)', dungeonPayoutSand:'Dungeon Payout (Sand)', dungeonPayoutSnow:'Dungeon Payout (Snow)',
  dungeonSpeedGrass:'Dungeon Speed (Grass)', dungeonSpeedSand:'Dungeon Speed (Sand)', dungeonSpeedSnow:'Dungeon Speed (Snow)',
  sabotageSuccess:'Sabotage Success', guardCaptureSuccess:'Guard-Capture Success', captureDefense:'Capture Defense',
  roomGuardEffectiveness:'Room Guarding Effectiveness', guardEvictSuccess:'Guard-Evict Success', openGatesSuccess:'Open Gates Success',
  cityDefense:'City Defense', evictSuccess:'Evict Success'
};

function formatFlatTraitStats(flat){
  const parts = [];
  ['combat','social','action','mobility'].forEach(cat=>{
    if(!flat[cat]) return;
    Object.entries(flat[cat]).forEach(([key,val])=>{
      const label = BREEDING_STAT_LABELS[key] || key;
      const pct = Math.round(Math.abs(val)*100);
      const sign = val >= 0 ? '+' : '-';
      parts.push(`${sign}${pct}% ${label}`);
    });
  });
  return parts.join(', ');
}

// NOTE: Careless, Cowardly, and Unreliable have effects not yet modeled in
// TRAIT_DATABASE (mobility/mining stats, and a non-percentage room-effect
// penalty). manualExtras below is the ONLY hand-written data left in this
// function — everything else comes from TRAIT_DATABASE so numbers stay in
// one place. If Careless/Cowardly ever get real mobility values added to
// TRAIT_DATABASE, remove their line here so it isn't duplicated.
function buildNegativeTraitsLine(){
  const manualExtras = {
    Unreliable: 'non-stacking penalty to Room Boosting and Room Helping Effectiveness'
  };
  const names = ['Careless','Cowardly','Foolish','Melancholic','Nervous','Pacifistic','Impressionable',
    'Irrational','Naive','Scattered','Squeamish','Dense','Feeble','Glass Jawed','Hemophilic',
    'Repulsive','Sickly','Unsightly','Unreliable'];
  const pieces = names.map(name=>{
    const entry = TRAIT_DATABASE[name];
    const dbText = (entry && entry.scaling==='flat') ? formatFlatTraitStats(entry.stats.flat) : '';
    const extra = manualExtras[name] || '';
    const combined = [dbText, extra].filter(Boolean).join(', ');
    return `${name} (${combined})`;
  });
  return `NEGATIVE TRAITS (confirmed exact values, flat/single-tier — flag these): ${pieces.join('. ')}.`;
}
function formatTieredTraitStats(statsByTier){
  const tierOrder = ['Normal','Impressive','Exceptional','Legendary','Mythical'];
  const tierStrs = tierOrder.filter(t=>statsByTier[t]).map(tier=>{
    const tierData = statsByTier[tier];
    const parts = [];
    ['combat','social','action','mobility'].forEach(cat=>{
      if(!tierData[cat]) return;
      Object.entries(tierData[cat]).forEach(([key,val])=>{
        const label = BREEDING_STAT_LABELS[key] || key;
        const pct = Math.round(Math.abs(val)*100);
        const sign = val >= 0 ? '+' : '-';
        parts.push(`${sign}${pct}% ${label}`);
      });
    });
    return `${tier} ${parts.join(', ')}`;
  });
  return tierStrs.join(' → ');
}

// Discerning needs its own formatter — penalizesBiome names a fixed target biome
// that formatTieredTraitStats can't express, and the penalty keys drop out at
// Legendary (bonus-only at that tier).
function formatDiscerningStats(entry){
  const tierOrder = ['Normal','Impressive','Exceptional','Legendary'];
  const target = entry.penalizesBiome;
  const tierStrs = tierOrder.filter(t=>entry.stats[t]).map(tier=>{
    const s = entry.stats[tier].mobility;
    const bonus = `+${Math.round(s.dungeonPayout*100)}% Dungeon Payout, +${Math.round(s.dungeonSpeed*100)}% Dungeon Speed`;
    const penalty = (s.dungeonPayoutPenalty!=null)
      ? `, ${Math.round(s.dungeonPayoutPenalty*100)}% Dungeon Payout (${target}), ${Math.round(s.dungeonSpeedPenalty*100)}% Dungeon Speed (${target})`
      : '';
    return `${tier} ${bonus}${penalty}`;
  });
  return tierStrs.join(' → ');
}
function buildMobilityTraitsLine(){
  const discerningNames = ['Discerning (Grass)','Discerning (Sand)','Discerning (Snow)','Discerning (Lava)'];
  const discerningPieces = discerningNames.map(name=>{
    const entry = TRAIT_DATABASE[name];
    const text = (entry && entry.scaling==='tiered') ? formatDiscerningStats(entry) : '';
    return `${name}: ${text}`;
  });
  const names = ['Lightfooted','Thrillseeking','Perceptive','Exacting',
    'Meticulous (Gem)','Meticulous (Metal)','Meticulous (Mineral)',
    'Fixated (Bronze)','Fixated (Iron)','Fixated (Steel)','Fixated (Ruby)','Fixated (Emerald)',
    'Fixated (Sapphire)','Fixated (Salt)','Fixated (Sulfur)','Fixated (Mercury)',
    'Greedy','Vigorous'];
  const pieces = names.map(name=>{
    const entry = TRAIT_DATABASE[name];
    const text = (entry && entry.scaling==='tiered') ? formatTieredTraitStats(entry.stats) : '';
    return `${name}: ${text}`;
  });
  pieces.splice(3, 0, ...discerningPieces);
  return `MOBILITY & MAP OPERATIONS (Travel Speed, Dungeon Speed, Mining Rate, Mine Defense, Load Protection — affect timing, farming, and world-map control, NOT combat strength): ${pieces.join('. ')}.`;
}
function buildSpecialTraitsLine(){
  const inbred = TRAIT_DATABASE['Inbred'];
  const bastard = TRAIT_DATABASE['Bastard'];
  const inbredText = (inbred && inbred.scaling==='flat') ? formatFlatTraitStats(inbred.stats.flat) : '';
  const bastardText = (bastard && bastard.scaling==='flat') ? formatFlatTraitStats(bastard.stats.flat) : '';
  return `SPECIAL: Bastard (${bastardText} — not inherited). Inbred (${inbredText} — inherited, permanent).`;
}
// Chivalrous migrated to TRAIT_DATABASE (confirmed Normal–Legendary, no Mythical yet).
function buildCombatPositiveLine(){
  const manualExtras = {};
  const names = ['Fanatical','Inspiring','Staunch','Cunning','Wise','Martial','Tough','Devoted','Chivalrous'];
  const pieces = names.map(name=>{
    const entry = TRAIT_DATABASE[name];
    const text = (entry && entry.scaling==='tiered') ? formatTieredTraitStats(entry.stats) : '';
    return `${name}: ${text}`;
  });
  Object.entries(manualExtras).forEach(([name,text])=>{
    pieces.push(`${name} (${text})`);
  });
  return `COMBAT (positive): ${pieces.join('. ')}.`;
}
// TRADING traits migrate here one at a time as confirmed numbers come in.
// Unconfirmed names stay out of `names` and get no manualExtras entry —
// they simply won't appear in the prompt line until confirmed (same as
// how COMBAT positive worked before Chivalrous was confirmed).
function buildTradingLine(){
  const manualExtras = {
    Brilliant: 'also non-stacking Room Boost Effectiveness bonus at every tier — exact value unconfirmed'
  };
  const names = ['Shrewd','Astute','Brilliant','Engrossing','Charismatic','Engaging','Likeable','Persuasive','Silver-tongued'];
  const pieces = names.map(name=>{
    const entry = TRAIT_DATABASE[name];
    const text = (entry && entry.scaling==='tiered') ? formatTieredTraitStats(entry.stats) : '';
    const extra = manualExtras[name] || '';
    const combined = [text, extra].filter(Boolean).join('; ');
    return `${name}: ${combined}`;
  });
  return `TRADING (confirmed): ${pieces.join('. ')}.`;
}
function buildInteractionLine(){
  const manualExtras = {
    Fertile: 'also non-stacking Conception Chance bonus at every tier — exact value unconfirmed'
  };
  const names = ['Fertile','Enticing','Beguiling','Alluring','Sincere','Suave','Hardy','Well Endowed'];
  const pieces = names.map(name=>{
    const entry = TRAIT_DATABASE[name];
    const text = (entry && entry.scaling==='tiered') ? formatTieredTraitStats(entry.stats) : '';
    const extra = manualExtras[name] || '';
    const combined = [text, extra].filter(Boolean).join('; ');
    return `${name}: ${combined}`;
  });
  return `INTERACTION (confirmed): ${pieces.join('. ')}.`;
}
function buildExplorationLine(){
  const names = ['Intrepid','Observant','Worldly'];
  const pieces = names.map(name=>{
    const entry = TRAIT_DATABASE[name];
    const text = (entry && entry.scaling==='tiered') ? formatTieredTraitStats(entry.stats) : '';
    return `${name}: ${text}`;
  });
  return `EXPLORATION (confirmed): ${pieces.join('. ')}.`;
}
function buildPersonalityBehaviorLine(){
  const manualExtras = {
    Bright: 'also non-stacking Room Boosting Effectiveness bonus at every tier — exact value unconfirmed'
  };
  const names = ['Affectionate','Aggressive','Bashful','Boorish','Corrupt','Disingenuous','Foul Mouthed','Intimidating','Lawful',
    'Protective','Pugilistic','Shady','Traitorous','Underhanded','Unfriendly','Devious','Bright'];
  const pieces = names.map(name=>{
    const entry = TRAIT_DATABASE[name];
    const text = (entry && entry.scaling==='tiered') ? formatTieredTraitStats(entry.stats) : '';
    const extra = manualExtras[name] || '';
    const combined = [text, extra].filter(Boolean).join('; ');
    return `${name}: ${combined}`;
  });
  return `PERSONALITY & BEHAVIOR (confirmed): ${pieces.join('. ')}.`;
}
function buildPhobiasLine(){
  const manualExtras = {
    Koinoniphobic: 'also non-stacking penalty to Room Boosting/Room Helping Effectiveness — exact value unconfirmed'
  };
  const names = ['Acrophobic','Agoraphobic','Algophobic','Gamophobic','Genophobic','Koinoniphobic','Nyctophobic','Sociophobic','Claustrophobic'];
  const pieces = names.map(name=>{
    const entry = TRAIT_DATABASE[name];
    const dbText = (entry && entry.scaling==='flat') ? formatFlatTraitStats(entry.stats.flat) : '';
    const extra = manualExtras[name] || '';
    const combined = [dbText, extra].filter(Boolean).join('; ');
    return `${name} (${combined})`;
  });
  return `PHOBIAS (confirmed -90% SEVERE penalties — always flag as red flags): ${pieces.join('. ')}.`;
}
async function analyzePair(){
  if(!pairB64[1] || !pairB64[2]) return;
  document.getElementById('pair-analyze-btn').style.display = 'none';
  document.getElementById('pair-analyzing').style.display = 'block';
  document.getElementById('pair-result').style.display = 'none';

  const n1Extra = !!pairExtraB64[1];
  const n2Extra = !!pairExtraB64[2];
  const prompt = `You are an expert Kingdom Maker noble breeding analyst. Analyze these noble screenshots and evaluate them as a breeding pair.

IMAGE LAYOUT: ${n1Extra||n2Extra ? `Some nobles have 2 images each — a main trait view plus a scrolled-down view showing additional traits cut off in the main shot. Merge each noble's own images into one combined trait list; do not treat a noble's 2nd image as a 3rd noble. Image order: Noble 1 main${n1Extra?', Noble 1 extra':''}, Noble 2 main${n2Extra?', Noble 2 extra':''}.` : 'One image per noble: Noble 1, then Noble 2.'}

NOBLE ROLES (all lines):
Combat — Enforcer: Captain→Marshal→Justicar (Swordsmen+Archers). Guardian: Knight→Paladin→Sentinel (Cavalry+Crossbowmen). Harbinger: Subjugator→Conqueror→Vanquisher (Axemen+Catapults).
Non-Combat — Barter: Merchant→Agent (caps T2). Delve: Explorer→Ranger (caps T2). Automation: Collier→Prospector (caps T2).

QUALITY TIERS (low→high): Runt, Normal, Impressive, Exceptional, Legendary, Mythical.

TRAIT CATEGORIES & KEY TRAITS:
${buildCombatPositiveLine()}
COMBAT (negative/special): Inbred (-10% Charm, -10% Defeat Recovery, +10% Army Deploy Cost, +10% Army Damage — permanent, inheritable), Pacifistic (-Army Damage, -Army Health, -Assault Success — severe combat penalty).
${buildTradingLine()}
MOBILITY & MAP OPERATIONS (Travel Speed, Dungeon Speed, Mining Rate, Mine Defense, Load Protection — affect timing, farming, and world-map control, NOT combat strength):
${buildMobilityTraitsLine()}
${buildExplorationLine()}
MINING (other): Exacting/Meticulous/Fixated values above are confirmed; treat any other mining trait names as unconfirmed.
NOBLE ACTION & DYNASTY STATS (Charm, Threaten, Assault, Bribe, Blackmail success/defense, Kiss/Boink/Propose success, Jailbreak, Heist, Trade Payout, Trade Cost Efficiency, Room Guarding/Boosting/Helping, reroll value — track these for breeding/utility value, they do NOT affect combat or army strength):
${buildInteractionLine()}
${buildPersonalityBehaviorLine()}
${buildNegativeTraitsLine()}
${buildPhobiasLine()}
${buildSpecialTraitsLine()}

SCORING RULES:
- Same combat line pairs receive a bonus when the player's goal is a specialized combat role (trait inheritance stays relevant)
- Mythical quality nobles score significantly higher than Legendary
- Negative traits (especially phobias and Inbred) heavily penalize the score
- Complementary non-combat pairs (Merchant+Explorer, Collier+Agent) score well
- Combat × Non-Combat cross pairs are not automatically penalized — score them on their combined traits, quality, and intended child role; a deliberate cross-line project can score equally high when those factors are strong
- Fertile, Enticing, or Royal Sovereign traits on either noble boost conception score
- Mobility & Map Operations traits (Travel Speed, Dungeon Speed, Mining Rate, Mine Defense, Load Protection) and other economy traits do NOT affect compatibility_score — they're informational only and belong in mobility_economy_notes, not the breeding score itself
- Noble Action & Dynasty stats (Charm/Threaten/Assault/Bribe/Blackmail success+defense, Kiss/Boink/Propose, Jailbreak, Heist, Trade Payout/Cost Eff, Room Guarding/Boosting/Helping) do NOT affect compatibility_score either — track these in dynasty_action_traits, separate from combat. Phobias and negative traits found here still belong in red_flags since they harm overall noble utility.

CRITICAL RULES:
- Read the trait icons and names visible in the screenshots carefully. Match what you see to the trait lists above.
- If a trait icon is visible but the name is partially obscured, make your best match to the closest trait in the lists above based on what you can see.
- Only write "Unconfirmed Trait" if a trait is completely unreadable and bears no resemblance to any trait in the lists above.
- Never invent trait names that do not appear in the lists above.
- If a noble's quality tier is not clearly visible write "Unknown Quality".
- If a noble's role is not clearly visible write "Unknown Role".
- TRAIT TIER COLOR REFERENCE: read the border/glow color around EACH INDIVIDUAL trait icon to determine its tier — this is completely independent of the noble's overall quality badge (a Legendary-quality noble can still have individual Mythical-tier traits, and vice versa, so never use overall noble quality to guess a trait's tier). Normal = plain gray/white border. Impressive = green border. Exceptional = blue border. Legendary = purple/violet border. Mythical = gold/orange ornate border, often with a brighter glow or sparkle effect — visually distinct from purple Legendary and blue Exceptional. Evaluate each trait icon's border color on its own merits; a clearly visible gold border must be reported as Mythical, never downgraded just because Mythical is uncommon.
- TRAIT COMPLETENESS: Each noble's Innate and Inherited trait grids can hold more than 6 traits, but the game UI shows only 6 icons per grid without scrolling, so a single screenshot may be cropped mid-grid. If a noble has only 1 image and its trait grid looks cropped (a row ending exactly at 6 with no clear end-of-list styling), set that noble's traits_possibly_incomplete to true in the output. If a noble has 2 images, merge both into its trait list and only flag true if even the 2nd image still looks cropped.

Output ONLY valid JSON, no markdown, no backticks:
{"noble_1":{"name":"string","role":"string","quality":"string","key_traits":["trait"],"traits_possibly_incomplete":false},"noble_2":{"name":"string","role":"string","quality":"string","key_traits":["trait"],"traits_possibly_incomplete":false},"compatibility_score":7,"verdict":"Strong Pair","pair_type":"Same-Line Combat","trait_inheritance":["trait likely to pass"],"recommended_child_role":"string","red_flags":["any negative traits or mismatches"],"breeding_notes":"2-3 sentence strategic summary of this pairing","score_breakdown":{"quality_score":8,"trait_synergy":7,"line_match":9,"negative_penalty":0},"mobility_economy_traits":["any Mobility & Map Operations or Mining traits detected on either noble, with tier"],"mobility_economy_notes":"1-2 sentence note on what these traits mean for farming/travel/mining — leave empty string if none detected. This is informational only and must NOT affect compatibility_score.","dynasty_action_traits":["any Noble Action & Dynasty stat traits detected — Charm/Threaten/Assault/Bribe/Blackmail/Kiss/Boink/Propose/Jailbreak/Heist/Trade/Room traits, with tier"],"dynasty_action_notes":"1-2 sentence note on breeding/utility value of these traits — leave empty string if none detected. This is informational only and must NOT affect compatibility_score."}`;

  try {
    const imageBlocks=[{type:'image', source:{type:'base64', media_type:pairMimeType[1]||'image/jpeg', data:pairB64[1]}}];
    if(pairExtraB64[1]) imageBlocks.push({type:'image', source:{type:'base64', media_type:pairExtraMimeType[1]||'image/jpeg', data:pairExtraB64[1]}});
    imageBlocks.push({type:'image', source:{type:'base64', media_type:pairMimeType[2]||'image/jpeg', data:pairB64[2]}});
    if(pairExtraB64[2]) imageBlocks.push({type:'image', source:{type:'base64', media_type:pairExtraMimeType[2]||'image/jpeg', data:pairExtraB64[2]}});
    const resp = await fetch('https://redempire-ai.tr4k2tr4k.workers.dev', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4200,
        messages: [{
          role: 'user',
          content: [
            ...imageBlocks,
            {type:'text', text:prompt}
          ]
        }]
      })
    });
    if(!resp.ok){
      const errText=await resp.text().catch(()=>'');
      throw new Error(`Worker returned ${resp.status}: ${errText.slice(0,200)}`);
    }
    const data = await resp.json();
    if(data.error){throw new Error('API error: '+(data.error.message||JSON.stringify(data.error)));}
    const raw = data.content.map(b => b.text||'').join('');
    let cleaned=raw.replace(/```json|```/g,'').trim();
    let r;
    try{
      r=JSON.parse(cleaned);
    }catch(parseErr){
      const lastBrace=cleaned.lastIndexOf('}');
      if(lastBrace>0){
        try{ r=JSON.parse(cleaned.slice(0,lastBrace+1)); }
        catch(e2){ throw new Error('Could not parse AI response as JSON (likely truncated). Raw length: '+raw.length+' chars.'); }
      } else {
        throw new Error('Could not parse AI response as JSON: '+parseErr.message);
      }
    }
    renderPairResult(r);
  } catch(err){
    console.error('Pair analysis failed:',err);
    document.getElementById('pair-result').style.display = 'block';
    document.getElementById('pair-result').innerHTML = `<p style="color:#ff7070;text-align:center;padding:20px;">Analysis failed — please try clearer screenshots.<br><span style="font-size:11px;color:rgba(255,255,255,.4);display:block;margin-top:8px;">${(err&&err.message)?err.message.replace(/</g,'&lt;'):'Unknown error'}</span></p>`;
  } finally {
    document.getElementById('pair-analyzing').style.display = 'none';
    document.getElementById('pair-analyze-btn').style.display = 'block';
  }
}

function renderPairResult(r){
  const verdictColor = r.compatibility_score >= 8 ? '#5dba70' : r.compatibility_score >= 6 ? 'var(--re-yellow)' : '#ff7070';
  const verdictBg = r.compatibility_score >= 8 ? 'rgba(61,122,74,.15)' : r.compatibility_score >= 6 ? 'rgba(255,214,0,.08)' : 'rgba(217,0,38,.12)';
  const verdictBorder = r.compatibility_score >= 8 ? 'rgba(61,122,74,.4)' : r.compatibility_score >= 6 ? 'rgba(255,214,0,.3)' : 'rgba(217,0,38,.4)';

  const scoreBar = (val, max=10) => `
    <div style="background:rgba(255,255,255,.07);border-radius:4px;height:6px;overflow:hidden;margin-top:4px;">
      <div style="height:100%;width:${(val/max)*100}%;background:var(--re-yellow);border-radius:4px;"></div>
    </div>`;

  document.getElementById('pair-result').style.display = 'block';
  document.getElementById('pair-result').innerHTML = `
    <div style="background:${verdictBg};border:2px solid ${verdictBorder};border-radius:12px;padding:20px;margin-bottom:12px;text-align:center;">
      <div style="font-family:var(--font-a);font-size:11px;font-weight:700;letter-spacing:.3em;color:rgba(255,255,255,.4);text-transform:uppercase;margin-bottom:6px;">${r.pair_type}</div>
      <div style="font-family:var(--font-d);font-weight:900;font-size:64px;color:${verdictColor};line-height:1;">${r.compatibility_score}<span style="font-size:28px;opacity:.5;">/10</span></div>
      <div style="font-family:var(--font-d);font-weight:800;font-size:22px;color:${verdictColor};text-transform:uppercase;letter-spacing:.06em;margin-top:4px;">${r.verdict}</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:10px;padding:14px;">
        <div style="font-family:var(--font-d);font-weight:800;font-size:14px;color:var(--re-yellow);text-transform:uppercase;margin-bottom:6px;">${r.noble_1.name}</div>
        <div style="font-family:var(--font-a);font-size:11px;color:rgba(255,255,255,.45);letter-spacing:.1em;text-transform:uppercase;">${r.noble_1.role} · ${r.noble_1.quality}</div>
        <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">${r.noble_1.key_traits.map(t=>`<span style="background:rgba(255,255,255,.06);border:1px solid var(--re-border);border-radius:4px;padding:2px 7px;font-family:var(--font-a);font-size:10px;color:rgba(255,255,255,.55);letter-spacing:.06em;">${t}</span>`).join('')}</div>
        ${r.noble_1.traits_possibly_incomplete?`<div style="margin-top:8px;font-family:var(--font-b);font-size:11px;color:#ff8080;">⚠️ Trait grid looked cropped — add a 2nd scrolled screenshot of this noble and re-analyze.</div>`:''}
      </div>
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:10px;padding:14px;">
        <div style="font-family:var(--font-d);font-weight:800;font-size:14px;color:var(--re-yellow);text-transform:uppercase;margin-bottom:6px;">${r.noble_2.name}</div>
        <div style="font-family:var(--font-a);font-size:11px;color:rgba(255,255,255,.45);letter-spacing:.1em;text-transform:uppercase;">${r.noble_2.role} · ${r.noble_2.quality}</div>
        <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">${r.noble_2.key_traits.map(t=>`<span style="background:rgba(255,255,255,.06);border:1px solid var(--re-border);border-radius:4px;padding:2px 7px;font-family:var(--font-a);font-size:10px;color:rgba(255,255,255,.55);letter-spacing:.06em;">${t}</span>`).join('')}</div>
        ${r.noble_2.traits_possibly_incomplete?`<div style="margin-top:8px;font-family:var(--font-b);font-size:11px;color:#ff8080;">⚠️ Trait grid looked cropped — add a 2nd scrolled screenshot of this noble and re-analyze.</div>`:''}
      </div>
    </div>

    <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:10px;padding:14px;margin-bottom:12px;">
      <div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--re-yellow);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;">Score Breakdown</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div><div style="display:flex;justify-content:space-between;font-family:var(--font-a);font-size:11px;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;"><span>Quality Match</span><span style="color:var(--re-yellow);">${r.score_breakdown.quality_score}/10</span></div>${scoreBar(r.score_breakdown.quality_score)}</div>
        <div><div style="display:flex;justify-content:space-between;font-family:var(--font-a);font-size:11px;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;"><span>Trait Synergy</span><span style="color:var(--re-yellow);">${r.score_breakdown.trait_synergy}/10</span></div>${scoreBar(r.score_breakdown.trait_synergy)}</div>
        <div><div style="display:flex;justify-content:space-between;font-family:var(--font-a);font-size:11px;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;"><span>Role Line Match</span><span style="color:var(--re-yellow);">${r.score_breakdown.line_match}/10</span></div>${scoreBar(r.score_breakdown.line_match)}</div>
        ${r.score_breakdown.negative_penalty > 0 ? `<div><div style="display:flex;justify-content:space-between;font-family:var(--font-a);font-size:11px;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase;"><span>Negative Penalty</span><span style="color:#ff7070;">-${r.score_breakdown.negative_penalty}</span></div><div style="background:rgba(255,255,255,.07);border-radius:4px;height:6px;overflow:hidden;margin-top:4px;"><div style="height:100%;width:${(r.score_breakdown.negative_penalty/10)*100}%;background:#ff7070;border-radius:4px;"></div></div></div>` : ''}
      </div>
    </div>

    ${r.red_flags && r.red_flags.length ? `
    <div style="background:rgba(217,0,38,.08);border:1px solid rgba(217,0,38,.3);border-radius:10px;padding:14px;margin-bottom:12px;">
      <div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--re-red);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">⚠️ Red Flags</div>
      ${r.red_flags.map(f=>`<div style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.65);padding:3px 0;">• ${f}</div>`).join('')}
    </div>` : ''}

    ${r.trait_inheritance && r.trait_inheritance.length ? `
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:10px;padding:14px;margin-bottom:12px;">
      <div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--re-yellow);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">🧬 Likely Inherited Traits</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">${r.trait_inheritance.map(t=>`<span style="background:rgba(255,214,0,.1);border:1px solid rgba(255,214,0,.3);border-radius:6px;padding:4px 10px;font-family:var(--font-d);font-size:12px;color:var(--re-yellow);font-weight:700;">${t}</span>`).join('')}</div>
    </div>` : ''}

    ${(r.mobility_economy_traits&&r.mobility_economy_traits.length)||(r.dynasty_action_traits&&r.dynasty_action_traits.length) ? `
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:10px;padding:14px;margin-bottom:12px;">
      <div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--re-yellow);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">📊 Full Trait Breakdown — Not Counted in Score Above</div>
      <div style="font-family:var(--font-b);font-size:11px;color:rgba(255,255,255,.4);font-style:italic;margin-bottom:8px;">Organized by stat category for reference. Only quality, trait synergy, and line match (above) feed the compatibility score.</div>
      ${renderTabbedTraits([...(r.mobility_economy_traits||[]),...(r.dynasty_action_traits||[])].map(t=>({name:t})))}
      ${r.mobility_economy_notes?`<div style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.6);line-height:1.6;margin-top:6px;">${r.mobility_economy_notes}</div>`:''}
      ${r.dynasty_action_notes?`<div style="font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.6);line-height:1.6;margin-top:6px;">${r.dynasty_action_notes}</div>`:''}
    </div>` : ''}

    <div style="background:rgba(255,255,255,.03);border:1px solid var(--re-border);border-radius:10px;padding:14px;">
      <div style="font-family:var(--font-d);font-weight:800;font-size:13px;color:var(--re-yellow);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">📋 Recommended Child Role · ${r.recommended_child_role}</div>
      <div style="font-family:var(--font-b);font-size:14px;color:rgba(255,255,255,.7);line-height:1.7;">${r.breeding_notes}</div>
    </div>
  `;
}
