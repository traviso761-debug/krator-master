/* ============================== 1. CORE ==============================
   MUNGO (Locus's core, forked from Yuni's). Units are METRES. x runs east, z runs SOUTH (north is -z), y up.
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
var KIT = TARGET==='locus' ? 'locus' : TARGET==='abyss' ? 'abyss' : null;   /* 'abyss': the Eastern Abyssal kit (65-abyss-*.js) */

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


/* ============================== 2. WORLD CONSTANTS — MUNGO ==============================
   Mungo stands at the MOUTH OF A SMALL RIVER on the EAST shore of one of the salt lakes on the floor
   of the Eastern Abyss. Units metres, x east, z SOUTH (north is -z), y up. THE WATER PLANE IS y = 0
   (Locus's convention, which the eastern-abyss biome kit assumes): the lake and the river are where
   the ground dips under it. The origin is the BRIDGEHEAD: the market square at the shore where the
   reed village's one pontoon bridge lands, between the two districts.

     x < shore(z)        the salt lake, with wide reed shallows; the floating reed village stands in
                         them 110-380 m out, west of the bridgehead; beyond, the deep and the far shore
     the river           in from the east edge, past the south side of the town, to its mouth just
                         south of the bridgehead
     the terrace         a low dry rise the landward town stands on (the abyssal style), north of the
                         river; the main street runs east along it to the headman's house
     the fields          on the river flats south and east of the town
     the forest          all round beyond the fields: the lumber and the fruit
     north and south     open abyssal floor (marsh, forest patches, salt pans); the two highways
     the east            the floor tips up, far off, toward the abyss rim (painted in 20-stage.js)  */
var WORLD = 7000, HW = WORLD/2;
var CITY_EXT = CATALOG ? 300 : KIT==='abyss' ? 760 : KIT ? 520 : SHEET ? 1700 : 780;   /* the detailed box: ground canvas + placement mask (+-) */
var MAP_R = 1150;                  /* the playable map: the highways run to this edge; life enters and leaves here */
var GROUND0 = 0;                   /* the water plane */

/* ---- the lake shore: x of the waterline at a given z; the river's silt pushes it out round the mouth ---- */
var MOUTH_Z = 96;
function lakeShoreX(z){
  var bulge = -40*Math.exp(-Math.pow((z-MOUTH_Z)/85, 2));
  return -62 + 22*Math.sin(z*0.0042+0.5) + 9*Math.sin(z*0.013+1.7) + bulge;
}
/* + on land (east), - out in the lake */
function lakeDist(x,z){ return x - lakeShoreX(z); }

