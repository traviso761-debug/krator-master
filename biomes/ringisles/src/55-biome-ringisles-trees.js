// ================================================================= RING SEA ISLES — trees
// The zones from the climate classes and the shore's fields; the burn mosaic of the savanna and the steppe; this kit's
// own seven tree species (scrub thorn, corkwood, salt cedar, strand pandanus, sea grape, breadfruit, banana); and the
// borrowed ones, grown IN PLACE by their own kits (RINGISLES.BORROW: the kit's make/grow, or its treeAt). Beyond the
// LOD spine a tree of this kit's is an impostor in the 'far' bucket; a borrowed one is its own kit's far tree.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=RINGISLES.SPECIES,PAL=RINGISLES.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=RINGISLES.C;
RINGISLES.TREES=[];

// ---------------------------------------------------------------- the classes at a point
// The world's classes as soft weights (BIO.field('koppen:XA') .. 'koppen:XS'). A host that binds none gets the kit's
// own fallback from wet and upland (WORLD.md: "a kit's own zone thresholds stay as the fallback"): the dry classes
// where it is dry, the abyssal ones (X) low down
const CL=RINGISLES.CLASSES;
RINGISLES.classAt=function(x,z){const o={};let s=0;
 if(BIO.hasField&&BIO.hasField('koppen:Aw')){for(const k of CL){o[k]=BIO.field('koppen:'+k,x,z);s+=o[k];}if(s>0)return o;}
 const w=BIO.field('wet',x,z),lo=1-smooth(.15,.4,BIO.field('upland',x,z));
 const wet=smooth(.62,.72,w),mon=smooth(.52,.6,w)*(1-wet),stp=1-smooth(.28,.36,w),sav=Math.max(0,1-wet-mon-stp);
 o.XA=wet*lo;o.Af=wet*(1-lo);o.Am=mon;o.Aw=sav*(1-lo);o.XV=sav*lo;o.BSh=stp*(1-lo);o.XS=stp*lo;return o;};

// ---------------------------------------------------------------- the burn mosaic (the savanna and the steppe)
// Fire-started by lightning and by the islanders, the grass burns in patches every year or two: a cell's years since
// its last fire from a jittered grid (140 m), its edges ragged. black: the first weeks (ash, stubble, the green flush
// pushing through); flush: bright short regrowth; green: a season's grass; cured: older, gold, standing. The dry season's
// mosaic (the showcase's): about half cured, a tenth black. A host may bind its own 'burn' field (years) instead
const BC=140;
RINGISLES.burnAge=function(x,z){if(BIO.hasField&&BIO.hasField('burn'))return BIO.field('burn',x,z);
 const px=x+38*(fbm(x*.01,z*.01,7501,2)-.5),pz=z+38*(fbm(x*.01+9,z*.01,7502,2)-.5),gx=Math.floor(px/BC),gz=Math.floor(pz/BC);let bd=1e9,id=0;
 for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const cx=(gx+i+.15+.7*h3(gx+i,gz+j,7503))*BC,cz=(gz+j+.15+.7*h3(gx+i,gz+j,7504))*BC,d=Math.hypot(px-cx,pz-cz);if(d<bd){bd=d;id=h3(gx+i,gz+j,7505);}}
 return id<.1?id*1.6:id<.28?.16+(id-.1)*2.6:id<.48?.63+(id-.28)*4.5:1.6+(id-.48)*9;};
RINGISLES.burnState=function(age){return{black:smooth(.2,.12,age),flush:smooth(.1,.2,age)*smooth(.7,.55,age),green:smooth(.55,.7,age)*smooth(1.6,1.4,age),cured:smooth(1.4,1.6,age)};};

