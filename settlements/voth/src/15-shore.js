/* ============================== 4. THE SHORELINE ==============================
   The old build parameterised everything as a bearing from one bay centre.
   A lake that opens north with the city on its east shore needs something
   general: trace the waterline once, then address it by arc length. */

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

/* The coast is not a closed loop inside the map — it leaves through the
   strait at the north. So trace both ways from the bay's south end and
   join them: s then runs from the north-west map edge, down the west
   shore, round the bay, and back up the east shore to the north-east. */
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

