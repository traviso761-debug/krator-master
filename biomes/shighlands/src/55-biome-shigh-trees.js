// ================================================================= SOUTHERN HIGHLANDS — trees
// The ten tree-scale species, each with its own builder, placed by zone from the host's fields (above all `fog`: how
// often the ground stands in cloud). Every builder turns its spirals by the tree's own hand, T.hand: +1 (right-handed,
// SHIGH.HAND) for all but the rare mirror-handed tree. A lathe's ridges wind by it, a limb's corkscrew turns by it,
// leaves are set round by it, and the spiral items are drawn with their x scale times it.
// Beyond the LOD spine a tree becomes an impostor in the 'far' bucket. Every count scales with q.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=SHIGH.SPECIES,PAL=SHIGH.PAL,GOLD=SHIGH.GOLD;
const T3=BIO.host.THREE,C=SHIGH.C;
SHIGH.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// The world's fields (biomes/WORLD.md): wet, flow, rock, slope, oasis (the bogs), canyon (the ravines), cold, and
// `fog`, this kit's own: how often the ground stands in cloud. Each 0..1:
//   forest  the cloud forest: the scarp at the cloud deck and the ravines the cloud pours up
//   elfin   its upper edge, where the cloud reaches only some days: dwarfed, twisted, moss-laden
//   paramo  the open plateau above the cloud: giant rosettes in tussock
//   dry     the paramo's south-east, drying toward the desert: aloes, cereus
//   bog     the wet hollows: sphagnum, sundews, cushions, lobelias, groundsels round the edge
//   crag    the granite tors
//   ravine  a ravine's floor and walls; stream: its stream
//   cliff   a sheer rock face: nothing roots there (the owner's rule, Oct 2026: every zone is multiplied by 1-cliff)
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const F=n=>BIO.field(n,x,z);
 const wet=F('wet'),flow=F('flow'),rock=F('rock'),slope=F('slope'),oasis=F('oasis'),cold=F('cold'),fog=F('fog'),canyon=F('canyon');
 const cliff=smooth(.8,.95,slope)*smooth(.3,.6,rock),live=1-cliff;
 const crag=smooth(.35,.65,rock)*live,bog=smooth(.45,.8,oasis)*(1-crag)*live,rest=(1-crag)*(1-bog)*live;
 const fF=smooth(.5,.72,fog),fE=smooth(.28,.48,fog);
 const forest=fF*rest,elfin=fE*(1-fF)*rest,open=(1-fE)*rest,dryK=smooth(.44,.24,wet);
 const stream=smooth(.4,.75,flow)*(1-smooth(.3,.6,oasis))*live;
 return{wet,flow,rock,slope,cold,fog,cliff,crag,bog,forest,elfin,paramo:open*(1-dryK),dry:open*dryK,ravine:smooth(.2,.6,canyon)*live,stream};}
SHIGH.zones=zones;

// ---------------------------------------------------------------- colour (the maths is the core's, BIO.col)
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={bark:SHIGH.BARKTEX.map(t=>texMean(t)),wood:texMean(SHIGH.WOODTEX),rock:texMean(SHIGH.ROCKTEX)};
 // a library map's mean is the pack's (an sRGB grey: its linear value per channel)
 const lm=SHIGH.LIBMEAN||{},lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};MEAN.bark=MEAN.bark.map((m,k)=>lm['bark'+k]!=null?lin(lm['bark'+k]):m);
 if(lm.rock!=null)MEAN.rock=lin(lm.rock);
 return MEAN;}
Object.assign(SHIGH,{means,tint,bright,shade,vary});
const BARKC={};
const barkCol=(S,k)=>{const key=S.key+(k%S.bark.length);return BARKC[key]||(BARKC[key]=tint(S.bark[k%S.bark.length],means().bark[S.barkK]));};
const mossCol=(S)=>tint(pick(PAL.mossStreak),means().bark[S.barkK],rr(.9,1.1));
// the library's wrung bark carries its own moss in the creases: the procedural moss rings are only for the canvas bark
const LIBWRUNG=SHIGH.LIB&&SHIGH.LIB.has('bark.wrung');
const rodCol=(hex,f)=>shade(C(hex),f==null?-.25:f);
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.05:dh,ds==null?.14:ds,dl==null?.07:dl),k==null?1.3:k);
const nearW=(k)=>bright(vary(C(0xffffff),.02,.05,.05),k==null?1:k);
SHIGH.leafCol=leafCol;

