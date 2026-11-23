# kits/xanadu: the Xanadu kit

The architecture of the southern Sultanate of Xanadu: Tibetan massing (battered whitewashed walls, flat roofs, the maroon
twig band, gilded pavilions) with Indian, Turkish and Persian detail, gold on everything wealthy, religious or civic.
Moved unchanged from `settlements/xanadu/src` on 2026-11-03 (MODULARITY-PLAN.md step 4): it is the culture's building kit,
not a settlement's layout. `settlements/xanadu/README.md` describes the buildings, the packages and the sheet.

| Files | What |
|---|---|
| `src/70-xa-tex.js`, `71-xa-mat.js`, `72-xa-helpers.js` | the foundation: the painted palette and textures, materials and kit items, the helpers (the battered mass, the cumba, the roofs) |
| `src/71c-xa-openings.js` | the real doors and glass: `xnDoorway`, `xnPane`, `xnRoom` (below, "Doors and glass") |
| `src/74-xa-dwell.js` ... `81-xa-public.js` | dwellings, trade, farms, sacred, the palace, guilds, military, public buildings |
| `src/82-xa-hill.js` ... `87c-xa-erewhon.js` | the later packages: the hillside, the Turkish houses, the Grand Baths, water and gardens, the vizier's, the spicer's, the Andean houses, Erewhon's pieces |
| `src/88-xa-dress.js`, `89-xa-trades.js` | the dress (palette, painted motifs, the paint filter), the trades table (`XA_TRADES`) |
| `kit_bundle.py` | the kit sealed for another world's page as `XAK` (Longsong's valley villages take it) |

`xanadu.py` names the files (`FOUNDATION`, `BUILDINGS`, `FILES`) and what they draw through. `PORT.md` has their port tags.

**What it draws through.** The Ancients core (`kits/ancients/src`, `core/materials`) and the Iziz Vernacular's materials and
helpers (`kits/iziz-vernacular`). Its library bind (`88y-xanadu-matlib.js`) and its texture pack (`materials.json`, `tex/`) are
still Xanadu's: they move with step 4's matlib item. Its plants come from the Vale of Xanadu biome (`biomes/xanadu`) where a
page loads it (`86b-xa-plants.js`), and fall back to the kit's own shapes without it.

