// ================================================================= HOST — build (k-guilin)
// One kit on the page (with nwbay's species it places: 55): its trees, the cliffs' dressing and the ground plants, then its
// trees become obstacles, then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=KGUILIN.build({R:TERR.R-60,quality:q,pond:{level:POND.level,at:pondE},lake:{level:LAKE.level}});}catch(e){reportErr('kguilin: '+e.stack);}
 _mark('kguilin');
 (KGUILIN.TREES||[]).concat(KGUILIN.BTREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.5+1,y0:T.y0-3,y1:T.y0+T.H}));
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Hykkousoi hinterlands (the lakeshore by Trigon)',x:0,z:0,r:TERR.R,h:200});
})();
