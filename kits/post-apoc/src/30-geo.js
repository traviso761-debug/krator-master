// ---------------------------------------------------------------- geometry engine
// Every primitive is merged into a bucket per material key, in WORLD space, with vertex colours and world-unit UVs.
// Local frame of a building: origin at the plot centre on the ground, +z the front, x right, y up. CM is the running
// matrix (site placement x sub-frames); W(x,y,z,ry,fn) enters a sub-frame.
let GB={};                       // material key -> buckets {p,n,u,c,i}
let GTARGET=GB;                  // where emit() writes (GB, or a spinner's own set)
const CMS=[new THREE.Matrix4()];let CM=CMS[0];
function pushM(m){CMS.push(CM.clone().multiply(m));CM=CMS[CMS.length-1];}
function popM(){CMS.pop();CM=CMS[CMS.length-1];}
const _e=new THREE.Euler();
function TF(x,y,z,ry,rx,rz){const m=new THREE.Matrix4();const q=new THREE.Quaternion().setFromEuler(_e.set(rx||0,ry||0,rz||0,'YXZ'));m.compose(new THREE.Vector3(x||0,y||0,z||0),q,new THREE.Vector3(1,1,1));return m;}
function W(x,y,z,ry,fn){pushM(TF(x,y,z,ry));try{fn();}finally{popM();}}
function resetCM(m){CMS.length=0;CMS.push(m||new THREE.Matrix4());CM=CMS[0];}
// bounding boxes per placed site (world space)
const SBS=[];let SB=null;
function sbBegin(){const b={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9]};SBS.push(b);SB=b;return b;}
function sbEnd(){const b=SBS.pop();SB=SBS.length?SBS[SBS.length-1]:null;if(SB){for(let k=0;k<3;k++){SB.mn[k]=Math.min(SB.mn[k],b.mn[k]);SB.mx[k]=Math.max(SB.mx[k],b.mx[k]);}}return b;}
const _v=new THREE.Vector3(),_n=new THREE.Vector3(),_nm=new THREE.Matrix3(),_mm=new THREE.Matrix4(),_WC=new THREE.Color(1,1,1);
let GSTAT={tris:0};
// emit a base geometry through matrix lm (local to CM). uvm: undefined = world box projection; {su,sv} = the geometry's own UVs scaled
function emit(mk,geo,lm,col,uvm){_mm.copy(CM);if(lm)_mm.multiply(lm);
 const b=GTARGET[mk]||(GTARGET[mk]={p:[],n:[],u:[],c:[],i:[]});
 const Pa=geo.attributes.position,Na=geo.attributes.normal,Ua=geo.attributes.uv,I=geo.index;const base=b.p.length/3;_nm.getNormalMatrix(_mm);
 let c=col===undefined||col===null?_WC:(typeof col==='number'?hc(col):col);const ts=1/(TILE[mk]||1);
 if(WEATHER[mk]&&c!==_WC)c=weather(c,WEATHER[mk]);
 for(let i=0;i<Pa.count;i++){_v.fromBufferAttribute(Pa,i).applyMatrix4(_mm);_n.fromBufferAttribute(Na,i).applyMatrix3(_nm).normalize();
  b.p.push(_v.x,_v.y,_v.z);b.n.push(_n.x,_n.y,_n.z);b.c.push(c.r,c.g,c.b);
  if(uvm&&Ua){b.u.push(Ua.getX(i)*uvm.su,Ua.getY(i)*uvm.sv);}
  else{const ax=Math.abs(_n.x),ay=Math.abs(_n.y),az=Math.abs(_n.z);if(ay>=ax&&ay>=az)b.u.push(_v.x*ts,_v.z*ts);else if(ax>az)b.u.push(_v.z*ts,_v.y*ts);else b.u.push(_v.x*ts,_v.y*ts);}
  if(SB){if(_v.x<SB.mn[0])SB.mn[0]=_v.x;if(_v.y<SB.mn[1])SB.mn[1]=_v.y;if(_v.z<SB.mn[2])SB.mn[2]=_v.z;if(_v.x>SB.mx[0])SB.mx[0]=_v.x;if(_v.y>SB.mx[1])SB.mx[1]=_v.y;if(_v.z>SB.mx[2])SB.mx[2]=_v.z;}}
 if(I){for(let i=0;i<I.count;i++)b.i.push(base+I.getX(i));GSTAT.tris+=I.count/3;}else{for(let i=0;i<Pa.count;i++)b.i.push(base+i);GSTAT.tris+=Pa.count/3;}
 if(!isFinite(_v.x+_v.y+_v.z))reportErr('NaN vertex in bucket '+mk);}
