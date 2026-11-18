# The Shumari kit: the design plan (draft, 2026-11-17)

The building kit of **Shumar** (`Šumārum`), the high dry plateau kingdom of the **Shumari** (`Šubaru-šu`, "the Sword-caste";
`LORE.md` §6.23, §10 line 1023, §11 line 1047; tongue and 28-letter `Šumaru-kattu` Blade-and-Hook script in
`lore/tongues-of-krator.html` lines 3255-3326, 5103-5355; biome stations in `biomes/shighlands/PLAN-STATIONS.md`,
"Shumar: the western dry-plateau stations"). Catalog, `core/sockets` and `core/tags` culture **`shumari`**; culture sign
a **notched blade and golden breath-thorn (`ḫa-ṭōnu`)**; kit colours **basalt grey (`#36383e`), crimson lacquer (`#9e2a2b`)
and burnished bronze/gold (`#b8861b`)** against pale highland travertine/limestone (`#d8cdb8`).

Owner's brief (2026-11-17, in conversation):
1. **Highland basalt Mamluk + castle-town discipline:** Kars / Ani Armenian-highland dressed dark basalt and *ablaq*
   banded masonry fused with **Mamluk Cairo carved and spiral-fluted stone domes (`qubba`)**, towering recessed *pishtaq*
   portals, *muqarnas* transition shoulders, *shurafat* blade-crenellations (`refs/01` to `refs/03`) and Japanese
   *ishigaki* / *buke-yashiki* battered plinths and crimson-lacquered timber galleries.
2. **Ancestor and regimental cult:** no temple priesthood of the old lakeshore gods; the Shumari keep an **ancestor and
   regimental cult** (domed regimental mausolea, the Hall of Blades, *sabil* snowmelt memorial fountains, the Ordeal gate,
   lost-*Dōriyan* cenotaphs and household blade-niches), because **the Ordeal (`Urudīru`)** makes regiment and sword-oath
   the true lineage.
3. **Free Giant (`Gēdu-šu`) clearance on all military, civic, sacred and Sword (`-šu`) buildings:** Free Giants from
   Greenstep (`3.2-3.8 m` tall) pass the Ordeal and take `-šu` as full Sword-brothers, so every `defence`, `civic`,
   `sacred` and `rich` (`sword`) building is built to Giant clearance (`>= 4.2 m` portals, `>= 5.0 m` hall vaults,
   compound Giant-and-human stairs), while `-ko` (`poor`) and `-ra` (`middle`, Hearth-Commons) houses and workshops keep
   human scale.
4. **Biome:** Shumar is scoped as Stations 4 (`--station shumar`, 3,308 m `Dsb` basalt gorge and dry plateau) and 5
   (`--station ordeal`, 4,426 m `ET`/`Dsc` SE ramp) of `biomes/shighlands`, read in place to dress this kit's sheet.

Read `kits/eternian/PLAN.md` and `kits/yeti/PLAN.md` for the precedents this kit follows (`core/engine` read in place,
every Voth census trade accounted for, real openings on `core/door`, walkable floors/stairs on `core/walk`, interiors via
`core/engine/91i-interiors.js`, and a single shared `core/tags` rebuild when registering new culture names).

## 0. What the build is

