# kits/scyvoi: known issues

`build.py` prints the open ones (`- [ ]`) after every build.

## Textures

- [x] The owner's twenty further sheets (2026-10-05) are processed (`tools/textures/batches/scyvoi.json`) and in use: the six
      that first came inline (rosettes, flame zellige, fire-bloom, the two kilims), five tile sheets, the celestial giant, and six
      single-panel medallions (the salamander on the chief's dais, blades in the appliqué tent, the moon in the shaman's hut,
      cloud in the great ger, star in the bell tent, sun in the pavilion). `tile-lattice-*`, `tile-lotus-cross`,
      `zellige-lotus-teal` are in the library for other builds; the kit does not use them yet.
- [ ] The page is 11.2 MB, most of it the inlined texture pack (37 families). If it needs to be lighter, drop `size` to 256
      on the small-use families in `materials.json` and repack.
- [x] The goat-hair cloth (`library/cloth.tent.black`) and the indigo appliqué (`patterns/scyvoi/applique-blue`, `.b`) came
      2026-10-05: the black tents and the appliqué tent's panels (alternating the two sheets) use them.

## Geometry

- [x] Cushions read as boxes (2026-10-05): the catalog core gained `F.pillow` and `F.bolster`; the Scyvoi cushions, toshaks,
      bolsters and bedding are rebuilt with them, and the furniture takes library detail maps (materials.json `f_*`, projected
      triplanar in 91f-furnish.js). Furniture is now about 560k triangles on the sheet (it was 300k): the soft pieces and the
      tassels. A world that places many tents should lower `KratorFurniture.setDetail`.
- [x] The chief's celestial lining swirled: lathe UVs were arc length per ring, which shears on a cone. Roofs are now unrolled
      (30-geo.js `lathe`, one radial seam). The well's apron z-fought the court paving: lifted 4 cm.

- [ ] The Baelu's cell doors and windows are dark panels, not openings; its cells have no interiors yet (the kits/interiors
      planner could take a Baelu set: stables, stores, cells, the gatehouse).
- [ ] Shadows ignore the cut-away (the cut tents stop casting while it is on, so the interiors are lit by the sky).
- [x] The salamanders moved to `kits/fauna` (2026-10-06), with the goats: parts turn there (legs, head, tail; idle, graze, walk,
      rest). Rigid parts, no skinning: `kits/fauna/KNOWN_ISSUES.md`.
- [ ] The kit sheet stands on flat ground; the crater drylands' flora (biomes/crater-drylands, not yet on main) is not placed.

## The split (2026-10-07)

- [x] `tkPavilion` drew its lining OUTSIDE the walls (the wall normal's sign was flipped), so the Saharan pavilion showed its arch lining outside and its felt scroll inside. Fixed in `40-tk-tentkit.js` (the pavilion has since gone to kits/desert-nomads, which vendors the fix).
- [x] The engine took a `KIT` record (`26k-kit.js`) so the Desert and Ash Nomads kits vendor its fragments unchanged; the page's behaviour is the same.
- [x] The Tibetan tents' roofs were the dense blue appliqué sheet (`patApp`). Fixed 2026-10-14: they take the owner's white roof sewn with large blue knots (`patRoof`, `patterns/scyvoi/applique-roof`); `patApp` stays on the yurt-hall's walls.

## Shared code touched

- [x] core/tags' vocabulary took the Scyvoi culture (`52-core-tags-vocab.js`, `test-tags.js`: 19 cultures, export digest
      2670333f). Every build that bundles core/tags embeds the vocabulary: their pages differ by that text until rebuilt.

## Host port (2026-10-18): the engine on core/host

