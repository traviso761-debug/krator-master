// ================================================================= HOST — stage (Station 2: GRAFTED CANOPY GLEN & SHROUD-ANT RAVINE) [web]
// Scale Model 5.1 px (531, 252), +686 m ASL, Cfa 1,710 mm/yr, 1.47 atm (0.31 atm O2), g = 7.4 m/s2.
const STAGE = (function(){
 const SITE_META = SHROUDHILLS.SITES.canopy;

 const ravineAxisX = function(z){
  return 28 * Math.sin(z * 0.0036 + 0.4) + 12 * Math.cos(z * 0.0085 - 0.7);
 };

 const STREAM_PTS = (function(){
  const pts = [];
  for (let z = 980; z >= -980; z -= 24) {
   pts.push([ravineAxisX(z), z]);
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

 const PATH_PTS = (function(){
  const pts = [];
  for (let z = 520; z >= -520; z -= 26) {
   pts.push([ravineAxisX(z) + 23 + 3.5 * Math.sin(z * 0.009), z]);
  }
  return pts;
 })();

 const streamDist = function(x, z){ return polyDist(STREAM_PTS, x, z); };
 const pathDist = function(x, z){ return polyDist(PATH_PTS, x, z); };

 function groundH(x, z){
  const ax = ravineAxisX(z);
  const dx = x - ax;
  const adx = Math.abs(dx);
  const n1 = fbm(x * 0.0024 + 1.9, z * 0.0024 - 3.3, 601, 3) - 0.5;
  const n2 = fbm(x * 0.009 - 4.1, z * 0.009 + 2.2, 602, 2) - 0.5;

  const baseBed = 20 + 0.0165 * z;
  let wall = 19 * smooth(4.5, 22, adx) + 34 * Math.pow(smooth(18, 185, adx), 0.88) + 46 * smooth(160, 820, adx);
  wall += (26 * n1 + 6 * n2) * smooth(14, 95, adx);

  const pd = pathDist(x, z);
  const benchH = baseBed + 9.5 + 1.2 * n2;
  let h = baseBed + wall;
  if (pd < 8.5) {
   h = mix(h, benchH, smooth(8.5, 2.4, pd) * 0.88);
  }
  return h;
 }

 return {
  key: 'canopy',
  name: SITE_META.name,
  R: 1050,
  seed: 5202,
  site: SITE_META.sky,
  px51: SITE_META.px51,
  elevOffset: SITE_META.elevM,
  strataMode: 'ravine',
  air: { pressure: SITE_META.atm, humidity: 0.95 },
  clouds: { cover: 0.76 },
  fogDensity: 0.00052,
  weather: 'clear',
  belt: { y0: 45, y1: 195, windward: [-0.7071, -0.7071], density: 0.00095, depth: 50, lee: 0.55, rise: 0.35 },
  wind: [0.7071, 0.7071],
  ground: groundH,
  coastD: null,
  sea: null,
  stream: {
   name: 'Ironstone and coal-seam ravine torrent',
   pts: STREAM_PTS,
   w: 4.0,
   depth: 0.58,
   speed: 1.75
  },
  tarn: null,
  fields: {
   elevASL: function(x, z){ return SITE_META.elevM + (groundH(x, z) - 20); },
   coast: function(){ return 0; },
   ravine: function(x, z){ return smooth(68, 8, Math.abs(x - ravineAxisX(z))); },
   granite: function(x, z){
    return smooth(240, 520, Math.abs(x - ravineAxisX(z))) * smooth(0.58, 0.78, fbm(x * 0.006, z * 0.006, 608, 2)) * 0.45;
   },
   tor: function(){ return 0; },
   cobble: function(x, z){ return smooth(8.5, 3.0, streamDist(x, z)); },
   path: function(x, z){ return smooth(4.8, 1.8, pathDist(x, z)); },
   ironstone: function(x, z){
    const adx = Math.abs(x - ravineAxisX(z));
    return clamp(smooth(85, 6, adx) * 0.88 + 0.25 * smooth(0.4, 0.65, fbm(x * 0.01, z * 0.01, 609, 2)), 0, 1);
   },
   moss: function(x, z){
    return clamp(0.74 + 0.24 * smooth(90, 10, Math.abs(x - ravineAxisX(z))) - 0.55 * smooth(4.0, 1.5, pathDist(x, z)), 0, 1);
   }
  },
  farLift: function(x, z){
   const d = Math.hypot(x, z);
   return 950 * smooth(1100, 10500, d) * (0.65 + 0.55 * fbm(x * 0.00048 + 2, z * 0.00048 - 1, 611, 3)) +
          240 * (fbm(x * 0.0013, z * 0.0013, 612, 2) - 0.32) * smooth(1050, 3800, d);
  },
  works: [
   { kind: 'cairn', x: ravineAxisX(-95) + 21.5, z: -95, ry: 0.2, name: 'Yonni ravine scout smudge-cairn' },
   { kind: 'brazier', x: ravineAxisX(-88) + 21.0, z: -88, ry: 0.5, name: 'Yonni burning myrtle-smudge pacification brazier' },
   { kind: 'cairn', x: ravineAxisX(65) + 21.5, z: 65, ry: -0.4, name: 'Yonni upper glen smudge-cairn' },
   { kind: 'brazier', x: ravineAxisX(72) + 21.0, z: 72, ry: 0.8, name: 'Yonni aromatic smudge-resin brazier' },
   { kind: 'flagstones', x: ravineAxisX(-12) + 23.0, z: -12, ry: 0.05, name: 'Yonni dressed granite safe-trail flagstones' }
  ],
  coalLedges: [
   { x: ravineAxisX(-45) - 10.5, z: -45, w: 9.5, h: 2.6, d: 3.4, ry: 0.12 },
   { x: ravineAxisX(28) - 11.2, z: 28, w: 11.0, h: 3.0, d: 3.8, ry: -0.08 },
   { x: ravineAxisX(96) - 10.0, z: 96, w: 8.8, h: 2.4, d: 3.2, ry: 0.15 },
   { x: ravineAxisX(-118) + 11.5, z: -118, w: 9.2, h: 2.5, d: 3.2, ry: -0.1 }
  ],
  spine: [[0, -180], [0, -40], [0, 90], [0, 220], [90, 0]],
  exportBox: [-300, -300, 300, 320],
  viewList: [
   ['Under the Grafted Root-Hammock vault in the coal-and-ironstone ravine', ravineAxisX(-62), -62, 3.4, ravineAxisX(18), 18, 17.5],
   ['Ravine boulder torrent and exposed coal-seam ledges', ravineAxisX(-82) + 2.2, -82, 2.8, ravineAxisX(-25) - 6, -25, 3.2],
   ['Safe Smudge-Myrtle granite scout footpath and smudge-brazier', ravineAxisX(-108) + 23, -108, 2.8, ravineAxisX(-55) + 22, -55, 2.6],
   ['Second-floor canopy sea from the upper glen rim', -175, -165, 58, 15, 30, 24]
  ]
 };
})();