| | |
|---|---|
| Folder | `kits/shumari/` (`src/`, `refs/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `README.md`, `INDEX.md`, `PORT.md`, `KNOWN_ISSUES.md`, `API.md`) |
| Page | `dist/shumari.html`: the kit sheet — rows by caste/tier (`poor`/`cadet`, `middle`/`hearth`, `rich`/`sword`), the ancestor and regimental cult row, civic and Mamluk state row, citadel and defence row, canyon trades and mines row, a **gorge-rim Mamluk street** (battered plinths, *sabil*, *qubba* dome, Giant *pishtaq* compound, one building cut away), and a **plateau-and-canyon flora row** reading `biomes/shighlands` (`--station shumar`) in place |
| Engine | **`core/engine` read in place** (`core/engine/engine.py`: `10-core.js` .. `99-host-take.js`, `99-tail.html`), scaffolded from `tools/new_build/` and listed in every check of `tools/checks_optin.json` (`recorded`, `minset`, `samplers`, `drawn-ground`, `names`). Zero shadowed engine files in `src/` |
| Registry | `SM.def` (`defBuilding`, one def per building, tags `culture: 'shumari'`, `tier`, `caste`, `giant`, `role`, `job`), registered in `core/tags` before any geometry is drawn |
| Scale rule | Human baseline `1.0x`; Free Giant (`Gēdu-šu`) clearance constant `SM_GIANT_DOOR = 4.4` m (minimum clear `4.2` m) and `SM_GIANT_VAULT = 5.2` m (minimum `5.0` m) on every def with `giant: true` (`tier: 'rich'` / `caste: 'sword'`, and all `role: 'civic' \| 'sacred' \| 'defence'`) |
| Biome | `biomes/shighlands` (`--station shumar`) read in place through a `93b-bio-` band (`ropepine`, `coiljuniper`, `helixpoplar`, `whorlapricot`, `spiralsage`, `ichu` and `swirl tussock`) |
| Out of scope here | Shumar's capital city page (`settlements/shumar/` or `settlements/qappu/`, its own plan on `core/city` once pinned in `60-settlements.js`), Tallhouse at the NW foot (`px 683,1184`), Greenstep's Talovolci (`kits/` of its own), and Shumari/Giant character outfits (`core/charactermodels`) |

It is a new kit, so it goes in the gallery when it first reaches `main` (`gallery/README.md`).

---

## 1. The reference board and real-world synthesis

Copied into `kits/shumari/refs/` (2026-11-17):

| File | What it gives the kit |
|---|---|
| `refs/01-mamluk-carved-dome-ablaq.png` | High-shouldered pointed stone dome carved in overall star-and-arabesque relief; inscription collar band; arched drum clerestory; *ablaq* dark/light horizontal masonry courses; stepped prism *muqarnas* ("Turkish triangle") corner transitions; *shurafat* fleur-de-lis parapet; tiered bronze *jamur* finial |
| `refs/02-mamluk-spiral-dome-minaret.png` | **Spiral-fluted / torsion-ribbed Mamluk stone dome** over arched drum collar; square-to-octagon transition with `1-over-2` bullseye oculi (*qamariyya*) above triplet lancets; polygonal stone watch-minaret with stalactite *muqarnas* corbelled balconies and pierced stone *jali* parapet panels |
| `refs/03-mamluk-pishtaq-twin-domes.png` | Monumental symmetric *waqf* facade: soaring recessed *pishtaq* / *iwan* portal rising above the parapet, cusped *muqarnas* hood, *ablaq* voussoirs, slender corner colonnettes, octagonal corner turrets, twin carved domes on fenestrated drums, continuous *shurafat* crenellations |

### Why this synthesis fits Shumar's map and lore

- **Climate & stone (`rmw5s3ktxgv0d`):** 33,412 km² tableland at 2,850-4,450 m (median **3,301 m** on the bench, **1.06 atm**,
  `Dsb` dry-summer continental, **408-424 mm/yr**, warm month +18..+20 °C, cold month -5..-6 °C, winter nights -12..-23 °C),
  cut by 16 snowmelt gorges through **sedimentary limestone and columnar dark basalt**. Real-world twins: **Kars and Ani**
  (Armenian Highland `Dsb`, dressed black/grey basalt + pale tuff *ablaq* citadels and conical/pointed stone drums),
  **Khunzakh** (Dagestan canyon-lip tableland), and **Mamluk Cairo** translated out of warm yellow Mokattam limestone
  into **dark highland basalt, pale travertine, iron-crimson stone and crimson lacquer**.
- **Social structure (`LORE.md` §6.23, `tongues-of-krator.html`):** Purchased slave-soldiers who inverted power over the
  exiles of lost **Driyan** (*Dōriyan*), speaking an English-descended tongue reshaped toward **Akkadian + Japanese** with
  **four mandatory grammatical castes**:
  - **`-šu` (Sword-caste, `tier: 'rich'`):** full military-administrative citizens who survived the Ordeal — native sons,
    escaped Nazari slaves and Free Giants (`Gēdu-šu`) alike.
  - **`-ra` (Hearth-Commons, `tier: 'middle'`):** free artisans, canyon orchardmen, millers, smiths and merchants.
  - **`-ko` (Ordeal-Cadets & Probationers, `tier: 'poor'`):** native youths (`Ṭirānu-ko`), newly arrived Nazari fugitives
    (`Nazāru-ko`) and Giant initiates (`Gēdu-ko`) in austere barracks/cells before the Ordeal, alongside poor upland herders.
  - **`-no` (Outlanders):** traders and envoys confined to the caravanserai/customs court outside the inner *pishtaq* gate.

---

## 2. The architectural rules the generator follows

### A. The Mamluk dome (`smDome` in `40-sm-kit.js`)

The pointed Mamluk stone dome (`qubba`) is a common motif across regimental tombs, civic halls, *sabil* fountains, bathhouses,
gatehouses and Sword-caste reception halls (*qa'a*):

1. **Profile:** a high-shouldered **pointed four-centred / catenary-ogival curve** (steeper than a hemisphere, height
   `0.72` to `0.92` of outer diameter, stilted on a cylindrical or 16-sided drum `0.35` to `0.55` of diameter). Never a
   bulbous onion (stays Xanadu/Mughal) and never a low saucer (stays Byzantine/Yeti).
2. **Two exterior finishes** (from `refs/01` and `refs/02`):
   - **Spiral-fluted (`style: 'spiral'`, `refs/02`):** `16` to `24` convex stone gadroons/ribs winding `0.35` to `0.6` of
     a turn from drum to apex, **always right-handed (`+1`, matching `SHIGH.HAND`)**, except on lost-*Dōriyan* mourning
     monuments which wind **mirror-handed (`-1`)**. Built as real indexed lathe/rib geometry so light and shadow catch
     every flute at dawn and dusk (`VISUAL-BAR.md` Pillar A & Silhouette gate).
   - **Star-carved (`style: 'carved'`, `refs/01`, `refs/03`):** clean pointed stone shell mapped in world-proportioned bands
     with geometric star-and-interlace stone relief (`stone.dome.mamluk`; stand-in `stone.stucco.yeseria` tinted travertine)
     above a horizontal carved frieze collar (`kattu` epigraphic band or `frieze-star-maroon`).
3. **The zone of transition** (`smDrum` in `41-sm-dome.js`):
   - Square base chamber -> **stepped prismatic corner triangles** (Mamluk "Turkish triangles" / simplified 3-tier stone
     *muqarnas* chamfers, `refs/01`) framing **`1-over-2` *qamariyya* bullseye oculi over triplet arched lancets**
     (`refs/02`) -> octagonal belt with *shurafat* cresting -> fenestrated drum (`8` or `12` arched clerestory lights on
     `svPane`, real `KGLASS` smoked/amber panes, lit at night) -> dome -> **burnished bronze *jamur* finial** (three
     graduated bronze spheres on a mast; **culture-neutral in mesh**).
4. **Spans:** *sabil* and turret domes `3.5-5.0 m`; regimental *qubba* and bath domes `6.5-10.5 m`; Sword *diwan* and
   Hall of Blades domes `11.0-16.0 m` (supported on heavy basalt squinch-arches so interiors are hollow and walkable).

### B. Highland *ablaq*, battered plinths and *shurafat* parapets

- **Battered *ishigaki* plinths:** every monumental, rim or multi-storey building sits on a `0.8-2.2 m` battered dark
  polygonal basalt base (`slope 1:6` to `1:4`), shedding frost heave and anchoring canyon-lip lots.
- ***Ablaq* coursing (`smAblaqWall`):** alternating horizontal ashlar courses (`0.35-0.55 m` high) of **dark basalt**
  (`#36383e`), **warm cream highland travertine** (`#d8cdb8`), and occasional **crimson ironstone** (`#7e2c28`) on
  portals, drums, window voussoirs and Sword compounds. Hearth-commons (`-ra`) buildings keep *ablaq* to door arches and
  stringcourses over dressed grey basalt rubble; `-ko` poor buildings use plain dark basalt rubble and lime-earth mortar.
- **Blade-*shurafat* parapets (`smParapet`):** flat stone-and-lime roofs (built to hold dry insulating winter snow behind
  drained stone spouts) are crowned with stepped Mamluk trefoil/blade merlons (`refs/01`–`03`), sharpening the classic
  Cairene fleur-de-lis toward a notched-blade silhouette.
- **Crimson lacquer & bronze joinery:** projecting upper winter galleries (*mashrabiya* / *engawa* hybrids), eaves
  brackets, heavy studded doors and window lattices (`jali`) wear **deep crimson lacquer (`wood.lacquer.crimson`)** with
  **cast bronze straps and bosses (`metal.bronze.cast`)**.

### C. The Free Giant (`Gēdu-šu`) clearance rule

Free Giants (`3.2-3.8 m`, `core/charactermodels/tools/giant.py`) who pass the Ordeal hold `-šu` rank alongside human
Sword-brothers. Architecture encodes caste equality inside `-šu`:

| Building class | `giant` tag | Portal clear height | Main storey / vault height | Stairs (`36s-stair.js` / `KWALK`) |
|---|---|---|---|---|
| `defence`, `civic`, `sacred`, `rich` (`caste: 'sword'`) | `true` | **`>= 4.2 m`** (`4.4 m` standard; either twin Giant `KDOOR` leaves or a `4.4 m` leaf pair beside/housing a human wicket leaf, set deep inside a `6.5-11 m` recessed *pishtaq*) | **`>= 5.0 m`** ground floor (`5.2-8.5 m` under domes/iwans) | **Compound Giant-and-human flight**: `2.4 m+` wide, central Giant tread (`0.42 m` riser / `0.55 m` go) flanked by paired human half-risers (`0.21 m`), registered as walkable `KWALK` strips |
| `middle` (`caste: 'hearth'`, `-ra`) & craft shops | `false` | `2.2-2.5 m` | `3.2-3.6 m` | Standard `1.1-1.4 m` stone/timber flight |
| `poor` (`caste: 'cadet'`, `-ko` / herders) | `false` (except `sm_giant_cadet_cell`: `true`) | `2.0-2.2 m` (`4.2 m` on Giant cadet cell) | `2.8-3.2 m` | Standard step |

`verify.py` asserts `giant-clearance`: every def tagged `giant: true` has at least one unlocked entrance `KDOOR` opening
with `h >= 4.2` m (or is explicitly marked a solid monument/stele) and ceiling clearance `>= 5.0` m, with a negative control.

### D. Openings, glass, heat and culture sockets

- **Zero dark voids (`core/engine/36o-open.js`):** every doorway uses `svLeaf` / `svDoorway` (`core/door` `KDOOR`), every
  drum lancet, *qamariyya* bullseye and gallery window uses `svPane` / `svPanePoly` (`KGLASS` smoked, clear or amber
  alabaster/crown-glass panes, with `svRoom` lit backing only on locked auxiliary wings; primary buildings have hollow
  shell walls for X cut-away and `?interiors=1`).
- **Cold-plateau heat & water (`Dsb`, 0 coal, 424 mm/yr):** no open braziers as primary house heat; dwellings and barracks
  build masonry mass stoves / flued stone sleeping benches (*kang*-meets-*suffa*) venting through octagonal basalt
  chimneys with *shurafat* caps, burning canyon poplar, apricot prunings, dung cakes and upland pine charcoal; civic
  courts and *sabils* collect roof snowmelt into vaulted stone cisterns.
- **Culture-neutral geometry (`LORE.md` §10, `README.md`):** no notched-blade sigil or `Šumaru-kattu` name is hardcoded
  into building geometry; banners, standards, *pishtaq* escutcheons and finial emblems mount on `core/sockets`
  (`38-symbols.js` culture `'shumari'`), so a conquered building in another polity swaps signs cleanly.

---

## 3. The ancestor and regimental cult

The Shumari brought no temple hierarchy out of fallen *Dōriyan*, and a caste replenished each generation by native cadets,
escaped Nazari slaves and Free Giants cannot worship blood pedigree. **The regiment (*ṭuppu*) is the family, and its dead
captains are the gods of the house:**

- **Regimental *Qubba* (`sm_regiment_qubba`, two variants: `#spiral` and `#carved`):** a square *ablaq* mausoleum chamber
  crowned by a high Mamluk dome (`refs/01`, `refs/02`), entered through a `4.4 m` Giant *pishtaq*. Inside: tiered basalt
  columbarium niches for ash urns, notched service blades racked point-up around a bronze oil brazier, and cast bronze
  muster-plates in `Šumaru-kattu`.
- **Hall of Blades (`sm_hall_of_blades`):** the twin-domed symmetric *waqf* complex of `refs/03` — a towering central
  *pishtaq* portal opening into an arcaded snowmelt court, flanked by twin carved domes (one for human `-šu` captains,
  one for `Gēdu-šu` Giant captains and fallen *Urudīru* masters) and a colonnaded ancestor-roll gallery.
- **Memorial *Sabil*-Loggia (`sm_sabil_shrine`):** the classic Cairo *sabil-kuttāb* adapted to a `424 mm/yr` plateau: a
  street-corner domed snowmelt cistern behind bronze grilles (`card.tracery.bronze`) where any passer-by drinks in the
  name of a regiment's dead, topped by an open crimson-lacquered upper gallery where `-ko` cadets recite the regimental
  annals.
- **Ordeal Gate-Shrine (`sm_ordeal_gate`):** a stark dark-basalt *pishtaq* arch and single spiral dome astride the SE ramp
  road (`Station 5` ground): initiates pass outward as `-ko` and return inward under the notched bronze lintel as `-šu`.
- **Lost-*Dōriyan* Cenotaph (`sm_doriyan_stele`):** an open octagonal basalt canopy under a **mirror-handed (`-1`) spiral
  dome** sheltering three tall black impactite steles oriented north-west toward the lost lakeshore cities.

---

## 4. What the kit holds (52 defs)

Fragment prefix convention (`kits/eternian/build.py` rule 2): every `4x-7x` fragment opens with `/* prefix: sm */` and
declares only `sm*` / `SM_*` top-level identifiers; every `defBuilding({...})` carries a unique numeric `seed`.

### Dwellings (13 defs)

| Key | Tier / Caste | `giant` | What |
|---|---|---|---|
| `sm_cadet_cell` | poor (`-ko`) | no | Austere basalt single-room probationer cell, flat lime roof, slit lancet, stove flue |
| `sm_giant_cadet_cell` | poor (`-ko`) | **yes** | High-vaulted basalt initiation cell for `Gēdu-ko` Free Giant candidates (`4.4 m` door) |
| `sm_cliff_cot` | poor (`-ko`) | no | Two-level rubble-basalt cottage stepped onto a gorge shelf, *ichu*-and-slate lean-to |
| `sm_herder_house` | poor (`-ra`) | no | Low thick-walled upland stone house + sheep/goat winter fold against the windward wall |
| `sm_outlander_lodging` | poor (`-no`) | no | Plain two-storey basalt row-lodging for `-no` foreign caravanners in the outer ward |
| `sm_hearth_house` | middle (`-ra`) | no | Two-storey dressed basalt house, *ablaq* door arch, crimson-lacquered *mashrabiya* bay |
| `sm_courtyard_house` | middle (`-ra`) | no | Artisan's walled work-court house, snowmelt tank, external stone stair, flat *shurafat* parapet |
| `sm_terrace_house` | middle (`-ra`) | no | Narrow 3-storey canyon-ledge house, battered *ishigaki* base, projecting timber winter gallery |
| `sm_shop_house` | middle (`-ra`) | no | Ground-floor arched stone shopfront (`KDOOR` folding shutters) + upper family dwelling |
| `sm_sword_villa` | rich (`-šu`) | **yes** | Walled *ablaq* Sword-officer house: `4.4 m` *pishtaq*, domed *qa'a* hall (`5.6 m`), ancestor niche |
| `sm_captain_bayt` | rich (`-šu`) | **yes** | Mamluk *bayt* compound: courtyard, *iwan*, spiral mini-dome over the blade shrine, retainers' wing |
| `sm_giant_sword_hall` | rich (`-šu`) | **yes** | Heavy polygonal-basalt `Gēdu-šu` residence: oversized courtyard arcade, raised stone hearth dais |
| `sm_rim_pavilion` | rich (`-šu`) | **yes** | Cantilevered *ablaq*-and-crimson-lacquer belvedere pavilion under a pointed carved stone dome |

### Ancestor and regimental cult (`role: 'sacred'`, 6 defs — all `giant: true`)

| Key | What |
|---|---|
| `sm_regiment_qubba` | Single-dome regimental mausoleum (`#spiral` fluted dome `refs/02`, `#carved` star-relief dome `refs/01`) |
| `sm_hall_of_blades` | Twin-domed monumental *pishtaq* regimental *waqf* & ancestor-roll court (`refs/03`) |
| `sm_sabil_shrine` | Street-corner domed snowmelt fountain + upper cadet recitation loggia |
| `sm_ordeal_gate` | SE-ramp basalt *pishtaq* & spiral-dome initiation gate |
| `sm_doriyan_stele` | Mirror-handed (`-1`) spiral dome canopy over three black impactite steles to lost *Dōriyan* |
| `sm_wayside_cairn` | Stepped basalt *ablaq* blade-pillar & bronze lamp niche (`giant` n/a: outdoor marker) |

### Civic and Mamluk state (`role: 'civic'`, 8 defs — all `giant: true`)

| Key | What |
|---|---|
| `sm_diwan_hall` | Grand Council of the `Šubaru-šu`: central 14 m star-carved dome, four axial *iwans*, Giant & human tiered stone benches |
| `sm_kattu_chancery` | State registry & `Šumaru-kattu` scriptorium/school: vaulted stone tablet archives, *qamariyya* clerestories |
| `sm_wikala_caravanserai` | Fortified customs caravanserai (*wikala*): `4.6 m` Giant gate-iwan, vaulted ground warehouses, upper `-no` galleries |
| `sm_hammam` | Domed Mamluk bathhouse: low *ablaq* mass pierced by concentric glass-lens domes (`tile.bath.lens`), shared stove wall |
| `sm_bimaristan` | Regimental hospital & house of healing: four-iwan courtyard around a snowmelt basin |
| `sm_state_granary` | Buttressed basalt *ablaq* vaulted grain & dried-apricot citadel store |
| `sm_cistern_hall` | Half-sunken groin-vaulted snowmelt reservoir with domed draw-head |
| `sm_envoy_house` | Guarded *ablaq* embassy house in the outer `-no` ward (carried for `envoys and embassy staff`) |

### Citadel and defence (`role: 'defence'`, 8 defs — all `giant: true`)

| Key | What |
|---|---|
| `sm_citadel_keep` | Kars-and-Cairo polygonal dark basalt citadel keep crowned with a central ribbed dome & corner turrets |
| `sm_curtain_wall` | Battered *ishigaki*-dressed basalt curtain wall (`8 m` walk height, *shurafat* merlons, machicolations) |
| `sm_pishtaq_gate` | Twin-turret *ablaq* fortress gatehouse with `4.6 m` bronze-strapped leaves & murder-hole *iwan* |
| `sm_payaru_tower` | Polygonal Mamluk beacon & watch-minaret (`refs/02`, `18-24 m`), *muqarnas* balconies, bronze signal brazier |
| `sm_regiment_barracks` | Quadrangle *ṭuppu* barracks: Giant & human vaulted dormitories, weapon racks, muster porch |
| `sm_ordeal_yard` | Walled sand-and-basalt training & trial court (`Urudīru` prep), viewing *iwan* |
| `sm_armoury` | Iron-barred vaulted arsenal & gunpowder magazine (buttressed blast roof) |
| `sm_gorge_bridge_tower` | Pointed-arch *ablaq* canyon bridge + toll/ferry guard tower spanning a gorge cut |

### Trades, mines and canyon works (`role: 'trade' | 'works' | 'farm'`, 17 defs)

Wired to Shumar's `kits/resources` ledger (1,055 iron, 551 saltpeter, 315 halite, 141 copper, 67 gold, 66 tin, 49 silver,
45 sulfur, 0 coal) and `kits/crops` viable plateau/canyon list:

