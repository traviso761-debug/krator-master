/* ============================== 13c. INTERIORS (THE INTERIORS KIT) ==============================
   Every building Girder draws with an interior gets its rooms from the Beast Rider interior set
   (kits/interiors/sets/beast-rider.js, in 51-furniture-bundle.js), furnished from the catalog through the
   same KratorFurniture runtime as the outdoor pieces. ON by default; ?interiors=0 turns it off.

   Girder sizes its shells itself (55-arch.js: every tower slot, house and shelter has its own width and
   depth), so each building's item is the set item with the shell's REAL outline: the set item's key,
   culture, wealth, residence rule and programme, its bodies/rooms re-derived from the record the builder
   left (S.shell, Hs.shell, HALL.shell, T.deck.keeper), in the set's frame (origin the building's frame
   origin, +z its front; the catalog's x is the mirror of 55-arch's FRM "right", hence gixP).
     tower slot   home -> br_bldg_girder_dwelling      store -> #1      workshop -> #2 (smithy where the
                  builder drew a forge)    common -> #3    shrine -> #4
     ground house roundhut -> br_bldg_girder_house     joglo -> #1     longhouse -> #2
     the Assembly Hall -> br_bldg_girder_assembly_hall;  the keeper's shelter on each roost deck -> br_bldg_girder_roost_deck
   The steps of KratorInteriors.sets.furnish(), split in two: the rooms are PLANNED here, at build time
   (planBuilding's partitions are drawn with the kit's own wall boxes, before 75-terrain emits them), and
   FURNISHED after the page is up, a few buildings a frame, nearest the camera first (placing ~350
   buildings' furniture takes the interiors placer tens of seconds; the page would not open for that
   long). Each frame's pieces are merged into one growing mesh per render family (a constant handful of
   draw calls). window._interiors reports progress; .done === .total when every building is furnished.
   A residence that fails the set's rule (a bed, a food and an item container per unit) is furnished again
   with another placement seed (twice at most); what still fails is listed in _interiors.residenceFails. */
var GIX = { jobs:[], total:0, done:0, rooms:0, pieces:0, partitions:0, dropped:[], fallbacks:0, residenceFails:[], retries:0,
            missingItems:{}, ms:0, msPlan:0, t0:0, acc:{}, group:null, mergedTris:0, byKey:{} };
GIX.batch = KratorFurniture.batch();
GIX.adapter = KratorInteriors.runtimeAdapter(KratorFurniture, GIX.batch);
(function(){
  var lights0 = GIX.adapter.lights;   /* a piece's lights do not depend on its seed: one build per key and variant, not per placement */
  GIX.adapter.lights = function(key, v){ return lights0(key, v, { seed:1, wealth:0.5 }); };
  if(!GFURN.on) GIX.adapter.build = GFURN.adapter.build;
})();

