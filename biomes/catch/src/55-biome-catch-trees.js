// ================================================================= THE CATCH — trees: the tugai (Euphrates poplar) and the salt cedar
// Placed on a grid seeded per cell (CATCH.place: KRAND.hash(seed, salt, i, j)), accepted by the host's fields through the
// core (BIO.field): `wet` is the water table here (1 at a spring's pool, ~.6 where a poplar's roots reach it, ~.4 on a dead
// channel whose water fell). A poplar lives over .5, dies standing between .3 and .5 (a snag, the tugai's grey dead);
// gold where the water is just short (.5 to .62). The salt cedars stand on the host's NEBKHAS (BIO.host.catch.nebkhas:
// the sand cones they built, part of the land) and at the springs' fringe. Beyond the mid radius a tree is an impostor.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler}=BIO.fn;
const SP=CATCH.SPECIES,PAL=CATCH.PAL,C=CATCH.C,T3=BIO.host.THREE,SEED=CATCH.SEED;
const {bright,vary}=BIO.col;
CATCH.TREES=[];
const F=(n,x,z)=>BIO.field(n,x,z);CATCH.F=F;
// the station's say on a species' density (BIO.host.catch.bias: a number or (x,z)=>number), 1 without
CATCH.bias=(k,x,z)=>{const H=BIO.host.catch,b=H&&H.bias&&H.bias[k];return b==null?1:typeof b==='function'?b(x,z):b;};
// THE GRID: one candidate per cell, its draws from a stream seeded by the cell (a tile built alone draws what it draws here)
CATCH.place=function(cell,salt,accept,fn,opt){opt=opt||{};const R=opt.R==null?3000:opt.R,N=Math.ceil(R*2/cell),B=opt.box;let n=0;
 let i0=0,i1=N-1,j0=0,j1=N-1;if(B){i0=Math.max(0,Math.floor((B[0]+R)/cell));i1=Math.min(N-1,Math.ceil((B[2]+R)/cell));j0=Math.max(0,Math.floor((B[1]+R)/cell));j1=Math.min(N-1,Math.ceil((B[3]+R)/cell));}
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){reseed(KRAND.hash(SEED,salt,i,j));
  const x=-R+(i+rng())*cell,z=-R+(j+rng())*cell,u=rng();if(Math.hypot(x,z)>R)continue;
  if(opt.lodMax!=null&&BIO.lodD(x,z)>opt.lodMax)continue;
  const a=accept(x,z);if(!(a>0)||u>a)continue;if(!opt.noMask&&BIO.mask(x,z)<=0)continue;
  fn(x,BIO.terrainH(x,z),z,i,j);n++;}
 return n;};

// ---------------------------------------------------------------- keep-clear between trees (core/space)
const SPACE=KSPACE.create({cell:24});
const blocked=(x,z,pad)=>SPACE.some(x,z,pad,o=>Math.hypot(x-o.x,z-o.z)<o.r+pad)||!BIO.clearOf(x,z,pad);
CATCH.blocked=blocked;CATCH.SPACE=SPACE;
let BAKING=false;   /* an impostor's bake builds a tree again: it registers nothing */
const regTree=(T,S,r,h,name)=>{if(!BAKING)BIO.register({name:name||S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r,h});};
// A LIMB'S JOINT (core/biome 31j, BIO.flareJoin; the final rebuild, pair 11, 2026-11-09): a limb's root sunk into its parent and swollen to a
// collar, not two pipes pushed together. Positions only, no draw from the stream: every tree keeps its form. ?flare=0 the old seams
const FLARE=typeof BIO.flareJoin==='function'&&!(typeof location!=='undefined'&&/[?&]flare=0/.test(location.search));
const J=(pts,parentR)=>FLARE&&pts.length>1?BIO.flareJoin(pts,{parentR}):pts;
const leafCol=(set,k)=>bright(vary(pick(set),.04,.12,.07),k==null?1.2:k);
function grow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}return pts;}
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
const knob=(i,ang)=>1+.16*Math.sin(ang*3+i*1.7)+.08*Math.sin(ang*7+i);

