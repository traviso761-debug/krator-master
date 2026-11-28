# Urundashi (*Urundaši*, `srbp1bvh1r`) — Fortified Steppe Garrison Seat of the 4th Regiment

`settlements/urundashi` (`dist/urundashi.html`) builds **Urundashi** (*Urundaši*, scale-model pin `srbp1bvh1r` at `5.1 px 779, 1153`, `3,220 m` ASL, `Dfb` `424 mm` `+8 °C`), second town of the Kingdom of Shumar, seat of **`S4` `Ṣōrun-Dubnu`** (*The Eastern Flock-Bench & Brine Brooks*, 4th Regiment **"Horsemen of the Steppe"**), eastern terminus of the `92 km` royal plateau highway from Amaro (`supp.ssgsv5zbd2`), and customs gateway for the **Izani & Order of Historians Caravan** (`gate.east-foothills`: Longsong `books` -> Urundashi -> Amaro, Iziz `medicine`, Pylon `mechparts`).

Follows `settlements/shumar/BUILD-OUT.md` §1a, §2a ("Walled steppe garrison towns on `KCITY.grid`"), §3.1, and `core/region/data/shumar-tune.js` (`SHUMAR_TUNE`).

---

## 1. Site & Scale-Model `5.1` Ground (`px 779, 1153`)

- **Scale-model anchor**: `px = (779, 1153)` on `tools/scale-model/model/data/h.png` (`3,219.7 m` ASL, dry gentle `1.2%` steppe bench sloping SW toward the headwater hollow of `r011 Dubnosriba` / *Dubnu-Nārun* at `3,153.6 m`, `px 778.7, 1157.2 -> 774.9, 1152.9`).
- **Vertical datum**: `UR.DATUM = 3,154.0 m` ASL (`Dubnosriba` headwater confluence level = local `y = 0.0 m`; Urundashi central crossroads at `(0, 0)` = local `y = +65.7 m` / `3,219.7 m` ASL).
- **Hydrology (`core/water`)**:
  1. **`r011 Dubnosriba` (*Dubnu-Nārun*)**: main snowmelt steppe river curving past the south-west meadow bench (`y = +4.5 m -> -2.0 m`).
  2. ***ʿAyn al-Dubnu* Headwater Brook**: spring-fed snowmelt brook descending from the NE limestone bench (`+76 m`) past the SW *Rabaḍ al-Dubnu* mills, nitre vats, `Ṣūnu-šikaru` stills, and cavalry remount paddocks into `Dubnosriba`.
  3. **Garrison Moat (*Ḫandaq al-Qaṣba*)**: `13 m`-wide water-filled defensive ditch (`KCITY.grid` `moat: { gap: 15, width: 13 }`) encircling the bastioned *ablaq* town wall, diverted from *ʿAyn al-Dubnu* and spanned by `4` stone pointed-arch gate-bridges.
  4. **Stud & Still Mill-Leat**: stone diversion race driving overshot `sm_watermill` wheels and condenser troughs in *Rabaḍ al-Dubnu*.
  5. ***Sabil al-Rikāb* Crossroads Basin**: octagonal dressed-basalt snowmelt fountain pool (`WATER.still`) at the central crossroads of the walled square.

---

## 2. Urban Form on `KCITY.grid` (`3,500` Town + `990` Ring = `4,490` People)

Built on **`KCITY.grid`** (`core/city/37-city-grid.js` — Chiang Mai / Mamluk frontier *qaṣba* irregular fortified square) paired with `KCITY.create` lot/alley infill and `KHAMLET.shumariRow` ring villages:

1. **Bastioned Irregular Mamluk Square (`KCITY.grid.plan` + `KCITY.grid.wall`)**:
   - `610 × 570 m` inner ring street (`half: [305, 285]`, `cells: [5, 5]`, `jitter: 0.13`, `drop: 0.20`, `bend: 0.32`), `18 m` wall setback, `13 m` wet moat `15 m` outside the wall.
   - `4` polygonal Mamluk corner bastions (`sm_payaru_tower`), *ablaq* curtain segments (`sm_curtain_wall`), interval wall towers, and `4` Giant-clearance (`>= 4.2 m`) `sm_pishtaq_gate` portals on the two crossed avenues:
     - **`u-` West Gate — *Bābu ʾAmāru***: terminus of the `92 km` paved/graded plateau highway from Amaro (`road.amaro-urundashi`).
     - **`u+` East Gate — *Bābu al-Šarq* (*Bābu Īziz*)**: eastern caravan gate (`gate.east-foothills` toward Iziz & Longsong).
     - **`v-` North Gate — *Bābu Yāmu***: `52 km` road NE to `Yāmu-Qappu` & `Šīru-Yāmu` (`road.urundashi-yamu`).
     - **`v+` South Gate — *Bābu Dubnu***: southern road to the *Dubnosriba* headwaters, `Dubnu-Yayla`, and `Urudīru-Qappu`.
