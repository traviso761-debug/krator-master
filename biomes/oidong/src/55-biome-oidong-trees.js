// ================================================================= OIDONG VALLEY — trees
// The fourteen tree-scale species, each with its own builder, placed by zone from the host's fields: the still pools
// (the giant lotuses stand IN the water), their shores, the moss woods in the shade, the sunny meadows, the pale flats,
// the bamboo groves, the terraces above and the mist at the valley's head. Five builders are Xanadu's, carried over the
// pass and paled (biomes/xanadu/src/55-biome-xanadu-trees.js: the cloud pine, the cushion tree, the haze blossom, the
// lotus trumpet and the wisteria). Beyond the LOD spine a tree becomes an impostor in the 'far' bucket.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=OIDONG.SPECIES,PAL=OIDONG.PAL,GOLD=OIDONG.GOLD;
const T3=BIO.host.THREE,C=OIDONG.C;
OIDONG.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// The world's fields (biomes/WORLD.md): wet, flow, upland, rock, slope, cold, mist, and one this kit adds:
//   flat   the pale gravel flats (an old lake bed, the fans off the walls): the raked-looking ground, 0..1
// and the local water (BIO.depth: the pools). Each zone 0..1:
//   pool     standing water: the giant lotuses, the lotus, the lilies
//   shore    the pools' margins: lotus trumpets, wisteria, bell-pod willows, cherries; reeds and iris
//   moss     the moss woods, the shaded patches of the valley floor: maples, marble birches, moss-ball trees; moss, ferns, moon caps
//   grove    (a patch field) where the marble birches gather
//   meadow   the open sunny floor: haze blossoms, cushion trees, cherries, sacred figs; box domes, grass, poppies
//   flats    the pale flats: cloud pines leaning, peyote, stone-blooms, sage, the standing stones
//   bamboo   the groves on the lower slopes
//   terrace  the slopes above the floor: cloud pines, tea, sky poppies, snow lotus higher up
//   mist     the valley's head in the cataract's spray: chalice trees, tree-shade ferns, moss
//   stream   the stream between the pools
//   crag     bare rock; cliff: a sheer face, nothing roots (every zone is multiplied by 1-cliff)
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const F=n=>BIO.field(n,x,z);
 const wet=F('wet'),flow=F('flow'),up=F('upland'),rock=F('rock'),slope=F('slope'),cold=F('cold'),mist=F('mist'),flat=F('flat'),dep=BIO.depth(x,z);
 const cliff=smooth(.8,.95,slope)*smooth(.3,.6,rock),live=1-cliff;
 const pool=smooth(-.3,.5,dep),shoreK=smooth(-9,-.3,dep)*(1-pool);
 const crag=smooth(.35,.65,rock)*live,flats=smooth(.4,.75,flat)*(1-crag)*live*(1-pool)*(1-shoreK*.7);
 const rest=(1-crag)*(1-flats)*live*(1-pool);
 const mistK=smooth(.3,.65,mist),high=smooth(.3,.6,up);
 const mossP=smooth(.44,.58,fbm(x*.0028+5,z*.0028-3,7171,3))*smooth(.58,.72,wet);
 const bambooP=smooth(.54,.66,fbm(x*.0047-9,z*.0047+4,7272,2))*smooth(.6,.72,wet)*smooth(.34,.08,up);
 const grove=smooth(.55,.66,fbm(x*.0035+21,z*.0035+17,7373,2));
 const shore=shoreK*(1-crag)*live,dry=(1-shore);
 return{wet,flow,up,rock,slope,cold,mist:mistK,flat,dep,cliff,crag,flats,pool,shore,grove,high,
  moss:rest*dry*mossP*(1-high*.6)*(1-bambooP)*(1-mistK*.5),
  bamboo:rest*dry*bambooP*(1-mistK),
  meadow:rest*dry*(1-mossP)*(1-bambooP)*(1-high)*smooth(.3,.5,wet)*(1-mistK),
  terrace:rest*high*(1-mistK),
  mistZ:mistK*live*(1-pool)*(1-crag),
  stream:smooth(.4,.75,flow)*live*(1-pool)};}
OIDONG.zones=zones;

// ---------------------------------------------------------------- colour (the maths is the core's, BIO.col)
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={bark:OIDONG.BARKTEX.map(t=>texMean(t)),wood:texMean(OIDONG.WOODTEX),rock:texMean(OIDONG.ROCKTEX),cap:texMean(OIDONG.CAPTEX)};
 if((OIDONG.LIBMEAN||{}).cap!=null){const v=Math.pow(OIDONG.LIBMEAN.cap,2.2);MEAN.cap=[v,v,v];}
 const lm=OIDONG.LIBMEAN||{},lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};MEAN.bark=MEAN.bark.map((m,k)=>lm['bark'+k]!=null?lin(lm['bark'+k]):m);
 if(lm.rock!=null)MEAN.rock=lin(lm.rock);
 return MEAN;}
Object.assign(OIDONG,{means,tint,bright,shade,vary});
const BARKC={};
// the marble (3) is painted in its own colours: its bark colour is a multiplier on them, not a tint
const barkCol=(S,k)=>{const key=S.key+(k%S.bark.length);if(S.barkK===3)return C(S.bark[k%S.bark.length]);
 if(S.barkK===7)return C([0xf2eee8,0xe8e2da,0xfaf6f0][k%3]);   /* the carved bark (7) is painted in its own two colours too */return BARKC[key]||(BARKC[key]=tint(S.bark[k%S.bark.length],means().bark[S.barkK],.4));};
const rodCol=(hex,f)=>shade(C(hex),f==null?-.25:f);
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.03:dh,ds==null?.08:ds,dl==null?.05:dl),k==null?1.25:k);
const nearW=(k)=>bright(vary(C(0xffffff),.02,.04,.04),k==null?1:k);
const irid=(set)=>bright(C(pick(set)),1.1);
OIDONG.leafCol=leafCol;OIDONG.nearW=nearW;
const fam=S=>'bark'+S.barkK;

// ---------------------------------------------------------------- polyline helpers (Xanadu's)
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
function arc(a,c,b,r0,r1,n){const pts=[];for(let k=0;k<=n;k++){const t=k/n,u=1-t;pts.push({x:u*u*a[0]+2*u*t*c[0]+t*t*b[0],y:u*u*a[1]+2*u*t*c[1]+t*t*b[1],z:u*u*a[2]+2*u*t*c[2]+t*t*b[2],r:mix(r0,r1,t)});}return pts;}
const clear3=(x,y,z,rad,vr)=>BIO.clearOf3(x,y,z,rad,vr);
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
const P3=p=>[p.x,p.y,p.z];
function along(pts,u){const f=clamp(u,0,1)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),t=f-i,a=pts[i],b=pts[i+1];return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),r:mix(a.r,b.r,t)};}
// a BOLE by lathe up to `top` metres, radius rAt(u), fluting, buttress fins at the foot, a lean; returns the top point
function bole(T,S,top,rAt,o){o=o||{};const vs=o.vs||6,ti=T.seed%3,rings=[],ph=rr(0,TAU),ph2=rr(0,TAU),famN=o.fam||fam(S);
 const lx=o.lean?o.lean[0]:0,lz=o.lean?o.lean[1]:0;
 const at=yy=>[T.x+lx*yy,T.z+lz*yy];
 for(let yy=0;yy<top;yy+=vs*.5){const p=at(yy);rings.push({x:p[0],y:T.y0+yy,z:p[1],r:rAt(yy/T.H),yy:yy,col:o.col?o.col(yy):barkCol(S,(Math.floor(yy/10)+ti)%3)});}
 const pe=at(top),re=rAt(top/T.H),sp=o.spire!==false&&top>T.H*.75;
 rings.push({x:pe[0],y:T.y0+top,z:pe[1],r:re*(sp?.75:.88),yy:top,col:barkCol(S,1)},
  {x:pe[0],y:T.y0+top+re*(sp?1.2:.42),z:pe[1],r:sp?.04:Math.max(.03,re*.22),yy:top+re*(sp?1:.35),col:barkCol(S,1)});
 const nf=o.flutes||0,fa=o.fluteA||0,tw=o.twist||0,nb=o.nb||5,bt=o.buttress||0,bh=o.bh||2.5;
 const seg=o.seg||(T.lv===2?14:9),uvs=BIO.bucket(famN).uvScale;
 BIO.lathe(famN,rings,seg,Math.max(1,Math.round(TAU*rAt(.1)/uvs[0])),uvs[1],
  (R,ang)=>R.r*(1+fa*Math.cos(nf*ang+R.yy*tw+ph))*(1+bt*Math.exp(-R.yy/bh)*Math.max(0,Math.cos(nb*ang+ph2))),
  (R,ang)=>1-(fa>0?.25*(.5-.5*Math.cos(nf*ang+R.yy*tw+ph)):0));
 return{x:pe[0],y:T.y0+top,z:pe[1],r:re};}
// a limb's joint to its parent (core/biome 31j, BIO.flareJoin): tapered capped tubes at both hero (lv=2) and mid (lv=1),
// with accurate parentR so limbs emerge seamlessly from trunks and forks with zero open pipe rims
function limb(S,pts,st,o){o=o||{};const lv=o.lv==null?2:o.lv,j=o.join!==false&&BIO.flareJoin&&pts[0].r>.035;
 const pR=o.parentR!=null?o.parentR:pts[0].r*1.35,P=j?BIO.flareJoin(pts,{parentR:pR}):pts;
 const baseSeg=o.seg||(pts[0].r>.45?7:5),sg=lv===2?baseSeg:Math.max(4,baseSeg-2);
 st.limb+=BIO.tube(o.fam||fam(S),P,o.col||barkCol(S,1),{seg:j&&pts[0].r>.14&&lv===2?Math.max(6,sg):sg,cap:true,vscale:o.vscale});}
function limbOk(pts,pad){for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+(pad||1.5),pts[i].r+(pad||1.5)))return false;return true;}
function subTwigs(S,pts,u,aBase,elRange,len,st,lv,spots,o){
 const m=along(pts,u),nf=lv===2?2:1;
 for(let q=0;q<nf;q++){const side=q===0?(rng()<.5?1:-1):-1,a=aBase+side*rr(.55,1.05),el=rr(elRange[0],elRange[1]);
  const sub=treeGrow({x:m.x,y:m.y,z:m.z},dirOf(a,el),len*rr(.75,1.1),m.r*.68,Math.max(.03,m.r*.22),3,o&&o.curve!=null?o.curve:-.04,.12);
  if(!limbOk(sub,.6))continue;
  limb(S,sub,st,Object.assign({lv,parentR:m.r,seg:5},o||{}));
  spots.push(sub[2],sub[3]);}}

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
OIDONG.blocked=blocked;