// ---------------------------------------------------------------- the builders: (T, st, lv) with lv 2 near, 1 mid
const B=[];
// 0 THE EUPHRATES POPLAR: a short, thick, leaning bole that forks low into three to five crooked limbs, each forking again,
// the twig sprays in clouds at their ends (a broad, ragged, open crown). Dead: the same skeleton bleached grey, the limbs
// broken short, no leaves
B[0]=function(T,st,lv){const S=SP[0],dead=!!T.dead,bc=dead?C(pick(PAL.dead)):bright(C(pick(PAL.poplarBark)),1),lean=rr(.05,.28),la=rr(0,TAU);
 const hT=T.H*rr(.25,.42),top={x:T.x+Math.cos(la)*lean*hT,y:T.y0+hT,z:T.z+Math.sin(la)*lean*hT};
 const seg=lv===2?7:4,trunk=[];for(let k=0;k<=4;k++){const t=k/4;trunk.push({x:mix(T.x,top.x,t)+rr(-.15,.15)*T.rb,y:T.y0-.3+(hT+.3)*t,z:mix(T.z,top.z,t)+rr(-.15,.15)*T.rb,r:T.rb*mix(1.25,.72,t)});}
 st.trunk+=BIO.tube('bark0',trunk,bc,{seg,rfn:knob});
 const tips=[],nl=ri(3,5),brk=dead?rr(.35,.7):1;
 for(let b=0;b<nl;b++){const a=la+b/nl*TAU+rr(-.5,.5),len=(T.H-hT)*rr(.65,1)*brk,p=grow(top,dirOf(a,rr(.4,1.0)),len,T.rb*.6,T.rb*.22,4,-.08,.14);
  st.limb+=BIO.tube('bark0',J(p,trunk[4].r),bc,{seg:lv===2?5:3});
  const fork=p[2];for(let s=0,ns=dead?ri(0,1):ri(2,3);s<ns;s++){const q=grow(fork,dirOf(a+rr(-1.1,1.1),rr(.2,.8)),len*rr(.45,.7),T.rb*.25,T.rb*.08,3,-.06,.18);
   st.limb+=BIO.tube('bark0',J(q,fork.r),bc,{seg:3});tips.push(q[3],q[2]);}
  tips.push(p[4],p[3]);}
 let reach=T.crownR;tips.forEach(p=>{reach=Math.max(reach,Math.hypot(p.x-T.x,p.z-T.z)+1);});
 if(!dead){const gold=!!T.gold,n0=lv===2?3:1;
  tips.forEach(p=>{for(let k=0;k<n0;k++){const s=T.crownR*rr(.32,.5),a=rr(0,TAU),d=k?rr(.3,.9):0;
   const item=gold&&rng()<.7?'popGold'+ri(0,2):'pop'+ri(0,5),c=gold?leafCol(PAL.poplarGold,1.1):leafCol(S.leaf,1.15);
   BIO.put(item,[p.x+Math.cos(a)*d,p.y-s*.35,p.z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*1.15,s],CATCH.col('poplar',c));st.leaves++;}});}
 regTree(T,S,reach,T.H+1,dead?'Euphrates poplar, dead standing (the water fell)':null);};
