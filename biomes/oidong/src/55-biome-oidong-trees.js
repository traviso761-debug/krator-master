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
 const lm=OIDONG.LIBMEAN||{},lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};MEAN.bark=MEAN.bark.map((m,k)=>lm['bark'+k]!=null?lin(lm['bark'+k]):m);
 if(lm.rock!=null)MEAN.rock=lin(lm.rock);
 return MEAN;}
Object.assign(OIDONG,{means,tint,bright,shade,vary});
const BARKC={};
// the marble (3) is painted in its own colours: its bark colour is a multiplier on them, not a tint
const barkCol=(S,k)=>{const key=S.key+(k%S.bark.length);if(S.barkK===3)return C(S.bark[k%S.bark.length]);return BARKC[key]||(BARKC[key]=tint(S.bark[k%S.bark.length],means().bark[S.barkK],.4));};
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
 const pe=at(top),re=rAt(top/T.H);rings.push({x:pe[0],y:T.y0+top,z:pe[1],r:re*.8,yy:top,col:barkCol(S,1)},{x:pe[0],y:T.y0+top+re*1.3,z:pe[1],r:.04,yy:top+re,col:barkCol(S,1)});
 const nf=o.flutes||0,fa=o.fluteA||0,tw=o.twist||0,nb=o.nb||5,bt=o.buttress||0,bh=o.bh||2.5;
 const seg=o.seg||(T.lv===2?14:8),uvs=BIO.bucket(famN).uvScale;
 BIO.lathe(famN,rings,seg,Math.max(1,Math.round(TAU*rAt(.1)/uvs[0])),uvs[1],
  (R,ang)=>R.r*(1+fa*Math.cos(nf*ang+R.yy*tw+ph))*(1+bt*Math.exp(-R.yy/bh)*Math.max(0,Math.cos(nb*ang+ph2))),
  (R,ang)=>1-(fa>0?.25*(.5-.5*Math.cos(nf*ang+R.yy*tw+ph)):0));
 return{x:pe[0],y:T.y0+top,z:pe[1],r:re};}
function limb(S,pts,st,o){o=o||{};st.limb+=BIO.tube(o.fam||fam(S),pts,o.col||barkCol(S,1),{seg:o.seg||(pts[0].r>.5?7:5),cap:true});}
function limbOk(pts,pad){for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+(pad||1.5),pts[i].r+(pad||1.5)))return false;return true;}

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
OIDONG.blocked=blocked;

// ---------------------------------------------------------------- foliage helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey,c2){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.6,1,smooth(.3,.95,qq))*mix(.84,1,smooth(-.6,.35,dy))*rr(.9,1.1);
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