// ---------------------------------------------------------------- foliage helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey,c2){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.62,1.02,smooth(.25,.95,qq))*mix(.85,1.02,smooth(-.6,.35,dy))*rr(.92,1.08);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao*1.3),{n:[nx/nn,ny/nn,nz/nn],c2:c2?bright(c2,ao*1.2):null});}
function mossAt(x,y,z,s){BIO.put('moss',[x,y,z],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[s,s*.7,s],leafCol(PAL.moss,1.15,.03,.08,.06),{n:[0,1,0]});}
// the old trunks' epiphytes: rainbow brackets in a tier, a coin vine hung from a limb
function brackets(x,y,z,r,n,st){const a0=rr(0,TAU);for(let k=0;k<n;k++){const a=a0+rr(-.4,.4),s=rr(.25,.6),yy=y+k*rr(.25,.5);
 BIO.put('bracket',[x+Math.cos(a)*r*.98,yy,z+Math.sin(a)*r*.98],qEuler(0,-a+Math.PI/2,0),s,bright(vary(C(pick(PAL.bracket)),.02,.06,.05),1.1));st.epi++;}}
function coinVine(p,st){const L=rr(1.2,3);BIO.put('coin',[p.x,p.y-p.r*.5,p.z],qEuler(0,rr(0,TAU),0),[L*.35,L,L*.35],leafCol(PAL.jade,1.2,.02,.05,.05));st.vines++;}
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:r,h:h});
// fallen petals round a blossoming tree (and on the water, when it stands at the pool's edge)
function petals(T,n,col){for(let k=0;k<n;k++){const a=rr(0,TAU),d=T.crownR*rr(.1,1.1)*Math.sqrt(rng()),px=T.x+Math.cos(a)*d,pz=T.z+Math.sin(a)*d,w=BIO.waterH(px,pz),g=Y(px,pz);
 const y=w>g?w+.02:g+.03;BIO.put('petal',[px,y,pz],qEuler(0,rr(0,TAU),0),rr(.12,.2),bright(vary(col,.02,.05,.04),1.1));}}

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed,wet,lv} and lv 2 near / 1 mid
const B=[];

// 0 the GIANT LOTUS
B[0]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,wl=T.y0,hc=vary(pick(S.leaf),.02,.05,.04),a0=rr(0,TAU);
 const nP=lv===2?ri(4,7):ri(2,4);let reach=R;
 for(let k=0;k<nP;k++){const a=a0+k*GOLD,d=k?R*rr(.6,1.3):0,px=T.x+Math.cos(a)*d,pz=T.z+Math.sin(a)*d,Rp=R*(k?rr(.45,.85):rr(.8,1));
  if(k&&BIO.depth(px,pz)<.3)continue;
  BIO.put(OIDONG.it('giantpad',lv),[px,wl+.03,pz],qEuler(0,rr(0,TAU),0),[Rp,Rp,Rp],OIDONG.CARD.padcard?nearW(rr(.95,1.08)):bright(vary(hc,.015,.04,.04),rr(1.05,1.2)));st.pads++;
  if(lv===2){const g=Y(px,pz);BIO.beam('rod',[px,g-.5,pz],[px,wl-.05,pz],rb*.55,rb*.55,rodCol(S.bark[0],-.1));}
  reach=Math.max(reach,d+Rp);}
 const nS=lv===2?ri(1,3):ri(1,2);
 for(let k=0;k<nS;k++){const a=a0+1.3+k*GOLD,d=k?R*rr(.3,.7):rr(0,R*.3),px=T.x+Math.cos(a)*d,pz=T.z+Math.sin(a)*d,h=H*(k?rr(.55,.9):1),la=rr(0,TAU),lean=rr(.02,.08);
  const g=Y(px,pz),pts=[];for(let i=0;i<=5;i++){const t=i/5;pts.push({x:px+Math.cos(la)*lean*h*t*t,y:mix(g-.3,wl+h,t),z:pz+Math.sin(la)*lean*h*t*t,r:rb*(1-.35*t)});}
  limb(S,pts,st,{fam:'bark2',seg:7,lv,join:false});
  const e=pts[5],kind=T.seed%5<3?'flower':T.seed%5===3?'bud':'pod',Rf=R*rr(.28,.42);
  if(kind==='flower'){BIO.put(OIDONG.it('giantcup',lv),[e.x,e.y-.1,e.z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[Rf,Rf*.9,Rf],nearW(1.02));st.blooms++;}
  else if(kind==='bud'){BIO.put('cone',[e.x,e.y-.2,e.z],qUp([0,1,0]),[Rf*.9,Rf*1.6,Rf*.9],bright(vary(C(pick(PAL.blush)),.02,.05,.04),1.1));st.blooms++;}
  else{BIO.put('giantpod',[e.x,e.y-.1,e.z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[Rf*.7,Rf*.7,Rf*.7],nearW(1.0));st.pods++;}}
 regTree(T,S,reach,H+R*.4);};

// 1 the SACRED FIG: pale buttressed bole, spreading primary & secondary boughs, dense heart-leaf canopy
B[1]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const rAt=u=>rb*(1-.55*u)*(1+.5*Math.exp(-u*H/2.5));
 const top=bole(T,S,H*.44,rAt,{buttress:1.1,bh:3,nb:7,vs:5,seg:lv===2?16:10,spire:false});
 const nB=lv===2?ri(6,9):5,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.72,spots=[];let reach=R*.55;
 for(let k=0;k<nB;k++){const u=rr(.55,1),pR=rAt(.44*u),p={x:T.x,y:T.y0+H*.44*u,z:T.z},a=a0+k*GOLD,el=rr(.26,.68),L=R*rr(.82,1.14);
  const pts=treeGrow(p,dirOf(a,el),L,pR*.58,.11,5,.06,.1);if(!limbOk(pts,1))continue;
  limb(S,pts,st,{seg:7,lv,parentR:pR});
  for(let i=2;i<=5;i++)spots.push(pts[i]);
  subTwigs(S,pts,.55,a,[.2,.6],L*.46,st,lv,spots,{curve:.04});
  if(lv===2)subTwigs(S,pts,.78,a+.3,[.15,.5],L*.34,st,lv,spots,{curve:.02});
  if(lv===2&&k%2===0)for(let i=1;i<=3;i++)if(rng()<.5){const q=pts[i],g=Y(q.x,q.z),drop=Math.max(1,q.y-g);BIO.put('strand',[q.x,q.y-q.r*.8,q.z],qEuler(0,rr(0,TAU),0),[rr(.25,.5),drop+.3,1],rodCol(S.bark[1],-.05));st.roots++;}
  const e=pts[5];reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+R*.3);}
 spots.push({x:top.x,y:top.y+rr(.4,1.4),z:top.z});
 const cnt=lv===2?3:2;spots.forEach(p=>{for(let c=0;c<cnt;c++){const sz=rr(1.9,3.0)*Math.min(1.3,H/17),nw=rng()<.25;
  clumpAt('heart',p.x+rr(-.55,.55),p.y+rr(-.2,.55),p.z+rr(-.55,.55),sz,.65,OIDONG.CARD.heart?nearW(rr(.9,1.05)):(nw?C(pick(PAL.peach)):hc),T.x,cy,T.z,R,H*.3,OIDONG.CARD.heart?null:irid(PAL.irid.heart));st.clumps++;}});
 if(lv===2){brackets(T.x,T.y0+rr(1,3),T.z,rAt(.08),ri(2,5),st);for(let k=0,m=ri(2,4);k<m;k++)mossAt(T.x+rr(-rb,rb),T.y0+rr(.2,1.2),T.z+rr(-rb,rb),rr(.5,1));
  const fc=bright(C(0x8a5a7a),1.0);for(const p of spots)if(rng()<.4)for(let f=0,m=ri(2,4);f<m;f++)BIO.put('ball',[p.x+rr(-.8,.8),p.y+rr(-.5,.3),p.z+rr(-.8,.8)],null,rr(.04,.06),bright(vary(fc,.02,.06,.05),1.05));st.pods++;}
 regTree(T,S,reach,H+2);};

// 2 the CHERRY: dark banded trunk, forked boughs & twigs, full umbrella of blush/ivory blossom
B[2]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,white=T.seed%4===0,base=white?C(pick(PAL.ivory)):C(pick(PAL.blush));
 const la=rr(-.06,.06),lz=rr(-.06,.06),rAt=u=>rb*(1-.5*u)*(1+.35*Math.exp(-u*H/2));
 const top=bole(T,S,H*.40,rAt,{flutes:3,fluteA:.05,vs:4,seg:lv===2?11:7,lean:[la,lz],spire:false});
 const nB=lv===2?ri(6,8):5,a0=rr(0,TAU),cy=T.y0+H*.76,spots=[];
 for(let k=0;k<nB;k++){const u=rr(.75,1),yy=H*.40*u,pR=rAt(.40*u),o={x:T.x+la*yy,y:T.y0+yy,z:T.z+lz*yy};
  const a=a0+k/nB*TAU+rr(-.25,.25),L=R*rr(.82,1.12),pts=treeGrow(o,dirOf(a,rr(.32,.72)),L,pR*.56,.06,5,-.05,.14);
  if(!limbOk(pts,.9))continue;
  limb(S,pts,st,{seg:6,lv,parentR:pR});
  for(let i=1;i<=5;i++)spots.push(pts[i]);
  subTwigs(S,pts,.52,a,[.22,.65],L*.45,st,lv,spots,{curve:-.04});
  if(lv===2)subTwigs(S,pts,.78,a-.25,[.15,.5],L*.32,st,lv,spots,{curve:-.03});}
 spots.push({x:top.x,y:top.y+rr(.4,1.1),z:top.z});
 const cnt=lv===2?3:2;spots.forEach(p=>{for(let c=0;c<cnt;c++){const sz=rr(1.7,2.6)*Math.min(1.3,H/9);
  if(OIDONG.CARD.cherrybloom)clumpAt('cherrybloom',p.x+rr(-.45,.45),p.y+rr(-.15,.45),p.z+rr(-.45,.45),sz,.68,nearW(rr(.92,1.05)),T.x,cy,T.z,R,H*.26,null);
  else clumpAt('blossom',p.x+rr(-.45,.45),p.y+rr(-.15,.45),p.z+rr(-.45,.45),sz,.68,vary(base,.01,.04,.03),T.x,cy,T.z,R,H*.26,irid(PAL.irid.blossom));st.clumps++;}});
 if(lv===2){petals(T,ri(16,32),base);if(T.seed%3){const cc=bright(C(0xd0485a),1.0);for(const p of spots)if(rng()<.55){for(let f=0,m=ri(1,3);f<m;f++)BIO.put('ball',[p.x+rr(-.8,.8),p.y+rr(-.4,.35),p.z+rr(-.8,.8)],null,rr(.05,.07),bright(vary(cc,.02,.06,.05),1.05));st.pods++;}}}
 regTree(T,S,R,H+1);};

