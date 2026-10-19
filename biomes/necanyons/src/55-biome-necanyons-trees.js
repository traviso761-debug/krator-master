// ================================================================= NECANYONS — trees (and the kit's placement grid)
// Six tree-scale species placed by zone (46: NECANYONS.at): gorge fan palms in clumps at the walls' wet feet and on the
// creek's banks; stack figs on the ledges and the benches' lips, their roots laced down the wall below; flametip scrub on
// the benches; ember plums on the benches and in the caps' joints; stilt lilies and rock bottles on the caps and the stack
// tops. Nothing roots on a rim (the cliff rule: 46's 'rim' and 'wall' zones). Beyond the LOD spine a tree is an impostor.
//
// PLACEMENT is by cell (core/rand: KRAND): every cell of a pass reseeds the kit's stream from a hash of (the kit's seed,
// the pass, the cell), so a tile built alone draws what it draws in a full build, and a pass that changes moves nothing
// else (CLAUDE.md: never from how many draws came before).
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm}=BIO.fn;const qEuler=BIO.qEuler||((rx,ry,rz)=>{const T=BIO.host.THREE;return new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz,'YXZ'));});
const SP=NECANYONS.SPECIES,PAL=NECANYONS.PAL,T3=BIO.host.THREE,C=NECANYONS.C,GOLD=2.399963,SEED=0x0E7C;
const {bright,vary}=BIO.col;
NECANYONS.TREES=[];NECANYONS.qEuler=qEuler;

// ---------------------------------------------------------------- the placement grid
// place(cell, salt, accept(x,z,Z)->0..1, fn(x,y,z,Z,ix,iz), {box, R, lodMax}): one candidate per cell, jittered; the cell's
// stream is reseeded first, so everything fn draws is the cell's own
NECANYONS.place=function(cell,salt,accept,fn,opt){opt=opt||{};const R=opt.R==null?1500:opt.R,N=Math.ceil(R*2/cell),B=opt.box;let n=0;
 let i0=0,i1=N-1,j0=0,j1=N-1;if(B){i0=Math.max(0,Math.floor((B[0]+R)/cell));i1=Math.min(N-1,Math.ceil((B[2]+R)/cell));j0=Math.max(0,Math.floor((B[1]+R)/cell));j1=Math.min(N-1,Math.ceil((B[3]+R)/cell));}
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){reseed(KRAND.hash(SEED,salt,i,j));
  const x=-R+(i+rng())*cell,z=-R+(j+rng())*cell,u=rng();if(Math.hypot(x,z)>R)continue;
  if(opt.lodMax!=null&&BIO.lodD(x,z)>opt.lodMax)continue;
  const Z=NECANYONS.at(x,z),a=accept(x,z,Z);if(!(a>0)||u>a)continue;if(BIO.mask(x,z)<=0)continue;
  fn(x,BIO.terrainH(x,z),z,Z,i,j);n++;}
 return n;};

// ---------------------------------------------------------------- keep-clear between trees (core/space)
const SPACE=KSPACE.create({cell:24});
const blocked=(x,z,pad)=>SPACE.some(x,z,pad,o=>Math.hypot(x-o.x,z-o.z)<o.r+pad);
NECANYONS.blocked=blocked;
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r,h});
const leafCol=(set,k)=>bright(vary(pick(set),.04,.12,.07),k==null?1.25:k);NECANYONS.leafCol=leafCol;
const lc=(slot,set,k)=>NECANYONS.libCol(slot,leafCol(set,k));
function grow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}return pts;}
NECANYONS.grow=grow;
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.55,1,smooth(.3,.95,qq))*mix(.82,1,smooth(-.6,.35,dy))*rr(.9,1.1);const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
// a crown of clumps on a hemisphere round (cx,cy,cz)
function crown(item,T,st,lv,cx,cy,cz,R,Ry,n,colFn,size){for(let k=0;k<n;k++){const a=k*GOLD+rr(-.3,.3),u=rr(.15,1),rad=R*Math.sqrt(u)*rr(.7,1.05),y=cy+Ry*(1-u)*rr(.6,1.05)-Ry*.15;
  clumpAt(item,cx+Math.cos(a)*rad,y,cz+Math.sin(a)*rad,size*rr(.8,1.2),.7,colFn(k,y),cx,cy,cz,R,Ry);st.clumps++;}}
