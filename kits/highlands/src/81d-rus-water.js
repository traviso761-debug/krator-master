/* ================================================================= HIGHLANDS / RUSTIC — Lake, fjord & riverfront (81d)
   Novgorodian and Carpathian highland watercraft, log-cribwork (ryazh) quays, boatyards, patrol boathouses, headland
   fire-beacons, fishing stages and cable ferries for Reed Lake, Klippeport (Lake lbl=77), Slussport and mountain rivers.
   No electric light. Seeds 26300-26399. */

/* ---------------------------------------------------------------- watercraft & cribwork helpers (prefix hnRU) */

/* North-Rus' ryazh log-cribwork wharf cell: notched log walls filled with fieldstone ballast and decked in heavy planks */
function hnRUCrib(x,y,z,w,h,d,ry,logC,deckC){
 const rot=ry==null?0:ry,lc=logC||hC(vPick(HPAL.tar)),dc=deckC||hC(vPick(HPAL.aged));
 vB('hRubB',x,y,z,w-.28,h-.14,d-.28,rot,hC(vPick(HPAL.rubble)));
 hnLogBox(x,y,z,w,h-.14,d,rot,lc,.26);
 vB('vWood',x,y+h-.14,z,w+.24,.14,d+.24,rot,dc);}

/* Clinker-built Novgorodian lake lodya / skiff / river barge: raked stem & sternposts, ribs, thwarts & horse-head prow */
function hnRUScow(x,y,z,ry,L,W,hullC,trimC,opts){
 const rot=ry==null?0:ry,hc=hullC||hC(vPick(HPAL.tar)),tc=trimC||hC(HPAL.red),o=opts||{};
 const P=(u,v)=>loc(x,z,u,v,rot);
 /* flat-keel bottom + flared clinker side strakes */
 let p=P(0,0);vB('vWood',p[0],y,p[1],W*.62,.16,L*.78,rot,hc);
 for(const s of[-1,1]){
  const q1=P(s*W*.38,0),q2=P(s*W*.48,0);
  kput('vWood',[q1[0],y+.38,q1[1]],vQ(rot,0,s*-.42),[.09,.62,L*.84],hc);
  vB('hPaint',q2[0],y+.66,q2[1],.09,.1,L*.82,rot,tc);}
 /* raked bow (+z) and stern (-z) posts; optional carved Slavic horse-head stem finial */
 for(const e of[-1,1]){
  const a=P(0,e*L*.38),b=P(0,e*L*.5),c=P(0,e*L*.53);
  beam('vWood',[a[0],y+.08,a[1]],[b[0],y+.85,b[1]],.16,.18,hc);
  if(o.prow!==false&&e>0){
   beam('hPaint',[b[0],y+.82,b[1]],[c[0],y+1.32,c[1]],.14,.16,tc);
   const h0=P(0,L*.56);kput('hPaint',[h0[0],y+1.34,h0[1]],vQ(rot,.25,0),[.14,.2,.36],hC(HPAL.ochre));}}
 /* internal U-ribs & rower thwarts */
 const nr=Math.max(3,Math.round(L/1.6));
 for(let i=1;i<nr;i++){const v=-L*.34+L*.68*i/nr,rp=P(0,v);
  vB('vWood',rp[0],y+.16,rp[1],W*.72,.08,.1,rot,hc.clone().multiplyScalar(1.15));
  if(i%2===1)vB('vWood',rp[0],y+.52,rp[1],W*.88,.07,.24,rot,hc.clone().multiplyScalar(1.25));}
 if(o.mast){const mp=P(0,L*.06);vPst('vPost',mp[0],y+.16,mp[1],.09,L*.58,hc.clone().multiplyScalar(1.2));
  const yp=P(0,L*.06);vB('vWood',yp[0],y+L*.46,yp[1],W*1.45,.08,.08,rot,hc);
  vB('vClothB',yp[0],y+L*.4,yp[1],W*1.35,.22,.22,rot,hC(HPAL.white));}
 if(o.shields){
  for(const s of[-1,1])for(let k=-2;k<=2;k++){
   const sp=P(s*(W*.5+.02),k*L*.14);
   hnRUShield(sp[0],y+.58,sp[1],rot+(s>0?Math.PI/2:-Math.PI/2),.32,tc,hC(HPAL.ochre));}}}

/* ================================================================ LAKE AND RIVERFRONT */

