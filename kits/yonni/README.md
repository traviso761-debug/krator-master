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
   - **Freestanding Mode (`style: 'freestanding'`):** 9 dwellings (3 poor, 3 middle, 3 rich), 7 royal/civic/sacred monuments (**Twin-Queen Royal Palace & Citadel** `yn-palace-citadel`, **Peripteral Royal Court Rotunda** `yn-court-rotunda`, **Dual-Throne Twin-Kandē Citadel** `yn-citadel-twinkande`, **Lone-Born Seer Rotunda**, **Sisterhood Spear-Hall**, **Lore-Tower**, **Rain-Catch Cistern Bathhouse**), 6 Formline & coastal fortifications (**Carved Formline Curtain Rampart** `yn-wall-curtain`, **Tall Slot-Arch Portal Gatehouse** `yn-gatehouse-portal`, **High Formline Watch-Tower** `yn-tower-formline`, **Twin-Drum Gatehouse**, **Crag Watch-Tower**, **Twin-Lance Barracks**), 20 land Voth-census trade & agricultural buildings (including centered terraced farmstead `yn-farmstead`, rotating squall-turbine mill, and Scoured-Hills mines working `kits/resources` ore nodes), and 4 coastal harbour & war-galley dockyard defs.
   - **Cliff-Flush Engaged Mode (`style: 'cliff'`):** **Spear-Queen Frontier Border-Fort** (`yn-border-fort`: engaged dark-basalt/sea-lime cliff bastion with twin drum-prow corner bastions, bronze beacon-braziers, defended gate-passage, and 5-tier overhanging annular war-redoubt with vertical counterpoise lift-spine), **Cantilevered Fluted-Corbel Rotunda Loggia**, **Engaged Three-Quarter Cliff-Tower Cluster**, **Arched Stone Cleft-Bridge & Twin-Towers**, **Cliff-Ledge Twin-Cot**, **Cliff-Vented Rock-Forge**, and **Hanging Eyrie Watch-Cupola**, placed against a sculpted coastal granite scarp.

## Surface Textures & Z-Fighting Audit

- **100% Real Library Textures (`all-surfaces-textured`):** Every building surface, door leaf, hardware band, room card, cliff scarp, resource outcrop, fauna group, AND every furniture render family (`f_*` triplanar world-space detail maps in `materials.json`) is wired to packed maps from `core/materials/library`.
- **Geometric Z-Fighting Audit (`z-fighting`):** `window._api.zfightAudit()` checks all world-space triangles across buildings, doors, spinners, and furniture for same-normal (`dot > 0.998`), coplanar (`<= 1.5 mm`), 2D-overlapping triangles of distinct material/colour, asserting `0` overlaps.
