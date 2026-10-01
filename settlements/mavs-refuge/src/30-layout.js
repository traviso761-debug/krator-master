/* ============================== 5. LAYOUT ==============================
   PLANNER-OWNED. Decides where everything is; builds no geometry.
   Outputs (all read-only to every later fragment):
     SPECIES, TREES, FARTREES, trunkR(T,y), treeAt()
     PLATS (main platforms + council + satellites), PIDX by name
       P.levels[k] = { k, kind, y (floor top), H (clear height), Rout, gw, depth, Rin }
       P.bays[]    = stair slots (angles), P.heads[] = bridgeheads
       P.slots[]   = deck building lots,  P.rooms[] = lower-level rooms
     BRIDGES, SPIRALS (gate ramps + the council stair), LIFTS, LADDERS
     BRANCH_REQ (branches the tree pass must grow to carry satellites)
     ROOSTS, NAV (walk graph)                                              */
reseed(300001);

var SLAB = 0.8;                       /* floor thickness everywhere */

var SPECIES = [
  { name:'Ironbark',    H:[410,470], rb:[25,29], crown0:0.50, crownR:[170,215] },
  { name:'Ghostwood',   H:[390,445], rb:[19,23], crown0:0.46, crownR:[150,190] },
  { name:'Prism gum',   H:[365,425], rb:[22,26], crown0:0.52, crownR:[185,230] },
  { name:'Gate baobab', H:[285,312], rb:[36,40], crown0:0.80, crownR:[120,150] }
];

/* ---- trunk profile: THE contract between layout, trees, platforms, spiders ---- */
function trunkR(T, y){
  var yy = Math.max(0, y - T.y0), u = clamp(yy/T.H, 0, 1), r;
  if(T.sp === 3){
    var b = u<0.15 ? 1.0 : u<0.35 ? mix(1.0,1.08,(u-0.15)/0.20) : u<0.60 ? mix(1.08,0.92,(u-0.35)/0.25)
          : u<0.78 ? mix(0.92,0.64,(u-0.60)/0.18) : mix(0.64,0.10,smooth(0.78,1.0,u));
    r = T.rb*b*(1 + 0.38*Math.exp(-yy/9));
  }else{
    var t = u<0.62 ? 1 - 0.42*u : mix(0.74, 0.07, smooth(0.62,1.0,u));
    r = T.rb*t*(1 + 0.80*Math.exp(-yy/15));
  }
  return r;
}

/* ---- the occupied trees: hand-placed, so the city reads as a plan ---- */
var TREES = [];
function addTree(x,z,sp,role,opt){
  opt = opt||{};
  var S = SPECIES[sp];
  var T = { id:TREES.length, x:x, z:z, sp:sp, role:role||null,
            H: opt.H || rr(S.H[0],S.H[1]), rb: opt.rb || rr(S.rb[0],S.rb[1]),
            crownR: rr(S.crownR[0],S.crownR[1]), crown0:S.crown0, seed: ri(1,1e6), y0:0 };
  TREES.push(T); return T;
}
var T_C  = addTree( -40,-250, 0, 'central', {H:478, rb:31});
var T_R1 = addTree(-430,-300, 1, 'res');
var T_R2 = addTree( 330,-330, 2, 'res');
var T_R3 = addTree(-170,-640, 2, 'res');
var T_RK = addTree( 250,-700, 0, 'rook');
var T_R4 = addTree(-250, 260, 1, 'res');
var T_R5 = addTree( 220, 280, 0, 'res');
var T_SP = addTree( 600, 380, 2, 'spider');
var T_G1 = addTree(-610,-650, 3, 'gate');
var T_G2 = addTree( -20, 680, 3, 'gate');
var T_G3 = addTree( 720,-170, 3, 'gate');
var OCC_N = TREES.length;

/* main links between occupied trees (tree ids) */
var LINKS = [[T_C,T_R1],[T_C,T_R2],[T_C,T_R3],[T_R3,T_RK],[T_R2,T_RK],[T_R1,T_G1],[T_R3,T_G1],
             [T_C,T_R4],[T_C,T_R5],[T_R4,T_R5],[T_R5,T_SP],[T_R4,T_G2],[T_R5,T_G2],[T_R2,T_G3],[T_SP,T_G3]];