const fruitH=(T,i,k)=>KRAND.unit(KRAND.hash(T.seed,i,k,0xF2));

// ---------------------------------------------------------------- the builders: (T, st, lv) with lv 2 near, 1 mid
const B=[];
// 0 the GORGE FAN PALM: a clump of grey ringed stems, a round head of drooping fans on long stalks
B[0]=function(T,st,lv){const S=SP[0],n=lv===2?ri(2,5):2,bc=bright(pick(PAL.palmBark),1);let reach=2;
 for(let s=0;s<n;s++){const a=rr(0,TAU),d=s?rr(1.2,3.2):0,x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y0=BIO.terrainH(x,z)-.3,H=T.H*(s?rr(.55,.95):1);
  const la=rr(0,TAU),ln=rr(.02,.08)+(s?.04:0),top={x:x+Math.cos(la)*ln*H,y:y0+H,z:z+Math.sin(la)*ln*H};
  st.trunk+=BIO.tube('bark.palm',[{x,y:y0,z,r:T.rb*1.15},{x:(x+top.x)/2,y:(y0+top.y)/2,z:(z+top.z)/2,r:T.rb*.9},{x:top.x,y:top.y,z:top.z,r:T.rb*.8}],bc,{seg:lv===2?7:4,cap:true});
  const nf=lv===2?ri(16,24):9,a0=rr(0,TAU),col=C(pick(S.leaf));
  for(let k=0;k<nf;k++){const fa=a0+k*GOLD,el=k<nf*.3?rr(.25,.7):k<nf*.75?rr(.85,1.3):rr(1.45,1.95),L=T.crownR*rr(.55,.75);
   const px=top.x+Math.cos(fa)*.4,pz=top.z+Math.sin(fa)*.4,py=top.y+.2;
   BIO.put('fan',[px+Math.cos(fa)*L*.35*Math.sin(el),py+L*.35*Math.cos(el),pz+Math.sin(fa)*L*.35*Math.sin(el)],qEuler(el,Math.PI/2-fa,rr(-.2,.2)),[L,L,L],NECANYONS.libCol('fan',bright(vary(col,.02,.06,.05),1.2)));st.leaves++;}
  reach=Math.max(reach,d+T.crownR*.7);}
 regTree(T,S,reach,T.H+2);};
// 1 the STACK FIG: a crown on the ledge, leaning out over the lip; its roots over the lip and down the wall to the ground,
// figs in clusters on the roots near the crown and on the limbs
function wallDown(T,a,yTop,maxDrop){const Bd=T.body,pts=[];let y=yTop;
 for(let g=0;g<40&&yTop-y<maxDrop;g++){let bed=null;for(const b of Bd.beds){if(y>=b.y&&y<=b.y+b.h){bed=b;break;}}if(!bed)break;
  a+=rr(-.004,.004);const u=(y-bed.y)/bed.h,R=KSTACKS.footR(bed,a)*KSTACKS.prof(bed,u)+rr(.25,.9);const px=bed.cx+Math.cos(a)*R,pz=bed.cz+Math.sin(a)*R;
  const gy=BIO.terrainH(px+Math.cos(a)*1.5,pz+Math.sin(a)*1.5);pts.push({x:px,y,z:pz});if(y<=gy+.5)break;y-=rr(4,7);}
 return pts;}
