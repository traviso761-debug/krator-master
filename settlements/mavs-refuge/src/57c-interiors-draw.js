/* ============================== 13c. INTERIORS (DRAWING): the rooms near the camera ==============================
   57a-interiors.js holds the data (MIX.units, MIX.record(i): each unit's plan and pieces, MIX.piecesNow(i) with the
   owner's edits). This fragment draws it, NEAR THE CAMERA ONLY: ~1800 units x tens of pieces would be millions of
   triangles, and the walls hide them from outside. A unit is drawn when the camera comes within MIX_ON metres, nearest
   first, a slice of each frame, and dropped again beyond MIX_OFF (its geometry is kept in a small cache; its record is
   kept by 57a whatever happens here). The active units are spliced into ONE lit mesh and one glow mesh (each furniture
   family's tint baked into its vertex colours), plus the commonest painted panels: the draw calls stay a handful.
   The planner's exterior walls are drawn as a lining just inside the builder's walls where the builder drew no inner
   face of its own (the levels' side and core walls, the workshops' and open stores' back rooms); where it did (every
   front with windows, every lot, every hut: 55-arch lotWalls/hutWalls, 56-levels lvlFront) the planned wall is skipped.
   Partitions, floors, stairs and doors are plain boxes in two families (ixwall, ixwood).
   LIGHTS: every record's lamps and hearths are in the night light volume (57a); the nearest NL_POOL of the units drawn
   here also light their rooms per fragment (NLV_U.uIxP/uIxC/uIxF, 45-kit), each kept to its own storey's floor and
   ceiling: a lamp on the unit's evening schedule (81-glow's nwLit, as its windows), a hearth always, flickering.
   window._interiors reports; _interiors.view(kind, n) stands in a unit's doorway; _interiors.audit(step) checks every
   step-th unit's record; _interiors.slots(i) / .record(i) / .edit are 57a's. */
