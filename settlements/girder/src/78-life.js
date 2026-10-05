reseed(780001);
/* ============================== 78. LIFE — GIRDER ==============================
   The people of Girder: farm workers on a day schedule (home -> field -> market/hall
   -> field -> home), villagers and roost hands, sentries (posted pairs, palisade and
   roof-deck patrols, wall-walk pacers, watch posts) with night lanterns, and the four
   beast-drawn lifts that really carry their riders, each with a draught millipede
   walking its capstan round.  Own meshes (5 draw calls), one TICKS entry.        */
(function(){
var LIFE_T0 = performance.now();
var nodes = NAV.nodes, NN = nodes.length;
/* PRIVATE copies of the edge list + adjacency: the planner's road graph leaves the ring road and the avenues
   unjoined where they cross (nodes 6 m apart, merge radius 3.5) and hangs every court-side tower door on the
   ring road, so ring <-> avenue traffic would otherwise climb a tower and ride its lift. NAV itself is untouched. */
var edges = NAV.edges.slice(), lifeAdj = NAV.adj.map(function(l){ return l.slice(); }), LIFE_LINKS = [];
(function(){
  function link(A,B){ if(!A||!B||A===B) return; for(var i=0;i<lifeAdj[A.id].length;i++){ var E=edges[lifeAdj[A.id][i]]; if(E.a===B.id||E.b===B.id) return; }
    var e={ id:edges.length, a:A.id, b:B.id, kind:'ground', len:Math.hypot(A.x-B.x,A.y-B.y,A.z-B.z), virtual:true }; edges.push(e); lifeAdj[A.id].push(e.id); lifeAdj[B.id].push(e.id); LIFE_LINKS.push(e); }
  var ring=[], ave=[];
  nodes.forEach(function(N){ if(N.tag!=='road') return; var onRing = Math.abs(Math.abs(N.x)-BLOCK)<0.5 || Math.abs(Math.abs(N.z)-BLOCK)<0.5;
    if(onRing && Math.abs(N.x)<=BLOCK+0.5 && Math.abs(N.z)<=BLOCK+0.5) ring.push(N); else if((Math.abs(N.x)<0.5 || Math.abs(N.z)<0.5)) ave.push(N); });
  [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(c){
    var cx=c[0]*BLOCK, cz=c[1]*BLOCK, A=navNearest(ave,cx,cz);
    ring.slice().sort(function(p,q){ return Math.hypot(p.x-cx,p.z-cz)-Math.hypot(q.x-cx,q.z-cz); }).slice(0,2).forEach(function(R){ link(A,R); });
  });
  /* court-side tower doors also step straight out to the avenue they face */
  nodes.forEach(function(N){ if(N.tag!=='towerdoor') return; var T=towerAt(N.x,N.z,6); if(!T) return;
    if(Math.abs(N.x) < Math.abs(T.x)-1 || Math.abs(N.z) < Math.abs(T.z)-1) link(N, navNearest(ave,N.x,N.z)); });
})();
var NE = edges.length;
var lifeBuilding = true;
function lrand(){ return lifeBuilding ? rnd() : Math.random(); }
function lrr(a,b){ return a + (b-a)*lrand(); }
function lpick(arr){ return arr[Math.min(arr.length-1, Math.floor(lrand()*arr.length))]; }

/* ------------------------------------------------------------------ graph tables */
var KIND = { deck:0, stair:1, bridge:2, lift:3, ground:4 };
var KIND_NAME = ['deck','stair','bridge','lift','ground'];
var K_BRIDGE = 2, K_LIFT = 3, K_GROUND = 4;
var COSTF = new Float32Array([1, 1.7, 1.25, 0.6, 1]), COSTC = new Float32Array([0, 0, 0, 70, 0]);
var SPDF  = new Float32Array([1, 0.6, 0.8, 1, 1]);
var LIFT_RIDE_S = 45;
var eKind = new Uint8Array(NE), eLen = new Float32Array(NE), eCap = new Int8Array(NE), eDoor = new Int8Array(NE);
/* the plinth steps at a tower entrance (three 1 m treads, 50-structure.js): walked as a short ramp */
function lifeStepY(T,x,z){ var d=Math.max(Math.abs(x-T.x),Math.abs(z-T.z))-T.half, y1=T.floors[0].y; return d<1.4 ? y1 : d>3.4 ? NAV_GY : mix(y1, NAV_GY, (d-1.4)/2.0); }
var nDoor = new Uint8Array(NN);
/* a ground edge that runs through a capstan round is walked round it: eCap = capstan+1 */
var CAP_R = 7.6, capTc = new Float32Array(NE), capSide = new Float32Array(NE);
(function(){
  for(var i=0;i<NN;i++){ var tg=nodes[i].tag; if(tg==='door'||tg==='housedoor'||tg==='halldoor') nDoor[i]=1; }
  for(var e=0;e<NE;e++){
    var E = edges[e], a = nodes[E.a], b = nodes[E.b];
    eKind[e] = KIND[E.kind]||0; eLen[e] = Math.max(0.05, E.len);
    if(E.kind==='stair' && (a.tag==='towerdoor' || b.tag==='towerdoor')){ var Td=towerAt(a.x,a.z,8); if(Td) eDoor[e]=Td.id+1; }
    if(E.kind==='ground'){
      for(var c=0;c<LIFTS.length;c++){ var C=LIFTS[c].capstan;
        if(segDist(C.x,C.z,a.x,a.z,b.x,b.z) < CAP_R-0.6){
          var dx=b.x-a.x, dz=b.z-a.z, L=Math.hypot(dx,dz)||1, ux=dx/L, uz=dz/L;
          eCap[e]=c+1; capTc[e]=(C.x-a.x)*ux+(C.z-a.z)*uz;
          var lat=(C.x-a.x)*(-uz)+(C.z-a.z)*ux;            /* centre's offset along the left normal (-uz,ux) */
          capSide[e] = lat>0 ? -1 : 1;                       /* step to the side away from the centre */
        } }
    }
  }
})();
var aS = new Int32Array(NN+1), aN, aE, aC;
(function(){
  var tot=0, i, j; for(i=0;i<NN;i++){ aS[i]=tot; tot+=lifeAdj[i].length; } aS[NN]=tot;
  aN = new Int32Array(tot); aE = new Int32Array(tot); aC = new Float32Array(tot);
  for(i=0;i<NN;i++) for(j=0;j<lifeAdj[i].length;j++){
    var eid = lifeAdj[i][j], E = edges[eid], q = aS[i]+j, k=eKind[eid];
    aN[q] = E.a===i ? E.b : E.a; aE[q] = eid; aC[q] = eLen[eid]*COSTF[k] + COSTC[k];
  }
})();

/* ------------------------------------------------------------------ A* (typed, lazy heap) */
var asG = new Float32Array(NN), asFrom = new Int32Array(NN), asFromE = new Int32Array(NN), asOpen = new Uint32Array(NN), asClosed = new Uint32Array(NN);
var asStamp = 0, hpN = new Int32Array(NN*6), hpK = new Float32Array(NN*6), hpLen = 0;
var LIFE_STAT = { pathfinds:0, pathMs:0, pfRate:0, tickMs:0, tickMax:0, buildMs:0, tripFail:0, resyncs:0, warps:0, astarMax:0, resyncMs:0 };
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
/* the heuristic is scaled by the cheapest cost factor (the lift's) so it stays admissible */
function lifeAstar(src, dst){
  LIFE_STAT.pathfinds++; var asT0=performance.now();
  asStamp++; hpLen=0;
  var D = nodes[dst], goal=-1;
  asG[src]=0; asOpen[src]=asStamp; asFrom[src]=-1; hpPush(src, 0);
  while(hpLen>0){
    var u = hpPop();
    if(asClosed[u]===asStamp) continue;
    asClosed[u]=asStamp;
    if(u===dst){ goal=u; break; }
    var gu = asG[u];
    for(var q=aS[u], q1=aS[u+1]; q<q1; q++){
      var v=aN[q]; if(asClosed[v]===asStamp) continue;
      var g = gu + aC[q];
      if(asOpen[v]!==asStamp || g < asG[v]){
        asG[v]=g; asOpen[v]=asStamp; asFrom[v]=u; asFromE[v]=aE[q];
        var N=nodes[v], dx=N.x-D.x, dy=N.y-D.y, dz=N.z-D.z;
        hpPush(v, g + 0.6*Math.sqrt(dx*dx+dy*dy+dz*dz));
      }
    }
  }
  if(goal<0) return null;
  var n=0, c=goal; while(c!==src){ n++; c=asFrom[c]; }
  var pN = new Int32Array(n+1), pE = new Int32Array(n); c=goal;
  for(var i=n;i>0;i--){ pN[i]=c; pE[i-1]=asFromE[c]; c=asFrom[c]; }
  pN[0]=src;
  var asMs=performance.now()-asT0; if(asMs>LIFE_STAT.astarMax) LIFE_STAT.astarMax=asMs;
  return { n:pN, e:pE };
}
function lifeReverse(p){
  if(!p) return null;
  var n=p.n.length, r={ n:new Int32Array(n), e:new Int32Array(n-1) }, i;
  for(i=0;i<n;i++) r.n[i]=p.n[n-1-i];
  for(i=0;i<n-1;i++) r.e[i]=p.e[n-2-i];
  return r;
}
function lifePathTime(p){          /* nominal seconds to walk a path (cumulative, cached on the path) */
  if(p.tt) return p.tt[p.e.length];
  var tt = new Float32Array(p.e.length+1), t=0;
  for(var i=0;i<p.e.length;i++){ var k=eKind[p.e[i]]; t += k===K_LIFT ? LIFT_RIDE_S+25 : eLen[p.e[i]]/(1.4*SPDF[k]); tt[i+1]=t; }
  p.tt=tt; return t;
}
function lifePathHas(p, kind){ for(var i=0;i<p.e.length;i++) if(eKind[p.e[i]]===kind) return true; return false; }
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
  /* 1.75 m, faces +z.  parts: 1 left leg, 2 right leg, 3 left arm, 4 right arm */
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
  G.box(0,1.70,-0.025, 0.25,0.10,0.25, GREY1, 0, 2);                  /* hair: top at 1.75 */
  G.cone(0,1.80,0, 0.36,0.17, PAL.rope[0], 0, 3, 1);                 /* straw hat (bit 1) */
  G.box(0.21,1.42,-0.10, 0.045,1.55,0.045, PAL.timber[3], 0, 3, 2, [-0.95,0,0]);      /* hoe over the shoulder (bit 2) */
  G.box(0.21,1.90,-0.78, 0.22,0.05,0.12, PAL.rock[3], 0, 3, 2, [-0.95,0,0]);
  LIFE_GEO.ped = G.build();
  G = lifeGeo(); lifeFigure(G,true);
  G.box(0,1.70,0, 0.29,0.11,0.30, PAL.uniform.brown, 0, 3);            /* leather helmet */
  G.box(0,1.78,0, 0.05,0.08,0.26, PAL.uniform.trim, 0, 3);             /* crest */
  G.box(0,1.47,0, 0.56,0.10,0.29, PAL.uniform.brown, 0, 3);            /* pauldrons */
  G.box(0,0.90,0, 0.44,0.09,0.27, PAL.uniform.trim, 0, 3);             /* belt */
  G.box(0.36,1.25,0.10, 0.045,2.5,0.045, PAL.timber[3], 0, 3, 1);      /* spear in the left hand (bit 1) */
  G.box(0.36,2.58,0.10, 0.07,0.26,0.03, PAL.uniform.trim, 0, 3, 1);
  G.box(0,1.28,-0.17, 0.62,0.06,0.07, PAL.timber[2], 0, 3, 2, [0,0,0.5]);  /* crossbow on the back (bit 2) */
  G.box(0,1.22,-0.17, 0.07,0.62,0.07, PAL.timber[0], 0, 3, 2, [0,0,0.5]);
  LIFE_GEO.soldier = G.build();
  /* lift cage: 3 x 3 x 2.6, open on both x faces (tower side and court side); the rope's top vertices are part 5 */
  G = lifeGeo();
  G.box(0,0.06,0, 3.0,0.12,3.0, PAL.plank[1], 0, 3);
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c){ G.box(c[0]*1.43,1.3,c[1]*1.43, 0.14,2.6,0.14, PAL.timber[0], 0, 3); });
  [-1,1].forEach(function(s){
    G.box(0,2.6,s*1.43, 3.0,0.14,0.14, PAL.timber[1], 0, 3); G.box(s*1.43,2.6,0, 0.14,0.14,3.0, PAL.timber[1], 0, 3);
    G.box(0,1.0,s*1.43, 2.8,0.08,0.08, PAL.timber[3], 0, 3); G.box(0,0.5,s*1.43, 2.8,0.06,0.06, PAL.rope[0], 0, 3);
  });
  G.box(0,2.62,0, 0.16,0.16,4.0, PAL.timber[2], 0, 3, 0, [0,0.785,0]); G.box(0,2.62,0, 0.16,0.16,4.0, PAL.timber[2], 0, 3, 0, [0,-0.785,0]);
  G.box(0,3.2,0, 0.09,1.0,0.09, PAL.rope[0], 0, 3, 0, null, 5);
  LIFE_GEO.cage = G.build();
  /* one millipede segment, faces +z: body, tergite plate, a leg pair; bit 1 = head, bit 2 = saddle */
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
  G.box(0,1.10,0, 0.80,0.20,0.62, PAL.cloth[0], 0, 3, 2);              /* harness blanket */
  G.box(0,1.26,-0.22, 0.50,0.24,0.10, PAL.timber[2], 0, 3, 2);
  LIFE_GEO.seg = G.build();
  /* hand lantern: a bright core + a camera-facing halo fan (additive; black rim = invisible).
     Halo vertices sit at the origin, carry their view-space offset in `normal` and are flagged by uv.x = 1. */
  (function(){
    var pos=[], col=[], uv=[], nor=[], idx=[], wc=new THREE.Color(PAL.glowWarm).convertSRGBToLinear();
    var bg=new THREE.BoxGeometry(0.15,0.2,0.15), bp=bg.attributes.position, bn=bg.attributes.normal, i;
    for(i=0;i<bp.count;i++){ pos.push(bp.getX(i),bp.getY(i),bp.getZ(i)); nor.push(bn.getX(i),bn.getY(i),bn.getZ(i)); col.push(wc.r,wc.g,wc.b); uv.push(0,0); }
    for(i=0;i<bg.index.count;i++) idx.push(bg.index.getX(i));
    bg.dispose();
    var n=12, c0=pos.length/3, rings=[[0.22,0.30],[0.8,0.0]];
    pos.push(0,0,0); nor.push(0,0,0); col.push(wc.r*0.7,wc.g*0.7,wc.b*0.7); uv.push(1,0);
    rings.forEach(function(rg){ for(i=0;i<n;i++){ var a=i/n*TAU; pos.push(0,0,0); nor.push(Math.cos(a)*rg[0],Math.sin(a)*rg[0],0); col.push(wc.r*rg[1],wc.g*rg[1],wc.b*rg[1]); uv.push(1,0); } });
    for(i=0;i<n;i++){ var j=(i+1)%n, r1=c0+1, r2=c0+1+n; idx.push(c0,r1+i,r1+j, r1+i,r2+i,r2+j, r1+i,r2+j,r1+j); }
    var g=new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor,3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
    g.setIndex(idx); g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), 1.2);
    LIFE_GEO.lantern = g;
  })();
})();