/* ---- the river: one channel, east edge -> the mouth (a resampled Catmull-Rom polyline) ---- */
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
var RIVER = locusSpline([[3300,360],[2700,300],[2150,390],[1650,290],[1220,340],[860,262],[560,214],[360,178],[220,150],[110,128],[20,110],[-50,100],[-150,96]], 8);
var RIVER_CUM = cumLen(RIVER), RIVER_LEN = RIVER_CUM[RIVER_CUM.length-1];
var RIVER_HALF = 7.5;              /* a small river: about 15 m bank to bank */
function riverAt(s){
  s = clamp(s, 0, RIVER_LEN-0.01);
  var lo=0, hi=RIVER_CUM.length-1;
  while(lo<hi-1){ var m=(lo+hi)>>1; if(RIVER_CUM[m]<=s) lo=m; else hi=m; }
  var t=(s-RIVER_CUM[lo])/(RIVER_CUM[lo+1]-RIVER_CUM[lo]);
  var dx=RIVER[lo+1][0]-RIVER[lo][0], dz=RIVER[lo+1][1]-RIVER[lo][1], L=Math.hypot(dx,dz)||1;
  return { x:mix(RIVER[lo][0],RIVER[lo+1][0],t), z:mix(RIVER[lo][1],RIVER[lo+1][1],t), tx:dx/L, tz:dz/L };
}
/* the channel widens toward the mouth */
function riverHalfAt(s){ return RIVER_HALF*(1 + 0.55*smooth(RIVER_LEN-700, RIVER_LEN, s)) + 1.2*Math.sin(s*0.009) + 0.7*Math.sin(s*0.023+1.3); }
/* distance to the river's BANK (negative inside the water), bucketed on an 80 m grid (Locus's scheme) */
var _rvq = { d:0, which:-1, t:0 };
var RSEG_CELL = 80, RSEG_GRID = {}, RSEG_REACH = 140;
(function(){
  for(var i=0;i<RIVER.length-1;i++){ var A=RIVER[i], B=RIVER[i+1], sg={ ax:A[0], az:A[1], bx:B[0], bz:B[1], c0:RIVER_CUM[i], c1:RIVER_CUM[i+1] };
    var pad=RSEG_REACH, i0=Math.floor((Math.min(A[0],B[0])-pad)/RSEG_CELL), i1=Math.floor((Math.max(A[0],B[0])+pad)/RSEG_CELL),
        j0=Math.floor((Math.min(A[1],B[1])-pad)/RSEG_CELL), j1=Math.floor((Math.max(A[1],B[1])+pad)/RSEG_CELL);
    for(var ii=i0;ii<=i1;ii++) for(var jj=j0;jj<=j1;jj++){ var k=ii+','+jj; (RSEG_GRID[k]||(RSEG_GRID[k]=[])).push(sg); } }
})();
function riverQuery(x,z){
  if(SHEET){ _rvq.d=1e6; return _rvq; }
  var cell=RSEG_GRID[Math.floor(x/RSEG_CELL)+','+Math.floor(z/RSEG_CELL)], best=RSEG_REACH, t=0;
  if(cell) for(var i=0;i<cell.length;i++){ var S=cell[i], vx=S.bx-S.ax, vz=S.bz-S.az, LL=vx*vx+vz*vz, u=LL>0?clamp(((x-S.ax)*vx+(z-S.az)*vz)/LL,0,1):0;
    var dx=x-(S.ax+vx*u), dz=z-(S.az+vz*u), d=Math.sqrt(dx*dx+dz*dz), tt=S.c0+u*(S.c1-S.c0), hw=riverHalfAt(tt);
    if(d-hw < best){ best=d-hw; t=tt; } }
  _rvq.d=best; _rvq.which=-1; _rvq.t=t; return _rvq;
}
function riverDist(x,z){ if(SHEET) return 1e6; return riverQuery(x,z).d; }
function inRiver(x,z,margin){ return riverDist(x,z) < (margin||0); }
/* Mungo has no canal; the name answers for the shared code that asks */
var CANAL_W = [0,0,0,0];
function canalDist(x,z){ return 1e6; }

/* ---- landforms ---- */
/* the terrace the landward town stands on: a low dry rise north of the river, highest at the headman's end */
var TERRACE = { x:150, z:-40, rx:430, rz:330, H:2.4 };
function terraceK(x,z){ var dx=(x-TERRACE.x)/TERRACE.rx, dz=(z-TERRACE.z)/TERRACE.rz, r=Math.hypot(dx,dz)*(1+0.08*Math.sin(Math.atan2(dz,dx)*3+0.4));
  return 1 - smooth(0.55, 1.0, r); }
/* the forest: all round beyond the fields, patchy toward the open floor north and south */
function forestK(x,z){ var r=Math.hypot(x-120, (z-40)*0.9), ring=smooth(330, 560, r);
  var patch = smooth(0.38, 0.62, nfb(x*0.0024+7, z*0.0024-3));
  var open = smooth(700, 1400, Math.abs(z-40)) * smooth(0.5, 0.75, nfb(x*0.0011-5, z*0.0011+2));   /* the open floor N and S */
  return clamp(ring*(0.55+0.45*patch)*(1-0.75*open)*smooth(40, 220, lakeDist(x,z)), 0, 1); }
