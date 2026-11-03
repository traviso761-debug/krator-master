// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES), the kit's flow history (47 made it with
// this showcase's flows, before the terrain was bound), then the kit, then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting)
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=THRONE.build({R:TERR.R-150,quality:q});}catch(e){reportErr('biome: '+e.stack);}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 // the map-wide volume stands on the shoulder's own height (it is ~1.6 to 2.1 km up)
 REGISTER({name:'The Throne: the plume\'s edge (ideal type)',x:0,z:0,y:slopeH(0,0)-400,r:TERR.R,h:1000});
})();
