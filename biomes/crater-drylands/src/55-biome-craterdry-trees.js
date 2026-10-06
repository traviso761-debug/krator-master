// ================================================================= CRATER DRYLANDS — trees
// The eleven tree-scale species, each with its own builder, placed by zone from the host's fields AND the burn age
// (52-fire). Every builder reads T.age, the years since the ground under it last burned, and draws the tree as the
// fire left it: a resprouter's black stems with red shoots at the root crown, a survivor's charred lower trunk
// with its crown above the flames, a seeder's burst snag with its seedlings round it, a killed tree's skeleton.
// Beyond the LOD spine a tree becomes an impostor in the 'far' bucket. Every count scales with q.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=CRATERDRY.SPECIES,PAL=CRATERDRY.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=CRATERDRY.C;
CRATERDRY.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// The world's fields (biomes/WORLD.md): wet, flow, rock, slope, oasis, cold; and the kit's own burn age. Each 0..1:
//   kop     the granite kopjes (rock): the refuges fire rarely reaches. Aloes, jade, pincushions; crassula, ferns
//   wash    a dry channel's sand: ghost gums and mallees; the fires often stop here
//   seep    the ground round a spring
//   cliff   a sheer rock face: nothing roots there (the owner's rule, Oct 2026: every zone is multiplied by 1-cliff)
//   char / bloom / regrow / mature   the open plain by the age of its last burn (CRATERDRY.stages):
//           under ~half a year, half a year to ~2.5 years, ~2.5 to ~7, older
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const F=n=>BIO.field(n,x,z);
 const wet=F('wet'),flow=F('flow'),rock=F('rock'),slope=F('slope'),oasis=F('oasis'),cold=F('cold');
 const age=CRATERDRY.ageAt(x,z),S=CRATERDRY.stages(age);
 const cliff=smooth(.82,.96,slope)*smooth(.3,.6,rock),live=1-cliff;
 const kop=smooth(.35,.65,rock)*live,seep=smooth(.25,.6,oasis)*(1-kop)*live,wash=smooth(.3,.65,flow)*(1-seep)*(1-kop)*live;
 const open=(1-kop)*(1-wash*.7)*(1-seep)*live;
 return{wet,flow,rock,slope,cold,age,cliff,kop,wash,seep,open,
  char:open*S.char,bloom:open*S.bloom,regrow:open*S.regrow,mature:open*S.mature};}
CRATERDRY.zones=zones;
CRATERDRY.standOf=(x,z,n,seed)=>BIO.standAt(x,z,n||2,.0024,seed||83);

// ---------------------------------------------------------------- colour (the maths is the core's, BIO.col)
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={bark:CRATERDRY.BARKTEX.map(t=>texMean(t)),wood:texMean(CRATERDRY.WOODTEX),rock:texMean(CRATERDRY.ROCKTEX)};
 // a library map's mean is the pack's (an sRGB grey: its linear value per channel)
 const lm=CRATERDRY.LIBMEAN||{},lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};MEAN.bark=MEAN.bark.map((m,k)=>lm['bark'+k]!=null?lin(lm['bark'+k]):m);
 if(lm.wood!=null)MEAN.wood=lin(lm.wood);if(lm.rock!=null)MEAN.rock=lin(lm.rock);
 return MEAN;}
Object.assign(CRATERDRY,{means,tint,bright,shade,vary});
const BARKC={};
const barkCol=(S,k)=>{const key=S.key+(k%S.bark.length);return BARKC[key]||(BARKC[key]=tint(S.bark[k%S.bark.length],means().bark[S.barkK]));};
const charCol=(S)=>tint(pick(PAL.char),S?means().bark[S.barkK]:means().wood,rr(.9,1.1));
const deadCol=(grey)=>tint(grey>.5?pick(PAL.deadwood):pick(PAL.char),means().wood,rr(.85,1.05));
const rodCol=(hex,f)=>shade(C(hex),f==null?-.25:f);
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.05:dh,ds==null?.14:ds,dl==null?.07:dl),k==null?1.3:k);
CRATERDRY.leafCol=leafCol;CRATERDRY.charCol=charCol;

// ---------------------------------------------------------------- fire on a tree
// The char a burn leaves on a trunk: up to the flame height (3-9 m, taller where the scrub was old), fading over the
// years as the bark sheds. scorch: the crown below about 1.4x the flame height browned or lost in the last year.
function charH(T){if(T.age>=9)return 0;if(T._ch==null)T._ch=rr(3,7)*(1+.3*smooth(.2,4,T.age))*(T.H>12?1.3:1);return T._ch*smooth(9,.6,T.age);}
const scorched=(T,y)=>T.age<1&&y<T.y0+charH(T)*1.4;

// ---------------------------------------------------------------- polyline helpers (Girder's)
function treeGrow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}
 return pts;}
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
const clear3=(x,y,z,rad,vr)=>BIO.clearOf3(x,y,z,rad,vr);
function along(pts,u){const f=clamp(u,0,1)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),t=f-i,a=pts[i],b=pts[i+1];return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),r:mix(a.r,b.r,t)};}

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+30;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
CRATERDRY.blocked=blocked;

// ---------------------------------------------------------------- foliage helpers
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey,c2){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.55,1,smooth(.3,.95,qq))*mix(.82,1,smooth(-.6,.35,dy))*rr(.9,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn],c2:c2?bright(c2,ao):null});}
function frondAt(item,x,y,z,a,L,pitch,col,wid,ex){BIO.put(item,[x,y,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*rr(.85,1.05),L*(wid||rr(1.1,1.4))],col,ex);}
function blooms(x,y,z,r,n,set,sz,o){o=o||{};const c=bright(vary(pick(set),.03,.1,.08),1.15),tl=o.tilt==null?.5:o.tilt;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),s=sz?rr(sz[0],sz[1]):rr(o.s0==null?.3:o.s0,o.s1==null?.55:o.s1);
  BIO.put('bloom',[x+Math.cos(a)*d,y+(o.flat?rr(0,.3):rr(-.3,.4)*r),z+Math.sin(a)*d],qEuler(rr(-tl,tl),rr(0,TAU),rr(-tl,tl)),s,(o.flat||i%4)?c:shade(c,rr(-.1,.2)));}}