// ---------------------------------------------------------------- zones
// Each 0..1. The classes (xa af am aw xv bsh xs) only inland, off the shore, the pan, the gardens and the thermal ground;
//   strand  the beach above the water (and the dunes behind it, dune)    mangal   the bay's mud, in and out of the water
//   lagoon  sheltered water inside the reef        reef    the reef flat      bench   the tide-pool rock
//   pan     the salt crust (panEdge: its rim, the glasswort's and the salt cedar's)
//   thermal the geyser kit's ground (this kit plants nothing there)      garden   a town's fields (the gardens' own)
//   cliff   a sheer face: nothing roots there (the owner's rule: every zone times 1-cliff)
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const F=n=>BIO.field(n,x,z);const K=RINGISLES.classAt(x,z);
 const slope=F('slope'),rock=F('rock'),beach=F('beach'),dune=F('dune'),mangal=F('mangal'),lagoon=F('lagoon'),reef=F('reef'),bench=F('bench'),pan=F('pan'),garden=F('garden'),floor=F('floor');
 const cliff=smooth(.78,.93,slope)*smooth(.2,.5,rock)*(1-smooth(.3,.7,garden)),thermal=smooth(.35,.75,floor),live=(1-cliff)*(1-smooth(.2,.6,garden))*(1-thermal);
 const shore=Math.max(beach,bench,mangal),inland=live*(1-smooth(.25,.65,shore))*(1-smooth(.2,.6,pan));
 const xa=K.XA*inland,af=K.Af*inland,am=K.Am*inland,aw=K.Aw*inland,xv=K.XV*inland,bsh=K.BSh*inland,xs=K.XS*inland;
 const panEdge=smooth(.05,.35,pan)*smooth(.95,.6,pan)*live+smooth(.0,.1,F('salt'))*smooth(.5,.2,pan)*K.XS*live*.6;
 const age=(aw+xv+bsh+xs)>.02?RINGISLES.burnAge(x,z):9;
 const xaShare=(xa+af)>.01?xa/(xa+af):0;
 return{K,slope,rock,cliff,live,xa,af,am,aw,xv,bsh,xs,forest:xa+af+am,sav:aw+xv,step:bsh+xs,xaShare,
  strand:beach*live,dune:dune*live*(1-smooth(.3,.6,beach)),mangal,lagoon,reef,bench,pan:pan*(1-cliff),panEdge,garden,thermal,
  age,burn:RINGISLES.burnState(age),wet:F('wet'),salt:F('salt')};}
RINGISLES.zones=zones;

// ---------------------------------------------------------------- colour (the maths is the core's, BIO.col)
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;const lm=RINGISLES.LIBMEAN||{},lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};
 MEAN={bark:RINGISLES.BARKTEX.map((t,k)=>lm['bark'+k]!=null?lin(lm['bark'+k]):texMean(t)),wood:lm.wood!=null?lin(lm.wood):texMean(RINGISLES.WOODTEX),
  rock:lm.rock!=null?lin(lm.rock):texMean(RINGISLES.ROCKTEX),coral:lm.coral!=null?lin(lm.coral):texMean(RINGISLES.CORALTEX)};return MEAN;}
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.04:dh,ds==null?.12:ds,dl==null?.07:dl),k==null?1.3:k);
const barkCol=(S,k,bi)=>tint(S.bark[k%S.bark.length],means().bark[bi],1);
Object.assign(RINGISLES,{means,tint,bright,shade,vary,leafCol});

// ---------------------------------------------------------------- polyline and foliage helpers
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
const tip=pts=>pts[pts.length-1];
function along(pts,u){const f=clamp(u,0,1)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),t=f-i,a=pts[i],b=pts[i+1];return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),r:mix(a.r,b.r,t)};}
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,ao=mix(.6,1,smooth(.3,.95,Math.hypot(dx,dy,dz)))*mix(.84,1,smooth(-.6,.35,dy))*rr(.9,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
function frondAt(item,x,y,z,a,L,pitch,col,wid){BIO.put(item,[x,y,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*rr(.85,1.05),L*(wid||rr(1.1,1.4))],col,{n:[Math.cos(a)*.35,1,Math.sin(a)*.35]});}
// a tube along pts in bucket fam, its rings coloured by the species' bark, closed at its tip
function limb(fam,S,bi,pts,lv,st,seg){pts.forEach((p,k)=>{if(!p.col)p.col=barkCol(S,k,bi);});st.trunk+=BIO.tube(fam,pts,pts[0].col,{seg:seg||(lv===2?6:4),cap:true});}
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:r,h:h});
const fruitH=(T,i,k)=>h3(T.seed*.001+i*1.37,k*.71+T.sp,T.x*.013+T.z*.007);
RINGISLES._h={treeGrow,dirOf,tip,along,clumpAt,frondAt,limb,barkCol,leafCol,fruitH,means};

