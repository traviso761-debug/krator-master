// ================================================================= CORE FURNISH — the draw adapter's helpers ([draw])
// The three.js side of core/furnish: a placement record into the catalog's batch (KratorFurniture), and the one
// colour step every build needs when the batch becomes meshes. The catalog writes its colours as sRGB bytes; a
// build that renders in linear light converts them once, either in the vertex shader or into a float attribute.
// Each build keeps its own flush (it ties the meshes to its night lights and shadows); these are the parts the
// six copies shared.
//
//   KFURN.useBatch(R, KF, KI)            -> R.batch (a KratorFurniture batch) and R.adapter (KratorInteriors' runtime
//                                           adapter over it, for the interiors hook); call again for a fresh batch
//   KFURN.drawRec(R, rec, wealth, opt)   -> the batch's result for one record ({ lights, error, ... }); opt.detail
//                                           sets KratorFurniture's detail for this piece and restores it
//   KFURN.srgbHook(shader)               -> an onBeforeCompile body: linearise vColor in the vertex shader
//   KFURN.linearColours(geometry)        -> the colour attribute's sRGB bytes as linear floats (KFURN.SRGB_LIN)
(function(){
'use strict';
if(typeof KFURN === 'undefined') throw new Error('52-core-furnish-draw: load 50-core-furnish.js first');
KFURN.useBatch = function(R, KF, KI){ R.batch = KF.batch(); R.adapter = KI ? KI.runtimeAdapter(KF, R.batch) : null; R.KF = KF; return R.batch; };
KFURN.drawRec = function(R, rec, wealth, opt){
  const KF = R.KF, d = opt && opt.detail;
  if(d != null) KF.setDetail(d);
  const r = R.batch.place(rec.key, rec.x, rec.y, rec.z, rec.ry, { variant: rec.variant, seed: rec.seed, wealth: wealth,
    building: rec.building, setting: rec.setting });
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