/* THE MARSH at the river mouth (the owner, 2026-10-05: "an extensive marsh with reeds at the river mouth"): a fan
   round the mouth south of the town, a band up both banks of the river, and a strip along the south shore. The
   ground there sits just above the water, broken by pools and channels; the reed beds are planted on it (65r, the
   Reed Lake kit's living reed) and the reed cutters work it (world/roles.json). marshK is 0..1. */
var MARSH = { x:-20, z:150, rx:260, rz:325 };
function marshK(x,z){
  var fan = (1 - smooth(0.42, 1.0, Math.hypot((x-MARSH.x)/MARSH.rx, (z-MARSH.z)/MARSH.rz))) * smooth(48, 92, z);
  var banks = smooth(70, 22, riverQuery(x,z).d) * smooth(520, 300, x) * smooth(40, 90, z);
  var shore = smooth(230, 70, lakeDist(x,z)) * smooth(70, 140, z) * smooth(760, 560, z);
  return clamp(Math.max(fan, banks, shore) * (0.85 + 0.15*nfb(x*0.004+2, z*0.004-6)), 0, 1);
}
/* the marsh floor: a little above the water plane, pools and channels below it */
function marshH(x,z){
  var n = nfb(x*0.0075+3, z*0.0075-1), ch = nfb(x*0.021-7, z*0.021+4), f = vn(x*0.09, z*0.09)-0.5;
  return 0.32 + 0.40*(n-0.5) + 0.08*f - 1.05*smooth(0.40, 0.24, ch) - 0.55*smooth(0.30, 0.16, n);
}
/* raised banks a road crosses the marsh on (30-layout.js pushes [ax,az,bx,bz,halfWidth,y]) */
var CAUSEWAYS = [];
/* the east: the floor tips up toward the far rim */
function eastRise(x,z){ var xe = x + 120*Math.sin(z*0.0013) + 40*Math.sin(z*0.0047); return 22*smooth(1500, 3000, xe) + 70*smooth(2900, 4400, xe); }

