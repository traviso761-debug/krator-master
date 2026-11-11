# kits/ancient-transit: the Ancients' transport infrastructure (plan, 2026-11-08)

The owner's brief (2026-11-08, for the Ancient's Valley, `biomes/ancientsvalley`): "street furniture and related wreckage;
a real elevated highway with on/off ramps that can run through the map; grade level (cargo) and elevated (passenger) train
lines that can do the same". Everything in the valley is a thousand years ruined, so every piece here comes in ruin states,
as the metropolis kit's towers do (`kits/metropolis` `MP.RUINS`), and nothing here knows the valley: a host hands in
waypoints and a ground sampler and gets records back, then draws them.

## 1. Where it lives, and why

A kit of its own, a sibling of `kits/metropolis` (the Ancients' towers) and `kits/motor-vehicles` (their vehicles, the
`ancient` culture with wreck forms, in another session). The valley will read it in place, as it reads the metropolis
(`MP_FRAGS` in `biomes/ancientsvalley/build.py`): the numbered fragments under `src/` by path, and the street furniture as
one closure from `transit_bundle.py` (as Locus takes `vehicle_bundle.py`). Hook (`settlements/hook`) and the metropolis
test bed are the other Ancient sites that may take it. Nothing in `biomes/ancientsvalley`, `kits/metropolis` or
`kits/motor-vehicles` is touched: this kit stands on `main`'s core alone.

One global namespace, `KTRANSIT`, for the lines (records and drawing), and one closure, `KratorTransitFurniture`, for
the furniture (the catalog core, the `ancient` culture's pieces, the assembler), so its catalog names (`TAU`, `mat`,
`FPAL`...) never meet a host's.

## 2. The three things