2. **Inside the Walls (`4` Regimental & Hearth Wards)**:
   - **NW 4th-Regiment Keep (*Qappu al-Fursān*, "Horsemen of the Steppe")**: `sm_citadel_keep`, `sm_diwan_hall`, `sm_kattu_chancery` (Order of Historians `books` relay archive), `sm_regiment_barracks`, `sm_armoury`, `sm_state_granary` (*iqta'* wool/cheese/grain tithe store), `sm_ordeal_yard`, `sm_giant_sword_hall`, `sm_captain_bayt` (`giant: true`).
   - **Central Crossroads Bazaar & Mother *Qubba* (*Sūq al-Rikāb* & *Qubbat al-Dubnu*)**: central *sabil* meydan (`sm_sabil_shrine` + octagonal basin), `4` `sm_regiment_qubba` mausolea (`+1` right-handed spiral & star-carved Mamluk domes), `sm_doriyan_stele` (`-1` mirror-spiral memorial), `sm_bimaristan`, `sm_hammam`, `sm_cistern_hall`, and `sm_bazaar_hall` rows.
   - **SW Metallurgy & Ordnance Ward (*Ḥārat al-Ḥadīd*)**: houses `6` of Urundashi's `9` `SHUMAR_TUNE` works (`urundashi.crucible`, `urundashi.coal-hearth`, `urundashi.bladesmiths`, `urundashi.armourers`, `urundashi.smithy`, `urundashi.powder`).
   - **NE & SE Hearth-Commons Wards**: `KCITY` steps 6–11 infill (`sm_sword_villa`, `sm_courtyard_house`, `sm_hearth_house`, `sm_shop_house`, `sm_terrace_house`, `sm_weaver_dyer`, `sm_lacquer_inlay_shop`, `sm_bakery`, `sm_brewery_teahouse`, `sm_butcher`, `sm_cadet_cell`, `sm_giant_cadet_cell`, plus active `KCONS` construction sites).
3. **Outside the Moat (`3` Extra-Mural Suburbs)**:
   - **East Outlander *Wikala* Ward (*Rabaḍ al-Šarq*, `~200` `-no` outlanders)**: `2` `sm_wikala_caravanserai`, `2` `sm_envoy_house` (Historian & Izani factors), `4%` *Bābu* customs weigh-house, `sm_outlander_lodging`, caravan `sm_stock_fold`.
   - **SW Headwater Stud, Stills & Nitre Suburb (*Rabaḍ al-Dubnu*)**: `urundashi.stud` (4th-Regiment cavalry remount corrals & stone paddocks), `urundashi.stills` (`Ṣūnu-šikaru` copper-dome alembics `sm_spirits_still` + sheltered `sm_apricot_orchard`), `urundashi.nitre` (`sm_saltpeter_works` limestone nitre vats), and overshot `sm_watermill`s.
   - **West Highway Suburb (*Maḥallat ʾAmāru*)**: wayside `sm_wayside_cairn`, post-station, wheelwrights, cottages, and active `KCONS` construction lots (`vacant: true`).
4. **Five Steppe Ring Hamlets (`990` People in `SHUMAR_TUNE.rings` via `KHAMLET.shumariRow`)**:
   - `urundashi.ring.farm-1` (`240`, `farming`), `urundashi.ring.farm-2` (`240`, `farming`), `urundashi.ring.salt-1` (`190`, `salt` — `sm_salt_evaporator` brine-boiling pans), `urundashi.ring.ranch-1` (`160`, `ranch`), `urundashi.ring.ranch-2` (`160`, `ranch`).

---

## 3. Core Adoption (written before the first fragment; checked by `tools/check_core_use.py`)

| Need | Module | How |
|---|---|---|
| **Building kit & interiors (`57` defs)** | `core/engine`, `kits/shumari` (`shumari.py`), `kits/interiors` (`sets/shumari.js`), `kits/catalog` | Read in place (`MAT` PBR sets + `f_*` triplanar detail maps, `KF.batch({indexed:true})` catalog furniture, `?interiors=1` `SVIX` rooms) |
| **Walled irregular square & city infill** | `core/city` (`KCITY`, `KCITY.grid`, `KCITY.constructMesh`) | `KCITY.grid.plan` + `KCITY.grid.wall` (`37-city-grid.js`) for the bastioned Mamluk *qaṣba* & wet moat; `KCITY.create` for cell & extra-mural suburb infill; `KCITY.constructMesh` + `kits/construction` (`KCONS.libMats('construction')`) for active vacant lots |
| **Five steppe ring villages** | `core/hamlet` (`KHAMLET.village`, `core/hamlet/shumari/25-hamlet-shumari.js`) | `5` ring hamlets (`990` people: `2` farming, `1` salt-evaporator, `2` cavalry/sheep ranch) matching `SHUMAR_TUNE.rings` |
| **Terrain & 4-layer hex-tiled ground** | `core/terrain/43-core-ground.js` (`KGROUND`), `core/drawn` (`KDRAWN`) | Closed-form `urundashiH` blended into `UR_MODEL` (`35 × 35` cells from `5.1 h.png`); `KGROUND.hook` with `shigh:ground.puna`, `shigh:ground.gravel`, `shigh:rock.basalt`, `shumari:cobble`; registered in `KDRAWN.grid` |
| **Rivers, mill-leat, moat & *sabil* basin** | `core/water` (`20..22, 50..51`) | `WATER.flow` + `WATER.drawFlow` for `Dubnosriba`, *ʿAyn al-Dubnu*, and the stud/still mill-leat; `WATER.still` + `WATER.drawStill` for the garrison moat segments and central *sabil* pool |
| **Steppe & riparian flora** | `core/biome`, `biomes/shighlands` (`--station shumar`) | Read in place (`helixpoplar` & `whorlapricot` along *ʿAyn al-Dubnu* and moat banks, `coiljuniper` & `ropepine` windbreaks, `spiralsage` & `ichu` on the `Dfb` flock-bench), wired with `f_plant` & `f_fruitSkin` library maps |
| **Live regional economy & census parity** | `core/clock`, `core/simulation`, `core/region` (`core/region/data/shumar-tune.js`) | `UR_SIM` runs `SHUMAR_TUNE.valley` live (`0` problems) and exposes `srbp1bvh1r`'s `9` works, *iqta'* wool/cheese/grain/mounts tithe, `Ṣūnu-šikaru` (`tequila`), and Longsong `books` imports |
| **PRNG, spatial index, masks, tags, doors, walk, sky, export** | `core/rand`, `core/space`, `core/mask`, `core/tags`, `core/door`, `core/walk`, `core/atmos`, `core/host`, `core/export` | Deterministic `KRAND` (`0` `Math.random`/`Math.sin` hashes, `0` `getImageData`), `SVTAGS` registration before draw, `KDOOR` + `KWALK` (`F`-key walker), `1.09 atm` highland sky, Godot `EXPORT` (`terrain`, `city`, `buckets`, `materials`), and `tools/harness.py` `verify.py --assert` |

---

## 4. Verification Gates

1. `node settlements/urundashi/tests/test-urundashi-site.js` — offline `[G data]` checks (paired with `T.neg` negative controls):
   - `KCITY.grid` irregular bastioned square (`4` corner bastions, `4` named *pishtaq* gates, `4` moat bridges, connected street graph);
   - Exact `SHUMAR_TUNE` parity (`3,500 ± 5%` town people, `5` ring hamlets = `990 ± 10%` people, all `9` `urundashi.*` works placed by `workId`);
   - Zero OBB building collisions (`< 0.05 m`), zero houses on street carriageways, zero buildings in moat/rivers;
   - Live `UR_SIM` regional books (`0` problems, `books` imported via `gate.east-foothills`, `steel`/`blades`/`armour`/`powder`/`tequila`/`mounts` produced);
   - Deterministic `KRAND` across fresh runs.
2. `PW_CHROMIUM=/usr/bin/chromium /home/antigravity/.venv/bin/python settlements/urundashi/verify.py --assert --no-cache` — headless WebGL checks + visual inspection of all showcase views + `100%` opaque surface & furniture texture coverage.
3. Static repo checks (`check_port.py`, `check_core_use.py`, `check_assembly.py`, `check_budgets.py`, `check_source.py`).
