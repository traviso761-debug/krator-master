// ================================================================= GEYSER — trees and the dead forest
// Five tree-scale species placed by zone from the kit's thermal record (GEYSER.at) and the host's fields (floor, slope,
// flow): the stilt pandan on the basin's cool margins and the creek, the thermal kanuka on the warm crust, glass canes
// where the geysers' water falls, steam combs round the fumaroles and the acid field's edge, and the dead forest's snags
// (a quarter of them fallen). Nothing roots on ground over ~70 degC, in the springs, the run-off's sheet or the Stair's
// pools. Beyond the LOD spine a tree becomes an impostor in the 'far' bucket. Every count scales with q.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=GEYSER.SPECIES,PAL=GEYSER.PAL,GOLD=2.399963,T3=BIO.host.THREE,C=GEYSER.C;
GEYSER.TREES=[];

// ---------------------------------------------------------------- zones
// The thermal record (heat 0..1 of 33..100 degC, sinter, film, spray, vent, acid, dead, terr) and the host's fields
// (floor: the basin and the Stair; slope; flow: the creek's banks; beach). Each zone 0..1:
//   scald   over ~70 degC: nothing roots           margin  the floor's cool meadow and the creek's banks
//   warm    the warm crust (~37-58 degC)            splash  where a geyser's water falls (the glass canes')
//   vents   a ring round each fumaroles and the acid field's edge (the steam combs')       dead   the dead forest
function zones(x,z){const g=GEYSER.at(x,z),F=n=>BIO.field(n,x,z);
 const slope=F('slope'),floor=smooth(.35,.7,F('floor')),flow=F('flow'),beach=F('beach');
 const cliff=smooth(.75,.9,slope),live=(1-cliff)*(1-beach)*(1-smooth(.35,.6,g.film))*(1-g.spring)*(1-smooth(.2,.5,g.terr));
 const scald=smooth(.5,.6,g.heat),cool=1-scald;
 const dead=g.dead*live,alive=1-smooth(.35,.75,g.dead);
 const margin=floor*(1-smooth(.25,.6,g.sinter))*smooth(.2,.05,g.heat)*(1-g.dead)*(1-g.acid)*live;
 const warm=floor*smooth(.03,.1,g.heat)*smooth(.42,.28,g.heat)*(1-smooth(.3,.7,g.sinter))*(1-g.dead)*(1-g.acid*.7)*live;
 const splash=g.spray*smooth(.62,.4,g.heat)*live*(1-g.dead);
 const vents=Math.max(smooth(.02,.12,g.vent)*smooth(.55,.25,g.vent),smooth(.15,.45,g.acid)*smooth(.98,.7,g.acid))*cool*live;
 return{g,slope,floor,flow,cliff,live,scald,dead,margin:margin*alive,warm:warm*alive,splash:splash*alive,vents:vents*alive,creek:flow*live*alive};}
GEYSER.zones=zones;

// ---------------------------------------------------------------- colour
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;const lm=GEYSER.LIBMEAN||{},lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};
 MEAN={bark:GEYSER.BARKTEX.map((t,k)=>lm['bark'+k]!=null?lin(lm['bark'+k]):texMean(t)),wood:lm.wood!=null?lin(lm.wood):texMean(GEYSER.WOODTEX),
  glass:lm.glass!=null?lin(lm.glass):texMean(GEYSER.GLASSTEX),sinter:lm.sinter!=null?lin(lm.sinter):texMean(GEYSER.SINTERTEX)};return MEAN;}
GEYSER.means=means;
const bk=(hex,k,m)=>tint(hex,m,k==null?1:k);
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.04:dh,ds==null?.12:ds,dl==null?.07:dl),k==null?1.3:k);
GEYSER.leafCol=leafCol;GEYSER.bk=bk;
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:r,h:h});