// ---------------------------------------------------------------- the builders: (T, st, lv) with lv 2 near, 1 mid
const B=[];RINGISLES._B=B;RINGISLES._h.regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:r,h:h});
// 0 the SCRUB THORN: three to six thin dark stems from one root, splayed out in a vase and kinked, each forking near its
// top into near-level branches that run out to the rim; a flat, wide, layered umbrella of fine sprays over them (the top
// plate widest and densest, one or two thinner plates under it), a little domed at the middle; the near ones a few pale
// thorn twigs; each tree its own share of dry yellow-olive sprays (the dry season browning the crown unevenly)
B[0]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(pick(S.leaf)),dc=C(pick(PAL.thornDry)),dry=rr(.05,.4),tips=[];let top=T.y0;
 const n=lv===2?ri(3,6):3,a0=rr(0,TAU);
 for(let s=0;s<n;s++){const a=a0+s/n*TAU+rr(-.35,.35),P=treeGrow({x:T.x+rr(-.12,.12),y:T.y0-.15,z:T.z+rr(-.12,.12)},dirOf(a,rr(.85,1.12)),H*rr(.55,.7),T.rb,T.rb*.55,lv===2?4:2,.04,.12);
  limb('bark0',S,0,P,lv,st,lv===2?5:3);const e=tip(P);
  /* the fork: two or three near-level branches out to the rim, and a twig fork off each near */
  for(let k=0,m=lv===2?ri(2,3):2;k<m;k++){const ba=a+(k-(m-1)/2)*rr(.6,.9),Lb=R*rr(.5,.8),Q=treeGrow(e,dirOf(ba,rr(.18,.45)),Lb,e.r*.8,.015,lv===2?3:2,-.06,.1);
   limb('bark0',S,0,Q,lv,st,3);tips.push(tip(Q));top=Math.max(top,tip(Q).y);
   if(lv===2){const c=along(Q,rr(.4,.6)),W=treeGrow(c,dirOf(ba+rr(-1.1,1.1),rr(.1,.4)),R*rr(.25,.4),c.r*.7,.01,2,-.03,.1);limb('bark0',S,0,W,lv,st,3);tips.push(tip(W));}}}
 /* a few pale thorn twigs, short and stiff, under the near ones' crown */
 if(lv===2)for(let k=0;k<6;k++){const p=pick(tips),q=treeGrow({x:p.x,y:p.y-.05,z:p.z},dirOf(rr(0,TAU),rr(-.5,.3)),rr(.25,.45),.012,.004,1,0,0);q.forEach(v=>v.col=C(0xc8c0a8));limb('bark0',S,0,q,lv,st,3);}
 const tiers=lv===2?ri(2,3):1,rim=Math.max(R,...tips.map(p=>Math.hypot(p.x-T.x,p.z-T.z)*1.05));
 for(let t=0;t<tiers;t++){const y=top+.1-t*H*.13,r=rim*(t===0?1:t===1?.72:.5);
  for(let k=0,m=lv===2?(t===0?ri(24,32):ri(8,12)):9;k<m;k++){const p=pick(tips),u=Math.sqrt(rng()),a=rr(0,TAU),d=r*u*.9;
   const x=mix(T.x+Math.cos(a)*d,p.x,.4),z=mix(T.z+Math.sin(a)*d,p.z,.4),col=vary(rng()<dry?dc:hc,.02,.08,.06);
   clumpAt('thornspray',x,y+.22*(1-u)+rr(-.08,.12),z,r*rr(.32,.45)*(lv===2?1:1.6),.22,col,T.x,y,T.z,r,H*.15);st.clumps++;}}
 regTree(T,S,rim+.4,top-T.y0+.6);};
// 1 the CORKWOOD: a short swollen green-bronze trunk shedding papery flakes, three to five stubby twisted limbs up and out,
// a thin crown of small trifoliate leaves (bare-ish in the dry season)
B[1]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(pick(S.leaf));
 const tr=treeGrow({x:T.x,y:T.y0-.2,z:T.z},dirOf(rr(0,TAU),rr(1.35,1.5)),H*.42,T.rb*1.5,T.rb*.9,lv===2?4:2,0,.06);tr[1].r*=1.15;
 tr.forEach((p,k)=>{p.col=k%2?barkCol(S,k,1):tint(pick(PAL.corkPeel),means().bark[1],1);});limb('bark1',S,1,tr,lv,st,lv===2?7:4);
 const top=tip(tr),tips=[];
 for(let k=0,n=lv===2?ri(3,5):3;k<n;k++){const a=k/n*TAU+rr(-.4,.4),P=treeGrow(top,dirOf(a,rr(.45,.95)),H*rr(.4,.6),T.rb*.7,.04,lv===2?4:2,-.04,.16);limb('bark1',S,1,P,lv,st,4);tips.push(tip(P));
  if(lv===2){const q=along(P,.6),L=treeGrow(q,dirOf(a+rr(-1,1),rr(.3,.8)),H*.25,q.r*.6,.02,2,0,.2);limb('bark1',S,1,L,lv,st,3);tips.push(tip(L));}}
 for(const p of tips){for(let c=0,n=lv===2?ri(1,3):1;c<n;c++){clumpAt('trifol',p.x+rr(-.4,.4),p.y+rr(-.1,.3),p.z+rr(-.4,.4),R*rr(.35,.5)*(lv===2?1:1.4),.6,hc,T.x,top.y+H*.3,T.z,R,H*.3);st.clumps++;}}
 let rc=R*.5;for(const p of tips)rc=Math.max(rc,Math.hypot(p.x-T.x,p.z-T.z)+R*.5);regTree(T,S,rc,H+1);};
