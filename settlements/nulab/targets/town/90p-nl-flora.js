// ================================================================= NULAB — the veiled rim's flora: the basin's climate as the rim kit's fields
// Sealed with today's core/biome in gen/69n2-nl-flora-bundle.js (NL_FLORA), centred on the coastal city (140, -1350) so the shore
// trees, mist frills, lobe larches, heath and Dalab crop rows (`farm: 1` on both the infill crop plots inside the city and the
// surrounding farmland belts) grow across the city and its fields. [web]: three.js.
const NL_FL={ok:false,ms:0};
(function nlRimFlora(){if(typeof NL_FLORA==='undefined')return;const F=NL_FLORA,B=F.BIO,G=NL_GROUND,t0=performance.now();
 const sm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);},cl=t=>Math.max(0,Math.min(1,t));
 const slope=(x,z)=>{const e=4,gx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),gz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e);return Math.hypot(gx,gz);};
 const shore=(x,z)=>Math.max(sm(10,0,terrainH(x,z)-G.LAKE),sm(260,70,G.riverAt(x,z)[0]));
 const fields={cold:()=>0,wet:nlWet,rock:(x,z)=>sm(.45,.9,slope(x,z)),slope:(x,z)=>cl(slope(x,z)),flow:shore,barren:()=>0,snow:()=>0,
  fog:(x,z)=>.25+.35*shore(x,z),farm:(x,z)=>{const f=nlFieldAt(x,z);return f&&f.kind!=='yard'?1:0;}};
 try{B.init({THREE,scene,terrainH:(x,z)=>terrainH(x,z),mask:nlBioMask,obstacles:[],
   ticks:fn=>{let last=null;FRAME_HOOKS.push(now=>{const t=(now==null?performance.now():now)/1000,dt=last==null?.016:Math.min(.1,t-last);last=t;fn(dt,t);});},
   seed:44310,origin:[[140,-1350],[-385,-1350],[820,-1350],[2500,2400]],center:[140,-1350],fields,
   eye:()=>[camera.position.x,camera.position.y,camera.position.z],err:m=>console.warn('nulab flora: '+m)});
  if(B.setSun)B.setSun([-.5,.76,.52]);
  if(F.RRIM.LOD){F.RRIM.LOD.tree=900;F.RRIM.LOD.farFloor=1800;}
  NL_FL.build=F.RRIM.build({R:4600,quality:.75,rim:'w'});
  NL_FL.bake=B.bake();if(B.lodTick)FRAME_HOOKS.push(()=>B.lodTick(camera));
  if(B.impostorLook)B.impostorLook({gain:3.6,wrap:1});
  if(B.bakeImpostors&&typeof renderer!=='undefined'){try{B.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('nulab flora impostors: '+(e&&e.message||e));}}
  if(B.IMP&&B.IMP.readLights)FRAME_HOOKS.push(()=>B.IMP.readLights());
  NL_FL.ok=true;}
 catch(e){reportErr('nulab flora: '+(e&&e.stack||e));}
 NL_FL.ms=Math.round(performance.now()-t0);})();
window._rimFlora=NL_FL;
