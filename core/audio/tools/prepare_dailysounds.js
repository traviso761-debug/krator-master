// core/audio/tools/prepare_dailysounds.js
const fs = require('fs');
const path = require('path');

const DL = 'C:/Users/travi/Downloads';
const ROOT = path.join(__dirname, '..', '..', '..');
const AUDIO = path.join(ROOT, '..', 'krator-audio');
const BATCH_NAME = '2026-10-29-dailysounds';
const BATCH_DIR = path.join(AUDIO, 'intake', BATCH_NAME);
const BATCH_AUDIO = path.join(BATCH_DIR, 'audio');

fs.mkdirSync(BATCH_AUDIO, { recursive: true });

function getMp3Duration(filePath) {
  const buf = fs.readFileSync(filePath);
  let offset = 0;
  if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'ID3') {
    const tagSize = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    offset = 10 + tagSize;
  }
  const bitratesV1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const sampleRatesV1 = [44100, 48000, 32000, 0];
  while (offset < buf.length - 4) {
    if (buf[offset] === 0xff && (buf[offset + 1] & 0xe0) === 0xe0) {
      const ver = (buf[offset + 1] >> 3) & 3;
      const layer = (buf[offset + 1] >> 1) & 3;
      const brIdx = (buf[offset + 2] >> 4) & 0x0f;
      const srIdx = (buf[offset + 2] >> 2) & 3;
      if (ver === 3 && layer === 1 && brIdx > 0 && brIdx < 15 && srIdx < 3) {
        const kbps = bitratesV1L3[brIdx];
        const audioBytes = buf.length - offset;
        const dur = (audioBytes * 8) / (kbps * 1000);
        return Math.round(dur * 100) / 100;
      }
    }
    offset++;
  }
  return Math.round((buf.length * 8) / 128000 * 100) / 100;
}

