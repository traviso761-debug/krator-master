/* ============================== 30. HERO (girder-hero.html only) ==============================
   Styv, a third-person character ordered about with the mouse. build_hero.py adds this fragment, 89-talk.js and
   88-hero-model.js (HERO_GLB: the hero/*.glb models as base64, by name) to Girder's own list. This fragment is the
   body: loading and rigging a model, routing, moving, the clips, the camera. 89-talk.js is the controls (right click
   to walk, double right click to run), the people to talk to, the name tags and the dialogue box.
     - An order: walk (or run) to a point, a ring marking the destination; onArrive is called on arrival.
     - Route: straight when the line is clear on one level, else A* on the NAV walk graph (30-layout.js; the lift
       edges left out, so towers are climbed by their stairs), its ends and corners pulled tight where a straight
       line is clear; graph nodes over a hole or inside a solid are skipped. The body moves with the walk mode's
       solids (83-walk.js: wkSupport, wkBlocked, wkPush), so it climbs the switchback ramps, crosses the rope bridges
       and slides along walls; it never steps off an edge of more than 1 m. Stuck for half a second: a detour on a
       0.5 m grid round the obstacle; failing that, the graph nodes there are banned and the route is planned again;
       failing that, it hops to the waypoint (H.snaps; rare: 2 in a 30-order random test) or stops short.
     - Clips: idle standing, walk or run moving, cross-faded; the walk and run rates follow the ground speed (the
       clip's own stride is measured from its planted foot when the model loads, so the feet do not slide).
     - Camera: the orbit camera (80-camera.js) follows the hero; drag to orbit, wheel to zoom. H frees the camera
       (fly as in Girder; clicks stop ordering) and brings it back.
   window._hero: { on, ready, follow(on), order(x, y, z, run, onArrive), stop(), face(x, z), root(), rig(name, cb),
   floor(x, z, feet), standable(x, y, z), pose(), path(), step(dt, n), place(x, z, feet), detour(x, y, z), state() }.
   step() runs the hero without the frame loop (a hidden page has none).                                          */
