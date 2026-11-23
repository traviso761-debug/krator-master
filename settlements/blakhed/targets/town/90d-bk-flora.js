// ================================================================= BLAKHED — the fell's flora: the Rift Rim kit's veiled rim
// The bench at 3,650 m is the W rift highland's (biomes/riftrim, rim `w`: the veiled rim, the cloud belt): moor sponge on the flats,
// sedge and cotton grass in the wet, prism heath (gold-magenta), tussock, stones; bell firs and lobe larch where the kit's zones let
// a tree stand, few of them (PLAN.md section 3.3: fuel is the town's quiet shortage). Sealed with today's core/biome in
// gen/69bk4-bk-flora-bundle.js (BK_FLORA), bound here to the page's ground, the plan's mask (89zb: no plant on the water, the roads,
// the fields, the plots and the quarters; the odd one in a garth) and its fields (89zb: the climate's cold from the height, the
// river's wet and flow, the slope and the rock; the farm field on the in-field). Grown round the town and round the Stairhead.
// The mask is read through a tile cache (64 m tiles of 2 m cells, made on first use), never from pixels. [web]: three.js.
const BK_FL={ok:false,ms:0};
(function bkFlora(){if(typeof BK_FLORA==='undefined')return;const F=BK_FLORA,B=F.BIO,t0=performance.now();
 const TILE=64,CELL=2,N=TILE/CELL,tiles=new Map();
 const mask=(x,z)=>{const i=Math.floor(x/TILE),j=Math.floor(z/TILE),k=i+','+j;let t=tiles.get(k);
  if(!t){t=new Float32Array(N*N);for(let b=0;b<N;b++)for(let a=0;a<N;a++)t[b*N+a]=bkBioMask(i*TILE+(a+.5)*CELL,j*TILE+(b+.5)*CELL);tiles.set(k,t);}
  const a=Math.min(N-1,Math.floor((x-i*TILE)/CELL)),b=Math.min(N-1,Math.floor((z-j*TILE)/CELL));return t[b*N+a];};
 const H=BK_RINGS?BK_RINGS.stairhead.site||{x:BK_RINGS.hoists[0].x,z:BK_RINGS.hoists[0].z}:{x:18000,z:-16000};
 try{B.init({THREE,scene,terrainH:(x,z)=>terrainH(x,z),mask,obstacles:[],
   ticks:fn=>{let last=null;FRAME_HOOKS.push(now=>{const t=(now==null?performance.now():now)/1000,dt=last==null?.016:Math.min(.1,t-last);last=t;fn(dt,t);});},
   seed:44140,origin:[[0,0],[H.x,H.z]],center:[0,0],fields:BK_FIELDS_FN,
   eye:()=>[camera.position.x,camera.position.y,camera.position.z],err:m=>console.warn('blakhed flora: '+m)});
  if(B.setSun)B.setSun([-.5,.76,.52]);
  F.RRIM.biome('w');F.RRIM.WIND=[-.6,.8];F.RRIM.AUTUMN=true;   /* the prevailing wind off the fells (south-west); the autumn Fair's season */
  BK_FL.build=Object.assign({R:2400,quality:.75,rim:'w',trees:0,heroes:0,far:0},
   F.RRIM.buildTrees?F.RRIM.buildTrees(2400,.28):{},F.RRIM.buildFloor?F.RRIM.buildFloor(2400,.75):{});
  BK_FL.bake=B.bake();if(B.lodTick)FRAME_HOOKS.push(()=>B.lodTick(camera));
  if(B.impostorLook)B.impostorLook({gain:3.6,wrap:1});
  if(B.bakeImpostors&&typeof renderer!=='undefined'){try{B.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('blakhed flora impostors: '+(e&&e.message||e));}}
  if(B.IMP&&B.IMP.readLights)FRAME_HOOKS.push(()=>B.IMP.readLights());
  BK_FL.ok=true;BK_FL.tiles=tiles.size;}
 catch(e){reportErr('blakhed flora: '+(e&&e.stack||e));}
 BK_FL.ms=Math.round(performance.now()-t0);})();
window._bkFlora=BK_FL;
