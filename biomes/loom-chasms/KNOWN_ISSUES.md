# biomes/loom-chasms: known issues

Open items, each with what is owed. Stations 3 (the Loom) and 1 (the Weavers' Cradle) were built in one cloud session (2026-11-11) with
**no GPU**: `verify.py --assert --all-views` ran in software GL (SwiftShader). **The real-GPU verify is owed on the owner's PC**
(`KRATOR_GL=gpu`: the log's `gpu-renderer` line must name the card), with the owner's look pass.

## Verified (2026-11-11, the cloud session: SwiftShader, no GPU)

VERIFY-TABLE

## Owed to the GPU run (the owner's PC)

- [ ] `verify.py --assert --all-views` on both pages on the GPU: the ground at 15 texture units (the Arc's limit), the far
  field to 118 km under a camera far plane of 260 km and a near of 1.5 m (the cables' beards on the floor's view), the frame rate.

## The stations still to build

- [ ] Station 2, the Weave-Step; station 4, Mount Caelum (the parent colony at the fumaroles; geothermal surfaces owed in core/water);
  station 5, the White Loom (the salt-crust hazard owed in core/hazard). Their `station.json` are records only (`check_views` carries
  their STATION-NO-VIEWS in its baseline until they are built), and their records' `atm` and Caelum's playa level still want fixing
  (PLAN.md section 7, "Records to fix").

## Owed to core adoption and to the plan

- [x] **The chasm head** (2026-11-11): `KRELIEF.stepcut`'s opt-in `head: {len, minW}` (core/terrain 38c, its tests in test-landforms.js);
  the slot pinches out over its last 700 m.
- [ ] **The cable-stryder** (kits/fauna) on the canopy, and its `hunter` hazard: not placed.
- [x] **The anchors' rock** (2026-11-11): a grown cable is grown only where both anchors' beds hold its pull (KSPAN.tension against
  0.3 MN plus 1.2 MN times KSTRATA's hardness of the bed at the anchor); the station's check holds every cable to it, with a negative.
  The numbers are the kit's; a geotechnical figure for a fused root mat is the owner's to set.
- [ ] **The cable's texture** is `bark.cord.braided` tinted iron (a stand-in for the iron-silica fibre); the bladders `organic.pleat.skin`.
  A dedicated set can wait for the owner's look pass.
- [ ] The slot's floor gathers the wadi plants of the Great Chasm's kit (the wash field); the plan's "shade lovers on the slot walls"
  are the wall curtains (card.moss.hanging), one form for now.

## The Cradle (station 1)

- [ ] **The Yuni farms are pending stand-ins** (boxes, domes and towers in banco adobe at the core/hamlet records' boxes): the Yuni kit's
  buildings draw through the Yuni engine, which this page does not carry. The village is core/hamlet's on the Yuni row
  (core/hamlet/ext/21), so a page that can read the kit answers `dims(key)` and draws them.
- [ ] **The farms' books** (core/simulation: the stock, the harvest, the road's trade with Spindle Fan) and the draught animals
  (kits/fauna) are owed.
- [ ] **Irrigation**: the fields are terraced and cropped by the river's corridor, but no canal is drawn from the spring to them; the
  fan falls north and east, so a contour canal from the spring reaches them.
- [ ] **The wadis' floods**: the gorge flood (a timed `drown`/`crush`) is a shared core/hazard amendment; the wadis are dry here.
- [ ] `check_assembly` carries one MISSING on the Cradle's page (`KCITY.stance`, in its baseline): core/city's strategies fragment
  (33, which core/hamlet reads for its frontage cursor) names the stance path of core/city's ground (15), which core/hamlet never takes;
  loading 15 would need core/city's core (10) and its globals.
- [ ] The station record's v2 crops (cold rye, mountain flax, lichen spelt) are kept in its `station.json` as `crops_v2`; kits/crops
  grows emmer, frost oat, helix bean, flax, saffron and woad for these bands (PLAN.md 7c).

## How the canopy is seated (for whoever changes it)

- The ground mesh here is **not** `probeSkip` (it is on the Great Chasm's and riftrim's pages): it holds the wall curtains and the cables'
  tubers, so the core attach audit must count its triangles as structure.
- The anchors and the curtains are rays at the drawn mesh (`src/45d-host-drawn.js`, bucketed by the ground's cells); the station's
  checks hold every anchor and curtain root within 5 cm of the drawn surface, every span clear of it, the grown cables in the canopy's
  band, each with a negative. Nothing roots on the slot's risers and lips or within a cell of them (`LAND.noRoot`).
