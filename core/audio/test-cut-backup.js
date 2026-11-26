const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'lab', 'template.html'), 'utf8');
const start = source.indexOf('function mergeSavedCutsForBackup(');
const end = source.indexOf('\n}', start) + 2;
assert(start >= 0 && end > start, 'backup merge helper must exist in the lab template');
const mergeSavedCutsForBackup = new Function(`return (${source.slice(start, end)})`)();
const local = [{ id: 'local-a', name: 'Local cut' }, { id: 'same-id', name: 'Local copy' }];
const shared = [{ id: 'shared-b', name: 'Shared cut' }, { id: 'same-id', name: 'Shared duplicate' }];
const result = mergeSavedCutsForBackup(local, shared);
assert.deepStrictEqual(result.map(c => c.id), ['local-a', 'same-id', 'shared-b']);
assert.strictEqual(result.find(c => c.id === 'same-id').name, 'Local copy', 'the local copy should be retained on duplicate IDs');
console.log('Cut backup: includes local and shared cuts, with duplicate IDs kept once.');