| Key | Census trades / resources carried |
|---|---|
| `sm_blade_smithy` | `smiths and craftsmen`, `industrial workers` — double-forge bloomery & notched-blade smithy (pine charcoal) |
| `sm_saltpeter_works` | `power-house stokers and engineers` (chemical/ordnance equivalent) & `industrial workers` — leaching vats, sulfur-and-saltpeter powder mill (`saltpeter` + `sulfur` nodes) |
| `sm_lacquer_inlay_shop` | `crimson-lacquer`, birch-tar & bronze/gold damascene workshop |
| `sm_stonecutters_yard` | `quarrymen and masons` — basalt & travertine *ablaq* dressing yard, dome-rib templates |
| `sm_mine_head` | `miners` — timbered adit headframe & ore sorting floor (reads `kits/resources` iron/copper/silver/halite nodes) |
| `sm_salt_evaporator` | Brine boiling & rock-halite crushing shed (`halite`, `Ṣōrun-Nārun`) |
| `sm_watermill` | `granary keepers and millers` — stone overshot canyon-chute mill wheel |
| `sm_apricot_orchard` | `orchardmen` — stone-walled canyon terrace of `whorlapricot` trees + roofed apricot-drying & kernel-oil press |
| `sm_terrace_farm` | `farmhands and ploughmen` — dry-stone `dustmillet` / `frostoat` / `frostroot` bench plots + threshing circle |
| `sm_fungus_cellar` | `mushroom growers` — vaulted dark basalt cellar for `alecap` / `pale fungi` |
| `sm_stock_fold` | `dairymen`, `swineherds and duck keepers` (`na` on ducks/swine -> highland sheep/goat dairy & mountain fowl cote), `beetle herders` / pack-beast corral (`elephant bug handlers` equivalent: mountain mule/yak caravan yard) |
| `sm_bakery` | `bakers` — domed basalt flatbread *tannur* & masonry oven house |
| `sm_butcher` | `butchers` — cold-stone carcass hook & wind-drying pastrami/jerky loft (Armenian *basturma* analogue) |
| `sm_weaver_dyer` | `weavers and dyers` — wool kilim loom house & `woad` / `cave-madder` / `larch-bark` stone dye vats |
| `sm_tannery` | `tanners` — canyon-side hide soaking pits & crimson *shagreen* leather loft |
| `sm_brewery_teahouse` | `brewers`, `innkeepers and servers` — millet-beer *boza* brewhouse & domed canyon-tea/coffee house |
| `sm_bazaar_hall` | `market traders`, `shopkeepers and assistants`, `porters and warehousemen` — vaulted stone *qaysariyya* market arcade |

