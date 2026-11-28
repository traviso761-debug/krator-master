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
 PALMS: [],
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
  },
  {
   key: 'coconut',
   name: 'Drift-Sown Coconut Palm',
   model: 'Cocos nucifera',
   H: [6.8, 14.2],
   rb: [0.22, 0.34],
   crownR: [3.2, 4.6],
   items: ['bt_palmtrunk', 'bt_palm', 'bt_coconut_nut'],
   tags: TG('both', ['Am', 'Aw'], 'coalarch',
    HV('timber, thatch, coir, cordage', ['coconuts'], false, 'Drift-sown along sheltered ESE/SSE wave-shadow coves above surf splash; plaited frond thatch and rot-proof coir mooring warps.', { crop: 'coconut' }),
    { strand: true })
  },
  {
   key: 'seatamanu',
   name: 'Leeward Sea-Tamanu',
   model: 'Calophyllum inophyllum',
   H: [6.5, 13.5],
   rb: [0.24, 0.48],
   crownR: [3.2, 5.4],
   items: ['bt_tamanu_crown', 'bt_rod_laurel'],
   tags: TG('no', ['Am', 'Aw'], 'coalarch',
    HV('timber (ship-ribs), knees, carving, resin', [], true, 'Crooked interlocking-grain coastal hardwood prized for smuggler lugger ribs and knees; pressed nut oil caulks hull seams.', { strand: true }),
    { strand: true })
  },
  {
   key: 'seahibiscus',
   name: 'Yellow-Belled Sea-Hibiscus',
   model: 'Hibiscus tiliaceus',
   H: [2.5, 5.5],
   rb: [0.08, 0.16],
   crownR: [1.6, 2.8],
   items: ['bt_hibiscus_fol', 'bt_hibiscus_bloom'],
   tags: TG('both', ['Am', 'Aw'], 'coalarch',
    HV('bast, cordage, fibre, knees', [], false, 'Inner bast stripped and retted in cove pools into salt-proof rigging cordage, caulking oakum and net twine; light outrigger knees.'),
    { strand: true })
  },
  {
   key: 'craterfern',
   name: 'Ravine Caudex Tree-Fern',
   model: 'Cyathea cratericola',
   H: [2.4, 5.8],
   rb: [0.10, 0.18],
   crownR: [1.8, 3.0],
   items: ['bt_fern_frond'],
   tags: TG('yes', ['Am', 'Aw', 'Cfa'], 'craterwood',
    HV('timber (rot-slow caudex posts), thatch', ['fiddlehead'], false, 'Fibrous caudex trunks set as damp ravine retaining posts; arching bipinnate fronds bundled for shed thatch.'))
  },
  {
   key: 'beachsheoak',
   name: 'Coastal Strand Ironwood',
   model: 'Casuarina equisetifolia',
   H: [6.5, 14.5],
   rb: [0.20, 0.38],
   crownR: [2.8, 4.6],
   items: ['bt_sheoak_crown', 'bt_sheoak_drape'],
   tags: TG('no', ['Am', 'Aw'], 'coalarch',
    HV('fuel (smokeless charcoal), timber', [], false, 'Burns nearly smokeless for veiled night forging at Bare-Stone Port; Frankia root nodules fix nitrogen in sterile scoria.'),
    { strand: true })
  },
  {
   key: 'saltnaupaka',
   name: 'Leeward Salt-Naupaka',
   model: 'Scaevola taccada',
   H: [0.8, 2.2],
   items: ['bt_naupaka_fol', 'bt_naupaka_bloom'],
   tags: TG('no', ['Am', 'Aw'], 'coalarch',
    HV('none', [], true, 'Fleshy coastal leaves crushed as a soothing salt-burn poultice and anti-fogging spyglass wipe.'),
    { strand: true })
  },
  {
   key: 'cinderglory',
   name: 'Cinder Beach-Glory',
   model: 'Ipomoea pes-caprae',
   H: [0.12, 0.38],
   items: ['bt_cinderglory', 'bt_glory_bloom'],
   tags: TG('no', ['Am', 'Aw'], 'coalarch',
    HV('cordage (rough binding)', [], true, 'Creeping sand-binding runners arrest loose scoria beach berms; leaves steeped externally for sea-sores.'),
    { strand: true })
  },
  {
   key: 'archfern',
   name: 'Palagonite Sea-Arch Spleenwort',
   model: 'Asplenium marinum',
   H: [0.25, 0.75],
   items: ['bt_archfern'],
   tags: TG('no', ['Am', 'Aw', 'Cfa'], 'coalarch',
    HV('none', ['spleenwort frond'], true, 'Salt-tolerant tuff-ledge fern chewed by sea-arch lookouts as an antiscorbutic green.'))
  },
  {
   key: 'olivinesheoak',
   name: 'Olivine Maquis She-Oak',
   model: 'Gymnostoma deplancheanum',
   H: [1.8, 4.8],
   rb: [0.07, 0.16],
   crownR: [1.2, 2.2],
   items: ['bt_olivinesheoak'],
   tags: TG('no', ['Am', 'Aw', 'Cfa'], 'cinderbarren',
    HV('fuel (dense ironwood), hafts', [], false, 'Hot-burning ultramafic ironwood fuel and tool hafts; nitrogen-fixing root nodules enrich barren olivine lapilli.'),
    { ultramafic: true })
  },
  {
   key: 'nickelphyllanthus',
   name: 'Emerald-Sap Nickel Shrub',
   model: 'Phyllanthus balgooyi',
   H: [1.2, 3.2],
   rb: [0.05, 0.12],
   crownR: [0.9, 1.7],
   items: ['bt_phyllanthus'],
   tags: TG('no', ['Am', 'Aw', 'Cfa'], 'cinderbarren',
    HV('fuel', [], false, 'Hyperaccumulates >12% nickel in vivid emerald phloem; calcined into bio-ore ash reagent for nickel-steel.', { gather: 'nickel-ash' }),
    { nickel: 'hyperaccumulator', ultramafic: true })
  },
  {
   key: 'springsundew',
   name: 'Basal-Spring Carnivorous Sundew',
   model: 'Drosera palagonitica',
   H: [0.10, 0.30],
   items: ['bt_springsundew'],
   tags: TG('yes', ['Am', 'Aw', 'Cfa'], 'craterwood',
    HV('dye (crimson)', [], true, 'Mucilaginous ruby sundew rosettes glistening on nitrogen-poor palagonite springs; steeped as cough physic and crimson ink.'))
  },
  {
   key: 'coalhorsetail',
   name: 'Upturned Collar Scour-Horsetail',
   model: 'Equisetum carbonarium',
   H: [0.45, 1.25],
   items: ['bt_coalhorsetail'],
   tags: TG('both', ['Am', 'Aw'], 'coalarch',
    HV('none', [], true, 'Silica-armoured jointed stems on upturned coal=201 collar seeps bundled to sand hull planking and polish brass.'))
  },
  {
   key: 'rampartpalm',
   name: 'Wave-Flex Intertidal Sea-Palm',
   model: 'Postelsia / Lessonia elastica',
   H: [0.45, 1.15],
   items: ['bt_rampartpalm'],
   tags: TG('yes', ['Am', 'Aw'], 'dikerampart',
    HV('none', ['sea-palm blade'], false, 'Rubber-stiped intertidal kelp-palm flexing flat under WNW rollers; dried blades eaten or kilned for iodine-potash ash.'))
  },
  {
   key: 'corallineturf',
   name: 'Tidepool Lithothamnion Crust',
   model: 'Lithophyllum / Actinia',
   H: [0.06, 0.24],
   items: ['bt_coralline_crust'],
   tags: TG('yes', ['Am', 'Aw'], 'dikerampart',
    HV('none', [], false, 'Rose-pink calcified coralline crusts lining wave-cut basalt benches; scraped and kilned into hydraulic lime putty.'))
  },
  {
   key: 'cliffsamphire',
   name: 'Spray-Cliff Sea-Fennel',
   model: 'Crithmum maritimum',
   H: [0.25, 0.65],
   items: ['bt_cliffsamphire', 'bt_samphire_umbel'],
   tags: TG('no', ['Am', 'Aw'], 'dikerampart',
    HV('none', ['pickled sea-fennel'], true, 'Aromatic blue-glaucous spray-cliff umbel pickled in vinegar casks against sea-scurvy.'))
  },
  {
   key: 'plugohia',
   name: 'Cloud-Moss Summit Ohia',
   model: 'Metrosideros polymorpha var. nubigena',
   H: [2.8, 7.5],
   rb: [0.14, 0.30],
   crownR: [1.8, 3.4],
   items: ['bt_ohia_crown', 'bt_ohia_bloom'],
   tags: TG('no', ['Cfa', 'Am'], 'plugcrown',
    HV('fuel, carving, knees', [], false, 'Gnarled cloud-crest hardwood on +868 m basalt neck bowls carved into storm-cleats, sheaves and shrine finials.'))
  },
  {
   key: 'plugcushion',
   name: 'Summit Cloud-Cistern Cushion',
   model: 'Astelia / Colobanthus nubigena',
   H: [0.25, 0.75],
   items: ['bt_plugcushion'],
   tags: TG('no', ['Cfa'], 'plugcrown',
    HV('fibre (leaf-down), water reservoir', [], false, 'Silvery rosette bases trap potable cloud-mist cistern water on the riverless +868 m plug; leaf-wool spun as dry tinder.'))
  }
 ];

 BATTER.HARVEST = {};
 BATTER.byKey = {};
 BATTER.ITEM_SPECIES = {};
 for (var i = 0; i < BATTER.SPECIES.length; i++) {
  var sp = BATTER.SPECIES[i];
  BATTER.byKey[sp.key] = sp;
  if (sp.tags && sp.tags.harvest) BATTER.HARVEST[sp.key] = sp.tags.harvest;
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
     } else if (shapeKind === 'heart') {
      var hv = (v - 0.12) / 0.78;
      var hw = hv > 0 && hv < 1 ? 0.38 * Math.sin(Math.pow(hv, 0.65) * Math.PI) : 0;
      a = Math.abs(u) < hw ? 255 : 0;
     } else if (shapeKind === 'needle') {
      var nv = clamp((v - 0.04) / 0.90, 0, 1);
      var fan = Math.abs(Math.sin(Math.atan2(u, Math.max(0.06, nv)) * 11.0));
      a = (Math.hypot(u, nv * 0.65 - 0.30) < 0.42 && fan > 0.38 && v > 0.04 && v < 0.94) ? 255 : 0;
     } else if (shapeKind === 'star') {
      var sr = Math.hypot(u, v - 0.5), sa = Math.atan2(v - 0.5, u);
      a = sr < 0.22 + 0.16 * Math.cos(sa * 5.0) ? 255 : 0;
     } else if (shapeKind === 'fern') {
      var fv = clamp((v - 0.05) / 0.90, 0, 1);
      var fw = 0.34 * Math.sin(Math.pow(fv, 0.7) * Math.PI) * (0.55 + 0.45 * Math.abs(Math.sin(fv * 34.0)));
      a = (Math.abs(u) < fw && v > 0.05 && v < 0.95) ? 255 : 0;
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
   palmFrond:      leaf((function(){
    var t = BIO.alphaTex(512, function(g, S){
     g.lineCap = 'round';
     var nPairs = 38;
     for (var i = 1; i <= nPairs; i++) {
      var u = i / (nPairs + 1), ry = S * (0.05 + 0.88 * u);
      var env = Math.sin(Math.pow(u, 0.68) * Math.PI) * (1 - 0.12 * u), pLen = S * 0.40 * env;
      if (pLen < 4) continue;
      var sides = [-1, 1];
      for (var si = 0; si < 2; si++) {
       var side = sides[si];
       var sweep = 0.34 + 0.26 * u;
       var hAng = KRAND.unit(KRAND.hash(0x425495, i, side + 2));
       var hLum = KRAND.unit(KRAND.hash(0x425495, i, side + 5));
       var ang = side * (Math.PI * 0.5 - sweep) + (hAng - 0.5) * 0.05;
       var mx = S * 0.5 + Math.cos(ang) * pLen * 0.56, my = ry + Math.sin(Math.abs(sweep)) * pLen * 0.42;
       var tx = clamp(S * 0.5 + Math.cos(ang) * pLen, 0.04 * S, 0.96 * S);
       var ty = clamp(ry + Math.sin(Math.abs(sweep)) * pLen * 0.88, 0.04 * S, 0.96 * S);
       var hw = S * 0.0078 * (0.6 + 0.5 * env), lum = Math.round(168 + 64 * env + 22 * (hLum - 0.5));
       g.fillStyle = 'rgb(' + Math.round(lum * 0.92) + ',' + Math.min(255, Math.round(lum * 1.05)) + ',' + Math.round(lum * 0.74) + ')';
       g.beginPath(); g.moveTo(S * 0.5, ry - hw); g.quadraticCurveTo(mx, my - hw * 0.7, tx, ty); g.quadraticCurveTo(mx, my + hw * 0.9, S * 0.5, ry + hw); g.closePath(); g.fill();
      }
     }
     g.strokeStyle = 'rgba(168,176,112,0.96)'; g.lineWidth = S * 0.012;
     g.beginPath(); g.moveTo(S * 0.5, S * 0.03); g.lineTo(S * 0.5, S * 0.94); g.stroke();
    }, [154, 182, 112]);
    t.wrapS = t.wrapT = T3.ClampToEdgeWrapping;
    return t;
   })(), 'bt-palmfrond', { aN: false, swayW: '(position.x)', swayA: 0.085, alphaTest: 0.36 }),
   tamanuleaf:     leaf(procAlphaTex('disc',   [44, 92, 52]),   'tamanuleaf',   { swayA: 0.05 }),
   hibiscusleaf:   leaf(procAlphaTex('heart',  [72, 128, 56]),  'hibiscusleaf', { swayA: 0.07 }),
   hibiscusbloom:  leaf(procAlphaTex('star',   [238, 204, 48]), 'hibiscusbloom',{ swayA: 0.07 }),
   fernleaf:       leaf(procAlphaTex('fern',   [78, 138, 58]),  'fernleaf',     { swayW: '(position.x)', swayA: 0.07, alphaTest: 0.38 }),
   sheoakleaf:     leaf(procAlphaTex('needle', [84, 112, 82]),  'sheoakleaf',   { swayW: '(-position.y)', swayA: 0.09 }),
   glorybloom:     leaf(procAlphaTex('star',   [206, 98, 178]), 'glorybloom',   { swayA: 0.03 }),
   sundewleaf:     leaf(procAlphaTex('star',   [192, 48, 44]),  'sundewleaf',   { swayA: 0.02 }),
   ohialeaf:       leaf(procAlphaTex('disc',   [88, 116, 76]),  'ohialeaf',     { swayA: 0.04 }),
   ohiabloom:      leaf(procAlphaTex('star',   [228, 52, 38]),  'ohiabloom',    { swayA: 0.05 }),
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

  /* Drift-Sown Coconut Palm (Cocos nucifera) ringed trunk, 4-nut cluster & 5-segment drooping pinnate frond */
  var lerpP = function(a, b, t){ return a + (b - a) * t; };
  function makePalmSegGeo(){
   var seg = 8, rings = 5, pos = [], nor = [], uv = [], col = [], idx = [];
   for (var r = 0; r <= rings; r++) {
    var t = r / rings, yy = -0.5 + t, taper = lerpP(0.54, 0.46, t), rib = 1 + 0.065 * Math.cos(t * TAU * 5), rad = taper * rib;
    var sh = 0.82 + 0.14 * t + 0.05 * Math.cos(t * TAU * 5);
    for (var s = 0; s <= seg; s++) {
     var u = s / seg, ang = u * TAU;
     pos.push(Math.cos(ang) * rad, yy, Math.sin(ang) * rad);
     nor.push(Math.cos(ang), 0.06, Math.sin(ang));
     uv.push(u * 1.6, t * 1.8);
     col.push(sh, sh * 0.98, sh * 0.94);
    }
   }
   for (var r0 = 0; r0 < rings; r0++) {
    for (var s0 = 0; s0 < seg; s0++) {
     var a = r0 * (seg + 1) + s0, b = a + seg + 1;
     idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
   }
   var g = new T3.BufferGeometry();
   g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
   g.setAttribute('normal', new T3.Float32BufferAttribute(nor, 3));
   g.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2));
   g.setAttribute('color', new T3.Float32BufferAttribute(col, 3));
   g.setIndex(idx);
   g.computeVertexNormals();
   return g;
  }
  function makeDroopFrondGeo(nSeg, arch, droop, halfW, vFold){
   var pos = [], nor = [], uv = [], L0 = [], C0 = [], R0 = [];
   for (var i = 0; i <= nSeg; i++) {
    var t = i / nSeg, xx = t * (1 - 0.14 * t * t), yy = arch * Math.sin(t * 1.95) - droop * t * t * t;
    var env = Math.sin(Math.pow(t, 0.62) * Math.PI * 0.96) * (0.88 + 0.12 * (1 - t)), w = halfW * (0.08 + 0.92 * env), vf = vFold * env;
    L0.push([xx, yy - vf, -w, 0, t]); C0.push([xx, yy, 0, 0.5, t]); R0.push([xx, yy - vf, w, 1, t]);
   }
   for (var j = 0; j < nSeg; j++) {
    var strips = [[L0[j], C0[j], L0[j + 1], C0[j + 1], -0.28], [C0[j], R0[j], C0[j + 1], R0[j + 1], 0.28]];
    for (var si = 0; si < 2; si++) {
     var st = strips[si], a = st[0], b = st[1], c = st[2], d = st[3], nz = st[4], nl = Math.hypot(0.15, 0.94, nz);
     var qs = [a, b, c, b, d, c];
     for (var qi = 0; qi < 6; qi++) {
      var q = qs[qi];
      pos.push(q[0], q[1], q[2]); uv.push(q[3], q[4]); nor.push(0.15 / nl, 0.94 / nl, nz / nl);
     }
    }
   }
   var g = BIO.geo._make(pos, nor, uv);
   g.userData.card = { base: 'top', kind: 'frond' };
   return g;
  }
  function makeCoconutClusterGeo(){
   var pos = [], nor = [], uv = [], col = [], idx = [], offs = [[0.14, -0.10, 0], [-0.12, -0.12, 0.09], [0.02, -0.14, -0.13], [0, -0.24, 0.02]];
   for (var oi = 0; oi < offs.length; oi++) {
    var o = offs[oi];
    var s = new T3.IcosahedronGeometry(0.13, 1), p = s.attributes.position, n = s.attributes.normal, u = s.attributes.uv, b = pos.length / 3;
    for (var i = 0; i < p.count; i++) {
     pos.push(p.getX(i) + o[0], p.getY(i) * 1.22 + o[1], p.getZ(i) + o[2]);
     nor.push(n.getX(i), n.getY(i), n.getZ(i));
     uv.push(u ? u.getX(i) : 0.5, u ? u.getY(i) : 0.5);
     var sh = 0.76 + 0.24 * clamp(p.getY(i) / 0.13 * 0.5 + 0.5, 0, 1);
     col.push(sh, sh, sh * 0.92);
    }
    if (s.index) { var ix = s.index.array; for (var k = 0; k < ix.length; k++) idx.push(b + ix[k]); }
    else { for (var k2 = 0; k2 < p.count; k2++) idx.push(b + k2); }
   }
   var g = new T3.BufferGeometry();
   g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
   g.setAttribute('normal', new T3.Float32BufferAttribute(nor, 3));
   g.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2));
   g.setAttribute('color', new T3.Float32BufferAttribute(col, 3));
   g.setIndex(idx);
   return g;
  }
  BIO.def('bt_palmtrunk', makePalmSegGeo(), M.pandanbark, { label: 'Drift-Sown Coconut Palm ringed trunk' });
  BIO.def('bt_palm', makeDroopFrondGeo(5, 0.34, 0.42, 0.28, 0.075), M.palmFrond, { label: 'Drift-Sown Coconut Palm drooping pinnate frond' });
  BIO.def('bt_coconut_nut', makeCoconutClusterGeo(), M.pandanbark, { label: 'Drift-Sown Coconut Palm nut cluster' });

  var PALM_TRUNK_HEX = [0x8a7a62, 0x7e705a, 0x94846c];
  var PALM_LEAF_HEX  = [0x4c7832, 0x58863a, 0x426c2c, 0x649042];
  var PALM_OLD_HEX   = [0x7e7838, 0x8c8240];
  var PALM_NUT_HEX   = [0x6c7a36, 0x867238, 0x5e6e30];

  BATTER.growCoconut = function(x, y, z, H0, yaw, lean, tSeed, lv){
   var h = function(i, k){ return KRAND.unit(KRAND.hash(tSeed >>> 0, i | 0, k | 0)); };
   var r0 = clamp(0.22 + H0 * 0.006, 0.22, 0.34);
   var dx = -Math.cos(yaw) * Math.sin(lean) * H0, dz = Math.sin(yaw) * Math.sin(lean) * H0;
   var baseY = y - 0.26, ty = y + H0 * Math.cos(lean) * 0.97, tx = x + dx, tz = z + dz;
   var trunkCol = new T3.Color(PALM_TRUNK_HEX[(tSeed >>> 0) % PALM_TRUNK_HEX.length]);
   var rSeg = [r0 * 1.08, r0 * 0.88, r0 * 0.73];
   var pts = [];
   for (var i = 0; i <= 3; i++) {
    var t = i / 3, ht = Math.pow(t, 0.78);
    pts.push([x + dx * ht, baseY + (ty + 0.04 - baseY) * t, z + dz * ht]);
   }
   var fLen = clamp(2.5 + H0 * 0.11, 2.8, 4.3);
   BIO.tree(x, z, function(){
    for (var s = 0; s < 3; s++) {
     var a = pts[s], b = pts[s + 1];
     var ex = s > 0 ? [a[0] - (b[0] - a[0]) * 0.05, a[1] - (b[1] - a[1]) * 0.05, a[2] - (b[2] - a[2]) * 0.05] : a;
     BIO.beam('bt_palmtrunk', ex, b, rSeg[s], rSeg[s], trunkCol);
    }
    var nutS = 0.95 + 0.25 * h(1, 2);
    BIO.put('bt_coconut_nut', [tx, ty - 0.10, tz], qEuler(0, yaw + 1.1, 0), [nutS, nutS, nutS], new T3.Color(PALM_NUT_HEX[(tSeed >>> 0) % PALM_NUT_HEX.length]));
    var nF = (lv != null && lv < 1) ? 9 : 13, gold = 2.399963;
    for (var k = 0; k < nF; k++) {
     var age = k / (nF - 1), az = yaw + k * gold + 0.16 * (h(k + 3, 1) - 0.5);
     var pitch = lerpP(0.78, -0.32, Math.pow(age, 0.88)) + 0.08 * (h(k + 3, 2) - 0.5);
     var Lf = fLen * (age < 0.2 ? 0.82 : (age > 0.82 ? 0.88 : 1)) * (0.92 + 0.16 * h(k + 3, 3));
     var cHex = age > 0.80 ? PALM_OLD_HEX[k % PALM_OLD_HEX.length] : PALM_LEAF_HEX[(k + (tSeed >>> 0)) % PALM_LEAF_HEX.length];
     BIO.put('bt_palm', [tx, ty + 0.04 - 0.14 * age, tz], qEuler((h(k + 3, 4) - 0.5) * 0.14, -az, pitch), [Lf, Lf * 0.95, Lf * 1.08], new T3.Color(cHex));
    }
   }, { range: 580 });
   return { x: x, y0: y, z: z, H: H0, rb: r0, crownR: Math.max(3.4, fLen * 0.92), kind: 'coconut', lv: 2 };
  };

  /* Single-line BIO.def items for Battered Isle's 16 coastal, volcanic, intertidal, spring & summit cloud species */
  BIO.def('bt_tamanu_crown', BIO.geo.clump(), M.tamanuleaf, { label: 'Leeward Sea-Tamanu crown' });
  BIO.def('bt_hibiscus_fol', BIO.geo.clump(), M.hibiscusleaf, { label: 'Yellow-Belled Sea-Hibiscus foliage' });
  BIO.def('bt_hibiscus_bloom', BIO.geo.clump(), M.hibiscusbloom, { label: 'Yellow-Belled Sea-Hibiscus cup-flowers' });
  BIO.def('bt_fern_frond', makeDroopFrondGeo(4, 0.28, 0.30, 0.26, 0.06), M.fernleaf, { label: 'Ravine Caudex Tree-Fern arching frond' });
  BIO.def('bt_sheoak_crown', BIO.geo.clump(), M.sheoakleaf, { label: 'Coastal Strand Ironwood needle crown' });
  BIO.def('bt_sheoak_drape', BIO.geo.hang(4, 0.34, 0.22), M.sheoakleaf, { label: 'Coastal Strand Ironwood drooping needles' });
  BIO.def('bt_naupaka_fol', BIO.geo.clump(), M.hibiscusleaf, { label: 'Leeward Salt-Naupaka fleshy foliage' });
  BIO.def('bt_naupaka_bloom', BIO.geo.clump(), M.hibiscusbloom, { label: 'Leeward Salt-Naupaka white half-flowers' });
  BIO.def('bt_cinderglory', BIO.geo.mat(1.1, 0.26), M.hibiscusleaf, { label: 'Cinder Beach-Glory runner mat' });
  BIO.def('bt_glory_bloom', BIO.geo.mat(0.7, 0.28), M.glorybloom, { label: 'Cinder Beach-Glory trumpet blooms' });
  BIO.def('bt_archfern', BIO.geo.clump(), M.fernleaf, { label: 'Palagonite Sea-Arch Spleenwort rosette' });
  BIO.def('bt_olivinesheoak', BIO.geo.clump(), M.sheoakleaf, { label: 'Olivine Maquis She-Oak tuft' });
  BIO.def('bt_phyllanthus', BIO.geo.clump(), M.nickelmyrtle, { label: 'Emerald-Sap Nickel Shrub spray' });
  BIO.def('bt_springsundew', BIO.geo.mat(0.65, 0.22), M.sundewleaf, { label: 'Basal-Spring Carnivorous Sundew rosette' });
  BIO.def('bt_coalhorsetail', BIO.geo.clump(), M.tuffcress, { label: 'Upturned Collar Scour-Horsetail stems' });
  BIO.def('bt_rampartpalm', BIO.geo.hang(3, 0.36, 0.28), M.soundkelp, { label: 'Wave-Flex Intertidal Sea-Palm blades' });
  BIO.def('bt_coralline_crust', BIO.fung.crust({ lobes: 7, lobeA: 0.22, seg: 12, rings: 2, seed: 9121 }), M.barnacle, { label: 'Tidepool Lithothamnion Crust' });
  BIO.def('bt_cliffsamphire', BIO.geo.clump(), M.scoriathrift, { label: 'Spray-Cliff Sea-Fennel foliage' });
  BIO.def('bt_samphire_umbel', BIO.geo.mat(0.55, 0.25), M.hibiscusbloom, { label: 'Spray-Cliff Sea-Fennel umbels' });
  BIO.def('bt_ohia_crown', BIO.geo.clump(), M.ohialeaf, { label: 'Cloud-Moss Summit Ohia foliage' });
  BIO.def('bt_ohia_bloom', BIO.geo.clump(), M.ohiabloom, { label: 'Cloud-Moss Summit Ohia scarlet lehua blossoms' });
  BIO.def('bt_plugcushion', BIO.geo.mat(0.95, 0.38), M.scoriathrift, { label: 'Summit Cloud-Cistern Cushion dome' });

  BATTER.growStrandTree = function(kind, x, y, z, seed, scale){
   reseed(seed);
   var sc = scale == null ? 1.0 : scale;
   var isSheoak = kind === 'beachsheoak';
   var isOhia = kind === 'plugohia';
   var buck = isOhia ? 'podocarpbark' : 'laurelbark';
   var H = (isOhia ? rr(3.2, 6.8) : (isSheoak ? rr(7.2, 13.5) : rr(6.8, 12.2))) * sc;
   var rb = (isOhia ? rr(0.16, 0.28) : (isSheoak ? rr(0.20, 0.34) : rr(0.24, 0.42))) * sc;
   var crownR = (isOhia ? rr(1.9, 3.1) : (isSheoak ? rr(2.6, 4.2) : rr(3.0, 4.8))) * sc;
   var leanYaw = rr(0, TAU), leanM = (isOhia ? rr(0.16, 0.30) : (isSheoak ? rr(0.10, 0.22) : rr(0.20, 0.36))) * H;
   var barkHex = isOhia ? 0x766c62 : (isSheoak ? 0x62584e : 0x56483c);
   var crownItem = isOhia ? 'bt_ohia_crown' : (isSheoak ? 'bt_sheoak_crown' : 'bt_tamanu_crown');
   var leafBase = new T3.Color(isOhia ? 0x5c784e : (isSheoak ? 0x526e4c : 0x2c5c36));

   BIO.tree(x, z, function(){
    var rings = [], nR = 5;
    for (var i = 0; i <= nR; i++) {
     var t = i / nR, bow = Math.pow(t, 1.35);
     rings.push({
      x: x + Math.cos(leanYaw) * leanM * bow,
      y: y - 0.22 + H * t,
      z: z + Math.sin(leanYaw) * leanM * bow,
      r: Math.max(0.05, rb * (1 - 0.65 * t) * (i === 0 ? 1.35 : 1.0))
     });
    }
    BIO.tube(buck, rings, barkHex, { seg: 6 });
    var topP = rings[nR], nB = 4;
    for (var b = 0; b < nB; b++) {
     var ba = (b / nB) * TAU + rr(-0.22, 0.22);
     var sPt = rings[Math.min(nR - 1, 2 + (b % 3))];
     var bx = sPt.x + Math.cos(ba) * crownR * 0.56, bz = sPt.z + Math.sin(ba) * crownR * 0.56;
     var by = sPt.y + H * (0.12 + 0.08 * (b / nB));
     BIO.tube(buck, [
      { x: sPt.x, y: sPt.y, z: sPt.z, r: Math.max(0.05, sPt.r * 0.52) },
      { x: bx, y: by, z: bz, r: 0.04 }
     ], barkHex, { seg: 5 });
     var cSz = crownR * rr(0.46, 0.62);
     var lc = leafBase.clone().offsetHSL(rr(-0.02, 0.02), rr(-0.03, 0.03), rr(-0.03, 0.03));
     BIO.put(crownItem, [bx, by, bz], qEuler(rr(-0.12, 0.12), rr(0, TAU), rr(-0.12, 0.12)), [cSz, cSz * 0.74, cSz], lc);
     if (isSheoak) {
      BIO.put('bt_sheoak_drape', [bx, by, bz], qEuler(0, rr(0, TAU), 0), [cSz * 0.55, cSz * 0.95, cSz * 0.55], lc);
     } else if (isOhia && b % 2 === 0) {
      BIO.put('bt_ohia_bloom', [bx, by + 0.05, bz], qEuler(0, rr(0, TAU), 0), [cSz * 0.58, cSz * 0.48, cSz * 0.58], 0xe23828);
     }
    }
    var aSz = crownR * 0.56;
    BIO.put(crownItem, [topP.x, topP.y, topP.z], qEuler(0, rr(0, TAU), 0), [aSz, aSz * 0.70, aSz], leafBase);
    if (isOhia) {
     BIO.put('bt_ohia_bloom', [topP.x, topP.y + 0.06, topP.z], qEuler(0, rr(0, TAU), 0), [aSz * 0.62, aSz * 0.50, aSz * 0.62], 0xe8422c);
    }
   }, { range: 560 });
   return { x: x, y0: y, z: z, H: H, rb: rb, crownR: crownR, kind: kind, lv: 2 };
  };

  BATTER.growTreeFern = function(x, y, z, seed, scale){
   reseed(seed);
   var sc = scale == null ? 1.0 : scale;
   var H = rr(2.6, 5.2) * sc, leanA = rr(0, TAU), leanR = rr(0.12, 0.35) * sc;
   var tx = x + Math.cos(leanA) * leanR, tz = z + Math.sin(leanA) * leanR, ty = y + H;
   var fLen = clamp(1.4 + H * 0.24, 1.5, 2.7);
   BIO.tree(x, z, function(){
    BIO.beam('bt_palmtrunk', [x, y - 0.18, z], [tx, ty + 0.04, tz], 0.14 * sc, 0.11 * sc, 0x4a382c);
    for (var k = 0; k < 8; k++) {
     var az = (k / 8) * TAU + rr(-0.12, 0.12);
     var pitch = 0.42 - 0.18 * (k % 2);
     var c = new T3.Color(0x528e3c).offsetHSL(rr(-0.02, 0.02), rr(-0.04, 0.04), rr(-0.03, 0.03));
     BIO.put('bt_fern_frond', [tx, ty, tz], qEuler(0, -az, pitch), [fLen, fLen * 0.9, fLen], c);
    }
   }, { range: 500 });
   return { x: x, y0: y, z: z, H: H, rb: 0.14 * sc, crownR: fLen, kind: 'craterfern', lv: 2 };
  };

  BATTER.growBloomShrub = function(kind, x, y, z, seed, scale){
   reseed(seed);
   var sc = scale == null ? 1.0 : scale;
   var isHib = kind === 'seahibiscus';
   var isNaup = kind === 'saltnaupaka';
   var isOliv = kind === 'olivinesheoak';
   var H = (isHib ? rr(2.6, 4.8) : (isOliv ? rr(2.0, 4.2) : (isNaup ? rr(0.9, 1.9) : rr(1.3, 2.8)))) * sc;
   var rod = (isHib || isNaup) ? 'bt_rod_pandan' : 'bt_rod_laurel';
   var fol = isHib ? 'bt_hibiscus_fol' : (isNaup ? 'bt_naupaka_fol' : (isOliv ? 'bt_olivinesheoak' : 'bt_phyllanthus'));
   var leafCol = new T3.Color(isHib ? 0x4c8a3c : (isNaup ? 0x5ca04c : (isOliv ? 0x465e40 : 0x3c7852)));
   var nStems = isNaup ? 2 : 3;
   BIO.tree(x, z, function(){
    for (var s = 0; s < nStems; s++) {
     var a = (s / nStems) * TAU + rr(-0.28, 0.28);
     var sp = (isHib ? rr(0.55, 1.05) : rr(0.32, 0.68)) * sc;
     var tx = x + Math.cos(a) * sp, tz = z + Math.sin(a) * sp, ty = y + H * rr(0.76, 1.0);
     BIO.beam(rod, [x, y - 0.12, z], [tx, ty, tz], 0.065 * sc, 0.03 * sc, 0x625446);
     var sz = (isHib ? rr(1.25, 1.85) : (isNaup ? rr(0.75, 1.15) : rr(0.90, 1.45))) * sc;
     BIO.put(fol, [tx, ty - 0.06, tz], qEuler(0, rr(0, TAU), 0), [sz, sz * 0.82, sz], leafCol);
     if (isHib) {
      BIO.put('bt_hibiscus_bloom', [tx, ty - 0.02, tz], qEuler(0, rr(0, TAU), 0), [sz * 0.55, sz * 0.48, sz * 0.55], 0xf2ce34);
     } else if (isNaup) {
      BIO.put('bt_naupaka_bloom', [tx, ty - 0.02, tz], qEuler(0, rr(0, TAU), 0), [sz * 0.48, sz * 0.42, sz * 0.48], 0xf4f6ee);
     }
    }
   }, { range: 480 });
   return { x: x, y0: y, z: z, H: H, kind: kind };
  };

  BATTER.growSeaPalm = function(x, y, z, seed, scale){
   reseed(seed);
   var sc = scale == null ? 1.0 : scale;
   var H = rr(0.52, 1.05) * sc, leanA = rr(0, TAU), leanR = 0.08 * sc;
   var tx = x + Math.cos(leanA) * leanR, tz = z + Math.sin(leanA) * leanR, ty = y + H;
   BIO.tree(x, z, function(){
    BIO.beam('bt_rod_pandan', [x, y - 0.08, z], [tx, ty + 0.02, tz], 0.065 * sc, 0.045 * sc, 0x6a5828);
    for (var k = 0; k < 4; k++) {
     BIO.put('bt_rampartpalm', [tx, ty, tz], qEuler(0, (k / 4) * TAU + rr(-0.2, 0.2), 0), [0.52 * sc, H * 0.72, 0.52 * sc], 0x8e7830);
    }
   }, { range: 380 });
   return { H: H };
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
