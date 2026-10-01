reseed(780001);
/* ============================== 78. LIFE ==============================
   The people of the Refuge: pedestrians over the whole walk graph, soldiers
   (sentries, patrols, the Rookery drill), fruit-gathering squads, the three
   beast-drawn lifts with their draught millipedes, ladder climbers and the
   ground yards.  Own meshes (5 draw calls), one TICKS entry.             */
(function(){
var LIFE_T0 = performance.now();
var nodes = NAV.nodes, edges = NAV.edges, NN = nodes.length, NE = edges.length;
var lifeBuilding = true;
function lrand(){ return lifeBuilding ? rnd() : Math.random(); }
function lrr(a,b){ return a + (b-a)*lrand(); }
function lpick(arr){ return arr[Math.min(arr.length-1, Math.floor(lrand()*arr.length))]; }

/* ------------------------------------------------------------------ graph tables */
var KIND = { deck:0, stair:1, bridge:2, spiral:3, ladder:4, ground:5 };
var KIND_NAME = ['deck','stair','bridge','spiral','ladder','ground'];
var COSTF = new Float32Array([1, 1.7, 1.25, 1.15, 6, 1]);
var SPDF  = new Float32Array([1, 0.6, 0.8, 0.9, 0.3, 0.9]);
var eKind = new Uint8Array(NE), eLen = new Float32Array(NE), eBad = new Uint8Array(NE), eHd = new Float32Array(NE);
var nMain = new Uint8Array(NN), nDoor = new Uint8Array(NN);
(function(){
  for(var i=0;i<NN;i++){ var P = nodes[i].plat>=0 ? PLATS[nodes[i].plat] : null; nMain[i] = (P && (P.main || P.kind==='council')) ? 1 : 0; if(nodes[i].tag==='door') nDoor[i]=1; }
  for(var e=0;e<NE;e++){
    var E = edges[e], a = nodes[E.a], b = nodes[E.b];
    eKind[e] = KIND[E.kind]||0; eLen[e] = Math.max(0.05, E.len);
    if(E.kind==='ladder'){ var Pl = PLATS[a.plat>=0?a.plat:b.plat]; eHd[e] = Math.atan2(Pl.x-a.x, Pl.z-a.z); }
    /* a ladder top that hangs clear of its landing stage: the link edge crosses thin air */
    var lt = a.tag==='laddertop' ? a : b.tag==='laddertop' ? b : null, ld = a.tag==='landing' ? a : b.tag==='landing' ? b : null;
    if(lt && ld){ var S = PLATS[ld.plat].spiral; if(Math.hypot(lt.x-ld.x, lt.z-ld.z) > S.landing.r + 0.5) eBad[e] = 1; }
  }
})();
var aS = new Int32Array(NN+1), aN, aE, aC;
(function(){
  var tot=0, i, j; for(i=0;i<NN;i++){ aS[i]=tot; tot+=NAV.adj[i].length; } aS[NN]=tot;
  aN = new Int32Array(tot); aE = new Int32Array(tot); aC = new Float32Array(tot);
  for(i=0;i<NN;i++) for(j=0;j<NAV.adj[i].length;j++){
    var eid = NAV.adj[i][j], E = edges[eid], q = aS[i]+j;
    aN[q] = E.a===i ? E.b : E.a; aE[q] = eid; aC[q] = eLen[eid]*COSTF[eKind[eid]]*(eBad[eid]?1000:1);
  }
})();

/* ------------------------------------------------------------------ A* (typed, lazy heap) */
var asG = new Float32Array(NN), asFrom = new Int32Array(NN), asFromE = new Int32Array(NN), asOpen = new Uint32Array(NN), asClosed = new Uint32Array(NN);
var asStamp = 0, hpN = new Int32Array(NN*6), hpK = new Float32Array(NN*6), hpLen = 0;
var LIFE_STAT = { pathfinds:0, pathMs:0, pfRate:0, tickMs:0, tickMax:0, buildMs:0 };
function hpPush(n,k){
  var i = hpLen++; if(i >= hpN.length) { hpLen--; return; }
  while(i>0){ var p=(i-1)>>1; if(hpK[p] <= k) break; hpN[i]=hpN[p]; hpK[i]=hpK[p]; i=p; }
  hpN[i]=n; hpK[i]=k;
}
function hpPop(){
  var top = hpN[0]; hpLen--;
  if(hpLen>0){
    var n=hpN[hpLen], k=hpK[hpLen], i=0;
    for(;;){ var c=2*i+1; if(c>=hpLen) break; if(c+1<hpLen && hpK[c+1]<hpK[c]) c++; if(hpK[c] >= k) break; hpN[i]=hpN[c]; hpK[i]=hpK[c]; i=c; }
    hpN[i]=n; hpK[i]=k;
  }
  return top;
}
/* dst >= 0: path to that node.  dst < 0: path to the nearest door node. */
function lifeAstar(src, dst){
  LIFE_STAT.pathfinds++;
  asStamp++; hpLen=0;
  var D = dst>=0 ? nodes[dst] : null, goal=-1;
  asG[src]=0; asOpen[src]=asStamp; asFrom[src]=-1; hpPush(src, 0);
  while(hpLen>0){
    var u = hpPop();
    if(asClosed[u]===asStamp) continue;
    asClosed[u]=asStamp;
    if(D ? u===dst : (nDoor[u] && u!==src)){ goal=u; break; }
    var gu = asG[u];
    for(var q=aS[u], q1=aS[u+1]; q<q1; q++){
      var v=aN[q]; if(asClosed[v]===asStamp) continue;
      var g = gu + aC[q];
      if(asOpen[v]!==asStamp || g < asG[v]){
        asG[v]=g; asOpen[v]=asStamp; asFrom[v]=u; asFromE[v]=aE[q];
        var h = 0; if(D){ var N=nodes[v], dx=N.x-D.x, dy=N.y-D.y, dz=N.z-D.z; h=Math.sqrt(dx*dx+dy*dy+dz*dz); }
        hpPush(v, g+h);
      }
    }
  }
  if(goal<0) return null;
  var n=0, c=goal; while(c!==src){ n++; c=asFrom[c]; }
  var pN = new Int32Array(n+1), pE = new Int32Array(n); c=goal;
  for(var i=n;i>0;i--){ pN[i]=c; pE[i-1]=asFromE[c]; c=asFrom[c]; }
  pN[0]=src;
  return { n:pN, e:pE };
}
function lifeReverse(p){
  var n=p.n.length, r={ n:new Int32Array(n), e:new Int32Array(n-1) }, i;
  for(i=0;i<n;i++) r.n[i]=p.n[n-1-i];
  for(i=0;i<n-1;i++) r.e[i]=p.e[n-2-i];
  return r;
}
function lifePathPts(p){            /* polyline of a path, bridges sampled along their sag */
  var out=[], i, s;
  for(i=0;i<p.e.length;i++){
    var A=nodes[p.n[i]], B=nodes[p.n[i+1]], E=edges[p.e[i]];
    if(E.kind==='bridge'){ var br=BRIDGES[E.bridge], fw = E.a===A.id;
      for(s=0;s<8;s++){ var t=s/8; out.push([mix(A.x,B.x,t), bridgeY(br, fw?t:1-t)+0.3, mix(A.z,B.z,t)]); } }
    else out.push([A.x,A.y+0.3,A.z]);
  }
  var L=nodes[p.n[p.n.length-1]]; out.push([L.x,L.y+0.3,L.z]);
  return out;
}

/* ------------------------------------------------------------------ figure geometry */
function lifeGeo(){
  var G = { pos:[], nor:[], uv:[], col:[], pro:[], idx:[] }, _c = new THREE.Color(), _m = new THREE.Matrix4(), _e = new THREE.Euler();
  var _v = new THREE.Vector3(), _n3 = new THREE.Matrix3();
  G.addGeo = function(g, cx,cy,cz, col, part, reg, opt, rot, topPart){
    _e.set(rot?rot[0]:0, rot?rot[1]:0, rot?rot[2]:0, 'YXZ'); _m.makeRotationFromEuler(_e); _m.setPosition(cx,cy,cz); _n3.getNormalMatrix(_m);
    var p=g.attributes.position, n=g.attributes.normal, u=g.attributes.uv, base=G.pos.length/3, i;
    _c.set(col); if(reg===3) _c.convertSRGBToLinear();
    for(i=0;i<p.count;i++){
      var ly = p.getY(i);
      _v.set(p.getX(i),ly,p.getZ(i)).applyMatrix4(_m); G.pos.push(_v.x,_v.y,_v.z);
      _v.set(n.getX(i),n.getY(i),n.getZ(i)).applyMatrix3(_n3).normalize(); G.nor.push(_v.x,_v.y,_v.z);
      G.uv.push(u?u.getX(i):0, u?u.getY(i):0); G.col.push(_c.r,_c.g,_c.b);
      G.pro.push((topPart && ly>0) ? topPart : part, reg, opt||0);
    }
    var ix=g.index; for(i=0;i<ix.count;i++) G.idx.push(base+ix.getX(i));
    g.dispose();
  };
  /* box by centre; reg: 0 garb 1 skin 2 hair 3 fixed colour.  For reg<3 `col` is a grey multiplier. */
  G.box = function(cx,cy,cz, w,h,d, col, part, reg, opt, rot, topPart){ G.addGeo(new THREE.BoxGeometry(w,h,d), cx,cy,cz, col, part, reg, opt, rot, topPart); };
  G.cone = function(cx,cy,cz, r,h, col, part, reg, opt){ G.addGeo(new THREE.ConeGeometry(r,h,6), cx,cy,cz, col, part, reg, opt); };
  G.build = function(){
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(G.pos,3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(G.nor,3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(G.uv,2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(G.col,3));
    g.setAttribute('aPRO', new THREE.Float32BufferAttribute(G.pro,3));
    g.setIndex(G.idx); g.computeBoundingSphere(); g.boundingSphere.radius += 3;
    return g;
  };
  return G;
}
var GREY1 = 0xffffff, GREY2 = 0xa8a8a8, GREY3 = 0xd0d0d0;
function lifeFigure(G, soldier){
  /* faces +z.  parts: 1 left leg, 2 right leg, 3 left arm, 4 right arm */
  G.box( 0.10,0.44,0, 0.17,0.88,0.20, soldier?PAL.uniform.brown:GREY2, 1, soldier?3:0);
  G.box(-0.10,0.44,0, 0.17,0.88,0.20, soldier?PAL.uniform.brown:GREY2, 2, soldier?3:0);
  G.box(0,1.17,0, 0.42,0.64,0.25, GREY1, 0, 0);
  G.box( 0.275,1.17,0, 0.12,0.62,0.14, GREY3, 3, 0);
  G.box(-0.275,1.17,0, 0.12,0.62,0.14, GREY3, 4, 0);
  G.box(0,1.615,0.005, 0.22,0.25,0.23, GREY1, 0, 1);
}
var LIFE_GEO = {};
(function(){
  var G = lifeGeo(); lifeFigure(G,false);
  G.box(0,1.70,-0.025, 0.25,0.15,0.25, GREY1, 0, 2);
  G.cone(0,1.83,0, 0.36,0.17, PAL.rope[0], 0, 3, 1);                 /* straw hat (flag 1) */
  LIFE_GEO.ped = G.build();
  G = lifeGeo(); lifeFigure(G,true);
  G.box(0,1.74,0, 0.29,0.13,0.30, PAL.uniform.brown, 0, 3);            /* leather helmet */
  G.box(0,1.83,0, 0.05,0.10,0.26, PAL.uniform.trim, 0, 3);             /* crest */
  G.box(0,1.47,0, 0.56,0.10,0.29, PAL.uniform.brown, 0, 3);            /* pauldrons */
  G.box(0,0.90,0, 0.44,0.09,0.27, PAL.uniform.trim, 0, 3);             /* belt */
  G.box(-0.36,1.25,0.10, 0.045,2.5,0.045, PAL.timber[3], 0, 3, 1);     /* spear (flag 1) */
  G.box(-0.36,2.58,0.10, 0.07,0.26,0.03, PAL.uniform.trim, 0, 3, 1);
  G.box(0,1.28,-0.17, 0.62,0.06,0.07, PAL.timber[2], 0, 3, 2, [0,0,0.5]);  /* crossbow on the back (flag 2) */
  G.box(0,1.22,-0.17, 0.07,0.62,0.07, PAL.timber[0], 0, 3, 2, [0,0,0.5]);
  LIFE_GEO.soldier = G.build();
  G = lifeGeo(); lifeFigure(G,false);
  G.box(0,1.70,-0.025, 0.25,0.15,0.25, GREY1, 0, 2);
  G.box(0,1.16,-0.31, 0.46,0.62,0.36, PAL.rope[1], 0, 3);              /* the basket */
  G.box(0,1.49,-0.31, 0.50,0.06,0.40, PAL.timber[3], 0, 3);
  G.box(-0.10,1.55,-0.26, 0.17,0.15,0.17, PAL.fruit[0], 0, 3, 1);      /* fruit (flag 1 = full) */
  G.box( 0.11,1.56,-0.33, 0.18,0.17,0.18, PAL.fruit[2], 0, 3, 1);
  G.box( 0.00,1.54,-0.42, 0.16,0.14,0.14, PAL.fruit[1], 0, 3, 1);
  G.box(-0.13,1.53,-0.40, 0.13,0.12,0.13, PAL.fruit[2], 0, 3, 1);
  LIFE_GEO.gath = G.build();
  /* lift cage: 3 x 3 x 2.6, local +x points away from the trunk; the rope's top vertices are part 5 */
  G = lifeGeo();
  G.box(0,0.06,0, 3.0,0.12,3.0, PAL.plank[1], 0, 3);
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c){ G.box(c[0]*1.43,1.3,c[1]*1.43, 0.14,2.6,0.14, PAL.timber[0], 0, 3); });
  [-1,1].forEach(function(s){
    G.box(0,2.6,s*1.43, 3.0,0.14,0.14, PAL.timber[1], 0, 3); G.box(s*1.43,2.6,0, 0.14,0.14,3.0, PAL.timber[1], 0, 3);
    G.box(0,1.0,s*1.43, 2.8,0.08,0.08, PAL.timber[3], 0, 3); G.box(0,0.5,s*1.43, 2.8,0.06,0.06, PAL.rope[0], 0, 3);
  });
  G.box(1.43,1.0,0, 0.08,0.08,2.8, PAL.timber[3], 0, 3);
  G.box(0,2.62,0, 0.16,0.16,4.0, PAL.timber[2], 0, 3, 0, [0,0.785,0]); G.box(0,2.62,0, 0.16,0.16,4.0, PAL.timber[2], 0, 3, 0, [0,-0.785,0]);
  G.box(0,3.2,0, 0.09,1.0,0.09, PAL.rope[0], 0, 3, 0, null, 5);
  LIFE_GEO.cage = G.build();
  /* one millipede segment, faces +z: body, tergite plate, a leg pair; flag 1 = head, flag 2 = saddle */
  G = lifeGeo();
  var MB = PAL.beast.millipede[0], MA = PAL.beast.millipede[1];
  G.box(0,0.62,0, 1.25,0.62,0.60, MB, 0, 3);
  G.box(0,0.97,0, 1.42,0.10,0.50, shade(MB,0.10), 0, 3);
  G.box(0,0.80,0.27, 1.34,0.30,0.06, MA, 0, 3);
  [-1,1].forEach(function(s){
    G.box(s*0.86,0.52,0, 0.55,0.11,0.12, MA, s<0?1:2, 3, 0, [0,0,-s*0.35]);
    G.box(s*1.12,0.22,0, 0.09,0.50,0.10, shade(MA,-0.25), s<0?1:2, 3);
    G.box(s*0.28,1.10,0.55, 0.05,0.05,1.1, MA, 0, 3, 1, [-0.5,s*0.35,0]);       /* antennae */
    G.box(s*0.30,0.45,0.42, 0.14,0.16,0.40, shade(MA,-0.15), 0, 3, 1, [0,-s*0.4,0]); /* mandibles */
  });
  G.box(0,1.10,0, 0.80,0.20,0.62, PAL.cloth ? PAL.cloth[0] : PAL.rope[0], 0, 3, 2);   /* saddle blanket */
  G.box(0,1.26,-0.22, 0.50,0.24,0.10, PAL.timber[2], 0, 3, 2);
  LIFE_GEO.seg = G.build();
})();

function lifeHook(legPiv, armPiv){
  return function(sh){
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aPRO;\nattribute vec4 aAnim;\nattribute vec3 aGarb;\nattribute vec3 aSkin;\nattribute vec3 aHair;')
      .replace('#include <color_vertex>', 'vColor = color;\nif(aPRO.y < 0.5) vColor *= aGarb; else if(aPRO.y < 1.5) vColor *= aSkin; else if(aPRO.y < 2.5) vColor *= aHair;')
      .replace('#include <beginnormal_vertex>', [
        'vec3 objectNormal = vec3(normal);',
        'float lfPart = aPRO.x, lfAng = 0.0, lfPy = 0.0;',
        'if(lfPart > 0.5 && lfPart < 4.5){',
        '  float lfSw = sin(aAnim.x) * aAnim.y;',
        '  if(lfPart < 2.5){ lfPy = ' + legPiv.toFixed(3) + '; lfAng = lfPart < 1.5 ? lfSw : -lfSw; }',
        '  else { lfPy = ' + armPiv.toFixed(3) + '; lfAng = (lfPart < 3.5 ? -lfSw : lfSw)*0.85 - aAnim.z; }',
        '  float lfC = cos(lfAng), lfS = sin(lfAng);',
        '  objectNormal = vec3(objectNormal.x, objectNormal.y*lfC - objectNormal.z*lfS, objectNormal.y*lfS + objectNormal.z*lfC);',
        '}'].join('\n'))
      .replace('#include <begin_vertex>', [
        'vec3 transformed = vec3(position);',
        'if(lfPart > 0.5 && lfPart < 4.5){',
        '  float lfC2 = cos(lfAng), lfS2 = sin(lfAng); vec3 lfQ = transformed - vec3(0.0, lfPy, 0.0);',
        '  transformed = vec3(lfQ.x, lfPy + lfQ.y*lfC2 - lfQ.z*lfS2, lfQ.y*lfS2 + lfQ.z*lfC2);',
        '}',
        'if(lfPart > 4.5) transformed.y = aAnim.x;',
        'if(aPRO.z > 0.5 && abs(aPRO.z - aAnim.w) > 0.25) transformed = vec3(0.0, 0.6, 0.0);'].join('\n'));
  };
}
function lifeMesh(geo, count, key, legPiv, armPiv){
  var mat = new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true });
  nlMaterial(mat, 'life'+key, lifeHook(legPiv, armPiv));
  var g = geo;
  var m = new THREE.InstancedMesh(g, mat, count);
  var A = { anim:new Float32Array(count*4), garb:new Float32Array(count*3), skin:new Float32Array(count*3), hair:new Float32Array(count*3) };
  for(var i=0;i<count*3;i++){ A.garb[i]=1; A.skin[i]=1; A.hair[i]=1; }
  m.userData.A = A;
  g.setAttribute('aAnim', A.animAttr = new THREE.InstancedBufferAttribute(A.anim,4));
  g.setAttribute('aGarb', new THREE.InstancedBufferAttribute(A.garb,3));
  g.setAttribute('aSkin', new THREE.InstancedBufferAttribute(A.skin,3));
  g.setAttribute('aHair', new THREE.InstancedBufferAttribute(A.hair,3));
  A.animAttr.setUsage(THREE.DynamicDrawUsage); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false; m.castShadow = !FAST; m.receiveShadow = false;
  m.userData.life = key;
  for(var k=0;k<count*16;k++) m.instanceMatrix.array[k]=0;
  for(var q=0;q<count;q++) m.instanceMatrix.array[q*16+15]=1;
  scene.add(m); return m;
}