/* ---- unoccupied hypertrees: about two for every occupied one ---- */
(function(){
  var want = OCC_N*2 + 2, tries = 0, LIM = 1380;
  while(TREES.length < OCC_N + want && tries++ < 6000){
    var x = rr(-LIM,LIM), z = rr(-LIM,LIM);
    if(riverDist(x,z) < 95) continue;
    var ok = true;
    for(var i=0;i<TREES.length && ok;i++){
      var d = Math.hypot(TREES[i].x-x, TREES[i].z-z);
      if(d < (TREES[i].role ? 300 : 250)) ok = false;
    }
    /* keep trunks out of the bridge corridors */
    for(var k=0;k<LINKS.length && ok;k++)
      if(segDist(x,z, LINKS[k][0].x,LINKS[k][0].z, LINKS[k][1].x,LINKS[k][1].z) < 70) ok = false;
    if(!ok) continue;
    var sp = chance(0.12) ? 3 : ri(0,2);
    addTree(x,z,sp,null);
  }
})();
/* the far forest, out to the fog: positions only, drawn cheaply by the tree pass */
var FARTREES = [];
(function(){
  var tries=0;
  while(FARTREES.length < 210 && tries++ < 9000){
    var x = rr(-HW*0.96,HW*0.96), z = rr(-HW*0.96,HW*0.96);
    if(Math.abs(x) < 1500 && Math.abs(z) < 1500) continue;
    if(riverDist(x,z) < 110) continue;
    var ok=true;
    for(var i=0;i<FARTREES.length && ok;i++) if(Math.hypot(FARTREES[i].x-x,FARTREES[i].z-z) < 235) ok=false;
    if(ok){ var sp = chance(0.1)?3:ri(0,2), S=SPECIES[sp];
      FARTREES.push({ x:x, z:z, sp:sp, H:rr(S.H[0],S.H[1]), rb:rr(S.rb[0],S.rb[1]), crownR:rr(S.crownR[0],S.crownR[1]), crown0:S.crown0, seed:ri(1,1e6), y0:0 }); }
  }
})();
/* root mounds, then ground heights (mounds first: y0 must include them) */
TREES.forEach(function(T){ TERRAIN_MOUNDS.push([T.x, T.z, T.rb*3.4, 3.5]); });
TREES.forEach(function(T){ T.y0 = terrainH(T.x, T.z) - 1.5; });
FARTREES.forEach(function(T){ T.y0 = terrainH(T.x, T.z) - 1.5; });

/* ============================== PLATFORMS ============================== */
var PLATS = [], PIDX = {};
var LEVEL_SPEC = {
  apt   : { H:4.2, depth:9,  gw:3.6, label:'Apartments' },
  store : { H:5.2, depth:14, gw:3.6, label:'Storehouses' },
  work  : { H:5.2, depth:14, gw:3.6, label:'Workshops' },
  roost : { H:7.5, depth:13, gw:3.0, label:'Beast roosts' },
  hangar: { H:10,  depth:17, gw:3.0, label:'Beast hangars' },
  web   : { H:7.0, depth:14, gw:3.6, label:'Spider nests' }
};
function addPlat(o){
  o.id = PLATS.length; o.shape = o.shape||'round'; o.ry = o.ry||0; o.sx = o.sx||1; o.sz = o.sz||1;
  o.heads = []; o.bays = []; o.slots = []; o.rooms = []; o.subs = [];
  /* levels */
  var lv = [{ k:0, kind:'deck', y:o.y, H:0, Rout:o.R, gw:o.main?5:2.2, depth:0, Rin:o.rt, label:'Deck' }];
  var y = o.y, Rout = o.R;
  (o.below||[]).forEach(function(kind,i){
    var S = LEVEL_SPEC[kind];
    y -= SLAB + S.H; Rout -= (i===0 ? (o.main?4:1.6) : (o.main?3:1.2));
    var depth = Math.min(S.depth, Rout - S.gw - o.rt - 1.0);
    lv.push({ k:i+1, kind:kind, y:y, H:S.H, Rout:Rout, gw:S.gw, depth:depth, Rin:Rout-S.gw-depth, label:S.label });
  });
  o.levels = lv; o.yBottom = y - SLAB;
  PLATS.push(o); PIDX[o.name] = o; return o;
}
/* local polar -> world, honouring oval/square satellites. (r,a) are in the
   platform's own frame; for a round platform this is just centre + r(cos,sin). */
function platXZ(P, r, a){
  var lx = r*Math.cos(a)*P.sx, lz = r*Math.sin(a)*P.sz;
  if(P.shape === 'square'){
    var c=Math.cos(a), s=Math.sin(a), m=Math.max(Math.abs(c),Math.abs(s));
    lx = r*c/m; lz = r*s/m;
  }
  return loc(P.x, P.z, lx, lz, P.ry);
}
/* world heading of local polar angle a (for facing things outward) */
function platOutDir(P, a){ var p0=platXZ(P,1,a), p1=platXZ(P,2,a); var dx=p1[0]-p0[0], dz=p1[1]-p0[1], L=Math.hypot(dx,dz)||1; return [dx/L,dz/L]; }
function platAngleTo(P, x, z){           /* local polar angle that points at world (x,z) */
  /* inverse of loc(): wx = lx*cos+lz*sin, wz = -lx*sin+lz*cos */
  var dx=x-P.x, dz=z-P.z;
  var lx = dx*Math.cos(P.ry) - dz*Math.sin(P.ry), lz = dx*Math.sin(P.ry) + dz*Math.cos(P.ry);
  return Math.atan2(lz/P.sz, lx/P.sx);
}

