// ================================================================= METROPOLIS — industry, the third of each kind  [draw]
// The owner, 2026-11-03: the ruins need industry; the Ancients kit's data center, robot factory, factory and fuel station come in in both
// their versions (46b), and each kind gets a third, new, for variety. These four are drawn here, in the kit's own manner and with its own
// helpers (the alternates' library, 8al-alt-00-lib.js: altCyl, altDome, altFin, altBand; kput's pieces; CONC and SHELL), so they go through
// the same pipeline as the kit's buildings: a builder fn(scene, gx, gz, d) run once into a hero (55), its storeys and cores read off what it
// draws (59), its plan on the grid (46d), its ruins cut from the whole (59b). No rng(): every figure here is fixed or a position hash, so
// nothing depends on what drew before it. The kit's decay (d) is not drawn: a ruin here is the page's cut.
//  - the Cooling Towers (a data center): a long blank server hall, four storeys, a ribbon of glass at each, fins every 8 m, its plant on the
//    roof; four hyperboloid cooling towers on a leg ring along its north side, a pipe bridge from the hall to each.
//  - the Gantry Hall (a robot factory): a sawtooth assembly hall, its north lights glazed, an office block at its west end; to the east a
//    yard under portal gantries, a crane's trolley on one.
//  - the Furnace Stacks (a factory): three furnace halls stepping down south (36, 24, 12 m), five tapered stacks on the highest, banded and
//    lit; an inclined conveyor from the lowest roof over an open ore bunker.
//  - the Spheres (a fuel station): a domed pump hall, six spherical tanks round it on leg rings, pipes to the hall, pumps on the forecourt.
/* a hollow block: four walls t thick and a roof slab, from y0 to y1 (its floors are read off it, 59) */
function mpiBlock(acc, x0, x1, z0, z1, y0, y1, t) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0, h = y1 - y0, cy = y0 + h / 2;
  acBox(acc, cx, cy, z0 + t / 2, w, h, t); acBox(acc, cx, cy, z1 - t / 2, w, h, t);
  acBox(acc, x0 + t / 2, cy, cz, t, h, d - 2 * t); acBox(acc, x1 - t / 2, cy, cz, t, h, d - 2 * t);
  acBox(acc, cx, y1 - 0.5, cz, w, 1, d);
}
/* a ribbon of glass at the middle of each storey on a face (altBand: lit cells by a position hash) */
function mpiRibbons(cx, cz, len, n, y0, y1, sh, h, d) { for (let y = y0 + sh / 2; y < y1 - 1; y += sh) altBand(cx, y, cz, len, h, n, d, true); }

/* ---- the Cooling Towers ---- */
function buildMpCoolers(scene, gx, gz, d) {
  KOFF = [gx, 0, gz]; const G = new THREE.Group(); G.position.set(gx, 0, gz); scene.add(G);
  const CM = CONC(d), SK = SHELL(d), acc = [], sk = [];
  /* the server hall: 120 x 48 m, four storeys of 6 m */
  mpiBlock(acc, -60, 60, -24, 24, 0, 24, 0.8);
  acBox(acc, 0, 24.6, -23.6, 120, 1.2, 0.8); acBox(acc, 0, 24.6, 23.6, 120, 1.2, 0.8);
  mpiRibbons(0, -24, 108, [0, 0, -1], 0, 24, 6, 1.4, d); mpiRibbons(0, 24, 108, [0, 0, 1], 0, 24, 6, 1.4, d);
  mpiRibbons(-60, 0, 40, [-1, 0, 0], 0, 24, 6, 1.4, d); mpiRibbons(60, 0, 40, [1, 0, 0], 0, 24, 6, 1.4, d);
  for (let x = -56; x <= 56; x += 8) for (const z of [-24.6, 24.6]) acBox(acc, x, 12, z, 0.5, 24, 1.2);
  /* the roof plant: chillers in a row, a duct along them */
  for (let i = 0; i < 6; i++) { const x = -45 + i * 18; acBox(acc, x, 26.8, -6, 12, 3.6, 8); acBox(acc, x, 26.8, 8, 10, 3.6, 6); kput('cell', [x, 26.8, -10.05], qFacing([0, 0, -1]), [8, 1.2, 1], i % 2 ? CYAN : WARM); }
  acBox(acc, 0, 29.4, 1, 104, 1.6, 2.4);
  /* the towers: hyperboloids (throat 9 m at 30 m), on a ring of sixteen legs; a pipe bridge from the hall to each */
  const TW = [-45, -15, 15, 45], ZT = 48, Y0 = 5, H = 44;
  TW.forEach((x, i) => {
    const g = lathe({ rFn: y => 9 * Math.sqrt(1 + Math.pow((y - 25) / 20, 2)), H, nu: 48, nv: 16 }); g.translate(x, Y0, ZT); sk.push(g);
    altRev(sk, x, ZT, 9 * Math.sqrt(1 + Math.pow(19 / 20, 2)), Y0 + H, 9 * Math.sqrt(1 + Math.pow(19 / 20, 2)) + 0.8, Y0 + H, 0, TAU, 48);
    const rb = 9 * Math.sqrt(1 + Math.pow(25 / 20, 2));
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, a2 = (k + 1) / 16 * TAU; beam('strutW', [x + Math.cos(a) * rb, 0, ZT + Math.sin(a) * rb], [x + Math.cos(a2) * rb, Y0 + 0.2, ZT + Math.sin(a2) * rb], 0.6, 0.6); }
    stripRing(x, Y0 + H - 2, ZT, 9 * Math.sqrt(1 + Math.pow(17 / 20, 2)) + 0.15, d, 24);
    beam('pipe', [x, 14, 24.4], [x, 14, ZT - 10.5], 1.2, 1.2); beam('pipe', [x + 3, 10, 24.4], [x + 3, 10, ZT - 11], 0.9, 0.9);
    for (const zz of [30, 34]) acBox(acc, x + 1.5, 6, zz, 0.6, 12, 0.6);
  });
  altMerge(acc, CM, G); meshMerged(sk, SK, G);
  KOFF = [0, 0, 0]; return G;
}