/* FRM-local (55-arch: x = right, z = front) -> the set's frame (the catalog's: x is the mirror) */
function gixP(lx, lz){ return [ +(-lx).toFixed(3), +(+lz).toFixed(3) ]; }
function gixRect(x0, x1, z0, z1){ return [gixP(x0,z0), gixP(x1,z0), gixP(x1,z1), gixP(x0,z1)]; }
function gixFrame(sf){ return { x:sf.x, z:sf.z, ry:Math.atan2(sf.fx, sf.fz), f:sf }; }
/* a world point -> FRM-local of frame sf */
function gixLocal(sf, wx, wz){ var dx=wx-sf.x, dz=wz-sf.z; return [ dx*(-sf.fz) + dz*sf.fx, dx*sf.fx + dz*sf.fz ]; }
function gixItem(key, def){
  var base = KratorInteriors.sets.find(key);
  if(!base){ GIX.missingItems[key]=(GIX.missingItems[key]||0)+1; return null; }
  if(base.skip) return null;
  return Object.assign({}, base, { bodies:def.bodies||[], rooms:def.rooms||[], note:'Girder: derived from the shell 55-arch.js drew' });
}
function gixPlan(item, fr, baseY, id){
  return KratorInteriors.sets.instantiate(item, fr.x, fr.z, fr.ry, { baseY:baseY, register:false, seed:0, prefix:id+'.' });
}
/* queue a building: plan its rooms now (a body that cannot hold its programme is planned with `fallback`) */
function gixQueue(owner, id, key, def, fr, baseY, wcol, fallback){
  var item = gixItem(key, def); if(!item) return null;
  var t0 = performance.now(), inst = gixPlan(item, fr, baseY, id);
  var dropped = []; inst.buildings.forEach(function(B){ (B.report.dropped||[]).forEach(function(d){ dropped.push(d); }); });
  if(dropped.length && fallback){
    item = Object.assign({}, item, { bodies:item.bodies.map(function(b){ return Object.assign({}, b, { program:fallback }); }) });
    inst = gixPlan(item, fr, baseY, id); GIX.fallbacks++;
    dropped = []; inst.buildings.forEach(function(B){ (B.report.dropped||[]).forEach(function(d){ dropped.push(d); }); });
  }
  if(dropped.length) GIX.dropped.push(id+': '+dropped.map(function(d){ return d.kinds.join('+')+' ('+d.why+')'; }).join('; '));
  /* the planner's partitions: drawn with the kit's wall boxes (a doorway in each), solid for the walk mode */
  inst.buildings.forEach(function(B){ B.walls.forEach(function(w){ if(w.kind==='partition') gixPartition(w, wcol); }); });
  GIX.msPlan += performance.now()-t0;
  var J = { owner:owner, id:id, key:key, item:item, inst:inst, x:fr.x, y:baseY, z:fr.z };
  owner.interior = { key:key, id:id, rooms:inst.rooms.length, kinds:inst.rooms.map(function(R){ return R.kind; }), furnished:false };
  GIX.jobs.push(J); GIX.total++; GIX.rooms += inst.rooms.length;
  return J;
}
function gixPartition(w, wcol){
  var ax=w.a[0], az=w.a[1], bx=w.b[0], bz=w.b[1], L=Math.hypot(bx-ax,bz-az); if(L<0.05) return;
  var ux=(bx-ax)/L, uz=(bz-az)/L, ry=Math.atan2(-uz,ux), col=shade(wcol==null?WALLC[1]:wcol,-0.06), th=w.thick||0.1;
  var cuts=[0]; (w.openings||[]).forEach(function(o){ if(o.door){ cuts.push(o.u-o.w/2, o.u+o.w/2); } }); cuts.push(L);
  for(var i=0;i<cuts.length;i+=2){ var a=Math.max(0,cuts[i]), b=Math.min(L,cuts[i+1]); if(b-a<0.04) continue;
    var m=(a+b)/2; BOX(ax+ux*m, w.y, az+uz*m, b-a, w.h, th, ry, col, 'wall'); gwSeg(ax+ux*a, az+uz*a, ax+ux*b, az+uz*b, th, w.y, w.y+w.h, 'wall'); }
  (w.openings||[]).forEach(function(o){ if(!o.door) return; var top=Math.min(w.h, 2.1); if(w.h-top<0.05) return;
    BOX(ax+ux*o.u, w.y+top, az+uz*o.u, o.w, w.h-top, th, ry, col, 'wall'); });
  GIX.partitions++;
}