/* ------------------------------------------------------------------ agents */
var R_PED=0, R_CLIMB=1, R_YARD=2, R_PASS=3, R_HANDLER=4, R_SENTRY=5, R_PATROL=6, R_DRILL=7, R_YARDSOL=8, R_GATH=9;
var ROLE_LABEL = ['Pedestrian','Ladder climber','Yard hand','Lift passenger','Millipede handler','Refuge soldier (sentry)',
                  'Refuge soldier (patrol)','Refuge soldier (at drill)','Refuge soldier (yard guard)','Fruit gatherer'];
var ST_INSIDE=0, ST_WAIT=1, ST_WALK=2, ST_STAND=3, ST_FREE=4, ST_EXT=5;
var AG = [], MESH_N = [0,0,0];
function lifeAgent(role, meshId){
  var a = { id:AG.length, role:role, mesh:meshId, idx:MESH_N[meshId]++, st:ST_INSIDE,
            bx:0, by:0, bz:0, x:0, y:0, z:0, px:0, py:0, pz:0, hd:lrr(0,TAU), hdT:0, turn:6,
            sc:0, scT:0, h:lrr(0.93,1.06), ph:lrr(0,TAU), ph0:lrr(0,TAU), amp:0, arm:0, armT:0, flag:0,
            spd:lrr(1.2,1.6), ox:0, oz:0, sox:0, soz:0, pN:null, pE:null, si:0, u:0, cur:0, dest:-1, home:0, homePlat:0,
            timer:0, delay:0, thr:0, curfew:0, over:0, tx:0, ty:0, tz:0, stage:0, squad:null, post:null, yard:null, ek:0, req:0, wantTo:-1 };
  AG.push(a); return a;
}