/* 1. hl_rus_boatyard — Novgorodian lodya & lake-scow timber slipway, boat-shed, pitch cauldron & rib-frames on stocks */
function buildHlRusBoatyard(G,o){reseed(26301+(o.v|0));const SX=-1.8,SZ=-3.2,SW=9.4,SD=11.2,SH=4.1;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.88,1.02)),tar=hC(vPick(HPAL.tar)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),red=hC(HPAL.red),rub=hC(vPick(HPAL.rubble));
 vnReg('Novgorodian boatyard and slipway (shipwrights)',0,0,11.8,SH+5.4);
 /* shallow lake/river water apron at the foot of the greased log slipway (+z) */
 vB('hRUWater',0,-.03,8.4,22,.08,5.8,0);
 vB('hRubB',0,0,5.2,22,.28,.65,0,rub);
 /* open-fronted timber boat-building hall on heavy log posts */
 vB('vFlag',SX,-.02,SZ,SW+.6,.1,SD+.6,0,hC(0x787066));
 for(const z of[-SD/2+.3,-SD/6,SD/6,SD/2-.3])for(const s of[-1,1]){
  const x=SX+s*(SW/2-.22);vB('vStone',x,0,SZ+z,.55,.3,.55,0,rub);vPst('vPostB',x,.3,SZ+z,.16,SH-.3,tar);}
 vB('hRUBoardV',SX,0,SZ-SD/2+.12,SW-.3,SH,.14,0,log);
 vB('hRUBoardV',SX+SW/2-.12,0,SZ,.14,2.2,SD-.4,0,log);
 for(const s of[-1,1])vB('vWood',SX+s*(SW/2-.22),SH-.22,SZ,.26,.24,SD+.2,0,tar);
 hnRUShingle(SX,SH,SZ,SD,SW,1.05,Math.PI/2,sh,white,'horns',.75,'hGableLog',log);
 hnForm('hFormT',SX,SH+1.1,SZ+SD/2+.04,0,2.8,1.35);
 /* enclosed shipwright's loft & tool cabin along -x (provides locked door & nalichniki windows) */
 const cx=SX-SW/2-2.1,cz=SZ-.6,cw=3.8,cd=8.2,ch=2.9;
 hnSocle(cx,0,cz,cw+.2,.38,cd+.2,0);hnRULogBox(cx,.38,cz,cw,ch,cd,0,log,.26);
 vnShedRoof(cx,.38+ch,cz,cw+.4,cd+.4,.75,-Math.PI/2,'vShingleB',sh,.3,.14);
 vnDoor(cx,.38,cz+cd/2,0,.98,1.98,'hPaint',white,red,false);vnStairs(cx,0,cz+cd/2+.45,0,1.35,.38,2,'vStone',rub);
 hnNal(cx-cw/2,.38+.9,cz,-Math.PI/2,.78,.95,'glass',white,{accent:red});
 /* greased log slipway rollers from inside shed into the water */
 for(let k=0;k<11;k++){const rz=SZ-3.6+k*1.32,ry=Math.max(.04,.38-k*.032);
  kput('hLogX',[SX,ry,rz],null,[4.2,.14,.14],tar);}
 /* half-built Novgorodian lodya hull on keel-blocks: keelson, curved stem/sternposts & exposed oak futtock ribs */
 const hy=.52,hz=SZ+.6,hl=9.6,hw=2.8;
 vB('vWood',SX,hy,hz,.28,.32,hl*.82,0,tar);
 beam('vWood',[SX,hy+.1,hz+hl*.38],[SX,hy+1.65,hz+hl*.52],.2,.22,tar);
 beam('vWood',[SX,hy+.1,hz-hl*.38],[SX,hy+1.45,hz-hl*.5],.2,.22,tar);
 kput('hPaint',[SX,hy+1.78,hz+hl*.55],vQ(0,.25,0),[.16,.24,.42],red);
 for(let i=-4;i<=4;i++){const rz=hz+i*.88,span=hw*(1-.035*i*i);
  for(const s of[-1,1])beam('vWood',[SX+s*.12,hy+.18,rz],[SX+s*span*.52,hy+1.15,rz],.11,.11,log.clone().multiplyScalar(1.08));}
 for(const s of[-1,1])kput('vWood',[SX+s*hw*.38,hy+.48,hz],vQ(0,0,s*-.48),[.08,.48,hl*.76],log);
 /* side boatyard at +x: smoking pine-tar pitch cauldron hearth, sawpit, seasoned oak timber stack & sign */
 const px=6.8,pz=-1.8;
 vB('hRubB',px,0,pz,1.8,.52,1.8,0,rub);vBall('vEmber',px,.26,pz+.88,.18,null,.1);
 vPst('vBarrel',px,.48,pz,.55,.72,hC(0x221e1a));kput('hRUDisc',[px,1.15,pz],null,[.48,.04,.48],hC(0x141210));
 FURNISH('hl_rep_sawpit',7,0,-5.8,Math.PI/2);
 FURNISH('hl_rep_timber_stack',7.2,0,2.2,Math.PI/2);
 FURNISH('hl_rep_workbench',cx-.2,0,cz+cd/2+1.8,0);
 hnSign(SX+SW/2-.15,SH-.4,SZ+SD/2,0,'axe',.95);vnFolk(3.4,3.4,2,1.8);}