CRATERDRY.blooms=blooms;
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r:r,h:h,age:T.age});
// a bole as a tube from the ground (crooked, tapering), coloured ring by ring: charred below the flame height
function bole(T,S,fam,x,z,h,r0,r1,lean,la,wig,n,st,seg,dead){const pts=[];const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,ph=rr(0,TAU),ch=charH(T);
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*h,ox=Math.cos(la)*lean*h*t*t+Math.cos(ph)*w,oz=Math.sin(la)*lean*h*t*t+Math.sin(ph)*w,y=T.y0-.3+(h+.3)*t;
  const burnt=dead?true:y-T.y0<ch*rr(.85,1.15);
  pts.push({x:x+ox,y,z:z+oz,r:mix(r0,r1,Math.pow(t,.8))*(t<.08?1.25:1),col:burnt?(dead?deadCol(dead):charCol(S)):barkCol(S,k)});}
 st.trunk+=BIO.tube(dead?'wood':fam,pts,pts[0].col,{seg:seg,cap:true});return pts;}
// a lathe ring's colour: the band's own, or char below the flame height
const ringCol=(T,S,y,col)=>y-T.y0<charH(T)?charCol(S):col;

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed,age} and lv 2 near / 1 mid
const B=[];

// 0 the PRISM MALLEE: three to seven thin stems from a swollen root crown (the lignotuber), bark shedding in strips of
// green, orange, red and cream (the prism gum's colours in small), lance leaves green to the sun and orange-red away
// from it. A resprouter: in the three years after a fire its stems stand dead and black and a ring of red shoots comes
// up from the root crown; it grows back to full height over six.
B[0]=function(T,st,lv){const S=SP[T.sp],a=T.age,grow=a<6?clamp(.2+a/6*.8,.2,1):1,H=T.H*grow,R=T.crownR*grow,rl=T.rb*rr(2.2,3.2);
 BIO.put('lobe',[T.x,T.y0-.25,T.z],qEuler(0,rr(0,TAU),0),[rl,rl*.6,rl],a<1?charCol(S):shade(barkCol(S,ri(0,5)),-.2));
 const nS=lv===2?ri(3,7):ri(2,4),a0=rr(0,TAU);let reach=rl+1,top=T.y0+1;
 if(a<3){
  // the dead stems: black, bare, a twig or two; crisp brown leaves still hanging in the first months
  for(let s=0;s<nS;s++){const sa=a0+s*TAU/nS+rr(-.3,.3),h=T.H*rr(.6,1),lean=rr(.08,.22);
   const pts=bole(T,S,'bark6',T.x+Math.cos(sa)*rl*.4,T.z+Math.sin(sa)*rl*.4,h,T.rb*.9,T.rb*.3,lean,sa,.1,lv===2?3:2,st,4,a>1.6?.8:.1);
   const e=pts[pts.length-1];top=Math.max(top,e.y);
   if(lv===2)for(let k=0,m=ri(1,3);k<m;k++){const ba=sa+rr(-1,1),bp=treeGrow(along(pts,rr(.6,.9)),dirOf(ba,rr(.4,.9)),h*rr(.18,.3),.05,.02,2,0,.1);
    BIO.beam('rod',[bp[0].x,bp[0].y,bp[0].z],[bp[2].x,bp[2].y,bp[2].z],.08,.03,charCol(S));
    if(a<.35&&rng()<.6)clumpAt('lance',bp[2].x,bp[2].y,bp[2].z,R*.28,.6,leafCol(PAL.scorch,1.1,.02,.08,.06),T.x,top,T.z,R,H*.3);}}
  // the resprouts: red-leaved shoots round the root crown, taller every month
  const hs=clamp(.35+a*1.15,.35,3.4),nn=lv===2?ri(5,9):3;
  for(let k=0;k<nn;k++){const sa=a0+k*GOLD,r0=rl*rr(.5,1.0),bx=T.x+Math.cos(sa)*r0,bz=T.z+Math.sin(sa)*r0,h=hs*rr(.6,1.1);
   const tip=[bx+Math.cos(sa)*h*.3,T.y0+h,bz+Math.sin(sa)*h*.3];
   if(lv===2)BIO.beam('rod',[bx,T.y0-.1,bz],tip,.05,.03,rodCol(pick(PAL.shoot),-.2));
   clumpAt('lance',tip[0],tip[1]-h*.15,tip[2],clamp(h*.55,.4,1.6),.8,leafCol(PAL.shoot,1.25,.03,.08,.05),T.x,T.y0+hs*.5,T.z,rl+1,hs,C(pick(PAL.shootIrid)));st.clumps++;st.shoots++;}
  regTree(T,S,reach+1,Math.max(top,T.y0+hs)-T.y0+1);return;}
 // the living mallee
 const hc=C(pick(S.leaf)),irid=C(pick(S.irid)),spots=[];
 for(let s=0;s<nS;s++){const sa=a0+s*TAU/nS+rr(-.3,.3),h=H*rr(.7,1),lean=rr(.1,.25);
  const pts=bole(T,S,'bark6',T.x+Math.cos(sa)*rl*.4,T.z+Math.sin(sa)*rl*.4,h*.72,T.rb*grow*.95+.03,T.rb*grow*.45+.02,lean,sa,.08,lv===2?4:2,st,lv===2?5:4,false);
  const e=pts[pts.length-1],nL=lv===2?ri(2,4):2;
  for(let k=0;k<nL;k++){const la=sa+rr(-1.1,1.1),L=h*rr(.3,.45),lp=treeGrow(e,dirOf(la,rr(.55,1.0)),L,e.r*.8,.03,3,-.06,.1);
   if(lv===2)st.limb+=BIO.tube('bark6',lp,barkCol(S,k+s),{seg:3});else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[3].x,lp[3].y,lp[3].z],e.r*1.4,.04,rodCol(S.bark[0]));
   spots.push({p:lp[3],s:L*.4,tip:true},{p:lp[2],s:L*.3});reach=Math.max(reach,Math.hypot(lp[3].x-T.x,lp[3].z-T.z)+L*.3);top=Math.max(top,lp[3].y);}}
 const cy=T.y0+H*.7,sz0=R*.42*(lv===2?1:1.5);
 for(const s of spots){const n=lv===2?(s.tip?2:1):(s.tip?1:0);
  for(let c=0;c<n;c++){const q=rr(0,TAU),d=s.s*.5*Math.sqrt(rng()),x=s.p.x+Math.cos(q)*d,z=s.p.z+Math.sin(q)*d,y=s.p.y+rr(-.15,.35)*s.s;
   clumpAt('lance',x,y,z,sz0*rr(.85,1.2),.7,hc,T.x,cy,T.z,R,H*.3,irid);st.clumps++;}}
 regTree(T,S,reach,top-T.y0+R*.4+1);};