// 3 the MARBLE BIRCH: slender painted marble bole with layered ascending boughs from mid-height & rich lacy crown
B[3]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,la=rr(0,TAU),lk=rr(0,.04);
 const rAt=u=>rb*(1-.74*u)*(1+.3*Math.exp(-u*H/2));
 const top=bole(T,S,H*.9,rAt,{fam:'barkM',lean:[Math.cos(la)*lk,Math.sin(la)*lk],vs:6,seg:lv===2?12:8});
 const nB=lv===2?ri(7,11):5,a0=rr(0,TAU),hc=vary(pick(S.leaf),.01,.03,.03).lerp(C(pick([].concat(PAL.blush,PAL.mint,PAL.lavender,PAL.powder))),.35),cy=T.y0+H*.78,spots=[];
 for(let k=0;k<nB;k++){const u=lerp(.46,.92,k/Math.max(1,nB-1))+rr(-.03,.03),pR=rAt(u);
  const p={x:T.x+Math.cos(la)*lk*H*u,y:T.y0+H*u,z:T.z+Math.sin(la)*lk*H*u},a=a0+k*GOLD,L=R*rr(.75,1.15)*(1.12-.35*u);
  const pts=treeGrow(p,dirOf(a,rr(.48,.92)),L,pR*.52,.05,4,-.08,.12);
  if(!limbOk(pts,.8))continue;
  limb(S,pts,st,{fam:'barkM',seg:5,lv,parentR:pR});
  for(let i=1;i<=4;i++)spots.push(pts[i]);
  subTwigs(S,pts,.55,a,[.35,.8],L*.44,st,lv,spots,{fam:'barkM',curve:-.06});}
 spots.push({x:top.x,y:top.y+rr(.3,1.4),z:top.z});
 const cnt=lv===2?3:2;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('lace',p.x+rr(-.55,.55),p.y+rr(-.2,.65),p.z+rr(-.55,.55),rr(2.1,3.3)*Math.min(1.3,H/20),.65,OIDONG.CARD.lace?nearW(rr(.92,1.05)):hc,T.x,cy,T.z,R,H*.26,irid(PAL.irid.marble));st.clumps++;}});
 if(lv===2)for(let k=0,m=ri(3,7);k<m;k++){const a=rr(0,TAU),d=rr(.5,R*.9),px=T.x+Math.cos(a)*d,pz=T.z+Math.sin(a)*d;if(BIO.mask(px,pz)<=0)continue;
  BIO.put('mossmat',[px,Y(px,pz)+.06,pz],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),rr(.6,1.6),bright(vary(C(pick([].concat(PAL.blush,PAL.powder,PAL.lavender,PAL.mint))),.02,.05,.04),1.0));}
 regTree(T,S,R,H+1);};

// 4 the CLOUD PINE: curved S-bole with real tapered curved boughs and dense layered needle pads
B[4]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,wind=T.wind||0,la=T.lean!=null?T.lean:rr(0,TAU);
 const n=8,pts=[];const sw=rr(.8,1.6),sway=rr(.1,.22)*H+wind*H*.35;
 for(let i=0;i<=n;i++){const t=i/n,s=Math.sin(t*Math.PI*sw)*sway*(1-.3*t)+wind*H*.5*t*t,side=Math.sin(t*Math.PI*1.3+1)*H*.08;
  pts.push({x:T.x+Math.cos(la)*s-Math.sin(la)*side,y:T.y0+t*H*(1-.18*wind),z:T.z+Math.sin(la)*s+Math.cos(la)*side,r:rb*(1-.75*t)*(1+.6*Math.exp(-t*9))});}
 limb(S,pts,st,{seg:8,lv,join:false});
 const hc=vary(pick(S.leaf),.02,.05,.04),nP=lv===2?ri(6,10):5;let spread=T.crownR*.55;
 const pad=(x,y,z,R)=>{const m=lv===2?ri(6,9):4;for(let c=0;c<m;c++){const a=rr(0,TAU),d=R*.58*Math.sqrt(rng());clumpAt('darkneedle',x+Math.cos(a)*d,y+rr(-.08,.24)*R*.3,z+Math.sin(a)*d,R*rr(.85,1.15),.45,hc,x,y-R*.5,z,R,R*.5,null);st.clumps++;}};
 for(let k=0;k<nP;k++){const t=lerp(.32,.92,k/Math.max(1,nP-1)),p=along(pts,t),a=(k%2?la+Math.PI:la)+rr(-.95,.95),L=T.crownR*rr(.55,1.05)*(1.12-t*.38),R=rr(1.2,2.3)*Math.min(1.3,H/10);
  const e=[p.x+Math.cos(a)*L,p.y+rr(-.1,.55),p.z+Math.sin(a)*L],m=[mix(p.x,e[0],.5),p.y-rr(.18,.65),mix(p.z,e[2],.5)];
  if(!clear3(e[0],e[1],e[2],R,1))continue;
  const bpts=arc([p.x,p.y,p.z],m,e,p.r*.58,.055,5);
  limb(S,bpts,st,{seg:6,lv,parentR:p.r});
  pad(e[0],e[1]+.24,e[2],R);spread=Math.max(spread,L+R);}
 const e=pts[n];pad(e.x,e.y+.2,e.z,rr(1.4,2.3)*Math.min(1.3,H/10));
 if(lv===2&&rng()<.4)mossAt(pts[1].x,pts[1].y+pts[1].r*.6,pts[1].z,rr(.4,.8));
 regTree(T,S,spread,H+1);};

// 5 the CUSHION TREE: braided branching stems that fork into every cushion dome (zero floating puffs!)
B[5]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,sc=Math.min(1.3,H/9),Rd=T.crownR*.74,dcY=T.y0+H*.68;
 const hc=vary(pick(S.leaf),.02,.05,.04),a0=rr(0,TAU);let nC=0;
 const cushion=(x,y,z,R,up)=>{const c=bright(vary(hc,.015,.05,.04),lerp(1.0,1.28,up));
  BIO.put('cushion',[x,y,z],qEuler(rr(-.14,.14),rr(0,TAU),rr(-.14,.14)),[R,R*rr(.70,.84),R],c);nC++;
  const nf=lv===2?3:1;for(let f=0;f<nf;f++){const a=rr(0,TAU);clumpAt('small',x+Math.cos(a)*R*.72,y+rr(-.15,.35)*R,z+Math.sin(a)*R*.72,R*rr(.55,.82),.58,c,x,y-R*.4,z,R,R*.6,null);st.clumps++;}};
 const nPrimary=lv===2?ri(6,9):5,forks=[];
 for(let k=0;k<nPrimary;k++){const a=a0+k/nPrimary*TAU+rr(-.22,.22),isInner=k%3===0;
  const reach=Rd*(isInner?rr(.18,.42):rr(.58,.92)),topY=dcY+Rd*(isInner?rr(.28,.52):rr(-.08,.22)),hh=topY-T.y0;
  const pts=[],n=6,tw=rr(1.2,2.4)*(k%2?1:-1);
  for(let i=0;i<=n;i++){const t=i/n,r=rb*(1-.58*t)*(1+.75*Math.exp(-t*6)),w=Math.sin(t*Math.PI)*.38,aa=a+tw*t*.3;
   pts.push({x:T.x+Math.cos(aa)*(reach*Math.pow(t,1.25)+.18)+Math.cos(a+1.57)*w,y:T.y0-.2+hh*t,z:T.z+Math.sin(aa)*(reach*Math.pow(t,1.25)+.18)+Math.sin(a+1.57)*w,r});}
  limb(S,pts,st,{seg:6,lv,join:false});
  const tip=pts[n],R0=rr(1.35,2.05)*sc*(isInner?1.08:.92);
  cushion(tip.x,tip.y+R0*.22,tip.z,R0,isInner?.9:.45);
  forks.push({m:along(pts,.62),a,isInner});}
 forks.forEach(fk=>{const nf=lv===2?2:1;
  for(let q=0;q<nf;q++){const sa=fk.a+(q===0?1:-1)*rr(.55,1.05),L=Rd*rr(.28,.48),el=fk.isInner?rr(.45,.85):rr(.18,.58);
   const sub=treeGrow({x:fk.m.x,y:fk.m.y,z:fk.m.z},dirOf(sa,el),L,fk.m.r*.68,Math.max(.04,fk.m.r*.32),4,.05,.1);
   limb(S,sub,st,{seg:5,lv,parentR:fk.m.r});
   const e=sub[4],Rs=rr(1.1,1.7)*sc;
   cushion(e.x,e.y+Rs*.2,e.z,Rs,clamp((e.y-dcY)/Rd+.5,0,1));}});
 st.cushions+=nC;regTree(T,S,T.crownR,H+1);};

// 6 the HAZE BLOSSOM: gnarled low trunk, forked boughs, rich iridescent blossom canopy
B[6]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU);
 const pts=treeGrow({x:T.x,y:T.y0-.3,z:T.z},dirOf(la,rr(1.2,1.45)),H*.42,rb,rb*.58,5,-.1,.18);limb(S,pts,st,{seg:8,lv,join:false});
 const o=pts[5],nB=lv===2?ri(6,9):5,a0=rr(0,TAU),violet=rng()<.15,base=violet?C(pick(PAL.lilac)):C(pick(S.leaf)),cy=T.y0+H*.8,spots=[];
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.26,.26),L=T.crownR*rr(.82,1.12),p=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(a,rr(.25,.62)),L,o.r*.62,.07,5,-.06,.18);
  if(!limbOk(p))continue;limb(S,p,st,{seg:6,lv,parentR:o.r});
  for(let i=1;i<=5;i++)spots.push(p[i]);
  subTwigs(S,p,.55,a,[.2,.58],L*.44,st,lv,spots,{curve:-.05});}
 spots.push({x:o.x,y:o.y+rr(.4,1.1),z:o.z});
 const cnt=lv===2?3:2;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('blossom',p.x+rr(-.55,.55),p.y+rr(-.2,.6),p.z+rr(-.55,.55),rr(2.1,3.2),.6,vary(base,.01,.04,.03),o.x,cy,o.z,T.crownR,H*.26,irid(PAL.irid.blossom));st.clumps++;}});
 if(lv===2)petals(T,ri(10,22),base);
 regTree(T,S,T.crownR,H+1);};

