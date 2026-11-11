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
 const adjust=(T,w)=>{for(let i=REG.length-1;i>=0&&i>=REG.length-400;i--){const r=REG[i];if(r.kind==='tree'&&r.x===T.x&&r.z===T.z){if(!w){REG.splice(i,1);break;}r.h=w.h;r.r=r.r*w.kx;break;}}};
 /* a kit's build() in its two passes, each a stage: the same calls, BIO.cur and output as the kit's own build (each lowland kit's 70 fragment) */
 const kitStages=async(K,cur,label,f,o)=>{const R=o.R||2850,qq=o.quality==null?1:o.quality,out={R,quality:qq,trees:0,heroes:0,far:0};
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
 if(typeof SWLOW!=='undefined'&&STAGE.swQ){AV.feralKit(SWLOW,{ground:terrainH,feral,capH,allow:STAGE.swAllow?new Set(STAGE.swAllow):null,keep:new Set(STAGE.swKeep||[]),adjust,perch,perched,seed:STAGE.seed+31});
  try{window._swlow=await kitStages(SWLOW,'lowlands','the south-western forest',(x,z)=>clamp(STAGE.zone(x,z).sw,0,1),{R:STAGE.R-60,quality:q*STAGE.swQ,avenues:[]});}catch(e){BIO.cur=null;reportErr('swlowlands: '+e.stack);}}
 _mark('swlowlands');
 if(typeof NWLOW!=='undefined'&&STAGE.nwQ){AV.feralKit(NWLOW,{ground:terrainH,feral,capH,allow:STAGE.nwAllow?new Set(STAGE.nwAllow):null,adjust,perch,perched,seed:STAGE.seed+37});
  try{window._nwlow=await kitStages(NWLOW,'nwlow','the north-western forest',(x,z)=>clamp(STAGE.zone(x,z).nw,0,1),{R:STAGE.R-60,quality:q*STAGE.nwQ,avenues:[]});}catch(e){BIO.cur=null;reportErr('nwlowlands: '+e.stack);}}
 _mark('nwlowlands');
 if(typeof avSurfaceFree==='function')avSurfaceFree();   /* the creepers (71) and the roof trees are placed: the rays' buckets go (70) */
 if(Q.has('nobake')){window._instances=0;window._bakeCalls=0;return;}
 await avYield('the bake');const b=BIO.bake();_mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;
 if(AVQ_ON('tint'))window._tinted=AV.tint(scene,{strength:1});_mark('tint');
 window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STAGE.name+' (a piece of it)',x:0,z:0,r:STAGE.R,h:600});
})().catch(e=>reportErr('build: '+(e&&e.stack||e))).then(AV_AFTER);
