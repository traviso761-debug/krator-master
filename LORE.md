# Krator: lore so far

A first pass at a design bible: the world lore recorded during the build, sorted by subject.

Section 12 lists contradictions and open questions.

Sources are named in brackets, relative to the repo root, so each fact can be traced.

---

## 1. The world in one paragraph

Krator is a tidally locked moon of a gas giant. Its people live in and around one vast crater. Its
inner rampart, the **Inner Wall**, rings a hyperjungle heartland and the **Ring Sea**, and a great
volcano smokes beyond the water. Between the Inner Wall and the **Outer Wall** lie lowlands, highlands,
deserts and bays. To the east the land drops into the **Abyss**; to the south runs the **Rift**. A lost
high civilisation, **the Ancients**, built everything that matters and then vanished. A thousand or
more years later, every culture on Krator lives in their ruins: it salvages them, worships them, fights
over them, or tries to understand them. Electric light, kept alive from Ancient machines, is the mark of
power everywhere.

---

## 2. The sky, the planet and its physics

| | |
|---|---|
| Body | A tidally locked moon of a gas giant (Neptune-to-Saturn class). [settlements/voth/src/21-sky.js; dalab/src/81-sky.js] |
| The giant | Fixed in the sky at altitude ~25°, azimuth ~66° (NE), "over **Korona**". About 30° across ("sixty full moons wide"), banded, stormy and greenish. Its rings sit almost edge-on, seen as a hairline. At night its glow ("giantshine") lights clouds and snow. [dalab/src/81-sky.js:3; biomes/eastabyss/src/82-host-sky.js; biomes/nhighlands/src/82-host-sky.js] |
| Moons | Two small moons, well away from the giant. The Republic's orrery shows sun, giant, Krator and two moons. [settlements/highlands/NOTES.md:83-92] |
| Sun | Sets WNW in every kit (canon placement). Eclipses come in seasons round each equinox. |
| Day | 24 h: one orbit of the giant. |
| Year and tilt | Tilt ~23°, so seasons are Earth-like. The year is 365 days in the sky docs and `YEAR=360` in the shared sky code (see §12). The southern summer solstice falls on day 350. [jimjam/DESIGN.md:81-91] |
| Latitude | "Climate, day length and seasons all depend on latitude, not longitude." The reference site (Voth, Jimjam) is at 40° S, in the westerlies, so the sun crosses through the north. There is a "mirror city" west of the meridian, "under the weather". [voth/src/21-sky.js:38-56] |
| Gravity | 7.4 m/s² (about 0.75 g). [mavs-refuge/src/79-spiders.js:9] |
| Air | Dense, varying with altitude: ~0.8 atm on the high plateau, ~1.3 at Yuni, ~1.6 on the Voth lowland, ~1.9 on the hypertropic lee shore, ~2.0 on the Ring Sea, thicker still in the Abyss. Krator's climate classes add **X, abyssal** (above 1.9 atm) and **H, hyperalpine** (below 0.6 atm) to Köppen. [mavs-refuge/src/21-sky.js; biomes/WORLD.md] |
| Soil | Red: "Tharnish red soil" in the hyperjungle. |

Dalab's genepriests sell **pressure adaptation** as a body modification.

---

## 3. Geography

### 3.1 The shape of the crater
- **The crater.** The whole inhabited world lies inside one vast crater. [yuni/src/20-stage.js]
- **The Inner Wall.** "The crater's great rampart": mountains ringing the central basin, with temperate
  highlands on their flanks and snowy peaks whose "summits are in the sky".
- **The Outer Wall Mountains.** The crater's outer rim: airless, glaciated peaks. Yuni sits in a side
  valley of it. The lowlands lie between the two walls.
- **The central crater** holds the hyperjungle (Girder, the Hexahedron), the Ring Sea and the volcano.
- **The Ring Sea.** An inland sea. Mav's Refuge sits on its SE lee shore. Its sailing cultures are listed
  in §9.
- **The great volcano.** Seen from almost everywhere: NW across the Ring Sea from Mav's Refuge and Locus,
  due north from Voth, far south from the Hexahedron. It always smokes; about a fifth of the time the
  plume thickens and the summit glows.
- **The Abyss.** East of the high desert, the plateau ends in a 740 m cliff. The high desert's river
  pours over it as a cataract onto a basin floor, which holds a red salt lake. The basin wall, "the
  shelf", hides the sun and the giant's ring from Locus.
