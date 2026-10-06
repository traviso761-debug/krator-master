// ---------------------------------------------------------------- the salvage quarter: Post-Apoc homes
// Beside every smithy, where the salvaged sheet comes from, a few households live in what the smiths could not cut
// up: a grain silo, an earth-filled tyre ring, a bottle-glass cottage, a manor of Ancient bulkhead slabs, a stack of
// containers. They are the Post-Apoc set's own dwellings (kits/post-apoc, through the generated KratorPostApoc
// bundle, 70e), dressed in the Screamer culture pack (core/sockets: ochre rag, the skull) and FURNISHED inside by the
// interiors kit (kits/interiors, the 'post-apoc' set, 70d) with the catalog's Screamer furniture (culture 'screamer',
// falling back to scrap, beast-rider, generic).
//
// buildVillage calls apocHomes() as tier 4, before the fields: the homes are sited round the smithies, which are
// already claimed, and claim their own ground, so the farms fill what is left round them as they do round
// everything else. Siting draws NOTHING from the village's rng -- the candidate spots are a fixed ring round each
// smithy -- and the kit keeps its own seeded stream inside its closure, so every draw after this is the one it was.
// The fields still move where a home now stands, and only there.
//
// SCREAM.homes: [{key, name, x, y, z, ry, door:[x,y,z,yaw]}] in the village's frame, for the views and the life layer.
// window._apoc: the kit's counts (buildings, pieces of furniture, rooms, residence fails, missing catalog keys).
const APOC_KEYS=['dw-silo','dw-tire','lg-bulkhead','dw-bottle','dw-box','lg-twinsilo','dw-tank','dw-stilt','dw-bus'];
const APOC_PER_SMITHY=3;
function apocHomes(G,V){
 if(typeof KratorPostApoc==='undefined'||!V.smithies.length)return null;
 const K=KratorPostApoc;K.setError(m=>reportErr(m));K.setInteriors(true);
 // every home is furnished as a Screamer household: the set items name the catalog culture their rooms draw from
 for(const k of APOC_KEYS){const it=KratorInteriors.sets.find(k);if(it)it.culture='screamer';}
 const sites=[],homes=(SCREAM.homes=[]);let ki=0;
 // a footprint is level enough when the graded ground under its corners agrees to half a metre
 const level=(x,z,r)=>{const y0=V.plateY(x,z);for(let a=0;a<6;a++)if(Math.abs(V.plateY(x+Math.cos(a*1.047)*r,z+Math.sin(a*1.047)*r)-y0)>.5)return false;return true;};
 V.smithies.forEach(S=>{const [sx,,sz,rot]=S;let n=0;
  // the ring: behind the smithy first (away from the tower), then round its flanks; the spoil heaps lie at rot+2.0 and rot+3.3
  for(const da of [Math.PI,Math.PI-.62,Math.PI+.62,-1.25,1.25,Math.PI-1.25,Math.PI+1.25,-.62,.62]){
   if(n>=APOC_PER_SMITHY||ki>=APOC_KEYS.length)break;
   const key=APOC_KEYS[ki],D=K.declOf(key,{}),r=Math.hypot(D.w,D.d)/2+1.5;
   for(const dist of [52,66,80]){
    const a=rot+da,x=sx+Math.cos(a)*(dist+r),z=sz+Math.sin(a)*(dist+r);
    if(!V.free(x,z,r,5)||!level(x,z,r))continue;
    V.claim(x,z,r,'built');
    const y=V.plateY(x,z),f=K.frontOf(key),ry=Math.atan2(sx-x,sz-z)-f.yaw;   // the front door looks at the forge
    sites.push({key,x,z,ry,o:{v:0,y}});n++;ki++;break;}}});
 if(!sites.length)return null;
 const W=K.build(sites,{culture:'screamer'});G.add(W);
 W.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 for(const R of K.REG()){const d=R.front&&R.front.world;
  homes.push({key:R.key,name:R.name,x:R.x,y:R.y,z:R.z,ry:R.ry,door:d?[d.x,R.y+(R.front.local.y||0),d.z,d.yaw]:null});
  REGISTER({name:'Screamer village — '+R.name.toLowerCase()+' (salvage home)',x:R.x+V.gx,z:R.z+V.gz,r:R.r,h:R.h});}
 window._apoc=Object.assign({homes:homes.length,keys:homes.map(h=>h.key)},K.furniture());
 return W;}
