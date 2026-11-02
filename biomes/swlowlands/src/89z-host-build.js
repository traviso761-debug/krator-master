// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
// 89z, after the water (it was 88): the flora reads the water's own numbers, so the surfaces must exist before the first plant.
// THE WATER AS FIELDS (core/water ext/60; core/biome 41; the final rebuild): one shore for the flora, the ground's wet band and the audit. FIELD.wet and FIELD.flow keep their kit's
// meaning but their water term is now the distance to the water the eye sees (WATER.fieldAt), not to a line; the wet band on the ground (aGM.y) reads the same shore. ?fields=0 for the old lines
const WATER_F=WATER.fields({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:6,ground:terrainH});
const WATER_FN=WATER.fieldFns(WATER_F);
/* the wet band's share of the water: 1 at the edge, gone by 40 m */
const WET_SHORE=(x,z)=>smooth(40,1,WATER_FN.shore(x,z));
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),bands:{upland:[8,158],flow:60}});
if(new URLSearchParams(location.search).get('fields')!=='0'){const W0=FIELD.wet,F0=FIELD.flow;
 FIELD.wet=(x,z)=>{const s=WATER_FN.shore(x,z);return clamp(Math.max(W0(x,z)*smooth(-1,3,s)+(1-smooth(-1,3,s)),.97*smooth(70,6,s)),0,1);};
 FIELD.flow=(x,z)=>{const d=WATER_FN.flow(x,z);return d==null||d!==d?F0(x,z):clamp(smooth(120,4,d),0,1);};}
{const m=window._groundMesh,a=m.geometry.attributes.aGM,p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)a.setY(i,WET_SHORE(p.getX(i),p.getZ(i))*smooth(-2,.5,p.getY(i)));a.needsUpdate=true;}
window._biome=null;
// ?q=0.5 (or window.KRATOR_Q) scales every count in the biome: the knob for a weaker machine
const BIOME_Q=(()=>{let q=+(window.KRATOR_Q||0);try{q=q||+(new URLSearchParams(location.search).get('q'));}catch(e){}return q>0?Math.min(q,1.5):1;})();
const IMP_GAIN=2.4;   /* the impostors' gain (eastabyss 3.6, nwbay and swbay 2.2, sedesert 2.6): set against the near crowns on 'From the hills' at this turn */
(function(){
 const t0=performance.now(),Q=new URLSearchParams(location.search);
 let shells=[];
 if(!ST&&typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendations 1 and 2; ?diet=0 for the kit's old LOD and blobs): heroes to 850 m, octahedral impostors past that, the floor bands to 800 m. The floor's own
    near bands are the owner's call on KNOWN_ISSUES.md's chunk trade: at 1200 they saved calls, but the merge now gives one mesh a chunk whatever the ranges, so the 800 m the note offered costs no calls */
 if(Q.get('diet')!=='0')Object.assign(SWLOW.LOD,{tree:850,avenue:1600,floor:800,floorMid:1000,farFloor:1000,under:800,logs:800,dress:800});else SWLOW.IMPOSTORS=false;
 if(typeof swlowKinVeto==='function')swlowKinVeto();
 try{window._biome=SWLOW.build(ST?{R:TERR.R-150,quality:BIOME_Q}:{R:TERR.R-150,quality:BIOME_Q,avenues:[{path:ROAD,spacing:24,offset:13.5,species:'sprawloak'}],groves:[CORK_GROVE]});}catch(e){reportErr('biome: '+e.stack);}
 if(typeof growKin==='function'){try{window._kin=growKin();}catch(e){reportErr('kin: '+e.stack);}}
 if(shells.length){try{SWLOW.dress(shells,{ledges:{moss:2200,plants:900,edges:520,hang:14},soffits:{n:1800,mossR:4,hang:14},walls:{n:520}});}catch(e){reportErr('dress: '+e.stack);}}
 const b=BIO.bake();
 BIO.setA2C(renderer);
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER(ST&&ST.region?ST.region:{name:'The southwestern lowlands (ideal type)',x:0,z:0,r:TERR.R,h:420});
})();
