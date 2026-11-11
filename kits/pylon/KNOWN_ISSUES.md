# kits/pylon: known issues

`build.py` prints the open ones (`- [ ]`) on every build.

- [x] No `materials.json` yet. **2026-10-18:** `materials.json` binds `pyConc` to `concrete.board` (src/88yp-pyl-matlib.js,
      packed into tex/); the hex tile, hex grille and worn orange render were owed in core/materials/PROMPTS-NEEDED.md.
- [x] **Delivered and wired 2026-10-18** (owner-tex2b batch): `pyHexTile` (tile.hex.ceramic, grey, tinted by the instance
      colour: the hex villa's court and the palace forecourt, `pynHexPave`) and `pyGrille` (patterns/pylon/hex-grille, a
      full-colour alpha card: the hex villa's porthole grilles, `pynPortCluster(..., true)`; the flat panel `pynGrille` is
      ready; `pyGrilleD`, the porthole's disc, takes the same family by alias). The worn orange render went to Talia
      (`taRenderW`). With `?mat=proc` the old slab and six radial bars draw.
- [ ] The Ancients' hex-lattice dome (the palace's great dome and pavilion caps: `acLatticeDome`, the Ancients core's) is
      geometry, not a card, so the hex grille is not on it; the hex pods' glazing, and the other courts (`vnPaving`
      flags) stay on the Vernacular's flags.
- [ ] The folk house's balcony front is a scalloped wall in 15 straight segments, not a curve; it reads as a curve from
      the street, but steps show close up.
- [ ] `verify.py --assert` passes every invariant but ends FAILED on `WebGL: CONTEXT_LOST_WEBGL` in the console: the
      same as Iziz's own pages (settlements/iziz/KNOWN_ISSUES.md, 2026-10-05; checked on `iziz-vernacular.html`
      2026-10-18, same result). The harness's teardown, not the page.
- [ ] The rich villas' court walls are board-formed concrete in PYPAL.formwork grey; beside the Vernacular's sand they
      read heavy at eye level. A lighter formwork (or white render on the walls) is the owner's call.
- [ ] The hex cells' honeycomb has its plank walks and stair at the back (a front walk would cut the offset pods), so
      from the street the pods show no access.
- [ ] The Monolith is read in place (`kit.json` "external"), but two helpers it needs at load live inside other
      arcologies' builders: `krShard` in the Arcube (all four parts, 93 KB) and `plymQuadGeo` in Plymouth (61 KB). So
      the page carries about 150 KB of builders it never calls. The fix is upstream: move the two helpers into a shared
      fragment in kits/ancients (every Ancients page then rebuilds; check its hashes), and read only that.
- [ ] On the sheet the Monolith's view looks past the edge of the ground plane (Iziz's showcase ground, 3 km); the
      city page will have terrain to the horizon.
- [x] **Real doors and real glass (the owner, 2026-11-03: "remove all dark voids", "actual doors or windows that have
      transparency", doors that open and shut; core/door).** The profiles' glazed fills, portholes, hex pods, the palace's
      lancets, lantern and light courts, the Ancients' slit and punch-card windows are KGLASS's clear pane (`pyPaneB` is
      `MAT.izGlass`, the Vernacular's own; it was the dark glass lifted to an opaque sky grey) or the warm lit pane, over the room
      card; `pynDoorway` hangs real leaves (`IZDOOR.leaf`, records in `KDOOR`): operable on a hollow body, locked on a solid one,
      and the hex villa's court gate opens (`o.gate`, its portal block opened by `pynPierBox`). The Salvagers' Guild's middle bay,
      a blind timber fill, is its door. The sheet before -> after: doors 78 -> 98 (locked 25 -> 39), panes 1870 (1495 of them
      opaque: dark glass and the sky-grey pane) -> 2685 (all transparent), room cards 139 -> 2475; `vDarkB` 29 (the Vernacular's
      furnaces, wells and troughs on the mixed streets) and `vWinGlass` 8 (pools) left. The PY_KIND 'D' is the room card, no
      longer `MAT.void`.
- [ ] The doors' leaves are plain timber (or steel-tinted timber) boxes: the old profile-shaped leaves' seams and pulls are
      gone (they would float when the leaf swings). A 'hex' doorway is pointed at the head only (no door stands in a pointed foot):
      the hex villa's gate lost its lower V.
- [ ] The room card is 69e5's `MAT.izRoom` with its colour converted to linear (`MAT.pyRoomS`): r128 reads a material's hex as
      linear, so `MAT.izRoom` itself (and `KGLASS.material(THREE,'room')`) draws a light beige, not the Vernacular's IZ_ROOMC
      brown. The fix belongs in 69e5 / core/door (Highlands' `hKeelDark` takes `MAT.izRoom` as it is).
- [ ] Many doors stay locked because their bodies are solid on the sheet (no interiors item for the type: the pod stack, the
      vault house, the terrace, the neo villa, the bazaar lane, the clinic, the shrine, the guild, the palace): they open once
      the type is furnished (`kits/interiors/sets/pylon.js`).
- [ ] Reachability (core/walk `KWALK.reach` from four points round each plot on the ground, every unlocked door open; 2026-11-03):
      200 of 244 floors reached, before and after the doors pass (no plot sealed). Unreached: the upper floors of the folk house
      (two rooms of floor 1), the folk villa (floor 1, its stair and the roof pavilion: its interior stair's foot is not met,
      and the porch's `vnStairs` head), the terrace (its flight's head), the block and the school (one upper room each), and the
      Vernacular's mixed-street houses (the same as on the Vernacular's own sheet). Interiors planner stairs and partition
      doorways, not the kit's doors: the next pass is the planner's (`kits/interiors`).
