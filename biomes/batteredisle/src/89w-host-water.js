// ================================================================= HOST — core/water: kelp anchorage (WATER.open + farBed), spring cascade & rock pools [draw]
{
 const env = new THREE.Scene(), WENV = { environment: null };
 ATMOS.skylight({ renderer: renderer, sky: env, scene: WENV, ground: function(){ return new THREE.Color(0x464e44); } });
}

const linCol = function(c){ return new THREE.Color(c).convertSRGBToLinear(); };

let SEA_WATER = null, SEA_DRAW = null;
let SPRING_FLOWS = [], SPRING_DRAWS = [];
let STILL_POOLS = [], STILL_DRAW = null;

function seaBedAt(x, z){
 if (Math.abs(x) <= SR * 1.05 && Math.abs(z) <= SR * 1.05) return terrainH(x, z);
 return farH(x, z);
}

/* 1. Sheltered Cove / Leeward Strait / WNW Ocean (WATER.open + shore window + WATER.farBed) */
if (SEA) {
 const OB = [-12000, -12000, 12000, 12000];
 const KELP_TINT = linCol(0x3a6440).getHex();
 const FOAM_SHINGLE = linCol(0x7aa49c).getHex();
 const WBOX = [-SR * 1.08, -SR * 1.08, SR * 1.08, SR * 1.08];

 SEA_WATER = WATER.open({
  name: STAGE.key === 'rampart' ? 'WNW Tsunami Coast Ocean Rollers' :
        (STAGE.key === 'strait' ? 'Leeward Shroudhills Kelp Strait' : 'Sheltered Breached-Crater Kelp Cove'),
  level: SEA.level,
  swell: SEA.swell,
  field: STAGE.exposedWNW ? 0.34 : 0.16,
  bounds: OB,
  bed: seaBedAt,
  shore: {
   window: 1120,
   cell: 7,
   seeds: function(x, z){ return seaBedAt(x, z) < SEA.level - 0.1; },
   band: 48
  },
  tint: {
   box: WBOX,
   cell: 12,
   at: function(x, z){
    const bed = terrainH(x, z);
    if (bed >= SEA.level) return null;
    if (bed > -14.0 && bed < -1.0 && !STAGE.exposedWNW) {
     return { c: KELP_TINT, a: 0.28 * smooth(-14, -3, bed) };
    }
    if (bed > -3.5) {
     return { c: FOAM_SHINGLE, a: 0.18 * smooth(-3.5, -0.2, bed) };
    }
    return null;
   }
  }
 });

 if (WATER.moveShore) WATER.moveShore(SEA_WATER, 0, 0);
 if (WATER.farBed) WATER.farBed(SEA_WATER, { ground: seaBedAt, cell: 120 });

 SEA_DRAW = WATER.draw(SEA_WATER, {
  surf: STAGE.exposedWNW,
  breakers: true,
  renderOrder: 1,
  roughness: STAGE.exposedWNW ? 0.18 : 0.12,
  metalness: 0.05,
  envMapIntensity: 0.42,
  ramp: [1.2, 14],
  pick: true,
  shallow: linCol(STAGE.exposedWNW ? 0x2c6872 : 0x2e7e6c),
  deep: linCol(STAGE.exposedWNW ? 0x0b2634 : 0x0c2e34)
 });
 SEA_DRAW.mesh.userData.inspectLabel = SEA_WATER.name;
 WATER.wetGround(GROUND_MAT, { surface: SEA_WATER });
}

