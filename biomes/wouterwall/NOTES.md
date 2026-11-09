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
