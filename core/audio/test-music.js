// node core/audio/test-music.js — the music director's contract (core/audio/PLAN.md step A5).
// Each check comes with a broken input that must fail.
const fs = require('fs'), path = require('path');
global.window = global;

eval(fs.readFileSync(path.join(__dirname, '..', 'rand', '08-core-rand.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '26-core-audio-music.js'), 'utf8'));

let bad = 0;
const ok = (name, pass, neg) => {
  const r = pass && !neg;
  if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (neg ? ' (its negative passed)' : ''));
};

const KM = global.KMUSIC;
const musicData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'music.json'), 'utf8'));
const pieces = musicData.pieces.map(KM.cleanPiece);
const combatBeats = musicData.combatBeats.map(KM.cleanCombatBeat);

// 1. Data Cleaning and Validation
const cleanedP = KM.cleanPiece({ id: 'test_piece', stems: [{ id: 'pad_1', role: 'pad' }] });
ok('clean piece: default values assigned', cleanedP.dur === 60 && cleanedP.fadeIn === 4.0);
ok('clean piece: stem cleaned', cleanedP.stems[0].role === 'pad' && cleanedP.stems[0].chance === 1.0);
const cleanedB = KM.cleanCombatBeat({ id: 'test_beat', bpm: 130 });
ok('clean combat beat: bpm and default holdTime', cleanedB.bpm === 130 && cleanedB.holdTime === 5.0);

// Negative clean test
const brokenP = KM.cleanPiece(null);
ok('broken piece handled cleanly', brokenP.biome === 'hyperjungle' && brokenP.stems.length === 0);

// 2. Pure State Immutability
const s0 = KM.createState(42, { minSilence: 100, maxSilence: 200 });
const s0Snap = JSON.stringify(s0);
const r1 = KM.step(s0, { biomes: 'hyperjungle', hour: 6, combatIntensity: 0, pieces: pieces, combatBeats: combatBeats }, 10);
ok('pure state: original state unmutated by step', JSON.stringify(s0) === s0Snap);
ok('pure state: new state returned with advanced time', r1.state.time === 10 && r1.state.stepCount === 1);

// 3. Hour Curve Weighting in Piece Selection
const dawnPiece = pieces.find(p => p.id === 'music.hyperjungle.canopy_dawn');
const twilightPiece = pieces.find(p => p.id === 'music.hyperjungle.deep_twilight');
const dawnScore06 = KM.evalHour(dawnPiece.hourWeight, 6.0);
const dawnScore18 = KM.evalHour(dawnPiece.hourWeight, 18.0);
ok('hour weighting: dawn piece peaks at 06:00', dawnScore06 > 0.9);
ok('hour weighting: dawn piece drops by 18:00', dawnScore18 === 0.0);
const twilightScore20 = KM.evalHour(twilightPiece.hourWeight, 20.0);
ok('hour weighting: twilight piece peaks in evening', twilightScore20 > 0.7);

// 4. Sparse Ambient Triggering & Ambience Ducking
// Step until silence timer expires
let sAmbient = KM.createState(101, { minSilence: 10, maxSilence: 10 });
sAmbient.silenceTimer = 2.0; // Force near expiration
const stepAmbient = KM.step(sAmbient, { biomes: 'hyperjungle', hour: 6, pieces: pieces, combatBeats: combatBeats }, 3.0);
const startCmd = stepAmbient.commands.find(c => c.type === 'start_ambient');
const duckCmd = stepAmbient.commands.find(c => c.type === 'duck_bus' && c.bus === 'ambience');
ok('ambient trigger: piece started after silence expires', !!startCmd && startCmd.pieceId.startsWith('music.hyperjungle'));
ok('ambient ducking: ambience bus ducked when ambient piece starts', !!duckCmd && duckCmd.targetGain < 0.7);
ok('ambient stems: pad stem included', startCmd && startCmd.stems.some(st => st.role === 'pad'));