// 2 the SALT CEDAR: many slender arching stems from the salt, red-brown; drooping feathery grey-green sprays; pink plumes
B[2]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(pick(S.leaf)),tips=[];
 for(let s=0,n=lv===2?ri(5,9):3;s<n;s++){const a=rr(0,TAU),P=treeGrow({x:T.x+rr(-.3,.3),y:T.y0-.15,z:T.z+rr(-.3,.3)},dirOf(a,rr(1.05,1.35)),H*rr(.7,1),T.rb,T.rb*.3,lv===2?4:2,-.12,.1);
  limb('bark2',S,2,P,lv,st,lv===2?4:3);tips.push(P);}
 for(const P of tips)for(let c=0,n=lv===2?ri(3,5):2;c<n;c++){const p=along(P,rr(.45,1));
  clumpAt('tamfoliage',p.x+rr(-.5,.5),p.y-rr(0,.4),p.z+rr(-.5,.5),R*rr(.45,.65)*(lv===2?1:1.4),.9,hc,T.x,T.y0+H*.65,T.z,R,H*.35);st.clumps++;
  if(lv===2&&rng()<.45){const s=rr(.4,.8);BIO.put('plume',[p.x,p.y-.1,p.z],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[s*.6,s,s*.6],leafCol(PAL.tamBloom,1.15,.02,.06,.05));st.blooms++;}}
 regTree(T,S,R+.4,H+.4);};
// 3 the STRAND PANDANUS: a ringed trunk leaning out over the sand on a skirt of prop roots, forking once or twice; at each
// tip a spiral tuft of long keeled strap leaves drooping at their ends; orange fruit heads (the keys) hanging under one
B[3]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(pick(S.leaf));const la=T.leanA==null?rr(0,TAU):T.leanA+rr(-.4,.4);
 const tr=treeGrow({x:T.x,y:T.y0+.6,z:T.z},dirOf(la,rr(1.15,1.38)),H*.55,T.rb,T.rb*.8,lv===2?5:3,.06,.04);limb('bark3',S,3,tr,lv,st,lv===2?6:4);
 // the prop roots: from the lower trunk, splaying down into the sand
 for(let k=0,n=lv===2?ri(5,9):3;k<n;k++){const a=k/n*TAU+rr(-.3,.3),p=along(tr,rr(.0,.25)),d=rr(.9,1.8)+p.y-T.y0,ex=T.x+Math.cos(a)*d,ez=T.z+Math.sin(a)*d,ey=Y(ex,ez)-.3;
  st.trunk+=BIO.tube('bark3',[{x:p.x,y:p.y,z:p.z,r:T.rb*.35},{x:mix(p.x,ex,.55),y:mix(p.y,ey,.4),z:mix(p.z,ez,.55),r:T.rb*.3},{x:ex,y:ey,z:ez,r:T.rb*.28}],barkCol(S,k,3),{seg:lv===2?5:3});}
 const top=tip(tr),heads=[];
 for(let k=0,n=lv===2?ri(2,4):2;k<n;k++){const a=la+k/n*TAU+rr(-.5,.5),P=treeGrow(top,dirOf(a,rr(.5,1.0)),H*rr(.3,.45),T.rb*.7,T.rb*.45,3,.05,.06);limb('bark3',S,3,P,lv,st,4);heads.push(tip(P));}
 heads.forEach((h,hi)=>{for(let k=0,n=lv===2?ri(14,20):7;k<n;k++){const a=k*GOLD+rr(-.1,.1),age=k/n,L=R*rr(.55,.8)*(age<.25?.7:1);
   frondAt('strap',h.x,h.y,h.z,a,L,lerp(1.0,-.35,age)+rr(-.1,.1),bright(vary(hc,.02,.08,.06),RINGISLES.LIB.strap?1:1.2),rr(.35,.5));st.clumps++;}
  if(lv===2&&fruitH(T,hi,1)<.5){const s=rr(.18,.26);BIO.put('fruit',[h.x+rr(-.2,.2),h.y-.35,h.z+rr(-.2,.2)],qEuler(rr(-.2,.2),rr(0,TAU),0),[s,s*1.25,s],C(pick(PAL.pandanFruit)));st.fruit++;}});
 regTree(T,S,R+Math.hypot(top.x-T.x,top.z-T.z),top.y-T.y0+R*.4);};
// 4 the SEA GRAPE: a low sprawl of leaning trunks out of the sand, branching, under a mass of big round leathery leaves,
// red-veined, a few reddened; bunches of grapes in the near ones
B[4]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(pick(S.leaf)),tips=[];
 for(let s=0,n=lv===2?ri(2,4):2;s<n;s++){const a=rr(0,TAU),P=treeGrow({x:T.x,y:T.y0-.15,z:T.z},dirOf(a,rr(.55,.95)),H*rr(.8,1.15),T.rb,T.rb*.4,lv===2?4:2,.1,.12);limb('bark4',S,4,P,lv,st,lv===2?5:3);
  tips.push(tip(P));if(lv===2){const q=along(P,.55),L=treeGrow(q,dirOf(a+rr(-1.1,1.1),rr(.4,.9)),H*.45,q.r*.7,.03,2,0,.1);limb('bark4',S,4,L,lv,st,3);tips.push(tip(L));}}
 for(const p of tips)for(let c=0,n=lv===2?ri(3,5):2;c<n;c++){const red=rng()<.1;
  clumpAt('grapeleaf',p.x+rr(-.6,.6),p.y+rr(-.3,.3),p.z+rr(-.6,.6),R*rr(.4,.6)*(lv===2?1:1.4),.7,red?C(pick(PAL.grapeVein)):hc,T.x,T.y0+H*.6,T.z,R,H*.4);st.clumps++;}
 if(lv===2)for(let b=0,nb=ri(0,3);b<nb;b++){const p=pick(tips);for(let k=0;k<ri(6,10);k++){const s=rr(.05,.07);BIO.put('fruit',[p.x+rr(-.25,.25),p.y-rr(.2,.7),p.z+rr(-.25,.25)],null,s,C(pick(PAL.grapeFruit)));st.fruit++;}}
 let rc=R*.5;for(const p of tips)rc=Math.max(rc,Math.hypot(p.x-T.x,p.z-T.z)+R*.5);regTree(T,S,rc,H+1);};