**Street furniture** (`krator-transit-furniture.js`, catalog `ASSET`s of culture `ancient` on the catalog core,
`core/catalog/krator-furniture-core.js`): lamp standards (the valley's `AV_LAMPS` are boxes), traffic signals, overhead
sign gantries, street signs, benches, bollards, bins, hydrants, planters, kiosks, tram and bus shelters, transformer and
utility cabinets, crash barriers, guardrails, pedestrian bridges; and the wreckage: pavement rubble, glass heaps, cable
tangles. Every kind has the ruin states it can have of `intact`, `bent` (leaning, kinked), `fallen`, `burnt`, `crushed`;
a shelter's `crushed` is its roof down on its seats, a gantry's `fallen` is the beam across the road, a lamp's `fallen` is
the standard flat with its head cable out, a bench's `crushed` is half buried, a cabinet's `burnt` is gutted with its
doors off. `KTRANSIT.pick(seed, kind, state)` by `KRAND`, never by draw count; `KTRANSIT.dress(street)` lays a street's
furniture as records on both kerbs with `KSPACE` keeping the pieces apart and off a host's pads.

**The elevated highway** (`KTRANSIT.highway(pts, o)`): a path-following structure over kilometres in one call. A
polyline of waypoints on the world (fillets at the corners), the deck profile from the ground sampler (clearance over the
highest ground under each span, the grade limited both ways), then plain records: spans keyed by stable id (two lanes each
way, a median, crash barriers, lamp standards), piers with footings at every span joint, on and off ramps that leave the
deck edge, come down on their own piers at 6%, run onto fill and land on a road surface at grade, and an interchange where
two highways cross (`o.over`: the deck lifts to clear the other). Ruin per span by hash: `intact`, `cracked` (a lane's
edge and its barrier gone), `collapsed` (the deck fallen to the ground below, tilted), `gone` (piers only). The host
tests the records against its own pads and culls (`KTRANSIT.cull`).

**The train lines** (`KTRANSIT.rail(pts, o)`, the same path and record shapes): a grade-level cargo line (ballast bed on
fills, sleepers, rails in sections, level crossings where it meets a host's streets, signals, catenary masts if asked) and
an elevated passenger line (a guideway on lighter piers, stations with platforms, a canopy and stair towers, each in
ruin states). `KTRANSIT.train(line, o)`: a freight train (locomotive, box, tank and flat wagons) standing or derailed, cars
overturned and burnt; a passenger train on the guideway or fallen from it.

**The subway** (the owner, later the same day): `KTRANSIT.subway(pts, o)`, a bored twin-track tunnel under the ground on the same path and
record shapes, sections in ruin states (intact, cracked with soil fallen in, collapsed under a sinkhole, silted), cut-and-cover stations (a hall,
side platforms, columns, a roof, the kit's furniture, a stair entrance at each end up to the street), vent heads; the host carves the sinkholes,
the fallen-in station's void and the stair pits into its ground with `KTRANSIT.sinkholeH`.

**The war along the roads** (the owner, later still): `KTRANSIT.war(street, o)`, one number from a riot to bombed to smithereens (scorch,
heaps, strewn and barricaded furniture, craters with rims the host carves with `KTRANSIT.craterH`), and abandoned military positions
(checkpoints, emplacements, posts) from five military kinds (sandbags, sentry hut and watchtower, boom, tank trap, razor wire).

**The earthquake** (the owner, last): `KTRANSIT.quake(o)`, a fault across the page: a throw the host carves (`quakeH`), a strike-slip shift
every path takes (`shift` on `KTRANSIT.path`), buckled land beside it, and a twist that rolls the spans and piers near it.

## 3. The records

Everything placed is a record before it is drawn; the draw fragments decide nothing. Ids are stable (`<line id>.s<n>`,
`<line id>.p<n>`, `<line id>.r<k>.s<n>`, `<street id>.f<n>`), every choice a `KRAND.hash(seed, index, salt)`, so a
page built from one seed is the same page everywhere and a span added at the end moves no other span. The ruin shares
are options with defaults (`KTRANSIT.RUIN`), per line, so a host puts the war where it wants it (`o.ruin` may be a
function of s). Record shapes: `API.md`.

## 4. Core adoption

The modules this kit takes, by name, and for each it does not, why.

| Module | Taken | How |
|---|---|---|
| `core/rand` (`KRAND`) | yes | every draw: a span's state, a pier's break, a piece's kind and lean, a car's roll, a sleeper gone, each a hash of (seed, index, salt) |
| `core/space` (`KSPACE`) | yes | `KTRANSIT.dress` files every piece it lays and queries before the next; a host's pads go in the same index; `KTRANSIT.cull` takes a `blocked(x, z, r)` the host answers from its own `KSPACE` |
| `core/tags` (`KTAGS`) | yes | `BIO.init({tags: 'ancient-transit'})` on the demo page: every registered volume (a line, a station, a train, the street block) is a record; the valley registers the kit's records in its own registry |
| `core/biome` (`BIO`) | yes | the page's host binding (`BIO.init`, `BIO.record`, the sun), as the metropolis test bed takes it; no flora of its own |
| `core/materials/record` (`KMAT`) | yes | every surface from the library through `materials.json` and `tools/textures/pack.py` (`tex/`): asphalt, board concrete, slab, brushed steel, heavy rust, chipped paint, the Ancients' white, ballast gravel, rubble, rusty corrugated; the sidecar pack as the metropolis does it |
| `core/atmos` | yes | the shared sky (`ATMOS.skyBiome`) at the default site: a test bed, not a place |
| `core/host` (`KHOST`) | yes | camera, loop, panel, probe, polytool: the demo page is handed to `KHOST.take` |
| `core/shadow` (`KSHADOW`) | yes | the sun's shadow box, as the metropolis takes it: a deck's shadow on the street is half the reading of an elevated line |
| `core/walk` (`KWALK`) | yes | the walk key stands on the ground; the decks and platforms are not walk floors yet (`KNOWN_ISSUES.md`) |
| `core/terrain` | no | the demo's ground is a plane with a gentle `KRAND.fbm` relief and a library map: a test bed; the valley's ground (KGROUND, the model) comes with the valley. `KRUBBLE` (the ruins' heaps) is not on `main` yet: the rubble under a collapsed span is chunk records drawn as one instanced mesh, to move onto `KRUBBLE` when it lands |
| `core/water` | no | nothing wet on the test bed; a line over water takes the host's water |
| `core/city` | no | a city's streets are the host's (`core/city` in the valley later); this kit takes a street as a polyline and a width and furnishes it |
| `core/furnish` | no | the pieces are catalog `ASSET`s of a culture, built by this kit's assembler into merged meshes with planar metre UVs (the library maps on them without a triplanar hook), not furniture placed in rooms |
| `core/export`, `core/lod`, `core/minimap`, `core/simulation`, `core/clock` | no | the records are exportable as plain JSON (`[G data]`); a host owns LOD, the minimap and the clock |
| `core/catalog` | read in place | the catalog core inside the furniture closure (`makeFrame`, the `mk*` primitives, `FPAL`, `ASSET`) |

Checked at the end with `python tools/check_core_use.py kits/ancient-transit` (rand and tags named in `build.py`; no PRNG,
noise, `getImageData`, water shader or sky dome of this kit's own).

## 5. Materials

`materials.json` (packed by `python tools/textures/pack.py kits/ancient-transit` into `tex/`): `asphalt`
(`ground.asphalt`, 6 m), `concrete` (`concrete.board`, 4 m: decks, piers, guideways), `pave` (`concrete.slab`, 6 m:
pavements, platforms), `steel` (`metal.steel.brushed`, 2 m: rails, barriers, masts), `rust` (`metal.rust.heavy`, 2 m:
every ruined metal), `paint` (`metal.painted.chipped`, 1.5 m: the furniture bodies, the cars), `white`
(`metal.ancient.white`, 4 m: the Ancients' panel on canopies and kiosks), `ballast` (`ground.gravel042`, 3 m), `rubble`
(`ground.ruin`, 3 m), `corrugated` (`metal.corrugated.rusty`, 1.2 m: the wagons' sides). Lane paint is geometry (thin pale
strips on the surface), glass a plain material. Owed to the library and listed in `core/materials/PROMPTS-NEEDED.md`
section 42: worn asphalt with faded lane paint, rail ballast with sleeper shadows, a rusted rail head.

## 6. Order of work

1. This plan. 2. The data fragments (`40` records and dress, `41` path and profile, `42` highway, `43` rail and trains)
with `tests/test-transit.js`. 3. The furniture file and its assembler, the bundle. 4. The materials and the builder
(`50`), the draw fragments (`55` highway, `56` rail, `57` dress and roads). 5. The demo page (`45`, `47`, `70`, `89`,
`99`), `build.py`, `verify.py`. 6. Node tests, `test_all --no-build`, the GPU verify through the lock. 7. Docs, INDEX,
PORT, the commit, the hand-over note for the valley.

## 7. Not in this cut

Walk floors on the decks and platforms; vehicles on the roads beyond the blockades (the valley scatters `kits/motor-vehicles`'
`ancient` wrecks itself; the barricades take them from the bundle); a street-layout generator (the network takes the host's definitions:
the valley's grid comes from its own plan, or from `core/city`); a Godot importer (the records are plain JSON, the meshes cross as meshes); `KRUBBLE` heaps
(not on `main`); the shells and impostors the metropolis has (a line is cheap enough to draw whole to a few kilometres;
`KNOWN_ISSUES.md` says what a longer line wants).
