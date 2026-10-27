// ================================================================= HOST — build
// The order the page follows: the rock bodies first (47-host-land.js: they fill OBSTACLES), then the biome, then one bake, the
// far trees' impostors baked from their heroes, and the ground last (it bakes the canopy's shade from the trees the biome placed).
window._biome=null;
const SWHI_IMP_GAIN=1.6;   /* the impostors' gain, measured on this page (PERF.md): their mean colour at 1.6 matches the drawn heroes' */
(function(){
 const t0=performance.now();let tp=t0;
 // where the time goes (ms): 'pre' is everything before this fragment (the field's bake, the fields, the rock, the far country)
 const PH=window._phases={pre:Math.round(t0),field:window._fieldMs},lap=k=>{const t=performance.now();PH[k]=Math.round(t-tp);tp=t;};
 const Q=new URLSearchParams(location.search),qp=+(Q.get('q')||1);   /* ?q=.4 for a quick look */
 try{window._biome=SWHI.build({quality:qp,box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],bald:[BALD.x,BALD.z,BALD.r],
  sheet:Q.get('sheet')==='pillars'?[BALD.x+30,BALD.z-40,0]:null});   /* ?sheet=pillars: station 4's flora laid out on the bald (a preview, 57) */}catch(e){reportErr('biome: '+e.stack);}
 lap('biome');if(window._biome&&window._biome.ms)Object.assign(PH,window._biome.ms);
 const b=BIO.bake();lap('bake');
 /* the impostors' light matched to the near crowns (core/biome's bake comes out darker than the drawn crowns: HANDOFF-REBUILD.md,
    "Owed in core"); measured on this page (PERF.md); ?impgain= ?impwrap= to tune */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||SWHI_IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}lap('impostors');
 try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
 if(GROUND&&GROUND.material&&GROUND.material.map)BIO.setGround(GROUND.material.map,[TERR.X0,TERR.Z1,TERR.X1,TERR.Z0]);   /* R5: the floor's root colour (the paint's v runs z1..z0) */
 lap('ground');
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The ring folds (SW highlands, station 1)',x:0,z:0,y:-80,r:TERR.R*1.42,h:700});
})();
