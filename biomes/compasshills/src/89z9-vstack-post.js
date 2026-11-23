// ================================================================= HOST — native vertical-stack post-bake (B2 base AO, B4 card fringe dilation, M2 km1RoughAA, KDRAWN; [web])
(function(){
 const vStats = {
  indexedItems: typeof BIO !== "undefined" ? !!BIO.INDEX_ITEMS : false,
  lodMerge: typeof BIO !== "undefined" && BIO.LOD ? !!BIO.LOD.merge : false,
  lodFade: typeof BIO !== "undefined" && BIO.LOD ? BIO.LOD.fade : 0,
  dilatedCards: 0,
  roughAAMats: 0,
  baseGroundVerts: 0
 };

 const dilatedSeen = new WeakMap();

 function buildDilatedCardCanvas(img, meanLum){
  if (dilatedSeen.has(img)) return dilatedSeen.get(img);
  const w0 = img.naturalWidth || img.width, h0 = img.naturalHeight || img.height;
  const w = w0 > 0 ? w0 : 256, h = h0 > 0 ? h0 : 256;
  const lum = Math.max(0.25, Math.min(0.88, meanLum == null ? 0.66 : meanLum));
  const r8 = Math.round(lum * 212), g8 = Math.round(lum * 242), b8 = Math.round(lum * 194);
  const bleed = document.createElement("canvas");
  bleed.width = w; bleed.height = h;
  const bx = bleed.getContext("2d");
  bx.fillStyle = "rgb(" + r8 + "," + g8 + "," + b8 + ")";
  bx.fillRect(0, 0, w, h);
  const offs = [[-3,0],[3,0],[0,-3],[0,3],[-2,-2],[2,-2],[-2,2],[2,2],[-1,0],[1,0],[0,-1],[0,1]];
  for (let i = 0; i < offs.length; i++) {
   bx.drawImage(img, offs[i][0], offs[i][1], w, h);
  }
  bx.drawImage(img, 0, 0, w, h);
  const mask = document.createElement("canvas");
  mask.width = w; mask.height = h;
  const mx = mask.getContext("2d");
  mx.fillStyle = "rgba(255,255,255,0.008)";
  mx.fillRect(0, 0, w, h);
  mx.drawImage(img, 0, 0, w, h);
  bx.globalCompositeOperation = "destination-in";
  bx.drawImage(mask, 0, 0, w, h);
  bx.globalCompositeOperation = "source-over";
  dilatedSeen.set(img, bleed);
  vStats.dilatedCards++;
  return bleed;
 }

 function applyRoughAA(mat, tagKey, mipVars){
  if (!mat || !mat.isMeshStandardMaterial || typeof KHOOK === "undefined" || typeof KMAT_M1 === "undefined" || (mat.userData && mat.userData.km1RoughAA)) return;
  const vars = (Array.isArray(mipVars) && mipVars.length >= 8) ? mipVars : [0.0, 0.009, 0.024, 0.052, 0.094, 0.145, 0.195, 0.245];
  const vLo = new THREE.Vector4(vars[0], vars[1], vars[2], vars[3]);
  const vHi = new THREE.Vector4(vars[4], vars[5], vars[6], vars[7]);
  mat.userData = mat.userData || {};
  mat.userData.km1RoughAA = true;
  mat.extensions = Object.assign({}, mat.extensions || {}, { derivatives: true });
  KHOOK.add(mat, "km1-rough-aa-" + tagKey, {
   uniforms: () => ({
    uKm1VarLo: { value: vLo },
    uKm1VarHi: { value: vHi },
    uKm1TexSz: { value: 512.0 }
   }),
   vertex: {
    head: "varying vec2 vKm1Uv;\n",
    at: [{ at: "uv_vertex", after: "vKm1Uv = uv;" }]
   },
   fragment: {
    head: "uniform vec4 uKm1VarLo;\nuniform vec4 uKm1VarHi;\nuniform float uKm1TexSz;\nvarying vec2 vKm1Uv;\n" + KMAT_M1.GLSL_COMMON + "\n",
    at: [{ at: "roughnessmap_fragment", after: "roughnessFactor = km1RoughAA(roughnessFactor, dFdx(vKm1Uv), dFdy(vKm1Uv), uKm1TexSz, uKm1VarLo, uKm1VarHi);" }]
   }
  });
  vStats.roughAAMats++;
 }

 if (typeof scene !== "undefined" && scene) {
  const hookedTex = new Set();
  const seenMat = new Set();
  const mvKeys = typeof KMAT_MIPVAR !== "undefined" ? Object.keys(KMAT_MIPVAR) : [];
  const defaultMv = mvKeys.length ? KMAT_MIPVAR[mvKeys[0]] : null;

  scene.traverse(function(o){
   if (!o.isMesh || !o.material) return;
   const mats = Array.isArray(o.material) ? o.material : [o.material];
   for (let mi = 0; mi < mats.length; mi++) {
    const m = mats[mi];
    if (!m || seenMat.has(m)) continue;
    seenMat.add(m);

    if (m.userData && m.userData.libCard && m.map && typeof KMAT !== "undefined" && KMAT.mode === "lib" && KMAT.packed) {
     const lc = m.userData.libCard;
     const L = KMAT.packed("compasshills", lc.slot);
     if (L && KMAT.textures) {
      const rootTex = KMAT.textures(L, { aniso: 4, flipY: false }).map;
      if (rootTex) {
       const applyImg = function(rawImg){
        if (!rawImg || rawImg.tagName === "CANVAS") return;
        const dilated = buildDilatedCardCanvas(rawImg, L.mean);
        rootTex.image = dilated;
        rootTex.needsUpdate = true;
        if (m.map !== rootTex) {
         m.map.image = dilated;
         m.map.needsUpdate = true;
        }
       };
       if (rootTex.image) applyImg(rootTex.image);
       else if (!hookedTex.has(rootTex)) {
        hookedTex.add(rootTex);
        (rootTex._onImage = rootTex._onImage || []).push(applyImg);
       }
      }
     }
    }

    if (m.isMeshStandardMaterial && m !== (typeof MAT_GROUND !== "undefined" ? MAT_GROUND : null) && m !== (typeof GROUND_MAT !== "undefined" ? GROUND_MAT : null)) {
     const libRec = m.userData && m.userData.lib;
     const mv = (libRec && libRec.mipVariance) || defaultMv;
     applyRoughAA(m, "m" + vStats.roughAAMats, mv);
    }
   }

   if (!o.isInstancedMesh && o.userData && o.userData.biome && typeof terrainH === "function") {
    const g = o.geometry, P = g && g.attributes && g.attributes.position, C = g && g.attributes && g.attributes.color;
    if (P && C) {
     o.updateMatrixWorld();
     const e = o.matrixWorld.elements, n = P.count;
     for (let i = 0; i < n; i++) {
      const lx = P.getX(i), ly = P.getY(i), lz = P.getZ(i);
      const wx = e[0] * lx + e[4] * ly + e[8] * lz + e[12];
      const wy = e[1] * lx + e[5] * ly + e[9] * lz + e[13];
      const wz = e[2] * lx + e[6] * ly + e[10] * lz + e[14];
      const agl = wy - terrainH(wx, wz);
      if (agl >= -0.6 && agl <= 0.36) {
       const t = Math.max(0, Math.min(1, agl / 0.36));
       const ao = 0.74 + 0.26 * (t * t * (3 - 2 * t));
       C.setXYZ(i, C.getX(i) * ao, C.getY(i) * ao, C.getZ(i) * ao);
       vStats.baseGroundVerts++;
      }
     }
     C.needsUpdate = true;
    }
   }
  });
 }

 if (typeof BIO !== "undefined" && typeof BIO.setA2C === "function" && typeof renderer !== "undefined") {
  try { BIO.setA2C(renderer); } catch (e) {}
 }
 const gMesh = typeof GROUND !== "undefined" ? GROUND : null;
 if (typeof KDRAWN !== "undefined" && KDRAWN.sources && KDRAWN.sources.length === 0 && gMesh) {
  try {
   gMesh.updateMatrixWorld(true);
   KDRAWN.add(KDRAWN.fromObject(gMesh));
  } catch (e) {}
 }
 window._vstack = vStats;
})();
