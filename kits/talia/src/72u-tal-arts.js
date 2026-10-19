// ================================================================= 72u. TALIA: the arts of the University quarter (kits/talia/PLAN.md sections 4, 9b)
// Seeds 9701-9749. Talia leads the Aggonmekki in the arts (PLAN.md 9b): the odeon and music hall, the academy of
// painting and sculpture, the open-air theatre, the gallery, and the botanic garden's glasshouse. Civic: lit and gilt.

// Odeon (PLAN.md: the theatre and music hall): a half-round cavea under a low ribbed dome, its curve the apse at the
// back with two tiers of lit arches; a hall block in front, a tetrastyle Ionic portico with an orange tympanum and a
// coffered ceiling, three doors between statue niches.
function buildTalOdeon(G,o){reseed(9701+(o.v|0));const R=12,BW=24,H=10,Y0=1.0,ZC=-2.5,FZ=ZC+12,PD=4.6;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('Odeon (civic)',0,ZC+3,R+1,18,{style:'classical'});
 vPst('taDrumM',0,0,ZC,R+.6,Y0,mb);vB('taMarble',0,0,ZC+(12+PD+.6)/2,BW+1.2,Y0,12+PD+.6,0,mb);
 vnStairs(0,0,FZ+PD+.6+.96,0,12,Y0,6,'taMarble',mb);
 // the hall block and the apse drum behind it, the apse's two tiers of arches, the block's side windows
 vnBody('vPlaster',0,Y0,ZC+6,BW,H,12,0,wh,{t:.35});vPst('taDrum',0,Y0,ZC,R,H,wh);
 for(let k=0;k<16;k++){const a=(k+.5)*TAU/16;if(Math.cos(a)>-.05)continue;const p=[Math.sin(a)*R,ZC+Math.cos(a)*R];
  tanArch(p[0],Y0+1,p[1],a,1.8,4.4,{fill:'L',band:or,bw:.14,sill:wh});tanArch(p[0],Y0+6.4,p[1],a,1.2,2.2,{fill:'L',band:or,bw:.1});}
 tanArcRun(0,Y0+5.7,ZC,R+.1,Math.PI/2,1.5*Math.PI,.3,.24,'vPlaster',or);
 for(const s of[-1,1])for(const u of[2.5,6,9.5]){tanArch(s*BW/2,Y0+1,ZC+u,s*Math.PI/2,1.6,4.2,{fill:'L',band:or,bw:.14,sill:wh});tanArch(s*BW/2,Y0+6.4,ZC+u,s*Math.PI/2,1.2,2.2,{fill:'L',band:or,bw:.1});}
 // the entablatures (the block's, a ring round the apse), the low ribbed dome over the cavea
 const YT=tanEntablature(0,Y0+H,ZC+6,BW,12,0,wh,gi,{dentils:false});
 tanArcRun(0,Y0+H,ZC,R+.15,Math.PI/2,1.5*Math.PI,.4,.3,'taMarble',wh);tanArcRun(0,Y0+H+.3,ZC,R+.17,Math.PI/2,1.5*Math.PI,.42,.4,'taGilt',gi);tanArcRun(0,Y0+H+.7,ZC,R+.3,Math.PI/2,1.5*Math.PI,.7,.35,'taMarble',wh);
 tanDome(0,YT,ZC,R-.3,{kind:'hemi',h:4.6,c:tile,ribs:16,ribItem:'taRibGi',ribC:gi,finial:gi,fr:.25});
 // the portico: four Ionic columns, its entablature and pediment, the coffers; the doors and the niches behind it
 tanColonnade(0,Y0,FZ+PD-.5,0,11,3,H,.5,'ionic',mb,gi,0);
 const YP=tanEntablature(0,Y0+H,FZ+PD/2,12,PD,0,wh,gi,{});tanPediment(0,YP,FZ+PD+.5,0,12.8,2.8,wh,0,PD+.6,or,gi);
 tanCoffers(0,Y0+H-.14,FZ+PD/2,11.4,PD-.4,0,or,wh,1.2);
 tanDoor(0,Y0,FZ,0,2.2,4.4,'taMarble',wh,wal,false);for(const s of[-1,1]){tanDoor(s*3.6,Y0,FZ,0,1.5,3.4,'taMarble',wh,wal,false);tanNiche(s*(BW/2-2.6),Y0+.5,FZ,0,1.6,3.8,wh,or,mb);}
 for(const s of[-1,1])vnLampPost(s*6.4,0,FZ+PD+.6+2.4,3.2);}