var MAIN_Y = {};
function mainPlat(T, name, kind, R, y, below){
  var P = addPlat({ name:name, kind:kind, tree:T, main:true, x:T.x, z:T.z, y:y, R:R, rt:trunkR(T,y)+0.2, below:below });
  T.plat = P; return P;
}
var P_C  = mainPlat(T_C,  "Mav's Crown",      'central', 130, 205, ['store','work','store','work','store','hangar']);
var P_R1 = mainPlat(T_R1, 'Ghostwood Hold',   'res',      95, 188, ['apt','apt','apt','roost']);
var P_R2 = mainPlat(T_R2, 'Prism Hold',       'res',      98, 196, ['apt','apt','roost']);
var P_R3 = mainPlat(T_R3, 'Highbough',        'res',      95, 212, ['apt','apt','apt','roost']);
var P_RK = mainPlat(T_RK, 'The Rookery',      'rook',     84, 224, ['roost','roost','roost']);
var P_R4 = mainPlat(T_R4, 'Southbank Hold',   'res',      95, 184, ['apt','apt','roost']);
var P_R5 = mainPlat(T_R5, 'Riders’ Rest','res',      98, 192, ['apt','apt','apt','roost']);
var P_SP = mainPlat(T_SP, 'The Silk Loft',    'spider',   88, 178, ['web','web','web']);
var P_G1 = mainPlat(T_G1, 'Northwest Gate',   'gate',     86, 150, ['apt','roost']);
var P_G2 = mainPlat(T_G2, 'South Gate',       'gate',     86, 148, ['apt','roost']);
var P_G3 = mainPlat(T_G3, 'East Gate',        'gate',     86, 152, ['apt','roost']);
/* the council chamber: a second, smaller, higher platform on the central tree */
var P_CC = addPlat({ name:'Council Chamber', kind:'council', tree:T_C, main:false, councilOf:P_C,
                     x:T_C.x, z:T_C.z, y:P_C.y+64, R:46, rt:trunkR(T_C,P_C.y+64)+0.2, below:[] });
var MAINS = PLATS.filter(function(p){ return p.main; });

/* ============================== SATELLITES + BRIDGES ============================== */
var BRIDGES = [], BRANCH_REQ = [];
function nearestTreeFor(x,z,y){
  var best=null, bd=1e9;
  TREES.forEach(function(T){
    if(T.sp===3) return;                                   /* baobabs branch only at the crown */
    if(y > T.y0 + T.H*0.80) return;
    var d = Math.hypot(T.x-x, T.z-z);
    if(d < bd){ bd=d; best=T; }
  });
  return bd < 300 ? best : null;
}
function addSat(o){
  o.rt = 0.9; o.main = false;
  var P = addPlat(o);
  P.support = 'hang';                                    /* 32-branches.js decides: under | over | hang */
  return P;
}
function headAt(P, ang, w){
  var r = P.R - 0.4, p = platXZ(P, r, ang);
  var h = { plat:P, ang:ang, x:p[0], y:P.y, z:p[1], w:w };
  P.heads.push(h); return h;
}
function addBridge(A, B, w){
  var aA = platAngleTo(A, B.x, B.z), aB = platAngleTo(B, A.x, A.z);
  var ha = headAt(A, aA, w), hb = headAt(B, aB, w);
  var L = Math.hypot(hb.x-ha.x, hb.z-ha.z);
  var br = { a:ha, b:hb, L:L, w:w, sag: Math.max(1.2, L*0.045), id:BRIDGES.length };
  ha.bridge = br; hb.bridge = br;
  BRIDGES.push(br); return br;
}
/* height of a bridge deck at parameter t (0 at a, 1 at b) */
function bridgeY(br, t){ return mix(br.a.y, br.b.y, t) - br.sag*4*t*(1-t); }

/* chains of way-platforms along every main link */
LINKS.forEach(function(L, li){
  var A = L[0].plat, B = L[1].plat;
  var dx=B.x-A.x, dz=B.z-A.z, D=Math.hypot(dx,dz), ux=dx/D, uz=dz/D;
  var free = D - A.R - B.R;
  var spans = Math.max(2, Math.ceil(free/92)), m = spans-1;
  var prev = A;
  for(var i=1;i<=m;i++){
    var t = (A.R + free*i/spans)/D;
    var lat = rr(-16,16), R = rr(15,24);
    var over = riverDist(A.x+dx*t, A.z+dz*t) < 30;
    var S = addSat({ name:'Waystage '+(li+1)+'.'+i, kind:'sat', use: over?'waypost':pick(['homes','homes','mixed','farm']),
                     shape: chance(0.35)?'oval':'round', sx:1, sz:1, ry:rr(0,Math.PI),
                     x:A.x+dx*t - uz*lat, z:A.z+dz*t + ux*lat, y:mix(A.y,B.y,t)+rr(-5,5), R:R,
                     below: over ? [] : (chance(0.7) ? (chance(0.4)?['apt','apt']:['apt']) : []), link:li });
    if(S.shape==='oval'){ S.sx = rr(1.15,1.45); S.sz = 1/S.sx*rr(0.95,1.1); }
    addBridge(prev, S, 3.0);
    prev = S;
  }
  addBridge(prev, B, 3.0);
});
/* leaf satellites round each main platform: homes and farms on the near branches */
MAINS.forEach(function(P){
  var want = P.kind==='central' ? 5 : P.kind==='gate' ? 2 : ri(3,4), tries=0, made=0;
  while(made < want && tries++ < 80){
    var a = rr(0,TAU), ok = true;
    P.heads.forEach(function(h){ if(angDist(h.ang,a) < 0.55) ok=false; });
    if(!ok) continue;
    var R = rr(14,30), dist = P.R + R + rr(26,58);
    var x = P.x + Math.cos(a)*dist, z = P.z + Math.sin(a)*dist;
    PLATS.forEach(function(Q){ if(Q!==P && Math.hypot(Q.x-x,Q.z-z) < Q.R + R + 22) ok=false; });
    BRIDGES.forEach(function(b){ if(segDist(x,z,b.a.x,b.a.z,b.b.x,b.b.z) < R+8) ok=false; });
    if(!ok) continue;
    var shape = pick(['round','round','oval','square']);
    var use = pick(['homes','homes','farm','farm','mixed']);
    var S = addSat({ name:P.name+' bough '+(made+1), kind:'sat', use:use, shape:shape, ry:rr(0,Math.PI),
                     x:x, z:z, y:P.y + rr(-16,20), R:R, leafOf:P,
                     below: chance(0.75) ? (chance(0.45)?['apt','apt']:['apt']).concat(chance(0.3)?['roost']:[]) : (chance(0.4)?['roost']:[]) });
    if(shape==='oval'){ S.sx = rr(1.15,1.4); S.sz = 1/S.sx; }
    addBridge(P, S, 2.2);
    made++;
  }
});
var SATS = PLATS.filter(function(p){ return p.kind==='sat'; });