(function(){
var H = { on:true, ready:false, x:0, z:0, feet:0, vy:0, yaw:0, grounded:true, path:[], run:false, speed:0,
          walkV:1.45, runV:4.6, stuck:0, snaps:0, snapLog:[], detours:0, replans:0, detoured:false, lastD:1e9, mode:'idle', err:'' };
var heroRoot = null, heroMixer = null, heroActs = {}, heroNat = { walk:1.2, run:3.5 }, heroCur = null, heroFace = null;
var heroMark = null, heroMarkT = 0;

/* --- models: GLTFLoader (three r128's, from the CDN) parses an embedded GLB; heroRig sets one up in the scene --- */
var heroLoaderQ = null;
function heroLoader(cb){
  if(THREE.GLTFLoader) return cb();
  if(heroLoaderQ) return heroLoaderQ.push(cb);
  heroLoaderQ = [cb];
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
  if(location.protocol !== 'file:') s.crossOrigin = 'anonymous';
  s.onload = function(){ heroLoaderQ.forEach(function(f){ f(); }); };
  s.onerror = function(){ ERR('hero: could not load GLTFLoader from the CDN'); };
  document.head.appendChild(s);
}
/* cb({ root, mixer, acts:{clip name: action}, head }) once the named model (HERO_GLB[name]) is in the scene, idling */
function heroRig(name, cb){
  heroLoader(function(){
    var bin = atob(HERO_GLB[name]), buf = new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++) buf[i] = bin.charCodeAt(i);
    new THREE.GLTFLoader().parse(buf.buffer, '', function(g){
      try{
        var root = g.scene, head = null;
        root.traverse(function(o){
          if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; o.userData.noPick = true;
            if(o.material && o.material.map) o.material.map.anisotropy = 4; }
          if(/Head$/.test(o.name)) head = o;
        });
        root.userData.noPick = true;
        scene.add(root);
        var mixer = new THREE.AnimationMixer(root), acts = {};
        g.animations.forEach(function(c){
          /* in place: the hips keep their bob but not any drift across the ground */
          c.tracks.forEach(function(t){ if(/Hips\.position$/.test(t.name)){ var v=t.values, x0=v[0], z0=v[2];
            for(var i=0;i<v.length;i+=3){ v[i]=x0; v[i+2]=z0; } } });
          acts[c.name] = mixer.clipAction(c);
        });
        if(acts.idle) acts.idle.play();
        cb({ root:root, mixer:mixer, acts:acts, head:head });
      }catch(e){ ERR('hero: '+name+': '+(e&&e.stack||e)); }
    }, function(e){ ERR('hero: '+name+': '+(e&&e.message||e)); });
  });
}
function heroSetup(R){
  heroRoot = R.root; heroMixer = R.mixer; heroActs = R.acts; heroRoot.userData.head = R.head;
  if(heroActs.idle) heroActs.idle.stop();
  heroNat.walk = heroStride('walk') || heroNat.walk;
  heroNat.run = heroStride('run') || heroNat.run;
  heroActs.idle.reset().play(); heroCur = 'idle';
  heroSpawn();
  heroPlace();
  H.ready = true;
  heroFollow(true, true);
}
/* the clip's own ground speed: how fast a planted foot slides back under the body (model space, m/s) */
function heroStride(name){
  var A = heroActs[name]; if(!A) return 0;
  var bones = {}; heroRoot.traverse(function(o){ if(/LeftToeBase$|RightToeBase$/.test(o.name)) bones[o.name] = o; });
  var feet = Object.keys(bones).map(function(k){ return bones[k]; }); if(feet.length < 2) return 0;
  heroRoot.position.set(0,0,0); heroRoot.rotation.set(0,0,0);
  A.play(); A.setEffectiveWeight(1);
  var dur = A.getClip().duration, n = 90, smp = [], p = new THREE.Vector3();
  for(var i=0;i<=n;i++){ heroMixer.setTime(dur*i/n); heroRoot.updateMatrixWorld(true);
    smp.push(feet.map(function(f){ f.getWorldPosition(p); return [p.x, p.y, p.z]; })); }
  A.stop(); heroMixer.setTime(0);
  var vs = [];
  for(var fi=0; fi<feet.length; fi++){
    var ymin = 1e9; smp.forEach(function(s){ ymin = Math.min(ymin, s[fi][1]); });
    for(var k=1;k<=n;k++){ var a=smp[k-1][fi], b=smp[k][fi];
      if(a[1] < ymin+0.03 && b[1] < ymin+0.03) vs.push(Math.abs(b[2]-a[2]) / (dur/n)); }
  }
  if(vs.length < 4) return 0;
  vs.sort(function(a,b){ return a-b; });
  var v = vs[vs.length>>1];
  return v > 0.3 && v < 12 ? v : 0;
}
function heroSpawn(){
  wkBuild();
  var x = 0, z = HALL.R + 9, feet = wkSupport(x, z, terrainH(x,z) + 0.5);
  for(var r=0; r<12 && wkBlocked(x, z, feet); r+=0.5){ var a=r*2.4; x+=Math.cos(a)*0.5; z+=Math.sin(a)*0.5; feet=wkSupport(x, z, feet+0.5); }
  H.x = x; H.z = z; H.feet = feet; H.yaw = Math.PI; H.vy = 0; H.grounded = true;
}
function heroPlace(){ heroRoot.position.set(H.x, H.feet, H.z); heroRoot.rotation.y = H.yaw; }