### `SM_TRADES` census check (`tools/trades_census.json`, all 44 rows)

Checked by `tools/check_trades.py`:
- **Carried (37 of 44):** `bakers`, `butchers`, `weavers and dyers`, `brewers`, `tanners`, `innkeepers and grooms`
  (`sm_wikala_caravanserai`), `town guard` (`sm_payaru_tower` / `sm_pishtaq_gate`), `temple priests and servants`
  (`sm_hall_of_blades` regimental keepers), `shrine keepers` (`sm_regiment_qubba` / `sm_sabil_shrine`), `shopkeepers and assistants`,
  `smiths and craftsmen`, `innkeepers and servers`, `porters and warehousemen`, `industrial workers`, `power-house stokers and engineers`
  (`sm_saltpeter_works` furnace stokers), `household service` (`sm_captain_bayt`), `soldiers` (`sm_regiment_barracks`),
  `teachers and scholars` (`sm_kattu_chancery`), `guild officers and clerks` (`sm_bazaar_hall` *muhtasib* chamber),
  `customs officers and clerks` (`sm_wikala_caravanserai`), `healers and nurses` (`sm_bimaristan`), `priests and undertakers`
  (`sm_regiment_qubba`), `river bargemen and quay hands` & `ferrymen` (`sm_gorge_bridge_tower` gorge cable-ferry/bridge hands),
  `market traders`, `farmhands and ploughmen`, `orchardmen`, `miners`, `quarrymen and masons`, `granary keepers and millers`,
  `beetle herders` & `dairymen` & `swineherds and duck keepers` & `elephant bug handlers and station hands` (`sm_stock_fold` /
  `sm_wikala_caravanserai` caravan beasts), `mushroom growers` (`sm_fungus_cellar`), `envoys and embassy staff` (`sm_envoy_house`),
  `monks and lay brothers` (`sm_ordeal_gate` / *Urudīru* masters), `palace and canton staffs` (`sm_diwan_hall` / `sm_citadel_keep`).