// 1 the PYRE PILLAR (the owner's painting): a tall banded column, bands of teal and pale gold-green, plumed from a
// third of its height to the top with stiff feather fronds held up and out like a closed fan, more upright toward
// the tip. Its fireproof bands carry it through every burn: after one, the column is black below the flame height
// and the fronds there are gone.
B[1]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,ph=rr(0,TAU),bandH=rr(1.1,1.7);
 const rAt=u=>rb*(1-.55*u)*(u<.04?1.25:1);
 const rings=[];for(let u=0;u<=1.0001;u+=lv===2?.04:.1){const y=T.y0-.3+(H+.3)*u,band=Math.floor(u*H/bandH);
  rings.push({x:T.x,y,z:T.z,r:rAt(u)*(1+.07*Math.sin(u*H/bandH*TAU)),yy:u*H,col:ringCol(T,S,y,barkCol(S,band))});}
 rings.push({x:T.x,y:T.y0+H+.5,z:T.z,r:.05,yy:H+.5,col:barkCol(S,0)});
 st.trunk+=BIO.lathe('bark5',rings,lv===2?10:7,Math.max(1,Math.round(TAU*rb/2.5)),4,(Rg,a)=>Rg.r*(1+.03*Math.sin(8*a+ph)),null);
 const u0=rr(.26,.34),step=lv===2?1.25:2.4,ch=charH(T);
 for(let y=T.y0+H*u0;y<T.y0+H-.6;y+=step*rr(.85,1.15)){const u=(y-T.y0)/H,v=(u-u0)/(1-u0);
  if(T.age<1.6&&y-T.y0<ch*1.25)continue;   // the fronds the fire took
  const nF=lv===2?ri(5,7):4,L=R*1.3*(.55+.45*Math.sin(Math.PI*Math.min(1,v*.8+.2)))*rr(.9,1.1),el=mix(.62,1.38,v),r=rAt(u),af=rr(0,TAU);
  const brown=scorched(T,y),col=brown?leafCol(PAL.scorch,1.1,.02,.06,.05):bright(vary(C(0x8aa848).lerp(C(pick(S.leaf)),clamp(v*1.4,0,1)),.02,.06,.05),rr(1.05,1.3)*mix(.85,1.08,v));
  for(let k=0;k<nF;k++){const a=af+k/nF*TAU+rr(-.2,.2);frondAt('frond',T.x+Math.cos(a)*r*.8,y,T.z+Math.sin(a)*r*.8,a,L,el+rr(-.1,.1),col,rr(1.1,1.35));st.clumps++;}}
 // the plume's tip: a few fronds standing straight up, darker
 for(let k=0;k<3;k++){const a=rr(0,TAU);frondAt('frond',T.x,T.y0+H-.8,T.z,a,R*.7,1.35+rr(-.1,.1),shade(C(pick(S.leaf)),-.15),.7);}
 regTree(T,S,R*1.25+rb,H+R*.5);};

