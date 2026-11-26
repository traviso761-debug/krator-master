// ================================================================= ATMOS — fx: a lava surface (a lake, a field, a channel)
// [G shader] One shared lava shader (TODO.md, "Lava"; 2026-10-25, lifted from the Throne caldera's lake, biomes/throne/
// stations/caldera/86-host-caldera.js): a crust of big dark PLATES (a moving, warped Voronoi) with glowing cracks between them,
// each plate broken into small FACETS riding it (a second, finer Voronoi), each facet tilted its own way and lit by the sun,
// thin glowing seams between the facets, some thin enough that the heat glows through; a plate now and then OVERTURNS. The
// surface heaves in slow swells (in the vertex shader) and domes over its vents in an eruption. Everything moves on the
// module clock (ATMOS.clock: a pinned clock stills it); the night raises the heat; `erupt` (0..1, the host eases it) widens
// the cracks, overturns the plates more often and churns patches to bright lava. A FLOW (o.flow [dx, dz] in m/s) slides the
// crust downstream: a channel or a lava field on a slope (TODO.md: a downslope flow map is the next step; a constant drift per
// surface today). The noise is an INTEGER hash (lowbias32, as the cloud deck's: the same bits in every engine), never sin.
//
// In the SUBFOLDER core/atmos/fx/ on purpose: builds that pool core/atmos's top level are unchanged; a build opts in by path.
// Needs 89-atmos-0-core.js (ATMOS.init done: the clock and the night) and three.js r128 on WebGL2 (GLSL ES 3: uint).
//
//   ATMOS.lavaMaterial(o)  -> a ShaderMaterial for a lava surface mesh (flat, at its level: the shader lifts it by the swell)
//      o: {name, centre:[x, z] (where its pattern is anchored), sun:[x, y, z] (toward the sun), crust: a texture (the library's
//         ground.lava for the grain, or null), vents:[[x, z, strength], ...] (up to 4: domes in an eruption), erupt: {value}
//         (a uniform the host eases; default its own, 0), swell: false (no heave: a thin flow), flow:[dx, dz] (m/s),
//         scale (1: the plates and facets' size, times this: a narrow stream takes ~.05), crack (1: the cracks' width, times this), heat (1: a cooler or hotter body), night: {value} (the host's own night, else ATMOS's), preset (a PRESETS name, default 'lava')}
//         vents may also be the host's own four THREE.Vector3 (x, z, strength), read live; channel: {width (m), speed (m/s)}:
//         a stream whose mesh carries aF (across 0..1, along in metres), its crust carried down it, torn and cooler at the banks
//      The material's uniforms: uErupt, uNight (ATMOS's), the module clock; m.userData.lava = the record
//   ATMOS.lavaGLSL(P)       the fragment chunk (lavaSurface) written from a preset, for a host that patches its own material
//   PRESETS.lava            the numbers (set here when a build's presets have none, so no other build changes)
// Recorded for ATMOS.export() as {type:'lava', name, centre, flow, vents, preset}. Godot: a .gdshader of the same chunk, EMISSION
// from the cracks, the seams and the thin facets (GODOT.md, "Lava").
(function(){const A=ATMOS;
 A.PRESETS.lava=A.PRESETS.lava||{
  plates:{cell:52.6,crack:[.035,.035],eruptCrack:.07,overturn:.975,overturnErupt:.25,warp:8},   // the big crust plates (~50 m)
  facets:{cell:9.1,seam:[.012,.035],warp:2.2,thin:.82},                                          // the facets riding them (~9 m)
  drift:[.004,.003],                                     // the crust's own slow slide (lattice units per second), times 1+3 erupt
  swell:[1.3,.7,.35],                                    // the heave's three waves (m)
  crust:[[.07,.06,.055],[.36,.31,.27]],                  // dark and light crust (linear-ish, as the caldera wrote them)
  hot:[[1,.3,.04],[1,.78,.32]],seamCol:[1,.42,.07],thinCol:[.85,.18,.02],
  heat:{day:1.3,night:1.6,erupt:1.2}};
 const f=v=>A.glf(v),v3=c=>'vec3('+c.map(f).join(',')+')';
 A.lavaGLSL=P=>{const Pl=P.plates,Fa=P.facets;return[
  'uint lavaHashU(uvec2 c){uint h=(c.x*1597334677u)^(c.y*3812015801u);h^=h>>16u;h*=2146121005u;h^=h>>15u;h*=2221713035u;h^=h>>16u;return h;}',
  'vec2 lavaH2(vec2 p){uint h=lavaHashU(uvec2(ivec2(floor(p))+ivec2(1<<20)));return vec2(float(h&65535u),float(h>>16u))/65535.0;}',
  'float lavaVn(vec2 p){vec2 i=floor(p),q=p-i;q=q*q*(3.0-2.0*q);return mix(mix(lavaH2(i).x,lavaH2(i+vec2(1,0)).x,q.x),mix(lavaH2(i+vec2(0,1)).x,lavaH2(i+vec2(1,1)).x,q.x),q.y);}',
  // the crust is torn, not ruled: the Voronoi's coordinates warped by two octaves of noise, so every edge wiggles
  'vec2 lavaWarp(vec2 p){return vec2(lavaVn(p*0.09)+0.5*lavaVn(p*0.31+7.0),lavaVn(p*0.09+3.1)+0.5*lavaVn(p*0.31+11.0))-0.75;}',
  // a moving Voronoi: F1, F2, F2-F1 (the edge), the cell's id (a swing of .3: with a 3x3 search F2 stays the true second)
  'vec3 lavaVor(vec2 p,float tm,out vec2 id){vec2 c=floor(p),q=p-c;float F1=8.0,F2=8.0;id=vec2(0.0);',
  ' for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j)),o=lavaH2(c+g);o=0.5+0.3*sin(tm+6.2831*o);vec2 r=g+o-q;float d=dot(r,r);',
  '  if(d<F1){F2=F1;F1=d;id=c+g;}else if(d<F2)F2=d;}return vec3(sqrt(F1),sqrt(F2),sqrt(F2)-sqrt(F1));}',
  // the surface's colour at lp (metres from the anchor): t the clock, erupt, night, flow (m/s), N0 the swell's normal; returns
  // the colour and, in hotK, how much of it is glowing (for a host that wants emission or bloom)
  'vec3 lavaSurface(vec2 lp,float t,float erupt,float night,vec2 flow,vec3 N0,vec3 sunDir,vec3 camPos,vec3 wp,vec3 tex,float heatK,out float hotK){',
  ' float sp=1.0+3.0*erupt;vec2 drift=vec2('+f(P.drift[0])+','+f(P.drift[1])+')*t*sp+flow*t/'+f(Pl.cell)+';',
  ' vec2 wq=lp+lavaWarp(lp)*'+f(Pl.warp)+';vec2 pid;vec3 Pv=lavaVor(wq/'+f(Pl.cell)+'+drift,t*0.15*sp,pid);',
  ' float pw=('+f(Pl.crack[0])+'+'+f(Pl.crack[1])+'*lavaVn(lp*0.02))+'+f(Pl.eruptCrack)+'*erupt,crack=1.0-smoothstep(0.0,pw,Pv.z);',
  ' float hs=lavaH2(pid+floor(t*0.05*sp)).x,over=step('+f(Pl.overturn)+'-'+f(Pl.overturnErupt)+'*erupt,hs)*(0.5+0.5*sin(t*2.0+hs*30.0))*smoothstep(0.0,0.25,Pv.z);',
  ' vec2 wf=wq+lavaWarp(wq*2.3)*'+f(Fa.warp)+';vec2 fid;vec3 Fv=lavaVor(wf/'+f(Fa.cell)+'+drift*5.8,t*0.05*sp,fid);vec2 fh=lavaH2(fid+pid*1.31+vec2(17.0));',
  ' float sw='+f(Fa.seam[0])+'+'+f(Fa.seam[1])+'*lavaVn(wf*0.07+fh*9.0);float seam=1.0-smoothstep(0.0,sw+0.04*erupt,Fv.z);',
  ' seam*=(0.35+0.65*smoothstep(0.0,0.35,Pv.z))*smoothstep(0.0,0.4,lavaVn(wf*0.05+3.0)+0.3*fh.y);',
  ' float thin=smoothstep('+f(Fa.thin)+',1.0,fh.x)+0.6*smoothstep(0.3,0.0,Pv.z);',
  ' vec3 N=normalize(N0+vec3((fh.x-0.5)*0.9,0.0,(fh.y-0.5)*0.9)*(0.4+0.6*smoothstep(0.0,0.2,Fv.z))+vec3(tex.r-0.5,0.0,tex.g-0.5)*0.6);',
  ' float lit=0.25+0.75*max(dot(N,sunDir),0.0),spec=pow(max(dot(reflect(-sunDir,N),normalize(camPos-wp)),0.0),24.0)*0.25;',
  ' vec3 crust=mix('+v3(P.crust[0])+','+v3(P.crust[1])+',pow(tex.r,1.4)*0.85+0.15*fh.y)*lit*(1.0-night*0.8)+spec*vec3(0.75,0.7,0.65)*(1.0-night)*(0.5+tex.g);',
  ' vec3 hot=mix('+v3(P.hot[0])+','+v3(P.hot[1])+',crack*crack);float heat=('+f(P.heat.day)+'+night*'+f(P.heat.night)+'+erupt*'+f(P.heat.erupt)+')*heatK;',
  ' vec3 col=crust+'+v3(P.thinCol)+'*thin*(0.18+0.5*night+0.4*erupt)*(0.6+0.4*tex.r);',
  ' col=mix(col,'+v3(P.seamCol)+'*heat*0.75,seam*0.85);col=mix(col,hot*heat,max(crack,over));',
  ' float churn=erupt*0.25*smoothstep(0.3,0.7,lavaH2(floor(lp*0.004+t*0.02)).x);col=mix(col,hot*(1.6+night),churn);',
  ' hotK=clamp(max(max(crack,over),max(seam*0.85,churn)),0.0,1.0);return col;}'].join('\n');};
 A.lavaMaterial=o=>{o=o||{};const T=A.T,P0=A.PRESETS[o.preset||'lava'],k=o.scale==null?1:o.scale,
   kc=o.crack==null?1:o.crack,
   P=Object.assign({},P0,{plates:Object.assign({},P0.plates,{cell:P0.plates.cell*k,warp:P0.plates.warp*k,crack:P0.plates.crack.map(v=>v*kc),eruptCrack:P0.plates.eruptCrack*kc}),facets:Object.assign({},P0.facets,{cell:P0.facets.cell*k,warp:P0.facets.warp*k})}),sw=P.swell,swell=o.swell!==false,c=o.centre||[0,0],sun=o.sun||[.45,.72,-.52];
  const live=o.vents&&o.vents[0]&&o.vents[0].isVector3,vents=live?o.vents:[0,1,2,3].map(i=>{const v=o.vents&&o.vents[i];return v?new T.Vector3(v[0],v[1],v[2]==null?1:v[2]):new T.Vector3(0,0,0);});   /* live: the host's own Vector3s (x, z, strength), filled as it erupts */
  const ch=o.channel||null,flow=ch?[0,ch.speed==null?.9:ch.speed]:(o.flow||[0,0]);   /* a channel: the crust carried down it */
  const H='uniform float uLavaT,uErupt;uniform vec3 uVents[4];'+
   'float lavaHeave(vec2 p){'+(swell?'float h='+f(sw[0])+'*sin(p.x*0.011+uLavaT*0.21)*sin(p.y*0.013-uLavaT*0.17)+'+f(sw[1])+'*sin((p.x+p.y)*0.027+uLavaT*0.45)+'+f(sw[2])+'*sin(p.x*0.061-p.y*0.047+uLavaT*0.8);':'float h=0.0;')+
   ' for(int i=0;i<4;i++){vec2 d=p-uVents[i].xy;h+=uErupt*uVents[i].z*(5.0+1.5*sin(uLavaT*3.0+float(i)))*exp(-dot(d,d)/1800.0);}return h;}';
  const m=new T.ShaderMaterial({fog:true,uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{uCrust:{value:o.crust||null},uSunDir:{value:new T.Vector3(sun[0],sun[1],sun[2]).normalize()},
    uC:{value:new T.Vector2(c[0],c[1])},uFlow:{value:new T.Vector2(flow[0],flow[1])},uHeat:{value:o.heat==null?1:o.heat}}]),
   vertexShader:['#include <fog_pars_vertex>',H,'varying vec3 vWP;varying vec3 vN;',ch?'attribute vec2 aF;varying vec2 vF;':'',
    'void main(){'+(ch?'vF=aF;':'')+'vec4 wp=modelMatrix*vec4(position,1.0);vec2 p=wp.xz;float e=2.0;wp.y+=lavaHeave(p);',
    ' vN=normalize(vec3(lavaHeave(p-vec2(e,0.0))-lavaHeave(p+vec2(e,0.0)),2.0*e,lavaHeave(p-vec2(0.0,e))-lavaHeave(p+vec2(0.0,e))));',
    ' vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
   fragmentShader:['#include <fog_pars_fragment>','uniform float uLavaT,uErupt,uNight,uHeat;uniform sampler2D uCrust;uniform vec3 uSunDir;uniform vec2 uC,uFlow;varying vec3 vWP;varying vec3 vN;',
    A.lavaGLSL(P),
    ch?'varying vec2 vF;':'',
    'void main(){vec2 lp='+(ch?'vec2(vF.x*'+f(ch.width==null?6:ch.width)+',vF.y)':'vWP.xz-uC')+';float hk;',
    ' vec3 tex='+(o.crust?'texture2D(uCrust,lp*0.11).rgb;':'vec3(0.5+0.5*sin(vWP.x*0.9)*sin(vWP.z*0.8));'),
    ' vec3 col=lavaSurface(lp,uLavaT,uErupt,uNight,uFlow,vN,uSunDir,cameraPosition,vWP,tex,uHeat,hk);',
    ch?' float bank=smoothstep(0.38,0.5,abs(vF.x-0.5));col=mix(col,col*0.25,bank*hk*0.7);':'',   /* a channel: torn and cooler at its banks */
    ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
  m.uniforms.uLavaT=A.U.time;m.uniforms.uNight=o.night||A.U.night;m.uniforms.uErupt=o.erupt||{value:0};m.uniforms.uVents={value:vents};
  m.uniforms.fogColor.value=A.h.scene&&A.h.scene.fog?A.h.scene.fog.color:new T.Color(0xffffff);m.uniforms.fogDensity.value=A.h.scene&&A.h.scene.fog?A.h.scene.fog.density||0:0;
  const rec=A.rec('lava',{name:o.name||'lava',centre:c,flow,vents:live?vents.map(v=>[v.x,v.y,v.z]):(o.vents||[]).slice(0,4),swell,channel:ch,preset:o.preset||'lava'});m.userData.lava=rec;
   if(o.crust)m.uniforms.uCrust.value=o.crust;   /* merge() cloned the map before the library's image decoded, and a clone keeps no image: the original (2026-11-02, the Throne caldera's textures-decoded) */
   return m;};
})();
