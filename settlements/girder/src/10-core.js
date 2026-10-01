/* ============================== 1. CORE ==============================
   Units are METRES. x runs east, z runs south, y up. A person is 1.75 tall.
   The river flows from the east edge to the west edge (downstream = -x),
   GIRDER: an outlying beast-rider village built into an ancient ruin. A small
   brook runs past the settlement from the north to the south-east. */

var SEED = 20260920;
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

/* ============================== 2. WORLD CONSTANTS ============================== */

var WORLD = 7200, HW = WORLD/2;    /* terrain extent; jungle to the fog line */
var CITY_EXT = 1500;               /* the detailed box: ground texture, light volume, undergrowth */

/* ---- the brook, listed UPSTREAM (north) to DOWNSTREAM (south-east). It keeps
        the old river API (RIVER, riverAt, riverLevel, riverDist...) so every
        pass written for Mav's Refuge still reads it. ---- */
var RIVER = (function(){
  var ctrl = [[-900,-3600],[-760,-2500],[-430,-1600],[-330,-900],[-300,-380],[-268,20],[-130,262],[120,300],[430,372],[900,640],[1700,930],[2600,1500],[3600,1950]];
  var out=[];
  for(var i=0;i<ctrl.length-1;i++){
    var p0=ctrl[Math.max(0,i-1)], p1=ctrl[i], p2=ctrl[i+1], p3=ctrl[Math.min(ctrl.length-1,i+2)];
    for(var k=0;k<10;k++){
      var t=k/10, t2=t*t, t3=t2*t;
      out.push([0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3) + (i>0&&i<ctrl.length-2 ? 9*Math.sin(i*3.1+k*0.9) : 0),
                0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);
    }
  }
  out.push(ctrl[ctrl.length-1]);
  return out;
})();
var RIVER_CUM = cumLen(RIVER), RIVER_LEN = RIVER_CUM[RIVER_CUM.length-1];
var RIVER_HALF = 3.2;              /* a small brook: ~6-7 m of water */
var RIVER_EDGE = 1.6;              /* how far the water ribbon laps past the nominal bank (75-terrain.js) */

/* the whole district tilts gently down to the south-east; the brook rides that plane */
function groundPlane(x,z){ return 34 - 0.0042*(x*0.55 + z*0.83); }
var SETTLE_R = 214, SETTLE_Y = groundPlane(0,0) + 0.6;   /* the levelled terrace the ruin stands on */

/* one small cascade where the brook drops past the settlement's south-west corner */
var CATARACTS = [ { x:-200, drop: 3.2, run: 16 } ];
(function(){
  CATARACTS.forEach(function(c){
    var best=0, bd=1e9;
    for(var i=0;i<RIVER.length;i++){ var d=Math.hypot(RIVER[i][0]-c.x, RIVER[i][1]-170); if(d<bd){bd=d;best=i;} }
    c.s = RIVER_CUM[best]; c.x = RIVER[best][0]; c.z = RIVER[best][1];
  });
})();
function riverAt(s){
  s = clamp(s, 0, RIVER_LEN-0.01);
  var lo=0, hi=RIVER_CUM.length-1;
  while(lo<hi-1){ var m=(lo+hi)>>1; if(RIVER_CUM[m]<=s) lo=m; else hi=m; }
  var t=(s-RIVER_CUM[lo])/(RIVER_CUM[lo+1]-RIVER_CUM[lo]);
  var dx=RIVER[lo+1][0]-RIVER[lo][0], dz=RIVER[lo+1][1]-RIVER[lo][1], L=Math.hypot(dx,dz)||1;
  return { x:mix(RIVER[lo][0],RIVER[lo+1][0],t), z:mix(RIVER[lo][1],RIVER[lo+1][1],t), tx:dx/L, tz:dz/L };
}
function riverLevel(s){
  var R = riverAt(s), y = groundPlane(R.x,R.z) - 1.3;
  for(var i=0;i<CATARACTS.length;i++){ var c=CATARACTS[i]; y += c.drop*(0.5 - smooth(c.s-c.run*0.5, c.s+c.run*0.5, s)); }
  return y;
}
function cataractK(s){
  var k=0;
  for(var i=0;i<CATARACTS.length;i++){ var c=CATARACTS[i]; k=Math.max(k, 1-smooth(c.run*0.35, c.run*0.75, Math.abs(s-c.s))); }
  return k;
}
function riverHalfAt(s){ return RIVER_HALF + 0.9*Math.sin(s*0.021) + 0.5*Math.sin(s*0.057+1.3) - 0.8*cataractK(s); }
function riverDist(x,z){ var rv=polyNear(x,z,RIVER,RIVER_CUM); return rv.d - riverHalfAt(rv.t); }
function inRiver(x,z,margin){ return riverDist(x,z) < (margin||0); }

/* ============================== 3. TERRAIN FIELD ==============================
   "Hilly undergrowth": rolling 20-30 m hills under the forest, a shallow vale
   along the brook, and one levelled terrace (SETTLE_R) under the ruin. */
var TERRAIN_MOUNDS = [];           /* [x, z, radius, height] */
function terrainH(x,z){
  var rv = polyNear(x,z,RIVER,RIVER_CUM), s = rv.t, d = rv.d;
  var half = riverHalfAt(s), nearBrook = smooth(8, 110, d);
  var h = groundPlane(x,z)
        + (24*sig(x+900, z-400, 0.0023) + 9*sig(x-300, z+700, 0.0071))*nearBrook
        + 1.0*sig(x, z, 0.033);
  var e = Math.max(Math.abs(x),Math.abs(z));
  h += 70*smooth(2200, 3500, e)*(0.5+0.5*fbm(x*0.0011+3, z*0.0011-8));
  /* the terrace */
  var r0 = Math.hypot(x,z);
  if(r0 < SETTLE_R+130) h = mix(SETTLE_Y + 0.04*sig(x,z,0.05), h, smooth(SETTLE_R, SETTLE_R+130, r0));
  /* the channel */
  if(d < half + 12){
    var wl = riverLevel(s), ck = cataractK(s);
    var bed = wl - (0.9 - 0.5*ck)*(1 - smooth(half*0.3, half, d)) - 0.25 + ck*0.5*sig(x,z,0.2);
    h = mix(bed, Math.max(h, wl+0.5), smooth(half-0.8, half+10, d));
  }
  for(var i=0;i<TERRAIN_MOUNDS.length;i++){
    var M=TERRAIN_MOUNDS[i], dx=x-M[0], dz=z-M[1], q=(dx*dx+dz*dz)/(M[2]*M[2]);
    if(q < 1){ var f=1-q; h += M[3]*f*f; }
  }
  return h;
}

/* per-frame callbacks: any fragment may TICKS.push(function(dt, hour, nightK){...}).
   80-camera.js runs them all, each in its own try/catch. */
var TICKS = [];
/* path-viz registry: every moving population pushes {key,label,color,paths:function(){return [[[x,y,z],...],...];}} */
var PATHVIZ = [];