/* ---- the Gantry Hall ---- */
function buildMpGantry(scene, gx, gz, d) {
  KOFF = [gx, 0, gz]; const G = new THREE.Group(); G.position.set(gx, 0, gz); scene.add(G);
  const CM = CONC(d), SK = SHELL(d), acc = [], sk = [];
  /* the assembly hall: 160 x 60 m, walls 18 m, ten sawtooth bays of 16 m, their north lights (facing +x) glazed */
  mpiBlock(acc, -80, 80, -30, 30, 0, 18, 0.8);
  for (let i = 0; i < 10; i++) { const x0 = -80 + i * 16; altFin(sk, [[0, 0], [16, 7], [16, 0]], 60, x0, 18, 0, 0); altBand(x0 + 16, 21.5, 0, 58, 5.6, [1, 0, 0], d, true); }
  mpiRibbons(0, -30, 150, [0, 0, -1], 0, 18, 6, 1.2, d); mpiRibbons(0, 30, 150, [0, 0, 1], 0, 18, 6, 1.2, d);
  for (let x = -76; x <= 76; x += 8) for (const z of [-30.5, 30.5]) acBox(acc, x, 9, z, 0.6, 18, 1);
  /* the offices at the west end: 20 x 40 m, four storeys */
  mpiBlock(acc, -100, -80, -20, 20, 0, 24, 0.6);
  mpiRibbons(-90, -20, 18, [0, 0, -1], 0, 24, 6, 2.6, d); mpiRibbons(-90, 20, 18, [0, 0, 1], 0, 24, 6, 2.6, d); mpiRibbons(-100, 0, 38, [-1, 0, 0], 0, 24, 6, 2.6, d);
  acBox(acc, -90, 25.2, 0, 22, 1.4, 42);
  /* the yard: a slab, five portal gantries 14 m apart, a rail along each leg line, a trolley on the third */
  acBox(acc, 118, 0.15, 0, 76, 0.3, 64);
  for (let i = 0; i < 5; i++) { const x = 90 + i * 14; for (const z of [-28, 28]) acBox(acc, x, 11, z, 1.6, 22, 1.6); acBox(acc, x, 23, 0, 2, 2.6, 60); }
  for (const z of [-28, 28]) acBox(acc, 118, 24.6, z, 58, 0.6, 0.8);
  acBox(acc, 118, 20.8, 6, 6, 3.2, 8); beam('strutW', [118, 19.2, 6], [118, 4, 6], 0.25, 0.25);
  for (let i = 0; i < 4; i++) kput('boxW', [100 + i * 12, 1.3, -10], qEuler(0, 0, 0), [3, 2.6, 4], null);
  altMerge(acc, CM, G); meshMerged(sk, SK, G);
  KOFF = [0, 0, 0]; return G;
}

