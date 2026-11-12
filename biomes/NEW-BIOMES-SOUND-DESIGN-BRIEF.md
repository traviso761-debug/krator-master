# Audio Intake & Sound Design Brief: The New Biomes of Krator
**Target Audience**: Sound Designers, Audio Engineers, Intake Agents (Gemini, Claude, Autonomous Audio Agents), and Human Recordists.  
**Project**: *Krator* (Commercial Project).  
**Audio Engine Architecture**: `core/audio` (Audio Lab, `KCUE` director, Godot 4.x export pipeline).  
**Master Intake Path**: [`C:\Users\travi\Documents\krator-master\core\audio\intake\BRIEF.md`](file:///C:/Users/travi/Documents/krator-master/core/audio/intake/BRIEF.md).  
**Last Updated**: October 2026.

---

## 1. Legal & Intake Policy (Strict Commercial Standards)

Krator is a **commercial release**. Every sound asset entering the library must be explicitly cleared for commercial use. We strictly attribute every creator whose license requires it via automated credit generation.

### License Decision Matrix

| Verdict | License / Source Type | Action Required |
| :--- | :--- | :--- |
| **YES** | **CC0 1.0** ("Public Domain Dedication", "No Rights Reserved") | Permitted. Credit recorded as courtesy. |
| **YES** | **US Federal Government Work** (NPS, USFWS, USGS, NOAA, USDA, NASA) | Permitted (Public Domain by US Law). |
| **YES** | **Pre-1923 Historical Recording** | Permitted (Public Domain by age). |
| **YES** | **CC BY 3.0 / 4.0** ("Attribution" only) | **Permitted with mandatory attribution**. Name, creator, source URL, and license must be recorded. |
| **YES** | **Royalty-Free Commercial** (Sonniss GDC, Free To Use Sounds, Mixkit, Pixabay) | Permitted in game build only. Source raw files stay private on disk and are never published to public repos. |
| **STRICT NO** | **CC BY-NC / NonCommercial** (e.g. standard Xeno-canto, Freesound non-commercial) | **REJECT IMMEDIATELY**. The game is sold. |
| **STRICT NO** | **CC BY-ND / NoDerivatives** | **REJECT IMMEDIATELY**. Every audio asset is cut, layered, pitch-shifted, and filtered. |
| **STRICT NO** | **CC BY-SA / ShareAlike** | **REJECT IMMEDIATELY**. Enforces copyleft on the game's audio package. |
| **STRICT NO** | **BBC Sound Effects / Macaulay Library** | **REJECT IMMEDIATELY**. Non-commercial / restricted educational licensing. |
| **STRICT NO** | **Uncredited Compilations / YouTube Rips / Re-uploads** | **REJECT IMMEDIATELY**. Original recordist must be verified at source. |

> [!IMPORTANT]
> **Source Verification Rule**: Always inspect the license on the specific asset's canonical landing page—never rely on search engine summaries or compilation playlists. If a clean commercial license cannot be independently verified, the clip is rejected.

---

## 2. Handover Workflow & Directory Conventions

Audio binaries are kept outside the code repository. New intake batches must be delivered into:
```
C:\Users\travi\Documents\krator-audio\intake\<YYYY-MM-DD>-<agent-name>\
  ├── audio\
  │     ├── <id>.mp3  (or .ogg, .wav, .flac; < 6 MB per clip)
  │     └── ...
  └── clips.json
```

### JSON Schema for `clips.json`
Every intake file must have a corresponding entry in `clips.json`:
```json
[
  {
    "id": "fs-528419",
    "file": "audio/fs-528419.mp3",
    "title": "Subterranean Geothermal Mud Pot Boiling",
    "creator": "geosound_artist",
    "source": "https://freesound.org/s/528419/",
    "license": "cc0",
    "licenseText": "Creative Commons 0",
    "attribution": "",
    "category": "amb.element",
    "tags": ["siphon-pits", "geothermal", "mudpot", "boiling", "viscous"],
    "duration": 48.2,
    "notes": "Thick, viscous bubbling mud cauldrons for Maar crater floors and Siphon vent throats."
  }
]
```

### Ingestion Validation
Run the catalog intake tool to validate licenses and ingest approved clips into `krator-audio/library/`:
```bash
node core/audio/tools/catalog.js intake <batch-folder-name>
```

---

## 3. Krator Planetary Physics & Acoustic Engine Rules

Krator is an ancient, tidally flexed heat-pipe world orbiting a turquoise gas giant. Its environmental acoustics differ fundamentally from Earth:

1. **Barometric Air Density & Pitch Propagation ($P(h) = 1.6 \cdot \exp(-h/8000)$)**:
   - **Deep Basins & Sinks ($+200\text{ to }+800\text{ m}$, $1.45\text{--}1.56\text{ atm}$)**: Dense, hyperbaric atmosphere amplifies low frequencies (20–120 Hz). Acoustic velocity is higher; bass travels further with physical chest-thumping resonance. High frequencies dissipate slightly faster. Sound feels thick, humid, and heavy.
   - **High Highland Passes ($+2,500\text{ to }+3,200\text{ m}$, $1.05\text{--}1.15\text{ atm}$)**: Earth-normal atmospheric pressure, sharp acoustic edges, high-velocity venturi wind shears.
   - **Periglacial Summits & Rims ($>+4,500\text{ m}$, $<0.8\text{ atm}$)**: Thin, hypoxic, whispering air. Sound carries poorly; distant sounds are muted and thin. The soundscape is dominated by dry whistling katabatic gales and eerie proximity silence.

2. **Tectonic & Geothermal Heat-Pipe Resonance**:
   - Subterranean magma degassing, phreatic steam chambers, and hydro-acoustic siphons continuously transmit sub-audible low-frequency rumble (15–40 Hz) through bedrock.

3. **Vertebrate-Grade Hexapod Fauna**:
   - Krator native fauna are **vertebrate-grade hexapods, NOT insects**.
   - Creature acoustics must avoid generic mammalian lions/wolves or tiny terrestrial bugs. Use low-frequency infrasonic rumbles, cassowary thuds, deep reptilian barks, resonant thoracic valve hisses, and syrinx whistling.

4. **The 4-Layer Sound Architecture**:
   - **Layer 1: Background Bed (`amb.bed`)** — Seamless long looping environmental atmosphere (Day, Night, Wind/Storm).
   - **Layer 2: Local Fluid / Geothermal Texture (`amb.element`)** — Placed positional emitters (vent steam, boiling mud, surf, river rapids, glacial ice groans).
   - **Layer 3: Locomotion / Foley (`sfx.move`)** — Crisp footsteps by substrate (calcified sinter, pumice ash, wet basalt gravel, brittle salt polygons, quartz loess).
   - **Layer 4: Accent / Event / Creature (`sfx.creature` / `amb.element`)** — Alien fauna vocalizations, rockfalls, phreatic steam bursts, serac ice calving.

---

## 4. Master Sound Design Brief: The New Biomes

### 1. Loom-Chasms (`Loom Chasms`, was `Region 99`: Weavers' Cradle & Deep Warp Sink)
* **Geological Identity**: Massive enclosed extensional tectonic basin ($386,000\text{ km}^2$) stepped down from $+2,200\text{ m}$ loess piedmont to $+480\text{ m}$ hypersaline playa (`Lake Nim`) and $+240\text{ m}$ graben trenches. Bounded by basalt horst pylons, wind-excavated yardangs, and Mount Caelum resurgent dome.
* **Atmospheric Pressure**: $1.20\text{ atm}$ (benches) $\to 1.50\text{ atm}$ (deep chasm floors).
* **Climate & Weather**: Arid rain shadow (`BWk`/`BSk`). Hot dry daytime winds, freezing clear desert nights, blinding dust devils.
* **Sub-Zones & Acoustic Identities**:
  1. **Weavers' Cradle (Western Loess Piedmont, $+1,800\text{..}+2,200\text{ m}$)**:
     - *Sonic Bed*: Dry, golden steppe breeze sweeping across high loess benches; soft rustle of drought-resistant bunchgrass and silken weaver-spore tendrils.
     - *Foley*: Soft, powdery footstep crunch in deep, flour-like loess dust and fine dry silt.
     - *Settlement Foley (Ostrukh-on-Water & Spindle Fan)*: Creak of massive wooden tension looms, hydraulic drip of irrigation canals fed by Mount Caelum meltwater, low rhythmic grinding of stone grain querns, wooden hexapod draft harnesses.
  2. **The Deep Warp Chasms & Horsts ($+550\text{..}+750\text{ m}$)**:
     - *Sonic Bed*: Dense, heavy barometric drone; wind funneled between $180\text{ m}$ vertical basalt cliffs producing deep acoustic resonance; hollow whipping gusts.
     - *Elements*: High-pitched whistling and fluting as sand-laden winds scour through razor-sharp yardangs and basalt needles ("The Weaver's Harp").
  3. **Lake Nim Hypersaline Sump (+480 m)**:
     - *Sonic Bed*: Ominous, heat-baked silence over glistening white halite playa; faint crackle of thermal salt-crust expansion under scorching noon sun.
     - *Foley*: Sharp, crystalline crunch of player boots breaking through brittle salt crust into thick, viscous hypersaline brine mud.
* **Creature Acoustic Targets**:
  - *Weaver Strider*: Heavy, rhythmic, padded three-beat gait of tall hexapods traversing loess; low resonant thoracic click-humming.
  - *Chasm Darter*: High-frequency descending trills echoing off canyon walls, produced by membranous throat sacs.

---

### 2. Siphon Pits (`Region 98`: Maar Diatreme Swarm & Ostrukh Terraces)
* **Geological Identity**: High basalt plain ($+4,250\text{ m}$ datum) pocked with 36 explosive phreatomagmatic maar craters and ring-fault magma-drainage pit sinks. Floor basins drop to $+2,000\text{..}+2,300\text{ m}$ hosting Lake Ostrukh and active hydrothermal siphons.
* **Atmospheric Pressure**: $0.94\text{ atm}$ (high plateau) $\to 1.25\text{ atm}$ (maar floors).
* **Climate & Weather**: Subalpine cold steppe (`BSk`/`ET`) transitioning to geothermal microclimates. Frequent dense sulfur fog, icy katabatic night winds, thermal ground steam.
* **Sub-Zones & Acoustic Identities**:
  1. **The Maar Diatreme Amphitheaters**:
     - *Sonic Bed*: Echoing, bowl-shaped acoustic cavities. Wind whistling over knife-edge crater arêtes ($6\text{ m}$ wide basalt razorbacks) while the interior basin floor is eerily sheltered and still.
     - *Elements*: Visceral subterranean "thump-whoosh" of hydrothermal gas burps venting through deep maar mud; continuous low-frequency hum of boiling subsurface conduits.
  2. **Siphon Vent Nodes & Boiling Pots**:
     - *Elements*: Thick, viscous glooping and rhythmic bubbling of mineral-rich mud cauldrons; high-pressure steam venting through wet basalt talus fissures with a metallic, razor-sharp hiss.
     - *Subterranean Drainage*: Wet, slurping hydro-acoustic gurgles as drainage water is pulled downward into active volcanic siphons.
  3. **High Basalt Scoria Plains**:
     - *Foley*: Gritty, hollow crunch of walking on porous vesicular basalt scoria, loose volcanic cinders, and crunchy caliche gravel.
* **Creature Acoustic Targets**:
  - *Siphon-Tree Symbiont*: Low-frequency rumbling purr vibrating through root trunks anchored in warm geothermal vents.
  - *Scoria Burrower*: Dry scuttling and clicking of heavy keratinous limbs against porous basalt rock; deep guttural warning snarl.

---

### 3. Region 101 (The Breached Diatremes & Siphon Collision Corridor)
* **Geological Identity**: Direct collision zone between extensional rift grabens of Loom-Chasms and explosive maar diatremes of Siphon Pits. Zero mountain barriers. Massive $1,500\text{ m}$ hydraulic head pulling water northward into subterranean basalt karst conduits.
* **Atmospheric Pressure**: $1.15\text{..}+1.28\text{ atm}$.
* **Climate & Weather**: Arid steppe wind corridor (`BSk`). High-velocity dust funnels, thermal steam mixing with dry cold air.
* **Acoustic Profile**:
  1. **The Breached Diatreme Corridors**:
     - *Sonic Bed*: Dynamic wind tunnel. Winds from Loom-Chasms collide with high plateau air, creating turbulent, gusting shear whistles through breached volcanic caldera rims.
  2. **Subterranean Swallow Sinks (*The Siphon Ponors*)**:
     - *Elements*: Terrifying acoustic signature of rushing water suddenly plunging into dark, bottomless basalt fissures; deep resonant subterranean booming, echoing waterfalls in subterranean vaults.
  3. **The Needle Gorges (Silicified Porcelainite Yardangs)**:
     - *Elements*: High-velocity desert wind vibrating against porcelainite chert needles, producing eerie chordal drone tones ("The Lithophone Canyon").
     - *Foley*: Sharp, glass-like clatter and high-pitched chink of shattered silica porcelainite flakes beneath boots.

---

### 4. Stalker Gate (`Region 102`: Alpine Shear Defiles & Lake Vapora)
* **Geological Identity**: Strategic 4-way transtensional graben pass network slicing through the gargantuan $+14,000\text{ m}$ Stalker Massif. Graben floors sit at $+1,680\text{ to }+2,450\text{ m}$ (`1.08–1.30 atm`), flanked by $+6,000\text{ m}$ jagged basalt horsts. Hosts Lake Vapora geothermal caldera.
* **Atmospheric Pressure**: Breathable $1.08\text{--}1.30\text{ atm}$ in pass troughs; rapidly dropping to lethal $<0.6\text{ atm}$ on flanking walls.
* **Climate & Weather**: Violent wind corridor; adiabatic foehn warming on eastern descents (`BSk`/`Csb`); perpetual freezing mist and steam plumes around Lake Vapora.
* **Sub-Zones & Acoustic Identities**:
  1. **The Snaky Defiles & Relay Passes**:
     - *Sonic Bed*: Shrieking alpine gales shearing through narrow, twisting, $300\text{ m}$-wide basalt slots; venturi whistling; intermittent roaring downdrafts.
     - *Elements*: Sudden clattering scree slides and tumbling rock fragments triggered by high winds on sheer headwalls; basalt frost-wedging fractures (sharp explosive snaps).
     - *Foley*: Unstable basalt talus crunch, shifting loose angular scree, hollow echoing footsteps against sheer vertical canyon walls.
  2. **Lake Vapora Geothermal Caldera (+2,180 m)**:
     - *Sonic Bed*: Constant roar of boiling thermal waters shrouded in perpetual white steam; warm, wet, hiss-laden atmosphere contrasting sharply with freezing winds above.
     - *Elements*: Rhythmic surging of submerged hot springs; static electrical crackling in dense mineralized steam plumes.

---

### 5. High Rift (`Region 100`: Propagating Graben Staircase & Opaline Cataract)
* **Geological Identity**: Eastern propagating tip of the Great Rift system climbing toward Siphon Pits. Stepped tectonic graben staircase ($+2,250\text{ m} \to +3,100\text{ m} \to +4,150\text{ m}$) bisected by the Dorsal Wedge horst. Hosts the roaring Opaline Sinter Cataract and boiling mineral acid pools (Lakes Verdigris & Cinnabar).
* **Atmospheric Pressure**: $0.95\text{ to }1.21\text{ atm}$.
* **Climate & Weather**: Subalpine rift climate (`Dfb`/`Dsc`/`ET`). Freezing spray, steaming geothermal valleys, crisp highland sunlight.
* **Acoustic Profile**:
  1. **The Opaline Sinter Cataract**:
     - *Elements*: Thunderous, heavy water roar of a $180\text{ m}$ multi-tiered waterfall cascading over terraced silica sinter basins; fine spray hissing continuously over hot rocks; deep ground-tremor vibrations.
  2. **Boiling Acid Pools (Lake Verdigris & Lake Cinnabar)**:
     - *Elements*: Simmering, spitting mineral soup; high-frequency alkaline sizzle; periodic pressurized steam releases through silica crusts.
     - *Foley*: Slick, wet crunch of stepped silica terraces, glassy sinter shelf fractures, squelching warm mineral clay.
  3. **The Singing Gjár (Axial Fissure Relay)**:
     - *Sonic Bed*: Wind blowing transversely across deep, narrow tectonic fissures creating deep organ-pipe resonances (30–60 Hz continuous drone).

---

### 6. Ria River Valley & Double Delta (North / NW Expansion)
* **Geological Identity**: Massive continental fluvial drainage. Graded alluvial river valley incised into crystalline basement rock, meandering levees, expansive riparian floodplain, and a colossal braided double delta discharging into the Steaming Sea at $0\text{ m}$ datum.
* **Atmospheric Pressure**: Heavy, dense maritime atmosphere ($1.55\text{--}1.60\text{ atm}$).
* **Climate & Weather**: Humid temperate to subtropical maritime (`Cfa`/`Cfb`). Heavy coastal rains, morning river fog, warm oceanic breezes.
* **Acoustic Profile**:
  1. **The Great Ria River Channel**:
     - *Sonic Bed*: Deep, surging, broad river current; rhythmic sloshing against muddy cut-banks and silt terraces; rustling riverine reeds and gallery forest canopy.
     - *Elements*: Swirling eddy vortices, leaping river hexapods splashing in deep channels, hollow water drips from overhanging mosses.
  2. **The Double Delta & Steaming Sea Estuary**:
     - *Sonic Bed*: Interlocking braided sandbars meet rolling oceanic tidal swells; distant rhythmic ocean breakers; wet, salt-laden coastal breeze.
     - *Foley*: Squelching alluvial silt, suction mud, wet gravel bars, wading through shallow brackish estuarine water.
* **Creature Acoustic Targets**:
  - *Delta Skimmer*: Breathy, multi-tonal whistling cries echoing across vast open tidal flats.
  - *Mud-Gilled Hexapod*: Visceral low-pitch gulping, water-expelling bellows from submerged reed-bed dens.

---

### 7. The Crook & Copper Glacier (West Expansion)
* **Geological Identity**: Alpine-to-polar glacial valley carved into the western cordillera. Immense cirques, knife-edge arêtes, pyramidal horns, U-shaped glacial trough with truncated spurs, lateral/terminal moraine loops, outwash gravel plain (*sandur*), and a turquoise proglacial tarn at $+2,180\text{ m}$.
* **Atmospheric Pressure**: $1.10\text{ atm}$ (valley floor) $\to 0.70\text{ atm}$ (horns).
* **Climate & Weather**: Subpolar highland / glacial (`ET`/`EF`). Howling katabatic winds, freezing blizzards, blinding glacial glare, sub-zero temperatures.
* **Acoustic Profile**:
  1. **Glacial Ice Tongue & Crevasses**:
     - *Sonic Bed*: Sub-audible, bone-chilling structural groan of creeping glacial ice under colossal pressure; deep, ominous bass reverberations.
     - *Elements*: Sudden, explosive, gunshot-like reports of crevasse fracture propagation; distant booming crashes of seracs calving into moraine rubble.
  2. **Proglacial Tarn & Braided Sandur**:
     - *Elements*: Rushing milky glacial meltwater laden with abrasive stone flour; hollow dripping inside blue subglacial ice caverns; clinking of rounded granitic river stones rolling along the bed.
     - *Foley*: Crisp crunch of compacted firn snow, jagged glacial ice cleats, wet unstable moraine gravel.

---

### 8. The Arch & Exposed Seamounts (NW Continental Margin)
* **Geological Identity**: Volcanic-tectonic marine arc. Massive arcuate rift ridge emerging from the deep ocean, drowned caldera rings, steep-sided volcanic guyots, sheer basalt sea-stacks, and littoral lava-ocean interaction zones.
* **Atmospheric Pressure**: Full sea-level datum ($1.58\text{--}1.60\text{ atm}$).
* **Climate & Weather**: Hyper-dynamic oceanic climate (`Csb`/`Cfb`). Stormy maritime gales, violent tidal surges, billowing steam clouds.
* **Acoustic Profile**:
  1. **Basalt Sea-Stacks & Swell**:
     - *Sonic Bed*: Colossal oceanic breakers colliding violently with sheer columnar basalt cliffs; deep hydraulic compression booms as waves slam into sea-caves and blowholes.
     - *Elements*: Shrill spray of blowhole spouts; shrieking maritime winds deflected upward by vertical sea-cliffs.
  2. **Littoral Thermal & Phreatomagmatic Vents**:
     - *Elements*: Violent, crackling steam explosions where hot basaltic dikes meet seawater; explosive laze venting; boiling coastal surf bubbling frantically around steaming black rock shelves.
     - *Foley*: Wet, barnacle-encrusted basalt ledges; slippery kelp-mat walking; splashing heavy coastal surf.

---

### 9. The Arachnoid Network (NW Continental Interior)
* **Geological Identity**: Concentric volcano-tectonic ring grabens and radial fracture dike swarms on an elevated basaltic plateau. Stepped circular fracture rings separated by volcanic shield ridges.
* **Atmospheric Pressure**: $1.25\text{--}1.35\text{ atm}$.
* **Climate & Weather**: Arid continental interior (`BSk`/`BWk`). Hot daytime solar heating, rapid radiant cooling at night, thermal dust whirlwinds.
* **Acoustic Profile**:
  1. **Concentric Ring Scarps & Graben Floors**:
     - *Sonic Bed*: Hollow, expansive acoustic signature; wind whistling across broad volcanic flatirons; rhythmic slapback echo between concentric circular fault scarps.
     - *Elements*: Subterranean tectonic settling groans; deep degassing hum from radial fissure vents.
     - *Foley*: Sharp clatter of black obsidian flakes and volcanic vitrophyre sheets ringing like glass underfoot.

---

### 10. NE Tharn Cold Plateau & North Shield (Far North Expansion)
* **Geological Identity**: Ancient continental cratonic shield and permafrost plateau. Flat, endless horizons, cryogenic patterned ground (stone circles and ice-wedge polygons), desolate boulder fields (*felsenmeer*).
* **Atmospheric Pressure**: $0.98\text{--}1.15\text{ atm}$.
* **Climate & Weather**: High-latitude sub-zero steppe / tundra (`ET`). Hyper-dry katabatic spindrift, bone-chilling howling gales, prolonged twilight.
* **Acoustic Profile**:
  1. **The Cryogenic Steppe**:
     - *Sonic Bed*: Eerie, barren, desolate wind howling uninterrupted across thousands of square kilometers of flat permafrost; thin high-frequency hiss of dry ice crystals scouring frozen ground.
     - *Elements*: Violent, sudden thermal frost-cracking of frozen bedrock (sharp metallic cracks); utter, dead silence between gusts.
     - *Foley*: Frozen, hollow thud of boots on permafrost turf; brittle snapping of frozen dwarf lichen; clinking of frost-shattered stone polygons.

---

## 5. Intake Search Queries & Processing Directives

When searching Freesound, NPS, USGS, or royalty-free commercial packs for Krator intake, use these targeted query combinations:

### Query Term Matrix

| Biome Target | High-Yield Search Queries | Recommended Processing & Pitch Directives |
| :--- | :--- | :--- |
| **Loom-Chasms** | `desert canyon wind`, `yardang whistling`, `salt flat crust walk`, `loess dust slide`, `hypersaline bubbling` | High-shelf cut above 10 kHz to simulate dense air; add 30-50ms slapback delay for canyon walls. |
| **Siphon Pits** | `mudpot boiling`, `geothermal vent steam`, `fumarole hiss`, `volcano crater wind`, `caliche crunch` | Pitch mudpots down 5–8 semitones for viscous scale; layer low sine sub-bass (35 Hz) under vent roars. |
| **Region 101** | `water swallow hole`, `underground waterfall`, `karst cave echo`, `chert rock footsteps`, `venturi wind pass` | Layer cave hydro-acoustics with whistling slot-canyon wind; enhance high-mid clinks for chert. |
| **Stalker Gate** | `mountain pass gale`, `alpine wind tunnel`, `scree slope slide`, `rockfall talus`, `geothermal lake boiling` | Extreme stereo panning on wind gusts; pitch rockfall down 4 semitones to give massive scale. |
| **High Rift** | `waterfall heavy mist`, `sinter terrace water`, `acid pool simmering`, `crevasse wind harmonic` | Boost 120 Hz body on cataract; add resonant bandpass filter on fissure winds for organ-pipe effect. |
| **Ria River & Delta**| `broad river current`, `estuary tidal surge`, `riverbank mud walk`, `reed bed wind`, `brackish surf` | Layer heavy freshwater flow beneath coastal tidal wash; wet squelch transients on foley. |
| **The Crook Glacier**| `glacier crevasse groan`, `ice calving crash`, `ice cavern dripping`, `glacial river flour`, `crampons snow` | Pitch ice groans down 7–12 semitones for cyclopean ice mass; retain crisp high-frequency ice cracks. |
| **The Arch Seamounts**| `ocean breaker cliff crash`, `blowhole sea cave surge`, `steam explosion water`, `littoral surf lava` | Heavy sub-bass compression on breaker impacts; crisp white-noise sizzle on steam flash bursts. |
| **Arachnoid Network** | `obsidian glass footsteps`, `volcanic plain wind`, `cavernous basalt echo`, `geothermal deep hum` | Add subtle metallic comb filter to footsteps; wide stereo reverb on scarp wind. |
| **NE Tharn Shield** | `arctic tundra blizzard`, `permafrost katabatic wind`, `ice spindrift ground`, `frost quake crack` | High-pass filter wind at 150 Hz to convey thin air; sharp impulse transients with long decay for frost cracks. |

### Alien Fauna Synthesis Recipes (Transforming Earthly Recordings)
To craft native Krator vertebrate hexapod calls:
1. **Large Apex Hexapod (Stalker / Basin Hunter)**:
   - *Source*: Camel groans, walrus growls, or alligator water-dance bellows (all available via USGov / CC0 / CC-BY).
   - *Processing*: Pitch down 12–16 semitones, apply formantic resonator around 180 Hz, remove mammalian breath inhalation transients.
2. **Playa / Chasm Glider**:
   - *Source*: Sandhill crane bugling or loon territorial wails.
   - *Processing*: Pitch down 5 semitones, apply reverse reverb pre-delay, automate pitch bend for unearthly throat-sac modulation.
3. **Siphon Vent Dweller**:
   - *Source*: Elephant seal guttural clicks and throat gurgles.
   - *Processing*: Time-stretch 1.8x, pitch down 9 semitones, blend with wet hydrophone recordings of mud bubbles.

---

## 6. Music & Dynamic Soundscape Direction (Kenshi Aesthetic)

In accordance with Krator's core audio philosophy (`core/audio/PLAN.md` §0 & §4):
* **Sparse, Spatialized Ambience**: Music is never an unrelenting cinematic wall. It consists of solitary, sparse acoustic events—a bowed cello drone, a hollow bone flute, a reverberant steel tongue drum, or a distorted resonator guitar note—separated by minutes of pure wind and geological Foley.
* **Combat Intensity Layers**: When combat begins, the music does not switch abruptly to an orchestral track. It fades in a dry, tension-building **biome combat beat** (e.g., muffled war-drums and rasping metallic percussion in the Loom-Chasms; bone-dry scraping stones in Stalker Gate; echoing glacial wood-blocks in The Crook).

---

## 7. Submission Checklist for Audio Agents

Before committing an intake batch or handing files to the audio cataloguer, verify:
- [ ] Every file is in `C:\Users\travi\Documents\krator-audio\intake\<date>-<name>\audio\`.
- [ ] Every file is $< 6\text{ MB}$, valid audio format (MP3, OGG, WAV, FLAC), and verified non-corrupt.
- [ ] `clips.json` is fully populated with `id`, `creator`, `source`, `license`, `category`, and descriptive `tags`.
- [ ] Every license is confirmed CC0, Public Domain, CC-BY, or approved commercial Royalty-Free.
- [ ] No CC-BY-NC, CC-BY-ND, or CC-BY-SA files are present.
- [ ] `node core/audio/tools/catalog.js intake <folder>` runs with zero rejection errors.
