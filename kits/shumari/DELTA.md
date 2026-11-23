# Shumari Building Kit (`kits/shumari`) — Visual Delta Audit (Phase SM6)

Closed per `VISUAL-BAR.md` §§4–8 and `kits/shumari/PLAN.md` §8 against the three reference plates in `kits/shumari/refs/`.

## 1. Reference Plates & Repeatable Acceptance Frames

| Reference Plate | Closest Sheet View (`verify.py --views`) | Subject |
|---|---|---|
| `refs/01-mamluk-carved-dome-ablaq.png` | `Carved qubba dome` | Pointed high-shouldered Cairene carved stone dome, epigraphic drum collar, 12-window clerestory, stepped Turkish-triangle *muqarnas* zone of transition, `1-over-2` *qamariyya* oculi, and coursed *ablaq* masonry (`sm_regiment_qubba` `v=1`) |
| `refs/02-mamluk-spiral-dome-minaret.png` | `Spiral qubba and pishtaq` & `Citadel and Payaru minaret` | Convex 3D spiral-gadrooned pointed Mamluk dome (`hand = +1` on `sm_regiment_qubba` `v=0`, `hand = -1` on `sm_doriyan_stele`), 3-sphere cast-bronze *jamur* finial, and two-balcony polygonal *muqarnas* watch-minaret (`sm_payaru_tower`) |
| `refs/03-mamluk-pishtaq-twin-domes.png` | `Domes of the Subaru-su` & `Gorge street under the qubba` | Twin carved Mamluk domes over a *waqf* sanctuary (`sm_hall_of_blades`), monumental `4.4 m` Free Giant *pishtaq* portal with concave *muqarnas* conch, `Šumaru-kattu` lintel (`frieze_kattu`), and stepped gorge-rim street (`sm_gorge_street`) |

- **Ground-level acceptance frame:** `Gorge street under the qubba`
- **Vista acceptance frame:** `Domes of the Subaru-su`
- **Ablation switch (`VISUAL-BAR.md` §5):** Append `?sm6=0` (`SM_SM6 = false` in `src/26k-kit.js` / `src/90s-sm-ground.js`) to shoot pre-SM6 geometry, material metalness, and bare sheet ground from the exact same camera poses:
  ```bash
  PW_CHROMIUM=/usr/bin/chromium /home/antigravity/.venv/bin/python kits/shumari/verify.py \
    --views "Gorge street under the qubba|Domes of the Subaru-su|Spiral qubba and pishtaq|Carved qubba dome|Citadel and Payaru minaret|Copper stills and lake jetty" \
    --out /tmp/sm_after
  PW_CHROMIUM=/usr/bin/chromium /home/antigravity/.venv/bin/python kits/shumari/verify.py \
    --query sm6=0 \
    --views "Gorge street under the qubba|Domes of the Subaru-su|Spiral qubba and pishtaq|Carved qubba dome|Citadel and Payaru minaret|Copper stills and lake jetty" \
    --out /tmp/sm_before
  ```

---

## 2. Top 10 Ranked Visual Deltas vs `refs/01..03`

1. ~~**[SM6 — Fixed] Opaque basalt collision piers occluding `jali` screens and lit `svPane` windows across all 59 buildings.**~~
   - *Before:* `smAblaqWall` emitted opaque `box('basalt')` collision slabs right across window cutouts, turning pierced stone *jali* screens and interior lit panes into solid dark rectangles at mid/close range.
   - *Fix (`src/40-sm-kit.js`):* Replaced mesh collision slabs with `smWalkPier` (`KWALKBOX.add` directly without emitting triangles). Every `jali` lattice and warm `svPane` glows cleanly across all 60 sites while keeping `KWALK` wall-blocking identical (`walk-reach` 60/60).
