const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'lab', 'template.html');
let html = fs.readFileSync(target, 'utf8');
const isCRLF = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// Install the shared playback policy helpers before the soundtrack engine.
const playbackHelpers = fs.readFileSync(path.join(__dirname, 'playback_limits.js'), 'utf8');
const jsCode = fs.readFileSync(path.join(__dirname, 'soundtrack_engine_code.js'), 'utf8');

const anchor = `initMusicState();\n\nupdateSoundscapeSim();`;

const anchorAt = html.indexOf(anchor);
if (anchorAt < 0) {
  console.error('Could not find anchor in template.html');
  process.exit(1);
}

const engineMarker = '/* ================================================================= REGIONAL SOUNDTRACK & MUSIC DIRECTOR */';
const existingEngineAt = html.indexOf(engineMarker);
const startAt = existingEngineAt >= 0 && existingEngineAt < anchorAt ? existingEngineAt : anchorAt;
const patched = html.slice(0, startAt) + playbackHelpers + '\n' + jsCode + '\n\n' + html.slice(anchorAt);

fs.writeFileSync(target, isCRLF ? patched.replace(/\n/g, '\r\n') : patched, 'utf8');
console.log('Successfully installed Soundtrack JS engine into template.html');
