# kits/yonni: Twin-Born Spear-Queens of Yonni & the Scoured Hills

The building kit of the **Twin-Born Spear-Queens (*Sfīra-Kandētæ*)** of **`Yonni` (`346, 418`, ex-`Yith`)** and the **`Scoured Hills` (`rmwetizlzivnz`)** (`culture: 'yonni'`).

A wet windward coastal-mountain matriarchy (`+166..+4,402 m`, `1,647–2,200 mm/yr` squalls, rich in `iron`, `coal`, `tin = 200`, `saltpeter`, `amber`, coastal granite, and rust-ironstone) speaking a Kushitic + Sarmatian inflected English (*Sfīra-Kandē* Spear-Queen, *Khārth-Kandē* Hearth-Queen, *Fīld-Kandē* Field-Queen, *Tvīn-Sisītæ* Twin-Sisters, *Lōni-Bōrna* Lone-Born Seer). Women are taller and stronger than men, and **90% of births are identical twins**, reflected in paired twin-beds/alcoves, dual-spear racks, Twin-Spear bronze roof finials, Dual-Throne civic citadels, and rare Lone-Born Seer rotundas.

```bash
python3 tools/build.py kits/yonni                          # builds dist/yonni.html + sidecar dist/yonni.tex.yonni.js + build-inputs.json
cd kits/yonni && python3 build.py --vendor-check           # verify zero shadowed core/engine fragments
python3 verify.py dist/yonni.html --assert                 # run all kit, texture, z-fighting & survey invariants
python3 ../../tools/textures/pack.py kits/yonni            # repack tex/ after editing materials.json
```

## Architectural Language

1. **Coarse Coastal-Cobble Bases & Sea-Lime Drums:**
   - Salt-grey coastal granite, river-cobble, and rust-ironstone lower drums (`cobble`, `rivercobble`, `ironstone`) topped by pale crushed-shell hydraulic sea-lime rendered shafts (`sealime`, `sealimeWarm`).
   - **Zero Rectangular Podiums (`ynRootSkirt`):** Every cylindrical drum extends a 1:6 battered cobble root-skirt (`4.2–6.8 m` below `y = 0`) so placements on `0°–35°` slopes plunge cleanly into hillsides without boxy concrete-like terraces, visually proven on the sheet's **`26°` Scoured-Hills Steep-Slope Showcase Row**.
2. **Rain-Ready Overhanging Upper Levels & Round Rain-Canopies:**
   - Vertical stone corbel-fins and fluted corbel-ribs carrying wider overhanging circular war-galleries and dark oiled coastal ironwood arcades.
   - Mid-wall annular slate watershed drip-skirts and projecting semicircular crescent window rain-visors shedding heavy squalls clear of walls and doorways.
   - Broad oversailing conical and domed **Round Rain-Canopies** in slate-blue scale shingle (`slate`), patinated verdigris copper/bronze standing-seam (`verdigris`), and radial tin-bronze ribs crowned by **Twin-Spear finials**.
3. **Steep-Slope Circulation & Two Modes (`style: 'freestanding'` | `'cliff'`):**
   - Drum-hugging exterior spiral stone stairs, uphill contour gangplanks, and sloped roofed flying bridges linking multi-drum compounds.
   - **Freestanding Mode (`style: 'freestanding'`):** 10 dwellings (`3` poor, `3` middle, `4` rich including the **Five-Apse Promontory Manor & Spire-Court** `yn-manor-apserose`), 13 royal/civic/sacred/citadel monuments (**Twin-Queen Royal Palace & Citadel** `yn-palace-citadel`, **Peripteral Royal Court Rotunda** `yn-court-rotunda`, **Dual-Throne Twin-Kandē Citadel** `yn-citadel-twinkande`, **Cantilevered Saucer-Terrace Spire** `yn-spire-saucers`, **Golden-Dome Seer Monastery** `yn-monastery-giltcluster`, **Annular Sunken-Court Moot & Exchange** `yn-arena-ringcourt`, **Gilt-Dome & Verdigris-Disc Sanctuary** `yn-sanctuary-giltgate`, **Four-Pylon Buttressed Terracotta-Dome Shrine** `yn-shrine-pylondome`, **Hexagonal-Truss Pagoda Watch-Citadel** `yn-citadel-hexstilt`, **Lone-Born Seer Rotunda**, **Sisterhood Spear-Hall**, **Lore-Tower**, **Rain-Catch Cistern Bathhouse**), 6 Formline & coastal fortifications (`yn-wall-curtain`, `yn-gatehouse-portal`, `yn-tower-formline`, **Twin-Drum Gatehouse**, **Crag Watch-Tower**, **Twin-Lance Barracks**), 26 land Voth-census trade, inn, bazaar, signal & agricultural buildings (including **Stained-Glass Rotunda Inn & Turret Bridge** `yn-inn-staineddrum`, **Domed Belvedere Caravanserai** `yn-villa-belvedere`, **Umbrella-Cupola Bazaar-Drum** `yn-bazaar-drum`, **Sun-Petal Awning & Crane-Spar Watchtower** `yn-tower-sunpetal`, **Shade-Sail Garrison & Store-Compound** `yn-compound-sails`, **Verdigris Scallop-Cap Smelter & Signal Pylons** `yn-smelter-scallop`, centered terraced farmstead `yn-farmstead`, rotating squall-turbine mill, and Scoured-Hills mines working `kits/resources` ore nodes), and 4 coastal harbour & war-galley dockyard defs.
   - **Cliff-Flush Engaged Mode (`style: 'cliff'`):** **Spear-Queen Frontier Border-Fort** (`yn-border-fort`), **Fluted-Pillar Cliff Acropolis & Viaduct** (`yn-cliff-viaduct-hall`: twin fluted chasm-columns rising to mossy verdigris-domed lantern rotundas spanned mid-air by a colonnaded stone viaduct), **Cliff-Clinging Saucer-Lantern Hold** (`yn-cliff-lanternhold`: staggered dark ironstone & bronze saucer-pods glowing with continuous amber lantern-slit bands), **Cantilevered Fluted-Corbel Rotunda Loggia** (`yn-cliff-rotunda`), **Engaged Three-Quarter Cliff-Tower Cluster**, **Arched Stone Cleft-Bridge & Twin-Towers**, **Cliff-Ledge Twin-Cot**, **Cliff-Vented Rock-Forge**, and **Hanging Eyrie Watch-Cupola**, placed against a sculpted coastal granite scarp.

## Surface Textures & Z-Fighting Audit

- **100% Real Library Textures (`all-surfaces-textured`):** Every building surface, door leaf, hardware band, room card, cliff scarp, resource outcrop, fauna group, AND every furniture render family (`f_*` triplanar world-space detail maps in `materials.json`) is wired to packed maps from `core/materials/library`.
- **Geometric Z-Fighting Audit (`z-fighting`):** `window._api.zfightAudit()` checks all world-space triangles across buildings, doors, spinners, and furniture for same-normal (`dot > 0.998`), coplanar (`<= 1.5 mm`), 2D-overlapping triangles of distinct material/colour, asserting `0` overlaps.
