# kits/dzagh-vardzi: Petty Gorge-Kingdoms of Dzagh-Vardzi (Vardzieti / Crookwash, K1-K7)

The building kit of the **Petty Gorge-Kingdoms of `Dzagh-Vardzi`** ("Gorge-Wards") of **`Vardzieti` (`Crookwash`, `+950..+2,274 m`)**, fractured across **7 isolated rain-fed lateral mountain valleys** (`Khāi-Gēti`, `Rēd-Spāiri`, `Tīn-Flītsi`, `Āirn-Dzāghi`, `Rōzi-Vārdzi`, `Mīst-Khōpri`, `Dzēdi-Khrōsi`) plus the neutral confluence trade-hamlet **`Flūmi-Brīdzi`** (`culture: 'dzagh-vardzi'`), where **"every king (*Dzagh-Mep'e*) is lord in his own valley."**

Sheltered from lowland empires behind sheer volcanic-tuff and columnar-basalt gorges, the *Dzagh-Vardzi* maintain an archaic chivalric warrior ethos: tiny cousin retinues in **300-year-old heirloom tin-bronze & magnetite scale hauberks, nephrite-bossed bucklers, and silver-chased broadswords** settle valley boundary feuds by **1-v-1 or 3-v-3 champions' duels on covered chasm sky-bridges**, weighed out in sawn emerald nephrite-slab weregild (`jade = 200`) and *qvevri* apricot-brandy feasts.

```bash
python3 tools/build.py kits/dzagh-vardzi                        # builds dist/dzagh-vardzi.html + sidecar + build-inputs.json
python3 tools/build.py kits/dzagh-vardzi --village              # builds dist/dzagh-vardzi-village.html (Flumi-Bridzi log-flume hamlet)
cd kits/dzagh-vardzi && python3 build.py --vendor-check         # verify zero shadowed core/engine fragments
/tmp/pw-venv/bin/python verify.py --assert                      # run all kit, texture, winding, z-fighting & survey invariants
/tmp/pw-venv/bin/python verify.py --village --assert            # verify Flumi-Bridzi gravity log-flume continuity & village scene
python3 ../../tools/textures/pack.py kits/dzagh-vardzi          # repack tex/ after editing materials.json
```

## Architectural Language (`DV2 + DV4 + DV3`)

1. **Polychrome *Ablaq* Masonry & Nephrite Inlays (`DV2` — Armenian/Georgian *Akhtamar* & *Vardzia*):**
   - Warm **apricot-rose volcanic tuff (`tuff`, `tuffPolished`)** and **dark charcoal columnar-basalt (`basalt`, `colBasalt`)** horizontal *ablaq* courses.
   - Sawn **emerald-green nephrite (`jade`) cross-medallions**, chip-carved vine/rosette relief friezes (`carve`), and **golden-skarn arched tympanums (`skarn`)**.
2. **Terraced Cliff-*Aul*, `5:1` Quartz Needle-Towers & 12-Pleat *Gumbat* Spires (`style: 'aul'`, `DV4 + DV2`, 24 Buildings):**
   - Stacked Dagestani stone roof-plaza houses (`9` poor/middle/rich dwellings) whose flat slate-and-cypress lower roofs form sunny apricot-drying terraces for stepped-back upper tiers.
   - Clustered razor-slender **`5:1` battered defense needle-towers** (Ingush *vovnashki* / Svan *koshki*) crowned with **gleaming stepped snow-white quartz pyramidal roofs (`quartz`)**, projecting *mashikul* machicolation boxes, and **aerial ropeway pulley-baskets**.
   - Civic, sacred & royal monuments (`15` buildings) crowned with **12-pleat star-fluted conical *Akhtamar* umbrella spires (*gumbat*)** in patinated verdigris copper (`Cu = 130`, `verdigris`) & crimson/apricot tuff — including **`dv-citadel-mepe`** (Valley-King's Palace-Citadel), **`dv-sanctuary-gumbat`**, **`dv-hall-weregild`**, **`dv-bridge-duel`** (Champions' Duel Sky-Bridge), **`dv-tavern-qvevri`**, and **`dv-gate-flume`** (Chasm Flume-Tunnel Gatehouse).
3. **Specialized `core/hamlet` Flume-Forge & Chasm-Mill Mode (`style: 'flume'`, `DV3`, 25 Buildings, 40/44 Voth Trades):**
   - **`dv-flume-keep`** (Chasm-Straddling Flume-Forge Keep shooting a full `30 m` red-cypress log straight through a vaulted tunnel in the keep's belly), **`dv-flume-forge`** (Stacked Triple Overshot Cliffside Waterwheel Stamp-Mill & Trip-Hammer Forge with 3 animated rotating waterwheels & verdigris copper spark-hoods), **`dv-flume-trestle`**, **`dv-sawmill-jade`** (Nephrite Pendulum Wire-Saw Watermill), **`dv-sluice-fleece`** (Sheepskin "Golden-Fleece" Placer-Gold Sluice-Weir), plus full foundry, armourer, *qvevri* winery/distillery, quarry, `kits/resources`-linked mine, market, granary, terrace orchard, and mountain byre.
4. **Zero-Podium Steep-Gorge Engineering:**
   - Every building extends a battered `colBasalt`/`cobble` cliff root-skirt (`4.8-7.0 m` below `y = 0`) with zero boxy flat podiums, proven on both a **`25 deg` Terraced Gorge Slope Row** and the **`Crookwash` Chasm, Cascade & Log-Flume Showcase Row**.