// 5 the BREADFRUIT: a straight grey trunk to a broad dome of huge deeply lobed glossy leaves, the round green fruit among them
B[5]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(pick(S.leaf));
 const tr=treeGrow({x:T.x,y:T.y0-.3,z:T.z},dirOf(rr(0,TAU),rr(1.42,1.55)),H*.55,T.rb,T.rb*.6,lv===2?5:3,0,.04);limb('bark4',S,4,tr,lv,st,lv===2?7:4);
 const tips=[tip(tr)];
 for(let k=0,n=lv===2?ri(5,7):3;k<n;k++){const a=k*GOLD+rr(-.2,.2),q=along(tr,rr(.45,.95)),P=treeGrow(q,dirOf(a,rr(.35,.75)),R*rr(.7,.95),q.r*.6,.06,lv===2?4:2,-.05,.08);limb('bark4',S,4,P,lv,st,4);tips.push(tip(P),along(P,.6));}
 const cy=T.y0+H*.72;
 for(let k=0,n=lv===2?ri(26,36):10;k<n;k++){const p=pick(tips),q=rr(0,TAU),d=rr(0,R*.35);clumpAt('breadleaf',p.x+Math.cos(q)*d,Math.max(p.y,cy-R*.3)+rr(0,R*.4),p.z+Math.sin(q)*d,R*rr(.4,.55)*(lv===2?1:1.5),.75,hc,T.x,cy,T.z,R,H*.3);st.clumps++;}
 if(lv===2)for(let k=0,n=ri(4,10);k<n;k++){const p=pick(tips),s=rr(.13,.18);BIO.put('fruit',[p.x+rr(-1,1),p.y-rr(.2,.8),p.z+rr(-1,1)],null,s,C(pick(PAL.breadFruit)));st.fruit++;}
 regTree(T,S,R+.5,H+R*.3);};
// 6 the BANANA: a clump of three to six pseudostems, each crowned with arching paddle leaves torn by the wind, one dead and
// hanging; on the tallest a hanging bunch and its purple bell
B[6]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(pick(S.leaf));let top=T.y0;
 for(let s=0,n=lv===2?ri(3,6):3;s<n;s++){const a=s*GOLD,d=s?rr(.4,.9):0,x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,h=H*(s?rr(.45,.9):1),y0=Y(x,z)-.1;
  const P=[{x,y:y0,z,r:T.rb*(s?.8:1)},{x:x+rr(-.08,.08),y:y0+h*.5,z:z+rr(-.08,.08),r:T.rb*(s?.7:.88)},{x:x+rr(-.12,.12),y:y0+h,z:z+rr(-.12,.12),r:T.rb*(s?.55:.7)}];limb('bark5',S,5,P,lv,st,lv===2?7:4);
  const e=tip(P);top=Math.max(top,e.y);
  for(let k=0,m=lv===2?ri(6,9):4;k<m;k++){const aa=k*GOLD+rr(-.15,.15),age=k/m,L=R*rr(.85,1.1)*(s?.75:1)*(age<.2?.7:1);frondAt('paddle',e.x,e.y,e.z,aa,L,lerp(1.1,-.2,age)+rr(-.1,.1),bright(vary(hc,.02,.08,.06),1.15),rr(.32,.42));st.clumps++;}
  if(lv===2&&rng()<.6){const aa=rr(0,TAU),L=R*rr(.6,.8);frondAt('paddle',e.x,e.y-.3,e.z,aa,L,-1.3,leafCol(PAL.bananaDead,1,.02,.05,.05),.3);}
  if(!s&&lv===2){const bx=e.x+rr(-.3,.3),bz=e.z+rr(-.3,.3);BIO.beam('rod',[e.x,e.y-.2,e.z],[bx,e.y-1.4,bz],.04,.03,C(pick(PAL.bananaStem)));
   for(let k=0;k<ri(10,16);k++){const s2=rr(.07,.09),q=rr(0,TAU);BIO.put('fruit',[bx+Math.cos(q)*.16,e.y-rr(.6,1.2),bz+Math.sin(q)*.16],qEuler(0,q,.4),[s2,s2*2.2,s2],C(pick(PAL.bananaBunch)));st.fruit++;}
   BIO.put('gingerbloom',[bx,e.y-1.55,bz],qEuler(Math.PI,0,0),[.22,.38,.22],C(0x6a2a48));}}
 regTree(T,S,R+.8,top-T.y0+R*.3);};

