// ================================================================= MARR CITY — 86-bio-45-init.js
// Binds the vendored coastal/tropical biome host before 86-bio-50+.
// Tagged [G data] in PORT.md: no DOM, no geometry, no numeric || defaults.
const BIO_OBSTACLES = [];
const RUIN_RECTS = [];

function bioMaskFn(x, z) {
 if (Math.abs(x) > CITY.WORLD / 2 - 16 || Math.abs(z) > CITY.WORLD / 2 - 16) return 0;
 if (inWater(x, z, 8) || inBreakwater(x, z, 8)) return 0;
 if (isRoad(x, z) || klass(x, z) === KL.building) return 0;
 const m = maskAt(x, z);
 // City parks, Qartar de Gardonz mansion gardens, Paseo de Gardonz & finca orchards (painted #00ff00 in mg!)
 if (m[1] > 180 && m[0] < 60) return 0.96;
 // Inside walled city outside parks/gardens: no wild jungle floor clutter
 if (insideWall(x, z, -14)) return 0;
 if (z < coastZ(x) + 14) return 0;
 return m[0] > 200 ? 0.68 : 0;
}

function bioTreeMaskFn(x, z) {
 if (inWater(x, z, 14) || z < coastZ(x) + 20) return 0;
 if (isRoad(x, z) || klass(x, z) === KL.building) return 0;
 const m = maskAt(x, z);
 // Allow small ornamental palms/saplings inside dedicated city parks (KL.park), but no giant emergent jungle trees inside walled blocks
 if (insideWall(x, z, -24)) {
  return (klass(x, z) === KL.park && m[1] > 180 && m[0] < 60) ? 0.35 : 0;
 }
 return bioMaskFn(x, z) * 0.55;
}

BIO.init({
 THREE: THREE,
 scene: null,
 terrainH: (x, z) => terrainH(x, z),
 mask: bioMaskFn,
 obstacles: BIO_OBSTACLES,
 ticks: fn => FRAME_HOOKS_PRE.push(fn),
 seed: SEED_CITY,
 origin: [0, 0],
 err: m => reportErr('biome: ' + m),
 stat: (k, tris, inst) => {
  const key = 'biome/' + k.replace('jungle/', '');
  const t = TSTAT.by[key] || (TSTAT.by[key] = { tris: 0, inst: 0, meshes: 0 });
  t.tris += tris;
  t.inst += inst;
 }
});
