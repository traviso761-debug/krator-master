# Streetlab: handoff (2026-10-09)

This note lets a new session take over the Voth city plan work. Read it with `README.md` (the design and every tool), `INDEX.md`
(fragments and sizes), `PORT.md` (port tags) and `KNOWN_ISSUES.md`. The memory file `project-streetlab.md` holds the
owner's rules in short form.

## State

**Committed to `main` on 2026-10-09** (branch `claude/city-core`). The street toy (`src/`, `dist/streetlab.html`) was
retired: the owner called it redundant. Its street machinery became **`core/city`**, the city builder and its infill
(`core/city/README.md`), and the city plan takes it from there.

| Page | Built from | Verify | Last result |
|---|---|---|---|
| `dist/voth-site.html` | `targets/voth-site/` | `python3 verify.py dist/voth-site.html --assert` | OK |
| `dist/voth-city.html` | `CITY_JS` in `build.py` (`core/city`, `targets/voth-site/10,50`, `targets/voth-city/`, `core/simulation`) | `python3 verify.py dist/voth-city.html --assert` | OK |

Build: `cd settlements/streetlab && python3 build.py`. Serve: `python3 serve.py`, or the launch.json `streetlab` preview (port 8813). The page is
`/dist/voth-city.html`. It takes about 15 s to lay out and draw.

### Saved owner data (`site/`, inlined by build.py, read fresh under serve.py)
- `voth-site.json`: the site, made with the site editor. It has districts, including `mines`, `quarries`, `more farms` and `mush farm`, which came from the owner's marks.
- `voth-city-marks.json`: the owner's marks on the city plan (POST `/save/voth-city-marks`).
- `voth-city-edits.json`: the plan editor's placed buildings, painted streets and deletions (POST `/save/voth-city-edits`). It is empty now. Keep the file: the page fetches it, and a 404 fails verify.

### The city plan's 15 steps (0–14)
| Steps | What | Fragment |
|---|---|---|
| 0–5 | site, landmarks, districts, avenues, highways, wall | `30-vc-site.js` |
| — | Voth's own builders (wall and gates, monastery, chinampas, harbour, river port, shrines, lighthouses) | `31-vc-voth.js` |
| 6–12 | the street method | `32-vc-city.js` |
| 13 | the country: suburbs, farms, villages S10/S11/S12, orchards, mines, quarries, mushroom farms, windmills, watermills, ranches | `33-vc-country.js` |
| 14 | ferry and elephant bug lines as core/simulation `transport` routes | `34-vc-transit.js` |
| — | runner, plus the owner's edits | `35-vc-steps.js` |
| — | census | `36-vc-census.js` |
| — | power and light: power houses (at step 9), electric reach, street lamps | `37-vc-light.js` |
| — | flora: the swbay biome's mask and climate (parks jungle, environs savannah); built by `VC.drawFlora` (55) | `38-vc-flora.js` |
| — | park and plaza furniture | `39-vc-furnish.js` |

Host fragments:
- `55-vc-host.js`: drawing, sidebar, census table, foldable panels.
- `57-vc-marks.js`: marks (p).
- `58-vc-tools.js`: Paths, the pin, the editor (b).

### Last session's work, all verified
- **Dev tools** (`58-vc-tools.js`):
  - **Paths:** Voth's 87-pathviz, lifted by `build.py voth_pathviz_fragment()`. It shows streets by class, elephant bug and ferry lines with stations and live vehicles, and painted streets.
  - **The pin:** Dhelv's. Double-click drops it; G recenters on it; F walks from it. Walking follows the ground.
  - **Plan editor (b):**
    - place a Voth kit building, aligned to the nearest street and set back off it; Q/E turn it, R re-aligns;
    - paint a street of any class;
    - delete a building or a painted street;
    - undo, save, copy JSON.
  - The layout applies saved edits in `VC.applyEdits` (step 3) and `VC.applyDeletes` (after step 14). A full save → reload round trip was tested.
- **Embassies on the Foreign canton:** Hykkousoi, Iziz, Jimjam (the school), Republic, Dalab, Yuni.
  - `foreign.py` bundles the other builds' kit fragments, each in an IIFE behind a Proxy `window`, about 780 KB. It exposes `window.FOREIGN.place(culture,x,y,z,ry)`.
  - Sources: Dalab, Iziz, Republic and Yuni from settlements/dalab; Hykkousoi from ys; Jimjam from jimjam.