/* aAnim = (phase | rope length, walk amplitude (>=0) or -bend (<0), arm raise, part bits) */
function lifeHook(legPiv, armPiv){
  return function(sh){
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aPRO;\nattribute vec4 aAnim;\nattribute vec3 aGarb;\nattribute vec3 aSkin;\nattribute vec3 aHair;')
      .replace('#include <color_vertex>', 'vColor = color;\nif(aPRO.y < 0.5) vColor *= aGarb; else if(aPRO.y < 1.5) vColor *= aSkin; else if(aPRO.y < 2.5) vColor *= aHair;')
      .replace('#include <beginnormal_vertex>', [
        'vec3 objectNormal = vec3(normal);',
        'float lfPart = aPRO.x, lfAng = 0.0, lfPy = 0.0, lfAmp = max(aAnim.y, 0.0), lfBend = max(-aAnim.y, 0.0);',
        'bool lfLimb = lfPart > 0.5 && lfPart < 4.5;',
        'bool lfUpper = lfBend > 0.001 && ((lfPart < 0.5 && position.y > 0.9) || (lfPart > 2.5 && lfPart < 4.5));',
        'if(lfLimb){',
        '  float lfSw = sin(aAnim.x) * lfAmp;',
        '  if(lfPart < 2.5){ lfPy = ' + legPiv.toFixed(3) + '; lfAng = lfPart < 1.5 ? lfSw : -lfSw; }',
        '  else { lfPy = ' + armPiv.toFixed(3) + '; lfAng = (lfPart < 3.5 ? -lfSw : lfSw)*0.85 - aAnim.z; }',
        '  float lfC = cos(lfAng), lfS = sin(lfAng);',
        '  objectNormal = vec3(objectNormal.x, objectNormal.y*lfC - objectNormal.z*lfS, objectNormal.y*lfS + objectNormal.z*lfC);',
        '}',
        'if(lfUpper){ float lfCb = cos(lfBend), lfSb = sin(lfBend);',
        '  objectNormal = vec3(objectNormal.x, objectNormal.y*lfCb - objectNormal.z*lfSb, objectNormal.y*lfSb + objectNormal.z*lfCb); }'].join('\n'))
      .replace('#include <begin_vertex>', [
        'vec3 transformed = vec3(position);',
        'if(lfLimb){',
        '  float lfC2 = cos(lfAng), lfS2 = sin(lfAng); vec3 lfQ = transformed - vec3(0.0, lfPy, 0.0);',
        '  transformed = vec3(lfQ.x, lfPy + lfQ.y*lfC2 - lfQ.z*lfS2, lfQ.y*lfS2 + lfQ.z*lfC2);',
        '}',
        'if(lfUpper){ float lfCb2 = cos(lfBend), lfSb2 = sin(lfBend); vec3 lfB = transformed - vec3(0.0, 0.9, 0.0);',
        '  transformed = vec3(lfB.x, 0.9 + lfB.y*lfCb2 - lfB.z*lfSb2, lfB.y*lfSb2 + lfB.z*lfCb2); }',
        'if(lfPart > 4.5) transformed.y = aAnim.x;',
        'if(aPRO.z > 0.5){ float lfW = floor(aAnim.w + 0.5); bool lfShow = aPRO.z < 1.5 ? mod(lfW, 2.0) > 0.5 : lfW > 1.5;',
        '  if(!lfShow) transformed = vec3(0.0, 0.6, 0.0); }'].join('\n'));
  };
}
function lifeMesh(geo, count, key, legPiv, armPiv){
  var mat = new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true });
  /* the millipedes' chitin and the lift cages' cane come from the library as detail maps (48-detail.js; life_<key>) */
  var lh = lifeHook(legPiv, armPiv), dh = GDET.hook('life_'+key, mat);
  nlMaterial(mat, 'life'+key+(dh?'|det':''), dh ? function(sh){ lh(sh); dh(sh); } : lh);
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
var R_WORK=0, R_VILL=1, R_HAND=2, R_HANDLER=3, R_SENTRY=4, R_PATROL=5, R_WALL=6;
var ROLE_LABEL = ['Farm worker','Villager','Roost hand','Millipede handler','Sentry (posted)','Sentry (patrol)','Sentry (wall-walk)'];
var ST_INSIDE=0, ST_WAIT=1, ST_WALK=2, ST_STAND=3, ST_FREE=4, ST_EXT=5, ST_WORK=6, ST_QUEUE=7, ST_RIDE=8, ST_WARP=9;
var ST_NAME = ['inside','wait','walk','stand','free','ext','work','queue','ride','warp'];
var SG_WORKMOVE=1, SG_LEAVE=2, SG_ALIGHT=3, SG_POST=4;
var M_HOME=0, M_FIELD=1, M_LUNCH=2;
var AG = [], MESH_N = [0,0];
function lifeAgent(role, meshId){
  var a = { id:AG.length, role:role, mesh:meshId, idx:MESH_N[meshId]++, st:ST_INSIDE,
            bx:0, by:0, bz:0, x:0, y:0, z:0, px:0, py:0, pz:0, hd:lrr(0,TAU), hdT:0,
            sc:0, scT:0, h:lrr(0.95,1.04), ph:lrr(0,TAU), ph0:lrr(0,TAU), amp:0, arm:0, armT:0, bend:0, bendT:0, flag:0,
            spd:lrr(1.2,1.6), ox:0, oz:0, sox:0, soz:0, pN:null, pE:null, si:0, u:0, cur:0, dest:-1, home:0, high:0,
            timer:0, delay:0, thr:0, curfew:0, over:0, tx:0, ty:0, tz:0, stage:0, squad:null, post:null, ek:0, req:0, wantTo:-1,
            at:M_HOME, going:-1, reroute:0, chk:lrr(0,1), tOut:0, tBack:0, tL0:0, tL1:0, lunch:-1, field:-1, plot:null,
            pOut:null, pBack:null, pL:null, pLB:null, lift:null, lend:0, slot:0, lan:-1, tower:0,
            wa:0, wa0:0, wa1:0, wdir:1 };
  AG.push(a); return a;
}
function lifePlaceAtNode(a, n){ var N=nodes[n]; a.cur=n; a.bx=N.x; a.by=N.y; a.bz=N.z; }
function lifeSnap(a){ a.ox=a.sox; a.oz=a.soz; a.x=a.px=a.bx+a.ox; a.y=a.py=a.by; a.z=a.pz=a.bz+a.oz; a.hd=a.hdT; a.sc=a.scT; a.bend=a.bendT; a.arm=a.armT; }

