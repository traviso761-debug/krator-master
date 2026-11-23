# Marr Kit (`kits/marr`)

**Porta Marr** (`mar_*`, seeds `9801–10099`) — Iziz's foremost Ring Sea port and canal-quartered sister city (`sxmeztkqg7`, `px: 926, py: 1014`, planned population `~20,000` souls).

Built on the **Iziz Vernacular contract** ([`settlements/iziz/VASSAL-KITS.md`](../../settlements/iziz/VASSAL-KITS.md)), alongside [`kits/pylon`](../pylon/README.md) and [`kits/talia`](../talia/README.md), and paired with the 10-piece harbour & dock expansion in [`kits/iziz-vernacular/src/73d-vern-docks.js`](../iziz-vernacular/src/73d-vern-docks.js).

## Architectural Language

- **Unifying Thread — Spanish Colonial (Antigua, Old San Juan, Havana):** Warm lime-washed plaster in mustard-ochre (`MPAL.ochre`), terracotta-coral (`MPAL.coral`), saffron (`MPAL.saffron`), and cream-white (`MPAL.lime`), paired with Iziz's shared burnt-orange accent (`VPAL.orange`), carved grey-brown volcanic ashlar stone (`maCantera`) for corner quoins, ground arcades, and Baroque portals (*portadas*), and barrel clay roof tiles (`maTile`).
- **New Orleans & Barcelona Overlays:** Double-level wrought-iron lacework galleries (`maIronGallery`) in black and deep carriage-green (`MPAL.iron`), chamfered *xamfrà* street corners, and projecting timber-and-leaded-glass bay windows (`maMirador`).
- **Bruges Canal Gables:** Stepped masonry canal gables (`maBrugesGable`) with stone coping and projecting iron cargo-hoist beams along the canal basins.
- **Inhabited Courtyards:** Every courtyard — whether standalone (`70m-mar-patios.js`) or embedded inside a patio house, tenement, mansion, or palace — is richly inhabited via `maPatioPleasure` (*Korta de Plejar* with azulejo fountain pools and palm/citrus beds), `maPatioVegetable` (*Korta de Gardon* with raised vegetable beds, grape trellis pergolas, wellheads, and potting sheds), or `maPatioWorking` (*Yarda de Guorka* with lean-to summer kitchens, beehive bread ovens, laundry *pila* troughs, and overhead clotheslines).

## Building & Verifying

```bash
python3 kits/marr/build.py
python3 kits/marr/verify.py dist/marr.html --assert --views "Overview,Mixed street — middle — eye level,Mixed street — docks — eye level"
python3 tools/check_trades.py kits/marr --src kits/iziz-vernacular/src --src settlements/iziz/src
```