/* destination tables */
var LIFE_DEST = { plat:[], top:[], central:[], homes:[], ramps:[], nearSats:[], mains:[] };
(function(){
  var i;
  PLATS.forEach(function(P){ LIFE_DEST.plat[P.id]=[]; LIFE_DEST.top[P.id]=[]; });
  for(i=0;i<NN;i++){
    var N=nodes[i]; if(N.plat<0) continue;
    var P=PLATS[N.plat], Lv = N.lvl>=0 ? P.levels[N.lvl] : null;
    if(N.tag==='door'){ LIFE_DEST.plat[P.id].push(i); LIFE_DEST.homes.push(i); }
    else if(N.tag==='gallery' && Lv){
      if(!P.main){ if(Lv.kind==='apt'){ nDoor[i]=1; LIFE_DEST.plat[P.id].push(i); if(i%2===0) LIFE_DEST.homes.push(i); } else if(i%2===0) LIFE_DEST.plat[P.id].push(i); }
      else if(Lv.kind==='roost'||Lv.kind==='hangar'){ LIFE_DEST.plat[P.id].push(i); if(i%3===0) LIFE_DEST.homes.push(i); }
    }
    if(N.lvl===0 && (N.tag==='trunkpath'||N.tag==='promenade'||N.tag==='street'||N.tag==='satdeck')){
      LIFE_DEST.top[P.id].push(i); if(P===P_C) LIFE_DEST.central.push(i);
      if(!P.main && P.kind==='sat' && LIFE_DEST.plat[P.id].length===0) LIFE_DEST.plat[P.id].push(i);
    }
    if(N.tag==='landing' || (N.tag==='spiral' && SPIRALS[N.spiral].kind==='gate')) LIFE_DEST.ramps.push(i);
  }
  LIFE_DEST.lv = [];
  PLATS.forEach(function(P){
    var by = []; LIFE_DEST.plat[P.id].forEach(function(n){ var k=nodes[n].lvl; (by[k]||(by[k]=[])).push(n); });
    if(!by[0]) by[0] = LIFE_DEST.top[P.id];
    var lists = by.filter(function(l){ return l && l.length; }); if(by[0] && by[0].length) lists.push(by[0]);
    LIFE_DEST.lv[P.id] = lists;
  });
  PLATS.forEach(function(P){
    if(P.main || P.kind==='council') LIFE_DEST.mains.push(P.id);
    var s = SATS.slice().sort(function(a,b){ return Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z); }).filter(function(q){ return q!==P; });
    LIFE_DEST.nearSats[P.id] = s.slice(0,8).map(function(q){ return q.id; });
  });
})();
function lifeChooseDest(a){
  var cp = nodes[a.cur].plat; if(cp<0) cp = a.homePlat;
  for(var tries=0; tries<6; tries++){
    var r = lrand(), d=-1, L;
    if(r < 0.53){ if(lrand()<0.62) d = lpick(lpick(LIFE_DEST.lv[cp])); else d = a.home; }
    else if(r < 0.73) d = lpick(LIFE_DEST.central);
    else if(r < 0.86){ var pid = lpick(LIFE_DEST.mains); d = lrand()<0.4 ? lpick(LIFE_DEST.top[pid]) : lpick(lpick(LIFE_DEST.lv[pid])); }
    else if(r < 0.96){ var sid = lpick(LIFE_DEST.nearSats[cp]); d = lrand()<0.5 ? lpick(LIFE_DEST.top[sid]) : lpick(lpick(LIFE_DEST.lv[sid])); }
    else if(r < 0.98) d = lpick(LIFE_DEST.ramps);
    else d = lpick(LIFE_DEST.plat[P_CC.id].concat(LIFE_DEST.top[P_CC.id]));
    if(d>=0 && d!==a.cur) return d;
  }
  return a.home!==a.cur ? a.home : lpick(LIFE_DEST.central);
}

/* day/night: the share of the population allowed out of doors */
var LIFE_ACTIVE = 1;
function lifeActiveAt(h){
  if(h>=7 && h<19) return 1;
  if(h>=19 && h<23) return mix(1,0.25,(h-19)/4);
  if(h>=23) return mix(0.25,0.08,(h-23)/2);
  if(h<1) return mix(0.25,0.08,(h+1)/2);
  if(h<5) return 0.08;
  return mix(0.08,1,(h-5)/2);
}

/* path requests: amortised, a few per frame */
var LIFE_Q = [], visits = new Uint32Array(PLATS.length*16+16);
function lifeRequest(a, to){ a.st=ST_WAIT; a.pN=null; a.req=1; a.wantTo=to; a.delay=0; LIFE_Q.push(a); }
function lifeSetPath(a, p, delay){ a.pN=p.n; a.pE=p.e; a.si=0; a.u=0; a.cur=p.n[0]; a.dest=p.n[p.n.length-1]; a.delay=delay||0; a.st=ST_WAIT; a.req=0; }
function lifeServe(budgetMs){
  var t0 = performance.now(), n=0;
  while(LIFE_Q.length && n<4){
    var a = LIFE_Q.shift(); if(!a.req) continue;
    var p = lifeAstar(a.cur, a.wantTo); n++;
    if(!p || p.e.length===0){ a.req=0; a.st=ST_STAND; a.timer=2; continue; }
    lifeSetPath(a, p, 0);
    if(performance.now()-t0 > budgetMs) break;
  }
  LIFE_STAT.pathMs += performance.now()-t0;
}
function lifePlaceAtNode(a, n){ var N=nodes[n]; a.cur=n; a.bx=N.x; a.by=N.y; a.bz=N.z; }
function lifeSnap(a){ a.x=a.px=a.bx+a.ox; a.y=a.py=a.by; a.z=a.pz=a.bz+a.oz; }

/* ------------------------------------------------------------------ populations */
var N_PED = 700;
var peds=[], climbers=[], yardFolk=[], passengers=[], handlers=[], sentries=[], patrolMen=[], drillMen=[], yardSol=[], gatherers=[];
var lifeGarbLin = PAL.people.garb.map(function(c){ return new THREE.Color(c).convertSRGBToLinear(); });
var lifeSkinLin = PAL.people.skin.map(function(c){ return new THREE.Color(c).convertSRGBToLinear(); });
var lifeHairLin = PAL.people.hair.map(function(c){ return new THREE.Color(c).convertSRGBToLinear(); });
var lifeGreenLin = new THREE.Color(PAL.uniform.green).convertSRGBToLinear();

(function(){
  var i, thr = [];
  for(i=0;i<N_PED;i++) thr.push((i+0.5)/N_PED);
  shuffle(thr);
  for(i=0;i<N_PED;i++){
    var a = lifeAgent(R_PED,0); a.thr = thr[i]; a.home = pick(LIFE_DEST.homes); a.homePlat = nodes[a.home].plat; a.flag = chance(0.28)?1:0;
    peds.push(a);
  }
})();

