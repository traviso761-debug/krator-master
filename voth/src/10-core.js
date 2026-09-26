/* ============================== 1. CORE ============================== */

var SEED = 20260914;
var seed = SEED;
function rnd(){ seed = (seed*16807) % 2147483647; return (seed-1)/2147483646; }
function rr(a,b){ return a + (b-a)*rnd(); }
function ri(a,b){ return Math.floor(a + (b-a+1)*rnd()); }
function pick(a){ return a[Math.floor(rnd()*a.length)]; }
function chance(p){ return rnd() < p; }
function reseed(s){ seed = s; }

function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function smooth(e0,e1,x){ var t=clamp((x-e0)/(e1-e0),0,1); return t*t*(3-2*t); }
function mix(a,b,t){ return a+(b-a)*t; }
/* smooth minimum — rounds the joins where water shapes meet */
function smin(a,b,k){ var h=clamp(0.5+0.5*(b-a)/k,0,1); return mix(b,a,h) - k*h*(1-h); }

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

/* geometry helpers */
function segDist(px,pz, ax,az, bx,bz){
  var vx=bx-ax, vz=bz-az, wx=px-ax, wz=pz-az;
  var L=vx*vx+vz*vz; var t = L>0 ? clamp((wx*vx+wz*vz)/L,0,1) : 0;
  var dx=px-(ax+vx*t), dz=pz-(az+vz*t);
  return Math.sqrt(dx*dx+dz*dz);
}
function polyDist(px,pz, pts){
  var m=1e9;
  for(var i=0;i<pts.length-1;i++){
    var d=segDist(px,pz, pts[i][0],pts[i][1], pts[i+1][0],pts[i+1][1]);
    if(d<m) m=d;
  }
  return m;
}
var _rv = { d:0, t:0 };
function polyNear(px,pz, pts, cum){
  var m=1e9, bt=0;
  for(var i=0;i<pts.length-1;i++){
    var ax=pts[i][0], az=pts[i][1], bx=pts[i+1][0], bz=pts[i+1][1];
    var vx=bx-ax, vz=bz-az, wx=px-ax, wz=pz-az;
    var LL=vx*vx+vz*vz, t = LL>0 ? clamp((wx*vx+wz*vz)/LL,0,1) : 0;
    var dx=px-(ax+vx*t), dz=pz-(az+vz*t), d=Math.sqrt(dx*dx+dz*dz);
    if(d<m){ m=d; bt = (cum[i] + t*(cum[i+1]-cum[i])) / cum[cum.length-1]; }
  }
  _rv.d = m; _rv.t = bt; return _rv;
}
function cumLen(pts){
  var c=[0];
  for(var i=1;i<pts.length;i++) c.push(c[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
  return c;
}
/* do segments ab and cd cross? (used to keep the bridge graph planar) */
function segCross(ax,az,bx,bz, cx,cz,dx,dz){
  function o(px,pz,qx,qz,rx,rz){ return (qx-px)*(rz-pz) - (qz-pz)*(rx-px); }
  var d1=o(ax,az,bx,bz,cx,cz), d2=o(ax,az,bx,bz,dx,dz);
  var d3=o(cx,cz,dx,dz,ax,az), d4=o(cx,cz,dx,dz,bx,bz);
  return ((d1>0)!==(d2>0)) && ((d3>0)!==(d4>0));
}

/* ============================== 2. WORLD CONSTANTS ============================== */

var WORLD = 10800, HW = WORLD/2;   /* terrain extent — land runs to the horizon */
/* the ground texture / mask covers this box. Must clear the farthest thing
   actually built, not just CITY_LIM — farms and manors read zoneAt's own
   shore/river distance rules, not CITY_LIM, and sit as far out as ~3800 in
   the current layout (checked by probing every placed instance's position).
   Ground beyond this falls back to per-vertex terrain colour, which a coarse
   far mesh cannot resolve as finely — that gap reading as a flat, washed-out
   band under real buildings was the bug, not merely a hard edge at the old
   2400. Leave real margin above the actual max when the layout changes. */
var CITY_EXT = 3900;
var CITY_LIM = 2280;               /* nothing city-walled/core is built beyond this */
var SEA = 0;                       /* lake surface */

/* ---- the water body ----------------------------------------------------
   A southern bay that narrows, then opens north into a wide brackish lake
   that reaches a hazy far shore, pierced by a strait running on to the sea. */
var WATER = [
  { k:'c', x:-180, z: 900, r: 980 },                              // bay, south lobe
  { k:'c', x: 150, z: 520, r: 680 },                              // bay, east side
  { k:'c', x:-700, z: 430, r: 620 },                              // bay, west arm
  { k:'s', ax:-90, az: 240, bx: 150, bz:-640, r: 560 },           // the narrows
  { k:'c', x:-320, z:-1720, r:1320 },                             // lake, south basin
  { k:'c', x: 260, z:-2900, r:1880 },                             // lake, main body
  { k:'c', x:-1180, z:-2520, r:1460 },                            // lake, west reach
  { k:'c', x: 1420, z:-2060, r: 980 },                            // lake, east reach
  { k:'s', ax: 560, az:-3800, bx:1020, bz:-6000, r: 340 },        // strait to the sea
  { k:'s', ax: 880-0.923*420, az:1160-0.385*420, bx: 880+0.923*150, bz:1160+0.385*150, r: 150 }  // the river's estuary
];
function waterSDF(x,z){
  var d = 1e9;
  for(var i=0;i<WATER.length;i++){
    var W = WATER[i], e;
    if(W.k==='c') e = Math.sqrt((x-W.x)*(x-W.x)+(z-W.z)*(z-W.z)) - W.r;
    else          e = segDist(x,z, W.ax,W.az, W.bx,W.bz) - W.r;
    d = (i===0) ? e : smin(d, e, 210);
  }
  return d;
}
/* signed distance to the waterline: >0 inland, <0 under water */
function landDist(x,z){
  return waterSDF(x,z)
       + 86*sig(x+17, z-31, 0.00105)
       + 30*sig(x-63, z+11, 0.00340);
}

/* ---- the river: enters the bay at its south-east corner and runs east ---- */
/* gentle nudge per the owner ("looks too much like a dugout channel and not
   natural, make it a little more wavy"): the original 7 hand-placed points
   stay exactly where they were — [0] especially, since it's the estuary
   mouth the WATER circle in the array above is centred on — one mild
   sinusoidal-offset midpoint is inserted into each of the 6 segments
   between them instead. Alternating sign per segment gives a natural
   meander rather than a one-sided bulge; amplitude is smallest on the
   first segment (closest to the mouth/estuary, where other geometry is
   keyed tightly to RIVER's exact path) and largest in the open middle
   stretch. Every consumer of RIVER (polyNear/polyDist/riverAt/riverHalf/
   inRiver — all in 10/30/40/55/60/68/70) just walks whatever points are
   here, so this is a safe "more waypoints on the same course" change, not
   a different river. */
var RIVER = (function(){
  var anchor = [[880,1160],[1290,1330],[1830,1520],[2520,1760],[3400,2060],[4500,2400],[5900,2760]];
  var amp = [22, 52, 68, 58, 74, 54];
  var pts = [anchor[0]];
  for(var i=0;i<anchor.length-1;i++){
    var a=anchor[i], b=anchor[i+1];
    var dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz);
    var px=-dz/L, pz=dx/L, sign=(i%2===0)?1:-1;
    pts.push([ (a[0]+b[0])/2 + px*amp[i]*sign, (a[1]+b[1])/2 + pz*amp[i]*sign ]);
    pts.push(b);
  }
  return pts;
})();
var RIVER_CUM = cumLen(RIVER);
/* the carved channel continues out under the bay, so the mouth is open water
   rather than a pool behind a bar of shore */
var RIVERC = [[ 880 - 300*0.923, 1160 - 300*0.385 ]].concat(RIVER);
var RIVERC_CUM = cumLen(RIVERC);

/* ---- relief: named ranges so the far landscape is not just noise --------- */
var RIDGES = [
  [ 1820,  520, 230, 620], [ 2450, -360, 275, 700], [ 2150, 1500, 180, 560],
  [ 1500,-1500, 205, 560], [ 2900,-1700, 250, 720], [-1750,  980, 215, 600],
  [-2400,  180, 240, 680], [-1450, 1520, 170, 520], [ 3400,  900, 260, 760],
  [-3100, -900, 230, 700], [ 3200,-3000, 300, 900], [-2600,-3400, 280, 860],
  /* the far shore across the lake */
  [ -400,-4400, 210, 900], [ 1500,-4300, 245, 950], [-2000,-4200, 190, 820],
  [ 2600,-4600, 230, 880], [-3300,-4500, 210, 900]
];

/* ---- islets in the bay and the lake: x, z, height, radius, kind ---------- */
var ISLES = [
  [-430, 880, 16, 78, 'shrine'],
  [ -14, 322, 12, 58, 'rock'],
  [-540,  60, 15, 70, 'light'],
  [ 250,-760, 20, 84, 'light'],
  [-760,-980, 12, 58, 'shrine'],
  [ 640,-1420, 11, 52, 'rock'],
  [-160,-1850, 17, 76, 'light']
];

/* ============================== 3. TERRAIN FIELD ============================== */

function terrainH(x,z){
  var L = landDist(x,z);
  var h;
  if(L <= 0){
    /* a broad shallow shelf around the whole rim — this is what makes
       chinampas and a canton ring possible — then a deep central basin */
    var dep = -L;
    h = -1.2 - 3.6*smooth(0,70,dep) - 9*smooth(70,330,dep)
             - 23*smooth(330,920,dep) - 15*smooth(920,2100,dep);
  }else{
    /* a gentle shelf, so the city stands on ground that barely tilts */
    h = 2.0 + 20*smooth(0,700,L) + 38*smooth(760,1700,L);
  }

  /* hills begin inland of the city; the river's floodplain stays flat */
  var rv = polyNear(x,z,RIVERC,RIVERC_CUM);
  var dr = rv.d, rt = Math.max(0, (rv.t*RIVERC_CUM[RIVERC_CUM.length-1] - 300) / RIVER_CUM[RIVER_CUM.length-1]);
  var amp = 86 * smooth(340,1500,L) * smooth(120,620,dr);
  var hs = sig(x+3100, z-1700, 0.00134);
  h += amp * (hs > 0 ? hs : hs*0.5);              /* hills rise more than valleys sink */
  h += 4.2 * sig(x, z, 0.0042) * smooth(0,200,Math.abs(L));
  if(L > 30) h = Math.max(h, 2.6 + 0.012*L);       /* inland ground never drops below the lake */

  /* named ranges, held back from the waterline so they never lift the shore */
  var inland = smooth(-10, 340, L);
  if(inland > 0.002){
    for(var i=0;i<RIDGES.length;i++){
      var R=RIDGES[i], ax=x-R[0], az=z-R[1], q=(ax*ax+az*az)/(R[3]*R[3]);
      if(q < 4) h += R[2]*Math.exp(-q*1.45) * (0.72 + 0.56*fbm(x*0.0042,z*0.0042)) * inland;
    }
    /* broad rise towards the map edge, so nothing reads as a cut-off plate */
    var e = Math.max(Math.abs(x),Math.abs(z));
    h += 240*smooth(2600,5100,e) * (0.60 + 0.74*fbm(x*0.0019+9, z*0.0019-4)) * inland;
  }

  /* the river holds water the whole way: the bed stays just below the
     surface and the valley sides rise instead */
  var chan = 40 + 44*rt;                 /* half-width of the water */
  var vale = 260 + 900*rt;
  if(dr < vale){
    var bank = smooth(chan-6, chan+22, dr);                       /* the bank itself */
    var bed = -5.5 + 8.4*bank
            + (30 + 170*rt)*smooth(chan+22, vale*0.82, dr)         /* the floodplain */
            + 3.0*sig(x,z,0.004)*smooth(chan+10, chan*2.4+40, dr);
    var w = 1 - smooth(chan*0.62, vale, dr);
    if(L < 0) bed = Math.min(bed, h);            /* in open water the river only deepens, never raises */
    h = mix(h, bed, w);
  }

  /* islets: a cone profile blended over the lake floor */
  for(var k=0;k<ISLES.length;k++){
    var I=ISLES[k], bx=x-I[0], bz=z-I[1];
    var u = Math.sqrt(bx*bx+bz*bz)/I[3];
    if(u < 1.5){
      var prof = I[2]*(1-smooth(0.12,1.0,u)) - 5*smooth(0.9,1.5,u);
      h = mix(h, prof, 1-smooth(0.95,1.45,u));
    }
  }

  return h;
}

