// ================================================================= BIOME CORE — kit
// Two ways to put geometry in the world, both cheap:
//   INSTANCED ITEMS   BIO.def(name,geo,mat) once, BIO.put(name,...) thousands of
//                     times, one InstancedMesh per item at bake. Per-instance
//                     colour, and optional per-instance extras (aN normal, aC2
//                     second colour) for the foliage shaders.
//   MERGED BUCKET     BIO.tri/quad/tube/lathe/surf write vertex-coloured
//                     triangles into a bucket per material family; one Mesh per
//                     family at bake. Boles, limbs, logs, boulders go here.
// Both are charged to BIO.cur by the accounting in 10-core-head.js.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm}=BIO.fn;
BIO.defs={};BIO.order=[];BIO.items={};
BIO.def=function(name,geo,mat,opt){opt=opt||{};
 if(BIO.defs[name])BIO.err('BIO.def: '+name+' defined twice');
 const g=geo.index?geo.toNonIndexed():geo;
 BIO.defs[name]={geo:g,mat,tris:g.attributes.position.count/3,attrs:opt.attrs||null,label:opt.label||name};
 BIO.items[name]={m:[],c:[],n:[],c2:[],count:0};BIO.order.push(name);};
const _bm=new (function(){return {}})();   // scratch holder, filled after THREE binds
BIO._scratch=function(){const T=BIO.host.THREE;if(!_bm.m){_bm.m=new T.Matrix4();_bm.q=new T.Quaternion();_bm.e=new T.Euler();_bm.p=new T.Vector3();_bm.s=new T.Vector3();_bm.c=new T.Color();_bm.up=new T.Vector3(0,1,0);_bm.v=new T.Vector3();}return _bm;};
// rotation helpers: qEuler(rx,ry,rz) or qFacing([nx,ny,nz]) (local +z toward n)
function qEuler(rx,ry,rz){const S=BIO._scratch();S.e.set(rx||0,ry||0,rz||0,'YXZ');return new BIO.host.THREE.Quaternion().setFromEuler(S.e);}
function qFacing(n){const T=BIO.host.THREE,v=new T.Vector3(n[0],n[1],n[2]).normalize();return new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),v);}
function qUp(n){const T=BIO.host.THREE,v=new T.Vector3(n[0],n[1],n[2]).normalize();return new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v);}
// put(name, [x,y,z], quat|null, [sx,sy,sz]|s, colour(hex|Color|null), extra{n:[..], c2:hex})
BIO.put=function(name,pos,q,sc,col,extra){
 const it=BIO.items[name];if(!it){BIO.err('BIO.put: no item '+name);return;}
 if(!(isFinite(pos[0])&&isFinite(pos[1])&&isFinite(pos[2]))){BIO.err('BIO.put: NaN position for '+name);return;}
 const S=BIO._scratch();
 S.p.set(pos[0],pos[1],pos[2]);
 if(typeof sc==='number')S.s.set(sc,sc,sc);else S.s.set(sc[0],sc[1],sc[2]);
 S.m.compose(S.p,q||S.q.set(0,0,0,1),S.s);
 const e=S.m.elements;for(let i=0;i<16;i++)it.m.push(e[i]);
 if(col==null)it.c.push(1,1,1);
 else{if(col.isColor)S.c.copy(col);else S.c.set(col);S.c.convertSRGBToLinear();it.c.push(S.c.r,S.c.g,S.c.b);}
 const def=BIO.defs[name];
 if(def.attrs){
  if(def.attrs.indexOf('aN')>=0){const n=(extra&&extra.n)||[0,1,0];it.n.push(n[0],n[1],n[2]);}
  if(def.attrs.indexOf('aC2')>=0){const c2=extra&&extra.c2;if(c2==null)it.c2.push(S.c.r,S.c.g,S.c.b);else{if(c2.isColor)S.c.copy(c2);else S.c.set(c2);S.c.convertSRGBToLinear();it.c2.push(S.c.r,S.c.g,S.c.b);}}}
 it.count++;BIO.tally(def.tris,1,0);};
