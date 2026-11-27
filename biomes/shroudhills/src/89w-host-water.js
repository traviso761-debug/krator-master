// ================================================================= HOST — core/water: emerald cove, ravine torrents & Sister-Cup sky-ponds [draw]
// Draws:
//   1. WATER.open sheltered inner emerald cove + outer ocean (Station 1: cove)
//   2. WATER.flow cobble/ironstone/granite torrents (all stations)
//   3. WATER.still storm-fed granite gnamma tarn (Station 3: cloaktor)
//   4. WATER.still + WATER.drawPools batched elevated Paired Sister-Cup Cistern Sky-Pond amber rainwater disks (Twist A)!
{
 const env = new THREE.Scene(), WENV = { environment: null };
 ATMOS.skylight({ renderer: renderer, sky: env, scene: WENV, ground: function(){ return new THREE.Color(0x3e523a); } });
}

const linCol = function(c){ return new THREE.Color(c).convertSRGBToLinear(); };
const WBOX = [-SR * 1.08, -SR * 1.08, SR * 1.08, SR * 1.08];

let SEA_WATER = null, SEA_DRAW = null, OUTER_DRAW = null;
let STREAM_WATER = null, STREAM_DRAW = null;
let TARN_WATER = null, TARN_DRAW = null;
let SKY_POND_SURFACES = [], SKY_POND_DRAW = null;

// 1. Sheltered Emerald Cove (Station 1)
if (SEA) {
 const COBBLE_TINT = linCol(0x88b4a4).getHex();
 const AMBER_RUNOFF = linCol(0x6e6834).getHex();
 SEA_WATER = WATER.open({
  name: 'Sheltered Shroudhills emerald cove',
  level: SEA.level,
  swell: SEA.swell,
  field: 0.22,
  bounds: WBOX,
  bed: terrainH,
  bedBox: WBOX,
  bedCell: 8,
  shore: { seeds: SEA.seeds },
  tint: {
   box: WBOX,
   cell: 10,
   at: function(x, z){
    const d = STAGE.coastD(x, z);
    if (d < -140) return null;
    const sd = streamDistAt(x, z);
    const k = smooth(-140, 0, d);
    if (sd < 45) return { c: AMBER_RUNOFF, a: 0.32 * smooth(45, 8, sd) * k };
    return { c: COBBLE_TINT, a: 0.14 * k };
   }
  }
 });
 SEA_DRAW = WATER.draw(SEA_WATER, {
  surf: false,
  breakers: true,
  renderOrder: 1,
  roughness: 0.14,
  metalness: 0.05,
  envMapIntensity: 0.38,
  ramp: [1.2, 12],
  pick: true,
  shallow: linCol(0x3a8874),
  deep: linCol(0x0d3238)
 });
 SEA_DRAW.mesh.userData.inspectLabel = 'Sheltered Shroudhills emerald cove';

 const OB = [-12000, -12000, 12000, 12000], cell = 60;
 const nx = Math.ceil((OB[2] - OB[0]) / cell), nz = Math.ceil((OB[3] - OB[1]) / cell);
 const dd = new Uint8Array(nx * nz), pad = 60;
 for (let j = 0; j < nz; j++) {
  for (let i = 0; i < nx; i++) {
   const x = OB[0] + (i + 0.5) * cell, z = OB[1] + (j + 0.5) * cell;
   dd[j * nx + i] = (x > WBOX[0] + pad + cell && x < WBOX[2] - pad - cell && z > WBOX[1] + pad + cell && z < WBOX[3] - pad - cell) ? 0 : 255;
  }
 }
 const OUTER_WATER = WATER.open({
  name: 'Northwestern Ocean toward Battered Isle',
  level: SEA.level - 0.15,
  swell: [[0.22, 54, 45, 0, 0.04]],
  field: 0.18,
  bounds: OB,
  mask: { x0: OB[0], z0: OB[1], cell: cell, nx: nx, nz: nz, data: dd }
 });
 OUTER_DRAW = WATER.draw(OUTER_WATER, {
  renderOrder: 0,
  roughness: 0.18,
  metalness: 0.05,
  envMapIntensity: 0.42,
  color: linCol(0x143840)
 });
 OUTER_DRAW.mesh.userData.inspectLabel = 'Northwestern Ocean toward Battered Isle';
 WATER.wetGround(GROUND_MAT, { surface: SEA_WATER });
}

