/* ==== big ships ==== */
var LIFE_QUAYS = [];
(function(){

  for(var i=0;i<3;i++){
    var s = mix(HARB_S0, HARB_S1, (i+0.5)/3);
    var n = shoreNorm(s), p = shoreAt(s);
    var pierLen = 50;
    var berthX = p[0]-n[0]*pierLen, berthZ = p[1]-n[1]*pierLen;
    LIFE_QUAYS.push({ x: berthX, z: berthZ, faceX: -n[0], faceZ: -n[1], region: 'harbor', occupiedBy: null });
    var midX = p[0]-n[0]*pierLen*0.5, midZ = p[1]-n[1]*pierLen*0.5;
    var ryPier = Math.atan2(-n[1], n[0]);
    BOX(midX, SEA+1.2, midZ, 9, 1.4, pierLen*1.05, ryPier, 0x8a7659, 'wood');

    LIFE_EXTRA_PIERS.push({ x0: p[0], z0: p[1], x1: berthX, z1: berthZ, w: 9 });
    for(var k=6; k<pierLen; k+=13){
      [-1,1].forEach(function(sg){
        var px = p[0]-n[0]*k + (-n[1])*sg*4.6, pz = p[1]-n[1]*k + (n[0])*sg*4.6;
        var bh = bedAt(px,pz);
        CYL(px, bh, pz, 0.9, SEA+1.6-bh, 0, 0x6b5942, 'wood');
      });
    }
  }

  var port = CIDX['Port'];
  if(port){
    var lp = shoreIn(port.s, 26), sl = Math.hypot(lp[0]-port.x, lp[1]-port.z) || 1;
    var sdx = (lp[0]-port.x)/sl, sdz = (lp[1]-port.z)/sl;
    var qy = 6.5;

    for(var f=0; f<4; f++){
      var a = f*Math.PI/2, fx = Math.cos(a), fz = Math.sin(a);
      if(fx*sdx + fz*sdz > 0.5) continue;
      var edge = lifeCantonEdge(port, fx, fz);
      var bx = edge[0] + fx*85, bz = edge[1] + fz*85;
      LIFE_QUAYS.push({ x:bx, z:bz, faceX:fx, faceZ:fz, region:'port', occupiedBy: null });

      var qlen = 95;
      var qmidX = edge[0] + fx*qlen*0.5, qmidZ = edge[1] + fz*qlen*0.5;
      var ryQuay = Math.atan2(fx, fz);
      BOX(qmidX, SEA+1.2, qmidZ, 12, 1.4, qlen, ryQuay, 0x8a7659, 'wood');
      LIFE_EXTRA_PIERS.push({ x0: edge[0], z0: edge[1], x1: edge[0]+fx*qlen, z1: edge[1]+fz*qlen, w: 12 });
      [-1,1].forEach(function(sg){
        var px = bx + (-fz)*sg*9, pz = bz + (fx)*sg*9;
        CYL(px, qy, pz, 1.2, 3.6, 0, 0x5b4b38, 'wood');
      });
    }
  }
})();

var LIFE_NORTH_INLET = (function(){
  var a = shoreAt(0), b = shoreAt(SLEN);
  return [ (a[0]+b[0])/2, (a[1]+b[1])/2 ];
})();

/* ==== ship visuals, 4th attempt — a dark-elven JUNK, not a European ==== */

var LIFE_SHIP_SCALE = 1.18;
var LIFE_SHIP_LEN = 34*LIFE_SHIP_SCALE, LIFE_SHIP_BEAM = 11*LIFE_SHIP_SCALE;

var LIFE_SHIP_MOBILE_N = 5;
var LIFE_SHIP_STATIONARY_N = 4;
var LIFE_SHIP_N = LIFE_SHIP_MOBILE_N + LIFE_SHIP_STATIONARY_N;
var LIFE_JUNK_HULL_COL = 0x2c2116;
var LIFE_JUNK_SAIL_COL = 0xa494c9;     /* lavender */
var LIFE_JUNK_BATTEN_COL = 0x4d4058;   /* darker panel lines across each sail */
/* ==== the Fortress coast guard's ONE bespoke hull ==== */
var LIFE_CG_HULL_COL     = PAL.cguard.hull;        /* black — a trace of brown so it reads as tarred timber, not a hole in the scene */
var LIFE_CG_TRIM_COL     = PAL.cguard.trim;        /* gold rubbing strake along the sheer */
var LIFE_CG_SAIL_GREEN   = PAL.cguard.sailGreen;   /* the order's banner green */
var LIFE_CG_SAIL_GOLD    = PAL.cguard.sailGold;    /* the ordinators' own gold */
var LIFE_CG_BATTEN_GREEN = PAL.cguard.battenGreen;
var LIFE_CG_BATTEN_GOLD  = PAL.cguard.battenGold;
var LIFE_JUNK_HULL_H = 4.2*LIFE_SHIP_SCALE, LIFE_JUNK_HULL_Y = -2.6*LIFE_SHIP_SCALE;
var LIFE_JUNK_MAST_BASE_Y = 0.4*LIFE_SHIP_SCALE;
var lifeShipHullParts = [
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM, LIFE_JUNK_HULL_H, LIFE_SHIP_LEN*0.80).translate(0, LIFE_JUNK_HULL_Y, -LIFE_SHIP_LEN*0.03), color: LIFE_JUNK_HULL_COL },  /* main hull — boxy, flat-bottomed, not tapered */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.94, 0.8*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.78).translate(0, 0.0, -LIFE_SHIP_LEN*0.03), color: LIFE_JUNK_HULL_COL },  /* deck plank */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.92, 5.4*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.08).translate(0, 0.2*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.42), color: LIFE_JUNK_HULL_COL },  /* high squared transom stern */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.70, 2.4*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.20).translate(0, 3.4*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.32), color: LIFE_JUNK_HULL_COL },  /* aft deckhouse, tier 1 */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.48, 1.9*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.13).translate(0, 5.6*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.33), color: LIFE_JUNK_HULL_COL },  /* aft deckhouse, tier 2 — the "pagoda" step */
];

var LIFE_JUNK_BOW_Y = LIFE_JUNK_HULL_Y + LIFE_JUNK_HULL_H/2;
lifeShipHullParts.push({
  geo: new THREE.ConeGeometry(1, LIFE_SHIP_LEN*0.16, 4).rotateX(Math.PI/2)
        .scale(LIFE_SHIP_BEAM*0.5, LIFE_JUNK_HULL_H/2, 1).translate(0, LIFE_JUNK_BOW_Y, LIFE_SHIP_LEN*0.37 + LIFE_SHIP_LEN*0.08),
  color: LIFE_JUNK_HULL_COL
});

var LIFE_JUNK_FOREMAST_H = 13*LIFE_SHIP_SCALE, LIFE_JUNK_MAINMAST_H = 18*LIFE_SHIP_SCALE;
var LIFE_JUNK_FOREMAST_Z = LIFE_SHIP_LEN*0.20, LIFE_JUNK_MAINMAST_Z = -LIFE_SHIP_LEN*0.06;
var LIFE_JUNK_FOREMAST_RAKE = 0.10, LIFE_JUNK_MAINMAST_RAKE = -0.07;
lifeShipHullParts.push(
  { geo: SHAPES.cyl().scale(0.26*LIFE_SHIP_SCALE, LIFE_JUNK_FOREMAST_H, 0.26*LIFE_SHIP_SCALE).rotateZ(LIFE_JUNK_FOREMAST_RAKE).translate(0, LIFE_JUNK_MAST_BASE_Y, LIFE_JUNK_FOREMAST_Z), color: LIFE_JUNK_HULL_COL },
  { geo: SHAPES.cyl().scale(0.32*LIFE_SHIP_SCALE, LIFE_JUNK_MAINMAST_H, 0.32*LIFE_SHIP_SCALE).rotateZ(LIFE_JUNK_MAINMAST_RAKE).translate(0, LIFE_JUNK_MAST_BASE_Y, LIFE_JUNK_MAINMAST_Z), color: LIFE_JUNK_HULL_COL }
);

