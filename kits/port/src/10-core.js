// ---------------------------------------------------------------- error panel
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));

// ---------------------------------------------------------------- rng + noise
let _seed=1234567;
function reseed(s){_seed=s>>>0;}
function rng(){_seed|=0;_seed=_seed+0x6D2B79F5|0;let t=Math.imul(_seed^_seed>>>15,1|_seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
function rr(a,b){return a+(b-a)*rng();}
function h3(x,y,z){const s=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453;return s-Math.floor(s);}
// Each h3 is a Math.sin, and sampling a terrain or a texture asks for the same lattice cells again and again: a
// cell's eight corners are kept in a small direct-mapped cache (exact: the same h3 values, the same arithmetic in
// the same order, so the same results bit for bit). It was most of every biome's load.
var _vnK,_vnV;
function vnoise(x,y,z){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi;
 if(_vnK===undefined){_vnK=new Float64Array(4096*3).fill(NaN);_vnV=new Float64Array(4096*8);}
 const s=(Math.imul(xi|0,73856093)^Math.imul(yi|0,19349663)^Math.imul(zi|0,83492791))&4095,k=s*3,o=s*8,V=_vnV;
 if(_vnK[k]!==xi||_vnK[k+1]!==yi||_vnK[k+2]!==zi){_vnK[k]=xi;_vnK[k+1]=yi;_vnK[k+2]=zi;
  V[o]=h3(xi,yi,zi);V[o+1]=h3(xi+1,yi,zi);V[o+2]=h3(xi,yi+1,zi);V[o+3]=h3(xi+1,yi+1,zi);
  V[o+4]=h3(xi,yi,zi+1);V[o+5]=h3(xi+1,yi,zi+1);V[o+6]=h3(xi,yi+1,zi+1);V[o+7]=h3(xi+1,yi+1,zi+1);}
 const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);
 const a=V[o]+(V[o+1]-V[o])*u,b=V[o+2]+(V[o+3]-V[o+2])*u,c=V[o+4]+(V[o+5]-V[o+4])*u,d=V[o+6]+(V[o+7]-V[o+6])*u;
 const e=a+(b-a)*v,f=c+(d-c)*v;return e+(f-e)*w;}
function fbm(x,y,z,o){o=o||3;let a=0,f=1,s=0;for(let i=0;i<o;i++){a+=vnoise(x*f,y*f,z*f)/f;s+=1/f;f*=2.03;}return a/s;}
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, TAU=Math.PI*2;

// GROUND HEIGHT HOOK. Flat everywhere for now — the whole kit stands on y=0 —
// but every piece of code that meets the ground asks here instead of assuming
// zero, so the Krator terrain pass replaces this one function and the aprons,
// the trees and the fallen fragments all follow the ground without a builder
// being touched. Keep it cheap: it is called per tree and per rubble block.
function terrainH(x,z){return 0;}