// 0 the GIANT LOTUS: pads three to ten metres across on the still water, their rims turned up, their stalks down in the
// mud; one to three flower stalks rising above a house's height, each ending in a flower, a bud or a seed head the size
// of a basin. T.y0 is the water's surface.
B[0]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,wl=T.y0,hc=vary(pick(S.leaf),.02,.05,.04),a0=rr(0,TAU);
 const nP=lv===2?ri(3,6):ri(2,3);let reach=R;
 for(let k=0;k<nP;k++){const a=a0+k*GOLD,d=k?R*rr(.6,1.3):0,px=T.x+Math.cos(a)*d,pz=T.z+Math.sin(a)*d,Rp=R*(k?rr(.45,.85):rr(.8,1));
  if(k&&BIO.depth(px,pz)<.3)continue;
  BIO.put(OIDONG.it('giantpad',lv),[px,wl+.03,pz],qEuler(0,rr(0,TAU),0),[Rp,Rp,Rp],bright(vary(hc,.015,.04,.04),rr(1.05,1.2)));st.pads++;
  if(lv===2){const g=Y(px,pz);BIO.beam('rod',[px,g-.5,pz],[px,wl-.05,pz],rb*.6,rb*.5,rodCol(S.bark[0],-.1));}
  reach=Math.max(reach,d+Rp);}
 const nS=lv===2?ri(1,3):1;
 for(let k=0;k<nS;k++){const a=a0+1.3+k*GOLD,d=k?R*rr(.3,.7):rr(0,R*.3),px=T.x+Math.cos(a)*d,pz=T.z+Math.sin(a)*d,h=H*(k?rr(.55,.9):1),la=rr(0,TAU),lean=rr(.02,.08);
  const g=Y(px,pz),pts=[];for(let i=0;i<=5;i++){const t=i/5;pts.push({x:px+Math.cos(la)*lean*h*t*t,y:mix(g-.3,wl+h,t),z:pz+Math.sin(la)*lean*h*t*t,r:rb*(1-.35*t)});}
  if(lv===2)limb(S,pts,st,{fam:'bark2',seg:7});else BIO.beam('rod',P3(pts[0]),P3(pts[5]),rb,rb*.65,rodCol(S.bark[0],-.1));
  const e=pts[5],kind=T.seed%5<3?'flower':T.seed%5===3?'bud':'pod',Rf=R*rr(.28,.42);
  if(kind==='flower'){BIO.put(OIDONG.it('giantcup',lv),[e.x,e.y-.1,e.z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[Rf,Rf*.9,Rf],nearW(1.02));st.blooms++;}
  else if(kind==='bud'){BIO.put('cone',[e.x,e.y-.2,e.z],qUp([0,1,0]),[Rf*.9,Rf*1.6,Rf*.9],bright(vary(C(pick(PAL.blush)),.02,.05,.04),1.1));st.blooms++;}
  else{BIO.put('giantpod',[e.x,e.y-.1,e.z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[Rf*.7,Rf*.7,Rf*.7],nearW(1.0));st.pods++;}}
 regTree(T,S,reach,H+R*.4);};

// 1 the SACRED FIG: a pale smooth buttressed bole, heavy boughs leaving low and spreading into a wide shallow crown of
// heart leaves (bronze-pink where they are new); aerial roots from the lower limbs; rainbow brackets on the old bole
B[1]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const rAt=u=>rb*(1-.55*u)*(1+.5*Math.exp(-u*H/2.5));
 const top=bole(T,S,H*.42,rAt,{buttress:1.1,bh:3,nb:7,vs:5,seg:lv===2?16:9});
 const nB=lv===2?ri(5,8):4,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.72,spots=[];let reach=R*.5;
 for(let k=0;k<nB;k++){const u=rr(.5,1),p={x:T.x,y:T.y0+H*.42*u,z:T.z},a=a0+k*GOLD,el=rr(.25,.7),L=R*rr(.75,1.1);
  const pts=treeGrow(p,dirOf(a,el),L,rAt(.42*u)*.55,.12,5,.08,.1);if(!limbOk(pts,1))continue;
  if(lv===2)limb(S,pts,st,{seg:7});else BIO.beam('rod',P3(pts[0]),P3(pts[5]),pts[0].r,.1,rodCol(S.bark[0]));
  for(let i=2;i<=5;i++)spots.push(pts[i]);
  // aerial roots from the lower limbs, down to the ground
  if(lv===2&&k%2===0)for(let i=1;i<=3;i++)if(rng()<.5){const q=pts[i],g=Y(q.x,q.z),drop=Math.max(1,q.y-g);BIO.put('strand',[q.x,q.y-q.r*.8,q.z],qEuler(0,rr(0,TAU),0),[rr(.25,.5),drop+.3,1],rodCol(S.bark[1],-.05));st.roots++;}
  const e=pts[5];reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+R*.3);}
 spots.push({x:top.x,y:top.y+rr(.3,1.2),z:top.z});
 const cnt=lv===2?2:1;spots.forEach(p=>{for(let c=0;c<cnt;c++){const sz=rr(2.2,3.4)*Math.min(1.3,H/18),nw=rng()<.25;
  clumpAt('heart',p.x+rr(-.8,.8),p.y+rr(-.2,.8),p.z+rr(-.8,.8),sz,.5,nw?C(pick(PAL.peach)):hc,T.x,cy,T.z,R,H*.3,irid(PAL.irid.heart));st.clumps++;}});
 if(lv===2){brackets(T.x,T.y0+rr(1,3),T.z,rAt(.08),ri(2,5),st);for(let k=0,m=ri(2,4);k<m;k++)mossAt(T.x+rr(-rb,rb),T.y0+rr(.2,1.2),T.z+rr(-rb,rb),rr(.5,1));
  const fc=bright(C(0x8a5a7a),1.0);for(const p of spots)if(rng()<.5)for(let f=0,m=ri(2,5);f<m;f++)BIO.put('ball',[p.x+rr(-1,1),p.y+rr(-.6,.3),p.z+rr(-1,1)],null,rr(.04,.06),bright(vary(fc,.02,.06,.05),1.05));st.pods++;}
 regTree(T,S,reach,H+2);};

// 2 the CHERRY: a dark banded trunk, a wide umbrella of blossom in blush and white (a few trees all white); petals lying
// round its foot and on the water
B[2]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,white=T.seed%4===0,base=white?C(pick(PAL.ivory)):C(pick(PAL.blush));
 const rAt=u=>rb*(1-.5*u)*(1+.35*Math.exp(-u*H/2));
 const top=bole(T,S,H*.38,rAt,{flutes:3,fluteA:.05,vs:4,seg:lv===2?10:7,lean:[rr(-.06,.06),rr(-.06,.06)]});
 const nB=lv===2?ri(4,7):4,a0=rr(0,TAU),cy=T.y0+H*.78,spots=[];
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),pts=treeGrow({x:top.x,y:top.y-rr(0,.8),z:top.z},dirOf(a,rr(.35,.75)),R*rr(.8,1.1),rAt(.38)*.5,.07,4,-.05,.15);
  if(!limbOk(pts,1))continue;if(lv===2)limb(S,pts,st,{seg:5});else BIO.beam('rod',P3(pts[0]),P3(pts[4]),rAt(.38),.08,rodCol(S.bark[0]));
  for(let i=1;i<=4;i++)spots.push(pts[i]);}
 spots.push({x:top.x,y:top.y+rr(.4,1.0),z:top.z});
 const cnt=lv===2?2:1;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('blossom',p.x+rr(-.7,.7),p.y+rr(-.2,.6),p.z+rr(-.7,.7),rr(2.0,3.0)*Math.min(1.3,H/9),.55,vary(base,.01,.04,.03),T.x,cy,T.z,R,H*.25,irid(PAL.irid.blossom));st.clumps++;}});
 if(lv===2){petals(T,ri(14,30),base);if(T.seed%3){const cc=bright(C(0xd0485a),1.0);for(const p of spots){for(let f=0,m=ri(1,4);f<m;f++)BIO.put('ball',[p.x+rr(-1,1),p.y+rr(-.5,.4),p.z+rr(-1,1)],null,rr(.05,.07),bright(vary(cc,.02,.06,.05),1.05));st.pods++;}}}
 regTree(T,S,R,H+1);};