/* --- routing --- */
var NAVN = NAV.nodes, NAVE = NAV.edges, heroBan = new Set();   /* heroBan: graph nodes found unreachable on this order */
/* a binary min-heap of [key, id] */
function heroHeap(){
  var h = [];
  return { size:function(){ return h.length; },
    push:function(k, n){ h.push([k,n]); var i=h.length-1; while(i>0){ var p=(i-1)>>1; if(h[p][0]<=k) break; var t=h[p]; h[p]=h[i]; h[i]=t; i=p; } },
    pop:function(){ var top=h[0], last=h.pop(); if(h.length){ h[0]=last; var i=0;
        for(;;){ var c=2*i+1; if(c>=h.length) break; if(c+1<h.length && h[c+1][0]<h[c][0]) c++; if(h[c][0]>=h[i][0]) break; var t=h[c]; h[c]=h[i]; h[i]=t; i=c; } }
      return top[1]; } };
}
function heroAstar(src, dst){
  var N = NAVN.length, g = new Float64Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), done = new Uint8Array(N);
  var heap = heroHeap(), D = NAVN[dst], push = heap.push;
  g[src] = 0; push(0, src);
  while(heap.size()){
    var u = heap.pop(); if(done[u]) continue; done[u] = 1;
    if(u === dst) break;
    var adj = NAV.adj[u];
    for(var q=0;q<adj.length;q++){ var e = NAVE[adj[q]]; if(e.kind === 'lift') continue;
      var v = e.a===u ? e.b : e.a; if(done[v] || heroBan.has(v)) continue;
      var c = g[u] + e.len * (e.kind==='stair' ? 1.3 : 1);
      if(c < g[v]){ g[v] = c; from[v] = u; var V=NAVN[v]; push(c + Math.hypot(V.x-D.x, V.y-D.y, V.z-D.z), v); } }
  }
  if(!done[dst]) return null;
  var out = [], c2 = dst; while(c2 !== -1){ out.push(c2); c2 = from[c2]; }
  return out.reverse();
}
/* the k nearest graph nodes to a point, nearest first, a level change weighing three times a step across */
function heroNodes(x, y, z, k){
  var all = [];
  for(var i=0;i<NAVN.length;i++){ if(heroBan.has(i)) continue; var n=NAVN[i]; all.push([Math.hypot(n.x-x, n.z-z) + 3*Math.abs(n.y-y), i]); }
  all.sort(function(a, b){ return a[0]-b[0]; });
  return all.slice(0, k).map(function(a){ return a[1]; });
}
/* the support under the body's footprint, not just its centre: the highest of the centre and four points 0.2 m out,
   so a hairline seam between two solids (a deck meeting a bridgehead) is not a drop to the ground */
function heroFloor(x, z, feet){
  var s = wkSupport(x, z, feet), r = 0.2;
  if(s > feet - 0.3) return s;
  return Math.max(s, wkSupport(x+r, z, feet), wkSupport(x-r, z, feet), wkSupport(x, z+r, feet), wkSupport(x, z-r, feet));
}
/* can a body stand at point p ([x, y, z]): something under it at its height, and not inside a solid? */
function heroStandable(p){ var f = heroFloor(p[0], p[2], p[1]+0.3); return f > p[1] - 1.0 && !wkBlocked(p[0], p[2], f); }
/* can a body walk straight from a to b on one surface? (no wall, no drop of more than a step, ends at b's height) */
function heroClear(ax, ay, az, bx, by, bz){
  var L = Math.hypot(bx-ax, bz-az), n = Math.max(1, Math.ceil(L/0.4)), feet = ay;
  for(var i=1;i<=n;i++){
    var t = i/n, x = ax+(bx-ax)*t, z = az+(bz-az)*t, sup = heroFloor(x, z, feet);
    if(sup < feet - WALKER.step) return false;
    feet = sup;
    if(wkBlocked(x, z, feet)) return false;
  }
  return Math.abs(feet - by) < 0.6;
}
function heroRoute(tx, ty, tz){
  var tf = heroFloor(tx, tz, ty + 0.3);
  if(Math.abs(tf - ty) > 0.8) tf = ty;
  if(heroClear(H.x, H.feet, H.z, tx, tf, tz)) return [[tx, tf, tz]];
  /* from the nearest graph node that has a way through (the nearest may be cut off: a banned neighbour, a stall corner) */
  var S = heroNodes(H.x, H.feet, H.z, 6), D = heroNodes(tx, tf, tz, 4), ids = null;
  for(var si=0; si<S.length && !ids; si++) for(var di=0; di<D.length && !ids; di++) ids = heroAstar(S[si], D[di]);
  if(!ids) return null;
  /* graph nodes with nothing under them (the roost deck's walk crosses the lift shaft) are left out: the body goes round */
  var pts = ids.map(function(i){ var n=NAVN[i]; return [n.x, n.y, n.z]; })
    .filter(heroStandable);
  pts.push([tx, tf, tz]);
  return heroPull(pts, 10);
}
/* pull the string: from each kept point, skip ahead to the farthest point (of the next `look`) reachable in a straight line */
function heroPull(pts, look){
  var out = [], cur = [H.x, H.feet, H.z], i = 0;
  while(i < pts.length){
    var j = Math.min(pts.length-1, i+look);
    for(; j>i; j--) if(Math.abs(pts[j][1]-cur[1]) < 0.6 && heroClear(cur[0], cur[1], cur[2], pts[j][0], pts[j][1], pts[j][2])) break;
    out.push(pts[j]); cur = pts[j]; i = j+1;
  }
  return out;
}
/* a way round whatever stops the body short of waypoint wp: A* on 0.5 m cells over the box round both (12 m spare),
   each cell's feet carried from the cell it was reached from (a step up or down at most, as the body moves) */
