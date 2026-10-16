// ================================================================= EASTERN HIGHLANDS — trees (and the plant-scale cushions)
// The seven species, each with its own builder, placed by zone from the host's fields. Every builder turns its plant
// toward the giant (EHIGH.GIANT): a cushion's crown and its steep side face it, a spike or a tower tilts to it, the
// ragbark's trunk leans and its crown fans out on that side. T.lean records the bearing the builder used (the probe
// checks it). The Mother Cushion, one plant over a whole hill, is built here too (EHIGH.buildMother), draped over the
// host's `mother` field. Beyond the LOD spine a plant becomes an impostor in the 'far' bucket. Every count scales with q.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=EHIGH.SPECIES,PAL=EHIGH.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=EHIGH.C;
EHIGH.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// The world's fields (biomes/WORLD.md): wet, flow, rock, slope, cold; and the region's: bog, mother, geo, gully, sun,
// tarn. Each zone 0..1:
//   tor      low exposed rock (the volcanic tors, boulder fields): woolbacks, cereus, cushions at the foot
//   bog      the bofedal: the cushion quilt and its pools (no trees)
//   mother   the Mother Cushion: nothing roots in it but lichens and the odd flower
//   geo      the geyser field's sinter: bare, mat algae in the run-off
//   gully    a quebrada's floor and walls below the cold line: the ragbark woods
//   dry      the sunward face of the range below the scree: vigil spikes, thorn cushions, hoar cereus
//   scree    the cold rocky upper face: glass towers, woolbacks, snow wool
//   fell     the cold meadow above the puna: poured cushions, woolbacks, glass towers, turf
//   puna     the open plain: ichu, turf, tola, poured cushions, the odd spike
//   snow     the crest (nothing)
//   cliff    a sheer rock face: nothing roots there (the owner's rule, Oct 2026: every zone is multiplied by 1-cliff)
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const F=n=>BIO.field(n,x,z);
 const wet=F('wet'),flow=F('flow'),rock=F('rock'),slope=F('slope'),cold=F('cold'),bogF=F('bog'),motherF=F('mother'),geoF=F('geo'),gullyF=F('gully'),sun=F('sun'),tarn=F('tarn');
 const cliff=smooth(.8,.96,slope)*smooth(.3,.6,rock),live=1-cliff;
 const snow=smooth(.86,.95,cold);
 const tarnZ=smooth(.3,.6,tarn),mother=smooth(.25,.55,motherF)*live,geo=smooth(.3,.6,geoF)*live,bog=smooth(.3,.6,bogF)*(1-tarnZ)*(1-mother)*live;
 const gully=smooth(.25,.6,gullyF)*smooth(.74,.58,cold)*(1-snow)*live;
 const tor=smooth(.35,.65,rock)*smooth(.5,.34,cold)*(1-gully)*(1-mother)*live;
 const open=live*(1-tor)*(1-bog)*(1-mother)*(1-geo)*(1-gully)*(1-tarnZ)*(1-snow);
 const scree=open*smooth(.4,.62,cold)*smooth(.25,.55,rock);
 const dry=open*(1-scree)*smooth(.2,.55,sun)*smooth(.12,.24,cold)*smooth(.7,.52,cold);
 const fell=open*(1-scree)*(1-dry)*smooth(.42,.6,cold);
 const puna=open*(1-scree)*(1-dry)*(1-fell);
 return{wet,flow,rock,slope,cold,sun,cliff,snow,tor,bog,mother,geo,gully,scree,dry,fell,puna,open,
  turf:smooth(.3,.44,wet)*(puna+fell)};}
EHIGH.zones=zones;

// ---------------------------------------------------------------- colour (the maths is the core's, BIO.col)
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={bark:EHIGH.BARKTEX.map(t=>texMean(t)),rock:texMean(EHIGH.ROCKTEX)};MEAN.mother=EHIGH.SKIN_MEAN;
 const lm=EHIGH.LIBMEAN||{},lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};if(lm.bark1!=null)MEAN.bark[1]=lin(lm.bark1);if(lm.rock!=null)MEAN.rock=lin(lm.rock);return MEAN;}