// 3 the MARBLE BIRCH: a tall slender bole painted in swirled pastel bands (the iridescent marble bucket), a few ascending
// boughs in its top third and a lace of near-white foliage; pastel crusts marble the ground round its foot
B[3]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,la=rr(0,TAU),lk=rr(0,.04);
 const rAt=u=>rb*(1-.75*u)*(1+.3*Math.exp(-u*H/2));
 const top=bole(T,S,H*.9,rAt,{fam:'barkM',lean:[Math.cos(la)*lk,Math.sin(la)*lk],vs:7,seg:lv===2?12:7});
 const nB=lv===2?ri(4,7):3,a0=rr(0,TAU),hc=vary(pick(S.leaf),.01,.03,.03).lerp(C(pick([].concat(PAL.blush,PAL.mint,PAL.lavender,PAL.powder))),.35),cy=T.y0+H*.84,spots=[];
 for(let k=0;k<nB;k++){const u=rr(.62,.9),p={x:T.x+Math.cos(la)*lk*H*u,y:T.y0+H*u,z:T.z+Math.sin(la)*lk*H*u},a=a0+k*GOLD,pts=treeGrow(p,dirOf(a,rr(.6,1.0)),R*rr(.7,1.1),rAt(u)*.45,.06,4,-.08,.12);
  if(!limbOk(pts,1))continue;if(lv===2)limb(S,pts,st,{fam:'barkM',seg:5});else BIO.beam('rod',P3(pts[0]),P3(pts[4]),rAt(u)*.9,.08,C(S.bark[0]));
  for(let i=1;i<=4;i++)spots.push(pts[i]);}
 spots.push({x:top.x,y:top.y+rr(.5,2),z:top.z});
 const cnt=2;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('lace',p.x+rr(-.9,.9),p.y+rr(-.3,.9),p.z+rr(-.9,.9),rr(2.6,4.0)*Math.min(1.3,H/22),.5,hc,T.x,cy,T.z,R,H*.2,irid(PAL.irid.marble));st.clumps++;}});
 // the marbled ground: pastel crusts of moss and lichen round the foot
 if(lv===2)for(let k=0,m=ri(3,7);k<m;k++){const a=rr(0,TAU),d=rr(.5,R*.9),px=T.x+Math.cos(a)*d,pz=T.z+Math.sin(a)*d;if(BIO.mask(px,pz)<=0)continue;
  BIO.put('mossmat',[px,Y(px,pz)+.06,pz],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),rr(.6,1.6),bright(vary(C(pick([].concat(PAL.blush,PAL.powder,PAL.lavender,PAL.mint))),.02,.05,.04),1.0));}
 regTree(T,S,R,H+1);};

// 4 the CLOUD PINE (Xanadu's): a bonsai nobody trimmed. A whorled trunk in an S, level boughs, and on every tip a flat
// pad of needles; on the flats and the crags it leans away from the wind (T.wind, T.lean)
B[4]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,wind=T.wind||0,la=T.lean!=null?T.lean:rr(0,TAU);
 const n=7,pts=[];const sw=rr(.8,1.6),sway=rr(.1,.22)*H+wind*H*.35;
 for(let i=0;i<=n;i++){const t=i/n,s=Math.sin(t*Math.PI*sw)*sway*(1-.3*t)+wind*H*.5*t*t,side=Math.sin(t*Math.PI*1.3+1)*H*.08;
  pts.push({x:T.x+Math.cos(la)*s-Math.sin(la)*side,y:T.y0+t*H*(1-.18*wind),z:T.z+Math.sin(la)*s+Math.cos(la)*side,r:rb*(1-.75*t)*(1+.6*Math.exp(-t*9))});}
 limb(S,pts,st,{seg:lv===2?8:6});
 const hc=vary(pick(S.leaf),.02,.05,.04),rc=rodCol(S.bark[0]),nP=lv===2?ri(4,8):3;let spread=T.crownR*.5;
 const pad=(x,y,z,R)=>{const m=lv===2?ri(4,7):2;for(let c=0;c<m;c++){const a=rr(0,TAU),d=R*.55*Math.sqrt(rng());clumpAt('needle',x+Math.cos(a)*d,y+rr(-.1,.25)*R*.3,z+Math.sin(a)*d,R*rr(.85,1.1),.5,hc,x,y-R*.5,z,R,R*.5,null);st.clumps++;}};
 for(let k=0;k<nP;k++){const t=lerp(.35,.9,k/Math.max(1,nP-1)),i=Math.min(n-1,Math.floor(t*n)),p=pts[i],a=(k%2?la+Math.PI:la)+rr(-.9,.9),L=T.crownR*rr(.5,1)*(1.1-t*.4),R=rr(1.1,2.2)*Math.min(1.3,H/10);
  const e=[p.x+Math.cos(a)*L,p.y+rr(-.1,.5),p.z+Math.sin(a)*L],m=[mix(p.x,e[0],.5),p.y-rr(.2,.8),mix(p.z,e[2],.5)];
  if(!clear3(e[0],e[1],e[2],R,1))continue;
  BIO.beam('rod',[p.x,p.y,p.z],m,p.r*.5,p.r*.35,rc);BIO.beam('rod',m,e,p.r*.35,.06,rc);pad(e[0],e[1]+.3,e[2],R);spread=Math.max(spread,L+R);}
 const e=pts[n];pad(e.x,e.y+.2,e.z,rr(1.3,2.2)*Math.min(1.3,H/10));
 if(lv===2&&rng()<.4)mossAt(pts[1].x,pts[1].y+pts[1].r*.6,pts[1].z,rr(.4,.8));
 regTree(T,S,spread,H+1);};