// a beam of instanced item `name` (a unit cylinder along y, centred) from a to b
BIO.beam=function(name,a,b,r0,r1,col){const T=BIO.host.THREE,S=BIO._scratch();
 const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz);if(L<1e-4)return;
 S.v.set(dx/L,dy/L,dz/L);const q=new T.Quaternion().setFromUnitVectors(S.up,S.v);
 BIO.put(name,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],q,[r0*2,L,(r1==null?r0:r1)*2],col);};

// ---------------------------------------------------------------- merged buckets
BIO.buckets={};
BIO.bucket=function(fam,mat,opt){opt=opt||{};
 if(!BIO.buckets[fam])BIO.buckets[fam]={mat,pos:[],nor:[],uv:[],col:[],tris:0,label:opt.label||fam,uvScale:opt.uvScale||[3,3]};
 return BIO.buckets[fam];};
const _lc={r:1,g:1,b:1};
// COLOURS ARE sRGB IN, LINEAR OUT. r128 sends instance and vertex colours to
// the shader untouched, and the renderer encodes its output to sRGB, so a raw
// hex would render a stop too bright. Everything passed here is a designer's
// sRGB colour (hex, Color, or [r,g,b] already linear) and is converted once.
function _col3(c){const S=BIO._scratch();if(c==null)return[1,1,1];if(Array.isArray(c))return c;
 if(c.isColor)S.c.copy(c);else S.c.set(c);S.c.convertSRGBToLinear();return[S.c.r,S.c.g,S.c.b];}
// one triangle, flat normal unless `n` is given; a,b,c CCW from outside
BIO.tri=function(fam,a,b,c,col,n){const K=BIO.buckets[fam];if(!K){BIO.err('BIO.tri: no bucket '+fam);return;}
 let nx,ny,nz;if(n){nx=n[0];ny=n[1];nz=n[2];}else{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  nx=uy*vz-uz*vy;ny=uz*vx-ux*vz;nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;}
 const cc=_col3(col);
 [a,b,c].forEach(p=>{K.pos.push(p[0],p[1],p[2]);K.nor.push(nx,ny,nz);K.uv.push(p[3]||0,p[4]||0);K.col.push(cc[0],cc[1],cc[2]);});
 K.tris++;BIO.tally(1,0,0);};
