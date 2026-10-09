# Ring Sea watercraft: API

**Units** metres. **World** x east, z south (north is -z), y up, sea surface y=0.
**Vessel frame**: origin amidships on the waterline, bow +x, starboard +z. A builder never
knows where its vessel is placed.

## Registration
`RS_VESSEL({key, name, culture, L, B, H, tags:{type, propulsion, hull, wealth, crew, role}, blurb, build})`.
`build()` opens with `reseed(N)` (checked by `build.py`) and returns `{group, anims, deckY}`.
`L/B/H` are length, beam (incl. oars/outriggers) and air draught; `verify.py` checks them against the built box.

Seeds: 71000 + 100·n per vessel (71000 trireme … 73700 Voth dhow); 79001 is the far shore. Next free: 73800 (73700 is the Voth fishing dhow).

## Building blocks (all write into a bucket `B = rsBucket()`, baked once by `rsBake(B, group)`)
- Materials by key: `wood paint metal rope cloth thatch tile hex chitin glow foam ancient bronze rust`, all vertex-coloured; `rsDefMat` adds one.
- Primitives: `rsBox rsCyl rsSphere rsCone rsLink(a,b,r) rsTube(pts,r|fn) rsGrid rsRoof rsFigure`.
- Hull: `H = rsHull({L,B,fb,dr,sheerF,sheerA,pb,pa,q,n,flare,rakeF,rakeA,transom,keelEnd,z0})`;
  `H.pt(u,s,h)`, `H.nrm`, `H.hb`, `H.ys`, `H.halfAt(u,y)`, `H.xAt`, `H.uAt(x)`.
  `rsHullMesh(B,H,mk,col(u,h,s))`, `rsDeck`, `rsWale`, `rsSpine` (keel + stem/post extensions), `rsAlong`, `rsDecal`, `rsFoam`.
- Rig: `rsOars(V,H,{...})` (animated InstancedMesh bank, or `points` for paddlers),
  `rsSail(B,{key,O,U,V,A(t),Bf(t),belly,scallop,draw})` (ruled sail painted in its own plane; returns `{at(u,v)}`),
  `rsSailEdge rsBamboo rsRope rsPennant rsShield`.
- Parts: `rsCabin rsVault rsRam rsDragonHead rsScroll`.

## Animation: swell, wind, under way (`40-rs-core.js`, `43-rs-rig.js`, `94-rs-anim.js`)
One clock `t` (seconds) drives everything; each frame the host sets `RS_U.uTime.value=t`, poses each hull and runs its anims.
- **Swell**: `rsSwellSet([[A, wavelength, dirDeg, phase, steepness], ...], fade?)` sets Gerstner (trochoidal) waves:
  a rest point p0 moves to p0 + sum (steep/k) D cos(th) and up by sum A sin(th) (deep-water speed; keep the sum of the
  steepnesses under 1). `rsSwellD(x0,z0,t)` is the displacement of a rest point (and its Jacobian),
  `rsSeaH(x,z,t)` the height at a world point (3 Newton steps for the rest point that lands there). `rsSwellGLSL(lod?)`
  returns the GLSL (declares `uRsTime`): `vec3 rsSwellD(vec2 p0)`, `float rsSwellH(vec2 p)` (2 Newton steps, <1 mm),
  `vec4 rsSwellNJ(vec2 p0,float mpp)` = world normal and Jacobian (whitecaps where it drops), each wave faded where it
  is finer than a pixel. `lod {cx,cz,r:[[r0,r1]...]}` fades each wave's displacement with distance (the sea mesh only).
  The sea (`90-rs-scene.js`) displaces its grid, then shades normal and foam per pixel at the rest point, so the
  swell reaches the horizon.
- **Riding**: `rsRide(G, D, x, z, yaw, t, seaH?, heel?)` puts the vessel group on the water: heave is the mean of five samples
  (amidships, bow and stern at +-0.36 L, both beams at +-0.28 B), pitch and roll are their slopes; `heel` (rad, + =
  starboard down) is added to the roll. A host world with its own sea passes its own `seaH(x,z,t)`.
