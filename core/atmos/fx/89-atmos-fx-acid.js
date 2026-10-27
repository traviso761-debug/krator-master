// ================================================================= ATMOS — fx: acid rain (tinted rain, fizzing water, etched metal and stone)
// [G data] + [web] + [G shader] (the Valley of the Ancients, planned; the owner, 2026-10-26, through core/hazard's acid-rain
// row). The look and the fields the hazard module doses by. Placeholders until the Valley has a plan: every pH below.
//   THE FIELDS (to core/hazard's ambient bridge, KHAZ.provide; guarded, a page without KHAZ just has the look)
//     'rain'  mm an hour at (x, y, z): the weather's rain (W.rain x mmh), or the rain wall's field there when one stands
//             (fx/89-atmos-fx-rainwall.js), times 1 - o.cover(x, y, z) (0 open .. 1 under a roof: the page's own test; the
//             GPU's rain cover map is not readable on the CPU)
//     'ph'    the rain's acidity: o.ph, a number or a function (x, z) (the Valley's acid against clean rain elsewhere, 5.6)
//   THE LOOK
//     the rain   tinted from its own colour toward a sickly yellow-green (PRESETS.acid.tint) as the pH at the eye falls
//                (ATMOS.acidTint): the weather's streaks take the colour as a uniform
//     etch       0..1 at the eye: a base for what the place has taken over the years (o.etch, default from the pH) that
//                grows while acid rain falls (ATMOS.acidStep: rate x k, where k is core/hazard's own ramp, pH 4 to 1 times
//                rain 0 to 10 mm/h) and never falls back. ATMOS.acidOn(material, {kind}) draws it: 'metal' pits and a
//                green-brown tarnish, 'stone' a bleached crust and pale streaks down steep faces
//     fizz       0..1: while acid rain falls, standing water ('water': ATMOS.acidOn on a puddle or pool material) carries
//                popping bubble rings and a faint yellow fume over its colour
//   Exposure: with the rain cover (fx/89-atmos-fx-raincover.js) nothing sheltered etches or fizzes.
//   ATMOS.acidK(ph, mmh)                core/hazard's acid-rain ramp (pH 4 -> 1) x (rain 0 -> 10 mm/h), 0..1 (pure)
//   ATMOS.acidTint(ph, clean)           the rain's colour at a pH (pure)
//   ATMOS.acidStep(S, ph, mmh, dt)      one step of the etch (S.etch), pure
//   ATMOS.acidRain(o) -> S              the host: o {ph (number or fn(x, z), default 4), mmh (mm/h at W.rain 1, default 20),
//                                       cover (x, y, z) -> 0..1, etch (the base, 0..1), rate (etch a second at k 1, default
//                                       1/600), fields (default true: provide 'rain' and 'ph' to KHAZ)}. After ATMOS.weather.
//   ATMOS.acidOn(material, {kind})      kind 'metal' | 'stone' | 'water' (a KHOOK layer)
// Without ATMOS.acidRain the rain, the weather record and every material are what they were. Textures: procedural until
// `metal.etched` and `stone.acidstreak` arrive (core/materials/PROMPTS-NEEDED.md, section 33).
// Godot: GODOT.md, "Acid rain".
(function(){const A=ATMOS;
 A.PRESETS.acid={tint:[.80,.86,.42],clean:5.6,tintAt:2,etchRate:1/600,mmh:20,fume:[.78,.82,.52]};
 const ramp=(x,a,b)=>Math.min(1,Math.max(0,(x-a)/(b-a)));
 A.acidK=(ph,mmh)=>ph==null||mmh==null?0:ramp(ph,4,1)*ramp(mmh,0,10);
 A.acidTint=(ph,clean)=>{const P=A.PRESETS.acid,c=clean||A.PRESETS.rain.color,t=A.ss(P.clean,P.tintAt,ph==null?P.clean:ph);return c.map((v,i)=>v+(P.tint[i]-v)*t);};
 A.acidStep=(S,ph,mmh,dt)=>{S.etch=Math.min(1,(S.etch||0)+dt*(S.rate==null?A.PRESETS.acid.etchRate:S.rate)*A.acidK(ph,mmh));return S;};
 A.acidGLSL=()=>['#ifndef ATM_ACID_CHUNK','#define ATM_ACID_CHUNK',
  'uniform vec4 atmAcid;',   /* etch, fizz, time, exposure off (1: no rain cover) */
  'uint atmAcH(uvec3 c){uint h=(c.x*1597334677u)^(c.y*3812015801u)^(c.z*2246822519u);h^=h>>16u;h*=2146121005u;h^=h>>15u;h*=2221713035u;h^=h>>16u;return h;}',
  'float atmAcU(vec3 p){return float(atmAcH(uvec3(ivec3(floor(p))+ivec3(1<<20))))/4294967296.0;}',
  // metal: pits a few cm across, more of them as the etch grows
  'float atmAcidPits(vec3 wp){vec3 c=wp*25.0;float u=atmAcU(c);float d=length(fract(c)-0.5);return step(1.0-atmAcid.x*0.6,u)*smoothstep(0.45,0.12,d);}',
  // stone: pale streaks down a steep face, in columns along it, broken every couple of metres
  'float atmAcidStreak(vec3 wp,vec3 n){vec2 a=abs(n.x)>abs(n.z)?wp.zy:wp.xy;float col=floor(a.x*6.0);float u=atmAcU(vec3(col,7.0,3.0)),v=atmAcU(vec3(col,floor(a.y*0.5),5.0));',
  ' return step(1.0-atmAcid.x*0.7,u)*(0.5+0.5*v)*(1.0-abs(fract(a.x*6.0)-0.5)*2.0)*(1.0-abs(n.y));}',
  // water: bubble rings in 12 cm cells, each popping on its own period
  'float atmAcidFizz(vec3 wp){vec2 c=wp.xz*8.0,i=floor(c),f=fract(c)-0.5;float u=atmAcU(vec3(i,11.0));float ph=fract(atmAcid.z*(0.6+u)+u*9.0);',
  ' vec2 o=(vec2(atmAcU(vec3(i,12.0)),atmAcU(vec3(i,13.0)))-0.5)*0.4;return smoothstep(0.05,0.0,abs(length(f-o)-(0.05+0.15*ph)))*step(u,atmAcid.y)*(1.0-ph);}',
  'vec3 atmAcidAlbedo(vec3 c,vec3 wp,vec3 n,int kind,float open){float e=atmAcid.x*open*smoothstep(-0.3,0.2,n.y+0.4);float l=dot(c,vec3(0.3,0.55,0.15));',
  ' if(kind==0){c=mix(c,vec3(0.42,0.48,0.30)*(0.6+l),e*0.35);c=mix(c,c*0.35,atmAcidPits(wp)*e);}',
  ' else if(kind==1){c=mix(c,vec3(l*1.1+0.08),e*0.35);c=mix(c,vec3(0.86,0.86,0.80),atmAcidStreak(wp,n)*e*0.5);}',
  ' else{float f=atmAcid.y*open;c=mix(c,vec3('+A.PRESETS.acid.fume.map(A.glf).join(',')+'),f*0.15);c+=vec3(0.55)*atmAcidFizz(wp)*f;}',
  ' return c;}','#endif'].join('\n');
 const KIND={metal:0,stone:1,water:2};
 A.acidOn=(mat,o)=>{o=o||{};const kind=KIND[o.kind]==null?1:KIND[o.kind];
  A.U.acid=A.U.acid||{value:new A.T.Vector4()};
  const K=A.KH();return K.add(mat,'atm-acid-'+kind,function(sh){sh.uniforms.atmAcid=A.U.acid;const cov=!!(A.rainCoverUniforms&&A.U.rainOcc);if(cov)A.rainCoverUniforms(sh.uniforms);
   const V='varying vec3 vAtmAcP;varying vec3 vAtmAcN;';
   const AV='vec4 atmAcWp=vec4(transformed,1.0);vec3 atmAcN=objectNormal;\n#ifdef USE_INSTANCING\natmAcWp=instanceMatrix*atmAcWp;atmAcN=mat3(instanceMatrix)*atmAcN;\n#endif\nvAtmAcP=(modelMatrix*atmAcWp).xyz;vAtmAcN=normalize(mat3(modelMatrix)*atmAcN);';
   sh.vertexShader=K.inject(K.rep(sh.vertexShader,'#include <common>','#include <common>\n'+V),{at:'project_vertex',after:AV,fallback:{at:'fog_vertex',before:AV}});   /* a leaf card's sway replaced <project_vertex>: before <fog_vertex> */
   sh.fragmentShader=A.repLit(this)(K.rep(sh.fragmentShader,'#include <common>','#include <common>\n'+V+(cov?A.rainCoverGLSL()+'\n':'')+A.acidGLSL()),'#include <emissivemap_fragment>',
    '{vec3 atmAcNf=normalize(vAtmAcN);float atmAcO='+(cov?'atmRainOpen(vAtmAcP)':'1.0')+';diffuseColor.rgb=atmAcidAlbedo(diffuseColor.rgb,vAtmAcP,atmAcNf,'+kind+',atmAcO);'+
    (kind===0?'\n#if defined(STANDARD)\nroughnessFactor=mix(roughnessFactor,0.85,atmAcid.x*0.6);\n#endif\n':'')+'}\n#include <emissivemap_fragment>');});};
 A.acidRain=function(o){o=o||{};const T=A.T,U=A.U,h=A.h||{},cam=h.camera,P=A.PRESETS.acid,W=A.W;if(!W)A.err('acidRain: call ATMOS.weather first');
  const phAt=typeof o.ph==='function'?o.ph:((v)=>()=>v)(o.ph==null?4:o.ph),mmh=o.mmh==null?P.mmh:o.mmh,cover=o.cover||null;
  // the rain at a point: the weather's own (its mode's target where a rain wall lifts it under the eye), or the wall's field
  const rainAt=(x,y,z)=>{const Wn=A.W||{},R=A.rainwall;let r=Wn.rain||0;if(R&&!R.off)r=Math.max(A.weatherTarget(Wn.mode,h.hour?h.hour():12).rain,R.rain*R.at(x,z));
   return r*mmh*(cover?1-Math.min(1,Math.max(0,cover(x,y,z))):1);};
  const ph0=phAt(cam?cam.position.x:0,cam?cam.position.z:0);
  const S=A.acid={phAt,rainAt,mmh,etch:o.etch==null?.6*A.ss(5,2,ph0):o.etch,rate:o.rate==null?P.etchRate:o.rate,fizz:0,ph:ph0};
  U.acid=U.acid||{value:new T.Vector4()};U.acidC={value:new T.Color().setRGB(...A.acidTint(ph0))};
  // the weather's streaks take the tint as a uniform (their colour is a literal in 4-weather's shader)
  const rm=A.rainMat,lit='vec3('+A.PRESETS.rain.color.map(A.glf).join(',')+')';
  if(rm&&rm.fragmentShader.indexOf(lit)>=0){rm.uniforms.atmAcidC=U.acidC;rm.fragmentShader=rm.fragmentShader.replace('uniform float light;','uniform float light;uniform vec3 atmAcidC;').replace(lit,'atmAcidC');rm.needsUpdate=true;}
  S.step=(t,hr,dt)=>{const x=cam?cam.position.x:0,y=cam?cam.position.y:0,z=cam?cam.position.z:0;S.ph=phAt(x,z);const r=rainAt(x,y,z);
   if(dt>0)A.acidStep(S,S.ph,r,dt);S.fizz=A.ss(5,2,S.ph)*Math.min(1,r/10);
   U.acid.value.set(S.etch,S.fizz,t,0);U.acidC.value.setRGB(...A.acidTint(S.ph));};
  S.step(0,12,0);A.hook(S.step);
  if(o.fields!==false)S.provided=A.khaz('rain',(x,y,z)=>rainAt(x,y,z))&A.khaz('ph',(x,y,z)=>phAt(x,z))?true:false;
  const wr=A.fx.find(r=>r.type==='weather');if(wr)wr.acid={ph:typeof o.ph==='function'?'field':ph0,mmh};
  A.rec('acidrain',{ph:typeof o.ph==='function'?'field':ph0,clean:P.clean,mmh,tint:P.tint,tintAt:P.tintAt,etch:S.etch,rate:S.rate,fields:!!S.provided,
   note:'k = ramp(ph 4 -> 1) x ramp(rain mm/h 0 -> 10) (core/hazard acid-rain); etch += rate k dt, never falls; rain tint = mix(rain colour, tint, smoothstep(clean, tintAt, ph)); fizz = smoothstep(5, 2, ph) x min(1, mm/h / 10) (fx/89-atmos-fx-acid.js)'});
  return S;};
})();
