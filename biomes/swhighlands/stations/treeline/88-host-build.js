// ================================================================= HOST — build (station 6, the treeline)
// The biome (SWHI.build, station 'treeline'), one bake, the far trees' impostors baked from their heroes, the ground last (it bakes
// the canopy's shade from the trees the biome placed).
window._biome=null;
const SWHI_IMP_GAIN=1.6;   /* station 1's measured gain (PERF.md); this station's own measure is owed */
(function(){const t0=performance.now();let tp=t0;const PH=window._phases={pre:Math.round(t0),field:window._fieldMs},lap=k=>{const t=performance.now();PH[k]=Math.round(t-tp);tp=t;};
 const Q=new URLSearchParams(location.search),qp=+(Q.get('q')||1);
 try{window._biome=SWHI.build({station:'treeline',quality:qp,box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1]});}catch(e){reportErr('biome: '+e.stack);}
 lap('biome');if(window._biome&&window._biome.ms)Object.assign(PH,window._biome.ms);
 const b=BIO.bake();lap('bake');
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||SWHI_IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}lap('impostors');
 try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
 if(GROUND&&GROUND.material&&GROUND.material.map)BIO.setGround(GROUND.material.map,[TERR.X0,TERR.Z1,TERR.X1,TERR.Z0]);
 lap('ground');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The treeline (SW highlands, station 6)',x:0,z:0,y:-600,r:TERR.R*1.42,h:1800});})();