for(var lifeShipCargoI=0; lifeShipCargoI<3; lifeShipCargoI++){
  var lifeShipCx = rr(-2.6,2.6)*LIFE_SHIP_SCALE, lifeShipCz = LIFE_SHIP_LEN*rr(-0.20,0.10);
  lifeShipHullParts.push({
    geo: SHAPES.box().scale(rr(1.6,2.6)*LIFE_SHIP_SCALE, rr(1.3,2.2)*LIFE_SHIP_SCALE, rr(1.6,2.6)*LIFE_SHIP_SCALE).rotateY(rr(-0.3,0.3)).translate(lifeShipCx, LIFE_JUNK_MAST_BASE_Y, lifeShipCz),
    color: pick([0x5a4a38, 0x6a5642, 0x4f4030]),
    cg: 2   /* deck cargo: a trader carries it, a patrol vessel does not */
  });
}
/* ==== the coast guard's own geometry (cg:1 — collapsed away on the other ==== */
var LIFE_CG_SPRIT_LEN  = LIFE_SHIP_LEN*0.62;
var LIFE_CG_SPRIT_RAKE = 0.13;                            /* ~7.4 deg nose-up: the tip lifts clear of the water */
var LIFE_CG_SPRIT_Z0   = LIFE_SHIP_LEN*0.30;              /* root, just aft of the bow wedge's own seam */
var LIFE_CG_SPRIT_Y0   = LIFE_JUNK_MAST_BASE_Y + 1.0*LIFE_SHIP_SCALE;   /* stem head: above the deck, well above SEA */
var LIFE_CG_SPRIT_TIPZ = LIFE_CG_SPRIT_Z0 + LIFE_CG_SPRIT_LEN*Math.cos(LIFE_CG_SPRIT_RAKE);
var LIFE_CG_SPRIT_TIPY = LIFE_CG_SPRIT_Y0 + LIFE_CG_SPRIT_LEN*Math.sin(LIFE_CG_SPRIT_RAKE);
lifeShipHullParts.push(
  { geo: new THREE.ConeGeometry(1, LIFE_CG_SPRIT_LEN, 4).rotateX(Math.PI/2)
          .scale(0.44*LIFE_SHIP_SCALE, 0.44*LIFE_SHIP_SCALE, 1)
          .rotateX(-LIFE_CG_SPRIT_RAKE)
          .translate(0, (LIFE_CG_SPRIT_Y0+LIFE_CG_SPRIT_TIPY)*0.5, (LIFE_CG_SPRIT_Z0+LIFE_CG_SPRIT_TIPZ)*0.5),
    color: LIFE_CG_HULL_COL, color2: LIFE_CG_HULL_COL, cg: 1 },

  { geo: SHAPES.box().scale(0.9*LIFE_SHIP_SCALE, 2.6*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.10)
          .translate(0, LIFE_JUNK_MAST_BASE_Y - 1.4*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.33),
    color: LIFE_CG_HULL_COL, color2: LIFE_CG_HULL_COL, cg: 1 },

  { geo: SHAPES.box().scale(1.05*LIFE_SHIP_SCALE, 1.05*LIFE_SHIP_SCALE, 0.9*LIFE_SHIP_SCALE)
          .translate(0, LIFE_CG_SPRIT_Y0 + 1.4*Math.tan(LIFE_CG_SPRIT_RAKE) - 0.525*LIFE_SHIP_SCALE,
                     LIFE_CG_SPRIT_Z0 + 1.4),
    color: LIFE_CG_TRIM_COL, color2: LIFE_CG_TRIM_COL, cg: 1 }
);
[-1,1].forEach(function(sg){
  lifeShipHullParts.push({
    geo: SHAPES.box().scale(0.30*LIFE_SHIP_SCALE, 0.55*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.72)
          .translate(sg*LIFE_SHIP_BEAM*0.50, LIFE_JUNK_MAST_BASE_Y - 0.55*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.03),
    color: LIFE_CG_TRIM_COL, color2: LIFE_CG_TRIM_COL, cg: 1
  });
});

lifeShipHullParts.forEach(function(p){ if(p.color2 === undefined) p.color2 = LIFE_CG_HULL_COL; });

function lifeJunkSail(mastH, mastZ, rake, beam, cgSail, cgBatten){
  var sinR = Math.sin(rake), cosR = Math.cos(rake);
  function alongMast(h){ return [ -h*sinR, LIFE_JUNK_MAST_BASE_Y + h*cosR, mastZ ]; }
  var panelBase = 1.6*LIFE_SHIP_SCALE, panelH = mastH*0.62;
  var parts = [];
  var pb = alongMast(panelBase);
  parts.push({
    geo: SHAPES.box().scale(0.10*LIFE_SHIP_SCALE, panelH, beam*0.90).rotateZ(rake).translate(pb[0], pb[1], pb[2]),
    color: LIFE_JUNK_SAIL_COL, color2: cgSail
  });
  for(var bi=1; bi<=3; bi++){
    var bp = alongMast(panelBase + panelH*(bi/4));
    parts.push({
      geo: SHAPES.box().scale(0.13*LIFE_SHIP_SCALE, 0.18*LIFE_SHIP_SCALE, beam*0.92).rotateZ(rake).translate(bp[0], bp[1], bp[2]),
      color: LIFE_JUNK_BATTEN_COL, color2: cgBatten
    });
  }
  return parts;
}
var lifeShipSailParts = []
  .concat(lifeJunkSail(LIFE_JUNK_FOREMAST_H, LIFE_JUNK_FOREMAST_Z, LIFE_JUNK_FOREMAST_RAKE, LIFE_SHIP_BEAM, LIFE_CG_SAIL_GOLD,  LIFE_CG_BATTEN_GOLD))
  .concat(lifeJunkSail(LIFE_JUNK_MAINMAST_H, LIFE_JUNK_MAINMAST_Z, LIFE_JUNK_MAINMAST_RAKE, LIFE_SHIP_BEAM, LIFE_CG_SAIL_GREEN, LIFE_CG_BATTEN_GREEN));

var lifeShipAllParts = lifeShipHullParts.concat(lifeShipSailParts);
var lifeShipHullGeo = lifeMergeGeoms(lifeShipAllParts);
/* ==== the coast-guard variant attributes (see LIFE_CG_* above for why ==== */
function lifeShipVariantAttrs(geo, parts){
  var n = geo.attributes.position.count;
  var c2 = new Float32Array(n*3), vis = new Float32Array(n), at = 0, tmp = new THREE.Color();
  parts.forEach(function(entry){
    var g = entry.isBufferGeometry ? entry : entry.geo;
    var cnt = g.index ? g.index.count : g.attributes.position.count;
    tmp.set(entry.color2 !== undefined ? entry.color2 : (entry.color !== undefined ? entry.color : 0xffffff));
    tmp.convertSRGBToLinear();
    var v = entry.cg || 0;
    for(var i=0;i<cnt;i++){
      c2[(at+i)*3] = tmp.r; c2[(at+i)*3+1] = tmp.g; c2[(at+i)*3+2] = tmp.b;
      vis[at+i] = v;
    }
    at += cnt;
  });
  geo.setAttribute('cgColor', new THREE.Float32BufferAttribute(c2, 3));
  geo.setAttribute('cgVis',   new THREE.Float32BufferAttribute(vis, 1));
  return at === n;   /* false would mean the two walks disagreed — reported, never guessed at */
}
var LIFE_CG_ATTRS_OK = lifeShipVariantAttrs(lifeShipHullGeo, lifeShipAllParts);

function applyShipSailSway(sh, yLo, yHi, amp){
  sh.uniforms.uWindTime = CLOTH_TIME;
  sh.vertexShader = sh.vertexShader.replace('#include <common>',
    '#include <common>\nuniform float uWindTime;');

  sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\n' +
    '#ifdef USE_INSTANCING\n' +
    '  float _swayPhase = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898,78.233))) * 43758.5453) * 6.28318;\n' +
    '  float _swayMask = smoothstep(' + yLo.toFixed(2) + ', ' + yHi.toFixed(2) + ', position.y);\n' +
    '  float _sway = (sin(uWindTime * 1.6 + _swayPhase) * 0.16 + sin(uWindTime * 2.7 + _swayPhase * 1.3) * 0.07) * ' + amp.toFixed(2) + ';\n' +
    '  transformed.x += _sway * _swayMask;\n' +
    '  transformed.z += _sway * _swayMask;\n' +
    '#endif\n');
}

function applyCGuardVariant(sh){
  sh.vertexShader = sh.vertexShader.replace('#include <common>',
    '#include <common>\nattribute vec3 cgColor;\nattribute float cgVis;\nattribute float aCGuard;');
  sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>',
    '#include <color_vertex>\n' +
    '#ifdef USE_COLOR\n  vColor.xyz = mix(vColor.xyz, cgColor, aCGuard);\n#endif\n');
  sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\n' +
    '  float _cgKeep = (cgVis < 0.5) ? 1.0 : ((cgVis < 1.5) ? aCGuard : (1.0 - aCGuard));\n' +
    '  transformed *= _cgKeep;\n');
}
var lifeShipHullMat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
lifeShipHullMat.onBeforeCompile = function(sh){ applyShipSailSway(sh, 6.0, 10.0, 1.6); applyCGuardVariant(sh); };
lifeShipHullMat.customProgramCacheKey = function(){ return 'shipsway-junk-cg'; };

var LIFE_SHIP_CG_IDX = LIFE_SHIP_N;
var LIFE_SHIP_HULL_N = LIFE_SHIP_N + 1;
var lifeShipHullMesh = new THREE.InstancedMesh(lifeShipHullGeo, lifeShipHullMat, LIFE_SHIP_HULL_N);
lifeShipHullMesh.userData.life = true; lifeShipHullMesh.userData.inspectLabel = 'Ship hull';
lifeShipHullMesh.frustumCulled = false;

(function(){
  var a = new Float32Array(LIFE_SHIP_HULL_N);
  a[LIFE_SHIP_CG_IDX] = 1;
  lifeShipHullGeo.setAttribute('aCGuard', new THREE.InstancedBufferAttribute(a, 1));
})();
scene.add(lifeShipHullMesh);

var LIFE_GALLEON_LEN = 58, LIFE_GALLEON_BEAM = 14, LIFE_GALLEON_MASTS = 2;

