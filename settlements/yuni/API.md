# Yuni — generator API (the contract)

Yuni is a city in the far south-east of Krator (Travis's game world): a former Ancient installation under a
Devil's-Tower-like butte, HQ of the Order of Historians, ~10k people. It is generated procedurally in Three.js
r128 and built into self-contained HTML files. `src/` fragments are concatenated by `build.py` inside ONE
`BUILD()` function, so **every top-level name is a global shared by every fragment**. Wrap your fragment body
in ONE IIFE, open the file with `reseed(N)` (N unique: your fragment number x 10000 + 1), and prefix anything you
must export. Two targets are built from the same source:

* `yuni.html`        — the world (terrain, butte, Grand Vault, wall, streets). **No buildings are placed yet.**
* `yuni-assets.html` — the INSPECTION SHEET (`SHEET === true`): flat ground at y = 0, every registered ASSET laid out
  in family rows, each variant once, with a name label and a 1.75 m figure. This is what you are judged on.

**Units are metres.** x east, z SOUTH, y up. A person is 1.75 m, a door 2.0-2.3 m, a storey 3.0-3.6 m.

## Loop

```
python3 build.py                                   # rules + node --check  -> yuni.html, yuni-assets.html
./run.sh LOG yuni-assets.html --assert --views "Poor quarters: mud & thatch" --out shots     # background; poll LOG.done, read LOG.txt
./run.sh LOG yuni-assets.html --cam "cx,cy,cz,tx,ty,tz" --cam-name mine --out shots         # ad-hoc close-up (negative first number: --cam=-10,...)
./run.sh LOG yuni-assets.html --hour 21.5 --cam ...                                           # night: windows + lanterns
python3 verify.py yuni-assets.html --eval "()=>window._sheet"
```
Headless Chromium with software GL; a run takes 1-3 minutes. ALWAYS run verify through `./run.sh` and poll — a
foreground call can time out. Do not run two verifies at once (they starve each other). LOOK at your screenshots
(Read the PNG) — from the front, from above, and one close-up at eye level — before you report. `window._sheet`
lists item positions: `_api.SHEET_ITEMS` = `[{key,name,x,z,w,d,h,fam}]`; aim `--cam` at them.
The error panel must be clean. `build.py` fails on: a generative fragment without `reseed(N)`, a colour array
(`var X = [0x...`) outside `05-palette.js`, a column-0 name declared in two fragments, or a syntax error.

## What an asset is  (53-assets.js — read it, and 55-mid-example.js, the reference asset)

```js
ASSET({ key:'poor_musgum', name:'Musgum shell house', family:'poor', districts:['poor'], wealth:[0,0.3],
        w:9, d:9, h:8, variants:3, build:function(F){ ... } });
```
* `key` unique snake_case with the family prefix. `name` is the TOP-LEVEL NAME the inspector shows — make it
  specific and human ("Dyer's workshop", not "workshop_02"). Every distinct asset needs its own distinct name.
* `family`: `ancient | civic | rich | park | mid | trade | poor | prop`. `districts`: `core | prosper | market | poor`.
* `w` (x extent), `d` (z extent), `h`: the footprint is a HARD limit — build only inside w x d (a later pass runs
  oriented-rectangle overlap tests with exactly these numbers). Yards/courtyard walls count as part of the footprint.
* `variants`: `F.variant` = 0..variants-1 must give visibly different buildings (massing, storeys, colour, roof), and
  `F.seed` (via `F.rnd() F.rr(a,b) F.pick(arr) F.chance(p)`) small differences within a variant. NEVER call the
  global `rnd()`/`rr()` inside build().  `F.wealth` 0..1: more paint / mosaic / relief as it rises.
* LOCAL FRAME: origin at the footprint centre on the ground, **+z is the FRONT** (the door side, which the
  placement pass will turn toward the street), +x to the right, `ly` = height above the ground at the centre.
  Put the main door on the +z face, near `lz = +d/2`.

Frame calls (all local coordinates; same argument order as the kit underneath):
```
F.box(lx,ly,lz, w,h,d, rot, colour, family)      // ly = BASE. rot: number = extra yaw, or [rx,ry,rz] (Euler YXZ)
F.fr8 / F.fr5 / F.pyr (same args)                // battered box, strongly tapered box, 4-sided pyramid
F.cyl(lx,ly,lz, r,h, rot, col, fam)   F.cone(...)   F.dome(...) (hemisphere)   F.blob(...)   F.ball(lx,ly,lz, r, col, fam) (ly = centre)
F.edome(lx,ly,lz, sx,sy,sz, rot, col, fam)       // half-ellipsoid: a flattened or stretched dome
F.beam(ax,ay,az, bx,by,bz, w,d, col, fam)        // box from a to b        F.rod(ax,ay,az, bx,by,bz, r, col, fam)   // round pole
F.lathe(fam, lx,lz, [[r,y],[r,y],...], col, {seg, rfn(i,ang), cap})   // SURFACE OF REVOLUTION, bottom to top: domes, shells, towers, pots, columns
F.tube(fam, [{x,y,z,r,col?},...], col, {seg, cap, rfn})               // swept tube along any local polyline: bone columns, serpentine benches, ribs
F.mcone(fam, lx,ly,lz, rBase,rTop,h, col, seg, {under:true})          // cone / frustum roof (thatch!)
F.quad(fam, a,b,c,d, col, hint)  F.tri(fam, a,b,c, col, hint)          // [lx,ly,lz] corners; winding is fixed for you so the face looks toward `hint` [x,y,z] (local)
F.archwall(fam, lx,ly,lz, face, W,H,T, ow,oh, col, {colIn, famIn, pointed, seg, noTop, noBack, ox})
        // a wall slab W wide, H high, T thick with a PARABOLIC opening ow x oh — THE arch of this city. face = which way the
        // slab faces, as a local angle: 0 front(+z), Math.PI/2 right(+x), Math.PI back, -Math.PI/2 left. Solid wall: ow=0.02, oh=0.02.
F.archband(fam, lx,ly,lz, face, ow,oh, t, depth, col)                 // just the arch RING (archivolt / painted surround)
F.arcade(fam, lx,ly,lz, face, n, bayW, H, T, col, {pier, head})       // n parabolic bays in a row: cloisters, loggias, market halls
F.sector(fam, lx,lz, r0,r1, a0,a1, yb,yt, col, {faces:'tbios'})       // annular-sector prism: round walls, curved benches, ring courts
F.tower(lx,ly,lz, R,h, {fam,col,band,flutes,windows:[t..],finial})    // the blunt fluted paraboloid tower (Hotel Attraction) used on the city wall
F.door(lx,lz, nlx,nlz, w,h, col, ly, o) // nlx,nlz = LOCAL outward normal of the wall it sits in; ly = sill height (doors on a plinth).
        // A WORKING door: hinged leaf (or two when w > 1.75), dark reveal, a tagged FIX_DOOR record and a doorstep point.
        // o = { style:'plank|double|carved|studded|mat|hatch', hinge:'left|right', swing:'in|out', to:'interior|court|street' }.
        // Never draw a door out of boxes yourself: a hand-drawn door cannot open, export or be walked through.
F.opening(lx,lz, nlx,nlz, w,h, ly, o)   // a doorway you drew yourself (hut mouth, gateway): registers it with no leaf. o.style 'open'|'gate', o.to
F.mass({k:'box', x,z, y, w,d,h, r, tk})  // DECLARE a solid volume built from quads/lathes, so the interior planner can fit rooms in it.
        // tk = how much the half-width shrinks by the top (fr8 = 0.16). Boxes, fr8/fr5, cylinders, domes and lathes in a
        // wall family are recorded automatically; only hand-built bodies (rbody in 56-mid.js) need this.
F.window(lx,ly,lz, nlx,nlz, w,h, {noReveal, cool})   // ly = pane CENTRE. Dark reveal + a pane that lights on the evening schedule and spills light.
        // noReveal drops the flat dark box (use it on curved or battered walls, where the box stands proud at the silhouette).
F.disc(lx,ly,lz, nlx,nlz, r, thick, col, fam)        // a disc lying IN a wall, standing out by `thick`: oculus, medallion, boss, wheel
F.roundWindow(lx,ly,lz, nlx,nlz, r, colFrame, spokes) // frame ring + dark socket + radial mullions + a pane that lights at night
F.tree(lx,lz, kind, h, ly)              // kind = cypress | pine | olive | palm | shrub. Uses F's own stream, so it is seed-stable.
F.toron(lx,ly,lz, nlx,nlz, len, r)      // one projecting timber post (Timbuktu / Djenne walls): use rows of them
F.lantern(lx,ly,lz, amp,rad, hang)      // oil lantern + registered warm light.  F.lamp(...) = light only (hearth, forge, kiln)
F.p(lx,lz) -> world [x,z]    F.P(lx,ly,lz) -> {x,y,z}    F.dir(lx,lz) -> world direction
```
`shade(hex, f)` lightens (+) / darkens (-). `F.lathe` / `F.tube` profiles must have y strictly INCREASING (the ring frame
mirrors if y turns back), so a parapet's inner face is built with `F.quad`, not a lathe. `rfn(i, ang)`'s angle arrives in the
asset's own frame, so lobes and bulges turn with the building. Underlying kit (45-kit.js, 50-structure.js) if you need it directly:
`BOX CYL CONE DOME BEAM ROD TUBE MCONE SECTOR MQUAD MTRI QF TF ARCHWALL ARCHBAND BLUNT_TOWER` — world coordinates, and
two yaw conventions exist, so prefer F.

## Doors, windows, lights and interiors (the game-port layer)

Read `GAME_EXPORT.md`. In short: every `F.door`, `F.opening`, `F.window` (and any `WINPANE`) and every lamp
(`F.lantern`, `F.lamp(…, kind)`, `nlLampAdd(…, kind)`) registers a record in `FIX` with a stable id and tags,
and every asset instance gets a building record (`bld_00042`) tagged with a culture and types (`BUILDING_TAGS`
in `51-fixtures.js` — add your new asset there). Interiors are NOT drawn by assets: `64-interiors.js` traces
each door to the body behind it and fits rooms, partitions, stairs and furniture inside from swappable
modules. Use `F.door` for real doors so they open, export and can be walked through.

If an asset builds its walls from quads, lathes or thin panels the body capture cannot see, declare
the room volume with `F.mass({ k:'box', x, z, y, w, d, h, r })` (the salvage shack does). A room
needs about 2.6 m of body height to be planned. A low box laid over most of the footprint (a tarred
base band, a podium) is recorded as a PLINTH and hidden in the cutaway, so the floor shows.

### Furniture types (`FURN({ ..., type, setting })`)

`type` is one of: `bed table seating counter shelving hearth lighting rug screen tool decoration`
and the two CONTAINER types, which the game reads as loot and inventory:

| type | holds | pieces |
|---|---|---|
| `container-item` | belongings, tools, cloth, coin | `common_storage_chest`, `poor_lidded_basket`, `salvage_locker_press`, `ancient_cell_wall`, `order_mat_rack` |
| `container-food` | grain, oil, water, provisions | `common_grain_sacks`, `poor_clay_pots`, `poor_food_pot`, `common_water_jars`, `common_grain_bin` |

Every container carries `capacity` (rough inventory slots; `common_grain_bin` and
`ancient_cell_wall` 24, a chest 12, a basket 4). There is no plain `storage` type any more: a new
storage piece must say which of the two it is. Shelving stays `shelving` (not a container).

**The minimum kit** (`64-interiors.js`, `KIT_PIECES`, `ensureKit`, `buildingKit`): every dwelling
has a bed per bedroom (at least 1, 2 if multi-family), a food container (2 in a compound or a
wealthy house) and an item container (2 in a compound); every building has an item container;
every kitchen, store, shop and tavern room, and every shop / tavern / inn / farm building, has a
food container. Layouts place their own pieces first; `ensureKit` tops up from the culture's
`KIT_PIECES` (largest piece that fits, down to the smallest); a slot no room can hold is kept as
data with `virtual:true`. Buildings with no planned interior get a minimal data-only kit.
`window._kitAudit` (printed in verify.py's counters) must read 0 for `dwellingsMissingKit`,
`buildingsMissingItem`, `foodPlacesMissingFood` and `bedroomsWithoutBed`.

## Material families (05-palette.js, FROZEN — ask the planner for additions; a new family is a new draw call)

Textures are GRAYSCALE and tiled in world units; the colour you pass tints them. Exceptions are the two painted
families, which are COLOUR textures — pass a near-white tint (`0xffffff`, or a warm `0xf0e6d0`).

| family | what it is | colours (PAL / alias) |
|---|---|---|
| `adobe` | hand-smoothed mud plaster (banco) | `ADOBEC` ochre, `ADOBEREDC` laterite red, `PAL.adobeDark` |
| `plaster` | lime wash | `WHITEC` whitewash, `BLUELC` light blue-wash, `BLUEDC` dark indigo wash, `PAL.paintBlack` tarred base |
| `mosaic` | trencadis broken-tile mosaic | `MOSBLUEC`, `MOSWARMC`, `MOSGREENC`, `PAL.mosaicWhite` |
| `paintbw` | bands of chevrons/diamonds/nets, black-white-red (Tiebele / Kassena) — COLOUR texture | tint near-white |
| `paintcol` | polychrome interlace, rosettes, spirals on yellow (Hausa zanko relief) — COLOUR texture | tint near-white |
| `relief` | moulded low-relief bands (spirals, knots) | tint with the wall colour, slightly lighter |
| `metal` | Ancient white metal panels | `METALC` gleaming, `TARNC` tarnished, `BRASSC` |
| `rust` `concrete` `glass` | Ancient steel / concrete / opaque blue glass | `RUSTC`, `CONCRETEC`, `GLASSC` |
| `rock` | boulders, rubble, stone footings | `ROCKC` |
| `timber` `plank` `bark` | posts and beams / doors, shutters, decks / trunks | `TIMBERC`, `TORONC`, `PLANKC`, `PAL.trunk` |
| `thatch` `tile` | thatch / terracotta pan tile | `THATCHC`, `TILEC` |
| `cloth` | awnings, banners, laundry (sways in the wind; local y=1 is the hung edge) | `CLOTHC`, `AWNINGC` |
| new colours | gilding · Burmecia blue-grey stone · dressed warm limestone · dry thorn | `GILDC`, `BLUEGREYC`, `STONEC`, `THORNC` |
| `leafy` | foliage masses, crops, potted plants | `PAL.cypress/olive/pine/palm/shrub/crop/flowerBed` |
| `dark` | openings, sockets, voids | `VOIDC` |
| `glowmat` | UNLIT emissive (lantern cores, embers). Electric light is reserved for the Grand Vault. | `PAL.glowWarm` |

`CYPRESS(x,z,h) OLIVE(x,z,h) PINE(x,z,h) SHRUB(x,z,s)` (60-flora.js, WORLD coords — use `F.p`) plant a tree.

## The look (the user's brief, verbatim where it matters)

* "Wealthy, central areas have Gaudi inspiration but are also inspired by Burmecia [FF9: blue-grey stone, tall arched
  windows, balconies, ornate organic relief, rain-washed blue tile] and traditional Sahelian architecture and have
  extensive mosaics, low-relief ornamentation and painted patterns. Aside from mosaics, ornament takes the form of arches
  and cloisters, the organic curves of the structures themselves, and in some cases the use of wooden posts like in Timbuktu."
* "In less wealthy areas, the general forms are often preserved but paint and mosaics become much more sparse — low-relief
  and simple whitewashing or light or dark blue-washing tends to predominate; and in poorer areas simple mud buildings and
  even thatched huts predominate."
* "The ancient buildings of the city are in the Ancient style [Cyclopean, Modernist, Organic: late Gaudi, Bertrand Goldberg,
  Moebius, Soleri; gleaming white metal + blue glass, now tarnished/rusted, glass gone] ... might also benefit from a mix with
  modern neo-African influences [a brick cultural centre with a ring of tall slot windows under a wavy roof and a spiralling
  ramp tower; a laterite compound of drum halls with conical tile roofs, relief-carved walls and circular windows; terraced
  organic earth apartments whose arches and balconies are painted in bold bands]. Some of these are quite tall; many are in
  partial ruins though still inhabited and patched up by countless generations."