// 1 THE SALT CEDAR: six to ten slim stems from the top of its sand cone, arching out and drooping, the weeping plumes hung
// along their outer halves; pink with flower in the season (a share of the plumes)
B[1]=function(T,st,lv){const S=SP[1],bc=bright(C(pick(PAL.tamBark)),1),ns=lv===2?ri(6,10):ri(4,5),base={x:T.x,y:T.y0-.2,z:T.z};
 for(let s=0;s<ns;s++){const a=s/ns*TAU+rr(-.4,.4),p=grow(base,dirOf(a,rr(.75,1.25)),T.H*rr(.75,1.05),T.rb,T.rb*.25,4,-.32,.1);
  st.limb+=BIO.tube('bark1',p,bc,{seg:lv===2?4:3});
  for(let k=2;k<=4;k++){const q=p[k],np=lv===2?2:1;for(let m=0;m<np;m++){const sz=rr(.9,1.7)*(T.H/5),aa=rr(0,TAU);
   const c=rng()<.25?leafCol(PAL.tamFlower,1.05):leafCol(S.leaf,1.1);
   BIO.put('tam'+ri(0,5),[q.x+Math.cos(aa)*.3,q.y+.2,q.z+Math.sin(aa)*.3],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[sz*.8,sz,sz*.8],CATCH.col('tamarisk',c));st.leaves++;}}}
 regTree(T,S,T.crownR,T.H+.5,T.nebkha?'Salt cedar on its sand cone (a nebkha)':null);};
CATCH.B=B;

// ---------------------------------------------------------------- impostors (the far trees)
let ICO=null;
function buildFar(T,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;let tris=0;
 const kk=BIO._lodKey(T.x,T.z),bc=C(T.dead?PAL.dead[0]:pick(S.barkC)).convertSRGBToLinear();
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2),sh=(.55+.45*smooth(-.7,.8,dy)),t=smooth(-.2,.7,dy),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const rings=[0,.5,1].map(u=>({x:T.x,y:T.y0+T.H*(T.dead?.9:.55)*u,z:T.z,yy:T.H*.55*u,r:Math.max(.12,T.rb*(1-.5*u)),col:[bc.r,bc.g,bc.b]}));
 st.far+=BIO.lathe('far',rings,4,1,1,(Rg,a)=>Rg.r,null);
 if(!T.dead)S.far.blobs.forEach((b,bi)=>blob(T.x,T.y0+T.H*b[0],T.z,T.crownR*b[1],T.H*b[2],T.gold?0xc8a838:b[3],b[4],T.seed%7+bi));
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance by field)
const wet=(x,z)=>F('wet',x,z),open=(x,z)=>(1-F('rock',x,z))*smooth(.75,.45,F('slope',x,z))*(1-.8*F('trod',x,z));
CATCH.PASSES=[
 // living tugai where the roots reach the water; dead snags on the dead channels where it fell
 {sp:0,cell:22,salt:101,pad:4,accept:(x,z)=>(smooth(.48,.72,wet(x,z))*.55+smooth(.3,.42,wet(x,z))*smooth(.52,.44,wet(x,z))*F('flow',x,z)*.14)*open(x,z)*(1-.7*F('crust',x,z))*CATCH.bias('poplar',x,z)},
 // the salt cedar at the springs' fringe (its nebkhas are placed one by one below)
 {sp:1,cell:16,salt:102,pad:2.5,accept:(x,z)=>smooth(.4,.6,wet(x,z))*smooth(.92,.75,wet(x,z))*open(x,z)*.35*CATCH.bias('tamarisk',x,z)}];
