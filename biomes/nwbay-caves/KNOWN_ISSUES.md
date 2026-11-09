# biomes/nwbay-caves: known issues

The kit's one page so far is the cave under nwbay's NE cenote (`python3 build.py`, `dist/nwbay-caves-cenote.html`; PLAN.md).

- [ ] **The ground is a copy.** nwbay's `groundBase` over the box, sampled on a 16 m raster on 2026-11-09 (`stations/cenote/44z-host-site.js`).
  If nwbay's ground changes, re-sample it from nwbay's page (served, in the browser console):
  `const x0=378,z0=-200,cell=16,nx=49,nz=49,a=new Uint16Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)a[j*nx+i]=Math.round(groundBase(x0+i*cell,z0+j*cell)*10);`
  then base64 the bytes (`btoa(String.fromCharCode(...new Uint8Array(a.buffer)))`) into `G.b64`, and check the cenote's rim (the probe does).
- [ ] **The other stations**: the SW cenote (1 km off; nwbay's `SINKS[2]`), the tiankeng (on the dry slope, its floor 86 m up: a dry cave, the
  plan's "own one-chamber network"), Ys's stacks' sumps (Ys's own, `settlements/ys`). And nwbay's page itself shows no cave under its cenote's
  water: its own floor at -9 is drawn there (nwbay's KNOWN_ISSUES "the stacks have no caves" stays open).
- [ ] **The world is chosen.** KKARST's sinks fall on a hashed lattice; world 7643 is the one of 400 tried whose sinks put one under the cenote.
  A change to KKARST's branch kind that moves its sinks needs the search again (the probe's cenote check fails if the sink moves away).
- **No halocline.** The bay's brackish water is one water: the fresh-over-salt shimmer a diver sees in the Yucatan's cenotes is not drawn.
- **Under water is a haze.** No caustics, no god rays through the water but the cenote's one cone; the haze is the scene's fog, switched by the
  eye's height (`89x-host-air.js`).
- **The cenote's bell is upright.** nwbay's cenote is turned 1.2 rad and stretched 1.1; KCAVERN's hall has no turn, so the bell's axes lie on
  x and z (its size is nwbay's). The throat at the rim is round at nwbay's mean radius.
- **The speleothems carry no texture coordinates** (`KSPELEO.mesh`): the calcite is set on them by KGROUND's world projection.
- **KSHADOW** is off at page load (`?shadow=1`); not measured here.
