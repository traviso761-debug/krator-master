/* ============================== 20. THE LIFE LAYER ==============================
   PLANNER-OWNED. Yuni's population, walking the NAV graph that 30-layout.js laid down.

   Everyone here has somewhere to be and a reason to be there. The layer is built out of
   four things:

     THE PLACES. Every building the placement pass set down is classified into a category —
     a house by its wealth, a shop, a civic hall, the Foundry, the Reliquary, the Cloisters,
     the hospital, the Library of Yuni, the Order's own buildings, the corn-cob apartments
     the monks sleep in, the market, the parks, the caravanserai, the Vault depot. Nobody
     walks to a coordinate; they walk to a building that is actually standing there.

     THE ROUTE. A* over NAV, with the underground and the wall-walk barred unless the
     traveller's business takes them there. Requests are queued and a few are served each
     frame, so a thousand people changing their minds at dusk costs nothing in particular.

     THE DAY. Each kind has a schedule keyed on the hour: where it should be, and what it
     does when it gets there. At night the streets empty into the houses and only the
     Vault's own people are still about.

     THE BODIES. Four instanced meshes — bodies, heads, carts, draught animals — rewritten
     each frame for whoever is near the camera. Nothing is in the scene graph per person.  */
reseed(900001);

var LIFE = { agents:[], poi:{}, stats:{} };
(function(){
  if(SHEET || !NAV.nodes.length) return;

  /* ============================ 1. THE PLACES ============================ */
  var POI = LIFE.poi;
  function P(cat, x, z, extra){
    var e = { x:x, z:z, r:(extra && extra.r) || 8, name:(extra && extra.name) || '',
              doors:(extra && extra.doors) || null, doorIds:(extra && extra.doorIds) || null };
    (POI[cat] || (POI[cat]=[])).push(e); return e;
  }
  function named(b, re){ return b.plotName && re.test(b.plotName); }
  /* THE DOORSTEP. Every asset that drew a door registered the point a pace in front of it
     (53-assets.js, F.door), and buildAsset hands that list back. A place therefore has a
     real threshold to stand at, not just a footprint centre, so the last few metres of a
     journey end at somebody's door rather than in the middle of the road. */
  function doorsOf(b){
    if(!b.doors || !b.doors.length) return null;
    var out=[]; for(var i=0;i<b.doors.length && i<6;i++) out.push([b.doors[i][0], b.doors[i][2]]);
    return out;
  }

  PLACED.forEach(function(b){
    var A = ASSET_BY_KEY[b.key]; if(!A) return;
    var rad = Math.max(A.w, A.d)*0.5 + 4;
    var dr = doorsOf(b), f = A.family, EX = { r:rad, doors:dr, doorIds:b.doorIds ? b.doorIds.slice(0,6) : null };
    if(f==='poor') P('home_poor', b.x, b.z, EX);
    else if(f==='mid') P('home_mid', b.x, b.z, EX);
    else if(f==='rich') P('home_rich', b.x, b.z, EX);
    else if(f==='civic'){ P('civic', b.x, b.z, EX);
      if(b.key==='civic_library') P('yunilib', b.x, b.z, EX);
      if(b.key==='civic_archive' || b.key==='civic_chapter_house' || b.key==='civic_school') P('order', b.x, b.z, EX); }
    else if(f==='trade'){
      if(b.key==='trade_caravanserai') P('caravanserai', b.x, b.z, EX);
      else if(named(b, /Vault depot/)) P('depot', b.x, b.z, EX);
      else if(b.key==='trade_market_hall') P('warehouse', b.x, b.z, EX);
      else P('shop', b.x, b.z, EX);
    }
    else if(f==='ancient'){
      if(named(b, /Foundry/)) P('factory', b.x, b.z, EX);
      if(named(b, /Reliquary/)) P('lab', b.x, b.z, EX);
      if(named(b, /Cloisters/)) P('guild', b.x, b.z, EX);
      if(named(b, /hospital/i)) P('hospital', b.x, b.z, EX);
      if(named(b, /fuel station/i)) P('fuel', b.x, b.z, EX);
      if(named(b, /Corn-cob/)) P('order_home', b.x, b.z, EX);
      if(named(b, /Comb-wall|Comb-block/)) P('home_mid', b.x, b.z, EX);
    }
  });
  PARKS.forEach(function(K){ P('park', K.x, K.z, {r:K.r*0.6, name:K.name}); });
  P('market', MARKET.x, MARKET.z, {r:MARKET.r*0.55, name:MARKET.name});
  for(var mq=0; mq<8; mq++){ var ma=mq/8*TAU; P('market', MARKET.x+Math.cos(ma)*MARKET.r*0.55, MARKET.z+Math.sin(ma)*MARKET.r*0.55, {r:10}); }
  P('vault', 0, VAULT.zf-46, {r:22, name:'The Grand Vault'});
  P('plaza', 0, 0, {r:CENTER_PLAZA.r*0.7, name:CENTER_PLAZA.name});
  /* the Order's own list: their buildings, the Vault and the Library of Yuni */
  (POI.order || (POI.order=[])).push.apply(POI.order, (POI.yunilib||[]).concat(POI.vault||[]));
  /* any(): a FALLBACK CHAIN — the first of these categories that exists. Right for "where
     does this kind live", wrong for "where might this kind go", which is a UNION. Using the
     chain for the second is why every academic in the city walked to the Reliquary and
     nowhere else: 'lab' was non-empty, so 'vault', 'guild', 'hospital' and the Library were
     never even looked at. */
  function any(){ for(var i=0;i<arguments.length;i++){ var c=POI[arguments[i]]; if(c && c.length) return c; } return POI.plaza; }
  var POOLS = {};
  function pool(cats){
    var k = cats.join('|'); if(POOLS[k]) return POOLS[k];
    var out = [];
    cats.forEach(function(c){ if(POI[c] && POI[c].length) out.push.apply(out, POI[c]); });
    if(!out.length) out = POI.plaza;
    POOLS[k] = out; return out;
  }

  /* ============================ 2. THE ROUTE ============================ */
  /* a coarse bucket grid over the walk graph, so "which node is nearest" is not a scan */
  var GB = 48, GRID = {};
  function gkey(x,z){ return (Math.floor(x/GB)+512) + ':' + (Math.floor(z/GB)+512); }
  NAV.nodes.forEach(function(n){ if(n.tag==='tunnel'||n.tag==='antechamber') return;
    var k=gkey(n.x,n.z); (GRID[k]||(GRID[k]=[])).push(n.id); });
  function navNear(x, z){
    var best=-1, bd=1e9;
    for(var ring=0; ring<6 && best<0; ring++){
      for(var i=-ring;i<=ring;i++) for(var j=-ring;j<=ring;j++){
        if(ring>0 && Math.abs(i)!==ring && Math.abs(j)!==ring) continue;
        var arr = GRID[gkey(x+i*GB, z+j*GB)]; if(!arr) continue;
        for(var q=0;q<arr.length;q++){ var n=NAV.nodes[arr[q]], d=Math.hypot(n.x-x, n.z-z);
          if(d<bd){ bd=d; best=arr[q]; } }
      }
    }
    return best;
  }
  /* A*. `deep` lets the traveller use the Vault's stair and tunnel; nobody else may. */
  var gScore=new Float64Array(NAV.nodes.length), came=new Int32Array(NAV.nodes.length), stamp=new Int32Array(NAV.nodes.length), epoch=0;
  function route(a, b, deep){
    if(a<0 || b<0) return null;
    if(a===b) return [a];
    epoch++;
    var open=[a]; gScore[a]=0; came[a]=-1; stamp[a]=epoch;
    var tgt=NAV.nodes[b], guard=0;
    while(open.length && guard++ < 9000){
      /* smallest f: the open set is short enough that a linear scan beats a heap here */
      var bi=0, bf=1e18;
      for(var i=0;i<open.length;i++){ var id=open[i], n=NAV.nodes[id];
        var f=gScore[id] + Math.hypot(n.x-tgt.x, n.z-tgt.z);
        if(f<bf){ bf=f; bi=i; } }
      var cur=open[bi]; open.splice(bi,1);
      if(cur===b){ var path=[], c=cur; while(c>=0){ path.push(c); c=came[c]; } return path.reverse(); }
      var adj=NAV.adj[cur];
      for(var e=0;e<adj.length;e++){
        var ed=NAV.edges[adj[e]];
        if(!deep && (ed.kind==='underground' || ed.kind==='wallwalk' || ed.kind==='stair')) continue;
        var o = ed.a===cur ? ed.b : ed.a, g = gScore[cur] + ed.len;
        if(stamp[o]!==epoch || g < gScore[o]){ stamp[o]=epoch; gScore[o]=g; came[o]=cur; open.push(o); }
      }
    }
    return null;
  }

  /* ============================ 3. THE PEOPLE ============================ */
  var SAFFRON = PAL.people.garb[2];                    /* the Order's robe, out of the palette */
  var KINDS = {
    rambler:  { n:230, speed:1.25, body:0.50, order:['market','civic','park','shop','home'], dwell:[6,26] },
    worker:   { n: 62, speed:1.35, body:0.52, order:['factory'], dwell:[40,120], work:[6,18] },
    academic: { n: 40, speed:1.20, body:0.50, order:['lab','vault','guild','hospital','yunilib'], dwell:[50,150], work:[8,18], deep:true },
    monk:     { n: 34, speed:1.10, body:0.52, order:['order'], dwell:[30,110], work:[5.5,21.5], deep:true, robe:SAFFRON },
    merchant: { n: 88, speed:1.15, body:0.51, order:['market','warehouse','shop'], dwell:[30,90], work:[6,19] }
  };
  /* THE DESERT ROAD. Caravans do not potter about the city like carts: they come in off the
     map along a highway, cross to the caravanserai, stand in its yard for the best part of a
     day, and go back out the way they came. These are the far ends of the four highways —
     the last walkable node on each, out past the farm belt. */
  var ROAD_END = (function(){
    var best = {};
    NAV.nodes.forEach(function(n){
      if(n.tag!=='highway' && n.tag!=='road') return;
      var r = Math.hypot(n.x, n.z); if(r < 1300) return;
      var q = Math.round(clockOf(n.x, n.z));
      if(!best[q] || r > best[q].r) best[q] = { id:n.id, x:n.x, z:n.z, r:r };
    });
    return Object.keys(best).map(function(k){ return best[k]; });
  })();
  var CARTS = { n:44, speed:2.1, order:['market','warehouse','shop','factory','fuel','depot','caravanserai'], dwell:[20,60] };
  var CARAVANS = { n:9, speed:1.5, beasts:4, dwell:[150,380],
                   order:['caravanserai','market','warehouse'] };

  var AG = LIFE.agents, byKind = {};
  function homeFor(kind){
    if(kind==='monk') return any('order_home','home_mid','home_poor');
    if(kind==='academic') return any('home_rich','home_mid');
    if(kind==='worker') return any('home_poor','home_mid');
    if(kind==='merchant') return any('home_mid','home_rich');
    return any('home_mid','home_poor','home_rich');
  }
  function spawn(kind, cfg){
    var home = pick(homeFor(kind));
    /* START WHERE THEY WOULD ALREADY BE. Spawning everyone on their doorstep means the city
       is empty for the first ten minutes while it walks itself to work, so a little over half
       of each kind begins at a place its own day would have taken it to. */
    var at = home;
    if(rnd() < 0.62){
      var cats = cfg.order.filter(function(c){ return c!=='home'; });
      var cat = cats[Math.floor(rnd()*cats.length)] || 'plaza';
      var list = pool([cat, 'plaza']);
      var t = pick(list); at = { x:t.x + rr(-t.r*0.8, t.r*0.8), z:t.z + rr(-t.r*0.8, t.r*0.8), r:t.r };
    }
    var a = { kind:kind, cfg:cfg, home:home, x:at.x, z:at.z, y:terrainH(at.x,at.z), ry:rr(0,TAU),
              path:null, seg:0, t:0, leg:null, wait:rr(0,16), speed:cfg.speed*rr(0.85,1.15), want:null, node:-1,
              off:rr(-2.2,2.2), phase:rr(0,TAU),
              garb: cfg.robe!=null ? cfg.robe : pick(PAL.people.garb), skin: pick(PAL.people.skin),
              step:0 };
    AG.push(a); byKind[kind]=(byKind[kind]||0)+1; return a;
  }
  for(var k in KINDS){ for(var i=0;i<KINDS[k].n;i++) spawn(k, KINDS[k]); }

  function vehDestination(v){
    if(v.caravan){
      /* A caravan's business is the caravanserai: two trips in three end in its yard, where
         it stands for five to twelve minutes before moving on. */
      /* and it does not set out for the yard it is already standing in — with a dwell of
         several minutes that is how a caravan spends the whole day parked */
      var yard = pool(['caravanserai'])[0];
      var here = yard && Math.hypot(yard.x - v.x, yard.z - v.z) < 70;
      if(!here && rnd() < 0.66) return yard;
      return pick(pool(['market','warehouse','depot','shop']));
    }
    return pick(pool(v.cfg.order.concat(['plaza'])));
  }

  /* WHICH WAY DOES EACH POPULATION ACTUALLY GO? A route in use is a thin thing — at any
     instant most people are standing still somewhere — so each kind also accumulates the
     edges it has travelled. That accumulated set is the population's real corridor map,
     and it is what the devtool draws. */
  var USED = {};
  function remember(kind, pth){
    var m = USED[kind] || (USED[kind] = {});
    for(var i=0;i<pth.length-1;i++){
      var a=pth[i], b=pth[i+1], k = a<b ? a+'_'+b : b+'_'+a;
      m[k] = (m[k]||0) + 1;
    }
  }

  /* carts and caravans: a draught beast, a cart, and a driver walking beside it */
  var VEH = [];
  /* Caravans and carts share one code path. They did not, and the caravans sat at the depot
     for three rounds of debugging while the carts — identical but for two fields — ran the
     city. Two code paths for one behaviour is how that happens; `viz` keeps them apart for
     the devtool and the draw without forking the simulation. */
  function spawnVeh(kind, cfg, nBeast){
    var s0 = pick(kind==='caravan' ? pool(['caravanserai','market']) : pool(['depot','warehouse','market','shop']));
    var s = { x:s0.x + rr(-10,10), z:s0.z + rr(-10,10) };
    VEH.push({ kind:'cart', viz:kind, caravan:(kind==='caravan'), cfg:cfg, x:s.x, z:s.z, y:terrainH(s.x,s.z), ry:rr(0,TAU), path:null, seg:0, t:0,
               leg:null, wait:rr(0,30), speed:cfg.speed*rr(0.85,1.1), want:null, node:-1, beasts:nBeast||1,
               leg2:(kind==='caravan' ? (rnd()<0.5?'in':'rest') : null), atRoad:false, hidden:false, destFn:vehDestination,
               hide:pick(PAL.trunk), load:pick(PAL.cloth), garb:pick(PAL.people.garb), skin:pick(PAL.people.skin) });
  }
  for(i=0;i<CARTS.n;i++) spawnVeh('cart', CARTS, 1);
  for(i=0;i<CARAVANS.n;i++) spawnVeh('caravan', CARAVANS, CARAVANS.beasts);

  /* ---- where should this agent be at this hour? ---- */
  /* don't set out for somewhere you are already standing */
  function elsewhere(a, w, tries){
    for(var i=0; i<(tries||4); i++){
      if(!w) break;
      if(Math.hypot(w.x-a.x, w.z-a.z) > Math.max(16, w.r*1.2)) return w;
      w = arguments[3] ? arguments[3]() : w;
      if(!arguments[3]) break;
    }
    return w;
  }
  function destination(a, hour){
    var c=a.cfg;
    if(c.work){ var on = c.work[0] <= hour && hour < c.work[1];
      if(!on) return a.home; }
    else if(hour > 21 || hour < 6) return a.home;
    var roll;
    if(a.kind==='rambler'){
      roll = function(){ var seq = c.order[Math.floor(rnd()*c.order.length)];
        return seq==='home' ? a.home : pick(pool([seq, 'plaza'])); };
    } else {
      roll = function(){ return pick(pool(c.order.concat(['plaza']))); };
    }
    return elsewhere(a, roll(), 5, roll);
  }
  /* ---- the request queue: a few routes solved per frame, never a stampede ---- */
  var QUEUE = [], QPF = 5, failed = 0;
  function ask(a, want, deep){ a.want = want; a.pathPending = true; QUEUE.push({ a:a, deep:!!deep }); }
  function serve(){
    var n = 0;
    while(QUEUE.length && n++ < QPF){
      var q = QUEUE.shift(), a = q.a, w = a.want; if(!w) continue;
      var s = a.node >= 0 ? a.node : navNear(a.x, a.z), g = navNear(w.x, w.z);
      var pth = route(s, g, q.deep);
      a.pathPending = false;
      if(pth && pth.length > 1){ a.path = pth; a.seg = 0; a.t = 0; a.node = -1; remember(a.kind, pth); }
      else if(pth){
        /* ALREADY THERE. Two places can share the nearest street node — five Order buildings
           round one junction do — and treating that as a failed route left the monks standing
           in the road retrying every eight seconds instead of walking in. It is an arrival. */
        a.path = null; a.node = s;
        a.leg = standPoint(w, a.x, a.z);
        if(!a.leg){ var dd = a.cfg.dwell || [10,30]; a.wait = rr(dd[0], dd[1]); }
      }
      else { a.path = null; a.node = s; a.wait = rr(4,12); failed++; }
    }
  }

  /* which threshold of this place, and is it worth crossing to? */
  function standPoint(w, fromX, fromZ){
    if(!w) return null;
    if(w.doors && w.doors.length){
      var best=null, bd=1e9, bi=-1;
      for(var i=0;i<w.doors.length;i++){ var d=w.doors[i], q=Math.hypot(d[0]-fromX, d[1]-fromZ);
        if(q<bd){ bd=q; best=d; bi=i; } }
      /* a WORKING door (76-doors.js): walk up to it, open it and go in, rather than loitering outside */
      var D = (w.doorIds && bi>=0) ? FIX.byId[w.doorIds[bi]] : null;
      if(best && bd < 70 && D && D.to==='interior' && D.style!=='gate') return { x:best[0], z:best[1], door:D.id };
      if(best && bd < 70) return { x:best[0] + rr(-1.2,1.2), z:best[1] + rr(-1.2,1.2) };
    }
    /* an open place — the market, a park, the forecourt — is stood IN, not at */
    if(w.r > 12){ var a=rr(0,TAU), rq=w.r*Math.sqrt(rnd())*0.85;
      return { x:w.x+Math.cos(a)*rq, z:w.z+Math.sin(a)*rq }; }
    return null;
  }

  /* ---- movement ---- */
  function step(a, dt, hour){
    if(a.wait > 0){ a.wait -= dt;
      if(a.wait <= 0 && a.inside){ var Dx=FIX.byId[a.inside]; DOORS.touch(a.inside, 3.0); a.inside=null;   /* out through the door again */
        if(Dx){ a.x=Dx.x+Math.sin(Dx.yaw)*0.9; a.z=Dx.z+Math.cos(Dx.yaw)*0.9; a.y=terrainH(a.x,a.z); } }
      return; }
    /* THE LAST LEG COMES FIRST. It was below the no-path check, so an agent that had
       finished its route and was crossing to a doorstep looked path-less and was sent to
       ask for a new destination on the spot — which is what kept the caravans pinned to
       the depot flipping between states without ever setting out. */
    if(a.leg){
      var lx=a.leg.x-a.x, lz=a.leg.z-a.z, lL=Math.hypot(lx,lz);
      if(lL < 0.5){
        if(a.leg.door && !a.leg.inner){ var Dd=FIX.byId[a.leg.door]; DOORS.touch(Dd.id, 3.5);        /* at the threshold: open up, step in */
          a.leg = { x:Dd.x-Math.sin(Dd.yaw)*1.4, z:Dd.z-Math.cos(Dd.yaw)*1.4, door:Dd.id, inner:true }; return; }
        if(a.leg.inner){ a.inside = a.leg.door; }
        a.leg=null; if(!a.destFn){ var dl=a.cfg.dwell||[10,30]; a.wait=rr(dl[0],dl[1]); } a.step=0; return; }
      var st = Math.min(lL, a.speed*0.72*dt);
      a.x += lx/lL*st; a.z += lz/lL*st; a.y = terrainH(a.x, a.z);
      a.ry = Math.atan2(lx, lz); a.step = (a.step||0) + a.speed*dt*2.2;
      return;
    }
    if(!a.path){
      if(a.destFn) return;                 /* vehicles ask for themselves, in stepVeh */
      if(a.pathPending) return;
      ask(a, destination(a, hour), !!a.cfg.deep);
      return;
    }
    var A = NAV.nodes[a.path[a.seg]], B = NAV.nodes[a.path[a.seg+1]];
    if(!B){ /* arrived at the street; now cross to the door */
      a.node = a.path[a.seg]; a.path = null;
      a.leg = standPoint(a.want, a.x, a.z);
      if(!a.leg){ var d = a.cfg.dwell || [10,30]; a.wait = rr(d[0], d[1]); a.step = 0; }
      return;
    }
    var dx=B.x-A.x, dz=B.z-A.z, L=Math.hypot(dx,dz)||1;
    a.t += a.speed*dt / L;
    while(a.t >= 1){ a.t -= 1; a.seg++;
      A = NAV.nodes[a.path[a.seg]]; B = NAV.nodes[a.path[a.seg+1]];
      if(!B){ a.node = a.path[a.seg]; a.path=null; a.leg = standPoint(a.want, a.x, a.z);
        if(!a.leg){ var d2=a.cfg.dwell||[10,30]; a.wait=rr(d2[0],d2[1]); } return; }
      dx=B.x-A.x; dz=B.z-A.z; L=Math.hypot(dx,dz)||1;
    }
    var nx=-dz/L, nz=dx/L;                               /* walk to one side of the centre line */
    a.x = mix(A.x,B.x,a.t) + nx*a.off;
    a.z = mix(A.z,B.z,a.t) + nz*a.off;
    a.y = mix(A.y,B.y,a.t);
    a.ry = Math.atan2(dx, dz);
    a.step += a.speed*dt*2.6;
  }
  /* CARTS AND CARAVANS route synchronously. There are fifty of them and they set out
     rarely, so the queue buys nothing, and going through the pedestrians' queue is what
     hid a state-machine fault in the caravans for two rounds: the shared code path made
     it impossible to see which of the two was asking. A vehicle asks for itself. */
  function stepVeh(v, dt, hour){
    if(v.wait > 0){ v.wait -= dt; return; }
    if(!v.path && !v.leg){
      var w = v.destFn(v); v.want = w;
      var sN = v.node >= 0 ? v.node : navNear(v.x, v.z), gN = navNear(w.x, w.z);
      var pth = route(sN, gN, false);
      if(pth && pth.length > 1){
        v.path = pth; v.seg = 0; v.t = 0; v.node = -1; v.hidden = false; remember(v.viz||v.kind, pth);
      } else {
        v.node = sN;
        v.leg = standPoint(w, v.x, v.z);
        if(!v.leg) arriveVeh(v, w);
      }
      return;
    }
    var w2 = v.want;
    step(v, dt, hour);
    if(!v.path && !v.leg && v.wait <= 0) arriveVeh(v, w2);
  }
  function arriveVeh(v, w){
    var d = v.cfg.dwell || [20,60];
    if(v.caravan){
      v.wait = rr(d[0], d[1]); return;                            /* the long stand in the yard */
    }
    v.wait = rr(d[0], d[1]);
  }

  /* ============================ 4. THE BODIES ============================ */
  var MAXP = 720, MAXV = 64, VIS = 520;                 /* how far a body is worth drawing */
  function IM(geo, n){
    var m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({}), n);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.setColorAt(0, new THREE.Color(0xffffff));
    m.frustumCulled = false; m.castShadow = false; m.receiveShadow = false;
    m.count = 0; scene.add(m); return m;
  }
  var gBody = new THREE.CylinderGeometry(0.19, 0.27, 1.06, 7, 1, false); gBody.translate(0, 0.53, 0);
  var gHead = new THREE.SphereGeometry(0.155, 7, 5);    gHead.translate(0, 1.28, 0);
  var gCart = new THREE.BoxGeometry(1.05, 0.72, 2.10);  gCart.translate(0, 0.78, 0);
  var gBeast= new THREE.BoxGeometry(0.86, 0.94, 1.90);  gBeast.translate(0, 0.86, 0);
  var mBody = IM(gBody, MAXP), mHead = IM(gHead, MAXP), mCart = IM(gCart, MAXV), mBeast = IM(gBeast, MAXV*5);

  var _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1,1,1);
  var _c = new THREE.Color();
  function put(mesh, idx, x, y, z, ry, sx, sy, sz, col){
    _e.set(0, ry, 0); _q.setFromEuler(_e); _p.set(x,y,z); _s.set(sx,sy,sz);
    _m.compose(_p, _q, _s); mesh.setMatrixAt(idx, _m);
    _c.setHex(col); mesh.setColorAt(idx, _c);
  }

  /* fixed-step fast-forward for headless tests (frames there are far too slow to watch a day go by) */
  LIFE.sim = function(secs, dt){ dt=dt||0.25; var h=skyHour(); for(var t=0;t<secs;t+=dt){ serve(); for(var i=0;i<AG.length;i++) step(AG[i], dt, h); } };
  var acc = 0;
  TICKS.push(function(dt, hour){
    serve();
    /* everyone thinks, but only the near ones are drawn */
    var cx = camera.position.x, cz = camera.position.z, far = VIS*VIS;
    var nb = 0, nv = 0, nbe = 0;
    for(var i=0;i<AG.length;i++){
      var a = AG[i];
      step(a, dt, hour);
      if(nb >= MAXP || a.inside) continue;                 /* indoors: not drawn until they come out */
      var ddx=a.x-cx, ddz=a.z-cz; if(ddx*ddx+ddz*ddz > far) continue;
      var bob = a.wait > 0 ? 0 : Math.abs(Math.sin(a.step))*0.055;
      var sway = a.wait > 0 ? 0 : Math.sin(a.step)*0.11;
      put(mBody, nb, a.x, a.y+bob, a.z, a.ry+sway*0.25, 1, 1, 1, a.garb);
      put(mHead, nb, a.x, a.y+bob, a.z, a.ry, 1, 1, 1, a.skin);
      nb++;
    }
    for(i=0;i<VEH.length;i++){
      var v = VEH[i];
      stepVeh(v, dt, hour);
      if(v.hidden) continue;
      var vdx=v.x-cx, vdz=v.z-cz; if(vdx*vdx+vdz*vdz > far) continue;
      if(nv < MAXV){ put(mCart, nv, v.x, v.y, v.z, v.ry, 1, 1, 1, v.load); nv++; }
      for(var b=0;b<v.beasts && nbe<MAXV*5;b++){
        var back = 1.9 + b*2.1, bx = v.x + Math.sin(v.ry)*back, bz = v.z + Math.cos(v.ry)*back;
        put(mBeast, nbe, bx, v.y, bz, v.ry, 1, 1, 1, v.hide); nbe++;
      }
      /* the driver walks at the beast's shoulder */
      if(nb < MAXP){
        var px = v.x + Math.sin(v.ry)*2.6 + Math.cos(v.ry)*1.1, pz = v.z + Math.cos(v.ry)*2.6 - Math.sin(v.ry)*1.1;
        put(mBody, nb, px, v.y, pz, v.ry, 1, 1, 1, v.garb);
        put(mHead, nb, px, v.y, pz, v.ry, 1, 1, 1, v.skin);
        nb++;
      }
    }
    mBody.count=nb; mHead.count=nb; mCart.count=nv; mBeast.count=nbe;
    mBody.instanceMatrix.needsUpdate = mHead.instanceMatrix.needsUpdate = true;
    mCart.instanceMatrix.needsUpdate = mBeast.instanceMatrix.needsUpdate = true;
    if(mBody.instanceColor) mBody.instanceColor.needsUpdate = true;
    if(mHead.instanceColor) mHead.instanceColor.needsUpdate = true;
    if(mCart.instanceColor) mCart.instanceColor.needsUpdate = true;
    if(mBeast.instanceColor) mBeast.instanceColor.needsUpdate = true;
    acc += dt;
    if(acc > 1.0){ acc = 0; LIFE.stats.drawn = nb; LIFE.stats.vehicles = nv; }
  });

  /* THE PATH DEVTOOL, ONE LAYER PER KIND. Each population draws its own routes in its own
     colour, so you can turn on just the monks and watch the Order's circuit, or just the
     carts and see the goods network, instead of one undifferentiated tangle. */
  var VIZ = [
    ['rambler',  'Life: pedestrians',        0],
    ['merchant', 'Life: market merchants',   1],
    ['worker',   'Life: factory workers',    2],
    ['academic', 'Life: academics',          3],
    ['monk',     'Life: monks of the Order', 4],   /* saffron, as they are */
    ['cart',     'Life: carts and caravans', 5]
  ];
  function routesOf(kind){
    var out = [], m = USED[kind];
    if(m) for(var k in m){
      var ab = k.split('_'), A = NAV.nodes[+ab[0]], B = NAV.nodes[+ab[1]];
      if(A && B) out.push([[A.x,A.y+0.5,A.z],[B.x,B.y+0.5,B.z]]);
    }
    /* and the last legs off the street to a doorstep, for whoever is crossing one now */
    var src = (kind==='cart' || kind==='caravan') ? VEH : AG;
    src.forEach(function(a){ if((a.viz||a.kind)===kind && a.leg)
      out.push([[a.x,a.y+0.5,a.z],[a.leg.x, terrainH(a.leg.x,a.leg.z)+0.5, a.leg.z]]); });
    return out;
  }
  VIZ.forEach(function(V){
    PATHVIZ.push({ key:'life_'+V[0], label:V[1], color:PAL.pathlife[V[2]], width:2.8,
                   paths:function(){ return routesOf(V[0]); } });
  });

  var counts = {}; for(var c in POI) counts[c] = POI[c].length;
  LIFE.stats.poi = counts;
  window._life = { all:AG, veh:VEH, places:POI, agents:AG.length, vehicles:VEH.length, byKind:byKind, poi:counts, roadEnds:ROAD_END.length,
                   corridors:function(){ var o={}; for(var k in USED) o[k]=Object.keys(USED[k]).length; return o; },
                   routeFailures:function(){ return failed; }, stats:LIFE.stats };
})();
