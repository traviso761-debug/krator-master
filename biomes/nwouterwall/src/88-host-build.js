// ================================================================= HOST — build (nwouterwall)
// One kit on the page: its trees, then its floor and the fields of the Three Gifts (the site's beds and pockets, the tors' cracks),
// then its trees become obstacles, then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=NWOW.build({R:SITE.R-40,quality:q,beds:SITE.beds,pockets:SITE.pockets,tors:TORS});}catch(e){reportErr('nwouterwall: '+e.stack);}
 _mark('nwouterwall');
 (NWOW.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.4+.6,y0:T.y0-3,y1:T.y0+T.H}));
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 if(SITE.beds)REGISTER({name:'Sweetroot beds (the Three Gifts\' staple, a row a year of its 3-7)',key:'field.sweetroot',x:SITE.beds.c[0],z:SITE.beds.c[1],y:terrainH(SITE.beds.c[0],SITE.beds.c[1])-1,r:Math.min(SITE.beds.len,SITE.beds.wid)*.5,h:3});
 REGISTER({name:'The NW outer wall: '+SITE.title+' ('+NW_REGION.site.base.toFixed(0)+' m, '+NW_REGION.site.atm.toFixed(2)+' atm; '+SEASON+')',x:0,z:0,r:SITE.R,h:600});
})();