The engine's own `92-camera.js` (orbit, WASD, walk, hover inspector, polygon tool, cut-away and night buttons, the frame
loop) and `91-probe.js` (`window._api`) are gone; the camera, loop, panel, polygon tool and probe are core/host's
(`CORE_HOST = khost.SHELL + ['94-host-polytool.js']` in `build.py`). Two fragments replace them: `92-world.js` (`buildWorld()`
and `VIEWS`, before `93-anim.js`, which reads the smoke sources the build records) and `99-host-take.js` (`KHOST.take`: views,
inspector words, controls, the engine's frame work, the probe's fields; it must sort after core/host's `95-host-probe.js`).
The kits' `00-head.html` lost the engine's own `#ui`, `#cap`, `#hud`, `#insp` and `#poly` (the host's panel makes its own).
Proof: every `verify.py --assert` unchanged in all seven kits; chrome-hidden shots (`?t=4`, every sixth view plus the cut-away
and night) identical to the old pages' pixel for pixel, bar the night's lamp flicker and Islanders' animated sea (both also
differ between two runs of the old page). The committed pages were already behind their sources (core/atmos and the fauna
bundle had moved), so the baseline is a rebuild of the unchanged sources, and the hash baseline moves for these pages for
that reason too.

What the old pieces did and what the host does:

| Engine | core/host | Difference kept or lost |
|---|---|---|
| orbit `ctl` (theta from +z, phi from +y, radius), `setView` | `90-host-camera.js`, same convention to the bit | none; floor `clear:.4`, zoom `minR:1`, `maxR:2500` as before |
| WASD pans the target at 0.6 x radius | same speed; Q / E down / up, Shift x3.4, Ctrl slower | Shift and Ctrl are new on the orbit |
| walk (F): 4 m/s, feet on `terrainH`, Q / E fly | host walk (F; 9 m/s, wheel sets speed), from the pin when there is one | faster; Zeijani's walk map is passed as `walk: KWALK` with `walker {step .6, r .3, h 1.7}`; its R run key and its own marker (double-click, G) are the host's pin now |
| hover inspector (T), HTML card | click inspector in `#insp` (`o.inspect`), plain text | **the hover tip is gone** (the host's I-tip belongs to `FULL`); the cut-away filter on hits is kept |
| polygon tool (P): `[x,z]` or `{x,z,y}` | `94-host-polytool.js`: Polygon and Path buttons in the inspector panel; a ring of `[x,y,z]` | **format changed**; `window._poly` is now `window.POLYTOOL` |
| HUD (cam, calls, tris, records, furniture) | `#stats` with `o.stats` | same facts |
| `FRAME_HOOKS(dt, now)` | `KHOST.on(..., 'view')`, after the camera is placed (the engine ran them after `applyCam`), `dt` = the host clock's | pause and the speed buttons now slow the engine's animation; `?t=` still pins `ANIM.t` |
| sun box on the target, `skyCam`, `atmosFrame`, two-pass draw | the same work in that subscriber and `o.draw` | none |
| `91n-night.js`: `nightSet`, N key | unchanged; N is `o.keys`, the button a `controls` entry painted each frame | none. The sky hour stays the engine's (`?hour=`, `SKY.hour`): no hour slider (no `sky.hour`), the host clock's hour is unused |
| `cutSet`, C key, Shadows button | same, as `controls` / `o.keys` | none |
| `91-probe.js` fields | `o.api` (`ENGINE_API`); the host adds `BUDGET`, `typeStats`, `regOccupancy` (empty: no `o.registry`, the engine's `REG` records carry boxes, not cylinders), `views()`, `go()`, `clock()` | `_api.REG` is still the engine's record list |
| `99-tail.html` | unchanged (it only closes the script) | none |

Takers: Islanders, Lizardmen, Desert Nomads and Ash Nomads vendor `92-world.js` and `99-host-take.js` with the rest (their
copies of the engine files were identical to the engine's; Lizardmen's vendor source is Islanders); Resources reads them in
place. **Zeijani** is a fork, not a vendor: it had its own `91-probe.js`, `92-camera.js`, `90-scene.js`, `91f-furnish.js`,
`27-mat.js` and `93-anim.js`. Its `92-camera.js` is gone; its `99-host-take.js` is this one with its names (`ZJF`, `ZJTAGS`,
`ZJ_LIFE`, `ZJ_CUT`), the interiors' furniture records in the inspector and `walk: KWALK`; its `91-probe.js` keeps the cavern
and walk-map checks and hands the host `ZJ_API` (it used to assign `window._api`). No taker overrides `91n-night.js` or
`99-tail.html`. Nothing in core/host was changed.

- [ ] The hover tip (T) and the polygon tool's `[x,z]` output are not carried over; if the kits want the tip, take `host.FULL`'s inspector (`93-host-inspect.js`) and give it the engine's `regAt` / `furnAt` words.
