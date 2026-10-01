# Ys — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

## Deliberate drift in vendored fragments (`build.py --vendor-check` reports these as "adapted")
- `71-port-terrain.js` (from `settlements/port/src`): `portNatH` delegates to `YS_NAT` when the city target
  defines it, and the port's nature scatter is skipped in that case (the biome plants the ground). Two lines.
- `52-sky-abc.js` (from `kits/ancients/src`): `ysCutY(d)` is the `y1` of a ruined (decay 1) body when
  `YS_CUT` is set, so a drowned host is cut at a datum instead of at the kit's own ruin height; `ysPodiumR`
  shrinks `skyPlinth` to `YS_CUT.podium` (apron and plinth decor dropped); `ysWallHole` adds the way-in pods'
  holes to the body's hole predicate (skin, lining, window cells and lobe bands all share it) on A, B and C.
  Three helpers at the top and seven one-line edits; the kit's intact and toppled paths are untouched.
- `92-camera.js` (from `settlements/iziz/src`): the Ys standard pack: a seventh preset element is the hour,
  `n` toggles noon/night, the camera and walker stay above the sea, the inspector names ground and sea, and
  the Compass toggle. Back-port the compass to the standard pack once Ys is on `main`.

## Open
- [ ] Phase 0 terrain is the port's tensor grid sized for a coast along x: 10 m cells only within ~900 m of the
      origin, 90 m cells beyond. Phase 3 replaces it with the Ys terrain mesh (regular cells over the 3.2 km map,
      a far-country mesh for the volcano and the Inner Wall).
- [ ] No nature scatter on the natural ground until the NW-bay biome is bound (phase 3).
- [ ] The foreign quarter's buildings (Iziz, Republic, Voth, the chapterhouse) will carry no ROOM records until
      their own kits register them (DESIGN §7).
- [ ] The Ancients hosts get door marks only at their accreted landings (DESIGN §7).
- [ ] The ground painter is the port's (red soil in patches, dry grass): re-key it to the bay's lush ground and
      the karst when the NW-bay biome is bound (phase 3).
- [ ] The nacre material fades underwater only through its own hook (`hkNacreHook` calls `portUWsh` first);
      any new shell material with an `onBeforeCompile` must do the same or it will glow under the sea.
- [ ] The sea plane shows moiré at the mockup's low grazing presets (the port's sea at a 10 m tensor cell);
      revisit with the Ys terrain mesh in phase 3.
- [ ] `ysHostMembers` mirrors the kit's strut and leg constants for Skyscrapers A and B (positions, counts,
      which are gone when ruined). Re-read `kits/ancients/src/52-sky-abc.js` whenever the kit is re-vendored,
      and add C, D–K as hosts of those kinds are placed.
- [ ] A strut's shaft is modelled as a capsule (r 2.75) though the kit draws a 5.5 x 4 beam: a runner rooted on a
      shaft lands up to .65 m proud of or inside the beam's corners. Heads are boxes and land exactly.
- [ ] The kit's towers have no stairs between their floor plates (`kits/ancients/KNOWN_ISSUES.md`, "Found by
      Ys"): from a way-in pod only its own plate is reachable on foot. Grow Hykkousoi stairs inside the hosts
      in phase 3, or re-vendor the kit once it has stairs.
- [ ] A way-in hole is cut on the lathe's quad grid (A: 2.2 m columns, 0.5 m rows at the mock's cut), so its
      edge is ragged by up to half a quad; the pod's fillet (reach 1.35 R) hides it from outside, but from
      inside the host the lining's hole (nu 80) is coarser than the pod's back and shows a notch or two.
- [ ] In the mock the L1 datum on Skyscraper A falls on its base cone, which has no plates: the L1 pods there
      are dwellings with landings only, not ways in. The city places way-in pods on plates only.
- [ ] The accreted pods' room polygons are circles of 12 sides; a bed against the wall can still clip the
      shell by a few centimetres where the lathe noise pulls the wall inward. The interior pass should read the
      wall from the pod's `inner` surface rather than the nominal radius.
- [ ] The view select does not follow a preset chosen by the harness or by `_api.setView` (cosmetic; the port
      behaves the same).
