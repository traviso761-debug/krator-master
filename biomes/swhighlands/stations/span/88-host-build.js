// ================================================================= HOST — build (station 3, Span's tableland)
// The biome (SWHI.build, station 'tableland': 59's anemone trees on the domes, the hanging swamps' cell lamps, wing reeds and bulb
// trumpets, and the slickrock's torch spikes, bead coral, cushions and turf), one bake, the impostors, the ground last.
window._biome=null;
const SWHI_IMP_GAIN=1.6;   /* station 1's measured gain (PERF.md); this station's own measure is owed */
(function(){const t0=performance.now();let tp=t0;const PH=window._phases={pre:Math.round(t0),field:window._fieldMs},lap=k=>{const t=performance.now();PH[k]=Math.round(t-tp);tp=t;};
 const Q=new URLSearchParams(location.search),qp=+(Q.get('q')||1);
 try{window._biome=SWHI.build({station:'tableland',quality:qp,box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1]});}catch(e){reportErr('biome: '+e.stack);}
 lap('biome');if(window._biome&&window._biome.ms)Object.assign(PH,window._biome.ms);
 const b=BIO.bake();lap('bake');
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||SWHI_IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}lap('impostors');
 try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
 if(GROUND&&GROUND.material&&GROUND.material.map)BIO.setGround(GROUND.material.map,[TERR.X0,TERR.Z1,TERR.X1,TERR.Z0]);
 lap('ground');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'Span\'s tableland (SW highlands, station 3)',x:-400,z:-1450,y:-60,r:TERR.R*2.2,h:700});
 /* the seep pools are core/tags records, not registered volumes (a registered volume is a drawn thing the probe must find) */
 SEEP_POOLS.forEach(P=>BIO.record({name:'A hanging swamp\'s seep pool',key:'water.seep',kind:'water',x:P.x,z:P.z,y:P.level-1,r:P.r+1,h:3,id:P.id}));})();
