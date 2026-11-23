// ================================================================= MARR CITY — 84-city-geo.js
// Coastline, 5-canal river delta (Knal Greta, Knal de Gardonz, Knal de Xedaz, Knal de Ismoglarz, Knal de Sauta),
// steeper U-shaped walled enclosure (reaching z = +384 m with extramuros fincas to z = +480 m), and stepped elevation field.
// Tagged [G data] in PORT.md: no DOM, no Three.js, no numeric || defaults.
window.CITY = true;
window.DOORS = [];
window.CHIMNEYS = [];
const SEED_CITY = 424300;
const FRAME_HOOKS_PRE = [];
const CITY = {
 WORLD: 1500,
 PLATEAU: 3.2,
 SEA_Y: 0.0,
 CANAL_BED: -3.8,
 SITE_R: 580,
 SOUTH_WALL_Z: 595.3,
 R: 460,
 CHASM: -4.2,
 WALL_K: 1.0,
 QUALITY: 1,
 FAUNA: false
};

function smoothstep(e0, e1, x) {
 const t = clamp((x - e0) / (e1 - e0), 0, 1);
 return t * t * (3 - 2 * t);
}

function marInterp(x, xs, ys) {
 const n = xs.length;
 if (x <= xs[0]) return ys[0];
 if (x >= xs[n - 1]) return ys[n - 1];
 for (let i = 0; i < n - 1; i++) {
  if (x >= xs[i] && x <= xs[i + 1]) {
   const t = (x - xs[i]) / Math.max(1e-6, xs[i + 1] - xs[i]);
   return ys[i] + t * (ys[i + 1] - ys[i]);
  }
 }
 return ys[n - 1];
}

// 1. Steeper U-shaped coastline z(x): rocky NW headland (Poinda de Navigadarz at z = -254)
//    and NE headland (Kosta de Xedaz at z = -182) framing the central Ring Sea harbour bight (z = -138..-148)
const MAR_COAST_XS = [-750, -400, -372, -335, -282, -224, -178, -145, -120, -60, 0, 75, 154, 182, 255, 322, 354, 400, 750];
const MAR_COAST_ZS = [-120, -142, -168, -204, -242, -254, -220, -162, -148, -140, -138, -140, -148, -150, -164, -178, -182, -168, -140];

function coastZ(x) {
 return marInterp(x, MAR_COAST_XS, MAR_COAST_ZS);
}

function coastInland(x, margin) {
 const m = margin == null ? 12.0 : margin;
 return coastZ(x) + m;
}

// 2. River & Delta Canal Channels (extended south through the new z = 595.3 m South Wall):
// - Knal Greta (central main river channel separating Island I on the west from Islands II & III on the east)
const GRETA_ZS = [-150, -142, -50, 40, 140, 260, 384, 510, 600, 750];
const GRETA_CX = [-2.0, -2.0, -5.0, 3.0, -2.0, 2.0, 0.0, 2.0, 4.0, 6.0];
const GRETA_HW_ZS = [-150, -142, 295, 560, 620, 750];
const GRETA_HW_VS = [16.0, 16.0, 17.0, 18.0, 24.0, 28.0];

function gretaCx(z) {
 return marInterp(z, GRETA_ZS, GRETA_CX);
}

function gretaHw(z) {
 return marInterp(z, GRETA_HW_ZS, GRETA_HW_VS);
}

// - Knal de Gardonz (west river branch separating the Planned Left Bank from Inner Island I & South-West Island)
const GARD_ZS = [-150, -65, 30, 140, 245, 345, 450, 565, 625];
const GARD_CX = [-130.0, -138.0, -134.0, -128.0, -118.0, -104.0, -96.0, -86.0, -18.0];

function gardonzCx(z) {
 return marInterp(z, GARD_ZS, GARD_CX);
}

function gardonzHw() {
 return 10.5;
}

// - Knal de Xedaz (east river branch separating Inner Islands II & III & South-East Island from the Planned Right Bank)
const XED_ZS = [-150, -55, 40, 150, 250, 345, 450, 575, 625];
const XED_CX = [156.0, 164.0, 160.0, 152.0, 140.0, 120.0, 108.0, 96.0, 22.0];

function xedazCx(z) {
 return marInterp(z, XED_ZS, XED_CX);
}

