// ================================================================= BIOME CORE — head
// The engine-independent kit every Krator biome fragment is written against.
// Nothing below names a world's kit. The host hands in what a biome needs
// through BIO.init(...) (see BIOME-API.md) and everything else lives here.
var BIO={host:null,stats:{},cur:null,version:'nhighlands-1'};
// EVERYTHING BELOW IS LOCAL. The core declares no generic global (rng, clamp,
// TAU...): a world that already has those would be clobbered. Biome fragments
// pull what they need from BIO.fn at the top of their own closure.
(function(){
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, mix=lerp;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

// ---------------------------------------------------------------- PRNG
// The biome's OWN stream. A host that adds a biome must not see its rubble
// move, so the biome never draws from the host's generator.
let _bseed=1234567;
function reseed(s){_bseed=s>>>0;}
function rng(){_bseed|=0;_bseed=_bseed+0x6D2B79F5|0;let t=Math.imul(_bseed^_bseed>>>15,1|_bseed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
function rr(a,b){return a+(b-a)*rng();}
function ri(a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(arr){return arr[Math.floor(rng()*arr.length)%arr.length];}

// ---------------------------------------------------------------- noise
function h3(x,y,z){const s=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453;return s-Math.floor(s);}
function vnoise(x,y,z){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi;
 const sm=t=>t*t*(3-2*t);const u=sm(xf),v=sm(yf),w=sm(zf);const l=(a,b,t)=>a+(b-a)*t;
 return l(l(l(h3(xi,yi,zi),h3(xi+1,yi,zi),u),l(h3(xi,yi+1,zi),h3(xi+1,yi+1,zi),u),v),
          l(l(h3(xi,yi,zi+1),h3(xi+1,yi,zi+1),u),l(h3(xi,yi+1,zi+1),h3(xi+1,yi+1,zi+1),u),v),w);}
function fbm(x,y,z,o){o=o||3;let a=0,f=1,s=0;for(let i=0;i<o;i++){a+=vnoise(x*f,y*f,z*f)/f;s+=1/f;f*=2.03;}return a/s;}

// ---------------------------------------------------------------- host binding
// host = { THREE, scene, terrainH(x,z), mask(x,z), obstacles[], ticks(fn), seed,
//          origin[x,z], err(msg), stat(key,tris,inst) }
BIO.init=function(h){
 if(!h||!h.THREE)throw new Error('BIO.init: host needs THREE');
 // scene may arrive later (a world that creates its scene after its kit loads
 // calls BIO.setScene before build); it is only needed at bake
 BIO.host={
  THREE:h.THREE,scene:h.scene||null,
  terrainH:h.terrainH||((x,z)=>0),
  mask:h.mask||((x,z)=>1),
  obstacles:h.obstacles||[],
  ticks:h.ticks||(fn=>{}),
  seed:h.seed==null?1:h.seed,
  // origin: [x,z] or a LIST of [x,z] -- the LOD curve is measured from the
  // nearest one, so a long showcase (a lake shore, a river) can keep detail
  // along a spine instead of round one point. center: the disc the grids
  // cover (default: the first origin).
  origin:(h.origin&&typeof h.origin[0]==='number')?[h.origin]:(h.origin||[[0,0]]),
  center:h.center||null,
  // fields: optional climate fields a multi-zone biome asks for, each
  // (x,z)->0..1. Missing ones fall back to BIO.fieldDefault. wet: 0 arid ..
  // 1 saturated; salt: 0 .. 1 crust; upland: 0 basin floor .. 1 the high edge;
  // flow: 0 still .. 1 a bank; mist: 0 .. 1 the cloud-forest band.
  fields:h.fields||{},
  // waterH(x,z) (sedesert-1, additive): the LOCAL water surface. The earlier kits keep
  // their water at y=0 (the default); a stream that descends, or a tarn in a hollow,
  // hands its own level in, and a biome reads depth as BIO.depth = waterH - terrainH.
  // Where there is no water at all the host returns -1e9.
  waterH:h.waterH||((x,z)=>0),
  // register(o) (sedesert-1, additive): a volume the world's inspector and probe can name
  // ({name,key,x,z,y,r,h}); a world without an inspector leaves it out
  register:h.register||(o=>{}),
  err:h.err||(m=>console.error(m)),
  stat:h.stat||null};
 reseed(BIO.host.seed*7919+11);
 return BIO;};
BIO.setScene=function(s){BIO.host.scene=s;};
BIO.err=function(m){if(BIO.host)BIO.host.err(m);else console.error(m);};
BIO.terrainH=function(x,z){return BIO.host?BIO.host.terrainH(x,z):0;};
BIO.mask=function(x,z){return BIO.host?BIO.host.mask(x,z):1;};
BIO.waterH=function(x,z){return BIO.host?BIO.host.waterH(x,z):0;};
// depth of the ground under the local water surface (negative: above it)
BIO.depth=function(x,z){return BIO.waterH(x,z)-BIO.terrainH(x,z);};
BIO.register=function(o){if(BIO.host)BIO.host.register(o);};
// distance from the LOD origin, for the detail curve
BIO.lodD=function(x,z){const O=BIO.host?BIO.host.origin:[[0,0]];let m=1e9;for(let i=0;i<O.length;i++){const d=Math.hypot(x-O[i][0],z-O[i][1]);if(d<m)m=d;}return m;};
BIO.center=function(){const h=BIO.host;return h?(h.center||h.origin[0]):[0,0];};
// flow and mist are additive (rift-1): a river bank, and the cloud-forest band a ridge wears on its wet face.
// cold and rock are additive (nhighlands-1): 0 temperate .. 1 boreal (altitude and aspect: the boreal band
// comes down lower on the north-facing slopes), and 0 soil .. 1 boulder ground and crag. An older biome
// never reads them; a host that never heard of them gets 0 for both.
BIO.fieldDefault={wet:(x,z)=>BIO.terrainH(x,z)<2?1:.6,salt:(x,z)=>0,upland:(x,z)=>0,flow:(x,z)=>0,mist:(x,z)=>0,cold:(x,z)=>0,rock:(x,z)=>0};
BIO.field=function(n,x,z){const f=BIO.host&&BIO.host.fields[n];return f?f(x,z):BIO.fieldDefault[n](x,z);};
// LOD is a CURVE, not two steps: full detail under ~700 m, a quarter by 3 km.
BIO.lod=function(x,z){return clamp(1.18-BIO.lodD(x,z)/2600,.22,1);};

// ---------------------------------------------------------------- accounting
// Every instance and merged triangle is charged to BIO.cur ('jungle/hyper',
// 'jungle/floor'...), so a probe can assert per-pass budgets.
BIO.tally=function(tris,inst,meshes){const k=BIO.cur||'biome';
 const t=BIO.stats[k]||(BIO.stats[k]={tris:0,inst:0,meshes:0});
 t.tris+=tris||0;t.inst+=inst||0;t.meshes+=meshes||0;
 if(BIO.host&&BIO.host.stat)BIO.host.stat(k,tris||0,inst||0);};
BIO.totals=function(){let tris=0,inst=0,meshes=0;for(const k in BIO.stats){tris+=BIO.stats[k].tris;inst+=BIO.stats[k].inst;meshes+=BIO.stats[k].meshes;}return{tris,inst,meshes};};

BIO.fn={TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm};
})();