- **Canton decks:** granaries and mills, the arsenal, the market square, Port warehouses.
- **Census:** balanced (pop 46,631, workforce 23,316, jobs 23,219).
- **Transit:** ferries and elephant bugs follow Voth's collision rules. Elephant bugs queue at an occupied station; ferries berth two to a pier. Elephant bugs are Voth's 79c model with orange awnings.
- **Models:** rotating lighthouse beacons; better shrine and small-lighthouse models with doors and windows.
- **Harbour:** ship-spaced long piers (`TUNE.harbour.ship`).
- **Ring Sea kit** (`kits/ringsea`, verify OK, 28 vessels):
  - `81-rs-voth-junk.js`
  - `82-rs-hyk-galleon.js`: the galleon rebuilt as a Hykkousoi vessel
  - `83`–`87`: Voth ferry, taxi, river barge, pleasure barge, dhow
  - Seeds: next free is 73800.
- **core/simulation:**
  - new `77-sim-5r-routes.js` (the `transport` kind, `SIM.transportQueue`, `SIM.vehiclePose`);
  - edits to 0-core and 8-export, SCHEMA, PLAN and `test-sim.js` (57 checks pass, through `tools/node_in_chromium.py`; there is no node on this machine);
  - consumers rebuilt: mungo, shade, `core/simulation/example`.

### Open questions for the owner
- **Gallery (done 2026-10-09):** the city plan is in the Krator Worlds gallery as "Voth - new"; the old page is now "Voth - old" (`gallery/build_gallery.py` ENTRIES, `gallery/README.md`).
- **Unemployment:** suggestions 3 and 4 were never done. The owner asked for 1, 2 and 5 only, stopping when even.

