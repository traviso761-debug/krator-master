const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.resolve(__dirname, '..', '..', '..', '..', 'krator-audio', 'lab', 'index.html'), 'utf8');

const scripts = [];
const re = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
let m;
while ((m = re.exec(html)) !== null) {
  scripts.push(m[1]);
}

console.log('Total script blocks:', scripts.length);
let syntaxErrors = 0;

scripts.forEach((src, idx) => {
  try {
    new Function(src);
    console.log('Script #' + (idx + 1) + ' syntax OK (' + src.length + ' chars)');
  } catch (e) {
    console.error('Script #' + (idx + 1) + ' SYNTAX ERROR:', e.message);
    syntaxErrors++;
  }
});

const requiredIds = [
  'tb-beat', 'tab-beat', 'beat-generator', 'beat-btn-play', 'beat-btn-stop',
  'beat-btn-addtrack', 'beat-btn-bake', 'beat-bpm', 'beat-bars', 'beat-cycle-time',
  'beat-master-vol', 'beat-master-vol-val', 'beat-swing', 'beat-duck-env',
  'beat-orbit-canvas', 'beat-orbit-summary', 'beat-track-rack',
  'bp-jimjam', 'bp-four', 'bp-hemiola', 'bp-golden', 'bp-greek', 'bp-prime', 'bp-clear',
  'tb-music', 'tab-music', 'stk-play-btn', 'stk-preset-sel', 'stk-master',
  'tier-bed', 'stk-major-fin', 'stk-major-fout', 'stk-major-duty', 'stk-major-cycle',
  'tier-env', 'stk-env-duckvol', 'tier-stings', 'tier-combat',
  'stk-combat-off', 'stk-combat-danger', 'stk-combat-full', 'stk-do-xfade-btn',
  'stk-pull-active-btn', 'stk-pull-saved-btn', 'stk-import-file-input',
  'stk-playing-clips', 'stk-max-ambient-beds', 'stk-min-sting-interval',
  'stk-max-stings-window', 'stk-max-simultaneous-stings', 'stk-target-preset-sel',
  'stk-master-bpm', 'stk-master-meter', 'stk-quantize-mode', 'stk-phase-nudge-ms',
  'stk-tap-tempo-btn', 'stk-click-test-btn', 'stk-detect-bpm-btn',
  'stk-detected-bpm', 'stk-beat-anchor-sec', 'stk-use-detected-tempo-btn',
  'stk-snap-detected-track-btn', 'btn-export-all-cuts', 'btn-backup-all-cuts',
  'btn-restore-all-cuts', 'btn-import-cuts-file', 'cut-pitch-amount', 'cut-pitch-apply', 'cut-pitch-clear', 'cut-pitch-summary'
];

const missing = requiredIds.filter(id => !html.includes('id="' + id + '"'));
console.log('Missing IDs:', missing);
const tooltipIds = [
  'stk-master-bpm', 'stk-master-meter', 'stk-quantize-mode', 'stk-phase-nudge-ms',
  'stk-tap-tempo-btn', 'stk-click-test-btn', 'stk-detect-bpm-btn', 'stk-detected-bpm',
  'stk-beat-anchor-sec', 'stk-use-detected-tempo-btn', 'stk-snap-detected-track-btn',
  'btn-export-all-cuts', 'btn-backup-all-cuts', 'btn-restore-all-cuts', 'btn-import-cuts-file', 'cut-pitch-amount', 'cut-pitch-apply', 'cut-pitch-clear'
];
const missingTooltips = tooltipIds.filter(id => !new RegExp('id="' + id + '"[^>]*title="[^\"]+"').test(html));
console.log('Controls missing plain-language tooltips:', missingTooltips);
if (missing.length === 0) {
  console.log('All required UI elements present and accounted for.');
}
if (missing.length || missingTooltips.length || syntaxErrors) process.exitCode = 1;