/* ---------------------------------------------------------------- the buildings */
if(GFURN.interiors){
  /* tower slots */
  SLOTS.forEach(function(S){
    var sh=S.shell; if(!sh) return;
    var fr=gixFrame(sh.f), id='girder.slot.'+S.id, k=sh.kind, H=sh.H;
    if(k==='home' || k==='store'){
      var key = k==='home' ? 'br_bldg_girder_dwelling' : 'br_bldg_girder_dwelling#1', base=KratorInteriors.sets.find(key);
      gixQueue(S, id, key, { bodies:[{ id:'home', poly:gixRect(sh.x0,sh.x1,sh.zb,sh.z1), y:0, levels:[{ h:+(H-0.1).toFixed(2) }], wall:0.16, partition:0.1,
        roof:'flat', doors:[{ at:gixP(0,sh.z1), w:sh.doorW }], program:base?base.bodies[0].program:['living','bedroom'] }] }, fr, sh.y, sh.wcol, ['cottage']);
    } else if(k==='workshop'){
      var gx0=-0.45, gx1=sh.x1-0.16, zf2=sh.zf-0.75;
      gixQueue(S, id, 'br_bldg_girder_dwelling#2', { rooms:[{ id:'work', kind:sh.forge?'smithy':'workshop', poly:gixRect(sh.x0+0.16,sh.x1-0.16,sh.zb+0.16,zf2), y:0,
        h:+(H-0.35).toFixed(2), doors:[{ at:gixP((gx0+gx1)/2,zf2), w:+Math.min(2.4,gx1-gx0-0.2).toFixed(2), swing:'none' }] }] }, fr, sh.y, sh.wcol);
    } else if(k==='common'){
      var mz=(sh.zb+sh.zf)/2, posts=[[sh.x0,sh.zb],[sh.x1,sh.zb],[sh.x0,sh.zf-0.2],[sh.x1,sh.zf-0.2],[sh.x0,mz],[sh.x1,mz]];
      gixQueue(S, id, 'br_bldg_girder_dwelling#3', { rooms:[{ id:'common', kind:'hall', poly:gixRect(sh.x0+0.2,sh.x1-0.2,sh.zb+0.2,sh.zf-0.25), y:0.12,
        h:+(H-0.45).toFixed(2), doors:[{ at:gixP(0,sh.zf-0.25), w:+Math.min(sh.x1-sh.x0-1.2,4).toFixed(2), swing:'none' }],
        fixtures:posts.map(function(p,i){ var q=gixP(p[0],p[1]); return { id:'post'+i, kind:'post', x:q[0], z:q[1], ry:0, w:0.5, d:0.5, h:H, reach:false }; }) }] }, fr, sh.y, sh.wcol);
    } else if(k==='shrine'){
      var sw=sh.sw, sc=sh.sc, e=sw/2-0.35, fx=[];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c,i){ var q=gixP(c[0]*e, sc+c[1]*e); fx.push({ id:'post'+i, kind:'post', x:q[0], z:q[1], ry:0, w:0.42, d:0.42, h:2.3, reach:false }); });
      var qs=gixP(0,sc-0.3), ql=gixP(1.4,sh.zf-0.5), qo=gixP(-1.3,sh.zf-0.7);
      fx.push({ id:'sanctum', kind:'altar', x:qs[0], z:qs[1], ry:0, w:2.0, d:2.0, h:1.9, reach:false },
              { id:'lamp', kind:'lamp', x:ql[0], z:ql[1], ry:0, w:0.4, d:0.4, h:1.6, reach:false },
              { id:'offering', kind:'altar', x:qo[0], z:qo[1], ry:0, w:0.72, d:0.72, h:0.8, reach:false });
      gixQueue(S, id, 'br_bldg_girder_dwelling#4', { rooms:[{ id:'shrine', kind:'shrine', poly:gixRect(-sw/2+0.05,sw/2-0.05,sc-sw/2+0.05,sc+sw/2-0.05), y:0.3, h:1.95,
        doors:[{ at:gixP(0.05,sc+sw/2-0.05), w:2.0, swing:'none' }], fixtures:fx }] }, fr, sh.y, sh.wcol);
    }
  });
  /* the ground houses */
  HOUSES.forEach(function(Hs){
    var sh=Hs.shell; if(!sh) return;
    var fr=gixFrame(sh.f), id='girder.house.'+Hs.id;
    if(sh.kind==='roundhut'){
      var rooms=[];
      sh.huts.forEach(function(h,i){
        var c=gixLocal(sh.f,h.x,h.z), d=gixLocal(sh.f,h.x+Math.cos(h.door)*(h.r-0.2),h.z+Math.sin(h.door)*(h.r-0.2)), cs=gixP(c[0],c[1]), ds=gixP(d[0],d[1]);
        rooms.push({ id:i?'store'+i:'hut', kind:h.kind, poly:KratorInteriors.sets.shape.circle(h.r-0.2,12,cs[0],cs[1]), y:0.22, h:+(h.wh-0.05).toFixed(2),
          doors:[{ at:ds, w:1.0 }] });
      });
      gixQueue(Hs, id, 'br_bldg_girder_house', { rooms:rooms }, fr, sh.y, null);
    } else if(sh.kind==='joglo'){
      var hw=sh.hw;
      gixQueue(Hs, id, 'br_bldg_girder_house#1', {
        bodies:[{ id:'house', poly:gixRect(-hw+0.6,hw-0.6,sh.zb+0.5,sh.zm), y:0.5, levels:[{ h:2.9 }], wall:0.16, partition:0.1, roof:'hip',
          doors:[{ at:gixP(0,sh.zm), w:1.5 }], program:['living','bedroom'] }],
        rooms:[{ id:'pendopo', kind:'hall', poly:gixRect(-hw+0.35,hw-0.35,sh.zm+0.02,sh.zF-0.2), y:0.5, h:2.9,
          doors:[{ at:gixP(0,sh.zF-0.2), w:3.0, swing:'none' }, { at:gixP(0,sh.zm+0.02), w:1.5, swing:'none' }],
          fixtures:sh.posts.map(function(p,i){ var q=gixP(p[0],p[1]); return { id:'post'+i, kind:'post', x:q[0], z:q[1], ry:0, w:0.42, d:0.42, h:3.0, reach:false }; }) }]
      }, fr, sh.y, sh.wcol, ['cottage']);
    } else {
      gixQueue(Hs, id, 'br_bldg_girder_house#2', { bodies:[{ id:'longhouse', poly:gixRect(sh.x0,sh.x1,sh.z0,sh.z1), y:0.25, levels:[{ h:2.9 }], wall:0.16, partition:0.1,
        roof:'hip', doors:[{ at:gixP(0,sh.z1), w:1.4 }], program:['living','bedroom','store'] }] }, fr, sh.y, sh.wcol, ['living','bedroom']);
    }
  });
  /* the Assembly Hall: one round room inside the wall ring, the bench ring and the hearth as fixtures */
  if(HALL.shell){
    var hs=HALL.shell, rin=hs.rw-0.33;
    gixQueue(HALL, 'girder.hall', 'br_bldg_girder_assembly_hall', { rooms:[{ id:'hall', kind:'hall', poly:KratorInteriors.sets.shape.circle(rin,32), y:+(hs.fy-hs.y).toFixed(3), h:+(hs.wh-0.2).toFixed(2),
      doors:hs.doors.map(function(a){ return { at:[+(Math.cos(a)*(rin-0.03)).toFixed(3), +(Math.sin(a)*(rin-0.03)).toFixed(3)], w:2.6, swing:'none' }; }),
      fixtures:hs.fixtures }] }, { x:HALL.x, z:HALL.z, ry:0 }, hs.y, null);
  }
  /* the keeper's shelter on each roost deck */
  TOWERS.forEach(function(T){ var kp=T.deck.keeper; if(!kp) return;
    gixQueue(T.deck, 'girder.keeper.'+T.id, 'br_bldg_girder_roost_deck', { rooms:[{ id:'keeper', kind:'store', poly:gixRect(kp.x0+0.16,kp.x1-0.16,kp.zb+0.16,kp.zf-0.16), y:0, h:2.1,
      doors:[{ at:gixP(0,kp.zf-0.16), w:1.0 }] }] }, gixFrame(kp.f), kp.y, null);
  });
}

