# Ys — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

## Deliberate drift in vendored fragments (`build.py --vendor-check` reports these as "adapted")
- `71-port-terrain.js` (from `settlements/port/src`): `portNatH` delegates to `YS_NAT` when the city target
  defines it, and the port's nature scatter is skipped in that case (the biome plants the ground). Two lines.
- `52-sky-abc.js` (from `kits/ancients/src`): `ysCutY(d)` is the `y1` of a ruined (decay 1) body when
  `YS_CUT` is set, so a drowned host is cut at a datum instead of at the kit's own ruin height. Three lines
  and one helper; the kit's intact and toppled paths are untouched.
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
- [ ] The accreted pods' room polygons are circles of 12 sides; a bed against the wall can still clip the
      shell by a few centimetres where the lathe noise pulls the wall inward. The interior pass should read the
      wall from the pod's `inner` surface rather than the nominal radius.
- [ ] The view select does not follow a preset chosen by the harness or by `_api.setView` (cosmetic; the port
      behaves the same).