// 5 the CUSHION TREE (Xanadu's): braided stems spreading from one foot, and over them a lumpy dome of smooth leafy
// cushions, as if clipped
B[5]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,nS=lv===2?ri(4,8):3,a0=rr(0,TAU),tips=[],sc=Math.min(1.3,H/9);
 const dc={x:T.x,y:T.y0+H*.66,z:T.z},Rd=T.crownR*.72;
 for(let k=0;k<nS;k++){const a=a0+k/nS*TAU+rr(-.3,.3),reach=Rd*rr(.35,.8),hh=dc.y-T.y0-Rd*rr(.1,.35),pts=[],n=6,tw=rr(1.5,3)*(k%2?1:-1);
  for(let i=0;i<=n;i++){const t=i/n,r=rb*(1-.5*t)*(1+.8*Math.exp(-t*6)),w=Math.sin(t*Math.PI)*.5;const aa=a+tw*t*.35;
   pts.push({x:T.x+Math.cos(aa)*(reach*Math.pow(t,1.4)+.25)+Math.cos(a+1.6)*w,y:T.y0+hh*t,z:T.z+Math.sin(aa)*(reach*Math.pow(t,1.4)+.25)+Math.sin(a+1.6)*w,r});}
  if(lv===2)limb(S,pts,st,{seg:6});else{BIO.beam('rod',P3(pts[0]),P3(pts[3]),rb,rb*.7,rodCol(S.bark[0]));BIO.beam('rod',P3(pts[3]),P3(pts[n]),rb*.7,rb*.45,rodCol(S.bark[0]));}
  tips.push(pts[n]);}
 const hc=vary(pick(S.leaf),.02,.05,.04);let n=0;
 const cushion=(x,y,z,R,up)=>{const c=bright(vary(hc,.015,.05,.04),lerp(1.0,1.3,up));BIO.put('cushion',[x,y,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[R,R*rr(.72,.86),R],c);n++;
  if(lv===2)for(let f=0;f<2;f++){const a=rr(0,TAU);clumpAt('small',x+Math.cos(a)*R*.8,y+rr(-.2,.4)*R,z+Math.sin(a)*R*.8,R*rr(.55,.8),.5,c,x,y-R*.4,z,R,R*.6,null);}};
 const nc=lv===2?ri(14,20):7;for(let k=0;k<nc;k++){const t=(k+.5)/nc,ph=Math.acos(1-t*.95),th=k*GOLD,d=[Math.sin(ph)*Math.cos(th),Math.cos(ph)*.62,Math.sin(ph)*Math.sin(th)];
  const R=rr(1.4,2.2)*sc*(1.1-.3*t);cushion(dc.x+d[0]*Rd,dc.y+d[1]*Rd,dc.z+d[2]*Rd,R,1-t*.8);}
 tips.forEach(p=>cushion(p.x,p.y+.3*sc,p.z,rr(1.1,1.6)*sc,.2));
 st.cushions+=n;regTree(T,S,T.crownR,H+1);};

// 6 the HAZE BLOSSOM (Xanadu's): a low gnarled trunk, a wide umbrella wholly in blossom (white going green or lavender
// with the light; now and then all lilac), petals lying round its foot
B[6]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU);
 const pts=treeGrow({x:T.x,y:T.y0-.3,z:T.z},dirOf(la,rr(1.2,1.45)),H*.4,rb,rb*.6,5,-.1,.18);limb(S,pts,st,{seg:lv===2?8:6});
 const o=pts[5],nB=lv===2?ri(5,8):4,a0=rr(0,TAU),violet=rng()<.15,base=violet?C(pick(PAL.lilac)):C(pick(S.leaf)),cy=T.y0+H*.8,spots=[];
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),p=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(a,rr(.25,.6)),T.crownR*rr(.8,1.1),rb*.5,.08,4,-.06,.2);
  if(!limbOk(p))continue;if(lv===2)limb(S,p,st,{seg:5});else BIO.beam('rod',P3(p[0]),P3(p[4]),rb*.45,.08,rodCol(S.bark[0]));for(let i=1;i<=4;i++)spots.push(p[i]);}
 spots.push({x:o.x,y:o.y+rr(.4,1.0),z:o.z});
 const cnt=lv===2?2:1;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('blossom',p.x+rr(-.7,.7),p.y+rr(-.2,.7),p.z+rr(-.7,.7),rr(2.4,3.4),.55,vary(base,.01,.04,.03),o.x,cy,o.z,T.crownR,H*.25,irid(PAL.irid.blossom));st.clumps++;}});
 if(lv===2)petals(T,ri(8,18),base);
 regTree(T,S,T.crownR,H+1);};

