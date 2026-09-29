# Xanadu — generator API (the contract)

The Xanadu kit is built on the Krator Ancients kit's fragment contract, exactly like `../highlands/` and
`../iziz/`: `src/` fragments are concatenated by `build.py` in filename order into one `<script>`, so **every
top-level name is a global shared by every fragment**. `build.py` fails the build on a duplicate or over-generic
top-level name, on a `build*()` that does not open with `reseed(N)`, and on a generative fragment with no reseed.
Units are metres, `x` east, `z` south, `y` up; a person is 1.75 m; a storey is ~3 m.

## Loop

```
python build.py                                   # dist/xanadu.html
PW_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  python verify.py dist/xanadu.html --assert --views "Sacred,Manor — eye level" --out shots
python verify.py dist/xanadu.html --eval "()=>window._api.tagAudit()"
python jscheck.py .syntax-xanadu.js               # parse check when node is missing
python build.py --vendor-check                    # vendored fragments still identical to ../highlands/src?
```

`verify.py` (the Ancients harness; `PW_CHROME` points it at an installed Chromium when playwright's own is
missing) serves the file, loads it in headless Chromium (SwiftShader), prints the error panel, runs the invariants
against `window._api`, clicks the named preset views and screenshots them. **Look at the shots**, at eye level.
Views are generated (`xaAutoViews` in `90-scene.js`): `Opening`, `Overview`, one per family row, and one per
building `<name> — eye level`.

## Fragments

| file | what |
|---|---|
| `00-head.html` `99-tail.html` | page shell |
| `10…69` | **vendored** from `../highlands/src` (the Ancients core, PRNG, kit instancing, surfaces, materials) — do not edit |
| `69b-vern-mat.js` `69c-vern-helpers.js` | **vendored** — the Iziz Vernacular materials, `VERN` registry and blocks (`vB vPst vnWin vnDoor vnGableRoof …`, see `../iziz/API.md`) |
| `70-xa-tex.js` | textures: earth, whitewash, tiles, twig band, rubble, rock, meadow, jali, valance; the colour-carrying mosaics, frieze band, sun roundel |
| `71-xa-mat.js` | `XPAL` palette, materials, geometries (Persian dome, bulb, drums, pointed arch, bracket arm, four batters, the curtain-wall wedge) and kit items (prefix `x`) |
| `72-xa-helpers.js` | `XA` registry, `xnSub`, vector helpers, the whole vocabulary (walls, roofs, windows, cumba, jharokha, arches, iwans, domes, gilt roofs, pennants, shrines, footings, terraces, gardens, water) |
| `74…82` | the builders (DESIGN.md says who owns which) |
| `90-scene.js` | showcase scene: rows by family (`xaLayout`), `xaAutoViews` |
| `91-probe.js` `92-camera.js` `93-labels.js` | vendored |
| `targets/xanadu/89z-rows.js` | `TITLE`, `XA_EXTRA`, `SITES=[]` |
| `targets/xanadu/91z-views.js` | `const VIEWS=xaAutoViews()` |

## Registry

```js
XA.def({key, name, family, tags:{type:[…], wealth, lit}, w, d, h, fw, fd, build})
VERN.place(scene, key, x, z, ry, o)     // o = {v: variant, lit, scale, y, drop (slope footing depth)}
xnSub(key, lx, ly, lz, lry, o)          // place another def INSIDE the running builder (compounds, the hillside)
XA.keys() · XA.families()
```

