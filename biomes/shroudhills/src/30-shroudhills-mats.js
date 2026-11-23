// ================================================================= SHROUDHILLS — library materials, wind hooks & 3D botanical/ant geometries [draw]
// Invoked via SHROUDHILLS.setupKit() once BIO.init() and BIO.kit('shroudhills') are active (54-shroudhills-trees.js).
// 100% of surfaces bind to genuine library textures packed in tex/ via materials.json (BIO.libSwap + KMAT PBR maps).
(function(){
 'use strict';

 SHROUDHILLS.setupKit = function(){
  if (SHROUDHILLS._kitReady) return;
  SHROUDHILLS._kitReady = true;

  var T3 = BIO.host.THREE;
  var fn = BIO.fn;
  var TAU = fn.TAU, clamp = fn.clamp, lerp = fn.lerp, fbm = fn.fbm;

  // ---- Procedural fallbacks (only used when running packless in openworld; replaced 100% by tex/ on station pages)
  var ATX = function(draw, fill){ return BIO.alphaTex(128, draw, fill || [92, 122, 68]); };
  var greyTex = function(lum, amp){
   return BIO.canvasTex(128, 128, function(g, w, h){
    var id = g.createImageData(w, h), d = id.data;
    for (var y = 0; y < h; y++) {
     for (var x = 0; x < w; x++) {
      var i = (y * w + x) * 4;
      var v = clamp(lum + amp * (fbm(x / 7, y / 7, lum, 2) - 0.5), 0, 255);
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
     }
    }
    g.putImageData(id, 0, 0);
   });
  };
  var discAlpha = function(lum){
   return ATX(function(g, S){
    g.fillStyle = BIO.tex.grey(lum);
    for (var k = 0; k < 7; k++) {
     var a = k / 7 * TAU, r = S * 0.24;
     g.beginPath();
     g.arc(S * 0.5 + Math.cos(a) * S * 0.16, S * 0.5 + Math.sin(a) * S * 0.16, r, 0, TAU);
     g.fill();
    }
   });
  };
  var frondAlpha = function(lum){
   return ATX(function(g, S){
    g.fillStyle = BIO.tex.grey(lum);
    g.beginPath();
    g.moveTo(S * 0.5, S * 0.96);
    g.quadraticCurveTo(S * 0.12, S * 0.52, S * 0.5, S * 0.05);
    g.quadraticCurveTo(S * 0.88, S * 0.52, S * 0.5, S * 0.96);
    g.fill();
   });
  };
  var hangAlpha = function(lum){
   return ATX(function(g, S){
    g.strokeStyle = BIO.tex.grey(lum);
    g.lineWidth = 4;
    for (var k = 0; k < 7; k++) {
     var x0 = S * (0.2 + k * 0.1);
     g.beginPath();
     g.moveTo(x0, S * 0.02);
     g.quadraticCurveTo(x0 + (k % 2 ? 8 : -8), S * 0.5, x0, S * 0.95);
     g.stroke();
    }
   });
  };

  // ---- Materials (library-swapped via BIO.libSwap + PBR normal/roughness maps for chitin, gall, amber)
  var leaf = function(tex, key, o){
   return BIO.leafMat(tex, key, Object.assign({ alphaTest: 0.42 }, o || {}));
  };

  var M = SHROUDHILLS.MAT = {
   mahogany: BIO.barkMat(greyTex(145, 55)),
   kauri: BIO.barkMat(greyTex(165, 50)),
   rata: BIO.barkMat(greyTex(140, 55)),
   fernbark: BIO.barkMat(greyTex(120, 60)),
   turf: BIO.solidMat(greyTex(150, 55)),
   tank: new T3.MeshLambertMaterial({ vertexColors: true, color: 0xffffff, map: greyTex(165, 45), side: T3.DoubleSide }),
   saltpeter: new T3.MeshLambertMaterial({ vertexColors: true, color: 0xffffff, map: greyTex(225, 30) }),
   shrub: BIO.solidMat(greyTex(155, 50)),
   amber: new T3.MeshStandardMaterial({ vertexColors: true, color: 0xffffff, map: greyTex(195, 40), roughness: 0.18, metalness: 0.04, emissive: 0x261402 }),
   gall: new T3.MeshStandardMaterial({ vertexColors: true, color: 0xffffff, map: greyTex(145, 55), roughness: 0.72, metalness: 0.02 }),
   chitin: new T3.MeshStandardMaterial({ vertexColors: true, color: 0xffffff, map: greyTex(130, 45), roughness: 0.22, metalness: 0.34 }),
   koheleaf: leaf(discAlpha(165), 'koheleaf', { swayA: 0.07 }),
   kaurileaf: leaf(discAlpha(160), 'kaurileaf', { swayA: 0.06 }),
   treefern: leaf(frondAlpha(160), 'treefern', { swayW: '(position.y)', swayA: 0.09 }),
   fern: leaf(frondAlpha(155), 'fern', { swayW: '(position.y)', swayA: 0.08 }),
   bromeliad: leaf(discAlpha(175), 'bromeliad', { swayA: 0.03 }),
   orchid: leaf(discAlpha(185), 'orchid', { swayW: '(position.y)', swayA: 0.08 }),
   heath: leaf(frondAlpha(165), 'heath', { swayW: '(position.y)', swayA: 0.06 }),
   sundew: leaf(hangAlpha(190), 'sundew', { swayW: '(-position.y)', swayA: 0.24, axis: 1 }),
   mosshang: leaf(hangAlpha(160), 'mosshang', { swayW: '(-position.y)', swayA: 0.14, axis: 1 }),
   myrtle: leaf(discAlpha(170), 'myrtle', { swayW: '(position.y)', swayA: 0.06 })
  };

  M.tank.userData.bio = { kind: 'solid' };
  M.saltpeter.userData.bio = { kind: 'solid' };
  M.amber.userData.bio = { kind: 'solid' };
  M.gall.userData.bio = { kind: 'solid' };
  M.chitin.userData.bio = { kind: 'solid' };

  SHROUDHILLS.LIB = BIO.libSwap('shroudhills', M);

  // Attach full PBR normal & roughness maps to amber, gall, and Shroud-Ant chitin when packed library is active
  if (typeof KMAT !== 'undefined' && KMAT.mode === 'lib' && KMAT.packed) {
   ['amber', 'gall', 'chitin'].forEach(function(slot){
    var P = KMAT.packed('shroudhills', slot);
    if (!P) return;
    var tx = KMAT.textures(P, { aniso: 8 });
    var m = M[slot];
    if (tx.map) { tx.map.wrapS = tx.map.wrapT = T3.RepeatWrapping; m.map = tx.map; }
    if (tx.normalMap) { tx.normalMap.wrapS = tx.normalMap.wrapT = T3.RepeatWrapping; m.normalMap = tx.normalMap; }
    if (tx.roughnessMap) { tx.roughnessMap.wrapS = tx.roughnessMap.wrapT = T3.RepeatWrapping; m.roughnessMap = tx.roughnessMap; }
    m.needsUpdate = true;
   });
   ['tank', 'saltpeter', 'shrub', 'turf'].forEach(function(slot){
    var m = M[slot];
    if (m && m.map) {
     m.map.wrapS = m.map.wrapT = T3.RepeatWrapping;
     if (m.userData.libScale) m.map.repeat.set(1 / m.userData.libScale[0], 1 / m.userData.libScale[1]);
    }
   });
  }

  // Subtle living antenna/leg alertness tremor on Shroud-Ant chitin hooked cleanly to BIO.WIND.t (no cameraPosition)
  if (BIO.WIND && BIO.WIND.t) {
   if (BIO._tickWind) BIO._tickWind();
   M.chitin.onBeforeCompile = function(sh){
    sh.uniforms.uAntTime = BIO.WIND.t;
    sh.vertexShader = sh.vertexShader
     .replace('#include <common>', '#include <common>\nuniform float uAntTime;')
     .replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat antTip=smoothstep(0.28,0.55,abs(position.z))+smoothstep(0.22,0.42,abs(position.x));transformed.x+=sin(uAntTime*5.4+position.z*14.0)*0.009*antTip;transformed.y+=cos(uAntTime*6.2+position.x*16.0)*0.006*antTip;');
   };
   M.chitin.customProgramCacheKey = function(){ return 'shroudhills-ant-chitin-v1'; };
  }

  // ---- Geometry builders (all outward-normalled, vertex-shaded)
  var G = SHROUDHILLS.G = {};

  var mergeParts = function(parts){
   var pos = [], nor = [], uv = [], col = [];
   for (var p = 0; p < parts.length; p++) {
    var g0 = parts[p][0];
    var g = g0.index ? g0.toNonIndexed() : g0;
    var a = g.attributes.position.array;
    var b = g.attributes.normal.array;
    var u = g.attributes.uv ? g.attributes.uv.array : null;
    var shade = parts[p][1];
    var n = a.length / 3;
    for (var i = 0; i < n; i++) {
     var vx = a[i * 3], vy = a[i * 3 + 1], vz = a[i * 3 + 2];
     pos.push(vx, vy, vz);
     nor.push(b[i * 3], b[i * 3 + 1], b[i * 3 + 2]);
     uv.push(u ? u[i * 2] : vx * 0.6 + 0.5, u ? u[i * 2 + 1] : vy * 0.6 + 0.5);
     var cv = typeof shade === 'function' ? shade(vx, vy, vz) : (shade == null ? [1, 1, 1] : typeof shade === 'number' ? [shade, shade, shade] : shade);
     col.push(cv[0], cv[1], cv[2]);
    }
   }
   return BIO.geo._make(pos, nor, uv, col);
  };

  var rodGeo = function(a, b, r0, r1, seg){
   var dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
   var L = Math.hypot(dx, dy, dz) || 1e-4;
   var g = new T3.CylinderGeometry(r1, r0, L, seg == null ? 6 : seg, 1, false);
   g.translate(0, L * 0.5, 0);
   var q = new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0, 1, 0), new T3.Vector3(dx / L, dy / L, dz / L));
   g.applyMatrix4(new T3.Matrix4().makeRotationFromQuaternion(q));
   g.translate(a[0], a[1], a[2]);
   return g;
  };

  // Crossed crown clump (3 angled cards, UV 0..1 unflipped, compatible with centered single-plant or celled cards)
  G.crownClump = function(tilt){
   var pos = [], uv = [], nor = [], tl = tilt == null ? 0.35 : tilt;
   for (var k = 0; k < 3; k++) {
    var a = k * TAU / 3 + 0.25, ca = Math.cos(a), sa = Math.sin(a);
    var q = new T3.PlaneGeometry(1, 1, 1, 1);
    q.rotateX(tl * (k % 2 ? 1 : -0.8));
    q.rotateY(a);
    var gp = q.index ? q.toNonIndexed() : q;
    var pa = gp.attributes.position.array, na = gp.attributes.normal.array, ua = gp.attributes.uv.array;
    for (var i = 0; i < pa.length / 3; i++) {
     pos.push(pa[i * 3], pa[i * 3 + 1], pa[i * 3 + 2]);
     nor.push(na[i * 3] * 0.4 + ca * 0.2, Math.abs(na[i * 3 + 1]) * 0.8 + 0.2, na[i * 3 + 2] * 0.4 + sa * 0.2);
     uv.push(ua[i * 2], 1 - ua[i * 2 + 1]);
    }
   }
   return BIO.geo._make(pos, nor, uv);
  };

  // Upright 3-card tuft (origin at foot y = 0, top at y = 1, v = 1 at bottom, v = 0 at top)
  G.tuft = function(){
   var pos = [], uv = [], nor = [];
   for (var k = 0; k < 3; k++) {
    var a = k * Math.PI / 3 + 0.18, c = Math.cos(a), s = Math.sin(a);
    var P = [[-0.5 * c, 0, -0.5 * s, 0, 1], [0.5 * c, 0, 0.5 * s, 1, 1], [0.5 * c, 1, 0.5 * s, 1, 0], [-0.5 * c, 1, -0.5 * s, 0, 0]];
    [0, 1, 2, 0, 2, 3].forEach(function(i){
     pos.push(P[i][0], P[i][1], P[i][2]);
     uv.push(P[i][3], P[i][4]);
     nor.push(-s, 0.25, c);
    });
   }
   return BIO.geo._make(pos, nor, uv);
  };

  // Arching tree-fern / ground-fern frond (origin at stem foot 0,0,0, extending along +z and arching gracefully)
  G.archFrond = function(arch, droop){
   var n = 5, pos = [], uv = [], nor = [], P = [];
   var ar = arch == null ? 0.34 : arch, dr = droop == null ? 0.22 : droop;
   for (var i = 0; i <= n; i++) {
    var t = i / n;
    var w = 0.44 * Math.sin(Math.pow(t, 0.65) * Math.PI * 0.94 + 0.08);
    var y = ar * Math.sin(t * Math.PI * 0.78) - dr * t * t;
    var z = t;
    P.push([-w, y, z, 0, 1 - t], [w, y, z, 1, 1 - t]);
   }
   for (var j = 0; j < n; j++) {
    var a = P[2 * j], b = P[2 * j + 1], c = P[2 * j + 2], d = P[2 * j + 3];
    [a, b, c, b, d, c].forEach(function(q){
     pos.push(q[0], q[1], q[2]);
     uv.push(q[3], q[4]);
     nor.push(0, 1, 0.15);
    });
   }
   return BIO.geo._make(pos, nor, uv);
  };

  // Hanging streamer for Silver Mist-Sundew Curtains & cloud-moss beards (origin at top y = 0, hangs to y = -1)
  G.streamer = function(n, taper, twist){
   var pos = [], uv = [], nor = [], P = [];
   for (var i = 0; i <= n; i++) {
    var t = i / n, w = 0.5 * lerp(1, taper, t), a = t * twist, c = Math.cos(a), s = Math.sin(a);
    var zOff = Math.sin(t * 2.4) * 0.05;
    P.push([-w * c, -t, -w * s + zOff, 0, t], [w * c, -t, w * s + zOff, 1, t]);
   }
   for (var j = 0; j < n; j++) {
    var p0 = P[2 * j], p1 = P[2 * j + 1], p2 = P[2 * j + 2], p3 = P[2 * j + 3];
    [p0, p2, p1, p1, p2, p3].forEach(function(q){
     pos.push(q[0], q[1], q[2]);
     uv.push(q[3], q[4]);
     nor.push(0, 0.15, 1);
    });
   }
   return BIO.geo._make(pos, nor, uv);
  };

  // ---- Twist A: Paired Sister-Cup Cistern (unit scale = 1 m cupR; two symmetrical fused rosette bowls along X: -1.08 & +1.08)
  G.sisterCups = function(seed){
   var st = KRAND.stream(seed >>> 0), parts = [];
   [-1, 1].forEach(function(side){
    var cx = side * 1.06;
    // Closed watertight inner cistern cup shell
    var lathePts = [
     new T3.Vector2(0.0, 0.06),
     new T3.Vector2(0.46, 0.08),
     new T3.Vector2(0.76, 0.28),
     new T3.Vector2(0.92, 0.64),
     new T3.Vector2(0.98, 0.84),
     new T3.Vector2(0.84, 0.86),
     new T3.Vector2(0.68, 0.34),
     new T3.Vector2(0.0, 0.16)
    ];
    var cup = new T3.LatheGeometry(lathePts, 14);
    cup.translate(cx, 0, 0);
    parts.push([cup, function(vx, vy){
     var k = clamp(0.48 + vy * 0.58, 0.38, 1.05);
     return [k * 0.88, k, k * 0.62];
    }]);

    // 14 spiral channeled tank leaves flaring around each mirror rosette
    for (var l = 0; l < 14; l++) {
     var tier = l < 7 ? 0 : 1;
     var ang = (l % 7) / 7 * TAU + tier * 0.45 + side * 0.18;
     var reach = tier === 0 ? 1.45 + st.next() * 0.22 : 1.15 + st.next() * 0.18;
     var pitch = tier === 0 ? 0.52 : 0.88;
     var blade = new T3.BoxGeometry(0.36, 0.055, reach, 2, 1, 3);
     var bp = blade.attributes.position;
     for (var bi = 0; bi < bp.count; bi++) {
      var bz = bp.getZ(bi) + reach * 0.5;
      var bt = clamp(bz / reach, 0, 1);
      var bx = bp.getX(bi) * (1.0 - 0.68 * bt * bt);
      var gutter = Math.abs(bx) * 0.32 * (1 - bt * 0.5) - bt * bt * (tier === 0 ? 0.36 : 0.16);
      bp.setX(bi, bx);
      bp.setY(bi, bp.getY(bi) * (1 - 0.5 * bt) + gutter);
      bp.setZ(bi, bz);
     }
     blade.computeVertexNormals();
     blade.rotateX(-pitch);
     blade.rotateY(-ang);
     blade.translate(cx + Math.cos(ang) * 0.52, 0.26 + tier * 0.16, Math.sin(ang) * 0.52);
     var flushCrimson = tier === 0 && (l % 2 === 0);
     parts.push([blade, function(vx, vy){
      var u = clamp((vy - 0.1) / 0.9, 0, 1);
      return flushCrimson ? [0.95 + 0.15 * u, 0.45 + 0.25 * u, 0.34] : [0.68 + 0.28 * u, 0.86 + 0.14 * u, 0.42];
     }]);
    }
   });

   // Central fused Sister-Weir saddle channel connecting the two twin cups
   var weir = new T3.BoxGeometry(0.76, 0.36, 0.62, 2, 1, 2);
   weir.translate(0, 0.46, 0);
   parts.push([weir, [0.78, 0.72, 0.42]]);
   var basePad = new T3.CylinderGeometry(0.95, 0.68, 0.28, 10, 1, false);
   basePad.scale(1.65, 1, 0.92);
   basePad.translate(0, 0.08, 0);
   parts.push([basePad, [0.46, 0.42, 0.28]]);
   return mergeParts(parts);
  };

  // ---- Weeping Amber-Resin Stalactite cluster (unit height = 1 m, hangs down from y = 0 to y = -1)
  G.amberStalactite = function(seed){
   var st = KRAND.stream(seed >>> 0), parts = [];
   var n = 4 + Math.floor(st.next() * 3);
   for (var k = 0; k < n; k++) {
    var a = k / n * TAU + st.next() * 0.5;
    var rad = k === 0 ? 0 : 0.08 + st.next() * 0.14;
    var len = k === 0 ? 1.0 : 0.48 + st.next() * 0.45;
    var rTop = k === 0 ? 0.13 : 0.065 + st.next() * 0.04;
    var pts = [
     new T3.Vector2(0.0, -len),
     new T3.Vector2(rTop * 0.42, -len * 0.88),
     new T3.Vector2(rTop * 0.62, -len * 0.52),
     new T3.Vector2(rTop * 0.88, -len * 0.18),
     new T3.Vector2(rTop, 0.02),
     new T3.Vector2(0.0, 0.06)
    ];
    var ic = new T3.LatheGeometry(pts, 8);
    ic.translate(Math.cos(a) * rad, 0, Math.sin(a) * rad);
    parts.push([ic, function(vx, vy){
     var glow = clamp(0.75 + (vy + 1.0) * 0.3, 0.65, 1.12);
     return [glow, glow * 0.84, glow * 0.38];
    }]);
   }
   return mergeParts(parts);
  };

  // ---- Twist C: Chambered Myrmecophyte Drum-Gall (unit scale ~ 1 m diameter, ribbed woody chambered tuber with ostiole slits)
  G.drumGall = function(seed){
   var st = KRAND.stream(seed >>> 0), parts = [];
   var lathePts = [];
   for (var j = 0; j <= 12; j++) {
    var t = j / 12;
    var r = Math.sin(Math.pow(t, 0.82) * Math.PI) * (0.52 + 0.08 * Math.sin(t * Math.PI * 3));
    lathePts.push(new T3.Vector2(j === 0 || j === 12 ? 0.0 : Math.max(0.04, r), t - 0.5));
   }
   var body = new T3.LatheGeometry(lathePts, 18);
   var bp = body.attributes.position;
   var ribs = 9 + Math.floor(st.next() * 4);
   for (var i = 0; i < bp.count; i++) {
    var vx = bp.getX(i), vy = bp.getY(i), vz = bp.getZ(i);
    var rr = Math.hypot(vx, vz);
    if (rr > 0.02) {
     var ang = Math.atan2(vz, vx);
     var rib = 1.0 + 0.11 * Math.cos(ang * ribs) + 0.05 * Math.sin(vy * 14 + ang * 3);
     bp.setX(i, vx * rib);
     bp.setZ(i, vz * rib);
    }
   }
   body.computeVertexNormals();
   parts.push([body, function(vx, vy, vz){
    var k = clamp(0.66 + (vy + 0.5) * 0.42, 0.5, 1.06);
    return [k, k * 0.84, k * 0.72];
   }]);

   // Dark acoustic slit-drum ostiole lips around the resonance dome
   for (var s = 0; s < 5; s++) {
    var sa = -0.9 + s * 0.45 + (st.next() - 0.5) * 0.12;
    var sy = -0.14 + (s % 2) * 0.22;
    var lip = new T3.TorusGeometry(0.095, 0.028, 6, 10);
    lip.scale(0.55, 1.45, 0.8);
    lip.rotateY(-sa + Math.PI * 0.5);
    lip.translate(Math.cos(sa) * 0.49, sy, Math.sin(sa) * 0.49);
    parts.push([lip, [0.34, 0.2, 0.14]]);
    var throat = new T3.BoxGeometry(0.05, 0.18, 0.06);
    throat.rotateY(-sa);
    throat.translate(Math.cos(sa) * 0.47, sy, Math.sin(sa) * 0.47);
    parts.push([throat, [0.12, 0.08, 0.06]]);
   }
   return mergeParts(parts);
  };

  // Basal white saltpeter (potassium nitrate) mineralized crust apron below Drum-Galls
  G.nitrateCrust = function(seed){
   var st = KRAND.stream(seed >>> 0), parts = [];
   for (var k = 0; k < 7; k++) {
    var xOff = (k - 3) * 0.14;
    var h = 0.42 + (1 - Math.abs(k - 3) / 3.5) * 0.55 + st.next() * 0.18;
    var r0 = 0.07 + st.next() * 0.04;
    var drip = rodGeo([xOff, 0.35, 0.02], [xOff + (st.next() - 0.5) * 0.05, 0.35 - h, 0.05], r0, r0 * 0.32, 6);
    parts.push([drip, [0.96, 0.95, 0.9]]);
   }
   var shelf = new T3.SphereGeometry(0.38, 10, 6);
   shelf.scale(1.35, 0.42, 0.55);
   shelf.translate(0, 0.32, 0.02);
   parts.push([shelf, [0.98, 0.97, 0.93]]);
   return mergeParts(parts);
  };

  // ---- Twist C: Cat-Sized Eusocial Shroud-Ant (Khroma-Mira, unit length = 1 m; scaled 0.30-0.42 m in world!)
  // Anatomically distinct head + serrated mandibles + elbowed antennae + pronotum/mesosoma + petiole + ribbed gaster + 6 jointed legs
  G.shroudAnt = function(soldier){
   var parts = [];
   var headScale = soldier ? 1.38 : 1.0;

   // Gaster (rear abdomen, z = -0.44..-0.10)
   var gaster = new T3.SphereGeometry(0.16, 10, 8);
   gaster.scale(0.95, 0.88, 1.38);
   gaster.translate(0, 0.19, -0.30);
   parts.push([gaster, function(vx, vy, vz){
    var band = 0.82 + 0.18 * Math.cos(vz * 42.0);
    return [band * 1.05, band * 0.86, band * 0.68];
   }]);

   // Petiole waist node (z = -0.09)
   var pet = new T3.SphereGeometry(0.055, 7, 6);
   pet.scale(0.9, 1.05, 1.1);
   pet.translate(0, 0.17, -0.08);
   parts.push([pet, [0.78, 0.64, 0.5]]);

   // Mesosoma / thorax (z = -0.02..+0.22)
   var thorax = new T3.SphereGeometry(0.115, 9, 7);
   thorax.scale(0.88, 0.92, 1.48);
   thorax.translate(0, 0.20, 0.09);
   parts.push([thorax, [0.94, 0.78, 0.6]]);

   // Cordate head (z = +0.24..+0.42)
   var head = new T3.SphereGeometry(0.115 * headScale, 9, 7);
   head.scale(1.06, 0.88, 1.08);
   head.translate(0, 0.22, 0.31);
   parts.push([head, [1.06, 0.84, 0.62]]);

   // Compound eyes
   [-1, 1].forEach(function(sd){
    var eye = new T3.SphereGeometry(0.032 * headScale, 6, 5);
    eye.translate(sd * 0.095 * headScale, 0.24, 0.34);
    parts.push([eye, [0.35, 0.32, 0.3]]);
   });

   // Heavy serrated mandibles (larger & flared on 40 cm Drum-Rattle soldiers)
   [-1, 1].forEach(function(sd){
    var mLen = soldier ? 0.16 : 0.095;
    var j0 = [sd * 0.065 * headScale, 0.19, 0.39];
    var j1 = [sd * 0.085 * headScale, 0.17, 0.39 + mLen * 0.58];
    var j2 = [sd * 0.018 * headScale, 0.165, 0.39 + mLen];
    parts.push([rodGeo(j0, j1, 0.028 * headScale, 0.022 * headScale, 5), [1.12, 0.82, 0.52]]);
    parts.push([rodGeo(j1, j2, 0.022 * headScale, 0.008 * headScale, 5), [1.18, 0.86, 0.54]]);
   });

   // Elbowed antennae (scape + funiculus)
   [-1, 1].forEach(function(sd){
    var a0 = [sd * 0.045 * headScale, 0.25, 0.38];
    var a1 = [sd * 0.16, 0.34, 0.47];
    var a2 = [sd * 0.22, 0.29, 0.58];
    parts.push([rodGeo(a0, a1, 0.012, 0.01, 4), [0.95, 0.78, 0.58]]);
    parts.push([rodGeo(a1, a2, 0.01, 0.006, 4), [1.02, 0.84, 0.62]]);
   });

   // Six jointed legs (coxa-femur rising to knee, tibia-tarsus planted cleanly at y = 0)
   var legZ = [0.18, 0.08, -0.02];
   var legSpread = [0.24, 0.29, 0.27];
   var legReachZ = [0.30, 0.06, -0.24];
   for (var li = 0; li < 3; li++) {
    [-1, 1].forEach(function(sd){
     var hip = [sd * 0.075, 0.16, legZ[li]];
     var knee = [sd * legSpread[li] * 0.78, 0.27 - li * 0.015, (legZ[li] + legReachZ[li]) * 0.5];
     var foot = [sd * legSpread[li], 0.0, legReachZ[li]];
     parts.push([rodGeo(hip, knee, 0.021, 0.016, 5), [0.88, 0.72, 0.54]]);
     parts.push([rodGeo(knee, foot, 0.016, 0.009, 5), [0.82, 0.66, 0.5]]);
    });
   }
   return mergeParts(parts);
  };

  // ---- Twist E: Lithophyte Cloak-Tor 3D rosette mat cushion
  G.torMat = function(seed){
   var st = KRAND.stream(seed >>> 0), parts = [];
   for (var k = 0; k < 5; k++) {
    var a = k / 5 * TAU + st.next() * 0.4;
    var d = k === 0 ? 0 : 0.22 + st.next() * 0.14;
    var r = k === 0 ? 0.26 : 0.17 + st.next() * 0.06;
    var dome = new T3.SphereGeometry(r, 8, 5, 0, TAU, 0, Math.PI * 0.58);
    dome.scale(1.15, 0.62, 1.15);
    dome.translate(Math.cos(a) * d, 0.02, Math.sin(a) * d);
    parts.push([dome, function(vx, vy){
     var tip = clamp(0.68 + vy * 1.6, 0.62, 1.12);
     return [tip, tip * 0.92, tip * 0.88];
    }]);
   }
   return mergeParts(parts);
  };

  G.lobe = BIO.geo.lobe();

  // ---- Merged mesh buckets (host trees, amber stalactites, Root-Hammock cables & suspended peat turf)
  BIO.bucket('mahogany', M.mahogany, { uvScale: [3, 5], label: 'Buttressed Shroud-Mahogany bark' });
  BIO.bucket('kauri', M.kauri, { uvScale: [3, 5], label: 'Weeping Amber-Podocarp bark' });
  BIO.bucket('rata', M.rata, { uvScale: [2.4, 4], label: 'Grafted Bridge-Rata aerial root cables' });
  BIO.bucket('fernbark', M.fernbark, { uvScale: [2.6, 4.5], label: 'Ironstone Ravine Tree-Fern trunk' });
  BIO.bucket('turf', M.turf, { uvScale: [2, 2], label: 'Suspended Canopy Peat Sky-Turf' });

  // ---- Instanced BIO.def items (every item mapped cleanly to its canonical species & tags)
  var IT = function(name, geo, mat, label, speciesKey, extra){
   var sp = SHROUDHILLS.byKey[speciesKey];
   var baseTags = sp ? { species: speciesKey } : null;
   return BIO.def(name, geo, mat, Object.assign({
    label: label,
    indexed: true,
    tags: baseTags
   }, extra || {}));
  };

  var KS = KRAND.child(BIO.host.seed >>> 0, 'shroudhills-geos');

  IT('kohe_clump', G.crownClump(0.36), M.koheleaf, 'Buttressed Shroud-Mahogany crown foliage', 'shroud_kohekohe', { attrs: ['aN'] });
  IT('kauri_clump', BIO.geo.clump(), M.kaurileaf, 'Weeping Amber-Podocarp foliage', 'shroud_amber_kauri', { attrs: ['aN'] });
  IT('amber_drip0', G.amberStalactite(KRAND.hash(KS, 1, 0)), M.amber, 'Weeping Amber-Podocarp resin stalactites (amber = 120)', 'shroud_amber_kauri');
  IT('amber_drip1', G.amberStalactite(KRAND.hash(KS, 1, 1)), M.amber, 'Weeping Amber-Podocarp resin stalactites (amber = 120)', 'shroud_amber_kauri');

  IT('treefern_frond', G.archFrond(0.34, 0.24), M.treefern, 'Ironstone Ravine Tree-Fern frond', 'shroud_tree_fern');
  IT('ravine_fern', G.archFrond(0.26, 0.16), M.fern, 'Ravine understorey fern', 'shroud_tree_fern');

  IT('sister_cups0', G.sisterCups(KRAND.hash(KS, 2, 0)), M.tank, 'Paired Sister-Cup Cistern Sky-Pond', 'shroud_sister_cups');
  IT('sister_cups1', G.sisterCups(KRAND.hash(KS, 2, 1)), M.tank, 'Paired Sister-Cup Cistern Sky-Pond', 'shroud_sister_cups');
  IT('sister_bract', G.crownClump(0.45), M.bromeliad, 'Sister-Cup crimson outer bracts', 'shroud_sister_cups');
  IT('sister_drip', G.streamer(4, 0.35, 0.3), M.sundew, 'Sister-Cup overflow rainwater ribbon', 'shroud_sister_cups');

  IT('turf_pad', G.lobe, M.turf, 'Suspended 50 cm Canopy Peat Turf cushion', 'shroud_rata_bridge');
  IT('sky_orchid', G.tuft(), M.orchid, 'Crimson Sky-Orchid on Root-Hammock turf', 'shroud_rata_bridge');
  IT('sky_heath', G.tuft(), M.heath, 'Canopy Berry-Heath on Root-Hammock turf', 'shroud_rata_bridge');
  IT('moss_curtain', G.streamer(5, 0.45, 0.4), M.mosshang, 'Dripping cloud-moss curtain', 'shroud_rata_bridge');

  IT('drum_gall0', G.drumGall(KRAND.hash(KS, 3, 0)), M.gall, 'Myrmecophyte Drum-Gall (chambered Shroud-Ant tuber)', 'shroud_drum_gall');
  IT('drum_gall1', G.drumGall(KRAND.hash(KS, 3, 1)), M.gall, 'Myrmecophyte Drum-Gall (chambered Shroud-Ant tuber)', 'shroud_drum_gall');
  IT('saltpeter_crust', G.nitrateCrust(KRAND.hash(KS, 4, 0)), M.saltpeter, 'Mineralized saltpeter nitrate crust below Drum-Gall', 'shroud_drum_gall');
  IT('shroud_ant_worker', G.shroudAnt(false), M.chitin, 'Cat-sized Shroud-Ant worker (Khroma-Mira, 32 cm)', 'shroud_drum_gall');
  IT('shroud_ant_soldier', G.shroudAnt(true), M.chitin, 'Heavy-mandibled Shroud-Ant drum-soldier (Khroma-Mira, 40 cm)', 'shroud_drum_gall');

  IT('myrtle_lobe', G.lobe, M.shrub, 'Calming Smudge-Myrtle trail shrub', 'shroud_myrtle_smudge');
  IT('myrtle_sprig', G.tuft(), M.myrtle, 'Calming Smudge-Myrtle aromatic flower sprigs', 'shroud_myrtle_smudge');

  IT('tor_cloak_mat', G.torMat(KRAND.hash(KS, 5, 0)), M.shrub, 'Lithophyte Tor-Cloak cushion mat', 'shroud_cloak_bromeliad', { cliff: true });
  IT('tor_bromeliad', G.crownClump(0.42), M.bromeliad, 'Scarlet and Saffron Tor-Cloak bromeliad rosette', 'shroud_cloak_bromeliad', { cliff: true });
  IT('tor_silver_orchid', G.tuft(), M.orchid, 'Silver-velvet Tor-Cloak cushion orchid', 'shroud_cloak_bromeliad', { cliff: true });
  IT('dew_strand', G.streamer(5, 0.38, 0.55), M.sundew, 'Silver Mist-Sundew carnivorous squall-curtain', 'shroud_dew_strand', { cliff: true });

  var ITEM_MAP = {
   kohe_clump: 'shroud_kohekohe',
   imp_trees: 'shroud_kohekohe',
   kauri_clump: 'shroud_amber_kauri',
   amber_drip0: 'shroud_amber_kauri',
   amber_drip1: 'shroud_amber_kauri',
   treefern_frond: 'shroud_tree_fern',
   ravine_fern: 'shroud_tree_fern',
   sister_cups0: 'shroud_sister_cups',
   sister_cups1: 'shroud_sister_cups',
   sister_bract: 'shroud_sister_cups',
   sister_drip: 'shroud_sister_cups',
   turf_pad: 'shroud_rata_bridge',
   sky_orchid: 'shroud_rata_bridge',
   sky_heath: 'shroud_rata_bridge',
   moss_curtain: 'shroud_rata_bridge',
   drum_gall0: 'shroud_drum_gall',
   drum_gall1: 'shroud_drum_gall',
   saltpeter_crust: 'shroud_drum_gall',
   shroud_ant_worker: 'shroud_drum_gall',
   shroud_ant_soldier: 'shroud_drum_gall',
   myrtle_lobe: 'shroud_myrtle_smudge',
   myrtle_sprig: 'shroud_myrtle_smudge',
   tor_cloak_mat: 'shroud_cloak_bromeliad',
   tor_bromeliad: 'shroud_cloak_bromeliad',
   tor_silver_orchid: 'shroud_cloak_bromeliad',
   dew_strand: 'shroud_dew_strand'
  };
  SHROUDHILLS.speciesOfItem = function(it){ return SHROUDHILLS.byKey[ITEM_MAP[it]] || null; };
 };
})();