/* ---- sentry posts ---- */
var POSTS = [];
function lifeNearestNode(x,y,z,pid){
  var best=-1, bd=1e9;
  for(var i=0;i<NN;i++){ var N=nodes[i]; if(N.plat!==pid || Math.abs(N.y-y)>1.2 || N.tag==='door') continue; var d=(N.x-x)*(N.x-x)+(N.z-z)*(N.z-z); if(d<bd){bd=d;best=i;} }
  return best;
}
function lifePost(group, x,y,z, fx,fz, pid, label){
  var p = { id:POSTS.length, group:group, x:x, y:y, z:z, hd:Math.atan2(fx,fz), node:lifeNearestNode(x,y,z,pid), label:label, by:null };
  POSTS.push(p); return p;
}
(function(){
  SPIRALS.forEach(function(S){
    if(S.kind!=='gate') return;
    var P=S.plat, T=S.tree, g='gate'+P.id, kLow=P.levels.length-1;
    function rampPost(t, off, faceOut){
      var nd = S.nodes[Math.round(t*(S.nodes.length-1))], h = helixPoint(S, nd.t), c=Math.cos(h.a), s=Math.sin(h.a);
      lifePost(g, h.x+c*off, h.y, h.z+s*off, faceOut?c:Math.cos(S.a0), faceOut?s:Math.sin(S.a0), P.id, 'ramp');
    }
    rampPost(0,-2.1,false); rampPost(0,1.9,false);
    rampPost(0.34,1.9,true); rampPost(0.67,1.9,true);
    var Ld=S.landing, ox=Math.cos(Ld.a), oz=Math.sin(Ld.a);
    [-1,1].forEach(function(sg){ lifePost(g, Ld.x+ox*4.6-oz*4.4*sg, Ld.y, Ld.z+oz*4.6+ox*4.4*sg, ox,oz, P.id, 'landing'); });
    /* the tunnelled passage: flank lane B of bay 0 on the lowest level */
    var st = stairOf(P, P.bays[0], kLow-1), rc = st.rBot+1.6;
    [-1,1].forEach(function(sg){ var aa=st.angB+sg*1.3/rc, p=platXZ(P,rc,aa), o=platOutDir(P,aa); lifePost(g, p[0],P.levels[kLow].y,p[1], o[0],o[1], P.id, 'passage'); });
    /* pairs at the other corridor mouths of the lowest level */
    var Lv=P.levels[kLow], rw=Lv.Rout-Lv.gw+0.55;
    [1,2].forEach(function(bi){ var s2=stairOf(P,P.bays[bi],kLow-1);
      [-1,1].forEach(function(sg){ var aa=s2.angB+sg*2.3/rw, p=platXZ(P,rw,aa), o=platOutDir(P,aa); lifePost(g, p[0],Lv.y,p[1], o[0],o[1], P.id, 'gallery'); }); });
  });
  P_CC.hall.doors.forEach(function(ha,i){ var r=P_CC.hall.r1+0.7, aa=ha+(i%2?1:-1)*1.5/r, p=platXZ(P_CC,r,aa), o=platOutDir(P_CC,aa); lifePost('council', p[0],P_CC.y,p[1], o[0],o[1], P_CC.id, 'council'); });
  P_C.heads.forEach(function(h){ var r=P_C.R-1.3;
    [-1,1].forEach(function(sg){ var aa=h.ang+sg*(h.w*0.5+0.75)/r, p=platXZ(P_C,r,aa), o=platOutDir(P_C,aa); lifePost('crown', p[0],P_C.y,p[1], o[0],o[1], P_C.id, 'bridgehead'); }); });
  POSTS.forEach(function(p){
    var a = lifeAgent(R_SENTRY,1); a.post=p; p.by=a; a.flag=1; a.spd=1.3; a.timer=rr(60,300);
    a.bx=p.x; a.by=p.y; a.bz=p.z; a.hd=p.hd; a.st=ST_STAND; a.sc=a.scT=1; a.cur=p.node; lifeSnap(a); sentries.push(a);
  });
})();

/* ---- squads (patrols + gatherers): cached legs, members trail the leader by a start delay ---- */
var SQUADS = [];
function lifeRingNode(P, lvl, ang){ var R = P.nav.rings[lvl]; return ringNearest(R.outer, ang).id; }
function lifeLegs(wps){
  var legs=[]; for(var i=0;i<wps.length;i++){ var p = lifeAstar(wps[i], wps[(i+1)%wps.length]); if(p && p.e.length) legs.push(p); }
  return legs;
}
(function(){
  /* deck + gallery loops */
  var loops = [[P_C,0.3],[P_C,3.4],[P_RK,1.0],[P_R1,2.0],[P_R3,4.0],[P_R5,0.5],[P_SP,2.5]];
  loops.forEach(function(L){
    var P=L[0], B=P.bays[ri(0,2)], a0=B.ang + L[1]*0.2, k = Math.min(P.levels.length-1, ri(1,2));
    var wps = [ lifeRingNode(P,0,a0+0.4), lifeRingNode(P,0,a0+2.2), lifeRingNode(P,0,a0+4.1), lifeRingNode(P,k,a0+4.4), lifeRingNode(P,k,a0+2.4), lifeRingNode(P,k,a0+0.6) ];
    SQUADS.push({ kind:'patrol', legs:lifeLegs(wps), li:0, members:[], timer:0, state:0, label:P.name });
  });
  SPIRALS.forEach(function(S){ if(S.kind!=='gate') return; var P=S.plat;
    var wps = [ S.landing.node.id, S.nodes[S.nodes.length-1].id, lifeRingNode(P,0,P.bays[0].ang+1.0), lifeRingNode(P,0,P.bays[0].ang+3.0), S.nodes[S.nodes.length-1].id ];
    SQUADS.push({ kind:'patrol', legs:lifeLegs(wps), li:0, members:[], timer:0, state:0, label:P.name+' ramp' });
  });
  SQUADS.forEach(function(Q){
    var spd = rr(1.25,1.4), start = ri(0, Q.legs.length-1); Q.li = start;
    for(var m=0;m<3;m++){ var a=lifeAgent(R_PATROL,1); a.squad=Q; a.spd=spd; a.flag = m===0?1:(chance(0.5)?2:1); a.sc=a.scT=1; Q.members.push(a); patrolMen.push(a); }
  });
  /* gatherers */
  var stores = []; P_C.rooms.forEach(function(R){ if(R.kind==='store' && R.door) stores.push(R.door.id); });
  PLATS.forEach(function(P){ P.slots.forEach(function(S){ if(S.kind==='store' && S.doorOut) stores.push(S.doorOut.id); }); });
  var market = LIFE_DEST.central;
  for(var g=0; g<8; g++){
    var home = (g%4===3) ? pick(market) : pick(stores), HP = nodes[home], cand = SATS.filter(function(S){ var d=Math.hypot(S.x-HP.x,S.z-HP.z); return d>60 && d<420; });
    if(!cand.length) cand = SATS;
    var routes=[];
    for(var r=0;r<2;r++){ var S = pick(cand), ring = S.nav.rings[0].inner, nd = pick(ring), out = lifeAstar(home, nd.id); if(out) routes.push({ sat:S, node:nd, out:out, back:lifeReverse(out) }); }
    var Q = { kind:'gath', routes:routes, ri:0, members:[], timer:rr(0,20), state:0, home:home, label:'gatherers '+(g+1) }, n = ri(3,4), spd=rr(1.2,1.35);
    for(var m=0;m<n;m++){ var a=lifeAgent(R_GATH,2); a.squad=Q; a.spd=spd; a.member=m; lifePlaceAtNode(a,home); lifeSnap(a); Q.members.push(a); gatherers.push(a); }
    SQUADS.push(Q);
  }
})();

/* ---- the Rookery drill ---- */
var DRILL = [];
(function(){
  var P=P_RK, best=[], a;
  var spokes = P.heads.map(function(h){ return h.ang; }).concat(P.bays.map(function(b){ return b.ang; }));
  var cands=[]; for(var k=0;k<72;k++){ a=k/72*TAU; var sc=1e9; spokes.forEach(function(s){ sc=Math.min(sc,angDist(s,a)); }); cands.push([sc,a]); }
  cands.sort(function(x,y){ return y[0]-x[0]; });
  cands.forEach(function(c){ if(best.length<2 && best.every(function(b){ return angDist(b,c[1])>0.9; })) best.push(c[1]); });
  var r0 = mix(P.rt+6, P.R-P.levels[0].gw-17, 0.55);
  best.forEach(function(ang, bi){
    var c=platXZ(P,r0,ang), o=platOutDir(P,ang), B={ cx:c[0], cz:c[1], tx:-o[1], tz:o[0], ox:o[0], oz:o[1], s:0, dir:1, half:Math.min(8, r0*0.16), state:0, timer:rr(0,3), members:[], on:0, laps:0 };
    for(var row=0;row<4;row++) for(var col=0;col<3;col++){
      var m=lifeAgent(R_DRILL,1); m.flag=1; m.st=ST_EXT; m.fx=(row-1.5)*1.5; m.fz=(col-1)*1.5; m.turn=5; m.h=1.0; B.members.push(m); drillMen.push(m);
    }
    DRILL.push(B);
  });
})();