// 7 the LOTUS TRUMPET (Xanadu's, paled): a fat fluted bole, arms that climb and spread, and on every arm a trumpet
// flaring into a wide shallow cup with a fringe of lotus flowers round its rim: the fringe is the one place in the valley
// where every colour shows at once. Aerial roots hang from the arms.
B[7]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,ti=T.seed%3,nR=14;
 const rAt=u=>rb*(1-.45*u)*(1+.55*Math.exp(-u*H/2.2));
 const hB=H*rr(.34,.44),top=bole(T,S,hB,rAt,{fam:'barkT',flutes:7,fluteA:.10,twist:.05,buttress:.6,bh:1.6,nb:7,vs:4});
 // the trumpets' colours are tinted through the ribbed canvas's mean like the bark, or they render a stop dark
 const leafC=tint(vary(pick(S.leaf),.02,.05,.04),means().bark[2],1.05);
 function trumpet(p,R,depth){const rings=[{x:p.x,y:p.y-.5,z:p.z,r:.32,yy:-1.5,col:barkCol(S,ti)}],n=lv===2?9:5,ph=rr(0,TAU);   // the throat grows from the arm's own radius
  for(let i=0;i<=n;i++){const u=i/n,f=Math.pow(u,2.2),r=lerp(R*.08,R,f),yy=depth*u;rings.push({x:p.x,y:p.y+yy,z:p.z,r:r,yy:yy*3,col:barkCol(S,ti).clone().lerp(leafC,smooth(.2,.8,u))});}
  rings.push({x:p.x,y:p.y+depth+R*.04,z:p.z,r:R*1.06,yy:depth*3+1,col:bright(leafC,1.1)},{x:p.x,y:p.y+depth-R*.12,z:p.z,r:R*.8,yy:depth*3+2,col:shade(leafC,-.15)},{x:p.x,y:p.y+depth-R*.18,z:p.z,r:.05,yy:depth*3+3,col:shade(leafC,-.3)});
  st.trunk+=BIO.lathe('barkT',rings,lv===2?20:12,Math.max(1,Math.round(TAU*R/3)),3,(Rg,ang)=>Rg.r*(1+.06*Math.cos(nR*ang+ph)),(Rg,ang)=>.82+.18*Math.cos(nR*ang+ph));
  const nf=lv===2?Math.round(TAU*R/.9):lv===1?Math.round(TAU*R/2):0,ph2=rr(0,TAU),pr=pick(PAL.lilyPair);
  for(let k=0;k<nf;k++){const a=ph2+k/nf*TAU,rr2=R*rr(.98,1.08),x=p.x+Math.cos(a)*rr2,z=p.z+Math.sin(a)*rr2,y=p.y+depth+rr(.1,.35);
   BIO.put('lotusbloom',[x,y,z],qEuler(rr(-.2,.2),-a,rr(.8,1.2)),rr(.75,1.05)*Math.min(1.3,R/2.5),bright(vary(C(pr[k%2]),.02,.06,.04),1.1),{c2:bright(C(pr[(k+1)%2]),1.1)});st.blooms++;}
  if(lv===2&&rng()<.6){const cc=bright(C(pick(PAL.blush)),1.1);for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU),d=R*rr(.2,.6);BIO.put('cup',[p.x+Math.cos(a)*d,p.y+depth-R*.08,p.z+Math.sin(a)*d],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),rr(.5,.8),cc);st.blooms++;}}}
 const nA=lv===2?ri(4,8):ri(3,5),a0=rr(0,TAU);let spread=T.crownR;
 for(let k=0;k<nA;k++){const a=a0+k*GOLD+rr(-.3,.3),reach=rr(2.5,T.crownR*1.9),rise=H*rr(.25,.6)-hB*.2,R=rr(1.6,3.2)*Math.min(1.3,H/15);
  const o=[top.x+Math.cos(a)*rAt(hB/H)*.5,top.y-rr(.3,1.5),top.z+Math.sin(a)*rAt(hB/H)*.5],e=[T.x+Math.cos(a)*reach,T.y0+hB+rise,T.z+Math.sin(a)*reach];
  const c=[mix(o[0],e[0],.75),mix(o[1],e[1],.15),mix(o[2],e[2],.75)];
  const pts=arc(o,c,e,rAt(hB/H)*.38,.3,5);if(!limbOk(pts,R*.6))continue;
  limb(S,pts,st,{fam:'barkT',seg:lv===2?7:5});
  trumpet({x:e[0],y:e[1],z:e[2]},R,R*rr(.55,.8));
  if(lv===2)for(let i=1;i<4;i++)if(rng()<.55){const p=pts[i];BIO.put('strand',[p.x,p.y-p.r,p.z],qEuler(0,rr(0,TAU),0),[rr(.3,.6),Math.max(1,p.y-T.y0-rr(0,2)),1],bright(vary(0xa89a7c,.02,.06,.06),1.05));}
  spread=Math.max(spread,reach+R);}
 {const ty=top.y+rr(1,H*.25);trumpet({x:top.x,y:ty,z:top.z},rr(2.8,4.2)*Math.min(1.3,H/15),rr(2,3));
  BIO.beam('rod',[top.x,top.y-1,top.z],[top.x,ty-.3,top.z],rAt(hB/H)*.5,rAt(hB/H)*.3,barkCol(S,1));}
 regTree(T,S,spread,H+2);};

// 8 the WISTERIA TREE (Xanadu's): two stems wound round each other, an umbrella of low boughs, light leaves, curtains
// of racemes in lavender and white
B[8]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,hT=H*rr(.45,.6),ph=rr(0,TAU),tops=[];
 for(let s=0;s<2;s++){const pts=[],n=8;for(let i=0;i<=n;i++){const t=i/n,a=ph+s*Math.PI+t*TAU*rr(.9,1.3),r=rb*.55*(1+.5*Math.exp(-t*5)),w=rb*.55;
  pts.push({x:T.x+Math.cos(a)*w*(1-.3*t),y:T.y0+hT*t,z:T.z+Math.sin(a)*w*(1-.3*t),r});}
  limb(S,pts,st,{seg:lv===2?7:5});tops.push(pts[n]);}
 const o=tops[0],nB=lv===2?ri(5,8):4,a0=rr(0,TAU),hc=C(pick(PAL.jade)),cy=T.y0+H*.8;
 const white=rng()<.3;
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),pts=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(a,rr(.15,.5)),T.crownR*rr(.7,1.1),rb*.4,.08,5,-.08,.2);
  if(!limbOk(pts))continue;if(lv===2)limb(S,pts,st,{seg:5});else BIO.beam('rod',P3(pts[0]),P3(pts[5]),rb*.35,.08,rodCol(S.bark[0]));
  for(let i=1;i<=5;i++){const p=pts[i];clumpAt('broad',p.x+rr(-.6,.6),p.y+rr(0,.6),p.z+rr(-.6,.6),rr(1.6,2.4),.45,hc,T.x,cy,T.z,T.crownR,H*.2,null);st.clumps++;
   const m=lv===2?ri(3,6):lv===1?2:1;for(let r=0;r<m;r++){const col=white?C(pick(PAL.ivory)):vary(C(pick(S.leaf)),.02,.06,.05);
    BIO.put('raceme',[p.x+rr(-1.3,1.3),p.y+rr(-.2,.4),p.z+rr(-1.3,1.3)],qEuler(0,rr(0,TAU),0),[rr(.5,.8),rr(1.1,2.6),1],bright(col,1.15),{c2:bright(C(white?0xe8e0f8:pick(PAL.irid.wisteria)),1.05)});st.racemes++;}}}
 regTree(T,S,T.crownR,H+1);};

