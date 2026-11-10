const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { DEFAULTS, normalizeSettings, selectBeds, createStingLimiter, scheduleStingEvents } = require('./tools/playback_limits');

assert.deepStrictEqual(normalizeSettings(), DEFAULTS);
assert.deepStrictEqual(normalizeSettings({ maxAmbientBeds: -8, minStingIntervalSeconds: 99999, maxStingsPerFiveMinutes: 0, maxSimultaneousStings: 100 }), {
  maxAmbientBeds: 1,
  minStingIntervalSeconds: 1800,
  maxStingsPerFiveMinutes: 1,
  maxSimultaneousStings: 8
});

const beds = [
  { id: 'minor-a', eligible: true, active: false },
  { id: 'env-a', eligible: true, active: true },
  { id: 'minor-b', eligible: true, active: true },
  { id: 'env-b', eligible: true, active: false },
  { id: 'not-due', eligible: false, active: true }
];
assert.deepStrictEqual(selectBeds(beds, 2), ['env-a', 'minor-b']);
assert.deepStrictEqual(selectBeds(beds, 3), ['env-a', 'minor-b', 'minor-a']);

const limiter = createStingLimiter({ minStingIntervalSeconds: 0, maxStingsPerFiveMinutes: 2, maxSimultaneousStings: 1 });
const first = limiter.reserve({ name: 'first' }, 0, 10);
assert.strictEqual(first.ok, true);
assert.strictEqual(limiter.reserve({ name: 'overlap' }, 1, 10).reason, 'simultaneous-limit');
limiter.release(first.id);
const second = limiter.reserve({ name: 'second' }, 2, 10);
assert.strictEqual(second.ok, true);
limiter.release(second.id);
assert.strictEqual(limiter.reserve({ name: 'window-full' }, 3, 10).reason, 'rolling-window');
const afterWindow = limiter.reserve({ name: 'window-expired' }, 300, 1);
assert.strictEqual(afterWindow.ok, true, 'a start exactly 300 seconds old must leave the rolling window');

const spaced = createStingLimiter({ minStingIntervalSeconds: 30, maxStingsPerFiveMinutes: 4, maxSimultaneousStings: 2 });
const spacedFirst = spaced.reserve({ name: 'first' }, 10, 5);
assert.strictEqual(spaced.reserve({ name: 'too-soon' }, 39.99, 1).reason, 'minimum-interval');
assert.strictEqual(spaced.reserve({ name: 'on-boundary' }, 40, 1).ok, true);
spaced.release(spacedFirst.id);

const scheduled = scheduleStingEvents([
  { id: 'late', track: 'late', time: 160, duration: 20 },
  { id: 'first', track: 'first', time: 0, duration: 90 },
  { id: 'overlap', track: 'overlap', time: 60, duration: 90 },
  { id: 'after-release', track: 'after-release', time: 95, duration: 10 },
  { id: 'window-cap', track: 'window-cap', time: 200, duration: 10 },
  { id: 'window-expired', track: 'window-expired', time: 301, duration: 10 }
], { minStingIntervalSeconds: 0, maxStingsPerFiveMinutes: 3, maxSimultaneousStings: 1 });
assert.deepStrictEqual(scheduled.map(event => event.id), ['first', 'after-release', 'late', 'window-expired']);

const enginePath = path.join(__dirname, 'tools', 'soundtrack_engine_code.js');
const engine = fs.readFileSync(enginePath, 'utf8');
const helpers = fs.readFileSync(path.join(__dirname, 'tools', 'playback_limits.js'), 'utf8');
assert.match(engine, /KRATOR_AUDIO_PLAYBACK\.selectBeds/);
assert.match(engine, /stingLimiter\.reserve/);
assert.match(engine, /scheduleStingEvents\(proposedStings, stk\.playback\)/);
assert.match(engine, /updatePlayingClips\(G\)/);
assert.doesNotThrow(() => new Function(helpers + '\n' + engine), 'the combined playback runtime must parse');

console.log('Playback limits: bed cap, sting concurrency, minimum spacing, and rolling window passed.');