// ---------------------------------------------------------------- spiral helpers
// a spiral item's scale with its hand: a mirror-handed plant is the same item with its x scale negated
const hs=(T,s)=>typeof s==='number'?[s*T.hand,s,s]:[s[0]*T.hand,s[1],s[2]];
// the same for an item that lies along +x (a scroll, a frill leaf): mirrored across its own length, in z
const hz=(T,s)=>typeof s==='number'?[s,s,s*T.hand]:[s[0],s[1],s[2]*T.hand];
// a LIMB that corkscrews round its own axis as it grows: from o along d, len long, radius r0..r1, `coil` metres off
// the axis at its widest, `turns` turns, wound by hand
function corkscrew(o,d,len,r0,r1,n,coil,turns,hand,curve){let p1=[-d[2],0,d[0]];const l1=Math.hypot(...p1)||1;p1=p1.map(v=>v/l1);
 const p2=[d[1]*p1[2]-d[2]*p1[1],d[2]*p1[0]-d[0]*p1[2],d[0]*p1[1]-d[1]*p1[0]],ph=rr(0,TAU),pts=[];
 for(let k=0;k<=n;k++){const t=k/n,f=ph+hand*turns*TAU*t,c=coil*Math.sin(Math.PI*Math.min(1,t*1.2))*Math.min(1,t*3);
  pts.push({x:o.x+d[0]*len*t+(p1[0]*Math.cos(f)+p2[0]*Math.sin(f))*c,y:o.y+d[1]*len*t+(curve||0)*len*t*t+(p1[1]*Math.cos(f)+p2[1]*Math.sin(f))*c,
   z:o.z+d[2]*len*t+(p1[2]*Math.cos(f)+p2[2]*Math.sin(f))*c,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
function along(pts,u){const f=clamp(u,0,1)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),t=f-i,a=pts[i],b=pts[i+1];return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),r:mix(a.r,b.r,t)};}
// a TWISTED TRUNK by lathe: rings up the bole (leaning, wandering a little), radius rAt(u), `lobes` ridges winding up
// it one turn every `pitch` metres by hand, amplitude amp. Returns the rings' centre line as points.
function twistTrunk(T,S,fam,H,rAt,lobes,amp,pitch,lv,colAt,o){o=o||{};const st=o.st,ph=rr(0,TAU),lean=o.lean==null?rr(0,.05):o.lean,la=rr(0,TAU),wig=o.wig==null?.04:o.wig,w1=rr(-1,1)*wig,w2=rr(-1,1)*wig;
 const rings=[],du=lv===2?(o.du||.04):.1;
 for(let u=0;u<=1.0001;u+=du){const w=(w1*Math.sin(u*Math.PI)+w2*Math.sin(u*TAU))*H,x=T.x+Math.cos(la)*lean*H*u*u+Math.cos(ph)*w,z=T.z+Math.sin(la)*lean*H*u*u+Math.sin(ph)*w,y=T.y0-.3+(H+.3)*u;
  rings.push({x,y,z,r:rAt(u),yy:u*H,u,col:colAt?colAt(u,y):barkCol(S,Math.floor(u*7))});}
 const seg=lv===2?(o.seg||12):7;
 // the texture's tile is the bucket's (a library set's own size in metres, or the canvas's)
 const uvs=BIO.bucket(fam).uvScale;
 st.trunk+=BIO.lathe(fam,rings,seg,Math.max(1,Math.round(TAU*rAt(.3)/uvs[0])),uvs[1],(Rg,a)=>Rg.r*(1+amp*Math.sin(lobes*a-T.hand*Rg.yy/pitch*TAU+ph)),(Rg,a)=>.82+.18*Math.sin(lobes*a-T.hand*Rg.yy/pitch*TAU+ph));
 return rings.map(R=>({x:R.x,y:R.y,z:R.z,r:R.r}));}

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
SHIGH.blocked=blocked;

// ---------------------------------------------------------------- foliage helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.55,1,smooth(.3,.95,qq))*mix(.82,1,smooth(-.6,.35,dy))*rr(.9,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
// a frond (a strip along +x) from (x,y,z) heading azimuth a, pitched el, L long and W wide
function frondAt(item,x,y,z,a,L,el,W,col){BIO.put(item,[x,y,z],qEuler(rr(-.08,.08),-a,el),[L,L,W],col);}
// moss on a limb or trunk, and the epiphytes of the cloud: tank bromeliads (silver rosettes with coral hearts) on the
// limbs, corkscrew bells hung below them
function mossAt(x,y,z,s){BIO.put('moss',[x,y,z],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[s,s*.7,s],leafCol(PAL.moss,1.15,.03,.08,.06),{n:[0,1,0]});}
function epiphytes(T,P,st,k){if(rng()<.38*k){const s=rr(.25,.45);BIO.put('rosette',[P.x,P.y+P.r*.8,P.z],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),hs(T,[s,s*.9,s]),leafCol(rng()<.5?PAL.coral:PAL.rose,1.2,.03,.08,.05));st.epi++;}
 if(rng()<.3*k){const L=rr(1.2,3.2);BIO.put('bells',[P.x,P.y-P.r,P.z],qEuler(0,rr(0,TAU),0),hs(T,[L*.9,L,L*.9]),nearW(1.05));st.bells++;}}
const regTree=(T,S,r,h)=>BIO.register({name:S.name+(T.hand<0?' (mirror-handed)':''),key:S.key,x:T.x,z:T.z,y:T.y0,r:r,h:h,hand:T.hand});

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed,hand,fog} and lv 2 near / 1 mid
const B=[];

