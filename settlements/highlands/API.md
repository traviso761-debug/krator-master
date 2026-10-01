# Highlands — generator API (the contract)

The Highlands kit is built on the Krator Ancients kit's fragment contract, exactly like `../iziz/`: `src/`
fragments are concatenated by `build.py` in filename order into one `<script>`, so **every top-level name is a
global shared by every fragment**. `build.py` fails the build on a duplicate or over-generic top-level name,
on a `build*()` that does not open with `reseed(N)`, and on a generative fragment with no reseed. Units are
metres, `x` east, `z` south, `y` up; a person is 1.75 m; a storey is ~3 m.

## Loop

```
python build.py                                   # every target
python build.py --target highlands                # one target: highlands | roketstad
python verify.py dist/highlands.html --assert --views "Republican — Dwellings,Peles villa — eye level" --out shots
python verify.py dist/highlands.html --eval "()=>window._api.tagAudit()"
python build.py --vendor-check                    # vendored fragments still identical upstream?
```

`verify.py` (the Ancients harness, unchanged) serves the file, loads it in headless Chromium (SwiftShader,
~25–40 s per run), prints the error panel, runs the invariants against `window._api`, clicks the named preset
views and screenshots them. **Look at the shots**, at eye level — that is where proportion errors live.
Views are generated (`hlAutoViews` in `90-scene.js`): `Overview`, `<Branch> — overview`, one per row
`<Branch> — <family>`, and one per building `<name> — eye level` (the def's `name`).

## Fragments

| file | what |
|---|---|
| `00-head.html` `99-tail.html` | page shell |
| `10…69` | **vendored** from `../ancients/src` (core, PRNG, kit instancing, surfaces, materials) — do not edit |
| `69b-vern-mat.js` `69c-vern-helpers.js` | **vendored** from `../iziz/src` — the Iziz Vernacular materials, `VERN` registry and building blocks (`vB vPst vnWin vnDoor vnGableRoof …`, see `../iziz/API.md`) |
| `70-hl-tex.js` | Highlands textures: logs, fish-scale, rubble, rock, turf, bamboo, mat; the **formline** drawing kit and the crest, totem, wing, lace, clock maps |
| `71-hl-mat.js` | `HPAL` palette, materials, geometries (onion, bulb, tent, octagon, keel, log, pole, arm) and kit items (prefix `h`) |
| `72-hl-helpers.js` | `HL` registry, `hnSub`, vector helpers, walls (log, socle, stucco+quoins, half-timber, jetty), roofs (gable, tent, onion, kokoshnik, bochka, pagoda tier) |
| `73-hl-carve.js` | the carved vocabulary: totems, formline boards, friezes, dougong, bargeboards/horns/dragons/birds, nalichniki, kryltso porch, balconies, towers, bamboo, cliff walkways + cliff face, yard furniture |
| `74…79` | Republican builders · `80…83` Rustic · `84…88` Tribal (see DESIGN.md for who owns which) |
| `90-scene.js` | showcase scene: rows by branch/family (`hlLayout`), `hlAutoViews` |
| `91-probe.js` `93-labels.js` | vendored from `../iziz/src` |
| `92-camera.js` | inspector, polygon tool, walk mode (F) |
| `targets/<t>/89z-rows.js` | `TITLE`, `HL_BRANCHES`, `HL_EXTRA`, `SITES=[]` |
| `targets/<t>/91z-views.js` | `const VIEWS=hlAutoViews()` |

## Registry

```js
HL.def({key, name, branch:'republican'|'rustic'|'tribal', family, tags:{type:[…], wealth, lit}, w, d, h, build})
VERN.place(scene, key, x, z, ry, o)     // o = {v: variant, lit, scale, y, cliff (tribal)}
hnSub(key, lx, ly, lz, lry, o)          // place another def INSIDE the running builder (compounds, farms, cliff villages)
HL.keys(branch) · HL.families(branch)
```

Keys: `hl_rep_*`, `hl_rus_*`, `hl_tri_*`. `family` is the showcase row (keep to the family names in DESIGN
or the ones your package introduces; rows appear in definition order). `w,d,h` must be honest — the showcase
spaces sites by `w` and rows by `d`. A builder is a **named** `function buildHl<Branch><Thing>(G,o){reseed(N+(o.v|0)); …}`
that builds in the local frame (origin at the plot centre on the ground, **+z is the front/door side**) and
calls `vnReg(name, lx, lz, r, h)` for its inspector volume(s).

## Palette — `HPAL` (sRGB hex; tint with `hC(hex)` = `vC`)

`pine aged tar redwood falu` (wood) · `stucco saxon ashlar rubble` (masonry) · `slate roofGreen roofRed shingle`
(roofs) · `bamboo turf gold` · `trim` (painted trim pick-list) and singles `teal red white black blue green ochre`.
`vPick(arr)` picks one (uses the PRNG). Colour-carrying maps (formline, totem, wing, clock) are never tinted.

## Kit items (prefix `h`) — plus every `v*` item of the vernacular set

Boxes: `hLogB hScaleB hRubB hTurfB hBMatB hPaint hGoldB hFormF`. Planes (face +z): `hFormA` (salmon pair, cedar) `hFormW` (orca, white)
`hFormT` (thunderbird) `hFormB` (bear) `hFormV` (abstract tall board) `hLaceV hLaceB hWing hClock`. Cylinders (base at y=0): `hTotem hTotemP` (16-sided, crest front at u=.5 — use
`hnTotem`), `hBamboo`; centred: `hBambooC` (for `beam()`: w = diameter). Horizontal log along x: `hLogEnd`
(end grain) `hLogX` (bark). Lathes (base radius 1 at y=0, tip at y=1, scale `[r,h,r]`): `hOnionG/Sc/Sh`,
`hBulbG/Sc/Sh`. Octagonal: `hTentSc/Sh/T` (cone), `hOctP/L/W/S/Sh` (drum). Keel prism (x −.5….5, y 0…1, z
centred, profile in xy): `hKeelSc/W/P/Sh/G/Dark`. Wedges: `hGableSc/Turf/Log/BM/Rub/Paint` (gable), `hPyrSc`,
`hHipSc/Turf/Sh`, `hBatterRub`. Bracket arm: `hArm hArmW`. Cones: `hConeG/Sc/Sh`. Balls: `hGold hPaintBall`.

## Helpers (local frame; `(x,z,ry)` = a sub-frame whose +z is `ry`'s outward direction)

```
hRot(ry,v) hAdd(a,b,k) hNorm hCross           vectors in the local frame
hnOri(item,P,X,Z,s,c)                         item with its local x along X and its face (+z) toward Z
hnMember(item,a,b,w,t,N,c)                    a member a→b, section w×t, lying flat on a surface of normal N
hnOn(x,y,z,ry,u,o) -> [x,y,z]                 point on a face frame (u along the face, o out)
hnLogBox(x,y,z,w,h,d,ry,c,ext)                log walls + saddle-notch corner ends
hnSocle(x,y,z,w,h,d,ry,c,capC)                fieldstone base + dressed cap
hnStucco(x,y,z,w,h,d,ry,c,qC)                 rendered block with ashlar quoins (qC=false: none)
hnFachFace(x,y,z,ry,w,h,c,wins,kind,winC)     half-timber on one face; wins = bay indices or -1 (auto)
hnFachBox(x,y,z,w,h,d,ry,wallC,beamC,kind)    half-timbered storey on four faces
hnJetty(x,y,z,w,d,ry,c,out)                   joist ends + oversailing floor
hnGable(x,y,z,w,d,pitch,ry,slab,slabC,over,end,endC) -> ridge y   ridge along local x of ry; pitch = rise/(d/2)
hnTent(x,y,z,r,h,item,c) -> top               hnOnion(x,y,z,r,kind,c,drumH,drumItem,drumC) -> top
hnKokoshnik(x,y,z,ry,w,h,item,c,recess)       hnBochka(x,y,z,w,d,h,ry,item,c) (ridge along x)
hnTier(x,y,z,w,d,rise,ry,item,c,over,hornC)   flared pagoda tier (hip + upturned corner horns)
hnTotem(x,y,z,r,h,ry,{wings,wingAt,painted,hat})   hnTotemPost(x,y,z,r,h,ry,painted)
hnForm(item,x,y,z,ry,w,h)  hnFrieze(x,y,z,ry,w,h)
hnDougong(x,y,z,ry,s,armC,blockC)  hnBracketRow(x,y,z,ry,w,n,s,armC,blockC)
hnBarge(x,y,z,w,d,rise,ry,over,c,style,endOver)    style 'lace' | 'horns' | 'dragon' | 'bird' — call with the SAME x,y,z,w,d,ry,over as the gable
hnNal(x,y,z,ry,w,h,kind,trimC,{keel,shutters,accent})   nalichnik window
hnKryltso(x,y,z,ry,w,rise,roofItem,roofC,postC)    Russian porch: stair up (toward -z of ry) under a bochka
hnBalcony(x,y,z,ry,w,d,c,railC,flowers)            Alpine balcony (deck at y, projecting d toward ry)
hnDeckRail(a,b,y,c,railH)
hnTower(x,y,z,w,h,ry,{shaft:'stucco'|'rubble'|'logs'|'oct', roof:'spire'|'tent'|'onion'|'helm'|'pyr', loggia, clock, c, roofC, trimC, beamC, qC, lit, onion, onionC}) -> tip y
hnBambooBox(x,y,z,w,h,d,ry,c,matC)  hnBambooRail(a,b,c,h)
hnCliffWalk(pts,w,back,c,railC)                  walkway/stairs along local points, cliff toward `back`
hnCliffFace(G,x0,x1,zc,y0,y1,seed)               a rock face mesh (showcase only — a settlement uses terrain)
hnStoneChimney(x,y,z,h,w)   and the furniture helpers (see Furniture): hnWoodpile hnFirepit hnMenhir hnTotemPole …
```

From the vernacular set (`../iziz/API.md`): `vB vBq vPst vPl vBall vBeam loc vQ vLit vnReg vnFrame vnStilts
vnPlinth vnCornice vnStrip vnPatch vnGableRoof vnShedRoof vnHipRoof vnPyrRoof vnThatchCone vnWin vnDoor vnLamp
vnLampPost vnVeranda vnStairs vnLadder vnBarrel vnWaterButt vnCrate vnSacks vnPlanter vnDryingRack vnAwning
vnBannerPole vnChimney vnFence vnPalisade vnFolk vnPaving`. Note `vnGableRoof` ridges run along local x; to put a
gable end to the street (+z), pass `ry=Math.PI/2` and swap w/d (see `buildHlRepPoorA`).

## Furniture (placed from the catalog, not drawn)

Everything a builder puts in or around a building that is not its structure (walls, floors, roofs, stairs, doors,
windows, chimneys, porches, decks, galleries, columns, fences, palisades, built-in masonry, facade signs and
banners) or an outbuilding is FURNITURE: a master-catalog piece (`kits/catalog`), placed as data and built by the
catalog's own code. The build bundles the catalog (`69d-furniture-bundle.js`, generated by `build.py`: cultures
`FURN_CULTURES`) and the interiors kit with the Highlands set; `89y-hl-furnish.js` is the glue.

