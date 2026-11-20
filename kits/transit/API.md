# kits/transit — API Reference (`KCANAL` / `TR_VESSEL`)

**Units:** metres. **World:** `x` east, `z` south (`-z` north), `y` up.
**Vessel frame (`TR_VESSEL`, matching `kits/ringsea/API.md`):** origin amidships on the waterline (`y = 0`), **bow `+x`**, **starboard `+z`**. In Three.js `rotation.y = yaw`, bow `+x` points toward `[cos(yaw), 0, -sin(yaw)]` (`KCANAL.vesselYaw(dx, dz) = Math.atan2(-dz, dx)`).

## Reading in Place from a Host Settlement

```python
sys.path.insert(0, os.path.join(ROOT, 'kits', 'transit'))
import transit as ktransit
# ktransit.DATA_FILES -> ['40-tr-canal.js', '41-tr-locks.js', '42-tr-transit.js']
# ktransit.DRAW_FILES -> ['70-tr-canal-draw.js', '72-tr-canal-vessels.js']
```

## `[G data]` Canal, Lock & Transit Calls (`KCANAL`)

- `KCANAL.frame({ ox, oz, bearingDeg | sx, ux })` -> `{ at(u,s), uOf(x,z), sOf(x,z), us(x,z), YAW_S, YAW_NS, YAW_U, YAW_NU, VYAW_S, VYAW_NS, VYAW_U, VYAW_NU, rectPoly(u0,u1,s0,s1) }`.
- `KCANAL.pound({ id, order, wlev, bedMin, minFreeboard, quayY, name })` and `KCANAL.poundsMonotonic(pounds, expectedDrop)`.
- `KCANAL.lockFlight({ id, risers, lanes, s0, chamberLen, chamberW, islandW, yLow, yHigh, period, phase }, frame)` -> `{ chambers, maxRiserLift, totalLift, ... }`.
- `KCANAL.lockState(chamber, t)` -> `{ phaseName, y, headLow, headHigh, lowerGateDeg, upperGateDeg, sluiceFlow }`.
- `KCANAL.miterLawOk(stateSample)` -> `boolean` (enforces zero-head miter-gate law).
- `KCANAL.gateLeafPoses(chamber, stateSample, frame)` -> `[{ chamberId, which, side, deg, hingeX, hingeZ, baseY, yaw, obb }]`.
- `KCANAL.network({ frame, pounds, troughs, bridges, aqueducts, chambers, rivers })` -> unified spatial canal network.
- `KCANAL.clipStreetWays(ways, net, { curbMargin })` -> splits/clips street polylines behind canal curbs and bridge ramp toes so zero flat roads cross water.
- `KCANAL.streetClearOfCanals(ways, net, { margin, allowBridgeDeck })` -> `{ ok, count, intrusions, checkedSegments, checkedSamples }`.
- `KCANAL.buildRoadMask(ways, towpath, net, { size, halfExtent })` -> `KMASK`-backed road/towpath raster explicitly zeroed across all canal troughs, locks, basins, and rivers (`auditZeroOnCanals()`).
- `KCANAL.singleLockTour(cfg)`, `KCANAL.twinFlightRoundTrip(cfg)`, `KCANAL.shuttleCourse(cfg)` -> periodic `transitCourse` records.
- `KCANAL.vesselPoseAt(course, t)` -> `{ id, key, v, t, stage, u, s, x, y, z, yaw }`.
- `KCANAL.auditTransit(course, net, vesselSpec, { dt, airMargin })` -> `{ ok, samples, miterViolations, gateCollisions, wetViolations, bridgeStrikes, flotationFaults, stagesSeen, firstFault }`.

## `[draw]` Infrastructure & Vessel Registry

- `KCANAL.registerStyle(name, profile)` / `KCANAL.styles` (`eternian`, `republican`, `marr`, `dalab`, `voth`).
- `KCANAL.draw`: `quay`, `lockRiser`, `miterLeaf`, `bridge`, `aqueduct`, `weir`, `sluiceGate`, `crane`, `pavedWays`.
- `TR_VESSEL({ key, name, culture, kind, L, B, H, draft, tags: { type, propulsion, hull, wealth, crew, role }, blurb, build })`:
  - `KCANAL.buildVessel(key, { v })` -> `{ group, anims, deckY, walkRect, solids, def }`.
  - `KCANAL.registerVesselTag(tagsReg, keyOrDef, pose, opt)` -> registers in `KTAGS` with `class: 'vessel'`.
  - `KCANAL.registerVesselWalk(KWALK, built, pose, name)` -> registers walkable main deck strip.
  - `KCANAL.auditVesselDims(key, v, tol)` -> compares built `THREE.Box3` against declared `{ L, B, H, draft }`.
