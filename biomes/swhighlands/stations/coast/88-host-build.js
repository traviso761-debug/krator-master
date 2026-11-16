// ================================================================= HOST — build (station 5, the fan coast)
// The biome (SWHI.build, station 'coast': 59c's star-fruit caudex and coral melons, arrowheads, frill tubes, trumpet slugs and flame
// pods), then the crater drylands' yucca and sword spires (87-host-kin.js), one bake, the impostors, the ground last.
window._biome=null;
const SWHI_IMP_GAIN=1.6;   /* station 1's measured gain (PERF.md); this station's own measure is owed */
(function(){const t0=performance.now();let tp=t0;const PH=window._phases={pre:Math.round(t0),field:window._fieldMs},lap=k=>{const t=performance.now();PH[k]=Math.round(t-tp);tp=t;};
 const Q=new URLSearchParams(location.search),qp=+(Q.get('q')||1);
 /* the whole map is the scarp, so the coast's pass runs at a fifth of its density (59c's cells were sized for a scarp's strip: at 1 it grew 56,000 caudex) */
 try{window._biome=SWHI.build({station:'coast',quality:qp*.2,box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1]});}catch(e){reportErr('biome: '+e.stack);}
 try{const k=STATION_GROW();if(window._biome)window._biome.kin=k;}catch(e){reportErr('kin: '+e.stack);}
 lap('biome');if(window._biome&&window._biome.ms)Object.assign(PH,window._biome.ms);
 const b=BIO.bake();lap('bake');
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||SWHI_IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}lap('impostors');
 try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
 if(GROUND&&GROUND.material&&GROUND.material.map)BIO.setGround(GROUND.material.map,[TERR.X0,TERR.Z1,TERR.X1,TERR.Z0]);
 lap('ground');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The fan coast (SW highlands, station 5)',x:0,z:0,y:-120,r:TERR.R*1.42,h:2000});
 WADI_RECS.forEach((R,k)=>{if(R.fan)REGISTER({name:'A fan delta (the wadi\'s cone, on into the sea)',key:'land.fan',kind:'landform',x:R.fan.x,z:R.fan.z,y:-8,r:R.fan.r*.8,h:R.fan.y+12});});})();