/* ============================== STAIR BAYS ==============================
   Three radial slots per main platform, as far from the bridgeheads as they
   can be. Each slot runs through every level: lane A carries the stairs
   (descending INWARD from each gallery), lane B the corridor back out. */
var LANE_W = 3.2;
function laneW(P){ return P.main ? LANE_W : 1.7; }
MAINS.forEach(function(P){
  var best=null, bs=-1;
  for(var k=0;k<48;k++){
    var a0 = k/48*TAU/3, sc = 1e9;
    for(var j=0;j<3;j++){
      var a = a0 + j*TAU/3;
      P.heads.forEach(function(h){ sc = Math.min(sc, angDist(h.ang, a)); });
    }
    if(sc > bs){ bs=sc; best=a0; }
  }
  for(var j2=0;j2<3;j2++) P.bays.push({ ang: best + j2*TAU/3, plat:P });
});
SATS.forEach(function(P){
  if(P.levels.length < 2) return;
  var a = rr(0,TAU), bs=-1;
  for(var k=0;k<24;k++){ var t=k/24*TAU, sc=1e9; P.heads.forEach(function(h){ sc=Math.min(sc,angDist(h.ang,t)); }); if(sc>bs){bs=sc;a=t;} }
  P.bays.push({ ang:a, plat:P });
});
/* stair geometry for bay B between level k and k+1 of platform P */
function stairOf(P, B, k){
  var L0 = P.levels[k], L1 = P.levels[k+1];
  var rise = L0.y - L1.y;
  var rTop = L0.Rout - L0.gw, run = P.main ? rise*1.45 : Math.min(rise*1.2, rTop - P.rt - 2.2);
  var rBot = rTop - run;
  var rm = (rTop+rBot)/2, dA = (laneW(P)*0.5+0.15)/Math.max(3,rm);
  return { rTop:rTop, rBot:rBot, yTop:L0.y, yBot:L1.y, angA:B.ang - dA, angB:B.ang + dA, run:run, rise:rise };
}
function bayHalfAngle(P, r){ return (LANE_W+0.5)/Math.max(6,r); }   /* half angular width of the whole slot at radius r */

