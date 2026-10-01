# Post-Apoc set

A generic post-apocalyptic building kit, made of **reclaimed and recycled material**, meant to be dropped into any settlement (a ruin camp beside Iziz,
a Voth river shanty, a Republic frontier stop) and then dressed in that culture's marks. Not to be confused with the Ancients' reclaimed buildings
(`kits/ancients`, the Ancient Iziz Style): this set is called **post-apoc** everywhere.

`dist/post-apoc.html` shows every building in rows by family. Toolbar: **Time** (Day / Dusk / Night), **Clock** (lets the sim clock run: the sky and the lit windows follow it), **Doors** (shows each building's front-door marker), view select, Inspector (hover: name, class, tags), Shadows, **Culture** (Generic /
Iziz / Voth / Republic: rebuilds the whole set with that culture's marks), Polygon (click-to-coordinates), Walk (F).
URL parameters: `?culture=iziz`, `?only=shop-food,dw-silo`, `?night=0..1`, `?clock=N` (run the clock at N sim minutes a second), `?t=12.5` (pin the animation time, for screenshots), `?anim=0` (t = 0), `?interiors=1` (plan and furnish the rooms, below), `?furniture=0` (no furniture pieces).

## Animation and night

Cloth flutters (culture awnings, banners, flags, `tarp()` sheets), fires and lamps flicker, smoke rises from every `stovepipe()`, `fire()` and the two big stacks, turbines and fans
turn (`spin()`). All of it is a pure function of the animation time and moves only in shaders or in objects outside the registry, so footprints and bboxes are what the builders drew.
At night windows light by an evening schedule (most at dusk, fewer as the night deepens), lamps cast a cone of light and lit front doors a spill on the ground. Details and hooks: `API.md`, *Night and animation*.

## Architecture: reclaimed CORE + recycled ADDITIONS + cultural SOCKETS

1. **Cores** (`src/32-cores.js`): the large reclaimed objects at real scale. Shipping containers (20 ft / 40 ft), grain silos, storage tanks (vertical, lying),
   school buses, semi trucks, and arcology **bulkheads** (the Ancients' white ceramic slab with a round hatch or a doorway).
2. **Additions** (`src/34-adds.js`): what is lashed onto a core out of scrap. Sheet-metal lean-tos and gable roofs, earth-filled **tyre walls and rings** (real tori
   packed with earth), **bottle-glass walls**, patchwork plank-and-sheet walls, decks, stairs, steel stairs / landings / pipe rails, ladders, stovepipes, solar panels, tarps, fences.
3. **Sockets** (`src/36-def.js`, `sock()`): every building declares where a culture's marks go (`awning`, `banner`, `flag`, `emblem`, `sign`, `paint`) with a
   local frame and size. Buildings never mention a culture.
4. **Culture packs** (`core/sockets/80-cultures.js`, shared, see `core/sockets/README.md`): fill the sockets. Shipped: `generic` (faded tarps and rags), `iziz` (orange, teal, striped awnings, a sun),
   `republic` (Voth's deep red with the triskelion), `voth` (deep blue with an ash-white glyph, ragged cloth), `yuni` (yellow, the hyperboloid), `beast-rider` (green, the claw).
   A pack may also supply a `paint` list that the containers' livery (`PAINT()`) draws from. To add a culture: one `mkCulture({...})`, no building changes. `place(key,x,z,ry,{culture:'yuni'})` dresses one building in a pack.

## Furniture comes from the catalog

Barrels, crates, sacks, lamps, fires, tyre seats and tables, junk piles, water butts, planters, counters, racks, carts, cages, stalls and the rest are **furniture**: master-catalog
pieces (`kits/catalog`, the `pa_*` pieces harvested from this kit) placed as data with `FURNISH(key, lx, ly, lz, lry, {v})` and built by the catalog's own code (one generated bundle,
`38-furniture-bundle.js`; the glue is `src/91f-furnish.js`). Each building's pieces are on its record (`rec.furniture`). Indoors the rooms are the interiors kit's
(`kits/interiors/sets/post-apoc.js`): the builders draw nothing inside a planned room, and `?interiors=1` plans and furnishes them. Details: `API.md`, *Furniture*.

## The buildings (33 defs, tags per README: culture, type)

| Family | Keys |
|---|---|
| Small dwellings (7) | `dw-silo` `dw-box` `dw-tire` `dw-bus` `dw-tank` `dw-bottle` `dw-stilt` |
| Large dwellings (4) | `lg-stack` `lg-twinsilo` `lg-bulkhead` `lg-tanktower` |
| Civic and religious | `longhouse` `mess` `chief` `shaman` |
| Shops (5) | `shop-food` `shop-armor` `shop-weapon` `shop-tinker` `shop-general` |
| Industry and power | `smithy` `gen-wind` `gen-fuel` `warehouse` |
| Farm | `farm` `farmhouse` `granary` |
| Defence and justice | `watchtower` `cages` |
| Set pieces | `compound` (walled, accepts >= 3 buildings through slots) `arena` (Thunderdome) `dock` |

Reusing a building elsewhere: `place(key, x, z, ry, {v: variant})` inside any world that carries `30-geo.js`, `20-tex.js`, `22-mat.js`, `32-cores.js`, `34-adds.js`,
`36-def.js` and the fragment that holds the def; add the culture pack fragment for the world's own marks. Everything is merged into ~16 draw calls.

## Flora

Plants are never part of a building: they are `plant()` placeholders (roles like `crop`, `shrub`, `groundcover`, `tree`) tagged by moisture and riparian need, so a settlement swaps in
its biome's real plants once (`PLANTS.draw`) and every building follows. See `API.md`.

## The compound

`compound` builds a walled yard from mixed reclaimed wall segments and takes buildings through **slots**: `place('compound', x, z, ry, {slots:['smithy','dw-silo','gen-fuel','shop-general']})`.
Each key goes into the first free slot its declared footprint fits (rotated as needed); `window._compound` reports placed and rejected (`window._compounds` lists every compound in the world).
The standard yard (64 x 54) takes buildings up to ~21.5 x 16 m. For the big ones pass `size:'large'`: an 82 x 76 yard (declared through the def's `sizes`, so the footprint check follows)
whose `great` slot (41 x 35) takes any building in the kit (longhouse, chief, bulkhead, farm) and whose `back-right` slot (27 x 19) takes the warehouse / `lg-stack` class; it fills the
smallest free slot that fits. The showcase row places one: `place('compound', x, z, 0, {size:'large', slots:['lg-stack','warehouse','dw-silo']})`. The default output is unchanged.
Two of the longhouse / chief class need `size:'xl'`: a 106 x 76 yard with two great slots (41 x 35 each, `great-left`, `great-right`), plus back-mid, left-mid, right-mid, west, east and two front slots;
the last showcase row places `{size:'xl', slots:['longhouse','chief','smithy','shop-general','dw-silo','gen-fuel']}`. A rejected key's `reason` says which slots fit it and which size would take it
(e.g. `size:'xl' would take it (two great slots)`); `verify --assert` fails `compound-slots-filled` on any rejection in the showcase.

## Build and verify

```
python3 build.py                                                 # rules + node --check; writes dist/post-apoc.html
python3 verify.py dist/post-apoc.html --assert --all-views --out shots
python3 verify.py dist/post-apoc.html --only shop-food --culture voth --cam=-12,6,20,0,3,0
```
`--assert`: footprint and height inside the declared box, no NaN geometry, every building declares sockets and type tags, every def placed, triangle budget, a front door from `door()`/`entry()` on every building (none on the default), colliders published, every front door's approach reachable on the nav grid, every compound slot key placed. Collision and nav data: `API.md`. Contract: `API.md`.
