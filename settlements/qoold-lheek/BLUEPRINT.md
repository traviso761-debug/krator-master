# Qoold Lheek — Architectural & Site Blueprint (`BLUEPRINT.md`)

Generated from `[G data]` plain records (`src/30-ql-layout.js` + `src/31-ql-rules.js`) through the shared Krator blueprint
renderer (`settlements/voth/palace/blueprint.py`, imported in place by `qoold_blueprint.py`) and verified by
`tests/test-qoold-lheek.js`.

```bash
node settlements/qoold-lheek/tests/test-qoold-lheek.js   # 40/40 positive + negative layout & rule assertions
python3 settlements/qoold-lheek/qoold_blueprint.py       # floors/Q0..Q3.png, floors/section.png, FURNITURE.md
```

---

## 1. The Blueprint Sheets (`floors/`)

All plan sheets use the local Qoold Lheek frame `(u, v)` in metres centered on the **`Quunsul` Crown (`px 411.4, py 508.1`,
`5,702.41 m` ASL = `y = +22.0 m` above Cold Lake's `5,680.41 m` water/ice surface)**:
- **`+u` (right)** = True East (down-coulee toward Cold Lake & downwind of the `300° WNW` katabatic gales)
- **`+v` (up)** = **True North (`0°`) = Midday Sun** (southern hemisphere `27.8° S`: winter noon `38.7°`, summer noon `85.7°`)

| Sheet | Extent (`m`) | Scale | What it draws |
|---|---|---|---|
| `floors/Q0.png` | `1,480 x 1,300 m` (`u: -760..+720`, `v: -620..+680`) | Master site plan (`1.9 px/m`) | Full coulee-fan landform: Cold Lake (`y = 0 m`), gravel apron (`+4 m`), `Musïq Quli` coulee & `+29 m` weir, shaded SSW-facing `northbank` (`furlarch` coppice & `-10 °C` permafrost cellars), sunny NNE-facing `sunbench` (Three Gifts terraces & gravity `kuhl` leats), 4 WNW snow-harvesting fences & `26 m` drift quarries, covered town & Crown, SW wet-silt `pasture` (`labaz` post caches, `khoton` yards, seasonal muster fort), NE dry-bedrock Ancestors' Ridge (7 Clan Tombs), Leng road, winter lake-ice highways, and 4 sightlines |
| `floors/Q1.png` | `780 x 650 m` (`u: -460..+320`, `v: -280..+370`) | Urban district plan (`3.6 px/m`) | All **6 urban `Kileŋ` clan wards** (`Quraa`, `Qiviut`, `Qaribuu`, `Isnoo`, `Isiit`, `Musiq`), the **4 shared-wall `bathhouse` + `smithy` thermal pairs**, the **`91` `KCITY.covered` winter tunnel segments & `45` warming/junction domes**, snow fences `1–4` with leeward drift bands, sunny north-aspect Three Gifts boulder pockets, coulee weir/placer sluices, permafrost cellars, and ESE downwind tanneries/kiln |
| `floors/Q2.png` | `260 x 190 m` (`u: -125..+135`, `v: -95..+95`) | `Quunsul` Crown detail (`10.8 px/m`) | High Chief's Pycrete Great Dome (`chief.hall`), `Quunsul` Seven-Clan Council Hall (`quunsul.hall`), Shrine of Cold Lake & Sky (`shrine.lake`), `Qaggiq` of Songs (`song.house`), Royal Hearth Triad (`bath.state` + `smithy.state` + `kitchen.state` sharing one heated stone spine), Tributary & Leng Envoy Dome (`envoy.dome`), Hearth-Guard Barracks (`guard.dome`), `court.moot` (`serge` posts & Eternian war-trophy cairn), and `1.15x`-scale interior room/bench/katak geometry |
| `floors/Q3.png` | `460 x 470 m` (`u: -40..+420`, `v: -210..+260`) | Lakefront Ice & Pycrete Works (`5.9 px/m`) | The Khaayken pycrete industrial loop: `quarry.ice.w` & `quarry.ice.e` (`1.4 m` black-ice block sawing on Cold Lake), `aufeis.field` (layered coulee overflow ice), `chute.sawdust` + `mill.sawdust` (`furlarch` wood-pulp mill), `yard.pycrete` (`86%` ice + `14%` sawdust block casting), skin-boat `umiak` houses, winter char smoking racks, Leng Gatehouse (`gate.leng`), and Caravan Tea-House (`tea.leng`) |
| `floors/section.png` | Three engineering cuts | `3.0x` vertical exaggeration (`A`, `B`) & `1:50` architectural cut (`C`) | **Panel A:** `1.42 km` WNW -> ESE wind-and-water long section (`West Watch +44.5 m` -> snow fence -> town -> `Quunsul +22 m` -> Leng Gate `+12 m` -> pycrete yard `+4 m` -> `1.4 m` Cold Lake ice). **Panel B:** `660 m` SW -> NE cross-coulee solar-aspect section (sunny north-tilted right bank vs. shaded `-10 °C` left bank + dry bedrock tombs `+50 m`). **Panel C:** `1:50` Khaayken dome cut (`0.45 m` ventilated gravel plinth over permafrost, `-1.2 m` cold-trap `katak` sump, `0.45 m` pycrete + `18 cm` air gap + caribou liner, `45°` **north-facing** clear lake-ice skylight, `1.15x` Yeti stature) |

 Overview sheets (`Q0`, `Q1`) reference buildings detailed on `Q2` and `Q3` with `kind='see'` so `FURNITURE.md` furnishes
 every structure in `QOOLD_LAYOUT` **exactly once** without double-counting.

---

## 2. Real-World Cold-Climate & High-Plateau Precedents Synthesized

1. **Thule Inuit winter whalebone-and-turf villages & `katak` cold-trap tunnels (Qariaraqyuk / Brooman Point):**
   Sunken entrance passages (`-1.2 m` below the main living floor) trap dense `-19 °C` air below the sleeping/hearth bench
   plane by buoyancy alone, keeping dome interiors `+12..+16 °C` without mechanical doors losing the heat bubble.
2. **Iglulik / Central Arctic multi-dome `qaggiq` clusters & air-gapped caribou-hide liners:**
   Linked residential domes (`yt_house_rich`, State Crown ring) and an inner taut hide liner suspended `18 cm` inside the
   structural pycrete shell prevent radiant frost-drip while keeping the structural pycrete wall safely below `0 °C`.
3. **Sakha / Yakutsk permafrost engineering (`balagan`, `khoton`, `labaz`, `serge`, ventilated pads & `-10 °C` cellars):**
   Heated halls sit on coarse ventilated gravel plinths over thaw-stable fan deposits; wet ice-rich silt holds only post-raised
   `labaz` caches and unheated `khoton` winter yards; deep ice cellars (`buluus`) are dug exclusively into the shaded bank
   that never sees direct sun; carved `serge` hitching posts mark moot courts and gates.
4. **Ladakhi / Pamir high-desert meltwater `kuhl` leats & dark-boulder thermal crop pockets (`5,700 m`, `94 mm/yr`):**
   Gravity channels tapped off the `Musïq Quli` `+29 m` weir contour across the NNE-tilted sunny right bank, feeding stone-walled
   dark-impactite boulder pockets whose thermal mass buffers night frosts around `ïsnoo-pa'a` (snow-potato) and `isiit`
   (sweetroot).
5. **High-Arctic snow-fence drift harvesting & Russian/Siberian shared-flue `banya` mass walls:**
   Four WNW windward fences convert `300°` blizzards into clean `26 m` leeward snow quarries while calmer air settles over the
   roofs below; every steam bathhouse (`yt_bathhouse`) backs onto a `yt_smithy` within `5 m` to share forge heat.

---

## 3. Enforced Layout Rules (`src/31-ql-rules.js` -> `40/40` tests passing)

`QOOLD.checks(L)` verifies 14 geometric, environmental, and cultural invariants on plain records (`[G data]`):

1. `parts.known_kit_and_box`: All `96` placed records match `KIT` dimensions (`0°`/`90°`/`180°`/`270°`) with valid mouths.
2. `permafrost.heated_on_gravel`: Zero `heated: true` structures on `lake`, `coulee`, `pasture` (wet silt), `northbank`
   (shaded permafrost reserve), or `tombridge`.
3. `pasture.elevated_or_unheated`: `pasture` holds only elevated `yt_cache_platform` (`labaz`), `yt_corral` (`khoton`), or
   seasonal unheated `yt_ice_fort`.
4. `parts.no_overlap`: Zero AABB collisions across all `96` footprints (`95` buildings/works + `court.moot` open court).
5. `wind.no_west_mouth`: Zero entrance tunnels (`mouth`) open `W` into the `300° WNW` katabatic gale.
6. `wind.snow_drift_clear`: Zero buildings inside the four `26 m` leeward `driftBox` snow-quarry zones (`fence.1`..`4`).
7. `winter.covered_network`: `KCITY.covered` links all `47` `winterNet` buildings into **`1` connected component** (`91`
   tunnels, `45` junction/warming domes, `0` blocked ways, max span `<= 135 m`).
8. `thermal.bathhouse_shares_forge`: Every `yt_bathhouse` (`4/4`) sits within `<= 5.0 m` edge-to-edge of a `yt_smithy`.
9. `smell.tanneries_downwind_se`: All tanneries sit downwind on the ESE flank (`u >= +210 m`).
10. `solar.crops_on_sunny_north_bank`: All Three-Gifts crop terraces sit on `sunbench` (`v < coulee`), irrigated within `32 m`
    of `leat.sun`, while `coppice.larch` and all `3` permafrost ice cellars sit on shaded `northbank` (`v > coulee`).
11. `sacred.seven_tombs_on_dry_ridge`: All `7` Clan Tombs stand on `tombridge` at `y >= +46 m` (`+26 m` above highest flood).
12. `pycrete.works_complete`: Lake ice quarries (`2`), coulee weir, aufeis field, sawdust chute, pulp mill, and pycrete casting
    yard are all present and positioned in sequence.
13. `sights.clear`: All `4` key sightlines (`sight.leng`, `sight.outlet`, `sight.sewall`, `sight.coulee`) have positive
    clearance margins (`+38..+180 m`).
14. `census.matches_housing`: Total permanent census (`2,200`) matches ward housing capacity (`36` clan houses + chief's hall +
    barracks + gate/watch domes -> `2,012`–`2,464` capacity window).

---

## 4. Floor Area & Furniture Summary (`FURNITURE.md`)

- **Footprint & roofed area (`QOOLD.area(L)`):**
  - Total placed footprints (`96` records): **`29,886 m²`** (`13,200 m²` roofed permanent structures across `47` `winterNet`
    halls/houses/works + `48` open/semi-roofed quarries, terraces, yards, caches, and tombs + `990 m²` `court.moot`).
  - Covered winter tunnel network (`91` segments x `2.6 m` + `45` domes): **`~4,180 m²`** of sheltered winter passage.
- **Furniture manifest (`FURNITURE.md`):**
  - **`5,030` total catalog pieces** across `yeti`, `eternian` (war loot), `nomad`, and `supplies` (`52` distinct piece ids).
  - **`41` existing catalog/loot keys** + **`11` `NEW` Khaayken-specific pieces** queued for `kits/catalog/src/yeti.js`:
    `yt_ice_saw_frame`, `yt_pycrete_mold_box`, `yt_sawdust_hopper`, `yt_aufeis_chisel_rack`, `yt_placer_riffle_box`,
    `yt_nitre_scraping_vat`, `yt_qiviut_broadloom`, `yt_ivan_chai_roller`, `yt_sweetroot_mash_tun`, `yt_ice_jigger_board`,
    and `yt_serge_hitch_post`.