// ---------------------------------------------------------------- keep-clear between trees
const HC=60,HASH={};
function hadd(o){const R=o.r+20;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[Math.floor(x/HC)+','+Math.floor(z/HC)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
GEYSER.blocked=blocked;
// a crooked polyline from o along d
function grow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}return pts;}
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.55,1,smooth(.3,.95,qq))*mix(.82,1,smooth(-.6,.35,dy))*rr(.9,1.1);const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}

// ---------------------------------------------------------------- the builders: (T, st, lv) with lv 2 near, 1 mid
const B=[];
const fruitH=(T,i,k)=>h3(T.seed*.001+i*1.37,k*.71+T.sp,T.x*.013+T.z*.007);
// 0 the STILT PANDAN: its trunk held a man's height off the warm ground on a skirt of stilt roots; it forks two or three
// times; each branch ends in a spiral of long keeled strap leaves, drooping at their tips; orange fruit keys at a few
function crown(T,st,lv,x,y,z,L,col){const n=lv===2?ri(22,30):10,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k*GOLD,up=k<n*.35,pitch=up?rr(.6,1.1):rr(-.35,.4),l=L*rr(.75,1.1)*(up?.8:1);
  BIO.put('strap',[x,y,z],qEuler(rr(-.1,.1),-a,pitch),[l,l*rr(.85,1.05),l*rr(.7,.95)],bright(vary(col,.02,.06,.05),1.2),{n:[Math.cos(a)*.4,.9,Math.sin(a)*.4]});st.leaves++;}
 if(lv===2)BIO.put('rosette',[x,y+L*.12,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),L*rr(1.5,1.9),bright(vary(col,.02,.06,.05),1.15));}
B[0]=function(T,st,lv){const S=SP[T.sp],M=means(),hr=rr(1.2,2.4)*(T.H/10),rs=hr*rr(.7,1.1),nr=lv===2?ri(6,10):4,a0=rr(0,TAU),bc=bk(pick(PAL.pandanBark),1,M.bark[0]);
 for(let k=0;k<nr;k++){const a=a0+k*TAU/nr+rr(-.2,.2),r0=T.rb*.6,gx=T.x+Math.cos(a)*rs*rr(.8,1.2),gz=T.z+Math.sin(a)*rs*rr(.8,1.2),gy=BIO.terrainH(gx,gz)-.2,
   mx=mix(T.x,gx,.45)+Math.cos(a)*.15,mz=mix(T.z,gz,.45)+Math.sin(a)*.15,my=mix(T.y0+hr,gy,.5)+.15;
  st.trunk+=BIO.tube('bark0',[{x:T.x+Math.cos(a)*r0,y:T.y0+hr*rr(.75,1),z:T.z+Math.sin(a)*r0,r:T.rb*.28},{x:mx,y:my,z:mz,r:T.rb*.24},{x:gx,y:gy,z:gz,r:T.rb*.2}],bk(pick(PAL.pandanRoot),1,M.bark[0]),{seg:lv===2?5:3});}
 // the trunk: from the stilts up to the first fork, leaning a little
 const la=rr(0,TAU),lean=rr(.03,.1),hf=T.H*rr(.45,.6),top={x:T.x+Math.cos(la)*lean*hf,y:T.y0+hf,z:T.z+Math.sin(la)*lean*hf};
 st.trunk+=BIO.tube('bark0',[{x:T.x,y:T.y0+hr*.6,z:T.z,r:T.rb*.8},{x:(T.x+top.x)/2,y:(T.y0+hr+top.y)/2,z:(T.z+top.z)/2,r:T.rb*.9},{x:top.x,y:top.y,z:top.z,r:T.rb*.75}],bc,{seg:lv===2?7:4,cap:true});
 // the forks: two or three, each forking again once
 const nb=ri(2,3),tips=[];
 for(let b=0;b<nb;b++){const ba=la+b*TAU/nb+rr(-.4,.4),L1=(T.H-hf)*rr(.45,.6),p1=grow(top,dirOf(ba,rr(.75,1.05)),L1,T.rb*.6,T.rb*.4,2,-.05,.08);
  st.limb+=BIO.tube('bark0',p1,bc,{seg:lv===2?5:3});const e=p1[p1.length-1];
  for(let c=0,nc=lv===2?ri(1,2):1;c<nc;c++){const ca=ba+rr(-.8,.8),p2=grow(e,dirOf(ca,rr(.7,1.1)),(T.H-e.y+T.y0)*rr(.7,1),e.r*.8,e.r*.55,2,-.05,.1);
   st.limb+=BIO.tube('bark0',p2,bc,{seg:lv===2?4:3});tips.push(p2[p2.length-1]);}}
 const lc=C(pick(S.leaf));let reach=rs;
 tips.forEach((p,i)=>{crown(T,st,lv,p.x,p.y,p.z,T.crownR*rr(.55,.7),lc);reach=Math.max(reach,Math.hypot(p.x-T.x,p.z-T.z)+T.crownR*.5);
  if(fruitH(T,i,3)<.35){const fc=C(pick(PAL.pandanFruit));BIO.put('fruit',[p.x+rr(-.2,.2),p.y-.35,p.z+rr(-.2,.2)],null,[.14,.18,.14],bright(fc,1.05));st.fruit++;}});
 regTree(T,S,reach+.5,T.H+1);};
