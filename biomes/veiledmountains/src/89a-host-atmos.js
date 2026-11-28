// ================================================================= HOST — The Omnipresent Veil (heightFog + fogMistField + fogBelt + cloudDeck + slopeWind; [G shader])
// Implements PLAN.md section 3.2: three stacked mist layers active across EVERY hour and weather mode (never dropping to 0!):
//   1. Valley-floor radiation & bog pool mist (ATMOS.heightFog fogPool + spatially baked fogMistField from VEIL_PHYS.mistAt)
//   2. Mid-slope stratus cloud-belt & hanging-valley deck (fogSlab + ATMOS.fogBelt + ATMOS.cloudDeck)
//   3. Cataract plunge-spray plumes & drifting valley fogBank ribbons (ATMOS.smoke spray + ATMOS.fogBank + fx/raincover)
//   + ATMOS.slopeWind funneling NW upslope sea-drafts by day & cold mist-drainage down-valley at night
//   + ATMOS.snowCover on Station 4 (veilpass) above +20 m local (+3,540 m..+5,400 m)
ATMOS.bindHost({
 THREE:THREE,scene:scene,camera:camera,renderer:renderer,ticks:TICKS,
 ground:(x,z)=>DRAWN_H(x,z),
 hour:()=>{
  if(VEIL_STATE.night)return 22.0;
  if(VEIL_STATE.mode==='sunbreak')return 10.25;
  if(VEIL_STATE.mode==='deepveil')return 6.85;
  return typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:8.85;
 },
 seed:9231,
 viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind({gain:SKEY==='veilpass'?1.28:SKEY==='gorge'?1.05:0.88});

// Bind topographic katabatic/anabatic slope & U-valley gap winds (fx/89-atmos-fx-slopewind.js)
const SLOPE_WIND=(function(){
 if(typeof ATMOS.slopeWind!=='function')return null;
 const sw=ATMOS.slopeWind({
  ground:rawTerrainH,
  box:[-TERR.R,-TERR.R,TERR.R,TERR.R],
  cell:32,
  world:'veiledmountains-'+SKEY,
  katabatic:{max:4.2,from:19,to:8.5,ramp:1.5},
  anabatic:{max:3.0,from:9.5,to:17.5,ramp:1.5},
  gaps:[{id:'u-valley-axis',pts:[[-TERR.R,0],[TERR.R,0]],w:220,max:6.5,dayMax:4.2,night:'down',day:'up'}],
  pool:{reach:260,drop:7.5,depth:36}
 });
 sw.bake();
 sw.attach(ATMOS);
 return sw;
})();

const AIR=(function(){
 const q=new URLSearchParams(location.search);
 const out={hfog:false,fogField:false,fogBelt:false,cloudDeck:false,raincover:false,snowcover:false,spray:false,fogBank:false};

 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  const hf=ATMOS.heightFog({
   falloff:SKEY==='southvale'?1/115:(SKEY==='veilpass'?1/210:1/145),
   sun:0.42,
   sky:0.38,
   mist:{
    density:SKEY==='southvale'?0.020:(SKEY==='veilpass'?0.009:0.014),
    below:-16,
    depth:34,
    noise:0.56,
    day:0.68,
    night:0.92,
    colour:[0.70,0.82,0.80],
    mix:0.74,
    samples:5,
    field:{
     at:(x,z)=>VEIL_PHYS.mistAt(x,z,SITE,{hour:8.5,mode:'veil',localY:rawTerrainH(x,z)}).totalMist01,
     extent:[-TERR.R,-TERR.R,TERR.R,TERR.R],
     res:96
    }
   },
   band:{
    density:SKEY==='southvale'?0.014:0.010,
    y:SKEY==='veilpass'?[38,118]:[24,88],
    cover:0.74,
    noise:0.84
   }
  });
  out.hfog=true;
  out.fogField=!!(hf&&hf.field);

  // Mid-slope orographic stratus belt (call BEFORE heightFogScene so materials compile with both fogMistT & fogBeltT!)
  if(typeof ATMOS.fogBelt==='function'){
   ATMOS.fogBelt({
    y0:SKEY==='veilpass'?34:20,
    y1:SKEY==='veilpass'?135:105,
    depth:44,
    density:SKEY==='gorge'||SKEY==='southvale'?0.013:0.009,
    centre:[0,0],
    radius:TERR.R*1.15,
    res:96
   });
   out.fogBelt=true;
  }
  ATMOS.heightFogScene(scene);
 }

 // Outer-basin sea of cloud below the mountain valleys (89-atmos-d-clouddeck.js thins where local ground rises above deckY)
 if(q.get('deck')!=='0'&&typeof ATMOS.cloudDeck==='function'){
  const deckY=SKEY==='veilpass'?-16:-26;
  const cd=ATMOS.cloudDeck({
   y:deckY,
   sun:[0.42,0.78,-0.46],
   bounds:[-TERR.R,-TERR.R,TERR.R,TERR.R],
   name:'Veiled Mountains Outer-Basin Stratus Deck'
  });
  if(cd&&cd.mesh){
   cd.mesh.name='atmos:veil-clouddeck';
   cd.mesh.userData.probeSkip=true;
   out.cloudDeck=true;
  }
 }

 // Canopy rain-occlusion map keeping deep nurse-log understories sheltered from direct streak-draw (fx/raincover)
 if(ATMOS.rainCover&&RAIN_FITS){
  try{out.raincover=!!ATMOS.rainCover({renderer:renderer});}catch(e){reportErr('rain cover: '+e.stack);}
 }

 // Periglacial snow accumulation on upper Veilpass col & crag shoulders (fx/snowcover)
 if(SKEY==='veilpass'&&typeof ATMOS.snowCover==='function'&&typeof ATMOS.snowOn==='function'){
  ATMOS.snowCover({base:0.52,line:[18,54],lee:0.24,depth:0.25});
  ATMOS.snowOn(MAT_GROUND);
  ATMOS.snowOn(VEIL.M.rockMegabreccia);
  out.snowcover=true;
 }

 // Cataract plunge-spray vapour plumes & drifting valley fog-bank ribbons (3-particles.js)
 if(ATMOS.smoke&&ATMOS.PRESETS&&ATMOS.PRESETS.smoke&&ATMOS.PRESETS.smoke.spray){
  const sprayPts=SKEY==='kanopi'
   ?[[-26,2.2,0,'spray'],[-18,1.5,-10,'spray'],[-18,1.5,10,'spray'],[-8,1.2,0,'spray'],[-30,32.0,0,'spray']]
   :SKEY==='gorge'
   ?[[-38,13.2,0,'spray'],[-10,1.4,0,'spray'],[4,1.1,-8,'spray'],[4,1.1,8,'spray']]
   :SKEY==='veilpass'
   ?[[-48,14.5,4,'spray'],[42,20.5,-6,'spray'],[128,25.0,8,'spray']]
   :[[-18,1.2,-20,'spray'],[28,1.0,12,'spray'],[-54,1.4,8,'spray']];
  const sc=ATMOS.smoke(sprayPts,{n:32});
  if(sc)out.spray=true;
 }

 if(typeof ATMOS.fogBank==='function'){
  const bankPts=[];
  for(let i=0;i<18;i++){
   const a=(i/18)*TAU,r=28+(i%3)*36;
   const bx=Math.cos(a)*r,bz=Math.sin(a)*r;
   bankPts.push([bx,rawTerrainH(bx,bz)+2.2,bz]);
  }
  const fb=ATMOS.fogBank(bankPts);
  if(fb){fb.userData.probeSkip=true;out.fogBank=true;}
 }

 return out;
})();

ATMOS.bindWeather({
 climate:{wet:true,snow:SKEY==='veilpass'},
 sun:sun,
 hemi:hemiLight,
 grounds:[MAT_GROUND]
});

// Enforce omnipresent mist floor & glistening wet bark/moss baseline (>= 0.55 even in sun-break!)
tick(()=>{
 const baseWx=SITE.wind[0],baseWz=SITE.wind[1];
 const mode=VEIL_STATE.mode;
 const kWind=mode==='deepveil'?0.72:(mode==='sunbreak'?1.05:0.90);
 if(ATMOS.U&&ATMOS.U.wind)ATMOS.U.wind.value.set(baseWx*kWind,baseWz*kWind);
 if(ATMOS.U&&ATMOS.U.fog){
  const minFog=mode==='deepveil'?0.74:(mode==='sunbreak'?0.26:0.46);
  ATMOS.U.fog.value=Math.max(ATMOS.U.fog.value,minFog);
 }
 if(ATMOS.skyUniforms&&ATMOS.skyUniforms.uWet){
  const minWet=mode==='deepveil'?0.86:(mode==='sunbreak'?0.56:0.72);
  ATMOS.skyUniforms.uWet.value=Math.max(ATMOS.skyUniforms.uWet.value,minWet);
 }
 const baseFogD=SKEY==='southvale'?0.0024:SKEY==='kanopi'?0.0016:SKEY==='gorge'?0.0017:SKEY==='veilpass'?0.0011:0.0015;
 const dMul=mode==='deepveil'?1.55:(mode==='sunbreak'?0.68:1.0);
 scene.fog.density=lerp(scene.fog.density,baseFogD*dMul,0.08);
});
