const fs = require('fs');
const html = fs.readFileSync('../krator-audio/lab/index.html', 'utf8');

const m = html.match(/const DATA = (\{[\s\S]*?\});\s*const \$/);
const DATA = JSON.parse(m[1]);

const query = 'alien';
const words = [query];
const matching = DATA.clips.filter(c => {
  const hay = [c.id, c.title, c.user, c.note, c.tags.join(' '), c.category, c.src].join(' ').toLowerCase();
  return words.every(w => hay.includes(w));
});

console.log('Total clips matching "alien":', matching.length);

const theFive = [
  '275682',
  '287651',
  '291370',
  '312011',
  '487681'
];

theFive.forEach(id => {
  const c = DATA.clips.find(x => x.id.includes(id));
  console.log('\nID', id, 'in Lab DATA.clips:', !!c);
  if (c) {
    console.log('   id:', c.id);
    console.log('   title:', c.title);
    console.log('   user:', c.user);
    console.log('   category:', c.category);
    console.log('   tags:', c.tags);
    console.log('   matches search "alien":', matching.some(x => x.id === c.id));
  }
});
