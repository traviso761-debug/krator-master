# Lizardmen settlements: survey for the economy scope (2026-11-16)

**The names (the owner, 2026-11-17):** *"the cube plateau village will be called iguana; the lizard capital is now renamed to
Basilisk"*. So the capital (pin `slrodrkrls`, still "Sauropolis" on the scale model until its queue renames it) is
**Basilisk**, and the plateau's granary town by the Pile (called Basilisk on 2026-11-16) is **Iguana**. This file uses the new names.

Facts only, gathered read-only from the `openworld-sites-24defd` worktree (branch `claude/openworld-sites-24defd`, HEAD d0dbf39b2).
Coordinates are scale model 5.1 px (2 km a pixel). Numbers from the rasters were computed with the model's own decode
(`tools/scale-model/model/src/20-decode.js`); resource nodes with `tools/scale-model/geology.py`'s own `lode_nodes()` on
`kits/resources/data/geology.json` (the counts match `kits/resources/data/ledger.json`'s catchments to within 1-3 gold nodes).

**Coordinate warning.** `LORE.md` §6.20 (l.824-826) and `biomes/rift/PLAN-STATIONS.md` (l.70-72) give the pins on the OLD
4.23 canvas (Basilisk 493,1266; Komodo 593,1287; Gila 381,1155; Tuatara 546,1224; the Pile 448,1237). Add +272,+330
(`geology.py` LEGACY_SHIFT) to get 5.1. All numbers below are 5.1.

---

## 1. The pins

Source: `tools/scale-model/model/src/60-settlements.js` (`defSetts` l.198, then `SETT_ADDED` l.202-209 and `SETT_MOVED`
l.219-229 applied). None of the four Lizardman pins carries notes or a `polity` field, and none was moved or added after
the default list (all created 2026-09-24). The word "lizard" does not occur in the file at all. Polity comes from the
"Lizardmen" political region (id `rmufwmqdl9qjf`, colour `#5da05c`, 12 points spanning px 565-882 x 1417-1675, same in
`model/src/51-region-store.js`, `openworld/*/source/regions.json`, `geology.json` polities and `world-pins-gemini.json`).

| Name | id | type | px, py | notes | Lizardman? |
|---|---|---|---|---|---|
| **Basilisk** | `slrodrkrls` | city | 765, 1596 | "" | yes: LORE 6.20 l.825 "city ... at the trough's deepest, -2,600 m" |
| **Tuatara** | `szv27b2reu` | village | 818, 1554 | "" | yes: LORE l.826 |
| **Komodo** | `spnqhezhiw` | village | 865, 1617 | "" | yes: LORE l.826 |
| **Gila** | `sze26pgivd` | village | 653, 1485 | "" | yes: LORE l.826 |
| Cube (= **the Pile**) | `slonhq0jgv` | ruined arcology | 720, 1567 | "" | in the polygon; held in its upper levels by the Tungangs' **Loj Nahn** (~1,000 people, LORE l.842-843); the Lizardmen surround it. Pin still named "Cube" (renamed the Pile 2026-11-11, LORE l.156) |
| The Tubes | `sa8xk6pimb` | cavern | 608, 1547 | "" | in the polygon; LORE l.156 calls it a *proposed* Rift-line ruin ("a cavern: a station or a tunnel mouth"), not a Lizardman town. Gemini's model counts it as a Lizardman settlement (pop 500, "Lizardmen geothermal lava-tube cavern network") |

Polity membership elsewhere: `kits/resources/data/ledger.json` puts Cube, Gila, Komodo, Basilisk, The Tubes, Tuatara in
"Lizardmen" (area 140,640 km2). Gemini's files (`populations-gemini.json`, `trade-gemini.json`, `world-pins-gemini.json`) list
5 (all but Cube). `openworld/trade-goods.json` lists the same 5 (`closed: true`).

Populations on record (all *estimated by type*, none from lore):

| Pin | `world-pins-gemini.json` / `trade-goods.json` | `populations-gemini.json` cur / on-screen / sim-urban | Gemini note |
|---|---|---|---|
| Basilisk | 8,000 | 8,000 / 33,400 / 50,100 | "Lizardmen Rift capital + geothermal marsh & subterranean clutch-galleries" |
| The Tubes | 500 | 500 / 2,000 / 3,600 | "Lizardmen geothermal lava-tube cavern network" |
| Gila, Komodo, Tuatara | 300 each | 300 / 2,500 / 2,500 each | "1:1 on-screen village" |
| polity total | 9,400 | nat_total **232,560** (urban 61,200 + rural 171,360, rural ratio 2.8) | rural: "Dispersed Rift geothermal marsh warrens, warm-spring pools & basking camps"; habitable 63,680 km2; maritime "Hostile / Closed (0 Trade)" |

Note: Gemini's model (`world-pins-gemini.json`) has Basilisk at 762,1596 and Komodo at 864,1618 (1-3 px off the model's pins).

---

## 2. Lore

### 2.1 Who they are (LORE.md §6.20, l.811-896; `kits/lizardmen/DESIGN.md`)