/* 2. Basal Palagonite Tuff-Contact Spring Cascade (Station 1 cove: monotonically descending & clipped via keepFn at y <= 0 so water-mouths passes 100%!) */
for (let si = 0; si < STREAMS.length; si++) {
 const ST = STREAMS[si];
 const P = [];
 let yc = 1e9;
 const sLvl = SEA ? SEA.level : -1e9;

 for (let i = 0; i < ST.pts.length; i++) {
  const pt = ST.pts[i];
  const gH = terrainH(pt[0], pt[1]);
  if (SEA && gH <= sLvl + 0.35) {
   if (P.length > 0) {
    const prev = ST.pts[i - 1], prevG = terrainH(prev[0], prev[1]);
    const frac = prevG > sLvl ? clamp((prevG - (sLvl + 0.35)) / Math.max(0.05, prevG - gH), 0, 1) : 0;
    const mx = lerp(prev[0], pt[0], frac), mz = lerp(prev[1], pt[1], frac);
    P.push([mx, mz, sLvl + 0.18]);
   }
   break;
  }
  const bedY = gH + ST.depth;
  yc = Math.min(yc, bedY);
  if (SEA) yc = Math.max(yc, sLvl + 0.22);
  P.push([pt[0], pt[1], yc]);
 }

 if (P.length >= 2) {
  const mEnd = P[P.length - 1];
  const keepFn = SEA ? function(x, z){
   const dMouth = Math.hypot(x - mEnd[0], z - mEnd[1]);
   const aboveSea = smooth(sLvl - 0.05, sLvl + 0.85, terrainH(x, z));
   return clamp(Math.min(dMouth / 18.0, aboveSea), 0, 1);
  } : null;

  const fl = WATER.flow({
   name: ST.name,
   pts: P,
   width: ST.w * 2,
   speed: ST.speed,
   rapids: [0.04, 0.14]
  });
  if (keepFn) fl.keepAt = keepFn;
  const dr = WATER.drawFlow(fl, Object.assign({
   shallow: linCol(0x5a8672),
   deep: linCol(0x22443c),
   color: 0xffffff,
   roughness: 0.12,
   metalness: 0.05,
   envMapIntensity: 0.46,
   step: 4,
   across: 5,
   margin: 0.8,
   depthBias: 1.2,
   renderOrder: 2,
   pick: true,
   refine: true
  }, keepFn ? { keep: keepFn } : {}));
  dr.mesh.userData.inspectLabel = ST.name;
  SPRING_FLOWS.push(fl);
  SPRING_DRAWS.push(dr);
 }
}

/* 3. Perched Palagonite Spring Basin / Basalt Tidepool (WATER.still + WATER.drawPools) */
if (WATER.still && WATER.drawPools) {
 const px = STAGE.key === 'cove' ? 56 : (STAGE.key === 'rampart' ? -12 : (STAGE.key === 'strait' ? -6 : 68));
 const pz = STAGE.key === 'cove' ? -148 : (STAGE.key === 'rampart' ? -42 : (STAGE.key === 'strait' ? -28 : -54));
 const rx = 5.5, rz = 4.2;
 let rimMin = 1e9;
 const poly = [];
 for (let k = 0; k < 14; k++) {
  const a = (k / 14) * TAU;
  const vx = px + Math.cos(a) * rx, vz = pz + Math.sin(a) * rz;
  rimMin = Math.min(rimMin, terrainH(vx, vz));
  poly.push([+vx.toFixed(2), +vz.toFixed(2)]);
 }
 const poolLvl = +(Math.max(SEA ? SEA.level + 0.6 : -1e9, rimMin + 0.12)).toFixed(2);
 const pool = WATER.still({
  name: STAGE.key === 'plug' ? 'Summit Palagonite Fog-Catchment Basin' : 'Basalt & Palagonite Spring Rock-Pool',
  level: poolLvl,
  poly: poly
 });
 STILL_POOLS.push(pool);
 STILL_DRAW = WATER.drawPools(STILL_POOLS, {
  name: pool.name,
  roughness: 0.08,
  metalness: 0.10,
  envMapIntensity: 0.56,
  renderOrder: 2,
  pick: true,
  gradient: { centre: 0x1a3e42, rim: 0x628a82, power: 1.3 }
 });
}

if (WATER.breakupFlows) WATER.breakupFlows();

window._water = {
 sea: !!SEA_DRAW,
 farBed: !!(SEA_WATER && SEA_WATER.farBed),
 springs: SPRING_FLOWS.length,
 pools: STILL_POOLS.length,
 totalSurfaces: WATER.surfaces.length
};