/* 2. hl_rus_patrol_boathouse — Fortified lake/fjord ostrog patrol-cutter boathouse & watch-pier */
function buildHlRusPatrolBoathouse(G,o){reseed(26311+(o.v|0));const BX=-2.8,BZ=-1.6,BW=8.6,BD=12.4,BH=3.8;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.08,1.25)),log=hC(vPick(HPAL.pine)).multiplyScalar(.88),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.74),white=hC(HPAL.white),red=hC(HPAL.red);
 vnReg('Ostrog patrol boathouse (coast guard)',0,0,11.4,14.2);
 /* water slipway & lakefront channel */
 vB('hRUWater',0,-.03,6.8,20,.08,7.8,0);
 vB('hRUWater',BX,-.02,BZ+.8,4.6,.09,BD,0);
 /* twin ryazh log-cribwork wet-piers flanking the sheltered boat-basin */
 for(const s of[-1,1]){
  hnRUCrib(BX+s*3.15,0,BZ,2.2,1.15,BD,0,tar,log);
  hnRULogBox(BX+s*3.15,1.15,BZ,1.9,BH-1.15,BD-.4,0,tar,.26);}
 /* rear log wall + arched water-gate lintel across the +z slip mouth */
 hnRULogBox(BX,1.15,BZ-BD/2+.9,BW-.4,BH-1.15,1.8,0,tar,.28);
 vB('hLogB',BX,3.05,BZ+BD/2-.6,BW-.2,BH-3.05,1.2,0,tar);
 kput('hKeelW',[BX,3.15,BZ+BD/2+.06],null,[2.2,1.05,.14],white);
 hnRUShingle(BX,BH,BZ,BD,BW,1.08,Math.PI/2,sh,red,'horns',.75,'hGableLog',tar);
 hnRUDragons(BX,BH,BZ,BD,BW,1.08*BW/2,Math.PI/2,.75,tar.clone().multiplyScalar(1.2),1);
 /* armed lake-guard cutter moored inside the wet-slip */
 hnRUScow(BX,.05,BZ+1.8,0,9.4,2.35,tar,red,{mast:true,shields:true,prow:true});
 /* fortified ostrog log watchtower &ryazh pier on +x flank */
 const tx=5,tz=-1.8,tw=4.8,th=5.4;
 hnRUCrib(tx,0,tz+1.8,6.4,1.15,14.2,0,tar,log);
 hnRULogBox(tx,1.15,tz,tw,th,tw,0,tar,.3);
 vnDoor(tx,1.15,tz+tw/2,0,1.02,2,'vWood',tar,red,false);
 vnStairs(tx,0,tz-tw/2-1.2,Math.PI,1.5,1.15,4,'vWood',tar);
 for(let k=0;k<4;k++){const a=k*Math.PI/2,p=loc(tx,tz,0,tw/2,a);vnWin(p[0],1.15+3.1,p[1],a,.58,.72,'shut','hPaint',white);}
 /* cantilevered oblom lookout gallery & shatyor spire */
 const yO=1.15+th,ow=6;
 vB('vWood',tx,yO-.08,tz,ow,.18,ow,0,tar);
 hnRULogBox(tx,yO+.1,tz,ow,1.95,ow,0,log,.28,true);
 for(let k=0;k<4;k++){const a=k*Math.PI/2,p=loc(tx,tz,0,ow/2,a);vnWin(p[0],yO+.68,p[1],a,.65,.72,'shut','hPaint',red);}
 const tip=hnTent(tx,yO+2.05,tz,ow*.76,4.8,'hTentSh',sh);
 vPst('vIron',tx,tip-.25,tz,.045,1.15,hC(0x2e2a26));vBall('hGold',tx,tip+.55,tz,.12,hC(HPAL.gold[0]));
 /* watch-pier signal cresset, spear rack, mooring bollards & guard banner */
 FURNISH('hl_tri_fire_cage',tx+1.6,1.15,tz+6.8,0);
 FURNISH('hl_rus_spear_rack',tx-1.4,1.15,tz+4.2,0);
 vnBannerPole(tx+2.4,1.15,tz+7.8,0,6,red);
 for(const zz of[3.5,6.5,8.2])vPst('vPostB',tx-2.8,1.15,tz+zz,.15,.55,tar);
 hnRUFolk(tx,1.15,tz+5.4,2,1.2);}

