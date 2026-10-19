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
- **The sedentary trades and the larger houses** (2026-10-19; owner: "sedentary beast rider versions of the current
  islander trades; although the beast riders do not have electricity. we may want some larger housing options"):
  34 keys, 70 variants, in the same vocabulary (`src/51-54`, helpers `brt*` in `51-br-trades.js`). No electricity:
  fire is wood and charcoal, light is the catalog's oil lanterns and glow fungus, and what turns, turns by beast (the
  whim, `brtWhim`: the mill, the bark mill, the bellows, the mine's winding, the landing's crane) or by water (the
  mill's wheel). Each building places the catalog's beast-rider and generic furniture (4+ pieces a variant) and
  carries `job` (FURN_JOBS) or `role`.
  - **Crafts and food** (`51-br-trades.js`): `br_bldg_bakehouse` (bakers: the bake house and oven shed; the bakers'
    hall), `_butcher` (the shop and smokehouse; the slaughter yard and its hoist), `_mead_hall` (brewers, innkeepers
    and servers: the mead hall; the brewhouse), `_tannery` (the pit shed; with a beast-turned bark mill), `_weaver`
    (weavers and dyers: the weaving house; the dye works), `_smithy` (the forge; the great forge, its bellows worked by
    a beast), `_potter`, `_ropewalk` (craftsmen), `_healer` (the house of healing; the beast-healer's sling stall),
    `_shophouse` (the shop under the home; the double), `_market_hall` (the hall; the pavilion).
  - **Works, stock and the water** (`52-br-trades-b.js`): `_storehouse` (the raised store; the tack and feed store),
    `_granary` (the rice barn on its rat-stones; the row of cribs), `_mill` (the beast mill under its round roof; the
    water mill), `_hauling_yard` (industrial workers: the timber and the stone haulers' yards), `_beast_stage` (Voth's
    elephant bug station, ridden: the carrier-beast mounting stage), `_beetle_pen` (the Staghorn's beetle house and
    run; the breeding shed), `_fungus_house` (mushroom growers: the dark house; the cellar), `_mine_head` (the adit;
    the shaft and its whim), `_quarry` (the face; the masons' yard), `_canoe_shed` (shipwrights, coast guard: the
    voyaging canoe's shed; the war-canoe shed), `_river_landing` (dockers, bargemen, fishers, ferrymen: three; the
    Islanders' harbour frame, land at local z > 0, the jetty over z < 0).
  - **Civic, guard and signal** (`53-br-trades-c.js`): `_riders_inn` (innkeepers and grooms: the inn round its stable
    yard; the roadside inn), `_barracks` (a Wing's barracks with the claw over its door; the roost barracks),
    `_school` (the lore house; the riding school's ring), `_temple` (the hall of the five shrines; the funerary court
    with its skull poles), `_toll_house` (customs: the toll house and its boom; the tally hall), `_watch_tower`,
    `_beacon_tower` (the fire beacon; the signal mast).
  - **The larger houses and the farmhouse** (`54-br-houses.js`): `br_bldg_great_house` (a clan's great-house: two
    storeys, the mounts stalled under, a gallery), `_chief_compound` (the hall-house round its court, the wings, the
    gate; envoys lodge in its guest wing), `_rock_longhouse` (a block built against a stack where land is tight: two or
    three storeys, its back wall flat, `against: 'back'`: nothing behind local z = -d/2), `_terrace_row`, and
    `_farmhouse` (the farmhouse with its yard, crib, beast shed, sty and coop; the courtyard farm; the paddy farm on
    piles): Pinnacle Rock's twelve farmhouses in the farm ring.
  - **`BR_TRADES`** (`51-br-trades.js`, plain data like the Islanders' `IS_TRADES`): every trade of the Voth city's
    census, the Beast Rider keys that carry it (the kit's own and the ports), or `na` and why: only the power house
    (no electricity). The elephant bug handlers are carried by the carrier-beast stage, the beetle herders by the
    Staghorn's beetle pen, the mushroom growers by the fungus house.
  - **Centred frames.** Each variant's measured footprint centre is put on the origin by `BRT_CENTRE` (the build's
    first call, `brtCentre(F)`: `F.shift`); after a change that moves a builder's extent, remeasure it on the sheet
    (`window._kit.built`, `min` and `max`) along with its declared box.
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

**The tent set** (`src/70-79`, 2026-10-19; the owner: "a tent-based nomadic/semi nomadic set, still consistent with the
style, inspired by yurts and these types of barrel-shaped tents, that has the same trades as scyvoi and appropriate pen
and animal trainer structures"): the bands' camps, 28 keys, every one with 2 or 3 variants, a declared box per variant
(guy ropes and stakes inside it) and `tags` (`job`, `role`, `style`, `tribe`). Its two main forms are the owner's two
reference images, in Girder's palette with its beast-head finials and the claw: the **hide dome** (a squat dome about as
wide as tall, a patchwork of pale cream hides in gores and courses, a skirt of spotted fur with a torn hem, a bound-leather
crown ring or an ochre sunburst cap, a short mast with a plank sign board or a banner with a gilt claw on a cross-bar,
painted claw and spiral-claw sigils, guy ropes to black iron hook stakes; a door, or a trader's wide cut-away front) for
the dwellings and the traders, and the **barrel pavilion** (a lower drum of orange cloth panels between poles, a sloping
cream and red shoulder band with chevrons and diamonds, a narrower clerestory drum, a flat pale roof disc, the poles over
both rims with gilt finials, striped awnings with hanging diamonds, pennant strips, ladders, an arched door under a fringed
valance) for the chiefs, councils, shrines and large trades.
- `70-br-tent-kit.js`: the builders (`brtDome`, `brtBarrel`, `brtGuy`, `brtAwning`, `brtPennant`, `brtCrown`, `brtSigil`,
  `brtLattice`, `brtCorral`, `brtRail`, `brtThorn`, `brtVault`, `brtLeanTo`); small parts merged per colour (`brtBatch`),
  so a tent is tens of meshes. Every varying choice is `KRAND.hash` of the thing's own indices (`brtU`; core/rand leads
  the script).
- `71-br-tents-dwell.js`: `br_tent_dome_small` (poor), `_dome_family`, `_dome_double` (two domes and a vestibule),
  `_chief` (the chief's barrel pavilion, the skull throne), `_council` (a ring of seats round the speaker's hearth),
  `_shrine` (the Winged Ones; the Deep Root).
- `72-br-tents-trade.js`: every trade the Scyvoi camp has (`kits/scyvoi/src/48-tt-trade.js`), its `job` or `role` in
  `tags`: `br_tent_shaman` (shaman and healer; a potion seller's), `_smithy` (a hide dome on an open lattice; an
  armourer's), `_hidemaker` (a ridge awning of hides: tanning), `_trader` (the cut-away dome, a plank counter, ledgers
  and a lamp; the band's supply tent), `_tackmaker` (the riders' cartwright: saddle trees, a howdah on trestles, lance
  shafts: carpentry).
- `73-br-tents-pens.js`: pens and trainers sized from the mounts (kits/fauna): `br_tent_corral` (rope and poles for the
  runners; log rails for the great beasts; a low beetle pen with rotting logs: herding), `_lunge_ring`, `_hitch_line`
  (tethering), `_perch_frame` (the quetzals' great perch log, the wingclaws' two-level frame, the nightwings' hanging bar
  under a shade), `_feed_shelter`, `_training_yard` (jump rails, weaving poles, a ramp; a lance course), `_breaking_pen`
  (a snubbing post), `_kennel_row` (raptors), `_crawler_shed` (longcrawlers).
- `74-br-tents-bands.js`: the Dragonfly's `br_tent_pond_nets` (a frame of nets over a pond's reed margin) and
  `_net_house`; the Spider's `_spider_grove` (a fenced grove: climbing frames, silk lines, orb webs), `_silk_house`,
  `_spinning_shed`; the Mammoth's `_mammoth_paddock` (a byre of hides on log posts).
- `75-br-tents-bounds.js`: `br_hedge_thorn` (cut thorn on stakes: a run, a gate) and `br_fence_rail` (a pasture's split
  rails: a run, a field gate), parametric: `buildAsset(key, x, z, ry, {variant, span})`, local +x along the line.
- `79-br-camp.js` (`[G data]`): `BR_CAMP`, what a band of each of the twelve tribes pitches on its grounds (`upper` on
  the mesa top: the flyers' bands only there, about nine tents, perch frames and feeding shelters; `lower` on the floor:
  the camp and its pasture inside the band's thorn hedge; the Dragonfly, Spider and Mammoth only there), each entry
  `{key, n, v}`, with the tribe's mount, its size and its banner colour; `brcGround`, `brcKeys`, `brcCount`; and
  `BR_RUN(pts, {key, closed, gates, seed})`, which cuts a boundary polyline into hedge or fence pieces.

Another build takes the set as it takes the mounts: the catalog's core and the beast-rider, generic and generic goods
furniture files, `core/rand/08-core-rand.js`, then `src/50-br-mounts.js` and `src/70-79`, read in place.

**Textures** (`materials.json`, `tex/`): the library's detail maps on the vertex-coloured, UV-less meshes, triplanar
(the catalog's `krator-furniture-detail.js`), at building scale with Girder's picks (thatch, planks, ironbark, rock,
cloth, rope, leather, cane), and the kit's three surfaces (delivered 2026-10-18): `straw.bedding` (stall floors, hay,
nests: family `'straw/cloth'`), `wood.guano` (the perches and the roost deck: `'guano/wood'`), `ground.stable.yard`
(the paddocks and yards: `'yard/stone'`); and the tents' four (2026-10-19): `tenthide` (cloth.hide.canopy: the domes'
hides), `pelt` (hide.pelt.cat: the fur skirt), `canvas` (cloth.canvas.tent: the pavilions), `lash` (wood.lash: lashed
poles). The cut thorn has no set (`foliage.thorn.cut` is owed: core/materials/PROMPTS-NEEDED.md). The build merges the catalog's packed maps with the kit's into `KF_TEX`; the
catalog itself is unchanged.

**The page**: every building and variant in rows (the kit's own first), with the catalog's dev tools read in place:
the click inspector (`kits/catalog/inspector.js`: select, measure, isolate, cycle variants, audit declared sizes), the
hover inspector (T) and the polygon tool (P). The probe is `window._kit`.

## Taking the buildings into another build

The kit's own: load the catalog's core (and the beast-rider and generic furniture files, for the pieces the buildings
place), then this kit's `src/50-br-mounts.js`, read in place, and build a key with `buildAsset(key, x, z, ry, {variant})`.
The isle demo does it in a sealed closure (`settlements/isle-demo/bundles.py`, `CAT`). The trades and the houses
read `src/51-br-trades.js` to `src/54-br-houses.js` in place after it, in that order (they draw with its helpers,
`brm*`, and 51's, `brt*`); a city layout takes their footprints from each ASSET's `variantDims` and their trades from
`BR_TRADES`.

The ports: `towns.bundle()` gives the two sealed towns and their maps (about 9.5 MB, nearly all maps); after the catalog's
core, `src/60-br-ports.js` registers them, and `buildAsset('br_port_...', x, z, ry, {variant, y})` places a copy (its
geometry and materials shared). They keep their towns' own materials (the library look, MeshStandardMaterial): a build
that flattens kit pieces per material, as the isle demo's draw does, takes them as they are. Each building's box is
declared (`w`, `d`, `h` per variant) and holds everything it draws.

## Checks

`verify.py --assert`: the page loads clean; every building builds, every variant; each fits its declared box (1.6 m
allowed, the catalog's rule); every catalog piece placed exists; the kit's three surfaces attach and every map loads;
the inspector, hover and polygon tools are on the page; a negative (a box shrunk by 3 m) is caught. For the tent set:
every Scyvoi trade (read from `kits/scyvoi/src`) has a Beast Rider tent with that job or role (negative: the smithy
taken away); every tribe's `BR_CAMP` grounds name keys and variants that exist and keep the plan's rules (negative: a
key that does not exist); `BR_RUN` lays a closed boundary whole. For the rock-cut
pieces: each one's back stays within its declared depth and nothing lies deeper under the wall's face than its embed,
flat and wrapped round a stack (the sheet's last rock row: six pieces on a 9 m stack); every kind is there (seven
facades, twelve tribes, five shrines); their two surfaces attach; a negative (each embed 0.3 m less) is caught. For the trades and
the houses: each carries a catalog job or a role; each variant places 4+ catalog pieces; the rock-backed longhouse draws
nothing behind its back plane and reaches it; every census trade (`IS_TRADES`, read from
`kits/islanders/src/68-is-trades.js`) has a row in `BR_TRADES` carried by Beast Rider buildings of the page or `na`
with a reason, and two negatives (a row stripped of its buildings, a row dropped) are caught. For the ports: each
one's fabric, measured on the sheet, is what its marks drew; and each is its town's building: verify.py loads
`settlements/girder/girder.html` and `settlements/mavs-refuge/mavs-refuge.html` and measures the same mark there
(`window._ports`), the box within 0.05 m on every face and the furniture the same, piece for piece (`--no-towns` skips
this; it loads both towns). After a change to either town's builders, rebuild the town and this kit, and run it.

See `KNOWN_ISSUES.md`.
