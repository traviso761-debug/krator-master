// ================================================================= HOST — build (seouterwall; forked from biomes/wouterwall's)
// The kit's build (SEOW.build: at station 1 the NW outer wall's passes, read in place: its trees, then its floor), then the trees become
// obstacles, then one bake; then the far trees' impostors, and the air on everything drawn. After the water (89w): the water's fields
// read the drawn brook, and every scene-wide hook (the clouds' shade, the weather's wet, height fog, the snow, the terrain's horizon,
// the sun's shadows) runs once here, after the bake.
// THE WATER AS FIELDS (core/water ext/60; core/biome 41): one shore for the audit and the field contract, the distance to the water the
// eye sees (WATER.fieldAt); the kit keeps its own mask (waterMask: the records' levels), so nothing placed moves. ?fields=0 none
const WATER_F=new URLSearchParams(location.search).get('fields')!=='0'&&WATER.fields&&WATER.surfaces&&WATER.surfaces.length?
 WATER.fields({box:[-SITE.R*1.05,-SITE.R*1.05,SITE.R*1.05,SITE.R*1.05],cell:10,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall')}):null;
const WATER_FN=WATER_F?WATER.fieldFns(WATER_F):null;
/* the field contract (core/biome/README.md, "The environmental fields"): the kit's fields mapped to BIO.ENV's names and units */
const ENV=BIO.env?BIO.env({ground:terrainH,water:WATER_FN||undefined}):null;
const IMP_GAIN=2.4;   /* the impostors' gain (ebadlands 2.4, oidong and korona 2.6, the outer walls 2.4): the bake is ~4x dark; to be set against the near larch on the GPU */
/* THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner, 2026-11-03): toggleable and OFF by default; ?shadow=1 turns them on */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
window._biome=null;window._shadow='off';
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 if(Q.get('diet')==='0')NWOW.IMPOSTORS=false;   /* ?diet=0: the far trees keep their blobs (nwouterwall's 55) */
 try{window._biome=SEOW.build({R:SITE.R-40,quality:q});}catch(e){reportErr('seouterwall: '+e.stack);}
 _mark('seouterwall');
 // THE HEARTHS (station 3: biomes/hearths, read in place): the hearth trees, their coal moss, stokers and dead stalks placed on the ground's
 // heat (KTHERM: HEARTH.layout, never a noise), in the 'rim' dress (broad fans, few, high: the plan's dwarf alpine hearth-trees, 4-11 m)
 if(SITE.hearths&&HEAT&&typeof HEARTH!=='undefined'){try{const Hs=SITE.hearths,q=Q.has('q')?+Q.get('q'):1;BIO.kit('hearths');HEARTH.parts(Hs.dress);BIO.kit('');
   BIO.cur='hearths/field';window._field=HEARTH.layout({therm:HEAT.F,at:Hs.at,R:Hs.R,dress:Hs.dress,seed:Hs.seed,toward:{az:0,alt:30},ground:terrainH,
    mask:(x,z)=>{const Z=SEOW.zoneAt(x,z);return Z==='water'||Z==='road'||Z==='sinter'?0:BIO.mask(x,z);},deadRings:Hs.dead,q});BIO.cur=null;
   (window._field.trees||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.r+.8,y0:T.y-1,y1:T.y+T.H}));}catch(e){reportErr('hearths: '+e.stack);}}
 (NWOW.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.4+.6,y0:T.y0-3,y1:T.y0+T.H}));
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 BIO.setA2C(renderer);   /* R7: the cut-outs by alpha-to-coverage */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The SE outer wall: '+SITE.title+' ('+SEOW_REGION.site.base.toFixed(0)+' m, '+SEOW_REGION.site.atm.toFixed(2)+' atm; '+SEASON+')',x:0,z:-200,r:SITE.R,h:600});
})();

