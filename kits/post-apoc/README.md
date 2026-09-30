# Post-Apoc set

A generic post-apocalyptic building kit, made of **reclaimed and recycled material**, meant to be dropped into any settlement (a ruin camp beside Iziz,
a Voth river shanty, a Republic frontier stop) and then dressed in that culture's marks. Not to be confused with the Ancients' reclaimed buildings
(`kits/ancients`, the Ancient Iziz Style): this set is called **post-apoc** everywhere.

`dist/post-apoc.html` shows every building in rows by family. Toolbar: **Time** (Day / Dusk / Night), **Doors** (shows each building's front-door marker), view select, Inspector (hover: name, class, tags), Shadows, **Culture** (Generic /
Iziz / Voth / Republic: rebuilds the whole set with that culture's marks), Polygon (click-to-coordinates), Walk (F).
URL parameters: `?culture=iziz`, `?only=shop-food,dw-silo`.

## Architecture: reclaimed CORE + recycled ADDITIONS + cultural SOCKETS

1. **Cores** (`src/32-cores.js`): the large reclaimed objects at real scale. Shipping containers (20 ft / 40 ft), grain silos, storage tanks (vertical, lying),
   school buses, semi trucks, and arcology **bulkheads** (the Ancients' white ceramic slab with a round hatch or a doorway).
2. **Additions** (`src/34-adds.js`): what is lashed onto a core out of scrap. Sheet-metal lean-tos and gable roofs, earth-filled **tyre walls and rings** (real tori
   packed with earth), **bottle-glass walls**, patchwork plank-and-sheet walls, decks, stairs, ladders, stovepipes, solar panels, water butts, barrels, tarps, fences, junk piles.
3. **Sockets** (`src/36-def.js`, `sock()`): every building declares where a culture's marks go (`awning`, `banner`, `flag`, `emblem`, `sign`, `paint`) with a
   local frame and size. Buildings never mention a culture.
4. **Culture packs** (`core/sockets/80-cultures.js`, shared, see `core/sockets/README.md`): fill the sockets. Shipped: `generic` (faded tarps and rags), `iziz` (orange, teal, striped awnings, a sun),
   `republic` (Voth's deep red with the triskelion), `voth` (deep blue with an ash-white glyph, ragged cloth), `yuni` (yellow, the hyperboloid), `beastriders` (green, the claw).
   A pack may also supply a `paint` list that the containers' livery (`PAINT()`) draws from. To add a culture: one `mkCulture({...})`, no building changes. `place(key,x,z,ry,{culture:'yuni'})` dresses one building in a pack.

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
Each key goes into the first free slot its declared footprint fits (rotated as needed); `window._compound` reports placed and rejected.

## Build and verify

```
python3 build.py                                                 # rules + node --check; writes dist/post-apoc.html
python3 verify.py dist/post-apoc.html --assert --all-views --out shots
python3 verify.py dist/post-apoc.html --only shop-food --culture voth --cam=-12,6,20,0,3,0
```
`--assert`: footprint and height inside the declared box, no NaN geometry, every building declares sockets and type tags, every def placed, triangle budget. Contract: `API.md`.