/* 3. hl_rus_beacon — Headland stone-and-log lake fire-beacon tower (mayak) with iron cresset brazier & keeper's turf hut */
function buildHlRusBeacon(G,o){reseed(26321+(o.v|0));const TX=2.2,TZ=-1.2;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.08,1.25)),log=hC(vPick(HPAL.pine)).multiplyScalar(.88),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),rub=hC(vPick(HPAL.rubble)),cu=hC(0x4d7a62);
 vnReg('Headland fire-beacon tower (lighthouse)',0,0,8.8,18.8);
 /* rocky headland promontory & water edge at +z */
 vB('hRUWater',0,-.03,7.2,16.8,.08,3.2,0);
 for(const [rx,rz,sx,sy,sz] of[[TX-3.2,TZ+3.6,3.4,1.1,2.4],[TX+3.4,TZ+3.4,3.2,1.2,2.6],[TX,TZ-3.8,5.2,1.3,2.8]])
  kput('vRock',[rx,sy*.35,rz],qEuler(0,rr(0,TAU),0),[sx*.55,sy*.55,sz*.55],rub);
 /* battered dry-stone headland base + octagonal tarred-log shaft */
 const F=4.1,SH=6.6,R=2.35;
 kput('hBatterRub',[TX,0,TZ],null,[6.4,F,6.4],rub);
 vPst('hOctS',TX,F-.25,TZ,R+.35,.38,hC(vPick(HPAL.ashlar)));
 vnStairs(TX,0,TZ+4.25,0,1.6,1.25,4,'vStone',hC(vPick(HPAL.ashlar)));
 vnDoor(TX,1.25,TZ+2.92,0,1.02,2.05,'vStone',hC(vPick(HPAL.ashlar)),tar,false);
 kput('hOctL',[TX,F,TZ],null,[R,SH,R],tar);
 for(let k=0;k<4;k++){const a=k*Math.PI/2;
  hnNal(TX+Math.sin(a)*(R*.94),F+2.2,TZ+Math.cos(a)*(R*.94),a,.55,.88,'glass',white,{accent:hC(HPAL.red)});
  hnRoom(TX+Math.sin(a+.78)*(R*.94),F+4.5,TZ+Math.cos(a+.78)*(R*.94),.2,.82,.1,a+.78);}
 /* cantilevered watch-gallery & stone-paved fire-deck at y=10.7 */
 const yD=F+SH,DW=5.8;
 for(let i=-1;i<=1;i++){
  kput('hLogX',[TX,yD-.2,TZ+i*1.4],null,[DW+.3,.2,.2],tar);
  kput('hLogX',[TX+i*1.4,yD-.4,TZ],qEuler(0,Math.PI/2,0),[DW+.3,.2,.2],tar);}
 vB('vStone',TX,yD,TZ,DW,.28,DW,0,hC(vPick(HPAL.ashlar)));
 for(let k=0;k<4;k++){const a=k*Math.PI/2,f=loc(TX,TZ,0,DW/2-.06,a);
  kput('hLaceB',[f[0],yD+.75,f[1]],qEuler(0,a,0),[DW-.2,.95,1],white);
  vB('vWood',f[0],yD+1.22,f[1],DW,.1,.14,a,tar);}
 /* blazing wrought-iron fire-cresset brazier under an open 8-post copper-clad pyramid spark-hood */
 vPst('hRusDisc',TX,yD+.28,TZ,1.15,.55,rub);
 for(let k=0;k<8;k++){const a=k/8*TAU;
  vPst('vIron',TX+Math.sin(a)*.95,yD+.82,TZ+Math.cos(a)*.95,.045,1.25,hC(0x221e1a));
  vPst('vPost',TX+Math.sin(a)*2.15,yD+.28,TZ+Math.cos(a)*2.15,.11,3.15,tar);}
 for(const yy of[yD+1.25,yD+1.85])vBq('vHoop',TX,yy,TZ,.98,.98,1,qEuler(Math.PI/2,0,0),hC(0x221e1a));
 vBall('vEmber',TX,yD+1.45,TZ,.78,null,.68);vBall('vEmber',TX,yD+1.95,TZ,.48,null,.55);
 hnTent(TX,yD+3.4,TZ,2.75,3.6,'hTentSc',cu);
 vPst('vIron',TX,yD+6.8,TZ,.05,1.2,hC(0x2e2a26));vBall('hGold',TX,yD+7.95,TZ,.14,hC(HPAL.gold[0]));
 /* beacon-keeper's turf-roofed log cottage & pitch/cordwood store at -x */
 const kx=-4.8,kz=.6,kw=4.6,kd=4.4,kh=2.35;
 hnSocle(kx,0,kz,kw+.2,.38,kd+.2,0);hnRULogBox(kx,.38,kz,kw,kh,kd,0,log,.26);
 const kTop=hnRUTurf(kx,.38+kh,kz,kw,kd,.92,0,.45,'hGableLog',log,8);
 vnDoor(kx,.38,kz+kd/2,0,.92,1.85,'vWood',log,tar,false);vnStairs(kx,0,kz+kd/2+.42,0,1.25,.38,2,'vStone',rub);
 hnNal(kx-kw/2,.38+.85,kz,-Math.PI/2,.65,.75,'glass',white,{accent:hC(HPAL.red)});
 hnStoneChimney(kx-1.2,.38+kh-.7,kz-.9,kTop-.38-kh+1.05,.58);
 hnWoodpile(kx,0,kz-kd/2-.95,0,3.8,1.5);hnBarrel(kx+2.8,0,kz+1.8,.34,.85);hnBarrel(kx+2.8,0,kz+2.65,.34,.85);
 vnFolk(-1.6,4.2,1,.8);}

