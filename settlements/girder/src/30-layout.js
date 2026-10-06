/* ============================== 5. LAYOUT — GIRDER ==============================
   PLANNER-OWNED. Decides where everything is; builds no geometry.
   Girder is one ancient structure: four identical 30-storey open-floored
   towers on a perfect square, re-inhabited by the beast-riders at the bottom
   six and top five floors, ringed at the top by timber roost decks joined by
   rope bridges, standing in a palisaded terrace of farms.
   Outputs (read-only to every later fragment):
     SPECIES TREES FARTREES trunkR()         the (smaller) hypertrees round the clearing
     TOWERS[4]   T.floors[k], T.bays, T.stair, T.lift, T.deck
     SLOTS[]     dwelling lots inside the towers        HOUSES[] PLOTS[] STALLS[] HALL PALISADE GATES[]
     PLATS[4]    the roost decks (Mav's-compatible records, for the flyers)
     BRIDGES[] LIFTS[] ROOSTS[] CLEARINGS[] NAV                               */
reseed(300001);

var SLAB = 1.0;                                      /* the ancients' floor plates */
var SPECIES = [
  { name:'Ironbark',    H:[215,270], rb:[15,18], crown0:0.50, crownR:[100,130] },
  { name:'Ghostwood',   H:[200,250], rb:[12,14], crown0:0.46, crownR:[90,115] },
  { name:'Prism gum',   H:[190,240], rb:[13,16], crown0:0.52, crownR:[110,140] },
  { name:'Gate baobab', H:[150,175], rb:[21,25], crown0:0.80, crownR:[70,90],
    /* what the tree yields (biomes/FRUIT.md): the hanging pods are gatepods, the catalog's generic_fruit_gatepod */
    harvest:{ fruit:'Gatepod', key:'generic_fruit_gatepod' } }
];
function trunkR(T, y){
  var yy = Math.max(0, y - T.y0), u = clamp(yy/T.H, 0, 1), r;
  if(T.sp === 3){
    var b = u<0.15 ? 1.0 : u<0.35 ? mix(1.0,1.08,(u-0.15)/0.20) : u<0.60 ? mix(1.08,0.92,(u-0.35)/0.25)
          : u<0.78 ? mix(0.92,0.64,(u-0.60)/0.18) : mix(0.64,0.10,smooth(0.78,1.0,u));
    r = T.rb*b*(1 + 0.38*Math.exp(-yy/6));
  }else{
    var t = u<0.62 ? 1 - 0.42*u : mix(0.74, 0.07, smooth(0.62,1.0,u));
    r = T.rb*t*(1 + 0.80*Math.exp(-yy/10));
  }
  return r;
}

/* generic polar frame (kept from Mav's Refuge: SECTOR and friends address geometry through it) */
function platXZ(P, r, a){ return loc(P.x, P.z, r*Math.cos(a)*(P.sx||1), r*Math.sin(a)*(P.sz||1), P.ry||0); }
function platOutDir(P, a){ var p0=platXZ(P,1,a), p1=platXZ(P,2,a), dx=p1[0]-p0[0], dz=p1[1]-p0[1], L=Math.hypot(dx,dz)||1; return [dx/L,dz/L]; }

