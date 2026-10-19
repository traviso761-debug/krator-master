// ================================================================= 71t. TALIA: trade and the caravan buildings (kits/talia/PLAN.md section 4)
// The caravan city's trade: the Emperor's customs on the east road, the exchange, the caravanserai, the agora's stoa,
// shops, stores, the baths, the inn and the University's printers. Civic (the customs, the bourse, the baths) is lit,
// gilt and marble; the rest is middle: whitewash, orange bands, no gilt and no light. Seeds 9501-9599. Every face is
// finished and nothing stands outside the def's w x d (settlements/iziz/VASSAL-KITS.md section 2).

// ---------------------------------------------------------------- CIVIC: the customs, the bourse, the baths
// Customs house: the Emperor's customs on the east road: a baroque front of five bays on a podium up an imperial stair,
// an ochre ground storey of lit arches between white pilasters, a white piano nobile with pedimented windows and a
// balcony, a gilt frieze, a scroll gable with the Emperor's gilt sun, a melon drum-dome; behind it the weighing court
// (the great beam balance) between two bonded stores under barrel vaults, their doors sealed with the gilt seal, and
// the road gate in the back wall. Civic, lit, gilt.
function buildTalCustomsHouse(G,o){reseed(9501+(o.v|0));const W=22,D=10,H1=5.2,H2=4.2,Y0=1.2,Z0=4.5,zf=Z0+D/2,BAY=4.2,SW=6,SD=14,CZ=-7.5,SX=14,ZB=-14.8;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile)),oc=vC(vPick(TAPAL.ochre)),ir=TA_IR(),wood=vC(vPick(VPAL.woodMid));
 vnReg('Customs house (civic)',0,Z0,12,Y0+H1+H2+8.5,{style:'baroque'});vnReg('Customs house — weighing court',0,CZ,9,8,{style:'baroque'});
 // the podium, the imperial stair on the axis, balustrades along the podium's front
 vB('taMarble',0,0,Z0,W+1.2,Y0,D+1.2,0,mb);vB('taMarble',0,Y0,Z0,W+1.4,.14,D+1.4,0,wh);
 tanImperialStair(0,0,zf+.6,0,3.4,Y0,mb,or,{gilt:gi});
 for(const s of[-1,1])tanBalustrade(s*7.9,Y0+.14,zf+.6,0,7.2,mb,1.0,{ball:gi,gilt:gi});
 // the ground storey: ochre, round lit arches in white bands with gilt keystones, white pilasters, the door on the axis
 vnBody('vPlaster',0,Y0,Z0,W,H1,D,0,oc,{t:.35});
 for(let j=0;j<5;j++){const x=(j-2)*BAY;if(j===2)continue;tanArch(x,Y0+.6,zf,0,1.8,3.4,{fill:'L',band:wh,bw:.16,key:gi,sill:wh});}
 tanDoor(0,Y0,zf,0,1.8,3.4,'taMarble',wh,wal,false);tanArcBand(0,Y0+3.4,zf,0,1.0,.2,.14,.08,wh,0,Math.PI,10,'taGilt');tanDiscAt('taDiscL',0,Y0+3.4,zf,0,.9,.03,.1,null);
 for(const s of[-1,1])for(const zz of[Z0-2.5,Z0+2.5])tanArch(s*W/2,Y0+.6,zz,s*Math.PI/2,1.5,3.2,{fill:'L',band:wh,bw:.16,key:gi,sill:wh});
 for(let j=0;j<6;j++)tanPilaster((j-2.5)*BAY,Y0,zf,0,.7,H1,wh,gi);
 tanString(0,Y0+H1,Z0,W,D,0,wh,.22,.3);
 // the piano nobile: white, flat-headed lit windows under pediments (the centre one's tympanum gilt), a balcony on the
 // centre bay, the entablature with a gilt frieze
 const Y1=Y0+H1+.3;vnBody('vPlaster',0,Y1,Z0,W,H2,D,0,wh,{t:.35});
 for(let j=0;j<5;j++){const x=(j-2)*BAY;tanArch(x,Y1+.6,zf,0,1.4,2.7,{kind:'flat',fill:'L',band:or,bw:.16,sill:mb});tanPediment(x,Y1+3.35,zf,0,2.1,.55,wh,.14,.3,j===2?gi:or);}
 vB('taMarble',0,Y1-.1,zf+.6,5.4,.22,1.3,0,wh);tanBalustrade(0,Y1+.12,zf+1.2,0,5.2,mb,.95,{ball:gi,gilt:gi});for(const s of[-1,1])tanBalustrade(s*2.6,Y1+.12,zf+.6,s*Math.PI/2,1.2,mb,.95,{});
 for(const s of[-1,1])for(const zz of[Z0-2.5,Z0+2.5])tanArch(s*W/2,Y1+.6,zz,s*Math.PI/2,1.3,2.5,{kind:'flat',fill:'L',band:or,bw:.14,sill:mb});
 for(let j=0;j<6;j++)tanPilaster((j-2.5)*BAY,Y1,zf,0,.7,H2,wh,gi);
 const YT=tanEntablature(0,Y1+H2,Z0,W,D,0,wh,gi,{});
 // the roof: a gilt-balled balustrade, the scroll gable with the Emperor's sun, the drum-dome behind
 tanParapet(0,YT,Z0,W+.6,D+.6,0,mb,1.0,{ball:gi,gilt:gi});
 tanScrollGable(0,YT-.1,zf+.5,0,6,2.0,wh,.14,gi);kput('taDiscGi',[0,YT+.9,zf+.76],vQ(0,0,0),[.7,.7,.12],gi);
 vB('vPlaster',0,YT,Z0,W-.4,.3,D-.4,0,wh);
 tanDrumDome(0,YT+.3,Z0-.5,2.4,{drumH:2.0,n:8,domeC:tile,ribs:12,gilt:gi,lit:true,band:wh,pil:true,pilC:wh,kind:'melon'});
 // the bonded stores: two vaulted ranges down the court's sides, their doors on the court with the gilt seal over each
 for(const s of[-1,1]){const x=s*SX;vB('vStone',x,-.1,CZ,SW+.3,.4,SD+.3,0,st);vnBody('vPlaster',x,.3,CZ,SW,4.3,SD,0,wh,{t:.35});
  tanString(x,4.5,CZ,SW,SD,0,or,.12,.14);tanVault(x,4.64,CZ,0,SW/2,SD,wh,'taVault',wh);
  for(const zz of[CZ-3.5,CZ+3.5]){tanArch(x-s*SW/2,.3,zz,-s*Math.PI/2,2.4,3.2,{kind:'flat',fill:'D',band:or,bw:.14});kput('taDiscGi',[x-s*(SW/2+.1),4.0,zz],vQ(-s*Math.PI/2,0,0),[.32,.32,.1],gi);}
  for(const zz of[CZ-5.2,CZ,CZ+5.2])tanArch(x+s*SW/2,2.6,zz,s*Math.PI/2,.8,1.3,{fill:'D',band:or,bw:.1});
  tanArch(x,2.6,CZ-SD/2,Math.PI,.8,1.3,{fill:'D',band:or,bw:.1});vnLampPost(x-s*(SW/2+.6),0,CZ+SD/2-1,3);}
 // the back wall with the road gate: a round arch, pedimented on the road side under the sun
 for(const s of[-1,1])vB('vPlaster',s*6.9,0,ZB,8.2,5.2,.6,0,wh);vB('vPlaster',0,5.2,ZB,W+.2,.2,.8,0,or);
 vB('vPlaster',0,0,ZB,6.2,6.2,.9,0,wh);tanArch(0,0,ZB+.45,0,3.6,4.6,{fill:'D',band:or,bw:.2,key:gi});tanArch(0,0,ZB-.45,Math.PI,3.6,4.6,{fill:'D',band:or,bw:.2,key:gi});
 tanPediment(0,6.2,ZB-.45,Math.PI,6.6,1.1,wh,.1,.9,or,gi);kput('taDiscGi',[0,6.7,ZB-.62],vQ(Math.PI,0,0),[.4,.4,.1],gi);
 // the weighing court: paving, the great beam balance on its post, sacks on one pan and the weights on the other, bales
 vnPaving(0,.04,CZ,20,12,0,st,36);tanMosaicRing(0,.02,CZ+4.5,1.6,or,wh);
 vPst('vPostB',0,0,CZ,.3,5.0,wood);for(const [dx,dz] of[[1.3,1.3],[-1.3,1.3],[1.3,-1.3],[-1.3,-1.3]])vBeam([dx,0,CZ+dz],[0,4.4,CZ],.14,wood,'vWood');
 vB('vWood',0,5.0,CZ,7.4,.3,.3,0,wood);kput('taRingGi',[0,5.15,CZ],vQ(0,Math.PI/2,0),[.4,.4,.4],gi);
 for(const s of[-1,1]){vBeam([s*3.4,5.0,CZ],[s*3.4,2.1,CZ],.04,ir,'vIron');vB('vIron',s*3.4,2.0,CZ,1.6,.08,1.6,0,ir);}
 vnSacks(3.4,2.08,CZ,3);vB('vIron',-3.4,2.08,CZ,.5,.4,.5,0,ir);vB('vIron',-3.0,2.08,CZ+.5,.3,.25,.3,0,ir);
 vnCrate(-6,0,CZ-4,1.0,.2,wood);vnCrate(-6.8,0,CZ-2.6,.8,-.3,wood);vnSacks(6.5,0,CZ-4,4);vnBarrel(6.5,0,CZ+3,.4,1.0,null);
 vnPaving(0,.04,zf+6.6,16,1.6,0,st,10);for(const s of[-1,1])vnLampPost(s*4.4,0,zf+5.2,3.2);}