B[1]=function(T,st,lv){const S=SP[1],Z=T.Z,b=Z.b,a=Math.atan2(T.z-b.cz,T.x-b.cx),out=[Math.cos(a),Math.sin(a)];
 const rc=bright(pick(PAL.figRoot),1),H=T.H,cx=T.x+out[0]*T.crownR*.35,cz=T.z+out[1]*T.crownR*.35,cy=T.y0+H*.55;
 // the bole: short, thick, twisted, three or four limbs
 const top={x:T.x+out[0]*.8,y:T.y0+H*.35,z:T.z+out[1]*.8};
 st.trunk+=BIO.tube('bark.fig',[{x:T.x,y:T.y0-.4,z:T.z,r:T.rb*1.3},{x:(T.x+top.x)/2,y:(T.y0+top.y)/2,z:(T.z+top.z)/2,r:T.rb},top].map((p,i)=>Object.assign(p,{r:p.r==null?T.rb*.8:p.r})),rc,{seg:lv===2?7:4});
 for(let l=0,nl=lv===2?ri(3,5):2;l<nl;l++){const la=a+rr(-1.6,1.6),p=grow(top,dirOf(la,rr(.3,.75)),H*rr(.35,.55),T.rb*.6,T.rb*.25,3,-.04,.12);st.limb+=BIO.tube('bark.fig',p,rc,{seg:lv===2?5:3});
  if(fruitH(T,l,1)<.7){const e=p[2];for(let f=0,nf=lv===2?ri(6,14):3;f<nf;f++){BIO.put('fig',[e.x+rr(-.6,.6),e.y+rr(-.5,.3),e.z+rr(-.6,.6)],null,rr(.045,.06),bright(pick(PAL.figFruit),1));st.fruit++;}}}
 crown('figleaf',T,st,lv,cx,cy,cz,T.crownR,H*.45,lv===2?ri(26,40):12,()=>NECANYONS.libCol('figleaf',leafCol(S.leaf,1.15)),T.crownR*.42);
 // the roots: over the lip and down the wall (core/terrain KSTACKS: the wall's own radius at each height)
 const lipR=KSTACKS.footR(b,a)*(1-b.ch),lip={x:b.cx+Math.cos(a)*lipR,z:b.cz+Math.sin(a)*lipR};let longest=0;
 for(let r=0,nr=lv===2?ri(5,9):3;r<nr;r++){const ra=a+rr(-.5,.5)*(T.crownR/Math.max(30,lipR))*3,rl=KSTACKS.footR(b,ra)*(1-b.ch);
  const pts=[{x:T.x+rr(-.6,.6),y:T.y0+.2,z:T.z+rr(-.6,.6)},{x:b.cx+Math.cos(ra)*(rl+.3),y:b.y+b.h+.15,z:b.cz+Math.sin(ra)*(rl+.3)}].concat(wallDown(T,ra,b.y+b.h-1,rr(25,80)));
  const n=pts.length;if(n<3)continue;const r0=T.rb*rr(.12,.26);pts.forEach((p,i)=>p.r=mix(r0,r0*.25,i/(n-1)));
  st.limb+=BIO.tube('bark.fig',pts,rc,{seg:lv===2?4:3});longest=Math.max(longest,pts[0].y-pts[n-1].y);
  if(fruitH(T,r,2)<.5&&n>3){const q=pts[2];for(let f=0,nf=lv===2?ri(5,10):2;f<nf;f++){BIO.put('fig',[q.x+rr(-.3,.3),q.y-rr(0,3),q.z+rr(-.3,.3)],null,rr(.045,.06),bright(pick(PAL.figFruit),1));st.fruit++;}}}
 T.rootDrop=longest;
 regTree(T,S,T.crownR*1.3,H*.6+2);};
