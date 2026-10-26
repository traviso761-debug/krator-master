// ================================================================= GEOMETRY ENGINE (forked from kits/post-apoc/src/30-geo.js)
// Every primitive is merged into a bucket per material key, in WORLD space, with vertex colours and UVs in world metres
// over TILE[key]. Local frame of a building: origin at the plot centre on the ground, +z the front, x right, y up.
// CM is the running matrix (site placement x sub-frames); W(x,y,z,ry,fn) enters a sub-frame.
// Additions for the tents and the salamanders: psurf() (a parametric sheet: sagging cloth, pyramid faces, twin peaks),
// lathe() (a surface of revolution: yurts, bell tents, domes), tube() (a skin along a curve with an elliptical section),
// per-vertex colour (a geometry's own `color` attribute multiplies the tint) and the cut-away and flutter attributes.
let GB={};                       // material key -> bucket {p,n,u,c,i, f?(flutter), k?(cut), w?(flicker)}
let GTARGET=GB;
const CMS=[new THREE.Matrix4()];let CM=CMS[0];
function pushM(m){CMS.push(CM.clone().multiply(m));CM=CMS[CMS.length-1];}
function popM(){CMS.pop();CM=CMS[CMS.length-1];}
const _e=new THREE.Euler();
function TF(x,y,z,ry,rx,rz){const m=new THREE.Matrix4();const q=new THREE.Quaternion().setFromEuler(_e.set(rx||0,ry||0,rz||0,'YXZ'));m.compose(new THREE.Vector3(x||0,y||0,z||0),q,new THREE.Vector3(1,1,1));return m;}
function W(x,y,z,ry,fn){pushM(TF(x,y,z,ry));try{fn();}finally{popM();}}
function WX(x,y,z,ry,rx,rz,fn){pushM(TF(x,y,z,ry,rx,rz));try{fn();}finally{popM();}}
function resetCM(m){CMS.length=0;CMS.push(m||new THREE.Matrix4());CM=CMS[0];}
// bounding boxes per placed site (world space)
const SBS=[];let SB=null;
function sbBegin(){const b={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9]};SBS.push(b);SB=b;return b;}
function sbEnd(){const b=SBS.pop();SB=SBS.length?SBS[SBS.length-1]:null;if(SB){for(let k=0;k<3;k++){SB.mn[k]=Math.min(SB.mn[k],b.mn[k]);SB.mx[k]=Math.max(SB.mx[k],b.mx[k]);}}return b;}
const _v=new THREE.Vector3(),_n=new THREE.Vector3(),_nm=new THREE.Matrix3(),_mm=new THREE.Matrix4(),_WC=new THREE.Color(1,1,1),_vc=new THREE.Color();
/* CLOTH FLUTTER: whoever draws a loose cloth (a flag, a valance, a ribbon) sets CLOTHW, a rule (p, out): p the vertex in CM's
   frame, out the flutter vector in that frame (0 where pinned). Unset = taut (the covers themselves). */
const _lp=new THREE.Vector3(),_fl=new THREE.Vector3(),_cm3=new THREE.Matrix3();
let CLOTHW=null;
function withCloth(rule,fn){const keep=CLOTHW;CLOTHW=rule;try{fn();}finally{CLOTHW=keep;}}
function clothFlag(len,amp){amp=amp||.18;return (p,out)=>{const t=Math.pow(clamp(Math.abs(p.x)/Math.max(.2,len),0,1.3),1.2)*amp;out.set(0,t*.15,t);};}   // pinned at x = 0 (the pole)
function clothHang(drop,amp){amp=amp||.08;return (p,out)=>{const t=Math.pow(clamp(-p.y/Math.max(.1,drop),0,1.2),1.3)*amp;out.set(t*.3,0,t);};}   // pinned at y = 0 (the top edge)
/* CUT-AWAY: the tent the current geometry belongs to (place() sets it for a def with cut:true): [cx, cz, baseY, on] */
let CUTC=[0,0,0,0];
/* SMOKES and HALOS: smoke sources and lit points (fires, lamps), recorded while building, for 93-anim.js and 91n-night.js */
let SMOKES=[],HALOS=[],HALOKEY=new Set();
function smokeAt(x,y,z,o){if(GTARGET!==GB)return;o=o||{};const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);SMOKES.push({x:p.x,y:p.y,z:p.z,r:o.r||.25,kind:o.kind||'fire'});}
function haloAt(x,y,z,hex,big){if(GTARGET!==GB)return;const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);const k=Math.round(p.x/.6)+','+Math.round(p.y/.6)+','+Math.round(p.z/.6);if(HALOKEY.has(k))return;HALOKEY.add(k);
 const c=hc(hex||0xffb060);HALOS.push({x:p.x,y:p.y,z:p.z,r:c.r,g:c.g,b:c.b,big:!!big});}
