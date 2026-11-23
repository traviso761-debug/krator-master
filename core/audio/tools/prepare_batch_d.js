// core/audio/tools/prepare_batch_d.js
// Prepares and intakes 14 newly downloaded alien, geiger, space and wildlife sounds from Downloads
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');

const DL = 'C:/Users/travi/Downloads';
const ROOT = path.join(__dirname, '..', '..', '..');
const AUDIO = path.join(ROOT, '..', 'krator-audio');
const BATCH_NAME = '2026-10-29-pixabay-d';
const BATCH_DIR = path.join(AUDIO, 'intake', BATCH_NAME);
const BATCH_AUDIO = path.join(BATCH_DIR, 'audio');

fs.mkdirSync(BATCH_AUDIO, { recursive: true });

const files = [
  {
    fn: 'alex_jauk-distorted-extraterrestrial-message-442714.mp3',
    creator: 'Alex Jauk',
    title: 'Distorted Extraterrestrial Message (Alien Transmission)',
    category: 'sfx.creature',
    tags: ['alien', 'extraterrestrial', 'message', 'transmission', 'radio', 'voice', 'ancients-valley', 'sci-fi']
  },
  {
    fn: 'freesound_community-radio_noise_clicks-77721.mp3',
    creator: 'Freesound Community',
    title: 'Radio Noise Clicks (Geiger Counter Static)',
    category: 'amb.element',
    tags: ['radio', 'noise', 'clicks', 'geiger', 'counter', 'radiation', 'static', 'hazard', 'ancients-valley']
  },
  {
    fn: 'fnx_sound-alien-exoplanetary-vibration-fnx-sound-2025-290898.mp3',
    creator: 'Fnx Sound',
    title: 'Exoplanetary Alien Vibration Bed',
    category: 'raw',
    tags: ['alien', 'exoplanetary', 'vibration', 'drone', 'sub-bass', 'resonance', 'ancients-valley']
  },
  {
    fn: 'fnx_sound-extraterrestrial-souls-in-the-void-287354.mp3',
    creator: 'Fnx Sound',
    title: 'Extraterrestrial Souls in the Void Bed',
    category: 'raw',
    tags: ['extraterrestrial', 'alien', 'void', 'drone', 'mystic', 'ancients-valley']
  },
  {
    fn: 'audiopapkin-ambient-soundscapes-006-space-atmosphere-303245.mp3',
    creator: 'Audiopapkin',
    title: 'Space Atmosphere Drone Bed 006',
    category: 'amb.bed',
    tags: ['space', 'atmosphere', 'drone', 'ambient', 'bed', 'ancients-valley', 'scifi']
  },
  {
    fn: 'audiopapkin-ambient-soundscapes-007-space-atmosphere-304974.mp3',
    creator: 'Audiopapkin',
    title: 'Space Atmosphere Drone Bed 007',
    category: 'amb.bed',
    tags: ['space', 'atmosphere', 'drone', 'ambient', 'bed', 'ancients-valley', 'scifi']
  },
  {
    fn: 'alban_gogh-quot-rainforest-quot-sound-effect-456937.mp3',
    creator: 'Alban Gogh',
    title: 'Rainforest Canopy Atmosphere',
    category: 'amb.bed',
    tags: ['rainforest', 'canopy', 'atmosphere', 'birds', 'hyperjungle', 'nature']
  },
  {
    fn: 'designerschoice-anmlrept_snake-hiss-simulated-vocal_nicholas-judy_tdc-482701.mp3',
    creator: 'Designerschoice',
    title: 'Basilisk Serpent Threat Hiss',
    category: 'sfx.creature',
    tags: ['snake', 'hiss', 'reptile', 'basilisk', 'threat', 'creature', 'fauna']
  },
  {
    fn: 'dragon-studio-frog-croaking-sound-effect-322956.mp3',
    creator: 'Dragon Studio',
    title: 'Swamp Frogs Croaking Chorus',
    category: 'sfx.creature',
    tags: ['frog', 'croaking', 'swamp', 'wetland', 'fauna', 'hyperjungle']
  },
  {
    fn: 'freesound_community-026912_bird-chirping-rainforest-sound-74552.mp3',
    creator: 'Freesound Community',
    title: 'Tropical Birds Chirping Canopy',
    category: 'sfx.creature',
    tags: ['bird', 'chirping', 'tropical', 'rainforest', 'hyperjungle', 'fauna']
  },
  {
    fn: 'freesound_community-062740_creepy-ghost-scream-81907.mp3',
    creator: 'Freesound Community',
    title: 'Creepy Ghost Screech',
    category: 'sfx.creature',
    tags: ['creepy', 'screech', 'scream', 'mutant', 'horror', 'ancients-valley']
  },
  {
    fn: 'phatphrogstudio-basilisk-voice-angry-hissing-growl-roar-519426.mp3',
    creator: 'Phatphrogstudio',
    title: 'Basilisk Angry Hissing Growl & Roar',
    category: 'sfx.creature',
    tags: ['basilisk', 'growl', 'roar', 'hiss', 'predator', 'mutant', 'fauna']
  },
  {
    fn: 'submority-morphed-metal-discharged-cinematic-trailer-sound-effects-124763.mp3',
    creator: 'Submority',
    title: 'Morphed Metal Cinematic Arcology Discharge',
    category: 'raw',
    tags: ['metal', 'arcology', 'discharge', 'impact', 'relic', 'ancients-valley']
  },
  {
    fn: 'vishiv-jungle-and-forest-ambient-atmospheric-effect-433243.mp3',
    creator: 'Vishiv',
    title: 'Jungle & Forest Ambient Atmosphere',
    category: 'amb.bed',
    tags: ['jungle', 'forest', 'ambient', 'atmosphere', 'hyperjungle', 'nature']
  }
];

