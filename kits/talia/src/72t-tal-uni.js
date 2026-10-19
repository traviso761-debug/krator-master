// ================================================================= 72t. TALIA: the University, its core and faculties (kits/talia/PLAN.md sections 4, 9b)
// Seeds 9601-9699. The University quarter (PLAN.md 9b): the great hall with its clock tower on the main quad, the cloister
// round it, the library rotunda, the Senate house; the faculties (three sizes), the anatomy theatre, the teaching
// hospital, the observatory on the quarter's high point; the colleges (o.wealth). Civic: lit and gilt (the owner,
// 2026-10-17); a poor college (o.wealth 'poor', placed with o.lit false) is plain whitewash with no gilt and no light.
// Greek leads the University (PLAN.md section 2): columns, arcades and the cornice below, a Byzantine crown above.

// ---------------------------------------------------------------- THE CORE
// Great hall (refs/talia (3).jpg): eleven bays on a podium, an ochre ground storey of tall lit arches between white
// gilt-capped pilasters, a white piano nobile alternating tall arches with cobalt oculi in gilt rings, the centre and
// end pavilions standing forward, a gilt-friezed entablature, an attic of small square windows and a balustrade; the
// clock tower over the centre (the clock rose, a scroll gable, an arcaded drum, a gilt onion); gilt onions on the corners.
function buildTalUniHall(G,o){reseed(9601+(o.v|0));const BAY=3.6,N=11,W=N*BAY,D=16,H1=6,H2=5,Y0=1.2,Z0=-2.5,zf=Z0+D/2,Y1=Y0+H1+.3,SN=7;
 const oc=vC(vPick(TAPAL.ochre)),wh=TA_WH(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),or=TA_OR(),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 const PJ=k=>k>=4&&k<=6?.7:(k===0||k===N-1)?.4:0,BX=k=>-W/2+BAY/2+k*BAY;
 vnReg('University great hall (civic)',0,Z0,W/2,31,{style:'classical'});
 // the podium and the stair up to the centre pavilion
 vB('taMarble',0,0,Z0,W+2,Y0,D+2,0,mb);vB('taMarble',0,Y0,Z0,W+2.2,.1,D+2.2,0,wh);
 vnStairs(0,0,zf+1+SN*.16,0,3*BAY,Y0,SN,'taMarble',mb);
 // the body: an ochre ground storey, a white piano nobile; the centre and end pavilions stand forward of it
 vnBody('vPlaster',0,Y0,Z0,W,H1,D,0,oc,{t:.4});vnBody('vPlaster',0,Y1,Z0,W,H2,D,0,wh,{t:.4});
 for(const [k0,k1] of[[4,6],[0,0],[N-1,N-1]]){const x=(BX(k0)+BX(k1))/2,w=(k1-k0+1)*BAY,p=PJ(k0);vB('vPlaster',x,Y0,zf+p/2,w,H1,p,0,oc);vB('vPlaster',x,Y1-.3,zf+p/2,w,H2+.3,p,0,wh);}
 tanString(0,Y0+H1,Z0+.35,W,D+.7,0,wh,.2,.3);
 for(let k=0;k<N;k++){const x=BX(k),fz=zf+PJ(k);
  if(k===5){tanDoor(x,Y0,fz,0,2.0,3.8,'taMarble',wh,wal,false);tanArcBand(x,Y0+3.8,fz,0,1.1,.2,.14,.08,gi,0,Math.PI,10,'taGilt');tanDiscAt('taDiscL',x,Y0+3.8,fz,0,1.0,.03,.1,null);}
  else tanArch(x,Y0+.7,fz,0,1.6,3.9,{fill:'L',band:wh,bw:.16,key:gi,sill:wh});
  if(k%2)tanOculus(x,Y1+2.4,fz,0,.95,'C',gi,true);else tanArch(x,Y1+.6,fz,0,1.4,3.4,{fill:'L',band:or,bw:.14,sill:wh});}
 for(let k=0;k<=N;k++){const x=-W/2+k*BAY,fz=zf+Math.max(PJ(Math.min(N-1,k)),PJ(Math.max(0,k-1)));tanPilaster(x,Y0,fz,0,.55,H1,wh,gi);tanPilaster(x,Y1,fz,0,.5,H2,wh,gi);}
 for(const s of[-1,1])for(const u of[-4.6,0,4.6]){tanArch(s*W/2,Y0+.7,Z0+u,s*Math.PI/2,1.6,3.9,{fill:'L',band:wh,bw:.16,sill:wh});tanArch(s*W/2,Y1+.6,Z0+u,s*Math.PI/2,1.4,3.4,{fill:'L',band:or,bw:.14,sill:wh});}
 for(let k=1;k<N;k+=2){const x=BX(k);tanArch(x,Y0+.7,Z0-D/2,Math.PI,1.6,3.9,{fill:'L',band:wh,bw:.16});tanArch(x,Y1+.6,Z0-D/2,Math.PI,1.4,3.4,{fill:'L',band:or,bw:.14});}
 // the entablature, the attic band with its square windows, the balustrade
 const YT=tanEntablature(0,Y1+H2,Z0+.35,W,D+.7,0,wh,gi,{});const AT=2.2;
 vB('vPlaster',0,YT,Z0+.35,W,AT,D+.7,0,wh);vB('vPlaster',0,YT+AT,Z0+.35,W+.3,.2,D+1,0,or);
 for(let k=0;k<N;k++){tanArch(BX(k),YT+.55,zf+.7,0,.8,.9,{kind:'flat',fill:'L',band:or,bw:.08});tanArch(BX(k),YT+.55,Z0-D/2,Math.PI,.8,.9,{kind:'flat',fill:'L',band:or,bw:.08});}
 const YR=YT+AT+.2;tanParapet(0,YR,Z0+.35,W+.1,D+.8,0,mb,1.0,{ball:gi,gilt:gi});
 // the clock tower: a white stage with the clock rose on its front, a scroll gable, an arcaded drum, the gilt onion
 const CZ=zf-3,CS=6.4;vB('vPlaster',0,YR,CZ,8.4,CS,7,0,wh);for(const s of[-1,1])tanPilaster(s*4.2,YR,CZ+3.5,0,.6,CS,wh,gi);
 const cy=YR+3.4,cf=CZ+3.5;tanDiscAt('taDiscM',0,cy,cf,0,2.0,.16,.16,wh);tanArcBand(0,cy,cf,0,2.1,.22,.14,.2,gi,0,TAU,20,'taGilt');
 for(let k=0;k<12;k++){const a=k*TAU/12,p=loc(0,cf,Math.cos(a)*1.65,.2,0);vBq('taGilt',p[0],cy+Math.sin(a)*1.65,p[1],.1,k%3?.2:.36,.04,vQ(0,0,a-Math.PI/2),gi);}
 for(const [a,L,w] of[[2.6,.95,.12],[.55,1.5,.08]]){const p=loc(0,cf,Math.cos(a)*L/2,.24,0);vBq('taGilt',p[0],cy+Math.sin(a)*L/2,p[1],w,L,.04,vQ(0,0,a-Math.PI/2),gi);}
 tanString(0,YR+CS,CZ,8.4,7,0,or,.15,.2);tanScrollGable(0,YR+CS+.2,cf,0,6.4,1.6,wh,.1,gi);
 tanDrumDome(0,YR+CS+.2,CZ,2.4,{drumH:3.2,n:8,kind:'onion',item:'taOnion',domeC:gi,lantern:false,finial:gi,fr:.22,band:or,lit:true});
 // the corner and flank onions on the attic roof
 for(const sx of[-1,1]){for(const sz of[-1,1])tanDrumDome(sx*(W/2-1.6),YR,Z0+.35+sz*(D/2-1.4),1.0,{drumH:1.5,n:6,kind:'onion',item:'taOnion',domeC:gi,lantern:false,finial:gi,fr:.1,band:or,lit:true});
  tanDrumDome(sx*W/4,YR,zf-1,.75,{drumH:1.2,n:6,kind:'onion',item:'taOnion',domeC:gi,lantern:false,finial:gi,fr:.08,band:or,lit:true});}
 for(const s of[-1,1])vnLampPost(s*(1.5*BAY+1),0,zf+1+SN*.32+.6,3.4);
 vnPaving(0,.04,zf+1+SN*.32+1.2,16,1.6,0,st,8);
 /* the civic dress (the owner, 2026-10-19) */
 for(const s of[-1,1]){for(const dx of[5.4,12.6,19.2])tanStatue(s*dx,YR+1.0,zf+.75,0,1.0,mb);tanBanner(s*1.6,Y1+H2-.3,zf+.7,0,.9,3.6,or,gi);}}