function halosReset(){HALOS=[];HALOKEY=new Set();}
let GSTAT={tris:0};
/* emit a base geometry through matrix lm (local to CM). uvm: undefined = world box projection; {su,sv} = the geometry's own UVs
   scaled. A geometry with its own `color` attribute multiplies the tint per vertex (the salamanders' markings). */
function emit(mk,geo,lm,col,uvm){_mm.copy(CM);if(lm)_mm.multiply(lm);
 let a1=0;if(mk==='glow')a1=geo.type==='ConeGeometry'?1:geo.type==='SphereGeometry'?.45:.25;
 const b=GTARGET[mk]||(GTARGET[mk]={p:[],n:[],u:[],c:[],i:[]});
 if(!b.f&&SV_CLOTH[mk])b.f=[];if(!b.k&&SV_CUT[mk])b.k=[];if(!b.w&&mk==='glow')b.w=[];if(b.f&&CLOTHW)_cm3.setFromMatrix4(CM);
 const Pa=geo.attributes.position,Na=geo.attributes.normal,Ua=geo.attributes.uv,Ca=geo.attributes.color,I=geo.index;const base=b.p.length/3;_nm.getNormalMatrix(_mm);
 const c=col===undefined||col===null?_WC:(typeof col==='number'?hc(col):col);const ts=1/(TILE[mk]||1);
 for(let i=0;i<Pa.count;i++){_v.fromBufferAttribute(Pa,i).applyMatrix4(_mm);_n.fromBufferAttribute(Na,i).applyMatrix3(_nm).normalize();
  b.p.push(_v.x,_v.y,_v.z);b.n.push(_n.x,_n.y,_n.z);
  if(Ca)b.c.push(c.r*Ca.getX(i),c.g*Ca.getY(i),c.b*Ca.getZ(i));else b.c.push(c.r,c.g,c.b);
  if(b.f){if(CLOTHW){_lp.fromBufferAttribute(Pa,i);if(lm)_lp.applyMatrix4(lm);CLOTHW(_lp,_fl);_fl.applyMatrix3(_cm3);b.f.push(_fl.x,_fl.y,_fl.z);}else b.f.push(0,0,0);}
  if(b.k)b.k.push(CUTC[0],CUTC[1],CUTC[2],CUTC[3]);
  if(b.w)b.w.push(a1);
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
function gsph(seg){const k='sph'+(seg||12);return _G[k]||(_G[k]=new THREE.SphereGeometry(1,seg||12,Math.max(6,((seg||12)*2/3)|0)));}
function gtor(R,t,rs,ts){const k='tor'+R.toFixed(3)+'_'+t.toFixed(3)+'_'+(rs||6)+'_'+(ts||14);return _G[k]||(_G[k]=(()=>{const g=new THREE.TorusGeometry(R,t,rs||6,ts||14);g.rotateX(PI/2);return g;})());}
function gplane(){return _G.pl||(_G.pl=new THREE.PlaneGeometry(1,1));}
// ---- primitives. Boxes and cylinders are BASE-anchored: (x,y,z) is the middle of the underside.
function box(mk,x,y,z,w,h,d,col,ry,rx,rz){const m=TF(x,y+h/2,z,ry,rx,rz);m.scale(new THREE.Vector3(w,h,d));emit(mk,gbox(),m,col);}
// cyl(mat, x,y,z, r,h, colour, seg, rTop, wrap): vertical, base at y. wrap: own UVs (u round, v up) so a pattern follows the surface
function cyl(mk,x,y,z,r,h,col,seg,rt,wrap){seg=seg||14;const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(r,h,r));const tl=TILE[mk]||1;const uv=wrap?{su:TAU*r/tl,sv:h/tl}:undefined;
 if(rt!==undefined&&rt!==null&&rt!==r)emit(mk,gfrus(seg,rt/r),m,col,uv);else emit(mk,gcyl(seg),m,col,uv);}
function cone(mk,x,y,z,r,h,col,seg){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(r,h,r));emit(mk,gcone(seg||14),m,col);}
function sph(mk,x,y,z,r,col,sy,seg){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(r,r*(sy||1),r));emit(mk,gsph(seg),m,col);}
function ellip(mk,x,y,z,rx,ry_,rz,col,yaw,seg){const m=TF(x,y,z,yaw||0);m.scale(new THREE.Vector3(rx,ry_,rz));emit(mk,gsph(seg),m,col);}
function ring(mk,x,y,z,R,t,col,ry,rx,rz,ts){emit(mk,gtor(R,t,6,ts||Math.max(10,Math.round(R*28))),TF(x,y,z,ry,rx,rz),col);}
// a beam/pole/pipe from point a to point b. round: cylinder of radius w, else square section w x w
const _up=new THREE.Vector3(0,1,0);
function beamQ(dir){const q=new THREE.Quaternion();
 // no-roll basis: X = up x dir, Z = X x dir (setFromUnitVectors leaves an arbitrary roll that turns walls into diamonds)
 if(Math.abs(dir.y)>.999){if(dir.y>0)q.identity();else q.setFromAxisAngle(new THREE.Vector3(1,0,0),PI);}
 else{const X=new THREE.Vector3().crossVectors(_up,dir).normalize();const Z=new THREE.Vector3().crossVectors(X,dir).normalize();q.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,dir,Z));}return q;}