const newStats=()=>({trunk:0,limb:0,far:0,leaves:0,heroes:0,fars:0,byS:SP.map(()=>0)});
CATCH.buildTrees=function(R,q){q=q==null?1:q;R=R==null?3000:R;
 const st=newStats(),TREES=CATCH.TREES;TREES.length=0;SPACE.clear();const LOD=BIO.radii(),H=BIO.host.catch||{};
 const add=(T,x,z)=>{const ld=BIO.lodD(x,z);T.lv=ld<LOD.hero?2:(ld<LOD.mid?1:(ld<LOD.far?0:-1));if(T.lv<0)return;TREES.push(T);SPACE.insert({x,z,r:T.crownR*.45+.5},x,z,T.crownR+2);};
 // the nebkhas first: one salt cedar on each cone's top (the cone is the land's: the host made it)
 (H.nebkhas||[]).forEach((N,k)=>{reseed(KRAND.hash(SEED,103,k));const S=SP[1];if(rng()>q)return;
  const T={x:N.x,z:N.z,y0:BIO.terrainH(N.x,N.z)-.3,sp:1,H:rr(S.H[0],S.H[1])*(.8+.1*N.h),rb:rr(S.rb[0],S.rb[1]),crownR:Math.max(N.r*.7,rr(S.crownR[0],S.crownR[1])),seed:KRAND.hash(SEED,103,k),nebkha:true};add(T,N.x,N.z);});
 CATCH.PASSES.forEach(P=>{const S=SP[P.sp];
  CATCH.place(P.cell,P.salt,(x,z)=>P.accept(x,z)*q,(x,y,z,i,j)=>{if(blocked(x,z,P.pad))return;
   const w=wet(x,z),T={x,z,y0:y-.3,sp:P.sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:KRAND.hash(SEED,P.salt,i,j)};
   if(P.sp===0){T.dead=w<.47;T.gold=!T.dead&&w<.6;if(T.dead){T.H*=rr(.6,.9);}}
   add(T,x,z);},{R});});
 // OCTAHEDRAL IMPOSTORS FOR THE FAR TIER (core/biome 34; the final rebuild, pair 11, 2026-11-09; korona's lines): a far living poplar is one quad
 // baked from the hero poplar nearest the middle, built again where it stands at BIO.bakeImpostors (after every placement), so no draw before it
 // moves. The dead and the gold keep their blobs (a quad baked from a green crown would show them leafed and green), and so does the salt
 // cedar (3-6.5 m: under the 7 m the stand-ins start at, BACKPORT.md's graphics row). CATCH.IMPOSTORS=false (?diet=0) keeps the blobs for all
 if(typeof location!=='undefined'&&/[?&]diet=0/.test(location.search))CATCH.IMPOSTORS=false;
 const IMPON=CATCH.IMPOSTORS!==false&&typeof BIO.impostor==='function',IMPS=[];
 if(IMPON){const set=BIO.impostorSet('catch.trees',{label:'Far poplars'}),c=BIO.center?BIO.center():[0,0];
  [0].forEach(sp=>{const S=SP[sp];let T0=null;for(const T of TREES)if(T.sp===sp&&T.lv>0&&!T.dead&&!T.gold&&(!T0||Math.hypot(T.x-c[0],T.z-c[1])<Math.hypot(T0.x-c[0],T0.z-c[1])))T0=T;if(!T0)return;
   const T1=Object.assign({},T0),st1=newStats();
   const rec=BIO.impostor('catch.'+S.key,()=>{BAKING=true;try{reseed(T1.seed);B[sp](Object.assign({},T1),st1,2);}finally{BAKING=false;}},{set,at:[T1.x,T1.y0,T1.z],label:S.name+' (far)'});
   if(rec)IMPS[sp]={rec,H:T1.H};});
  if(set.recs.length)BIO.impostorItem('impTrees',set,{label:'Far poplars'});}
 const farImp=T=>{const I=IMPS[T.sp];if(!I||T.dead||T.gold)return false;BIO.impostorPut('impTrees',I.rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/I.H,null);st.far+=2;return true;};
 TREES.forEach(T=>{reseed(T.seed);BIO.owner=[T.x,T.z];if(T.lv===0){if(!farImp(T))buildFar(T,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 BIO.owner=null;
 CATCH.COUNTS=SP.map((S,i)=>st.byS[i]);
 const dead=TREES.filter(T=>T.dead).length;
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,deadPoplars:dead,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),leaves:st.leaves,tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
CATCH._canopyH=function(x,z){let h=0;for(const T of CATCH.TREES){if(Math.hypot(x-T.x,z-T.z)<T.crownR+4)h=Math.max(h,T.y0+T.H);}return h||BIO.terrainH(x,z)+2;};
CATCH.nearestTree=function(sp,x,z,pred){let b=null,bd=1e9;for(const T of CATCH.TREES){if(T.sp!==sp||T.lv<2||(pred&&!pred(T)))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
})();
