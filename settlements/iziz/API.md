# Iziz — generator API (the contract)

Iziz is built on the Krator Ancients kit's fragment contract: `src/` fragments
are concatenated by `build.py` in filename order into one `<script>`, so
**every top-level name is a global shared by every fragment**. `build.py` fails
the build on a duplicate or over-generic top-level name, on a `build*()` that
does not open with `reseed(N)`, and on a generative fragment with no reseed.
Units are metres, `x` east, `z` south, `y` up; a person is 1.75 m. Ground is
`terrainH(x,z)` (flat `0` in the showcase; the city pass replaces the function).

## Loop

```
python build.py                                   # src/ + targets/vernacular -> dist/iziz-vernacular.html
python jscheck.py .syntax-vernacular.js           # parse check when node is missing (Travis's machine)
python verify.py dist/iziz-vernacular.html --assert --views "Overview,Middle — eye level" --out shots
python verify.py dist/iziz-vernacular.html --cam "36,6,222,32,0.5,215" --cam-name heap
python verify.py dist/iziz-vernacular.html --eval "()=>window._api.tagAudit()"
```

`verify.py` is the Ancients harness unchanged: it serves the file, loads it in
headless Chromium, prints the error panel, runs the invariants against
`window._api`, clicks the hidden view buttons and screenshots. **Look at the
shots**, at eye level (`… — eye level` presets) — that is where proportion and
placement errors live, and no invariant sees them.

## Vendored fragments

`10-core 12-stats 20-textures 22-materials 30-kit 32-surfaces 34-kitdefs
36-decor 38-helpers2 50-registry 54-mat-concrete 68-mat-v5 69-mat-salvage` are
byte-identical copies of `../ancients/src/`. `VENDOR.json` records their sha1s;
`python build.py --vendor-check` compares them with the Ancients repo when it is
beside this one. Do not edit them here — fix upstream and re-vendor. They give
Iziz the PRNG (`reseed rng rr`), noise (`fbm`), the instancing kit
(`kdef kput kbake KOFF KXF qFacing qEuler`), surfaces (`gridSurface lathe mesh
meshMerged`), the Ancients materials/textures (`MAT.white/.rust/.corrugate/
.timber/.tarp/.verdigris/.concrete/.brick/.glass/.dark`), decoration helpers
(`stripRing rubbleRing figures beam …`) and the registry (`REG REGISTER
useGroupXF endGroupXF`).

## The Vernacular set

### Registry — `69c-vern-helpers.js`

```js
VERN.def({key, name, family, tags:{type:[...], wealth, lit}, w, d, h, build})
VERN.place(scene, key, x, z, ry, o)   // -> THREE.Group; o = {v: variant, lit: override, scale: uniform scale (default 1), y: base height}
VERN.defs[key] · VERN.order · VERN.cur (the def/group/options being built; VERN.cur.r0 = REG.length at entry)
vnReg(name, lx, lz, r, h, extraTags)  // inspector volume, LOCAL frame; carries cls + tags; honours o.scale
vnAdoptREG(r0, nameFn, tags)          // for builders that WRAP an Ancients-kit builder: move the REG entries the kit
                                      // builder pushed (from index r0 = VERN.cur.r0) into the world frame + tag them
```

