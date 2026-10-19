// ================================================================= 73t. TALIA: the civic set, the temple, the memorials, the east gate (kits/talia/PLAN.md section 4)
// Seeds 9751-9799. Byzantine leads the temple and the skyline, Indian the memorials and the gate (PLAN.md section 2).
// Civic: lit and gilt. The temple keeps the Talei's pairing of the Sun and the Giant in its images only (LORE; PLAN.md
// section 10): a gilt sun and a banded green disc on the two leaves of its door.

// Temple (refs/talia fancy.jpg; the rose front from talia-temple.jpg): a white Byzantine cluster on a podium, the
// monumental axial stair with an orange runner and gilt-balled newels; a frontispiece rising in a pointed gable over
// the pointed portal and the star rose; tall pointed cobalt windows between buttress pilasters; four corner drum
// towers under orange ribbed melon domes; the central egg dome on a tall drum of cobalt windows with gilt ribs and a
// lantern; an apse of cobalt windows at the back. A named landmark: above the civic height band (VASSAL-KITS.md).
function buildTalTemple(G,o){reseed(9751+(o.v|0));const P=3,BW=28,BD=30,H=14,Z0=-4,zf=Z0+BD/2,TR=2.6,DR=7,FW=12,FH=21.5,SN=18,YB=P+.12+H;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile)),green=vC(0x3f7a5a),gdark=vC(0x2c5a40);
 vnReg('Temple (civic)',0,Z0,BW/2+2,40,{style:'byzantine',type:['religious','civic']});
 // the podium, its balustrades, the stair with its runner, cheeks and newels
 const PF=Z0+BD/2+2;vB('taMarble',0,0,Z0,BW+6,P,BD+4,0,mb);vB('taMarble',0,P,Z0,BW+6.2,.12,BD+4.2,0,wh);vB('vPlaster',0,P-.7,PF+.02,BW+6,.24,.06,0,or);
 const run=SN*.32,ang=Math.atan2(P,run);vnStairs(0,0,PF+run/2,0,12,P,SN,'taMarble',mb);
 kput('vPlaster',[0,P/2+.1,PF+run/2],vQ(0,ang,0),[4,.03,Math.hypot(run,P)-.2],or);
 for(const s of[-1,1]){kput('taMarble',[s*6.25,P/2+.45,PF+run/2],vQ(0,ang,0),[.5,.9,Math.hypot(run,P)+.2],mb);vB('taMarble',s*6.25,0,PF+run+.15,.6,1.0,.6,0,mb);kput('taGiltBall',[s*6.25,1.22,PF+run+.15],null,[.22,.22,.22],gi);
  tanBalustrade(s*11.8,P+.12,PF-.1,0,10.4,mb,1.0,{ball:gi,gilt:gi});tanBalustrade(s*(BW/2+2.9),P+.12,Z0,s*Math.PI/2,BD+3.8,mb,1.0,{ball:gi,gilt:gi});
  vnLampPost(s*7.6,0,PF+run+.6,3.6);}
 for(const s of[-1,1])tanBalustrade(s*(9.3+(BW+5.8)/4-4.65),P+.12,Z0-BD/2-1.9,Math.PI,(BW+5.8)/2-9.3,mb,1.0,{ball:gi,gilt:gi});
 // the body: buttress pilasters and pointed cobalt windows down the sides, an orange coping
 vnBody('vPlaster',0,P+.12,Z0,BW,H,BD,0,wh,{t:.4});vB('vPlaster',0,YB,Z0,BW+.3,.3,BD+.3,0,or);
 for(const s of[-1,1]){for(let k=0;k<6;k++)tanPilaster(s*BW/2,P+.12,Z0-12.5+k*5,s*Math.PI/2,.9,H,wh,or);
  for(let k=0;k<5;k++)tanArch(s*BW/2,P+2,Z0-10+k*5,s*Math.PI/2,1.8,7,{kind:'point',fill:'C',band:or,bw:.18,sill:wh});}
 for(const s of[-1,1]){tanArch(s*9.5,P+2,zf,0,1.8,6.5,{kind:'point',fill:'C',band:or,bw:.18,sill:wh});tanOculus(s*9.5,P+11,zf,0,.9,'C',or,false);}
 // the frontispiece: the pointed gable, the portal with the Sun and the Giant on its leaves, the star rose
 const ff=zf+1.5;vB('vPlaster',0,P+.12,zf+.75,FW,FH-P-.12,1.5,0,wh);kput('vGablePl',[0,FH,zf+.75],vQ(Math.PI/2,0,0),[1.5,4,FW+.4],wh);
 vB('vPlaster',0,FH-.2,zf+.75,FW+.5,.25,1.7,0,or);tanFinial(0,FH+3.9,zf+.75,.26,gi);
 for(const s of[-1,1])tanPilaster(s*(FW/2-.2),P+.12,ff,0,.8,FH-P-.3,wh,gi);
 tanArch(0,P+.12,ff,0,4.6,8.6,{kind:'point',fill:'G',band:gi,gilt:true,bw:.26,cut:false});
 for(const s of[-1,1]){const p=loc(0,ff,s*1.08,.06,0);vB('vWood',p[0],P+.12,p[1],2.1,5.9,.1,0,wal);}
 tanSunburst(-1.08,P+3.9,ff+.12,0,.42,.92,16,gi,false);
 tanDiscAt('taDisc',1.08,P+3.9,ff,0,.88,.18,.06,green);for(const dy of[-.36,0,.36]){const L=2*Math.sqrt(Math.max(0,.77-dy*dy))*.92,p=loc(1.08,ff,0,.2,0);vB('vPlaster',p[0],P+3.9+dy-.06,p[1],L,.12,.04,0,gdark);}
 tanRoseWindow(0,P+12.7,ff,0,2.6);tanArcBand(0,P+12.7,ff,0,2.78,.3,.14,.1,gi,0,TAU,24,'taGilt');
 // the four corner towers
 for(const sx of[-1,1])for(const sz of[-1,1])tanDrumDome(sx*(BW/2-TR),YB+.3,Z0+sz*(BD/2-TR),TR,{drumH:5.5,n:8,kind:'melon',domeC:tile,ribs:12,gilt:gi,fill:'C',band:or,round:true,lantern:false,finial:gi,fr:.18});
 // the central dome: a square base, the drum of cobalt windows between pilasters, the egg dome with gilt ribs, the lantern
 vB('vPlaster',0,YB+.3,Z0,2*DR+2,1.6,2*DR+2,0,wh);vB('vPlaster',0,YB+1.9,Z0,2*DR+2.3,.2,2*DR+2.3,0,or);
 tanDrumDome(0,YB+2.1,Z0,DR,{drumH:5.5,n:16,kind:'egg',domeC:tile,ribs:16,gilt:gi,fill:'C',band:or,round:true,pil:true,pilC:wh});
 // the apse
 const AZ=Z0-BD/2,AR=9.4;vPst('taDrumM',0,0,AZ,AR,P,mb);vPst('taDrumM',0,P,AZ,AR+.1,.12,wh);
 for(let k=0;k<12;k++){const a=1.82+(k+.5)*(4.46-1.82)/12,rr2=AR-.15;tanBalustrade(Math.sin(a)*rr2,P+.12,AZ+Math.cos(a)*rr2,a,2*rr2*Math.sin((4.46-1.82)/24)+.06,mb,1.0,{ball:gi,gilt:gi});}
 vPst('taDrum',0,P+.12,AZ,8,9,wh);tanDome(0,P+9.12,AZ,8.1,{kind:'hemi',h:5,c:tile,ribs:10,ribItem:'taRibGi',ribC:gi});
 for(const a of[Math.PI-1.05,Math.PI-.52,Math.PI,Math.PI+.52,Math.PI+1.05])tanArch(Math.sin(a)*8,P+1.6,AZ+Math.cos(a)*8,a,1.4,5.6,{kind:'point',fill:'C',band:or,bw:.14});
 /* the civic dress (the owner, 2026-10-19) */
 for(let k=0;k<5;k++)tanString(0,P+1.4+k*2.6,Z0,BW,BD,0,k%2?gi:or,.05,.12);
 for(let k=0;k<17;k++){const x=-16+k*2;if(Math.abs(x)<6.5)continue;vB('vPlaster',x,P*.3,PF+.01,1.3,P*.34,.05,0,k%2?or:gi);}
 for(const s of[-1,1]){for(let k=0;k<15;k++)vB('vPlaster',s*(BW/2+3+.01),P*.3,Z0-14+k*2,.05,P*.34,1.3,0,k%2?or:gi);
  for(const dx of[2.85,3.55])tanColumn(s*dx,P+.12,ff+.45,8.2,.26,'corinthian',mb,gi);
  tanMosaicPanel(s*7.6,P+1.6,zf,0,1.6,4.2,gi);tanBanner(s*4.4,FH-1.2,ff,0,1.1,5.2,or,gi);
  tanStatue(s*16.3,P+.12,PF-.5,0,1.25,mb);tanStatue(s*7.3,P+.12,PF-.3,0,1.15,mb);}
 tanSunburst(0,FH+1.5,zf+1.52,0,.45,1.3,16,gi,false);
 kput('taRingGi',[0,YB+2.1+5.6,Z0],null,[DR+.3,1.6,DR+.3],gi);
 for(const sx of[-1,1])for(const sz of[-1,1])kput('taRingGi',[sx*(BW/2-TR),YB+.3+5.6,Z0+sz*(BD/2-TR)],null,[TR+.2,1.4,TR+.2],gi);}

