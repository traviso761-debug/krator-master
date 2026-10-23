/* ============================== PINNACLE ROCK — the flyers' sandbox: Girder's helpers ==============================
   build.py seals Girder's flyers (settlements/girder/src 84-flyers.js, 84b, 84c and the generic parts of 84a, READ IN
   PLACE) in one closure with these files (flyers/README.md): this one gives them the helpers Girder's core and kit
   give them on Girder's page, so Girder's code runs unchanged. The closure's parameter pageTerrainH is the page's
   terrainH; the flyers see the ground plus the forest's roof (20-world.js). */
var TAU = Math.PI*2;
var FAST = !!(typeof navigator !== 'undefined' && navigator.webdriver) || /[?&]fast/.test(location.search);
/* the setup's draws (Girder's rnd/reseed, Park-Miller there) on core/rand: a stream, reseeded by its seed */
var _flyStream = KRAND.stream(840001);
function reseed(s){ _flyStream = KRAND.stream(s >>> 0); }
function rnd(){ return _flyStream.next(); }
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function smooth(e0,e1,x){ var t=clamp((x-e0)/(e1-e0),0,1); return t*t*(3-2*t); }
function mix(a,b,t){ return a+(b-a)*t; }
function wrapPi(a){ while(a> Math.PI) a-=TAU; while(a<-Math.PI) a+=TAU; return a; }
function segDist(px,pz, ax,az, bx,bz){ var dx=bx-ax, dz=bz-az, L=dx*dx+dz*dz, t=L>0?clamp(((px-ax)*dx+(pz-az)*dz)/L,0,1):0; return Math.hypot(px-ax-dx*t, pz-az-dz*t); }
function shade(hex, f){ var c = new THREE.Color(hex); if(f>=0) c.lerp(new THREE.Color(0xffffff), f); else c.lerp(new THREE.Color(0x120f0a), -f); return c.getHex(); }
/* Girder's night-lit material wrapper without Girder's night glow (this page has none yet: P4) */
function nlMaterial(mat, key, extraHook){ mat.onBeforeCompile = function(sh){ if(extraHook) extraHook(sh); }; mat.customProgramCacheKey = function(){ return 'prfly|'+(key||''); }; return mat; }
/* the flyers push their frame update here on Girder's page; this page calls it from the host's hour ticks (90-out.js) */
var TICKS = [];
var PATHVIZ = [];
