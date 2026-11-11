# biomes/loom-chasms: known issues

Open items, each with what is owed. Stations 3 (the Loom) and 1 (the Weavers' Cradle) were built in one cloud session (2026-11-11) with
**no GPU**: `verify.py --assert --all-views` ran in software GL (SwiftShader). **The real-GPU verify is owed on the owner's PC**
(`KRATOR_GL=gpu`: the log's `gpu-renderer` line must name the card), with the owner's look pass.

## Verified (2026-11-11, the cloud session: SwiftShader, no GPU)

`python3 verify.py <page> --assert --all-views`, 1280x800, software GL (`tools/harness.py`), each page on its committed bytes:

| Page | Checks | Fails | Heaviest view (draw calls, scene triangles) | Attach audit |
|---|---|---|---|---|
| `dist/loom-chasms.html` (station 3, the Loom) | 65 pass | 0 | Along the slot: 41, 2.08 M | 1 of 921 cards float (0.11%: an ember, the Great Chasm kit's) |
| `dist/loom-chasms-cradle.html` (station 1, the Cradle) | 59 pass | 0 | The Yuni farms: 30, 3.32 M | 0 of 1718 |

The Loom: 93 cables (68 grown, 25 pioneer shoots), every anchor on the drawn rock within 5 cm, 1767 points on the spans all clear of the
rock, the grown cables' low points 40-170 m over the slot's floor, the hardest pull 1.10 MN within its beds (one station left ungrown on
weak rock); 642 wall curtains seated within 5 cm. The Cradle: 53 Yuni records (240 people, 40 households), every one a pending stand-in;
612 fields of six crops kits/crops gives the Cradle's bands (flax, frost oat, emmer, saffron, woad, helix bean); Aina Bruk falls from
2167.9 to 2146.7 m over 163 points, never climbing; the kin rows grew (poplar 60, apricot 292). Both: the ground at 15 texture units,
every camera over the drawn ground, the hazards registered, each check fed a broken input that fails. What the first Cradle run caught:
the wadi's view stood 16 km out under the far field (it stands on the wadi's first points inside the drawn ground now), and the fields'
view looked at the orchard, not the terraces (it stands in a field now).

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
- [x] **The cable-stryder** (2026-11-11): kits/fauna's new `loom` group (`krator-fauna-loom.js`, on the `wild` group's hexapod builder:
  the bundle takes `hyperjungle`, `wild`, `loom`, vertex colours only, through station.json's `fauna`). Three sleep hanging under grown
  cables (nocturnal; the page opens at 14:00), each a core/tags record over a `hunter` hazard (KHAZ.PREDATOR.lair) on the floor below;
  the station's check holds each to its span and its hazard, with two negatives. Awake, running the cables, is the runtime's to animate
  (KratorFauna's walk is on the ground). The halite sifter is in the same group, for the White Loom.
- [x] **The anchors' rock** (2026-11-11): a grown cable is grown only where both anchors' beds hold its pull (KSPAN.tension against
  0.3 MN plus 1.2 MN times KSTRATA's hardness of the bed at the anchor); the station's check holds every cable to it, with a negative.
  The numbers are the kit's; a geotechnical figure for a fused root mat is the owner's to set.
- [ ] **The cable's texture** is `bark.cord.braided` tinted iron (a stand-in for the iron-silica fibre); the bladders `organic.pleat.skin`.
  Its prompt is owed: `organic.cable.ironsilica`, `core/materials/PROMPTS-NEEDED.md` section 44.
- [ ] The slot's floor gathers the wadi plants of the Great Chasm's kit (the wash field); the plan's "shade lovers on the slot walls"
  are the wall curtains (card.moss.hanging), one form for now.

## The Cradle (station 1)

- [ ] **The Yuni farms are pending stand-ins** (boxes, domes and towers in banco adobe at the core/hamlet records' boxes): the Yuni kit's
  buildings draw through the Yuni engine, which this page does not carry. The village is core/hamlet's on the Yuni row
  (core/hamlet/ext/21), so a page that can read the kit answers `dims(key)` and draws them.
- [ ] **The farms' books** (core/simulation: the stock, the harvest, the road's trade with Spindle Fan) and the draught animals
  (kits/fauna) are owed.
- [x] **Irrigation** (2026-11-11): the spring canal, led off the pool's south side along the contour (falling 1.5 m a km, traced on the
  ground's gradient, bent downhill where its cut runs deep), 3.6 km south-east across the terraces; its bed cut in the ground, its water a
  core/water flow (chasmLand's `canals`: the page's water and wet ground), the fields kept off it. The check: it never climbs and its water
  stays between its banks, with a negative. Not yet: its offtakes to each field and which fields it commands (the crops are picked
  irrigated or not by kits/crops; the canal does not yet change the pick).
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