Object.assign(EHIGH,{means,tint,bright,shade,vary});
const BARKC={};
const barkCol=(S,k)=>{const key=S.key+(k%S.bark.length);return BARKC[key]||(BARKC[key]=tint(S.bark[k%S.bark.length],means().bark[S.barkK]));};
const rodCol=(hex,f)=>shade(C(hex),f==null?-.25:f);
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.05:dh,ds==null?.14:ds,dl==null?.07:dl),k==null?1.3:k);
EHIGH.leafCol=leafCol;

// ---------------------------------------------------------------- the lean toward the giant
// leanDir(T,a): a unit direction tilted a from up toward the giant, recorded on the plant (T.lean: its bearing in the
// ground plane, [x,z]); yawTo(T): the yaw that turns a lopsided geometry's +x toward the giant, a little scattered
function leanDir(T,a,jit){const d=EHIGH.toward(a,jit);const l=Math.hypot(d[0],d[2])||1;T.lean=[d[0]/l,d[2]/l];return d;}
function yawTo(T,jit){const y=EHIGH.GIANT_YAW+rr(-(jit==null?.3:jit),jit==null?.3:jit);T.lean=[Math.cos(y),-Math.sin(y)];return y;}
EHIGH.leanDir=leanDir;EHIGH.yawTo=yawTo;

// ---------------------------------------------------------------- polyline helpers (Girder's)
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
function along(pts,u){const f=clamp(u,0,1)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),t=f-i,a=pts[i],b=pts[i+1];return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),r:mix(a.r,b.r,t)};}

// ---------------------------------------------------------------- keep-clear between plants
const HC=60,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
EHIGH.blocked=blocked;

// ---------------------------------------------------------------- helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.55,1,smooth(.3,.95,qq))*mix(.82,1,smooth(-.6,.35,dy))*rr(.9,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:r,h:h});
// the height of the unit dome (G.cushion's body) at radius r along the giant axis component ca: for things set on it
const domeY=(r,ca,shift)=>Math.pow(Math.max(0,1-r*r),.55)*(1+(shift||.2)*ca*(1-r));

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed} and lv 2 near / 1 mid
const B=[];

// 0 the POURED CUSHION (the llareta): one plant of tens of thousands of tiny rosettes packed into a dome so hard a man
// can stand on it, lime-green, growing a hand's depth in a lifetime. Big ones pour over boulders (the stone shows on
// the side away from the giant, where the cushion is thinnest); old ones carry brown dead patches; the biggest are
// two or three domes run together.
B[0]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,H=T.H*clamp(R/4,.5,1.15),yaw=yawTo(T,.3);
 const gx=Math.cos(yaw),gz=-Math.sin(yaw);
 if(R>2.2&&rng()<.55){const br=R*rr(.32,.45);BIO.put('boulder',[T.x-gx*R*.62,T.y0+br*.25,T.z-gz*R*.62],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[br,br*.75,br*1.1],tint(vary(pick(PAL.basalt),.02,.05,.05),means().rock,rr(.5,.7)));st.boulders++;}
 const col=bright(vary(pick(S.leaf),.03,.1,.06),rr(1.05,1.25));
 BIO.put('cushion',[T.x,T.y0+.15,T.z],qEuler(0,yaw,0),[R,H,R*rr(.85,1)],col);st.cushions++;
 if(R>3.4&&lv===2){const n=ri(1,2);for(let k=0;k<n;k++){const a=yaw+Math.PI+rr(-1.4,1.4),d=R*rr(.55,.85),r2=R*rr(.45,.65),x=T.x+Math.cos(a)*d,z=T.z-Math.sin(a)*d;
  BIO.put('cushion',[x,Y(x,z)+.1,z],qEuler(0,yawTo({},.3),0),[r2,H*rr(.6,.85),r2],k===0&&rng()<.35?leafCol(PAL.dead,1.0,.02,.06,.05):bright(vary(pick(S.leaf),.03,.1,.06),rr(1.0,1.2)));st.cushions++;}}
 // lichens on the old cushion's dead patches, a flower or two that rooted in it
 if(lv===2&&rng()<.4)for(let k=0,n=ri(2,5);k<n;k++){const a=rr(0,TAU),r=rr(.2,.8),ca=Math.cos(a)*gx+Math.sin(a)*gz;
  BIO.put('bloom',[T.x+Math.cos(a)*r*R,T.y0+.15+H*domeY(r,ca)+.03,T.z+Math.sin(a)*r*R],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),rr(.12,.2),leafCol(pick([PAL.gentian,PAL.snowwool,PAL.tolaBloom]),1.2,.02,.06,.05));st.blooms++;}
 regTree(T,S,R*1.1,H+.5);};