/* ---------------------------------------------------------------- furnishing, after load */
function gixFurnish(J){
  var IX = KratorInteriors, plans, res, seed = 0;
  for(var att=0; att<3; att++){
    plans = {};
    J.inst.rooms.forEach(function(R){ plans[R.id] = IX.furnishRoom(R, GIX.adapter, { seed:seed }); });
    res = IX.sets.auditResidence(J.inst, plans);
    if(!res.fails.length) break;
    seed += 101; GIX.retries++;
  }
  var n = 0;
  J.inst.rooms.forEach(function(R){ var P=plans[R.id]; IX.buildRoom(P, GIX.adapter, R); n += P.placements.length;
    P.placements.forEach(function(p){
      var kv=p.key+'|'+(p.variant|0); GIX.byKey[kv]=(GIX.byKey[kv]||0)+1;
      if(p.anchor==='ceiling' || p.anchor==='surface' || p.h < 0.3 || p.type==='rug') return;
      gwBox(p.x, p.y, p.z, p.w, p.h, p.d, p.ry, 'furniture');                  /* the walk mode bumps into it */
    }); });
  if(res.fails.length) GIX.residenceFails = GIX.residenceFails.concat(res.fails);
  J.owner.interior.pieces = n; J.owner.interior.furnished = true;
  J.owner.interior.residence = { residence:res.residence, beds:res.beds, food:res.food, items:res.items, fails:res.fails.length };
  J.plans = plans; GIX.pieces += n; GIX.done++;
}
/* the merged meshes: one per render family, grown as the frames' batches arrive */
function gixMaterial(m){
  var fam = m.material.userData.family;
  if(m.material.isMeshBasicMaterial) m.material.onBeforeCompile = gfSRGBHook;
  else nlMaterial(m.material, 'ix|'+fam, gfSRGBHook);
  m.castShadow = !FAST; m.receiveShadow = !FAST; m.frustumCulled = false; m.userData.furniture = true; m.userData.interiors = true;
  return m.material;
}
/* one accumulator per render family (vertex colours) and per painted material (decals: uv + map) */
var GIX_SPEC = { col:[['position',3,Float32Array,false],['normal',3,Float32Array,false],['color',3,Uint8Array,true]],
                 uv:[['position',3,Float32Array,false],['normal',3,Float32Array,false],['uv',2,Float32Array,false]] };