function beam(mk,a,b,w,col,round,seg,w2){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const L=Math.hypot(dx,dy,dz);if(L<1e-6)return;
 const dir=new THREE.Vector3(dx/L,dy/L,dz/L);const q=beamQ(dir);const m=new THREE.Matrix4();
 if(round){m.compose(new THREE.Vector3(a[0],a[1],a[2]),q,new THREE.Vector3(w,L,w));emit(mk,w2!==undefined&&w2!==w?gfrus(seg||8,w2/w):gcyl(seg||8),m,col);}
 else{m.compose(new THREE.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),q,new THREE.Vector3(w,L,w2===undefined?w:w2));emit(mk,gbox(),m,col);}}
function pole(mk,a,b,r,col,seg){beam(mk,a,b,r,col,true,seg||8);}
// a sheet spanning two edges: p0->p1 one edge, p0->p2 the other; thickness th along the normal
function plane4(mk,p0,p1,p2,th,col){
 const e1=new THREE.Vector3(p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]),e2=new THREE.Vector3(p2[0]-p0[0],p2[1]-p0[1],p2[2]-p0[2]);
 const L1=e1.length(),L2=e2.length();if(L1<1e-6||L2<1e-6)return;const X=e1.clone().normalize();const Nn=new THREE.Vector3().crossVectors(X,e2).normalize();const Zc=new THREE.Vector3().crossVectors(X,Nn).normalize();
 const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Nn,Zc));
 const mid=new THREE.Vector3(p0[0],p0[1],p0[2]).addScaledVector(e1,.5).addScaledVector(e2,.5);
 const m=new THREE.Matrix4().compose(mid,q,new THREE.Vector3(L1,th,e2.dot(Zc)));emit(mk,gbox(),m,col);}
// flat single quad: centre, size, rotations (two-sided if the material is)
function quad(mk,x,y,z,w,h,col,ry,rx,rz){const m=TF(x,y,z,ry,rx,rz);m.scale(new THREE.Vector3(w,h,1));emit(mk,gplane(),m,col,{su:w/(TILE[mk]||1),sv:h/(TILE[mk]||1)});}
// custom geometry: make every triangle's winding agree with its stated normal
function fixWind(g){const P=g.attributes.position,N=g.attributes.normal,I=g.index.array;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3();
 for(let t=0;t<I.length;t+=3){a.fromBufferAttribute(P,I[t]);b.fromBufferAttribute(P,I[t+1]);c.fromBufferAttribute(P,I[t+2]);n.crossVectors(b.sub(a),c.sub(a));
  const nx=N.getX(I[t])+N.getX(I[t+1])+N.getX(I[t+2]),ny=N.getY(I[t])+N.getY(I[t+1])+N.getY(I[t+2]),nz=N.getZ(I[t])+N.getZ(I[t+1])+N.getZ(I[t+2]);if(n.x*nx+n.y*ny+n.z*nz<0){const k=I[t+1];I[t+1]=I[t+2];I[t+2]=k;}}return g;}