// 9 the CHALICE TREE: a pale smooth column holding up one great shallow cap, teal above and veined underneath, that fills
// with rain and cloud-drip and spills it over its rim in threads that fall the whole height of the tree; a fringe of pale
// grass on the rim; the ground under it mossed and wet
B[9]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,la=rr(0,TAU),lk=rr(0,.03);
 const rAt=u=>rb*(1-.4*u)*(1+.4*Math.exp(-u*H/3));
 const top=bole(T,S,H*.96,rAt,{lean:[Math.cos(la)*lk,Math.sin(la)*lk],buttress:.5,bh:2,nb:6,vs:6,seg:lv===2?14:8});
 const cc=tint(vary(pick(S.leaf),.02,.05,.04),means().cap,.5);
 BIO.put('cap',[top.x,top.y+R*.08,top.z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[R,R,R],bright(cc,1.05));st.caps++;
 if(lv>=1){const n=lv===2?ri(12,20):6,a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.1,.1),x=top.x+Math.cos(a)*R*.97,z=top.z+Math.sin(a)*R*.97,h=rr(.5,1.1)*Math.min(1.3,R/6);
   BIO.put('rimgrass',[x,top.y+R*.1,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[h*.8,h,h*.8],leafCol(PAL.gold,1.25,.02,.05,.05));}
  const nt=lv===2?ri(5,9):3,b0=rr(0,TAU);
  for(let k=0;k<nt;k++){const a=b0+k/nt*TAU+rr(-.2,.2),x=top.x+Math.cos(a)*R*1.0,z=top.z+Math.sin(a)*R*1.0,g=Math.max(Y(x,z),BIO.waterH(x,z)),drop=top.y+R*.06-g;
   BIO.put('thread',[x,top.y+R*.06,z],qEuler(0,rr(0,TAU),0),[rr(.4,.8),drop,1],nearW(1.08));st.threads++;
   // where a thread lands: a wet dark moss, a few stones
   if(lv===2&&g>=Y(x,z)){BIO.put('mossmat',[x,g+.05,z],qEuler(0,rr(0,TAU),0),rr(1,2),leafCol(PAL.mossDark,1.1,.02,.05,.04));}}}
 if(lv===2){brackets(T.x,T.y0+rr(2,5),T.z,rAt(.15),ri(1,3),st);for(let k=0,m=ri(2,4);k<m;k++)mossAt(T.x+rr(-rb,rb),T.y0+rr(.3,2),T.z+rr(-rb,rb),rr(.5,1.1));}
 regTree(T,S,R*1.05,H+R*.2);};

// 10 the BELL-POD WILLOW: a small weeping tree whose pink stems hang in strings of pale green beads, each string ending
// in a coral bell
B[10]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const rAt=u=>rb*(1-.45*u)*(1+.4*Math.exp(-u*H/1.5));
 const top=bole(T,S,H*.5,rAt,{vs:3,seg:lv===2?9:6,lean:[rr(-.08,.08),rr(-.08,.08)]});
 const nB=lv===2?ri(5,9):4,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.7,stemC=rodCol(S.bark[0],.05);
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),pts=treeGrow({x:top.x,y:top.y-rr(0,.5),z:top.z},dirOf(a,rr(.3,.7)),R*rr(.7,1.05),rAt(.5)*.5,.05,5,-.2,.12);
  if(!limbOk(pts,.6))continue;if(lv===2)limb(S,pts,st,{seg:5,col:stemC});else BIO.beam('rod',P3(pts[0]),P3(pts[5]),rAt(.5),.06,stemC);
  for(let i=1;i<=5;i++){const p=pts[i];if(i%2===1){clumpAt('small',p.x+rr(-.5,.5),p.y+rr(0,.5),p.z+rr(-.5,.5),rr(1.0,1.6),.5,hc,T.x,cy,T.z,R,H*.3,null);st.clumps++;}
   const m=lv===2?ri(2,4):lv===1?1:0;for(let r=0;r<m;r++){const x=p.x+rr(-.6,.6),z=p.z+rr(-.6,.6),y=p.y-p.r,L=Math.max(.6,Math.min(rr(1.2,3.2)*Math.min(1.3,H/6),y-Math.max(Y(x,z),BIO.waterH(x,z))-.4));
    BIO.put('beads',[x,y,z],qEuler(0,rr(0,TAU),0),[L*.28,L,L*.28],leafCol(PAL.mint,1.2,.02,.05,.04));st.beads++;
    if(lv===2){const bs=rr(.22,.34);BIO.put('bell',[x,y-L*.97,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[bs,bs*1.3,bs],bright(vary(C(pick(PAL.coral)),.02,.06,.05),1.15));st.bells++;}}}}
 regTree(T,S,R,H+.5);};