function gixAccum(key, kind, material, geo){
  var spec = GIX_SPEC[kind], A = GIX.acc[key], nv = geo.attributes.position.count;
  if(!A || A.n + nv > A.cap){
    var cap = Math.max(nv*2, A ? A.cap*2 : 60000); while(A && A.n + nv > cap) cap *= 2;
    var g2 = new THREE.BufferGeometry(), arrs = {};
    spec.forEach(function(s){ var a = new s[2](cap*s[1]); if(A) a.set(A.arrs[s[0]].subarray(0, A.n*s[1])); arrs[s[0]] = a; g2.setAttribute(s[0], new THREE.BufferAttribute(a, s[1], s[3])); });
    if(A){ A.mesh.geometry.dispose(); A.mesh.geometry = g2; A.arrs = arrs; A.cap = cap; A.fresh = true; }
    else {
      var mesh = new THREE.Mesh(g2, material); mesh.name = 'interiors:'+key; gixMaterial(mesh, kind);
      GIX.group.add(mesh); A = GIX.acc[key] = { n:0, cap:cap, arrs:arrs, mesh:mesh, fresh:true, spec:spec };
    }
  }
  var at = A.mesh.geometry.attributes;
  spec.forEach(function(s){ A.arrs[s[0]].set(geo.attributes[s[0]].array, A.n*s[1]); var b = at[s[0]];
    if(A.fresh){ b.updateRange.offset = 0; b.updateRange.count = -1; } else { b.updateRange.offset = A.n*s[1]; b.updateRange.count = nv*s[1]; }
    b.needsUpdate = true; });
  A.fresh = false; A.n += nv;
  A.mesh.geometry.setDrawRange(0, A.n);
  A.mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), 1e5);
  geo.dispose();
}
function gixMaterial(m, kind){
  if(kind==='uv') gfDecalMaterial(m.material);
  else if(m.material.isMeshBasicMaterial) m.material.onBeforeCompile = gfSRGBHook;
  else nlMaterial(m.material, 'ix|'+m.material.userData.family, gfSRGBHook);
  m.castShadow = !FAST; m.receiveShadow = !FAST; m.frustumCulled = false; m.userData.furniture = true; m.userData.interiors = true;
}
function gixMerge(){
  if(!Object.keys(GIX.batch.buckets).length && !GIX.batch.textured.length) return;
  GIX.mergedTris = GIX.batch.tris;            /* the batch's count runs on across flushes */
  var g = GIX.batch.flush(null);
  if(!GIX.group){ GIX.group = new THREE.Group(); GIX.group.name = 'interiors-furniture'; GIX.group.userData.inspectLabel = 'Furniture (interiors)'; scene.add(GIX.group); }
  g.children.slice().forEach(function(m){
    if(m.material.map) gixAccum('decal|'+m.material.uuid, 'uv', m.material, gfDecal(m));
    else { var fam = m.material.userData.family || '', had = !!GIX.acc[fam]; gixAccum(fam, 'col', m.material, m.geometry); if(had) m.material.dispose(); }
  });
}
GIX.lastMerge = 0;
function gixTick(){
  if(!GIX.jobs.length) return;
  if(!GIX.t0) GIX.t0 = performance.now();
  /* a slice of each frame: ~30 ms (less while walking); more when frames are slow anyway (software GL) */
  var t0 = performance.now(), cam = camera.position, gap = GIX.lastTick ? t0 - GIX.lastTick : 16;
  var budget = clamp(gap*0.6, window._walk && _walk.on ? 18 : 30, 1200);
  while(GIX.jobs.length && performance.now() - t0 < budget){
    var bi = 0, bd = 1e18;
    for(var i=0;i<GIX.jobs.length;i++){ var J=GIX.jobs[i], d=(J.x-cam.x)*(J.x-cam.x)+(J.y-cam.y)*(J.y-cam.y)*4+(J.z-cam.z)*(J.z-cam.z); if(d<bd){ bd=d; bi=i; } }
    gixFurnish(GIX.jobs.splice(bi,1)[0]);
  }
  GIX.ms += performance.now() - t0; GIX.lastTick = performance.now();
  if(!GIX.jobs.length || performance.now() - GIX.lastMerge > 400){ gixMerge(); GIX.lastMerge = performance.now(); }
  if(!GIX.jobs.length) GIX.wall = +((performance.now()-GIX.t0)/1000).toFixed(1);
  gixReport();
}
function gixReport(){
  window._interiors = { on:GFURN.interiors, furniture:GFURN.on, total:GIX.total, done:GIX.done, rooms:GIX.rooms, pieces:GIX.pieces, partitions:GIX.partitions,
    fallbacks:GIX.fallbacks, dropped:GIX.dropped.length, droppedList:GIX.dropped.slice(0,12), retries:GIX.retries,
    residenceFails:GIX.residenceFails.length, residenceFailList:GIX.residenceFails.slice(0,12), missingItems:GIX.missingItems,
    tris:GIX.mergedTris|0, meshes:GIX.group?GIX.group.children.length:0, msPlan:Math.round(GIX.msPlan), msFurnish:Math.round(GIX.ms), seconds:GIX.wall||null };
}
gixReport();
TICKS.push(gixTick);