(function(){
var MIX = window.MIX;
var MIX_ON = 46, MIX_OFF = 66, MIX_MAX = 40, MIX_TRIS = 520000, MIX_CACHE = 140, MIX_DECALS = 4;
Object.assign(MIX, { active:[], queue:[], cached:0, group:null, meshes:{}, dirty:false, lastScan:0, lastRebuild:0, built:0, msBuild:0,
                     drawBatch:KratorFurniture.batch(), pool:[] });

/* is the planned exterior wall a -> b one whose inner face the builder drew? (a lot's or a hut's: all of them; a level
   room's: those on its front arc) */
function staticWall(u, a, b){
  if(u.staticAll) return true;
  if(!u.staticFront || !u.front) return false;
  var m = [(a[0]+b[0])/2, (a[1]+b[1])/2], F = u.front;
  for(var i=0;i<F.length-1;i++){ var p=F[i], q=F[i+1], vx=q[0]-p[0], vz=q[1]-p[1], L=vx*vx+vz*vz, t=L>0?clamp(((m[0]-p[0])*vx+(m[1]-p[1])*vz)/L,0,1):0;
    if(Math.hypot(m[0]-p[0]-vx*t, m[1]-p[1]-vz*t) < 0.08) return true; }
  return false;
}

/* ------------------------------------------------------------------ geometry: plain boxes into per-family arrays */
var _c = new THREE.Color();
function lin(hex){ _c.set(hex).convertSRGBToLinear(); return [Math.round(_c.r*255), Math.round(_c.g*255), Math.round(_c.b*255)]; }
function bucket(G, fam){ return G[fam] || (G[fam] = { p:[], n:[], c:[] }); }
function tri(b, a, q, r, nrm, rgb){
  var ux=q[0]-a[0], uy=q[1]-a[1], uz=q[2]-a[2], vx=r[0]-a[0], vy=r[1]-a[1], vz=r[2]-a[2];
  if((uy*vz-uz*vy)*nrm[0] + (uz*vx-ux*vz)*nrm[1] + (ux*vy-uy*vx)*nrm[2] < 0){ var t=q; q=r; r=t; }
  b.p.push(a[0],a[1],a[2], q[0],q[1],q[2], r[0],r[1],r[2]);
  for(var i=0;i<3;i++){ b.n.push(nrm[0],nrm[1],nrm[2]); b.c.push(rgb[0],rgb[1],rgb[2]); }
}
function quad(b, a, q, r, s, nrm, rgb){ tri(b,a,q,r,nrm,rgb); tri(b,a,r,s,nrm,rgb); }
/* a box, three.js convention: centre (cx, cz), base y0, sizes sx sy sz, rotation.y = ry; no bottom face */
function box(G, fam, cx, y0, cz, sx, sy, sz, ry, rgb){
  if(sx<0.005 || sy<0.005 || sz<0.005) return;
  var c=Math.cos(ry), s=Math.sin(ry), hx=sx/2, hz=sz/2, b=bucket(G,fam);
  function W(lx,ly,lz){ return [cx+lx*c+lz*s, y0+ly, cz-lx*s+lz*c]; }
  var X=[c,0,-s], Z=[s,0,c];
  quad(b, W(hx,0,-hz), W(hx,sy,-hz), W(hx,sy,hz), W(hx,0,hz), X, rgb);
  quad(b, W(-hx,0,-hz), W(-hx,0,hz), W(-hx,sy,hz), W(-hx,sy,-hz), [-X[0],0,-X[2]], rgb);
  quad(b, W(-hx,0,hz), W(hx,0,hz), W(hx,sy,hz), W(-hx,sy,hz), Z, rgb);
  quad(b, W(-hx,0,-hz), W(-hx,sy,-hz), W(hx,sy,-hz), W(hx,0,-hz), [-Z[0],0,-Z[2]], rgb);
  quad(b, W(-hx,sy,-hz), W(-hx,sy,hz), W(hx,sy,hz), W(hx,sy,-hz), [0,1,0], rgb);
}
/* a wall a -> b, offset `off` along n, from u0 to u1 along it */
function wallSeg(G, fam, a, t, n, off, u0, u1, y0, y1, thick, rgb){
  var len=u1-u0; if(len<0.01 || y1-y0<0.01) return; var uc=(u0+u1)/2;
  box(G, fam, a[0]+t[0]*uc+n[0]*off, y0, a[1]+t[1]*uc+n[1]*off, len, y1-y0, thick, Math.atan2(-t[1], t[0]), rgb);
}
function slab(G, fam, poly, holes, y0, y1, rgb){
  var V = function(p){ return new THREE.Vector2(p[0], p[1]); }, ct = poly.map(V), hs = (holes||[]).map(function(h){ return h.map(V); });
  var idx = THREE.ShapeUtils.triangulateShape(ct, hs), pts = ct.concat.apply(ct, hs), b = bucket(G, fam);
  idx.forEach(function(f){ var A=pts[f[0]], Bq=pts[f[1]], C=pts[f[2]];
    tri(b, [A.x,y1,A.y], [Bq.x,y1,Bq.y], [C.x,y1,C.y], [0,1,0], rgb);
    tri(b, [A.x,y0,A.y], [Bq.x,y0,Bq.y], [C.x,y0,C.y], [0,-1,0], shadeRgb(rgb,0.8)); });
}
function shadeRgb(c, k){ return [Math.round(c[0]*k), Math.round(c[1]*k), Math.round(c[2]*k)]; }

function mixShell(u, B){
  var G = {}, wc = lin(shade(u.wcol==null ? WALLC[1] : u.wcol, 0.10)), pc = lin(shade(u.wcol==null ? WALLC[1] : u.wcol, -0.04));
  var fl = lin(PLANKC[1]), st = lin(TIMBERC[0]), dc = lin(shade(TIMBERC[2], -0.2));
  B.walls.forEach(function(Wl){
    var a=Wl.a, b=Wl.b, len=Math.hypot(b[0]-a[0], b[1]-a[1]); if(len<1e-3) return;
    var t=[(b[0]-a[0])/len, (b[1]-a[1])/len], ext = Wl.kind==='exterior';
    if(ext && staticWall(u, a, b)) return;          /* the builder drew this wall's inner face, its windows cut (55, 56) */
    var n = ext ? [-Wl.out[0], -Wl.out[1]] : [-t[1], t[0]], off = ext ? Wl.thick/2 : 0, top = Wl.y+Wl.h, u0 = 0, fam = 'ixwall', col = ext ? wc : pc;
    (Wl.openings||[]).filter(function(o){ return o.door; }).sort(function(p,q){ return p.u-q.u; }).forEach(function(o){
      var a0 = o.u-o.w/2, a1 = o.u+o.w/2;
      wallSeg(G, fam, a, t, n, off, u0, a0, Wl.y, top, Wl.thick, col);
      wallSeg(G, fam, a, t, n, off, a0, a1, Wl.y+o.y1, top, Wl.thick, col);
      u0 = a1;
    });
    wallSeg(G, fam, a, t, n, off, u0, len, Wl.y, top, Wl.thick, col);
  });
  B.floors.forEach(function(F){ if(F.level) slab(G, 'ixwood', F.poly, F.holes, F.y-F.thick, F.y, fl); });
  B.stairs.forEach(function(S){
    if(!S.foot) return;
    var d=S.dir;
    if(S.kind==='stair'){
      var n=S.risers, tread=S.run/Math.max(1,n-1), rise=(S.y1-S.y0)/n;
      for(var i=0;i<n-1;i++){ var s=i*tread+tread/2; box(G, 'ixwood', S.foot[0]+d[0]*s, S.y0, S.foot[1]+d[1]*s, S.w, rise*(i+1), tread, S.ry, st); }
    }else{
      var side=[-d[1], d[0]], L=Math.hypot(S.run, S.y1-S.y0), rungs=Math.floor(L/0.3);
      [-1,1].forEach(function(sg){ var ax=S.foot[0]+side[0]*sg*S.w/2, az=S.foot[1]+side[1]*sg*S.w/2;
        for(var k=0;k<rungs;k++){ var f=k/rungs; box(G, 'ixwood', ax+(S.top[0]-S.foot[0])*f, S.y0+(S.y1-S.y0)*f, az+(S.top[1]-S.foot[1])*f, 0.06, (S.y1-S.y0)/rungs+0.02, 0.06, S.ry, st); } });
      for(var k=1;k<rungs;k++){ var f=k/rungs; box(G, 'ixwood', S.foot[0]+(S.top[0]-S.foot[0])*f, S.y0+(S.y1-S.y0)*f, S.foot[1]+(S.top[1]-S.foot[1])*f, S.w, 0.04, 0.05, S.ry, st); }
    }
  });
  /* doors: a street door closed in its opening (the builder's leaf is on the outside face); an inner door open 75 degrees */
  var th = u.shell.wall;
  B.rooms.forEach(function(R){ (R.doors||[]).forEach(function(d){
    var left=[-d.n[1], d.n[0]], h=Math.min(d.h||2.1, R.h-0.1)-0.02;
    if(d.to==='street' && !u.innerDoor){
      /* on the footprint; the leaf stands just in front of the wall face seen from inside: a lot's or hut's lining th in,
         a level room's front wall at the footprint itself */
      var sd = B.doors.filter(function(x){ return x.id===d.id; })[0], p = sd ? sd.at : d.at, off = u.staticAll ? th+0.04 : 0.05;
      box(G, 'ixwood', p[0]+d.n[0]*off, R.y+0.01, p[1]+d.n[1]*off, d.w-0.04, h, 0.06, Math.atan2(-left[1], left[0]), dc); return; }
    if(d.swing==='none' || (!d.leaf && d.to!=='street')) return;     /* a door from the trade or loading floor stands open */
    var hs=d.hinge==='right'?-1:1, hx=d.at[0]+left[0]*hs*d.w/2, hz=d.at[1]+left[1]*hs*d.w/2, dir=d.swing==='out'?-1:1, ang=75*Math.PI/180;
    var cx=-left[0]*hs, cz=-left[1]*hs, ox=d.n[0]*dir, oz=d.n[1]*dir, vx=cx*Math.cos(ang)+ox*Math.sin(ang), vz=cz*Math.cos(ang)+oz*Math.sin(ang);
    box(G, 'ixwood', hx+vx*d.w/2, R.y+0.01, hz+vz*d.w/2, d.w-0.04, h, 0.05, Math.atan2(-vz, vx), dc);
  }); });
  return G;
}

/* ------------------------------------------------------------------ build a unit: plan, furnish, draw into arrays */
function mixBuild(u){
  var t0 = performance.now(), rec = MIX.record(u.i), B = rec.B, bt = MIX.drawBatch;
  MIX.piecesNow(u.i).forEach(function(p){
    bt.place(p.key, p.x, p.y, p.z, p.ry, { variant:p.v, seed:p.seed, wealth:u.wealth, building:u.id, room:p.room, setting:'indoor' }); });
  var G = mixShell(u, B), parts = { lit:[], glow:[] }, geo = {}, tris = 0;
  function add(f, pos, nor, col){
    var k = f==='glow' ? 1 : brfMaterial(f).color.r, c = col;
    if(k !== 1){ c = new Uint8Array(col.length); for(var i=0;i<col.length;i++) c[i] = Math.round(col[i]*k); }
    parts[f==='glow' ? 'glow' : 'lit'].push({ pos:pos, nor:nor, col:c }); tris += pos.length/9;
  }
  for(var f in bt.buckets){ var b = bt.buckets[f]; if(b.pos.n) add(f, b.pos.view(), b.nor.view(), b.col.view()); }
  for(var g in G){ var s = G[g]; add(g, new Float32Array(s.p), new Float32Array(s.n), new Uint8Array(s.c)); }
  for(var key in parts){ var L = parts[key]; if(!L.length) continue;
    var n = L.reduce(function(a,q){ return a + q.pos.length; }, 0), o = 0, A = { pos:new Float32Array(n), nor:new Float32Array(n), col:new Uint8Array(n) };
    L.forEach(function(q){ A.pos.set(q.pos, o); A.nor.set(q.nor, o); A.col.set(q.col, o); o += q.pos.length; });
    geo[key] = A; }
  /* the painted panels (rugs, hangings: a canvas map each design) are baked into world space and grouped by map, so the
     interiors draw one mesh per design in view, not one per panel */
  u.decals = {};
  bt.textured.forEach(function(m){
    m.updateMatrix(); var g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry, mat = m.material, key = mat.map ? mat.map.uuid : mat.uuid;
    var P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, nm = new THREE.Matrix3().getNormalMatrix(m.matrix), v = new THREE.Vector3();
    var D = u.decals[key] || (u.decals[key] = { mat:mat, pos:[], nor:[], uv:[] });
    for(var i=0;i<P.count;i++){
      v.fromBufferAttribute(P, i).applyMatrix4(m.matrix); D.pos.push(v.x, v.y, v.z);
      if(N){ v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); D.nor.push(v.x, v.y, v.z); } else D.nor.push(0, 1, 0);
      if(U) D.uv.push(U.getX(i), U.getY(i)); else D.uv.push(0, 0);
    }
    tris += P.count/3;
    if(g !== m.geometry) g.dispose(); m.geometry.dispose();
  });
  for(var dk in u.decals){ var D = u.decals[dk]; D.pos = new Float32Array(D.pos); D.nor = new Float32Array(D.nor); D.uv = new Float32Array(D.uv); }
  bt.buckets = {}; bt.textured = []; bt.placements = []; bt.tris = 0;
  u.geo = geo; u.tris = tris|0; u.info = rec.info;
  MIX.msBuild += performance.now()-t0; MIX.built++; MIX.cached++;
}
function mixDrop(u){ u.geo = null; u.decals = null; MIX.cached--; }

/* ------------------------------------------------------------------ the shared meshes: one per family, rebuilt when the set changes */
function mixMesh(f){
  var M = MIX.meshes[f]; if(M) return M;
  var mat = f==='glow' ? (BRF_MAT.glow || new THREE.MeshBasicMaterial({ vertexColors:true }))
          : (MIX.litMat || (MIX.litMat = nlMaterial(new THREE.MeshLambertMaterial({ vertexColors:true }), 'furn-ixlit')));
  var g = new THREE.BufferGeometry(), mesh = new THREE.Mesh(g, mat);
  mesh.name = 'interiors:'+f; mesh.frustumCulled = false; mesh.castShadow = mesh.receiveShadow = !FAST;
  mesh.userData.interiors = true; mesh.userData.fam = 'Interiors'; mesh.visible = false;    /* until mixRebuild fills it */
  MIX.group.add(mesh);
  return (MIX.meshes[f] = { mesh:mesh, cap:0, n:0 });
}
function mixRebuild(){
  var tot = {}, f;
  MIX.active.forEach(function(u){ for(var k in u.geo) tot[k] = (tot[k]||0) + u.geo[k].pos.length; });
  for(f in MIX.meshes) if(!(f in tot)) tot[f] = 0;
  for(f in tot){
    var M = mixMesh(f), n = tot[f], g = M.mesh.geometry;
    if(n > M.cap){
      var cap = Math.max(Math.ceil(n*1.4/3)*3, 3*20000);
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cap), 3));
      g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(cap), 3));
      g.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(cap), 3, true));
      M.cap = cap;
    }
    if(n){
      var o = 0, P = g.attributes.position, N = g.attributes.normal, C = g.attributes.color;
      MIX.active.forEach(function(u){ var a = u.geo[f]; if(!a) return; P.array.set(a.pos, o); N.array.set(a.nor, o); C.array.set(a.col, o); o += a.pos.length; });
      [P, N, C].forEach(function(at){ at.updateRange.offset = 0; at.updateRange.count = n; at.needsUpdate = true; });
    }
    g.setDrawRange(0, n/3); M.n = n; M.mesh.visible = n > 0;
  }
  /* the painted panels: one mesh per design for the MIX_DECALS designs with the most panels among the active units;
     the rest share one mesh in their design's mean colour (a draw call each would cost ten or more in a busy hold) */
  MIX.group.children.filter(function(m){ return m.userData.decal; }).forEach(function(m){ MIX.group.remove(m); m.geometry.dispose(); });
  var dec = {};
  MIX.active.forEach(function(u){ for(var k in u.decals){ var D0 = dec[k] || (dec[k] = { mat:u.decals[k].mat, parts:[], n:0 }); D0.parts.push(u.decals[k]); D0.n += u.decals[k].pos.length; } });
  var keys = Object.keys(dec).sort(function(a,b){ return dec[b].n-dec[a].n; }), flat = [];
  keys.forEach(function(k, i){
    var D = dec[k], n = D.n, pos = new Float32Array(n), nor = new Float32Array(n), o = 0, ou = 0, textured = i < MIX_DECALS;
    var uv = textured ? new Float32Array(n/3*2) : null;
    D.parts.forEach(function(q){ pos.set(q.pos, o); nor.set(q.nor, o); if(uv) uv.set(q.uv, ou); o += q.pos.length; ou += q.uv.length; });
    if(!textured){ flat.push({ pos:pos, nor:nor, rgb:mixMapMean(D.mat) }); return; }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    mixDecalMesh(g, D.mat);
  });
  if(flat.length){
    var fn = flat.reduce(function(a,q){ return a + q.pos.length; }, 0), fp = new Float32Array(fn), fnr = new Float32Array(fn), fc = new Uint8Array(fn), fo = 0;
    flat.forEach(function(q){ fp.set(q.pos, fo); fnr.set(q.nor, fo); for(var i=0;i<q.pos.length;i+=3){ fc[fo+i]=q.rgb[0]; fc[fo+i+1]=q.rgb[1]; fc[fo+i+2]=q.rgb[2]; } fo += q.pos.length; });
    var fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.BufferAttribute(fp, 3)); fg.setAttribute('normal', new THREE.BufferAttribute(fnr, 3)); fg.setAttribute('color', new THREE.BufferAttribute(fc, 3, true));
    mixDecalMesh(fg, mixMesh('lit').mesh.material);
  }
  MIX.decalMeshes = Math.min(keys.length, MIX_DECALS) + (flat.length ? 1 : 0);
  MIX.dirty = false; MIX.lastRebuild = performance.now();
}
function mixDecalMesh(g, mat){
  var m = new THREE.Mesh(g, mat); m.name = 'interiors:decal'; m.frustumCulled = false; m.castShadow = m.receiveShadow = !FAST;
  m.userData.interiors = true; m.userData.decal = true; m.userData.fam = 'Interiors';
  MIX.group.add(m);
}
/* a painted design's mean colour (its canvas, sampled once) */
var MIX_MEAN = {};
function mixMapMean(mat){
  var map = mat.map, k = map ? map.uuid : mat.uuid;
  if(MIX_MEAN[k]) return MIX_MEAN[k];
  var c = map && map.image, rgb = [Math.round(mat.color.r*255), Math.round(mat.color.g*255), Math.round(mat.color.b*255)];
  if(c && c.getContext){ var d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, s = [0,0,0], n = 0;
    for(var i=0;i<d.length;i+=16){ s[0]+=d[i]; s[1]+=d[i+1]; s[2]+=d[i+2]; n++; }
    if(n) rgb = [Math.round(s[0]/n*mat.color.r), Math.round(s[1]/n*mat.color.g), Math.round(s[2]/n*mat.color.b)]; }
  return (MIX_MEAN[k] = rgb);
}

