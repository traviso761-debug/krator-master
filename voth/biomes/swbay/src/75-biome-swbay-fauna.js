// ================================================================= SOUTHWEST BAY — fauna
// The first fauna on the biome-core contract. Three kinds, all cheap, all
// alive: FLOCKS (bay soarers wheeling over the water on broad wings, canopy
// darters flickering round the crowns), one HERD of grazers wandering the
// savannah, and SWARMS of glinting insects under the jungle's flowers.
// Each kind is one InstancedMesh (or one Points) whose matrices the biome
// updates itself every frame through BIO.host.ticks; the wing-beat and the
// leg-swing are done in the vertex shader from a per-instance phase, so a
// thousand animals cost one draw call apiece and a few hundred matrix
// writes a frame. Nothing here goes through BIO.bake: the meshes are added
// to the host's scene directly and charged to BIO.cur like everything else.
// Placement reads SWBAY.zones and SWBAY.TREES; a world binding the same
// fields gets the same animals in the same places.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h),zones=SWBAY.zones,PAL=SWBAY.PAL;
const Y=(x,z)=>BIO.terrainH(x,z);
SWBAY.FAUNA={species:[
 {key:'soarer',name:'Bay soarer',span:3.2,flap:1.6,speed:11,alt:[40,120],body:[0x3a2e26,0x4a3a2e],wing:[0x6a5a48,0x8a7a62],tip:0x2a2420,
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both',diet:'fish'}},
 {key:'darter',name:'Canopy darter',span:.55,flap:9,speed:14,alt:[.6,1.0],body:[0x2a6a8a,0x3a8a7a],wing:[0x4ab0c8,0x60c8b0],tip:0x1a3a4a,
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both',diet:'insects'}},
 {key:'grazer',name:'Plains grazer',H:1.9,L:3.2,speed:.9,hide:[0x8a7048,0x9a8058,0x7a6440],belly:0xc8b898,
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no',diet:'grass'}},
 {key:'glint',name:'Bloom glints',n:36,col:[0xffd070,0xff9a60,0xe070ff],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both',diet:'nectar'}},
 {key:'stalker',name:'Savannah stalker',H:1.6,L:3.8,speed:.9,hide:[0x4a3a30,0x3e3028,0x56463a],belly:0x8a7a68,
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no',diet:'grazers'}},
 {key:'swimmer',name:'Bay swimmer',L:9,speed:2.2,back:[0x2a3a44,0x33434c,0x1e2e38],fin:0x18242c,
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes',diet:'fish'}},
 {key:'glider',name:'Savannah glider',span:6.5,flap:.35,speed:9,alt:[130,230],body:[0x5a4a3a,0x6a5a48],wing:[0x9a8a70,0xb0a088],tip:0x3a2e24,
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no',diet:'carrion'}},
 {key:'capmoth',name:'Cap moth',span:.45,flap:14,speed:5,alt:[0,0],body:[0xd8c8a0,0xc8b890],wing:[0xe8dcc0,0xf0e0c8],tip:0xb08a60,
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both',diet:'spores'}},
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
 // body: a flattened diamond, nose to tail
 const N=[0,0,-.42],T=[0,.02,.30],L=[-.12,-.02,-.05],R=[.12,-.02,-.05],U=[0,.08,-.05],D=[0,-.08,-.02];
 [[N,L,U],[N,U,R],[N,R,D],[N,D,L],[T,U,L],[T,R,U],[T,D,R],[T,L,D]].forEach(t=>tri(t[0],t[1],t[2],b));
 // tail fork
 tri([0,.02,.28],[-.14,.02,.5],[0,.02,.4],b);tri([0,.02,.28],[0,.02,.4],[.14,.02,.5],b);
 // wings: two quads each side (inner broad, outer tapering), tips darker
 for(let s=-1;s<=1;s+=2){const x0=s*.12,x1=s*.55,x2=s*1.0;
  const a=[x0,0,-.16],bq=[x0,0,.14],c=[x1,.02,.10],d=[x1,.02,-.20],e=[x2,.05,-.02],f=[x2,.05,-.14];
  if(s>0){tri(a,bq,c,w);tri(a,c,d,w);tri(d,c,e,[w,w,tp]);tri(d,e,f,[w,tp,tp]);}
  else{tri(a,c,bq,w);tri(a,d,c,w);tri(d,e,c,[w,tp,w]);tri(d,f,e,[w,tp,tp]);}}
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);}
// a GRAZER: a barrel body along z (head at -z), a neck and head, four legs; unit
// height 1 at the shoulder, length ~1.7; the legs are everything under y=.5
function grazerGeo(S){const parts=[],hide=C(pick(S.hide)).convertSRGBToLinear(),belly=C(S.belly).convertSRGBToLinear(),dark=hide.clone().multiplyScalar(.6);
 const box=(x,y,z,w,h,d,c,c2)=>{const g=new T3.BoxGeometry(w,h,d).translate(x,y,z).toNonIndexed();const a=g.attributes.position.array,n=g.attributes.normal.array;
  for(let i=0;i<a.length;i+=3){parts.push([a[i],a[i+1],a[i+2],n[i],n[i+1],n[i+2],(c2&&a[i+1]<y-h*.25)?c2:c]);}};
 box(0,.72,.05,.46,.44,1.1,hide,belly);                       // barrel
 box(0,.95,-.62,.22,.36,.34,hide);                            // neck
 box(0,1.12,-.86,.2,.2,.42,hide,dark);                        // head
 box(0,.75,.62,.12,.12,.28,dark);                             // tail
 [[-.16,-.4],[.16,-.4],[-.16,.4],[.16,.4]].forEach(p=>box(p[0],.26,p[1],.12,.52,.14,hide,dark));   // legs
 const pos=[],nor=[],col=[];parts.forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(p[3],p[4],p[5]);col.push(p[6].r,p[6].g,p[6].b);});
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);}

// a SWIMMER: the back of something big breaking the surface -- a low hump along z (nose at -z), a dorsal fin
function swimmerGeo(S){const pos=[],nor=[],col=[];const b=C(pick(S.back)).convertSRGBToLinear(),f=C(S.fin).convertSRGBToLinear();
 const g=new T3.SphereGeometry(.5,10,6,0,TAU,0,Math.PI*.42).scale(.5,.55,1).toNonIndexed();const a=g.attributes.position.array,n=g.attributes.normal.array;
 for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1]-.12,a[i+2]);nor.push(n[i],n[i+1],n[i+2]);const sh=.8+.2*Math.max(0,n[i+1]);col.push(b.r*sh,b.g*sh,b.b*sh);}
 [[0,.12,.1],[0,.42,-.02],[0,.12,-.16]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(1,0,0);col.push(f.r,f.g,f.b);});
 [[0,.12,-.16],[0,.42,-.02],[0,.12,.1]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(-1,0,0);col.push(f.r,f.g,f.b);});
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);}

