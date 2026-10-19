# kits/beast-riders: the Beast Riders kit

The Beast Riders' buildings as a set of their own (owner, 2026-10-18). The riders are the hyperjungle's tribes (LORE 6.6:
Quetzal, Wingclaw, Nightwing, Raptor, Staghorn, Threehorn, Hardshell, Tiger, Mammoth...), united by Queen Mav; they
ride and keep great beasts, flying and running, and their towns are Mav's Refuge, Girder and Pinnacle Rock, with a
quarter in Kautoa (Ridertown, `settlements/isle-demo`).

```
python3 build.py                                   # dist/beast-riders.html
python3 verify.py dist/beast-riders.html --assert [--shots DIR]
python3 ../../tools/textures/pack.py kits/beast-riders   # (from the repo root) after a change to materials.json
```

## What it is

**Catalog buildings** (`ASSET`, culture `beast-rider`) on the catalog's engine (`kits/catalog`: `krator-furniture-core.js`,
`krator-asset-engine.js`), read in place:
- **The kit's own** (`src/50-br-mounts.js`), the mounts' buildings, which no build had, drawn in Girder's vocabulary as
  the ports show it (restyled 2026-10-18): Girder's palette turned to linear as Girder draws it, tarred stave walls,
  steep shingle hips with verdigris ribs and a red eave band, red and gilt carved posts, beast-head finials, the
  hall's tiered cone and gilt spire on the rookery tower; Girder's shingle and timber sets (`materials.json`):
  - `br_bldg_raptor_stable`: a long stable for the running mounts (raptor, staghorn, tiger), stalls on a straw floor
    under a hip roof, its fenced paddock before it (two variants: five stalls or four);
  - `br_bldg_great_byre`: an open byre on log posts for the great beasts (threehorn, hardshell, mammoth), hung hides
    for a windbreak, long troughs, hay ricks, a trampled yard round it;
  - `br_bldg_rookery_tower`: a free-standing roost tower for the flyers (quetzal, wingclaw, nightwing): raked log legs,
    a deck at 13.5 m with perch rails out on four sides, nests, a thatch canopy, a ladder, a feed hoist and shed.
- **The ports: Girder's and Mav's Refuge's own buildings** (`br_port_*`, 13 keys, 44 variants), drawn by the towns' own
  builders on their own engines, not re-authored:
  - Girder: `br_port_girder_hall` (the assembly hall), `_dwelling` (the five tower-slot kinds and a roofed one under the
    open sky), `_house` (round-hut compound, joglo, stave longhouse), `_roost_deck` (deck, stalls, perches, the keeper's
    shelter), `_palisade` (a stretch with a watch post; a gatehouse), `_stall` (four market stalls);
  - Mav's Refuge: `br_port_mavs_lot` (the ring buildings, ten kinds), `_shrine`, `_council`, `_rain_canopy`, `_roost`
    (great, main, satellite), `_room_front` (apartment, store, workshop, silk room), `_gate_facade` (the seven carving
    kinds cut into the gate baobabs).

  **How.** Each town calls its builders through `PORT(kind, id, frame, fn)` (`core/ports`), which notes what each one
  drew; the towns draw exactly as before (proved: `tools/scene_fingerprint.py --select fabric`). `towns.py` seals each
  town's engine (its palette, core, layout, kit, textures, structure, furniture and architecture fragments, read in
  place) into a closure, `BR_GIRDER` and `BR_MAVS`, with the kit's hook (`towns/hook.js`) and port table
  (`towns/girder-ports.js`, `towns/mavs-ports.js`). The closure runs the town as its page does, so every random number
  and furniture seed falls as there; the hook keeps the marked buildings, makes each one group in its local frame
  (origin its footprint centre on its floor, front +z; the town's instanced shapes made plain meshes with their colours
  and world UVs baked) and `src/60-br-ports.js` registers each as an ASSET whose build places a copy. The towns'
  library maps (their `tex/`, only the families the buildings use) are written once, `BR_TOWN_IMG`.