/* ------------------------------------------------------------------ which units are near */
function mixDist(u, p){ var dx=u.cx-p.x, dy=(u.cy-p.y)*1.6, dz=u.cz-p.z; return Math.sqrt(dx*dx+dy*dy+dz*dz); }
function mixScan(){
  var p = camera.position, cand = [];
  MIX.units.forEach(function(u){ var d = mixDist(u, p); u.d = d; if(d < MIX_ON || (u.on && d < MIX_OFF)) cand.push(u); });
  cand.sort(function(a,b){ return a.d-b.d; });
  var keep = [], tris = 0;
  for(var i=0;i<cand.length && keep.length<MIX_MAX;i++){ var u = cand[i], t = u.geo ? u.tris : 9000; if(tris+t > MIX_TRIS && keep.length) break; tris += t; keep.push(u); }
  var now = performance.now(), changed = false;
  MIX.active.forEach(function(u){ if(keep.indexOf(u)<0){ u.on = false; u.lastOn = now; changed = true; } });
  var act = [];
  MIX.queue = [];
  keep.forEach(function(u){ if(u.geo){ if(!u.on) changed = true; u.on = true; act.push(u); } else MIX.queue.push(u); });
  if(changed || act.length !== MIX.active.length) MIX.dirty = true;
  MIX.active = act; MIX.busy = MIX.queue.length > 0;
  /* the cache: drop the longest-gone units beyond MIX_CACHE */
  if(MIX.cached > MIX_CACHE){
    MIX.units.filter(function(u){ return u.geo && !u.on; }).sort(function(a,b){ return a.lastOn-b.lastOn; })
      .slice(0, MIX.cached-MIX_CACHE).forEach(mixDrop);
  }
  MIX.lastScan = now;
}
function mixTick(dt){
  if(!MIX.on) return;
  if(!MIX.group){ MIX.group = new THREE.Group(); MIX.group.name = 'interiors'; MIX.group.userData.inspectLabel = 'Interiors'; scene.add(MIX.group); }
  var t0 = performance.now();
  if(t0 - MIX.lastScan > 250) mixScan();
  var budget = clamp((dt||0.016)*1000*0.5, 10, 45);
  while(MIX.queue.length && (performance.now()-t0 < budget)){
    var u = MIX.queue.shift(); mixBuild(u); u.on = true; MIX.active.push(u); MIX.dirty = true;
  }
  if(MIX.dirty && (!MIX.queue.length || performance.now()-MIX.lastRebuild > 400)) mixRebuild();
  mixReport();
}
function mixReport(){
  var tris = 0, pieces = 0; MIX.active.forEach(function(u){ tris += u.tris; pieces += u.info ? u.info.pieces : 0; });
  window._interiors = { on:MIX.on, units:MIX.units.length, byKind:MIX.byKind, active:MIX.active.length, queued:MIX.queue.length, cached:MIX.cached,
    built:MIX.built, tris:tris, pieces:pieces, meshes:MIX.group ? MIX.group.children.filter(function(m){ return m.visible; }).length : 0, decalMeshes:MIX.decalMeshes||0,
    records:MIX.rec.filter(Boolean).length, fromBake:MIX.fromBake, computed:MIX.computed, bake:MIX.bakeState, baked:MIX.baked, stale:MIX.stale, kit:MIX.kitHash,
    lights:MIX.ixLights, lightsPending:MIX.ixPending.length, pool:MIX.pool.length, edits:MIX.edit.list(),
    msPlan:Math.round(MIX.msPlan), msFurnish:Math.round(MIX.msFurnish), msBuild:Math.round(MIX.msBuild), residenceFails:MIX.fails.length, dropped:MIX.dropped.length,
    near:MIX.active.slice(0,6).map(function(u){ return u.info ? u.info.label+': '+u.info.rooms.join(', ') : u.label; }),
    audit:mixAudit, view:mixView, buildNow:mixBuildNow, plan:mixPlanData, unit:function(i){ return MIX.units[i]; },
    record:MIX.record, slots:MIX.slots, edit:MIX.edit, bakeAll:MIX.bakeAll };
}