// 7 the LOTUS TRUMPET: fat fluted bole, curved arms, flaring lotus-fringed trumpets
B[7]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,ti=T.seed%3,nR=14;
 const rAt=u=>rb*(1-.45*u)*(1+.55*Math.exp(-u*H/2.2));
 const hB=H*rr(.34,.44),top=bole(T,S,hB,rAt,{fam:'barkT',flutes:7,fluteA:.10,twist:.05,buttress:.6,bh:1.6,nb:7,vs:4,spire:false});
 const leafC=tint(vary(pick(S.leaf),.02,.05,.04),means().bark[2],1.05);
 function trumpet(p,R,depth){const rings=[{x:p.x,y:p.y-.5,z:p.z,r:.32,yy:-1.5,col:barkCol(S,ti)}],n=lv===2?9:5,ph=rr(0,TAU);
  for(let i=0;i<=n;i++){const u=i/n,f=Math.pow(u,2.2),r=lerp(R*.08,R,f),yy=depth*u;rings.push({x:p.x,y:p.y+yy,z:p.z,r:r,yy:yy*3,col:barkCol(S,ti).clone().lerp(leafC,smooth(.2,.8,u))});}
  rings.push({x:p.x,y:p.y+depth+R*.04,z:p.z,r:R*1.06,yy:depth*3+1,col:bright(leafC,1.1)},{x:p.x,y:p.y+depth-R*.12,z:p.z,r:R*.8,yy:depth*3+2,col:shade(leafC,-.15)},{x:p.x,y:p.y+depth-R*.18,z:p.z,r:.05,yy:depth*3+3,col:shade(leafC,-.3)});
  st.trunk+=BIO.lathe('barkT',rings,lv===2?20:12,Math.max(1,Math.round(TAU*R/3)),3,(Rg,ang)=>Rg.r*(1+.06*Math.cos(nR*ang+ph)),(Rg,ang)=>.82+.18*Math.cos(nR*ang+ph));
  const nf=lv===2?Math.round(TAU*R/.85):lv===1?Math.round(TAU*R/1.7):0,ph2=rr(0,TAU),pr=pick(PAL.lilyPair);
  for(let k=0;k<nf;k++){const a=ph2+k/nf*TAU,rr2=R*rr(.98,1.08),x=p.x+Math.cos(a)*rr2,z=p.z+Math.sin(a)*rr2,y=p.y+depth+rr(.1,.35);
   BIO.put('lotusbloom',[x,y,z],qEuler(rr(-.2,.2),-a,rr(.8,1.2)),rr(.75,1.05)*Math.min(1.3,R/2.5),bright(vary(C(pr[k%2]),.02,.06,.04),1.1),{c2:bright(C(pr[(k+1)%2]),1.1)});st.blooms++;}
  if(lv===2&&rng()<.6){const cc=bright(C(pick(PAL.blush)),1.1);for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU),d=R*rr(.2,.6);BIO.put('cup',[p.x+Math.cos(a)*d,p.y+depth-R*.08,p.z+Math.sin(a)*d],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),rr(.5,.8),cc);st.blooms++;}}}
 const nA=lv===2?ri(5,8):ri(4,5),a0=rr(0,TAU),pRb=rAt(hB/H);let spread=T.crownR;
 for(let k=0;k<nA;k++){const a=a0+k*GOLD+rr(-.3,.3),reach=rr(2.5,T.crownR*1.9),rise=H*rr(.25,.6)-hB*.2,R=rr(1.6,3.2)*Math.min(1.3,H/15);
  const o=[top.x+Math.cos(a)*pRb*.42,top.y-rr(.2,1.2),top.z+Math.sin(a)*pRb*.42],e=[T.x+Math.cos(a)*reach,T.y0+hB+rise,T.z+Math.sin(a)*reach];
  const c=[mix(o[0],e[0],.75),mix(o[1],e[1],.15),mix(o[2],e[2],.75)];
  const pts=arc(o,c,e,pRb*.42,.3,5);if(!limbOk(pts,R*.6))continue;
  limb(S,pts,st,{fam:'barkT',seg:7,lv,parentR:pRb});
  trumpet({x:e[0],y:e[1],z:e[2]},R,R*rr(.55,.8));
  if(lv===2)for(let i=1;i<4;i++)if(rng()<.55){const p=pts[i];BIO.put('strand',[p.x,p.y-p.r,p.z],qEuler(0,rr(0,TAU),0),[rr(.3,.6),Math.max(1,p.y-T.y0-rr(0,2)),1],bright(vary(0xa89a7c,.02,.06,.06),1.05));}
  spread=Math.max(spread,reach+R);}
 {const ty=top.y+rr(1,H*.25),cpts=[{x:top.x,y:top.y-.6,z:top.z,r:pRb*.55},{x:top.x,y:mix(top.y,ty,.5),z:top.z,r:pRb*.42},{x:top.x,y:ty-.1,z:top.z,r:.32}];
  limb(S,cpts,st,{fam:'barkT',seg:7,lv,join:false});
  trumpet({x:top.x,y:ty,z:top.z},rr(2.8,4.2)*Math.min(1.3,H/15),rr(2,3));}
 regTree(T,S,spread,H+2);};

// 8 the WISTERIA TREE: twin braided stems, curved boughs & branchlets, broad canopy & curtains of lavender/white racemes
B[8]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,hT=H*rr(.45,.6),ph=rr(0,TAU),tops=[];
 for(let s=0;s<2;s++){const pts=[],n=8;for(let i=0;i<=n;i++){const t=i/n,a=ph+s*Math.PI+t*TAU*rr(.9,1.3),r=rb*.55*(1-.25*t)*(1+.5*Math.exp(-t*5)),w=rb*.52;
  pts.push({x:T.x+Math.cos(a)*w*(1-.3*t),y:T.y0-.25+hT*t,z:T.z+Math.sin(a)*w*(1-.3*t),r});}
  limb(S,pts,st,{seg:7,lv,join:false});tops.push(pts[n]);}
 const o=tops[0],nB=lv===2?ri(6,9):5,a0=rr(0,TAU),hc=C(pick(PAL.jade)),cy=T.y0+H*.8,white=rng()<.3;
 const boughList=[];
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.26,.26),L=T.crownR*rr(.78,1.12),pts=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(a,rr(.16,.52)),L,o.r*.65,.07,5,-.08,.18);
  if(!limbOk(pts))continue;limb(S,pts,st,{seg:6,lv,parentR:o.r});boughList.push(pts);
  if(lv===2){const m=along(pts,.55),sub=treeGrow({x:m.x,y:m.y,z:m.z},dirOf(a+rr(-.85,.85),rr(.08,.38)),L*.45,m.r*.65,.05,3,-.06,.14);
   if(limbOk(sub,.6)){limb(S,sub,st,{seg:5,lv,parentR:m.r});boughList.push(sub);}}}
 boughList.forEach(pts=>{
  for(let i=1;i<pts.length;i++){const p=pts[i];
   for(let c=0,nc=lv===2?2:1;c<nc;c++){clumpAt('broad',p.x+rr(-.55,.55),p.y+rr(.05,.65),p.z+rr(-.55,.55),rr(1.7,2.6),.5,hc,T.x,cy,T.z,T.crownR,H*.22,null);st.clumps++;}
   const m=lv===2?ri(3,6):2;for(let r=0;r<m;r++){const col=white?C(pick(PAL.ivory)):vary(C(pick(S.leaf)),.02,.06,.05);
    BIO.put('raceme',BIO.holdTo([p.x,p.y,p.z],[p.x+rr(-1.1,1.1),p.y+rr(-.15,.35),p.z+rr(-1.1,1.1)],p.r+.35),qEuler(0,rr(0,TAU),0),[rr(.45,.75),rr(1.2,2.6),1],bright(col,1.15),{c2:bright(C(white?0xe8e0f8:pick(PAL.irid.wisteria)),1.05)});st.racemes++;}}});
 regTree(T,S,T.crownR,H+1);};

// 9 the CHALICE TREE
B[9]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,la=rr(0,TAU),lk=rr(0,.03);
 const rAt=u=>rb*(1-.4*u)*(1+.4*Math.exp(-u*H/3));
 const top=bole(T,S,H*.96,rAt,{lean:[Math.cos(la)*lk,Math.sin(la)*lk],buttress:.5,bh:2,nb:6,vs:6,seg:lv===2?14:9});
 const cc=tint(vary(pick(S.leaf),.02,.05,.04),means().cap,.5);
 BIO.put('cap',[top.x,top.y+R*.08,top.z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[R,R,R],bright(cc,1.05));st.caps++;
 if(lv>=1){const n=lv===2?ri(14,22):8,a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.1,.1),x=top.x+Math.cos(a)*R*.97,z=top.z+Math.sin(a)*R*.97,h=rr(.5,1.1)*Math.min(1.3,R/6);
   BIO.put('rimgrass',[x,top.y+R*.1,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[h*.8,h,h*.8],leafCol(PAL.gold,1.25,.02,.05,.05));}
  const nt=lv===2?ri(5,9):3,b0=rr(0,TAU);
  for(let k=0;k<nt;k++){const a=b0+k/nt*TAU+rr(-.2,.2),x=top.x+Math.cos(a)*R*1.0,z=top.z+Math.sin(a)*R*1.0,g=Math.max(Y(x,z),BIO.waterH(x,z)),drop=top.y+R*.06-g;
   BIO.put('thread',[x,top.y+R*.06,z],qEuler(0,rr(0,TAU),0),[rr(.4,.8),drop,1],nearW(1.08));st.threads++;
   if(lv===2&&g>=Y(x,z)){BIO.put('mossmat',[x,g+.05,z],qEuler(0,rr(0,TAU),0),rr(1,2),leafCol(PAL.mossDark,1.1,.02,.05,.04));}}}
 if(lv===2){brackets(T.x,T.y0+rr(2,5),T.z,rAt(.15),ri(1,3),st);for(let k=0,m=ri(2,4);k<m;k++)mossAt(T.x+rr(-rb,rb),T.y0+rr(.3,2),T.z+rr(-rb,rb),rr(.5,1.1));}
 regTree(T,S,R*1.05,H+R*.2);};