// 11 the JADE BAMBOO: a clump of pale jade canes ringed at the nodes, leaning a little outward and bending at the top
// into sprays of narrow leaves
B[11]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,n=lv===2?ri(5,10):ri(3,4),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.85;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?R*.45*Math.sqrt(rng()):0,x0=T.x+Math.cos(a)*d,z0=T.z+Math.sin(a)*d,h=H*rr(.7,1.05),lean=rr(.02,.09),la=a+rr(-.5,.5),pts=[];
  for(let i=0;i<=4;i++){const t=i/4,s=lean*h*t*t+(t>.7?(t-.7)*(t-.7)*h*.9:0);pts.push({x:x0+Math.cos(la)*s,y:T.y0-.2+h*t,z:z0+Math.sin(la)*s,r:rb*(1-.3*t)});}
  if(lv===2)st.trunk+=BIO.tube('bark5',pts,barkCol(S,k),{seg:5,cap:true,vscale:BIO.bucket('bark5').uvScale[1]});else BIO.beam('rod',P3(pts[0]),P3(pts[4]),rb,rb*.7,tint(S.bark[0],means().bark[5],.9));
  const m=lv===2?ri(2,3):1;for(let c=0;c<m;c++){const p=pts[2+Math.min(2,c)],sz=rr(1.8,2.8);clumpAt('bambooleaf',p.x+rr(-.8,.8),p.y+rr(-.6,1.0),p.z+rr(-.8,.8),sz,.6,hc,T.x,cy,T.z,R*1.2,H*.25,null);st.clumps++;}}
 regTree(T,S,R*1.1,H+.5);};

// 12 the MOSS-BALL TREE: a gnarled dark trunk forking and forking again, and on every fork a ball of moss-fine foliage,
// the balls stacked up it like a cloud-pruned tree
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,balls=[];let reach=R*.4,top=T.y0+H*.5;
 const hc=vary(pick(S.leaf),.02,.05,.04);
 function fork(o,d,len,r,depth){const pts=treeGrow(o,d,len,r,r*.55,4,-.03,.18);
  if(lv===2)limb(S,pts,st,{seg:depth?5:7});else BIO.beam('rod',P3(pts[0]),P3(pts[4]),r,r*.55,rodCol(S.bark[0]));
  const e=pts[4];balls.push({x:e.x,y:e.y,z:e.z,R:rr(.9,1.6)*(1-.15*depth)*Math.min(1.3,H/9)});
  if(depth<2&&rng()<.85)balls.push({x:pts[2].x,y:pts[2].y,z:pts[2].z,R:rr(.6,1.1)*Math.min(1.3,H/9)});
  reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+1.5);top=Math.max(top,e.y+1.5);
  if(depth>=(lv===2?2:1))return;
  const nf=ri(2,3),a0=Math.atan2(d[2],d[0]);
  for(let k=0;k<nf;k++){const a=a0+(k-(nf-1)/2)*rr(.8,1.3)+rr(-.2,.2),el=rr(.4,1.0);const dd=dirOf(a,el);
   if(clear3(e.x+dd[0]*2,e.y+dd[1]*2,e.z+dd[2]*2,.6,.6))fork({x:e.x,y:e.y,z:e.z},dd,len*rr(.55,.8),r*.6,depth+1);}}
 fork({x:T.x,y:T.y0-.3,z:T.z},dirOf(rr(0,TAU),rr(1.2,1.5)),H*.4,rb,0);
 balls.forEach(b=>{BIO.put('mossdome',[b.x,b.y,b.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[b.R,b.R*rr(.85,1),b.R],bright(vary(hc,.015,.05,.04),rr(1.05,1.25)));st.balls++;});
 regTree(T,S,reach,top-T.y0+1);};

// 13 the PAPER MAPLE: a slender trunk and three to five boughs spreading nearly level, each carrying a flat tier of
// palmate leaves, coral and peach, laid over the moss
B[13]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const rAt=u=>rb*(1-.5*u)*(1+.3*Math.exp(-u*H/1.5));
 const top=bole(T,S,H*.45,rAt,{vs:3,seg:lv===2?9:6,lean:[rr(-.1,.1),rr(-.1,.1)]});
 const nB=lv===2?ri(3,5):3,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.8,tiers=[];
 for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.3,.3),u=rr(.5,1),o={x:top.x,y:T.y0+H*.45*u,z:top.z},pts=treeGrow(o,dirOf(a,rr(.15,.45)),R*rr(.75,1.1),rAt(.45*u)*.5,.05,4,.02,.12);
  if(!limbOk(pts,.6))continue;if(lv===2)limb(S,pts,st,{seg:5});else BIO.beam('rod',P3(pts[0]),P3(pts[4]),rAt(.45),.06,rodCol(S.bark[0]));
  for(let i=1;i<=4;i++)tiers.push(pts[i]);}
 tiers.push({x:top.x,y:top.y+rr(.5,1.2),z:top.z});
 const cnt=lv===2?2:1;tiers.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('maple',p.x+rr(-.7,.7),p.y+rr(-.1,.4),p.z+rr(-.7,.7),rr(1.8,2.6)*Math.min(1.3,H/8),.3,hc,T.x,cy,T.z,R,H*.25,null);st.clumps++;}});
 if(lv===2&&rng()<.5)coinVine(tiers[0],st);
 regTree(T,S,R,H+.5);};

