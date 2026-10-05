// ================================================================= NORTH-WEST BAY — fauna
// The southwest bay's fauna, the bay-side kinds to start (DESIGN.md s8:
// soarers and swimmers): FLOCKS (bay soarers wheeling over the water and
// round the stacks on broad wings, canopy darters flickering round the
// crowns), PODS of swimmers cruising the deep water, and SWARMS of glinting
// insects under the jungle's flowers. Each kind is one InstancedMesh (or one
// Points) whose matrices the biome updates itself every frame through
// BIO.host.ticks; the wing-beat is done in the vertex shader from a
// per-instance phase, so a thousand animals cost one draw call apiece and a
// few hundred matrix writes a frame. Nothing here goes through BIO.bake: the
// meshes are added to the host's scene directly and charged to BIO.cur like
// everything else. Placement reads NWBAY.zones and NWBAY.TREES; a world
// binding the same fields gets the same animals in the same places.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h),zones=NWBAY.zones,PAL=NWBAY.PAL;
const Y=(x,z)=>BIO.terrainH(x,z);
NWBAY.FAUNA={species:[
 {key:'soarer',name:'Bay soarer',span:3.2,flap:1.6,speed:11,alt:[40,120],body:[0x3a2e26,0x4a3a2e],wing:[0x6a5a48,0x8a7a62],tip:0x2a2420,
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both',diet:'fish'}},
 {key:'darter',name:'Canopy darter',span:.55,flap:9,speed:14,alt:[.6,1.0],body:[0x2a6a8a,0x3a8a7a],wing:[0x4ab0c8,0x60c8b0],tip:0x1a3a4a,
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both',diet:'insects'}},
 {key:'swimmer',name:'Bay swimmer',L:9,speed:2.2,back:[0x2a3a44,0x33434c,0x1e2e38],fin:0x18242c,
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes',diet:'fish'}},
 {key:'glint',name:'Bloom glints',n:36,col:[0xffd070,0xff9a60,0xe070ff],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both',diet:'nectar'}},
]};
// LOD: a pass that animates leaves alone what is far from the viewer's eye
// (BIO.eye, an optional host hook); with no eye everything animates.
const LODR=1600;const nearEye=(x,z)=>{const e=BIO.eye();return !e||Math.hypot(x-e[0],z-e[2])<LODR;};

// ---------------------------------------------------------------- geometries (vertex-coloured, unit-sized)
// a BIRD: a slim body along -z (nose at -z), a notched tail, two wings out along +-x
// from x=+-.12 to the tip at x=+-1; the shader beats everything past |x|>.12
function birdGeo(S){const pos=[],nor=[],col=[];const b=C(pick(S.body)).convertSRGBToLinear(),w=C(pick(S.wing)).convertSRGBToLinear(),tp=C(S.tip).convertSRGBToLinear();
 const tri=(a,bq,c,cc)=>{const ux=bq[0]-a[0],uy=bq[1]-a[1],uz=bq[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;
  [a,bq,c].forEach((p,i)=>{pos.push(p[0],p[1],p[2]);nor.push(nx/l,ny/l,nz/l);const q=Array.isArray(cc)?cc[i]:cc;col.push(q.r,q.g,q.b);});};
 const N=[0,0,-.42],T=[0,.02,.30],L=[-.12,-.02,-.05],R=[.12,-.02,-.05],U=[0,.08,-.05],D=[0,-.08,-.02];
 [[N,L,U],[N,U,R],[N,R,D],[N,D,L],[T,U,L],[T,R,U],[T,D,R],[T,L,D]].forEach(t=>tri(t[0],t[1],t[2],b));
 tri([0,.02,.28],[-.14,.02,.5],[0,.02,.4],b);tri([0,.02,.28],[0,.02,.4],[.14,.02,.5],b);
 for(let s=-1;s<=1;s+=2){const x0=s*.12,x1=s*.55,x2=s*1.0;
  const a=[x0,0,-.16],bq=[x0,0,.14],c=[x1,.02,.10],d=[x1,.02,-.20],e=[x2,.05,-.02],f=[x2,.05,-.14];
  if(s>0){tri(a,bq,c,w);tri(a,c,d,w);tri(d,c,e,[w,w,tp]);tri(d,e,f,[w,tp,tp]);}
  else{tri(a,c,bq,w);tri(a,d,c,w);tri(d,e,c,[w,tp,w]);tri(d,f,e,[w,tp,tp]);}}
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);}
// a SWIMMER: the back of something big breaking the surface -- a low hump along z (nose at -z), a dorsal fin
function swimmerGeo(S){const pos=[],nor=[],col=[];const b=C(pick(S.back)).convertSRGBToLinear(),f=C(S.fin).convertSRGBToLinear();
 const g=new T3.SphereGeometry(.5,10,6,0,TAU,0,Math.PI*.42).scale(.5,.55,1).toNonIndexed();const a=g.attributes.position.array,n=g.attributes.normal.array;
 for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1]-.12,a[i+2]);nor.push(n[i],n[i+1],n[i+2]);const sh=.8+.2*Math.max(0,n[i+1]);col.push(b.r*sh,b.g*sh,b.b*sh);}
 [[0,.12,.1],[0,.42,-.02],[0,.12,-.16]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(1,0,0);col.push(f.r,f.g,f.b);});
 [[0,.12,-.16],[0,.42,-.02],[0,.12,.1]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(-1,0,0);col.push(f.r,f.g,f.b);});
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);}

