/* ================================================================= HIGHLANDS / RUSTIC — Baronial & Caucasus clan burgh (82)
   Urban townhouses, vaulted pend closes, Svaneti-style clan koshki peel-towers, Old Tbilisi overhanging fret-carved
   wooden aivani balconies, marani cellar taverns, Silk-Trail factor houses, the Free-Company Tolbooth muster hall,
   the Darbazi-domed Winter Law-Hall, the Nine-Stones Thing-Stead, the Reverberatory Bronze Bell & Field-Gun Foundry,
   watchful burgh ports, and humpback cobbled bridges for the Free Clans of Ardent (LORE.md §6.4; settlements/ardent).
   Synthesizes Scottish Baronial (lime-harled walls, dressed granite quoins, crow-stepped gables, corbelled pepperpot
   bartizans), Caucasus urban & mountain architecture (Old Tbilisi aivani galleries, Svan koshki / Tusheti keselo
   battered stone towers, Georgian darbazi corbelled octagonal swallow-domes, vaulted marani cellars — distinct from
   kits/dzagh-vardzi's apricot tuff & quartz pyramids), and Carved Highland Rustic + Cast Bronze.
   No electric light anywhere in the branch (lit:false). Pure [G data] builders; seeds 27001-27199. */

/* ---------------------------------------------------------------- Palette & architectural helpers (prefix hnAB) */
const HPAL_AB={
 harl:[0xede2cb,0xe3d2b4,0xe6cfa2,0xd8d3c6,0xb65a46,0xdfd5be],
 quoin:[0xb5aca0,0xa69d90,0xc4bbb0,0x989084],
 koshki:[0x78736c,0x6c6760,0x857f75,0x726d66],
 slate:[0x4b525c,0x545b66,0x444a54,0x5a6068],
 aivani:[0x2d6e66,0x963228,0x5c3c28,0x2f4d73,0xc68c32,0x3a6b4c],
 bronze:[0xc88c38,0xb87c2c,0xd69c46],
 verdigris:[0x3d7d68,0x468870,0x356e5c]
};

/* Lime-harled masonry block with dressed granite corner quoins and optional sill belt course */
function hnABHarlBox(x,y,z,w,h,d,ry,harlC,quoinC,belt){
 const rot=ry==null?0:ry,hc=harlC||hC(vPick(HPAL_AB.harl)),qc=quoinC||hC(vPick(HPAL_AB.quoin));
 hnStucco(x,y,z,w,h,d,rot,hc,qc);
 if(belt){vB('vStone',x,y+h-.16,z,w+.14,.16,d+.14,rot,qc);}
}

/* Scottish crow-stepped (corbie-stepped) gable roof: steep slate pitch with stacked dressed-stone gable steps at both x-ends */
function hnABCrowGable(x,y,z,w,d,pitch,ry,harlC,quoinC,slateC,chimneyEnd){
 const rot=ry==null?0:ry,hc=harlC||hC(vPick(HPAL_AB.harl)),qc=quoinC||hC(vPick(HPAL_AB.quoin)),sc=slateC||hC(vPick(HPAL_AB.slate));
 const bz=hC(vPick(HPAL_AB.bronze)),rise=pitch*(d/2);
 /* tight x-overhang so the stone crow-stepped gable walls stand proud of the slate roof */
 vnGableRoof(x,y,z,w-.28,d,rise,rot,'hScaleB',sc,.28,'vGablePl',hc,.22);
 const steps=Math.max(5,Math.min(8,Math.round(rise/.42))),sh=(rise+.36)/steps;
 for(const sx of[-1,1]){
  const gx=sx*(w/2-.12);
  /* solid harled gable triangle + skewputt base blocks */
  const gp=loc(x,z,gx,0,rot);
  kput('vGablePl',[gp[0],y,gp[1]],qEuler(0,rot,0),[.26,rise+.08,d+.06],hc);
  for(const sz of[-1,1]){
   const sp=loc(x,z,gx,sz*(d/2+.1),rot);
   vB('vStone',sp[0],y-.08,sp[1],.34,.36,.42,rot,qc);}
  /* ascending corbie steps narrowing toward the ridge apex */
  for(let i=0;i<steps;i++){
   const span=Math.max(.52,(d+.18)*(1-i/(steps+.15))),yy=y+i*sh;
   const cp=loc(x,z,gx,0,rot);
   vB('vPlaster',cp[0],yy,cp[1],.28,sh+.02,span,rot,hc);
   vB('vStone',cp[0],yy+sh-.08,cp[1],.34,.11,span+.12,rot,qc);}
  /* apex chimney stack or cast-bronze thistle finial */
  const ap=loc(x,z,gx,0,rot),ay=y+steps*sh-.04;
  if(chimneyEnd==null||chimneyEnd===sx||chimneyEnd===2){
   vB('vStone',ap[0],ay-.2,ap[1],.58,1.15,.68,rot,qc);
   vB('vStone',ap[0],ay+.88,ap[1],.7,.14,.8,rot,qc);
   vPst('vClayPot',ap[0],ay+1.0,ap[1],.13,.38,hC(0x8e4c32));}
  else{
   vPst('vIron',ap[0],ay,ap[1],.04,.68,bz);
   vBall('hGold',ap[0],ay+.68,ap[1],.12,bz);}}
 return y+rise;
}

/* Scottish Baronial corbelled corner pepperpot bartizan turret with conical slate roof & cast-bronze spike */
function hnABBartizan(x,y,z,r,h,ry,harlC,quoinC,slateC){
 const rot=ry==null?0:ry,hc=harlC||hC(vPick(HPAL_AB.harl)),qc=quoinC||hC(vPick(HPAL_AB.quoin)),sc=slateC||hC(vPick(HPAL_AB.slate)),bz=hC(vPick(HPAL_AB.bronze));
 /* 4 stepped stone corbel courses flaring from the corner console */
 for(let k=0;k<4;k++){
  const rk=r*(.38+.18*k),yy=y-.76+k*.19;
  kput('hOctS',[x,yy,z],qEuler(0,rot,0),[rk,0.21,rk],qc);}
 /* octagonal harled drum + stone cornice + narrow slit windows */
 kput('hOctP',[x,y,z],qEuler(0,rot,0),[r,h,r],hc);
 kput('hOctS',[x,y+h-.18,z],qEuler(0,rot,0),[r*1.08,.2,r*1.08],qc);
 for(const aOff of[-.65,0,.65]){
  const a=rot+aOff,wp=loc(x,z,0,r*.94,a);
  vnWin(wp[0],y+h*.42,wp[1],a,.34,.78,'glass','vStone',qc);}
 /* steep candle-snuffer conical slate spire + bronze ball & spike */
 const coneH=r*2.45;
 kput('hConeSc',[x,y+h,z],null,[r*1.16,coneH,r*1.16],sc);
 vPst('vIron',x,y+h+coneH-.15,z,.04,.85,bz);
 vBall('hGold',x,y+h+coneH+.38,z,.11,bz);
 return y+h+coneH+.7;
}

/* Old Tbilisi overhanging fret-carved wooden aivani balcony / veranda jutting over narrow cobbled streets */
function hnABAivani(x,y,z,ry,w,d,h,woodC,laceC,roofC,rug){
 const rot=ry==null?0:ry,wc=woodC||hC(vPick(HPAL_AB.aivani)),lc=laceC||hC(HPAL.white),rc=roofC||hC(vPick(HPAL_AB.verdigris));
 const bz=hC(vPick(HPAL_AB.bronze)),dc=loc(x,z,0,d/2,rot);
 /* plank deck + carved curved timber brackets back to the stone wall */
 vB('vWood',dc[0],y-.15,dc[1],w,.15,d,rot,wc);
 const nb=Math.max(2,Math.round(w/1.45));
 for(let i=0;i<=nb;i++){
  const u=-w/2+.14+(w-.28)*i/nb;
  hnMember('vWood',hnOn(x,y-.98,z,rot,u,.04),hnOn(x,y-.16,z,rot,u,d*.88),.13,.11,hRot(rot,[1,0,0]),wc);}
 /* pierced Tbilisi hLaceB balustrade on front and both ends */
 const fr=loc(x,z,0,d-.04,rot);
 kput('hLaceB',[fr[0],y+.48,fr[1]],qEuler(0,rot,0),[w-.08,.92,1],lc);
 vB('hPaint',fr[0],y+.94,fr[1],w+.06,.09,.13,rot,wc);
 for(const s of[-1,1]){
  const sp=loc(x,z,s*(w/2-.04),d/2,rot);
  kput('hLaceB',[sp[0],y+.48,sp[1]],qEuler(0,rot+s*Math.PI/2,0),[d-.06,.92,1],lc);
  vB('hPaint',sp[0],y+.94,sp[1],.13,.09,d,rot,wc);}
 /* slender turned posts, pierced hLaceV arch frieze, and pent verdigris/slate canopy */
 for(let i=0;i<=nb;i++){
  const u=-w/2+.1+(w-.2)*i/nb,pp=loc(x,z,u,d-.08,rot);
  vPst('vPost',pp[0],y+.96,pp[1],.055,h-.96,wc);
  if(i<nb){
   const um=u+(w-.2)/nb/2,vp=loc(x,z,um,d-.06,rot);
   kput('hLaceV',[vp[0],y+h-.24,vp[1]],qEuler(0,rot+Math.PI,Math.PI),[(w-.2)/nb-.06,.34,1],lc);}}
 vB('hPaint',dc[0],y+h-.08,dc[1],w+.12,.12,d+.12,rot,wc);
 vnShedRoof(dc[0],y+h,dc[1],w+.26,d+.28,.42,rot,'vCopperB',rc,.18,.1);
 /* optional Caucasian woven wool rug draped over the rail + bronze hearth-lantern */
 if(rug!==false){
  const rp=loc(x,z,rr(-w*.22,w*.22),d+.03,rot);
  kput('vCloth',[rp[0],y+.46,rp[1]],qEuler(0,rot,0),[Math.min(1.35,w*.34),.82,1],hC(vPick([0x9e2a24,0x244a7c,0xc88a2e])));}
 const lp=loc(x,z,0,d-.12,rot);
 vPst('vIron',lp[0],y+h-.42,lp[1],.02,.28,bz);
 vBall('vEmber',lp[0],y+h-.46,lp[1],.075,null,.09);
}

/* Svaneti koshki / Tusheti keselo / Scottish peel-tower (čip): battered dry-stone shaft, machicolation crown & bronze clan shield */
function hnABKoshki(x,y,z,w,h,ry,stoneC,quoinC,slateC,crestC){
 const rot=ry==null?0:ry,stc=stoneC||hC(vPick(HPAL_AB.koshki)),qc=quoinC||hC(vPick(HPAL_AB.quoin));
 const sc=slateC||hC(vPick(HPAL_AB.slate)),bz=crestC||hC(vPick(HPAL_AB.bronze));
 const baseH=Math.min(3.6,h*.28),midH=(h-baseH)*.54,topH=h-baseH-midH;
 /* battered stone base + two subtly tapering upper stone stages */
 kput('hBatterRub',[x,y,z],qEuler(0,rot,0),[w+.36,baseH,w+.36],stc);
 vB('vStone',x,y+baseH-.14,z,w+.18,.16,w+.18,rot,qc);
 const w1=w*.92,w2=w*.85;
 vB('hRubB',x,y+baseH,z,w1,midH,w1,rot,stc);
 vB('vStone',x,y+baseH+midH-.14,z,w1+.16,.16,w1+.16,rot,qc);
 vB('hRubB',x,y+baseH+midH,z,w2,topH,w2,rot,stc);
 /* narrow defensive loop windows on all 4 faces */
 for(let f=0;f<4;f++){
  const a=rot+f*Math.PI/2;
  const p1=loc(x,z,0,w1/2,a),p2=loc(x,z,0,w2/2,a);
  vnWin(p1[0],y+baseH+midH*.42,p1[1],a,.38,.92,'glass','vStone',qc);
  vnWin(p2[0],y+baseH+midH+topH*.32,p2[1],a,.36,.78,'open','vStone',qc);}
 /* Svaneti mashikul projecting stone machicolation gallery on corbels around all 4 sides */
 const my=y+h-.88,mw=w2+.64;
 for(let f=0;f<4;f++){
  const a=rot+f*Math.PI/2;
  for(const u of[-w2*.34,0,w2*.34]){
   const cp=loc(x,z,u,w2/2+.14,a);
   vB('vStone',cp[0],my-.36,cp[1],.26,.38,.34,a,qc);
   const ap=loc(x,z,u,mw/2+.02,a);
   vnWin(ap[0],my+.22,ap[1],a,.34,.42,'open','vStone',qc);}}
 vB('hRubB',x,my,z,mw,.92,mw,rot,stc);
 vB('vStone',x,my+.88,z,mw+.18,.14,mw+.18,rot,qc);
 /* low Svaneti slate saddle-or-pyramid cap + bronze finial & clan shield boss on front face */
 const roofTop=y+h+.02+mw*.48;
 vnPyrRoof('hPyrSc',x,y+h+.02,z,mw,mw,mw*.48,rot,sc,.28);
 vPst('vIron',x,roofTop-.12,z,.05,.95,bz);
 vBall('hGold',x,roofTop+.52,z,.14,bz);
 const sp=loc(x,z,0,w1/2+.07,rot);
 kput('hDiscG',[sp[0],y+baseH+1.15,sp[1]],qEuler(0,rot,0).multiply(qEuler(Math.PI/2,0,0)),[.52,.06,.52],bz);
 vBall('hGold',sp[0],y+baseH+1.15,sp[1]+0,.13,bz);
 return roofTop+.8;
}