function mkGeo(pos,nor,uv,idx,colr){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));if(colr)g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.setIndex(idx);return g;}
// convex polygon (local points [x,y,z], counter-clockwise seen from the front)
function poly(mk,pts,col,dbl){const a=pts[0],b=pts[1],c=pts[2];const n=new THREE.Vector3().crossVectors(new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),new THREE.Vector3(c[0]-a[0],c[1]-a[1],c[2]-a[2])).normalize();
 const pos=[],nor=[],idx=[];for(const p of pts){pos.push(p[0],p[1],p[2]);nor.push(n.x,n.y,n.z);}for(let i=1;i<pts.length-1;i++)idx.push(0,i,i+1);
 emit(mk,fixWind(mkGeo(pos,nor,null,idx)),null,col);if(dbl)poly(mk,pts.slice().reverse(),col,false);}
// prism from a convex outline (x,z points, ccw seen from above) extruded from y0 to y1
function prism(mk,pts,y0,y1,col){const n=pts.length;const pos=[],nor=[],idx=[];
 for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];const dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;const nx=dz/L,nz=-dx/L;const s=pos.length/3;
  pos.push(a[0],y0,a[1],b[0],y0,b[1],b[0],y1,b[1],a[0],y1,a[1]);for(let k=0;k<4;k++)nor.push(nx,0,nz);idx.push(s,s+2,s+1,s,s+3,s+2);}
 for(const [y,ny] of [[y1,1],[y0,-1]]){const s=pos.length/3;for(const p of pts){pos.push(p[0],y,p[1]);nor.push(0,ny,0);}for(let i=1;i<n-1;i++){if(ny>0)idx.push(s,s+i+1,s+i);else idx.push(s,s+i,s+i+1);}}
 emit(mk,fixWind(mkGeo(pos,nor,null,idx)),null,col);}
// curved wall: a sector of a ring about (cx,cz), radii r0<r1, angles a0..a1 (x=cos a, z=sin a), y0..y1. Own UVs: u = arc length, v = height.
function sector(mk,cx,cz,r0,r1,a0,a1,y0,y1,col,seg){seg=seg||Math.max(2,Math.ceil(Math.abs(a1-a0)/(PI/18)));const tl=TILE[mk]||1;
 const pos=[],nor=[],uv=[],idx=[];const pt=(r,a,y)=>[cx+Math.cos(a)*r,y,cz+Math.sin(a)*r];
 function strip(r,face){const s0=pos.length/3;for(let i=0;i<=seg;i++){const a=a0+(a1-a0)*i/seg;const nx=Math.cos(a)*face,nz=Math.sin(a)*face;const u=Math.abs(a-a0)*r/tl;
  pos.push(...pt(r,a,y0),...pt(r,a,y1));nor.push(nx,0,nz,nx,0,nz);uv.push(u,y0/tl,u,y1/tl);}
  for(let i=0;i<seg;i++){const s=s0+i*2;idx.push(s,s+1,s+2,s+1,s+3,s+2);}}
 strip(r1,1);strip(r0,-1);
 for(const [y,ny] of [[y1,1],[y0,-1]]){const s0=pos.length/3;for(let i=0;i<=seg;i++){const a=a0+(a1-a0)*i/seg;const p0=pt(r0,a,y),p1=pt(r1,a,y);pos.push(...p0,...p1);nor.push(0,ny,0,0,ny,0);uv.push(p0[0]/tl,p0[2]/tl,p1[0]/tl,p1[2]/tl);}
  for(let i=0;i<seg;i++){const s=s0+i*2;idx.push(s,s+1,s+2,s+1,s+3,s+2);}}
 for(const [a,f] of [[a0,-1],[a1,1]]){const s=pos.length/3;const sg=(a1>a0)?1:-1;const nx=-Math.sin(a)*f*sg,nz=Math.cos(a)*f*sg;pos.push(...pt(r0,a,y0),...pt(r1,a,y0),...pt(r1,a,y1),...pt(r0,a,y1));for(let k=0;k<4;k++)nor.push(nx,0,nz);uv.push(0,y0/tl,(r1-r0)/tl,y0/tl,(r1-r0)/tl,y1/tl,0,y1/tl);
  idx.push(s,s+1,s+2,s,s+2,s+3);}
 emit(mk,fixWind(mkGeo(pos,nor,uv,idx)),null,col,{su:1,sv:1});}