// Bourse: the caravan exchange: a square hall on a podium, lit round arches on its ground tier behind a Corinthian
// arcade that runs round it under a gilt-friezed entablature and a balustraded walk, a second tier of flat-headed lit
// windows between gilt-capped pilasters, an attic band and the great drum-dome with its lantern; kiosks on the walk's
// corners. (The trading floor inside is taliaint3: P6.) Civic, lit, gilt.
function buildTalBourse(G,o){reseed(9511+(o.v|0));const HW=16,HD=16,H=10,Y0=1.0,WK=3.2,PW=HW+2*WK,PD=HD+2*WK,HC=5.2,Z0=-1.5,zf=Z0+HD/2,pf=Z0+PD/2;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('Bourse (civic)',0,Z0,13,Y0+H+14,{style:'classical',type:['civic','market/shop']});
 // the podium and the stair across its front
 vB('taMarble',0,0,Z0,PW+2.4,Y0,PD+2.4,0,mb);vB('taMarble',0,Y0,Z0,PW+2.6,.12,PD+2.6,0,wh);vnStairs(0,0,pf+2.0,0,8,Y0,5,'taMarble',mb);
 // the hall's ground tier: three lit arches a face in gilt-banded orange, the door on the front axis
 vnBody('vPlaster',0,Y0,Z0,HW,H,HD,0,wh,{t:.4});
 for(const [lx,lz,a] of[[0,HD/2,0],[0,-HD/2,Math.PI],[HW/2,0,Math.PI/2],[-HW/2,0,-Math.PI/2]])for(let j=-1;j<=1;j++){const g=loc(0,Z0,lx,lz,0);const c=loc(g[0],g[1],j*4.6,0,a);if(a===0&&j===0){tanDoor(c[0],Y0,c[1],a,2.0,3.6,'taMarble',wh,wal,false);tanArcBand(c[0],Y0+3.6,c[1],a,1.1,.2,.14,.08,or,0,Math.PI,10,'taGilt');tanDiscAt('taDiscL',c[0],Y0+3.6,c[1],a,1.0,.03,.1,null);continue;}
  tanArch(c[0],Y0+.5,c[1],a,2.0,4.0,{fill:'L',band:or,bw:.16,gilt:true,key:gi,sill:mb});}
 // the arcade round it: Corinthian columns at the walk's edge (each corner once), orange arch bands between, the
 // entablature over the walk and its balustrade, a kiosk on each corner
 const n=5;[[0,-PD/2,Math.PI,PW],[0,PD/2,0,PW],[PW/2,0,Math.PI/2,PD],[-PW/2,0,-Math.PI/2,PD]].forEach(([lx,lz,a,L])=>{const f=loc(0,Z0,lx,lz,0),b=L/n,r=b/2-.7,hc=HC-r-.3;
  for(let k=0;k<n;k++){const p=loc(f[0],f[1],-L/2+k*b,0,a);tanColumn(p[0],Y0+.12,p[1],hc,.28,'corinthian',mb,gi);const q=loc(f[0],f[1],-L/2+(k+.5)*b,0,a);tanArcBand(q[0],Y0+.12+hc+.1,q[1],a,r+.07,.18,.5,.06,or,0,Math.PI,10);}});
 const YT1=tanEntablature(0,Y0+HC,Z0,PW,PD,0,wh,gi,{});tanParapet(0,YT1,Z0,PW+.4,PD+.4,0,mb,1.0,{ball:gi,gilt:gi});
 for(const sx of[-1,1])for(const sz of[-1,1])tanKiosk(sx*(PW/2-1.5),YT1,Z0+sz*(PD/2-1.5),1.0,2.0,6,wh,{order:'corinthian',capC:gi,domeC:tile,ribC:gi,ribItem:'taRibGi',finial:gi,fr:.07});
 // the second tier above the walk: flat-headed lit windows between gilt-capped pilasters, the entablature, the attic
 const Y2=YT1+.4;for(const [lx,lz,a] of[[0,HD/2,0],[0,-HD/2,Math.PI],[HW/2,0,Math.PI/2],[-HW/2,0,-Math.PI/2]]){const g=loc(0,Z0,lx,lz,0);
  for(let j=-1;j<=1;j++){const c=loc(g[0],g[1],j*4.6,0,a);tanArch(c[0],Y2,c[1],a,1.5,2.0,{kind:'flat',fill:'L',band:or,bw:.14,sill:mb});tanPediment(c[0],Y2+2.5,c[1],a,2.1,.4,wh,.12,.3,j===0?gi:null);}
  for(let j=0;j<4;j++){const c=loc(g[0],g[1],(j-1.5)*4.6,0,a);tanPilaster(c[0],YT1+.1,c[1],a,.6,Y0+H-YT1-.1,wh,gi);}}
 const YT2=tanEntablature(0,Y0+H,Z0,HW,HD,0,wh,gi,{});vB('vPlaster',0,YT2,Z0,HW-1.2,.8,HD-1.2,0,or);
 for(const s of[-1,1])for(const u of[-4,0,4]){tanArch(u,YT2+.15,Z0+s*(HD/2-.6),s>0?0:Math.PI,.7,.5,{kind:'flat',fill:'D',band:wh,bw:.08});tanArch(s*(HW/2-.6),YT2+.15,Z0+u,s*Math.PI/2,.7,.5,{kind:'flat',fill:'D',band:wh,bw:.08});}
 tanDrumDome(0,YT2+.8,Z0,4.8,{drumH:2.4,n:12,domeC:tile,ribs:16,gilt:gi,lit:true,band:wh,pil:true,pilC:wh});
 // lamps at the stair's foot and on the podium's front corners, the paving before the stair
 for(const s of[-1,1]){vnLampPost(s*5.2,0,pf+3.0,3.2);vnLampPost(s*(PW/2+1.0),Y0+.12,pf+1.0,2.6);}
 vnPaving(0,.04,pf+3.6,20,1.8,0,st,10);tanMeander(0,Y0+.12,pf+.2,PW-2,1.4,0,or,.3);}