// ---- base geometries (unit sized, cached)
const _G={};
function gbox(){return _G.box||(_G.box=new THREE.BoxGeometry(1,1,1));}
function gcyl(seg,open){const k='cyl'+seg+(open?'o':'');if(!_G[k]){const g=new THREE.CylinderGeometry(1,1,1,seg,1,!!open);g.translate(0,.5,0);_G[k]=g;}return _G[k];}
function gcone(seg){const k='cone'+seg;return _G[k]||(_G[k]=(()=>{const g=new THREE.ConeGeometry(1,1,seg,1);g.translate(0,.5,0);return g;})());}
function gfrus(seg,rt){const k='fr'+seg+'_'+rt.toFixed(3);return _G[k]||(_G[k]=(()=>{const g=new THREE.CylinderGeometry(rt,1,1,seg,1);g.translate(0,.5,0);return g;})());}
function gsph(){return _G.sph||(_G.sph=new THREE.SphereGeometry(1,12,8));}
function gtor(R,t,rs,ts){const k='tor'+R.toFixed(2)+'_'+t.toFixed(2);return _G[k]||(_G[k]=(()=>{const g=new THREE.TorusGeometry(R,t,rs||6,ts||12);g.rotateX(PI/2);return g;})());}
function gplane(){return _G.pl||(_G.pl=new THREE.PlaneGeometry(1,1));}
// ---- primitives. Boxes and cylinders are BASE-anchored: (x,y,z) is the middle of the underside.
// box(mat, x,y,z, w,h,d, colour, ry, rx, rz)   rotations are about the box's own centre, ry first
function box(mk,x,y,z,w,h,d,col,ry,rx,rz){const m=TF(x,y+h/2,z,ry,rx,rz);m.scale(new THREE.Vector3(w,h,d));emit(mk,gbox(),m,col);}
// cyl(mat, x,y,z, r,h, colour, seg, rTop, wrap): vertical, base at y. wrap: own UVs (u round, v up) so ribs follow the surface
function cyl(mk,x,y,z,r,h,col,seg,rt,wrap){seg=seg||14;const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(r,h,r));const tl=TILE[mk]||1;const uv=wrap?{su:TAU*r/tl,sv:h/tl}:undefined;
 if(rt!==undefined&&rt!==null&&rt!==r)emit(mk,gfrus(seg,rt/r),m,col,uv);else emit(mk,gcyl(seg),m,col,uv);}
function cone(mk,x,y,z,r,h,col,seg){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(r,h,r));emit(mk,gcone(seg||14),m,col);}
function sph(mk,x,y,z,r,col,sy){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(r,r*(sy||1),r));emit(mk,gsph(),m,col);}
// a tyre with its axis vertical (lying flat); tilt it with rx/rz to stand it up. R = outer radius, t = tube radius
function tire(x,y,z,R,t,col,ry,rx,rz){R=R||.36;t=t||.13;emit('rubber',gtor(R-t,t),TF(x,y,z,ry,rx,rz),col===undefined?0x232120:col);}
// a beam/pole/pipe from point a to point b. round: cylinder of radius w, else square section w x w
const _up=new THREE.Vector3(0,1,0);
function beamQ(dir){const q=new THREE.Quaternion();
 // no-roll basis: X = up x dir, Z = X x dir (setFromUnitVectors leaves an arbitrary roll that turns walls into diamonds)
 if(Math.abs(dir.y)>.999){if(dir.y>0)q.identity();else q.setFromAxisAngle(new THREE.Vector3(1,0,0),PI);}
 else{const X=new THREE.Vector3().crossVectors(_up,dir).normalize();const Z=new THREE.Vector3().crossVectors(X,dir).normalize();q.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,dir,Z));}return q;}
function beam(mk,a,b,w,col,round,seg){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const L=Math.hypot(dx,dy,dz);if(L<1e-6)return;
 const dir=new THREE.Vector3(dx/L,dy/L,dz/L);const q=beamQ(dir);const m=new THREE.Matrix4();
 if(round){m.compose(new THREE.Vector3(a[0],a[1],a[2]),q,new THREE.Vector3(w,L,w));emit(mk,gcyl(seg||8),m,col);}
 else{m.compose(new THREE.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),q,new THREE.Vector3(w,L,w));emit(mk,gbox(),m,col);}}
