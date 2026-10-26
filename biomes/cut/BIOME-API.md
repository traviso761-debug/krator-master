# Krator biome kits — the contract (the Cut's edition)

The Cut is a kit on the shared biome core (`core/biome`, `CORE_BIOME` in `build.py`), in its own registry
(`BIO.kit('cut')`). Most of what it does is to other kits' flora: it reads `biomes/nwlowlands` (every station) and
`biomes/nhighlands` (the face) in place and warps them as they build. A world that takes the Cut takes those kits too.

## What the host provides

`BIO.init` as every kit (`47-host-land.js`), plus what the Cut's own planners read, in the host's `STAGE` (`45-host-stage.js`):

```js
STAGE = { site:{x,z},      // the station's place in BOWL coordinates (CUT.SITES)
  yRef, toBowl(x,z), alt(y),  // page y = bowl height - yRef; page (x,z) + site = bowl (x,z)
  ground(x,z),             // terrainH: the bowl's sweep plus the station's own (the creek, the terraces, the broken crest)
  zone(x,z) -> {grove, reed, rank, melon, nw, nhl},   // where each native and each read-in kit may grow, 0..1
  fields:{...},            // the read-in kits' fields (nwlowlands: wet, tropic, dry, flow, upland; nhighlands: cold, wet, rock, mist)
  nwAllow:[keys], nhlAllow, // the read-in species the plan names for the station's ring
  camp:{x,z,yaw}, melons(P), lichen(P), pool, water, views() ... }
```

## What the kit exports

```js
CUT.bowl.h(x,z), CUT.bowl.floor, CUT.bowl.grade, CUT.lipR(b), CUT.lipH(b), CUT.LAKES, CUT.lakeAt, CUT.SITES, CUT.px(px,py)
CUT.field(x,z) -> {s, r, ar, at, axis, k}     CUT.north(x,z) -> {dir, w}     CUT.warp(x,z,{id,salt,size,bites})
CUT.snap(k,s), CUT.quant(v,step,s), CUT.airScale(y), CUT.horizon(site, bands, n, eyeH)
CUT.warpKit(api, {ground, toBowl, alt, allow})  // call before api.build: warps api.buildTrees' trees and api.buildFloor's plants
CUT.build(env) -> counts;  CUT.PLANTS (the records: groves and their culms, reeds, rank, melons, lichen);  CUT.CAMP
CUT.plan(env), CUT.draw(P), CUT.planMelons, CUT.drawMelons, CUT.planLichen, CUT.drawLichen, CUT.planCamp, CUT.drawCamp
CUT.checkMelons(L), CUT.checkLichen(L)          // the kit's checks, also run by verify.py --assert
CUT.SPECIES (5 natives, tagged), CUT.HARVEST, CUT.byKey, CUT.speciesOfItem(item), CUT.TAGS, CUT.MAT, CUT.G
```

Bowl coordinates: metres, x east, z south, the origin at the bowl's centre (scale model px 460,302). Bearings clockwise from north.

## The rules of this kit

- **The warp is a transform at placement**, never a per-frame cost: a culm's, a tussock's, a spray's or a read-in tree's matrix
  carries its lean and stretch. The bite is geometry (pre-bitten culms; a read-in crown's foliage taken out of a sphere); the
  echo a second instance in an additive material whose opacity the host sets from the sun's height (`CUT.echoLight`).
- **Every draw is a KRAND hash of (world, cell, index, salt)**, never a stream position: a tile planned alone is the same.
- **A grove's internodes are one length**, and its culms' bases are sunk so every node stands on the grove's levels.
- **The cut is the one smooth thing on Krator**: no noise inside the lip (the bowl's sweep is the model's heights, smoothed).
- The camp's props carry `culture:'iziz'`, `style:'dilihan'`, `role:'placeholder'`: a Dilihan kit takes them over.