// Chapel (refs/talia3 (2).jpg): a small white cube on a podium, a pointed portal with a cobalt transom, pointed cobalt
// windows, an orange cornice, four pinnacles with little egg domes, a low drum and a white ribbed egg dome under a rib
// spire with a gilt finial.
function buildTalChapel(G,o){reseed(9756+(o.v|0));const W=9,Y0=.8,H=6,Z0=-1.5,zf=Z0+W/2,YT=Y0+H;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL();
 vnReg('Chapel (civic)',0,Z0,W/2+1,19,{style:'byzantine',type:['religious','civic']});
 vB('taMarble',0,0,Z0,W+2,Y0,W+2,0,mb);vnStairs(0,0,zf+1+.64,0,3,Y0,4,'taMarble',mb);
 vnBody('vPlaster',0,Y0,Z0,W,H,W,0,wh,{t:.3});
 tanDoor(0,Y0,zf,0,1.6,3.0,'taMarble',wh,wal,false);tanArch(0,Y0+3.25,zf,0,1.8,2.0,{kind:'point',fill:'C',band:or,bw:.16});
 for(const s of[-1,1])tanPilaster(s*1.5,Y0,zf,0,.4,5.5,wh,gi);
 for(const s of[-1,1])tanArch(s*W/2,Y0+1.4,Z0,s*Math.PI/2,1.2,3.4,{kind:'point',fill:'C',band:or,bw:.14,sill:wh});
 tanArch(0,Y0+1.4,Z0-W/2,Math.PI,1.2,3.4,{kind:'point',fill:'C',band:or,bw:.14,sill:wh});
 tanString(0,YT,Z0,W,W,0,or,.15,.25);vB('vPlaster',0,YT+.25,Z0,W+.2,.12,W+.2,0,wh);
 for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*(W/2-.4),z=Z0+sz*(W/2-.4);vPst('taColP',x,YT+.37,z,.28,1.6,wh);kput('taEgg',[x,YT+1.97,z],null,[.38,.55,.38],wh);kput('taGiltBall',[x,YT+2.55,z],null,[.07,.07,.07],gi);}
 const yd=tanDrum(0,YT+.37,Z0,3.4,1.6,8,wh,{fill:'C',band:or,round:true,ww:.6,wh:1.1});
 const top=tanDome(0,yd,Z0,3.6,{kind:'egg',item:'taEgg',c:wh,ribs:12,ribItem:'taRibGi',ribC:gi});
 kput('taConeP',[0,top-.3,Z0],null,[.45,3.6,.45],wh);tanFinial(0,top+3.25,Z0,.12,gi);
 vnPaving(0,.04,zf+3,5,1.6,0,st,4);
 /* the civic dress (the owner, 2026-10-19) */
 for(const y of[Y0+2,Y0+4.2])tanString(0,y,Z0,W,W,0,or,.05,.12);
 for(const s of[-1,1])tanColumn(s*1.55,Y0,zf+1.3,3.7,.17,'ionic',mb,gi);
 vB('taMarble',0,Y0+3.7,zf+.7,3.8,.3,1.5,0,wh);tanPediment(0,Y0+4.0,zf+1.45,0,4.0,.9,wh,0,1.5,or,gi);
 tanCartouche(0,Y0+5.3,zf,0,.45,wh,gi);
 for(const sx of[-1,1])for(const sz of[-1,1])tanStatue(sx*(W/2+.4),Y0,Z0+sz*(W/2+.4),Math.atan2(sx,sz),.8,mb);}

