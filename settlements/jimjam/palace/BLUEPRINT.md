# The Raja's Palace & Great Sunray Plaza (`jj_palace` + `jj_palace_plaza`): Blueprint

Built to exact parity with [`settlements/jimjam/src/75-jj-palace.js`](../src/75-jj-palace.js) (`jj_palace`: `113 × 90 × 52 m`, `PL = 4.5 m` podium, `3 × 6.0 m` storeys `RY = +22.78 m`, `32 × 24 m` roof drum pavilion under an `r = 9.6 m` gold onion dome; `jj_palace_plaza`: `104 × 82 m` deck at `JJ_PAL_PLAZA_OFFSET = 85 m` along local `+z`, flush at `+4.5 m`).

    python settlements/jimjam/palace/palace_blueprint.py    # writes palace/floors/*.png, S0_site.png, and palace/FURNITURE.md

## Sheets & Levels

| Sheet | Level / Scope | Elevation (`y` above `+496 m` pad) | Contents |
|---|---|---|---|
| `floors/S0_site.png` | **City Site Masterplan** | `+429.78..+544 m` ASL (`4.8 × 4.2 km`) | Drawn directly from [`site/jimjam-site.json`](../site/jimjam-site.json): NNW pocket cove, 6 gates, 8 celestial districts + Izani enclave + Pilgrim Maidans, sightline rays, and 22 numbered landmarks |
| `floors/B.png` | **Podium Undercroft** | `y = 0.0..+4.5 m` (inside the `112 × 81 m` plinth) | Monsoon roof-fed cisterns, **electric-lit Royal Bullion, Emerald & Alabaster Vault** (two-keyed), *Hanḍu* copper-plate & gnomon archive, grain & `whorl-olive` lamp-oil cellars, guard armoury & cells, rear cart/service gate |
| `floors/L1.png` | **Sunray Plaza, Podium & Ground Storey** | `y = +4.5..+10.5 m` (`u = -126..+43 m`) | **Great Sunray Plaza** (`discR = 26 m` 16-ray deck & Sun Column), Ceremonial Gateway (`z = +35`) & twin gate spires, Forecourt, **North Wing (*Hanḍu* Land-Tax & Assay)**, **South Wing (Palace Guard & Concordance Chancery)**, 5-bay recessed loggia, Vestibule, Hall of Public Petitions, Envoys' Waiting Hall, twin Lotus Light-Courts, and **4 Great Kitchens/Bakehouse** directly beneath the 4 Tudor chimney stacks |
| `floors/L2.png` | **Piano Nobile (State Floor)** | `y = +10.5..+16.5 m` | Upper 5-bay loggia & **8 projecting *jharokha* *jali* oriels**, two-storey **Great Darbar Hall of the Concordance** (`32 × 24 m` under the central onion dome), **Council of the Three Wheels** (under N gold ribbed dome), **State Banquet Hall** (under S gold ribbed dome), Foreign Envoys' Reception (`Dilihan`, `Hykkousoi`, `Ardent`, `Eternal State`, and **White-Pass `Yeti` / `Yonni` / `Rian`** delegations), and the Raja's Privy Cabinet & Astrological Chart Room behind the dais |
| `floors/L3.png` | **Upper Royal & Ruby Zenana Storey** | `y = +16.5..+22.5 m` | Railed Darbar & side-dome galleries, **Raja's Private Apartments & Royal Hammam** (under S-rear slate lantern dome), **Ruby Zenana & Grand Dream-Sibyl's Inner Sanctuary** behind pierced `Veḷḷai-kal` alabaster *jalis* (under N-rear slate lantern dome, with a split two-door Dream-Whispering Screen so the Raja and the coin-veiled Sibyls never share a corridor), Royal Library of the Counts, and Regalia Wardrobes |
| `floors/LR.png` | **Roof Terrace, Central Pavilion & Domes** | `y = +22.8..+52.0 m` | `32 × 24 m` central roof pavilion + 4 corner chhatris + `r = 9.6 m` **Gold Onion Dome**, 2 gold ribbed side domes (`r = 5.2 m`), 2 slate lantern rear domes (`r = 4.6 m`), 4 front breeze chhatris, 4 clustered Tudor chimney stacks, and 6 staged corner/gate spires |
| `floors/section.png` | **Longitudinal Axial Section** | `u = -126..+46 m` (heights `1.8×`) | Sunray Plaza & Sun Column -> Ceremonial Gateway -> Forecourt -> Double Loggia -> Great Darbar & Onion Dome -> Privy Cabinet / Zenana Threshold -> Undercroft Vaults |

---

## Spatial Principles & Architectural Alignment with `75-jj-palace.js`

1. **Frame (`u = -z`, `v = x`):** Walking in from the NNW Harbour Avenue (`Az 336°`), the petitioner climbs the Sunray Plaza (`u = -125..-45`), crosses the flush `+4.5 m` landing (`u = -45..-38`), passes through the **Ceremonial Gateway** (`u = -35`) into the **Forecourt** (`u = -32.5..-14`), mounts the **5-Bay Loggia** (`u = -14..-10`), and enters the **Main Block** (`u = -10..+40, v = -48..+48`). Left (`v > 0`, drawn up) is the **Tax, Council & Ruby Zenana** flank; right (`v < 0`, drawn down) is the **Guard, Chancery, Banquet & Raja's Personal** flank.
2. **Depth Is Threshold:**
   - Tax payers, caravan factors, and writ-seekers finish their business in the **Forecourt Wings** (`L1`) and never enter the Main Block.
   - Litigants and public petitioners stop at the **Ground Halls** (`L1`) around the twin Lotus Light-Courts.
   - Councillors, state guests, and foreign envoys ascend the **State Stairs** to the **Piano Nobile (`L2`)** Darbar, Council, and Banquet halls.
   - Only the Raja's Privy Stair reaches his **S-Rear Suite (`L3`)** and the राजा-side booth of the **Dream-Oracle Screen**, while the **Ruby Zenana (`L3` N-Rear)** has its own sealed *jali* stair and courtyard void.
3. **Every Exterior Feature Earned Inside:**
   - The **4 clustered Tudor brick chimney stacks** (`(z = -35, x = ±20)` and `(z = -23, x = ±41)`) rise directly on the flues of the Ground-Storey Royal Kitchens, Bakehouse, Spice-Kitchen, and Upper Royal Hammam hypocaust.
   - The **8 *jharokha* balconies** on `L2` terminate the cross-axes of the Council Hall, Banquet Hall, Envoys' Suites, and Astrological Chart Room.
   - **Traditional vs. Electric Lighting:** Every ceremonial hall, loggia, court, and Zenana chamber burns `whorl-olive` oil in `jimjam_common_brass_lamp` trees and `jimjam_court_new_fire_bowl` braziers (doused on the *Double Dark*); **clean electric light** is restricted strictly to the **Undercroft Bullion/Emerald Vault** (`B #2–3`) and the **Concordance Chancery strong-files** (`L1 #9`).
