// ---------------------------------------------------------------- surfaces
// fn(u,v)->[x,y,z]; opt.hole(u,v)->bool drops that quad. UVs scaled by opt.uS/vS (world-ish units).
function gridSurface(fn,nu,nv,opt){opt=opt||{};const pos=[],uv=[],idx=[];const cols=nu+1;
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,v=j/nv;const p=fn(u,v);pos.push(p[0],p[1],p[2]);uv.push(u*(opt.uS||1),v*(opt.vS||1));}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){if(opt.hole&&opt.hole((i+.5)/nu,(j+.5)/nv))continue;const a=j*cols+i,b=a+1,c=a+cols,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(idx);g.computeVertexNormals();return g;}
// Lathe with flutes, twist, jagged cut and holes.  o:{rFn(y),H,cut,jag,flutes,amp,sharp,twist,nu,nv,hole(u,y),seed}
function lathe(o){const H=o.H,cut=o.cut!=null?o.cut:H,seed=o.seed||0,nu=o.nu||64,nv=o.nv||48;
 const fn=(u,v)=>{const th=u*TAU;let top=cut;if(o.cut!=null&&o.jag)top=cut+o.jag*(fbm(u*7+seed,2.3,seed*.7,3)*2-1);
  const yy=v*top;let r=o.rFn(Math.min(yy,H));if(o.flutes)r*=1+(o.amp||.08)*Math.pow(.5+.5*Math.cos(th*o.flutes+(o.twist||0)*yy),o.sharp||2);
  return[r*Math.cos(th),yy,r*Math.sin(th)];};
 const opt={uS:o.rFn(0)*TAU/8,vS:cut/8};if(o.hole)opt.hole=(u,v)=>o.hole(u,v*cut);return gridSurface(fn,nu,nv,opt);}
// generic decay hole: more holes near a cut, controlled by d (0..1)
// HOLES scales every decay hole in the kit at once. Decay level 3 (repaired)
// wants the same builders with the same rusted materials but a fabric that is
// only part-eaten, and threading that through 33 builders would be 33 edits
// and 33 chances to miss one. The scene loop sets it per decay level.
let HOLES=1;
// FOOT (optional): {y,h,k}. A ruined shell that thins toward its foot: below
// y+h the threshold rises linearly to k*d more at y (and below). Without it the
// predicate is the original one, term for term, so existing callers are
// unchanged to the vertex.
function holeFn(d,seed,cut,scale,foot){d*=HOLES;if(!(d>0))return null;scale=scale||1;
 if(foot){const fy=foot.y||0,fh=foot.h||1,fk=foot.k!=null?foot.k:.4;
  return(u,y)=>{const n=fbm(u*4.5*scale+seed*.31,y*.028*scale,seed,3);const near=cut!=null?clamp((y-(cut-45))/45,0,1):0;
   return n<.34*d+.4*near*d+fk*clamp((fy+fh-y)/fh,0,1)*d;};}
 return(u,y)=>{const n=fbm(u*4.5*scale+seed*.31,y*.028*scale,seed,3);const near=cut!=null?clamp((y-(cut-45))/45,0,1):0;return n<.34*d+.4*near*d;};}
function mesh(geo,mat,parent,x,y,z){const m=new THREE.Mesh(geo,mat);if(x!==undefined)m.position.set(x,y,z);if(parent)parent.add(m);
 const t=tcur();if(t){t.meshes++;t.tris+=triOf(geo);}
 return m;}
// Merge geometries that share a material and a parent into one mesh.
//
// Draw calls are per mesh, and the close-up views are dominated by towers built
// one storey at a time - a 60-storey tower emitting two bands per floor is 120
// draw calls on its own. Merging is triangle-neutral and, because the per-vertex
// normals are copied rather than recomputed, pixel-neutral too.
//
// Only for OPAQUE materials: transparent meshes are depth-sorted per mesh, so
// merging glass would change the order things blend in.
//
// COLOUR. A `color` attribute survives the merge when every input carries one,
// or when the material draws vertex colours (then a piece without one is
// painted white, i.e. its texture unchanged). Otherwise it is dropped as before.
function meshMerged(geos,mat,parent,x,y,z){
 const keep=geos.filter(g=>g&&g.attributes&&g.attributes.position&&g.attributes.position.count);
 if(!keep.length)return null;
 if(keep.length===1)return mesh(keep[0],mat,parent,x,y,z);
 let nv=0,ni=0;
 for(const g of keep){nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
 const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2);
 const C=(mat&&mat.vertexColors)||keep.every(g=>g.attributes.color&&g.attributes.color.itemSize===3)?new Float32Array(nv*3).fill(1):null;
 const I=nv>65535?new Uint32Array(ni):new Uint16Array(ni);
 let vo=0,io=0;
 for(const g of keep){const A=g.attributes,c=A.position.count;
  P.set(A.position.array,vo*3);
  if(A.normal)N.set(A.normal.array,vo*3);
  if(A.uv)U.set(A.uv.array,vo*2);
  if(C&&A.color&&A.color.itemSize===3)C.set(A.color.array,vo*3);
  if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)I[io+i]=ix[i]+vo;io+=ix.length;}
  else{for(let i=0;i<c;i++)I[io+i]=vo+i;io+=c;}
  vo+=c;}
 const G=new THREE.BufferGeometry();
 G.setAttribute('position',new THREE.BufferAttribute(P,3));
 G.setAttribute('normal',new THREE.BufferAttribute(N,3));
 G.setAttribute('uv',new THREE.BufferAttribute(U,2));
 if(C)G.setAttribute('color',new THREE.BufferAttribute(C,3));
 G.setIndex(new THREE.BufferAttribute(I,1));
 return mesh(G,mat,parent,x,y,z);}
