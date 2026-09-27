/* ==== 2. WORLD CONSTANTS ==== */
await stage('world');   /* the loading screen (src/core/diag.js) gets a frame to say so */

var WORLD = 10800, HW = WORLD/2;   /* terrain extent — land runs to the horizon */

var CITY_EXT = 3900;
var CITY_LIM = 2280;               /* nothing city-walled/core is built beyond this */
var SEA = 0;                       /* lake surface */

/* ==== the water body ==== */
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

/* ==== the river: enters the bay at its south-east corner and runs east ==== */

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

var RIVERC = [[ 880 - 300*0.923, 1160 - 300*0.385 ]].concat(RIVER);
var RIVERC_CUM = cumLen(RIVERC);

/* ==== relief: named ranges so the far landscape is not just noise ==== */
var RIDGES = [
  [ 1820,  520, 230, 620], [ 2450, -360, 275, 700], [ 2150, 1500, 180, 560],
  [ 1500,-1500, 205, 560], [ 2900,-1700, 250, 720], [-1750,  980, 215, 600],
  [-2400,  180, 240, 680], [-1450, 1520, 170, 520], [ 3400,  900, 260, 760],
  [-3100, -900, 230, 700], [ 3200,-3000, 300, 900], [-2600,-3400, 280, 860],
  /* the far shore across the lake */
  [ -400,-4400, 210, 900], [ 1500,-4300, 245, 950], [-2000,-4200, 190, 820],
  [ 2600,-4600, 230, 880], [-3300,-4500, 210, 900]
];

/* ==== islets in the bay and the lake: x, z, height, radius, kind ==== */
var ISLES = [
  [-430, 880, 16, 78, 'shrine'],
  [ -14, 322, 12, 58, 'rock'],
  [-540,  60, 15, 70, 'light'],
  [ 250,-760, 20, 84, 'light'],
  [-760,-980, 12, 58, 'shrine'],
  [ 640,-1420, 11, 52, 'rock'],
  [-160,-1850, 17, 76, 'light']
];

/* ==== 3. TERRAIN FIELD ==== */

function terrainH(x,z){
  var L = landDist(x,z);
  var h;
  if(L <= 0){

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

/* ==== 4. THE SHORELINE ==== */

function sdGrad(x,z){
  var e = 7;
  var gx = (landDist(x+e,z) - landDist(x-e,z)) / (2*e);
  var gz = (landDist(x,z+e) - landDist(x,z-e)) / (2*e);
  var m = Math.hypot(gx,gz) || 1;
  return [gx/m, gz/m];                       /* unit, pointing inland */
}
function toShore(x,z){
  for(var k=0;k<5;k++){
    var d = landDist(x,z), g = sdGrad(x,z);
    x -= d*g[0]; z -= d*g[1];
  }
  return [x,z];
}
function traceShore(sx,sz, step, maxN, dir){
  var p = toShore(sx,sz), pts = [p], x = p[0], z = p[1];
  for(var i=0;i<maxN;i++){
    var g = sdGrad(x,z);
    x += dir*(-g[1])*step;
    z += dir*( g[0])*step;
    var q = toShore(x,z); x=q[0]; z=q[1];
    if(Math.abs(x) > HW-260 || Math.abs(z) > HW-260) break;
    pts.push([x,z]);
    if(i > 40 && Math.hypot(x-p[0], z-p[1]) < step*0.8) break;
  }
  return pts;
}

var SHORE = (function(){
  var west = traceShore(-150, 1200, 24, 2600,  1);
  var east = traceShore(-150, 1200, 24, 2600, -1);
  west.reverse();
  return west.concat(east.slice(1));
})();
var SCUM  = cumLen(SHORE);
var SLEN  = SCUM[SCUM.length-1];

function shoreAt(s){
  s = clamp(s, 0, SLEN);
  var lo=0, hi=SCUM.length-1;
  while(lo < hi-1){ var m=(lo+hi)>>1; if(SCUM[m] <= s) lo=m; else hi=m; }
  var t = (s - SCUM[lo]) / Math.max(1e-6, SCUM[lo+1]-SCUM[lo]);
  return [ mix(SHORE[lo][0],SHORE[lo+1][0],t), mix(SHORE[lo][1],SHORE[lo+1][1],t) ];
}
function shoreNorm(s){
  var a = shoreAt(clamp(s-14,0,SLEN)), b = shoreAt(clamp(s+14,0,SLEN));
  var tx = b[0]-a[0], tz = b[1]-a[1], m = Math.hypot(tx,tz) || 1;
  /* rotate the tangent to the side that increases landDist */
  var nx = tz/m, nz = -tx/m;
  var p = shoreAt(s);
  if(landDist(p[0]+nx*20, p[1]+nz*20) < landDist(p[0]-nx*20, p[1]-nz*20)){ nx=-nx; nz=-nz; }
  return [nx,nz];
}
/* a point `inset` units inland of the shore (negative = out into the water) */
function shoreIn(s, inset){
  var p = shoreAt(s), n = shoreNorm(s);
  return [ p[0] + n[0]*inset, p[1] + n[1]*inset ];
}
/* --- spatial index, so shoreS is cheap enough for the placement loops --- */
var SBUCK = {}, SB = 200;
(function(){
  for(var i=0;i<SHORE.length;i++){
    var k = Math.floor(SHORE[i][0]/SB) + ',' + Math.floor(SHORE[i][1]/SB);
    (SBUCK[k] || (SBUCK[k]=[])).push(i);
  }
})();
function shoreScan(x,z,list){
  var best=-1, bd=1e18;
  for(var n=0;n<list.length;n++){
    var i=list[n], dx=SHORE[i][0]-x, dz=SHORE[i][1]-z, d=dx*dx+dz*dz;
    if(d<bd){ bd=d; best=i; }
  }
  return best;
}
/* arc-length position of the shore point nearest a place */
function shoreS(x,z){
  var bi = Math.floor(x/SB), bj = Math.floor(z/SB);
  for(var ring=1; ring<=4; ring++){
    var cand=[];
    for(var i=bi-ring;i<=bi+ring;i++) for(var j=bj-ring;j<=bj+ring;j++){
      var a=SBUCK[i+','+j]; if(a) cand = cand.concat(a);
    }
    if(cand.length){
      var b = shoreScan(x,z,cand);
      if(b>=0) return SCUM[b];
    }
  }
  var full=[]; for(var q=0;q<SHORE.length;q++) full.push(q);
  return SCUM[shoreScan(x,z,full)];
}
/* bearing of the shore at s, as a rotation.y that points local +x inland */
function shoreRY(s){ var n = shoreNorm(s); return Math.atan2(-n[1], n[0]); }

window._shore = { n:SHORE.length, len:Math.round(SLEN) };