// 1 the WOOLBACK (New Zealand's vegetable sheep): a heap of grey-white woolly lobes, from afar a sheep lying down.
// Its fleece is the dead leaves of a thousand shoots felted together; the heap rises toward the giant.
B[1]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,H=T.H,yaw=yawTo(T,.35);
 BIO.put('wool',[T.x,T.y0+.08,T.z],qEuler(rr(-.05,.05),yaw,rr(-.05,.05)),[R,H,R*rr(.8,1)],bright(vary(pick(S.leaf),.02,.04,.05),rr(1.0,1.15)));st.woolbacks++;
 if(lv===2&&rng()<.5)for(let k=0,n=ri(1,3);k<n;k++){const a=rr(0,TAU),d=R*rr(1,1.6),r=rr(.25,.6);
  BIO.put('stone',[T.x+Math.cos(a)*d,Y(T.x+Math.cos(a)*d,T.z+Math.sin(a)*d)+r*.2,T.z+Math.sin(a)*d],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*1.3,r*.7,r],tint(vary(pick(PAL.basalt),.02,.05,.05),means().rock,rr(.5,.7)));st.stones++;}
 regTree(T,S,R*1.1,H+.3);};

// 2 the THORN CUSHION (the tragacanth belt's): a tight grey-green hemisphere bristling with pale spines; in its season
// a crust of small pink and white flowers over the top. Tapped at the root crown for its white gum.
B[2]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,H=T.H,yaw=yawTo(T,.3),gx=Math.cos(yaw),gz=-Math.sin(yaw);
 BIO.put('thorn',[T.x,T.y0+.05,T.z],qEuler(0,yaw,0),[R,H,R],bright(vary(pick(S.leaf),.02,.08,.05),rr(1.0,1.2)));st.thorns++;
 if(rng()<.55){const n=lv===2?ri(10,22):ri(3,5),col=leafCol(PAL.thornBloom,1.25,.02,.06,.05);
  // the flowers crowd the giant side
  for(let k=0;k<n;k++){const a=Math.atan2(gz,gx)+rr(-1.6,1.6),r=Math.sqrt(rng())*.85,ca=Math.cos(a)*gx+Math.sin(a)*gz;
   BIO.put('bloom',[T.x+Math.cos(a)*r*R,T.y0+.05+H*(domeY(r,ca,.15)+.12),T.z+Math.sin(a)*r*R],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.08,.13)*R,col);st.blooms++;}}
 regTree(T,S,R*1.05,H+.3);};

// 3 the VIGIL SPIKE (Puya raimondii at Krator's scale): a rosette of blue-green swords on a short trunk wrapped in its
// own dead leaves, for decades; then, all across a stand in the same season, one great spike of green-gold flowers
// up to 17 m, leaning toward the giant like the rest; then it dies, and the dark torch stands for years.
EHIGH.FLOWERING=[];   // the host may name the stands flowering this year: [{x,z,r}]
EHIGH.vigilStage=function(x,z){for(const F of EHIGH.FLOWERING)if(Math.hypot(x-F.x,z-F.z)<F.r)return'flower';
 const f=fbm(x*.0019+5,z*.0019-3,7771,2),t=fbm(x*.0024-8,z*.0024+6,7772,2);if(f>.66)return'flower';if(t>.64)return'torch';
 const u=h3(Math.floor(x*3),Math.floor(z*3),7773);return u<.08?'torch':u<.3?'young':'rosette';};