/* ------------------------------------------------------------------ destination tables */
var LIFE_DEST = { market:[], hall:[], ring:[], low:[[],[],[],[]], high:[[],[],[],[]], roost:[[],[],[],[]], walk:[[],[],[],[]], houses:[] };
var nFace = new Float32Array(NN);
(function(){
  for(var i=0;i<NN;i++) nFace[i] = 99;
  STALLS.forEach(function(s){ LIFE_DEST.market.push(s.node.id); nFace[s.node.id] = Math.atan2(s.x-s.node.x, s.z-s.node.z); });
  HALL.doors.forEach(function(d){ LIFE_DEST.hall.push(d.id); });
  nodes.forEach(function(N){ if(N.tag==='road' && Math.hypot(N.x,N.z) < HALL.R+9) LIFE_DEST.ring.push(N.id); });
  SLOTS.forEach(function(S){ (S.high ? LIFE_DEST.high : LIFE_DEST.low)[S.tower.id].push(S.door.id); });
  ROOSTS.forEach(function(R){ LIFE_DEST.roost[R.plat.tower.id].push(R.node.id); nFace[R.node.id] = Math.atan2(R.ox, R.oz); });
  TOWERS.forEach(function(T){ T.deck.nav.walk.forEach(function(n,j){ if(j%2===0) LIFE_DEST.walk[T.id].push(n.id); }); });
  HOUSES.forEach(function(h){ LIFE_DEST.houses.push(h.door.id); });
  LIFE_DEST.gates=[]; GATES.forEach(function(g){ LIFE_DEST.gates.push(g.out.id); nDoor[g.out.id]=1; });
})();
function lifeChooseDest(a){
  var t=a.tower, r, d;
  for(var tries=0; tries<6; tries++){
    r = lrand(); d=-1;
    if(a.role===R_HAND){
      if(r<0.50) d=lpick(LIFE_DEST.roost[t]); else if(r<0.60) d=lpick(LIFE_DEST.walk[t]);
      else if(r<0.80){ var t2=(t+(lrand()<0.5?1:3))%4; d = lrand()<0.7 ? lpick(LIFE_DEST.roost[t2]) : lpick(LIFE_DEST.walk[t2]); }
      else if(r<0.90) d = lrand()<0.5 ? a.home : lpick(LIFE_DEST.high[t]);
      else d=lpick(LIFE_DEST.market);
    }else{
      if(r<0.40) d=lpick(LIFE_DEST.market); else if(r<0.50) d=lpick(LIFE_DEST.hall); else if(r<0.60) d=lpick(LIFE_DEST.ring);
      else if(r<0.78) d=lpick(LIFE_DEST.low[t]); else if(r<0.88) d=lpick(LIFE_DEST.low[(t+1+Math.floor(lrand()*3))%4]);
      else if(r<0.91 && LIFE_DEST.houses.length) d=lpick(LIFE_DEST.houses); else if(r<0.96) d=lpick(LIFE_DEST.gates); else d=a.home;
    }
    if(d>=0 && d!==a.cur) return d;
  }
  return a.home!==a.cur ? a.home : lpick(LIFE_DEST.market);
}

/* day/night: the share of the villagers allowed out of doors */
var LIFE_ACTIVE = 1;
function lifeActiveAt(h){
  if(h>=7 && h<18.5) return 1;
  if(h>=18.5 && h<21.5) return mix(1,0,(h-18.5)/3);
  if(h>=21.5 || h<4.8) return 0;
  return mix(0,1,(h-4.8)/2.2);
}
function lifeWant(a, h){
  if(h < a.tOut || h >= a.tBack) return M_HOME;
  if(a.lunch>=0 && h>=a.tL0 && h<a.tL1) return M_LUNCH;
  return M_FIELD;
}
function lifeModeNode(a, m){ return m===M_HOME ? a.home : m===M_FIELD ? a.field : a.lunch; }

/* ------------------------------------------------------------------ populations */
var workers=[], villagers=[], hands=[], handlers=[], sentries=[], patrolMen=[], wallMen=[];
var lifeGarbLin = PAL.people.garb.map(function(c){ return new THREE.Color(c).convertSRGBToLinear(); });
var lifeSkinLin = PAL.people.skin.map(function(c){ return new THREE.Color(c).convertSRGBToLinear(); });
var lifeHairLin = PAL.people.hair.map(function(c){ return new THREE.Color(c).convertSRGBToLinear(); });
var lifeGreenLin = new THREE.Color(PAL.uniform.green).convertSRGBToLinear();
var LANTERNS = [];
function lifeGiveLantern(a){ a.lan = LANTERNS.length; LANTERNS.push(a); }

(function(){
  /* --- farm workers: one or two per home lot in the towers, a household per ground house --- */
  var homes = [];
  SLOTS.forEach(function(S){ if(S.kind!=='home') return; var n = S.high ? (chance(0.35)?2:1) : (chance(0.55)?2:1); for(var i=0;i<n;i++) homes.push({ door:S.door.id, high:S.high?1:0, tower:S.tower.id, x:S.x, z:S.z }); });
  HOUSES.forEach(function(H){ var n = H.kind==='longhouse' ? 6 : H.kind==='joglo' ? 4 : 3; for(var i=0;i<n;i++) homes.push({ door:H.door.id, high:0, tower:0, x:H.x, z:H.z, house:1 }); });
  shuffle(homes); if(homes.length > 300) homes.length = 300;
  homes.forEach(function(Hm){
    var a = lifeAgent(R_WORK,0), best=null, bd=1e9;
    for(var t=0;t<3;t++){ var P=pick(PLOTS), d=Math.hypot(P.x-Hm.x,P.z-Hm.z); if(d<bd){ bd=d; best=P; } }
    a.home=Hm.door; a.high=Hm.high; a.tower=Hm.tower; a.plot=best; a.field=best.node.id;
    a.tOut = 5.3+rnd()*1.8; a.tBack = 17.3+rnd()*1.8;
    if(chance(0.45)){ a.tL0 = 11.3+rnd()*1.4; a.tL1 = a.tL0+0.8+rnd(); a.lunch = chance(0.7) ? pick(LIFE_DEST.market) : pick(LIFE_DEST.hall); }
    a.flag = (chance(0.75)?1:0) + (chance(0.45)?2:0);
    a.pOut = lifeAstar(a.home, a.field); a.pBack = lifeReverse(a.pOut);
    if(!a.pOut || !a.pOut.e.length) LIFE_STAT.tripFail++;
    if(a.lunch>=0){ a.pL = lifeAstar(a.field, a.lunch); a.pLB = lifeReverse(a.pL); if(!a.pL || !a.pL.e.length) LIFE_STAT.tripFail++; }
    workers.push(a);
  });
  /* --- villagers (low floors + court) and roost hands (top floors + decks) --- */
  var NV=110, NH=56, thr=[], i;
  for(i=0;i<NV+NH;i++) thr.push((i+0.5)/(NV+NH));
  shuffle(thr);
  for(i=0;i<NV;i++){ var v=lifeAgent(R_VILL,0); v.thr=thr[i]; v.tower=ri(0,3);
    v.home = (LIFE_DEST.houses.length && chance(0.12)) ? pick(LIFE_DEST.houses) : pick(LIFE_DEST.low[v.tower]); v.flag = chance(0.25)?1:0; villagers.push(v); }
  for(i=0;i<NH;i++){ var hd=lifeAgent(R_HAND,0); hd.thr=thr[NV+i]; hd.tower=ri(0,3); hd.high=1;
    hd.home = pick(LIFE_DEST.high[hd.tower]); hd.flag = chance(0.15)?1:0; hands.push(hd); }
})();

