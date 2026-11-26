// ================================================================= WATER - ext: drawing many falls and pools in one mesh each, and a stepped river
// [draw] + [G shader]. Needs 20, 22, 50, 51 and 53-core-water-terraces.js, core/atmos bound with ATMOS.init, and three.js r128. Nothing runs at load time.
// In the SUBFOLDER core/water/ext/ (see 53's header): a build opts in by path.
//
//   WATER.drawFalls(list, o)   the falls of `list` (WATER.fall surfaces) as TWO draw calls however many there are: one mesh for every curtain (the
//        per-fall W.curtain, concatenated, with each fall's streak scale and fall time as vertex attributes in place of drawFall's literals) and
//        one for the plunge discs (each disc's centre and radius an attribute); the same shading as drawFall (the streaks fall with the water,
//        the foam grows toward the foot, the churn rings). o: {color, opacity, rows, rowStep, cols, plunge (false: none), plungeY, spray (false:
//        none), renderOrder, depthBias, depthWrite, pick, name}. -> {mesh, plunge, material, spray, falls: list, merged: W.mergedFalls' arrays}
//   WATER.drawPools(list, o)   the still pools of `list` as ONE mesh (their polygons' triangles, each at its own level) with drawStill's ripple and sky,
//        each pool's own gradient (2026-10-26; o.gradient gives one to the pools without); no fountain (those pools keep drawStill). o: {color,
//        roughness, metalness, envMapIntensity, opacity, renderOrder, depthBias, depthWrite, pick, name, gradient, tint, rain}. -> {mesh, material, list}
//   (2026-10-27, opt-in) drawFalls takes plungeR (each plunge disc's radius in m, or a function (S, P) -> m; default 2.4 x W.plunge's r)
//        and plungeFade (with plungeR: the share of the radius where the disc starts to fade out, .75): a stepped river's discs inside its banks
//   (2026-10-26) drawFalls also takes margin and edge (the curtains' sides, W.curtain) and spray: 'drop' (WATER.fallSpray); see 51's header
//   WATER.drawTerraces(T, o)   a stepped river (WATER.terraces) in about four calls: its pools one mesh, its falls two. o: {pool: {...}, fall: {...}}
//        over the options both take. -> {pools, falls}
// Meshes carry userData.lodSkip and, unless o.pick, probeSkip; userData.water = the ids of the surfaces they hold.
(function(){const W=WATER;
 const glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';},f=glf;
 const AT=()=>{try{return typeof ATMOS!=='undefined'?ATMOS:null;}catch(e){return null;}};
 const sky=(mat,o)=>{const A=AT();if(o.envMapIntensity!=null)mat.envMapIntensity=o.envMapIntensity;
  A.hook(()=>{const E=A.skyEnv,tx=E&&E.target&&E.target.texture;if(tx&&mat.envMap!==tx){mat.envMap=tx;mat.needsUpdate=true;}});};
 const tag=(m,name,ids,o)=>{m.name='water:'+name;if(!o.pick)m.userData.probeSkip=true;m.userData.lodSkip=true;m.userData.water=ids;if(o.pick){m.userData.inspectLabel=name;}else m.raycast=()=>{};return m;};

 // ---- the falls' functions with the per-fall numbers as arguments: wtrStreakA(u, f, lipScale, tFall), wtrPlungeA(p, (cx, cz, r)); twins: W.fallStreak
 // (lw = lipW * streak.across, tFall = S.tFall) and W.plungeAt
 W.fallGLSLMerged=()=>{const Q=W.PRESETS.fall,per=W.period(),n=Q.streak.cycles,PQ=Q.plunge;
  return[W.noiseGLSL,'float wtrStreakA(float u,float fl,float lw,float tf){float th=fract(atmWaveT*'+f(n/per)+'-fl*tf*'+f(n/per)+');'+
    'return 0.55*wtrNoiseP(vec2(u*lw*2.2,th*6.0),6.0)+0.3*wtrNoiseP(vec2(u*lw*5.1+3.7,th*14.0),14.0)+0.15*wtrNoiseP(vec2(u*lw*11.0+9.1,th*30.0),30.0);}',
   'float wtrFallFoam(float fl,float s){return clamp(0.25+0.6*smoothstep(0.0,0.4,fl)+0.7*(s-0.5),0.0,1.0);}',
   'vec2 wtrPlungeA(vec2 p,vec3 c){vec2 d=p-c.xy;float r=length(d);float ph=fract(atmWaveT*'+f(PQ.cycles/per)+');float a=6.283185307*(fract(r*'+f(1/PQ.ring)+')-ph);'+
    'float e=exp(-r/c.z);float nz=wtrNoiseP(vec2(d.x*0.45+d.y*0.21,ph*12.0+r*0.3),12.0);return vec2(e*clamp(0.35+0.25*sin(a)+0.8*(nz-0.35),0.0,1.0),0.08*e*sin(a));}'].join('\n');};
 W.drawFalls=(list,o)=>{o=o||{};
  // (a margin or edge is the curtains' record too, for the export: Godot widens and fades them the same way; nothing is recorded without one)
  if(o.margin!=null||o.edge!=null)for(const S of list)S.curtainOpt=W.sideOpt({rows:W.curtainRows(S,o),cols:o.cols==null?W.PRESETS.fall.cols:o.cols},o);
  const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,M=W.mergedFalls(list,o),C=M.curtain,name=o.name||'falls',ids=list.map(S=>S.id);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(C.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(C.nrm,3));
  g.setAttribute('wtrUF',new T.Float32BufferAttribute(C.uv,2));g.setAttribute('wtrFP',new T.Float32BufferAttribute(C.fp,2));g.setIndex(C.idx);g.computeBoundingSphere();
  const col=o.color==null?0xb8d4d6:o.color,op=o.opacity==null?.92:o.opacity;
  const mat=new T.MeshStandardMaterial({color:col,roughness:.42,metalness:0,transparent:true,depthWrite:false,side:T.DoubleSide});sky(mat,o);W.biasMaterial(mat,o);
  const CH='#include <atmos_waves>\n'+W.fallGLSLMerged()+'\nvarying vec2 vWtrUF;varying vec2 vWtrFP;';const SD=o.margin==null&&o.edge==null?'':JSON.stringify([o.margin,o.edge]);mat.customProgramCacheKey=()=>'wtr-falls:'+W.hashStr(CH+op+SD);
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
   W.vs(sh,'wtr-drawFalls',['#include <common>','#include <common>\n'+CH+'\nattribute vec2 wtrUF;attribute vec2 wtrFP;'],['#include <begin_vertex>','#include <begin_vertex>\nvWtrUF=wtrUF;vWtrFP=wtrFP;']);
   W.fs(sh,'wtr-drawFalls',['#include <common>','#include <common>\n'+CH],['#include <color_fragment>','#include <color_fragment>\n'+
    'float wtrSt=wtrStreakA(vWtrUF.x,vWtrUF.y,vWtrFP.x,vWtrFP.y);float wtrFm=wtrFallFoam(vWtrUF.y,wtrSt);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.95,0.97,0.97),wtrFm);'+
    'diffuseColor.a='+f(op)+'*(0.45+0.55*smoothstep(0.25,0.8,wtrSt))*'+W.sideGLSL(W.sideOpt({},o),'(vWtrFP.x*'+f(1/W.PRESETS.fall.streak.across)+')')+'*mix(1.0,0.6,smoothstep(0.55,1.0,vWtrUF.y));']);};
  const mesh=tag(new T.Mesh(g,mat),name,ids,o);mesh.renderOrder=o.renderOrder==null?3:o.renderOrder;scene.add(mesh);
  const D={mesh,material:mat,falls:list,merged:M};
  if(o.plunge!==false&&M.plunge.count){const P=M.plunge,pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(P.pos,3));
   pg.setAttribute('wtrPC',new T.Float32BufferAttribute(P.pc,3));pg.setIndex(P.idx);pg.computeBoundingSphere();
   /* the discs face up (2026-10-27): without a normal the Standard material lit them with (0,0,0) and the churn drew dark grey, not foam */
   {const nr=new Float32Array(P.pos.length);for(let i=1;i<nr.length;i+=3)nr[i]=1;pg.setAttribute('normal',new T.Float32BufferAttribute(nr,3));}
   /* o.plungeR (53's mergedFalls) and o.plungeFade (2026-10-27, opt-in): each disc fades out from plungeFade of its radius (.75 as drawFall's) to its rim */
   const PR=P.pr?(o.plungeFade==null?.75:o.plungeFade):null;if(PR!=null)pg.setAttribute('wtrPR',new T.Float32BufferAttribute(P.pr,1));
   const RF=PR==null?'':'diffuseColor.a*=1.0-smoothstep('+f(PR)+'*vWtrPR,vWtrPR,length(vWtrW.xz-vWtrPC.xy));';
   const pm=new T.MeshStandardMaterial({color:0xeef4f4,roughness:.6,metalness:0,transparent:true,depthWrite:false});W.biasMaterial(pm,o);
   const C2='#include <atmos_waves>\n'+W.fallGLSLMerged()+'\nvarying vec3 vWtrW;varying vec3 vWtrPC;'+(RF?'varying float vWtrPR;':'');pm.customProgramCacheKey=()=>'wtr-plunges:'+W.hashStr(C2+RF);
   pm.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
    W.vs(sh,'wtr-drawFalls',['#include <common>','#include <common>\n'+C2+'\nattribute vec3 wtrPC;'+(RF?'attribute float wtrPR;':'')],['#include <begin_vertex>','#include <begin_vertex>\nvWtrW=(modelMatrix*vec4(position,1.0)).xyz;vWtrPC=wtrPC;'+(RF?'vWtrPR=wtrPR;':'')]);
    W.fs(sh,'wtr-drawFalls',['#include <common>','#include <common>\n'+C2],['#include <color_fragment>','#include <color_fragment>\nvec2 wtrPl=wtrPlungeA(vWtrW.xz,vWtrPC);diffuseColor.a*=clamp(wtrPl.x*1.15,0.0,0.95);'+RF]);};
   D.plunge=tag(new T.Mesh(pg,pm),name+':plunge',ids,o);D.plunge.renderOrder=mesh.renderOrder;scene.add(D.plunge);
   if(o.spray!==false&&A.smoke&&A.PRESETS.smoke&&A.PRESETS.smoke.spray){const pts=[],sd=W.sprayByDrop(o);for(const S of list){const Pl=W.plunge(S),y=(o.plungeY==null?Pl.y+.06:o.plungeY)+1;
     if(sd){for(const p of W.fallSpray(S,Object.assign({plungeY:o.plungeY},sd)))pts.push([p[0],p[1],p[2],'spray']);continue;}
     pts.push([Pl.x,y,Pl.z,'spray'],[Pl.x+Pl.r*.5,y,Pl.z,'spray'],[Pl.x-Pl.r*.5,y,Pl.z-Pl.r*.4,'spray']);}
    D.spray=A.smoke(pts);}}
  W.drawn.push(D);return D;};

 // ---- the pools: one mesh, one material (drawStill's, without a fountain)
 // GRADIENT (2026-10-26): a pool with a gradient of its own (WATER.still({gradient})) keeps it here, and o.gradient {centre, rim, power} gives one
 // to every pool without (its own middle and radius, W.gradientOf; the pool's record takes it, so the export lists it); each pool's (x, z,
 // 1/radius, power) and its two colours ride as vertex attributes (power -1: no gradient, the material's colour). The colour step is wtrPoolT
 // (W.poolGLSL; twin: the surface's gradientT). o.tint: a hex multiplier on the colour (drawStill's). Without either, all is as before.
 W.poolGLSL='float wtrPoolT(vec2 p,vec4 g){return pow(clamp(length(p-g.xy)*g.z,0.0,1.0),g.w);}';
 W.drawPools=(list,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,name=o.name||'pools',pos=[],idx=[];
  const GR=list.map(S=>S.gradient||(o.gradient?(S.gradient=W.gradientOf(S,o.gradient)):null)),anyG=GR.some(Boolean),ga=[],gc=[],gr=[],cv=c=>W.colLin(T,c);
  list.forEach((S,si)=>{const M=W.stillMesh(S),b=pos.length/3,G=GR[si];for(const v of M.pos)pos.push(v);for(const k of M.idx)idx.push(b+k);
   if(anyG){const a=G?[G.at[0],G.at[1],1/G.radius,G.power]:[0,0,0,-1],c0=G?cv(G.centre):[0,0,0],c1=G?cv(G.rim):[0,0,0];for(let k=0;k<M.pos.length/3;k++){ga.push(...a);gc.push(...c0);gr.push(...c1);}}});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(new Float32Array(pos.length).map((v,i)=>i%3===1?1:0),3));g.setIndex(idx);g.computeBoundingSphere();
  if(anyG){g.setAttribute('wtrGA',new T.Float32BufferAttribute(ga,4));g.setAttribute('wtrGC',new T.Float32BufferAttribute(gc,3));g.setAttribute('wtrGR',new T.Float32BufferAttribute(gr,3));}
  const CF=(anyG?'if(vWtrGA.w>=0.0)diffuseColor.rgb=mix(vWtrGC,vWtrGR,wtrPoolT(vWtrW.xz,vWtrGA));':'')+(o.tint!=null?'diffuseColor.rgb*='+('vec3('+W.colLin(T,o.tint).map(f).join(',')+')')+';':''),
   GV=anyG?'\n'+W.poolGLSL+'\nvarying vec4 vWtrGA;varying vec3 vWtrGC;varying vec3 vWtrGR;':'';
  const mat=new T.MeshStandardMaterial({color:o.color==null?0x24443f:o.color,roughness:o.roughness==null?.06:o.roughness,metalness:o.metalness==null?.15:o.metalness,
   transparent:o.opacity!=null&&o.opacity<1,opacity:o.opacity==null?1:o.opacity,depthWrite:!(o.opacity!=null&&o.opacity<1)});sky(mat,o);W.biasMaterial(mat,o);
  const CH='#include <atmos_waves>\n'+W.stillGLSL({fountain:null})+'\nvarying vec3 vWtrW;'+GV;mat.customProgramCacheKey=()=>'wtr-still:'+W.hashStr(CH+CF)+W.rainK(o);
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
   W.vs(sh,'wtr-drawPools',['#include <common>','#include <common>\n'+CH+(anyG?'\nattribute vec4 wtrGA;attribute vec3 wtrGC;attribute vec3 wtrGR;':'')],['#include <begin_vertex>','#include <begin_vertex>\nvWtrW=(modelMatrix*vec4(position,1.0)).xyz;'+(anyG?'vWtrGA=wtrGA;vWtrGC=wtrGC;vWtrGR=wtrGR;':'')]);
   W.fs(sh,'wtr-drawPools',['#include <common>','#include <common>\n'+CH+W.rainOn(o,sh.uniforms)],['#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize((viewMatrix*vec4('+W.rainN(o,'wtrStillN(vWtrW.xz)','vWtrW.xz','vWtrW')+',0.0)).xyz);']);
   if(CF)W.fs(sh,'wtr-drawPools',['#include <color_fragment>','#include <color_fragment>\n'+CF]);};
  const mesh=tag(new T.Mesh(g,mat),name,list.map(S=>S.id),o);if(o.renderOrder!=null)mesh.renderOrder=o.renderOrder;scene.add(mesh);
  const D={mesh,material:mat,list};W.drawn.push(D);return D;};

 W.drawTerraces=(Tr,o)=>{o=o||{};const base=Object.assign({},o);delete base.pool;delete base.fall;
  return{pools:W.drawPools(Tr.pools,Object.assign({name:Tr.name+' pools'},base,o.pool||{})),falls:W.drawFalls(Tr.falls,Object.assign({name:Tr.name+' falls'},base,o.fall||{}))};};
})();
