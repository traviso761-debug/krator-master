const fs = require('fs');
const html = fs.readFileSync('../krator-audio/lab/index.html', 'utf8');

const dataMatch = html.match(/const DATA = (\{[\s\S]*?\});\s*const \$/);
const DATA = JSON.parse(dataMatch[1]);
console.log('Total DATA clips in Lab:', DATA.clips.length);

function testSearch(query) {
  let filt = { q: query, cat: '', lic: '', status: '', len: '', tags: [] };
  const SEARCH_ALIASES = { 'alient': 'alien', 'taking': 'talking', 'geiger': 'geiger', 'rad': 'radiation', 'soundscape': 'soundscapes' };
  const normSearchToken = w => SEARCH_ALIASES[w] || w;
  const words = filt.q.toLowerCase().split(/\s+/).filter(Boolean);
  const res = DATA.clips.filter(c => {
    if (words.length) {
      const hay = [c.id, c.title, c.user, c.note, c.tags.join(' '), c.category, c.src].join(' ').toLowerCase();
      for (const rawW of words) {
        const w = normSearchToken(rawW);
        if (!hay.includes(rawW) && !hay.includes(w)) {
          if (w.length >= 5) {
            const prefix = w.slice(0, 4);
            if (!hay.includes(prefix)) return false;
          } else {
            return false;
          }
        }
      }
    }
    return true;
  });
  console.log(`\nSearch "${query}": ${res.length} matches`);
  res.slice(0, 6).forEach(c => console.log('   *', c.id, '->', c.title, '[' + c.tags.join(', ') + ']'));
}

testSearch('alien talking');
testSearch('alient taking');
testSearch('geiger counter');
testSearch('geiger');
testSearch('alien');
testSearch('space atmosphere');
testSearch('radio clicks');
testSearch('extraterrestrial');
