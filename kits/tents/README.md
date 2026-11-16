# kits/tents: the Tents kit

A generic tent set for camps and caravans of many peoples (the owner, 2026-11-09: "a generic tent set that could work as a
set of camp/caravan tents for multiple cultures"). It belongs to no culture, like `kits/construction` and `kits/resources`:
a tent is a **form** in a **size**, pitched for a **role**, in a people's **dress**. The form and size are the def key; the
role, the trade and the dress are placement options, so one record serves every people and every use.

```
python3 tools/build.py kits/tents                    # or: cd kits/tents && python3 build.py
python3 kits/tents/verify.py kits/tents/dist/tents.html --assert
node kits/tents/tests/test-tents.js                  # the table, the interiors set, core/camp's mapping, camps on the kit's boxes
python3 tools/textures/pack.py kits/tents            # after a change to materials.json
```

The page loads its texture pack beside it (`dist/tents.tex.tents.js`, `-2.js`; serve `dist/` over HTTP, as `verify.py` does).

## What it draws

**25 defs**, `tn-<form>-<size>` (`src/33-tn-table.js`, `TN_FORMS`):

| Form | Sizes | Like | Room inside | Door |
|---|---|---|---|---|
| `ridge` | s m l | wall tent, army ridge tent | yes | roll-up flap |
| `bell` | s m l | bell tent, one centre pole | yes | roll-up flap |
| `yurt` | s m l | ger: lattice wall, crown, felt | yes (l: two posts) | wooden leaf |
| `cone` | s m l | tipi / conical hide tent | yes (low: 0.27 of its height) | hide flap |
| `black` | m l | goat-hair black tent on poles | yes (open front) | tie-back curtains |
| `marquee` | m l | square pavilion, peaked | yes | tie-back curtains |
| `roundend` | m l | long round-ended (mess, hall) | yes | roll-up flap |
| `wedge` | s m | pup tent: too low to furnish; two bedrolls | no | roll-up flap |
| `fly` | m l | lean-to fly: stables, open messes | no (open) | none |
| `awning` | m | market stall | no (open) | none |
| `wagon` | m | covered wagon (wagon tilt), a prop | no | none |
| `screen` | s | screen round a pit (latrine) | no | none |

The bell, the yurt, the black tent and the marquee are drawn by the Scyvoi **tent toolkit** (`kits/scyvoi/src/40-tk-tentkit.js`),
**read in place** with its material keys swapped to the dress's; the other forms are drawn in `src/44-tn-forms.js` on the same
primitives. Every stake and guy rope follows the ground under it; every door is a real `core/door` leaf (rolls, tie-backs,
flaps) whose `core/walk` blocks open with it.

**Eleven dresses** (`src/41-tn-dress.js`, `TN_DRESS`): `generic` (bleached canvas), `scyvoi` (white felt, appliqué band, red
valance, lacquered poles), `desert` (striped goat hair, sadu band), `ash` (grey ash cloth, fret band, horn finials), `beast-rider`
(sewn hide panels, green valance), `iziz` (striped caravan canvas, the Iziz banner), `republican` (olive army canvas),
`xanadu` (silk with a brocade roof, lacquer), `islander` (reed mat, tapa band, bamboo poles), `postapoc` (patched tarp, scrap
poles), `eternian` (canvas with the circuit-maze band). Each sets the covers, the band, the poles and finials, the valance,
the stakes and rope, the floor cloth, the wear (new to ragged, with patches and tears), the furniture culture and the pennant
(its people's symbol from `core/sockets/38-symbols.js`). A culture key aliases to its dress (`nomad` is `desert`); an unknown
one falls back to `generic` and says so. The colours, the wear and the patches are seeded from the placement (world, cell,
index) through `core/rand`, so a tent looks the same wherever it is pitched.

**Eleven roles** (`TN_ROLES`, core/camp's): family, sleeping, chief, council, workshop (by trade: smith, hide, seer, weaver),
supply, trade, guard, mess, stable, latrine. A role sets the gear outside (catalog pieces in the dress's culture: a smith's
anvil and trough, a hidemaker's frames, water jars by a family's door) and the room kind inside.

**Interiors** come from `kits/interiors/sets/tents.js` (one item per def, the table's `tnRoom()`; the node test keeps them
equal and `--write` regenerates them): the role is the room kind (a family tent a cottage, a sleeping tent a dormitory,
a chief's tent a hall, a smith's a smithy ...), furnished from the master catalog in the dress's culture, every piece in
`core/tags` before it is drawn, the floor and walls in `core/walk`. Only a family tent is a residence (a bed, food and a chest).

## Camps (core/camp)

`core/camp/50-camp-tents.js` (`[G data]`, no three.js) is the mapping a camp asks: `KCAMP.tentFor(role, {culture, trade,
size})` gives the def and the dress for a role in a culture (eleven culture rows), `KCAMP.tentProgram` a band's program for
`KCAMP.pitch` and `KCAMP.census`, `KCAMP.tentDims` the boxes with each role's yard, and `KCAMP.halt` a caravan's night halt
(a `laager` of wagons round the house's pavilion, or a `line` along the road). The sheet pitches two:

- **A nomad band** (Scyvoi dress, `ring`): 54 people in 6 households, the chief's great yurt, the council marquee, five family
  yurts, two sleeping yurts, the smith's, the hidemaker's and the seer's tents, supply, guard, mess; the stable fly and the
  latrine downwind; the hearth and its cushions in the middle.
- **A caravan halt** (Iziz dress, `laager`): eight wagons in a square, the house's marquee, the mess fly and two trade
  awnings inside, the guards at the gate, the picket line behind, the latrine downwind.

## Files

| File | What | Port tag |
|---|---|---|
| `src/26k-kit.js` | KIT, the library families, the palette | `[G data]` |
| `src/33-tn-table.js` | forms x sizes x roles: boxes and rooms (pure) | `[G data]` |
| `src/41-tn-dress.js` | the dresses (pure) | `[G data]` |
| `src/42-tn-parts.js` | cloth, flaps, finials, pennants, stakes (wraps the toolkit's) | `[draw]` |
| `src/44-tn-forms.js` | one builder per form | `[draw]` |
| `src/46-tn-roles.js` | gear by role, tags, the interiors | `[draw]` |
| `src/47-tn-defs.js` | the 25 defs on `core/engine` | `[draw]` |
| `src/52-tn-camps.js` | the two sample camps, pitched by `core/camp` | `[draw]` |
| `src/88-tn-emblem.js` | the pennants' canvas maps | `[web]` |
| `src/89-rows.js` | the sheet | `[web]` |
| `src/91t-tn-interiors.js`, `src/99-host-tn.js` | the interiors' batch; the probe (`verify.py`) | `[web]` |

Read `API.md` for the calls, `PLAN.md` for the design and what comes next, `KNOWN_ISSUES.md` for what is open.