// 0 the COILBARK: a mauve trunk wrung like a cloth, five ridges winding up it (a turn every 7 m) streaked with moss;
// buttressed at the foot; limbs leave it a golden angle apart and corkscrew outward and up, carrying dusty sage-teal
// leaf, moss, tank bromeliads and corkscrew bells. In the elfin band it stays low and the moss takes over.
B[0]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,elfin=T.fog<.6;
 const rAt=u=>rb*(1-.62*u)*(1+.55*smooth(.1,0,u));
 const C0=twistTrunk(T,S,'bark0',H*.82,rAt,5,.17,rr(5,8),lv,(u,y)=>!LIBWRUNG&&u<.45&&rng()<(.12+.22*T.fog)*(1-u*1.6)?mossCol(S):barkCol(S,Math.floor(u*7)),{st,lean:elfin?rr(.05,.14):rr(0,.05),du:.065,seg:10});
 const nL=lv===2?ri(5,8):3,a0=rr(0,TAU),hc=C(pick(S.leaf)),spots=[];let reach=R*.5,top=T.y0+H*.82;
 for(let k=0;k<nL;k++){const u=rr(.45,.9),p=along(C0,u),la=a0+k*GOLD*T.hand,L=R*rr(.75,1.1)*(1.1-u*.4);
  const lp=corkscrew(p,dirOf(la,rr(.35,.8)),L,p.r*.55,.05,lv===2?6:3,L*.12,rr(.6,1.1),T.hand,-.04);
  if(lv===2)st.limb+=BIO.tube('bark0',lp,barkCol(S,k+2),{seg:lp[0].r>.15?5:4,cap:true});
  else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],lp[0].r*1.6,.05,rodCol(S.bark[0]));
  const e=lp[lp.length-1];spots.push({p:e,s:L*.38,tip:true},{p:lp[Math.floor(lp.length*.6)],s:L*.28});
  if(lv===2){mossAt(lp[1].x,lp[1].y+lp[1].r*.6,lp[1].z,rr(.6,1.2)*(elfin?1.4:1));epiphytes(T,lp[2],st,T.fog);}
  reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+L*.35);top=Math.max(top,e.y);}
 const cy=T.y0+H*.82,sz0=R*.44*(lv===2?1:1.5);
 for(const s of spots){const n=lv===2?(s.tip?3:1):(s.tip?1:0);
  for(let c=0;c<n;c++){const q=rr(0,TAU),d=s.s*.5*Math.sqrt(rng());
   clumpAt('small',s.p.x+Math.cos(q)*d,s.p.y+rr(-.1,.45)*s.s,s.p.z+Math.sin(q)*d,sz0*rr(.85,1.2),.62,hc,T.x,cy,T.z,R,H*.25);st.clumps++;}}
 if(lv===2)for(let k=0,m=elfin?ri(3,6):ri(1,3);k<m;k++){const p=along(C0,rr(.1,.7));mossAt(p.x+rr(-.3,.3),p.y,p.z+rr(-.3,.3),rr(.5,1)*(elfin?1.3:1));}
 regTree(T,S,reach,top-T.y0+R*.4+1);};

// 1 the SPIRAL TRUMPET: a ribbed grey-olive trunk (its ribs winding slowly) carrying long fluted trumpets whose own
// ribs turn as they flare. Two habits, half and half: STACKED, a corkscrew of funnels climbing the upper trunk, each a
// fifth of a turn round from the last and smaller as they rise, one great trumpet straight up at the top; and
// CANDELABRA, three to five corkscrew limbs each holding up one long trumpet.
B[1]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,stack=T.seed%2===0,item=SHIGH.it('trumpet',lv);
 const Ht=stack?H*.86:H*.55,rAt=u=>rb*(1-.5*u)*(1+.35*smooth(.08,0,u));
 const C0=twistTrunk(T,S,'bark1',Ht,rAt,9,.06,rr(9,14),lv,null,{st,lean:rr(0,.04)});
 const tr=(p,dir,L,col)=>{BIO.put(item,[p.x,p.y,p.z],qUp(dir).multiply(qEuler(0,rr(0,TAU),0)),hs(T,[L*.55,L,L*.55]),col);st.trumpets++;};
 let reach=R,top=T.y0+Ht;
 if(stack){const n=lv===2?ri(6,10):ri(4,5),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const u=mix(.32,.94,k/(n-1)),p=along(C0,u),a=a0+T.hand*k*TAU/5,L=mix(R*1.15,R*.6,k/(n-1))*rr(.9,1.1),el=mix(.55,.95,k/(n-1)),d=dirOf(a,el);
   const s=[p.x+d[0]*p.r*.9,p.y,p.z+d[2]*p.r*.9],e=[s[0]+d[0]*.8,s[1]+.5,s[2]+d[2]*.8];
   BIO.beam('rod',s,e,p.r*.5,p.r*.35,rodCol(S.bark[0],-.1));tr({x:e[0],y:e[1],z:e[2]},d,L,nearW());
   reach=Math.max(reach,Math.hypot(e[0]-T.x,e[2]-T.z)+L*.5);top=Math.max(top,e[1]+L*Math.sin(el));}
  const e=C0[C0.length-1],L=R*1.3;tr(e,[0,1,0],L,nearW(1.05));top=Math.max(top,e.y+L);}
 else{const e=C0[C0.length-1],n=lv===2?ri(3,5):3,a0=rr(0,TAU);
  for(let k=0;k<n;k++){const la=a0+k*TAU/n*T.hand+rr(-.2,.2),L=(H-Ht)*rr(.75,1),lp=corkscrew(e,dirOf(la,rr(.95,1.25)),L*.75,e.r*.6,e.r*.3,lv===2?6:3,L*.08,rr(.5,.9),T.hand,0);
   if(lv===2)st.limb+=BIO.tube('bark1',lp,barkCol(S,k),{seg:5,cap:true});else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],e.r*1.1,e.r*.6,rodCol(S.bark[0]));
   const t=lp[lp.length-1],t0=lp[lp.length-2],d=[t.x-t0.x,t.y-t0.y,t.z-t0.z],TL=R*rr(1.2,1.6);tr(t,d,TL,nearW());
   reach=Math.max(reach,Math.hypot(t.x-T.x,t.z-T.z)+TL*.4);top=Math.max(top,t.y+TL*.9);}}
 // moss on the ribs, a bromeliad or two in the cloud
 if(lv===2){for(let k=0,m=ri(1,3);k<m;k++){const p=along(C0,rr(.1,.5));mossAt(p.x,p.y,p.z,rr(.5,.9));}if(T.fog>.5)epiphytes(T,along(C0,rr(.5,.8)),st,.6);}
 regTree(T,S,reach,top-T.y0+1);};