/* ---------------------------------------------------------------- PSURF: a parametric sheet
   psurf(mk, f(u,v) -> [x,y,z], nu, nv, col, o): a grid of (nu+1) x (nv+1) points over u,v in 0..1 in the local frame.
   Normals by central differences; UVs are ARC LENGTHS (metres along u at that v, along v at that u) over TILE, so a
   weave or a pattern keeps its size across a sagging, converging cloth. o.colf(u,v) -> THREE.Color multiplies the
   tint per vertex; o.uvf(u,v) -> [s,t] in metres replaces the arc-length UVs; o.flip reverses the facing (for a single-sided material); o.up makes every normal point up (a ramp, a floor). */
function psurf(mk,f,nu,nv,col,o){o=o||{};const P=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)P.push(f(i/nu,j/nv));
 const id=(i,j)=>j*(nu+1)+i,tl=TILE[mk]||1,pos=[],nor=[],uv=[],idx=[],cl=o.colf?[]:null;
 const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],len=a=>Math.hypot(a[0],a[1],a[2]);
 const U=new Float64Array((nu+1)*(nv+1)),V=new Float64Array((nu+1)*(nv+1));
 for(let j=0;j<=nv;j++)for(let i=1;i<=nu;i++)U[id(i,j)]=U[id(i-1,j)]+len(sub(P[id(i,j)],P[id(i-1,j)]));
 for(let i=0;i<=nu;i++)for(let j=1;j<=nv;j++)V[id(i,j)]=V[id(i,j-1)]+len(sub(P[id(i,j)],P[id(i,j-1)]));
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const p=P[id(i,j)];pos.push(p[0],p[1],p[2]);
  const du=sub(P[id(Math.min(nu,i+1),j)],P[id(Math.max(0,i-1),j)]),dv=sub(P[id(i,Math.min(nv,j+1))],P[id(i,Math.max(0,j-1))]);
  let n=[du[1]*dv[2]-du[2]*dv[1],du[2]*dv[0]-du[0]*dv[2],du[0]*dv[1]-du[1]*dv[0]];let L=len(n);
  if(L<1e-9){const dv2=sub(P[id(i,Math.min(nv,j+2))],P[id(i,Math.max(0,j-2))]),du2=sub(P[id(Math.min(nu,i+2),j)],P[id(Math.max(0,i-2),j)]);n=[du2[1]*dv2[2]-du2[2]*dv2[1],du2[2]*dv2[0]-du2[0]*dv2[2],du2[0]*dv2[1]-du2[1]*dv2[0]];L=len(n)||1;}
  if(o.flip)L=-L;if(o.up&&n[1]/L<0)L=-L;nor.push(n[0]/L,n[1]/L,n[2]/L);
  if(o.uvf){const q=o.uvf(i/nu,j/nv);uv.push(q[0]/tl,q[1]/tl);}else uv.push(U[id(i,j)]/tl,V[id(i,j)]/tl);
  if(cl){const c=o.colf(i/nu,j/nv);cl.push(c.r,c.g,c.b);}}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=id(i,j),b=id(i+1,j),c=id(i+1,j+1),d=id(i,j+1);idx.push(a,b,c,a,c,d);}
 emit(mk,fixWind(mkGeo(pos,nor,uv,idx,cl)),null,col,{su:1,sv:1});}
/* LATHE: a surface of revolution about the local y axis at (cx,cz). prof: [[r,y],...] from the bottom up; a0..a1 the sweep
   (default the whole turn; a part sweep makes a door gap). u is arc length at the profile's widest radius (a pattern band
   keeps its size round the wall), v the length along the profile. */
