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
- [ ] **The pillar rim on Span's page is proxies of station 4's site record** (SP5): the station's towers (`L.pillars`) drawn as
      plain KSTACKS bodies at each record's place, foot and top, and the stand-in ground's cliff along the record's rim line
      (a sheer step between 50 m record points, linear). The rock as drawn is the station's: contoured (`KSTACKS.contour`,
      `keep: 12` on the watch pillar) and on its own ground. A world that draws both must re-fit the watch stair (and the cliff
      stair's lanes) to the station's drawn mesh, Pinnacle Rock's rule: on the proxy the treads sit .6 m out from a plain
      wall, where the station's joints and swells move its face by metres.
- [ ] **The cliff and the apron** (station 4): the frame is the record's `canyon`; past and behind the rim's line the ground is
      the record's `ground` field (the table and its cliff as drawn, open slots and all). The drawn table edge stands about 30 m
      in from `rimFine`, so the cliff stair finds the edge in each section (the first 15 m fall under the table 40-80 m in) and
      stands each tread where the drawn face is at its height; head and foot on solid table, slot mouths in the face crossed as
      spans. The field shows a trench 170-225 m deep along the cliff's foot, inside the apron's lip (about 100 m under the
      table): the stair crosses it on a level span to the apron; asked of the station whether it is meant. Off the field
      `L.apron` still falls linearly. The rim road takes the highest of 40-120 m in from the rim's line. The arches are not
      drawn. The rim patch of the page's ground is meshed at 3 m so the drawn cliff matches the 2 m field the stair fits.
- [ ] **The frame's M** (where Span's canyon meets the rim, the site's x -1750) was Span's choice; station 4 now carves Span's
      canyon there and publishes the frame (`canyon`), so a change to it is the station's, and the watch post moves with it.
- [ ] **The watch stair is drawn as a helix fitted to the drawn proxy**, not on the layout's square line: `SPAN.checks` reads the
      line, the page the drawn treads. Neither stair is walkable (no KWALK floors on this page yet). The head's landing runs
      out over the top's chamfered edge.
