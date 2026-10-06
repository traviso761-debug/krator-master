# Reed Lake — generator API (the contract)

Same fragment contract as `../highlands/` (and `../ancients/`): `src/` fragments are concatenated by `build.py` in
filename order into one `<script>`; every top-level name is a global; `build.py` fails on duplicate or generic
names, on a `build*()` that does not open with `reseed(N)`, and on seed collisions. Units are metres, `x` east,
`z` south, `y` up.

## Loop

```
python build.py                                   # dist/reedlake.html, dist/reedlake-village.html
python build.py --target village
python verify.py dist/reedlake.html --assert --views "Reed Lake — Dwellings,Great mudhif — eye level" --out shots
python build.py --vendor-check                    # vendored fragments identical to ../highlands/src?
```

Views are generated (`hlAutoViews`): `Opening`, `Overview`, `Reed Lake — overview`, one per family row
`Reed Lake — <family>`, one per building `<name> — eye level`.

## Fragments

| file | what |
|---|---|
| `00-head.html` `99-tail.html` | page shell |
| `10…69c` `70…73` `91` `92` `93` | **vendored** from `../highlands/src` — do not edit (core, kit, vernacular blocks, the Highlands vocabulary, probe, camera, labels) |
| `74-rl-mat.js` | `RPAL`, `RAND` (the Andean dye palette), reed textures, the woven maps, kit items (prefix `hRL`) |
| `75-rl-helpers.js` | `RL` registry, islands, pads, reed beds, anchors, the mudhif, huts, boats, pontoons, posts, cloths, beasts, yard pieces (prefix `hnRL`) |
| `76-rl-dwell.js` `77-rl-village.js` `78-rl-work.js` `79-rl-farm.js` `80-rl-islands.js` | the builders |
| `81-rl-tavern.js` | Reed's Local (`rl_tavern`, family Hospitality): the sign texture and item `hRLTavSign`, `RLTAV` (the plan's numbers, which `kits/interiors/sets/reedlake.js` reads), `hnRLTavPad`, the builder |
| `90-rl-scene.js` | showcase: rows by family over water, `hlAutoViews`, the lake |
| `91a-rl-budget.js` | per-def triangle classes (`rl_village` is `mega`) |
| `94-rl-anim.js` | the water map scrolls |
| `targets/<t>/89z-rows.js` `91z-views.js` | `TITLE`, `HL_BRANCHES`, `HL_EXTRA`, `SITES`, `VIEWS` |

## Registry

```js
RL.def({key, name, family, tags:{type:[…], wealth, lit:false}, w, d, h, build})   // branch 'tribal' internally; culture 'reed-lake'
VERN.place(scene, key, x, z, ry, o)      // o = {v, pad:false (on a shared island), scale, y}
hnSub(key, lx, ly, lz, lry, {pad:false}) // place a def on the island the running builder is making
RL.WATER                                  // −0.45: the lake surface below the island top (y = 0)
```

A def whose landing reaches out over the water past its +z edge says how far: `landing: <metres>` (`rl_tavern`: 6.5).
Everything that needs dry island stays inside `w x d`.

**Reed's Local** (`rl_tavern`, w 26 x d 36, h 12, `landing: 6.5`), local frame: the hall mudhif centred (−3, −2)
(x −8.75..2.75, z −16..12), its door at (−3, 12), 1.7 wide; the kitchen-and-store mudhif centred (6.55, 4) (x 3.35..9.75,
z −2..10), its door at (6.55, 10), 1.66 wide, the doorway to the store at (6.55, 3.5); the terrace z 12..17.4; the landing
deck x −7..1, z 17.4..24.5 at y ≈ 0 (the island edge is z = 18), boarded at its front (−3, 24.5). Placed on a shared island
(`{pad:false}`) it builds no pad; alone it builds its own (`hnRLTavPad`, a superellipse so the corners are on reed).
Budget class `small` (≤ 60 k; about 55 k alone with its pad and four boats).

A builder is `function buildRL<Thing>(G,o){reseed(N+(o.v|0)); …}` in the local frame (origin at the plot centre on
the island top, **+z the front / landing side**), calls `vnReg(name,lx,lz,r,h)`, and opens with
`const rf=hnRLPad(W,D,o,seed)` — the pad outline (null when `o.pad===false`), used to moor boats at the edge.

## Palette