function lathe(mk,cx,cz,prof,seg,col,o){o=o||{};const a0=o.a0||0,a1=o.a1===undefined?TAU:o.a1;const n=prof.length;let rmax=0;for(const q of prof)rmax=Math.max(rmax,q[0]);
 const sv=[0];for(let j=1;j<n;j++)sv.push(sv[j-1]+Math.hypot(prof[j][0]-prof[j-1][0],prof[j][1]-prof[j-1][1]));
 /* facing: away from the axis (and up) by default; o.inward faces the axis (a lining, a court facade). The raw grid faces
    (-dy, dr) in (radial, up) for a sweep of increasing angle: flip it when that points the wrong way. */
 const dr=prof[n-1][0]-prof[0][0],dy=prof[n-1][1]-prof[0][1];
 const flip=((a1>a0)?1:-1)*(-dy*(o.inward?-1:1)+.5*dr)<0;
 /* UVs. A wall (radius nearly constant) keeps arc length round the ring. A ROOF (the profile closes in toward the axis)
    is unrolled like a cut cone: a point at slant distance s from the apex and angle a lands at s*(cos ka, sin ka) with
    k = r/s at the eave, so the pattern keeps its size and does not shear. Arc length per ring sheared it into a spiral
    (the chief's celestial lining, 2026-10-05); the price is one radial seam at a = a0. */
 const r0=prof[0][0],rn=prof[n-1][0],isRoof=o.uv!=='arc'&&(o.uv==='cone'||(Math.abs(rn-r0)>.35*Math.max(r0,rn)));
 let uvf=null;if(isRoof){const top=r0>rn,Lt=sv[n-1],sAt=v=>{const t=v*(n-1),j=Math.min(n-2,Math.floor(t)),f=t-j,a=sv[j]+(sv[j+1]-sv[j])*f;return top?Lt-a:a;};
  const rBase=top?r0:rn,sBase=Lt+(top?rn:r0)*Lt/Math.max(.01,Math.abs(r0-rn)),k=Math.min(1,rBase/Math.max(.01,sBase)),off=(top?rn:r0)*Lt/Math.max(.01,Math.abs(r0-rn));
  uvf=(u,v)=>{const s0=sAt(v)+off,a=(a1-a0)*u;return [s0*Math.cos(k*a),s0*Math.sin(k*a)];};}
 psurf(mk,(u,v)=>{const a=a0+(a1-a0)*u;const t=v*(n-1),j=Math.min(n-2,Math.floor(t)),f=t-j;const r=prof[j][0]+(prof[j+1][0]-prof[j][0])*f,y=prof[j][1]+(prof[j+1][1]-prof[j][1])*f;
  return [cx+Math.cos(a)*r,y,cz+Math.sin(a)*r];},seg,(n-1)*(o.sub||1),col,{colf:o.colf,flip:o.flip?!flip:flip,uvf});
 return {rmax,len:sv[n-1]};}
/* TUBE: a skin along a centre curve. c(t) -> [x,y,z], t in 0..1; rad(t) -> [half-width, half-height]; the section is an
   ellipse in the plane across the curve, with the curve's up as close to +y as the curve allows. Caps close the ends
   (o.caps). o.colf(t, a) colours each vertex (a: the angle round the section, 0 at the top). */
