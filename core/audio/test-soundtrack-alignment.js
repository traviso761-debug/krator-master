const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'tools', 'soundtrack_engine_code.js'), 'utf8');
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
function extract(name, nextName) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf('\n}\n', start + 1) + 2;
  assert(start >= 0 && end > start, `could not locate ${name}`);
  return new Function('clamp', `return (${source.slice(start, end).trim()})`)(clamp);
}
const estimateStart = source.indexOf('function estimateClipTempo(');
const estimateEnd = source.indexOf('async function triggerTransitionFX(', estimateStart);
const estimateBodyEnd = source.lastIndexOf('\n}\n', estimateEnd) + 2;
const estimateClipTempo = new Function('clamp', `return (${source.slice(estimateStart, estimateBodyEnd).trim()})`)(clamp);
const getNextQuantizedTime = extract('getNextQuantizedTime', 'getTrackBeatOffset');
const getTrackBeatOffset = extract('getTrackBeatOffset', 'estimateClipTempo');

function pulseBuffer(bpm, seconds = 12, sampleRate = 8000) {
  const length = seconds * sampleRate;
  const channel = new Float32Array(length);
  const period = sampleRate * 60 / bpm;
  for (let beat = 0; beat < seconds * bpm / 60; beat++) {
    const start = Math.floor(beat * period + 0.12 * sampleRate);
    for (let i = 0; i < sampleRate * 0.06 && start + i < length; i++) {
      channel[start + i] += 0.85 * Math.exp(-i / (sampleRate * 0.012));
    }
  }
  return { length, sampleRate, duration: seconds, numberOfChannels: 1, getChannelData: () => channel };
}

const result = estimateClipTempo(pulseBuffer(120));
assert(Math.abs(result.bpm - 120) < 1, `expected about 120 BPM, got ${result.bpm}`);
assert(Math.abs(result.firstBeatSec - 0.12) <= 0.03, `expected beat anchor near 0.12s, got ${result.firstBeatSec}`);
assert(result.confidence > 0.1, 'expected a nontrivial confidence score');
assert(result.alternatives.some(x => Math.abs(x - 60) < 1), 'expected half-time option');
assert(result.alternatives.some(x => Math.abs(x - 240) < 1), 'expected double-time option');

const ctx = { currentTime: 1.01 };
assert(Math.abs(getNextQuantizedTime(ctx, 120, 4, 'bar', 0) - 2) < 1e-8, 'bar quantization must choose the next bar');
assert(Math.abs(getNextQuantizedTime(ctx, 120, 4, '2bar', 0) - 4) < 1e-8, 'phrase quantization must choose the next two-bar boundary');
assert(Math.abs(getNextQuantizedTime(ctx, 120, 4, 'bar', 0, 100) - 2.1) < 1e-8, 'phase nudge must offset the grid');
assert(Math.abs(getNextQuantizedTime(ctx, 120, 4, 'beat', 0) - 1.5) < 1e-8, 'beat quantization must choose the next beat');
assert.throws(() => estimateClipTempo(pulseBuffer(120, 2)), /three seconds/);
assert.equal(getTrackBeatOffset({ beatOffsetSec: 0.3 }, { duration: 10 }), 0.3);
console.log('Soundtrack alignment: BPM/BPS detection, beat anchor, tempo alternatives, quantized boundaries, phase nudge, and offset validation passed.');
