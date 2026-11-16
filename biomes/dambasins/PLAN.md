# The dam basins: an overlay (plan)

The first of the north basin's two **overlays** (`biomes/nsemiarid/PLAN.md`, sections 2, 3 and 5; the other is
`biomes/scablands`). An overlay owns no ground: it lies over whatever biome is there (n semiarid; on the east bed,
Korona too), shapes the land after the biome's own detail, writes the fields the biome kits read, places its own
objects, and has only the flora that means nothing without it. This one is the two dam lakes' drained beds: the west
bed (41,408 km², all in n semiarid) and the east bed (47,792 km²: 23,168 in n semiarid, 24,564 in Korona).

## 1. What it is made of

| part | where it comes from | state |
|---|---|---|
| the bed's marks (levels, sill, bands, strandlines, the ring, salt, silt, yardangs, benches, the beach ridge) | `core/terrain/40-core-basin.js` (`KBASIN`), with its node test | **built** (2026-10-21) |
| the docks on the old full line, the ferry ramps, the lighthouse on its knoll | the Ancient Port kit (`kits/port`), read in place, its segments at decay 1 (ruined) and 3 (salvage), dry | D0 |
| the hulks, in three populations by where the falling water left them | the port kit's vessels, grounded: heeled on the slope, buried by silt (a grounding transform round the kit's `kput` and the vessel's group, this build's own) | D1 |
| the flora | the n semiarid kit, read in place (its fields from `KBASIN.sample`: `bed`, `silt`, `strand`, `ring`, `salt`, `dry`); on the east bed the hyperjungle (Korona's warm wet floor) | **built** on stations 2 and 3 (2026-11-08); station 1 has none yet |
| the stranded wrecks: the lake's working boats, whole, snapped, broken up, half buried | this build (`50-db-wrecks.js`), placed by the bands and strandlines | **built** (2026-10-23) |
| the flood's debris: torn plating, half-buried containers, rotting I-beams, off the ships, the buildings and the dam | this build (`52-db-flotsam.js`), thickest on the fast-drain slope | **built** (2026-10-23) |
| the wind's dust off the bed | core/atmos `3d-dust` (opt-in), masked to the bed | **built** (2026-10-23) |
| its own flora: hulk gardens | iron locked up in alkaline silt, and metal that condenses dew: vines rooted in rust make each hulk a green island (the rust vine is in the n semiarid kit already, tagged and unplaced) | D3 |
| dress: pre-dam villages, the stumps of the drowned forest with silt lines on them, shell banks | this build | D4 |

## 2. The engine

**The Ancient Port kit is the engine**, the way Hook (`settlements/hook`) and Ys take it: `build.py` reads every
fragment of `kits/port/src` and the core lists the kit's own `build.py` names, in place, and adds this build's
own fragments. A `src/` file with a kit fragment's name shadows it; `python3 build.py --vendor-check` reports the drift.

What has to change for a **dry** port, and where:

- **The ground.** The kit's natural coast (`portNatH`: a beach at y = 0, a seabed to -30 m) gives way to the bed's
  land (`DB_NAT`, this build's `80-db-bed.js`). `src/71-port-terrain.js` is an adapted copy with Ys's hook pattern
  (`YS_NAT`, `ysGroundTint`, no port scrub) under this build's names, plus two more: **no sea sheet** and **no
  underwater fade** (every kit material fades below y = 0, and here everything below y = 0 is dry silt). These hooks
  belong upstream in the kit (a shared change: the port and Hook pages rebuild); `KNOWN_ISSUES.md` holds it.
- **The frame.** The kit's y = 0 is the old **full level** (900 m on the west bed, 1,050 on the east), so its decks
  stand at their 6 m freeboard over the old water, as they were built. Land (-z) rises behind the line; the bed (+z)
  falls in front of it: the bathtub ring (0 to -30 m), the fast-drain band (-30 to -200: the sill), then the slow
  recession's staircase.
- **The hulks** are the kit's vessels placed by `portPlaceVessel` (their own budgets, PRNG saved round them, their own
  d = 3 dressing), with a grounding transform this build adds: heel and pitch from the slope under the hull, and a
  burial depth from `silt`. The kit's batched items (`kput`) take a builder's offset (`KOFF`, which a vessel builder
  sets to its midship) and its group matrix (`KXF`), so the transform folds into both while the vessel builds, and its
  meshes take it on their group after. No kit file changes.

## 3. Stations

Each station is its own page from the same build (the Throne's and Korona's `--station` pattern), a target here
(`targets/<station>/`: `89z-rows.js` the layout, `91z-views.js` the views):

1. **`port`: the old port on the 900 m line** (D0, D1). A run of the kit's segments, ruined, along the old full line;
   the ring's bleached band under it; the fast-drain slope falling away below, gullied and slumped, with the moored
   hulks heeled at the docks' foot; ferry ramps running down into dust. The first page.
2. **`graveyard`: the ship graveyard at the west notch** (D1, D2). The vessels drawn by the outflow toward the breach,
   piled in the notch approach. Boatmurder's pile at the east breach's mouth is one of these (a bandit camp later, on
   `core/sockets`). **Built 2026-11-08** (`targets/graveyard/`): the valley converging on the west dam (dams.json: crest 950,
   foot 700, cut 460, so the frame's floor is -200 at the dam's face and the cut -440), its flanks crossing the old line with
   the bathtub ring on both; the outflow's channel along the floor, 1.1 km wide and shallow 3.2 km up, narrowing over its
   last 1.5 km into the gap and deepening to the cut, grooved, with giant current ripples (the basin's marks kept off it: it
   was cut after the levels were left); thirteen hulks jammed in its throat, broadside at the gap and lying along the flow up
   it, each on the channel's floor and clear of the others (KRAND-hashed spots); the dam's two broken ends as a stepped
   gravity section and its blocks down the channel; the lake's boats (the wrecks) and the debris thick in the channel; the
   n semiarid kit's flora read in place over a 2.6 km window, thinned by the scour. Its own checks: `gy-channel-cut`,
   `gy-pile-in-the-channel`.
3. **`east`: the east bed inside Korona**: the overlay over a second biome kit. **Built 2026-11-08** (`targets/east/`): the
   east lake's eastern shore (full level 1,050 m, the sill 850, today's lake at -60 m far out of the station:
   `biomes/korona/NOTES.md`), station 1's shore profile with Korona's western ring rising 1,450 m in 6 km behind it, cut by
   ravines; no port and no flood (the east breach ran west); the hulks' third population, six ships trapped below the sill
   and grounded on its strandlines; the wrecks on the strandlines, little debris; the bed is forest, not salt: the
   hyperjungle read in place (Korona reads it on its warm wet floor), thinner on the drain band and nearly none on the ring's
   calcite; a wet climate, no dust, a humid haze, the bed's palette darkened to forest soil (`DB_SITE.tint`). Its own checks:
   `east-the-ring-rises`, `east-hulks-on-the-strandlines`.