// ---------------------------------------------------------------- the air on everything drawn (once, after the bake)
// The order: the rain occlusion map first (the clouds' shade reads it when it compiles), the clouds' shade on every lit material, the
// weather (its wet on the ground), height fog, the snow last (snowOn wraps each material's hooks as they are), then the terrain's
// horizon and the sun's shadows. The water's own meshes are left as they were drawn (89w: no shade, no snow on them).
/* the dawn mist's floor: the col's outwash flat (the night's cold air pools in the hollow), the lowest of the brook and the flat's middle */
const lowWater=()=>{const L=[terrainH(0,0)];if(STREAM)L.push(Math.min(...STREAM.level));if(MODEL_LAKE)L.push(MODEL_LAKE.level);return Math.min(...L);};
const AIR=(function(){const Q=new URLSearchParams(location.search),out={raincover:false,hfog:false,horizon:false};
 const WM=new Set(WATER_DRAW?[WATER_DRAW.stream&&WATER_DRAW.stream.mesh,WATER_DRAW.still].concat((WATER_DRAW.falls||[]).map(f=>f.D&&f.D.mesh)).filter(Boolean):[]);
 const isWater=o=>WM.has(o)||/^water:/.test(o.name||'');   /* 89w's meshes */
 // THE RAIN OCCLUSION MAP (R10, core/atmos/fx/89-atmos-fx-raincover.js): no rain, wet or fresh snow under the larch's crowns
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 // the clouds' shadows and the weather's darkening on the ground, the plants and the rock (SKY-PLAN.md 11.1): every lit material, once
 {const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material||isWater(o))return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
   if(seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);
   ATMOS.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});}
 // THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js): a cold climate (snowfall and blizzards besides the base five); the ground
 // wets in the rain. It starts clear, so the page looks as it is; the Weather selector in the panel picks the rest. The shared sky
 // (89s) draws the weather's light and air from the colour script (its o.weather), so the binding is given no sun, hemisphere or
 // fog of its own to scale: a stand-in fog takes its writes (the sky's own fog is the page's). Lightning rides with its storms
 // (fx/89-atmos-fx-lightning.js). R9 (puddles, WATER.hollows) not taken: a dry country, and oidong's finding on a KGROUND floor
 ATMOS.bindWeather({climate:{cold:true},fog:{color:new THREE.Color(0x9aa0a6),density:.00005},grounds:[MAT_GROUND]});
 // HEIGHT FOG (R1, core/atmos/sky/89-atmos-j-fog.js + host/89-atmos-j-heightfog.js): the air's fog thins above the ground under the eye
 // (dry air: a long falloff), and the dawn's cold air pools as a shallow mist on the col's flat (the God-Bore's cold air drains into
 // the hollow every night). ?hfog=0 leaves the page's fog as it was
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){try{const W0=lowWater();
   ATMOS.heightFog({falloff:1/1100,sun:.3,sky:.35,mist:W0==null?undefined:{density:.0006,y:W0+6,depth:10,noise:.7}});
   ATMOS.heightFogScene(scene);out.hfog=true;}catch(e){reportErr('height fog: '+e.stack);}}
 // the snow last (89a bound its cover): snowOn wraps each material's shader hooks as they are now, cloud shade included
 ATMOS.snowOnScene(scene);
 // THE TERRAIN'S HORIZON (core/terrain/45-core-horizon.js, KHORIZON): the horizon in eight directions baked over the near box and, beyond
 // it, over the model's country to 16 km, so at a low sun the cordillera's walls throw their shadows across the col, and the crags and
 // the moraines theirs. On the ground and on what stands on it (the far trees' quads and the sky's own meshes are left). ?hz=0 none
 if(typeof KHORIZON!=='undefined'&&Q.get('hz')!=='0'){try{const t0=performance.now(),N=SITE.R*1.05;
   const HZ=KHORIZON.bake({box:[-N,-N,N,N],n:256,h:terrainH,far:{h:(x,z)=>baseH(x,z),box:[-16000,-16000,16000,16000],n:200}});
   KHORIZON.shade(MAT_GROUND,HZ);   /* the near and the mid ground share it */
   const mats=KHORIZON.shadeScene(scene,HZ,{filter:m=>!isWater(m)&&m.material!==MAT_GROUND&&m!==SKY.mesh});
   window._horizon={ms:Math.round(performance.now()-t0),n:HZ.n,mats};out.horizon=true;}catch(e){reportErr('horizon: '+e.stack);}}
 // THE SUN'S SHADOWS, on ?shadow=1 only
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});window._shadow.cast(scene);}catch(e){reportErr('shadow: '+e.stack);}}
 return out;})();
_mark('air');
// THE HEARTHS' ENGINE (station 3; biomes/oidong's station): the fans open flat by night and in an eclipse (ATMOS.sunHidden), fold into
// spindles by day; cloud closes them. One write a frame to the breath's shared state (core/biome 35, mode 'breath', shape 'fold')
if(window._field&&typeof HEARTH!=='undefined'&&HEARTH.work&&BIO.breathState)tick(()=>{const d=new THREE.Vector3().subVectors(sun.position,sun.target.position).normalize(),alt=Math.asin(clamp(d.y,-1,1))*180/Math.PI;
 const t=ATMOS.clock?ATMOS.clock.t||0:0,hid=ATMOS.sunHidden?ATMOS.sunHidden(t):0,W=ATMOS.W||null;
 BIO.breathState('hearths').value=HEARTH.work(t,{sunAlt:sun.intensity<.02?-20:alt,hidden:hid,W:W?{cloud:W.cloud==null?0:W.cloud}:null,atm:ATM});});