// 14 the TEMPLE CEDAR: a straight column of red fibrous bark, short level boughs in tiers from a third of its height to
// the tip, each a flat spray of dark needles: the darkest column in the valley (Xanadu's dawn redwood, gone evergreen)
B[14]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb;
 const rAt=u=>rb*(1-.8*u)*(1+.5*Math.exp(-u*H/2));
 bole(T,S,H*.96,rAt,{flutes:7,fluteA:.06,buttress:.7,bh:2,nb:6,vs:6,seg:lv===2?12:7});
 const tiers=lv===2?Math.round(H/2.2):Math.round(H/4),hc=vary(pick(S.leaf),.02,.05,.04),rc=rodCol(S.bark[0]);
 for(let t=0;t<tiers;t++){const u=lerp(.26,.97,t/(tiers-1)),y=T.y0+H*u,Rt=T.crownR*Math.pow(1-u,.8)*rr(.85,1.15)+.5,nB=lv===2?ri(4,6):3,a0=t*GOLD;
  for(let k=0;k<nB;k++){const a=a0+k/nB*TAU+rr(-.25,.25),ex=T.x+Math.cos(a)*Rt,ez=T.z+Math.sin(a)*Rt,ey=y-Rt*.1;
   if(lv===2&&Rt>1.4)BIO.beam('rod',[T.x,y,T.z],[ex,ey,ez],rAt(u)*.3+.04,.04,rc);
   const sz=Math.max(1.3,Rt*rr(.6,.8));clumpAt('darkneedle',T.x+(ex-T.x)*.8,ey+sz*.05,T.z+(ez-T.z)*.8,sz,.45,hc,T.x,y,T.z,Rt+1,Rt*.6+1,null);st.clumps++;}}
 clumpAt('darkneedle',T.x,T.y0+H*.99,T.z,1.4,.9,hc,T.x,T.y0+H,T.z,2,2,null);
 regTree(T,S,T.crownR,H+1);};
// 15 the CAMPHOR LAUREL: a heavy grey bole, boughs rising from low down into a great dark glossy dome
B[15]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const rAt=u=>rb*(1-.55*u)*(1+.4*Math.exp(-u*H/2.5));
 const top=bole(T,S,H*.3,rAt,{buttress:.6,bh:2.5,nb:6,vs:5,seg:lv===2?14:8});
 const nB=lv===2?ri(5,8):4,a0=rr(0,TAU),hc=vary(pick(S.leaf),.02,.05,.04),cy=T.y0+H*.68,spots=[];let reach=R*.5;
 for(let k=0;k<nB;k++){const u=rr(.5,1),p={x:T.x,y:T.y0+H*.3*u,z:T.z},a=a0+k*GOLD,el=rr(.45,.95),L=R*rr(.7,1.0);
  const pts=treeGrow(p,dirOf(a,el),L,rAt(.3*u)*.55,.1,5,-.1,.12);if(!limbOk(pts,1))continue;
  if(lv===2)limb(S,pts,st,{seg:7});else BIO.beam('rod',P3(pts[0]),P3(pts[5]),pts[0].r,.1,rodCol(S.bark[0]));
  for(let i=2;i<=5;i++)spots.push(pts[i]);const e=pts[5];reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+R*.3);}
 spots.push({x:top.x,y:top.y+rr(.3,1.2),z:top.z});
 const cnt=lv===2?3:1;spots.forEach(p=>{for(let c=0;c<cnt;c++){clumpAt('gloss',p.x+rr(-.9,.9),p.y+rr(-.2,.9),p.z+rr(-.9,.9),rr(2.4,3.6)*Math.min(1.3,H/16),.55,hc,T.x,cy,T.z,R,H*.3,irid(PAL.irid.gloss));st.clumps++;}});
 if(lv===2){brackets(T.x,T.y0+rr(1,2.5),T.z,rAt(.08),ri(1,3),st);}
 regTree(T,S,reach,H+1);};
// 16 the PAGODA FIR: a straight bole, level whorls of limbs at even heights, each whorl a flat plate of dark blue-green
// needles like a pagoda's roofs, smaller to the spire
B[16]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const rAt=u=>rb*(1-.8*u)*(1+.4*Math.exp(-u*H/2));
 bole(T,S,H*.98,rAt,{vs:6,seg:lv===2?10:7});
 const tiers=lv===2?ri(5,9):4,hc=vary(pick(S.leaf),.02,.05,.04),rc=rodCol(S.bark[0]),a0=rr(0,TAU);
 for(let t=0;t<tiers;t++){const u=lerp(.22,.9,t/(tiers-1)),y=T.y0+H*u,Rt=R*(1-.75*u)*rr(.9,1.1)+.6,nB=lv===2?ri(5,7):4;
  for(let k=0;k<nB;k++){const a=a0+t*.5+k/nB*TAU,ex=T.x+Math.cos(a)*Rt,ez=T.z+Math.sin(a)*Rt;
   if(lv===2)BIO.beam('rod',[T.x,y,T.z],[ex,y+Rt*.06,ez],rAt(u)*.35+.04,.03,rc);
   const m=lv===2?(Rt>2.5?3:2):1;for(let c=0;c<m;c++){const f=lerp(.35,1,(c+.5)/m),sz=Math.max(1.2,Rt*rr(.42,.55));clumpAt('darkneedle',T.x+(ex-T.x)*f,y+Rt*.06*f+.1,T.z+(ez-T.z)*f,sz,.22,hc,T.x,y-Rt*.3,T.z,Rt+1,Rt*.5+1,null);st.clumps++;}}}
 BIO.put('cone',[T.x,T.y0+H*.94,T.z],qUp([0,1,0]),[rAt(.9)*3,H*.08,rAt(.9)*3],hc);
 regTree(T,S,R,H+1);};

// ---------------------------------------------------------------- impostors (the far canopy)
// far.blobs: icosahedral blobs on a pole (sedesert's recipe, as shighlands)
let ICO=null;
function buildFar(T,fi,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 const kk=BIO._lodKey(T.x,T.z),F=S.far||{poleU:.35,blobs:[]};
 const bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear();
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
    TREES.push(T);hadd({x:x,z:z,r:(opt.water?T.crownR*.9:T.rb*1.4)+1});n++;},gopt);
  return n;}
 OIDONG.PASSES.forEach(pass);
 TREES.forEach((T,i)=>{if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
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