// 2 the VOLUTE TREE (refs/03): a dark straight bole, four to seven great limbs leaving it at the golden angle and
// rising outward, each ending in a scroll: a flat log spiral a few metres across, leafy along its outer edge; smaller
// scrolls along the limbs and one crowning the top. The emergent of the cloud forest.
B[2]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const rAt=u=>rb*(1-.6*u)*(1+.5*smooth(.08,0,u));
 const C0=twistTrunk(T,S,'bark2',H*.7,rAt,4,.05,rr(12,18),lv,null,{st,lean:rr(0,.03)});
 const nL=lv===2?ri(4,7):4,a0=rr(0,TAU);let reach=R,top=T.y0+H*.7;
 const scroll=(p,a,s)=>{const q=qEuler(0,-a,0).multiply(qEuler(rr(-.25,.25),0,rr(-.15,.35)));BIO.put('volute',[p.x,p.y,p.z],q,hz(T,[s,s,s]),leafCol(S.leaf,1.25,.02,.06,.05));st.scrolls++;};
 for(let k=0;k<nL;k++){const u=rr(.6,1),p=along(C0,u),la=a0+k*GOLD*T.hand,L=R*rr(.55,.85);
  const lp=corkscrew(p,dirOf(la,rr(.45,.75)),L,p.r*.6,p.r*.25,lv===2?6:3,L*.05,rr(.3,.6),T.hand,.05);
  if(lv===2)st.limb+=BIO.tube('bark2',lp,barkCol(S,k),{seg:6,cap:true});else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],p.r*1.2,p.r*.5,rodCol(S.bark[0]));
  const e=lp[lp.length-1],s=R*rr(.42,.6);scroll(e,la,s);
  if(lv===2&&rng()<.7){const m=lp[Math.floor(lp.length*.55)];scroll(m,la+T.hand*rr(.6,1.2),s*rr(.4,.6));}
  if(lv===2)epiphytes(T,lp[2],st,T.fog*.8);
  reach=Math.max(reach,Math.hypot(e.x-T.x,e.z-T.z)+s*1.1);top=Math.max(top,e.y+s*1.2);}
 const e=C0[C0.length-1];scroll(e,a0+1,R*.5);top=Math.max(top,e.y+R*.6);
 if(lv===2)for(let k=0,m=ri(2,4);k<m;k++){const p=along(C0,rr(.05,.6));mossAt(p.x,p.y,p.z,rr(.6,1.1));}
 regTree(T,S,reach,top-T.y0+1);};

// 3 the CROZIER TREE FERN: a slender trunk studded with old leaf bases in climbing spirals; a crown of arching fronds
// set at the golden angle; at its heart three to six croziers coiled tight, rising to unroll; a few dead fronds hanging.
B[3]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const rAt=u=>rb*(1-.25*u)*(1+.5*smooth(.06,0,u));
 const C0=twistTrunk(T,S,'bark3',H,rAt,7,.12,rr(.8,1.2),lv,null,{st,lean:rr(.02,.1),wig:.06,du:.06,seg:9});
 const t=C0[C0.length-1],hc=C(pick(S.leaf)),n=lv===2?ri(10,15):6,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k*GOLD*T.hand,el=rr(.05,.5),L=R*rr(.8,1.1);frondAt('fern',t.x,t.y,t.z,a,L,el,L*rr(.35,.45),bright(vary(hc,.02,.06,.05),rr(1.1,1.35)));st.fronds++;}
 if(lv===2){for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU);frondAt('fern',t.x,t.y-.2,t.z,a,R*.8,-rr(.9,1.2),R*.3,leafCol([0x8a6a3a,0x7a5a32],1.0,.02));}
  for(let k=0,m=ri(2,4);k<m;k++){const a=k*GOLD*T.hand,s=rr(.5,1.1),d=rr(.05,.25);
   BIO.put(SHIGH.it('crozier',lv),[t.x+Math.cos(a)*d,t.y-.05,t.z+Math.sin(a)*d],qEuler(rr(-.15,.15),-a,rr(-.1,.2)),hs(T,s),nearW());st.croziers++;}}
 regTree(T,S,R*1.05,H+R*.4);};