/* ============================== THE RUIN ============================== */
var TOWER_HALF = 24, TOWER_N = 30, TOWER_FH = 5.0, TOWER_OFF = 60;      /* 48 m square, 30 storeys of 5 m, centres at +-60 */
var COL_LINES = [-24+1.6, -8, 8, 24-1.6];                                 /* 4x4 cyclopean columns, 3.2 m square */
var CORE_HALF = 8;                                                        /* the centre bay: stairs */
var GALLERY_IN = 19.6;                                                    /* rooms stop here; the open gallery runs outside it */
var GALLERY_WALK = GALLERY_IN + 0.6;   /* the gallery's walk loop: between the rooms' fronts and the columns' inner faces (20.8), not on the column line */
var DECK_W = 15, DECK_K = 29;                                             /* roost deck: width, and the floor it is level with */
var FLOOR_USE = (function(){
  var d=[]; for(var k=0;k<TOWER_N;k++) d.push(0);
  [1,1,0.85,0.62,0.42,0.24].forEach(function(v,k){ d[k]=v; });
  [0.24,0.42,0.64,0.88,1].forEach(function(v,i){ d[25+i]=v; });
  return d;
})();
var TOWERS = [], SLOTS = [], PLATS = [], PIDX = {}, BRIDGES = [], LIFTS = [], LADDERS = [], SPIRALS = [], ROOSTS = [], SATS = [], MAINS = [];
var TOWER_NAMES = ['North-west Tower','North-east Tower','South-east Tower','South-west Tower'];
[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(sg, i){
  var T = { id:i, name:TOWER_NAMES[i], x:sg[0]*TOWER_OFF, z:sg[1]*TOWER_OFF, sx:sg[0], sz:sg[1], half:TOWER_HALF, y0:SETTLE_Y,
            floors:[], top:0 };
  for(var k=0;k<=TOWER_N;k++){
    T.floors.push({ k:k, y:SETTLE_Y + 0.6 + k*TOWER_FH, H:TOWER_FH-SLAB, use:k<TOWER_N?FLOOR_USE[k]:0,
                    kind: k===TOWER_N ? 'roof' : FLOOR_USE[k] > 0 ? 'inhabited' : 'wild',
                    /* the top plates were never finished (or have fallen): which of the 9 bays exist */
                    missing: [] });
  }
  T.top = T.floors[TOWER_N].y;
  /* ragged top: the roof plate and the floor under it lose bays, differently per tower */
  var bays=[]; for(var bi=-1;bi<=1;bi++) for(var bj=-1;bj<=1;bj++) if(bi||bj) bays.push([bi,bj]);
  shuffle(bays); T.floors[TOWER_N].missing = bays.slice(0, 4+i%2).map(function(b){ return b[0]+','+b[1]; });
  TOWERS.push(T);
});
function towerAt(x,z,margin){ for(var i=0;i<TOWERS.length;i++){ var T=TOWERS[i]; if(Math.abs(x-T.x)<T.half+(margin||0) && Math.abs(z-T.z)<T.half+(margin||0)) return T; } return null; }

/* ---- dwelling lots: timber rooms built into the open floors, set back behind the gallery ---- */
var SLOT_KINDS = ['home','home','home','home','store','workshop','common','shrine'];
TOWERS.forEach(function(T){
  T.floors.forEach(function(F){
    if(F.kind!=='inhabited') return;
    /* the 8 perimeter bays, two lots each; (ox,oz) is the way the lot's door faces = outward */
    for(var bi=-1;bi<=1;bi++) for(var bj=-1;bj<=1;bj++){
      if(!bi && !bj) continue;
      var faces = []; if(bi) faces.push([bi,0]); if(bj) faces.push([0,bj]);
      var f = faces[ (bi && bj) ? ((F.k + bi + 2*bj + 8) % 2) : 0 ];
      var corner = !!(bi && bj), inner = 8.6, outer = GALLERY_IN, mid = (inner+outer)/2, deep = outer-inner;
      for(var h=-1; h<=1; h+=2){
        if(corner && h===1) continue;                                      /* one lot per corner bay, two per side bay */
        if(rnd() > F.use) continue;
        var westMid = (bi===-1 && bj===0);                                 /* this bay keeps the stair corridor clear down its middle */
        var wide = corner ? deep : (westMid ? 6.0 : 7.4), off = corner ? 0 : h*(westMid ? 5.4 : 4.1);
        var cx, cz, w, d;
        if(f[0]){ cx = f[0]*mid; cz = corner ? bj*mid : off; w = deep; d = wide; }
        else    { cz = f[1]*mid; cx = corner ? bi*mid : off; d = deep; w = wide; }
        SLOTS.push({ id:SLOTS.length, tower:T, k:F.k, x:T.x+cx, z:T.z+cz, y:F.y, w:w, d:d, H:F.H, ox:f[0], oz:f[1],
                     kind: F.k===0 ? pick(['store','workshop','store','common','home']) : pick(SLOT_KINDS),
                     high: F.k >= 25 });
      }
    }
  });
});

/* ---- core stairs: a switchback in the centre bay, two flights per storey ---- */
function stairPts(T, k){            /* the four walking points of storey k -> k+1 */
  var y=T.floors[k].y, y1=T.floors[k+1].y;
  return [ [T.x-5.2, y, T.z-2.6], [T.x+5.2, (y+y1)/2, T.z-2.6], [T.x+5.2, (y+y1)/2, T.z+2.6], [T.x-5.2, y1, T.z+2.6] ];
}