`build(G,o)` is a **named** `function buildVern*(G,o){reseed(N+(o.v|0)); …}`
(build.py's rules see it). It builds in the local frame: origin at the plot
centre on the ground, **+z is the front**, and never touches world coordinates —
`VERN.place` positions and yaws the group and sets the kit transform
(`useGroupXF`), so `kput` and `mesh(…,G,…)` both land correctly. Tags follow the
project rule: `culture:'iziz-vernacular'` is added for you; give `type` (one or
more of the project's building types), `wealth` (`poor|middle|rich|civic`) and
`lit` (**true only for rich and civic** — the electric-light canon). `vLit()`
inside a builder answers that flag (or `o.lit`), and `vnDoor`/`vnLamp`/
`vnLampPost` only emit bulbs when it is true.

Seed blocks: dwellings 7100–7399, trade 7400–7499, civic 7500–7599, infra
7600–7699, guilds 7701–7739, frontier 8001–8079 (`74b-vern-frontier.js`). Take the next free `xx1` and leave room for variants (`+o.v`).

### The frontier set — `74b-vern-frontier.js` (Verge's upper city)

`vern_governor_palace` (the Governor's House, renamed from "Governor's Palace" 2026-10-18 so it is not taken for the vassal kits' palaces; the key is kept; 42 x 36, walled forecourt, gate on +z), `vern_guard_tower` (26 x 20: three-storey tower at
-x, two-storey barracks at +x, doors on +z), `vern_watch_house` (10 x 9), `vern_toll_house` (14 x 10: the toll window
and counter face **+x**, the road side; the raised toll bar stands at the +x/+z corner), `vern_palisade` (ONE segment,
`o.len` metres along local x, default 6; every part inside x = ±len/2; +z is the outer face, the braces lean to -z),
`vern_palisade_gate` (14 x 4, a 9 m road opening along z between log towers whose outer faces are at x = ±6.9: butt
the palisade segments at x = ±7), `vern_mustering_ground` (44 x 32, the wall's gap on +z), `vern_rest_stop` (18 x 12;
`o.v=0` cut into the rock: the cliff is the plot's -z third, the trail runs along x on +z; `o.v=1` built out on the
cliff: +z is the drop, the retaining wall goes 5.4 m below y = 0, the trail runs along x on -z). Helpers are `vf*`.
Verge bundles this fragment with 69b-74, so it uses only their globals (and 74's `vg*` helpers).

### Kit items — `69b-vern-mat.js` (prefix `v`)

Boxes: `vWood vStone vPlaster vCorr vIron vThatchB vShingleB vCopperB vPanelB
vRustB vClothB vTarpB vClayB vDarkB(void) vWinLit vWinGlass vFlag`.
Planes: `vSheet vBoard vPlate vPlateW vTarp vCloth`. Cylinders (base at y=0):
`vPost vPostB vPostS vPipe vPipeR vPipeC vClayPot vBarrel vTank vTankW vTankR
vStave vRope`. Roof wedges (base 1×1 at y=0, apex at y=1): gable `vGable{S,T,C,
Cu,P,W,St,Pl}`, pyramid `vPyr{S,Cu,T,Sh,C}`, hip `vHip{S,T,Cu,C}`, battered block
`vBatter{S,P,W}`. Domes `vDomeS vDomeC vDomeP`, cones `vConeT vConeC vConeI`,
balls `vBall(iron) vRock vFinial(copper) vBallW vGourd vSack vLeaf vBulb vEmber`,
`vHoop` (torus). Suffix key: S stone · T thatch · C corrugate · Cu copper · P
ghost panel · Pl plaster · W wood · Sh shingle · St stone(gable).

Materials are painted near-grey and tinted per instance with `vC(hex[,k])`
(sRGB → linear, once). Palette in `VPAL` (`sand orange adobe woodPoor woodMid
woodRich awning trim thatch stone stoneDark`), `vPick(arr)`. **Orange leads** (Travis, round 2): `VPAL.awning`
is weighted to Iziz orange, and `VPAL.trim` is painted-timber orange for fascias, shutters and doors — use it on
middle and rich buildings so the vernacular reads as Iziz from the air. Every textured material
carries `vWorldUV(mat,K)`: UVs are scaled by the instance's size per face
normal, so maps tile in metres on any box (K = 1/tile-metres: wood/plaster/
thatch 2 m, stone/copper 4 m, Ancient panel 8 m). `vWorldUV` lives in `core/materials/opt/69a-world-uv.js` (shared;
this build opts in through `CORE_OPT_FILES`); since 2026-10-01 every K gets its own shader program.

### Building blocks — `69c-vern-helpers.js` (prefix `vn`, local frame, y = base)

```
vB(item,x,y,z,w,h,d,ry,c)  vBq(item,x,yc,z,w,h,d,q,c)  vPst(item,x,y,z,r,h,c,q)  vPl(item,x,yc,z,w,h,ry,c,tilt)  vBall  vBeam(a,b,w,c,item)
loc(x,z,lx,lz,ry) -> [x',z']      vQ(ry,tiltX,rollZ) -> quaternion
vnFrame(x,y,z,w,h,d,ry,c,pr)       timber frame: posts every ~2.4 m + sill/head rails
vnStilts(x,y,z,w,d,h,ry,c,pr)      posts on pad stones with braces
vnPlinth(item,x,y,z,w,h,d,ry,c)    battered plinth storey (vBatterS/P) + cap band
vnCornice(item,x,y,z,w,d,ry,c,steps,cap) -> top y     Mayan stepped cornice
vnStrip(x,y,z,ry,w,h,frameItem,c)  deco vertical strip (dark slot + fins)
vnPatch(x,y,z,ry,w,h,n)            salvage sheets nailed over a face
vnGableRoof(x,y,z,w,d,rise,ry,slabItem,slabC,over,endItem,endC,thick)   ridge along local x
vnShedRoof(x,y,z,w,d,rise,ry,item,c,over,thick)                          high at -z
vnHipRoof(item,x,y,z,w,d,rise,ry,c,over)   vnPyrRoof(...)   vnThatchCone(x,y,z,r,rise,c)
vnWin(x,y,z,ry,w,h,kind,frameItem,c,shutters)   kind: lit | glass | open | shut ; (x,z) ON the face, ry = outward
vnDoor(x,y,z,ry,w,h,frameItem,c,leafC,step)      lamp above if vLit()
vnLamp(x,y,z,ry)  vnLampPost(x,y,z,h)            electric — only call under vLit() (vnDoor does)
vnVeranda(x,y,z,w,d,ry,deckH,postH,c,railC)  vnStairs(x,y,z,ry,w,rise,steps,item,c)  vnLadder(x,y,z,ry,h,c)
vnBarrel vnWaterButt vnCrate vnSacks vnPlanter vnDryingRack vnAwning vnBannerPole vnChimney
vnFence(x,y,z,w,d,ry,c,gate,h)  vnPalisade(x,y,z,w,d,ry,h,gate)  vnPaving(x,y,z,w,d,ry,c,n)  vnFolk(x,z,n,spread)
vnStall(x,z,ry,c)  vnSign(x,y,z,ry,c)  vnCivicBlock(...)  (in 71/72)
```

Roof helpers: a **gable** = a wall-material wedge closing the ends (`endItem`)
plus two overhanging slabs + ridge cap + fascia; **hip/pyramid** are solid
wedges whose base is dropped 0.35 m so the wall top is buried. Overhangs default
to 0.8–0.9 m: this is a rain climate.

### Wrapping an Ancients-kit builder (Salvager's / Mercenary guilds, ported landmarks)

A kit builder has the signature `buildX(scene,gx,gz,d)`, sets `KOFF=[gx,0,gz]`, adds a group to `scene` at
`gx,0,gz`, calls `REGISTER` in that frame and returns the group. Inside a `VERN` builder call it as
`const r0=VERN.cur.r0; const H=buildX(G,0,0,3); vnAdoptREG(r0, n=>'Salvagers\' Guild — '+n);` — `G` is the
group `VERN.place` made (already positioned, yawed and scaled; `KXF` carries the transform, and `kput`
scales instance sizes when `o.scale` ≠ 1). Restore `KOFF=[0,0,0]` afterwards. Decay `3` is the kit's
*repaired* state (`HOLES` may be set to .55 around the call, as `90-scene.js` in the Ancients kit does).
Vendor the builder fragment byte-identical from `../ancients/src/` and add it to `VENDORED` in build.py.

### Interiors: hollow bodies and furnished rooms — `69e-vern-hollow.js`, `95i-iziz-interiors.js` (2026-10-16)

The residences, the trade buildings and (2026-10-19) the civic buildings have rooms you can see into (cutaway, X; `]` `[`
the storeys). Two parts:

* **The builder** draws every enclosed wall block with `vnBody(item,x,y,z,w,h,d,ry,c,{t, floor, floorC})` in place of
  `vB(...)`, and a full-footprint slab between storeys with `vnBand(item,x,y,z,w,h,d,ry,c,t)` (`vnCorniceBand` for a
  stepped cornice). `{k}` gives a body a batter (the chapterhouse's banco: `.07`, as `vpBanco7`): each wall piece leans in
  with the face, and an opening is found on the receding face. With `VERN.interiors` on
  and an item for the def in `kits/interiors/sets/iziz.js`, a body is four walls of thickness `t` cut where the
  builder's own `vnDoor`/`vnWin` calls on its faces open them, over a board floor; a band is a ring. Call `vnBody`
  before the doors and windows on it. A door on a hollow face is a shut leaf that opens (below, `69e5`); a window is
  glass in the middle of the wall. Once the builder returns, the item's planned storeys are drawn in the kit's items: the upper floors
  with the stair's well, the partitions and their doorways, the stairs and ladders. **With interiors off, no item, a
  `skip` item, or `o.scale` ≠ 1, `vnBody` and `vnBand` draw exactly the `vB` they replaced**: Verge (which takes 69e for
  this) and Ys build what they always did. An item of explicit `rooms` and no `bodies` (an open-fronted hall the builder
  draws as walls: the generator, the Forgemaster's hall, the Ancient interiors below) is planned without a hollow body. `69c` is untouched (five builds vendor it): 69e wraps
  `VERN.def`, `vnDoor` and `vnWin` by assignment, as `69f` does.
* **The item** (`kits/interiors/sets/README.md`) says the rooms in the builder's frame: `bodies` for planned storeys
  (`poly` = the body's outer face, `y` its base, `levels` the clear heights so that each upper floor `y + h + 0.25`
  lands on the drawn upper body, `wall` = `t`, `doors` where the builder draws them) or explicit `rooms`. The trades'
  room kinds `izwork_<t>` (the workroom: requires the trade's station by catalog role) and `izshop_<t>` (the selling
  room: requires its goods) are defined at the top of the set file for t in `bakery butcher brewery weaver dyer
  tannery tailor scribe apothecary tinker glass provisioner mill salvage boat smith`.

`95i` plans every hollow placement again in the world frame, replaces the planner's windows on each room with the
windows the builder drew on that room's walls, furnishes the rooms from the master catalog (`iziz`, with `generic`,
`scrap` and the `jobs` work pieces; the catalog's `iziz_trade_*` set, `iziz_bread_oven`, `iziz_butcher_block`), retries
a residence that fails the rule (a bed, a food and an item container per household) with another seed, registers every
piece in core/tags (prefix `ixf`, class furniture, its building as parent) and hands the cutaway one unit per building.
`window._interiors` reports it; `verify.py --assert` checks `interiors` (every building done, no residence failing) and
`voth-trades` (below). The furniture and the interiors kit come in a generated fragment (`88z-iziz-furniture-bundle.js`,
build.py `INTERIOR_TARGETS`: the vernacular sheet and, since 2026-10-19, the city). **In the city** every placement
with an item is hollow (its walls, storeys and stairs drawn, its rooms in core/walk, its doors working), but only the
civic and Ancient ones are furnished at load (`izixFurnish`: an item typed civic, military or religious, or `ancient:
true`); the rest are furnished near the camera (`IZIX.near` on the frame hook: within 85 m, two buildings a frame, one
batch mesh per 100 m cell). `window._interiors.bare` counts them, `.near` says how many cells and buildings are done. Each local plan is made once per item (`VHOLLOW.plans`).

### Openings and doors — `69e5-iziz-openings.js`, `95j-iziz-doors.js` (2026-10-19)

The owner: "remove all dark voids and make all windows, doors, and portals actual doors or windows/portals that have
transparency", and doors "that can open/shut with a keypress nearby or by npc". 69e5 wraps `vnDoor`, `vnWin` and
`vnStrip` once more (before 69f notes them as fixtures):

* a **door** is a shut leaf on its own instanced item (`vDoorLeaf`, kept out of core/lod: the leaves move), registered in `IZDOOR`: on a hollow face it swings
  into the room on its -x jamb; on a solid body (nothing behind it) it is drawn shut and `locked`.
* a **window** is clear glass (`vWinClear`, `MAT.izGlass`), a see-through warm pane when lit (`vWinLit`: `MAT.warmPane`
  is transparent now, and the city's day/night swap still drives its colour), boards, or a clear hole. On a solid body the
  pane stands before a room card (a `vPlaster` box tinted `IZ_ROOMC`: a dim plaster back, the colour of a room, never black).
* `vnOpening(x,y,z,ry,w,h,kind,c)` is the same for an opening a builder draws as a plain box (kind `door`, `win`, `glow`,
  `open`, `shut`); `vnPlate(x,y,z,w,h,d,ry)` / `vnGlowPlate` turn a window plate on a solid mass (a drum's ring, a slit)
  into a room card in a glass box. `vDarkB` is left only where it is water, soot, a forge bed or a stain.

`IZDOOR.leaf(x,y,z,ry,w,h,t,c,{locked,mirror,key})` draws and registers one (in the builder's frame; `mirror`: the right
leaf of a double door). `IZDOOR.open(id,{by,auto})`, `close`, `toggle`, `nearest(x,y,z,r)` are for anyone (an NPC, a
quest, the probe): `auto` shuts it again after that many seconds. 95j drops the doors of an unwound placement, writes each
door's blocks into core/walk (a shut door blocks the gap its wall left, an open one does not: `KWALK.setBlock` when core/walk
has it, else the block's heights), and eases the leaves on the frame hook. **E** near a door opens or shuts it (99-start;
a hint shows when one is in reach). `window._doors` reports the count.

### The Ancient civic interiors — `78t`, `78u`, `78v`, `kits/interiors/sets/iziz-ancient.js` (2026-10-19)

A VERN def per shell, placed by the city on the shell's own transform (90a) at scale 1, its item in the `iziz-ancient`
set in WORLD metres (the shell's scale applied). The shells open for them through `IZS_HOLLOW` (targets/city/89z-rows.js;
kits/ancients 77z reads it): no core behind the temple's upper glass band and a doorway in its crown; the arena's four
portals cut through its shell.

* **The temple** (`iziz_temple_ix`, 78t): the sanctum in the glass crown on the terrace the ramp lands on, and a switchback
  stair core down through three levels of four priests' offices each (L1 under the terrace, L2 behind the upper glass band,
  L3 in the second tier), floors cut to the tiers' squircle, the offices running out to the leaning tier wall. Ramp,
  steps, flights, landings, terrace, rails and parapet are in core/walk.
* **The arena** (`iziz_arena_ix`, 78u): 24 bays at ground level between the shell and the wall behind the stands, one
  behind each opening, every partition a door, the portals' bays merged into four gate halls with double gates.
* **The skyscrapers** (78s, 78v; `towers/BLUEPRINT.md` and its sheets): every standing kit tower A-F gets its plan,
  `IZTOWER.plan(key, d, s)` (plain data: storeys of 3.2 m at the tower's placed scale, a lobby at the foot or, C, a sky
  lobby its three legs' stairs climb to, then 12 storeys of slum cells off a corridor round a switchback stair core, junk
  storeys above with their partitions broken by the kit's hole rule; a ruined tower's and a toppled tower's upright storeys
  rubble). `izTowerIx` (called by placeKit) draws it: merged floor slabs, scrap and panel walls and stubs, stairs and
  rails, street doors and cell doors (IZDOOR), rubble heaps, and core/walk; each storey is a job in `IZTOWER_JOBS` that
  95i's near pass furnishes. The kit's plates, soffits and skyRooms are left out (`IZS_HOLLOW.sky`) and the shells cut
  for the street doors. `IZTX` counts what was drawn.
* **The other Ancient buildings** (78w on 78s's engine, drawn by 78v; `towers/BLUEPRINT.md`, "The other Ancient
  buildings", and `towers/floors/<type>.png`): `IZANC.plan(type, d, s, noise, extra)` -> `{type, name, d, s, masses:
  [{id, at, plan}]}`, each mass an `IZTOWER.plan` on the building's own descriptor (`IZTOWER.plan(key, d, s, noise, K)`:
  K's `levels`, `outline`, `rows` and `layout` 'ring' | 'slim' | 'rooms' | 'bar', see 78s's header), its coordinates in
  world metres in the building's frame. Types: `aptsA`, `aptsC`, `honey`, `houseD`, `houseE`, `houseF`, `fuel` (the kit's,
  drawn by `izAncIx(type, G, d, regIdx)` from placeKit) and `t_setback`, `t_setback2`, `t_pent`, `t_hept`, `t_wedge`,
  `t_barrel`, `t_midrise` (the Ancients transplants, drawn by `izTransIx(kind, mode, P, regIdx, snap)` from placeTrans once
  `wreck()` has cut them; `extra.top` is the cut). The same rules as the towers: a lobby at the foot, slum cells in a
  reclaimed building (junk above the twelfth storey), rubble in a ruined one, partitions broken by the kit's hole rule.
  `izIxDraw(P, G, d, regIdx, o)` is the drawer every plan goes through (the towers' too). The kit's hooks:
  `IZS_HOLLOW.apts` (82-apartments: A's tray slabs, liners and rooms, B's mid-wall, plates, pillars and lit cells, C's solid
  liners; street doors in A's stem, B's skin and each of C's drums), `.houses` (64-houses-def: D's liner holed like its
  dome, E's and F's dark room blocks, the door plates), `.fuel` (84-fuel: the kiosk's arch cut through), `.trans` (the
  transplants' post-wreck pass, 78v). Each keeps every rng draw.
  The owner's roster (2026-10-19) adds `wave`, `bridge`, `fins`, `adlab`, `flat` (the alternates, vendored: 8aj-alt-a-bole,
  8aj-alt-d-flat, 8ak-alt-a-houses, 8ak-alt-b-civic, 8ak-alt-c-works), `hotel` (75-hotel), `cultural` (67-cultural) and
  `aptsC2` (82-apartments buildAptsC2). Hooks: `IZS_HOLLOW.alt` (the alternates' plates, liners, door plates; the lab's
  doorways into its lobes and portal), `.hotel` (its world-storey slabs out, the others kept as terraces), `.cultural` (built
  compact, its liners out, doors cut, its halls listed in `CULT_HALLS` for the plan: `izAncIx(..., {halls})`). 78w plans the
  fin apartments and the hotel itself (`polar`: storeys on an arc), and after any plan lays every street door into its wall's
  plane (`doorsInPlane`) and can leave out the cells of a fallen part (`cull`).
* **The Voth embassy** and **the Order's chapterhouse** are VERN defs already: their items are in the same set, their
  bodies hollow (the house's ground storey, the service range, the domed audience hall; the battered reading hall).
* **The two guilds** (`anc_mercenary_ix`, `anc_salvagers_ix`, 78v): the Watch (the kit's police station at 0.45) and the
  Reliquary (its laboratory at 0.5): on every level a stair hall with the temple's switchback core and its four walls run on
  both ways to the shell, so eight rooms round it (an arm beside each hall wall, its door from the hall; a corner room off
  each arm). The Watch has two storeys (18 rooms: vestibule, contract hall, armoury, kitchen, mess; study, archive,
  dormitories and barrack rooms, the armourer), the Reliquary three levels (27 rooms) of
  two kit storeys each (its storeys are 2.2 m at 0.5). The shells open only for the guilds: `IZS_HOLLOW.guilds` (89z-rows)
  makes `vqWrapKit` (77-anc-guilds.js) set `IZS_HOLLOW.police` / `.lab` for that one call, so the kit's own stations and
  labs in the ancient quarters stay solid. Hollow, the kit (73-police.js `policeShell`, 89-lab.js `labSkin`, both on
  `gridAt`) draws the shell on lines through every window's edges, cuts each window (an arch: a rectangle to the springing,
  steps into the arch, all inside the glass) and the front door through it, glazes the lab's arcade, clears the windows and
  leaves out the core and the rings of rooms. The city places each interior on its guild's transform (90b `guildIx`), its
  furniture's parent the guild's kit record.

`python3 ixshot.py dist/iziz-vernacular.html --keys <k,..> | --all [--back] --out shots/ix` shoots each building at eye
level and cut away at each storey, and prints its rooms, pieces and residence counts. `?interiors=0` turns it all off.

**The court's pictures and finishes** (2026-10-19, `95i-iziz-interiors.js`): after the furniture is built, the court sets
of Iziz's pack (`core/materials/patterns/court/`) go onto the placed pieces in two ways. `COURT_DECALS` lays UV'd overlays
where a picture must sit exactly: book spines on `iziz_court_library_shelves` and Talia's `talia_common_bookcase`, a
canvas (one of `courtPaint1..24`, picked by position) and the carved gilt moulding (`courtFrame`) on every
`iziz_court_painting`, the glaze bands (`courtVaseA/B`) round Talia's jars and the court ewer, the sun carpets
(`courtCarpetA/B`) on the court carpet, the common rug and the court wall rugs, and the Iziz mosaic on the mosaic panels.
An entry is in the piece's own frame (+z its front, y up from its foot). `COURT_TRI` maps the court tier's own palette
keys (`courtMahogany`, `courtBrocade`, `courtCloth*`, `courtGilt`, `courtMarble` in `krator-master-furniture-iziz.js`, split
into texture families by `FAMILY_SPLITS`) onto the merged batch meshes by triplanar projection (the batch has no UVs):
marquetry, brocade and the opus-sectile hearth in full colour, gold leaf and velvet as detail maps on the piece's own
colour. A set the page's pack lacks is skipped, so a page without the court sets draws the plain catalog colours. In the export (`targets/city/94-city-export.js`) an overlay is a part of its piece (`courtParts`), and a finish a material with hook `triplanar` {tile, detail, gain}, which Godot's library shader draws (`godot/shaders/lib/triplanar.gdshaderinc`).

### The trades — `74z-vern-trades.js`

`VERN_TRADES`: every trade in the Voth city's census, and the Voth catalog's shop trades, with the Voth building and the
Vernacular defs that carry it (`civic: true` where that building is civic; `na` and why, where the trade cannot exist in
Iziz). `_api.trades()` checks every named def exists.

### Adding a building

1. New `function buildVernX(G,o){reseed(7xx1+(o.v|0)); … vnReg(...); …}` in the
   right fragment (or a new `7x-vern-<family>.js`).
2. `VERN.def({...})` at the foot of the fragment with honest `w,d,h` (the
   showcase spaces sites by `w`).
3. Add the key to a row in `targets/vernacular/89z-rows.js` and a view or two in
   `91z-views.js` (an eye-level one).
4. `python build.py && python verify.py … --assert` — then read the shots.

## Targets

| target | output | what |
|---|---|---|
| `vernacular` | `dist/iziz-vernacular.html` | the set in rows by family, wealth left→right |
| `palace` | `dist/iziz-palace.html` | the palace citadel on its hill, its blueprint laid and furnished (below) |

A target contributes `89z-rows.js` (`TITLE`, `GROUND_C`, `SITES`) and
`91z-views.js` (`VIEWS`; the first entry is the opening shot). `90-scene.js`
loops `SITES` through `VERN.place`, tags every `REG` entry with its site key,
then `kbake(scene)`.

**A kit on this page (`--kit`, 2026-10-18).** A kit written on the Vernacular's contract (`kits/pylon`, later `kits/talia`;
`VASSAL-KITS.md`) is built here with no copy of anything: `python build.py --kit <folder>` (the kit's own `build.py`
calls it) merges the folder's `src/` into this build's one fragment order (a name that clashes stops the build), takes
its `targets/` and `kit.json` (`targets` name -> page, `interiors`, `core`, `deterministic`, and `external`: repo-relative
fragments read in place by their own names, such as the Ancients kit's Monolith; and `pack`: the kit's own library
families, packed into its `tex/` from its `materials.json` and inlined as `KMAT.pack('<pack>')`, which the kit's own
fragment binds with `KMAT.bindMat`), applies the build rules to
its fragments, and writes the pages to the kit's `dist/`, the manifests and the syntax file to the kit's folder, and
prints the kit's KNOWN_ISSUES. Without `--kit` the build is byte-identical to before.

## The palace citadel (`targets/palace/`, 2026-10-19)

The owner's agreed programme (`palace/BLUEPRINT.md`, 2026-10-15) built on its own page. Every fragment is the target's,
so the city, the vernacular sheet and the kits on this page are byte-identical with or without it (checked: their
hashes from HEAD's `build.py` and from this one match). When the city is rebuilt, the fragments move to `src/` and the
city places the citadel on its hill the same way.

| Fragment | Tag | What |
|---|---|---|
| `78p-palace-plan.js` | [G data] | GENERATED by `palace/export_plan.py` from `palace/iziz_blueprint.py`: `IZPAL_PLAN`, every sheet's rooms `[n, name, kind, u0, u1, v0, v1, decor, note]` and the stairs and shafts |
| `78q-palace-layout.js` | [G data] | `IZPAL.layout()`: the sheets laid into storeys (the method below); `IZPAL.frame(F)` maps the citadel's frame to a page; `IZPAL.windows()` the windows the palace builder drew. Runs in node: `node palace/test-palace.js` |
| `78r-palace-draw.js` | [draw] | `IZPALDRAW.draw(L, frame, {mark})`: the shells, liners, floors, ceilings, walls, doors, balustrades, stairs, shafts, panes, colonnades, finished by decor level; the palace's own materials (`MAT.pal*`, bound to the `izpalace` pack) |
| `78s-palace-citadel.js` | [draw] | the VERN def `pal_citadel` (the page's one site): the hill, the Mech Gate, the precinct as the city builds it, the layout drawn, the precinct buildings' outsides; `IZPAL_SITE` |
| `84-palace-geo.js` | [G data] | `PALGEO` and `terrainH`: the mesa (top 40 m over the city, r 96, the escarpment to r 132) and the Mech Gate's cutting |
| `95p-palace-furnish.js` | [web] | `IZPALX`: rooms as core/tags records, the cutaway units; `IZPALF`: the furnishing and the roof gardens' planting; `window._palace` |
| `95q-palace-cutlabels.js` | [web] | `IZPALCUT`: the cut storey's room names over the view (a DOM overlay laid out each frame; N or the bar's button hides them) |
| `89z-rows.js`, `91z-views.js` | | the site and the views (a cut view is a function that opens the cutaway) |

**The frame.** The blueprint's: u from the citadel gate inward, v across, h up from the mesa top. On the page the hill's
centre is the origin and the gate is at +z, so x = v, z = -u, y = 40 + h. `IZPAL.frame({cx, cz, top, gx, gz})` takes any
hill and gate bearing (the city's `HILL.palace` and its gate): `P(u, v)` gives world x, z, `UV(x, z)` the inverse, `Y(h)`
the height, `ry` the yaw of a box whose x runs along v.

**Laying a sheet** (`SKILL.md` 5j's method: clip, do not scale). The palace builder's seven masses (`IZPAL.MASS`: the base
tier, the Domus tier, the hall level's rear mass, two flanks and lintel, the tower) keep their size and taper. Inside each,
a liner stands 0.9 m in from the face at the storey's ceiling; a storey's envelopes are its masses' liner rects (the
hall's is open to the terrace). Each sheet room is clipped to the envelope its centre falls in and dropped under 4 m2 (two
are: the great door's sliver and the Aula's guards; the test expects exactly those). The storey is rasterised at 0.5 m:
the cells no room takes are corridors. A wall stands between two spaces unless both are open floor (corridor, passage,
hall, gallery, stair, the Hangar Hall); a void (`void`, `gallery_void`) has no floor and a balustrade to open floor.
Doors are found outward from the open floor: each closed room opens on its longest wall to a space already reached (open
floor first), so the second rank opens off the first. Portals (`S.portals`) are the openings between masses and to the
outside: the grand entrance, the rear and flank doors, the great door into the Aula, the hall's doors to the flanks, the
Mech Gate. The heights (assumed: BLUEPRINT.md left them open) are in the fragment's header.

**Drawing it.** The builder's frustums are taken out of the kit's lists after it ran (`clear`: the instances it pushed
since the mark) and drawn again as shells of the same size, taper, material and tint, with the portals' holes cut; its
dark doorway boxes and lit panes that stood inside the masses go with them, and its roof slabs (1.5 m, the tiers'
cornice lips, which stood across the rooms above their floors) become rings round the liners. Everything else is the
builder's. Finishes by
decor level, the blueprint's: sumptuous (marble floor, sun medallion, marble dado, cream stucco, gilt frieze, pilasters,
coffered gilt ceiling, gilt door surrounds and bronze leaves, colonnades in the great rooms), rich (mosaic floor,
mahogany dado, orange stucco, sun-banner frieze, gilt cornice), fine (tile), plain (stone and plaster), bare (concrete),
Ancient (white panel with cyan strips). The builder's windows are seen from inside as daylight panes on the liners. The
textures are the page's own pack (`palace/materials.json` -> `palace/tex/`, `KMAT.pack('izpalace')`, its own sidecar
`dist/iziz-palace.tex.izpalace.js`: build.py `TARGET_PACKS`).

**Furnishing** (`IZPALF`). One pass per room, no stream (every choice hashes the room's id and the slot): the heroes (the
imperial throne on the Aula's dais under its baldachin, the altar of the House, the core, the shield emitter, the cradles,
the pools, the map tables, the heliograph, the Ancient set, the armillary), each class's essentials (beds and strongboxes,
bunks, hearths, desks, bookcases, stores), then the walls (a hung and a standing piece in turn, 3 m apart in a
sumptuous room, clear of doors and windows), the corners, the middle by class (seat groups round low tables on carpets,
banquet tables and couches, the council table, rows of desks, cases and bunks; the Aula's runner between standards and
torcheres), the ceiling (great chandeliers, deco chandeliers, pendants) and the tops (ewers, bowls, candelabra, books).
The pieces are the catalog's Iziz sets, Talia's (the vassal university city: its envoys' rooms in the Hall of Embassies
and the palace take Talia's tub armchairs, brass tables, sofas, rugs, palms, lanterns and the aedicule in the Audience of
Envoys; the libraries, the observatory, the map rooms and the schoolroom its globes, map and specimen cases, scholars'
desks, slate and easels) and the palace's own (`kits/catalog/krator-master-furniture-izpalace.js`, the court's 25;
`-izpalace-depot.js`, the Depot's, the Core's and the service rooms' 22; both list only `pal_*` room kinds, so no other
build's furniture moves), bundled with the catalog's detail maps (build.py `TARGET_FURN`). The court's paintings hang in
every state room and corridor and its library shelves stand in the libraries and archives; after the batch is built the
court sets go on as the vernacular's interiors lay them (`95i`'s `courtFinish` and `courtDecals`, "The court's pictures
and finishes" above): the sixteen paintings and their gilt frames, the book spines, the vase glazes, the sun carpets, and
marquetry, brocade, velvet and gold leaf on the court pieces (the palace's own court pieces draw in the court keys too). Each piece is a
core/tags record under its room; each room a record (class part, kind room) under its building, named from the sheet.

**The precinct buildings** (`IZPAL.PREC`: the two great houses, the two barracks, the three services and the three terrace
pavilions) are laid like the block: an envelope 0.6 m inside the rect (the outer wall fills that), storeys from `y0` (0.15
on a plinth over the paving; the pavilions on the roofs they stand on), rooms from sheet I0 on the ground floor, I1's zone
cut into rooms above, the barracks' own plan (`barracksRooms`: a hall from the court door to the drill-yard door, the guard
room, the centurion's office, the armoury, the bath, the stores and the mess; contubernia of eight and a centurion's or an
optio's rooms above), the pavilions one room each (the Orangery, the Summer Triclinium, the Belvedere of the Stars, where the
builder's solid belvederes stood: 78s takes those out by position). `entries` are a building's doors to the outside, on a
side of its envelope (`'v0'`: the side at the smallest v), into the space there: the Praetorium and the Hall of Embassies
open from the palace's side doors (now on the axis of the Legates' and the Envoys' Waiting Rooms, u 11.5) under a covered
way, and at the back for the staff; the barracks to the court and to the drill yard. The outsides (78s `LOOK`): ministry,
service, barracks (the city's block: white bands, a roof upstand, cyan strips) and pavilion (the palace's sandstone under a
pyramid with a banner).

**Windows and doors** (2026-10-19). 78q gives each storey its window openings (`S.wins`): the palace's at the builder's
positions along each face (`palaceWindows`: the storey the row's middle falls in, centred on it; the mass whose face it is;
the liner behind), the precinct buildings' evenly along each side (`precinctWindows`). 78r cuts them through the shells
(`shellGeo` holes) and the liners' skins (a gap with a sill: the wall, dado and skirting run under it), lines the opening
with stone, glazes it 0.55 m behind the face with bronze bars, and redraws the builder's surround to fit; the builder's
own (a dark box, a lit panel, its stones) is taken out in `clear`. A window with no single room behind it is blind:
curtained glass on the face. 78s builds the precinct walls storey by storey round the openings. Every door has leaves
(bronze, mahogany or oak by its finish; the delivered door sheet on the state doors and the great door's two), standing
open into the room; outer doors stand closed in the wall.

**The terrace stairs** (78s): up each flank from the base tier's roof to the second's, straight along the second tier's
face (77 risers of 18 cm, three flights, a top landing and a bridge onto the terrace), in place of the builder's blocks.

**The roof gardens** (`IZPAL_SITE.gardens`, 78s): raised beds with marble kerbs on the three terraces, clear of the
builder's hedges, lamps, pavilions and flank stairs and of every edge, and three beds in the Orangery. 95p plants them from
the catalog's plants (`krator-master-plants.js`, bundled as pieces: `furniture_bundle.bundle(..., plants=True)`, build.py
`TARGET_FURN`): palms, dragon trees and tree ferns on the middle line of the wide beds only (no crown reaches out over the
drop), heliconias, giant ferns, oleanders, agaves and succulents round them; each a core/tags record (class flora) under its
bed's.

**No two faces on one plane** (2026-10-19, after the owner's z-fighting report). Floors' tops are the storey's level (the
furniture stands on them); ceilings hang 4 cm lower than before, so a ceiling never shares a face with the floor slab over
it; a skin's top stands between its ceiling and that slab; liner skins are cut at the grid's lines, so each ends on its
partition; a door's jambs and reveal and a portal's reveals run 3-4 cm into the opening past the wall's end; pilasters stop
under their capitals' tops; window frames stand off the pilasters' plane; stairs are painted last, so a landing never lies
over another room's floor; a room's walls rise through a void above only where that storey has a wall too (a gallery's
balustrade stops them); carpets lie 1.5 cm over the floor and 8 mm over each other. The furniture keeps to its room's own
cells (a room's rect can take in a void or a stair head). A check for this, run by hand: every pair of box instances with
coplanar, same-facing, overlapping faces of different items or tints (the session's `zf.js`; KNOWN_ISSUES.md).

`window._palace`: rooms, records, the units, unreached and dropped rooms, the draw's counts, and `furniture` (pieces,
heroes, keys, plants, missing keys, by class, ms). `verify.py --assert` checks it (`palace`). `?interiors=0` leaves the
rooms bare.

## Dev tools (project rule) — `92-camera.js`

* **Inspector** (on by default; button toggles): hover shows *name ·
  classification · tags · world point*; unregistered geometry says so.
* **Polygon**: click the ground to add vertices, right-click removes the last;
  the panel shows copy-pasteable `[[x,z],…]` (or `{x,z}`), with Copy / Close
  loop / Undo / Clear. Also `window._poly`.
* **Walk (F)**: eye height 1.7 m, WASD, drag to look, wheel = speed, Shift =
  run. Judge the set from here.
* **Labels**: per-site name · wealth sprites.

## Probe — `window._api`

`totals`, `typeStats()`, `regOccupancy()`, `nanSweep()`, `tagAudit()` (every
REG entry has cls + culture/type/wealth), `defs()`, `setView`, `views()`.
Budgets: showcase 3 M scene triangles / 400 draw calls; per type 250 k.


## Group transforms nest (round 3b)

`useGroupXF(P)` / `endGroupXF()` are reassigned in `69c` to a stack: a child
group's local matrix composes onto the parent's, and end pops. Kit builders
that open their own body group (the skyscrapers, `bodyGroup`) therefore work
inside `VERN.place`, `TRANS.place` and `placeKit`. Rule for placers: call the
builder at local (0,0) and carry the centring in the GROUP — `KOFF` is added
in world space after the transform and cannot centre a scaled, rotated plot.

## The city target (`targets/city/`, round 3; round 4 below)

**Round 4 — the core and the belt.** The wall stands √1.2 further out than in round 3 (20% more enclosed area), and
the bunkers, gates, towers and spaceport moved with it. Everything laid out in round 3 still keys on the old line,
`coreR`/`insideCore`: the ancient clusters, the parks, the settler lattice, the core farms, The Project and the
toppled B. So the core did not move. The ring between `coreR` and `wallR` is the **farm belt** (90b pass 2b, painted before the
guilds and civic buildings): a belt road at `coreR-20`, radial lanes every ~52 m, and blocks between them. Three in four
blocks are farmed, as runs, and reserved in the mask as `field`; their plots are laid out in pass 6b (`cityFarmPlot`,
any rectangle at any yaw). The rest fill by the hill rules through the frontage walker and the infill. `window._belt`
and `_api.city.belt()` report it.

**Pinned by Travis's coordinates** (88): the toppled F (`toppledF`, falls toward a point and breaks near another via
the kit's `TOPPLE_BREAK`, see placeKit `breakAt`), the repaired Skyscraper C with its tripod market (`tripodHere`, slot
`forceD:3`). A slot's `forceD` overrides its quarter's decay state.

**Life-layer destinations:** `LIFE_DESTS.market` (also `window.LIFE_DESTS`) holds every tripod-market stall
`{x,y,z,face}`. Each market's REG entry is tagged `market:true, destination:'market'`. `_api.city.lifeDests()`.


Fragments, in build order (they sit between the shared `src/` fragments):

| fragment | what |
|---|---|
| `84-city-geo.js` | `CITY` constants (WORLD 1900, PLATEAU 18, CHASM −16, R 470, WALL_K √1.2, GATES, the three HILLS as mesas `{x,z,H,r0,E,ring,gate}`), `coreR(t)` (the round-3 wall line) and `wallR(t)` (the wall, WALL_K further out), `insideCore` beside `insideWall`, `hillProfile/hillH`, `cityFlat`, **`terrainH` reassigned** (plateau + hills + moat + causeways + spaceport pad), `insideWall`, `nearestHill`, `radial`, `FRAME_HOOKS_PRE` |
| `85-city-paint.js` | the painted ground: `gcv` albedo / `mv` buildable mask / `kv` class canvases (2048 px), `KL` classes, `road(pts,w,cls,opt)` (paints + pushes to `ROADS`), `disc`, `footprint`, `annulus`, `precinct/inPrecinct`, `cityBakeMasks()` then `canBuild/klass/isRoad/walkable` samplers |
| `86-bio-10…70` | the hyperjungle biome kit, vendored byte-identical (SCOPED in build.py; manifest in VENDOR.json) |
| `86-bio-45-init.js` | `BIO.init` against `terrainH` and the mask canvases; `bioMaskFn` (jungle outside the moat, undergrowth in parks at .85 and in ruined clusters at .28), `bioTreeMaskFn` (hypertrees stand back 130 m from the wall), `BIO_OBSTACLES`, `RUIN_RECTS` |
| `87-city-layout.js` | the primary network: escarpment paint, ring roads (`roadInside` clips to the plateau), ramps, thoroughfares ring-to-ring, gate roads to the nearest ring, the spaceport causeway, hill-top courts/plazas, parks (`park()` re-strokes roads through it), amphitheatre pad, needle pad. `nearestRoadPt`, `connectRoad` |
| `88-city-place.js` | occupancy (`OCC`, `obbOverlap`, `occFree`, `occAdd`, `obbCorners`, `groundOK`, `groundY`, `findSpot`); the ancient lattice `AG` (pitch 40, street 7, 12°), cluster growth to the ½-area target, reclaimed/ruined split by distance to a ring, streets + two connectors per cluster, slot tiling by wishlist (`QUOTA` per hill: 5 sky / 15 midrise reclaimed) |
| `90a-city-world.js` | terrain mesh (4 m cells, albedo texture), moat water, `KratorSky` attach + `citySkyTick` (sun/hemi/fog/BIO.setSun), outer wall + gates, palace hill (palace `orig` @1, Ancient curtain wall r 84, two `izBarracks` blocks inside, statue, lamp columns), temple (`anc` @.8), arena (`anc` @.82), needle, spaceport |
| `90b-city-build.js` | `KITCAT` + `measureKit` (core footprint above the plinth line) + `placeKit` (fit, `hmax`, flora strip, `trimPlinths`, repairPass, lighting rule, REG adoption) + `placeTrans` + `placeVern`; passes 1 ancient clusters → 2 moat bunkers + rust amphitheatre → 3 civic/guilds (`placeNear`, `placeOnTop`, `fillTop` for the temple and arena tops) → 4 settler streets (BFS from the network) → 5 frontage walker (`pickVern` zoning) → 5b infill with footpaths → 6 farms → 7 footprints into the mask, jungle (trees with the tree mask, floor with the full mask), `BIO.bake` → 8 `kbake`, `TRANS.bake`, labels |
| `90c-city-atmos.js` | binds `core/atmos` (`ATMOS`, pulled in by `TARGET_CORE` in build.py) and places the lamps, banners, fountains, evening lights, glow, particles, weather (UI selector, `apply` on the city's fog, sun and ground), ivy, window boxes and cisterns, the sewer outfall and drain, moths round the street lamps; ends with `ATMOS.finish()` and `ATMOS.cull(scene)`. `window._atmos`, `_api.city.atmos()`. `ATMOS.export()` / `ATMOS.download('iziz-atmos')` give the whole atmosphere as JSON for a game engine (`core/atmos/GODOT.md`) |
| `src/93-labels.js` | **standard package**: floating labels for every REG volume (buildings, farms, furniture; repeated wall segments skipped) as ONE atlas mesh — constant screen size, landmarks (`tags.role` or `tags.landmark`) bigger and never faded; lives in `LABELS`, toggled by the Labels button |
| `91z-views.js`, `93-city-ui.js` | presets; Paths overlay (class map + DOORS), Jungle toggle, hour slider, city budgets, `window._api.city` |

Lighting rule (Travis, round 3): the citadel, arena and grand temple are
electrified (their generators stand on the tops); civic buildings and guild
halls are lit; a rich house or a reclaimed Ancient building is lit 50/50 **only
on one of the three hills** (`onHill`: within ring+40 m); everything else is
dark. `placeVern` passes `lit` through `o.lit` (so `vLit()` follows it) and
stamps the REG tag; `placeKit` recolours the kit's light items `DEADLIGHT`
when a reclaimed building draws dark.

Adding a building type to the city: a vernacular def needs nothing (it is
picked by `pickVern` or placed by name with `placeNear`); an Ancients-kit
builder needs a `KITCAT` row (`smax`, `smin`, `hmax`, `type`, `kind`) and a
wishlist entry in `88`'s `assignSlots`; a transplant kind is placed through
`placeTrans` with `TREFHALF`.
