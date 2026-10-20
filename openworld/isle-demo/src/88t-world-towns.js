// ================================================================= ISLE DEMO — the towns drawn (M7): streets, orchards, the kits' pieces, vessels, the export
// [web] Draws what ISLE_TOWNS_W planned (48t-world-towns.js); it decides nothing. Each town is drawn by the city page's
// own drawing (settlements/isle-demo/src/60-isle-draw.js, read in place by build.py as ISLE_DRAW_FACTORY: one DRAW per
// town over its own group, the group at the town's frame {x, sea, z}, so the records draw in the town's frame as on the
// city page). The ground is the world's terrain (48t laid the town's grid into it) and the sea the world's, so the city
// page's ground mesh and sea are not drawn (the terrain takes the town's colours: paved, lawn, sand, crops). Far: every lot as massing (a body and a roof), out to FAR. Near (the camera
// over the town's square): the lots within DRAW.nearR of the point under the camera in full, rebuilt as it moves. The
// prototypes are built once for both towns. The world keeps its flora and floor off the town's built area (its zone:
// the drawing grown, as the city page draws it, with no wild trees) and the lots, streets and fields beyond it
// (WORLD.clearHook, chained after the hamlets').
// THE EXPORT (moved here from the city page, PLAN.md M7): one town at a time, in that town's frame, so a case is the
// city page's (the same records, ids and sim): ?town=Kautoa (the default) or Valapo picks it, and the camera starts over it;
// ?simAt=minute runs the sim to that minute first. The town the camera is over runs presented, the other abstract
// (ISLE.simWatch, settlements/isle-demo 48); the sim is declared and held here, not yet run on the world's clock. The city page's export contributors (src/62, read in place as
// ISLE_EXPORT_FACTORY) run over the town's group moved to the origin while they read; the city section is the town's
// plan alone; the terrain its grid; the stage the world's (its lights, fog and sky from the town, its ground's look moved
// into the town's frame).
//   window._isleTowns   {stats, towns: [{town, census, checks, failed, missing, draw}], exportTown(name), errors}
var ISLE_TOWNS_DRAW;LATE.push(()=>{ISLE_TOWNS_DRAW=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,W=ISLE_TOWNS_W,FAR=30000,NEAR_R=520,S={errors:W.stats.errors.slice(),ms:0,full:null};
const t0=performance.now(),q=new URLSearchParams(location.search);
let shared=null;
const T=W.plans.map(P=>{const F=P.G.frame,g=new THREE.Group();g.position.set(F.x,F.sea,F.z);g.name='town '+P.town;scene.add(g);
 const D=ISLE_DRAW_FACTORY(g);if(shared){D.protos=shared.protos;D.failed=shared.failed;}else shared=D;
 D.nearR=0;   /* massing only until the camera comes over the town */
 const keep=ISLE.cur;ISLE.cur=P;
 try{D.streets(P.R,P.G);D.orchards(P.R,P.G);D.records(P.R);D.vessels(P.R);}catch(e){S.errors.push(P.town+' draw: '+(e&&e.stack?e.stack:e));}
 finally{ISLE.cur=keep;}
 const X={P,F,g,D,full:false};cull(X);return X;});
function cull(X){X.g.traverse(m=>{if(m.isMesh)m.frustumCulled=false;});}
/* ---------------------------------------------------------------- keep-clear: the built area, and lots, streets and fields */
const clear=KSPACE.create({cell:32}),zones=[];
const put=(x,z,r)=>clear.insert({x,z,r},x,z,r);
for(const X of T){const R=X.P.R,F=X.F;
 for(const L of R.lots.concat(R.wall))put(L.x+F.x,L.z+F.z,Math.hypot(L.w,L.d)/2+3);
 for(const w of R.plan.ways){const P=KCITY.lib.resample(w.pts,6,false);for(const p of P)put(p[0]+F.x,p[1]+F.z,w.w/2+1.5);}
 for(const f of R.fields||[])put(f.x+F.x,f.z+F.z,(f.size==null?40:f.size)*.71);
 for(const d of R.districts)if(d.role==='zone'){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const p of d.poly){x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);}
  zones.push({F,poly:d.poly,box:[x0+F.x,z0+F.z,x1+F.x,z1+F.z]});}}
const prevClear=WORLD.clearHook;
WORLD.clearHook=(x,z)=>{if(prevClear&&prevClear(x,z))return true;if(clear.some(x,z,0,it=>Math.hypot(x-it.x,z-it.z)<it.r))return true;
 for(const p of zones)if(x>=p.box[0]&&z>=p.box[1]&&x<=p.box[2]&&z<=p.box[3]&&KCITY.lib.inPoly([x-p.F.x,z-p.F.z],p.poly))return true;return false;};
