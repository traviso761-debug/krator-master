# The Governor's Palace of Dilihan (*Sid'kiñ* Praetorium): Blueprint

The programme, spatial hierarchy, and settled owner forks follow [`settlements/iziz/VASSAL-KITS.md`](../../iziz/VASSAL-KITS.md) §3
and [`settlements/dilihan/PLAN.md`](../PLAN.md) §2.3: kin-only household, Veterans' Council pavilion inside the palace at the second
threshold, duty-guard pavilion inside the grounds with `vern_guard_tower` and `vern_barracks` outside, and walled grounds of
**`70 × 56 m`** (`u = -36..+38, v = -30..+30`).

    python3 settlements/dilihan/build.py --bake-palace    # writes palace/floors/*.png and palace/FURNITURE.md

| Sheet | Level |
|---|---|
| `floors/B.png` | Undercroft (`y = -2.3..+1.2 m`): brick-vaulted archive, bronze/potash customs vault, wine/oil stores, roof-fed cistern, guard armoury & cells, and the rock-cut postern to the *colonia* scarp |
| `floors/G.png` | Ground storey & walled grounds (`y = +1.2..+6.7 m`): Iziz-orange forecourt gate, forecourt, axial `contact-marble` stair, patterned-shaft front loggia, vestibule & guard rooms, two-storey sunray-inlaid **Audience Hall** under the dome, governor's cabinet, Chancery & Quiet-Copy Assay Office (front-right 14 m chhatri), **Veterans' Council Pavilion** (front-left 14 m chhatri), orb-and-sun shrine, guard pavilion, outside marble stair on brick stringer, dining hall, family garden room, round vented-dome kitchen with clustered Tudor stack, service court |
| `floors/U.png` | Upper storey (`y = +6.7..+11.2 m`): upper arcaded gallery w/ jharokha oriels, petitions office, chancery records, imperial envoy suite, railed dome gallery, and the *sid'kiñ*'s private residence |
| `floors/L.png` | Roofs, **gold onion dome** (`y = +17..+24 m`) on marble-windowed drum, and the **Cut Signal Room** (`y = +24..+27 m`) sighting north down the Cut highway toward Jimjam and south toward the Hykkousoi pass gate |
| `floors/section.png` | Longitudinal axial section (`u = -36..+40`, heights `2×`) |

## Architectural Vocabulary (`dl_gov_palace` in `src/82-dl-landmarks.js`)

- **Terrace (`y = 0..1.2 m`):** Jimjam `contact-marble` podium with moulded base and broad axial marble stair.
- **Hall Block (`36 × 24 m` core, two storeys):** Red brick with yellow header courses (`bandBrick`), marble string courses, two storeys of pointed/round brick arcades, patterned-shaft ground loggia (`diamond`, `spiral`, `chevron`, `fleur`), and jharokha oriels.
- **Great Dome:** Gold onion dome (`domeGold`) over a 16-window `contact-marble`-framed drum, crowned by the glazed Cut signal lantern and heliograph mirror.
- **Seven Round Chhatri Pavilions:** Ribbed-slate domes with lanterns on the two 14 m front pavilions (Veterans' Council & Chancery/Assay); terracotta domes on the two 11 m rear residence pavilions and two 8 m flank pavilions; a round brick kitchen at the rear under a vented terracotta dome with a clustered Jimjam Tudor chimney stack.
- **Iziz Orange Discipline:** Iziz orange (`VPAL.orange`, `0xe07a2a`) is restricted strictly to the forecourt banners, the forecourt gate band, and the window/arch reveals so the palace reads Jimjamite first and Izani second.