/* 4. hl_rus_quay — Log-cribwork stone-ballasted lake/river barge quay, timber sheerlegs crane & transit cargo shed */
function buildHlRusQuay(G,o){reseed(26331+(o.v|0));const QW=25.6,QD=6.4,QH=1.35;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.88,1.02)),tar=hC(vPick(HPAL.tar)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),ochre=hC(HPAL.ochre),aged=hC(vPick(HPAL.aged));
 vnReg('Log-cribwork barge quay (quay)',0,0,13.6,10.8);
 /* lake / navigable river channel along +z */
 vB('hRUWater',0,-.03,6.4,QW,.08,7.6,0);
 /* continuous row of 4 North-Rus' ryazh log-cribwork stone-ballasted wharf caissons */
 for(let i=0;i<4;i++)hnRUCrib(-9.6+i*6.4,0,-.4,6.3,QH,QD,0,tar,aged);
 /* mooring bollards along the quay face + wooden access stair down to water */
 for(let i=0;i<6;i++)vPst('vPostB',-11+i*4.4,QH,2.45,.16,.58,tar);
 vnStairs(-9.2,0,3.4,Math.PI,1.6,QH,4,'vWood',tar);
 /* loaded flat-bottomed highland cargo barge moored alongside the quay */
 hnRUScow(3.2,.04,5.1,Math.PI/2,11.6,3.1,tar,hC(HPAL.red),{prow:true});
 hnCrate(1.4,.22,5.1,.85,.1,log);hnCrate(2.5,.22,5.1,.8,.25,aged);
 hnBarrel(4.2,.22,4.85,.34,.82);hnBarrel(4.9,.22,5.25,.34,.82);hnSacks(5.8,.22,5.05,4);
 /* guyed timber sheerlegs cargo crane on the quay deck hoisting a slung crate */
 const cx=-2.4,cz=1.8;
 for(const s of[-1.15,1.15])beam('vWood',[cx+s,QH,cz-.6],[cx,QH+6.8,cz+1.85],.17,.17,tar);
 beam('vWood',[cx,QH+6.8,cz+1.85],[cx,QH,cz-3.1],.15,.15,tar);
 vPst('vRope',cx,QH+2.2,cz+1.85,.03,4.6,hC(0x3a322a));
 vB('vWood',cx,QH+1.45,cz+1.85,.88,.72,.88,.2,log);
 FURNISH('hl_rep_winch',cx,QH,cz-1.6,0);
 FURNISH('hl_rep_weighing_beam',-6.8,QH,.4,0);
 /* round-log wharfinger's office & transit cargo warehouse behind the quay (-z) */
 const sx=2.2,sz=-6.2,sw=13.2,sd=5.8,shH=3;
 hnSocle(sx,0,sz,sw+.26,QH,sd+.26,0);hnRULogBox(sx,QH,sz,sw,shH,sd,0,log,.32,true);
 hnRUShingle(sx,QH+shH,sz,sw,sd,1.08,0,sh,white,'horns',.75,'hGableLog',log);
 hnForm('hFormT',sx-sw/2-.03,QH+shH+.95,sz,-Math.PI/2,2.4,1.15);hnForm('hFormT',sx+sw/2+.03,QH+shH+.95,sz,Math.PI/2,2.4,1.15);
 vnDoor(sx-3.8,QH,sz+sd/2,0,1.05,2.05,'hPaint',white,hC(HPAL.red),false);
 hnDoorway(sx+1.8,QH,sz+sd/2,0,2.1,2.2,{double:true,c:tar});
 for(const u of[-5.4,-1.4,4.8])hnNal(sx+u,QH+.88,sz+sd/2,0,.78,.98,'glass',white,{accent:ochre});
 hnSignBoard(sx+1.8,QH+shH+.15,sz+sd/2+.06,0,3.4,.75,'sack',ochre);
 hnSacks(sx+5.4,QH,.6,5);hnBarrel(sx-5.8,QH,1.2,.35,.88);hnRUFolk(0,QH,1.2,3,4);}