/* ============================== DECK LOTS + ROOMS ============================== */
var LOT_KINDS_RES = ['home','home','home','fancy','fancy','shrine','shop','shop','tavern'];
function arcFree(P, r, width){
  /* angular intervals of the ring at radius r NOT taken by streets (bridgeheads + bays) */
  var cuts = [];
  P.heads.forEach(function(h){ cuts.push([h.ang, (h.w*0.5+2.4)/r]); });
  P.bays.forEach(function(b){ cuts.push([b.ang, (LANE_W+1.4)/r]); });
  cuts.sort(function(a,b){ return wrapPi(a[0]) - wrapPi(b[0]); });
  var out=[];
  for(var i=0;i<cuts.length;i++){
    var c0=cuts[i], c1=cuts[(i+1)%cuts.length];
    var a0 = wrapPi(c0[0]) + c0[1], a1 = wrapPi(c1[0]) - c1[1];
    if(i===cuts.length-1) a1 += TAU;
    if(a1 - a0 > width/r) out.push([a0,a1]);
  }
  if(!cuts.length) out.push([0,TAU]);
  return out;
}
MAINS.forEach(function(P){
  /* --- deck lots: a ring of pizza-slice buildings on the outer perimeter --- */
  var prom = P.levels[0].gw;                      /* outer promenade width */
  if(P.kind !== 'central'){
    var bd = P.kind==='rook' ? 16 : rr(13,17);
    var r1 = P.R - prom, r0 = r1 - bd;
    arcFree(P, r1, 9).forEach(function(iv){
      var arc = (iv[1]-iv[0])*r1, n = Math.max(1, Math.round(arc/rr(11,16))), da=(iv[1]-iv[0])/n;
      for(var i=0;i<n;i++){
        var gap = 0.7/r1;
        var kind = P.kind==='rook' ? pick(['barracks','barracks','armoury','mess']) :
                   P.kind==='gate' ? pick(['inn','barracks','store','home','shop']) :
                   P.kind==='spider'? pick(['home','home','silkhouse','shop','shrine']) : pick(LOT_KINDS_RES);
        P.slots.push({ plat:P, lvl:0, a0:iv[0]+i*da+gap, a1:iv[0]+(i+1)*da-gap, r0:r0 + (kind==='home'?rr(0,3):0), r1:r1,
                       y:P.y, kind:kind, floors:(kind==='fancy'||kind==='tavern'||kind==='inn'||kind==='barracks')?2:(chance(0.3)?2:1) });
      }
    });
  }
  /* --- rooms on the levels below --- */
  for(var k=1;k<P.levels.length;k++){
    var Lv = P.levels[k], rr1 = Lv.Rout - Lv.gw, rr0 = Lv.Rin;
    var want = Lv.kind==='apt' ? 8.5 : Lv.kind==='hangar' ? 15 : Lv.kind==='roost' ? 10 : 12;
    /* only the bays cut the lower levels */
    var cuts = P.bays.map(function(b){ return [wrapPi(b.ang), (LANE_W+0.9)/rr1]; }).sort(function(a,b){ return a[0]-b[0]; });
    for(var c=0;c<cuts.length;c++){
      var a0 = cuts[c][0]+cuts[c][1], a1 = cuts[(c+1)%cuts.length][0]-cuts[(c+1)%cuts.length][1];
      if(c===cuts.length-1) a1 += TAU;
      var n2 = Math.max(1, Math.round((a1-a0)*rr1/want)), da2=(a1-a0)/n2;
      for(var q=0;q<n2;q++)
        P.rooms.push({ plat:P, lvl:k, a0:a0+q*da2, a1:a0+(q+1)*da2, r0:rr0, r1:rr1, y:Lv.y, H:Lv.H, kind:Lv.kind });
    }
  }
});
/* satellites: a few free-standing lots on top, whole-ring rooms below */
SATS.forEach(function(P){
  if(P.use==='homes' || P.use==='mixed'){
    var n = P.R > 22 ? 3 : P.R > 17 ? 2 : 1, a = rr(0,TAU), placed=0, tries=0;
    while(placed<n && tries++<30){
      a += TAU/n + rr(-0.3,0.3);
      var ok=true; P.heads.forEach(function(h){ if(angDist(h.ang,a) < 0.75) ok=false; });
      if(!ok) continue;
      P.subs.push({ plat:P, ang:a, r:P.R*0.52, size:rr(5.5,8), kind:'hut' }); placed++;
    }
  }
  for(var k=1;k<P.levels.length;k++){
    var Lv=P.levels[k];
    P.rooms.push({ plat:P, lvl:k, a0:0, a1:TAU, r0:Lv.Rin, r1:Lv.Rout-Lv.gw, y:Lv.y, H:Lv.H, kind:Lv.kind, whole:true });
  }
});

/* ============================== SPIRALS: gate ramps + the council stair ============================== */
var SPIRALS = [], LIFTS = [], LADDERS = [];
function helixPoint(S, t){              /* t 0..1 from bottom to top */
  var y = mix(S.y0, S.y1, t), a = S.a0 + S.dir*S.turns*TAU*t;
  var r = trunkR(S.tree, y) + S.off;
  return { x:S.tree.x + Math.cos(a)*r, y:y, z:S.tree.z + Math.sin(a)*r, a:a, r:r };
}
[P_G1,P_G2,P_G3].forEach(function(P, gi){
  var T = P.tree, ground = T.y0 + 1.5;
  var yBot = ground + rr(31,36);                       /* "a good hundred feet or so off the ground" */
  var yTop = P.levels[P.levels.length-1].y;            /* the ramp arrives at the lowest level's gallery... */
  /* the ramp must END in lane B of bay 0 (that lane is tunnelled through to
     the trunk on a gate tree's lowest level), and should START facing away
     from the city so the landing looks out at the wild: solve the number of
     turns (2..3) that does both. */
  var dir = (gi%2?1:-1), kLow = P.levels.length-1;
  var aEnd = stairOf(P, P.bays[0], kLow-1).angB;
  var want = Math.atan2(T_C.z - T.z, T_C.x - T.x) + Math.PI;
  var fr = ((dir*(aEnd - want))/TAU) % 1; if(fr < 0) fr += 1;
  var turns = 2 + fr;
  var S = { id:SPIRALS.length, kind:'gate', tree:T, plat:P, y0:yBot, y1:yTop, turns:turns, dir:dir, a0:aEnd - dir*turns*TAU, off:3.2, w:5.2 };
  P.gatePassage = { ang:aEnd, r0:trunkR(T,yTop)+1.0, y:yTop, lvl:kLow };
  SPIRALS.push(S); P.spiral = S;
  var p0 = helixPoint(S,0);
  /* landing stage at the foot of the ramp, the beast-drawn lift and the rope ladders hang from it */
  /* the lift must drop CLEAR of the baobab's root flare (the bark pass swells the base by up to ~30%),
     so the landing stage is a broad jetty reaching out from the ramp foot to the lift */
  var liftR = Math.max(p0.r + 12.5, trunkR(T, ground)*1.32 + 7);
  var landR = (liftR - p0.r)/2 + 3.5, landC = liftR - landR - 1.6;
  S.landing = { x:T.x+Math.cos(S.a0)*landC, y:yBot, z:T.z+Math.sin(S.a0)*landC, a:S.a0, r:landR };
  var lx = T.x+Math.cos(S.a0)*liftR, lz = T.z+Math.sin(S.a0)*liftR;
  LIFTS.push({ id:LIFTS.length, plat:P, x:lx, z:lz, y0:terrainH(lx,lz)+0.3, y1:yBot, a:S.a0 });
  [-1,1].forEach(function(sg){
    var la = S.a0 + sg*0.20, x = T.x+Math.cos(la)*(liftR-2), z = T.z+Math.sin(la)*(liftR-2);
    LADDERS.push({ plat:P, x:x, z:z, y0:terrainH(x,z), y1:yBot });
  });
});
/* the council stair: round the central trunk from the plaza up to the chamber */
(function(){
  var S = { id:SPIRALS.length, kind:'council', tree:T_C, plat:P_CC, from:P_C, y0:P_C.y, y1:P_CC.y, turns:1.35, dir:1,
            a0: P_C.bays[0].ang + 0.5, off:2.6, w:3.6 };
  SPIRALS.push(S); P_CC.spiral = S;
})();