// 2. Ravine / Cove / Tor Stream Torrent (WATER.flow, monotonically descending & terminating cleanly at SEA shoreline mouth)
if (STREAM) {
 const P = [];
 let yc = 1e9;
 for (let i = 0; i < STREAM.pts.length; i++) {
  const p = STREAM.pts[i];
  const gH = terrainH(p[0], p[1]);
  if (SEA && gH <= SEA.level) {
   if (P.length > 0) {
    const prev = STREAM.pts[i - 1], prevG = terrainH(prev[0], prev[1]);
    const f = prevG > SEA.level ? clamp((prevG - SEA.level) / Math.max(0.05, prevG - gH), 0, 1) : 0;
    const mx = lerp(prev[0], p[0], Math.min(1, f + 0.12)), mz = lerp(prev[1], p[1], Math.min(1, f + 0.12));
    P.push([mx, mz, SEA.level - 0.12]);
   }
   break;
  }
  const bedY = gH + STREAM.depth;
  yc = Math.min(yc, bedY);
  if (SEA) yc = Math.max(yc, SEA.level + 0.04);
  P.push([p[0], p[1], yc]);
 }
 if (P.length >= 2) {
  const mEnd = P[P.length - 1];
  const keepFn = SEA ? function(x, z){
   return clamp(Math.hypot(x - mEnd[0], z - mEnd[1]) / 26.0, 0, 1);
  } : null;
  STREAM_WATER = WATER.flow({
   name: STREAM.name,
   pts: P,
   width: STREAM.w * 2,
   speed: STREAM.speed == null ? 1.5 : STREAM.speed,
   rapids: [0.03, 0.11]
  });
  if (keepFn) STREAM_WATER.keepAt = keepFn;
  STREAM_DRAW = WATER.drawFlow(STREAM_WATER, Object.assign({
   shallow: linCol(0x526c54),
   deep: linCol(0x22362c),
   color: 0xffffff,
   roughness: 0.14,
   metalness: 0.05,
   envMapIntensity: 0.48,
   step: 6,
   across: 5,
   margin: 1.0,
   depthBias: 1.5,
   renderOrder: 2,
   pick: true,
   refine: true
  }, keepFn ? { keep: keepFn } : {}));
  STREAM_DRAW.mesh.userData.inspectLabel = STREAM.name;
 }
}

// 3. Summit Granite Gnamma Storm Tarn (Station 3: cloaktor)
if (TARN && WATER.still && WATER.drawPools) {
 const tarnPoly = [];
 for (let k = 0; k < 16; k++) {
  const a = k / 16 * TAU;
  tarnPoly.push([+(TARN.x + Math.cos(a) * TARN.rx).toFixed(2), +(TARN.z + Math.sin(a) * TARN.rz).toFixed(2)]);
 }
 TARN_WATER = WATER.still({
  name: TARN.name,
  level: TARN.level,
  poly: tarnPoly
 });
 TARN_DRAW = WATER.drawPools([TARN_WATER], {
  name: TARN.name,
  roughness: 0.07,
  metalness: 0.12,
  envMapIntensity: 0.62,
  renderOrder: 2,
  pick: true,
  gradient: { centre: 0x1e4448, rim: 0x6c928c, power: 1.3 }
 });
}

// 4. Twist A: Elevated Paired Sister-Cup Cistern Sky-Pond amber rainwater lenses (WATER.still + WATER.drawPools in ONE draw call!)
if (SHROUDHILLS.SKY_PONDS && SHROUDHILLS.SKY_PONDS.length && WATER.still && WATER.drawPools) {
 for (let i = 0; i < SHROUDHILLS.SKY_PONDS.length; i++) {
  const sp = SHROUDHILLS.SKY_PONDS[i];
  const surf = WATER.still({
   name: 'Sister-Cup Cistern Sky-Pond ' + (i + 1),
   level: sp.level,
   poly: sp.poly
  });
  surf._sisterCup = sp;
  SKY_POND_SURFACES.push(surf);
 }
 SKY_POND_DRAW = WATER.drawPools(SKY_POND_SURFACES, {
  name: 'Paired Sister-Cup Cistern Sky-Pond rainwater lenses',
  roughness: 0.05,
  metalness: 0.14,
  envMapIntensity: 0.68,
  renderOrder: 2,
  pick: true,
  gradient: { centre: 0x4e2c0a, rim: 0xb88424, power: 1.35 }
 });
}

if (WATER.breakupFlows) WATER.breakupFlows();

window._water = {
 sea: !!SEA_DRAW,
 stream: !!STREAM_DRAW,
 tarn: !!TARN_DRAW,
 skyPonds: SKY_POND_SURFACES.length,
 totalSurfaces: WATER.surfaces.length
};