// 10 the BELL-POD WILLOW: weeping pink limbs & secondary shoots, lush crown sprays, hanging bead-and-bell strings
B[10]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,lx=rr(-.08,.08),lz=rr(-.08,.08);
 const rAt=u=>rb*(1-.45*u)*(1+.4*Math.exp(-u*H/1.5));
 const top=bole(T,S,H*.5,rAt,{vs:3,seg:lv===2?10:7,lean:[lx,lz],spire:false});
 const nB=lv===2?ri(6,10):5,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.7,stemC=rodCol(S.bark[0],.05),pR=rAt(.5);
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.26,.26),L=R*rr(.78,1.08),pts=treeGrow({x:top.x,y:top.y-rr(0,.45),z:top.z},dirOf(a,rr(.32,.72)),L,pR*.54,.045,5,-.22,.12);
  if(!limbOk(pts,.6))continue;limb(S,pts,st,{seg:5,lv,col:stemC,parentR:pR});
  for(let i=1;i<=5;i++){const p=pts[i];
   for(let c=0,nc=lv===2?2:1;c<nc;c++){clumpAt('small',p.x+rr(-.4,.4),p.y+rr(-.05,.45),p.z+rr(-.4,.4),rr(1.15,1.8),.58,hc,T.x,cy,T.z,R,H*.3,null);st.clumps++;}
   const m=lv===2?ri(2,4):1;for(let r=0;r<m;r++){const x=p.x+rr(-.55,.55),z=p.z+rr(-.55,.55),y=p.y-p.r,Lb=Math.max(.6,Math.min(rr(1.2,3.2)*Math.min(1.3,H/6),y-Math.max(Y(x,z),BIO.waterH(x,z))-.4));
    BIO.put('beads',[x,y,z],qEuler(0,rr(0,TAU),0),OIDONG.CARD.beadscard?[Lb*.17,Lb,Lb*.17]:[Lb*.28,Lb,Lb*.28],OIDONG.CARD.beadscard?nearW(rr(.95,1.08)):leafCol(PAL.mint,1.2,.02,.05,.04));st.beads++;
    if(lv===2&&!OIDONG.CARD.beadscard){const bs=rr(.22,.34);BIO.put('bell',[x,y-Lb*.97,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[bs,bs*1.3,bs],bright(vary(C(pick(PAL.coral)),.02,.06,.05),1.15));st.bells++;}}}}
 clumpAt('small',top.x,top.y+.5,top.z,rr(1.5,2.2),.62,hc,T.x,cy,T.z,R,H*.3,null);st.clumps++;
 regTree(T,S,R,H+.5);};

// 11 the JADE BAMBOO: lush clumps of ringed jade culms arching gracefully into multi-tiered feathery leaf sprays
B[11]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,n=lv===2?ri(8,14):ri(5,7),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.78;
 const vs=BIO.bucket('bark5').uvScale[1];
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?R*.48*Math.sqrt(rng()):0,x0=T.x+Math.cos(a)*d,z0=T.z+Math.sin(a)*d,h=H*rr(.68,1.06),lean=rr(.03,.11),la=a+rr(-.45,.45),pts=[];
  for(let i=0;i<=6;i++){const t=i/6,s=lean*h*t*t+(t>.58?Math.pow(t-.58,1.8)*h*1.15:0);
   pts.push({x:x0+Math.cos(la)*s,y:T.y0-.2+h*t,z:z0+Math.sin(la)*s,r:rb*(1-.58*t)});}
  st.trunk+=BIO.tube('bark5',pts,barkCol(S,k),{seg:lv===2?6:4,cap:true,vscale:vs});
  const m=lv===2?ri(6,9):ri(4,5);
  for(let c=0;c<m;c++){const u=lerp(.42,.99,(c+.35)/m),p=along(pts,u),ta=la+c*GOLD+rr(-.4,.4),tL=(.45+.55*(1-u))*rr(.55,1.1);
   const tx=p.x+Math.cos(ta)*tL,ty=p.y+tL*rr(.15,.45),tz=p.z+Math.sin(ta)*tL;
   if(lv===2&&c%2===0){const tw=[{x:p.x,y:p.y,z:p.z,r:Math.max(.015,p.r*.48)},{x:mix(p.x,tx,.55),y:mix(p.y,ty,.6),z:mix(p.z,tz,.55),r:.015},{x:tx,y:ty,z:tz,r:.008}];
    st.limb+=BIO.tube('bark5',tw,barkCol(S,k),{seg:4,cap:true,vscale:vs});}
   const sz=rr(1.5,2.4)*(1.08-.22*u);
   clumpAt('bambooleaf',mix(p.x,tx,.65),mix(p.y,ty,.65),mix(p.z,tz,.65),sz,.65,hc,T.x,cy,T.z,R*1.25,H*.32,null);st.clumps++;}}
 regTree(T,S,R*1.15,H+.5);};

// 12 the MOSS-BALL TREE: gnarled dark trunk forking cleanly into every moss dome (zero hollow pipes or detached balls),
// softened with peripheral foliage sprays
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,balls=[];let reach=R*.4,top=T.y0+H*.5;
 const hc=vary(pick(S.leaf),.02,.05,.04);
 function fork(o,d,len,r,depth,pR){const pts=treeGrow(o,d,len,r,r*.56,4,-.03,.17);
  limb(S,pts,st,{seg:depth?5:7,lv,join:depth>0,parentR:pR});
  const e=pts[4];balls.push({x:e.x,y:e.y,z:e.z,R:rr(.95,1.65)*(1-.14*depth)*Math.min(1.3,H/9)});
  if(depth<2&&rng()<.85){const m=pts[2];balls.push({x:m.x,y:m.y+m.r*.35,z:m.z,R:rr(.65,1.15)*Math.min(1.3,H/9)});}
  reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+1.5);top=Math.max(top,e.y+1.5);
  if(depth>=2)return;
  const nf=depth===0?ri(2,3):(lv===2?ri(2,3):2),a0=Math.atan2(d[2],d[0]);
  for(let k=0;k<nf;k++){const a=a0+(k-(nf-1)/2)*rr(.85,1.3)+rr(-.2,.2),el=rr(.38,.98),dd=dirOf(a,el);
   if(clear3(e.x+dd[0]*2,e.y+dd[1]*2,e.z+dd[2]*2,.6,.6))fork({x:e.x,y:e.y,z:e.z},dd,len*rr(.56,.8),e.r*.88,depth+1,e.r);}}
 fork({x:T.x,y:T.y0-.3,z:T.z},dirOf(rr(0,TAU),rr(1.2,1.5)),H*.4,rb,0,rb);
 balls.forEach(b=>{const c=bright(vary(hc,.015,.05,.04),rr(1.05,1.25));
  BIO.put('mossdome',[b.x,b.y,b.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[b.R,b.R*rr(.82,.96),b.R],c);st.balls++;
  const nf=lv===2?3:1;for(let f=0;f<nf;f++){const a=rr(0,TAU);
   clumpAt('small',b.x+Math.cos(a)*b.R*.74,b.y+rr(-.15,.35)*b.R,b.z+Math.sin(a)*b.R*.74,b.R*rr(.55,.82),.58,c,b.x,b.y-b.R*.4,b.z,b.R,b.R*.6,null);st.clumps++;}});
 regTree(T,S,reach,top-T.y0+1);};

// 13 the PAPER MAPLE: slender leaning bole, forked tiered boughs, rich coral & peach palmate tiers
B[13]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,lx=rr(-.1,.1),lz=rr(-.1,.1);
 const rAt=u=>rb*(1-.5*u)*(1+.3*Math.exp(-u*H/1.5));
 const top=bole(T,S,H*.45,rAt,{vs:3,seg:lv===2?10:7,lean:[lx,lz],spire:false});
 const nB=lv===2?ri(4,7):4,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.8,tiers=[];
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.26,.26),u=rr(.55,1),yy=H*.45*u,pR=rAt(.45*u),o={x:T.x+lx*yy,y:T.y0+yy,z:T.z+lz*yy};
  const L=R*rr(.78,1.12),pts=treeGrow(o,dirOf(a,rr(.14,.44)),L,pR*.54,.05,4,.02,.12);
  if(!limbOk(pts,.6))continue;limb(S,pts,st,{seg:5,lv,parentR:pR});
  for(let i=1;i<=4;i++)tiers.push(pts[i]);
  subTwigs(S,pts,.55,a,[.1,.38],L*.44,st,lv,tiers,{curve:.02});}
 tiers.push({x:top.x,y:top.y+rr(.4,1.1),z:top.z});
 const cnt=lv===2?3:2;tiers.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('maple',p.x+rr(-.55,.55),p.y+rr(-.08,.38),p.z+rr(-.55,.55),rr(1.6,2.5)*Math.min(1.3,H/8),.38,hc,T.x,cy,T.z,R,H*.26,null);st.clumps++;}});
 if(lv===2&&tiers.length&&rng()<.5)coinVine(tiers[0],st);
 regTree(T,S,R,H+.5);};

// 14 the TEMPLE CEDAR: straight fluted column with swept tapered boughs from 20% height to the spire & dense evergreen foliage
B[14]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb;
 const rAt=u=>rb*(1-.8*u)*(1+.5*Math.exp(-u*H/2));
 bole(T,S,H*.97,rAt,{flutes:7,fluteA:.06,buttress:.7,bh:2,nb:6,vs:5,seg:lv===2?12:8});
 const tiers=Math.max(5,lv===2?Math.round(H/1.5):Math.round(H/2.4)),hc=vary(pick(S.leaf),.02,.05,.04);
 for(let t=0;t<tiers;t++){const u=lerp(.20,.97,t/(tiers-1)),y=T.y0+H*u,pR=rAt(u),Rt=T.crownR*Math.pow(1-u*.88,.72)*rr(.88,1.14)+.55,nB=lv===2?ri(5,7):4,a0=t*GOLD;
  for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.22,.22),ex=T.x+Math.cos(a)*Rt,ez=T.z+Math.sin(a)*Rt,ey=y-Rt*.08;
   const m=[mix(T.x,ex,.55),y-Rt*.16,mix(T.z,ez,.55)],bpts=arc([T.x,y,T.z],m,[ex,ey+.12,ez],Math.max(.04,pR*.38),.03,4);
   if(Rt>.9)limb(S,bpts,st,{seg:5,lv,parentR:pR});
   const mc=lv===2?(Rt>2.2?3:2):(Rt>2.2?2:1);
   for(let c=0;c<mc;c++){const bp=along(bpts,lerp(.38,.95,(c+.5)/mc)),sz=Math.max(1.15,Rt*rr(.48,.68));
    clumpAt('darkneedle',bp.x,bp.y+sz*.06,bp.z,sz,.55,hc,T.x,y,T.z,Rt+1,Rt*.6+1,null);st.clumps++;}}}
 for(let s=0;s<3;s++){clumpAt('darkneedle',T.x+rr(-.2,.2),T.y0+H*(.95+.025*s),T.z+rr(-.2,.2),1.4-.25*s,.85,hc,T.x,T.y0+H,T.z,2,2,null);st.clumps++;}
 regTree(T,S,T.crownR,H+1);};