// 2 the FLAMETIP: a short trunk forking two or three times; thick glossy clumps, the top third in scarlet flush
B[2]=function(T,st,lv){const S=SP[2],bc=bright(pick(PAL.flameBark),1),flush=rr(.25,.6),fa=rr(0,TAU);
 const hf=T.H*rr(.3,.45),top={x:T.x+rr(-.3,.3),y:T.y0+hf,z:T.z+rr(-.3,.3)};
 st.trunk+=BIO.tube('bark.wood',[{x:T.x,y:T.y0-.2,z:T.z,r:T.rb},top].map(p=>Object.assign(p,{r:p.r==null?T.rb*.8:p.r})),bc,{seg:lv===2?6:4});
 for(let b=0,nb=ri(2,3);b<nb;b++){const p=grow(top,dirOf(rr(0,TAU),rr(.7,1.1)),(T.H-hf)*rr(.5,.75),T.rb*.6,T.rb*.25,2,-.05,.1);st.limb+=BIO.tube('bark.wood',p,bc,{seg:lv===2?4:3});}
 const cy=T.y0+T.H*.7;
 // the flush by a per-tree angle (nwbay's lesson: an angle gives a lit side, a coin gives confetti)
 crown('flametip',T,st,lv,T.x,cy,T.z,T.crownR,T.H*.32,lv===2?ri(18,28):8,(k,y)=>{const a=k*GOLD,red=(y>cy+T.H*.05?1:.35)*smooth(-.2,.6,Math.cos(a-fa))>1-flush;
  return NECANYONS.libCol('flametip',red?leafCol(PAL.flameFlush,1.1):leafCol(S.leaf,1.15));},T.crownR*.5);
 if(lv===2&&rng()<.3)for(let f=0;f<ri(4,10);f++){const a=rr(0,TAU),r=T.crownR*rr(.5,.9);BIO.put('bloom',[T.x+Math.cos(a)*r,cy+rr(0,T.H*.25),T.z+Math.sin(a)*r],qEuler(rr(-.5,.5),rr(0,TAU),0),rr(.12,.2),C(0xf4d8d0));}
 regTree(T,S,T.crownR,T.H);};
// 3 the EMBER PLUM: a pale trunk, two to four leaning limbs, big pale leaves, green-gold plums
B[3]=function(T,st,lv){const S=SP[3],bc=bright(pick(PAL.plumBark),1),hf=T.H*rr(.25,.4),top={x:T.x,y:T.y0+hf,z:T.z};
 st.trunk+=BIO.tube('bark.wood',[{x:T.x,y:T.y0-.2,z:T.z,r:T.rb},{x:T.x,y:top.y,z:T.z,r:T.rb*.8}],bc,{seg:lv===2?6:4});
 const tips=[];for(let b=0,nb=ri(2,4);b<nb;b++){const p=grow(top,dirOf(rr(0,TAU),rr(.5,.95)),(T.H-hf)*rr(.6,.85),T.rb*.55,T.rb*.2,2,-.06,.12);st.limb+=BIO.tube('bark.wood',p,bc,{seg:lv===2?4:3});tips.push(p[2]);}
 const cy=T.y0+T.H*.72;crown('plumleaf',T,st,lv,T.x,cy,T.z,T.crownR,T.H*.3,lv===2?ri(14,22):7,()=>NECANYONS.libCol('plumleaf',leafCol(S.leaf,1.2)),T.crownR*.5);
 if(fruitH(T,0,3)<.85)for(let f=0,nf=lv===2?ri(14,30):5;f<nf;f++){const a=rr(0,TAU),r=T.crownR*rr(.3,.9);BIO.put('plum',[T.x+Math.cos(a)*r,cy-rr(.2,T.H*.25),T.z+Math.sin(a)*r],null,rr(.022,.03)*1.6,bright(pick(PAL.plumFruit),1.05));st.fruit++;}
 regTree(T,S,T.crownR,T.H);};
