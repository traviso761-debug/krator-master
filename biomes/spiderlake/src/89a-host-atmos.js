// ================================================================= HOST — atmosphere, ATMOS silk wind & 300 m lake-smoke pillars ([web])
// Binds ATMOS wind gusts to BIO foliage and SPIDERLAKE silk curtains/weirs/cables (0.000 m drift at pinned anchors!),
// attaches 1.33 atm basin height fog, sampler-guarded rain cover, smudge-pot smoke, and dusk chironomid lake-smoke columns.
ATMOS.bindHost({
 THREE:THREE,scene:scene,camera:camera,renderer:renderer,ticks:TICKS,
 ground:(x,z)=>terrainH(x,z),
 hour:()=>{
  if(SPIDER_STATE.mode==='dawn')return 6.65;
  if(SPIDER_STATE.mode==='dusk')return 18.85;
  return typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:10.5;
 },
 seed:5831,
 viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind({gain:SKEY==='rampart'?1.25:1.0});
SPIDERLAKE.bindAtmosSilk();

if(ATMOS.U&&ATMOS.U.wind){
 const baseWx=SITE.wind[0],baseWz=SITE.wind[1];
 ATMOS.U.wind.value.set(baseWx,baseWz);
 tick(()=>{
  const k=SPIDER_STATE.mode==='dusk'?1.15:1.0;
  ATMOS.U.wind.value.set(baseWx*k,baseWz*k);
  if(ATMOS.U.fog){
   ATMOS.U.fog.value=SPIDER_STATE.mode==='dawn'?0.72:Math.max(ATMOS.U.fog.value,SPIDER_STATE.fogBoost);
  }
 });
}

const AIR=(function(){
 const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,lakesmoke:0,smudge:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  ATMOS.heightFog({falloff:SKEY==='fen'?1/190:SKEY==='rampart'?1/380:1/240,sun:0.34,sky:0.34});
  ATMOS.heightFogScene(scene);
  out.hfog=true;
 }
 if(ATMOS.rainCover&&RAIN_FITS){
  try{out.raincover=!!ATMOS.rainCover({renderer:renderer});}catch(e){reportErr('rain cover: '+e.stack);}
 }else if(ATMOS.rainCover){
  out.raincover='skipped: ground uses '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 }

 // Terracotta smudge-pot calming smoke (visible during [Smudge Harvest])
 if(WORKS&&WORKS.smudgePots&&WORKS.smudgePots.length&&ATMOS.smoke){
  const smPts=WORKS.smudgePots.map(p=>[p[0],p[1],p[2],'chimney']);
  const smCloud=ATMOS.smoke(smPts,{n:26});
  if(smCloud){
   smCloud.visible=false;
   tick(()=>{smCloud.visible=SPIDER_STATE.smudgeActive01>0.05;});
   out.smudge=true;
  }
 }
 if(WORKS&&WORKS.lanterns&&WORKS.lanterns.length&&ATMOS.moths){
  ATMOS.moths({at:WORKS.lanterns,p:1.0,n:8,seed:5839});
 }

 // 260-310 m Hydrothermal "Lake-Smoke" Chironomid & Mayfly Emergence Pillars (Stations 1-5; strictly 0 on +2,040 m rampart!)
 if(SITE.hasOpenLake){
  const pillars=SITE.smokePillars||(
   SKEY==='spillway'?[{x:65,z:-25,r:32,h:260},{x:195,z:18,r:38,h:275}]
   :SKEY==='narrows'?[{x:15,z:-95,r:36,h:280},{x:165,z:-12,r:38,h:285},{x:-115,z:12,r:32,h:265}]
   :SKEY==='pavilion'?[{x:-25,z:-185,r:34,h:255},{x:95,z:-205,r:36,h:265}]
   :[{x:85,z:-155,r:32,h:240}]
  );
  const perCol=180,pos=[],seedA=[];
  for(let c=0;c<pillars.length;c++){
   const P=pillars[c];
   for(let i=0;i<perCol;i++){
    const u1=KRAND.unit(KRAND.hash(5835,c,i,1)),u2=KRAND.unit(KRAND.hash(5835,c,i,2));
    const u3=KRAND.unit(KRAND.hash(5835,c,i,3)),u4=KRAND.unit(KRAND.hash(5835,c,i,4));
    const ang=u1*TAU,rad=P.r*Math.sqrt(u2);
    pos.push(P.x+Math.cos(ang)*rad,0.4,P.z+Math.sin(ang)*rad);
    seedA.push(u3,P.h*(0.78+0.22*u4),P.r*(0.35+0.65*u2),0.55+0.45*u1);
   }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('aCol',new THREE.Float32BufferAttribute(seedA,4));
  const uSmoke={value:SPIDER_STATE.smokeBoost};
  const mat=new THREE.ShaderMaterial({
   transparent:true,depthWrite:false,
   uniforms:{
    uTime:ATMOS.U.time,
    uWind:ATMOS.U.wind,
    uSmoke:uSmoke,
    uScale:{value:innerHeight*0.55}
   },
   vertexShader:[
    'attribute vec4 aCol;',
    'uniform float uTime;uniform vec2 uWind;uniform float uSmoke;uniform float uScale;',
    'varying float vAlpha;',
    'void main(){',
    ' float ph=fract(uTime*0.035*aCol.w+aCol.x);',
    ' float swirl=uTime*0.65+ph*9.5+aCol.x*6.283;',
    ' vec3 p=position+vec3(cos(swirl)*aCol.z*0.38+uWind.x*ph*14.0,ph*aCol.y,sin(swirl)*aCol.z*0.38+uWind.y*ph*14.0);',
    ' vec4 mv=modelViewMatrix*vec4(p,1.0);',
    ' float dd=max(1.0,-mv.z);',
    ' gl_Position=projectionMatrix*mv;',
    ' gl_PointSize=clamp(uScale*(4.8+9.0*ph)/dd,1.5,38.0);',
    ' vAlpha=uSmoke*smoothstep(0.0,0.14,ph)*(1.0-smoothstep(0.68,1.0,ph))*0.34;',
    '}'
   ].join('\n'),
   fragmentShader:[
    'varying float vAlpha;',
    'void main(){',
    ' vec2 q=gl_PointCoord-0.5;float r=length(q);',
    ' if(r>0.5||vAlpha<=0.002)discard;',
    ' float a=vAlpha*(1.0-smoothstep(0.12,0.5,r));',
    ' gl_FragColor=vec4(vec3(0.84,0.68,0.38),a);',
    '}'
   ].join('\n')
  });
  const ptsMesh=new THREE.Points(geo,mat);
  ptsMesh.name='atmos:lakesmoke-pillars';
  ptsMesh.frustumCulled=false;
  ptsMesh.userData.probeSkip=true;
  ptsMesh.renderOrder=4;
  scene.add(ptsMesh);
  tick(()=>{
   uSmoke.value=SPIDER_STATE.smokeBoost;
   mat.uniforms.uScale.value=innerHeight*0.55;
   ptsMesh.visible=SPIDER_STATE.smokeBoost>0.02;
  });
  out.lakesmoke=pillars.length;
 }
 return out;
})();

ATMOS.bindWeather({
 climate:{wet:true,snow:false},
 sun:sun,
 hemi:scene.children.find(o=>o.isHemisphereLight),
 grounds:[MAT_GROUND]
});