function tube(mk,c,rad,nt,ns,col,o){o=o||{};const pts=[],T=[],Nn=[],B=[];for(let i=0;i<=nt;i++)pts.push(c(i/nt));
 for(let i=0;i<=nt;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(nt,i+1)];const t=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize();T.push(t);
  let side=new THREE.Vector3().crossVectors(_up,t);if(side.lengthSq()<1e-6)side.set(1,0,0);side.normalize();const up=new THREE.Vector3().crossVectors(t,side).normalize();B.push(side);Nn.push(up);}
 psurf(mk,(u,v)=>{const i=Math.round(v*nt),p=pts[i],r=rad(v),ang=u*TAU;const s=Math.sin(ang)*r[0],h=Math.cos(ang)*r[1];
  return [p[0]+B[i].x*s+Nn[i].x*h,p[1]+B[i].y*s+Nn[i].y*h,p[2]+B[i].z*s+Nn[i].z*h];},ns,nt,col,{colf:o.colf?(u,v)=>o.colf(v,u*TAU):null,flip:!o.flip});   // the raw grid faces in: flip it out
 if(o.caps){for(const [i,sg] of [[0,-1],[nt,1]]){const r=rad(i/nt);if(r[0]<.004)continue;const p=pts[i];const ring=[];for(let k=0;k<ns;k++){const ang=k/ns*TAU;const s=Math.sin(ang)*r[0],h=Math.cos(ang)*r[1];ring.push([p[0]+B[i].x*s+Nn[i].x*h,p[1]+B[i].y*s+Nn[i].y*h,p[2]+B[i].z*s+Nn[i].z*h]);}
  const pos=[p[0],p[1],p[2]],nor=[T[i].x*sg,T[i].y*sg,T[i].z*sg],idx=[];for(const q of ring){pos.push(q[0],q[1],q[2]);nor.push(T[i].x*sg,T[i].y*sg,T[i].z*sg);}
  for(let k=0;k<ns;k++)idx.push(0,1+k,1+(k+1)%ns);const cc=o.colf?o.colf(i/nt,PI*.5).clone():null;if(cc&&col&&col.isColor)cc.multiply(col);emit(mk,fixWind(mkGeo(pos,nor,null,idx)),null,cc||col);}}}
/* MEDALLION: a single-panel sheet (a med* key) mapped ONCE over a flat disc (o.round) or square of side `size`, lying at height y
   and turned o.ry; the image's top edge faces -z (the back of the frame). Lifted 1 cm against the floor it lies on. */
function medallion(mk,x,y,z,size,o){o=o||{};const h=size/2,pos=[],nor=[],uv=[],idx=[];
 if(o.round){const n=o.seg||48;pos.push(0,0,0);nor.push(0,1,0);uv.push(.5,.5);for(let i=0;i<=n;i++){const a=i/n*TAU,cx=Math.cos(a)*h,cz=Math.sin(a)*h;pos.push(cx,0,cz);nor.push(0,1,0);uv.push(.5+cx/size,.5-cz/size);}for(let i=1;i<=n;i++)idx.push(0,i+1,i);}
 else{for(const [cx,cz] of [[-h,-h],[h,-h],[h,h],[-h,h]]){pos.push(cx,0,cz);nor.push(0,1,0);uv.push(.5+cx/size,.5-cz/size);}idx.push(0,2,1,0,3,2);}
 emit(mk,fixWind(mkGeo(pos,nor,uv,idx)),TF(x,y+.01,z,o.ry||0),null,{su:1,sv:1});}
// a rope or cord along a polyline (thin round beams with a ball at each bend)
function cord(mk,pts,r,col){for(let i=0;i<pts.length-1;i++)beam(mk,pts[i],pts[i+1],r,col,true,5);}
// a sagging rope between two points (catenary-ish parabola), n segments
function sagRope(mk,a,b,sag,r,col,n){n=n||8;const P=[];for(let i=0;i<=n;i++){const t=i/n;P.push([lerp(a[0],b[0],t),lerp(a[1],b[1],t)-sag*4*t*(1-t),lerp(a[2],b[2],t)]);}cord(mk,P,r,col);return P;}
// ---- flush: turn buckets into meshes
function flushBuckets(buckets,parent,shadow){const out=[];for(const mk in buckets){const b=buckets[mk];if(!b.i.length)continue;const m=MAT[mk];if(!m){reportErr('no material for bucket '+mk);continue;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));
 if(b.f)g.setAttribute('aFlut',new THREE.Float32BufferAttribute(b.f,3));if(b.k)g.setAttribute('aCut',new THREE.Float32BufferAttribute(b.k,4));if(b.w)g.setAttribute('aFlk',new THREE.Float32BufferAttribute(b.w,1));
 g.setIndex(b.p.length/3>65535?new THREE.Uint32BufferAttribute(b.i,1):new THREE.Uint16BufferAttribute(b.i,1));g.computeBoundingSphere();
 const mesh=new THREE.Mesh(g,m);mesh.userData.mk=mk;if(mk==='glass'||mk==='water')mesh.renderOrder=2;
 if(shadow&&mk!=='glass'&&mk!=='glow'&&mk!=='water'){mesh.castShadow=true;mesh.receiveShadow=true;}
 parent.add(mesh);out.push(mesh);}return out;}
