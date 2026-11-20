# The Iron Republic (`rmufxti8qwcxy`) — Swiss-Alpine & Great-Lake Terrain Overhaul, Settlement Siting, Cantons & Economy Proposal

**Status:** Draft for owner review (2026-11-18) — **no tracked files modified; all terrain, hydrology, and climate diagnostics simulated in memory**.
**Companion specs:** [`PROPOSAL-VOTH.md`](file:///home/antigravity/traviso761-debug/krator-master/core/simulation/PROPOSAL-VOTH.md) (`Drum` `673,932` & Karst Tunnel), [`PROPOSAL-IZIZ-EXCLAVES.md`](file:///home/antigravity/traviso761-debug/krator-master/core/simulation/PROPOSAL-IZIZ-EXCLAVES.md) (`Dilihan D3` `Aidol` `712,628` facing `Lipp` `691,619`), [`PROPOSAL-RAIDING-FACTIONS.md`](file:///home/antigravity/traviso761-debug/krator-master/core/simulation/PROPOSAL-RAIDING-FACTIONS.md) (`Scyvoi` `B1`–`B7`), [`PROPOSAL-XANADU.md`](file:///home/antigravity/traviso761-debug/krator-master/core/simulation/PROPOSAL-XANADU.md), [`TRADE-SCOPE.md`](file:///home/antigravity/traviso761-debug/krator-master/openworld/TRADE-SCOPE.md), and [`TRADE-GOODS.md`](file:///home/antigravity/traviso761-debug/krator-master/openworld/TRADE-GOODS.md).
**Diagnostic prototype & raw output:** [`scan_iron_republic.py`](file:///home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/2cc633ac-367f-4e4f-810d-7efa147d63ef/scratch/scan_iron_republic.py) -> [`iron_republic_census_out.txt`](file:///home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/2cc633ac-367f-4e4f-810d-7efa147d63ef/scratch/iron_republic_census_out.txt).

---

## Executive Summary

On Scale Model 5.1, **The Iron Republic (`rmufxti8qwcxy`)** covers **`34,532` cells (`138,128 km²`** — **`3.34×` modern Switzerland**, `444 km` E–W × `712 km` N–S across `px = 498..723, 559..915`). Geopolitically and culturally ([`LORE.md`](file:///home/antigravity/traviso761-debug/krator-master/LORE.md#L281-L320), [`DESIGN.md`](file:///home/antigravity/traviso761-debug/krator-master/settlements/highlands/DESIGN.md)), it is Krator's **high-alpine industrial confederation**: a syndicate-governed Hajlandsk republic (*Tinget*) of blast furnaces, water-turbine arcologies, rocket arsenals, precision horology/optics guilds, and Ancient-ruin salvagers, fiercely guarding its technological monopoly behind natural mountain walls.

Yet 5.1's raw heightfield inside the polygon does **not** currently look or behave like Switzerland:
1. **The Interior Saucer Problem:** Behind the great eastern Inner Wall (`+4,200..+6,291 m`, shielding the Republic from `Scyvoi` and `Voth`), the central heartland (`X = 525..632, Y = 660..845`) is a **broad, nearly flat `2,800..3,400 m` tableland** (`37,332 km²` / `28.6%` of all dry land at median slope `0.022`) holding **one featureless, shallow `7,152 km²` saucer lake** (`lbl=131`, `wlev = 2,400.0 m`, median depth `137 m`, max depth `172 m`).
2. **Disconnected Cities & Dormant Hydro-Power:** `Roketstad` (`632,716`), `Glaive` (`599,734`), and `Stahlborn` (`627,868`) sit on dry upland benches `11–35 km` from navigable water, while `Cascade` (`568,841`, a living hydro-industrial arcology!) sits on a gentle `+2,783 m` hill rather than a thundering glacial spillway cataract.

This proposal specifies and quantitatively tests in memory (**`edit_520_republic_alps.py`**):
- **7 steep, glaciated Swiss-style massifs (`M1`–`M7`, peaks `+4,558 m` to `+6,021 m`)** and **6 defended alpine passes (`P1`–`P6`, `+2,295 m` to `+3,429 m`, Gotthard / Simplon / Brünig / Bernina analogues)** splitting the old flat saucer into distinct föhn-warmed glacial troughs, raising cliffy alpine relief (`slope >= 0.15`) from `7,016 km²` (`5.4%`) to **`12,000 km²` (`9.1%`)** while keeping **`max |dE| = 0.0000 m`** outside the pure Iron Republic polygon.
- **7 deep glacial ribbon, cruciform-fjord, and piedmont lakes (`L1`–`L7`, `6,288 km²` total, `240–640 m` max depth, *Zürichsee / Vierwaldstättersee / Lac Léman / Brienzersee / Bodensee / Lugano / Silsersee* analogues)** stepped from `+2,880 m` down to `+2,220 m`, verified via `priority_fill` to spill cleanly over **7 rock-cut cataracts generating `5,573.9 MW` gross hydraulic power** (`3,901.7 MW` at 70% hydro-turbine efficiency — including **`3,134.6 MW` (`3.13 GW`)** right past **`Cascade`**!).
- **2 pin relocations + 3 new Republican cities/burghs:** Keeping `Roketstad` (`632,716`), `Cascade` (`568,841`), `Lipp` (`691,619`), and `Footfall` (`560,767`), relocating **`Glaive` (`599,734 -> 599,721`)** onto *Korsvatn*'s fortified northern fjord-head and **`Stahlborn` (`627,868 -> 618,859`)** onto *Stålsjö*'s copper-zinc-skarn-marble shore, and founding ***Urverkstad*** (`591,801`, `8,500` pop, clockwork, salvage-glass optics & federal bourse metropolis), ***Slussport*** (`576,693`, `3,200` pop, western customs lock on *Nordsjö*), and ***Korshamn*** (`627,740`, `2,600` pop, 4-arm fjord ordnance & barge hub).
- **6 Cantons (`R1`–`R6`, *De Sex Ting-Kantonerna*)** partitioning `100.0%` of the `138,128 km²` territory, grounding the Republic at **`165,000` total citizens** (`50,300` urban/arcology + `2,950` named mines/camps + `111,750` rural across ~280 alpine `KHAMLET` villages, vs Gemini's inflated `302,800`), and wiring its **sulfur/coal/salt/quartz deficits** directly into the `Aidol` Quiet-Copy gate, *"The Raja's Eye"* telescope trade with `Jimjam`, and the `89 km` `Cascade <-> Drum` Karst Tunnel.

---

## 1. Current Scale Model 5.1 Baseline Audit (`rmufxti8qwcxy`)

### 1.1 Footprint, Hypsometry & the Flat Interior Saucer

| Metric | 5.1 Baseline Value | Diagnostic / Structural Issue |
|---|---|---|
| **Region ID & Kind** | `rmufxti8qwcxy` (`political`, `38` vertices) | Strictly **landlocked off the Ring Sea** ([`LORE.md`](file:///home/antigravity/traviso761-debug/krator-master/LORE.md#L1163)); nearest sea is `>36 km` E across `Dilihan` / `Scyvoi` / `Voth` |
| **Total / Pure Area** | **`138,128 km²`** (`34,532` px) / **`136,976 km²`** pure | `130,624 km²` (`94.6%`) dry land, `7,504 km²` (`5.4%`) inland lake surface |
| **Bounding Box (`2 km/px`)** | `X = 498..723` (`450 km`), `Y = 559..915` (`712 km`) | Resolves stale 4.x note in [`LORE.md`](file:///home/antigravity/traviso761-debug/krator-master/LORE.md#L758) (`px 226`): 5.1 IR stops at `px 498`, east of `Corpus` (`520,693`) & `Lux` (`495,645`) |
| **Dry Elevation (`m`)** | `min = -194.2` (`710,596` NE tip), `p50 = 3,332.9`, `max = 6,290.6` (`637,758`) | `p10 = 2,175 m`, `p25 = 2,928 m`, `p75 = 4,405 m`, `p90 = 5,112 m`, `p99 = 5,965 m` |
| **Barometric Pressure** | `0.73..1.65 atm` (`p50 = 1.07 atm`, `p5 = 0.80`, `p95 = 1.29`) |Krator `1.6 atm` sea-level baseline keeps `2,200..3,000 m` lake valleys at breathable **`1.10..1.21 atm`**! |
| **Dry Slope (`|∇E|`)** | `median = 0.034`, `p90 = 0.099`, `>= 0.15` = `7,016 km²` (`5.4%`) | **`2,800..3,400 m` band (`37,332 km²` / `28.6%`) has `median slope = 0.022`** — a flat table, not alpine valleys |

**Existing 5.1 Waterbodies inside `rmufxti8qwcxy` (`7,504 km²` total):**
1. **`lbl=131` (Central Saucer Lake):** **`7,152 km²`** (`552..608, 725..843`), `wlev = 2,400.0 m`, `median depth = 136.7 m`, `max depth = 171.7 m` — a single wide, shallow pan occupying the southwest-central plateau.
2. **`lbl=134` (NE Upland Tarn):** `192 km²` (`628..636, 703..710`), `wlev = 3,000.0 m`, `max depth = 97.6 m` (north of `Roketstad`).
3. **`lbl=130` (Roketstad South Pond):** `64 km²` (`628..631, 721..724`), `wlev = 2,987.0 m`, `max depth = 30.8 m`.
4. **`lbl=150` (SW Border Pool):** `64 km²` (`509..513, 881..884`), `wlev = 1,859.0 m`, `max depth = 50.8 m` (mostly outside IR in the SW piedmont).
5. **`lbl=143` & `lbl=109`:** Two `16 km²` (`4 px`) puddles (`582..583, 839..840` and `615..616, 616..617`).

### 1.2 Baseline Climate & `49r` Surface Potential

- **Rainfall & Temperature (5.1 Dry Land):** `median = 745 mm/yr` (`mean = 805 mm`, `p10 = 330 mm` on rain-shadowed eastern/southern crests, `p90 = 1,459 mm`, `max = 2,824 mm` on the NW windward front); `tm` median **`9.0 °C`** (`p10 = -2.0 °C`, `p90 = 15.0 °C`), `tw = 21.0 °C`, `tc = -3.0 °C`.
- **Köppen Classes (`130,624 km²` dry):** `Dsb` `24,548 km²` (`18.8%`), `Csb` `19,684 km²` (`15.1%`), `Dfc` `19,208 km²` (`14.7%`), `Cfa` `17,628 km²` (`13.5%`), `Csa` `12,308 km²` (`9.4%`), `ET` `12,104 km²` (`9.3%`), `Dfb` `11,592 km²` (`8.9%`), `Dsc` `7,336 km²` (`5.6%`), `Cfb` `3,468 km²` (`2.7%`), `BSh/BSk/Dfa/Dsa/Aw` `2,748 km²` (`2.1%`).
- **Baseline `49r` Indices:** `Farm-eq = 57,746.3 km²` (`mean 0.442`, unrealistically inflated by the flat `2,800..3,400 m` interior table), `Pasture-eq = 70,435.3 km²` (`mean 0.539`), `Timber-eq = 45,713.3 km²` (`mean 0.350`).

### 1.3 Baseline River Network

Almost every major river rising in the Iron Republic drains **west or northwest** into the `Eternal State` / `Jimjam` / `Dilihan` continental interior, while only short eastern torrents (`Cakmak Riviri`) plunge east down the Inner Wall toward `Scyvoi`:

| River ID | Name | Mouth $Q$ (`m³/s`) | Length (`km`) | Pts in IR | Source -> Mouth (`px`) | Hydrological Role |
|---|---|---:|---:|---:|---|---|
| `r004` | **Kaskejt Rivr** | **`760.8`** | `444` | `31` | `(584,825) -> (422,879)` | Trunk outlet of the southern lake trough past **`Cascade` (`568,841`)** into the SW lowlands |
| `r010` | **Blak Bruk** | **`369.3`** | `117` | `46` | `(618,751) -> (576,781)` | Main central collector feeding the western lake chain |
| `r014` | **Hōng-Mā** | **`330.4`** | `573` | `15` | `(604,686) -> (380,680)` | NW trunk river exiting along the `Corpus–Roketstad` highway corridor into `Eternal State` |
| `r027` | **Nīla-āṟu** | **`139.6`** | `369` | `1` | `(658,640) -> (552,550)` | Northern granite-front river draining NW toward `Palewharf` / `Dilihan` |
| `r029` | **Periya-āṟu** | **`122.3`** | `400` | `8` | `(692,620) -> (586,518)` | Rises right at **`Lipp` (`691,619`)**, flowing NNW along the Dilihan march |
| `r281` | **Frost Rivr** | **`85.3`** | `107` | `34` | `(602,859) -> (552,857)` | Drains the southern Cu/Zn/skarn trough W into `Kaskejt Rivr` |
| `r051` | **Silvr Bruk** | **`77.8`** | `135` | `59` | `(630,721) -> (590,749)` | Rises right below **`Roketstad` (`632,716`)**, running WSW into the central basin |
| `r179` | **Cakmak Riviri** | **`25.6`** | `150` | `8` | `(620,853) -> (690,841)` | **Only east-draining trunk**: cuts from SE Republic down into `Scyvoi` (`2.49` rich tin placer!) |
| `r279` | **Ajrn Bruk** | **`21.4`** | `36` | `10` | `(530,881) -> (512,881)` | SW border brook cutting across the Republic's sole low-grade coal seam |

### 1.4 39-Family Geology, Lodes & Strategic Bottlenecks

Scanning [`geology.json`](file:///home/antigravity/traviso761-debug/krator-master/kits/resources/data/geology.json) (`8,358` land cells = `133,728 km²`; **`67.9%` `volcanic-arc`**, **`18.7%` `platform`**, **`7.6%` `granite`**, **`5.3%` `basin`**, **`0.6%` `shield`**, plus **`416 km²` (`26` cells) of `ruin_ground`** around `Footfall` `560,767`) reveals a razor-sharp industrial profile:

| Tier | Mineral Family | Good `>=100` (`km²`) | Rich `>=170` (`km²`) | Max Byte | Lodes (`AllYield` / `GoodYield`) | Key Peak / High-Byte Lode Coordinates (`px, py`) & Economic Meaning |
|---|---|---:|---:|---:|---:|---|
| **Core Strategic** | **`iron`** | **`72,112`** | **`27,376`** | **`255`** | `370` (`2,487` / `1,720`) | Peak `(662,730)` `b=255`; **planet-#1 unworked lode `(558,883)` `yield=47.0, b=180`** ([`RESOURCES-SETTLEMENTS.md`](file:///home/antigravity/traviso761-debug/krator-master/openworld/RESOURCES-SETTLEMENTS.md#L73)); `(627,828)` `y=30.0, b=255` |
| **Core Strategic** | **`saltpeter`** | **`25,968`** | `0` | **`127`** | `135` (`1,106` / `327`) | Peak `(638,779)` `b=127`; `(638,671)` `y=24.8, b=127` — **oxidizer backbone for Roketstad's rockets** (`LORE.md:283`)! |
| **Alloy & Mint** | **`tin`** | **`3,680`** | **`3,680`** | **`200`** | `41` (`177` / `146`) | `(705,606)` `b=200` (queued *Lipp tin mine*); `(612,860)` `y=15.0, b=200`; plus `r179` **`2.49` high-grade tin placer** `(625.5,849.8)` |
| **Alloy & Mint** | **`nickel`** | **`2,208`** | **`1,472`** | **`220`** | `24` (`92` / `60`) | `(585,872)` `y=15.0, b=220`; `(699,606)` `b=220` — **high-tensile rocket casings, turbine blades & armour steel** |
| **Clockwork Brass** | **`copper`** + **`zinc`** | **`2,336`** ea | `784` / `0` | `170` / `136` | `14` / `15` | Co-located in S skarn belt `(594,859)` & `(618,859)` (`Cu=170, Zn=136`) -> **native brass for horology, cartridge cases & telescope mounts!** |
| **High-Tech / Mint** | **`rare-earth` / `gold` / `silver`** | **`7,968`** ea | `0` | `160` / `110` | `39` / `28` / `26` | Granite batholiths in `R5` `(582..614, 860..888)` & `R6` `(695..708, 602..618)` (`REE=160` -> magnets, specialty glass dopants, `Aidol` smuggling!) |
| **Flux & Stone** | **`limestone` / `marble` / `skarn`** | `14,208` / `7,072` / `2,336` | `0` / `0` / `2,336` | `115` / `104` / `200` | `20` (`marble`) | Blast-furnace flux (`limestone`), Republican guildhall ashlar (`marble`), and contact-metamorphic `skarn` + `emerald` (`16` nodes, `b=96`) |
| **Ceramics & Fuel** | **`clay` / `peat` / `wood`** | `2,016` / `64` / `32,448` | `1,984` / `0` / `14,912` | `255` / `110` / `255` | `30` / `246` / — | Refractory firebrick `clay=255` at *Nordsjö* `(586,685)` & SW `(525,865)`; `246` highland `peat` bogs (domestic fuel + peat-smoked `scotch`) |
| **CRITICAL DEFICIT** | **`sulfur`** | **`0`** | **`0`** | **`0`** | **`0`** | **ZERO native sulfur anywhere in `rmufxti8qwcxy`!** Black powder, vulcanization & sulfuric acid **require imported sulfur** (Voth `Drum` `max 170`!) |
| **CRITICAL DEFICIT** | **`coal`** | **`0`** | **`0`** | **`63`** | `17` (`9.6` / **`0.0`**) | Only `17` sub-economic lignite/peat-coal nodes (`b=36..63`) on SW `Ajrn Bruk` `(510..520,880)` — **explains why hydro-turbines & charcoal rule!** |
| **CRITICAL DEFICIT** | **`halite` (salt)** | **`0`** | **`0`** | **`21`** | **`0`** | **Zero rock-salt lodes (`max 21`)** — alpine dairy (`cheese`) & winter meat curing **must import salt** from `Eternal State` / `Dilihan` / `Voth`! |
| **CRITICAL DEFICIT** | **`quartz` (optical)** | **`0`** | **`0`** | **`30`** | **`0`** | **Zero crystal-grade quartz (`max 30`)** — geologically proves [`LORE.md`](file:///home/antigravity/traviso761-debug/krator-master/LORE.md#L677): **Guild telescopes MUST grind Salvagers' Ancient glass from `Footfall`!** |

### 1.5 Political Polygon Overlaps & Border Pins

| Neighbour Polity | Region ID | Overlap (`km²`) | Border `<24 km` (`km²`) | Diagnostic & Recommended Cleanup |
|---|---|---:|---:|---|
| **Eternal State** | `r863594726` | **`400`** | `7,940` | Overlaps around **`Bastion` (`536,627`)**, which lies inside **both** polygons (`populations-gemini.json` assigns `Bastion` to `Eternal State`). Recommend trimming IR's NW vertex `6 px` SE so `Bastion` sits cleanly on the Eternal State side of the pass |
| **Scyvoi** | `ry4v6f6fvv` | **`372`** | `3,524` | Minor high-ridge sliver along the uninhabited `5,500+ m` eastern Inner Wall crest |
| **Dilihan Province** | `r7v2s1a53m` | **`212`** | `5,840` | Narrow pass-shoulder overlap between `Lipp` (`691,619`, IR) and `Aidol` (`712,628`, Dilihan `D3`, `43 km` ESE) |
| **Jimjam** | `r153762583` | **`168`** | `2,220` | Minor NW piedmont corner (`561..584, 646..671`); `floodzone` (`rc0eam6iym`, `184 km²` near) & `dam` lie cleanly NW outside IR |
| **Voth** | `r9dh228ca4` | **`0`** | `2,996` | Clean crest border; `Tzunfort` (`670,886`, `42 km` E) & `Drum` (`673,932`, `32 km` E of SE wall, **`89 km` tunnel** to `Cascade`) |
| **League** / **Frogmen** | `r35x72w5k9` / `rw7k8t9x2a` | **`0`** / **`0`** | `1,004` / `200` | `Trigon` (`722,740`, `2 km` E of IR vertex `[723,759]`); Frogmen `Jrrmiah` (`557,959`) & `Krrmt` (`643,1023`) to the south |

---

## 2. Swiss-Style Alpine Massif & Great-Lake Terrain Overhaul (`edit_520_republic_alps.py`)

### 2.1 Boundary-Safety & Hydrological Contract

Following [`edit_515.py`](file:///home/antigravity/traviso761-debug/krator-master/tools/scale-model/edit_515.py), [`edit_517.py`](file:///home/antigravity/traviso761-debug/krator-master/tools/scale-model/edit_517.py), and [`edit_518.py`](file:///home/antigravity/traviso761-debug/krator-master/tools/scale-model/edit_518.py), `edit_520_republic_alps.py` operates strictly inside `pure_ir = ir_mask & (~other_pol_mask)` using an Euclidean distance feather `env_w = smoothstep(2.0, 6.5, dist_out_px)`:
- **`max |En - E| = 0.0000 m`** and **`0` wet cells changed** outside `pure_ir` (verified in [`scan_iron_republic.py`](file:///home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/2cc633ac-367f-4e4f-810d-7efa147d63ef/scratch/scan_iron_republic.py)).
- Preserves the great eastern Inner Wall (`+4,500..+6,291 m`) intact while replacing the flat interior saucer (`lbl=131`) with **7 steep craggy massifs**, **6 glaciated U-passes**, and **7 deep ribbon/cruciform lakes** stepped monotonically down from `+2,880 m` to `+2,220 m`, followed by `C.lapse()` and `C.reclimate()` (`10,131` cells recomputed).
- Harmonizes with [`settlements/highlands/targets/roketstad/84-rk-geo.js`](file:///home/antigravity/traviso761-debug/krator-master/settlements/highlands/targets/roketstad/84-rk-geo.js): `Roketstad` (`632,716`) keeps a gentle `2,949 m` river-terrace bench (`45 m` above `L1` ***Roketsjö*** at `2,860 m`) while gaining a dramatic `5,900 m` Bernese-Oberland backdrop (`M1` ***Jernhorn-Alperna***) `22 km` to its ESE.

### 2.2 Exact `MASSIFS` (`M1`–`M7`) & `PASSES` (`P1`–`P6`) Parameters

Each massif applies a glaciated horn-and-arête profile `add_m * max(0, 1 - (d/hw)^1.35)^1.15 * ridge_mod * env_w` along `pts`, modulated by deterministic spatial trig-harmonics (`ridge_mod` in `[0.78, 1.22]`, zero RNG state):

| ID | Hajlandsk Name & Swiss Analogue | Spine Polyline `pts` (`px, py`) | `hw_px` (`km`) | `add_m` (`m`) | Simulated Peak (`m` @ `px`) | `p90` (`m`) | Core Area (`km²`) |
|---|---|---|---:|---:|---|---:|---:|
| **`M1_jernhorn`** | **Jernhorn-Alperna** (*Bernese Oberland*, `Roketstad` E/NE backdrop) | `[(644,698), (646,716), (642,734), (636,752)]` | `7.5` (`15`) | `+1,650` | **`5,900.4 m`** `@ (643,732)` | `5,024` | `2,836` |
| **`M2_midtkam`** | **Midtkammen** (*Gotthard–Aar Massif*, splitting *Korsvatn* from *Glasklar-Sjö*) | `[(584,740), (596,758), (602,776), (610,796), (618,814)]` | `8.5` (`17`) | `+1,750` | **`5,784.7 m`** `@ (611,801)` | `5,141` | `5,076` |
| **`M3_nordvagg`** | **Nordväggen** (*Glarus–Säntis Wall*, between *Nordsjö* & *Roketsjö/Korsvatn*) | `[(578,704), (598,702), (618,698), (636,690)]` | `6.5` (`13`) | `+1,350` | **`4,665.2 m`** `@ (621,699)` | `4,371` | `2,240` |
| **`M4_vestkam`** | **Vestkammen** (*Jura–Chablais Barrier*, W march above `Footfall`) | `[(536,730), (542,756), (548,784), (552,812)]` | `7.5` (`15`) | `+1,300` | **`4,557.7 m`** `@ (546,773)` | `4,295` | `3,652` |
| **`M5_sydhorn`** | **Sydhorn-Kedjan** (*Valais–Pennine Chain*, between *Glasklar* & *Kaskejt*) | `[(560,816), (578,810), (596,818), (614,832)]` | `7.0` (`14`) | `+1,550` | **`6,021.4 m`** `@ (603,819)` | `5,410` | `3,940` |
| **`M6_kopparkam`** | **Kopparkammen** (*Engadin Skarn Ridge*, framing *Stålsjö* & *Cakmak* head) | `[(574,848), (594,848), (614,848), (628,852)]` | `6.0` (`12`) | `+1,350` | **`4,821.3 m`** `@ (585,848)` | `4,523` | `2,556` |
| **`M7_lippgranit`** | **Tinnspetsarna** (*Albula–Northern Granite Alps*, guarding `Lipp`) | `[(648,638), (664,630), (680,624), (696,608)]` | `7.0` (`14`) | `+1,250` | **`5,027.9 m`** `@ (678,625)` | `4,684` | `3,792` |

**Six Glaciated U-Shaped Strategic Passes (`PASSES`, carved cleanly across the massif saddles):**

| Pass ID | Name & Analogue | Polyline `pts` (`px, py`) | `hw_px` | Saddle `px` | Post `E` (`m`) | `Atm` | Clim | Strategic Corridor & Fortification |
|---|---|---|---:|---|---:|---:|---|---|
| **`P1_nordport`** | **Nordport-Paset** (*Burgundian / Basel Gate*) | `[(564,690), (576,690), (586,689)]` | `3.2` | `(575,693)` | **`2,295 m`** | `1.20` | `Cfa` | `Corpus` (`Eternal State`) <-> ***Slussport*** (`L5` *Nordsjö*) Ancient highway |
| **`P2_vastport`** | **Västport** (*Simplon Pass*) | `[(532,762), (546,764), (560,767)]` | `3.0` | `(546,764)` | **`2,889 m`** | `1.12` | `Csa` | Western `Eternal State` lowlands <-> **`Footfall`** (`L3` *Glasklar-Sjö*) |
| **`P3_korspas`** | **Korspaset** (*Brünig Pass*) | `[(594,690), (596,704), (599,718)]` | `2.8` | `(596,704)` | **`2,790 m`** | `1.13` | `Csa` | `L5` *Nordsjö* <-> **`Glaive`** (`L2` *Korsvatn* N fjord) internal rail/pack col |
| **`P4_midtpas`** | **Midtpaset** (*Gotthard Pass*) | `[(610,766), (598,772), (584,778)]` | `2.8` | `(598,772)` | **`2,940 m`** | `1.11` | `Cfb` | *Urner-Fjord* (`L2`) over *Midtkammen* to *Glasklar-Sjö* (`L3`) high military road |
| **`P5_stalpas`** | **Stålpaset** (*Bernina / Splügen Pass*) | `[(584,832), (598,848), (610,858)]` | `2.8` | `(598,848)` | **`2,952 m`** | `1.11` | `Csa` | *Kaskejt-Sjö* (`L4`) <-> **`Stahlborn`** (`L6` *Stålsjö*) & SE *Cakmak* tin gorge |
| **`P6_lipppas`** | **Lipppaset** (*Ofen / Flüela Pass*) | `[(678,632), (688,620), (696,621)]` | `3.0` | `(688,620)` | **`3,429 m`** | `1.04` | `Dsb` | *Malmtjärn* (`L7`) <-> **`Lipp` (`691,619`)** <-> Dilihan `Aidol` (`712,628`) |

### 2.3 Seven Deep Glacial Lakes (`L1`–`L7`), Spillway Cataracts & `5.57 GW` Hydro-Power

Replacing the single shallow `7,152 km²` saucer (`lbl=131`), `edit_520_republic_alps.py` carves **7 steep-walled glacial rock-basins (`6,288 km²` total)** with parabolic fjord bathymetry (`bed = wlev - 55 - (max_depth - 55)*(1 - rho^2)`), surrounded by `1.6×` föhn-warmed shore benches (`sl <= 0.048`) and drained by monotonic spillway cataracts (`CATARACT_PATHS`, `C1`–`C7`) whose first dry sill cell is locked to `wlev - 1.5 m`:

| Lake ID | Hajlandsk Name & Swiss Analogue | `Area` (`km²`) | `WLev` (`m`) | `Spill` (`m`) | Max / Med Depth (`m`) | Arms `pts` (`px, py`) & `hw_px` | Outlet Cataract & Sill `px` | $Q$ (`m³/s`) | Drop (`m`) | **Gross MW** (`70% Turb` / `35% Wheel`) |
|---|---|---:|---:|---:|---:|---|---|---:|---:|---:|
| **`L1_roketsjo`** | **Roketsjö** (*Zürichsee*) | **`552`** | `2,860` | `2,858.5` | `340` / `232` | `[(616,708),(623,715),(631,724)]` `hw=2.5` | `C1` **Silvr Cataract** `(632,727)` (`r051`) | `77.8` | `440` | **`335.8 MW`** (`235.1` / `117.5`) |
| **`L2_korsvatn`** | **Korsvatn** (*Vierwaldstättersee*, 4-arm fjord!) | **`1,588`** | `2,420` | `2,410.4` | `560` / `431` | 4 arms meeting at `(608,742)`: E `(623,740)` `2.4`; N `(600,725)` `2.3`; SSE *Urner-Fjord* `(615,771)` `2.7` (under `6,291 m` peak!); W `(594,749)` `2.1` | `C2` **Kors-Strömmen + 3-Lock Canal** `(591,750)` | `195.0` | `60` | **`114.8 MW`** (`80.3` / `40.2`) |
| **`L3_glasklar`** | **Glasklar-Sjö** (*Lac Léman / Lake Geneva*) | **`1,856`** | `2,360` | `2,358.5` | `640` / `482` | Crescent `[(582,758),(572,765),(566,776),(569,789),(578,799),(586,801)]` `hw=3.6` | `C3` **Blak Cataract** `(590,803)` (`r010`) | `369.3` | `140` | **`507.2 MW`** (`355.0` / `177.5`) |
| **`L4_kaskejtsjo`** | **Kaskejt-Sjö** (*Brienzersee–Thunersee*) | **`636`** | `2,220` | `2,218.5` | `460` / `349` | `[(585,815),(581,824),(576,831),(572,837)]` `hw=2.7` | `C4` **Great Cascade Gorge** `(569,839)` (`r004`) | **`760.8`** | **`420`** | **`3,134.6 MW`** (`2,194.3` / `1,097.1`) |
| **`L5_nordsjo`** | **Nordsjö** (*Bodensee*) | **`704`** | `2,260` | `2,258.5` | `320` / `243` | `[(609,684),(596,685),(585,687),(580,689)]` `hw=2.6` | `C5` **Hōng-Mā Cataract** `(577,690)` (`r014`) | `330.4` | `170` | **`551.0 MW`** (`385.7` / `192.9`) |
| **`L6_stalsjo`** | **Stålsjö** (*Lake Lugano / Maggiore*) | **`596`** | `2,580` | `2,578.5` | `380` / `289` | `[(614,859),(603,861),(592,860),(584,858)]` `hw=2.2` | `C6` **Frost Gorge** `(581,858)` (`r281`) | `85.3` | `400` | **`334.7 MW`** (`234.3` / `117.2`) |
| **`L7_malmtjarn`** | **Malmtjärn** (*Silsersee / Oberengadin*) | **`356`** | `2,880` | `2,878.5` | `240` / `198` | `[(664,651),(656,657),(648,659)]` `hw=2.1` | `C7` **Hamer/Nīla Cataract** `(645,659)` (`r027`) | `139.6` | `435` | **`595.7 MW`** (`417.0` / `208.5`) |
| **TOTALS** | **7 Stepped Alpine Lakes** | **`6,288`** | — | Verified | `640` max | **100% inside `pure_ir`** (`dist_out >= 5 km`) | **7 Industrial Cataracts** | — | — | **`5,573.9 MW`** (`3,901.7` / `1,950.9`) |

> **Why `5.57 GW` of Cataract Head Solves the Republic's Coal Paradox:** In §1.4 we found that the Iron Republic has **`0 km²` of good coal** (`max 63`), yet canonically leads northern Krator in steel rolling, wire-drawing, precision machining, and an inhabited arcology (`Cascade`). Concentrating `760.8 m³/s` over a `420 m` rock lip right at `Cascade` (`568,841`) yields **`2.19 GW` of shaft power** at 70% Francis/Pelton efficiency (`1.10 GW` even on early 35% iron breast/overshot wheels), while `Roketstad` (`336 MW`), *Urverkstad* (`507 MW`), *Slussport* (`551 MW`), and *Malmborg* (`596 MW`) each sit on dedicated `140–440 m` industrial mill-races!

### 2.4 Pre- vs Post-Edit Hypsometry, Microclimates & `49r` Shifts

Running `C.lapse()` + `C.reclimate()` in memory produces a classic **Swiss dual microclimate**: snowy boreal/tundra horns above (`Dfc` `+6,444 km²`, `ET` `+4,528 km²`) paired with **thermal-mass & föhn-warmed `Cfa`/`Cfb`/`Csb` lake benches below (`Cfa` `+5,288 km²`, `13–16 °C` mean temp, `1.15–1.22 atm`!)**:

| Metric / Band | 5.1 Baseline (`PRE`) | Simulated `edit_520` (`POST`) | Net Shift (`Δ`) & Physical Interpretation |
|---|---|---|---|
| **Dry / Wet Area** | `130,624` / `7,504 km²` | **`131,840` / `6,288 km²`** | **`+1,216 km²` dry**; shallow pan replaced by 7 deep troughs holding **3.1× greater water volume** (`~2,280 km³` vs `~730 km³`) |
| **Dry Slope (`p50` / `p90` / `>=0.15`)** | `0.034` / `0.099` / `7,016 km²` (`5.4%`) | **`0.042` / `0.142` / `12,000 km²` (`9.1%`)** | **`+4,984 km²` (`+71%`) of true steep alpine walls, horns & fjord cliffs** |
| **Lake-Bench Band (`2,200..2,800 m`)** | `15,084 km²` (`11.5%`) | **`17,272 km²` (`13.1%`)** | **`+2,188 km²`** of sheltered lakeside terraces (`970 mm` rain, `tm = 14.0 °C`, `atm = 1.15–1.22`) |
| **Flat Table Band (`2,800..3,400 m`)** | `37,332 km²` (`28.6%`, `sl=0.022`) | **`32,832 km²` (`24.9%`, `sl=0.028`)** | **`-4,500 km²`** broken up into alpine shoulders and passes |
| **High Massif Band (`4,200..5,500 m`)** | `31,300 km²` (`24.0%`) | **`36,576 km²` (`27.7%`)** | **`+5,276 km²`** of glaciated `Dfc`/`ET` horns (`M1`–`M7`) |
| **Köppen Shifts (Dry)** | `Csb 19.7k`, `Dfc 19.2k`, `Cfa 17.6k`, `ET 12.1k` | **`Dfc 25.7k`, `Cfa 22.9k`, `Dsb 21.4k`, `ET 16.6k`** | Upland `Csb` splits realistically into snowy `Dfc/ET` ridges and warm `Cfa` lake troughs |
| **`49r` Farm / Pasture / Timber** | `57,746` / `70,435` / `45,713 km²` | **`50,026` / `66,933` / `43,886 km²`** | `-13.4%` farm-eq (ending the fake interior-steppe surplus while concentrating `0.80–0.89` prime tillage along the 7 lake shores) |

**Simulated Post-Edit ASCII Relief & Lake Map (`8 km` step; `~~` = Swiss lakes; 2-letter tags = cities/burghs):**
```text
      526 534 542 550 558 566 574 582 590 598 606 614 622 630 638 646 654 662 670 678 686 694 702 710
 619|+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+2+2+22833424439[LI]383222+1+0~~~~~~-1  <- Lipp (691,619) & Tinnklippa
 655|+2232322242625+2+2+2+2+2+2+2+2+22326272935[~~L7~~]454951555960606159533822 5+0-1  <- L7 Malmtjärn (2,880m)
 687|+1+1+1+1+1+2171923[~~~~~~L5 Nordsjö~~~~~~]34323436384246495254535449464015+0+0+0  <- L5 Nordsjö (2,260m) & [SL] Slussport
 719|+1+2+2+3+33132343534333233323129[~~L1~~][RO]46484746474341+3+1+0+0+0+0-1-1~~~~~~  <- [RO] Roketstad (632,716) & L1 Roketsjö
 723|+1+2+2+3+3323433333433[GL]~~33292731[~~L1~~]47504847474543+3+1+0+0-1-1-1-1~~~~~~  <- [GL] Glaive (599,721) on Korsvatn N arm
 743|+2+2+2+3324032333339403528[~~~~L2 Korsvatn~~~~][KO]4954586059555043+1+0+0-1-1-1  <- [KO] Korshamn (627,740) & M1 Jernhorn (5.9km)
 767|+229313240453931[FO][~~L3 Glasklar~~]2939464926[Urner]5153586059554946+4+0+0-1-1  <- [FO] Footfall, Midtkammen & Urner-Fjord
 803|+332343635373937343429[~~~L3~~~][UR]2848525257595653474234+0+0+0+0-1-1-1-1~~~~~~  <- [UR] Urverkstad (591,801) & M5 Sydhorn (6.0km)
 843|26273031313027262421[CA]313539414130464642403921 4+0+0+0-1-1-1-1-1-1-1~~~~~~-1-1  <- [CA] Cascade (568,841) below L4 Kaskejt-Sjö
 859|1920212018171819222730[~~~~~~L6 Stålsjö~~~~~~][ST]1710 4 2+0+0+0+0-1-1-1-1~~~~~~  <- [ST] Stahlborn (618,859) on L6 Stålsjö
```

### 2.5 River Re-Binding & Inland Alpine Lake Barge Network

1. **River Re-Binding in `edit_520_republic_alps.py`:**
   - `r201` (`Snou Bruk`) & `r238` (`Pajn Bruk`) discharge into `L1` ***Roketsjö*** (`2,860 m`); `r051` (`Silvr Bruk`, `77.8 m³/s`) exits `L1` at `(632,727)`, plunges `440 m` down the **Silvr Cataract** past ***Korshamn*** (`627,740`) into `L2` ***Korsvatn*** (`2,420 m`).
   - **The Central `3,444 km²` Navigation Spine (`L2 <-> L3`):** `C2_korssund` (`(594,749) -> (582,758)`, `60 m` drop) pairs a natural cataract race (`114.8 MW`) with the **3-chamber *Kors-Slussen* masonry barge lock** (`20 m` lift per chamber), allowing 80-ton bulk ore, timber, and ordnance barges to sail unbroken for **`190 km`** from ***Korshamn*** (`627,740`), **`Glaive`** (`599,721`), and the *Urner-Fjord* (`615,771`) all the way across `L3` ***Glasklar-Sjö*** (`2,360 m`) past **`Footfall`** (`560,767`) to ***Urverkstad*** (`591,801`)!
   - `r010` (`Blak Bruk`, `369.3 m³/s`) exits `L3` at ***Urverkstad*** `(590,803)`, drops `140 m` (`507 MW`) into `L4` ***Kaskejt-Sjö*** (`2,220 m`), and exits at `(569,839)` as `r004` (`Kaskejt Rivr`, `760.8 m³/s`), plunging `420 m` (`3.13 GW`) past **`Cascade`** (`568,841`).
   - `r014` (`Hōng-Mā`, `330.4 m³/s`) exits `L5` ***Nordsjö*** at ***Slussport*** `(577,690)`; `r281` (`Frost Rivr`, `85.3 m³/s`) exits `L6` ***Stålsjö*** at `(581,858)` to join `Kaskejt Rivr`; `r345`/`r027` (`Nīla-āṟu`, `139.6 m³/s`) exits `L7` ***Malmtjärn*** at `(645,659)`.
2. **Fixing `vessels-gemini.json` (`0` -> `96` Strictly Landlocked Lake Craft):**
   - [`vessels-gemini.json`](file:///home/antigravity/traviso761-debug/krator-master/openworld/vessels-gemini.json) currently assigns the Iron Republic `0` vessels because it has no seaport. While the Republic has **zero Ring Sea access**, Swiss lakes historically moved all heavy stone, iron, salt, and timber by water (*Ledischiffe* / *Nauen*). We propose **`96` inland lake craft** (`54` flat-bottomed iron/oak bulk ore & charcoal *Nauen* barges, `24` fast Guild paddle/screw mail & customs cutters on *Korsvatn–Glasklar* and *Nordsjö*, and `18` alpine log-rafting & fishing skiffs), tagged `basin: 'inland-republic'` so `SIM.trade` never routes them onto ocean edges.

---

## 3. City Relocations, Border Resolutions & New City Proposals

### 3.1 Audit & Relocation Table for Existing Pins

| Pin ID & Name | 5.1 `px` (`Elev`, `Clim`) | Proposed `px` (`Elev`, `Clim`, `Slp`, `Farm`) | Action | Quantitative & Lore Rationale |
|---|---|---|---|---|
| **`s28hf1s9ab` Roketstad** | `(632,716)` (`2,980 m`, `Dsb`) | **`(632,716)`** (`2,949 m`, `Cfb`, `sl=0.084`, `farm=0.81`) | **KEEP** | Capital (`LORE.md:282`) now commands a classic **Zürich/Bern outlet terrace** `4.5 km` above `L1` *Roketsjö* (`2,860 m`) and the `336 MW` *Silvr* cataract, backed by `5,900 m` *Jernhorn-Alperna* and linked by incline-funicular to *Korshamn* |
| **`sgjwyb4xj5` Cascade** | `(568,841)` (`2,783 m`, `Csb`) | **`(568,841)`** (`2,176 m`, `Cfa`, `sl=0.068`, `farm=0.80`) | **KEEP** | Living hydro-arcology now sits physically at the **`420 m` / `3.13 GW` *Kaskejt-Sjö* cataract lip** and western portal road of the `Cascade <-> Drum` Karst Tunnel |
| **`skamx0ylbr` Glaive** | `(599,734)` (`3,129 m`, `Csb`, `farm=0.43`) | **`(599,721)`** (`2,518 m`, `Cfa`, `sl=0.049`, `farm=0.85`) | **RELOCATE `26 km` N** | Old site sits high on a fjord flank; `(599,721)` places `Glaive` at the **fortified northern fjord-head of `L2` *Korsvatn*** (*Lucerne* analogue), guarding `P3` *Korspaset* to *Nordsjö* |
| **`sgxc1s0gyh` Stahlborn** | `(627,868)` (`3,640 m`, `Dsb 6°C`, `farm=0.27`) | **`(618,859)`** (`2,613 m`, `Csb 12°C`, `sl=0.016`, `farm=0.85`) | **RELOCATE `25 km` WNW** | Old site is a cold, dry `3,640 m` ridge `28 km` from water; `(618,859)` anchors `Stahlborn` at the **eastern head of `L6` *Stålsjö*** directly on the **`Cu=170 / Zn=136 / skarn=200 / marble=104` lode**, `tin=200`, and `P5` *Stålpaset*! |
| **`s8fkrfok8y` Lipp** | `(691,619)` (`3,565 m`, `Dsb`) | **`(691,619)`** (`3,493 m`, `Dsb`, `sl=0.019`, `farm=0.48`) | **KEEP** | Essential northern customs, assay & counter-espionage burgh at `P6` *Lipppaset*, **`43 km` WNW of Dilihan's `Aidol` (`712,628`)** ([`PROPOSAL-IZIZ-EXCLAVES.md`](file:///home/antigravity/traviso761-debug/krator-master/core/simulation/PROPOSAL-IZIZ-EXCLAVES.md)) |
| **`su9n601y4a` Footfall** | `(560,767)` (`2,957 m`, `Csb`) | **`(560,767)`** (`2,476 m`, `Cfa`, `sl=0.025`, `farm=0.86`) | **KEEP** | Ancient crashed/ruined complex (`416 km²` `ruin_ground`) overlooking western `L3` *Glasklar-Sjö* and `P2` *Västport*; headquarters of the **Salvagers' Brotherhood** |
| **`sjqk469u0k` Bastion** | `(536,627)` (`2,331 m`, `Csa`) | **`(536,627)`** (`Eternal State` fort) | **RESOLVE OVERLAP** | Trim IR NW polygon `6 px` SE so `Bastion` (`250` pop) is unambiguously an **Eternal State** border fort facing *Slussport*, matching `populations-gemini.json` |
| **`sdgzodxb0k` Corpus / `Palewharf`** | `(520,693)` / `(565,604)` | Unchanged (`Eternal State`) | **EXTERNAL NEIGHBOURS** | `Corpus` (`20,000` Eternian inhabited ruin `44 km` W of IR border) & `Palewharf` (`565,604`, northern lake port) remain Eternal State trading partners |

### 3.2 Three Proposed New Republican Cities / Burghs & Four Named Resource Works

To complete a true Swiss urban network linking the 7 lakes and 6 cantons, we propose **3 new permanent Republican pins** in `60-settlements.js` (plus **4 named `KHAMLET` mining/colliery works**):

1. ***Urverkstad*** (`(591, 801)`, `+2,400 m`, `Cfa`, `15.0 °C`, `1.19 atm`, `sl = 0.003`, `farm = 0.85` — **`8,500` pop**, `stage: 'city'`):
   - **Swiss Analogue:** **Geneva (*Genève*) + Biel/Bienne + Schaffhausen**.
   - **Siting & Function:** Stands at the southern spillway of `L3` ***Glasklar-Sjö*** where the `369.3 m³/s` `Blak Bruk` plunges `140 m` (`507.2 MW` gross) toward *Kaskejt-Sjö*. While `Roketstad` is the smoky blast-furnace, rocket-foundry, and parliamentary capital, ***Urverkstad*** is the Republic's **clean-water precision metropolis**: home of the **Horologists' & Opticians' Syndicate**, grinding `Footfall` Ancient salvage glass (`LORE.md:677`) and `Stahlborn` native brass (`Cu+Zn`) into marine chronometers, artillery rangefinders, survey theodolites, and the diplomatic refractor telescopes (*"The Raja's Eye"*) coveted by `Jimjam`, alongside the neutral **Ting Clearing Bourse** where foreign factors must transact under Guild surveillance.
2. ***Slussport*** (`(576, 693)`, `+2,287 m`, `Cfa`, `14.0 °C`, `1.20 atm`, `sl = 0.000`, `farm = 0.89` — **`3,200` pop**, `stage: 'town'`):
   - **Swiss Analogue:** **Basel / Konstanz**.
   - **Siting & Function:** Commands `P1` *Nordport-Paset* and the `330.4 m³/s` `Hōng-Mā` outlet cataract (`551.0 MW` gross) at the western gate of `L5` ***Nordsjö*** right on the `Corpus–Roketstad` Ancient highway, directly atop `clay = 255` refractory beds. Functions as the Republic's **western customs lock, quarantine gate, refractory brickworks, and Eternal State wagon/rail transshipment port** (receiving Eternal State coking coal & salt so foreign teamsters never enter the interior cantons).
3. ***Korshamn*** (`(627, 740)`, `+2,458 m`, `Cfa`, `16.0 °C`, `1.18 atm`, `sl = 0.048`, `farm = 0.84` — **`2,600` pop**, `stage: 'town'`):
   - **Swiss Analogue:** **Flüelen / Brunnen / Thun**.
   - **Siting & Function:** Built where `Roketstad`'s `Silvr Bruk` cataract (`440 m` drop, `335.8 MW`) meets the eastern arm of 4-branched `L2` ***Korsvatn***. Connected to `Roketstad` (`490 m` higher, `48 km` NNE) by water-counterbalanced incline tramway and cog-road, ***Korshamn*** is the **Federal Lake Arsenal & Barge Hub**, shipping `Roketstad` pig-iron, rocket tubes, and saltpeter across *Korsvatn–Glasklar* and receiving `Footfall` salvage and `Stahlborn` brass.
4. **Four Named `KHAMLET` Strategic Resource Works:**
   - ***Tinnklippa*** (`(705, 606)`, `+2,789 m`, `650` pop — fulfills the queued *Lipp tin mine* in [`RESOURCES-SETTLEMENTS.md`](file:///home/antigravity/traviso761-debug/krator-master/openworld/RESOURCES-SETTLEMENTS.md#L123)): Works the northern granite batholith (`tin=200`, `nickel=220`, `gold=110`, `silver=110`, `rare-earth=160`) `38 km` NNE of `Lipp`.
   - ***Malmborg*** (`(668, 650)`, `+3,085 m`, `550` pop): Fortified teamster hospice, charcoal-smelter, and snow-plough station above `L7` ***Malmtjärn*** (`596 MW` cataract), halving the brutal `180 km` mountain haul between `Roketstad` and `Lipp`.
   - ***Jernklyfta*** (`(556, 860)`, `+1,809 m`, `700` pop): Lower *Kaskejt / Frost Rivr* iron & marble works tapping the **planet-#1 unworked `47.0`-yield iron lode at `(558,883)`** (`b=180`).
   - ***Kolgruva-Syd*** (`(514, 880)`, `+1,085 m`, `450` pop): SW `Ajrn Bruk` border colliery working the Republic's sole low-grade coal seam (`b=63`) + `peat=110` & refractory `clay=255`.

---

## 4. Six Cantons (`R1`–`R6`: *De Sex Ting-Kantonerna*), Kits, Ecology & Census

### 4.1 Exact Six-Canton Partition (`100.0%` of `rmufxti8qwcxy` = `138,128 km²`)

In Hajlandsk ([`tongues-of-krator.html`](file:///home/antigravity/traviso761-debug/krator-master/lore/tongues-of-krator.html)), the Republic is federated into **Six Cantonal Tings (*De Sex Ting-Kantonerna*)**, balancing the urban **Guild & Industrialist Syndicates** (`R1`, `R2`, `R3`) against the **Salvagers' Brotherhood** (`R2` west / `Footfall`), the **Mountain Mining Marks** (`R5`, `R6`), and the **Republican Border Legions** (`R4`, `R6`):

| ID | Canton (*Hajlandsk Name*) | Seat(s) | Total / Lake (`km²`) | Med `E` (`Atm`) | `Farm` / `Past` / `Timb` (`km²`) | Hydro (`Gross MW`) | Key Mineral & Ruin Endowment | Dominant Syndicate / Political Bloc in *Tinget* |
|---|---|---|---:|---|---:|---:|---|---|
| **`R1`** | **Roket-Kanton (*Öst-Ting*)** | **Roketstad** `(632,716)` | `30,716` / `1,264` | `4,565 m` (`0.90`) | `3,696` / `10,249` / `3,300` | `335.8` (`L1`) | **`iron` `22,784 km²` (`b=255`)**, **`saltpeter` `17,216 km²` (`b=127`)**, `nickel` `b=220`, `tin` `b=200`, `clay` `b=255` | **Foundry, Rocketry & Artillery Guilds** — hawkish core of the tech-licensing embargo |
| **`R2`** | **Korsvatn–Glasklar (*Midt-Ting*)** | **Urverkstad** `(591,801)`, **Glaive** `(599,721)`, *Korshamn*, *Footfall* | `32,536` / `2,732` | `3,348 m` (`1.05`) | `15,095` / `17,095` / `13,306` | `622.0` (`L2+L3`) | **`416 km²` `ruin_ground` (`Footfall`)**, `iron` `10,176 km²`, `saltpeter` `3,552 km²`, `clay` `464 km²` | **Horologists' & Opticians' Syndicate + Salvagers' Brotherhood** — diplomatic licensing (*Jimjam*) & federal banking |
| **`R3`** | **Kaskejt-Kanton (*Kraft-Ting*)** | **Cascade** `(568,841)`, *Jernklyfta*, *Kolgruva-Syd* | `24,596` / `636` | `2,569 m` (`1.16`) | **`16,515`** / `15,535` / `14,998` | **`3,134.6`** (`L4`) | **`iron` `9,216 km²` (`47.0`-yield lode!)**, `Cu/Zn` `1,328 km²`, `limestone` `7,376 km²`, `marble` `3,536 km²`, `clay` `1,104 km²`, `peat`, `coal` `b=63` | **Cascade Arcology Directorate** — heavy electro-mechanical rolling mills, wire/cable works & Karst Tunnel engineers |
| **`R4`** | **Nordsjö–Västport (*Gräns-Ting*)** | **Slussport** `(576,693)` | `14,724` / `704` | `2,903 m` (`1.11`) | `8,103` / `9,023` / `4,919` | `551.0` (`L5`) | `clay` `b=255` (`96 km²`), `iron` `288 km²`, `nickel` `b=220` | **Western Border Legions & Customs Factors** — manages Eternal State coal/salt imports & anti-Historian border inspections |
| **`R5`** | **Stålsjö-Kanton (*Malm-Mark*)** | **Stahlborn** `(618,859)` | `17,324` / `596` | `4,372 m` (`0.93`) | `1,130` / `6,927` / `1,667` | `334.7` (`L6`) | **`iron` `15,456 km²` (`b=255`)**, **`REE/Au/Ag` `4,368 km²`**, **`tin` `1,952 km²`**, **`nickel` `1,136 km²`**, **`Cu/Zn/skarn` `992 km²`**, `marble` `3,536 km²` | **Deep-Lode Miners' & Brassfounders' Mark** — supplies `100%` of the Republic's native brass & alloy metals; guards SE Scyvoi passes |
| **`R6`** | **Lipp-Kanton (*Nordspets-Mark*)** | **Lipp** `(691,619)`, *Tinnklippa*, *Malmborg* | `18,232` / `356` | `3,664 m` (`1.01`) | `5,487` / `8,106` / `5,696` | `595.7` (`L7`) | **`iron` `15,968 km²`**, **`saltpeter` `5,104 km²`**, `REE/Au/Ag` `704 km²`, `nickel` `688 km²`, `tin` `416 km²` (`b=200`) | **Northern Frontier Wardens & Assay Guild** — polices the `Aidol` Quiet-Copy gate; rife with grey-market REE/circuit brokers |

### 4.2 Architectural & Kit Dialect (`kits/highlands` + `KHAMLET.CULTURES.republican`)

[`kits/highlands`](file:///home/antigravity/traviso761-debug/krator-master/kits/highlands/README.md) already ships all three visual registers needed to build the Swiss-overhauled Republic without inventing a new building engine:
1. **Urban Cantonal Burghs (`Roketstad`, *Urverkstad*, `Glaive`, *Slussport*, *Korshamn*, `Stahlborn`, `Lipp`):** Built on `culture_files('republican')` (`81-rep-dwellings.js`, `82-rep-civic.js`, `83-rep-trades.js`: steep slate/copper gables, dressed granite/marble ashlar arcades, tall riveted brick/iron smokestacks, guild clocktowers, and waterwheel/turbine raceways).
2. **`Cascade` (`568,841`):** Ancient terraced arcology megastructure (`kits/ancients` + `kits/highlands` Republican industrial retrofits: penstocks, external gantry cranes, turbine tailraces, and brass-busbar transformer halls).
3. **Rural Alpine `KHAMLET` Villages (`core/hamlet/23-hamlet-republic.js`):** Currently [`core/hamlet/20-hamlet-cultures.js`](file:///home/antigravity/traviso761-debug/krator-master/core/hamlet/20-hamlet-cultures.js) has **no `republican` entry**. We propose registering `KHAMLET.CULTURES.republican` mixing `Rustic` alpine timber-on-stone chalets (`84-rustic-dwellings.js`, `84b-rustic-trades.js`, painted in native `falu-red` iron-oxide pigment!) with Republican stone guild-chapels, stamp-mills, and covered wooden bridges, while `Footfall`'s perimeter camp uses `85-tribal-dwellings.js` / `85b-tribal-salvage.js`:
   - `house_poor`: `['rustic_cot_a', 'rustic_cot_b']` | `house_mid`: `['rustic_stead_a', 'rep_dwell_row']` | `house_rich`: `['rep_dwell_burgher']`
   - `hall`: `['rep_civic_guild']` | `market`: `['rep_civic_market']` | `store`: `['rustic_granary', 'rep_trade_warehouse']`
   - `mine`: `['rep_trade_minehead']` | `smelter`: `['rep_trade_foundry']` | `sawmill`: `['rustic_sawmill']` | `ranch`: `['rustic_byre']` | `quay`: `['rep_trade_wharf']` (for lake fishing & *Nauen* barge landings!).

### 4.3 Alpine Lake-Terrace & Transhumance Ecology (`kits/crops`)

Querying `CROPS.forBiome('nhighlands')` (`77` crops, `canPlaid = true`, 7-colour highland woollen plaids: `black, blue, brown, orange, red, teal, yellow`) and `CROPS.forBiome('nwlowlands')` (`121` crops on the `1.15–1.22 atm` `Cfa` lake benches) gives a distinctly Swiss two-story agricultural economy:
- **Föhn-Warmed Lake Terraces (`2,200..2,650 m`, *Lavaux / Ticino* analogue on *Glasklar-Sjö*, *Korsvatn*, *Nordsjö*, *Kaskejt-Sjö*, *Stålsjö*):** Stepped dry-stone vineyard and orchard walls growing **`canyon-grape` (`wine`)**, **`apricot`**, **`cherry`**, **`crabapple` (`cider`)**, **`emmer`**, **`flax`**, **`mulberry`**, **`bench-garlic`**, and **`whorl-olive`** on sun-facing slopes.
- **High Alpine Pastures & Subalpine Bogs (`2,650..4,200 m`, *Alpwirtschaft* transhumance):** Summer dairy cattle & mountain sheep driven up to `66,933 km²` of alpine meadows (`cheese` — dependent on imported `salt`! — `wool`, `leather`, highland plaids dyed with `falu-red`, `woad`, `lichen`, and `alder-bark`), hardy **`frostoat`**, **`bistort`**, **`snowpotato`**, **`frostroot`**, **`juniper`**, **`cloudberry`**, **`ivanchai`**, and **`peat`-kilned `scotch`** (`TRADE-GOODS.md`).

### 4.4 Grounded 1:1 Population Census vs `populations-gemini.json`

[`LORE.md`](file:///home/antigravity/traviso761-debug/krator-master/LORE.md#L282) states explicitly that **`Roketstad` had `~5,000` inhabitants and later doubled (`10,000`)**, matching `60-settlements.js` (`cur_pop = 10,000` at `Roketstad`, `10,000` at `Cascade`, `1,800` at `Stahlborn`, `300` at `Glaive`, `300` at `Lipp` = **`22,400` urban**). By contrast, [`populations-gemini.json`](file:///home/antigravity/traviso761-debug/krator-master/openworld/populations-gemini.json) applied `3×` on-screen and `2×` off-screen multipliers to inflate `Roketstad` to `60,000` (`94,625` urban) and the polity to **`302,800`**. Under Krator's 1:1 rule (where off-screen furnace suburbs and ~280 `KHAMLET` alpine villages are counted explicitly rather than hidden inside a `6×` capital multiplier), we ground the Republic at **`165,000` total souls**:

| Canton | Urban / Arcology Pins (Proposed 1:1 Pop) | Named Resource / Ruin Camps | Rural `KHAMLET` Villages & Steadings | **Canton Total** | Rural Density (`/km²` Farm-Eq) |
|---|---|---|---|---:|---:|
| **`R1` Roket-Kanton** | **Roketstad** **`15,000`** (`10,000` walled city + `5,000` *Roketsjö* / *Silvr* furnace belt) | — | `9,500` (~26 mining/charcoal/dairy hamlets) | **`24,500`** | `2.57` |
| **`R2` Korsvatn–Glasklar** | **Urverkstad** **`8,500`** + **Glaive** **`3,200`** + **Korshamn** **`2,600`** (`14,300`) | **Footfall Salvage Camp** **`600`** | `34,600` (~85 lakeside vineyard, barge & chalet villages) | **`49,500`** | `2.29` |
| **`R3` Kaskejt-Kanton** | **Cascade** **`12,000`** (arcology decks + cataract mill-town) | **Jernklyfta** `700` + **Kolgruva-Syd** `450` (`1,150`) | `36,850` (~90 lush SW valley & orchard hamlets) | **`50,000`** | `2.23` |
| **`R4` Nordsjö–Västport** | **Slussport** **`3,200`** | — | `16,800` (~42 *Nordsjö* shore & pass-garrison villages) | **`20,000`** | `2.07` |
| **`R5` Stålsjö-Kanton** | **Stahlborn** **`3,000`** | — | `4,500` (~14 high skarn/brass mining & pastoral hamlets) | **`7,500`** | `3.98` (mining-fed) |
| **`R6` Lipp-Kanton** | **Lipp** **`2,800`** | **Tinnklippa** `650` + **Malmborg** `550` (`1,200`) | `9,500` (~24 northern granite valley & hospice hamlets) | **`13,500`** | `1.73` |
| **REPUBLIC TOTAL** | **8 Pins = `50,300` (`30.5%` urban)** | **5 Camps = `2,950` (`1.8%`)** | **~281 Hamlets = `111,750` (`67.7%`)** | **`165,000`** | **`2.23 / km²`** |

---

## 5. Trade, Tech-Licensing Embargo & Smuggling Web

### 5.1 Internal Lake-Barge & Cataract Value Chain

The Swiss overhaul turns the Republic's interior into an integrated hydro-metallurgical machine:
1. **`Stahlborn` (`R5`) -> *Stålsjö* / `P5` -> `Cascade` (`R3`) -> *Urverkstad* (`R2`):** Native `copper + zinc` (`brass`), `tin`, `nickel`, and `rare-earth` concentrates descend to `Cascade`'s `3.13 GW` rolling/wire mills, then move north to ***Urverkstad***'s horology and instrument benches.
2. **`Footfall` (`R2` W) -> *Glasklar-Sjö* Barges -> *Urverkstad* (`R2` E):** Salvagers haul intact Ancient optical glass, ceramics, and alloy scrap `68 km` by *Nauen* barge across *Glasklar-Sjö* directly to ***Urverkstad***'s water-powered lens-grinding mills (solving the Republic's `0`-quartz bottleneck!).
3. **`Roketstad` (`R1`) <-> *Korshamn* (`L2`) <-> `Glaive` / *Urverkstad*:** `R1`'s `saltpeter` (`17,216 km²`) and `iron` (`b=255`) feed `Roketstad`'s rocket/ordnance arsenals; finished machine tools, steel bar, and sealed rocket-mail canisters ride the incline to ***Korshamn*** for distribution across the `3,444 km²` central lake spine.

### 5.2 The Tech-Licensing Embargo & Seven External Trade/Smuggling Corridors

Under the **Ting Embargo Statute** ([`LORE.md`](file:///home/antigravity/traviso761-debug/krator-master/LORE.md#L285-L315)), **unlicensed export of machine tools, rifled/rocket ordnance, escapement movements, optical grinding engines, or intact `Footfall` circuits is high treason**, punishable by guild disenfranchisement or the gallows. Legal exports must exit through **three chartered border Clearing Houses** (`Lipp`, *Slussport*, and `Cascade`'s tunnel vault) under end-user seals — breeding Krator's most lucrative espionage and smuggling web:

| Corridor & Route | Republican Gate | Foreign Partner(s) | **Licensed Exports (Out)** | **Essential Imports (In)** | **Embargo Friction, Espionage & Smuggling** |
|---|---|---|---|---|---|
| **1. The Quiet-Copy Gate** (`43 km` mountain road via `P6`) | **`Lipp`** `(691,619)` (+ *Tinnklippa*) | **`Aidol`** `(712,628)` (`Dilihan D3`, Iziz vassal) | Sealed `steel` ingots, raw `tin`/`nickel` bar, civilian pocket-watches, highland `cheese` | **`salt` (`halite`)**, `silk`, `tea`, `rice`, lowland `grain`, **covert Iziz `circuits`** | Matches [`PROPOSAL-IZIZ-EXCLAVES.md`](file:///home/antigravity/traviso761-debug/krator-master/core/simulation/PROPOSAL-IZIZ-EXCLAVES.md): `Aidol`'s Iziz-backed *"Quiet-Copy"* customs house **seizes "mis-manifested" Republican `precision-tools`, rangefinders & rocket nozzles** to reverse-engineer them, while corrupt `Lipp` factors smuggle `Tinnklippa` `rare-earth` out and Iziz `circuits` in! |
| **2. *"The Raja's Eye"*** (via *Slussport* -> `Hōng-Mā` / NW Basin) | ***Urverkstad*** `(591,801)` & ***Slussport*** | **`Jimjam`** (`r153762583`, Astronomer-Rajas) | **Chartered Guild refractor telescopes & astrolabes** (`Footfall` Ancient glass + `Stahlborn` brass, [`LORE.md`](file:///home/antigravity/traviso761-debug/krator-master/LORE.md#L675-L692)) | **`alabaster`**, blown lowland `glass`, irrigated `grain`, `cotton`, `indigo`, **`salt`** | Guilds drip-feed one numbered telescope at a time for astronomical silver; **Salvager dissidents** secretly sell raw `Footfall` lens blanks to `Jimjam` & `Free Clans` agents to undercut the Guild monopoly! |
| **3. The `89 km` Inner Wall Karst Tunnel** (`ANCIENT-TUNNELS.md`) | **`Cascade`** `(568,841)` & **`Stahlborn`** | **`Drum`** `(673,932)` (`13,500` pop) & **`Tzunfort`** (`Voth`) | **`saltpeter`** (Voth has low nitre), **`precision-tools`**, hydro-drawn `wire`, mining pumps, survey `lenses` | **Volcanic `sulfur` (`V4` `max 170` — IR has ZERO!)**, **`coal` (`Drum` `max 209` — IR has ZERO good!)** | Matches [`PROPOSAL-VOTH.md`](file:///home/antigravity/traviso761-debug/krator-master/core/simulation/PROPOSAL-VOTH.md) & `drum_stage1_blueprints.md`: **chemical symbiosis** uniting IR `saltpeter` + Vothic `sulfur` + `Drum` `coal`! Outside the eastern portal, **`Scyvoi` (`B7` `652,907` & `B1` `651,857`)** ambush surface mule trains whenever tunnel tolls spike |
| **4. Western Highway & Coal-Salt Lifeline** (`P1` *Nordport*) | ***Slussport*** `(576,693)` | **`Corpus`** `(520,693)` (`20k`), **`Bastion`** `(536,627)`, **`Lux`** (`Eternal State`) | Structural `steel`, railway/wagon axles, `brick`/ceramics, `scotch`, `cheese`, licensed `firearms` parts | **Coking `coal`**, **rock `salt` (`halite`)**, lowland `cattle`/`grain`, `Corpus` salvage | **Order of Historians** (`LORE.md:704`) embedded at `Corpus`/`Bastion` agitate against Republican "destruction" of `Footfall` relics, running covert artefact-exfiltration rings across `P2` *Västport* |
| **5. Artillery Rivalry** (NW rivers / overland) | **`Roketstad`** & **`Glaive`** | **Free Clans (`Ardent`)** (`LORE.md:332`) | High-grade `tin` & `nickel` (heavily taxed), clockwork fuzes (black-market) | `horses`, `hides`, `wool`, mercenary scouts | `Ardent`'s cast-bronze cannon compete directly with `Roketstad`'s rifled steel & spin-stabilized rockets; Republican guild agents sabotage unlicensed fuze exports |
| **6. Southern Bog & Pass Trade** | **`Cascade`** & **`Stahlborn`** | **League (`Trigon` `722,740`)** & **Frogmen (`Jrrmiah` `557,959`)** | Iron `tools`, fishhooks, `wire`, copper kettles, `cloth` | **Swamp `reagents`**, `medicine`, medicinal leeches/alkaloids, `peat`, `rare` skins | Quiet neutral back-door when northern wars close `P1` or `P6`; Frogmen guides ferry embargoed crates down the `Kaskejt Rivr` marshes |
| **7. Black-Market Freeport Leak** | Smuggler cols (`P2`, `P5`, `Cakmak`) | **`Noah's Regret`** & **`Porta Marr`** | **Smuggled `rockets`, `explosives`, `firearms`, `precision-tools`** | Gold specie, contraband `ancient-tech`, Ring Sea spices | Unmarked crates floated down `Kaskejt Rivr` by night or muled down the `Cakmak` gorge to Ring Sea pirate brokers |

---

## 6. Key Open Choices for the Owner

| # | Decision | Recommended Option (Default in this Spec) | Alternative Option(s) |
|---|---|---|---|
| **`Q1`** | **Terrain & Great-Lake Overhaul (`edit_520_republic_alps.py`)** | **Approve the 7-massif (`M1`–`M7`) + 7-stepped-lake (`L1`–`L7`, `6,288 km²`, `5.57 GW` cataract head) + 6-pass (`P1`–`P6`) spec**, replacing 5.1's flat saucer lake (`lbl=131`) strictly inside `pure_ir` | **(a)** Keep a larger `~3,500 km²` central lake and only 4 lakes total; or **(b)** push massif peaks higher (`+6,400 m`) |
| **`Q2`** | **Relocating `Glaive` & `Stahlborn`** | **Relocate `Glaive` (`599,734 -> 599,721`)** onto *Korsvatn*'s northern fjord-head (`Lucerne` analogue) and **`Stahlborn` (`627,868 -> 618,859`)** onto *Stålsjö*'s rich `Cu/Zn/skarn/marble` head | Keep original 5.1 coordinates (`599,734` upland flank and `627,868` `3,640 m` dry ridge) and connect them via spur roads |
| **`Q3`** | **New Republican Cities / Burghs** | **Add all 3 new pins:** ***Urverkstad*** (`591,801`, `8,500` pop, clockwork/optics/bourse city), ***Slussport*** (`576,693`, `3,200` pop, western customs lock on *Nordsjö*), and ***Korshamn*** (`627,740`, `2,600` pop, 4-arm fjord arsenal below `Roketstad`), plus name `705,606` ***Tinnklippa*** | **(a)** Add only ***Urverkstad*** (`8,500`) + ***Slussport*** (`3,200`) and treat *Korshamn* as a `KHAMLET` wharf; or **(b)** add only ***Urverkstad*** |
| **`Q4`** | **Population Scale (`1:1` vs Gemini)** | **`165,000` total citizens** (`50,300` across 8 pins — `Roketstad` `15,000`, `Cascade` `12,000`, *Urverkstad* `8,500` — + `2,950` camps + `111,750` rural across ~281 alpine hamlets), honoring `LORE.md:282` | **(a)** Minimalist strict-canon **`110,000`** (`Roketstad` `10,000` hard cap); or **(b)** heavier industrial **`225,000`** (`Roketstad` `25,000`, `Cascade` `18,000`) |
| **`Q5`** | **`Bastion` (`536,627`) & Polygon Overlaps** | **Assign `Bastion` (`536,627`) cleanly to `Eternal State`** (trimming IR's `400 km²` NW overlap `6 px` SE, plus trimming the minor `Scyvoi`/`Dilihan`/`Jimjam` border slivers) | Flip `Bastion` (`536,627`) to an Iron Republic western forward fort and trim `Eternal State` instead |
| **`Q6`** | **`Cascade <-> Drum` (`89 km`) Karst Tunnel Status** | **Active, heavily tolled industrial bore** exchanging Republican `saltpeter` + `precision-tools` for Vothic `sulfur` + `Drum` `coal` (raided outside the E mouth by `Scyvoi` `B7`) | Partially collapsed Ancient bore requiring an in-world reopening venture (`KCAMP` / quest milestone) before bulk coal/sulfur trains can run |
| **`Q7`** | **Inland Lake Fleet (`vessels-gemini.json`)** | **Add `96` strictly landlocked alpine lake vessels** (`Nauen` bulk ore/charcoal barges, Guild steam/rocket-mail cutters, log rafts) across `L1`–`L7`, with the **3-chamber *Kors-Slussen* lock** joining `L2` and `L3` | Keep lakes split by cataract portages only (no inter-lake barge lock between *Korsvatn* and *Glasklar-Sjö*) |
| **`Q8`** | **Domestic Coal Scarcity vs Geology Edit** | **Keep `0 km²` good coal as a deliberate worldbuilding driver** (forcing the Republic onto its `5.57 GW` hydro-cataracts, alpine charcoal/peat, and `Drum`/`Eternal State` coal imports!) | Author one small `b=145` anthracite pocket in `R5` (`Stahlborn`) or `R3` (`Kolgruva-Syd`) during `edit_520` so the Republic has an emergency domestic coking reserve |