- **The rock-cut pieces** (`src/55-br-rockcut.js`, `src/56-br-rockcut-b.js`, 2026-10-19; the owner: "adapt some of the
  'carved into tree' interiors into 'carved into rock' interiors"): Mav's Refuge's carvings in its gate baobabs re-cut in
  red sandstone for Pinnacle Rock's stacks and the mesa's walls (`settlements/pinnacle-rock/PLAN.md`), as catalog ASSETs
  for any world, keys `br_bldg_rock_*`:
  - `br_bldg_rock_facade`: the seven gate-tree carving kinds (`gtFacade`: storehouse, strongroom vault, shrine,
    dormitory, inn, Wing barracks, guard post), each with its kind's door, windows, pentice, lantern and dressing, the
    upper storeys' window slots and smoke vent, and a beast cut over the door;
  - `_door` (on beast-head corbels; an arch whose keystone is a beast's head; a great double door under a frieze of claws
    between two beasts), `_window` (a tall slot; a shuttered row of three; an arched pair with a lattice; a round light
    whose grille is the claw), `_balcony` (a ledge on beast-head corbels; a gallery of two doors), `_stair` (rising right,
    rising left, two flights to a landing door);
  - `_room_front` (apartment, store, workshop, a roost cell for the flyers: Mav's room fronts re-cut), `_shrine` (a
    wayside niche; a shrine front with pilasters, an entablature and stepped merlons), `_cistern` (a wall cistern under
    its rain channel and the Rain Mother's face; a stepped cistern);
  - **the Deep Root cavern's dressing**: `_cavern_door` (the carved face round the cavern's door: the twelve tribes' beasts
    on an arch of roundels in LORE.md 6.6's order, under the claw, the Deep Root's roots down the face, three orders to
    the door, steps, braziers, lamp niches, offerings), `_tribe_niche` (one variant a tribe, all twelve: its beast, its two
    colours, its people's offerings), `_lamp_niche` (one variant a shrine: First Bough, Rain Mother, Winged Ones, Deep
    Root, Green Silence, each its own carving, lamp and offerings), `_offering_ledge` (long, short: the givers' hands in
    ochre above), `_altar` (the altar stone left standing, the five signs on its front, the Deep Root over it).

  **Against a wall.** Each piece's back is its plane z = -d/2, the wall's face `embed` (0.5 m) in front of it, nothing
  drawn behind the back: a raw rim of the living rock round a dressed face, the carving proud of it, so the face reads cut
  into the rock. `{wallR: R}` wraps it round a stack of radius R (the face along the arc; `KSTACKS.ring(S, y)` gives a
  stack's outline): `BR_ROCK.place(key, x, z, ry, {variant, wallR, embed, tribe, y})`, `BR_ROCK.onWall(key, px, pz, ry,
  opt)` (the face's middle at a point), `BR_ROCK.onStack(key, cx, cz, R, ang, opt)`, `BR_ROCK.dims` (a wrapped piece is
  deeper by its arc's sag), `BR_ROCK.face`. Surfaces: the library's `rock.sandstone.bedded.red` (dressed faces and
  reliefs, family `sandstone`) and `rock.sandstone.navajo` (the raw rims, `navajo`), with the riders' timber, paint,
  hides and rope. The rooms behind them are `kits/interiors/sets/beast-rider-rock.js`.

  The catalog's hand-made copies (`kits/catalog/krator-master-buildings-beast-rider.js`) are no longer on the sheet;
  they stay in the catalog for the builds that read them.

**Textures** (`materials.json`, `tex/`): the library's detail maps on the vertex-coloured, UV-less meshes, triplanar
(the catalog's `krator-furniture-detail.js`), at building scale with Girder's picks (thatch, planks, ironbark, rock,
cloth, rope, leather, cane), and the kit's three surfaces (delivered 2026-10-18): `straw.bedding` (stall floors, hay,
nests: family `'straw/cloth'`), `wood.guano` (the perches and the roost deck: `'guano/wood'`), `ground.stable.yard`
(the paddocks and yards: `'yard/stone'`). The build merges the catalog's packed maps with the kit's into `KF_TEX`; the
catalog itself is unchanged.

**The page**: every building and variant in rows (the kit's own first), with the catalog's dev tools read in place:
the click inspector (`kits/catalog/inspector.js`: select, measure, isolate, cycle variants, audit declared sizes), the
hover inspector (T) and the polygon tool (P). The probe is `window._kit`.

## Taking the buildings into another build

The kit's own: load the catalog's core (and the beast-rider and generic furniture files, for the pieces the buildings
place), then this kit's `src/50-br-mounts.js`, read in place, and build a key with `buildAsset(key, x, z, ry, {variant})`.
The isle demo does it in a sealed closure (`settlements/isle-demo/bundles.py`, `CAT`).

The ports: `towns.bundle()` gives the two sealed towns and their maps (about 9.5 MB, nearly all maps); after the catalog's
core, `src/60-br-ports.js` registers them, and `buildAsset('br_port_...', x, z, ry, {variant, y})` places a copy (its
geometry and materials shared). They keep their towns' own materials (the library look, MeshStandardMaterial): a build
that flattens kit pieces per material, as the isle demo's draw does, takes them as they are. Each building's box is
declared (`w`, `d`, `h` per variant) and holds everything it draws.

## Checks

`verify.py --assert`: the page loads clean; every building builds, every variant; each fits its declared box (1.6 m
allowed, the catalog's rule); every catalog piece placed exists; the kit's three surfaces attach and every map loads;
the inspector, hover and polygon tools are on the page; a negative (a box shrunk by 3 m) is caught. For the rock-cut
pieces: each one's back stays within its declared depth and nothing lies deeper under the wall's face than its embed,
flat and wrapped round a stack (the sheet's last rock row: six pieces on a 9 m stack); every kind is there (seven
facades, twelve tribes, five shrines); their two surfaces attach; a negative (each embed 0.3 m less) is caught. For the ports: each
one's fabric, measured on the sheet, is what its marks drew; and each is its town's building: verify.py loads
`settlements/girder/girder.html` and `settlements/mavs-refuge/mavs-refuge.html` and measures the same mark there
(`window._ports`), the box within 0.05 m on every face and the furniture the same, piece for piece (`--no-towns` skips
this; it loads both towns). After a change to either town's builders, rebuild the town and this kit, and run it.

See `KNOWN_ISSUES.md`.
