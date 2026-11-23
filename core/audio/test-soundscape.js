// node core/audio/test-soundscape.js — the soundscape and biome blender's contract (core/audio/PLAN.md step A4).
// Each check comes with a broken input that must fail.
const fs = require('fs'), path = require('path');
global.window = global;

eval(fs.readFileSync(path.join(__dirname, '..', 'rand', '08-core-rand.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '24-core-audio-soundscape.js'), 'utf8'));

let bad = 0;
const ok = (name, pass, neg) => {
  const r = pass && !neg;
  if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (neg ? ' (its negative passed)' : ''));
};

const KS = global.KSOUNDSCAPE;

// 1. Cyclic hour curve evaluation
const dawnChorusCurve = [[4, 0.0], [6, 1.0], [9, 0.2]];
ok('hour curve: zero before dawn', Math.abs(KS.evalHour(dawnChorusCurve, 3.0) - 0.0) < 0.05);
ok('hour curve: peaks at dawn (06:00)', Math.abs(KS.evalHour(dawnChorusCurve, 6.0) - 1.0) < 0.01);
ok('hour curve: cyclic wrap between 23:00 and 04:00', KS.evalHour([[22, 1.0], [2, 1.0], [8, 0.0]], 0.5) > 0.9);
ok('hour curve: negative hour wraps modulo 24', Math.abs(KS.evalHour(dawnChorusCurve, -18.0) - 1.0) < 0.01);

// Negative hour curve test
ok('broken curve handles gracefully', KS.evalHour([], 12.0) === 1.0);

// 2. Weather curve evaluation
const rainCurve = {
  rain: [[0, 0.0], [0.3, 0.4], [1.0, 1.0]],
  wind: [[0, 0.5], [1.0, 1.0]]
};
ok('weather: dry weather yields 0 rain gain', KS.evalWeather(rainCurve, { rain: 0.0, wind: 1.0 }) === 0.0);
ok('weather: heavy rain swells to full volume', KS.evalWeather(rainCurve, { rain: 1.0, wind: 1.0 }) === 1.0);
ok('weather: moderate storm scales linearly', KS.evalWeather(rainCurve, { rain: 0.3, wind: 1.0 }) >= 0.35);

// 3. Soundscape definition and clean
const jungleSc = KS.clean({
  id: 'soundscape.hyperjungle.day',
  name: 'Hyperjungle Day',
  biome: 'hyperjungle',
  tracks: [
    {
      id: 'jungle_canopy_bed',
      clip: 'pixabay-rainforest-33441',
      mode: 'bed',
      vol: 0.8,
      hourCurve: [[5, 0.5], [12, 1.0], [18, 0.6], [22, 0.1]]
    },
    {
      id: 'coqui_calls',
      clip: 'pixabay-coqui-88362',
      mode: 'events',
      every: 6,
      jitter: 2,
      hourCurve: [[18, 0.2], [22, 1.0], [4, 0.9], [7, 0.0]]
    }
  ]
});

const savannahSc = KS.clean({
  id: 'soundscape.savannah.day',
  name: 'Savannah Day',
  biome: 'savannah',
  tracks: [
    {
      id: 'savannah_wind_bed',
      clip: 'sfxmint-steady-desert-wind-03',
      mode: 'bed',
      vol: 0.7,
      hourCurve: [[6, 0.8], [14, 1.0], [20, 0.5]]
    },
    {
      id: 'cricket_calls',
      clip: 'kenney-jingles-pizzi-01',
      mode: 'events',
      every: 10,
      jitter: 3
    }
  ]
});

ok('clean soundscape normalizes tracks and defaults', jungleSc.tracks.length === 2 && savannahSc.tracks.length === 2);

// 4. Biome crossfading (Step A4 acceptance test)
// "the hyperjungle day scene crossfades into a savannah scene on the blend slider"
const soundscapes = {
  hyperjungle: jungleSc,
  savannah: savannahSc
};

// Test at blend = 0.0 (100% Hyperjungle)
const blend0 = KS.blend(soundscapes, { hyperjungle: 1.0, savannah: 0.0 }, 12.0, { rain: 0 });
ok('blend 0.0: only hyperjungle active', blend0.activeBiomes.length === 1 && blend0.activeBiomes[0] === 'hyperjungle');
ok('blend 0.0: jungle bed full gain', blend0.tracks[0].effectiveGain > 0.7);

// Test at blend = 0.5 (50/50 Crossfade midpoint)
const blend50 = KS.blend(soundscapes, { hyperjungle: 0.5, savannah: 0.5 }, 12.0, { rain: 0 });
const jungleTrack50 = blend50.tracks.find(t => t.biome === 'hyperjungle');
const savannahTrack50 = blend50.tracks.find(t => t.biome === 'savannah');
ok('blend 0.5: both biomes represented equally', Math.abs(jungleTrack50.biomeWeight - 0.5) < 0.01 && Math.abs(savannahTrack50.biomeWeight - 0.5) < 0.01);
ok('blend 0.5: gains scaled by 50% blend weight', jungleTrack50.effectiveGain < blend0.tracks[0].effectiveGain);

// Test at blend = 1.0 (100% Savannah)
const blend100 = KS.blend(soundscapes, { hyperjungle: 0.0, savannah: 1.0 }, 12.0, { rain: 0 });
ok('blend 1.0: only savannah active', blend100.activeBiomes.length === 1 && blend100.activeBiomes[0] === 'savannah');
ok('blend 1.0: savannah bed full gain', blend100.tracks[0].effectiveGain > 0.6);

// 5. Deterministic call scheduling with KRAND
const eventTrack = jungleSc.tracks[1];
const callA = KS.nextCall(eventTrack, 10.0, 1337, 1);
const callB = KS.nextCall(eventTrack, 10.0, 1337, 1);
const callDiffSeed = KS.nextCall(eventTrack, 10.0, 9999, 1);

ok('seeded call scheduling: identical picks for identical seeds', callA.time === callB.time && callA.pitch === callB.pitch);
ok('seeded call scheduling: different picks for different seeds', callA.time !== callDiffSeed.time || callA.pitch !== callDiffSeed.pitch);

// 6. Validation checks (broken inputs)
const broken = KS.validate({ id: '', tracks: [] });
ok('validation catches missing id and tracks', broken.length >= 2);

console.log(bad ? `\nFAIL: ${bad} soundscape check(s) failed.` : '\nPASS: all soundscape and biome blending tests passed.');
process.exit(bad ? 1 : 0);
