/* ============================== 1. CORE ==============================
   LOCUS (forked from Yuni's core). Units are METRES. x runs east, z runs SOUTH (north is -z), y up.
   A person is 1.75 tall. The origin is the centre of the walled circle.
   CLOCK CONVENTION (the brief's): the butte is at 6 o'clock = due south.
   clock h  ->  angle a = (h*30 - 90) deg, direction (cos a, sin a) in (x,z):
   12 = north (-z), 3 = east (+x), 6 = south (+z), 9 = west (-x).           */
var TARGET = (typeof window!=='undefined' && window.YUNI_TARGET) || 'world';
/* 'world' | 'sheet' (buildings) | 'furn' (interior furniture catalogue) | 'flora' (plant catalogue).
   SHEET is true for every catalogue target: flat ground, no town, no terrain features.
   CATALOG names WHICH catalogue, so 70-sheet.js lays out buildings only on 'sheet'. */
var SHEET = TARGET!=='world';
var CATALOG = (TARGET==='furn' || TARGET==='flora') ? TARGET : null;
/* KIT names a SUB-KIT laid out on its own building sheet ('locus': the Locus abyssal-desert +
   petroleum kit). On the plain 'sheet' target only assets with no kit are laid out; on a kit
   target only that kit's assets are, grouped by their own `group` field. */
var KIT = TARGET==='locus' ? 'locus' : null;

var SEED = 20260921;
var seed = SEED;
function rnd(){ seed = (seed*16807) % 2147483647; return (seed-1)/2147483646; }
function rr(a,b){ return a + (b-a)*rnd(); }
function ri(a,b){ return Math.floor(a + (b-a+1)*rnd()); }
function pick(a){ return a[Math.floor(rnd()*a.length)]; }
function chance(p){ return rnd() < p; }
function reseed(s){ seed = s; }
function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(rnd()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }

function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function smooth(e0,e1,x){ var t=clamp((x-e0)/(e1-e0),0,1); return t*t*(3-2*t); }
function mix(a,b,t){ return a+(b-a)*t; }
function smin(a,b,k){ var h=clamp(0.5+0.5*(b-a)/k,0,1); return mix(b,a,h) - k*h*(1-h); }
var TAU = Math.PI*2;
function wrapPi(a){ while(a> Math.PI) a-=TAU; while(a<-Math.PI) a+=TAU; return a; }
function angDist(a,b){ return Math.abs(wrapPi(a-b)); }

/* value noise */
function h2(i,j){ var n=(i*374761393 + j*668265263)|0; n=(n^(n>>13))|0; n=Math.imul(n,1274126177); n=(n^(n>>16))>>>0; return n/4294967295; }
function vn(x,z){
  var i=Math.floor(x), j=Math.floor(z), fx=x-i, fz=z-j;
  var u=fx*fx*(3-2*fx), v=fz*fz*(3-2*fz);
  var a=h2(i,j), b=h2(i+1,j), c=h2(i,j+1), d=h2(i+1,j+1);
  return a*(1-u)*(1-v) + b*u*(1-v) + c*(1-u)*v + d*u*v;
}
function fbm(x,z){
  return (0.5*vn(x,z) + 0.25*vn(x*2.03+11.3,z*2.01-7.1)
        + 0.125*vn(x*4.07-3.3,z*4.03+5.9) + 0.0625*vn(x*8.11+17,z*8.05+23)) / 0.9375;
}
function sig(x,z,f){ return (fbm(x*f, z*f) - 0.5) * 2; }   /* roughly -1 .. 1 */
/* LOCUS: h2 (and so vn and fbm) is biased — its mean is 0.25, sd 0.066 for fbm — so every Locus
   field that wants a centred 0..1 noise reads nfb(), which re-centres it (mean 0.5, sd ~0.25). */
function nfb(x,z){ return clamp((fbm(x,z)-0.25)*3.8+0.5, 0, 1); }
function nsig(x,z,f){ return (nfb(x*f, z*f) - 0.5) * 2; }
/* deterministic position hash, 0..1 — NOT the rnd() stream */
function phash(x,y,z,salt){
  var v = Math.sin(x*12.9898 + z*78.233 + y*37.719 + (salt||0)*93.9898) * 43758.5453;
  return v - Math.floor(v);
}

