/* ==== 1. CORE ==== */

/* what moves: each stage that animates pushes a function of the time here, and the one render loop (71) runs them */
var animHooks = [];

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

function segCross(ax,az,bx,bz, cx,cz,dx,dz){
  function o(px,pz,qx,qz,rx,rz){ return (qx-px)*(rz-pz) - (qz-pz)*(rx-px); }
  var d1=o(ax,az,bx,bz,cx,cz), d2=o(ax,az,bx,bz,dx,dz);
  var d3=o(cx,cz,dx,dz,ax,az), d4=o(cx,cz,dx,dz,bx,bz);
  return ((d1>0)!==(d2>0)) && ((d3>0)!==(d4>0));
}
