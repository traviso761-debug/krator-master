# Handoff: the Ancients kit's interiors (paused 2026-10-07)

The user asked (2026-10-07): interiors for the Ancients kit's buildings, excluding arcologies, megastructures and
structures without interior space; rooms of sensible sizes inside each building's real interior bounds; do NOT furnish
skyscrapers or the ruined / reclaimed / worn versions, but keep a socket so a culture's furnishing can be put into any
room later; partitions may be broken between rooms in ruins (with a little randomness per placed ruin); start with the
original kit, then show the user. The user then paused the work: merged to `main`, this file to pick it up.

## Where it stands

**Done and verified** (`kits/ancients`, `python3 build.py --target=interiors && python3 verify.py dist/interiors.html --assert`:
every check PASS, 24 sites, 4833 rooms, 156 furnishing templates audited, core/tags zero unknowns):
- `src/35-ai-plates.js`: ring, bar, open-bay grid and hall plates; the ruin pass (seeded per type, jittered per placement).
- `src/37-ai-kit.js`: the plan API (`AI.kitPlan`, `AI.SKIP`), the socket (`AI.cultureAdapter`, `AI.furnishPlan`:
  templated rooms, big halls by recipe), the building-type map onto core/tags, and the **Police station** plan.
- `src/37b-ai-kit-houses.js`: Houses A-C (`house`), D-F (`house2`), the lab and its reactor hut (`lab`).
- `src/37c-ai-kit-works.js`: the Foundry (`fac`), the Assembler (`robo`), the Vault (`dc`), the Starfish (`port`).
- The catalog's 19 Ancient interior pieces (kits/catalog "Ancients kit extras"); the `ancient` dress takes them.
- `kits/ancients`: `src/8zz-interiors.js` (the pass: floors, partitions, door gaps, stubs and rubble, clearing the
  intact dark mass and the ruins' fake `civRooms`, core/tags records, core/furnish records for intact buildings, drawn
  on opening), `src/92z-interior-ui.js` (cut-away, selector, `_api.interiors`, the socket `_api.interiors.socket`),
  the hook in `src/90-scene.js`, the `interiors` target, `verify.py` interior assertions. API.md "Interiors".

**Not done** (in this order):
1. **Plans for the rest of the original kit's interior types**: `off` (Offices A, B, C), `apt` (Apartments A, B, C),
   `gov`, `lib`, `bunk`, `cult`, `hosp`, `hotel`, `campus`. Three parallel passes were stopped mid-way. Only the civic
   pass had written a file: `wip/37d-ai-kit-civic.js` (gov, lib, bunk, cult; it PARSES but was never tested; move it
   back to `src/` and run the harness below before trusting it). The brief those passes followed is at the end of
   this file; each wrote its own `src/37<letter>-ai-kit-<group>.js` (37a offices+apartments, 37d civic, 37e
   hospital+hotel+campus). The `interiors` target already lists their rows; a type without a plan just shows no rooms.
2. **Skyscrapers**: rooms (never furniture), per storey band from each tower's own shape function (they live inside
   their builders: `52-sky-abc.js`, `56`-`58`, `70-sky-g.js`, `71-sky-h.js`, `66b-flatiron.js`, `89k`-`89m`).
3. **Show the user** the `interiors` page (`kits/ancients/dist/interiors.html`): publish it as an artifact or a gallery
   card (`gallery/build_gallery.py`, a new kit card under the rules in CLAUDE.md), with screenshots of each type.
