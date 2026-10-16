// prefix: nr
// ================================================================= ANCIENT APARTMENTS: the Ribbon terrace and the Drum tower (barracks now)
// Two Ancient mid-rise apartment types in the arcology's streamlined manner (the reference's white towers with their
// horizontal bands): white ribbon balconies wrapping every floor, glass behind. Both are barracks for Ruephus's crews
// now (the interiors kit plans their rooms: kits/interiors/sets/noahs-regret.js). Minor damage: a few glass bays broken
// and boarded or sheeted by the pirates, a gap in a ribbon. Frame: origin at the plot centre on the deck, +z the front.
// ---------------------------------------------------------------- the RIBBON TERRACE: a glazed block between bookend towers
const NR_RIB={L:24,D:12.4,NS:6,PL:.3,E:1.5};
function nrAptRibbon(o){const C=NR_RIB,inst=nrPlanOf('nr-anc-apt-ribbon'),SH=NR_STOREY,H=C.PL+C.NS*SH,R=C.D/2,top=H;
 nrBuilt(o,'nr-anc-apt-ribbon','nr-anc-apt-ribbon',C.L+2*R+2*C.E,C.D+2*C.E);
 const stad=e=>nrStadium(C.L,C.D,e,14);
 nrOutlineSlab('white',stad(C.E+.2),C.PL,C.PL,P('white'));                                 // the plinth
 nrDrawPlan(inst,{floor:['conc',hc(0xb8b2a6)],part:['plaster',hc(0xe8e2d6)]});
 /* the ground floor's tiles inside, the balconies' slabs outside the glass (the plan's floors are the glass rectangle) */
 const glassRect=[[-C.L/2,-R],[C.L/2,-R],[C.L/2,R],[-C.L/2,R]];
 nrPlanSlab('deck',glassRect,null,C.PL+.02,.02,hc(0xc8beb0));
 for(let k=1;k<=C.NS;k++){const y=C.PL+k*SH;
  if(k<C.NS){nrPlanSlab('conc',stad(C.E),[glassRect],y,.25,P('conc'));
   /* the ribbon: a white parapet from the slab's underside to a metre above it; one or two bays lost on some floors */
   nrRibbon('white',stad(C.E),y-.4,y+1.0,P('white'),.16);}
  else{nrPlanSlab('conc',stad(.25),null,y,.3,P('conc'));nrRibbon('glyph',stad(.25),y,y+1.1,WHITE,.2);}}
 /* the glazing on both long sides, storey by storey: bays of 1.5 m, white mullions; doors on the ground floor */
 for(let k=0;k<C.NS;k++){const y=C.PL+k*SH,h=SH-.25;
  for(const z of [R,-R]){const nb=16,bw=C.L/nb;
   for(let i=0;i<nb;i++){const x=-C.L/2+(i+.5)*bw;
    if(k===0&&((z>0&&Math.abs(x)<1.2)||(z<0&&Math.abs(x+7)<.9)))continue;   /* the street doors (planned at x 0 front, x -7 back) */
    if(nrDamaged(0,.04))nrBoard(x,y,z+(z>0?.04:-.04),bw,h,0,rng()<.4);
    else box('glass',x,y,z,bw,h,.05,hc(0x6a8a98));
    box('white',-C.L/2+i*bw,y,z,.08,h,.14,P('white'));}
   box('white',0,y+h-.12,z,C.L,.12,.18,P('white'));}}
 /* the bookend towers: white half-drums on the short ends, three slit windows, a cap */
 for(const sx of [1,-1]){const cx=sx*C.L/2;
  lathe('white',cx,0,[[R,0],[R,top]],24,P('white'),{a0:sx>0?-PI/2:PI/2,a1:sx>0?PI/2:3*PI/2});
  for(const a of [-.6,0,.6]){const aa=(sx>0?0:PI)+a,x=cx+Math.cos(aa)*(R+.02),z=Math.sin(aa)*(R+.02);
   for(let k=0;k<C.NS;k++)box('glass',x,C.PL+k*SH+.4,z,.55,SH-.8,.05,hc(0x2a3a40),nrRyTan(aa));}
  const cap=[];for(let i=0;i<=12;i++){const a=(sx>0?-PI/2:PI/2)+i/12*PI;cap.push([cx+Math.cos(a)*R,Math.sin(a)*R]);}
  nrPlanSlab('white',cap,null,top+.6,.6,P('white'));}
 /* the roof: a garden gone to meadow in two raised beds, a pergola (half its slats gone), the water tank */
 for(const sx of [-1,1]){nrPlanSlab('turf',[[sx*1,-R+1],[sx*(C.L/2-1),-R+1],[sx*(C.L/2-1),R-1],[sx*1,R-1]],null,top+.45,.15,P('turf'));
  nrRibbon('white',[[sx*.8,-R+.8],[sx*(C.L/2-.8),-R+.8],[sx*(C.L/2-.8),R-.8],[sx*.8,R-.8]],top,top+.5,P('white'),.15);}
 for(let x=-8;x<=8;x+=4)for(const z of [-2,2])box('white',x,top,z,.2,2.6,.2,P('white'));
 for(let x=-9;x<=9;x+=.9)if(rng()<.55)box('white',x,top+2.6,0,.12,.12,5,P('white'));
 cyl('white',C.L/2,top+.6,0,2.6,2.4,P('white'),20);sph('white',C.L/2,top+3,0,2.6,P('white'),.35,20);}