| Topic | Fact | Source |
|---|---|---|
| Origin | "No one knows where they came from"; on Krator "just after, or even during, the Cataclysm" | LORE l.816-819 |
| Origin (settled) | The war loosed them in Ancient's Valley; "they came through in the Valley and crossed the Outer Wall to the Rift floor"; remnants stay in the Valley | `biomes/ancientsvalley/PLAN.md` l.223-225 |
| The exchange (author's secret, never told) | When they shifted in, the Ancients were shifted onto the Coil; they "took something from humanity" (a base quality, semi-intuitive knowledge of the world) = what they call **the Lie** | LORE l.849-861 |
| Contact | "**never trade or treat**"; nearly silent; "take no captives: the dead of both sides are butchered like animals" | LORE l.820-823 |
| Captives | "their kin always know where they are, and as slaves they are listless" | LORE l.822-823 |
| Time | "hate being confined in linear time ... **disgusting**"; hostility is its only expression | LORE l.845-848 |
| The Coil | time lived as a spiral; "cause can follow memory"; some know humanity's future as their past | LORE l.864-865 |
| Reliquaries | cyclopean, store "strange constructions" of Ancient relics, otherwise left alone; Monks sense "recursive distortions of spacetime ... growing stronger"; an attempt "to mend the Coil, or to force Krator onto it" | LORE l.829-831, 845-846, 868-869 |
| Remnant | "the villages are modest, the reliquaries of that older scale" | LORE l.870 |
| Reproduction | pathogenic rebirth: offspring genetically identical, keeps memories, may change caste; hospice and nursery one room; kin track their dead | LORE l.871-874 |
| Continuity | "The same mind keeps a building for centuries in successive bodies" | LORE l.875-876 |
| Speech | tonal hissing, partly non-acoustic; higher castes by projected thought | LORE l.877 |
| Rule | "**No warlord**": travellers' tale of a uniting warlord = "the Interpreters acting in concert, as one mind remembering what all the others will do" | LORE l.878-879 |
| Dress | no clothing: jewellery, ornaments, headdresses, equipment, armour | LORE l.880 |
| Emblem | serpent; jade, turquoise | LORE l.1051 |
| Writing | spiral script read inward and outward; five base glyphs (serpent, memory, node, Coil, fracture); turned/wrapped stelae | LORE l.894-896 |

**Castes** (heights 1.25x each; roles *proposed*, DESIGN.md §3, LORE l.881-886):

| # | Caste | Height | Role (proposed) |
|---|---|---|---|
| 1 | Tenders | 1.22 m | nest hall, scribes and carvers, lacquer |
| 2 | Makers | 1.53 m | bronze, reed and bone |
| 3 | Drovers | 1.92 m | farms, herds, hauling |
| 4 | Line warriors | 2.41 m | |
| 5 | Interpreters | 3.03 m | seers and strategists, spiral pupils, the highest caste |
| 6 | Bulwarks | 3.80 m | shock troops and heavy labour |

"Caste is set at rebirth and can change between incarnations; the highest caste is deliberately not the largest: rank is a phase
you pass through" (LORE l.884-886).

### 2.2 How they live, eat and make (DESIGN.md §4-6; `kits/lizardmen/src/59-lz-trades.js`)

- **No shops, no coin, no markets**: "Combined crafting and storage halls mix related trades" (DESIGN.md l.202). LZ_TRADES:
  `guild officers and clerks: na 'no guilds or coin; the castes allot work'` (59-lz-trades.js l.31); `market traders: na 'no
  markets: they never trade'` (l.39); `household service: na 'a reborn caste order, dwellings are communal'` (l.28).
- **Craft halls**: bronze and stone (casting, stonecutting, armourer's corner), reed/weaving/lacquer (mats, screens,
  baskets, lacquerware; no garments), bone (butchery, tanning, carving), pottery and yam stores (DESIGN.md l.203-207).
- **Materials**: bronze only, never iron or steel (DESIGN.md l.125; LORE l.890); reed, cane, mats, fibre-tempered mud,
  black and oxblood lacquer; hide roofs from the bone hall (some human); baked brick, polygonal masonry, monolithic stone;
  bone from "hexapod ribs and vertebrae, and human and Lizardman bone" (DESIGN.md l.114-124).
- **Food**: windmill (panemone), granary (Mohenjo-daro podium), farms of "carrot frill greens, trumpet pods, Rift Yam and
  edible Rift flora" (DESIGN.md l.212-213); livestock "native hexapods and frilled lizards" (l.214-215).
- **Beasts** (`src/56-sa-beasts.js` l.22-23): `frilled-lizard` = "the Lizardmen's livestock: kept in pens by the farms, eaten
  whole"; `burden-beast` = "the draught hexapod of the Drovers: it hauls the sledges and the plough". No riding mounts on record.
- **Plunder**: "The warehouse: plunder from the Vale kept but unused (steel blades they cannot make or mend, tools,
  valuables), sorted by an order only they understand" (DESIGN.md l.225-226).
