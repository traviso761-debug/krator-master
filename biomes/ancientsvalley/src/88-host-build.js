// ================================================================= HOST — build (every station)
// [web] The order: the kits read in place under their masks (the stage's zones), each made feral by AV.feralKit (46) as it builds: the
// south-west lowlands' forest on the floor, the shelf and the parks, the north-west's trees mixed in; then one bake; then the taint's
// tint on what was baked. The metropolis kit's towers come after, on the first frame (70-av-city.js boots them when the library maps are in).
window._swlow=null;window._nwlow=null;
/* THE BUILD YIELDS (the owner, 2026-11-10: "the station pages really seem to take forever to load ... station 0 keeps freezing on load"). The
   lowland kits' passes ran as one task of a minute or more and the page froze until the end. Now each pass (a kit's trees, its floor) and the bake
   is a stage of its own: before each, the page shows where it is and gives the browser a turn (a paint, input), then goes on. The kits' build is
   the same calls in the same order (each kit's build() is its trees then its floor, under its own BIO.cur), so the page is the same. What follows
   this fragment on the page waits for it: the build splits the page there (build.py: the fragments after 88 are a text block, run when this
   finishes, AV_AFTER), so the towers, the atmosphere and the host's take start on the finished forest as before */
const avLoadNote=(()=>{let el=null;return t=>{if(!el){el=document.createElement('div');el.id='av-loading';el.style.cssText='position:fixed;left:50%;top:46%;transform:translate(-50%,-50%);z-index:50;background:rgba(24,21,15,.88);color:#f3ecd8;font:13px Georgia,serif;padding:10px 16px;border-radius:8px;pointer-events:none';document.body.appendChild(el);}
  if(t==null){el.remove();el=null;return;}el.textContent='Building the valley: '+t+'…';};})();
