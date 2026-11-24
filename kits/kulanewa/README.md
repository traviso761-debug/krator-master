# Kulanewa Free-Towns Architectural Kit (`kits/kulanewa`)

The complete settlement-ready architectural kit of **The Kulanewa Free-Towns** (`~125,000` souls across the `Arcflow` `Pāk-Mā` and `Tōng-Mā` river basin), built on `core/engine` with native vertical-stack graphics (`GRAPHICS-TERRAIN-PROPOSAL.md` Stages 1, 5 `M1`–`M4`, 7 `I1`–`I4`, §12d `K1`–`K4`).

United by the foreign-policy maxim ***"Two Crowns, One Ledger"*** to prevent Ria reunification, yet internally divided between mercantile banker-oligarchs and egalitarian commoner covenant-towns, the kit displays **42 complete `defBuilding` banking houses, clearing courts, treaty customhouses, covered mill-bridges, mints, reserves, hydro-trip-hammer forges, bell foundries, river-booms, wet-moated *Jinaimachi* citadels, drum-frustum gates, and all 6 `(poor | middle | rich) x (dwelling-single | dwelling-multi)` residential classes in BOTH factions** (`21` `karum` + `21` `ikki`, seeds `8101..8142`) arranged across four rows, with full 44-trade Voth census coverage (`KL_TRADES` in `src/72-kl-trades.js`) and a sealed settlement bundle (`kits/kulanewa/kit_bundle.py` -> `KLK`):

1. **Rows 1–2 — *Kārum* Ledger-Syndicates (`style: 'karum'`, Downstream & Confluence Ports, 21 buildings, seeds `8101..8121`):**
   Old Assyrian *Kārum* joint-stock merchant-bankers (*naruqqum* capital-sack shares) + Kathmandu *Newar* kiln-brick-and-cedar urban leagues + Sakai *Egōshū* fireproof *kura*-vault syndicates. Issue 64-sign Amber-Envelope promissory tablets and bark-paper remittance drafts, run extraterritorial clearing-wards in both Ria capitals, and wield financial credit-embargoes (*niš ālim*).
2. **Rows 3–4 — *Kūla-Nā* Covenant-Communes (`style: 'ikki'`, Upland & Foundry *Jinaimachi* Towns, 21 buildings, seeds `8122..8142`):**
   Liberated during the Last Dynastic Fallback by smelter-hands, boatmen, and commoners rallying to ***The Uncrowned Bell* (*Kūla-Nā*)**. Governed by elected *Otona* lay-elders from wet-moated *Jinaimachi* temple-citadels; run zero-usury *Mujinzō* mutual-aid granaries, shelter runaway debt-bondsmen, work the coal, iron, and `Arch`-nickel hydro-trip-hammer mills, and field `Arcflow`'s pike, pavise, and repeating-crossbow militia shield.

## 4-Register Hybridized Architectural Grammar (`src/40-kl-kit.js`, `src/42-kl-crowns.js`)

- **`AF3` Ground Register:** Battered chalk-white lime-plastered *kura* vaults (`kura`) on soot-black basalt socles (`sootstone`), stepped projecting *udatsu* firewall wings (`klUdatsuWall`), riveted iron & `Arch`-nickel fire-shutters (`klFireShutterWindow`), and interlocking dark-cedar *kiyomizu* post-and-crossbeam river-trestles (`klKiyomizuTrestle`) over flowing channels (`klWaterChannel`).
- **`Style A` Mid-Register:** Warm Newar kiln-fired red brick (`kilnbrick`) banded with a restrained Ria-inherited `cobalt` or `celadon` glazed tile dado frieze (`klDadoFrieze`), projecting carved dark-cedar *sanjhyā* lattice counting-windows (`klSanjhyaOriel`), and repoussé cast-bronze semicircular *torana* portals (`klToranaDoor`).
- **`AF4` Vertical Accent:** Truncated conical towers of vertical dark-cedar staves cinched in riveted black-iron and bright silver-white `Arch`-nickel tension hoops (`klHoopedFrustum`), linked at upper levels by timber truss sky-walks (`klSkywalk`).
- **`AF1` Crown & Hydro Spans:** Broad nail-less multi-eave `terracotta` and charcoal-`slate` Newar/Dong hipped & gable roofs (`klNewarRoof`), **open octagonal cast-bronze Syndicate / Covenant Bell-Cupolas (`klBellCupola` — zero royal *Prasat* spires!)**, hanging bronze steelyard scales (`klSteelyard`), and undershot forge/mill waterwheels (`klMillWheel`).

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