var LIFE_GALLEON_HULL_COL = 0x2c2116;
var lifeGalleonHullParts = [];
(function(){
  var L = LIFE_GALLEON_LEN, B = LIFE_GALLEON_BEAM, col = LIFE_GALLEON_HULL_COL;
  var nseg = 9;
  for(var i=0;i<nseg;i++){
    var t = (i+0.5)/nseg, lz = L*(t-0.5);
    var taper = Math.sin(Math.PI*Math.pow(t,0.78));
    var bw = B*(0.30 + 0.70*taper);
    var sheer = 1.0 + 0.55*Math.pow(Math.abs(t-0.46)*2, 2.2);
    lifeGalleonHullParts.push(
      { geo: SHAPES.fr6().scale(bw*1.34, 8.6*sheer, L/nseg*1.1).translate(0, -4.4, lz), color: shade(col, (i%2)?0.04:0) },
      { geo: SHAPES.box().scale(bw*0.95, 1.0, L/nseg*1.05).translate(0, -4.4+8.6*sheer, lz), color: shade(col, -0.2) }
    );
  }
  lifeGalleonHullParts.push(
    { geo: SHAPES.box().scale(B*0.80, 6.5, L*0.20).translate(0, 5.2, -L*0.40), color: shade(col, 0.10) },   /* stern */
    { geo: SHAPES.cyl().scale(0.7, 9, 0.7).translate(0, 4.2, L*0.54), color: shade(col, 0.05) }              /* bow post */
  );
  for(var m=0; m<LIFE_GALLEON_MASTS; m++){
    var tm = (m+0.55)/(LIFE_GALLEON_MASTS+0.35);
    var mz = L*(0.36 - tm*0.76);
    var mh = 40 - m*6;
    lifeGalleonHullParts.push({ geo: SHAPES.cyl().scale(0.82, mh, 0.82).translate(0, 4.6, mz), color: 0x5b4b38 });

    var sailCol = pick(SAILC), prevFrac = 0.05;
    [0.30, 0.55, 0.78].forEach(function(fr, k){
      var yw = B*(2.0-k*0.45);
      lifeGalleonHullParts.push({ geo: SHAPES.box().scale(yw, 0.7, 1.1).translate(0, 4.6+mh*fr, mz), color: 0x5b4b38 });
      var loY = 4.6+mh*prevFrac+0.6, hiY = 4.6+mh*fr-0.5, sailH = hiY-loY;

      if(sailH > 3){
        lifeGalleonHullParts.push({ geo: SHAPES.box().scale(yw*0.84, sailH, 0.35).translate(0, loY, mz), color: sailCol });
      }
      prevFrac = fr;
    });
  }
})();
var lifeGalleonHullGeo = lifeMergeGeoms(lifeGalleonHullParts);
var lifeGalleonHullMat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
lifeGalleonHullMat.onBeforeCompile = function(sh){ applyShipSailSway(sh, 10.0, 16.0, 2.0); };
lifeGalleonHullMat.customProgramCacheKey = function(){ return 'shipsway-galleon'; };
var lifeGalleonHullMesh = new THREE.InstancedMesh(lifeGalleonHullGeo, lifeGalleonHullMat, LIFE_SHIP_N);
lifeGalleonHullMesh.userData.life = true; lifeGalleonHullMesh.userData.inspectLabel = 'Galleon hull';
lifeGalleonHullMesh.frustumCulled = false;
scene.add(lifeGalleonHullMesh);

var LIFE_SHIP_CREW_PER = 5;
var lifeShipPeopleMesh = new THREE.InstancedMesh(lifePersonGeoWhite,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_SHIP_N*LIFE_SHIP_CREW_PER);
lifeShipPeopleMesh.userData.life = true; lifeShipPeopleMesh.userData.inspectLabel = 'Ship crew';
lifeShipPeopleMesh.frustumCulled = false;
scene.add(lifeShipPeopleMesh);

function lifeShipCrewAnchors(len){
  return [
    [0, -len*0.30], [-2.6, -len*0.14], [2.6, len*0.02],
    [-2.2, len*0.20], [0, len*0.34]
  ];
}
var LIFE_SHIP_CREW_ANCHORS = { junk: lifeShipCrewAnchors(LIFE_SHIP_LEN), galleon: lifeShipCrewAnchors(LIFE_GALLEON_LEN) };

var LIFE_SHIP_DECK_Y = { junk: LIFE_JUNK_MAST_BASE_Y, galleon: 4.2 };

function lifeShipPolyDock(poly){
  var cx=0, cz=0;
  poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; });
  cx/=poly.length; cz/=poly.length;
  var bestLen=-1, bestDx=1, bestDz=0;
  for(var i=0;i<poly.length;i++){
    var a=poly[i], b=poly[(i+1)%poly.length];
    var dx=b[0]-a[0], dz=b[1]-a[1], len=Math.hypot(dx,dz);
    if(len>bestLen){ bestLen=len; bestDx=dx/len; bestDz=dz/len; }
  }
  return { x: cx, z: cz, ry: Math.atan2(bestDx, bestDz) };
}
var LIFE_SHIP_STATIONARY_POLYS = [
  [[1218.3,-1487.1],[1218.9,-1577.1],[1248.7,-1577.0],[1242.4,-1484.5]],
  [[733.5,-513.7],[722.6,-477.2],[617.9,-499.2],[632.7,-535.9]],
  [[1345.8,-1361.9],[1346.7,-1401.1],[1457.8,-1394.5],[1457.2,-1360.7]],
  [[1351.9,-1246.4],[1347.5,-1217.8],[1431.8,-1217.9],[1430.5,-1245.6]]
];
var LIFE_SHIP_MOBILE_POLYS = [
  [[775.7,-1067.9],[854.4,-975.9],[821.9,-954.8],[739.7,-1034.0]],
  [[687.5,-980.5],[662.6,-922.6],[801.7,-865.8],[820.4,-906.6]],
  [[637.8,-804.5],[629.5,-747.8],[767.8,-727.7],[778.8,-777.7]],
  [[588.2,-736.2],[581.6,-685.2],[758.9,-665.6],[763.5,-710.1]],
  [[978.4,-1245.7],[866.3,-1244.0],[870.9,-1200.1],[979.3,-1202.0]],
  [[982.8,-1358.3],[881.1,-1354.9],[881.2,-1382.9],[977.1,-1378.3]],
  [[1109.1,-1597.1],[1107.9,-1482.9],[1063.8,-1485.3],[1064.2,-1598.1]]
];
var LIFE_SHIP_STATIONARY_DOCKS = LIFE_SHIP_STATIONARY_POLYS.map(lifeShipPolyDock);
var LIFE_SHIP_MOBILE_DOCKS = LIFE_SHIP_MOBILE_POLYS.map(function(poly){
  var d = lifeShipPolyDock(poly); d.occupiedBy = null; return d;
});
function lifeShipOpenMobileDock(){
  var open = [];
  LIFE_SHIP_MOBILE_DOCKS.forEach(function(d,i){ if(d.occupiedBy === null) open.push(i); });
  return open.length ? pick(open) : null;
}

function lifeShipClearPoint(dock, dist){
  var perp = dock.ry + Math.PI/2;
  var ox = Math.sin(perp), oz = Math.cos(perp);
  var p1x = dock.x+ox*dist, p1z = dock.z+oz*dist;
  var p2x = dock.x-ox*dist, p2z = dock.z-oz*dist;
  var b1 = lifeNavBlocked(p1x, p1z), b2 = lifeNavBlocked(p2x, p2z);
  if(b1 !== b2) return b1 ? [p2x,p2z] : [p1x,p1z];
  var d1 = Math.hypot(p1x-LIFE_BAY_CENTER.x, p1z-LIFE_BAY_CENTER.z);
  var d2 = Math.hypot(p2x-LIFE_BAY_CENTER.x, p2z-LIFE_BAY_CENTER.z);
  return d1 >= d2 ? [p1x,p1z] : [p2x,p2z];
}

function lifeShipDepartCurve(dock, toX, toZ){
  var clear = lifeShipClearPoint(dock, 42);
  var main = lifeNavBuildLeg(clear[0], clear[1], toX, toZ);
  var pts = main.getPoints(24);
  var wp = [[dock.x,dock.z], clear];
  pts.forEach(function(p){ wp.push([p.x,p.z]); });
  return lifeCurveFromCentripetal(wp);
}
function lifeShipArriveCurve(fromX, fromZ, dock){
  var clear = lifeShipClearPoint(dock, 42);
  var main = lifeNavBuildLeg(fromX, fromZ, clear[0], clear[1]);
  var pts = main.getPoints(24);
  var wp = [];
  pts.forEach(function(p){ wp.push([p.x,p.z]); });
  wp.push(clear); wp.push([dock.x,dock.z]);
  return lifeCurveFromCentripetal(wp);
}

lifeNavBuildGrid();

