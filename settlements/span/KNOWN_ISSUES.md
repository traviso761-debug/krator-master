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
- [ ] **The Line has no Dalab def**: it is still a salvage wall drawn from the kit's items (plates and concrete blocks).
      A `dalab_line` (a salvage wall with a gate, on the Dalab set's helpers) belongs in `settlements/dalab`'s set.
- [ ] **No garden trees or plants in the Dalab buildings**: the set asks the page for them (`dnTree`, `dnPlant`), and this
      page answers nothing (`src/69f-host-dalab.js`) until the SW highlands kit's flora is on it; the orchards stand empty.
- [ ] **Dalab's patches on the held Ancient parts** are the kit's generic decay-3 `repairPass` (corrugate, timber, tarp);
      no red banners, lamps or Dalab-built gates on the Cross and the Sound Quarter yet (the set's `dnBanner` and `dnGate`
      need a def to run in).
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