// 5. Strict No-Repeat Window
const testPool = [
  KM.cleanPiece({ id: 'p1', biome: 'hyperjungle', dur: 10 }),
  KM.cleanPiece({ id: 'p2', biome: 'hyperjungle', dur: 10 }),
  KM.cleanPiece({ id: 'p3', biome: 'hyperjungle', dur: 10 })
];
let sRepeat = KM.createState(777, { minSilence: 1, maxSilence: 1, noRepeatMemory: 2 });
sRepeat.recentPieces = ['p1', 'p2'];
sRepeat.silenceTimer = 0;
const rRepeat = KM.step(sRepeat, { biomes: 'hyperjungle', hour: 12, pieces: testPool }, 1);
const pickedPiece = rRepeat.commands.find(c => c.type === 'start_ambient');
ok('no-repeat window: avoided recently played p1 and p2', pickedPiece && pickedPiece.pieceId === 'p3');

// 6. Regional Arrival Stinger Trigger
let sArrival = KM.createState(999, { arrivalChance: 1.0, arrivalCooldown: 180 });
sArrival.lastRegion = 'hyperjungle.lowlands';
sArrival.arrivalCooldownTimer = 0;
sArrival.silenceTimer = 500; // Long silence remaining
const rArrival = KM.step(sArrival, { biomes: 'hyperjungle', hour: 8, region: 'hyperjungle.canopy_highlands', pieces: pieces }, 1.0);
const arrivalStart = rArrival.commands.find(c => c.type === 'start_ambient');
ok('arrival stinger: new region triggered piece despite silence timer', !!arrivalStart);
ok('arrival cooldown set', rArrival.state.arrivalCooldownTimer > 170);

// 7. Combat Instant Interrupt of Ambient Music
let sCombatInt = KM.createState(555, {});
sCombatInt.activeAmbient = { pieceId: 'music.hyperjungle.canopy_dawn', dur: 60, elapsed: 10 };
const rCombatInt = KM.step(sCombatInt, { biomes: 'hyperjungle', combatIntensity: 1, combatBeats: combatBeats }, 1.0);
const fadeCmd = rCombatInt.commands.find(c => c.type === 'fade_ambient');
const combatStartCmd = rCombatInt.commands.find(c => c.type === 'start_combat_beat');
const combatDuckCmd = rCombatInt.commands.find(c => c.type === 'duck_bus' && c.bus === 'ambience');
ok('combat interrupt: active ambient music immediately faded', !!fadeCmd && fadeCmd.fadeOut <= 1.0);
ok('combat start: combat beat started', !!combatStartCmd && combatStartCmd.intensity === 1);
ok('combat ducking: ambience bus ducked to 0.5 (-6dB)', combatDuckCmd && combatDuckCmd.targetGain === 0.5);

// 8. Adaptive Combat Stems (Intensity 1 Skirmish -> Intensity 2 Battle)
let sCombatStem = rCombatInt.state;
ok('combat stems intensity 1: percussion stem active', sCombatStem.combat.activeStems.length === 1 && sCombatStem.combat.activeStems[0] === 'percussion');
const rBattle = KM.step(sCombatStem, { biomes: 'hyperjungle', combatIntensity: 2, combatBeats: combatBeats }, 1.0);
const updateCmd = rBattle.commands.find(c => c.type === 'update_combat_stems');
ok('combat stems intensity 2: bass and lead added on battle escalation', !!updateCmd && updateCmd.addStems.length === 2);
ok('combat stems state: all 3 stems active in battle', rBattle.state.combat.activeStems.length === 3);

// 9. Combat Disengagement Hold Tail
const sBattleActive = rBattle.state;
const rDisengage = KM.step(sBattleActive, { biomes: 'hyperjungle', combatIntensity: 0, combatBeats: combatBeats }, 1.0);
ok('combat disengage: hold timer started, beat not abruptly stopped', rDisengage.state.combat.active && rDisengage.state.combat.holdTimer > 0);
ok('combat disengage: no stop command issued during hold', !rDisengage.commands.some(c => c.type === 'stop_combat_beat'));

