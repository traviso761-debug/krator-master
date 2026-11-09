// ================================================================= HOST — build
// The order a world follows: the station's landforms registered as records (core/tags: the front, the cones, the pan, the
// procession's way, the tumuli), then the kit's ground stuff and pioneers, then one bake, then the ground (it bakes the
// terrain's horizon over everything placed).
window._biome=null;
(function(){
 const t0=performance.now();let tp=t0;
 const PH=window._phases={pre:Math.round(t0),field:window._fieldMs},lap=k=>{const t=performance.now();PH[k]=Math.round(t-tp);tp=t;};
 if(typeof stationRecords==='function')try{stationRecords();}catch(e){reportErr('records: '+e.stack);}
 lap('records');
 const qp=+(new URLSearchParams(location.search).get('q')||1);   // ?q=.4 for a quick look
 try{window._biome=GSTEP.build({R:TERR.R,quality:qp,box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],path:typeof PATH!=='undefined'?PATH.pts:[]});}catch(e){reportErr('biome: '+e.stack);}
 lap('biome');
 if(typeof stationBuild==='function'){try{window._station=stationBuild();}catch(e){reportErr('station: '+e.stack);}lap('station');}
 const b=BIO.bake();lap('bake');
 try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
 lap('ground');
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STN.title.replace('Krator ','')+' (the station)',x:TERR.cx,z:TERR.cz,...(()=>{const m=GROUND_F.stats();return{y:m.min-100,h:m.max-m.min+300};})(),r:TERR.R*1.42});
})();