// ---------------------------------------------------------------- impostors (the far canopy)
let ICO=null;
function buildFar(T,fi,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;let tris=0;
 const vtx=(x,y,z,nx,ny,nz,r,g,b)=>{K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);};
 const kk=BIO._lodKey(T.x,T.z),F=S.far,bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear();
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.1*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.55+.45*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2)),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}tris+=ip.length/9;}
 const top=T.y0+T.H*F.poleU,rings=[0,.5,1].map(u=>({x:T.x,y:T.y0+(top-T.y0)*u,z:T.z,r:Math.max(.12,T.rb*(1-.4*u)),yy:u,col:[bc.r*.8,bc.g*.8,bc.b*.8]}));
 st.far+=BIO.lathe('far',rings,4,1,1,(Rg)=>Rg.r,null);
 const L=S.leaf.map(h=>bright(h,.9)),a0=(T.seed%628)/100,colOf=c=>typeof c==='number'?c:c==='L0'?L[fi%L.length]:L[+c[1]%L.length];
 F.blobs.forEach((b,bi)=>blob(T.x,T.y0+T.H*b[0],T.z,T.crownR*b[1],T.H*b[2],colOf(b[3]),colOf(b[4]),fi+bi));
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- keep-clear between trees
const HC=60,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+20;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
RINGISLES.blocked=blocked;RINGISLES.hadd=hadd;

// ---------------------------------------------------------------- borrowed trees: grown by their own kits, in place
// BORROW's kit and src name the species; its own make (H, rb, crownR and seed from its kit's stream) then this kit's
// scale (the island's size), then its own grow at the level asked: its own buckets, items and far tree. swbay has no
// make/grow: its treeAt grows one tree (hero and its lite stand-in, by its runtime LOD). Returns the tree, or null when
// the kit is not on the page (KNOWN_ISSUES.md: a world that leaves a kit out loses only its species)
const newStats=()=>({trunk:0,far:0,clumps:0,blooms:0,fruit:0,heroes:0,fars:0,borrowed:0,byS:SP.map(()=>0),byB:RINGISLES.BORROW.map(()=>0)});
RINGISLES.kitOf=Bo=>{const R=BIO.kits[Bo.kit];return R&&R.api?R.api:null;};
function borrowGrow(Bo,x,y,z,lv,k,extra){const api=RINGISLES.kitOf(Bo);if(!api)return null;
 if(Bo._sp==null)Bo._sp=(api.SPECIES||[]).findIndex(S=>S.key===Bo.src);if(Bo._sp<0)return null;
 if(Bo.treeAt){if(!api.treeAt)return null;const T=api.treeAt(Bo.src,x,y,z,{scale:k,seed:ri(0,999999)});if(T)T.borrow=Bo.key;return T;}
 if(!api.make||!api.grow)return null;
 const T=api.make(Bo._sp,x,y,z);T.H*=k;T.rb*=k;T.crownR*=Math.sqrt(k);if(extra)Object.assign(T,extra);T.borrow=Bo.key;
 const r=api.grow(T,lv);if(r===null&&lv===0)return null;return T;}
RINGISLES.borrowGrow=borrowGrow;
// ---------------------------------------------------------------- one of this kit's own trees at a point, the shape every kit's make/grow has
// RINGISLES.make(sp, x, y, z) -> T, RINGISLES.grow(T, lv) -> stats. An open world's nursery grows each species' variants
// with them (openworld/little-demo/src/84-world-nursery.js; 66-biome-ringisles-world.js); the showcase's pass does not.
RINGISLES.make=function(sp,x,y,z){const S=SP[sp];means();
 return{x,z,y0:y-.3,sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),lv:2,leanA:null};};
RINGISLES.grow=function(T,lv){const st=newStats();T.lv=lv;BIO.owner=[T.x,T.z];
 try{if(lv===0)buildFar(T,0,st);else B[T.sp](T,st,lv);}finally{BIO.owner=null;}return st;};