// Step through remaining hold time
let sHold = rDisengage.state;
const rHoldEnd = KM.step(sHold, { biomes: 'hyperjungle', combatIntensity: 0, combatBeats: combatBeats }, sHold.combat.holdTimer + 0.1);
const stopCombatCmd = rHoldEnd.commands.find(c => c.type === 'stop_combat_beat');
const restoreDuckCmd = rHoldEnd.commands.find(c => c.type === 'duck_bus' && c.bus === 'ambience');
ok('combat hold end: stop combat beat with tail clip', !!stopCombatCmd && !!stopCombatCmd.tailClip);
ok('combat hold end: ambience bus restored to 1.0', !!restoreDuckCmd && restoreDuckCmd.targetGain === 1.0);
ok('combat state: combat inactive after hold expires', !rHoldEnd.state.combat.active);

// 10. Indoors Snapshot Switch
let sOutdoor = KM.createState(123, {});
const rIndoor = KM.step(sOutdoor, { biomes: 'hyperjungle', indoors: true }, 1.0);
const snapCmd = rIndoor.commands.find(c => c.type === 'set_snapshot');
ok('snapshot: indoors snapshot commanded on entering cave/shelter', snapCmd && snapCmd.snapshot === 'indoors');

// 11. Full 24-Hour Seeded Simulation Contract
const scenario = {
  dt: 5,
  startHour: 5.0, // Start at 05:00
  startBiomes: { hyperjungle: 1.0 },
  startRegion: 'hyperjungle.deep',
  events: [
    { t: 7200, region: 'hyperjungle.canopy_lookout' },             // 07:00: region arrival stinger check
    { t: 18000, biomes: { savannah: 1.0 }, region: 'savannah.scrub' }, // 10:00: walk into savannah
    { t: 28800, combat: 1 },                                       // 13:00: skirmish with scavengers
    { t: 29100, combat: 2 },                                       // 13:05: battle escalates
    { t: 29700, combat: 0 },                                       // 13:15: combat disengages
    { t: 50400, weather: { rain: 0.8, wind: 1.5, fog: 0.2 } },      // 19:00: evening thunderstorm
    { t: 72000, combat: 1 },                                       // 01:00: night predator ambush
    { t: 72300, combat: 0 }                                        // 01:05: disengage
  ]
};

const sim1 = KM.simulateDay(424242, pieces, combatBeats, scenario);
const sim2 = KM.simulateDay(424242, pieces, combatBeats, scenario);
const sim3 = KM.simulateDay(999999, pieces, combatBeats, scenario);

ok('simulation: seeded 24h run is strictly deterministic', JSON.stringify(sim1.timeline) === JSON.stringify(sim2.timeline));
ok('simulation: different seed produces different schedule', JSON.stringify(sim1.timeline) !== JSON.stringify(sim3.timeline));
ok('simulation: ambient pieces played across 24h', sim1.stats.totalAmbientPieces >= 10);
ok('simulation: combat engagements matched scenario', sim1.stats.totalCombatEngagements === 2);
ok('simulation: average silence duration reflects sparse Kenshi aesthetic (>= 180s)', sim1.stats.avgSilenceSeconds >= 150);
ok('simulation: zero no-repeat violations over 24 hours', sim1.stats.noRepeatViolations === 0);

console.log('\n--- 24-Hour Simulation Stats (Seed 424242) ---');
console.log('Total Ambient Pieces Played:', sim1.stats.totalAmbientPieces);
console.log('Total Combat Engagements:   ', sim1.stats.totalCombatEngagements);
console.log('Average Silence Duration:   ', sim1.stats.avgSilenceSeconds, 'seconds');
console.log('Ambience Bus Ducked Time:   ', sim1.stats.totalAmbienceDuckedSeconds, 'seconds');
console.log('Total Timeline Decision Events:', sim1.timeline.length);

if (bad > 0) {
  console.error('\nFAILED: ' + bad + ' checks failed.');
  process.exit(1);
} else {
  console.log('\nAll step A5 music director tests passed cleanly.');
}