/* ------------------------------------------------------------------ the edits, kept in this browser (57a holds them as data) */
var EDIT_KEY = 'krator.mavs-refuge.interiors.edits';
try{ var _ed = JSON.parse(localStorage.getItem(EDIT_KEY) || 'null'); if(_ed && _ed.removed) MIX.edit['import'](_ed); }catch(e){}
MIX.onEditsSaved = function(E){ try{ localStorage.setItem(EDIT_KEY, JSON.stringify(E)); }catch(e){} };

/* ------------------------------------------------------------------ an edit: the unit's geometry is rebuilt */
MIX.onChange = function(i){
  var u = MIX.units[i]; if(!u) return;
  if(u.geo){ var was = u.on; if(was){ MIX.active = MIX.active.filter(function(q){ return q !== u; }); u.on = false; MIX.dirty = true; }
    mixDrop(u); MIX.lastScan = 0; }
};

/* ------------------------------------------------------------------ the nearest interior lights, per fragment */
var _lc = new THREE.Color();
function mixLights(dt, hour, nk){
  var U = NLV_U, cam = camera.position, cand = [], t = performance.now()/1000;
  MIX.active.forEach(function(u){
    var lit = nwLit(nwT(hour), u.sched || (u.sched = [0,0,0,0,0,0,0, phash(u.cx,u.cy,u.cz,1.7), phash(u.cx,u.cy,u.cz,5.3), phash(u.cx,u.cy,u.cz,11.9) < 0.05]));
    MIX.lightsNow(u.i).forEach(function(l){
      var k = l.hearth ? 0.35 + 0.65*nk : (lit ? nk : 0); if(k < 0.02) return;
      var d = Math.hypot(l.x-cam.x, (l.y-cam.y)*1.5, l.z-cam.z); if(d > 40) return;
      cand.push({ l:l, k:k, d:d });
    });
  });
  cand.sort(function(a,b){ return a.d-b.d; });
  MIX.pool = cand.slice(0, NL_POOL);
  MIX.pool.forEach(function(c, i){
    var l = c.l, ph = phash(l.x, l.y, l.z, 3.3)*6.283, fl = l.hearth ? 0.82 + 0.18*Math.sin(t*7.1+ph)*Math.sin(t*2.9+ph*1.7) : 1;
    var A = 0.5*Math.min(1.2, l.intensity||1)*c.k*fl;
    _lc.set(l.color==null ? (l.hearth ? 0xff9a50 : 0xffc878) : l.color).convertSRGBToLinear();
    U.uIxP.value[i].set(l.x, l.y, l.z, Math.min(l.distance||6, l.hearth ? 5.5 : 5.0));
    U.uIxC.value[i].set(_lc.r*A, _lc.g*A, _lc.b*A, 0);
    U.uIxF.value[i].set(l.floor, l.ceil);
  });
  U.uIxN.value = MIX.pool.length;
}
TICKS.push(function(dt, hour, nk){ if(MIX.on) mixLights(dt, hour, nk||0); });