/* ---- the Furnace Stacks ---- */
function buildMpFurnace(scene, gx, gz, d) {
  KOFF = [gx, 0, gz]; const G = new THREE.Group(); G.position.set(gx, 0, gz); scene.add(G);
  const CM = CONC(d), SK = SHELL(d), acc = [], sk = [];
  /* three halls stepping down south: 36, 24 and 12 m */
  mpiBlock(acc, -60, 60, -50, -10, 0, 36, 1); mpiBlock(acc, -54, 54, -10, 20, 0, 24, 0.8); mpiBlock(acc, -48, 48, 20, 44, 0, 12, 0.8);
  mpiRibbons(0, -50, 110, [0, 0, -1], 0, 36, 6, 1.2, d); mpiRibbons(0, 20, 100, [0, 0, 1], 24, 36, 6, 1.2, d);
  mpiRibbons(0, 44, 90, [0, 0, 1], 0, 12, 6, 1.6, d);
  for (const sx of [-1, 1]) { mpiRibbons(sx * 60, -30, 36, [sx, 0, 0], 0, 36, 6, 1.2, d); mpiRibbons(sx * 54, 5, 26, [sx, 0, 0], 0, 24, 6, 1.2, d); mpiRibbons(sx * 48, 32, 20, [sx, 0, 0], 0, 12, 6, 1.6, d); }
  /* buttresses along the high hall */
  for (let x = -56; x <= 56; x += 14) altFin(acc, [[0, 0], [4, 0], [0.6, 30], [0, 30]], 1.2, x, 0, -50, Math.PI / 2);
  /* the stacks: tapered, 60 m over the roof, three bands each, a ring of light under the lip */
  [-48, -24, 0, 24, 48].forEach((x, i) => {
    const h = 54 + (i % 2 ? 0 : 8); altCyl(sk, x, 36, -30, 4.4, 2.8, h, 24, true);
    for (const f of [0.3, 0.6, 0.9]) { const y = 36 + h * f, r = 4.4 + (2.8 - 4.4) * f + 0.35; altRev(sk, x, -30, r, y, r, y + 1.2, 0, TAU, 24); }
    stripRing(x, 36 + h - 3, -30, 2.8 + 0.4, d, 12);
    acBox(acc, x, 37.5, -30, 11, 3, 11);
  });
  /* the ore bunker south (open-topped walls 8 m high) and the conveyor up to the lowest roof */
  const B0 = 58, B1 = 82; acBox(acc, 0, 4, B0, 64, 8, 1); acBox(acc, 0, 4, B1, 64, 8, 1); acBox(acc, -32, 4, (B0 + B1) / 2, 1, 8, B1 - B0); acBox(acc, 32, 4, (B0 + B1) / 2, 1, 8, B1 - B0);
  for (let x = -24; x <= 24; x += 16) acBox(acc, x, 4, (B0 + B1) / 2, 0.6, 8, B1 - B0 - 2);
  const cy0 = 12.5, cy1 = 20, cz0 = 42, cz1 = 70, L = Math.hypot(cz1 - cz0, cy1 - cy0); acBox(acc, 0, (cy0 + cy1) / 2 + 1, (cz0 + cz1) / 2, 3.2, 2.4, L, 0, -Math.atan2(cy1 - cy0, cz1 - cz0));
  for (const z of [52, 62]) { const y = cy0 + (cy1 - cy0) * (z - cz0) / (cz1 - cz0); for (const x of [-1.4, 1.4]) acBox(acc, x, y / 2, z, 0.6, y, 0.6); }
  altMerge(acc, CM, G); meshMerged(sk, SK, G);
  KOFF = [0, 0, 0]; return G;
}

/* ---- the Spheres ---- */
function buildMpSpheres(scene, gx, gz, d) {
  KOFF = [gx, 0, gz]; const G = new THREE.Group(); G.position.set(gx, 0, gz); scene.add(G);
  const CM = CONC(d), SK = SHELL(d), acc = [], sk = [];
  /* the pump hall: a drum 14 m round, two storeys of 5 m, a low dome; glass at each storey */
  altCyl(acc, 0, 0, 0, 14, 14, 10, 40); altDome(sk, 0, 10, 0, 14, 0, Math.PI / 2, 0.4, null, 40, 8);
  for (let k = 0; k < 12; k++) { const a = (k + 0.5) / 12 * TAU, c = Math.cos(a), s = Math.sin(a); for (const y of [2.5, 7.5]) kput('darkPane', [c * 14.1, y, s * 14.1], qFacing([c, 0, s]), [5, 1.6, 1], null); if (k % 3 === 0) kput('cell', [c * 14.3, 7.5, s * 14.3], qFacing([c, 0, s]), [3, 1, 1], k % 2 ? CYAN : WARM); }
  stripRing(0, 10.2, 0, 14.2, d, 28);
  /* six tanks, 8 m round, their bottoms 8 m up, each on a ring of eight legs with a girder at its equator; a pipe down to the hall */
  for (let i = 0; i < 6; i++) {
    const a = (i + 0.5) / 6 * TAU, x = Math.cos(a) * 34, z = Math.sin(a) * 34, yc = 16;
    altDome(sk, x, yc, z, 8, 0, Math.PI, 1, null, 32, 16);
    altRev(acc, x, z, 8.05, yc - 0.4, 8.05, yc + 0.4, 0, TAU, 32);
    for (let k = 0; k < 8; k++) { const b = k / 8 * TAU; acBox(acc, x + Math.cos(b) * 7.9, yc / 2, z + Math.sin(b) * 7.9, 0.7, yc, 0.7); }
    beam('pipe', [x - Math.cos(a) * 6, 6, z - Math.sin(a) * 6], [Math.cos(a) * 14.4, 3, Math.sin(a) * 14.4], 0.7, 0.7);
    beam('strutW', [x + Math.cos(a) * 8.6, 0, z + Math.sin(a) * 8.6], [x + Math.cos(a) * 8.6, yc + 8.5, z + Math.sin(a) * 8.6], 0.5, 0.5);
  }
  /* the forecourt: a slab and eight pumps facing south */
  acBox(acc, 0, 0.15, 62, 50, 0.3, 24);
  for (let i = 0; i < 8; i++) kput('boxW', [-21 + i * 6, 1.3, 62], qEuler(0, 0, 0), [1.2, 2.6, 1.6], null);
  altMerge(acc, CM, G); meshMerged(sk, SK, G);
  KOFF = [0, 0, 0]; return G;
}
