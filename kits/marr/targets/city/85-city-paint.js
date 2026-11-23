// ================================================================= MARR CITY — 85-city-paint.js
// Painted ground albedo (gcv), buildable/vegetation mask (mv), and street/ground class grid (kv) over 1500 x 1500 m.
// Tagged [draw] in PORT.md.
reseed(424301);
const CS = 2048, PXS = CS / CITY.WORLD, px = v => (v + CITY.WORLD / 2) * PXS;
const gcv = document.createElement('canvas'); gcv.width = gcv.height = CS; const cg = gcv.getContext('2d');
const mv = KMASK.canvas(CS, CS); const mg = mv.getContext('2d');
const kv = KMASK.canvas(CS, CS); const kg = kv.getContext('2d');
const KL = { none: 0, plaza: 1, park: 2, boulevard: 3, minor: 4, ancient: 5, settler: 6, farm: 7, water: 8, court: 9, building: 10, rock: 11, field: 12 };
const KLCOL = k => 'rgb(' + k + ',' + k + ',' + k + ')';
const ROADS = [];
const PRECINCTS = [];

function cstroke(ctx, pts, w, col) {
 if (pts.length < 2) return;
 ctx.lineWidth = Math.max(1, w * PXS);
 ctx.strokeStyle = col;
 ctx.lineCap = 'round';
 ctx.lineJoin = 'round';
 ctx.beginPath();
 pts.forEach((p, i) => i ? ctx.lineTo(px(p[0]), px(p[1])) : ctx.moveTo(px(p[0]), px(p[1])));
 ctx.stroke();
}

function cdisc(ctx, x, z, r, col) {
 ctx.beginPath();
 ctx.arc(px(x), px(z), r * PXS, 0, 7);
 ctx.fillStyle = col;
 ctx.fill();
}

function cpoly(ctx, pts, col) {
 if (!pts || pts.length < 3) return;
 ctx.beginPath();
 pts.forEach((p, i) => i ? ctx.lineTo(px(p[0]), px(p[1])) : ctx.moveTo(px(p[0]), px(p[1])));
 ctx.closePath();
 ctx.fillStyle = col;
 ctx.fill();
}

const ROADCOL = { 3: '#827768', 4: '#8c8070', 5: '#968978', 6: '#7e7364' };

function road(pts, w, cls, opt) {
 opt = opt || {};
 const baseCol = opt.col || ROADCOL[cls] || '#8c8070';
 // Outer dark volcanic cantera curb, raised limestone banquette (acera), cobbled carriage-way & central stone drainage channel
 cstroke(cg, pts, w + 1.2, '#5e5448');
 cstroke(cg, pts, w + 0.4, '#bba98e');
 cstroke(cg, pts, Math.max(2.0, w - 0.9), baseCol);
 cstroke(cg, pts, 0.9, '#685e50');
 // Transverse cobblestone course bands along the street
 for (let i = 0; i < pts.length - 1; i++) {
  const ax = pts[i][0], az = pts[i][1], bx = pts[i + 1][0], bz = pts[i + 1][1];
  const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
  if (L < 2) continue;
  const nx = -dz / L, nz = dx / L, hw = Math.max(1.2, (w - 1.1) * 0.5);
  const step = 2.6;
  for (let d = 1.3; d < L - 1.0; d += step) {
   const cx = ax + (dx / L) * d, cz = az + (dz / L) * d;
   cstroke(cg, [[cx - nx * hw, cz - nz * hw], [cx + nx * hw, cz + nz * hw]], 0.45, ((Math.round(d) & 1) ? '#73685a' : '#9e917f'));
  }
 }
 cstroke(mg, pts, w + 2.8, '#000');
 cstroke(kg, pts, Math.max(2.0, w - 1.2), KLCOL(cls));
 const r = { pts, w, cls, id: ROADS.length, zone: opt.zone || null };
 ROADS.push(r);
 return r;
}