// Council house (PLAN.md: the city's own council, the local magistrates): a temple front on a high podium, six
// Corinthian columns with two return columns, a gilt-friezed entablature round the whole, a pediment with an orange
// tympanum and gilt acroteria, a tile roof over the cella, pedimented lit windows between pilasters down the sides,
// the door between statue niches.
function buildTalCouncilHouse(G,o){reseed(9761+(o.v|0));const P=2.4,CW=18,CD=22,HC=9,Z0=-4,zf=Z0+CD/2,PD=5,SN=14;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('Council house (civic)',0,Z0+2,CW/2+1,18,{style:'classical'});
 const PF=zf+PD+.5;vB('taMarble',0,0,(Z0-CD/2-.5+PF)/2,CW+2,P,PF-(Z0-CD/2-.5),0,mb);vB('taMarble',0,P,(Z0-CD/2-.5+PF)/2,CW+2.2,.12,PF-(Z0-CD/2-.5)+.2,0,wh);
 vnStairs(0,0,PF+SN*.16,0,14,P,SN,'taMarble',mb);
 vnBody('vPlaster',0,P,Z0,CW,HC,CD,0,wh,{t:.35});
 for(const s of[-1,1]){for(let k=0;k<6;k++)tanPilaster(s*CW/2,P,Z0-CD/2+1.2+k*(CD-2.4)/5,s*Math.PI/2,.6,HC,wh,gi);
  for(let k=0;k<5;k++){const z=Z0-CD/2+1.2+(k+.5)*(CD-2.4)/5;tanArch(s*CW/2,P+2.4,z,s*Math.PI/2,1.4,3.6,{kind:'flat',fill:'L',band:or,bw:.14,sill:wh});tanPediment(s*CW/2,P+6.3,z,s*Math.PI/2,2.0,.45,wh,.12,.3,null);}}
 tanColonnade(0,P+.12,zf+PD-.5,0,CW-1.4,5,HC-.12,.5,'corinthian',mb,gi,0);for(const s of[-1,1])tanColumn(s*(CW/2-.7),P+.12,zf+2.2,HC-.12,.5,'corinthian',mb,gi);
 tanDoor(0,P,zf,0,2.6,5.4,'taMarble',wh,wal,false);tanArcBand(0,P+5.4,zf,0,1.4,.2,.14,.08,gi,0,Math.PI,10,'taGilt');tanDiscAt('taDiscL',0,P+5.4,zf,0,1.3,.03,.1,null);
 for(const s of[-1,1])tanNiche(s*4.6,P+.6,zf,0,1.6,3.8,wh,or,mb);
 const YT=tanEntablature(0,P+HC,Z0+PD/2,CW,CD+PD,0,wh,gi,{});
 tanCoffers(0,P+HC-.14,zf+PD/2,CW-.8,PD-.4,0,or,wh,1.2);
 vnGableRoof(0,YT,Z0-PD/2+.6,CD-PD+1.2,CW+.3,2.8,Math.PI/2,'taTileB',tile,.2,'vGablePl',wh,.2);
 tanPediment(0,YT,zf+PD+.45,0,CW+.6,2.8,wh,0,PD+1.2,or,gi);
 for(const s of[-1,1])tanFinial(s*(CW/2+.15),YT+.14,zf+PD+.2,.2,gi);
 for(const s of[-1,1])vnLampPost(s*7.6,0,PF+SN*.32+.5,3.4);
 /* the civic dress (the owner, 2026-10-19) */
 tanStatueRow(0,YT+.3,zf+PD+.15,0,7.2,5,.62,mb);tanStatue(0,YT+2.95,zf+PD+.1,0,.9,mb);
 for(const s of[-1,1]){tanStatue(s*(CW/2+.4),P,PF-.5,0,1.3,mb);tanBanner(s*(CW/2-.7),P+HC-.4,zf+PD-.4,0,1.0,4.2,or,gi);}
 tanMosaicRing(0,P+.12,zf+PD/2,1.6,or,wh);}