## Working rules (owner and repo)
- **The refactor rules on origin/main** (CLAUDE.md, 2026-10-09, commit acc50484; local main is behind and has another session's staged work, so not pulled here):
  - don't add repo-wide tooling or rewrite a verify.py's harness block;
  - leave `core/terrain`, the biome placement core, the furniture batch and Voth's placement mask to the refactor;
  - new placement draws from `KRAND` cell-seeded, never reads canvas pixels, uses `x == null ? d : x` defaults and registers in `core/tags`;
  - don't copy infrastructure (camera, PRNG, noise, sky) into a build;
  - rebuild every build a shared change reaches.

  Streetlab predates this: its own `SL.stream` PRNG and raster are in `core/city/10-city-core.js` (the module's debts are listed in `core/city/README.md`). New work should not add more of that. Day and night (item 5) must take `core/clock` (KCLOCK), not a local clock.
- Edit only `src/` and `targets/`. Never open `dist/`, `three.min.js`, `archive/` or `*.zip`. Read fragments over 30 KB by section (`grep -n '^/\* ===='`). `33-vc-country.js` is 63 KB.
- Use no canton-specific Voth pieces. Put regular city buildings on the cantons.
- Shell gotchas:
  - Write patch scripts with the Write tool, not heredocs: heredocs eat `\'` and `\n`.
  - Don't use trailing `//` comments in packed fragments.
- **Refreshing the indexes:** `tools/audit_port.py` and `tools/make_index.py` rewrite every build's files.
  1. Back up every INDEX/PORT file first.
  2. Run the tools.
  3. Restore all but streetlab's.

  `tar` fails here on the `C:` path; use `cp`.
- After a change to the street method: rebuild, run all three verifies, take one screenshot per meaningful change.
- On Windows, `window.dispatchEvent` of a synthetic key reaches the window's listeners in registration order. Dispatch on `document.body` to test the capture-phase handlers in `58-vc-tools.js`.

## The owner's to-do list for the next session (in the order given)
1. ~~**River gate terrain**~~ **done 2026-10-09:** `VC.levelGate` (`30-vc-site.js`) cuts and fills a level pad under any gate on a slope, at the road's height, meeting the ground at `TUNE.wall.padSlope`. It edits TERR's delta and SL.ground. The River Gate was cut 7.1 m; the Harbor and Spirit gates got pads too (the step 5 log lists them).
2. ~~**The swbay biome**~~ **done 2026-10-09** (README "The flora").
   - The parks have the jungle; 110 trees in 14.7 ha, sparse. Raise `TUNE.flora.quality` if the owner wants more: it raises the savannah too.
   - The environs are savannah: about 6000 trees.
   - The canopy ceiling is `SWBAY_TEMPLE_H` = 40 in `build.py`, with crowns scaled by `TUNE.flora.crownK`.
   - The kit is read from `core/biome` and `biomes/swbay/src` (nothing vendored). Don't load a second biome kit into this page: `BIO.iridBarkMat` clashes (CLAUDE.md).
3. ~~**Park and plaza furniture**~~ **done 2026-10-09** (README "Park and plaza furniture"). It places 393 benches, 127 statues, 3 wayside shrines, an obelisk and 2 braziers, from the catalog's Voth section (lifted by `build.py`). `src/52-host-buildings.js` (shared with the toy) now draws `FURN` keys through `buildFurn`.
4. ~~**Street lighting**~~ **done 2026-10-09**, with the owner's power and light rules (`37-vc-light.js`, README "Power and light"): power houses in the industry district, the electric reach, and street lamps socketed in `SL.addWay`. The lamp kinds are electric, fancy lantern (wealthy streets, canton decks), lantern and torch. The census is even again (power-house staff). **Not done:** lit windows by light kind at night; that belongs with item 5, as do lamp glows dimming by day (`VC.drawLampLight`).
5. ~~**Day and night**~~ **done 2026-10-09** (README "Day and night"):
   - One core/clock `KCLOCK` (72-minute day) drives everything, opening at 10:00 and running, with 1x/2x/4x/8x, run/hold and an hour slider. Core's preview default is a held clock; `TUNE.clock.running` holds it.
   - The sun comes from Voth's own `skySunDir` (lifted), with `PAL.sky` colours and planetshine at night.
   - Lamp glows are core/atmos `glowAdd`, with per-lamp on and off hours.
   - Vehicles and SIM read the clock.
   - **Not done:** lit windows by each building's `light` kind.
6. ~~**River barge clipping**~~ **done 2026-10-09:** each barge now moors across its pier's head, parallel to the current, `TUNE.bargeClear` off it. It is placed only where every corner floats, and it is in `VOTH.PIERS` (`barge:true`), so the boats steer round it. The step 2 log and verify audit hull against pier: 4 barges, 0 clashes.
7. ~~**Elephant bugs and bridges**~~ **done 2026-10-09:** the elephant bug nav closes the water within `TUNE.bridgeBand` of a river bridge's line (beside its deck) and under every canton span (`VC.NAV.under`). Elephant bugs cross the river only along a deck, entered from its ends. They are drawn at the deck's height by Voth's own `lifeBridgeY` (lifted from `78a-life-core.js`). The verify audit, "striders and bridges", reports 0 samples in closed water, 598 on decks and 0 off the deck height.
8. ~~**Rename to "elephant bug"**~~ **done 2026-10-09** (the owner chose "everywhere", but not the hyperjungle's striders, which are a different animal):
   - **Renamed:** "silt strider" in prose, labels and docs across Voth's src and docs, the Voth building catalog's names (`voth-city-captured.js` and its generator `capture.py`), the furniture catalog's "Elephant Bug Transit Station", `LORE.md`, `core/simulation/ROADMAP.md` and streetlab.
   - **Streetlab also renamed:**
     - its labels that said just "strider": station and line names (the saved `site/voth-site.json` too), the site tool, the step names, the logs, the census, the Paths legend and the verify report;
     - its `TUNE` keys: `bugWade`, `bugSink`, `bugAwning`, `navFreeBug`, `census.jobs.bug` and `bugStation`;
     - its comment and doc prose.
   - **Kept:**
     - the owner's quoted words;
     - code identifiers (`VSTRIDER`, `STRIDER_*`, `striderPlaceLegs`, `voth_city_silt_strider_station`);
     - the data ids code matches on (`'strider'` kinds and the nav layer, `TUNE.transit.strider`, `'strider-guild'`, `BOARD_STRIDER`);
     - file names (`79c-strider-model.js`).
   - Voth is rebuilt.
   - The builds that bundle the catalog (`kits/catalog`, `kits/interiors`, `kits/ancients-interiors`, Locus, Mav's Refuge, Mungo, Verge) were rebuilt in the commit.
9. ~~**Placer menu**~~ **done 2026-10-09:** the editor's place mode shows a searchable grid of all 143 Voth kit pieces with pictures (`VC.edGrid`, `VC.thumbsStart` in `58-vc-tools.js`). Each picture is built once off screen, rendered into a render target on the page's renderer and kept as a data URL. Two are drawn a frame, and the ones a search shows go first. The variant select stays.

Earlier ideas, still open:
- Moor Ring Sea ships at the harbour piers (`TUNE.harbour.ship` spacing was made for them).
- Unemployment suggestions 3 and 4.