BIO.quad=function(fam,a,b,c,d,col){BIO.tri(fam,a,b,c,col);BIO.tri(fam,a,c,d,col);};
// TUBE along pts [{x,y,z,r,col?}], parallel-transport frames, constant texture
// repeat along the length (so a bole shows no shear bands where the radius
// changes). opt: seg, cap, rfn(i,ang,pt)->radius multiplier, vscale
BIO.tube=function(fam,pts,col,opt){opt=opt||{};const T=BIO.host.THREE,K=BIO.buckets[fam];if(!K){BIO.err('BIO.tube: no bucket '+fam);return 0;}
 const seg=opt.seg||8,sc=K.uvScale,n=pts.length;if(n<2)return 0;
 const Tn=[],N=[],Bn=[];
 for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];Tn.push(new T.Vector3(b.x-a.x,b.y-a.y,b.z-a.z).normalize());}
 const ref=Math.abs(Tn[0].y)>.9?new T.Vector3(1,0,0):new T.Vector3(0,1,0);
 N[0]=new T.Vector3().crossVectors(Tn[0],ref).normalize();Bn[0]=new T.Vector3().crossVectors(Tn[0],N[0]).normalize();
 for(let j=1;j<n;j++){const nn=N[j-1].clone().sub(Tn[j].clone().multiplyScalar(N[j-1].dot(Tn[j]))).normalize();N[j]=nn;Bn[j]=new T.Vector3().crossVectors(Tn[j],nn).normalize();}
 const rt=pts[Math.min(n-1,Math.floor(n*.3))].r||1;   // one u-repeat count for the whole tube
 const rings=[];let vAcc=0;
 for(let q=0;q<n;q++){if(q>0)vAcc+=Math.hypot(pts[q].x-pts[q-1].x,pts[q].y-pts[q-1].y,pts[q].z-pts[q-1].z);
  const ring=[];const urep=Math.max(1,Math.round(TAU*rt/sc[0]));
  for(let s=0;s<=seg;s++){const ang=s/seg*TAU,rad=pts[q].r*(opt.rfn?opt.rfn(q,ang,pts[q]):1);
   const cx=Math.cos(ang),sx=Math.sin(ang);const nx=N[q].x*cx+Bn[q].x*sx,ny=N[q].y*cx+Bn[q].y*sx,nz=N[q].z*cx+Bn[q].z*sx;
   ring.push({p:[pts[q].x+nx*rad,pts[q].y+ny*rad,pts[q].z+nz*rad],n:[nx,ny,nz],uv:[s/seg*urep,vAcc/(opt.vscale||sc[1])]});}
  rings.push(ring);}
 const pv=(v,c)=>{K.pos.push(v.p[0],v.p[1],v.p[2]);K.nor.push(v.n[0],v.n[1],v.n[2]);K.uv.push(v.uv[0],v.uv[1]);K.col.push(c[0],c[1],c[2]);};
 const cc=_col3(col);let tris=0;
 for(let r2=0;r2<n-1;r2++){const c0=pts[r2].col!=null?_col3(pts[r2].col):cc,c1=pts[r2+1].col!=null?_col3(pts[r2+1].col):cc;
  for(let s2=0;s2<seg;s2++){const a0=rings[r2][s2],a1=rings[r2][s2+1],b0=rings[r2+1][s2],b1=rings[r2+1][s2+1];
   pv(a0,c0);pv(b1,c1);pv(b0,c1);pv(a0,c0);pv(a1,c0);pv(b1,c1);tris+=2;}}
 if(opt.cap){[[0,-1],[n-1,1]].forEach(e=>{const ri2=rings[e[0]],ctr=[pts[e[0]].x,pts[e[0]].y,pts[e[0]].z];
  for(let s3=0;s3<seg;s3++){if(e[1]>0)BIO.tri(fam,ctr,ri2[s3].p,ri2[s3+1].p,opt.capCol!=null?opt.capCol:col);else BIO.tri(fam,ctr,ri2[s3+1].p,ri2[s3].p,opt.capCol!=null?opt.capCol:col);}});}
 K.tris+=tris;BIO.tally(tris,0,0);return tris;};
// LATHE from rings [{x,y,z,yy,col}], radius rad(ring,ang), ambient-occlusion aof(ring,ang);
// true surface normals so fluting and buttress fins shade
BIO.lathe=function(fam,rings,seg,rep,vs,rad,aof){const K=BIO.buckets[fam];if(!K){BIO.err('BIO.lathe: no bucket '+fam);return 0;}
 const n=rings.length,P=[];
 for(let i=0;i<n;i++){const row=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,r=rad(rings[i],a);row.push([rings[i].x+Math.cos(a)*r,rings[i].y,rings[i].z+Math.sin(a)*r]);}P.push(row);}
 const V=[];
 for(let i=0;i<n;i++){const vr=[],lc=_col3(rings[i].col);
  for(let s=0;s<=seg;s++){const s0=s%seg,pa=P[i][(s0+1)%seg],pb=P[i][(s0+seg-1)%seg],pu=P[Math.min(n-1,i+1)][s0],pd=P[Math.max(0,i-1)][s0];
   const ax=pa[0]-pb[0],ay=pa[1]-pb[1],az=pa[2]-pb[2],ux=pu[0]-pd[0],uy=pu[1]-pd[1],uz=pu[2]-pd[2];
   let nx=uy*az-uz*ay,ny=uz*ax-ux*az,nz=ux*ay-uy*ax;const nl=Math.hypot(nx,ny,nz)||1;const ao=aof?aof(rings[i],s0/seg*TAU):1;
   vr.push({p:P[i][s0],n:[nx/nl,ny/nl,nz/nl],u:s/seg*rep,v:rings[i].yy/vs,c:[lc[0]*ao,lc[1]*ao,lc[2]*ao]});}
  V.push(vr);}
 const pv=q=>{K.pos.push(q.p[0],q.p[1],q.p[2]);K.nor.push(q.n[0],q.n[1],q.n[2]);K.uv.push(q.u,q.v);K.col.push(q.c[0],q.c[1],q.c[2]);};
 let tris=0;
 for(let i=0;i<n-1;i++)for(let s=0;s<seg;s++){const a0=V[i][s],a1=V[i][s+1],b0=V[i+1][s],b1=V[i+1][s+1];pv(a0);pv(b1);pv(a1);pv(a0);pv(b0);pv(b1);tris+=2;}
 K.tris+=tris;BIO.tally(tris,0,0);return tris;};