/* ---------------------------------------------------------------- the ground's colour in the towns, as the city page paints it */
/* settlements/isle-demo 60 DRAW.ground: the markets and the warriors' yard paved, the ceremonial park and the parks lawn,
   the beaches sand, each farm parcel its crop's tone (DRAW.CROP) over the world's own ground colour (WORLD.ground,
   wrapped after the isles' own: 43-world-isles.js). The terrain's chunks are built after this module, so all of them read it. */
const paint=[];
for(const X of T){const R=X.P.R,F=X.F,G=X.P.G,fc=R.fields.length?R.fields[0].size:40,fmap={};
 R.fields.forEach(Fr=>{fmap[Math.floor((Fr.x+G.half)/fc)+','+Math.floor((Fr.z+G.half)/fc)]=X.D.CROP[Fr.crop]||X.D.CROP._;});
 const ds=[];R.districts.forEach(d=>{const kind=d.role==='market'||d.role==='warriors'?'paved':d.role==='ceremonial'||d.role==='park'?'lawn':d.role==='beach'?'beach':null;if(!kind)return;
  let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const p of d.poly){x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);}ds.push({kind,poly:d.poly,box:[x0,z0,x1,z1]});});
 paint.push({P:X.P,F,G,fc,fmap,ds});}
const ground0=WORLD.ground;
WORLD.ground=function(x,z,S,out){ground0(x,z,S,out);const P=W.at(x,z);if(!P||S.depth>0)return out;const Q=paint.find(q=>q.P===P),lx=x-Q.F.x,lz=z-Q.F.z;
 for(const d of Q.ds){if(lx<d.box[0]||lz<d.box[1]||lx>d.box[2]||lz>d.box[3]||!KCITY.lib.inPoly([lx,lz],d.poly))continue;
  if(d.kind==='paved'){out[0]=.24;out[1]=.2;out[2]=.15;}else if(d.kind==='lawn'){out[0]=out[0]*.3+.07;out[1]=out[1]*.3+.16;out[2]=out[2]*.3+.05;}
  else{out[0]+=(.66-out[0])*.7;out[1]+=(.62-out[1])*.7;out[2]+=(.52-out[2])*.7;}return out;}
 const fk=Q.fmap[Math.floor((lx+Q.G.half)/Q.fc)+','+Math.floor((lz+Q.G.half)/Q.fc)];
 if(fk){out[0]=out[0]*.35+fk[0]*.65;out[1]=out[1]*.35+fk[1]*.65;out[2]=out[2]*.35+fk[2]*.65;}
 return out;};
/* ---------------------------------------------------------------- each frame: far massing, near pieces */
function update(){const C=camera.position;let nf=null;
 for(const X of T){const lx=C.x-X.F.x,lz=C.z-X.F.z,half=X.P.G.half,d=Math.max(Math.abs(lx),Math.abs(lz))-half;
  X.g.visible=d<FAR;
  const over=d<300&&C.y-X.F.sea<2500;
  if(over){X.D.nearR=NEAR_R;X.D.near([lx,lz]);cull(X);X.full=true;nf=X.P.town;}
  else if(X.full){X.D.nearR=0;X.D.near([lx,lz],true);X.full=false;}}
 S.full=nf;if(nf&&ISLE.SIM&&ISLE.SIM.watched!==nf)ISLE.simWatch(nf);}   /* the town under the camera presented, the other abstract (P7d) */