B[3]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,st0=EHIGH.vigilStage(T.x,T.z),dir=leanDir(T,S.lean*rr(.7,1.2),.2);T.stage=st0;
 const dead=st0==='torch',young=st0==='young',tH=young?0:rr(.6,3.2),Rr=R*(young?.55:1);
 // the trunk: a column wrapped in a skirt of dead leaves, bending a little toward the giant
 let top={x:T.x,y:T.y0,z:T.z};
 if(tH>0){const rings=[];for(let u=0;u<=1.001;u+=lv===2?.2:.5){const y=T.y0-.2+(tH+.2)*u;rings.push({x:T.x+dir[0]*tH*u*u*.3,y,z:T.z+dir[2]*tH*u*u*.3,r:T.rb*(1.15-.15*u),yy:u*tH,col:dead?rodCol(pick(PAL.torch),-.1):barkCol(S,ri(0,2))});}
  st.trunk+=BIO.lathe('bark3',rings,lv===2?9:6,2,3,R2=>R2.r*(1+.06*rng()),null);const e=rings[rings.length-1];top={x:e.x,y:e.y,z:e.z};}
 const rc=dead?leafCol(PAL.torch,1.0,.02,.05,.05):bright(vary(pick(S.leaf),.02,.06,.05),rr(1.15,1.35));
 BIO.put('rosette',[top.x,top.y-.1,top.z],qUp([dir[0]*.4,1,dir[2]*.4]),[Rr,Rr*(dead?.55:.75),Rr],rc);st.clumps++;
 if(!young&&!dead&&st0!=='flower'){regTree(T,S,Rr*1.05,tH+Rr*.9);return;}
 if(young){regTree(T,S,Rr,Rr*.8);return;}
 // the spike: green-gold in flower, dark and a little thinner as a torch (some torches broken off)
 const H=dead?T.H*rr(.55,1):T.H,sw=R*rr(.42,.55)*(dead?.8:1),b=[top.x,top.y+Rr*.25,top.z];
 BIO.put('spire',b,qUp(dir),[sw,H,sw],dead?leafCol(PAL.torch,1.0,.02,.05,.05):bright(vary(pick(PAL.spike),.02,.06,.05),st0==='flower'?.85:1.2));st.spikes++;
 if(st0==='flower')for(let k=0,n=lv===2?ri(110,160):ri(24,36);k<n;k++){const u=rr(.04,.94),q=rr(0,TAU),r=sw*.5*Math.pow(Math.sin(Math.PI*Math.min(1,u*.96+.03)),.45)*(1-.55*u)*1.18;
  BIO.put('bloom',[b[0]+dir[0]*H*u+Math.cos(q)*r,b[1]+dir[1]*H*u,b[2]+dir[2]*H*u+Math.sin(q)*r],qEuler(rr(-1,1),rr(0,TAU),rr(-1,1)),rr(.3,.5)*(lv===2?1:1.6),leafCol(PAL.floret,1.3,.02,.06,.05));st.blooms++;}
 regTree(T,S,Math.max(Rr,H*Math.abs(dir[0])+1),tH+H+1);};

// 4 the RAGBARK (Polylepis): a gnarled low tree of the gullies, its trunks twisting, its rust-red bark peeling in a
// hundred papery layers (a coat against the frost); small dark leaves in rosettes at the twig ends. The trunks lean
// toward the giant and the crown fans out on that side: from the plain a gully's wood looks combed.
B[4]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,dir=leanDir(T,S.lean,.25),gaz=Math.atan2(dir[2],dir[0]);
 const nS=ri(1,3),spots=[];let reach=R*.6,topY=T.y0+H*.6;
 for(let s=0;s<nS;s++){const a=gaz+rr(-.9,.9),off=nS>1?T.rb*rr(.6,1.4):0,fh=H*rr(.35,.55)*(s?rr(.7,1):1);
  const bx=T.x+Math.cos(a)*off,bz=T.z+Math.sin(a)*off,pts=[];const w1=rr(-1,1)*.18,w2=rr(-1,1)*.12,ph=rr(0,TAU),n=lv===2?6:3;
  for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU*1.5))*fh,lean=Math.tan(S.lean*1.3)*fh*t*t;
   pts.push({x:bx+dir[0]/Math.max(.1,Math.hypot(dir[0],dir[2]))*lean+Math.cos(ph)*w,y:T.y0-.3+(fh+.3)*t,z:bz+dir[2]/Math.max(.1,Math.hypot(dir[0],dir[2]))*lean+Math.sin(ph)*w,r:mix(T.rb*(nS>1?.75:1),T.rb*.5,Math.pow(t,.8))*(t<.1?1.3:1),col:barkCol(S,k)});}
  st.trunk+=BIO.tube('bark1',pts,pts[0].col,{seg:lv===2?7:5,cap:true,rfn:(i,ang)=>1+.12*Math.sin(ang*3+i)});
  const top=pts[pts.length-1],nL=lv===2?ri(4,7):3;
  for(let k=0;k<nL;k++){
   // most limbs go out on the giant's side
   const la=k<nL*.7?gaz+rr(-1.1,1.1):gaz+Math.PI+rr(-1.2,1.2),far=k<nL*.7?1:.55,el=rr(.25,.75),L=(H-fh)*rr(.7,1.1)*far,r0=top.r*rr(.5,.7);
   const o=k<2?top:along(pts,rr(.6,.95)),lp=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(la,el),L,r0,Math.max(.03,r0*.3),3,-.05,.22);
   if(lv===2&&r0>.05)st.limb+=BIO.tube('bark1',lp,barkCol(S,k+2),{seg:4,cap:true});else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[3].x,lp[3].y,lp[3].z],r0*2,r0*.7,rodCol(S.bark[0]));
   spots.push({p:lp[3],s:L*.35*far,tip:true},{p:lp[2],s:L*.25*far});
   reach=Math.max(reach,Math.hypot(lp[3].x-T.x,lp[3].z-T.z)+L*.3);topY=Math.max(topY,lp[3].y);}}
 const hc=EHIGH.LIB&&EHIGH.LIB.rag?bright(C(0xffffff),rr(.82,1.0)):C(pick(S.leaf)),cx=T.x+Math.cos(gaz)*R*.35,cz=T.z+Math.sin(gaz)*R*.35,cy=T.y0+H*.72,sz0=R*.38*(lv===2?1:1.5);let mine=0;
 for(const s of spots){const n=lv===2?(s.tip?3:1):(s.tip?1:0);
  for(let c=0;c<n;c++){const a=rr(0,TAU),d=s.s*.5*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.1,.35)*s.s;
   clumpAt('rag',x,y,z,sz0*rr(.8,1.2),.62,hc,cx,cy,cz,R,H*.3);st.clumps++;mine++;}}
 if(!mine){clumpAt('rag',cx,cy,cz,sz0,.62,hc,cx,cy,cz,R,H*.3);st.clumps++;}
 regTree(T,S,reach+1,topY-T.y0+R*.3+1);};

