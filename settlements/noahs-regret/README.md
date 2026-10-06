# Noah's Regret

A floating harbour city of the Ancients that once sailed the Ring Sea: a ring of pontoon hull, 480 x 340 m, round a
basin big enough for two liners, four decks of cabins and public rooms inside the ring, and on top a platform of
parks and white Ancient mid-rises. It ran aground on the south shore over a thousand years ago and lies there broadside,
listing 0.8 degrees to port and 0.4 by the bow, its starboard pontoon on the sand. Today it is **Noah's Regret**, the base
of **Bloody Ruephus**, dread pirate of the Ring Sea. Apart from some minor damage to the mid-rises it still works as a
harbour; the pirates live in it, and a rowdy port will spill down its timber stairs onto the beach (that settlement
comes later).

This build is the arcology itself, reclaimed, with its interiors furnished as a **test case of an arcology interior**:

| What | Where |
|---|---|
| **The hull**: the pontoon (antifouling red below the old waterline, a band of barnacles across it, white above), the outer promenade and the inner quay on its top, the main block of four decks, the top deck; the harbour mouth on the port beam (76 m) with its two pier heads, beacon towers and the bascule bridge's leaves jammed open | `src/40-nr-hull.js` |
| **The decks**: corridors, cabins (a door each, the partitions on the frames, glazed walls and balconies on D3-D4), the service core, eleven switchback stair cores with kiosks on top. Only **D3 and D4 are inhabited**; D1 and D2 are stripped and empty | `src/42-nr-decks.js` |
| **The grand atrium**: starboard midships, a void through all four decks under a glass dome, galleries round it, a grand stair of four flights on bridges across the void, a descent to the holds | `src/44-nr-atrium.js` |
| **The bridge** (D4, the bow), **the grand dining room** (D3-D4, double height, the stern), **the engine room** (D1-D2, the stern: four great engines, silent a thousand years) | `src/46-nr-rooms.js` |
| **The holds**: the pontoon's cargo holds, empty, half full of the sea (its own water: the hull is holed), columns, bulkheads, a mezzanine gallery | `src/47-nr-holds.js` |
| **The top deck**: parks gone to meadow, the stern garden and its dry fountain, the raked funnels, lamp standards, vents | `src/48-nr-top.js` |
| **Ancient deck buildings** (11): four Ribbon terraces and three Drum towers (apartments), three Lens offices, and the **small Reliquary** (a laboratory) | `src/54-60` |
| **Ruephus's use of them**: the Reliquary is his **headquarters** flying his flag (a blood-red jack, a skull over crossed bones) from its needle; the apartments and offices are **barracks**; one office is the crews' **mess hall** | interiors: `kits/interiors/sets/noahs-regret.js` |
| **The pirates' timber**: stair towers up the starboard hull, steps down the dune to the beach, floats for boats off the inner quay, sailcloth awnings, flags on the beacons | `src/62-nr-pirates.js` |
| **Furniture** (no life layer yet): every inhabited cabin, every deck-building room, the public rooms, the quay and the top deck, from the master catalog | `src/70-nr-interiors.js` |

## The interiors (the test case)

Everything is **data first** (repo `README.md`, "Furniture that is not always drawn is data first"):

- **The plan** (`14-nr-plan.js`, no THREE) owns every position: the ring as an ellipse with arc-length coordinates
  (t along, s across), the deck heights, the zones, the stair cores, every cabin (deck, side, frames, class, door, kind),
  the lots, parks, towers, steps and floats. Every drawing pass and the furnishing pass read it.
- **Cabins** are rooms (the interiors kit's `normRoom`): ~600 inhabited ones on D3 and D4. Cabins with the same template
  (width class, door side, kind, deck) are furnished **once** by the interiors kit's placer (`furnishRoom`, the master
  catalog) and the result becomes core/furnish **records** in each of them. Kinds: `bedroom` (the officers on D4, the
  crew below: a bed and a chest, salvaged Ancient fittings), `bunkroom` (two bunks and a locker), `store` (loot).
- **Deck buildings**: each def names an item of the interior set `kits/interiors/sets/noahs-regret.js` (the building's
  glazing line, its storeys); `planBuilding` cuts each storey into rooms, the builder draws the planner's floors,
  partitions, stairs and door leaves (`nrDrawPlan`), and the rooms are furnished once per item. The set adds three room
  kinds: `crew` (a barracks room: bunks, a locker, a weapon rack), `bunkroom`, `mess` (a servery, tables, benches, food).
  Every barracks and the HQ pass the residence rule (beds, food and item containers).
- **The public rooms** are placed piece by piece: the Ancients' consoles and Ruephus's helm seat on the bridge;
  refectory runs, benches, the captain's table on its dais, chandeliers and banners in the dining room; a pirates'
  workshop in the engine room; lamp standards, planters and benches in the atrium; lanterns along the corridors; cargo
  in the holds and on the quay; on the top deck lamp posts, benches, fires, AA batteries turned on the sea, and
  Ruephus's justice by his door (stocks, cages, a gibbet).
- **Drawing**: a template's pieces are built once and drawn as InstancedMeshes; only the rooms near the camera (and
  on the cut deck) are drawn. Every record exists whatever is drawn (`SVF.placed`, core/tags).

## Seeing inside

Pick a **level** (or press **C** to cycle): the hull is cut away above a height in its own frame, so a deck lies open as
a plan; walls and slabs show their cut in a dark section colour. Levels: the holds, D1 .. D4, the dining room's double
height, the top deck's buildings storey by storey. **F** walks at eye height on the deck under you (**Q / E** down and up
a level, WASD, drag to look). **T** the inspector (what, where: deck, cabin, zone), **P** the polygon tool, **N** night
(the lanterns lit).

## Build and verify

```
cd settlements/noahs-regret
python3 build.py                                         # -> dist/noahs-regret.html (node --check when node exists)
python3 build.py --vendor-check                          # 81-sky.js (iziz), 30-geo.js (kits/scyvoi)
python3 verify.py dist/noahs-regret.html --assert --all-views --out /tmp/nr-shots
python3 ../../tools/textures/pack.py settlements/noahs-regret   # (from the repo root) after a change to materials.json
```

The page takes several minutes to load under software GL (the furnishing pass and ~1 M triangles); a real GPU loads it
in seconds. `?furniture=0` draws no furniture (the records are still kept), `?mat=proc` draws without the library maps,
`?hour=H` sets the clock.

## Docs

`API.md` the frames, the plan and the contract; `KNOWN_ISSUES.md` what is open; `PORT.md` the port tags; `INDEX.md` the
fragments. The engine is forked from `kits/scyvoi` (geometry merge, library materials, the furniture glue, the dev
tools); the sky is the standard KratorSky (vendored from Iziz); the sea is core/atmos's wave field.