**How a station is made** (2026-11-08): a target's `79-db-site.js` sets `DB_SITE` (its levels, its ground's shape `base`,
the basin's `member`, the wrecks' and debris's windows, its palette `tint`, its `climate`, `dust`, `fog`, the verify's
window `check` and its own `checks`); without one the page is station 1's. Its flora is `build.py`'s `TARGET_KITS` (the
biome core and the kit's fragments under the `91m-bio-` prefix, the kit's pack, and the target's own binding
`91m-bio-45-*.js` and build `91m-bio-89-*.js`). **Scale model 5.1:** the dams keep their numbers (`dams.json`), but neither
bed closes under its full level on 5.1's ground (a fill from either lake's seed spreads over most of the map), so every
station is an ideal type on the plans' numbers; `openworld/north-basin` is on `biomes/STATIONS-MAP-5.1.md`'s re-cut list.

## 4. Order of work

- **D0** the build, the adapted terrain, the bed's land and tints from `KBASIN`, a ruined port run on the old line, the
  verify (the kit's invariants, imported, and this build's: no sea drawn, the decks on the old line, the ring under it).
- **D1** the grounding transform; the moored population at the docks' foot.
- **D2** the n semiarid kit read in place: its fields from `KBASIN.sample`; the graveyard station. *Done 2026-11-08 on stations 2
  and 3 (the east bed takes the hyperjungle); station 1's bed has no flora yet.*