* Reference vocabulary the user supplied: Tiebele painted houses (black/white chevrons, red-and-teal diamonds, low curved
  forecourt walls); Hausa emirs' palaces (polychrome relief facades, zanko horn pinnacles, crenellated towers, pointed
  arches); Musgum shell domes (catenary mud domes with raised rib pattern, keyhole door); Mandara thatched-cone hamlets on
  rock; Djenne and Sankore (buttress-pilasters, pinnacles, toron posts, pyramidal minaret); Larabanga (white, conical
  buttresses, black base, triangular vents); the Ghardaia-like castle of stacked cubic volumes, arcaded galleries and a
  tapering minaret; Parc Guell.
* Parabolic arches everywhere (never semicircular, never Gothic-pointed). Curves before corners. Roof terraces with parapets
  are living space: stairs/ladders, pots, awnings, laundry. Human scale must read: doors 2-2.3 m, windows 0.7-1.2 m.

## Budgets (per asset instance, on the sheet)

A common house: <= 350 triangles-equivalent (about 30 kit parts + one or two lathes). A compound / tavern / workshop:
<= 1500. A landmark: <= 8000. There will be ~3000 buildings in the city: the placement pass multiplies whatever you
spend. Kit parts: box 12 tris, cyl 40, cone 20, dome 72, ball 70; F.lathe = 2 x seg x (points-1).

## Pitfalls (each cost a previous world a round)

- Coplanar faces z-fight: never put a detail flush with a wall — sink it 0.05-0.3 m in or stand it proud.
- F.fr8 / F.fr5 taper toward the top: anything on their faces must be moved inward with height (a window at the top of an
  8 m fr8 wall sits 0.08*w inside the base plane).
- A dome/lathe is hollow and single-sided: never leave it open where a camera can look inside (cap it, or put a dark plug in the door).
- Test the EXTENT of what you build against w x d, not its centre.
- Assert every scripted text edit applied. Write your fragment to disk early and grow it; do not compose it in your head.
- GLSL: you should not need any. If you do: clamp every pow/sqrt/acos/normalize input.

## Report format (your final message)

1. Files written. 2. The asset list: key - name - w x d x h - variants. 3. Verify output (error panel, `_sheet`).
4. What you looked at (which shots) and what you are NOT happy with. 5. Anything you need from the planner.