// 4 the SCREW PALM (refs/28): stilt roots bracing a slender ringed stem that forks once or twice; at each tip a tuft
// of long strap leaves rising in three ranks that wind round it (the screwpine's spiral, a little over a third of a
// turn to each leaf), the old ones drooping and yellowing below; sometimes an orange fruit head.
B[4]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 if(lv===2){const nr=ri(5,9),hr=rr(.8,2);for(let k=0;k<nr;k++){const a=k*TAU/nr+rr(-.2,.2),d=rr(.8,1.8),gx=T.x+Math.cos(a)*d,gz=T.z+Math.sin(a)*d;
  BIO.beam('rod',[T.x+Math.cos(a)*rb*.6,T.y0+hr*rr(.7,1),T.z+Math.sin(a)*rb*.6],[gx,Y(gx,gz)-.2,gz],rb*.32,rb*.22,barkCol(S,k));st.stilts++;}}
 const fk=H*rr(.55,.75),C0=twistTrunk(T,S,'bark4',fk,u=>rb*(1-.2*u),3,.03,8,lv,null,{st,lean:rr(.02,.1),wig:.06,seg:7}),e=C0[C0.length-1];
 const tips=[];const nb=H>8?ri(2,3):1;
 if(nb===1)tips.push(e);else{const a0=rr(0,TAU);for(let k=0;k<nb;k++){const la=a0+k*TAU/nb,L=(H-fk)*rr(.8,1),lp=corkscrew(e,dirOf(la,rr(.85,1.15)),L,rb*.85,rb*.6,lv===2?4:2,.1,.3,T.hand,0);
  if(lv===2)st.limb+=BIO.tube('bark4',lp,barkCol(S,k),{seg:5,cap:true});else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],rb*1.6,rb*1.1,rodCol(S.bark[0]));
  tips.push(lp[lp.length-1]);}}
 for(const p of tips){const n=lv===2?ri(22,34):10,a0=rr(0,TAU);
  for(let k=0;k<n;k++){const t=k/n,a=a0+T.hand*k*(TAU/3+.11),el=mix(-.7,1.2,t),old=t<.18,L=R*mix(1.05,.6,t)*rr(.9,1.1);
   frondAt('strap',p.x,p.y+t*.5,p.z,a,L,el,L*.16,old?leafCol(PAL.strapOld,1.15,.02):leafCol(S.leaf,1.25,.03,.08,.05));st.straps++;}
  if(lv===2&&rng()<.3){BIO.put('cone',[p.x+rr(-.3,.3),p.y-.6,p.z+rr(-.3,.3)],qEuler(Math.PI+rr(-.3,.3),rr(0,TAU),0),[.35,.5,.35],leafCol(PAL.palmFruit,1.1,.02));}}
 regTree(T,S,R+1,H+R*.4);};

// 5 the RUFFLE-CROWN: a banded trunk, a helical scar winding up it; on top one great rosette of ruffled leaves,
// coral and gold at their frills, set at the golden angle, the outer ones drooping, the inner ones upright: an aloe held
// up on a trunk (refs/07, 08).
B[5]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const C0=twistTrunk(T,S,'bark5',H*.78,u=>rb*(1-.35*u)*(1+.25*Math.sin(u*Math.PI))*(1+.4*smooth(.06,0,u)),2,.08,rr(2.5,4),lv,null,{st,lean:rr(0,.06),wig:.05,seg:9});
 const t=C0[C0.length-1],n=lv===2?ri(26,34):10,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const u=k/(n-1),a=a0+k*GOLD*T.hand,el=mix(.08,1.3,Math.pow(u,.9)),L=R*mix(1,.5,u)*rr(.92,1.06);
  BIO.put('frillleaf',[t.x,t.y+u*.6,t.z],qEuler(0,-a,el).multiply(qEuler(rr(-.25,.25),0,0)),hz(T,[L,L*.7,L*rr(1.25,1.5)]),nearW(rr(.95,1.1)));st.frills++;}
 const s=R*.22;BIO.put(SHIGH.it('rosette',lv),[t.x,t.y+.55,t.z],qEuler(0,rr(0,TAU),0),hs(T,[s,s*1.3,s]),leafCol([0xe8b040,0xf0c050],1.15,.02));
 regTree(T,S,R*1.05,H+R*.6);};

// 6 the GIANT GROUNDSEL (refs/22): a candelabra of stems shaggy with a skirt of their own dead leaves, each ending in
// a cabbage of grey-green leaves set at the golden angle. Young ones are a single stem; the old fork three or four
// times. Now and then a stalk of yellow daisies above a cabbage.
B[6]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,ages=H/8;
 const fk=H*rr(.35,.6);let C0;
 if(lv===2)C0=twistTrunk(T,S,'bark6',fk,u=>rb*(1.15-.2*u),6,.12,rr(1.5,2.5),lv,null,{st,lean:rr(0,.06),wig:.05,du:.12,seg:7});
 else{C0=[{x:T.x,y:T.y0-.3,z:T.z,r:rb*1.15},{x:T.x,y:T.y0+fk,z:T.z,r:rb*.95}];BIO.beam('rod',[T.x,T.y0-.3,T.z],[T.x,T.y0+fk,T.z],rb*2.3,rb*1.9,barkCol(S,0));}
 const e=C0[C0.length-1],nb=ages<.5?1:ri(2,Math.max(2,Math.round(ages*5))),tips=[];
 if(nb===1)tips.push(e);
 else{const a0=rr(0,TAU);for(let k=0;k<nb;k++){const la=a0+k*GOLD*T.hand,L=(H-fk)*rr(.75,1),lp=corkscrew(e,dirOf(la,rr(.9,1.2)),L,rb*.95,rb*.8,lv===2?4:2,.06,.25,T.hand,.08);
  if(lv===2)st.limb+=BIO.tube('bark6',lp,barkCol(S,k),{seg:6,cap:true});else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[lp.length-1].x,lp[lp.length-1].y,lp[lp.length-1].z],rb*1.9,rb*1.6,barkCol(S,k));
  tips.push(lp[lp.length-1]);}}
 const hc=leafCol(PAL.cabbage,1.0,.02,.06,.05);
 for(const p of tips){const s=R*rr(.85,1.1);BIO.put(SHIGH.it('cabbage',lv),[p.x,p.y-.1,p.z],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),hs(T,[s,s*.8,s]),hc);st.cabbages++;
  if(lv===2&&rng()<.18){const h=rr(.8,1.6),top=[p.x,p.y+h,p.z];BIO.beam('rod',[p.x,p.y,p.z],top,.05,.03,C(0x6a7a4a));
   for(let k=0;k<8;k++){const a=k*GOLD,d=rr(.1,.45);BIO.put('daisy',[top[0]+Math.cos(a)*d,top[1]-d*.4,top[2]+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.18,.28),leafCol([0xf0c030,0xe8b828],1.25,.02));}}}
 regTree(T,S,R*1.2+(nb>1?H*.25:0),H+R*.5);};