// Academy (PLAN.md: the academy of painting and sculpture): a classical front of seven bays (lit arches and statue
// niches below, pedimented windows above, a pediment over the centre three bays), and behind it the studios under a
// sawtooth roof of north lights (glass to the back, tile to the front), screened at the ends by parapets.
function buildTalAcademy(G,o){reseed(9711+(o.v|0));const BAY=3.6,N=7,W=N*BAY,FD=9,H1=4.6,H2=4,Y0=.8,ZF=10,Y1=Y0+H1+.3,SD=14,SH=6,NS=4,ZS=ZF-FD;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('Academy of painting and sculpture (civic)',0,ZF-FD/2,W/2,14,{style:'classical'});vnReg('Academy — the studios',0,ZS-SD/2,W/2,SH+2.4,{style:'classical'});
 vB('taMarble',0,0,(ZF+ZS-SD)/2,W+.8,Y0,FD+SD+.8,0,mb);vnStairs(0,0,ZF+.4+.8,0,BAY*1.4,Y0,5,'taMarble',mb);
 // the front range
 vnBody('vPlaster',0,Y0,ZF-FD/2,W,H1,FD,0,wh,{t:.35});vnBody('vPlaster',0,Y1,ZF-FD/2,W,H2,FD,0,wh,{t:.35});tanString(0,Y0+H1,ZF-FD/2,W,FD,0,or,.16,.3);
 for(let k=0;k<N;k++){const x=(k-3)*BAY;
  if(k===3){tanDoor(x,Y0,ZF,0,1.7,3.4,'taMarble',wh,wal,false);tanPediment(x,Y0+3.8,ZF,0,2.6,.6,wh,.16,.4,or,gi);}
  else if(k===1||k===5)tanNiche(x,Y0+.5,ZF,0,1.5,3.6,wh,or,mb);else tanArch(x,Y0+.6,ZF,0,1.5,3.2,{fill:'L',band:or,bw:.14,key:gi,sill:wh});
  tanArch(x,Y1+.5,ZF,0,1.3,2.3,{kind:'flat',fill:'L',band:or,bw:.12,sill:wh});tanPediment(x,Y1+2.95,ZF,0,1.9,.42,wh,.14,.3,null);}
 for(let k=0;k<=N;k++){const x=(k-3.5)*BAY;tanPilaster(x,Y0,ZF,0,.5,H1,wh,gi);tanPilaster(x,Y1,ZF,0,.45,H2,wh,gi);}
 for(const s of[-1,1])for(const u of[-2,2]){tanArch(s*W/2,Y0+.6,ZF-FD/2+u,s*Math.PI/2,1.4,3.1,{fill:'L',band:or,bw:.14,sill:wh});tanArch(s*W/2,Y1+.5,ZF-FD/2+u,s*Math.PI/2,1.2,2.3,{kind:'flat',fill:'L',band:or,bw:.12,sill:wh});}
 const YT=tanEntablature(0,Y1+H2,ZF-FD/2,W,FD,0,wh,gi,{});tanParapet(0,YT,ZF-FD/2,W+.4,FD+.4,0,mb,1.0,{ball:gi,gilt:gi});
 tanPediment(0,YT-.1,ZF+.5,0,3*BAY+.6,2.2,wh,.1,.8,or,gi);
 // the studios: a tall storey, lit arches on the sides, the sawtooth of north lights, the end parapets
 vnBody('vPlaster',0,Y0,ZS-SD/2,W,SH,SD,0,wh,{t:.35});
 for(const s of[-1,1])for(let k=0;k<4;k++)tanArch(s*W/2,Y0+1,ZS-SD+1.8+k*3.5,s*Math.PI/2,1.6,3.8,{fill:'L',band:or,bw:.14,sill:wh});
 for(let k=-3;k<=3;k++)tanArch(k*3.4,Y0+1,ZS-SD,Math.PI,1.6,3.8,{fill:'L',band:or,bw:.14});
 const sd=SD/NS,rise=1.6,ang=Math.atan2(rise,sd),sl=Math.hypot(sd,rise);
 for(let j=0;j<NS;j++){const zb=ZS-SD+j*sd;vB('vWinGlass',0,Y0+SH,zb+.08,W-.6,rise,.12,0,null);for(let k=1;k<6;k++)vB('vIron',-W/2+k*W/6,Y0+SH,zb+.16,.08,rise,.06,0,vC(vPick(TAPAL.iron)));
  kput('taTileB',[0,Y0+SH+rise/2+.06,zb+sd/2],vQ(0,ang,0),[W-.4,.14,sl],tile);}
 for(const s of[-1,1]){vB('vPlaster',s*(W/2-.15),Y0+SH,ZS-SD/2,.3,rise+.4,SD,0,wh);vB('vPlaster',s*(W/2-.15),Y0+SH+rise+.4,ZS-SD/2,.42,.1,SD+.1,0,or);}
 for(const s of[-1,1])vnLampPost(s*(BAY+.6),0,ZF+2.0,3.0);}

