const fs = require('fs');
const html = fs.readFileSync('../krator-audio/lab/index.html', 'utf8');

const m = html.match(/const DATA = (\{[\s\S]*?\});\s*const \$/);
const DATA = JSON.parse(m[1]);
console.log('Total DATA.clips in lab index.html:', DATA.clips.length);

const SEARCH_ALIASES = {
  'alient': 'alien', 'taking': 'talking', 'geiger': 'geiger', 'rad': 'radiation', 'soundscape': 'soundscapes'
};
function normSearchToken(w) { return SEARCH_ALIASES[w] || w; }

function search(query) {
  const rawQ = query.toLowerCase().trim();
  const words = rawQ ? rawQ.split(/[\s_/-]+/).filter(Boolean) : [];
  return DATA.clips.filter(c => {
    if (words.length) {
      const hay = [
        c.id, c.title, c.user, c.note, c.tags.join(' '), c.category, c.src,
        c.page || '', c.origFile || '', c.file || ''
      ].join(' ').toLowerCase();
      const hayNorm = hay.replace(/[-_./]/g, ' ');
      for (const rawW of words) {
        const w = normSearchToken(rawW);
        const match = hay.includes(rawW) || hay.includes(w) || hayNorm.includes(rawW) || hayNorm.includes(w);
        if (!match) {
          if (w.length >= 5) {
            const prefix = w.slice(0, 4);
            if (!hay.includes(prefix) && !hayNorm.includes(prefix)) return false;
          } else {
            return false;
          }
        }
      }
    }
    return true;
  });
}

const queries = [
  'alien_i_trust',
  'fnx_sound',
  'artificiallyinspired',
  'dragon-studio',
  '312011',
  '287651',
  'slime-alien',
  'deep-sea-alien',
  'geiger counter',
  'alient taking',
  'alien_i_trust-rhythmic-tribal-groove',
  'fnx_sound-robo-alien-menace',
  'artificiallyinspired-alien-talking-312011',
  'dragon-studio-deep-sea-alien-sound-487681'
];

queries.forEach(q => {
  const res = search(q);
  console.log(`\nQuery "${q}": ${res.length} matches`);
  res.slice(0, 3).forEach(c => {
    console.log(`  -> [${c.category}] "${c.title}" by ${c.user} (orig: ${c.origFile})`);
  });
});