/* ---- lifts, millipedes, yards, climbers ---- */
var LIFTSIM = [], SEG_N = 13, SEG_D = 0.56, TR_N = 128, TR_DS = 0.1;
(function(){
  LIFTS.forEach(function(Lf, li){
    var T = Lf.plat.tree, C = Lf.capstan || { x:Lf.x+Math.cos(Lf.a)*9, z:Lf.z+Math.sin(Lf.a)*9, y:Lf.y0, r:5 };
    var L = { lf:Lf, cap:C, y:Lf.y0, p:0, state:0, timer:rr(5,25), moving:0, vel:0, pass:[], tree:T,
              hx:0, hz:0, hh:0, dir:1, acc:0, trX:new Float32Array(TR_N), trZ:new Float32Array(TR_N), trHead:0, walked:0, beastMoving:0,
              segX:new Float32Array(SEG_N), segZ:new Float32Array(SEG_N), segY:new Float32Array(SEG_N), segH:new Float32Array(SEG_N), dirty:1 };
    var th0 = rr(0,TAU);
    L.hx = C.x+Math.cos(th0)*C.r; L.hz = C.z+Math.sin(th0)*C.r; L.hh = th0+Math.PI/2;
    for(var j=0;j<TR_N;j++){ var th = th0 - (j*TR_DS)/C.r; L.trX[j]=C.x+Math.cos(th)*C.r; L.trZ[j]=C.z+Math.sin(th)*C.r; }
    for(var k=0;k<3;k++){ var pa=lifeAgent(R_PASS,0); pa.st=ST_EXT; pa.lift=L; pa.cx=[-0.7,0.6,0.1][k]; pa.cz=[-0.5,-0.3,0.8][k]; pa.hd=-Lf.a+Math.PI/2+rr(-0.6,0.6); pa.scT = k<ri(1,3)?1:0; L.pass.push(pa); passengers.push(pa); }
    var hn=lifeAgent(R_HANDLER,0); hn.st=ST_EXT; hn.lift=L; hn.sc=hn.scT=1; hn.flag=1; L.handler=hn; handlers.push(hn);
    /* yard folk */
    var nf = ri(3,5), ns = ri(1,2);
    for(var f=0; f<nf+ns; f++){ var y=lifeAgent(f<nf?R_YARD:R_YARDSOL, f<nf?0:1); y.lift=L; y.flag = f<nf ? (chance(0.4)?1:0) : 1; y.st=ST_STAND; y.timer=rr(1,20); y.sc=y.scT=1;
      var p = lifeYardPoint(L, null); y.bx=p[0]; y.bz=p[1]; y.by=terrainH(p[0],p[1]); lifeSnap(y); (f<nf?yardFolk:yardSol).push(y); }
    LIFTSIM.push(L);
  });
  LADDERS.forEach(function(Ld){
    var e = null; NAV.adj[Ld.ground.id].forEach(function(eid){ if(edges[eid].kind==='ladder') e=eid; });
    if(e===null) return;
    var E=edges[e], top = E.a===Ld.ground.id ? E.b : E.a, link=null; NAV.adj[top].forEach(function(eid){ if(eid!==e) link=eid; });
    var c = lifeAgent(R_CLIMB,0); c.ladder={ g:Ld.ground.id, top:top, e:e, open: link!==null && !eBad[link], plat:Ld.plat };
    c.homePlat = Ld.plat.id; c.home = LIFE_DEST.plat[Ld.plat.id].length ? pick(LIFE_DEST.plat[Ld.plat.id]) : top;
    c.spd = rr(1.2,1.4); lifePlaceAtNode(c, Ld.ground.id); c.st=ST_STAND; c.timer=rr(2,40); c.sc=c.scT=1; c.sox=rr(-0.8,0.8); c.soz=rr(-0.8,0.8); lifeSnap(c); climbers.push(c);
  });
})();
function lifeYardPoint(L, from){
  var Lf=L.lf, C=L.cap, T=L.tree;
  for(var t=0;t<30;t++){
    var a=lrr(0,TAU), r=Math.sqrt(lrand())*12, x=Lf.x+Math.cos(a)*r, z=Lf.z+Math.sin(a)*r;
    if(Math.hypot(x-C.x,z-C.z) < C.r+2.6) continue;
    if(Math.abs(x-Lf.x)<2.8 && Math.abs(z-Lf.z)<2.8) continue;
    if(Math.hypot(x-T.x,z-T.z) < trunkR(T, terrainH(x,z)+1) + 2.0) continue;
    if(from && (segDist(C.x,C.z, from[0],from[1], x,z) < C.r+2.2 || segDist(Lf.x,Lf.z, from[0],from[1], x,z) < 3.2)) continue;
    return [x,z];
  }
  return from ? [from[0],from[1]] : [Lf.x-Math.cos(Lf.a)*5, Lf.z-Math.sin(Lf.a)*5];
}

/* ------------------------------------------------------------------ meshes */
var M_PED = lifeMesh(LIFE_GEO.ped, MESH_N[0], 'Ped', 0.9, 1.45);
var M_SOL = lifeMesh(LIFE_GEO.soldier, MESH_N[1], 'Sol', 0.9, 1.45);
var M_GATH = lifeMesh(LIFE_GEO.gath, MESH_N[2], 'Gath', 0.9, 1.45);
var M_CAGE = lifeMesh(LIFE_GEO.cage, LIFTSIM.length, 'Cage', 0.9, 1.45);
var M_SEG = lifeMesh(LIFE_GEO.seg, LIFTSIM.length*SEG_N, 'Seg', 0.55, 0.55);
var MESHES = [M_PED, M_SOL, M_GATH];
var byMesh = [[],[],[]];
AG.forEach(function(a){
  byMesh[a.mesh][a.idx]=a;
  var A = MESHES[a.mesh].userData.A, g, s = pick(lifeSkinLin), h = pick(lifeHairLin), k=a.idx*3;
  if(a.mesh===1){ var f=rr(0.88,1.1); A.garb[k]=lifeGreenLin.r*f; A.garb[k+1]=lifeGreenLin.g*f; A.garb[k+2]=lifeGreenLin.b*f; }
  else { g = pick(lifeGarbLin); var f2=rr(0.85,1.1); A.garb[k]=g.r*f2; A.garb[k+1]=g.g*f2; A.garb[k+2]=g.b*f2; }
  A.skin[k]=s.r; A.skin[k+1]=s.g; A.skin[k+2]=s.b; A.hair[k]=h.r; A.hair[k+1]=h.g; A.hair[k+2]=h.b;
});
M_PED.userData.inspectFn = function(i){ var a=byMesh[0][i]; return a ? ROLE_LABEL[a.role] : 'Pedestrian'; };
M_SOL.userData.inspectFn = function(i){ var a=byMesh[1][i]; return a ? ROLE_LABEL[a.role] : 'Refuge soldier'; };
M_GATH.userData.inspectFn = function(i){ var a=byMesh[2][i]; return a && a.flag ? 'Fruit gatherer (basket full)' : 'Fruit gatherer'; };
M_CAGE.userData.inspectFn = function(i){ return 'Lift cage ('+LIFTSIM[i].lf.plat.name+')'; };
M_SEG.userData.inspectFn = function(){ return 'Draught millipede'; };
(function(){
  var A=M_SEG.userData.A;
  for(var i=0;i<LIFTSIM.length*SEG_N;i++){ var k=i%SEG_N; A.anim[i*4+3] = k===0?1:(k===3?2:0); }
})();

/* ------------------------------------------------------------------ behaviour */
function lifeStandAt(a, tmin, tmax){
  a.st=ST_STAND; a.timer=lrr(tmin,tmax);
  var m = nMain[a.cur] ? 0.9 : 0.45, k = nodes[a.cur].tag;
  if(k==='spiral'||k==='stairtop'||k==='stairfoot'||k==='bridgehead') m=0.3;
  a.sox=lrr(-m,m); a.soz=lrr(-m,m); a.hdT=lrr(0,TAU);
}
function lifeArrive(a){
  a.pN=null; a.curfew=0;
  if(a.role===R_PED){
    if(nDoor[a.cur]){ a.st=ST_INSIDE; a.scT=0; a.timer=lrr(5,40); }
    else lifeStandAt(a,5,40);
  }else if(a.role===R_SENTRY){
    a.st=ST_FREE; a.stage=2; a.tx=a.post.x; a.ty=a.post.y; a.tz=a.post.z;
  }else if(a.role===R_CLIMB){
    var Ld=a.ladder;
    if(a.cur===Ld.top && !Ld.open){ a.st=ST_INSIDE; a.scT=0; a.timer=lrr(8,30); }
    else if(nDoor[a.cur]){ a.st=ST_INSIDE; a.scT=0; a.timer=lrr(8,30); }
    else lifeStandAt(a,8,35);
  }else{ a.st=ST_STAND; a.timer=0; a.stage=1; a.sox=0; a.soz=0; }       /* squad member: the squad decides */
}
function lifeNext(a){
  if(a.role===R_PED){
    if(a.thr >= LIFE_ACTIVE){
      if(nDoor[a.cur] && a.st===ST_INSIDE){ a.timer=lrr(3,8); return; }
      a.curfew=1; lifeRequest(a, nDoor[a.cur] ? a.home : -1); return;
    }
    lifeRequest(a, lifeChooseDest(a));
  }else if(a.role===R_CLIMB){
    var Ld=a.ladder, to;
    if(a.cur===Ld.g) to = (Ld.open && lrand()<0.35) ? a.home : Ld.top;
    else to = Ld.g;
    lifeRequest(a, to);
  }
}
function lifeWalk(a, dt, time){
  var rem = a.spd*dt, pE=a.pE, e, k, L;
  for(;;){
    if(a.si >= pE.length){ lifePlaceAtNode(a, a.pN[pE.length]); lifeArrive(a); return; }
    e=pE[a.si]; k=eKind[e]; L=eLen[e];
    a.u += rem*SPDF[k];
    if(a.u < L) break;
    rem = (a.u-L)/SPDF[k]; a.u=0; a.si++; a.cur=a.pN[a.si];
    var Nv=nodes[a.cur]; if(Nv.plat>=0 && Nv.lvl>=0) visits[Nv.plat*16+Nv.lvl]++;
    if(a.role===R_PED && !a.curfew && a.thr >= LIFE_ACTIVE && a.si < pE.length){
      lifePlaceAtNode(a,a.cur); a.curfew=1; lifeRequest(a,-1); a.curfew=1; return;
    }
  }
  var A=nodes[a.pN[a.si]], B=nodes[a.pN[a.si+1]], t=a.u/L, dx=B.x-A.x, dz=B.z-A.z, hl=Math.sqrt(dx*dx+dz*dz);
  a.bx=A.x+dx*t; a.bz=A.z+dz*t; a.ek=k;
  if(k===2){ var E=edges[e]; a.by = bridgeY(BRIDGES[E.bridge], E.a===A.id ? t : 1-t) + Math.sin(time*2.3+a.ph0)*0.02*Math.sin(Math.PI*t); }
  else if(k===5) a.by = terrainH(a.bx,a.bz);
  else a.by = A.y+(B.y-A.y)*t;
  var lane = k===4 ? 0 : k===2 ? 0.4 : k===3 ? 0.6 : (nMain[A.id] ? 0.5 : 0.3);
  if(hl>0.05){ a.sox=-dz/hl*lane; a.soz=dx/hl*lane; a.hdT=Math.atan2(dx,dz); }
  else { a.sox=0; a.soz=0; a.hdT=eHd[e]; }
  a.armT = k===4 ? 1.7 : 0;
}
function lifeFree(a, dt){
  var dx=a.tx-a.bx, dy=a.ty-a.by, dz=a.tz-a.bz, d=Math.sqrt(dx*dx+dz*dz), step=a.spd*0.85*dt;
  a.sox=0; a.soz=0;
  if(d <= step){ a.bx=a.tx; a.by=a.ty; a.bz=a.tz; return true; }
  a.bx+=dx/d*step; a.bz+=dz/d*step; a.by+=dy*(step/d); a.hdT=Math.atan2(dx,dz);
  return false;
}

