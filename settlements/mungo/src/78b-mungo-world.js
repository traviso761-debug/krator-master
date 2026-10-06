/* ============================== 21. MUNGO'S WORLD AS DATA — the simulation's places, layers and people ==============================
   core/simulation (SIM) is the vocabulary; this fragment is Mungo's declaration into it, in PLAN.md 4.2's order:
     1. the host binding: the world clock (MCLOCK, 80-camera.js) gives SIM its hour and day, motion time its t
     2. the NAVIGATION LAYERS: 'pedestrian' (the walk graph 30-layout.js built: streets, the pontoon, the reed decks),
        'road' (the same graph; wheels and caravans ask for width), 'water' and 'animal' (grids on the route grid RG,
        answering the same route() call: the boats round the islands, the lizard riders across country)
     3. the PLACES, derived from what was built (PLACED, the reed village's records, the fields, the forest grounds,
        the fishing water) with the activities they offer and their slots; then the PORTS (the map-edge entries)
     4. the hand-edited overlay, settlements/mungo/world/*.json (factions, orgs, relations, activities, roles, events,
        and any place it overrides), through SIM.load
     5. the POPULATION from the roles' counts and home kinds (SIM.populate), each fisher given a boat at a dock and each
        Geomancer a buggy at the park; then SIM.check (every reference resolves) and SIM.REF for the audits.
   No rule lives in the drawing (84-mungo-life.js only reads SIM): who goes where, when, and on what is all here or in
   the JSON.                                                                                                        */
