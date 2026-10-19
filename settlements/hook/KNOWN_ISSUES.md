# Known issues

Open items start with `- [ ]` (build.py prints them after every build). The Port kit's own list is
`settlements/port/KNOWN_ISSUES.md`; shared-fragment problems found from Hook are recorded here, not fixed in the kit
from a Hook task.

## The site and the Ancient town (P1)

- [x] **The site editor page** (`dist/hook-site.html`, 2026-10-19). Voth's editor (`settlements/voth/targets/voth-site`)
      is written against Voth's scene: its tools read `VIEW.surf/pick/ext/sprite/refreshTerrain/ovTex/ovCanvas/mmBase/
      labels/cantonList/causeways/causewayHit`, `TERR.h/delta/dab/sync/n`, `VOTH.SEA/landDist/RLAND/DISTRICTS/CWAY`,
      `HOSTUI.labels` and the DOM of its own `00-head.html`. `build.py` reads its model, tools and head in place (a
      site target, `SITE_TARGETS`) and `targets/hook-site/94-hook-site-adapter.js` gives every one of those on the Port
      kit's ground; `96-hook-site-model.js` adds the quarters' fields, the hosts and the grid to the saved file;
      `serve.py` takes `POST /save/hook-site`. README.md, "The site editor". What is left of it:
- [ ] **The editor's ground strokes are not applied by the build.** The brushes (`R`/`L`/`M`) edit the editor's
      `TERR` delta grid, the Port's terrain chunks follow and the strokes are saved in `site/hook-site.json` `terrain`,
      but `build.py` and `90a-hook-city.js` read `terrainH` only: `dist/hook.html` stands on the model's ground ("The ground" in README.md) without them. A
      layout stamp made from the strokes (the kit's `ramp`/`flat` stamps, or a `core/terrain` carve) is the next
      step; until then a ground edit is a note to the owner, not a change to the page.
- [ ] **The editor keeps Voth's page conventions where they do no harm.** Voth's panel strings that name Voth
      (the ferry and elephant-bug modes, causeways, "add Voth's current districts") are hidden, not removed: the
      tools (`55-site-tools.js`, read in place) still bind them. A quarter's label in the editor is its name only; the
      city plan's own drawing (`90b`, with the streets) is under `z`. The Port's own inspector panel and caption are
      hidden on the editor page; its view select and the segment-bounds button stand bottom-left, `core/lod`'s panel
      beside them.
- [x] **The ridge and the cliff were ramp stamps** on the kit's flat coast (a plateau with a straight back edge, a dark
      band 1.2 km behind the quays). Since 2026-10-19 the ground is the scale model's (README.md "The ground") and
      both stamps are dropped: the model's slope stands higher than either.
- [x] **The model has no cliff behind Hook**, and the plan no longer wants one (the owner, 2026-10-19): the site ends at
      a gentle hill, which the model's own slope gives (+139 m at the site's inland edge). `76-hook-ground.js` keeps a
      gentle hill stamp for a model that lacked it.
- [x] **Hook's pixel was 6.7 km from its waterfront.** The owner moved it to the shore (2026-10-19): px 537,593 in the
      model's settlements store and in `openworld/little-demo/source/settlements.json`; the shoreline is now 124 m
      seaward of the pixel. The cells north and west of the old pixel are still FLAGGED sea in the model while their
      ground lies above the sea's level (53 of the cut's 328 water cells): the model page draws them as sea, the 1:1
      rule does not; a model edit if that ever matters.
- [ ] **A 10 % slope under the whole site.** Every land block's flat stamp and every host pad cuts a bank into the
      slope (a 110 m block: an 11 m bank at its back); the kit's soft rings blend them. The waterfront reads well
      (the P0 run's verify passes); the town behind will want its streets terraced by `core/city` (P2) rather than
      pads cut one by one.
- [x] **The Point is at the world's east end.** The kit's frame turned to put the sea north is a half turn (a
      rotation, never a mirror), so the kit's −x end (the Point, the Strand) lies at the world's east and the Stacks at
      the west. The owner keeps the run as it is (2026-10-19): Iziz's segments east, Voth's west; `PLAN.md` section 1
      reads its zones from east to west.

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

- [x] **`PORT.natH` is a kit change, approved by the owner (2026-10-19)** (`settlements/port/src/71-port-terrain.js`, two
      hunks: `portNatH` reads `PORT.natH` when a build sets it, else the kit's own coast as `portNatH0`; the nature
      scatter skips a tree under sea level). The Port's pages are rebuilt with it; a build that sets nothing is
      unchanged. `portShore` (the kit's wandering waterline) is still read by the scatter's land test
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