// a sheet spanning two edges: p0->p1 is one edge, p0->p3 the other; thickness th along the normal. Roof sheets, panels.
function plane4(mk,p0,p1,p2,p3,th,col){
 const e1=new THREE.Vector3(p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]),e2=new THREE.Vector3(p2[0]-p0[0],p2[1]-p0[1],p2[2]-p0[2]);   // p2 is the same-side corner across from p0 (p3 is the diagonal, unused)
 const L1=e1.length(),L2=e2.length();if(L1<1e-6||L2<1e-6)return;const X=e1.clone().normalize();const Nn=new THREE.Vector3().crossVectors(X,e2).normalize();const Zc=new THREE.Vector3().crossVectors(X,Nn).normalize();
 const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Nn,Zc));
 const mid=new THREE.Vector3(p0[0],p0[1],p0[2]).addScaledVector(e1,.5).addScaledVector(e2,.5);
 const m=new THREE.Matrix4().compose(mid,q,new THREE.Vector3(L1,th,e2.dot(Zc)));emit(mk,gbox(),m,col);}
// a pitched panel: from x0 to x1, low edge (zLow,yLow), high edge (zHigh,yHigh)
function roofP(mk,x0,x1,zLow,yLow,zHigh,yHigh,th,col){plane4(mk,[x0,yLow,zLow],[x1,yLow,zLow],[x0,yHigh,zHigh],[x1,yHigh,zHigh],th||.06,col);}
// flat single quad in the local frame (two-sided if the material is): centre, size, rotations. Cloth, emblems, chain-link.
function quad(mk,x,y,z,w,h,col,ry,rx,rz){const m=TF(x,y,z,ry,rx,rz);m.scale(new THREE.Vector3(w,h,1));emit(mk,gplane(),m,col,{su:w/(TILE[mk]||1),sv:h/(TILE[mk]||1)});}
// a quad carrying a whole texture (0..1 UVs): emblems and signs
function decal(mk,x,y,z,w,h,ry,rx,rz){const m=TF(x,y,z,ry,rx,rz);m.scale(new THREE.Vector3(w,h,1));emit(mk,gplane(),m,null,{su:1,sv:1});}
// custom geometry: make every triangle's winding agree with its stated normal (a fan wound the wrong way is invisible from the side it is meant to be seen from)
function fixWind(g){const P=g.attributes.position,N=g.attributes.normal,I=g.index.array;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3();
 for(let t=0;t<I.length;t+=3){a.fromBufferAttribute(P,I[t]);b.fromBufferAttribute(P,I[t+1]);c.fromBufferAttribute(P,I[t+2]);n.crossVectors(b.sub(a),c.sub(a));
  const nx=N.getX(I[t]),ny=N.getY(I[t]),nz=N.getZ(I[t]);if(n.x*nx+n.y*ny+n.z*nz<0){const k=I[t+1];I[t+1]=I[t+2];I[t+2]=k;}}return g;}
// convex polygon (local points [x,y,z], counter-clockwise seen from the front)
function poly(mk,pts,col,dbl){const a=pts[0],b=pts[1],c=pts[2];const n=new THREE.Vector3().crossVectors(new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),new THREE.Vector3(c[0]-a[0],c[1]-a[1],c[2]-a[2])).normalize();
 const g=new THREE.BufferGeometry();const pos=[],nor=[],idx=[];for(const p of pts){pos.push(p[0],p[1],p[2]);nor.push(n.x,n.y,n.z);}for(let i=1;i<pts.length-1;i++)idx.push(0,i,i+1);
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);fixWind(g);emit(mk,g,null,col);
 if(dbl)poly(mk,pts.slice().reverse(),col,false);}
