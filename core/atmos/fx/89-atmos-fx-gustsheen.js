// ================================================================= ATMOS — fx: wind over the crop rows (the gust's sheen and sway)
// [G shader] (ATMOS.gustOn: a KHOOK layer) + [G data] (ATMOS.gustAt: the JS twin of the shared gust). biomes/ancientsvalley/
// PLAN.md 15 (the owner, 2026-11-10: the Terraces' crop rows and orchards gone to thicket). When a gust front rolls across a
// field, the stems bend downwind and turn their paler undersides up: a band of light runs over the field with the front.
// Both read core/atmos's travelling gust (atmGust in ATMOS.GLSL_WIND, the one the foliage sways by: core/biome
// 30-core-foliage.js), so the sheen and the sway of a kit's plants agree; a crop mesh that has no sway of its own takes it here.
//   ATMOS.gustOn(material, o)   o: {sheen (0..1, default .35: how much paler the band), sway (m of lean at the top a metre up,
//                               0 for a material that already sways, default .25), height (m: the plant's height, for the
//                               sway's bend, default 1)}; the layer reads the instance's or the mesh's world root for the gust
//   ATMOS.gustAt(t, x, z) -> g  the gust factor at a point (the shader's atmGust, on ATMOS.PRESETS.wind and the base wind)
// Without ATMOS.gustOn every material is what it was. Recorded for ATMOS.export() as {type: 'gust', sheen, sway}.
(function(){const A=ATMOS;
 A.PRESETS.gust={sheen:.35,sway:.25,height:1,tint:[.86,.85,.70]};
 const num=(v,x)=>v==null?x:v,F=v=>A.glf(v);
 // the JS twin of GLSL_WIND's atmGust (89-atmos-0-core.js), on the base wind: a front moving downwind at frontSpeed
 A.gustAt=(t,x,z,w)=>{const PW=A.PRESETS.wind;w=w||PW.base;const L=Math.max(Math.hypot(w[0],w[1]),1e-3),s=t-(x*w[0]+z*w[1])/L/PW.frontSpeed;
  return PW.gust.reduce((a,g)=>a+g[0]*Math.sin(s*g[1]+g[2]),0);};
 A.gustOn=(mat,o)=>{o=o||{};const K=A.KH(),P=A.PRESETS.gust,sheen=num(o.sheen,P.sheen),sway=num(o.sway,P.sway),hgt=num(o.height,P.height);
  K.add(mat,'atm-gust',function(sh){Object.assign(sh.uniforms,{atmGT:A.U.time,atmGW:A.U.wind,atmGA:A.U.gustAmp});
   const V='varying vec3 vAtmGP;varying float vAtmGH;uniform float atmGT;uniform vec2 atmGW;uniform float atmGA;\n'+A.GLSL_WIND.replace(/atmGust/g,'atmGustG').replace(/atmWind/g,'atmWindG');   /* renamed: a foliage material already holds its own copy */
   /* the root: the instance's (or the mesh's) origin in world space; the bend grows with the square of the height up the plant */
   const AV='vec4 atmGR=vec4(0.0,0.0,0.0,1.0);vec4 atmGP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\natmGR=instanceMatrix*atmGR;atmGP=instanceMatrix*atmGP;\n#endif\n'+
    'atmGR=modelMatrix*atmGR;atmGP=modelMatrix*atmGP;float atmGh=clamp((atmGP.y-atmGR.y)/'+F(hgt)+',0.0,1.5);float atmGg=1.0+atmGA*atmGustG(atmGT,atmGR.xz,atmGW);'+
    'vAtmGH=atmGh;vAtmGP=atmGR.xyz;'+(sway>0?'vec2 atmGd=atmGW/max(length(atmGW),0.001);atmGP.xz+=atmGd*atmGh*atmGh*'+F(sway)+'*max(atmGg,0.0);atmGP.y-=atmGh*atmGh*'+F(sway*.3)+'*max(atmGg,0.0);'+
    'gl_Position=projectionMatrix*viewMatrix*atmGP;':'');
   sh.vertexShader=K.inject(K.rep(sh.vertexShader,'#include <common>','#include <common>\n'+V),{at:'project_vertex',after:AV,fallback:{at:'fog_vertex',before:AV}});
   sh.fragmentShader=A.repLit(this)(K.rep(sh.fragmentShader,'#include <common>','#include <common>\n'+V),'#include <emissivemap_fragment>',
    '{float atmGs=smoothstep(0.15,0.9,atmGA*atmGustG(atmGT,vAtmGP.xz,atmGW))*smoothstep(0.1,0.6,vAtmGH);float l=dot(diffuseColor.rgb,vec3(0.3,0.55,0.15));'+
    'diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(l),vec3('+P.tint.map(F).join(',')+'),0.5)*1.35,atmGs*'+F(sheen)+');}\n#include <emissivemap_fragment>');});
  A.rec('gust',{sheen,sway,height:hgt});};
})();
