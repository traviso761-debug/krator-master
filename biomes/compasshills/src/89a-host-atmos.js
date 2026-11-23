// ================================================================= HOST — atmosphere, spire-targeted lightning & field-overlay motes ([web])
ATMOS.bindHost({
 THREE:THREE,scene:scene,camera:camera,renderer:renderer,ticks:TICKS,
 ground:(x,z)=>terrainH(x,z),
 hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13.8,
 seed:910241,
 viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind({gain:SKEY==='tors'?1.18:1.0});

// Spire-targeted cloud-to-tor lightning bolts (fx/lightning.js) during [Thunder squall]
function triggerSpireLightning(nowSec){
 if(typeof ATMOS==='undefined'||!ATMOS.boltFx)return false;
 const spires=COMPASS.SPIRES;
 let tx=0,tz=0,baseY=terrainH(0,0)+8;
 if(spires&&spires.length){
  // Preferentially target the highest lightningScoreAt magnetite spires
  let bestIdx=0,bestScore=-1;
  for(let i=0;i<spires.length;i++){
   const sc=spires[i].strikeProb01*(0.85+0.3*(((COMPASS_STATE.strikeCount*7+i*13)%11)/10));
   if(sc>bestScore){bestScore=sc;bestIdx=i;}
  }
  const sp=spires[bestIdx];
  tx=sp.x;tz=sp.z;baseY=sp.topY;
  COMPASS_STATE.lastStrikeSpire=bestIdx;
 }
 const dist=Math.max(45,Math.hypot(camera.position.x-tx,camera.position.z-tz));
 ATMOS.boltGlow=1.0;
 ATMOS.boltFx({x:tx,z:tz,top:baseY+380,base:baseY-0.3,dist:dist,t:nowSec==null?0:nowSec,ash:false});
 COMPASS_STATE.strikeCount++;
 return true;
}

{
 let nextStrikeT=1.5;
 tick((dt,elapsed)=>{
  const tNow=elapsed==null?0:elapsed;
  const dtS=dt==null?0.016:dt;
  if(ATMOS.boltGlow&&ATMOS.boltGlow>0){
   ATMOS.boltGlow=Math.max(0,ATMOS.boltGlow-dtS*2.6);
  }
  if(ATMOS.U&&ATMOS.U.wind){
   const k=COMPASS_STATE.squall?1.85:1.0;
   ATMOS.U.wind.value.set(SITE.wind[0]*k,SITE.wind[1]*k);
  }
  if(COMPASS_STATE.squall&&tNow>=nextStrikeT){
   triggerSpireLightning(tNow);
   nextStrikeT=tNow+2.8+1.6*((COMPASS_STATE.strikeCount*17)%5)/4;
  }
 });
}

// Subtle suspended magnetite-dust streamline overlay toggled by [Field overlay]
const FIELD_OVERLAY=(function(){
 const pts=[],cols=[];
 const step=24,Rbox=220;
 for(let gz=-Rbox;gz<=Rbox;gz+=step){
  for(let gx=-Rbox;gx<=Rbox;gx+=step){
   let px=gx,pz=gz;
   for(let s=0;s<5;s++){
    const f=COMPASS_PHYS.fieldAt(px,pz,SKEY);
    const nx=px+Math.cos(f.azimuthRad)*4.2,nz=pz+Math.sin(f.azimuthRad)*4.2;
    const y0=terrainH(px,pz)+1.35,y1=terrainH(nx,nz)+1.35;
    pts.push(px,y0,pz,nx,y1,nz);
    const k=clamp(f.bMagMt/35.0,0.18,1.0);
    cols.push(0.85,0.68+0.25*k,0.34, 0.96,0.82,0.46);
    px=nx;pz=nz;
   }
  }
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
 geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
 const mat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.62,depthWrite:false});
 const lines=new THREE.LineSegments(geo,mat);
 lines.name='atmos:field-overlay';
 lines.visible=COMPASS_STATE.fieldOverlay;
 lines.userData.probeSkip=true;
 scene.add(lines);
 return lines;
})();

const AIR=(function(){
 const q=new URLSearchParams(location.search),out={hfog:false,raincover:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  ATMOS.heightFog({falloff:SKEY==='tors'?1/310:SKEY==='gorge'?1/260:1/360,sun:0.32,sky:0.30});
  ATMOS.heightFogScene(scene);
  out.hfog=true;
 }
 if(ATMOS.rainCover&&samplersOf(MAT_GROUND)+2<=12){
  try{out.raincover=!!ATMOS.rainCover({renderer:renderer});}catch(e){reportErr('rain cover: '+e.stack);}
 }else{
  out.raincover='kept ground <= 12 samplers ('+samplersOf(MAT_GROUND)+')';
 }
 return out;
})();
ATMOS.bindWeather({
 climate:{wet:SKEY!=='cuesta',snow:false},
 sun:sun,
 hemi:scene.children.find(o=>o.isHemisphereLight),
 grounds:[MAT_GROUND]
});
