// ================================================================= HOST — stage (Station 1 default: COVE OF THE SISTER-CUPS) [web]
// Scale Model 5.1 px (497, 302), +50 m ASL, Am 2,698 mm/yr, 1.59 atm (0.33 atm O2), g = 7.4 m/s2.
// Sheltered NW coastal cove facing Battered Isle: calm emerald ocean cove (WATER.open) + cobble coastal glen torrent
// (WATER.flow), framed by granite-and-ironstone bluffs clothed in Buttressed Shroud-Mahogany and Weeping Amber-Podocarps
// laden with Paired Sister-Cup Cistern Sky-Ponds (A), plus a Yonni Spear-Queen smudge-cairn & brazier landing trailhead.
const STAGE = (function(){
 const SITE_META = SHROUDHILLS.SITES.cove;

 // Signed inland distance from cove shoreline (negative in ocean cove, positive inland)
 function coastD(x, z){
  const dx = x + 160, dz = z + 260;
  const bay = Math.hypot(dx * 0.92, dz * 1.05) - 340;
  const nwOpen = (x + z) * 0.7071 + 260;
  const wander = 28 * Math.sin(x * 0.0045 + 0.6) + 16 * Math.cos(z * 0.007 - 0.4);
  return Math.min(nwOpen + wander, bay + wander * 0.6);
 }

 // Coastal cobble stream course tumbling from SE hills (+78 m) into the sheltered inner cove mouth near (40, -60)
 const STREAM_PTS = (function(){
  const pts = [];
  for (let i = 0; i <= 36; i++) {
   const t = i / 36;
   const s = lerp(620, -65, t);
   const bend = 42 * Math.sin(t * 4.2 + 0.3);
   pts.push([s * 0.58 + bend + 45, s * 0.82 - bend * 0.4 - 12]);
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
  [76, -38], [98, 10], [126, 68], [162, 134], [208, 205], [262, 282], [320, 355]
 ];
 const pathDist = function(x, z){ return polyDist(PATH_PTS, x, z); };
 const streamDist = function(x, z){ return polyDist(STREAM_PTS, x, z); };

 const headlandK = function(x, z){
  const h1 = smooth(210, 55, Math.hypot(x - 190, z + 270));
  const h2 = smooth(210, 55, Math.hypot(x + 310, z - 95));
  return clamp(Math.max(h1, h2), 0, 1);
 };

 function groundH(x, z){
  const d = coastD(x, z);
  const n1 = fbm(x * 0.0022 + 3.1, z * 0.0022 - 1.7, 501, 3) - 0.5;
  const n2 = fbm(x * 0.0075 - 2.4, z * 0.0075 + 4.2, 502, 2) - 0.5;
  if (d < 0) {
   return -0.35 + 0.042 * d - 10.5 * smooth(0, -340, d) + 1.4 * n2 * smooth(-8, -90, d);
  }
  const sd = streamDist(x, z);
  const glenCut = smooth(85, 8, sd);
  let h = 0.35 + 3.2 * smooth(0, 38, d) + 54 * Math.pow(smooth(22, 460, d), 0.92) + 88 * smooth(380, 1050, d);
  h += (32 * n1 + 7.5 * n2) * smooth(25, 220, d);
  h += headlandK(x, z) * (26 + 10 * n2) * smooth(4, 48, d);
  h *= (1 - 0.42 * glenCut * smooth(0, 120, d));
  h -= 4.2 * smooth(14, 2.5, sd) * smooth(4, 32, d);
  const pd = pathDist(x, z);
  if (pd < 8) {
   h = mix(h, Math.max(1.8, h), smooth(8, 2, pd) * 0.25);
  }
  return h;
 }

 return {
  key: 'cove',
  name: SITE_META.name,
  R: 1150,
  seed: 5101,
  site: SITE_META.sky,
  px51: SITE_META.px51,
  elevOffset: SITE_META.elevM,
  strataMode: 'coastal',
  air: { pressure: SITE_META.atm, humidity: 0.94 },
  clouds: { cover: 0.72 },
  fogDensity: 0.00038,
  weather: 'clear',
  belt: { y0: 95, y1: 310, windward: [-0.7071, -0.7071], density: 0.00085, depth: 55, lee: 0.45, rise: 0.4 },
  wind: [0.7071, 0.7071],
  ground: groundH,
  coastD: coastD,
  sea: {
   level: 0,
   seeds: [[-850, -850], [-920, -420], [-420, -920]],
   swell: [[0.14, 42, 45, 0, 0.04], [0.08, 22, 62, 1.2, 0.03]],
   surf: false
  },
  stream: {
   name: 'Cove cobble torrent',
   pts: STREAM_PTS,
   w: 4.2,
   depth: 0.55,
   speed: 1.55
  },
  tarn: null,
  fields: {
   elevASL: function(x, z){ return SITE_META.elevM + Math.max(0, groundH(x, z)); },
   coast: function(x, z){ const d = coastD(x, z); return d < 0 ? 1 : smooth(520, 0, d); },
   ravine: function(x, z){ return smooth(72, 10, streamDist(x, z)) * smooth(10, 55, coastD(x, z)); },
   granite: function(x, z){
    const hk = headlandK(x, z);
    const steep = Math.hypot(groundH(x + 2, z) - groundH(x - 2, z), groundH(x, z + 2) - groundH(x, z - 2)) / 4;
    return clamp(hk * 0.78 + smooth(0.55, 0.95, steep) * 0.65, 0, 1);
   },
   tor: function(x, z){ return headlandK(x, z) * smooth(18, 42, groundH(x, z)) * 0.68; },
   cobble: function(x, z){
    const d = coastD(x, z);
    return clamp(Math.max(smooth(26, 4, d) * smooth(-3, 0.5, d), smooth(9.5, 3.2, streamDist(x, z)) * smooth(-2, 8, d)), 0, 1);
   },
   path: function(x, z){ return smooth(5.2, 1.8, pathDist(x, z)); },
   ironstone: function(x, z){
    return clamp(smooth(65, 12, streamDist(x, z)) * 0.75 + 0.35 * smooth(0.45, 0.68, fbm(x * 0.008 + 5, z * 0.008 - 3, 509, 2)), 0, 1);
   },
   moss: function(x, z){
    const d = coastD(x, z);
    return d < 4 ? 0 : clamp(0.62 + 0.32 * smooth(80, 14, streamDist(x, z)) - 0.55 * headlandK(x, z), 0, 1);
   }
  },
  farLift: function(x, z){
   const inland = (x + z) * 0.7071;
   if (inland < -450) return -18 * smooth(-450, -3500, inland);
   return 1150 * smooth(1200, 11000, inland) * (0.68 + 0.52 * fbm(x * 0.00045, z * 0.00045, 511, 3)) +
          260 * smooth(900, 4200, inland) * (fbm(x * 0.0011, z * 0.0011, 512, 2) - 0.3);
  },
  works: [
   { kind: 'cairn', x: 78, z: -34, ry: 0.4, name: 'Yonni Spear-Queen landing smudge-cairn' },
   { kind: 'brazier', x: 84, z: -30, ry: 0.0, name: 'Yonni aromatic myrtle-smudge trail brazier' },
   { kind: 'cairn', x: 128, z: 70, ry: 1.1, name: 'Yonni granite trail marker cairn' },
   { kind: 'stepping', x: 52, z: -2, ry: 0.6, name: 'Yonni dressed granite stream-ford stones' }
  ],
  coalLedges: [],
  spine: [[0, 0], [140, 120], [-120, 160], [240, 260], [60, -80]],
  exportBox: [-340, -340, 340, 340],
  viewList: [
   ['Sheltered emerald cove and Shroud-Mahogany bluffs', -240, -250, 22, 65, 35, 18],
   ['Cobble stream mouth and Yonni smudge-cairn trailhead', 42, -92, 6.5, 82, -26, 3.5],
   ['Granite headland cloak-bromeliads over the cove', 110, -320, 26, 185, -265, 16],
   ['Cloud-forest canopy rising into the sea-mist shroud', -310, -180, 78, 160, 180, 34],
   ['From the coastal bluff across the cove toward Battered Isle', 205, 198, 48, -280, -280, 0]
  ]
 };
})();