/* ---- the roost decks: a timber ring round each tower at the top floor ---- */
TOWERS.forEach(function(T){
  var y = T.floors[DECK_K].y, R = T.half + DECK_W;
  var P = { id:PLATS.length, name:T.name+' roost deck', kind:'roostdeck', main:true, tower:T, tree:null, x:T.x, z:T.z, y:y,
            R:R*1.2, half:R, inner:T.half, rt:T.half, shape:'squarering', ry:0, sx:1, sz:1, yBottom:y-9,
            levels:[{ k:0, kind:'roost', y:y, H:7.0, Rout:R, gw:5.5, depth:DECK_W-5.5, Rin:T.half, label:'Roost deck' }],
            heads:[], bays:[], slots:[], rooms:[], subs:[] };
  PLATS.push(P); PIDX[P.name]=P; MAINS.push(P); T.deck=P;
});
/* bridges between neighbouring decks: heads at the middle of the facing sides */
function deckHead(P, ox, oz, w){ var h={ plat:P, ox:ox, oz:oz, ang:Math.atan2(oz,ox), x:P.x+ox*(P.half-0.4), y:P.y, z:P.z+oz*(P.half-0.4), w:w }; P.heads.push(h); return h; }
function bridgeY(br, t){ return mix(br.a.y, br.b.y, t) - br.sag*4*t*(1-t); }
[[0,1],[1,2],[2,3],[3,0]].forEach(function(pr){
  var A=PLATS[pr[0]], B=PLATS[pr[1]], dx=Math.sign(B.x-A.x), dz=Math.sign(B.z-A.z);
  var ha=deckHead(A,dx,dz,3.0), hb=deckHead(B,-dx,-dz,3.0), L=Math.hypot(hb.x-ha.x,hb.z-ha.z);
  var br={ id:BRIDGES.length, a:ha, b:hb, L:L, w:3.0, sag:Math.max(1.2,L*0.05) }; ha.bridge=br; hb.bridge=br; BRIDGES.push(br);
});
/* roost stalls: open bays along the deck's outer edge, facing out; none across a bridgehead or the lift notch */
TOWERS.forEach(function(T){
  var P=T.deck, n=7, step=(2*P.half)/n;
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(f){
    for(var i=0;i<n;i++){
      var t = -P.half + (i+0.5)*step, px = f[0] ? f[0]*(P.half-1.4) : t, pz = f[1] ? f[1]*(P.half-1.4) : t;
      var blocked=false; P.heads.forEach(function(h){ if(h.ox===f[0] && h.oz===f[1] && Math.abs(t) < step*0.55) blocked=true; });
      if(Math.abs(t) > P.half - DECK_W*0.55) blocked = true;                 /* corners stay open landing aprons */
      if(blocked) continue;
      ROOSTS.push({ id:ROOSTS.length, plat:P, lvl:0, ang:Math.atan2(f[1],f[0]), x:P.x+px, y:P.y, z:P.z+pz, ox:f[0], oz:f[1], H:7.0, big:false, w:step });
    }
  });
});
/* beast-drawn lifts: one per tower, on the face that looks into the court along x */
TOWERS.forEach(function(T){
  var ox=-T.sx, lx=T.x+ox*(T.half+2.4), lz=T.z + T.sz*(-13);
  var Lf={ id:LIFTS.length, tower:T, plat:T.deck, x:lx, z:lz, y0:SETTLE_Y+0.3, y1:T.deck.y, a:Math.atan2(0,ox), ox:ox, oz:0,
           capstan:{ x:lx+ox*11, z:lz, y:SETTLE_Y, r:5 } };
  LIFTS.push(Lf); T.lift=Lf;
});

/* no roost stall where a lift comes up through the deck */
(function(){ var keep = ROOSTS.filter(function(R){ var Lf=R.plat.tower.lift; return !(R.ox===Lf.ox && R.oz===0 && Math.abs(R.z-Lf.z) < 9); });
  ROOSTS.length = 0; keep.forEach(function(R,i){ R.id=i; ROOSTS.push(R); }); })();

