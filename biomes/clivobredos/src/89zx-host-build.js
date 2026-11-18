// ================================================================= HOST — build
// The order a world follows: the southern highlands' pass (read in place: the cloud forest on the face, the paramo behind the lip), then the lungs'
// pass (72: the rings, the mouths, the bells, the breath meadows), then one bake. The trees keep off the lungs' lines and the collars (45: rootMask
// on KSPACE) and off the fall-out lawns' cores, so the lungs are the one thing that roots on the face's cliff (PLAN.md section 7).
window._biome=null;window._lungs=null;
(function(){const t0=performance.now(),Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):STN.q;
 if(Q.get('diet')==='0'&&typeof SHIGH!=='undefined')SHIGH.IMPOSTORS=false;
 if(typeof SHIGH!=='undefined'&&STN.shigh!==false){try{window._biome=SHIGH.build({R:TERR.R-150,quality:q});}catch(e){reportErr('shighlands (read in place): '+e.stack);}}
 /* THE CANOPY (the Bells): the hyperjungle read in place, its heroes inside 1.5 km, its far crowns as impostors; nothing roots on the face's rock (STN.rootRock) */
 if(typeof HYPERJUNGLE!=='undefined'&&STN.jungle){if(Q.get('diet')!=='0')Object.assign(HYPERJUNGLE.LOD,{tree:1200,sap:1800,floor:800,mid:1800,far:2600});
  try{window._jungle=HYPERJUNGLE.build({R:TERR.R-200,quality:q,heroR:1500,fauna:STN.fauna!==false});   /* its fauna read in place: the fang gliders and the sky rays (PLAN.md section 8) */}catch(e){reportErr('hyperjungle (read in place): '+e.stack);}}
 try{window._lungs=LUNG.build({layout:LUNG_L,ground:terrainH,walk:typeof KWALK!=='undefined'?KWALK:null,normal:(x,z)=>FIELDK.normal(x,z),deckY:CLIP_Y,quality:Math.min(1,q*1.3)});}catch(e){reportErr('lungs: '+e.stack);}
 if(LUNG.buildStair&&STN.stair){try{window._stair=LUNG.buildStair(LUNG_L,{walk:typeof KWALK!=='undefined'?KWALK:null,ground:terrainH,normal:(x,z)=>FIELDK.normal(x,z),scarp:SCARP,y0:1500,y1:2700});}catch(e){reportErr('stair: '+e.stack);}}
 if(Q.has('nobake')){window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 if(BIO.impostorLook)BIO.impostorLook({gain:2.6,wrap:1});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 if(BIO.setA2C)BIO.setA2C(renderer);
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 /* the region's volume holds the land: the deck's band widened to the ground's sampled range over the disc */
 {let lo=Infinity,hi=-Infinity;const N=48,R0=TERR.R*.7;for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const x=(i/N*2-1)*R0,z=(j/N*2-1)*R0;if(x*x+z*z>R0*R0)continue;const h=terrainH(x,z);if(h<lo)lo=h;if(h>hi)hi=h;}
  REGISTER({name:'The Cliff Lungs: '+STN.name+' (ideal type)',x:0,z:0,y:Math.floor(Math.min(lo,CLOUD_Y-80)),r:TERR.R,h:Math.ceil(hi-Math.min(lo,CLOUD_Y-80)+20)});}
})();
