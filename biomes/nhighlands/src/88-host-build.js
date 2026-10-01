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
 try{window._biome=NHL.build({R:TERR.R*1.42,quality:qp,box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1]});}catch(e){reportErr('biome: '+e.stack);}
 lap('biome');if(window._biome&&window._biome.ms)Object.assign(PH,window._biome.ms);
 try{window._dress={tower:shells.length?NHL.dress(shells,{y0:TOWER.y0,h:TOWER.top-TOWER.y0,coldTop:.9,ledges:{moss:1500,plants:520,edges:420,hang:10},soffits:{n:1400,hang:9},walls:{n:460}}):null,
  crags:rocks.length?NHL.dress(rocks,{kind:'crag',tops:60*rocks.length,faces:110*rocks.length,seed:7}):null};}catch(e){reportErr('dress: '+e.stack);}
 lap('dress');
 const b=BIO.bake();lap('bake');
 try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
 lap('ground');
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Northern Highlands (ideal type)',x:0,z:0,y:-50,r:TERR.R*1.42,h:1700});
})();
