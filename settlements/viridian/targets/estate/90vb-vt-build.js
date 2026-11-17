// ================================================================= VIRIDIAN — the build: the retaining faces, every place, the tea, the flora
// The pads (89zva, 89zvb) stand on the slope: where one stands off the ground at its edge by more than a metre, an ashlar face
// (the Qiblai pack's qAshB) runs from the lower ground to the upper, every 6 m along the edge. Then every record of VT_PLACE,
// through VERN.place at its level (o.y), chunk by chunk (240 m), each chunk baked into its own group and drawn while in view
// and range (the Azure Dream's 90ae is the model). The tea hedges on the fine ground are drawn whole, one instanced mesh of
// clipped rows (VT_HEDGES.fine); beyond it the near ground carries them painted (90va). [web]: three.js.
reseed(34367);const VT_B0=performance.now();
const vtD=(v,d)=>v==null?d:v;
// ---------------------------------------------------------------- the retaining faces
const VT_RETAIN=new THREE.Group();VT_RETAIN.name='retaining walls';scene.add(VT_RETAIN);
{const stone=xC(xPick(QSTONE)),G=VT_RETAIN;let n=0;
 for(const p of VT_PADS){const edges=[[p.x0,p.z0,p.x1,p.z0,0,-1],[p.x0,p.z1,p.x1,p.z1,0,1],[p.x0,p.z0,p.x0,p.z1,Math.PI/2,-1],[p.x1,p.z0,p.x1,p.z1,Math.PI/2,1]];
  for(const [ax,az,bx,bz,ry,s] of edges){const L=Math.hypot(bx-ax,bz-az),k=Math.max(1,Math.round(L/6)),seg=L/k;
   for(let i=0;i<k;i++){const t=(i+.5)/k,x=ax+(bx-ax)*t,z=az+(bz-az)*t,ox=ry?s*.6:0,oz=ry?0:s*.6,g=vtTerraced(x+ox*3,z+oz*3,vtBase(x+ox*3,z+oz*3));
    if(Math.abs(g-p.y)<1)continue;
    /* another pad that holds the outside point lies over it (two pads meeting): the face is the higher one's */
    const q=vtPadAt(x+ox*3,z+oz*3);const lo=q?Math.min(q.y,p.y):Math.min(g,p.y),hi=q?Math.max(q.y,p.y):Math.max(g,p.y);if(hi-lo<1)continue;
    const T=p.id.startsWith('terrace:')?7:3,cx=x+(ry?s*T/2:0),cz=z+(ry?0:s*T/2);vB('qAshB',cx,lo-1,cz,seg+.05,hi-lo+1.4,T,ry,stone);n++;}}}
 kbake(G);for(const k in KIT.items)KIT.items[k].length=0;window._vtRetain=n;}
// ---------------------------------------------------------------- the places, chunk by chunk
for(const p of VT_PLACE)if(p.o.y==null)p.o.y=terrainH(p.x,p.z);
const VT_CHUNK=240,VT_CHUNKS={};
for(const p of VT_PLACE){const k=Math.floor(p.x/VT_CHUNK)+','+Math.floor(p.z/VT_CHUNK);(VT_CHUNKS[k]=VT_CHUNKS[k]||[]).push(p);}
const VT_GROUPS=[];let VT_INST=0;
function vtBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;p.stacks=[];QB_SHELLREC.cur=p.stacks;
  const g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);QB_SHELLREC.cur=null;if(g)p.G=g;
  for(let i=r0;i<REG.length;i++){REG[i].type=p.key;REG[i].id=REG[i].id||p.id;}
  const r=Math.max(vtD(p.w,10),vtD(p.d,10))/2+10;x0=Math.min(x0,p.x-r);x1=Math.max(x1,p.x+r);z0=Math.min(z0,p.z-r);z1=Math.max(z1,p.z+r);y0=Math.min(y0,vtD(p.o.y,0)-8);y1=Math.max(y1,vtD(p.o.y,0)+vtD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();VT_INST+=vtD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:2800,n:list.length};VT_GROUPS.push(e);
 window._registered=REG.length;return e;}
for(const k of Object.keys(VT_CHUNKS).sort())vtBakeChunk(k,VT_CHUNKS[k]);
window._instances=VT_INST;
const vtFr=new THREE.Frustum(),vtPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();vtPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);vtFr.setFromProjectionMatrix(vtPm);const P=camera.position;let shown=0;
 for(const e of VT_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&vtFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// ---------------------------------------------------------------- the tea on the fine ground: the clipped rows, drawn whole
// each hedge point (1.6 m apart along its row) a clipped block of leaf 0.95 m wide, 1 m high and 1.7 m long on its tread, its
// top's long edges chamfered (the plucking table's rounded shoulders), turned along the row, its green varied a little; one
// InstancedMesh (the tea is ground cover, as the flora is: not a kit's building)
const VT_TEA=(function(){const P=[].concat(...VT_HEDGES.fine),vtN=P.length;if(!vtN)return{n:0};
 const geo=new THREE.BoxGeometry(.95,1,1.7,1,1,1);geo.translate(0,.5,0);
 {const pa=geo.attributes.position;for(let i=0;i<pa.count;i++)if(pa.getY(i)>.99){pa.setX(i,pa.getX(i)*.62);pa.setY(i,.92);}geo.computeVertexNormals();}
 const leaf=MAT.qGrass&&MAT.qGrass.map,mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.78,metalness:0,map:leaf||null});
 const M=new THREE.InstancedMesh(geo,mat,vtN),o=new THREE.Object3D(),c=new THREE.Color(),base=[new THREE.Color(0x7aae58),new THREE.Color(0x6a9e4a),new THREE.Color(0x86b862)];
 for(let i=0;i<vtN;i++){const p=P[i];o.position.set(p.x,terrainH(p.x,p.z)-.05,p.z);o.rotation.set(0,p.a,0);o.scale.set(1,.9+.2*KRAND.unit(KRAND.hash(34368,i)),1);o.updateMatrix();M.setMatrixAt(i,o.matrix);
  c.copy(base[i%3]).convertSRGBToLinear();M.setColorAt(i,c);}
 M.instanceMatrix.needsUpdate=true;if(M.instanceColor)M.instanceColor.needsUpdate=true;M.name='the tea (the fine ground\'s rows)';M.userData.probeSkip=true;M.castShadow=false;M.receiveShadow=true;scene.add(M);
 return{n:vtN,M};})();
// the flora: the Vale of Xanadu's biome over the page's mask (89zva: the forest and coppice on the open slopes, a shade tree
// here and there in the tea), then baked; its LOD ticks with the chunks'
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._biome=XANADU.build({R:VT_SITE.bio.R,quality:.55,lakeHue:XANADU_LAKE.hue})   /* .55: the estate's disc reaches the scarp's face, and the overview stays in its budget */;}catch(e){reportErr('biome: '+(e&&e.stack||e));}
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._chunks=VT_GROUPS.length;window._buildMs=Math.round(performance.now()-VT_B0);
window._viridian=Object.assign({},window._vtSite,{placed:VT_PLACE.length,chunks:VT_GROUPS.length,retain:window._vtRetain,tea:VT_TEA.n,
 byKind:VT_PLACE.reduce((a,p)=>{a[p.kind]=vtD(a[p.kind],0)+1;return a;},{})});