/* Open pass-through Scottish stone pend archway (jamb piers + stepped voussoirs + cobble floor, zero blocked tunnel!) */
function hnABPendWall(x,y,z,w,h,d,ry,pendX,pendW,pendH,harlC,quoinC){
 const rot=ry==null?0:ry,hc=harlC||hC(vPick(HPAL_AB.harl)),qc=quoinC||hC(vPick(HPAL_AB.quoin));
 const xL=-w/2,xP0=pendX-pendW/2,xP1=pendX+pendW/2,xR=w/2;
 const wL=Math.max(.6,xP0-xL),wR=Math.max(.6,xR-xP1);
 const pL=loc(x,z,xL+wL/2,0,rot),pR=loc(x,z,xP1+wR/2,0,rot),pM=loc(x,z,pendX,0,rot);
 hnABHarlBox(pL[0],y,pL[1],wL,h,d,rot,hc,qc,false);
 hnABHarlBox(pR[0],y,pR[1],wR,h,d,rot,hc,qc,false);
 if(h>pendH+.15){
  vB('vPlaster',pM[0],y+pendH,pM[1],pendW+.08,h-pendH,d,rot,hc);}
 /* cobbled close passage floor + stone jambs & stepped arch crown on both faces */
 vB('hCobble',pM[0],y,pM[1],pendW+.2,.12,d+.6,rot,hC(vPick(HPAL.rubble)));
 for(const sz of[-1,1]){
  for(const sx of[-1,1]){
   const jp=loc(x,z,pendX+sx*(pendW/2-.12),sz*(d/2+.04),rot);
   vB('vStone',jp[0],y,jp[1],.32,pendH,.16,rot,qc);}
  const ap=loc(x,z,pendX,sz*(d/2+.05),rot);
  vB('vStone',ap[0],y+pendH-.18,ap[1],pendW+.52,.28,.18,rot,qc);
  vB('vStone',ap[0],y+pendH+.08,ap[1],pendW*.66,.22,.2,rot,qc);}
}

/* Georgian darbazi corbelled octagonal swallow-dome lantern crown */
function hnABDarbazi(x,y,z,r,tiers,woodC,bronzeC){
 const wc=woodC||hC(vPick(HPAL.tar)),bz=bronzeC||hC(vPick(HPAL_AB.bronze)),vg=hC(vPick(HPAL_AB.verdigris));
 const n=tiers==null?4:tiers;
 let yy=y,rk=r;
 for(let i=0;i<n;i++){
  const th=.46;
  kput('hOctW',[x,yy,z],qEuler(0,(i%2)*(Math.PI/8),0),[rk,th,rk],wc);
  kput('hOctS',[x,yy+th-.08,z],qEuler(0,(i%2)*(Math.PI/8),0),[rk*1.04,.09,rk*1.04],bz);
  yy+=th-.03;
  rk*=.78;}
 /* central smoke/light lantern drum + verdigris bronze cupola */
 kput('hOctP',[x,yy,z],null,[rk*.92,.75,rk*.92],wc);
 for(let k=0;k<4;k++){
  const a=k*Math.PI/2,wp=loc(x,z,0,rk*.88,a);
  vnWin(wp[0],yy+.16,wp[1],a,.32,.42,'open','vWood',wc);}
 kput('vConeC',[x,yy+.72,z],null,[rk*1.18,1.05,rk*1.18],vg);
 vPst('vIron',x,yy+1.68,z,.04,.75,bz);
 vBall('hGold',x,yy+2.22,z,.13,bz);
 return yy+2.45;
}

Object.assign(HTRADE,{
 hl_rus_wynd_armourer:'hammer',
 hl_rus_marani_tavern:'barrel',
 hl_rus_silk_factor:'scales',
 hl_rus_mercenary_bourse:'axe',
 hl_rus_bronze_foundry:'hammer'
});

/* ================================================================ 1. NARROW-COBBLED BURGH DWELLINGS & TENEMENTS */

/* 1. hl_rus_wynd_house_a — Narrow crow-stepped harled burgh house with overhanging Old Tbilisi aivani balcony */
function buildHlRusWyndHouseA(G,o){reseed(27001+(o.v|0));
 const W=8.2,D=7.6,F=.45,H1=2.9,H2=2.9;
 const harl=hC(vPick(HPAL_AB.harl)),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const aiv=hC(vPick(HPAL_AB.aivani)),bz=hC(vPick(HPAL_AB.bronze));
 vnReg('Crow-stepped wynd house (aivani)',0,0,6.8,F+H1+H2+4.8);
 hnSocle(0,0,0,W+.22,F,D+.22,0,hC(vPick(HPAL_AB.koshki)),quoin);
 hnABHarlBox(0,F,0,W,H1+H2,D,0,harl,quoin,true);
 /* gable faces the street (+z -> ry = Math.PI/2 so crow-steps frame the wynd!) */
 const top=hnABCrowGable(0,F+H1+H2,0,D,W,1.22,Math.PI/2,harl,quoin,slate,-1);
 /* ground-floor stone doorway, stoop, and shuttered cellar window */
 vnDoor(-1.7,F,D/2,0,1.05,2.05,'vStone',quoin,hC(vPick(HPAL.tar)),false);
 vnStairs(-1.7,0,D/2+.48,0,1.45,F,2,'vStone',quoin);
 vnWin(1.75,F+.92,D/2,0,.85,1.1,'glass','vStone',quoin,true);
 for(const z of[-2.0,1.8])vnWin(W/2,F+1.0,z,Math.PI/2,.75,1.05,'glass','vStone',quoin);
 /* cantilevered Tbilisi fret-carved wooden balcony jutting over the cobbles + upper windows */
 hnABAivani(.35,F+H1,D/2,0,W-1.1,1.45,2.55,aiv,hC(HPAL.white),hC(vPick(HPAL_AB.verdigris)),true);
 vnDoor(.35,F+H1,D/2,0,.95,1.98,'hPaint',aiv,aiv,false);
 for(const u of[-2.1,2.55])hnNal(u,F+H1+.78,D/2,0,.76,1.02,'glass',hC(HPAL.white),{accent:bz});
 /* attic window + cast-bronze clan boss in the street-facing crow-stepped gable */
 vnWin(0,F+H1+H2+.85,D/2+.14,0,.68,.88,'glass','vStone',quoin);
 kput('hDiscG',[0,top-1.05,D/2+.18],qEuler(Math.PI/2,0,0),[.36,.05,.36],bz);
 FURNISH('iziz_vern_barrel',W/2+.48,0,D/2-.6,0,{v:0});
}

/* 2. hl_rus_wynd_house_b — 3-storey harled corner townhouse with corbelled pepperpot bartizan & carved timber loggia */
function buildHlRusWyndHouseB(G,o){reseed(27011+(o.v|0));
 const W=7.8,D=8.0,F=.48,H1=2.8,H2=2.7,H3=2.5;
 const harl=hC(vPick(HPAL_AB.harl)),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const aiv=hC(vPick(HPAL_AB.aivani)),bz=hC(vPick(HPAL_AB.bronze));
 vnReg('Bartizan corner burgh house',0,0,7.0,F+H1+H2+H3+5.2);
 hnSocle(0,0,0,W+.22,F,D+.22,0,hC(vPick(HPAL_AB.koshki)),quoin);
 hnABHarlBox(0,F,0,W,H1+H2+H3,D,0,harl,quoin,true);
 hnABCrowGable(0,F+H1+H2+H3,0,W,D,1.18,0,harl,quoin,slate,1);
 /* corbelled Scottish pepperpot bartizan perched on the front-right (+x,+z) corner */
 hnABBartizan(W/2-.15,F+H1+H2-.2,D/2-.15,1.18,H3+1.15,Math.PI/4,harl,quoin,slate);
 /* street-level arched stone portal & windows */
 vnDoor(1.5,F,D/2,0,1.08,2.1,'vStone',quoin,hC(vPick(HPAL.tar)),false);
 vnStairs(1.5,0,D/2+.48,0,1.5,F,2,'vStone',quoin);
 vnWin(-1.85,F+.9,D/2,0,.88,1.12,'glass','vStone',quoin,true);
 /* middle-floor Tbilisi side-and-front wooden gallery + top-floor carved nalichniki */
 hnABAivani(-1.1,F+H1,D/2,0,4.6,1.3,2.42,aiv,hC(HPAL.white),slate,true);
 vnDoor(-1.1,F+H1,D/2,0,.92,1.95,'hPaint',aiv,aiv,false);
 for(const u of[-2.1,.2])hnNal(u,F+H1+H2+.68,D/2,0,.78,.98,'glass',hC(HPAL.white),{accent:bz});
 for(const z of[-2.1,1.9]){
  vnWin(-W/2,F+H1+.8,z,-Math.PI/2,.76,1.0,'glass','vStone',quoin);
  vnWin(W/2,F+H1+.8,z,Math.PI/2,.76,1.0,'glass','vStone',quoin);}
 FURNISH('hl_rus_shield',1.5,F+2.58,D/2+.08,0,{v:1});
}

/* 3. hl_rus_pend_tenement — Multi-family burgh tenement pierced by an open stone pend archway into a cobbled close */
function buildHlRusPendTenement(G,o){reseed(27021+(o.v|0));
 const W=11.2,D=8.4,H1=3.25,H2=2.85,H3=2.65;
 const harl=hC(vPick(HPAL_AB.harl)),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const aiv=hC(vPick(HPAL_AB.aivani)),bz=hC(vPick(HPAL_AB.bronze));
 vnReg('Pend close tenement',0,0,8.2,H1+H2+H3+5.0);
 /* ground floor pierced by a 2.8m-wide vaulted open pend passage at x = -1.2 */
 hnABPendWall(0,0,0,W,H1,D,0,-1.2,2.8,2.85,harl,quoin);
 vB('vStone',0,H1-.14,0,W+.18,.16,D+.18,0,quoin);
 /* two upper harled residential storeys + crow-stepped roof + twin street dormers */
 hnABHarlBox(0,H1,0,W,H2+H3,D,0,harl,quoin,true);
 hnABCrowGable(0,H1+H2+H3,0,W,D,1.16,0,harl,quoin,slate,2);
 /* ground-floor tenement stair-door on right pier & workshop window on left pier */
 vnDoor(3.1,0.12,D/2,0,1.05,2.08,'vStone',quoin,hC(vPick(HPAL.tar)),true);
 vnWin(-4.1,1.05,D/2,0,.85,1.1,'glass','vStone',quoin,true);
 vnWin(3.1,1.05,-D/2,Math.PI,.85,1.1,'glass','vStone',quoin);
 /* long Old Tbilisi fretwork gallery spanning the 2nd floor above the pend arch */
 hnABAivani(0,H1,D/2,0,W-1.4,1.38,2.52,aiv,hC(HPAL.white),hC(vPick(HPAL_AB.verdigris)),true);
 for(const u of[-3.4,0,3.4])vnWin(u,H1+.75,D/2,0,.82,1.08,'glass','hPaint',hC(HPAL.white));
 /* 3rd-floor windows + twin crow-stepped wall-head dormers */
 for(const u of[-3.6,0,3.6])hnNal(u,H1+H2+.68,D/2,0,.78,.98,'glass',hC(HPAL.white),{accent:bz});
 for(const u of[-2.8,2.8]){
  vB('vPlaster',u,H1+H2+H3-.2,D/2-.55,1.85,1.45,1.25,0,harl);
  vnGableRoof(u,H1+H2+H3+1.25,D/2-.55,1.25,1.85,.78,Math.PI/2,'hScaleB',slate,.18,'vGablePl',harl,.14);
  vnWin(u,H1+H2+H3+.18,D/2+.08,0,.62,.78,'glass','vStone',quoin);}
 /* rear Tbilisi gallery overlooking the inner close */
 hnABAivani(1.6,H1,-D/2,Math.PI,6.4,1.2,2.45,aiv,hC(HPAL.white),slate,false);
}