var LIFE_SHIPS = [];
var LIFE_SHIP_T = 0;                    /* the ships' own clock, advanced in updateShips */
var LIFE_SHIP_DEPART_AT = null;         /* sim time the next scheduled departure fires, or null = none pending */
var LIFE_SHIP_PENDING_DEPARTURE = null; /* which ship object that departure is for */
function lifeShipKind(){ return chance(0.5) ? 'junk' : 'galleon'; }
(function(){
  var idxs = LIFE_SHIP_MOBILE_DOCKS.map(function(_,i){ return i; });
  for(var s=idxs.length-1; s>0; s--){ var j = Math.floor(rnd()*(s+1)); var tmp=idxs[s]; idxs[s]=idxs[j]; idxs[j]=tmp; }

  var d0 = LIFE_SHIP_MOBILE_DOCKS[idxs[0]]; d0.occupiedBy = 0;
  var curve0 = lifeShipArriveCurve(227.0, -923.8, d0);
  LIFE_SHIPS.push({
    state: 'arriving', dockIdx: idxs[0], kind: lifeShipKind(), curve: curve0, len: curve0.getLength(),
    speed: rr(14,20), stateT: 0, original: true, everDeparted: false
  });
  LIFE_SHIPS[0].dur = Math.max(20, LIFE_SHIPS[0].len/LIFE_SHIPS[0].speed);

  LIFE_SHIPS.push({ state:'away', dockIdx:null, kind:null, speed: rr(14,20), stateT:0, original:true, everDeparted:false });
  /* ships 2-4: pre-docked at 3 more distinct open berths. */
  for(var m=0; m<3; m++){
    var di = idxs[2+m];
    var dock = LIFE_SHIP_MOBILE_DOCKS[di];
    dock.occupiedBy = 2+m;
    LIFE_SHIPS.push({
      state:'docked', dockIdx: di, kind: lifeShipKind(), x: dock.x, z: dock.z, ry: dock.ry,
      speed: rr(14,20), lastArrivalTime: rr(-1,1), stateT:0, original:true, everDeparted:false
    });
  }

  LIFE_SHIP_STATIONARY_DOCKS.forEach(function(dock){
    LIFE_SHIPS.push({ state:'docked', stationary:true, kind: lifeShipKind(), x: dock.x, z: dock.z, ry: dock.ry, stateT:0 });
  });
})();
window._ships = { count: LIFE_SHIPS.length, mobileN: LIFE_SHIP_MOBILE_N, stationaryN: LIFE_SHIP_STATIONARY_N, mobileDocks: LIFE_SHIP_MOBILE_DOCKS.length, inlet: LIFE_NORTH_INLET };
window._lifeShips = LIFE_SHIPS;   /* diagnostic: full state, incl. each ship's .curve */

function lifePickDeparture(){
  var freshOriginals = LIFE_SHIPS.filter(function(sh){
    return sh.state === 'docked' && !sh.stationary && sh.original && !sh.everDeparted;
  });
  if(freshOriginals.length) return pick(freshOriginals);
  var best = null;
  LIFE_SHIPS.forEach(function(sh){
    if(sh.state !== 'docked' || sh.stationary) return;
    if(!best || sh.lastArrivalTime < best.lastArrivalTime) best = sh;
  });
  return best;
}
var LIFE_SHIP_UP = new THREE.Vector3(0,1,0);
var lifeShipTmpPos = new THREE.Vector3(), lifeShipTmpDir = new THREE.Vector3(), lifeShipTmpPos2 = new THREE.Vector3();
var lifeShipTmpQuat = new THREE.Quaternion(), lifeShipTmpMat = new THREE.Matrix4();
var lifeShipTmpScale1 = new THREE.Vector3(1,1,1), lifeShipTmpScale0 = new THREE.Vector3(0,0,0);
var lifeShipCrewTmpPos = new THREE.Vector3(), lifeShipCrewTmpMat = new THREE.Matrix4();

function lifeShipPlaceCrew(idx, visible, shipPos, shipQuat, kind){
  var baseIdx = idx*LIFE_SHIP_CREW_PER;
  var anchors = LIFE_SHIP_CREW_ANCHORS[kind];
  var deckY = LIFE_SHIP_DECK_Y[kind];
  for(var s=0; s<LIFE_SHIP_CREW_PER; s++){
    if(visible){
      var anchor = anchors[s];
      var ang = LIFE_SHIP_T*0.5 + idx*2.1 + s*1.7;
      var lx = anchor[0] + Math.sin(ang)*1.1;
      var lz = anchor[1] + Math.cos(ang*0.6)*0.7;
      lifeShipCrewTmpPos.set(lx, deckY, lz).applyQuaternion(shipQuat).add(shipPos);
      lifeShipCrewTmpMat.compose(lifeShipCrewTmpPos, shipQuat, lifeShipTmpScale1);
    }else{
      lifeShipCrewTmpMat.compose(lifeShipCrewTmpPos.set(0,0,0), shipQuat, lifeShipTmpScale0);
    }
    lifeShipPeopleMesh.setMatrixAt(baseIdx+s, lifeShipCrewTmpMat);
  }
}

function lifeShipHullMeshFor(kind){ return kind === 'galleon' ? lifeGalleonHullMesh : lifeShipHullMesh; }
function lifeShipHideBoth(idx){
  lifeShipTmpMat.compose(lifeShipTmpPos.set(0,0,0), lifeShipTmpQuat.identity(), lifeShipTmpScale0);
  lifeShipHullMesh.setMatrixAt(idx, lifeShipTmpMat);
  lifeGalleonHullMesh.setMatrixAt(idx, lifeShipTmpMat);
}

function updateShips(dt){
  LIFE_SHIP_T += dt;
  LIFE_SHIPS.forEach(function(sh, idx){
    sh.stateT += dt;
    var avoidSlot = LIFE_AVOID_SHIP0 + idx;
    if(sh.state === 'docked'){
      lifeShipTmpPos.set(sh.x, SEA-0.3, sh.z);
      lifeShipTmpQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.ry);
      LIFE_AVOID_X[avoidSlot] = sh.x; LIFE_AVOID_Z[avoidSlot] = sh.z; LIFE_AVOID_R[avoidSlot] = LIFE_SHIP_AVOID_R;
    }else if(sh.state === 'away'){
      LIFE_AVOID_R[avoidSlot] = 0;   /* off the map — not an obstacle for anyone */
      lifeShipHideBoth(idx);
      lifeShipPlaceCrew(idx, false, lifeShipTmpPos, lifeShipTmpQuat, sh.kind);
      return;
    }else{

      var raw = Math.min(1, sh.stateT / sh.dur);
      var t = raw*raw*(3-2*raw);
      sh.curve.getPointAt(t, lifeShipTmpPos);
      var tTan = Math.min(0.995, Math.max(0.005, t));
      sh.curve.getTangentAt(tTan, lifeShipTmpDir);
      var tanYaw = Math.atan2(lifeShipTmpDir.x, lifeShipTmpDir.z);

      var sdelta = lifeAvoidNudge2(avoidSlot, lifeShipTmpPos.x, lifeShipTmpPos.z, lifeShipTmpDir.x, lifeShipTmpDir.z, LIFE_SHIP_AVOID_R, 12.0, LIFE_SHIP_LOOKAHEAD, 4.5, 3);
      lifeShipTmpPos.x += sdelta[0]; lifeShipTmpPos.z += sdelta[1];

      if(sh.facingYaw === undefined) sh.facingYaw = tanYaw;
      if(sh.lastX === undefined){ sh.lastX = lifeShipTmpPos.x; sh.lastZ = lifeShipTmpPos.z; }
      var mdx = lifeShipTmpPos.x-sh.lastX, mdz = lifeShipTmpPos.z-sh.lastZ;
      var moveYaw = (mdx*mdx+mdz*mdz > 1e-6) ? Math.atan2(mdx,mdz) : tanYaw;
      var dAng = moveYaw - sh.facingYaw;
      while(dAng > Math.PI) dAng -= Math.PI*2;
      while(dAng < -Math.PI) dAng += Math.PI*2;
      var maxStep = LIFE_SHIP_TURN_RATE*dt;
      sh.facingYaw += Math.max(-maxStep, Math.min(maxStep, dAng));
      lifeShipTmpQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.facingYaw);
      sh.lastX = lifeShipTmpPos.x; sh.lastZ = lifeShipTmpPos.z;

      LIFE_AVOID_X[avoidSlot] = lifeShipTmpPos.x; LIFE_AVOID_Z[avoidSlot] = lifeShipTmpPos.z; LIFE_AVOID_R[avoidSlot] = LIFE_SHIP_AVOID_R;

      if(sh.state === 'departing' && !sh.halfwayTriggered && raw >= 0.5){
        sh.halfwayTriggered = true;
        var awayShip = null;
        LIFE_SHIPS.forEach(function(s){ if(s.state === 'away') awayShip = s; });
        if(awayShip){
          var di2 = lifeShipOpenMobileDock();
          if(di2 !== null){
            var dock2 = LIFE_SHIP_MOBILE_DOCKS[di2];
            dock2.occupiedBy = LIFE_SHIPS.indexOf(awayShip);
            awayShip.kind = lifeShipKind();
            awayShip.dockIdx = di2;
            awayShip.curve = lifeShipArriveCurve(LIFE_NORTH_INLET[0], LIFE_NORTH_INLET[1], dock2);
            awayShip.len = awayShip.curve.getLength();
            awayShip.dur = Math.max(20, awayShip.len/awayShip.speed);
            awayShip.state = 'arriving'; awayShip.stateT = 0;
          }
        }
      }

      if(raw >= 1){
        if(sh.state === 'arriving'){
          var dock3 = LIFE_SHIP_MOBILE_DOCKS[sh.dockIdx];
          sh.state = 'docked'; sh.x = dock3.x; sh.z = dock3.z; sh.ry = dock3.ry;
          sh.lastArrivalTime = LIFE_SHIP_T; sh.stateT = 0;

          var depPick = lifePickDeparture();
          if(depPick){ LIFE_SHIP_PENDING_DEPARTURE = depPick; LIFE_SHIP_DEPART_AT = LIFE_SHIP_T + 15; }
        }else{
          if(sh.dockIdx !== null) LIFE_SHIP_MOBILE_DOCKS[sh.dockIdx].occupiedBy = null;
          sh.dockIdx = null;
          sh.state = 'away'; sh.stateT = 0;
        }
      }
    }
    lifeShipTmpMat.compose(lifeShipTmpPos, lifeShipTmpQuat, lifeShipTmpScale1);
    lifeShipHullMeshFor(sh.kind).setMatrixAt(idx, lifeShipTmpMat);
    lifeShipPlaceCrew(idx, true, lifeShipTmpPos, lifeShipTmpQuat, sh.kind);
    lifeShipTmpMat.compose(lifeShipTmpPos2.set(0,0,0), lifeShipTmpQuat, lifeShipTmpScale0);
    lifeShipHullMeshFor(sh.kind === 'galleon' ? 'junk' : 'galleon').setMatrixAt(idx, lifeShipTmpMat);
  });
  if(LIFE_SHIP_DEPART_AT !== null && LIFE_SHIP_T >= LIFE_SHIP_DEPART_AT && LIFE_SHIP_PENDING_DEPARTURE){
    var dep = LIFE_SHIP_PENDING_DEPARTURE;
    if(dep.state === 'docked'){
      var dock = LIFE_SHIP_MOBILE_DOCKS[dep.dockIdx];
      dep.curve = lifeShipDepartCurve(dock, LIFE_NORTH_INLET[0], LIFE_NORTH_INLET[1]);
      dep.len = dep.curve.getLength();
      dep.dur = Math.max(20, dep.len/dep.speed);
      dep.everDeparted = true;
      dep.halfwayTriggered = false;
      dep.state = 'departing'; dep.stateT = 0;
    }
    LIFE_SHIP_DEPART_AT = null; LIFE_SHIP_PENDING_DEPARTURE = null;
  }
  lifeShipHullMesh.instanceMatrix.needsUpdate = true;
  lifeGalleonHullMesh.instanceMatrix.needsUpdate = true;
  lifeShipPeopleMesh.instanceMatrix.needsUpdate = true;
}

