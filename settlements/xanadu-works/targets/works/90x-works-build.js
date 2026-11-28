// ================================================================= XANADU'S WORKS — the build: every placement of the plan, camp by camp
// The plan's placements (89zw: the four camps' records from core/hamlet, the lake craft at the landing) drawn with the Xanadu kit
// (VERN.place: its src and the opt-in works of kits/xanadu/extra 88d, 88g, 88h), the Glaziers' houses with the Tungang kit
// (TG.gz.draw: the front on its face, the house's rock behind it as a block of the potch line's outcrop), and a stand-in at its
// box for a key no kit on the page has (the adit: core/hamlet's pending box). Each camp baked into its own group and drawn while
// in view and range (Kirstabal's runtime LOD). The tailings and the potch spoil are core/terrain's KRUBBLE heaps. Every
// placement goes into REG (core/tags through 91t) as it is drawn. A builder draws a record; it decides nothing. [web]: three.js.
reseed(XW.SEED+2);const XW_B0=performance.now();
const XW_GROUPS=[],XW_FAILS=[],XW_STANDINS=[];let XW_INST=0;
const xwRegStandin=(p,what)=>REG.push({name:what,cls:'building',key:p.key,x:p.x,y:0,z:p.z,r:Math.hypot(p.w,p.d)/2,h:xwD(p.h,4),type:p.key,
 tags:{culture:'xanadu',role:'a stand-in at core/hamlet\'s box: '+what+' (no kit piece yet)'}});
/* the Glaziers' houses: the front through TG.gz.draw (its facade alone), the rooms' rock as one block behind the face */
function xwGlaziers(G,list){if(!list.length||typeof TG==='undefined')return 0;const sites=[];
 const rock=new THREE.MeshStandardMaterial({color:0xcfc6b2,roughness:.95,metalness:0}),geo=new THREE.BoxGeometry(1,1,1);
 for(const p of list){const fx=Math.sin(p.ry),fz=Math.cos(p.ry),back=p.out-p.d/2,ox=p.x-fx*back,oz=p.z-fz*back;   /* the front's foot on the face */
  sites.push({key:p.key,x:ox,y:0,z:oz,ry:p.ry,v:p.o.v,id:p.id,facade:true});
  const deep=p.d-p.out,M=new THREE.Mesh(geo,rock);M.scale.set(p.w-.2,p.h+.6,deep);M.position.set(ox-fx*deep/2,(p.h+.6)/2,oz-fz*deep/2);M.rotation.y=p.ry;
  M.name='the potch outcrop behind '+p.id;M.userData.inspectLabel='The potch line\'s outcrop: a Glazier family\'s rooms cut into it';G.add(M);
  REG.push({name:'Glazier house ('+p.key+')',cls:'building',key:p.key,x:p.x,y:0,z:p.z,r:Math.hypot(p.w,p.d)/2,h:p.h,type:p.key,
   tags:{culture:'glazier',role:'a Glazier family\'s house at the diggings (kits/tungang)'}});}
 const D=TG.gz.draw(sites,{seed:XW.SEED+5,label:'The Glaziers\' houses at the diggings'});G.add(D.group);
 for(const k in D.missing)XW_FAILS.push('glazier '+k+': '+D.missing[k]);
 return sites.length-Object.keys(D.missing||{}).length;}
function xwBake(key,list){const G=new THREE.Group();G.name='camp:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y1=0;let gz=[];
 for(const p of list){if(p.kit==='glazier'){gz.push(p);}
  else if(VERN.defs[p.key]){TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;let g=null;
   try{g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);}catch(e){XW_FAILS.push(p.id+' '+p.key+': '+(e&&e.message||e));}
   if(!g)XW_FAILS.push(p.id+' '+p.key+': not placed');for(let i=r0;i<REG.length;i++)REG[i].type=p.key;}
  else{/* a stand-in: the adit's timbered mouth in a rock mound at its box */
   vB('xRockB',p.x,0,p.z,p.w,xwD(p.h,4),p.d,p.ry,xC(0x847a6a));const f=loc(p.x,p.z,0,p.d/2+.02,p.ry);vB('vDarkB',f[0],0,f[1],2.0,2.3,.08,p.ry);
   XW_STANDINS.push(p.id+' '+p.key);xwRegStandin(p,(KHAMLET.xanaduRow().pending[p.key]||{}).what||p.key);}
  x0=Math.min(x0,p.x-60);x1=Math.max(x1,p.x+60);z0=Math.min(z0,p.z-60);z1=Math.max(z1,p.z+60);y1=Math.max(y1,xwD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();XW_INST+=xwD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const ng=xwGlaziers(G,gz);
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,y1/2,(z0+z1)/2),Math.hypot(x1-x0,y1,z1-z0)/2+20),range:4200,n:list.length,glazier:ng};XW_GROUPS.push(e);return e;}
const XW_BY={};
if(XW_PLAN){for(const p of XW_PLACE)(XW_BY[p.camp]=XW_BY[p.camp]||[]).push(p);
 for(const v of XW_PLAN.vessels)(XW_BY[v.camp]=XW_BY[v.camp]||[]).push(Object.assign({kit:'xanadu',w:0,d:0,h:6,role:'vessel'},v));
 for(const k of Object.keys(XW_BY).sort())xwBake(k,XW_BY[k]);}
