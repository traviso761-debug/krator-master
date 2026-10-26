# The Yeti kit: the design plan (draft, 2026-10-25)

The building kit of **the Yeti Kingdom**, the Khaayken of Khaay Qantïr, "the High Country" (`LORE.md` §6.19, "The
northern frontier"; the land, the crops, the pycrete rule and the tongue in `biomes/nwouterwall/PLAN.md`). Catalog and
`core/tags` culture **`khaayken`** (the owner, 2026-10-25; the lowlanders' *Yeti* stays the folder's and the gallery's
name).

Owner's brief (2026-10-25, in conversation): Inuit-inspired, but more elaborate, developed and sophisticated. The igloo
form is everywhere, with igloo-like vaulted domes for the larger buildings, in **pycrete or stone, by the local
temperature and the building's use**. Many buildings are joined by **half-buried, half-roofed tunnels** for warm travel
in winter. Heated floors where they fit; a people well adapted to the freezing climate. **Austere outside, rich inside**:
furs, tapestry and sculpture after Inuit and native Siberian work.

Everything marked *proposed* is this draft's and waits on the owner. Read `kits/eternian/PLAN.md` for the precedent this
kit follows (a culture kit on the vendored Scyvoi engine, every census trade carried, interiors and the export last).

**Status (2026-10-26): Y1 to Y4 built** (the scaffold; the toolkit, the mass heater, the tunnels; the dwellings of every tier and the winter street; the state, the trades, the stores, the stock and war; `README.md`). Every
`verify.py --assert` check passes but `tags-vocabulary`: the culture is registered in core/tags in Y5 with its catalog
file, one all-builds rebuild for both (the owner, 2026-10-25; `KNOWN_ISSUES.md`).

**Scale: the Khaayken stand about 1.15 times a human** (the owner, 2026-10-25). Every opening, platform, step, tunnel
section and the kit's own furniture is drawn at 1.15x (a kit constant, `YT.SCALE = 1.15`, never a scattered number); the
spans in section 2 are already in their measure. Generic catalog pieces placed in their rooms are scaled by the same
constant through `core/furnish` (if it has no per-culture scale, that is added there, not in the kit: Y5). Their bodies
in `core/charactermodels` need the same factor when the culture's people are drawn.

## 0. What the build is

| | |
|---|---|
| Folder | `kits/yeti/` (`src/`, `refs/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `INDEX.md`, `PORT.md`, `KNOWN_ISSUES.md`, `API.md`) |
| Page | `dist/yeti.html`: the kit sheet, every building in rows by tier and shell (pycrete, stone, larch-and-sod), a **winter street** of domes joined by tunnels with one dome cut away, a cut-away row of the interiors, the winter fort in its two seasons |
| Engine | the **Scyvoi engine, vendored** (the owner, 2026-10-25), the Islanders and Eternian route (`python3 build.py --vendor-check` against `kits/scyvoi/src`), for its tiers, trades, defs and interiors. The dome, the tunnel and the heated floor are new kit helpers (section 2) |
| Registry | `YT.def` (one def per building, tags `culture:'khaayken'`, `tier`, `shell`, `role`, `job`); tunnels are records too (section 3), registered in `core/tags` before they are drawn |
| Biome | `biomes/nwouterwall` read in place once it is built: its flora to dress the sheet and its **`pyc` field** (permanent, seasonal, none) to choose a shell. Until then the sheet sets `pyc` per row |
| Out of scope here | the capital's page by the frozen lake and Leng's occupation as pages (each its own plan, on `core/city`); the caribou, musk oxen and voles (`kits/fauna`); the crops (`kits/crops`, the nwouterwall plan's N1); the characters and their clothes (`core/charactermodels`) |

It is a new kit, so it goes in the gallery when it first reaches `main` (`gallery/README.md`).

## 1. The shell: pycrete, stone or larch, by climate and by use

The nwouterwall plan's rule (its section 5) decides where pycrete **can** stand: **permanent** where the mean is at or
below -2 °C (the Yeti Valley and everything above ~5 km), **seasonal** where winters are hard but summers thaw it (the
forest-steppe), **none** below. The building's use decides whether it **should**:

| Use | Shell | Why |
|---|---|---|
| Dwellings | pycrete where permanent; larch, stone and sod in the forest-steppe | the climate's own answer; pycrete is quarried from the lake and the aufeis and set with larch sawdust |
| **Fire and heat**: smithy, bathhouse, kitchen house, the heated rooms | **stone**, always | a fire melts its own walls; stone also stores the heat for the heated floor |
| **Cold**: ice cellars, meat and root stores, the frostroot freeze-drying house | **pycrete**, even where only seasonal | the walls are the refrigerator; a store is built where it stays cold |
| Prestige and permanence: the Quunsul's hall, the High Chief's hall, the shrines, the tombs | **stone**, often with a pycrete outer ring of stores | what is meant to outlast a generation is stone |
| War: the winter forts, towers and curtain walls below the line | **seasonal pycrete** | raised for the raiding season, left to slump in spring (the war's calendar) |

**The composite house** (the common and rich tiers): a **stone heart** (the heated room, the hearth, the kitchen) inside
a **pycrete ring** of satellite domes (stores, sleeping domes, the byre) joined by short arched passages. Warm core, cold
ring: the shape of the whole kit.

**Pycrete is a shell, not an insulator** (section 4): ice conducts heat about as well as stone, so a heated pycrete dome
always wears a coat outside it and a lining inside it. **It keeps through the summer** only under cover: the walls are
thick (1 to 2 m), a **summer cap** of moss and turf at least 30 cm thick goes over every pycrete dome in spring (as ice
houses were kept under sawdust), the sunward side is shaded by a sod skirt, the dome is **not heated in summer** (the
household lives in its stone heart), and every autumn the cap comes off and the shell is **re-skinned** with fresh slurry.
So a building has a `season` parameter (*proposed*): `autumn` (glossy, fresh, blue-white, bare), `winter` (frosted,
banked with snow to the spring line), `summer` (capped in green-brown turf and moss, only the crown's vent ring and the
north windows showing ice; where the cap has slipped, the weathered pycrete underneath). The seasonal forts add `slump`:
never capped, the crown sags, the courses open, meltwater fans at the foot. The town's look turns with the year: white
in winter, turf-green in summer, glossy blue for a few weeks in autumn.

## 2. The rules the generator follows

### The dome

- **A catenary, not a hemisphere** (the igloo's own section: a hanging chain inverted, taller than half its span), so
  every course leans in on the one below and no dome needs centring. Height 0.55 to 0.7 of the span.
- **Spiral courses** for pycrete and snow-block work (the igloo is laid as one rising spiral), **level corbelled
  courses** for dry stone (the Mycenaean tholos and the Irish clochán), each course stepping in, the crown closed with
  a capstone or an ice lens.
- **Spans** (*proposed*, at Khaayken scale; small domes because heat goes with surface, section 4): a sleeping dome 3.5
  to 4.5 m; a family dome 4.5 to 5.5 (the igloo's 3 to 4.5 m at 1.15x); a clan house 7 to 9, as a cluster round a stone
  heart; a song house 12 to 16, heated by its crowd and lamps when it is used and cold otherwise; the great halls 18 to 30,
  communal, heated from the stone core they share with the bathhouse or the kitchen (section 4), where the dome is **ribbed**: stone ribs springing from a ring of piers, pycrete or stone
  webs between them, the Inuit form grown into a Byzantine one (Hagia Irene's plain bulk, not its decoration).
- **Clusters**: domes are joined by short arched passages into rosettes (the Inuit multi-dome houses, the qaggiq song
  house built off a family's dome). A big building is a cluster, not one huge dome: a central dome with apses.
- **Every dome has**: a **cold-trap entry**, a passage 3 to 6 m long that drops at least 0.5 m below the floor and
  climbs back up through a floor hatch (the katak), with a bend or a porch half-way, so the cold air pools in it and stays
  out; a **raised platform** (the iglerk) 0.6 to 0.9 m above the katak, over half to two thirds of the floor at the back,
  where people live and sleep in the warm air under the crown; an **adjustable crown vent** (10 to 14 cm at their scale,
  a soapstone or antler plug); an **ice window** (or a gut-membrane pane where pycrete is seasonal) facing **north**, to
  the sun at 40°S; the soapstone **lamp** (the qulliq) on its stand at the platform's edge.
- **Doors face off the wind** and out of the lee drift of anything upwind (the prevailing wind is a per-site parameter;
  the sheet takes one); windows and the warm rooms face north. The tunnel's mouth is a low hooded porch, the one place the
  outside shows craft.

### Austere outside

Plain pale domes and grey stone, half drifted; a cluster reads as a group of hills. The few marks:

- a **carved lintel stone** over each tunnel mouth, the clan's sign and its name in the cut script (a band, section 8);
- **serge**, the carved larch hitching posts of the Sakha, at the doors of the rich and at the halls: the one tall
  carved thing in the street, where the caribou are tied;
- **inuksuit**, stone figures and cairns, along the routes and at the tunnel junctions, as markers and as memorials;
- the **lamplight**: at night the ice windows and the thin crowns of the pycrete domes glow amber from inside. The town
  is invisible by day and lit by night (`91n-yt-night.js`, *proposed*).

### Half-buried, half-roofed (also in section 3)

Floors are sunk 0.5 to 1.2 m into the ground (the Thule and Koryak winter houses, the Aleut barabara), so the ground and
the drift banks do half the insulating. Over permafrost a sunken floor stays inside the summer's thaw layer, is dug in
gravel or rock rather than ice-rich silt, and is never heated directly (section 4). The ground is cut on `core/terrain`
(carve patches), not faked by sinking a mesh.

## 3. The tunnels

The sheltered way between buildings, and the town's real street in winter. **Not heated**: a tunnel is a buffer, still
air at about -5 to 0 °C against -19 outside, and a cold trap for every door on it (section 4).

- **Section** (settled, the owner, 2026-10-25): a trench 1.2 to 1.5 m deep, its sides lined with dry stone; low walls 0.6 to 0.9 m above
  ground; a barrel or catenary vault over that, so the passage stands 2.2 to 2.6 m inside and only a low hump shows. The
  spoil is banked against the walls, and the winter drifts bury them.
- **"Half-roofed"** (settled, the owner, 2026-10-25): the roof is laid in **removable pycrete
  slabs** over permanent stone ribs. In winter the whole run is roofed; in summer, where the pycrete is seasonal, the
  slabs come off and the tunnel is an open sunken lane between stone walls, the ribs standing over it. Where pycrete
  is permanent the roof stays, with **ice skylights** every 8 to 12 m.
- **Junctions** are small domes with a lamp niche and an inuksuk, the town's crossroads; long runs get a **warming dome**
  every ~80 m: a lined side dome off the run, entered through its own cold-trap step, with a lamp, a bench and furs.
- **No heat in the run**: a warm tunnel stops being a cold trap and thaws the permafrost under it into heave. Where a
  run passes a hot building (bathhouse, smithy) its floor is laid on a ventilated rubble bed. The spare heat goes into
  rooms built to take it (section 4), not into the way.
- **Banked**: the vault is covered with moss under turf, and in winter with drift snow, which the town harvests with
  **snow fences** (larch and wicker hurdles) upwind, because the Valley's 125-200 mm makes snow scarce. Tunnel mouths and
  skylights stay out of the fences' lee drift.
- **Records**: a tunnel is an edge between two door nodes, with a section kind (`full`, `slab`, `open`), a length and
  its junctions, plain data (`[G data]`), and an overlap check against buildings on `core/space`. The tunnels are a
  **way kind on `core/city`, `covered`**, beside streets and alleys, added **now**, before the kit's winter street is
  built (the owner, 2026-10-25), so the sheet's street and the capital's page lay them the same way. The city-layout work
  owns `core/city`: the change is agreed with it first (a note in `core/city/PLAN.md`), kept to the data side (a way
  record with its section kind, door-node ends and no three.js), and the kit draws the records it returns. It lands in
  Y2, with `node core/city/test-city.js` and Voth's and Verge's `verify.py --assert` and the hash baseline unchanged.

## 4. Heat, air and cold (researched 2026-10-25)

The rules below come from a survey of real practice (the sources are listed at the end of this section): the Inuit snow
house and Thule sod house, the Aleut barabara, Icelandic turf, Ladakhi and Pamiri houses, the Mongolian ger, the
Russian pech, the Swedish masonry heater, the Korean ondol, the Chinese kang, Yakutsk's permafrost building, and the
Lhasa low-pressure fire tests. Where a number is an estimate it says so.

### Layers: mass inside, insulation outside

- **Stone and earth store heat; they do not keep it in.** Granite conducts heat at about 3 W/m·K, rammed earth at about
  1, **ice at about 2.2**, while dry moss, larch sawdust, felt and fur conduct at about 0.03 to 0.08 and loose snow at
  0.1 to 0.3. A bare stone, earth or pycrete wall facing the outside is a heat sink.
- **So every heated wall is built, inside to outside: hide lining, air gap, mass (stone, earth or pycrete), insulation
  (dry moss or larch sawdust, at least 20 cm), weather skin (turf, or banked snow in winter).** The generator draws the
  layers in the cut-away and records them on the building (`layers`), so a heat simulation can read them.
- **Dry insulation only**: moss and turf conduct several times better wet. Earth and turf walls stand on a dry-stone
  plinth with a drained foot; dry stone is laid without mortar, which tolerates frost movement.

### The pycrete dome: keep the shell frozen

- **The lining is essential** (right in the first draft): hide hung 15 to 20 cm inside the shell, sewn panels, **closed
  at the top** so warm air cannot circulate into the gap, and never touching the shell, so it stays dry. In the
  Resolute study (Kershaw, Scott and Welch 1996) a lined snow house burned half the fat of an unlined one.
- **The frost rule**: the shell stays below 0 °C only while the insulation outside it is no more than about 1.6 times
  what is inside it (-19 °C outside, +12 °C inside). So the outer coat (moss, banked snow) is thinner than the lining
  plus its gap and the furs hung on it. This is a check in `verify.py`: for every heated pycrete dome, the recorded layers
  pass the frost rule.
- **Frost forms in the gap** on the shell side and is scraped off; the lining is the warm, breathable skin.
- **A room whose air touches ice is cold**: unheated snow and ice hotel rooms hold about -5 to -8 °C. Stores and
  freezing houses are built that way on purpose (section 1); living rooms never are.

### Stoves: burn hot, store the heat, put it under the platform

- **Every dwelling's hearth is a mass heater**, never an open fire in the living room (lamps only there): a short hot
  burn of 30 minutes to 2 hours once a day (twice in the coldest months) into 1 to 3 tonnes of stone, which gives the
  heat back over 12 to 24 hours (the pech and the masonry heater, about 80% efficient). This is the best use of scarce
  fuel: larch burns fast and hot, dung and peat smoulder, and a hot complete burn into mass wastes least of either.
- **The flue runs under the sleeping platform** (right in the first draft): the kang and ondol pattern, 5 to 10 m of
  channel under soapstone or flag slabs. **A suspended platform**, a slab box with an air space under it that warms the
  room too, rather than a solid one on the ground (a traditional kang is about 37% efficient, the suspended kind about
  67%). **Insulate under the flue**: birch bark (also the damp course) and at least 20 to 30 cm of moss or sawdust.
- **The stoking pit, not the tunnel** (changed from the first draft): a fire in the cold-trap passage warms it, defeats
  the trap and puts smoke on the only way out. The firebox opens into a **sunken stoking pit** off the side of the entry
  passage, below platform level, with a closable stone or larch door, fed by **its own air duct** from the outer porch.
  The passage itself stays cold.
- **The chimney stands inside the room**, masonry, so it warms the room as it rises; where it passes the pycrete it goes
  through a **stone collar with an air gap** (or the crown melts round it). A **damper**, shut only when the coals are
  dark (the pech's classic carbon-monoxide death).
- **At 0.8 atm** there is a fifth less oxygen and a fifth less draft: fires burn about 20% slower and smoulder more.
  Chimneys are drawn **about a quarter taller**, or their flues and air inlets a quarter wider, than a sea-level design
  (*an estimate*: derived from air density, not measured). People already short of oxygen are more endangered by carbon
  monoxide, so the vents are generous.

### Air: in low, out high

- **The stack**: fresh air comes in low through the cold-trap passage, stale air leaves through the crown vent; the warm
  pocket under the dome holds while the inlet stays below the platform. Every heated room has both, and the stove its
  own third (the stoking pit's duct). A `verify.py` check: every heated room has a low inlet, a crown vent and a stove
  air supply.
- **Moisture**: people and cooking put several litres of water a day into the air, and it freezes on the coldest
  surface. In a lined dome that is the shell side of the gap, which is where it is wanted.

### Ground and permafrost

- **A heated floor never sits on permafrost.** About 300 buildings in Yakutsk have failed since 1970 as the ground under
  them thawed. A heated building stands either on a **ventilated plinth** (stone sleepers on a rubble bed, open to the
  winter wind through vents in the plinth) or on **at least 30 cm of insulation** (birch bark over moss or sawdust) on
  gravel. The cut-away shows which. Stores and tunnels may sit on the frozen ground; they are meant to stay cold.

### Shared heat, the town's hearths

- **Waste heat goes to rooms, not ways** (changed from the first draft). The bathhouse (banya and sweat lodge, the
  town's largest stove) and the smithy share a **heat-storing mass wall** with the communal hall or the clan house next to
  them, so their spare heat warms a room people use; the tunnels stay cold.
- **Clusters are compact**: shared walls, earth banked between domes, the warm rooms at the centre of each cluster and
  the stores round them (section 1's warm core, cold ring), the communal heated buildings at the centre of the town.

### Numbers for the records (per household, per winter)

| | |
|---|---|
| Fuel, a mass heater | about 3 to 4 t of wood or its equivalent; dung gives about half the heat of wood per kg, so a dung-burning household needs about 6 to 8 t (the western Pamirs today: about 1.1 t of wood and dung a month per household) |
| Lamp fat | a lined 3 m snow house burned a seal's fat every 6.3 days; a qulliq gives very roughly 100 to 300 W (*an estimate*: no measured figure was found) |
| Body heat | 8 to 14% of what a snow house needs; the lamp and the stove do the rest |
| Interior | +10 to +20 °C on the platform with lamp and stove; the floor in front cooler; the tunnels -5 to 0 °C |

These go on the building records (`heat: {fuel, stove, vents, layers}`) so the economy (`core/simulation`, tuned on the
isle demo) can later charge a town for its winter fuel and its larch, dung and fat.

**Sources** (the survey of 2026-10-25): Kershaw, Scott and Welch 1996, "The Shelter Characteristics of Traditional-styled
Inuit Snow Houses", *Arctic* 49(4); the Alutiiq Museum on sod houses; Mislimshoeva et al. 2014 on Pamir fuel use
(*Mountain Research and Development*); studies of kang and ondol efficiency; GERES on Ladakhi passive-solar houses; the
Yakutsk permafrost literature; the University of Science and Technology of China's Lhasa low-pressure fire tests; the
Icehotel's published room temperatures; measured conductivities of snow, moss and fur. Not found, so estimated: a
qulliq's output, the conductivity of turf walls, pycrete and qiviut felt, and the altitude correction for draft.

## 5. Inside: the rich part

The lining is the first layer of decoration: sewn caribou and musk-ox hides, pale and seamed. Over it:

- **Furs**: musk-ox and caribou robes on every platform, **qiviut** (the musk-ox underwool) blankets and hangings in
  the rich houses, **fur mosaic** rugs (light and dark caribou strips pieced in bands, the Inuit and Chukchi trim work).
- **Tapestry**: **appliqué wall hangings** after Baker Lake (felted wool figures of riders, caribou, musk oxen, spirits,
  the lake) on the halls' walls; **Amur ornament** (Nanai and Ulch spiral scrollwork, cut from hide in the way their
  fish-skin coats are) as borders and on the lining; **Ob ornament** (Khanty and Mansi geometric bands: antlers, hare
  ears, birch twigs) on bands and bags; **beadwork** panels after the Evenki and Sakha, in bone, stone and traded
  porcelain beads, in the kingdom's dyes (larch red-brown, silverthorn yellow, lichen, birch-tar black) and a traded
  blue for the rich.
- **Sculpture**: **soapstone** figures (Inuit sculpture: the dancing bear, mother and child, the transformation figure,
  the drum dancer), **antler and musk-ox horn** carving, **engraved antler panels** (Chukchi engraving: hunts, rides,
  the seasons, black-filled lines on pale), **masks** on the shrine walls (Yup'ik), the **shaman's drum**, the carved
  **serge** repeated inside the halls as columns. *Proposed*: a small figure generator (as the Eternian head generator),
  a handful of seeded forms in soapstone, antler and larch, so no two halls carry the same pieces.
- **War loot, openly shown** (the owner, 2026-10-25): plenty of it. The raids' takings stand among the furs as
  trophies: Eternian porcelain and celadon on the platform shelves, silk hung over the hide lining, bronze tracery panels
  pried from a gate set into a hall's wall, lacquer chests, and **the State's statuary**: the closed-eyed metal faces and
  masks hung as trophies in the halls and the High Chief's, the rich showing the most. The heads come from the Eternian
  head generator read in place (`kits/eternian/src/42-et-head.js`, never copied), seeded by record id; the other pieces
  from the catalog's Eternian culture file, picked by a `loot` rule (a share by tier: none in the poor house, a few
  in the common, a wall of them in the rich and the halls), so they stay Eternian pieces in a Khaayken room.
- **Light**: soapstone lamps, many of them, low and warm; the halls lit from niches round the dome's spring line.
- **The catalog culture file** `kits/catalog/krator-master-furniture-khaayken.js` in the furniture SPEC shape, three
  tiers: poor (the platform with robes, the lamp and its rack, the drying rack over it, a hide bucket, the stone
  bench); common (the carved platform edge, chests of larch, the loom, the qiviut comb and spinning stand, the drum,
  the tea set for Ivan-chai); rich and civic (the High Chief's seat on its platform, the Quunsul's ring of benches, the
  shrine's mask wall, figures on their plinths, the hangings). The rest from the generic containers, food and supplies.
- **The interiors set** `kits/interiors/sets/khaayken.js`: the rooms of the domes, the clusters and the halls; chain
  `khaayken -> generic`.

## 6. What the kit holds (about 45 defs, *proposed*)

| Group | Defs |
|---|---|
| Dwellings, poor | the single dome (pycrete), the larch-and-sod half-dome of the forest-steppe (after the Sakha balagan), the herder's travel dome |
| Dwellings, common | the family cluster (three to five domes, a short tunnel), the composite house (stone heart, pycrete ring) |
| Dwellings, rich | the clan compound (a stone hall dome, a ring of satellite domes, a private tunnel, serge at the door, a heated floor), the clan house |
| The state | the **Quunsul hall** (the council of the clans: a ribbed stone dome, the benches in a ring), the **High Chief's hall** (Khaay Chiip), the song house (qaggiq), the shrine and spirit house, the clan tombs (corbelled stone, half-buried) |
| Tunnels | `yt_tunnel` (three sections), the junction dome, the warming dome, the hooded porch, the tunnel mouth with its lintel |
| Heat and bath | the bathhouse, the kitchen house, the smithy |
| Stores | the ice cellar, the root store and the frostroot freeze-drying house, the raised cache on posts (the Evenki labaz, against the voles), the meat store |
| Works | the **ice quarry** on the lake and the aufeis (saw lines, stacked blocks, the slurry pits), the **pycrete works** (sawdust bins, a moss-drying yard, block moulds, the freezing yard), the tannery, the qiviut combing and weaving house, the carvers' house, the tea house, the goldroot drying house |
| Stock | the musk-ox byre (stone, half-buried), the caribou corral and the hitching line |
| War | the **winter fort** (pycrete curtain, towers, gate, in `autumn` and `slump`), the watch tower, the signal cairn |
| Markers | inuksuit and cairns, serge, the clan stone |
| Leng | the **occupation pieces**: domes and tunnels set inside the Ancient ruin's halls, as Talia and Pylon set their buildings round theirs (*proposed*; the page is Leng's own plan) |

Every Voth census trade is carried, gapped with the def and phase that will carry it, or `na`, in `YT_TRADES`
(`tools/check_trades.py`), as `ET_TRADES` and `IS_TRADES` are.

## 7. Core adoption

| Module | Taken | For |
|---|---|---|
| `core/rand` (`KRAND`) | yes | every seed: a dome's courses, a cluster's layout, a carving, by (world, cell, index, salt) |
| `core/tags` (`KTAGS`) | yes | every building and tunnel registered before it is drawn; culture `khaayken` added to the vocab (`core/tags/52-core-tags-vocab.js`) |
| `core/space` (`KSPACE`) | yes | building and tunnel overlap on the sheet and the street |
| `core/mask` (`KMASK`) | yes | any placement from a painted mask (drifts, quarry yards) |
| `core/terrain` | yes | the sunken floors and tunnel trenches as carve patches |
| `core/host`, `core/walk` | yes | camera, inspector, polygon tool, walk keys, cut-away |
| `core/atmos` | yes | the standard sky; a snow-light preset and night for the lamp glow |
| `core/materials/record` | yes | `materials.json` on the library and the new sets (section 8) |
| `core/furnish`, `kits/catalog`, `kits/interiors` | yes | the culture file and the interiors set (section 5) |
| `core/lod`, `core/export` | yes | the sheet's LOD and the Godot export (P7) |
| `core/biome` | read through `biomes/nwouterwall` | the sheet's dressing and the `pyc` field, once that kit exists |
| `core/water` | no | the sheet has no open water; the frozen lake is the capital's page |
| `core/city` | yes, for the tunnels | the `covered` way kind (section 3) lays the winter street's tunnels; the capital and Leng go on it later |
| `core/simulation`, `core/hamlet` | not yet | the towns (`core/city`) and the forest-steppe villages (*proposed*: a Khaayken profile in `core/hamlet`) come later |

`python3 tools/check_core_use.py` runs before the kit is called done.

## 8. Textures

**Reuse** (in the library): `ice.clear` (windows, lenses), `ice.glacier`, `ground.snow011`, `ground.snow015`,
`ground.tundra`, `ground.turf.polygon`, `roof.turf` (the sod skirts and the balagan), `paving.flagstone` (the heated
floors), `stone.cut` and `rock.granite.tor` (the halls' ribs and piers), `wood.softwood`, `wood.carved` (the serge,
tinted), `wood.beam`, `bone.antler`, `bone.horn`, `bone.ivory`, `hide.fur.brown`, `fur.short`, `leather.buckskin`,
`hide.leather008`, `cloth.felt`, `wool.fleece`, `surface.fleece`, `cloth.rug.wool`, `fibre.rope`, `wax.tallow`.

**Delivered and processed 2026-10-25** (`core/materials/PLAN.md`, the delivery log; batch
`tools/textures/batches/chatgpt-2026-10u-yeti.json`): in `library/`, `ice.pycrete`, `ice.pycrete.weathered`,
`masonry.pycrete.course` (three courses a tile, 2 x 1.5 m), `stone.corbel.slab` (tintable), `stone.soapstone`,
`fur.muskox`, `fur.caribou`, `hide.gut`, `hide.panels.sewn` (tintable); in `patterns/khaayken/`, `serge-carving`
(tintable), `amur-scroll`, `ob-band`, `beadwork`, `fur-mosaic`, `applique-hanging`, `engraved-antler`. Wired in Y1.
**Still owed**: the cut script's lintel band, which waits for the script chart (`lore/tongues-of-krator.html`; listed in
`PROMPTS-NEEDED.md` under "Gaps with no prompt yet").

## 9. Phases

| Phase | What | Done when |
|---|---|---|
| Y0 | the owner approves the plan; the prompts are pasted; `refs/` from the owner if any | the questions below are answered |
| Y1 | scaffold: the engine vendored, `build.py` (port lint), `verify.py` on `tools/harness.py`, the sheet, `INDEX.md`, `PORT.md`; `khaayken` in the tags vocab; `materials.json` | the single dome builds and `--assert` passes. **Built 2026-10-25**: the engine vendored (`10-core.js` on core/rand, the one deliberate drift), `materials.json` (48 families: the delivery of 2026-10-25, the library's snows, turf, flags, larch, the catalog's render families), the toolkit (`40-yt-kit.js`) and `yt_dome` in winter, autumn and summer, the sheet's ground holed for sunk floors (`90y-yt-ground.js`); `--assert` passes but `tags-vocabulary` until `khaayken` is registered (`KNOWN_ISSUES.md`) |
| Y2 | the helpers: the catenary dome (spiral and corbelled courses, ribbed), the wall layers (section 4), the cluster and its passages, the cold-trap entry with its katak and stoking pit, the platform, the tunnel in three sections, the sunken floor on `core/terrain`, the `season` and `slump` states; the `covered` way kind in `core/city` (agreed with the city-layout work) | a test row of domes and tunnels in the three seasons; `test-city.js`, Voth, Verge and the baseline unchanged. **Built 2026-10-25**: `ytShell` (doorways anywhere in the lower band, spiral or level courses, the slump), the corbelled profile, ribs, the portal, the wall layers and the frost rule (`40-yt-kit.js`); the mass heater (`41-yt-heat.js`: the stoking chamber off the entry with its air duct, the suspended flued platform over its moss bed, the chimney a quarter taller, collar and damper); the tunnels (`42-yt-tunnel.js`: full, slab, open; junction and warming domes); `yt_travel_dome`, `yt_stone_dome`, `yt_family_cluster` with `yt_sleep_dome` and `yt_store_dome`, and four samples; the covered way is `core/city/36-city-covered.js` (`KCITY.covered`, its own `test-covered.js`; listed by no other build, so `test-city.js` and every other page are unchanged); `verify.py` adds `frost-rule` and `mass-inside` |
| Y3 | the dwellings, every tier and shell, and the **winter street** (domes joined by tunnels, one cut away, the night glow) | the owner's eye-level review of the street. **Built 2026-10-25** (awaiting that review): `yt_balagan` (the forest-steppe house: battered larch walls daubed with earth, a sod roof, a cold porch, the chuval stove, ice or gut windows to the north), `yt_composite_house` (the stone heart in a pycrete ring), `yt_clan_compound` (a stone hall with three pycrete domes, serge at the door, hangings, a fur-mosaic rug, beadwork), every dome house and cluster in a covered variant (its passage ending on a tunnel), `yt_winter_street` (eight houses of every tier on one covered network, `ytDoorNetPlan` on `KCITY.covered`), the night glow (`91y-yt-night.js`), the serge, hangings and rugs (`43-yt-craft.js`); doorways cut to the arch of the vault through them; kerbs where walls meet the ground |
| Y4 | the state, heat and bath (the mass heaters, stoking pits, suspended platforms, flues, chimney collars and plinths drawn in the cut-away; `heat` and `layers` on every record; the bath and smithy's shared mass wall), stores, works, stock, war; `YT_TRADES` complete | the civic row reads; the fort reads in both seasons. **Built 2026-10-26**: `yt_quunsul_hall` (ribbed stone hall, benches in rings round a central stone stove), `yt_chief_hall` (ribbed stone hall over its cluster ring, the high seat), `yt_song_house`, `yt_shrine` (the mask wall), `yt_clan_tomb`; `yt_bathhouse`, `yt_smithy`, `yt_kitchen_house`, `yt_tannery`, `yt_weaving_house`, `yt_carvers_house`, `yt_tea_house`, `yt_goldroot_house`; `yt_ice_cellar`, `yt_frostroot_house`, `yt_raised_cache`; `yt_ice_quarry`, `yt_pycrete_works`, `yt_muskox_byre`, `yt_caribou_corral`; `yt_winter_fort` (autumn and slumped spring), `yt_watch_tower`, `yt_signal_cairn`; the props (`44-yt-props.js`); `YT_TRADES` on the shared census check (25 carried, 5 gaps for Y6, 14 na); the three dome caps (turf, snow, lining) mapped from the crown |
| Y5 | the interiors: the catalog culture file and **`khaayken` registered in core/tags** (`CATALOG_CULTURES` and `CULTURE_NAMES` together: one all-builds rebuild, with `TODO.md`'s ride-along items, and the baseline rewritten once), the interiors set, the figure generator, the hangings, the war loot (the Eternian heads read in place, the `loot` rule), the 1.15x furniture scale in `core/furnish`; the furnished cut-aways | a hall and a house read rich at eye level |
| Y6 | Leng's occupation pieces; the forest-steppe set on nwouterwall's flora, if that kit is built | the pieces stand inside the ruin's halls on a test row |
| Y7 | `verify.py --assert` (domes closed; no pycrete touching a firebox or an uncollared chimney; every heated pycrete dome passing the frost rule; every heated room with a low inlet, a crown vent and a stove air supply; no heated floor on permafrost without a ventilated plinth or insulation; no heat in a tunnel; every tunnel ending at a door), the Godot export and its case, the index tools, the gallery | the sheet exports and passes; Krator Worlds carries the page |

## 10. The owner's answers (2026-10-25)

1. **Names**: the folder `kits/yeti`, the catalog and tags culture `khaayken`.
2. **Body**: a little larger than human, **1.15x** (the scale note at the top).
3. **"Half-buried, half-roofed"**: sunk half below ground, with a roof of removable pycrete slabs that comes off in summer
   where pycrete is seasonal (section 3).
4. **Tunnels on `core/city`**: the `covered` way kind is added now, agreed with the city-layout work, in Y2 (section 3).
5. **The engine**: the Scyvoi engine vendored.
6. **The Valley's fibre**: larch sawdust from the open larch of the Valley bottoms, **moss pycrete** in the high treeless
   places, and sawdust traded up from the forest-steppe when the Valley's runs short. So the Valley's works carry both
   mixes, and the pycrete works (section 6) a sawdust store and a moss-drying yard.
7. **Trade goods in the halls**: plenty, **as war loot**, openly shown as trophies (section 5).
8. **Textures**: all sixteen delivered and processed the same day (section 8).

## 11. Y5: the shared culture rebuild (the owner, 2026-10-26)

Registering `khaayken` in `core/tags` rebuilds every page, so the owner chose to put every waiting culture into the same
rebuild (one vocabulary change, one rebuild, one baseline rewrite):

| Culture | What lands | Look (from the lore and the owner) |
|---|---|---|
| `khaayken` | a new catalog culture file; registered | section 5: the platform, robes, the lamp and its rack, larch chests, the loom, the drum, the high seat, hangings, soapstone and antler |
| `tungang` | a new catalog culture file; registered | **post-apocalyptic Soviet** (the owner): the Rift line's union crews a thousand years on (`biomes/riftrim/PLAN.md` section 6): lodge (loj) halls, the Book's lectern, the steward's desk, bunks in galleries, salvaged Ancient plate and pipe, rivets, lamps of glow-cap, red-painted signs worn to rust-pink; things kept by rite without memory of their use |
| `fellgang` | a new catalog culture file; registered | **a more primitive, militaristic, "punk" version of the Tungang** (the owner): the highland branch on the fells (LORE 6.20): the same salvage gone raw, spikes and bolts, war trophies, bone-and-plate, hide over scrap, painted slogans half-remembered |
| `talovolci` | a new catalog culture file; registered | **Gaulish** (the owner; LORE 6.21): giant-scale (2.3 to 2.6 m), roundhouse furniture: benches round the hearth, the cauldron and firedogs, wickerwork, checked wool in weld-yellow, woad and madder, the feasting board, torcs and brooches, the spiral on everything |
| `jimjam` | a new catalog culture file; `NO_CATALOG` lifted | the city's brick, marble and gold (`settlements/jimjam/DESIGN.md`): poor ochre and terracotta, middle brick and marble, rich gold and inlay, the jharokha's carved timber |
| `dalab` | a new catalog culture file; `NO_CATALOG` lifted | Cahokian monumentality in rammed earth, green-skinned genepriests (`settlements/dalab/DESIGN.md`): peasant wattle and thatch, middle timber, noble grey megalithic stone with relief, The God's light |
| `pylon`, `talia` | registered (their culture files exist; their records tag unknown today) | as built |
| `eternian` | already registered; its pieces taken into this kit's `FURN_CULTURES` for the war loot (section 5) | as built |
| weapon racks | `claude/weapon-racks` (55c2913f7, the arms file: a rack and an armour stand for every culture) merged, with racks for the six new cultures | |

With them, `TODO.md`'s "Ride along with the next all-builds rebuild" items (the re-vendored culture symbols, the probes'
sample points and broad phase, the camera's pointer-capture guard, the hamlet comment, the door module where it is ready).

**Order**: the six culture files, each built and checked on the catalog page (`kits/catalog/verify.py --assert`) before
the next; the weapon racks merged; the vocabulary changed (`core/tags/52-core-tags-vocab.js`, `test-tags.js`'s digest)
with `FURN_CULTURES` in the catalog core; the ride-along items; every build rebuilt and verified; `PORT-BASELINE.json`
rewritten once for every page that moved; `tools/test_all.py`. Then this kit's own Y5 (the interiors set, the figure
generator, the loot rule, the 1.15x scale) on its new culture file.
