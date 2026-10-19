// ================================================================= KORONA — trees (and the kit's placement grid)
// Two tree-scale species: the COIN TREE in the summit pavement's cracks and soil pockets (and on a shoulder), a wind-pruned
// dwarf; the LACE FAN at the walls' wet feet and on the dim windward floor, a fungus-tree. Nothing roots on a rim (the
// necanyons zones' cliff rule). Beyond the LOD spine a tree is an impostor.
// PLACEMENT is by cell (core/rand: KRAND), as the necanyons kit's: every cell of a pass reseeds the kit's stream from a
// hash of (the kit's seed, the pass, the cell), never from how many draws came before.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm}=BIO.fn;const qEuler=NECANYONS.qEuler;
const SP=KORONA.SPECIES,PAL=KORONA.PAL,T3=BIO.host.THREE,C=KORONA.C,GOLD=2.399963,SEED=0x0C0A1;
const {bright,vary}=BIO.col;
KORONA.TREES=[];KORONA.qEuler=qEuler;

// ---------------------------------------------------------------- the placement grid (the necanyons zones + Korona's fields)
KORONA.place=function(cell,salt,accept,fn,opt){opt=opt||{};const R=opt.R==null?1500:opt.R,N=Math.ceil(R*2/cell),B=opt.box;let n=0;
 let i0=0,i1=N-1,j0=0,j1=N-1;if(B){i0=Math.max(0,Math.floor((B[0]+R)/cell));i1=Math.min(N-1,Math.ceil((B[2]+R)/cell));j0=Math.max(0,Math.floor((B[1]+R)/cell));j1=Math.min(N-1,Math.ceil((B[3]+R)/cell));}
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){reseed(KRAND.hash(SEED,salt,i,j));
  const x=-R+(i+rng())*cell,z=-R+(j+rng())*cell,u=rng();if(Math.hypot(x,z)>R)continue;
  if(opt.lodMax!=null&&BIO.lodD(x,z)>opt.lodMax)continue;
  const Z=NECANYONS.at(x,z),a=accept(x,z,Z);if(!(a>0)||u>a)continue;if(BIO.mask(x,z)<=0)continue;
  fn(x,BIO.terrainH(x,z),z,Z,i,j);n++;}
 return n;};
// the fields a pass reads (the host's, through the core): poor x wet x warm is THE HELL
KORONA.F=(n,x,z)=>BIO.field(n,x,z);
KORONA.hell=(x,z)=>BIO.field('poor',x,z)*BIO.field('wet',x,z)*BIO.field('warm',x,z);
// the station's say on a plant's density (the host's STAGE.bias, through BIO.host): 1 without
KORONA.bias=(k,x,z,Z)=>{const H=BIO.host.korona,b=H&&H.bias&&H.bias[k];return b==null?1:typeof b==='function'?b(x,z,Z):b;};
// the safe path (the hollow): the distance to it; 1e9 without one
KORONA.pathD=(x,z)=>{const H=BIO.host.korona,P=H&&H.path;if(!P||P.length<2)return 1e9;let m=1e9;
 for(let i=1;i<P.length;i++){const ax=P[i-1][0],az=P[i-1][1],bx=P[i][0],bz=P[i][1],dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz||1,t=clamp(((x-ax)*dx+(z-az)*dz)/L,0,1),d=Math.hypot(x-ax-dx*t,z-az-dz*t);if(d<m)m=d;}return m;};

// ---------------------------------------------------------------- keep-clear between trees (core/space)
const SPACE=KSPACE.create({cell:24});
const blocked=(x,z,pad)=>SPACE.some(x,z,pad,o=>Math.hypot(x-o.x,z-o.z)<o.r+pad);
KORONA.blocked=blocked;
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r,h});
const leafCol=(set,k)=>bright(vary(pick(set),.04,.12,.07),k==null?1.25:k);KORONA.leafCol=leafCol;
function grow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}return pts;}
KORONA.grow=grow;
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];

// ---------------------------------------------------------------- the builders: (T, st, lv) with lv 2 near, 1 mid
const B=[];
// 0 the COIN TREE: a short gnarled trunk leaning downwind, two or three crooked limbs, each ending in a cloud of coin twigs
B[0]=function(T,st,lv){const S=SP[0],bc=bright(pick(PAL.coinBark),1),lean=rr(.1,.3),la=rr(0,TAU);
 const hf=T.H*rr(.35,.5),top={x:T.x+Math.cos(la)*lean*hf,y:T.y0+hf,z:T.z+Math.sin(la)*lean*hf};
 st.trunk+=BIO.tube('bark.coin',[{x:T.x,y:T.y0-.2,z:T.z,r:T.rb},{x:(T.x+top.x)/2,y:(T.y0+top.y)/2+.1,z:(T.z+top.z)/2,r:T.rb*.85},Object.assign({},top,{r:T.rb*.6})],bc,{seg:lv===2?6:4});
 const tips=[];for(let b=0,nb=ri(2,3);b<nb;b++){const p=grow(top,dirOf(la+rr(-1.4,1.4),rr(.3,.9)),(T.H-hf)*rr(.6,1),T.rb*.55,T.rb*.2,3,-.06,.16);st.limb+=BIO.tube('bark.coin',p,bc,{seg:lv===2?4:3});tips.push(p[3],p[2]);}
 let reach=T.crownR;tips.forEach(p=>{reach=Math.max(reach,Math.hypot(p.x-T.x,p.z-T.z)+1);});
 tips.forEach((p,i)=>{const n=lv===2?ri(2,4):1,s=T.crownR*rr(.45,.7);for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.2,.6):0;
  BIO.put(rng()<.5?'coin0':'coin1',[p.x+Math.cos(a)*d,p.y-.1,p.z+Math.sin(a)*d],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[s,s*1.1,s],KORONA.libCol('coin',leafCol(S.leaf,1.15)));st.leaves++;}});
 regTree(T,S,reach,T.H+.5);};
