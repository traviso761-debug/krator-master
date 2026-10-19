# Known issues

Open items start with `- [ ]` (build.py prints them after every build). The Port kit's own list is
`settlements/port/KNOWN_ISSUES.md`; shared-fragment problems found from Hook are recorded here, not fixed in the kit
from a Hook task.

## The site and the Ancient town (P1)

- [ ] **No site editor page yet.** `PLAN.md` P1 wants `dist/hook-site.html`, Voth's editor read in place, saving
      `site/hook-site.json`. Voth's editor (`settlements/voth/targets/voth-site`) is written against Voth's scene:
      its tools read `VIEW.surf/pick/ext/sprite/refreshTerrain/ovTex/ovCanvas/mmBase/labels/cantonList/causeways/
      causewayHit`, `TERR.h/delta/dab/sync/n`, `VOTH.SEA/landDist/RLAND/DISTRICTS/CWAY`, `HOSTUI.labels` and the DOM of
      its own `00-head.html`, and save through `settlements/voth/serve.py` (`POST /save/voth-site`). Hook needs an
      adapter that gives those on the Port kit's ground (and `hosts`, `grid` and the quarters' fields, which Voth's
      model does not know). Until then the owner edits `site/hook-site.json` by hand and rebuilds: every quarter's
      polygon, mix, holder, mood, layer and ruin level, the markers, the avenues, the named hosts and the grid's
      numbers are plain JSON, and `verify.py --assert` checks the result (`hook-site-plan`, `hook-hosts-placed`).
- [x] **The ridge and the cliff were ramp stamps** on the kit's flat coast (a plateau with a straight back edge, a dark
      band 1.2 km behind the quays). Since 2026-10-19 the ground is the scale model's (README.md "The ground") and
      both stamps are dropped: the model's slope stands higher than either.
- [ ] **The model has no cliff behind Hook.** The lore's Crag Men escarpment 4 km behind the city is not in the
      4.21 heights: the land climbs a steady 10 % from the shore to the plateau at +740 m, 6 km back, and the
      extractor's `scarpw` is 0 over the cut (it marks the eastern abyss's rim only). The plan's cliff face is
      therefore missing; it is the owner's model edit (`tools/scale-model/edit_heights.py`: a steep cell behind the
      pixel, which the extractor would then mark if the escarpment rule were widened past the abyss) or, later, a
      Hook carve patch on `core/terrain`. The cliff's foot line stands 115 m over the quays all the same.
