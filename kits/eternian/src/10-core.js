// ================================================================= SCYVOI KIT - core: error panel, rng, noise
// Units are metres; x east, y up, z south (north is -z). A building's local frame: origin at the plot centre on the
// ground, +z its front, x its right. A person is 1.75 m; a riding salamander's saddle stands 1.5 m.
// ---------------------------------------------------------------- error panel
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
/* three.js r128 logs a failed shader compile with console.error and simply does not draw the mesh: window.onerror never
   fires. Forward those to the panel so a vanished surface is an error, not a mystery. */
{const ce=console.error.bind(console);console.error=function(){try{const m=Array.prototype.join.call(arguments,' ');if(/shader|WebGLProgram|GL_INVALID/i.test(m))reportErr('GL: '+m.slice(0,600));}catch(e){}return ce.apply(console,arguments);};}

// ---------------------------------------------------------------- rng + noise
// One global stream. Every builder opens with reseed(N) (place() does it from the def's seed), so a change inside
// one tent cannot move the weave of another.
let _seed=1234567;
function reseed(s){_seed=s>>>0;}
function rng(){_seed|=0;_seed=_seed+0x6D2B79F5|0;let t=Math.imul(_seed^_seed>>>15,1|_seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
function rr(lo,hi){return lo+(hi-lo)*rng();}
function pick(arr){return arr[Math.floor(rng()*arr.length)];}
function h3(x,y,z){const s=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453;return s-Math.floor(s);}
// value noise with a small direct-mapped cache of lattice corners (exact: the same h3 values in the same order)
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
function fbm(x,y,z,oct){oct=oct||3;let acc=0,fr=1,sum=0;for(let i=0;i<oct;i++){acc+=vnoise(x*fr,y*fr,z*fr)/fr;sum+=1/fr;fr*=2.03;}return acc/sum;}
const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v, lerp=(lo,hi,t)=>lo+(hi-lo)*t, TAU=Math.PI*2, PI=Math.PI;
const smooth=(e0,e1,v)=>{const t=clamp((v-e0)/(e1-e0),0,1);return t*t*(3-2*t);};

// GROUND HEIGHT HOOK. The kit sheet stands on flat ground (y = 0); the Baelu carries its own rock outcrop. Everything
// that meets the ground asks here, so a world that places the kit on terrain replaces this one function.
function terrainH(x,z){return 0;}
// FRAME HOOKS: f(dt, now) every frame (92-camera.js runs them), declared here so any fragment can register one at load
const FRAME_HOOKS=[];