// Memorial spire (refs/talia-memorial.jpg, talia-memorial2.jpg): over a reflecting pool, on a stepped base, a marble
// drum of gilt-banded niches under a gadrooned dome with gilt ribs, a second drum, a ring of lotus petals edged in gilt, a
// second gadrooned dome, and the lathe spire with gilt rings, a gilt onion and a gilt ball; four little spires at the
// pool's corners.
function buildTalMemorialSpire(G,o){reseed(9766+(o.v|0));const SZ=-5.2,Y1=1.2,PZ=6;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST();
 vnReg('Memorial spire (civic)',0,SZ,5,21,{style:'indic',type:['civic','statue']});vnReg('Memorial spire — the pool',0,PZ,10,1,{style:'indic',type:['civic']});
 for(let k=0;k<3;k++)vB('taMarble',0,k*.4,SZ,10-k*1.6,.4,10-k*1.6,0,mb);
 vPst('taDrumM',0,Y1,SZ,3,3,mb);for(const y of[Y1+.3,Y1+2.7])tanArcRun(0,y,SZ,3.05,0,TAU,.15,.18,'taGilt',gi);
 for(let k=0;k<8;k++){const a=(k+.5)*TAU/8;tanArch(Math.sin(a)*3,Y1+.7,SZ+Math.cos(a)*3,a,.8,1.7,{fill:'D',band:gi,gilt:true,bw:.08});}
 tanDome(0,Y1+3,SZ,3.1,{kind:'melon',item:'taDomeM',c:wh,ribs:16,ribItem:'taRibGi',ribC:gi});
 vPst('taDrumM',0,Y1+5.6,SZ,1.5,2.0,wh);for(let k=0;k<6;k++){const a=k*TAU/6;tanArch(Math.sin(a)*1.5,Y1+6.0,SZ+Math.cos(a)*1.5,a,.5,1.1,{fill:'D',band:gi,gilt:true,bw:.06});}
 tanLotus(0,Y1+7.4,SZ,1.75,1.3,12,wh,gi,.38);
 tanDome(0,Y1+7.7,SZ,1.45,{kind:'melon',item:'taDomeM',c:wh,ribs:12,ribItem:'taRibGi',ribC:gi});
 const S0=Y1+8.9,SH=9;kput('taConeP',[0,S0,SZ],null,[.6,SH,.6],wh);
 for(const y of[S0+1.8,S0+4.2,S0+6.2]){const rr2=.6*(1-(y-S0)/SH)+.04;kput('taRingGi',[0,y,SZ],null,[rr2,1,rr2],gi);}
 kput('taOnion',[0,S0+7.1,SZ],null,[.4,.62,.4],gi);kput('taGiltBall',[0,S0+SH+.05,SZ],null,[.12,.12,.12],gi);
 // the reflecting pool, its meander rim, the four little spires
 vB('taMarble',0,0,PZ,20,.2,9,0,mb);vB('vWinGlass',0,.2,PZ,19.2,.25,8.2,0,null);
 for(const [x,z,w,d] of[[0,PZ+4.3,20,.4],[0,PZ-4.3,20,.4],[9.8,PZ,.4,9],[-9.8,PZ,.4,9]])vB('taMarble',x,0,z,w,.5,d,0,mb);
 tanMeander(0,.5,PZ,20,9,0,or,.3);
 for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*9.4,z=PZ+sz*3.9;vPst('taColP',x,.5,z,.3,3.0,wh);kput('taRingGi',[x,3.5,z],null,[.34,1,.34],gi);kput('taOnion',[x,3.5,z],null,[.4,.6,.4],gi);kput('taConeP',[x,4.05,z],null,[.1,1.4,.1],wh);}
 vnPaving(0,.04,SZ+5.6,6,1.2,0,st,4);}