/* 4. hl_rus_tower_house — Rich L-plan Scottish Baronial × Svaneti koshki laird/captain peel-house */
function buildHlRusTowerHouse(G,o){reseed(27031+(o.v|0));
 const harl=hC(vPick(HPAL_AB.harl)),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const stc=hC(vPick(HPAL_AB.koshki)),aiv=hC(vPick(HPAL_AB.aivani)),bz=hC(vPick(HPAL_AB.bronze));
 vnReg('L-plan koshki tower-house',0,0,8.6,17.2);
 /* 4-storey Svan koshki peel-keep on -x (5.2 x 5.2m, 13.8m shaft) */
 hnABKoshki(-2.6,0,-.4,5.2,13.8,0,stc,quoin,slate,bz);
 /* attached 2.5-storey crow-stepped Baronial hall wing on +x */
 const wx=2.0,wz=.4,ww=6.4,wd=7.8,wf=.5,wh=5.8;
 hnSocle(wx,0,wz,ww+.22,wf,wd+.22,0,stc,quoin);
 hnABHarlBox(wx,wf,wz,ww,wh,wd,0,harl,quoin,true);
 hnABCrowGable(wx,wf+wh,wz,ww,wd,1.2,0,harl,quoin,slate,1);
 /* pepperpot bartizan clasping the outer +x,+z hall corner */
 hnABBartizan(wx+ww/2-.12,wf+wh-2.5,wz+wd/2-.12,1.12,3.4,Math.PI/4,harl,quoin,slate);
 /* re-entrant angle arched stone portal + Tbilisi carved veranda on the hall's upper floor */
 vnDoor(.45,wf,wz+wd/2,0,1.15,2.18,'vStone',quoin,hC(vPick(HPAL.tar)),false);
 vnStairs(.45,0,wz+wd/2+.52,0,1.65,wf,3,'vStone',quoin);
 vnWin(3.25,wf+.95,wz+wd/2,0,.92,1.18,'glass','vStone',quoin,true);
 hnABAivani(wx+.3,wf+2.95,wz+wd/2,0,ww-1.2,1.42,2.52,aiv,hC(HPAL.white),hC(vPick(HPAL_AB.verdigris)),true);
 vnDoor(wx+.3,wf+2.95,wz+wd/2,0,.95,1.98,'hPaint',aiv,aiv,false);
 /* martial trophies: shields hung beside the re-entrant portal */
 FURNISH('hl_rus_shield',-.95,wf+2.25,wz+wd/2+.08,0,{v:0});
 FURNISH('hl_rus_shield',1.85,wf+2.25,wz+wd/2+.08,0,{v:1});
}

/* ================================================================ 2. WYND TRADES, MARANI TAVERN & SILK-TRAIL FACTOR */

/* 5. hl_rus_marani_tavern — Sunken Caucasian marani wine & Highland peat-scotch cellar tavern with 2-tier Tbilisi gallery */
function buildHlRusMaraniTavern(G,o){reseed(27041+(o.v|0));
 const W=11.0,D=9.0,H1=2.9,H2=2.85,H3=2.65;
 const harl=hC(vPick(HPAL_AB.harl)),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const stc=hC(vPick(HPAL_AB.koshki)),aiv=hC(vPick([0x963228,0x2d6e66,0x5c3c28])),bz=hC(vPick(HPAL_AB.bronze));
 vnReg('Marani cellar and scotch tavern',0,0,8.4,H1+H2+H3+4.8);
 /* heavy battered stone cellar ground storey + harled upper floors + crow-stepped gables */
 vB('hRubB',0,0,0,W+.24,H1,D+.24,0,stc);
 vB('vStone',0,H1-.16,0,W+.32,.18,D+.32,0,quoin);
 hnABHarlBox(0,H1,0,W,H2+H3,D,0,harl,quoin,true);
 hnABCrowGable(0,H1+H2+H3,0,W,D,1.16,0,harl,quoin,slate,2);
 /* street-level arched marani cellar portal, qvevri amphorae & oak scotch casks */
 vnDoor(0,.08,D/2+.12,0,1.35,2.15,'vStone',quoin,hC(vPick(HPAL.tar)),true);
 for(const sx of[-3.3,3.3]){
  vnWin(sx,.95,D/2+.12,0,1.05,1.15,'glass','vStone',quoin,true);
  vPst('vClayPot',sx*1.08,0,D/2+.68,.32,.76,hC(0x9c5234));}
 hnBarrel(-4.4,0,D/2+.62,.36,.88);hnBarrel(4.4,0,D/2+.62,.36,.88);
 hnSign(2.05,H1-.35,D/2+.16,0,'barrel',.98);
 /* dramatic two-tier wrap-around Old Tbilisi carved wooden drinking balconies! */
 hnABAivani(0,H1,D/2,0,W-.8,1.55,H2-.1,aiv,hC(HPAL.white),slate,true);
 hnABAivani(0,H1+H2,D/2,0,W-1.6,1.42,H3-.05,aiv,hC(HPAL.white),hC(vPick(HPAL_AB.verdigris)),true);
 for(const u of[-3.2,0,3.2]){
  vnWin(u,H1+.72,D/2,0,.85,1.1,'glass','hPaint',hC(HPAL.white));
  vnWin(u,H1+H2+.68,D/2,0,.8,1.02,'glass','hPaint',hC(HPAL.white));}
 FURNISH('hl_rus_porch_bench',-2.4,0,D/2+.62,0,{v:0});
}

/* 6. hl_rus_wynd_armourer — Martial broadsword, čindžal dagger & cast-bronze buckler smithy on a cobbled wynd */
function buildHlRusWyndArmourer(G,o){reseed(27051+(o.v|0));
 const W=9.6,D=8.2,H1=3.0,H2=2.8;
 const harl=hC(vPick(HPAL_AB.harl)),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const stc=hC(vPick(HPAL_AB.koshki)),aiv=hC(vPick(HPAL_AB.aivani)),bz=hC(vPick(HPAL_AB.bronze));
 vnReg('Clan armourer and blade-smithy',0,0,7.6,H1+H2+4.8);
 vB('hRubB',0,0,-.3,W,H1,D,0,stc);
 hnABHarlBox(0,H1,-.3,W,H2,D,0,harl,quoin,true);
 const top=hnABCrowGable(0,H1+H2,-.3,W,D,1.18,0,harl,quoin,slate,-1);
 const fz=-.3+D/2;
 /* open-front stone forge bay on -x with glowing vEmber hearth & tall stone chimney */
 vB('vStone',-2.4,0,fz-.35,3.2,2.45,1.6,0,quoin);
 vB('vDarkB',-2.4,.88,fz+.42,1.35,.88,.14,0);
 vBall('vEmber',-2.4,1.02,fz+.36,.32,null,.18);
 hnStoneChimney(-2.4,H1+H2-1.2,-.8,top-H1-H2+2.2,.92);
 /* armourer shop door, counter, bronze buckler trophy row & overhanging gallery */
 vnDoor(2.1,.1,fz,0,1.08,2.08,'vStone',quoin,hC(vPick(HPAL.tar)),true);
 FURNISH('hl_rus_shutter_counter',-.1,.1,fz+.45,0);
 hnSign(3.6,2.45,fz,0,'hammer',.95);
 for(const u of[-3.4,-1.4,.6,2.8]){
  kput('hDiscG',[u,H1-.22,fz+.08],qEuler(Math.PI/2,0,0),[.28,.05,.28],bz);}
 hnABAivani(1.2,H1,fz,0,6.2,1.35,2.48,aiv,hC(HPAL.white),slate,false);
 for(const u of[-.8,2.6])hnNal(u,H1+.75,fz,0,.8,1.02,'glass',hC(HPAL.white),{accent:bz});
 FURNISH('iziz_vern_barrel',-4.1,0,fz+.55,0,{v:1});
}

/* 7. hl_rus_silk_factor — Bonded Silk-Trail caravan countinghouse & Torgo brocade factor house */
function buildHlRusSilkFactor(G,o){reseed(27061+(o.v|0));
 const W=10.6,D=8.6,F=.48,H1=3.1,H2=2.95;
 const harl=hC(vPick(HPAL_AB.harl)),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const aiv=hC(vPick([0x2f4d73,0x2d6e66,0x963228])),bz=hC(vPick(HPAL_AB.bronze));
 vnReg('Silk-Trail factor countinghouse',0,0,8.2,F+H1+H2+5.2);
 hnSocle(0,0,0,W+.24,F,D+.24,0,hC(vPick(HPAL_AB.koshki)),quoin);
 hnABHarlBox(0,F,0,W,H1+H2,D,0,harl,quoin,true);
 hnABCrowGable(0,F+H1+H2,0,W,D,1.2,0,harl,quoin,slate,1);
 hnABBartizan(-W/2+.12,F+H1-.2,D/2-.12,1.15,H2+1.2,-Math.PI/4,harl,quoin,slate);
 /* bronze-bound double pack-vault doors + scales sign + silk-bolt display rack */
 vnDoor(-1.4,F,D/2,0,1.65,2.25,'vStone',quoin,bz,false);
 vnStairs(-1.4,0,D/2+.52,0,2.1,F,2,'vStone',quoin);
 vnWin(2.45,F+.95,D/2,0,.95,1.18,'glass','vStone',quoin,true);
 hnSign(.6,F+2.45,D/2,0,'scales',.95);
 hnRUVeshala(3.2,0,D/2+1.25,0,3.1,2.25,aiv,[0xc8962e,0x9e2432,0x244e86,0x2d7868]);
 /* rich upper Tbilisi broker's loggia */
 hnABAivani(.8,F+H1,D/2,0,7.2,1.48,2.58,aiv,hC(HPAL.white),hC(vPick(HPAL_AB.verdigris)),true);
 for(const u of[-1.6,1.0,3.3])hnNal(u,F+H1+.78,D/2,0,.82,1.08,'glass',hC(HPAL.white),{accent:bz});
 FURNISH('iziz_vern_crate',-3.8,0,D/2+.75,.15,{v:0});
}

/* ================================================================ 3. THE NINE CLANS, TOLBOOTH BOURSE, THING-STEAD & BRONZE FOUNDRY */

/* 8. hl_rus_clan_koshki — Seat & Svaneti koshki keep of one of the Nine Clans (o.v 0..8 varies clan wash & crest) */
function buildHlRusClanKoshki(G,o){reseed(27071+(o.v|0));
 const cv=(o.v|0)%9;
 const clanCols=[0xc88c38,0x3d7d68,0xb83224,0x2d5894,0xd89e32,0x7e8890,0xc94e28,0x8a6432,0x982834];
 const crestC=hC(clanCols[cv]),harl=hC(HPAL_AB.harl[cv%HPAL_AB.harl.length]);
 const quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate)),stc=hC(vPick(HPAL_AB.koshki));
 const aiv=hC(HPAL_AB.aivani[cv%HPAL_AB.aivani.length]),bz=hC(vPick(HPAL_AB.bronze));
 vnReg('Clan koshki keep and lodge',0,0,9.8,18.2);
 /* towering 16.2m Svaneti koshki clan peel-tower on +x with machicolated crown & signal cresset */
 hnABKoshki(3.2,0,-.4,5.6,16.2,0,stc,quoin,slate,crestC);
 /* attached crow-stepped stone-and-timber clan feasting hall on -x */
 const hx=-2.1,hz=.3,hw=7.4,hd=9.2,hf=.58,hh=5.6;
 hnSocle(hx,0,hz,hw+.26,hf,hd+.26,0,stc,quoin);
 hnABHarlBox(hx,hf,hz,hw,hh,hd,0,harl,quoin,true);
 hnABCrowGable(hx,hf+hh,hz,hd,hw,1.22,Math.PI/2,harl,quoin,slate,-1);
 hnABBartizan(hx-hw/2+.14,hf+hh-2.6,hz+hd/2-.14,1.12,3.3,-Math.PI/4,harl,quoin,slate);
 /* carved ceremonial portal with bronze clan medallion, shields & Tbilisi chief's balcony */
 vnDoor(hx+.4,hf,hz+hd/2,0,1.35,2.32,'vStone',quoin,hC(vPick(HPAL.tar)),false);
 vnStairs(hx+.4,0,hz+hd/2+.58,0,1.9,hf,3,'vStone',quoin);
 kput('hDiscG',[hx+.4,hf+2.85,hz+hd/2+.1],qEuler(Math.PI/2,0,0),[.56,.06,.56],crestC);
 vBall('hGold',hx+.4,hf+2.85,hz+hd/2+.14,.15,bz);
 hnABAivani(hx-.3,hf+3.05,hz+hd/2,0,5.2,1.38,2.42,aiv,hC(HPAL.white),hC(vPick(HPAL_AB.verdigris)),true);
 for(const z of[-2.4,2.2])hnNal(hx-hw/2,hf+1.25,hz+z,-Math.PI/2,.85,1.15,'glass',hC(HPAL.white),{accent:crestC});
 FURNISH('hl_rus_shield',hx-1.35,hf+1.95,hz+hd/2+.08,0,{v:cv%2});
 FURNISH('hl_rus_shield',hx+2.15,hf+1.95,hz+hd/2+.08,0,{v:(cv+1)%2});
}