2. ~~**[SM6 — Fixed] Inside-out `prism()` corners on `smDrum` and inward-facing normals (`flip` / `up` missing) on spiral domes, awnings, and sloped roofs.**~~
   - *Before:* Clockwise corner outlines on `smDrum` produced inside-out triangles (`winding` holes on drum shoulders in `Domes of the Subaru-su`), and `psurf` calls on `smDome` (`style: 'spiral'`), barrel-vault cellars, and sloped slate/kilim roofs lacked `flip: true` / `up: true`, causing back-face culling of outer spiral gadroons and roof slopes.
   - *Fix (`src/41-sm-dome.js`, `50`, `51`, `60`, `64`, `65`, `66`):* Replaced `prism` corners with 4-tier outward-normal stepped *muqarnas* corbel blocks + `svWell` base roof curb (`winding: 57 geometries, none inside-out`), added `flip: true` + deeper convex ribs + `capFrac = 0.965` profiled necking ring on `smDome`, and set `up: true` / `flip: true` on all sloped roof/vault `psurf`s.
3. ~~**[SM6 — Fixed] Flat recess in `smPishtaq` vs concave tiered *muqarnas* portal hood, colonnette capitals, and spandrel *buqja* bosses in `refs/01` & `refs/03`.**~~
   - *Before:* `smPishtaq` used a flat stepped corbel band inside the portal hood and plain jamb shafts without capitals or spandrel medallions.
   - *Fix (`src/40-sm-kit.js`):* Added concave multi-tier `smMuqarnasConch`, flared bell capitals with bronze necking rings on corner and jamb colonnettes, and carved stone-and-gold *buqja* spandrel medallions (`medallions: SM_SM6`).
4. **[`PROMPTS-NEEDED.md` §59 — Queued Asset] Dedicated deep-relief Cairene star-and-arabesque stone normal/albedo sheet (`stone.dome.mamluk`).**
   - *Current state:* `domeCarved` pairs `stone.stucco.yeseria` (`tile: 2.2`) with 3D `chiselled` strapwork tubes, 3 horizontal interlace rings, and two tiers of carved star-boss medallions (`00-Carved_qubba_dome.png`). Looks convincing from `>= 8 m`, but lacks crisp incised highland travertine toolmarks inside 5 m until `stone.dome.mamluk` is generated.