/* ==== the Fortress coast guard ==== */
var LIFE_CG_CREW_N  = 5;      /* ordinators; folded into LIFE_ORD_N further down, so they cost no new mesh and get the reserved lantern slots for free */
var LIFE_CG_DWELL   = 90;     /* seconds alongside between patrols */
var LIFE_CG_SPEED   = 12;     /* cruise: under a merchantman's 14-20, a patrol keeps station rather than races */
var LIFE_CG_PATROL_A = 420, LIFE_CG_PATROL_B = 210;   /* the beat's semi-axes: long across the approach, shallow in depth */
var LIFE_CG_PATROL_OFF = 280;                          /* how far north of the berth its centre sits */
var LIFE_CG_PATROL_PTS = 12;

var LIFE_CG_HULL_AFT = -LIFE_SHIP_LEN*0.46;
var LIFE_CG_HULL_FWD =  LIFE_SHIP_LEN*0.53;
var LIFE_CG_HULL_LEN =  LIFE_CG_HULL_FWD - LIFE_CG_HULL_AFT;
var LIFE_CG_SPAN_LEN =  LIFE_CG_SPRIT_TIPZ - LIFE_CG_HULL_AFT;
var LIFE_CG_BERTH  = null;
var LIFE_CG_PATROL = null;
var LIFE_CG_SHIP   = null;
var LIFE_CG_T = 0;
var LIFE_CG_CREW_ANCHORS = [
  [0,   -LIFE_SHIP_LEN*0.16],   /* at the helm, forward of the deckhouse so nobody stands inside it */
  [-3.0,-LIFE_SHIP_LEN*0.04], [3.0, LIFE_SHIP_LEN*0.08],
  [-2.4, LIFE_SHIP_LEN*0.20],
  [0,    LIFE_SHIP_LEN*0.32]    /* bow lookout, at the root of the bowsprit */
];
var LIFE_CG_DIAG = { built:false, why:null };
(function(){
  if(typeof LIFE_CGUARD_BERTHS === 'undefined' || !LIFE_CGUARD_BERTHS.length){ LIFE_CG_DIAG.why = 'no coast-guard berths published'; return; }

  var cand = LIFE_CGUARD_BERTHS.slice().sort(function(a,b){ return b.len - a.len; });
  LIFE_CG_BERTH = cand.filter(function(b){ return b.len >= LIFE_CG_HULL_LEN; })[0] || cand[0];
  LIFE_CG_DIAG.berthFits = LIFE_CG_BERTH.len >= LIFE_CG_HULL_LEN;

  /* ==== the beat, validated point by point ==== */
  var fc = CIDX['Fortress'];
  var cx = LIFE_CG_BERTH.x, cz = LIFE_CG_BERTH.z - LIFE_CG_PATROL_OFF;
  var pts = [], rejected = 0;
  for(var i=0;i<LIFE_CG_PATROL_PTS;i++){
    var th = i*Math.PI*2/LIFE_CG_PATROL_PTS;
    var px = cx + Math.cos(th)*LIFE_CG_PATROL_A, pz = cz + Math.sin(th)*LIFE_CG_PATROL_B;
    var ok = false;
    for(var k=0;k<6;k++){

      var clear = !lifeNavBlocked(px,pz) && !inRiver(px,pz,80) && terrainH(px,pz) < SEA-4;
      for(var r=0; clear && r<4; r++){
        var ra = r*Math.PI/2;
        if(lifeNavBlocked(px+Math.cos(ra)*22, pz+Math.sin(ra)*22)) clear = false;
      }
      if(clear){ ok = true; break; }

      var ax = px - (fc ? fc.x : cx), az = pz - (fc ? fc.z : cz), al = Math.hypot(ax,az)||1;
      px += ax/al*34; pz += az/al*34;
    }
    if(ok) pts.push([px,pz]); else rejected++;
  }
  LIFE_CG_DIAG.patrolPts = pts.length; LIFE_CG_DIAG.patrolRejected = rejected;
  if(pts.length >= 5){
    var wp = [];
    for(var a2=0; a2<pts.length; a2++){
      var A2 = pts[a2], B2 = pts[(a2+1)%pts.length];
      var leg = lifeNavBuildLeg(A2[0],A2[1],B2[0],B2[1]);
      var lp = leg.getPoints(8);
      for(var j=0;j<lp.length-1;j++){
        var last = wp[wp.length-1];
        if(last && Math.hypot(lp[j].x-last.x, lp[j].z-last.z) < 1.0) continue;   /* centripetal Catmull-Rom goes NaN on coincident control points */
        wp.push(new THREE.Vector3(lp[j].x, LIFE_Y, lp[j].z));
      }
    }
    if(wp.length >= 8) LIFE_CG_PATROL = new THREE.CatmullRomCurve3(wp, true, 'centripetal');
  }
  if(!LIFE_CG_PATROL) LIFE_CG_DIAG.why = 'patrol circuit could not be verified clear — vessel stays moored';

  LIFE_CG_SHIP = {
    name:'Coast-guard junk', state:'moored', stateT:0,
    homeX: LIFE_CG_BERTH.x, homeZ: LIFE_CG_BERTH.z, homeRy: LIFE_CG_BERTH.ry,
    px: LIFE_CG_BERTH.x, py: SEA-0.3, pz: LIFE_CG_BERTH.z, yaw: LIFE_CG_BERTH.ry,

    x: LIFE_CG_BERTH.x, z: LIFE_CG_BERTH.z, y: SEA,
    curve: LIFE_CG_PATROL, leg: null, legLen: 0, legDur: 1, facingYaw: LIFE_CG_BERTH.ry
  };
  LIFE_CG_DIAG.built = true;
})();

(function(){
  var m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3();
  if(LIFE_CG_SHIP){
    q.setFromAxisAngle(LIFE_SHIP_UP, LIFE_CG_SHIP.homeRy);
    m.compose(p.set(LIFE_CG_SHIP.homeX, SEA-0.3, LIFE_CG_SHIP.homeZ), q, new THREE.Vector3(1,1,1));
  }else{
    m.compose(p.set(0,0,0), q, new THREE.Vector3(0,0,0));
  }
  lifeShipHullMesh.setMatrixAt(LIFE_SHIP_CG_IDX, m);
  lifeShipHullMesh.instanceMatrix.needsUpdate = true;
})();
window._cguardShip = { diag: LIFE_CG_DIAG, berth: LIFE_CG_BERTH,
  hullLen: +LIFE_CG_HULL_LEN.toFixed(2), hullBeam: +LIFE_SHIP_BEAM.toFixed(2),
  spanWithSprit: +LIFE_CG_SPAN_LEN.toFixed(2),
  spritTipY: +LIFE_CG_SPRIT_TIPY.toFixed(2), spritTipZ: +LIFE_CG_SPRIT_TIPZ.toFixed(2),
  attrsOK: LIFE_CG_ATTRS_OK,
  patrolLen: function(){ return LIFE_CG_PATROL ? Math.round(LIFE_CG_PATROL.getLength()) : 0; },
  ship: function(){ return LIFE_CG_SHIP && { state:LIFE_CG_SHIP.state, x:Math.round(LIFE_CG_SHIP.px), z:Math.round(LIFE_CG_SHIP.pz), t:+LIFE_CG_SHIP.stateT.toFixed(1) }; } };

