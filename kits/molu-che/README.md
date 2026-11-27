# Molu-Che Fossorial Clans & Bonded Vaults Kit (`kits/molu-che`)

The complete settlement-ready architectural kit of **The `Mōlü-che` (*Mole-Tribe*) of `Moleshelf`** (`peoples.json`: `molu_che`, speaking Mapuche-shifted `Mōlu-Dungu`: `-we` "sunken yard", `-che` "folk", `-mapu` "bench-land"), built on `core/engine` with native vertical-stack graphics (`GRAPHICS-TERRAIN-PROPOSAL.md` Stages 1, 5 `M1`–`M4`, 7 `I1`–`I4`, §12d `K1`–`K4`).

Adapted to the rain-shadowed semi-arid `BSk` golden-loess step-bench of `Moleshelf` (with compact barrel-chested stature, translucent nictitating dust-lids, amber-gold tapetum low-light eyes, and acute plantar/inner-ear seismic vibration sense), the `Mōlü-che` herd **ox-sized (`800–1,400 kg`) engineered fossorial mammals (*Talpatheres*, `ktrama-mōlü`)** shod in replaceable tin-bronze and `Kulanewa` iron claw-shoes. Guided by foot-stamp codes, *Talpathere* teams excavate **open-sky square sunken loess courtyards (`dikengyuan`)**, lime-washed *yaodong* barrel-vaults, hydraulic-lime rain cisterns, *lūma-pāpa* seep-wall tuber drifts, and the sworn-neutral **Subterranean Bonded Strong-Vaults (`dīpü-bōnduwe`)** and **Weeping Valley Overland Bypass** under *The Claw-and-Salt Compact*.

The kit displays **38 complete `defBuilding`s** (`19` `style: 'dikengyuan'` + `19` `style: 'bonduwe'`, seeds `8301..8338`) arranged across four rows, covering all **6 `(poor | middle | rich) x (dwelling-single | dwelling-multi)` residential cells in BOTH styles**, dedicated `military` and `infrastructure` rosters, all **44 Voth census trades** (`MC_TRADES` in `src/72-mc-trades.js`), and a sealed settlement bundle (`kits/molu-che/kit_bundle.py` -> `MCK`):

1. **Rows 1–2 — Bench Pastoral, Tuber-Gallery & Craft Clans (`style: 'dikengyuan'`, 19 buildings, seeds `8301..8319`):**
   *Lonko* and *Ülmen* clan *dikengyuan* courtyards, seismic-stone ancestor sanctuaries, hydraulic-lime cistern baths, drovers' taverns, twin-ramp *Talpathere* breeding byres, bronze-and-iron claw-shoe forges, irrigated *lūma-pāpa* tuber & mushroom drifts, blind amber-grub cellars, velvet mole-felt fulleries, Cucuteni downdraft kilns, rotary capstan grain-pits, steppe rim-watches, and all 6 clan dwelling classes.
2. **Rows 3–4 — *Dīpü-Bōnduwe* Bonded Strong-Vault & Bypass Guilds (`style: 'bonduwe'`, 19 buildings, seeds `8320..8338`):**
   Siege-, flood-, and fireproof subterranean strong-vaults holding `Kulanewa` `raha` silver-bullion, `ampala-kiri` sealed amber-ledgers, Ria patrician reserves, and 10-year dry-loess treaty famine grain; safe-conduct tally scriptoria, wind-sheltered market trenches, karst lime/ashlar yards, bronze-runner sled-wrights, halite cold-vaults, *Hāi-Trēlü* toll-gates, Weeping Valley relay *mansios*, seismic listening mounds, sally redoubts, gorge-head portcullis bastions, citadel keeps, and all 6 vault-guild dwelling classes.

## Sunken Loess *Dikengyuan* & *Yaodong* Architectural Grammar (`src/40-mc-kit.js`, `src/42-mc-props.js`)

- **Open-Sky Square Sunken Loess Courtyards & *Talpathere* Ramps:** Raised, battered golden-ochre `loess` and `rammed` earth-bench rings (`yBench = 4.0..4.7 m`, anchored by `7.0 m` below-grade loess slope-roots) pierced by completely open-sky paved sunken courtyards (`yCourt = 0.34..0.44 m`) and graded cobble/brick *Talpathere* caravan entry-ramp trenches (`mcEntryRamp`).
- **Recessed Lime-Washed *Yaodong* Arches & Cucuteni Mineral Friezes:** Walkable, furnished interior *yaodong* chambers (`mcVaultWing`) with solid vaulted/coffered ceilings (`mcCeilingSlab`), sculpted `dolomite` and `kilnbrick` round arches (`mcYaodongPortal`), chalk-white `limewash` recessed tympana, carved `darkcedar` radial lattice lunettes (`svPane`), riveted `iron` & `valge-vask` (`nickel`) strong-vault doors, and Mapuche-Cucuteni stepped-diamond `ochre`/`ironred`/`indigo` mineral friezes (`mcCucuteniFrieze`).
- **Walkable Steppe Roof-Terraces & Seismic Way-Stones:** Stone courtyard stairs (`mcCourtyardStair`) climbing onto walkable `yBench` loess terraces rimmed with open-work brick/dolomite sky-well parapets (`mcSkywellRim`), earthen vaulted smoke/air hoods (`mcVentHood`), woven tuber/grain drying mats (`mcDryingMats`), and tuned dark-`basalt` & `bronze` Seismic Way-Stones (`mcSeismicStone`).

## Build, Test & Verify

```bash
# Repack library textures after editing materials.json
python3 tools/textures/pack.py kits/molu-che

# Build dist/molu-che.html + dist/molu-che.tex.*.js sidecars
python3 tools/build.py kits/molu-che

# Node unit & MCK bundle tests
node kits/molu-che/tests/test-molu-che.js

# Headless verification & assertions
python3 kits/molu-che/verify.py --assert
```
