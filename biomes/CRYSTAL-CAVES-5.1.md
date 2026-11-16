# Crystal caves on scale model 5.1 (planned, 2026-11-03)

The owner (2026-11-03): a Naica in the Hearth hold's drained storey, and planned crystal caves for the Neo-Ozarks, the
flood basalts, and thundereggs and vugs on the Throne, which the Zeijani revere as shrines. This file is the plan. The
modules exist; no station draws one yet.

**Why crystals grow huge.** A crystal grows large when mineral-laden water stays just saturated in an open void for a very
long time, so a few crystals grow and none new ones start. Earth's walk-in crystal caves come in three kinds:
- Naica's gypsum beams (to 12 m) grew in limestone and anhydrite above a magma body, under water held just below 58 degC for
  about a million years, then drained.
- Mississippi Valley caverns (calcite, celestine, galena) grew in dolomite fed by warm basin brines.
- Basalt geodes (the Uruguay amethysts, to about 3 m) are gas bubbles in thick flows, filled later by silica in groundwater.

Thundereggs and vugs are their small cousins in rhyolite and welded tuff.

**The modules** (`core/README.md`):
- `KSPELEO`'s crystal kinds: `beam` (a megacrystal rising from the floor across the void until it meets rock), `block`
  (stubby crystals on the floor) and `druse` (points on their own floor or roof). Each record carries its mineral.
- Its presets: `KSPELEO.SELENITE`, `AMETHYST`, `CALCITE`, `VUG`.
- `KKARST`'s hypogene kind takes `crystal: {storeys, speleo}` to dress a storey's chambers and crusts with a crystal preset.
- Beams and blocks block a walker (`KSPELEO.blocks`).

At 0.75 g a crystal beam carries three-quarters of Earth's load, so beams longer than Naica's can stand. The preset allows
14 m, and a station may raise it.

## The sites

| # | Site | 5.1 px | Kind | Preset | Status |
|---|---|---|---|---|---|
| 1 | **The Hearth hold's drained storey** | 525,1400 | a Naica: selenite beams and blocks in the hypogene chambers the water left | `SELENITE` via `KKARST` `crystal` | **the owner's choice**: hearths station 2 |
| 2 | **The Neo-Ozarks' caverns** | 988-1132, 290-364 (`tube_ozarks_15`) | Mississippi Valley: calcite druse and blocks, celestine beams, galena and sphalerite | `CALCITE` | planned; the new north (low priority) |
| 3 | **The flood basalts' geodes** | n semiarid ~800,470; the Siphon Pits' rims; the Loom-Chasms terraces | amethyst geodes in thick flows, a few big enough to step into | `AMETHYST` | **built** in the scablands' coulee (2026-11-09: `KGEODE`, the walk-in geode a fallen block); the plateau and the other rims later |
| 4 | **The Throne's thundereggs and vugs** (Zeijani shrines) | the Throne/Volcano region, 760-940 x 758-927 | thunderegg walls in the galleries, vugs a person can stand in | `VUG` | planned; the shrines are the owner's (lore: `LORE.md`, "The Zeijani's stone eggs") |

---

## 1. The Hearth hold's drained storey: a Naica

- **Where.** `riftrim --station hearths` (hearths station 2, the hold: `biomes/hearths/PLAN.md`), 5.1 px 525,1400, at
  3,736 m on the rim's vent shelf (`biomes/KARST-SITES-5.1.md`, site 4).
- **Why here.** It is Naica's recipe exactly: hot sulphurous water rising through lake limestone and gypsum over the vents, at
  55 degC in the hold's plan (Naica grew at 54-58). The **active storey** is still flooded and still growing. The **older
  storey above**, drained when the table fell, is the Cave of Crystals: selenite beams crossing the chambers, blocky
  crystals on the floors, gypsum druse on the walls. It is hot and close to saturated: the water left, the heat did not.
- **The arguments.** `KARST-SITES-5.1.md`'s site 4 network, with `crystal:{storeys:[1], speleo:'SELENITE'}`. Then over each
  `N.crusts` record of storey 1:
  `KSPELEO.place(C, {box: crust.box, y: (crust.y0 + crust.y1) / 2, world, cell: 2, kinds: KSPELEO.SELENITE})`. The active
  storey keeps `KSPELEO.HYPOGENE`.
- **Hazards.** `KKARST.hazards` covers the active storey (scalding pools, bad air, the acid's drips). The drained storey's
  **heat** is the station's to add: a `heat` record over its chambers with `soak` (Naica's air, about 45-50 degC at near
  100% humidity, kills an unprotected visitor in tens of minutes), plus `slip` on the beams. The Tungangs, who keep the
  hold, would cross it in cooled suits or not at all (*proposed*).

## 2. The Neo-Ozarks: Mississippi Valley crystal caverns

- **Where.** `tube_ozarks_15` in `DATA.tubes` already names three of them:
  - the Cathedral of the Red Porphyry Vein (1056,330), a phreatic hall on a dike wall;
  - the Onyx Pillar and Chert-Bridge Labyrinth (1020,340);
  - the Shut-In Big Spring resurgence (988,324).

  The tube's line runs outside the `neo-ozarks` polygon (1109-1318 x 107-231). That is still for the owner
  (`biomes/KARST-SITES-5.1.md`).