// 1 the THERMAL KANUKA: two to four gnarled stems from the warm crust, leaning out, a flat-topped spray of tiny leaves;
// white with flowers in the season (this page's)
B[1]=function(T,st,lv){const S=SP[T.sp],M=means(),bc=bk(pick(PAL.kanukaBark),1,M.bark[1]),ns=lv===2?ri(2,4):2,a0=rr(0,TAU),spots=[];let top=T.y0+1,reach=1;
 for(let s=0;s<ns;s++){const a=a0+s*TAU/ns+rr(-.4,.4),h=T.H*rr(.7,1),p=grow({x:T.x+Math.cos(a)*.15,y:T.y0-.2,z:T.z+Math.sin(a)*.15},dirOf(a,rr(1.0,1.35)),h,T.rb,T.rb*.35,lv===2?4:2,-.08,.12);
  st.trunk+=BIO.tube('bark1',p,bc,{seg:lv===2?5:3,cap:true});const e=p[p.length-1];top=Math.max(top,e.y);
  for(let k=0,nk=lv===2?ri(2,3):1;k<nk;k++){const ka=a+rr(-1.2,1.2),q=grow(p[Math.max(1,p.length-2-k)],dirOf(ka,rr(.35,.8)),h*rr(.25,.4),e.r*.9,.02,2,-.05,.15);
   if(lv===2)st.limb+=BIO.tube('bark1',q,bc,{seg:3});spots.push(q[q.length-1]);reach=Math.max(reach,Math.hypot(q[2].x-T.x,q[2].z-T.z));}
  spots.push(e);}
 const hc=C(pick(S.leaf)),R=T.crownR,cy=top-R*.15;
 for(const p of spots){for(let c=0,n=lv===2?ri(2,3):1;c<n;c++){const q=rr(0,TAU),d=R*.35*Math.sqrt(rng());
   clumpAt('small',p.x+Math.cos(q)*d,p.y+rr(-.1,.35),p.z+Math.sin(q)*d,R*rr(.55,.8),.45,hc,T.x,cy,T.z,R,R*.4);st.clumps++;}
  if(lv===2&&rng()<.7)for(let f=0;f<ri(3,7);f++)BIO.put('bloom',[p.x+rr(-.5,.5),p.y+rr(.05,.4),p.z+rr(-.5,.5)],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),rr(.12,.2),leafCol(PAL.kanukaFlower,1.15,.01,.03,.03));}
 regTree(T,S,reach+R*.5,top-T.y0+R*.4);};
