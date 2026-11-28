// ================================================================= THE TIERS — the floor: what lies and grows on the ground (and the water)
// By zone (55: TIERS.zones) from the host's fields, the rule kept at the small scale too:
//   the tiergrass     in rows along the slopes' contours: its tufts sit on the lips of the terracettes, the little soil steps every grazed slope
//                     carries (a tuft where the ground's height stands in the top fifth of a 0.9 m step: rows a step apart, the terracettes'
//                     lips; the ground's steps themselves are amendment 3, T4: KNOWN_ISSUES.md)
//   the ledge heath   in level rows along the riser's ledges (the ledge field: a bench of the scarp), sparse on the dry rocky ground
//   the shore reeds   in the wet band at the water's edge
//   the stair lilies  colonies in the sheltered bays (0.3-2.6 m of water): pads in overlapping steps out from the shore, the oldest highest
//   the step moss     mats on the tufa dams of the seep's pools and along its wet line
//   the band lichen   crusts on the talus's boulders (the faces carry it as a ground layer: 45, ground.lichen)
//   the talus         basalt boulders and fallen columns under the Black Step and the stacks (the Grey Steps' pale blocks up high, no columns)
//   the cold stair    (station 4's tread, over ~4.2 km) the tiergrass sparse on its terracettes, the pagoda bush (grey discs stacked on a stem, a
//                     season's flush each) and the stack cushion (a terraced mound, a step a decade) on the stony pavement, pale cobbles between
// Every pass is the core's cell lattice (BIO.grid's cell form), in three LOD bands along the spine (near 6 m, mid 12 m, far 24 m cells); a cell's own
// stream (reseed) draws its shapes and colours.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=TIERS.PAL,zones=TIERS.zones,{bright,vary}=BIO.col;
const Y=(x,z)=>BIO.terrainH(x,z),Yd=(x,z)=>typeof BIO.drawnH==='function'?BIO.drawnH(x,z,Y):Y(x,z);
const tone=(set,k)=>bright(vary(pick(set),.02,.06,.06),k==null?1:k);
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
function tuft(item,x,z,h,w,col,tilt){const t=tilt==null?.06:tilt;BIO.put(item,[x,Yd(x,z)-.05,z],qEuler(rr(-t,t),rr(0,TAU),rr(-t,t)),[w==null?h*.9:w,h,w==null?h*.9:w],col);}
/* a flat card on the ground, tilted to the ground's own slope (seated: its centre on the ground, lifted 6 mm) */
function flatOn(item,x,z,s,col,lift){const e=1.5,hx=Yd(x+e,z)-Yd(x-e,z),hz=Yd(x,z+e)-Yd(x,z-e),n=[-hx/(2*e),1,-hz/(2*e)];
 BIO.put(item,[x,Yd(x,z)+(lift==null?.006:lift),z],qUp(n),[s,1,s*rr(.85,1.15)],col);}
function stone(x,z,set,big){const y=Y(x,z),r=(big?rr(.5,1.6):rr(.1,.3))*(.7+.6*rng());BIO.put(big?'boulder':'stone',[x,y+r*.1,z],qEuler(rr(0,1),rr(0,TAU),rr(0,1)),[r*rr(.9,1.4),r*.65,r],tone(set,rr(.85,1.1)));return r;}
function column(x,z){const y=Y(x,z),L=rr(1,3),w=rr(.4,.8),a=rr(0,TAU);   /* a fallen basalt column, lying on its side */
 BIO.put('column',[x,y+w*.38,z],new BIO.host.THREE.Quaternion().setFromEuler(new BIO.host.THREE.Euler(Math.PI/2+rr(-.1,.1),a,0,'YXZ')),[w,L,w],tone(PAL.rock,rr(.85,1.05)));}
/* the terracettes' lips: the top fifth of each 0.9 m step of the ground's height, on a slope (a grazed slope's level rows) */
/* the terracettes (44t: TIERS_TERRACETTES, PLAN.md amendment 3) on the grazed slopes, built with the floor; their lip line is where the tiergrass
   stands (the old height rule, a tuft in the top fifth of a 0.9 m step, when the form is not on the page) */
let TC=null;
const LIP=.9,lipK=(x,z,sl)=>{if(TC)return TC.lip(x,z,Y(x,z));const f=Y(x,z)/LIP;return smooth(.1,.3,sl)*smooth(.75,.9,f-Math.floor(f));};
/* where the herds graze, so the terracettes form: open land off the fields, the roads, the water's edge and bare rock, on the lake tread's slopes and
   the cold stair's (the hot floor has its forest) */