/* 9. hl_rus_mercenary_bourse — The Free-Company Tolbooth & Silk-Trail Muster Hall (Bronze Muster-Bell Spire) */
function buildHlRusMercenaryBourse(G,o){reseed(27081+(o.v|0));
 const W=16.0,D=11.6,F=.62,H1=3.6,H2=3.4;
 const harl=hC(HPAL_AB.harl[0]),quoin=hC(HPAL_AB.quoin[0]),slate=hC(HPAL_AB.slate[0]);
 const stc=hC(HPAL_AB.koshki[0]),aiv=hC(0x963228),bz=hC(HPAL_AB.bronze[0]),vg=hC(HPAL_AB.verdigris[0]);
 vnReg('Free-Company Tolbooth and Silk-Trail Bourse',0,0,11.6,23.5);
 hnSocle(0,0,0,W+.34,F,D+.34,0,stc,quoin);
 hnABHarlBox(0,F,0,W,H1+H2,D,0,harl,quoin,true);
 hnABCrowGable(0,F+H1+H2,0,W,D,1.2,0,harl,quoin,slate,2);
 /* twin front corner pepperpot bartizans */
 for(const sx of[-1,1]){
  hnABBartizan(sx*(W/2-.14),F+H1-.2,D/2-.14,1.28,H2+1.45,sx*Math.PI/4,harl,quoin,slate);}
 /* central projecting Scottish Tolbooth Bell-Tower (clockless per Free-Clan custom; open bronze muster-belfry!) */
 const tw=4.4,tz=D/2+.9,th=13.6;
 hnSocle(0,0,tz,tw+.28,F,tw+.28,0,stc,quoin);
 hnABHarlBox(0,F,tz,tw,th,tw,0,harl,quoin,true);
 /* grand portal at foot of the Tolbooth tower + bronze contract notice-boards & lance racks */
 vnDoor(0,F,tz+tw/2,0,1.65,2.55,'vStone',quoin,bz,false);
 vnStairs(0,0,tz+tw/2+.65,0,2.4,F,3,'vStone',quoin);
 for(const sx of[-1,1]){
  vB('vWood',sx*4.8,F+.75,D/2+.08,2.2,1.35,.12,0,hC(HPAL.tar));
  vB('hPaint',sx*4.8,F+.85,D/2+.15,1.9,1.05,.04,0,hC(HPAL.stucco[0]));
  vnWin(sx*4.8,F+H1+.85,D/2,0,.95,1.25,'glass','vStone',quoin);
  /* company banner lances racked beside the contract boards */
  for(let k=0;k<3;k++){
   const lx=sx*(3.4+k*.42);
   vPst('vPost',lx,F,D/2+.35,.035,3.4,hC(HPAL.pine[0]));
   vPst('vIron',lx,F+3.35,D/2+.35,.045,.32,bz);}}
 /* Tbilisi carved council balconies flanking the central tower */
 for(const sx of[-1,1]){
  hnABAivani(sx*5.0,F+H1,D/2,0,4.8,1.42,2.65,aiv,hC(HPAL.white),vg,true);}
 /* open stone-and-timber belfry stage with big cast-bronze Muster Bell & tall slate-and-verdigris spire */
 const by=F+th;
 vB('vStone',0,by-.18,tz,tw+.42,.24,tw+.42,0,quoin);
 for(const sx of[-1,1])for(const sz of[-1,1]){
  vPst('vPostS',sx*(tw/2-.28),by,tz+sz*(tw/2-.28),.22,2.85,quoin);}
 /* the Great Bronze Muster Bell hanging in the open belfry */
 kput('hConeG',[0,by+1.15,tz],null,[.78,1.15,.78],bz);
 vBall('hGold',0,by+1.05,tz,.22,bz);
 vB('vStone',0,by+2.85,tz,tw+.36,.24,tw+.36,0,quoin);
 kput('hPyrSc',[0,by+3.05,tz],null,[tw+.7,5.8,tw+.7],slate);
 vPst('vIron',0,by+8.65,tz,.06,1.35,bz);
 vBall('hGold',0,by+9.55,tz,.18,bz);
}

/* 10. hl_rus_law_darbazi — Winter Law-Hall of the Clanthing (Georgian darbazi octagonal swallow-dome + nine clan shields) */
function buildHlRusLawDarbazi(G,o){reseed(27091+(o.v|0));
 const W=17.6,D=13.2,F=.68,H=5.6;
 const stc=hC(HPAL_AB.koshki[0]),harl=hC(HPAL_AB.harl[1]),quoin=hC(HPAL_AB.quoin[0]),slate=hC(HPAL_AB.slate[0]);
 const tar=hC(HPAL.tar[0]),bz=hC(HPAL_AB.bronze[0]),vg=hC(HPAL_AB.verdigris[0]);
 vnReg('Darbazi Winter Law-Hall of the Clanthing',0,0,12.2,17.5);
 /* battered granite plinth + heavy coursed-stone & harled moot walls */
 kput('hBatterRub',[0,0,0],null,[W+.6,F+.8,D+.6],stc);
 vB('vStone',0,F+.68,0,W+.38,.18,D+.38,0,quoin);
 hnABHarlBox(0,F+.8,0,W,H-.8,D,0,harl,quoin,true);
 /* four corner pepperpot bartizans */
 for(const sx of[-1,1])for(const sz of[-1,1]){
  hnABBartizan(sx*(W/2-.15),F+H-2.4,sz*(D/2-.15),1.22,3.3,Math.atan2(sx,sz),harl,quoin,slate);}
 /* flanking crow-stepped roof wings + central stepped octagonal Georgian darbazi swallow-dome! */
 for(const sx of[-1,1]){
  hnABCrowGable(sx*5.4,F+H,0,6.6,D,1.08,0,harl,quoin,slate,sx);}
 vB('vStone',0,F+H,0,7.4,.42,8.2,0,quoin);
 hnABDarbazi(0,F+H+.4,0,4.15,5,tar,bz);
 /* ceremonial carved Law-Portal + row of Nine Cast-Bronze Clan Shields along the frieze */
 const fz=D/2;
 vnDoor(0,F+.8,fz,0,1.85,2.65,'vStone',quoin,tar,false);
 vnStairs(0,0,fz+.85,0,2.8,F+.8,4,'vStone',quoin);
 hnABAivani(0,F+3.65,fz,0,8.8,1.45,2.25,tar,hC(HPAL.white),vg,false);
 for(let i=0;i<9;i++){
  const u=-6.4+i*1.6;
  kput('hDiscG',[u,F+3.18,fz+.1],qEuler(Math.PI/2,0,0),[.32,.05,.32],bz);}
 for(const sx of[-1,1])for(const z of[-3.6,0,3.6]){
  hnNal(sx*W/2,F+1.95,z,sx*Math.PI/2,.92,1.45,'glass',hC(HPAL.white),{accent:bz});}
}

/* 11. hl_rus_thing_ring — The Nine-Stones Thing-Stead, Law-Speaker's Cairn & Bronze Oath-Anvil */
function buildHlRusThingRing(G,o){reseed(27101+(o.v|0));
 const R=9.2,qc=hC(HPAL_AB.quoin[0]),stc=hC(HPAL_AB.koshki[0]),bz=hC(HPAL_AB.bronze[0]),vg=hC(HPAL_AB.verdigris[0]);
 vnReg('Nine-Stones Thing-Stead and Oath-Anvil',0,0,11.8,7.8);
 /* circular cobbled moot pavement + granite kerb ring */
 kput('hOctS',[0,0,0],null,[R+1.6,.22,R+1.6],qc);
 kput('hOctS',[0,.22,0],qEuler(0,Math.PI/8,0),[R+.8,.14,R+.8],stc);
 /* centrepiece: stepped granite Cairn & the Cast-Bronze Oath-Anvil where the Peace of the Nine Stones was sworn */
 kput('hOctS',[0,.36,0],null,[2.2,.42,2.2],qc);
 kput('hOctS',[0,.78,0],null,[1.4,.38,1.4],stc);
 vB('hGoldB',0,1.16,0,.92,.56,.52,0,bz);
 vB('hGoldB',0,1.52,0,1.28,.24,.58,0,bz);
 /* the tall bronze-shod Fir-Sign Pole behind the Law-Speaker's seat (-z) */
 vPst('vPostB',0,.36,-R+.9,.18,6.8,hC(HPAL.tar[0]));
 kput('vConeC',[0,6.65,-R+.9],null,[.62,1.15,.62],vg);
 vBall('hGold',0,7.82,-R+.9,.16,bz);
 /* Nine dressed Clan Monoliths in a ring, each with a stone law-bench & cast-bronze clan boss */
 for(let i=0;i<9;i++){
  const a=(i/9)*TAU+Math.PI,sx=Math.sin(a)*R,sz=Math.cos(a)*R,inw=a+Math.PI;
  const mh=3.15+(i===0?.75:(i%2)*.28);
  vB('vStone',sx,.34,sz,1.18,mh,.56,inw,i===0?qc:stc);
  vB('vStone',sx,.34+mh,sz,1.02,.28,.48,inw,qc);
  /* inward-facing bronze clan crest boss + chief's stone seat */
  const bp=loc(sx,sz,0,.31,inw),sp=loc(sx,sz,0,.68,inw);
  kput('hDiscG',[bp[0],2.15,bp[1]],qEuler(0,inw,0).multiply(qEuler(Math.PI/2,0,0)),[.36,.06,.36],bz);
  vB('vStone',sp[0],.34,sp[1],1.1,.48,.52,inw,qc);}
}

/* 12. hl_rus_bronze_foundry — Reverberatory Bronze Bell & Field-Gun Foundry (copper + tin -> cast bronze) */
function buildHlRusBronzeFoundry(G,o){reseed(27111+(o.v|0));
 const W=17.2,D=12.4,F=.52,H=4.8;
 const stc=hC(HPAL_AB.koshki[0]),harl=hC(HPAL_AB.harl[3]),quoin=hC(HPAL_AB.quoin[1]),slate=hC(HPAL_AB.slate[0]);
 const bz=hC(HPAL_AB.bronze[0]),vg=hC(HPAL_AB.verdigris[0]),tar=hC(HPAL.tar[0]);
 vnReg('Reverberatory bronze bell and gun foundry',0,0,11.4,13.8);
 /* main stone foundry hall on -x + open-air bell & mountain-gun casting yard on +x */
 const hx=-2.6,hw=11.2,hd=10.4;
 hnSocle(hx,0,-.4,hw+.28,F,hd+.28,0,stc,quoin);
 vB('hRubB',hx,F,-.4,hw,2.4,hd,0,stc);
 hnABHarlBox(hx,F+2.4,-.4,hw,H-2.4,hd,0,harl,quoin,true);
 hnABCrowGable(hx,F+H,-.4,hw,hd,1.08,0,harl,quoin,slate,2);
 /* twin stone reverberatory cupola stacks with glowing vEmber tap-mouths (zero electric light) */
 for(const cx of[hx-2.6,hx+2.4]){
  vB('vStone',cx,F,-1.2,2.4,H+4.6,2.4,0,quoin);
  vB('vStone',cx,F+H+4.5,-1.2,2.75,.28,2.75,0,stc);
  vBall('vEmber',cx,F+H+4.85,-1.2,.42,null,.22);
  vB('vDarkB',cx,F+.82,hd/2-.36,1.15,.92,.14,0);
  vBall('vEmber',cx,F+.96,hd/2-.32,.34,null,.2);}
 vnDoor(hx-.1,F,hd/2-.4,0,1.65,2.35,'vStone',quoin,tar,false);
 vnStairs(hx-.1,0,hd/2+.15,0,2.1,F,2,'vStone',quoin);
 hnSign(hx+2.2,F+3.2,hd/2-.4,0,'hammer',1.05);
 /* roofed open-sided casting shed on +x with newly cast bronze bells & mule-gun barrels! */
 const yx=5.6,yw=5.2,yd=9.6;
 vB('hCobble',yx,0,-.4,yw+.4,.22,yd+.4,0,stc);
 for(const sx of[-1,1])for(const sz of[-3.8,0,3.8]){
  vPst('vPostB',yx+sx*(yw/2-.25),.22,-.4+sz,.14,3.45,tar);}
 vnGableRoof(yx,3.65,-.4,yw+.6,yd+.6,1.35,0,'hScaleB',slate,.35,'vGableW',tar,.18);
 /* newly cast bronze church/muster bells + twin cast-bronze mountain field-guns on timber carriages */
 for(const bzZ of[-2.6,-.4]){
  kput('hConeG',[yx-.6,.24,bzZ],null,[.62,.95,.62],bz);
  kput('vConeC',[yx+1.1,.24,bzZ],null,[.52,.82,.52],vg);}
 for(const gz of[1.8,3.4]){
  vB('vWood',yx,.42,gz,1.5,.28,.75,0,tar);
  kput('hDiscG',[yx-.35,.42,gz+.44],qEuler(0,0,0).multiply(qEuler(Math.PI/2,0,0)),[.42,.08,.42],bz);
  kput('hDiscG',[yx-.35,.42,gz-.44],qEuler(0,0,0).multiply(qEuler(Math.PI/2,0,0)),[.42,.08,.42],bz);
  kput('hGoldB',[yx+.35,.72,gz],vQ(0,0,.08),[1.85,.26,.26],bz);}
}