const avYield=t=>{avLoadNote(t);return new Promise(r=>setTimeout(r,0));};
const AV_AFTER=()=>{avLoadNote(null);const el=document.getElementById('av-after');if(!el)return;const s=document.createElement('script');s.textContent=el.textContent;el.remove();document.body.appendChild(s);};
(async function(){const t0=performance.now();const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 const adjust=(T,w)=>{for(let i=REG.length-1;i>=0&&i>=REG.length-400;i--){const r=REG[i];if(r.kind==='tree'&&r.x===T.x&&r.z===T.z){if(!w){REG.splice(i,1);break;}r.y=w.y==null?kitH(T.x,T.z):w.y;r.h=w.h;r.r=r.r*w.kx;if(w.substrate&&r.tags)r.tags.substrate=w.substrate;break;}}};
 const stands=AV.stands?AV.stands({ground:kitH,lakeY:STAGE.lakeY,F:STAGE.F,street:STAGE.street,built:STAGE.built,scorch:STAGE.scorch,seed:STAGE.seed}):null;
 window.AV_STANDS=stands;
 /* a kit's build() in its two passes, each a stage: the same calls, BIO.cur and output as the kit's own build (each lowland kit's 70 fragment) */
 const kitStages=async(K,cur,label,f,o)=>{const R=o.R==null?2850:o.R,qq=o.quality==null?1:o.quality,out={R,quality:qq,trees:0,heroes:0,far:0};
  if(K.buildTrees){await avYield(label+', the trees');masked(f,()=>{BIO.cur=cur+'/trees';Object.assign(out,K.buildTrees(R,qq,o));});}
  if(K.buildFloor){await avYield(label+', the floor');masked(f,()=>{BIO.cur=cur+'/floor';Object.assign(out,K.buildFloor(R,qq));});}
  BIO.cur=null;return out;};
 const masked=(f,fn)=>{const old=BIO.host.mask;BIO.host.mask=(x,z)=>Math.min(old(x,z),f(x,z));try{return fn();}finally{BIO.host.mask=old;}};
 const feral=AVQ_ON('feral')?(x,z)=>STAGE.F.feral(x,z):(x,z)=>0;
 /* the perches (the owner, 2026-11-09: overgrown like Midgar at the end of FF7): in the wild half every stump, broken tower and tower with its
    crown gone wants trees on its top (two to seven by the top's area, inside its rim, none on a tower leaning past 2.5 degrees); a wrapped tree
    within 160 m of one gives it up to two copies of itself, smaller (AV.feralKit's o.perch), registered as rooftrees */
 /* the owner, 2026-11-09: "no tree should outmass a skyscraper on this map": a tree's height is capped at six tenths of the tallest tower within
    160 m of its foot (32 m at most, 12 m at least where only stumps stand); the cap reaches the wrap as o.capH(x, z) */
 const topOfTower=T=>{const F=MP.FAMILY[T.family]||MP.DESIGNS[T.family];if(!F)return 0;if(T.state==='intact'||T.state==='gutted')return F.height&&F.height.tip?F.height.tip:120;try{return MP.ruin(F,T.state).top;}catch(e){return 30;}};
 const cq=[];const capH=(x,z)=>{cq.length=0;STAGE.pads.query(x,z,160,cq);let m=0;for(const P of cq){if(P.family==='engine')continue;if(Math.hypot(P.x-x,P.z-z)>160+P.padR)continue;m=Math.max(m,topOfTower(P));}return m?Math.max(12,Math.min(32,m*.6)):32;};
 /* a perch stands on the hero's measured roof (the highest broad slab under the record's top), not the record's cut plane: the hero is built here
    for each planted look and kept for the boot (AVC.hero) */
 const ROOF={};const roofOf=t=>{const k=t.key;if(ROOF[k]!=null)return ROOF[k];let y=null;try{const H=AVC.hero[k]||(AVC.hero[k]=heroOf(k));H.updateMatrixWorld(true);const F=MP.FAMILY[t.family]||MP.DESIGNS[t.family],fp=F&&F.footprint||{},fw=fp.r!=null?fp.r*2:Math.max(fp.w==null?40:fp.w,fp.d==null?40:fp.d);let best=-1e9;
   H.traverse(m=>{if(!m.isMesh||m.isInstancedMesh||/debris|rubble/.test(m.name||''))return;const g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox.clone().applyMatrix4(m.matrixWorld);const ext=Math.max(b.max.x-b.min.x,b.max.z-b.min.z);if(ext>=fw*.5&&b.max.y>best)best=b.max.y;});if(best>-1e8)y=best;}catch(e){}ROOF[k]=y;return y;};
 const TOPS=[];STAGE.plan.towers.forEach(t=>{if(!(t.state==='stump'||t.state==='broken'||t.state==='crown')||(t.lean||0)>2.5||STAGE.F.wild(t.x,t.z)<.5)return;const F=MP.FAMILY[t.family]||MP.DESIGNS[t.family];if(!F)return;
  let cut;try{cut=MP.ruin(F,t.state).top;}catch(e){return;}if(!(cut>6))return;   /* the record's top: the hero is cut there (70, avClipHero) */
  const roof=roofOf(t);if(roof!=null&&roof>6&&roof<cut+1)cut=roof;
  /* the top's extent is the drawn ruin's, not the footprint's (70, avProfile; the owner, 2026-11-09: trees 40 m off a spindle's 15 m break): the band
     under the cut, inset 3 m; a top under 3 m across takes no tree */
  let PR;try{PR=avProfile(t.key);}catch(e){return;}cut=Math.min(cut,PR.top);const b=PR.at(cut-1);if(!b)return;const round=F.footprint&&F.footprint.r!=null;
  const ex=round?[-b.r+3,b.r-3,-b.r+3,b.r-3]:[b.x0+3,b.x1-3,b.z0+3,b.z1-3];const hw=(ex[1]-ex[0])/2,hd=(ex[3]-ex[2])/2;if(hw<1.5||hd<1.5)return;const r=round?b.r-3:Math.min(hw,hd),area=round?Math.PI*r*r:4*hw*hd;
  let sf=null;try{sf=avSurface(t.key);}catch(e){}
  TOPS.push({t,cut,r:Math.max(4,Math.max(hw,hd)),ex,round,q:avQuat(t),n:Math.max(2,Math.min(7,Math.round(area/180))),got:0,prof:PR,sf});});
 const AV_ROOF_PTS=new THREE.Object3D();AV_ROOF_PTS.name='roof trees, probe points';AV_ROOF_PTS.userData.probePoints=[];scene.add(AV_ROOF_PTS);
 const TOPIX=KSPACE.create({cell:200});TOPS.forEach(P=>TOPIX.insert(P,P.t.x,P.t.z,P.r));const tq=[];
 const perch=AVQ_ON('perch')?(T,h)=>{tq.length=0;TOPIX.query(T.x,T.z,160,tq);const out=[];for(const P of tq){if(P.got>=P.n||Math.hypot(P.t.x-T.x,P.t.z-T.z)>160)continue;
   while(P.got<P.n&&out.length<2&&(P.tries|0)<P.n*6){P.tries=(P.tries|0)+1;const h1=KRAND.hash(STAGE.seed+53,P.t.id|0,P.tries,0),a=KRAND.unit(h1)*TAU,u=KRAND.unit(KRAND.hash(h1,1,0,0)),ex=P.ex;let lx,lz;
    if(P.round){const rr=Math.sqrt(u)*(ex[1]-ex[0])/2;lx=Math.cos(a)*rr;lz=Math.sin(a)*rr;}else{lx=ex[0]+u*(ex[1]-ex[0]);lz=ex[2]+KRAND.unit(KRAND.hash(h1,4,0,0))*(ex[3]-ex[2]);}
    /* a tree stands only on a roof: an upward face of the drawn ruin near the cut (70, avProfile's onRoof; Gemini's review, 8c: a courtyard or an arch's
       span inside the band's box took trees in the air) */
    if(P.prof&&!P.prof.onRoof(P.cut,lx,lz))continue;
    /* and a ray says so: the trunk's footing on the drawn ruin within 6 m under the cut (70, avSurface.footing; the owner, 2026-11-10: floating foliage),
       the tree set on that surface, not on the cut plane */
    let yr=P.cut;if(P.sf){yr=P.sf.footing(lx,lz,P.cut+3,P.cut-6);if(yr==null){AV.FERAL.perchMiss=(AV.FERAL.perchMiss||0)+1;continue;}}
    const W=new THREE.Vector3(lx,yr+.1,lz).applyQuaternion(P.q);   /* the roof in the tower's frame, turned by its yaw and lean */
    (P.feet||(P.feet=[])).push([lx,yr,lz]);
    if(!P.got)REGISTER({name:"trees on a ruin's top",kind:'rooftree',x:P.t.x,z:P.t.z,y:P.t.y+P.cut,r:P.r+3,h:28,tags:{kind:'rooftree',family:P.t.family,state:P.t.state}});   /* one volume a top: the probe samples instanced cards sparsely, so a tree's own would read empty */
    AV_ROOF_PTS.userData.probePoints.push(P.t.x+W.x,P.t.y+W.y+2,P.t.z+W.z);   /* the probe's point for the top's volume (it samples instanced cards sparsely: a top with one copy read empty on the Yards) */
    out.push({x:P.t.x+W.x,y:P.t.y+W.y,z:P.t.z+W.z,yaw:KRAND.unit(KRAND.hash(h1,2,0,0))*TAU,k:Math.min(.35+.2*KRAND.unit(KRAND.hash(h1,3,0,0)),h>0?25/h:1)});P.got++;}   /* a roof tree a third to a half of its source, under 25 m */
   if(out.length>=2)break;}return out;}:null;
 const perched=(T,pc,h)=>{AV.FERAL.perchedH=Math.max(AV.FERAL.perchedH||0,h);};
 window.AV_TOPS=TOPS;   /* ?feral=0: the kits as they are (the species kept, nothing grown), to tell the wrap's faults from the kits' */
 const standFn=stands&&AVQ_ON('stands')?stands.at:null;
 if(typeof SWLOW!=='undefined'&&STAGE.swQ){AV.feralKit(SWLOW,{ground:kitH,feral,capH,stand:standFn,allow:STAGE.swAllow?new Set(STAGE.swAllow):null,keep:new Set(STAGE.swKeep||[]),adjust,perch,perched,seed:STAGE.seed+31});
  try{window._swlow=await kitStages(SWLOW,'lowlands','the south-western forest',(x,z)=>clamp(STAGE.zone(x,z).sw,0,1),{R:STAGE.R-60,quality:q*STAGE.swQ,avenues:[]});}catch(e){BIO.cur=null;reportErr('swlowlands: '+e.stack);}}
 _mark('swlowlands');
 if(typeof NWLOW!=='undefined'&&STAGE.nwQ){AV.feralKit(NWLOW,{ground:kitH,feral,capH,stand:standFn,allow:STAGE.nwAllow?new Set(STAGE.nwAllow):null,adjust,perch,perched,seed:STAGE.seed+37});
  try{window._nwlow=await kitStages(NWLOW,'nwlow','the north-western forest',(x,z)=>clamp(STAGE.zone(x,z).nw,0,1),{R:STAGE.R-60,quality:q*STAGE.nwQ,avenues:[]});}catch(e){BIO.cur=null;reportErr('nwlowlands: '+e.stack);}}
 _mark('nwlowlands');
 if(typeof avSurfaceFree==='function')avSurfaceFree();   /* the creepers (71) and the roof trees are placed: the rays' buckets go (70) */
 if(Q.has('nobake')){window._instances=0;window._bakeCalls=0;return;}
 await avYield('the bake');const b=BIO.bake();_mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;
 /* A2.4: standing snags and fallen timber from AV.stands.deadwood (2 instanced draws) */
 if(stands&&AVQ_ON('stands')){const DW=stands.deadwood({R:STAGE.R-60,groundH:kitH,max:320});window.AV_DEADWOOD=DW;
  if(DW.length){REGISTER({name:'standing snags and fallen timber',kind:'deadwood',x:0,z:0,r:STAGE.R,h:24,tags:{kind:'deadwood',count:DW.length}});
   const dwGeo=new THREE.CylinderGeometry(.62,1,1,6,1),dwMat=new THREE.MeshLambertMaterial({color:0x4b4034}),snags=DW.filter(d=>d.kind==='snag'),logs=DW.filter(d=>d.kind==='log');
   const M4=new THREE.Matrix4(),Q4=new THREE.Quaternion(),E4=new THREE.Euler(),P4=new THREE.Vector3(),S4=new THREE.Vector3(),C4=new THREE.Color();
   [[snags,'snags',0],[logs,'logs',1]].forEach(([L,nm,isLog])=>{if(!L.length)return;const im=new THREE.InstancedMesh(dwGeo,dwMat,L.length);
    L.forEach((d,i)=>{if(isLog)M4.compose(P4.set(d.x,d.y+d.r*.55,d.z),Q4.setFromEuler(E4.set(0,d.yaw,Math.PI*.48,'YXZ')),S4.set(d.r,d.h,d.r));
     else M4.compose(P4.set(d.x,d.y+d.h*.48,d.z),Q4.setFromEuler(E4.set(.06*Math.cos(d.yaw),d.yaw,.06*Math.sin(d.yaw),'YXZ')),S4.set(d.r,d.h,d.r));
     im.setMatrixAt(i,M4);const v=.75+.35*KRAND.unit(KRAND.hash(STAGE.seed+89,i,isLog));C4.setRGB(v,v*(isLog?.98:.92),v*.85);im.setColorAt(i,C4);});
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
    im.frustumCulled=false;im.userData.host=true;im.userData.probeSkip=true;im.userData.inspectLabel=isLog?'fallen timber':'a dead snag';im.name='av.deadwood.'+nm;scene.add(im);});}}
 /* A2.3: far canopy tier past the kits' 1.2 km tree range (KNOWN_ISSUES.md:93): 1 instanced draw, vertex-faded inside 1,050..1,320 m */
 if(AVQ_ON('farcanopy')){const step=72,Rmax=5000,n=Math.floor(Rmax/step),fc=[];
  for(let i=-n;i<=n;i++)for(let j=-n;j<=n;j++){const h0=KRAND.hash(STAGE.seed+97,i+3000,j+3000,0),x=(i+KRAND.unit(h0)-.5)*step,z=(j+KRAND.unit(KRAND.hash(h0,1,0,0))-.5)*step,rad=Math.hypot(x,z);
   if(rad>Rmax)continue;const inPage=Math.abs(x)<STAGE.R*.96&&Math.abs(z)<STAGE.R*.96;
   const fo=inPage?STAGE.forest(x,z):(STAGE.modelY(x,z)>STAGE.lakeY+3&&STAGE.F.scar(x,z)<.3&&(1-STAGE.F.density(x,z))*STAGE.F.wild(x,z)>.35?.75:0);
   if(fo<.32||KRAND.unit(KRAND.hash(h0,2,0,0))>fo*.85)continue;
   const y=inPage?kitH(x,z):STAGE.modelY(x,z);if(y<STAGE.lakeY+1)continue;
   const u3=KRAND.unit(KRAND.hash(h0,3,0,0)),w=28+26*u3,ht=11+14*fo*(.6+.6*u3),pt=STAGE.paint(x,z);
   fc.push({x,y:y-1.5,z,w,h:ht,yaw:KRAND.unit(KRAND.hash(h0,4,0,0))*TAU,c:[pt[0]*(.85+.3*u3),pt[1]*(.92+.28*u3),pt[2]*(.85+.25*u3)]});}
  if(fc.length){REGISTER({name:'the far forest canopy (past 1.2 km)',kind:'farcanopy',x:0,z:0,r:Rmax,h:40,tags:{kind:'farcanopy',crowns:fc.length}});
   const cg=new THREE.BufferGeometry(),P=[0,1,0],N0=[0,1,0],I=[];
   for(let k=0;k<8;k++){const a=k/8*TAU,ca=Math.cos(a),sa=Math.sin(a);P.push(ca*.5,0,sa*.5);N0.push(ca*.45,.89,sa*.45);}
   for(let k=0;k<8;k++)I.push(0,1+k,1+(k+1)%8);
   cg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));cg.setAttribute('normal',new THREE.Float32BufferAttribute(N0,3));cg.setIndex(I);
   const cm=new THREE.MeshLambertMaterial({color:0xffffff});
   cm.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{vec3 fcEye=-(transpose(mat3(viewMatrix))*viewMatrix[3].xyz);vec3 fcC=(modelMatrix*vec4(instanceMatrix[3].xyz,1.0)).xyz;transformed*=smoothstep(1050.0,1320.0,length(fcC-fcEye));}');};
   cm.customProgramCacheKey=()=>'av-far-canopy';
   const im=new THREE.InstancedMesh(cg,cm,fc.length),M4=new THREE.Matrix4(),Q4=new THREE.Quaternion(),Y4=new THREE.Vector3(0,1,0),P4=new THREE.Vector3(),S4=new THREE.Vector3(),C4=new THREE.Color();
   fc.forEach((e,i)=>{M4.compose(P4.set(e.x,e.y,e.z),Q4.setFromAxisAngle(Y4,e.yaw),S4.set(e.w,e.h,e.w));im.setMatrixAt(i,M4);C4.setRGB(Math.pow(clamp(e.c[0],0,1),2.2),Math.pow(clamp(e.c[1],0,1),2.2),Math.pow(clamp(e.c[2],0,1),2.2));im.setColorAt(i,C4);});
   im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
   im.frustumCulled=false;im.userData.biome=true;im.userData.farCanopy=true;im.userData.probeSkip=true;im.userData.host=true;im.userData.inspectLabel='the far canopy';im.name='av.farCanopy';scene.add(im);window.AV_FAR_CANOPY=im;}}
 if(AVQ_ON('tint'))window._tinted=AV.tint(scene,{strength:1});_mark('tint');
 window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STAGE.name+' (a piece of it)',x:0,z:0,r:STAGE.R,h:600});
})().catch(e=>reportErr('build: '+(e&&e.stack||e))).then(AV_AFTER);