/* ---- sentry posts ---- */
var POSTS = [];
function lifePost(group, x,y,z, fx,fz, label, lantern){
  var p = { id:POSTS.length, group:group, x:x, y:y, z:z, hd:Math.atan2(fx,fz), label:label };
  POSTS.push(p);
  var a = lifeAgent(R_SENTRY,1); a.post=p; a.flag = 1 + (chance(0.4)?2:0); a.st=ST_STAND; a.scT=1;
  a.bx=x; a.by=y; a.bz=z; a.hdT=p.hd; lifeSnap(a); sentries.push(a);
  if(lantern) lifeGiveLantern(a);
  return p;
}
(function(){
  GATES.forEach(function(g){
    var inz = -Math.sin(g.a);
    [-1,1].forEach(function(sg){
      lifePost('gate', g.x+sg*3.1, NAV_GY, g.z+inz*7.0, -sg*0.35, inz, g.name+' (inner guard)', sg>0);
      var ox=g.x+sg*3.1, oz=g.z-inz*5.5; lifePost('gate', ox, terrainH(ox,oz)+0.04, oz, 0, -inz, g.name+' (outer guard)', sg<0);
    });
  });
  TOWERS.forEach(function(T){
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(f){
      [-1,1].forEach(function(sg){ lifePost('tower'+T.id, T.x+f[0]*(T.half+4.3)-f[1]*2.6*sg, NAV_GY, T.z+f[1]*(T.half+4.3)+f[0]*2.6*sg, f[0],f[1], T.name+' entrance', sg>0); });
    });
    var Lf=T.lift;
    lifePost('lift'+T.id, Lf.x+Lf.ox*3.6, NAV_GY, Lf.z-T.sz*3.8, Lf.ox, 0, 'lift foot', true);
    lifePost('lift'+T.id, Lf.x+Lf.ox*1.0, Lf.y1, Lf.z+T.sz*4.4, Lf.ox, 0, 'lift head', true);
  });
  PALISADE.posts.forEach(function(p){ var c=Math.cos(p.a), s=Math.sin(p.a); lifePost('watch', p.x+c*1.35, p.y, p.z+s*1.35, c, s, 'watch post', false); });
  BRIDGES.forEach(function(br){ [br.a, br.b].forEach(function(h,hi){
    lifePost('bridge'+br.id, h.x-h.ox*1.7+h.oz*2.7, h.y, h.z-h.oz*1.7-h.ox*2.7, h.ox, h.oz, 'bridgehead', hi===0); }); });
})();

/* ---- patrol squads: cached legs, members trail the leader by a start delay ---- */
var SQUADS = [];
function lifeLegs(wps){
  var legs=[]; for(var i=0;i<wps.length;i++){ var p = lifeAstar(wps[i], wps[(i+1)%wps.length]); if(p && p.e.length) legs.push(p); else LIFE_STAT.tripFail++; }
  return legs;
}
(function(){
  var W=PALISADE.walk;
  [[0,18,36,54],[27,45,63,9],[60,42,24,6]].forEach(function(q,i){
    SQUADS.push({ kind:'patrol', legs:lifeLegs(q.map(function(j){ return W[j].id; })), li:0, members:[], timer:0, n:3, label:'Palisade round '+(i+1) }); });
  var roadN = nodes.filter(function(N){ return N.tag==='road'; });
  SQUADS.push({ kind:'patrol', legs:lifeLegs([[-1,-1],[1,-1],[1,1],[-1,1]].map(function(c){ return navNearest(roadN, c[0]*BLOCK, c[1]*BLOCK).id; })), li:0, members:[], timer:0, n:3, label:'Ring road round' });
  BRIDGES.forEach(function(br){
    var A=br.a.plat, B=br.b.plat;
    var farA = navNearest(A.nav.walk, A.x-br.a.ox*40, A.z-br.a.oz*40).id, farB = navNearest(B.nav.walk, B.x-br.b.ox*40, B.z-br.b.oz*40).id;
    SQUADS.push({ kind:'patrol', legs:lifeLegs([farA, br.a.node.id, br.b.node.id, farB]), li:0, members:[], timer:0, n:2, label:'Roost deck + bridge '+(br.id+1) });
  });
  SQUADS.forEach(function(Q){
    var spd = rr(1.25,1.4);
    for(var m=0;m<Q.n;m++){ var a=lifeAgent(R_PATROL,1); a.squad=Q; a.spd=spd; a.flag = 1 + (chance(0.5)?2:0); Q.members.push(a); patrolMen.push(a); if(m===0) lifeGiveLantern(a); }
  });
  /* wall-walk pacers: parametric on the ledge (r 199, SETTLE_Y+3.6), between the gatehouses */
  var per=10, m0=0.085;
  for(var s=0;s<2;s++){
    var a0 = GATES[s].a + m0, a1 = GATES[(s+1)%2].a - m0 + (s?TAU:0), span=(a1-a0)/per;
    for(var k=0;k<per;k++){ var w=lifeAgent(R_WALL,1); w.st=ST_EXT; w.scT=1; w.flag=1+(chance(0.5)?2:0); w.spd=rr(1.0,1.25);
      w.wa0=a0+k*span+0.02; w.wa1=a0+(k+1)*span-0.02; w.wa=rr(w.wa0,w.wa1); w.wdir=chance(0.5)?1:-1; w.timer=0; wallMen.push(w); lifeGiveLantern(w); }
  }
})();
var WALL_R = PALISADE.R-1.0, WALL_Y = SETTLE_Y+3.6;

/* ---- lifts + draught millipedes ---- */
var LIFTSIM = [], SEG_N = 13, SEG_D = 0.56, TR_N = 128, TR_DS = 0.1, LIFT_CAP = 6;
var LIFT_SLOT = [[-0.75,-0.8],[0.75,-0.8],[-0.75,0],[0.75,0],[-0.75,0.8],[0.75,0.8]];
(function(){
  LIFTS.forEach(function(Lf){
    var C = Lf.capstan;
    var L = { lf:Lf, cap:C, yb:Lf.y0+0.05, yt:Lf.y1-0.12, y:Lf.y0+0.05, p:0, state:0, timer:rr(4,12), idle:0, vel:0,
              nRide:0, nWait0:0, nWait1:0, slotCtr:0, trips:0, carried:0,
              hx:0, hz:0, hh:0, dir:1, acc:0, trX:new Float32Array(TR_N), trZ:new Float32Array(TR_N), trHead:0, walked:0, beastMoving:0, dirty:1, handler:null };
    var th0 = rr(0,TAU);
    L.hx = C.x+Math.cos(th0)*C.r; L.hz = C.z+Math.sin(th0)*C.r; L.hh = th0+Math.PI/2;
    for(var j=0;j<TR_N;j++){ var th = th0 - (j*TR_DS)/C.r; L.trX[j]=C.x+Math.cos(th)*C.r; L.trZ[j]=C.z+Math.sin(th)*C.r; }
    var hn=lifeAgent(R_HANDLER,0); hn.st=ST_EXT; hn.lift=L; hn.scT=1; hn.flag=1; L.handler=hn; handlers.push(hn);
    LIFTSIM.push(L);
  });
})();

/* ------------------------------------------------------------------ meshes */
var M_PED = lifeMesh(LIFE_GEO.ped, MESH_N[0], 'Ped', 0.9, 1.45);
var M_SOL = lifeMesh(LIFE_GEO.soldier, MESH_N[1], 'Sol', 0.9, 1.45);
var M_CAGE = lifeMesh(LIFE_GEO.cage, LIFTSIM.length, 'Cage', 0.9, 1.45);
var M_SEG = lifeMesh(LIFE_GEO.seg, LIFTSIM.length*SEG_N, 'Seg', 0.55, 0.55);
var M_LAN = (function(){
  var mat = new THREE.MeshBasicMaterial({ color:0xffffff, vertexColors:true, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, fog:false, side:THREE.DoubleSide });
  mat.onBeforeCompile = function(sh){
    sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', [
      'vec4 mvPosition = vec4(transformed, 1.0);',
      '#ifdef USE_INSTANCING',
      '  mvPosition = instanceMatrix * mvPosition;',
      '#endif',
      'mvPosition = modelViewMatrix * mvPosition;',
      '#ifdef USE_INSTANCING',
      '  if(uv.x > 0.5) mvPosition.xy += normal.xy * length(instanceMatrix[0].xyz);',
      '#endif',
      'gl_Position = projectionMatrix * mvPosition;'].join('\n'));
  };
  mat.customProgramCacheKey = function(){ return 'lifeLantern'; };
  var m = new THREE.InstancedMesh(LIFE_GEO.lantern, mat, Math.max(1,LANTERNS.length));
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled=false; m.castShadow=false; m.receiveShadow=false; m.renderOrder=5;
  for(var k=0;k<m.count*16;k++) m.instanceMatrix.array[k]=0;
  for(var q=0;q<m.count;q++) m.instanceMatrix.array[q*16+15]=1;
  m.userData.life='Lantern'; m.userData.inspectLabel='Sentry\'s lantern'; m.visible=false;
  scene.add(m); return m;
})();
var MESHES = [M_PED, M_SOL];
var byMesh = [[],[]];
AG.forEach(function(a){
  byMesh[a.mesh][a.idx]=a;
  var A = MESHES[a.mesh].userData.A, g, s = pick(lifeSkinLin), h = pick(lifeHairLin), k=a.idx*3;
  if(a.mesh===1){ var f=rr(0.88,1.1); A.garb[k]=lifeGreenLin.r*f; A.garb[k+1]=lifeGreenLin.g*f; A.garb[k+2]=lifeGreenLin.b*f; }
  else { g = pick(lifeGarbLin); var f2=rr(0.85,1.1); A.garb[k]=g.r*f2; A.garb[k+1]=g.g*f2; A.garb[k+2]=g.b*f2; }
  A.skin[k]=s.r; A.skin[k+1]=s.g; A.skin[k+2]=s.b; A.hair[k]=h.r; A.hair[k+1]=h.g; A.hair[k+2]=h.b;
});
var PLOT_VERB = { crop:'hoeing the crop rows', paddy:'planting the paddy', orchard:'tending the orchard', garden:'weeding the garden', pen:'seeing to the beasts' };
function lifeLabel(a){
  if(a.role===R_WORK){
    if(a.st===ST_WORK || (a.st===ST_FREE && a.stage===SG_WORKMOVE)) return 'Farm worker — '+(PLOT_VERB[a.plot.kind]||'at work');
    if(a.st===ST_QUEUE) return 'Farm worker — waiting for the lift';
    if(a.st===ST_RIDE) return 'Farm worker — riding the lift';
    if(a.going===M_FIELD) return 'Farm worker — walking to the fields';
    if(a.going===M_HOME) return 'Farm worker — heading home';
    if(a.going===M_LUNCH || a.at===M_LUNCH) return 'Farm worker — midday at the '+(nodes[a.lunch].tag==='market'?'market':'hall');
    return 'Farm worker';
  }
  if(a.role===R_SENTRY) return 'Sentry — '+a.post.label;
  if(a.role===R_PATROL) return 'Sentry patrol — '+a.squad.label;
  if(a.st===ST_QUEUE) return ROLE_LABEL[a.role]+' — waiting for the lift';
  if(a.st===ST_RIDE) return ROLE_LABEL[a.role]+' — riding the lift';
  if(a.st===ST_STAND && nodes[a.cur].tag==='market') return ROLE_LABEL[a.role]+' — at the market';
  return ROLE_LABEL[a.role];
}
M_PED.userData.inspectFn = function(i){ var a=byMesh[0][i]; return a ? lifeLabel(a) : 'Villager'; };
M_SOL.userData.inspectFn = function(i){ var a=byMesh[1][i]; return a ? lifeLabel(a) : 'Sentry'; };
M_CAGE.userData.inspectFn = function(i){ var L=LIFTSIM[i]; return 'Lift cage ('+L.lf.tower.name+', '+L.nRide+' aboard)'; };
M_SEG.userData.inspectFn = function(){ return 'Draught millipede'; };
(function(){
  var A=M_SEG.userData.A;
  for(var i=0;i<LIFTSIM.length*SEG_N;i++){ var k=i%SEG_N; A.anim[i*4+3] = k===0?1:(k===3?2:0); }
})();