// 15 the CAMPHOR LAUREL: heavy buttressed bole, forked ascending limbs, lush dark glossy dome
B[15]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const rAt=u=>rb*(1-.55*u)*(1+.4*Math.exp(-u*H/2.5));
 const top=bole(T,S,H*.32,rAt,{buttress:.6,bh:2.5,nb:6,vs:5,seg:lv===2?14:9,spire:false});
 const nB=lv===2?ri(6,9):5,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.68,spots=[];let reach=R*.55;
 for(let k=0;k<nB;k++){const u=rr(.55,1),pR=rAt(.32*u),p={x:T.x,y:T.y0+H*.32*u,z:T.z},a=a0+k*GOLD,el=rr(.42,.92),L=R*rr(.76,1.06);
  const pts=treeGrow(p,dirOf(a,el),L,pR*.58,.09,5,-.1,.12);if(!limbOk(pts,1))continue;
  limb(S,pts,st,{seg:7,lv,parentR:pR});
  for(let i=2;i<=5;i++)spots.push(pts[i]);
  subTwigs(S,pts,.55,a,[.3,.75],L*.46,st,lv,spots,{curve:-.06});
  if(lv===2)subTwigs(S,pts,.78,a+.35,[.2,.6],L*.34,st,lv,spots,{curve:-.05});
  const e=pts[5];reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+R*.3);}
 spots.push({x:top.x,y:top.y+rr(.4,1.3),z:top.z});
 const cnt=lv===2?3:2;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('gloss',p.x+rr(-.7,.7),p.y+rr(-.2,.8),p.z+rr(-.7,.7),rr(2.3,3.5)*Math.min(1.3,H/16),.58,hc,T.x,cy,T.z,R,H*.3,irid(PAL.irid.gloss));st.clumps++;}});
 if(lv===2){brackets(T.x,T.y0+rr(1,2.5),T.z,rAt(.08),ri(1,3),st);}
 regTree(T,S,reach,H+1);};

// 16 the PAGODA FIR: straight bole, swept pagoda whorls of tapered limbs & dense layered needle plates up to the spire
B[16]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const rAt=u=>rb*(1-.8*u)*(1+.4*Math.exp(-u*H/2));
 bole(T,S,H*.98,rAt,{vs:5,seg:lv===2?11:8});
 const tiers=lv===2?ri(7,11):6,hc=vary(pick(S.leaf),.02,.05,.04),a0=rr(0,TAU);
 for(let t=0;t<tiers;t++){const u=lerp(.18,.93,t/(tiers-1)),y=T.y0+H*u,pR=rAt(u),Rt=R*Math.pow(1-.78*u,.85)*rr(.92,1.12)+.55,nB=lv===2?ri(6,8):5;
  for(let k=0;k<nB;k++){const a=a0+t*.48+k/nB*TAU,ex=T.x+Math.cos(a)*Rt,ez=T.z+Math.sin(a)*Rt;
   const m=[mix(T.x,ex,.55),y-Rt*.04,mix(T.z,ez,.55)],bpts=arc([T.x,y,T.z],m,[ex,y+Rt*.1,ez],Math.max(.035,pR*.4),.028,4);
   limb(S,bpts,st,{seg:5,lv,parentR:pR});
   const mc=lv===2?(Rt>2.2?3:2):2;
   for(let c=0;c<mc;c++){const f=lerp(.32,.96,(c+.5)/mc),bp=along(bpts,f),sz=Math.max(1.1,Rt*rr(.44,.6));
    clumpAt('darkneedle',bp.x,bp.y+.08,bp.z,sz,.36,hc,T.x,y-Rt*.3,T.z,Rt+1,Rt*.5+1,null);st.clumps++;}}}
 BIO.put('cone',[T.x,T.y0+H*.94,T.z],qUp([0,1,0]),[rAt(.9)*3.2+.15,H*.09,rAt(.9)*3.2+.15],hc);
 clumpAt('darkneedle',T.x,T.y0+H*.95,T.z,1.35,.75,hc,T.x,T.y0+H,T.z,2,2,null);st.clumps++;
 regTree(T,S,R,H+1);};

// ---------------------------------------------------------------- the diversity pass (the owner's reference pictures, 2026-10-26)
// 17 the CLOUD-PAD TREE: rooted gnarled bonsai bole, sweeping S-curved boughs, layered jade cloud pads
B[17]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,hc=vary(pick(PAL.jade.concat(PAL.celadon)),.02,.05,.04),a0=rr(0,TAU),ph=rr(0,TAU);
 const lean=H*rr(.16,.30),pts=[];let reach=R*.6,top=T.y0+H;
 for(let i=0;i<=7;i++){const t=i/7,s=Math.sin(t*Math.PI*1.35+ph)*lean*(.35+.65*t);
  pts.push({x:T.x+Math.cos(a0)*s-Math.sin(a0)*s*.35,y:T.y0-.35+H*t*.92,z:T.z+Math.sin(a0)*s+Math.cos(a0)*s*.35,r:rb*1.35*(1-.68*t)*(1+.45*Math.exp(-t*6))});}
 limb(S,pts,st,{seg:8,lv,join:false});
 const drawPad=(cx,cy,cz,Rp)=>{
  BIO.put('cushion',[cx,cy,cz],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[Rp*.78,Rp*.34,Rp*.78],bright(vary(hc,.015,.04,.04),rr(1.08,1.24)));st.cushions++;
  const m=lv===2?(Rp>2.0?5:4):3;
  for(let c=0;c<m;c++){const ca=c/m*TAU+rr(-.22,.22),cr=Rp*rr(.44,.66),s2=Rp*rr(.34,.46);
   BIO.put('cushion',[cx+Math.cos(ca)*cr,cy+rr(-.06,.10),cz+Math.sin(ca)*cr],qEuler(0,rr(0,TAU),0),[s2,s2*.52,s2],bright(vary(hc,.015,.04,.04),rr(1.05,1.25)));st.cushions++;
   clumpAt('darkneedle',cx+Math.cos(ca+.35)*Rp*.64,cy+.08,cz+Math.sin(ca+.35)*Rp*.64,Rp*rr(.62,.86),.42,hc,cx,cy-.4,cz,Rp+.5,.9,null);st.clumps++;}
  reach=Math.max(reach,Math.hypot(cx-T.x,cz-T.z)+Rp);top=Math.max(top,cy+Rp*.45);};
 const nB=lv===2?ri(5,7):4;
 for(let k=0;k<nB;k++){const u=lerp(.36,.88,k/Math.max(1,nB-1)),b=along(pts,u),ba=a0+k*GOLD+rr(-.25,.25),L=R*rr(.58,.98)*(1.1-.3*u);
  const ex=b.x+Math.cos(ba)*L,ez=b.z+Math.sin(ba)*L,ey=b.y+L*rr(.08,.28);
  const bpts=arc([b.x,b.y,b.z],[mix(b.x,ex,.5),b.y-L*.10,mix(b.z,ez,.5)],[ex,ey,ez],Math.max(.05,b.r*.64),Math.max(.035,b.r*.28),5);
  limb(S,bpts,st,{seg:6,lv,parentR:b.r});
  drawPad(ex,ey+.14,ez,R*rr(.42,.64)*(1.08-.22*u));
  if(lv===2&&k<nB-1&&rng()<.65){const m2=along(bpts,.54),sa=ba+(k%2?1:-1)*rr(.65,1.1),sl=L*rr(.42,.58),sx2=m2.x+Math.cos(sa)*sl,sz2=m2.z+Math.sin(sa)*sl,sy2=m2.y+sl*rr(.08,.24);
   limb(S,arc([m2.x,m2.y,m2.z],[mix(m2.x,sx2,.5),m2.y-.06,mix(m2.z,sz2,.5)],[sx2,sy2,sz2],m2.r*.68,Math.max(.03,m2.r*.34),4),st,{seg:5,lv,parentR:m2.r});
   drawPad(sx2,sy2+.12,sz2,R*rr(.30,.46));}}
 const tip=pts[7];drawPad(tip.x,tip.y+.16,tip.z,R*rr(.48,.68));
 if(lv===2)mossAt(T.x,T.y0+.32,T.z,rr(.5,.85));
 regTree(T,S,reach,top-T.y0+.5);};

// 18 the STUPA TREE
B[18]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,hc=vary(pick(S.leaf),.02,.05,.04);
 const rAt=u=>rb*(1-.6*u)*(1+.6*Math.exp(-u*H/1.5));
 bole(T,S,H*.96,rAt,{vs:6,seg:lv===2?9:6});
 const nT=lv===2?ri(5,7):4,a0=rr(0,TAU);
 for(let t=0;t<nT;t++){const f=t/(nT-1),u=lerp(.40,.87,f),y=T.y0+H*u,Rd=R*(1-.6*f)*rr(.9,1.1),c0=bright(vary(hc,.015,.04,.04),rr(1.12,1.25));
  BIO.put('cushion',[T.x,y,T.z],qEuler(0,rr(0,TAU),0),[Rd*.74,Rd*.52,Rd*.74],c0);st.cushions++;
  const np=lv===2?(Rd>2?5:4):3;
  for(let k=0;k<np;k++){const a=a0+t*GOLD+k/np*TAU,d=Rd*rr(.5,.62),s=Rd*rr(.38,.5);
   BIO.put('cushion',[T.x+Math.cos(a)*d,y+rr(-.15,.25)*Rd*.4,T.z+Math.sin(a)*d],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s*.78,s],bright(vary(hc,.015,.04,.04),rr(1.08,1.28)));st.cushions++;}}
 BIO.put('cone',[T.x,T.y0+H*.88,T.z],qUp([0,1,0]),[rAt(.9)*3+.2,H*.13,rAt(.9)*3+.2],shade(C(hc.getHex()),-.15));
 if(T.saplings&&lv===2)T.saplings.forEach(p=>{const g=Y(p[0],p[1]),h=p[2];BIO.beam('rod',[p[0],g-.1,p[1]],[p[0],g+h*.55,p[1]],.032,.032,rodCol(S.bark[0],-.1));
  BIO.put('cushion',[p[0],g+h*.62,p[1]],qEuler(0,rr(0,TAU),0),[h*.26,h*.36,h*.26],bright(vary(hc,.02,.05,.05),1.1));
  BIO.put('cone',[p[0],g+h*.86,p[1]],qUp([0,1,0]),[h*.08,h*.22,h*.08],shade(C(hc.getHex()),-.1));st.cushions++;});
 regTree(T,S,R+.5,H+.5);};

