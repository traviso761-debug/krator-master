# kits/resources: the Resources kit

World content that belongs to no culture (owner, 2026-10-15). So far it holds the **resource nodes** the building kits'
works draw on.
- **The kinds:** ten: iron, copper, gold, tin, silver, rare earth, coal, sulfur, saltpeter and oil.
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
| oil | `crude_oil` | derrick | a seep: black pools with a sheen in a tar-crusted stain, tar humps, bubbles |

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
- `89-rows.js`: the sheet, a row per kind.

The rock, earth, sand, ground and the sulfur crust (`ground.sulphur`) are library sets (`materials.json`). The other
veins, seams, pools and grains are vertex colours until their sets arrive (`core/materials/PROMPTS-NEEDED.md`). See `API.md` and `KNOWN_ISSUES.md`.
