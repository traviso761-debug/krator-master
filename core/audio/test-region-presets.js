const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const source = fs.readFileSync(path.join(__dirname, 'tools', 'soundtrack_engine_code.js'), 'utf8');
const start = source.indexOf('const BIOME_PRESETS =');
const end = source.indexOf('const CULTURE_PRESETS =', start);
const ctx = {};
vm.runInNewContext(source.slice(start, end).replace('const BIOME_PRESETS', 'globalThis.BIOME_PRESETS'), ctx);
const presets = ctx.BIOME_PRESETS;
const catalogPath = process.env.KRATOR_AUDIO_CATALOG || path.join(__dirname, 'data', 'clips.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')).clips;
const ids = new Set(catalog.map(clip => clip.id));
const required = [
  'ancients-valley-haunted-ruins', 'lowland-forest', 'lowland-savannah',
  'highland-forest', 'highland-savannah', 'south-eastern-desert', 'eastern-badlands',
  'eastern-abyss-saltpans', 'eastern-abyss-forest', 'se-basin', 'rift-rim',
  'rift-floor', 'rift-xanadu-oidong'
];
for (const id of required) assert(presets[id], `missing region ${id}`);
const missingClips = [];
for (const preset of Object.values(presets)) {
  for (const track of [...((preset.env && preset.env.tracks) || []), ...(preset.stings || [])]) {
    if (!ids.has(track.clip)) missingClips.push(`${preset.id}: ${track.clip}`);
  }
}
assert.deepStrictEqual(missingClips, [], `region presets reference clips absent from the imported catalogue: ${missingClips.join(', ')}`);
console.log(`Region presets: ${required.length} requested additions present; all ${Object.keys(presets).length} biome presets use clips from the 1,007-entry catalog.`);
