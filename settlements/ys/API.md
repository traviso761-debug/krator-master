# Ys — generator API (the contract)

The half-drowned capital, generated in Three.js **r128** on the Ancients-lineage fragment contract: `src/`
fragments are concatenated by `build.py` into one `<script>`, so **every top-level name is a global shared by
every fragment**. Prefix every top-level name in your fragment with your family prefix (`hykHouse…`,
`buildHykShop…`); `build.py` fails on a duplicate or an over-generic name, on a builder that does not open with
`reseed(N)`, and on two fragments claiming the same seeds.

**Units are metres.** `x` east, `z` south (north is −z), `y` up. A person is 1.75 m. **Sea level is y = 0.**
The datums (DESIGN §3): wet landing +1, quay/ground +2.5 and up, bridge L1 +12, bridge L2 +28.

## The loop

```
python3 build.py                                    # every target -> dist/<target>.html (city -> ys.html)
python3 verify.py dist/mock.html --assert --views "Mock — poor house,Mock — poor house inside" --out /tmp/ys-shots
python3 verify.py dist/kit.html --cam=x,y,z,tx,ty,tz --cam-name close --hour 22 --out /tmp/ys-shots
python3 verify.py dist/kit.html --eval "()=>window._api.rooms().length" --marks /tmp/ys-marks.json
./run.sh log_kit dist/kit.html --assert --views "..." --out /tmp/ys-shots        # background; poll log_kit.done
```
Software GL: 15–40 s a view at this size. Keep a run to 2–8 views. A view name must not contain a comma.
`--assert` fails on a dirty error panel and on the invariants in `src/91-ys-probe.js`. LOOK at the shots.

## Targets

| target | what |
|---|---|
| `mock` | the phase 1 gate: two cut towers in the sea, the three prototype houses, the growth |
| `kit` | every `HYK.def` on one sheet, rows by family, presets generated (phase 2) |
| `city` | Ys (phase 3) |

A target is `targets/<name>/` with `89z-rows.js` (`TITLE`, `PORT_LAYOUT_DEF` with its world stamps), its ground
(`84-*-geo.js`: `YS_NAT(x,z)`, the natural height before any stamp), its builders (pushed into `YS_BUILD`, run by
the scene after the terrain and before the bake), and `91z-views.js` (`VIEWS`: the first entry is the opening shot).

## The frame (62-hyk-helpers.js)

```js
HYK.def({key,name,family,row,w,d,h,r,tags:{type:[...],wealth,lit},views?,build:function(G,o){...}});
HYK.place(scene,key,x,z,ry,{y,v,scale,lit})   // builds one instance; the kit sheet and the city call it
```
A builder draws in a **local frame**: origin at the plot centre on the ground, **+z the front** (the door side),
x to the right seen from the front, y up. It never sees world coordinates. `o.v` is the variant (0..), `o.y`
the ground height the placer chose. `reseed(N+(o.v|0))` is the first statement. `w d h` are the honest
footprint and height; `r` the inspector radius; `tags.type` from the project list (`civic market/shop
tavern/inn industry farm single-family dwelling multi-family dwelling infrastructure religious funerary
military`), `wealth` one of `poor middle rich civic`, `lit` only rich and civic (the lighting rule).