/* 5. hl_rus_fishdock — Timber pile fishing stage, Slavic veshala net-drying racks, fish-smoking shed & dory skiff */
function buildHlRusFishdock(G,o){reseed(26341+(o.v|0));
 const log=hC(vPick(HPAL.aged)).multiplyScalar(rr(.92,1.06)),tar=hC(vPick(HPAL.tar)),sh=hC(vPick(HPAL.shingle)),turf=hC(vPick(HPAL.turf)),white=hC(HPAL.white),red=hC(HPAL.red),rub=hC(vPick(HPAL.rubble));
 vnReg('Timber fishing stage and smokehouse (fishers)',0,0,11.6,8.4);
 /* lake/river water across front (+z) */
 vB('hRUWater',0,-.03,5.2,22,.08,8.8,0);
 vB('hRubB',0,0,.4,22,.35,.8,0,rub);
 /* shore fisher's salt-and-gear log hut at -x, -z */
 const hx=-5.2,hz=-4.6,hw=7.2,hd=5.2,hh=2.55;
 hnSocle(hx,0,hz,hw+.2,.45,hd+.2,0);hnRULogBox(hx,.45,hz,hw,hh,hd,0,log,.28);
 const hTop=hnRUTurf(hx,.45+hh,hz,hw,hd,.94,0,.5,'hGableLog',log,10);
 vnDoor(hx+1.4,.45,hz+hd/2,0,.95,1.92,'vWood',log,red,false);vnStairs(hx+1.4,0,hz+hd/2+.45,0,1.3,.45,2,'vStone',rub);
 hnNal(hx-1.6,.45+.85,hz+hd/2,0,.78,.92,'glass',white,{shutters:true,accent:hC(HPAL.blue)});
 hnStoneChimney(hx-2,.45+hh-.8,hz-1.1,hTop-.45-hh+1.05,.6);
 hnSign(hx+hw/2-.2,.45+2.2,hz+hd/2,0,'fish',.88);
 /* tall board fish-smoking koptil'nya shed at +x, -z */
 const kx=2.8,kz=-5,kw=2.8,kd=2.8,kh=3.6;
 vB('hRubB',kx,0,kz,kw+.2,.55,kd+.2,0,rub);
 hnRUBoards(kx,.55,kz,kw,kh-.55,kd,0,tar,null,white,.48);
 vnDoor(kx,.55,kz+kd/2,0,.85,1.82,'vWood',tar,red,false);vnStairs(kx,0,kz+kd/2+.42,0,1.15,.55,2,'vStone',rub);
 vnPyrRoof('vPyrSh',kx,kh,kz,kw,kd,1.75,0,sh,.35);
 vPst('vPipeR',kx,kh+1.45,kz,.16,.75,hC(0x2e2a26));
 /* T-shaped timber pile fishing stage extending over the water + moored clinker dory skiff */
 const dy=1.05;
 vB('vWood',-1.2,dy-.14,3.4,4.2,.14,6.4,0,log);
 vB('vWood',-1.2,dy-.14,7.1,11.6,.14,2.8,0,log);
 for(const [px,pz] of[[-3,1.2],[.6,1.2],[-3,3.8],[.6,3.8],[-6.6,6],[-1.2,6],[4.2,6],[-6.6,8.2],[-1.2,8.2],[4.2,8.2]])
  vPst('vPostB',px,-.05,pz,.13,dy+.55,tar);
 vnLadder(4.6,0,7.1,Math.PI/2,dy+.2,tar);
 hnRUScow(6.8,.03,7.1,.12,6.8,1.95,log,hC(HPAL.blue),{prow:true});
 /* Slavic veshala gill-net drying racks, fish-splitting rack, net pile, wicker versha traps & salt barrels */
 hnRUVeshala(7.2,0,-3.2,.15,4.8,2.65,log,[0x6e5c48,0x7c6a54,0x5a4c3c]);
 FURNISH('pa_fish_rack',-4.2,dy,7.1,0);FURNISH('pa_net_pile',2.2,dy,7.2,.4);
 for(let i=0;i<3;i++)kput('vConeT',[6.2+i*.95,.24,-.4],qEuler(Math.PI/2,.3*i,0),[.28,.95,.28],hC(0x9a8256));
 hnBarrel(-2.6,dy,2.2,.32,.8);hnBarrel(-2.6,dy,3,.32,.8);hnRUFolk(-1.2,dy,5.8,2,1.5);}