// prism from a convex outline (x,z points, ccw seen from above) extruded from y0 to y1
function prism(mk,pts,y0,y1,col){const n=pts.length;const g=new THREE.BufferGeometry();const pos=[],nor=[],idx=[];
 for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];const dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;const nx=dz/L,nz=-dx/L;const s=pos.length/3;
  pos.push(a[0],y0,a[1],b[0],y0,b[1],b[0],y1,b[1],a[0],y1,a[1]);for(let k=0;k<4;k++)nor.push(nx,0,nz);idx.push(s,s+2,s+1,s,s+3,s+2);}
 for(const [y,ny] of [[y1,1],[y0,-1]]){const s=pos.length/3;for(const p of pts){pos.push(p[0],y,p[1]);nor.push(0,ny,0);}for(let i=1;i<n-1;i++){if(ny>0)idx.push(s,s+i+1,s+i);else idx.push(s,s+i,s+i+1);}}
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);fixWind(g);emit(mk,g,null,col);}
// curved wall: a sector of a ring about (cx,cz), radii r0<r1, angles a0..a1 (x=cos a, z=sin a), y0..y1. Own UVs: u = arc length, v = height.
function sector(mk,cx,cz,r0,r1,a0,a1,y0,y1,col,seg){seg=seg||Math.max(2,Math.ceil(Math.abs(a1-a0)/(PI/14)));const tl=TILE[mk]||1;
 const pos=[],nor=[],uv=[],idx=[];const pt=(r,a,y)=>[cx+Math.cos(a)*r,y,cz+Math.sin(a)*r];
 function strip(r,face){const s0=pos.length/3;for(let i=0;i<=seg;i++){const a=a0+(a1-a0)*i/seg;const nx=Math.cos(a)*face,nz=Math.sin(a)*face;const u=Math.abs(a-a0)*r/tl;
  pos.push(...pt(r,a,y0),...pt(r,a,y1));nor.push(nx,0,nz,nx,0,nz);uv.push(u,0,u,(y1-y0)/tl);}
  for(let i=0;i<seg;i++){const s=s0+i*2;const fw=(a1>a0)===(face>0);if(fw)idx.push(s,s+1,s+2,s+1,s+3,s+2);else idx.push(s,s+2,s+1,s+1,s+2,s+3);}}
 strip(r1,1);strip(r0,-1);
 for(const [y,ny] of [[y1,1],[y0,-1]]){const s0=pos.length/3;for(let i=0;i<=seg;i++){const a=a0+(a1-a0)*i/seg;pos.push(...pt(r0,a,y),...pt(r1,a,y));nor.push(0,ny,0,0,ny,0);const u=Math.abs(a-a0)*r1/tl;uv.push(u,0,u,(r1-r0)/tl);}
  for(let i=0;i<seg;i++){const s=s0+i*2;const up=(a1>a0)===(ny<0);if(up)idx.push(s,s+1,s+2,s+1,s+3,s+2);else idx.push(s,s+2,s+1,s+1,s+2,s+3);}}
 for(const [a,f] of [[a0,-1],[a1,1]]){const s=pos.length/3;const sg=(a1>a0)?1:-1;const nx=-Math.sin(a)*f*sg,nz=Math.cos(a)*f*sg;pos.push(...pt(r0,a,y0),...pt(r1,a,y0),...pt(r1,a,y1),...pt(r0,a,y1));for(let k=0;k<4;k++)nor.push(nx,0,nz);uv.push(0,0,(r1-r0)/tl,0,(r1-r0)/tl,(y1-y0)/tl,0,(y1-y0)/tl);
  const fw=(f*sg>0);if(fw)idx.push(s,s+2,s+1,s,s+3,s+2);else idx.push(s,s+1,s+2,s,s+2,s+3);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);fixWind(g);emit(mk,g,null,col,{su:1,sv:1});}
// pipe along a polyline (bends are spheres)
function pipe(mk,pts,r,col,seg){for(let i=0;i<pts.length-1;i++)beam(mk,pts[i],pts[i+1],r,col,true,seg||8);for(let i=1;i<pts.length-1;i++)sph(mk,pts[i][0],pts[i][1],pts[i][2],r*1.02,col);}
// ---- flush: turn buckets into meshes
function flushBuckets(buckets,parent,shadow){const out=[];for(const mk in buckets){const b=buckets[mk];if(!b.i.length)continue;const m=MAT[mk];if(!m){reportErr('no material for bucket '+mk);continue;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));
 g.setIndex(b.p.length/3>65535?new THREE.Uint32BufferAttribute(b.i,1):new THREE.Uint16BufferAttribute(b.i,1));g.computeBoundingSphere();
 const mesh=new THREE.Mesh(g,m);mesh.userData.mk=mk;if(mk==='glass')mesh.renderOrder=2;
 if(shadow){if(mk!=='glass'&&mk!=='chain'&&mk!=='glow'){mesh.castShadow=true;mesh.receiveShadow=mk!=='cloth';}}
 parent.add(mesh);out.push(mesh);}return out;}
// ---- spinners: parts that turn (rotors, fans). spin(x,y,z,ry,axis,rate,fn): fn builds in a local frame whose origin is the pivot.
const SPINNERS=[];
function spin(x,y,z,ry,axis,rate,fn){const keep=GTARGET,keepCM=CM,keepStack=CMS.slice(),keepSB=SB;SB=null;const own={};GTARGET=own;   // spinner vertices are in their own frame: keep them out of the building bbox
 const wm=CM.clone().multiply(TF(x,y,z,ry));CMS.length=0;CMS.push(new THREE.Matrix4());CM=CMS[0];
 try{fn();}finally{GTARGET=keep;SB=keepSB;CMS.length=0;for(const m of keepStack)CMS.push(m);CM=keepCM;}
 SPINNERS.push({buckets:own,world:wm,axis:axis||'z',rate:rate===undefined?1:rate});}