// 5 the GLASS TOWER (the noble rhubarb): a spire of pale translucent bracts shingled over the hidden flowers, a
// greenhouse warmer inside than the air, lit from within when the sun is behind it; broad green leaves at its foot.
// It makes pallidine. Wormwick comes up in the turf round it (60-floor); its bees nest in the cliffs below.
B[5]=function(T,st,lv){const S=SP[T.sp],H=T.H,W=H*rr(.36,.46),dir=leanDir(T,S.lean*rr(.7,1.2),.25),spent=h3(Math.floor(T.x),Math.floor(T.z),5151)<.12;T.spent=spent;
 const nL=lv===2?ri(5,8):3,L=W*rr(1.4,2.0);
 for(let k=0;k<nL;k++){const a=k/nL*TAU+rr(-.25,.25);BIO.put('broad',[T.x+Math.cos(a)*.15,T.y0+.08,T.z+Math.sin(a)*.15],qEuler(rr(-.05,.05),-a,rr(.05,.3)),[L,L*.7,L*rr(.85,1.05)],spent?leafCol(PAL.dead,1.2,.03,.08,.05):EHIGH.LIB&&EHIGH.LIB.broad?bright(C(0xffffff),rr(.85,1.0)):leafCol(PAL.rheumLeaf,1.2,.03,.08,.05),{n:[Math.cos(a)*.3,1,Math.sin(a)*.3]});}
 BIO.put('tower',[T.x,T.y0+.05,T.z],qUp(dir),[W,H,W],spent?leafCol(PAL.dead,1.0,.02,.05,.05):bright(vary(pick(S.leaf),.02,.05,.04),rr(1.0,1.12)));st.towers++;
 regTree(T,S,Math.max(L,W),H+.3);};