**Doors and glass** (2026-11-03; the owner: "remove all dark voids and make all windows, doors and portals actual doors or
windows that have transparency"). The kit takes the Vernacular's openings (`kits/iziz-vernacular/src/69e5-iziz-openings.js`)
and core/door's `10-core-door.js` and `20-core-glass.js` (KDOOR, KGLASS), read in place (`xanadu.py` `OPENINGS_VERN`, `DOOR`),
so its `vnDoor` is a shut leaf registered in KDOOR and its `vnWin` glass over the room's back, and `71c-xa-openings.js` draws
the kit's own the same way: a gate or doorway drawn as a dark plate is a leaf (two for a wide one: `xnDoorway`), a window or a
shop front glass or a lit pane in front of the room card (`xnPane`), an unglazed opening (a slit, a vent, the oriel's inside, a
blind arch, an iwan's vault, a tent's flap) the room's dim back (`xnRoom`); the arch heads and niches (`xArcDark`) take that dim
back, and the Grand Baths' coloured glass is transparent (core/door's stained kind). Every body of the kit is solid, so every
door is LOCKED, with an id from its def, its placement and its number. A door keeps the old threshold step (69c's). Left dark on
purpose, as they are not openings: wells, the mine shaft, ovens and kilns behind their embers (`vDarkB`). `kit_bundle.py` carries
core/door's 10 and 20 and 69e5 into `XAK` (the kit's own KDOOR; no walk: a proto's doors are in `userData.doors`, locked).

**Opt-in pieces** (2026-11-16, `extra/`). New pieces that only one page takes so far wait in `extra/`, not `src/`, so no
other page of the kit changes until the next all-builds rebuild moves them into `src/` (TODO.md, "Ride along with the next
all-builds rebuild"). A page takes one through its kit.json `"external"` (`settlements/pher` takes all but 88f, `settlements/kirstabal` 88d and 88f);
the kit's own sheet takes none of them, so they have no sheet rows until the rebuild moves them into `src/`:

| File | What |
|---|---|
| `extra/88c-xa-caravanserai.js` | `xa_caravanserai` (the owner, 2026-11-16: "build xanadu one"): a 48 m court of two-storey battered ranges, the stables' arcade, a gate block with an open iwan, four corner towers, the fountain court; v0 wash and gold, v1 earth and plainer |
| `extra/88d-xa-lakecraft.js` | vessels (core/tags class `vessel`, the Ring Sea's tags; 2026-11-17): the lake craft owed by `core/simulation/PROPOSAL-XANADU.md` 2a: `xa_dugout` (the cayuco; empty, with its fisher, beached), `xa_launch` (the lancha; under sail, furled), `xa_lake_barge` (the cargo barge; sail set, brailed) |
| `extra/88e-xa-stall.js` | `xa_stall`: a trestle stall under a cloth awning, four trades (cloth, cacao and fruit, pots and baskets, fish and salt) |
| `extra/88f-xa-harbour.js` | the lake harbour (2026-11-17, `settlements/kirstabal` takes it): `xa_harbour_quay` (a continuous 34 m quay: coursed ashlar, weed line, coping, bollards, rings, fenders, water stairs; a jib crane, a cargo stack or a tally shed), `xa_mole_run` (the breakwater, `o.len` long: a harbour quay face, a parapet, boulder armour), `xa_harbour_warehouse`, `xa_drydock` (flooded, 88d's cargo barge in it when the page has 88d), `xa_slip`, `xa_river_span` (a segmental arch bridge in 26 m pieces; v 1 the abutment), `xa_monastery_white` (the monastery under a lime-white paint filter), `xa_garden_wall` (a garden square's coped wall; v 1 a gate with an arched head), the wind-catchers (`<house>_badgir`: seven common houses with a badgir at the back corner, `XH_BADGIR`) |
| `extra/88g-xa-works.js` | the works the Xanadu build-out's lake towns, mines and villages want (2026-11-17, `settlements/xanadu/BUILD-OUT.md` 4a, wave 0.1; core/hamlet's focus records name these keys; `settlements/pher` takes it, places none yet): `xa_kiln_yard` (bottle kilns, v 1 a climbing kiln), `xa_dye_works` (vats, coppers, drying lines; v 1 indigo), `xa_loom_house` (a long hall, the clerestory, looms in the portico), `xa_saffron_house` (the louvred loft over the sorting floor), `xa_apiary` (hive walls of log or clay hives, the honey house), `xa_reeling_house` (silk: the hearth range, basins, reels; v 0 the undershot wheel, v 1 treadles), `xa_mat_shed` (reed racks, the weaving shed), `xa_quarry_yard` (three cut benches, the masons' yard, the sheerlegs), `xa_sulfur_works` (the hot spring, crust beds, the melting shed), `xa_customs_house` (v 0 on a quay, v 1 a road's toll house), `xa_fishponds` (stone pens in the shallows, the lake at local y 0, sluices), `xa_slipway` (the twin of 88f's `xa_slip` with its timber yard, steam box and saw pit: needs 88f), `xa_mine_head` (the adit, ore and spoil, the winze, the tally hut; v 1 opal), `xa_placer_sluice` (the sluice box down the bank, the rocker, tailings), `xa_wayside_shrine` (a chorten, a niche pillar, a mani wall). Seeds 34601-34799. Not a third caravanserai: `xa_serai` (87k, 46 m) and `xa_caravanserai` (88c, 54 x 56 m) stay, the two sizes |
| `extra/88h-xa-mine-works.js` | the mines' works (2026-11-23, `settlements/xanadu/WORKS-PLAN.md` W1; `settlements/xanadu-works` takes it with 88g, whose helpers it uses): `xa_stamp_mill` (24 x 22: the ore bins on the bank, v 0 two batteries of five stamps, v 1 one in a rubble mill house, the cam shaft to the overshot wheel and its flume, the copper-plated tables, the launder, tailings, the amalgam room) and `xa_sorting_shed` (30 x 11: open-sided on posts, the sorting benches with the potch broken for colour, the strong room at its east end, the potch heaps; v 1 an earth back wall). Seeds 34851-34862 |
| `extra/69dz-ix-xanadu-extra.js` | the interior set `xanadu-extra`: the caravanserai's five ranges (the common room, its kitchen and the stores below, the travellers' rooms above). It joins `kits/interiors/sets/xanadu.js` with the pieces |

**Hollow walls and interiors** (2026-11-09). The kit's interior set is `kits/interiors/sets/xanadu.js` (one item per def:
the dwellings, trades, farms, sacred buildings, guilds, military, baths, the Turkish and Andean houses; the open pieces
skipped with their reasons). Its pages (`settlements/xanadu`: the sheet and Erewhon) take it with `?interiors=1`
(`settlements/xanadu/src/89y-xa-interiors.js`): the rooms planned and furnished from the catalog (`xanadu`, its chain
`eastabyss`, `generic`), their floors, walls and stairs in core/walk, and the bodies hollow through the Vernacular's auto
bodies (`kits/iziz-vernacular/src/69e6-vern-autobody.js`; `xanadu.py` `HOLLOW_VERN`): a battered block (`xnWall`) or
a plain one that holds a storey of an item's body is four walls cut at the doors and windows, its doors unlocked leaves into
the rooms. A battered or stepped stack is planned INSET (every storey on the footprint they all share), so its walls'
lean never reaches a room. `kit_bundle.py`'s `XAK` (Longsong) does not take it.

**The citadel: built by the citadel sessions** (2026-11-09; the Pleasure Domes `-pleasuredome`, the rest `-citadel`). The Sultan's Palace (`xa_palace`), both Pleasure Domes (`xa_pleasure_dome`,
`xa_pleasure_dome_bay`), the Grand Vizier's palace (`xa_vizier`) and the palace gate (`xa_palace_gate`), the citadel of
`settlements/xanadu/citadel/BLUEPRINT.md`, are not planned by this set: their items are skips that say so, and this work
left their builders unchanged.