const grazed=(x,z)=>{const Z=zones(x,z);return Z.land*Z.live*(1-Z.farm)*(1-Z.road)*(1-Z.rock)*(1-Z.shore)*(1-Z.talus)*Math.max(Z.temperate,Z.stair);};
/* one lip strip on the row through (x, z): moved up the slope to its row's lip, turned along the contour, sunk to the ground under its middle */
function terracette(x,z,st){const y0=Y(x,z),A=TC.at(x,z,y0);if(!A)return;const e=1.5,gx=(Y(x+e,z)-Y(x-e,z))/(2*e),gz=(Y(x,z+e)-Y(x,z-e))/(2*e),s=Math.hypot(gx,gz);if(s<.05)return;
 const ux=gx/s,uz=gz/s,R=TC.record,dd=((1-R.rise*.35)-A.u)*R.step/s,px=x+ux*dd,pz=z+uz*dd,L=rr(1.3,2.3),yaw=Math.atan2(ux,uz);
 BIO.put('tlip',[px,Y(px,pz)-.04,pz],qEuler(0,yaw,0),[L,R.step*1.15,rr(.7,1)],tone(Y(px,pz)>3900?PAL.soilGrey:PAL.soil,rr(.9,1.06)));st.tlip++;
 if(rng()<.7)around(px+ux*.08,pz+uz*.08,ri(1,3),.2,L*.4,(qx,qz)=>tuft('tiergrass',qx,qz,rr(.22,.45),rr(.3,.5),tone(PAL.grass,.98)));}

// ---------------------------------------------------------------- the planters, by zone: (x,z,Z,lv,st)
/* THE TIER SAGE: a clump of three to six upright stems from a felted grey base, each ringed with four to six flower whorls stepping up it, yellow on the
   dry slopes, lilac over ~1.8 km (the canyon's benches); near only (the whorls are small) */
const withOwn=(x,z,fn)=>{const p=BIO.owner;BIO.owner=[x,z];try{return fn();}finally{BIO.owner=p;}};
function tierSage(x,z,st,lv){return withOwn(x,z,()=>{const y=Y(x,z),lilac=y>1800,n=ri(2,4),fc=lilac?PAL.sageLilac:PAL.sageFlower;
 tuft('heath',x,z,rr(.25,.4),rr(.5,.8),tone(PAL.sageLeaf,rr(.95,1.08)),.04);
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=rr(.05,.22),sx=x+Math.cos(a)*d,sz=z+Math.sin(a)*d,H=rr(.45,1),lean=rr(-.08,.08),nw=ri(3,5);
  BIO.put('cane',[sx,y-.02,sz],qEuler(lean,rr(0,TAU),lean*.5),[.012,H,.012],tone(PAL.sageLeaf,.8));
  for(let w=0;w<nw;w++){const u=.35+.6*w/Math.max(1,nw-1),r=rr(.035,.05)*(1.1-.4*u);BIO.put('sagewhorl',[sx+lean*H*u,y+H*u,sz+lean*.5*H*u],null,[r*2,r*1.4,r*2],tone(fc,rr(.92,1.08)));}}
 st.tiersage++;});}
function plantDry(x,z,Z,lv,st){const t=rng(),lip=lipK(x,z,Z.slope);
 if(t<.55+.35*lip){around(x,z,lv===2?ri(3,5):1,.2,.8,(px,pz)=>tuft('tiergrass',px,pz,rr(.3,.6),rr(.35,.55),tone(PAL.grass)));st.tiergrass++;}
 else if(t<.75&&Z.rock>.35){tuft('heath',x,z,rr(.4,.9),rr(.6,1),tone(PAL.heath),.03);st.heath++;}   /* the heath keeps to rocky ground and the ledges (its own pass): not the open slopes */
 else if(t<.82&&lv===2&&Z.rock<.3&&lip<.5&&BIO.lodD(x,z)<160)tierSage(x,z,st,lv);   /* within ~160 m: its whorls are a few centimetres */   /* the tier sage on the open dry slopes, between the terracettes' rows */
 else{stone(x,z,rng()<.7?PAL.rock:PAL.rockRed,false);st.stone++;}}
/* the meadow's tufts: tawny on the dry side, green in the swales (the same slow patch the ground's meadow layer follows, and the wet) */
const greenK=(x,z)=>clamp(Math.max(smooth(.5,.68,BIO.field('wet',x,z)),smooth(.52,.68,fbm(x*.0028,z*.0028,7.1,3))*.85),0,1);
function grassCol(x,z){const g=greenK(x,z);return g>.05&&rng()<g?tone(PAL.grassGreen,1):tone(PAL.grass,1.05);}
function plantGrass(x,z,Z,lv,st){around(x,z,lv===2?ri(3,6):1,.2,.9,(px,pz)=>tuft('tiergrass',px,pz,rr(.3,.65),rr(.4,.7),grassCol(px,pz)));st.tiergrass++;}
/* the cold stair (station 4): a pagoda bush, a stack cushion, a sparse tuft row or a cobble */
function pagoda(x,z,st,lv){return withOwn(x,z,()=>{const y=Y(x,z),H=rr(.5,1.2),n=ri(3,6),R0=rr(.32,.55);BIO.put('pdisc',[x,y,z],null,[.07,H*10,.07],tone(PAL.pagodaStem));   /* the stem (the drum's unit is 0.1 tall) */
 for(let k=0;k<n;k++){const u=(k+1)/n,yy=y+H*(.25+.75*u),r=R0*(1.05-.55*u)*rr(.9,1.1),a=rr(0,TAU),ox=rr(-.04,.04),oz=rr(-.04,.04);
  BIO.put('pdisc',[x+ox,yy-.05,z+oz],qEuler(rr(-.04,.04),a,rr(-.04,.04)),[r*2,.8,r*2],tone(PAL.pagoda,.62));BIO.put('pagoda',[x+ox,yy+.002,z+oz],qEuler(0,a,0),[r*2.1,1,r*2.1],tone(PAL.pagoda));}st.pagoda++;
 if(lv===2)(TIERS.SHRUBS=TIERS.SHRUBS||[]).push({key:'pagodabush',x,z,discs:n});});}   /* the near ones, for the tiers rule (99) */