/* 13. hl_rus_burgh_gate — Fortified Burgh Gatehouse (vaulted cobbled pend flanked by twin koshki gate-towers & bartizans) */
function buildHlRusBurghGate(G,o){reseed(27121+(o.v|0));
 const D=9.6,H=8.4;
 const harl=hC(HPAL_AB.harl[0]),quoin=hC(HPAL_AB.quoin[0]),slate=hC(HPAL_AB.slate[0]);
 const stc=hC(HPAL_AB.koshki[0]),aiv=hC(HPAL_AB.aivani[0]),bz=hC(HPAL_AB.bronze[0]),tar=hC(HPAL.tar[0]);
 vnReg('Fortified burgh gatehouse and twin koshki towers',0,0,10.6,19.4);
 /* central 8.6m gatehouse body with open 4.8m vaulted cobbled roadway & iron portcullis teeth */
 hnABPendWall(0,0,0,8.6,H,D,0,0,4.8,4.45,harl,quoin);
 hnABCrowGable(0,H,0,8.6,D,1.15,0,harl,quoin,slate,2);
 for(let px=-1.8;px<=1.8;px+=.6)vPst('vIron',px,3.65,D/2-.45,.04,.95,hC(0x282624));
 /* twin solid 4.8m battered Svaneti-Baronial flank gate-towers at x=+-6.3 (outer faces at +-8.70m for wall socketing) */
 for(const sx of[-1,1]){
  const tx=sx*6.3,th=sx<0?15.2:13.8;
  vB('hRubB',tx,0,0,4.8,H+.4,5.8,0,stc);
  hnABKoshki(tx,0,0,4.8,th,0,stc,quoin,slate,bz);
  hnABBartizan(tx+sx*2.15,H-.6,2.65,1.15,3.25,sx>0?Math.PI/4:-Math.PI/4,harl,quoin,slate);}
 /* overhanging Old Tbilisi watch-gallery above the outer arch + cast-bronze clan discs */
 hnABAivani(0,4.75,D/2,0,6.2,1.25,2.45,aiv,hC(HPAL.white),slate,false);
 for(const sx of[-1.9,1.9]){
  vnWin(sx,5.15,-D/2,Math.PI,.82,1.08,'glass','vStone',quoin);
  kput('hDiscG',[sx,4.05,D/2+.14],qEuler(Math.PI/2,0,0),[.42,.06,.42],bz);}
 vnDoor(3.15,.12,-D/2,Math.PI,.95,1.98,'vStone',quoin,tar,true);
}

/* 14. hl_rus_cobbled_bridge — Quaint granite-and-cobble Humpback Brig with cutwater piers & bronze cressets */
function buildHlRusCobbledBridge(G,o){reseed(27131+(o.v|0));
 const L=14.4,W=6.4,qc=hC(HPAL_AB.quoin[0]),stc=hC(HPAL_AB.koshki[0]),bz=hC(HPAL_AB.bronze[0]);
 vnReg('Humpback cobbled brig',0,0,8.2,5.2);
 /* deep stone abutments + central cutwater pier extending below y=0 into the stream bed */
 for(const sx of[-5.8,5.8]){
  vB('hRubB',sx,-2.4,0,2.8,3.6,W+.35,0,stc);
  vB('vStone',sx,1.05,0,2.95,.24,W+.45,0,qc);}
 vB('hRubB',0,-2.6,0,2.0,4.0,W+.9,0,stc);
 for(const sz of[-1,1]){
  kput('vPyrS',[0,-2.6,sz*(W/2+.55)],qEuler(0,sz>0?0:Math.PI,0),[1.5,3.6,1.2],qc);}
 /* twin open arched stone spans + gently humped cobbled roadway & low stone parapets */
 for(const sx of[-2.9,2.9]){
  vB('vStone',sx,1.18,0,3.25,.42,W+.16,0,qc);
  vB('hCobble',sx,1.62,0,3.3,.22,W-.36,0,stc);}
 vB('hCobble',0,1.74,0,3.4,.26,W-.36,0,stc);
 for(const sx of[-5.4,5.4]){
  const q=vQ(0,0,sx<0?.10:-.10);
  kput('hCobble',[sx,1.42,0],q,[3.4,.24,W-.36],stc);}
 /* stepped stone parapets + central bronze clan-shield & cresset posts */
 for(const sz of[-1,1]){
  const pz=sz*(W/2-.18);
  vB('hRubB',0,1.55,pz,L,.88,.34,0,stc);
  vB('vStone',0,2.38,pz,L+.16,.14,.44,0,qc);
  vB('vStone',0,1.55,pz+sz*.18,1.25,1.28,.32,0,qc);
  vPst('vIron',0,2.82,pz+sz*.18,.045,.68,bz);
  vBall('vEmber',0,3.52,pz+sz*.18,.11,null,.13);}
}

/* 15. hl_rus_burgh_wall — Battered Highland-Caucasus Curtain Wall (+z machicolated parapet, -z timber fighting gallery) */
function buildHlRusBurghWall(G,o){reseed(27141+(o.v|0));
 const W=o.cw==null?14.0:o.cw,D=4.4,HW=8.2;
 const stc=hC(HPAL_AB.koshki[0]),qc=hC(HPAL_AB.quoin[0]),slate=hC(HPAL_AB.slate[0]),tar=hC(HPAL.tar[0]),bz=hC(HPAL_AB.bronze[0]);
 vnReg('Burgh curtain wall',0,0,Math.max(4.5,W*.55),10.8);
 /* solid battered granite core + dressed ashlar cordon */
 vB('hRubB',0,0,0,W,3.4,D+.28,0,stc);
 vB('hRubB',0,3.35,0,W,HW-3.35,D,0,stc.clone().multiplyScalar(1.04));
 vB('vStone',0,HW-.22,0,W+.06,.26,D+.32,0,qc);
 vB('hCobble',0,HW,0,W,.16,D-.2,0,stc);
 /* outer (+z) corbelled machicolations, slate-capped merlons & bronze clan shields */
 const nCor=Math.max(3,Math.round(W/1.45));
 for(let i=0;i<nCor;i++){
  const cx=-W/2+(i+.5)*(W/nCor);
  vB('vStone',cx,HW-.56,D/2+.16,.28,.56,.34,0,qc);}
 vB('vStone',0,HW,D/2+.06,W,.72,.44,0,stc);
 const nMer=Math.max(2,Math.round(W/2.35));
 for(let m=0;m<nMer;m++){
  const mx=-W/2+(m+.5)*(W/nMer),mw=Math.min(1.45,(W/nMer)*.64);
  vB('hRubB',mx,HW+.70,D/2+.06,mw,.88,.44,0,stc);
  vB('hScaleB',mx,HW+1.56,D/2+.06,mw+.14,.16,.54,0,slate);}
 if(W>=8){
  for(const sx of[-W*.26,W*.26]){
   vB('vDarkB',sx,4.6,D/2+.02,.18,1.25,.08,0);
   kput('hDiscG',[sx,6.35,D/2+.08],qEuler(Math.PI/2,0,0),[.34,.06,.34],bz);}}
 /* inner (-z) timber-roofed chemin-de-ronde fighting gallery */
 vB('vWood',0,HW+.85,-D/2+.12,W,.14,.14,0,tar);
 const nPost=Math.max(2,Math.round(W/3.2));
 for(let p=0;p<=nPost;p++){
  const px=-W/2+p*(W/nPost)*0.92+W*0.04;
  vPst('vPost',px,HW,-D/2+.18,.09,2.15,tar);}
 kput('hScaleB',[0,HW+2.25,-D/2+.55],vQ(0,-.26,0),[W,.12,1.65],slate);
}

/* 16. hl_rus_wall_tower — Battered Svaneti-Baronial Curtain Watchtower (machicolated war-head & bartizan) */
function buildHlRusWallTower(G,o){reseed(27151+(o.v|0));
 const BW=7.6,H=14.4;
 const stc=hC(HPAL_AB.koshki[0]),qc=hC(HPAL_AB.quoin[0]),harl=hC(HPAL_AB.harl[1]),slate=hC(HPAL_AB.slate[0]),bz=hC(HPAL_AB.bronze[0]);
 vnReg('Svaneti-Baronial curtain watchtower',0,0,5.6,19.8);
 vB('hRubB',0,0,0,BW+.36,3.8,BW+.36,0,stc);
 hnABKoshki(0,0,0,BW,H,0,stc,qc,slate,bz);
 /* corner Scottish Baronial pepperpot bartizan overlooking the ditch (+z) */
 hnABBartizan(BW/2-.15,H-3.6,BW/2-.15,1.18,3.4,Math.PI/4,harl,qc,slate);
 /* walkway portals on +-x at y=8.2m */
 for(const sx of[-1,1]){
  vnDoor(sx*(BW/2+.02),8.22,0,sx>0?Math.PI/2:-Math.PI/2,.92,1.92,'vStone',qc,hC(HPAL.tar[0]),false);}
}

/* 17. hl_rus_wall_bastion — Heavy Octagonal Highland-Baronial Corner Bastion (triple pepperpot bartizans & bronze guns) */
function buildHlRusWallBastion(G,o){reseed(27161+(o.v|0));
 const R=5.5,H=11.6;
 const stc=hC(HPAL_AB.koshki[0]),qc=hC(HPAL_AB.quoin[0]),harl=hC(HPAL_AB.harl[0]),slate=hC(HPAL_AB.slate[0]),bz=hC(HPAL_AB.bronze[0]);
 vnReg('Baronial pepperpot corner bastion',0,0,6.8,21.4);
 /* solid 9.6x9.6m core + octagonal battered stone drum so wall spans at any corner angle embed cleanly */
 vB('hRubB',0,0,0,9.6,9.2,9.6,0,stc);
 kput('hOctS',[0,0,0],null,[R+.28,4.2,R+.28],stc);
 kput('hOctS',[0,4.15,0],null,[R,H-4.15,R],stc.clone().multiplyScalar(1.05));
 kput('hOctS',[0,H-.32,0],null,[R+.36,.42,R+.36],qc);
 kput('hOctS',[0,H+.08,0],null,[R+.28,1.35,R+.28],harl);
 kput('hTentSc',[0,H+1.4,0],null,[R+.65,5.8,R+.65],slate);
 vPst('vIron',0,H+7.15,0,.06,1.15,bz);vBall('hGold',0,H+8.32,0,.18,bz);
 /* three corbelled pepperpot bartizans & cast-bronze gun-muzzles projecting over the outer faces */
 for(const ang of[-Math.PI*.35,0,Math.PI*.35]){
  const bx=Math.sin(ang)*(R-.15),bz0=Math.cos(ang)*(R-.15);
  hnABBartizan(bx,H-2.8,bz0,1.18,3.45,ang,harl,qc,slate);
  kput('hGoldB',[Math.sin(ang)*(R+.35),H-.85,Math.cos(ang)*(R+.35)],qEuler(0,ang,0),[.24,.24,.95],bz);}
}

/* 18. hl_rus_great_distillery — Chartered Clan-Seat Great Scotch & Highland Whiskey Distillery
   Twin Scottish Doig pagoda-kiln malting towers (-x), crow-stepped Baronial copper pot-still hall (center),
   and vaulted Caucasus marani bonded cask cellar with overhanging Tbilisi aivani tasting gallery (+x). */