// 4 the STILT LILY: forked black trunks (two or three forkings), a fountain of grey-green leaves at each tip, lilac flowers
B[4]=function(T,st,lv){const S=SP[4],bc=bright(pick(PAL.lilyBark),1),tips=[];
 const fork=(p,dir,len,r,depth)=>{const q=grow(p,dir,len,r,r*.8,2,0,.05);st.limb+=BIO.tube('bark.lily',q,bc,{seg:lv===2?5:3});const e=q[2];
  if(depth<=0){tips.push(e);return;}for(let k=0;k<2;k++){const a=Math.atan2(dir[2],dir[0])+(k?1:-1)*rr(.4,.9);fork(e,dirOf(a,rr(.95,1.35)),len*rr(.55,.75),r*.75,depth-1);}};
 fork({x:T.x,y:T.y0-.2,z:T.z},[0,1,0],T.H*rr(.35,.5),T.rb,ri(1,2));
 const flower=rng()<.45;
 tips.forEach(p=>{const s=T.crownR*rr(.9,1.2);BIO.put('lilytuft',[p.x,p.y-.05,p.z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s,s*1.1,s],NECANYONS.libCol('lilytuft',leafCol(S.leaf,1.2)));st.leaves++;
  if(flower&&lv===2)for(let f=0;f<ri(2,4);f++)BIO.put('lilyflower',[p.x+rr(-.3,.3),p.y+s*rr(.6,.9),p.z+rr(-.3,.3)],qEuler(rr(-.4,.4),rr(0,TAU),0),rr(.16,.24),NECANYONS.libCol('lilybloom',pick(PAL.lilyFlower)));});
 let reach=T.crownR;tips.forEach(p=>{reach=Math.max(reach,Math.hypot(p.x-T.x,p.z-T.z)+T.crownR*.7);});
 regTree(T,S,reach,T.H+T.crownR*1.4);};
// 5 the ROCK BOTTLE: a swollen grey bottle, a few thick branches, a few leaves at their tips, pink trumpets in the dry
B[5]=function(T,st,lv){const S=SP[5],bc=bright(pick(PAL.bottle),1),h=T.H*.55;let reach=Math.max(T.crownR,T.rb*1.5);
 st.trunk+=BIO.tube('bark.caudex',[[0,1],[.2,1.18],[.55,.95],[.85,.55],[1,.32]].map(q=>({x:T.x,y:T.y0-.2+h*q[0],z:T.z,r:T.rb*q[1]})),bc,{seg:lv===2?8:5,cap:true});
 const flower=rng()<.6;
 for(let b=0,nb=ri(2,4);b<nb;b++){const p=grow({x:T.x,y:T.y0+h,z:T.z},dirOf(rr(0,TAU),rr(.6,1.2)),(T.H-h)*rr(.8,1.2),T.rb*.3,T.rb*.15,2,-.05,.1);
  st.limb+=BIO.tube('bark.caudex',p,bc,{seg:lv===2?5:3});const e=p[2];
  clumpAt('plumleaf',e.x,e.y+.1,e.z,rr(.5,.8),.6,NECANYONS.libCol('plumleaf',leafCol(PAL.bottleLeaf,1.2)),e.x,e.y,e.z,1,1);st.clumps++;
  if(flower&&lv===2)for(let f=0;f<ri(2,5);f++)BIO.put('bloom',[e.x+rr(-.4,.4),e.y+rr(.1,.4),e.z+rr(-.4,.4)],qEuler(rr(-.5,.5),rr(0,TAU),0),rr(.12,.18),NECANYONS.libCol('bloom',pick(PAL.bottleFlower)));
  reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+.9);}
 regTree(T,S,reach,T.H+1);};
NECANYONS.B=B;

