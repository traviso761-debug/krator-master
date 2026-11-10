// ================================================================= CORE FURNISH — the draw adapter's helpers ([draw])
// The three.js side of core/furnish: a placement record into the catalog's batch (KratorFurniture), and the one
// colour step every build needs when the batch becomes meshes. The catalog writes its colours as sRGB bytes; a
// build that renders in linear light converts them once, either in the vertex shader or into a float attribute.
// Each build keeps its own flush (it ties the meshes to its night lights and shadows); these are the parts the
// six copies shared.
//
//   KFURN.useBatch(R, KF, KI, opt)       -> R.batch (a KratorFurniture batch, KF.batch(opt): { indexed: true } keeps the
//                                           pieces' indices) and R.adapter (KratorInteriors' runtime adapter over it,
//                                           for the interiors hook); call again for a fresh batch
//   KFURN.drawRec(R, rec, wealth, opt)   -> the batch's result for one record ({ lights, error, ... }); opt.detail
//                                           sets KratorFurniture's detail for this piece and restores it; a record with
//                                           a scale (cfg.scale, opt-in: 50-core-furnish.js) is drawn that many times its
//                                           size about its foot (x, y, z), its lights moved with it
//   KFURN.srgbHook(shader)               -> an onBeforeCompile body: linearise vColor in the vertex shader
//   KFURN.linearColours(geometry)        -> the colour attribute's sRGB bytes as linear floats (KFURN.SRGB_LIN)
(function(){
'use strict';
if(typeof KFURN === 'undefined') throw new Error('52-core-furnish-draw: load 50-core-furnish.js first');
KFURN.useBatch = function(R, KF, KI, opt){ R.batch = KF.batch(opt); R.adapter = KI ? KI.runtimeAdapter(KF, R.batch) : null; R.KF = KF; return R.batch; };
KFURN.drawRec = function(R, rec, wealth, opt){
  const KF = R.KF, d = opt && opt.detail;
  if(d != null) KF.setDetail(d);
  const k = rec.scale, B = R.batch, po = { variant: rec.variant, seed: rec.seed, wealth: wealth, building: rec.building, setting: rec.setting };
  let r;
  if(k != null && k !== 1){
    /* the piece's group is built in world space at its foot: scale it about that point before the batch absorbs it */
    const x0 = rec.x, y0 = rec.y || 0, z0 = rec.z;
    B.absorb = function(g){ g.scale.setScalar(k); g.position.set(x0 * (1 - k), y0 * (1 - k), z0 * (1 - k)); g.updateMatrixWorld(true);
      return Object.getPrototypeOf(B).absorb.call(B, g); };
    try { r = B.place(rec.key, rec.x, rec.y, rec.z, rec.ry, po); } finally { delete B.absorb; }
    for(const L of (r.lights || [])){ L.x = x0 + (L.x - x0) * k; L.y = y0 + (L.y - y0) * k; L.z = z0 + (L.z - z0) * k; if(L.distance) L.distance *= k; }
  } else r = B.place(rec.key, rec.x, rec.y, rec.z, rec.ry, po);
  if(d != null) KF.setDetail(opt.after == null ? .5 : opt.after);
  return r;
};
KFURN.srgbHook = function(sh){
  sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>',
    '#include <color_vertex>\n#ifdef USE_COLOR\n  vColor.rgb = pow(max(vColor.rgb, vec3(0.0)), vec3(2.2));\n#endif');
};
KFURN.linearColours = function(geo){
  const a = geo.getAttribute('color'); if(!a || a.array instanceof Float32Array) return;
  const src = a.array, out = new Float32Array(src.length), L = KFURN.SRGB_LIN;
  for(let i=0;i<src.length;i++) out[i] = L[src[i]];
  geo.setAttribute('color', new THREE.BufferAttribute(out, a.itemSize || 3));
};
})();
