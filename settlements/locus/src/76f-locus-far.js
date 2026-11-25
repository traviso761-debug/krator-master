/* ============================== THE FAR FIELD — LOCUS ON ITS REAL SITE (W7) ==============================
   PLAN-ONMAP.md (the owner, 2026-11-24: the page on its real site, "real terrain only"). Past the page's square the ground is
   the scale model's own (LOCUS_SITE.grid, 09-locus-site.js: its 2 km heights +-60 km round the pin, cast by region/site.py),
   on core/terrain's far field (KFAR): the abyss wall 2 km E and S of the pin and climbing to its rim (~+700 m, 3.1 km over
   the lake) at 22-26 km, the floor and the salt lake running ~20 km W and N, the lake's surface where the model is wet. The
   page's own ground eases into the model's over 600 m past the square (its E and S edge is already lifted onto it: 10-core.js
   wallLift), so there is no seam. Coloured as eastabyss's far field (biomes/eastabyss/src/83-host-far.js): the floor's jungle,
   the wall's talus, the rock's beds on its steep faces (KSTRATA's canyon column), the high desert on the rim; bluer and paler
   with distance. The terrain's horizon (KHORIZON) is baked over the page's ground and this field, so the wall shades the
   basin when the sun is low in the east (LORE.md:73: the shelf hides the sun from Locus). ?far=0 draws none of it. */