function xedazHw() {
 return 10.0;
}

// - Knal de Ismoglarz (transverse delta channel separating Inner Island II [NE] from Inner Island III [SE])
function ismogCz(x) {
 return marInterp(x, [-5, 80, 168], [6.0, -2.0, 8.0]);
}

function ismogHw() {
 return 7.5;
}

// - Knal de Sauta (transverse delta channel at z ~ 312 m separating Inner Islands I & III from the Southern Delta Islands)
function sautaCz(x) {
 return marInterp(x, [-120, 0, 140], [310.0, 316.0, 310.0]);
}

function sautaHw() {
 return 7.0;
}

// Canal bank setback helpers
function gardL(z, margin) { const m = margin == null ? 10.0 : margin; return gardonzCx(z) - gardonzHw(z) - m; }
function gardR(z, margin) { const m = margin == null ? 9.0 : margin; return gardonzCx(z) + gardonzHw(z) + m; }
function gretaL(z, margin) { const m = margin == null ? 9.0 : margin; return gretaCx(z) - gretaHw(z) - m; }
function gretaR(z, margin) { const m = margin == null ? 9.0 : margin; return gretaCx(z) + gretaHw(z) + m; }
function xedL(z, margin) { const m = margin == null ? 9.0 : margin; return xedazCx(z) - xedazHw(z) - m; }
function xedR(z, margin) { const m = margin == null ? 10.0 : margin; return xedazCx(z) + xedazHw(z) + m; }

// 3. Outer Walled City Boundary Curves (Muraya de Marr — exact user South Wall polyline reaching z = 595.3 m)
const SOUTH_WALL_PTS = [
 [331.3, 369.0],
 [242.6, 492.1],
 [120.7, 570.9],
 [40.7, 595.3],
 [-42.5, 586.9],
 [-187.4, 523.4],
 [-332.9, 367.3]
];
const SOUTH_WALL_XS = [-332.9, -187.4, -42.5, 40.7, 120.7, 242.6, 331.3];
const SOUTH_WALL_ZS = [367.3, 523.4, 586.9, 595.3, 570.9, 492.1, 369.0];

function southWallZ(x) {
 return marInterp(x, SOUTH_WALL_XS, SOUTH_WALL_ZS);
}

const WEST_WALL_ZS = [-236, -180, -135, -80, 40, 155, 265, 367.3, 523.4, 586.9, 595.3];
const WEST_WALL_XS = [-256.0, -328.0, -364.0, -374.0, -374.0, -370.0, -362.0, -332.9, -187.4, -42.5, 40.7];
const EAST_WALL_ZS = [-182, -165, -55, 40, 155, 265, 369.0, 492.1, 570.9, 595.3];
const EAST_WALL_XS = [354.0, 354.0, 366.0, 366.0, 364.0, 356.0, 331.3, 242.6, 120.7, 40.7];

function westWallX(z) {
 return marInterp(z, WEST_WALL_ZS, WEST_WALL_XS);
}

function eastWallX(z) {
 return marInterp(z, EAST_WALL_ZS, EAST_WALL_XS);
}

function insideWall(x, z, margin) {
 const m = margin == null ? 0.0 : margin;
 if (z < coastZ(x) + m) return false;
 if (z > southWallZ(x) - m) return false;
 if (x < westWallX(z) + m) return false;
 if (x > eastWallX(z) - m) return false;
 return true;
}

// Breakwater Mole (Mol de Porta & Bigon de Mol at x = +60, z = -288)
function inBreakwater(x, z, pad) {
 const p = pad == null ? 0.0 : pad;
 // East-west arm from (-244, -290) to (+64, -288), half-width 9 m
 if (x >= -246 - p && x <= 68 + p && z >= -298 - p && z <= -280 + p) return true;
 // Lighthouse roundhead at (+60, -288), radius 15 m
 if (Math.hypot(x - 60, z + 288) <= 15.5 + p) return true;
 // Connecting neck from Poinda de Navigadarz (-234, -248) to (-238, -290)
 if (x >= -248 - p && x <= -222 + p && z >= -292 - p && z <= -242 + p) return true;
 return false;
}

// Harbour & Canal Water Queries
function inSea(x, z, pad) {
 const p = pad == null ? 0.0 : pad;
 if (inBreakwater(x, z, -p)) return false;
 return z < coastZ(x) + p;
}