// ---------------------------------------------------------------- THE WALL AND THE GATE OF THE PASSES
// East gate (refs/talia ornament.jpg: the Gate of the Passes): two white drum towers banded in gilt with lit arched
// windows, under lotus-petal roofs edged in gilt and gilt finials; between them a screen pierced by the road (5 m clear,
// along z) under an orange vault, its arch cusped in white with a gilt band and keystone, a gilt sunburst over it on both
// faces, a gilt-balled balustrade on top. +z is the outer face. Wall segments butt the towers' outer faces at x = +-10.
function buildTalEastGate(G,o){reseed(9771+(o.v|0));const TR=3.2,TX=6.7,TH=12,OW=5,OS=5.6,WT=3,SH=13.5;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST();
 vnReg('Gate of the Passes (civic)',0,0,10,23,{style:'indic',type:['military','infrastructure','civic']});
 for(const s of[-1,1]){const x=s*TX;vPst('taDrumM',x,0,0,TR+.1,1.2,mb);vPst('taDrum',x,1.2,0,TR,TH-1.2,wh);
  for(const y of[4.5,8.5])tanArcRun(x,y,0,TR+.06,0,TAU,.15,.22,'taGilt',gi);
  tanArcRun(x,TH-.45,0,TR+.1,0,TAU,.3,.45,'taGilt',gi);tanArcRun(x,TH,0,TR+.2,0,TAU,.5,.35,'taMarble',wh);
  for(const a of[0,Math.PI,s*Math.PI/2])for(const y of[5.4,9.4])tanArch(x+Math.sin(a)*TR,y,Math.cos(a)*TR,a,.9,1.8,{fill:'L',band:gi,gilt:true,bw:.1});
  tanLotusRoof(x,TH+.35,0,TR+.15,wh,gi,4);}
 // the screen: two jambs, the block over the arch, the vault through it, the spandrels closing its faces
 const jx=(OW/2+TX-TR+.4)/2,jw=TX-TR+.4-OW/2;for(const s of[-1,1])vB('vPlaster',s*jx,0,0,jw,SH,WT,0,wh);
 vB('vPlaster',0,OS+OW/2,0,OW,SH-OS-OW/2,WT,0,wh);kput('taVault',[0,OS,0],vQ(0,0,0),[OW/2,OW/2,WT],or);
 for(const [z,a] of[[WT/2,0],[-WT/2,Math.PI]]){tanSpandrel(0,OS,z,a,OW/2,OW/2,OS+OW/2,.3,.02,wh);
  tanArcBand(0,OS,z,a,OW/2+.14,.28,.14,.08,gi,0,Math.PI,16,'taGilt');for(const s of[-1,1]){const p=loc(0,z,s*(OW/2+.14),.02,a);vB('taGilt',p[0],0,p[1],.28,OS,.14,a,gi);}
  for(let k=0;k<5;k++){const b=Math.PI*(k+.5)/5,p=loc(0,z,Math.cos(b)*(OW/2-.25),.06,a);kput('taDiscM',[p[0],OS+Math.sin(b)*(OW/2-.25),p[1]],vQ(a,0,0),[.42,.42,.1],mb);}
  const kp=loc(0,z,0,.1,a);vB('taGilt',kp[0],OS+OW/2-.3,kp[1],.5,.7,.14,a,gi);
  tanSunburst(0,10.5,z,a,.7,2.3,20,gi,false);}
 vB('vPlaster',0,SH,0,2*(TX-TR)+.6,.3,WT+.3,0,or);for(const [z,a] of[[WT/2-.12,0],[-WT/2+.12,Math.PI]])tanBalustrade(0,SH+.3,z,a,2*(TX-TR)-.3,mb,.9,{ball:gi,gilt:gi});
 if(vLit())for(const s of[-1,1])for(const z of[TR,-TR])vnLamp(s*TX,6.2,z,z>0?0:Math.PI);
 vnPaving(0,.02,0,OW-.4,WT+3,0,st,8);}