// Cloister (refs/talia-cloisters.jpg): four ranges of two storeys round a court; inside, a gallery on each storey (a
// marble Corinthian walk below, an Ionic walk above behind a gilt-balled balustrade) under orange coffered ceilings, a
// ring-and-meander mosaic floor, a lawn and a fountain in the court; outside, lit arches in orange bands, a gate passage
// under an orange vault on the front axis with a cupola over it, an entablature, the outer balustrade, corner kiosks.
function buildTalUniCloister(G,o){reseed(9611+(o.v|0));const W=38,R=6,H1=5,H2=4.2,Y0=.5,IW=W-2*R,WK=3.2,PG=2.2,Y1=Y0+H1+.3,TOP=Y1+H2;
 const wh=TA_WH(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),or=TA_OR(),st=TA_ST(),tile=vC(vPick(TAPAL.tile)),grass=vC(0x6f8f45);
 vnReg('University cloister (civic)',0,0,W/2,TOP+4,{style:'classical'});
 // the floor of the ranges and the walks, the court's lawn a step down
 vB('taMarble',0,0,0,W+.6,Y0,W+.6,0,mb);vB('vPlaster',0,Y0-.08,0,IW-2*WK-.4,.1,IW-2*WK-.4,0,grass);
 // the back and side ranges; the front range's ground storey in two halves either side of the gate passage
 for(const [x,z,w,d] of[[0,-(W/2-R/2),W,R],[W/2-R/2,0,R,IW],[-(W/2-R/2),0,R,IW]])vnBody('vPlaster',x,Y0,z,w,TOP-Y0,d,0,wh,{t:.35});
 const hw=(W-2*PG)/2;for(const s of[-1,1])vnBody('vPlaster',s*(PG+hw/2),Y0,W/2-R/2,hw,H1+.3,R,0,wh,{t:.35});
 vnBody('vPlaster',0,Y1,W/2-R/2,W,H2,R,0,wh,{t:.35});
 const sp=Y0+H1-PG;kput('taVault',[0,sp,W/2-R/2],vQ(0,0,0),[PG,PG,R],or);
 for(const [z,a] of[[W/2,0],[W/2-R,Math.PI]]){tanSpandrel(0,sp,z,a,PG,PG,Y1,.3,.02,wh);tanArcBand(0,sp,z,a,PG+.16,.3,.14,.08,or,0,Math.PI,12);
  for(const s of[-1,1]){const p=loc(0,z,s*(PG+.16),.02,a);vB('vPlaster',p[0],Y0,p[1],.3,sp-Y0,.14,a,or);}}
 // the two galleries, the coffered ceilings over the walks, the mosaic floor
 tanCourtGallery(0,Y0,0,IW,IW,H1,WK,wh,or,{order:'corinthian',r:.24,cc:mb,capC:gi,bay:3.4,gate:PG});
 tanCourtGallery(0,Y1,0,IW,IW,H2-.3,WK,wh,or,{order:'ionic',r:.2,cc:mb,capC:gi,bay:3.4,rail:true,ball:gi,gilt:gi});
 const WS=[[0,-(IW/2-WK/2),IW,WK],[0,IW/2-WK/2,IW,WK],[IW/2-WK/2,0,WK,IW-2*WK],[-(IW/2-WK/2),0,WK,IW-2*WK]];
 for(const yy of[Y0+H1-.14,Y1+H2-.3-.14])for(const [x,z,w,d] of WS)tanCoffers(x,yy,z,w-.1,d-.1,0,or,wh,1.1);
 tanMeander(0,Y0,0,IW-.3,IW-.3,0,or,.3);tanMeander(0,Y0,0,IW-2*WK+1.0,IW-2*WK+1.0,0,or,.3);
 for(const [x,z,w,d] of WS){const L=Math.max(w,d),n=Math.max(1,Math.round(L/4.2));for(let k=0;k<n;k++){const u=-L/2+(k+.5)*L/n;tanMosaicRing(w>d?x+u:x,Y0,w>d?z:z+u,.9,or,wh);}}
 // the fountain in the court
 kput('taDrumM',[0,Y0-.1,0],null,[2.2,.7,2.2],mb);kput('taDiscG',[0,Y0+.55,0],qEuler(Math.PI/2,0,0),[2.0,2.0,.04],null);
 vPst('taCol',0,Y0+.5,0,.22,1.5,mb);kput('taDomeM',[0,Y0+2.3,0],qEuler(Math.PI,0,0),[.9,.4,.9],mb);kput('taGiltBall',[0,Y0+2.45,0],null,[.18,.18,.18],gi);
 // the outer faces: lit arches in orange bands on both storeys, the string course, the entablature on each range
 for(const [lx,lz,a] of[[0,W/2,0],[0,-W/2,Math.PI],[W/2,0,Math.PI/2],[-W/2,0,-Math.PI/2]])for(let k=0;k<11;k++){const u=-W/2+2+k*(W-4)/10,q=loc(lx,lz,u,0,a);
  if(!(a===0&&Math.abs(u)<3.4))tanArch(q[0],Y0+.6,q[1],a,1.5,3.3,{fill:'L',band:or,bw:.14,sill:wh});
  tanArch(q[0],Y1+.5,q[1],a,1.3,2.7,{fill:'L',band:or,bw:.12,sill:wh});}
 for(const [x,z,w,d] of[[0,W/2,W+.3,.24],[0,-W/2,W+.3,.24],[W/2,0,.24,W],[-W/2,0,.24,W]])vB('vPlaster',x,Y0+H1+.05,z,w,.2,d,0,or);
 let YT=TOP;for(const [x,z,w,d] of[[0,-(W/2-R/2),W,R],[0,W/2-R/2,W,R],[W/2-R/2,0,R,IW],[-(W/2-R/2),0,R,IW]])YT=tanEntablature(x,TOP,z,w,d,0,wh,gi,{dentils:false});
 tanParapet(0,YT,0,W+.5,W+.5,0,mb,1.0,{ball:gi,gilt:gi});
 for(const sx of[-1,1])for(const sz of[-1,1])tanKiosk(sx*(W/2-2.4),YT,sz*(W/2-2.4),1.1,2.2,6,wh,{order:'corinthian',capC:gi,domeC:tile,ribC:gi,ribItem:'taRibGi',finial:gi,fr:.07});
 // the cupola over the gate
 tanDrumDome(0,YT,W/2-R/2,1.8,{drumH:1.8,n:6,kind:'melon',domeC:tile,ribs:12,gilt:gi,lit:true,band:or});
 for(const s of[-1,1])vnLampPost(s*3.4,0,W/2+1.4,3.2);vnPaving(0,.04,W/2+1.2,6,1.6,0,st,4);}

