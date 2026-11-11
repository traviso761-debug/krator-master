# wouterwall — notes

- **Reading another kit in place.** The NW outer wall's layout, species, trees, floor and build are slotted into this page under
  their own names (`build.py`, `NW_KIT`; geyser reads the hyperjungle the same way) and its texture pack is packed beside this kit's.
  Its passes ask `NWOW` for the fields and the zone, so `47-host-land.js` binds `NWOW` to this page's `fieldsAt` and maps each of
  this kit's zones to the nwouterwall zone that grows there (`WOW.ZONES[z].nw`; `none` grows nothing). A change to
  `biomes/nwouterwall/src/` reaches this page: rebuild it with nwouterwall.
- **The 5.1 frame.** The plan's pixels are the 4.22 model's; the 5.1 model added 272 to px and 330 to py. The region here is cut
  from `tools/scale-model/model/data` (5.1), not from a saved page.
- **The relief.** Station 1's landforms are `KRELIEF` records (`38c-core-landforms.js`), composed by hand in `sitePoint` rather
  than by `KRELIEF.apply`, because the terraces must skip a gully's floor, head, wall and rim, and the zones need each record's part.
  The records need the model's ground at construction, so `45-host-stage.js` calls `siteBuild` once `MODEL` exists. This kit is the
  first page on `KRELIEF.gully` and `KRELIEF.terraces`.
- **Insets.** The ground is one `KFIELD` with finer insets: 2 m over each terrace patch, 1 m round the cave houses. Each inset's
  step divides the base's 8 m, so its edge lies on the base's lattice lines; `47` pins the edge to the base's line between lattice
  points and leaves the base mesh's cells under an inset out, so the two meshes meet without a crack. `fieldsAt` takes its gradient
  at the inset's scale (at least 2 m) inside one.
- **The far land.** `region/crest.json` widens the cut past the airless crest. From station 1 it changes nothing: the planet is small
  (R 4,813 km), so the crest 194 km off drops ~3.9 km and sits under the bench's upper steps. Stations 2 and 3 will see it.
- **Stations** (2026-11-10). src/ is the host for every page; a station's `stations/<name>/44s-host-site.js` replaces src/'s site (BIOME-API.md,
  "What the host reads beside the kit"), and its `station.json` names the lowland kits it reads (`"lowlands"`; none given means station 1's
  nwlowlands). A station's region is `region/station-<name>.json` (`region/far.py`'s SITES). Build one with `python build.py --station <name>`,
  every page with `--all`.
- **Reading the lowlands by key.** build.py slots each lowland kit's species and tree builders as `48e*`/`48f*` (after the NW outer wall's,
  before this kit's 50), closes each registry with a one-line kitEnd, and packs only the families its species draw with (`LOWLANDS`). 88k
  grows them with `BIO.kitBuilder` (or `BIO.kin`), drawn once (no runtime LOD: core/biome's LOD audit then reads one kind of card).
- **The kit's registry** is `wouterwall` (50 opens it, 70 closes it with `BIO.kitEnd(WOW)`), so the kit's own functions run in it; the NW
  outer wall's functions run in theirs (do not call `NWOW.place` for this kit's items: it switches to nwouterwall's registry).
