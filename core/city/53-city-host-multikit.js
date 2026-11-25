/* ============================== 8b. HOST: LAZY MULTI-KIT INSTANCER, TEXTURE2DARRAY ATLAS & 3-RING HLOD ============================== */
/* [web] Phase 3 of MULTI-KIT-SCOPE.md (Rulings #99-101): promotes settlements/isle-demo 58-isle-protos.js,
   openworld/isle-demo 88a-world-atlas.js and 88t-world-towns.js into core/city so any settlement draws 1..28 cultural
   building kits simultaneously without page-size bloat or VRAM explosion:
     KCITY.flattenProto(group, opt)           flattens any kit's proto() Group into [{geo, mat, tris}], preserving
                                                InstancedMesh instanceColor, world-unit UVs (uvK) and port shader guards
     KCITY.createSharedAtlas(opt)             512 px WebGL2 DataTexture2DArray (alb, nor, rgh) deduplicated across kits
                                                by canonical core/materials/library/<setId> key, capped at maxVramMB (350)
     KCITY.bakeProxy(parts, step)             vertex-clustered flat-shaded HLOD proxy mesh for mid-distance rings
     KCITY.boundedInstanced(im)               per-InstancedMesh world bounding sphere sharing prototype attribute buffers
     KCITY.hostMultikit.createBrowserLoader   lazy script-tag sidecar loader (<pack>.tex.js once per pack + <kitId>.bundle.js)
     KCITY.hostMultikit.create(opt)           3-ring HLOD host (FULL atlas, MID baked, FAR massing + KCITY.constructMesh
                                                triangle-by-triangle construction) with hlodCheck() exact-once audit */