// Library (refs/taliaint.jpg inside; PLAN.md 9b): a rotunda of two arcaded storeys between gilt-capped pilasters, lit,
// round a well under a ribbed orange dome with a lantern over the oculus; a Corinthian portico with an orange tympanum
// on the front, a coffered ceiling, the door between two statue niches; a round podium.
function buildTalUniLibrary(G,o){reseed(9621+(o.v|0));const R=10.5,H1=6,H2=5,Y0=1.4,ZC=-2.5,NA=12,PW=13,HC=9.2,FZ=ZC+R+1;
 const wh=TA_WH(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),or=TA_OR(),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('University library (civic)',0,ZC+2,R+2,26,{style:'classical'});
 // the podiums and the stair
 vPst('taDrumM',0,0,ZC,R+2,Y0,mb);vB('taMarble',0,0,ZC+R+3.1,PW+1.2,Y0,6.2,0,mb);
 vnStairs(0,0,ZC+R+6.2+1.28,0,PW-2,Y0,8,'taMarble',mb);
 // the rotunda: the drum, its two arcaded storeys and pilasters (the front, behind the portico, left blind)
 vPst('taDrum',0,Y0,ZC,R,H1+.3+H2,wh);tanArcRun(0,Y0+H1,ZC,R+.12,0,TAU,.3,.3,'vPlaster',or);
 for(let k=0;k<NA;k++){const a=k*TAU/NA;if(Math.cos(a)>.8)continue;const p=[Math.sin(a)*R,ZC+Math.cos(a)*R];
  tanArch(p[0],Y0+.6,p[1],a,2.0,4.4,{fill:'L',band:or,bw:.16,key:gi,sill:mb});tanArch(p[0],Y0+H1+.8,p[1],a,1.7,3.6,{fill:'L',band:or,bw:.14,sill:mb});}
 for(let k=0;k<NA;k++){const b=(k+.5)*TAU/NA;if(Math.cos(b)>.75)continue;const q=[Math.sin(b)*R,ZC+Math.cos(b)*R];tanPilaster(q[0],Y0,q[1],b,.6,H1,wh,gi);tanPilaster(q[0],Y0+H1+.3,q[1],b,.55,H2,wh,gi);}
 // the ring entablature (a gilt frieze), two stepped attic rings, the ribbed dome, the lantern over the oculus
 const yE=Y0+H1+.3+H2;tanArcRun(0,yE,ZC,R+.15,0,TAU,.4,.3,'taMarble',wh);tanArcRun(0,yE+.3,ZC,R+.17,0,TAU,.42,.4,'taGilt',gi);tanArcRun(0,yE+.7,ZC,R+.35,0,TAU,.8,.3,'taMarble',wh);
 vPst('taDrum',0,yE+1,ZC,R-.2,1.0,wh);vPst('taDrum',0,yE+2,ZC,R-.9,.8,wh);
 const yd=tanDome(0,yE+2.8,ZC,R-1.1,{kind:'hemi',h:6.6,c:tile,ribs:16,ribItem:'taRibGi',ribC:gi});
 tanLantern(0,yd-.35,ZC,1.3,1.2,wh,tile,gi,{n:8});
 // the portico: the block that joins it to the drum, six Corinthian columns, the entablature, the pediment, the coffers
 vB('vPlaster',0,Y0,ZC+R-1,PW-1,HC+1.2,4,0,wh);
 tanColonnade(0,Y0,ZC+R+5,0,PW-1,5,HC,.45,'corinthian',mb,gi,0);
 const YP=tanEntablature(0,Y0+HC,ZC+R+3.3,PW,4.6,0,wh,gi,{});tanPediment(0,YP,ZC+R+6.1,0,PW+.8,2.6,wh,0,5.2,or,gi);
 tanCoffers(0,Y0+HC-.14,ZC+R+3.3,PW-.6,4.2,0,or,wh,1.2);
 tanDoor(0,Y0,FZ,0,2.4,5,'taMarble',wh,wal,false);for(const s of[-1,1])tanNiche(s*3.6,Y0+.4,FZ,0,1.6,3.6,wh,or,mb);
 for(const s of[-1,1])vnLampPost(s*(PW/2-1),0,ZC+R+6.2+2.56+.6,3.2);
 /* the civic dress (the owner, 2026-10-19) */
 tanStatue(0,YP+2.75,ZC+R+5.95,0,.9,mb);for(const s of[-1,1]){tanStatue(s*(PW/2+.1),YP+.14,ZC+R+5.95,0,.85,mb);tanBanner(s*(PW/2-1.2),Y0+HC-.3,ZC+R+4.6,0,.9,3.6,or,gi);}}

