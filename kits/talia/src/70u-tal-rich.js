// ================================================================= 70u. TALIA: the rich dwellings (kits/talia/PLAN.md section 4)
// Marble and gilt (the owner, 2026-10-17: generously on rich and civic work), lit glazing and lamps (the lighting rule:
// rich and civic only), the baroque dress (pilasters, entablatures, scroll gables, balustrades, the imperial stair), the
// Indian upper storeys (jharokhas, kiosks, jali) and the drum-dome crown. Seeds 9461-9489.

// Palazzo (refs/talia (2).jpg): the showy house: orange walls with every frame white, a podium with an imperial stair,
// white pilasters between five bays, a gilt frieze under a dentilled cornice, pedimented windows on the piano nobile, a
// balustraded balcony on the centre bay, a scroll gable with a gilt ball over it, a drum-dome behind the roof balustrade.
function buildTalPalazzo(G,o){reseed(9461+(o.v|0));const W=16,D=12,H1=4.4,H2=3.6,Y0=1.4,Z0=-2.6,zf=Z0+D/2,BAY=3.2;
 const or=vC(vPick(TAPAL.orange)),wh=TA_WH(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('Palazzo (rich)',0,Z0,10,Y0+H1+H2+6.6,{style:'baroque'});
 // the podium and the imperial stair up to it
 vB('taMarble',0,0,Z0,W+1.6,Y0,D+1.6,0,mb);vB('taMarble',0,Y0,Z0,W+1.8,.14,D+1.8,0,wh);
 tanImperialStair(0,0,zf+.8,0,3.6,Y0,mb,or,{gilt:gi});
 for(const s of[-1,1]){tanBalustrade(s*(W/2+.8),Y0+.14,Z0,s*Math.PI/2,D+1.6,mb,1.0,{ball:gi,gilt:gi});tanBalustrade(s*(W/4+2.6),Y0+.14,zf+.8,0,W/2-3.4,mb,1.0,{ball:gi,gilt:gi});}
 tanBalustrade(0,Y0+.14,Z0-D/2-.8,Math.PI,W+1.6,mb,1.0,{ball:gi,gilt:gi});
 // the ground storey: orange, round-arched lit windows in white bands with keystones, the door on the axis
 vnBody('vPlaster',0,Y0,Z0,W,H1,D,0,or,{t:.35});
 for(let j=0;j<5;j++){const x=(j-2)*BAY;if(j===2)continue;tanArch(x,Y0+.5,zf,0,1.5,3.0,{fill:'L',band:wh,bw:.16,key:gi,sill:wh});}
 tanDoor(0,Y0,zf,0,1.5,3.2,'taMarble',wh,wal,false);tanArcBand(0,Y0+3.2,zf,0,.85,.2,.14,.08,wh,0,Math.PI);tanDiscAt('taDiscL',0,Y0+3.2,zf,0,.75,.03,.1,null);
 for(const s of[-1,1])for(const zz of[Z0-3,Z0+1])tanArch(s*W/2,Y0+.5,zz,s*Math.PI/2,1.4,2.9,{fill:'L',band:wh,bw:.16,key:gi,sill:wh});
 for(let j=0;j<6;j++){const x=(j-2.5)*BAY;tanPilaster(x,Y0,zf,0,.6,H1,wh,gi);}
 tanString(0,Y0+H1,Z0,W,D,0,wh,.22,.3);
 // the piano nobile: tall flat-headed lit windows with white architraves and pediments, the centre bay a glazed door
 // onto a balustraded balcony; pilasters again; the entablature with a gilt frieze and dentils
 const Y1=Y0+H1+.3;vnBody('vPlaster',0,Y1,Z0,W,H2,D,0,or,{t:.35});
 for(let j=0;j<5;j++){const x=(j-2)*BAY;tanArch(x,Y1+.6,zf,0,1.3,2.5,{kind:'flat',fill:'L',band:wh,bw:.16,sill:wh});tanPediment(x,Y1+3.15,zf,0,1.9,.5,wh,.14,.3,j===2?gi:null);}
 vB('taMarble',0,Y1-.1,zf+.6,5.2,.22,1.3,0,wh);tanBalustrade(0,Y1+.12,zf+1.2,0,5.0,mb,.95,{ball:gi,gilt:gi});
 for(const s of[-1,1])tanBalustrade(s*2.5,Y1+.12,zf+.6,s*Math.PI/2,1.2,mb,.95,{});
 for(const s of[-1,1])for(const zz of[Z0-3,Z0+1])tanArch(s*W/2,Y1+.6,zz,s*Math.PI/2,1.2,2.4,{kind:'flat',fill:'L',band:wh,bw:.16,sill:wh});
 for(let j=0;j<6;j++){const x=(j-2.5)*BAY;tanPilaster(x,Y1,zf,0,.6,H2,wh,gi);}
 const YT=tanEntablature(0,Y1+H2,Z0,W,D,0,wh,gi,{});
 // the roof: a balustrade, the scroll gable over the centre bay, the drum and dome behind
 tanParapet(0,YT,Z0,W+.6,D+.6,0,mb,1.0,{ball:gi,gilt:gi});
 tanScrollGable(0,YT-.1,zf+.5,0,5.4,1.9,wh,.14,gi);
 vB('vPlaster',0,YT,Z0,W-.4,.3,D-.4,0,or);
 tanDrumDome(0,YT+.3,Z0-.6,2.6,{drumH:2.4,n:8,domeC:tile,ribs:12,gilt:gi,lit:true,band:wh,pil:true,pilC:wh,kind:'melon'});
 for(const s of[-1,1])tanKiosk(s*(W/2-1.6),YT+.3,Z0-D/2+1.8,1.0,2.0,6,wh,{order:'corinthian',capC:gi,domeC:tile,ribC:gi,ribItem:'taRibGi',finial:gi,fr:.07});
 // the lamps: lamp posts at the stair's foot and on the podium's corners
 for(const s of[-1,1]){vnLampPost(s*3.2,0,zf+7.2,3.2);vnLampPost(s*(W/2+.5),Y0+.14,zf+.5,2.6);}
 vnPaving(0,.04,zf+8.4,14,1.6,0,st,8);tanMeander(0,Y0+.14,zf+.3,W-1,1.2,0,or,.3);}

// Jharokha house (refs/talia3.jpg): the Hawa Mahal front: a tall white house whose street face is stacked jharokha bays
// under small ribbed cupolas, a cusped and gilt-banded arcade on the ground floor, the parapet rising in steps to a
// central crown under an egg dome; several households. Lit.
function buildTalJharokhaHouse(G,o){reseed(9471+(o.v|0));const W=14,D=11,H=3.4,N=4,Y0=.6,Z0=-1.6,zf=Z0+D/2,TOP=Y0+N*H;
 const wh=TA_WH(),or=vC(vPick(TAPAL.orange)),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('Jharokha house (rich, shared)',0,Z0,8.6,TOP+6.4,{style:'indic',type:['multi-family dwelling']});
 vB('taMarble',0,-.1,Z0,W+.6,Y0+.1,D+.6,0,mb);vnStairs(0,0,zf+.6,0,6,Y0,3,'taMarble',mb);
 for(let k=0;k<N;k++){const y=Y0+k*H;vnBody('vPlaster',0,y,Z0,W,H,D,0,wh,{t:.3});if(k>0)tanString(0,y-.06,Z0,W,D,0,or,.1,.12);
  if(k===0){for(const x of[-4.2,4.2])tanArch(x,y,zf,0,2.4,3.0,{kind:'cusp',fill:'L',band:or,bw:.14,gilt:true,lobes:5});tanDoor(0,y,zf,0,1.4,2.8,'taMarble',wh,wal,false);
   tanArcBand(0,y+2.8,zf,0,.8,.14,.14,.08,or,0,Math.PI,8,'taGilt');tanDiscAt('taDiscL',0,y+2.8,zf,0,.7,.03,.1,null);}
  else for(const x of[-4.2,0,4.2])tanJharokha(x,y+.3,zf,0,2.6,H-.5,1.2,wh,or,{fill:'L',domeC:tile,finial:k===N-1?gi:null});
  for(const s of[-1,1])for(const zz of[Z0-3,Z0+.6])tanArch(s*W/2,y+.8,zz,s*Math.PI/2,1.1,2.0,{kind:k?'cusp':'round',fill:'L',band:or,bw:.12,sill:wh});
  for(const x of[-3.6,0,3.6])tanArch(x,y+.8,Z0-D/2,Math.PI,1.1,2.0,{fill:'L',band:or,bw:.12,sill:wh});}
 // the crown: the parapet in steps to a centre block under an egg dome on a drum; kiosks on the corners
 vB('vPlaster',0,TOP,Z0,W+.2,.24,D+.2,0,or);
 for(const [w,h] of[[W,.9],[9,1.5],[5.4,2.4]])vB('vPlaster',0,TOP+.24,zf-.4,w,h,.8,0,wh);
 vB('vPlaster',0,TOP+.24,Z0,W,.9,D,0,wh);vB('vPlaster',0,TOP+.24,Z0,W-.6,.9,D-.6,0,wh);
 for(let j=0;j<7;j++)vB('vPlaster',-W/2+1+j*2,TOP+1.14,zf-.4,.5,.4,.7,0,or);
 tanDrumDome(0,TOP+2.64,zf-.4-1.4,1.9,{drumH:1.4,n:6,kind:'egg',domeC:tile,ribs:8,gilt:gi,lit:true,band:wh});
 for(const s of[-1,1])tanKiosk(s*(W/2-1.4),TOP+1.14,Z0-D/2+1.6,.9,1.8,6,wh,{order:'plain',domeC:tile,ribC:gi,ribItem:'taRibGi',finial:gi,fr:.06});
 for(const s of[-1,1])vnLampPost(s*4,0,zf+2.4,3);vnPaving(0,.04,zf+2.6,14,1.8,0,st,8);}

// Peristyle villa (PLAN.md): a white courtyard house behind a wall with a gilt-banded cusped gate: an Ionic peristyle
// round the court with a walk over it, the house at the back in two storeys of lit round arches under an orange frieze,
// a domed pavilion in the court, a pool with a mosaic medallion, palms. Lit.
function buildTalPeristyleVilla(G,o){reseed(9481+(o.v|0));const CW=27,CD=23,WH=2.6,HW=18,HD=8,H1=4.2,H2=3.4,Y0=.5,HZ=-CD/2+HD/2+.3,PR=2.2;
 const wh=TA_WH(),or=vC(vPick(TAPAL.orange)),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile)),cu=vC(0x5a8a78);
 vnReg('Peristyle villa (rich)',0,HZ,10,Y0+H1+H2+5,{style:'classical'});vnReg('Peristyle villa — court',0,4,11,WH+4,{style:'classical'});
 // the court wall and its gate
 for(const s of[-1,1]){vB('vPlaster',s*(CW/2-.2),0,0,.4,WH,CD,0,wh);vB('vPlaster',s*(CW/2-.2),WH,0,.6,.14,CD+.2,0,or);
  vB('vPlaster',s*(CW/4+1.5),0,CD/2-.2,CW/2-3,WH,.4,0,wh);vB('vPlaster',s*(CW/4+1.5),WH,CD/2-.2,CW/2-2.9,.14,.6,0,or);}
 vB('vPlaster',0,0,CD/2-.3,6,WH+1.2,.6,0,wh);tanArch(0,0,CD/2,0,2.6,3.2,{kind:'cusp',fill:'D',band:or,bw:.16,gilt:true,lobes:5,key:gi});
 vB('vPlaster',0,WH+1.2,CD/2-.3,6.4,.2,.9,0,or);tanFinial(0,WH+1.4,CD/2-.3,.14,gi);
 vB('taMarble',0,0,CD/2+.2,3.2,.12,1.4,0,mb);
 // the peristyle: Ionic columns along the two sides and the front wall, under a walk's slab in white with an orange edge
 for(const s of[-1,1]){tanColonnade(s*(CW/2-PR),Y0-.4,.4,0,CD-2*PR-1.2,6,3.6,.22,'ionic',mb,gi,0);
  vB('vPlaster',s*(CW/2-PR/2-.2),Y0-.4+3.6,.4,PR+.4,.3,CD-2*PR+.4,0,wh);vB('vPlaster',s*(CW/2-PR-.1),Y0-.4+3.9,.4,.2,.12,CD-2*PR+.4,0,or);}
 tanColonnade(0,Y0-.4,CD/2-PR,0,CW-2*PR-1.2,7,3.6,.22,'ionic',mb,gi,0);
 vB('vPlaster',0,Y0-.4+3.6,CD/2-PR/2-.2,CW-2*PR-.4,.3,PR+.4,0,wh);
 vB('taMarble',0,Y0-.4,0,CW-.8,.1,CD-.8,0,mb);
 // the house at the back: two storeys, the ground storey an arcade of lit round arches, the upper with pedimented windows
 vB('taMarble',0,-.1,HZ,HW+1,Y0+.1,HD+1,0,mb);vnStairs(0,0,HZ+HD/2+.6,0,4,Y0,3,'taMarble',mb);
 vnBody('vPlaster',0,Y0,HZ,HW,H1,HD,0,wh,{t:.35});const hf=HZ+HD/2;
 for(let j=0;j<5;j++){const x=(j-2)*3.4;if(j===2)continue;tanArch(x,Y0+.4,hf,0,1.6,3.2,{fill:'L',band:or,bw:.16,gilt:true,key:gi,sill:mb});}
 tanDoor(0,Y0,hf,0,1.5,3.0,'taMarble',wh,wal,false);tanArcBand(0,Y0+3.0,hf,0,.85,.16,.14,.08,or,0,Math.PI,8,'taGilt');tanDiscAt('taDiscL',0,Y0+3.0,hf,0,.75,.03,.1,null);
 for(let j=0;j<6;j++)tanPilaster((j-2.5)*3.4,Y0,hf,0,.5,H1,wh,gi);
 tanString(0,Y0+H1,HZ,HW,HD,0,or,.2,.3);
 const Y1=Y0+H1+.3;vnBody('vPlaster',0,Y1,HZ,HW,H2,HD,0,wh,{t:.35});
 for(let j=0;j<5;j++){const x=(j-2)*3.4;tanArch(x,Y1+.5,hf,0,1.3,2.3,{kind:'flat',fill:'L',band:or,bw:.14,sill:mb});tanPediment(x,Y1+2.85,hf,0,1.9,.45,wh,.12,.3,j===2?gi:null);}
 for(const s of[-1,1])for(const yy of[Y0+.6,Y1+.5])tanArch(s*HW/2,yy,HZ,s*Math.PI/2,1.3,2.4,{fill:'L',band:or,bw:.14,sill:mb});
 for(const x of[-5,0,5])tanArch(x,Y1+.5,HZ-HD/2,Math.PI,1.3,2.3,{fill:'L',band:or,bw:.14,sill:mb});
 const YT=tanEntablature(0,Y1+H2,HZ,HW,HD,0,wh,or,{});tanParapet(0,YT,HZ,HW+.5,HD+.5,0,mb,1.0,{ball:gi,gilt:gi});
 tanDrumDome(0,YT,HZ,2.2,{drumH:1.8,n:8,domeC:cu,item:'vDomeC',ribs:8,gilt:gi,lit:true,band:wh,lanternC:cu});
 // the pavilion in the court, the pool with its medallion, palms and lamps
 tanKiosk(CW/2-PR-4.2,Y0-.4,CD/2-PR-5.0,2.0,3.4,8,mb,{order:'corinthian',capC:gi,domeC:tile,ribC:gi,ribItem:'taRibGi',finial:gi,fr:.08});
 vB('taMarble',-3,Y0-.4,1.6,7,.4,5,0,mb);vB('vWinGlass',-3,Y0-.4+.3,1.6,6.4,.08,4.4,0,null);tanMosaicRing(-3,Y0-.4+.1,-2.4,1.3,or,wh);
 for(const [x,z] of[[-9,-5],[6,2],[-8,6]]){vPst('vPostB',x,Y0-.4,z,.16,4.2,vC(0x8a7a5a));for(let k=0;k<6;k++){const a=k*TAU/6;kput('vLeaf',[x+Math.sin(a)*.9,Y0+3.9,z+Math.cos(a)*.9],vQ(a,0,0),[1.6,.3,.7],vC(vPick([0x4e7a3a,0x5a8a44])));}}
 for(const s of[-1,1]){vnLampPost(s*2.4,0,CD/2+1.2,3);vnLampPost(s*6,Y0-.4,CD/2-PR-3,2.6);}
 vnPaving(0,.04,CD/2+1.6,8,1.6,0,st,6);}

VERN.def({key:'tal_palazzo',name:'Palazzo',family:'dwelling',tags:TA_TAG('baroque','rich',null,true),w:26,d:22,h:20,build:buildTalPalazzo});
VERN.def({key:'tal_jharokha_house',name:'Jharokha house',family:'dwelling',tags:TA_TAG('indic','rich',['multi-family dwelling'],true),w:18,d:16,h:24,build:buildTalJharokhaHouse});
VERN.def({key:'tal_peristyle_villa',name:'Peristyle villa',family:'dwelling',tags:TA_TAG('classical','rich',null,true),w:30,d:26,h:16,build:buildTalPeristyleVilla});