(function () {
  'use strict';
  var K = (typeof KCITY !== 'undefined') ? KCITY : (typeof window !== 'undefined' ? (window.KCITY = window.KCITY || {}) : {});

  /* KRATOR_KITS: a global, or on the window of the closure a settlement seals core/kits and core/city in (2026-11-24, Stage 8 D8) */
  function kitsOf() {
    if (typeof KRATOR_KITS !== 'undefined') return KRATOR_KITS;
    return (typeof window !== 'undefined' && window.KRATOR_KITS) || null;
  }

  function denormScale(attr) {
    if (!attr || !attr.normalized) return 1;
    var r = attr.array;
    if (r instanceof Uint8Array || r instanceof Uint8ClampedArray) return 1 / 255;
    if (r instanceof Uint16Array) return 1 / 65535;
    if (r instanceof Int8Array) return 1 / 127;
    if (r instanceof Int16Array) return 1 / 32767;
    return 1;
  }

  function guardPortMats(G) {
    G.traverse(function (o) {
      var m = o.isMesh && o.material;
      if (!m || Array.isArray(m) || m.userData.kratorPlainPort) return;
      m.userData.kratorPlainPort = true;
      var hook = m.onBeforeCompile, key = m.customProgramCacheKey, src = String(hook);
      if (!hook) return;
      m.onBeforeCompile = function (sh, r) {
        hook.call(this, sh, r);
        sh.vertexShader = sh.vertexShader.replace(/\bUSE_INSTANCING\b/g, 'KRATOR_PORT_PLAIN');
        sh.fragmentShader = sh.fragmentShader.replace(/\bUSE_INSTANCING\b/g, 'KRATOR_PORT_PLAIN');
      };
      m.customProgramCacheKey = function () { return 'krator-port|' + src + '|' + (key ? key.call(m) : ''); };
      m.needsUpdate = true;
    });
  }

  function stampMatPack(G, pack) {
    if (!pack) return;
    G.traverse(function (o) {
      var m = o.isMesh && o.material;
      if (m && !Array.isArray(m) && m.userData.kratorPack == null) {
        m.userData.kratorPack = pack;
        if (m.userData.islePack == null) m.userData.islePack = pack;
      }
    });
  }

  /* Flatten any kit's THREE.Group prototype into one indexed BufferGeometry per distinct material */
  K.flattenProto = function (G, opt) {
    opt = opt || {};
    if (!G) return null;
    if (G.userData && G.userData.port) guardPortMats(G);
    if (opt.pack) stampMatPack(G, opt.pack);
    G.updateMatrixWorld(true);
    var groups = {}, IM = new THREE.Matrix4(), IC = new THREE.Color();
    G.traverse(function (o) {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      if (o.visible === false) return;
      var mats = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!mats) return;
      var g = o.geometry;
      var attrSig = Object.keys(g.attributes).filter(function (n) { return n !== 'color'; }).sort().join(',');
      var sig = mats.uuid + '|' + attrSig;
      var list = groups[sig] || (groups[sig] = { mat: mats, parts: [] });
      if (o.isInstancedMesh) {
        for (var i = 0; i < o.count; i++) {
          o.getMatrixAt(i, IM);
          var ic = null;
          if (o.instanceColor) { o.getColorAt(i, IC); ic = [IC.r, IC.g, IC.b]; }
          var e = IM.elements;
          var ws = (mats.userData && mats.userData.uvK) ? [Math.hypot(e[0], e[1], e[2]), Math.hypot(e[4], e[5], e[6]), Math.hypot(e[8], e[9], e[10])] : null;
          list.parts.push({ g: g, m: new THREE.Matrix4().multiplyMatrices(o.matrixWorld, IM), ic: ic, ws: ws });
        }
      } else {
        var wsPlain = (mats.userData && mats.userData.uvK) ? (1 / mats.userData.uvK) : null;
        list.parts.push({ g: g, m: o.matrixWorld.clone(), ic: null, ws: wsPlain });
      }
    });

    var out = [], totalTris = 0;
    Object.keys(groups).forEach(function (s) {
      var Q = groups[s], g0 = Q.parts[0].g;
      var names = Object.keys(g0.attributes).filter(function (n) { return n !== 'color'; }).concat(['color']);
      var total = 0, itotal = 0;
      Q.parts.forEach(function (p) {
        total += p.g.attributes.position.count;
        itotal += p.g.index ? p.g.index.count : p.g.attributes.position.count;
      });
      if (!total || !itotal) return;
      var size = function (nm) { return nm === 'color' ? 3 : g0.attributes[nm].itemSize; };
      var A = {};
      names.forEach(function (nm) { A[nm] = new Float32Array(total * size(nm)); });
      var I = total > 65535 ? new Uint32Array(itotal) : new Uint16Array(itotal);
      var vo = 0, io = 0, v3 = new THREE.Vector3(), nm3 = new THREE.Matrix3();
      Q.parts.forEach(function (p) {
        var g = p.g, cnt = g.attributes.position.count, ic = p.ic || [1, 1, 1];
        nm3.getNormalMatrix(p.m);
        names.forEach(function (nm) {
          var src = g.attributes[nm], dst = A[nm];
          if (nm === 'color') {
            var csc = src ? denormScale(src) : 1, csz = src ? src.itemSize : 0;
            for (var ci = 0; ci < cnt; ci++) {
              for (var cc = 0; cc < 3; cc++) {
                dst[(vo + ci) * 3 + cc] = (src ? src.array[ci * csz + cc] * csc : 1) * ic[cc];
              }
            }
            return;
          }
          if (!src) return;
          var sz = src.itemSize, sc = denormScale(src);
          for (var i = 0; i < cnt; i++) {
            if (nm === 'position') {
              v3.fromBufferAttribute(src, i).applyMatrix4(p.m);
              dst[(vo + i) * 3] = v3.x; dst[(vo + i) * 3 + 1] = v3.y; dst[(vo + i) * 3 + 2] = v3.z;
            } else if (nm === 'normal') {
              v3.fromBufferAttribute(src, i).applyMatrix3(nm3).normalize();
              dst[(vo + i) * 3] = v3.x; dst[(vo + i) * 3 + 1] = v3.y; dst[(vo + i) * 3 + 2] = v3.z;
            } else if (nm === 'uv' && p.ws != null) {
              var su = 1, sv = 1, N0 = g.attributes.normal;
              if (typeof p.ws === 'number') { su = p.ws; sv = p.ws; }
              else if (N0) {
                var ax = Math.abs(N0.getX(i)), ay = Math.abs(N0.getY(i));
                if (ay > 0.5) { su = p.ws[0]; sv = p.ws[2]; }
                else if (ax > 0.5) { su = p.ws[2]; sv = p.ws[1]; }
                else { su = p.ws[0]; sv = p.ws[1]; }
              }
              dst[(vo + i) * sz] = src.array[i * sz] * sc * su;
              dst[(vo + i) * sz + 1] = src.array[i * sz + 1] * sc * sv;
            } else {
              for (var c = 0; c < sz; c++) dst[(vo + i) * sz + c] = src.array[i * sz + c] * sc;
            }
          }
        });
        if (g.index) {
          for (var k = 0; k < g.index.count; k++) I[io + k] = g.index.array[k] + vo;
          io += g.index.count;
        } else {
          for (var k2 = 0; k2 < cnt; k2++) I[io + k2] = vo + k2;
          io += cnt;
        }
        vo += cnt;
      });
      var geo = new THREE.BufferGeometry();
      names.forEach(function (nm) { geo.setAttribute(nm, new THREE.BufferAttribute(A[nm], size(nm))); });
      geo.setIndex(new THREE.BufferAttribute(I, 1));
      geo.computeBoundingSphere();
      if (!Q.mat.vertexColors) { Q.mat.vertexColors = true; Q.mat.needsUpdate = true; }
      var tris = itotal / 3;
      totalTris += tris;
      out.push({ geo: geo, mat: Q.mat, tris: tris });
    });

    var ud = G.userData || {};
    return {
      parts: out,
      tris: totalTris,
      w: ud.w == null ? 6 : ud.w,
      d: ud.d == null ? 6 : ud.d,
      h: ud.h == null ? 6 : ud.h,
      fixtures: ud.fixtures || null,
      doors: ud.doors || null
    };
  };

  /* Extract canonical core/materials/library entry from a Three.js material when present */
  function matLibEntry(m) {
    if (!m) return null;
    var ud = m.userData;
    if (ud && ud.lib && typeof ud.lib === 'object') return ud.lib;
    if (ud && typeof ud.lib === 'string') {
      return { lib: ud.lib, tint: ud.tint, mean: ud.mean, specular: ud.specular };
    }
    var f = typeof m.onBeforeCompile === 'function' ? String(m.onBeforeCompile) : '';
    var q = /KMAT\.bound\[("(?:[^"\\]|\\.)*")\]/.exec(f);
    if (q && typeof KMAT !== 'undefined' && KMAT && KMAT.bound) {
      var b = KMAT.bound[JSON.parse(q[1])];
      if (b && b.lib) return typeof b.lib === 'object' ? b.lib : { lib: b.lib, tint: b.tint, mean: b.mean, specular: b.specular };
    }
    if (ud && ud.kratorPack && ud.fam && typeof KMAT !== 'undefined' && KMAT && KMAT.packed) {
      var pk = KMAT.packed(ud.kratorPack, ud.fam);
      if (pk && pk.lib) return pk;
    }
    return null;
  }

  /* Shared 512 px DataTexture2DArray across 1..N kits, deduplicated by canonical library set id (<setId>|<kind>|<tintSig>) */
  K.createSharedAtlas = function (opt) {
    opt = opt || {};
    var S = opt.size == null ? 512 : opt.size;
    var maxVramMB = opt.maxVramMB == null ? 350 : opt.maxVramMB;
    var R = opt.renderer || (typeof HOST !== 'undefined' && HOST ? HOST.renderer : null);
    var ok = !!((opt.headlessArray || (R && R.capabilities && R.capabilities.isWebGL2)) && typeof THREE !== 'undefined' && THREE.DataTexture2DArray);

    var st = { layers: { alb: 0, nor: 0, rgh: 0 }, dedupHits: 0, uniqueTextures: 0, uploads: 0, merged: 0, rest: 0, grown: 0, capped: 0, vramMB: 0 };

    function computeVramMB(banks) {
      var caps = banks.alb.cap + banks.nor.cap + banks.rgh.cap;
      var bytesPerLayer = S * S * 4 * (4 / 3); /* RGBA8 + mipchain */
      return +((caps * bytesPerLayer) / 1048576).toFixed(2);
    }

    function makeArrayTex(cap) {
      var t = new THREE.DataTexture2DArray(new Uint8Array(S * S * 4 * cap), S, S, cap);
      t.format = THREE.RGBAFormat;
      t.type = THREE.UnsignedByteType;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = true;
      t.anisotropy = 4;
      t.needsUpdate = true;
      return t;
    }

    var banks = {};
    ['alb', 'nor', 'rgh'].forEach(function (k) {
      var initCap = opt.initialCap == null ? 16 : opt.initialCap;
      banks[k] = { cap: initCap, n: 0, byKey: new Map(), tex: null, dirty: false, uni: { value: null } };
      if (ok) {
        banks[k].tex = makeArrayTex(initCap);
        banks[k].uni.value = banks[k].tex;
      }
    });
    if (ok) st.vramMB = computeVramMB(banks);

    var cv = (typeof document !== 'undefined' && document.createElement) ? document.createElement('canvas') : null;
    var cx = null;
    if (cv) {
      cv.width = S; cv.height = S;
      cx = cv.getContext ? cv.getContext('2d', { willReadFrequently: true }) : null;
    }

    function texReady(t) {
      if (!t) return false;
      var im = t.image;
      if (!im) return !!opt.headlessArray;
      if (im.complete === false) return false;
      if (im.data && im.width > 0 && im.height > 0) return true;
      return ((im.naturalWidth == null ? 0 : im.naturalWidth) || (im.width == null ? 0 : im.width)) > 0;
    }

    /* Canonical deduplication key: two kits referencing the same library set & tint share a single array layer */
    function layerKeyOf(m, t, kind) {
      var LB = matLibEntry(m);
      var libName = LB && (typeof LB.lib === 'string' ? LB.lib : null);
      if (libName) {
        var flip = t.flipY ? 1 : 0;
        if (kind === 'nor') return 'lib:' + libName + '|nor|f=' + flip;
        var tk = LB.tint == null ? 'n' : Math.round((typeof LB.tint === 'number' ? LB.tint : (LB.tint.keep == null ? 1 : LB.tint.keep)) * 100);
        var mn = LB.mean == null ? 'n' : Math.round(LB.mean * 100);
        return 'lib:' + libName + '|' + kind + '|t=' + tk + '|m=' + mn + '|f=' + flip;
      }
      return 'uuid:' + t.uuid;
    }

    function readPixels(t) {
      if (t.image && t.image.data && t.image.width === S && t.image.height === S && t.image.data.length === S * S * 4) {
        return t.image.data;
      }
      if (cx && t.image && !(t.image.data && typeof HTMLImageElement !== 'undefined' && !(t.image instanceof HTMLImageElement))) {
        try {
          cx.save();
          cx.clearRect(0, 0, S, S);
          if (t.flipY) { cx.translate(0, S); cx.scale(1, -1); }
          cx.drawImage(t.image, 0, 0, S, S);
          cx.restore();
          var idata = cx.getImageData(0, 0, S, S);
          if (idata && idata.data && idata.data.length === S * S * 4) return idata.data;
        } catch (_e) { /* fall through to solid fill in headless environments */ }
      }
      var fallback = new Uint8Array(S * S * 4);
      fallback.fill(255);
      return fallback;
    }

    function acquireLayer(kind, m, t) {
      var B = banks[kind], dkey = layerKeyOf(m, t, kind);
      if (B.byKey.has(dkey)) {
        st.dedupHits++;
        return B.byKey.get(dkey);
      }
      if (B.n >= B.cap) {
        var nextCap = Math.ceil(B.cap * 1.5) + 1;
        var projectedMB = ((banks.alb.cap + banks.nor.cap + banks.rgh.cap - B.cap + nextCap) * S * S * 4 * (4 / 3)) / 1048576;
        if (projectedMB > maxVramMB) {
          st.capped++;
          return -2; /* signals caller to leave this part in `rest` rather than exceeding VRAM cap */
        }
        var nt = makeArrayTex(nextCap);
        nt.image.data.set(B.tex.image.data);
        B.tex.dispose();
        B.tex = nt;
        B.cap = nextCap;
        B.uni.value = nt;
        st.grown++;
        st.vramMB = computeVramMB(banks);
      }
      var px = readPixels(t);
      B.tex.image.data.set(px, B.n * S * S * 4);
      var idx = B.n++;
      B.byKey.set(dkey, idx);
      B.dirty = true;
      st.layers[kind] = B.n;
      st.uniqueTextures++;
      return idx;
    }

    function flush() {
      if (!ok) return;
      ['alb', 'nor', 'rgh'].forEach(function (k) {
        var B = banks[k];
        if (B.dirty) { B.tex.needsUpdate = true; B.dirty = false; st.uploads++; }
      });
    }

    var DUMMY = ok ? new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat) : null;
    if (DUMMY) DUMMY.needsUpdate = true;

    function makeAtlasMaterial(side) {
      var m = new THREE.MeshStandardMaterial({ vertexColors: true, side: side, map: DUMMY, normalMap: DUMMY, roughness: 1, metalness: 0 });
      m.onBeforeCompile = function (sh) {
        sh.uniforms.aAlb = banks.alb.uni;
        sh.uniforms.aNor = banks.nor.uni;
        sh.uniforms.aRgh = banks.rgh.uni;
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nattribute vec3 lay;attribute vec4 rmn;attribute vec3 det;varying vec3 vLay;varying vec4 vRmn;varying vec3 vDet;varying vec3 vKfP;varying vec3 vKfN;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLay=lay;vRmn=rmn;vDet=det;vKfP=position;vKfN=normal;');
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <common>', '#include <common>\nprecision highp sampler2DArray;uniform sampler2DArray aAlb;uniform sampler2DArray aNor;uniform sampler2DArray aRgh;varying vec3 vLay;varying vec4 vRmn;varying vec3 vDet;varying vec3 vKfP;varying vec3 vKfN;')
          .replace('#include <map_fragment>', 'if(vDet.x>-.5){vec3 kW=pow(abs(normalize(vKfN))+1e-4,vec3(4.0));kW/=(kW.x+kW.y+kW.z);vec3 kP=vKfP*vDet.y;' +
            'vec4 kT=texture(aAlb,vec3(kP.zy,vDet.x))*kW.x+texture(aAlb,vec3(kP.xz,vDet.x))*kW.y+texture(aAlb,vec3(kP.xy,vDet.x))*kW.z;diffuseColor.rgb*=sRGBToLinear(kT).rgb*vDet.z;}' +
            'else if(vLay.x>-.5)diffuseColor*=sRGBToLinear(texture(aAlb,vec3(vUv,vLay.x)));')
          .replace('#include <roughnessmap_fragment>', 'float roughnessFactor=vRmn.x;if(vLay.z>-.5)roughnessFactor*=texture(aRgh,vec3(vUv,vLay.z)).g;')
          .replace('#include <metalnessmap_fragment>', 'float metalnessFactor=vRmn.y;')
          .replace('#include <normal_fragment_maps>', 'if(vLay.y>-.5){vec3 mapN=texture(aNor,vec3(vUv,vLay.y)).xyz*2.0-1.0;mapN.xy*=vRmn.z;normal=perturbNormal2Arb(-vViewPosition,normal,mapN,faceDirection);}')
          .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\nreflectedLight.directSpecular*=vRmn.w;');
      };
      m.customProgramCacheKey = function () { return 'kcity-multikit-atlas-' + side; };
      m.userData.atlas = true;
      return m;
    }

    var MATS = ok ? { 0: makeAtlasMaterial(THREE.FrontSide), 2: makeAtlasMaterial(THREE.DoubleSide) } : {};
    var MOVING = /^(flut|flick)/;

    function mergeable(m) {
      if (!m || Array.isArray(m)) return false;
      if (!(m.isMeshStandardMaterial || m.isMeshLambertMaterial)) return false;
      if (m.transparent || m.alphaTest > 0 || m.opacity < 1 || m.alphaMap || m.emissiveMap) return false;
      if (m.emissive && (m.emissive.r + m.emissive.g + m.emissive.b) > 0.01) return false;
      if (m.side === THREE.BackSide) return false;
      if (m.userData && m.userData.hooks && m.userData.hooks.some(function (h) { return MOVING.test(h.key); })) return false;
      return true;
    }

    var _uv = new THREE.Vector3();

    function merge(parts) {
      var out = { meshes: [], rest: [], retry: false };
      if (!ok) { out.rest = parts.slice(); return out; }
      var bySide = { 0: [], 2: [] };
      for (var pi = 0; pi < parts.length; pi++) {
        var p = parts[pi], m = p.mat;
        if (!mergeable(m)) { out.rest.push(p); continue; }
        var maps = [m.map, m.normalMap, m.roughnessMap];
        for (var ti = 0; ti < maps.length; ti++) {
          if (maps[ti] && !texReady(maps[ti])) { out.retry = true; return out; }
        }
        var tri = m.userData && m.userData.courtTri;
        var lDet = (tri && m.map) ? acquireLayer('alb', m, m.map) : -1;
        var lAlb = (m.map && !tri) ? acquireLayer('alb', m, m.map) : -1;
        var lNor = (m.normalMap && !tri) ? acquireLayer('nor', m, m.normalMap) : -1;
        var lRgh = (m.roughnessMap && !tri) ? acquireLayer('rgh', m, m.roughnessMap) : -1;
        if (lDet === -2 || lAlb === -2 || lNor === -2 || lRgh === -2) {
          out.rest.push(p);
          continue;
        }
        var sideKey = m.side === THREE.DoubleSide ? 2 : 0;
        bySide[sideKey].push({
          p: p,
          la: [lAlb, lNor, lRgh],
          dt: (tri && m.map) ? [lDet, tri.tile, tri.detail ? tri.gain : 1] : [-1, 0, 0]
        });
      }

      [0, 2].forEach(function (side) {
        var L = bySide[side];
        if (!L.length) return;
        var nv = 0, ni = 0;
        L.forEach(function (e) {
          nv += e.p.geo.attributes.position.count;
          ni += e.p.geo.index ? e.p.geo.index.count : e.p.geo.attributes.position.count;
        });
        var pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2);
        var col = new Float32Array(nv * 3), lay = new Float32Array(nv * 3), det = new Float32Array(nv * 3);
        var rmn = new Float32Array(nv * 4), idx = new Uint32Array(ni);
        var o = 0, k = 0;
        L.forEach(function (e) {
          var g = e.p.geo;
          if (!g.attributes.normal) { g = g.clone(); g.computeVertexNormals(); }
          var m = e.p.mat, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
          var C = m.vertexColors ? g.attributes.color : null;
          var LB = matLibEntry(m), spec = (LB && LB.specular != null) ? (LB.specular / 0.5) : 1;
          var rough = m.isMeshLambertMaterial ? 1 : (m.roughness == null ? 1 : m.roughness);
          var metal = m.isMeshLambertMaterial ? 0 : (m.metalness == null ? 0 : m.metalness);
          var ns = (m.normalMap && m.normalScale) ? m.normalScale.x : 1;
          var c = m.color || { r: 1, g: 1, b: 1 };
          var uvK = (m.userData && m.userData.uvK) ? m.userData.uvK : null;
          var M3 = null;
          if (!uvK && m.map && m.map.updateMatrix) { m.map.updateMatrix(); M3 = m.map.matrix; }
          for (var i = 0; i < P.count; i++) {
            var j = o + i;
            pos[j * 3] = P.getX(i); pos[j * 3 + 1] = P.getY(i); pos[j * 3 + 2] = P.getZ(i);
            nor[j * 3] = N.getX(i); nor[j * 3 + 1] = N.getY(i); nor[j * 3 + 2] = N.getZ(i);
            if (U) {
              _uv.set(U.getX(i), U.getY(i), 1);
              if (uvK) _uv.multiplyScalar(uvK);
              else if (M3) _uv.applyMatrix3(M3);
              uv[j * 2] = _uv.x; uv[j * 2 + 1] = _uv.y;
            }
            col[j * 3] = c.r * (C ? C.getX(i) : 1);
            col[j * 3 + 1] = c.g * (C ? C.getY(i) : 1);
            col[j * 3 + 2] = c.b * (C ? C.getZ(i) : 1);
            lay[j * 3] = e.la[0]; lay[j * 3 + 1] = e.la[1]; lay[j * 3 + 2] = e.la[2];
            rmn[j * 4] = rough; rmn[j * 4 + 1] = metal; rmn[j * 4 + 2] = ns; rmn[j * 4 + 3] = spec;
            det[j * 3] = e.dt[0]; det[j * 3 + 1] = e.dt[1]; det[j * 3 + 2] = e.dt[2];
          }
          if (g.index) {
            for (var ii = 0; ii < g.index.count; ii++) idx[k++] = o + g.index.getX(ii);
          } else {
            for (var ii2 = 0; ii2 < P.count; ii2++) idx[k++] = o + ii2;
          }
          o += P.count;
        });
        var G = new THREE.BufferGeometry();
        G.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        G.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
        G.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        G.setAttribute('color', new THREE.BufferAttribute(col, 3));
        G.setAttribute('lay', new THREE.BufferAttribute(lay, 3));
        G.setAttribute('rmn', new THREE.BufferAttribute(rmn, 4));
        G.setAttribute('det', new THREE.BufferAttribute(det, 3));
        G.setIndex(new THREE.BufferAttribute(idx, 1));
        G.computeBoundingSphere();
        out.meshes.push({ geo: G, mat: MATS[side], parts: L.length });
        st.merged += L.length;
      });
      st.rest += out.rest.length;
      return out;
    }

    return { ok: ok, merge: merge, flush: flush, layerKeyOf: layerKeyOf, stats: st, size: S, banks: banks };
  };

  /* Vertex-clustered HLOD proxy mesh (promoted from openworld/isle-demo 88t-world-towns.js) */
  K.bakeProxy = function (parts, gridStep) {
    var step = Math.max(0.25, gridStep == null ? 0.5 : +gridStep);
    var nv = 0, ni = 0;
    parts.forEach(function (p) {
      nv += p.geo.attributes.position.count;
      ni += p.geo.index ? p.geo.index.count : p.geo.attributes.position.count;
    });
    if (!nv || !ni) return null;
    var pos = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni);
    var v = new THREE.Vector3(), o = 0, k = 0;
    parts.forEach(function (p) {
      var g = p.geo, P = g.attributes.position, C = g.attributes.color;
      var mt = Array.isArray(p.mat) ? p.mat[0] : p.mat;
      var mc = (mt && mt.color) ? mt.color : { r: 1, g: 1, b: 1 };
      for (var i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i);
        if (p.M) v.applyMatrix4(p.M);
        var j = (o + i) * 3;
        pos[j] = v.x; pos[j + 1] = v.y; pos[j + 2] = v.z;
        var cr = (C && mt && mt.vertexColors) ? C.getX(i) : 1;
        var cg = (C && mt && mt.vertexColors) ? C.getY(i) : 1;
        var cb = (C && mt && mt.vertexColors) ? C.getZ(i) : 1;
        col[j] = mc.r * cr; col[j + 1] = mc.g * cg; col[j + 2] = mc.b * cb;
      }
      if (g.index) {
        for (var ii = 0; ii < g.index.count; ii++) idx[k++] = o + g.index.getX(ii);
      } else {
        for (var ii2 = 0; ii2 < P.count; ii2++) idx[k++] = o + ii2;
      }
      o += P.count;
    });

    var cell = new Map(), seen = {}, cp = [], cc = [], cn = [], out = [];
    var A = new THREE.Vector3(), B = new THREE.Vector3(), Cc = new THREE.Vector3();
    for (var t = 0; t < k; t += 3) {
      var a = idx[t], b = idx[t + 1], c = idx[t + 2];
      A.set(pos[b * 3] - pos[a * 3], pos[b * 3 + 1] - pos[a * 3 + 1], pos[b * 3 + 2] - pos[a * 3 + 2]);
      B.set(pos[c * 3] - pos[a * 3], pos[c * 3 + 1] - pos[a * 3 + 1], pos[c * 3 + 2] - pos[a * 3 + 2]);
      Cc.crossVectors(A, B);
      var ax = Math.abs(Cc.x), ay = Math.abs(Cc.y), az = Math.abs(Cc.z);
      var f = ax >= ay && ax >= az ? (Cc.x > 0 ? 0 : 1) : (ay >= az ? (Cc.y > 0 ? 2 : 3) : (Cc.z > 0 ? 4 : 5));
      var ids = [a, b, c].map(function (vi) {
        var gx = Math.floor(pos[vi * 3] / step), gy = Math.floor(pos[vi * 3 + 1] / step), gz = Math.floor(pos[vi * 3 + 2] / step);
        var ckey = gx + ',' + gy + ',' + gz + ',' + f;
        var n = cell.get(ckey);
        if (n === undefined) { n = cn.length; cell.set(ckey, n); seen[n] = {}; cp.push(0, 0, 0); cc.push(0, 0, 0); cn.push(0); }
        if (!seen[n][vi]) {
          seen[n][vi] = 1;
          cp[n * 3] += pos[vi * 3]; cp[n * 3 + 1] += pos[vi * 3 + 1]; cp[n * 3 + 2] += pos[vi * 3 + 2];
          cc[n * 3] += col[vi * 3]; cc[n * 3 + 1] += col[vi * 3 + 1]; cc[n * 3 + 2] += col[vi * 3 + 2];
          cn[n]++;
        }
        return n;
      });
      if (ids[0] !== ids[1] && ids[1] !== ids[2] && ids[0] !== ids[2]) out.push(ids[0], ids[1], ids[2]);
    }
    var nV = cn.length, P2 = new Float32Array(nV * 3), C2 = new Float32Array(nV * 3);
    for (var vi2 = 0; vi2 < nV; vi2++) {
      var w = cn[vi2] || 1;
      P2[vi2 * 3] = cp[vi2 * 3] / w; P2[vi2 * 3 + 1] = cp[vi2 * 3 + 1] / w; P2[vi2 * 3 + 2] = cp[vi2 * 3 + 2] / w;
      C2[vi2 * 3] = cc[vi2 * 3] / w; C2[vi2 * 3 + 1] = cc[vi2 * 3 + 1] / w; C2[vi2 * 3 + 2] = cc[vi2 * 3 + 2] / w;
    }
    var G = new THREE.BufferGeometry();
    G.setAttribute('position', new THREE.BufferAttribute(P2, 3));
    G.setAttribute('color', new THREE.BufferAttribute(C2, 3));
    G.setIndex(new THREE.BufferAttribute(nV > 65535 ? new Uint32Array(out) : new Uint16Array(out), 1));
    G.computeBoundingSphere();
    return { geo: G, tris: out.length / 3, from: k / 3 };
  };

  var _bm = null, _bv = null;
  K.boundedInstanced = function (im) {
    if (!_bm) { _bm = new THREE.Matrix4(); _bv = new THREE.Vector3(); }
    var g0 = im.geometry;
    if (!g0.boundingSphere) g0.computeBoundingSphere();
    var g = new THREE.BufferGeometry();
    Object.keys(g0.attributes).forEach(function (k) { g.setAttribute(k, g0.attributes[k]); });
    if (g0.index) g.setIndex(g0.index);
    g.groups = g0.groups;
    var n = im.count;
    if (!n) {
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 0);
      im.geometry = g; im.frustumCulled = true;
      return im;
    }
    var cx = 0, cy = 0, cz = 0, r = 0, sc = 1;
    for (var i = 0; i < n; i++) {
      im.getMatrixAt(i, _bm);
      _bv.setFromMatrixPosition(_bm);
      cx += _bv.x; cy += _bv.y; cz += _bv.z;
      sc = Math.max(sc, _bm.getMaxScaleOnAxis());
    }
    cx /= n; cy /= n; cz /= n;
    for (var j = 0; j < n; j++) {
      im.getMatrixAt(j, _bm);
      _bv.setFromMatrixPosition(_bm);
      r = Math.max(r, Math.hypot(_bv.x - cx, _bv.y - cy, _bv.z - cz));
    }
    var gs = g0.boundingSphere;
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx + gs.center.x, cy + gs.center.y, cz + gs.center.z), r + gs.radius * sc);
    im.geometry = g;
    im.frustumCulled = true;
    return im;
  };

  /* ---------------------------------------------------------------- Lazy Sidecar Loader & 3-Ring Multi-Kit Scene Host */
  function loadScriptTag(src, cb) {
    if (typeof document === 'undefined' || !document.createElement) {
      cb(new Error('no DOM document for script loading: ' + src));
      return;
    }
    var el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = function () { cb(null); };
    el.onerror = function () { cb(new Error('failed to load sidecar script ' + src)); };
    (document.head || document.body || document.documentElement).appendChild(el);
  }

  function createBrowserLoader(opt) {
    opt = opt || {};
    var baseUrl = String(opt.baseUrl == null ? 'kits' : opt.baseUrl).replace(/\/+$/, '');
    var KK = opt.kits || kitsOf();
    var loadTex = opt.loadTextures !== false;
    var loadedPacks = {}, pendingPacks = {}, pendingKits = {};

    function ensurePack(packKey, cb) {
      if (!loadTex || !packKey || loadedPacks[packKey]) { cb(null); return; }
      if (typeof KMAT_SIDE !== 'undefined' && KMAT_SIDE && KMAT_SIDE[packKey]) {
        if (typeof KMAT !== 'undefined' && KMAT && KMAT.pack) KMAT.pack(packKey, KMAT_SIDE[packKey]);
        loadedPacks[packKey] = true;
        cb(null);
        return;
      }
      if (pendingPacks[packKey]) { pendingPacks[packKey].push(cb); return; }
      pendingPacks[packKey] = [cb];
      var idxPacks = opt.sidecarIndex && opt.sidecarIndex.packs && opt.sidecarIndex.packs[packKey];
      var relFiles = (idxPacks && Array.isArray(idxPacks.files) && idxPacks.files.length)
        ? idxPacks.files.slice()
        : ['packs/' + packKey + '.tex.js'];
      var left = relFiles.length;
      relFiles.forEach(function (rf) {
        loadScriptTag(baseUrl + '/' + rf, function (_err) {
          left--;
          if (left > 0) return;
          /* missing .tex.js falls back cleanly to procedural maps (matlib_pack.py contract) */
          if (typeof KMAT_SIDE !== 'undefined' && KMAT_SIDE && KMAT_SIDE[packKey] && typeof KMAT !== 'undefined' && KMAT && KMAT.pack) {
            KMAT.pack(packKey, KMAT_SIDE[packKey]);
          }
          loadedPacks[packKey] = true;
          var waiters = pendingPacks[packKey] || [];
          delete pendingPacks[packKey];
          waiters.forEach(function (fn) { fn(null); });
        });
      });
    }

    function loaderFn(kitId, cb) {
      if (KK && KK.isLoaded(kitId)) { cb(null); return; }
      if (pendingKits[kitId]) { pendingKits[kitId].push(cb); return; }
      pendingKits[kitId] = [cb];
      var meta = KK && KK.manifest().kits[kitId];
      var packKey = meta ? meta.pack : null;
      ensurePack(packKey, function () {
        loadScriptTag(baseUrl + '/' + kitId + '.bundle.js', function (err) {
          if (!err && KK && KK.isLoaded(kitId)) {
            var api = KK.getLoaded(kitId);
            if (api && typeof api.bind === 'function' && typeof KMAT !== 'undefined' && KMAT) {
              try { api.bind(KMAT); } catch (_be) { /* keep procedural materials if KMAT uninitialized */ }
            }
          }
          var waiters = pendingKits[kitId] || [];
          delete pendingKits[kitId];
          waiters.forEach(function (fn) { fn(err); });
        });
      });
    }

    if (KK && opt.install !== false) KK.setLoader(loaderFn);
    return loaderFn;
  }

  function createHost(opt) {
    opt = opt || {};
    var KK = opt.kits || kitsOf();
    if (!KK) throw new Error('KCITY.hostMultikit.create: load core/kits/10-core-kits.js first');
    var defaultKit = opt.defaultKit || 'islanders';
    var group = opt.group || new THREE.Group();
    var atlas = opt.atlas || K.createSharedAtlas({ renderer: opt.renderer, headlessArray: opt.headlessArray, maxVramMB: opt.maxVramMB });
    var fullR = opt.fullR == null ? 160 : +opt.fullR;
    var mid1R = opt.mid1R == null ? 360 : +opt.mid1R;
    var midR = opt.midR == null ? 820 : +opt.midR;
    var bakeBudgetMs = opt.bakeBudgetMs == null ? 8 : +opt.bakeBudgetMs;
    var divs = opt.divs || [40, 12];
    var progressFn = opt.lotProgress || null;

    var protoCache = new Map(), atlasCache = new Map(), bakedCache = new Map();
    var wantAtlas = new Map(), wantBake = new Map();
    var fullMeshes = [], midMeshes = [], constructNodes = new Map();
    var massMesh = null, massVisible = [], standingLots = [];
    var dirty = true, lastAt = [0, 0], stats = { full: 0, mid: 0, massing: 0, constructing: 0, calls: { full: 0, mid: 0, massing: 0, constructing: 0 }, loadedKits: [], pendingKits: [], errors: [] };

    var bakeMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, metalness: 0 });
    var massMat = new THREE.MeshStandardMaterial({ color: 0xb9aa94, roughness: 0.92, metalness: 0, flatShading: true });
    var unitBox = new THREE.BoxGeometry(1, 1, 1);
    unitBox.translate(0, 0.5, 0);

    var _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
    var _zero = new THREE.Matrix4().makeScale(0, 0, 0);

    function lotMatrix(L, scaleVec) {
      _q.setFromAxisAngle(_up, L.ry == null ? 0 : L.ry);
      _p.set(L.x == null ? 0 : L.x, L.y == null ? 0 : L.y, L.z == null ? 0 : L.z);
      if (scaleVec) _s.set(scaleVec[0], scaleVec[1], scaleVec[2]);
      else _s.set(1, 1, 1);
      return _m.compose(_p, _q, _s).clone();
    }

    function protoIdOf(L) {
      var P = KK.parseKey(L.key, L.kit || defaultKit);
      var v = L.v == null ? 0 : (L.v | 0);
      return { id: P.qkey + '#' + v, qkey: P.qkey, kitId: P.kitId, rawKey: P.key, v: v };
    }

    function getProto(spec) {
      if (protoCache.has(spec.id)) return protoCache.get(spec.id);
      if (!KK.isLoaded(spec.kitId)) return undefined;
      var meta = KK.manifest().kits[spec.kitId];
      var G = null;
      try {
        G = KK.proto(spec.qkey, spec.v, opt.doors ? { doors: true } : null, defaultKit);
      } catch (e) {
        stats.errors.push(spec.id + ': ' + String((e && e.message) || e));
      }
      if (!G) { protoCache.set(spec.id, null); return null; }
      var flat = K.flattenProto(G, { pack: meta ? meta.pack : null });
      protoCache.set(spec.id, flat);
      return flat;
    }

    function dropList(arr) {
      for (var i = 0; i < arr.length; i++) group.remove(arr[i]);
      arr.length = 0;
    }

    function buildMassing() {
      if (massMesh) { group.remove(massMesh); massMesh = null; }
      if (!standingLots.length) { massVisible = []; return; }
      massMesh = new THREE.InstancedMesh(unitBox, massMat, standingLots.length);
      massMesh.name = 'multikit-massing';
      massMesh.userData = { massing: true };
      massVisible = new Array(standingLots.length);
      for (var i = 0; i < standingLots.length; i++) {
        var L = standingLots[i];
        massMesh.setMatrixAt(i, lotMatrix(L, [L.w == null ? 6 : L.w, L.h == null ? 6 : L.h, L.d == null ? 6 : L.d]));
        massVisible[i] = true;
      }
      massMesh.instanceMatrix.needsUpdate = true;
      K.boundedInstanced(massMesh);
      group.add(massMesh);
    }

    function setMassShown(idx, show) {
      if (!massMesh || massVisible[idx] === show) return;
      massVisible[idx] = show;
      var L = standingLots[idx];
      if (show) massMesh.setMatrixAt(idx, lotMatrix(L, [L.w == null ? 6 : L.w, L.h == null ? 6 : L.h, L.d == null ? 6 : L.d]));
      else massMesh.setMatrixAt(idx, _zero);
      massMesh.instanceMatrix.needsUpdate = true;
    }

    function pumpQueues() {
      if (!wantAtlas.size && !wantBake.size) return false;
      var nowFn = (typeof performance !== 'undefined' && performance.now) ? function () { return performance.now(); } : Date.now;
      var t0 = nowFn(), changed = false;

      var atlKeys = Array.from(wantAtlas.keys());
      for (var ai = 0; ai < atlKeys.length; ai++) {
        var aid = atlKeys[ai], job = wantAtlas.get(aid);
        wantAtlas.delete(aid);
        var parts = job();
        if (parts === undefined) continue;
        if (!parts) { atlasCache.set(aid, null); changed = true; continue; }
        var M = atlas.merge(parts);
        if (M.retry) { wantAtlas.set(aid, job); break; }
        atlasCache.set(aid, M);
        changed = true;
        if (nowFn() - t0 > bakeBudgetMs) return changed;
      }

      var bakeKeys = Array.from(wantBake.keys());
      for (var bi = 0; bi < bakeKeys.length; bi++) {
        var bkey = bakeKeys[bi], bjob = wantBake.get(bkey);
        wantBake.delete(bkey);
        var bparts = bjob.parts();
        if (bparts === undefined) continue;
        if (!bparts || !bparts.length) { bakedCache.set(bkey, null); changed = true; continue; }
        var maxSpan = 6;
        bparts.forEach(function (p) {
          if (!p.geo.boundingBox) p.geo.computeBoundingBox();
          var bb = p.geo.boundingBox;
          maxSpan = Math.max(maxSpan, bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z);
        });
        bakedCache.set(bkey, K.bakeProxy(bparts, Math.max(0.3, maxSpan / bjob.div)));
        changed = true;
        if (nowFn() - t0 > bakeBudgetMs) break;
      }
      return changed;
    }

    function ensureUsedKits() {
      var used = KK.kitsUsedByLots(standingLots, defaultKit);
      var loaded = [], pending = [];
      used.forEach(function (kid) {
        if (KK.isLoaded(kid)) loaded.push(kid);
        else pending.push(kid);
      });
      stats.loadedKits = loaded;
      stats.pendingKits = pending;
      if (pending.length) {
        KK.ensure(pending, function (err) {
          if (err) stats.errors.push(String((err && err.message) || err));
          dirty = true;
        });
      }
    }

    function rebuild(atXZ) {
      if (atXZ) lastAt = [atXZ[0], atXZ[1]];
      dropList(fullMeshes);
      dropList(midMeshes);
      var keepConstruct = {};
      var fullBuckets = {}, midBuckets = {};
      var nFull = 0, nMid = 0, nMass = 0, nCons = 0;

      for (var i = 0; i < standingLots.length; i++) {
        var L = standingLots[i], spec = protoIdOf(L);
        var prog = progressFn ? progressFn(L) : null;
        var isConstructing = prog && prog.f != null && prog.f < 1;

        if (isConstructing && K.constructMesh) {
          var cProto = getProto(spec);
          if (cProto && cProto.parts.length) {
            var tagKey = String(L.tag != null ? L.tag : L.id);
            keepConstruct[tagKey] = true;
            var cn = constructNodes.get(tagKey);
            if (!cn || cn.protoId !== spec.id) {
              if (cn) group.remove(cn.mesh.group);
              var cm = K.constructMesh(cProto.parts);
              cm.group.position.set(L.x || 0, L.y || 0, L.z || 0);
              cm.group.rotation.y = L.ry || 0;
              cm.group.userData = { constructing: true, lot: L.tag != null ? L.tag : L.id };
              group.add(cm.group);
              cn = { protoId: spec.id, mesh: cm };
              constructNodes.set(tagKey, cn);
            }
            cn.mesh.set(prog.f);
            setMassShown(i, false);
            nCons++;
            continue;
          }
        }

        var d = Math.hypot((L.x || 0) - lastAt[0], (L.z || 0) - lastAt[1]);
        if (d < fullR) {
          var fProto = getProto(spec);
          if (fProto === undefined) {
            /* kit bundle still streaming in -> keep massing visible until onload triggers rebuild */
            setMassShown(i, true); nMass++; continue;
          }
          if (fProto && fProto.parts.length) {
            var A = atlasCache.has(spec.id) ? atlasCache.get(spec.id) : null;
            if (!atlasCache.has(spec.id)) {
              (function (sp, fp) { wantAtlas.set(sp.id, function () { return fp.parts; }); })(spec, fProto);
              /* draw unmerged parts immediately or massing on first frame until pumpQueues merges */
              A = { meshes: [], rest: fProto.parts };
            }
            if (A) {
              var fb = fullBuckets[spec.id] || (fullBuckets[spec.id] = { A: A, P: fProto, lots: [], indices: [] });
              fb.lots.push(L); fb.indices.push(i);
              continue;
            }
          }
        } else if (d < midR) {
          var lv = d < mid1R ? 0 : 1, bkey = spec.id + '|' + lv;
          var mProto = getProto(spec);
          if (mProto === undefined) {
            setMassShown(i, true); nMass++; continue;
          }
          if (mProto && mProto.parts.length) {
            if (!bakedCache.has(bkey)) {
              (function (bk, mp, dv) { wantBake.set(bk, { div: dv, parts: function () { return mp.parts; } }); })(bkey, mProto, divs[lv]);
              setMassShown(i, true); nMass++; continue;
            }
            var B = bakedCache.get(bkey);
            if (B) {
              var mb = midBuckets[bkey] || (midBuckets[bkey] = { B: B, P: mProto, lots: [], indices: [] });
              mb.lots.push(L); mb.indices.push(i);
              continue;
            }
          }
        }
        setMassShown(i, true);
        nMass++;
      }

      /* prune finished construction nodes */
      Array.from(constructNodes.keys()).forEach(function (tk) {
        if (!keepConstruct[tk]) {
          group.remove(constructNodes.get(tk).mesh.group);
          constructNodes.delete(tk);
        }
      });

      Object.keys(fullBuckets).forEach(function (id) {
        var E = fullBuckets[id];
        var addInst = function (geo, mat, label) {
          var im = new THREE.InstancedMesh(geo, mat, E.lots.length);
          for (var j = 0; j < E.lots.length; j++) im.setMatrixAt(j, lotMatrix(E.lots[j], null));
          im.name = label;
          im.userData = { multikitFull: true, lots: E.lots.map(function (L) { return L.tag != null ? L.tag : L.id; }) };
          group.add(K.boundedInstanced(im));
          fullMeshes.push(im);
        };
        E.A.meshes.forEach(function (m, k) { addInst(m.geo, m.mat, 'atlas ' + id + ' ' + k); });
        E.A.rest.forEach(function (p, k) { addInst(p.geo, p.mat, 'part ' + id + ' ' + k); });
        E.indices.forEach(function (idx) { setMassShown(idx, false); });
        nFull += E.lots.length;
      });

      Object.keys(midBuckets).forEach(function (bkey) {
        var E = midBuckets[bkey];
        var im = new THREE.InstancedMesh(E.B.geo, bakeMat, E.lots.length);
        for (var j = 0; j < E.lots.length; j++) {
          im.setMatrixAt(j, lotMatrix(E.lots[j], null));
          setMassShown(E.indices[j], false);
        }
        im.name = 'baked ' + bkey;
        im.userData = { multikitMid: true, lots: E.lots.map(function (L) { return L.tag != null ? L.tag : L.id; }) };
        group.add(K.boundedInstanced(im));
        midMeshes.push(im);
        nMid += E.lots.length;
      });

      var massShownCount = massVisible.filter(Boolean).length;
      stats.full = nFull;
      stats.mid = nMid;
      stats.massing = massShownCount;
      stats.constructing = nCons;
      stats.calls = {
        full: fullMeshes.length,
        mid: midMeshes.length,
        massing: massShownCount > 0 ? 1 : 0,
        constructing: constructNodes.size
      };
      dirty = false;
    }

    function setPlan(plan) {
      var lots = (plan && plan.lots) ? plan.lots : [];
      standingLots = lots.filter(function (L) { return L && L.died == null; });
      buildMassing();
      ensureUsedKits();
      dirty = true;
      rebuild(lastAt);
    }

    function update(atXZ, force) {
      var fresh = pumpQueues();
      atlas.flush();
      var moved = atXZ && Math.hypot(atXZ[0] - lastAt[0], atXZ[1] - lastAt[1]) >= 8;
      if (force || dirty || fresh || moved) {
        ensureUsedKits();
        rebuild(atXZ || lastAt);
      }
      return stats;
    }

    /* Audit: every standing lot is drawn in at least 1 and at most 1 representation (full, mid, massing, constructing) */
    function hlodCheck(negOpt) {
      negOpt = negOpt || {};
      var seen = new Map();
      var mark = function (id, mode) {
        var arr = seen.get(id) || [];
        arr.push(mode);
        seen.set(id, arr);
      };
      fullMeshes.forEach(function (m) { (m.userData.lots || []).forEach(function (id) { mark(id, 'full'); }); });
      midMeshes.forEach(function (m) { (m.userData.lots || []).forEach(function (id) { mark(id, 'mid'); }); });
      if (negOpt.twice && midMeshes.length && midMeshes[0].userData.lots.length) {
        mark(midMeshes[0].userData.lots[0], 'mid');
      }
      for (var i = 0; i < standingLots.length; i++) {
        if (massVisible[i]) {
          var L = standingLots[i];
          mark(L.tag != null ? L.tag : L.id, 'massing');
        }
      }
      constructNodes.forEach(function (cn) {
        mark(cn.mesh.group.userData.lot, 'constructing');
      });

      var twice = 0, none = 0;
      standingLots.forEach(function (L) {
        var id = L.tag != null ? L.tag : L.id;
        var modes = seen.get(id) || [];
        var uniq = Array.from(new Set(modes));
        /* note: in full mode a lot with >1 merged/rest InstancedMesh registers 'full' per part, so uniq === ['full'] is 1 mode */
        if (uniq.length > 1 || (uniq.length === 1 && uniq[0] !== 'full' && modes.length > 1)) twice++;
        if (!modes.length) none++;
      });
      return {
        ok: twice === 0 && none === 0 && standingLots.length > 0,
        lots: standingLots.length,
        twice: twice,
        none: none,
        stats: Object.assign({}, stats),
        atlas: Object.assign({}, atlas.stats)
      };
    }

    return {
      group: group,
      atlas: atlas,
      stats: stats,
      setPlan: setPlan,
      update: update,
      rebuild: function (atXZ) { dirty = true; rebuild(atXZ || lastAt); },
      hlodCheck: hlodCheck
    };
  }

  K.hostMultikit = {
    createBrowserLoader: createBrowserLoader,
    create: createHost
  };
})();
