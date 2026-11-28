# Shuāng-Zhá (`Chī-Mā`, "Twin-Locks") — Eternian Canal Testbed Settlement

**Scale Model 5.1 site:** `px 451, 782` (`450.5, 782.0`, SE shore of *Jìng-Hǎi* / Mirror Sea at `+45.87 m` ASL, where river `r012` *Hāk-Mā* descends out of the NW-lowlands hills and spate stream *Lōk-Mā* crosses the upper terrace).

*Shuāng-Zhá* is the non-capital hydraulic & `core/city` canal-way engineering testbed for **The Eternal State** (`culture: 'eternian'`), built directly on **`kits/transit`** (`KCANAL` / `TR_VESSEL`, read in place) and `kits/eternian`. It proves stepped multi-pound water surfaces (`core/water`), articulated zero-head bronze miter-lock flights (`KSCHED`), grade-separated navigable stone aqueducts, barge-clearing humpback wagon and foot bridges, zero street-over-canal intrusions (`KCANAL.clipStreetWays` + `KMASK` canal masking), full 6-ward / 4-quadrant street-frontage population (`KCITY`), `'vessel'`-tagged canal craft (`et_canal_barge`, `et_tow_scow`, `et_inspection_launch`) executing continuous end-to-end lock + bridge + aqueduct + turning-basin round trips, continuous walkable towpaths (`KWALK`), and `SIM` inland barge freight economics before *Fulcrum / Eternal City* (`px 625, 725`).

## Hydraulic Architecture (`16.00 m` Total Drop, 4 Stepped Pounds)

| Pound | Water Level (ASL) | Works & Reach |
|---|---|---|
| **`P3`** | **`+61.87 m`** | `Hāk-Mā` (`r012`) cut-stone ogee diversion weir (`tr_intake_weir`), floating ironwood trash boom, forebay & 3-bay celadon desilting head-regulator (`tr_sluice_gate`). |
| **`P2`** | **`+58.87 m`** | Headrace, `90 × 45 m` silt settling basin, ancestor-mouth waste-weir spillway (`et_spillway` returning surplus flow to *Hāk-Mā*), and the **3-arch *Lōk-Mā* stone masonry navigable aqueduct (`tr_culvert_aqueduct`)** carrying `P2` barges cleanly `+4.10 m` over the incised *Lōk-Mā* stream (`+51.00 m`). |
| **`L2` Flight** | `58.87 -> 52.47 m` | Paired 2-riser twin-chamber bronze miter-lock flight (`2 × 3.20 m` lift, `4` chambers `L2a/b_low/high`) with live `et_canal_barge` round-trip lockage. |
| **`P1`** | **`+52.47 m`** | Rectilinear Middle Burgh `canal_trunk` (`20 m` ROW / `11.0 m` wet), `56 × 48 m` central Turning Basin with 4 slewing cargo cranes (`tr_cargo_crane`) & state granaries, East Kiln & West Market `canal_ward` laterals (`14 m` ROW / `7.6 m` wet), `2` wagon bridges (`tr_cart_bridge`, `2.98 m` air-draft) and `6` pointed-arch footbridges (`et_bridge`, `2.78 m` air-draft). |
| **`L1` Flight** | `52.47 -> 45.87 m` | Paired 2-riser twin-chamber bronze miter-lock flight (`2 × 3.30 m` lift, `4` chambers `L1a/b_low/high`) with live `et_canal_barge` round-trip lockage (`Barge transiting lock` view). |
| **`P0`** | **`+45.87 m`** | Sheltered *Jìng-Hǎi* lakefront harbour basin enclosed by Khmer-stepped stone breakwaters, Farport-pattern stone quays (`et_quay`), harbour beacon (`et_lighthouse`), barge drydock (`et_dock`), and ferry/fish landings. |

## Build, Test & Verify

```bash
# 1. Plain-Node [G data] + KTAGS + end-to-end lock-transit suite (23 asserts + paired negatives)
node settlements/eternian-canal/tests/test-eternian-canal.js

# 2. Recorded build (reads kits/transit/src + kits/eternian/src in place)
python3 tools/build.py settlements/eternian-canal

# 3. Headless Chromium WebGL verification + screenshots
KRATOR_CHROME=/usr/bin/chromium python3 settlements/eternian-canal/verify.py \
  settlements/eternian-canal/dist/eternian-canal.html --assert --no-cache \
  --out settlements/eternian-canal/shots
```

## Query Flags & Live Inspector API

- `?lockPhase=<sec>` — freeze the hydraulic miter-lock & barge-transit cycle at `<sec>` seconds (`_api.setLockPhase(sec)` / `_api.lockState(t)` / `_api.bargePoses(t)`).
- `?night=1` — open directly at `21:30` with verdigris canal lanterns, bridge lamps, and oculus windows lit (or press **`N`** / pick view `Night lanterns`).
- `?mat=proc` — procedural vertex-colour fallback without library sidecar maps.
- `?flora=0` — skip surrounding `biomes/nwlowlands` flora pass.
- `_api.canalChecks()` / `_api.hostChecks()` / `_api.simProof()` — live hydraulic, street-intrusion, ward-population, vessel-tag, transit-kinematics, and `SIM` carrier reports.