function lifeSquadTick(Q, dt, hour){
  var M=Q.members, i, a, all=true;
  if(Q.kind==='patrol'){
    for(i=0;i<M.length;i++) if(M[i].st!==ST_STAND) all=false;
    if(!all) return;
    Q.timer-=dt; if(Q.timer>0) return;
    Q.li=(Q.li+1)%Q.legs.length; Q.timer=lrr(2,6);
    for(i=0;i<M.length;i++){ lifeSetPath(M[i], Q.legs[Q.li], i*1.0); }
    return;
  }
  /* gatherers: 0 home, 1 walking out, 2 to the picking spots, 3 picking, 4 regroup, 5 walking back */
  var day = hour>5.5 && hour<19.5, R=Q.routes[Q.ri];
  if(!R) return;
  if(Q.state===0){
    Q.timer-=dt; if(Q.timer>0 || !day) return;
    Q.ri = Math.floor(lrand()*Q.routes.length); R=Q.routes[Q.ri];
    for(i=0;i<M.length;i++){ a=M[i]; a.flag=0; a.scT=1; lifeSetPath(a, R.out, i*1.1); }
    Q.state=1; return;
  }
  for(i=0;i<M.length;i++){ a=M[i]; if(a.st!==ST_STAND) all=false; }
  if(!all) return;
  if(Q.state===1){
    var ring=R.sat.nav.rings[0].inner, n0=ring.indexOf(R.node);
    for(i=0;i<M.length;i++){ a=M[i]; var nd=ring[(n0+ring.length+i-1)%ring.length]; if(nd.tag!=='satdeck') nd=R.node;
      var P=R.sat, ux=nd.x-P.x, uz=nd.z-P.z, ul=Math.hypot(ux,uz)||1;
      a.st=ST_FREE; a.stage=3; a.tx=nd.x+ux/ul*0.8+(i-1.5)*0.2; a.ty=nd.y; a.tz=nd.z+uz/ul*0.8; a.outHd=Math.atan2(ux,uz); }
    Q.state=2;
  }else if(Q.state===2){
    for(i=0;i<M.length;i++){ a=M[i]; a.armT=2.6+0.3*Math.sin(i*2.1); a.hdT=a.outHd; }
    Q.timer=lrr(20,40); Q.state=3;
  }else if(Q.state===3){
    Q.timer-=dt;
    for(i=0;i<M.length;i++){ a=M[i]; a.armT = 2.5+0.35*Math.sin(Q.timer*1.7+i*2.1); }
    if(Q.timer>0) return;
    for(i=0;i<M.length;i++){ a=M[i]; a.armT=0; a.flag=1; a.st=ST_FREE; a.stage=3; a.tx=R.node.x; a.ty=R.node.y; a.tz=R.node.z; a.spd=Math.abs(a.spd); }
    Q.state=4;
  }else if(Q.state===4){
    for(i=0;i<M.length;i++) lifeSetPath(M[i], R.back, i*1.1);
    Q.state=5;
  }else if(Q.state===5){
    var door = nDoor[Q.home];
    for(i=0;i<M.length;i++){ a=M[i]; if(door || !day) a.scT=0; else { a.sox=(i-1.5)*0.7; a.soz=0.4*(i%2); } }
    Q.timer=lrr(8,20); Q.state=6;
  }else if(Q.state===6){
    Q.timer-=dt; if(Q.timer>0) return;
    for(i=0;i<M.length;i++){ a=M[i]; a.flag=0; if(!day) a.scT=0; }
    Q.state=0; Q.timer=lrr(2,10);
  }
}

function lifeDrillTick(B, dt, hour){
  var on = (hour>=8 && hour<11) || (hour>=15 && hour<17), M=B.members, i;
  B.on = on?1:0;
  if(on){
    if(B.state===0){ B.timer-=dt; if(B.timer<=0){ B.state=1; } }
    else{
      B.s += B.dir*1.25*dt;
      if(Math.abs(B.s) >= B.half){ B.s=B.dir*B.half; B.dir=-B.dir; B.state=0; B.laps++; B.timer = (B.laps%3===0) ? 9 : 2.5; }
    }
  }
  var hd = Math.atan2(B.tx*B.dir, B.tz*B.dir);
  for(i=0;i<M.length;i++){
    var m=M[i]; m.scT = on?1:0;
    m.bx = B.cx + B.tx*(B.s+m.fx) + B.ox*m.fz; m.bz = B.cz + B.tz*(B.s+m.fx) + B.oz*m.fz; m.by = P_RK.y; m.hdT = hd;
  }
}

function lifeLiftTick(L, dt, camx, camy, camz){
  var Lf=L.lf, i;
  if(L.state===0 || L.state===2){
    L.timer-=dt; L.vel=0;
    if(L.timer < 6 && !L.swapped){ L.swapped=1; var n = 1+Math.floor(Math.random()*3); if(LIFE_ACTIVE<0.3 && Math.random()<0.5) n=0; for(i=0;i<3;i++) L.pass[i].scT = i<n?1:0; }
    else if(L.timer >= 6 && !L.cleared && L.timer < L.wait-2){ L.cleared=1; for(i=0;i<3;i++) L.pass[i].scT=0; }
    if(L.timer<=0){ L.state++; L.p=0; }
  }else{
    L.p += dt/60; var p=Math.min(1,L.p), s=p*p*(3-2*p); L.vel = 6*p*(1-p);
    L.y = L.state===1 ? mix(Lf.y0, Lf.y1+0.02, s) : mix(Lf.y1+0.02, Lf.y0, s);
    if(L.p>=1){ L.state=(L.state+1)%4; L.timer=L.wait=20+Math.random()*20; L.swapped=0; L.cleared=0; L.dir=-L.dir; }
    L.dirty=1;
  }
  /* the beast: steer the head round the capstan, the body follows its trail */
  var C=L.cap, th=Math.atan2(L.hz-C.z, L.hx-C.x), la=th+L.dir*0.35;
  var gx=C.x+Math.cos(la)*C.r-L.hx, gz=C.z+Math.sin(la)*C.r-L.hz, err=wrapPi(Math.atan2(gz,gx)-L.hh);
  var v = (L.state===1||L.state===3) ? 0.25+L.vel*0.75 : (Math.abs(err)>0.3 ? 0.8 : 0);
  L.beastMoving = v>0 ? 1 : 0;
  if(v>0){
    var w = 0.7*dt*(v+0.2), turn = clamp(err,-w,w);
    if(Math.abs(err)>2.3){ var rx=Math.cos(th), rz=Math.sin(th), sgn = (Math.cos(L.hh+Math.PI/2)*rx + Math.sin(L.hh+Math.PI/2)*rz) > 0 ? 1 : -1; turn = sgn*w; }
    L.hh += turn;
    var d=v*dt; L.hx+=Math.cos(L.hh)*d; L.hz+=Math.sin(L.hh)*d; L.acc+=d; L.walked+=d;
    while(L.acc >= TR_DS){ L.acc-=TR_DS; L.trHead=(L.trHead+TR_N-1)%TR_N; L.trX[L.trHead]=L.hx-Math.cos(L.hh)*L.acc; L.trZ[L.trHead]=L.hz-Math.sin(L.hh)*L.acc; }
    L.dirty=1;
  }
}
var _lp=[0,0];
function lifeTrailAt(L, d){
  var s=(d-L.acc)/TR_DS;
  if(s<0){ var f0=L.acc>1e-5?d/L.acc:0; _lp[0]=mix(L.hx,L.trX[L.trHead],f0); _lp[1]=mix(L.hz,L.trZ[L.trHead],f0); return _lp; }
  var i=Math.floor(s), f=s-i; if(i>TR_N-2){ i=TR_N-2; f=1; }
  var i0=(L.trHead+i)%TR_N, i1=(L.trHead+i+1)%TR_N;
  _lp[0]=mix(L.trX[i0],L.trX[i1],f); _lp[1]=mix(L.trZ[i0],L.trZ[i1],f); return _lp;
}