HOST.TICKS.push(()=>update());
/* ---------------------------------------------------------------- the export: one town, in its frame */
let exportOff=[];
function exportTown(town){const P=W.select(town);if(!P)return null;const X=T.find(x=>x.P===P);
 if(typeof EXPORT==='undefined')return P;
 ISLE_EXPORT_FACTORY(X.g,X.D);   /* the city page's contributors (src/62), over this town's group and DRAW */
 const inner=ISLE.exportScene,F=X.F;
 ISLE.exportScene=ctx=>{X.g.position.set(0,0,0);X.g.updateMatrixWorld(true);
  try{return inner(ctx);}finally{X.g.position.set(F.x,F.sea,F.z);X.g.updateMatrixWorld(true);}};
 exportOff.forEach(f=>f());exportOff=[];
 EXPORT.ground({terrainH:(x,z)=>ISLE.cur.G.h(x,z),step:4});
 /* the city section: this town's plan alone (core/city's contributor exports every instance on the page, each in its frame) */
 exportOff.push(EXPORT.register('city',ctx=>{const C=KCITY.instances.find(c=>c.plan&&c.name===ISLE.cur.town);if(!C)return null;
  const prev=KCITY.cur;let Pp;try{Pp=C.export();}finally{if(prev)KCITY.bind(prev);}
  if(ctx.box){const lots=Pp.lots.length,ways=Pp.ways.length;Pp.lots=Pp.lots.filter(L=>ctx.inBox(L.x,L.z));
   Pp.ways=Pp.ways.filter(w=>w.pts.some(p=>ctx.inBox(p[0],p[1])));Pp.cropped={lots:[Pp.lots.length,lots],ways:[Pp.ways.length,ways]};}
  Pp.name=C.name;return{format:'krator-city',version:1,plans:[Pp],edits:null};},{by:'city'}));
 /* the stage: the world's lights, fog and sky from over the box, its ground's look moved into the town's frame */
 exportOff.push(EXPORT.register('stage',ctx=>{if(typeof KSTAGE==='undefined'||!ctx.box||!ISLE.cur)return null;
  const G=ISLE.cur.G,Fr=G.frame,b=ctx.box,cx=(b[0]+b[2])/2,cz=(b[1]+b[3])/2;
  const st=KSTAGE.capture({scene:HOST.scene,renderer:HOST.renderer,at:[cx+Fr.x,G.h(cx,cz)+Fr.sea+40,cz+Fr.z],sky:ctx.opt.sky==null?1024:ctx.opt.sky,
   skyNear:Math.min(b[2]-b[0],b[3]-b[1])/2,box:[b[0]+Fr.x,b[1]+Fr.z,b[2]+Fr.x,b[3]+Fr.z],step:ctx.opt.ground==null?4:ctx.opt.ground,ground:(x,z)=>WORLD.H(x,z)});
  if(st&&st.ground){const g=st.ground;g.x0-=Fr.x;g.z0-=Fr.z;
   if(g.uvFit){g.uvFit.u[2]+=g.uvFit.u[0]*Fr.x+g.uvFit.u[1]*Fr.z;g.uvFit.v[2]+=g.uvFit.v[0]*Fr.x+g.uvFit.v[1]*Fr.z;}}
  if(st&&st.sky&&st.sky.at)st.sky.at=[st.sky.at[0]-Fr.x,st.sky.at[1]-Fr.sea,st.sky.at[2]-Fr.z];
  if(st)st.frame={town:ISLE.cur.town,x:Fr.x,z:Fr.z,sea:Fr.sea,note:'captured in the world; the ground grid and the sky point are in the town frame'};
  return st;},{by:'isle'}));
 return P;}
const want=q.get('town'),first=W.plans.find(P=>P.town===want)||W.plans[0];
if(first){exportTown(first.town);if(ISLE.SIM)ISLE.simWatch(first.town);}   /* as the city page: the drawn town presented */
/* ?simAt=minute: the sim run to that minute first (the export's case: 362) */
const sa=+q.get('simAt');if(sa&&ISLE.SIM&&sa>ISLE.SIM.clock.m){try{ISLE.simRun(sa-ISLE.SIM.clock.m);}catch(e){S.errors.push('simAt: '+(e&&e.stack?e.stack:e));}}
/* ?town=: the camera starts looking at the town's built area (the first tick, after the start's own first view) */
let placed=!want||!first;
HOST.TICKS.push(()=>{if(placed||!START.ready&&START.frames<1)return;placed=true;const F=first.G.frame,Z=first.R.districts.find(d=>d.role==='zone');
 const c=Z?KCITY.lib.polyCentroid(Z.poly):[0,0],x=F.x+c[0],z=F.z+c[1];   /* the built area's middle, from the north-east */
 CAM.setView(x+700,z-900,420,0,-.3);CAM.lookAt(x,WORLD.H(x,z),z);});
HOST.TICKS.push(()=>{if(!window._ready&&START.ready)window._ready=true;});   /* tools/harness.py (export, smoke) waits for it */
S.ms=Math.round(performance.now()-t0);
window._isleTowns={stats:S,plan:W.stats,errors:S.errors,exportTown,
 towns:T.map(X=>({town:X.P.town,frame:X.F,census:X.P.census,checks:X.P.checks,failed:X.P.R.failed,missing:X.P.R.missing,draw:X.D.stats,lots:X.P.R.lots.length}))};
return{update,towns:T,exportTown,stats:S};})();});