function heroDetour(wp){
  var C = 0.5, pad = 12, x0 = Math.min(H.x, wp[0])-pad, z0 = Math.min(H.z, wp[2])-pad,
      nx = Math.ceil((Math.max(H.x, wp[0])+pad-x0)/C), nz = Math.ceil((Math.max(H.z, wp[2])+pad-z0)/C);
  if(nx*nz > 200*200) return null;
  var N = nx*nz, g = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), feet = new Float32Array(N), done = new Uint8Array(N);
  function cell(x, z){ return Math.floor((x-x0)/C) + Math.floor((z-z0)/C)*nx; }
  function cx(i){ return x0 + (i%nx + 0.5)*C; }
  function cz(i){ return z0 + (Math.floor(i/nx) + 0.5)*C; }
  var si = cell(H.x, H.z), di = cell(wp[0], wp[2]), heap = heroHeap(), goal = -1, spent = 0;
  g[si] = 0; feet[si] = H.feet; heap.push(0, si);
  while(heap.size() && spent < 30000){
    var u = heap.pop(); if(done[u]) continue; done[u] = 1; spent++;
    var ux = cx(u), uz = cz(u);
    if(Math.hypot(ux-wp[0], uz-wp[2]) < 0.8 && Math.abs(feet[u]-wp[1]) < 0.8){ goal = u; break; }
    var ix = u % nx, iz = Math.floor(u/nx);
    for(var ddx=-1; ddx<=1; ddx++) for(var ddz=-1; ddz<=1; ddz++){
      if(!ddx && !ddz) continue;
      var jx = ix+ddx, jz = iz+ddz; if(jx<0 || jz<0 || jx>=nx || jz>=nz) continue;
      var v = jx + jz*nx; if(done[v]) continue;
      var c = g[u] + ((ddx && ddz) ? 1.414 : 1)*C; if(c >= g[v]) continue;
      var x = cx(v), z = cz(v), sup = heroFloor(x, z, feet[u]);
      if(sup < feet[u] - WALKER.step || wkBlocked(x, z, sup)) continue;
      g[v] = c; from[v] = u; feet[v] = sup;
      heap.push(c + Math.hypot(x-wp[0], z-wp[2]), v);
    }
  }
  if(goal < 0) return null;
  var pts = heroStandable(wp) ? [[wp[0], wp[1], wp[2]]] : [[cx(goal), feet[goal], cz(goal)]];
  for(var k = from[goal]; k >= 0 && k !== si; k = from[k]) pts.push([cx(k), feet[k], cz(k)]);
  return heroPull(pts.reverse(), 40);
}
function heroOrder(x, y, z, run, onArrive){
  if(!H.ready) return false;
  H.replans = 0; heroBan.clear();
  var r = heroRoute(x, y, z);
  if(!r || !r.length){ H.err = 'no route'; return false; }
  H.path = r; H.run = !!run; H.stuck = 0; H.lastD = 1e9; H.err = ''; H.detoured = false; H.onArrive = onArrive || null; heroFace = null;
  heroMarkAt(r[r.length-1]);
  return true;
}
/* route again to `fin` with the graph's nodes at the waypoint the body could not reach left out */
function heroReplan(wp, fin){
  var n0 = heroBan.size;
  for(var i=0;i<NAVN.length;i++){ var n = NAVN[i]; if(Math.hypot(n.x-wp[0], n.z-wp[2]) < 2.0 && Math.abs(n.y-wp[1]) < 1.5) heroBan.add(i); }
  if(heroBan.size === n0) return null;
  return heroRoute(fin[0], fin[1], fin[2]);
}

/* --- the destination ring --- */
function heroMarkAt(p){
  if(!heroMark){
    heroMark = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.46, 32), new THREE.MeshBasicMaterial({ color:0xf0d890, transparent:true, opacity:0.9, depthWrite:false, fog:false, side:THREE.DoubleSide }));
    heroMark.rotation.x = -Math.PI/2; heroMark.renderOrder = 998; heroMark.userData.noPick = true; scene.add(heroMark);
  }
  heroMark.position.set(p[0], p[1]+0.06, p[2]); heroMark.visible = true; heroMarkT = 0;
}