var LOCUS_FAR = (function(){
  if(SHEET || typeof KFAR==='undefined' || typeof LOCUS_SITE==='undefined' || !LOCUS_SITE.grid || /[?&]far=0/.test(location.search)) return null;
  var S0 = HW, ROUT = 42000, SEED = 7613;
  /* the model's height, or the lake's surface where it is wet (the page's y) */
  function modelH(x,z){ var h = siteH(x,z); if(h == null) h = 0; return siteWet(x,z) ? Math.max(h, -0.3) : h; }
  function farH(x,z){ var d = Math.max(Math.abs(x), Math.abs(z)) - S0, k = smooth(0, 600, d);
    return k < 1 ? mix(terrainH(x,z), modelH(x,z), k) : modelH(x,z); }
  var L = function(a){ return a.map(function(v){ return Math.pow(v/255, 2.2); }); };
  var mixC = function(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; };
  var lake = [LAKE_COL.r, LAKE_COL.g, LAKE_COL.b].map(function(v){ return Math.pow(v, 2.2); });
  var C = { lake:lake, jung:L([46,62,38]), marsh:L([70,84,52]), talus:L([150,132,108]), shelf:L([176,152,116]), far:L([150,160,168]),
            foam:L([228,232,236]) };
  /* the model's rivers on the far field (LOCUS_SITE.rivers: the page's own river off the wall, Wadi al-Naft, and the Bigga's upper
     fall): water along their courses, white where the bed drops steeply (over 1 in 20); at least 90 m wide either side so a coarse
     lattice keeps them */
  var RSEG = []; (LOCUS_SITE.rivers || []).forEach(function(r){ for(var k=0;k<r.pts.length-1;k++){ var a=r.pts[k], b=r.pts[k+1], len=Math.hypot(b[0]-a[0], b[1]-a[1]) || 1;
    RSEG.push({ ax:a[0], az:a[1], bx:b[0], bz:b[1], len:len, hw:Math.max(90, (a[3]+b[3])/4), steep:(a[2]-b[2])/len > 0.05 }); } });
  function riverAt(x,z){ var best = 0;
    for(var i=0;i<RSEG.length;i++){ var s = RSEG[i], hw = s.hw;
      if(x < Math.min(s.ax,s.bx)-hw || x > Math.max(s.ax,s.bx)+hw || z < Math.min(s.az,s.bz)-hw || z > Math.max(s.az,s.bz)+hw) continue;
      var ux = (s.bx-s.ax)/s.len, uz = (s.bz-s.az)/s.len, t = clamp((x-s.ax)*ux + (z-s.az)*uz, 0, s.len), dx = s.ax+ux*t-x, dz = s.az+uz*t-z;
      if(dx*dx + dz*dz < hw*hw){ if(s.steep) return 2; best = 1; } }
    return best; }
  var G = KFAR.grid({ lines:KFAR.lines({ cell:120, inner:S0+120, out:ROUT, grow:1.035 }), dense:true,
    h:function(x,z){ return farH(x,z); },
    skip:function(x0,z0,x1,z1){ return x0 > -S0+150 && x1 < S0-150 && z0 > -S0+150 && z1 < S0-150; },   /* none under the page's ground */
    curve:{ R:5.53e6, from:0 },   /* the planet's curve as the air bends it (tools/site_cast.py: R / (1 - 0.13)) */
    color:function(x,z,y,q){
      var c = mixC(C.marsh, C.jung, smooth(0, 60, y));                 /* the floor: marsh at the water, jungle above */
      if(siteWet(x,z) && y < 1) c = C.lake;
      c = mixC(c, C.talus, smooth(0.25, 0.55, q.slope || 0) * smooth(40, 300, y));   /* the wall's foot and its faces */
      c = mixC(c, C.shelf, smooth(2500, 3000, y));                      /* the rim: the high desert over the shelf */
      var rv = RSEG.length ? riverAt(x,z) : 0; if(rv) c = rv === 2 ? C.foam : mixC(c, C.lake, 0.8);   /* the model's rivers; white on the falls */
      return mixC(c, C.far, 0.30*smooth(6000, 30000, q.r)); } });
  var geo = KFAR.geometry(G);
  /* the beds: KSTRATA's canyon column over the wall's 3.1 km, on its steep faces only */
  /* (KSTRATA.shade, the core path: BIO.strata is not on this page when core/terrain's strata loads, before the biome core) */
  var STRATA = (typeof KSTRATA!=='undefined' && KSTRATA.shade && KSTRATA.create) ?
    KSTRATA.shade(KSTRATA.create({ recipe:'canyon', seed:SEED, range:[-100, 3300], dip:[.4,.9,.006], warp:[9,2.2] }), { THREE:THREE, dust:0xb89c78, res:.5 }) : null;
  var mat = new THREE.MeshLambertMaterial({ vertexColors:true }); mat.userData.farField = true;
  if(STRATA){ mat.onBeforeCompile = function(sh){ STRATA.inject(sh);
      sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', ['#include <color_fragment>',
        '{float steep=1.0-clamp(normalize(vSWN).y,0.0,1.0);vec3 sc=strataColor(vSWP,vSWN);',
        ' diffuseColor.rgb=mix(diffuseColor.rgb,sc,smoothstep(0.10,0.32,steep)*0.95);}'].join('\n')); };   /* the model's wall averages ~35 deg (steep 0.18): beds from ~25 deg, eastabyss's cliffs started at 45 */
    mat.customProgramCacheKey = function(){ return 'locus-far'; }; }
  /* the fog thinned on the far field (KFAR.fogThin): the page's exponential-squared fog saturates past ~3 km in this air, so the
     wall read as a flat slab of fog; at a fifth of the depth its faces and beds show and it still hazes with distance */
  if(KFAR.fogThin) KFAR.fogThin(mat, 0.2, 'locus-farfog');
  var mesh = new THREE.Mesh(geo, mat); mesh.name = 'locus-far'; mesh.frustumCulled = false; mesh.userData.farField = true; mesh.userData.probeSkip = true;
  mesh.userData.inspectLabel = 'The abyss wall and the basin beyond the map (the scale model\'s own ground)';
  scene.add(mesh);
  return { mesh:mesh, mat:mat, G:G, H:farH, tris:G.count.tris };
})();
/* the terrain's horizon (core/terrain KHORIZON): eight directions over the page's square and, past it, the far field, so the
   wall's shadow reaches the town when the sun is low in the east */
var LOCUS_HZ = (function(){
  if(!LOCUS_FAR || typeof KHORIZON==='undefined' || /[?&]hz=0/.test(location.search)) return null;
  var t0 = performance.now(), S = HW;
  var H = KHORIZON.bake({ box:[-S,-S,S,S], n:256, h:terrainH,
    far:{ h:function(x,z){ var v = LOCUS_FAR.G.at(x,z); return v === v ? v : 0; }, box:[-30000,-30000,30000,30000], n:200 } });
  window._horizon = { ms:Math.round(performance.now()-t0), n:H.n };
  KHORIZON.shade(terrMat, H);
  return H;
})();
