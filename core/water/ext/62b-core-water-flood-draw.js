// ================================================================= CORE — water: drawing a gorge flood (WATER.drawFlood)  [draw] + [G shader]
// Needs 20, 22, 50 and 51-core-water-kinds.js (the flow's look: WATER.flowGLSL, WATER.noiseGLSL), ext/62-core-water-flood.js, core/atmos bound
// (ATMOS.init: the ripple's clock atmWaveT, the sky in the water) and core/shader (KHOOK). Nothing runs at load time. Not listed by any page
// yet, and not judged by eye on a GPU (core/water/README.md, "A gorge flood"): the test runs the law's GLSL against S.levelAt and builds the
// drawing on a three.js stub.
//
//   WATER.drawFlood(S, o)  a flood (WATER.flood) as one ribbon along its path, 2 (w + margin) wide, `across` columns, a row every `step` m. Each
//        vertex carries its row's s and bed y (attribute wtrFlood: s, bed, |q|); the vertex shader lifts it to wfLevel(s, bed, t) (WATER.floodGLSL,
//        twin S.levelAt(s, t)) while the water stands there and sinks it `sink` m under the bed where it does not (the dry part folds under the
//        ground; the fragment discards it). The look is drawFlow's, reused, not a new water shader: the same MeshStandardMaterial with the sky in
//        it, the ripple advected down the channel (wtrFlowN), white water on the steep reaches and along the banks (wtrFlowFoam), the breakup
//        noise (wtrNoise), plus a foam band on the front itself (the bore: the first `frontFoam` s after the front passes) and muddy flood colours.
//        The clock is a uniform wtrFloodT: o.uniforms.uT when the page gives one (seconds, S.levelAt's t), else ATMOS.hook's t, else
//        WATER.floodStep(dt). o: {THREE, scene, uniforms, step (2), across (4), margin (.5), sink (1), frontFoam (4), color (0x7b6446), shallow
//        (0x8a7350), deep (0x4a3a26), roughness (.2), metalness (.05), envMapIntensity, transparent (true), renderOrder (1), depthBias}
//        -> {S, mesh, material, ribbon {pos, flood, flow, slope, bank, idx, count, rows, cols}}; W.drawn takes it, as drawFlow's.
(function(){
 if(typeof WATER==='undefined'||!WATER.flood)throw new Error('62b-core-water-flood-draw: load core/water/ext/62-core-water-flood.js first');
 const W=WATER;if(W.drawFlood)return;   /* loaded twice: a no-op */
 const cl=(x,a,b)=>x<a?a:x>b?b:x,num=(v,d)=>v==null?d:v,f=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';};
 const AT=()=>{try{return typeof ATMOS!=='undefined'?ATMOS:null;}catch(e){return null;}};
 const lin=(T,c)=>'vec3('+W.colLin(T,c).map(f).join(',')+')';
 let CLK=null;
 W.floodUniforms=o=>{if(o&&o.uniforms&&o.uniforms.uT)return o.uniforms.uT;if(CLK)return CLK;CLK={value:0};const A=AT();if(A&&A.hook)A.hook(t=>{CLK.value=t;});return CLK;};
 W.floodStep=dt=>{if(CLK)CLK.value+=dt;};
 // the ribbon as arrays: rows at s = k L / n, each across the channel at its segment's normal
 W.floodRibbon=(S,o)=>{o=o||{};const F=S.front,P=F.path,L=S.length,step=num(o.step,2),cols=Math.max(2,Math.round(num(o.across,4))),mg=num(o.margin,.5),
   n=Math.max(1,Math.ceil(L/step)),pos=[],flood=[],flow=[],slope=[],bank=[],idx=[],A=[0];
  for(let j=1;j<P.length;j++)A.push(A[j-1]+Math.hypot(P[j][0]-P[j-1][0],P[j][2]-P[j-1][2]));
  for(let k=0;k<=n;k++){const s=k===n?L:L*k/n;let i=0;
   while(i+2<P.length&&A[i+1]<s)i++;const a=P[i],b=P[i+1],l=Math.hypot(b[0]-a[0],b[2]-a[2])||1,u=cl((s-A[i])/l,0,1),tx=(b[0]-a[0])/l,tz=(b[2]-a[2])/l;
   const cx=a[0]+(b[0]-a[0])*u,cz=a[2]+(b[2]-a[2])*u,bed=W.frontBed(F,s),sl=(a[1]-b[1])/l;
   for(let j=0;j<=cols;j++){const q=-F.w-mg+(2*F.w+2*mg)*j/cols;pos.push(cx-tz*q,bed,cz+tx*q);flood.push(s,bed,Math.abs(q));flow.push(tx*F.speed,tz*F.speed);slope.push(sl);bank.push(F.w-Math.abs(q));}}
  for(let k=0;k<n;k++)for(let j=0;j<cols;j++){const a=k*(cols+1)+j,b=a+1,c=a+cols+1,d=c+1;idx.push(a,c,b,b,c,d);}
  return{pos,flood,flow,slope,bank,idx,count:pos.length/3,rows:n+1,cols:cols+1};};
 W.drawFlood=(S,o)=>{o=o||{};if(!S||S.kind!=='flood')throw new Error('WATER.drawFlood: not a flood (WATER.flood)');
  const A=AT();if(!A||!A.waveUniforms)throw new Error('WATER.drawFlood: core/atmos bound (ATMOS.init: the ripple\'s clock and the sky in the water)');
  if(!W.flowGLSL||!W.noiseGLSL)throw new Error('WATER.drawFlood: load core/water/51-core-water-kinds.js first (the flow\'s look)');
  const T=o.THREE||A.T,scene=o.scene||(A.h&&A.h.scene),F=S.front,Q=W.PRESETS.flow,per=W.period(),R=W.floodRibbon(S,o),mg=num(o.margin,.5),sink=num(o.sink,1),FF=num(o.frontFoam,4);
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(R.pos,3));g.setAttribute('wtrFlood',new T.Float32BufferAttribute(R.flood,3));g.setAttribute('wtrFlow',new T.Float32BufferAttribute(R.flow,2));
  g.setAttribute('wtrSlope',new T.Float32BufferAttribute(R.slope,1));g.setAttribute('wtrBank',new T.Float32BufferAttribute(R.bank,1));
  g.setAttribute('normal',new T.Float32BufferAttribute(new Float32Array(R.count*3).map((v,i)=>i%3===1?1:0),3));g.setIndex(R.idx);g.computeBoundingSphere();
  if(g.boundingSphere)g.boundingSphere.radius+=F.base+F.depth+sink;
  const tr=o.transparent!==false,mat=new T.MeshStandardMaterial({color:o.color==null?0x7b6446:o.color,roughness:o.roughness==null?.2:o.roughness,metalness:o.metalness==null?.05:o.metalness,transparent:tr,depthWrite:!tr});
  if(o.envMapIntensity!=null)mat.envMapIntensity=o.envMapIntensity;
  if(A.hook)A.hook(()=>{const E=A.skyEnv,tx=E&&E.target&&E.target.texture;if(tx&&mat.envMap!==tx){mat.envMap=tx;mat.needsUpdate=true;}});
  if(W.biasMaterial)W.biasMaterial(mat,o);
  const U=W.floodUniforms(o),DRY=.02,CH='#include <atmos_waves>\n'+W.flowGLSL(S.rapids||null)+'\n'+W.noiseGLSL+'\n'+W.floodGLSL(S)+'\nuniform float wtrFloodT;varying vec2 vWtrF;varying float vWtrS;varying float vWtrB;varying vec3 vWtrW;varying float vWtrD;varying float vWtrV;';
  mat.customProgramCacheKey=()=>'wtr-flood:'+W.hashStr(CH)+(tr?'t':'')+','+mg+','+sink+','+FF+','+o.shallow+','+o.deep;
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);sh.uniforms.wtrFloodT=U;
   W.vs(sh,'wtr-drawFlood',['#include <common>','#include <common>\n'+CH+'\nattribute vec3 wtrFlood;attribute vec2 wtrFlow;attribute float wtrSlope;attribute float wtrBank;'],
    ['#include <begin_vertex>','#include <begin_vertex>\nvWtrD=wfLevel(wtrFlood.x,wtrFlood.y,wtrFloodT)-wtrFlood.y;vWtrV=wfV(wtrFlood.x,wtrFloodT);'+
     'transformed.y=vWtrD>'+f(DRY)+'?wtrFlood.y+vWtrD:wtrFlood.y-'+f(sink)+';vWtrF=wtrFlow;vWtrS=wtrSlope;vWtrB=wtrBank;vWtrW=(modelMatrix*vec4(transformed,1.0)).xyz;']);
   W.fs(sh,'wtr-drawFlood',['#include <common>','#include <common>\n'+CH],['#include <color_fragment>','#include <color_fragment>\nif(vWtrD<='+f(DRY)+')discard;'+
     'float wtrP0=fract(atmWaveT*'+f(Q.phases/per)+');float wtrW0=1.0-abs(2.0*wtrP0-1.0);'+
     'float wtrNz=mix(wtrNoise((vWtrW.xz-vWtrF*fract(wtrP0+0.5)*'+f(per/Q.phases)+')*0.55+7.3),wtrNoise((vWtrW.xz-vWtrF*wtrP0*'+f(per/Q.phases)+')*0.55),wtrW0);'+
     'float wtrBore=vWtrV>=0.0?1.0-smoothstep(0.0,'+f(Math.max(.01,FF))+',vWtrV):0.0;'+
     'float wtrFoamK=max(wtrFlowFoam(vWtrS,vWtrB),0.9*wtrBore)*smoothstep(0.42,0.82,wtrNz+0.15+0.3*wtrBore);'+
     'diffuseColor.rgb=mix('+lin(T,o.shallow==null?0x8a7350:o.shallow)+','+lin(T,o.deep==null?0x4a3a26:o.deep)+',smoothstep(0.3,3.5,min(vWtrB,vWtrD)));'+
     'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.86,0.84,0.78),wtrFoamK);'+
     (tr?'diffuseColor.a*=mix(0.82,0.97,smoothstep(0.0,2.0,vWtrD))*smoothstep('+f(-mg)+',0.25,vWtrB)*smoothstep('+f(DRY)+','+f(DRY+.15)+',vWtrD);':'')],
    ['#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.8,wtrFoamK);'],
    ['#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize((viewMatrix*vec4(wtrFlowN(vWtrW.xz,vWtrF,vWtrS),0.0)).xyz);']);};
  const mesh=new T.Mesh(g,mat);mat.name=mesh.name='water:'+S.name;mat.userData.water=S.id;mesh.userData.probeSkip=true;mesh.userData.lodSkip=true;mesh.userData.inspectLabel=S.name;mesh.raycast=()=>{};
  mesh.renderOrder=o.renderOrder==null?1:o.renderOrder;if(scene)scene.add(mesh);
  const D={S,mesh,material:mat,ribbon:R};(W.drawn||(W.drawn=[])).push(D);return D;};
})();