/* the rope sides of a bridge (83-walk.js wkBridgeHold), holding only moves outward: the walk mode's version also
   stops a body that has drifted within its radius of a rope from stepping back toward the middle */
function heroBridgeHold(x0, z0, x1, z1){
  for(var i=0;i<BRIDGES.length;i++){
    var b=BRIDGES[i], dx=b.b.x-b.a.x, dz=b.b.z-b.a.z, L=Math.hypot(dx,dz), ux=dx/L, uz=dz/L;
    var t=((x0-b.a.x)*ux+(z0-b.a.z)*uz)/L, s0=-(x0-b.a.x)*uz+(z0-b.a.z)*ux, s1=-(x1-b.a.x)*uz+(z1-b.a.z)*ux;
    if(t>0.03 && t<0.97 && Math.abs(s0)<b.w/2 && Math.abs(H.feet-bridgeY(b,t))<1.5 && Math.abs(s1)>b.w/2-WALKER.r && Math.abs(s1)>Math.abs(s0)) return true;
  }
  return false;
}
/* --- moving: the walk mode's body (83-walk.js wkStep), steered at the next waypoint --- */
function heroMove(dt){
  var moving = false;
  if(H.path.length){
    var wp = H.path[0], last = H.path.length === 1, dx = wp[0]-H.x, dz = wp[2]-H.z, d = Math.hypot(dx, dz);
    /* a waypoint is passed within 0.6 m only when the next leg is clear from here (else the corner gets cut into a post) */
    var nxt = H.path[1], near = last ? d < 0.25 : d < 0.15 || (d < 0.6 && Math.abs(wp[1]-H.feet) < 1.2 && heroClear(H.x, H.feet, H.z, nxt[0], nxt[1], nxt[2]));
    if(near){ H.path.shift(); H.stuck = 0; H.lastD = 1e9; H.detoured = false; }
    else {
      var want = H.run ? H.runV : H.walkV;
      if(last) want = Math.min(want, 0.6 + d*2.2);               /* ease in to the stop */
      H.speed += (want - H.speed) * Math.min(1, dt*6);
      var step = Math.min(d, H.speed*dt), mx = dx/d*step, mz = dz/d*step, sub = Math.max(1, Math.ceil(step/0.15)), x0=H.x, z0=H.z;
      var stuck = wkBlocked(H.x, H.z, H.feet);
      for(var i=0;i<sub;i++){
        var sx = mx/sub, sz = mz/sub, ok = false;
        [[sx,sz,0],[sx,sz,1],[sx,0,0],[0,sz,0]].some(function(m){
          if(!m[0] && !m[1]) return false;
          var nx = H.x+m[0], nz = H.z+m[1];
          if(m[2]){ if(stuck) return false; var p = wkPush(nx, nz, H.feet); nx = p[0]; nz = p[1];
            if((nx-H.x)*sx + (nz-H.z)*sz < 0.2*(sx*sx+sz*sz)) return false; }
          if((!stuck && wkBlocked(nx, nz, H.feet)) || heroBridgeHold(H.x, H.z, nx, nz)) return false;
          if(H.grounded && heroFloor(nx, nz, H.feet) < H.feet - 1.0) return false;   /* never off an edge: a deck rim, a lift shaft */
          H.x = nx; H.z = nz; ok = true; return true;
        });
        if(!ok) break;
      }
      var mvx = H.x-x0, mvz = H.z-z0, mv = Math.hypot(mvx, mvz);
      if(mv > 1e-4){ var ty = Math.atan2(mvx, mvz), dy = Math.atan2(Math.sin(ty-H.yaw), Math.cos(ty-H.yaw)); H.yaw += dy*Math.min(1, dt*10); }
      moving = mv/dt > 0.25;
      /* stuck: no headway for half a second. Go round on the cell grid; failing that (or stuck again on the detour),
         the graph is wrong here (a deck-walk edge through a stall partition): ban its nodes at this spot and route
         again; failing that, step to the waypoint, or stop short of the destination */
      if(d < H.lastD - 0.05){ H.lastD = d; H.stuck = 0; } else H.stuck += dt;
      if(H.stuck > 0.6){
        H.stuck = 0; H.lastD = 1e9;
        var fin = H.path[H.path.length-1], dt2 = H.detoured ? null : heroDetour(wp), r2 = null;
        if(dt2){ H.detours++; H.detoured = true; H.path = dt2.concat(H.path.slice(1)); }
        else if(H.replans < 4 && (r2 = heroReplan(wp, fin))){ H.replans++; H.detoured = false; H.path = r2; }
        else if(last){ H.path.length = 0; H.err = 'blocked'; }
        else { H.snaps++; H.snapLog.push([+H.x.toFixed(1), +H.feet.toFixed(1), +H.z.toFixed(1), +wp[0].toFixed(1), +wp[1].toFixed(1), +wp[2].toFixed(1)]);
          if(heroStandable(wp)){ H.x = wp[0]; H.z = wp[2]; H.feet = heroFloor(wp[0], wp[2], wp[1]+0.3); H.vy = 0; } H.path.shift(); H.detoured = false; }
      }
    }
  }
  if(!H.path.length){ H.speed = 0; if(heroMark) heroMark.visible = false;
    if(H.onArrive){ var f = H.onArrive; H.onArrive = null; if(!H.err) f(); } }
  if(!moving && heroFace){ var fy = Math.atan2(heroFace[0]-H.x, heroFace[1]-H.z), fd = Math.atan2(Math.sin(fy-H.yaw), Math.cos(fy-H.yaw));
    H.yaw += fd*Math.min(1, dt*6); if(Math.abs(fd) < 0.01) heroFace = null; }
  var sup = heroFloor(H.x, H.z, H.feet);
  if(H.grounded && sup >= H.feet-0.45 && H.vy<=0){ H.feet = sup; H.vy = 0; }
  else { H.vy -= 18*dt; H.feet += H.vy*dt; if(H.feet <= sup){ H.feet = sup; H.vy = 0; H.grounded = true; } else H.grounded = false; }
  if(H.feet < sup) H.feet = sup;
  return moving;
}
function heroClip(name, rate){
  var A = heroActs[name]; if(!A) return;
  if(heroCur !== name){
    var P = heroActs[heroCur];
    A.reset(); A.setEffectiveWeight(1); A.play();
    if(P) A.crossFadeFrom(P, 0.25, false);
    heroCur = name;
  }
  A.timeScale = rate;
}
function heroTick(dt){
  if(!H.ready) return;
  var moving = heroMove(dt);
  if(!moving) heroClip('idle', 1);
  else if(H.run && heroActs.run) heroClip('run', clamp(H.speed/heroNat.run, 0.5, 2));
  else heroClip('walk', clamp(H.speed/heroNat.walk, 0.5, 2));
  H.mode = heroCur;
  heroMixer.update(dt);
  heroPlace();
  if(heroMark && heroMark.visible){ heroMarkT += dt; var k = 1 + 0.12*Math.sin(heroMarkT*6); heroMark.scale.set(k, k, k); }
  if(H.on && !WALKER.on){
    var a = Math.min(1, dt*6), ty = H.feet + 1.3;
    ctl.tx += (H.x-ctl.tx)*a; ctl.ty += (ty-ctl.ty)*a; ctl.tz += (H.z-ctl.tz)*a;
    heroCamFit(dt);
  }
}
/* --- the follow camera kept out of walls, floors and roofs ---
   A ray through the scene costs 40-200 ms here, so the camera tests the walk mode's solids instead: from the target
   to the orbit's camera point, the first sample inside a solid (a wall, a floor plate, a deck) pulls it in. Under a
   roof the solids do not model (the hall's and the houses' roofs, shelters, stalls: SITES of those kinds round
   Styv), it comes in close and low, under the eaves. The user's orbit and zoom (ctl) are kept; only the frame's
   camera is fitted. */