// Theatre (PLAN.md 9b: open air, on the slope): a half-round cavea of twelve tiers of marble seats with orange edges
// and five aisles, rising to a parapet on an outer wall arcaded in two tiers (on the city's hill the slope carries it);
// the orchestra a marble disc with a mosaic ring; the stage, and the scaenae frons of two storeys of columns with three
// doors toward the audience and three arched entrances on the street front (+z).
function buildTalTheatre(G,o){reseed(9721+(o.v|0));const ZC=6,RO=5,NR=12,RD=1.0,RH=.55,RW=RO+NR*RD,HW=RH*NR,SW=26,A0=Math.PI/2,A1=1.5*Math.PI;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL();
 vnReg('Theatre (civic, open air)',0,ZC-8,RW,HW+2,{style:'classical'});vnReg('Theatre — the stage',0,ZC+3.5,SW/2,10,{style:'classical'});
 // the orchestra
 kput('taDiscM',[0,.03,ZC],qEuler(Math.PI/2,0,0),[RO,RO,.06],mb);tanMosaicRing(0,.06,ZC,RO*.55,or,wh);
 // the tiers, their orange edges, the aisles, the stepped end walls
 for(let i=0;i<NR;i++){const r=RO+(i+.5)*RD,h=(i+1)*RH;tanArcRun(0,0,ZC,r,A0,A1,RD,h,'taMarble',mb);tanArcRun(0,h,ZC,r-RD/2+.12,A0,A1,.24,.05,'vPlaster',or);
  for(let j=1;j<6;j++){const a=A0+j*Math.PI/6;vB('vPlaster',Math.sin(a)*r,h,ZC+Math.cos(a)*r,.8,.04,RD,a,st);}
  for(const s of[-1,1])vB('vPlaster',s*r,0,ZC+.15,RD+.02,h+.9,.3,0,wh);}
 // the outer wall and its two tiers of arches, the coping
 tanArcRun(0,0,ZC,RW+.3,A0,A1,.6,HW+1.2,'vPlaster',wh);tanArcRun(0,HW+1.2,ZC,RW+.3,A0,A1,.8,.15,'vPlaster',or);
 for(let k=1;k<14;k++){const a=A0+k*Math.PI/14,rr2=RW+.6;tanArch(Math.sin(a)*rr2,0,ZC+Math.cos(a)*rr2,a,2.0,4.0,{fill:'D',band:or,bw:.14});tanArch(Math.sin(a)*rr2,4.8,ZC+Math.cos(a)*rr2,a,1.0,1.4,{fill:'D',band:or,bw:.1});}
 // the stage and the scaenae frons
 vB('taMarble',0,0,ZC+2.5,SW,1.2,3,0,mb);vB('vPlaster',0,.9,ZC+.99,SW,.2,.08,0,or);
 vnBody('vPlaster',0,0,ZC+4.75,SW+2,9,1.5,0,wh,{t:.3});
 tanDoor(0,1.2,ZC+4,Math.PI,2.2,3.6,'taMarble',wh,wal,false);for(const s of[-1,1])tanDoor(s*7,1.2,ZC+4,Math.PI,1.6,3.0,'taMarble',wh,wal,false);
 for(const s of[-1,1])for(const x of[3.6,10.4])tanNiche(s*x,5.8,ZC+4,Math.PI,1.3,2.8,wh,or,mb);
 tanColonnade(0,1.2,ZC+4,Math.PI,SW-2,8,3.8,.24,'corinthian',mb,gi,.6);vB('taMarble',0,5.0,ZC+3.55,SW-1,.5,1.1,0,wh);vB('vPlaster',0,5.2,ZC+2.98,SW-1,.2,.06,0,gi);
 tanColonnade(0,5.5,ZC+4,Math.PI,SW-2,8,3.0,.2,'ionic',mb,gi,.6);vB('taMarble',0,8.5,ZC+3.55,SW-1,.5,1.1,0,wh);
 vB('vPlaster',0,9,ZC+4.75,SW+2.3,.3,1.8,0,or);
 for(const x of[-8,0,8])tanArch(x,0,ZC+5.5,0,x?2.0:2.6,x?3.6:4.2,{fill:'D',band:or,bw:.16,key:gi});
 for(const x of[-11,-4,4,11])tanArch(x,5.4,ZC+5.5,0,1.1,2.0,{fill:'D',band:or,bw:.1,sill:wh});
 vnPaving(0,.04,ZC+5.5+.9,SW,1.0,0,st,8);}