// ---------------------------------------------------------------- the animated materials
// A per-instance phase (aPh) drives a wing-beat or a leg-swing in the vertex
// shader; uT is the biome's own clock (BIO.WIND.t, ticked by the core).
function animMat(kind){const m=new T3.MeshLambertMaterial({vertexColors:true,side:T3.DoubleSide});
 m.onBeforeCompile=sh=>{sh.uniforms.uT=BIO.WIND.t;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;\nattribute float aPh;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\n'+(kind==='bird'?
    ['{float w=abs(position.x)-0.12; if(w>0.0){float fl=sin(uT*aPh+aPh*7.0)*0.75; transformed.y+=w*sin(fl)*0.9; transformed.x=sign(position.x)*(0.12+w*cos(fl));}',
     ' transformed.y+=0.03*sin(uT*aPh*0.5+aPh);}'].join('\n'):
    kind==='swim'?['{float bob=sin(uT*aPh+aPh*5.0); transformed.y+=bob*0.16-0.06; transformed.y+=position.z*sin(uT*aPh*0.9+aPh)*0.12;}'].join('\n'):
    ['{if(position.y<0.5){float side=sign(position.x)*sign(position.z); float sw=sin(uT*aPh+aPh*3.0+(side>0.0?0.0:3.14159))*0.55;',
     ' transformed.z+=(0.5-position.y)*sw;} transformed.y+=0.02*sin(uT*aPh*2.0+aPh);}'].join('\n')));};
 m.customProgramCacheKey=function(){return'biofauna|'+kind;};BIO._tickWind();return m;}