- **Bodies as matter**: "To a people who are reborn, a body is material" (DESIGN.md l.257).
- **Trade gaps the kit lists** (`KNOWN_ISSUES.md`, "Voth census trades"): no bake house, no brewery (spore or yam drink),
  no fishing weir, no orchard, **no mine head ("ore for the bronze hall")**, no quarry. LZ_TRADES records 17 carried, 1 partly,
  5 gaps, 21 na.
- **No customs of exchange are written anywhere.** The only lore on movement of goods is the plunder warehouse, the bone
  hall's stock feeding buildings, and the craft halls storing their own goods. Gemini's model labels the regime
  `internal_autarky_hostile`: "Trades strictly internally among Basilisk, Komodo, Gila, and Tuatara" (`trade-gemini.json`,
  polities.Lizardmen) - Gemini's assumption, not lore.
- *Proposed* (not lore): oxblood lacquer's red from the terminal sea's battery-strand ochre; Makers cut vitriols; Tenders
  tend the oldest reefs (`biomes/galvanic/PLAN.md` l.329-343, open question 5 l.445).

### 2.3 Wars and relations

| With | Fact | Source |
|---|---|---|
| Xanadu | Rishtowar VII's expedition ~400 years ago destroyed after breaching a reliquary; eastern Rift floor not retaken for 200 years; "Today Xanadu's vigilance is waning, and raids reach as far as the Vale, for livestock, tools and valuables" | LORE l.832-839 |
| Xanadu | "seem to have new leadership, and their raids grow increasingly bold"; Sultanate short of iron | LORE l.508 |
| Xanadu, the Marches | Province P8 Mārchiz, 5,000 rural, seat Erehwon; forts: west watch fort 783,1530; south watch fort 812,1548; beacon fort over the Rift 846,1540 | `core/region/data/xan-tune.js` l.54, l.211-212 |
| Xanadu, the Marches | "No goods. It is fed and paid; Lizardman raids are its events"; "Lizardman raids as events on the Marches' forts and the Vale's southern villages: stock taken, a village's harvest cut" | `core/simulation/PROPOSAL-XANADU.md` l.115, l.398/404 |
| Golden Tears (Xanadu merchant house, *proposed* by the owner 2026-11-16) | "running expeditions into Lizard country to seek out unclaimed gold lodes"; armed camp of 120, cool months, a field of short lodes on the Rift floor; camp `exp.rift-gold` at px **850,1628** (approximate), 110 km from base, 70 kg gold/yr, 30 years | `xan-tune.js` l.123-131; PROPOSAL-XANADU l.382 |
| Politics sim | "Militarized fronts: ... Xanadu and the Lizardmen in the eastern rift"; a front "always live" | `core/simulation/PLAN-POLITICS.md` l.13, l.71 |
| Tungangs/Fellgangs | Tunnel wars wiped out Tungangs east of Chimes; Loj Nahn holds out in the Pile's upper levels, Lizardmen "attack its night parties but have never pressed it further"; "the only thing worse than a Labber is a Lizard" | LORE l.840-844 |
| Iziz | Only as Rishtowar's "shielded Izani auxiliaries" and "ex-Izani legionaries" | LORE l.832, l.837 |
| History Monks | "contradictory accounts" of origin; sages sense the reliquaries' distortions | LORE l.818, l.830-831, l.1079 |
| Trade map | "no route across the Lizardmen's floor"; "because of the lizardmen there is barely any trade between the eastern and western rift" | `openworld/TRADE-SCOPE.md` l.19, l.358 |
| Trade map | "The Lizardmen 'never trade or treat': their balance is shown, but they are left out of every route and share" | `openworld/TRADE-GOODS.md` l.22 |
| Camps | Lizardmen are "sedentary raiders"; tents `lc-hide`, `lc-shield`, `lc-seer`, `lc-sail` for "War camps only (a raid from the Rift)" | `core/camp/PLAN.md` l.43, l.160 |
| Rift rim | "too high for the Lizardmen to venture comfortably" | `biomes/riftrim/PLAN.md` l.9; LORE l.827 |

### 2.4 The building kit (`kits/lizardmen`, README.md table l.24-34; keys from `src/*.js`)