function inCanal(x, z, pad) {
 const p = pad == null ? 0.0 : pad;
 // 1. Knal Greta (z >= coastZ(0) - 4)
 if (z >= coastZ(x) - 4 && Math.abs(x - gretaCx(z)) <= gretaHw(z) + p) return true;
 // 2. Knal de Gardonz (z in [-152, 625])
 if (z >= coastZ(x) - 4 && z <= 625 + p && Math.abs(x - gardonzCx(z)) <= gardonzHw(z) + p) return true;
 // 3. Knal de Xedaz (z in [-152, 625])
 if (z >= coastZ(x) - 4 && z <= 625 + p && Math.abs(x - xedazCx(z)) <= xedazHw(z) + p) return true;
 // 4. Knal de Ismoglarz (x between Knal Greta and Knal de Xedaz)
 if (x >= gretaCx(6) - 4 - p && x <= xedazCx(8) + 4 + p && Math.abs(z - ismogCz(x)) <= ismogHw() + p) return true;
 // 5. Knal de Sauta (x between Knal de Gardonz and Knal de Xedaz at z ~ 312)
 if (x >= gardonzCx(310) - 4 - p && x <= xedazCx(310) + 4 + p && Math.abs(z - sautaCz(x)) <= sautaHw() + p) return true;
 return false;
}

function inWater(x, z, pad) {
 return inSea(x, z, pad) || inCanal(x, z, pad);
}

// Signed distance to nearest water body (positive on dry land, negative in water)
function waterDist(x, z) {
 if (inBreakwater(x, z, 0)) {
  const dArm = Math.min(x - (-246), 68 - x, z - (-298), -280 - z);
  const dHead = 15.5 - Math.hypot(x - 60, z + 288);
  const dNeck = Math.min(x - (-248), -222 - x, z - (-292), -242 - z);
  return Math.max(dArm, dHead, dNeck);
 }
 let d = z - coastZ(x);
 if (z >= coastZ(x) - 6) {
  d = Math.min(d, Math.abs(x - gretaCx(z)) - gretaHw(z));
  if (z <= 625) {
   d = Math.min(d, Math.abs(x - gardonzCx(z)) - gardonzHw(z));
   d = Math.min(d, Math.abs(x - xedazCx(z)) - xedazHw(z));
  }
  if (x >= gretaCx(6) - 2 && x <= xedazCx(8) + 2) {
   d = Math.min(d, Math.abs(z - ismogCz(x)) - ismogHw());
  }
  if (x >= gardonzCx(310) - 2 && x <= xedazCx(310) + 2) {
   d = Math.min(d, Math.abs(z - sautaCz(x)) - sautaHw());
  }
 }
 return d;
}

// Compatibility polar/wallR helpers for shared Iziz modules (86-bio-45-init, 90c-city-atmos)
function polar(x, z) {
 return { r: Math.hypot(x, z - 120), t: Math.atan2(z - 120, x) };
}

function wallR(t) {
 const c = Math.cos(t), s = Math.sin(t);
 const rx = c < 0 ? 372 : 364;
 const rz = s < 0 ? 290 : 475;
 return 1 / Math.hypot(c / rx, s / rz);
}

const HILLKEYS = [];
const HILL = {};
const GATES = [];
const FLATS = [];
const FLATCELL = 64, FLATGRID = {};

function cityFlat(x, z, rx, rz, y, ry) {
 const rzn = rz == null ? rx : rz;
 const ryn = ry == null ? 0 : ry;
 const F = { x, z, rx, rz: rzn, y, ry: ryn };
 FLATS.push(F);
 const R = Math.hypot(rx, rzn) + 5;
 for (let i = Math.floor((x - R) / FLATCELL); i <= Math.floor((x + R) / FLATCELL); i++) {
  for (let j = Math.floor((z - R) / FLATCELL); j <= Math.floor((z + R) / FLATCELL); j++) {
   const k = i + ',' + j;
   (FLATGRID[k] || (FLATGRID[k] = [])).push(F);
  }
 }
}