// 7 the SPIRAL LOBELIA (refs/25, 26): a silver rosette, and from the older ones a column of hairy bracts packed in
// crossing spirals. Half the plants are rosettes still; a column stands for years, flowers once and dies.
B[7]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,col=T.seed%5<3;
 const s=R*rr(.8,1.1);BIO.put(SHIGH.it('rosette',lv),[T.x,T.y0+.32,T.z],qEuler(0,rr(0,TAU),0),hs(T,[s,s*.7,s]),leafCol(S.leaf,1.15,.02,.05,.05));
 if(col){const w=R*rr(.5,.7);BIO.put(SHIGH.it('lobelia',lv),[T.x,T.y0+.4,T.z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),hs(T,[w,H,w]),nearW(rr(.95,1.08)));st.columns++;}
 regTree(T,S,R+.2,col?H+.5:R*.6);};

// 8 the SPIRAL ALOE (refs/11, 12): one rosette of fleshy blue-green leaves wheeling round in five ranks, rust at the
// tips; often two or three together; sometimes an orange flower column.
B[8]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,n=rng()<.35?ri(2,3):1;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?R*rr(1.4,2.2):0,x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;if(k&&BIO.mask(x,z)<=0)continue;
  const s=R*(k?rr(.6,.9):1);BIO.put(SHIGH.it('aloe',lv),[x,Y(x,z)-.04,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),hs(T,[s,s*.75,s]),leafCol(PAL.aloe,1.0,.02,.05,.04));st.aloes++;
  if(lv===2&&k===0&&rng()<.25){const h=rr(.9,1.5),w=.14;BIO.put(SHIGH.it('lobelia',lv),[x,Y(x,z)+s*.4,z],qEuler(rr(-.06,.06),rr(0,TAU),0),hs(T,[w,h,w]),leafCol(PAL.coral,1.15,.02));}}
 regTree(T,S,R*2,T.H+.5);};

// 9 the CORKSCREW CEREUS (refs/09): a clump of columns whose ribs wind a turn and a quarter as they rise; the tall
// ones put out arms; small red fruit along the ribs' turn.
B[9]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,n=ri(1,H>4?6:3);let reach=1;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.5,1.4):0,x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,h=H*(k?rr(.4,.85):1),w=rb*2*(k?rr(.75,1):1);
  BIO.put(SHIGH.it('cereus',lv),[x,Y(x,z)-.2,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),hs(T,[w,h,w]),leafCol(S.leaf,1.15,.02,.06,.04));st.columns++;
  if(lv===2&&h>3.5&&rng()<.6){const ah=h*rr(.35,.55),aa=rr(0,TAU),ah2=h*rr(.3,.45);
   BIO.put(SHIGH.it('cereus',lv),[x+Math.cos(aa)*w*.35,Y(x,z)+ah,z+Math.sin(aa)*w*.35],qEuler(Math.sin(aa)*.45,0,-Math.cos(aa)*.45),hs(T,[w*.7,ah2,w*.7]),leafCol(S.leaf,1.15,.02,.06,.04));}
  if(lv===2)for(let f=0,m=ri(0,4);f<m;f++){const u=rr(.4,.95),q=u*TAU*1.25*T.hand+rr(0,TAU);BIO.put('fruit',[x+Math.cos(q)*w*.5,Y(x,z)+h*u,z+Math.sin(q)*w*.5],null,.07,leafCol(PAL.coral,1.1,.02));}
  reach=Math.max(reach,d+w);}
 regTree(T,S,reach+.5,H+.5);};