var HERO_ROOFED = { hall:1, house:1, keeper:1, roost:1, stall:1, home:1, store:1, workshop:1, common:1, shrine:1 };
var heroCam = { r:9, site:null, siteT:0 };
function heroInSolid(x, y, z){
  if(y < terrainH(x, z) + 0.2) return true;
  return wkNear(x, z, 0.15, function(s){
    if(s.ring || s.bridge || s.tag === 'person') return false;
    return s.bot < y + 0.2 && s.top > y - 0.2 && wkTopAt(s, x, z, 0.15) !== null;
  });
}
function heroCamFit(dt){
  heroCam.siteT -= dt;
  if(heroCam.siteT <= 0){ heroCam.siteT = 0.25; heroCam.site = null;
    for(var i=0;i<SITES.length;i++){ var s = SITES[i];
      if(HERO_ROOFED[s.kind] && Math.hypot(H.x-s.x, H.z-s.z) < s.r && H.feet > s.y-1 && H.feet < s.y+s.h){ heroCam.site = s; break; } } }
  var R = ctl.radius, phi = ctl.phi;
  if(heroCam.site){ R = Math.min(R, 3.4); phi = Math.max(phi, 1.22); }
  var sp = Math.sin(phi), cx = sp*Math.cos(ctl.theta), cy = Math.cos(phi), cz = sp*Math.sin(ctl.theta), fit = R;
  for(var k=1, n=Math.max(4, Math.ceil(R/0.4)); k<=n; k++){ var d = R*k/n;
    if(heroInSolid(ctl.tx+cx*d, ctl.ty+cy*d, ctl.tz+cz*d)){ fit = Math.max(0.6, d - 0.45); break; } }
  heroCam.r = fit < heroCam.r ? fit : heroCam.r + (fit-heroCam.r)*Math.min(1, dt*2.5);
  var keepR = ctl.radius, keepP = ctl.phi;
  ctl.radius = heroCam.r; ctl.phi = phi; applyCam(); ctl.radius = keepR; ctl.phi = keepP;
}
TICKS.push(function(dt){ heroTick(dt); });

