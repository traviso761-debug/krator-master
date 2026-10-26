# core/biome: the biome core

One copy of what every biome kit draws with (`core/README.md` has the module list). A build lists the fragments it
takes by name in its `build.py` (`CORE_BIOME`); a fragment not listed is not on the page. This README covers the
foliage fragments: `30-core-foliage.js` (leaf, bark, far, hang materials and their shader hooks), `31-core-dither.js`
(the hex-cell ground dither) and `31b-core-leafset.js` (leaves held by the stem). Tests: `node core/biome/test-foliage.js`,
`node core/biome/test-leafset.js` (and the other `test-*.js`).

## What 30-core-foliage gained on 2026-10-26 (the final rebuild's core items)

Every addition is off until a page or a kit asks for it. With none asked for, every hook writes the shader it wrote
before, character for character: `test-foliage.js` holds the SHA-1 of the fourteen default shaders (seven leaf option
sets, gloss, irid, both far kinds, hang, plain bark, solid) as `de751ca46` wrote them.

| Item | Call | Kind |
|---|---|---|
| B3 per-species two-tone bark | `BIO.glossBarkMat(tex,key,{alt,gloss,c2:true})`; the builder sets `BIO.c2` (a species' second colour) around the calls that write its bark | needs buckets that carry `aC2` (`BIO.C2_BUCKETS`, a `20-core-kit.js` change: requested, the patch is with the report); ignored without them |
| B9 spin | `BIO.leafMat(tex,key,{spin:true})` (or `spin:{value}` of the host's own): turns about the instance origin by `BIO.SPIN.value` | per material |
| R5 floor cover takes the ground's colour | `BIO.setGround(tex,[x0,z0,x1,z1],{linear})` or `BIO.setGround(BIO.groundTex(fn,box,128),box)`; leafMat `{ground:{k,gain,tip,fade:[d0,d1]}}` | page + material |
| R7 alpha-to-coverage | `BIO.setA2C(renderer)` after the kits are built: MSAA on WebGL2 only, the alpha test kept otherwise | page |
| R8 one wind field | `BIO.bindAtmosWind({gain})` after `ATMOS.init`/`bindHost`: the sway and lean ride `atmGust` at each root | page |
| item 6 back-light | leafMat `{backlit:0..1}` | per material |
| the cross-fade hook | `BIO.FADE={uniforms,vertexPars,vertex,fragmentPars,fragment}` or `function(sh,kind)`, set before the kits build | page (for the kit workstream's dithered LOD cross-fade) |
| X4 the ground dither | list `31-core-dither.js`; `BIO.DITHER` is the GLSL (kdither, kditherW, kmacro), `BIO.ditherCell` its JS twin | fragment |
| leafset | list `31b-core-leafset.js` (and `core/rand`); `BIO.geo.clump({stem:true})`, `BIO.geo.leafCard`, `BIO.leafOn`, `BIO.leafAlong` | fragment + kit |

Page-wide switches must be set before the first frame: the shaders take them when they compile. The program keys
carry them (`|gust`, `|fade`, `|a2c`, `|c2`), so no program is shared across a switch.

## Adopting it (the exact lines; nhighlands, nsemiarid, nwlowlands, korona and farside are the pilots)

1. **One wind field (R8) and alpha-to-coverage (R7).** In the host fragment that binds core/atmos (nhighlands
   `89a-host-atmos.js`), right after `ATMOS.bindHost({...})` (or `ATMOS.init`):

   ```js
   BIO.bindAtmosWind();BIO.setA2C(renderer);
   ```

   A page with no core/atmos skips the first (it returns false and nothing changes). A page whose renderer has
   `antialias:false` or renders into a render target without samples gets no coverage and keeps its alpha test.
   It changes the look: the foliage leans downwind and swells as gust fronts pass (12 m/s, wavelengths 40-240 m).

2. **The ground at the root (R5).** On the floor cover's leaf materials (the grasses and low tufts drawn in the floor
   band), add `ground:{k:.8,gain:G,fade:[d0,d1]}`, `d1` at or inside the floor's chunk range (`BIO.range` of the floor
   pass) and `d0` some 150-200 m before it; `gain` is the ground material's own tint times its detail map's mean (nhighlands:
   `.42`). After the ground is built, before the first frame (nhighlands `88-host-build.js`):

   ```js
   BIO.setGround(GROUND.material.map,[TERR.X0,TERR.Z1,TERR.X1,TERR.Z0]);   // the paint's v runs z1..z0 (a CanvasTexture)
   ```

   A ground drawn by a shader with no single paint texture bakes one: `BIO.setGround(BIO.groundTex((x,z)=>colourAt(x,z),box,128),box)`.
   A page that reads the kit in place without a ground bound gets neither the tint nor the fade.

3. **The back-light (item 6).** `backlit:.3`-`.4` on the broadleaf leaf materials (thin leaves); not on needles or
   moss.

4. **Spin (B9).** A material whose kit options say `spin:true` now turns in the core's shader; a host that wrapped the
   core hook to do it (nsemiarid's `VARIANTS.spinUnique`, removed) drops its wrap and drives `BIO.SPIN.value`.

5. **The ground dither (X4).** Add `'31-core-dither.js'` to `CORE_BIOME` after `30-core-foliage.js` and replace the
   page's copy of the bomb with `const DITHER=BIO.DITHER;` (Korona, Farside). Then the functions are the same names.

6. **Two-tone bark per species (B3), once `20-core-kit.js` carries `aC2`.** Mark the shared bark materials and their
   buckets: `glossBarkMat(tex,key,{c2:true,alt,gloss})` and `BIO.bucket(fam,mat,{label,uvScale,c2:true})`; give each
   species that wants its own second colour an `alt2`, and wrap its hero builder: `BIO.c2=S.alt2==null?null:S.alt2;
   B[S.habit](T,st,lv);BIO.c2=null;` (nwlowlands `55`). Species without one keep the bucket's `alt`.

7. **Leaves held by the stem (leafset).** List `'31b-core-leafset.js'` after `30-core-foliage.js` (core/rand must be on
   the page). Give the crown items a stem spray, `BIO.def(item,BIO.geo.clump({stem:true}),mat,...)`, and place them
   with the twig's direction instead of a random turn:

   ```js
   const r=BIO.leafOn({a:[x-dx,y-dy,z-dz],b:[x,y,z]},1,{seed:KRAND.hash(salt,Math.round(x*50),Math.round(y*50),Math.round(z*50)),angle:.55,droop:.25});
   BIO.put(item,[x,y,z],BIO.leafQ(r),[s,s,s],col,extra);
   ```

   Keep drawing the old random turn (`qEuler(rr(..),rr(..),rr(..))`) and discard it, so the page's stream, and so
   everything placed after, does not move. Along a twig, `BIO.leafAlong(seg,n,{phyl:'opposite'|'alternate'|'whorl'|'spiral'})`.
   A single card: `BIO.geo.leafCard({stem:BIO.leafStem(meta)})` (the library's `meta.json`, or `[su,sv]` in image
   coordinates, v down). A frond (`BIO.geo.frond`, already pinned at its origin, blade along +x) takes `axis:'x'`.
   nhighlands' pilot is `NHL.LEAFSET` (`50` and `55` `clumpAt`; `?leafset=0` for the old look).

## Godot

- R8: `leaf.gdshader` reads the same global uniforms as core/atmos (`atm_wind`, `atm_gust_amp`, `atm_time`) and the same
  `atmGust` sum (core/atmos `GODOT.md`); the sway scale and lean are `1 + gustAmp*gain*atmGust(t, root.xz, wind)`.
- R5: a `sampler2D` ground colour, a `vec4` box and `vec4(k, gain, d0, d1)` in `leaf.gdshader`; the root is the
  MultiMesh instance origin (`MODEL_MATRIX * INSTANCE` origin).
- R7: `alpha_antialiasing_mode = ALPHA_ANTIALIASING_ALPHA_TO_COVERAGE` with `alpha_antialiasing_edge` the old cut-off.
- Back-light: `BACKLIGHT` in the leaf shader, scaled by the material's `backlit`.
- B3: a per-vertex `CUSTOM0` (the second colour) in `bark.gdshader` mode 2, 0 meaning the material's `alt`.
- B9: the turn in `vertex()` before the instance transform, angle `spin*(0.8+0.4*fract(h*3.7))+h*TAU`, `h` the hash of the
  instance origin with `(0.173,0.091,0.137)`.
- Dither: `ground.gdshader` writes the same `kh2`/`kbomb`/`kdither` functions; `BIO.ditherCell` is the check.
- Leafset: the placement is plain maths on KRAND (krand.gd has the same hash): the quaternion is the instance basis.
- The cross-fade hook: Godot's visibility ranges fade alpha only, so the port needs the same dither discard in its shaders.