function cushion(x,z,st){const y=Y(x,z),s=rr(.4,1.6);BIO.put('cushion',[x,y-.04,z],qEuler(0,rr(0,TAU),0),[s,s*rr(.45,.85),s*rr(.8,1.2)],tone(PAL.cushion,rr(.9,1.1)));st.cushion++;}
function plantStair(x,z,Z,lv,st){const t=rng(),pv=BIO.field('pave',x,z),lip=lipK(x,z,Z.slope);
 if(t<.42*(1-pv*.6)+.3*lip){around(x,z,lv===2?ri(1,3):1,.2,.7,(px,pz)=>tuft('tiergrass',px,pz,rr(.2,.42),rr(.3,.45),tone(PAL.grass,.95)));st.tiergrass++;}
 else if(t<.6)pagoda(x,z,st,lv);else if(t<.74)cushion(x,z,st);else{stone(x,z,PAL.rockGrey,false);st.stone++;}}
function plantShore(x,z,Z,lv,st){around(x,z,lv===2?ri(2,5):2,.3,1.2,(px,pz)=>tuft('reed',px,pz,rr(.8,1.6),rr(.6,1),tone(PAL.reedTuft)));st.reed++;}
const dir3=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
function qFan(d){const up=[0,1,0],dd=Math.hypot(...d)||1,Yv=[d[0]/dd,d[1]/dd,d[2]/dd],k=up[0]*Yv[0]+up[1]*Yv[1]+up[2]*Yv[2];
 let Zv=[up[0]-k*Yv[0],up[1]-k*Yv[1],up[2]-k*Yv[2]];const zl=Math.hypot(...Zv);Zv=zl>1e-6?Zv.map(v=>v/zl):[1,0,0];
 const Xv=[Yv[1]*Zv[2]-Yv[2]*Zv[1],Yv[2]*Zv[0]-Yv[0]*Zv[2],Yv[0]*Zv[1]-Yv[1]*Zv[0]],q=BIO._quatOf(Xv,Yv,Zv);return new BIO.host.THREE.Quaternion(q[0],q[1],q[2],q[3]);}
/* THE COLLARED CENTURY-ROSETTE: 3-4 nested spiny blade collars stepping up from the base, and on flowering adults a mast with horizontal panicle bars */
function collaredAgave(x,z,st,lv){return withOwn(x,z,()=>{const y=Y(x,z),nc=lv===2?ri(3,4):2,R0=rr(.45,.85),lc=tone(PAL.agaveLeaf,1);
 for(let c=0;c<nc;c++){const u=c/Math.max(1,nc-1),m=lv===2?ri(6,9):5,a0=rr(0,TAU),el=lerp(.26,.98,u),L=R0*(1-.26*u);
  for(let k=0;k<m;k++){const a=a0+k/m*TAU+rr(-.12,.12);BIO.put('agaveblade',[x,y-.03+.07*c,z],qFan(dir3(a,el)),[L*.48,L*rr(.9,1.12),L*.48],bright(lc,rr(.92,1.08)));}}
 if(lv===2&&rng()<.38){const H=rr(1.7,3.1),nb=ri(4,6),sc=tone(PAL.reedCane,.88),fc=tone(PAL.cactusBloom,1.04);
  BIO.beam('cane',[x,y-.04,z],[x,y+H,z],.042,.018,sc);
  for(let b=0;b<nb;b++){const u=.44+.52*b/Math.max(1,nb-1),yy=y+H*u,arm=rr(.22,.46)*(1-.45*(b/nb)),a=b*2.39996+rr(-.2,.2),ex=x+Math.cos(a)*arm,ez=z+Math.sin(a)*arm;
   BIO.beam('cane',[x,yy,z],[ex,yy+.05,ez],.018,.01,sc);BIO.put('cbloom',[ex,yy+.08,ez],null,[.11,.06,.11],fc);}
  (TIERS.SHRUBS=TIERS.SHRUBS||[]).push({key:'collaredagave',x,z,discs:nb});}
 st.collaredagave++;});}
