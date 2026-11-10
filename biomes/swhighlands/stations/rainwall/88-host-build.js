// ================================================================= HOST — build (station 2, the rain wall)
// The biome (SWHI.build, station 'rainwall': 58's trees and floor, the fishing bridge over the seep, 58b's drowned trees), one bake, the far
// trees' impostors baked from their heroes, the ground last (it bakes the canopy's shade from the trees the biome placed).
window._biome=null;
const SWHI_IMP_GAIN=1.6;   /* station 1's measured gain (PERF.md); this station's own measure is owed */
(function(){const t0=performance.now();let tp=t0;const PH=window._phases={pre:Math.round(t0),field:window._fieldMs},lap=k=>{const t=performance.now();PH[k]=Math.round(t-tp);tp=t;};
 const Q=new URLSearchParams(location.search),qp=+(Q.get('q')||1);
 try{window._biome=SWHI.build({station:'rainwall',quality:qp,box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],bridges:BRIDGES});}catch(e){reportErr('biome: '+e.stack);}
 lap('biome');if(window._biome&&window._biome.ms)Object.assign(PH,window._biome.ms);
 const b=BIO.bake();lap('bake');
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||SWHI_IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}lap('impostors');
 try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
 if(GROUND&&GROUND.material&&GROUND.material.map)BIO.setGround(GROUND.material.map,[TERR.X0,TERR.Z1,TERR.X1,TERR.Z0]);
 lap('ground');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The rain wall and the landslide lake (SW highlands, station 2)',x:0,z:0,y:-260,r:TERR.R*1.42,h:1300});
 REGISTER({name:'The rock avalanche (the landslide lake\'s dam)',key:'land.runout',kind:'landform',x:(RUNOUT.a[0]+RUNOUT.b[0])/2,z:(RUNOUT.a[1]+RUNOUT.b[1])/2,y:floorY(SLIDE.x)-5,r:RUNOUT.L*.55,h:LAKE.crest-floorY(SLIDE.x)+40});})();