// ---------------------------------------------------------------- the animated materials
// A per-instance phase (aPh) drives a wing-beat or a bob in the vertex
// shader; uT is the biome's own clock (BIO.WIND.t, ticked by the core).
function animMat(kind){const m=new T3.MeshLambertMaterial({vertexColors:true,side:T3.DoubleSide});
 m.onBeforeCompile=sh=>{sh.uniforms.uT=BIO.WIND.t;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;\nattribute float aPh;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\n'+(kind==='bird'?
    ['{float w=abs(position.x)-0.12; if(w>0.0){float fl=sin(uT*aPh+aPh*7.0)*0.75; transformed.y+=w*sin(fl)*0.9; transformed.x=sign(position.x)*(0.12+w*cos(fl));}',
     ' transformed.y+=0.03*sin(uT*aPh*0.5+aPh);}'].join('\n'):
    ['{float bob=sin(uT*aPh+aPh*5.0); transformed.y+=bob*0.16-0.06; transformed.y+=position.z*sin(uT*aPh*0.9+aPh)*0.12;}'].join('\n')));};
 m.customProgramCacheKey=function(){return'biofauna|'+kind;};BIO._tickWind();return m;}

// ---------------------------------------------------------------- the pass
NWBAY.buildFauna=function(R,q){reseed(750021);q=q==null?1:q;R=R||2400;
 const scene=BIO.host.scene,st={flocks:0,birds:0,pods:0,swimmers:0,swarms:0,glints:0};
 const spineOK=(x,z,d)=>BIO.lodD(x,z)<d;
 // ---- flocks: one InstancedMesh per species; each flock a loop over its ground with the birds trailing the leader
 function flockMesh(si,flocks,perFlock){const S=NWBAY.FAUNA.species[si],geo=birdGeo(S),n=flocks.length*perFlock;
  const ph=new Float32Array(n);for(let i=0;i<n;i++)ph[i]=S.flap*rr(.85,1.15);geo.setAttribute('aPh',new T3.InstancedBufferAttribute(ph,1));
  const im=new T3.InstancedMesh(geo,animMat('bird'),n);im.frustumCulled=false;im.userData.biome=true;im.userData.inspectLabel=S.name+'s';im.name='biome:fauna:'+S.key;
  const M=new T3.Matrix4(),P=new T3.Vector3(),Q=new T3.Quaternion(),Sc=new T3.Vector3(),F=new T3.Vector3(),UP=new T3.Vector3(0,1,0),Mlook=new T3.Matrix4();
  const birds=[];flocks.forEach((fl,fi)=>{for(let k=0;k<perFlock;k++)birds.push({fl:fl,lag:k*rr(.9,1.6),side:rr(-1,1)*fl.r*.35,dy:rr(-1,1)*fl.r*.12,sc:S.span*rr(.85,1.15)});});
  const at=(fl,t)=>{const a=fl.a0+fl.w*t;return[fl.x+Math.cos(a)*fl.r+Math.sin(a*2.3)*fl.r*.15,fl.y+Math.sin(a*1.7+fl.a0)*fl.dy,fl.z+Math.sin(a)*fl.r*fl.e];};
  const upd=t=>{birds.forEach((b,i)=>{if(!nearEye(b.fl.x,b.fl.z))return;const p=at(b.fl,t-b.lag),p2=at(b.fl,t-b.lag+.15);
    const a=b.fl.a0+b.fl.w*(t-b.lag),nx=-Math.sin(a)*b.side,nz=Math.cos(a)*b.side*b.fl.e;   // spread across the loop
    P.set(p[0]+nx,p[1]+b.dy,p[2]+nz);F.set(p2[0]-p[0],p2[1]-p[1],p2[2]-p[2]).normalize();
    Mlook.lookAt(F,new T3.Vector3(0,0,0),UP);Q.setFromRotationMatrix(Mlook);Q.multiply(new T3.Quaternion().setFromAxisAngle(UP,Math.PI));   // the model's nose is -z
    Sc.set(b.sc,b.sc,b.sc);M.compose(P,Q,Sc);im.setMatrixAt(i,M);});im.instanceMatrix.needsUpdate=true;};
  upd(0);scene.add(im);BIO.host.ticks((dt,t)=>upd(t));BIO.tally(geo.attributes.position.count/3*n,n,1);st.flocks+=flocks.length;st.birds+=n;return im;}
 // the soarers: loops over the bay and the shore, high, slow; the loops stay clear of the
 // canopy under them, of the karst (terrainH is the stack top there) and of anything the host registered
 const soar=[];BIO.grid(300,0,R,(x,z)=>{const Z=zones(x,z);const water=smooth(.5,-1.5,Z.h);return (water*.9+Z.shore*.5)*(spineOK(x,z,1400)?1:0)*q;},(x,y,z)=>{
  const r=rr(90,220),fl={x:x,z:z,y:rr(NWBAY.FAUNA.species[0].alt[0],NWBAY.FAUNA.species[0].alt[1]),r:r,e:rr(.5,1),a0:rr(0,TAU),w:(rng()<.5?1:-1)*NWBAY.FAUNA.species[0].speed/r*.9,dy:rr(4,14)};
  let floor=0;for(let k=0;k<16;k++){const a=k/16*TAU,px=x+Math.cos(a)*r*1.3,pz=z+Math.sin(a)*r*fl.e*1.3;floor=Math.max(floor,NWBAY.canopyH(px,pz)+16,Y(px,pz)+30);
   BIO.host.obstacles.forEach(o=>{if(Math.hypot(px-o.x,pz-o.z)<o.r+40)floor=Math.max(floor,(o.y1||0)+14);});}
  fl.y=Math.max(fl.y,floor+fl.dy);soar.push(fl);},{patch:0,noMask:true});
 if(soar.length)flockMesh(0,soar.slice(0,12),ri(7,12));
 // the darters: tight loops round the crowns of the jungle canopy
 const dart=[],cand=NWBAY.TREES.filter(T=>(T.sp===0||T.sp===2||T.sp===3||T.sp===8)&&T.lv===2);
 for(let i=0;i<cand.length&&dart.length<14;i+=Math.max(1,Math.floor(cand.length/14))){const T=cand[i];
  const oa=rr(0,TAU),od=T.crownR*.55,rd=T.crownR*rr(.35,.5);   // the loop beside the bole, its inner edge just clear of it
  dart.push({x:T.x+Math.cos(oa)*od,z:T.z+Math.sin(oa)*od,y:T.y0+T.H*rr(.55,.95),r:rd,e:rr(.7,1),a0:rr(0,TAU),w:(rng()<.5?1:-1)*NWBAY.FAUNA.species[1].speed/(rd*1.1),dy:rr(2,8)});}
 if(dart.length)flockMesh(1,dart,ri(8,16));
 // ---- the swimmers: pods of something big cruising the deep water in slow arcs, backs and fins breaking the surface
 (function(){const S=NWBAY.FAUNA.species[2],pods=[];
  BIO.grid(260,0,R,(x,z)=>{const h=Y(x,z);return (h<-5?1:0)*(spineOK(x,z,1500)?1:0)*q;},(x,y,z)=>{let r=rr(60,160);
   for(let k=0;k<12&&r>25;k++){let ok=true;for(let a=0;a<TAU;a+=TAU/10)if(Y(x+Math.cos(a)*r,z+Math.sin(a)*r*.7)>-2.5){ok=false;break;}if(ok)break;r*=.8;}
   if(r>25)pods.push({x:x,z:z,y:0,r:r,e:.7,a0:rr(0,TAU),w:(rng()<.5?1:-1)*S.speed/r,dy:0,n:ri(3,6)});},{patch:0,noMask:true});
  if(!pods.length)return;const P4=pods.slice(0,4),n=P4.reduce((a,p)=>a+p.n,0),geo=swimmerGeo(S);NWBAY.FAUNA.pods=P4;
  const ph=new Float32Array(n);for(let i=0;i<n;i++)ph[i]=rr(.8,1.3);geo.setAttribute('aPh',new T3.InstancedBufferAttribute(ph,1));
  const im=new T3.InstancedMesh(geo,animMat('swim'),n);im.frustumCulled=false;im.userData.biome=true;im.userData.inspectLabel=S.name+' pod';im.name='biome:fauna:swimmers';
  const an=[];P4.forEach(p=>{for(let k=0;k<p.n;k++)an.push({p:p,lag:k*rr(3,5),side:rr(-1,1)*p.r*.2,sc:S.L*rr(.8,1.15)});});
  const M=new T3.Matrix4(),P=new T3.Vector3(),Q=new T3.Quaternion(),Sc=new T3.Vector3(),UP=new T3.Vector3(0,1,0),F=new T3.Vector3(),Ml=new T3.Matrix4();
  const at=(p,t)=>{const a=p.a0+p.w*t;return[p.x+Math.cos(a)*p.r,0,p.z+Math.sin(a)*p.r*p.e,a];};
  const upd=(dt,t)=>{an.forEach((b,i)=>{if(!nearEye(b.p.x,b.p.z))return;const s=at(b.p,t-b.lag),s2=at(b.p,t-b.lag+.5),a=s[3];
    P.set(s[0]-Math.sin(a)*b.side,0,s[2]+Math.cos(a)*b.side*b.p.e);F.set(s2[0]-s[0],0,s2[2]-s[2]).normalize();Ml.lookAt(F,new T3.Vector3(0,0,0),UP);Q.setFromRotationMatrix(Ml);Q.multiply(new T3.Quaternion().setFromAxisAngle(UP,Math.PI));
    Sc.set(b.sc,b.sc,b.sc);M.compose(P,Q,Sc);im.setMatrixAt(i,M);});im.instanceMatrix.needsUpdate=true;};
  upd(0,0);scene.add(im);BIO.host.ticks(upd);BIO.tally(geo.attributes.position.count/3*n,n,1);st.pods=P4.length;st.swimmers=n;})();
 // ---- the swarms: Points glinting round the epiphyte-laden crowns, drifting on little orbits
 (function(){const S=NWBAY.FAUNA.species[3],cand=NWBAY.TREES.filter(T=>(T.sp===2||T.sp===0||T.sp===8||T.sp===9)&&T.lv===2&&BIO.lodD(T.x,T.z)<700);
  const sw=[];for(let i=0;i<cand.length&&sw.length<40;i+=Math.max(1,Math.floor(cand.length/40))){const T=cand[i];sw.push({x:T.x+rr(-6,6),y:T.y0+T.H*rr(.25,.7),z:T.z+rr(-6,6),r:rr(2,5)});}
  if(!sw.length)return;const n=sw.length*S.n,pos=new Float32Array(n*3),col=new Float32Array(n*3),c=new T3.Color(),seeds=[];
  for(let i=0;i<n;i++){c.set(pick(S.col)).convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;seeds.push([rr(0,TAU),rr(0,TAU),rr(.6,1.4),rr(.3,1)]);}
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(pos,3));g.setAttribute('color',new T3.BufferAttribute(col,3));
  const pm=new T3.PointsMaterial({size:.28,sizeAttenuation:true,vertexColors:true,transparent:true,opacity:.9,depthWrite:false});
  const pts=new T3.Points(g,pm);pts.frustumCulled=false;pts.userData.biome=true;pts.userData.probeSkip=true;pts.userData.inspectLabel=S.name;pts.name='biome:fauna:glints';
  const upd=(dt,t)=>{for(let i=0;i<n;i++){const w=sw[Math.floor(i/S.n)];if(i%S.n===0&&!nearEye(w.x,w.z)){i+=S.n-1;continue;}const s=seeds[i],a=s[0]+t*s[2],b=s[1]+t*s[3]*.7;
    pos[i*3]=w.x+Math.cos(a)*w.r*s[3];pos[i*3+1]=w.y+Math.sin(b)*w.r*.5;pos[i*3+2]=w.z+Math.sin(a)*w.r*s[3];}g.attributes.position.needsUpdate=true;};
  upd(0,0);scene.add(pts);BIO.host.ticks(upd);BIO.tally(0,n,1);st.swarms=sw.length;st.glints=n;})();
 return{fauna:st};};
})();
