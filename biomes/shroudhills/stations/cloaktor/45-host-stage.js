// ================================================================= HOST — stage (Station 3: STORM-WASHED CLOAK-TOR & YONNI WATCH-PLINTH) [web]
// Scale Model 5.1 px (505, 302), +1,284 m ASL, Cfa 3,561 mm/yr, 1.36 atm (0.28 atm O2), g = 7.4 m/s2.
const STAGE = (function(){
 const SITE_META = SHROUDHILLS.SITES.cloaktor;

 const torDome = function(x, z){
  const d0 = Math.hypot(x * 0.92, z * 1.08);
  const d1 = Math.hypot((x - 185) * 1.05, (z + 115) * 0.95);
  const d2 = Math.hypot((x + 210) * 0.95, (z - 140) * 1.05);
  const main = 198 * Math.exp(-Math.pow(d0 / 265, 1.75));
  const spur1 = 132 * Math.exp(-Math.pow(d1 / 195, 1.85));
  const spur2 = 118 * Math.exp(-Math.pow(d2 / 185, 1.85));
  return Math.max(main, spur1 * 0.92, spur2 * 0.9) + 28 * Math.exp(-Math.pow(d0 / 620, 2));
 };

 const TARN_SPEC = { x: 58, z: 18, rx: 14, rz: 11, level: 204.2 };
 const tarnR = function(x, z){
  return Math.hypot((x - TARN_SPEC.x) / TARN_SPEC.rx, (z - TARN_SPEC.z) / TARN_SPEC.rz);
 };

 const STREAM_PTS = (function(){
  const pts = [];
  for (let i = 0; i <= 28; i++) {
   const t = i / 28;
   const r = lerp(16, 480, t);
   const a = 0.28 + 0.16 * Math.sin(t * 3.5);
   pts.push([TARN_SPEC.x + Math.cos(a) * r, TARN_SPEC.z + Math.sin(a) * r]);
  }
  return pts;
 })();

 const polyDist = function(pts, x, z){
  let best = 1e9;
  for (let i = 0; i < pts.length - 1; i++) {
   const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1];
   const L2 = dx * dx + dz * dz || 1;
   const u = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / L2, 0, 1);
   best = Math.min(best, Math.hypot(a[0] + dx * u - x, a[1] + dz * u - z));
  }
  return best;
 };

 const PATH_PTS = [
  [-240, 165], [-175, 118], [-118, 76], [-68, 42], [-26, 16], [0, 0]
 ];
 const pathDist = function(x, z){ return polyDist(PATH_PTS, x, z); };
 const streamDist = function(x, z){ return polyDist(STREAM_PTS, x, z); };

 function groundH(x, z){
  const n1 = fbm(x * 0.0021 + 4.4, z * 0.0021 - 2.6, 701, 3) - 0.5;
  const n2 = fbm(x * 0.0085 - 1.8, z * 0.0085 + 3.7, 702, 2) - 0.5;
  const nRib = Math.abs(fbm(x * 0.009 + 7.1, z * 0.009 - 5.2, 703, 2) - 0.5);

  let h = 28 + torDome(x, z) + 28 * n1 + 5.5 * n2;
  h += smooth(115, 175, h) * (9.5 * smooth(0.08, 0.35, nRib));

  const d0 = Math.hypot(x, z);
  if (d0 < 22) {
   h = mix(h, 232 + 2.5 * Math.cos(d0 * 0.12), smooth(22, 6, d0) * 0.65);
  }

  const tr = tarnR(x, z);
  if (tr < 1.85) {
   const bowl = tr < 1.0 ? (TARN_SPEC.level - 2.2 * (1 - tr * tr)) : (TARN_SPEC.level + 0.65 + (tr - 1.0) * 6.5);
   h = mix(h, bowl, smooth(1.85, 1.08, tr));
  }

  const sd = streamDist(x, z);
  if (sd < 12 && tr > 1.05) {
   h -= 1.8 * smooth(12, 2, sd);
  }
  return h;
 }

 const torShare = function(x, z){
  const h = groundH(x, z);
  return smooth(118, 146, h);
 };

 return {
  key: 'cloaktor',
  name: SITE_META.name,
  R: 1150,
  seed: 5303,
  site: SITE_META.sky,
  px51: SITE_META.px51,
  elevOffset: 1052,
  strataMode: 'granite',
  air: { pressure: SITE_META.atm, humidity: 0.92 },
  clouds: { cover: 0.68 },
  fogDensity: 0.00032,
  weather: 'clear',
  belt: { y0: 42, y1: 156, windward: [-0.7071, -0.7071], density: 0.00135, depth: 58, lee: 0.42, rise: 0.48 },
  wind: [0.7071, 0.7071],
  ground: groundH,
  coastD: null,
  sea: null,
  stream: {
   name: 'Cloak-Tor granite cascade rill',
   pts: STREAM_PTS,
   w: 2.2,
   depth: 0.38,
   speed: 1.95
  },
  tarn: {
   name: 'Cloak-Tor storm-fed granite gnamma tarn',
   x: TARN_SPEC.x,
   z: TARN_SPEC.z,
   rx: TARN_SPEC.rx * 0.92,
   rz: TARN_SPEC.rz * 0.92,
   level: TARN_SPEC.level
  },
  fields: {
   elevASL: function(x, z){ return 1052 + groundH(x, z); },
   coast: function(){ return 0.12; },
   ravine: function(x, z){ return smooth(28, 4, streamDist(x, z)) * (1 - torShare(x, z)); },
   granite: function(x, z){
    const tk = torShare(x, z);
    const steep = Math.hypot(groundH(x + 2, z) - groundH(x - 2, z), groundH(x, z + 2) - groundH(x, z - 2)) / 4;
    return clamp(Math.max(tk * 0.96, smooth(0.48, 0.85, steep) * 0.75), 0, 1);
   },
   tor: torShare,
   cobble: function(x, z){ return smooth(5.5, 1.8, streamDist(x, z)) * 0.65; },
   path: function(x, z){ return smooth(4.5, 1.6, pathDist(x, z)); },
   ironstone: function(x, z){ return (1 - torShare(x, z)) * 0.35; },
   moss: function(x, z){ return clamp((1 - torShare(x, z)) * 0.78 + torShare(x, z) * 0.18, 0, 1); }
  },
  farLift: function(x, z){
   const d = Math.hypot(x, z);
   const seSpine = smooth(-2000, 12000, (x + z) * 0.7071);
   const ridges = 680 * Math.pow(Math.max(0, fbm(x * 0.00055 + 1.4, z * 0.00055 - 2.1, 711, 3)), 1.35);
   return (ridges + 1650 * seSpine) * smooth(1150, 9500, d) - 90 * smooth(2500, 9000, -(x + z) * 0.7071);
  },
  works: [
   { kind: 'yc1_plinth', x: 0, z: 0, ry: 0.35, r: 6.4, name: 'Yonni Spear-Queen YC1 round watch-drum plinth and rain-canopy reserve' },
   { kind: 'brazier', x: 8.2, z: 4.8, ry: 0.0, name: 'Yonni summit Spear-Queen signal smudge-brazier' },
   { kind: 'cairn', x: -28, z: 17, ry: 0.6, name: 'Yonni Cloak-Tor ridge-trail granite cairn' },
   { kind: 'cairn', x: -72, z: 44, ry: -0.3, name: 'Yonni fog-line boundary cairn above ant territory' }
  ],
  coalLedges: [],
  spine: [[0, 0], [-140, 95], [160, -90], [-220, -180], [220, 180]],
  exportBox: [-320, -320, 320, 320],
  viewList: [
   ['Storm-washed granite Cloak-Tor and Yonni YC1 watch-drum plinth above the fog belt', -46, 36, 9.5, 4, 2, 5.5],
   ['Scarlet and saffron lithophyte bromeliad cloaks and Mist-Sundew curtains', -78, -52, 6.5, -24, -18, 3.5],
   ['Summit granite gnamma storm tarn and 14 km cordillera panorama', 34, -14, 6.0, 120, 85, -8.0],
   ['Cloak-Tor granite crown piercing the billowing sea-mist canopy ocean', -310, 225, 95, 10, -10, 32],
   ['Marked Yonni ridge-path climbing out of the ant-patrolled cloud forest', -138, 92, 5.5, -18, 12, 12]
  ]
 };
})();