// a parametric SURFACE fn(u,v)->[x,y,z] over nu x nv cells, smooth normals, uv scaled
BIO.surf=function(fam,fn,nu,nv,col,opt){opt=opt||{};const K=BIO.buckets[fam];if(!K){BIO.err('BIO.surf: no bucket '+fam);return 0;}
 const P=[];for(let i=0;i<=nu;i++){const row=[];for(let j=0;j<=nv;j++)row.push(fn(i/nu,j/nv));P.push(row);}
 const nrm=(i,j)=>{const a=P[Math.min(nu,i+1)][j],b=P[Math.max(0,i-1)][j],c=P[i][Math.min(nv,j+1)],d=P[i][Math.max(0,j-1)];
  const ux=a[0]-b[0],uy=a[1]-b[1],uz=a[2]-b[2],vx=c[0]-d[0],vy=c[1]-d[1],vz=c[2]-d[2];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;return[nx/l,ny/l,nz/l];};
 const cc=_col3(col),uS=opt.uS||1,vS=opt.vS||1;let tris=0;
 const pv=(i,j)=>{const p=P[i][j],n=nrm(i,j);const c=opt.colFn?_col3(opt.colFn(i/nu,j/nv,p)):cc;
  K.pos.push(p[0],p[1],p[2]);K.nor.push(n[0],n[1],n[2]);K.uv.push(i/nu*uS,j/nv*vS);K.col.push(c[0],c[1],c[2]);};
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){if(opt.hole&&opt.hole((i+.5)/nu,(j+.5)/nv))continue;
  pv(i,j);pv(i+1,j+1);pv(i+1,j);pv(i,j);pv(i,j+1);pv(i+1,j+1);tris+=2;}
 K.tris+=tris;BIO.tally(tris,0,0);return tris;};

