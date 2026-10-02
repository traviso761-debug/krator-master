/* ============================== 1. CORE ==============================
   Units are METRES. x runs east, z runs south, y up. A person is 1.75 tall.
   The river flows from the east edge to the west edge (downstream = -x),
   toward the Ring Sea; the volcano stands beyond it to the south-west. */

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

/* ---- the river, listed UPSTREAM (east) to DOWNSTREAM (west) ---- */
var RIVER = (function(){
  var ctrl = [[3600,180],[2700,60],[1900,150],[1300,40],[820,-30],[420,30],[60,10],[-300,-40],
              [-700,40],[-1150,-30],[-1700,90],[-2400,-40],[-3000,-260],[-3600,-640]];
  /* densify with a Catmull-Rom so the banks curve instead of kinking */
  var out=[];
  for(var i=0;i<ctrl.length-1;i++){
    var p0=ctrl[Math.max(0,i-1)], p1=ctrl[i], p2=ctrl[i+1], p3=ctrl[Math.min(ctrl.length-1,i+2)];
    for(var k=0;k<8;k++){
      var t=k/8, t2=t*t, t3=t2*t;
      out.push([0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
                0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);
    }
  }
  out.push(ctrl[ctrl.length-1]);
  return out;
})();
var RIVER_CUM = cumLen(RIVER), RIVER_LEN = RIVER_CUM[RIVER_CUM.length-1];
var RIVER_HALF = 36;               /* nominal half-width of the water */

/* two small cataracts, addressed by the x at which the river crosses them.
   `drop` metres over `run` metres of rapids. */
var CATARACTS = [ { x: 560, drop: 7.5, run: 46 }, { x: -430, drop: 6.0, run: 40 } ];
(function(){
  CATARACTS.forEach(function(c){
    /* arc length at which the river passes x = c.x */
    for(var i=0;i<RIVER.length-1;i++){
      if((RIVER[i][0]-c.x)*(RIVER[i+1][0]-c.x) <= 0){
        var u=(c.x-RIVER[i][0])/(RIVER[i+1][0]-RIVER[i][0]);
        c.s = RIVER_CUM[i] + u*(RIVER_CUM[i+1]-RIVER_CUM[i]);
        c.z = mix(RIVER[i][1], RIVER[i+1][1], u);
        break;
      }
    }
  });
})();
/* water surface height at arc length s. Downstream reach is y = 0. */
function riverLevel(s){
  var y = 0;
  for(var i=0;i<CATARACTS.length;i++){
    var c = CATARACTS[i];
    y += c.drop * (1 - smooth(c.s - c.run*0.5, c.s + c.run*0.5, s));
  }
  /* a very gentle gradient so the reaches are not dead flat */
  return y + (RIVER_LEN - s)*0.0006;
}
/* 0..1, how much of a cataract this arc length is (for rocks, foam, mist) */
function cataractK(s){
  var k=0;
  for(var i=0;i<CATARACTS.length;i++){ var c=CATARACTS[i]; k=Math.max(k, 1-smooth(c.run*0.35, c.run*0.75, Math.abs(s-c.s))); }
  return k;
}
function riverHalfAt(s){ return RIVER_HALF + 9*Math.sin(s*0.0061) + 5*Math.sin(s*0.0173+1.3) - 8*cataractK(s); }
/* point + unit tangent (pointing downstream) at arc length s */
function riverAt(s){
  s = clamp(s, 0, RIVER_LEN-0.01);
  var lo=0, hi=RIVER_CUM.length-1;
  while(lo<hi-1){ var m=(lo+hi)>>1; if(RIVER_CUM[m]<=s) lo=m; else hi=m; }
  var t=(s-RIVER_CUM[lo])/(RIVER_CUM[lo+1]-RIVER_CUM[lo]);
  var dx=RIVER[lo+1][0]-RIVER[lo][0], dz=RIVER[lo+1][1]-RIVER[lo][1], L=Math.hypot(dx,dz)||1;
  return { x:mix(RIVER[lo][0],RIVER[lo+1][0],t), z:mix(RIVER[lo][1],RIVER[lo+1][1],t), tx:dx/L, tz:dz/L };
}
/* signed distance to the waterline: >0 on land, <0 in the water */
function riverDist(x,z){ var rv=polyNear(x,z,RIVER,RIVER_CUM); return rv.d - riverHalfAt(rv.t); }
function inRiver(x,z,margin){ return riverDist(x,z) < (margin||0); }

/* ============================== 3. TERRAIN FIELD ==============================
   "slightly but not very hilly": +-14 m swells over 600 m, smaller ripples,
   the river in a shallow vale. Root mounds under the hypertrees are added by
   30-layout.js through TERRAIN_MOUNDS once the trees are placed. */
var TERRAIN_MOUNDS = [];           /* [x, z, radius, height] */
function terrainH(x,z){
  var rv = polyNear(x,z,RIVER,RIVER_CUM);
  var s = rv.t, d = rv.d;
  var wl = riverLevel(s), half = riverHalfAt(s);
  var away = smooth(half+10, half+420, d);
  var h = wl + 2.2
        + 9.0*away
        + 13*sig(x+900, z-400, 0.0017)*smooth(half+30, half+360, d)
        + 4.5*sig(x-300, z+700, 0.0058)*smooth(half+10, half+160, d)
        + 0.9*sig(x, z, 0.031);
  h = Math.max(h, wl + 1.2 + 0.8*sig(x,z,0.02));
  /* far hills so the horizon is not a plate */
  var e = Math.max(Math.abs(x),Math.abs(z));
  h += 70*smooth(2200, 3500, e)*(0.5+0.5*fbm(x*0.0011+3, z*0.0011-8));
  /* the channel */
  if(d < half + 26){
    var ck = cataractK(s);
    var bed = wl - (2.8 - 1.9*ck)*(1 - smooth(half*0.35, half, d)) - 0.5
            + ck*0.9*sig(x*1.0, z*1.0, 0.09);           /* broken rock in the rapids */
    h = mix(bed, h, smooth(half-3, half+24, d));
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