/* ============================== ROOSTS ============================== */
var ROOSTS = [];
PLATS.forEach(function(P){
  P.levels.forEach(function(Lv){
    if(Lv.kind!=='roost' && Lv.kind!=='hangar') return;
    var r = Lv.Rout - 1.2, step = Lv.kind==='hangar' ? 15 : 10.5;
    var n = Math.max(1, Math.floor(TAU*r*(P.sx+P.sz)/2/step));
    if(!P.main) n = Math.min(n, 2);
    /* the gallery posts (50-structure / 56-levels lvlPostCount): each roost sits in the MIDDLE of a gap between
       two of them, so a landing lip, and a beast walking in off it, never straddles a post */
    var np = P.main ? Math.round(TAU*Lv.Rout/5.2) : Math.max(6, Math.round(TAU*Lv.Rout/3.4)), stepA = TAU/np;
    for(var i=0;i<n;i++){
      var a = Math.round((i+0.5)/n*TAU/stepA)*stepA, skip=false;
      P.bays.forEach(function(b){ if(angDist(b.ang,a) < (LANE_W+2)/r) skip=true; });
      if(skip) continue;
      var p = platXZ(P, r, a), o = platOutDir(P, a);
      ROOSTS.push({ id:ROOSTS.length, plat:P, lvl:Lv.k, ang:a, x:p[0], y:Lv.y, z:p[1], ox:o[0], oz:o[1],
                    H:Lv.H, big:Lv.kind==='hangar' });
    }
  });
});

/* ============================== NAV GRAPH ==============================
   Nodes: {id,x,y,z,plat,lvl,tag}.  Edges: {a,b,len,kind,yfn?}.
   kinds: deck stair bridge spiral ladder ground.  Every walker reads this. */
var NAV = { nodes:[], edges:[], adj:[] };
function navNode(x,y,z,P,lvl,tag){
  var n = { id:NAV.nodes.length, x:x, y:y, z:z, plat:P?P.id:-1, lvl:lvl||0, tag:tag||'' };
  NAV.nodes.push(n); NAV.adj.push([]); return n;
}
function navEdge(a,b,kind,extra){
  if(!a || !b || a===b) return null;
  var e = { id:NAV.edges.length, a:a.id, b:b.id, kind:kind||'deck',
            len:Math.hypot(a.x-b.x, a.y-b.y, a.z-b.z) };
  if(extra) for(var k in extra) e[k]=extra[k];
  NAV.edges.push(e); NAV.adj[a.id].push(e.id); NAV.adj[b.id].push(e.id); return e;
}
function navRing(P, lvl, r, y, step, tag){
  var n = Math.max(6, Math.round(TAU*r/step)), ring=[];
  for(var i=0;i<n;i++){ var a=i/n*TAU, p=platXZ(P,r,a); var nd=navNode(p[0],y,p[1],P,lvl,tag); nd.ang=a; nd.r=r; ring.push(nd); }
  for(var j=0;j<n;j++) navEdge(ring[j], ring[(j+1)%n], 'deck');
  return ring;
}
function ringNearest(ring, ang){
  var best=ring[0], bd=1e9;
  ring.forEach(function(nd){ var d=angDist(nd.ang,ang); if(d<bd){bd=d;best=nd;} });
  return best;
}
/* insert a node ON a ring at an exact angle (so spokes are straight) */
function ringInsert(P, ring, ang, lvl, y, tag){
  var r = ring[0].r, p = platXZ(P, r, ang), nd = navNode(p[0],y,p[1],P,lvl,tag); nd.ang=ang; nd.r=r;
  /* link to the two angular neighbours */
  var lo=null, hi=null, dlo=1e9, dhi=1e9;
  ring.forEach(function(q){ var d=wrapPi(q.ang-ang); if(d<0 && -d<dlo){dlo=-d;lo=q;} if(d>=0 && d<dhi){dhi=d;hi=q;} });
  navEdge(nd, lo||ring[0], 'deck'); navEdge(nd, hi||ring[ring.length-1], 'deck');
  ring.push(nd); return nd;
}

