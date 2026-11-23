// ================================================================= HOST — terrainH, waterH, fields & BIO.init [web]
const SR = STAGE.R;
const _tm = { x: NaN, z: NaN, h: 0 };
function terrainH(x, z){
 if (x === _tm.x && z === _tm.z) return _tm.h;
 const h = STAGE.ground(x, z);
 _tm.x = x; _tm.z = z; _tm.h = h;
 return h;
}

const SEA = STAGE.sea || null;
const STREAMS = STAGE.streams || [];

function waterH(x, z){
 if (SEA && terrainH(x, z) < SEA.level + 0.35) return SEA.level + BATTER_STATE.drawdownM;
 if (STREAMS.length && STAGE.streamDistAt(x, z) < 4.5) return terrainH(x, z) + 0.35;
 return -1e9;
}

const OBSTACLES = [];
const waterMask = function(x, z){
 if (SEA && terrainH(x, z) < SEA.level + 0.25) return 0;
 if (STREAMS.length && STAGE.streamDistAt(x, z) < 3.6) return 0;
 return 1;
};

const FIELD = {
 elevASL: STAGE.fields.elevASL,
 dike: STAGE.fields.dike,
 scoria: STAGE.fields.scoria,
 palagonite: STAGE.fields.palagonite,
 shingle: STAGE.fields.shingle,
 coal: STAGE.fields.coal,
 garnierite: STAGE.fields.garnierite,
 spring: STAGE.fields.spring,
 wet: function(x, z){ return clamp(0.66 + 0.34 * STAGE.fields.spring(x, z), 0, 1); },
 rock: function(x, z){ return clamp(STAGE.fields.dike(x, z) + STAGE.fields.coal(x, z) * 0.6, 0, 1); },
 slope: function(x, z){
  const e = 2.0;
  const gx = (terrainH(x + e, z) - terrainH(x - e, z)) / (2 * e);
  const gz = (terrainH(x, z + e) - terrainH(x, z - e)) / (2 * e);
  return Math.hypot(gx, gz);
 }
};

BIO.init({
 tags: 'batteredisle',
 THREE: THREE,
 scene: scene,
 terrainH: terrainH,
 waterH: waterH,
 mask: waterMask,
 obstacles: OBSTACLES,
 ticks: tick,
 seed: STAGE.seed,
 origin: STAGE.spine,
 center: [0, 0],
 fields: FIELD,
 register: REGISTER,
 err: reportErr,
 eye: function(){ return [camera.position.x, camera.position.y, camera.position.z]; },
 lod: { hero: 240, mid: 620, far: 2200, floor: [220, 520] }
});
BIO.setSun(SUN_POS);
BIO.host.batteredisle = {
 station: STAGE.key,
 site: SITE,
 wind: STAGE.wind,
 trimElevM: STAGE.trimElevM,
 lithology: STAGE.lithology,
 exposedWNW: STAGE.exposedWNW,
 elevOffset: STAGE.elevOffset,
 dikeInfoAt: STAGE.dikeInfoAt,
 streamDistAt: STAGE.streamDistAt
};
_mark('bio-init');
