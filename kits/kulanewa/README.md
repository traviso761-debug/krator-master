# Kulanewa Free-Towns Architectural Kit (`kits/kulanewa`)

The complete settlement-ready architectural kit of **The Kulanewa Free-Towns** (*Külaneva*: Finnic **`küla`** *"village / free-town / commune"* + **`neva`** *"broad navigable river-reach"*, punning on the Rian loanword **`kuluuna`** *"crown"*; `~125,000` souls across the `Arcflow` **`Suur-Neva`**, **`Mere-Upe`**, **`Musta-Jõgi`**, and **`Helme-Koski`** river basin), built on `core/engine` with native vertical-stack graphics (`GRAPHICS-TERRAIN-PROPOSAL.md` Stages 1, 5 `M1`–`M4`, 7 `I1`–`I4`, §12d `K1`–`K4`).

Speaking a **Finnic / Estonian / Baltic** tongue (*Külaneva-keel*, exported as `KL_LEXICON` / `KLK.lexicon`) with extensive courtly, legal, and ceramic **Rian loanwords** (`ampala-kiri`, `kaarumi-linna`, `kuluuna`, `sitoona`, `piliika`, `tooka-hoov`) while exporting banking, alloy, hydro-forge, and river-freight words back into Low-Ria and High-Ria (`raha -> lāha`, `valge-vask -> wālaga-wāsa`, `sampo -> sāmpō / sākwō`, `lotja -> lōča / lōtsa`, `maleva -> mālēwa / wālēwa`), the league follows ***"Kaks Kuluunat, Üks Raamat" ("Two Crowns, One Ledger")*** to prevent Ria reunification. Internally divided between mercantile *Suurgild* banker-cities and egalitarian *Ilma-Kuluuna* commoner covenant-towns, the kit displays **42 complete `defBuilding`s** (`21` `karum` + `21` `ikki`, seeds `8101..8142`) across four rows, with full 44-trade Voth census coverage (`KL_TRADES` in `src/72-kl-trades.js`) and a sealed settlement bundle (`kits/kulanewa/kit_bundle.py` -> `KLK`):

1. **Rows 1–2 — *Kaarum-Linna Suurgild* Syndicates (`style: 'karum'`, Downstream & Confluence Ports, 21 buildings, seeds `8101..8121`):**
   Joint-stock *Suurgild* merchant-banker brotherhoods (*osakott* venture-share sacks), vaulted *saunakoda* steam-brokerage courts, and *kivi-ait* lime bullion vaults. Issue 64-sign `ampala-kiri` amber-sealed promissory tablets and `raha` bark-paper drafts, run `Tooka-Hoov` extraterritorial clearing-wards in both Ria capitals, and wield `raha` credit-embargoes.
2. **Rows 3–4 — *Ilma-Kuluuna Talku-Küla* Covenant-Communes (`style: 'ikki'`, Upland *Sampo* Forge & *Maalinn* Towns, 21 buildings, seeds `8122..8142`):**
   Liberated during the Last Dynastic Fallback by smelter-hands, *lotja* boatmen, and commoners rallying to ***Ilma-Kuluuna Kell* (*The Uncrowned Bell*)**. Governed by elected *Vanemad* parish lay-elders from wet-moated *maalinn* citadels; run zero-usury *Talku-Ait* mutual-aid granary-vaults and *pirtis* herbal steam-infirmaries, shelter runaway debtors, work the coal, iron, and `valge-vask` (`Arch`-nickel) *sampo* hydro-trip-hammer mills, and field `Kulanewa`'s *Maleva* pike, pavise, and crossbow militia chanting antiphonal *regilaul* bell-hymns.

## 4-Register Hybridized Architectural Grammar (`src/40-kl-kit.js`, `src/42-kl-crowns.js`)

- **`AF3` Ground Register:** Battered chalk-white lime-plastered *kivi-ait* vaults (`kura`) on soot-black basalt socles (`sootstone`), stepped projecting firewall wings (`klUdatsuWall`), riveted iron & `valge-vask` fire-shutters (`klFireShutterWindow`), and interlocking dark-cedar river-trestles (`klKiyomizuTrestle`) over flowing channels (`klWaterChannel`).
- **`Style A` Mid-Register:** Warm kiln-fired red brick (`kilnbrick`) banded with a restrained Rian-loan `piliika` (`cobalt` or `celadon`) glazed tile dado frieze (`klDadoFrieze`), projecting carved dark-cedar lattice counting-windows (`klSanjhyaOriel`), and repoussé cast-bronze semicircular portal tympana (`klToranaDoor`).
- **`AF4` Vertical Accent:** Baltic/Estonian *maalinn* stave heritage fused with Ria pylon massing: truncated conical towers of vertical dark-cedar staves cinched in riveted black-iron and silver-white `valge-vask` (`Arch`-nickel) tension hoops (`klHoopedFrustum`), linked by timber truss sky-walks (`klSkywalk`).
- **`AF1` Crown & Hydro Spans:** Broad nail-less multi-eave `terracotta` and charcoal-`slate` hipped & gable roofs (`klNewarRoof`), **open octagonal cast-bronze *Kellakoda* Bell-Cupolas (`klBellCupola` — zero royal *Prasat* spires!)**, hanging bronze steelyard scales (`klSteelyard`), and undershot *sampo* forge/mill waterwheels (`klMillWheel`).

## Build, Test & Verify

```bash
# Repack library textures after editing materials.json
python3 tools/textures/pack.py kits/kulanewa

# Build dist/kulanewa.html + dist/kulanewa.tex.*.js sidecars
python3 tools/build.py kits/kulanewa

# Node unit & KLK bundle tests
node kits/kulanewa/tests/test-kulanewa.js

# Headless verification & assertions
python3 kits/kulanewa/verify.py --assert
```

## Controls (`core/host`)

- **Orbit / Pan / Zoom:** Left-drag / Right-drag / Wheel
- **Walk (`F`):** First-person walker across all `KWALK` floors, stairs, *kiyomizu* trestles, covered mill-bridges, moat bridges, sky-walks, and hooped frustums (with Stage 7 `KROOMLIGHT` portal daylight & warm interior lamps)
- **Door (`E`):** Open / shut the nearest `KDOOR` doorway
- **Cut-away (`X`):** Slice open roofs and upper walls to inspect furnished & `KROOMLIGHT`-lit interiors
- **Night (`N`):** Night sky, glowing coking kilns, assay furnaces, cresset lanterns, and signal beacons