defBuilding({key:'nr-anc-apt-ribbon',name:'Ribbon terrace (Ancient apartments)',seed:5100,cls:'building',kind:'apartments',
 tags:{types:['dwelling-multi'],wealth:'poor',style:'Ancient streamline: ribbon balconies, bookend towers'},
 w:NR_RIB.L+NR_RIB.D+2*NR_RIB.E+.5,d:NR_RIB.D+2*NR_RIB.E+.5,h:NR_RIB.PL+NR_RIB.NS*NR_STOREY+3.5,budget:300000,
 front:{x:0,z:NR_RIB.D/2,yaw:0},note:'six storeys of Ancient apartments, now barracks: the interiors kit plans them (set noahs-regret)',
 build(o){nrAptRibbon(o);}});
// ---------------------------------------------------------------- the DRUM TOWER: a glass drum in wavering ribbons
const NR_DRUM={R:8.65,NS:8,PL:.3};
function nrAptDrum(o){const C=NR_DRUM,inst=nrPlanOf('nr-anc-apt-drum'),SH=NR_STOREY,top=C.PL+C.NS*SH;
 const oct=inst.buildings[0].levels[0].outer||KratorInteriors.sets.shape.circle(8.6,8);
 nrBuilt(o,'nr-anc-apt-drum','nr-anc-apt-drum',21,21);
 const circ=(r,cx,cz,n)=>{const out=[];n=n||40;for(let i=0;i<n;i++){const a=i/n*TAU;out.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}return out;};
 nrPlanSlab('white',circ(10.8,0,0),null,C.PL,C.PL,P('white'));
 nrPlanSlab('deck',oct,null,C.PL+.02,.02,hc(0xc8beb0));
 nrDrawPlan(inst,{floor:['conc',hc(0xb8b2a6)],part:['plaster',hc(0xe8e2d6)]});
 for(let k=0;k<C.NS;k++){const y=C.PL+k*SH,h=SH-.25;
  /* the glass drum, a door gap on the ground floor (+z: a = PI/2 in the lathe's x = cos a, z = sin a) */
  if(k===0){lathe('glass',0,0,[[C.R,y],[C.R,y+h]],36,hc(0x6a8a98),{a0:PI/2+.1,a1:PI/2+TAU-.1});}
  else{const bad=[];for(let i=0;i<24;i++)if(nrDamaged(0,.035))bad.push(i);
   for(let i=0;i<24;i++){const a0=i/24*TAU,a1=(i+1)/24*TAU;if(bad.indexOf(i)>=0){const am=(a0+a1)/2;nrBoard(Math.cos(am)*(C.R+.05),y,Math.sin(am)*(C.R+.05),TAU*C.R/24,h,nrRyTan(am),rng()<.5);continue;}
    lathe('glass',0,0,[[C.R,y],[C.R,y+h]],2,hc(0x6a8a98),{a0,a1});}}
  for(let i=0;i<24;i++){const a=i/24*TAU;box('white',Math.cos(a)*C.R,y,Math.sin(a)*C.R,.1,h,.16,P('white'),nrRyTan(a));}
  /* the ribbon above this storey: a wavering ring, its centre drifting a little floor by floor (the drum's twist) */
  const yk=y+SH,rr_=10.1+.45*Math.sin(k*1.1),cx=Math.cos(k*.8)*.45,cz=Math.sin(k*.8)*.45,ring=circ(rr_,cx,cz,48);
  if(k<C.NS-1){nrPlanSlab('conc',ring,[oct],yk,.25,P('conc'));nrRibbon('white',ring,yk-.4,yk+1.0,P('white'),.16);}}
 /* the crown: the roof slab, a glyph-banded parapet, a ring of fins, a mast with a dead dish */
 nrPlanSlab('conc',circ(C.R+.4,0,0),null,top,.3,P('conc'));nrRibbon('glyph',circ(C.R+.4,0,0,48),top,top+1.2,WHITE,.2);
 for(let i=0;i<16;i++){const a=i/16*TAU;box('white',Math.cos(a)*(C.R-.6),top,Math.sin(a)*(C.R-.6),.25,3.4,1.4,P('white'),nrRyTan(a));}
 cyl('white',0,top,0,.35,9,P('white'),10,.12);sph('white',0,top+6.5,0,1.1,P('white'),.3,14);
 nrPlanSlab('turf',circ(4.5,0,0,24),null,top+.4,.1,P('turf'));}
defBuilding({key:'nr-anc-apt-drum',name:'Drum tower (Ancient apartments)',seed:5200,cls:'building',kind:'apartments',
 tags:{types:['dwelling-multi'],wealth:'poor',style:'Ancient streamline: a glass drum in wavering ribbons'},
 w:22,d:22,h:NR_DRUM.PL+NR_DRUM.NS*NR_STOREY+9.5,budget:300000,
 front:{x:0,z:7.95,yaw:0},note:'eight storeys of Ancient apartments in a glass drum, now barracks (set noahs-regret)',
 build(o){nrAptDrum(o);}});
