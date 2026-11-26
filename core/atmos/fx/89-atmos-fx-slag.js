// ================================================================= ATMOS — fx: slag glow (a heap's dark crust split by glowing seams)
// [G data] (ATMOS.slagRec, ATMOS.slagHeat: plain arithmetic) + [G shader] (ATMOS.slagOn: a KHOOK layer on any material).
// biomes/ancientsvalley/PLAN.md 15 (the owner, 2026-11-10: the Yards' slag heaps; a furnace keeper still pours). The crust is a
// Voronoi of plates in world space (an integer hash, the same lowbias bits as fx-sludge's; never sin); the seams between the
// plates glow with the heap's heat, which is highest at the pour (a point and a radius: the fresh slag run down the heap) and
// falls with distance to the old crust's faint embers; the glow breathes slowly, plate by plate. Night does nothing to the
// glow (it is emissive) and everything to how it reads.
//   ATMOS.slagRec(o, i, seed) -> rec    o: {at: [x, y, z] the pour, r (m: the fresh run), heat (0..1 at the pour), base (0..1:
//                                       the old crust's embers), cell (m: a plate), id}
//   ATMOS.slagHeat(rec, x, y, z) -> 0..1  the heat at a point (the shader's twin before the seams: a page's heat hazard reads it)
//   ATMOS.slagOn(material, rec)         the layer: darkens the crust toward black-brown, adds the seams' glow to the emissive
// Recorded for ATMOS.export() as {type: 'slag', ...rec}. Godot: the same chunk, EMISSION.
(function(){const A=ATMOS;
 A.PRESETS.slag={salt:0x534c4147,r:12,heat:1,base:.12,cell:1.1,crust:[.10,.08,.07],ramp:[[.5,.06,.02],[1,.35,.05],[1,.78,.35]],glow:2.4,breathe:.12};
 const num=(v,x)=>v==null?x:v,F=v=>A.glf(v),c3=c=>'vec3('+c.map(F).join(',')+')';
 const kr=()=>{const K=typeof KRAND!=='undefined'?KRAND:(typeof globalThis!=='undefined'&&globalThis.KRAND);if(!K)throw new Error('atmos slag: load core/rand (KRAND) first');return K;};
 A.slagRec=(o,i,seed)=>{const P=A.PRESETS.slag;if(!o.at||o.at.length<3)throw new Error('atmos slag: at [x, y, z]');
  const R={id:o.id||'slag_'+i,at:o.at.slice(0,3),r:num(o.r,P.r),heat:num(o.heat,P.heat),base:num(o.base,P.base),cell:num(o.cell,P.cell),seed:kr().hash(num(seed,1)>>>0,i,P.salt)};
  if(!(R.r>0)||!(R.cell>0))throw new Error('atmos slag: r and cell must be above 0');if(R.heat<0||R.heat>1||R.base<0||R.base>1)throw new Error('atmos slag: heat and base are 0..1');return R;};
 A.slagHeat=(R,x,y,z)=>{const d=Math.hypot(x-R.at[0],y-R.at[1],z-R.at[2])/R.r;return Math.max(R.base,R.heat*Math.exp(-d*d));};
 A.slagGLSL=()=>{const P=A.PRESETS.slag,r=P.ramp;return ['#ifndef ATM_SLAG_CHUNK','#define ATM_SLAG_CHUNK','uniform vec4 atmSlagP;uniform vec4 atmSlagQ;',
  'uint atmSgH(uvec3 c){uint h=(c.x*1597334677u)^(c.y*3812015801u)^(c.z*2246822519u);h^=h>>16u;h*=2146121005u;h^=h>>15u;h*=2221713035u;h^=h>>16u;return h;}',
  'float atmSgU(vec3 p,float s){return float(atmSgH(uvec3(ivec3(floor(p))+ivec3(1<<20)+ivec3(int(s)))))/4294967296.0;}',
  /* the plates: 3D Voronoi, F2 - F1 the seam, the nearest cell's id for its own breath */
  'vec3 atmSgV(vec3 p,float s){vec3 i=floor(p),f=fract(p);float d1=9.0,d2=9.0;float id=0.0;for(int z=-1;z<=1;z++)for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec3 g=vec3(x,y,z);',
  ' vec3 c=i+g;vec3 o=vec3(atmSgU(c,s),atmSgU(c,s+17.0),atmSgU(c,s+31.0));float d=length(g+o-f);if(d<d1){d2=d1;d1=d;id=atmSgU(c,s+47.0);}else if(d<d2)d2=d;}return vec3(d1,d2,id);}',
  'vec3 atmSlagRamp(float h){return h<0.5?mix('+c3(r[0])+','+c3(r[1])+',h*2.0):mix('+c3(r[1])+','+c3(r[2])+',h*2.0-1.0);}',
  /* returns the crust's albedo factor (rgb) and the glow (emissive, rgb) packed: albedo in .xyz of the first, glow in the second */
  'void atmSlag(vec3 wp,float t,inout vec3 alb,inout vec3 emi){float d=length(wp-atmSlagP.xyz)/atmSlagP.w;float heat=max(atmSlagQ.y,atmSlagQ.x*exp(-d*d));',
  ' vec3 v=atmSgV(wp/atmSlagQ.z,atmSlagQ.w);float seam=1.0-smoothstep(0.0,0.06+0.12*heat,v.y-v.x);',
  ' float br=1.0+'+F(P.breathe)+'*sin(t*(0.3+0.4*v.z)+v.z*40.0);float g=seam*heat*br;',
  ' alb=mix(alb,'+c3(P.crust)+',0.85);emi+=atmSlagRamp(clamp(g,0.0,1.0))*g*'+F(P.glow)+';}','#endif'].join('\n');};
 A.slagOn=(mat,R)=>{const T=A.T,K=A.KH(),U={p:{value:new T.Vector4(R.at[0],R.at[1],R.at[2],R.r)},q:{value:new T.Vector4(R.heat,R.base,R.cell,R.seed&1023)}};
  K.add(mat,'atm-slag',function(sh){sh.uniforms.atmSlagP=U.p;sh.uniforms.atmSlagQ=U.q;sh.uniforms.atmSlagT=A.U.time;
   const V='varying vec3 vAtmSgP;',AV='vec4 atmSgW=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\natmSgW=instanceMatrix*atmSgW;\n#endif\nvAtmSgP=(modelMatrix*atmSgW).xyz;';
   sh.vertexShader=K.inject(K.rep(sh.vertexShader,'#include <common>','#include <common>\n'+V),{at:'project_vertex',after:AV,fallback:{at:'fog_vertex',before:AV}});
   sh.fragmentShader=A.repLit(this)(K.rep(sh.fragmentShader,'#include <common>','#include <common>\nuniform float atmSlagT;\n'+V+'\n'+A.slagGLSL()),'#include <emissivemap_fragment>',
    '#include <emissivemap_fragment>\n{vec3 atmSgA=diffuseColor.rgb;atmSlag(vAtmSgP,atmSlagT,atmSgA,totalEmissiveRadiance);diffuseColor.rgb=atmSgA;}');});
  A.rec('slag',JSON.parse(JSON.stringify(R)));return U;};
})();
