// ================================================================= NWOW — trees (and the kit's placement grid)
// Four tree-scale species placed by zone (46: NWOW.at; the host's fast zone raster NWOW.zoneAt where it has one): the fur larch on
// the shaded slopes of the forest-steppe and over the taiga's permafrost flats (shorter as the cold grows: 18-28 m in the forest-
// steppe, 8-15 m in the taiga; leaning where the frozen ground heaves; beards of lichen on the shaded ones), the stone pine among
// them, its creeping mat on the tundra above the tree line, silverthorn in the gullies. Nothing roots in water, on the aufeis or in
// the fields. Beyond the LOD spine a tree is an impostor.
//
// PLACEMENT is by cell (core/rand: KRAND): every cell of a pass reseeds the kit's stream from a hash of (the kit's seed, the pass,
// the cell), so a tile built alone draws what it draws in a full build, and a pass that changes moves nothing else (CLAUDE.md).
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick}=BIO.fn;const qEuler=BIO.qEuler||BIO.fn.qEuler;
const SP=NWOW.SPECIES,PAL=NWOW.PAL,T3=BIO.host.THREE,C=NWOW.C,GOLD=2.399963,SEED=0x4E57;
const {bright,vary}=BIO.col;
NWOW.TREES=[];

// ---------------------------------------------------------------- the placement grid
// place(cell, salt, accept(x,z,zone)->0..1, fn(x,y,z,zone,i,j), {R, lodMax}): one candidate per cell, jittered; the cell's stream is
// reseeded first, so everything fn draws is the cell's own. The zone is the host's fast one (NWOW.zoneAt) when it has one
NWOW.place=function(cell,salt,accept,fn,opt){opt=opt||{};const R=opt.R==null?(NWOW.R==null?2000:NWOW.R):opt.R,N=Math.ceil(R*2/cell);let n=0;
 const zoneAt=NWOW.zoneAt||((x,z)=>NWOW.at(x,z).zone);
 // the cells to visit: the whole disc, or only those in opt.boxes ([x0,z0,x1,z1] windows: the floor's bands round each point of the
 // LOD spine), each cell once however many boxes hold it. A cell's draws are its own either way, so the same cell places the same
 const cells=[];
 if(opt.boxes){const seen=new Set();opt.boxes.forEach(b=>{const i0=Math.max(0,Math.floor((b[0]+R)/cell)),i1=Math.min(N-1,Math.floor((b[2]+R)/cell)),
   j0=Math.max(0,Math.floor((b[1]+R)/cell)),j1=Math.min(N-1,Math.floor((b[3]+R)/cell));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*N+i;if(!seen.has(k)){seen.add(k);cells.push(k);}}});cells.sort((a,b)=>a-b);}
 const visit=(i,j)=>{reseed(KRAND.hash(SEED,salt,i,j));
  const x=-R+(i+rng())*cell,z=-R+(j+rng())*cell,u=rng();if(x*x+z*z>R*R)return;
  if(opt.lodMax!=null&&BIO.lodD(x,z)>opt.lodMax)return;
  const Z=zoneAt(x,z),a=accept(x,z,Z);if(!(a>0)||u>a)return;if(BIO.mask(x,z)<=0||!BIO.clearOf(x,z,0))return;
  fn(x,BIO.terrainH(x,z),z,Z,i,j);n++;};
 if(opt.boxes)cells.forEach(k=>visit(k%N,Math.floor(k/N)));else for(let j=0;j<N;j++)for(let i=0;i<N;i++)visit(i,j);
 return n;};

// ---------------------------------------------------------------- keep-clear between trees (core/space)
const SPACE=KSPACE.create({cell:16});
const blocked=(x,z,pad)=>SPACE.some(x,z,pad,o=>Math.hypot(x-o.x,z-o.z)<o.r+pad);
NWOW.blocked=blocked;
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r,h});
const leafCol=(set,k)=>bright(vary(pick(set),.04,.1,.06),k==null?1.15:k);NWOW.leafCol=leafCol;
const lc=(slot,set,k)=>NWOW.libCol(slot,leafCol(set,k));
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
const P3=p=>[p.x,p.y,p.z];
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.6,1,smooth(.3,.95,qq))*mix(.8,1,smooth(-.6,.35,dy))*rr(.9,1.1);const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
NWOW.clumpAt=clumpAt;
// the season's foliage: the larch's needles fall in winter and come back in spring (fewer, smaller tufts), go gold in autumn
const LARCH_K={spring:.6,summer:1,autumn:.92}[NWOW.season];
const LEAF_SLOT=NWOW.season==='autumn'?'larchgold':'larchgreen';