| helper | what |
|---|---|
| `hykW(lx,ly,lz)` / `hykN(nx,ny,nz)` | local point / direction → world |
| `hykReg(name,lx,lz,r,h,tags)` | the inspector volume (class `building`, the def's tags, `bld` = the placed id). One per building at least |
| `kput(item,[lx,ly,lz],q,scale,colour)` | the instanced kit, in the local frame (the group transform is applied) |
| `hykPut(matKey,geo,inside)` | merged geometry into the city-wide bucket for that material; `inside` = the interior bucket |

## The shell kit (61-hyk-shell.js)

Every surface is a `BufferGeometry` with normals, metre UVs (a texture tile is 4 m) and vertex colours, built
in the local frame and handed to `hykPut`. **No box anywhere in a Hykkousoi building.**

| primitive | signature | notes |
|---|---|---|
| `hykSurf(fn,nu,nv,{hole,col,uS,vS,flip})` | `fn(u,v)->[x,y,z]` | the base; `hole(u,v,p)` drops a quad; `flip` reverses the winding |
| `hykLathe({H,rFn,yBase,cx,cz,nu,nv,lobes:{n,amp,ph},flute:{n,amp,sharp},twist,rings:{n,amp},noise:{amp,su,sv,seed},tilt:{amp,dir},col,ops,flip})` | a shell body about a vertical axis | `tilt` dips the rim toward `dir`; `ops` = openings (below) |
| `hykLatheAt(o,th,y)` | → `{p,n}` | a point and outward normal on that lathe, for its openings |
| `hykPod({a,b,c,e1,e2,cy,squash,nu,nv,noise,col,openings:[{th,el,r,ky,kind}],hollow:{t,col}})` | → `{geo,inner,openings:[{p,n,r,ky,kind}],cy}` | a superellipsoid; `th` from +z toward +x, `el` elevation; the openings are REAL holes; `hollow` adds the inward-wound inner skin |
| `hykConch({R,turns,g,apexLift,flare,flute,rings,twist,nu,nv,col,ops})` | → `{geo,aperture:{p,n,r},cen(t),rho(t)}` | a tapering tube on a log spiral, resting on y=0, aperture at the origin facing +z |
| `hykTube(pts,rFn(t,i),{seg,col,flip})` | a tube along a polyline | parallel-transport frames |
| `hykRib(a,b,{rise,r0,r1,knuckles,n,col})` | a bone-rib: parabola, thick at the springing | |
| `hykFlare(c,n,R,f,{col,wobble})` | the fillet that roots a shell into a face (`n` the face normal) | from radius R+f on the face to R at f out |
| `hykDisc(cx,y,cz,R,{col,lobes,sag,down,nu})` | floors, pads, lids | normal up unless `down` |
| `hykDeck(pts,w,{col,camber})` | a ribbon deck along a polyline | |
| `hykHoleOf(ops)` | → a hole predicate from `[{p,r,ky}]` | |

Materials (`MAT.*`, 60-hyk-mat.js): `hkShell hkBarn hkBone hkMosaic hkCrust hkWeed hkFloor hkIn hkNacre`
for merged geometry (vertex-coloured), the same with an `I` suffix for instanced items, plus `hkGlow hkGlowCool
hkLens hkFoam`. Colours: `hC(hex)` (sRGB → linear) and the palette `HPAL` (`shell shellWarm coral teal seaGreen
barnacle bone weed crust nacre floor lens`); `hPick(list)`. Rich and civic may use `hkNacre` (the hook plays
colour with the view angle); poor is `hkBarn`; everything else `hkShell`.

Kit items (`kput`): `hkLip hkLipN` (a torus lip; +z its axis), `hkReveal` (an open tube), `hkDisc`, `hkLens`,
`hkPearl hkPearlC` (lamps), `hkDrip` (flip it to hang), `hkBall hkBarnB`, `hkTread` (sills, treads), `hkPost`,
`hkWeedCard`. A new item is a new draw call: ask the planner.

## Openings, lights, rooms, spots (62-hyk-helpers.js)

```js
hykDoor(op,{level,room,nacre,depth,name})      // op = {p,n,r,ky} from hykPod / hykLatheAt / a conch aperture
hykWin(op,{nacre,lit,open,depth})               // a lip, a reveal, a dark (or lit) pane deep in it
hykLight(lx,ly,lz,{r,cool,nacre,bare,level})    // a glow-pearl in a cup, or a bioluminescent jar
hykRoom(kind,poly,y,h,{doors:[[lx,lz,w,to]],residence,wealth})   // -> the ROOM record (world); poly local
hykSpot(room,kind,lx,lz,ry,w,d)                 // bed food store hearth seat table work shrine
hykFloor(cx,cz,y,R,{col,lobes})                 // the floor plate, into the interior bucket
hykCirclePoly(cx,cz,r,n)
```
Every opening and light is recorded in `MARKS` (world: kind, position, normal, size, level, the room, the
doorstep and threshold of a door). **Every residence registers a room with at least a `bed` (2.1 × 1.0), a
`food` (0.8 × 0.8) and a `store` (1.2 × 0.7) spot** (DESIGN §7); middle adds `hearth` and `table` or `seat`;
rich adds rooms. The probe checks that every building has a door, every residence its three spots, and that
every spot lies inside its room polygon, a metre clear of every door and clear of every other spot. Build the
inside: a floor plate, an inner skin (`hollow`, or a second lathe at 0.9 r wound inward into `hkIn`), real holes
for the openings. Clear height ≥ 2.4 m poor, 2.8 middle, 3.2 rich and civic; a residence room ≥ 3.2 m across.

## Hosts and growth (64-hyk-accrete.js)

```js
ysPlaceHost(scene,{key,builder,x,z,y (the sink),ry,d,cutY,podium,holes,cap:{hw},rAt(y,a),name,
            floors:{y0,pitch,top,first},ways:[{a,y,R}],ring})
hykTideline(host,{weed,specks,foam})
hykAccrete(host,[{y,a,R,wealth,level,pad,cluster,into}])   // pods rooted into the host's face, landings, drips, rooms
hykPad(x,y,z,R,{col,mat,stalk,own})                     // a lily-pad landing (world)
hykStairSpiral(cx,cz,rAt,y0,y1,{a0,dir,w,col})          // treads and a rail down a round face
hykBridge(A,B,{w,rise,col,own,                          // a backbone deck between landings: spine, vertebrae, edge ribs, rail
  branches:[{t,to:{x,y,z},w,rise,own}],                 //   a narrower run forking off at t toward a point (a perch, a landing)
  runners:{members,reach,every}})                       //   tendrils from the deck to the nearest member within reach, rooted
  -> {pts,runners,branches}
hykSegNearest(member,p) -> {q,n}                        // the nearest surface point on a capsule or box member, and its normal
hykPad(x,y,z,R,{...,rail:{a0,gap,col}})                 // a rail on posts round the rim, open `gap` radians about bearing a0
```
- `podium` shrinks the kit's plinth to that radius (the apron and the plinth's moss, rubble and trees are dropped);
  the podium decides nothing above the sea, so the `cap` is the footprint at the waterline (struts, legs), given
  explicitly. `holes` scales the kit's decay holes for this host (default .4: the kit's full decay eats most of a
  skin, a reclaimed host keeps its wall). `rAt(y,a)` may take the bearing: a lobed host is wider at a crest.