// ---------------------------------------------------------------- THE CARAVAN ROAD: the caravanserai, the stoa, the warehouse
// Caravanserai: a Talian caravanserai: a white walled block of two storeys round a court, a tall gate block with a round
// arch through it and a jharokha over the gate, round corner towers under melon domes; inside, a gallery on two storeys
// (Doric below, a plain balustrade above) round the court, the camel bays off the back walk (troughs and straw), the
// well in the middle; the crawler bays open through the back wall to the road. Middle: no gilt, no light. Several
// households' worth of lodging.
function buildTalCaravanserai(G,o){reseed(9521+(o.v|0));const W=36,D=30,R=5,H1=3.8,H2=3.2,TOP=H1+H2,IW=W-2*R,ID=D-2*R,WK=2.4,Y0=.2,GZ=D/2-R/2;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile)),cr=vC(vPick(TAPAL.marble)),wood=vC(vPick(VPAL.woodMid)),straw=vC(0xc9a85a);
 vnReg('Caravanserai (middle, shared)',0,0,19,Y0+TOP+4.4,{style:'whitewash',type:['tavern/inn','market/shop','multi-family dwelling']});
 vB('vStone',0,-.1,0,W+.4,Y0+.1,D+.4,0,st);
 // the four ranges (the front one in two halves either side of the gate), a string course at the floor line
 vnBody('vPlaster',0,Y0,-D/2+R/2,W,TOP,R,0,wh,{t:.3});tanString(0,Y0+H1,-D/2+R/2,W,R,0,or,.12,.14);
 for(const s of[-1,1]){vnBody('vPlaster',s*(W/2-R/2),Y0,0,R,TOP,D-2*R,0,wh,{t:.3});tanString(s*(W/2-R/2),Y0+H1,0,R,D-2*R-.3,0,or,.12,.14);
  vnBody('vPlaster',s*10.5,Y0,GZ,15,TOP,R,0,wh,{t:.3});tanString(s*10.5,Y0+H1,GZ,15-.3,R,0,or,.12,.14);}
 // the parapet: the outer ring and the court ring, each wall .24 thick with an orange coping
 const par=(x,z,L,a)=>{vB('vPlaster',x,Y0+TOP,z,L,.6,.24,a,wh);vB('vPlaster',x,Y0+TOP+.6,z,L+.06,.08,.32,a,or);};
 par(0,D/2-.12,W,0);par(0,-D/2+.12,W,0);par(W/2-.12,0,D-.5,Math.PI/2);par(-W/2+.12,0,D-.5,Math.PI/2);
 par(0,ID/2+.12,IW+.24,0);par(0,-ID/2-.12,IW+.24,0);par(IW/2+.12,0,ID-.3,Math.PI/2);par(-IW/2-.12,0,ID-.3,Math.PI/2);
 // the gate block: taller, proud of the front, the arch through it on both faces, the jharokha over the gate, a parapet
 vB('vPlaster',0,Y0,GZ,6,TOP+2.6,R+.6,0,wh);const gf=D/2+.3,gb=D/2-R-.3;
 tanArch(0,Y0,gf,0,3.6,5.0,{fill:'D',band:or,bw:.2,key:wh});tanArch(0,Y0,gb,Math.PI,3.6,5.0,{fill:'D',band:or,bw:.2,key:wh});
 tanJharokha(0,Y0+6.4,gf,0,3.0,2.4,1.2,wh,or,{fill:'D',domeC:tile});
 for(const [x,z,L,a] of[[0,gf-.12,6,0],[0,gb+.12,6,0],[3-.12,GZ,R+.6-.5,Math.PI/2],[-3+.12,GZ,R+.6-.5,Math.PI/2]]){vB('vPlaster',x,Y0+TOP+2.6,z,L,.5,.24,a,wh);vB('vPlaster',x,Y0+TOP+3.1,z,L+.06,.08,.32,a,or);}
 // the outer faces: the upper storey's small arched windows in orange bands, slits below; the crawler bays through the
 // back wall (two wide flat openings, a stone ramp, fuel drums and a standpipe)
 for(const s of[-1,1]){for(const x of[4.6,8.2,11.8,15.2]){tanArch(s*x,Y0+H1+.9,D/2,0,.9,1.6,{fill:'D',band:or,bw:.12,sill:wh});if(x>8)tanArch(s*x,Y0+1.4,D/2,0,.6,1.0,{fill:'D',band:or,bw:.1});}
  for(const z of[-10,-6,-2,2,6,10]){tanArch(s*W/2,Y0+H1+.9,z,s*Math.PI/2,.9,1.6,{fill:'D',band:or,bw:.12,sill:wh});if(Math.abs(z)!==6)tanArch(s*W/2,Y0+1.4,z,s*Math.PI/2,.6,1.0,{fill:'D',band:or,bw:.1});}
  tanArch(s*5,Y0,-D/2,Math.PI,4.4,4.0,{kind:'flat',fill:'D',band:or,bw:.2});vB('vStone',s*5,0,-D/2-1.0,5.0,.3,1.8,0,st);}
 for(const x of[-12,-9,0,9,12])tanArch(x,Y0+H1+.9,-D/2,Math.PI,.9,1.6,{fill:'D',band:or,bw:.12,sill:wh});
 vnBarrel(-9.5,0,-D/2-1.2,.4,1.0,null);vnBarrel(-10.4,0,-D/2-1.0,.4,1.0,null);vPst('vPipe',11,0,-D/2-.9,.12,1.5,TA_IR());vB('vIron',11,1.5,-D/2-.9,.5,.4,.3,0,TA_IR());
 // the corner towers: round, a storey over the roof, a ribbed melon dome, a ball on each
 for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*(W/2-1.4),z=sz*(D/2-1.4);vPst('vPostS',x,Y0,z,2.0,TOP+1.2,wh);kput('taRing',[x,Y0+TOP+1.2,z],null,[2.1,2.1,1.2],or);
  tanArch(x+sx*2*Math.sin(Math.PI/4),Y0+TOP-.6,z+sz*2*Math.cos(Math.PI/4),Math.atan2(sx,sz),.6,1.2,{fill:'D',band:or,bw:.1});
  tanDome(x,Y0+TOP+1.3,z,2.1,{kind:'melon',c:tile,ribs:12,ribC:wh});kput('taBallM',[x,Y0+TOP+3.5,z],null,[.18,.24,.18],wh);}
 // the court: the gallery in two storeys (the gate's bay kept clear below), the camel bays' troughs and straw along the
 // back walk, the well, a palm, the paving
 tanCourtGallery(0,Y0,0,IW,ID,H1,WK,wh,or,{order:'doric',cc:cr,bay:3.2,gate:2.2});
 tanCourtGallery(0,Y0+H1+.3,0,IW,ID,H2-.3,WK,wh,or,{order:'plain',cc:cr,bay:3.2,rail:true,plain:true});
 for(const x of[-9,-5,-1,3,7]){vB('vWood',x,Y0,-ID/2+.5,1.8,.5,.6,0,wood);for(let k=0;k<3;k++)kput('vSack',[x+rr(-.7,.7),Y0+.22,-ID/2+1.2+rr(-.2,.3)],null,[.4,.26,.36],straw);}
 for(const z of[-5,0,5])for(const s of[-1,1])vB('vWood',s*(IW/2-.5),Y0,z,.6,.5,1.8,0,wood);
 vPst('vPostS',0,Y0,0,1.2,1.0,st);kput('taRing',[0,Y0+1.0,0],null,[1.2,1.2,1.3],or);for(const s of[-1,1])vPst('vPost',s*1.0,Y0+.8,0,.08,2.0,wood);vB('vWood',0,Y0+2.7,0,2.3,.12,.12,0,wood);
 vPst('vPostB',5,Y0,-3,.16,4.6,vC(0x8a7a5a));for(let k=0;k<6;k++){const a=k*TAU/6;kput('vLeaf',[5+Math.sin(a)*.9,Y0+4.4,-3+Math.cos(a)*.9],vQ(a,0,0),[1.6,.3,.7],vC(vPick([0x4e7a3a,0x5a8a44])));}
 vnPaving(0,Y0+.04,0,IW-2*WK-1,ID-2*WK-1,0,st,36);vnPaving(0,.04,D/2+1.3,10,1.8,0,st,8);}

