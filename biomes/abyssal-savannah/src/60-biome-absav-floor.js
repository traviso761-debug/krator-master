// ================================================================= ABYSSAL SAVANNAH — the floor, the kopjes, the caprock
// The ground plants by zone and burn age (PLAN.md sections 4-6):
//   the PARKLAND and the FOOT  thatch grass (stubble on a fresh burn, green on a young one, gold to 3.2 m on an old one),
//                              Vain fronds (thickest on burns one to three years old), ember lilies and charred stems on a
//                              fresh burn
//   the STEPPE (the bench)     bench bunchgrass, forbs on the young burns, rosettes where it is stony
//   the PAN                    blue pan-grass round it, pan saltbush on its rim, bare salt in its middle
//   the SCARP and the RIM      ember rosettes and a little bunchgrass in the joints
//   the GALLERY                lush green thatch (the eastern abyss's ferns and palmettos are the trees pass's)
// Three bands of cell size from the LOD spine (4.5 m, 9 m, 18 m; the far tufts larger), each cell seeded from core/rand.
// The KOPJES (granite tors) are the host's hills; their boulder piles, and a kopje fig on some, are drawn here. The CAPROCK:
// blocks along the rim's lip the host hands in, and fallen ones on the talus below it.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const PAL=ABSAV.PAL,C=h=>new BIO.host.THREE.Color(h),bright=ABSAV.bright,vary=ABSAV.vary,shade=ABSAV.shade;
const Y=(x,z)=>BIO.terrainH(x,z);
// the full-colour cards (the lilies, the forbs, the charred stems: materials.json keep 1) carry their own colour: with the pack the
// instance colour is a near-white multiplier, without it (the procedural greys) the palette's
const own=slot=>!!(ABSAV.LIB&&ABSAV.LIB[slot]);
const cardCol=(slot,pal)=>own(slot)?bright(vary(C(0xf2f0ea),.0,.0,.04),1):bright(C(pick(pal)),1.05);
// the Vain frond patches: a KRAND.fbm field (they stand in patches, not evenly)
const vainK=(x,z)=>smooth(.46,.62,KRAND.fbm(x*.0052-5,z*.0052+2,0,3,ABSAV.SEED+3131));
const stonyK=(x,z)=>smooth(.55,.7,KRAND.fbm(x*.02,z*.02,0,2,ABSAV.SEED+3132));
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[w,h,w],col);}
function vain(x,y,z,k,st){const n=ri(2,4),a0=rr(0,TAU);
 for(let i=0;i<n;i++){const a=a0+i/n*TAU+rr(-.3,.3),h=rr(.8,2.2)*k,col=bright(vary(C(pick(PAL.vain)),.02,.1,.06),1.4),tilt=rr(.15,.55);
  const bx=x+Math.cos(a)*.15,bz=z+Math.sin(a)*.15;BIO.put('vain',[bx,y-.05,bz],qEuler(tilt,Math.atan2(Math.cos(a),Math.sin(a)),rr(-.1,.1)),[h*.9,h*.75,1],col);}
 st.vain+=n;}