// Senate house (PLAN.md 9b: the rector and the masters): a white baroque front of seven bays on a podium, the centre
// bay forward between paired Corinthian columns on both storeys, a balcony over the door, pedimented windows above, a
// gilt-friezed entablature, the balustrade, a scroll gable over the centre and a cupola; the imperial stair. Lit, gilt.
function buildTalUniSenate(G,o){reseed(9631+(o.v|0));const BAY=3.4,N=7,W=N*BAY,D=15,H1=5,H2=4.4,Y0=1.6,Z0=-3,zf=Z0+D/2,Y1=Y0+H1+.3;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('University Senate house (civic)',0,Z0,W/2+1,20,{style:'baroque'});
 vB('taMarble',0,0,Z0,W+2,Y0,D+2,0,mb);vB('taMarble',0,Y0,Z0,W+2.2,.12,D+2.2,0,wh);
 const reach=tanImperialStair(0,0,zf+1,0,3.4,Y0,mb,or,{gilt:gi});
 for(const s of[-1,1]){tanBalustrade(s*8.15,Y0+.12,zf+.9,0,9.4,mb,1.0,{ball:gi,gilt:gi});tanBalustrade(s*(W/2+.9),Y0+.12,Z0,s*Math.PI/2,D+1.8,mb,1.0,{ball:gi,gilt:gi});}
 // the body, the centre bay standing forward
 vnBody('vPlaster',0,Y0,Z0,W,H1,D,0,wh,{t:.35});vnBody('vPlaster',0,Y1,Z0,W,H2,D,0,wh,{t:.35});vB('vPlaster',0,Y0,zf+.4,BAY+1.2,H1+.3+H2,.8,0,wh);
 tanString(0,Y0+H1,Z0+.4,W,D+.8,0,or,.18,.3);
 for(let k=0;k<N;k++){const x=(k-3)*BAY,fz=k===3?zf+.8:zf;
  if(k===3){tanDoor(x,Y0,fz,0,1.7,3.4,'taMarble',wh,wal,false);tanArcBand(x,Y0+3.4,fz,0,.95,.18,.14,.08,gi,0,Math.PI,10,'taGilt');tanDiscAt('taDiscL',x,Y0+3.4,fz,0,.85,.03,.1,null);
   tanArch(x,Y1+.2,fz,0,1.5,3.0,{kind:'flat',fill:'L',band:or,bw:.16});tanPediment(x,Y1+3.35,fz,0,2.2,.5,wh,.14,.3,gi);continue;}
  tanArch(x,Y0+.6,fz,0,1.5,3.2,{fill:'L',band:or,bw:.16,key:gi,sill:wh});
  tanArch(x,Y1+.5,fz,0,1.3,2.5,{kind:'flat',fill:'L',band:or,bw:.14,sill:wh});tanPediment(x,Y1+3.15,fz,0,1.9,.45,wh,.14,.3,null);}
 for(let k=0;k<=N;k++){if(k===3||k===4)continue;const x=(k-3.5)*BAY;tanPilaster(x,Y0,zf,0,.55,H1,wh,gi);tanPilaster(x,Y1,zf,0,.5,H2,wh,gi);}
 // the paired columns flanking the centre bay, the balcony on the lower pair
 for(const s of[-1,1])for(const dx of[.95,1.65]){tanColumn(s*(BAY/2+dx),Y0,zf+1.4,H1,.26,'corinthian',mb,gi);tanColumn(s*(BAY/2+dx),Y1,zf+1.4,H2,.22,'corinthian',mb,gi);}
 vB('taMarble',0,Y1-.3,zf+1.3,BAY+4.4,.3,1.6,0,wh);tanBalustrade(0,Y1,zf+2.0,0,BAY+4.2,mb,.95,{ball:gi,gilt:gi});
 for(const s of[-1,1])for(const u of[-4.4,0,4.4]){tanArch(s*W/2,Y0+.6,Z0+u,s*Math.PI/2,1.4,3.1,{fill:'L',band:or,bw:.14,sill:wh});tanArch(s*W/2,Y1+.5,Z0+u,s*Math.PI/2,1.2,2.5,{kind:'flat',fill:'L',band:or,bw:.12,sill:wh});}
 for(let k=-2;k<=2;k++){tanArch(k*BAY,Y0+.6,Z0-D/2,Math.PI,1.4,3.1,{fill:'L',band:or,bw:.14});tanArch(k*BAY,Y1+.5,Z0-D/2,Math.PI,1.2,2.5,{kind:'flat',fill:'L',band:or,bw:.12});}
 // the entablature, the balustrade, the scroll gable and the cupola
 const YT=tanEntablature(0,Y1+H2,Z0+.4,W,D+.8,0,wh,gi,{});tanParapet(0,YT,Z0+.4,W+.4,D+1.2,0,mb,1.0,{ball:gi,gilt:gi});
 tanScrollGable(0,YT-.1,zf+1.4,0,BAY+2.6,1.8,wh,.12,gi);
 tanDrumDome(0,YT,Z0,2.3,{drumH:2.0,n:8,kind:'melon',domeC:tile,ribs:12,gilt:gi,lit:true,band:or});
 for(const s of[-1,1])vnLampPost(s*4.6,0,zf+1+reach+.5,3.2);
 /* the civic dress (the owner, 2026-10-19) */
 for(const s of[-1,1])for(const dx of[4.6,11.4])tanStatue(s*dx,YT+1.0,Z0+.4+(D+1.2)/2,0,.95,mb);
 tanCartouche(0,Y1+H2-.9,zf+.8,0,.55,wh,gi);}