function buildHlRusGreatDistillery(G,o){reseed(27171+(o.v|0));
 const vi=(o.v|0)%3;
 const harl=hC(HPAL_AB.harl[vi===0?0:vi===1?4:2]),quoin=hC(HPAL_AB.quoin[vi%4]),slate=hC(HPAL_AB.slate[vi%4]);
 const stc=hC(HPAL_AB.koshki[0]),aiv=hC(HPAL_AB.aivani[vi===0?0:vi===1?3:1]),tar=hC(HPAL.tar[0]);
 const bz=hC(HPAL_AB.bronze[0]),cu=hC(0xc46e34),oak=hC(vPick(HPAL.pine));
 vnReg('Great clan-seat pagoda-kiln scotch distillery (brewers)',0,0,12.2,19.8);
 /* 1. Dressed granite terrace socle across all three wings */
 vB('hRubB',0,0,-.3,20.8,.86,12.6,0,stc);
 vB('vStone',0,.78,-.3,21.0,.14,12.8,0,quoin);
 /* 2. West Wing (-x): Twin Scottish Doig Pagoda Malting Kilns with glowing peat-hearth fireboxes */
 const kx=-6.9,kw=4.5,kd=4.4,kh=5.8;
 for(const kz of[-2.45,2.15]){
  hnABHarlBox(kx,.88,kz,kw,kh,kd,0,harl,quoin,true);
  /* arched peat-kiln firebox on -x / +z with glowing peat embers (lit:false hearth fire) */
  if(kz>0){
   vB('vStone',kx,1.0,kz+kd/2+.06,1.55,1.25,.24,0,quoin);
   vB('vDarkB',kx,1.05,kz+kd/2+.14,.92,.78,.08,0);
   vBall('vEmber',kx,1.32,kz+kd/2+.10,.22,null,.28);}
  vnWin(kx-kw/2-.02,3.4,kz,-Math.PI/2,.62,.95,'glass','vStone',quoin);
  /* two-tier concave-impression slate pagoda roof + louvered cupola + copper hood & bronze vane */
  vnPyrRoof('hPyrSc',kx,.88+kh,kz,kw+.18,kd+.18,2.45,0,slate,.42);
  vB('hRUBoardV',kx,.88+kh+1.95,kz,1.82,1.28,1.82,0,tar);
  for(let f=0;f<4;f++){
   const p=loc(kx,kz,0,.93,f*Math.PI/2);
   hnRoom(p[0],.88+kh+2.18,p[1],1.06,.68,.08,f*Math.PI/2);}
  vnPyrRoof('hPyrSc',kx,.88+kh+3.22,kz,2.24,2.24,1.52,0,slate,.36);
  vPst('vPipeC',kx,.88+kh+4.55,kz,.16,1.15,cu);
  kput('vConeC',[kx,.88+kh+5.62,kz],null,[.38,.48,.38],cu);
  vPst('vIron',kx,.88+kh+6.05,kz,.035,.68,bz);
  vBall('hGold',kx,.88+kh+6.74,kz,.11,bz);}
 /* 3. Center Wing: Crow-stepped Baronial Copper-Still Hall + SE Pepperpot Bartizan */
 const cx=.2,cz=-.6,cw=9.0,cd=8.6,ch=6.8;
 hnABHarlBox(cx,.88,cz,cw,ch,cd,0,harl,quoin,true);
 hnABCrowGable(cx,.88+ch,cz,cw,cd,.76,0,harl,quoin,slate,1);
 hnABBartizan(cx+cw/2-.12,.88+ch-2.3,cz+cd/2-.12,1.16,3.25,Math.PI/4,harl,quoin,slate);
 for(const ux of[-2.8,0,2.8]){
  vnWin(cx+ux,4.55,cz+cd/2,0,1.02,1.68,'glass','vStone',quoin);
  vnWin(cx+ux,4.35,cz-cd/2,Math.PI,.94,1.42,'glass','vStone',quoin);}
 vnDoor(cx-3.1,.88,cz+cd/2+.04,0,1.18,2.18,'vStone',quoin,tar,true);
 vnStairs(cx-3.1,0,cz+cd/2+.78,0,1.45,.88,4,'vStone',quoin);
 /* Open-arched Copper Pot-Still Verandah displaying 3 hammered copper/bronze swan-neck stills & worm tubs */
 const sz=cz+cd/2+1.45,sy=.88;
 vB('hRubB',cx+.7,0,sz,6.8,sy,2.6,0,stc);
 for(const ux of[-2.45,0,2.45,3.85]){
  vPst('vPostB',cx+.7+ux-0.7,sy,sz+1.12,.12,2.75,tar);}
 vnShedRoof(cx+.7,sy+2.75,sz,7.1,2.85,.62,0,'hScaleB',slate,.24,.12);
 for(let si=0;si<3;si++){
  const sx=cx-1.35+si*1.85;
  /* copper onion kettle + helmet + swan neck + inclined lyne arm to worm-tub condenser */
  vPst('vBarrel',sx,sy,sz-.22,.64-.04*si,1.18,cu);
  kput('vDomeC',[sx,sy+1.18,sz-.22],null,[.62-.04*si,.56,.62-.04*si],cu);
  vPst('vPipeC',sx,sy+1.68,sz-.22,.15,.82,cu);
  beam('vPipeC',[sx,sy+2.42,sz-.22],[sx+.72,sy+1.82,sz+.42],.12,.12,cu);
  vPst('vBarrel',sx+.72,sy,sz+.42,.48,1.38,oak);
  vBq('vHoop',sx+.72,sy+1.05,sz+.42,.50,.50,1,qEuler(Math.PI/2,0,0),bz);}
 /* 4. East Wing (+x): Vaulted Caucasus Marani Bonded Cask-Cellar & Overhanging Tbilisi Aivani Gallery */
 const ex=7.2,ez=-.35,ew=4.8,ed=8.2,eh=5.6;
 vB('hRubB',ex,.88,ez,ew+.14,2.55,ed+.14,0,stc);
 hnABHarlBox(ex,3.40,ez,ew,eh-2.52,ed,0,harl,quoin,true);
 hnABCrowGable(ex,.88+eh,ez,ew,ed,.72,Math.PI/2,harl,quoin,slate,-1);
 hnABAivani(ex,3.55,ez+ed/2,0,4.2,1.32,2.42,aiv,hC(HPAL.white),hC(HPAL_AB.verdigris[0]),true);
 /* double iron-bound bonded cellar portal + timber cask-rolling skids + Clan Bronze Medallion */
 vnDoor(ex,.88,ez+ed/2+.08,0,1.65,2.12,'vStone',quoin,tar,true);
 beam('vWood',[ex-.42,.08,ez+ed/2+2.15],[ex-.42,.84,ez+ed/2+.12],.18,.14,tar);
 beam('vWood',[ex+.42,.08,ez+ed/2+2.15],[ex+.42,.84,ez+ed/2+.12],.18,.14,tar);
 kput('hDiscG',[ex+ew/2+.08,4.65,ez],qEuler(0,Math.PI/2,0).multiply(qEuler(Math.PI/2,0,0)),[.54,.06,.54],bz);
 hnSign(ex-ew/2+.25,3.15,ez+ed/2+.12,0,'barrel',1.02);
 /* 5. Bonded export hogsheads, copper mash-tun, malted frostoat sacks & roofed heather-peat stack */
 FURNISH('hl_rep_brew_copper',cx-3.2,0,sz+1.65,0);
 FURNISH('hl_rep_barrel_stack',ex+1.55,0,ez+ed/2+1.65,0);
 FURNISH('hl_rep_barrel_lying',ex-1.35,0,ez+ed/2+1.75,0);
 hnBarrel(ex+2.65,.88,ez-1.6,.36,.88);hnBarrel(ex+2.65,.88,ez-.65,.36,.88);
 hnSacks(kx+1.65,0,4.95,5);
 const px=-8.4,pz=5.15;
 for(let r=0;r<3;r++)vB('hTurfB',px,r*.40,pz,2.5-r*.26,.38,1.55-r*.14,0,hC(0x4a3b2c));
 for(const sx of[-1.3,1.3])for(const sz2 of[-.82,.82])vPst('vPost',px+sx,0,pz+sz2,.07,1.8,tar);
 vnShedRoof(px,1.8,pz,2.85,1.9,.36,0,'vWood',tar,.18,.08);
}

/* 19. hl_rus_capital_distillery — Grand Capital Quadruple-Pagoda Maltings, Copper Still-Hall & Clanthing Spirit Customs Vault
   Ardent's premier royal/Clanthing export maltings: four soaring Doig slate pagoda kilns (-x and +x pairs), a grand double-height
   crow-stepped Baronial Still-Hall with twin pepperpot bartizans & 4 hammered copper/bronze swan-neck pot stills, and a central
   Old Tbilisi overhanging aivani Spirit-Excise & Gauge Gallery stamped with the Bronze Seal of the Nine Clans. */
function buildHlRusCapitalDistillery(G,o){reseed(27181+(o.v|0));
 const harl=hC(HPAL_AB.harl[0]),harlAcc=hC(HPAL_AB.harl[4]),quoin=hC(HPAL_AB.quoin[0]),slate=hC(HPAL_AB.slate[0]);
 const stc=hC(HPAL_AB.koshki[0]),aiv=hC(HPAL_AB.aivani[0]),tar=hC(HPAL.tar[0]),bz=hC(HPAL_AB.bronze[0]),cu=hC(0xc87236),oak=hC(vPick(HPAL.pine));
 vnReg('Capital quadruple-pagoda scotch distillery (brewers)',0,0,14.6,22.2);
 /* 1. Grand dressed-granite customs platform */
 vB('hRubB',0,0,-.2,25.2,.94,14.8,0,stc);
 vB('vStone',0,.86,-.2,25.4,.16,15.0,0,quoin);
 /* 2. Four symmetrical Doig Pagoda Malting Kilns (pairs at x = -9.4 and x = +9.4, z = -2.8 and +2.2) */
 const kw=4.4,kd=4.3,kh=6.4;
 for(const sx of[-1,1]){
  const kx=sx*9.4;
  for(const kz of[-2.8,2.2]){
   hnABHarlBox(kx,.98,kz,kw,kh,kd,0,sx<0?harl:harlAcc,quoin,true);
   if(kz>0){
    vB('vStone',kx,1.08,kz+kd/2+.06,1.58,1.28,.24,0,quoin);
    vB('vDarkB',kx,1.12,kz+kd/2+.14,.94,.80,.08,0);
    vBall('vEmber',kx,1.40,kz+kd/2+.10,.24,null,.30);}
   vnWin(kx+sx*(kw/2+.02),3.8,kz,sx>0?Math.PI/2:-Math.PI/2,.64,.98,'glass','vStone',quoin);
   vnPyrRoof('hPyrSc',kx,.98+kh,kz,kw+.2,kd+.2,2.55,0,slate,.42);
   vB('hRUBoardV',kx,.98+kh+2.02,kz,1.86,1.32,1.86,0,tar);
   for(let f=0;f<4;f++){
    const p=loc(kx,kz,0,.95,f*Math.PI/2);
    hnRoom(p[0],.98+kh+2.25,p[1],1.08,.68,.08,f*Math.PI/2);}
   vnPyrRoof('hPyrSc',kx,.98+kh+3.32,kz,2.28,2.28,1.58,0,slate,.36);
   vPst('vPipeC',kx,.98+kh+4.72,kz,.17,1.22,cu);
   kput('vConeC',[kx,.98+kh+5.86,kz],null,[.40,.50,.40],cu);
   vPst('vIron',kx,.98+kh+6.32,kz,.038,.74,bz);
   vBall('hGold',kx,.98+kh+7.08,kz,.12,bz);}}
 /* 3. Grand Double-Height Central Crow-Stepped Still-Hall + Twin Corner Pepperpot Bartizans */
 const cw=13.2,cd=10.2,ch=8.2,cz=-.6;
 hnABHarlBox(0,.98,cz,cw,ch,cd,0,harl,quoin,true);
 hnABCrowGable(0,.98+ch,cz,cw,cd,.78,0,harl,quoin,slate,2);
 for(const sx of[-1,1]){
  hnABBartizan(sx*(cw/2-.12),.98+ch-2.6,cz+cd/2-.12,1.22,3.55,sx>0?Math.PI/4:-Math.PI/4,harl,quoin,slate);}
 for(const ux of[-4.2,-1.4,1.4,4.2]){
  vnWin(ux,5.65,cz+cd/2,0,1.04,1.82,'glass','vStone',quoin);
  vnWin(ux,5.35,cz-cd/2,Math.PI,.96,1.55,'glass','vStone',quoin);}
 /* Overhanging Tbilisi Aivani Spirit-Gauge & Excise Gallery over the central portal + Great Bronze Clanthing Seal */
 hnABAivani(0,4.15,cz+cd/2,0,5.6,1.38,2.48,aiv,hC(HPAL.white),hC(HPAL_AB.verdigris[0]),true);
 kput('hDiscG',[0,7.65,cz+cd/2+.10],qEuler(Math.PI/2,0,0),[.72,.07,.72],bz);
 vBall('hGold',0,7.65,cz+cd/2+.16,.18,bz);
 /* 4. Open 4-Bay Copper Pot-Still & Worm-Tub Arcade across the front terrace */
 const sz=cz+cd/2+1.65,sy=.98;
 vB('hRubB',0,0,sz,12.4,sy,2.85,0,stc);
 for(const ux of[-5.6,-2.8,0,2.8,5.6]){
  vPst('vPostB',ux,sy,sz+1.22,.13,2.85,tar);}
 vnShedRoof(0,sy+2.85,sz,12.8,3.05,.58,0,'hScaleB',slate,.24,.12);
 vnDoor(0,sy,cz+cd/2+.05,0,1.68,2.25,'vStone',quoin,tar,true);
 vnStairs(0,0,sz+1.95,0,2.2,sy,4,'vStone',quoin);
 for(const sx of[-1,1]){
  for(let k=0;k<2;k++){
   const ux=sx*(2.15+k*2.15);
   vPst('vBarrel',ux,sy,sz-.24,.66-.04*k,1.24,cu);
   kput('vDomeC',[ux,sy+1.24,sz-.24],null,[.64-.04*k,.58,.64-.04*k],cu);
   vPst('vPipeC',ux,sy+1.78,sz-.24,.15,.86,cu);
   beam('vPipeC',[ux,sy+2.54,sz-.24],[ux+sx*.68,sy+1.90,sz+.46],.12,.12,cu);
   vPst('vBarrel',ux+sx*.68,sy,sz+.46,.48,1.42,oak);
   vBq('vHoop',ux+sx*.68,sy+1.08,sz+.46,.50,.50,1,qEuler(Math.PI/2,0,0),bz);}}
 hnSign(-cw/2+.4,3.6,cz+cd/2+.12,0,'barrel',1.08);
 FURNISH('hl_rep_brew_copper',-5.2,0,sz+2.05,0);
 FURNISH('hl_rep_barrel_stack',6.4,0,sz+1.95,0);
 FURNISH('hl_rep_barrel_lying',-7.8,0,sz+2.05,0);
 FURNISH('hl_rep_barrel_lying',8.2,0,sz+2.05,Math.PI);
 hnSacks(-10.4,0,5.6,6);
}