window._instances=XW_INST;
// ---------------------------------------------------------------- the heaps: tailings below the mill, spoil at the adits, broken potch
{const DR={tailings:[.70,.66,.56],spoil:[.52,.49,.44],potch:[.84,.81,.74]},mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0});
 /* each heap its own mesh (the page's probe samples a mesh at its box's centre: settlements/xanadu 91-probe), registered first */
 for(const H of XW_HEAPS){REG.push({name:H.dress==='tailings'?'Tailings heap':H.dress==='potch'?'Potch heap':'Spoil heap',cls:'feature',key:'heap:'+H.dress,x:H.x,y:0,z:H.z,r:Math.max(H.rx,H.rz),h:H.h,type:'heap:'+H.dress,
   tags:{culture:'xanadu',role:'the works\' '+H.dress+' (core/terrain KRUBBLE)'}});
  const o=KRUBBLE.mesh(H,{cell:1.2}),P=o.pos,c=DR[H.dress]||DR.spoil,col=[];
  for(let v=0;v<P.length/3;v++){const k=(o.part[v]?1.06:.94)*(1-.4*o.occ[v]);col.push(c[0]*k,c[1]*k,c[2]*k);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setIndex(Array.from(o.idx));g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.name=H.id;m.castShadow=m.receiveShadow=true;
  m.userData.inspectLabel=(H.dress==='tailings'?'Tailings':H.dress==='potch'?'Broken potch':'Spoil')+' heap (core/terrain KRUBBLE)';scene.add(m);}}
// the page's own (vendored) biome: only the plants the kit's builders set in their courts and gardens (xaPlant), baked (as
// Kirstabal's); the sheet grows no country flora (the camps' tundra and sinter flats are bare: W4 takes the regions' own)
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
// the runtime LOD: a camp is drawn while it is in the view and within its range
const xwFr=new THREE.Frustum(),xwPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();xwPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);xwFr.setFromProjectionMatrix(xwPm);const P=camera.position;let shown=0;
 for(const e of XW_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&xwFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=XW_GROUPS.length;window._buildMs=Math.round(performance.now()-XW_B0);
/* what verify.py reads: the plan, the census against the tune, the works present, the footprints apart */
window._xw=(function(){if(!XW_PLAN)return{err:XW_ERR?String(XW_ERR&&XW_ERR.stack||XW_ERR):'no plan'};
 const camps=XW_PLAN.camps.map(c=>({id:c.id,rec:c.rec,focus:c.focus,error:c.error,records:c.records.length,pop:c.census?c.census.pop:0,workers:c.census?c.census.workers:0,
  households:c.census?c.census.households:0,camp:!!(c.census&&c.census.camp),part:c.census&&c.census.share?c.census.share.part:null,
  works:c.records.filter(r=>r.role==='works').reduce((a,r)=>{a[r.key]=xwD(a[r.key],0)+1;return a;},{}),landing:!!c.landing,
  religious:(c.records.find(r=>r.role==='religious')||{}).key||null}));
 /* the footprints: no two of a camp's records within core/hamlet's pad of each other, each inside its camp's ground, and each
    drawn at the kit's own box (not a pending box) where the kit has the piece */
 let overlaps=0,outside=0,wrongBox=0;const R=XW_PLACE.map(p=>({p,r:KHAMLET.rect(p.x,p.z,Math.cos(p.ry),-Math.sin(p.ry),p.w,p.d)}));
 for(let i=0;i<R.length;i++){for(let j=i+1;j<R.length;j++)if(R[i].p.camp===R[j].p.camp&&KHAMLET.overlap(R[i].r,R[j].r,.5))overlaps++;
  /* the quay stands at the shore with its face over the water (core/hamlet's landing): its ground is the bank, not the box */
  const C=XW.CAMPS.find(c=>c.id===R[i].p.camp);if(R[i].p.role!=='landing'&&!KHAMLET.corners(R[i].r).every(q=>xwInBox(C.box,q[0],q[1],0)))outside++;
  const k=R[i].p.key,D=xwDims(k);if(D&&(Math.abs(D.w-R[i].p.w)>.01||Math.abs(D.d-R[i].p.d)>.01))wrongBox++;}
 return{camps,sums:XW_PLAN.sums,records:XW_PLAN.records,placed:XW_PLACE.length,vessels:XW_PLAN.vessels.length,heaps:XW_HEAPS.length,
  heapsBy:XW_HEAPS.reduce((a,H)=>{a[H.dress]=xwD(a[H.dress],0)+1;return a;},{}),glazier:XW_PLAN.glazier,glazierDrawn:XW_GROUPS.reduce((n,e)=>n+e.glazier,0),
  standins:XW_STANDINS.length,standinKeys:[...new Set(XW_STANDINS.map(s=>s.split(' ')[1]))],fails:XW_FAILS.slice(0,20),failed:XW_FAILS.length,
  footprints:{overlaps,outside,wrongBox,n:R.length},groups:XW_GROUPS.length};})();
