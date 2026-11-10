// ================================================================= HOST — build
// The order a world follows: its own structures first (the station's cavern: its tubes, its skylight, its portal, stationBuild in the
// station's 87: the kit's pass reads the holes it cuts), then the kit's ground stuff and warm collars, then one bake, then the ground (it
// bakes the terrain's horizon over everything placed). The Twins' plumes come after the atmosphere is bound (89b-host-twins.js).
window._biome=null;
(function(){
 const t0=performance.now();let tp=t0;
 const PH=window._phases={pre:Math.round(t0),field:window._fieldMs},lap=k=>{const t=performance.now();PH[k]=Math.round(t-tp);tp=t;};
 if(typeof stationBuild==='function'){try{window._station=stationBuild();}catch(e){reportErr('station: '+e.stack);}}
 lap('structures');
 const qp=+(new URLSearchParams(location.search).get('q')||1);   // ?q=.4 for a quick look
 try{window._biome=TWINS.build({R:TERR.R,quality:qp,box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],route:STN.route?STN.route():null,warm:STN.warm?STN.warm():[],oasis:STN.oasis?STN.oasis():null});}catch(e){reportErr('biome: '+e.stack);}
 lap('biome');
 const b=BIO.bake();lap('bake');
 try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
 lap('ground');
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STN.title.replace('Krator ','')+' (the station)',x:TERR.cx,z:TERR.cz,...(()=>{const m=GROUND_F.stats();return{y:m.min-100,h:m.max-m.min+300};})(),r:TERR.R*1.42});
})();