// 19 the LATTICE TREE
B[19]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,la=rr(0,TAU),lean=rr(.16,.26),fy=H*.5;
 const ax=u=>({x:T.x+Math.cos(la)*lean*fy*u*u*1.6,y:T.y0+fy*u,z:T.z+Math.sin(la)*lean*fy*u*u*1.6});
 const nS=lv===2?7:5,tw=rr(1.0,1.4)*Math.PI,php=rr(0,TAU);
 for(let s=0;s<nS;s++){const ph=php+s/nS*TAU,dir=s%2?1:-1,pts=[];
  for(let i=0;i<=10;i++){const u=i/10,c=ax(u),r=rb*(1.25-.5*u+.35*Math.exp(-u*7)),a=ph+dir*tw*u;
   pts.push({x:c.x+Math.cos(a)*r,y:c.y-(i?0:.4),z:c.z+Math.sin(a)*r,r:rb*(.15-.04*u)*(1+.5*Math.exp(-u*7))});}
  limb(S,pts,st,{seg:6,lv,join:false});}
 const F=ax(1),grn=[S.leaf[0],S.leaf[2]],blu=[S.leaf[1],S.leaf[3],0x98b4d8],vio=[0xb89ad8,0xc4a8e0,0xa890d0],cups=[];let reach=R*.6;
 const nL=lv===2?ri(5,7):5;
 for(let k=0;k<nL;k++){const a=la+k/nL*TAU+rr(-.3,.3)+(k%2?.0:.2),L=R*rr(.55,1.0),e=[F.x+Math.cos(a)*L,F.y+H*rr(.18,.45),F.z+Math.sin(a)*L];
  const c=[F.x+Math.cos(a)*L*.35,F.y+H*.3,F.z+Math.sin(a)*L*.35],pts=arc([F.x,F.y,F.z],c,e,rb*.42,.14,8);
  limb(S,pts,st,{seg:6,lv,parentR:rb*.6});
  cups.push({x:e[0],y:e[1],z:e[2],R:rr(1.5,2.5)});reach=Math.max(reach,L+2.5);
  if(lv===2&&rng()<.7){const m=along(pts,.55),b2=rr(-1.2,1.2)+a,l2=L*rr(.3,.45),e2=[m.x+Math.cos(b2)*l2,m.y+rr(.6,1.8),m.z+Math.sin(b2)*l2];
   limb(S,arc([m.x,m.y,m.z],[(m.x+e2[0])/2,e2[1],(m.z+e2[2])/2],e2,m.r*.7,.1,5),st,{seg:5,lv,parentR:m.r});cups.push({x:e2[0],y:e2[1],z:e2[2],R:rr(1.0,1.7)});}}
 cups.forEach(cp=>{BIO.put('saucer',[cp.x,cp.y,cp.z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[cp.R,cp.R,cp.R],leafCol(grn,1.35,.02,.05,.05));
  const nu=lv===2?ri(5,8):3;for(let i=0;i<nu;i++){const a=rr(0,TAU),d=cp.R*.62*Math.sqrt(rng()),h=rr(.5,.95)*Math.min(1.2,cp.R*.5);
   BIO.put('umbrella',[cp.x+Math.cos(a)*d,cp.y+.05,cp.z+Math.sin(a)*d],qEuler(rr(-.22,.22),rr(0,TAU),rr(-.22,.22)),[h*1.5,h,h*1.5],leafCol(blu,1.1,.02,.05,.05));}
  if(lv===2)for(let j=0,nv=ri(1,2);j<nv;j++){const a=rr(0,TAU),d=cp.R*rr(.3,.7);for(let b=0;b<3;b++)BIO.put('ball',[cp.x+Math.cos(a)*d+rr(-.12,.12),cp.y+rr(.35,.6),cp.z+Math.sin(a)*d+rr(-.12,.12)],qEuler(0,0,0),rr(.1,.16),leafCol(vio,1.1,.02,.05,.05));}
  st.caps++;});
 regTree(T,S,reach,H+2);};

