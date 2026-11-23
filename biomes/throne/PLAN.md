# The Throne: plan

The kit's plan lives in `NOTES.md` (the lore, the stations, "Building it") and `HANDOFF-FLORA.md` (the new flora). This file holds
the final rebuild's adoption record, as every rebuilt kit's `PLAN.md` does.

## Core adoption (the final rebuild, pair 5, 2026-11-02)

The kit's turn in the all-biomes rebuild (`HANDOFF-REBUILD.md`, pair 5 with ebadlands; `BACKPORT.md` section 1 and the Throne's row in section 2),
on all eleven pages: station 1 (`src/`) and the ten stations (`stations/*`, `python3 build.py --station <name>`). The universal set is in `src/`
fragments no station overrides, so every page takes it the same way; each piece reads what its page has and does nothing where there is nothing.

| Item | Where | Switch |
|---|---|---|
| `BIO.LOD.merge`, `minTris` 1500, `fade` .15; the runtime LOD tick | `80-host-core.js`, `98z-host-core.js` | `?lodmerge=0`, `?lodfade=0` |
| Octahedral impostors for the far trees (one set, `throne.trees`; a species bakes its first hero), `BIO.impostorLook` gain 2.2; the hyperjungle's set on the kipuka and the frontier with it | `55` (`buildTrees`), `89zz` | `?imp=0`, `?impgain=`, `?impwrap=` |
| KGROUND: every ground's library layers sampled through KGROUND's hex tiling and distance scale (`THRONE.layGLSL`, `70`); the layers' weights stay each ground's own masks (the fields, the flows' ages, the snow, the ice) | `70`, every `84` | `?kground=0` |
| **The grounds on KGROUND's hook, with its relief** (2026-11-03, the ground workstream; `core/README.md` "Adopting KGROUND's relief"): every station's ground but the tube's is MeshStandard (it was Lambert, lit per vertex: the relief needs the light per pixel), and its library layers go to `KGROUND.hook` (`THRONE.kgGround`, `70`) instead of its own blend: hex tiling, the distance scale, the height blend, the relief `{bump: .075, cavity: .8, mesh: 1}` and the mesh's hollows (`KGROUND.cavityMesh`, `THRONE.kgCavity`); the side planes (`tri`) where the cliffs are (the caldera, the blast, the delta, the penitentes, the glacier). Each page keeps its paint, its zone weights, its detail, its glow (sampled from the hook's layers, `THRONE.kgE`), its glints and its canopy far off; the layer kinds go into the same hook. Gone with the old blend: the per-layer triplanar on the cliffs (the hook's side planes stand in), the snow's macro variation, the isle's colour-kept sinter, rims and sulphur (now the paint times the layer, gain 2) | `70`, every `84` | `?relief=0`, `?kground=0` (the old blend, Lambert's shader on MeshStandard), `?kinds=0` |
| KHORIZON over the map, on each ground with two texture units free and on the flora | `89zz` | `?hz=0` |
| R8 wind (`BIO.bindAtmosWind`), R7 alpha to coverage (`BIO.setA2C`) | `89zz` | none |
| Height fog with each station's numbers (`ATMOS_AIR` in its `45`: none on the caldera and the ash desert's mist, a graben mist on the vents, the dry season's on the savanna); the glacier keeps its own | `89zz` | `?fog=0` |
| The rain's occlusion map where the ground has a texture unit free (not the isle's or the vents' ground: 16 of 16) | `89zz` | none |
| Lightning (the branched bolt) on every page with weather | `build.py` | none |
| `WATER.mirrorSwitch`, off at page load, on the largest still: station 1's acid lake, the vents' marsh, the glacier's lake | each `89w`, `98z` | the panel's button, `?mirror=` |
| The water as fields (`WATER.fields`, ext/60), before the build (the build moved from `88` to `89z` for it): the flora's mask, a tree's bole kept its own width off the water (`THRONE.veto`), the kit's wet field from the shore, a wet band on the ground (a vertex attribute, no texture unit) | `89x-host-fields.js`, `55` | `?fields=0`, `?wetband=0` |
| KTHERM from each page's vents (fumaroles, geysers, the hot springs' records), the soil by the scale model's lapse; the glacier's snow bare round its shelf's fumaroles | `89x`, `89zz` | none |
| `BIO.env`, `BIO.envCheck` and `WATER.edgeAudit` in every page's checks, each with a negative | `89x`, `99-host-tz-core.js` | none |
| The row's air: thin air on the caldera (`air.thin`, y0 at the rim), the ash load on the ash desert (`ATMOS.airLoad`), acid rain on the vents (`ATMOS.acidRain`, the marsh's water fizzing) | the stations' `89-host-sky`, `89-host-atmos`, `89w` | `?airload=0`, `?acid=0` |
| The foliage guards at the 1% limit: crowns held on their drawn wood (`heldOn`, `BIO.holdTo`), the great ruff's throat on a stalk, the raft hairs `free`, the cap hangers `onLeaf` and inside half the cap | `50`, `55`, `60` | none |
| Limb joints (`BIO.flareJoin`, `core/biome/31j-core-joint.js`; the owner, 2026-11-03): a root sunk into the parent and a collar, on `limb()`, the ash pine's whorls and the great ruff's limbs and forks (station 1: 19.28 to 19.89 M triangles) | `55` | none |
| The sun's shadows (`core/shadow`, `KSHADOW`; the owner, 2026-11-03): one view-following box (90-600 m), every placed mesh casting and receiving; not on the isle and the vents, whose grounds read all sixteen texture units (three r128 adds the map to every lit material: `window._shadow`); on station 1 they cost about +42 ms a frame on the Arc (+30-38%: `KNOWN_ISSUES.md`), which it cannot afford: so they are **off by default** on every page (the owner, 2026-11-03), the panel's `shadows` button or `?shadow=1` turns them on | `89zz` | the `shadows` button, `?shadow=1` (`?shadow=0` no switch) |
| KGEODE (`core/terrain/39f-core-geode.js`, `host/39g-core-geode-draw.js`, with `39-core-cavern.js`; station.json `terrain`): native bismuth in pockets round every fumarole of the vents (`KGEODE.around`: hoppers in a rainbow film, a grey metal rind; `biomes/CRYSTAL-CAVES-5.1.md` site 3; the owner, 2026-11-09), drawn by distance, checked with a negative | vents `87g`, `99` | none |
| Card cells: `check_cells.py` finds 0 faults; the pack writer keeps `cell` (TODO.md's trap) | `build.py` | none |

**Dropped or owed, and why:**
- **KFAR, the far field: taken 2026-11-23.** Each station's land past the map is scale model 5.1's: `tools/sites51.py` sites each station on the
  model (the four that state a px keep it: the caldera at the summit, the delta, the penitentes, the frontier; the others along their own words, a bearing
  from the summit and a height, at the point whose model height is nearest) and `--bake` runs the Godthrone's `tools/region.py` (read in place) for its
  `region.json` (station 1's beside `build.py`); `build.py` inlines it as `REGION_DATA` and reads the Godthrone's `REGION` (`45a5`) in place;
  `src/85-host-far.js` draws one KFAR ring round the map out to 60 km: the page's own ground at the map's edge, easing to the model's relief past it,
  measured from the page's centre (the ideal types keep their heights), flat at the page's sea where the model lies under the Ring Sea; KHORIZON's far
  grid reads it. Station 1's lattice is coarser (`FAR_CELL` 320 m: its triangle ceiling). Not on the tube (underground). `?far=0` none.
  Sites (5.1 px): station 1 859,863; ash desert 869,856; blast 859,805; caldera 847,834; cloud forest 820,834; delta 900,858; frontier 795,860; glacier
  834,821 (the model's flank on its bearing reaches 5.3 km, not the page's 6 km); isle 769,834; kipuka 815,843; penitentes 866,839; savanna 847,870;
  vents 880,846.
- **The row's terrain**: `tibasalt` strata on the caldera's wall, pit chains and lava steps, rilles on the kipuka, KLAVA on the vents, kipuka, tube and
  caldera. Each moves a page's ground and every placement on it; the flow model (`46`) is the kit's own mosaic history. Owed for the owner's look pass.
- **The row's ground kinds: taken 2026-11-03** (KGROUND's layer kinds, procedural, no texture unit; each after the page's own layers at a
  `/*KGROUND*/` marker; `?kinds=0` none): `clast` on the caldera's walls (the old flows' basalt, scoria and ash beds as blocks in an ash matrix,
  on the cliff layer's weight), `sand` on the ash desert's dunes (ripples across the plume's wind; no glints: they read `cameraPosition`, which
  r128 does not give a Lambert ground), `polygon` on the glacier's outwash bars and tundra (frost polygons with a rim of sorted stones).
- **The river-mouth plume: taken 2026-11-23** (core/water ext/61, `tintFlow`; `THRONE.plumeOf`, `70`): the frontier's two lahar streams and the isle's four gullies (the isle's off by default, `?plume=1` on: its ground is at sixteen texture units and the sea's wet band reads the plume's two maps) carry their silt out from each mouth into the sea, fading over 360-420 m and swirled on a current outward from the nearest mouth (`?plume=0` none). The isle's cliff stream falls into the sea and has none.
- **The Rheoliths at the vents: taken 2026-11-23** (`biomes/rheolith`, its `PLAN.md` section 8, step 3; read in place, `stations/vents/station.json` `kits`, `89y-host-rheo.js`): the kit's deep mineral-siloxane life in the fissure's throat, a breach on its middle into the conduit, with the fissure's four nearest steam points as its satellite mouths and a bench across the fissure. The heat it reads is KTHERM's surface heat plus the conduit's at the mouths (~430 degC at the throat's walls, ~240 at a satellite's: the rock's heat at the depth the guilds line, which a surface field does not hold); dry (water activity .06) and acid (pH 1.6) at the mouths. 24 living guilds (choke coral, wire vein: every one inside `RHEO_PHYS.windowAt`, the vents' new check, with a negative), 390 dead byproducts round them; ~140k triangles; the view 'The fissure throat and its Rheoliths'. The fissure check skips the kit's items (they live in the hot rock by design). `?rheo=0` none. **The caldera and the tube too (2026-11-23):** on the caldera the throat is a breach in the lake's hot ring on the side toward the rim, two satellite mouths either way along the ring, a bench on the lake's crust shelf (the heat the lake's radiance, 700 degC at its edge falling over ~40 m of rock, plus the conduit's; the summit's air dry; the lake reads as water, so nothing is laid on the lava): 30 living, 399 dead; the view 'The lake ring throat and its Rheoliths'; the station's 'hardiest few' check skips the kit's items. In the tube (~20 m wide) a small throat on the floor where the hot reach begins, three satellite mouths in its walls along the reach, a bench downstream; while the kit lays its things the page's waterH reads as flooded outside the tube, so nothing it scatters lands on the surface overhead: 21 living, 227 dead; the view 'The Rheoliths at the hot reach'; the tube's cave check skips the kit's items. Each page's living guilds come from its satellite mouths: the kit lays the throat's own wall guilds only in its own page's frame (`biomes/rheolith/src/60`, 1a: heights -19 to -5 m), an owed fix in the kit. Owed too: the breach cut into the ground as the kit's own page cuts it (here a crack, the ring's rock and the tube's floor stand for it).
- **The row's water kinds**: the glacier's lake takes core/water's `proglacial` look (ext/54, `WATER.withLook`, `lookDraw`), recorded for the export;
  it is not frozen (`WATER.ice` would freeze the lake its icebergs float in: the owner's call). `brine` in the vents' pools is not taken: the
  pools are graded by heat, bluer the hotter, and brine's ramp (red-brown to turquoise) would replace that look (the owner's call).
- **Life**: seasons, KFIRE and mounds on the savanna (its burn is its own, and moving onto KFIRE re-lights the fires); `BIO.fung` for the caps, the cap tubes
  and the bladders (`TODO.md`: shapes move and want the owner's eye).
- **Exchanges** (`EXCHANGES.md`): ringisles' strand pandanus on the isle's beaches is not read in place yet (ringisles is pair 8 and reads this kit).

**Map 5.1** (`biomes/STATIONS-MAP-5.1.md`): station 3 re-surveyed and its flank refitted (`stations/frontier/45-host-stage.js`); the caldera checked
against the model (`stations/caldera`, `KNOWN_ISSUES.md`); station 11 is `tube_hot_05` (`stations/tube/station.json`).

**For readers** (ringisles and the Godthrone read this kit in place; keys and indices of `THRONE.SPECIES` kept, 33 species): the crowns of the Ranj tree,
the ruff tree, the ash pine (its mid tier), the great ruff, the lehua (and its pompoms), the hyper-mangrove and the elfin tree are held on their wood;
the great ruff draws a stalk under each ruff; the far trees are impostors on a page that lists `34-core-impostor.js` (else the blobs as before); the snare
raft's hairs are a new item `rafthair` (its plant record names it); a new plant `charscrub` (burnt scrub, items `charred0`-`8`) at the end of
`THRONE.PLANTS`, and a bark bucket `silver`; the drips and the snare moss under a cap hang inside half its radius. A reader's page moves
when its turn rebuilds it.

## New stations (the owner, 2026-11-02; `biomes/STATIONS-SURVEY.md`)

Each is its own page (station 1 is at its triangle ceiling), forked from the nearest built station, with the universal set above (the `src/`
fragments every station takes) and `verify.py --assert --all-views` on the GPU. Sited on map 5.1 (px on the 5.1 canvas; summit px 847, 834).

### Station 12: the lava delta (`stations/delta`, `throne-delta.html`)

**Site:** px (900, 858), the south-east coast 15 km down `tube_hot_05`'s line from its mouth (map 5.1: the coast runs NE-SW with the sea to the SE; the
last land cells stand 300-350 m over the Ring Sea at -1,500 m, a sea cliff; Aw and Csa, ~600 mm, the plume's dry side). The tube's lava pours over the
cliff (a lava fall) and builds a bench of new black land at its foot.
**What it shows:** the old sea cliff (the pali) with the flow's tongues over its lip; the delta bench, a few hundred metres of fresh black lava and
black sand, its seaward edge a cracked, slumping front where the lava meets the sea in spatter and a LAZE plume (acid steam, white on the downwind
side); littoral cones (spatter and ash cones on the bench, built by steam blasts); pumice rafts, static, in the swash and the sea off the delta;
the old flank above the cliff with its dry shrubs and the plume's ash. **Core:** the sea on `WATER.open` (the frontier's), lava fx and KLAVA's frozen
flows for the bench (`LAVA.md`), the laze as a hazard (`core/hazard`, `KHAZ` R11) and steam particles, KTHERM from the entry. Textures from the
library: `ground.lava.crust`, `ground.lava.veins`, `ground.lava.aa`, `ground.sand.black`, `stone.pumice`, `ground.cinder`.

### Station 13: the blast zone (`stations/blast`, `throne-blast.html`)

**Site:** the north-north-east flank, ~28-32 px from the summit (56-64 km), 2.2-2.8 km up, Dfb and Dfc forest (400-900 mm), upwind of the plume and
away from every other station. The model has no cone here: the dome is a flank cryptodome too young for its 2 km cells.
**What it shows:** a St Helens lateral blast a few years old: the collapsed dome's horseshoe scar upslope; the blast direction as a field (a fan
north-north-east from the scar) that lays every downed log along it (logs are placed records: `BLAST.logs`, each with its yaw from the field);
zones out from the scar: the direct-blast zone stripped bare, the tree-removal zone, the blow-down zone of laid logs, the seared zone of standing dead
trees at its edge, and the living forest beyond; a pumice plain from the pyroclastic flows below the scar; the first pioneers (fireweed-like
cousins, the kit's ruff trees whose seed the heat threw). **Core:** the hazard keys (`core/hazard`), the shared sky and weather. Textures from the
library: `wood.silver`, `bark.char`, `card.charred`, `ground.ash`, `ground.ash.ripples`, `stone.pumice`.

### Station 14: the lee's penitentes (`stations/penitentes`, `throne-penitentes.html`)

**Site:** the east flank (the lee of the north-west westerlies), ~18-21 px out, 5.0-5.7 km up: EF over ET, 141 mm a year (map 5.1). The snow lies
dry under a hard sun at ~0.8 atm, so it sublimates into penitentes. **What it shows:** fields of penitentes, blades 1-4 m tall leaning toward the
noon sun (north at 40 S) in rows east-west, on the EF slope; rock ribs and moraine between them; at the map's foot the ET tundra, lichen and
cushion plants. **The cold belt:** its gill-coral trees among conifers grow 1.5 km lower (Dfc, ~3.6 km): they are on the glacier station's page
(`stations/glacier`, built 2026-10), not here. **Core:** the snow (fx snowcover), the caldera's penitente item, height fog, KTHERM (no vents: soil
alone). Textures: `ground.snow011`, `ground.snow015`, `ice.glacier`, `ice.clear`.

**Built 2026-11-02** (each forked from the caldera's fragments by way of the penitentes page; every check, its negatives and the universal set pass in the browser on the GPU):
- **12, the delta:** the pali 280 m, the lava as one channel ribbon on core/atmos's lava (the tube's channel mode) down the flank, over the lip and across the bench to the entry; the laze as steam points (white, leaning south-east); three littoral cones; 1,374 static pumice rafts; the old flank planted by the kit's shoulder passes (2,422 trees). The hazards (core/hazard, 2026-11-03): the lava channel in 200 m pieces (`KHAZ.GROUND.lavaFlow`, each its own height band: the fall over the pali drops 280 m in one), the laze (acid), the entry (heat: spatter and steam blasts), the bench (a fall: it slumps into the sea), the pali (a fall); a check reads each point's kind, with a negative. The coves' black sand (`ground.sand.black`) and the littoral cones' cinder, in the two layer slots the caldera's ground left unweighted here. 2026-11-23: the lava fall's own steam (core/atmos's smoke, 'steam', down the pali's face and at its foot, 86; `?fallsteam=0`). Owed: KLAVA's frozen flows on the bench (the bench is the host's own surface).
- **13, the blast:** BLAST.at, the field (a fan NNE from the scar, 3.9 km on its axis); 39k logs laid along it (BLAST.logs, the check holds each to the field), 7.7k stumps, 17k seared snags standing, 3.7k pumice blocks; the living forest past the seared edge is the kit's cold-belt pass (THRONE.veto keeps it out of the blast). 2026-11-03: the silver logs and snags in their own bucket on `wood.silver` (`bark.silver`), the burnt scrub (a new plant, `charscrub`, on `card.charred`) in the removal and seared zones; the hazards: the scar (a fall: rockfall), the pumice plain (heat, low: still cooling), every seared snag (crush: it falls in the wind), with a check and a negative. 2026-11-23: the pioneers, the fire flowers (`card.flowerspike`, a fireweed's cousin) in drifts in the removal and blowdown zones and on the plain's edge, never in the direct zone or under the standing dead (86).
- **14, the penitentes:** the east flank in benches (treads of snow, 62 m rock steps); 54k blades near the cameras (on the whole map they were 27 M triangles), boulders on the steps; the tundra at the map's foot. The cold belt stays on the glacier page.

## Scale-Model 5.1 Evolved Flank Dome Strata Note (`2026-11-13`)
- **Cryptodome Scar & Evolved Parasitic Domes (`obsidian-pancake`):** Station 13's NNE flank cryptodome horseshoe scar (`stations/blast`) and late-stage evolved trachydacite/rhyolite parasitic domes on the Throne's upper ring-fractures bind to `KSTRATA` **`obsidian-pancake`** (`core/terrain/35-core-strata.js` — `2–6 m` flow-banded glassy dome carapace with frothy pumice interbeds and perlitic autobreccia talus), complementing `tibasalt` shield colonnades on the main basaltic flanks.
