# biomes/greenstep: known issues

Open items, each with what is owed. The kit and its first page were built in one cloud session (2026-11-09) with no GPU (the owner,
2026-11-09: no GPU verify from cloud sessions): `verify.py --assert` ran in software GL (SwiftShader) only. Stations 1, 2, 4, 5 and 6 were built
in a second cloud session (2026-11-09, `claude/greenstep-finish-cloud`), again in software GL only.

- [ ] **GPU verify of all six pages is owed** (a local session, `KRATOR_GL=gpu` through `harness.py lock`): `verify.py --assert --all-views` on
  `dist/greenstep.html` and the five `dist/greenstep-<station>.html`. Station 3's page changed too (the shared layers, the units check, the sites
  list, core/mask on the page), so its GPU pass on `claude/cloud-kits-verify` no longer covers its bytes. Watch: the ground's program linking
  (the units check counts the active samplers of the program SwiftShader linked; ANGLE on the Arc may count otherwise), the caverns' material
  on stations 4 and 5, the springs on 6.
- [x] **Software GL** (2026-11-10, second session): `verify.py --assert` passes on all six pages as built (SwiftShader, three presets each):
  station 1 9.4 M scene triangles, 6,610 kin trees; station 3 13.1 M, 15,734; station 4 10.4 M, 10,459, the cavern 135k triangles in 16 meshes;
  station 5 15.2 M, 26,071, the bridges 62k in 7 meshes; station 6 10.7 M, 18,089; station 2 passes as well. Every ground at 15 active texture
  units; no item past the instance cap (stations 1 and 2's oak leaves and station 5's frill fins were thinned to get there: `kinHero` and the
  rows' cells).

- [x] **GPU verify** (2026-11-09, `claude/cloud-kits-verify`): on the GPU the ground's program did not link (17 samplers: five KGROUND
  layers, the strata's five, the horizon's two, the paint, the grain, the rain cover, the wet ground's hollow map and the cloud noise;
  ANGLE links 15). The land shows three layers now (grass, moss, red soil; `LAND.groundLayers`), and `verify.py --assert --all-views`
  passes on the Arc lane. **The litter and the lichen are back** (second session): drawn on the grass's and the moss's maps
  (`STATION.shareLayers`, 45: no sampler of their own), and `window._groundUnits` (KSHADOW.units: the samplers the ground's program
  declares) is checked against 15 under `--assert` in any GL, with a negative control.
- [x] **Software GL** run first (2026-11-09, `--assert` at "The Great Veil from the basin" and "The brink at the prow"): every invariant and every
  negative control passes; 12.7 M scene triangles (budget 24 M; `greenstep/kin` 8.9 M of its 20 M, `greenstep/floor` ~3.8 M), 8-10 M
  drawn at the views, ~120 draw calls, 15,734 kin trees (2,407 hero, 13,327 far form only), attach audit 0 of 9,366 cards, a ~60 s build.
  The SW lowlands' `oakleaf` item went over the 250k instance cap (328k) at the first full run: fewer cork oaks and red bays, and the
  hero forms within 440 m of the spine (`LAND.kinHero`), took it under. Worth timing on the Arc.
- [ ] **The look pass is the owner's**: the risers read as stepped walls of near-black basalt with mossy faces in the spray; the
  colonnade's columns are the strata shader's (`tibasalt-ponded` `fx.columns`) and show only near. The cliffs are the ground mesh
  (~10 m cells): whole columns, an overhanging fan at a rille's lip and the entablature's hackly tier would need `KSTACKS` `columns`
  or `KCARVE` on the risers (not taken this turn).
- [ ] **Tallwalls is a site only** (`site.tallwalls`): the fortress is the settlement build's (`PLAN.md`, "Still open"). So are station 1's
  watch-towers (`site.watchtower.*`), station 2's tube barn (`site.tubebarn`) and station 4's rille-forges (`site.rilleforge`, underground).
- [ ] **No steam is drawn** (station 6): the fumaroles are KTHERM's warmth (the zones, the moss, the fog field) and the springs are still
  pools; the steam puffs `WATER.spring` can plan (`steam`) and the fumaroles' plumes want core/atmos's smoke groups. Owed.
- [ ] **Inside the tubes no eye walks** (stations 4 and 5): the camera's ground is the heightfield (the roof), so the presets look into the
  portals and down the skylight from the open; a `STATION_FLOOR` (the Twins' pyroduct) would let the walker in. The tube's interior is lit by
  the sky scaled by KCAVERN's openness (86-host-cavern.js), with no lamps: the forges are the settlement build's.
- [ ] **Station 4's stream ends at the west portal** (it sinks into the breakdown): the Hollow Way's water under the roof, the plan's four
  subterranean waterfalls and their wheels, are the settlement build's (a flow under a roof is drawn lit by the sky: a dark-water look for
  core/water is owed first).
- [ ] **Station 6's spiral aloes are not grown**: as a kin row (a tree per record) the aloe, under a metre, has no far form, so most of the first
  run's 18,313 drew nothing (empty registered volumes). The paramo's small rosettes want a floor pass of their own (an aloe item placed like the
  kit's ferns), not the kin rows. Station 5's frill trees were thinned (cell 44) to keep the frill fins under the 250k instance cap.
- [ ] **The cavern's ground** (stations 4 and 5): the cells round a portal and over a bridge are drawn by the cavern (Lambert, the paint's map
  only), not by the ground (MeshStandard, the library layers): a patch of flatter green there; a skylight's cut is exact (45 SKYHOLES).
- [ ] **The plan's corkscrew bells, giant lotus and tuber-gourds** have no species (the paddies grow the kit's rice): `kits/crops` or the S
  highlands would hold them.
- [ ] **The tier cedar is not grown** (`swlowlands.cedar`: riftrim's gorge found its pads off the limbs; its `KNOWN_ISSUES.md`).
- [ ] **The kin packs are whole** (`station.json` `"*"` for `swlowlands` and `shighlands`): the page is ~11.6 MB under the 16 MB cap;
  narrow each to the families its rows draw with (riftrim measured its rows' families on the page) before another kit is added.
- [ ] **No KSHADOW cost measured** (off at load; `?shadow=1`).
- [ ] **Off the LOD spine the kin are far forms only, at every range** (`87-host-kin.js`): a camera walked well away from the spine
  (`LAND.kinHero`, 440 m) stands among the source kits' far blobs (the frill's lollipop, the sprawl oak's dome). riftrim grows no kin
  there at all; nwlowlands grows a lite form. A hero for every tree on the page is ~4x the triangles and the oak leaves' instance cap.
  The fix is variants for kin (riftrim's `86-host-variants.js` grown from `BIO.kin`'s builders, so the level follows the camera): owed.