/* ------------------------------------------------------------------ path requests: amortised, a few per frame */
var LIFE_Q = [], LIFE_TRIP_H = 1/600;     /* teleport placement: a 10-minute walk reads as one sky hour of commute */
function lifeRequest(a, to){ a.st=ST_WAIT; a.pN=null; a.req=1; a.wantTo=to; a.delay=0; LIFE_Q.push(a); }
function lifeSetPath(a, p, delay){ a.pN=p.n; a.pE=p.e; a.si=0; a.u=0; a.cur=p.n[0]; a.dest=p.n[p.n.length-1]; a.delay=delay||0; a.st=ST_WAIT; a.req=0; }
function lifeServe(budgetMs){
  var t0 = performance.now(), n=0;
  while(LIFE_Q.length && n<6){
    var a = LIFE_Q.shift(); if(!a.req || a.st!==ST_WAIT) continue;
    var p = lifeAstar(a.cur, a.wantTo); n++;
    if(!p || p.e.length===0){ a.req=0; a.st=ST_STAND; a.timer=2; a.going=-1; if(!p) LIFE_STAT.tripFail++; continue; }
    lifeSetPath(a, p, 0);
    if(performance.now()-t0 > budgetMs) break;
  }
  LIFE_STAT.pathMs += performance.now()-t0;
}

