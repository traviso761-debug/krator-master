# Ring Sea watercraft: API

**Units** metres. **World** x east, z south (north is -z), y up, sea surface y=0.
**Vessel frame**: origin amidships on the waterline, bow +x, starboard +z. A builder never
knows where its vessel is placed.

## Registration
`RS_VESSEL({key, name, culture, L, B, H, tags:{type, propulsion, hull, wealth, crew, role}, blurb, build})`.
`build()` opens with `reseed(N)` (checked by `build.py`) and returns `{group, anims, deckY}`.
`L/B/H` are length, beam (incl. oars/outriggers) and air draught; `verify.py` checks them against the built box.

Seeds: 71000 + 100·n per vessel (71000 trireme … 72100 chitin bireme); 79001 is the far shore. Next free: 72200.

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

## Probe
`window._api`: `totals typeStats regOccupancy nanSweep tagAudit extra views setView pause(t) defs`.
`extra()` asserts: vessels float, no two vessel boxes overlap, declared size matches, every oar bank
dips at the catch, tags complete.
