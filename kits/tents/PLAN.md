# kits/tents: plan

**The ask** (owner, 2026-11-09): "a generic tent set that could work as a set of camp/caravan tents for multiple cultures".

**The design.** Forms x sizes x roles on `core/engine`, a dress per people, the roles and the camps from `core/camp`:
- a def is a **form in a size** (`tn-<form>-<size>`, 25 of them), culture-neutral;
- the **dress** (a people's cloth, colours, poles, finials, valance, pennant, wear, furniture culture) and the **role**
  (core/camp's: what stands round it and what room is inside) are placement options;
- the numbers live in one plain-data table (`33-tn-table.js`): the builders draw from it, the interiors set declares its rooms
  (`kits/interiors/sets/tents.js`, kept equal by `tests/test-tents.js`), core/camp pitches its boxes;
- core/camp says which tent a role takes in a culture (`core/camp/50-camp-tents.js`), so a band of any people pitches tents
  by role, and a caravan halts in a laager or a line (`KCAMP.halt`, PLAN section 6.2's night camp).

## Core adoption

`build.py` takes, by path:
- `core/engine` (`engine.py`: geometry, `defBuilding` and its records, the sheet's scene, the host hand-over, `37-wk-rec.js`);
- `core/rand` (KRAND: every colour, wear, patch and tear is `KRAND.hash(world, cell, index, salt)`; core/tags' uid);
- `core/tags` (every tent a building, every wagon a prop, the camps features, every interior piece furniture, registered
  before it is drawn; the vocabulary audit in `verify.py`);
- `core/camp` (the mapping, `KCAMP.pitch`, `KCAMP.census`, `KCAMP.halt`, `KCAMP.check`) and `core/space` (its overlap index);
- `core/door` (KDOOR: every flap, tie-back and yurt door a leaf that opens and blocks `core/walk`);
- `core/walk` and `core/walk/box` (KWALK: the rooms' floors and walls, the doors' blocks, the reachability audit);
- `core/furnish` (KFURN: the gear and the interiors' pieces from the master catalog, `kits/catalog` through its bundle);
- `core/materials/record` (KMAT, the library through `materials.json` and `tools/textures/pack.py`);
- `core/host` (the shell, the polygon tool, the key map), `core/clock`, `core/shader`, `core/atmos` and its placeholder sky;
- `core/sockets/38-symbols.js` (the pennants' symbols), read in place;
- `kits/interiors` (`kit_bundle.bundle(['tents'])`: ROOM, furnishRoom, the sets, the runtime adapter).

Not taken, with the reason:
- `core/terrain`, `core/water`, `core/biome`, `core/mask`: a kit sheet on flat ground; a world places the tents on its own.
- `core/simulation`, `core/sched`: the camps are pitched records; striking and pitching as timelines are core/camp's C2.
- `core/city`: a camp is laid out by core/camp, not by streets and lots.
- the engine's own interiors path (`91i-interiors.js`, `KIT_INTERIORS`): the kit furnishes every tent as its role's room
  kind at placement (the role is a placement option, not a key), which the engine's per-key items cannot express.

## Done (2026-11-09)

- The 25 defs, the eleven dresses, the eleven roles and four trades, the pennants, the wear.
- The interiors set, generated from the table; doors on core/door; floors and walls in core/walk; every interior reached.
- core/camp's mapping (eleven culture rows), `tentProgram`, `tentDims`, `halt` (laager and line).
- The sheet: forms by family, every role, every dress, a band's ring and a caravan's laager. `verify.py --assert` (21 kit
  asserts and the harness's); `tests/test-tents.js` (the table, the set, the mapping, a band of every row and both halts, each
  with a negative).

## Next

1. **Move the tent toolkit to core.** `40-tk-tentkit.js` is vendored byte-identical in `kits/scyvoi`, `kits/desert-nomads` and
   `kits/ash-nomads`; this kit reads Scyvoi's copy in place. One copy (a `core/engine` fragment or `core/tents`) and the four
   kits reading it.
2. **Half-pitched and packed poses** for core/camp's C2 (striking and pitching as `KSCHED` timelines; PLAN section 4): a
   pose parameter per form (the cover down, the poles standing; the bundle on a cart or a beast).
3. **A host:** the isle demo's or the little demo's band or caravan on these tents, with `ground.ok` from the page's ground
   and the stakes on real slopes.
4. The other kits' camps onto this one where it fits: the Beast Riders keep their own tent set (`BR_CAMP`); a people with no
   tents of its own (the Republic's army, Xanadu, the Islanders, the post-apoc bands, Eternian expeditions) pitches these.
5. The textures owed (`core/materials/PROMPTS-NEEDED.md`, section 42).