/* ------------------------------------------------------------------ verification and views */
/* every step-th unit's record (from the bake or computed now): what a viewer would find inside, everywhere */
function mixAudit(step){
  step = step||1;
  var out = { checked:0, ms:0, byKind:{}, rooms:{}, dwellings:0, homesOk:0, residenceFails:[], dropped:[], missing:{}, fallbacks:0, noRooms:[],
              windows:0, fromBake:0, lights:0 }, t0 = performance.now();
  for(var i=0;i<MIX.units.length;i+=step){
    var u = MIX.units[i], r = MIX.record(i), B = r.B;
    out.checked++; out.byKind[u.kind] = (out.byKind[u.kind]||0)+1;
    B.rooms.forEach(function(R){ out.rooms[R.kind] = (out.rooms[R.kind]||0)+1; });
    if(!B.rooms.length) out.noRooms.push(u.id);
    if(u.usedFallback) out.fallbacks++;
    if(r.from==='bake') out.fromBake++;
    out.windows += r.info.windows; out.lights += r.lights.length;
    if(r.dropped.length) out.dropped.push(u.id+' '+r.dropped.join(','));
    r.missing.forEach(function(m){ out.missing[m] = (out.missing[m]||0)+1; });
    if(u.dwelling){ out.dwellings++; if(r.residence && r.residence.ok) out.homesOk++; else out.residenceFails.push(u.id+' '+JSON.stringify(r.residence)); }
  }
  out.ms = Math.round(performance.now()-t0);
  out.residenceFails = out.residenceFails.slice(0, 20); out.dropped = out.dropped.slice(0, 20);
  return out;
}
/* stand in a unit's doorway looking in, and build it (and its neighbours) at once */
function mixView(kind, n){
  var list = MIX.units.filter(function(u){ return u.kind===kind || u.lotKind===kind; }), u = list[Math.min(n||0, list.length-1)];
  if(!u) return null;
  /* just inside the street door, high, looking down the room to the corner of the plan farthest from the door */
  var d = u.shell.doors[0].at, ex = u.cx-d[0], ez = u.cz-d[1], L = Math.hypot(ex,ez)||1, far = d, fd = 0;
  u.shell.poly.forEach(function(p){ var q = Math.hypot(p[0]-d[0], p[1]-d[1]); if(q > fd){ fd = q; far = p; } });
  var eyeY = u.shell.y + Math.min(u.shell.levels[0].h-0.5, 2.9);
  if(u.kind==='workhome')      /* from the trade floor, looking at the family's door in the back wall */
    setView(d[0]-ex/L*4.5, u.shell.y+2.2, d[1]-ez/L*4.5, d[0]+ex/L*1.5, u.shell.y+1.1, d[1]+ez/L*1.5);
  else setView(d[0]+ex/L*0.45, eyeY, d[1]+ez/L*0.45, (far[0]+u.cx)/2, u.shell.y+0.5, (far[1]+u.cz)/2);
  mixBuildNow();
  return u.id;
}
/* a unit's plan as plain data (for a plan sheet or an export): rooms, walls, doors, stairs, pieces (after the edits), windows */
function mixPlanData(i){
  var u = MIX.units[i]; if(!u) return null;
  var r = MIX.record(i), B = r.B;
  return { id:u.id, kind:u.kind, lotKind:u.lotKind||null, label:u.label, plat:u.P.name, footprint:u.shell.poly, door:u.shell.doors[0].at,
    levels:B.levels.map(function(L){ return { k:L.k, y:L.y, h:L.h, inner:L.inner }; }),
    rooms:B.rooms.map(function(R){ return { id:R.id, kind:R.kind, level:R.level, poly:R.poly, windows:(R.windows||[]).map(function(w){ return { at:w.at, w:w.w }; }) }; }),
    walls:B.walls.map(function(W){ return { kind:W.kind, level:W.level, a:W.a, b:W.b, thick:W.thick, doors:(W.openings||[]).filter(function(o){ return o.door; }).map(function(o){ return [o.u, o.w]; }) }; }),
    stairs:B.stairs.map(function(S){ return { kind:S.kind, from:S.from, foot:S.foot, top:S.top, w:S.w }; }),
    pieces:MIX.piecesNow(i).map(function(q){ return { key:q.key, type:q.type, level:q.level, x:q.x, z:q.z, w:q.w, d:q.d, ry:q.ry, anchor:q.anchor }; }),
    lights:MIX.lightsNow(i).map(function(l){ return { x:l.x, z:l.z, hearth:l.hearth }; }),
    residence:r.residence, missing:r.missing, dropped:r.dropped, from:r.from };
}
function mixBuildNow(){ mixScan(); while(MIX.queue.length){ var u = MIX.queue.shift(); mixBuild(u); u.on = true; MIX.active.push(u); } MIX.busy = false; mixRebuild(); mixReport(); return window._interiors; }

window._mix = MIX;
mixReport();
TICKS.push(mixTick);
})();
