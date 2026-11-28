# kits/transit — Post-Cataclysm Canal & Inland Transit Infrastructure Kit

`kits/transit` is Krator's **living post-Cataclysm transit infrastructure kit**, sibling to ruined `kits/ancient-transit` (the Ancients' ruined highways, railways, and subways). It provides the engine-neutral `[G data]` hydraulic, miter-lock, navigable aqueduct, bridge-clearance, street-clipping, and lock-transit state-machine prototype (`KCANAL` / `KTRANSIT_CANAL`), paired with a multi-culture `[draw]` builder and a Ring-Sea-compatible inland canal vessel registry (`TR_VESSEL`).

Any Krator culture (`eternian`, `republican` *Slussport*, `marr`, `dalab`, `yuni`, `voth`) can build stepped canals on this prototype by reading `kits/transit/src/` in place via `kits/transit/transit.py` (`settlements/eternian-canal` *Shuāng-Zhá* is the reference settlement).

## Core Architecture

| Layer | Fragments | Role |
|---|---|---|
| **`[G data]` Canals & Street Clipping** | `src/40-tr-canal.js` | `KCANAL` (`KTRANSIT_CANAL`): oriented `(u, s)` canal frames, stepped pounds (`poundsMonotonic`), waterway right-of-way gauges (`canal_trunk`, `canal_ward`, `canal_feeder`), humpback/arch/draw bridges (`bridgeClearsVessel`), navigable aqueducts (`aqueductOk`), `clipStreetWays` & `streetClearOfCanals` (preventing street intrusions into canal troughs), and `buildRoadMask` (`KMASK` road raster zeroed across all canal troughs, locks, basins, and rivers). |
| **`[G data]` Miter Locks** | `src/41-tr-locks.js` | Single and twin parallel `1..N`-riser miter-lock flights (`KCANAL.lockFlight`), `KSCHED` paddle-sluice fill/empty cycles, strict zero-head miter-gate law (`miterLawOk`), and articulated 2D gate-leaf OBB kinematics (`gateLeafPoses`). |
| **`[G data]` Lock-Transit Kinematics** | `src/42-tr-transit.js` | End-to-end multi-pound vessel transit courses (`transitCourse`, `singleLockTour`, `twinFlightRoundTrip`, `shuttleCourse`, `vesselPoseAt`, `auditTransit`) verifying `0` gate-leaf collisions, `0` bridge air-draft strikes, `0` dry-channel groundings, and exact water-surface flotation across full lock cycles. |
| **`[draw]` Multi-Culture Works** | `src/70-tr-canal-draw.js` | Culture style profiles (`eternian`, `republican`, `marr`, `dalab`, `voth`), indexed `THREE.BufferGeometry` merge-bucket builder (`KCANAL.geom`), and infrastructure meshes (`quay`, `lockRiser`, `miterLeaf`, `bridge`, `aqueduct`, `weir`, `sluiceGate`, `crane`, `pavedWays`). |
| **`[draw]` Canal Vessels (`TR_VESSEL`)** | `src/72-tr-canal-vessels.js` | Modelled on `kits/ringsea/API.md` (origin amidships on waterline, bow `+x`, starboard `+z`, `reseed(N)`, `{ group, anims, deckY }`, registered in `KTAGS` as `'vessel'`): **`et_canal_barge`** (`16.5 × 3.6 × 1.88 m`, `1.05 m` draft, 4 freight variants), **`et_tow_scow`** (`11.6 × 3.0 × 1.32 m`), and **`et_inspection_launch`** (`10.2 × 2.4 × 1.72 m`). |
| **Demo Sheet** | `src/85-tr-demo-plan.js`, `src/99-host-z-tr-stage.js` | Verified standalone Three.js + `core/water` + `core/host` demo (`dist/transit.html`): stepped 2-pound miter lock (`3.20 m` lift), humpback cart bridge, navigable 2-arch stone aqueduct over a flowing valley stream, `44 × 36 m` turning basin with wharf crane, live transiting `et_canal_barge`, and vessel showcase row. |

## Build, Test & Verify

```bash
# 1. Node [G data] + vessel bounding-box & KTAGS test suite (with paired negative checks)
node kits/transit/tests/test-transit.js

# 2. Recorded build (writes dist/transit.html and build-inputs.json)
python3 tools/build.py kits/transit

# 3. Headless Chromium WebGL verification + screenshots
KRATOR_CHROME=/usr/bin/chromium python3 kits/transit/verify.py kits/transit/dist/transit.html --assert --no-cache --out kits/transit/shots
```