- **The Rift.** South of the main crater: a long east-west trough of salt lakes (yellow, pink,
  blue-green), jungle and mesa ridges.
- **Korona.** A planned region in the NW, under the giant.

### 3.2 Regions [biomes/WORLD.md]
| Region | Neighbours | People known there |
|---|---|---|
| Central hyperjungle | N highlands, S highlands (steep borders) | Beast Riders (Girder), Screamers (Hexahedron), the Izani (Iziz) |
| Eastern Abyss | E high desert (steep) | the abyssal salt-marsh people; Geomancers (Locus) |
| Eastern high desert | Abyss (steep), E badlands, S highlands | Eastern Nomads (Shade), dune raiders |
| The Rift | Xanadu | — |
| Southwest bay | S highlands (steep) | (Voth's volcanic bay matches its description; see §12) |
| Southwestern lowlands | NW lowlands, S highlands | Dalab |
| East Rift Highlands / Vale of Xanadu | the Rift | the Sultanate of Xanadu (Erewhon) |
| Northwestern lowlands | SW lowlands, N highlands, Korona | Roketstad's surroundings; Giant tribes come from the NW |
| Northern highlands | NW lowlands, hyperjungle, NW bay, Korona | Iron Republic, Rustic Clansmen, Painted Men |
| *In progress / planned:* NW bay, E badlands, Korona, S highlands; *possibly* E highlands, S badlands | | |

The **Krator Scale Model** artifact holds the terrain: 3,098 × 2,786 km at 2 km a pixel, elevation from
−2,600 to +17,100 m, plus climate rasters. Its database holds 35 named cultural and political region
polygons, among them the **Inner Crater**, the **Empire of Iziz**, **The Rift** and the **Vale of
Xanadu**.

---

## 4. The Ancients

**Who they were.** A lost, technologically advanced civilisation. Nobody alive descends from them
knowingly, and nobody alive could build what they built. Their works are "never shown intact, because
nobody alive built it" (in the Dalab context). Their fall is dated "a thousand years" ago at Yuni and
Iziz, and "millennia" ago elsewhere. **The docs give no cause for their fall.**

**How they built.** [yuni/briefs/ancients.md]
- House style: "Cyclopean · Modernist · Organic" (late Gaudí, Goldberg, Moebius, Soleri).
- Gleaming white metal in seamed panels, or blue-transparent glass; board-formed concrete; copper or
  bronze ring bands.
- "Some structures alienating, many dwarf the individual." Not light-and-airy.
- After the fall: metal tarnished, rusted or overgrown; glass gone.
- Their light was **cyan strips**, always dead in a ruin.

**What they left.** A whole working civilisation:
- Workplaces and services: labs, factories, silos, fuel depots, data centres, robotics works, radar,
  dishes, hospitals, libraries, police stations, starports, ports with container ships, drone carriers
  and submarines.
- Military: bunkers, AA batteries.
- Housing: skyscrapers, "corn-cob" apartments.
- Huge **arcologies**, after Soleri: dam cities (**Veladiga**, **Theodiga**), the **Hexahedron**
  (1,100 m, 170,000 people), **Arcube**, **Arcbeam**, the Launch Arcology ("the city that meant to
  leave"), **Plymouth** ("the one people actually live in by the hundred thousand"), the cliff
  **Arcoindian**s, and the spomenik-style memorial cities (the Wing, the Drum, the Blades).
- The **Hanging City** (which replaced **Vashtir**, the recursive pyramid).
- **The Unnamed**, a leaning 260 m prism "of unclear purpose".
- **The Engines**: ten cyclopean machines of unclear purpose on one plain (the Harrow, Strider, Breech,
  Gyre, Press, Sleeper, Carapace, Retorts, Needle and Ram).
- **Roketstad's spaceport**: five Launch Arcologies. Four flew and left empty pads; one never flew.

**They meant to leave.** Starports, launch arcologies and the ships "that came down short of the port"
(the wrecks the Republic's shipbreakers break) belong to an off-world programme.

**Decay is history.** Every Ancient building comes in one of six states: intact, ruined, toppled,
rehabilitated/reclaimed, "The Project", worn. "This building outlived its builders, and someone is
living in it now." Reoccupiers patch the buildings with corrugate, timber and tarp, and their warm
firelight sits against the dead cyan. The **Projects** (rehabilitated towers) hold "gang turf".

**Ancient survivals still running**
- **The God** at Dalab: the central AI of a genetic laboratory (see §6.1).
- The **Grand Vault** at Yuni: the only working Ancient power plant known.
- The Izani Empire's last walking **mechs**: ~9 m bipeds kept going in the Forgemaster's Hall.
- **The Ear**: the one Ancient dish the Order can still point at the sky.
- Salvaged Ancient engines driving generators (Locus, Xanadu).

---

## 5. Themes that run through every culture

1. **Life in the ruins.** Every culture is defined partly by how it treats the Ancient remains:
   - Dalab worships them, unknowingly.
   - The Order of Historians studies and hides them.
   - The Salvagers' guilds (Republic, Iziz) strip them.
   - The Screamers feed captives to one.
   - The abyssal people recycle them "with pride and colour, not as squalor".
2. **Electric light is power.** It is rare everywhere and held by the few:
   - Iziz: rich and civic buildings only, from hilltop generators.
   - Yuni: the Order's cable from the Vault reaches only the inner city and the market, so "the night
     view is the social map".
   - Dalab: The God's cold teal light "is the priests' to give".
   - Xanadu: one turbine lights the poor quarters.
   - The Republic: electric light for the rich only.
   - No electric light at all: the Rustic Clansmen, Reed Lake and the abyssal people.
3. **Wealth is legible in material.** Each culture has a tiered palette, with poor, common and court tiers
   in the furniture catalog. Stone and gold go to the top, timber or thatch to the bottom, salvage to the
   middle and bottom.
4. **Wealth climbs with height.** Erewhon, Iziz's hills and Yuni's oligarch towers all put the powerful
   high and the poor and industry low, by the water.
5. **Caravanserais** at Yuni, Iziz, Locus, Shade, Jimjam and the abyss.
6. **Big beasts do the work.** Millipedes turn capstans and are ranched; giant beetles are livestock at
   Voth; silt striders carry passengers; flyers and riding spiders are ridden.

---

## 6. Peoples and polities

### 6.1 Dalab: the mound-builders (SW lowlands)
- The descendants of the staff, patients and test subjects of an **Ancient genetic laboratory**, a domed
  compound at the centre of their land. **They do not remember this.**
- The staff's descendants became the caste of **priests and rulers**.
- **The God** is the lab's AI. Its counsel keeps biomedical knowledge alive, and it "grows more erratic
  every century". Its seat is a sunken chamber of cabinet banks: "a plant room to a stranger and a shrine
  to a priest". Its image is a rayed head with **one great eye**.
- Nearly everyone carries the photosynthesis mod and is **green-skinned**.
- **Genepriests** sell modifications to outsiders in the **Halls of Reformation**: night vision, pressure
  adaptation, extra limbs. Dalab healers are prized across Krator.
- **The Giant tribes of the north-west came from here.** The priests keep Giant guards: four-armed
  ceremonial guards at the temples, and two-armed street patrols in threes.
- Priests commune with The God from earth mounds built to imitate the Ancient domes. Each town's mound faces
  the lab. The High Priest's mound faces *away* from it, behind a ring earthwork guarded by giants.
- Castes:
  - Peasants: rammed earth, thatch and scrap, round plans.
  - Traders: timber frames.
  - Nobles: grey megalithic stone.
  - Priests: stone temples on the mounds.
- Look: "Cahokian monumentality in rammed earth, wood, stone and scrap", with Tiwanaku and Mesoamerican
  stone (trilithon gates, steles). "The red marks what is holy." Priests wear white with gold head-dresses.
- **Embassies** of Iziz, Voth, the Yuni Order of Historians and the Iron Republic.
- Livestock: the Dalab lizard (2.4 m, striped; frilled bulls). Also a monster pen.
- Six outlying towns ring the lab: Ashfold, Greenmarch, Reedholm, Oakhaven, Cornwell, Stonebrook.

### 6.2 The Empire of Iziz: the Izani (hyperjungle)
- "An early-modern people, a thousand years into living in and around the Ancients' ruins, in a
  hyperjungle, in a **declining empire that has lost most of the technology it was founded on**."
- Copper roofs "where the Empire still can".
- City:
  - Walled, with a moat and four gates.
  - Three mesa hills "like the hills of Rome": the palace citadel, the temple hill and the arena hill.
  - A ruined spaceport on the NW causeway; a farm belt.
- Palace: its hall is a converted Ancient hangar "for entertaining Izani and foreign nobles".
  Emblem: an **orb**; the culture's sign elsewhere is a **sun**.
- Materials by class:
  - Timber: everyone.
  - Reclaimed Ancient metal: poor and middle.
  - Plaster: middle.
  - Orange ashlar and verdigris copper: rich and civic.
  - Palm thatch: poor.
- Guilds:
  - Farmers.
  - Beast Hunters (trophy hall with a great skull).
  - Forgemasters (the mechs).
  - Salvagers, in an Ancient lab, "the Reliquary".
  - Mercenaries, in an Ancient police station, "the Watch".
- Ancient Iziz Style: Iziz forms built the Ancients' way, such as tripod markets hung from reclaimed
  skyscrapers.
- Ships: a turtle ship plated with Ancient hex plate, a dhoni, a wheel galley, a salvage lighter.
- **History:** the Izani Empire once held Roketstad as a munitions hub until the **Mutiny of the 3rd
  Legion**.

### 6.3 The Iron Republic (highlands of the Inner Wall)
- The most settled, developed highland state. Russian and Transylvanian Saxon architecture; Peleș villas
  for the grand; East-Asian dougong on civic eaves; NW-coast formline carving.
- **Capital: Roketstad**. "Once an Ancient spaceport, a munitions hub of the Izani Empire, and since
  the Mutiny of the 3rd Legion a forge town of the Iron Republic, ~5 000 souls"; later made the capital
  and doubled in size.
  - Districts: Scraptown, the Scrap Kontor, a wreck market.
  - **The Fallen Arcology**: a crashed ship broken in two, with a poor town in the cleft.
- **Emblem**: a triskelion of three arms, each fist holding a sword at 90°. Colour: red ("Voth's
  deep red").
- **Faith:** polytheist. The **Temple of the Pantheon** has the gods as carved pillars round the
  precinct, plus animal totems of gods and guilds. Totems proper are tribal only.
- Guilds:
  - Mercenaries.
  - Alchemists (high explosives).
  - Farmers.
  - Smiths.
  - Mechanics (clockwork).
  - Astronomers (orrery, observatory).
  - **Salvagers**, formerly Scavengers: "those who strip the Ancient ruins".
  - **Rocketeers**.
- Capital institutions: the Hall of the Republic, the **Arsenal** (racks of rockets), the Mint and
  Treasury, the Forgehouse.
- A salvage culture: houses in fuel tanks, rocket stages and hull plate. **Shipbreakers** dismantle the
  ships "that came down short of the port".
- Murals: Norse and Celtic knots, triskele, tree of life, wolves, Mjölnir, the green gas giant, and
  **rockets** (Republic only).
- Landlocked: no ships.

### 6.4 The Rustic Clansmen (south of the Republic)
- "Relatively civilised" Norse and Alpine villages: stave churches, longhalls, dragon heads, falu red. No
  electric light.
- Sign: the **fir**. Clan crests, clan totems, antler trophies.

### 6.5 The Painted Men (high-country raider tribes)
- "The Painted Men and other raider tribes of the high country."
- Raw logs and bamboo; whole painted house-fronts; totems everywhere; thunderbird finials.
- **Cliff settlements** hung on rock faces.
- Formline crests: salmon, orca, thunderbird, bear; poles of eagle, bear and frog. Faces are out ("creepy").
- Sign: the **raven**. Shamans' houses, warriors' halls, stone circles.

### 6.6 The Beast Riders (hyperjungle; Mav's Refuge, Girder)
- **Mav's Refuge**: a tree city on 300–480 m hypertrees on the SE lee shore of the Ring Sea (1.9 atm,
  33 °C).
  - Three **gateway trees** are giant baobabs carved down to ~30 m, with spiral ramps and beast lifts:
    "un-assailable".
  - The central platform, **Mav's Crown**, carries the **Council Chamber**, with speakers' stones at the
    quarters.
  - Holds: Ghostwood Hold, Prism Hold, Highbough, Southbank Hold, Riders' Rest. Also the Rookery and the
    Silk Loft.
- **Girder**: an outlying village in a cyclopean Ancient ruin of four rusted 30-storey frame towers.
  - Only the top and bottom floors are lived in; the middle has gone to vines.
  - Roost decks on top; a palisade, farms and a round tajug-roofed assembly hall below.
- Mounts: quetzalcoatlus, giant bats, giant archaeopteryx, giant dragonflies. Riders carry lances.
  **Spider-riders** ride giant spiders that climb trunks and leap on draglines; they live in silk houses and
  work silk looms.
- Architecture: Javanese joglo and limasan, Viking stave, Kashyyyk.
- Sign: the **claw** (three talon slashes), green. Skull poles; "simple but not primitive".
- Barracks are named by **Wing**. Nature shrines: First Bough, Rain Mother, Winged Ones, Deep Root, Green Silence.
- Ships: a double-hulled voyaging canoe with a flyer's perch; a rookery raft.

### 6.7 The Screamers (north of the central crater; the Hexahedron)
- A tribe living in and under the ruined **Hexahedron** arcology (1,100 m, a double pyramid held 300 m up
  on shafts).
- They keep the intact waist promenade cut back from the jungle.
- "The Ancients left no way in at ground level, so the tribe cut one."
- **The chief's palace** is a ruined skyscraper lashed to the promenade.
- **Captives:** warriors bring captives, "pale and unpainted", to a pen. Escorts later lead them into the
  Hexahedron, "where they go in and do not come out".
- Amazonian post-apocalyptic: lashed hardwood, palm thatch, salvaged sheet. Rust and plastic are "worn as
  treasure".
- Sign: the **skull**; painted dots.
- Economy: millipede ranches, orchards.

### 6.8 The Eastern Nomads (eastern high desert; Shade)
- **Shade**: a sunken sandstone basin of about 1,000 people.
  - A 46 m fall drops into a turquoise plunge pool.
  - Petra-style carved facades, Mesa Verde cliff dwellings, adobe pueblos and black goat-hair tents.
  - One switchback is "the only way up".
- Factions: the Shade clans, the **Wardens of the Deep Aquifer** (priests), the canyon guard, visiting
  caravaneers and the **dune raiders**.
  - The raiders come as a convoy of camel riders every few days; they water and trade.
- Faith: the **Shrine of the Deep Aquifer**, carved behind the falls. Worship at dawn and dusk.
- The Khan (caravanserai), camel lines. Sign: **horns**.

### 6.9 The abyssal people and the Geomancers (eastern Abyss; Locus)
- **Abyssal people**: "who live on the salt marshes and river deltas at the edge of the eastern abyss,
  beside the Geomancers' oil works and the ruins of the Ancients".
  - Scavengers and recyclers, proud of it.
  - Houses on piles; shade first (sails, umbrellas); bright paint and pastel lime-wash.
  - Repurposed tanks and containers.
  - Swoop-and-horn thatch with gilded tips is reserved for the sacred and noble. Tin-mirror cladding marks
    wealth and sanctity.
  - Nothing electric.
  - Faith: the **Temple of the Altar**, "the altar of the abyss": a stepped salt-white altar with a fire
    bowl and a ring of glowing blue crystals.
  - Ruler: the Headman.
  - Catalog culture `eastabyss` (Maghrebi/Arab): sign a **star**, mashrabiya.
- **The Geomancers**: a guild that drills for oil (refinery "still-house", pumpjacks, a generator on a
  salvaged Ancient engine).
  - Their oil town **Locus** (~2,650 people) sits on a delta at the red salt lake, farming salt-rice.
  - Their Chapterhouse holds a rock relief-map table, drill cores and a brass gnomon.
  - In Yuni they hold the Cloisters. Culturally "mostly Yuni".
  - Lizard riders patrol in sixes.

### 6.10 Yuni and the Order of Historians (far SE, Outer Wall)
- Yuni: a former Ancient installation under a 400 m Devil's-Tower-like butte, in a Mediterranean side
  valley of the Outer Wall. ~10,000 people.
- **The Order of Historians** "attempt to learn the details of the obscured past, preserve ancient
  relics, and in some cases hide away the more dangerous ones."
  - Saffron-robed monks and academics; only they may enter the **Vault**.
  - Their blue is the Order's colour.
  - Chapterhouses at Dalab, Iziz and Locus.
  - They keep the Ear.
- **Ruled by an Emir**: "in practice an oligarchy; the prominent families choose a new one". The
  families compete in height with tower-houses.
- "The Ancients were here first": their buildings stand as superblocks inside the wall, and Yuni's radial
  grid is laid around them.
  - The **Reliquary** (an Ancient lab).
  - The **Starfish** (a starport ruin on the summit).
  - The Grand Vault, with six sealed doors in its antechamber: "the first room of a whole complex".
- Look: Gaudí + Burmecia + Sahelian for the rich; Musgum, Mandara and Tiebele mud architecture for the
  poor; neo-African civic buildings.
- Gates: Shepherds', Caravan, North, River, Potters'. The slum is **the Thatch**. Desert nomads come to the
  caravanserai.
- Sign: the **hyperboloid**, yellow. No ships.

### 6.11 Voth (enclosed brackish volcanic bay)
- "A Morrowind-flavoured Dunmer world." Krator grew out of the Voth project.
- A Venice/Vivec city of **cantons**: platforms over water joined by causeways (Palace, Temple, Arsenal,
  Guild, Foreign, Granary, Market, Arena, Ancestry, Port, Fortress).
- People: 75% Dunmer, 25% human.
- Styles: Hlaalu, Velothi, Redoran/Mournhold; clan compounds.
- **Ordinators**: temple guards in green-and-gold armour, about 180 of them. Also purple-robed
  priests; a crimson-and-gold high priest; grey-robed penitents in threes; monks; pilgrims on shrine
  circuits.
- **Ancestry canton**: a pyramid necropolis of family tombs and hanging gardens.
- Palace: "flying buttresses between tiers, skylights and atria, a lot of gold, a teeny bit of
  porphyry and black trim".
- Giant beetles are livestock. **Silt striders** carry passengers. **Cliff racers** fly over land.
- Arena: gladiators from noon to sundown.
- Sign: the **diamond**, ash-white on deep blue. Ships: the Ordinator flagship, chitin biremes, cargo hulks.
- An embassy (a clan compound) stands in Iziz.

### 6.12 The Sultanate of Xanadu (East Rift Highlands)
- "The remote southern Sultanate": a rich hilly valley "like Shangri-La". **Gold is on everything
  wealthy, religious or civic; the valley's mines pay for it.**
- Look: Tibetan massing with Indian, Turkish and Persian detail; Andean "cholet" paint. **No minarets,
  great prayer wheels instead.**
- Rulers: the Sultan's Palace, the **Pleasure Dome**, the **Grand Vizier**.
- Guilds: Farmers, Miners, Goldsmiths ("the richest house in the valley"), Alchemists, Masons, Spicers.
- Faith: temples, monasteries and a pilgrims' circuit of prayer wheels.
- **Erewhon, Pearl of Xanadu**:
  - 20,000 people on a mountain lake.
  - The palace sits on a plateau above a cliff; the prison is in a cliff.
  - The **Pleasure Dome of the Bay** is a ruined Ancient test dome made whole.
  - **The Caves of Ice**; the sacred river Alph.
  - The governing poem is Coleridge's *Kubla Khan*.
- Sign: the **eight-spoked wheel**, saffron and maroon. Ships: a swan barge, a dragon boat, a bullion
  carrack.

### 6.13 Reed Lake: the lake people
- Floating islands of piled reed in the shallows: "the lake's answer to the Highland tribes' cliff
  settlements".
- **A completely different culture** from the Highlands. No totems and no formline; Andean textile geometry
  instead (the chakana, step-frets). Puma prows on the boats.
- Mudhif halls, a spirit circle, watchtowers "against raiders". Water buffalo. Fire always sits on lake
  mud.
- Sign: the **fish**. Location not yet given.

### 6.14 Jimjam
- An exotic city of red and yellow brick with white marble trim, domes, staged spires and Tudor chimneys.
- Ruled by **the Raja**.
- At its heart, a **solstice sun temple** whose arch frames the summer-solstice sunset. Emblem: a gold sun
  on red banners.
- Not snowy. Biome and location not yet given.

### 6.15 Peoples known only by name or kit
- **Hykkousoi**: a seafaring people, Greek + Polynesian + organic. Nacre, olive wood, sea-linen, bronze.
  Sign: the **wave-sun** in gold. Their fleet includes a 162-oar trireme, a siege hexareme and a
  pearl-diving mother ship. No buildings yet.
- **Ring Sea Islanders**: Polynesian and Ashlander. Sign: the **white island moon**. Boats: oruwa,
  karakoa, lakatoi.
- **Lizardmen**: reptilian, Amerindian. Sign: the **serpent**. Basking slabs instead of beds; jade scale
  inlay.
- **The Giant tribes of the NW**: engineered at Dalab (§6.1).
- **Salvagers**: crews who refloat Ancient hulls ("a funnel full of herbs").
- **Post-Apoc settlers**: a culture-neutral salvage society. Its kit has a "big man's" house, a shaman
  hut, prisoner cages and a **Thunderdome** arena. Shop signs are pictographs, not writing. Sign: the
  **gear**.

---

## 7. Peoples of Krator (species and kinds)
- **Humans**, in most cultures.
- **Dunmer**: dark elves, 75% of Voth. Their place in Krator's history is unexplained.
- **Green-skinned Dalab**: humans with an engineered photosynthesis mod.
- **Giants**: engineered at Dalab, some four-armed.
- **Lizardmen.**
- Anyone with Dalab mods: night vision, pressure adaptation, extra limbs.

---

## 8. Ecology highlights (detail in each `biomes/*/NOTES.md` and `biomes/FRUIT.md`)
- **Hyperjungle**:
  - Hypertrees 150–480 m: Ironbark, Ghostwood, Prism gum, Gate baobab, Krator mahogany, Crimson kapok.
  - Fauna: sky rays (6–12 m soarers), striders, bough sloths, giant butterflies, glowing spore motes.
  - Food: gatepod chalk, which keeps a year.
- **Eastern Abyss**: a Carboniferous coal-swamp jungle that flowers straight off the trunk. Sky
  scale-trees (100–124 m, iridescent), seal-trees, giant horsetails, and mat reed for boats and thatch.
  Salt-cone kernels are poisonous until steeped a week in the salt lake.
- **Eastern high desert**: a red US-south-west desert with Socotran flora (dragon trees, boojums, quiver
  trees). One alien note: glowing pastel **twist-candles**. Desert kites, sand striders.
- **The Rift**: "the jungle Earth's flora never quite reached". Madagascar and Cretaceous forms, coral and
  anemone shapes; **iridescence is the rule**. Canon colours: **Vain fronds purple**, the purple fan shrub
  "sweet-potato purple".
- **SW bay**: a fungoid canopy (cap-trees 30–62 m), prism gums, a volcano 8 km NE.
- **SW lowlands**: the US South turning Californian. What makes it alien is width (sprawl oaks ~80 m
  across) and red or pale bark. Cork groves are stripped red.
- **NW lowlands**: Asian and Australian forms at ~1.5× Earth heights; Ediacaran **sea pens** as shrubs;
  self-lit glow-willows.
- **Northern highlands**: "ancient, gnarled, never unfriendly"; broadleaf low down, bushy conifers.
  - **Great trumpets** (30–50 m) hold clean water all summer, and travellers drink from them.
  - Glowing bell-bulbs and lantern pods.
- **Vale of Xanadu**: "as if somebody kept it". Untrimmed-bonsai habits, petrified-wood colours, fairy
  rings, cacao, lotus.
- **Fauna in towns**: millipedes (draught), giant beetles (Voth), silt striders, cliff racers, the
  Dalab lizard, salt-lake flamingos and marsh emus (Locus), riding flyers and spiders. All fauna will go to
  one fauna kit, tagged by biome.

---

## 9. The Ring Sea fleets
| Culture | Vessels |
|---|---|
| Hykkousoi | trireme, scroll-sail galley, siege hexareme, pearl baghlah, amphora corbita |
| Voth (Ordinators) | Ordinator flagship (junk, green battened sails, gold wave), chitin bireme, cargo hulk |
| Xanadu | swan barge, dragon boat, bullion carrack |
| Iziz | turtle ship, dhoni, wheel galley, salvage lighter |
| Beast Riders | voyaging canoe, rookery raft |
| Ring Sea Islanders | oruwa, karakoa, lakatoi |
| Salvagers | refloated Ancient steel tug |
| Not seafaring | the Iron Republic (landlocked), Dalab, Yuni |

(An early commit also lists a Dalab galley and a Yuni junk; later notes say those cultures have no ships.)

---

## 10. Signs, colours and emblems
| Culture | Sign | Colours |
|---|---|---|
| Voth | diamond | ash-white on deep blue (the Ordinators wear green and gold) |
| Iziz | sun (palace: orb) | orange, teal, cream; striped awnings |
| Iron Republic | triskelion of sword-arms | deep red, ochre, cream |
| Yuni | hyperboloid | yellow (the Order: blue) |
| Beast Riders | claw | green |
| Xanadu | eight-spoked wheel (also a sun-and-moon roundel) | saffron, maroon, turquoise, gold |
| Hykkousoi | wave-sun | gold, pale linen, slate blue |
| Ring Sea Islanders | white moon | bark, sand, sea teal |
| Dalab | eye in the sun | terracotta, cream, turquoise; The God's cold teal light |
| Jimjam | gold sun | red banners |
| Screamers | skull | painted dots |
| Eastern Nomads | horns | |
| East Abyss | star | red lacquer, teal and gold for the sacred |
| Rustic | fir | falu red, red-check |
| Painted Men | raven | black, red, teal formline |
| Reed Lake | fish, chakana | madder, ochre, black, undyed white |
| Lizardmen | serpent | jade, turquoise |
| Post-Apoc | gear | faded rust red, teal, mustard, olive |

Rule: a building never names a culture. Its sockets (awning, banner, flag, emblem, sign) are dressed by
whichever culture holds it.

---

## 11. Who knows whom (contacts on record)
- **Embassies in Dalab:** Iziz, Voth, the Order of Historians (Yuni), the Iron Republic.
- **Embassy in Iziz:** Voth, as a clan compound.
- **The Order of Historians:** chapterhouses at Dalab, Iziz and Locus.
- **The Geomancers:** Locus and Yuni.
- **The Izani Empire and the Iron Republic:** connected by the Mutiny of the 3rd Legion at Roketstad.
- **Dalab and the NW Giant tribes:** the giants came from Dalab.
- **Caravans:** Yuni and the desert nomads; the Eastern Nomads and the dune raiders.
- **The Ring Sea:** a shared sea for the Hykkousoi, Voth, Xanadu, Iziz, Beast Riders and Islanders.

---

## 12. Contradictions and open questions

**Contradictions in the repo**
1. **Year length.** The sky docs say 365 days; the shared sky code uses `YEAR=360`. The solstice is day 350.
2. **Jimjam's latitude.** Specified as 30° (N?), sunset ~297°. As built: 40° S, ~242°.
3. **Yuni's valley mouth.** Faces NE in one comment, NW in the code.
4. **The volcano.** Seen NW across the Ring Sea (Mav's, Locus), due north (Voth), far south (Hexahedron),
   NE (SW bay). Is it one central volcano, and is the Ring Sea a ring round it?
5. **Voth's colours.** The culture pack is blue with the ash diamond. The Ordinator fleet and armour are
   green and gold. Are the Ordinators a separate power within Voth?
6. **The Republic on "Voth's deep red".** A borrowed colour with no story. Is there a link?
7. **When the Ancients fell.** "A thousand years" at Yuni and Iziz, "millennia" elsewhere.
8. **The Engines.** Five in one commit, ten as built.
9. **The pearl baghlah.** Xanadu in one note, Hykkousoi later.
10. **Roketstad's name and size.** Spelled "Raketstad" early. ~5,000 people, then doubled.
11. **Hypertree heights.** 290–480 m at Mav's, 150–270 m at Girder, and the Krator mahogany (245–305 m)
    called "the tallest in the belt".

**Open questions (nothing on record)**
- Why did the Ancients fall? Were they human? Did any of them leave on the launch arcologies?
- Where are Jimjam, Reed Lake, the Hykkousoi, the Lizardmen and the Ring Sea Islanders on the map?
- Who are the Dunmer on Krator, and how do they relate to the humans?
- What does the abyssal people's ruler call themselves (the Headman placeholder)?
- What did the Mutiny of the 3rd Legion lead to? Did the Iron Republic begin with it?
- What does The God want? What do the Screamers do with their captives in the Hexahedron?
- What is Korona? Who lives in the NW bay, the badlands and the southern highlands?
- What are the religions of Iziz, Yuni, the Beast Riders and the Hykkousoi? On record so far: The God at
  Dalab, the Republic's Pantheon, Voth's Temple and ancestor cult, Xanadu's prayer-wheel faith, the Altar
  of the Abyss, the Deep Aquifer, Jimjam's sun, and the Beast Riders' nature shrines.
- Is there a calendar, a common language, coinage (the Republic has a Mint), or writing (post-apoc signs
  are pictographs)?