// ---------------------------------------------------------------- indexed buckets
// The builders write every triangle's three vertices out in full, so a tube or a surface stores each of its
// grid points up to six times: bark alone was 550 of SW Lowlands' 685 MB of geometry. Bake keeps one copy of each
// distinct vertex (all eleven floats equal after the float32 rounding the GPU applies anyway) and draws by index:
// the same triangles in the same order, so the same pixels, in about a third of the memory.
function indexedGeo(T,P,N,U,C){const n=P.length/3,W=11,f=new Float32Array(n*W),w=new Uint32Array(f.buffer);
 for(let i=0;i<n;i++){const o=i*W;f[o]=P[i*3];f[o+1]=P[i*3+1];f[o+2]=P[i*3+2];f[o+3]=N[i*3];f[o+4]=N[i*3+1];f[o+5]=N[i*3+2];
  f[o+6]=U[i*2];f[o+7]=U[i*2+1];f[o+8]=C[i*3];f[o+9]=C[i*3+1];f[o+10]=C[i*3+2];}
 let cap=1024;while(cap<n*2)cap*=2;const tab=new Int32Array(cap).fill(-1),idx=new Uint32Array(n);let m=0;
 for(let i=0;i<n;i++){const o=i*W;let h=0x811C9DC5;for(let k=0;k<6;k++)h=Math.imul(h^w[o+k],0x01000193);   // position and normal: enough to spread them; a match still compares all 11
  h^=h>>>16;h=Math.imul(h,0x85EBCA6B);h^=h>>>13;let s=h&(cap-1),j;
  while((j=tab[s])>=0){const q=j*W;let k=0;while(k<W&&w[q+k]===w[o+k])k++;if(k===W)break;s=(s+1)&(cap-1);}
  if(j<0){j=m++;if(j!==i)f.copyWithin(j*W,o,o+W);tab[s]=j;}
  idx[i]=j;}
 const pos=new Float32Array(m*3),nor=new Float32Array(m*3),uv=new Float32Array(m*2),col=new Float32Array(m*3);
 for(let j=0;j<m;j++){const o=j*W;pos[j*3]=f[o];pos[j*3+1]=f[o+1];pos[j*3+2]=f[o+2];nor[j*3]=f[o+3];nor[j*3+1]=f[o+4];nor[j*3+2]=f[o+5];
  uv[j*2]=f[o+6];uv[j*2+1]=f[o+7];col[j*3]=f[o+8];col[j*3+1]=f[o+9];col[j*3+2]=f[o+10];}
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));
 g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setAttribute('color',new T.BufferAttribute(col,3));
 g.setIndex(new T.BufferAttribute(m>65535?idx:Uint16Array.from(idx),1));return g;}
BIO.indexedGeo=indexedGeo;

// ---------------------------------------------------------------- bake
// Turns the stores into meshes. Call once per host after every biome has
// built; a second call only emits what arrived since the first.
BIO.baked=[];
BIO.bake=function(){const T=BIO.host.THREE,scene=BIO.host.scene;if(!scene)throw new Error('BIO.bake: no scene (BIO.init({scene}) or BIO.setScene first)');let calls=0,inst=0;
 for(const name of BIO.order){const it=BIO.items[name];if(!it.count)continue;const def=BIO.defs[name];
  const geo=def.geo.clone();
  if(def.attrs&&it.n.length)geo.setAttribute('aN',new T.InstancedBufferAttribute(new Float32Array(it.n),3));
  if(def.attrs&&it.c2.length)geo.setAttribute('aC2',new T.InstancedBufferAttribute(new Float32Array(it.c2),3));
  const im=new T.InstancedMesh(geo,def.mat,it.count);
  im.instanceMatrix.array.set(it.m);im.instanceMatrix.needsUpdate=true;
  im.instanceColor=new T.InstancedBufferAttribute(new Float32Array(it.c),3);
  im.frustumCulled=false;im.userData.biome=true;im.userData.inspectLabel=def.label;im.name='biome:'+name;
  scene.add(im);BIO.baked.push(im);calls++;inst+=it.count;
  BIO.items[name]={m:[],c:[],n:[],c2:[],count:0};}
 for(const fam in BIO.buckets){const K=BIO.buckets[fam];if(!K.pos.length)continue;
  const g=indexedGeo(T,K.pos,K.nor,K.uv,K.col);
  g.computeBoundingSphere();
  const m=new T.Mesh(g,K.mat);m.frustumCulled=false;m.userData.biome=true;m.userData.inspectLabel=K.label;m.name='biome:'+fam;
  scene.add(m);BIO.baked.push(m);calls++;
  K.pos=[];K.nor=[];K.uv=[];K.col=[];}
 BIO.lastBake={calls,inst};return BIO.lastBake;};

Object.assign(BIO.fn,{qEuler,qFacing,qUp});
})();
