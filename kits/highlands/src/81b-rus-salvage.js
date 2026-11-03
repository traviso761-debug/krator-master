// ================================================================= HIGHLANDS / RUSTIC — the salvage farms (round 10)
// Travis: "give the Rustic and Tribal sets some post-apoc and reclaimed buildings". The Norse/Alpine villages take the
// Ancient wreck as it lies — a fuel tank, a pair of shipping containers, a curved hull panel, a corrugated silo — and
// build their own world round it: log and board, turf and shingle, dragon heads on the ridges, falu red, painted
// shields. No electric light (the branch has none). All born reclaimed (tags.salvage): no `_reclaimed` twins.
// Uses the salvage kit of 79b–79d (hTankC, hTankEnd, hVault, hSiloC, hnCont, hContC, hnCable). Seeds 25000–25099.

// ---------------------------------------------------------------- 1. the tank stue
// A spent fuel tank on a fieldstone footing is the house; a turf gable on log posts is built right over it as a
// weather roof (the tank sweats), dragon heads on both apexes; a log vestibule with its own little turf gable against
// the flank, windows sawn into the plate, a stovepipe through the turf, goats, a woodpile, a hay rack.
function buildHlRusTankStue(G,o){reseed(25001+(o.v|0));const R=2.1,L=9,yc=.45+R;
 const rust=hC(vPick(HSV.rust)),log=hC(vPick(HPAL.aged)).multiplyScalar(rr(.9,1.05)),dk=log.clone().multiplyScalar(.72),rub=hC(vPick(HPAL.rubble));
 vnReg('Tank stue',0,0,6.5,11);
 vB('hRubB',0,0,0,L-.6,.5,2.6,0,rub);
 kput('hTankC',[0,yc,0],qEuler(0,0,Math.PI/2),[R,L,R],rust);
 kput('hTankEnd',[L/2,yc,0],null,[R*.42,R,R],rust);kput('hTankEnd',[-L/2,yc,0],qEuler(0,Math.PI,0),[R*.42,R,R],rust);
 for(const x of[-L/2+.3,-1.5,1.5,L/2-.3])kput('vHoop',[x,yc,0],qEuler(0,Math.PI/2,0),[R*.985,R*.985,1],rust.clone().multiplyScalar(.6));
 vnPatch(-2.8,yc-.8,R*.93,0,1.8,1.2,3);
 for(const x of[-3,2.6])vnWin(x,yc-.35,R*.97,0,.8,.75,'shut','vWood',log);
 vnWin(L/2+R*.42-.05,yc-.2,0,Math.PI/2,.6,.6,'open','vWood',log);
 // the weather roof: log posts on stones, plates, a turf gable, dragons
 const H=yc+R+.5,W=L+1.4,D=2*R+1.8;
 for(const sx of[-1,-.33,.33,1])for(const sz of[-1,1]){const x=sx*(W/2-.3),z=sz*(D/2-.2);vB('vStone',x,0,z,.5,.25,.5,0,rub);vPst('vPostB',x,.25,z,.14,H-.25,log);}
 for(const sz of[-1,1])kput('hLogX',[0,H-.1,sz*(D/2-.2)],null,[W+.2,.16,.16],log);
 const pitch=.95,top=hnRUTurf(0,H,0,W,D,pitch,0,.5,null,null);hnRUDragons(0,H,0,W,D,pitch*D/2,0,.5,dk,.9);
 vnChimney(-1.2,yc+R*.9,-.6,top-yc-R*.9+.2,.12,true);
 // the vestibule
 const vz=R+.75;hnLogBox(1,.45,vz,2.4,2.2,1.5,0,log,.26);vnDoor(1,.45,vz+.76,0,.9,1.85,'vWood',log,dk,false);
 hnRUTurf(1,2.65,vz,1.9,2.4,.9,Math.PI/2,.3,'hGableLog',log,2);vnStairs(1,0,vz+1.15,0,1.2,.45,2,'vStone',rub);
 hnRUShield(-.35,1.7,vz,-Math.PI/2,.4,hC(HPAL.red),hC(HPAL.white));
 hnWoodpile(-W/2-.4,0,-.5,Math.PI/2,3.6,1.4);hnBarrel(-2.2,0,R+1,.32,.8);
 hnRUHesje(-1,-D/2-2.4,0,6);hnRUBeast(W/2+1.8,1.5,2.2,'goat');hnRUBeast(W/2+1.2,3,1.2,'goat');
 vnFence(0,0,.8,W+5,D+6.5,0,hC(vPick(HPAL.aged)),2,1);vnFolk(-2.5,vz+2,1,1);}