- **`na` with documented plateau reason (7 of 44):** `shipwrights and boatbuilders`, `coast guard`, `lighthouse keepers`,
  `dockers and stevedores`, `fishers` (landlocked 3,300 m plateau cut only by boulder-bed whitewater canyons with no sea or
  navigable lake), `chinampa growers` (freezing `-6 °C` dry-summer plateau; canyon stone terraces carry irrigation instead).

---

## 5. Interiors, furniture and the shared culture registration

- **Catalog culture file:** `kits/catalog/krator-master-furniture-shumari.js` (~24 pieces across `poor`, `middle`, `rich`/`civic`):
  - *Poor (`-ko`):* basalt sleeping *suffa* bench with felt pad, iron oil lamp, cadet wooden practice-blade rack, millet jar, dung-fuel basket.
  - *Middle (`-ra`):* crimson-lacquered low table, copper *samovar*/tea brazier, Armenian/Anatolian geometric wool *kilim*, carved cedar/apricot-wood chest, dough trough, loom frame.
  - *Rich / Sword & Regimental (`-šu`):* **household ancestor blade-niche** (crimson lacquer & bronze *mihrab*-*butsudan* holding ancestral scabbards and gold-inlaid `Šumaru-kattu` name-slips), **notched-blade regimental standard rack**, Mamluk hexagonal inlaid brass *kursi* stand, hanging pierced-bronze mosque/mausoleum lamp, Giant-scale (`1.55x`) stone/cushion divan and feasting board alongside human cushions in `-šu` halls, regimental ash-urn cenotaph.