// Agora stoa: the market's stoa: a long two-storey colonnade (Doric below, Ionic above) on three steps before a row of
// shops, each shop an open front with its counter under the walk, an arched window between; an upper gallery behind a
// plain balustrade, a tile hip roof with a pediment over the centre, solid white ends (antae) closing the walk. o.len
// metres long (30). Middle: no gilt, no light.
function buildTalAgoraStoa(G,o){reseed(9531+(o.v|0));const L=o.len==null?30:o.len,BD=6,WK=3.0,H1=4.0,H2=3.0,Y0=.5,Z0=-WK/2,zs=Z0+BD/2,zc=Z0+BD/2+WK-.4,N=Math.max(3,Math.round(L/3.3)),b=L/N,TOP=Y0+H1+.3+H2;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST(),wal=TA_WAL(),cr=vC(vPick(TAPAL.marble)),tile=vC(vPick(TAPAL.tile)),ir=TA_IR();
 vnReg('Agora stoa (middle, shared)',0,0,L/2+1,TOP+2.6,{style:'classical',type:['market/shop']});
 // the stylobate: three steps along the front, the floor slab
 vB('vStone',0,-.1,0,L+.4,Y0+.1,BD+WK+.4,0,st);vnStairs(0,0,zs+WK+.5,0,L,Y0,3,'vStone',st);
 // the shops: a two-storey block at the back; shop fronts and arched windows alternating along its face on the walk
 vnBody('vPlaster',0,Y0,Z0,L,H1,BD,0,wh,{t:.3});
 for(let k=0;k<N;k++){const x=-L/2+(k+.5)*b;if(k%2===0)tanShopFront(x,Y0,zs,0,2.4,2.5,or,{awning:false,sign:k%4===0?vC(vPick(VPAL.awning)):null});else tanArch(x,Y0+.9,zs,0,1.2,2.0,{fill:'G',band:or,bw:.12,sill:wh});}
 tanDoor(-L/2+1.6,Y0,Z0-BD/2,Math.PI,1.0,2.2,'vPlaster',or,wal,false);for(let k=1;k<N;k+=2)tanArch(-L/2+(k+.5)*b,Y0+1.2,Z0-BD/2,Math.PI,.8,1.4,{fill:'G',band:or,bw:.1});
 // the lower colonnade: Doric, from end wall to end wall, the gallery's slab over the walk
 for(const s of[-1,1]){vB('vPlaster',s*(L/2-.25),Y0,Z0+WK/2,.5,H1,BD+WK,0,wh);tanArch(s*L/2,Y0+1.0,Z0,s*Math.PI/2,1.0,1.8,{fill:'G',band:or,bw:.12,sill:wh});}
 for(let k=1;k<N;k++)tanColumn(-L/2+k*b,Y0,zc,H1,.26,'doric',cr);
 vB('vPlaster',0,Y0+H1,Z0+BD/2+WK/2,L,.3,WK+.2,0,wh);vB('vPlaster',0,Y0+H1+.3,zc+.05,L-.4,.1,.26,0,or);
 // the upper storey: the block's arched windows, the Ionic colonnade above the lower on a plain balustrade, its beam
 vnBody('vPlaster',0,Y0+H1+.3,Z0,L,H2,BD,0,wh,{t:.3});
 for(let k=0;k<N;k++)tanArch(-L/2+(k+.5)*b,Y0+H1+1.0,zs,0,1.1,1.8,{fill:'G',band:or,bw:.12,sill:wh,rail:k%3===1?ir:null});
 for(let k=1;k<N;k+=2)tanArch(-L/2+(k+.5)*b,Y0+H1+1.2,Z0-BD/2,Math.PI,.8,1.4,{fill:'G',band:or,bw:.1});
 for(const s of[-1,1]){vB('vPlaster',s*(L/2-.25),Y0+H1+.3,Z0+WK/2,.5,H2,BD+WK,0,wh);tanArch(s*L/2,Y0+H1+1.2,Z0,s*Math.PI/2,.9,1.6,{fill:'G',band:or,bw:.12,sill:wh});}
 for(let k=1;k<N;k++)tanColumn(-L/2+k*b,Y0+H1+.3,zc,H2-.5,.2,'ionic',cr);
 tanBalustrade(0,Y0+H1+.3,zc-.1,0,L-1.4,wh,.95,{plain:true});
 vB('taMarble',0,Y0+H1+.3+H2-.5,zc,L-.5,.5,.7,0,wh);vB('vPlaster',0,TOP,0,L+.2,.3,BD+WK+.2,0,or);
 // the roof: a tile hip over block and walk, the pediment over the centre bay on the front
 vnHipRoof('taHipTile',0,TOP+.3,0,L,BD+WK,1.9,0,tile,.6);tanPediment(0,TOP+.3,zs+WK+.2,0,5.2,1.1,wh,.1,1.0,or);
 // stalls and sacks in the walk, benches, the paving before the steps
 vnStall(-L/2+b*1.5,zs+1.4,0,vC(vPick(VPAL.awning)));vnStall(L/2-b*1.5,zs+1.4,0,vC(vPick(VPAL.awning)));vnSacks(0,Y0,zs+1.2,3);
 for(const x of[-L/2+b*3.5,L/2-b*3.5])vB('vWood',x,Y0,zs+.6,1.8,.45,.45,0,vC(vPick(VPAL.woodMid)));
 vnPaving(0,.04,zs+WK+1.4,L+2,1.2,0,st,10);}