function rosette(x,y,z,k,st){const R=rr(.3,.75)*k,c=vary(C(pick(PAL.rosette)),.03,.1,.06).lerp(C(pick(PAL.rosetteTip)),rr(.1,.45));
 BIO.put('rosette',[x,y-.02,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[R,R*.8,R],bright(c,1.05));st.rosettes++;}
// one plant in one cell: the zone weights pick the bucket, the burn age the state (k: the band's size)
function plant(x,y,z,Z,age,k,band,st){const t=rng();
 if(Z.rock>.78){if(t<.35){rosette(x,y,z,k,st);}return;}
 if(Z.pan>.35){if(Z.salt>.85)return;                                                       /* the bare salt in the pan's middle */
  if(Z.salt<.55&&t<.25){BIO.put('saltbush',[x,y+.3*k,z],qEuler(0,rr(0,TAU),0),[rr(1.2,2)*k,rr(.6,1)*k,rr(1.2,2)*k],bright(vary(C(pick(PAL.saltbush)),.02,.06,.05),1.2),{n:[0,1,0]});st.saltbush++;return;}
  tuft('pangrass',x,y,z,rr(.4,.8)*k,rr(.8,1.3)*k,bright(vary(C(pick(PAL.pangrass)),.02,.06,.05),1.25));st.pangrass++;return;}
 if(Z.scarp>.5){if(t<.3)rosette(x,y,z,k,st);else if(t<.6){tuft('bunch',x,y,z,rr(.4,.8)*k,rr(.6,1.1)*k,bright(vary(C(pick(PAL.bunch)),.02,.06,.05),1.2));st.bunch++;}return;}
 if(Z.steppe>.5){                                                                         /* the bench */
  if(age<=0){if(t<.12){tuft('charred',x,y,z,rr(.4,.9)*k,rr(.5,.9)*k,cardCol('charred',PAL.charred));st.charred++;}
   else if(t<.5){tuft('bunch',x,y,z,rr(.12,.25)*k,rr(.5,.8)*k,shade(C(pick(PAL.bunch)),-.45));st.bunch++;}return;}
  if(age<=3&&t<.16&&band<2){const f=['forb0','forb1','forb2'][ri(0,2)];tuft(f,x,y,z,rr(.3,.6)*k,rr(.5,.9)*k,cardCol(f,PAL.forb));st.forbs++;return;}
  if(stonyK(x,z)>.5&&t<.22){rosette(x,y,z,k*.8,st);return;}
  if(t<.82){const g=age<=3?C(pick(PAL.thatchGreen)).lerp(C(pick(PAL.bunch)),.4):C(pick(PAL.bunch));
   tuft('bunch',x,y,z,rr(.6,1.3)*k*(age<=3?.75:1),rr(1.1,1.9)*k,bright(vary(g,.02,.06,.05),1.2));st.bunch++;
   if(t<.45){const a=rr(0,TAU),d=rr(1.2,2.2)*k;tuft('bunch',x+Math.cos(a)*d,Y(x+Math.cos(a)*d,z+Math.sin(a)*d),z+Math.sin(a)*d,rr(.5,1.1)*k,rr(.9,1.5)*k,bright(vary(g,.02,.06,.05),1.15));st.bunch++;}}   /* the bench's tussocks in pairs: a steppe, not a scatter */
  return;}
 // the parkland, the foot and the gallery: the thatch grass
 const lush=Math.max(Z.gallery,Z.foot*.8);
 if(age<=0&&lush<.5){if(t<.09){tuft('charred',x,y,z,rr(.6,1.4)*k,rr(.6,1.1)*k,cardCol('charred',PAL.charred));st.charred++;}
  else if(t<.16&&band<2){tuft('lily',x,y,z,rr(.4,.8)*k,rr(.5,.8)*k,cardCol('lily',PAL.lily));st.lilies++;}
  else if(t<.55){tuft('thatch',x,y,z,rr(.2,.4)*k,rr(.8,1.2)*k,shade(C(pick(PAL.thatch)),-.55));st.thatch++;}
  return;}
 const vk=vainK(x,z),young=age>=1&&age<=3;
 if(t<(young?.20:.035)+.25*vk*(young?1:.4)){vain(x,y,z,k,st);return;}
 if(young&&t<.32&&band<2&&Z.up>.3){const f=['forb0','forb1','forb2'][ri(0,2)];tuft(f,x,y,z,rr(.3,.6)*k,rr(.5,.9)*k,cardCol(f,PAL.forb));st.forbs++;return;}
 const g=lush>.5?C(pick(PAL.thatchGreen)):young?C(pick(PAL.thatchGreen)).lerp(C(pick(PAL.thatch)),rr(.1,.4)):C(pick(PAL.thatch));
 const h=(lush>.5?rr(1,1.8):young?rr(.6,1.3):rr(1.8,3.2)*mix(1,.75,smooth(.5,.75,Z.up)))*k;
 tuft('thatch',x,y,z,h,rr(1.6,2.6)*k*mix(1,1.2,smooth(1.8,3,h)),bright(vary(g,.02,.06,.05),1.15));st.thatch++;}
// ---------------------------------------------------------------- the kopjes: boulder piles on the host's hills, and a fig on some
function kopje(K,st){const S=KRAND.stream(K.seed>>>0),g=C(0xb4a89c);let n=0;const lv=BIO.lodD(K.x,K.z)<BIO.radii().mid?2:1;
 const N=Math.min(46,Math.round(K.r*K.h/(lv===2?12:22)));
 for(let i=0;i<N;i++){const a=S.range(0,TAU),d=K.r*Math.sqrt(S.next())*.8,x=K.x+Math.cos(a)*d,z=K.z+Math.sin(a)*d,s=S.range(1.6,5.5)*(1-.4*d/K.r);
  const y=Y(x,z),col=bright(g.clone().lerp(C(S.pick(PAL.rock)),S.next()),S.range(.85,1.08));
  BIO.put('boulder',[x,y+s*.2,z],qEuler(S.range(0,TAU),S.range(0,TAU),S.range(0,TAU)),[s*S.range(.9,1.3),s*S.range(.6,.9),s*S.range(.9,1.2)],col);n++;
  if(S.next()<.18){const s2=s*S.range(.5,.8);BIO.put('boulder',[x+S.range(-.5,.5),y+s*.75+s2*.4,z+S.range(-.5,.5)],qEuler(S.range(0,TAU),S.range(0,TAU),0),[s2,s2*.75,s2*1.1],col);n++;}}
 // the tor: a stack of rounded blocks at the crown
 const tx=K.x,tz=K.z;let ty=Y(tx,tz);for(let i=0,m=S.int(2,4);i<m;i++){const s=S.range(3,6)*(1-i*.18);BIO.put('boulder',[tx+S.range(-1,1),ty+s*.45,tz+S.range(-1,1)],qEuler(S.range(-.3,.3),S.range(0,TAU),S.range(-.3,.3)),[s*1.1,s*.7,s],bright(g,S.range(.9,1.05)));ty+=s*.95;n++;}
 st.boulders+=n;
 BIO.register({name:'Kopje (a granite tor)',key:K.id,kind:'feature',label:'Kopje',x:K.x,z:K.z,y:Y(K.x,K.z)-2,r:K.r,h:K.h+ty-Y(K.x,K.z)+4,tags:{biome:'abyssal-savannah',feature:'kopje',rock:'granite'}});
 // the kopje fig (species 4) on four in ten, at the pile's edge
 if(S.next()<.4){const a=S.range(0,TAU),x=K.x+Math.cos(a)*K.r*.45,z=K.z+Math.sin(a)*K.r*.45;reseed(KRAND.hash(ABSAV.SEED,0xf16,Math.floor(K.x),Math.floor(K.z)));
  const T=ABSAV.make(4,x,Y(x,z),z);ABSAV.grow(T,BIO.lodD(x,z)<BIO.radii().hero?2:1);ABSAV.TREES.push(T);st.figs++;}}
// ---------------------------------------------------------------- the caprock: blocks on the lip, fallen ones below
function caprock(rim,st){if(!rim||!rim.lip)return;const g=C(PAL.cap[0]);
 rim.lip.forEach((p,i)=>{reseed(KRAND.hash(ABSAV.SEED,0xcab,i));if(BIO.field('flow',p[0],p[1])>.25)return;
  for(let k=0,n=ri(1,3);k<n;k++){const x=p[0]+rr(-4,3),z=p[1]+rr(-3,3),y=Y(x,z),w=rr(3,7),h=rr(1.5,4);
   BIO.put('slab',[x,y-h*.35,z],qEuler(rr(-.12,.12),rr(-.4,.4),rr(-.12,.12)),[w,h,rr(3,6)],bright(g.clone().lerp(C(pick(PAL.cap)),rng()),rr(.85,1.1)));st.slabs++;}
  // the talus: fallen blocks down the face (downslope is -x)
  for(let k=0,n=ri(0,3);k<n;k++){const x=p[0]-rr(30,190),z=p[1]+rr(-6,6);if(BIO.field('flow',x,z)>.3)continue;const y=Y(x,z),s=rr(1.4,4.5);
   BIO.put('slab',[x,y-s*.3,z],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[s*rr(1,1.6),s,s*rr(.9,1.4)],bright(g.clone().lerp(C(pick(PAL.cap)),rng()),rr(.8,1.05)));st.slabs++;}});
 BIO.register({name:'The caprock rim',key:'rim',kind:'feature',label:'The rim',x:rim.c[0],z:rim.c[1],y:rim.y0,r:rim.r,h:rim.h,tags:{biome:'abyssal-savannah',feature:'escarpment'}});}
// ---------------------------------------------------------------- the pass
ABSAV.buildFloor=function(opt){const box=opt.box,q=opt.quality==null?1:opt.quality,F=BIO.radii().floor;
 const st={thatch:0,bunch:0,pangrass:0,saltbush:0,vain:0,rosettes:0,lilies:0,charred:0,forbs:0,boulders:0,figs:0,slabs:0,cells:0};
 (opt.kopjes||[]).forEach(K=>kopje(K,st));
 caprock(opt.rim,st);
 const bands=[[0,F[0],4.5,1],[F[0],F[1],9,1.25],[F[1],1e9,18,1.7]];
 bands.forEach((b,bi)=>{cells(600+bi,b[2]/Math.sqrt(q),box,(x,z)=>{const d=BIO.lodD(x,z);return d>=b[0]&&d<b[1]?1:0;},(x,y,z)=>{
   if(ABSAV.blocked(x,z,.3)&&rng()<.7)return false;
   const Z=ABSAV.zones(x,z),age=ABSAV.burn(x,z);st.cells++;plant(x,y,z,Z,age,b[3],bi,st);},{patch:.25,patchScale:.03,pre:(x,z)=>{const d=BIO.lodD(x,z);return d>=b[0]-b[2]&&d<b[1]+b[2];}});});
 return st;};
const cells=ABSAV.cells;
})();