function rawTerrainH(x, z) {
 // 1. Breakwater mole (Mol de Porta)
 if (inBreakwater(x, z, 0)) {
  const d = waterDist(x, z);
  return 3.4 * smoothstep(-1.5, 2.5, d);
 }
 const wd = waterDist(x, z);
 // 2. Open Ring Sea & 5 Delta Canals (always below SEA_Y = 0.0)
 if (wd < 0) {
  const bed = z < coastZ(x) ? -4.8 : CITY.CANAL_BED;
  return lerp(-0.35, bed, smoothstep(0, 2.4, -wd));
 }
 const zSW = southWallZ(x);
 // 3. Base dry-land elevation by quarter
 let h = CITY.PLATEAU;
 // Rocky NW Headland: Poinda de Navigadarz (Forta de Poinda at +9.5 m, Gilda de Navigadarz at +5.8 m)
 if (x < gardonzCx(z) && z < -95) {
  const fFort = (1 - smoothstep(18, 52, Math.hypot(x - (-216), z - (-224))));
  const fGuild = (1 - smoothstep(22, 55, Math.hypot(x - (-185), z - (-146))));
  h = 4.2 + 5.2 * fFort + 2.0 * fGuild + 1.2 * smoothstep(-160, -340, x);
 } else if (x < gardonzCx(z) && z <= 268) {
  // Left Bank: Qartar de Gardonz stepped garden terraces (+3.4 m at canal to +6.8 m at West Wall)
  const u = clamp((gardonzCx(z) - x) / Math.max(40, gardonzCx(z) - westWallX(z)), 0, 1);
  h = 3.2 + 3.4 * u + 0.35 * Math.sin(u * Math.PI * 3);
 } else if (x > xedazCx(z) && z <= 268) {
  // Right Bank: De Xedaz gentle rise from +2.8 m at canal/harbour to +4.8 m at East Wall
  const u = clamp((x - xedazCx(z)) / Math.max(40, eastWallX(z) - xedazCx(z)), 0, 1);
  h = 2.8 + 2.0 * u;
 } else if (z > 268 && z <= zSW + 14) {
  // Qartar Lo & Extended Southern Walled City Quarter (z = 268..595.3 m)
  h = 2.85;
 } else if (z > zSW + 14) {
  // Extramuros Fincas & surrounding Cistal valley hills outside the new South Wall
  h = 2.75 + 14.0 * smoothstep(zSW + 100, 735, z) + 12.0 * smoothstep(385, 680, Math.abs(x));
 } else {
  // Inner 3 Islands (Isla de Sidi Olda, Isla de Marchondaz, Isla de Kanal)
  h = 3.2;
  // Slightly raised civic terrace for Templa de Son & Si, Isqer Greta & Palas de Govarnar
  if (x >= -82 && x <= -18 && z >= -96 && z <= 84) {
   h = 3.6;
  }
 }
 // Outer coastal hills beyond West & East walls (only outside the walled perimeter!)
 if (z <= 368 && x < westWallX(z) - 18) {
  h += 18.0 * smoothstep(24, 260, westWallX(z) - x);
 } else if (z <= 369 && x > eastWallX(z) + 18) {
  h += 16.0 * smoothstep(24, 260, x - eastWallX(z));
 }
 // Subtle natural micro-relief outside roads/buildings
 h += 0.16 * (fbm(x * 0.012, z * 0.012, 3.7, 2) - 0.5);
 // Quay & shoreline bevel at water's edge
 if (wd < 1.8) {
  h = lerp(2.4, h, smoothstep(0, 1.8, wd));
 }
 return h;
}

terrainH = function(x, z) {
 const wd = waterDist(x, z);
 let h = rawTerrainH(x, z);
 if (wd < 0) return h;
 const L = FLATGRID[Math.floor(x / FLATCELL) + ',' + Math.floor(z / FLATCELL)];
 if (L) {
  for (let i = 0; i < L.length; i++) {
   const F = L[i];
   const dx = x - F.x, dz = z - F.z;
   const c = Math.cos(F.ry), s = Math.sin(F.ry);
   const lx = Math.abs(dx * c - dz * s), lz = Math.abs(dx * s + dz * c);
   const d = Math.max(lx - F.rx, lz - F.rz);
   if (d < 3.5) {
    const k = (1 - smoothstep(0, 3.5, Math.max(0, d))) * smoothstep(0, 1.5, wd);
    h = lerp(h, F.y, k);
   }
  }
 }
 return h;
};