/* THE WHEEL-UMBEL: feathery basal tuft + stout hollow stalk ringed at 3-5 stepped nodes by flat wheel-spoked golden umbel plates */
function whorlFerula(x,z,st,lv){return withOwn(x,z,()=>{const y=Y(x,z),H=rr(.95,1.75),nw=lv===2?ri(3,5):3,lx=rr(-.06,.06),lz=rr(-.06,.06);
 tuft('umbelleaf',x,z,rr(.32,.52),rr(.55,.85),tone(PAL.umbelGreen,rr(.94,1.06)),.05);
 BIO.beam('cane',[x,y-.04,z],[x+lx,y+H,z+lz],.024,.012,tone(PAL.reedCane,.92));
 for(let w=0;w<nw;w++){const u=.4+.58*w/Math.max(1,nw-1),rw=rr(.28,.52)*(1-.36*(w/Math.max(1,nw-1)));
  BIO.put('umbelplate',[x+lx*u,y+H*u,z+lz*u],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[rw*2,1,rw*2],tone(PAL.umbelGold,rr(.95,1.08)));}
 st.whorlferula++;});}
/* THE TERRACE SUMAC: 3-5 flat horizontal tables of pinnate leaves on forked woody stems, topped by crimson berry cones */
function terraceSumac(x,z,st,lv){return withOwn(x,z,()=>{const y=Y(x,z),H=rr(1.05,1.8),nt=ri(3,5),R0=rr(.55,.95),sc=tone(PAL.pagodaStem,.95),lc=tone(PAL.sumacLeaf,1);
 BIO.beam('cane',[x,y-.05,z],[x,y+H*.92,z],.036,.016,sc);
 for(let t=0;t<nt;t++){const u=(t+1)/nt,yy=y+H*(.28+.68*u),rt=R0*(1.08-.38*u)*rr(.88,1.1),a=t*2.39996+rr(-.3,.3),ox=Math.cos(a)*rt*.28,oz=Math.sin(a)*rt*.28;
  BIO.beam('cane',[x,yy-.16,z],[x+ox,yy,z+oz],.02,.012,sc);
  BIO.put('sumacplate',[x+ox,yy+.01,z+oz],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[rt*1.9,1,rt*1.9],bright(lc,rr(.9,1.08)));
  if(lv===2&&rng()<.65)BIO.put('cbloom',[x+ox,yy+.09,z+oz],null,[.055,.13,.055],tone(PAL.sumacCone,rr(.92,1.08)));}
 if(lv===2)(TIERS.SHRUBS=TIERS.SHRUBS||[]).push({key:'terracesumac',x,z,discs:nt});
 st.terracesumac++;});}
/* THE SPRAY-STEP FERN: 3 stacked shuttlecock frond rings on a short fibrous caudex (russet skirt below, two fresh green whorls above) */
function mistStepFern(x,z,st,lv){return withOwn(x,z,()=>{const y=Y(x,z),ch=rr(.16,.38),R0=rr(.42,.85);
 BIO.beam('cane',[x,y-.04,z],[x,y+ch,z],.055,.042,tone(PAL.pagodaStem,.78));
 for(let r=0;r<3;r++){const m=lv===2?ri(6,9):5,a0=rr(0,TAU),el=[.14,.46,.8][r],L=R0*[.88,1.0,.76][r],col=r===0?C_RUSSET():tone(PAL.fernGreen,rr(.92,1.08));
  for(let k=0;k<m;k++){const a=a0+k/m*TAU+rr(-.14,.14);BIO.put('stepfern',[x,y+ch*(.35+.32*r),z],qFan(dir3(a,el)),[L*.55,L*rr(.9,1.1),L*.55],col);}}
 st.miststepfern++;});}
const C_RUSSET=()=>tone([0x6e5234,0x7c5c3a],.95);
/* THE RIMSTONE BUTTERWORT: 3 stacked lime-rimmed sticky chartreuse rosette cups on wet tufa seeps */
function tufaRosette(x,z,st){return withOwn(x,z,()=>{const y=Y(x,z),s0=rr(.18,.34),c=tone(PAL.tufaCup,1);
 for(let k=0;k<3;k++)flatOn('rosettecup',x,z,s0*(1-.23*k),bright(c,1+.06*k),.008+.022*k);
 if(rng()<.55){const H=rr(.14,.26);BIO.beam('cane',[x,y,z],[x,y+H,z],.006,.004,tone(PAL.reedLeaf,.9));BIO.put('lilybloom',[x,y+H+.015,z],null,[.03,.022,.03],tone(PAL.sageLilac,1.1));}
 st.tufarosette++;});}
/* THE BEDDING-LINE HOUSELEEK: mother rosette + concentric stepped daughter rings hugging rock cracks */
function beddingHouseleek(x,z,st){return withOwn(x,z,()=>{const e=1.0,hx=Yd(x+e,z)-Yd(x-e,z),hz=Yd(x,z+e)-Yd(x,z-e),n=[-hx/(2*e),1,-hz/(2*e)],q=qUp(n),s0=rr(.18,.3),c=tone(PAL.houseleek,1);
 BIO.put('houseleek',[x,Yd(x,z)+.012,z],q,[s0,1,s0],c);
 for(let r=1;r<=2;r++){const m=r===1?4:6,rad=s0*(.55+.42*r),sr=s0*(r===1?.56:.36),a0=rr(0,TAU);
  for(let k=0;k<m;k++){const a=a0+k/m*TAU,px=x+Math.cos(a)*rad,pz=z+Math.sin(a)*rad;if(BIO.mask(px,pz)<=0)continue;
   BIO.put('houseleek',[px,Yd(px,pz)+.01+.008*(2-r),pz],q,[sr,1,sr],bright(c,rr(.88,1.08)));}}
 st.beddinghouseleek++;});}