function lifeCGBegin(state){
  var sh = LIFE_CG_SHIP; if(!sh) return;
  if(state !== 'moored' && !LIFE_CG_PATROL){ sh.state = 'moored'; sh.stateT = 0; return; }
  if(state === 'outbound'){
    var p0 = LIFE_CG_PATROL.getPointAt(0);
    sh.leg = lifeShipDepartCurve({x:sh.homeX, z:sh.homeZ, ry:sh.homeRy}, p0.x, p0.z);
  }else if(state === 'patrol'){
    sh.leg = LIFE_CG_PATROL;
  }else if(state === 'inbound'){
    var p1 = LIFE_CG_PATROL.getPointAt(0);
    sh.leg = lifeShipArriveCurve(p1.x, p1.z, {x:sh.homeX, z:sh.homeZ, ry:sh.homeRy});
  }
  sh.legLen = (state === 'moored') ? 0 : sh.leg.getLength();
  sh.legDur = Math.max(8, sh.legLen/LIFE_CG_SPEED);
  sh.state = state; sh.stateT = 0; sh.lastX = undefined;
}
var lifeCGPos = new THREE.Vector3(), lifeCGDir = new THREE.Vector3();
var lifeCGQuat = new THREE.Quaternion(), lifeCGMat = new THREE.Matrix4();
var lifeCGScale1 = new THREE.Vector3(1,1,1);
function updateCGuard(dt){
  var sh = LIFE_CG_SHIP; if(!sh) return;
  LIFE_CG_T += dt; sh.stateT += dt;
  var slot = LIFE_AVOID_SHIP0 + LIFE_SHIP_CG_IDX;
  if(sh.state === 'moored'){
    lifeCGPos.set(sh.homeX, SEA-0.3, sh.homeZ);
    sh.facingYaw = sh.homeRy;
    lifeCGQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.homeRy);
    LIFE_AVOID_X[slot] = sh.homeX; LIFE_AVOID_Z[slot] = sh.homeZ; LIFE_AVOID_R[slot] = LIFE_SHIP_AVOID_R;
    if(sh.stateT >= LIFE_CG_DWELL) lifeCGBegin('outbound');
  }else{
    var raw = Math.min(1, sh.stateT / sh.legDur);

    var t = (sh.state === 'patrol') ? raw : raw*raw*(3-2*raw);
    sh.leg.getPointAt(Math.min(0.999999, t), lifeCGPos);
    lifeCGPos.y = SEA-0.3;
    sh.leg.getTangentAt(Math.min(0.995, Math.max(0.005, t)), lifeCGDir);
    var tanYaw = Math.atan2(lifeCGDir.x, lifeCGDir.z);
    var d2 = lifeAvoidNudge2(slot, lifeCGPos.x, lifeCGPos.z, lifeCGDir.x, lifeCGDir.z, LIFE_SHIP_AVOID_R, 12.0, LIFE_SHIP_LOOKAHEAD, 4.5, 3);
    lifeCGPos.x += d2[0]; lifeCGPos.z += d2[1];
    if(sh.facingYaw === undefined) sh.facingYaw = tanYaw;
    if(sh.lastX === undefined){ sh.lastX = lifeCGPos.x; sh.lastZ = lifeCGPos.z; }
    var mdx = lifeCGPos.x-sh.lastX, mdz = lifeCGPos.z-sh.lastZ;
    var moveYaw = (mdx*mdx+mdz*mdz > 1e-6) ? Math.atan2(mdx,mdz) : tanYaw;
    var dA = moveYaw - sh.facingYaw;
    while(dA >  Math.PI) dA -= Math.PI*2;
    while(dA < -Math.PI) dA += Math.PI*2;
    var step = LIFE_SHIP_TURN_RATE*dt;
    sh.facingYaw += Math.max(-step, Math.min(step, dA));
    sh.lastX = lifeCGPos.x; sh.lastZ = lifeCGPos.z;
    lifeCGQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.facingYaw);
    LIFE_AVOID_X[slot] = lifeCGPos.x; LIFE_AVOID_Z[slot] = lifeCGPos.z; LIFE_AVOID_R[slot] = LIFE_SHIP_AVOID_R;
    if(raw >= 1){
      if(sh.state === 'outbound')      lifeCGBegin('patrol');
      else if(sh.state === 'patrol')   lifeCGBegin('inbound');
      else { sh.state = 'moored'; sh.stateT = 0; }
    }
  }
  sh.px = lifeCGPos.x; sh.py = lifeCGPos.y; sh.pz = lifeCGPos.z; sh.yaw = sh.facingYaw;
  sh.x = lifeCGPos.x; sh.z = lifeCGPos.z; sh.y = SEA;
  lifeCGMat.compose(lifeCGPos, lifeCGQuat, lifeCGScale1);
  lifeShipHullMesh.setMatrixAt(LIFE_SHIP_CG_IDX, lifeCGMat);
  lifeShipHullMesh.instanceMatrix.needsUpdate = true;
}

var lifeCGCrewPos = new THREE.Vector3(), lifeCGCrewQuat = new THREE.Quaternion();
var lifeCGCrewQuat2 = new THREE.Quaternion(), lifeCGCrewMat = new THREE.Matrix4();
function updateCGuardCrew(base){
  var sh = LIFE_CG_SHIP;
  for(var s=0; s<LIFE_CG_CREW_N; s++){
    if(sh){
      var a = LIFE_CG_CREW_ANCHORS[s];
      var ang = LIFE_CG_T*0.45 + s*1.9;
      lifeCGCrewQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.yaw);
      lifeCGCrewPos.set(a[0] + Math.sin(ang)*0.9,
                        LIFE_SHIP_DECK_Y.junk + 0.14,   /* the ordinator torso is 0.28 taller than a sailor's; half of that puts their feet on the same plank */
                        a[1] + Math.cos(ang*0.6)*0.6)
        .applyQuaternion(lifeCGCrewQuat);
      lifeCGCrewPos.x += sh.px; lifeCGCrewPos.y += sh.py; lifeCGCrewPos.z += sh.pz;
      lifeCGCrewQuat2.setFromAxisAngle(LIFE_SHIP_UP, sh.yaw + Math.sin(ang*0.7)*0.5 + s*1.2);
      lifeCGCrewMat.compose(lifeCGCrewPos, lifeCGCrewQuat2, lifeOrdTmpScale1);
      lifeOrdMesh.setMatrixAt(base+s, lifeCGCrewMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+base+s, lifeCGCrewPos.x, lifeCGCrewPos.y+2.1, lifeCGCrewPos.z);
    }else{
      lifeCGCrewMat.compose(lifeCGCrewPos.set(0,0,0), lifeCGCrewQuat.identity(), lifeOrdTmpScale0);
      lifeOrdMesh.setMatrixAt(base+s, lifeCGCrewMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+base+s, 0, 0, 0, false);
    }
  }
}

if(typeof pathvizRegister === 'function') pathvizRegister({
  key:'cguard', label:'Coast guard (Fortress)', color:0x3fbf6a, seg:24, glow:8,
  entities: function(){ return LIFE_CG_SHIP ? [LIFE_CG_SHIP] : []; },
  posts: function(){ return (typeof LIFE_CGUARD_BERTHS !== 'undefined' ? LIFE_CGUARD_BERTHS : [])
                            .map(function(b){ return { x:b.x, y:SEA, z:b.z }; }); },
  postR: 7
});

if(typeof inspectInstance === 'function') inspectInstance({
  key: 'cguard-junk',
  mesh: lifeShipHullMesh,
  index: LIFE_SHIP_CG_IDX,
  label: 'Coast-guard junk — Ordinator patrol',
  site: 'Fortress canton'
});

/* ==== water taxis / ferries ==== */

var LIFE_FERRY_LEN = 16, LIFE_FERRY_BEAM = 6;
var lifeFerryHullParts = [
  new THREE.BoxGeometry(LIFE_FERRY_BEAM, 2.6, LIFE_FERRY_LEN),
  new THREE.BoxGeometry(LIFE_FERRY_BEAM*0.92, 0.5, LIFE_FERRY_LEN*0.96).translate(0, 2.2, 0),
  new THREE.BoxGeometry(LIFE_FERRY_BEAM*0.6, 2.2, LIFE_FERRY_LEN*0.28).translate(0, 3.6, -LIFE_FERRY_LEN*0.22),
  new THREE.CylinderGeometry(0.18, 0.18, 7, 6).translate(0, 3.1, LIFE_FERRY_LEN*0.18),
  new THREE.BoxGeometry(0.06, 6, LIFE_FERRY_BEAM*0.55).translate(0, 4.1, LIFE_FERRY_LEN*0.18)
];
var lifeFerryHullGeo = lifeMergeGeoms(lifeFerryHullParts);
var LIFE_FERRY_N = 12;
var lifeFerryHullMesh = new THREE.InstancedMesh(lifeFerryHullGeo, new THREE.MeshLambertMaterial({ color: 0x5e4d3a }), LIFE_FERRY_N);
lifeFerryHullMesh.userData.life = true; lifeFerryHullMesh.userData.inspectLabel = 'Ferry hull';
lifeFerryHullMesh.frustumCulled = false;
scene.add(lifeFerryHullMesh);