function segDist(px,pz, ax,az, bx,bz){
  var vx=bx-ax, vz=bz-az, wx=px-ax, wz=pz-az;
  var L=vx*vx+vz*vz; var t = L>0 ? clamp((wx*vx+wz*vz)/L,0,1) : 0;
  var dx=px-(ax+vx*t), dz=pz-(az+vz*t);
  return Math.sqrt(dx*dx+dz*dz);
}
var _rv = { d:0, t:0, i:0, u:0 };
function polyNear(px,pz, pts, cum){
  var m=1e9, bt=0, bi=0, bu=0;
  for(var i=0;i<pts.length-1;i++){
    var ax=pts[i][0], az=pts[i][1], bx=pts[i+1][0], bz=pts[i+1][1];
    var vx=bx-ax, vz=bz-az, wx=px-ax, wz=pz-az;
    var LL=vx*vx+vz*vz, t = LL>0 ? clamp((wx*vx+wz*vz)/LL,0,1) : 0;
    var dx=px-(ax+vx*t), dz=pz-(az+vz*t), d=Math.sqrt(dx*dx+dz*dz);
    if(d<m){ m=d; bi=i; bu=t; bt = cum[i] + t*(cum[i+1]-cum[i]); }
  }
  _rv.d = m; _rv.t = bt; _rv.i = bi; _rv.u = bu; return _rv;   /* t is ARC LENGTH along the polyline */
}
function cumLen(pts){
  var c=[0];
  for(var i=1;i<pts.length;i++) c.push(c[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
  return c;
}
function segCross(ax,az,bx,bz, cx,cz,dx,dz){
  function o(px,pz,qx,qz,rx,rz){ return (qx-px)*(rz-pz) - (qz-pz)*(rx-px); }
  var d1=o(ax,az,bx,bz,cx,cz), d2=o(ax,az,bx,bz,dx,dz);
  var d3=o(cx,cz,dx,dz,ax,az), d4=o(cx,cz,dx,dz,bx,bz);
  return ((d1>0)!==(d2>0)) && ((d3>0)!==(d4>0));
}
/* local (lx,lz) about (x,z) rotated by ry -> world. Same convention as Voth:
   local +x points along world angle -ry. */
function loc(x,z,lx,lz,ry){
  return [ x + lx*Math.cos(ry) + lz*Math.sin(ry), z - lx*Math.sin(ry) + lz*Math.cos(ry) ];
}


function clockA(h){ return (h*30 - 90)*Math.PI/180; }
function clockOf(x,z){ var h = (Math.atan2(z,x)*180/Math.PI + 90)/30; return ((h%12)+12)%12; }   /* 0..12, 0 == 12 o'clock */
/* polar frame helper shared by the merged builder: P = {x,z,ry} */
function platXZ(P,r,a){ var t=a+(P.ry||0); return [P.x + r*Math.cos(t), P.z + r*Math.sin(t)]; }

/* ============================== 2. WORLD CONSTANTS — LOCUS ==============================
   Locus stands on a low hill at the head of a river delta, on the EAST shore of an abyssal
   salt lake. Units metres, x east, z SOUTH, y up; the origin is the middle of the refinery
   ring, on the hilltop. THE WATER PLANE IS y = 0: the lake, the delta, the river and every
   marsh pool are simply where the ground dips under it (the eastern-abyss biome kit assumes
   exactly this, so its shallows, stilt-woods and lily pads agree with the world's water).

     x < shore(z)        the salt lake, to the map edge and on into the skybox
     the delta           three distributaries fanning from an apex SW of the city
     the river           in from the east edge, south of the hill, to the apex
     the hill            ~19 m, the city; its south foot carries the canal and the rice
     the beach ridge     a low old strand line running north along the lake: the N highway
     the SE levees       a chain of hummocks the SE highway keeps to
     the east            marsh, then the slope up toward the shelf (jungle at the edge)      */
var WORLD = 9000, HW = WORLD/2;
var CITY_EXT = CATALOG ? 300 : KIT ? 520 : SHEET ? 1700 : 1500;              /* the detailed box: painted ground canvas + placement mask (metres, +-) */
var MAP_R = 2600;                  /* the playable map: roads run to this edge, life enters and leaves here */
var GROUND0 = 0;                   /* the water plane */
var LOCUS_HILL = { x:0, z:0, R:480, H:19.0, sq:1.12 };   /* sq: the hill is longer N-S than E-W */

/* ---- the lake shore: x of the waterline at a given z. The delta has built the shore out
        westward round its mouths, so the line bulges there. ---- */
function lakeShoreX(z){
  var deltaBulge = -230*Math.exp(-Math.pow((z-640)/430, 2));
  return -1000 + 70*Math.sin(z*0.0011+0.7) + 35*Math.sin(z*0.0037+2.1) + deltaBulge;
}
/* signed distance-ish to the shore: + on land (east), - out in the lake */
function lakeDist(x,z){ return x - lakeShoreX(z); }

/* ---- the river and the delta. RIVER is the trunk, east edge -> apex; DISTRIB the three
        mouths, apex -> out into the lake. All are resampled Catmull-Rom polylines. ---- */
function locusSpline(ctrl, per){
  var out=[];
  for(var i=0;i<ctrl.length-1;i++){
    var p0=ctrl[Math.max(0,i-1)], p1=ctrl[i], p2=ctrl[i+1], p3=ctrl[Math.min(ctrl.length-1,i+2)];
    for(var k=0;k<per;k++){ var t=k/per, t2=t*t, t3=t2*t;
      out.push([0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
                0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]); }
  }
  out.push(ctrl[ctrl.length-1]); return out;
}
var DELTA_APEX = [-500, 660];
var RIVER = locusSpline([[3300,300],[2700,390],[2200,520],[1750,430],[1320,610],[920,560],[560,700],[240,680],[-60,705],[-300,690],DELTA_APEX], 8);
var DISTRIB = [
  locusSpline([DELTA_APEX,[-690,500],[-900,390],[-1150,330],[-1400,300]], 7),
  locusSpline([DELTA_APEX,[-760,700],[-1020,760],[-1330,790],[-1600,800]], 7),
  locusSpline([DELTA_APEX,[-640,900],[-880,1080],[-1140,1170],[-1420,1220]], 7)
];
var RIVER_CUM = cumLen(RIVER), RIVER_LEN = RIVER_CUM[RIVER_CUM.length-1];
var DISTRIB_CUM = DISTRIB.map(cumLen);
var RIVER_HALF = 17, DISTRIB_HALF = [12, 10, 9];
function riverAt(s){
  s = clamp(s, 0, RIVER_LEN-0.01);
  var lo=0, hi=RIVER_CUM.length-1;
  while(lo<hi-1){ var m=(lo+hi)>>1; if(RIVER_CUM[m]<=s) lo=m; else hi=m; }
  var t=(s-RIVER_CUM[lo])/(RIVER_CUM[lo+1]-RIVER_CUM[lo]);
  var dx=RIVER[lo+1][0]-RIVER[lo][0], dz=RIVER[lo+1][1]-RIVER[lo][1], L=Math.hypot(dx,dz)||1;
  return { x:mix(RIVER[lo][0],RIVER[lo+1][0],t), z:mix(RIVER[lo][1],RIVER[lo+1][1],t), tx:dx/L, tz:dz/L };
}
function riverHalfAt(s){ return RIVER_HALF + 3.0*Math.sin(s*0.006) + 1.5*Math.sin(s*0.017+1.3); }
function riverLevel(s){ return 0; }
/* distance to the nearest open channel's BANK (negative inside the water), trunk or mouth,
   and which one: {d, which (-1 trunk | 0..2 mouth), t (arc length)}. Every segment of every
   channel is bucketed on an 80 m grid once, so a query looks at a handful of segments rather
   than all of them — terrainH is called hundreds of thousands of times and asks this every time. */
var _rvq = { d:0, which:-1, t:0 };
var RSEG_CELL = 80, RSEG_GRID = {}, RSEG_REACH = 170;
(function(){
  function add(pts, cum, which){
    for(var i=0;i<pts.length-1;i++){ var A=pts[i], B=pts[i+1], sg={ ax:A[0], az:A[1], bx:B[0], bz:B[1], c0:cum[i], c1:cum[i+1], which:which };
      var pad=RSEG_REACH, i0=Math.floor((Math.min(A[0],B[0])-pad)/RSEG_CELL), i1=Math.floor((Math.max(A[0],B[0])+pad)/RSEG_CELL),
          j0=Math.floor((Math.min(A[1],B[1])-pad)/RSEG_CELL), j1=Math.floor((Math.max(A[1],B[1])+pad)/RSEG_CELL);
      for(var ii=i0;ii<=i1;ii++) for(var jj=j0;jj<=j1;jj++){ var k=ii+','+jj; (RSEG_GRID[k]||(RSEG_GRID[k]=[])).push(sg); } }
  }
  add(RIVER, RIVER_CUM, -1); DISTRIB.forEach(function(D,i){ add(D, DISTRIB_CUM[i], i); });
})();
function riverQuery(x,z){
  if(SHEET){ _rvq.d=1e6; return _rvq; }
  var cell=RSEG_GRID[Math.floor(x/RSEG_CELL)+','+Math.floor(z/RSEG_CELL)], best=RSEG_REACH, which=-2, t=0;
  if(cell) for(var i=0;i<cell.length;i++){ var S=cell[i], vx=S.bx-S.ax, vz=S.bz-S.az, LL=vx*vx+vz*vz, u=LL>0?clamp(((x-S.ax)*vx+(z-S.az)*vz)/LL,0,1):0;
    var dx=x-(S.ax+vx*u), dz=z-(S.az+vz*u), d=Math.sqrt(dx*dx+dz*dz), tt=S.c0+u*(S.c1-S.c0), hw;
    if(S.which<0) hw=riverHalfAt(tt); else { var Lm=DISTRIB_CUM[S.which][DISTRIB_CUM[S.which].length-1]; hw=DISTRIB_HALF[S.which]*(1+0.5*clamp(tt/Lm,0,1)); }
    if(d-hw < best){ best=d-hw; which=S.which; t=tt; } }
  _rvq.d=best; _rvq.which=which; _rvq.t=t; return _rvq;
}
function riverDist(x,z){ if(SHEET) return 1e6; return riverQuery(x,z).d; }
function inRiver(x,z,margin){ return riverDist(x,z) < (margin||0); }

/* ---- the irrigation canal: takes off the river upstream of the city and runs west along
        the hill's south foot, behind the rice farms; water at the plane (y 0), bed cut to -1.3 ---- */
var CANAL = locusSpline([[455,688],[420,560],[300,506],[100,500],[-120,502],[-300,508]], 6);
var CANAL_CUM = cumLen(CANAL), CANAL_LEN = CANAL_CUM[CANAL_CUM.length-1];
var CANAL_HALF = 3.4, CANAL_W = [3.0, 5.0, 7.5, 13.0];
function canalLevel(s){ return 0; }
function canalAt(s){
  s = clamp(s, 0, CANAL_LEN-0.01);
  var lo=0, hi=CANAL_CUM.length-1;
  while(lo<hi-1){ var m=(lo+hi)>>1; if(CANAL_CUM[m]<=s) lo=m; else hi=m; }
  var t=(s-CANAL_CUM[lo])/(CANAL_CUM[lo+1]-CANAL_CUM[lo]);
  var dx=CANAL[lo+1][0]-CANAL[lo][0], dz=CANAL[lo+1][1]-CANAL[lo][1], L=Math.hypot(dx,dz)||1;
  return { x:mix(CANAL[lo][0],CANAL[lo+1][0],t), z:mix(CANAL[lo][1],CANAL[lo+1][1],t), tx:dx/L, tz:dz/L };
}
function nearCanalBox(x,z){ return x > -340 && x < 500 && z > 460 && z < 720; }
function canalDist(x,z){ if(SHEET || !nearCanalBox(x,z)) return 1e6; return polyNear(x,z,CANAL,CANAL_CUM).d; }

/* ---- landforms ---- */
function hillK(x,z){                                   /* 1 on the plateau, 0 on the marsh */
  var dx=x-LOCUS_HILL.x, dz=(z-LOCUS_HILL.z)/LOCUS_HILL.sq, r=Math.hypot(dx,dz);
  var a=Math.atan2(dz,dx), R=LOCUS_HILL.R*(1 + 0.08*Math.sin(a*3+0.6) + 0.05*Math.sin(a*5-1.2)) - 70*Math.max(0, Math.sin(a))*smooth(0.2,1,Math.sin(a));   /* the south flank is steeper: it stops short for the canal */
  return 1 - smooth(R*0.42, R, r);
}
/* the old strand line north along the lake: a low ridge the north road keeps to */
function ridgeX(z){ return lakeShoreX(z) + 300 + 40*Math.sin(z*0.0023+1.0); }
function ridgeK(x,z){ if(z > 120) return 0; var d=Math.abs(x-ridgeX(z)); return (1-smooth(28, 95, d))*smooth(120, -120, z); }
/* the SE levees: a chain of low hummocks from the hill's east flank toward the SE corner */
var SE_HUMMOCKS = [[430,240,120],[640,330,110],[880,420,110],[1080,760,120],[1300,980,130],[1540,1230,140],[1790,1500,150],[2060,1800,150],[2330,2100,160],[2560,2400,160]];
function hummockK(x,z){ var k=0; for(var i=0;i<SE_HUMMOCKS.length;i++){ var H=SE_HUMMOCKS[i], q=Math.hypot(x-H[0],z-H[1])/H[2]; if(q<1) k=Math.max(k, 1-q*q); } return k; }
/* the east: the basin floor tips up toward the shelf */
function eastRise(x,z){ var xe = x + 140*Math.sin(z*0.0012) + 50*Math.sin(z*0.0041); return 34*smooth(1500, 2900, xe) + 90*smooth(2800, 4300, xe); }

/* ============================== 4. TERRAIN FIELD ============================== */
var TERRAIN_MOUNDS = [];           /* [x, z, radius, height] */
var TERRAIN_PADS = [];             /* [x, z, rInner, rOuter, y] levelled sites */
var TERRAIN_RECTS = [];            /* [x, z, hw, hd, ry, blend, y] levelled rectangles (the refinery yard, the tank bunds) */
function terrainH(x,z){
  if(SHEET) return 0;
  var sw = nfb(x*0.0009+3, z*0.0009-1) - 0.5, ro = nfb(x*0.0048-2, z*0.0048+5) - 0.5, fine = vn(x*0.05, z*0.05) - 0.5;
  var hk = hillK(x,z), rk = ridgeK(x,z), mk = hummockK(x,z);
  /* the marsh: low, nearly flat, pools in its hollows */
  var h = 1.25 + sw*1.4 + ro*0.8 + fine*0.12;
  var pool = nfb(x*0.0062+11, z*0.0062-7);
  /* no pools in the fishers' quarter and under the farms: they stand on the dry bank */
  var qx = Math.max(-560-x, x-200, 0), qz = Math.max(470-z, z-650, 0), dryQ = smooth(0, 70, Math.hypot(qx,qz));
  var poolK = smooth(0.31, 0.18, pool) * (1-hk) * (1-rk) * (1-mk) * smooth(180, 420, Math.hypot(x,z)) * smooth(-40, 80, lakeDist(x,z)) * dryQ;
  h -= 2.9*poolK;
  /* the hill, the ridge and the hummocks */
  h += LOCUS_HILL.H*Math.pow(hk, 0.85) + 3.2*sw*hk;
  h += 3.8*rk + 2.8*mk;
  h += eastRise(x,z);
  /* the river and the mouths: a channel below the plane, soft banks */
  var rq = riverQuery(x,z), rd = rq.d;
  if(rd < 60){ var bed = -1.9 + 0.6*ro; h = mix(bed, Math.max(h, 0.9), smooth(-4, 26, rd)); }
  /* the canal */
  if(nearCanalBox(x,z)){ var cd = polyNear(x,z,CANAL,CANAL_CUM).d;
    if(cd < CANAL_W[3]){ var cb = cd <= CANAL_W[0] ? -1.3 : cd <= CANAL_W[1] ? mix(-1.3, 0.55, smooth(CANAL_W[0],CANAL_W[1],cd)) : cd <= CANAL_W[2] ? 0.7 : mix(0.7, h, smooth(CANAL_W[2],CANAL_W[3],cd));
      h = cd <= CANAL_W[2] ? cb : mix(h, cb, 1-smooth(CANAL_W[2],CANAL_W[3],cd)); } }
  /* levelled sites */
  for(var p=0;p<TERRAIN_PADS.length;p++){ var P=TERRAIN_PADS[p], pd=Math.hypot(x-P[0],z-P[1]); if(pd < P[3]) h = mix(P[4], h, smooth(P[2], P[3], pd)); }
  for(var q=0;q<TERRAIN_RECTS.length;q++){ var Q=TERRAIN_RECTS[q], lq=loc(0,0,x-Q[0],z-Q[1],-Q[4]), ex=Math.max(Math.abs(lq[0])-Q[2], Math.abs(lq[1])-Q[3], 0);
    if(ex < Q[5]) h = mix(Q[6], h, smooth(0, Q[5], ex)); }
  for(var i=0;i<TERRAIN_MOUNDS.length;i++){ var M=TERRAIN_MOUNDS[i], dx=x-M[0], dz=z-M[1], qq=(dx*dx+dz*dz)/(M[2]*M[2]); if(qq < 1){ var f=1-qq; h += M[3]*f*f; } }
  /* the lake: west of the shore the floor drops away — wide shallows, then the deep */
  var ld = lakeDist(x,z);
  if(ld < 60){ var lb = -0.5 - 1.6*smooth(0, -300, ld) - 9*smooth(-300, -1400, ld) + 1.4*(nfb(x*0.0018+5, z*0.0018+9)-0.5)*smooth(-40,-220,ld);
    h = mix(lb, h, smooth(-18, 60, ld)); }
  return h;
}

/* ---- THE CLIMATE FIELDS the eastern-abyss biome zones itself by (BIOME-API.md). ---- */
var LOCUS_FIELDS = {
  wet: function(x,z){ var hk=hillK(x,z), rd=riverDist(x,z), ld=lakeDist(x,z);
    var w = mix(0.90, 0.60, hk) - 0.10*ridgeK(x,z) - 0.08*hummockK(x,z) + 0.04*smooth(1500,2600,x);
    w = Math.max(w, 0.97*smooth(90, 12, rd), 0.95*smooth(120, 10, ld));
    return clamp(w, 0, 1); },
  salt: function(x,z){ var ld=lakeDist(x,z), rd=riverDist(x,z);
    var s = 0.14 + 0.72*smooth(120, 6, ld)*smooth(-30, 20, ld) - 0.10*hillK(x,z);
    return clamp(s*smooth(6, 50, rd) + 0.05, 0, 1); },
  upland: function(x,z){ return clamp(0.34*hillK(x,z) + 0.10*ridgeK(x,z) + 0.08*hummockK(x,z) + eastRise(x,z)/220, 0, 1); },
  flow: function(x,z){ return clamp(smooth(150, 20, riverDist(x,z)), 0, 1); }
};

/* per-frame callbacks: any fragment may TICKS.push(function(dt, hour, nightK){...}). */
var TICKS = [];
/* path-viz registry: {key,label,color,paths:function(){return [[[x,y,z],...],...];}} */
var PATHVIZ = [];
