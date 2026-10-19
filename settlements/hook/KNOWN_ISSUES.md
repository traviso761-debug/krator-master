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