// 2 GLASS CANES: a colony of hollow stalks armoured in the silica the spray carries: opal white with blue-grey growth
// bands at each node, a bead of geyserite on each tip; the old ones broken, the young thin and short at the edge
B[2]=function(T,st,lv){const S=SP[T.sp],M=means(),n=lv===2?ri(10,26):ri(4,8),R=T.crownR;let top=T.y0;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=R*Math.sqrt(rng()),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=BIO.terrainH(x,z)-.15,edge=d/R,
   h=T.H*rr(.55,1)*(1-.5*edge),broken=rng()<.18,hh=broken?h*rr(.3,.7):h,r=T.rb*rr(.7,1.2)*(1-.3*edge),lean=rr(0,.12)+edge*.12,nn=Math.max(3,Math.round(hh/.7)),pts=[];
  for(let i=0;i<=nn;i++){const t=i/nn,band=i%2===1,c=band?bk(pick(PAL.caneBand),1,M.glass):bk(pick(PAL.cane),1.1,M.glass);
   pts.push({x:x+Math.cos(a)*lean*hh*t*t,y:y+hh*t,z:z+Math.sin(a)*lean*hh*t*t,r:r*(1-.35*t)*(band?1.25:1),col:c});}
  st.trunk+=BIO.tube('glass',pts,pts[0].col,{seg:lv===2?6:4,cap:true});const e=pts[pts.length-1];top=Math.max(top,e.y);
  if(!broken)BIO.put('bead',[e.x,e.y+r*.6,e.z],qEuler(rr(0,1),rr(0,TAU),rr(0,1)),r*rr(1.5,2.3),C(pick(PAL.caneTip)));st.canes++;}
 regTree(T,S,R+.5,top-T.y0+1);};
// 3 the STEAM COMB: a fibrous stalk holding up a fan of fine filaments facing the steam it combs (the nearest fumarole,
// or the acid field's middle); beaded with what it condenses; a second and third stalk on the bigger ones
B[3]=function(T,st,lv){const S=SP[T.sp],M=means(),R=GEYSER.R,ns=lv===2?ri(1,3):1;let face=rr(0,TAU),bd=1e9;
 for(const f of R.fumaroles){const d=Math.hypot(f.x-T.x,f.z-T.z);if(d<bd){bd=d;face=Math.atan2(f.z-T.z,f.x-T.x);}}
 for(const a of R.acid){const d=Math.hypot(a.x-T.x,a.z-T.z)-a.r*.5;if(d<bd){bd=d;face=Math.atan2(a.z-T.z,a.x-T.x);}}
 let top=T.y0;
 for(let s=0;s<ns;s++){const sa=rr(0,TAU),o={x:T.x+Math.cos(sa)*s*.5,y:T.y0-.2,z:T.z+Math.sin(sa)*s*.5},h=T.H*(s?rr(.55,.8):1),
   p=grow(o,dirOf(face+Math.PI,rr(1.38,1.5)),h,T.rb*(s?.7:1),T.rb*.45,lv===2?4:2,.02,.04);
  st.trunk+=BIO.tube('bark2',p,bk(pick(PAL.combStalk),1,M.bark[2]),{seg:lv===2?5:3,cap:true});const e=p[p.length-1];top=Math.max(top,e.y);
  const fs=T.crownR*(s?.7:1)*rr(1.6,2.1);
  BIO.put('comb',[e.x,e.y-fs*.12,e.z],qEuler(rr(-.12,.05),Math.PI/2-face+rr(-.2,.2),rr(-.1,.1)),[fs,fs*rr(.85,1),fs],leafCol(PAL.comb,1.1,.01,.04,.04));st.fans++;}
 regTree(T,S,T.crownR*1.4,top-T.y0+T.crownR*1.6);};