4. Then ask whether to turn interiors on in the main `kit` target (add it to `INTERIOR_TARGETS` in `build.py`; check the
   page's load time and triangle budget), and in the alternates, the Iziz style and the Yuni variants.
5. Smaller: stairs are not drawn (cores and end rooms stand where they go); the ruins' holes are not cut into plans;
   Noah's Regret inlines this kit's core and should be rebuilt and re-verified (`settlements/noahs-regret`: its page
   text changes, its furnishing does not; then its PORT-BASELINE entry); `KNOWN_ISSUES.md` lists the rest.

## How to test a plan (node, no browser)

```
cd kits/ancients-interiors
python3 tools/bundles.py      # once (and after a catalog or kits/interiors change): tools/.cache/fb.js, ib.js
node tools/kp.js <type>       # the plan at decays 0, 1, 3: rooms per storey by kind, areas, broken walls, audit
node tools/kfp.js <type>      # furnishes the intact plan with culture 'ancient' alone (~0.2 s per template)
```
Then `cd ../ancients && python3 build.py --target=interiors && python3 verify.py dist/interiors.html --assert`, and
look at the views (`--views "<name>, intact: inside, storey 1"`; every site has one, made by `targets/interiors/91z-views.js`).

## The brief the plan passes followed

### Brief: room plans for the original Ancients kit's buildings

Repository `/home/user/krator-master`, branch `claude/busy-maxwell-8uvk60`. **Do not commit, push, or edit any file
except your own plans file** (named in your task). The lead session commits. Read `/home/user/krator-master/CLAUDE.md`
and obey its token rules: never open `dist/`, `three.min.js`, `*.zip`; never read a fragment over ~30 KB whole
(`grep -n` for headers, then read ranges).

#### What we are building

The user wants interiors for the Ancients kit's buildings (`kits/ancients`, the original `kit` target), excluding
skyscrapers, megastructures and structures without interior space. Rooms of appropriate sizes that fit inside each
building's real interior bounds, as DATA in the builder's own frame, so that:
- the intact building (decay 0) is furnished with Ancient furniture (done elsewhere, from your plan);
- ruined (1, 2) and rehabilitated (3, 4) versions keep the plan with some partitions broken (done by `AI.kitPlan`
  through `AI.ruinStorey`; you supply only the `collapse` predicate where the builder's ruin has fallen in);
- any culture can later be socketed into the rooms (every room has a kits/interiors room KIND).

#### Read first

1. `kits/ancients-interiors/src/35-ai-plates.js`: the plate generators (`AI.ringPlate`, `AI.barPlate`,
   `AI.gridPlate`, `AI.hallPlate`) and the storey/room/wall shapes. Read it whole (it is small).
2. `kits/ancients-interiors/src/37-ai-kit.js`: the header (the `AI.KIT[type]` entry shape) and the worked example
   `AI.KIT.police` (73-police.js). Copy its style: a header comment per type naming the builder fragment and the
   builder numbers you used, then `buildings(d)` returning `[{ id, name, storeys, floors, hollow, inside, collapse? }]`.
3. Your builders in `kits/ancients/src/` (named in your task). Read them carefully: every room must stay inside the
   shell the builder actually draws, at the storey heights it draws (or, where it draws no floors, at sensible
   storey heights inside its volume). The builder frame: group at the site with NO rotation, x east, z south (+z),
   y up, ground y=0, front +z. `lathe` points are `(r cos th, y, r sin th)`; a lathe with `nu:6` is a hex with
   vertices at multiples of 60 degrees (use `AI.hexR(R, th)`); `flutes` modulate r (see `lathe` in
   `kits/ancients/src/32-surfaces.js` lines 9-13). `kput(name,[x,y,z],q,[sx,sy,sz])`: `boxC`/`boxD`/`BOXC(d)` are
   unit boxes centred at the point (so a box spans p ± s/2), `slab` is a unit cylinder (scale x/z = radius, y =
   thickness, base at p? check `kdef('slab'` in 34-kitdefs.js). Intact interiors are often a dark liner lathe
   (`MAT.dark` at k·r): keep rooms inside the liner. Some intact interiors are SOLID dark kit boxes (`boxD`): list
   those in `hollow` (as `{ box: [x0, x1, y0, y1, z0, z1] }` in builder-local metres, the box's full extent) so the
   kit can clear them before drawing rooms.

#### Rules for the plans

- **Sizes.** Offices and studies 15-45 m2; flats: a living room, bedroom(s), kitchen per unit (units 50-120 m2);
  wards: 25-60 m2 (`sickbay`); hotel rooms 20-35 m2 (`bedroom`); classrooms 50-80 m2 (`school`); stores any size.
  Corridors 2-2.8 m. Storey heights as the builder draws (often 4.2-5.5 m; the room's `h` is the clear height).
  Huge single volumes (factory vault, assembly halls, server halls, concourses) use `AI.gridPlate` (open bays
  along aisles) or a few `hallPlate`s, not one 10 000 m2 room.
- **Kinds** (kits/interiors `IX.PROGRAMS` plus the ship kinds): `hall bedroom kitchen living dormitory study library
  school barracks workshop store shop tavern antechamber sickbay chartroom strongroom armoury brig laundry mess`.
  Use `corridor`/`core` only through the plates. Use what the building is: hospital → `sickbay` wards, `study`
  offices, `store`, `kitchen`; library → `library`, `study`; lab → `workshop` (labs), `study`, `store`; factory /
  robotics → `workshop` bays, `store`, `study` (offices); data centre → `store`/`workshop` server bays (the rack
  pieces are `workshop`/`store`), `study`; police/bunker → `barracks`, `armoury`, `brig`, `study`, `store`,
  `kitchen`; government → `hall` (chambers), `study`, `library`, `antechamber`; flats → `living`, `bedroom`,
  `kitchen`; hotel → `bedroom`, `hall` (lobby), `kitchen`, `mess`; school/campus → `school`, `library`, `study`,
  `hall`; starport → `hall` (concourse bays), `store`, `shop`, `antechamber`; cultural centre → `hall`, `library`,
  `shop`, `antechamber`.
- **Doors** come from the plates; a `hallPlate`'s door is the midpoint of edge `doorEdge` of its polygon.
- **Each `buildings(d)`** must return the SAME room/wall ids for every d (so a ruin is the intact plan with breaks),
  except where the builder's ruin removes a whole part (then drop those storeys or rooms for `d > 0`, as the Police
  bays do). `collapse(x, z, y)` returns true where the ruin has fallen in (e.g. Office A's missing sector `SEC`,
  Office B above its cut, a fallen tray) so those rooms read `open` and their walls fall.
- **`inside(x, z, y)`**: a loose test of the building's interior bound, used by `AI.storeyAudit`.
- **`floors`**: true when the builder draws no floor slabs inside (the kit will draw them per storey); false when it
  does (Office C's `cDeck`, Apartments A's trays, the hospital podium's slabs, the hotel's `hConc`, campus `segBox`).
- Use `AI.ringPlate({ sym: 6 })` on hex shells so like rooms repeat (furnishing is templated per room shape).

#### Test (node, no browser)

```
cd kits/ancients-interiors && python3 tools/bundles.py
node tools/kp.js <type>      # the plan at decays 0, 1, 3: rooms per storey by kind, areas, broken walls, audit
node tools/kfp.js <type>     # furnishes the intact plan with culture 'ancient' alone (slow: ~0.2 s per room template)
```
Both load every `kits/ancients-interiors/src/[0-4]*.js` file, yours included. Make `kp.js` print `audit ok` for every
storey at every decay, room areas in the ranges above, and `kfp.js` report `template audit fails 0` and no (or few,
explained) `missing` needs. 

#### Report (under 500 words)

Per type: buildings and storeys, room counts by kind, the builder numbers you relied on, the `hollow` boxes, what
you left out and why (a part with no usable interior: say so plainly), and the kp/kfp results.