- `floors`: plate k's top is at `y0 + k*pitch + top` in the builder's own y (`first` replaces `k*pitch+top` for
  k = 0), plus the sink. Pods must sit on plates: a pod's floor is the plate's top.
- **Ways in.** A host must be declared with at least one way: `{a (bearing), y (the plate's top, world), R}`.
  The adapted builders cut that pod's hole through the skin and the lining (`52-sky-abc ysWallHole`), and the
  matching `hykAccrete` pod (`into:true`, same `a` and `R`, `y` optional) is bedded a fifth into the face with a
  back door onto the plate; the plate registers as a `hostfloor` deck in `NAV_EXTRA`, the floor's `kind` becomes
  `inhabited` and `way` is set. The probe's `every-host-has-a-way-in` fails a host without one.
- `host.members` are the host's struts and legs as world capsules `{n,a,b,r}` and its strut heads as boxes
  `{n,c,u,v,w,he,head:true}` (centre, unit axes, half-extents), mirrored from the kit's constants per key
  (`ysHostMembers`: skyA, skyB so far). Runners reach for them (`hykSegNearest` gives the surface point and its
  normal, the rib ends inside the member and the flare lies on its face); a perch sits on a head's top
  (`c[1]+he[1]`).

A host's HOST record (DESIGN §3) carries its real cap, its floors table (`kind: drowned|tide|inhabited|wild`,
`way` on the entry floor), its landings, its ways and its members; every deck over water registers itself in
`NAV_EXTRA` through `ysDeck` (`kind: bridge | pad | hostfloor`).

## Presets

`[cx,cy,cz, tx,ty,tz, hour?, compass?, inside?]`: hour sets the clock (absent = the default day), compass
switches the rose and gizmo on, inside hides every exterior shell and shows the Rooms overlay. Add
`'<name> — front'`, `'<name> — eye level'` and `'<name> inside'` for every residence you build.

## Budgets

| | |
|---|---|
| one building | 250 k triangles (landmarks 600 k: say so) |
| the mock sheet | 2 M |
| draw calls | one per material per side for every merged shell in the world, plus one per kit item |

## Pitfalls

- `const` in a later fragment is in the temporal dead zone for code that runs at load in an earlier one: a
  helper the view machinery calls must live in `92-camera.js` or earlier, or be guarded by `typeof` on a
  **function** (functions hoist; `typeof` on a `let`/`const` in its dead zone throws).
- A material with `vertexColors` needs a `color` attribute: kit items use the `I` materials.
- The winding sets the normal. A surface that is invisible from the side you meant is wound the wrong way:
  pass `flip`. `hykFlare` and `hykDisc` are already up/outward.
- Vertex and instance colours are linear: always `hC(hex)`.
- The port's underwater fade skips a material that has its own `onBeforeCompile` hook: a hooked material (the
  nacre) calls `portUWsh(sh)` itself.
- A view name with a comma splits in the harness.