// ---------------------------------------------------------------- the builders: (T, st, lv) with lv 2 near, 1 mid
const B=[];
// 0 the FUR LARCH: a straight trunk (leaning on the permafrost), short whorled branches level then turned up at their tips, an open
// cone of a crown; tufts of soft needles along the outer half of each branch; on the shaded and the taiga's trees, hanks of beard
// lichen under the branches
B[0]=function(T,st,lv){const S=SP[0],lean=T.lean||0,la=T.leanA||0,bc=C(pick(S.barkC)),top={x:T.x+Math.cos(la)*lean*T.H,y:T.y0+T.H,z:T.z+Math.sin(la)*lean*T.H};
 const pts=[];for(let i=0;i<=6;i++){const t=i/6;pts.push({x:mix(T.x,top.x,t),y:T.y0-.3+(T.H+.3)*t,z:mix(T.z,top.z,t),r:T.rb*mix(1.15,.06,Math.pow(t,.8))});}
 st.trunk+=lv===2?BIO.tube('bark.larch',pts,bc,{seg:6,cap:true}):BIO.lathe('bark.larch',pts.map(p=>Object.assign({col:(c=>[c.r,c.g,c.b])(bc.clone().convertSRGBToLinear())},p)),5,1,1,(Rg)=>Rg.r,null)||0;
 const nb=Math.round((lv===2?rr(18,26):rr(9,12))*Math.min(1.3,T.H/20)),cr=T.crownR,set=S.leaf,beard=T.beard||0;
 for(let b=0;b<nb;b++){const t=.12+.84*b/nb+rr(-.02,.02),a=b*GOLD+rr(-.4,.4),s={x:mix(T.x,top.x,t),y:T.y0+T.H*t,z:mix(T.z,top.z,t)};
  const L=cr*Math.pow(1-t,.65)*rr(.75,1.1)+.4,d=dirOf(a,rr(-.15,.05)),bp=[];
  for(let k=0;k<=3;k++){const u=k/3;bp.push({x:s.x+d[0]*L*u,y:s.y+d[1]*L*u+.25*L*u*u,z:s.z+d[2]*L*u,r:T.rb*.16*(1-u*.7)});}
  if(lv===2)st.limb+=BIO.tube('bark.larch',bp,bc,{seg:3});
  const nc=Math.max(1,Math.round((lv===2?rr(5,8):rr(2,3))*LARCH_K));
  for(let c=0;c<nc;c++){const u=.2+.8*(c+rr(0,.8))/nc,p={x:s.x+d[0]*L*u,y:s.y+d[1]*L*u+.25*L*u*u+rr(-.1,.2),z:s.z+d[2]*L*u};
   clumpAt('larchleaf',p.x,p.y,p.z,(lv===2?rr(.6,.95):rr(1.2,1.7))*mix(.75,1,LARCH_K),.7,lc(LEAF_SLOT,set,1.1),T.x,T.y0+T.H*.55,T.z,cr,T.H*.5);st.clumps++;}
  if(lv===2&&beard>0&&rng()<beard*.55){const u=rr(.25,.7),p={x:s.x+d[0]*L*u,y:s.y+d[1]*L*u,z:s.z+d[2]*L*u},h=rr(.4,.95);
   BIO.put('beard',[p.x,p.y,p.z],qEuler(0,rr(0,TAU),0),[h*.7,h,h*.7],NWOW.libCol('beard',bright(C(pick([0x8a9478,0x6a705e,0x9aa088,0x3a3a34])),1)));st.beards++;}}
 regTree(T,S,cr*.9,T.H);};
