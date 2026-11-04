// ================================================================= HOST — build, STATION 5: the bog country (replaces src/88-host-build.js)
// As station 1's, with no tower, pillars or Cut natives (none stand on the mire), and THE MIRE'S HAZARDS registered before anything is drawn
// (core/hazard KHAZ, a core/tags record each: PLAN-STATIONS.md station 5): the open mire is `sink` ground (a walker slows and sinks off the
// hummocks), the pools are quaking ground over deep water (`sink` triggered by weight) and `drown` in the dubh lochan.
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then the growth on the
// structures, then one bake. The ground is painted last: it bakes the canopy's
// shade from the trees the biome placed.
// THE MIRE'S HAZARDS: one record for the open mire (a polygon per dome and the string fen), one per pool of any size, the lochan its own
const BOG_HAZARDS=[];   /* every hazard record placed (98's check reads it) */
function bogHazards(){let n=0;const ring=(cx,cz,R,k)=>Array.from({length:k},(_,i)=>{const a=i/k*TAU;return[Math.cos(a)*R,Math.sin(a)*R];});
 DOMES.forEach((D,i)=>{const o={name:'The raised bog '+(i+1)+' (soft ground)',kind:'hazard',x:D.x,z:D.z,y:terrainH(D.x,D.z)-2,r:D.R,h:4,
  tags:{hazard:{kind:'sink',danger:.35,falloff:'smooth',shape:{type:'poly',pts:ring(0,0,D.R*.92,24),h:4,edge:40},move:{speed:.55,sink:.02},trigger:{by:'weight',mass:60}}}};REGISTER(o);BOG_HAZARDS.push(o);n++;});
 BOG_POOLS.forEach(P=>{if(P.a<9&&P.kind!=='lochan')return;
  /* a pool's record is a core/tags record (BIO.record) but not a registered volume: it holds water, which the probe does not sample */
  {const o={name:P.kind==='lochan'?'The dubh lochan (deep, quaking edge)':'A bog pool (quaking edge)',kind:'hazard',x:P.x,z:P.z,y:P.level-P.depth,r:P.a+3,h:P.depth+2,
   tags:{hazard:P.kind==='lochan'?{kind:'drown',danger:.8,falloff:'none',shape:{type:'poly',pts:P.poly.map(q=>[q[0]-P.x,q[1]-P.z]),h:P.depth+2}}
    :{kind:'sink',danger:.6,falloff:'linear',shape:{type:'poly',pts:P.poly.map(q=>[q[0]-P.x,q[1]-P.z]),h:P.depth+2,edge:1.5},move:{speed:.3,sink:.08},trigger:{by:'weight',mass:40}}}};BIO.record(o);BOG_HAZARDS.push(o);}n++;});
 return n;}
var NHL_WATER_F=null;   /* the water's fields (below; 99's edge check reads them) */
window._biome=null;window._dress=null;
(function(){
 const t0=performance.now();let tp=t0;
 // where the time goes (ms): 'pre' is everything before this fragment (the stage's fields, the textures, the sky)
 const PH=window._phases={pre:Math.round(t0)},lap=k=>{const t=performance.now();PH[k]=Math.round(t-tp);tp=t;};
 let shells=[],rocks=[];
 try{window._hazards=bogHazards();}catch(e){reportErr('hazards: '+e.stack);}
 lap('structures');
 const qp=+(new URLSearchParams(location.search).get('q')||1);   // ?q=.4 for a quick look
 /* THE WATER AS FIELDS (core/water ext/60; the review's third line, pair 7): the shore of the water the eye sees, baked over the map at 8 m before the
    first tree, so the trees keep off it by its own edge (55: offShore) and the host's edge check reads the same field (99). ?fields=0 for the old lines */
 if(WATER.fields&&new URLSearchParams(location.search).get('fields')!=='0'){try{NHL_WATER_F=WATER.fields({box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],cell:8,ground:terrainH});
  NHL.SHORE=(x,z)=>WATER.fieldAt(NHL_WATER_F,x,z).shore;}catch(e){reportErr('water fields: '+e.stack);}}
 lap('fields');
 /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendation 2, for the owner to judge; ?diet=0 for the old settings): heroes to 800 m
    (they were drawn to 1300 m, a third to a half of the instanced triangles past 400 m), impostors beyond, and the far floor band
    to 1.1 km (it ran to 2.4 km; the ground paint carries the rest, R5 already fades the floor into it) */
 if(new URLSearchParams(location.search).get('diet')!=='0'){NHL.LOD.tree=800;NHL.LOD.farFloor=1100;}else NHL.IMPOSTORS=false;
 try{window._biome=NHL.build({R:TERR.R*1.42,quality:qp,box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],flora:false});   /* the new flora (HANDOFF-FLORA.md) is the wet old growth's: not on the mire */}catch(e){reportErr('biome: '+e.stack);}
 lap('biome');if(window._biome&&window._biome.ms)Object.assign(PH,window._biome.ms);
 try{window._dress={tower:shells.length?NHL.dress(shells,{y0:TOWER.y0,h:TOWER.top-TOWER.y0,coldTop:.9,ledges:{moss:1500,plants:520,edges:420,hang:10},soffits:{n:1400,hang:9},walls:{n:460}}):null,
  crags:rocks.length?NHL.dress(rocks,{kind:'crag',tops:60*rocks.length,faces:110*rocks.length,seed:7}):null};}catch(e){reportErr('dress: '+e.stack);}
 lap('dress');
 const b=BIO.bake();lap('bake');
 /* the impostors' light matched to the near crowns (the owner's look pass: the far canopy read darker); ?impgain= ?impwrap= to tune */
 if(BIO.impostorLook){const q=new URLSearchParams(location.search);BIO.impostorLook({gain:+(q.get('impgain')||3.6),wrap:+(q.get('impwrap')||1)});   /* measured: the bake comes out ~4x darker than the drawn crowns (HANDOFF: a core fix owed); 3.6 and full wrap match their mean colour */}
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}lap('impostors');   /* the species' views (core/biome 34), after every placement; it waits for the library maps (up to 180 s: 30 ran out on a loaded machine) */
 try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
 if(GROUND&&GROUND.material&&GROUND.material.map)BIO.setGround(GROUND.material.map,[TERR.X0,TERR.Z1,TERR.X1,TERR.Z0]);   /* R5: the floor cover's root colour (the paint's v runs z1..z0) */
 lap('ground');
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STATION_NAME,x:0,z:0,y:700,r:TERR.R*1.42,h:260});
})();
