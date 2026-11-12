const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'lab', 'template.html');
let html = fs.readFileSync(target, 'utf8');
const isCRLF = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

const jsCode = fs.readFileSync(path.join(__dirname, 'soundtrack_engine_code.js'), 'utf8');

const startMarker = '/* ================================================================= REGIONAL SOUNDTRACK & MUSIC DIRECTOR */';
const endMarker = 'initMusicState();\n\nupdateSoundscapeSim();';

const sIdx = html.indexOf(startMarker);
const eIdx = html.indexOf(endMarker);

if (sIdx < 0 || eIdx < 0) {
  console.error('Could not locate markers in template.html', { sIdx, eIdx });
  process.exit(1);
}

const newContent = html.slice(0, sIdx) + jsCode + '\n\n' + html.slice(eIdx);

fs.writeFileSync(target, isCRLF ? newContent.replace(/\n/g, '\r\n') : newContent, 'utf8');
console.log('Successfully updated template.html with validated soundtrack JS engine.');