// 1 the STONE PINE: a stout trunk, a dense dark rounded crown of five-needled bunches; cones on the upper crown (the nuts: drawn)
B[1]=function(T,st,lv){const S=SP[1],bc=C(pick(S.barkC)),pts=[];for(let i=0;i<=5;i++){const t=i/5;pts.push({x:T.x+rr(-.1,.1)*t,y:T.y0-.3+T.H*.8*t,z:T.z+rr(-.1,.1)*t,r:T.rb*mix(1.1,.2,t)});}
 st.trunk+=lv===2?BIO.tube('bark.pine',pts,bc,{seg:6,cap:true}):BIO.lathe('bark.pine',pts.map(p=>Object.assign({col:(c=>[c.r,c.g,c.b])(bc.clone().convertSRGBToLinear())},p)),5,1,1,(Rg)=>Rg.r,null)||0;
 const cy=T.y0+T.H*.62,ry=T.H*.42,n=lv===2?ri(26,40):ri(10,14);
 for(let k=0;k<n;k++){const a=k*GOLD+rr(-.3,.3),u=rr(.1,1),rad=T.crownR*Math.sqrt(u)*rr(.7,1.05)*(1-.35*smooth(.2,1,(k/n))),y=cy+ry*(1-2*k/n)*rr(.7,1);
  clumpAt('pineleaf',T.x+Math.cos(a)*rad,y,T.z+Math.sin(a)*rad,rr(1.4,2.1),.75,lc('pineleaf',S.leaf,1),T.x,cy,T.z,T.crownR,ry);st.clumps++;}
 if(lv===2){const nc=ri(3,9);for(let k=0;k<nc;k++){const a=rr(0,TAU),rad=T.crownR*rr(.3,.7),y=cy+ry*rr(.2,.8),s=rr(.05,.07);
   BIO.put('cone',[T.x+Math.cos(a)*rad,y,T.z+Math.sin(a)*rad],qEuler(rr(-.4,.4),rr(0,TAU),0),[s,s*1.5,s],C(pick(PAL.cone)));st.fruit++;}}
 regTree(T,S,T.crownR*.9,T.H);};
// 2 the CREEPING STONE PINE: no trunk to speak of, a mat of clumps lying on the slope
B[2]=function(T,st,lv){const S=SP[2],n=lv===2?ri(9,16):ri(4,6);
 for(let k=0;k<n;k++){const a=k*GOLD+rr(-.4,.4),rad=T.crownR*Math.sqrt(rr(.05,1)),x=T.x+Math.cos(a)*rad,z=T.z+Math.sin(a)*rad,y=BIO.terrainH(x,z)+T.H*rr(.25,.6);
  clumpAt('pineleaf',x,y,z,rr(1.2,1.8),.5,lc('pineleaf',S.leaf,.95),T.x,T.y0,T.z,T.crownR,T.H);st.clumps++;}
 regTree(T,S,T.crownR,T.H);};
// 3 SILVERTHORN: a fan of thin stems from the gully floor, silver-leaved clumps at their tips, berries packed on the stems (the card)
B[3]=function(T,st,lv){const S=SP[3],n=lv===2?ri(3,6):2,bc=C(pick(S.barkC));
 for(let k=0;k<n;k++){const a=rr(0,TAU),el=rr(.95,1.35),h=T.H*rr(.7,1),d=dirOf(a,el),tip=[T.x+d[0]*h,T.y0+d[1]*h,T.z+d[2]*h];
  if(lv===2)BIO.beam('rod',[T.x,T.y0-.1,T.z],tip,T.rb,T.rb*.4,bc);
  clumpAt('thorn',tip[0],tip[1]-.2,tip[2],rr(1,1.5),1,NWOW.libCol('thorn',leafCol(S.leaf,1.1)),T.x,T.y0+T.H*.6,T.z,T.crownR,T.H*.5);st.clumps++;
  clumpAt('thorn',T.x+d[0]*h*.55,T.y0+d[1]*h*.55,T.z+d[2]*h*.55,rr(.9,1.3),1,NWOW.libCol('thorn',leafCol(S.leaf,1.05)),T.x,T.y0+T.H*.5,T.z,T.crownR,T.H*.5);st.clumps++;}
 regTree(T,S,T.crownR,T.H);};
NWOW.B=B;