function disc(x, z, r, type, col) {
 cdisc(cg, x, z, r, col || (type === 'park' ? '#4a8844' : type === 'court' ? '#9e907c' : '#b2a38c'));
 cdisc(mg, x, z, r, type === 'park' ? '#00ff00' : '#000');
 cdisc(kg, x, z, r, KLCOL(type === 'park' ? KL.park : type === 'court' ? KL.court : KL.plaza));
}

function polyZone(pts, type, col) {
 cpoly(cg, pts, col || (type === 'park' ? '#4e8c48' : type === 'court' ? '#9e907c' : '#b2a38c'));
 cpoly(mg, pts, type === 'park' ? '#00ff00' : '#000');
 cpoly(kg, pts, KLCOL(type === 'park' ? KL.park : type === 'court' ? KL.court : KL.plaza));
}

function precinct(x, z, r, name) {
 PRECINCTS.push({ x, z, r, name });
}

function footprint(pts, col) {
 cpoly(cg, pts, col || 'rgba(76,58,42,.68)');
 cpoly(mg, pts, '#000');
 cpoly(kg, pts, KLCOL(KL.building));
}

function inPrecinct(x, z, pad) {
 const p = pad == null ? 0 : pad;
 for (const pr of PRECINCTS) if (Math.hypot(x - pr.x, z - pr.z) < pr.r + p) return pr;
 return null;
}