// ---------------------------------------------------------------- THE FACULTIES
// Faculty (PLAN.md 9b: natural philosophy, law, letters, mathematics): a range of two storeys on a podium, an ochre
// ground storey of lit round arches, a white upper storey of pedimented windows, gilt-capped pilasters at every bay,
// the centre bay forward under a pediment with an orange tympanum. Three sizes by o.v: 5, 7 or 9 bays (7: a cupola;
// 9: domed end pavilions too).
function buildTalUniFaculty(G,o){reseed(9641+((o.v|0)%3));const v=(o.v|0)%3,N=[5,7,9][v],BAY=4,W=N*BAY,D=14,H1=4.8,H2=4.2,Y0=.9,Z0=-1.5,zf=Z0+D/2,Y1=Y0+H1+.3,C=(N-1)/2,SN=5;
 const oc=vC(vPick(TAPAL.ochre)),wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('University faculty, '+N+' bays (civic)',0,Z0,W/2+.5,v?17:13,{style:'classical'});
 vB('taMarble',0,0,Z0,W+1.6,Y0,D+1.6,0,mb);vnStairs(0,0,zf+.8+SN*.16,0,BAY*1.5,Y0,SN,'taMarble',mb);
 vnBody('vPlaster',0,Y0,Z0,W,H1,D,0,oc,{t:.35});vnBody('vPlaster',0,Y1,Z0,W,H2,D,0,wh,{t:.35});
 vB('vPlaster',0,Y0,zf+.25,BAY,H1,.5,0,oc);vB('vPlaster',0,Y1-.3,zf+.25,BAY,H2+.3,.5,0,wh);
 tanString(0,Y0+H1,Z0+.25,W,D+.5,0,wh,.16,.3);
 for(let k=0;k<N;k++){const x=(k-C)*BAY,fz=k===C?zf+.5:zf;
  if(k===C){tanDoor(x,Y0,fz,0,1.6,3.3,'taMarble',wh,wal,false);tanArcBand(x,Y0+3.3,fz,0,.9,.18,.14,.08,gi,0,Math.PI,10,'taGilt');tanDiscAt('taDiscL',x,Y0+3.3,fz,0,.8,.03,.1,null);}
  else tanArch(x,Y0+.6,fz,0,1.6,3.3,{fill:'L',band:wh,bw:.16,key:gi,sill:wh});
  tanArch(x,Y1+.5,fz,0,1.4,2.4,{kind:'flat',fill:'L',band:or,bw:.14,sill:wh});tanPediment(x,Y1+3.05,fz,0,2.0,.45,wh,.14,.3,k===C?gi:null);
  tanArch(x,Y0+.6,Z0-D/2,Math.PI,1.6,3.3,{fill:'L',band:wh,bw:.16});tanArch(x,Y1+.5,Z0-D/2,Math.PI,1.4,2.4,{kind:'flat',fill:'L',band:or,bw:.14});}
 for(let k=0;k<=N;k++){const x=(k-N/2)*BAY,fz=(k===C||k===C+1)?zf+.5:zf;tanPilaster(x,Y0,fz,0,.55,H1,wh,gi);tanPilaster(x,Y1,fz,0,.5,H2,wh,gi);}
 for(const s of[-1,1])for(const u of[-3.6,0,3.6]){tanArch(s*W/2,Y0+.6,Z0+u,s*Math.PI/2,1.4,3.2,{fill:'L',band:wh,bw:.14,sill:wh});tanArch(s*W/2,Y1+.5,Z0+u,s*Math.PI/2,1.3,2.4,{kind:'flat',fill:'L',band:or,bw:.12,sill:wh});}
 const YT=tanEntablature(0,Y1+H2,Z0+.25,W,D+.5,0,wh,gi,{});tanParapet(0,YT,Z0+.25,W+.4,D+.9,0,mb,1.0,{ball:gi,gilt:gi});
 tanPediment(0,YT-.1,zf+.95,0,BAY+1.2,1.5,wh,.1,.6,or,gi);
 if(N>=7)tanDrumDome(0,YT,Z0-1,1.9,{drumH:1.6,n:8,kind:'melon',domeC:tile,ribs:12,gilt:gi,lit:true,band:or});
 if(N>=9)for(const s of[-1,1])tanDrumDome(s*(W/2-2.2),YT,Z0,1.4,{drumH:1.3,n:6,kind:'melon',domeC:tile,ribs:10,gilt:gi,lit:true,band:or,lantern:false,finial:gi,fr:.1});
 for(const s of[-1,1])vnLampPost(s*(BAY*.75+.8),0,zf+.8+SN*.32+.5,3.0);}

// Anatomy theatre (PLAN.md 9b; Padua's): a round drum of three storeys of small lit arches between orange bands round
// the tiered galleries of the dissecting theatre (inside: P6), a tile cone roof round the skylight lantern over the
// table, and an entrance block with a pedimented door on the front.
function buildTalUniAnatomy(G,o){reseed(9651+(o.v|0));const R=7,HS=3.6,NS=3,Y0=.5,ZC=-2.2,TOP=Y0+NS*HS,EZ=ZC+R+2.5;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('Anatomy theatre (civic)',0,ZC+1,R+1,20,{style:'classical'});
 vPst('taDrumM',0,0,ZC,R+.6,Y0,mb);vPst('taDrum',0,Y0,ZC,R,NS*HS,wh);
 for(let s=0;s<NS;s++){const y=Y0+s*HS;if(s)tanArcRun(0,y-.1,ZC,R+.1,0,TAU,.3,.22,'vPlaster',or);
  for(let k=0;k<10;k++){const a=(k+.5)*TAU/10;if(Math.cos(a)>.75)continue;tanArch(Math.sin(a)*R,y+.7,ZC+Math.cos(a)*R,a,s?.9:1.1,s?1.7:2.2,{fill:'L',band:or,bw:.1,sill:wh});}}
 tanArcRun(0,TOP,ZC,R+.2,0,TAU,.6,.35,'taMarble',wh);
 kput('taCone',[0,TOP+.3,ZC],null,[R+.5,4.2,R+.5],tile);
 tanLantern(0,TOP+3.6,ZC,1.3,1.6,wh,tile,gi,{n:8});
 // the entrance block: a pedimented door between two lit windows, a stair
 vnBody('vPlaster',0,Y0,EZ-2.2,8,6,4.4,0,wh,{t:.3});tanString(0,Y0+6,EZ-2.2,8,4.4,0,or,.15,.25);
 tanDoor(0,Y0,EZ,0,1.4,2.8,'taMarble',wh,wal,false);tanPediment(0,Y0+3.2,EZ,0,2.4,.6,wh,.14,.3,or,gi);
 for(const s of[-1,1])tanArch(s*2.6,Y0+.8,EZ,0,1.1,2.6,{fill:'L',band:or,bw:.12,sill:wh});
 tanPediment(0,Y0+6.25,EZ+.1,0,8.4,1.4,wh,.05,4.6,or,gi);
 vnStairs(0,0,EZ+.5,0,3,Y0,3,'taMarble',mb);for(const s of[-1,1])vnLampPost(s*2.2,0,EZ+1.4,2.8);}