/* ============================== 4. TERRAIN FIELD ============================== */
var TERRAIN_MOUNDS = [];           /* [x, z, radius, height] */
var TERRAIN_PADS = [];             /* [x, z, rInner, rOuter, y] levelled sites */
var TERRAIN_RECTS = [];            /* [x, z, hw, hd, ry, blend, y] levelled rectangles */
function terrainH(x,z){
  if(SHEET) return 0;
  var sw = nfb(x*0.0011+3, z*0.0011-1) - 0.5, ro = nfb(x*0.0052-2, z*0.0052+5) - 0.5, fine = vn(x*0.05, z*0.05) - 0.5;
  var tk = terraceK(x,z), fk = forestK(x,z);
  /* the abyssal floor: low and nearly flat, a little higher under the forest */
  var h = 1.45 + sw*1.2 + ro*0.6 + fine*0.10 + 0.9*fk;
  /* marsh pools out on the open floor, never in the town, the fields or the forest's heart */
  var pool = nfb(x*0.0058+11, z*0.0058-7);
  var poolK = smooth(0.30, 0.17, pool) * (1-tk) * (1-0.8*fk) * smooth(520, 760, Math.hypot(x-120, z-40)) * smooth(-30, 90, lakeDist(x,z));
  h -= 2.6*poolK;
  /* the terrace */
  h += TERRACE.H*Math.pow(tk, 0.8) + 0.8*sw*tk;
  h += eastRise(x,z);
  /* the marsh at the mouth: the ground let down to just above the water, pools and channels through it */
  var mk = marshK(x,z); if(mk > 0.001) h = mix(h, marshH(x,z), smooth(0.05, 0.6, mk));
  /* the causeways a road crosses the marsh on (before the river: a bridge spans the channel) */
  for(var cw=0; cw<CAUSEWAYS.length; cw++){ var C=CAUSEWAYS[cw], dc=segDist(x,z,C[0],C[1],C[2],C[3]); if(dc < C[4]+7) h = mix(Math.max(h, C[5]), h, smooth(C[4], C[4]+7, dc)); }
  /* the river: a channel below the plane, soft banks */
  var rd = riverQuery(x,z).d;
  if(rd < 46){ var bed = -1.6 + 0.4*ro; h = mix(bed, Math.max(h, 0.85), smooth(-3, 20, rd)); }
  /* levelled sites */
  for(var p=0;p<TERRAIN_PADS.length;p++){ var P=TERRAIN_PADS[p], pd=Math.hypot(x-P[0],z-P[1]); if(pd < P[3]) h = mix(P[4], h, smooth(P[2], P[3], pd)); }
  for(var q=0;q<TERRAIN_RECTS.length;q++){ var Q=TERRAIN_RECTS[q], lq=loc(0,0,x-Q[0],z-Q[1],-Q[4]), ex=Math.max(Math.abs(lq[0])-Q[2], Math.abs(lq[1])-Q[3], 0);
    if(ex < Q[5]) h = mix(Q[6], h, smooth(0, Q[5], ex)); }
  for(var i=0;i<TERRAIN_MOUNDS.length;i++){ var M=TERRAIN_MOUNDS[i], dx=x-M[0], dz=z-M[1], qq=(dx*dx+dz*dz)/(M[2]*M[2]); if(qq < 1){ var f=1-qq; h += M[3]*f*f; } }
  /* the lake: a fringe of reed shallows along the shore, then three metres of water where the floating village
     is anchored (on poles, as the kit's islands are), then the deep. The biome kit plants its water species where
     the bed is shallower than ~1.6 m, so the fringe is what keeps them to the shore. */
  var ld = lakeDist(x,z);
  if(ld < 50){ var lb = -0.55 - 1.3*smooth(0, -50, ld) - 1.0*smooth(-50, -160, ld) - 0.6*smooth(-160, -420, ld) - 8*smooth(-480, -1700, ld) + 0.4*(nfb(x*0.002+5, z*0.002+9)-0.5)*smooth(-30,-200,ld);
    h = mix(lb, h, smooth(-14, 50, ld)); }
  return h;
}

/* ---- THE CLIMATE FIELDS the eastern-abyss biome zones itself by (BIOME-API.md) ----
   the forest ring reads as JUNGLE (upland ~.35, wet ~.8); the shore, the river and the pools as MARSH;
   the lake rim north and south as SHORE and salt FLATS; the terrace is dry ground (the town's gardens). */
var MUNGO_FIELDS = {
  wet: function(x,z){ var tk=terraceK(x,z), rd=riverDist(x,z), ld=lakeDist(x,z), fk=forestK(x,z);
    var w = 0.80 - 0.22*tk + 0.06*fk;
    w = Math.max(w, 0.97*smooth(70, 8, rd), 0.95*smooth(110, 10, ld), 0.96*marshK(x,z));
    return clamp(w, 0, 1); },
  salt: function(x,z){ var ld=lakeDist(x,z), rd=riverDist(x,z);
    var s = 0.12 + 0.70*smooth(130, 6, ld)*smooth(-30, 20, ld) - 0.08*terraceK(x,z) + 0.12*smooth(600, 1100, Math.abs(z-40))*smooth(260, 60, ld);
    return clamp(s*smooth(6, 45, rd) + 0.04, 0, 1); },
  upland: function(x,z){ return clamp((0.05 + 0.33*forestK(x,z) + 0.10*terraceK(x,z) + eastRise(x,z)/200)*(1-0.9*marshK(x,z)), 0, 1); },
  flow: function(x,z){ return clamp(smooth(120, 16, riverDist(x,z)), 0, 1); }
};
var LOCUS_FIELDS = MUNGO_FIELDS;   /* the name the Locus-shared code knows */

/* per-frame callbacks: any fragment may TICKS.push(function(dt, hour, nightK){...}). */
var TICKS = [];
/* path-viz registry: {key,label,color,paths:function(){return [[[x,y,z],...],...];}} */
var PATHVIZ = [];