// 4 a SNAG of the dead forest: a hypertree the sinter killed, bleached grey, its foot white-socked where the silica
// climbed it, its crown long gone: broken off at the top, a few stubs of limbs; a quarter of them lie fallen on the crust
B[4]=function(T,st,lv){const S=SP[T.sp],M=means(),sock=rr(1.2,3.8),grey=()=>bk(pick(PAL.snag),1,M.wood),white=()=>bk(pick(PAL.sock),1.08,M.wood);
 const col=y=>y-T.y0<sock*rr(.85,1.1)?white():grey();
 for(let k=0,n=lv===2?ri(4,8):2;k<n;k++){const a=rr(0,TAU),d=T.rb*rr(1.05,2.2),bx=T.x+Math.cos(a)*d,bz=T.z+Math.sin(a)*d;BIO.put('bead',[bx,BIO.terrainH(bx,bz)+.02,bz],qEuler(rr(0,.6),rr(0,TAU),rr(0,.6)),[rr(.2,.6),rr(.08,.2),rr(.2,.6)],white());}
 if(T.fallen){const a=rr(0,TAU),L=T.H*rr(.6,.9),n=lv===2?6:3,pts=[];
  for(let i=0;i<=n;i++){const t=i/n,x=T.x+Math.cos(a)*L*t,z=T.z+Math.sin(a)*L*t,r=T.rb*mix(1,.45,t);pts.push({x,y:BIO.terrainH(x,z)+r*.55,z,r,col:t<.2||rng()<.5?white():grey()});}
  st.trunk+=BIO.tube('wood',pts,pts[0].col,{seg:lv===2?8:5,cap:true});st.logs++;
  regTree(T,S,L*.55,T.rb*2+1);return;}
 const n=lv===2?7:3,la=rr(0,TAU),lean=rr(0,.06),pts=[];
 for(let i=0;i<=n;i++){const t=i/n,y=T.y0-.5+(T.H+.5)*t;pts.push({x:T.x+Math.cos(la)*lean*T.H*t*t,y,z:T.z+Math.sin(la)*lean*T.H*t*t,r:T.rb*mix(1,.55,Math.pow(t,.8))*(t<.06?1.35:1)*(i===n?.7:1),col:col(y)});}
 st.trunk+=BIO.tube('wood',pts,pts[0].col,{seg:lv===2?9:5,cap:false});
 // the broken top: a jagged cone of splinters
 const e=pts[n];if(lv===2)for(let k=0;k<5;k++){const a=k/5*TAU+rr(-.3,.3),h=rr(.5,2.4);BIO.beam('rod',[e.x+Math.cos(a)*e.r*.6,e.y-.2,e.z+Math.sin(a)*e.r*.6],[e.x+Math.cos(a)*e.r*.4,e.y+h,e.z+Math.sin(a)*e.r*.4],e.r*.25,.03,grey());}
 for(let k=0,nk=lv===2?ri(2,5):1;k<nk;k++){const u=rr(.5,.9),p=pts[Math.round(u*n)],a=rr(0,TAU),L=rr(1,T.crownR),q=grow(p,dirOf(a,rr(.1,.6)),L,p.r*.35,p.r*.15,2,-.05,.1);st.limb+=BIO.tube('wood',q,grey(),{seg:4,cap:true});}
 regTree(T,S,T.rb*3+2,T.H+1);};