// 2 the FRILL-TREE: the Rift's frill tree in kiln country (biomes/rift, the frill tree and its barrel frill). A ribbed
// bottle column, swollen low with stored water, olive-grey; in rows up every rib, short stiff waxy fins, olive and gold
// with a copper sheen away from the sun, longest at the middle; at the summit a splay of long fins round the crown pod, a
// ruffled collar of dark red, orange and gold, and a smaller pod or two below it. A SEEDER: a fire kills it, burns its
// fins to black stubs and bursts the pods, throwing the fireproof seed over the ash; for four years the charred column
// stands in a ring of its own seedlings, and then the young trees grow back (a quarter of full height at four years,
// full at nine).
B[2]=function(T,st,lv){const S=SP[T.sp],a=T.age,dead=a<4,young=!dead&&a<9,g=young?mix(.3,1,smooth(4,9,a)):1,H=T.H*g,rb=T.rb*mix(.5,1,g),nR=10,ph=rr(0,TAU);
 const rAt=u=>rb*(1-.5*u)*(1+.35*Math.sin(Math.PI*Math.min(1,u*1.3)))*(1+.4*smooth(.06,0,u));   // a bottle: swollen low, tapering
 const dcol=a>2.5?deadCol(.6):charCol(S),rings=[],du=lv===2?.05:.12,hc=H*.88;
 for(let u=0;u<=1.0001;u+=du){const y=T.y0-.3+(hc+.3)*u;rings.push({x:T.x,y,z:T.z,r:rAt(u*.88),yy:u*hc,col:dead?dcol:barkCol(S,Math.floor(u*5))});}
 rings.push({x:T.x,y:T.y0+hc+rAt(.88)*1.4,z:T.z,r:.04,yy:hc+1,col:dead?dcol:barkCol(S,1)});   // closed: a rounded top, never an open pipe
 const uvs=BIO.bucket('bark5').uvScale;
 st.trunk+=BIO.lathe('bark5',rings,lv===2?16:9,Math.max(1,Math.round(TAU*rb/uvs[0])),uvs[1],(Rg,ang)=>Rg.r*(1+.12*Math.cos(nR*ang+ph)),(Rg,ang)=>.76+.24*Math.cos(nR*ang+ph));
 const c2s=S.irid,hcol=vary(pick(S.leaf),.03,.08,.05),fk=H/5;
 // the fins in rows on the ribs: alive, olive and gold; the first months after a fire, burnt stubs
 if(!dead||(lv===2&&a<1.6)){const rows=lv===2?Math.max(3,Math.round(H/.5)):Math.max(2,Math.round(H/1.4)),nf=lv===2?nR:nR/2;
  for(let r=0;r<rows;r++){const u=mix(.06,.84,r/Math.max(1,rows-1)),yy=T.y0+hc*u,R=rAt(u)*1.06;
   for(let k=0;k<nf;k++){const ang=(k/nf)*TAU-ph/nR+(r%2?TAU/nf/2:0)+rr(-.05,.05),L=mix(.38,.9,smooth(.05,.55,u))*mix(1.15,.7,u)*fk*rr(.88,1.1)*(dead?.45:1);
    BIO.put('frillfin',[T.x+Math.cos(ang)*R,yy,T.z+Math.sin(ang)*R],qEuler(rr(-.08,.08),-ang,mix(.7,.95,u)+rr(-.1,.1)),[L,L*.9,L*.9],
     dead?leafCol(PAL.ash,.75,.01,.03,.05):bright(vary(hcol,.02,.06,.05),rr(1.15,1.35)),{c2:dead?leafCol([0x5a5650,0x4a4642],.8):bright(C(pick(c2s)),1.15),n:[Math.cos(ang)*.85,.5,Math.sin(ang)*.85]});st.fins++;}}}
 const top=T.y0+hc,rT=rAt(.88);let reach=rb+1;
 if(dead){
  // the burst crown: the pod's collar blackened and torn wide open at the top of the charred column
  const cw=rr(.9,1.3);BIO.put('frill',[T.x,top+.1,T.z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[cw,cw*.4,cw],C(pick([0x3a2620,0x302018,0x44281e])));st.pods++;   // charred, an ember tinge from the collar's own red
  // the thrown seed, come up as seedlings in a ring round the snag (after the first rains, a third of a year on)
  if(a>.3){const n=lv===2?ri(8,16):4,hs=clamp(.15+a*.32,.15,1.4);
   for(let i=0;i<n;i++){const q=rr(0,TAU),d=rr(4,18),x=T.x+Math.cos(q)*d,z=T.z+Math.sin(q)*d;if(BIO.mask(x,z)<=0)continue;
    BIO.put('round',[x,Y(x,z)+hs*.45,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[hs*.7,hs*.6,hs*.7],leafCol(PAL.seedling,1.2,.03),{n:[0,1,0]});st.seedlings++;}
   reach=18;}
  regTree(T,S,reach,top-T.y0+2);return;}
 // the crown: a splay of long fins round the pod, the pod opening upward (a young tree flowers from five years on)
 const n=lv===2?12:6,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const ang=a0+k/n*TAU+rr(-.15,.15),L=H*rr(.24,.32);
  BIO.put('frillfin',[T.x+Math.cos(ang)*rT*.6,top+rr(-.2,.3),T.z+Math.sin(ang)*rT*.6],qEuler(rr(-.1,.1),-ang,rr(.45,.95)),[L,L,L*.95],bright(vary(hcol,.02,.06,.05),1.3),
   {c2:bright(C(pick(c2s)),1.15),n:[Math.cos(ang)*.7,.7,Math.sin(ang)*.7]});st.fins++;reach=Math.max(reach,rT+L);}
 if(g>.65){BIO.put('frill',[T.x,top+rT*.9,T.z],qUp([rr(-.1,.1),1,rr(-.1,.1)]),[rT*3.2,rT*2.2,rT*3.2],bright(vary(pick(PAL.frill),.02,.06,.05),1.15));st.pods++;
  if(lv===2)for(let k=0,m=ri(0,2);k<m;k++){const u=rr(.62,.78),ang=rr(0,TAU),R=rAt(u),s=rT*rr(.9,1.3);
   BIO.put('frill',[T.x+Math.cos(ang)*R*1.1,T.y0+hc*u,T.z+Math.sin(ang)*R*1.1],qUp([Math.cos(ang)*.6,.8,Math.sin(ang)*.6]),s,bright(vary(pick(PAL.frill),.02,.06,.05),1.1));st.pods++;}}
 regTree(T,S,reach,top-T.y0+H*.22+1);};

// 3 the PARASOL PINE and the long trunks: a clear straight bole with an umbrella of near-level limbs at the top, so the
// crown stands far above any flame. A survivor: charred below the flame height, its crown green.
function pineTree(T,st,lv,cfg){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,hc=C(pick(S.leaf)),spots=[],a0=rr(0,TAU);
 const pts=bole(T,S,cfg.fam,T.x,T.z,H,rb,rb*.25,rr(0,.04),a0,cfg.wig,lv===2?6:3,st,lv===2?7:5,false);
 const step=(lv===2?cfg.step:cfg.step*2.2)*H,cb=cfg.cb*H;let topY=T.y0+H;
 for(let yy=cb;yy<H-.4;yy+=step*rr(.8,1.2)){const u=yy/H,p=along(pts,u),n=lv===2?ri(2,4):ri(1,2),bu=(yy-cb)/Math.max(.1,H-cb);
  for(let k=0;k<n;k++){const ba=rr(0,TAU),L=R*cfg.shape(bu)*rr(.8,1.15);if(L<.4)continue;
   const el=cfg.el+cfg.elU*bu+rr(-.12,.12),r0=Math.max(.04,p.r*rr(.4,.6));
   const bp=treeGrow({x:p.x+Math.cos(ba)*p.r*.6,y:p.y,z:p.z+Math.sin(ba)*p.r*.6},dirOf(ba,el),L,r0,Math.max(.03,r0*.3),3,cfg.curve,.12);
   if(lv===2&&r0>.07)st.limb+=BIO.tube(cfg.fam,bp,barkCol(S,k+1),{seg:r0>.2?5:3,cap:r0>.2});
   else BIO.beam('rod',[bp[0].x,bp[0].y,bp[0].z],[bp[3].x,bp[3].y,bp[3].z],r0*2,r0*.8,rodCol(S.bark[0]));
   st.forks++;spots.push({p:bp[3],s:L*.32,tip:true},{p:bp[2],s:L*.26});topY=Math.max(topY,bp[3].y);}}
 const cy=T.y0+H*mix(cfg.cb,1,.55),ey=H*(1-cfg.cb)*.5,sz0=R*cfg.tuftK*(lv===2?1:1.5);
 for(const s of spots){const n=lv===2?(s.tip?2:1):(s.tip?1:0);
  for(let c=0;c<n;c++){const a=rr(0,TAU),d=s.s*.45*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.05,.3)*s.s;
   clumpAt(cfg.item,x,y,z,sz0*rr(.85,1.2),cfg.flat,scorched(T,y)?leafCol(PAL.scorch,1.1,.02,.06,.05):hc,T.x,cy,T.z,R,ey);st.clumps++;}}
 regTree(T,S,R*1.15,topY-T.y0+R*.3+1);}
B[3]=function(T,st,lv){pineTree(T,st,lv,{fam:'bark1',item:'needle',cb:rr(.68,.78),step:.028,el:.1,elU:.15,curve:.05,wig:.03,tuftK:.56,flat:.42,
 shape:u=>.55+.45*Math.sin(Math.PI*Math.min(1,u*1.05+.1))});};