PLATS.forEach(function(P){
  P.nav = { rings:[], heads:[], doors:[] };
  var L0 = P.levels[0];
  if(P.main || P.kind==='council'){
    if(P.kind==='council') P.holeR = P.rt + 5.2;          /* the stair comes up through this gap round the trunk */
    var inner = navRing(P, 0, P.rt + (P.kind==='council' ? 7.5 : 4.5), P.y, 11, 'trunkpath');
    var outer = navRing(P, 0, P.R - L0.gw*0.5, P.y, 13, 'promenade');
    P.nav.rings[0] = { inner:inner, outer:outer };
    /* streets: every bridgehead and every bay is a radial spoke */
    P.heads.forEach(function(h){
      var o = ringInsert(P, outer, h.ang, 0, P.y, 'street'), i2 = ringInsert(P, inner, h.ang, 0, P.y, 'street');
      var mid = platXZ(P, (P.rt+4.5 + P.R-L0.gw*0.5)/2, h.ang), m = navNode(mid[0],P.y,mid[1],P,0,'street');
      navEdge(o,m,'deck'); navEdge(m,i2,'deck');
      var hn = navNode(h.x, h.y, h.z, P, 0, 'bridgehead'); navEdge(hn, o, 'deck'); h.node = hn;
    });
    P.bays.forEach(function(B){
      /* lane B is the street proper on the deck */
      var st = P.levels.length>1 ? stairOf(P,B,0) : null, ab = st ? st.angB : B.ang;
      var o = ringInsert(P, outer, ab, 0, P.y, 'street'), i2 = ringInsert(P, inner, ab, 0, P.y, 'street');
      var mid = platXZ(P, (P.rt+4.5 + P.R-L0.gw*0.5)/2, ab), m = navNode(mid[0],P.y,mid[1],P,0,'street');
      navEdge(o,m,'deck'); navEdge(m,i2,'deck'); B.deckMid = m; B.deckOuter = o;
    });
    if(P.kind==='council'){
      /* the hall fills the ring between the two paths; its four doors are the spokes */
      P.hall = { r0:P.rt+10.5, r1:P.R-5.5, doors:[] };
      for(var hd=0; hd<4; hd++){
        var ha = P.spiral.a0 + hd*TAU/4 + 0.6;
        var ho = ringInsert(P, outer, ha, 0, P.y, 'street'), hi = ringInsert(P, inner, ha, 0, P.y, 'street');
        var hp = platXZ(P, P.hall.r1, ha), hn = navNode(hp[0],P.y,hp[1],P,0,'door');
        navEdge(ho,hn,'deck'); navEdge(hn,hi,'deck'); P.hall.doors.push(ha);
      }
    }
    /* lower galleries + stairs */
    for(var k=1;k<P.levels.length;k++){
      var Lv = P.levels[k];
      P.nav.rings[k] = { outer: navRing(P, k, Lv.Rout - Lv.gw*0.5, Lv.y, 12, 'gallery') };
    }
    P.bays.forEach(function(B){
      for(var k=0;k<P.levels.length-1;k++){
        var st = stairOf(P,B,k), Lv1 = P.levels[k+1];
        var pt = platXZ(P, st.rTop+0.6, st.angA), pb = platXZ(P, st.rBot-0.6, st.angA);
        var top = navNode(pt[0], st.yTop, pt[1], P, k, 'stairtop'), bot = navNode(pb[0], st.yBot, pb[1], P, k+1, 'stairfoot');
        navEdge(top, bot, 'stair');
        /* top joins its own level: the deck street (k=0) or the gallery ring */
        if(k===0){ navEdge(top, B.deckMid, 'deck'); navEdge(top, B.deckOuter, 'deck'); }
        else navEdge(top, ringInsert(P, P.nav.rings[k].outer, st.angA, k, st.yTop, 'gallery'), 'deck');
        /* foot -> across to lane B -> out along the corridor to the gallery below */
        var pc = platXZ(P, st.rBot-0.6, st.angB), cor = navNode(pc[0], st.yBot, pc[1], P, k+1, 'corridor');
        navEdge(bot, cor, 'deck'); (B.corridor || (B.corridor=[]))[k+1] = cor;
        navEdge(cor, ringInsert(P, P.nav.rings[k+1].outer, st.angB, k+1, Lv1.y, 'gallery'), 'deck');
      }
    });
  }else{
    /* satellites: a small ring, bridgeheads straight onto it */
    var ring = navRing(P, 0, Math.max(2.5, P.R*0.62), P.y, 9, 'satdeck');
    P.nav.rings[0] = { inner:ring, outer:ring };
    P.heads.forEach(function(h){
      var o = ringInsert(P, ring, h.ang, 0, P.y, 'street');
      var hn = navNode(h.x,h.y,h.z,P,0,'bridgehead'); navEdge(hn,o,'deck'); h.node = hn;
    });
    for(var k2=1;k2<P.levels.length;k2++){
      var Lv2 = P.levels[k2];
      P.nav.rings[k2] = { outer: navRing(P, k2, Math.max(2.2, Lv2.Rout - Lv2.gw*0.5), Lv2.y, 9, 'gallery') };
    }
    P.bays.forEach(function(B){
      for(var k=0;k<P.levels.length-1;k++){
        var st = stairOf(P,B,k);
        var pt = platXZ(P, st.rTop, st.angA), pb = platXZ(P, st.rBot, st.angA);
        var top = navNode(pt[0], st.yTop, pt[1], P, k, 'stairtop'), bot = navNode(pb[0], st.yBot, pb[1], P, k+1, 'stairfoot');
        navEdge(top, bot, 'stair');
        navEdge(top, ringNearest(k===0?ring:P.nav.rings[k].outer, st.angA), 'deck');
        navEdge(bot, ringNearest(P.nav.rings[k+1].outer, st.angB), 'deck');
      }
    });
  }
  /* doors: deck lots open inward onto the plaza AND outward onto the promenade */
  P.slots.forEach(function(S){
    var am=(S.a0+S.a1)/2, pi=platXZ(P, S.r0-1.0, am), po=platXZ(P, S.r1+0.9, am);
    var di = navNode(pi[0],P.y,pi[1],P,0,'door'); di.slot=S; S.doorIn=di;
    navEdge(di, ringNearest(P.nav.rings[0].inner, am), 'deck');
    var dn = navNode(po[0],P.y,po[1],P,0,'door'); dn.slot=S; S.doorOut=dn;
    navEdge(dn, ringNearest(P.nav.rings[0].outer, am), 'deck');
    P.nav.doors.push(di, dn);
  });
  P.rooms.forEach(function(R){
    if(R.whole || R.kind==='roost' || R.kind==='hangar') return;
    var am=(R.a0+R.a1)/2, pd=platXZ(P, R.r1+0.7, am);
    var d = navNode(pd[0], R.y, pd[1], P, R.lvl, 'door'); d.room=R; R.door=d;
    navEdge(d, ringNearest(P.nav.rings[R.lvl].outer, am), 'deck'); P.nav.doors.push(d);
  });
  P.subs.forEach(function(S){
    var p = platXZ(P, S.r - S.size*0.5 - 0.8, S.ang), d = navNode(p[0],P.y,p[1],P,0,'door'); d.sub=S; S.door=d;
    navEdge(d, ringNearest(P.nav.rings[0].inner, S.ang), 'deck'); P.nav.doors.push(d);
  });
});
/* bridges */
BRIDGES.forEach(function(br){ br.edge = navEdge(br.a.node, br.b.node, 'bridge', { bridge:br.id }); });
/* spirals */
SPIRALS.forEach(function(S){
  var n = Math.max(8, Math.round(S.turns*28)), prev=null; S.nodes=[];
  for(var i=0;i<=n;i++){
    var h = helixPoint(S, i/n), nd = navNode(h.x,h.y,h.z,S.plat,-1,'spiral'); nd.spiral=S.id; nd.t=i/n;
    if(prev) navEdge(prev, nd, 'spiral'); prev = nd; S.nodes.push(nd);
  }
  if(S.kind==='gate'){
    var P=S.plat, kLow=P.levels.length-1;
    navEdge(S.nodes[n], P.bays[0].corridor[kLow], 'deck');
    var ln = navNode(S.landing.x, S.landing.y, S.landing.z, P, -1, 'landing'); navEdge(ln, S.nodes[0], 'deck'); S.landing.node = ln;
  }else{
    navEdge(S.nodes[0], ringNearest(S.from.nav.rings[0].inner, platAngleTo(S.from, S.nodes[0].x, S.nodes[0].z)), 'deck');
    navEdge(S.nodes[n], ringNearest(S.plat.nav.rings[0].inner, platAngleTo(S.plat, S.nodes[n].x, S.nodes[n].z)), 'deck');
  }
});
/* ladders + lifts + a small ground yard under each gate */
LADDERS.forEach(function(Ld){
  var S = Ld.plat.spiral, g = navNode(Ld.x, Ld.y0, Ld.z, null, -2, 'ground');
  var t = navNode(Ld.x, Ld.y1, Ld.z, Ld.plat, -1, 'laddertop');
  navEdge(g, t, 'ladder'); navEdge(t, S.landing.node, 'deck'); Ld.ground = g;
});
LIFTS.forEach(function(Lf){
  var g = navNode(Lf.x, Lf.y0, Lf.z, null, -2, 'ground'); Lf.ground = g;
  LADDERS.forEach(function(Ld){ if(Ld.plat===Lf.plat) navEdge(g, Ld.ground, 'ground'); });
});