const manifest = [
  {
    fn: 'Airlock_Open_Close_DailySounds.mp3',
    id: 'dailysounds-airlock-open-close',
    title: 'Airlock Pressure Chamber Open and Close',
    category: 'sfx.move',
    tags: ['airlock', 'hatch', 'door', 'pressure', 'pneumatic', 'sci-fi', 'ancients-valley']
  },
  {
    fn: 'Alien_Tools_DailySounds.mp3',
    id: 'dailysounds-alien-tools',
    title: 'Alien Tools Mechanical Whir and Clicks',
    category: 'sfx.interface',
    tags: ['alien', 'tools', 'technology', 'mechanical', 'clicks', 'relic', 'ancients-valley']
  },
  {
    fn: 'Ambulance_Sirens_DailySounds.mp3',
    id: 'dailysounds-ambulance-sirens',
    title: 'Emergency Response Siren Pulse',
    category: 'sfx.interface',
    tags: ['siren', 'alarm', 'emergency', 'warning', 'horn']
  },
  {
    fn: 'Ancient_Activation_DailySounds.mp3',
    id: 'dailysounds-ancient-activation',
    title: 'Ancient Relic Power Activation Hum',
    category: 'raw',
    tags: ['ancient', 'activation', 'relic', 'power', 'energy', 'hum', 'ancients-valley']
  },
  {
    fn: 'Beam_Me_Up_Scotty_Short_DailySounds.mp3',
    id: 'dailysounds-beam-transporter-short',
    title: 'Matter Transporter Beam Hum',
    category: 'sfx.move',
    tags: ['teleport', 'transporter', 'beam', 'energy', 'sci-fi']
  },
  {
    fn: 'Blown_Circut_DailySounds.mp3',
    id: 'dailysounds-blown-circuit',
    title: 'Blown Electrical Circuit Arc and Pop',
    category: 'sfx.impact',
    tags: ['electric', 'circuit', 'short', 'spark', 'arc', 'blown', 'hazard']
  },
  {
    fn: 'Chupacabra_Call_DailySounds.mp3',
    id: 'dailysounds-chupacabra-call',
    title: 'Chupacabra Mutant Predator Shriek Call',
    category: 'sfx.creature',
    tags: ['creature', 'chupacabra', 'screech', 'call', 'mutant', 'predator', 'fauna']
  },
  {
    fn: 'Computer_Talk_DailySounds.mp3',
    id: 'dailysounds-computer-talk',
    title: 'Retro Arcology Computer Data Chatter',
    category: 'sfx.interface',
    tags: ['computer', 'data', 'processing', 'digital', 'terminal', 'sci-fi']
  },
  {
    fn: 'Creepy_Electronic_Scan_DailySounds.mp3',
    id: 'dailysounds-creepy-electronic-scan',
    title: 'Creepy Electronic Radar Sweep Scan',
    category: 'amb.element',
    tags: ['scan', 'radar', 'electronic', 'creepy', 'sweep', 'sensor', 'ancients-valley']
  },
  {
    fn: 'Crowd_Chatter_DailySounds.mp3',
    id: 'dailysounds-crowd-chatter',
    title: 'Settlement Plaza Crowd Chatter',
    category: 'amb.bed',
    tags: ['crowd', 'chatter', 'voices', 'settlement', 'market', 'town', 'people']
  },
  {
    fn: 'Decompression_Hiss_Long_DailySounds.mp3',
    id: 'dailysounds-decompression-hiss-long',
    title: 'Long Pneumatic Decompression Valve Hiss',
    category: 'amb.element',
    tags: ['decompression', 'hiss', 'steam', 'pneumatic', 'valve', 'pressure', 'gas']
  },
  {
    fn: 'Digital_Geiger_Counter_DailySounds.mp3',
    id: 'dailysounds-digital-geiger-counter',
    title: 'Digital Geiger Counter Radiation Clicks',
    category: 'amb.element',
    tags: ['geiger', 'radiation', 'clicks', 'counter', 'toxic', 'hazard', 'ancients-valley']
  },
  {
    fn: 'Dolphins_Solo_DailySounds.mp3',
    id: 'dailysounds-dolphins-solo',
    title: 'Solo Marine Dolphin Whistle',
    category: 'sfx.creature',
    tags: ['dolphin', 'whistle', 'marine', 'ocean', 'water', 'fauna']
  },
  {
    fn: 'Dolphin_Clicks_DailySounds.mp3',
    id: 'dailysounds-dolphin-clicks',
    title: 'Marine Dolphin Echolocation Clicks',
    category: 'sfx.creature',
    tags: ['dolphin', 'clicks', 'echolocation', 'marine', 'sonar', 'fauna']
  },
  {
    fn: 'Firetruck_Sirens_And_Horns_DailySounds.mp3',
    id: 'dailysounds-firetruck-sirens-horns',
    title: 'Industrial Klaxon Alarm and Horn',
    category: 'sfx.interface',
    tags: ['siren', 'horn', 'alarm', 'klaxon', 'warning', 'intruder']
  },
  {
    fn: 'Frogs_Trilling_DailySounds.mp3',
    id: 'dailysounds-frogs-trilling',
    title: 'Wetland Tree Frogs Trilling Chorus',
    category: 'amb.element',
    tags: ['frogs', 'trill', 'wetland', 'swamp', 'hyperjungle', 'nature', 'fauna']
  },
  {
    fn: 'Fuel_Pump_DailySounds.mp3',
    id: 'dailysounds-fuel-pump',
    title: 'Fuel Refinery Mechanism Pump Idle',
    category: 'amb.element',
    tags: ['pump', 'fuel', 'engine', 'industrial', 'machinery', 'motor']
  },
  {
    fn: 'Ghost_Inside_the_Machine_DailySounds.mp3',
    id: 'dailysounds-ghost-inside-the-machine',
    title: 'Ghost in the Machine Resonant Tonal Drone',
    category: 'raw',
    tags: ['ghost', 'machine', 'drone', 'ambient', 'resonance', 'eerie', 'ancients-valley']
  },
  {
    fn: 'Ghost_Ship_Sonar_DailySounds.mp3',
    id: 'dailysounds-ghost-ship-sonar',
    title: 'Derelict Ghost Ship Subsurface Sonar Ping',
    category: 'amb.element',
    tags: ['sonar', 'ping', 'subsurface', 'water', 'ghost-ship', 'eerie', 'echo']
  },
  {
    fn: 'Howling_Coyotes_DailySounds.mp3',
    id: 'dailysounds-howling-coyotes',
    title: 'Pack of Coyotes Midnight Howl Chorus',
    category: 'sfx.creature',
    tags: ['coyotes', 'howl', 'pack', 'predator', 'night', 'savannah', 'fauna']
  },
  {
    fn: 'Jetpack_Ignite_and_Fly_DailySounds.mp3',
    id: 'dailysounds-jetpack-ignite-fly',
    title: 'Jetpack Thruster Ignition and Flight Burn',
    category: 'sfx.move',
    tags: ['jetpack', 'thruster', 'rocket', 'ignition', 'flight', 'propulsion']
  },
  {
    fn: 'Jungle_Owl_DailySounds.mp3',
    id: 'dailysounds-jungle-owl',
    title: 'Canopy Jungle Owl Night Call',
    category: 'sfx.creature',
    tags: ['owl', 'bird', 'jungle', 'night', 'call', 'hyperjungle', 'fauna']
  },
  {
    fn: 'Lightsaber_Energy_Hum_DailySounds.mp3',
    id: 'dailysounds-lightsaber-energy-hum',
    title: 'Plasma Energy Blade Idle Hum',
    category: 'raw',
    tags: ['plasma', 'energy', 'blade', 'hum', 'buzz', 'sci-fi', 'weapon']
  },
  {
    fn: 'Magic_Teleport_Poof_DailySounds.mp3',
    id: 'dailysounds-magic-teleport-poof',
    title: 'Blink Teleport Atmospheric Poof',
    category: 'sfx.impact',
    tags: ['teleport', 'poof', 'magic', 'spell', 'burst', 'whoosh']
  },
  {
    fn: 'Modem_Waiting_for_Connection_DailySounds.mp3',
    id: 'dailysounds-modem-waiting-connection',
    title: 'Analog Data Handshake Line Drone',
    category: 'amb.element',
    tags: ['modem', 'carrier', 'handshake', 'telecom', 'signal', 'static']
  },
  {
    fn: 'Nuclear_Plant_Meltdown_DailySounds.mp3',
    id: 'dailysounds-nuclear-meltdown-klaxon',
    title: 'Reactor Core Critical Meltdown Warning Klaxon',
    category: 'sfx.interface',
    tags: ['meltdown', 'reactor', 'nuclear', 'alarm', 'warning', 'hazard', 'klaxon']
  },
  {
    fn: 'Otter_Whales_DailySounds.mp3',
    id: 'dailysounds-otter-whales',
    title: 'Deep Ocean Whale Song Resonance',
    category: 'sfx.creature',
    tags: ['whale', 'ocean', 'marine', 'deep', 'song', 'call', 'water', 'fauna']
  },
  {
    fn: 'Radar_White_Noise_DailySounds.mp3',
    id: 'dailysounds-radar-white-noise',
    title: 'High-Frequency Radar Static White Noise',
    category: 'amb.element',
    tags: ['radar', 'noise', 'static', 'white-noise', 'hiss', 'radio']
  },
  {
    fn: 'Resturant_Kitchen_Ambiance_DailySounds.mp3',
    id: 'dailysounds-restaurant-kitchen-ambience',
    title: 'Tavern Kitchen Cooking and Clatter Ambience',
    category: 'amb.bed',
    tags: ['kitchen', 'tavern', 'clatter', 'cooking', 'settlement', 'dishes', 'pans']
  },
  {
    fn: 'Single_Frog_Calls_DailySounds.mp3',
    id: 'dailysounds-single-frog-calls',
    title: 'Solitary Marsh Bullfrog Croak',
    category: 'sfx.creature',
    tags: ['frog', 'croak', 'marsh', 'solitary', 'swamp', 'hyperjungle', 'fauna']
  },
  {
    fn: 'SI_FI_Door_Sound_DailySounds.mp3',
    id: 'dailysounds-scifi-blast-door',
    title: 'Heavy Hydraulic Blast Door Slide',
    category: 'sfx.move',
    tags: ['door', 'hydraulic', 'blast-door', 'slide', 'airlock', 'sci-fi']
  },
  {
    fn: 'Solar_Resonanace_DailySounds.mp3',
    id: 'dailysounds-solar-resonance',
    title: 'Deep Solar Flare Harmonic Resonance Bed',
    category: 'music.ambient',
    tags: ['solar', 'resonance', 'harmonic', 'drone', 'space', 'mystic', 'ancients-valley']
  },
  {
    fn: 'Track_Subway_Arrive_Ambiance_DailySounds.mp3',
    id: 'dailysounds-subway-arrive-ambience',
    title: 'Rail Transport Train Platform Arrival',
    category: 'amb.bed',
    tags: ['subway', 'train', 'rail', 'transit', 'station', 'arrival', 'rumble']
  },
  {
    fn: 'Tractor_Won_t_Start_DailySounds.mp3',
    id: 'dailysounds-tractor-wont-start',
    title: 'Combustion Engine Starter Sputter and Choke',
    category: 'sfx.impact',
    tags: ['engine', 'starter', 'sputter', 'choke', 'motor', 'mechanical', 'fail']
  },
  {
    fn: 'Underwater_Ventilator_DailySounds.mp3',
    id: 'dailysounds-underwater-ventilator',
    title: 'Submerged Life Support Ventilator Breathing',
    category: 'amb.element',
    tags: ['underwater', 'ventilator', 'breathing', 'scuba', 'regulator', 'air', 'water']
  },
  {
    fn: 'Vulturing_Vulture_Sounds_DailySounds.mp3',
    id: 'dailysounds-vulture-sounds',
    title: 'Savannah Carrion Vulture Hiss and Screech',
    category: 'sfx.creature',
    tags: ['vulture', 'carrion', 'bird', 'screech', 'scavenger', 'savannah', 'fauna']
  },
  {
    fn: 'Worp_Worp_Alien_Gun_DailySounds.mp3',
    id: 'dailysounds-worp-worp-alien-gun',
    title: 'Energy Blaster Worp Pulse Discharge',
    category: 'sfx.impact',
    tags: ['blaster', 'alien', 'gun', 'laser', 'pulse', 'weapon', 'discharge']
  }
];