// PLACEMENT of the three (core/rand: each cell is seeded from a hash of (the kit's seed, the species, the cell), never from
// how many draws came before it; each tree's builder runs on its own reseeded stream). Data, as the passes above are.
OIDONG.NEWPASSES=[
 // cloud-pads: the flats in the wind, the terraces and the crags' edges
 {sp:17,cell:36,accept:(Z)=>Z.flats*.2+Z.terrace*.12+Z.crag*.14+Z.meadow*.02,opt:{pad:4,small:true,keep:6}},
 // stupa trees: groups of three to five in the mist at the valley's head and in the moss woods
 {sp:18,cell:120,accept:(Z)=>Z.mistZ*.55+Z.moss*.2+Z.shore*.05,opt:{pad:6,group:[3,5],keep:3}},
 // lattice trees: a handful of landmarks on the open floor, far apart
 {sp:19,landmarks:4,spacing:700,accept:(Z)=>Z.meadow*.7+Z.flats*.35+Z.shore*.1,opt:{pad:14,keep:14}},
];
function placeNew(R,q,st,LOD){const TREES=OIDONG.TREES,o=BIO.center(),NEW=[];
 const mkT=(sp,x,y,z,s,hk)=>{const S=SP[sp];return{x:x,z:z,y0:y-.35,sp:sp,H:s.range(S.H[0],S.H[1])*(hk==null?1:hk),rb:s.range(S.rb[0],S.rb[1]),crownR:s.range(S.crownR[0],S.crownR[1]),seed:s.int(0,999999),wet:BIO.field('wet',x,z)};};
 const lvOf=(x,z,small)=>{const ld=BIO.lodD(x,z);return ld<LOD.hero*(small?.94:1)?2:(ld<LOD.mid*(small?.87:1)?1:0);};
 const ok=(x,z,pad)=>BIO.mask(x,z)>0&&BIO.clearOf(x,z,pad)&&!blocked(x,z,pad);
 const add=(T,P)=>{if(offShore(T))return;T.lv=lvOf(T.x,T.z,P.opt.small);NEW.push(T);hadd({x:T.x,z:T.z,r:P.opt.keep==null?T.rb*1.4+1:P.opt.keep});};
 OIDONG.NEWPASSES.forEach(P=>{const S=SP[P.sp],seed=KRAND.child(550019,'oidong/'+S.key),pad=P.opt.pad==null?4:P.opt.pad;
  if(P.landmarks){const C=[];   // score every point of a coarse lattice, then take the best ones far enough apart
   for(let z=o[1]-R;z<=o[1]+R;z+=40)for(let x=o[0]-R;x<=o[0]+R;x+=40){if(Math.hypot(x-o[0],z-o[1])>R-60)continue;const a=P.accept(zones(x,z),x,z);if(a<=.3)continue;
    C.push([a+.05*KRAND.unit(KRAND.hash(seed,x,z)),x,z]);}
   C.sort((a,b)=>b[0]-a[0]);const got=[];
   for(const c of C){if(got.length>=P.landmarks)break;if(got.some(g=>Math.hypot(g[1]-c[1],g[2]-c[2])<P.spacing))continue;if(!ok(c[1],c[2],pad))continue;
    got.push(c);const T=mkT(P.sp,c[1],Y(c[1],c[2]),c[2],KRAND.stream(KRAND.hash(seed,c[1],c[2])));add(T,P);T.lv=2;}   /* a landmark is always the hero */
   return;}
  const N=Math.ceil(R*2/P.cell);
  for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){const s=KRAND.stream(KRAND.cell(seed,ix,iz));
   const x=o[0]-R+(ix+s.next())*P.cell,z=o[1]-R+(iz+s.next())*P.cell,u=s.next();if(Math.hypot(x-o[0],z-o[1])>R)continue;
   const a=P.accept(zones(x,z),x,z)*q;if(a<=0||u>a*(.7+.6*KRAND.fbm(x*.01,0,z*.01,2,seed)))continue;
   if(!ok(x,z,pad))continue;
   if(!P.opt.group){add(mkT(P.sp,x,Y(x,z),z,s),P);continue;}
   const n=s.int(P.opt.group[0],P.opt.group[1]),a0=s.range(0,TAU);let first=null;
   for(let j=0;j<n;j++){const aa=a0+j*GOLD,d=j?s.range(4,9):0,px=x+Math.cos(aa)*d,pz=z+Math.sin(aa)*d;if(j&&!ok(px,pz,2.5))continue;
    if(j&&zones(px,pz).cliff>.3)continue;
    const T=mkT(P.sp,px,Y(px,pz),pz,s,j?s.range(.55,.9):1);add(T,P);if(!first){first=T;T.saplings=[];}}
   if(first)for(let k=0,m=s.int(2,4);k<m;k++){const aa=s.range(0,TAU),d=s.range(2.5,7);first.saplings.push([x+Math.cos(aa)*d,z+Math.sin(aa)*d,s.range(.8,1.8)]);}}});
 NEW.forEach(T=>{TREES.push(T);const i=TREES.length-1;if(T.lv===0){FAR(T,i);st.fars++;}else{reseed(KRAND.hash(550019,T.sp,T.seed));B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 st.newTrees=NEW.length;}

// ---------------------------------------------------------------- impostors (the far canopy)
// far.blobs: icosahedral blobs on a pole (sedesert's recipe, as shighlands)
// a tree whose bole would reach past the water's edge goes (OIDONG.SHORE: the host's WATER.fieldAt shore distance, the review's third line; a page
// without it keeps the old mask alone). Tested after the tree's draws, so nothing else moves
const offShore=T=>{if(!OIDONG.SHORE)return false;const s=OIDONG.SHORE(T.x,T.z);return s===s&&s<Math.min(T.rb==null?.5:T.rb,.6)+.3;};
let ICO=null,FAR=(T,i)=>{};   /* FAR: a far tree's draw, set by buildTrees (the impostor or the blobs) */
function buildFar(T,fi,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 const kk=BIO._lodKey(T.x,T.z),F=S.far||{poleU:.35,blobs:[]};
 const FB=S.farBark||S.bark,bc=C(FB[fi%FB.length]).convertSRGBToLinear();
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.1*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.6+.4*smooth(-.7,.8,dy))*(.92+.16*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const seg=4,taper=F.taper==null?.4:F.taper,top=T.y0+T.H*F.poleU;
 const rings=[0,.06,.5,1].map(u=>{const sh=.75+.25*u*.75;return{x:T.x,y:T.y0+(top-T.y0)*u,z:T.z,r:Math.max(.2,T.rb*(1-taper*u)*(u<.08?1.5:1)),yy:u,col:[bc.r*sh,bc.g*sh,bc.b*sh]};});
 st.far+=BIO.lathe('far',rings,seg,1,1,(Rg,a)=>Rg.r,null);
 const L=S.leaf.map(h=>bright(h,.95)),R=T.crownR,a0=(T.seed%628)/100;
 const colOf=c=>typeof c==='number'?c:c==='L0'?L[fi%L.length]:L[+c[1]%L.length];
 F.blobs.forEach((b,bi)=>{const y=T.y0+T.H*b[0],rx=R*b[1],ry=T.H*b[2];blob(T.x+Math.cos(a0+bi)*R*.1,y,T.z+Math.sin(a0+bi)*R*.1,rx,ry,colOf(b[3]),colOf(b[4]),fi+bi);});
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
SP.forEach((S,i)=>{if(typeof B[i]!=='function')BIO.err('oidong: no builder for species '+i+' '+S.key);});
const newStats=()=>({trunk:0,limb:0,far:0,clumps:0,pads:0,blooms:0,pods:0,roots:0,epi:0,vines:0,cushions:0,racemes:0,caps:0,threads:0,beads:0,bells:0,balls:0,heroes:0,fars:0,byS:SP.map(()=>0)});
OIDONG.buildTrees=function(R,q){
 reseed(550019);q=q==null?1:q;R=R||2500;means();
 const st=newStats();
 const TREES=OIDONG.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const LOD=BIO.LOD();
 function pass(P){const sp=P.sp,S=SP[sp],opt=P.opt||{},pad=opt.pad==null?4:opt.pad,small=!!opt.small,hero=LOD.hero*(small?.94:1),mid=LOD.mid*(small?.87:1);let n=0;
  const gopt={patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,pad:pad+2};
  if(opt.water){gopt.noMask=true;gopt.depth=[.5,9];gopt.box=BIO.window('water');gopt.pad=pad;}
  BIO.grid(P.cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=P.accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{if(blocked(x,z,pad))return;
    const T=OIDONG.make(sp,x,opt.water?BIO.waterH(x,z)+.4:y,z);if(opt.mod)opt.mod(T,zones(x,z));
    const ld=BIO.lodD(x,z);T.lv=ld<hero?2:(ld<mid?1:0);
    if(T.lv===0&&!S.far)return;
    if(!opt.water&&offShore(T))return;
    TREES.push(T);hadd({x:x,z:z,r:(opt.water?T.crownR*.9:T.rb*1.4)+1});n++;},gopt);
  return n;}
 OIDONG.PASSES.forEach(pass);
 // OCTAHEDRAL IMPOSTORS (core/biome 34-core-impostor.js, R6; nwlowlands' lines; on when the page lists it, OIDONG.IMPOSTORS false or ?diet=0 turns them off):
 // a far tree is one quad showing its species baked from 8 x 8 directions, in place of the blobs; every species on one atlas, one item. Each species bakes
 // one of its own heroes, built again in place after the bake with its registration muted (its own stream then, so no tree here moves)
 const IMPON=OIDONG.IMPOSTORS==null?typeof BIO.impostor==='function':!!OIDONG.IMPOSTORS,IMPS=[],ISET=IMPON?BIO.impostorSet('oidong.trees',{label:'Far trees'}):null;
 if(IMPON)SP.forEach((S,sp)=>{if(!S.far)return;const T0=TREES.find(T=>T.sp===sp&&T.lv===2)||TREES.find(T=>T.sp===sp&&T.lv===1);if(!T0)return;
  const T1=Object.assign({},T0),st1=newStats();
  const rec=BIO.impostor('oidong.'+S.key,()=>{const R0=BIO.host.register;BIO.host.register=()=>{};try{reseed(KRAND.hash(550019,sp,T1.seed));B[sp](Object.assign({},T1),st1,2);}finally{BIO.host.register=R0;}},{set:ISET,at:[T1.x,T1.y0,T1.z],label:S.name+' (far)'});
  if(rec)IMPS[sp]={rec,H:T1.H};});
 if(IMPON&&ISET.recs.length)BIO.impostorItem('impTrees',ISET,{label:'Far trees'});
 FAR=(T,i)=>{const I=IMPS[T.sp];if(I){BIO.impostorPut('impTrees',I.rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/I.H,null);st.far+=2;return;}buildFar(T,i,st);};
 TREES.forEach((T,i)=>{if(T.lv===0){FAR(T,i);st.fars++;}else{reseed(KRAND.hash(550019,T.sp,T.seed));B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 placeNew(R,q,st,LOD);   /* the diversity pass (2026-10-26): its own KRAND streams, after everything above, so nothing above moves */
 OIDONG.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),clumps:st.clumps,pads:st.pads,blooms:st.blooms,pods:st.pods,
  caps:st.caps,threads:st.threads,beads:st.beads,bells:st.bells,balls:st.balls,racemes:st.racemes,cushions:st.cushions,brackets:st.epi,vines:st.vines,tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
OIDONG._canopyH=function(x,z){let h=0;for(const T of OIDONG.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||6;};
// the nearest built hero of a species to a point
OIDONG.nearestTree=function(sp,x,z,minH){let b=null,bd=1e9;for(const T of OIDONG.TREES){if(T.sp!==sp||T.lv<2||(minH&&T.H<minH))continue;
 const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance from the zones, options)
// The pools first (the giant lotuses, in the water), then the big trees of the floor, then the groves and the small trees.
OIDONG.PASSES=[
 {sp:0,cell:24,accept:(Z,x,z)=>Z.pool*.6*smooth(.4,.6,fbm(x*.006+3,z*.006-1,8111,2)),opt:{water:true,pad:3,patch:0}},
 {sp:1,cell:60,accept:(Z)=>Z.meadow*.22+Z.moss*.2+Z.shore*.14+Z.terrace*.04,opt:{pad:8,patch:.4,patchScale:.006}},
 {sp:9,cell:48,accept:(Z)=>Z.mistZ*.55+Z.shore*.1+Z.moss*.05,opt:{pad:5,patch:.4,patchScale:.008}},
 {sp:3,cell:22,accept:(Z)=>(Z.moss*.55+Z.meadow*.08+Z.mistZ*.1+Z.shore*.1)*Z.grove*1.6,opt:{pad:2.5,patch:.3,patchScale:.012}},
 {sp:7,cell:44,accept:(Z)=>Z.shore*.34+Z.meadow*.06+Z.mistZ*.1,opt:{pad:4,patch:.45}},
 {sp:2,cell:26,accept:(Z)=>Z.meadow*.3+Z.moss*.22+Z.shore*.3+Z.terrace*.08,opt:{pad:3,patch:.5,patchScale:.009}},
 {sp:4,cell:30,accept:(Z)=>Z.flats*.2+Z.terrace*.42+Z.crag*.4+Z.meadow*.05,opt:{pad:3,patch:.5,mod:(T,Z)=>{if(Z.flats>.4||Z.crag>.4){T.wind=rr(.25,.6);T.lean=rr(1.0,1.6);}}}},
 {sp:5,cell:40,accept:(Z)=>Z.meadow*.28+Z.flats*.05+Z.moss*.04,opt:{pad:3,patch:.45}},
 {sp:6,cell:36,accept:(Z)=>Z.meadow*.26+Z.shore*.12+Z.moss*.06,opt:{pad:3,patch:.45}},
 {sp:8,cell:40,accept:(Z)=>Z.shore*.3+Z.meadow*.14+Z.moss*.08,opt:{pad:3,patch:.45}},
 {sp:12,cell:34,accept:(Z)=>Z.moss*.22+Z.meadow*.12+Z.flats*.08+Z.mistZ*.05,opt:{pad:2.5,patch:.5}},
 {sp:13,cell:20,accept:(Z)=>Z.moss*.4+Z.stream*.3+Z.mistZ*.12+Z.meadow*.05,opt:{pad:2,patch:.5,patchScale:.012,lodK:.3}},
 {sp:10,cell:24,accept:(Z)=>Z.shore*.36+Z.stream*.3+Z.moss*.1+Z.meadow*.06,opt:{pad:2,patch:.5,small:true,lodK:.3}},
 {sp:11,cell:8,accept:(Z)=>Z.bamboo*.75,opt:{pad:1.2,patch:.3,patchScale:.02,small:true,lodK:.5}},
 // the dark evergreens: cedars in the shade and the mist, camphors on the floor, pagoda firs up the terraces
 {sp:14,cell:30,accept:(Z)=>Z.moss*.34+Z.terrace*.3+Z.mistZ*.28+Z.meadow*.05+Z.shore*.04,opt:{pad:3,patch:.5,patchScale:.008}},
 {sp:15,cell:54,accept:(Z)=>Z.meadow*.16+Z.moss*.16+Z.shore*.08,opt:{pad:6,patch:.45,patchScale:.007}},
 {sp:16,cell:34,accept:(Z)=>Z.terrace*.42+Z.meadow*.08+Z.crag*.15+Z.moss*.08+Z.mistZ*.08,opt:{pad:3,patch:.5,patchScale:.009}},
];

// ---------------------------------------------------------------- one tree alone (biomes/WORLD.md: trees as variants)
OIDONG.make=function(sp,x,y,z){const S=SP[sp],seed=ri(0,999999);
 return{x:x,z:z,y0:y-.35,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed,wet:BIO.field('wet',x,z)};};
OIDONG.grow=function(T,lv){means();const st=newStats();
 T.lv=lv;if(lv===0){if(!SP[T.sp].far)return null;buildFar(T,T.seed%7,st);}else B[T.sp](T,st,lv);return st;};
})();