var LIFE_FERRY_PEOPLE_PER = 6;   /* 1 ferryman + up to 5 passengers */
var lifeFerryPeopleMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_FERRY_N*LIFE_FERRY_PEOPLE_PER);
lifeFerryPeopleMesh.userData.life = true; lifeFerryPeopleMesh.userData.inspectLabel = 'Ferry passenger';
lifeFerryPeopleMesh.frustumCulled = false;
scene.add(lifeFerryPeopleMesh);

var LIFE_FERRY_SEATS = [
  [0, -LIFE_FERRY_LEN*0.42],
  [-1.4, -1.5], [1.4, -1.5], [-1.4, 2.5], [1.4, 2.5], [0, 5.6]
];

/* ==== the 12 ferries: 10 round the main circle (5 clockwise, 5 counter), ==== */
var LIFE_FERRIES = [];
(function(){
  var n = LIFE_FERRY_STOPS.length;
  for(var i=0;i<5;i++){
    var startIdx = Math.floor(i*n/5);
    LIFE_FERRIES.push({ stops: LIFE_FERRY_STOPS, dir: 1, idx: startIdx,
      speed: rr(8,11), dwell: rr(9,16), stateT: rr(0,10), state:'docked', passengers: ri(1,5) });
  }
  for(var j=0;j<5;j++){
    var startIdx2 = Math.floor(j*n/5 + n/10);
    LIFE_FERRIES.push({ stops: LIFE_FERRY_STOPS, dir: -1, idx: startIdx2,
      speed: rr(8,11), dwell: rr(9,16), stateT: rr(0,10), state:'docked', passengers: ri(1,5) });
  }
  var custStop = LIFE_FERRY_STOPS.filter(function(s){ return s.name === 'Customs'; })[0];
  var promStop = LIFE_FERRY_STOPS.filter(function(s){ return s.name === 'Promontory'; })[0];
  LIFE_FERRIES.push({ stops: [custStop, promStop], dir: 1, idx: 0,
    speed: rr(8,10), dwell: rr(10,16), stateT: rr(0,8), state:'docked', passengers: ri(1,5) });
  LIFE_FERRIES.push({ stops: LIFE_SHRINE_ROUTE, dir: 1, idx: 0,
    speed: rr(7,9), dwell: rr(9,14), stateT: rr(0,8), state:'docked', passengers: ri(1,5) });
})();
window._ferries = { count: LIFE_FERRIES.length, stops: LIFE_FERRY_STOPS.length, shrineStops: LIFE_SHRINE_STOPS.length };
window._ferryStops = LIFE_FERRY_STOPS;   /* diagnostic: name/x/z/ry for every stop */
window._shrineStops = LIFE_SHRINE_STOPS;
window._legsFerry = LIFE_FERRIES.map(function(){ return null; });

var lifeFerryTmpPos = new THREE.Vector3(), lifeFerryTmpDir = new THREE.Vector3();
var lifeFerryTmpQuat = new THREE.Quaternion(), lifeFerryTmpMat = new THREE.Matrix4();
var lifeFerryTmpScale1 = new THREE.Vector3(1,1,1), lifeFerryTmpScale0 = new THREE.Vector3(0,0,0);
var lifeFerryTmpPos2 = new THREE.Vector3();
function updateFerries(dt){
  LIFE_FERRIES.forEach(function(f, fi){
    f.stateT += dt;
    var pos, yaw;
    if(f.state === 'docked'){
      var stop = f.stops[f.idx];
      pos = stop; yaw = stop.ry;
      if(f.stateT >= f.dwell){
        var nextIdx = (f.idx + f.dir + f.stops.length) % f.stops.length;
        var a = f.stops[f.idx], b = f.stops[nextIdx];

        f.curve = lifeNavBuildLeg(a.x, a.z, b.x, b.z);
        f.len = f.curve.getLength();
        f.dur = Math.max(6, f.len / f.speed);
        f.nextIdx = nextIdx;
        f.state = 'transit'; f.stateT = 0;

        f.lastX = a.x; f.lastZ = a.z; f.facingYaw = a.ry;
        window._legsFerry[fi] = { curve: f.curve };
      }
    }else{
      var raw = Math.min(1, f.stateT / f.dur);
      var t = raw*raw*(3-2*raw);
      f.curve.getPointAt(t, lifeFerryTmpPos);
      pos = lifeFerryTmpPos;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      f.curve.getTangentAt(tTan, lifeFerryTmpDir);
      var tanYaw = Math.atan2(lifeFerryTmpDir.x, lifeFerryTmpDir.z);
      if(raw >= 1){
        f.idx = f.nextIdx;
        f.state = 'docked'; f.stateT = 0; f.dwell = rr(9,16);

        var arrivedStop = f.stops[f.idx];
        var stopDoor = (arrivedStop && typeof LIFE_DOOR_BY_STOPNAME !== 'undefined') ? LIFE_DOOR_BY_STOPNAME[arrivedStop.name] : null;
        if(stopDoor){ lifeFerryBoard(f, stopDoor); }
        else{ f.passengers = ri(1,5); }
      }

      var favoidSlot = LIFE_AVOID_FERRY0 + fi;
      var fdelta = lifeAvoidNudge2(favoidSlot, pos.x, pos.z, lifeFerryTmpDir.x, lifeFerryTmpDir.z, LIFE_AVOID_R[favoidSlot], 8.0, LIFE_AVOID_LOOKAHEAD, 3.5, 2);
      pos.x += fdelta[0]; pos.z += fdelta[1];
      var mdx = pos.x-f.lastX, mdz = pos.z-f.lastZ;
      var moveYaw = (mdx*mdx+mdz*mdz > 1e-6) ? Math.atan2(mdx,mdz) : tanYaw;
      var dAng = moveYaw - f.facingYaw;
      while(dAng > Math.PI) dAng -= Math.PI*2;
      while(dAng < -Math.PI) dAng += Math.PI*2;
      var maxStep = LIFE_FERRY_TURN_RATE*dt;
      f.facingYaw += Math.max(-maxStep, Math.min(maxStep, dAng));
      yaw = f.facingYaw;
      f.lastX = pos.x; f.lastZ = pos.z;
    }
    LIFE_AVOID_X[LIFE_AVOID_FERRY0+fi] = pos.x; LIFE_AVOID_Z[LIFE_AVOID_FERRY0+fi] = pos.z;
    lifeFerryTmpPos2.set(pos.x, SEA-0.2, pos.z);
    lifeFerryTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeFerryTmpMat.compose(lifeFerryTmpPos2, lifeFerryTmpQuat, lifeFerryTmpScale1);
    lifeFerryHullMesh.setMatrixAt(fi, lifeFerryTmpMat);

    var baseIdx = fi*LIFE_FERRY_PEOPLE_PER;
    var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    for(var s=0; s<LIFE_FERRY_PEOPLE_PER; s++){
      var visible = (s === 0) || (s <= f.passengers);
      if(visible){
        var seat = LIFE_FERRY_SEATS[s];
        var wx = pos.x + seat[0]*cosY + seat[1]*sinY;
        var wz = pos.z - seat[0]*sinY + seat[1]*cosY;

        lifeFerryTmpPos2.set(wx, SEA+2.5, wz);   /* +0.2 vs. before: LIFE_PEOPLE_SCALE made the torso cylinder taller */
        lifeFerryTmpMat.compose(lifeFerryTmpPos2, lifeFerryTmpQuat, lifeFerryTmpScale1);
      }else{
        lifeFerryTmpMat.compose(lifeFerryTmpPos2.set(0,0,0), lifeFerryTmpQuat, lifeFerryTmpScale0);
      }
      lifeFerryPeopleMesh.setMatrixAt(baseIdx+s, lifeFerryTmpMat);
    }
  });
  lifeFerryHullMesh.instanceMatrix.needsUpdate = true;
  lifeFerryPeopleMesh.instanceMatrix.needsUpdate = true;
}

/* ==== water taxis ==== */

