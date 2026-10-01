# Ys — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

## Deliberate drift in vendored fragments (`build.py --vendor-check` reports these as "adapted")
- `71-port-terrain.js` (from `settlements/port/src`): `portNatH` delegates to `YS_NAT` when the city target
  defines it, and the port's nature scatter is skipped in that case (the biome plants the ground). Two lines.
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