/* ============================== THE TERRACE ============================== */
var PAL_R = 200;
var PALISADE = { R:PAL_R, h:5.2 };
var GATES = [ { name:'North Gate', x:0, z:-PAL_R, a:-Math.PI/2 }, { name:'South Gate', x:0, z:PAL_R, a:Math.PI/2 } ];
var HALL = { name:'Assembly Hall', x:0, z:0, R:15.5 };
var BLOCK = 92;                                           /* the square the towers + court occupy; the ring road runs round it */
var ROADS = [];                                           /* [x0,z0,x1,z1,w] painted + kept clear */
ROADS.push([0,-PAL_R,0,-HALL.R-7,8],[0,PAL_R,0,HALL.R+7,8],[-(PAL_R-10),0,-HALL.R-7,0,6],[PAL_R-10,0,HALL.R+7,0,6]);
ROADS.push([-BLOCK,-BLOCK,BLOCK,-BLOCK,6],[BLOCK,-BLOCK,BLOCK,BLOCK,6],[BLOCK,BLOCK,-BLOCK,BLOCK,6],[-BLOCK,BLOCK,-BLOCK,-BLOCK,6]);
function onRoad(x,z,m){ for(var i=0;i<ROADS.length;i++){ var r=ROADS[i]; if(segDist(x,z,r[0],r[1],r[2],r[3]) < r[4]/2+(m||0)) return true; } return Math.abs(Math.hypot(x,z)-(PAL_R-8)) < 3+(m||0); }
/* farm plots + house lots on the ancients' own grid, between the ring road and the palisade */
var PLOTS = [], HOUSES = [], STALLS = [];
(function(){
  var cw=30, cd=24, kinds=['crop','crop','crop','paddy','orchard','garden','pen','crop'];
  for(var gx=-195; gx<195; gx+=cw) for(var gz=-192; gz<192; gz+=cd){
    var x=gx+cw/2, z=gz+cd/2, w=cw-4, d=cd-4, ok=true;
    [[-1,-1],[1,-1],[1,1],[-1,1],[0,0]].forEach(function(c){ var px=x+c[0]*w/2, pz=z+c[1]*d/2;
      if(Math.hypot(px,pz) > PAL_R-14) ok=false; if(Math.abs(px)<BLOCK+5 && Math.abs(pz)<BLOCK+5) ok=false; if(onRoad(px,pz,1.5)) ok=false; });
    if(!ok) continue;
    var nearRoad = Math.min(Math.abs(Math.abs(x)-BLOCK), Math.abs(Math.abs(z)-BLOCK)) < 26 || Math.abs(x)<22 || Math.abs(z)<20;
    if(nearRoad && HOUSES.length < 14 && chance(0.30)){
      HOUSES.push({ id:HOUSES.length, x:x, z:z, w:w, d:d, y:SETTLE_Y, kind:pick(['roundhut','roundhut','joglo','longhouse','joglo']), ry:0 });
    }else PLOTS.push({ id:PLOTS.length, x:x, z:z, w:w, d:d, y:SETTLE_Y, kind:pick(kinds) });
  }
  /* the small market: stalls in the court round the hall and up the two avenues between the towers */
  for(var i=0;i<22;i++){
    var a=i/22*TAU+0.14, r = (i%2) ? 27 : 33, sx=Math.cos(a)*r, sz=Math.sin(a)*r;
    if(onRoad(sx,sz,2.6)) continue;
    STALLS.push({ id:STALLS.length, x:sx, z:sz, ry:Math.atan2(sx, sz) + Math.PI, y:SETTLE_Y });
  }
})();
/* everything the forest passes must keep out of */
var CLEARINGS = [[0,0,PALISADE.R+16]];