// ---------------------------------------------------------------- THE STREET: the shop arcade, the inn, the press
// Shop arcade: a street of shops under an arcade with houses over: five round arches on solid piers along the walk, four
// shop fronts with signs and awnings in the walk and the doors of the flats between, two storeys of white houses over
// with arched windows in orange bands and iron rails, a tile hip roof. Middle: no gilt, no light.
function buildTalShopArcade(G,o){reseed(9541+(o.v|0));const W=18,D=11,WK=2.2,GH=3.8,H=3.1,Y0=.3,Z0=-1.4,zf=Z0+D/2,zb=zf-WK,TOP=Y0+GH+.3+2*H;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile)),ir=TA_IR();
 vnReg('Shop arcade (middle, shared)',0,Z0,10,TOP+3,{style:'whitewash',type:['market/shop','multi-family dwelling']});
 vB('vStone',0,-.1,Z0,W+.3,Y0+.1,D+.3,0,st);vnStairs(0,0,zf+.18,0,W,Y0,1,'vStone',st);
 // the ground storey behind the walk: shop fronts and the flats' doors
 vnBody('vPlaster',0,Y0,Z0-WK/2,W,GH,D-WK,0,wh,{t:.3});
 for(const x of[-6.75,-2.25,2.25,6.75])tanShopFront(x,Y0,zb,0,2.6,2.5,or,{sign:vC(vPick(VPAL.awning)),awning:Math.abs(x)>4,awnC:vC(vPick(VPAL.awning))});
 for(const x of[-4.5,4.5])tanDoor(x,Y0,zb,0,.9,2.2,'vPlaster',or,wal,false);
 for(const s of[-1,1])tanArch(s*W/2,Y0+1.0,Z0-2,s*Math.PI/2,1.0,1.6,{fill:'G',band:or,bw:.12,sill:wh});
 // the arcade: piers at the walk's edge, orange arch bands between, the floor slab over (its underside the orange vault)
 const n=5,b=W/n,r=b/2-.35,hp=GH-r-.3;
 for(let k=0;k<=n;k++){const x=k===0?-W/2+.35:k===n?W/2-.35:-W/2+k*b;vB('vPlaster',x,Y0,zf-.4,k===0||k===n?.7:.6,hp,.8,0,wh);}
 for(let k=0;k<n;k++)tanArcBand(-W/2+(k+.5)*b,Y0+hp+.1,zf-.1,0,r+.07,.16,.5,.05,or,0,Math.PI,10);
 vB('vPlaster',0,Y0+GH,Z0,W+.2,.3,D+.2,0,or);
 // the houses over: two storeys of arched windows (iron rails on the first), a string course, the hip roof and a chimney
 for(let k=0;k<2;k++){const y=Y0+GH+.3+k*H;vnBody('vPlaster',0,y,Z0,W,H-.3,D,0,wh,{t:.3});
  for(let j=0;j<5;j++)tanArch(-W/2+b/2+j*b,y+.6,zf,0,1.1,1.9,{fill:'G',band:or,bw:.12,sill:wh,rail:k===0?ir:null});
  for(const s of[-1,1])for(const zz of[Z0-2.6,Z0+.6])tanArch(s*W/2,y+.7,zz,s*Math.PI/2,1.0,1.7,{fill:'G',band:or,bw:.12,sill:wh});
  for(const x of[-5.4,-1.8,1.8,5.4])tanArch(x,y+.7,Z0-D/2,Math.PI,1.0,1.7,{fill:'G',band:or,bw:.12,sill:wh});
  if(k===0)tanString(0,y+H-.36,Z0,W,D,0,or,.1,.12);else tanTrail(-1.8,y+.5,zf+.02,0,1.2,1);}
 vB('vPlaster',0,TOP,Z0,W+.3,.3,D+.3,0,wh);vnHipRoof('taHipTile',0,TOP+.3,Z0,W,D,2.2,0,tile,.5);vnChimney(4,TOP+1.6,Z0-2,1.4,.2,false);
 vnPaving(0,.04,zf+1.6,W+2,1.8,0,st,10);}

// Warehouse: vaulted stores: a long white block under four barrel vaults, their tympana ringed in orange on the front,
// a loading door under each (two with a hoist beam and a crate on the rope), and the loading court before it behind a
// low wall with a gate: crates, sacks, barrels and a hand cart. Middle: no gilt, no light.
function buildTalWarehouse(G,o){reseed(9551+(o.v|0));const W=26,D=12,H=4.6,Y0=.3,Z0=-4.5,zf=Z0+D/2,NV=4,VW=W/NV,CZ=6,CW=W,CD=9;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST(),wal=TA_WAL(),ir=TA_IR(),wood=vC(vPick(VPAL.woodMid));
 vnReg('Warehouse (middle)',0,Z0,13,Y0+H+VW/2+.5,{style:'whitewash',type:['industry']});vnReg('Warehouse — loading court',0,CZ,9,3,{style:'whitewash',type:['industry']});
 vB('vStone',0,-.1,Z0,W+.4,Y0+.1,D+.4,0,st);vnBody('vPlaster',0,Y0,Z0,W,H,D,0,wh,{t:.35});tanString(0,Y0+H-.14,Z0,W,D,0,or,.12,.14);
 for(let k=0;k<NV;k++){const x=-W/2+(k+.5)*VW;tanVault(x,Y0+H,Z0,0,VW/2-.05,D,wh,'taVault',wh);tanArcBand(x,Y0+H,zf,0,VW/2+.08,.2,.14,.08,or,0,Math.PI,14);
  if(k%2===0){tanArch(x,Y0,zf,0,3.2,3.6,{kind:'flat',fill:'D',band:or,bw:.16,key:wh});vB('vStone',x,0,zf+.6,3.8,.3,1.2,0,st);}
  else{tanDoor(x-.6,Y0,zf,0,1.2,2.6,'vPlaster',or,wal,false);tanArch(x+1.2,Y0+.9,zf,0,.8,1.4,{fill:'D',band:or,bw:.1,sill:wh});
   vBeam([x,Y0+4.1,zf-.3],[x,Y0+4.1,zf+1.6],.18,wood,'vWood');vBeam([x,Y0+4.1,zf+1.4],[x,Y0+2.6,zf+1.4],.03,ir,'vIron');vnCrate(x,Y0+2.0,zf+1.4,.7,.2,wood);}}
 for(const s of[-1,1])for(const zz of[Z0-3.5,Z0,Z0+3.5])tanArch(s*W/2,Y0+2.8,zz,s*Math.PI/2,.8,1.3,{fill:'D',band:or,bw:.1});
 for(const x of[-9,-3,3,9])tanArch(x,Y0+2.8,Z0-D/2,Math.PI,.8,1.3,{fill:'D',band:or,bw:.1});tanDoor(W/2,Y0,Z0+4.5,Math.PI/2,1.0,2.2,'vPlaster',or,wal,false);
 // the loading court: its wall and gate piers with stone balls, paving, the goods and a hand cart, a water butt
 for(const s of[-1,1]){vB('vPlaster',s*(CW/2-.2),0,CZ,.4,2.0,CD,0,wh);vB('vPlaster',s*(CW/2-.2),2.0,CZ,.5,.1,CD+.1,0,or);
  vB('vPlaster',s*(CW/4+1.4),0,CZ+CD/2-.2,CW/2-2.8,2.0,.4,0,wh);vB('vPlaster',s*(CW/4+1.4),2.0,CZ+CD/2-.2,CW/2-2.7,.1,.5,0,or);
  vB('vStone',s*2.8,0,CZ+CD/2-.2,.7,2.6,.7,0,st);kput('taBallM',[s*2.8,2.8,CZ+CD/2-.2],null,[.26,.26,.26],wh);}
 vnPaving(0,.04,CZ,CW-1,CD-1,0,st,30);
 for(let k=0;k<3;k++)vnCrate(-8.5+k*1.15,0,CZ-2,1.0,rr(-.2,.2),wood);vnCrate(-7.4,.8,CZ-2,.9,.3,wood);vnCrate(-7.4,0,CZ+1,.8,.4,wood);vnSacks(6,0,CZ-1.5,5);vnBarrel(9,0,CZ+1.5,.4,1.0,null);vnBarrel(9.9,0,CZ+2.3,.4,1.0,null);
 vB('vWood',1.5,.5,CZ+1.5,1.6,.2,1.1,.3,wood);for(const s of[-1,1])kput('vHoop',[1.5+s*.6,.5,CZ+1.5],vQ(.3+Math.PI/2,0,0),[.5,.5,.5],ir);vBeam([1.5+.7,.6,CZ+1.5-.6],[1.5+2.0,1.0,CZ+1.5-1.0],.06,wood,'vWood');
 vnWaterButt(-W/2+1.2,0,CZ+CD/2-1.4,.36,.9);}