5. ~~**[SM6 — Fixed] Single-balcony `sm_payaru_tower` and smooth unbanded citadel bastions vs `refs/02`.**~~
   - *Before:* `sm_payaru_tower` jumped straight from octagonal base to top lantern with one balcony, and `sm_citadel_keep` / `sm_pishtaq_gate` corner bastions were single unbanded basalt cylinders.
   - *Fix (`src/62-sm-defence.js`):* Added 12 engaged travertine colonnettes around tier 2 and a second intermediate *muqarnas*-corbelled *jali* watch-balcony on `sm_payaru_tower`, plus coursed basalt/*ablaq* bands, splayed arrow slits, and *muqarnas* parapet collars on citadel/gate bastions.
6. ~~**[SM6 — Fixed] Blackened metallic response on `bronzeCast`, `bronze`, `gold`, `tracery`, and `iron` under r128 directional sun + over-teal `bathLens` dome.**~~
   - *Before:* High `metalness` (`0.58–0.88`) without an HDRI environment probe turned *jamur* finials, *sabil* grilles, and copper stills near-black; `card.tracery.bronze` rendered its whole 3x3 card sheet across *sabil* openings; and `bathLens` (`keep: 0.55`) read bright turquoise on `sm_hammam`.
   - *Fix (`src/28-sm-mat.js`, `src/40-sm-kit.js`, `materials.json` + `pack.py`):* Tuned preview `metalness` to `0.26–0.32` with warm burnished `roughness` (`0.32–0.50`), cropped `tracery` to the single pointed-arch cell `[0.365, 0.325, 0.635, 0.668]`, and repacked `bathLens` at `keep: 0.14, mean: 0.76` with carved `chiselled`/bronze oculus collars (`smBathDome`).
7. ~~**[SM6 — Fixed] Bare sand-textured engine ground plane between kit rows in acceptance frames (`VISUAL-BAR.md` §2A).**~~
   - *Before:* Bare `ground` plane filled the foreground of `Domes of the Subaru-su` and row lanes.
   - *Fix (`src/90s-sm-ground.js`):* Added dressed basalt kerb aprons, highland cobble/flagstone site pads, and continuous basalt-bordered flagstone row promenades across all 9 sheet rows (`SM_SM6`).
8. **[`PROMPTS-NEEDED.md` §59 — Queued Asset] Pierced notched-blade stone window grille (`stone.jali.blade`) and coursed basalt *ablaq* sheet (`masonry.ablaq.basalt`).**
   - *Current state:* Windows use `patterns/common/jali-diamond` and walls build per-course *ablaq* geometry (`stone.basalt.polished` + `stone.travertine` + `rock.limestone.ironstained`, plus 6-course basalt relief in `mode: 'basalt'`). Per-course geometry gives crisp close-range silhouettes; `stone.jali.blade` will upgrade window filigree from generic diamond to Shumari blade-and-star *qamariyya*.
9. ~~**[SM6 — Fixed] Camera occlusion on `Copper stills and lake jetty` preset view.**~~
   - *Before:* Eye at `still.x - 10.5` placed the neighbouring `sm_charcoal_kiln` hut across the left half of the frame, hiding the copper alembics.
   - *Fix (`src/92s-sm-views.js`):* Moved camera to `still.x + 12.5, 5.2, still.z + 12.8`, framing both riveted copper alembics, the basalt condenser trough, and `sm_lake_jetty`'s skiff slipway unobstructed.
10. **[`openworld/shumar-*` & `settlements/shumar` — Downstream Phase] Real canyon-lip topography, flowing snowmelt water, and distant *Subaru-yama* skyline.**
    - *Current state:* As a flat kit catalog sheet (`core/engine`), `dist/shumari.html` sits on `y = 0` with `core/atmos/placeholder` (`81-sky.js`). The real `3,308 m` gorge lip, `WATER.flow` canyon torrents, and `4,426 m` ramp already run in `biomes/shighlands` (`--station shumar` / `--station ordeal`) and will host `SMK` in `openworld/shumar-north`, `openworld/shumar-south`, and `settlements/shumar`.

---

## 3. Measured Gates Summary (`VISUAL-BAR.md` §4)

- **Shadow colour:** `core/atmos` skylight + warm `1.06 atm` hemisphere fill (`sky 0x8fb6dc`, `ground 0x8a7d68` in `90-scene.js`) keeps shadowed basalt and travertine chromatic (cool slate-blue in sky-facing shade, warm ochre bounce under *pishtaq* vaults; zero grey/black ambient crush).
- **Bare ground:** On `Gorge street under the qubba`, stepped *ishigaki* basalt paving, kerbs, and plinths cover `> 95%` of the near third of the frame; row promenades (`90s-sm-ground.js`) eliminate bare sheet gaps along the street axis.
- **Tiling & variation:** Per-course `P()` palette jitter (`SVPAL`), 6-course basalt relief (`smAblaqCourse`), `variants: 2` on 7 town-fabric defs (`sm_regiment_qubba`, `sm_cadet_cell`, `sm_hearth_house`, `sm_terrace_house`, `sm_shop_house`, `sm_sword_villa`, `sm_bazaar_hall`), and per-instance `KRAND` flora jitter break mid-range repetition.
- **Performance & geometry gates (`verify.py --assert`):** `1,199,854 / 1,900,000` tris (`1,775,933` with `?interiors=1`), `119 / 240` draw calls (`137` with `?interiors=1`), `57` geometries `0` inside-out, `60/60` sites walked cleanly.

---

## 4. `VISUAL-BAR.md` §7 Rubric (Post-SM6 Kit Sheet)

Anchors: **10** passes a 1-second glance against `refs/01..03` at 1080p; **7** is clearly synthetic but the same class of image; **4** is a good hobby demo.

| Row | Score | Assessment on `dist/shumari.html` | One change to raise by +2 points (and owner phase) |
|---|---:|---|---|
| **Terrain and geology** | **5** | Kit sheet uses `core/engine` flat row aprons + stepped *ishigaki* podium on `sm_gorge_street` by design (`PLAN.md` §6). | Mount `SMK` onto `WORLD.H` carved basalt canyon ledges and `core/terrain` cliff overhangs (`settlements/shumar`). |
| **Buildings up close** | **8** | Coursed *ablaq* & 6-course basalt relief, concave *muqarnas* conches, flared colonnette capitals, *buqja* bosses, unblocked *jali* screens, `4.4 m` Giant *pishtaq* doors, and outward-normal spiral/carved Mamluk domes. | Land `stone.dome.mamluk` and `stone.jali.blade` from `PROMPTS-NEEDED.md` §59 (`SM-tex`). |
| **Tree and plant fidelity** | **7** | Reads `biomes/shighlands` Station 4 (`shumar`) species in place (`ropepine`, `coiljuniper`, `helixpoplar`, `whorlapricot`, `spiralsage`, `ichu`: 62 trees, 299 shrubs/tufts). | Add courtyard espaliered `whorlapricot` and wind-pruned rim `ropepine` hero specimens inside walled *bayt* courts (`settlements/shumar`). |
| **Variety and clumping** | **7** | Flora clumps by moisture/elevation rules from Station 4; 7 repeat-heavy building defs carry `variants: 2` (`#spiral`/`#carved`, *ablaq*/basalt, right/left porches, crimson/gold awnings). | Add weathered mortar/soot decal breakup (`KMAT` macro mask) across contiguous street terraces (`settlements/shumar`). |
| **Ground detail density** | **7** | Dressed basalt kerbs, cobble/flagstone site pads, and paved row promenades (`90s-sm-ground.js`) plus `ichu` / `spiralsage` ground cover in the northern strip. | Scatter `core/lod` basalt talus cobbles, fallen poplar leaves, and threshold wear inside 10 m on canyon streets (`settlements/shumar`). |
| **Light transport** | **7** | `ATMOS.skylight` + tinted hemisphere bounce + warm `svPane` interior glow through pierced `jali` screens and `25` flame/brazier halos (`N` night mode). | Export to Godot 4 SDFGI + sky-based SSIL (`core/export` verified via `93e-sm-export.js`). |
| **Atmosphere and sky** | **6** | Crisp `1.06 atm` highland sky dome (`core/atmos/placeholder` `81-sky.js`) with sun/night toggle (`N`). | Switch to full `core/atmos` per-hour highland colour script and valley dust haze on the settlement/open-world pages (`openworld/shumar-*`). |
| **Distance fidelity** | **6** | Clean dome/minaret/bastion silhouettes across the 200 m sheet; horizon is flat kit-sheet ground. | Frame the kit against the real `1:1` *Subaru-yama* `4,426 m` ramp and *Ṣīru-Yāmu* basin (`openworld/shumar-north` & `shumar-south`). |
| **Water** | **6** | Architectural water basins in `sm_sabil_shrine`, `sm_courtyard_house`, `sm_caravanserai`, and `sm_placer_sluice` sluice troughs. | Pair `sm_watermill`, `sm_fulling_mill`, and `sm_lake_jetty` with live `WATER.flow` canyon snowmelt and `KCOAST` lake shores (`settlements/shumar`). |
| **Motion** | **7** | Vertex-swaying crimson/gold regiment banners (`withCloth`), chimney/kiln/still smoke columns (`smokeAt`), flickering Eternal Regiment braziers, and swaying highland flora. | Add `core/charactermodels` Shumari citizens and `3.6 m` Free Giant officers walking `KCITY` schedules (`settlements/shumar`). |
| **Colour script and composition** | **8** | Disciplined volcanic blue-black basalt, warm highland travertine, ironstone ochre, crimson lacquer, and burnished bronze across all 13 preset views. | Add golden-hour (`17:00`) and dawn (`06:00`) preset lighting sweeps on the canyon-lip vista (`settlements/shumar`). |
| **Performance** | **9** | `1.20M / 1.90M` tris, `119 / 240` draw calls (`1.78M` tris, `137` calls with `?interiors=1`), `5 / 16` max samplers, `1.86 MB` page. | Add `KSHELL` / `core/lod` far-tier shells when placing `300+` buildings in `settlements/shumar`. |