/* ============================== THE FOREST ============================== */
var TREES = [], T_C = null;
function addTree(x,z,sp){
  var S=SPECIES[sp];
  var T={ id:TREES.length, x:x, z:z, sp:sp, role:null, H:rr(S.H[0],S.H[1]), rb:rr(S.rb[0],S.rb[1]), crownR:rr(S.crownR[0],S.crownR[1]), crown0:S.crown0, seed:ri(1,1e6), y0:0 };
  TREES.push(T); return T;
}
(function(){
  var tries=0, LIM=1350;
  while(TREES.length < 46 && tries++ < 8000){
    var x=rr(-LIM,LIM), z=rr(-LIM,LIM), r0=Math.hypot(x,z);
    if(r0 < PALISADE.R + 62) continue;                                   /* the clearing: crowns may overhang the palisade, trunks may not crowd it */
    if(riverDist(x,z) < 34) continue;
    var ok=true; for(var i=0;i<TREES.length && ok;i++) if(Math.hypot(TREES[i].x-x,TREES[i].z-z) < 165) ok=false;
    GATES.forEach(function(g){ if(segDist(x,z,g.x,g.z,g.x*2.2,g.z*2.2) < 40) ok=false; });   /* the two gate tracks stay open */
    if(!ok) continue;
    addTree(x,z, chance(0.12)?3:ri(0,2));
  }
})();
var FARTREES = [];
(function(){
  var tries=0;
  while(FARTREES.length < 260 && tries++ < 12000){
    var x=rr(-HW*0.96,HW*0.96), z=rr(-HW*0.96,HW*0.96);
    if(Math.abs(x)<1450 && Math.abs(z)<1450) continue;
    if(riverDist(x,z) < 40) continue;
    var ok=true; for(var i=0;i<FARTREES.length && ok;i++) if(Math.hypot(FARTREES[i].x-x,FARTREES[i].z-z) < 190) ok=false;
    if(ok){ var sp=chance(0.1)?3:ri(0,2), S=SPECIES[sp];
      FARTREES.push({ x:x, z:z, sp:sp, H:rr(S.H[0],S.H[1]), rb:rr(S.rb[0],S.rb[1]), crownR:rr(S.crownR[0],S.crownR[1]), crown0:S.crown0, seed:ri(1,1e6), y0:0 }); }
  }
})();
TREES.forEach(function(T){ TERRAIN_MOUNDS.push([T.x,T.z,T.rb*3.4,2.4]); });
TREES.forEach(function(T){ T.y0 = terrainH(T.x,T.z) - 1.5; });
FARTREES.forEach(function(T){ T.y0 = terrainH(T.x,T.z) - 1.5; });

/* ============================== NAV GRAPH ==============================
   nodes {id,x,y,z,plat,lvl,tag,...}; edges {id,a,b,len,kind}
   kinds: ground deck stair bridge lift.  tags: road gate field housedoor halldoor market
   towerdoor gallery door core stair deckwalk bridgehead roost liftfoot lifthead patrol */