// ---------------------------------------------------------------- 2. the container chalet
// Two shipping containers side by side, their paint scrubbed back and the whole length done over in falu red, are the
// ground storey (byre and store); a log storey on them under a low, wide shingle gable weighted with stones (Alpine),
// a carved balcony full of geraniums along the front, an outside stair, the crest on the gable, a stovepipe.
function buildHlRusContChalet(G,o){reseed(25011+(o.v|0));const L=12,Y2=2.6,H2=2.6,D=5.4;
 const falu=hC(vPick(HPAL.falu)).lerp(hC(0x8a7a68),rr(.1,.3)),log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.85,1)),tar=hC(vPick(HPAL.tar)),sh=hC(vPick(HPAL.shingle));
 vnReg('Container chalet',0,0,8,Y2+H2+3);
 hnCont(0,0,-1.25,0,L,falu.clone().multiplyScalar(.92),{});hnCont(0,0,1.25,0,L,falu,{});
 for(const x of[-4.5,-1.5,3.8])vnWin(x,1.05,2.47,0,.8,.7,'shut','vWood',hC(HPAL.white));
 vnDoor(1.2,.02,2.47,0,1.1,2.1,'vWood',hC(HPAL.white),tar,false);
 vB('vWood',0,Y2,0,L+.6,.2,D,0,tar);                                                                      // sole plate
 hnLogBox(0,Y2+.2,0,L+.4,H2,D,0,log,.3);
 for(const x of[-4,0,4])vnWin(x,Y2+1.1,D/2,0,.8,.9,'shut','vWood',log);vnDoor(-2,Y2+.2,D/2,0,.9,1.95,'vWood',log,tar,false);
 const pitch=.44,y0=Y2+.2+H2,over=1.1,top=hnGable(0,y0,0,L+.4,D,pitch,0,'vShingleB',sh,over,'vGableW',log);
 hnBarge(0,y0,0,L+.4,D,pitch*D/2,0,over,tar,'lace');
 for(const s of[-1,1])for(let k=0;k<7;k++){const v=s*rr(.8,D/2+over-.3);kput('vRock',[-L/2+.4+k*(L-.8)/6+rr(-.3,.3),top-Math.abs(v)*pitch+.28,v],qEuler(rng(),rng(),0),[rr(.28,.4),.22,rr(.26,.36)],hC(vPick(HPAL.rubble)));}
 for(const s of[-1,1])hnRUShield(s*(L/2+.22),y0+.6,0,s*Math.PI/2,.5,hC(HPAL.red),hC(HPAL.teal));
 hnRUBalcony(0,Y2+.2,D/2,0,L-1,1.3,tar,tar,true);
 vnStairs(L/2+1,0,1.2,Math.PI/2,1.1,Y2+.2,9,'vWood',tar);
 vnChimney(3.5,y0,-1.3,top-y0+.6,.12,true);
 hnWoodpile(-L/2-.6,0,-.4,Math.PI/2,4,1.6);hnRUTrough(-3,4.2,0,2.4);hnRUBeast(-3,6,0,'cow');hnRUBeast(2.4,6.2,-.3,'cow');
 vnFence(0,0,1.2,L+6,D+8,0,hC(vPick(HPAL.aged)),2,1);vnFolk(4,4.5,2,1.2);}