- **Interiors set:** `kits/interiors/sets/shumari.js`, wired into `core/engine` (`91i-interiors.js`, `INTERIOR_SETS = ['shumari']`
  in `build.py`): X opens storey-by-storey cut-aways, U / `?interiors=1` plans and furnishes rooms on `core/furnish` (`KFURN`,
  indexed batches) and registers room walk floors/stairs on `IX.walk`, with `>= 4.2 m` internal arches on `giant: true` plans.
- **Culture symbol & registration discipline (`CLAUDE.md`, "Rebuild what a shared change reaches"):**
  - `core/sockets/38-symbols.js` gets the `'shumari'` emblem (basalt-grey field, crimson caste-bar, burnished gold breath-thorn
    & notched blade).
  - As in `kits/yeti/PLAN.md` §11, editing `core/tags/52-core-tags-vocab.js` (`CULTURE_NAMES`) and `core/catalog` (`CATALOG_CULTURES`)
    reaches every build in the repo (`python3 tools/reach.py core/tags/52-core-tags-vocab.js`). Phases SM1–SM4 build and verify
    cleanly first; SM5 registers `'shumari'` in `core/tags` and `core/sockets` either in one dedicated shared-reach commit
    (rebuilding reached pages + `PORT-BASELINE.json`) or batched with waiting cultures on the owner's call.