// Teaching hospital (PLAN.md 9b; the Innocenti's loggia): a nine-bay loggia of Corinthian columns and orange arches with
// cobalt roundels in the spandrels under a coffered ceiling, a stair across its whole front, a storey of small
// pedimented windows over it; ranges round a court behind, the chapel's dome over the back range. Lit, gilt.
function buildTalUniHospital(G,o){reseed(9661+(o.v|0));const BAY=3.6,N=9,LW=N*BAY,W=36,Y0=.9,H1=5.4,H2=4,LD=3.6,FR=8,SR=6,ZB=-14,zf=12,Y1=Y0+H1+.3,TOP=Y1+H2,ZM=zf-FR;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile)),cob=vC(vPick(TAPAL.cobalt)),grass=vC(0x6f8f45);
 vnReg('Teaching hospital (civic)',0,-1,W/2,20,{style:'classical'});
 vB('taMarble',0,0,(zf+ZB)/2,W+1,Y0,zf-ZB+1,0,mb);vnStairs(0,0,zf+.5+.8,0,LW,Y0,5,'taMarble',mb);
 // the front range: the ground storey behind the loggia, the loggia's end walls, the upper storey over it all
 vnBody('vPlaster',0,Y0,(ZM+zf-LD)/2,W,H1+.3,FR-LD,0,wh,{t:.35});
 for(const s of[-1,1])vB('vPlaster',s*(W/2-(W-LW)/4),Y0,zf-LD/2,(W-LW)/2,H1+.3,LD,0,wh);
 vnBody('vPlaster',0,Y1,zf-FR/2,W,H2,FR,0,wh,{t:.35});vB('taMarble',0,Y0+H1,zf-LD/2,LW,.3,LD,0,wh);
 // the loggia: the columns, the arches, the spandrels and their roundels, the coffered ceiling, the doors and windows
 const r=BAY/2-.45,HC=H1-r-.5,zc=zf-.3;
 for(let k=0;k<=N;k++)tanColumn(-LW/2+k*BAY,Y0,zc,HC,.25,'corinthian',mb,gi);
 for(let k=0;k<N;k++){const x=-LW/2+(k+.5)*BAY;tanArcBand(x,Y0+HC+.1,zc,0,r+.08,.18,.5,.25,or,0,Math.PI,10);tanSpandrel(x,Y0+HC+.1,zc,0,r+.17,BAY/2,Y0+H1,.4,.2,wh,10);
  if(k)tanOculus(x-BAY/2,Y0+HC+.1+r*.95,zc+.22,0,.48,'C',wh,false);
  const b=zf-LD;if(k===2||k===6)tanDoor(x,Y0,b,0,1.5,3.0,'taMarble',wh,wal,false);else tanArch(x,Y0+.7,b,0,1.4,2.8,{fill:'L',band:or,bw:.14,sill:wh});
  tanArch(x,Y1+.6,zf,0,1.0,1.8,{kind:'flat',fill:'L',band:or,bw:.12,sill:wh});tanPediment(x,Y1+2.55,zf,0,1.6,.4,wh,.14,.3,null);}
 tanCoffers(0,Y0+H1-.14,zf-LD/2-.1,LW-.2,LD-.6,0,wh,or,1.2);
 // the side and back ranges round the court; the court's lawn and well
 for(const s of[-1,1])vnBody('vPlaster',s*(W/2-SR/2),Y0,(ZM+ZB+SR)/2,SR,TOP-Y0,ZM-ZB-SR,0,wh,{t:.35});
 vnBody('vPlaster',0,Y0,ZB+SR/2,W,TOP-Y0,SR,0,wh,{t:.35});
 vB('vPlaster',0,Y0,(ZM+ZB+SR)/2,W-2*SR-.2,.06,ZM-ZB-SR-.2,0,grass);vnWaterButt(0,Y0,(ZM+ZB+SR)/2,.7,.9);
 for(const s of[-1,1])for(const u of[-2.6,1.4,5.4,9.4]){const z=ZB+SR+u-2;tanArch(s*W/2,Y0+.7,z,s*Math.PI/2,1.3,2.8,{fill:'L',band:or,bw:.14,sill:wh});tanArch(s*W/2,Y1+.5,z,s*Math.PI/2,1.0,1.8,{kind:'flat',fill:'L',band:or,bw:.12,sill:wh});}
 for(let k=-3;k<=3;k++){tanArch(k*4.6,Y0+.7,ZB,Math.PI,1.3,2.8,{fill:'L',band:or,bw:.14});tanArch(k*4.6,Y1+.5,ZB,Math.PI,1.0,1.8,{kind:'flat',fill:'L',band:or,bw:.12});}
 // the entablatures, the outer balustrade, the chapel dome over the back range
 let YT=TOP;for(const [x,z,w,d] of[[0,zf-FR/2,W,FR],[0,ZB+SR/2,W,SR],[W/2-SR/2,(ZM+ZB+SR)/2,SR,ZM-ZB-SR],[-(W/2-SR/2),(ZM+ZB+SR)/2,SR,ZM-ZB-SR]])YT=tanEntablature(x,TOP,z,w,d,0,wh,or,{dentils:false});
 tanBalustrade(0,YT,zf+.1,0,W+.2,mb,1.0,{ball:gi,gilt:gi});for(const s of[-1,1])tanBalustrade(s*(W/2+.1),YT,(zf+ZB)/2,s*Math.PI/2,zf-ZB,mb,1.0,{ball:gi,gilt:gi});
 tanDrumDome(0,YT,ZB+SR/2,2.8,{drumH:2.2,n:8,domeC:tile,ribs:12,gilt:gi,lit:true,band:or});
 for(const s of[-1,1])vnLampPost(s*(LW/2+.6),0,zf+2.2,3.2);}