/* THE RISER TIER-IRIS: equitant sword fan + straight scape bearing 3 stepped whorls of violet-and-gold blooms */
function saffronIris(x,z,st,lv){return withOwn(x,z,()=>{const y=Y(x,z),H=rr(.42,.74),nS=lv===2?ri(1,3):1;
 tuft('irisblade',x,z,rr(.3,.52),rr(.32,.5),tone(PAL.irisLeaf,rr(.94,1.06)),.04);
 for(let s=0;s<nS;s++){const ox=s?rr(-.14,.14):0,oz=s?rr(-.14,.14):0,sh=H*rr(.85,1.08);
  BIO.beam('cane',[x+ox,y-.03,z+oz],[x+ox,y+sh,z+oz],.01,.006,tone(PAL.irisLeaf,.85));
  for(let w=0;w<3;w++){const yy=y+sh*(.48+.24*w),ws=rr(.12,.2)*(1-.14*w);tuft_at('irisbloom',x+ox,yy-.04,z+oz,ws,ws*1.15,tone(PAL.irisBloom,rr(.95,1.1)));}}
 st.saffroniris++;});}
function tuft_at(item,x,y,z,h,w,col){BIO.put(item,[x,y,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[w,h,w],col);}
/* THE SPINY TIER-MILKVETCH: 3-4 flat thorny tables on the Great Tread and dry shoulders */
function stepAstragalus(x,z,st,lv){return withOwn(x,z,()=>{const y=Y(x,z),H=rr(.32,.68),nt=ri(3,4),R0=rr(.28,.52);
 BIO.put('pdisc',[x,y,z],null,[.055,H*10,.055],tone(PAL.pagodaStem,.9));
 for(let t=0;t<nt;t++){const u=(t+1)/nt,yy=y+H*(.22+.74*u),rt=R0*(1.08-.4*u)*rr(.9,1.1),a=rr(0,TAU);
  BIO.put('pdisc',[x,yy-.035,z],qEuler(rr(-.03,.03),a,rr(-.03,.03)),[rt*1.9,.55,rt*1.9],tone(PAL.astragalus,.72));
  tuft_at('whorlheath',x,yy-.02,z,rt*.45,rt*1.85,tone(PAL.astragalus,rr(.94,1.08)));
  if(lv===2&&rng()<.5)BIO.put('sagewhorl',[x,yy+.02,z],null,[rt*.9,rt*.28,rt*.9],tone(PAL.lilyBloom,1.02));}
 if(lv===2)(TIERS.SHRUBS=TIERS.SHRUBS||[]).push({key:'stepastragalus',x,z,discs:nt});
 st.stepastragalus++;});}
/* THE PAGODA BRACT-RHUBARB: basal leaf ring + conical tower of 5-8 overlapping translucent cream-and-rose thermal bracts */
function pagodaRhubarb(x,z,st,lv){return withOwn(x,z,()=>{const y=Y(x,z),H=rr(.72,1.45),nb=lv===2?ri(5,8):4,R0=rr(.36,.62);
 for(let k=0,m=lv===2?6:4;k<m;k++){const a=k/m*TAU+rr(-.15,.15);BIO.put('rheumleaf',[x,y+.01,z],qFan(dir3(a,.22)),[R0*.85,R0*1.1,R0*.85],tone(PAL.rheumLeaf,rr(.9,1.08)));}
 BIO.beam('cane',[x,y-.04,z],[x,y+H*.94,z],.038,.014,tone([0x8c3a32,0x9e443a],1));
 for(let b=0;b<nb;b++){const u=b/Math.max(1,nb-1),yy=y+H*(.16+.8*u),rb=R0*(.92-.68*u);
  BIO.put('rheumbract',[x,yy,z],qEuler(rr(-.06,.06),b*2.39996,rr(-.06,.06)),[rb*2,1,rb*2],tone(PAL.rheumBract,rr(.95,1.06)));}
 if(lv===2)(TIERS.SHRUBS=TIERS.SHRUBS||[]).push({key:'pagodarhubarb',x,z,discs:nb});
 st.pagodarhubarb++;});}
/* THE TERRACETTE WHORL-BISTORT: neat basal rosette + jointed red stems ringed by 3-5 spaced rose-pink flower cuffs */
function treadBistort(x,z,st,lv){return withOwn(x,z,()=>{const y=Y(x,z),n=lv===2?ri(2,4):2;
 tuft('whorlheath',x,z,rr(.14,.24),rr(.24,.38),tone(PAL.fernGreen,.92),.03);
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=rr(.03,.14),sx=x+Math.cos(a)*d,sz=z+Math.sin(a)*d,H=rr(.24,.48),nw=ri(3,5);
  BIO.beam('cane',[sx,y-.02,sz],[sx,y+H,sz],.008,.005,tone([0x843834,0x74302c],1));
  for(let w=0;w<nw;w++){const u=.38+.58*w/Math.max(1,nw-1),r=rr(.024,.038)*(1.08-.3*u);BIO.put('sagewhorl',[sx,y+H*u,sz],null,[r*2,r*1.5,r*2],tone(PAL.bistortPink,rr(.94,1.08)));}}
 st.treadbistort++;});}

