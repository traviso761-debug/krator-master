// ================================================================= WATER - drawing: flow, falls, plunge pools, still water, wet ground
// [draw] + [G shader]. Needs 20, 21, 22 and 50-core-water-draw.js, core/atmos (0-core, 0p-presets, a-waves; b-skylight for
// the sky in the water) bound with ATMOS.init, and three.js r128. Nothing runs at load time.
//
//   WATER.drawFlow(S, o)   a flow surface as its ribbon (22's WATER.ribbon): one mesh, the surface falling with the line;
//        the normals advected along the current (WATER.flowGLSL's wtrFlowN, twin WATER.flowNormal), white water where the
//        bed steepens and along the banks (wtrFlowFoam), the shallows paler toward the banks. o: {color, shallow, deep,
//        roughness, metalness, envMapIntensity, transparent, step, across, margin, renderOrder, origin (vertices local to
//        the ribbon's middle: a long river far out)}
//   WATER.drawFall(S, o)   a fall's curtain (WATER.curtain: it arcs), streaked with a pattern that falls with the water
//        (wtrStreak, twin WATER.fallStreak), whiter toward the foot; its plunge pool's churn (wtrPlunge, twin WATER.plungeAt)
//        as a disc at the foot; spray from core/atmos's particles where the page has them (ATMOS.smoke 'spray').
//        o: {color, opacity, rows, cols, plunge (false: none), plungeY, spray (false: none), renderOrder}
//   WATER.drawStill(S, o)  a still surface (a box or a polygon) flat at its level: the sky in it, a faint ripple, a
//        fountain's rings (wtrStillN, twin WATER.stillNormal). o: {color, roughness, metalness, envMapIntensity, opacity}
//   WATER.stillMaterial(o)  one still material for many small pools a build draws itself (an instanced trough box): the
//        ripple on their tops, the sky in them
//   WATER.wetGround(material, {surface, rain})  a ground material darkens and shines where it is wet: the beach the swash
//        reaches (a shore surface's wtrWetGround) and, with rain, every up-facing surface by the weather's W.wet (Phase 4;
//        WATER.wetGroundRain). For MeshStandard/Phong/Lambert materials; a build with its own ShaderMaterial takes
//        WATER.wetChunk(surface, uniforms) and mixes the two numbers in itself.
// Every drawing returns {mesh, material, ...}; meshes carry userData.probeSkip and lodSkip and are named 'water:<name>'.
// Options every drawing takes (2026-10-21, all off by default): depthBias (n, [factor, units] or {factor, units}: polygon offset toward the camera, the sign
// reversed to push back: a flow that sits AT an open surface's level), depthWrite (overrides the drawing's policy), pick (true: no no-op raycast and no
// probeSkip, so click-to-inspect and registered-volumes see the mesh; userData.inspectLabel = the surface's name). drawFlow also takes rapids [lo, hi]
// (this flow's own band; else the flow's S.rapids; else PRESETS.flow.rapids) and spray (true or {every, min, max, lift}: ATMOS.smoke 'spray' at the
// steep reaches, WATER.sprayPoints); drawStill takes gradient (a surface's own, see WATER.still) and tint (a hex multiplier on the colour).
// The final rebuild's options (2026-10-26, all off by default; core/water/test-rebuild.js): drawFall and drawFalls take margin (m a side the curtain runs
// past the lip, as wide as the river's ribbon there) and edge (m of side fade inside the lip's edge), and spray: 'drop' or {drop: true, every, max,
// column, top, layer} (WATER.fallSpray: emitters across the foot and up a mist column scaled to the drop, for the three fixed ones); drawFlow takes
// chute (the slope above which the ribbon gives way to the falls' curtains); drawStill, stillMaterial, drawFlow, draw and drawPools take rain: true
// (rain rings, WATER.rainRippleGLSL, scaled by the live rain, under open sky by core/atmos's cover map when it exists); wetGround takes porosity,
// puddles (a WATER.hollows record) and ripples (Lagarde's wet look, puddles in the hollows, rain rings on them; idempotent).
(function(){const W=WATER,TAU=Math.PI*2;
 const glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';},f=glf;
 const AT=()=>{try{return typeof ATMOS!=='undefined'?ATMOS:null;}catch(e){return null;}};
 const lin=(T,c)=>'vec3('+W.colLin(T,c).map(glf).join(',')+')';
 const tag=(m,S,o)=>{m.name='water:'+S.name;if(!(o&&o.pick))m.userData.probeSkip=true;m.userData.lodSkip=true;m.userData.water=S.id;if(o&&o.pick)m.userData.inspectLabel=S.name;else m.raycast=()=>{};return m;};
 // the sky's light on a material (b-skylight's capture), as WATER.draw takes it
 const sky=(mat,o)=>{const A=AT();if(o.envMapIntensity!=null)mat.envMapIntensity=o.envMapIntensity;
  A.hook(()=>{const E=A.skyEnv,tx=E&&E.target&&E.target.texture;if(tx&&mat.envMap!==tx){mat.envMap=tx;mat.needsUpdate=true;}});};
 const NOISE='float wtrHash(vec2 p){vec3 q=fract(vec3(p.xyx)*0.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}\n'+
  'float wtrNoise(vec2 p){vec2 i=floor(p);vec2 u=fract(p);u=u*u*(3.0-2.0*u);return mix(mix(wtrHash(i),wtrHash(i+vec2(1.0,0.0)),u.x),mix(wtrHash(i+vec2(0.0,1.0)),wtrHash(i+vec2(1.0,1.0)),u.x),u.y);}\n'+
  // the same noise repeating every `per` cells in y (twin: WATER.noiseP)
  'float wtrNoiseP(vec2 p,float per){vec2 i=floor(p);vec2 u=fract(p);float a=u.x*u.x*(3.0-2.0*u.x);float b=u.y*u.y*(3.0-2.0*u.y);float j0=i.y-per*floor(i.y/per);float j1=(i.y+1.0)-per*floor((i.y+1.0)/per);'+
  'float h00=wtrHash(vec2(i.x,j0));float h10=wtrHash(vec2(i.x+1.0,j0));float h01=wtrHash(vec2(i.x,j1));float h11=wtrHash(vec2(i.x+1.0,j1));return (h00*(1.0-a)+h10*a)*(1.0-b)+(h01*(1.0-a)+h11*a)*b;}';

 W.noiseGLSL=NOISE;   // (the value noises' GLSL, for the fragments in core/water/ext that draw their own surfaces)
 // rain rings on a drawing's normal (o.rain, 2026-10-26): the chunk to add to its fragment, the normal expression, the cache key's tail
 W.rainOn=(o,u)=>o&&o.rain?'\n'+W.rainChunk(u):'';
 W.rainN=(o,n,p2,p3)=>o&&o.rain?'wtrRainN('+n+',wtrRainRipple('+p2+',wtrRainNow*wtrOpen('+p3+')))':n;
 W.rainK=o=>o&&o.rain?W.rainKey():'';

 // ---- FLOW: the chunk (the same text the test runs): wtrFlowN(p, v, slope), wtrFlowFoam(slope, bank)
 W.flowGLSL=rap=>{const Q=W.PRESETS.flow,per=W.period(),n=Q.phases,R=Q.ripple,RP=rap||Q.rapids;
  return['vec2 wtrRipG(vec2 q,vec2 c){vec2 g=vec2(0.0);vec2 d;'+R.map(r=>{const a=r[2]*Math.PI/180;
    return'd=vec2(c.x*'+f(Math.cos(a))+'-c.y*'+f(Math.sin(a))+',c.y*'+f(Math.cos(a))+'+c.x*'+f(Math.sin(a))+');g+=cos((q.x*d.x+q.y*d.y)*'+f(TAU/r[1])+')*'+f(r[0])+'*d;';}).join('')+'return g;}',
   'vec3 wtrFlowN(vec2 p,vec2 v,float slope){float p0=fract(atmWaveT*'+f(n/per)+');float p1=fract(p0+0.5);float T='+f(per/n)+';float sp=length(v);'+
    'vec2 c=sp>1.0e-6?v/sp:vec2(1.0,0.0);vec2 g0=wtrRipG(p-v*p0*T,c);vec2 g1=wtrRipG(p-v*p1*T+vec2('+f(.37*R[0][1])+','+f(.61*R[0][1])+'),c);'+
    'float w0=1.0-abs(2.0*p0-1.0);float k=1.0+'+f(Q.rapidGain)+'*smoothstep('+f(RP[0])+','+f(RP[1])+',slope);vec2 s=(g0*w0+g1*(1.0-w0))*k;return normalize(vec3(-s.x,1.0,-s.y));}',
   'float wtrFlowFoam(float slope,float bank){return max('+f(Q.foam[0])+'*smoothstep('+f(RP[0])+','+f(RP[1])+',slope),'+f(Q.foam[1])+'*(1.0-smoothstep(0.0,'+f(Q.edge)+',bank)));}'].join('\n');};
 W.drawFlow=(S,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,Q=W.PRESETS.flow,per=W.period();
  if(o.rapids)S.rapids=[o.rapids[0],o.rapids[1]];const rap=S.rapids||null;
  S.ribbonOpt={step:o.step==null?Q.step:o.step,across:o.across==null?Q.across:o.across,margin:o.margin==null?Q.margin:o.margin};
  if(o.depthBias!=null)S.ribbonOpt.depthBias=o.depthBias;if(o.chute!=null)S.ribbonOpt.chute=o.chute;
  /* o.refine (2026-10-27, opt-in): true (rows where o.keep changes) or {f, tol, min} (W.ribbon's): a per-vertex effect resolves without densifying the
     whole line; the record keeps {tol, min} (the function is not data: a port refines by the host's own) */
  if(o.refine){const r=o.refine===true?{}:o.refine,fn=r.f||o.keep;if(typeof fn==='function')S.ribbonOpt.refine={f:fn,tol:r.tol==null?.08:r.tol,min:r.min==null?2:r.min};}
  const R=W.ribbon(S,S.ribbonOpt),g=new T.BufferGeometry();
  // o.origin: the mesh stands at the ribbon's middle and its vertices are local to it (a river a hundred km long, a
  // million metres out, keeps its float precision); the shader still reads world positions through modelMatrix
  const org=[0,0,0];if(o.origin){let n=R.count;for(let i=0;i<n;i++){org[0]+=R.pos[i*3]/n;org[2]+=R.pos[i*3+2]/n;}org[0]=Math.round(org[0]);org[2]=Math.round(org[2]);}
  g.setAttribute('position',new T.Float32BufferAttribute(o.origin?R.pos.map((v,i)=>v-org[i%3]):R.pos,3));g.setAttribute('wtrFlow',new T.Float32BufferAttribute(R.flow,2));
  g.setAttribute('wtrSlope',new T.Float32BufferAttribute(R.slope,1));g.setAttribute('wtrBank',new T.Float32BufferAttribute(R.bank,1));
  // o.endFade (2026-10-26, WATER.join's tributaries): {len, foam} metres, or len: the ribbon's last `len` m fade out and its foam stops
  // `foam` m (len * 1.6) before its end, so a tributary laid over its river runs into it with no end edge and no bank foam of its own
  // out on the river. Off (the default): nothing is added, the shader text is as before
  const EF=o.endFade==null?null:typeof o.endFade==='number'?{len:o.endFade}:Object.assign({},o.endFade),EL=R.along.length?R.along[R.along.length-1]:0;
  const MO=!!(o.mouths&&o.mouths.length);   /* the mouths: below */
  if(EF){if(EF.foam==null)EF.foam=EF.len*1.6;g.setAttribute('wtrAlong',new T.Float32BufferAttribute(R.along,1));}
  g.setAttribute('normal',new T.Float32BufferAttribute(new Float32Array(R.count*3).map((v,i)=>i%3===1?1:0),3));g.setIndex(R.idx);g.computeBoundingSphere();
  const mat=new T.MeshStandardMaterial({color:o.color==null?0x2b5a5a:o.color,roughness:o.roughness==null?.12:o.roughness,metalness:o.metalness==null?.1:o.metalness,
   transparent:o.transparent!==false,depthWrite:o.transparent===false});sky(mat,o);W.biasMaterial(mat,o);
  const CH='#include <atmos_waves>\n'+W.flowGLSL(rap)+'\n'+NOISE+'\nvarying vec2 vWtrF;varying float vWtrS;varying float vWtrB;varying vec3 vWtrW;'+(EF?'varying float vWtrE;':'');
  const T2=per/Q.phases;mat.customProgramCacheKey=()=>'wtr-flow:'+W.hashStr(CH)+(o.transparent!==false?'t':'')+W.rainK(o)+(o.chute!=null?'c'+o.chute:'')+(EF?'e'+EF.len+','+EF.foam+','+EL+','+EF.color+','+!!EF.keepFoam+','+EF.flow+','+EF.turn+','+EF.turnK:'')+(o.mouths&&o.mouths.length?'m'+JSON.stringify(o.mouths):'');
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
   W.vs(sh,'wtr-drawFlow',['#include <common>','#include <common>\n'+CH+'\nattribute vec2 wtrFlow;attribute float wtrSlope;attribute float wtrBank;'+(EF?'attribute float wtrAlong;':'')],['#include <begin_vertex>','#include <begin_vertex>\nvWtrF=wtrFlow;vWtrS=wtrSlope;vWtrB=wtrBank;vWtrW=(modelMatrix*vec4(position,1.0)).xyz;'+(EF?'vWtrE='+f(EL)+'-wtrAlong;'+(EF.flow?'{float wtrU=1.0-smoothstep(0.0,'+f(EF.turn==null?8:EF.turn)+',vWtrE);vWtrF=mix(vWtrF,vec2('+f(EF.flow[0])+','+f(EF.flow[1])+')*length(vWtrF),wtrU*'+f(EF.turnK==null?1:EF.turnK)+');}':''):'')]);   /* endFade.flow [x, z] (a unit), endFade.turn (8 m), endFade.turnK (1: how far it turns): the current turns into the main's over the last turn m, its ripples
    joining the main's; the ripples are advected by phase, so a short or full turn shears them: a long, partial one (30 m, .6) reads best */
   W.fs(sh,'wtr-drawFlow',['#include <common>','#include <common>\n'+CH+W.rainOn(o,sh.uniforms)],['#include <color_fragment>','#include <color_fragment>\n'+
     'float wtrP0=fract(atmWaveT*'+f(Q.phases/per)+');float wtrW0=1.0-abs(2.0*wtrP0-1.0);'+
     // the breakup noise rides the current too (the same two phases)
     'float wtrNz=mix(wtrNoise((vWtrW.xz-vWtrF*fract(wtrP0+0.5)*'+f(T2)+')*0.55+7.3),wtrNoise((vWtrW.xz-vWtrF*wtrP0*'+f(T2)+')*0.55),wtrW0);'+
     'float wtrFoamK=wtrFlowFoam(vWtrS,vWtrB)*smoothstep(0.42,0.82,wtrNz+0.15*wtrFlowFoam(vWtrS,vWtrB));'+
     // o.mouths [[x, z, r], ...] (2026-10-26, a confluence; opt-in): inside a round hole at each (soft from .55 r to r) the water is drawn as
     // mid-channel: no foam, the deep colour, full alpha (a bank's shallow tint and its fade to the ground under it read as a pale line
     // across a tributary's mouth). Given to both drawings, the two waters meet as one and the foam borders end on one arc; a fourth
     // value 0 ([x, z, r, 0], the tributary's own drawing) keeps its ribbon's side fade (no hard edge of it over the main's water)
     (MO?'float wtrMh=1.0,wtrMa=1.0;'+o.mouths.map(M=>{const d='smoothstep('+f(M[2]*.55)+','+f(M[2])+',length(vWtrW.xz-vec2('+f(M[0])+','+f(M[1])+')))';return 'wtrMh*='+d+';'+(M[3]===0?'':'wtrMa*='+d+';');}).join('')+'wtrFoamK*=wtrMh;float wtrBm=mix(max(vWtrB,3.5),vWtrB,wtrMh),wtrBa=mix(max(vWtrB,3.5),vWtrB,wtrMa);':'')+(EF?'wtrFoamK*=smoothstep('+f(EF.foam)+','+f(EF.foam+Math.max(1,EF.len))+',vWtrE);':'')+
     'diffuseColor.rgb=mix('+lin(T,o.shallow==null?0x6f9a8a:o.shallow)+','+lin(T,o.deep==null?0x1d3f44:o.deep)+',smoothstep(0.3,3.5,'+(MO?'wtrBm':'vWtrB')+'));'+
     'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.86,0.9,0.9),wtrFoamK);'+
     (o.transparent!==false?(MO?'diffuseColor.a*=mix(0.78,0.95,smoothstep(0.0,3.0,wtrBm))*smoothstep('+f(-S.ribbonOpt.margin)+',0.25,wtrBa);diffuseColor.a=mix(smoothstep('+f(-S.ribbonOpt.margin)+',0.25,wtrBa),diffuseColor.a,wtrMh);'   /* opaque in any mouth's hole but at its own sides: a pool under it (WATER.join pool) does not show through */:'diffuseColor.a*=mix(0.78,0.95,smoothstep(0.0,3.0,vWtrB))*smoothstep('+f(-S.ribbonOpt.margin)+',0.25,vWtrB);'):'')+
     // endFade.color (the main's water, sRGB): over the stretch that lies on the main (vWtrE under foam) the colour turns to the main's
     // and the surface covers what is under it (the main's bank foam at the mouth) before it fades out over the last len m
     (EF&&EF.color!=null?'{float wtrU=1.0-smoothstep('+f(EF.len)+','+f(EF.foam)+',vWtrE);diffuseColor.rgb=mix(diffuseColor.rgb,'+lin(T,EF.color)+',wtrU);'+
      (o.transparent!==false?'diffuseColor.a=mix(diffuseColor.a,0.97*smoothstep('+f(-S.ribbonOpt.margin)+',0.25,vWtrB),wtrU);':'')+'}':'')+
     // endFade.keepFoam: the water fades but its foam stays (the owner's note: the tributary's foam border may lie over the main's foam,
     // its water may not lie over the main's water); a negative foam keeps the foam to the very end
     (EF?(o.transparent!==false?'diffuseColor.a*='+(EF.keepFoam?'max(smoothstep(0.0,'+f(EF.len)+',vWtrE),wtrFoamK)':'smoothstep(0.0,'+f(EF.len)+',vWtrE)')+';':'if(vWtrE<'+f(EF.len*.5)+')discard;'):'')+
     // chute (2026-10-26): the ribbon gives way where the line is steeper than this (the falls' curtains draw the water there: fallsOf's steep),
     // so its sheet down a chute, cut by the banks, does not show beside the curtain
     (o.chute!=null?(o.transparent!==false?'diffuseColor.a*=1.0-smoothstep('+f(.85*o.chute)+','+f(o.chute)+',vWtrS);':'if(vWtrS>='+f(o.chute)+')discard;'):'')],['#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.8,wtrFoamK);'],['#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize((viewMatrix*vec4('+W.rainN(o,'wtrFlowN(vWtrW.xz,vWtrF,vWtrS)','vWtrW.xz','vWtrW')+',0.0)).xyz);']);};
  /* o.keep (2026-10-27, eastabyss's delta; opt-in): (x, z) -> 0..1, sampled at each ribbon vertex, the ribbon's alpha times it (an opaque
     ribbon discards under half): a channel fades out where other water already lies (a lake, a marsh pool), so it never rides over it.
     Without it nothing is added; the record notes keep: true (a port samples the host's own function) */
  if(o.keep){const K=new Float32Array(R.count);for(let i=0;i<R.count;i++){const v=+o.keep(R.pos[i*3],R.pos[i*3+2]);K[i]=v<0?0:v>1?1:v;}g.setAttribute('wtrKeep',new T.Float32BufferAttribute(K,1));S.ribbonOpt.keep=true;
   const KL=o.transparent!==false?'diffuseColor.a*=vWtrK;':'if(vWtrK<0.5)discard;';
   W.KH().add(mat,'wtr-keep',sh=>{W.vs(sh,'wtr-drawFlow',['#include <common>','#include <common>\nattribute float wtrKeep;varying float vWtrK;'],['#include <begin_vertex>','#include <begin_vertex>\nvWtrK=wtrKeep;']);
    W.fs(sh,'wtr-drawFlow',['#include <common>','#include <common>\nvarying float vWtrK;'],['#include <roughnessmap_fragment>',KL+'\n#include <roughnessmap_fragment>']);},{key:'keep:'+KL});}
  const mesh=tag(new T.Mesh(g,mat),S,o);mesh.renderOrder=o.renderOrder==null?1:o.renderOrder;mesh.position.set(org[0],0,org[2]);scene.add(mesh);
  const D={S,mesh,material:mat,ribbon:R};W.drawn.push(D);
  // spray at the steep reaches (the rapids' mist): core/atmos's 'spray' particles where the page has them
  if(o.spray){const pts=W.sprayPoints(S,typeof o.spray==='object'?o.spray:{});D.sprayPoints=pts;
   if(pts.length&&A.smoke&&A.PRESETS.smoke&&A.PRESETS.smoke.spray)D.spray=A.smoke(pts.map(p=>[p[0],p[1],p[2],'spray']));}
  return D;};

 // ---- the curtain's sides (2026-10-26): o.margin (m a side past the lip, W.curtain's) and o.edge (m of fade inside the lip's edge) go into the
 // curtain's options only when given; the side fade is then by metres (W.curtainSide), else the old fade over 8% of u at each side
 W.sideOpt=(C,o)=>{if(o.margin!=null)C.margin=o.margin;if(o.edge!=null)C.edge=o.edge;return C;};
 W.sideGLSL=(C,lw)=>C.margin==null&&C.edge==null?'smoothstep(0.0,0.08,vWtrUF.x)*smoothstep(1.0,0.92,vWtrUF.x)':
  'smoothstep('+f(-(C.margin||0))+','+(C.edge==null?'0.08*'+lw:f(C.edge))+',min(vWtrUF.x,1.0-vWtrUF.x)*'+lw+')';
 // spray: 'drop' or {drop: true, every, max, column, top, layer} -> W.fallSpray's options; anything else -> null (the three fixed emitters)
 W.sprayByDrop=o=>o.spray==='drop'?{}:o.spray&&typeof o.spray==='object'&&o.spray.drop?o.spray:null;
 // ---- FALLS: wtrStreak(u, f) and wtrFallFoam(f, s) for fall S; wtrPlunge(p) -> (foam, ring) for its pool
 W.fallGLSL=S=>{const Q=W.PRESETS.fall,per=W.period(),n=Q.streak.cycles,lw=S.lipW*Q.streak.across,P=W.plunge(S),PQ=Q.plunge;
  return[NOISE,'float wtrStreak(float u,float fl){float th=fract(atmWaveT*'+f(n/per)+'-fl*'+f(S.tFall*n/per)+');'+
    'return 0.55*wtrNoiseP(vec2(u*'+f(lw*2.2)+',th*6.0),6.0)+0.3*wtrNoiseP(vec2(u*'+f(lw*5.1)+'+3.7,th*14.0),14.0)+0.15*wtrNoiseP(vec2(u*'+f(lw*11)+'+9.1,th*30.0),30.0);}',
   'float wtrFallFoam(float fl,float s){return clamp(0.25+0.6*smoothstep(0.0,0.4,fl)+0.7*(s-0.5),0.0,1.0);}',
   'vec2 wtrPlunge(vec2 p){vec2 d=p-vec2('+f(P.x)+','+f(P.z)+');float r=length(d);float ph=fract(atmWaveT*'+f(PQ.cycles/per)+');float a=6.283185307*(fract(r*'+f(1/PQ.ring)+')-ph);'+
    'float e=exp(-r*'+f(1/P.r)+');float nz=wtrNoiseP(vec2(d.x*0.45+d.y*0.21,ph*12.0+r*0.3),12.0);return vec2(e*clamp(0.35+0.25*sin(a)+0.8*(nz-0.35),0.0,1.0),0.08*e*sin(a));}'].join('\n');};
 W.drawFall=(S,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,Q=W.PRESETS.fall;
  S.curtainOpt={rows:W.curtainRows(S,o),cols:o.cols==null?Q.cols:o.cols};W.sideOpt(S.curtainOpt,o);const M=W.curtain(S,S.curtainOpt),g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(M.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(M.nrm,3));g.setAttribute('wtrUF',new T.Float32BufferAttribute(M.uv,2));g.setIndex(M.idx);g.computeBoundingSphere();
  /* o.lipK (opt-in, default none: the old curtain): the curtain's base alpha at the lip, thinning to the old 0.45 a third of the way
     down. Seen from above, a curtain only 45% opaque at its lip read as bare ground (nhighlands, the owner's look pass, 2026-10-26: .85) */
  const col=o.color==null?0xb8d4d6:o.color,op=o.opacity==null?.92:o.opacity,lipK=o.lipK==null?null:o.lipK,footK=o.footK==null?null:o.footK;
  const mat=new T.MeshStandardMaterial({color:col,roughness:.42,metalness:0,transparent:true,depthWrite:false,side:T.DoubleSide});sky(mat,o);W.biasMaterial(mat,o);
  const CH='#include <atmos_waves>\n'+W.fallGLSL(S)+'\nvarying vec2 vWtrUF;';const SD=S.curtainOpt.margin==null&&S.curtainOpt.edge==null?'':W.sideGLSL(S.curtainOpt,f(S.lipW));mat.customProgramCacheKey=()=>'wtr-fall:'+W.hashStr(CH+op+SD+(lipK==null?'':'|lip'+lipK)+(footK==null?'':'|foot'+footK));
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
   W.vs(sh,'wtr-drawFall',['#include <common>','#include <common>\n'+CH+'\nattribute vec2 wtrUF;'],['#include <begin_vertex>','#include <begin_vertex>\nvWtrUF=wtrUF;']);
   W.fs(sh,'wtr-drawFall',['#include <common>','#include <common>\n'+CH],['#include <color_fragment>','#include <color_fragment>\n'+
    'float wtrSt=wtrStreak(vWtrUF.x,vWtrUF.y);float wtrFm=wtrFallFoam(vWtrUF.y,wtrSt);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.95,0.97,0.97),wtrFm);'+
    'diffuseColor.a='+f(op)+'*'+(lipK==null?'(0.45':'min(1.0,mix('+f(lipK)+',0.45,smoothstep(0.0,0.35,vWtrUF.y))')+'+0.55*smoothstep(0.25,0.8,wtrSt))*'+W.sideGLSL(S.curtainOpt,f(S.lipW))+
    /* footK (opt-in, 2026-10-27, the Rift's 160 m falls): the curtain's alpha toward its foot, the white water arriving at its pool,
       instead of thinning to 0.6 of itself (a tall curtain read as stopping half way down its cliff) */
    (footK==null?'*mix(1.0,0.6,smoothstep(0.55,1.0,vWtrUF.y));':';diffuseColor.a=max(diffuseColor.a,'+f(op)+'*'+f(footK)+'*smoothstep(0.3,1.0,vWtrUF.y)*'+W.sideGLSL(S.curtainOpt,f(S.lipW))+');')]);};
  const mesh=tag(new T.Mesh(g,mat),S,o);mesh.renderOrder=o.renderOrder==null?3:o.renderOrder;scene.add(mesh);
  const D={S,mesh,material:mat,curtain:M};
  // the plunge pool: a disc of churned white water at the foot, its rings running out
  /* plungeR (opt-in, 2026-10-27, the Rift's falls): the churn disc's radius in m (default 2.4 x the plunge's own radius, as before), its alpha
     faded to nothing over its outer quarter, so a disc sized to the pool it lands in (a WATER.still) never shows as a flat sheet past the pool */
  if(o.plunge!==false){const P=W.plunge(S),r=o.plungeR==null?P.r*2.4:o.plungeR,y=o.plungeY==null?P.y+.06:o.plungeY,pg=new T.CircleGeometry(r,48);pg.rotateX(-Math.PI/2);pg.translate(P.x,y,P.z);
   const pm=new T.MeshStandardMaterial({color:0xeef4f4,roughness:.6,metalness:0,transparent:true,depthWrite:false});W.biasMaterial(pm,o);const RF=o.plungeR==null?'':'diffuseColor.a*=1.0-smoothstep('+f(.75*r)+','+f(r)+',length(vWtrW.xz-vec2('+f(P.x)+','+f(P.z)+')));';pm.customProgramCacheKey=()=>'wtr-plunge:'+W.hashStr(W.fallGLSL(S)+RF);
   pm.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);const C2='#include <atmos_waves>\n'+W.fallGLSL(S)+'\nvarying vec3 vWtrW;';
    W.vs(sh,'wtr-drawFall',['#include <common>','#include <common>\n'+C2],['#include <begin_vertex>','#include <begin_vertex>\nvWtrW=(modelMatrix*vec4(position,1.0)).xyz;']);
    W.fs(sh,'wtr-drawFall',['#include <common>','#include <common>\n'+C2],['#include <color_fragment>','#include <color_fragment>\nvec2 wtrPl=wtrPlunge(vWtrW.xz);diffuseColor.a*=clamp(wtrPl.x*1.15,0.0,0.95);'+RF]);};
   D.plunge=tag(new T.Mesh(pg,pm),S,o);D.plunge.name+=':plunge';D.plunge.renderOrder=mesh.renderOrder;scene.add(D.plunge);
   if(o.spray!==false&&A.smoke&&A.PRESETS.smoke&&A.PRESETS.smoke.spray){const sd=W.sprayByDrop(o);
    D.spray=A.smoke(sd?W.fallSpray(S,Object.assign({plungeY:o.plungeY},sd)).map(p=>[p[0],p[1],p[2],'spray']):[[P.x,y+1,P.z,'spray'],[P.x+P.r*.5,y+1,P.z,'spray'],[P.x-P.r*.5,y+1,P.z-P.r*.4,'spray']]);}}
  W.drawn.push(D);return D;};

 // ---- STILL: wtrStillN(p) for surface S
 W.stillGLSL=S=>{const Q=W.PRESETS.still,per=W.period();
  return'vec3 wtrStillN(vec2 p){vec2 s=vec2(0.0);float c;'+Q.ripple.map(r=>{const a=r[2]*Math.PI/180;
    return'c=cos(6.283185307*(fract(p.x*'+f(Math.cos(a)/r[1])+')+fract(p.y*'+f(Math.sin(a)/r[1])+')-fract(atmWaveT*'+f(r[3]/per)+')))*'+f(r[0])+';s+=c*vec2('+f(Math.cos(a))+','+f(Math.sin(a))+');';}).join('')+
   (S.fountain?'vec2 dv=p-vec2('+f(S.fountain[0])+','+f(S.fountain[1])+');float r=length(dv);if(r>1.0e-6){c=cos(6.283185307*(fract(r*'+f(1/Q.fountain.ring)+')-fract(atmWaveT*'+f(Q.fountain.cycles/per)+')))*0.06*exp(-r*'+f(1/Q.fountain.r)+');s+=c*dv/r;}':'')+
   'return normalize(vec3(-s.x,1.0,-s.y));}'+
   // a centre-to-rim gradient (20's S.gradientT): 0 at the middle, 1 at the rim
   (S.gradient?'\nfloat wtrStillT(vec2 p){return pow(clamp(length(p-vec2('+f(S.gradient.at[0])+','+f(S.gradient.at[1])+'))*'+f(1/S.gradient.radius)+',0.0,1.0),'+f(S.gradient.power)+');}':'');};
 W.drawStill=(S,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,M=W.stillMesh(S),g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(M.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(new Float32Array(M.pos.length).map((v,i)=>i%3===1?1:0),3));g.setIndex(M.idx);g.computeBoundingSphere();
  const mat=new T.MeshStandardMaterial({color:o.color==null?0x24443f:o.color,roughness:o.roughness==null?.06:o.roughness,metalness:o.metalness==null?.15:o.metalness,
   transparent:o.opacity!=null&&o.opacity<1,opacity:o.opacity==null?1:o.opacity,depthWrite:!(o.opacity!=null&&o.opacity<1)});sky(mat,o);W.biasMaterial(mat,o);
  const CH='#include <atmos_waves>\n'+W.stillGLSL(S)+'\nvarying vec3 vWtrW;';
  // the colour: the gradient from the middle out (replacing the material's), then the tint multiplier
  const CF=(S.gradient?'diffuseColor.rgb=mix('+lin(T,S.gradient.centre)+','+lin(T,S.gradient.rim)+',wtrStillT(vWtrW.xz));':'')+(o.tint!=null?'diffuseColor.rgb*='+lin(T,o.tint)+';':'');
  mat.customProgramCacheKey=()=>'wtr-still:'+W.hashStr(CH+CF)+W.rainK(o);
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
   W.vs(sh,'wtr-drawStill',['#include <common>','#include <common>\n'+CH],['#include <begin_vertex>','#include <begin_vertex>\nvWtrW=(modelMatrix*vec4(position,1.0)).xyz;']);
   W.fs(sh,'wtr-drawStill',['#include <common>','#include <common>\n'+CH+W.rainOn(o,sh.uniforms)],['#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize((viewMatrix*vec4('+W.rainN(o,'wtrStillN(vWtrW.xz)','vWtrW.xz','vWtrW')+',0.0)).xyz);']);
   if(CF)W.fs(sh,'wtr-drawStill',['#include <color_fragment>','#include <color_fragment>\n'+CF]);};
  const mesh=tag(new T.Mesh(g,mat),S,o);if(o.renderOrder!=null)mesh.renderOrder=o.renderOrder;scene.add(mesh);
  const D={S,mesh,material:mat};if(S.seasonal)D.y0=S.level;W.drawn.push(D);return D;};
 // one still-water material for many small pools drawn by a build's own (instanced) meshes: troughs, wallows, basins.
 // Their tops take wtrStillN's ripple (no fountain) and the sky; their sides keep their own normals. Each pool should
 // still be a WATER.still record (the twin). o: {THREE, color, roughness, metalness, envMapIntensity}
 W.stillMaterial=o=>{o=o||{};const A=ATMOS,T=o.THREE||A.T;
  const mat=new T.MeshStandardMaterial({color:o.color==null?0x24443f:o.color,roughness:o.roughness==null?.06:o.roughness,metalness:o.metalness==null?.15:o.metalness});sky(mat,o);W.biasMaterial(mat,o);
  const CH='#include <atmos_waves>\n'+W.stillGLSL({fountain:null})+'\nvarying vec3 vWtrW;varying float vWtrNy;';mat.customProgramCacheKey=()=>'wtr-stillmat'+W.rainK(o);
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
   W.vs(sh,'wtr-stillMaterial',['#include <common>','#include <common>\n'+CH],['#include <project_vertex>','#include <project_vertex>\n'+
    'vec4 wtrWp=vec4(transformed,1.0);vec3 wtrN=objectNormal;\n#ifdef USE_INSTANCING\nwtrWp=instanceMatrix*wtrWp;wtrN=mat3(instanceMatrix)*wtrN;\n#endif\nvWtrW=(modelMatrix*wtrWp).xyz;vWtrNy=normalize(mat3(modelMatrix)*wtrN).y;']);
   W.fs(sh,'wtr-stillMaterial',['#include <common>','#include <common>\n'+CH+W.rainOn(o,sh.uniforms)],['#include <normal_fragment_begin>','#include <normal_fragment_begin>\n'+
    'if(vWtrNy>0.7)normal=normalize((viewMatrix*vec4('+W.rainN(o,'wtrStillN(vWtrW.xz)','vWtrW.xz','vWtrW')+',0.0)).xyz);']);};
  return mat;};

 // ---- RAIN (2026-10-26, WEATHER-RESEARCH items 1-3): rings on water and puddles, and the sky's cover
 // WATER.rainRippleGLSL()  wtrRainRipple(p, rain) -> the ripple's slope (twin: WATER.rainRipple at atmWaveT), wtrRainN(n, g) the normal with it
 //   (twin: WATER.rainNormal); its own hash (wtrRHash, the same as wtrHash) so it sits beside any chunk. Needs atmWaveT (atmos_waves).
 // WATER.coverGLSL()  wtrOpen(p) -> 1 under open sky, 0 under cover: core/atmos's rain occlusion map when the page has it (ATMOS.rainCoverGLSL(),
 //   which defines atmRainOpen(vec3 p), and ATMOS.rainCoverUniforms(u)); else 1 everywhere. Read when a program compiles.
 // WATER.rainChunk(u)  both, the live rain as uniform wtrRainNow (ATMOS.U.rain, W.rain), and their uniforms added to u
 W.rainRippleGLSL=()=>{const Q=W.RIPPLE,c=W.rippleCycles()/W.period();
  return['float wtrRHash(vec2 p){vec3 q=fract(vec3(p.xyx)*0.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
   'vec2 wtrRingCell(vec2 q,vec2 c,float ph0,float rain){float h1=wtrRHash(c);float h2=wtrRHash(c+vec2(17.3,4.1));float h3=wtrRHash(c+vec2(5.7,31.9));'+
    'float on=step(fract(h1*7.13+h2*3.71),rain);vec2 d=q-(c+vec2(0.25+0.5*h1,0.25+0.5*h2));float r=length(d);float ph=fract(ph0+h3);float u=r-ph*'+f(Q.R)+';'+
    'float s=sin('+f(TAU*Q.F)+'*u)*exp(-u*u*'+f(Q.K)+')*(1.0-ph)*(1.0-ph)*on;return r>1.0e-4?d*(s/r):vec2(0.0);}',
   'vec2 wtrRainRipple(vec2 p,float rain){vec2 g=vec2(0.0);if(rain<=0.0)return g;'+Q.oct.map((sz,o)=>'{vec2 q=p*'+f(1/sz)+';vec2 i=floor(q);float ph0=atmWaveT*'+f(c)+'+'+f(o*.37)+';'+
    'for(int dy=-1;dy<=1;dy++){for(int dx=-1;dx<=1;dx++){g+=wtrRingCell(q,i+vec2(float(dx),float(dy)),ph0,rain);}}}').join('')+'return g*('+f(Q.amp)+'*smoothstep(0.0,0.15,rain));}',
   'vec3 wtrRainN(vec3 n,vec2 g){return normalize(vec3(n.x/n.y-g.x,1.0,n.z/n.y-g.y));}'].join('\n');};
 W.coverGLSL=()=>{const A=AT();return A&&A.rainCoverGLSL&&A.rainCoverUniforms?A.rainCoverGLSL()+'\nfloat wtrOpen(vec3 p){return atmRainOpen(p);}':'float wtrOpen(vec3 p){return 1.0;}';};
 W.rainChunk=u=>{const A=AT();u.wtrRainNow=A&&A.U&&A.U.rain?A.U.rain:{value:0};if(A&&A.rainCoverGLSL&&A.rainCoverUniforms)A.rainCoverUniforms(u);
  return'uniform float wtrRainNow;\n'+W.coverGLSL()+'\n'+W.rainRippleGLSL()+'\n';};
 W.rainKey=()=>{const A=AT();return'|rain'+(A&&A.rainCoverGLSL&&A.rainCoverUniforms?'c':'');};

 // ---- WET GROUND: the chunk (wtrWetGround(p, gy) from a shore surface, or none; wtrRain the weather's wetness)
 W.wetChunk=(S,uniforms)=>{const A=AT(),U={wtrRain:{value:W.wet()}};A.hook(()=>{U.wtrRain.value=W.wet();});
  let ch='uniform float wtrRain;\n';
  if(S&&S.shore){ch+='#include <atmos_waves>\n'+W.glsl(S)+'\n';A.waveUniforms(uniforms);Object.assign(uniforms,W.uniformsOf(S));}
  else ch+='vec2 wtrWetGround(vec2 p,float gy){return vec2(0.0);}\n';
  const Q=W.PRESETS.shore.wet;
  ch+='float wtrWetness(vec2 wg,float ny){return max(wg.x,wtrRain*smoothstep(0.35,0.8,ny));}\n'+
   'vec3 wtrWetAlbedo(vec3 c,float w){return c*(1.0-'+f(Q.dark)+'*w);}\nfloat wtrWetRough(float r,float w,float film){return mix(mix(r,r*'+f(1-Q.gloss)+',w),0.06,film);}\n';
  Object.assign(uniforms,U);return ch;};
 // ORDER-INDEPENDENT (2026-10-21): the page's own onBeforeCompile may be assigned before or after this call. The material's onBeforeCompile becomes an accessor:
 // what the page assigns is kept as the hook that runs first, the wet chunk always after it (before, a hook assigned later replaced this one and the ground
 // silently stayed dry). The program cache key reads the page's hook as it stands.
 // R9 (2026-10-26): WATER.wetGround(mat, {surface, rain, porosity, puddles, ripples}). With `porosity` (0..1; .7 when only puddles are given) or
 // `puddles` (a WATER.hollows record) the ground takes LAGARDE'S MODEL in place of the old darken-and-shine: wetness darkens the albedo by its
 // porosity and cuts the roughness (W.wetLook, W.WET), and the hollows fill as W.wet climbs (W.puddleAt): standing water, darker, a mirror, its
 // normal flat and ringed by the rain (WATER.rainRippleGLSL, ripples: false for none) on up-facing ground. Rain wets only what is under open sky
 // where core/atmos has a rain occlusion map (WATER.coverGLSL). Without either option the chunk is the old one, to the byte.
 // IDEMPOTENT: a second call on the same material fills in only the options the first left out and recompiles (core/atmos's bindWeather calls it with
 // {rain: true}; a page that wants puddles calls it first). Before, a second call stacked a second chunk and the shader failed to compile.
 const WETS=typeof WeakMap!=='undefined'?new WeakMap():null;
 W.puddleGLSL=M=>'uniform sampler2D wtrHollowT;\nfloat wtrHollow(vec2 p){vec2 uv=(p-vec2('+f(M.x0)+','+f(M.z0)+'))*vec2('+f(1/(M.cell*M.nx))+','+f(1/(M.cell*M.nz))+');'+
  'if(uv.x<0.0||uv.y<0.0||uv.x>1.0||uv.y>1.0)return 0.0;return texture2D(wtrHollowT,uv).x;}\n'+
  'float wtrPuddle(vec2 p,float wet){float L=1.0-wet*'+f(M.fill)+';return smoothstep(L,L+'+f(M.soft)+',wtrHollow(p));}';
 // the hollow record's texture (one per record; the record stays plain data)
 const HTX=typeof WeakMap!=='undefined'?new WeakMap():null;
 W.hollowTexture=(M,T)=>{let tx=HTX&&HTX.get(M);if(tx)return tx;const n=M.nx*M.nz,d=new Uint8Array(n*4);for(let k=0;k<n;k++){d[k*4]=M.data[k];d[k*4+3]=255;}
  tx=new T.DataTexture(d,M.nx,M.nz,T.RGBAFormat,T.UnsignedByteType);tx.minFilter=tx.magFilter=T.LinearFilter;tx.wrapS=tx.wrapT=T.ClampToEdgeWrapping;tx.generateMipmaps=false;tx.flipY=false;tx.needsUpdate=true;
  if(HTX)HTX.set(M,tx);return tx;};
 W.wetLookGLSL=()=>{const Q=W.WET;return'float wtrWetDarkL(float w,float pd,float por){return (1.0-'+f(Q.dark)+'*por*w)*(1.0-'+f(Q.puddleDark)+'*pd);}\n'+
  'float wtrWetRoughL(float r,float w,float pd,float film){return mix(r*mix(1.0,'+f(Q.rough)+',w),'+f(Q.puddleRough)+',max(pd,film));}';};
 W.wetGround=(mat,o)=>{o=o||{};
  if(WETS&&WETS.has(mat)){const P=WETS.get(mat);let ch=false;for(const k of Object.keys(o))if(o[k]!=null&&P[k]==null){P[k]=o[k];ch=true;}if(ch)mat.needsUpdate=true;return mat;}
  o=Object.assign({},o);if(WETS)WETS.set(mat,o);
  const S=o.surface||null;const model=()=>o.porosity!=null||!!o.puddles;
  const wkey=()=>'wtr-wet:'+(S?W.hashStr(W.glsl(S)):'rain')+
   (model()?'|lag:'+[o.porosity,o.puddles?W.hashStr(W.puddleGLSL(o.puddles)):'',o.ripples!==false].join()+W.rainKey():'');
   // a KHOOK layer (core/shader; 2026-11-02): one layer among cloudShade, heightFog and snowOn, whichever is on the material; a page hook
  // assigned after any of them goes under the layers and replaces none. The key reads this call's options as they stand
  const chunk=function(sh,r){const S2=o.surface||S,M=model(),A=AT();let CH=W.wetChunk(S2,sh.uniforms)+'varying vec3 vWtrW;varying float vWtrNy;';
   if(M){if(!(S2&&S2.shore)){CH+='\nuniform float atmWaveT;';sh.uniforms.atmWaveT=A.U.waveTime;}CH+='\nuniform float wtrLight;';sh.uniforms.wtrLight=A.U.light||{value:1};
    CH+='\n'+W.rainChunk(sh.uniforms)+W.wetLookGLSL()+'\n'+(o.puddles?W.puddleGLSL(o.puddles):'float wtrPuddle(vec2 p,float wet){return 0.0;}')+'\n';
    if(o.puddles)sh.uniforms.wtrHollowT={value:W.hollowTexture(o.puddles,A.T)};}
   W.vs(sh,'wtr-wetGround',['#include <common>','#include <common>\n'+CH]);
   const WV='vec4 wtrWp=vec4(transformed,1.0);vec3 wtrN=objectNormal;\n#ifdef USE_INSTANCING\nwtrWp=instanceMatrix*wtrWp;wtrN=mat3(instanceMatrix)*wtrN;\n#endif\nvWtrW=(modelMatrix*wtrWp).xyz;vWtrNy=normalize(mat3(modelMatrix)*wtrN).y;';   /* a page hook that replaced <project_vertex> (the foliage's sway): before <fog_vertex>, as snowOn */
   sh.vertexShader=W.KH().inject(sh.vertexShader,{at:'project_vertex',after:WV,fallback:{at:'fog_vertex',before:WV}},'wtr-wet','vertex');
   // after everything that sets the albedo (a build's own colour hooks included) and the roughness, before the light
   W.fs(sh,'wtr-wetGround',['#include <common>','#include <common>\n'+CH]);sh.fragmentShader=(A?A.repLit(mat):W.KH().rep)(sh.fragmentShader,'#include <emissivemap_fragment>',M?
    '{vec2 wtrWG=wtrWetGround(vWtrW.xz,vWtrW.y);float wtrOk=wtrOpen(vWtrW);float wtrW=max(wtrWG.x,wtrRain*wtrOk*smoothstep(0.35,0.8,vWtrNy));'+
    'float wtrPd=wtrPuddle(vWtrW.xz,wtrRain*wtrOk)*smoothstep(0.85,0.97,vWtrNy);diffuseColor.rgb*=wtrWetDarkL(wtrW,wtrPd,'+f(o.porosity==null?.7:o.porosity)+');\n'+
    '#if defined(STANDARD)\nroughnessFactor=wtrWetRoughL(roughnessFactor,wtrW,wtrPd,wtrWG.y);\n#endif\n'+
    'vec3 wtrPN=wtrPd>0.001?wtrRainN(vec3(0.0,1.0,0.0),'+(o.ripples===false?'vec2(0.0)':'wtrRainRipple(vWtrW.xz,wtrRainNow*wtrOk)')+'):vec3(0.0,1.0,0.0);\n'+
    '#if defined(STANDARD)||defined(PHONG)\nif(wtrPd>0.001)normal=normalize(mix(normal,normalize((viewMatrix*vec4(wtrPN,0.0)).xyz),wtrPd));\n#endif\n'+
    // the sky in a puddle where the material has no environment map (a Lambert ground most of all): Schlick's Fresnel on the rippled normal
    // times the sky's radiance, added to the emission after the page's emissive map. A Lambert ground has the sky light it is lit by (three's
    // vIndirectFront: the hemisphere and ambient irradiance, over pi); any other takes W.WET.sky times the daylight (core/atmos's light)
    '#include <emissivemap_fragment>\n#ifndef USE_ENVMAP\nif(wtrPd>0.001){float wtrFr=0.02+0.98*pow(1.0-clamp(dot(normalize(cameraPosition-vWtrW),wtrPN),0.0,1.0),5.0);'+
    '\n#if defined(LAMBERT)\nvec3 wtrSkyL=vIndirectFront*0.3183099;\n#else\nvec3 wtrSkyL=vec3('+W.WET.sky.map(f).join(',')+')*wtrLight;\n#endif\n'+
    'totalEmissiveRadiance+=wtrPd*min(wtrFr,0.6)*'+f(W.WET.sheen)+'*wtrSkyL;}\n#endif\n}':
    '{vec2 wtrWG=wtrWetGround(vWtrW.xz,vWtrW.y);float wtrW=wtrWetness(wtrWG,vWtrNy);diffuseColor.rgb=wtrWetAlbedo(diffuseColor.rgb,wtrW);\n'+
    '#if defined(STANDARD)\nroughnessFactor=wtrWetRough(roughnessFactor,wtrW,wtrWG.y);\n#endif\n}\n#include <emissivemap_fragment>');};
  return W.KH().add(mat,'wtr-wet',chunk,{key:wkey});};
})();