```
FURNISH(key, lx, ly, lz, lry, {v, seed, setting})   -> the placement record, or null
```

* Called INSIDE a builder (or anything it calls), in the builder's local frame like `vB`: `(lx, ly, lz)` is the
  piece's origin (the centre of its footprint, on its floor), `lry` its turn; a piece's +z is its front. A key the
  catalog does not have is COUNTED in `HLF.missing[key]`, not thrown, and nothing is placed.
* The record `{key, variant, seed, lx, ly, lz, lry, x, y, z, ry, building, setting}` goes on the building's group
  (`G.userData.furniture`) and on `HLF.placed`. The pieces are batched (`HLF.batch`, detail 0.5) and flushed into
  the scene once, at `kbake`.
* The piece's box is added to the builder's instance record, so murals fitted after the build (`hlFlush`) keep
  clear of it as they kept clear of the drawn furniture.
* A builder's pieces are built at full detail (at half, a disc drawn as a rod, a shield or a target face, is a
  4-sided diamond); the interiors' pieces at half. The catalog's colours are sRGB values: the furniture meshes
  linearise them in the vertex shader (`hlfSRGB`), as `hC()` does for the kit's own colours. Being flat colours,
  the pieces still read a little lighter than the kit's textured wood and stone.
* `?furniture=0` places nothing (the records are still kept). `?interiors=1` plans and furnishes the rooms of
  every top-level building that has an item in `kits/interiors/sets/highlands.js` without `skip`
  (`G.userData.interior`, `HLF.buildings`). Indoor furniture is the interiors' job: builders draw none.
