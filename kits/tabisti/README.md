# Urban Tabisti Architectural Kit (`kits/tabisti`)

Standalone `core/engine` building kit (`culture: 'eastabyss'`, `style: 'urban'`, **zero salvage**) for the walled northern East Abyss salt-lake bench city-states — **Sfenops** (`1282, 663`), **Middle Tabisti** (`1311, 761`), and **Liikofi** (`1316, 797`) — plus urban treaty/merchant wards in **Mungo** (`1322, 828`) and **Lower Verge**.

In multi-kit settlements (`KRATOR_KITS`), walled bench cores zone to `kits/tabisti` (`style: 'urban'`) while lakeside and marsh salvage skirts zone to `kits/eastern-abyssal`.

## Reference Plates (`refs/`) & Acceptance Frames (`VISUAL-BAR.md`)

- **Reference Plates:**
  - `refs/b1-lechner-zsolnay-roof.png` — Steep monsoon-shedding Zsolnay turquoise/cobalt glazed roofs, verdigris globe finials, cream stucco & rose-brick pilasters.
  - `refs/b2-raichle-recessed-loggia.png` — Double-height recessed breeze-loggia arch, curvilinear terracotta trim, *trencadís* spandrels & verdigris bay-oriels.
  - `refs/b3-modernisme-escata-spire.png` — Open-arched ashlar belvedere lantern crowned by a concave octagonal saffron/rose *escata* fish-scale spire.
  - `refs/b4-gaudi-trencadis-lantern.png` — Octagonal *trencadís* mosaic drum, cantilevered stepped-brick zigzag corbels & mosaic dome.
  - `refs/b5-el-capricho-wind-tower.png` — Banded buff/rose brick with teal relief-tile courses, 4-column corner portico & cylindrical solar wind-chimney tower, paired with Samarkand *kashi* portals, Bukhara *ustun* verandas, `Liikofi` `abyss-lac` *kundal* coffered ceilings, sheltered *ganch* panels, and imbricated verdigris-gilt bronze columns.
- **Two Acceptance Frames (`verify.py --views`):**
  1. **Close Landmark Frame:** `Grand Urban Temple of the Salt-Crystal Altar` (and `Tafalast di Ahedman Urban Ruler Palace`, `El Capricho Banded-Brick and Wind-Tower Villa`).
  2. **Skyline Vista Frame:** `Salt-Crystal Altar Temple and Tafalast Civic Row` (and `Urban Tabisti Dwellings Row`).

## Architectural & Bioclimatic Rules (`1.90 atm` Humid Cooling)

1. **Permeable Ground Floors & Vented Plinths (`tbPorticoPlinth`):** Raised flood plinths pierced by terracotta/iron undercroft grilles, open 4-column corner porticos, souq arcades, and deep recessed loggias.
2. **Solar-Glazed Stack Chimneys & Open *Mirador* Lanterns (`tbWindTower`, `tbTrencadisLantern`, `tbEscataSpire`):** Dark glazed shafts & octagonal drums driving dense-air (`~2.2 kg/m³`) thermal updrafts.
3. **Deep *Ustun* *Ayvans* & `abyss-lac` *Kundal* Coffered Ceilings (`tbUstunAyvan`, `tbKundalCeiling`):** High-ceilinged thermal stratification plenums varnished in moisture-proof crimson-gold lacquer.
4. **Breathing Walls (`tbClaustraScreen`, `tbVerdigrisOriel`):** Perforated honeycomb brick breeze-walls and louvered verdigris-bronze bay-oriels.
5. **Monsoon-Armored Roofs vs. Sheltered *Ganch* (`tbZsolnayRoof`, `tbGanchPanel`):** Wide-eaved glazed roofs with bronze gargoyle spouts; soluble white *ganch* gypsum panels strictly restricted under dry porch/loggia roofs (`ganchExposed === 0`).
6. **Zero Domestic Electricity + Evaporative *Shadirvan* Basins (`tbShadirvanPool`):** Warm oil/crystal pierced-brass lanterns (`KROOMLIGHT`) and flowing turquoise-tiled evaporative cooling channels (`WATER`). Ruler title: **`Ahedman`**. Strictly **zero salvage**.

## Build & Verify

```bash
python3 tools/build.py kits/tabisti
node kits/tabisti/tests/test-tabisti.js
python3 tools/check_trades.py kits/tabisti
python3 kits/tabisti/verify.py --assert --all-views
```
