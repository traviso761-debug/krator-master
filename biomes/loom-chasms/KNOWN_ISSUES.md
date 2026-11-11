# biomes/loom-chasms: known issues

Open items, each with what is owed. Station 3 (the Loom) was built in one cloud session (2026-11-11, on the Great Chasm's branch) with
**no GPU**: `verify.py --assert --all-views` ran in software GL (SwiftShader). **The real-GPU verify is owed on the owner's PC**
(`KRATOR_GL=gpu`: the log's `gpu-renderer` line must name the card), with the owner's look pass.

## Verified (2026-11-11, the cloud session: SwiftShader, no GPU)

`verify.py dist/loom-chasms.html --assert --all-views` in software GL: the result is recorded here when the run ends (the next commit).

## Owed to the GPU run (the owner's PC)

- [ ] `verify.py --assert --all-views` on `dist/loom-chasms.html` on the GPU: the ground at 15 texture units (the Arc's limit), the far
  field to 118 km under a camera far plane of 260 km and a near of 1.5 m (the cables' beards on the floor's view), the frame rate.

## The stations still to build

- [ ] Station 1, **the Weavers' Cradle** (next; the owner, 2026-11-11: its farmers are Yuni colonists): `KRELIEF.terraces`, `KSTRATA.vary`
  for the loess, `kits/crops` for the fields, Aina Bruk on `core/water`, the farms on `core/hamlet` (a Yuni culture row is owed there:
  the Great Chasm's KNOWN_ISSUES has the same amendment).
- [ ] Station 2, the Weave-Step; station 4, Mount Caelum (the parent colony at the fumaroles; geothermal surfaces owed in core/water);
  station 5, the White Loom (the salt-crust hazard owed in core/hazard). Their `station.json` are records only (`check_views` carries
  their STATION-NO-VIEWS in its baseline until they are built), and their records' `atm` and Caelum's playa level still want fixing
  (PLAN.md section 7, "Records to fix").

## Owed to core adoption and to the plan

- [ ] **The chasm head** for `KRELIEF.stepcut` (PLAN.md section 8, amendment 1, Mid Basin's amendment 3): the slot's depth tapering to
  nothing at its ends; the slot closes round them with full-depth stepped walls now.
- [ ] **The cable-stryder** (kits/fauna) on the canopy, and its `hunter` hazard: not placed.
- [ ] **The anchors' rock**: each grown cable carries its anchors' pull (KSPAN.tension: up to several MN for the thickest, longest
  spans; `window._slot.maxPullMN`); nothing yet limits where the rock would hold (PLAN.md section 4: "a page can set anchors only where
  the rock would hold"). A rule for the basalt's holding strength by bed (KSTRATA's hardness) is the next step.
- [ ] **The cable's texture** is `bark.cord.braided` tinted iron (a stand-in for the iron-silica fibre); the bladders `organic.pleat.skin`.
  A dedicated set can wait for the owner's look pass.
- [ ] The slot's floor gathers the wadi plants of the Great Chasm's kit (the wash field); the plan's "shade lovers on the slot walls"
  are the wall curtains (card.moss.hanging), one form for now.

## How the canopy is seated (for whoever changes it)

- The ground mesh here is **not** `probeSkip` (it is on the Great Chasm's and riftrim's pages): it holds the wall curtains and the cables'
  tubers, so the core attach audit must count its triangles as structure.
- The anchors and the curtains are rays at the drawn mesh (`src/45d-host-drawn.js`, bucketed by the ground's cells); the station's
  checks hold every anchor and curtain root within 5 cm of the drawn surface, every span clear of it, the grown cables in the canopy's
  band, each with a negative. Nothing roots on the slot's risers and lips or within a cell of them (`LAND.noRoot`).
