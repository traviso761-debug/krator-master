// ================================================================= HOST — atmosphere, thermal cave mist & fenestre sunbeam shaft ([G shader])
// Binds ATMOS wind gusts to BIO foliage, attaches 1.33-1.41 atm hollow height fog, sampler-guarded rain cover,
// cool +18 C cave-mouth condensation mist plumes, and Station 3 (fenestre) volumetric sunbeam shaft piercing 28 m down!
ATMOS.bindHost({
 THREE:THREE,scene:scene,camera:camera,renderer:renderer,ticks:TICKS,
 ground:(x,z)=>DRAWN_H(x,z),
 hour:()=>{
  if(SH_STATE.mode==='dusk')return 19.15;
  return typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:11.2;
 },
 seed:7431,
 viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind({gain:SKEY==='shutin'?1.18:0.95});

if(ATMOS.U&&ATMOS.U.wind){
 const baseWx=SITE.wind[0],baseWz=SITE.wind[1];
 ATMOS.U.wind.value.set(baseWx,baseWz);
 tick(()=>{
  const k=SH_STATE.mode==='dusk'?0.78:1.0;
  ATMOS.U.wind.value.set(baseWx*k,baseWz*k);
  if(ATMOS.U.fog){
   ATMOS.U.fog.value=Math.max(ATMOS.U.fog.value,SH_STATE.mode==='dusk'?0.32:0.10);
  }
 });
}

const AIR=(function(){
 const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,cavemist:false,sunbeam:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  ATMOS.heightFog({falloff:SKEY==='spring'?1/180:SKEY==='fenestre'?1/210:1/260,sun:0.34,sky:0.34});
  ATMOS.heightFogScene(scene);
  out.hfog=true;
 }
 if(ATMOS.rainCover&&RAIN_FITS){
  try{out.raincover=!!ATMOS.rainCover({renderer:renderer});}catch(e){reportErr('rain cover: '+e.stack);}
 }else if(ATMOS.rainCover){
  out.raincover='skipped: ground uses '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 }

 // Cool +18 C artesian cave-mouth & shut-in spray mist plumes (ATMOS.smoke 'spray')
 if(ATMOS.smoke&&ATMOS.PRESETS&&ATMOS.PRESETS.smoke&&ATMOS.PRESETS.smoke.spray){
  const mistPts=SKEY==='spring'
   ?[[-82,0.8,0,'spray'],[-68,0.6,-8,'spray'],[-68,0.6,8,'spray'],[-42,0.5,0,'spray']]
   :SKEY==='shutin'
   ?[[-28,4.6,0,'spray'],[0,3.2,2,'spray'],[32,1.6,-2,'spray']]
   :SKEY==='fenestre'
   ?[[0,1.2,0,'spray'],[8,-18.0,6,'spray']]
   :[[-38,2.4,-36,'spray']];
  const mistCloud=ATMOS.smoke(mistPts,{n:28});
  if(mistCloud)out.cavemist=true;
 }

 // Station 3 (fenestre) & Station 4 (glade): Volumetric daylight sunbeam shaft slanting through the collapse skylight!
 if(SITE.cavern&&(SKEY==='fenestre'||SKEY==='glade')){
  const cv=SITE.cavern;
  const topR=cv.skylightDiamM*0.44,botR=topR*1.48;
  const shaftH=(SKEY==='fenestre'?30.0:18.5);
  const coneGeo=new THREE.CylinderGeometry(topR,botR,shaftH,24,1,true);
  const uBeam={value:SH_STATE.mode==='dusk'?0.12:0.26};
  const coneMat=new THREE.ShaderMaterial({
   transparent:true,
   depthWrite:false,
   blending:THREE.AdditiveBlending,
   side:THREE.DoubleSide,
   uniforms:{
    uBeam:uBeam,
    uCol:{value:new THREE.Color(SH_STATE.mode==='dusk'?0x3ee0c8:0xfff4d8)}
   },
   vertexShader:[
    'varying vec2 vUvS;',
    'varying vec3 vNrmV;',
    'void main(){',
    ' vUvS=uv;',
    ' vNrmV=normalize(normalMatrix*normal);',
    ' gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);',
    '}'
   ].join('\n'),
   fragmentShader:[
    'uniform float uBeam;',
    'uniform vec3 uCol;',
    'varying vec2 vUvS;',
    'varying vec3 vNrmV;',
    'void main(){',
    ' float edge=pow(abs(vNrmV.z),1.65);',
    ' float vFade=smoothstep(0.0,0.22,vUvS.y)*smoothstep(1.0,0.72,vUvS.y);',
    ' float a=uBeam*edge*vFade;',
    ' if(a<=0.002)discard;',
    ' gl_FragColor=vec4(uCol,a);',
    '}'
   ].join('\n')
  });
  const beamMesh=new THREE.Mesh(coneGeo,coneMat);
  beamMesh.position.set(cv.portal[0]+3.5,cv.floorY+shaftH*0.5+1.2,cv.portal[1]+2.8);
  beamMesh.rotation.z=-0.18;
  beamMesh.rotation.x=0.12;
  beamMesh.name='atmos:fenestre-sunbeam-shaft';
  beamMesh.userData.probeSkip=true;
  beamMesh.renderOrder=5;
  scene.add(beamMesh);
  tick(()=>{
   const dusk=SH_STATE.mode==='dusk';
   uBeam.value=dusk?0.10:0.26;
   coneMat.uniforms.uCol.value.setHex(dusk?0x38dec4:0xfff4d8);
  });
  out.sunbeam=true;
 }

 return out;
})();

ATMOS.bindWeather({
 climate:{wet:true,snow:false},
 sun:sun,
 hemi:hemiLight,
 grounds:[MAT_GROUND]
});