// Public baths (civic, with the customs and the bourse above): a Byzantine hall under a great drum-dome, a Corinthian porch under a pediment, a wing of three small
// domes either side (the warm and the cold rooms), and the pool court before it: a long pool in a marble deck with a
// meander round it, a colonnade down each side and across the front between two kiosks, palms and lamps. Civic, lit,
// gilt.
function buildTalBath(G,o){reseed(9561+(o.v|0));const HW=14,HD=14,H=7,Y0=.8,Z0=-7.5,zf=Z0+HD/2,WW=7,WD=11,WH=4.6,WX=HW/2+WW/2,DY=.4,PZ=7.5,CX=13,KZ=PZ+5.8;
 const wh=TA_WH(),or=TA_OR(),mb=vC(vPick(TAPAL.marble)),gi=vC(vPick(TAPAL.gilt)),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile)),cu=vC(0x5a8a78);
 vnReg('Public baths (civic)',0,Z0,10,Y0+H+14,{style:'byzantine'});vnReg('Public baths — pool court',0,PZ,10,6,{style:'byzantine'});
 // the hall: lit arches in gilt bands on the front, oculi in gilt rings high on the sides, the door and its porch
 vB('taMarble',0,-.1,Z0,HW+1.2,Y0+.1,HD+1.2,0,mb);vnBody('vPlaster',0,Y0,Z0,HW,H,HD,0,wh,{t:.4});
 for(const x of[-4.6,4.6])tanArch(x,Y0+.5,zf,0,1.8,3.8,{fill:'L',band:or,bw:.16,gilt:true,key:gi,sill:mb});
 tanDoor(0,Y0,zf,0,1.8,3.4,'taMarble',wh,wal,false);tanArcBand(0,Y0+3.4,zf,0,1.0,.2,.14,.08,or,0,Math.PI,10,'taGilt');tanDiscAt('taDiscL',0,Y0+3.4,zf,0,.9,.03,.1,null);
 for(const s of[-1,1])for(const zz of[Z0-4,Z0,Z0+4]){tanDiscAt('taDiscL',s*HW/2,Y0+5.9,zz,s*Math.PI/2,.5,.04,.1,null);kput('taRingGi',[s*(HW/2+.08),Y0+5.9,zz],vQ(s*Math.PI/2,Math.PI/2,0),[.58,.58,.58],gi);}
 for(const x of[-4,0,4]){tanDiscAt('taDiscL',x,Y0+5.9,Z0-HD/2,Math.PI,.5,.04,.1,null);kput('taRingGi',[x,Y0+5.9,Z0-HD/2-.08],vQ(Math.PI,Math.PI/2,0),[.58,.58,.58],gi);}
 for(const x of[-4.6,0,4.6])tanArch(x,Y0+.6,Z0-HD/2,Math.PI,1.4,2.8,{fill:'L',band:or,bw:.14,gilt:true,sill:mb});
 for(const x of[-2.4,-.8,.8,2.4])tanColumn(x,Y0,zf+1.3,5.6,.26,'corinthian',mb,gi);
 vB('taMarble',0,Y0+5.6,zf+.75,6.6,.5,1.9,0,wh);vB('vPlaster',0,Y0+6.1,zf+.75,6.8,.3,2.1,0,gi);tanPediment(0,Y0+6.4,zf+1.75,0,7.0,1.4,wh,.1,2.1,or,gi);
 vB('taMarble',0,-.1,zf+1.0,7.4,Y0+.1,2.2,0,mb);vnStairs(0,DY,zf+2.6,0,5,Y0-DY,2,'taMarble',mb);
 const YT=tanEntablature(0,Y0+H,Z0,HW,HD,0,wh,gi,{});tanParapet(0,YT,Z0,HW+.5,HD+.5,0,mb,1.0,{ball:gi,gilt:gi});vB('vPlaster',0,YT,Z0,HW-1.6,.6,HD-1.6,0,or);
 tanDrumDome(0,YT+.6,Z0,5.2,{drumH:2.2,n:12,domeC:cu,item:'vDomeC',ribs:0,gilt:gi,lit:true,band:wh,pil:true,pilC:wh,lanternC:cu});
 // the wings: a storey lower, three small white domes each, lit arches in gilt bands on their faces
 for(const s of[-1,1]){const x=s*WX;vB('taMarble',x,-.1,Z0,WW+.6,Y0+.1,WD+.6,0,mb);vnBody('vPlaster',x,Y0,Z0,WW,WH,WD,0,wh,{t:.35});
  tanString(x,Y0+WH-.2,Z0,WW,WD,0,gi,.14,.2);vB('vPlaster',x,Y0+WH,Z0,WW-.2,.3,WD-.2,0,wh);
  for(const zz of[Z0-3.5,Z0,Z0+3.5]){tanDome(x,Y0+WH+.3,zz,1.55,{item:'taDomeP',c:wh,finial:gi,fr:.1});tanArch(x+s*WW/2,Y0+.9,zz,s*Math.PI/2,1.2,2.4,{fill:'L',band:or,bw:.14,gilt:true,sill:mb});}
  tanArch(x,Y0+.9,Z0+WD/2,0,1.3,2.6,{fill:'L',band:or,bw:.14,gilt:true,key:gi,sill:mb});tanArch(x,Y0+.9,Z0-WD/2,Math.PI,1.2,2.4,{fill:'L',band:or,bw:.14,gilt:true,sill:mb});}
 // the pool court: the marble deck, the pool with its meander and a medallion at each end, the colonnades on three sides
 // between the kiosks, palms, lamps
 vB('taMarble',0,0,PZ,2*CX+2,DY,14,0,mb);vB('taMarble',0,DY,PZ,13,.4,7,0,mb);vB('vWinGlass',0,DY+.3,PZ,12.4,.08,6.4,0,null);
 tanMeander(0,DY+.4,PZ,14.6,8.6,0,or,.3);tanMosaicRing(-8.6,DY,PZ,1.1,or,wh);tanMosaicRing(8.6,DY,PZ,1.1,or,wh);
 for(const s of[-1,1]){for(let k=0;k<4;k++)tanColumn(s*CX,DY,PZ-6.0+k*2.6,4.2,.24,'corinthian',mb,gi);vB('taMarble',s*CX,DY+4.2,PZ-1.15,.7,.5,10.3,0,wh);
  tanKiosk(s*CX,DY,KZ,1.3,3.2,6,mb,{order:'corinthian',capC:gi,domeC:tile,ribC:gi,ribItem:'taRibGi',finial:gi,fr:.07});
  vnLampPost(s*6,DY,KZ+.6,3);vnLampPost(s*(HW/2+2.6),0,zf+1.6,3);
  const px=s*9.4,pz=PZ-4.4;vPst('vPostB',px,DY,pz,.16,4.4,vC(0x8a7a5a));for(let k=0;k<6;k++){const a=k*TAU/6;kput('vLeaf',[px+Math.sin(a)*.9,DY+4.2,pz+Math.cos(a)*.9],vQ(a,0,0),[1.6,.3,.7],vC(vPick([0x4e7a3a,0x5a8a44])));}}
 for(let k=0;k<7;k++)if(k!==3)tanColumn(-8.4+k*2.8,DY,KZ,4.2,.24,'corinthian',mb,gi);vB('taMarble',0,DY+4.2,KZ,2*CX-3.4,.5,.7,0,wh);
 vnStairs(0,0,KZ+.9,0,4,DY,2,'taMarble',mb);}