/* ------------------------------------------------------------------ behaviour */
function lifeWorkSpot(a){
  var P=a.plot, hw=P.w/2-2.5, hd=P.d/2-2.5;
  if(a.st===ST_WORK && lrand()<0.8){ a.tx=clamp(a.bx+(lrand()*2-1)*5, P.x-hw, P.x+hw); a.tz=clamp(a.bz+(lrand()*2-1)*5, P.z-hd, P.z+hd); }
  else { a.tx=P.x+(lrand()*2-1)*hw; a.tz=P.z+(lrand()*2-1)*hd; }
  a.ty=NAV_GY;
  a.st=ST_FREE; a.stage=SG_WORKMOVE; a.bendT=0; a.armT=0;
}
function lifeStandAt(a, tmin, tmax){
  a.st=ST_STAND; a.timer=lrr(tmin,tmax);
  var tg=nodes[a.cur].tag, m = (tg==='road'||tg==='deckwalk') ? 0.9 : tg==='market' ? 0.7 : 0.4;
  a.sox=lrr(-m,m); a.soz=lrr(-m,m); a.hdT = nFace[a.cur]<50 ? nFace[a.cur]+lrr(-0.3,0.3) : lrr(0,TAU);
  a.armT = (tg==='roost' && lrand()<0.6) ? 0.9 : 0;
}
function lifeArrive(a){
  a.pN=null; a.reroute=0; a.over=0;
  if(a.role===R_WORK){
    a.going=-1; a.at = a.cur===a.home ? M_HOME : a.cur===a.field ? M_FIELD : a.cur===a.lunch ? M_LUNCH : -1;
    if(a.at===M_FIELD) lifeWorkSpot(a);
    else if(a.at===M_HOME || nDoor[a.cur]){ a.st=ST_INSIDE; a.scT=0; a.timer=0; }
    else lifeStandAt(a,1e6,1e6);
  }else if(a.role===R_VILL || a.role===R_HAND){
    a.curfew=0;
    if(nDoor[a.cur]){ a.st=ST_INSIDE; a.scT=0; a.timer=lrr(5,40); }
    else lifeStandAt(a,6,40);
  }else{ a.st=ST_STAND; a.timer=0; a.sox=0; a.soz=0; }                 /* squad member: the squad decides */
}
function lifeGo(a){                   /* worker: set off for the place a.going names */
  var to=lifeModeNode(a,a.going), p=null; a.reroute=0; a.at=-1; a.scT=1; a.bendT=0; a.armT=0;
  if(a.cur===to){ lifeArrive(a); return; }
  if(a.cur===a.home && to===a.field) p=a.pOut; else if(a.cur===a.field && to===a.home) p=a.pBack;
  else if(a.cur===a.field && to===a.lunch) p=a.pL; else if(a.cur===a.lunch && to===a.field) p=a.pLB;
  if(p && p.e.length) lifeSetPath(a,p,0); else lifeRequest(a,to);
}
function lifeDequeue(a){ if(a.st===ST_QUEUE){ if(a.lend) a.lift.nWait1--; else a.lift.nWait0--; } }
function lifeWarp(a){ lifeDequeue(a); a.st=ST_WARP; a.scT=0; a.pN=null; a.req=0; a.reroute=0; LIFE_STAT.warps++; }
function lifeThink(a, hour, canWarp){
  if(a.st===ST_WARP || a.st===ST_RIDE) return;
  var want = lifeWant(a,hour);
  if(a.going>=0 ? want===a.going : want===a.at) return;
  a.going = want;
  if(canWarp){ lifeWarp(a); return; }
  var N;
  switch(a.st){
    case ST_INSIDE: case ST_STAND: lifeGo(a); break;
    case ST_WORK: N=nodes[a.field]; a.cur=a.field; a.bendT=0; a.armT=0; a.st=ST_FREE; a.stage=SG_LEAVE; a.tx=N.x; a.ty=N.y; a.tz=N.z; break;
    case ST_FREE: if(a.stage===SG_WORKMOVE){ N=nodes[a.field]; a.cur=a.field; a.stage=SG_LEAVE; a.tx=N.x; a.ty=N.y; a.tz=N.z; } else a.reroute=1; break;
    default: a.reroute=1;
  }
}
function lifeNext(a){                 /* villagers + roost hands */
  if(a.thr >= LIFE_ACTIVE){
    if(a.cur===a.home && a.st===ST_INSIDE){ a.timer=lrr(3,8); return; }
    a.curfew=1; a.scT=1; lifeRequest(a, a.home); return;
  }
  a.scT=1; a.armT=0; lifeRequest(a, lifeChooseDest(a));
}
function lifeWalk(a, dt, time){
  var rem = a.spd*dt, pE=a.pE, e, k, L;
  for(;;){
    if(a.si >= pE.length){ lifePlaceAtNode(a, a.pN[pE.length]); lifeArrive(a); return; }
    e=pE[a.si]; k=eKind[e]; L=eLen[e];
    if(k===K_LIFT){                                   /* wait at the landing for the cage */
      lifePlaceAtNode(a, a.pN[a.si]); a.lift=LIFTSIM[edges[e].lift]; a.lend = nodes[a.cur].tag==='lifthead' ? 1 : 0;
      if(a.lend) a.lift.nWait1++; else a.lift.nWait0++;
      a.st=ST_QUEUE; a.ek=k; a.sox=(lrand()*2-1)*1.3; a.soz=(lrand()*2-1)*1.6; a.hdT=Math.atan2(a.lift.lf.x-a.bx-a.sox, a.lift.lf.z-a.bz-a.soz); return;
    }
    a.u += rem*SPDF[k];
    if(a.u < L) break;
    rem = (a.u-L)/SPDF[k]; a.u=0; a.si++; a.cur=a.pN[a.si];
    if(a.si < pE.length){
      if(a.reroute){ lifePlaceAtNode(a,a.cur); lifeGo(a); return; }
      if(a.role!==R_WORK && a.squad===null && !a.curfew && a.thr >= LIFE_ACTIVE){ lifePlaceAtNode(a,a.cur); a.curfew=1; lifeRequest(a,a.home); return; }
    }
  }
  var A=nodes[a.pN[a.si]], B=nodes[a.pN[a.si+1]], t=a.u/L, dx=B.x-A.x, dz=B.z-A.z, hl=Math.sqrt(dx*dx+dz*dz);
  a.bx=A.x+dx*t; a.bz=A.z+dz*t; a.ek=k;
  if(k===K_BRIDGE){ var E=edges[e]; a.by = bridgeY(BRIDGES[E.bridge], E.a===A.id ? t : 1-t) + Math.sin(time*2.3+a.ph0)*0.02*Math.sin(Math.PI*t); }
  else if(k===K_GROUND && (a.bx*a.bx+a.bz*a.bz) > 41000) a.by = terrainH(a.bx,a.bz)+0.04;      /* outside the palisade */
  else if(eDoor[e]) a.by = lifeStepY(TOWERS[eDoor[e]-1], a.bx, a.bz);
  else a.by = A.y+(B.y-A.y)*t;
  var lane = k===K_BRIDGE ? 0.45 : k===1 ? 0.3 : k===K_GROUND ? 0.7 : 0.4;
  if(hl>0.05){
    var ux=dx/hl, uz=dz/hl;
    a.sox=-uz*lane; a.soz=ux*lane; a.hdT=Math.atan2(dx,dz);
    if(eCap[e]){                                      /* step round the capstan and its millipede */
      var E2=edges[e], fw=E2.a===A.id, sA = fw ? a.u : L-a.u, ds = sA-capTc[e], W=2*CAP_R;
      if(ds>-W && ds<W){
        var sg = fw?1:-1, q=Math.PI*0.5*ds/W, o=1.15*CAP_R*Math.cos(q), od=-1.15*CAP_R*Math.PI*0.5/W*Math.sin(q);
        var nx=-uz*sg*capSide[e], nz=ux*sg*capSide[e];                /* world normal, from the a->b frame */
        a.bx+=nx*o; a.bz+=nz*o; a.sox*=0.3; a.soz*=0.3;
        a.hdT=Math.atan2(ux+nx*od*sg, uz+nz*od*sg);
      }
    }
  }else{ a.sox=0; a.soz=0; }
}
function lifeFree(a, dt, k){
  var dx=a.tx-a.bx, dy=a.ty-a.by, dz=a.tz-a.bz, d=Math.sqrt(dx*dx+dz*dz), step=a.spd*k*dt;
  a.sox=0; a.soz=0;
  if(d <= step || d<0.02){ a.bx=a.tx; a.by=a.ty; a.bz=a.tz; return true; }
  a.bx+=dx/d*step; a.bz+=dz/d*step; a.by+=dy*(step/d); a.hdT=Math.atan2(dx,dz);
  return false;
}
function lifeSquadTick(Q, dt){
  var M=Q.members, i;
  for(i=0;i<M.length;i++) if(M[i].st!==ST_STAND) return;
  Q.timer-=dt; if(Q.timer>0) return;
  Q.li=(Q.li+1)%Q.legs.length; Q.timer=2+Math.random()*4;
  for(i=0;i<M.length;i++) lifeSetPath(M[i], Q.legs[Q.li], i*1.0);
}
function lifeLiftTick(L, dt, day){
  var Lf=L.lf;
  if(L.state===0 || L.state===2){
    L.vel=0; L.timer-=dt;
    if(L.timer<=0){
      L.idle+=dt;
      if(L.nRide>0 || L.walker || (L.state===0?L.nWait1:L.nWait0)>0 || (day && L.idle>18)){   /* L.walker: the walk mode's walker is aboard (83-walk.js) */ L.state++; L.p=0; L.idle=0; L.trips++; L.carried+=L.nRide; }
    }
  }else{
    L.p += dt/LIFT_RIDE_S; var p=Math.min(1,L.p), s=p*p*(3-2*p); L.vel = 6*p*(1-p);
    L.y = L.state===1 ? mix(L.yb, L.yt, s) : mix(L.yt, L.yb, s);
    if(L.p>=1){ L.state=(L.state+1)%4; L.timer=6; L.idle=0; L.dir=-L.dir; }
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

/* ------------------------------------------------------------------ settle: put an agent where the clock says it is */
function lifeAlong(a, p, f){
  lifeSetPath(a,p,0); a.st=ST_WALK; a.scT=1;
  var T=lifePathTime(p), t=clamp(f,0,0.999)*T, i=0; while(i<p.e.length-1 && p.tt[i+1]<=t) i++;
  a.si=i; a.cur=p.n[i]; a.u = eKind[p.e[i]]===K_LIFT ? 0 : (t-p.tt[i])/Math.max(1e-4,p.tt[i+1]-p.tt[i])*eLen[p.e[i]];
  lifeWalk(a,0,0);
}
function lifeSettle(a, h, transit){
  lifeDequeue(a);
  a.pN=null; a.req=0; a.reroute=0; a.bendT=0; a.armT=0; a.over=0; a.curfew=0; a.sox=0; a.soz=0;
  if(a.role===R_WORK){
    var want=lifeWant(a,h), seg=null, f=0, g=-1, d;
    if(transit && a.pOut){
      d=lifePathTime(a.pOut)*LIFE_TRIP_H;
      if(h>=a.tOut && h<a.tOut+d){ seg=a.pOut; f=(h-a.tOut)/d; g=M_FIELD; }
      else if(h>=a.tBack && h<a.tBack+d){ seg=a.pBack; f=(h-a.tBack)/d; g=M_HOME; }
      else if(a.pL){ d=lifePathTime(a.pL)*LIFE_TRIP_H;
        if(h>=a.tL0 && h<a.tL0+d){ seg=a.pL; f=(h-a.tL0)/d; g=M_LUNCH; }
        else if(h>=a.tL1 && h<a.tL1+d){ seg=a.pLB; f=(h-a.tL1)/d; g=M_FIELD; } }
    }
    if(seg){ lifeAlong(a,seg,f); a.at=-1; a.going=g; lifeSnap(a); return; }
    a.going=-1; a.at=want; lifePlaceAtNode(a, lifeModeNode(a,want));
    if(want===M_HOME || nDoor[a.cur]){ a.st=ST_INSIDE; a.scT=0; a.timer=0; }
    else if(want===M_FIELD){ lifeWorkSpot(a); a.bx=a.tx; a.bz=a.tz; a.by=a.ty; a.st=ST_WORK; a.work=lrand()<0.75?1:0; a.timer=lrr(2,16); a.scT=1; a.hdT=lrr(0,TAU); }
    else { lifeStandAt(a,1e6,1e6); a.scT=1; }
    lifeSnap(a); return;
  }
  /* villagers + roost hands */
  lifePlaceAtNode(a, a.home);
  var r=lrand();
  if(a.thr >= lifeActiveAt(h) || r<0.12){ a.st=ST_INSIDE; a.scT=0; a.timer=lrr(0,25); lifeSnap(a); return; }
  var first = lifeChooseDest(a), p = lifeAstar(a.home, first);
  if(!p || !p.e.length){ a.st=ST_INSIDE; a.scT=0; a.timer=lrr(0,10); lifeSnap(a); return; }
  if(r<0.45){ lifePlaceAtNode(a,first); if(nDoor[first]){ a.st=ST_INSIDE; a.scT=0; a.timer=lrr(0,30); } else { lifeStandAt(a,2,35); a.scT=1; } lifeSnap(a); return; }
  lifeAlong(a,p,lrand()); lifeSnap(a);
}
function lifeResync(h){
  LIFE_STAT.resyncs++; var rsT0=performance.now();
  LIFE_ACTIVE = lifeActiveAt(h); LIFE_Q.length=0;
  LIFTSIM.forEach(function(L){ L.state=0; L.y=L.yb; L.p=0; L.timer=4+lrand()*8; L.idle=0; L.nRide=0; L.nWait0=0; L.nWait1=0; L.dirty=1; });
  var i, a;
  for(i=0;i<AG.length;i++){ a=AG[i]; if(a.role<=R_HAND){ a.st=ST_INSIDE; lifeSettle(a,h,true); } }
  SQUADS.forEach(function(Q){
    Q.li = Math.floor(lrand()*Q.legs.length); Q.timer=0;
    var leg=Q.legs[Q.li], T=lifePathTime(leg), f=lrr(0.1,0.9);
    Q.members.forEach(function(m,mi){ lifeAlong(m, leg, Math.max(0, f - mi*1.6/T)); m.scT=1; lifeSnap(m); });
  });
  LIFE_STAT.resyncMs=performance.now()-rsT0;
}

/* ------------------------------------------------------------------ the tick */
var lifeTime=0, lifeFrame=0, pfWindow=0, pfCount0=0, lifeLastHour=-1, lifeLanK=0, lifeFast=false;
function lifeWriteMatrix(arr, o, x,y,z, hd, sx,sy,sz){
  var c=Math.cos(hd), s=Math.sin(hd);
  arr[o]=c*sx; arr[o+1]=0; arr[o+2]=-s*sx; arr[o+4]=0; arr[o+5]=sy; arr[o+6]=0; arr[o+8]=s*sz; arr[o+9]=0; arr[o+10]=c*sz;
  arr[o+12]=x; arr[o+13]=y; arr[o+14]=z;
}
function lifeTick(dt, hour, nightK){
  var t0=performance.now(), i, a;
  if(dt<=0) return;
  lifeTime+=dt; lifeFrame++;
  /* the clock: a jump (slider, verifier, teleport hook) re-settles everyone; a fast clock lets far agents skip the walk */
  var rate = SKY.paused ? 0 : SKY.timeScale/SKY.secPerHour, expect = rate*dt;
  lifeFast = rate > 1/90;
  if(lifeLastHour>=0 && expect<3){ var dh=hour-lifeLastHour; if(dh>12) dh-=24; else if(dh<-12) dh+=24; if(Math.abs(dh-expect)>0.3){ lifeResync(hour); t0=performance.now(); } }
  lifeLastHour=hour;
  LIFE_ACTIVE = lifeActiveAt(hour);
  var cam=camera.position, camx=cam.x, camy=cam.y, camz=cam.z;
  var day = hour>5.0 && hour<20.5, deepNight = hour>=21 || hour<4.6;
  lifeServe(1.5); var tServe=performance.now()-t0;
  for(i=0;i<SQUADS.length;i++) lifeSquadTick(SQUADS[i], dt);
  for(i=0;i<LIFTSIM.length;i++) lifeLiftTick(LIFTSIM[i], dt, day);

  var e4=Math.min(1,dt*4), e6=Math.min(1,dt*6), e3=Math.min(1,dt*3), L, Lf, N, ddx, ddy, ddz, far;
  for(i=0;i<AG.length;i++){
    a=AG[i];
    if(a.role===R_WORK){
      a.chk-=dt;
      if(a.chk<=0){ a.chk=0.4+Math.random()*0.4; ddx=a.x-camx; ddy=a.y-camy; ddz=a.z-camz; far = ddx*ddx+ddy*ddy+ddz*ddz > 6400;
        lifeThink(a, hour, lifeFast);      /* a 2-minute day is a time-lapse: trips become fades */
        if(deepNight && a.going===M_HOME && a.st===ST_WALK){ a.over+=0.6; if(a.over>60 || (far && a.over>25)) lifeWarp(a); } }
    }
    else if(a.role<=R_HAND && lifeFast){
      a.chk-=dt;
      if(a.chk<=0){ a.chk=0.5+Math.random()*0.5; if(a.thr>=LIFE_ACTIVE && a.st!==ST_INSIDE && a.st!==ST_WARP && a.st!==ST_RIDE) lifeWarp(a); }
    }
    switch(a.st){
      case ST_WALK: lifeWalk(a, dt, lifeTime);
        if(a.curfew && a.st===ST_WALK){ a.over+=dt; if(a.over>(lifeFast?6:25)){ ddx=a.x-camx; ddz=a.z-camz; if(lifeFast || ddx*ddx+ddz*ddz>14400 || a.over>90) lifeWarp(a); } }
        break;
      case ST_WAIT: if(a.pN){ a.delay-=dt; if(a.delay<=0){ a.st=ST_WALK; a.scT=1; } } break;
      case ST_INSIDE: if(a.role!==R_WORK){ a.timer-=dt; if(a.timer<=0 && a.sc<0.02) lifeNext(a); } break;
      case ST_STAND:
        if(a.role===R_VILL || a.role===R_HAND){ a.timer-=dt; if(a.armT>0) a.armT=0.8+0.25*Math.sin(lifeTime*1.9+a.ph0); if(a.timer<=0){ a.armT=0; lifeNext(a); } }
        else if(a.role===R_SENTRY) a.hdT = a.post.hd + 0.6*Math.sin(lifeTime*0.23+a.ph0);
        else if(a.role===R_WORK && a.at<0 && a.going<0){ a.timer-=dt; }
        break;
      case ST_WORK:
        a.timer-=dt;
        if(a.work){ a.bendT=0.62+0.28*Math.sin(lifeTime*1.3+a.ph0); a.armT=0.75+0.25*Math.sin(lifeTime*2.6+a.ph0); } else { a.bendT=0; a.armT=0; }
        if(a.timer<=0) lifeWorkSpot(a);
        break;
      case ST_FREE:
        if(lifeFree(a, dt, a.stage===SG_WORKMOVE ? 0.55 : 0.85)){
          if(a.stage===SG_WORKMOVE){ a.st=ST_WORK; a.work=Math.random()<0.75?1:0; a.timer=a.work ? 6+Math.random()*14 : 3+Math.random()*6; if(!a.work) a.hdT=Math.random()*TAU; }
          else if(a.stage===SG_LEAVE){ lifeGo(a); }
          else if(a.stage===SG_ALIGHT){ a.si++; a.u=0; a.cur=a.pN[a.si]; a.st=ST_WALK; if(a.reroute){ lifePlaceAtNode(a,a.cur); lifeGo(a); } }
          else a.st=ST_STAND;
        }
        break;
      case ST_QUEUE:
        L=a.lift;
        if((a.lend ? L.state===2 : L.state===0) && L.nRide<LIFT_CAP){
          if(a.lend) L.nWait1--; else L.nWait0--;
          L.nRide++; a.slot=(L.slotCtr++)%LIFT_CAP; if(L.timer<4) L.timer=4; a.st=ST_RIDE; a.sox=0; a.soz=0; }
        break;
      case ST_RIDE:
        L=a.lift; Lf=L.lf;
        if(a.lend ? L.state===0 : L.state===2){
          L.nRide--; N=nodes[a.pN[a.si+1]]; a.st=ST_FREE; a.stage=SG_ALIGHT; a.tx=N.x; a.ty=N.y; a.tz=N.z;
        }else{
          a.tx=Lf.x+LIFT_SLOT[a.slot][0]; a.tz=Lf.z+LIFT_SLOT[a.slot][1]; ddx=a.tx-a.bx; ddz=a.tz-a.bz;
          var dd=Math.sqrt(ddx*ddx+ddz*ddz), stp=1.3*dt, moving = L.state===1||L.state===3;
          if(dd<=stp || moving){ a.bx=a.tx; a.bz=a.tz; a.hdT=Math.atan2(Lf.ox,0); } else { a.bx+=ddx/dd*stp; a.bz+=ddz/dd*stp; a.hdT=Math.atan2(ddx,ddz); }
          if(dd<1.6 || moving) a.by=L.y+0.12;
        }
        break;
      case ST_WARP: if(a.sc<0.02){ lifeSettle(a, hour, false); a.sc=0; } break;
      case ST_EXT:
        if(a.role===R_WALL){
          if(a.timer>0){ a.timer-=dt; a.hdT=Math.atan2(Math.cos(a.wa),Math.sin(a.wa)) + 0.5*Math.sin(lifeTime*0.31+a.ph0); }
          else{
            a.wa += a.wdir*a.spd*dt/WALL_R;
            if(a.wa>=a.wa1){ a.wa=a.wa1; a.wdir=-1; a.timer=5+Math.random()*14; } else if(a.wa<=a.wa0){ a.wa=a.wa0; a.wdir=1; a.timer=5+Math.random()*14; }
            else if(Math.random()<dt*0.02) a.timer=4+Math.random()*8;
            a.hdT=Math.atan2(-Math.sin(a.wa)*a.wdir, Math.cos(a.wa)*a.wdir);
          }
          a.bx=Math.cos(a.wa)*WALL_R; a.bz=Math.sin(a.wa)*WALL_R; a.by=WALL_Y;
        }else if(a.role===R_HANDLER){ var Lh=a.lift, C=Lh.cap, p=lifeTrailAt(Lh,1.2), rx=p[0]-C.x, rz=p[1]-C.z, rl=Math.sqrt(rx*rx+rz*rz)||1;
          var hx=p[0]+rx/rl*2.3, hz=p[1]+rz/rl*2.3; a.bx+=(hx-a.bx)*e3; a.bz+=(hz-a.bz)*e3; a.by=NAV_GY;
          a.scT = (day || Lh.beastMoving) ? 1 : 0;
          if(Lh.beastMoving) a.hdT=Math.atan2(Math.cos(Lh.hh),Math.sin(Lh.hh)); if(lifeFrame<3){ a.bx=hx; a.bz=hz; } }
        break;
    }
    /* ease, animate, write */
    a.ox+=(a.sox-a.ox)*e4; a.oz+=(a.soz-a.oz)*e4;
    a.x=a.bx+a.ox; a.y=a.by; a.z=a.bz+a.oz;
    var dh2=a.hdT-a.hd; if(dh2>Math.PI) dh2-=TAU; else if(dh2<-Math.PI) dh2+=TAU; a.hd+=dh2*e6; if(a.hd>Math.PI) a.hd-=TAU; else if(a.hd<-Math.PI) a.hd+=TAU;
    a.sc += (a.scT-a.sc)*Math.min(1,dt*5); if(a.scT===0 && a.sc<0.02) a.sc=0;
    var mx=a.x-a.px, my=a.y-a.py, mz=a.z-a.pz, v=Math.sqrt(mx*mx+my*my+mz*mz)/dt; if(v>3 || a.st===ST_RIDE) v=0;
    a.px=a.x; a.py=a.y; a.pz=a.z;
    var ampT = v>0.15 ? Math.min(0.62, 0.2+v*0.3) : 0;
    a.amp+=(ampT-a.amp)*e6; a.ph+=v*dt*4.1; if(a.ph>1000) a.ph-=TAU*100;
    a.arm+=(a.armT-a.arm)*e4; a.bend+=(a.bendT-a.bend)*e3;
    var M=MESHES[a.mesh], o=a.idx*16, s=a.sc*a.h, q=a.idx*4, An=M.userData.A.anim;
    lifeWriteMatrix(M.instanceMatrix.array, o, a.x,a.y,a.z, a.hd, s,s,s);
    An[q]=a.ph; An[q+1]= a.bend>0.02 ? -a.bend : a.amp; An[q+2]=a.arm; An[q+3]=a.flag;
  }
  for(i=0;i<MESHES.length;i++){ MESHES[i].instanceMatrix.needsUpdate=true; MESHES[i].userData.A.animAttr.needsUpdate=true; }

  /* night lanterns ride in the carriers' right hands */
  var lk = smooth(0.30, 0.65, nightK==null ? 0 : nightK); lifeLanK=lk;
  if(lk>0.01 || M_LAN.visible){
    var lm=M_LAN.instanceMatrix.array;
    for(i=0;i<LANTERNS.length;i++){ a=LANTERNS[i]; var ch=Math.cos(a.hd), sh=Math.sin(a.hd), ls=lk*a.sc*(0.92+0.08*Math.sin(lifeTime*9+a.ph0));
      lifeWriteMatrix(lm, i*16, a.x-0.36*ch+0.24*sh, a.y+0.92*a.h, a.z+0.36*sh+0.24*ch, a.hd, ls,ls,ls); }
    M_LAN.instanceMatrix.needsUpdate=true; M_LAN.visible = lk>0.01;
  }

  /* cages + beasts */
  var cm=M_CAGE.instanceMatrix.array, ca2=M_CAGE.userData.A.anim, sm=M_SEG.instanceMatrix.array, sa2=M_SEG.userData.A.anim, anyDirty=false;
  for(i=0;i<LIFTSIM.length;i++){
    var Lq=LIFTSIM[i]; if(!Lq.dirty && lifeFrame>2) continue; Lq.dirty=0; anyDirty=true;
    var Lf2=Lq.lf;
    lifeWriteMatrix(cm, i*16, Lf2.x, Lq.y, Lf2.z, -Lf2.a, 1,1,1);
    ca2[i*4] = (Lf2.y1+6.75) - Lq.y;
    for(var k=0;k<SEG_N;k++){
      var d=0.35+k*SEG_D, p0=lifeTrailAt(Lq, Math.max(0,d-0.3)), ax=p0[0], az=p0[1], p1=lifeTrailAt(Lq, d+0.3), bx2=p1[0], bz2=p1[1];
      var sx=(ax+bx2)*0.5, sz=(az+bz2)*0.5, hd2=Math.atan2(ax-bx2, az-bz2);
      var tp = k<2 ? 0.86+0.07*k : k>SEG_N-4 ? 1-0.13*(k-(SEG_N-4)) : 1;
      lifeWriteMatrix(sm, (i*SEG_N+k)*16, sx, SETTLE_Y+0.02, sz, hd2, tp, tp, 1);
      var qq=(i*SEG_N+k)*4; sa2[qq]=Lq.walked*5.0 - k*0.95; sa2[qq+1]=Lq.beastMoving?0.5:0.0;
    }
  }
  if(anyDirty){ M_CAGE.instanceMatrix.needsUpdate=true; M_CAGE.userData.A.animAttr.needsUpdate=true; M_SEG.instanceMatrix.needsUpdate=true; M_SEG.userData.A.animAttr.needsUpdate=true; }

  pfWindow+=dt; if(pfWindow>2){ LIFE_STAT.pfRate=(LIFE_STAT.pathfinds-pfCount0)/pfWindow; pfCount0=LIFE_STAT.pathfinds; pfWindow=0; }
  var ms=performance.now()-t0; LIFE_STAT.tickMs += (ms-LIFE_STAT.tickMs)*0.05; if(ms>LIFE_STAT.tickMax && lifeFrame>5){ LIFE_STAT.tickMax=ms; LIFE_STAT.spike=[lifeFrame, +tServe.toFixed(1), +ms.toFixed(1)]; }
}

/* ------------------------------------------------------------------ initial placement */
lifeResync(skyHour());
LIFE_STAT.resyncs=0;
lifeBuilding = false;
TICKS.push(lifeTick);

/* ------------------------------------------------------------------ path viz */
PATHVIZ.push({ key:'lifeCommute', label:'Farm workers: home ↔ field commutes', color:0xf0d080, paths:function(){
  var out=[]; workers.forEach(function(a){ if(a.pOut) out.push(lifePathPts(a.pOut)); }); return out; } });
PATHVIZ.push({ key:'lifeMidday', label:'Farm workers: midday market / hall trips', color:0xf08a2a, paths:function(){
  var out=[]; workers.forEach(function(a){ if(a.pL) out.push(lifePathPts(a.pL)); }); return out; } });
PATHVIZ.push({ key:'lifeVillagers', label:'Villagers + roost hands (live paths)', color:0xd8a0ff, paths:function(){
  var out=[]; villagers.concat(hands).forEach(function(a){ if(a.pN && a.st===ST_WALK) out.push(lifePathPts({ n:a.pN, e:a.pE })); }); return out; } });
PATHVIZ.push({ key:'lifeSentries', label:'Sentry patrols, posts and the wall-walk', color:0x60c040, paths:function(){
  var out=[]; SQUADS.forEach(function(Q){ Q.legs.forEach(function(l){ out.push(lifePathPts(l)); }); });
  POSTS.forEach(function(p){ out.push([[p.x,p.y,p.z],[p.x,p.y+2.6,p.z]]); });
  wallMen.forEach(function(w){ var pl=[]; for(var s=0;s<=8;s++){ var an=mix(w.wa0,w.wa1,s/8); pl.push([Math.cos(an)*WALL_R, WALL_Y+0.3, Math.sin(an)*WALL_R]); } out.push(pl); });
  return out; } });
PATHVIZ.push({ key:'lifeLifts', label:'Beast-drawn lifts + capstan rounds', color:0x80c0ff, paths:function(){
  var out=[]; LIFTSIM.forEach(function(L){ out.push([[L.lf.x,L.lf.y0,L.lf.z],[L.lf.x,L.lf.y1+6.7,L.lf.z]]);
    var c=[]; for(var s=0;s<=32;s++){ var an=s/32*TAU; c.push([L.cap.x+Math.cos(an)*L.cap.r, SETTLE_Y+0.4, L.cap.z+Math.sin(an)*L.cap.r]); } out.push(c); });
  return out; } });

/* ------------------------------------------------------------------ probe */
LIFE_STAT.buildMs = Math.round(performance.now()-LIFE_T0);
function lifeExpectY(a){
  if(a.st===ST_QUEUE || a.st===ST_STAND || a.st===ST_INSIDE) return a.role===R_SENTRY ? a.post.y : nodes[a.cur].y;
  if(a.st===ST_WORK) return NAV_GY;
  if(a.st===ST_RIDE) return null;
  if(a.st!==ST_WALK || !a.pE || a.si>=a.pE.length) return null;
  var e=a.pE[a.si], A=nodes[a.pN[a.si]], B=nodes[a.pN[a.si+1]], E=edges[e], t=clamp(a.u/eLen[e],0,1);
  if(eKind[e]===K_GROUND && (a.bx*a.bx+a.bz*a.bz)>41000) return terrainH(a.bx,a.bz)+0.04;
  if(eDoor[e]) return lifeStepY(TOWERS[eDoor[e]-1], a.bx, a.bz);
  return eKind[e]===K_BRIDGE ? bridgeY(BRIDGES[E.bridge], E.a===A.id?t:1-t) : A.y+(B.y-A.y)*t;
}
function lifeCensus(){
  var R={ hour:+skyHour().toFixed(2), active:0, inside:0, walking:0, byRole:{}, outByRole:{}, byState:{}, kinds:{}, maxYErr:0, worst:null, outdoorsNonSentry:0,
          workersAt:{home:0,field:0,lunch:0,travelling:0}, highWorkers:0, liftQueue:0, liftRiding:0, bridgeWalkers:0, queue:LIFE_Q.length, activeTarget:LIFE_ACTIVE, fast:lifeFast, lanternK:+lifeLanK.toFixed(2),
          lifts:LIFTSIM.map(function(L){ return { state:L.state, y:+L.y.toFixed(1), aboard:L.nRide, waitFoot:L.nWait0, waitHead:L.nWait1, trips:L.trips, carried:L.carried }; }),
          pfRate:LIFE_STAT.pfRate, tickMs:+LIFE_STAT.tickMs.toFixed(3), tickMax:+LIFE_STAT.tickMax.toFixed(2), pathfinds:LIFE_STAT.pathfinds, buildMs:LIFE_STAT.buildMs,
          tripFail:LIFE_STAT.tripFail, resyncs:LIFE_STAT.resyncs, warps:LIFE_STAT.warps };
  AG.forEach(function(a){
    var rn=ROLE_LABEL[a.role]; R.byRole[rn]=(R.byRole[rn]||0)+1;
    if(a.role===R_WORK){ if(a.high) R.highWorkers++; if(a.going>=0||a.at<0) R.workersAt.travelling++; else R.workersAt[['home','field','lunch'][a.at]]++; }
    if(a.sc<0.5 && a.scT<0.5){ R.inside++; return; }
    R.active++; R.outByRole[rn]=(R.outByRole[rn]||0)+1; R.byState[ST_NAME[a.st]]=(R.byState[ST_NAME[a.st]]||0)+1;
    if(a.role<=R_HANDLER) R.outdoorsNonSentry++;
    if(a.st===ST_QUEUE) R.liftQueue++; if(a.st===ST_RIDE) R.liftRiding++;
    if(a.st===ST_WALK){ R.walking++; var kn=KIND_NAME[a.ek]; R.kinds[kn]=(R.kinds[kn]||0)+1; if(a.ek===K_BRIDGE) R.bridgeWalkers++; }
    var ey=lifeExpectY(a); if(ey!==null){ var er=Math.abs(a.y-ey); if(er>R.maxYErr){ R.maxYErr=+er.toFixed(3); R.worst=[a.id,ROLE_LABEL[a.role],ST_NAME[a.st],KIND_NAME[a.ek]]; } }
  });
  return R;
}
window._life = {
  workers:workers.length, villagers:villagers.length, roostHands:hands.length, handlers:handlers.length,
  soldiers:sentries.length+patrolMen.length+wallMen.length, sentries:sentries.length, patrols:patrolMen.length, wallWalk:wallMen.length,
  lanterns:LANTERNS.length, lifts:LIFTSIM.length, agents:AG.length, posts:POSTS.length, squads:SQUADS.length, stat:LIFE_STAT,
  tris:(function(){ var t=0; [M_PED,M_SOL,M_CAGE,M_SEG,M_LAN].forEach(function(m){ t+=m.geometry.index.count/3*m.count; }); return Math.round(t); })(),
  drawCalls:5, virtualLinks:LIFE_LINKS.map(function(e){ return [Math.round(nodes[e.a].x),Math.round(nodes[e.a].z),Math.round(nodes[e.b].x),Math.round(nodes[e.b].z)]; }),
  trips:(function(){ var o={ commutes:0, commutesViaLift:0, commutesViaBridge:0, midday:0, fail:LIFE_STAT.tripFail, longest:0, mean:0 }, sum=0;
    workers.forEach(function(a){ if(!a.pOut) return; o.commutes++; if(lifePathHas(a.pOut,K_LIFT)) o.commutesViaLift++; if(lifePathHas(a.pOut,K_BRIDGE)) o.commutesViaBridge++; if(a.pL) o.midday++;
      var T=lifePathTime(a.pOut); sum+=T; if(T>o.longest) o.longest=Math.round(T); });
    o.mean=Math.round(sum/Math.max(1,o.commutes)); return o; })(),
  agentsRaw:AG, liftsRaw:LIFTSIM, squadsRaw:SQUADS, postsRaw:POSTS,
  samplePaths:function(n){ var out=[]; for(var i=0;i<workers.length && out.length<(n||3);i+=Math.max(1,Math.floor(workers.length/(n||3)))){ var a=workers[i]; if(a.pOut) out.push({ id:a.id, high:a.high, tOut:+a.tOut.toFixed(2), tBack:+a.tBack.toFixed(2), secs:Math.round(lifePathTime(a.pOut)),
      kinds:Array.prototype.map.call(a.pOut.e,function(e){ return KIND_NAME[eKind[e]][0]; }).join(''), pts:lifePathPts(a.pOut).map(function(p){ return [Math.round(p[0]),Math.round(p[1]),Math.round(p[2])]; }) }); } return out; },
  step:function(dt,n){ for(var i=0;i<n;i++) lifeTick(dt, skyHour(), DAYNIGHT_NIGHT_K); return lifeTime; },
  /* teleport-time test hook: set the clock, re-settle everyone, optionally run the sim for `secs` */
  teleport:function(h, secs){ skySetHour(h); lifeResync(skyHour()); lifeLastHour=skyHour(); var n=Math.round((secs||0)/0.1); for(var i=0;i<n;i++){ lifeLastHour=skyHour(); lifeTick(0.1, skyHour(), DAYNIGHT_NIGHT_K); } return lifeCensus(); },
  resync:function(h){ lifeResync(h==null?skyHour():h); return lifeCensus(); },
  pos:function(){ return AG.map(function(a){ return [a.x,a.y,a.z,a.sc]; }); },
  census:lifeCensus,
  path:function(s,d){ var p=lifeAstar(s,d); if(!p) return null; var c=0; for(var i=0;i<p.e.length;i++){ var k=eKind[p.e[i]]; c+=eLen[p.e[i]]*COSTF[k]+COSTC[k]; } return { cost:Math.round(c), secs:Math.round(lifePathTime(p)), n:Array.prototype.slice.call(p.n), kinds:Array.prototype.map.call(p.e,function(e){ return KIND_NAME[eKind[e]][0]; }).join('') }; },
};
})();