// ---------------------------------------------------------------- the pass
RINGISLES.buildTrees=function(R,q){SP.forEach((S,i)=>{if(typeof B[i]!=='function')BIO.err('ringisles: no builder for species '+i+' '+S.key);});reseed(550071);q=q==null?1:q;R=R||2000;means();
 const st=newStats(),TREES=RINGISLES.TREES;   // the gardens' trees (planted first) stay: RINGISLES.clearTrees starts afresh
 const LOD=BIO.radii();
 function pass(P){const own=RINGISLES.byKey[P.key],Bo=own?null:RINGISLES.borrowOf[P.key],opt=P.opt||{},pad=opt.pad==null?2:opt.pad;let n=0;
  if(!own&&!Bo){BIO.err('ringisles: no species '+P.key);return 0;}
  if(Bo&&!RINGISLES.kitOf(Bo))return 0;
  BIO.grid(P.cell,0,R,(x,z)=>{const Z=zones(x,z);const a=P.accept(Z,x,z);return a<=0?0:a*q;},
   (x,y,z)=>{if(blocked(x,z,pad))return;const Z=zones(x,z);if(Z.cliff>.45||(P.need&&Z[P.need]<.3))return;const ld=BIO.lodD(x,z),lv=ld<LOD.hero?2:(ld<LOD.mid?1:0);
    // on the beach a tree leans out over the sand, toward the water (the Throne's palms read the same field themselves)
    let leanA=null;if(Z.strand>.25||Z.dune>.3){const e=3,gx=Y(x+e,z)-Y(x-e,z),gz=Y(x,z+e)-Y(x,z-e);if(gx||gz)leanA=Math.atan2(-gz,-gx);}
    if(own){const S=own,T={x,z,y0:y-.3,sp:S.i,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),lv,leanA};
     if(P.k){const k=P.k(Z);T.H*=k;T.crownR*=Math.sqrt(k);}
     TREES.push(T);hadd({x,z,r:T.rb*1.6+.6+(opt.reach||0)});n++;
     BIO.owner=[x,z];if(lv===0){buildFar(T,TREES.length-1,st);st.fars++;}else{B[T.sp](T,st,lv);st.heroes++;}BIO.owner=null;st.byS[T.sp]++;return;}
    const k=(Bo.scale||1)*(Bo.xa?mix(1,Bo.xa,Z.xaShare):1),T=borrowGrow(Bo,x,y,z,lv,k,leanA!=null?{leanA}:null);if(!T)return;
    T.lv=lv;TREES.push(T);hadd({x,z,r:(T.rb||.3)*1.6+.6+(opt.reach||0)});n++;st.borrowed++;st.byB[Bo.i]++;},
   {patch:opt.patch==null?.5:opt.patch,patchScale:opt.patchScale||.012,pad:1,noMask:!!P.depth,depth:P.depth||null});
  return n;}
 RINGISLES.PASSES.forEach(P=>{const cur=BIO.cur;pass(P);BIO.cur=cur;});
 RINGISLES.COUNTS=SP.map((S,i)=>st.byS[i]);RINGISLES.BCOUNTS=RINGISLES.BORROW.map((B2,i)=>st.byB[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,borrowed:st.borrowed,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).concat(RINGISLES.BORROW.map((B2,i)=>B2.key+':'+st.byB[i])).join(' '),
  clumps:st.clumps,blooms:st.blooms,fruit:st.fruit,tris:{trunk:st.trunk,far:st.far}};};
// ---------------------------------------------------------------- one tree where a world puts it (a garden's, a town's)
// RINGISLES.treeAt(key, x, y, z, opt): this kit's species or a borrowed one by key, standing at (x, y, z), at lv (default 2
// within the hero radius of the spine, else 1 or the far tree). opt {seed, scale, lv, leanA}. Draws from its own seed.
// Returns the tree (in RINGISLES.TREES and the keep-clear), or null
RINGISLES.treeAt=function(key,x,y,z,opt){opt=opt||{};const own=RINGISLES.byKey[key],Bo=own?null:RINGISLES.borrowOf[key];if(!own&&!Bo)return null;
 reseed(opt.seed==null?((Math.floor(x*31.7)*73856093^Math.floor(z*17.3)*19349663)>>>0):opt.seed);means();
 const L=BIO.radii(),ld=BIO.lodD(x,z),lv=opt.lv!=null?opt.lv:ld<L.hero?2:ld<L.mid?1:0,k=opt.scale||1,st=newStats();let T;
 if(own){T={x,z,y0:y-.3,sp:own.i,H:rr(own.H[0],own.H[1])*k,rb:rr(own.rb[0],own.rb[1])*k,crownR:rr(own.crownR[0],own.crownR[1])*Math.sqrt(k),seed:ri(0,999999),lv,leanA:opt.leanA==null?null:opt.leanA};
  BIO.owner=[x,z];if(lv===0)buildFar(T,RINGISLES.TREES.length,st);else B[T.sp](T,st,lv);BIO.owner=null;}
 else{T=borrowGrow(Bo,x,y,z,lv,(Bo.scale||1)*k,opt.leanA!=null?{leanA:opt.leanA}:null);if(!T)return null;T.lv=lv;}
 RINGISLES.TREES.push(T);hadd({x,z,r:(T.rb||.3)*1.6+.6});return T;};