// 4 the GHOST GUM: a tall powder-white trunk, a sparse drooping crown of grey-green lance leaves high above the flames.
// In the three years after a fire, red-green epicormic shoots burst along the trunk below the crown.
function decTree(T,st,lv,cfg){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR;
 const nS=ri(cfg.stems[0],cfg.stems[1]),a0=rr(0,TAU),hc=C(pick(S.leaf)),spots=[];let reach=R*.6,topY=T.y0+H*.8;const boles=[];
 for(let s=0;s<nS;s++){const a=a0+s*TAU/nS+rr(-.3,.3),off=nS>1?rb*rr(.5,1.2):0,lean=nS>1?rr(.06,.2):rr(0,.05),fh=H*cfg.forkU*(s?rr(.75,1):1);
  const pts=bole(T,S,cfg.fam,T.x+Math.cos(a)*off,T.z+Math.sin(a)*off,fh,rb*(nS>1?.7:1),rb*(nS>1?.45:.6),lean,a,cfg.wig,lv===2?4:2,st,lv===2?(rb>.3?7:5):4,false);boles.push(pts);
  const top=pts[pts.length-1],nL=lv===2?ri(cfg.limbs[0],cfg.limbs[1]):Math.max(2,cfg.limbs[0]-1),la0=rr(0,TAU);
  for(let k=0;k<nL;k++){const la=la0+k*GOLD+rr(-.3,.3),el=cfg.el*rr(.8,1.2),L=(H-fh)*cfg.limbK*rr(.8,1.15)/(nS>1?1.15:1),r0=top.r*rr(.55,.75);
   const o=k<2?top:along(pts,rr(.75,.98)),lp=treeGrow({x:o.x,y:o.y,z:o.z},dirOf(la,el),L,r0,Math.max(.04,r0*.35),3,cfg.curve,cfg.wig);
   if(lv===2||r0>.3)st.limb+=BIO.tube(cfg.fam,lp,barkCol(S,k+2),{seg:r0>.25?5:4,cap:r0>.25});else{BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[2].x,lp[2].y,lp[2].z],r0*2,r0*1.3,rodCol(S.bark[0]));BIO.beam('rod',[lp[2].x,lp[2].y,lp[2].z],[lp[3].x,lp[3].y,lp[3].z],r0*1.3,r0*.7,rodCol(S.bark[0]));}st.forks++;
   spots.push({p:lp[3],s:L*.3,tip:true},{p:lp[2],s:L*.25});
   for(let q=0,nSec=lv===2?cfg.sec:0;q<nSec;q++){const p=lp[ri(1,2)],a2=la+rr(-1.3,1.3),el2=el+rr(-.3,.5),L2=L*rr(.4,.65);
    const sp2=treeGrow({x:p.x,y:p.y,z:p.z},dirOf(a2,el2),L2,Math.max(.03,p.r*.55),.03,2,cfg.curve,.12);
    BIO.beam('rod',[sp2[0].x,sp2[0].y,sp2[0].z],[sp2[2].x,sp2[2].y,sp2[2].z],sp2[0].r*2,.05,rodCol(S.bark[0]));spots.push({p:sp2[2],s:L2*.4,tip:true},{p:sp2[1],s:L2*.3});}
   reach=Math.max(reach,Math.hypot(lp[3].x-T.x,lp[3].z-T.z)+L*.3);topY=Math.max(topY,lp[3].y+R*cfg.tuftK);}
  spots.push({p:{x:top.x,y:top.y+R*.15,z:top.z},s:R*.3,tip:true});}
 const cy=T.y0+H*mix(cfg.forkU,1,.5),ey=H*(1-cfg.forkU)*.55,sz0=R*cfg.tuftK*(lv===2?1:1.5);let mine=0;
 const leafOf=y=>scorched(T,y)?leafCol(PAL.scorch,1.1,.02,.06,.05):cfg.jadeLib?bright(C(0xffffff),rr(.85,1.05)):(cfg.mixCol&&rng()<cfg.mixCol[0]?C(pick(cfg.mixCol[1])):hc);
 for(const s of spots){const n=lv===2?(s.tip?cfg.nC||2:1):(s.tip?1:0);
  for(let c=0;c<n;c++){const a=rr(0,TAU),d=s.s*.5*Math.sqrt(rng()),x=s.p.x+Math.cos(a)*d,z=s.p.z+Math.sin(a)*d,y=s.p.y+rr(-.15,.4)*s.s;
   if(!clear3(x,y,z,sz0*.4,sz0*.3))continue;
   clumpAt(cfg.item,x,y,z,sz0*rr(.85,1.2),cfg.flat,leafOf(y),T.x,cy,T.z,R,ey);st.clumps++;mine++;}}
 if(!mine){clumpAt(cfg.item,T.x,T.y0+H*.8,T.z,sz0,cfg.flat,hc,T.x,cy,T.z,R,ey);st.clumps++;}
 // epicormic shoots on a burnt trunk
 if(cfg.epicormic&&T.age>.06&&T.age<3&&lv===2)boles.forEach(pts=>{for(let k=0,m=ri(8,16);k<m;k++){const p=along(pts,rr(.15,.95)),q=rr(0,TAU);
  clumpAt('lance',p.x+Math.cos(q)*p.r*1.3,p.y,p.z+Math.sin(q)*p.r*1.3,rr(.45,.9)*clamp(.5+T.age*.5,.5,1.3),.8,leafCol(PAL.shoot,1.2,.03),T.x,p.y,T.z,1,1,C(pick(PAL.shootIrid)));st.shoots++;}});
 regTree(T,S,reach,topY-T.y0+1);}
B[4]=function(T,st,lv){decTree(T,st,lv,{fam:'bark7',item:'lance',stems:[1,1],forkU:rr(.5,.6),limbs:[3,5],el:.85,limbK:.75,sec:2,curve:-.1,wig:.06,tuftK:.36,flat:.7,epicormic:true});};
// 8 the EMBER JADE: a stubby succulent tree, thick red-brown stems and round fleshy leaves in orange and red
B[8]=function(T,st,lv){decTree(T,st,lv,{fam:'bark0',item:CRATERDRY.LIB.jade?'jadeleaf':'round',jadeLib:CRATERDRY.LIB.jade,tuftK:CRATERDRY.LIB.jade?.66:.46,stems:[1,3],forkU:.32,limbs:[3,5],el:.75,limbK:.85,sec:2,curve:.02,wig:.15,flat:.75,mixCol:[.18,PAL.jadeGreen]});};

