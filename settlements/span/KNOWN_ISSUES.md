# Span: known issues

## The page (SP3, 2026-10-27)

- [ ] **The ground is a stand-in**: `SPAN.groundAt`, the layout's own section, meshed on a grid. The bay's oval walls and the
      canyon head are faceted at 6 m; there is no strata shading (a red or bleached bed every ~14 m by vertex colour) and no
      flora. It is replaced by the SW highlands station's carve (core/terrain `KRELIEF.rille`/`pit`, `KSTRATA` `pillar`,
      `KCARVE` for the cuts) when that lands: PLAN.md section 5.
- [ ] **No water**: the lake is a dry bed, the river, the falls and the sluices carry nothing. The water is the biome kit's
      (core/water); the page takes it with the station.
- [x] ~~Dalab's buildings are boxes~~: SP4 (2026-10-27) places the Dalab set's own buildings (settlements/dalab, read in
      place) through `VERN.place`: the market, customs, two warehouses, two inns, the tavern, the bath house, the traders'
      houses and row, two orchards, the caravan yard, the shrine, the mound and the watch tower at the Middle Bridge.
- [x] ~~The Line has no Dalab def~~: it is the Post-Apoc kit's `barricade` (2026-10-27), kept shut; Dalab's gates and banners are
      the Dalab set's `dalab_gate` and `dalab_banners`.
- [ ] **No Dalab culture pack for the Post-Apoc kit's sockets**: the barricade's gate, the arena and the highlanders' houses fly
      the kit's generic marks; Dalab's red on them waits on a `dalab` pack in `core/sockets/80-cultures.js`, which reaches eight
      builds (its `mkCulture` draws from the shared stream at load): parked in `TODO.md` for the next all-builds rebuild. The
      highlanders' own pack waits on who they are.
- [ ] **The page now carries the Post-Apoc kit, the catalog's furniture and the interiors core** (closures, ~0.9 MB) and draws
      ~1.36 M triangles at the arena: core/lod is still to come.
- [ ] **No garden trees or plants in the Dalab buildings**: the set asks the page for them (`dnTree`, `dnPlant`), and this
      page answers nothing (`src/69f-host-dalab.js`) until the SW highlands kit's flora is on it; the orchards stand empty.
- [ ] **Dalab's patches on the held Ancient parts** are the kit's generic decay-3 `repairPass` (corrugate, timber, tarp), with
      Dalab's gates and banners now set at the openings and on the roofs; no lamps yet (no night on this page).
- [ ] The Dalab set runs on its own copies of Iziz's Vernacular helpers (`69b`, `69c`), which drift from `settlements/iziz`;
      Span reads Dalab's, as the set is tested against them. Its `vWorldUV` replaces core/materials' opt-in one on this page
      (no fragment here calls the latter's third argument).
- [ ] **Stand-ins drawn by the page** where no builder exists yet: the hangars' fronts (a concrete fill to the bench, a door,
      two piers), the tanks (a lathe and hoops), the works (boxes), the bridges (a deck and two girders), the Pipe Bridge
      (sagging pipes and a ball per payload, until `kits/ancients` 63-canyon's `HANG` is read in), the wrecks and the service
      ledges. Each is a candidate for a builder in `kits/ancients/targets/span` (SP2's pattern) or an existing kit type.
- [ ] **The basin portal's and the Valley portal's stage rock** is the builder's own (`spanRock`) set into the stand-in
      ground's cut; with the station's carve the portals take `KCARVE.cut` faces instead.
- [ ] **No core/lod, core/walk, core/export or night** yet: the page draws everything at full detail (0.9 M triangles at the
      overview), walks on the ground only (no KWALK floors on the galleries or the Cross), exports nothing, and has no
      night state (`NIGHT` stays false). PLAN.md section 7.
- [ ] The Cross's zones (S4) are records only: no rooms are drawn until SP6.
- [ ] **The pillar rim is a stand-in** (SP5) until SW highlands station 4 lands: the rim's cliff is the stand-in ground's sheer
      wall at u 1300 (one plane, banded by the strata shader), and the five pillars are the page's own KSTACKS bodies. The
      contour (a wandering profile, joints, a split crown) is a page pass on the drawn mesh (`8at-host-place.js` `contour`),
      like `KSTACKS.weather`: KSTACKS' records keep the uncontoured body, so `KSTACKS.at` and `topAt` answer for the record
      (the post's top is kept whole, so its check holds). Lift it into KSTACKS as an opt-in (a pillar `contour` option or a
      weather term) when the station needs it. The beds still read as rounded cushions at the partings (the recipe's soft
      partings notched by `pillar`).
- [ ] **The watch stair is drawn as a helix fitted to the drawn rock**, not on the layout's square line: `SPAN.checks` reads the
      line, the page the drawn treads. The cliff stair is drawn on its line against the stand-in cliff. Neither is walkable
      (no KWALK floors on this page yet).
- [ ] The post's top is the record's flat top inside a weathered rim (the restored vertices stand a little proud of it).
