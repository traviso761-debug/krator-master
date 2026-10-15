// ================================================================= ISLE DEMO — the geyser fields at the scale model's vents
// [web] The scale model marks sixteen geyser vents on the isles (region.json vents, kind 'geyser'). The geyser kit
// (biomes/geyser) makes a thermal site from such a point (GEYSER.cluster: one to three geysers and a spouter, springs and
// pools, an acid field with mud pots and fumaroles, a sinter flat, a dead fringe). Here:
//  - AT START (the world's late setup, before any terrain is built): every vent's cluster, merged into one layout (keys
//    made unique per vent), is laid once (GEYSER.lay) on the world's ground without the geysers; its relief (the sinter
//    shields and mounds, the springs' bowls, the mud's slump, the run-off's beds) joins the world's height through
//    WORLD.landHook after the coast's, so the terrain, the fields and the seas all see it.
//  - WHEN THE CAMERA FIRST COMES WITHIN REACH of a vent: the sinter (every site's cones and geyserite, once) and the show
//    (the springs' water, the mud, the steam and the eruptions on their cycles, once: it ticks on the world's clock through
//    BIO.tick) are built; then that site's trees and floor round its vent, harvested (NURSERY.harvest) into one group
//    there. A site stays built once built (sixteen at most).
// The isle fields' 'floor' (43-world-isles.js) is this site's ground, so the isles kit plants nothing on it.
var GEYSERS;LATE.push(()=>{GEYSERS=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,M=WORLD_DATA.meta,o=M.frame.origin_px;
const R_SITE=380,REACH=2600;   // a cluster's radius (m); a site builds when the camera comes this near its vent
const VENTS=(M.vents||[]).filter(v=>v.kind==='geyser').map((v,i)=>({i,x:(v.px[0]-o[0])*2000,z:(v.px[1]-o[1])*2000,built:false,group:null}));
const ST={vents:VENTS.length,laid:false,sites:0,ms:0,tris:0,sinter:false,show:false};
if(typeof GEYSER==='undefined'||!VENTS.length)return{stats:ST,vents:VENTS,update(){}};
// the ground without the geysers (the run-off is traced on it), and the sea as the run-off's sink
let OFF=false;const ground=(x,z)=>{OFF=true;try{return WORLD.H(x,z);}finally{OFF=false;}};
const sink=(x,z)=>WORLD.lakeWater(x,z)>ground(x,z)-.2;
// every vent's cluster in one layout
const spec={seed:7101,amb:Math.round(WORLD.temp(VENTS[0].x,VENTS[0].z)),ground,sink,wind:[.6,-.4],runLen:R_SITE*1.6,
 geysers:[],springs:[],acid:[],fumaroles:[],flats:[],dead:[],terraces:[]};
for(const V of VENTS){const c=GEYSER.cluster({x:V.x,z:V.z,r:R_SITE,seed:7200+V.i});const tag=o=>Object.assign(o,o.key?{key:'v'+V.i+'-'+o.key}:{});
 for(const k of ['geysers','springs','acid','fumaroles','flats','dead'])(c[k]||[]).forEach(e=>spec[k].push(tag(e)));}
const t0=performance.now();
try{GEYSER.lay(spec);ST.laid=true;}catch(e){reportErr('geysers: lay: '+(e.stack||e));}
ST.ms+=performance.now()-t0;
// the relief, after the coast's shaping
if(ST.laid){const coast=WORLD.landHook;WORLD.landHook=(x,z,h,mw)=>{if(coast)h=coast(x,z,h,mw);return OFF?h:h+GEYSER.relief(x,z,h);};}
// the site's ground, painted as the geyser kit's own host paints it (biomes/geyser/src/84-host-ground.js): the sinter
// grey-white, the run-off's film in the microbial mats' bands by its temperature (bare wet sinter over ~73 degC, then
// yellow-green, orange, orange-brown, olive as it cools), the acid field's clay and ochre, the mud, the dead fringe's grey
if(ST.laid){const lin=h=>{const f=c=>{c/=255;return c<.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);};return[f(h>>16&255),f(h>>8&255),f(h&255)];};
 const C={sinter:lin(0xbcb6a8),wet:lin(0xb8b4a8),yg:lin(0xb8c050),orange:lin(0xc87a30),brown:lin(0x8a5a30),olive:lin(0x6a6a3a),clay:lin(0xe0d6c4),ochre:lin(0xc89448),mud:lin(0x6a6052),dead:lin(0xb4b0a4)};
 const sm=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);},mixc=(o,c,t)=>{if(t<=0)return;o[0]+=(c[0]-o[0])*t;o[1]+=(c[1]-o[1])*t;o[2]+=(c[2]-o[2])*t;};
 const ground0=WORLD.ground;
 WORLD.ground=function(x,z,S,out){ground0(x,z,S,out);if(!(S.floor>0))return out;const g=GEYSER.at(x,z,S.h);
  mixc(out,C.dead,g.dead*.8);mixc(out,C.sinter,g.sinter*.78);   /* a weathered grey-white: the bright cones and beads are the sinter meshes' own */
  if(g.film>0){const T=g.T,c=T>73?C.wet:T>63?C.yg:T>52?C.orange:T>42?C.brown:C.olive;mixc(out,c,g.film*.85);}
  if(g.acid>0){mixc(out,C.clay,g.acid*.8);mixc(out,C.ochre,g.acid*.35*sm(.4,.9,g.heat));}
  mixc(out,C.mud,g.mud*.9);out[3]*=1-Math.max(g.sinter,g.acid,g.film);return out;};}