**The Pleasure Dome and the black-and-white pattern system** (the owner's references, 2026-11-09:
`settlements/xanadu/citadel/refs/pleasure-dome/STYLE.md`; the build's record is `settlements/xanadu/citadel/PLEASURE-DOME.md`).
`xa_pleasure_dome` is the harem palace of the blueprint's sheets E3 and E4 on its 105 x 110 m precinct, hollow and walkable,
dressed in two stones and gold. Four fragments:

| File | Tag | What |
|---|---|---|
| `78a-xa-pattern-data.js` | [G data] | `XPAT`: the stones, every pattern's sizes, the dress of each kind of room (STYLE.md rule 4), the arch curves (`xpArchCurve`), the Greek key |
| `78b-xa-pattern.js` | [draw] | the patterns as materials (WORLD-ALIGNED: a fragment's stone comes from where it is, so courses run unbroken round walls, piers, drums and columns), their kit items, and the helpers: `xpBox`, `xpCol`, `xpStone`, `xpVoussoirs`, `xpSpandrel`, `xpOrders` (receding checkered orders), `xpTunnel`, `xpGoreDome`, `xpShellDome`, `xpRings`, `xpRunner` (Greek key), `xpSqHole`, `xpBalustrade`, `xpChandelier`, `xpPlanter`, `xpTable` |
| `78c-xa-dome-plan.js` | [G data] | `XPDOME`: the rooms and openings as records in the def's frame; `xdomePlan()` works every wall out of them (a segment between two rooms, its openings, the windows an outside wall gets) |
| `78d-xa-dome-in.js` | [draw] | `xdomeBuild`: the walls as two skins (each side its own room's pattern, whitewash and the gold frieze outside), floors and ceilings, the Hall of Feasts, the checkered north door, the stairs, the baths, the courts; core/walk floors, strips and blocks, core/door leaves (unlocked), KGLASS panes; `XA_CUT`, the cutaway's unit |

The patterns (`XPAT.pat`): `band` (courses up a wall; stripes on a floor), `bandFine`, `checker`, `chevron`, `pave` (crazy paving
with gold joints), `op` (the op-art wallcovering), `key` (the Greek-key runner, a strip in its own frame) and `solid` (one stone
per instance: white, black or gold by the instance colour, `xpInk`). Any builder may use them: `xpBox('band', x, y, z, w, h, d)`
is a banded block wherever it stands. The veining of both stones is one library set (`materials.json` family `xMarble`); the
two proper marbles are owed (`core/materials/PROMPTS-NEEDED.md`, section 41). The furniture is the set item's
(`kits/interiors/sets/xanadu.js`: explicit rooms, with `?interiors=1`), still in the court set's own colours.
`xpBalance(b)` sets the share of black a builder draws with (`XPAT.balance`: the citadel's Dome 0.667, black over white; the
Dome of the Bay 0.34, white over black: `xbayBuild` in 78d makes its drum a hollow rotunda under a dome of turquoise and
glass gores). The Domes' doors are the kit's only UNLOCKED ones: the builder declares them (`window._hollowDoors`), and the sheet's `doors` check
(`kits/iziz-vernacular/sheet_verify.py`) asks every other door to be locked.

**Erewhon's citadel, Moorish and Mughal** (2026-11-09; `settlements/xanadu/citadel/refs/citadel/STYLE.md`, the owner's five
references). Everything in the citadel but the two Pleasure Domes is new defs, hollow and walkable, room by room on the
blueprint: `xa_cit_palace`, `xa_cit_vizier`, `xa_cit_treasurer`, `xa_cit_chancellor`, `xa_cit_mines`, `xa_cit_envoys`,
`xa_cit_barracks`, `xa_cit_temple`, `xa_cit_kitchens` (the older `xa_palace` and `xa_vizier` stay for the sheet and other
worlds). Three files, listed apart (`xanadu.py` CITADEL, so XAK, Longsong and kits/construction are unchanged):
`78l-xa-moorish-data.js` ([G data] `XMOOR`: arch outlines pointed, horseshoe and cusped; muqarnas hood and cornice cells;
star-polygon ceilings; the pointed barrel), `78m-xa-moorish.js` (the materials, each wired in `materials.json` to the texture
it is owed with a library stand-in: settlements/xanadu/KNOWN_ISSUES.md; the instanced items; the helpers `xmArchHead`,
`xmMuqHood`, `xmMuqCornice`, `xmStarCeiling`, `xmVault`, `xmJali`, `xmBalustrade`, `xmColumnPair`, `xmIwan`, `xmBasin`,
`xmFountain`, `xmRill`), `78n-xa-citadel.js` (`xcPlan`: walls, skins, arched doors with unlocked core/door leaves, windows with
jali and KGLASS's clear pane, floors, ceilings, courts, flights and the Ramp of the Sultan, all drawn from the item in
`kits/interiors/sets/xanadu-citadel.js`, whose rooms the furnisher and core/walk take; each building's massing). A world takes
them with `kxa.paths(kxa.CITADEL)` and the interior set `xanadu-citadel`. The style per room is the item's `style` and `ceil`
(the set file's header). Screenshots and how they compare to the references: `settlements/xanadu/citadel/PALACES.md`.
A fourth file, `78o-xa-golden-way.js` (2026-11-10; named in `build.py` and `settlements/xanadu/build.py` beside CITADEL, not in
`xanadu.py`, which Longsong's build reads), is the Golden Way, `xa_cit_golden_way`: the court that descends from the
Pleasure Dome's North Door to the palace's gate iwan and postern (`XGW`, `xgwPlan` as plain records, the builder, `xgwReach`),
and the Dome's North Door moved to its north face for it (`XPDOME` patched where the citadel's files load; the vest's barrel cut
back while the Dome builds; `o.gw` drops the north garden wall's east run). Erewhon places it (`xgwSite`); the sheet draws it
alone at Erewhon's height: `settlements/xanadu/citadel/PLEASURE-DOME.md`, "The Golden Way".
A fifth, `87k-xa-lake-trades.js` (2026-11-16, for Kirstabal: `settlements/kirstabal/PLAN.md`), is opt-in the same way: not in
`xanadu.py`, read in place by name (`settlements/kirstabal/kit.json` "external"), so no other page changes. The lake's trades:
`xa_serai` (the caravanserai: a walled court of two-storey ranges round a well, an iwan gate, corner towers), `xa_latex_house`
(the White Monastery's: open drying halls of racks round a whitewashed court, the sealing room, the white banner), `xa_tea_factory`
(the louvred withering lofts, the rolling shed, the trays), `xa_fermentary` (cacao sweat boxes and drying floors) and
`xa_fish_racks` (a fishing village's racks and smokehouse: core/hamlet's fishing works on the Xanadu row, as Kirstabal's
`KS_RING.fishingRow` extends it). A world that wants them lists the file; folding it into `FILES` changes every page that
takes the kit (TODO.md, "Ride along").
Its interiors are `87k1-xa-lake-rooms.js`, opt-in with it: the interior set `xanadu-lake` (the serai's four ranges, the
tea factory's ground storey, the latex house's sealing room; the fermentary and the fish racks skipped as open), added with
`KratorInteriors.sets.add` when the page carries the interiors core, so Xanadu's `?interiors=1` mode hollows and furnishes
them (Kirstabal, K5). It belongs in `kits/interiors/sets/` and moves there with the next rebuild of the interiors sheet.
A third, `87k2-xa-slate-wall.js` (2026-11-17, Kirstabal's town wall after Chiang Mai's: the owner), is opt-in the same way:
`xa_slate_wall` (a run of curtain, `o.len` long, merlons with stepped peaks and a loophole under each), `xa_slate_gate`
(Tha Phae's: two tall stepped pillars either side of the road, the leaves open, `o.pass`), `xa_slate_bastion` (the corner
bastion) and `xa_slate_tower` (the buttress at a turn), on the items `xSlateB` and `xSlateDB` (`MAT.xSlate`, `MAT.xSlateD`:
a page binds a library family of those names; Kirstabal's is `brick.dark` tinted slate until `wall.slate.coursed` lands,
`core/materials/PROMPTS-NEEDED.md` section 66). They draw along core/city's wall records (`KCITY.grid.wall`).

**Footprints** (2026-11-10; the owner: "the garden pieces ... stick out way over what their footprint is supposed to be").
A def's footprint is its `w x d`, its lot: the sheet spaces sites by it, Erewhon's garden grid and blocks set 8 m and 16 m
tiles side by side by it, and `XAK.dims()` hands it to another world. `fw x fd` is only the slope footing under the body.
Everything a def draws stays on its lot, foliage included: a plant's crown is fitted to the room between its trunk and the
lot line (`xaRoom`, `72-xa-helpers.js`): the kit's own crowns (`xnTree`, `xnCypress`, the garden palm `xnXPPalm`) shrink to
it, and `xaPlant` (`86b-xa-plants.js`) reads the crown the Vale biome is about to draw (its first three draws, replayed from a
seed set on the biome's own stream) and scales the whole tree to fit, reporting an error if the biome ever draws past it.
`node kits/xanadu/tests/test-footprints.js` (a `tools/test_all.py` step) seals the kit as `XAK` (with the opt-in `extra/88*.js` since 2026-11-17: the test wraps `kit_bundle.files`, so no sealed page changes; `--no-extra` leaves them out), builds every def and variant
alone and measures every instance's box against its lot (0.25 m tolerance, townsfolk left out): a garden or water piece
past it fails; any other def past it must be listed in the test's `KNOWN` with its overhang (`KNOWN_ISSUES.md`, "Defs past
their lot") and must not grow.

**The Xanadui fort** (2026-11-16, `settlements/strongwall/PLAN.md` section 5, its steps F1-F4). One fort for the Sultanate:
Strongwall, the Marches' watch forts, the gate works of a town, the watch line's posts, and later the House of the Tempest
round the Qiblai kit's violet monastery. It is planned before it is drawn:
- `src/80f-xa-fort-data.js` (`[G data]`, `XFORT`): `XFORT.plan({size})` turns a size (`watch`, `march`, `gate`; a watch fort
  may take a convex `outline`) into records (curtains with their outward normals, towers with the point on the wall the rules
  read and the centre they are drawn at, gates, buildings, stairs, guns, the beacon); `XFORT.check(P)` holds the rules (a
  tower at every corner, towers at most the size's gap apart, the gate on an edge, every wall walk joined to a stair, nothing
  overlapping, the keep 6 m clear of the curtain); `XFORT.damage(P, state, seed)` hashes the damaged and ruined states from
  core/rand; `XFORT.walks(P, D)` lays the wall walks out (F4b, 2026-11-23): between the towers and gatehouses, never through
  them, a flight up the walk onto each kept tower it meets and that tower's top, the stairs from the ward on plain walk (more
  added where a piece had none), and which pieces a stair reaches. `node kits/xanadu/tests/test-fort.js` tests it, each rule
  and the walks' layout with a negative.
- `src/80g-xa-fort.js` draws it: four defs in the family *Forts* (`xa_fort_watch`, `xa_fort_march` (Strongwall),
  `xa_fort_gate`, `xa_fort_post`), each with `o.v` 0 kept, 1 damaged, 2 ruined. The gold is only the main gate's pavilion and
  the keep's chapel (the owner, 2026-11-16). A ruin's rubble is a core/terrain `KRUBBLE` heap (decoration to core/ruins); fallen
  pieces are seated on their lowest points. A standing fort's wall walks, the flights onto its towers, their tops, its stairs
  and landings are on core/walk (the parapets open where a flight reaches them: `xfCrenel`).
  A placement may give `o.outline` and `o.gateEdge` (a watch fort fitted to its ground: `XFORT.plan(o)` is drawn), `o.seed` (its
  look) with `o.damageSeed` (its damage, so the look holds through the three states); a post `o.fort` and `o.rota`
  (`window._xaPosts`). A damaged fort's lost guns lie wrecked inside (`xfGunWreck`). `KNOWN_ISSUES.md` has the limits.
- The sheet (`build.py` names both fragments, with `core/terrain/37c-core-rubble.js` and `core/ruins`, here and not in
  `xanadu.py`: `XAK` and Xanadu's own pages do not take them): `targets/sheet/91u-xasheet-ruins.js` watches every damaged and
  ruined fort with `KRUINS`; `verify.py` adds `fort-plans` and `fort-walks` (every standing fort's walks reached from its
  stairs, with a negative) through `sheet_verify.run(extra=...)`.

**Who takes it.** `settlements/xanadu` reads it in place (its `xanadu` target is the kit's sheet; its `erewhon` target is the
city of Erewhon); `settlements/longsong` takes `kit_bundle.py`'s `XAK` (with Xanadu's texture pack).

**Its own sheet** (done 2026-11-09): `python3 tools/build.py kits/xanadu` writes `dist/xanadu.html` (the library maps beside it,
`dist/xanadu.tex.xanadu.js`); `python3 verify.py dist/xanadu.html --assert` checks it (as the Iziz Vernacular's sheet does, plus
`XA_TRADES` against the Voth census through `tools/check_trades.py`). Every def at every variant, a row per family
(`targets/sheet/89z-rows.js`): 414 sites, 692 registered volumes, 599 doors. The page is the kit sheet shared by the kits on the Vernacular's contract (`kits/iziz-vernacular/sheet.py`, `sheet_verify.py`):
the shell (`kits/iziz-vernacular/src/*-vsheet-*`: scene, rows, doors, the take on core/host), the Ancients core read in place from
`kits/ancients/src`, and core's modules: `core/rand`, `core/tags`, `core/walk`, `core/door` (KDOOR and its host: the E key and its
tip), `core/host`, `core/atmos/placeholder`, `core/materials` (records, and the kit's own pack, `materials.json` -> `tex/`, in a
sidecar beside the page). No settlement file is read.
Beside it the kit draws through the Vernacular's `69b`, `69c` and openings (read in place). Not on the kit's sheet (Xanadu's page
has them): the Vale's biome plants (`86b-xa-plants.js` falls back to the kit's shapes) and core/water's still water (the pools
take `MAT.xWater`). Xanadu's `xanadu` target stays Xanadu's sheet; `kit_bundle.py` (`XAK`) is unchanged.
**The forts' interiors** (F4, 2026-11-22): `src/80g-xa-fort.js` writes the interior set `xanadu-fort` from XFORT's plans (one item
per fort def: the keep, the ranges, the strongroom, the magazine, the assay court, the smithy and the wheel house as INSET bodies, as
`sets/xanadu.js` writes the kit's other stacks) and registers it on any page with the interiors core (KratorInteriors); a fort
placed damaged or ruined gets no rooms. Strongwall's page (`settlements/strongwall`) turns them on.
**Interiors:** the sheet builds the bodies solid, every door locked. A `?interiors=1` mode goes in `targets/sheet/` once the kit's
interiors and hollow walls land (`kits/interiors/sets/xanadu.js`; another session's work): it already has core/walk, core/door's
host and `KDOOR.clearDoorways`. The `doors` assert expects every door locked and must be relaxed for that mode.

**Scrap Xanadu** (the owner, 2026-11-11; `PLAN-SCRAP.md`). The Xanadu body built with the Ancients' reclaimed materials,
well ordered and never ramshackle (the contrast is `kits/post-apoc`). Whole shell panels are laid in courses as checker,
band and stripe facings; glazing becomes jali grilles, lantern clerestories and glass domes on bronze ribs; girders are
dressed columns and lintels; cable makes the balustrades; bronze the finials and the eight-spoked Wheel; the poor live in tanks, silos and hull vaults nearly as found. Twenty-one defs,
`xa_scrap_*` (culture `xanadu-scrap`), in `src/87s-xs-mat.js` (items), `87t-xs-helpers.js` (the `xnXS*` vocabulary) and
`87u-xs-build.js` (the buildings), `87v-xs-poor.js` (the poor tier and the farm). The package is **opt-in**: `xanadu.py` lists it as `SCRAP`, not in `FILES`, so the
pages that take the kit do not change. Its sheet is `settlements/xanadu`'s `scrap` target (`dist/xanadu-scrap.html`);
`kit_bundle.bundle(scrap=True)` seals it into `XAK` for a world (Strongbow's town first) with core/rand.
`kit_bundle.bundle(qiblai=True)` adds the Qiblai kit's buildings (`kits/qiblai`, `qb_*`, read in place: every family and the
cut-away rooms' vocabulary, not the walk-in rooms' furnishing nor the mixed street sheet): `XAK.dims()` lists them,
`XAK.proto` builds them, and `XAK.bind` binds a `qiblai` pack where the page registered one. Theodiga's town takes both.