// 6 the HOAR CEREUS (the old-man cactus): a clump of ribbed columns wrapped in white hair, the frost's own coat, every
// column leaning toward the giant; red flowers open near the tops on the giant side.
B[6]=function(T,st,lv){const S=SP[T.sp],H=T.H,dir=leanDir(T,S.lean,.2),tl=Math.tan(S.lean),n=lv===2?ri(3,8):ri(2,4),gaz=Math.atan2(dir[2],dir[0]);let reach=1;
 for(let k=0;k<n;k++){const a=k*GOLD+rr(-.3,.3),d=k?T.crownR*rr(.25,.8):0,bx=T.x+Math.cos(a)*d,bz=T.z+Math.sin(a)*d,h=H*(k?rr(.45,.95):1),r=T.rb*(k?rr(.75,1):1.1),y0=Y(bx,bz)-.25;
  const rings=[];for(let u=0;u<=1.001;u+=lv===2?.125:.25){const y=y0+h*u,lr=tl*h*u*u;rings.push({x:bx+Math.cos(gaz)*lr,y,z:bz+Math.sin(gaz)*lr,r:r*(u>.85?Math.sqrt(Math.max(.05,1-((u-.85)/.15)**2)):1),yy:u*h,col:barkCol(S,ri(0,2))});}
  st.trunk+=BIO.lathe('bark2',rings,lv===2?24:10,1,1.5,(R2,ang)=>R2.r*(1+.14*Math.cos(ang*12)),(R2,ang)=>.72+.28*Math.pow(.5+.5*Math.cos(ang*12),.6));
  const tp=rings[rings.length-2],tt=rings[rings.length-1];
  BIO.put('snowwool',[tt.x,tt.y-r*.15,tt.z],qEuler(0,rr(0,TAU),0),[r*1.05,r*.55,r*1.05],leafCol(PAL.hair,1.05,.01,.02,.03));
  if(lv===2&&rng()<.5)for(let f=0,m=ri(1,3);f<m;f++){const q=gaz+rr(-.8,.8);BIO.put('bloom',[tp.x+Math.cos(q)*r*.9,tp.y-rr(0,.3),tp.z+Math.sin(q)*r*.9],qFacing([Math.cos(q),.6,Math.sin(q)]),rr(.14,.2),leafCol(PAL.cereusBloom,1.25,.02,.06,.05));st.blooms++;}
  reach=Math.max(reach,d+r+tl*h);}
 regTree(T,S,reach,H+.5);};

// ---------------------------------------------------------------- the Mother Cushion
// One plant over a whole hill (the owner: "one cushion, one hill"): the host's `mother` field says where it lies, its
// window where to look; this drapes a skin of cushion over the ground there, 2 m a cell, bubbling into domes a few
// metres across, thick in the middle and thinning to nothing at its edge; the rills cut through it. Older bubbles are
// darker and browner; the skin is greenest on the giant side. Its uv is in metres, so the rosette skin tiles at the
// same size as on the small cushions.
EHIGH.buildMother=function(q){const W=BIO.window('mother');if(!W||!BIO.hasField('mother'))return{mother:0};
 // u runs along z and v along x, so dP/du x dP/dv points UP (BIO.surf's normal): x along u faced the skin downward
 const cell=q<.75?3:2,nu=Math.round((W[3]-W[1])/cell),nv=Math.round((W[2]-W[0])/cell),g=EHIGH.GIANT;
 const bub=(x,z)=>{const a=Math.abs(Math.sin(x*.55+Math.sin(z*.31)*1.7)*Math.sin(z*.55+Math.sin(x*.29)*1.7)),b=Math.abs(Math.sin(x*.21+z*.13)*Math.sin(z*.23-x*.09));return .65*Math.pow(a,.5)+.5*Math.pow(b,.6);};
 const thick=(x,z)=>{const m=BIO.field('mother',x,z);return m<=0?-1:m;};
 const P=(u,v)=>{const z=W[1]+u*(W[3]-W[1]),x=W[0]+v*(W[2]-W[0]),m=thick(x,z),y=Y(x,z);return[x,m<0?y-.5:y+m*(1.2+1.6*bub(x,z))-.25*(1-m),z];};
 // lime on the giant side, a deeper green away from it, old browning patches, darker only deep in the crevices; the
 // rosette map divides by its own mean so the colour is the colour
 const cA=C(0xa4cc44),cB=C(0x7aa832),cOld=C(0x9a8e48),cD=C(0x4a6a26),tmp=C(0xffffff),MM=means().mother;
 const tris=BIO.surf('mother',P,nu,nv,0xffffff,{uS:(W[3]-W[1])/(EHIGH.SKIN_SCALE||1.4),vS:(W[2]-W[0])/(EHIGH.SKIN_SCALE||1.4),
  hole:(u,v)=>{const z=W[1]+u*(W[3]-W[1]),x=W[0]+v*(W[2]-W[0]);return BIO.field('mother',x,z)<.02;},
  colFn:(u,v,p)=>{const x=p[0],z=p[2],b=bub(x,z),m=Math.max(0,thick(x,z)),side=((x-W[0]-(W[2]-W[0])/2)*g[0]+(z-W[1]-(W[3]-W[1])/2)*g[1])/((W[2]-W[0])/2);
   tmp.copy(cB).lerp(cA,clamp(.5+.45*side+.2*(fbm(x*.02,z*.02,991,2)-.5),0,1));
   tmp.lerp(cOld,smooth(.64,.8,fbm(x*.012+3,z*.012,992,2))*.5);
   tmp.lerp(cD,clamp(.8-b*1.4,0,1)*.45+smooth(.3,0,m)*.3);
   return tint(tmp,MM,.95);}});
 BIO.register({name:'The Mother Cushion',key:'mother',x:(W[0]+W[2])/2,z:(W[1]+W[3])/2,y:Y((W[0]+W[2])/2,(W[1]+W[3])/2)-50,r:(W[2]-W[0])/2,h:90});
 return{mother:tris};};

