/* ============================== 20. THE LIFE LAYER — MUNGO: the embodiment ==============================
   Draws what core/simulation (SIM) says and decides nothing (PLAN.md 4.1: the build's life fragment is the
   EMBODIMENT). Every frame: SIM.pose(actor, t) for each person, a pure function of the motion clock (MCLOCK.t);
   as the WORLD minute advances (MCLOCK.hour, held by default: "Run time" runs it at a 72-minute day) SIM.step()
   makes that minute's decisions; a jump of the clock (the slider, #hour=) re-places everyone (SIM.jump).
     people        instanced bodies, heads, headwear, packs; garb by organisation (05-palette has no life colours,
                   so they are an object table here); bent over at the field, the landing, the grove, the nets
     boats         one reed boat per boat-fisher: moored at its dock when ashore, under him on the water
     buggies       the Motor Vehicles kit's dune buggies (KratorVehicles), one per Geomancer: parked in their bays at
                   the buggy park, driven off the map and back by the geo_trip event
     mounts        the nomads' riding lizards (ridden in, left in the caravanserai's court for the night) and the
                   caravans' pack lizards (walking in the column, stabled in the court while the caravan stays)
   The inspector names each (who, organisation, faction, role, activity, where to); PATHVIZ shows the routes. */
var LIFE = null;
(function(){
  if(SHEET || !window.SIM) return;
  var t0 = performance.now(), PI = Math.PI;
  var ACTORS = function(){ return SIM.all('actor'); };

  /* ---------------------------------------------------------------- geometry: merged boxes, vertex-coloured */
  function merge(parts){ var pos=[], nor=[], col=[], c=new THREE.Color();
    parts.forEach(function(p){ var g=p.g.index ? p.g.toNonIndexed() : p.g; c.setHex(p.c==null?0xffffff:p.c).convertSRGBToLinear();
      var P=g.attributes.position.array, N=g.attributes.normal.array; for(var i=0;i<P.length;i++){ pos.push(P[i]); nor.push(N[i]); } for(var k=0;k<P.length/3;k++) col.push(c.r,c.g,c.b); });
    var G=new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); G.setAttribute('normal', new THREE.Float32BufferAttribute(nor,3)); G.setAttribute('color', new THREE.Float32BufferAttribute(col,3)); return G; }
  function box(w,h,d,x,y,z,rx,ry){ var g=new THREE.BoxGeometry(w,h,d); if(rx) g.rotateX(rx); if(ry) g.rotateY(ry); g.translate(x,y,z); return g; }
  function cyl(r0,r1,h,x,y,z,seg,rx){ var g=new THREE.CylinderGeometry(r0,r1,h,seg||7); if(rx) g.rotateX(rx); g.translate(x,y,z); return g; }
  /* a person, 1.75 m: legs (dark), a tunic the instance colour tints (white here), arms; feet at y 0, facing +z */
  var gBody = merge([{ g:box(0.15,0.82,0.17,-0.1,0.41,0), c:0x3a3026 },{ g:box(0.15,0.82,0.17,0.1,0.41,0), c:0x3a3026 },
    { g:box(0.44,0.62,0.26,0,1.13,0), c:0xffffff },{ g:box(0.5,0.12,0.3,0,0.86,0), c:0xe6e0d6 },
    { g:box(0.11,0.58,0.13,-0.29,1.12,0), c:0xffffff },{ g:box(0.11,0.58,0.13,0.29,1.12,0), c:0xffffff }]);
  var gHead = merge([{ g:box(0.24,0.26,0.25,0,1.6,0), c:0xffffff },{ g:box(0.1,0.1,0.12,0,1.47,0), c:0xffffff }]);
  var gHat = merge([{ g:cyl(0.17,0.19,0.16,0,1.79,0,8), c:0xffffff },{ g:cyl(0.3,0.3,0.03,0,1.72,0,10), c:0xffffff }]);
  var gPack = merge([{ g:box(0.34,0.42,0.18,0,1.16,-0.22), c:0xc8b48a },{ g:box(0.36,0.06,0.2,0,1.4,-0.22), c:0x7a5a3a }]);
  /* the riding lizard: low and long, a saddle, a raised frill; the pack lizard: a heavier body, bales lashed on */
  var gMount = merge([{ g:box(0.95,0.8,2.5,0,1.25,0), c:0x6f7650 },{ g:box(0.5,0.45,2.3,0,1.05,-2.3,0.16), c:0x5f6644 },{ g:box(0.56,0.5,0.95,0,1.6,1.75,-0.3), c:0x6f7650 },
    { g:box(1.3,0.95,0.07,0,1.95,1.32,-0.3), c:0xb85a30 },{ g:box(0.24,1.1,0.24,0.58,0.55,0.85), c:0x55593c },{ g:box(0.24,1.1,0.24,-0.58,0.55,0.85), c:0x55593c },
    { g:box(0.24,1.1,0.24,0.58,0.55,-0.85), c:0x55593c },{ g:box(0.24,1.1,0.24,-0.58,0.55,-0.85), c:0x55593c },{ g:box(1.05,0.18,0.95,0,1.72,0.05), c:0x3a2a20 }]);
  var gBeast = merge([{ g:box(1.05,0.8,2.4,0,0.95,0), c:0x6a6a4a },{ g:box(0.5,0.4,1.9,0,0.85,-2.05,0.12), c:0x5e5e40 },{ g:box(0.56,0.46,0.85,0,1.12,1.5,-0.15), c:0x6a6a4a },
    { g:box(0.22,0.8,0.22,0.52,0.4,0.75), c:0x55553a },{ g:box(0.22,0.8,0.22,-0.52,0.4,0.75), c:0x55553a },{ g:box(0.22,0.8,0.22,0.52,0.4,-0.75), c:0x55553a },{ g:box(0.22,0.8,0.22,-0.52,0.4,-0.75), c:0x55553a },
    { g:box(1.5,0.6,1.3,0,1.6,-0.1), c:0xcdb98a },{ g:box(0.5,0.5,0.6,0.85,1.3,-0.1), c:0xb89a6a },{ g:box(0.5,0.5,0.6,-0.85,1.3,-0.1), c:0xb89a6a }]);
  /* the reed boat: two bundles bound into a hull, the prow and the stern curled up (the Reed Lake kit's hnRLBoat, cut down) */
  var gBoat = merge([{ g:cyl(0.42,0.42,4.6,0.28,0.12,0,8,PI/2), c:0xc9a85e },{ g:cyl(0.42,0.42,4.6,-0.28,0.12,0,8,PI/2), c:0xc0a058 },
    { g:box(0.5,0.08,3.6,0,0.42,0), c:0xa8884a },{ g:cyl(0.16,0.32,1.3,0,0.65,2.55,7,-0.75), c:0xc9a85e },{ g:cyl(0.14,0.3,1.0,0,0.5,-2.45,7,0.7), c:0xc9a85e },
    { g:box(0.2,0.24,0.32,0,1.2,2.95), c:0xa84030 },{ g:box(0.05,0.05,2.2,0.62,0.32,0.3), c:0x6a5038 }]);
  var MATL = new THREE.MeshLambertMaterial({ vertexColors:true });
  function IM(geo, n, label){ var m=new THREE.InstancedMesh(geo, MATL.clone(), n);   /* plain Lambert, as Locus's life layer: the night-light hook darkens instanced vertex colours */ m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    /* r128's setColorAt sizes instanceColor from mesh.count: allocate it for the full capacity BEFORE count drops to 0 */
    var white=new Float32Array(n*3).fill(1); m.instanceColor=new THREE.InstancedBufferAttribute(white, 3); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    m.count=0; m.frustumCulled=false; m.castShadow=false; m.receiveShadow=false; m.userData.inspectLabel=label; m.userData.noPickShadow=true; scene.add(m); return m; }
  var MAXP=900, mBody=IM(gBody,MAXP,'Person'), mHead=IM(gHead,MAXP,'Person'), mHat=IM(gHat,MAXP,'Person'), mPack=IM(gPack,MAXP,'Person');
  var mMount=IM(gMount,60,'Riding lizard'), mBeast=IM(gBeast,60,'Pack lizard'), mBoat=IM(gBoat,80,'Reed fishing boat');

  /* ---------------------------------------------------------------- who wears what (by organisation; a hashed pick per person) */
  var GARB = MPAL.garb, SKIN = MPAL.skin;
  function hsh(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0)/4294967296; }
  function look(a){ if(a._look) return a._look; var G=GARB[a.org]||GARB.mungo_shorefolk, u=hsh(a.id), R=SIM.R.role[a.role]||{};
    var L={ body:G.cols[Math.floor(u*G.cols.length)%G.cols.length], skin:SKIN[Math.floor(hsh(a.id+'s')*SKIN.length)%SKIN.length],
      hat: hsh(a.id+'h') < G.hat ? G.hatCol[Math.floor(hsh(a.id+'c')*G.hatCol.length)%G.hatCol.length] : null,
      pack: (G.pack!=null ? hsh(a.id+'p') < G.pack : /lumberjack|gatherer|fisher|merchant/.test(a.role)), scale: a.role==='child' ? 0.62 : 0.94+0.12*hsh(a.id+'z') };
    a._look=L; return L; }

  /* ---------------------------------------------------------------- the buggies: one per Geomancer, from the Motor Vehicles kit */
  var BUGGIES = [];
  if(typeof KratorVehicles!=='undefined' && KratorVehicles && KratorVehicles.build){
    ACTORS().forEach(function(a){ if(!a.vehicle) return; var g=null;
      try{ g=KratorVehicles.build('geo_dune_buggy', { variant:a.vehicle.n%3, seed:11+a.vehicle.n }); }catch(e){ ERR('buggy: '+(e&&e.stack||e)); }
      if(!g) return; g.traverse(function(o){ if(o.isMesh){ o.userData.inspectFn=function(){ return "Geomancer dune buggy (Motor Vehicles kit) — "+(a.inVehicle==='buggy'?'driven by ':'parked; keeper ')+a.id+' · geomancers_mungo'; }; } });
      scene.add(g); BUGGIES.push({ g:g, a:a, bay:(PARKING.bays||[])[a.vehicle.n % Math.max(1,(PARKING.bays||[]).length)], dist:0, last:null }); });
  }
  /* buggies are not instanced (each has its own wheels and lamps): their meshes join the scene for the picker */
  BUGGIES.forEach(function(B){ var ms=[]; B.g.traverse(function(o){ if(o.isMesh) ms.push(o); }); B.meshes=ms; });

  /* ---------------------------------------------------------------- the inspector */
  var WHO={ body:[], beast:[], mount:[], boat:[] };
  function describe(a){ if(!a) return null; var R=SIM.R.role[a.role]||{}, O=SIM.R.org[a.org]||{}, P=a.place&&SIM.R.place[a.place];
    return (R.name||a.role)+' — life layer · '+(O.name||a.org)+' · faction '+(a.faction||'?')+' · doing '+(a.activity||'?')+(a.wanted&&a.wanted!==a.activity?' (wanted '+a.wanted+')':'')+
      (P?' at '+(P.name||P.id):'')+(a.transient?' · visiting ('+(a.group||'')+')':' · lives at '+(SIM.R.place[a.home]&&SIM.R.place[a.home].name||a.home))+' · id '+a.id; }
  [mBody,mHead,mHat,mPack].forEach(function(m){ m.userData.inspectFn=function(i){ return describe(WHO.body[i]); }; });
  mBeast.userData.inspectFn=function(i){ var G=WHO.beast[i]; return G ? 'Pack lizard — life layer · '+G.kind+' '+G.id+' ('+(SIM.R.org[G.org]||{}).name+')' : null; };
  mMount.userData.inspectFn=function(i){ var a=WHO.mount[i]; return a ? 'Riding lizard of '+describe(a) : null; };
  mBoat.userData.inspectFn=function(i){ var a=WHO.boat[i]; return a ? 'Reed fishing boat — '+(a.inVehicle==='boat'?'out with ':'moored; ')+describe(a) : null; };

  /* ---------------------------------------------------------------- posing */
  var _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _p=new THREE.Vector3(), _s=new THREE.Vector3(), _c=new THREE.Color();
  function put(mesh, i, x,y,z, ry, s, col, pitch){ _e.set(pitch||0, ry, 0, 'YXZ'); _q.setFromEuler(_e); _p.set(x,y,z); _s.set(s,s,s); _m.compose(_p,_q,_s); mesh.setMatrixAt(i,_m); if(col!=null){ _c.setHex(col).convertSRGBToLinear(); mesh.setColorAt(i,_c); } }
  var BENT = { FARM:0.55, GATHER:0.45, LOG:0.35, MEND_NETS:0.5, CRAFT:0.25, WEAVE:0.4, TEND_BEASTS:0.3, FISH_SHORE:0.15, MAINTAIN:0.45, STORE:0.2 };
  function groundY(x,z,py){ var b=bridgeDeckAt(x,z); if(b!=null) return b+0.05; var h=Math.max(terrainH(x,z), 0); return (py!=null && py > h+0.2) ? py : h; }
  function dockMoor(a){ var P=SIM.R.place[a.boat.dock]; if(!P||!P.pier) return null; var dx=P.door.x-P.pier.x, dz=P.door.z-P.pier.z, L=Math.hypot(dx,dz)||1, tx=dx/L, tz=dz/L, k=a.boat.slot||0;
    var along=2.6+Math.floor(k/2)*5.2, side=(k%2?1:-1)*2.3; return { x:P.pier.x+tx*along-tz*side, z:P.pier.z+tz*along+tx*side, ry:Math.atan2(tx,tz) }; }
  var stats={ people:0, hidden:0, boatsOut:0, buggiesOut:0, riders:0, beasts:0, steps:0, decisions:0, jumps:0 };
  function pose(){
    var t=MCLOCK.t, nb=0, nm=0, nbe=0, nbo=0, A=ACTORS(); stats.hidden=0; stats.boatsOut=0; stats.riders=0;
    WHO.body.length=0; WHO.mount.length=0; WHO.boat.length=0; WHO.beast.length=0;
    for(var i=0;i<A.length;i++){ var a=A[i], L=look(a);
      var p = a.present ? SIM.pose(a, t) : null;
      /* the boat stays moored at its dock until its fisher is in it */
      if(a.boat && nbo<80 && !(p && p.mode==='boat')){ var P0=dockMoor(a); if(P0){ put(mBoat, nbo, P0.x, -0.05+0.03*Math.sin(t*0.9+a.k), P0.z, P0.ry, 1); WHO.boat[nbo++]=a; } }
      if(!p){ stats.hidden++; continue; }
      if(p.hidden){ stats.hidden++; continue; }
      if(nb>=MAXP) continue;
      var x=p.x, z=p.z, s=L.scale, bob=p.moving ? Math.abs(Math.sin(t*7.5+a.k))*0.05 : 0, y, pitch=0;
      if(p.mode==='boat'){ y=0.05+0.04*Math.sin(t*1.1+a.k); if(nbo<80){ put(mBoat, nbo, x, y-0.1, z, p.h, 1); WHO.boat[nbo++]=a; } y+=0.25; stats.boatsOut++; }
      else if(p.mode==='drive'){ continue; }                                     /* in the buggy: the buggy is drawn below */
      else if(p.mode==='ride'){ y=groundY(x,z,p.y); if(nm<60){ put(mMount, nm, x, y+bob, z, p.h, 1); WHO.mount[nm++]=a; } y+=1.45; stats.riders++; }
      else { y=groundY(x,z,p.y)+bob; if(!p.moving && BENT[p.act]) pitch=BENT[p.act]; }
      put(mBody, nb, x, y, z, p.h, s, L.body, pitch); put(mHead, nb, x, y, z, p.h, s, L.skin, pitch);
      put(mHat, nb, x, y, z, p.h, L.hat!=null ? s : 0.0001, L.hat!=null ? L.hat : 0xffffff, pitch);
      put(mPack, nb, x, y, z, p.h, L.pack ? s : 0.0001, null, pitch);
      WHO.body[nb++]=a;
    }
    /* the caravans' beasts: in the column behind the people on the road, stabled in the court while they stay */
    var CS=SIM.R.place.caravanserai, stableI=0;
    SIM.all('group').forEach(function(G){ if(!G.beasts || G.done) return; var lead=SIM.R.actor[G.leader]; if(!lead) return;
      var T=lead.task, leg=T&&T.together&&T.legs[0], n=G.members.length;
      for(var b=0;b<G.beasts && nbe<60;b++){ var bx, bz, bh=0, by;
        if(leg && t < T.arrive+2){ var dt=t-T.t0, back=(Math.floor(n/2)+1+b)*3.4, sb=Math.max(0, Math.min(dt*leg.speed, leg.route.len)-back), q=SIM.at(leg.route, sb); bx=q.x; bz=q.z; bh=Math.atan2(q.tx,q.tz); }
        else if(CS){ var k=stableI++, ang=k*0.61, rr=6+k%3*3.5; bx=CS.x+Math.cos(ang)*rr; bz=CS.z+Math.sin(ang)*rr; bh=ang+PI/2; }
        else continue;
        put(mBeast, nbe, bx, groundY(bx,bz), bz, bh, 1); WHO.beast[nbe++]=G; stats.beasts=nbe; } });
    /* the nomads' mounts, left in the court while their riders are in the town */
    SIM.all('group').forEach(function(G){ if(G.kind!=='riders' || G.phase!=='stay' || !CS) return;
      G.members.forEach(function(id){ var a=SIM.R.actor[id]; if(!a || nm>=60) return; var k=stableI++, ang=k*0.61+0.3, rr=8+k%4*3; var mx=CS.x+Math.cos(ang)*rr, mz=CS.z+Math.sin(ang)*rr;
        put(mMount, nm, mx, groundY(mx,mz), mz, ang, 1); WHO.mount[nm++]=a; }); });
    /* the buggies */
    stats.buggiesOut=0;
    BUGGIES.forEach(function(B){ var a=B.a, g=B.g;
      if(a.inVehicle==='buggy' && a.present){ var p=SIM.pose(a, t); if(p.mode==='drive'){ var y=groundY(p.x,p.z);
          if(B.last){ var d=Math.hypot(p.x-B.last[0], p.z-B.last[1]); if(d<20) KratorVehicles.roll(g, d); }
          B.last=[p.x,p.z]; g.position.set(p.x, y, p.z); g.rotation.y=p.h; g.visible=true; stats.buggiesOut++; return; } }
      if(a.inVehicle==='buggy' && !a.present){ g.visible=false; B.last=null; return; }
      var bay=B.bay; g.visible=true; B.last=null; if(bay){ g.position.set(bay[0], bay[2], bay[1]); g.rotation.y=(PARKING.ry||0)+PI; } });
    [mBody,mHead,mHat,mPack].forEach(function(m){ m.count=nb; m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; });
    mMount.count=nm; mBeast.count=nbe; mBoat.count=nbo; [mMount,mBeast,mBoat].forEach(function(m){ m.instanceMatrix.needsUpdate=true; });
    stats.people=nb;
  }

  /* ---------------------------------------------------------------- stepping: the world minute drives decisions */
  var lastM=null, lastStepT=-1e9;
  function tick(dt, hour, nk){
    var m=SIM.minute(), t=MCLOCK.t;
    if(lastM==null){ SIM.jump(); stats.jumps++; lastM=m; lastStepT=t; }
    else if(m!==lastM){ var d=m-lastM; if(d<0 || d>45){ SIM.jump(); stats.jumps++; } else { for(var i=0;i<Math.min(d,6);i++){ stats.decisions+=SIM.step(); stats.steps++; } } lastM=m; lastStepT=t; }
    else if(t-lastStepT > 2){ stats.decisions+=SIM.step(); stats.steps++; lastStepT=t; }   /* the clock held: arrivals and group legs still advance */
    pose();
    var lampsOn = nk > 0.35; BUGGIES.forEach(function(B){ if(B.lit!==lampsOn && B.g.visible){ try{ KratorVehicles.lights(B.g, lampsOn && B.a.inVehicle==='buggy'); }catch(e){} B.lit=lampsOn; } });
  }
  TICKS.push(tick);

  /* ---------------------------------------------------------------- the path visualiser: what moves, by population */
  function routesOf(filter){ var out=[], t=MCLOCK.t; ACTORS().forEach(function(a){ if(!filter(a) || !a.task) return; a.task.legs.forEach(function(L){ if(t > a.task.t0 + a.task.dur + 30) return; out.push(L.route.pts.map(function(p){ return [p[0], (p[1]||0)+0.6, p[2]]; })); }); }); return out; }
  PATHVIZ.push({ key:'life_all', label:'Life: every route now', color:0xffd060, paths:function(){ return routesOf(function(){ return true; }); } });
  PATHVIZ.push({ key:'life_boats', label:'Life: the fishing boats', color:0x40c0ff, paths:function(){ return routesOf(function(a){ return !!a.boat && a.activity==='FISH'; }); } });
  PATHVIZ.push({ key:'life_caravans', label:'Life: caravans and riders', color:0xff6040, paths:function(){ return routesOf(function(a){ return !!a.transient; }); } });
  PATHVIZ.push({ key:'life_watch', label:'Life: the watch on patrol', color:0xa0a0ff, paths:function(){ return routesOf(function(a){ return a.org==='mungo_watch'; }); } });
  PATHVIZ.push({ key:'life_work', label:'Life: to the fields, the forest and the docks', color:0x80e070, paths:function(){ return routesOf(function(a){ return /FARM|LOG|GATHER|MEND_NETS|FISH_SHORE|DELIVER/.test(a.activity||''); }); } });
  PATHVIZ.push({ key:'life_buggies', label:'Life: the buggies', color:0xff40c0, paths:function(){ return routesOf(function(a){ return !!a.vehicle && a.inVehicle==='buggy'; }); } });

  /* ---------------------------------------------------------------- the census panel (the Life button) */
  (function(){ var host=document.getElementById('polyBox'), panel=document.getElementById('simPanel');
    if(!panel){ panel=document.createElement('div'); panel.id='simPanel'; if(host && host.parentNode) host.parentNode.insertBefore(panel, host.nextSibling); }
    var b=document.createElement('button'); b.id='lifeToggle'; b.textContent='Life: census'; b.style.width='100%'; b.style.boxSizing='border-box'; b.style.marginBottom='4px';
    var anchor=document.getElementById('pathvizSel'); if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(b, anchor.nextSibling);
    var open=false; b.onclick=function(){ open=!open; panel.style.display=open?'block':'none'; b.classList.toggle('on',open); };
    var acc=0; TICKS.push(function(dt){ acc+=dt; if(!open || acc<0.8) return; acc=0; var C=SIM.census(MCLOCK.t), rows=Object.keys(C.byActivity).sort(function(p,q){ return C.byActivity[q]-C.byActivity[p]; }).slice(0,12);
      panel.textContent='world '+(Math.floor(MCLOCK.hour)+':'+('0'+Math.floor((MCLOCK.hour%1)*60)).slice(-2))+'  day '+(MCLOCK.day+1)+(MCLOCK.running?'':'  (held)')+'\n'+
        C.present+' present · '+C.moving+' moving · '+C.hidden+' indoors\n'+stats.boatsOut+' boats out · '+stats.buggiesOut+' buggies out · '+C.groups+' visiting groups\n'+
        rows.map(function(k){ return ('    '+C.byActivity[k]).slice(-4)+'  '+k; }).join('\n'); }); })();

  LIFE = { stats:stats, buggies:BUGGIES.length, build_ms:Math.round(performance.now()-t0) };
  window._life = { stats:stats, census:function(){ return SIM.census(MCLOCK.t); }, routeFailures:function(){ return SIM.routeFail.length; }, buggies:BUGGIES.length,
    people:function(){ return ACTORS().length; }, world:window._world };
})();