/* connectivity check: every node reachable from the central plaza */
(function(){
  var seen = new Uint8Array(NAV.nodes.length), q=[P_C.nav.rings[0].inner[0].id]; seen[q[0]]=1; var c=1;
  while(q.length){ var u=q.pop(); NAV.adj[u].forEach(function(eid){ var e=NAV.edges[eid], v=e.a===u?e.b:e.a; if(!seen[v]){seen[v]=1;c++;q.push(v);} }); }
  NAV.reachable = c;
})();

window._layout = { trees:TREES.length, occupied:OCC_N, far:FARTREES.length, plats:PLATS.length, mains:MAINS.length,
                   sats:SATS.length, bridges:BRIDGES.length, branchReq:BRANCH_REQ.length, roosts:ROOSTS.length,
                   slots:PLATS.reduce(function(s,p){return s+p.slots.length;},0),
                   rooms:PLATS.reduce(function(s,p){return s+p.rooms.length;},0),
                   navNodes:NAV.nodes.length, navEdges:NAV.edges.length, navReachable:NAV.reachable,
                   longestBridge:Math.round(BRIDGES.reduce(function(m,b){return Math.max(m,b.L);},0)),
                   satsOverRiver:SATS.filter(function(s){return riverDist(s.x,s.z)<0;}).length };
