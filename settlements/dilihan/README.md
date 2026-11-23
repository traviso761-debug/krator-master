# Dilihan (*Ḍeḷḷu-Hanḍu*, `solqo7hz7s`) — Premiere Izani Veterans' Settlement of the Cut

Dilihan (`px 744, py 663` on Scale Model 5.1, `-888.6 m` ASL, `1.79 atm`, `-31.50° S`) is the southern bench gateway and provincial capital of **Dilihan Province**, founded `~150 years` ago as a Jimjam *colonia* of veteran legionnaires and grown fourfold into an Izani commercial, bronze-foundry, and pass-customs city overlooking the `-1,608 m` SE sump of the **Cut Salt Lake** (`8 km` north).

See `PLAN.md` for the complete architectural, astronomical, geological, and census specification, `PORT.md` for fragment port tags, and `palace/BLUEPRINT.md` + `palace/FURNITURE.md` for the Governor's Palace floor plans and `kits/catalog/iziz` furnishing manifest.

## Build, Test & Verify

```bash
# 1. Run deterministic [G data] Node test suite (18 assertions + negative controls)
node settlements/dilihan/tests/test-dilihan.js

# 2. Build dist/dilihan.html, dist/dilihan.tex.js & dist/build-inputs.json
python3 tools/build.py settlements/dilihan

# 3. Optional data / palace blueprint regeneration
python3 settlements/dilihan/build.py --bake-model
python3 settlements/dilihan/build.py --bake-palace

# 4. Headless WebGL verification & preset view capture (harness.SURVEY)
python3 settlements/dilihan/verify.py settlements/dilihan/dist/dilihan.html --assert --all-views --out settlements/dilihan/shots
```

## Five Urban & Hinterland Zones

1. **Zone 1 — The Old Quarter (*Colonia*, `0.250 km²` inside gated Jimjam brick-and-marble circuit wall, `jimjam: 1.0`):** `KCITY` `frontage-courts` courtyard infill on the `-892 m` projecting bedrock spur above a `30 m` `contact-marble` and granite scarp; raised `contact-marble` **Forum** with sunray inlay & Jamṭōkku Count gnomon; re-aimed **`jj_temple_sun`** sighting the `-31.50° S` summer solstice sunset (`day 350`, `hour 18.6572`, `+4.00°` alt, `Az 245.39°`) cleanly above the `+3.58°` SW Cut rim; Praetorian fortress, cohort barracks, library, school, and NW scarp-cut amphitheater.
2. **Zone 2 — The Governor's Precinct (`70 × 56 m` walled grounds at `-878 m` join):** **`dl_gov_palace`** (`VASSAL-KITS.md` §3 massing in Jimjam banded red-and-yellow brick, `1.2 m` `contact-marble` podium, patterned-shaft loggia, **gold onion dome** on 16-window drum with Cut signal-room lantern, **seven round chhatri pavilions** including ribbed-slate Veterans' Council & Chancery domes and vented round kitchen with Tudor stack, **Iziz orange restricted to banners, forecourt gate, and window/arch reveals**, and indexed `KFURN` `iziz` catalog furniture), flanked outside by `IZV` guard tower, garrison barracks, Council Hall, and Quiet-Copy assay hall.
3. **Zone 3 — The Vernacular Districts (`1.000 km² = 4.0×` the *colonia*, `iziz-vernacular: 0.9`, `jimjam: 0.1`):** `KCITY` `alleys` + main streets; paired **Wall-Street** facades scaled via `o.scale` (`<= 0.08 m` cornice mismatch); skarn tin-bronze foundries & Quiet-Copy workshops; Eastern muster ground; North **Jimjam Caravanserai** & highway gate (`izani.north.dilihan`); and `8` active **`KCONS` + `KCITY.constructMesh`** scaffolded expansion lots.
4. **Zone 4 — The Lower Town (`-923 m` at pass-road fork):** Customs & Lipp-seizure assay post, walled **Hykkousoi League envoys' house** with central rainwater cistern court, three-arch `contact-marble` bridge over the perennial West-Wall spring stream, spring aqueduct arcade, inns, and SE **Port Visas** rock-cut highway tunnel portal (`izani.dilihan-portvisas`).
5. **Zone 5 — The Country (*Ḍeḷḷu-Hanḍu*):** `8` orthogonal veteran allotment hamlets (`KHAMLET.village`, `~4,000` rural + `12,000` urban = `16,000` metropolitan census), `CROPS` Cut paddy/measuremelon/taro/emmer/olive plots, NW brickkilns, NE tin (`200`) & magnetite-skarn iron (`255`) adits (`RES_ORE`), N `-1,608 m` Cut Salt Lake `D2` potash/halite pans, and warped `biomes/cut` + `nwlowlands` + `nhighlands` flora.
