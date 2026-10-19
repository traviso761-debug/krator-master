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
the inspector, hover and polygon tools are on the page; a negative (a box shrunk by 3 m) is caught. For the trades and
the houses: each carries a catalog job or a role; each variant places 4+ catalog pieces; the rock-backed longhouse draws
nothing behind its back plane and reaches it; every census trade (`IS_TRADES`, read from
`kits/islanders/src/68-is-trades.js`) has a row in `BR_TRADES` carried by Beast Rider buildings of the page or `na`
with a reason, and two negatives (a row stripped of its buildings, a row dropped) are caught. For the ports: each
one's fabric, measured on the sheet, is what its marks drew; and each is its town's building: verify.py loads
`settlements/girder/girder.html` and `settlements/mavs-refuge/mavs-refuge.html` and measures the same mark there
(`window._ports`), the box within 0.05 m on every face and the furniture the same, piece for piece (`--no-towns` skips
this; it loads both towns). After a change to either town's builders, rebuild the town and this kit, and run it.

See `KNOWN_ISSUES.md`.
