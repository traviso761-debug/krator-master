# Span: known issues

## The page (SP3, 2026-10-27)

- [ ] **The ground is a stand-in**: `SPAN.groundAt`, the layout's own section, meshed on a grid. The bay's oval walls and the
      canyon head are faceted at 6 m; there is no strata shading (a red or bleached bed every ~14 m by vertex colour) and no
      flora. It is replaced by the SW highlands station's carve (core/terrain `KRELIEF.rille`/`pit`, `KSTRATA` `pillar`,
      `KCARVE` for the cuts) when that lands: PLAN.md section 5.
- [ ] **No water**: the lake is a dry bed, the river, the falls and the sluices carry nothing. The water is the biome kit's
      (core/water); the page takes it with the station.
- [ ] **Dalab's buildings are boxes** (the trading post, the Line, the mound, the shrine): SP4 takes the Dalab set
      (`settlements/dalab`, read in place).
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
