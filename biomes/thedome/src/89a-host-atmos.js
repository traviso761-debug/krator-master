/* ================================================================= HOST — atmosphere, lenticular Crown-Veil fogBelt & Kluft barometric wisps ([G shader])
   Binds ATMOS laminar upslope breeze, stationary lenticular cap-cloud ATMOS.fogBelt ("The Crown-Veil", Station 3 crown),
   height fog, sampler-guarded rain cover, and warm barometric exhalation shimmer wisps rising from Station 4 radial Kluft!
*/
ATMOS.bindHost({
 THREE:THREE,scene:scene,camera:camera,renderer:renderer,ticks:TICKS,
 ground:(x,z)=>terrainH(x,z),
 hour:()=>{
  if(DOME_STATE.mode==='Crown-Mist')return 8.2;
  if(DOME_STATE.mode==='Sun-Baked Dry')return 14.6;
  return typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:10.4;
 },
 seed:SITE.seed+31,
 viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind({gain:SKEY==='crown'?1.22:1.0});

if(ATMOS.U&&ATMOS.U.wind){
 const baseWx=SITE.wind[0],baseWz=SITE.wind[1];
 ATMOS.U.wind.value.set(baseWx,baseWz);
 tick(()=>{
  const k=DOME_STATE.mode==='Crown-Mist'?1.18:1.0;
  ATMOS.U.wind.value.set(baseWx*k,baseWz*k);
  if(ATMOS.U.fog){
   ATMOS.U.fog.value=DOME_STATE.mode==='Crown-Mist'?0.76:Math.max(ATMOS.U.fog.value,DOME_STATE.mistBoost);
  }
 });
}

const AIR=(function(){
 const q=new URLSearchParams(location.search),out={hfog:false,fogBelt:false,raincover:false,baroWisps:0};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  ATMOS.heightFog({
   falloff:SKEY==='crown'?1/220:SKEY==='moat'?1/210:1/320,
   sun:0.35,
   sky:0.38,
   band:SKEY==='crown'?{density:0.0024,y:[12,95],cover:0.62,noise:0.85}:null
  });
  /* Stationary lenticular cap-cloud ("The Crown-Veil") clinging to the +2,924.8 m apex on Station 3 crown! */
  if(SKEY==='crown'&&typeof ATMOS.fogBelt==='function'){
   const belt=ATMOS.fogBelt({
    centre:[0,0],
    radius:900,
    res:96,
    y0:-18,
    y1:68,
    edge:16,
    depth:34,
    density:0.0042,
    noise:0.65,
    steps:5,
    lee:0.45
   });
   out.fogBelt=!!belt;
  }
  ATMOS.heightFogScene(scene);
  out.hfog=true;
 }
 if(ATMOS.rainCover&&RAIN_FITS){
  try{out.raincover=!!ATMOS.rainCover({renderer:renderer});}catch(e){reportErr('rain cover: '+e.stack);}
 }else if(ATMOS.rainCover){
  out.raincover='skipped: ground uses '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 }

 /* Station 4 (cleft): Barometric warm-air exhalation shimmer wisps rising from the 40 m radial Kluft fissure */
 if(SKEY==='cleft'&&SITE.cleft){
  const CL=SITE.cleft,nPts=220,pos=[],colA=[];
  for(let i=0;i<nPts;i++){
   const u1=KRAND.unit(KRAND.hash(6471,i,1,1)),u2=KRAND.unit(KRAND.hash(6471,i,2,2));
   const u3=KRAND.unit(KRAND.hash(6471,i,3,3)),u4=KRAND.unit(KRAND.hash(6471,i,4,4));
   const px=lerp(-95,120,u1),pz=(u2-0.5)*CL.halfW*1.35+0.024*px;
   const py=-34.0+6.0*u3;
   pos.push(px,py,pz);
   colA.push(u4,38.0+16.0*u3,2.2+2.8*u2,0.55+0.45*u1);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('aWisp',new THREE.Float32BufferAttribute(colA,4));
  const uBaro={value:1.0};
  const mat=new THREE.ShaderMaterial({
   transparent:true,depthWrite:false,
   uniforms:{
    uTime:ATMOS.U.time,
    uWind:ATMOS.U.wind,
    uBaro:uBaro,
    uScale:{value:innerHeight*0.52}
   },
   vertexShader:[
    'attribute vec4 aWisp;',
    'uniform float uTime;uniform vec2 uWind;uniform float uBaro;uniform float uScale;',
    'varying float vAlpha;',
    'void main(){',
    ' float ph=fract(uTime*0.048*aWisp.w+aWisp.x);',
    ' float sw=uTime*0.85+ph*7.2+aWisp.x*6.283;',
    ' vec3 p=position+vec3(cos(sw)*aWisp.z*0.42+uWind.x*ph*6.0,ph*aWisp.y,sin(sw)*aWisp.z*0.32+uWind.y*ph*6.0);',
    ' vec4 mv=modelViewMatrix*vec4(p,1.0);',
    ' float dd=max(1.0,-mv.z);',
    ' gl_Position=projectionMatrix*mv;',
    ' gl_PointSize=clamp(uScale*(4.2+8.5*ph)/dd,1.5,34.0);',
    ' vAlpha=uBaro*smoothstep(0.0,0.18,ph)*(1.0-smoothstep(0.65,1.0,ph))*0.28;',
    '}'
   ].join('\n'),
   fragmentShader:[
    'varying float vAlpha;',
    'void main(){',
    ' vec2 q=gl_PointCoord-0.5;float r=length(q);',
    ' if(r>0.5||vAlpha<=0.002)discard;',
    ' float a=vAlpha*(1.0-smoothstep(0.10,0.5,r));',
    ' gl_FragColor=vec4(vec3(0.88,0.92,0.95),a);',
    '}'
   ].join('\n')
  });
  const wispMesh=new THREE.Points(geo,mat);
  wispMesh.name='atmos:kluft-barometric-wisps';
  wispMesh.frustumCulled=false;
  wispMesh.userData.probeSkip=true;
  wispMesh.renderOrder=4;
  scene.add(wispMesh);
  tick(()=>{
   const baro=DOME_PHYS.barometricAt(0,0,SITE,DOME_STATE.mode==='Sun-Baked Dry'?15.0:11.5);
   uBaro.value=clamp(baro.baroFlowMs/2.6,0.25,1.25);
   mat.uniforms.uScale.value=innerHeight*0.52;
  });
  out.baroWisps=nPts;
 }
 return out;
})();

ATMOS.bindWeather({
 climate:{wet:true,snow:false},
 sun:sun,
 hemi:scene.children.find(o=>o.isHemisphereLight),
 grounds:[MAT_GROUND]
});
