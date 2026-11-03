// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
window._biome=null;
// ?q=0.5 (or window.KRATOR_Q) scales every count in the biome: the knob for a weaker machine
const BIOME_Q=(()=>{let q=+(window.KRATOR_Q||0);try{q=q||+(new URLSearchParams(location.search).get('q'));}catch(e){}return q>0?Math.min(q,1.5):1;})();
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendations 1 and 2; ?diet=0 the old page): heroes and the groves' culms in full to 900 m with octahedral impostors past that, the floor's mid band to 1000 m, its far band to 900 m (the ground paint carries the rest) */
 if(NWQ_ON('diet'))Object.assign(NWLOW.LOD,{tree:900,grove:900,floorMid:1000,farFloor:900});else NWLOW.IMPOSTORS=false;
 if(MG)NWLOW.treeK=MG.treeK;
 try{window._biome=NWLOW.build({R:TERR.R-150,quality:BIOME_Q,avenues:MG?[]:[{path:ROAD,spacing:16,offset:9,species:'ghostgum'}]});}catch(e){reportErr('biome: '+e.stack);}
 if(shells.length){try{NWLOW.dress(shells,{ledges:{moss:2200,plants:900,edges:520,hang:14},soffits:{n:1800,mossR:4,hang:14},walls:{n:520}});}catch(e){reportErr('dress: '+e.stack);}}
 try{window._kin=growKin();}catch(e){reportErr('kin: '+e.stack);}   /* the neighbours' cousins (87k-host-kin.js, EXCHANGES.md) */
 if(typeof stationBuild==='function'){try{window._station=stationBuild();}catch(e){reportErr('station: '+e.stack);}}   /* a station's own passes (its 87) */
 try{window._gorge=gorgePass();}catch(e){reportErr('gorge: '+e.stack);}   /* the marl's ledges and talus, the river's bars (87-host-gorge.js) */
 const b=BIO.bake();
 /* the impostors' light matched to the near crowns (the bake is ~4x dark: HANDOFF-REBUILD.md); ?impgain= ?impwrap= */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(NWQ.get('impgain')||3.6),wrap:+(NWQ.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement, the library's maps in: the species' views (core/biome 34) */
 /* THE TERRAIN'S HORIZON (core/terrain KHORIZON; ?horizon=0 off): baked over the map and the Inner Wall's far lattice, so at a low sun the range's shadow crosses the foothills and the gorge sees less sky; the ground and every lit material on the land, not the far field */
 if(typeof KHORIZON!=='undefined'&&NWQ_ON('horizon')){try{const t1=performance.now(),S=TERR.R*1.1,HZ=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,far:NWLOW.farH?{h:NWLOW.farH,box:[-11000,-11000,11000,11000],n:200}:undefined});
  window._horizon={ms:Math.round(performance.now()-t1),n:HZ.n};KHORIZON.shade(MAT_GROUND,HZ);if(MAT_MARL)KHORIZON.shade(MAT_MARL,HZ);window._horizon.mats=KHORIZON.shadeScene(scene,HZ,{filter:m=>!(m.userData&&m.userData.farField)});}catch(e){reportErr('horizon: '+e.stack);}}
 /* R5: the floor cover's root colour from the ground's paint (its v runs z1..z0 over the painted square) */
 if(NWLOW_LOOK.rootcol){const S=TERR.R*1.1;BIO.setGround(MAT_GROUND.map,[-S,S,S,-S]);}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:MG?MG.region:'The northwestern lowlands (ideal type)',x:0,z:0,r:TERR.R,h:420});
})();