// 5 the TREE ALOE: a grey stem forking two or three times, each branch ending in a rosette of fat curved leaves over a
// skirt of its own dead ones, and orange candles of flowers standing up out of the rosettes (the reference's aloe)
B[5]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,tips=[];
 const pts=bole(T,S,'bark0',T.x,T.z,H*rr(.45,.6),rb,rb*.75,rr(0,.06),rr(0,TAU),.05,3,st,lv===2?6:4,false),top=pts[pts.length-1];
 const fork=(o,a,L,r,d)=>{if(d===0||L<.6){tips.push(o);return;}const n=d===2?ri(2,3):2;
  for(let k=0;k<n;k++){const b=a+(k-(n-1)/2)*rr(.7,1.1),lp=treeGrow(o,dirOf(b,rr(.75,1.05)),L,r,r*.8,2,.05,.05);
   if(lv===2)st.limb+=BIO.tube('bark0',lp,barkCol(S,k),{seg:5,cap:true});else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[2].x,lp[2].y,lp[2].z],r*2,r*1.6,rodCol(S.bark[0]));
   fork(lp[2],b,L*.75,r*.8,d-1);}};
 fork(top,rr(0,TAU),(H-H*.5)*.55,rb*.7,lv===2?2:1);
 let reach=R*.5;
 for(const p of tips){const rs=R*rr(.42,.55);
  BIO.put('lobe',[p.x,p.y-rs*.35,p.z],qEuler(Math.PI,rr(0,TAU),0),[rs*.55,rs*.6,rs*.55],leafCol(PAL.skirt,.9,.02));
  BIO.put('aloe',[p.x,p.y-.1,p.z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[rs,rs*.85,rs],bright(vary(pick(S.leaf),.02,.06,.05),1.25));st.clumps++;
  if(rng()<.75)for(let k=0,m=lv===2?ri(2,4):1;k<m;k++){const q=rr(0,TAU),d=rs*rr(.05,.25),ch=rr(.7,1.2);
   BIO.put('spire',[p.x+Math.cos(q)*d,p.y+rs*.2,p.z+Math.sin(q)*d],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[.16,ch,.16],bright(vary(pick(PAL.candle),.02,.06,.05),1.25));st.blooms++;}
  reach=Math.max(reach,Math.hypot(p.x-T.x,p.z-T.z)+rs);}
 regTree(T,S,reach,H+1.5);};

// 6 the JOSHUA TREE: a shaggy trunk forking into crooked arms, each ending in a dagger rosette over a skirt of dead
// leaves; cream flower clusters at some tips. Killed by fire: the black skeleton stands for years, a small rosette
// coming back at its foot after the first year.
B[6]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,a=T.age,dead=a<6,tips=[];
 const pts=bole(T,S,'bark0',T.x,T.z,H*rr(.35,.5),rb,rb*.8,rr(0,.06),rr(0,TAU),.08,3,st,lv===2?6:4,dead?(a>3?.6:.1):false),top=pts[pts.length-1];
 const arm=(o,a0,L,r,d)=>{if(d===0){tips.push(o);return;}const n=ri(2,3);
  for(let k=0;k<n;k++){const b=a0+k*TAU/n+rr(-.4,.4),lp=treeGrow(o,dirOf(b,rr(.35,.85)),L,r,r*.85,2,.15,.15);
   if(lv===2)st.limb+=BIO.tube(dead?'wood':'bark0',lp,dead?deadCol(a>3?.6:.1):barkCol(S,k),{seg:4,cap:true});
   else BIO.beam('rod',[lp[0].x,lp[0].y,lp[0].z],[lp[2].x,lp[2].y,lp[2].z],r*2,r*1.7,dead?charCol(S):rodCol(S.bark[0]));
   arm(lp[2],b,L*.75,r*.8,d-1);}};
 arm(top,rr(0,TAU),(H-H*.42)*.45,rb*.7,lv===2?2:1);
 let reach=R*.4;
 for(const p of tips){reach=Math.max(reach,Math.hypot(p.x-T.x,p.z-T.z)+.8);
  // a dead tree keeps the black stubs of its burnt leaf skirts at the arm ends
  if(dead){BIO.put('lobe',[p.x,p.y-.25,p.z],qEuler(Math.PI,rr(0,TAU),0),[.28,.45,.28],charCol(S));continue;}const rs=rr(.55,.8);
  BIO.put('lobe',[p.x,p.y-rs*.5,p.z],qEuler(Math.PI,rr(0,TAU),0),[rs*.45,rs*.8,rs*.45],leafCol(PAL.skirt,.9,.02));
  BIO.put('rosette',[p.x,p.y-.15,p.z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[rs,rs*.9,rs],bright(vary(pick(S.leaf),.02,.06,.05),1.25));st.clumps++;
  if(lv===2&&rng()<.25){BIO.put('plume',[p.x,p.y+rs*.6,p.z],qEuler(0,rr(0,TAU),0),[rs*.6,rs*.7,rs*.6],leafCol(PAL.cream,1.15,.01,.04,.04));st.blooms++;}}
 if(dead&&a<1.5)BIO.put('lichen',[T.x,Y(T.x,T.z)+.03,T.z],qEuler(0,rr(0,TAU),0),[2.2,1,2.2],leafCol(PAL.ash,1.0,.01,.03,.04));   // its ash ring
 if(dead&&a>1){const rs=clamp(.25+(a-1)*.12,.25,.6);BIO.put('rosette',[T.x+rb*1.2,T.y0-.05,T.z],qEuler(0,rr(0,TAU),0),[rs,rs*.9,rs],bright(vary(pick(S.leaf),.02,.06,.05),1.25));st.shoots++;}
 regTree(T,S,reach,H+1.5);};

// 7 the PINCUSHION TREE (the reference's orange pompom tree): a bottle of knobbly sage-teal pods stacked round its
// axis, short arms from the top, and at every end a pompom of orange flame-spikes round a gold eye. Its succulent pods
// survive a burn; the lower ones blacken.
B[7]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,R=T.crownR,bH=H*rr(.5,.62);
 const rAt=u=>rb*(.85+.55*Math.sin(clamp(u*1.1,0,1)*Math.PI*.9))*(1-u*.35);
 const rings=[];for(let u=0;u<=1.001;u+=.25)rings.push({x:T.x,y:T.y0-.2+bH*u,z:T.z,r:rAt(u)*.62,yy:u*bH,col:barkCol(S,ri(0,2))});
 st.trunk+=BIO.lathe('bark5',rings,lv===2?8:6,1,3,R2=>R2.r,null);
 const rows=lv===2?Math.round(bH/(rb*.75)):Math.round(bH/(rb*1.6)),ch=charH(T);
 for(let i=0;i<rows;i++){const u=(i+.5)/rows,y=T.y0+bH*u-rb*.4,r=rAt(u),n=Math.max(4,Math.round(TAU*r/(rb*(lv===2?.8:1.5)))),a0=i*.4+rr(0,.3);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,h=rb*rr(.9,1.25)*(lv===2?1:1.7),w=rb*rr(.55,.75)*(lv===2?1:1.7);
   BIO.put('gem',[T.x+Math.cos(a)*r*.62,y,T.z+Math.sin(a)*r*.62],qEuler(Math.sin(a)*.25,rr(0,TAU),-Math.cos(a)*.25),[w,h,w],y-T.y0<ch?shade(C(pick(PAL.char)),.05):bright(vary(pick(PAL.cushionPod),.02,.08,.07),rr(1.0,1.3)));st.pods++;}}
 const top={x:T.x,y:T.y0+bH,z:T.z},nB=lv===2?ri(7,11):5;
 const head=(p,s)=>{const brown=scorched(T,p.y);clumpAt('flame',p.x,p.y+.3,p.z,s,.8,brown?leafCol(PAL.scorch,1.1):bright(vary(pick(S.leaf),.03,.08,.05),1.25),T.x,T.y0+H*.85,T.z,R,H*.2);
  if(!brown)BIO.put('fruit',[p.x,p.y+.3,p.z],null,s*.08,bright(C(pick(PAL.cushionEye)),1.1));st.clumps++;};
 for(let k=0;k<nB;k++){const a=k*GOLD+rr(-.2,.2),el=rr(.35,1.0),L=R*rr(.6,1.0),bp=treeGrow({x:top.x,y:top.y,z:top.z},dirOf(a,el),L,rb*.2,.06,3,.1,.08);
  st.limb+=BIO.tube('bark5',bp,barkCol(S,1),{seg:4,cap:true});
  head(bp[3],R*rr(.42,.6)*(lv===2?1:1.3));if(lv===2)head(bp[2],R*rr(.32,.45));}
 head({x:top.x,y:top.y+R*.35,z:top.z},R*.6);
 regTree(T,S,R*1.05,H+1);};