/* ------------------------------------------------------------------ the tick */
var lifeTime=0, lifeFrame=0, pfWindow=0, pfCount0=0;
function lifeWriteMatrix(arr, o, x,y,z, hd, sx,sy,sz){
  var c=Math.cos(hd), s=Math.sin(hd);
  arr[o]=c*sx; arr[o+1]=0; arr[o+2]=-s*sx; arr[o+4]=0; arr[o+5]=sy; arr[o+6]=0; arr[o+8]=s*sz; arr[o+9]=0; arr[o+10]=c*sz;
  arr[o+12]=x; arr[o+13]=y; arr[o+14]=z;
}
function lifeTick(dt, hour){
  var t0=performance.now(), i, a;
  if(dt<=0) return;
  lifeTime+=dt; lifeFrame++;
  LIFE_ACTIVE = lifeActiveAt(hour);
  var cam=camera.position, camx=cam.x, camy=cam.y, camz=cam.z;
  lifeServe(1.2);
  for(i=0;i<SQUADS.length;i++) lifeSquadTick(SQUADS[i], dt, hour);
  for(i=0;i<DRILL.length;i++) lifeDrillTick(DRILL[i], dt, hour);
  for(i=0;i<LIFTSIM.length;i++) lifeLiftTick(LIFTSIM[i], dt);
  var day = hour>5.5 && hour<20;

  var e4=Math.min(1,dt*4), e6=Math.min(1,dt*6), e3=Math.min(1,dt*3);
  for(i=0;i<AG.length;i++){
    a=AG[i];
    switch(a.st){
      case ST_WALK: lifeWalk(a, dt, lifeTime);
        if(a.role===R_PED && a.thr>=LIFE_ACTIVE){ a.over+=dt; if(a.over>20){ var ddx=a.x-camx, ddz=a.z-camz; if(ddx*ddx+ddz*ddz>14400 || a.over>60){ a.cur=a.dest>=0?a.dest:a.cur; lifePlaceAtNode(a,a.cur); a.pN=null; a.st=ST_INSIDE; a.scT=0; a.timer=5; a.curfew=0; } } } else a.over=0;
        break;
      case ST_WAIT: if(a.pN){ a.delay-=dt; if(a.delay<=0){ a.st=ST_WALK; a.scT=1; } } break;
      case ST_INSIDE: a.timer-=dt; if(a.timer<=0 && a.sc<0.02) lifeNext(a); break;
      case ST_STAND:
        if(a.role===R_PED || a.role===R_CLIMB){ a.timer-=dt; a.armT=0; if(a.timer<=0) lifeNext(a); }
        else if(a.role===R_SENTRY){
          a.timer-=dt; a.hdT = a.post.hd + 0.55*Math.sin(lifeTime*0.23+a.ph0);
          if(a.timer<=0){
            a.timer=120+Math.random()*180;
            var cands=0, pick2=null, j;
            for(j=0;j<sentries.length;j++){ var b=sentries[j]; if(b!==a && b.st===ST_STAND && b.post.group===a.post.group && Math.random() < 1/(++cands)) pick2=b; }
            if(pick2){ var pa=a.post, pb=pick2.post; a.post=pb; pick2.post=pa; pb.by=a; pa.by=pick2; pick2.timer=120+Math.random()*180;
              [a,pick2].forEach(function(s, si){ var old = si===0?pa:pb; s.cur=old.node; var N=nodes[old.node]; s.st=ST_FREE; s.stage=1; s.tx=N.x; s.ty=N.y; s.tz=N.z; }); }
          }
        }
        else if(a.role===R_YARD || a.role===R_YARDSOL){
          a.timer-=dt; a.scT = (a.role===R_YARDSOL || day) ? 1 : 0;
          if(a.timer<=0 && a.scT>0){ var yp=lifeYardPoint(a.lift,[a.bx,a.bz]); a.tx=yp[0]; a.tz=yp[1]; a.ty=terrainH(yp[0],yp[1]); a.st=ST_FREE; a.stage=9; }
        }
        break;
      case ST_FREE:
        if(lifeFree(a,dt)){
          if(a.stage===1){ if(a.cur===a.post.node){ a.stage=2; a.tx=a.post.x; a.ty=a.post.y; a.tz=a.post.z; } else lifeRequest(a, a.post.node); }
          else if(a.stage===2){ a.st=ST_STAND; a.hdT=a.post.hd; }
          else if(a.stage===9){ a.st=ST_STAND; a.timer=(a.role===R_YARDSOL?20:4)+Math.random()*(a.role===R_YARDSOL?50:25); a.hdT=Math.random()*TAU; }
          else { a.st=ST_STAND; }
        }
        if(a.stage===9) a.by=terrainH(a.bx,a.bz);
        break;
      case ST_EXT:
        if(a.role===R_PASS){ var L=a.lift, ca=Math.cos(L.lf.a), sa=Math.sin(L.lf.a); a.bx=L.lf.x+ca*a.cx-sa*a.cz; a.bz=L.lf.z+sa*a.cx+ca*a.cz; a.by=L.y+0.12; a.hdT=a.hd; }
        else if(a.role===R_HANDLER){ var Lh=a.lift, C=Lh.cap, p=lifeTrailAt(Lh,1.2), rx=p[0]-C.x, rz=p[1]-C.z, rl=Math.sqrt(rx*rx+rz*rz)||1;
          var hx=p[0]+rx/rl*2.3, hz=p[1]+rz/rl*2.3; a.bx+=(hx-a.bx)*e3; a.bz+=(hz-a.bz)*e3; a.by=terrainH(a.bx,a.bz);
          if(Lh.beastMoving) a.hdT=Math.atan2(Math.cos(Lh.hh),Math.sin(Lh.hh)); if(lifeFrame<3){ a.bx=hx; a.bz=hz; } }
        break;
    }
    /* ease, animate, write */
    a.ox+=(a.sox-a.ox)*e4; a.oz+=(a.soz-a.oz)*e4;
    a.x=a.bx+a.ox; a.y=a.by; a.z=a.bz+a.oz;
    var dh=a.hdT-a.hd; if(dh>Math.PI) dh-=TAU; else if(dh<-Math.PI) dh+=TAU; a.hd+=dh*e6; if(a.hd>Math.PI) a.hd-=TAU; else if(a.hd<-Math.PI) a.hd+=TAU;
    a.sc += (a.scT-a.sc)*Math.min(1,dt*5); if(a.scT===0 && a.sc<0.02) a.sc=0;
    var mx=a.x-a.px, my=a.y-a.py, mz=a.z-a.pz, v=Math.sqrt(mx*mx+my*my+mz*mz)/dt; if(v>3) v=0;
    a.px=a.x; a.py=a.y; a.pz=a.z;
    var ampT = v>0.15 ? Math.min(0.62, 0.2+v*0.3) : 0;
    a.amp+=(ampT-a.amp)*e6; a.ph+=v*dt*4.1; if(a.ph>1000) a.ph-=TAU*100;
    a.arm+=(a.armT-a.arm)*e4;
    var M=MESHES[a.mesh], o=a.idx*16, s=a.sc*a.h, q=a.idx*4, An=M.userData.A.anim;
    lifeWriteMatrix(M.instanceMatrix.array, o, a.x,a.y,a.z, a.hd, s,s,s);
    An[q]=a.ph; An[q+1]=a.amp; An[q+2]=a.arm; An[q+3]=a.flag;
  }
  for(i=0;i<3;i++){ MESHES[i].instanceMatrix.needsUpdate=true; MESHES[i].userData.A.animAttr.needsUpdate=true; }

  /* cages + beasts */
  var cm=M_CAGE.instanceMatrix.array, ca2=M_CAGE.userData.A.anim, sm=M_SEG.instanceMatrix.array, sa2=M_SEG.userData.A.anim, anyDirty=false;
  for(i=0;i<LIFTSIM.length;i++){
    var Lq=LIFTSIM[i]; if(!Lq.dirty && lifeFrame>2) continue; Lq.dirty=0; anyDirty=true;
    var Lf=Lq.lf;
    lifeWriteMatrix(cm, i*16, Lf.x, Lq.y, Lf.z, -Lf.a, 1,1,1);
    ca2[i*4] = (Lf.y1+6.7) - Lq.y;
    for(var k=0;k<SEG_N;k++){
      var d=0.35+k*SEG_D, p0=lifeTrailAt(Lq, Math.max(0,d-0.3)), ax=p0[0], az=p0[1], p1=lifeTrailAt(Lq, d+0.3), bx2=p1[0], bz2=p1[1];
      var sx=(ax+bx2)*0.5, sz=(az+bz2)*0.5, sy=terrainH(sx,sz), hd2=Math.atan2(ax-bx2, az-bz2);
      var tp = k<2 ? 0.86+0.07*k : k>SEG_N-4 ? 1-0.13*(k-(SEG_N-4)) : 1;
      lifeWriteMatrix(sm, (i*SEG_N+k)*16, sx, sy-0.02, sz, hd2, tp, tp, 1);
      var qq=(i*SEG_N+k)*4; sa2[qq]=Lq.walked*5.0 - k*0.95; sa2[qq+1]=Lq.beastMoving?0.5:0.0;
    }
  }
  if(anyDirty){ M_CAGE.instanceMatrix.needsUpdate=true; M_CAGE.userData.A.animAttr.needsUpdate=true; M_SEG.instanceMatrix.needsUpdate=true; M_SEG.userData.A.animAttr.needsUpdate=true; }

  pfWindow+=dt; if(pfWindow>2){ LIFE_STAT.pfRate=(LIFE_STAT.pathfinds-pfCount0)/pfWindow; pfCount0=LIFE_STAT.pathfinds; pfWindow=0; }
  var ms=performance.now()-t0; LIFE_STAT.tickMs += (ms-LIFE_STAT.tickMs)*0.05; if(ms>LIFE_STAT.tickMax && lifeFrame>5) LIFE_STAT.tickMax=ms;
}