// ---------------------------------------------------------------- impostors (the far trees)
let ICO=null;
function buildFar(T,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;let tris=0;
 const kk=BIO._lodKey(T.x,T.z),bc=C(pick(S.barkC)).convertSRGBToLinear();
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear();
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],m=1+.12*(KRAND.h3(dx*5+sd,dy*5,dz*5,4791)-.5)*2,sh=(.55+.45*smooth(-.7,.8,dy)),t=smooth(-.2,.7,dy),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 if(T.sp===0||T.sp===1){const rings=[0,.5,1].map(u=>({x:T.x,y:T.y0+T.H*.6*u,z:T.z,r:Math.max(.15,T.rb*(1-.4*u)),col:[bc.r,bc.g,bc.b]}));
  st.far+=BIO.lathe('far',rings,4,1,1,(Rg,a)=>Rg.r,null);}
 S.far.blobs.forEach((b,bi)=>blob(T.x,T.y0+T.H*b[0],T.z,T.crownR*b[1],T.H*b[2],b[3],b[4],T.seed%7+bi));
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance by zone, options)
// The zone is 46's; the taiga's larch and the shaded slopes' woods first, then the stone pine among them, the creeping pine on the
// tundra, silverthorn in the gullies. The burn keeps a few standing larch (most are down: Ivan-chai's ground)
// the woods come in stands: thick here, thin there, a glade (a patch field on core/rand, a few hundred metres across)
const stand=(x,z)=>.3+.85*smooth(.32,.62,KRAND.fbm(x*.006+3.3,z*.006-1.1,0,3,4794));
NWOW.PASSES=[
 {sp:0,cell:8,accept:(x,z,Z)=>(Z==='larch'?.75*(NWOW.larchK==null?1:NWOW.larchK)*stand(x,z):Z==='burn'?.04:Z==='steppe'?.0015:Z==='gully'?.03:Z==='tundra'?.01:0),pad:2.6},
 {sp:1,cell:20,accept:(x,z,Z)=>Z==='larch'?.16:Z==='tundra'?.02:0,pad:4},
 {sp:2,cell:7,accept:(x,z,Z)=>Z==='tundra'?.3:Z==='fellfield'?.05:Z==='rock'?.03:0,pad:2},
 {sp:3,cell:9,accept:(x,z,Z)=>Z==='gully'?.32:Z==='floor'?.02:Z==='steppe'?.002:0,pad:2.2},
];
const newStats=()=>({trunk:0,limb:0,far:0,clumps:0,fruit:0,beards:0,heroes:0,fars:0,byS:SP.map(()=>0)});
NWOW.buildTrees=function(R,q){q=q==null?1:q;R=R||2000;
 const st=newStats(),TREES=NWOW.TREES;TREES.length=0;SPACE.clear();const LOD=BIO.radii();
 NWOW.PASSES.forEach((P,pi)=>{const S=SP[P.sp];
  NWOW.place(P.cell,100+pi,(x,z,Z)=>P.accept(x,z,Z)*q,(x,y,z,Z,i,j)=>{if(blocked(x,z,P.pad))return;
   if(NWOW.clearings&&NWOW.clearings.some(c=>Math.hypot(x-c.x,z-c.z)<c.r))return;   /* a host's clearing (a town: its larch felled) */
   const F=NWOW.FIELDS(x,z);if(F.water||F.aufeis||F.field||F.pocket)return;const cold=smooth(13,7.5,F.mean+NWOW.AMP.warm);   /* shorter as the warmest month cools toward the tree line */
   const T={x,z,y0:y-.25,sp:P.sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:KRAND.hash(SEED,pi,i,j),zone:Z};
   if(P.sp<=1){const k=mix(1,.45,cold);T.H*=k;T.crownR*=mix(1,.8,cold);T.rb*=mix(1,.7,cold);}
   // the drunken forest: on the permafrost the larch leans as the frozen ground heaves (up to ~6 degrees)
   if(P.sp===0){T.lean=F.perma*rr(0,.1)+rr(0,.02);T.leanA=rr(0,TAU);T.beard=clamp(-F.sunny*F.slope*4,0,1)*.8+F.perma*.6+cold*.4;}
   const ld=BIO.lodD(x,z);T.lv=ld<LOD.hero?2:(ld<LOD.mid?1:0);
   TREES.push(T);SPACE.insert({x,z,r:(P.sp===3?.8:P.sp===2?T.crownR*.7:T.crownR*.42)+.3},x,z,T.crownR+2);},{R});});
 // each tree drawn from its own stream (its seed), so its shape does not depend on the trees before it
 TREES.forEach(T=>{reseed(T.seed);if(T.lv===0){buildFar(T,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 NWOW.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),clumps:st.clumps,fruit:st.fruit,beards:st.beards,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
NWOW._canopyH=function(x,z){let h=0;for(const T of NWOW.TREES){if(Math.hypot(x-T.x,z-T.z)<T.crownR+3)h=Math.max(h,T.y0+T.H);}return h||BIO.terrainH(x,z)+1;};
NWOW.nearestTree=function(sp,x,z){let b=null,bd=1e9;for(const T of NWOW.TREES){if(T.sp!==sp||T.lv<2)continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
})();