// 10 the SPIRAL FRILL TREE: the Rift's frill tree come up into the cloud (biomes/rift, species 0 and the cloud frill). A
// tapering ribbed column, iridescent teal to violet, its twelve ribs winding a turn every 10-16 m; its toothed fins set a
// golden angle apart as they climb, so they stand in crossing spirals (the parastichies of a pine cone) instead of the
// Rift's level rows, longest low and shortening upward; at the summit a whorl of long fins round a pale bud.
B[10]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,c2s=S.irid,hc=vary(pick(S.leaf),.03,.08,.05);
 const rAt=u=>rb*(1-.55*u)*(1+.5*Math.exp(-u*H/3));
 const C0=twistTrunk(T,S,'barkF',H*.9,rAt,12,.1,rr(10,16),lv,null,{st,lean:rr(0,.03),wig:.02,seg:lv===2?20:10});
 const fk=H/18,N=lv===2?Math.round(H*9):Math.round(H*3),a0=rr(0,TAU);
 for(let k=0;k<N;k++){const u=mix(.07,.86,k/(N-1)),a=a0+k*GOLD*T.hand,p=along(C0,u/.9),R=rAt(u)*1.06,L=mix(1.0,2.1,smooth(.05,.6,u))*mix(1.3,.75,u)*fk*rr(.88,1.1);
  BIO.put('frillfin',[p.x+Math.cos(a)*R,p.y,p.z+Math.sin(a)*R],qEuler(rr(-.08,.08),-a,mix(1.0,.8,u)+rr(-.1,.1)),[L,L*.9,L*.9],bright(vary(hc,.02,.06,.05),rr(1.25,1.5)),
   {c2:bright(C(pick(c2s)),1.2),n:[Math.cos(a)*.85,.5,Math.sin(a)*.85]});st.fins++;}
 // the crown: a whorl of long fins at the golden angle, the outer ones spreading, the inner rising; a pale bud
 const top=C0[C0.length-1],n=lv===2?21:9,rT=rAt(.9);
 for(let k=0;k<n;k++){const u=k/(n-1),a=a0+k*GOLD*T.hand,L=H*mix(.2,.12,u)*rr(.9,1.1);
  BIO.put('frillfin',[top.x+Math.cos(a)*rT*.7,top.y+u*.4,top.z+Math.sin(a)*rT*.7],qEuler(rr(-.1,.1),-a,mix(.35,1.25,u)),[L,L,L*.95],bright(vary(hc,.02,.06,.05),1.4),
   {c2:bright(C(pick(c2s)),1.2),n:[Math.cos(a)*.7,.7,Math.sin(a)*.7]});st.fins++;}
 BIO.put('cone',[top.x,top.y-.2,top.z],qUp([0,1,0]),[rT*2.2,rT*3.6,rT*2.2],leafCol(PAL.spiralBud,1.1,.02));
 if(lv===2)for(let k=0,m=ri(1,3);k<m;k++){const p=along(C0,rr(.03,.2));mossAt(p.x,p.y,p.z,rr(.5,.9));}
 regTree(T,S,H*.2+rT+1,H+1);};