// ---------------------------------------------------------------- the pass
TIERS.buildFloor=function(R,q){q=q==null?1:q;R=R||2500;TIERS.SHRUBS=[];
 const st={tiergrass:0,heath:0,reed:0,pad:0,lilybloom:0,moss:0,lichen:0,stone:0,boulder:0,column:0,pagoda:0,cushion:0,tlip:0,tiersage:0,
  collaredagave:0,whorlferula:0,terracesumac:0,miststepfern:0,tufarosette:0,beddinghouseleek:0,saffroniris:0,stepastragalus:0,pagodarhubarb:0,treadbistort:0};
 TC=typeof TIERS_TERRACETTES==='function'?TIERS_TERRACETTES({h:Y,zone:grazed,seed:64301}):null;TIERS.TERRACETTES=TC;
 const L=BIO.LOD(),bands=[[6,L.floor[0],0,'near'],[12,L.floor[1],L.floor[0],'mid'],[24,1e9,L.floor[1],'far']],box=[-R,-R,R,R];
 bands.forEach((b,bi)=>{const lv=2-bi,band=(x,z)=>{const ld=BIO.lodD(x,z);return ld<b[1]&&ld>=b[2];};
  // the dry slopes, the tread and the wood's floor: tiergrass in its rows (the terracettes' lips), heath on the rocky ground, cobbles
  BIO.grid('floor-dry-'+b[3],b[0],(x,z)=>{if(!band(x,z))return 0;const Z=zones(x,z);if(Z.land<=0)return 0;
    const lip=lipK(x,z,Z.slope),d=Z.dry*(.4+.5*lip)+Z.wood*.3+Z.temperate*Z.land*Z.live*.38*(1-Z.farm)*(1-Z.shore*.6)*(1-Z.rock);   /* the lake tread's grass: the tawny Csa meadow between the woods */return q*(lv===0?.5:1)*clamp(d,0,1);},
   (x,y,z)=>{const Z=zones(x,z);if(Z.dry>.2)plantDry(x,z,Z,lv,st);else plantGrass(x,z,Z,lv,st);},{box,patch:.6,patchScale:.012,pad:.5});
  // the cold stair's tread (station 4): sparse, the pavement's stones between
  BIO.grid('floor-stair-'+b[3],b[0]*1.6,(x,z)=>{if(!band(x,z))return 0;const Z=zones(x,z);if(Z.stair<=0)return 0;return q*(lv===0?.5:1)*clamp(Z.stair*(1-Z.rock)*(1-Z.talus*.7)*.62,0,1);},
   (x,y,z)=>plantStair(x,z,zones(x,z),lv,st),{box,patch:.55,patchScale:.01,pad:.6});
  // THE TERRACETTES: lip strips along the rows on the grazed slopes, near only (each a row's piece; the ground's mesh is far coarser than a step)
  /* within ~140 m (a lip strip is a hand's height: past that the tiergrass's rows carry the lines) */
  if(TC&&lv===2)BIO.grid('floor-terracettes',1.8,(x,z)=>{if(BIO.lodD(x,z)>140)return 0;return q*clamp(TC.k(x,z)*.38,0,1);},(x,y,z)=>terracette(x,z,st),{box,patch:.3,patchScale:.03,pad:.3});
  // the shore's reed band (the wet edge of the land)
  BIO.grid('floor-shore-'+b[3],b[0],(x,z)=>{if(!band(x,z))return 0;const Z=zones(x,z);return q*clamp(Z.temperate*Z.land*smooth(10,1,Z.shoreD)*(1-Z.farm)*(1-Z.road)*.8,0,1);},
   (x,y,z)=>plantShore(x,z,zones(x,z),lv,st),{box,patch:.5,patchScale:.02,pad:.4});});
 // THE LEDGE HEATH: rows along the riser's ledges (each candidate on the ledge's bench), the riser's level lines of green; on the faces the band
 // lichen's crusts in the beds (the cliff gate off: these grow on faces, BIO.def(..., {cliff:true}))
 BIO.grid('floor-ledge',2.5,(x,z)=>{if(BIO.lodD(x,z)>L.floor[1])return 0;const Z=zones(x,z);return q*clamp(Z.ledge*.85,0,1);},
  (x,y,z)=>{tuft('heath',x,z,rr(.5,1.2),rr(.7,1.2),tone(PAL.heath,rr(.95,1.1)),.03);st.heath++;if(rng()<.25){BIO.put('cbloom',[x,Yd(x,z)+rr(.5,.9),z],null,[.05,.04,.05],tone(PAL.heathBloom));}},
  {box,patch:.25,patchScale:.03,pad:.3,cliff:true});
 BIO.grid('floor-face',4,(x,z)=>{if(BIO.lodD(x,z)>L.floor[0])return 0;const Z=zones(x,z);return q*clamp(Z.face*.5,0,1);},
  (x,y,z)=>{const e=1.2,hx=Yd(x+e,z)-Yd(x-e,z),hz=Yd(x,z+e)-Yd(x,z-e),n=[-hx/(2*e),1,-hz/(2*e)];BIO.put('lichen',[x,Yd(x,z)+.02,z],qUp(n),[rr(.6,1.4),1,rr(.4,.9)],tone(PAL.lichen,1.05));st.lichen++;},
  {box,patch:.3,patchScale:.04,pad:.2,cliff:true});
 // THE STAIR LILIES: colonies in the bays, each a few rows of pads stepping out from the shore (the water's height plus a step for each row back
 // toward the land: the oldest, nearest the shore, highest), a flower or two; on the water, so the mask is off (the pass reads the depth)
 const wH=BIO.host.waterH;
 BIO.grid('floor-lilies',22,(x,z)=>{if(BIO.lodD(x,z)>L.floor[1])return 0;const Z=zones(x,z);return q*clamp(Z.bay*.55,0,1);},
  (x,y,z)=>{const w=wH(x,z);if(!(w>-1e8))return;const e=3,gx=Y(x+e,z)-Y(x-e,z),gz=Y(x,z+e)-Y(x,z-e),gl=Math.hypot(gx,gz)||1,ux=gx/gl,uz=gz/gl;   /* up the bed: toward the shore */
   const rows=ri(3,6),per=ri(3,6);for(let r=0;r<rows;r++)for(let k=0;k<per;k++){const px=x+ux*r*1.1+(-uz)*(k-per/2)*1.2+rr(-.3,.3),pz=z+uz*r*1.1+ux*(k-per/2)*1.2+rr(-.3,.3);
     const d=w-Y(px,pz);if(d<.15||d>3)continue;const s=rr(.8,1.6)*(1+.12*r);BIO.put('pad',[px,w+.015+.035*r,pz],qEuler(0,rr(0,TAU),0),[s,1,s],tone(PAL.pad,rr(.9,1.1)));st.pad++;
     if(rng()<.06){BIO.put('lilybloom',[px+rr(-.2,.2),w+.12+.035*r,pz+rr(-.2,.2)],null,[.14,.1,.14],tone(PAL.lilyBloom));st.lilybloom++;}}},
  {box,patch:.4,patchScale:.02,pad:2,noMask:true});
 // THE STEP MOSS: mats along the seep's wet line and on its pools' dams (the seep field: 44w's line), the tufa round them in the ground's layer
 BIO.grid('floor-moss',1.6,(x,z)=>{if(BIO.lodD(x,z)>L.floor[1])return 0;return q*clamp(BIO.field('seep',x,z)*.7,0,1);},
  (x,y,z)=>{flatOn('moss',x,z,rr(.4,1.1),tone(PAL.moss,rr(.95,1.1)),.01);st.moss++;},{box,patch:.2,patchScale:.05,pad:.2,noMask:true});
 // THE TALUS: basalt boulders and fallen columns under the Black Step and round the stacks, band lichen on a share of them
 BIO.grid('talus',10,(x,z)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z);return q*clamp(Z.talus*.7+Z.rock*.08*smooth(.15,.5,Z.slope),0,1)*Z.land*(1-Z.road);},
  (x,y,z)=>{const grey=Y(x,z)>3900;if(rng()<.25&&!grey){column(x,z);st.column++;return;}   /* columns are the basalt's: the Grey Steps break in blocks */
   const r=stone(x,z,grey?PAL.rockGrey:rng()<.8?PAL.rock:PAL.rockRed,true),gy=Y(x,z);st.boulder++;
   if(rng()<.5)for(let k=0,m=ri(1,3);k<m;k++){const a=rr(0,TAU),n=[Math.cos(a)*.5,1,Math.sin(a)*.5];
    BIO.put('lichen',[x+Math.cos(a)*r*.3,gy+r*.5,z+Math.sin(a)*r*.3],qUp(n),[r*rr(.5,.9),1,r*rr(.5,.9)],tone(PAL.lichen,1.1));st.lichen++;}},
  {box,patch:.5,patchScale:.015,pad:1.2});
 // THE STAIRCASE BOTANY PASS (2026-11-28): ten tiered shrubs, succulents, ferns and herbs across the four steps, each short-circuiting cheap fields first
 const lvAt=(x,z)=>BIO.lodD(x,z)<L.floor[0]?2:1,inMid=(x,z)=>BIO.lodD(x,z)<=L.floor[1];
 BIO.grid('floor-agave',38,(x,z)=>{if(!inMid(x,z)||BIO.field('cold',x,z)>.32)return 0;const Z=zones(x,z);return q*clamp(Z.temperate*Z.land*Z.live*(1-Z.farm)*(Z.dry*.38+Z.ledge*.48),0,1);},
  (x,y,z)=>collaredAgave(x,z,st,lvAt(x,z)),{box,patch:.52,patchScale:.014,pad:.8});
 BIO.grid('floor-ferula',38,(x,z)=>{if(!inMid(x,z)||BIO.field('cold',x,z)>.32)return 0;const Z=zones(x,z);return q*clamp(Z.temperate*Z.land*Z.live*(1-Z.farm)*(1-Z.rock*.7)*(Z.gentle*.36+Z.dry*.22),0,1);},
  (x,y,z)=>whorlFerula(x,z,st,lvAt(x,z)),{box,patch:.55,patchScale:.015,pad:.6});
 BIO.grid('floor-sumac',32,(x,z)=>{if(!inMid(x,z)||BIO.field('cold',x,z)>.32)return 0;if(BIO.field('talus',x,z)<=.04&&BIO.field('slope',x,z)<=.15)return 0;
   const Z=zones(x,z);return q*clamp(Z.temperate*Z.land*Z.live*(1-Z.farm)*(Z.talus*.56+Z.dry*.22*smooth(.14,.38,Z.slope)),0,1);},
  (x,y,z)=>terraceSumac(x,z,st,lvAt(x,z)),{box,patch:.5,patchScale:.014,pad:.9});
 BIO.grid('floor-stepfern',20,(x,z)=>{if(!inMid(x,z))return 0;const sp=BIO.field('seep',x,z),wt=BIO.field('wet',x,z);if(sp<=.04&&wt<=.56)return 0;
   const Z=zones(x,z);return q*clamp((sp*.68+smooth(.56,.82,wt)*Z.land*Z.live*.46)*(1-Z.high)*(1-Z.farm),0,1);},
  (x,y,z)=>mistStepFern(x,z,st,lvAt(x,z)),{box,patch:.42,patchScale:.02,pad:.5});
 BIO.grid('floor-tufarosette',9,(x,z)=>{const sp=BIO.field('seep',x,z);if(sp<=.05||BIO.lodD(x,z)>L.floor[0])return 0;const Z=zones(x,z);return q*clamp(sp*.68*(1-Z.high)*Z.land,0,1);},
  (x,y,z)=>tufaRosette(x,z,st),{box,patch:.32,patchScale:.04,pad:.3});
 BIO.grid('floor-houseleek',24,(x,z)=>{if(BIO.lodD(x,z)>L.floor[0])return 0;if(BIO.field('ledge',x,z)<=.05&&BIO.field('rock',x,z)<=.32)return 0;
   if(BIO.field('barren',x,z)>.6)return 0;const Z=zones(x,z);return q*clamp(Z.land*(Z.ledge*.58+Z.face*.3+Z.rock*.2),0,1);},
  (x,y,z)=>beddingHouseleek(x,z,st),{box,patch:.38,patchScale:.03,pad:.3,cliff:true});
 BIO.grid('floor-iris',34,(x,z)=>{if(BIO.lodD(x,z)>L.floor[0]||BIO.field('cold',x,z)>.32)return 0;const Z=zones(x,z);return q*clamp(Z.temperate*Z.land*Z.live*(1-Z.farm)*(Z.gentle*.28+Z.ledge*.34+Z.dry*.22),0,1);},
  (x,y,z)=>saffronIris(x,z,st,lvAt(x,z)),{box,patch:.5,patchScale:.018,pad:.4});
 BIO.grid('floor-astragalus',56,(x,z)=>{if(!inMid(x,z))return 0;if(BIO.field('cold',x,z)<=.04&&BIO.field('tread',x,z)<=.05)return 0;
   const Z=zones(x,z);return q*clamp((Z.stair*.56+Z.cool*Z.dry*.4+Z.temperate*Z.tread*.28)*Z.land*Z.live*(1-Z.farm)*(1-Z.cliff),0,1);},
  (x,y,z)=>stepAstragalus(x,z,st,lvAt(x,z)),{box,patch:.52,patchScale:.014,pad:.6});
 BIO.grid('floor-rhubarb',54,(x,z)=>{if(!inMid(x,z)||BIO.field('cold',x,z)<=.04)return 0;const Z=zones(x,z);return q*clamp((Z.stair*(Z.talus*.52+(1-Z.rock)*.34)+Z.cool*Z.ledge*.3)*Z.land*Z.live*(1-Z.cliff),0,1);},
  (x,y,z)=>pagodaRhubarb(x,z,st,lvAt(x,z)),{box,patch:.55,patchScale:.012,pad:.7});
 BIO.grid('floor-bistort',44,(x,z)=>{if(BIO.lodD(x,z)>L.floor[0]||BIO.field('cold',x,z)<=.04)return 0;const Z=zones(x,z);return q*clamp((Z.stair*(.44+.35*smooth(.09,.14,Z.wet))+Z.cool*.32)*Z.land*Z.live*(1-Z.rock*.7),0,1);},
  (x,y,z)=>treadBistort(x,z,st,lvAt(x,z)),{box,patch:.48,patchScale:.018,pad:.4});
 return{under:st};};
})();
