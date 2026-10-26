// ================================================================= HOST — build (the steppe fringe)
// The rock is up (47: its bodies are obstacles). The fairy circles' discs are laid out here from 45's lattice and handed to the
// floor with the wind (SEDESERT.STEPPE_HOST); then the kit, its passes the steppe's (59, 67), then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 // the discs: every lattice point of each field, kept off the rock, the wadi and the pan
 const discs=fairyDiscs().filter(D=>FIELD.wadi(D.x,D.z)<.2&&FIELD.pan(D.x,D.z)<.2&&FIELD.kopje(D.x,D.z)<.1);
 const near=(x,z)=>{const D=fairyAt(x,z);return D&&D.u<1?D:null;};
 SEDESERT.STEPPE_HOST={discs,wind:WIND,insideDisc:near,gnamma:GNAMMA.map(G=>({x:G.x,z:G.z,r:G.r,level:G.level}))};
 const fauna=(kind,x,z)=>kind!=='deer'&&FIELD.kopje(x,z)<.5;
 try{window._biome=SEDESERT.build({R:TERR.R-150,quality:q,fauna});}catch(e){reportErr('biome: '+e.stack);}
 _mark('biome');
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The steppe fringe (the eastern desert, station 3): bunchgrass, kopjes and tors, fairy circles, a seasonal pan',x:0,z:0,y:H0-30,r:TERR.R,h:400});
 _mark('bake');
})();