- **D3** hulk gardens (the rust vine and its kin, on the hulks and in their shade).
- **D4** the dress: drowned villages, stumps, shell banks; the lighthouse knoll.
- **D5** `WORLD_OVERLAYS` in the open world (`biomes/nsemiarid/PLAN.md`, step 6), where the overlay meets the scale
  model's `palaeo.png` and lies over two biomes. **The density there is not the station's** (the owner, 2026-10-23: "the
  real deployment would probably not have quite so many ships, or have them spread over a much wider area; as a demo
  this is great"): the station packs a bed's worth of wrecks and debris into a few kilometres to show them; the open
  world spreads them over the whole 41,000 km² bed, far thinner, thickest only where the water left them (the drain
  band's head, the strandlines, the notch approach).

## 5. Checks (`verify.py --assert`)

The kit's own invariants (imported from `kits/port/verify.py`, as Hook does) and:

- **no sea**: no sea sheet is drawn, and `WATER.heightAt` is null everywhere on the station;
- **the old line**: every placed segment's deck stands at the old full level plus the kit's freeboard;
- **the ring**: the bleached band lies under the old line, as deep as the ring (30 m), and nowhere above it;
- **the hulks aground** (D1): every hulk's keel within its burial of the ground under it, none afloat, none in the air;
- **the wrecks on the bed**, **the debris half buried** (every piece in the silt and out of it), **the dust in the wind**
  (none in a calm);
- each with a broken input that must fail.

## Fauna (proposed 2026-11-11, awaiting the owner)

Drawn by `kits/fauna` and tagged by biome (`biomes/README.md`, "A fauna kit"); placed by `FAUNALANDS` (`kits/fauna/fauna-lands.js`).
The brief (`kits/fauna/BIOME-FAUNA-PLAN.md`): for an overlay, only the animals that mean nothing without the beds (the host biome, n semiarid or Korona, brings the rest), and **at least one animal
found nowhere else**. **New** = to be built in the kit; *shared* = an existing key that also gets this biome's tag, because its
range plausibly runs across the border. Nothing here is built.

| Role | Animal | Status | Where | Why it is here |
|---|---|---|---|---|
| scavenger (grazer role) | **rust crab** | **new, unique** | inside and around the grounded hulks; under the rust-vine hulk gardens (D3) | a land crab (`faWdCrab`), shell up to 1 m across, that lives in the holds of the hulks, drinks the dew the metal condenses and grazes the rust vine and the algae of the shaded steel. It moults in the holds, so the dark compartments are full of cast shells. A hulk is a crab colony, as a hulk is a green island |
| water | **silt skipper** | **new, unique** | the wet silt and strandline pools at today's lake margins (the low tropical beds, Af/Aw) | an amphibious fish (`faWdFish`, a pectoral-crutch walk) the length of an arm, after the mudskipper: it hops over the soft silt between pools and digs its burrow in the newest bed. It lives where the water left last, so it marks today's shore |
| flyer | *flamingo* | shared (eastabyss) | the salt flats of the east bed and the brine edges | the eastern abyss's salt-lake bird, on the nearest salt to it |
| grazer | *brine-flat-onager* | shared (eastabyss) | the east bed's salt steppe | |
| everything else | the host's: `nsemiarid`'s (its Fauna section) on the west bed; Korona's (the hyperjungle's and sedesert's) on the east bed's Korona half | read by the host's tag | | an overlay owns no ground and no general fauna |
