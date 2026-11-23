# Dasri Kit (`kits/dasri`)

Procedural Yemeni-inspired architectural kit for **the Dasri** (`culture: 'dasri'`, `LORE.md` §6.8 & §3.1; `biomes/catch/PLAN.md`): the desert caravaneers, oasis keepers, and urban salt-merchant sheikhdoms of the Bowl, Eastern High Desert, and Catch oases.

## Architectural Registers

1. **Urban `Jabal` (`ds_jabal_*`, 16 defs, `4–7` storeys, `11.8–25.8 m`)**:
   - Designed for **Jabal**, capital of the Jabal Sheikhdom and home of the **Train of Jabal** salt-caravan guild (inspired by Sana'a, Shibam Hadramawt, and Dar al-Hajar).
   - **Signature Motifs**: Coursed dark volcanic basalt and dressed buff sandstone ashlar lower storeys (`1–2` floors, defensive slit vents, semicircular *ablaq* stone portals with operable studded cedar `KDOOR` leaves), warm terracotta-red fired brick upper storeys (plus **Shibam `v: 1` variants** with mudbrick lower shafts and gleaming whitewashed `qadad` upper crowns), projecting 3D crisp white gypsum (`juss`) chevron and diamond relief friezes, plumb-aligned **`qamariya` arched stained-glass fanlight windows**, corbelled carved-cedar **`mashrabiya` / `shurbah`** cooling boxes, white lime-plastered `mizab` drainage chutes, pierced roof screens with **horned `shurfat` corner pinnacles** (the Dasri horn sign), and rooftop **`mafraj` belvedere pavilions**.
   - Includes `poor`, `mid`, `rich` tower-houses, street-corner tower, stepped *Dar al-Hajar* merchant mansion, 3-arch souq arcade, Train of Jabal salt warehouse (*wakala*), copper/brass brazier (*nahhas*), *tannur* bakery, weaver/dyer, coffee/spice *samsarah*, **Train of Jabal Salt Caravanserai (*Funduq*)**, **Sheikh's Rock-Palace / *Mafraj* Citadel**, **Domed *Hammam* & *Birka* Cistern**, **Bab al-Jabal Bazaar Gate**, and **Brick-and-Gypsum Call Tower**.

2. **Dasri Village & Oasis (`ds_vil_*`, 12 defs, `1–3` storeys, `4.6–12.6 m`)**:
   - Designed for **Dasri foothill villages, canyon-ledge hamlets, and Catch/Bowl oasis stations** (*Arfwai*, *Solta*, *Salt al-Ban*).
   - **Signature Motifs**: Coursed rubble stone plinths, battered `zabur` / `banco` mudbrick walls with horizontal `madamik` mud-course ridges, restrained whitewashed lintel eyebrows and parapet copings (omitting urban stained-glass `qamariya` lacework), flat packed-earth roofs on exposed juniper/tamarisk pole ends with timber `mizab` spouts, exterior solid-stone stairs, beehive mudbrick granaries, way-shade *sablah* loggias, animal-drawn *saqiya* well sheds, halite salt-pan sheds, clay/lime kilns, canyon-ledge mule stairs, round battered watchtowers (*burj*), and a **fortified desert oasis `qasr`** with a battered cylindrical corner drum tower and courtyard domes.

## Dual Placement: Standalone AND Flush Cliff-Locked (`o.cliff`)

Every piece works **both**:
- **Freestanding in the round** (`!o.cliff`, default): all 4 facades (`+z`, `+x`, `-x`, `-z`) finished with masonry, friezes, windows, spouts, and grounded plinths.
- **Flush against a cliffside or perched on a rock spire** (`o.cliff: true`): rear-high stepped massing (`-z` spine highest, `+z` terraces stepping down toward the lane/valley), suppressed rear `-z` protrusions (`z >= -d/2`), side-rear rock-keying collar nibs, and a deep battered stone retaining skirt (`dsPlinth` / `lo`) so foundations never float over steep rock ledges.

## Build, Test & Verify

```bash
python tools/textures/pack.py kits/dasri
python tools/build.py kits/dasri
node kits/dasri/tests/test-dasri.js
KRATOR_GL=gpu python kits/dasri/verify.py kits/dasri/dist/dasri.html --assert
```