var MUNGO_SIM = null;
(function(){
  if(SHEET) return;
  SIM.init({ seed:20261005, hour:function(){ return MCLOCK.hour; }, day:function(){ return MCLOCK.day; }, t:function(){ return MCLOCK.t; },
             err:function(m){ ERR('sim: '+m); } });

  /* ---------------------------------------------------------------- 2. the navigation layers */
  SIM.nav.layer('pedestrian', { nodes:NAV.nodes, edges:NAV.edges, cost:{ deck:1, pontoon:1.05, ground:1 } });
  SIM.nav.layer('road', { nodes:NAV.nodes, edges:NAV.edges.filter(function(e){ return e.kind==='ground'; }) });
  /* the water: the lake and the river cells of the route grid, less the reed islands, their pads and the pontoon */
  var NG=RG.n, WATER=new Uint8Array(NG*NG), LANDX=new Uint8Array(NG*NG);
  for(var j=0;j<NG;j++) for(var i=0;i<NG;i++){ var k=j*NG+i, x=rgX(i), z=rgX(j), w=RG.W[k];
    if(w===3 || w===1){ if(REED.onIsland(x,z,4) || REED.onPad(x,z,4)) continue;
      if(segDist(x,z,PONTOON.a[0],PONTOON.a[1],PONTOON.b[0],PONTOON.b[1]) < 7) continue; WATER[k]=1; } }
  function nearestCell(mask, x, z){ var k0=rgIdx(x,z); if(k0>=0 && mask(k0)) return k0; var i0=Math.floor((x+RG.ext)/RG.cell), j0=Math.floor((z+RG.ext)/RG.cell), best=-1, bd=1e9;
    for(var r=1;r<8 && best<0;r++) for(var dj=-r;dj<=r;dj++) for(var di=-r;di<=r;di++){ if(Math.max(Math.abs(di),Math.abs(dj))!==r) continue; var ii=i0+di, jj=j0+dj; if(ii<0||jj<0||ii>=NG||jj>=NG) continue;
      var kk=jj*NG+ii; if(!mask(kk)) continue; var d=Math.hypot(rgX(ii)-x, rgX(jj)-z); if(d<bd){ bd=d; best=kk; } }
    return best; }
  function cellXZ(k){ var i=k%NG, j=(k-i)/NG; return [rgX(i), rgX(j)]; }
  function gridRoute(mask, cost, yOf){ return function(ax,az,bx,bz){
    var s=nearestCell(mask,ax,az), t=nearestCell(mask,bx,bz); if(s<0||t<0) return null;
    var T=cellXZ(t), cells=rgAStar(s, function(k,from){ return mask(k) ? cost(k,from) : Infinity; }, function(k){ return k===t; }, function(k){ var p=cellXZ(k); return Math.hypot(p[0]-T[0],p[1]-T[1])/RG.cell; }, 200000);
    if(!cells) return null;
    /* string-pull: keep a cell only when the straight line past it would leave the mask */
    var P=cells.map(cellXZ), out=[[ax,az]], cur=[ax,az];
    function clear(p,q){ var L=Math.hypot(q[0]-p[0],q[1]-p[1]), n=Math.ceil(L/4); for(var m=1;m<n;m++){ var kk=rgIdx(mix(p[0],q[0],m/n), mix(p[1],q[1],m/n)); if(kk<0 || !mask(kk)) return false; } return true; }
    for(var q=1;q<P.length;q++){ if(!clear(cur, P[q])){ cur=P[q-1]; out.push(cur); } }
    out.push([bx,bz]);
    return { pts:out.map(function(p){ return [p[0], yOf(p[0],p[1]), p[1]]; }) }; }; }
  SIM.nav.layer('water', { route:gridRoute(function(k){ return WATER[k]===1; }, function(k){ return RG.H[k] > -1.4 ? 2.2 : 1; }, function(){ return 0.05; }) });
  /* the lizard riders: across country; inside the town only along its streets (the route grid's BLOCK and ROAD) */
  SIM.nav.layer('animal', { route:gridRoute(function(k){ return RG.W[k]!==3 && (!RG.BLOCK[k] || RG.ROAD[k]); },
    function(k,from){ if(RG.ROAD[k]) return 0.8; var w=RG.W[k]; return (w===1?6:w===4?3:1) + Math.abs(RG.H[k]-RG.H[from])*1.4; },
    function(x,z){ var b=bridgeDeckAt(x,z); return b!=null ? b : Math.max(terrainH(x,z), 0); }) });

  /* ---------------------------------------------------------------- 3. the places, from what was built */
  var nP=0;
  function door(rec, S){ if(rec && rec.doors && rec.doors.length){ var d=rec.doors[0]; return { x:d[0], y:d[1], z:d[2] }; }
    var f=loc(S.x, S.z, 0, S.d/2+2.0, S.ry); return { x:f[0], y:terrainH(f[0],f[1]), z:f[1] }; }
  function front(S, k, n, out){ var spots=[]; for(var i=0;i<n;i++){ var lx=(i-(n-1)/2)*(S.w/(n+1)), p=loc(S.x,S.z,lx,S.d/2+(out||1.6)+ (i%2)*0.9,S.ry); spots.push([p[0],p[1],terrainH(p[0],p[1])]); } return spots; }
  function ringSpots(cx,cz,r,n,y){ var o=[]; for(var i=0;i<n;i++){ var a=i/n*TAU+0.3, rr2=r*(0.45+0.55*((i*0.618)%1)); o.push([cx+Math.cos(a)*rr2, cz+Math.sin(a)*rr2, y==null?terrainH(cx+Math.cos(a)*rr2, cz+Math.sin(a)*rr2):y]); } return o; }
  function place(o){ if(o.y==null) o.y=terrainH(o.x,o.z); return SIM.place(o); }
  var HOME_BEDS = { abyss_house_poor:5, abyss_house_mid:6, stilt_poor:5, stilt_mid:6 };
  /* the landward homes: every dwelling the fill placed */
  PLACED.forEach(function(rec, i){ var b=HOME_BEDS[rec.key]; if(!b || rec.plotName) return;
    var kind = (lakeDist(rec.x,rec.z) < 90 || riverDist(rec.x,rec.z) < 60) ? 'home_shore' : 'home_town';
    place({ id:'home_'+i, name:(kind==='home_shore'?'Shore house':'Town house'), kind:kind, x:rec.x, z:rec.z, ry:rec.ry, door:door(rec, rec), activities:{ SLEEP:b, EAT:b, REST:b, CRAFT:2 }, org:'mungo_shorefolk', tags:{ key:rec.key } }); nP++; });
  /* the scheduled sites */
  function site(S, o){ var P=place(Object.assign({ id:o.id, name:S.name, x:S.x, z:S.z, ry:S.ry, door:door(S.rec, S), tags:{ key:S.placedKey||S.key } }, o)); S.placeId=P.id; nP++; return P; }
  site(HEADMAN, { id:'hall', kind:'hall', org:'mungo_headman', activities:{ SLEEP:10, EAT:10, REST:10, RULE:1 } });
  site(WATCH, { id:'watch', kind:'watch', org:'mungo_watch', activities:{ SLEEP:20, EAT:20, REST:20, GUARD:4 }, spots:front(WATCH,0,4,2) });
  site(CARAVANSERAI, { id:'caravanserai', kind:'caravanserai', org:'mungo_traders', r:16, wander:1.2, x:CARAVANSERAI.x+4,
    activities:{ STABLE:40, TEND_BEASTS:12, GUARD:12, LODGE:30, TRADE:6, EAT:16 }, indoor:{ LODGE:true, EAT:true } });
  INNS.forEach(function(S, i){ site(S, { id:'inn_'+i, kind:'inn', org:'mungo_traders', activities:{ KEEP_INN:4, EAT:24, DRINK:34, SOCIALIZE:20, LODGE:24 },
    indoor:{ EAT:true, LODGE:true, KEEP_INN:false }, spots:front(S,0,8,2.2), wander:0.8 }); });
  WAREHOUSES.forEach(function(S, i){ if(S===FISH_WAREHOUSE) return; site(S, { id:'warehouse_'+i, kind:'warehouse', org:'mungo_traders', activities:{ STORE:6, DELIVER:10, TRADE:4, WORK:4 }, spots:front(S,0,6,2), wander:1.5 }); });
  site(FISH_WAREHOUSE, { id:'fish_warehouse', kind:'fish_market', org:'mungo_traders', activities:{ STORE:6, DELIVER:14, TRADE:4, KEEP_SHOP:2, BUY:4, WORK:4 }, spots:front(FISH_WAREHOUSE,0,8,2), wander:1.5 });
  SHOPS.forEach(function(S, i){ var k=S.placedKey||S.key;
    var kind = k==='abyss_shop_builder' ? 'builders_yard' : k==='abyss_shop_food' ? 'food_shop' : k==='abyss_shop_salt' ? 'fish_market' : 'shop';
    var acts = { KEEP_SHOP:2, BUY:8, TRADE:3 }; if(kind==='builders_yard'){ acts.DELIVER=20; acts.CRAFT=4; } if(kind==='food_shop'){ acts.DELIVER=6; acts.EAT=8; } if(kind==='fish_market') acts.DELIVER=12;
    site(S, { id:'shop_'+i, kind:kind, org:'mungo_traders', trade:S.trade, activities:acts, spots:front(S,0,6,1.4), wander:0.6 }); });
  site(GEOCHAPTER, { id:'chapterhouse', kind:'chapterhouse', org:'geomancers_mungo', access:'friendly', activities:{ SLEEP:10, EAT:12, REST:10, WORK:18, STUDY:10 } });
  site(GENERATOR, { id:'generator', kind:'generator', org:'geomancers_mungo', access:'org', activities:{ MAINTAIN:2 } });
  site(FUELSTATION, { id:'fuel', kind:'fuel', org:'geomancers_mungo', activities:{ MAINTAIN:2 }, spots:front(FUELSTATION,0,2,1.5) });
  YUNI_HOUSES.forEach(function(S, i){ site(S, { id:'yuni_'+i, kind:'home_yuni', org:'yuni_residents', activities:{ SLEEP:5, EAT:5, REST:5 } }); });
  /* the buggy park: a bay per buggy (the life layer parks them there) and the Geomancers working round them */
  var bays=[]; for(var bI=0;bI<6;bI++){ var bp=loc(PARKING.x,PARKING.z,-PARKING.w/2+4+bI*(PARKING.w-8)/5, 3.5, PARKING.ry); bays.push([bp[0],bp[1],terrainH(bp[0],bp[1])]); }
  PARKING.bays = bays;
  place({ id:'parking', name:'The buggy park', kind:'parking', org:'geomancers_mungo', x:PARKING.x, z:PARKING.z, door:{ x:PARKING.node.x, y:terrainH(PARKING.node.x,PARKING.node.z), z:PARKING.node.z }, activities:{ MAINTAIN:6 },
    spots:bays.map(function(b){ return [b[0]+1.8, b[1]+0.6, b[2]]; }) }); nP++;
  var gq=siteFront(GEOCHAPTER, 6);
  place({ id:'geo_square', name:"The Geomancers' forecourt", kind:'geo_square', x:gq[0], z:gq[1], r:9, wander:1.4, activities:{ SOCIALIZE:20, PLAY:8, DRINK:10 } }); nP++;
  place({ id:'market', name:MARKET.name, kind:'market', x:MARKET.x, z:MARKET.z, r:MARKET.r-6, wander:1.8, activities:{ BUY:60, SELL:12, SOCIALIZE:50, PLAY:14, TRADE:8, DELIVER:10 } }); nP++;
  /* the watch's posts: the square, the landing, the junction, the caravanserai gate, the bridge, the headman's door, the
     two roads' town ends, the fish warehouse, the Geomancers' road */
  var posts=[[MARKET.x+MARKET.r+3,MARKET.z],[MARKET.x-MARKET.r-3,MARKET.z],[LANDING.x+5,LANDING.z+3],[JUNCTION.x+4,JUNCTION.z+4],
    siteFront(CARAVANSERAI,5),siteFront(HEADMAN,6),[NORTH_ROAD[5].x+3,NORTH_ROAD[5].z],[SOUTH_ROAD[2].x+3,SOUTH_ROAD[2].z],siteFront(FISH_WAREHOUSE,5),[GEO_ROAD[2].x,GEO_ROAD[2].z+3]];
  if(BRIDGES[0]) posts.push([BRIDGES[0].x - BRIDGES[0].dx*(BRIDGES[0].L/2+4), BRIDGES[0].z - BRIDGES[0].dz*(BRIDGES[0].L/2+4)]);
  posts.forEach(function(p, i){ place({ id:'post_'+i, name:'Watch post', kind:'post', org:'mungo_watch', x:p[0], z:p[1], r:2, wander:1.2, activities:{ PATROL:2, GUARD:2 } }); nP++; });
  /* the countryside */
  FARMS.forEach(function(S, i){ var fs = S.key==='abyss_farmhouse' || S.key==='farm_saltrice';
    site(S, { id:'farm_'+i, kind: fs ? 'farmstead' : 'field', org:'mungo_shorefolk', r:Math.min(S.w,S.d)*0.36, wander:2.2, x:S.x, z:S.z,
      activities: fs ? { SLEEP:6, EAT:6, REST:6, FARM:10 } : (S.key==='farm_saltrice_paddies' ? { FARM:12 } : { FARM:4 }), indoor:{ FARM:false } }); });
  LOGGING.forEach(function(Y, i){ place({ id:'logging_'+i, name:'Logging landing', kind:'logging', x:Y.x, z:Y.z, door:{ x:Y.node.x, y:terrainH(Y.node.x,Y.node.z), z:Y.node.z }, r:22, wander:3.5, activities:{ LOG:8 } }); nP++; });
  FORAGE.forEach(function(G, i){ place({ id:'grove_'+i, name:'Fruit grove', kind:'grove', x:G.x, z:G.z, r:G.r*0.7, wander:4, activities:{ GATHER:16 }, tags:{ resource:G.resource } }); nP++; });
  DOCKS.forEach(function(S, i){ var head=(S.rec && S.rec.dockHead) ? S.rec.dockHead : loc(S.x,S.z,0,-15,S.ry);
    var P=site(S, { id:'dock_shore_'+i, kind:'dock', org:'mungo_shorefolk', activities:{ MEND_NETS:8 }, spots:front(S,0,4,-3) }); P.pier={ x:head[0], y:0.6, z:head[1] }; });
  /* the reed-cutting grounds in the marsh at the mouth: walked to from the nearest street, worked in among the stands */
  REEDCUT.forEach(function(R, i){ place({ id:'reedcut_'+i, name:R.name, kind:'reed_bed', x:R.x, z:R.z, door:{ x:R.door[0], y:terrainH(R.door[0],R.door[1]), z:R.door[1] }, r:12, wander:3, activities:{ CUT_REED:8 }, tags:{ resource:'REED' } }); nP++; });
  SHORE_FISH.forEach(function(F, i){ place({ id:'shorefish_'+i, name:'Fishing from the shore', kind:'shore_fishing', x:F.x, z:F.z, r:4, wander:0.8, activities:{ FISH_SHORE:5 } }); nP++; });
  /* the fishing water: spots inside each polygon, on open water */
  FISH_WATER.forEach(function(W, i){ var xs=W.poly.map(function(p){ return p[0]; }), zs=W.poly.map(function(p){ return p[1]; }), spots=[], cx=0, cz=0, tries=0, want=i===0?30:10;
    W.poly.forEach(function(p){ cx+=p[0]/W.poly.length; cz+=p[1]/W.poly.length; });
    while(spots.length<want && tries++<4000){ var x=mix(Math.min.apply(null,xs),Math.max.apply(null,xs),phash(tries,i,1,2)), z=mix(Math.min.apply(null,zs),Math.max.apply(null,zs),phash(tries,i,3,4));
      if(!polyHasXZ(W.poly,x,z)) continue; var k=rgIdx(x,z); if(k<0 || !WATER[k]) continue; spots.push([x,z,0.05]); }
    place({ id:'fishwater_'+i, name:W.name, kind:'fishing_water', layer:'water', x:cx, z:cz, y:0.05, door:{ x:spots[0][0], y:0.05, z:spots[0][1] }, spots:spots, wander:5, activities:{ FISH:spots.length } }); nP++; });
  function polyHasXZ(P,x,z){ var c=false; for(var i=0,j=P.length-1;i<P.length;j=i++){ var a=P[i], b=P[j]; if(((a[1]>z)!==(b[1]>z)) && (x < (b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])) c=!c; } return c; }
  /* the reed village: its buildings from the layout's records, their doors from the walk graph */
  var RKIND = { rl_small_a:['home_reed',{SLEEP:4,EAT:4,REST:4}], rl_small_b:['home_reed',{SLEEP:4,EAT:4,REST:4}], rl_small_c:['home_reed',{SLEEP:4,EAT:4,REST:4}],
    rl_large_a:['home_reed',{SLEEP:8,EAT:8,REST:8}], rl_large_b:['home_reed',{SLEEP:9,EAT:9,REST:9}], rl_shaman:['shrine',{SLEEP:2,EAT:2,REST:2,WORSHIP:4}],
    rl_longhouse:['longhouse',{SOCIALIZE:40,DRINK:24,EAT:10,PLAY:10}], rl_weaver:['weaver',{WEAVE:3,DELIVER:6}], rl_warehouse:['reed_warehouse',{STORE:3,DELIVER:4}], rl_smithy:['smithy',{CRAFT:3}],
    rl_granary:['reed_garden',{FARM:2}], rl_pen:['reed_garden',{FARM:2}], rl_watchtower:['watchtower',{GUARD:2}], rl_dock:['dock',{MEND_NETS:8}],
    rl_tavern:['tavern',{KEEP_INN:8,DRINK:80,EAT:24,SOCIALIZE:40,LODGE:10}], rl_spirit_circle:['spirit_circle',{WORSHIP:20}], rl_farm:['reed_garden',{FARM:4}],
    rl_fishfarm:['reed_garden',{FARM:2}], rl_warrior_hall:['barracks_reed',{SLEEP:8,EAT:8,REST:8,GUARD:4}] };
  var rn=0;
  function reedPlace(b, doorNode, islandNode){ var R=RKIND[b.key]; if(!R) return; var d=doorNode || b.door; if(!d) return;
    var o={ id:'reed_'+(rn++), name:b.name||b.key, kind:R[0], x:b.x, z:b.z, y:REED_Y, ry:b.ry, door:{ x:d.x, y:REED_Y, z:d.z }, org:'mungo_reedfolk', activities:Object.assign({}, R[1]), tags:{ key:b.key, culture:'reed-lake' } };
    if(R[0]==='home_reed') o.activities.CRAFT=2;   /* mat weaving at home */
    if(R[0]==='tavern'){ o.indoor={ EAT:true, LODGE:true }; var T=REED.tavern; o.spots=[]; for(var s=0;s<16;s++){ var p=loc(T.x,T.z,-6+(s%4)*2.6, 14.5+Math.floor(s/4)*2.2, T.ry); o.spots.push([p[0],p[1],REED_Y]); } o.wander=0.5; }
    if(R[0]==='dock'){ var ph=loc(b.x,b.z,0,8.0,b.ry); o.pier={ x:ph[0], y:REED_Y-0.3, z:ph[1] }; o.spots=[0,1,2,3].map(function(q){ var pp=loc(b.x,b.z,(q%2?1:-1)*0.6, 1+q*1.6, b.ry); return [pp[0],pp[1],REED_Y-0.3]; }); }
    if(R[0]==='weaver' || R[0]==='smithy' || R[0]==='reed_warehouse'){ o.spots=[0,1,2].map(function(q){ var pp=loc(b.x,b.z,(q-1)*2.4, 0.5, b.ry); return [pp[0],pp[1],REED_Y]; }); o.wander=0.5; }
    if(R[0]==='watchtower'){ o.spots=[[b.x,b.z,REED_Y+8.5]]; }
    if(R[0]==='spirit_circle' || R[0]==='reed_garden' || R[0]==='longhouse'){ o.r=6; o.wander=1.5; }
    SIM.place(o); nP++; }
  REED.islands.forEach(function(I){ I.buildings.forEach(function(b){ reedPlace(b); }); });
  REED.pads.forEach(function(P){ reedPlace(P, P.door); });
  /* the reed decks themselves: the islands' open middles, where children play and people talk */
  NAV.nodes.forEach(function(n){ if(n.tag!=='island') return; place({ id:'deck_'+n.id, name:'Reed island deck', kind:'commons', x:n.x, z:n.z, y:REED_Y, door:{ x:n.x, y:REED_Y, z:n.z }, r:5, wander:1.5, activities:{ PLAY:6, SOCIALIZE:8 } }); nP++; });
  /* the map-edge ports */
  Object.keys(PORTS).forEach(function(k){ var p=PORTS[k]; SIM.port({ id:k, x:p.x, z:p.z, kind:p.kind, layer:p.kind==='road'?'pedestrian':'animal' }); });

  /* ---------------------------------------------------------------- 4. the hand-edited world (settlements/mungo/world/*.json) */
  var loaded = SIM.load(MUNGO_WORLD_JSON);
  /* ---------------------------------------------------------------- 5. the people */
  var boats={};
  var pop = SIM.populate({ prefix:'m', boatOf:function(a, H){
    var best=null, bd=1e9; SIM.all('place').forEach(function(P){ if(P.kind!=='dock' || !P.pier) return; var n=boats[P.id]||0; if(n >= 6) return; var d=Math.hypot(P.x-H.x, P.z-H.z)+n*25; if(d<bd){ bd=d; best=P; } });
    if(!best) return null; boats[best.id]=(boats[best.id]||0)+1; return { dock:best.id, pier:best.pier, slot:boats[best.id]-1 }; } });
  SIM.REF = { layer:'pedestrian', x:MARKET.x+MARKET.r+2, z:MARKET.z };
  var probs = SIM.check();
  MUNGO_SIM = { places:nP, loaded:loaded, population:pop, problems:probs.length, boats:boats };
  window._world = MUNGO_SIM;
})();