Keys: `xa_*`. `family` is the showcase row (rows appear in definition order). `w,d,h` must be honest — the
showcase spaces sites by `w` and rows by `d`; `fw,fd` is the footing footprint for slope siting (default 92% of
`w,d` — give the house's own footprint when `w,d` include a yard). A builder is a **named**
`function buildXa<Thing>(G,o){reseed(N+(o.v|0)); …}` that builds in the local frame (origin at the plot centre on
the ground, **+z is the front**) and calls `vnReg(name, lx, lz, r, h)` for its inspector volume(s).

## Palette — `XPAL` (sRGB hex; tint with `xC(hex)` = `vC`)

`wash earth ochre redwall maroon stone rubble timber aged dark gold tile cloth leaf cypress` (pick-lists, use
`xPick`) · `trim` (painted frames) · singles `turquoise lapis white black blue red saffron green water`.
Colour-carrying maps (mosaics, frieze, sun) are never tinted.

## Kit items (prefix `x`) — plus every `v*` item of the vernacular set

Boxes: `xEarthB xWashB xTilesB xBandB xRubB xRockB xPaint xGoldB xMosAB xMosBB xFriezeB xWaterB`. Planes (face +z):
`xMosA xMosB xJali xValance xPaintPl xSun`. Balls: `xGold xPaintBall xLeaf xBoulder`; cones `xConeG/T/W/P/L`.
Domes (base r 1, tip y 1; scale `[r,h,r]`): `xDomeW/T/G/S/M`; bulbs `xBulbT/G/W`. Drums (base y 0): `xDrumW/T/S/M/E`
(16-sided), `xOctW/T/S/P` (8); discs (centred) `xDisc xDiscG xDiscS xDiscWater`; columns `xCol xColS xColG xColW`.
Pointed-arch slab (w 1 × h 1 × d 1, opening 70%): `xArchW/S/M/E/P`; solid arch profile `xArcS/W/M/P/Dark`.
Bracket arm `xArm xArmW xArmS xArmG`. Battered blocks (top k of the base): `xBatW/E/S/D + 96|92|86|80`; curtain
wedge (batter across thickness only) `xWallD/S/W/E`. Roof wedges `xHipG xPyrG xHipT xPyrT xGableT xHipE xGableE`.

## Helpers (local frame; `(x,z,ry)` = a face frame whose +z is `ry`'s outward direction)

```
xRot xAdd xNorm xCross xnOri xnMember xnOn                vectors, oriented members
xnBracket(x,y,z,ry,proj,h,thick,c,item,up)                 console (rounded edge outer-bottom) or horn (up=true)
xnCornerYaw(ry,sx,sz)                                      yaw for a horn at a plot corner
xnWall(x,y,z,w,h,d,ry,c,kind) -> k                         battered block; kind wash|earth|stone|dressed
xnStack(x,y,z,w,d,ry,[h…],c,kind,lineC) -> {y,w,d}         storeys with the batter carried through
xnBand(x,y,z,w,d,ry,h,c,{gold})                            the maroon twig band
xnParapet · xnFlatRoof(x,y,z,w,d,ry,c,{band,gold,eave,eaveC,parapet,corner}) -> top
xnCorbels(x,y,z,ry,w,n,c,s) · xnEave(x,y,z,w,d,ry,c,out)
xnTibWin(x,y,z,ry,w,h,kind,frameC,{valC,shutters,noVal})   the trapezoid window
xnCol(x,y,z,h,r,ry,c,capC) · xnPortico(x,y,z,ry,w,d,h,c,{band,valC,colC,capC})
xnCumba(x,y,z,ry,w,h,d,{item,c,beamC,winC,kind,n,valC})    the Turkish overhang
xnJharokha(x,y,z,ry,w,h,c,{d,jaliC,dome:'T'|'G'|'W'|false}) the Indian oriel
xnArch(item,x,y,z,ry,w,h,dep,c,{open}) · xnArcade(x,y,z,ry,w,h,n,item,c,dep,{open})
xnIwan(x,y,z,ry,w,h,d,c,{mosaic,guldasta})
xnDome(x,y,z,r,kind,{drum,drumItem,drumC,c,win,fin}) -> tip · xnChhatri(x,y,z,r,h,c,domeC,n)
xnGiltRoof(x,y,z,w,d,ry,{frame,rise,over}) -> ridge · xnPavilion(x,y,z,w,d,h,ry,{c,tileC,over,gilt,rise})
xnPennants(a,b,n,cols) · xnFlagpole(x,y,z,h,c) · xnRoundel(x,y,z,ry,dia) · xnShrine(x,y,z,s,c) · xnMural(item,x,y,z,ry,w,h)
xnFlight(x,y,z,ry,w,rise,item,c) -> run                    solid stone stair rising toward -z of ry
xnCrenel(x,y,z,w,d,ry,h,c,{item,pointed})
xnFooting(x,z,w,d,ry,drop,c) · xnTerrace(x,y,z,w,d,ry,h,c,topC)
xnTree(x,z,h,c,y) · xnCypress(x,z,h,y) · xnFolk(x,y,z,n,spread) · xnYak(x,z,ry,y) · xnFodder
xnPool(x,y,z,w,d,ry,c) · xnChannel(a,b,w,c,y) · xnFountain(x,y,z,r,c) · xnCharBagh(x,y,z,w,d,ry,{channel,r,fountain}) · xnPave(x,z,w,d,ry,c,cell)
```

Package-local helpers keep a package prefix: `xnXB*` (trade), `xnXC*` (farms), `xnXD*` (sacred: `xnXDDrums`,
`xnXDSanctum` — reused by the fortress keep), `xnXE*` (palace: `xnXETower`, `xnXECurtain` — reused by the wall and
gate), `xnXF*` (guilds: `xnXFHall`, `xnXFDoor`), `xnXG*` (military), `xnXH*` (public: `xnXHOct`).

From the vernacular set (`../iziz/API.md`): `vB vBq vPst vPl vBall vBeam loc vQ vLit vnReg vnFrame vnStilts
vnPlinth vnCornice vnStrip vnPatch vnGableRoof vnShedRoof vnHipRoof vnPyrRoof vnThatchCone vnWin vnDoor vnLamp
vnLampPost vnVeranda vnStairs vnLadder vnBarrel vnWaterButt vnCrate vnSacks vnPlanter vnDryingRack vnAwning
vnBannerPole vnChimney vnFence vnPalisade vnFolk vnPaving`.

## Rules for package work

* Edit only your own fragment file (DESIGN.md table). Do **not** edit `70–72`, the vendored files, `90–93` or the
  targets. New helpers, textures, materials or kit items go at the top of YOUR fragment with a package prefix
  (`xnXA*` …; kit items `xXA*`). If a shared helper is wrong, copy it under your prefix, fix the copy, and say so.
* Seeds only from your block; each builder `reseed(<block>+k*10+1+(o.v|0))`.
* Budget: ≤ 60 k triangles per ordinary building, ≤ 250 k for the largest (Grand Temple, palace, fortress, Pleasure
  Dome); draw calls stay low automatically (everything is instanced).

## 83-xa-turk.js — the Turkish note
* `xnXTRoof(x,y,z,w,d,ry,c,over,rise)` — red-tiled hip on wide eaves with rafter ends and a ridge cap.
* `xnXTArchWin(x,y,z,ry,w,h,c,kind,lit)` — round-arched window in a surround of `kind` (`vStone`/`vWood`/`xPaint`).
* `xnXTBay(x,y,z,ry,w,h,d,c,winC,tileItem)` — timber bay with arched windows and tile-panel aprons.
* `xnXTBalcony(x,y,z,ry,w,d,c)` — iron balcony on brackets with a flower box.
* `xnXTBigWheel(x,z,ry,stone,gold,maroon)` — a great prayer wheel under a tiled kiosk.
* `xnBasketLights(a,b,n,cols)` / `xnUmbrellaLights(a,b,n,cols)` — a sagging wire from local `a` to `b` carrying `n`
  wicker basket lanterns (a bulb in each) or open umbrellas; meant to be strung between buildings.
* Defs: `xa_temple_ortakoy`, `xa_house_turk_a` (Konak), `xa_house_turk_b`, `xa_shop_turk_a`, `xa_shop_turk_b`,
  `xa_lane` (carries `eye` for its own eye-level stance).

## 84-xa-grandbath.js — the Grand Baths
* Items: `xGlass` (stained-glass plane, unlit), `xBTileB` (lobed bath tile box), `xEmeraldB/Disc/Oct` (emerald water).
* `xnXKPier(x,z,w,h,c,strip)` — tall pier with mosaic strips; `xnXKGlassArch(x,y,z,ry,w,h,c)` — stained-glass
  screen in a pointed arch over an open walk; `xnXKLake(pts,y,c)` — a lobed pool from `[x,z,r]` discs.
* Def: `xa_grand_bath` (Public, civic, lit, nv 3). Def fields `eye:[dx,dz,tdx,tdz]` (its eye-level stance) and
  `eyes:[[name,dx,dz,tdx,tdz],…]` (further named stances) feed `xaAutoViews`.
* `xnIwanOpen(x,y,z,ry,w,h,d,c,{through,item,lamps,guldasta})` (72-xa-helpers) — a hollow vaulted portal.

## 85-xa-water.js — the water modules
* `xnRill(x,y,z,ry,L,{w,c,curb,cap:'pool'|'fountain'})` — a rill segment L long on the local z axis;
  `xnRillCross(x,y,z,S,o)`.
* Defs on an 8 m plot (`snap:8`), rill on the centre line to the plot edge: `xa_rill`, `xa_rill_bend` (from +z to
  +x), `xa_rill_cross`, `xa_rill_pool`, `xa_rill_fountain`; `xa_rill_garden` tiles nine of them.
* Slope pieces (row "Water — slopes", `rise` on the def): `xa_rill_step` 1.5, `xa_rill_ramp` 1.5, `xa_rill_cascade` 3,
  `xa_rill_fall` 4; `xa_rill_hill` tiles them down a terraced hill. `xnRillBasin(x,y,z,w,d,ry,curb,c)`,
  `xnWaterSheet(x,y,z,ry,w,h)`.

## 86-xa-vizier.js — the Grand Vizier's palace
* `xnXMLoggia(x,y,z,ry,w,h,n,dep,D,upper,lit)` — one loggia storey (open arcade on columns before a set-back wall);
  `xnXMPalm(x,z,h,y)`; `xnXMBed(x,z,w,d,ry,y)` (marigolds). Def `xa_vizier` (The Sultan, civic, lit, nv 3), dresses
  `XVZ[v]`.