var NAV = { nodes:[], edges:[], adj:[] };
function navNode(x,y,z,P,lvl,tag){ var n={ id:NAV.nodes.length, x:x, y:y, z:z, plat:P?P.id:-1, lvl:lvl||0, tag:tag||'' }; NAV.nodes.push(n); NAV.adj.push([]); return n; }
function navEdge(a,b,kind,extra){
  if(!a||!b||a===b) return null;
  var e={ id:NAV.edges.length, a:a.id, b:b.id, kind:kind||'ground', len:Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z) };
  if(extra) for(var k in extra) e[k]=extra[k];
  NAV.edges.push(e); NAV.adj[a.id].push(e.id); NAV.adj[b.id].push(e.id); return e;
}
function navNearest(list, x, z){ var b=null, bd=1e9; list.forEach(function(n){ var d=Math.hypot(n.x-x,n.z-z); if(d<bd){bd=d;b=n;} }); return b; }
var NAV_GY = SETTLE_Y + 0.05, NAVROAD = [];
(function(){
  /* --- roads: a node every ~12 m along each road, joined where roads meet --- */
  ROADS.forEach(function(r){
    var L=Math.hypot(r[2]-r[0],r[3]-r[1]), n=Math.max(1,Math.round(L/12)), prev=null;
    for(var i=0;i<=n;i++){ var t=i/n, x=mix(r[0],r[2],t), z=mix(r[1],r[3],t);
      var ex=navNearest(NAVROAD,x,z), nd = (ex && Math.hypot(ex.x-x,ex.z-z)<3.5) ? ex : navNode(x,NAV_GY,z,null,-2,'road');
      if(nd!==ex) NAVROAD.push(nd); if(prev) navEdge(prev,nd,'ground'); prev=nd; }
  });
  /* join roads where they cross (nodes of different roads closer than a node spacing) */
  for(var qa=0;qa<NAVROAD.length;qa++) for(var qb=qa+1;qb<NAVROAD.length;qb++){ var na=NAVROAD[qa], nb=NAVROAD[qb];
    if(Math.hypot(na.x-nb.x,na.z-nb.z)<8.5 && !NAV.adj[na.id].some(function(ei){ var e=NAV.edges[ei]; return e.a===nb.id||e.b===nb.id; })) navEdge(na,nb,'ground'); }
  /* the hall's ring walk joins the four avenues */
  var hring=[]; for(var i=0;i<12;i++){ var a=i/12*TAU; hring.push(navNode(Math.cos(a)*(HALL.R+7),NAV_GY,Math.sin(a)*(HALL.R+7),null,-2,'road')); }
  hring.forEach(function(n,i){ navEdge(n,hring[(i+1)%12],'ground'); });
  [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(d){ navEdge(navNearest(NAVROAD,d[0]*(HALL.R+7),d[1]*(HALL.R+7)), navNearest(hring,d[0]*30,d[1]*30),'ground'); });
  hring.forEach(function(n){ NAVROAD.push(n); });
  HALL.doors=[]; [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(d){ var nd=navNode(d[0]*(HALL.R+0.8),NAV_GY,d[1]*(HALL.R+0.8),null,-2,'halldoor'); navEdge(nd,navNearest(hring,d[0]*30,d[1]*30),'ground'); HALL.doors.push(nd); });
  /* the patrol walk just inside the palisade, tied to the roads at the gates and posterns */
  var pr=[]; for(var j=0;j<72;j++){ var a2=j/72*TAU; pr.push(navNode(Math.cos(a2)*(PAL_R-8),NAV_GY,Math.sin(a2)*(PAL_R-8),null,-2,'patrol')); }
  pr.forEach(function(n,j){ navEdge(n,pr[(j+1)%72],'ground'); }); PALISADE.walk = pr;
  [[0,-(PAL_R-8)],[0,PAL_R-8],[-(PAL_R-10),0],[PAL_R-10,0]].forEach(function(p){ navEdge(navNearest(pr,p[0],p[1]), navNearest(NAVROAD,p[0],p[1]),'ground'); });
  GATES.forEach(function(g){ g.node=navNode(g.x,NAV_GY,g.z,null,-2,'gate'); navEdge(g.node,navNearest(NAVROAD,g.x,g.z),'ground');
    g.out=navNode(g.x*1.22,terrainH(g.x*1.22,g.z*1.22),g.z*1.22,null,-2,'gate'); navEdge(g.node,g.out,'ground'); });
  /* fields, houses, stalls hang off the nearest road or patrol node */
  var trunk = NAVROAD.concat(pr);
  PLOTS.forEach(function(p){ p.node=navNode(p.x,NAV_GY,p.z,null,-2,'field'); p.node.plot=p.id;
    var e=navNode(p.x + (Math.abs(p.x)>Math.abs(p.z)? -Math.sign(p.x):0)*p.w/2, NAV_GY, p.z + (Math.abs(p.x)>Math.abs(p.z)?0:-Math.sign(p.z))*p.d/2, null,-2,'field');
    /* the edge node is in the fence's gate gap (55-arch.js); an apron node 1.5 m outside it keeps the link to the
       road from running back along or through the fence */
    var ox=(Math.abs(p.x)>Math.abs(p.z)? -Math.sign(p.x):0), oz=(Math.abs(p.x)>Math.abs(p.z)?0:-Math.sign(p.z)),
        ap=navNode(e.x+ox*1.5, NAV_GY, e.z+oz*1.5, null,-2,'field');
    navEdge(p.node,e,'ground'); navEdge(e,ap,'ground'); navEdge(ap,navNearest(trunk,ap.x,ap.z),'ground'); p.edge=e; });
  if(HOUSES.length && !HOUSES.some(function(h){ return h.kind==='longhouse'; })) HOUSES.slice().sort(function(a,b){ return b.w*b.d-a.w*a.d; })[0].kind='longhouse';
  HOUSES.forEach(function(h){ var nr=navNearest(NAVROAD,h.x,h.z), dx=nr.x-h.x, dz=nr.z-h.z;
    if(Math.abs(dx)>Math.abs(dz)){ h.ox=Math.sign(dx); h.oz=0; } else { h.ox=0; h.oz=Math.sign(dz); }
    h.door=navNode(h.x+h.ox*(h.w/2-3), NAV_GY, h.z+h.oz*(h.d/2-3), null,-2,'housedoor'); h.door.house=h.id;
    /* out through the yard's gate (the fence gap on the door side, 55-arch.js) before turning for the road */
    var ap=navNode(h.x+h.ox*(h.w/2+1.2), NAV_GY, h.z+h.oz*(h.d/2+1.2), null,-2,'housedoor');
    navEdge(h.door,ap,'ground'); navEdge(ap,nr,'ground'); });
  STALLS.forEach(function(s){ s.node=navNode(s.x - Math.sin(s.ry)*0 + (-s.x/Math.hypot(s.x,s.z))*3, NAV_GY, s.z + (-s.z/Math.hypot(s.x,s.z))*3, null,-2,'market'); navEdge(s.node,navNearest(hring,s.x,s.z),'ground'); });

  /* --- towers --- */
  TOWERS.forEach(function(T){
    T.nav={ gallery:[], core:[] };
    /* stairs: every storey, inhabited or not */
    var prevTop=null;
    for(var k=0;k<TOWER_N;k++){
      var sp=stairPts(T,k), F=T.floors[k];
      /* the last flight climbs to the ragged roof plate, which has no floor over the core: the graph stops at the
         top storey's core node */
      if(k===TOWER_N-1){ var nt=navNode(sp[0][0],sp[0][1],sp[0][2],T.deck,k,'core'); if(prevTop) navEdge(prevTop,nt,'deck'); T.nav.core[k]=nt; break; }
      var n0=navNode(sp[0][0],sp[0][1],sp[0][2],T.deck,k,'core'), n1=navNode(sp[1][0],sp[1][1],sp[1][2],T.deck,k,'stair'),
          n2=navNode(sp[2][0],sp[2][1],sp[2][2],T.deck,k,'stair'), n3=navNode(sp[3][0],sp[3][1],sp[3][2],T.deck,k+1,'stair');
      navEdge(n0,n1,'stair'); navEdge(n1,n2,'deck'); navEdge(n2,n3,'stair');
      if(prevTop) navEdge(prevTop,n0,'deck');
      prevTop=n3; T.nav.core[k]=n0;
    }
    /* gallery loops on inhabited floors (and the ground floor), reached from the core along the west corridor */
    T.floors.forEach(function(F){
      if(F.kind!=='inhabited') return;
      var g=GALLERY_WALK, loop=[], per=8;
      [[-1,-1,1,0],[1,-1,0,1],[1,1,-1,0],[-1,1,0,-1]].forEach(function(c){ for(var i=0;i<per;i++){ var t=i/per*2*g;
        loop.push(navNode(T.x+c[0]*g+c[2]*t, F.y, T.z+c[1]*g+c[3]*t, T.deck, F.k, 'gallery')); } });
      loop.forEach(function(n,i){ navEdge(n,loop[(i+1)%loop.length],'deck'); });
      T.nav.gallery[F.k]=loop;
      var cw=navNode(T.x-9.5,F.y,T.z,T.deck,F.k,'core'); navEdge(T.nav.core[F.k],cw,'deck'); navEdge(cw,navNearest(loop,T.x-g,T.z),'deck');
    });
    SLOTS.forEach(function(S){ if(S.tower!==T) return;
      S.door=navNode(S.x+S.ox*(S.ox?S.w/2+0.9:0), S.y, S.z+S.oz*(S.oz?S.d/2+0.9:0), T.deck, S.k, 'door'); S.door.slot=S.id;
      navEdge(S.door, navNearest(T.nav.gallery[S.k], S.door.x, S.door.z), 'deck'); });
    /* ground entrances: the gallery loop of floor 0 steps down to the ring of roads on all four sides */
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(f){
      var x=T.x+f[0]*(T.half+3), z=T.z+f[1]*(T.half+3), d=navNode(x,NAV_GY,z,null,-2,'towerdoor');
      navEdge(d, navNearest(T.nav.gallery[0], x, z), 'stair'); navEdge(d, navNearest(NAVROAD, x, z), 'ground'); });
    /* the roost deck: a walk round the tower, joined to the top floor's gallery on each side */
    var P=T.deck, dw=P.inner+3.0, walk=[], per2=10;
    [[-1,-1,1,0],[1,-1,0,1],[1,1,-1,0],[-1,1,0,-1]].forEach(function(c){ for(var i=0;i<per2;i++){ var t=i/per2*2*dw;
      walk.push(navNode(T.x+c[0]*dw+c[2]*t, P.y, T.z+c[1]*dw+c[3]*t, P, 0, 'deckwalk')); } });
    /* the deck is notched 2.6 m round the lift shaft (83-walk.js, 50-structure.js): walk nodes in the notch step out
       to its outer side, where the deck carries on */
    var Lw=T.lift, lsx=Math.sign(Lw.x-T.x)||1;
    walk.forEach(function(n){ if(Math.abs(n.x-Lw.x)<3.3 && Math.abs(n.z-Lw.z)<3.3) n.x=Lw.x+lsx*3.4; });
    walk.forEach(function(n,i){ navEdge(n,walk[(i+1)%walk.length],'deck'); }); P.nav={ walk:walk };
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(f){ navEdge(navNearest(walk,T.x+f[0]*dw,T.z+f[1]*dw), navNearest(T.nav.gallery[DECK_K],T.x+f[0]*GALLERY_WALK,T.z+f[1]*GALLERY_WALK),'deck'); });
    P.heads.forEach(function(h){ h.node=navNode(h.x,h.y,h.z,P,0,'bridgehead'); navEdge(h.node,navNearest(walk,h.x,h.z),'deck'); });
    /* a rider tends the beast from the stall's open back, by the deck walk: the bedding, bales, tack rack and trough
       (55-arch.js) fill the stall between there and the perch */
    ROOSTS.forEach(function(R){ if(R.plat!==P) return; R.node=navNode(R.x-R.ox*8.4,P.y,R.z-R.oz*8.4,P,0,'roost'); navEdge(R.node,navNearest(walk,R.node.x,R.node.z),'deck'); });
    /* the lift; its foot reaches the road round the capstan (r 1.1, 11 m out) when the straight line would cross it */
    var Lf=T.lift; Lf.foot=navNode(Lf.x+Lf.ox*2.6,NAV_GY,Lf.z,null,-2,'liftfoot'); Lf.head=navNode(Lf.x-Lf.ox*0,Lf.y1,Lf.z,P,0,'lifthead');
    var fr=navNearest(NAVROAD,Lf.foot.x,Lf.foot.z), C=Lf.capstan, fdx=fr.x-Lf.foot.x, fdz=fr.z-Lf.foot.z, fl2=fdx*fdx+fdz*fdz,
        ft=clamp(((C.x-Lf.foot.x)*fdx+(C.z-Lf.foot.z)*fdz)/(fl2||1),0,1);
    if(Math.hypot(Lf.foot.x+fdx*ft-C.x, Lf.foot.z+fdz*ft-C.z) < 1.8){
      var by=navNode(C.x, NAV_GY, C.z+(Math.sign(fr.z-C.z)||1)*2.8, null,-2,'liftfoot'); navEdge(Lf.foot,by,'ground'); navEdge(by,fr,'ground');
    } else navEdge(Lf.foot,fr,'ground');
    navEdge(Lf.head,navNearest(walk,Lf.head.x,Lf.head.z),'deck');
    Lf.edge=navEdge(Lf.foot,Lf.head,'lift',{ lift:Lf.id });
  });
  BRIDGES.forEach(function(br){ br.edge=navEdge(br.a.node,br.b.node,'bridge',{ bridge:br.id }); });
  var seen=new Uint8Array(NAV.nodes.length), q=[0], c=1; seen[0]=1;
  while(q.length){ var u=q.pop(); NAV.adj[u].forEach(function(eid){ var e=NAV.edges[eid], v=e.a===u?e.b:e.a; if(!seen[v]){seen[v]=1;c++;q.push(v);} }); }
  NAV.reachable=c;
})();

window._layout = { towers:TOWERS.length, slots:SLOTS.length, slotsLow:SLOTS.filter(function(s){return !s.high;}).length, slotsHigh:SLOTS.filter(function(s){return s.high;}).length,
  plots:PLOTS.length, houses:HOUSES.length, stalls:STALLS.length, roosts:ROOSTS.length, bridges:BRIDGES.length, trees:TREES.length, far:FARTREES.length,
  navNodes:NAV.nodes.length, navEdges:NAV.edges.length, navReachable:NAV.reachable };
