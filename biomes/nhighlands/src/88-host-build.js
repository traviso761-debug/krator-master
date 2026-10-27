// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then the growth on the
// structures, then one bake. The ground is painted last: it bakes the canopy's
// shade from the trees the biome placed.
window._biome=null;window._dress=null;
(function(){
 const t0=performance.now();let tp=t0;
 // where the time goes (ms): 'pre' is everything before this fragment (the stage's fields, the textures, the sky)
 const PH=window._phases={pre:Math.round(t0)},lap=k=>{const t=performance.now();PH[k]=Math.round(t-tp);tp=t;};
 let shells=[],rocks=[];
 try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}
 try{rocks=buildPillars()||[];}catch(e){reportErr('pillars: '+e.stack);}
 lap('structures');
 const qp=+(new URLSearchParams(location.search).get('q')||1);   // ?q=.4 for a quick look
 /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendation 2, for the owner to judge; ?diet=0 for the old settings): heroes to 800 m
    (they were drawn to 1300 m, a third to a half of the instanced triangles past 400 m), impostors beyond, and the far floor band
    to 1.1 km (it ran to 2.4 km; the ground paint carries the rest, R5 already fades the floor into it) */
 if(new URLSearchParams(location.search).get('diet')!=='0'){NHL.LOD.tree=800;NHL.LOD.farFloor=1100;}else NHL.IMPOSTORS=false;
 try{window._biome=NHL.build({R:TERR.R*1.42,quality:qp,box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1]});}catch(e){reportErr('biome: '+e.stack);}
 lap('biome');if(window._biome&&window._biome.ms)Object.assign(PH,window._biome.ms);
 try{window._dress={tower:shells.length?NHL.dress(shells,{y0:TOWER.y0,h:TOWER.top-TOWER.y0,coldTop:.9,ledges:{moss:1500,plants:520,edges:420,hang:10},soffits:{n:1400,hang:9},walls:{n:460}}):null,
  crags:rocks.length?NHL.dress(rocks,{kind:'crag',tops:60*rocks.length,faces:110*rocks.length,seed:7}):null};}catch(e){reportErr('dress: '+e.stack);}
 try{window._cut=buildCutNatives(rocks);}catch(e){reportErr('cut natives: '+e.stack);}   /* the Cut's lichen and reeds (87-host-cut.js) */
 lap('dress');
 const b=BIO.bake();lap('bake');
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}lap('impostors');   /* the species' views (core/biome 34), after every placement; it waits for the library maps (up to 180 s: 30 ran out on a loaded machine) */
 try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
 if(GROUND&&GROUND.material&&GROUND.material.map)BIO.setGround(GROUND.material.map,[TERR.X0,TERR.Z1,TERR.X1,TERR.Z0]);   /* R5: the floor cover's root colour (the paint's v runs z1..z0) */
 lap('ground');
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Northern Highlands (ideal type)',x:0,z:0,y:-50,r:TERR.R*1.42,h:1700});
})();