`RPAL`: `straw strawOld strawGrey island reedGreen mud pole rope` (pick lists) · `water`. `RAND` (CSS colours for
the woven maps): `red ochre black white indigo green plum`. Tint with `hC(hex)`.

## Kit items (prefix `hRL`) — plus every `v*` and `h*` item of the vendored sets

Bundles: `hRLBundle` (base at y=0) `hRLBundleC` (centred, for `beam()`) `hRLBundleX` (along x) `hRLSheaf`.
Matting: `hRLMatB hRLMatP hRLGableM hRLRoll hRLMatCyl`. `hRLLattice` (alpha plane) `hRLFringe` (alpha) `hRLReed`
(crossed cards, living reeds) `hRLNet`. Thatch: `hRLThatchB hRLGableT hRLHipT hRLPyrT hRLConeT`. Woven:
`hRLBandCyl hRLBandP hRLCloth hRLChakana (alpha) hRLConeP hRLShield hRLHead` (colour-carrying, never tinted).
Misc: `hRLDisc hRLHorn hRLFlame hRLLeafB hRLStalk hRLHide hRLHideBall hRLMud hRLWaterB`.

## Helpers (local frame)

```
hnRLMesh(G,fn(u,v)->[x,y,z,U,V],nu,nv,mat,hole)         a plain mesh with its own UVs
hnRLOutline(rx,rz,seed,amp) -> rf(a)                    an island outline (x = cos a, z = sin a)
hnRLIsland(G,x,z,rf,{depth,inner(a),seed})              the island body: layers, top, fringe (lagoon if inner)
hnRLReeds(x,z,rf,{gaps:[[a0,a1]…],spread})  hnRLReedClump(x,z,n,spread)  hnRLAnchor(x,z,rf,a)
hnRLPad(W,D,o,seed,cx,cz) -> rf|null                    a def's own pad (skipped when o.pad===false)
hnRLMudhif(G,{x,z,L,S,H,cols,rib,col,door,back:'lattice'|'mat',hl,c,skinC}) -> {y(t),hl}   the reed arch house, door on +z
hnRLHut(x,z,W,D,H,ry,{pitch,over,door,doorX,c,th})      thatch hut, ridge along x, door on +z
hnRLConeHut(x,z,R,H,ry,{tiers})                         tiered cone hut
hnRLBoat(G,x,z,ry,L,W,{heads:0|1|2,cabin,folk,rise,paddle}) -> deck y   axis along z, bow at +z, floats at RL.WATER
hnRLRaft(x,z,ry,L,W) -> deck y   hnRLPontoon([x,z],[x,z],w)   hnRLMoor(G,x,z,ry,{boat,L,W,off,folk})
hnRLPost(x,y,z,r,h,ry,{disc,pennant})                   banded bundle post (the door and gate posts)
hnRLCloth(x,y,z,ry,w,h)  hnRLBandOn(x,y,z,ry,w,h)  hnRLFinial(x,y,z,ry,s)  hnRLEaveFringe(a,b,y,ry,c)
hnRLHearth(x,z,r)  hnRLBrazier(x,z,s)  hnRLCage(x,y,z)  hnRLGourd(x,y,z)
hnRLSheaves(x,z,ry,n,{stook})  hnRLReedLay(x,z,ry,w,d)  hnRLRolls(x,z,ry,n)  hnRLNet(a,b,h)  hnRLFishRail(a,b,y,n)  hnRLTrap(x,y,z,ry,L)
hnRLBeast(x,y,z,ry,'buffalo'|'goat'|'duck')  hnRLFolk(x,y,z,n,spread)  hnRLFence(x,z,w,d,ry,gate,h)
```

From the vendored sets: `vB vPst vBall vQ loc vnReg vnDoor vnWin vnGableRoof vnShedRoof vnHipRoof vnThatchCone
vnStairs vnLadder vnSacks vnCrate vnFolk vnDryingRack hnBambooRail hnFirepit hnMember hnOri hRot hNorm` (see
`../highlands/API.md`). The Highlands carved vocabulary (`hnTotem hnForm hnBarge …`) is present but **unused by
rule** — the lake is another culture.

## Rules for package work

* Edit only your own fragment; new helpers, textures or items go at the top of it with a package prefix.
* Seeds only from your block; each builder `reseed(<block>+k*10+(o.v|0))`.
* Budget: ≤ 60 k triangles per ordinary building; the village is `mega` (≤ 700 k).