// ---------------------------------------------------------------- impostors (the far canopy)
// far.blobs: icosahedral blobs on a pole (sedesert's recipe)
let ICO=null;
function buildFar(T,fi,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 const kk=BIO._lodKey(T.x,T.z),F=S.far||{poleU:.35,blobs:[]};
 const bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear();
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.1*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.55+.45*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const seg=4,taper=F.taper==null?.4:F.taper,top=T.y0+T.H*F.poleU;
 const rings=[0,.06,.5,1].map(u=>{const sh=.7+.3*u*.75;return{x:T.x,y:T.y0+(top-T.y0)*u,z:T.z,r:Math.max(.25,T.rb*(1-taper*u)*(u<.08?1.5:1)),yy:u,col:[bc.r*sh,bc.g*sh,bc.b*sh]};});
 st.far+=BIO.lathe('far',rings,seg,1,1,(Rg,a)=>Rg.r,null);
 const L=S.leaf.map(h=>bright(h,.9)),R=T.crownR,a0=(T.seed%628)/100;
 const colOf=c=>typeof c==='number'?c:c[0]==='B'?S.bark[+c[1]%S.bark.length]:c==='L0'?L[fi%L.length]:L[+c[1]%L.length];
 F.blobs.forEach((b,bi)=>{const o=b[5]||{};
  const y=o.yOf==='R'?T.y0+R*b[0]:T.y0+T.H*b[0],rx=o.rxOf==='rb'?T.rb*b[1]:R*b[1],ry=o.ryOf==='R'?R*b[2]:T.H*b[2];
  blob(T.x+Math.cos(a0)*(o.off?R*o.off:0),y,T.z+Math.sin(a0)*(o.off?R*o.off:0),rx,ry,colOf(b[3]),colOf(b[4]),fi+bi);});
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
SP.forEach((S,i)=>{if(typeof B[i]!=='function')BIO.err('shigh: no builder for species '+i+' '+S.key);});
const newStats=()=>({fins:0,trunk:0,limb:0,far:0,clumps:0,trumpets:0,scrolls:0,fronds:0,croziers:0,straps:0,stilts:0,frills:0,cabbages:0,columns:0,aloes:0,epi:0,bells:0,heroes:0,fars:0,mirrors:0,byS:SP.map(()=>0)});
// MIRROR-HANDED trees: about one in MIRROR_EVERY, and the host may ask for one at a point (SHIGH.mirrorAt: the nearest
// hero of a species there turns mirror-handed), so a camera can find one
SHIGH.MIRROR_EVERY=320;SHIGH.mirrorAt=[];
SHIGH.buildTrees=function(R,q){
 reseed(550047);q=q==null?1:q;R=R||2500;means();
 const st=newStats();
 const TREES=SHIGH.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const LOD=BIO.LOD();
 function pass(P){const sp=P.sp,S=SP[sp],opt=P.opt||{},pad=opt.pad==null?4:opt.pad,small=!!opt.small,hero=LOD.hero*(small?.94:1),mid=LOD.mid*(small?.87:1);let n=0;
  BIO.grid(P.cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=P.accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{if(blocked(x,z,pad))return;
    const T=SHIGH.make(sp,x,y,z);
    const ld=BIO.lodD(x,z);T.lv=ld<hero?2:(ld<mid?1:0);
    if(T.lv===0&&!S.far)return;
    TREES.push(T);hadd({x:x,z:z,r:T.rb*1.4+1});n++;},
   {patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,pad:pad+2});
  return n;}
 SHIGH.PASSES.forEach(pass);
 // the asked-for mirror trees: the nearest hero of the species to each point
 SHIGH.mirrorAt.forEach(m=>{const sp=SP.indexOf(SHIGH.byKey[m.key]);let b=null,bd=1e9;for(const T of TREES){if(T.sp!==sp||T.lv<2)continue;const d=Math.hypot(T.x-m.x,T.z-m.z);if(d<bd){bd=d;b=T;}}if(b)b.hand=-1;});
 TREES.forEach((T,i)=>{if(T.hand<0)st.mirrors++;if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 SHIGH.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,mirrors:st.mirrors,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),clumps:st.clumps,trumpets:st.trumpets,scrolls:st.scrolls,
  fronds:st.fronds,croziers:st.croziers,straps:st.straps,frills:st.frills,cabbages:st.cabbages,columns:st.columns,aloes:st.aloes,epiphytes:st.epi,bells:st.bells,tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
SHIGH._canopyH=function(x,z){let h=0;for(const T of SHIGH.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||6;};
// the nearest built hero of a species to a point (o.hand: only trees of that hand)
SHIGH.nearestTree=function(sp,x,z,minH,o){let b=null,bd=1e9;for(const T of SHIGH.TREES){if(T.sp!==sp||T.lv<2||(minH&&T.H<minH))continue;
 if(o&&o.hand&&T.hand!==o.hand)continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance from the zones, options)
// The cloud forest first (the emergent volutes, then the coilbark canopy, the trumpets, the tree ferns and the screw
// palms in the ravines); then the paramo's rosette trees; then the dry side.
SHIGH.PASSES=[
 {sp:2,cell:64,accept:(Z)=>Z.forest*.42,opt:{pad:6,patch:.4,patchScale:.006}},
 {sp:0,cell:15,accept:(Z)=>Z.forest*.55+Z.elfin*.3,opt:{pad:2.5,patch:.45,patchScale:.012,lodK:.3}},
 {sp:1,cell:24,accept:(Z)=>Z.forest*.26+Z.elfin*.3+Z.ravine*.12,opt:{pad:3,patch:.55,patchScale:.009}},
 {sp:4,cell:20,accept:(Z)=>(Z.ravine*.38+Z.stream*.45)*(Z.forest+Z.elfin+.25)+Z.forest*.04,opt:{pad:2,patch:.4}},
 {sp:3,cell:13,accept:(Z)=>Z.forest*.3+Z.ravine*Z.forest*.4+Z.elfin*.1,opt:{pad:1.2,patch:.55,patchScale:.014,small:true,lodK:.3}},
 {sp:5,cell:50,accept:(Z)=>Z.paramo*.16+Z.elfin*.16+Z.dry*.08,opt:{pad:4,patch:.5,patchScale:.008}},
 {sp:6,cell:19,accept:(Z)=>Z.paramo*.26+Z.bog*.3+Z.elfin*.05,opt:{pad:1.5,patch:.75,patchScale:.008,lodK:.4}},
 {sp:7,cell:15,accept:(Z)=>Z.paramo*.12+Z.bog*.38+Z.crag*.04,opt:{pad:1,patch:.7,patchScale:.012,small:true,lodK:.5}},
 {sp:8,cell:11,accept:(Z)=>Z.dry*.36+Z.crag*.26+Z.paramo*.015,opt:{pad:.8,patch:.6,patchScale:.014,small:true,lodK:.6}},
 {sp:9,cell:16,accept:(Z)=>Z.dry*.3+Z.crag*.12*(1-Z.fog),opt:{pad:1.4,patch:.55,patchScale:.01,small:true}},
 // the spiral frill tree: the cloud forest and its elfin edge, in loose stands (the Rift's cloud frill's place)
 {sp:10,cell:34,accept:(Z)=>Z.forest*.2+Z.elfin*.22+Z.ravine*Z.forest*.1,opt:{pad:2.5,patch:.6,patchScale:.008}},
];

// ---------------------------------------------------------------- one tree alone (biomes/WORLD.md: trees as variants)
// make(sp,x,y,z): the pass's own tree record (H, rb, crownR and seed from the kit's stream; its hand: right, or about
// one in MIRROR_EVERY mirror-handed). grow(T,lv): build that one tree at level lv (2 hero, 1 mid, 0 the impostor).
SHIGH.make=function(sp,x,y,z){const S=SP[sp],seed=ri(0,999999);
 return{x:x,z:z,y0:y-.35,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed,hand:seed%SHIGH.MIRROR_EVERY===7?-1:SHIGH.HAND,fog:BIO.field('fog',x,z)};};
SHIGH.grow=function(T,lv){means();const st=newStats();
 T.lv=lv;if(lv===0){if(!SP[T.sp].far)return null;buildFar(T,T.seed%7,st);}else B[T.sp](T,st,lv);return st;};
})();