// Wall (PLAN.md: the city wall, white): one segment o.len long (default 12) along local x, every part inside x = +-len/2
// so segments butt: a stone footing, the white wall 7 m high, an orange string course, arrow slits, round-topped merlons
// capped in orange on the outer face (+z), a low parapet on the inner face.
function buildTalWall(G,o){reseed(9776+(o.v|0));const L=o.len==null?12:o.len,H=7,T=2.4,n=Math.max(1,Math.round(L/2));
 const wh=TA_WH(),or=TA_OR(),st=TA_ST();
 vnReg('Wall (civic)',0,0,L/2,H+1.4,{style:'byzantine',type:['military','infrastructure']});
 vB('vStone',0,0,0,L,.8,T+.4,0,st);vB('vPlaster',0,.8,0,L,H-.8,T,0,wh);vB('vPlaster',0,5,T/2+.07,L,.2,.14,0,or);
 for(let k=0;k<n;k++){const u=-L/2+(k+.5)*L/n;vB('vPlaster',u,H,T/2-.25,.9,.75,.5,0,wh);kput('taDisc',[u,H+.75,T/2-.25],null,[.45,.45,.5],or);
  if(k%2===0){vB('taWinB',u,2.3,T/2+.02,.18,1.0,.05,0,null);vB('vStone',u,2.2,T/2+.04,.42,.1,.12,0,st);vB('vStone',u,3.3,T/2+.04,.42,.1,.12,0,st);}}
 vB('vPlaster',0,H,-T/2+.15,L,.8,.3,0,wh);vB('vPlaster',0,H+.8,-T/2+.15,L,.08,.4,0,or);}