// ---------------------------------------------------------------- 3. the hull naust
// A Norse boathouse: two long fieldstone walls roofed by a curved panel of rocket hull, ribs and all, turf and moss
// creeping over the crown; the back stepped in planks under the arc, the front open on the slip; a longboat on its
// rollers inside with shields along the rail; dragon heads on both ends of the hull.
function buildHlRusHullNaust(G,o){reseed(25021+(o.v|0));const L=16,R=4.6,arc=Math.PI*.84,he=Math.cos(arc/2)*R,hw=Math.sin(arc/2)*R,eave=2.2,yc=eave-he;
 const hull=hC(vPick([0x9a968c,0x8e8a80,0xa49e90])),rust=hC(vPick(HSV.rust)),rub=hC(vPick(HPAL.rubble)),tar=hC(vPick(HPAL.tar)),plank=hC(vPick(HPAL.aged));
 vnReg('Hull naust',0,0,10,yc+R+1.5);
 for(const s of[-1,1])vB('hRubB',s*(hw-.45),0,0,.9,eave+.05,L,0,rub);
 kput('hVault',[0,yc,0],qEuler(0,Math.PI/2,0),[L,R,R],hull);
 for(let k=0;k<=7;k++)kput('hVaultR',[0,yc,-L/2+L*k/7],qEuler(0,Math.PI/2,0),[.26,R+.05,R+.05],rust);
 for(let k=0;k<26;k++){const a=rr(-arc*.3,arc*.3),zz=rr(-L/2+.5,L/2-.5);kput('vLeaf',[Math.sin(a)*(R+.06),yc+Math.cos(a)*(R+.06),zz],qEuler(0,rng()*TAU,-a),[rr(.3,.6),rr(.12,.2),rr(.3,.6)],hC(vPick([0x5f7a3a,0x6f8a44,0x4f6a34])));}
 for(let u=-hw+.4;u<hw;u+=.8){const h=yc+Math.sqrt(Math.max(0,R*R-u*u))-.1;vB('hPlankB',u,0,-L/2+.1,.82,h,.14,0,plank);}
 hnRUDragons(0,yc+R-.25,0,L,.1,0,Math.PI/2,.1,tar,1.1);
 // the slip: a timber ramp and rollers out of the front
 for(let k=0;k<6;k++)kput('hLogX',[0,.12,L/2+.8+k*1.1],null,[3.6,.12,.12],plank);
 // the longboat
 const bw=2.4,bl=11,bc=tar;for(let k=0;k<5;k++)kput('hLogX',[0,.12,-4+k*2],null,[3,.12,.12],plank);
 vB('vWood',0,.25,0,.28,.35,bl,0,bc);
 for(const s of[-1,1]){kput('vWood',[s*bw*.32,.95,0],qEuler(0,0,s*-.55),[.1,1.15,bl-1.4],bc);kput('vWood',[s*bw*.5,1.5,0],null,[.1,.12,bl-2],hC(HPAL.red));
  for(let k=0;k<7;k++)hnRUShield(s*(bw*.5+.02),1.25,-3.9+k*1.3,s>0?Math.PI/2:-Math.PI/2,.34,hC(vPick([HPAL.red,HPAL.teal,HPAL.ochre,HPAL.white])),hC(vPick([HPAL.black,HPAL.white])));}
 for(const e of[-1,1]){const a=[0,.4,e*(bl/2-.4)],b=[0,1.7,e*(bl/2+.4)],c=[0,2.6,e*(bl/2+.2)];beam('vWood',a,b,.2,.24,bc);beam('vWood',b,c,.18,.2,bc);
  kput('vConeI',[0,2.75,e*(bl/2+.05)],vQ(e>0?0:Math.PI,Math.PI/2,0),[.1,.4,.14],hC(HPAL.red));}
 beam('vWood',[0,.5,1],[0,6,1],.14,.14,bc);
 for(let k=0;k<4;k++)hnBarrel(hw+.9,0,-L/2+2+k*1.1,.3,.8);hnWoodpile(-hw-.9,0,0,Math.PI/2,6,1.2);vnFolk(2.5,L/2+3,2,1.5);}

// ---------------------------------------------------------------- 4. the silo stabbur
// A corrugated grain silo, its roof long gone, stood on a fieldstone ring: the village crowned it with a log loft
// that oversails it on corbels (as a stabbur oversails its posts), under a steep shingle gable with dragon heads;
// a door cut at the foot, a ladder to the loft, the hay racks and the cart of a farm around it.
function buildHlRusSiloStabbur(G,o){reseed(25031+(o.v|0));const R=2.3,SH=7.2,W=5.8,H=2.3;
 const corr=hC(vPick(HSV.corr)).lerp(hC(vPick(HSV.rust)),rr(.1,.45)),rub=hC(vPick(HPAL.rubble)),log=hC(vPick(HPAL.pine)).multiplyScalar(.9),tar=hC(vPick(HPAL.tar)),sh=hC(vPick(HPAL.shingle));
 vnReg('Silo stabbur',0,0,6,SH+H+4.5);
 vPst('hTRDisc',0,0,0,R+.4,.5,rub);kput('hSiloC',[0,.5,0],null,[R,SH-.5,R],corr);
 for(const yy of[1.6,3.6,5.6])kput('vHoop',[0,yy,0],qEuler(Math.PI/2,0,0),[R+.03,R+.03,1.2],hC(vPick(HSV.rust)));
 vnPatch(-1,1.4,R-.05,0,1.6,1.8,3);vnDoor(0,.5,R+.02,0,1,2,'vWood',log,tar,false);
 for(let k=0;k<6;k++){const a=k/6*TAU+.3;kput('vWood',[Math.sin(a)*(R-.1),SH-.35,Math.cos(a)*(R-.1)],vQ(a,-.6,0),[.24,.9,.3],log);}   // corbels
 vB('vWood',0,SH,0,W+.4,.22,W+.4,0,tar);hnLogBox(0,SH+.22,0,W,H,W,0,log,.3);
 vnWin(0,SH+1,W/2,0,.6,.6,'shut','vWood',log);vnDoor(-1.6,SH+.22,W/2,0,.8,1.7,'vWood',log,tar,false);
 const pitch=1.15,y0=SH+.22+H,rise=pitch*W/2;hnGable(0,y0,0,W,W,pitch,0,'vShingleB',sh,.6,'vGableW',log);hnRUDragons(0,y0,0,W,W,rise,0,.6,tar,.8);
 vnLadder(-1.6,0,W/2+.6,0,SH+.4,log);
 hnRUHesje(-6,3,Math.PI/2,6);hnRUHesje(6,-1,Math.PI/2,5);hnRUCart(4.5,4,.6);hnBarrel(2.4,0,R+.9,.3,.8);vnFolk(-2.5,R+3,1,1);}

