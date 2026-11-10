const fs = require('fs');

const lines = fs.readFileSync('core/audio/tools/sonniss_entries.csv', 'utf8').split('\n').filter(Boolean);
const files = [];

for (let i = 1; i < lines.length; i++) {
  const m = lines[i].match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
  if (!m) continue;
  const vals = m.map(v => v.replace(/^,?"?|"$/g, '').replace(/""/g, '"').trim());
  const archive = vals[0];
  const name = vals[1];
  const path = vals[2];
  const length = parseInt(vals[3] || '0', 10);
  const dir = path.split('/')[0] || '';
  files.push({ archive, name, path, length, dir });
}

// Group files by vendor/collection
const byDir = {};
files.forEach(f => {
  if (!byDir[f.dir]) byDir[f.dir] = [];
  byDir[f.dir].push(f);
});

// Detailed target queries:
const queries = {
  electronic_ancients: [
    'InMotionAudio - GEODRONE',
    'InMotionAudio - Morse Code',
    'InMotionAudio - Sinister Textures 1',
    'BluezoneCorp - Alien Interface',
    'BluezoneCorp - Alien Tripod',
    'BluezoneCorp - Futuristic User Interface',
    'BluezoneCorp - High Voltage',
    'BluezoneCorp - Retrofuturistic Computer',
    'BluezoneCorp - Steampunk Machines',
    'BluezoneCorp - Tiny Gears - Small Mechanism',
    'Bolt - ARP 2600- Droids, Blips, Drones & more',
    'DavidDumais - Robotic Creatures Sound FX',
    'Dynamedion - Sci-Fi Technology',
    'Epic Stock Media - Blockbuster Cyberpunk',
    'Epic Stock Media - Sci-Fi Energy Weapons',
    'Epic Stock Media - Sci-Fi Evolution',
    'Epic Stock Media - Sci-Fi Motion & Drones',
    'Fugitive Sound - Electromagnetic Textures',
    'Glitchmachines - Cybernetics',
    'Glitchmachines - Fragment',
    'Glitchmachines - Idiom',
    'Glitchmachines - Microsound',
    'Justsoundeffects - Futuristic Weapons',
    'Mechanical Wave - Electromagnetic Fields',
    'Mindsound - Cyberpunk Drones',
    'Mindsound - Data Processing',
    'Mindsound - Sci-Fi Ambience',
    'Mindsound - Sci-Fi UI',
    'Rescopic Sound - High Voltage',
    'Rescopic Sound - Sci-Fi Elements',
    'SoundMorph - Dark Dimensions',
    'SoundMorph - Robotic Lifeforms',
    'SoundMorph - Wavefront',
    'Unreal SFX - Battle Droid',
    'Used Bin Loops - Lo-Tech Premium Degraded Tape FX'
  ],
  beats_music: [
    'BluezoneCorp - Modern Cinematic Impact',
    'Epic Stock Media - Blockbuster Trailer Percussion',
    'Justsoundeffects - Taiko Drums',
    'Mechanical Wave - Sound Effects Collection',
    'Orbital Emitter - Cinematic Transitions for Editors Volume 2',
    'Pole Position - The Guitaresque Power Tools Library',
    'Pole Position - The Metal Hit Sweeteners Library',
    'Rescopic Sound - High Voltage',
    'SoundMorph - Dark Dimensions',
    'Used Bin Loops - Lo-Tech Premium Degraded Tape FX',
    'TheWorkRoom Audio Post - Music Spill',
    'Jake Fielding - Haunted Metal Vol.3 - Cinematic Tones & Textures'
  ],
  hyperjungle: [
    'Justsoundeffects - Forest Ambiences',
    'Justsoundeffects - Animals',
    'Bolt - Berlin Vignettes - Ambiences and Sonic Curiosities',
    'Bolt - Immersive Creek -  Ambisonic Recordings of Undisturbed Creeks in Vermont',
    'DavidDumais - Robotic Creatures Sound FX',
    'Free To Use Sounds - Wildlife & Jungle',
    'Mindsound - Rainforest',
    'Pole Position - Birds of Costa Rica',
    'Pole Position - Jungle Night',
    'SoundMorph - Creature Dialogue',
    'UberDuo - Horsin'
  ],
  desert_arabian_oud: [
    'BluezoneCorp - Stone Impact',
    'Justsoundeffects - Wind',
    'Pole Position - Sand & Dust Foley',
    'Free To Use Sounds - Desert Winds',
    'UberDuo - Horsin',
    'Cactuzz Sound - Camel'
  ],
  violin_iziz: [
    'Pole Position - The Guitaresque Power Tools Library',
    'Jake Fielding - Haunted Metal Vol.3 - Cinematic Tones & Textures',
    'Used Bin Loops - Lo-Tech Premium Degraded Tape FX',
    'Mechanical Wave - Sound Effects Collection'
  ],
  woodwinds_voth: [
    'Justsoundeffects - Wind',
    'Free To Use Sounds - Whistling Caves',
    'Rescopic Sound - High Voltage',
    'SoundMorph - Dark Dimensions'
  ],
  metal_guitar_beastrider: [
    'Pole Position - The Guitaresque Power Tools Library',
    'Used Bin Loops - Lo-Tech Premium Degraded Tape FX',
    'Jake Fielding - Haunted Metal Vol.3 - Cinematic Tones & Textures',
    'Mechanical Wave - Sound Effects Collection'
  ],
  tibetan_asian_xanadu: [
    'Mechanical Wave - Sound Effects Collection',
    'Orbital Emitter - Cinematic Transitions for Editors Volume 2',
    'Bolt - Berlin Vignettes - Ambiences and Sonic Curiosities',
    'Free To Use Sounds - Singing Bowls',
    'Free To Use Sounds - Temple Gongs'
  ]
};

console.log('--- ALL COLLECTIONS IN SONNISS 2024 ---');
Object.keys(byDir).sort().forEach(d => {
  console.log(`${d} (${byDir[d].length} files)`);
});