// Gallery (PLAN.md 9b; the Glyptothek): a long top-lit block of blind white walls set with statues in niches, a glass
// clerestory along each wing's roof, a hexastyle Ionic portico on the axis with an orange tympanum and gilt acroteria,
// and a domed rotunda rising behind the portico.
function buildTalUniGallery(G,o){reseed(9731+(o.v|0));const W=40,D=16,H=8,Y0=1.2,Z0=-3,zf=Z0+D/2,PW=14,PD=4,RR=5;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile)),pane=vC(0xcfe2e8);
 vnReg('Gallery (civic)',0,Z0,W/2,21,{style:'classical'});
 vB('taMarble',0,0,Z0+PD/2,W+1.2,Y0,D+PD+1.2,0,mb);vnStairs(0,0,zf+PD+.6+1.12,0,PW-2,Y0,7,'taMarble',mb);
 vnBody('vPlaster',0,Y0,Z0,W,H,D,0,wh,{t:.35});tanString(0,Y0+.9,Z0,W,D,0,or,.1,.2);
 for(const s of[-1,1]){for(const x of[10,14,18])tanNiche(s*x,Y0+1.4,zf,0,1.7,4.4,wh,or,mb);for(const u of[-4,0,4])tanNiche(s*W/2,Y0+1.4,Z0+u,s*Math.PI/2,1.7,4.4,wh,or,mb);}
 for(const x of[-15,-5,5,15])tanNiche(x,Y0+1.4,Z0-D/2,Math.PI,1.7,4.4,wh,or,mb);
 const YT=tanEntablature(0,Y0+H,Z0,W,D,0,wh,gi,{});
 for(const s of[-1,1]){vB('taPaneB',s*11.5,YT,Z0,12,.9,5,0,pane);vB('vPlaster',s*11.5,YT+.9,Z0,12.4,.14,5.4,0,wh);}
 // the rotunda behind the portico
 vPst('taDrum',0,Y0,Z0-1,RR,YT-Y0+3,wh);
 for(let k=0;k<10;k++){const a=(k+.5)*TAU/10;tanArch(Math.sin(a)*RR,YT+.6,Z0-1+Math.cos(a)*RR,a,1.1,1.8,{fill:'L',band:or,bw:.1});}
 kput('taRing',[0,YT+3,Z0-1],null,[RR+.1,RR+.1,1.4],wh);
 const yd=tanDome(0,YT+3.1,Z0-1,RR+.1,{kind:'hemi',c:tile,ribs:12,ribItem:'taRibGi',ribC:gi});tanLantern(0,yd-.15,Z0-1,.9,1.0,wh,tile,gi,{n:6});
 // the portico
 tanColonnade(0,Y0,zf+PD-.5,0,PW-1,5,H,.42,'ionic',mb,gi,0);
 const YP=tanEntablature(0,Y0+H,zf+PD/2,PW,PD,0,wh,gi,{});tanPediment(0,YP,zf+PD+.5,0,PW+.8,2.6,wh,0,PD+.6,or,gi);
 for(const s of[-1,1])tanFinial(s*(PW/2+.1),YP+.14,zf+PD+.2,.16,gi);
 tanCoffers(0,Y0+H-.14,zf+PD/2,PW-.6,PD-.4,0,or,wh,1.2);
 tanDoor(0,Y0,zf,0,2.2,4.6,'taMarble',wh,wal,false);for(const s of[-1,1])tanNiche(s*3.8,Y0+.6,zf,0,1.5,3.8,wh,or,mb);
 for(const s of[-1,1])vnLampPost(s*(PW/2-1),0,zf+PD+.6+2.8,3.2);}