(function paintMarrBase() {
 // 1. Outer tropical coastal hills & lush green floor
 cg.fillStyle = '#3a5832'; cg.fillRect(0, 0, CS, CS);
 mg.fillStyle = '#fff'; mg.fillRect(0, 0, CS, CS);
 kg.fillStyle = KLCOL(KL.none); kg.fillRect(0, 0, CS, CS);

 for (let i = 0; i < 1800; i++) {
  cg.beginPath();
  cg.arc(rng() * CS, rng() * CS, rr(8, 42), 0, 7);
  cg.fillStyle = vPick(['rgba(48,92,42,.38)', 'rgba(72,112,56,.32)', 'rgba(98,88,54,.28)', 'rgba(38,74,44,.35)']);
  cg.fill();
 }

 // 2. Extramuros finca agricultural belt outside the new South Wall (z = 490..685)
 const fincaBelt = [
  [-365, 385], [-185, 530], [-42, 594], [41, 602], [122, 578], [245, 498], [360, 385],
  [360, 685], [-365, 685]
 ];
 cpoly(cg, fincaBelt, '#6e9454');
 cpoly(mg, fincaBelt, '#00ff00'); // Lush biome flora in finca orchards outside building footprints
 cpoly(kg, fincaBelt, KLCOL(KL.farm));

 // 3. Walled city cobblestone/limestone ground (extending along SOUTH_WALL_PTS to z = 595.3 m)
 const wallPoly = [];
 for (let z = -236; z <= 367; z += 12) wallPoly.push([westWallX(z) - 6, z]);
 for (let i = SOUTH_WALL_PTS.length - 1; i >= 0; i--) wallPoly.push([SOUTH_WALL_PTS[i][0], SOUTH_WALL_PTS[i][1] + 6]);
 for (let z = 369; z >= -182; z -= 12) wallPoly.push([eastWallX(z) + 6, z]);
 for (let x = 354; x >= -256; x -= 16) wallPoly.push([x, coastZ(x) - 4]);
 cpoly(cg, wallPoly, '#afa088');
 cpoly(mg, wallPoly, '#000'); // City interior excludes wild jungle trees unless explicitly marked park/garden (#00ff00)
 cpoly(kg, wallPoly, KLCOL(KL.settler));

 // Qartar de Gardonz lush garden district lawn & real biome garden flora mask (#00ff00 where not road or building!)
 const gardPoly = [[-370, -96], [-134, -96], [-112, 266], [-360, 266]];
 cpoly(cg, gardPoly, '#588c4a');
 cpoly(mg, gardPoly, '#00ff00');

 // 4. Ring Sea Harbour Bight & 5 Delta Canals (painted as dark seabed + blocked in mv + KL.water in kv)
 const seaPoly = [[-750, -750], [750, -750]];
 for (let x = 750; x >= -750; x -= 15) seaPoly.push([x, coastZ(x) + 4]);
 cpoly(cg, seaPoly, '#1d4454');
 cpoly(mg, seaPoly, '#000');
 cpoly(kg, seaPoly, KLCOL(KL.water));

 // Breakwater mole (Mol de Porta)
 const molePoly = [[-248, -242], [-248, -298], [68, -298], [68, -280], [-222, -280], [-222, -242]];
 cpoly(cg, molePoly, '#8c8274');
 cpoly(mg, molePoly, '#000');
 cpoly(kg, molePoly, KLCOL(KL.rock));
 cdisc(cg, 60, -288, 16, '#9a8e7e');

 // 5 Delta Canals extended through the new southern city quarter
 const zSt = [];
 for (let z = -150; z <= 680; z += 10) zSt.push(z);
 const gretaPts = zSt.map(z => [gretaCx(z), z]);
 cstroke(cg, gretaPts, 46, '#968a78'); // Stone quay margins
 cstroke(cg, gretaPts, 36, '#235264');
 cstroke(mg, gretaPts, 48, '#000');
 cstroke(kg, gretaPts, 38, KLCOL(KL.water));

 const zBr = [];
 for (let z = -150; z <= 625; z += 10) zBr.push(z);
 const gardPts = zBr.map(z => [gardonzCx(z), z]);
 cstroke(cg, gardPts, 28, '#968a78');
 cstroke(cg, gardPts, 21, '#265868');
 cstroke(mg, gardPts, 30, '#000');
 cstroke(kg, gardPts, 22, KLCOL(KL.water));

 const xedPts = zBr.map(z => [xedazCx(z), z]);
 cstroke(cg, xedPts, 27, '#968a78');
 cstroke(cg, xedPts, 20, '#265868');
 cstroke(mg, xedPts, 29, '#000');
 cstroke(kg, xedPts, 21, KLCOL(KL.water));

 const ismPts = [[-6, ismogCz(-6)], [80, ismogCz(80)], [166, ismogCz(166)]];
 cstroke(cg, ismPts, 21, '#968a78');
 cstroke(cg, ismPts, 15, '#285c6c');
 cstroke(mg, ismPts, 23, '#000');
 cstroke(kg, ismPts, 16, KLCOL(KL.water));

 const sauPts = [[-110, sautaCz(-110)], [0, sautaCz(0)], [128, sautaCz(128)]];
 cstroke(cg, sauPts, 20, '#968a78');
 cstroke(cg, sauPts, 14, '#285c6c');
 cstroke(mg, sauPts, 22, '#000');
 cstroke(kg, sauPts, 15, KLCOL(KL.water));
})();

let mData = null, kData = null, cData = null;
function cityBakeMasks() {
 mData = mg.getImageData(0, 0, CS, CS).data;
 kData = kg.getImageData(0, 0, CS, CS).data;
 cData = cg.getImageData(0, 0, CS, CS).data;
}
function maskAt(x, z) {
 const ix = Math.floor(px(x)), iz = Math.floor(px(z));
 if (ix < 0 || iz < 0 || ix >= CS || iz >= CS) return [0, 0];
 const i = (iz * CS + ix) * 4;
 return [mData[i], mData[i + 1]];
}
function klass(x, z) {
 const ix = Math.floor(px(x)), iz = Math.floor(px(z));
 if (ix < 0 || iz < 0 || ix >= CS || iz >= CS) return 0;
 return kData[(iz * CS + ix) * 4];
}
function canBuild(x, z) { return maskAt(x, z)[0] > 200; }
function isRoad(x, z) { const k = klass(x, z); return k >= 3 && k <= 5; }
function walkable(x, z) { const k = klass(x, z); return k === 1 || k === 2 || (k >= 3 && k <= 6) || k === 9; }