/* --- following and orders --- */
function heroFollow(on, snap){
  H.on = on == null ? !H.on : !!on;
  if(H.on && H.ready){
    if(WALKER.on) wkToggle(false);
    camera.near = 0.3; camera.updateProjectionMatrix();
    if(snap || ctl.radius > 40){ ctl.tx = H.x; ctl.ty = H.feet+1.3; ctl.tz = H.z; ctl.radius = 9; ctl.phi = 1.15; ctl.theta = -H.yaw - Math.PI/2; applyCam(); }
  } else if(!H.on){ camera.near = 0.8; camera.updateProjectionMatrix(); }
  var b = document.getElementById('heroToggle');
  if(b){ b.textContent = 'Hero: ' + (H.on ? 'Follow' : 'Free camera') + ' (H)'; b.classList.toggle('on', H.on); }
  return H.on;
}
addEventListener('keydown', function(e){
  if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if(e.key === 'h' || e.key === 'H'){ heroFollow(); e.preventDefault(); }
});
(function(){
  document.title = 'Girder · Hero';
  var wb = document.getElementById('walkToggle'), b = document.createElement('button');
  b.id = 'heroToggle'; b.style.cssText = 'width:100%;box-sizing:border-box;margin:4px 0 0';
  b.onclick = function(){ heroFollow(); };
  wb.parentNode.insertBefore(b, wb.nextSibling);
  heroFollow(true);
})();

window._hero = { get on(){ return H.on; }, get ready(){ return H.ready; }, follow:heroFollow, order:heroOrder,
  stop:function(){ H.path.length = 0; H.onArrive = null; },
  face:function(x, z){ heroFace = [x, z]; },
  root:function(){ return heroRoot; }, rig:heroRig, floor:heroFloor,
  standable:function(x, y, z){ return heroStandable([x, y, z]); },
  pose:function(){ return { x:H.x, z:H.z, feet:H.feet, yaw:H.yaw, clip:heroCur, speed:H.speed }; },
  path:function(){ return H.path.slice(); },
  step:function(dt, n){ for(var i=0;i<(n||1);i++) heroTick(dt); return this.pose(); },
  place:function(x, z, feet){ H.x = x; H.z = z; H.feet = heroFloor(x, z, feet); H.vy = 0; H.grounded = true; H.path.length = 0; heroPlace(); return this.pose(); },
  detour:function(x, y, z){ return heroDetour([x, y, z]); },
  state:function(){ return { ready:H.ready, moving:H.path.length>0, clip:heroCur, err:H.err, snaps:H.snaps, detours:H.detours, snapLog:H.snapLog, nat:heroNat }; } };
heroRig('styv', heroSetup);
})();