// Wall tower (PLAN.md: orange-capped round towers): a white drum on a marble footing, orange bands, slit windows, a
// corbelled ring, round-topped merlons capped in orange, a tile cone roof; the door on the town side (-z). Walls butt it
// at x = +-4.
function buildTalWallTower(G,o){reseed(9781+(o.v|0));const R=3.8,H=11;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('Wall tower (civic)',0,0,R,H+4.6,{style:'byzantine',type:['military','infrastructure']});
 vPst('taDrumM',0,0,0,R+.2,1.4,mb);vPst('taDrum',0,1.4,0,R,H-1.4,wh);
 for(const y of[4.5,8])tanArcRun(0,y,0,R+.06,0,TAU,.2,.25,'vPlaster',or);
 tanArcRun(0,H-.4,0,R+.05,0,TAU,.3,.4,'vPlaster',wh);
 for(let k=0;k<12;k++){const a=k*TAU/12;vB('vPlaster',Math.sin(a)*(R-.25),H,Math.cos(a)*(R-.25),.9,.75,.4,a,wh);kput('taDisc',[Math.sin(a)*(R-.25),H+.75,Math.cos(a)*(R-.25)],vQ(a,0,0),[.45,.45,.4],or);}
 for(const [a,y] of[[0,3],[Math.PI/2,6.5],[-Math.PI/2,6.5],[0,9.5],[Math.PI*.75,9.5],[-Math.PI*.75,3]]){vB('taWinB',Math.sin(a)*(R+.02),y,Math.cos(a)*(R+.02),.18,1.0,.05,a,null);for(const dy of[-.1,1.0])vB('vStone',Math.sin(a)*(R+.05),y+dy,Math.cos(a)*(R+.05),.42,.1,.1,a,mb);}
 kput('taCone',[0,H,0],null,[R-.6,4.2,R-.6],tile);kput('taBallM',[0,H+4.3,0],null,[.2,.25,.2],wh);
 tanDoor(0,0,-(R+.21),Math.PI,1.1,2.3,'vPlaster',or,wal,false);}

// ---------------------------------------------------------------- THE FOUNTAIN AND THE BRIDGE
// Nymphaeum (PLAN.md: a fountain in a niche of columns): a white screen wall with three statue niches, the centre one
// framed by an aedicule of two Corinthian columns on pedestals under a pediment with an orange tympanum; gilt spouts
// pour into a long marble basin.
function buildTalFountain(G,o){reseed(9786+(o.v|0));const W=12,ZW=-2.6,H=7.4,ZF=ZW+.6;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),water=vC(0xa8d0e0);
 vnReg('Nymphaeum (civic)',0,-.5,6,8.5,{style:'classical',type:['infrastructure','civic']});
 vB('vPlaster',0,0,ZW,W,H,1.2,0,wh);vB('vPlaster',0,H,ZW,W+.3,.3,1.5,0,or);
 tanNiche(0,1.0,ZF,0,2.2,4.4,wh,or,mb);for(const s of[-1,1])tanNiche(s*4.2,1.0,ZF,0,1.4,3.0,wh,or,mb);
 for(const s of[-1,1]){vB('taMarble',s*1.9,0,ZW+1.3,.8,1.0,.8,0,mb);tanColumn(s*1.9,1.0,ZW+1.3,4.6,.24,'corinthian',mb,gi);}
 const YE=tanEntablature(0,5.6,ZW+.95,4.6,1.0,0,wh,gi,{dentils:false});tanPediment(0,YE,ZW+1.6,0,5.2,1.3,wh,0,1.2,or,gi);
 for(const x of[-5.4,-3.0,3.0,5.4]){kput('taGiltBall',[x,1.35,ZF+.05],null,[.18,.18,.18],gi);vB('taPaneB',x,.25,ZF+.32,.14,1.0,.06,0,water);}
 vB('taMarble',0,0,.7,W-.4,.25,5.4,0,mb);vB('vWinGlass',0,.25,.7,W-1.0,.3,4.8,0,null);
 for(const [x,z,w,d] of[[0,3.25,W-.4,.3],[0,-1.85,W-.4,.3],[W/2-.35,.7,.3,5.4],[-(W/2-.35),.7,.3,5.4]])vB('taMarble',x,0,z,w,.7,d,0,mb);}

