// ================================================================= BIOME CORE — head
// The engine-independent kit every Krator biome fragment is written against.
// Nothing below names a world's kit. The host hands in what a biome needs
// through BIO.init(...) (see BIOME-API.md) and everything else lives here.
var BIO={host:null,stats:{},cur:null,version:'core-1'};
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

// ---------------------------------------------------------------- host binding
// host = { THREE, scene, terrainH(x,z), field, mask(x,z), obstacles[], ticks(fn), seed,
//          origin[x,z] | [[x,z]...], center, fields{}, waterH(x,z), register(o),
//          lod{}, windows{}, eye(), err(msg), stat(key,tris,inst) }   (BIOME-API.md)
BIO.init=function(h){
 if(!h||!h.THREE)throw new Error('BIO.init: host needs THREE');
 // scene may arrive later (a world that creates its scene after its kit loads
 // calls BIO.setScene before build); it is only needed at bake
 BIO.host={
  THREE:h.THREE,scene:h.scene||null,
  terrainH:h.terrainH||((x,z)=>0),
  // field (2026-10-08): the host's baked ground (core/terrain/30-core-field.js, a KFIELD field) when its terrainH reads
  // one; BIO.export hands it to Godot as the ground's `field`. null: the export samples terrainH as before
  field:h.field||null,
  // placeH (2026-10-08): the ground placement DECIDES on (the default mask's and BIO.depth's water depth); terrainH
  // when omitted. A host whose terrainH reads a baked field passes the closure it baked from, so its plants keep their
  // places and only take the field's height, until the reseeding event moves them once (biomes/WORLD.md, Order)
  placeH:h.placeH||null,
  // the default mask: everything may root, or, when the host hands in its water
  // (sedesert-1), nothing roots under the local water surface. A world with
  // footprints or its own rule passes its own.
  mask:h.mask||(h.waterH?((x,z)=>{const d=BIO.placeH(x,z)-BIO.waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;}):((x,z)=>1)),
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
  // lod (sedesert-1): the detail radii from the spine, a property of the world's spine, not of
  // a species pass: hero (full detail), mid, far (impostors stop), floor bands. BIO.radii().
  lod:Object.assign({hero:800,mid:1500,far:2200,floor:[500,1250]},h.lod||{}),
  // windows (sedesert-1): named rectangles [x0,z0,x1,z1] a biome may ask for (BIO.window('water')):
  // where the world's water is, so a water-bound pass looks nowhere else
  windows:h.windows||{},
  // eye (swbay-1): optional ()->[x,y,z], where the viewer is right now. Only a pass that
  // animates (fauna) reads it, to leave what is far alone; null means no LOD.
  eye:h.eye||null,
  // clock / wind (one world, one wind: biomes/WORLD.md): clock()->seconds drives the foliage's sway
  // instead of the core's own clock; wind()->[x,z] (1 = the calm breeze) bends it downwind. A world
  // with core/atmos binds clock:()=>ATMOS.clock.t and wind:()=>the base wind over its calm length.
  clock:h.clock||null,wind:h.wind||null,
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
BIO.placeH=function(x,z){return BIO.host?(BIO.host.placeH||BIO.host.terrainH)(x,z):0;};
BIO.depth=function(x,z){return BIO.waterH(x,z)-BIO.placeH(x,z);};
BIO.register=function(o){if(BIO.host)BIO.host.register(o);};
// the detail radii (sedesert-1, where it was BIO.LOD(); BIO.LOD is the runtime LOD's settings)
BIO.radii=function(){return BIO.host?BIO.host.lod:{hero:800,mid:1500,far:2200,floor:[500,1250]};};
BIO.window=function(n){return (BIO.host&&BIO.host.windows[n])||null;};
BIO.eye=function(){return BIO.host&&BIO.host.eye?BIO.host.eye():null;};
// the bounding box of the LOD spine, padded: every point within `pad` of an origin lies inside it
BIO.originBox=function(pad){const O=BIO.host?BIO.host.origin:[[0,0]];let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const o of O){x0=Math.min(x0,o[0]);z0=Math.min(z0,o[1]);x1=Math.max(x1,o[0]);z1=Math.max(z1,o[1]);}return[x0-pad,z0-pad,x1+pad,z1+pad];};
// distance from the LOD origin, for the detail curve
BIO.lodD=function(x,z){const O=BIO.host?BIO.host.origin:[[0,0]];let m=1e9;for(let i=0;i<O.length;i++){const d=Math.hypot(x-O[i][0],z-O[i][1]);if(d<m)m=d;}return m;};
BIO.center=function(){const h=BIO.host;return h?(h.center||h.origin[0]):[0,0];};
// flow and mist are additive (rift-1): a river bank, and the cloud-forest band a ridge wears on its wet face.
// cold and rock are additive (nhighlands-1): 0 temperate .. 1 boreal (altitude and aspect: the boreal band
// comes down lower on the north-facing slopes), and 0 soil .. 1 boulder ground and crag. An older biome
// never reads them; a host that never heard of them gets 0 for both.
BIO.fieldDefault={wet:(x,z)=>BIO.terrainH(x,z)<2?1:.6,salt:(x,z)=>0,upland:(x,z)=>0,flow:(x,z)=>0,mist:(x,z)=>0,cold:(x,z)=>0,rock:(x,z)=>0};
// a field a world does not bind is 0, except the ones with a meaningful default (sedesert-1)
const ZEROF=(x,z)=>0;
BIO.field=function(n,x,z){const f=BIO.host&&BIO.host.fields[n];return f?f(x,z):(BIO.fieldDefault[n]||ZEROF)(x,z);};
BIO.hasField=function(n){return !!(BIO.host&&BIO.host.fields[n]);};
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