/* ------------------------------------------------------------------ initial placement */
(function(){
  peds.forEach(function(a){
    lifePlaceAtNode(a, a.home);
    var r=rnd();
    if(r<0.10){ a.st=ST_INSIDE; a.timer=rr(0,25); lifeSnap(a); return; }
    var first = lifeChooseDest(a), p = lifeAstar(a.home, first);
    if(!p || !p.e.length){ a.st=ST_INSIDE; a.timer=rr(0,10); lifeSnap(a); return; }
    if(r<0.22){ a.cur=first; lifePlaceAtNode(a,first); if(nDoor[first]){ a.st=ST_INSIDE; a.timer=rr(0,30); } else { lifeStandAt(a,2,35); a.sc=a.scT=1; a.hd=a.hdT; a.ox=a.sox; a.oz=a.soz; } lifeSnap(a); return; }
    lifeSetPath(a,p,0); a.st=ST_WALK; a.sc=a.scT=1;
    a.si = Math.floor(rnd()*p.e.length); a.u = rnd()*eLen[p.e[a.si]]; a.cur=p.n[a.si];
    lifeWalk(a,0,0); a.ox=a.sox; a.oz=a.soz; a.hd=a.hdT; lifeSnap(a);
  });
  SQUADS.forEach(function(Q){
    if(Q.kind!=='patrol') return;
    var leg=Q.legs[Q.li], si=Math.floor(rnd()*leg.e.length);
    Q.members.forEach(function(a,m){ lifeSetPath(a,leg,0); a.st=ST_WALK; a.si=si; a.u=Math.max(0, eLen[leg.e[si]]*0.6 - m*1.3); if(a.u<=0 && si>0){ a.si=si-1; a.u=Math.max(0,eLen[leg.e[si-1]]-m*1.3+eLen[leg.e[si]]*0.6); } a.cur=leg.n[a.si]; lifeWalk(a,0,0); a.ox=a.sox; a.oz=a.soz; a.hd=a.hdT; lifeSnap(a); });
  });
  /* half the gatherer squads start already on the road */
  SQUADS.forEach(function(Q,qi){
    if(Q.kind!=='gath' || !Q.routes.length || qi%2) return;
    var R=Q.routes[0], back = chance(0.4), leg = back?R.back:R.out, si=Math.floor(rr(0.15,0.85)*leg.e.length);
    Q.ri=0; Q.state = back?5:1;
    Q.members.forEach(function(a,m){ lifeSetPath(a,leg,0); a.st=ST_WALK; a.sc=a.scT=1; a.flag=back?1:0; a.si=Math.max(0,si - (m>1?1:0)); a.u=Math.max(0, eLen[leg.e[a.si]]*0.5 - (m%2)*1.4); a.cur=leg.n[a.si]; lifeWalk(a,0,0); a.ox=a.sox; a.oz=a.soz; a.hd=a.hdT; lifeSnap(a); });
  });
})();
lifeBuilding = false;
TICKS.push(lifeTick);

/* ------------------------------------------------------------------ path viz */
PATHVIZ.push({ key:'lifePeds', label:'Pedestrians (walk graph)', color:0xf0d080, paths:function(){
  var out=[]; for(var e=0;e<NE;e++){ var E=edges[e], A=nodes[E.a], B=nodes[E.b];
    if(E.kind==='bridge'){ var br=BRIDGES[E.bridge], pl=[]; for(var s=0;s<=10;s++){ var t=s/10; pl.push([mix(A.x,B.x,t), bridgeY(br,t)+0.3, mix(A.z,B.z,t)]); } out.push(pl); }
    else if(!eBad[e]) out.push([[A.x,A.y+0.3,A.z],[B.x,B.y+0.3,B.z]]); }
  return out; } });
PATHVIZ.push({ key:'lifePatrols', label:'Soldier patrols + sentry posts', color:0x60c040, paths:function(){
  var out=[]; SQUADS.forEach(function(Q){ if(Q.kind==='patrol') Q.legs.forEach(function(l){ out.push(lifePathPts(l)); }); });
  POSTS.forEach(function(p){ out.push([[p.x,p.y,p.z],[p.x,p.y+2.6,p.z]]); });
  DRILL.forEach(function(B){ out.push([[B.cx-B.tx*B.half,P_RK.y+0.3,B.cz-B.tz*B.half],[B.cx+B.tx*B.half,P_RK.y+0.3,B.cz+B.tz*B.half]]); });
  return out; } });
PATHVIZ.push({ key:'lifeGatherers', label:'Fruit-gathering squads', color:0xf08a2a, paths:function(){
  var out=[]; SQUADS.forEach(function(Q){ if(Q.kind==='gath') Q.routes.forEach(function(r){ out.push(lifePathPts(r.out)); }); }); return out; } });
PATHVIZ.push({ key:'lifeLifts', label:'Beast-drawn lifts, capstan rounds, ladders', color:0x80c0ff, paths:function(){
  var out=[]; LIFTSIM.forEach(function(L){ out.push([[L.lf.x,L.lf.y0,L.lf.z],[L.lf.x,L.lf.y1+6.7,L.lf.z]]);
    var c=[]; for(var s=0;s<=32;s++){ var a=s/32*TAU, x=L.cap.x+Math.cos(a)*L.cap.r, z=L.cap.z+Math.sin(a)*L.cap.r; c.push([x,terrainH(x,z)+0.4,z]); } out.push(c); });
  LADDERS.forEach(function(Ld){ out.push([[Ld.x,Ld.y0,Ld.z],[Ld.x,Ld.y1,Ld.z]]); });
  return out; } });

/* ------------------------------------------------------------------ probe */
LIFE_STAT.buildMs = Math.round(performance.now()-LIFE_T0);
function lifeExpectY(a){
  if(a.st!==ST_WALK || !a.pE || a.si>=a.pE.length) return null;
  var e=a.pE[a.si], A=nodes[a.pN[a.si]], B=nodes[a.pN[a.si+1]], dx=B.x-A.x, dz=B.z-A.z, l2=dx*dx+dz*dz;
  if(eKind[e]===5) return terrainH(a.x-a.ox,a.z-a.oz);
  if(l2<0.01) return a.y;
  var t=clamp(((a.x-a.ox-A.x)*dx+(a.z-a.oz-A.z)*dz)/l2,0,1), E=edges[e];
  return eKind[e]===2 ? bridgeY(BRIDGES[E.bridge], E.a===A.id?t:1-t) : A.y+(B.y-A.y)*t;
}
window._life = {
  peds:peds.length, soldiers:sentries.length+patrolMen.length+drillMen.length+yardSol.length, sentries:sentries.length, patrols:patrolMen.length,
  drill:drillMen.length, gatherers:gatherers.length, lifts:LIFTSIM.length, climbers:climbers.length, yard:yardFolk.length+yardSol.length,
  agents:AG.length, posts:POSTS.length, squads:SQUADS.length, stat:LIFE_STAT,
  tris:(function(){ var t=0; [M_PED,M_SOL,M_GATH,M_CAGE,M_SEG].forEach(function(m){ t+=m.geometry.index.count/3*m.count; }); return Math.round(t); })(),
  drawCalls:5, badLadderLinks:(function(){ var n=0; for(var e=0;e<NE;e++) n+=eBad[e]; return n; })(),
  agentsRaw:AG, liftsRaw:LIFTSIM, squadsRaw:SQUADS, drillRaw:DRILL, postsRaw:POSTS,
  step:function(dt,n){ for(var i=0;i<n;i++) lifeTick(dt, skyHour()); return lifeTime; },
  pos:function(){ return AG.map(function(a){ return [a.x,a.y,a.z]; }); },
  census:function(){
    var R={ active:0, inside:0, walking:0, standing:0, kinds:{}, byPlat:{}, levelsNow:0, levelsTotal:0, levelsVisited:0, emptyPlats:[], maxYErr:0, worst:null, queue:LIFE_Q.length, activeTarget:LIFE_ACTIVE,
            pfRate:LIFE_STAT.pfRate, tickMs:+LIFE_STAT.tickMs.toFixed(3), tickMax:+LIFE_STAT.tickMax.toFixed(2), pathfinds:LIFE_STAT.pathfinds, pathMsTotal:+LIFE_STAT.pathMs.toFixed(1), buildMs:LIFE_STAT.buildMs };
    var lv={};
    AG.forEach(function(a){
      if(a.sc<0.5){ R.inside++; return; }
      R.active++; if(a.st===ST_WALK) R.walking++; else R.standing++;
      var N=nodes[a.cur], pn = N && N.plat>=0 ? PLATS[N.plat].name : 'ground';
      if(a.st===ST_WALK){ var kn=KIND_NAME[a.ek]; R.kinds[kn]=(R.kinds[kn]||0)+1; var ey=lifeExpectY(a); if(ey!==null){ var er=Math.abs(a.y-ey); if(er>R.maxYErr){ R.maxYErr=+er.toFixed(3); R.worst=[a.id,KIND_NAME[a.ek]]; } } }
      if(a.role<=R_CLIMB || a.role>=R_SENTRY){ R.byPlat[pn]=(R.byPlat[pn]||0)+1; if(N) lv[N.plat+':'+N.lvl]=1; }
    });
    PLATS.forEach(function(P){ if(!R.byPlat[P.name]) R.emptyPlats.push(P.name); P.levels.forEach(function(L){ R.levelsTotal++; if(lv[P.id+':'+L.k]) R.levelsNow++; if(visits[P.id*16+L.k]) R.levelsVisited++; }); });
    return R;
  },
  mainLevels:function(){ var out={}; var lv={}; AG.forEach(function(a){ if(a.sc<0.5) return; var N=nodes[a.cur]; lv[N.plat+':'+N.lvl]=(lv[N.plat+':'+N.lvl]||0)+1; });
    MAINS.concat([P_CC]).forEach(function(P){ out[P.name]=P.levels.map(function(L){ return lv[P.id+':'+L.k]||0; }); }); return out; }
};
})();