// Merchants' inn: a white two-storey block round a court: a round carriage arch through the front with the sign over it,
// the tap room's wide arch and benches beside it, arched windows below and shuttered ones above, tile hip roofs with
// chimneys; a gallery on two storeys round the court, an outside stair up to it, the well, a palm, the merchants' goods
// in the yard. Middle: no gilt, no light.
function buildTalInn(G,o){reseed(9571+(o.v|0));const W=22,D=20,R=5.5,H1=3.6,H2=3.2,TOP=H1+H2,IW=W-2*R,ID=D-2*R,WK=2.0,Y0=.3,zf=D/2;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile)),cr=vC(vPick(TAPAL.marble)),wood=vC(vPick(VPAL.woodMid)),ir=TA_IR();
 vnReg('Merchants\' inn (middle, shared)',0,0,12,Y0+TOP+3.2,{style:'whitewash',type:['tavern/inn']});
 vB('vStone',0,-.1,0,W+.4,Y0+.1,D+.4,0,st);
 // the four ranges, a string course at the floor line, a tile hip over each
 for(const [x,z,w,d] of[[0,-D/2+R/2,W,R],[W/2-R/2,0,R,D-2*R],[-W/2+R/2,0,R,D-2*R],[6.5,D/2-R/2,9,R],[-6.5,D/2-R/2,9,R]]){vnBody('vPlaster',x,Y0,z,w,TOP,d,0,wh,{t:.3});
  tanString(x,Y0+H1,z,w-(w===R?0:.3),d-(d===R?0:.3),0,or,.1,.12);vB('vPlaster',x,Y0+TOP,z,w+.2,.2,d+.2,0,or);vnHipRoof('taHipTile',x,Y0+TOP+.2,z,w,d,1.7,0,tile,.6);}
 // the gate block between the front halves (a little taller and proud), the carriage arch through it on both faces,
 // the sign, the tap room's arch and benches, the windows
 vB('vPlaster',0,Y0,D/2-R/2,4.2,TOP+.8,R+.4,0,wh);vB('vPlaster',0,Y0+TOP+.8,D/2-R/2,4.4,.12,R+.6,0,or);
 tanArch(0,Y0,zf+.2,0,3.4,4.2,{fill:'D',band:or,bw:.18,key:wh});tanArch(0,Y0,zf-R-.2,Math.PI,3.4,4.2,{fill:'D',band:or,bw:.18,key:wh});vnSign(2.4,Y0+4.9,zf+.2,0,vC(vPick(VPAL.awning)));
 tanArch(-6.5,Y0,zf,0,2.4,2.8,{fill:'D',band:or,bw:.14});vnAwning(-6.5,Y0+2.9,zf,0,3.2,1.3,vC(vPick(VPAL.awning)));
 for(const x of[-9.6,-3.6])vB('vWood',x,Y0,zf+.5,1.6,.45,.45,0,wood);vnBarrel(-9.6,0,zf+1.5,.36,.9,null);vnBarrel(-8.6,0,zf+1.8,.36,.9,null);
 for(const x of[3.6,6.5,9.2])tanArch(x,Y0+.9,zf,0,1.0,1.7,{fill:'G',band:or,bw:.12,sill:wh});
 for(const x of[-9,-6.5,-4,4,6.5,9])tanWin(x,Y0+H1+.9,zf,0,1.0,1.5,'glass','vWood',wood,true);
 for(const s of[-1,1])for(const z of[-7,-3.5,0,3.5,7]){tanArch(s*W/2,Y0+.9,z,s*Math.PI/2,1.0,1.7,{fill:'G',band:or,bw:.12,sill:wh});tanWin(s*W/2,Y0+H1+.9,z,s*Math.PI/2,1.0,1.5,'glass','vWood',wood,true);}
 for(const x of[-8,-4,0,4,8]){tanArch(x,Y0+.9,-D/2,Math.PI,1.0,1.7,{fill:'G',band:or,bw:.12,sill:wh});tanWin(x,Y0+H1+.9,-D/2,Math.PI,1.0,1.5,'glass','vWood',wood,true);}
 tanDoor(-W/2,Y0,-6,-Math.PI/2,1.0,2.2,'vPlaster',or,wal,false);
 vnChimney(-7,Y0+TOP+1.4,-D/2+R/2,1.6,.22,false);vnChimney(W/2-R/2,Y0+TOP+1.4,5,1.6,.22,false);
 // the court: the gallery on two storeys, the stair up to it along the back walk, the well, the palm, the goods
 tanCourtGallery(0,Y0,0,IW,ID,H1,WK,wh,or,{order:'doric',cc:cr,bay:3.0,gate:2.0});
 tanCourtGallery(0,Y0+H1+.3,0,IW,ID,H2-.3,WK,wh,or,{order:'plain',cc:cr,bay:3.0,rail:true,plain:true});
 tanWallStair(-IW/2+.3,Y0,-ID/2,0,1,H1+.3,12,1.0,wh,or);
 vPst('vPostS',1.5,Y0,-.5,.9,1.0,st);kput('taRing',[1.5,Y0+1.0,-.5],null,[.9,.9,1.3],or);
 vPst('vPostB',-2.4,Y0,1.2,.14,4.0,vC(0x8a7a5a));for(let k=0;k<6;k++){const a=k*TAU/6;kput('vLeaf',[-2.4+Math.sin(a)*.8,Y0+3.8,1.2+Math.cos(a)*.8],vQ(a,0,0),[1.4,.3,.6],vC(vPick([0x4e7a3a,0x5a8a44])));}
 vnCrate(3.2,Y0,2.6,.8,.3,wood);vnSacks(-.5,Y0,2.8,3);vnBarrel(3.6,Y0,-2.6,.36,.9,null);
 vnPaving(0,Y0+.04,0,IW-2*WK-.8,ID-2*WK-.8,0,st,14);vnPaving(0,.04,zf+1.4,12,1.6,0,st,8);}