// ---------------------------------------------------------------- 5. the scrap-iron market
// A long open market hall on log posts under a turf gable, its gable ends boarded with salvaged container doors and
// hull plates; smiths' and tinkers' stalls inside selling pots, blades and sheet; a container turned into a
// shopfront beside it, a painted signboard with the scales, shields over the posts.
function buildHlRusScrapMarket(G,o){reseed(25041+(o.v|0));const W=14,D=7,H=3;
 const log=hC(vPick(HPAL.aged)),tar=hC(vPick(HPAL.tar)),rub=hC(vPick(HPAL.rubble));
 vnReg('Scrap-iron market',0,0,9,H+5);
 vB('vStone',0,0,0,W+.6,.25,D+.6,0,rub);
 for(let i=0;i<=4;i++)for(const s of[-1,1]){const x=-W/2+W*i/4;vPst('vPostB',x,.25,s*(D/2-.1),.15,H-.25,log);if(s>0&&i%2===0)hnRUShield(x,H-.7,D/2+.05,0,.38,hC(vPick([HPAL.red,HPAL.teal])),hC(HPAL.white));}
 for(const s of[-1,1])kput('hLogX',[0,H-.1,s*(D/2-.1)],null,[W+.3,.18,.18],log);
 const pitch=.9,top=hnRUTurf(0,H,0,W,D,pitch,0,.6,null,null);hnRUDragons(0,H,0,W,D,pitch*D/2,0,.6,tar,.8);
 for(const e of[-1,1]){const x=e*(W/2+.02);vB('vCorr',x,.25,-1.2,.08,H-.25,2.3,0,hC(vPick(HCONT)));vB('vRustB',x,.25,1.4,.06,H-.4,2,0,null);
  for(let u=-D/2+.4;u<D/2;u+=.8){const h=Math.max(.1,(D/2-Math.abs(u))*pitch);vB('vPlateW',x,H,u,.08,h,.78,0,null);}}
 hnRUStall(-4,0,0,3,2.2,'pots');hnRUStall(0,0,0,3,2.2,'goods');hnRUStall(4,0,0,3,2.2,'pots');
 for(let k=0;k<4;k++)kput(vPick(['vPlate','vSheet']),[-5+k*3.3,.5,-2.6],qEuler(-.2,0,rr(-.2,.2)),[1.6,1.1,1],null);
 hnCont(0,0,-D/2-2.4,0,9,hContC(),{shop:true});hnSignBoard(0,3.1,-D/2-1.1,0,3.4,.8,'scales',hC(HPAL.ochre));
 hnRUCart(W/2+2.5,3,.4);hnRUTrough(-W/2-1.8,2,Math.PI/2,2);hnRUBeast(-W/2-2.8,4.2,0,'horse');
 vnFolk(0,D/2+2.5,5,4);}

HL.def({key:'hl_rus_tank_stue',name:'Tank stue',branch:'rustic',family:'Salvage',tags:HTAG_SALV('poor',['single-family dwelling']),w:18,d:16,h:11,build:buildHlRusTankStue});
HL.def({key:'hl_rus_cont_chalet',name:'Container chalet',branch:'rustic',family:'Salvage',tags:HTAG_SALV('middle',['multi-family dwelling','farm']),w:20,d:16,h:10,build:buildHlRusContChalet});
HL.def({key:'hl_rus_hull_naust',name:'Hull naust',branch:'rustic',family:'Salvage',tags:HTAG_SALV('middle',['industry','warehouse']),w:14,d:26,h:9,build:buildHlRusHullNaust});
HL.def({key:'hl_rus_silo_stabbur',name:'Silo stabbur',branch:'rustic',family:'Salvage',tags:HTAG_SALV('middle',['farm']),w:16,d:14,h:15,build:buildHlRusSiloStabbur});
HL.def({key:'hl_rus_scrap_market',name:'Scrap-iron market',branch:'rustic',family:'Salvage',tags:HTAG_SALV('middle',['market/shop']),w:20,d:20,h:9,build:buildHlRusScrapMarket});