// Glasshouse (refs/talia hall.jpg; the botanic garden): a drum of glazed arches in gilt bands on a marble podium under
// a ribbed glass dome, a gilt onion spire on a little arcaded drum at its crown; two glass barrel-vaulted wings on low
// white walls; a pool before it.
function buildTalGlasshouse(G,o){reseed(9741+(o.v|0));const R=7.5,DH=4,Y0=.8,ZC=-3.5,DGH=6.2,WL=8.5,WX=R+WL/2-.15,PZ=11;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),pane=vC(0xcfe6dc);
 vnReg('Glasshouse (civic)',0,ZC,R+1,16,{style:'byzantine'});vnReg('Glasshouse — the pool',0,PZ,8,1,{style:'byzantine'});
 vPst('taDrumM',0,0,ZC,R+2,Y0,mb);tanArcRun(0,Y0-.1,ZC,R+2,0,TAU,.4,.12,'vPlaster',or);vnStairs(0,0,ZC+R+2+.64,0,4,Y0,4,'taMarble',mb);
 tanDrum(0,Y0,ZC,R,DH,14,wh,{fill:'P',band:gi,gilt:true,pil:true,pilC:wh,capC:gi,round:true,ww:1.5,wh:2.8,hollow:true});
 kput('taDomeGl',[0,Y0+DH,ZC],null,[R+.1,DGH,R+.1],pane);
 /* the planting (simple stand-ins: the botanic species are a later pass, KNOWN_ISSUES.md) */
 const trunk=vC(0x8a7a5a),soil=vC(0x4a3a2a),G1=vC(0x4e7a3a),G2=vC(0x5f8f44),G3=vC(0x3f6b32);
 const palm=(x,y,z,h,r)=>{vPst('vPostB',x,y,z,.16,h,trunk);for(let k=0;k<8;k++){const a=k*TAU/8+rr(-.2,.2),p=[x+Math.sin(a)*r*.55,z+Math.cos(a)*r*.55];kput('vLeaf',[p[0],y+h-.15,p[1]],vQ(a,.45,0),[r*.22,.08,r*.6],k%2?G1:G2);}};
 const banana=(x,y,z)=>{vPst('vPostB',x,y,z,.12,1.6,G3);for(let k=0;k<5;k++){const a=k*TAU/5+rr(-.3,.3),p=[x+Math.sin(a)*.5,z+Math.cos(a)*.5];kput('vLeaf',[p[0],y+1.9,p[1]],vQ(a,-.6,0),[.35,.06,.95],G2);}};
 const shrub=(x,y,z,r)=>{for(let k=0;k<3;k++)kput('vLeaf',[x+rr(-r*.4,r*.4),y+r*.6+k*r*.25,z+rr(-r*.4,r*.4)],null,[r,r*.7,r],vPick([G1,G2,G3]));};
 vPst('taDrumM',0,Y0,ZC,3.2,.45,mb);vPst('vPostS',0,Y0,ZC,3.0,.5,soil);palm(0,Y0+.5,ZC,7.6,3.4);
 for(let k=0;k<4;k++){const a=k*TAU/4+.4;shrub(Math.sin(a)*1.8,Y0+.5,ZC+Math.cos(a)*1.8,.55);}
 for(let k=0;k<8;k++){const a=k*TAU/8+.2,x=Math.sin(a)*5.4,z=ZC+Math.cos(a)*5.4;if(k%2)banana(x,Y0,z);else palm(x,Y0,z,4.2,2.2);shrub(Math.sin(a+.4)*6.3,Y0,ZC+Math.cos(a+.4)*6.3,.45);}
 for(let k=0;k<16;k++)kput('taRibGi',[0,Y0+DH,ZC],vQ(k*TAU/16,0,0),[R+.15,DGH+.05,R+.15],gi);
 kput('taRingGi',[0,Y0+DH,ZC],null,[R+.2,1.4,R+.2],gi);
 tanDrumDome(0,Y0+DH+DGH-.3,ZC,1.2,{drumH:1.3,n:6,kind:'onion',item:'taOnion',domeC:gi,lantern:false,finial:gi,fr:.18,band:gi,gilt:gi});
 // the wings: a low white wall, glazed uprights, a glass vault with gilt ribs, a glass end
 for(const s of[-1,1]){const x=s*WX;vB('taMarble',x,0,ZC,WL,Y0,6.6,0,mb);vB('vPlaster',x,Y0,ZC,WL,1.4,6,0,wh);vB('taPaneB',x,Y0+1.4,ZC,WL,1.6,5.8,0,pane);
  kput('taVaultGl',[x,Y0+3,ZC],vQ(Math.PI/2,0,0),[2.9,2.9,WL],pane);
  for(let k=0;k<4;k++){const px=x-WL/2+1.1+k*(WL-2.2)/3;for(const sz of[-1,1]){tanPot(px,Y0+1.4,ZC+sz*2.0,.32);shrub(px,Y0+1.9,ZC+sz*2.0,.4);}}
  for(let k=0;k<5;k++)tanArcBand(x-WL/2+.4+k*(WL-.8)/4,Y0+3,ZC,Math.PI/2,2.95,.08,.08,.04,gi,0,Math.PI,10,'taGilt');
  tanDiscAt('taDiscP',x+s*WL/2,Y0+3,ZC,s*Math.PI/2,2.9,.03,.08,pane);}
 // the pool
 vB('taMarble',0,0,PZ,16,.25,7,0,mb);vB('vWinGlass',0,.25,PZ,15.2,.3,6.2,0,null);
 for(const [x,z,w,d] of[[0,PZ+3.3,16,.4],[0,PZ-3.3,16,.4],[7.8,PZ,.4,7],[-7.8,PZ,.4,7]])vB('taMarble',x,0,z,w,.65,d,0,mb);
 tanMeander(0,.65,PZ,16,7,0,or,.3);}

VERN.def({key:'tal_odeon',name:'Odeon (music hall)',family:'civic',tags:TA_TAG('classical','civic',['civic'],true),w:26,d:34,h:18,build:buildTalOdeon});
VERN.def({key:'tal_academy',name:'Academy of painting and sculpture',family:'civic',tags:TA_TAG('classical','civic',['civic'],true),w:28,d:28,h:14,build:buildTalAcademy});
VERN.def({key:'tal_theatre',name:'Theatre (open air)',family:'civic',tags:TA_TAG('classical','civic',['civic'],false),w:38,d:24,h:10,build:buildTalTheatre});
VERN.def({key:'tal_uni_gallery',name:'Gallery',family:'civic',tags:TA_TAG('classical','civic',['civic'],true),w:44,d:26,h:22,build:buildTalUniGallery});
VERN.def({key:'tal_glasshouse',name:'Glasshouse',family:'civic',tags:TA_TAG('byzantine','civic',['civic'],true),w:32,d:32,h:16,build:buildTalGlasshouse});
