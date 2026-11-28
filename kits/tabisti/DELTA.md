# Urban Tabisti Architectural Kit (`kits/tabisti`) — Visual Delta & Rubric (`VISUAL-BAR.md` §5 & §7)

Evaluated against reference plates `refs/b1-lechner-zsolnay-roof.png` through `refs/b5-el-capricho-wind-tower.png` (and Board A's Shah-i-Zinda, Bukhara/Khiva *ustun*, *ganch*/*kundal*, and verdigris-column plates) across the headless WebGL renders of `dist/tabisti.html` (`verify.py --views`).

Ablation switch: `?plain=1` (disables `K1` sine-free per-instance breakup, `M2` mip-roughness specular AA, `M3` planar relief POM, `M4` ground contact AO, and `groundMat` dual-octave Voronoi breakup from the identical camera pose).

---

## 1. Ten Most Visually Significant Reference Differences (Ranked by Impact)

1. ~~**[Kit — `42-tb-crowns.js`, `50..62-tb-*.js`] Uniform single-hue teal roofscape across all 50 buildings.**~~
   - *Before:* Every hipped and gabled roof used `zsolnay` (`teal`), turning the `Overview` and `Opening` frames into a monochrome turquoise sea, whereas Ödön Lechner's Museum of Applied Arts (`b1-lechner-zsolnay-roof.png`) and Liikofi's *escata* ceramic roofs (`b3-catalan-escata-spires.png`) weave warm amber-gold terracotta and deep cobalt glazes beside alkaline teal.
   - *Fix applied & verified:* Added polychrome `roofMk` selection (`zsolnay` alkaline teal, `escata` warm amber-gold ceramic, and `cobalt` deep glaze) across key dwellings (`tb_tahawst_mid`), bazaar caravanserais (`tb_caravanserai_urban`), guildhalls (`tb_syndic_guildhall`), chapterhouses (`tb_monk_chapterhouse`), and lakeside estates (`tb_saltrice_manor`). Confirmed in `00-Opening.png` and `01-Overview.png`.

2. ~~**[Kit — `40-tb-kit.js`] Unbroken stucco and banded side flanks lacked embossed brick-and-kashi relief inside 10 m.**~~
   - *Before:* Windowless masonry runs (`>= 2.6 m`) between corner pilasters read as flat textured planes at street range, falling short of Board A's Shah-i-Zinda embossed *banna'i*/*hazarbaf* relief and `VISUAL-BAR.md` Pillar A ("Geometry near, texture far").
   - *Fix applied & verified:* `tbWall` now steps proud rosebrick *hazarbaf* relief frames (`+4.4 cm`) centered with alkaline-teal `kashi` diamond bosses (`+7.6 cm`) across unbroken wall bays `>= 2.6 m`, verified at `0` coplanar overlaps across `666,418` triangles (`z-fighting` PASS).

3. ~~**[Kit — `42-tb-crowns.js`] Secessionist roof dormers read as plain white boxes with heavy block caps.**~~
   - *Before:* `tbZsolnayRoof` dormers lacked cheek framing and tympanum detail compared to `b1-lechner-zsolnay-roof.png` and `b2-raichle-palace-loggia.png`.
   - *Fix applied & verified:* Upgraded dormers with proud rosebrick cheek pilasters, a proportioned turquoise `kashi` + rosebrick stepped cornice, and an embossed `kashi` + `gilt` Secessionist roundel boss.

4. ~~**[Kit sheet — `91z-tb-world.js`] Mid-distance salt-pan ground texture showed 12 m crack-grid repetition across open margins.**~~
   - *Before:* Bare salt-flat margins around the 5 kit rows exhibited visible mid-range tiling of the hexagonal salt-crust normal/albedo map (`VISUAL-BAR.md` §3).
   - *Fix applied & verified:* Hooked `groundMat` via `KHOOK` (`tb_ground_breakup`) with sine-free dual-octave world-space value noise (`0.041` and `0.013 m^-1`), breaking up mid-range tiling while preserving `?plain=1` ablation.

5. **[Settlement / Open-World — Stage 3 `settlements/sfenops`, `settlements/liikofi`] Kit inspection sheet sits on a flat salt pan rather than terraced alkaline lake benches (`WORLD.H`) with street trees, canals, and dockside reed marshes.**
   - *Owner:* Settlement & open-world host phase (`core/city` + `core/world` + `core/coast`). On the kit sheet, buildings stand in 5 inspection rows; terraced bench topography, street canopies, and shoreline reedbeds arrive when `TBK` is hosted on Sfenops (`1282, 663`) and Liikofi (`1316, 797`).

6. **[Kit / Archival Geometry — Stage 2 polish] Curvilinear Secessionist *pishtaq* and loggia openings (`b2-raichle-palace-loggia.png`) use stepped rectilinear corbels rather than multi-segment trilobed / horseshoe extrusions.**
   - *Owner:* Kit geometry polish pass. `tbPishtaqPortal` and `tbRecessedLoggia` approximate sinuous Hungarian-Secessionist / Moorish keyhole arches with stepped corbelled shoulders to hold per-site triangle budgets (`heaviest 18,684` vs `140,000` cap); custom lathe/extrude arch rings on landmark portals would close the silhouette gap to `b2`.

7. **[Shader / Material — Stage 2 `M1` iridescence] Eosin/Zsolnay pyrogranite glazes (`b1`, `b3`) exhibit view-angle golden-green metallic iridescence beyond isotropic dielectric roughness.**
   - *Owner:* `core/materials` / Godot 4 shader port. `27v-tb-vstack.js` (`M2` mip-roughness AA + `M3` POM) captures sharp low-roughness ceramic highlights without shimmer, while full thin-film / clearcoat iridescence belongs to Godot `StandardMaterial3D` clearcoat/iridescence in Stage 4.

8. **[Kit / Life Layer — Stage 3 settlement integration] Courtyards, *ayvans*, and *souq* arcades have static furniture (`279` pieces) and flapping silk banners, but no citizens, pack beetles, or bazaar awnings moving on schedules.**
   - *Owner:* Settlement life layer (`core/charactermodels` + `core/city` schedules). Banners, water channels (`12` `core/water` flows), and windmills animate on the kit sheet; East Abyssal townsfolk and Ahedman guards arrive in settlement builds.

9. **[Atmosphere / Sky — `core/engine/90-scene.js` + Stage 4 Godot] Standard kit-sheet sky dome lacks salt-haze horizon layering and distant East Abyss rim cliffs.**
   - *Owner:* Open-world / Godot `PhysicalSkyMaterial` (`VISUAL-BAR.md` §6). The kit sheet uses `core/engine`'s standard sky and sun rig so material albedo and shadow chroma stay comparable across kits.

10. **[Kit — `40-tb-kit.js` / `kits/crops` Stage 3] Orchard and courtyard beds use geometric canopy crowns rather than full wind-swaying `biomes/` species cards.**
    - *Owner:* Settlement host (`core/city` + `biomes/`). Building-kit sheets stay insulated from biome flora kits (`check_insulation.py`); when `TBK` is placed in Sfenops or Mungo, `core/world` streams full biome palms, *lac*-host trees, and salt-marsh flora around every courtyard.

---

## 2. `VISUAL-BAR.md` §7 Rubric Scores (Post-Delta Pass)

| Row | Score (/10) | Assessment on `dist/tabisti.html` | Single Change for +2 Points |
|---|---:|---|---|
| **Terrain and geology** | **5** | Flat kit-sheet salt pan with dual-octave Voronoi albedo breakup (`tb_ground_breakup`) and `M4` ground contact AO halos around all 50 plinths; no topographic relief by kit-sheet convention | Host `TBK` on Sfenops's stepped alkaline salt-lake bench (`1282, 663`) via `core/world` + `core/coast` |
| **Buildings up close** | **8** | Vented mosaic plinths with iron undercroft grilles, banded/hazarbaf relief medallions, carved *ustun* muqarnas capitals, sheltered *ganch* lacework, verdigris leaf-scale columns, *trencadís* lanterns, and *escata* spires; `0` blank walls inside 10 m and `0` z-fights | Extrude curved horseshoe / Secessionist keyhole arch voussoirs on `tbPishtaqPortal` and `tbRecessedLoggia` (`b2`) |
| **Tree and plant fidelity** | **5** | Stylized geometric courtyard shade crowns on peri-urban estates (`tb_orchard_estate`); kit sheet intentionally omits biome alpha-card flora | Replace placeholder crowns with streamed `biomes/` *lac*-host & salt-cedar trees on settlement lots |
| **Variety and clumping** | **8** | 50 distinct silhouettes across 5 functional rows, polychrome `zsolnay`/`escata`/`cobalt` roofs, `K1` per-instance FNV-1a hue/value/roughness breakup, and varied wind-tower / lantern / spire crowns | Add weathered salt-efflorescence vertex masks along the lower 0.6 m of lakeside dock & dyehouse plinths |
| **Ground detail density** | **7** | Raised mosaic-paved plinths, stepped rosebrick/kashi stair cheeks, outdoor bazaar stalls, evaporative *shadirvan* curbs, and drying racks occupy near-camera ground around every building | Scatter salt-pan cobbles, reed mats, and ceramic shard drains along row walkways on the sheet |
| **Light transport** | **8** | Sky-tinted hemisphere fill (zero grey/black shadows), `KROOMLIGHT` analytical portal daylight attenuation across `112` registered rooms/ayvans (`0` light in dark fungus vaults), and `M4` ground AO | Add warm bounce tint under crimson `abyss-lac` *kundal* soffits in `KROOMLIGHT` |
| **Atmosphere and sky** | **7** | Standard Krator sky rig with clear solar azimuth, `nightSet(true)` oil/candle/brazier glow (`0` domestic electricity), and clean horizon fog | Wire per-hour monsoon humidity & golden-hour colour script via `core/atmos` in settlement builds |
| **Distance fidelity** | **8** | Wind-chimneys, twin temple/palace minarets, *escata* cones, and polychrome ceramic roofs hold crisp silhouettes from `Overview` (`220 m`+) with `M2` mip-roughness AA preventing glaze sparkle | Bake `KSHELL` far-tier shells (`core/shell`) for Sfenops & Liikofi skyline views at `1–4 km` |
| **Water** | **8** | `28` turquoise-tiled evaporative *shadirvan* basins and `12` flowing `core/water` canals/dock channels with clean curb terminations (`water-mouths` report: `0` open mouths) | Add animated fountain-jet ripple rings around `tbShadirvanPool` crystal nozzles |
| **Motion** | **7** | Animated `SV_CLOTH` silk banners & *velarium* awnings, `12` flowing `core/water` streams, and rotating grist-windmill sails | Populate courtyards and *souq* arcades with scheduled `eastabyss` citizens & *Ahedman* guards (`core/charactermodels`) |
| **Colour script and composition** | **8** | Signature alkaline-teal (`kashi`/`zsolnay`), sun-baked buff/rosebrick, white sheltered *ganch*, amber *escata*, and crimson/gold Liikofi `abyss-lac` read immediately in `Opening` and hero views | Compose dedicated dawn (`t=6.5`) and monsoon-dusk (`t=17.5`) showcase presets once hosted on `core/atmos` |
| **Performance** | **9** | `673,199 / 3,600,000` final tris (`18.7%`), `60 / 240` draw calls (`25%`), `22 <= 28` programs, `5 / 15` max samplers, `182.9 / 340 MB` VRAM, `1.31 MB` HTML | Merge static `f_*` furniture detail atlases per culture if multi-kit settlement scenes exceed 150 draw calls |