// 9 the CHAPARRAL YUCCA: a ball of blue-grey daggers; a flowering one sends up a cream spike. A resprouter: black for
// a few months after a fire, then green from the heart.
B[9]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,H=T.H,a=T.age,hc=a<.4?leafCol(PAL.char,1.0,.01,.02,.02):vary(pick(S.leaf),.02,.08,.05);
 BIO.put('rosette',[T.x,T.y0-.1,T.z],qEuler(0,rr(0,TAU),0),[R,R*.95,R],a<.4?hc:bright(hc,1.25));
 if(a<.4){BIO.put('rosette',[T.x,T.y0-.05,T.z],qEuler(0,rr(0,TAU),0),[R*.35,R*.4,R*.35],bright(vary(pick(S.leaf),.02,.08,.05),1.25));st.shoots++;}
 else if(rng()<.55){const top=T.y0+H,lean=[rr(-.3,.3),rr(-.3,.3)];BIO.beam('rod',[T.x,T.y0+R*.6,T.z],[T.x+lean[0],top,T.z+lean[1]],T.rb*2,T.rb*.7,rodCol(0x7a8a5a,-.1));
  for(let k=0,n=lv===2?ri(9,15):4;k<n;k++){const u=rr(.42,1),y=mix(T.y0+R*.6,top,u),px=T.x+lean[0]*u+rr(-.15,.15),pz=T.z+lean[1]*u+rr(-.15,.15);
   BIO.put('bloom',[px,y,pz],qEuler(rr(-.6,.6),rr(0,TAU),rr(-.6,.6)),mix(.5,.3,u),leafCol(PAL.cream,1.15,.01,.04,.04));}
  st.spikes++;}
 regTree(T,S,R,Math.max(H,R));};