// Press: printers and bookbinders (the University's trade): a white two-storey house with a shop front and its sign, an
// open workshop bay on its right flank under the overhang with the screw press, the paper stacks and the binders' bench,
// arched windows in orange bands over, and a drying loft on the roof: an open storey of timber posts under a tile hip,
// printed sheets hanging from its lines. Middle: no gilt, no light.
function buildTalPress(G,o){reseed(9581+(o.v|0));const BW=9,D=10,BAY=3.6,W=BW+BAY,X0=-BAY/2,BX=X0+BW/2+BAY/2,H1=3.6,H2=3.1,LH=2.5,Y0=.3,Z0=-1.0,zf=Z0+D/2,Y1=Y0+H1+.3,TOP=Y1+H2+.3;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile)),wood=vC(vPick(VPAL.woodMid)),dark=vC(vPick(VPAL.woodPoor)),paper=vC(0xf2eee4),ir=TA_IR();
 vnReg('Press (middle)',0,Z0,8,TOP+LH+2.2,{style:'whitewash',type:['industry','market/shop']});
 vB('vStone',0,-.1,Z0,W+.3,Y0+.1,D+.3,0,st);
 // the house's ground storey: the shop front, a window; the open bay beside it on posts, the press and the benches in it
 vnBody('vPlaster',X0,Y0,Z0,BW,H1,D,0,wh,{t:.3});
 tanShopFront(X0-1.2,Y0,zf,0,2.8,2.6,or,{sign:vC(0x2f5fb8),awnC:vC(vPick(VPAL.awning))});tanArch(X0+2.8,Y0+.9,zf,0,1.0,1.7,{fill:'G',band:or,bw:.12,sill:wh});
 tanArch(-W/2,Y0+.9,Z0+1.5,-Math.PI/2,1.0,1.7,{fill:'G',band:or,bw:.12,sill:wh});tanArch(X0,Y0+.9,Z0-D/2,Math.PI,1.1,1.7,{fill:'G',band:or,bw:.12,sill:wh});
 vB('vPlaster',BX+BAY/2-.2,Y0,Z0,.4,H1,D,0,wh);vB('vPlaster',BX,Y0,Z0-D/2+.2,BAY,H1,.4,0,wh);vPst('vPostB',BX+.2,Y0,zf-.25,.16,H1,wood);
 const px=BX,pz=Z0-1.5;for(const s of[-1,1])vB('vWood',px+s*.6,Y0,pz,.24,2.6,.3,0,dark);vB('vWood',px,Y0+2.4,pz,1.6,.3,.4,0,dark);vB('vWood',px,Y0+.9,pz,1.6,.2,1.0,0,dark);
 vPst('vPostB',px,Y0+1.4,pz,.1,1.1,ir);vB('vIron',px,Y0+1.2,pz,.7,.2,.6,0,ir);vB('vIron',px,Y0+2.7,pz,.5,.1,.5,0,ir);vB('vWood',px+.9,Y0+1.1,pz+.2,.5,.08,.6,0,paper);
 vB('vWood',px-.2,Y0,zf-1.6,2.0,.8,.8,0,wood);for(let k=0;k<4;k++)vB('vWood',px-1.0+k*.5,Y0+.8,zf-1.6,.4,.08+rr(0,.16),.5,rr(-.2,.2),paper);
 for(let k=0;k<5;k++)vB('vWood',px+.9+rr(-.1,.1),Y0+.8+k*.07,zf-1.3,.3,.06,.4,rr(-.3,.3),vC(vPick([0x7a3a2a,0x3a4a7a,0x5a6a3a,0x6e3a22])));
 vB('vWood',px+.2,Y0,Z0+.6,.6,.6,.6,0,paper);vB('vWood',px+.2,Y0+.6,Z0+.6,.56,.4,.56,0,paper);
 // the upper storey over both, arched windows, a string course; the loft: posts, lines, sheets, the tile hip over
 vB('vPlaster',0,Y0+H1,Z0,W+.2,.3,D+.2,0,or);vnBody('vPlaster',0,Y1,Z0,W,H2,D,0,wh,{t:.3});
 for(const x of[-4.2,-1.0,2.2,5.0])tanArch(x,Y1+.7,zf,0,1.0,1.8,{fill:'G',band:or,bw:.12,sill:wh,rail:x<0?ir:null});
 for(const s of[-1,1])for(const zz of[Z0-2.6,Z0+1.4])tanArch(s*W/2,Y1+.7,zz,s*Math.PI/2,1.0,1.7,{fill:'G',band:or,bw:.12,sill:wh});
 for(const x of[-3.6,0,3.6])tanArch(x,Y1+.7,Z0-D/2,Math.PI,1.0,1.7,{fill:'G',band:or,bw:.12,sill:wh});
 vB('vPlaster',0,Y1+H2,Z0,W+.2,.3,D+.2,0,or);tanParapetWall(0,TOP,Z0,W,D,0,wh,.5,or);
 for(const sx of[-1,0,1])for(const sz of[-1,1])vPst('vPostB',sx*(W/2-.5),TOP,Z0+sz*(D/2-.5),.14,LH,wood);
 for(const z of[Z0-2.6,Z0,Z0+2.6]){vBeam([-W/2+.5,TOP+LH-.4,z],[W/2-.5,TOP+LH-.4,z],.02,ir,'vIron');
  for(let k=0;k<6;k++)if(rng()<.8)vB('vClothB',-W/2+1.4+k*(W-2.8)/5+rr(-.2,.2),TOP+LH-1.25,z,.7,.85,.02,rr(-.2,.2),paper);}
 vB('vWood',0,TOP+LH,Z0,W-.6,.3,.3,0,wood);vB('vWood',0,TOP+LH,Z0,.3,.3,D-.6,0,wood);
 vnHipRoof('taHipTile',0,TOP+LH+.3,Z0,W,D,1.8,0,tile,.6);vnChimney(-3.5,TOP+LH+1.2,Z0-3,1.6,.2,false);
 vnPaving(0,.04,zf+1.6,W+2,1.6,0,st,8);}

VERN.def({key:'tal_customs_house',name:'Customs house',family:'civic',tags:TA_TAG('baroque','civic',['civic','market/shop'],true),w:34,d:30,h:20,build:buildTalCustomsHouse});
VERN.def({key:'tal_bourse',name:'Bourse (the caravan exchange)',family:'trade',tags:TA_TAG('classical','civic',['civic','market/shop'],true),w:30,d:30,h:24,build:buildTalBourse});
VERN.def({key:'tal_caravanserai',name:'Caravanserai',family:'trade',tags:TA_TAG('whitewash','middle',['tavern/inn','market/shop','multi-family dwelling']),w:40,d:34,h:11,build:buildTalCaravanserai});
VERN.def({key:'tal_agora_stoa',name:'Agora stoa',family:'trade',tags:TA_TAG('classical','middle',['market/shop']),w:32,d:12,h:11,build:buildTalAgoraStoa});
VERN.def({key:'tal_shop_arcade',name:'Shop arcade (houses over)',family:'trade',tags:TA_TAG('whitewash','middle',['market/shop','multi-family dwelling']),w:20,d:13,h:14,build:buildTalShopArcade});
VERN.def({key:'tal_warehouse',name:'Warehouse (vaulted stores)',family:'industry',tags:TA_TAG('whitewash','middle',['industry']),w:30,d:22,h:10,build:buildTalWarehouse});
VERN.def({key:'tal_bath',name:'Public baths',family:'civic',tags:TA_TAG('byzantine','civic',['civic'],true),w:34,d:30,h:23,build:buildTalBath});
VERN.def({key:'tal_inn',name:'Merchants\' inn',family:'trade',tags:TA_TAG('whitewash','middle',['tavern/inn']),w:26,d:24,h:12,build:buildTalInn});
VERN.def({key:'tal_press',name:'Press (printers and bookbinders)',family:'trade',tags:TA_TAG('whitewash','middle',['industry','market/shop']),w:16,d:14,h:13,build:buildTalPress});