// ---------------------------------------------------------------- impostors (the far canopy)
let ICO=null;
function buildFar(T,fi,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 const kk=BIO._lodKey(T.x,T.z),F=S.far,bc=C(pick(S.barkC)).convertSRGBToLinear();
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2),sh=(.55+.45*smooth(-.7,.8,dy)),t=smooth(-.2,.7,dy),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const top=T.y0+T.H*(F.bare?1:.6),rings=[0,.5,1].map(u=>({x:T.x,y:T.y0+(top-T.y0)*u,z:T.z,r:Math.max(.2,T.rb*(1-.4*u)),col:[bc.r,bc.g,bc.b]}));
 st.far+=BIO.lathe('far',rings,4,1,1,(Rg,a)=>Rg.r,null);
 const L=S.leaf.map(h=>bright(h,.9)),colOf=c=>typeof c==='number'?c:L[+c[1]%L.length];
 if(!T.fallen)F.blobs.forEach((b,bi)=>blob(T.x,T.y0+T.H*b[0],T.z,T.crownR*b[1],T.H*b[2],colOf(b[3]),colOf(b[4]),fi+bi));
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
SP.forEach((S,i)=>{if(typeof B[i]!=='function')BIO.err('geyser: no builder for species '+i+' '+S.key);});
const newStats=()=>({trunk:0,limb:0,far:0,leaves:0,clumps:0,canes:0,fans:0,logs:0,fruit:0,heroes:0,fars:0,byS:SP.map(()=>0)});
GEYSER.buildTrees=function(R,q){reseed(550631);q=q==null?1:q;R=R||1300;means();
 const st=newStats(),TREES=GEYSER.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const LOD=BIO.radii();
 function pass(P){const sp=P.sp,S=SP[sp],opt=P.opt||{},pad=opt.pad==null?2:opt.pad;let n=0;
  BIO.grid(P.cell,0,R,(x,z)=>{const Z=zones(x,z);if(Z.scald>.5)return 0;const a=P.accept(Z,x,z);return a<=0?0:a*q;},
   (x,y,z)=>{if(blocked(x,z,pad))return;const Z=zones(x,z);if(Z.scald>.3)return;
    const T=GEYSER.make(sp,x,y,z);if(sp===4)T.fallen=rng()<.26;
    if(sp!==4){let hot=false;for(let k=0;k<6&&!hot;k++){const a=k/6*TAU;hot=GEYSER.at(x+Math.cos(a)*T.crownR,z+Math.sin(a)*T.crownR).T>78;}if(hot)return;}
    const ld=BIO.lodD(x,z);T.lv=ld<LOD.hero?2:(ld<LOD.mid?1:0);
    TREES.push(T);hadd({x,z,r:(sp===2?T.crownR*.8:T.rb*1.6)+.5});n++;},
   {patch:opt.patch==null?.5:opt.patch,patchScale:opt.patchScale||.02,pad:1});
  return n;}
 GEYSER.PASSES.forEach(pass);
 TREES.forEach((T,i)=>{if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 GEYSER.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),leaves:st.leaves,clumps:st.clumps,canes:st.canes,fans:st.fans,logs:st.logs,fruit:st.fruit,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
GEYSER._canopyH=function(x,z){let h=0;for(const T of GEYSER.TREES){if(Math.hypot(x-T.x,z-T.z)<60)h=Math.max(h,T.y0+T.H);}return h||4;};
GEYSER.nearestTree=function(sp,x,z,minH){let b=null,bd=1e9;for(const T of GEYSER.TREES){if(T.sp!==sp||T.lv<2||T.fallen||(minH&&T.H<minH))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance from the zones, options)
// The dead first (they stand where the forest stood), then the pandans (the biggest living), then the rest
GEYSER.PASSES=[
 {sp:4,cell:13,accept:Z=>smooth(.3,.65,Z.dead)*.5,opt:{pad:3,patch:.4,patchScale:.02}},
 {sp:0,cell:15,accept:Z=>Z.margin*.32+Z.creek*.3,opt:{pad:3,patch:.55,patchScale:.012}},
 {sp:2,cell:7,accept:Z=>Z.splash*.6,opt:{pad:1.5,patch:.35,patchScale:.03}},
 {sp:1,cell:6.5,accept:Z=>Z.warm*.36+Z.margin*.05,opt:{pad:1.2,patch:.6,patchScale:.02}},
 {sp:3,cell:7,accept:Z=>Z.vents*.6,opt:{pad:1.5,patch:.3,patchScale:.03}},
];

// ---------------------------------------------------------------- one tree alone (biomes/WORLD.md: trees as variants)
GEYSER.make=function(sp,x,y,z){const S=SP[sp];return{x,z,y0:y-.3,sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999)};};
GEYSER.grow=function(T,lv){means();const st=newStats();T.lv=lv;if(lv===0)buildFar(T,T.seed%7,st);else B[T.sp](T,st,lv);return st;};
})();
