// ================================================================= HOST — build
// The order a world follows: its own structures first (none on this stage), then the kit, then one bake. The trees are
// records drawn as VARIANTS (86-host-variants: grown once per species and level, instanced, the level by the camera);
// ?unique=1 builds every tree unique instead.
// THE WATER AS FIELDS (core/water ext/60; core/biome 41; the review's third line; the final rebuild, 2026-11-03): one shore for the flora, the ground's
// wet band and the audit. The records exist from the stage (45b: WATER.still and WATER.flow register their surfaces when made), so the fields are read
// here, before the first plant, though the water is drawn later (89b). FIELD.wet and FIELD.flow keep their kit's meaning, but their water term is the
// distance to the water the eye sees (WATER.fieldAt), not to the stream's line or the pool's radius; the wet band on the ground (aGL2.z) reads the same
// shore. ?fields=0 for the old lines
const WATER_F=WATER.fields({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:10,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall'&&!q.seasonal)});
const WATER_FN=WATER.fieldFns(WATER_F);
/* the wet band's share of the water: 1 at the edge, gone by 24 m (the salt lake's shore is a crust, not a marsh: its band is the salt's) */
const WET_SHORE=(x,z)=>smooth(24,1,WATER_FN.shore(x,z));
/* the field contract (core/biome/README.md, "The environmental fields"): the kit's own fields mapped to BIO.ENV's names and units */
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),bands:{upland:[650,1450],flow:40}});
if(new URLSearchParams(location.search).get('fields')!=='0'){const W0=FIELD.wet,F0=FIELD.flow;
 FIELD.wet=(x,z)=>{const s=WATER_FN.shore(x,z);if(s!==s)return W0(x,z);return clamp(Math.max(W0(x,z)*smooth(-1,3,s)+(1-smooth(-1,3,s)),.9*smooth(50,5,s)),0,1);};
 FIELD.flow=(x,z)=>{const d=WATER_FN.flow(x,z);return d==null||d!==d?F0(x,z):clamp(Math.max(F0(x,z)*smooth(-1,3,WATER_FN.shore(x,z)),smooth(40,6,d)),0,1);};}
{const a=GROUND.geometry.attributes.aGL2,p=GROUND.geometry.attributes.position;if(a){for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);a.setZ(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.5,.2,p.getY(i)-w):1));}a.needsUpdate=true;}}
window._biome=null;
const IMP_GAIN=2.4;   /* the impostors' gain (eastabyss 3.6, oidong 2.6, swlowlands and ebadlands 2.4): the bake is ~4x dark; set against the near crowns on 'From afar' */
/* THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner, 2026-11-03: off by default in every build). Since 2026-11-08 on core's own switch (the Throne's
   way): attached always and off at load; the panel's 'shadows' button or ?shadow=1 turns them on, ?shadow=0 none of it (KNOWN_ISSUES.md) */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')!=='0'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting); ?diet=0 keeps the variants' own far level
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1,unique=Q.has('unique')||typeof VARIANTS==='undefined';
 window._variants=!unique;
 // THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendations 1 and 2): the variants' far level on octahedral impostors
 if(!unique&&Q.get('diet')!=='0')VARIANTS.IMP=true;
 NSEMIARID.setWind(WIND);
 NSEMIARID.liveGusts=true;   // the furlers are placed open and shut by core/atmos's gusts (89b-host-atmos.js)
 NSEMIARID.frillLook=Q.get('frill')==='white'?'white':'tint';   // the frill's fins: tinted while green, white ripe (default), or ?frill=white
 try{
  if(unique){window._biome=NSEMIARID.build({R:TERR.R-150,quality:q});}   /* the trumpets' crowns turn here too: the core's foliage spin (BIO.SPIN) */
  else{const out={R:TERR.R-150,quality:q};BIO.cur='nsemiarid/trees';Object.assign(out,NSEMIARID.buildTrees(out.R,q,{records:true}));
   BIO.cur='nsemiarid/floor';Object.assign(out,NSEMIARID.buildFloor(out.R,q));BIO.cur=null;window._biome=out;}}
 catch(e){reportErr('biome: '+e.stack);}
 /* the trees keep off the water by the water's own shore (WATER.fieldAt, the review's third line): a record whose bole would reach past the edge goes
    (the mask keeps roots out of the water by the ground's height under them; a bank's slope can still put a trunk's side in it). ?fields=0 keeps them */
 if(!unique&&Q.get('fields')!=='0'){const n0=NSEMIARID.TREES.length;NSEMIARID.TREES=NSEMIARID.TREES.filter(T=>{const s=WATER_FN.shore(T.x,T.z);return s!==s||s>=Math.min(T.rb==null?.5:T.rb,.6);});window._shoreCut=n0-NSEMIARID.TREES.length;}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 BIO.setA2C(renderer);{const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}   /* R7; R5: the floor's cover takes the ground's colour at its root; the paint's v runs z1..z0 */
 // after the bake (the kit's stores are empty again): grow the variants and draw the records as instances of them
 if(!unique){try{VARIANTS.init();window._instances+=VARIANTS.stats.drawn;}catch(e){reportErr('variants: '+e.stack);}}
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(!unique&&VARIANTS.IMP&&BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180,onDone:()=>{if(VARIANTS.ready)VARIANTS.update(camera.position,true);}});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 /* the flora and the ground cast and receive; the far field, the water and the impostors draw their own light. Off at load (above) */
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene);window._shadow.cast(GROUND,{cast:false});if(FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 /* the land's whole volume from its own ground: its lowest point to its highest, on a 100 m lattice */
 {let lo=1e9,hi=-1e9;for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){if(Math.hypot(x,z)>TERR.R)continue;const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}
  REGISTER({name:STAGE_GROUND.region,x:0,z:0,y:Math.floor(lo-10),r:TERR.R,h:Math.ceil(hi-lo+60)});}
})();