/* 20. hl_rus_cooperage — Clan Whisky Cooperage & Bronze-Hoop Cask-Charring Yard
   Substitutes coopered oak/larch casks across clay-free Free Clans (CONTINENTAL-SCOPE Tier C clay=0) and chars hogsheads for scotch. */
function buildHlRusCooperage(G,o){reseed(27191+(o.v|0));
 const W=10.6,D=8.0,H=6.0;
 const harl=hC(vPick(HPAL_AB.harl)),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const stc=hC(HPAL_AB.koshki[0]),aiv=hC(vPick(HPAL_AB.aivani)),tar=hC(HPAL.tar[0]),bz=hC(HPAL_AB.bronze[0]),oak=hC(vPick(HPAL.pine));
 vnReg('Clan whisky cooperage and charring yard',0,0,8.2,12.8);
 vB('hRubB',-.8,0,-.6,W+.24,.78,D+.24,0,stc);
 hnABHarlBox(-.8,.78,-.6,W,H-.78,D,0,harl,quoin,true);
 hnABCrowGable(-.8,H,-.6,W,D,.74,0,harl,quoin,slate,-1);
 hnABAivani(-.8,3.45,-.6+D/2,0,7.2,1.28,2.38,aiv,hC(HPAL.white),slate,false);
 vnDoor(-2.6,.78,-.6+D/2+.04,0,1.55,2.10,'vStone',quoin,tar,true);
 vnStairs(-2.6,0,-.6+D/2+.76,0,1.75,.78,4,'vStone',quoin);
 for(const ux of[.8,2.9])vnWin(ux,1.85,-.6+D/2,0,.88,1.18,'glass','vStone',quoin);
 hnSign(W/2-1.2,3.05,-.6+D/2+.10,0,'barrel',.96);
 /* Outdoor cobbled cask-charring ring at +x / +z: upturned oak whisky hogshead over a glowing peat/oak ember brazier + bronze hoop anvil */
 vB('hCobble',5.1,0,1.4,3.8,.14,4.8,0,stc);
 vB('vStone',5.1,.14,1.6,1.35,.32,1.35,0,quoin);
 vBall('vEmber',5.1,.52,1.6,.22,null,.28);
 vPst('vBarrel',5.1,.38,1.6,.56,1.18,oak);
 vBq('vHoop',5.1,.68,1.6,.58,.58,1,qEuler(Math.PI/2,0,0),bz);
 vBq('vHoop',5.1,1.26,1.6,.58,.58,1,qEuler(Math.PI/2,0,0),bz);
 /* Stave seasoning pyramid & finished bronze-hooped hogsheads */
 for(let r=0;r<3;r++)vB('vWood',5.2,.14+r*.28,-1.2,1.8-r*.22,.24,2.2-r*.2,0,oak);
 FURNISH('hl_rep_barrel_stack',2.4,0,4.45,0);
 FURNISH('hl_rep_barrel_lying',-.2,0,4.55,0);
}

/* 21. hl_rus_saltpeter_mill — Saltpeter Leaching Vats & Non-Sparking Bronze-Mortar Powder Mill
   Processes Free Clans saltpeter (#4 planetary producer, GoodY 959) with non-sparking tin-bronze stamps for mountain field-guns. */
function buildHlRusSaltpeterMill(G,o){reseed(27201+(o.v|0));
 const W=9.8,D=8.2,H=5.6;
 const stc=hC(HPAL_AB.koshki[0]),quoin=hC(HPAL_AB.quoin[1]),harl=hC(HPAL_AB.harl[3]),slate=hC(HPAL_AB.slate[2]);
 const tar=hC(HPAL.tar[0]),bz=hC(HPAL_AB.bronze[0]),nitre=hC(0xebe7dc),oak=hC(vPick(HPAL.pine));
 vnReg('Saltpeter leaching and bronze powder mill',0,0,8.6,11.8);
 /* Blast-battered Svaneti stone magazine core + light blow-off slate gable */
 kput('hBatterRub',[-1.4,0,-.4],null,[W+.45,3.2,D+.45],stc);
 hnABHarlBox(-1.4,3.15,-.4,W-.35,H-3.15,D-.35,0,harl,quoin,true);
 hnABCrowGable(-1.4,H,-.4,W-.35,D-.35,.68,0,harl,quoin,slate,1);
 vnDoor(-1.4,.12,-.4+D/2+.22,0,1.25,2.05,'vStone',quoin,tar,true);
 for(const ux of[-3.4,1.2])vnWin(ux,4.0,-.4+D/2-.16,0,.56,.88,'shut','vStone',quoin);
 /* Covered nitre-leaching vat & non-sparking cast-bronze stamp-mortar shed at +x */
 const sx=5.0,sz=-.2,sw=4.2,sd=7.4;
 vB('hRubB',sx,0,sz,sw,.62,sd,0,stc);
 for(const ux of[-1.8,1.8])for(const uz of[-3.2,0,3.2])vPst('vPostB',sx+ux,.62,sz+uz,.11,2.65,tar);
 vnShedRoof(sx,3.27,sz,sw+.4,sd+.4,.58,Math.PI/2,'hScaleB',slate,.22,.12);
 for(let k=0;k<3;k++){
  const vz=sz-2.1+k*2.1;
  /* wooden nitre leaching tub with white saltpeter crystal crust + bronze mortar & pestle */
  vPst('vBarrel',sx-.85,.62,vz,.58,.95,oak);
  vPst('vStone',sx-.85,1.52,vz,.52,.08,nitre);
  vPst('hGold',sx+.95,.62,vz,.34,.68,bz);
  vPst('vPost',sx+.95,1.18,vz,.06,1.45,bz);}
 hnSacks(2.2,0,4.35,4);
}

/* 22. hl_rus_caravan_stables — Highland Mount-Drover & Silk-Trail Gun-Limber Caravanserai Stables
   Stages Ardent's #3 planetary mounts export (154 head/yr) and Silk-Trail caravan outriders & wheeled bronze gun-limbers. */
function buildHlRusCaravanStables(G,o){reseed(27211+(o.v|0));
 const W=12.8,D=6.6,H=5.8;
 const harl=hC(vPick(HPAL_AB.harl)),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const stc=hC(HPAL_AB.koshki[1]),aiv=hC(vPick(HPAL_AB.aivani)),tar=hC(HPAL.tar[0]),bz=hC(HPAL_AB.bronze[0]);
 vnReg('Highland mount-drover and caravan stables',0,0,9.4,12.2);
 /* Cobbled courtyard + main north crow-stepped stable range with overhanging Caucasian hay-and-tack aivani */
 vB('hCobble',0,0,1.8,15.2,.12,8.4,0,stc);
 vB('hRubB',0,0,-2.6,W+.24,.65,D+.24,0,stc);
 hnABHarlBox(0,.65,-2.6,W,H-.65,D,0,harl,quoin,true);
 hnABCrowGable(0,H,-2.6,W,D,.72,0,harl,quoin,slate,2);
 hnABAivani(0,3.35,-2.6+D/2,0,10.2,1.25,2.25,aiv,hC(HPAL.white),slate,false);
 for(const ux of[-4.0,-1.35,1.35,4.0]){
  vnDoor(ux,.65,-2.6+D/2+.04,0,1.22,2.08,'vStone',quoin,tar,true);}
 hnSign(-W/2+.5,3.0,-2.6+D/2+.10,0,'horse',1.0);
 /* Hardy Highland mounts, stone watering trough, hay rack & wheeled cast-bronze mountain gun-limber */
 hnRUBeast(-3.6,2.4,.35,'horse');
 hnRUBeast(.4,2.8,-.28,'horse');
 FURNISH('hl_rus_trough',-1.6,0,4.6,0,{v:0});
 FURNISH('hl_rus_hay_rack',-6.2,0,1.8,Math.PI/2,{v:0});
 vB('vWood',4.6,.48,2.6,1.65,.32,2.45,.18,tar);
 kput('hGoldB',[4.6,.82,2.85],qEuler(0,.18,0),[.28,.28,1.75],bz);
 for(const sx of[-.92,.92]){
  kput('hDiscG',[4.6+sx,.52,2.5],qEuler(0,Math.PI/2,0).multiply(qEuler(Math.PI/2,0,0)),[.52,.08,.52],bz);}
}

/* 23. hl_rus_apothecary — Juniper, Sky-Poppy & Ivan-Chai Botanical Still-Shop
   Distills Ardent's #1 map juniper spice, #4 sky-poppy/camphor medical reagents, and highland ivan-chai fireweed tea. */
function buildHlRusApothecary(G,o){reseed(27221+(o.v|0));
 const W=8.4,D=8.2,H=7.4;
 const harl=hC(HPAL_AB.harl[2]),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const stc=hC(HPAL_AB.koshki[0]),aiv=hC(HPAL_AB.aivani[0]),tar=hC(HPAL.tar[0]),cu=hC(0xc87236),bz=hC(HPAL_AB.bronze[0]);
 vnReg('Juniper and sky-poppy apothecary',0,0,5.8,13.2);
 vB('hRubB',0,0,0,W+.22,.72,D+.22,0,stc);
 hnABHarlBox(0,.72,0,W,H-.72,D,0,harl,quoin,true);
 hnABCrowGable(0,H,0,W,D,.78,0,harl,quoin,slate,-1);
 hnABBartizan(W/2-.10,H-2.4,D/2-.10,1.06,3.05,Math.PI/4,harl,quoin,slate);
 /* Turquoise Tbilisi aivani hung with drying sky-poppy (violet), juniper (slate-blue) & ivan-chai herb bundles */
 hnABAivani(-.3,3.75,D/2,0,6.2,1.26,2.35,aiv,hC(HPAL.white),hC(HPAL_AB.verdigris[0]),false);
 for(let i=0;i<5;i++){
  const ux=-2.4+i*1.15;
  kput('vCloth',[ux,3.45,D/2+1.24],null,[.34,.58,1],hC([0x6e3b7c,0x355c6e,0x8e3352,0x3c6b48,0xc48b2c][i]));}
 /* Glazed apothecary bow-window with small gleaming copper botanical alembic + entry door & mortar sign */
 vnDoor(-2.2,.72,D/2+.04,0,1.05,2.08,'vStone',quoin,tar,true);
 vnStairs(-2.2,0,D/2+.72,0,1.35,.72,3,'vStone',quoin);
 vnWin(1.35,1.65,D/2,0,1.95,1.42,'glass','vStone',quoin);
 vPst('vBarrel',1.35,.85,D/2+.22,.28,.55,cu);
 kput('vDomeC',[1.35,1.40,D/2+.22],null,[.26,.24,.26],cu);
 hnSign(-W/2+.35,3.1,D/2+.10,0,'mortar',.92);
}

/* 24. hl_rus_plaid_dyer — Clan Tartan Loom-House & Woad / Falu-Red Bronze-Cauldron Dyeworks
   Weaves highland wool & flax and dyes clan tartans in bronze-rimmed woad, broom & falu-red cauldrons alongside Silk-Trail brocades. */