- **The cave.** Cherty dolomite fed by warm spring water (Spider Lake's 28-42 degC seeps, `biomes/spiderlake/PLAN.md`)
  grows scalenohedral calcite druse, calcite blocks, thin celestine beams, and galena and sphalerite on the joints: the
  Ozarks' own ores. The Onyx labyrinth's banded cave onyx is the limestone dress (`KSPELEO.LIMESTONE`) beside it.
- **The arguments.** A `KKARST` `maze` on the dolomite's joints for the labyrinth, then `KSPELEO.CALCITE` in its chambers.
  The Cathedral is a hall, dressed by `CALCITE`.
- **Who.** The tube's culture is `miners_and_spelunkers` (`tubes.json`); the silk-wrights of Spider Lake are a day off.
  Galena is a silver and lead ore, so the caverns are mines as well as wonders. The resources field's `silver` and the
  `skarn` layer would give them nodes once the region is built.

## 3. The flood basalts: amethyst geodes

**Aura and bismuth** (2026-11-09: `KGEODE.MINERALS` has both, `natural: false`). Neither grows in a flood basalt's gas bubbles, so the
owner moved them out of the scablands' coulee (2026-11-09): **bismuth is built at the Throne's vents** (`biomes/throne/stations/vents/
87g-host-bismuth.js`: `KGEODE.around` round every fumarole, 98 pockets at 72 vents, checked with a negative); **aura is in Godstep's
plan** (`biomes/godstep/PLAN.md` section 2), built with its first station. Why there:
- **Aura: the Godthrone's titanium basalt**, Godstep's four ponded steps (`biomes/godstep/PLAN.md`). Aura quartz is quartz under a
  titanium oxide film; geodes in a titanium-rich flow whose crystals took a film from the rock make that a place, not a trick. The
  Rift ("iridescence is the rule", `LORE.md`) is the second choice. Not the Gills: their plan keeps iridescence out.
- **Bismuth: the Throne's vents** (`biomes/throne`, `--station vents`). Hopper crystals grow only from a melt; a fumarole whose
  sulphides break down to native bismuth (melting at 271 C) in pockets of a vent chimney, cooling to hoppers with an oxide film, is
  the one natural setting. The lava delta and the caldera are the next choices; an Ancient foundry's slag (the metropolis) a third.

- **Where.** The basalt province (`kits/resources/GEOLOGY.md`):
  - n semiarid's plateau (~800,470) and the scablands' coulee walls (station 1, the west breach, cuts through the stacked
    flows and shows their geode-bearing tops);
  - the Siphon Pits' rims (their hot maars give the silica water);
  - the Loom-Chasms' basalt terraces.
- **The cave.** Geodes are gas pockets in the top of a thick flow, filled by silica groundwater over ages: agate rinds,
  amethyst inside. Most are fist-sized; a few, Uruguay's "Empress" (3.3 m), are rooms. The plan: a scatter of small
  geodes as a ground and cliff dressing, and **one or two walk-in geodes per region**, each a `KCAVERN` hall 2-5 m across
  (`belly` high: a round pocket) opened by a coulee's cut or a quarry, dressed with `KSPELEO.AMETHYST`.
- **Who.** Prospectors and the stone trade; amethyst is a gem. A `kits/resources` node kind (a geode bed) is a later
  decision, not part of this plan.

## 4. The Throne's thundereggs and vugs: the Zeijani's shrines

- **Where.** The Throne's flanks, where the `tuff` layer is high (to 197): the welded tuff and rhyolite the Zeijani carve.
  Their cave villages, from the scale model: Dhelv (840,776), Šurpu-Dhelv (806,818, four levels of galleries over a lava tube),
  Qarnu-Tūbu (834,882, terraced collapse skylights and a stepwell), Nūru-Šaplu (876,802, carved into a drained magma
  chamber).
- **The stones** (`LORE.md`, "The Zeijani's stone eggs"): thundereggs are round nodules that ring dull until split open
  to an agate star; vugs are gas pockets lined with quartz points and the odd topaz.
- **The shrines** (the owner: revered by the Zeijani; the details *proposed*):
  - in each village, **a thunderegg wall** in a gallery: the eggs half-cut where the carvers met them, left in the wall,
    with lamp niches and offerings, the floor worn by knees;
  - in Nūru-Šaplu, **a vug a person can stand in**, the drained magma chamber's gas pocket, its quartz points lit by lamps.
    This is the Zeijani's great shrine.
- **The arguments.** A vug is a small `KCAVERN` hall (0.5-3 m) dressed with `KSPELEO.VUG`. A thunderegg wall is a cluster
  of split eggs on a gallery wall: a `kits/zeijani` dressing (a new piece: a half egg, its agate face), not a speleothem.
- **The kit.** `kits/zeijani/PLAN.md` section 13 has the pieces this needs.

## What is owed

- **Materials.** Selenite (water-clear to milky blades), amethyst, calcite (honey to white), celestine (pale blue),
  quartz, topaz, and agate (a thunderegg's star). Check `core/materials/PLAN.md` before generating any. KSPELEO's mesh
  gives each vertex its kind, and the record its mineral, for the dressing.
- **A station each.** Only site 1 has one (hearths station 2). The others wait for their regions' kits.
- **Tests.** `node core/terrain/test-speleo.js` holds the crystal kinds and the old presets' digests.
  `node core/terrain/test-karst.js` holds the crystal storey.
