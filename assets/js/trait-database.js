// ═══════════════════════════════════════════════════════════
// TRAIT DATABASE — single source of truth for all confirmed
// trait stat values, organized by SECTION rather than one flat
// object. Current sections: combat, social. Future sections
// (economy, mining) can be added the same way without touching
// existing entries.
//
// Consumed by:
//   - battle-simulator.js  → reads ONLY the .combat section for
//     Battle Sim math (computeBattleResult, renderTraitTotals, etc.)
//   - breeding-analyzer.js → reads .social (and future non-combat
//     sections) to generate its AI prompt text dynamically instead
//     of hardcoded prose, so numbers only live in one place.
//
// TRAIT_TAB_MAP (which UI tabs a trait's card shows under) stays
// in battle-simulator.js — that's rendering/display logic, not
// trait data, and doesn't belong in this file.
//
// scaling: 'tiered'  → stats keyed by Normal/Impressive/Exceptional/Legendary/Mythical
// scaling: 'flat'    → stats keyed by a single 'flat' object, no tier scaling
// scaling: null      → no confirmed numeric values yet; stats:null is a placeholder,
//                       NEVER fill this with invented numbers — leave null until a
//                       real in-game screenshot confirms exact values.
// ═══════════════════════════════════════════════════════════
const TRAIT_DATABASE = {

  // ═══ CONFIRMED TIERED COMBAT TRAITS ═══
  Fanatical:{scaling:'tiered',stats:{
    Normal:{combat:{dmg:.05,health:-.20}},
    Impressive:{combat:{dmg:.10,health:-.10}},
    Exceptional:{combat:{dmg:.10,health:-.05}},
    Legendary:{combat:{dmg:.20,health:-.05}},
    Mythical:{combat:{dmg:.22}}
  }},
  Inspiring:{scaling:'tiered',stats:{
    Normal:{combat:{dmg:.05,health:0}},
    Impressive:{combat:{dmg:.05,health:.05}},
    Exceptional:{combat:{dmg:.10,health:.05,healSpeed:.05}},
    Legendary:{combat:{dmg:.10,health:.10,healSpeed:.10,speed:.10}},
    Mythical:{combat:{dmg:.11,health:.11,healSpeed:.10,speed:.10}}
  }},
  Staunch:{scaling:'tiered',stats:{
    Normal:{combat:{dmg:.05,health:0}},
    Impressive:{combat:{dmg:.10,health:0}},
    Exceptional:{combat:{dmg:.10,health:0,healSpeed:.05}},
    Legendary:{combat:{dmg:.20,health:0,healSpeed:.10}},
    Mythical:{combat:{dmg:.21,health:0,healSpeed:.11}}
  }},
  Cunning:{scaling:'tiered',stats:{
    Normal:{combat:{dmg:0,health:0,deploy:.05}},
    Impressive:{combat:{dmg:0,health:.05,deploy:.05}},
    Exceptional:{combat:{dmg:.05,health:.10,deploy:.10}},
    Legendary:{combat:{dmg:.10,health:.10,deploy:.10,healSpeed:.05}},
    Mythical:{combat:{dmg:.11,health:.11,deploy:.11,healSpeed:.06}}
  }},
  Wise:{scaling:'tiered',stats:{
    Normal:{combat:{dmg:0,health:0,deploy:.05}},
    Impressive:{combat:{dmg:0,health:.05,deploy:.10}},
    Exceptional:{combat:{dmg:.05,health:.10,deploy:.10}},
    Legendary:{combat:{dmg:.10,health:.10,deploy:.20,speed:.05}},
    Mythical:{combat:{dmg:.10,health:.12,deploy:.20,speed:.05}}
  }},
  Martial:{scaling:'tiered',stats:{
    Normal:{combat:{infantry:.05,ranged:0,mounted:0,machine:0}},
    Impressive:{combat:{infantry:.10,ranged:.05,mounted:0,machine:0}},
    Exceptional:{combat:{infantry:.10,ranged:.10,mounted:.05,machine:0}},
    Legendary:{combat:{infantry:.20,ranged:.10,mounted:.10,machine:.05}},
    Mythical:{combat:{infantry:.16,ranged:.16,mounted:.16,machine:.16,healSpeed:.11}}
  }},
  Tough:{scaling:'tiered',stats:{
    Normal:{combat:{health:.05,assaultDef:.05}},
    Impressive:{combat:{health:.05,assaultDef:.10}},
    Exceptional:{combat:{health:.10,assaultDef:.10}},
    Legendary:{combat:{health:.20,assaultDef:.20}},
    Mythical:{combat:{health:.22,assaultDef:.21}}
  }},
  // ═══ CONFIRMED FLAT NEGATIVE TRAITS (no tier scaling) ═══
  Pacifistic:{scaling:'flat',stats:{flat:{combat:{dmg:-.10,health:-.10},action:{threatenSuccess:-.05,assaultSuccess:-.10}}}},
  Scattered:{scaling:'flat',stats:{flat:{combat:{dmg:-.05,health:-.05},action:{bribeDefense:-.05}}}},
  Squeamish:{scaling:'flat',stats:{flat:{combat:{assaultDef:-.05,defeatRecovery:-.05,healSpeed:-.05}}}},
  'Glass Jawed':{scaling:'flat',stats:{flat:{combat:{health:-.05,assaultDef:-.05,defeatRecovery:-.05}}}},
  Hemophilic:{scaling:'flat',stats:{flat:{combat:{assaultDef:-.05,defeatRecovery:-.05}}}},
  Feeble:{scaling:'flat',stats:{flat:{combat:{speed:-.05},action:{threatenSuccess:-.10,assaultSuccess:-.05}}}},
  Nervous:{scaling:'flat',stats:{flat:{combat:{deploy:-.10},action:{threatenSuccess:-.05},mobility:{dungeonTravelSpeed:-.05,dungeonSpeed:-.05}}}}, // Corrected: was miscategorized as combat.speed before mobility keys existed in this DB
  Foolish:{scaling:'flat',stats:{flat:{combat:{deploy:-.10},action:{bribeDefense:-.10,blackmailDefense:-.05}}}},
  Sickly:{scaling:'flat',stats:{flat:{combat:{defeatRecovery:-.05,healSpeed:-.05}}}},
  Careless:{scaling:'flat',stats:{flat:{mobility:{dungeonSpeed:-.05,miningRate:-.05,loadProtection:-.05,dungeonTravelSpeed:-.05}}}},
  Cowardly:{scaling:'flat',stats:{flat:{action:{threatenSuccess:-.05,assaultSuccess:-.05},mobility:{dungeonSpeed:-.05}}}},
  Melancholic:{scaling:'flat',stats:{flat:{social:{charmDefense:.05,charmSuccess:-.05,boinkSuccess:-.05}}}},
  Impressionable:{scaling:'flat',stats:{flat:{action:{stealIdentityDefense:-.05,bribeDefense:-.05}}}},
  Irrational:{scaling:'flat',stats:{flat:{social:{charmSuccess:-.05},action:{threatenDefense:-.05},combat:{deploy:-.05}}}},
  Naive:{scaling:'flat',stats:{flat:{social:{charmDefense:-.05,kissDefense:-.05,boinkDefense:-.05},action:{bribeDefense:-.05}}}},
  Dense:{scaling:'flat',stats:{flat:{action:{tradePayout:-.05,blackmailSuccess:-.05,bribeSuccess:-.05}}}},
  Repulsive:{scaling:'flat',stats:{flat:{social:{charmSuccess:-.10,kissSuccess:-.05}}}},
  Unsightly:{scaling:'flat',stats:{flat:{social:{charmSuccess:-.05,kissSuccess:-.05,boinkSuccess:-.05}}}},

   // ═══ CONFIRMED SPECIAL/INHERITED TRAIT ═══
  // deploy uses the same sign convention as every other trait above: positive = cheaper/more
  // efficient deployment. Breeding-analyzer's "+10% Army Deploy Cost" means cost goes UP
  // (worse efficiency), so it maps to deploy:-.10 to stay consistent, not deploy:+.10.
  Inbred:{scaling:'flat',stats:{flat:{
    combat:{dmg:.10,defeatRecovery:-.10,deploy:-.10},
    social:{charm:-.10}
  }}},
  Bastard:{scaling:'flat',stats:{flat:{
    combat:{speed:-.20,dmg:-.20},
    action:{tradePayout:.20},
    mobility:{dungeonPayout:.20}
  }}}, // NOT inherited (unlike Inbred) — flag this distinction in UI/tooltip copy

  // ═══ PLACEHOLDERS — trait known/named, NO confirmed numeric values yet ═══
  // Do not fill these with invented numbers. Only replace scaling:null / stats:null
  // once a real in-game screenshot confirms exact tier values.
  Chivalrous:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05,kissSuccess:.05}},
    Impressive:{social:{charmSuccess:.05,kissSuccess:.05,boinkSuccess:.05}},
    Exceptional:{social:{charmSuccess:.10,kissSuccess:.10,boinkSuccess:.10},combat:{healSpeed:.05}},
    Legendary:{social:{charmSuccess:.10,kissSuccess:.10,boinkSuccess:.10},combat:{healSpeed:.10}}
  }}, // No Mythical tier confirmed yet
  Devoted:{scaling:'tiered',stats:{
    Normal:{social:{proposeSuccess:.05}},
    Impressive:{social:{proposeSuccess:.05,charmSuccess:.05}},
    Exceptional:{social:{proposeSuccess:.10,charmSuccess:.05},combat:{deploy:.05}},
    Legendary:{social:{proposeSuccess:.20,charmSuccess:.10},combat:{deploy:.05,health:.05}}
  }}, // No Mythical tier confirmed yet
  Shrewd:{scaling:'tiered',stats:{
    Normal:{action:{tradingCosts:.05,tradePayout:.05}},
    Impressive:{action:{tradingCosts:.10,tradePayout:.05}},
    Exceptional:{action:{tradingCosts:.10,tradePayout:.10}},
    Legendary:{action:{tradingCosts:.20,tradePayout:.20}}
  }}, // No Mythical tier confirmed yet
  Astute:{scaling:'tiered',stats:{
    Normal:{action:{tradePayout:.05},mobility:{dungeonPayout:.05}},
    Impressive:{action:{tradePayout:.10},mobility:{dungeonPayout:.05}},
    Exceptional:{action:{tradePayout:.10,tradingSpeed:.05},mobility:{dungeonPayout:.10,dungeonSpeed:.05}},
    Legendary:{action:{tradePayout:.10,tradingSpeed:.10},mobility:{dungeonPayout:.10,dungeonSpeed:.10}}
  }}, // No Mythical tier confirmed yet
  Brilliant:{scaling:'tiered',stats:{
    Normal:{mobility:{heistSuccess:.05},action:{jailbreakSuccess:.05,tradingCosts:.05}},
    Impressive:{mobility:{heistSuccess:.10},action:{jailbreakSuccess:.10,tradingCosts:.05,tradePayout:.05}},
    Exceptional:{mobility:{heistSuccess:.20},action:{jailbreakSuccess:.10,tradingCosts:.10,tradePayout:.10}},
    Legendary:{mobility:{heistSuccess:.20},action:{jailbreakSuccess:.20,tradingCosts:.20,tradePayout:.20}}
  }}, // Also carries a non-stacking Room Boost Effectiveness bonus at every tier — no confirmed exact value, see manualExtras in buildTradingLine()
  Engrossing:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05},action:{tradingCosts:.05}},
    Impressive:{social:{charmSuccess:.10},action:{tradingCosts:.05}},
    Exceptional:{social:{charmSuccess:.20},action:{tradingCosts:.10,stealIdentitySuccess:.05}},
    Legendary:{social:{charmSuccess:.20},action:{tradingCosts:.10,stealIdentitySuccess:.10}}
  }}, // No Mythical tier confirmed yet
  Charismatic:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05}},
    Impressive:{social:{charmSuccess:.05},action:{tradingCosts:.05}},
    Exceptional:{social:{charmSuccess:.10},action:{tradingCosts:.05}},
    Legendary:{social:{charmSuccess:.10},action:{tradingCosts:.10}}
  }}, // No Mythical tier confirmed yet
  Engaging:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05}},
    Impressive:{social:{charmSuccess:.10}},
    Exceptional:{social:{charmSuccess:.10},action:{tradingCosts:.05}},
    Legendary:{social:{charmSuccess:.10},action:{tradingCosts:.10}}
  }}, // No Mythical tier confirmed yet
  Likeable:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05}},
    Impressive:{social:{charmSuccess:.05},action:{tradingCosts:.05}},
    Exceptional:{social:{charmSuccess:.10},action:{tradingCosts:.05,tradePayout:.05}},
    Legendary:{social:{charmSuccess:.20},action:{tradingCosts:.10,tradePayout:.10,boinkSuccess:.20}}
  }}, // No Mythical tier confirmed yet
  Persuasive:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.10}},
    Impressive:{social:{charmSuccess:.10},action:{tradingCosts:.05}},
    Exceptional:{social:{charmSuccess:.20},action:{tradingCosts:.10,tradePayout:.05}},
    Legendary:{social:{charmSuccess:.20},action:{tradingCosts:.20,tradePayout:.10,bribeSuccess:.10}}
  }}, // No Mythical tier confirmed yet
  'Silver-tongued':{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.10},action:{tradingSpeed:.05}},
    Impressive:{social:{charmSuccess:.10},action:{tradingSpeed:.10}},
    Exceptional:{social:{charmSuccess:.20},action:{tradingSpeed:.10}},
    Legendary:{social:{charmSuccess:.20},action:{tradingSpeed:.20}}
  }}, // No Mythical tier confirmed yet
  Fertile:{scaling:'tiered',stats:{
    Normal:{social:{boinkSuccess:.05}},
    Impressive:{social:{boinkSuccess:.10}},
    Exceptional:{social:{boinkSuccess:.10,charmSuccess:.05}},
    Legendary:{social:{boinkSuccess:.20,charmSuccess:.10}}
  }}, // Also carries a non-stacking Conception Chance bonus at every tier — no confirmed exact value, see manualExtras in buildInteractionLine()
  Enticing:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05,kissSuccess:.05,boinkSuccess:.05}},
    Impressive:{social:{charmSuccess:.10,kissSuccess:.10,boinkSuccess:.05}},
    Exceptional:{social:{charmSuccess:.20,kissSuccess:.10,boinkSuccess:.10,proposeSuccess:.05}},
    Legendary:{social:{charmSuccess:.20,kissSuccess:.20,boinkSuccess:.10,proposeSuccess:.10}}
  }}, // No Mythical tier confirmed yet
  Beguiling:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05,kissSuccess:.05}},
    Impressive:{social:{charmSuccess:.10,kissSuccess:.10}},
    Exceptional:{social:{charmSuccess:.10,kissSuccess:.10,boinkSuccess:.05}},
    Legendary:{social:{charmSuccess:.10,kissSuccess:.10,boinkSuccess:.10}}
  }}, // No Mythical tier confirmed yet
  Alluring:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05}},
    Impressive:{social:{charmSuccess:.10}},
    Exceptional:{social:{charmSuccess:.10,kissSuccess:.05}},
    Legendary:{social:{charmSuccess:.10,kissSuccess:.10}}
  }}, // No Mythical tier confirmed yet
  Sincere:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05,kissSuccess:.05}},
    Impressive:{social:{charmSuccess:.10,kissSuccess:.10}},
    Exceptional:{social:{charmSuccess:.10,kissSuccess:.10},action:{bribeSuccess:.05}},
    Legendary:{social:{charmSuccess:.20,kissSuccess:.10},action:{bribeSuccess:.05}}
  }}, // No Mythical tier confirmed yet
  Suave:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05,kissSuccess:.05}},
    Impressive:{social:{charmSuccess:.10,kissSuccess:.10,proposeSuccess:.05}},
    Exceptional:{social:{charmSuccess:.10,kissSuccess:.10,proposeSuccess:.10,proposeDefense:.05}},
    Legendary:{social:{charmSuccess:.10,kissSuccess:.10,proposeSuccess:.10,proposeDefense:.10}}
  }}, // No Mythical tier confirmed yet
  Hardy:{scaling:'tiered',stats:{
    Normal:{combat:{assaultDef:.05,defeatRecovery:.05}},
    Impressive:{combat:{assaultDef:.10,defeatRecovery:.05}},
    Exceptional:{combat:{assaultDef:.10,defeatRecovery:.10}},
    Legendary:{combat:{assaultDef:.20,defeatRecovery:.20}}
  }}, // No Mythical tier confirmed yet
  'Well Endowed':{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05,kissSuccess:.05,boinkSuccess:.20}},
    Impressive:{social:{charmSuccess:.10,kissSuccess:.10,boinkSuccess:.20}},
    Exceptional:{social:{charmSuccess:.10,kissSuccess:.20,boinkSuccess:.20}},
    Legendary:{social:{charmSuccess:.20,kissSuccess:.20,boinkSuccess:.20}}
  }}, // No Mythical tier confirmed yet
  Lightfooted:{scaling:'tiered',stats:{
    Normal:{mobility:{dungeonTravelSpeed:.05}},
    Impressive:{mobility:{dungeonTravelSpeed:.05,dungeonSpeed:.05}},
    Exceptional:{mobility:{dungeonTravelSpeed:.10,dungeonSpeed:.10}},
    Legendary:{mobility:{dungeonTravelSpeed:.20,dungeonSpeed:.20}}
  }},
  Thrillseeking:{scaling:'tiered',stats:{
    Normal:{mobility:{dungeonTravelSpeed:.05,exploreRecovery:.05,dungeonPayout:-.20}},
    Impressive:{mobility:{dungeonTravelSpeed:.10,exploreRecovery:.05,dungeonPayout:-.10}},
    Exceptional:{mobility:{dungeonTravelSpeed:.10,exploreRecovery:.10,dungeonPayout:-.05}},
    Legendary:{mobility:{dungeonTravelSpeed:.20,exploreRecovery:.20}}
  }},
  Perceptive:{scaling:'tiered',stats:{
    Normal:{mobility:{dungeonPayout:.05,dungeonSpeed:-.20}},
    Impressive:{mobility:{dungeonPayout:.05,dungeonSpeed:-.10}},
    Exceptional:{mobility:{dungeonPayout:.10,dungeonSpeed:-.05}},
    Legendary:{mobility:{dungeonPayout:.20}}
  }},
  // Discerning biome variants — ALL FOUR fully confirmed via screenshot (bonus +
  // penalty). Rotation: Grass→penalizes Sand, Sand→penalizes Snow, Snow→penalizes
  // Lava, Lava→penalizes Grass. penalizesBiome is fixed per variant (not tiered);
  // Legendary drops the penalty entirely (no penalty keys at that tier).
  'Discerning (Grass)':{scaling:'tiered',penalizesBiome:'Sand',stats:{
    Normal:{mobility:{dungeonPayout:.05,dungeonSpeed:.05,dungeonPayoutPenalty:-.20,dungeonSpeedPenalty:-.20}},
    Impressive:{mobility:{dungeonPayout:.10,dungeonSpeed:.05,dungeonPayoutPenalty:-.10,dungeonSpeedPenalty:-.10}},
    Exceptional:{mobility:{dungeonPayout:.10,dungeonSpeed:.10,dungeonPayoutPenalty:-.05,dungeonSpeedPenalty:-.05}},
    Legendary:{mobility:{dungeonPayout:.20,dungeonSpeed:.20}}
  }},
  'Discerning (Sand)':{scaling:'tiered',penalizesBiome:'Snow',stats:{
    Normal:{mobility:{dungeonPayout:.05,dungeonSpeed:.05,dungeonPayoutPenalty:-.20,dungeonSpeedPenalty:-.20}},
    Impressive:{mobility:{dungeonPayout:.10,dungeonSpeed:.05,dungeonPayoutPenalty:-.10,dungeonSpeedPenalty:-.10}},
    Exceptional:{mobility:{dungeonPayout:.10,dungeonSpeed:.10,dungeonPayoutPenalty:-.05,dungeonSpeedPenalty:-.05}},
    Legendary:{mobility:{dungeonPayout:.20,dungeonSpeed:.20}}
  }},
  'Discerning (Snow)':{scaling:'tiered',penalizesBiome:'Lava',stats:{
    Normal:{mobility:{dungeonPayout:.05,dungeonSpeed:.05,dungeonPayoutPenalty:-.20,dungeonSpeedPenalty:-.20}},
    Impressive:{mobility:{dungeonPayout:.10,dungeonSpeed:.05,dungeonPayoutPenalty:-.10,dungeonSpeedPenalty:-.10}},
    Exceptional:{mobility:{dungeonPayout:.10,dungeonSpeed:.10,dungeonPayoutPenalty:-.05,dungeonSpeedPenalty:-.05}},
    Legendary:{mobility:{dungeonPayout:.20,dungeonSpeed:.20}}
  }},
  'Discerning (Lava)':{scaling:'tiered',penalizesBiome:'Grass',stats:{
    Normal:{mobility:{dungeonPayout:.05,dungeonSpeed:.05,dungeonPayoutPenalty:-.20,dungeonSpeedPenalty:-.20}},
    Impressive:{mobility:{dungeonPayout:.10,dungeonSpeed:.05,dungeonPayoutPenalty:-.10,dungeonSpeedPenalty:-.10}},
    Exceptional:{mobility:{dungeonPayout:.10,dungeonSpeed:.10,dungeonPayoutPenalty:-.05,dungeonSpeedPenalty:-.05}},
    Legendary:{mobility:{dungeonPayout:.20,dungeonSpeed:.20}}
  }},
  Exacting:{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.05,loadProtection:.05}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.05}},
    Legendary:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.05}}
  }},
  'Meticulous (Gem)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.05}},
    Legendary:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}}
  }},
  'Meticulous (Metal)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.05}},
    Legendary:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}}
  }},
  'Meticulous (Mineral)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.05}},
    Legendary:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}}
  }},
  // Fixated: same 4-resource structure repeated across 9 raw resources (mining stat,
  // relevant to Collier/Prospector lines). No Mythical tier confirmed yet.
  'Fixated (Bronze)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10,loadProtection:.05}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}},
    Legendary:{mobility:{miningRate:.20,loadProtection:.20,mineDefense:.20}}
  }},
  'Fixated (Iron)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10,loadProtection:.05}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}},
    Legendary:{mobility:{miningRate:.20,loadProtection:.20,mineDefense:.20}}
  }},
  'Fixated (Steel)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10,loadProtection:.05}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}},
    Legendary:{mobility:{miningRate:.20,loadProtection:.20,mineDefense:.20}}
  }},
  'Fixated (Ruby)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10,loadProtection:.05}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}},
    Legendary:{mobility:{miningRate:.20,loadProtection:.20,mineDefense:.20}}
  }},
  'Fixated (Emerald)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10,loadProtection:.05}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}},
    Legendary:{mobility:{miningRate:.20,loadProtection:.20,mineDefense:.20}}
  }},
  'Fixated (Sapphire)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10,loadProtection:.05}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}},
    Legendary:{mobility:{miningRate:.20,loadProtection:.20,mineDefense:.20}}
  }},
  'Fixated (Salt)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10,loadProtection:.05}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}},
    Legendary:{mobility:{miningRate:.20,loadProtection:.20,mineDefense:.20}}
  }},
  'Fixated (Sulfur)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10,loadProtection:.05}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}},
    Legendary:{mobility:{miningRate:.20,loadProtection:.20,mineDefense:.20}}
  }},
  'Fixated (Mercury)':{scaling:'tiered',stats:{
    Normal:{mobility:{miningRate:.05}},
    Impressive:{mobility:{miningRate:.10,loadProtection:.05}},
    Exceptional:{mobility:{miningRate:.10,loadProtection:.10,mineDefense:.10}},
    Legendary:{mobility:{miningRate:.20,loadProtection:.20,mineDefense:.20}}
  }},
  // Greedy: per-resource Load Protection needs distinct flat keys since
  // formatFlatTraitStats() expects one number per key, not nested objects.
  // Display labels for loadProtectionMetal/Gem/Mineral still need confirming — see below.
  Greedy:{scaling:'tiered',stats:{
    Normal:{mobility:{heistSuccess:.05}},
    Impressive:{mobility:{heistSuccess:.05,loadProtectionMetal:.05}},
    Exceptional:{mobility:{heistSuccess:.10,loadProtectionMetal:.10,loadProtectionGem:.05}},
    Legendary:{mobility:{heistSuccess:.20,loadProtectionMetal:.10,loadProtectionGem:.10,loadProtectionMineral:.10}}
  }},
  Vigorous:{scaling:'tiered',stats:{
    Normal:{mobility:{exploreRecovery:.05},combat:{defeatRecovery:.05},social:{boinkSuccess:.05}},
    Impressive:{mobility:{exploreRecovery:.10},combat:{defeatRecovery:.10},social:{boinkSuccess:.05}},
    Exceptional:{mobility:{exploreRecovery:.20},combat:{defeatRecovery:.10},social:{boinkSuccess:.05}},
    Legendary:{mobility:{exploreRecovery:.20},combat:{defeatRecovery:.20},social:{boinkSuccess:.10}}
  }},
  Intrepid:{scaling:'tiered',stats:{
    Normal:{mobility:{exploreRecoverySmall:.05,exploreRecoveryMed:.05}},
    Impressive:{mobility:{exploreRecoverySmall:.10,exploreRecoveryMed:.05,exploreRecoveryLarge:.05}},
    Exceptional:{mobility:{exploreRecoverySmall:.10,exploreRecoveryMed:.10,exploreRecoveryLarge:.10}},
    Legendary:{mobility:{exploreRecoverySmall:.20,exploreRecoveryMed:.20,exploreRecoveryLarge:.20,dungeonTravelSpeed:.20}}
  }}, // No Mythical tier confirmed yet
  Observant:{scaling:'tiered',stats:{
    Normal:{mobility:{dungeonPayoutGrass:.10}},
    Impressive:{mobility:{dungeonPayoutGrass:.10,dungeonPayoutSand:.10}},
    Exceptional:{mobility:{dungeonPayoutGrass:.10,dungeonPayoutSand:.10,dungeonPayoutSnow:.10}},
    Legendary:{mobility:{dungeonPayout:.20}}
  }}, // Legendary flattens to a single untagged Dungeon Payout bonus (confirmed, not a screenshot artifact). No Mythical tier confirmed yet.
  Worldly:{scaling:'tiered',stats:{
    Normal:{action:{bribeDefense:.05},mobility:{dungeonSpeedGrass:.05}},
    Impressive:{action:{bribeDefense:.05},mobility:{dungeonSpeedGrass:.05,dungeonSpeedSand:.05}},
    Exceptional:{action:{bribeDefense:.10},mobility:{dungeonSpeedGrass:.10,dungeonSpeedSand:.10,dungeonSpeedSnow:.05}},
    Legendary:{action:{bribeDefense:.20},mobility:{dungeonSpeed:.20}}
  }}, // Legendary flattens to a single untagged Dungeon Speed bonus (confirmed, not a screenshot artifact). No Mythical tier confirmed yet.
  // ═══ PERSONALITY & BEHAVIOR TRAITS — confirmed via screenshots ═══
  Affectionate:{scaling:'tiered',stats:{
    Normal:{social:{kissSuccess:.05}},
    Impressive:{social:{kissSuccess:.10}},
    Exceptional:{social:{kissSuccess:.10,boinkSuccess:.05}},
    Legendary:{social:{kissSuccess:.20,boinkSuccess:.10}}
  }}, // No Mythical tier confirmed yet
  Aggressive:{scaling:'tiered',stats:{
    Normal:{action:{threatenSuccess:.05}},
    Impressive:{action:{threatenSuccess:.10}},
    Exceptional:{action:{threatenSuccess:.10},social:{charmSuccess:-.05}},
    Legendary:{action:{threatenSuccess:.20},social:{charmSuccess:-.10}}
  }}, // No Mythical tier confirmed yet
  Bashful:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:.05},action:{threatenSuccess:-.20}},
    Impressive:{social:{charmSuccess:.05},action:{threatenSuccess:-.10}},
    Exceptional:{social:{charmSuccess:.10},action:{threatenSuccess:-.10}},
    Legendary:{social:{charmSuccess:.20},action:{threatenSuccess:-.05}}
  }}, // No Mythical tier confirmed yet
  Boorish:{scaling:'tiered',stats:{
    Normal:{action:{threatenSuccess:.05},social:{charmSuccess:-.20}},
    Impressive:{action:{threatenSuccess:.05},social:{charmSuccess:-.10}},
    Exceptional:{action:{threatenSuccess:.10},social:{charmSuccess:-.10}},
    Legendary:{action:{threatenSuccess:.20},social:{charmSuccess:-.05}}
  }}, // No Mythical tier confirmed yet
  Corrupt:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:-.20},action:{sabotageSuccess:.05}},
    Impressive:{social:{charmSuccess:-.10},action:{sabotageSuccess:.10}},
    Exceptional:{social:{charmSuccess:-.05},action:{sabotageSuccess:.10,bribeSuccess:.05}},
    Legendary:{social:{charmSuccess:-.05},action:{sabotageSuccess:.20,bribeSuccess:.10},mobility:{loadProtectionGem:.05}}
  }}, // No Mythical tier confirmed yet
  Disingenuous:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:-.20},action:{bribeSuccess:.05}},
    Impressive:{social:{charmSuccess:-.10},action:{bribeSuccess:.05}},
    Exceptional:{social:{charmSuccess:-.10},action:{bribeSuccess:.10}},
    Legendary:{social:{charmSuccess:-.05},action:{bribeSuccess:.20}}
  }}, // No Mythical tier confirmed yet
  'Foul Mouthed':{scaling:'tiered',stats:{
    Normal:{action:{threatenSuccess:.05},social:{charmSuccess:-.20}},
    Impressive:{action:{threatenSuccess:.05},social:{charmSuccess:-.10}},
    Exceptional:{action:{threatenSuccess:.10},social:{charmSuccess:-.10}},
    Legendary:{action:{threatenSuccess:.20},social:{charmSuccess:-.05}}
  }}, // Numerically identical to Boorish — confirmed intentional per game design, not a data error
  Intimidating:{scaling:'tiered',stats:{
    Normal:{action:{threatenSuccess:.05,threatenDefense:.05}},
    Impressive:{action:{threatenSuccess:.10,threatenDefense:.05}},
    Exceptional:{action:{threatenSuccess:.10,threatenDefense:.10,blackmailSuccess:.05,blackmailDefense:.05}},
    Legendary:{action:{threatenSuccess:.10,threatenDefense:.10,blackmailSuccess:.10,blackmailDefense:.10}}
  }}, // No Mythical tier confirmed yet
  Lawful:{scaling:'tiered',stats:{
    Normal:{action:{bribeDefense:.05,blackmailDefense:.05}},
    Impressive:{action:{bribeDefense:.10,blackmailDefense:.05}},
    Exceptional:{action:{bribeDefense:.10,blackmailDefense:.10,guardCaptureSuccess:.05}},
    Legendary:{action:{bribeDefense:.20,blackmailDefense:.20,guardCaptureSuccess:.10,captureDefense:.05}}
  }}, // captureDefense = defense against this noble being captured; guardCaptureSuccess = success rate when this noble is placed as a guard capturing others. Distinct mechanics. No Mythical tier confirmed yet.
  Protective:{scaling:'tiered',stats:{
    Normal:{action:{roomGuardEffectiveness:.05}},
    Impressive:{action:{roomGuardEffectiveness:.10,guardCaptureSuccess:.05}},
    Exceptional:{action:{roomGuardEffectiveness:.10,guardCaptureSuccess:.10,guardEvictSuccess:.10}},
    Legendary:{action:{roomGuardEffectiveness:.20,guardCaptureSuccess:.20,guardEvictSuccess:.20},combat:{defeatRecovery:.10}}
  }}, // No Mythical tier confirmed yet
  Pugilistic:{scaling:'tiered',stats:{
    Normal:{action:{threatenSuccess:.05},social:{charmSuccess:-.20}},
    Impressive:{action:{threatenSuccess:.10},social:{charmSuccess:-.10}},
    Exceptional:{action:{threatenSuccess:.10},social:{charmSuccess:-.05}},
    Legendary:{action:{threatenSuccess:.20},social:{charmSuccess:-.05}}
  }}, // No Mythical tier confirmed yet
  Shady:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:-.20},mobility:{heistSuccess:.05}},
    Impressive:{social:{charmSuccess:-.20},mobility:{heistSuccess:.10},action:{bribeSuccess:.05}},
    Exceptional:{social:{charmSuccess:-.10},mobility:{heistSuccess:.10},action:{bribeSuccess:.10,blackmailSuccess:.05}},
    Legendary:{social:{charmSuccess:-.05},mobility:{heistSuccess:.20},action:{bribeSuccess:.10,blackmailSuccess:.10}}
  }}, // No Mythical tier confirmed yet
  Traitorous:{scaling:'tiered',stats:{
    Normal:{mobility:{heistSuccess:.10}},
    Impressive:{mobility:{heistSuccess:.20},action:{openGatesSuccess:.05}},
    Exceptional:{mobility:{heistSuccess:.20},action:{openGatesSuccess:.10,blackmailSuccess:.05}},
    Legendary:{mobility:{heistSuccess:.20},action:{openGatesSuccess:.20,blackmailSuccess:.10,bribeSuccess:.10}}
  }}, // No Mythical tier confirmed yet
  Underhanded:{scaling:'tiered',stats:{
    Normal:{action:{sabotageSuccess:.05}},
    Impressive:{action:{sabotageSuccess:.10}},
    Exceptional:{action:{sabotageSuccess:.20,stealIdentitySuccess:.05}},
    Legendary:{action:{sabotageSuccess:.20,stealIdentitySuccess:.10}}
  }}, // No Mythical tier confirmed yet
  Unfriendly:{scaling:'tiered',stats:{
    Normal:{social:{charmSuccess:-.20,charmDefense:.05}},
    Impressive:{social:{charmSuccess:-.10,charmDefense:.05}},
    Exceptional:{social:{charmSuccess:-.05,charmDefense:.05},action:{threatenSuccess:.05,threatenDefense:.05}},
    Legendary:{social:{charmSuccess:-.05,charmDefense:.05},action:{threatenSuccess:.10,threatenDefense:.10}}
  }}, // No Mythical tier confirmed yet
  Devious:{scaling:'tiered',stats:{
    Normal:{action:{sabotageSuccess:.05,openGatesSuccess:.05},social:{charmSuccess:-.20}},
    Impressive:{action:{sabotageSuccess:.10,openGatesSuccess:.05},social:{charmSuccess:-.10}},
    Exceptional:{action:{sabotageSuccess:.20,openGatesSuccess:.10},social:{charmSuccess:-.05}},
    Legendary:{action:{sabotageSuccess:.20,openGatesSuccess:.20}}
  }}, // No Mythical tier confirmed yet
  Bright:{scaling:'tiered',stats:{
    Normal:{mobility:{heistSuccess:.05},action:{jailbreakSuccess:.05}},
    Impressive:{mobility:{heistSuccess:.10},action:{jailbreakSuccess:.05}},
    Exceptional:{mobility:{heistSuccess:.10},action:{jailbreakSuccess:.10}},
    Legendary:{mobility:{heistSuccess:.20},action:{jailbreakSuccess:.20}}
  }}, // Also carries a non-stacking Room Boosting Effectiveness bonus at every tier — no confirmed exact value, see manualExtras in buildPersonalityBehaviorLine()
  // ═══ PHOBIAS — confirmed flat -90% penalties, always red-flag severity ═══
  Acrophobic:{scaling:'flat',stats:{flat:{mobility:{dungeonSpeed:-.90,miningRate:-.90,mineDefense:-.90,cityDefense:-.90}}}},
  Agoraphobic:{scaling:'flat',stats:{flat:{action:{tradingSpeed:-.90,tradingCosts:-.90,tradePayout:-.90},social:{charmSuccess:-.90}}}},
  Algophobic:{scaling:'flat',stats:{flat:{action:{assaultSuccess:-.90},combat:{defeatRecovery:-.90,deploy:-.90,speed:-.90}}}},
  Gamophobic:{scaling:'flat',stats:{flat:{social:{proposeSuccess:-.90,charmSuccess:-.90,kissSuccess:-.90,boinkSuccess:-.90}}}},
  Genophobic:{scaling:'flat',stats:{flat:{social:{kissSuccess:-.90,charmSuccess:-.90}}}}, // Source screenshot showed "Kiss Success" twice — treated as a single stat since duplicate keys can't hold two values; flag for confirmation, may have meant a different stat (e.g. Boink Success or Kiss Defense)
  Koinoniphobic:{scaling:'flat',stats:{flat:{action:{roomGuardEffectiveness:-.90},mobility:{dungeonTravelSpeed:-.90}}}}, // Also non-stacking penalty to Room Boosting/Room Helping — no confirmed exact value, see manualExtras in buildPhobiasLine()
  Nyctophobic:{scaling:'flat',stats:{flat:{mobility:{dungeonTravelSpeed:-.90,exploreRecovery:-.90,dungeonSpeed:-.90}}}},
  Sociophobic:{scaling:'flat',stats:{flat:{social:{charmSuccess:-.90},action:{evictSuccess:-.90,blackmailSuccess:-.90},combat:{deploy:-.90}}}},
  Claustrophobic:{scaling:'flat',stats:{flat:{social:{charmSuccess:-.90},action:{evictSuccess:-.90,blackmailSuccess:-.90},combat:{deploy:-.90}}}}, // Numerically identical to Sociophobic — confirmed intentional game design, not a data error
  Unreliable:{scaling:null,stats:null}
};

// ═══ PHOBIAS — intentionally NOT migrated into TRAIT_DATABASE ═══
// Phobia effects are documented as prose describing WHICH named stats each phobia hits
// (e.g. "Dungeon Speed, Mining Rate, Mine Defense, City Defense"), not as confirmed
// per-stat-key numeric values like every entry above. Forcing them into this schema
// would mean inventing key names for stats that were never explicitly keyed that way.
// PHOBIA_DB stays exactly as-is in battle-simulator.js until/unless real per-key
// confirmation exists for each phobia's -90% penalties.
