# Audits (index, and the two from the 2026-10-20 to 23 sessions)

Every audit of the repo, where it lives, and what is still open. Write new audits as a section here or as a dated file named in the
index, so the next session does not have to find them in a transcript.

## Index

| Audit | Where | State |
|---|---|---|
| Core adoption checklist: every settlement and biome against the core modules (2026-10-19) | `CORE-ADOPTION.md` | on main; ticked as builds take modules. `tools/check_core_use.py` now enforces a part of it |
| Core-use check: PRNG, noise, `getImageData`, water shader, sky dome, missing modules | `tools/check_core_use.py`, baseline `tools/core_use_baseline.json` (252 findings) | on main; a `test_all.py` step |
| KNOWN_ISSUES audit of 61 files (2026-10-20), batches 1 to 8 | section A below | batches 1, 4, 5, 6, 7, 8 worked; leftovers listed |
| Water and atmos scope of 19 biomes (2026-10-21) | section B below | phases 0 to 3 done; phase 4 open (`HANDOFF-REBUILD.md`) |
| Walk audit: building kits' floors, stairs, doors on `core/walk` | `tools/walk_audit/` (`README.md`) | on main |
| Voth census tables per settlement and kit | `tools/check_trades.py`, `tools/trades_census.json`, `GI_TRADES`-style tables per build | on main |
| Material library wiring and sheet cards | `tools/textures/audit_wiring.py`, `tools/textures/audit_catalog.js`, `tools/textures/cell_audit.py` (`TODO.md` "Card sheets shown whole") | on main; the cell audit (215 slots in 25 builds) is open |
| Port audit (Godot tags) | `tools/audit_port.py` -> each build's `PORT.md`, `PORT-INDEX.md` | on main. **Rewrites every PORT.md whatever its argument** |
| Scale-model satellite audit 4.21 | `tools/scale-model/sat_audit.py`, `satellite-audit-4.21.json` | on main |
| Menagerie audit | `host/WorldMenagerie/AUDIT.md` | on main (the Menagerie's own) |
| `origin/materials-audit` branch | its audit tool is already on main; its catalog furniture textures (`kits/catalog/tex/*.webp`, `materials.json`) collide add/add with main's | not merged on purpose: the branch can be deleted once the owner agrees |

## A. KNOWN_ISSUES audit (2026-10-20)

Four read-only agents read the 61 `KNOWN_ISSUES.md` files (not `archive/`) and listed every open item with a tag, an effort and
whether it needs the owner. Eight batches of items that can be tackled together came out of it.

| Batch | Work | Result |
|---|---|---|
| 1 | tick stale boxes (material-library notes, host-port notes) | done: 26 library boxes, the `TICKS` entries, 15 files of status notes ticked or reworded |
| 2 | "export profile: atmos and water left out" in 16 biomes | the premise was wrong: only geyser, ringisles, sedesert, shighlands and Throne bound `core/atmos`; the rest was a migration, now phases 0 to 4 in `HANDOFF-REBUILD.md` |
| 3 | re-vendor drift after the core/biome move | not done (shade, dalab, highlands, xanadu carry old copies; the placed settlements are rebuilt first, the rest are left until placed) |
| 4 | "only one Girder tower dresses" | done: the test towers return shells (seven biomes) |
| 5 | `TICKS` runs nowhere | done: handed to `core/host` in dalab, highlands, xanadu, reedlake, iziz; dalab and the Xanadu/Iziz city pages light fires at night |
| 6 | catalog pieces missing for biome fruit | 12 pieces added and tagged; loose geometry (tyres, pumps, weighbridge, lampposts, banners) still drawn by hand |
| 7 | walk/nav/collision | Girder done (148 bad edges to 4 by-design); locus riders/boats/caravans, ringsea, islanders, lizardmen skipped (need behaviour decisions) |
| 8 | small placement/z-fight/doc fixes | jimjam, yuni rack, ancients docs, Yuni aprons, Castra variant tags, Port/Hook label declutter done; `core/tags` cultures done |

### Still open, by theme (from the audit; each is in its own `KNOWN_ISSUES.md`)

- **Textures owed** (owner sets or prompts, `core/materials/PROMPTS-NEEDED.md`): rammed earth with lift lines (Xanadu), plaid/twill sheet (crops),
  `ground.puna` (ehighlands), alien surfaces still procedural in Throne (mat veins, aloe head, trumpet funnels, lamp caps, frill pods) and
  shighlands/oidong (trumpet ribbing, volute rind, wisteria, cushion domes), the Vothic and Izani clothes, cybernetic arms, copper that reads black.
- **Fauna**: no fauna in ehighlands, shighlands, oidong, geyser, xanadu, nwlowlands, crater-drylands, rift, Throne (needs `kits/fauna` adoption).
- **Far impostors read as blobs** in about 8 biomes (`core/biome` impostor work); runtime LOD costs draw calls and pops (swbay 614 meshes,
  swlowlands 995, nwlowlands 960).
- **Budgets**: xanadu 29.8M of 30M (no room for fruit), nwbay 276 of 300 calls, Throne station 1 at its ceiling, eastabyss 10.84M of 11M,
  Voth's city page 18.9M over the 16 MB cap, Girder `furn.calls` re-baselined to 78.
- **Interiors/furniture**: Iziz civic buildings and city have no interiors; Ys, Yuni (most), Highlands leftovers (`FURNISH` stubs), Locus
  leftovers, Girder/Mav lampposts/banners/flags still geometry; Girder interiors load in 16 s (118 s headless).
- **Life layer**: Voth's is the example; Locus, Mungo, Shade, Dhelv, Noah's Regret, Ys, Yuni not on `core/simulation` or only partly; people
  are capsules/box figures in several.
- **Doors and glass** (`TODO.md`): real doors across the kits is a design task (a core module), not part of the rebuild.
- **`kits/ancients`**: non-ground placement (only `buildSkyE/F` take `gy/noPlinth/hcut`), further draw-call headroom, the Dalab dome size is
  a guess (DR=110, DH=95), several view-quality items per type (Forest Ring, Arcbeam, Plymouth, Arcoindian, Lighthouse).
- **Ys**: city editor live buildings are not `core/tags` records; sunk ruins; the terrain port's tensor grid; stairs and bridges gaps.
- **Yuni**: 778 district candidates refused; many interior limits; the tower scale (`.34-.37`) item (no target in the entry).
- **Open-world pages**: little-demo is deprecated; isle-demo carries its cliffs/roads/places items (`openworld/isle-demo/KNOWN_ISSUES.md`).
- **Characters** (`core/charactermodels/KNOWN_ISSUES.md`): linear morph blending, clothing rigidity, Godot chain jitter, work clips procedural.

## B. Water and atmos scope of 19 biomes (2026-10-21)

Common starting point (before phase 0): every biome host drew water with its own `MAT_WATER` (a vertex-coloured plane, a 3-sine ripple on
a clock that never wraps, a flat sky colour, no displacement), a baked sky dome with a fixed sun, and no hour, weather or clock. Only
sedesert (river flow, cataract fall, plunge pool still), geyser and ringisles (sea open) bound `core/water`; sedesert, geyser, ringisles,
shighlands (cloud deck) and Throne 3/4/5/7/8/9/10 bound `core/atmos`.

| Biome / station | Water drawn (before) | Migration | Effort | State now |
|---|---|---|---|---|
| hyperjungle | static brook ribbon | `WATER.flow` | S | done (phase 2) |
| nhighlands | stream polyline, 2 falls, tarn, mist sprites | flow + falls + still | M | done (phase 2); sky/light modes (day, dawn, night) are the template for an hour clock |
| ebadlands | river, 6 acid pools, tarn | flow + one still per pool | S-M | done (phase 2); pools one colour each |
| sedesert | river/cataract/plunge on core; pond disc | pond to `WATER.draw` | S | done (phase 2) |
| Throne 2 kipuka, 6 savanna | streams; 16 pools | flow; still | S | done (phase 2) |
| swbay | 300x300 plane, river ribbon, foam-card cataracts | open + shore + flow + 37 falls | M | done (phase 3), the template |
| swlowlands, nwlowlands | plane (sea, bayou, delta), river | open + second masked surface + flow | M | done (phase 3); swlowlands brown ground squares remain (ground work) |
| rift | plane (algal lake), two streams | masked open + flows | M | done (phase 3) |
| eastabyss | plane (salt lake, marsh), east-river ribbon | masked opens + 6 flows | M | done (phase 3) |
| Throne 3 frontier | own shader sea with foam, Lambert streams | open + shore + flows | M | done (phase 3) |
| ringisles | sea on core, Lambert tide/brine pools | shore grid + still | S-M | done (phase 3) |
| geyser | sea on core; creek shader; terrace pools painted in the ground shader; Points geysers | spring/geyser kinds, then creek flow, terrace stills | L | kit show on the geyser kind (phase 1); creek and terraces open |
| nwbay | bay plane, cenote discs, terraced river with snapped pool levels, foam cards | open + flow + still + terraces | L | open (phase 4); `WATER.terraces` written, not adopted |
| shighlands | tarn and bog discs; ravine streams painted as a dark band | open/still; derive a stream line | M | open (phase 4); cloud deck already on atmos |
| oidong | 4 mirror pools, painted stream, canvas-ribbon cataract (70 m), spray sprites | still + flow + fall | M | open (phase 4); 70 m drop untested |
| xanadu (biome) | lake plane, advected-ripple river, spray `Points` fountain, sky-paint cataract | open + shore + flow + fall; fountain open | M | open (phase 4) |
| ehighlands | 34 bog pools, tarn (frozen: its own ice shader), stream ribbon | still + flow; ice stays local | M | open (phase 4) |
| crater-drylands | one seep disc; fire model with flames/smoke pools | still; fire needs a design | S water, M-L fire | open |
| Throne 1 | acid lake and hot pools, 48-gon discs | `WATER.spring`/still only (at 20M ceiling, now 22M) | S | open |
| Throne 4 isle | own-shader sea, Lambert stream, own curtain, banded springs, `GEY_MAT` geysers | open + flow + fall + spring + geyser | L | open (phase 4) |
| Throne 5 cloud forest | 4 falls, streams, pools | falls + flow + still | M | open (phase 4) |
| Throne 8 vents | marsh rings, hot pools, mud pots | still + spring ramp; mud pots no kind | M | open (phase 4) |
| Throne 9 glacier | proglacial lake, melt-water braids, icebergs | open + flows; ice melt has no kind | M | open (phase 4) |
| Throne 7, 10, 11 | no water (lava in 10, 11 is not a water kind) | none | n/a | none |
| korona | no kit existed in the survey | built since (six stations); on atmos/water per build.py | - | needs the host binding and options |
| new upstream (necanyons, nsemiarid, guilin, dambasins, scablands) | built after the survey | check each against `tools/check_core_use.py --list` | - | open |

### Gaps in the shared modules the survey found (status)

1. Per-body tint (peat, algal, salt, acid, glacial milk; a freshwater bayou beside a sea): option written (`tint`, mask blend, gradient), not adopted.
2. Stepped rivers (a level per pool): `WATER.terraces`, written, not adopted.
3. Frozen water and lava are not water kinds; a fire kind is missing from `core/atmos` (crater-drylands).
4. Painted-dome skies have no `core/atmos` sky preset and no shared hour clock; reflections stay a flat colour until a dome exists to capture.
5. A 70 m fall and a 44 m/s fountain jet are untested in `drawFall`/geyser kinds.
6. Floating things (lily pads, rafts, scum, boats) read the static `BIO.waterH`: they need `WATER.heightAt/ride`.
7. Shore grid cost scales with its box; seeds were hand-placed: `seeds:'edge'` and a window written, not adopted.