// ---------------------------------------------------------------- the pass
SWBAY.buildFauna=function(R,q){reseed(750021);q=q==null?1:q;R=R||2400;
 const scene=BIO.host.scene,st={flocks:0,birds:0,herds:0,grazers:0,stalkers:0,pods:0,swimmers:0,swarms:0,glints:0};const out=[];
 const spineOK=(x,z,d)=>BIO.lodD(x,z)<d;
 // ---- flocks: one InstancedMesh per species; each flock a loop over its ground with the birds trailing the leader
 function flockMesh(si,flocks,perFlock){const S=SWBAY.FAUNA.species[si],geo=birdGeo(S),n=flocks.length*perFlock;
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
 // the soarers: loops over the bay and the shore, high, slow
 const soar=[];BIO.grid(320,0,R,(x,z)=>{const Z=zones(x,z);const water=smooth(.5,-1.5,Z.h);return (water*.9+Z.shore*.5)*(spineOK(x,z,1400)?1:0)*q;},(x,y,z)=>{
  const r=rr(90,220),fl={x:x,z:z,y:rr(SWBAY.FAUNA.species[0].alt[0],SWBAY.FAUNA.species[0].alt[1]),r:r,e:rr(.5,1),a0:rr(0,TAU),w:(rng()<.5?1:-1)*SWBAY.FAUNA.species[0].speed/r*.9,dy:rr(4,14)};
  // the loop stays clear of the canopy under it and of anything the host registered (the tower)
  let floor=0;for(let k=0;k<16;k++){const a=k/16*TAU,px=x+Math.cos(a)*r*1.3,pz=z+Math.sin(a)*r*fl.e*1.3;floor=Math.max(floor,SWBAY.canopyH(px,pz)+16);
   BIO.host.obstacles.forEach(o=>{if(Math.hypot(px-o.x,pz-o.z)<o.r+40)floor=Math.max(floor,(o.y1||0)+14);});}
  fl.y=Math.max(fl.y,floor+fl.dy);soar.push(fl);},{patch:0,noMask:true});
 if(soar.length)flockMesh(0,soar.slice(0,10),ri(7,12));
 // the darters: tight loops round the crowns of the jungle canopy
 const dart=[],cand=SWBAY.TREES.filter(T=>(T.sp===0||T.sp===3||T.sp===9)&&T.lv===2);
 for(let i=0;i<cand.length&&dart.length<14;i+=Math.max(1,Math.floor(cand.length/14))){const T=cand[i];
  const oa=rr(0,TAU),od=T.crownR*.55,rd=T.crownR*rr(.35,.5);   // the loop beside the bole, its inner edge just clear of it
  dart.push({x:T.x+Math.cos(oa)*od,z:T.z+Math.sin(oa)*od,y:T.y0+T.H*rr(.55,.95),r:rd,e:rr(.7,1),a0:rr(0,TAU),w:(rng()<.5?1:-1)*SWBAY.FAUNA.species[1].speed/(rd*1.1),dy:rr(2,8)});}
 if(dart.length)flockMesh(1,dart,ri(8,16));
 // the gliders: wide slow circles in the thermals over the savannah, barely a wingbeat
 const glide=[];BIO.grid(420,0,R,(x,z)=>zones(x,z).sav*(spineOK(x,z,1500)?1:0)*q,(x,y,z)=>{const r=rr(150,300);
  glide.push({x:x,z:z,y:y+rr(SWBAY.FAUNA.species[6].alt[0],SWBAY.FAUNA.species[6].alt[1]),r:r,e:rr(.7,1),a0:rr(0,TAU),w:(rng()<.5?1:-1)*SWBAY.FAUNA.species[6].speed/r,dy:rr(6,18)});},{patch:0});
 if(glide.length)flockMesh(6,glide.slice(0,6),ri(2,5));
 // the cap moths: tight clouds under the caps of the cap-trees, where the spores fall
 const moth=[],caps=SWBAY.TREES.filter(T=>T.sp===2&&T.lv===2&&BIO.lodD(T.x,T.z)<800);
 for(let i=0;i<caps.length&&moth.length<16;i+=Math.max(1,Math.floor(caps.length/16))){const T=caps[i];
  moth.push({x:T.x,z:T.z,y:T.y0+T.H*.78-4,r:T.crownR*rr(.35,.6),e:rr(.8,1),a0:rr(0,TAU),w:(rng()<.5?1:-1)*SWBAY.FAUNA.species[7].speed/(T.crownR*.5),dy:rr(1,2.5)});}
 if(moth.length)flockMesh(7,moth,ri(10,18));
 // ---- the herd: one InstancedMesh, a centre wandering the savannah, the animals in a loose ring, heads down
 (function(){const S=SWBAY.FAUNA.species[2],geo=grazerGeo(S);let cx=0,cz=0,best=-1;
  BIO.grid(160,0,R,(x,z)=>zones(x,z).sav*(spineOK(x,z,900)?1:0)*q,(x,y,z)=>{const s=zones(x,z).sav-BIO.lodD(x,z)/4000;if(s>best){best=s;cx=x;cz=z;}},{patch:0});
  if(best<0)return;const n=Math.round(rr(14,24)*Math.max(.5,q));SWBAY.FAUNA.herd={x:cx,z:cz};
  const ph=new Float32Array(n);for(let i=0;i<n;i++)ph[i]=rr(4,6);geo.setAttribute('aPh',new T3.InstancedBufferAttribute(ph,1));
  const im=new T3.InstancedMesh(geo,animMat('grazer'),n);im.frustumCulled=false;im.userData.biome=true;im.userData.inspectLabel=S.name+' herd';im.name='biome:fauna:herd';
  const an=[];for(let i=0;i<n;i++)an.push({ox:rr(-1,1)*26,oz:rr(-1,1)*26,sc:S.H*rr(.8,1.1),ph:rr(0,TAU)});
  const M=new T3.Matrix4(),P=new T3.Vector3(),Q=new T3.Quaternion(),Sc=new T3.Vector3(),UP=new T3.Vector3(0,1,0);let hx=cx,hz=cz,ha=rr(0,TAU);
  // the stalker: one or two, trailing the herd ninety metres back, longer and lower than a grazer
  const stalk=(function(){const SS=SWBAY.FAUNA.species[4],ns=ri(1,2),sg=grazerGeo(SS),sph=new Float32Array(ns);for(let i=0;i<ns;i++)sph[i]=rr(3,4);sg.setAttribute('aPh',new T3.InstancedBufferAttribute(sph,1));
   const sim=new T3.InstancedMesh(sg,animMat('grazer'),ns);sim.frustumCulled=false;sim.userData.biome=true;sim.userData.inspectLabel=SS.name;sim.name='biome:fauna:stalker';
   const an2=[];for(let i=0;i<ns;i++)an2.push({ox:rr(-1,1)*12,oz:rr(-1,1)*12,sc:SS.H});scene.add(sim);BIO.tally(sg.attributes.position.count/3*ns,ns,1);st.stalkers=ns;return{im:sim,an:an2};})();
  const upd=(dt,t)=>{if(!nearEye(hx,hz))return;ha+=(fbm(t*.05,3,808,2)-.5)*dt*.8;const sp=S.speed;let nx=hx+Math.cos(ha)*sp*dt,nz=hz+Math.sin(ha)*sp*dt;
   if(zones(nx,nz).sav<.4||BIO.lodD(nx,nz)>1100||!BIO.clearOf(nx,nz,30)||(SWBAY.blocked&&SWBAY.blocked(nx+Math.cos(ha)*24,nz+Math.sin(ha)*24,6))){ha+=Math.PI*.6;nx=hx;nz=hz;}hx=nx;hz=nz;
   if(stalk){const sx=hx-Math.cos(ha)*95+Math.cos(t*.11)*20,sz=hz-Math.sin(ha)*95+Math.sin(t*.13)*20;
    stalk.an.forEach((a,i)=>{const x=sx+a.ox,z=sz+a.oz;P.set(x,Math.max(Y(x,z),.2),z);Q.setFromAxisAngle(UP,-ha+Math.PI/2);Sc.set(a.sc,a.sc*.85,a.sc*1.25);M.compose(P,Q,Sc);stalk.im.setMatrixAt(i,M);});stalk.im.instanceMatrix.needsUpdate=true;}
   an.forEach((a,i)=>{const wob=Math.sin(t*.3+a.ph)*3,x=hx+a.ox+wob,z=hz+a.oz+Math.cos(t*.27+a.ph)*3,y=Y(x,z);
    P.set(x,Math.max(y,.2),z);Q.setFromAxisAngle(UP,-ha+Math.PI/2+Math.sin(t*.5+a.ph)*.3);Sc.set(a.sc,a.sc,a.sc);M.compose(P,Q,Sc);im.setMatrixAt(i,M);});im.instanceMatrix.needsUpdate=true;};
  upd(0,0);scene.add(im);BIO.host.ticks(upd);BIO.tally(geo.attributes.position.count/3*n,n,1);st.herds++;st.grazers+=n;
  if(typeof REGISTER==='function')REGISTER({name:S.name+' herd (wanders)',kind:'fauna',label:S.name,x:cx,z:cz,y:Y(cx,cz),r:60,h:6});})();
 // ---- the swimmers: pods of something big cruising the deep water in slow arcs, backs and fins breaking the surface
 (function(){const S=SWBAY.FAUNA.species[5],pods=[];
  BIO.grid(260,0,R,(x,z)=>{const h=Y(x,z);return (h<-5?1:0)*(spineOK(x,z,1500)?1:0)*q;},(x,y,z)=>{let r=rr(60,160);
   for(let k=0;k<12&&r>25;k++){let ok=true;for(let a=0;a<TAU;a+=TAU/10)if(Y(x+Math.cos(a)*r,z+Math.sin(a)*r*.7)>-2.5){ok=false;break;}if(ok)break;r*=.8;}
   if(r>25)pods.push({x:x,z:z,y:0,r:r,e:.7,a0:rr(0,TAU),w:(rng()<.5?1:-1)*S.speed/r,dy:0,n:ri(3,6)});},{patch:0,noMask:true});
  if(!pods.length)return;const P4=pods.slice(0,4),n=P4.reduce((a,p)=>a+p.n,0),geo=swimmerGeo(S);SWBAY.FAUNA.pods=P4;
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
 (function(){const S=SWBAY.FAUNA.species[3],cand=SWBAY.TREES.filter(T=>(T.sp===3||T.sp===0||T.sp===2)&&T.lv===2&&BIO.lodD(T.x,T.z)<700);
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
