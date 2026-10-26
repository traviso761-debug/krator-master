# Known issues

Open items start with `- [ ]` (build.py prints them after every build). The Port kit's own list is
`settlements/port/KNOWN_ISSUES.md`; shared-fragment problems found from Hook are recorded here, not fixed in the kit
from a Hook task.

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

- [x] **Black decks, sheds and roofs: the kit's texture pack was Git LFS pointers.** In a fresh worktree
      `settlements/port/tex/*.webp` are 130-byte LFS stubs until `git lfs pull --include="settlements/port/tex/*"`;
      the pack then carries 199-byte data URLs that fail to decode, `_texPending` ends at 0 with no panel error, and
      every library-bound material (the intact paving, the white panels, concrete) samples an empty map: black. The
      kit's own `targets/harbour` page did the same here (2026-10-17). Pull the kit's `tex/` before building Hook;
      README.md says so. A verify check for pointer-sized pack entries would catch it earlier (a core/materials/record
      change: `KMAT.pack` could refuse an entry under 1 KB).
- [ ] **`hook-vessels-afloat` reads the kit's silted berths as shallow.** `slBerth` and `slPen` at d=1 silt their
      basins by design; the carrier and the pen's submarine report ground above their draft. The check is soft.
- [x] **The segment-boundary labels overlap** at this run's length (29 placed items; the kit's own issue). - 2026-10-20: fixed in the kit (`portBoundsDeclutter`, settlements/port/src/92-camera.js; Hook builds it): 11 of the 29 labels show at the Overview, none overlapping.