---

## 6. Core adoption

Written before code per `CLAUDE.md` ("CORE MODULES ARE NOT OPTIONAL"; checked by `python3 tools/check_core_use.py`):

| Module | Taken | How / Why |
|---|---|---|
| `core/engine` | **yes** | Read in place via `core/engine/engine.py` (`10-core` .. `99-host-take`, `36o-open`, `36s-stair`, `37-wk-rec`, `91f-furnish`, `91i-interiors`, `91n-night`) |
| `core/rand` (`KRAND`) | **yes** | Every building, dome flute, *ablaq* course jitter, cenotaph and prop seeded by `(world, cell, index, salt)`; zero `Math.random` or `Math.sin` hashes |
| `core/tags` (`KTAGS`) | **yes** | Every building, street monument and flora instance registered before geometry is built (`culture: 'shumari'`, `tier`, `caste`, `giant`, `role`, `job`) |
| `core/space` (`KSPACE`) | **yes** | Sheet row, gorge-rim street and flora keep-clear / overlap checks |
| `core/mask` (`KMASK`) | **yes** | Any yard/terrace mask placement uses `KMASK.canvas` (never `getImageData`) |
| `core/door` (`KDOOR`, `KGLASS`) | **yes** | Real swinging/locked leaves (`svLeaf`, Giant `>= 4.2 m` & human `2.2 m`) and translucent window panes (`svPane`, drum lancets & *qamariyya* oculi) |
| `core/walk` + `core/walk/box` | **yes** | `KWALK` + `KWALKBOX` (`37-wk-rec.js`) + `svStair` (`36s-stair.js`) compound Giant/human stairs; F walks every floor and courtyard |
| `core/host` | **yes** | `khost.SHELL + kengine.HOST + kengine.INTERIORS_HOST` with `92k-host-keys.js` (`KHOST.standard`: X cut-away, E door, N night, U interiors, F walk) |
| `core/materials/record` | **yes** | `KMAT` + `materials.json` packed via `tools/textures/pack.py kits/shumari` into `tex/` |
| `core/furnish` (`KFURN`) | **yes** | Indexed furniture batch (`{indexed: true}`) from `kits/catalog` + `kits/interiors/sets/shumari.js` |
| `core/sockets` | **yes** | Banners, *pishtaq* shields, awnings and regimental standards dressed via sockets, never hardcoded into building meshes |
| `core/atmos` + `placeholder` | **yes** | `ATMOS.skylight` on library materials + `core/atmos/placeholder` (`81-sky.js`, read in place) tuned to 1.06 atm crisp highland blue |
| `core/biome` (via `biomes/shighlands`) | **yes** | Station 4 (`--station shumar`) species read in place in `93b-bio-` to dress the sheet's gorge-rim row |
| `kits/resources`, `kits/crops` | **yes** | Read in place for mine/saltpeter node grades and Shumar's viable rainfed/canyon crops & dyes |
| `core/terrain` | no | The kit sheet uses `core/engine`'s flat/stepped row plinths and a gorge-lip podium; real terrain carving lives on `biomes/shighlands` `--station shumar` and the future city page |
| `core/water` | no | No open river on the kit sheet (`sm_sabil_shrine` and courtyard basins hold small architectural water planes); canyon `WATER.flow` lives on `--station shumar` |
| `core/ruins` | no | Shumar has 0 Ancient-ruin cells and the Shumari maintain active citadels; if a ruined *Dōriyan* relic prop is added later, `KRUINS.watch` will guard it |
| `core/city`, `core/simulation`, `core/hamlet` | not here | Belong to the future `settlements/shumar/` city build and plateau hamlet profile, which will consume `SM.def` |

---

## 7. Textures

### Reused from `core/materials/library/` and `patterns/`

- **Masonry & stone:** `stone.basalt.polished` (dark *ablaq* ashlar & plinths), `rock.basalt.polygonal` (*ishigaki* & canyon rim),
  `stone.tuff.hewn` (common basalt/tuff walls), `stone.travertine` & `stone.marble.ashlar` (pale *ablaq* courses & carved drums),
  `rock.limestone.ironstained` (crimson-ochre *ablaq* accent band), `stone.chiselled` (cornices, *shurafat* merlons & steles),
  `stone.stucco.yeseria` (stand-in for carved star-dome relief), `paving.flagstone` & `paving.cobblestone_01` (courts & roofs),
  `tile.bath.lens` (*hammam* pierced glass-lens dome).
- **Timber, metal & cloth:** `wood.lacquer.crimson` (galleries, *mashrabiya* frames, ancestor niches), `wood.cedar.moorish`
  (carved doors & ceilings), `wood.beam`, `wood.tarred`, `metal.bronze.cast` (door straps, *jamur* finials, muster plates),
  `metal.bronze`, `metal.gold` (breath-thorn socket accents), `card.tracery.bronze` (*sabil* grilles), `roof.scale.slate` &
  `roof.thatch.neutral` (upland cots), `patterns/common/jali-diamond`, `patterns/common/frieze-star-maroon`,
  `patterns/common/kilim-star`, `patterns/common/kilim-banded-brown`.

