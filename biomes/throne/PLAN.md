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
| The sun's shadows (`core/shadow`, `KSHADOW`; the owner, 2026-11-03): one view-following box (90-600 m), every placed mesh casting and receiving; not on the isle and the vents, whose grounds read all sixteen texture units (three r128 adds the map to every lit material: `window._shadow`); on station 1 they cost about +42 ms a frame on the Arc (+30-38%: `KNOWN_ISSUES.md`), which it cannot afford; the owner decides | `89zz` | `?shadow=0` |
| Card cells: `check_cells.py` finds 0 faults; the pack writer keeps `cell` (TODO.md's trap) | `build.py` | none |

**Dropped or owed, and why:**
- **KFAR**, the far field: the stations are ideal types whose ground past the map is not the scale model (each `terrainH` goes on procedurally), and station 1
  is at its triangle ceiling. Owed: a far ring per station from the scale model's heights round its px (`KNOWN_ISSUES.md`, "The far field").
- **The row's terrain**: `tibasalt` strata on the caldera's wall, pit chains and lava steps, rilles on the kipuka, KLAVA on the vents, kipuka, tube and
  caldera. Each moves a page's ground and every placement on it; the flow model (`46`) is the kit's own mosaic history. Owed for the owner's look pass.
- **The row's ground kinds** (`clast` on the caldera's walls, `sand` on the ash desert, `polygon` on the glacier) and the water kinds (`ice` on the glacier,
  `brine` in the vents' pools): not taken this turn.
- **Life**: seasons, KFIRE and mounds on the savanna (its burn is its own, and moving onto KFIRE re-lights the fires); `BIO.fung` for the caps, the cap tubes
  and the bladders (`TODO.md`: shapes move and want the owner's eye).
- **Exchanges** (`EXCHANGES.md`): ringisles' strand pandanus on the isle's beaches is not read in place yet (ringisles is pair 8 and reads this kit).

**Map 5.1** (`biomes/STATIONS-MAP-5.1.md`): station 3 re-surveyed and its flank refitted (`stations/frontier/45-host-stage.js`); the caldera checked
against the model (`stations/caldera`, `KNOWN_ISSUES.md`); station 11 is `tube_hot_05` (`stations/tube/station.json`).

**For readers** (ringisles and the Godthrone read this kit in place; keys and indices of `THRONE.SPECIES` kept, 33 species): the crowns of the Ranj tree,
the ruff tree, the ash pine (its mid tier), the great ruff, the lehua (and its pompoms), the hyper-mangrove and the elfin tree are held on their wood;
the great ruff draws a stalk under each ruff; the far trees are impostors on a page that lists `34-core-impostor.js` (else the blobs as before); the snare
raft's hairs are a new item `rafthair` (its plant record names it); the drips and the snare moss under a cap hang inside half its radius. A reader's page moves
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
- **12, the delta:** the pali 280 m, the lava as one channel ribbon on core/atmos's lava (the tube's channel mode) down the flank, over the lip and across the bench to the entry; the laze as steam points (white, leaning south-east); three littoral cones; 1,374 static pumice rafts; the old flank planted by the kit's shoulder passes (2,422 trees). Owed: the laze as a core/hazard record (R11; the page registers it as a volume only), the lava fall's own spray, KLAVA's frozen flows on the bench (the bench is the host's own surface), ground.sand.black on the coves (the paint stands in).
- **13, the blast:** BLAST.at, the field (a fan NNE from the scar, 3.9 km on its axis); 39k logs laid along it (BLAST.logs, the check holds each to the field), 7.7k stumps, 17k seared snags standing, 3.7k pumice blocks; the living forest past the seared edge is the kit's cold-belt pass (THRONE.veto keeps it out of the blast). Owed: wood.silver and card.charred (the logs are the charred and charcoal barks), pioneers beyond lichen (fireweed-like cousins), the hazard keys.
- **14, the penitentes:** the east flank in benches (treads of snow, 62 m rock steps); 54k blades near the cameras (on the whole map they were 27 M triangles), boulders on the steps; the tundra at the map's foot. The cold belt stays on the glacier page.
