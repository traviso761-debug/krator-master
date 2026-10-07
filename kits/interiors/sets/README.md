# kits/interiors/sets/ — the building sets' interiors

One file per building set: the interior every building of that set declares, **as data in the
building's own frame**, keyed by the set's registry key. The sets sheet (`dist/interiors-sets.html`,
built by `build.py`, checked by `verify.py --sets --assert`) plans every body into rooms, furnishes
every room from the master catalog (`kits/catalog`) and checks the **residence rule**: every
residence holds, per unit, at least one bed, one food container and one item container.

| File | Set | Building registry | Furniture cultures |
|---|---|---|---|
| `highlands.js` | Highlands (Republican, Rustic, Tribal) | `settlements/highlands` `HL.def` keys `hl_rep_* hl_rus_* hl_tri_*` | `republican`, `rustic`, `painted` |
| `post-apoc.js` | Post-Apoc | `kits/post-apoc` `defBuilding` keys | `scrap` (poor), `post-apoc` (the high-value salvage) |
| `beast-rider.js` | Beast Rider (Mav's Refuge, Girder) | `kits/catalog/krator-master-buildings-beast-rider.js` `ASSET` keys `br_bldg_*` | `beast-rider` |
| `locus.js` | Locus (the Geomancers' oil town) | `settlements/locus` kit `locus` (`LOCUS-KIT-NOTES.md`) | `yuni-common` / `yuni-court` (geomancer), `eastabyss` (abyssal-desert) |
| `abyss.js` | Eastern Abyssal | `settlements/locus` kit `abyss` (`ABYSS-KIT-NOTES.md`) | `eastabyss` |
| `iziz.js` | Iziz Vernacular (Iziz, and Verge's upper city) | `settlements/iziz` `VERN.def` keys `vern_*` (`src/70-74`, `74b-vern-frontier.js`) | `iziz` (the poor tier through the generic chain) |
| `reedlake.js` | Reed Lake (the floating reed village; Reed's Local) | `settlements/reedlake` `RL.def` keys `rl_*` (the mudhif rooms are kept to where the arch is high enough) | `reedlake` |
| `yuni.js` | Yuni (base kit, as built by Locus and Mungo) | `settlements/locus/src/55-mid-example.js` + `56-mid.js` `ASSET` keys `mid_*` (the six middle-class houses; every variant is an item: `key` for variant 0, `key#n` for n > 0) | `yuni-common` |
| `yuni-town.js` | Yuni base kit, the town keys (civic, trade, poor, rich: Lower Verge; the middle-class houses are in `yuni.js`) | `settlements/locus` `56-mid.js` `57-poor.js` `58-rich.js` `59-civic.js` (the same keys as `settlements/yuni`) | `yuni-poor` / `yuni-common` / `yuni-court` by wealth, `order` (the Historians' chapter house) |
| `zeijani.js` | The Zeijani (`kits/zeijani`; Dhelv): wooden huts and houses, carved rooms (round, rock-walled, their carved furniture as fixtures), the kiva, brewery, alchemist, guard post, catacombs, cistern. Adds the room kinds `kiva brewery lab cell ossuary cistern guardroom`; a carved bed shelf is a fixture with `bed: n`, which the residence rule counts | `kits/zeijani` defs `zj_*` (the carved defs' void plans replace the provisional items in P3) | `zeijani` (its chain: `nomad`, `generic`, `scrap`) |
| `noahs-regret.js` | Noah's Regret's Ancient deck buildings (the grounded floating arcology; Bloody Ruephus's pirates) | `settlements/noahs-regret` defs `nr-anc-*` (`src/56-60`), plus `nr-anc-office-lens-mess` (the mess hall). Adds the room kinds `crew`, `bunkroom`, `mess` | `scrap` (barracks), `post-apoc` (the mess, Ruephus's court tier) |

A world that places one of these buildings at `(x, z, ry)` calls
`IX.sets.instantiate(IX.sets.byName[set].byKey[key], x, z, ry, { baseY })` and gets planned buildings
and registered rooms in world metres, ready for `furnishRoom()` (API.md section 10).

## Writing an item

```js
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;        // rect(w, d, cx, cz)  circle(r, n, cx, cz)  ell(w, d, cw, cd, cx, cz)  offset(poly, dx, dz)
  IX.sets.add({ set: 'highlands', title: 'Highlands: Republican, Rustic, Tribal', culture: 'republican', items: [
    { key: 'hl_rep_house_poor_a', name: 'Log izba', culture: 'republican', wealth: 0.25, types: ['single-family dwelling'], lot: [13, 14],
      bodies: [{ id: 'izba', poly: rect(6.4, 6.8), y: 0.45, levels: [{ h: 2.7 }], wall: 0.28, roof: 'gable', pitch: 1.25,
        doors: [{ at: [3.2, 1.3], w: 0.95 }], program: ['cottage'] }],
      note: 'one log room under a steep gable; the attic is loft space, not planned' },
    { key: 'hl_tri_small_b', name: 'Round bamboo hut', culture: 'painted', wealth: 0.2, types: ['single-family dwelling'], lot: [9, 11],
      rooms: [{ id: 'hut', kind: 'cottage', poly: SH.circle(3.3, 12), y: 0.3, h: 2.4, doors: [{ at: [0, 3.3], w: 0.9, swing: 'none' }] }] },
    { key: 'hl_rep_house_poor_a_reclaimed', name: 'Log izba (reclaimed)', like: 'hl_rep_house_poor_a', wealth: 0.2 },
    { key: 'hl_rep_farm', name: 'Farm field', types: ['farm'], skip: 'open field: nothing enclosed' }
  ] });
})(KratorInteriors);
```

| Field | Meaning |
|---|---|
| `key`, `name` | the set's registry key and its display name, exactly |
| `culture` | the catalog furniture culture (`kits/catalog/README.md` "Furniture by culture"); default the set's |
| `wealth` | 0..1: poor ≈ 0.15–0.3, middle ≈ 0.45–0.6, rich/court ≈ 0.75–0.9 (the catalog's tiers) |
| `types` | the building's type tags as the set declares them. A dwelling type (`single-family dwelling`, `multi-family dwelling`, `dwelling-single`, `dwelling-multi`) makes the item a **residence** |
| `residence`, `units` | override the residence flag; `units` = how many households (a tenement): the rule is checked per unit |
| `lot` | the set's declared `w x d` (sheet spacing only) |
| `bodies` | `planBuilding()` shells (API.md section 7) in the LOCAL frame: `poly` is the OUTER face of the walls; `y` the ground-floor top above the plot (a plinth, a deck on piles); `levels` a count or `[{ h, poly? }]`; `doors` on the footprint edge (`at`, `w`, `hinge`, `swing`); `program` as planBuilding takes it (a name in `IX.BUILDING_PROGRAMS`, kinds for every storey, or kinds per storey); `roof` gable/hip/flat, `pitch`, `wall`, `partition`, `front`, `stair`, `minWidth`, `windows: false` (a container, byre or store the builder draws without openings: no windows, so tall pieces may stand on every wall), and `culture`/`wealth` per body |
| `rooms` | explicit `ROOM()` outlines in the local frame (a door between two of them names the other room as `to: '.<its id>'`, resolved to the placed item's room, and is listed in both, as API.md section 1 says) (a round hut, an open hall, a tent, a bus): `kind`, `poly` (INNER face of the walls), `y`, `h`, `doors`, `windows`, `fixtures`, `level`. **A fixture (a post, a built-in bench, a sitting platform, the builder's own counter) is a WAY IN unless it says `reach: false`**: the placer keeps its front reachable from every door, as for a stair's landing. Give `reach: false` to everything that is not an entrance |
| `key` of a variant | a variant whose rooms differ a lot from variant 0 gets its own item, keyed `<key>#<n>` and named `<name> (variant n+1: ...)` |
| `like` | copy another item's bodies and rooms (a reclaimed or mirrored variant); its own fields override |
| `skip` | **no interior**, with the reason. Use it for open structures (fields, pens, docks, walls, a windmill's open frame) and for **geometry that precludes logical rooms** (a tank lying on its side, a bus too narrow for a bed and a path, a tower whose only floor is a ladder landing). The sheet lists every skip; the kit's author decides what to do |
| `note` | caveats worth keeping (what the plan simplifies, a loft left out, a variant that differs) |

**The frame.** Every kit's builders draw in the same local frame: origin at the plot centre on the
ground, +x right, **+z the front (the door side)**, metres. Read the builder for its body: the wall
block's width (x), depth (z), the floor height (a plinth `F`, a deck on piles), the storey heights,
where its `door()` / `vnDoor` / `ABYSS.vessel(... door)` calls put the doors, how many storeys it
draws. Do not guess from the declared `w x d`: that is the plot, with yards and porches.

**Rooms and programmes.** The room kinds and what each requires are `IX.PROGRAMS` (`src/30-programs.js`):
`hall bedroom kitchen tavern workshop store shrine study library school barracks antechamber`, plus the
sets' own kinds: **`cottage`** (a one-room home: bed, hearth, food container, chest), **`living`** (a
home's main room: hearth, table, seats, food container), **`dormitory`** (beds and a chest: a tenement
floor, a barracks hall), **`shop`** (a counter and goods on display), **`smithy`** (forge and anvil),
**`stable`** (stalls). A bedroom requires a chest, a kitchen a food container. Building programmes
(`IX.BUILDING_PROGRAMS`): `dwelling tavern shop workshop civic temple farm cottage house smithy stable`,
or give the kinds yourself: `['living', 'bedroom']`, `[['shop', 'store'], ['bedroom', 'bedroom']]`.
The first kind of a storey takes the street door (ground) or the stair's top; the planner cuts the
storey perpendicular to its longer side, never under `minWidth` (2.2 m), and fits a straight stair
along an exterior wall (about 6 m of wall for a 3 m storey, else a ladder: `report.warnings` says when
neither fits). A room below about 9 m² seldom holds more than its required pieces.

**The residence rule.** A bed is any `bed`; a FOOD container is a `storage`, `vessel` or `stack` piece
whose catalog role is one of `IX.FOOD_ROLES` (`store` — the kit's jars, sacks and crocks — `larder`,
`pantry`, `bin`, `barrel`, `basket`, `crates`...); an ITEM container is a `storage` piece whose role is
one of `IX.ITEM_ROLES` (`chest`, `cabinet`, `trunk`, `locker`, `coffer`, `wardrobe`...). `cottage`,
`living`, `kitchen` and `bedroom` require them, so a residence whose programme holds a `cottage`, or a
`living`/`kitchen` plus a `bedroom`, passes. The audit counts them over the whole item (every body and
room) against `units`.

## Build, check, look

```
cd kits/interiors && python3 build.py                                          # both sheets
python3 verify.py dist/interiors-sets.html --sets --assert --seeds 2           # the gate for the sets (every set)
python3 verify.py dist/interiors-sets.html --sets --assert --query set=highlands              # one set
python3 verify.py dist/interiors-sets.html --sets --assert --query "set=highlands&only=hl_rep_house_poor_a,hl_rep_tavern_a" --verbose
python3 verify.py dist/interiors-sets.html --sets --out shots --query set=post-apoc --rooms   # a screenshot of every building
# a key with a '#' (a variant item, br_bldg_girder_house#1) goes in a query as %23: only=br_bldg_girder_house%231
python3 verify.py dist/interiors-sets.html --sets --eval "()=>window._interiors.items.map(E=>E.item.key+': '+E.inst.rooms.map(R=>R.kind+' '+R.area.toFixed(0)+'m2').join(', '))"
```

The sheet: one band per set, one lot per building, the planned bodies drawn by `51-building.js` (cut
away, storey selector), explicit rooms in a shell. The label under each building says its rooms,
pieces and residence counts (red when the rule fails); a skipped building's label says why. Keys as
the demo: **O** outlines, **G** walk grid, **C** cut-away, **L** storey, **T** hover tags, **P**
polygon tool, **R** next seed.

`verify.py --sets --assert` runs, for every room: inside, height, overlap, door, clearance, reach,
required, determinism, builds, measured-inside, measured-height; for every body: the building audit and
plan determinism; **residence** for every residence; the light budget; and prints the **no interior**
list for the kit authors. A required piece the catalog lacks for the room's culture and every fallback
(`none-in-catalog`) is reported, not failed: it is catalog work (kits/catalog), listed in
`KNOWN_ISSUES.md`.

## Geometry that precludes rooms

Each set file's `skip` reasons are the list for the kit's author. The build prints it
(`verify.py --sets`, "no interior"). Nothing here changes a kit's geometry: the sets are a reading of
what the builders draw, and where a reading was not possible the item says so and moves on.