// Observatory (PLAN.md 9b: on the quarter's high point): a round tower of four stages banded in orange with its slit
// windows climbing round it, a gallery on corbels with a balustrade at the top, a ribbed verdigris dome with its
// shutter slot open toward the front; a two-storey block of instrument rooms at its foot; the meridian line in the paving.
function buildTalObservatory(G,o){reseed(9671+(o.v|0));const R=4.2,TH=18,Y0=.6,TZ=-4,BW=14,BD=9,BZ=3.5,H=4;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),cu=vC(0x5a8a78),bz=BZ+BD/2;
 vnReg('Observatory (civic)',0,TZ,R+1,25,{style:'classical'});vnReg('Observatory — the instrument rooms',0,BZ,7,2*H+2,{style:'classical'});
 // the instrument block
 vB('taMarble',0,0,BZ,BW+.8,Y0,BD+.8,0,mb);vnBody('vPlaster',0,Y0,BZ,BW,2*H,BD,0,wh,{t:.3});tanString(0,Y0+H,BZ,BW,BD,0,or,.14,.22);
 tanDoor(0,Y0,bz,0,1.5,3.0,'taMarble',wh,wal,false);tanPediment(0,Y0+3.4,bz,0,2.4,.55,wh,.14,.3,or,gi);
 for(const x of[-4.4,-2.2,2.2,4.4]){if(Math.abs(x)>3)tanArch(x,Y0+.7,bz,0,1.2,2.6,{fill:'L',band:or,bw:.12,sill:wh});tanArch(x,Y0+H+.6,bz,0,1.1,2.4,{fill:'L',band:or,bw:.12,sill:wh});}
 for(const s of[-1,1])for(const u of[-2,2]){tanArch(s*BW/2,Y0+.7,BZ+u,s*Math.PI/2,1.2,2.6,{fill:'L',band:or,bw:.12,sill:wh});tanArch(s*BW/2,Y0+H+.6,BZ+u,s*Math.PI/2,1.1,2.4,{fill:'L',band:or,bw:.12,sill:wh});}
 const YB=tanEntablature(0,Y0+2*H,BZ,BW,BD,0,wh,or,{dentils:false});tanParapet(0,YB,BZ,BW+.4,BD+.4,0,mb,1.0,{ball:gi,gilt:gi});
 // the tower: the drum, its bands, the slits climbing round it, the gallery and its balustrade
 vPst('taDrumM',0,0,TZ,R+.5,Y0,mb);vPst('taDrum',0,Y0,TZ,R,TH-Y0,wh);
 for(const y of[5,9.5,14])tanArcRun(0,y,TZ,R+.08,0,TAU,.25,.25,'vPlaster',or);
 for(let k=0;k<11;k++){const a=Math.PI+k*.95,y=1.6+k*1.45;if(y<YB+.6&&Math.cos(a)>-.2)continue;tanArch(Math.sin(a)*R,y,TZ+Math.cos(a)*R,a,.5,1.2,{fill:'L',band:or,bw:.08});}
 tanArcRun(0,TH-.5,TZ,R+.3,0,TAU,.6,.5,'vPlaster',wh);tanArcRun(0,TH,TZ,R+.5,0,TAU,1.4,.25,'taMarble',wh);
 for(let k=0;k<12;k++){const a=(k+.5)*TAU/12,rr2=R+1.05;tanBalustrade(Math.sin(a)*rr2,TH+.25,TZ+Math.cos(a)*rr2,a,2*rr2*Math.sin(Math.PI/12)+.05,mb,.95,{plain:true});}
 // the dome, its ribs, the open shutter slot, a gilt ball on the crown
 vPst('taDrum',0,TH+.25,TZ,R-.2,1.2,wh);kput('taRing',[0,TH+1.45,TZ],null,[R,R,1.2],or);
 tanDome(0,TH+1.45,TZ,R,{kind:'hemi',item:'vDomeC',c:cu,ribs:12,ribItem:'taRibCu',ribC:cu});
 tanArcBand(0,TH+1.45,TZ,Math.PI/2,R+.04,.1,1.0,.5,vC(0x4a5058),Math.PI/2-.12,Math.PI-.06,10,'vIron');for(const s of[-1,1])tanArcBand(s*.56,TH+1.45,TZ,Math.PI/2,R+.1,.08,.1,.05,vC(0x2e3238),Math.PI/2-.12,Math.PI-.06,10,'vIron');
 vBeam([0,TH+1.45+R*.35,TZ+R*.2],[0,TH+1.45+R*.92,TZ+R*.92],.34,vC(0x7a6a4a),'vPipe');vBeam([0,TH+1.45+R*.88,TZ+R*.86],[0,TH+1.45+R*.98,TZ+R*1.0],.42,vC(0xc89a48),'vPipe');
 kput('taGiltBall',[0,TH+1.45+R+.05,TZ],null,[.22,.22,.22],gi);
 // the meridian line run out in the paving before the door, a gnomon at its end
 vnPaving(0,.04,bz+1.6,8,1.8,0,st,6);vB('vPlaster',0,.05,bz+1.4,.18,.03,2.6,0,or);vPst('taGiltPost',0,0,bz+2.7,.06,1.4,gi);}