// 1 the LACE FAN: a twisted dark bole, three to five tiers, each a ring of lace fans radiating from the bole
B[1]=function(T,st,lv){const S=SP[1],bc=bright(pick(PAL.lacefanBark),1),tw=rr(0,TAU);
 const pts=[];for(let k=0;k<=5;k++){const t=k/5,wob=.12*T.H*Math.sin(t*2.2+tw)*t;pts.push({x:T.x+Math.cos(tw+t*2)*wob,y:T.y0-.3+T.H*t*.92,z:T.z+Math.sin(tw+t*2)*wob,r:T.rb*(1.15-.7*t)});}
 st.trunk+=BIO.tube('bark.lacefan',pts,bc,{seg:lv===2?7:4,cap:true,rfn:(i,ang)=>1+.12*Math.sin(ang*3+i*1.3)});
 const nt=lv===2?ri(3,5):3;
 for(let t=0;t<nt;t++){const u=.38+.6*t/Math.max(1,nt-1),q=pts[Math.min(5,Math.floor(u*5))],y=T.y0-.3+T.H*u*.92,nf=lv===2?ri(4,7):3,a0=rr(0,TAU),sz=T.crownR*mix(1,.55,u)*rr(.8,1.1);
  for(let f=0;f<nf;f++){const a=a0+f*TAU/nf+rr(-.3,.3),el=rr(.15,.5);
   BIO.put(rng()<.5?'lacefan0':'lacefan1',[q.x+Math.cos(a)*q.r*.9,y,q.z+Math.sin(a)*q.r*.9],qEuler(-el,Math.PI/2-a,0),[sz,sz*.85,sz],KORONA.libCol('lacefan',leafCol(S.leaf,1.2)));st.leaves++;}}
 regTree(T,S,T.crownR*1.1,T.H);};
KORONA.B=B;

// ---------------------------------------------------------------- impostors (the far trees)
let ICO=null;
function buildFar(T,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;let tris=0;
 const kk=BIO._lodKey(T.x,T.z),bc=C(pick(S.barkC)).convertSRGBToLinear();
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2),sh=(.55+.45*smooth(-.7,.8,dy)),t=smooth(-.2,.7,dy),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const rings=[0,.5,1].map(u=>({x:T.x,y:T.y0+T.H*.6*u,z:T.z,yy:T.H*.6*u,r:Math.max(.15,T.rb*(1-.4*u)),col:[bc.r,bc.g,bc.b]}));
 st.far+=BIO.lathe('far',rings,4,1,1,(Rg,a)=>Rg.r,null);
 S.far.blobs.forEach((b,bi)=>blob(T.x,T.y0+T.H*b[0],T.z,T.crownR*b[1],T.H*b[2],b[3],b[4],T.seed%7+bi));
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance by zone and field)
KORONA.PASSES=[
 {sp:0,cell:7,accept:(x,z,Z)=>(Z.zone==='cap'?.3:Z.zone==='bench'?.14:0)*smooth(-6,-10,Z.d)*smooth(.25,.55,KORONA.F('rich',x,z))*(1-smooth(.3,.6,BIO.host.bogAt?BIO.host.bogAt(x,z):0))*KORONA.bias('cointree',x,z,Z),pad:1.5},
 {sp:1,cell:15,accept:(x,z,Z)=>((Z.zone==='foot'?smooth(6,14,Z.footD)*smooth(44,24,Z.footD)*.5:Z.zone==='floor'?.07:0)*smooth(.55,.85,KORONA.F('wet',x,z))*(1-.7*smooth(.5,.8,KORONA.F('poor',x,z))))*KORONA.bias('lacefan',x,z,Z),pad:3},
];
const newStats=()=>({trunk:0,limb:0,far:0,leaves:0,heroes:0,fars:0,byS:SP.map(()=>0)});
KORONA.buildTrees=function(R,q){q=q==null?1:q;R=R==null?1500:R;
 const st=newStats(),TREES=KORONA.TREES;TREES.length=0;SPACE.clear();const LOD=BIO.radii();
 KORONA.PASSES.forEach((P,pi)=>{const S=SP[P.sp];
  KORONA.place(P.cell,100+pi,(x,z,Z)=>P.accept(x,z,Z)*q,(x,y,z,Z,i,j)=>{if(blocked(x,z,P.pad)||NECANYONS.blocked(x,z,P.pad))return;
   const T={x,z,y0:y-.25,sp:P.sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:KRAND.hash(SEED,pi,i,j),Z,body:Z.B};
   const ld=BIO.lodD(x,z);T.lv=ld<LOD.hero?2:(ld<LOD.mid?1:0);
   TREES.push(T);SPACE.insert({x,z,r:T.crownR*.5+.5},x,z,T.crownR+2);},{R});});
 TREES.forEach(T=>{reseed(T.seed);if(T.lv===0){buildFar(T,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 KORONA.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),leaves:st.leaves,tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
KORONA._canopyH=function(x,z){let h=0;for(const T of KORONA.TREES){if(Math.hypot(x-T.x,z-T.z)<T.crownR+4)h=Math.max(h,T.y0+T.H);}return h||BIO.terrainH(x,z)+2;};
KORONA.nearestTree=function(sp,x,z){let b=null,bd=1e9;for(const T of KORONA.TREES){if(T.sp!==sp||T.lv<2)continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
})();