- [ ] **Hook's pixel is 6.7 km from its waterfront.** The model has Hook's cell 592 m above the Ring Sea (−1,500 m);
      the 1:1 shoreline the open world's rule gives is 6.7 km north of px 537,596, and that is where the kit's origin
      stands. On the model page the cells north and west of the pixel are FLAGGED sea while their ground (−1,128 and
      −1,224 m) lies above the sea's level, so the owner's map shows the pixel on the coast and the 1:1 rule does
      not (53 of the cut's 328 water cells have ground over their level). The owner's call: lower those cells'
      ground under −1,500 (and Hook's cell toward a coastal shelf) in the model, or move the pixel to the shore, or
      accept the offset. Until then the open world's streamed Hook and this page agree with each other, not with the
      marker.
- [ ] **A 10 % slope under the whole site.** Every land block's flat stamp and every host pad cuts a bank into the
      slope (a 110 m block: an 11 m bank at its back); the kit's soft rings blend them. The waterfront reads well
      (the P0 run's verify passes); the town behind will want its streets terraced by `core/city` (P2) rather than
      pads cut one by one.
- [ ] **The Point is at the world's east end.** The kit's frame turned to put the sea north is a half turn (a
      rotation, never a mirror), so the kit's −x end (the Point, the Strand) lies at the world's east and the Stacks at
      the west, the reverse of PLAN.md section 1's "from west to east". Either the plan's order is read as the kit's
      own, or the run is reversed in `targets/hook/89z-rows.js` (the owner's call).
- [ ] **A host's pad flattens the slope it stands on.** A host on the Heights' front slope (row 2 of the grid) is
      skipped for that reason; the named hosts on the ridge's foot stand on a flat pad cut into the slope. The Ancient
      stair and the funicular (P3) will dress the step.
- [ ] **A host's registered volume is shrunk to the kit's clearance.** The kit registers a tower with a generous
      radius (130 m); Hook shrinks it to the host's cap and then to the pad's half-width less `PORT.CLEAR` (8 m), so
      `port-clearance` passes. For the Bastion (podium 52 m on a 110 m pad) and the Bell Hall the inspector's volume
      is a few metres smaller than the building. A pad wider than `PORT.WMAX_NEW` is the kit's rule to relax.
- [ ] **The Bell Hall's constant is renamed at build time.** `kits/ancients/src/8ap-host-e-bellhall.js` declares
      `HBH`, and so does the Port's haven (`85-hb-3-haven.js`); `build.py` reads the kit's file in place and
      substitutes `HBLH` (`HOST_SUBST`), the one adaptation. The skyscraper helpers the hosts call (`skyPlinth`,
      `skyRooms`, `skyHoist`, `skyShards`...) and the glass-shard helper are lifted from `52-sky-abc.js` and
      `42-offices.js` by marker (`sky_helpers()`); a kit change that moves them past `function buildSkyA(` or
      `// INTERIORS.` breaks the lift loudly.
- [ ] **The funicular is not placed.** `kits/ancients/src/8ap-funicular.js` (Verge's) needs a route record (the
      ridge's foot to its top beside the Hook's axis) and the kit's funicular builder in the page; P3.
- [ ] **Seven grid hosts only.** The grid's probability (`site/hook-site.json` `grid.p`, 0.45 in the core) and the
      rules that keep a block free (near an avenue, on the Heights' front slope, over a Port footprint) leave 7
      drawn hosts beside the 8 named ones. The owner tunes `p`, `pEdge` and `weights` in the site file; P2 fills the
      other blocks with the cultures' lots.

## The layout against the plan (P0)

- [ ] **The grounded giant and the pier's buoys.** The plan wants `vsGiant` at decay 3 in the pier's slip; the pier's
      vessel hook (`81-pp-pier.js`, `portPlaceVessel(..., d)`) builds the vessel at the PIER's decay, 0. The layout
      therefore gives the pier `fleet:[null]` and places the giant itself as a free vessel at d=3 in the slip (x +72,
      bow out). With no vessel of its own the intact pier moors two buoys in the slip (local x 72, z 120 and 260):
      they stand inside the giant's hull, hidden by it. A layout option to pass a vessel's decay through the hook
      would remove the workaround (a kit change).
- [ ] **The eastern crane is the plan's "signal mast" only by its decay.** `cgCrane` at d=1 is the kit's ruined crane;
      no dressing yet says signal mast. P3 (the layers' landmarks).
- [ ] **Decays meet at the joints.** Neighbours of different decays (an intact quay beside a ruined crane, the
      intact Arsenal beside the ruined covered dock) each close their own side at their own decay; the kit's
      targets never mixed decays in one run, so the joints were not designed for it. Nothing wrong was seen in the
      P0 shots; read the joints again when the layers come.

## Shared helpers (the kit, not fixed from here)

- [ ] **`PORT.natH` is a kit change awaiting the owner's approval** (`settlements/port/src/71-port-terrain.js`, two
      hunks: `portNatH` reads `PORT.natH` when a build sets it, else the kit's own coast as `portNatH0`; the nature
      scatter skips a tree under sea level). Applied on this branch and the Port's pages rebuilt with it; a build that
      sets nothing is unchanged. `portShore` (the kit's wandering waterline) is still read by the scatter's land test
      and by nothing else that matters to Hook.

- [x] **Black decks, sheds and roofs: the kit's texture pack was Git LFS pointers.** In a fresh worktree
      `settlements/port/tex/*.webp` are 130-byte LFS stubs until `git lfs pull --include="settlements/port/tex/*"`;
      the pack then carries 199-byte data URLs that fail to decode, `_texPending` ends at 0 with no panel error, and
      every library-bound material (the intact paving, the white panels, concrete) samples an empty map: black. The
      kit's own `targets/harbour` page did the same here (2026-10-17). Pull the kit's `tex/` before building Hook;
      README.md says so. A verify check for pointer-sized pack entries would catch it earlier (a core/materials/record
      change: `KMAT.pack` could refuse an entry under 1 KB).
- [ ] **`hook-vessels-afloat` reads the kit's silted berths as shallow.** `slBerth` and `slPen` at d=1 silt their
      basins by design; the carrier and the pen's submarine report ground above their draft. The check is soft.
- [ ] **The segment-boundary labels overlap** at this run's length (29 placed items; the kit's own issue).
