// ================================================================= YETI KIT - core: error panel, rng, noise (the Scyvoi engine's, on core/rand)
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

// ---------------------------------------------------------------- rng + noise, on core/rand
// The Scyvoi engine's one global stream, kept (every builder opens with reseed(N); place() does it from the def's seed,
// so a change inside one building cannot move another), but drawn from core/rand: KRAND.stream is the same mulberry32,
// and h3, vnoise and fbm are KRAND's portable ones (no Math.sin), so a Godot port draws the same numbers. This is the
// one engine file this kit does not vendor (KNOWN_ISSUES.md, "10-core.js on core/rand"): the fix belongs upstream.
let _svSt=KRAND.stream(1234567);
const reseed=s=>{_svSt=KRAND.stream(s>>>0);};
const rng=()=>_svSt.next();
const rr=(lo,hi)=>lo+(hi-lo)*_svSt.next();
const pick=arr=>arr[Math.floor(_svSt.next()*arr.length)];
const SV_NOISE=4417;   /* the kit's noise seed */
const h3=(x,y,z)=>KRAND.h3(x,y,z,SV_NOISE);
const vnoise=(x,y,z)=>KRAND.vnoise(x,y,z,SV_NOISE);
const fbm=(x,y,z,oct)=>KRAND.fbm(x,y,z,oct||3,SV_NOISE);
const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v, lerp=(lo,hi,t)=>lo+(hi-lo)*t, TAU=Math.PI*2, PI=Math.PI;
const smooth=(e0,e1,v)=>{const t=clamp((v-e0)/(e1-e0),0,1);return t*t*(3-2*t);};

// GROUND HEIGHT HOOK. The kit sheet stands on flat ground (y = 0); the Baelu carries its own rock outcrop. Everything
// that meets the ground asks here, so a world that places the kit on terrain replaces this one function.
function terrainH(x,z){return 0;}
// FRAME HOOKS: f(dt, now) every frame (92-camera.js runs them), declared here so any fragment can register one at load
const FRAME_HOOKS=[];