// Bounding box of an object and its children, measured in its PARENT's frame.
function fragBox(o,acc,bb){o.updateMatrix();const m=acc.clone().multiply(o.matrix);
 if(o.isMesh&&o.geometry){const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();
  if(g.boundingBox&&isFinite(g.boundingBox.min.x))bb.union(g.boundingBox.clone().applyMatrix4(m));}
 for(const c of o.children)fragBox(c,m,bb);
 return bb;}
// Drop a broken-off fragment so it rests where it actually fell.
//
// These geometries almost never have their origin at their own centre. The
// satellite dish's fallen panel is a patch of a paraboloid whose origin is the
// dish axis — 25 m to one side and 30 m below the panel itself — so no
// hand-picked y could put it on the ground, and it hung in the air. The fuel
// lobes, the government petal and the lab's broken spire had the same trap.
//
// Call it AFTER setting rotation. It measures the rotated piece, centres its
// footprint on the position the builder asked for, and sets the height so its
// lowest point sits just under `groundY` (default 0, the world floor).
function dropFragment(o,groundY,bury){const gy=groundY||0,b=bury===undefined?.4:bury;
 const bb=fragBox(o,new THREE.Matrix4(),new THREE.Box3());
 if(!isFinite(bb.min.y)||!isFinite(bb.min.x))return o;
 o.position.x+=o.position.x-(bb.min.x+bb.max.x)/2;
 o.position.z+=o.position.z-(bb.min.z+bb.max.z)/2;
 o.position.y+=gy-b-bb.min.y;
 return o;}
function arcShape(W,Hh,t,D){ // parabolic (catenary-ish) arch, origin at centre bottom, +z depth centred
 const s=new THREE.Shape();const N=24;const outer=[],inner=[];
 for(let i=0;i<=N;i++){const x=-W/2+W*i/N;outer.push([x,Hh*(1-Math.pow(2*x/W,2))]);}
 const Wi=W-2*t,Hi=Hh-t;for(let i=0;i<=N;i++){const x=-Wi/2+Wi*i/N;inner.push([x,Hi*(1-Math.pow(2*x/Wi,2))]);}
 s.moveTo(outer[0][0],0);outer.forEach(p=>s.lineTo(p[0],p[1]));s.lineTo(W/2,0);s.lineTo(Wi/2,0);
 for(let i=N;i>=0;i--)s.lineTo(inner[i][0],inner[i][1]);s.lineTo(-Wi/2,0);s.lineTo(-W/2,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:D,bevelEnabled:false});g.translate(0,0,-D/2);return g;}
function paraFill(W,Hh,holeW,holeH){ // parabolic wall with an arched opening (ShapeGeometry, in xy plane)
 const s=new THREE.Shape();const N=24;s.moveTo(-W/2,0);for(let i=0;i<=N;i++){const x=-W/2+W*i/N;s.lineTo(x,Hh*(1-Math.pow(2*x/W,2)));}s.lineTo(W/2,0);
 if(holeW){const h=new THREE.Path();h.moveTo(-holeW/2,0);for(let i=0;i<=N;i++){const x=-holeW/2+holeW*i/N;h.lineTo(x,holeH*(1-Math.pow(2*x/holeW,2)));}h.lineTo(holeW/2,0);s.holes.push(h);}
 return new THREE.ShapeGeometry(s);}
function arcWindowGeo(w,h,dep){const s=new THREE.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2-w/2);s.absarc(0,h/2-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,-h/2);
 const g=new THREE.ExtrudeGeometry(s,{depth:dep,bevelEnabled:false});g.translate(0,0,-dep/2);return g;}
function hyperGeo(r0,h,k){return lathe({rFn:y=>r0*Math.sqrt(1+k*Math.pow((y-h/2)/(h/2),2)),H:h,nu:24,nv:10});}