- **Wind**: sails flutter in the vertex shader (`rsSailWind`), the flutter vector in the sail's colour; it is zero on every
  edge and corner, so sheets, yards and battens stay attached. Pennants (`rsPennant`) flutter by their distance from the root.
- **Trim**: `rsRig(B, mast, {gain})` ... `rsRigEnd(B)` around a sail's rig (`mast` = `[x,z]`, or `[[base],[head]]` for a
  raked mast). Pieces within 0.45 m of the rig's sails turn with them about the mast (links end by end, other pieces whole).
  Per-vertex `rsAux`/`rsAux2` attributes carry pivot, axis, weight and kind; a mesh with them gets a per-vessel clone of
  its material reading `G.userData.rsU.uRsTrim` (rig angle, rad) and `uRsFlag` (pennant swing): set both each frame,
  0 = the built pose (no extra draw call). `rsRigPose(q, rig, a)` is the same rotation on the CPU.
- **Under way**: toolbar button, or `window._api.underWay(on, t0)`. Each row sails a racetrack (east on its own line,
  a half-turn to port of radius `RS_WAY.R` = RS_PZ/4, west midway to the next row, a half-turn back) at `RS_WAY.speed`
  (1.8 m/s), easing up over `RS_WAY.ease` (8 s). `rsWayS(t)` is the distance run, `rsWayPose(p,t)` a vessel's
  `{x,z,yaw,heel,k,trim,flag}`: a pure function of `t` and the toggle times. Heel `RS_WAY.heel`·(turn rate·R), smoothed
  over 24 m. Trim = `RS_WAY.trimMax`·sin(apparent-wind angle off the bow) (wind `RS_WIND`, blowing toward SSW at 5 m/s);
  pennants swing to stream with the apparent wind. Turned off, s eases to the nearest whole lap (3-10 s): each row runs
  home along its own track. Wakes (one `InstancedMesh`) point astern; labels and a vessel's preset view follow it.

## Decks and walking (`95-rs-deck.js`)
Walk mode (F) stands on decks, rides with the vessel, and is stopped by masts, walls, rails and crew (KNOWN_ISSUES.md).
`window._api.decks()` returns per vessel, in the vessel frame: `deckY`, `walkArea` (m2), `outline` (convex hull of the
walkable main deck), `footprint` (convex hull of the hull below the waterline), `masts` `{x,y,z,ax,az}` (axis through
(x,y,z) along (ax,1,az)), `solids` (cabins `{min,max}`), and `pose` `{x,z,yaw,y,matrix}` (the live world matrix).
`_api.deckAt(key,lx,lz,feet?)` -> `{y, blocked}` or null; `_api.walkGround(x,z)` -> `{vessel, y}`;
`_api.walkAboard(key,lx,lz,yaw,pitch)` puts the walker on a deck.

## Probe
`window._api`: `totals typeStats regOccupancy nanSweep tagAudit extra views setView pause(t) underWay(on,t0) wayState defs decks deckAt walkGround walkAboard`.
`extra()` asserts: vessels float, no two vessel boxes overlap, declared size matches, every oar bank
dips at the catch, no two sails within 0.3 m of each other (`sails-clear-sails`), no sail vertex inside a cabin (`rsCabin` registers its box; `rsSolid` adds one by hand), tags complete; and posed (`rsPosedChecks`): `vessels-float-swell` (deck above, keel below the swell at t=0, 7.3, 21.1 at
rest and 7.3-260 s under way), `no-vessel-overlap-posed`, `oars-reach-water-swell`, `courses-clear` (a full lap every
1.5 s and a run home every 0.25 s, plan boxes grown to hold the trimmed sails), `sails-clear-trimmed` (+-trimMax, +-half),
`decks-walkable` (each vessel boards from the water onto its deck), `masts-block-walker`.

**Colour:** vertex colours are read as linear. A hex picked by eye comes out lighter and paler than it looks;
for a colour that must match (the Voth brown-black) pass `new THREE.Color(hex).convertSRGBToLinear()`.