// ---------------------------------------------------------------- impostors (the far trees)
let ICO=null;
function buildFar(T,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;let tris=0;
 const kk=BIO._lodKey(T.x,T.z),bc=C(pick(S.barkC)).convertSRGBToLinear();
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2),sh=(.55+.45*smooth(-.7,.8,dy)),t=smooth(-.2,.7,dy),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const rings=[0,.5,1].map(u=>({x:T.x,y:T.y0+T.H*.6*u,z:T.z,r:Math.max(.15,T.rb*(1-.4*u)),col:[bc.r,bc.g,bc.b]}));
 st.far+=BIO.lathe('far',rings,4,1,1,(Rg,a)=>Rg.r,null);
 S.far.blobs.forEach((b,bi)=>blob(T.x,T.y0+T.H*b[0],T.z,T.crownR*b[1],T.H*b[2],b[3],b[4],T.seed%7+bi));
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance by zone, options)
// Z is NECANYONS.at(x,z): {zone, d (to the top's edge), seep, pan, footD, B, b}. The figs first (they want the lips),
// then the palms, the flametips, the plums, the lilies and the bottles
const flowOf=(x,z)=>BIO.field('flow',x,z);
NECANYONS.PASSES=[
 {sp:1,cell:22,accept:(x,z,Z)=>(Z.zone==='ledge'?.55+.4*Z.seep:Z.zone==='bench'?.22:0)*smooth(-16,-9,Z.d)*smooth(-4.5,-6,Z.d),pad:7},
 {sp:0,cell:14,accept:(x,z,Z)=>(Z.zone==='foot'?smooth(4,9,Z.footD)*smooth(44,24,Z.footD)*(.15+.75*Z.seep):0)+(Z.zone==='floor'?.4*smooth(.55,.9,flowOf(x,z)):0),pad:3.5},
 {sp:2,cell:9,accept:(x,z,Z)=>Z.zone==='bench'?(1-Z.pan)*smooth(-7,-12,Z.d)*(.08+.3*smooth(.4,.75,fbm(x*.004+3,z*.004,91,2))):0,pad:3.5},
 {sp:3,cell:16,accept:(x,z,Z)=>(Z.zone==='bench'?.16:Z.zone==='cap'?.07:0)*(1-Z.pan)*smooth(-6,-10,Z.d),pad:2.5},
 {sp:4,cell:6,accept:(x,z,Z)=>(Z.zone==='cap'?.32:Z.zone==='stack'?.4:0)*(1-Z.pan)*smooth(-4.5,-6.5,Z.d)*smooth(.25,.65,fbm(x*.01-2,z*.01+4,92,2)),pad:1.2},
 {sp:5,cell:12,accept:(x,z,Z)=>(Z.zone==='cap'?.14:Z.zone==='stack'?.2:0)*(1-Z.pan)*smooth(-4.5,-6.5,Z.d),pad:1.5},
];
const newStats=()=>({trunk:0,limb:0,far:0,leaves:0,clumps:0,fruit:0,heroes:0,fars:0,byS:SP.map(()=>0)});
NECANYONS.buildTrees=function(R,q){q=q==null?1:q;R=R||1500;
 const st=newStats(),TREES=NECANYONS.TREES;TREES.length=0;SPACE.clear();const LOD=BIO.radii();
 NECANYONS.PASSES.forEach((P,pi)=>{const S=SP[P.sp];
  NECANYONS.place(P.cell,100+pi,(x,z,Z)=>P.accept(x,z,Z)*q,(x,y,z,Z,i,j)=>{if(blocked(x,z,P.pad))return;
   const T={x,z,y0:y-.25,sp:P.sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:KRAND.hash(SEED,pi,i,j),Z,body:Z.B};
   const ld=BIO.lodD(x,z);T.lv=ld<LOD.hero?2:(ld<LOD.mid?1:0);
   TREES.push(T);SPACE.insert({x,z,r:(P.sp===0?3:P.sp===1?T.crownR*.6:T.rb*2)+.5},x,z,T.crownR+2);},{R});});
 // each tree drawn from its own stream (its seed), so its shape does not depend on the trees before it
 TREES.forEach(T=>{reseed(T.seed);if(T.lv===0){buildFar(T,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 NECANYONS.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),leaves:st.leaves,clumps:st.clumps,fruit:st.fruit,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
NECANYONS._canopyH=function(x,z){let h=0;for(const T of NECANYONS.TREES){if(Math.hypot(x-T.x,z-T.z)<T.crownR+4)h=Math.max(h,T.y0+T.H);}return h||BIO.terrainH(x,z)+2;};
NECANYONS.nearestTree=function(sp,x,z){let b=null,bd=1e9;for(const T of NECANYONS.TREES){if(T.sp!==sp||T.lv<2)continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
})();