const clips = [];

for (const item of files) {
  const src = path.join(DL, item.fn);
  if (!fs.existsSync(src)) {
    console.error('File missing in Downloads:', item.fn);
    continue;
  }

  // Parse ID from filename (last number segment before extension)
  const m = item.fn.match(/(\d+)\.mp3$/i);
  const pxId = m ? m[1] : Date.now();
  // Slugify title
  const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const id = `pixabay-${slug}-${pxId}`;

  // Copy to batch audio
  const dst = path.join(BATCH_AUDIO, item.fn);
  fs.copyFileSync(src, dst);

  // Measure duration via ffprobe
  let dur = 10;
  try {
    const raw = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${dst}"`).toString().trim();
    dur = Math.round(parseFloat(raw) * 100) / 100;
  } catch (e) {
    console.warn('ffprobe error on', item.fn, e.message);
  }

  clips.push({
    id: id,
    title: item.title,
    creator: item.creator,
    source: `https://pixabay.com/sound-effects/${slug}-${pxId}/`,
    file: item.fn,
    license: 'rf-pixabay',
    licenseText: 'Pixabay Content License (Royalty-free, commercial game use allowed, no standalone re-sharing)',
    category: item.category,
    tags: item.tags,
    notes: `Downloaded from Pixabay by contributor. Creator: ${item.creator}.`,
    duration: dur,
    share: false,
    status: 'candidate'
  });
}

const batchDoc = {
  _doc: `Intake batch ${BATCH_NAME}: 14 alien transmissions, geiger clicks, space atmospheres and fauna downloaded from Pixabay under the Pixabay Content License.`,
  batch: BATCH_NAME,
  clips: clips
};

fs.writeFileSync(path.join(BATCH_DIR, 'clips.json'), JSON.stringify(batchDoc, null, 2) + '\n', 'utf8');
console.log(`Wrote ${clips.length} clip records to ${path.join(BATCH_DIR, 'clips.json')}`);
