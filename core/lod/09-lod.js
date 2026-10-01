// ================================================================= LOD: shared level of detail (core/lod, read core/lod/README.md)
// One global, `LOD`, declared nothing else at top level. It works on a FINISHED scene, so a build adopts it with three
// calls and no change to how it makes geometry:
//   LOD.init({THREE, scene, camera, renderer, ...options});   // after the world is built
//   LOD.apply();                                               // takes over the static meshes and instanced meshes
//   LOD.update();                                              // every frame, before renderer.render
// How it draws less, without touching what the build made:
//  * Every object it manages is moved to a layer the camera does not draw (layer 30) and a render COPY stands in for
//    it under `LOD.root`. The original stays where it was, with its userData, visibility and instance order, and stays
//    the raycast target: Raycaster.intersectObject(s) is patched to see layer 30, and the copies do not raycast. So
//    inspectors, picking, labels and probes keep seeing full detail.
//  * A big merged mesh is cut into chunks (a k-d split by triangle centroid: at most `maxTris` triangles and `maxExtent`
//    metres a chunk). The chunks share the original's vertex buffers, so the cut costs only index memory and three.js
//    can frustum-cull each chunk. A chunk switches to a simplified proxy (vertex clustering on a grid of `levels[k]`
//    metres) once that grid is under `errPx` pixels on screen, and drops out when the whole chunk is under `minPx`.
//  * An InstancedMesh keeps ONE draw call. Its instances are bucketed in `cell`-metre cells and sorted by size inside
//    each cell; every update copies, cell by cell, the prefix of instances still bigger than `minPx` on screen into
//    the copy's buffers. Instances with a detailed base geometry switch to a clustered base geometry beyond `errPx`
//    (a second copy, one more draw call). Small detail (figures, clutter, trim, vines) therefore drops first.
//  * The copies follow the originals' `visible` and `material` (night toggles keep working). An original whose matrix,
//    geometry, instance matrices or count change after apply() is animated: it is handed back and drawn as before.
//  * Bands have hysteresis (`hyst`) and the update is throttled (`throttle` ms, `moveEps` m): a still camera costs a
//    matrix compare and two version reads per managed object a frame, plus a visibility sync every 250 ms.
// It draws nothing from any PRNG and changes no build output. LOD.enabled=false (or the panel's button, the `l` key,
// or ?lod=0 in the URL) takes the copies out of the scene and puts the originals back: the scene graph is then exactly
// the one the build made, for verify asserts that count full-detail triangles.
(function(){
 'use strict';
 const LAYER=30,HIDE=1<<LAYER;
 const DEF={cell:64,maxTris:60000,maxExtent:800,minChunkTris:20000,errPx:3,minPx:1,levels:[1,4,16,64],simplifyMinTris:64,
 instFarMinTris:48,instFarDiv:6,throttle:200,moveEps:.5,hyst:1.12,buildMs:10,ui:true,key:'l',
 skip:null,classify:null,classes:{},enabled:true,render:null,pad:1,auto:true,panelStyle:''};
 const L={root:null,managed:0,_on:false,lastMeasure:null};
 let T=null,S=null,CAM=null,R=null,O=null;
 const recs=[],queue=[];
 let dirty=true,lastBand=-1e9,lastSync=-1e9,panel=null,txt=null,btn=null,live={calls:0,tris:0};
 let _cam=null,_camL=null,_inv=null,_lastCam=null;

 // ---------------------------------------------------------------- small helpers
 const triCount=g=>g.index?(g.index.count/3|0):(g.attributes.position.count/3|0);
 const noRay=function(){};
 function effVisible(o){for(let p=o;p;p=p.parent){if(!p.visible)return false;if(p===S)return true;}return false;}
 function pxPerMetre(){const h=(R&&R.domElement&&R.domElement.clientHeight)||innerHeight||640;
 return h/2/Math.tan((CAM.fov||50)*Math.PI/360)*(CAM.zoom||1);}
 function matEq(a,b){const x=a.elements,y=b.elements;for(let i=0;i<16;i++)if(x[i]!==y[i])return false;return true;}
 function getC(a,i,c){return c===0?a.getX(i):c===1?a.getY(i):c===2?a.getZ(i):a.getW(i);}
 function copyProps(c,o){c.name=o.name;c.renderOrder=o.renderOrder;c.castShadow=o.castShadow;c.receiveShadow=o.receiveShadow;
 c.frustumCulled=o.frustumCulled;if(o.customDepthMaterial)c.customDepthMaterial=o.customDepthMaterial;
 if(o.customDistanceMaterial)c.customDistanceMaterial=o.customDistanceMaterial;
 c.onBeforeRender=o.onBeforeRender;c.onAfterRender=o.onAfterRender;
 c.userData=Object.assign({},o.userData,{lodCopy:true,probeSkip:true});c.raycast=noRay;
 c.matrixAutoUpdate=false;c.matrix.copy(o.matrixWorld);c.matrixWorldNeedsUpdate=true;}
 // a geometry that shares every vertex buffer of g, with its own index (never dispose it: that frees the shared buffers)
 function shareGeo(g,index){const s=new T.BufferGeometry();for(const k in g.attributes)s.setAttribute(k,g.attributes[k]);
 if(index)s.setIndex(index);else if(g.index)s.setIndex(g.index);s.groups=g.groups.slice();return s;}
 // bounding sphere of the vertices a triangle list uses
 function sphereOf(pos,idx,tris){let x0=1e30,y0=1e30,z0=1e30,x1=-1e30,y1=-1e30,z1=-1e30;
 const v=t=>idx?idx.getX(t):t;
 for(let i=0;i<tris.length;i++){const t=tris[i]*3;for(let k=0;k<3;k++){const j=v(t+k),x=pos.getX(j),y=pos.getY(j),z=pos.getZ(j);
  if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z;}}
 const c=new T.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);let r=0;
 for(let i=0;i<tris.length;i++){const t=tris[i]*3;for(let k=0;k<3;k++){const j=v(t+k);
  const d=Math.hypot(pos.getX(j)-c.x,pos.getY(j)-c.y,pos.getZ(j)-c.z);if(d>r)r=d;}}
 return new T.Sphere(c,r);}

 // ---------------------------------------------------------------- an int-keyed hash (4 int32 per key)
 function IHash(n){let cap=16;while(cap<n*2)cap<<=1;this.mask=cap-1;this.k=new Int32Array(cap*4);this.v=new Int32Array(cap).fill(-1);this.n=0;}
 IHash.prototype.get=function(a,b,c,d){const k=this.k,v=this.v,m=this.mask;
 let h=(Math.imul(a,73856093)^Math.imul(b,19349663)^Math.imul(c,83492791)^Math.imul(d,2654435761|0))&m;
 for(;;){const id=v[h];if(id<0){v[h]=this.n;k[h*4]=a;k[h*4+1]=b;k[h*4+2]=c;k[h*4+3]=d;return -1-(this.n++);}
  if(k[h*4]===a&&k[h*4+1]===b&&k[h*4+2]===c&&k[h*4+3]===d)return id;h=(h+1)&m;}};

 // ---------------------------------------------------------------- vertex clustering
 // Snap every vertex to a grid of s (in the geometry's own units), keeping vertices whose normals face different ways
 // apart (6 buckets), average position / normal / colour per cell, take other attributes from the first vertex, drop
 // triangles that collapse, and drop duplicates. `tris` (optional) limits it to those triangle ids. Returns
 // {geo (attributes only), index:Uint32Array, from:Int32Array (source triangle of each output triangle)}.
 function cluster(g,s,tris,pin){const P=g.attributes.position,N=g.attributes.normal,I=g.index,nv=P.count;
 const nt=tris?tris.length:triCount(g),H=new IHash(Math.min(nv,nt*3)+8),cid=new Int32Array(nv).fill(-1);
 const vi=t=>I?I.getX(t):t;
 const cnt=[],first=[];let sp=new Float64Array(1024*3),sn=new Float64Array(1024*3);
 const C=g.attributes.color,sc=C?[]:null;
 const idOf=j=>{let c=cid[j];if(c>=0)return c;const x=P.getX(j),y=P.getY(j),z=P.getZ(j);let nb=0;
  if(N){const a=N.getX(j),b=N.getY(j),e=N.getZ(j),A=Math.abs(a),B=Math.abs(b),E=Math.abs(e);nb=A>=B&&A>=E?(a<0?1:0):B>=E?(b<0?3:2):(e<0?5:4);}
  const r=(pin&&pin[j])?H.get(j,-7,-7,-7):H.get(Math.floor(x/s),Math.floor(y/s),Math.floor(z/s),nb);
  if(r<0){c=-1-r;if(c*3+3>sp.length){const a=new Float64Array(sp.length*2);a.set(sp);sp=a;const b2=new Float64Array(sn.length*2);b2.set(sn);sn=b2;}
   cnt[c]=0;first[c]=j;if(sc)for(let k=0;k<C.itemSize;k++)sc[c*C.itemSize+k]=0;}else c=r;
  cnt[c]++;sp[c*3]+=x;sp[c*3+1]+=y;sp[c*3+2]+=z;
  if(N){sn[c*3]+=N.getX(j);sn[c*3+1]+=N.getY(j);sn[c*3+2]+=N.getZ(j);}
  if(sc)for(let k=0;k<C.itemSize;k++)sc[c*C.itemSize+k]+=getC(C,j,k);
  cid[j]=c;return c;};
 const D=new IHash(nt+8),out=[],from=[];
 for(let q=0;q<nt;q++){const t=tris?tris[q]:q;const a=idOf(vi(t*3)),b=idOf(vi(t*3+1)),c=idOf(vi(t*3+2));
  if(a===b||b===c||a===c)continue;
  let x=a,y=b,z=c,u;if(x>y){u=x;x=y;y=u;}if(y>z){u=y;y=z;z=u;}if(x>y){u=x;x=y;y=u;}
  if(D.get(x,y,z,0)>=0)continue;out.push(a,b,c);from.push(t);}
 const nc=cnt.length,geo=new T.BufferGeometry();
 for(const name in g.attributes){const A=g.attributes[name],it=A.itemSize,arr=new (A.array.constructor)(nc*it);
  if(name==='position'){for(let c=0;c<nc;c++)for(let k=0;k<3;k++)arr[c*3+k]=sp[c*3+k]/cnt[c];}
  else if(name==='normal'){for(let c=0;c<nc;c++){const x=sn[c*3],y=sn[c*3+1],z=sn[c*3+2],l=Math.hypot(x,y,z)||1;arr[c*3]=x/l;arr[c*3+1]=y/l;arr[c*3+2]=z/l;}}
  else if(name==='color'){for(let c=0;c<nc;c++)for(let k=0;k<it;k++)arr[c*it+k]=sc[c*it+k]/cnt[c];}
  else{for(let c=0;c<nc;c++)for(let k=0;k<it;k++)arr[c*it+k]=getC(A,first[c],k);}
  const B=new T.BufferAttribute(arr,it,A.normalized);geo.setAttribute(name,B);}
 return {geo,index:out,from,nc};}
 const mkIndex=(arr,nv)=>new T.BufferAttribute(nv>65535?new Uint32Array(arr):new Uint16Array(arr),1);

 // Vertices that must not move: those on an open edge of the mesh (welded by position, so flat-shaded boxes count as
 // closed) and those on an edge between two chunks. Pinning them keeps a proxy's rim exactly where its neighbour's is
 // (another chunk at another level, or another mesh along a shared seam, like the port's terrain strips): no cracks.
 function pins(g,leafOf){const P=g.attributes.position,I=g.index,nv=P.count,nt=triCount(g),q=1e4;
  const W=new IHash(nv+8),pid=new Int32Array(nv);
  for(let j=0;j<nv;j++){const r=W.get(Math.round(P.getX(j)*q),Math.round(P.getY(j)*q),Math.round(P.getZ(j)*q),0);pid[j]=r<0?-1-r:r;}
  const E=new IHash(nt*3+8),cnt=[],ch=[],multi=[];const vi=t=>I?I.getX(t):t;
  for(let t=0;t<nt;t++){const c=leafOf?leafOf[t]:0;for(let k=0;k<3;k++){let a=pid[vi(t*3+k)],b=pid[vi(t*3+(k+1)%3)];if(a===b)continue;if(a>b){const u=a;a=b;b=u;}
   const r=E.get(a,b,0,0);if(r<0){const e=-1-r;cnt[e]=1;ch[e]=c;multi[e]=0;}else{cnt[r]++;if(ch[r]!==c)multi[r]=1;}}}
  const pp=new Uint8Array(W.n);const K=E.k;
  for(let h=0;h<E.v.length;h++){const e=E.v[h];if(e<0)continue;if(cnt[e]===1||multi[e]){pp[K[h*4]]=1;pp[K[h*4+1]]=1;}}
  const out=new Uint8Array(nv);for(let j=0;j<nv;j++)out[j]=pp[pid[j]];return out;}

 // ---------------------------------------------------------------- k-d split of a mesh into chunks
 function kdSplit(cen,ids,maxT,maxE,minT,out){const st=[ids];
 while(st.length){const a=st.pop();let x0=1e30,y0=1e30,z0=1e30,x1=-1e30,y1=-1e30,z1=-1e30;
  for(let i=0;i<a.length;i++){const t=a[i]*3,x=cen[t],y=cen[t+1],z=cen[t+2];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z;}
  const ex=x1-x0,ey=y1-y0,ez=z1-z0,e=Math.max(ex,ey,ez);
  // split while over maxTris, or over maxExtent and still worth a draw call (minChunkTris): sparse far ground stays whole
  if((a.length<=maxT&&(e<=maxE||a.length<=minT))||a.length<2){out.push(a);continue;}
  const ax=e===ex?0:e===ez?2:1,keys=new Float32Array(a.length);for(let i=0;i<a.length;i++)keys[i]=cen[a[i]*3+ax];
  const srt=keys.slice().sort(),med=srt[srt.length>>1];let nl=0;for(let i=0;i<a.length;i++)if(keys[i]<med)nl++;
  if(nl===0||nl===a.length){const h=a.length>>1;st.push(a.subarray(h),a.subarray(0,h));continue;}
  const l=new Int32Array(nl),r=new Int32Array(a.length-nl);let p=0,q=0;for(let i=0;i<a.length;i++){if(keys[i]<med)l[p++]=a[i];else r[q++]=a[i];}
  st.push(r,l);}
 return out;}

 // ---------------------------------------------------------------- what is managed
 function clsOf(o){const name=O.classify?O.classify(o):null,c=(name&&O.classes[name])||{};
 return {name:name||null,minPx:c.minPx!=null?c.minPx:O.minPx,maxDist:c.maxDist!=null?c.maxDist:Infinity,simplify:c.simplify!==false};}
 function wanted(o){if(!o.isMesh||o.isSkinnedMesh||o.userData.lodCopy||o.userData.lodSkip)return false;
 const g=o.geometry,m=o.material;if(!g||!g.isBufferGeometry||!g.attributes.position||Array.isArray(m)||!m)return false;
 if(g.morphAttributes&&g.morphAttributes.position&&g.morphAttributes.position.length)return false;
 if(g.drawRange.start!==0||g.drawRange.count!==Infinity)return false;
 if(m.transparent||m.depthWrite===false||m.side===T.BackSide)return false;
 if(!(o.layers.mask&1))return false;if(o.isInstancedMesh&&!o.count)return false;
 if(O.skip&&O.skip(o))return false;return true;}
 function addMesh(o){const g=o.geometry,P=g.attributes.position,I=g.index,nt=triCount(g);if(!nt)return null;const cl=clsOf(o);
 const rec={kind:'mesh',o,g,cl,nt,ver:P.version,iver:I?I.version:0,mw:o.matrixWorld.clone(),mask0:o.layers.mask,chunks:[],levels:[],copies:[]};
 if(!g.boundingSphere)g.computeBoundingSphere();
 let leaves;
 if(nt<=O.maxTris&&g.boundingSphere.radius*2<=O.maxExtent*1.2)leaves=null;
 else{const cen=new Float32Array(nt*3),v=t=>I?I.getX(t):t;
  for(let t=0;t<nt;t++)for(let k=0;k<3;k++){const j=v(t*3+k);cen[t*3]+=P.getX(j)/3;cen[t*3+1]+=P.getY(j)/3;cen[t*3+2]+=P.getZ(j)/3;}
  const ids=new Int32Array(nt);for(let t=0;t<nt;t++)ids[t]=t;leaves=kdSplit(cen,ids,O.maxTris,O.maxExtent,O.minChunkTris,[]);if(leaves.length<2)leaves=null;}
 if(!leaves){rec.chunks.push({tris:null,full:g,sph:g.boundingSphere.clone(),lv:0,on:true,nt});rec.leafOf=null;}
 else{rec.leafOf=new Int32Array(nt);leaves.forEach((tr,ci)=>{const ix=[];for(let i=0;i<tr.length;i++){rec.leafOf[tr[i]]=ci;const t=tr[i]*3;
   ix.push(I?I.getX(t):t,I?I.getX(t+1):t+1,I?I.getX(t+2):t+2);}
  const sg=shareGeo(g,mkIndex(ix,P.count));const sph=sphereOf(P,I,tr);sph.radius+=O.pad;sg.boundingSphere=sph.clone();
  rec.chunks.push({tris:tr,full:sg,sph,lv:0,on:true,nt:tr.length});});}
 // chunks are culled even where the original was not (the kits and biomes turn culling off on whole-world meshes,
 // whose one sphere would never leave the view); `pad` covers a little vertex-shader sway. userData.lodNoCull opts out.
 for(const ch of rec.chunks){const c=new T.Mesh(ch.full,o.material);copyProps(c,o);if(leaves&&!o.userData.lodNoCull)c.frustumCulled=true;
  ch.m=c;rec.copies.push(c);c._lodOn=true;}
 rec.simp=cl.simplify&&nt>=O.simplifyMinTris;return rec;}
 function addInst(o){const g=o.geometry,n=o.count,cl=clsOf(o);if(!g.boundingSphere)g.computeBoundingSphere();
 const r0=g.boundingSphere.radius,c0=g.boundingSphere.center,M=o.instanceMatrix.array;
 const px=new Float32Array(n),py=new Float32Array(n),pz=new Float32Array(n),ri=new Float32Array(n),sm=new Float32Array(n);
 const cells=new Map(),CS=O.cell;
 for(let i=0;i<n;i++){const b=i*16;const sx=Math.hypot(M[b],M[b+1],M[b+2]),sy=Math.hypot(M[b+4],M[b+5],M[b+6]),sz=Math.hypot(M[b+8],M[b+9],M[b+10]);
  const s=Math.max(sx,sy,sz);sm[i]=s;ri[i]=r0*s;
  px[i]=M[b]*c0.x+M[b+4]*c0.y+M[b+8]*c0.z+M[b+12];py[i]=M[b+1]*c0.x+M[b+5]*c0.y+M[b+9]*c0.z+M[b+13];pz[i]=M[b+2]*c0.x+M[b+6]*c0.y+M[b+10]*c0.z+M[b+14];
  const key=Math.floor(px[i]/CS)+','+Math.floor(pz[i]/CS);let L0=cells.get(key);if(!L0)cells.set(key,L0=[]);L0.push(i);}
 const order=new Int32Array(n),C=[];let p=0,gx=0,gy=0,gz=0;
 for(const L0 of cells.values()){L0.sort((a,b)=>ri[b]-ri[a]||a-b);let x=0,y=0,z=0,smax=0;
  for(const i of L0){x+=px[i];y+=py[i];z+=pz[i];if(sm[i]>smax)smax=sm[i];}
  x/=L0.length;y/=L0.length;z/=L0.length;let r=0;const rs=new Float32Array(L0.length);
  L0.forEach((i,k)=>{order[p+k]=i;rs[k]=ri[i];const d=Math.hypot(px[i]-x,py[i]-y,pz[i]-z)+ri[i];if(d>r)r=d;});
  C.push({start:p,len:L0.length,c:new T.Vector3(x,y,z),r,rs,smax,k:L0.length,lv:0});p+=L0.length;}
 for(let i=0;i<n;i++){gx+=px[i];gy+=py[i];gz+=pz[i];}gx/=n;gy/=n;gz/=n;let gr=0;
 for(let i=0;i<n;i++){const d=Math.hypot(px[i]-gx,py[i]-gy,pz[i]-gz)+ri[i];if(d>gr)gr=d;}
 const sph=new T.Sphere(new T.Vector3(gx,gy,gz),gr*1.02+O.pad);
 // instance data permuted into cell order, so each cell's kept prefix is one contiguous copy
 const srcs=[{get:()=>o.instanceMatrix,it:16,src:null,name:'#m'}];
 if(o.instanceColor)srcs.push({get:()=>o.instanceColor,it:o.instanceColor.itemSize,src:null,name:'#c'});
 for(const k in g.attributes){const A=g.attributes[k];if(A.isInstancedBufferAttribute)srcs.push({get:()=>o.geometry.attributes[k],it:A.itemSize,src:null,name:k});}
 const rec={kind:'inst',o,g,cl,n,cells:C,order,srcs,sph,r0,mver:o.instanceMatrix.version,cver:o.instanceColor?o.instanceColor.version:0,
  mw:o.matrixWorld.clone(),mask0:o.layers.mask,copies:[],lvls:[],farS:0,far:null};
 permute(rec);
 rec.lvls.push(mkInstCopy(rec,g));rec.copies.push(rec.lvls[0].im);
 if(cl.simplify&&triCount(g)>=O.instFarMinTris)rec.farS=r0/O.instFarDiv;
 return rec;}
 function permute(rec){for(const s of rec.srcs){const A=s.get(),it=s.it,a=A.array;if(!s.src||s.src.length!==rec.n*it)s.src=new Float32Array(rec.n*it);
  for(let q=0;q<rec.n;q++){const i=rec.order[q];for(let k=0;k<it;k++)s.src[q*it+k]=a[i*it+k];}}}
 function mkInstCopy(rec,base){const o=rec.o,g=new T.BufferGeometry();
 for(const k in base.attributes){const A=base.attributes[k];if(!A.isInstancedBufferAttribute)g.setAttribute(k,A);}
 if(base.index)g.setIndex(base.index);g.groups=base.groups.slice();
 const im=new T.InstancedMesh(g,o.material,rec.n),bufs={};
 for(const s of rec.srcs){const B=new T.InstancedBufferAttribute(new Float32Array(rec.n*s.it),s.it);B.setUsage(T.DynamicDrawUsage);bufs[s.name]=B;
  if(s.name==='#m')im.instanceMatrix=B;else if(s.name==='#c')im.instanceColor=B;else g.setAttribute(s.name,B);}
 copyProps(im,o);im.frustumCulled=true;g.boundingSphere=rec.sph.clone();im.count=0;im._lodOn=false;im.visible=false;
 return {im,bufs};}

 // ---------------------------------------------------------------- level builds (lazy, time-budgeted)
 function want(rec,lv){if(rec.levels[lv]!==undefined)return true;if(!rec.queued){rec.queued=new Set();}
 if(!rec.queued.has(lv)){rec.queued.add(lv);queue.push([rec,lv]);}return false;}
 function buildLevel(rec,lv){const s=O.levels[lv-1],g=rec.g;
 if(!rec.pin)rec.pin=pins(g,rec.leafOf);
 const res=cluster(g,s,null,rec.pin),prev=lv>1?rec.levels[lv-1]:null,prevN=prev?prev.nt:rec.nt;
 if(res.index.length/3>prevN*.85){rec.levels[lv]=prev||{geos:rec.chunks.map(ch=>ch.full),nt:rec.nt};return;}   // no real saving: reuse the level below
 const per=rec.chunks.map(()=>[]);
 for(let q=0;q<res.from.length;q++){const ci=rec.leafOf?rec.leafOf[res.from[q]]:0;per[ci].push(res.index[q*3],res.index[q*3+1],res.index[q*3+2]);}
 const geos=per.map((ix,ci)=>{if(!ix.length)return null;const G=new T.BufferGeometry();for(const k in res.geo.attributes)G.setAttribute(k,res.geo.attributes[k]);
  G.setIndex(mkIndex(ix,res.nc));G.boundingSphere=rec.chunks[ci].sph.clone();return G;});
 rec.levels[lv]={geos,nt:res.index.length/3};}
 function pump(ms){const t0=performance.now();let n=0;
 while(queue.length&&(n===0||performance.now()-t0<ms)){const [rec,lv]=queue.shift();if(!rec.dead){
   for(let k=1;k<=lv;k++)if(rec.levels[k]===undefined)buildLevel(rec,k);dirty=true;}n++;}}
 function instFar(rec){if(!rec.far){const res=cluster(rec.g,rec.farS,null),G=res.geo;G.setIndex(mkIndex(res.index,res.nc));
  rec.far=mkInstCopy(rec,G);rec.lvls.push(rec.far);rec.copies.push(rec.far.im);L.root.add(rec.far.im);rec.farTris=res.index.length/3;}
 return rec.far;}

 // ---------------------------------------------------------------- the bands
 function bandMesh(rec,P,cam,h){const cl=rec.cl;let full=0,drawn=0;
 for(let ci=0;ci<rec.chunks.length;ci++){const ch=rec.chunks[ci],d=Math.max(0,cam.distanceTo(ch.sph.center)-ch.sph.radius);
  const px=d>0?ch.sph.radius*P/d:1e9;
  ch.on=ch.on?(px>=cl.minPx/h&&d<=cl.maxDist*h):(px>cl.minPx*h&&d<cl.maxDist/h);
  let lv=0;if(rec.simp)for(let k=1;k<=O.levels.length;k++){const thr=O.levels[k-1]*P/O.errPx*(k<=ch.lv?1/h:h);if(d>thr)lv=k;else break;}
  // the deepest level that is built and not past the wanted one
  let use=lv;if(lv&&!want(rec,lv)){use=0;for(let k=lv-1;k>=1;k--)if(rec.levels[k]!==undefined){use=k;break;}}
  ch.lv=lv;const geo=use?rec.levels[use].geos[ci]:ch.full;
  if(ch.m.geometry!==geo&&geo)ch.m.geometry=geo;ch.m._lodOn=ch.on&&!!geo;
  full+=ch.nt;if(ch.m._lodOn)drawn+=triCount(ch.m.geometry);}
 rec.full=full;rec.drawn=drawn;}
 function bandInst(rec,P,cam,h){const cl=rec.cl,cells=rec.cells;let changed=false;const far=rec.farS>0;
 for(const c of cells){const d=Math.max(0,cam.distanceTo(c.c)-c.r);let k;
  if(d>cl.maxDist*(c.k?h:1/h))k=0;
  else if(d<=0)k=c.len;
  else{const rmin=d*cl.minPx/P,cnt=th=>{let lo=0,hi=c.len;while(lo<hi){const m=(lo+hi)>>1;if(c.rs[m]>=th)lo=m+1;else hi=m;}return lo;};
   const kA=cnt(rmin/h),kB=cnt(rmin*h);k=Math.min(kA,Math.max(kB,c.k));}
  let lv=0;if(far){const thr=rec.farS*c.smax*P/O.errPx;lv=d>thr*(c.lv?1/h:h)?1:0;}
  if(k!==c.k||lv!==c.lv){c.k=k;c.lv=lv;changed=true;}}
 if(changed||rec.recolor||!rec.packed){rec.packed=true;rec.recolor=false;
  if(far&&cells.some(c=>c.lv&&c.k))instFar(rec);
  for(let l=0;l<rec.lvls.length;l++){const Lc=rec.lvls[l];let off=0;
   for(const c of cells){if(c.lv!==l||!c.k)continue;for(const s of rec.srcs)Lc.bufs[s.name].array.set(s.src.subarray(c.start*s.it,(c.start+c.k)*s.it),off*s.it);off+=c.k;}
   for(const s of rec.srcs){const B=Lc.bufs[s.name];B.updateRange.offset=0;B.updateRange.count=off*s.it;B.needsUpdate=true;}
   Lc.im.count=off;Lc.im._lodOn=off>0;}}
 let full=0,drawn=0;const t0=triCount(rec.g);full=rec.n*t0;
 for(let l=0;l<rec.lvls.length;l++)drawn+=rec.lvls[l].im.count*(l?rec.farTris:t0);rec.full=full;rec.drawn=drawn;}
 function band(){const P=pxPerMetre(),h=O.hyst;CAM.updateMatrixWorld();_cam.setFromMatrixPosition(CAM.matrixWorld);
 for(const rec of recs){if(rec.dead)continue;_camL.copy(_cam);if(!rec.ident){_inv.copy(rec.mw).invert();_camL.applyMatrix4(_inv);}
  if(rec.kind==='mesh')bandMesh(rec,P,_camL,h);else bandInst(rec,P,_camL,h);}
 stale();sync();}
 // hand back anything that moved or was rebuilt (every frame: a matrix compare and two version reads per object)
 function stale(){for(const rec of recs){if(rec.dead)continue;const o=rec.o;
  if(!o.parent||!matEq(o.matrixWorld,rec.mw)){release(rec);continue;}
  if(rec.kind==='mesh'){const P=o.geometry.attributes.position;if(o.geometry!==rec.g||P.version!==rec.ver||(o.geometry.index&&o.geometry.index.version!==rec.iver))release(rec);}
  else{if(o.instanceMatrix.version!==rec.mver||o.count!==rec.n||o.geometry!==rec.g){release(rec);continue;}
   if(o.instanceColor&&o.instanceColor.version!==rec.cver){rec.cver=o.instanceColor.version;permute(rec);rec.recolor=true;dirty=true;}}}}
 // follow the originals: visibility (with their parents') and material
 function sync(){for(const rec of recs){if(rec.dead)continue;const o=rec.o,vis=effVisible(o),mat=o.material;
  for(const c of rec.copies){if(c.material!==mat)c.material=mat;c.visible=vis&&c._lodOn;}}}
 function release(rec){rec.dead=true;rec.o.layers.mask=rec.mask0;for(const c of rec.copies)if(c.parent)c.parent.remove(c);L.managed--;}

 // ---------------------------------------------------------------- API
 L.init=function(opt){O=Object.assign({},DEF,opt||{});T=O.THREE||window.THREE;S=O.scene;CAM=O.camera;R=O.renderer;
 _cam=new T.Vector3();_camL=new T.Vector3();_inv=new T.Matrix4();_lastCam=new T.Vector3(1e9,1e9,1e9);
 if(!new T.Raycaster().layers)throw new Error('LOD: this three.js has no Raycaster.layers');
 if(!T.Raycaster.prototype._lodPatched){const RP=T.Raycaster.prototype;
  for(const k of ['intersectObject','intersectObjects']){const f=RP[k];
   RP[k]=function(){const m=this.layers.mask;this.layers.mask=m|HIDE;try{return f.apply(this,arguments);}finally{this.layers.mask=m;}};}
  RP._lodPatched=true;}
 L.root=new T.Group();L.root.name='LOD';L.root.userData.probeSkip=true;L.root.userData.lodCopy=true;L.root.matrixAutoUpdate=false;
 const q=/[?&]lod=([01])/.exec(location.search||'');if(q)O.enabled=q[1]==='1';
 // drive update() from the scene's own render: no edit to the build's frame loop, and it runs after three.js has
 // updated every matrixWorld for this frame, so a moved original is caught before it is drawn stale
 if(O.auto!==false){const prev=S.onBeforeRender;S.onBeforeRender=function(r,sc,cam){if(prev)prev.apply(this,arguments);if(cam===CAM)L.update();};}
 return L;};
 L.apply=function(root){const t0=performance.now();root=root||S;S.updateMatrixWorld(true);const list=[];
 root.traverse(o=>{if(wanted(o))list.push(o);});
 for(const o of list){let rec=null;try{rec=o.isInstancedMesh?addInst(o):addMesh(o);}catch(e){console.warn('LOD: skipped '+(o.name||o.type)+': '+e.message);}
  if(!rec)continue;rec.ident=matEq(o.matrixWorld,new T.Matrix4());recs.push(rec);for(const c of rec.copies)L.root.add(c);L.managed++;}
 L.applyMs=Math.round(performance.now()-t0);L._on=false;setEnabled(O.enabled);if(O.ui)mkUI();dirty=true;return L.stats();};
 function setEnabled(on){on=!!on;if(on===L._on)return;L._on=on;
 for(const rec of recs)if(!rec.dead)rec.o.layers.mask=on?HIDE:rec.mask0;
 if(on){S.add(L.root);dirty=true;}else if(L.root.parent)L.root.parent.remove(L.root);paint();}
 Object.defineProperty(L,'enabled',{get:()=>L._on,set:setEnabled});
 L.update=function(force){if(!L._on||!CAM)return;const now=performance.now();
 if(queue.length)pump(O.buildMs);
 CAM.updateMatrixWorld();_cam.setFromMatrixPosition(CAM.matrixWorld);const moved=_cam.distanceTo(_lastCam)>O.moveEps;
 stale();
 if(force||((moved||dirty)&&now-lastBand>=O.throttle)){band();lastBand=now;lastSync=now;_lastCam.copy(_cam);dirty=false;}
 else if(now-lastSync>250){sync();lastSync=now;}};
 // build every pending proxy now and update (verify, screenshots)
 L.flush=function(){band();while(queue.length)pump(1e9);band();lastBand=performance.now();paint();return L.stats();};
 L.release=function(o){for(const rec of recs)if(rec.o===o&&!rec.dead)release(rec);};
 L.stats=function(){let full=0,drawn=0,chunks=0,off=0,far=0,inst=0,kept=0,copies=0;
 for(const rec of recs){if(rec.dead)continue;full+=rec.full||0;drawn+=rec.drawn||0;
  if(rec.kind==='mesh'){chunks+=rec.chunks.length;for(const ch of rec.chunks){if(!ch.m._lodOn)off++;else if(ch.lv)far++;}}
  else{inst+=rec.n;for(const l of rec.lvls)kept+=l.im.count;}
  for(const c of rec.copies)if(c.visible)copies++;}
 return {enabled:L._on,managed:L.managed,applyMs:L.applyMs,chunks,chunksFar:far,chunksOff:off,instances:inst,instancesDrawn:kept,
  managedTris:full,managedTrisDrawn:drawn,visibleCopies:copies,pending:queue.length,live:{calls:R.info.render.calls,tris:R.info.render.triangles},
  measured:L.lastMeasure};};
 // render the current view with LOD off and on; returns {off:{calls,tris,ms},on:{...}}
 L.measure=function(frames){frames=frames||2;const was=L._on,draw=O.render||(()=>R.render(S,CAM)),gl=R.getContext();
 const run=()=>{R.info.reset();draw();const c=R.info.render.calls,t=R.info.render.triangles;gl.finish();const t0=performance.now();
  for(let i=0;i<frames;i++)draw();gl.finish();return {calls:c,tris:t,ms:+((performance.now()-t0)/frames).toFixed(1)};};
 setEnabled(false);const off=run();setEnabled(true);L.flush();const on=run();setEnabled(was);
 L.lastMeasure={off,on};paint();return L.lastMeasure;};

 // ---------------------------------------------------------------- the panel (outside #ui, so view sweeps never click it)
 function fmt(n){return n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':String(n|0);}
 function mkUI(){if(panel||!document.body)return;panel=document.createElement('div');panel.id='lodPanel';
 panel.style.cssText='position:fixed;right:8px;bottom:64px;z-index:30;font:11px/1.35 ui-monospace,Menlo,monospace;color:#eee;background:rgba(0,0,0,.55);padding:4px 7px;border-radius:4px;max-width:46vw;'+(O.panelStyle||'');
 btn=document.createElement('button');btn.style.cssText='font:11px system-ui;margin-right:6px';btn.onclick=()=>{setEnabled(!L._on);};
 const mb=document.createElement('button');mb.textContent='measure';mb.style.cssText='font:11px system-ui';mb.onclick=()=>L.measure();
 txt=document.createElement('pre');txt.style.cssText='margin:3px 0 0;white-space:pre-wrap;font:inherit';
 panel.append(btn,mb,txt);document.body.appendChild(panel);
 addEventListener('keydown',e=>{const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key&&e.key.toLowerCase()===O.key)setEnabled(!L._on);});
 setInterval(paint,600);paint();}
 function paint(){if(!txt)return;btn.textContent='LOD '+(L._on?'on':'off')+' ('+O.key+')';
 const s=L.stats(),m=L.lastMeasure;
 let t='drawn  calls '+s.live.calls+'  tris '+fmt(s.live.tris);
 if(m)t+='\nmeasured  off '+m.off.calls+' / '+fmt(m.off.tris)+'  on '+m.on.calls+' / '+fmt(m.on.tris);
 if(L._on)t+='\nmanaged tris '+fmt(s.managedTrisDrawn)+' of '+fmt(s.managedTris)+'  inst '+fmt(s.instancesDrawn)+' of '+fmt(s.instances)+
  '\nchunks '+s.chunks+' (far '+s.chunksFar+', off '+s.chunksOff+')'+(s.pending?'  building '+s.pending:'');
 txt.textContent=t;}
 window.LOD=L;
})();