/* 6. hl_rus_ferry — Mountain river/lake cable-ferry (parom) landing stage, capstan winch hut, waiting shelter & timber scow */
function buildHlRusFerry(G,o){reseed(26351+(o.v|0));
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.9,1.04)),tar=hC(vPick(HPAL.tar)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),red=hC(HPAL.red),ochre=hC(HPAL.ochre),rub=hC(vPick(HPAL.rubble));
 vnReg('Cable-ferry landing and scow (ferry)',0,0,11.8,8.8);
 /* river/lake crossing channel across +z & sloped cobble-and-plank slipway ramp */
 vB('hRUWater',0,-.03,5.8,22.4,.08,9.2,0);
 vB('hCobble',0,0,-2.8,5.4,.42,8.4,0,hC(0x888078));
 beam('vWood',[0,.4,.9],[0,.05,3.8],5.2,.16,tar);
 for(let k=0;k<8;k++)vB('vWood',0,.38-k*.042,1.1+k*.36,5,.06,.12,0,log);
 /* twin ryazh log-cribbed guide-dolphins flanking the ferry berth */
 for(const s of[-1,1]){
  hnRUCrib(s*3.8,0,2.2,1.8,1.25,3.8,0,tar,log);
  vPst('vPostB',s*3.8,1.25,3.4,.18,1.1,tar);}
 /* braced timber cable-anchor tower & guide cables stretching across the crossing */
 const tx=-6.8,tz=1.4;
 vB('hRubB',tx,0,tz,2.2,.45,2.2,0,rub);
 for(const sx of[-.75,.75])for(const sz of[-.75,.75])beam('vWood',[tx+sx,.45,tz+sz],[tx+sx*.35,6.8,tz+sz*.35],.14,.14,tar);
 vB('vWood',tx,6.7,tz,1.2,.2,1.2,0,tar);
 beam('vRope',[tx,6.75,tz],[tx,4.6,10.2],.035,.035,hC(0x2e2a26));
 beam('vRope',[tx+.4,1.15,tz],[tx+.4,.85,10.2],.03,.03,hC(0x2e2a26));
 /* log capstan-winch & ferryman's toll hut at -x, -z */
 const wx=-6.8,wz=-4.8,ww=4.6,wd=4.6,wh=2.75;
 hnSocle(wx,0,wz,ww+.2,.4,wd+.2,0);hnRULogBox(wx,.4,wz,ww,wh,wd,0,log,.28,true);
 vnPyrRoof('vPyrSh',wx,.4+wh,wz,ww,wd,2.1,0,sh,.55);
 vnDoor(wx+1,.4,wz+wd/2,0,.95,1.95,'hPaint',white,red,false);vnStairs(wx+1,0,wz+wd/2+.42,0,1.25,.4,2,'vStone',rub);
 hnNal(wx-1.1,.4+.88,wz+wd/2,0,.72,.88,'glass',white,{accent:red});
 FURNISH('hl_rep_winch',wx-2.8,0,-1.4,0);
 /* carved Slavic passenger & pack-train waiting shelter at +x, -z */
 const px=6.2,pz=-4.4,pw=6.4,pd=4.4,ph=2.75;
 hnSocle(px,0,pz,pw+.24,.4,pd+.24,0);
 hnRULogBox(px-1.4,.4,pz,3.2,ph,pd-.2,0,log,.26);
 vnDoor(px-1.4,.4,pz+pd/2-.1,0,.95,1.95,'hPaint',white,ochre,false);
 for(const u of[.8,2.8])hnTotemPost(px+u,.4,pz+pd/2-.2,.14,ph,0);
 vB('hLogB',px+1.6,.4,pz-pd/2+.18,3,.95*ph,.24,0,log);
 hnRUShingle(px,.4+ph,pz,pw,pd,1.1,0,sh,white,'bird',.68,'hGableLog',log);
 vnStairs(px,0,pz+pd/2+.45,0,2.4,.4,2,'vStone',hC(vPick(HPAL.ashlar)));
 FURNISH('hl_rus_porch_bench',px+1.6,.4,pz-.6,0,{v:0});
 hnSign(px+pw/2-.2,.4+2.3,pz+pd/2,0,'horse',.88);
 /* flat-bottomed timber cable-ferry scow (parom) docked at the ramp with loading apron & farm cart aboard */
 const fy=.12,fz=6.8,fw=4.6,fl=6.2;
 vB('vWood',0,fy,fz,fw,.34,fl,0,tar);vB('vWood',0,fy+.34,fz,fw-.2,.08,fl-.2,0,log);
 /* hinged bow & stern loading ramps */
 beam('vWood',[0,fy+.28,fz-fl/2],[0,.14,fz-fl/2-1.35],fw-.5,.1,log);
 beam('vWood',[0,fy+.28,fz+fl/2],[0,.24,fz+fl/2+1.2],fw-.5,.1,log);
 /* carved side rails & cable guide-sheave posts on the port side */
 for(const s of[-1,1]){
  hnDeckRail([s*(fw/2-.12),fy+.42,fz-fl/2+.2],[s*(fw/2-.12),fy+.42,fz+fl/2-.2],0,white,.95);
  if(s<0)for(const dz of[-2.2,2.2]){vPst('vPostB',s*(fw/2+.08),fy+.2,fz+dz,.11,1.35,tar);kput('hRUDisc',[s*(fw/2+.2),fy+1.1,fz+dz],qEuler(0,0,Math.PI/2),[.18,.06,.18],hC(0x2e2a26));}}
 beam('vRope',[tx+.4,.98,fz-2.2],[-fw/2-.2,fy+1.1,fz-2.2],.028,.028,hC(0x2e2a26));
 hnFurn('hl_rus_cart',.3,fy+.42,fz+.2,0,{v:0},0,.77);
 hnRUFolk(-1.1,fy+.42,fz-.8,2,.8);vnFolk(4.6,-1.2,2,1.2);}