// ---------------------------------------------------------------- THE COLLEGES
// College (PLAN.md 9b): a residential college round a court: rooms over a gallery on three sides, the hall on the back
// range (a tall storey of tall arched windows under a tile hip roof), the chapel's dome on its corner, a gate tower on the
// front under a melon dome. o.wealth: 'rich' (default: a marble Corinthian gallery, gilt capitals and finials, a
// balustrade, lit) or 'poor' (plain whitewash, Doric plaster columns, a plain parapet, no gilt; place it with o.lit false).
function buildTalUniCollege(G,o){reseed(9681+(o.v|0));const rich=o.wealth!=='poor',W=28,D=26,R=5,H1=3.8,H2=3.2,Y0=.3,Y1=Y0+H1+.3,TOP=Y1+H2,IW=W-2*R,ID=D-2*R,WK=2.4,HH=8.2,GT=10.6;
 const wh=TA_WH(),or=TA_OR(),mb=rich?vC(vPick(TAPAL.marble)):wh,gi=rich?vC(vPick(TAPAL.gilt)):null,st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile)),grass=vC(0x6f8f45),fl=rich?'L':'G';
 vnReg('College ('+(rich?'rich':'poor')+')',0,0,W/2,GT+3,{style:rich?'classical':'whitewash',wealth:rich?'rich':'poor'});
 vB(rich?'taMarble':'vStone',0,0,0,W+.4,Y0,D+.4,0,rich?mb:st);vB('vPlaster',0,Y0-.05,0,IW-2*WK-.2,.08,ID-2*WK-.2,0,grass);
 // the ranges: the front and sides two storeys, the hall on the back one tall storey
 vnBody('vPlaster',0,Y0,D/2-R/2,W,TOP-Y0,R,0,wh,{t:.3});for(const s of[-1,1])vnBody('vPlaster',s*(W/2-R/2),Y0,0,R,TOP-Y0,ID,0,wh,{t:.3});
 vnBody('vPlaster',0,Y0,-(D/2-R/2),W,HH-Y0,R,0,wh,{t:.3});vnHipRoof('taHipTile',0,HH,-(D/2-R/2),W,R,2.0,0,tile,.3);
 // the gallery round the court, the rooms' windows over it, the hall's tall windows over its walk
 tanCourtGallery(0,Y0,0,IW,ID,H1,WK,wh,or,{order:rich?'corinthian':'doric',r:.2,cc:mb,capC:gi||undefined,bay:3.0,gate:1.6});
 for(let k=0;k<5;k++){const u=-IW/2+WK+1+k*(IW-2*WK-2)/4;tanArch(u,Y1+.4,ID/2,Math.PI,1.0,1.9,{fill:fl,band:or,bw:.1,sill:wh});
  tanArch(u,Y1+.6,-ID/2,0,1.3,HH-Y1-1.4,{fill:fl,band:or,bw:.14,key:gi||undefined});}
 for(const s of[-1,1])for(let k=0;k<4;k++){const u=-ID/2+WK+1+k*(ID-2*WK-2)/3;tanArch(s*IW/2,Y1+.4,u,-s*Math.PI/2,1.0,1.9,{fill:fl,band:or,bw:.1,sill:wh});}
 // the outer faces
 for(let k=0;k<8;k++){const u=-W/2+2+k*(W-4)/7;if(Math.abs(u)>3.4){tanArch(u,Y0+.6,D/2,0,1.1,2.4,{fill:fl,band:or,bw:.12,sill:wh});tanArch(u,Y1+.4,D/2,0,1.0,1.9,{fill:fl,band:or,bw:.1,sill:wh});}
  tanArch(u,Y0+1.2,-D/2,Math.PI,1.3,HH-Y0-2.6,{fill:fl,band:or,bw:.14});}
 for(const s of[-1,1])for(let k=0;k<6;k++){const u=-D/2+2.5+k*(D-5)/5;if(u<-(D/2-R)){tanArch(s*W/2,Y0+1.2,u,s*Math.PI/2,1.3,HH-Y0-2.6,{fill:fl,band:or,bw:.14});continue;}
  tanArch(s*W/2,Y0+.6,u,s*Math.PI/2,1.1,2.4,{fill:fl,band:or,bw:.12,sill:wh});tanArch(s*W/2,Y1+.4,u,s*Math.PI/2,1.0,1.9,{fill:fl,band:or,bw:.1,sill:wh});}
 // the roof edges: a balustrade (rich) or a plain parapet with an orange coping (poor), on the front and side ranges
 const edge=(x,z,ry,L)=>{if(rich)tanBalustrade(x,TOP,z,ry,L,mb,1.0,{ball:gi,gilt:gi});else{vB('vPlaster',x,TOP,z,ry?.24:L,.7,ry?L:.24,0,wh);vB('vPlaster',x,TOP+.7,z,ry?.32:L+.06,.08,ry?L+.06:.32,0,or);}};
 edge(0,D/2-.1,0,W);for(const s of[-1,1])edge(s*(W/2-.1),R/2,Math.PI/2,D-R);
 // the gate tower on the front axis, its door and dome
 vB('vPlaster',0,Y0,D/2-R/2+.3,6,GT-Y0,R+.6,0,wh);tanString(0,TOP+.1,D/2-R/2+.3,6,R+.6,0,or,.12,.22);
 tanDoor(0,Y0,D/2+.6,0,2.2,3.4,rich?'taMarble':'vPlaster',or,wal,false);tanArch(0,Y1+.6,D/2+.6,0,1.2,2.2,{fill:fl,band:or,bw:.12,key:gi||undefined});
 tanArch(0,TOP+.8,D/2+.6,0,1.0,1.6,{fill:'D',band:or,bw:.1});tanString(0,GT,D/2-R/2+.3,6,R+.6,0,or,.14,.25);
 tanDome(0,GT+.25,D/2-R/2+.3,2.4,{kind:'melon',c:tile,ribs:10,ribItem:rich?'taRibGi':'taRib',ribC:rich?gi:wh,finial:gi,fr:.12});
 if(!rich)kput('taBallM',[0,GT+2.75,D/2-R/2+.3],null,[.18,.24,.18],wh);
 // the chapel on the hall's west corner
 const cx=-(W/2-3),cz=-(D/2-3);vB('vPlaster',cx,HH,cz,5.4,.8,5.4,0,wh);
 tanDrumDome(cx,HH+.8,cz,2.3,{drumH:1.9,n:8,kind:rich?'melon':'hemi',domeC:tile,ribs:rich?12:0,gilt:gi||undefined,lit:rich,band:or,lantern:rich,finial:gi||undefined});
 if(!rich)kput('taBallM',[cx,HH+.8+1.9+2.4+.1,cz],null,[.16,.22,.16],wh);
 if(rich)for(const s of[-1,1])vnLampPost(s*3.6,0,D/2+1.0,3.0);}

VERN.def({key:'tal_uni_hall',name:'University great hall',family:'civic',tags:TA_TAG('classical','civic',['civic'],true),w:44,d:24,h:31,build:buildTalUniHall});
VERN.def({key:'tal_uni_cloister',name:'University cloister',family:'civic',tags:TA_TAG('classical','civic',['civic'],true),w:40,d:42,h:18,build:buildTalUniCloister});
VERN.def({key:'tal_uni_library',name:'University library',family:'civic',tags:TA_TAG('classical','civic',['civic'],true),w:26,d:34,h:26,build:buildTalUniLibrary});
VERN.def({key:'tal_uni_senate',name:'University Senate house',family:'civic',tags:TA_TAG('baroque','civic',['civic'],true),w:28,d:24,h:20,build:buildTalUniSenate});
VERN.def({key:'tal_uni_faculty',name:'University faculty',family:'civic',tags:TA_TAG('classical','civic',['civic'],true),w:40,d:20,h:18,build:buildTalUniFaculty});
VERN.def({key:'tal_uni_anatomy',name:'Anatomy theatre',family:'civic',tags:TA_TAG('classical','civic',['civic'],true),w:18,d:20,h:20,build:buildTalUniAnatomy});
VERN.def({key:'tal_uni_hospital',name:'Teaching hospital',family:'civic',tags:TA_TAG('classical','civic',['civic'],true),w:38,d:30,h:20,build:buildTalUniHospital});
VERN.def({key:'tal_observatory',name:'Observatory',family:'civic',tags:TA_TAG('classical','civic',['civic'],true),w:16,d:20,h:25,build:buildTalObservatory});
VERN.def({key:'tal_uni_college',name:'College',family:'civic',tags:TA_TAG('classical','civic',['civic','multi-family dwelling'],true),w:30,d:28,h:16,build:buildTalUniCollege});