// Sky bridge (refs/talia11.jpg): an arched bridge o.len long (default 14) at deck height o.deck (default 9; o.y is the placer's base height) between two
// buildings: a segmental white arch with an orange soffit, its spandrels closed, a deck between gilt-balled balustrades, a
// kiosk at mid-span. On the sheet (o.piers, default true) two white pier towers carry it, each with a door onto the
// deck and a melon dome; in a city the placer sets its ends against two buildings' faces and passes o.piers false.
function buildTalSkyBridge(G,o){reseed(9791+(o.v|0));const L=o.len==null?14:o.len,Y=o.deck==null?9:o.deck,BW=3,PW=3,piers=o.piers!==false,F=Math.min(3.2,L*.22);
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),tile=vC(vPick(TAPAL.tile)),wal=TA_WAL();
 const R=(L*L/4+F*F)/(2*F),yc=Y-1.2-R,a0=Math.acos(Math.min(1,(L/2)/R));
 vnReg('Sky bridge (civic)',0,0,L/2+(piers?PW:0),Y+4,{style:'baroque',type:['infrastructure','civic']});
 vB('vPlaster',0,Y-.5,0,L+(piers?.4:0),.5,BW,0,wh);for(const s of[-1,1])vB('vPlaster',0,Y-.55,s*(BW/2+.02),L,.2,.06,0,or);
 tanArcBand(0,yc,0,0,R+.3,.6,BW,BW/2,wh,a0,Math.PI-a0,18);tanArcBand(0,yc,0,0,R+.02,.05,BW-.1,(BW-.1)/2,or,a0,Math.PI-a0,18);
 tanSpandrel(0,yc,0,0,R+.6,L/2,Y-.5,BW,BW/2,wh,Math.max(12,Math.round(L*1.6)));
 for(const [z,a] of[[BW/2-.15,0],[-BW/2+.15,Math.PI]])tanBalustrade(0,Y,z,a,L,mb,1.0,{ball:gi,gilt:gi});
 tanKiosk(0,Y,0,1.0,2.2,6,wh,{order:'plain',domeC:tile,ribC:gi,ribItem:'taRibGi',finial:gi,fr:.07});
 if(piers)for(const s of[-1,1]){const x=s*(L/2+PW/2);vnBody('vPlaster',x,0,0,PW,Y+2.6,BW+.6,0,wh,{t:.3});
  tanArch(s*L/2,Y,0,-s*Math.PI/2,1.2,2.4,{fill:'D',band:or,bw:.12});tanString(x,Y-.5,0,PW,BW+.6,0,or,.08,.2);
  for(const y of[Y-3.6])tanArch(x,y,BW/2+.3,0,1.0,2.2,{fill:vLit()?'L':'D',band:or,bw:.1,sill:wh});
  tanDoor(x,0,BW/2+.3,0,1.1,2.4,'vPlaster',or,wal,false);
  vB('vPlaster',x,Y+2.6,0,PW+.2,.25,BW+.8,0,or);tanDome(x,Y+2.85,0,1.4,{kind:'melon',c:tile,ribs:10,ribC:wh,finial:gi,fr:.08});}}

VERN.def({key:'tal_temple',name:'Temple',family:'civic',tags:TA_TAG('byzantine','civic',['religious','civic'],true),w:36,d:58,h:40,build:buildTalTemple});
VERN.def({key:'tal_chapel',name:'Chapel',family:'civic',tags:TA_TAG('byzantine','civic',['religious','civic'],true),w:14,d:16,h:19,build:buildTalChapel});
VERN.def({key:'tal_council_house',name:'Council house',family:'civic',tags:TA_TAG('classical','civic',['civic'],true),w:24,d:36,h:18,build:buildTalCouncilHouse});
VERN.def({key:'tal_memorial_spire',name:'Memorial spire',family:'civic',tags:TA_TAG('indic','civic',['civic','statue'],false),w:26,d:22,h:21,build:buildTalMemorialSpire});
VERN.def({key:'tal_east_gate',name:'Gate of the Passes',family:'civic',tags:TA_TAG('indic','civic',['military','infrastructure','civic'],true),w:20,d:10,h:23,build:buildTalEastGate});
VERN.def({key:'tal_wall',name:'Wall',family:'civic',tags:TA_TAG('byzantine','civic',['military','infrastructure'],false),w:12,d:4,h:9,build:buildTalWall});
VERN.def({key:'tal_wall_tower',name:'Wall tower',family:'civic',tags:TA_TAG('byzantine','civic',['military','infrastructure'],false),w:8,d:8,h:16,build:buildTalWallTower});
VERN.def({key:'tal_fountain',name:'Nymphaeum',family:'civic',tags:TA_TAG('classical','civic',['infrastructure','civic'],false),w:14,d:8,h:10,build:buildTalFountain});
VERN.def({key:'tal_sky_bridge',name:'Sky bridge',family:'civic',tags:TA_TAG('baroque','civic',['infrastructure','civic'],true),w:20,d:4,h:14,build:buildTalSkyBridge});