Dwellings are **by caste, communal**, not poor-to-rich. Village (bone, reed, hide) and capital (`lk-`, all stone: "the same
forms as the village, built all in stone for the capital", `src/62-lk-capital.js` l.2-7).

| Group | Village keys | Capital keys (stone) | Caste doors |
|---|---|---|---|
| Dwellings | `lz-warren` (Tenders' cell-warren), `lz-makers` (carapace hut), `lz-longhouse` (Drovers' rib house, 11 bays), `lz-lodge` (warriors' tusk vault, castes 4+6), `lz-tower` (Interpreters' twisted tower) | `lk-warren` (stone cell-warren), `lk-longhouse` (stone rib house), `lk-college` (Interpreters' college, three towers) | 1, 2, 3, 4+6, 5 |
| Nest hall | `lz-nest` (Fermat spiral: hosts on basking slabs, seven clutch cradles) | `lk-nest` (stone nest hall, 52x48 m) | all |
| Trades and food | `lz-hall-bronze`, `lz-hall-reed`, `lz-hall-bone`, `lz-granary`, `lz-windmill`, `lz-farm` (placeholder crops, frilled-lizard pen, burden beast at the plough) | - | all/3/2 |
| Military | `lz-barracks`, `lz-muster`, `lz-lookout` | `lk-greathall` ("Warlord's great hall"), `lk-gate`, `lk-wall`, `lk-watchtower` | all, 4 |
| Camp (raids) | `lc-hide`, `lc-shield`, `lc-seer`, `lc-sail` | | 4, 6, 5, all |
| Specialists, stores | `lz-seer` (model of the village), `lz-medicine`, `lz-warehouse` (plunder) | | 5, 1, all |
| Monuments | `lz-stela-pair`, `lz-stela-turned`, `lz-obelisk`, `lz-circle`, `lz-ley` ("the one straight thing", aimed at the reliquary), `lz-bells` (no clappers) | | all |
| Reliquary | `lz-reliquary` (isolated, older scale, antechamber, shut inner door) | | all |
| Beasts | `frilled`, `burden` (from `kits/fauna`) | | |

The kit is a sheet, "not a settlement: no spiral village layout (that needs a street generator on `core/city`, agreed with that
workstream first)" (`KNOWN_ISSUES.md`, Scope). `lk-greathall` is still called the "warlord's" hall though LORE l.878 says there
is no warlord.

---

## 3. The ground at each pin

From `tools/scale-model/model/data` (h, wl, tm/tw/tc/th/tl, p, c, z), 2 km a pixel. Pressure is the model's hover formula
`1.6 x exp(-m/8000)` (`model/src/33-hover.js` l.36-37). Slope: central difference over 4 km. **-2,600 m is the raster's floor
value `lo`**: the real floor may be lower (galvanic's vent is -2,700 m by its own record).

| Pin | Elev | atm | Mean (warm/cold month; extremes) | Rain | Climate | Zone | Slope | Region polygons |
|---|---|---|---|---|---|---|---|---|
| Basilisk | **-2,600 (a water cell: on the sea)** | 2.21 | 36 (40/32; 44/27) | 2,086 | XA hypertropic jungle | basin | 0 | The Rift, Lizardmen, `rift` (biome) |
| Tuatara | -1,704 | 1.98 | 29 (35/24; 40/18) | 1,020 | XV abyssal savanna | salt basin | 2.7% (1.5 deg) | same |
| Komodo | -2,452 | 2.17 | 35 (39/31; 43/26) | **4,000 (model ceiling)** | XA | basin | 5.7% (3.3 deg) | same |
| Gila | -1,614 | 1.96 | 29 (35/24; 40/18) | 1,051 | XV | salt basin | 6.1% (3.5 deg) | same |
| Cube / the Pile | -224 | 1.65 | 22 (29/16; 35/9) | 1,757 | Cfa humid subtropical | basin | 1.2% | same |
| The Tubes | -77 | 1.62 | 21 (27/15; 33/9) | 925 | Csa hot-summer Med. | highland | 4.8% | same |

| Pin | 5 km hi/lo | 15 km hi / lo | 30 km hi / lo | Classes within 15 km | within 30 km | Mean rain 30 km |
|---|---|---|---|---|---|---|
| Basilisk | -2,599 / -2,600 | -2,511 / -2,600 | -1,527 / -2,600 | XA 100% | XA 100% | 2,675 |
| Tuatara | -1,608 / -1,846 | -1,106 / -2,194 | -302 / -2,322 | XV 98, Aw 2 | XV 73, XA 10, Aw 6, XS 4, Cfa 3, Csa 2, Af 1, Am 1 | 935 |
| Komodo | -2,157 / -2,600 | -1,729 / -2,600 | **+1,188** / -2,600 | XA 100 | XA 66, Cfa 17, Af 14, Cfb 2 | 3,359 |
| Gila | -1,385 / -1,810 | -1,357 / -2,231 | -166 / -2,542 | XV 69, XA 31 | XA 46, XV 42, Af 6, Cfa 4 | 1,405 |
| Cube | -175 / -295 | -146 / -414 | -63 / -888 | Cfa 99 | Cfa 76, Csa 18, Af 6 | 1,695 |
| The Tubes | -21 / -587 | 29 / -2,127 | 334 / -2,600 | Aw 45, Csa 29, XV 26 | XV 53, Aw 26, Csa 14, XA 6 | 1,002 |

**Water bodies** (connected water cells of h.png; level from wl.png; class from c.png):

| Body | Extent | Level | Class | Pins on it |
|---|---|---|---|---|
| **Eastern terminal sea** ("the Lizardman Rift Sea", `river-names-5.1.md` l.120) | 2,318 cells = **9,272 km2**, px 758-873 x 1579-1616 | -2,600 (floor value) | WX abyssal salt lake 83%, XA 16% | **Basilisk** (its western end, in the water), **Komodo** (2 km, eastern end); Tuatara 54 km (nearest water at 815,1581) |
| Western terminal sea | 7,368 cells = **29,472 km2**, px 508-699 x 1431-1580 | -2,600 | WX 88% | Cube 42 km (699,1567), The Tubes 15.6 km (614,1542) |
| **Gila's lake** (basins.json: "salt lake", at 648.5,1483.7, 3,401 km2, spill -1,587 m, XA) | component 576 cells = 2,304 km2, px 636-677 x 1479-1512 | -1,723 | XV/XA | **Gila** (2 km) |

Other lakes within 100 km (`model/data/basins.json`): Gila: salt lake 644.5,1475.6 (-1,752 m, 64 km2, 25 km), through
lakes at 628.5,1461.6 (-1,615 m, 433 km2, 68 km), 614.4,1453.6 (-1,591 m, 578 km2, 100 km), 670.5,1457.6 (+2,383 m, 401 km2, 65 km).
Cube: through lake 728.6,1529.7 (-1,304 m, 160 km2, 77 km), salt lakes 712.6,1523.7 (-1,080 m, 88 km), 692.5,1525.7 (-1,706 m, 99 km).
The Tubes: through lake 574.4,1581.8 (+2,735 m, 850 km2, 97 km). Basilisk, Tuatara, Komodo: none in basins.json (their sea
is the floor, not a basin record).

**Rivers within 40 km** (`model/data/rivers.json`, distance to nearest polyline vertex; Q at mouth):

| Pin | Rivers |
|---|---|
| Basilisk | Tlahn Gill (r762, wadi, 7.6 m3/s, 22 km, lists Basilisk) 8 km; Blek Beck (r249, perennial, 15.3 m3/s, 40 km) 14 km; Stuan Warra (r207, 22.3 m3/s, 102 km) 34 km; all to the -2,600 m sea |
| Tuatara | Neet Gill (r754, wadi, 0.7 m3/s, 17 km, lists Tuatara, ends in a -2,255 m basin) 10 km. Nothing perennial within 40 km |
| Komodo | Kruk Warra (r088, "Lizardmen river 4", 51.3 m3/s, 40 km, lists Komodo) 12 km; Leet Beck (r145, 32.6 m3/s) 17 km; Tyan Gill (wadi, 7.6) 25 km; **Nahr ash-Shalālāt** (Erehwon's lake outflow, **1,180 m3/s**, 134 km, -1,670 to -2,600 m: "descending a series of low cataracts from the Lower Xanadu Lake to the Lizardman Rift Sea") 38 km |
| Gila | Brant Beck (r215, 20.2 m3/s, into Gila's lake) 23 km; Muckle Tkyoob Beck (r866, "Lizardmen river 5", 51.8 m3/s, into the -1,752 m lake) 31 km |
| Cube | Muckle Weyt Beck (r202, 22.0 m3/s, to the -2,600 m sea) 19 km |
| The Tubes | Tkyoob Warra (r052, "Lizardmen river", 98.5 m3/s, 117 km) 19 km; Kopa Warra (r369, 33.7 m3/s, tributary) 34 km |

River names are Tungang (`tools/scale-model/river-names-5.1.md` l.226-1030: the "Lizardmen river 1-5", "stream 1-11" and "wadi
1-16" are Tungang-named, e.g. Tkyoob = Cube).

**Biome**: every pin is in the `rift` biome polygon (`biomes/rift`). Its floor "is two biomes on the model's own classes: XA
(abyssal jungle, 38,800 km2 ...) and XV (abyssal savannah, 45,300 km2 ...)"; "Between them the floor lies 3-5.5 km lower at
1.9-2.3 atm and +28-36 C" (`biomes/rift/PLAN-STATIONS.md` l.60-68). The Pile's plateau: "a table of 3,600-5,000 km2 standing
1.2-2.3 km over the jungle floor", a dry relict gypsum maze where the lost loj lies (`biomes/KARST-SITES-5.1.md` §3). The
eastern sea's strand (vent at 801,1573, 51 km SW of Tuatara): `biomes/galvanic` "battery strand", acid, poisoned water, "6,544 km2
of land stands within 10 m of the sea's level" (`biomes/galvanic/PLAN.md` l.236-257, 325-331).

---

## 4. Resources

### 4.1 Mineral nodes (geology.json node field; grades: high = yield 2, medium 1, low 0.5)

Format: total (high/medium/low), nearest km. Families with no node are omitted (no **coal** or **nickel** at any pin: the
polity's ledger imports are coal and nickel).

**Within 30 km**

| Family | Basilisk | Tuatara | Komodo | Gila | Cube | The Tubes |
|---|---|---|---|---|---|---|
| iron | 59 (10/20/29) 5.1 | 92 (18/37/37) 3.7 | 46 (9/17/20) 3.7 | 33 (3/11/19) 2.5 | 74 (8/31/35) 3.2 | 79 (10/38/31) 3.2 |
| copper | 56 (9/23/24) 2.1 | **102** (16/59/27) 2.5 | 62 (9/28/25) 5.0 | 32 (8/9/15) 3.4 | 96 (16/40/40) 1.4 | 87 (14/41/32) 3.4 |
| gold | 29 (4/15/10) 6.7 | 46 (8/17/21) 3.5 | 26 (5/9/12) 5.7 | 17 (3/5/9) 2.7 | 41 (6/16/19) 1.4 | 36 (4/18/14) 1.8 |
| tin | 20 (1/6/13) 8.2 | 40 (7/14/19) 5.9 | 30 (3/7/20) 6.4 | 22 (4/8/10) 4.9 | 34 (4/13/17) 6.7 | 29 (4/11/14) 2.2 |
| silver | 18 (1/10/7) 9.8 | 40 (5/18/17) 1.5 | 24 (3/4/17) 6.9 | 8 (2/0/6) 8.7 | 38 (3/18/17) 5.0 | 38 (4/12/22) 2.8 |
| rare earths | 43 (8/24/11) 3.4 | 56 (12/27/17) 3.7 | 37 (5/18/14) 10.3 | 25 (4/12/9) 3.3 | 58 (15/32/11) 2.3 | 41 (8/22/11) 2.2 |
| sulfur | 2 (0/2/0) 24.0 | **99** (15/47/37) 2.4 | 1 (low) 29.5 | - | 7 (0/5/2) 20.3 | 84 (16/41/27) 6.5 |
| oil | 22 (6/5/11) 3.6 | 33 (5/13/15) 0.7 | 34 (6/13/15) 5.2 | 14 (2/4/8) 10.5 | 60 (15/18/27) 3.8 | 37 (6/20/11) 5.2 |
| marble | - | 16 (2/8/6) 8.3 | - | - | - | 9 (1/5/3) 1.0 |
| saltpeter | - | - | - | 2 (0/1/1) 20.6 | - | - |
| gypsum | - | - | - | 10 (1/5/4) 12.1 | - | - |
| halite (rock salt) | - | - | - | 6 (2/2/2) 18.2 | - | - |
| potash | - | - | - | 9 (3/4/2) 14.8 | - | - |
| alkali (soda) | - | - | - | 5 (0/3/2) 13.0 | - | - |

**Within 15 km**: Basilisk iron 12, copper 15, gold 5, tin 4, silver 5, REE 6, oil 6; Tuatara iron 26, copper 32, gold 10,
tin 10, silver 12, REE 17, sulfur 11, oil 11, marble 5; Komodo iron 13, copper 15, gold 7, tin 6, silver 6, REE 9, oil 9; Gila
iron 11, copper 8, gold 4, tin 3, silver 1, REE 4, oil 3, gypsum 1, potash 1, alkali 1; Cube iron 18, copper 27, gold 13, tin
10, silver 12, REE 13, oil 18; The Tubes iron 25, copper 21, gold 8, tin 9, silver 8, REE 12, sulfur 13, oil 8, marble 8.

Layer bytes (prospectivity 0-255) max within 30 km: the rift floor gives iron 70, copper 120, gold 90, tin 50, silver 80,
REE 190, oil 110 everywhere; Tuatara and The Tubes also reach the volcanic province (iron 210, copper 240, gold 140, silver
150, sulfur 255, tuff 189, skarn 200, marble 63). Gila's evaporites: gypsum 215, halite 205, potash 140, alkali 129, saltpeter 40,
limestone 134. Province at the pin: rift (Tuatara, Gila, Cube, Tubes); water (Basilisk, Komodo). Cube is on Ancient-ruin
ground (bit 128). Within 30 km: Basilisk rift 58 / water 42; Tuatara rift 84 / volcanic 16; Komodo rift 69 / water 31;
Gila water 53 / rift 38 / evaporite 8; Cube rift 100; Tubes rift 72 / volcanic 15 / water 13.

**Placers within 30 km** (river-carried gold and tin): Basilisk gold medium 13.5 km, high 15.9, high 20.7; tin medium 13.5,
low 15.9, high 20.7. Tuatara gold high + tin medium 13.4 km. Komodo gold high/med/med/med at 11.9/16.5/24.6/27.1 km, tin
med/med/high/med same places. The Tubes gold high + tin medium 25.9 km. Gila and Cube: none.

**Basics** (ledger.json, 30 km = `dayKm`): stone, wood, water true at all six; **salt false at Basilisk, Tuatara, Komodo,
Cube, The Tubes; true only at Gila** (audit failures "Lizardmen: Cube/Komodo/Basilisk/The Tubes/Tuatara lacks salt within 30
km"). But `openworld/RESOURCES-SETTLEMENTS.md` scores salt by the salt lake too: **Basilisk 284 ("salt lake 1136 km2", second
best on the map, l.110)**, Komodo 29, others 0; nearest good rock salt: Gila 14 km (646,1484), Tuatara 102 km (869,1559), The
Tubes 144 km (639,1482) (l.338-346). `trade-goods.json` gives Basilisk salt supply 1,140 and Komodo 60. The two sources
disagree because the geology's evaporite basins do not include the -2,600 m terminal seas.

**Iron grade**: "Only low-grade iron" list includes Gila (max 70) and Komodo (RESOURCES-SETTLEMENTS l.372); "nearest good iron
(100+)": Basilisk 36 km (748,1590) (l.374).

**Polity totals** (ledger.json): nodes iron 4,389, copper 5,067, gold 2,300, tin 1,565, silver 2,071, REE 2,336, sulfur 2,804,
saltpeter 570, oil 1,520, marble 304, gypsum 28, halite 24, potash 24, alkali 7, coal 0, nickel 0. Imports: coal, nickel.
"Exports" (surplus): copper, gold, tin, silver, rare-earth, sulfur, oil, alkali, marble.

**Authored lodes** (`kits/resources/data/lodes.json`): one only, `lode:xanadu-gold` at 911,1665 (peak 225, r 16 km): 133 km
from Komodo, none in Lizard country. The Golden Tears' "unclaimed gold lodes" have no record beyond the approximate camp
at 850,1628 (37 km from Komodo).

### 4.2 Farmland and crops

`RESOURCES-SETTLEMENTS.md` §3 (farm = farm-eq km2 / km2 over .5; timber, fish, salt, water scores):

| Pin | Climate | Farm | Staples / high-value | Timber | Fish | Salt | Water |
|---|---|---|---|---|---|---|---|
| Basilisk (reach 30) | XA 36 2086 mm 2.21 atm | 186 / 4 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Cacao, Clove | 1135 | 277 | 284 | 129 |
| Tuatara (10) | XV 29 1019 mm 1.98 | 240 / 280 | same as Basilisk + Flametip tanbark, Ghost-gum leaf | 165 | 0 | 0 | 59 |
| Komodo (10) | XA 35 4000 mm 2.17 | 26 / 16 | Bamboo rice / - | 179 | 17 | 29 | 86 |
| Gila (10) | XV 29 1050 mm 1.96 | 52 / 48 | Ashmillet, Bambara groundnut, Sandpan fonio / Tamarisk manna, Cacao, Clove | 94 | 168 | 0 | 70 |
| Cube (10) | Cfa 22 1756 mm 1.65 | 319 / 324 | Ashroot, Bamboo rice, Banana / Cacao, Clove, Coffee | 304 | 0 | 0 | 67 |
| The Tubes (10) | Csa 21 925 mm 1.62 | 30 / 32 | Ashmillet, Ashroot, Bambara groundnut / Flametip tanbark, Ghost-gum leaf, Ironbark bark | 136 | 0 | 0 | 55 |

"Basilisk has 186 farm-eq km2 with 4 km2 over .5 (hot XA)" (RESOURCES-SETTLEMENTS l.422).

`kits/crops` run in node (`CROPS.at`, the kit's own code). Axis choice is mine: warmth `tropic` (the rift biome's jungle zone
uses tropic; `hot` is "hot desert, geothermal ground", PLAN.md l.39-40), atm `dense` (1.3-2.0; the pins are 1.96-2.21, above
the band's top), aridity from rain.

| Point | Fits (all `rain`) |
|---|---|
| Basilisk / Komodo shore (tropic, dense, wet) | 24: rice, taro, shade-manioc, ashroot, breadfruit, banana, plantain, mahogany-nut, fern-egg, coconut, wineweed (alga), fan-palm-heart, fiddlehead, guava, ironplum, stinkbell, scalefruit, stack-fig, clove, coffee, cacao, kava, hyperbamboo, bamboo-rice |
| same, salt shore (`salt:true`) | adds wild-rice, kelp, sea-lettuce, sea-grapes, tidewort, brine-apple (30) |
| Tuatara / Gila (tropic, dense, subhumid) | 54, incl. rice, ashmillet, sandpan-fonio, bambara, taro, sweet-potato, manioc, ashroot, stub-cone, breadfruit, banana, plantain, ballmelon, **frillpod**, pomegranate, lantern-fruit, bell-date, wadi-date, mesquite, carob, sugar-cane, coffee, cacao, kava, tobacco, tamarisk-manna, myrrh |
| Cube plateau (subtropic, dense, humid) | 21: rice, helix-bean, sweet-potato, ashroot, acorn, wingnut, avocado, wineweed, fiddlehead, greens, persimmon, citron, ironplum, tamarillo, lantern-fruit, serviceberry, herbs, coffee, tea, tobacco, measuremelon |
| dark beds (works) | pale-fungi, alecap |
| `CROPS.forBiome('rift')` | 83 (biome declared `atm: 1, atmNote: '?'`, i.e. standard, which the floor is not) |

Rift-home crops (`home: ['rift']`): lakecake (alga, skimmed from the lake), ballmelon, **frillpod** (the kit's "carrot frill
greens / trumpet pods" are this and the carrotfrill), pomegranate, lantern-fruit, bell-date. **No "Rift yam" record exists** in
`kits/crops` (DESIGN.md names it; KNOWN_ISSUES calls the farm's crops placeholders).

### 4.3 Harvestable flora (biomes/rift `src/50-biome-rift-species.js` `RIFT.HARVEST`, l.208-253)

| Use | Species |
|---|---|
| Timber | pagoda (straight tiered timber, bark rope), araucaria, pine (timber, fuel, pitch), parasol, violetdome, cloudparasol, stonepine, lanterntree (light) |
| Fuel | lobetree, acacia (and thorn fences), groundsel, cloudlobe, beardtree, silverscrub |
| Fibre, thatch, cord | bellpalm, cloudbell (fibre, thatch), baobab (cord, bark stripped live), pagoda bark (rope) |
| Pipes | trumpet ("ribbed stems are cut for water pipes and flutes") |
| Food | bell dates (bellpalm, cloudbell), baobab pulp and leaves, araucaria seeds, acacia pods (famine) and gum, cycad starch (famine, leached), frillpods (carrotfrill), fiddleheads (cloudfern), lantern fruit, pine nuts (stonepine), bladepear pads, ballmelons (ballvine) |
| Medicine | curly (burns), dragon (red resin: dye, varnish, dressing), aloetree, acacia gum, pine pitch, beardtree moss, silverscrub tea, thornwhip salve, baobab |
| Dye | purplefan (purple), dragon resin (red) |

Fauna: the rift biome defers fauna (`biomes/rift/NOTES.md` l.67 "Fauna deferred"); the Lizardmen's beasts are `kits/fauna`'s
`frilled-lizard` and `burden-beast` only.

---

## 5. Neighbours and links

**Between Lizardman pins (km, straight line)**

| | Basilisk | Tuatara | Komodo | Gila | Cube | The Tubes |
|---|---|---|---|---|---|---|
| Basilisk | - | 135 | 204 | 315 | 107 | 329 |
| Tuatara | 135 | - | 157 | 358 | 198 | 420 |
| Komodo | 204 | 157 | - | 499 | 307 | 533 |
| Gila | 315 | 358 | 499 | - | 212 | 153 |
| Cube | 107 | 198 | 307 | 212 | - | 228 |
| The Tubes | 329 | 420 | 533 | 153 | 228 | - |

Two clusters: east (Basilisk, Tuatara, Komodo, round the 9,272 km2 eastern sea) and west (Gila, The Tubes, round the
29,472 km2 western sea and Gila's lake), the Pile's plateau between (107 km from Basilisk, 212 from Gila).

**Nearest non-Lizardman places** (km)

| Pin | Nearest |
|---|---|
| Basilisk | South watch fort 134, West watch fort 137, Erehwon 179, Golden Tears camp 182, Beacon fort 197, Thalaba 259, Strongwall 307, Theodiga 311, Qiblai 314 |
| Tuatara | **South watch fort 17**, Beacon fort 63, **Erehwon 80**, West watch fort 85, Thalaba 147, Golden Tears camp 161, Theodiga 184, Qiblai 224, Strongwall 255 |
| Komodo | **Golden Tears camp 37**, Strongwall 105, Qiblai 122, Xanadu gold mines (911,1665) 133, Beacon fort 159, South watch fort 174, Theodiga 185, Erehwon 235 |
| Gila | Cthonos (ruin) 257, West watch fort 275, Erehwon 310, South watch fort 342, Thalaba 344, Pluton 362, Chimes 414, Tallwalls 434 |
| Cube | Loj Nahn inside it; West watch fort 146, South watch fort 188, Erehwon 198, Beacon fort 258 |
| The Tubes | Cthonos 186, West watch fort 352, Fellgang gold camp (438,1448) 393, Erehwon 399, Wildcat 408 |

**Roads and routes**: `openworld/roads-supplement-gemini.json`, `ancient-roads-draft.json`, `gods-road.json` and
`trade-fleets-gemini.json` have **no route within 40 km of any Lizardman pin**. Only `openworld/net51-gemini.json`'s Rift line
(the Ancients' line, a proposal): `rift.cthonos-tubes` (224 km, all tunnel) ends at The Tubes; `rift.tubes-pile` (292 km, all
tunnel) The Tubes to the Pile; `rift.pile-theodiga` (424 km, 106 in tunnel) passes 24 km from Tuatara. "The Rift line through the
Lizardmen's country (Chimes to the Pile) is underground" (`openworld/ANCIENT-NETWORK.md` l.642). Trade model rule: "no route
across the Lizardmen's floor" (TRADE-SCOPE l.358). Gemini's routes skirt the country with a "Lizardman Raid Hazard" tag
(TRADE-GEMINI.md l.283 on).

**Water links**: no river joins two Lizardman pins. Basilisk and Komodo share the eastern terminal sea (both ends of the
9,272 km2 water, 204 km apart by straight line); Tuatara drains by a wadi to a closed -2,255 m basin, 54 km from that sea.
Gila's and The Tubes' rivers run to the western sea / Gila's lake. Erehwon's outflow (Nahr ash-Shalālāt, 1,180 m3/s) ends in the
eastern sea 38 km from Komodo.

---

## 6. Not found

- No Lizardman pin has notes, polity or population in the scale model; no lore population for any of them.
- No written custom of exchange, tribute or redistribution among Lizardman villages; no lore on which village makes what.
- No Rift yam crop record; no Rift fauna kit (fauna deferred); no riding beasts for the Lizardmen.
- No roads among the Lizardman pins; no salt-works or evaporite basin record for the two -2,600 m terminal seas in geology.json.
- No pin or lore for the reliquaries' locations, the spiral village Rishtowar found, or Lizardman villages beyond the four.