// ---------------------------------------------------------------- impostors (the far plants)
// far.blobs: icosahedral blobs on a pole (sedesert's recipe); a cushion has no pole (poleU 0)
let ICO=null;
function buildFar(T,fi,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 const kk=BIO._lodKey(T.x,T.z),F=S.far||{poleU:.35},stage=T.sp===3?EHIGH.vigilStage(T.x,T.z):null,dead=stage==='torch',spike=stage==='flower'||dead;
 const bc=C(dead?pick(PAL.torch):S.bark[fi%S.bark.length]).convertSRGBToLinear();
 const g=EHIGH.GIANT,lean=Math.tan(S.lean||0);
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.1*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.55+.45*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1,yy=Math.max(-.05,dy);
   vtx(x+dx*rx*m+g[0]*lean*yy*ry,y+yy*ry*m,z+dz*rx*m+g[1]*lean*yy*ry,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const taper=F.taper==null?.4:F.taper;
 if(F.poleU>0&&(T.sp!==3||spike)){const top=T.y0+T.H*F.poleU;
  const rings=[0,.06,.5,1].map(u=>{const sh=.7+.3*u*.75;return{x:T.x+g[0]*lean*(top-T.y0)*u,y:T.y0+(top-T.y0)*u,z:T.z+g[1]*lean*(top-T.y0)*u,r:Math.max(.25,T.rb*(1-taper*u)*(u<.08?1.5:1)),yy:u,col:[bc.r*sh,bc.g*sh,bc.b*sh]};});
  st.far+=BIO.lathe('far',rings,4,1,1,(Rg,a)=>Rg.r,null);}
 const L=S.leaf.map(h=>bright(h,.9)),R=T.crownR,a0=(T.seed%628)/100;
 const colOf=c=>typeof c==='number'?c:c[0]==='B'?S.bark[+c[1]%S.bark.length]:c==='L0'?L[fi%L.length]:L[+c[1]%L.length];
 F.blobs.forEach((b,bi)=>{const o=b[5]||{};if(T.sp===3&&bi===1&&!spike)return;
  const y=o.yOf==='R'?T.y0+R*b[0]:T.y0+T.H*b[0],rx=o.rxOf==='rb'?T.rb*b[1]:R*b[1],ry=o.ryOf==='R'?R*b[2]:T.H*b[2];
  const off=o.off?R*o.off:0,ca=dead&&bi===1?pick(PAL.torch):colOf(b[3]),cb=dead&&bi===1?pick(PAL.torch):colOf(b[4]);
  blob(T.x+g[0]*off+g[0]*lean*(y-T.y0),y,T.z+g[1]*off+g[1]*lean*(y-T.y0),rx,ry,ca,cb,fi+bi);});
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;
 T.lean=g.slice();}

// ---------------------------------------------------------------- the pass
SP.forEach((S,i)=>{if(typeof B[i]!=='function')BIO.err('ehigh: no builder for species '+i+' '+S.key);});
const newStats=()=>({trunk:0,limb:0,far:0,clumps:0,blooms:0,spikes:0,cushions:0,woolbacks:0,thorns:0,towers:0,boulders:0,stones:0,heroes:0,fars:0,byS:SP.map(()=>0)});
EHIGH.buildTrees=function(R,q){
 reseed(550041);q=q==null?1:q;R=R||2500;means();
 const st=newStats();
 const TREES=EHIGH.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const LOD=BIO.LOD();
 function pass(P){const sp=P.sp,S=SP[sp],opt=P.opt||{},pad=opt.pad==null?2:opt.pad,small=!!opt.small,hero=LOD.hero*(small?.94:1),mid=LOD.mid*(small?.87:1);let n=0;
  BIO.grid(P.cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=P.accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{if(blocked(x,z,pad))return;
    const T=EHIGH.make(sp,x,y,z);
    const ld=BIO.lodD(x,z);T.lv=ld<hero?2:(ld<mid?1:0);
    if(T.lv===0&&!S.far)return;
    if(T.lv===0&&opt.farK!=null&&rng()>opt.farK)return;
    TREES.push(T);hadd({x:x,z:z,r:(T.sp<=2?T.crownR*.9:T.rb*1.4+1)});n++;},
   {patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,pad:pad+1});
  return n;}
 EHIGH.PASSES.forEach(pass);
 TREES.forEach((T,i)=>{if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 EHIGH.COUNTS=SP.map((S,i)=>st.byS[i]);
 const mo=EHIGH.buildMother(q);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),clumps:st.clumps,blooms:st.blooms,spikes:st.spikes,
  cushions:st.cushions,woolbacks:st.woolbacks,thorns:st.thorns,towers:st.towers,tris:{trunk:st.trunk,limbs:st.limb,far:st.far,mother:mo.mother}};};
EHIGH._canopyH=function(x,z){let h=0;for(const T of EHIGH.TREES){if(Math.hypot(x-T.x,z-T.z)<80)h=Math.max(h,T.y0+T.H);}return h||2;};
// the nearest built hero of a species to a point (o.stage picks a vigil spike's stage)
EHIGH.nearestTree=function(sp,x,z,minH,o){let b=null,bd=1e9;for(const T of EHIGH.TREES){if(T.sp!==sp||T.lv<2||(minH&&T.H<minH))continue;
 if(o&&o.stage&&T.stage!==o.stage)continue;if(o&&o.minR&&T.crownR<o.minR)continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance from the zones, options)
// Sparse, as a cold steppe is: most of the plain is grass and turf, the plants that make it strange stand apart.
EHIGH.PASSES=[
 // the ragbark woods first (they claim the gullies)
 {sp:4,cell:9,accept:(Z)=>Z.gully*.62+Z.tor*.03,opt:{pad:1.4,patch:.5,patchScale:.02}},
 // the vigil spikes in stands on the dry slope, a few out on the puna
 {sp:3,cell:17,accept:(Z)=>Z.dry*.42+Z.puna*.018,opt:{pad:1.6,patch:.8,patchScale:.008}},
 // the poured cushions: everywhere open, most on the cold meadow and at the tors' feet
 {sp:0,cell:15,accept:(Z)=>Z.fell*.3+Z.puna*.07*(1-Z.turf*.6)+Z.scree*.08+Z.tor*.14+Z.dry*.05,opt:{pad:1,patch:.65,patchScale:.012,lodK:.3}},
 // the woolbacks on the scree, the fell and the tors
 {sp:1,cell:12,accept:(Z)=>Z.scree*.32+Z.fell*.12+Z.tor*.18,opt:{pad:.8,patch:.7,patchScale:.014,small:true,lodK:.3}},
 // the glass towers on the scree and the cold meadow
 {sp:5,cell:11,accept:(Z)=>Z.scree*.3+Z.fell*.16,opt:{pad:.8,patch:.75,patchScale:.016,small:true,lodK:.4}},
 // the thorn cushions on the dry slope and the drier puna; the cereus clumps among them and on the tors
 {sp:2,cell:10,accept:(Z)=>Z.dry*.38+Z.puna*.025*(1-Z.turf),opt:{pad:.6,patch:.6,patchScale:.018,small:true,lodK:.5,farK:.35}},
 {sp:6,cell:20,accept:(Z)=>Z.dry*.24+Z.tor*.12,opt:{pad:1,patch:.7,patchScale:.012,small:true}},
];

// ---------------------------------------------------------------- one plant alone (biomes/WORLD.md: trees as variants)
EHIGH.make=function(sp,x,y,z){const S=SP[sp];return{x:x,z:z,y0:y-(sp<=2?.05:.3),sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999)};};
EHIGH.grow=function(T,lv){means();const st=newStats();
 T.lv=lv;if(lv===0){if(!SP[T.sp].far)return null;buildFar(T,T.seed%7,st);}else B[T.sp](T,st,lv);return st;};
})();