// 10 the SWORD SPIRE (the reference's silversword): a ball of silver swords that lives for years as a rosette, then,
// in the bloom after a fire, sends up one great spike of magenta flowers and dies. The Scyvoi count the years since
// a burn by the dead brown spikes.
B[10]=function(T,st,lv){const S=SP[T.sp],R=T.crownR,H=T.H,a=T.age,flower=a>=.3&&a<2.6,spent=a>=2.6&&a<4.5;
 T=Object.assign({},T,{y0:T.y0+.38});   // a rosette sits on the ground, not sunk like a trunk's foot
 const rc=spent?leafCol(PAL.scorch,1.0,.02,.05,.05):bright(vary(pick(S.leaf),.01,.04,.04),1.3);
 BIO.put('rosette',[T.x,T.y0-.05,T.z],qEuler(0,rr(0,TAU),0),[R,R*.8,R],rc);
 if(flower||spent){const sh=H-R*.4,sw=R*rr(.45,.6);
  BIO.put('spire',[T.x,T.y0+R*.35,T.z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[sw,sh,sw],spent?leafCol([0x7a5a3a,0x6a4a30],1.0):bright(C(0x7a9a5a).lerp(C(pick(PAL.swordSpike)),.3),1.2));
  if(flower&&lv===2)for(let k=0,n=ri(16,26);k<n;k++){const u=rr(.1,.85),q=rr(0,TAU),r=sw*.5*Math.sin(Math.PI*Math.min(1,u*.92+.04))*1.05;
   BIO.put('bloom',[T.x+Math.cos(q)*r,T.y0+R*.35+sh*u,T.z+Math.sin(q)*r],qEuler(rr(-1,1),rr(0,TAU),rr(-1,1)),rr(.14,.22),leafCol(PAL.swordSpike,1.35,.02,.06,.05));}
  st.spikes++;}
 regTree(T,S,R+.3,(flower||spent)?H+.5:R+.5);};

// ---------------------------------------------------------------- impostors (the far canopy)
// far.blobs: icosahedral blobs on a pole (sedesert's recipe). A burnt tree's impostor is its bare pole, charred,
// with a small dark blob (the snags of the resprouters and the seeders read as black sticks from afar).
let ICO=null;
function buildFar(T,fi,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 const kk=BIO._lodKey(T.x,T.z),F=S.far||{poleU:.35},bare=(S.fire==='resprouter'&&T.age<3&&S.key!=='yucca')||(S.fire==='seeder'&&S.key==='frill'&&T.age<4)||(S.fire==='killed'&&T.age<6);
 const bc=(bare||T.age<1.5?C(pick(PAL.char)):C(S.bark[fi%S.bark.length])).convertSRGBToLinear();
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.1*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.55+.45*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const seg=4,taper=F.taper==null?.4:F.taper,top=T.y0+T.H*(bare?.85:F.poleU);
 const rings=[0,.06,.5,1].map(u=>{const sh=.7+.3*u*.75;return{x:T.x,y:T.y0+(top-T.y0)*u,z:T.z,r:Math.max(.25,T.rb*(1-taper*u)*(u<.08?1.5:1)),yy:u,col:[bc.r*sh,bc.g*sh,bc.b*sh]};});
 st.far+=BIO.lathe('far',rings,seg,1,1,(Rg,a)=>Rg.r,null);
 if(bare){const c=pick(PAL.char);blob(T.x,T.y0+T.H*.7,T.z,T.crownR*.4,T.H*.15,c,c,fi);}
 else{const L=S.leaf.map(h=>bright(h,.9)),R=T.crownR,a0=(T.seed%628)/100;
  const colOf=c=>typeof c==='number'?c:c[0]==='B'?S.bark[+c[1]%S.bark.length]:c==='L0'?L[fi%L.length]:L[+c[1]%L.length];
  F.blobs.forEach((b,bi)=>{const o=b[5]||{};
   const y=o.yOf==='R'?T.y0+R*b[0]:T.y0+T.H*b[0],rx=o.rxOf==='rb'?T.rb*b[1]:R*b[1],ry=o.ryOf==='R'?R*b[2]:T.H*b[2];
   blob(T.x+Math.cos(a0)*(o.off?R*o.off:0),y,T.z+Math.sin(a0)*(o.off?R*o.off:0),rx,ry,colOf(b[3]),colOf(b[4]),fi+bi);});}
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
SP.forEach((S,i)=>{if(typeof B[i]!=='function')BIO.err('craterdry: no builder for species '+i+' '+S.key);});
const newStats=()=>({fins:0,trunk:0,limb:0,far:0,forks:0,clumps:0,blooms:0,pods:0,spikes:0,shoots:0,seedlings:0,heroes:0,fars:0,byS:SP.map(()=>0)});
CRATERDRY.buildTrees=function(R,q){
 reseed(550031);q=q==null?1:q;R=R||2500;means();
 const st=newStats();
 const TREES=CRATERDRY.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const LOD=BIO.LOD();
 function pass(P){const sp=P.sp,S=SP[sp],opt=P.opt||{},pad=opt.pad==null?4:opt.pad,small=!!opt.small,hero=LOD.hero*(small?.94:1),mid=LOD.mid*(small?.87:1);let n=0;
  BIO.grid(P.cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=P.accept(Z,x,z);if(a<=0)return 0;
    const lod=BIO.lod(x,z);return a*(opt.lodK?lerp(1,lod,opt.lodK):1)*q;},
   (x,y,z,d)=>{if(blocked(x,z,pad))return;
    const T=CRATERDRY.make(sp,x,y,z);
    const ld=BIO.lodD(x,z);T.lv=ld<hero?2:(ld<mid?1:0);
    if(T.lv===0&&!S.far)return;
    TREES.push(T);hadd({x:x,z:z,r:T.rb*1.4+1});n++;},
   {patch:opt.patch==null?.6:opt.patch,patchScale:opt.patchScale||.01,pad:pad+2});
  return n;}
 CRATERDRY.PASSES.forEach(pass);
 TREES.forEach((T,i)=>{if(T.lv===0){buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 CRATERDRY.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),forks:st.forks,clumps:st.clumps,blooms:st.blooms,pods:st.pods,spikes:st.spikes,
  shoots:st.shoots,seedlings:st.seedlings,tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
CRATERDRY._canopyH=function(x,z){let h=0;for(const T of CRATERDRY.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h||6;};
// the nearest built hero of a species to a point; o.age:[lo,hi] picks one by the age of its burn
CRATERDRY.nearestTree=function(sp,x,z,minH,o){let b=null,bd=1e9;for(const T of CRATERDRY.TREES){if(T.sp!==sp||T.lv<2||(minH&&T.H<minH))continue;
 if(o&&o.age&&(T.age<o.age[0]||T.age>=o.age[1]))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance from the zones, options)
// The open plain's four stages share most species (a fire changes how a tree LOOKS, not whether it is there); the
// refuges and the washes have their own.
const burnable=Z=>Z.char+Z.bloom+Z.regrow+Z.mature;
CRATERDRY.PASSES=[
 // the tall survivors first (they claim their ground): parasol pines and ghost gums, the pyre pillars in stands
 {sp:3,cell:66,accept:(Z)=>burnable(Z)*.16+Z.wash*.08,opt:{pad:4,patch:.45,patchScale:.006}},
 {sp:4,cell:34,accept:(Z)=>Z.wash*.5+Z.seep*.6+burnable(Z)*.012,opt:{pad:3,patch:.3,patchScale:.01}},
 {sp:1,cell:44,accept:(Z)=>(Z.mature*.24+Z.regrow*.2+Z.bloom*.18+Z.char*.18)+Z.kop*.03,opt:{pad:2,patch:.62,patchScale:.007}},
 // the scrub trees: frill-trees, Joshua trees, the prism mallee (the dominant)
 {sp:2,cell:38,accept:(Z)=>Z.mature*.3+Z.regrow*.2+Z.bloom*.24+Z.char*.26,opt:{pad:2,patch:.55,patchScale:.01}},
 {sp:6,cell:40,accept:(Z)=>Z.mature*.18+Z.regrow*.14+Z.bloom*.12+Z.char*.12,opt:{pad:2,patch:.5,patchScale:.008}},
 {sp:0,cell:21,accept:(Z)=>(Z.regrow*.36+Z.mature*.42+Z.bloom*.3+Z.char*.3)+Z.wash*.24,opt:{pad:1.2,patch:.55,patchScale:.012,lodK:.3}},
 // the refuges: aloes, jade and pincushions on the kopjes
 {sp:5,cell:20,accept:(Z)=>Z.kop*.42+burnable(Z)*.012,opt:{pad:1.2,patch:.6,patchScale:.012}},
 {sp:7,cell:36,accept:(Z)=>Z.kop*.2+(Z.mature+Z.regrow)*.05+Z.bloom*.05,opt:{pad:2,patch:.5}},
 {sp:8,cell:14,accept:(Z)=>Z.kop*.38,opt:{pad:.8,patch:.65,patchScale:.014,small:true}},
 // yucca everywhere in the open; the sword spires in the bloom, flowering
 {sp:9,cell:24,accept:(Z)=>burnable(Z)*.12+Z.kop*.05+Z.wash*.04,opt:{pad:1,patch:.5,lodK:.5,small:true}},
 {sp:10,cell:15,accept:(Z)=>Z.bloom*.34+Z.regrow*.04+Z.mature*.02,opt:{pad:.6,patch:.75,patchScale:.016,lodK:.5,small:true}},
];

// ---------------------------------------------------------------- one tree alone (biomes/WORLD.md: trees as variants)
// make(sp,x,y,z): the pass's own tree record (H, rb, crownR and seed from the kit's stream, the age of the ground's
// last burn from the fire history). grow(T,lv): build that one tree at level lv (2 hero, 1 mid, 0 the impostor).
CRATERDRY.make=function(sp,x,y,z){const S=SP[sp];return{x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),age:CRATERDRY.ageAt(x,z)};};
CRATERDRY.grow=function(T,lv){means();const st=newStats();
 T.lv=lv;if(lv===0){if(!SP[T.sp].far)return null;buildFar(T,T.seed%7,st);}else B[T.sp](T,st,lv);return st;};
})();