const clips = [];

manifest.forEach(item => {
  const src = path.join(DL, item.fn);
  if (!fs.existsSync(src)) {
    console.error('File missing in Downloads:', item.fn);
    return;
  }

  const dst = path.join(BATCH_AUDIO, item.fn);
  fs.copyFileSync(src, dst);

  const dur = getMp3Duration(dst);

  clips.push({
    id: item.id,
    title: item.title,
    creator: 'DailySounds',
    source: `https://dailysounds.org/sound/${encodeURIComponent(item.fn.replace(/_DailySounds\.mp3$/i, '').toLowerCase().replace(/_/g, '-'))}/`,
    file: item.fn,
    license: 'rf-dailysounds',
    licenseText: 'DailySounds Royalty-Free License (free for commercial and game use, no re-sharing)',
    category: item.category,
    tags: item.tags,
    notes: `Downloaded from DailySounds (dailysounds.org). Original filename: ${item.fn}`,
    duration: dur,
    share: false,
    status: 'candidate'
  });
});

const batchDoc = {
  _doc: `Intake batch ${BATCH_NAME}: 37 atmospheric soundscapes, creatures, sci-fi mechanical FX, and foley from DailySounds under royalty-free commercial game license.`,
  batch: BATCH_NAME,
  clips: clips
};

fs.writeFileSync(path.join(BATCH_DIR, 'clips.json'), JSON.stringify(batchDoc, null, 2) + '\n', 'utf8');
console.log(`Successfully prepared ${clips.length} clip records in ${path.join(BATCH_DIR, 'clips.json')}`);