/* ---------------------------------------------------------------- registry */
HL.def({key:'hl_rus_boatyard',name:'Novgorodian boatyard',branch:'rustic',family:'Lake and riverfront',tags:HRU_TAG(['industry'],'middle',{job:'shipwrighting',role:'shipwright'}),w:24,d:23,h:10,build:buildHlRusBoatyard});
HL.def({key:'hl_rus_patrol_boathouse',name:'Ostrog patrol boathouse',branch:'rustic',family:'Lake and riverfront',tags:HRU_TAG(['military','infrastructure'],'civic',{role:'coastguard'}),w:22,d:22,h:15,build:buildHlRusPatrolBoathouse});
HL.def({key:'hl_rus_beacon',name:'Headland fire-beacon',branch:'rustic',family:'Lake and riverfront',tags:HRU_TAG(['infrastructure'],'civic',{landmark:true,role:'lighthouse'}),w:18,d:18,h:19,build:buildHlRusBeacon});
HL.def({key:'hl_rus_quay',name:'Log-cribwork barge quay',branch:'rustic',family:'Lake and riverfront',tags:HRU_TAG(['infrastructure','industry'],'middle',{job:'warehousing',role:'quay'}),w:27,d:22,h:11,build:buildHlRusQuay});
HL.def({key:'hl_rus_fishdock',name:'Timber fishing stage',branch:'rustic',family:'Lake and riverfront',tags:HRU_TAG(['industry'],'poor',{job:'fishing',role:'fishdock'}),w:23,d:21,h:8,build:buildHlRusFishdock});
HL.def({key:'hl_rus_ferry',name:'Cable-ferry landing',branch:'rustic',family:'Lake and riverfront',tags:HRU_TAG(['infrastructure'],'middle',{role:'ferry'}),w:24,d:23,h:9,build:buildHlRusFerry});