RINGISLES.clearTrees=function(){RINGISLES.TREES.length=0;for(const k in HASH)delete HASH[k];};
RINGISLES._canopyH=function(x,z){let h=0;for(const T of RINGISLES.TREES){if(Math.abs(x-T.x)<40&&Math.abs(z-T.z)<40)h=Math.max(h,T.y0+T.H);}return h||3;};
RINGISLES.nearestTree=function(key,x,z,minH){let b=null,bd=1e9;for(const T of RINGISLES.TREES){const k=T.borrow||SP[T.sp].key;if(k!==key||(T.lv!=null&&T.lv<2)||(minH&&T.H<minH))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};

// ---------------------------------------------------------------- the passes (data: species or borrowed key, cell, acceptance from the zones)
// The big trees first (they claim their ground), each zone's in turn; depth: a pass that plants IN the water asks for its
// window (the mangroves). k: a size by the zone (the XA forest's trees taller: its borrowed ones by BORROW's xa)
RINGISLES.PASSES=[
 // the forest: lehua over tree ferns, arch palms and palm frills; the XA forest the same, taller and denser
 {key:'lehua',cell:12,accept:Z=>Z.xa*.78+Z.af*.6+Z.am*.32,opt:{pad:2.5,patch:.35,patchScale:.01}},
 {key:'palmfrill',cell:26,accept:Z=>Z.xa*.32+Z.af*.28+Z.am*.12,opt:{pad:2.5,patch:.5}},
 {key:'archpalm',cell:17,accept:Z=>Z.xa*.3+Z.af*.32+Z.am*.24,opt:{pad:2,patch:.5}},
 {key:'kneetree',cell:40,accept:Z=>Z.xa*.12*smooth(.6,.85,Z.wet),opt:{pad:4}},
 {key:'breadfruit',cell:60,accept:Z=>(Z.af+Z.xa)*.05,opt:{pad:3}},
 {key:'treefern',cell:8,accept:Z=>Z.xa*.42+Z.af*.4+Z.am*.08,opt:{pad:1.2,patch:.6,patchScale:.02}},
 // the savanna: baobabs and umbrella thorns standing alone, borassus-like fan palms, the gill-parasols; the scrub thorn
 {key:'baobab',cell:80,accept:Z=>Z.aw*.2+Z.xv*.26+Z.bsh*.12,opt:{pad:8,patch:.3}},
 {key:'umbrellathorn',cell:32,accept:Z=>Z.aw*.3+Z.xv*.26+Z.bsh*.08,opt:{pad:4,patch:.55,patchScale:.008}},
 {key:'fanpalm',cell:30,accept:Z=>Z.am*.2+Z.aw*.14+Z.xv*.16,opt:{pad:2,patch:.6}},
 {key:'gillparasol',cell:70,accept:Z=>Z.aw*.16,opt:{pad:4,patch:.5}},
 {key:'scrubthorn',cell:12,accept:Z=>Z.aw*.18+Z.xv*.24+Z.bsh*.3+Z.xs*.08,opt:{pad:1.4,patch:.75,patchScale:.014}},
 // the steppe: corkwood, star aloes and bottle trees over the bunchgrass
 {key:'corkwood',cell:18,accept:Z=>Z.bsh*.42+Z.xs*.12+Z.xv*.05,opt:{pad:1.6,patch:.6}},
 {key:'staraloe',cell:26,accept:Z=>Z.bsh*.28+Z.xs*.08+Z.aw*.03,opt:{pad:2,patch:.6}},
 {key:'bottle',cell:30,accept:Z=>Z.bsh*.26+Z.xs*.08,opt:{pad:2.5,patch:.6}},
 // the salt: salt cedars round the pan and on the salt steppe
 {key:'tamarisk',cell:12,accept:Z=>Z.panEdge*.55+Z.xs*.1,opt:{pad:1.5,patch:.5}},
 // the strand: coconuts leaning over the sand, strand pandanus at the high-tide line, sea grape on the back beach and dunes
 {key:'coconut',cell:14,accept:Z=>Z.strand*.42+Z.dune*.08,opt:{pad:2,patch:.5}},
 {key:'strandpandan',cell:12,accept:Z=>Z.strand*.34,opt:{pad:1.8,patch:.55}},
 {key:'seagrape',cell:10,accept:Z=>Z.strand*.26+Z.dune*.3,opt:{pad:1.5,patch:.6}},
 // the mangal: the hyper-mangroves standing in the bay's water and on its mud, stilt-wood behind them
 {key:'mangrove',cell:18,accept:Z=>Z.mangal*.75,depth:[-.6,1.1],need:'mangal',opt:{pad:3,patch:.3}},
 {key:'stiltwood',cell:16,accept:Z=>Z.mangal*.3+Z.xa*.04,opt:{pad:2,patch:.5}},
];
// (the stilt-wood's pass plants on the mangal's landward edge: its mask keeps it out of the water)
})();