function buildHlRusPlaidDyer(G,o){reseed(27231+(o.v|0));
 const W=10.4,D=8.4,H=6.6;
 const harl=hC(vPick(HPAL_AB.harl)),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const stc=hC(HPAL_AB.koshki[0]),aiv=hC(HPAL_AB.aivani[1]),tar=hC(HPAL.tar[0]),bz=hC(HPAL_AB.bronze[0]);
 vnReg('Clan tartan loom and woad dyeworks',0,0,7.4,12.8);
 vB('hRubB',-.6,0,-.4,W+.24,.74,D+.24,0,stc);
 hnABHarlBox(-.6,.74,-.4,W,H-.74,D,0,harl,quoin,true);
 hnABCrowGable(-.6,H,-.4,W,D,.74,0,harl,quoin,slate,1);
 hnABAivani(-.6,3.55,-.4+D/2,0,8.2,1.32,2.40,aiv,hC(HPAL.white),slate,false);
 /* Draped clan tartan & Silk-Trail brocade cloth bolts drying along the aivani rail */
 const dyes=[0x22487a,0x9c2822,0xc88c2c,0x2b6848];
 for(let i=0;i<4;i++){
  kput('vCloth',[-3.2+i*1.8,3.62,-.4+D/2+1.34],null,[.86,1.35,1],hC(dyes[i]));}
 vnDoor(-2.8,.74,-.4+D/2+.04,0,1.18,2.10,'vStone',quoin,tar,true);
 vnStairs(-2.8,0,-.4+D/2+.74,0,1.4,.74,4,'vStone',quoin);
 for(const ux of[.4,2.6])vnWin(ux,1.75,-.4+D/2,0,.95,1.22,'glass','vStone',quoin);
 hnSign(-W/2+.1,3.05,-.4+D/2+.10,0,'shears',.94);
 /* Three outdoor stone-&-bronze dye vats (woad blue, falu oxblood, broom gold) over glowing peat hearths at +x */
 for(let k=0;k<3;k++){
  const vz=-2.2+k*2.2;
  vB('hRubB',5.3,0,vz,1.45,.72,1.45,0,stc);
  vBall('vEmber',5.3,.28,vz+.68,.15,null,.18);
  vPst('hGold',5.3,.72,vz,.58,.42,bz);
  vPst('vStone',5.3,1.10,vz,.52,.06,hC(dyes[k]));}
}

/* 25. hl_rus_wynd_house_c — Tall 3.5-Storey Narrow Edinburgh-Tbilisi Forestair & Double-Aivani Wynd House
   Compact 7.2 m street frontage designed to pack narrow cobbled closes shoulder-to-shoulder with dramatic verticality. */
function buildHlRusWyndHouseC(G,o){reseed(27241+(o.v|0));
 const W=7.2,D=7.8,H=9.4;
 const harl=hC(vPick(HPAL_AB.harl)),quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate));
 const stc=hC(vPick(HPAL_AB.koshki)),aiv1=hC(vPick(HPAL_AB.aivani)),aiv2=hC(vPick(HPAL_AB.aivani)),tar=hC(HPAL.tar[0]);
 vnReg('Tall forestair double-aivani wynd house',0,0,5.4,14.8);
 /* Rusticated stone cellar undercroft + external Scottish stone forestair rising along +z to 1st-floor portal */
 vB('hRubB',0,0,0,W+.22,2.35,D+.22,0,stc);
 hnABHarlBox(0,2.35,0,W,H-2.35,D,0,harl,quoin,true);
 hnABCrowGable(0,H,0,W,D,.82,0,harl,quoin,slate,1);
 /* Ground cellar door + external stone forestair landing at (-1.8, 2.35, D/2) */
 vnDoor(1.6,.12,D/2+.10,0,.95,1.88,'vStone',quoin,tar,false);
 vB('hRubB',-1.8,0,D/2+.68,1.85,2.35,1.25,0,stc);
 vnStairs(-.25,0,D/2+.68,Math.PI/2,1.18,2.35,7,'vStone',quoin);
 vnDoor(-1.8,2.35,D/2+.04,0,1.02,2.05,'vStone',quoin,tar,true);
 /* Double-stacked overhanging Old Tbilisi wooden aivani balconies on 2nd and 3rd storeys! */
 hnABAivani(.3,4.85,D/2,0,5.6,1.22,2.22,aiv1,hC(HPAL.white),slate,true);
 hnABAivani(.3,7.15,D/2,0,5.2,1.12,2.08,aiv2,hC(HPAL.white),hC(vPick(HPAL_AB.verdigris)),false);
 for(const ux of[-1.6,1.6]){
  vnWin(ux,3.35,-D/2,Math.PI,.78,1.08,'glass','vStone',quoin);
  vnWin(ux,6.05,-D/2,Math.PI,.76,1.04,'glass','vStone',quoin);}
}

/* 26. hl_rus_close_row — Twin-Gabled Party-Wall Baronial Terrace & Corbelled Turnpyke Stair-Turret
   Two adjoining narrow crow-stepped townhouses in contrasting harl sharing a central chimney wall & cylindrical stair-tower. */
function buildHlRusCloseRow(G,o){reseed(27251+(o.v|0));
 const W1=6.4,W2=6.4,D=7.8,H1=8.2,H2=8.8;
 const h1=hC(HPAL_AB.harl[(o.v|0)%6]),h2=hC(HPAL_AB.harl[((o.v|0)+3)%6]);
 const quoin=hC(vPick(HPAL_AB.quoin)),slate=hC(vPick(HPAL_AB.slate)),stc=hC(vPick(HPAL_AB.koshki));
 const aiv1=hC(vPick(HPAL_AB.aivani)),aiv2=hC(vPick(HPAL_AB.aivani)),tar=hC(HPAL.tar[0]),bz=hC(HPAL_AB.bronze[0]);
 vnReg('Twin-gabled party-wall close terrace',0,0,7.8,14.4);
 /* Left (-x) and Right (+x) party-wall Baronial houses */
 vB('hRubB',-W1/2,0,0,W1+.16,.82,D+.22,0,stc);
 hnABHarlBox(-W1/2,.82,0,W1,H1-.82,D,0,h1,quoin,true);
 hnABCrowGable(-W1/2,H1,0,W1,D,.78,0,h1,quoin,slate,-1);
 vB('hRubB',W2/2,0,0,W2+.16,.82,D+.22,0,stc);
 hnABHarlBox(W2/2,.82,0,W2,H2-.82,D,0,h2,quoin,true);
 hnABCrowGable(W2/2,H2,0,W2,D,.80,0,h2,quoin,slate,1);
 /* Shared central corbelled Baronial turnpyke stair-turret on +z seam */
 hnABBartizan(0,2.85,D/2+.08,1.18,6.25,0,h1,quoin,slate);
 kput('hDiscG',[0,5.2,D/2+1.26],qEuler(Math.PI/2,0,0),[.38,.06,.38],bz);
 /* Contrasting overhanging Tbilisi aivani balconies & paired street thresholds */
 hnABAivani(-W1/2-.2,3.85,D/2,0,4.8,1.22,2.28,aiv1,hC(HPAL.white),slate,true);
 hnABAivani(W2/2+.2,4.35,D/2,0,4.8,1.22,2.28,aiv2,hC(HPAL.white),hC(vPick(HPAL_AB.verdigris)),true);
 for(const sx of[-1,1]){
  const dx=sx*3.4;
  vnDoor(dx,.82,D/2+.04,0,1.02,2.06,'vStone',quoin,tar,true);
  vnStairs(dx,0,D/2+.74,0,1.32,.82,4,'vStone',quoin);
  vnWin(sx*1.8,1.75,D/2,0,.86,1.15,'glass','vStone',quoin);
  vnWin(sx*3.2,4.2,-D/2,Math.PI,.82,1.12,'glass','vStone',quoin);}
}

/* ---------------------------------------------------------------- registry */
HL.def({key:'hl_rus_wynd_house_a',name:'Crow-stepped aivani house',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['single-family dwelling'],'middle',{role:'home'}),w:10,d:10,h:11,build:buildHlRusWyndHouseA});
HL.def({key:'hl_rus_wynd_house_b',name:'Bartizan corner townhouse',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['single-family dwelling'],'middle',{role:'home'}),w:10,d:10,h:13,build:buildHlRusWyndHouseB});
HL.def({key:'hl_rus_wynd_house_c',name:'Tall forestair double-aivani house',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['single-family dwelling'],'middle',{role:'home'}),w:8,d:9,h:15,build:buildHlRusWyndHouseC});
HL.def({key:'hl_rus_close_row',name:'Twin-gabled party-wall close row',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['multi-family dwelling'],'middle',{role:'tenement'}),w:14,d:9,h:14,build:buildHlRusCloseRow});
HL.def({key:'hl_rus_pend_tenement',name:'Pend close tenement',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['multi-family dwelling'],'middle',{role:'tenement'}),w:13,d:11,h:14,build:buildHlRusPendTenement});
HL.def({key:'hl_rus_tower_house',name:'Koshki L-plan tower-house',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['single-family dwelling'],'rich',{role:'manor'}),w:13,d:12,h:17,build:buildHlRusTowerHouse});
HL.def({key:'hl_rus_marani_tavern',name:'Marani cellar and scotch tavern',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['tavern','inn'],'middle',{role:'tavern'}),w:13,d:12,h:14,build:buildHlRusMaraniTavern});
HL.def({key:'hl_rus_wynd_armourer',name:'Clan blade and buckler smithy',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['industry','shop'],'middle',{job:'smithing',role:'armourer'}),w:12,d:11,h:11,build:buildHlRusWyndArmourer});
HL.def({key:'hl_rus_silk_factor',name:'Silk-Trail factor house',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['shop','civic'],'rich',{job:'trading',role:'factor-house'}),w:13,d:12,h:12,build:buildHlRusSilkFactor});
HL.def({key:'hl_rus_cooperage',name:'Clan whisky cooperage and char yard',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['industry','shop'],'middle',{job:'carpentry',role:'cooperage'}),w:15,d:12,h:13,build:buildHlRusCooperage});
HL.def({key:'hl_rus_saltpeter_mill',name:'Saltpeter and bronze powder mill',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['industry'],'middle',{job:'smithing',role:'saltpeter-mill'}),w:16,d:13,h:12,build:buildHlRusSaltpeterMill});
HL.def({key:'hl_rus_caravan_stables',name:'Mount-drover and caravan stables',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['inn','infrastructure'],'middle',{job:'trading',role:'caravan-stables'}),w:17,d:14,h:12,build:buildHlRusCaravanStables});
HL.def({key:'hl_rus_apothecary',name:'Juniper and sky-poppy apothecary',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['shop','civic'],'middle',{job:'healing',role:'apothecary'}),w:10,d:10,h:13,build:buildHlRusApothecary});
HL.def({key:'hl_rus_plaid_dyer',name:'Clan tartan loom and woad dyeworks',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['industry','shop'],'middle',{job:'weaving',role:'plaid-dyer'}),w:13,d:11,h:13,build:buildHlRusPlaidDyer});
HL.def({key:'hl_rus_clan_koshki',name:'Clan koshki keep and lodge',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['civic','single-family dwelling'],'rich',{role:'clan-lodge'}),w:15,d:13,h:18,build:buildHlRusClanKoshki});
HL.def({key:'hl_rus_mercenary_bourse',name:'Free-Company Tolbooth bourse',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['civic','military'],'civic',{role:'mercenary-bourse'}),w:19,d:16,h:23,build:buildHlRusMercenaryBourse});
HL.def({key:'hl_rus_law_darbazi',name:'Darbazi Winter Law-Hall',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['civic'],'civic',{role:'law-hall'}),w:20,d:16,h:17,build:buildHlRusLawDarbazi});
HL.def({key:'hl_rus_thing_ring',name:'Nine-Stones Thing-Stead',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['civic','religious'],'civic',{role:'thing-stead'}),w:23,d:23,h:8,build:buildHlRusThingRing});
HL.def({key:'hl_rus_bronze_foundry',name:'Bronze bell and gun foundry',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['industry'],'middle',{job:'smithing',role:'bronze-foundry'}),w:20,d:15,h:14,build:buildHlRusBronzeFoundry});
HL.def({key:'hl_rus_burgh_gate',name:'Fortified burgh gatehouse',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['military','infrastructure'],'civic',{job:'customs',role:'burgh-gate'}),w:18,d:11,h:19,build:buildHlRusBurghGate});
HL.def({key:'hl_rus_cobbled_bridge',name:'Humpback cobbled brig',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['infrastructure'],'civic',{role:'bridge'}),w:15,d:8,h:5,build:buildHlRusCobbledBridge});
HL.def({key:'hl_rus_burgh_wall',name:'Burgh machicolated curtain wall',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['military','infrastructure'],'civic',{role:'wall'}),w:14,d:5,h:10,build:buildHlRusBurghWall});
HL.def({key:'hl_rus_wall_tower',name:'Svaneti-Baronial curtain tower',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['military'],'civic',{role:'wall-tower'}),w:10,d:10,h:20,build:buildHlRusWallTower});
HL.def({key:'hl_rus_wall_bastion',name:'Baronial pepperpot corner bastion',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['military'],'civic',{role:'bastion'}),w:13,d:13,h:21,build:buildHlRusWallBastion});
HL.def({key:'hl_rus_great_distillery',name:'Great pagoda-kiln scotch distillery',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['industry','shop'],'rich',{job:'brewing',role:'great-distillery'}),w:22,d:17,h:20,build:buildHlRusGreatDistillery});
HL.def({key:'hl_rus_capital_distillery',name:'Capital quadruple-pagoda distillery',branch:'rustic',family:'Baronial and clan burgh',tags:HRU_TAG(['industry','civic','shop'],'rich',{job:'brewing',role:'capital-distillery'}),w:26,d:19,h:22,build:buildHlRusCapitalDistillery});