// a kit's harvest as meshes in a group at (ox, oz)
function meshes(parts,ox,oz,name){const g=new THREE.Group();g.name=name;g.position.set(ox,0,oz);
 for(const p of parts){const m=new THREE.Mesh(p.geo,p.mat);m.frustumCulled=true;m.userData.geyser=true;g.add(m);ST.tris+=p.geo.attributes.position.count/3;}
 scene.add(g);return g;}
function once(){if(!ST.sinter){const t=performance.now();
  try{GEYSER.buildSinter(.5);meshes(NURSERY.harvest('geyser',0,0,false).parts,0,0,'geyser sinter');ST.sinter=true;}catch(e){reportErr('geysers: sinter: '+(e.stack||e));ST.sinter=true;}
  ST.ms+=performance.now()-t;}
 if(!ST.show&&GEYSER.buildShow){const t=performance.now();try{GEYSER.buildShow({});ST.show=true;}catch(e){reportErr('geysers: show: '+(e.stack||e));ST.show=true;}ST.ms+=performance.now()-t;}}
function build(V){const t=performance.now();once();
 const c0=BIO.host.center,o0=BIO.host.origin;BIO.host.center=[V.x,V.z];BIO.host.origin=[[V.x,V.z]];
 /* a lighter build than the kit's showcase: the whole site lies within the hero reach of its own vent */
 try{GEYSER.buildTrees(R_SITE*1.25,.6);GEYSER.buildFloor(R_SITE*1.1,.35);V.group=meshes(NURSERY.harvest('geyser',V.x,V.z,false).parts,V.x,V.z,'geyser site '+(V.i+1));}
 catch(e){reportErr('geysers: site '+(V.i+1)+': '+(e.stack||e));}
 finally{BIO.host.center=c0;BIO.host.origin=o0;}
 V.built=true;ST.sites++;ST.ms+=performance.now()-t;}
// one site a frame at most, the nearest first
function update(){if(!ST.laid)return;const P=camera.position;let best=null,bd=REACH;
 for(const V of VENTS){if(V.built)continue;const d=Math.hypot(P.x-V.x,P.z-V.z);if(d<bd){bd=d;best=V;}}
 if(best)build(best);}
HOST.TICKS.push(()=>update());
return{stats:ST,vents:VENTS,update,build};})();});