* Helpers that used to draw furniture keep their names and arguments and place the catalog piece nearest the
  size asked for: `hnWoodpile hnFirepit hnMenhir hnTotem` (tribal and rustic; the Republic's still draws its
  carved column) `hnTotemPole` (a free-standing carved post; `hnTotemPost` stays the structural one)
  `hnTRBrazier hnTRHorns hnTRGourd hnTRCage hnRUShield hnRUStall hnRUTrough hnRUBench hnRUCart hnRUHesje`, and
  `hnBarrel hnWaterButt hnCrate hnSacks hnDryingRack` (the vendored `vn*` yard kit, placed). `hnFurn(key, x, y,
  z, ry, o, dx, dz)` places a piece whose origin is `(dx, dz)` from `(x, z)` in the frame turned by `ry` (a
  totem's pole, a cart's bed).
* SEEDS: a helper or builder that stops drawing burns the random numbers the drawing drew (`hlRngSkip(n)`), so
  the structure built after it is unchanged.

## Rules for package work

* Edit only your own fragment files (DESIGN.md table). Do **not** edit `70–73`, the vendored files, `90–93`
  or the targets. New helpers, textures, materials or kit items go at the top of YOUR fragment with a package
  prefix (`hnRA*`, `hnRB*`, `hnRC*`, `hnRU*`, `hnTR*`; kit items `hRA*` …). If a shared helper is wrong, copy
  it under your prefix, fix the copy, and say so in your report.
* Seeds only from your block; each builder `reseed(<block>+k*10+(o.v|0))`.
* Budget: ≤ 60 k triangles per ordinary building, ≤ 250 k for the largest (Hall of the Republic, fortress,
  cliff settlement); draw calls stay low automatically (everything is instanced).
