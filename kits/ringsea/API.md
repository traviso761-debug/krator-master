# Ring Sea watercraft: API

**Units** metres. **World** x east, z south (north is -z), y up, sea surface y=0.
**Vessel frame**: origin amidships on the waterline, bow +x, starboard +z. A builder never
knows where its vessel is placed.

## Registration
`RS_VESSEL({key, name, culture, L, B, H, tags:{type, propulsion, hull, wealth, crew, role}, blurb, build})`.
`build()` opens with `reseed(N)` (checked by `build.py`) and returns `{group, anims, deckY}`.
`L/B/H` are length, beam (incl. oars/outriggers) and air draught; `verify.py` checks them against the built box.

Seeds: 71000 + 100·n per vessel (71000 trireme … 73000 lighter); 79001 is the far shore. Next free: 73100 (73000 is the salvage lighter).

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

## Animation: swell, wind, under way (`40-rs-core.js`, `94-rs-anim.js`)
One clock `t` (seconds) drives everything; each frame the host sets `RS_U.uTime.value=t`, poses each hull and runs its anims.
- **Swell**: `rsSwellSet([[A, wavelength, dirDeg, phase], ...], {cx,cz,r0,r1})` sets travelling sines (deep-water speed)
  and a radial fade to flat. `rsSeaH(x,z,t)` is the height on the CPU; `rsSwellGLSL()` returns the same function as GLSL
  (`uniform float uRsTime; vec3 rsSwell(vec2 worldXZ)` = height, d/dx, d/dz) for a material's `onBeforeCompile`
  (the sea in `90-rs-scene.js` and the wake strip in `94-rs-anim.js` both use it).
- **Riding**: `rsRide(G, D, x, z, yaw, t, seaH?)` puts the vessel group on the water: heave is the mean of five samples
  (amidships, bow and stern at +-0.36 L, both beams at +-0.28 B), pitch and roll are their slopes. A host world with its
  own sea passes its own `seaH(x,z,t)`; for hulls to sit in the water it draws, its water shader must displace by the
  same function.
- **Wind**: every sail material (`rsSailMat`) has `onBeforeCompile=rsSailWind`, which reads `RS_U.uTime`. `rsSail` writes
  each vertex's flutter vector into the sail's colour (`0.5+0.5*D`, |D| <= 0.12 m along the belly side, zero on the edge
  spars, the u=0 edge and the battens of a scalloped sail); white means rigid. Nothing else is needed: a host that copies
  the kit gets fluttering sails as long as it sets `RS_U.uTime`. The baked geometry stays the rest pose.
- **Under way**: toolbar button, or `window._api.underWay(on, t0)`. Off by default. Every vessel makes `RS_WAY.speed`
  (1.8 m/s) east, easing up over `RS_WAY.ease` (8 s) from `t0`, wrapping round its row (`RS_COLS*RS_PX`); positions are
  `rsWayX(p,t)`, a pure function of `t` and `t0`. A Kelvin-wake strip (one `InstancedMesh`, 1 draw call, length 2.6 L
  from the bow, riding the swell) shows only under way. A preset view of a vessel follows it while it is under way.

## Probe
`window._api`: `totals typeStats regOccupancy nanSweep tagAudit extra views setView pause(t) underWay(on,t0) defs`.
`extra()` asserts: vessels float, no two vessel boxes overlap, declared size matches, every oar bank
dips at the catch, no two sails within 0.3 m of each other (`sails-clear-sails`), no sail vertex inside a cabin (`rsCabin` registers its box; `rsSolid` adds one by hand), tags complete.

**Colour:** vertex colours are read as linear. A hex picked by eye comes out lighter and paler than it looks;
for a colour that must match (the Voth brown-black) pass `new THREE.Color(hex).convertSRGBToLinear()`.
