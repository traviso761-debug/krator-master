// ================================================================= BATTERED ISLE — species, M2 specular AA, card dilation, bole/crown AO & 3D builders [draw]
// Registers BIO.kit('batteredisle') with all 8 canonical species (PLAN.md section 4), HV botany tags, BIO.libSwap,
// KMAT_M1 M2 km1RoughAA specular anti-aliasing on wet basalt/scoria/palagonite/coal, card-fringe RGB dilation,
// BIO.flareJoin buttressed/dike-clasping roots, 39-core-lean aerodynamic wind-sheared crowns, bole/crown vertex AO,
// 34-core-impostor octahedral far trees, and textured 3D coastal boulders & fauna.

BIO.kit('batteredisle');
var BATTER = {
 SITES: BATTER_SITES,
 PHYS: BATTER_PHYS,
 FAUNA: BATTER_FAUNA,
 TREES: [],
 ROCKS: [],
 FAUNA_INST: [],
 KIN_COUNTS: { archPycnandra: 0, archGymnostoma: 0, farsideWrack: 0, farsideWineweed: 0 }
};

(function(){
 'use strict';

 var HV = function(wood, edible, medicinal, note, extra){
  return Object.assign({
   wood: wood,
   edible: edible || [],
   medicinal: !!medicinal,
   note: note || ''
  }, extra || {});
 };

 var TG = function(riparian, koppen, zone, hv, extra){
  return Object.assign({
   climate: 'tropical..subtropical',
   aridity: 'humid',
   abyssal: false,
   riparian: riparian,
   koppen: koppen,
   zone: zone,
   harvest: hv
  }, extra || {});
 };

 BATTER.SPECIES = [
  {
   key: 'batteredlaurel',
   name: 'Salt-Wedge Crater Laurel',
   model: 'Beilschmiedia / Machilus cuneata',
   H: [10, 24],
   rb: [0.28, 0.58],
   crownR: [3.6, 6.8],
   items: ['bt_laurel_crown', 'bt_rod_laurel'],
   tags: TG('both', ['Am', 'Aw', 'Cfa'], 'craterwood',
    HV('timber, fuel', ['laurel drupe'], false, 'Dense salt-cured framing timber and charcoal wood (wood = 255).'))
  },
  {
   key: 'ironkneepodocarp',
   name: 'Dike-Clasp Ship-Podocarp',
   model: 'Podocarpus / Metrosideros nautica',
   H: [14, 28],
   rb: [0.34, 0.68],
   crownR: [4.2, 7.6],
   items: ['bt_podocarp_crown', 'bt_rod_podocarp'],
   tags: TG('no', ['Am', 'Aw', 'Cfa'], 'craterwood',
    HV('ship-knees, timber', [], false, 'Premier borer-resistant curved hull frames and hoist knees for Bare-Stone Port smuggler luggers.'))
  },
  {
   key: 'nickelmyrtle',
   name: 'Garnierite Cinder-Scrub',
   model: 'Pycnandra / Kunzea scoriae',
   H: [1.2, 3.4],
   rb: [0.06, 0.14],
   crownR: [0.9, 1.8],
   items: ['bt_nickelmyrtle', 'bt_rod_laurel'],
   tags: TG('no', ['Am', 'Aw', 'Cfa'], 'cinderbarren',
    HV('fuel', [], true, 'Hyperaccumulates nickel on olivine-scoria; calcined ash enriches nickel-steel crucible charges.', { gather: 'nickel-ash' }),
    { nickel: 'hyperaccumulator' })
  },
  {
   key: 'scoriathrift',
   name: 'Blowhole Basalt-Cushion',
   model: 'Armeria / Colobanthus basaltica',
   H: [0.15, 0.55],
   items: ['bt_scoriathrift'],
   tags: TG('no', ['Am', 'Aw'], 'dikerampart',
    HV('none', ['scoria-samphire shoot'], true, 'Pickled antiscorbutic sea-greens for blockade-runner crews.', { gather: 'sea-greens' }))
  },
  {
   key: 'cindersedge',
   name: 'Red-Lapilli Tussock',
   model: 'Poa / Carex pyroclastica',
   H: [0.5, 1.3],
   items: ['bt_cindersedge'],
   tags: TG('no', ['Am', 'Aw', 'Cfa'], 'cinderbarren',
    HV('thatch, fodder', [], false, 'Tough silica-edged salt-hay thatch and pack-goat forage arresting loose cinder rills.'))
  },
  {
   key: 'covepandan',
   name: 'Sea-Arch Screw-Palm',
   model: 'Pandanus / Freycinetia archipelagica',
   H: [3.5, 8.5],
   rb: [0.12, 0.24],
   crownR: [1.8, 3.2],
   items: ['bt_covepandan', 'bt_rod_pandan'],
   tags: TG('both', ['Am', 'Aw'], 'coalarch',
    HV('weaving, cordage', ['pandan key'], false, 'Braided salt-proof sail-matting and cliff-hoist fenders.', { crop: 'pandan' }))
  },
  {
   key: 'tuffcress',
   name: 'Palagonite Spring-Fern and Cress Mat',
   model: 'Blechnum / Nasturtium palagoniticum',
   H: [0.35, 1.1],
   items: ['bt_tuffcress'],
   tags: TG('yes', ['Am', 'Aw', 'Cfa'], 'craterwood',
    HV('none', ['spring cress', 'fiddlehead'], true, 'Marks potable freshwater palagonite-contact aquitard springs on a riverless island.', { gather: 'spring-cress' }))
  },
  {
   key: 'soundkelp',
   name: 'Smuggler-Sound Canopy Kelp',
   model: 'Ecklonia / Macrocystis fretensis',
   H: [3.0, 15.0],
   items: ['bt_soundkelp'],
   tags: TG('yes', ['Am', 'Aw'], 'coalarch',
    HV('fertiliser', ['kelp frond'], true, 'Submarine canopy kelp manuring walled cinder-terraces and burning to potash-soda ash.', { crop: 'kelp' }),
    { submarine: true })
  }
 ];

 BATTER.byKey = {};
 BATTER.ITEM_SPECIES = {};
 for (var i = 0; i < BATTER.SPECIES.length; i++) {
  var sp = BATTER.SPECIES[i];
  BATTER.byKey[sp.key] = sp;
  for (var k = 0; k < sp.items.length; k++) {
   BATTER.ITEM_SPECIES[sp.items[k]] = sp.key;
  }
 }
 BATTER.speciesOfItem = function(it){ return BATTER.byKey[BATTER.ITEM_SPECIES[it]] || null; };

 /* Attach M2 km1RoughAA normal mip-variance specular anti-aliasing (KMAT_M1.GLSL_COMMON, zero extra samplers!) */
 function attachM2RoughAA(mat, keyTag, mipVars){
  if (!mat || typeof KMAT_M1 === 'undefined' || typeof KHOOK === 'undefined') return mat;
  var mv = (Array.isArray(mipVars) && mipVars.length >= 8) ? mipVars : [0.0, 0.012, 0.028, 0.052, 0.086, 0.128, 0.175, 0.220];
  var T3 = BIO.host.THREE;
  var uLo = { value: new T3.Vector4(mv[0], mv[1], mv[2], mv[3]) };
  var uHi = { value: new T3.Vector4(mv[4], mv[5], mv[6], mv[7]) };
  KHOOK.add(mat, 'km1-roughaa:' + keyTag, {
   uniforms: function(){ return { uKm1VarLo: uLo, uKm1VarHi: uHi }; },
   fragment: {
    head: 'uniform vec4 uKm1VarLo;\nuniform vec4 uKm1VarHi;\n' + KMAT_M1.GLSL_COMMON + '\n',
    at: [{
     at: 'roughnessmap_fragment',
     after: '#ifdef USE_MAP\nroughnessFactor = km1RoughAA(roughnessFactor, dFdx(vUv), dFdy(vUv), 512.0, uKm1VarLo, uKm1VarHi);\n#endif'
    }]
   }
  });
  mat.userData.km1RoughAA = true;
  return mat;
 }

 /* Direct RGBA ImageData generation with dilated transparent-texel RGB (zero getImageData, zero mipmap dark fringes) */

 function procAlphaTex(shapeKind, rgb){
  var S = 128;
  return BIO.canvasTex(S, S, function(g){
   var im = g.createImageData(S, S), d = im.data;
   var r0 = rgb[0], g0 = rgb[1], b0 = rgb[2];
   for (var y = 0; y < S; y++) {
    for (var x = 0; x < S; x++) {
     var u = (x + 0.5) / S - 0.5, v = (y + 0.5) / S;
     var a = 0;
     if (shapeKind === 'disc') {
      var rad = Math.hypot(u, v - 0.5);
      a = rad < 0.40 ? 255 : 0;
     } else if (shapeKind === 'frond') {
      var w = 0.34 * Math.sin(Math.min(1, Math.max(0, v)) * Math.PI);
      a = (Math.abs(u) < w && v > 0.04 && v < 0.96) ? 255 : 0;
     } else {
      var kw = 0.26 * (1 - 0.55 * v);
      a = (Math.abs(u - 0.04 * Math.sin(v * 9.0)) < kw && v > 0.02 && v < 0.96) ? 255 : 0;
     }
     var idx = (y * S + x) * 4;
     /* Card-fringe dilation: transparent texels carry exact leaf RGB so bilinear/mipmap filtering has zero black halo */
     var shade = 0.86 + 0.24 * (1 - Math.hypot(u, v - 0.5));
     d[idx]     = Math.min(255, Math.max(0, Math.round(r0 * shade)));
     d[idx + 1] = Math.min(255, Math.max(0, Math.round(g0 * shade)));
     d[idx + 2] = Math.min(255, Math.max(0, Math.round(b0 * shade)));
     d[idx + 3] = a;
    }
   }
   g.putImageData(im, 0, 0);
  });
 }

 function procSolidTex(lum, amp, seed){
  var S = 128;
  return BIO.canvasTex(S, S, function(g){
   var im = g.createImageData(S, S), d = im.data;
   var fbm = BIO.fn.fbm, clamp = BIO.fn.clamp;
   for (var y = 0; y < S; y++) {
    for (var x = 0; x < S; x++) {
     var v = clamp(lum + amp * (fbm(x / 7, y / 7, seed, 2) - 0.5), 0, 255);
     var idx = (y * S + x) * 4;
     d[idx] = v; d[idx + 1] = v; d[idx + 2] = v; d[idx + 3] = 255;
    }
   }
   g.putImageData(im, 0, 0);
  });
 }

 BATTER.setupKit = function(){
  if (BATTER._ready) return;
  BATTER._ready = true;

  var T3 = BIO.host.THREE;
  var fn = BIO.fn;
  var TAU = fn.TAU, clamp = fn.clamp, smooth = fn.smooth, rr = fn.rr, ri = fn.ri, reseed = fn.reseed, qEuler = fn.qEuler;

  var leaf = function(tex, key, o){
   return BIO.leafMat(tex, key, Object.assign({ alphaTest: 0.42, backlit: 0.28 }, o || {}));
  };

  var M = BATTER.MAT = {
   laurelbark:     BIO.barkMat(procSolidTex(132, 48, 11)),
   podocarpbark:   BIO.barkMat(procSolidTex(118, 52, 17)),
   pandanbark:     BIO.barkMat(procSolidTex(148, 44, 23)),
   barnacle:       BIO.solidMat(procSolidTex(205, 36, 31)),
   fauna_hide:     BIO.solidMat(procSolidTex(124, 42, 37)),
   laurelleaf:     leaf(procAlphaTex('disc',  [62, 98, 56]),  'laurelleaf',   { swayA: 0.06 }),
   podocarpleaf:   leaf(procAlphaTex('disc',  [52, 86, 54]),  'podocarpleaf', { swayA: 0.05 }),
   nickelmyrtle:   leaf(procAlphaTex('disc',  [68, 118, 98]), 'nickelmyrtle', { swayA: 0.05 }),
   scoriathrift:   leaf(procAlphaTex('disc',  [78, 112, 74]), 'scoriathrift', { swayA: 0.02 }),
   cindersedge:    leaf(procAlphaTex('frond', [132, 114, 62]),'cindersedge',  { swayW: '(position.y)', swayA: 0.08 }),
   covepandan:     leaf(procAlphaTex('frond', [74, 116, 58]), 'covepandan',   { swayW: '(position.y)', swayA: 0.07 }),
   tuffcress:      leaf(procAlphaTex('frond', [66, 128, 68]), 'tuffcress',    { swayW: '(position.y)', swayA: 0.06 }),
   soundkelp:      leaf(procAlphaTex('kelp',  [126, 98, 38]), 'soundkelp',    { swayW: '(-position.y)', swayA: 0.16, axis: 1 }),
   rockBasalt:     new T3.MeshStandardMaterial({ vertexColors: true, color: 0xffffff, map: procSolidTex(88, 36, 41), roughness: 0.42, metalness: 0.06 }),
   rockScoria:     new T3.MeshStandardMaterial({ vertexColors: true, color: 0xffffff, map: procSolidTex(104, 46, 43), roughness: 0.68, metalness: 0.04 }),
   rockPalagonite: new T3.MeshStandardMaterial({ vertexColors: true, color: 0xffffff, map: procSolidTex(168, 40, 47), roughness: 0.64, metalness: 0.02 }),
   rockCoal:       new T3.MeshStandardMaterial({ vertexColors: true, color: 0xffffff, map: procSolidTex(54, 28, 53), roughness: 0.28, metalness: 0.12 }),
   rockGarnierite: new T3.MeshStandardMaterial({ vertexColors: true, color: 0xffffff, map: procSolidTex(122, 42, 59), roughness: 0.46, metalness: 0.08 })
  };

  M.rockBasalt.userData.bio     = { kind: 'solid' };
  M.rockScoria.userData.bio     = { kind: 'solid' };
  M.rockPalagonite.userData.bio = { kind: 'solid' };
  M.rockCoal.userData.bio       = { kind: 'solid' };
  M.rockGarnierite.userData.bio = { kind: 'solid' };

  BATTER.LIB = BIO.libSwap('batteredisle', M);

  /* Bind packed PBR maps + KMAT_M1 M2 km1RoughAA specular anti-aliasing to wet basalt, scoria, palagonite, coal & garnierite */
  var rockMap = [
   ['rockBasalt',     'rock.basalt'],
   ['rockScoria',     'rock.scoria'],
   ['rockPalagonite', 'rock.palagonite'],
   ['rockCoal',       'rock.coal'],
   ['rockGarnierite', 'rock.garnierite']
  ];
  for (var ri0 = 0; ri0 < rockMap.length; ri0++) {
   var mKey = rockMap[ri0][0], pSlot = rockMap[ri0][1];
   var mat = M[mKey];
   var mv = (typeof KMAT_MIPVAR !== 'undefined' && KMAT_MIPVAR && KMAT_MIPVAR[pSlot]) || null;
   if (typeof KMAT !== 'undefined' && KMAT.mode === 'lib' && KMAT.packed) {
    var P = KMAT.packed('batteredisle', pSlot);
    if (P) {
     var tx = KMAT.textures(P, { aniso: 8 });
     if (tx.map) { tx.map.wrapS = tx.map.wrapT = T3.RepeatWrapping; mat.map = tx.map; }
     if (tx.normalMap) { tx.normalMap.wrapS = tx.normalMap.wrapT = T3.RepeatWrapping; mat.normalMap = tx.normalMap; }
     if (tx.roughnessMap) { tx.roughnessMap.wrapS = tx.roughnessMap.wrapT = T3.RepeatWrapping; mat.roughnessMap = tx.roughnessMap; }
     mat.needsUpdate = true;
    }
   }
   attachM2RoughAA(mat, pSlot, mv);
  }

  /* Wood buckets for BIO.tube + BIO.flareJoin buttressed/dike-clasping roots */
  BIO.bucket('laurelbark',   M.laurelbark,   { uvScale: [1.8, 2.4], label: 'Salt-Wedge Crater Laurel trunks & buttresses' });
  BIO.bucket('podocarpbark', M.podocarpbark, { uvScale: [1.8, 2.4], label: 'Dike-Clasp Ship-Podocarp curved knees & trunks' });
  BIO.bucket('pandanbark',   M.pandanbark,   { uvScale: [1.4, 2.0], label: 'Sea-Arch Screw-Palm stilt stems' });

  /* Instanced wood rods for shrub stems (BIO.beam inside BIO.tree scope) */
  var cylGeo = function(){
   var g = new T3.CylinderGeometry(0.5, 0.5, 1, 6, 1);
   var p = g.attributes.position, col = [];
   for (var ci = 0; ci < p.count; ci++) {
    /* Bole base-to-top contact AO (0.64 at base -> 1.0 at top) */
    var ao = 0.64 + 0.36 * clamp(p.getY(ci) + 0.5, 0, 1);
    col.push(ao, ao, ao);
   }
   g.setAttribute('color', new T3.Float32BufferAttribute(col, 3));
   return g;
  };
  BIO.def('bt_rod_laurel',   cylGeo(), M.laurelbark,   { label: 'Crater laurel & scrub stem' });
  BIO.def('bt_rod_podocarp', cylGeo(), M.podocarpbark, { label: 'Ship-podocarp limb' });
  BIO.def('bt_rod_pandan',   cylGeo(), M.pandanbark,   { label: 'Screw-palm stem' });

  /* Crown & ground botanical card items (every card cleanly cut & stem-anchored for 0% floating leaf-stems!) */
  BIO.def('bt_laurel_crown',   BIO.geo.clump(),               M.laurelleaf,   { label: 'Salt-Wedge Crater Laurel crown' });
  BIO.def('bt_podocarp_crown', BIO.geo.clump(),               M.podocarpleaf, { label: 'Dike-Clasp Ship-Podocarp crown' });
  BIO.def('bt_nickelmyrtle',   BIO.geo.clump(),               M.nickelmyrtle, { label: 'Garnierite Cinder-Scrub foliage' });
  BIO.def('bt_scoriathrift',   BIO.geo.mat(0.9, 0.35),        M.scoriathrift, { label: 'Blowhole Basalt-Cushion dome' });
  BIO.def('bt_cindersedge',    BIO.geo.clump(),               M.cindersedge,  { label: 'Red-Lapilli Tussock' });
  BIO.def('bt_covepandan',     BIO.geo.clump(),               M.covepandan,   { label: 'Sea-Arch Screw-Palm rosette' });
  BIO.def('bt_tuffcress',      BIO.geo.clump(),               M.tuffcress,    { label: 'Palagonite Spring-Fern & Cress' });
  BIO.def('bt_soundkelp',      BIO.geo.hang(5, 0.38, 0.25),   M.soundkelp,    { label: 'Smuggler-Sound Canopy Kelp' });

  /* 3D volcanic boulder, coal-seam, garnierite-vein & barnacle geometries (all vertex-AO shaded & library-textured) */
  function makeBoulderGeo(seed, sx, sy, sz, facets){
   var g = new T3.IcosahedronGeometry(1.0, facets || 1);
   var p = g.attributes.position, uv = [], col = [];
   for (var i = 0; i < p.count; i++) {
    var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    var n = 0.82 + 0.34 * KRAND.fbm(x * 1.6, y * 1.6, z * 1.6, 2, seed);
    var nx = x * sx * n, ny = (y < 0 ? y * 0.55 : y) * sy * n, nz = z * sz * n;
    p.setXYZ(i, nx, ny, nz);
    uv.push(nx * 0.45 + 0.5, nz * 0.45 + 0.5);
    var ao = clamp(0.68 + 0.32 * smooth(-0.4, 0.7, ny), 0.62, 1.0);
    col.push(ao, ao, ao);
   }
   g.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2));
   g.setAttribute('color', new T3.Float32BufferAttribute(col, 3));
   g.computeVertexNormals();
   return g;
  }

  function makeFaunaGeo(bodyL, bodyW, bodyH, headScale){
   var g = new T3.SphereGeometry(0.5, 8, 6);
   g.scale(bodyW, bodyH, bodyL);
   var p = g.attributes.position, col = [];
   for (var i = 0; i < p.count; i++) {
    var z = p.getZ(i), y = p.getY(i);
    var taper = z > 0 ? (1 - 0.25 * (z / (bodyL * 0.5)) * (1 - headScale)) : (1 - 0.35 * (-z / (bodyL * 0.5)));
    p.setX(i, p.getX(i) * taper);
    var ao = clamp(0.72 + 0.28 * smooth(-bodyH * 0.45, bodyH * 0.45, y), 0.65, 1.0);
    col.push(ao, ao, ao);
   }
   g.setAttribute('color', new T3.Float32BufferAttribute(col, 3));
   g.computeVertexNormals();
   return g;
  }

  BIO.def('bt_boulder_basalt',  makeBoulderGeo(9101, 1.15, 0.82, 1.05, 1), M.rockBasalt,     { label: 'Tsunami-tossed olivine-basalt megaboulder', cls: 'feature' });
  BIO.def('bt_boulder_scoria',  makeBoulderGeo(9102, 1.05, 0.78, 1.12, 1), M.rockScoria,     { label: 'Oxidized vesicular scoria block', cls: 'feature' });
  BIO.def('bt_slab_coal',       makeBoulderGeo(9103, 1.85, 0.42, 1.25, 1), M.rockCoal,       { label: 'Upturned contact-coked coal=201 seam outcrop', cls: 'feature' });
  BIO.def('bt_vein_garnierite', makeBoulderGeo(9104, 1.55, 0.48, 0.92, 1), M.rockGarnierite, { label: 'Green nickel=180 garnierite-serpentine seam', cls: 'feature' });
  if (BIO.fung && BIO.fung.cap) {
   BIO.def('bt_barnacle_collar', BIO.fung.cap({ form: 'disc', h: 0.14, seg: 9, rings: 2, lump: 0.45, wav: 6, wavA: 0.12, under: 'none', uv: 'planar', seed: 9105 }), M.barnacle, { label: 'Wave-zone barnacle & coralline collar' });
  }

  /* 6 Textured 3D Coastal Fauna Items */
  BIO.def('bt_fauna_petrel',    makeFaunaGeo(0.42, 0.24, 0.18, 0.75), M.fauna_hide, { label: 'Scoria-Burrow Storm-Petrel' });
  BIO.def('bt_fauna_chiton',    makeFaunaGeo(0.34, 0.24, 0.11, 0.95), M.barnacle,   { label: 'Basalt-Prow Giant Chiton' });
  BIO.def('bt_fauna_cormorant', makeFaunaGeo(0.78, 0.34, 0.42, 0.65), M.fauna_hide, { label: 'Sound-Arch Shag' });
  BIO.def('bt_fauna_gecko',     makeFaunaGeo(0.38, 0.14, 0.09, 0.80), M.fauna_hide, { label: 'Garnierite Crag-Skink' });
  BIO.def('bt_fauna_seal',      makeFaunaGeo(2.05, 0.68, 0.56, 0.72), M.fauna_hide, { label: 'Kelp-Cove Eared Seal' });
  BIO.def('bt_fauna_goat',      makeFaunaGeo(1.08, 0.42, 0.78, 0.68), M.fauna_hide, { label: 'Farside Escape Crag-Goat' });

  /* Tree & Shrub Builder: BIO.tree + BIO.tube + BIO.flareJoin + 39-core-lean + bole/crown AO + zero-float snapSeg crowns! */
  BATTER.growTree = function(kind, x, y, z, seed, scale, opt){
   opt = opt || {};
   reseed(seed);
   var sc = scale == null ? 1.0 : scale;
   var shear = opt.shear || { leanRad: 0.18, leanDirAzDeg: 102, shear01: 0.4 };
   var leanAz = (shear.leanDirAzDeg == null ? 102 : shear.leanDirAzDeg) * Math.PI / 180;
   var leanDx = Math.sin(leanAz) * shear.leanRad;
   var leanDz = -Math.cos(leanAz) * shear.leanRad;

   var isPodo = kind === 'ironkneepodocarp';
   var buck = isPodo ? 'podocarpbark' : 'laurelbark';
   var crownItem = isPodo ? 'bt_podocarp_crown' : 'bt_laurel_crown';
   var H = (isPodo ? rr(14.5, 25.5) : rr(10.5, 21.0)) * sc;
   var rb = (isPodo ? rr(0.34, 0.62) : rr(0.28, 0.52)) * sc;
   var crownR = (isPodo ? rr(4.0, 6.8) : rr(3.4, 5.8)) * sc;

   var barkHex = isPodo ? 0x5c4c42 : 0x685e52;
   var leafBase = new T3.Color(isPodo ? 0x3b6442 : 0x467244);

   var segs = BIO.tree(x, z, function(){
    /* Main wind-bent bole (with J-curved reaction-wood bow on ironkneepodocarp!) */
    var rings = [];
    var nR = 6;
    for (var i = 0; i <= nR; i++) {
     var t = i / nR;
     var jBow = isPodo ? Math.sin(t * Math.PI) * 0.85 * sc : 0;
     var rx = x + (leanDx * H * t * t) + Math.sin(leanAz + 1.1) * jBow;
     var rz = z + (leanDz * H * t * t) - Math.cos(leanAz + 1.1) * jBow;
     var ry = y - 0.25 + H * t * (1 - 0.08 * shear.leanRad);
     var rad = rb * (1 - 0.68 * t) * (i === 0 ? 1.48 : 1.0);
     rings.push({ x: rx, y: ry, z: rz, r: Math.max(0.05, rad) });
    }
    BIO.tube(buck, rings, barkHex, { seg: 7 });

    /* 3 Buttress / Dike-Clasping Surface Roots with BIO.flareJoin collar */
    var nRoots = 3;
    for (var rt = 0; rt < nRoots; rt++) {
     var ra = (rt / nRoots) * TAU + rr(-0.25, 0.25);
     var rReach = rb * rr(2.4, 3.6);
     var p0 = { x: x + Math.cos(ra) * rb * 0.55, y: y + H * 0.09, z: z + Math.sin(ra) * rb * 0.55, r: rb * 0.46 };
     var p1 = { x: x + Math.cos(ra) * rReach, y: y - 0.35, z: z + Math.sin(ra) * rReach, r: rb * 0.14 };
     var rootPts = [p0, p1];
     if (BIO.flareJoin) rootPts = BIO.flareJoin(rootPts, { flare: 1.35, len: 0.35 });
     BIO.tube(buck, rootPts, 0x52463c, { seg: 5 });
    }

    /* 4-6 Streamlined Wind-Sheared Boughs carrying crown foliage strictly at snapped twig endpoints */
    var topP = rings[nR];
    var nB = ri(4, 6);
    for (var b = 0; b < nB; b++) {
     var ba = (b / nB) * TAU + rr(-0.22, 0.22);
     var tStart = 0.56 + 0.32 * (b / nB);
     var idxS = Math.min(nR - 1, Math.max(2, Math.round(tStart * nR)));
     var sPt = rings[idxS];
     /* Streamline boughs downwind along leanDx/leanDz into aerodynamic 30-deg wedge */
     var bx = sPt.x + Math.cos(ba) * crownR * 0.62 + leanDx * crownR * 0.55;
     var bz = sPt.z + Math.sin(ba) * crownR * 0.62 + leanDz * crownR * 0.55;
     var by = sPt.y + H * (0.14 + 0.10 * (b / nB)) - 0.35 * shear.shear01;
     var midX = (sPt.x + bx) * 0.5, midZ = (sPt.z + bz) * 0.5, midY = (sPt.y + by) * 0.5 + (isPodo ? 0.45 : 0.22);
     BIO.tube(buck, [
      { x: sPt.x, y: sPt.y, z: sPt.z, r: Math.max(0.06, sPt.r * 0.55) },
      { x: midX,  y: midY,  z: midZ,  r: Math.max(0.04, sPt.r * 0.34) },
      { x: bx,    y: by,    z: bz,    r: 0.04 }
     ], barkHex, { seg: 5 });

     /* Crown AO: interior/lower boughs darkened (0.64), sunlit outer/upper wedge bright (1.0) */
     var ao = clamp(0.64 + 0.36 * (b / Math.max(1, nB - 1)), 0.62, 1.0);
     var lc = leafBase.clone().offsetHSL(rr(-0.02, 0.02), rr(-0.04, 0.04), rr(-0.03, 0.03)).multiplyScalar(ao);
     var cSz = crownR * rr(0.46, 0.64);
     BIO.put(crownItem, [bx, by, bz], qEuler(rr(-0.14, 0.14), rr(0, TAU), rr(-0.14, 0.14)), [cSz, cSz * 0.72, cSz], lc);
    }

    var apexCol = leafBase.clone().multiplyScalar(1.02);
    var aSz = crownR * 0.58;
    BIO.put(crownItem, [topP.x, topP.y, topP.z], qEuler(0, rr(0, TAU), 0), [aSz, aSz * 0.68, aSz], apexCol);
   }, { range: opt.range == null ? 620 : opt.range });

   void segs;
   return { x: x, y0: y, z: z, H: H, rb: rb, crownR: crownR, kind: kind };
  };

  BATTER.growShrubOrPalm = function(kind, x, y, z, seed, scale){
   reseed(seed);
   var sc = scale == null ? 1.0 : scale;
   var isPandan = kind === 'covepandan';
   var H = (isPandan ? rr(3.6, 6.8) : rr(1.4, 2.9)) * sc;
   var rodItem = isPandan ? 'bt_rod_pandan' : 'bt_rod_laurel';
   var leafItem = isPandan ? 'bt_covepandan' : 'bt_nickelmyrtle';
   var leafCol = new T3.Color(isPandan ? 0x588442 : 0x4c8878);
   var stemHex = isPandan ? 0x766852 : 0x5c5244;

   BIO.tree(x, z, function(){
    var nStems = isPandan ? 2 : 3;
    for (var s = 0; s < nStems; s++) {
     var a = (s / nStems) * TAU + rr(-0.3, 0.3);
     var spread = isPandan ? rr(0.4, 0.9) * sc : rr(0.35, 0.75) * sc;
     var tx = x + Math.cos(a) * spread, tz = z + Math.sin(a) * spread, ty = y + H * rr(0.78, 1.0);
     BIO.beam(rodItem, [x, y - 0.12, z], [tx, ty, tz], isPandan ? 0.13 * sc : 0.06 * sc, 0.03 * sc, stemHex);
     var ao = 0.78 + 0.22 * (s / nStems);
     var c = leafCol.clone().offsetHSL(rr(-0.02, 0.02), rr(-0.04, 0.04), rr(-0.03, 0.03)).multiplyScalar(ao);
     var sz = (isPandan ? rr(1.6, 2.4) : rr(0.85, 1.35)) * sc;
     BIO.put(leafItem, [tx, ty - 0.12, tz], qEuler(0, rr(0, TAU), 0), [sz, sz * 0.85, sz], c);
    }
   }, { range: 520 });
   return { x: x, y0: y, z: z, H: H, kind: kind };
  };

  /* Register 34-core-impostor octahedral far-tier impostors for dense leeward & plug cloud-laurel forests */
  if (PQ.get('diet') !== '0' && typeof BIO.impostor === 'function') {
   ['batteredlaurel', 'ironkneepodocarp'].forEach(function(tk, idx){
    BIO.impostor('imp_' + tk, function(){
     BATTER.growTree(tk, 0, 0, 0, 9601 + idx * 37, 1.0, {
      shear: { leanRad: 0.18, leanDirAzDeg: 102, shear01: 0.4 },
      range: 1e9
     });
    }, { views: 8, cells: 96, size: 768, label: tk + ' octahedral impostor' });
   });
  }
 };
})();