var LIFE_TAXI_LEN = 20, LIFE_TAXI_BEAM = 3.0;
var lifeTaxiHullParts = [
  /* main hull */
  { geo: new THREE.BoxGeometry(LIFE_TAXI_BEAM, 1.1, LIFE_TAXI_LEN*0.80).translate(0, 0, -LIFE_TAXI_LEN*0.08), color: 0x8a7a68 },
  /* upswept long-tail bow, angled up and forward */
  { geo: new THREE.BoxGeometry(LIFE_TAXI_BEAM*0.68, 0.85, LIFE_TAXI_LEN*0.34).rotateX(-0.58).translate(0, 1.7, LIFE_TAXI_LEN*0.40), color: 0x8a7a68 },
  /* gunwale trim strips, both sides — tint-receptive white */
  { geo: new THREE.BoxGeometry(0.16, 0.38, LIFE_TAXI_LEN*0.78).translate(LIFE_TAXI_BEAM*0.5, 0.40, -LIFE_TAXI_LEN*0.08), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.16, 0.38, LIFE_TAXI_LEN*0.78).translate(-LIFE_TAXI_BEAM*0.5, 0.40, -LIFE_TAXI_LEN*0.08), color: 0xffffff },

  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.40), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(-LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.40), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.125), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(-LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.125), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(LIFE_TAXI_BEAM*0.46, 2.75, LIFE_TAXI_LEN*0.15), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(-LIFE_TAXI_BEAM*0.46, 2.75, LIFE_TAXI_LEN*0.15), color: 0x6b5942 },
  { geo: new THREE.BoxGeometry(LIFE_TAXI_BEAM*1.18, 0.16, LIFE_TAXI_LEN*0.75).translate(0, 4.95, -LIFE_TAXI_LEN*0.125), color: 0xffffff },

  { geo: new THREE.BoxGeometry(0.10, 0.60, LIFE_TAXI_LEN*0.75).translate(LIFE_TAXI_BEAM*0.59, 4.62, -LIFE_TAXI_LEN*0.125), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.10, 0.60, LIFE_TAXI_LEN*0.75).translate(-LIFE_TAXI_BEAM*0.59, 4.62, -LIFE_TAXI_LEN*0.125), color: 0xffffff },
  /* bow wreath — a small garland ring at the bow tip, tint-receptive */
  { geo: new THREE.TorusGeometry(0.52, 0.13, 5, 10).rotateY(Math.PI/2).translate(0, 1.9, LIFE_TAXI_LEN*0.50), color: 0xffffff }
];
var lifeTaxiHullGeo = lifeMergeGeoms(lifeTaxiHullParts);
var LIFE_TAXI_N = 8;
var lifeTaxiHullMesh = new THREE.InstancedMesh(lifeTaxiHullGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_TAXI_N);
lifeTaxiHullMesh.userData.life = true; lifeTaxiHullMesh.userData.inspectLabel = 'Water taxi';
lifeTaxiHullMesh.frustumCulled = false;
scene.add(lifeTaxiHullMesh);

var LIFE_TAXI_CREW = 7, LIFE_TAXI_PAX_MAX = 8, LIFE_TAXI_SEATS_N = LIFE_TAXI_CREW + LIFE_TAXI_PAX_MAX;
var lifeTaxiPeopleMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_TAXI_N*LIFE_TAXI_SEATS_N);
lifeTaxiPeopleMesh.userData.life = true; lifeTaxiPeopleMesh.userData.inspectLabel = 'Water taxi crew';
lifeTaxiPeopleMesh.frustumCulled = false;
scene.add(lifeTaxiPeopleMesh);

var LIFE_TAXI_SEATS = [
  [0, -LIFE_TAXI_LEN*0.42],
  [LIFE_TAXI_BEAM*0.48, 5.0], [LIFE_TAXI_BEAM*0.48, 0.5], [LIFE_TAXI_BEAM*0.48, -4.0],
  [-LIFE_TAXI_BEAM*0.48, 5.0], [-LIFE_TAXI_BEAM*0.48, 0.5], [-LIFE_TAXI_BEAM*0.48, -4.0],
  [0.9, 3.0], [-0.9, 3.0], [0.9, 1.2], [-0.9, 1.2],
  [0.9, -0.8], [-0.9, -0.8], [0.9, -2.6], [-0.9, -2.6]
];

(function(){
  var white = new THREE.Color(0xffffff);
  var m = new THREE.Matrix4();
  for(var i=0;i<LIFE_TAXI_N;i++){
    m.identity();
    lifeTaxiHullMesh.setMatrixAt(i, m);
    lifeTaxiHullMesh.setColorAt(i, new THREE.Color(TAXIC[i % TAXIC.length]));
  }
  lifeTaxiHullMesh.instanceColor.needsUpdate = true;
  for(var k=0;k<LIFE_TAXI_N*LIFE_TAXI_SEATS_N;k++) lifeTaxiPeopleMesh.setColorAt(k, white);
  lifeTaxiPeopleMesh.instanceColor.needsUpdate = true;
})();

var LIFE_TAXI_VISITS = LIFE_FERRY_STOPS.map(function(){ return 0; });

function lifeTaxiPickDest(fromIdx){
  var best = -1, bestQ = 0;
  for(var i=0;i<LIFE_FERRY_STOPS.length;i++){
    if(i === fromIdx) continue;
    var door = (typeof LIFE_DOOR_BY_STOPNAME !== 'undefined') ? LIFE_DOOR_BY_STOPNAME[LIFE_FERRY_STOPS[i].name] : null;
    var q = door ? (door.queueCount||0) : 0;
    if(q > bestQ){ bestQ = q; best = i; }
  }
  if(best >= 0) return best;
  var others = [];
  for(var j=0;j<LIFE_FERRY_STOPS.length;j++) if(j!==fromIdx) others.push(j);
  return others.length ? pick(others) : (fromIdx+1) % LIFE_FERRY_STOPS.length;
}
var LIFE_TAXIS = [];
(function(){
  reseed(783351);
  var n = LIFE_FERRY_STOPS.length;
  for(var i=0;i<LIFE_TAXI_N;i++){
    var dockIdx = Math.floor(rnd()*n);
    LIFE_TAXIS.push({ dockIdx:dockIdx, state:'docked', stateT: rr(0,4), dwell: rr(3,6),
      speed: rr(16,22), passengers: ri(4,8), curve:null });
  }
})();
window._taxis = LIFE_TAXIS;   /* diagnostic: full state, incl. each taxi's .curve */

var lifeTaxiTmpPos = new THREE.Vector3(), lifeTaxiTmpDir = new THREE.Vector3();
var lifeTaxiTmpQuat = new THREE.Quaternion(), lifeTaxiTmpMat = new THREE.Matrix4();
var lifeTaxiTmpScale1 = new THREE.Vector3(1,1,1), lifeTaxiTmpScale0 = new THREE.Vector3(0,0,0);
var lifeTaxiTmpPos2 = new THREE.Vector3();
function updateWaterTaxis(dt){
  LIFE_TAXIS.forEach(function(tx, ti){
    tx.stateT += dt;
    var pos, yaw;
    if(tx.state === 'docked'){
      var stop = LIFE_FERRY_STOPS[tx.dockIdx];
      pos = stop; yaw = stop.ry;
      if(tx.stateT >= tx.dwell){
        var destIdx = lifeTaxiPickDest(tx.dockIdx);
        var a = LIFE_FERRY_STOPS[tx.dockIdx], b = LIFE_FERRY_STOPS[destIdx];
        tx.curve = lifeNavBuildLeg(a.x, a.z, b.x, b.z);
        tx.len = tx.curve.getLength();
        tx.dur = Math.max(5, tx.len/tx.speed);
        tx.destIdx = destIdx;
        tx.state = 'transit'; tx.stateT = 0;
      }
    }else{
      var raw = Math.min(1, tx.stateT/tx.dur);
      var t = raw*raw*(3-2*raw);
      tx.curve.getPointAt(t, lifeTaxiTmpPos);
      pos = lifeTaxiTmpPos;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      tx.curve.getTangentAt(tTan, lifeTaxiTmpDir);
      yaw = Math.atan2(lifeTaxiTmpDir.x, lifeTaxiTmpDir.z);
      if(raw >= 1){
        tx.dockIdx = tx.destIdx;
        LIFE_TAXI_VISITS[tx.dockIdx]++;
        tx.state = 'docked'; tx.stateT = 0; tx.dwell = rr(3,6);
        tx.passengers = ri(4,8);   /* new fares board for the next crossing */
      }
    }
    lifeTaxiTmpPos2.set(pos.x, SEA-0.15, pos.z);
    lifeTaxiTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeTaxiTmpMat.compose(lifeTaxiTmpPos2, lifeTaxiTmpQuat, lifeTaxiTmpScale1);
    lifeTaxiHullMesh.setMatrixAt(ti, lifeTaxiTmpMat);
    if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_TAXI_BASE+ti, pos.x, SEA+2.6, pos.z);

    var baseIdx = ti*LIFE_TAXI_SEATS_N;
    var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    for(var s=0; s<LIFE_TAXI_SEATS_N; s++){
      var isCrew = s < LIFE_TAXI_CREW;
      var visible = isCrew || (s - LIFE_TAXI_CREW) < tx.passengers;
      if(visible){
        var seat = LIFE_TAXI_SEATS[s];
        var wx = pos.x + seat[0]*cosY + seat[1]*sinY;
        var wz = pos.z - seat[0]*sinY + seat[1]*cosY;
        lifeTaxiTmpPos2.set(wx, SEA+1.85, wz);
        lifeTaxiTmpMat.compose(lifeTaxiTmpPos2, lifeTaxiTmpQuat, lifeTaxiTmpScale1);
      }else{
        lifeTaxiTmpMat.compose(lifeTaxiTmpPos2.set(0,0,0), lifeTaxiTmpQuat, lifeTaxiTmpScale0);
      }
      lifeTaxiPeopleMesh.setMatrixAt(baseIdx+s, lifeTaxiTmpMat);
    }
  });
  lifeTaxiHullMesh.instanceMatrix.needsUpdate = true;
  lifeTaxiPeopleMesh.instanceMatrix.needsUpdate = true;
}
