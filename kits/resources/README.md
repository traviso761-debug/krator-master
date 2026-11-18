# kits/resources: the Resources kit

World content that belongs to no culture (owner, 2026-10-15). So far it holds the **resource nodes** the building kits'
works draw on.
- **The kinds:** twenty-seven since 2026-11-16 (the mined goods of Gemini's trade model, below); first twelve: iron, copper, gold, tin, silver, rare earth, coal, sulfur, saltpeter, potash, alkali salts and oil.
  Potash and alkali salts (soda and its kin, borates and lithium folded in: no finer than these two, the owner, 2026-10-23)
  are the Catch's salt field (`biomes/catch/PLAN.md` section 6a); elsewhere on Krator they are traces.
- **The grades:** each kind comes in a low, a medium and a high grade, visible and placeable.
- **Who works them:** a **mine** takes everything but oil; oil takes a **derrick**. The only derrick so far is Locus's
  Geomancer pumpjack (`ind_pumpjack`). The owner: no derrick for other cultures yet.
- **The rule:** a works takes its product from the nearest node it can work, within reach. The node's grade sets the
  workers' efficiency, which is the works' yield a worker-hour.
- **Nodes do not run out** (owner, for now).

```
cd kits/resources && python3 build.py                     # dist/resources.html
python3 verify.py dist/resources.html --assert            # invariants (headless Chromium)
python3 verify.py dist/resources.html --views "Oil seep, high grade - eye level"
python3 ../../tools/textures/pack.py kits/resources       # (from the repo root) after a change to materials.json
```

## What is in it

| Kind | Item | Worked by | Looks like |
|---|---|---|---|
| iron | `iron_ore` | mine | an outcrop of angular dark rock, a rust-red gossan crust on its veins |
| copper | `copper_ore` | mine | the same outcrop with green malachite and blue azurite stains |
| gold | `gold_ore` | mine | the same outcrop with a white quartz reef flecked with gold |
| tin | `tin_ore` | mine | pale granite blocks with white quartz stringers studded with dark cassiterite grains |
| silver | `silver_ore` | mine | the dark outcrop with bright metallic galena streaks in white veins, black tarnish |
| rare-earth | `rare_earth_ore` | mine | dark rock speckled with pink, violet and red-brown grains |
| coal | `coal` | mine | a cut bank in a low rise: pale sandstone beds stepping back, black coal seams between them |
| sulfur | `sulfur` | mine | a low stained mound crusted yellow, a fuming vent ringed with crystals on top |
| saltpeter | `saltpeter` | mine | a weathered outcrop of dark earth, white saltpeter blooming on its faces and crusting the ground |
| potash | `potash` | mine | a salt pan's crust broken open: a pit through the white halite skin into pink-red potash beds, the slabs stacked, ochre salt polygons round it |
| alkali | `alkali_salts` | mine | a soda pan: peach plates of soda crust curling round a cut brine pit, white trona nodules heaped by it |
| oil | `crude_oil` | derrick | a seep: black pools with a sheen in a tar-crusted stain, tar humps, bubbles |
| emerald | `emerald` | mine | Muzo's: dark green-black schist (`rock.schist.emerald`) crossed by white calcite veins holding six-sided green crystals (2026-11-16) |
| turquoise | `turquoise` | mine | Nishapur's: pale bleached altered rock netted with blue-green veinlets (`rock.turquoise.vein`), nodules where they swell (2026-11-16) |

**The mined goods of Gemini's trade model** (2026-11-16, the owner: "build nodes for mineable resources from the Gemini trade
docs, that do not already have one"): eleven more kinds, in `42s-res-ore-mined.js` (the kinds, [G data]) and three drawing
fragments, `44s` (metals), `44t` (gems) and `44u` (dug from the ground). Each kind names the Gemini good it feeds (`good`).
Emeralds and turquoise are the Coyote Men kit's (`kits/coyote`). All are dug by a mine.

| Kind | Item | Gemini good | Looks like |
|---|---|---|---|
| zinc | `zinc_ore` | `zinc` | the dark outcrop banded with resinous black sphalerite, honey-yellow where thin, a galena streak, pale calamine crust on top |
| lodestone | `lodestone` | `magnets` | a crest of rounded black magnetite boulders, iron filings bristling in tufts, a fulgurite where the lightning struck |
| peat | `peat` | `peat` | a bog cut: the sphagnum top over a dark bank cut in spade-deep steps, black water below, turves stacked to dry |
| silica | `silica_sand` | `silica-sand` | a sand pit in a white quartz-sand rise, the washed sand heaped, a washing trough |
| quartz | `quartz_crystal` | `gems` (optical quartz) | a white vein-quartz reef, druzy pockets with clear hexagonal points, a cluster at the foot |
| alabaster | `alabaster` | `alabaster` | a quarry of honey-white alabaster benches, cut blocks, thin sawn panes leaning on a frame |
| bitumen | `bitumen` | `pitch-tar` (its mineral leg) | a pitch lake: a dark skin crept into folds, a square cut with rain in it, blocks stacked |
| opal | `opal` | `gems`, `photonic-opals` | Opal Valley's boulder opal: rust ironstone and a dark dike, milky potch seams flashing colour, a pale mullock heap |
| diamond | `diamond` | `gems` (Korona's diamonds, garnets) | a stepped bench of tepui quartzite conglomerate, washed gravel with garnets and glints, a rocker cradle |
| jade | `jade` | `frost-coral` (Verdigris Jade) | a serpentinite contact, a stream below with water-rounded jade boulders, one sawn open |
| amber | `amber` | `ria-amber`, `abyss-lac` (swamp amber) | a cut bank of blue-grey clay under lignite and sand, amber nodules in the face, the dug clay heaped |

None has a geology layer yet, so the node field places none: they are owner nodes until a bake gives them one (`GEOLOGY.md`, "The
mined goods' kinds"). Building kits that read `42r` and `44r` in place do not see them unless they also read `42s` and `44s`-`44u`.

Each kind has a def per grade:
- **Keys:** `node-<kind>-<grade>`, for example `node-coal-high` or `node-rare-earth-low`.
- **Yield:** x0.5, x1 or x2.
- **Size:** 3.2, 5.2 or 8 m.
- **Richness:** a richer node has loose stuff round its foot.
- **Class:** `prop`, kind `res-node`, culture `generic`.
- **Tags:** `rock` (the kind), `level` (the grade) and `harvest` `{item, efficiency, works}`.

**The rule** (`42r-res-ore.js`, [G data]):
- **Which node:** a works takes from the nearest node of a kind it can work, within 400 m. A mine never takes oil, and a
  derrick takes only oil. A tie goes to the higher grade. With no node in reach, the works stands idle.
- **The rate:** Voth's mine producer's 0.05 lots a worker-hour, times the grade's yield.
- **Which works a building is:** `resWorksOf` reads a `works` field, then a `role` tag of `mine` or `derrick`, then the
  catalog keys listed in `RES_ORE.works` (`ind_pumpjack`). Locus's files are not changed.
- **The form:** plain data and pure functions, for core/simulation's producers and for Godot.

## Who uses it

- **kits/islanders** reads `42r-res-ore.js` and `44r-res-nodes.js` in place (its `build.py` `RESOURCES`). Its mines
  (`iw-mine`, `ie-mine`) take their product by `resSource`, and its sheet places every node beside them.
- **Any kit on the Scyvoi engine** can read them the same way.
- **The isle demo** (`settlements/isle-demo/PLAN.md`) will place nodes on its islands.

## How it is made

The engine is the Scyvoi kit's, **read in place** from `kits/scyvoi/src`. It is not vendored, so nothing here drifts. The
standard sky comes from `settlements/iziz/src`.

The kit's own files:
- `26k-kit.js`: the identity and the palette;
- `42r-res-ore.js`: the kinds and the rule;
- `44r-res-nodes.js`: the nodes;
- `42s-res-ore-mined.js`, `44s-res-nodes-metal.js`, `44t-res-nodes-gem.js`, `44u-res-nodes-ground.js`: the mined goods' kinds and nodes (2026-11-16);
- `89-rows.js`: the sheet, a row per kind.

The rock, earth, sand, ground and the sulfur crust (`ground.sulphur`) are library sets (`materials.json`). The other
veins, seams, pools and grains are vertex colours until their sets arrive (`core/materials/PROMPTS-NEEDED.md`). See `API.md` and `KNOWN_ISSUES.md`.

## Where the nodes are: the geology, the node field and the ledger (2026-10-26)

`GEOLOGY.md` has the format, the rules, adoption and the Godot notes. In short:
- **Two more kinds,** from the evaporite rings: **gypsum** (`node-gypsum-*`, a closed basin's rim: pale bedded crust, selenite
  blades) and **rock salt** (`node-halite-*`, item `salt`: a pit cut in the pan's white crust, the blocks stacked). Fourteen in all,
then two from the geology's new rocks (2026-11-03, `REBAKE-PLAN.md` R3): **nickel** (`node-nickel-*`, item `nickel_ore`: a dark norite outcrop
with brassy sulphide, at the crater's melt-sheet margin and on bare mantle) and **marble** (`node-marble-*`, item `marble`, a
quarry on the library's `rock.marble012`, where a pluton or a volcano cooked the limestone). Sixteen kinds, 48 defs; then the **gems** (2026-11-16, the owner: the Coyote Men's exports, `kits/coyote`): **emerald**
(`node-emerald-*`) and **turquoise** (`node-turquoise-*`), added to the bake in place (`geology.py --gems`): eighteen kinds, 54 defs; with the mined goods (2026-11-16, above), twenty-nine kinds and 87 defs.
- **The geology** (`tools/scale-model/geology.py` -> `data/geology.json`): a province per scale-model cell (sedimentary,
  crystalline, volcanic, evaporite, rift; ruin ground as a flag) and one prospectivity byte per family per cell.
- **The node field** (`45r-res-field.js`, `KRES.nodesIn(tile)`): one candidate per family per placement cell, by KRAND, kept
  under the cell's prospectivity; any tile alone, the same in Godot. Gold and tin **placers** are carried down the model's rivers
  from the lode nodes; **potash and alkali** (the Catch's) sit where its closed basins dry last, inside halite, inside gypsum.
- **The ledger** (`46r-res-ledger.js`, `data/ledger.json`): what each polity's towns reach within a day, what it must import,
  what it can sell (`RES_LEDGER.tradeGoods` is core/simulation's `SIM.trade` `goods`), and the fairness audit.
- **The page's geology map** (G, or the button at the bottom left): the provinces, one family's prospectivity, and a 120 km
  window's nodes by family (click the map to move it).
- `node kits/resources/tests/test-res.js` checks all of it (44 checks, each with a negative); `godot/kres_field_test.gd`
  checks the GDScript twin against it.

## Doors and glass (core/door, 2026-11-03)

The owner: "remove all dark voids and make all windows, doors and portals actual doors or windows that have transparency". The page loads `core/door` (KDOOR, KGLASS, KDOORHOST) and the engine draws it (`core/engine/36o-open.js`: `svLeaf`, `svDoorway`, `svPane`, `svRoom`). A door leaf is a KDOOR record with a stable id (`<def key>.<placement>.d<n>`), shut unless the builder drew it standing open; **E** opens or shuts the one within reach (walking or flying), and `KDOOR.open(id, {by: 'npc'})` does the same for a quest or an NPC. A door on a body with nothing behind it is locked. `_api.openings()`, `_api.doorExport()` and `_api.doorState()` are on the probe. The page has no `core/walk`, so the doors carry no walk blocks here.

What it changed here: nothing to change (the nodes are props: no doorway or window); the page loads `core/door` because the engine draws through it.