### Queued in `core/materials/PROMPTS-NEEDED.md` (§57)

1. **`stone.dome.mamluk`** — carved highland travertine/tuff dome surface in raised Mamluk geometric 8- and 12-pointed star
   and floral-interlace relief (`refs/01`, `refs/03`; tintable; stand-in: `stone.stucco.yeseria`).
2. **`masonry.ablaq.basalt`** — dressed horizontal *ablaq* ashlar alternating dark blue-black basalt and warm cream highland
   limestone with thin crimson-ochre ironstone stringers (`refs/01`; stand-in: per-course geometry in `stone.basalt.polished` +
   `stone.travertine`, which remains useful for near silhouettes even after the texture lands).
3. **`stone.jali.blade`** — pierced carved stone window screen (*qamariyya* / *jali*, `refs/02`) in angular notched-blade and
   star lattice on magenta cut-out (stand-in: `patterns/common/jali-diamond`).
4. **Deterministic bake (not an AI prompt):** `patterns/shumari/kattu-frieze` — baked directly from the 28 exact SVG glyph
   paths of `Šumaru-kattu` in `lore/tongues-of-krator.html` (lines 5103-5325: dark basalt ground, incised steel-white strokes,
   gold breath-thorns, crimson caste-bars), following Yeti's cut-script lintel rule (`PROMPTS-NEEDED.md` lines 686-691).

---

## 8. Phases and acceptance frames

**Acceptance frames** (`VISUAL-BAR.md` §1, §8 — no apostrophe or colon in view/check names):
- **Ground-level frame:** `Gorge street under the qubba` — standing at human eye height in the gorge-rim street looking past
  a *sabil* bronze grille and crimson-lacquered *mashrabiya* bay up at a `4.4 m` Giant *pishtaq* portal and spiral-fluted dome.
- **Vista frame:** `Domes of the Subaru-su` — low sun raking across the full silhouette of spiral and star-carved Mamluk domes,
  *shurafat* parapets, *pāyaru* polygonal beacon tower and rimrock rope pines against crisp 1.06 atm highland sky.

| Phase | Scope | Done when |
|---|---|---|
| **SM0** | Plans (`biomes/shighlands/PLAN-STATIONS.md` Stations 4-5 + `kits/shumari/PLAN.md`), `refs/01..03`, prompts in `PROMPTS-NEEDED.md` §57 | Owner approves plan & station split |
| **SM1** | **Biome stations H3-H4:** `biomes/shighlands` `--station shumar` (3,308 m `Dsb` gorge, `helixpoplar`, `whorlapricot`, `spiralsage`) and `--station ordeal` (4,426 m `ET` ramp, `thornwhorl`); `kits/crops` `shumar` zone | `python3 tools/build.py biomes/shighlands` + `--station shumar` + `--station ordeal`, `verify.py --assert`, `test-crops.js` pass |
| **SM2** | **Scaffold & Mamluk dome toolkit:** `kits/shumari/` from `tools/new_build/`, `tools/checks_optin.json` entries, `materials.json` + `pack.py`, `40-sm-kit.js` (*ablaq*, battered *ishigaki* plinth, *pishtaq*, *shurafat* parapet, compound Giant/human stair) and `41-sm-dome.js` (pointed spiral-fluted & carved domes, Turkish-triangle/*muqarnas* transition, *qamariyya* oculi, bronze *jamur*); first worked piece `sm_regiment_qubba` end-to-end | `sm_regiment_qubba` (`#spiral` and `#carved`) builds, `verify.py --assert` (`giant-clearance`, `openings`, `walk`) and `check_core_use.py` pass |
| **SM3** | **Dwellings (`50-53`) & the gorge-rim street (`56`):** all 13 dwellings (`-ko`, `-ra`, `-šu` human + `Gēdu-šu` Giant), mass heaters/chimneys, crimson-lacquer galleries, and `sm_gorge_street` ensemble | Both acceptance views framed; walker (`F`) climbs compound stairs and enters unlocked human and Giant doors |
| **SM4** | **Regimental cult (`60`), Mamluk state (`61`), citadel/defence (`62`) & canyon trades/mines (`64-68`):** all 52 defs built, `SM_TRADES` census check green (37 carried, 7 documented `na`), `93b-bio-` flora band reading `--station shumar` in place, deterministic `kattu` frieze bake | Full kit sheet within triangle & draw-call budgets; `verify.py --assert` and `check_port.py` clean |
| **SM5** | **Furniture, interiors & sockets:** `kits/catalog/krator-master-furniture-shumari.js` (ancestor blade-niches, standards, *kilims*, Giant divans), `kits/interiors/sets/shumari.js` (`?interiors=1` & X cut-away), `'shumari'` in `core/sockets/38-symbols.js` and `core/tags/52-core-tags-vocab.js` (with downstream rebuild) | `kits/catalog/verify.py --assert`, `kits/interiors/verify.py --sets --assert --query set=shumari`, and `kits/shumari/verify.py --assert` pass |
| **SM6** | **Delta loop (`VISUAL-BAR.md` §5), Godot export & `test_all.py`:** side-by-side comparison against `refs/01..03`, `DELTA.md`, `PORT.md` & `INDEX.md` complete | `python3 tools/test_all.py --no-build` and `kits/shumari/verify.py --assert` green |
