# biomes/clifflung: notes

The Cliff Lungs as built (2026-11-11, branch `claude/clifflung-biome`), on the plan the owner answered on 2026-11-02 (`PLAN.md`, section 17).
`PLAN.md` is the design; this file is what was built, what each station shows, and the core it stands on.

## The pages

| Page | Station (PLAN.md section 11) | What it shows |
|---|---|---|
| `dist/clifflung.html` | 1, **the Mouths** (5.1 px 790,1048, 3,001 m, 1.10 atm) | the paramo's lip with the face falling north through the cloud sea; nine lungs on the scarp's ravines and buttresses, their mouths along the lip (two husks among them), the wells dug beside the live ones on core/water, the fall-out lawns running away south-east with dew coils in them and rime caps at their edges, the southern highlands' paramo and cloud forest read in place. Presets: the first ten seconds (05:54, before dawn), dawn (06:54: the mouths begin to steam), noon (12:30: a cap cloud over every mouth), a clear winter night (02:00 at midwinter: the mouths' faint back-steam, the flue running backward), and the mouth, its well, its comb, the lawn, the face, a husk, from afar |
| `dist/clifflung-stair.html` | 3, **the Stair** (px 790,1040, 2,023 m, 1.24 atm) | inside the cloud on the face: the lungs climbing the ravines past the cloud forest's treads, a Talovolci lung-stair lashed to one (rails, rungs, a rest at every tenth ring), a husk fallen across a ravine as a bridge, the camera inside the bore, the condensation front at mid-morning, the noon draw |
| `dist/clifflung-bells.html` | 2, **the Bells** (px 790,1024, 529 m, 1.50 atm) | the foot: the hyperjungle's canopy read in place, the bells on their holdfasts gaping north, the fringes streaming inward on the draw, the lungs climbing into the cloud belt; the cold-breath preset (05:00 at midwinter: the cold mist out of the bells, the outer fringe streaming outward) |

Station 4 (the Husks) is not built.

## Core adoption (as built; PLAN.md section 13 was written before the first fragment)

| Module | Taken | For |
|---|---|---|
| `core/rand` | `KRAND` | every lung, ring, mouth, lawn plant, far lung and hazard by hash of (world, lung, index, salt); the plateau's swells by `KRAND.fbm` |
| `core/terrain` | `KRELIEF.scarp` (`38`), `KFIELD` (`30`, an 8 m inset on the face), `KGROUND` (`43`), `KFAR` (`44`) and `KFAR.streaks` (`44b`), `KHORIZON` (`45`) | the face, the stage baked, the ground's layers, the Wall past the map and the far lungs, the scarp's shadow |
| `core/biome` | `10`, `20`, `30`, `31b`, `31j`, `34`, `35` (the breath mode), `37` (KTRAPS: core/hazard's clock), `40`, `42`, `43`; the Bells adds `32`, `33`, `36`, `38`, `44` for the hyperjungle | every item; the rings, joints, fringes and drip on `BIO.animHook` mode `breath` |
| `core/tags` | `50`, `52`, `53` | every item set, ring volume, mouth, bell, well, lung record and hazard a record (`BIO.init({tags})`) |
| `core/space` | `KSPACE` | the lungs' keep-clear the root mask reads; the probe's broad phase |
| `core/hazard` | `KHAZ`, a state function `'LUNG.breath'` in `KHAZ.STATES` | the draw, the cold breath, the film, the lip, the maw, the sphincters |
| `core/clock` | `KCLOCK` (core/host's), `KCLOCK.season` | the hour, the day and the season the breath reads |
| `core/atmos` | the core, presets, export, skylight, particles (`3`), weather, the shared sky, height fog and the fog belt, the cloud deck and its day (`fx/deckday`), the steam in groups (`fx/smokegroups`) | the sky; the cloud sea lapping the foot and burning back; the steam, the cap clouds and the cold breath on one scalar each |
| `core/water` | `20`, `21`, `22`, `50`, `51`, ext `54`/`54b` (karst spring), `56`, `57` | the wells and their threads |
| `core/host` | `FULL` | camera, loop, panel, probe, inspector, marks, pictures, minimap |
| `core/materials` | `KMAT` and two packs: this kit's (`materials.json`) and the southern highlands' (read from `biomes/shighlands/tex`), the hyperjungle's on the Bells | every library set |
| `core/export` | `07`, `09` | the krator-world container (the profile in `verify.py`); the sites as their own export |
| `core/shadow` | `10`, `12` | listed, not attached (the sun's shadows stay off: shighlands' guard is not copied) |

Not taken: `core/mask` (nothing is placed from a canvas), `core/city`, `core/hamlet`, `core/camp`, `core/simulation`, `core/furnish` (no settlement:
the hamlet's site and the stairs' rests are published as data, `LUNG.sites`), `core/lod` (the biome core's runtime LOD), `33b`, `39-core-lean`,
`KLAVA`, `KBASIN`, `KSCOUR`, `KSTRATA` (the face's rock is KGROUND's megabreccia layer; strata beds are owed with `KRELIEF.scarp`'s next step),
`KCAVERN` (built for this kit, `C.pipe`, but not on the pages: KNOWN_ISSUES.md, "The bore is drawn, not walked").

## Core changes this kit made

None to `core/`. Everything the plan's section 14 proposed and this kit needs had already landed on main (2026-11-03: `KCAVERN.pipe`, the deck's
day, `KFAR.streaks`, `KRELIEF.scarp`, `BIO.animHook` mode `breath`, `ATMOS.smokeGroups`); `KHAZ.STATES['LUNG.breath']` is registered by the kit, as the
geyser kit registers its own. `tools/test_all.py` now runs the biome kits' node tests (`biomes/*/tests/test-*.js`: this kit's, the Gills', the
Cut's, the Ancients' valley's and nwbay's), which it did not before.

## The deck's day

The plan's section 14 item 5 asked for the cloud deck's level to follow the day: it is core/atmos's `fx/deckday` (`ATMOS.deckLevel`), and the kit
binds it with its own hours (`LUNG.DECK`: highest at 07:30, lowest at 15:30); `LUNG.breath`'s condensation engine reads the same function, so the
two cannot part. Nothing in `ATMOS` was changed.

## The words

The Talovolci's words (PLAN.md section 10) name the items and the records (*Clivobređos*, *ringos*, *Uxomouđos*, *Andemouđos*, *uelos*,
*Levtobređos*, *bređoladra*, *Scinropos*, *Combocacos*, *Gunglomagos*, *Deuocoilos*); `LORE.md` is untouched, its sentences still proposed in the plan.
