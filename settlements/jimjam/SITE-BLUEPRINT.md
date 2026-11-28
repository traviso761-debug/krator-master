# Jimjam (`st5e01l76v`) — Voth-Sized `50,000` Site Blueprint

Machine-readable specification: [`site/jimjam-site.json`](site/jimjam-site.json)  
Generated site masterplan sheet: [`palace/floors/S0_site.png`](palace/floors/S0_site.png)  
Companion architectural blueprints:
- [`palace/BLUEPRINT.md`](palace/BLUEPRINT.md) — **The Raja's Palace & Great Sunray Plaza** (`jj_palace` + `jj_palace_plaza`)
- [`temples/BLUEPRINT.md`](temples/BLUEPRINT.md) — **The Solar Acropolis (`jj_temple_sun`, Four Schools, Raja's Eye), the Six Moon Temples & the Five (+1) Planetary Shrines**
- [`landmarks/BLUEPRINT.md`](landmarks/BLUEPRINT.md) — **The Decayed Izani Governor's House (*Sid'kiñ-Pāḷu*), Order of Historians Chapterhouse & Great Pilgrim's Market**

---

## 1. World Frame, Voth-Scale Census & Topographic Fit

| Parameter | Canonical Value | Notes |
|---|---|---|
| **Settlement ID & Pin** | `st5e01l76v` at Scale Model 5.1 **`px = 745, py = 546`** | World `(-892,000 m E, -2,046,000 m S)`, local `+x` East, `-z` North, `+z` South |
| **Latitude & Sub-Giant Lon** | **`-34.34° S`**, `subGiantLon = 56.27°` | Giant fixed at **`Az 70.5°` ENE, `Alt +28.1°`** (`30°` disc); Summer Solstice sunset (`day = 350`, `Alt +3.00°`) at **`Az 244.04°` WSW** (`18:51`) |
| **Elevation & Lake Datum** | Pin **`+486.2 m`** above Great Trough Lake **`+429.78 m`** (`lbl = 77`) | `1.506 atm` (`dense` air), `Am` monsoon (`25.0 °C` mean, `1,176–1,459 mm/yr`); `28 km²` at `≤ 25 m/km` (`84 km²` at `≤ 40 m/km`) within `6 km` |
| **Canonical Census** | **`50,000` urban residents** (`~10,415` households) + **`8,500` slice hinterland** | Voth-scale metropolis (`4,100–4,600` buildings across `12.815 km²`, `4.6 × 4.0 km` envelope); `79,000` in `JJ1`; `103,500` single-counted across `JJ1`–`JJ4` |
| **Seasonal Pilgrim Surge** | Baseline `+1,100`; **Double Dark `+8,500`**; **Solstice / Great Round `+15,000`** | Simulated via dual-LOD `SIM.pilgrimage` (`77-sim-6p-pilgrims.js`) so on-screen `presented` actors never breach the `50,000` cap |
| **Lighting Ethos** | **Traditional flame preferred** (`whorl-olive` oil lamps, brass *dīpam* trees, braziers), extinguished citywide on the *Double Dark* | Clean **electric circuits** reserved for high-precision/institutional rooms: *Raja's Eye* chronograph, Palace bullion vault & chancery, West Mole harbour beacon, History Monks' oculus, and the Republican Guild minder's collimator |

---

## 2. Urban Envelope, Wall Circuit, Gates & Sightline Corridors

The walled city and its harbour/caravanserai suburbs span **`x = -1,850..+2,250 m` (`4.1 km` E–W intramural, `4.6 km` with East Maidan)** by **`z = -2,000..+1,850 m` (`3.85 km` N–S)**, stepping up `114 m` from the `+429.78 m` NNW pocket cove to the `+544 m` southern Cut-road crest:

### 2.1 Seven Gates, Four Corridors & Three Axial Spines
1. **Harbour–Palace–Cut Spine (`Az 336° <-> 156°`):** Runs from the **Lotus Water-Gate** `(-680, -1580)` at the head of the dredged NNW barge basin (`+432.0 m` quay), climbs past the **Octagonal Temple of Companion** `(-80, -860)` onto the **Great Sunray Plaza** `(-34.6, -37.7)` and **Raja's Palace** `(0, +40)` at `+496.0 m`, then continues south past the **13-Tier Temple of the Thirteen** `(180, +720)` and **Slope Amphitheater** `(-180, +1060)` through the **Sun-Road / Cut South Gate** `(60, +1250)` into the **Great Pilgrim's Market** `(-180, +1440)` and **Cut Caravanserai** `(180, +1420)`.
2. **White-Pass & Northern Trans-Rim Corridor (`gate.whitepass_north` at `(380, -1480)`, `Az 12°` NNE/NNW):** With the Scale Model 5.1 **White Pass** opening (`edit_530_white_pass.py`: `Ria Sound` / `Yonni` coasters -> `Arkerum` on Matron's Coast -> `5,400 m` **White Pass** -> Yeti toll-town of **`Whitelake`** -> `Qoold Lheek` / `Leng` -> `Veladiga` / `Ciṉṉa-āṟu`), and because the Yeti Kingdom conducts zero peaceful trade with the Eternal State, **Jimjam is the primary crater-interior entrepôt for the White Pass trade route**. Arriving Khaayken `qiviut`/`goldroot`/`lung-salt` pack-trains, `Arkerum` mollusc-chitin & nacre merchants, and **`Yonni`** + **`Rian`** scholar-pilgrims berth inside a dedicated **White-Pass Factor Compound (`jj_whitepass_compound` at `(340, -1380)`)** immediately inside the White-Pass North Gate—`1.0 km` east of the Lotus Water-Gate so Khaayken Yeti traders and regulated Eternian barge cohorts never clash on the waterfront!
3. **Equatorial & `Serai` Cross-Axis (`Az 90° <-> 270°`):** Runs from the **Veil-Headland West Gate** `(-1850, +640)` past the **Chapel of Veil** `(-1460, +620)` and **Two-Faced Temple of the Week** `(-920, +740)`, crosses the central spine by the **Order of Historians Chapterhouse** `(460, +640)`, and climbs leeward through the **Day District** kilns to the **Serai & Ardent East Gate** `(2250, +120)`.
4. **Giant-Sight Diagonal (`Az 70.5° ENE <-> 250.5° WSW`):** Links the **Solar Acropolis** `(-820, -80)` across the Palace north terrace and **Four-Day Lotus Tank** `(860, -560)` to the **Giant-Bluff North-East Gate** `(1150, -1250)` and **Giant-Gaze Panorama Steps** `(680, -1480)`.

### 2.2 Mandatory Raycast Sightline Corridors (Zero Obstruction Rules)
- **Summer Solstice Sunset Corridor (`temple_sun` at `(-820, -80, +514 m)`, eye `+527.7 m`, `Az 244.04°` WSW, `Alt +3.00°`):** Across `Week District` (`x = -1850..-1150, z = +40..+480`), a `180 m`-wide **Solstice Clearance Garden** caps roof heights at `≤ 9.0 m` on `+482..+492 m` ground (`≥ 26 m` below the ray!), and extramural WSW headland `jj_windmill` towers are excluded from `Az 239°..249°`.
- **`Veil` Greatest Elongations (`Az 294.04°` WNW & `Az 194.04°` SSW):** Clear from both the Solar Acropolis western parapet (`+514 m`) and the **Chapel of Veil** (`-1460, +620`).
- **Fixed Giant & Occultation Limb (`Az 70.5°` ENE, `Alt +28.1°` ± `15°`):** Clear from `rajas_eye`, `temple_twoday`, `temple_day`, `temple_week` (east clinker face), `temple_thirteen` (tar-mirror pool), and the `Giant District` ghats.
- **Fixed Trojan `Companion` (`Az 353.3°` N, `Alt +56.1°`):** High northern elevation (`56.1°`) clears every surrounding courtyard wall automatically for `temple_companion`'s vault oculus.

---

## 3. Zone & District Allocation (`50,000` Urban + `8,500` Slice Hinterland)

| Zone ID | Celestial / Urban Role | Strategy | Area (`km²`) | Elev (`m`) | Residents | Key Landmarks & Sim Role |
|---|---|---|---:|---|---:|---|
| `zone1.sun` | **Sun District** (*Sūriya-Vaṭṭam*) | `precinct` | `1.200` | `490–520` | `4,200` | `jj_palace` + `jj_palace_plaza`, `jj_temple_sun`, `rajas_eye`, Four Calendar Schools, `shrine_crown` |
| `zone2.companion` | **Companion District** (*Tuṇai-Maṇi*) | `frontage-courts` | `0.800` | `462–490` | `4,400` | `temple_companion` (`Az 353.3°, Alt +56.1°`), 13-Hour Bell Tower, Notaries, Eternian Quota-Hostel |
| `zone3.giant` | **Giant District** (*Periya-Vāṉ Karai*) | `waterfront` | `1.725` | `430–468` | `7,600` | NNW Barge Basin (`25 t` hulls), Lotus Water-Gate, `Hykkousoi` Gill-Ghats, Giant-Gaze Bluff Steps |
| `zone4.twoday` | **Two-Day District** (*Iraṇḍu-Maṟai*) | `frontage-courts` | `0.960` | `460–502` | `4,300` | `temple_twoday` (`Az 70.5°` occultation *jalis*), Ruby-Sibyl Whispering Booths, NW Lotus Tank |
| `zone5.week` | **Week District** (*Vīkku-Nīti*) | `frontage-courts` | `1.910` | `478–514` | `7,200` | `temple_week` (W marble / ENE clinker), High Law Courts, `shrine_veil`, Solstice Garden |
| `zone6.thirteen` | **Thirteen District** (*Tarṭīn-Kaṇakku*) | `frontage-courts` | `0.990` | `500–526` | `6,200` | `temple_thirteen` (`13` tiers + Tar Pool), Almanac Presses, **Order Chapterhouse**, `shrine_frost`, `jj_amphitheater`, *Dharmashalas* |
| `zone7.fourday` | **Four-Day District** (*Nālu-Kuṇam*) | `frontage-courts` | `1.540` | `465–502` | `6,800` | `temple_fourday` (`96 × 96 m` 4-basin lotus tank), 4 Humoral Baths, Indigo/Saffron/Wineweed Dye-Vats |
| `zone8.day` | **Day District** (*Pakal-Kiḷnu*) | `alleys` | `2.010` | `478–522` | `7,100` | `temple_day` (`Az 27°–88.3°` fan), `1.51 atm` Brick/Tile Kilns, Optical Glassworks, `shrine_rust_cinder`, `shrine_ash` |
| `zone9.izani` | **Former Izani Enclave** (*Sid'kiñ-Mēṭu*) | `alleys` | `0.500` | `516–538` | `1,400` | **Decayed Izani Governor's House** (`70 × 56 m`), `shrine_wanderer`, Dilihan Factor Row (`izv_*`), `jj_fortress` on Castra plinth |
| `zone10.pilgrim_gates` | **Pilgrim Gate Suburb & Market** | `frontage-courts` | `1.180` | `520–544` | `800` *(+`16k` camp)* | `jj_caravanserai`, **Great Pilgrim's Market** (`320 × 220 m`), Cut-Gate & Serai-Gate Tent Maidans (`core/camp`) |
| **Urban Total** | **10 Urban Zones** | — | **`12.815`** | **`430–544`** | **`50,000`** | `~3,902` residents/km² mean (`~4,350` buildings) |
| `zone11.handu` | ***Hanḍu* Slice Hinterland** | `hamlet-grid` | `36.000` | `431–585` | `8,500` | `6` `KHAMLET` villages (2 rhythmite brick/gypsum, 3 *hanḍu* rice/cotton/indigo, 1 headland mill/fishery) + WSW `jj_windmill` battery |
