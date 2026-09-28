// ================================================================= XANADU — guilds and the generator (package X-F)
// Five guild halls on one body — a dressed plinth, two battered storeys, a corbel eave, a flat roof — each carrying
// the emblem of its trade in gold over the door and the trade itself in its yard: the Farmers (granary drum,
// stooks), the Miners (headframe, adit, ore tubs), the Goldsmiths (the richest house in the valley: gilt roof, gold
// dome, strong-room tower, assay furnace), the Alchemists (an octagonal tower under a mosaic dome, stained
// windows, retorts and a copper still) and the Masons (an unfinished top storey, a derrick, the cut blocks). The
// generator is the Iziz note: a rubble-and-corrugate hall round a salvaged turbine, pipes, an iron chimney and
// the only electric light the poor quarters ever see. Guilds are civic (lit). Seeds 31200–31399.

// the common hall body: plinth, storeys hs, window rows, a corbel eave and a flat roof. Returns {S, top}.
function xnXFHall(x,z,w,d,hs,c,o){o=o||{};const stone=xC(xPick(XPAL.stone)),trim=o.trim||xC(xPick(XPAL.trim)),tim=o.tim||xC(xPick(XPAL.dark)),lit=xLit()?'lit':'glass';
 xnWall(x,0,z,w+.6,.8,d+.6,0,stone,'dressed');const S=xnStack(x,.8,z,w,d,0,hs,c,o.kind||'wash');
 let yy=.8;for(let k=0;k<hs.length;k++){const f=Math.pow(.96,k),nx=Math.max(2,Math.round(w*f/3.2));
  for(let i=0;i<nx;i++){const u=-w*f/2+w*f*(i+.5)/nx;if(k===0&&Math.abs(u)<(o.doorGap||2.6))continue;xnTibWin(x+u,yy+hs[k]*.36,z+d*f/2-.06,0,.85,1.3,lit,trim,{noVal:k>0});if(o.back!==false)xnTibWin(x+u,yy+hs[k]*.36,z-d*f/2+.06,Math.PI,.85,1.3,lit,trim,{noVal:true});}
  const nz=Math.max(2,Math.round(d*f/3.2));for(let j=0;j<nz;j++)for(const s of[-1,1]){const v=-d*f/2+d*f*(j+.5)/nz;xnTibWin(x+s*(w*f/2-.06),yy+hs[k]*.36,z+v,s*Math.PI/2,.85,1.3,lit,trim,{noVal:true});}
  yy+=hs[k];}
 const top=xnFlatRoof(x,S.y,z,S.w,S.d,0,c,{band:o.band,gold:o.gold,eave:true,eaveC:tim,parapet:.6,corner:o.corner||'pinnacle'});return{S,top,y0:.8};}
// the door of a guild: a portico, the door, a gold emblem plate over it (the caller draws the emblem on the plate)
function xnXFDoor(x,z,c){xnPortico(x,.8,z,0,5.6,2.6,3.6,c,{band:true});vnDoor(x,.8,z+.02,0,1.8,2.6,'xPaint',xC(XPAL.red),xC(xPick(XPAL.dark)),false);xnFlight(x,0,z+2.6+1.6,0,4,.8,'vStone',xC(xPick(XPAL.stone)));
 vB('xPaint',x,.8+2.75+2.1,z+.05,2.6,1.8,.08,0,xC(xPick(XPAL.maroon)));return[x,.8+2.75+3.0,z+.12];}

// ---------------------------------------------------------------- Farmers' Guild
function buildXaGuildFarm(G,o){reseed(31201+(o.v|0));const V=xV(o),W=16,D=11;
 const ochre=xC(xPick(XPAL.ochre)),earth=xC(xPick(XPAL.earth)),aged=xC(xPick(XPAL.aged)),gold=xC(xPick(XPAL.gold));
 vnReg("Farmers' Guild",0,0,10,12);vnReg("Farmers' Guild — granary",-13,-2,4,10);
 const H=xnXFHall(0,0,W,D,V===2?[3.6,3.2,3]:[3.6,3.2],V===1?xC(xPick(XPAL.wash)):ochre,{corner:V===1?'gold':'pinnacle',band:V===1});const E=xnXFDoor(0,D/2,ochre);
 for(let k=-2;k<=2;k++)kput('xConeG',[E[0]+k*.22,E[1]-.9,E[2]],qEuler(0,0,-k*.22),[.09,1.5,.09],gold);vBall('xGold',E[0],E[1]-.85,E[2],.2,gold);   // the gold sheaf
 // the granary drum joined to the hall by a bridge, a thatch cone on it, a ladder
 const GH=V===2?10:7.5;kput('xDrumE',[-13,0,-2],null,[3.4,GH,3.4],earth);if(V===1)kput('xConeT',[-13,GH-.1,-2],null,[3.9,2.8,3.9],xC(xPick(XPAL.tile)));else kput('vConeT',[-13,GH-.1,-2],null,[3.9,2.8,3.9],xC(xPick(VPAL.thatch)));vPst('vPost',-13,GH+2.6,-2,.05,.8,aged);
 for(let k=0;k<4;k++)vB('vDarkB',-13+Math.sin(k*1.6)*3.42,2+k*1.2,-2+Math.cos(k*1.6)*3.42,.3,.5,.3,k*1.6);
 vB('vWood',-10.4,H.S.y-1.2,-2,3.2,.2,1.6,0,aged);for(const s of[-1,1])beam('vWood',[-11.9,H.S.y-1.1,-2+s*.7],[-8.8,H.S.y-1.1,-2+s*.7],.06,.06,aged);vnLadder(-13,0,1.6,0,7.2,aged);
 // the yard: stooks and a stack, sacks on the threshing floor, the yak, a well
 for(let k=0;k<6;k++)kput('vConeT',[8+ (k%3)*1.8,0,D/2+2+Math.floor(k/3)*1.8],null,[.65,1.3,.65],xC(xPick(VPAL.thatch)));
 vPst('xDiscS',-8,0,D/2+4,3,.12,xC(xPick(XPAL.stone)));vnSacks(-8,.12,D/2+4,5);xnYak(3,D/2+4.5,2.2);
 xnPennants([-H.S.w/2+.3,H.top+.2,H.S.d/2-.3],[H.S.w/2-.3,H.top+.2,H.S.d/2-.3],12);vnFolk(-3,D/2+6,3,2);}
// ---------------------------------------------------------------- Miners' Guild
function buildXaGuildMine(G,o){reseed(31211+(o.v|0));const V=xV(o),W=15,D=11;
 const stone=xC(xPick(XPAL.stone)),aged=xC(xPick(XPAL.aged)),iron=xC(0x2e2a26),gold=xC(xPick(XPAL.gold)),rock=xC(0xa89880);
 vnReg("Miners' Guild",0,0,9.5,12);vnReg("Miners' Guild — headframe",12,-3,4,13);
 const H=xnXFHall(0,0,W,D,V===2?[3.8,3.4,3.2]:[3.8,3.4],V===1?xC(xPick(XPAL.wash)):stone,{kind:V===1?'wash':'dressed',trim:xC(XPAL.red),corner:V===1?'gold':'pinnacle'});const E=xnXFDoor(0,D/2,stone);
 kput('xGoldB',[E[0],E[1]-.9,E[2]],qEuler(0,0,.7),[.16,1.5,.12],gold);kput('xGoldB',[E[0],E[1]-.9,E[2]],qEuler(0,0,-.7),[.16,1.5,.12],gold);kput('xGoldB',[E[0]-.45,E[1]-.35,E[2]],qEuler(0,0,.7),[.5,.22,.14],gold);   // crossed pick and hammer
 // the headframe over the shaft: four raked legs, girts, the sheave wheel, the winding rope down the shaft
 {const hx=12,hz=-3,HH=V===1?16:12;vB('vStone',hx,0,hz,3.4,.5,3.4,0,stone);vB('vDarkB',hx,.5,hz,2.2,.02,2.2,0);
  const leg=(sx,sz,t)=>[hx+sx*lerp(2.1,.9,t),HH*t,hz+sz*lerp(2.1,.9,t)];
  for(const sx of[-1,1])for(const sz of[-1,1])vBeam(leg(sx,sz,0),leg(sx,sz,1),.26,aged);
  for(const t of[.33,.66,1])for(const s of[-1,1]){vBeam(leg(-1,s,t),leg(1,s,t),.16,aged);vBeam(leg(s,-1,t),leg(s,1,t),.16,aged);}
  vB('vWood',hx,HH,hz,2.4,.2,2.4,0,aged);kput('vHoop',[hx,HH+1.3,hz],qEuler(0,Math.PI/2,0),[1.2,1.2,1.6],iron);for(let k=0;k<4;k++)kput('vWood',[hx,HH+1.3,hz],qEuler(0,Math.PI/2,0).multiply(qEuler(0,0,k*Math.PI/4)),[2.3,.07,.07],aged);
  vBeam([hx,HH+2.5,hz],[hx,.5,hz],.04,iron,'vRope');vBeam([hx+.9,HH,hz+.9],[hx+1.6,0,hz+7],.22,aged);vBeam([hx-.9,HH,hz+.9],[hx-1.6,0,hz+7],.22,aged);}
 // the rock outcrop behind with an adit, rails out to the tubs
 for(let k=0;k<5;k++)kput('xBoulder',[-6+k*3.2+rr(-.6,.6),1.2+rr(0,1.2),-D/2-6+rr(-1.5,1)],qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[rr(2.6,4),rr(2,3.2),rr(2.6,3.6)],rock.clone().multiplyScalar(rr(.9,1.05)));
 vB('vDarkB',2,0,-D/2-5,2.2,2.6,3,0);for(const s of[-1,1])vPst('vPostB',2+s*1.2,0,-D/2-3.5,.18,2.7,aged);vB('vWood',2,2.7,-D/2-3.5,3,.3,.4,0,aged);
 for(const s of[-1,1])vB('vIron',W/2+3.6+s*.5,.1,-D/2-1,.08,.1,10,0,iron);for(let k=0;k<12;k++)vB('vWood',W/2+3.6,0,-D/2-5.5+k*.85,1.6,.1,.22,0,aged);
 for(const z of(V===2?[-4.4,-2,1.2,3.6]:[-2,1.2])){vB('vRustB',W/2+3.6,.45,z,1,.8,1.5,0,null);kput('xBoulder',[W/2+3.6,1.1,z],null,[.5,.35,.6],xC(0x7a5a48));}
 vnFolk(-4,D/2+5,3,2);vnFolk(10,3,2,1.5);}
// ---------------------------------------------------------------- Goldsmiths' Guild
function buildXaGuildGold(G,o){reseed(31221+(o.v|0));const V=xV(o),W=14,D=11;
 const wash=xC(xPick(XPAL.wash)),stone=xC(xPick(XPAL.stone)),gold=xC(xPick(XPAL.gold)),tim=xC(xPick(XPAL.dark));
 vnReg("Goldsmiths' Guild",0,0,9,20);vnReg("Goldsmiths' Guild — strong room",-11,-2,3.5,14);
 const H=xnXFHall(0,0,W,D,V===2?[4,3.6,3.4]:[4,3.6],wash,{band:true,gold:true,corner:'gold',trim:xC(XPAL.lapis),doorGap:3.4});
 xnIwan(0,.8,D/2*.995,0,5.6,6.4,1.1,wash,{guldasta:true});xnFlight(0,0,D/2+1.1+1.6,0,4,.8,'vStone',stone);xnRoundel(0,.8+6.9,D/2*.995+.02,0,1.5);
 if(V===2)xnDome(0,H.top-.6,0,3.6,'G',{drum:2.2,drumItem:'xDrumM',fin:1.8});else xnGiltRoof(0,H.top-.6,0,V===1?9:7.5,V===1?6.5:5.5,0,{frame:V===1?2.4:1.8,over:1.0});
 // the strong room: a blind dressed-stone tower with one barred slit and a gold bulb (v1: twice as tall)
 const SH=V===1?18:12;xnWall(-11,0,-2,5,SH,5,0,stone,'dressed');vB('vDarkB',-8.55,6,-2,.06,1.2,.3,0);for(let k=0;k<3;k++)vB('vIron',-8.52,6,-2-.1+k*.1,.04,1.2,.03,0,xC(0x2e2a26));
 vB('xFriezeB',-11,SH-.8,-2,4.6,.6,4.6,0);kput('xBulbG',[-11,SH+.2,-2],null,[2.2,2.6,2.2],gold);vBall('xGold',-11,SH+3,-2,.22,gold);
 vB('vWood',-8.6,H.S.y-1.4,-2,2.6,.2,1.6,0,tim);
 // the assay furnace and the display of ingots in the yard, lamps
 {const fx=7,fz=D/2+3;vB('xRubB',fx,0,fz,2.2,1.4,2.2,0,xC(xPick(XPAL.rubble)));kput('xDomeS',[fx,1.4,fz],null,[1.1,1.0,1.1],xC(xPick(XPAL.rubble)));vB('vDarkB',fx,.3,fz+1.1,.7,.6,.06,0);vBall('vEmber',fx,.55,fz+1.05,.22,null,.12);vnChimney(fx,2.4,fz-.4,1.6,.14,true);}
 vB('vStone',-5,0,D/2+3.5,3,.9,1.4,0,stone);for(let i=0;i<3;i++)for(let j=0;j<3-i;j++)kput('xGoldB',[-6+j*.7+i*.35,.9+i*.22+.1,D/2+3.5],null,[.6,.2,.3],gold);
 vnAwning(-5,2.8,D/2+2.6,0,3.6,1.8,xC(XPAL.lapis));for(const s of[-1,1])vPst('xColG',-5+s*1.9,0,D/2+4.4,.06,2.4,gold);
 if(xLit())for(const s of[-1,1])vnLampPost(s*3.5,0,D/2+4,3.4);vnFolk(0,D/2+6,3,2);}
// ---------------------------------------------------------------- Alchemists' Guild
function buildXaGuildAlch(G,o){reseed(31231+(o.v|0));const V=xV(o),W=12,D=9,TX=-12,TZ=-1,TH=V===1?17:12;
 const wash=xC(xPick(XPAL.wash)),stone=xC(xPick(XPAL.stone)),gold=xC(xPick(XPAL.gold)),copper=xC(0xb87333),iron=xC(0x2e2a26);
 vnReg("Alchemists' Guild",0,0,8,11);vnReg("Alchemists' Guild — tower",TX,TZ,5.5,20);
 const H=xnXFHall(0,0,W,D,V===2?[3.6,3.2,3]:[3.6,3.2],wash,{trim:xC(XPAL.turquoise),kind:V===2?'dressed':'wash'});const E=xnXFDoor(0,D/2,wash);
 kput('xPaintBall',[E[0],E[1]-1.05,E[2]],null,[.5,.4,.2],xC(XPAL.turquoise));vB('xGoldB',E[0],E[1]-.7,E[2],.2,.7,.14,0,gold);vB('xGoldB',E[0],E[1]+.02,E[2],.34,.08,.16,0,gold);   // the flask
 // the octagonal tower: whitewash, stained windows in coloured panes, a mosaic dome, a copper vent
 kput('xOctW',[TX,0,TZ],null,[4.6,TH,4.6],wash);kput('xOctS',[TX,0,TZ],null,[4.9,.8,4.9],stone);
 for(let k=0;k<8;k++){const a=k/8*TAU;if(k===0)continue;for(const y of(TH>14?[3,7.2,11.6]:[3,7.2])){const p=loc(TX,TZ,0,4.25,a);vB('vDarkB',p[0],y,p[1],1.0,1.8,.08,a);
  for(let r=0;r<3;r++)vB('xPaint',p[0],y+.1+r*.58,p[1],.8,.5,.06,a,xC(xPick([XPAL.turquoise,XPAL.red,XPAL.saffron,XPAL.lapis,XPAL.green])));vB('vStone',p[0],y-.1,p[1],1.2,.1,.2,a,stone);vB('vStone',p[0],y+1.8,p[1],1.2,.1,.2,a,stone);}}
 vB('xFriezeB',TX,TH-.8,TZ,9.4,.7,9.4,0);xnDome(TX,TH,TZ,4.2,V===2?'T':'M',{drum:1.4,drumItem:'xDrumM',fin:1.8});
 vPst('vPipeC',TX+2.4,TH-2,TZ+2.4,.22,4.5,copper);kput('xBulbG',[TX+2.4,TH+2.5,TZ+2.4],null,[.4,.5,.4],copper);
 vB('vWood',TX+5.3,H.S.y-1.2,TZ,1.8,.2,1.6,0,xC(xPick(XPAL.dark)));vnDoor(TX,.8,TZ+4.28,0,.9,2.1,'vStone',stone,xC(XPAL.turquoise),true);
 // the laboratory yard: retorts on iron stands, the copper still, a coal heap, a kiln
 {const yx=8,yz=D/2+2;vB('vStone',yx,0,yz,5,.9,1.6,0,stone);for(let k=0;k<4;k++){const x=yx-1.8+k*1.2;vPst('vIron',x,.9,yz,.05,.6,iron);vBall('vBallW',x,1.75,yz,.28,xC(xPick([0xd8f0e8,0xf0e8c0,0xe8d0f0,0xc8f0f8])));if(k<3)beam('vPipeC',[x,1.95,yz],[x+1.2,1.75,yz],.05,.05,copper);}
  vPst('vTankW',yx-3.6,0,yz-.4,.7,1.8,copper);kput('xDomeS',[yx-3.6,1.8,yz-.4],null,[.72,.6,.72],copper);beam('vPipeC',[yx-3.6,2.3,yz-.4],[yx-2,1.75,yz],.08,.08,copper);vBall('vEmber',yx-3.6,.25,yz+.3,.18,null,.1);}
 vnBarrel(-5,0,D/2+2.6,.34,.9);vnCrate(-6.4,0,D/2+2.2,.7,.2);xnPennants([TX,16.5,TZ],[H.S.w/2,H.top+.2,H.S.d/2],9,[0x2aa5a0,0x1e3f8a,0xf4efe4,0xe8a030]);
 if(xLit())vnLampPost(4,0,D/2+5,3.2);vnFolk(0,D/2+5.5,3,2);}
// ---------------------------------------------------------------- Masons' Guild
function buildXaGuildMason(G,o){reseed(31241+(o.v|0));const V=xV(o),W=16,D=11;
 const stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),aged=xC(xPick(XPAL.aged)),gold=xC(xPick(XPAL.gold)),iron=xC(0x2e2a26);
 vnReg("Masons' Guild",0,0,10,14);vnReg("Masons' Guild — derrick",11,4,4,14);
 const H=xnXFHall(0,0,W,D,V===2?[3.6,3.2,3]:[3.6,3.2],stone,{kind:'dressed',trim:xC(XPAL.saffron),corner:V===1?'gold':null,band:V===1});const E=xnXFDoor(0,D/2,wash);
 vB('xGoldB',E[0]-.5,E[1]-1.0,E[2],.16,1.3,.12,0,gold);vB('xGoldB',E[0]+.1,E[1]-1.0,E[2],1.1,.16,.12,0,gold);vBeam([E[0]+.4,E[1]+.5,E[2]],[E[0]+.4,E[1]-.4,E[2]],.03,gold,'vRope');vBall('xGold',E[0]+.4,E[1]-.5,E[2],.12,gold);   // square and plumb
 // the unfinished top storey: dressed blocks laid part way, a ladder, tools, the scaffold
 const y3=H.top-.6,tw=H.S.w*.96,td=H.S.d*.96;
 if(V===1)xnGiltRoof(0,y3,0,6,4.4,0,{frame:1.6,over:.9});   // v1: the hall is finished, and gilded
 else{for(const s of[-1,1])vB('vStone',0,y3,s*(td/2-.4),tw*.75,1.6,.8,0,stone);vB('vStone',-tw/2+.4,y3,0,.8,2.2,td,0,stone);
 for(let k=0;k<4;k++)vB('vStone',tw/2-.4-k*.02,y3,-td/2+1+k*2.2,.8,.7+k*.45,1.8,0,stone.clone().multiplyScalar(rr(.95,1.05)));
 for(const z of[-3,0,3])vPst('vPost',tw/2+1.2,y3-3,z,.1,5,aged);vB('vWood',tw/2+.7,y3+.5,0,1.4,.12,8,0,aged);vnLadder(tw/2+1.6,0,3.5,Math.PI/2,y3+.7,aged);}
 // the derrick over the stone yard: mast, boom, guys, a block on the hook; cut blocks and an arch template
 {const dx=11,dz=4,MH=12;vB('vStone',dx,0,dz,1.6,.5,1.6,0,stone);vPst('vPostB',dx,.5,dz,.28,MH,aged);
  for(const g of[[-6,-4],[6,-3],[-5,7],[5,7]]){vBeam([dx,MH+.4,dz],[dx+g[0],.2,dz+g[1]],.04,xC(0x6a5a48),'vRope');vPst('vPost',dx+g[0],0,dz+g[1],.1,.6,aged);}
  const be=[dx-6.5,8,dz+2.5];vBeam([dx,1.2,dz],be,.24,aged);vBeam([dx,MH+.2,dz],be,.05,iron,'vRope');vBeam(be,[be[0],3.4,be[2]],.04,iron,'vRope');vB('vIron',be[0],3.1,be[2],.3,.34,.3,0,iron);vB('vPlaster',be[0],1.4,be[2],1.8,1.0,1.1,.2,stone);}
 for(let i=0;i<3;i++)for(let j=0;j<3-i;j++)vB('vPlaster',-9+j*1.7+i*.85,i*.82,D/2+3+(i%2)*.1,1.6,.8,1.0,0,stone.clone().multiplyScalar(rr(.95,1.05)));
 kput('xArcW',[3,1.2,D/2+5],qEuler(0,0,0),[4,2.2,.3],aged);for(const s of[-1,1])vB('vWood',3+s*1.6,0,D/2+5,.4,1.2,.9,0,aged);
 vB('vWood',-3,0,D/2+6,1.4,.3,2.6,.3,aged);vB('vPlaster',-3,.3,D/2+6,1.1,.7,1.5,.3,stone);
 vnFolk(0,D/2+8,3,2);xnFolk(tw/2+1,y3+.6,-2,1,.4);}
// ---------------------------------------------------------------- the generator
function buildXaGenerator(G,o){reseed(31251+(o.v|0));const V=xV(o),W=14,D=10,H=6;
 const rub=xC(xPick(XPAL.rubble)),aged=xC(xPick(XPAL.aged)),iron=xC(0x2e2a26),wash=xC(xPick(XPAL.wash));
 vnReg('Generator',0,0,8.5,H+9);vnReg('Generator — yard',10,3,5,6);
 // the hall: rubble walls, the front open round the turbine, a corrugate gable roof, salvage patches
 vB('xRubB',0,0,-D/2+.4,W,H,.8,0,rub);for(const s of[-1,1])vB('xRubB',s*(W/2-.4),0,0,.8,H,D,0,rub);for(const s of[-1,1])vB('xRubB',s*(W/2-2),0,D/2-.4,4,H,.8,0,rub);
 if(V===2){xnFlatRoof(0,H,0,W,D,0,xC(xPick(XPAL.earth)),{parapet:.5});vnPatch(0,H+.3,D/2-.2,0,W,.5,3);for(let k=0;k<5;k++)kput('vSheet',[rr(-5,5),H+.36,rr(-3,3)],qEuler(-Math.PI/2,0,rng()),[rr(1.5,2.6),rr(1.2,2),1],null);}   // v2: a flat mud roof patched with sheet
 else{vB('vWood',0,H-.1,0,W+.8,.3,.3,0,aged);vnGableRoof(0,H+.2,0,W+.8,D+.8,2.2,0,'vCorr',null,.6,'vGableSt',rub);vnPatch(0,H+.3,D/2+1.5,0,W,1.8,2);}
 vnWin(-W/2,2.6,-2,-Math.PI/2,1.4,1.2,'open','vIron',iron);vnWin(-W/2,2.6,2,-Math.PI/2,1.4,1.2,'open','vIron',iron);
 // the turbine: a great salvaged cylinder on plinths with its flywheel, pipes out through the wall to the tanks
 kput('vTankW',[0,2.2,-1],qEuler(0,0,Math.PI/2),[1.6,8,1.6],null);for(const x of[-3,3])vB('vStone',x,0,-1,1.8,1.4,3.6,0,rub);
 kput('vHoop',[4.6,2.2,-1],qEuler(0,Math.PI/2,0),[1.7,1.7,2.4],iron);kput('vTankR',[4.6,2.2,-1],qEuler(0,0,Math.PI/2),[.5,.4,.5],null);
 for(let k=0;k<3;k++)beam('vPipe',[-2+k*2,3.0,-1],[-2+k*2,H-.3,-D/2-.6],.16,.16,iron);beam('vPipe',[-4,2.2,-1],[-W/2-2.4,1.2,2],.28,.28,iron);
 vPst('vTankW',-W/2-3.6,0,2.4,1.6,3.4,null);vPst('vTankR',-W/2-3.2,0,-1.4,1.1,2.6,null);beam('vPipe',[-W/2-3.6,3.4,2.4],[-W/2-3.2,2.6,-1.4],.16,.16,iron);
 // the chimney with its lamp ring, the transformer yard: poles, crossarms, wires to the lamps
 for(const cx of(V===1?[W/2+2.4,W/2+5.2]:[W/2+2.4])){vPst('vPipeR',cx,0,-D/2+1,.7,15,null);vB('vIron',cx,14.6,-D/2+1,2.2,.16,2.2,0,iron);for(let k=0;k<4;k++){const a=k/4*TAU;vBall('vBulb',cx+Math.sin(a)*1,14.4,-D/2+1+Math.cos(a)*1,.14);}}
 for(const [x,z] of[[10,4],[10,-2],[16,4]]){vPst('vPost',x,0,z,.12,7,aged);vB('vWood',x,6.4,z,1.6,.1,.1,0,aged);for(const s of[-1,1])vBall('vBall',x+s*.7,6.5,z,.08,xC(0xd8d8d0));}
 vBeam([9.3,6.5,4],[9.3,6.5,-2],.02,iron,'vRope');vBeam([10.7,6.5,4],[16.7,6.5,4],.02,iron,'vRope');vBeam([10.7,6.5,-2],[W/2+2.4,7.2,-D/2+1],.02,iron,'vRope');
 vB('vIron',10,2.2,1,1.4,1.8,1,0,iron);for(let k=0;k<5;k++)vB('vIron',10,2.3+k*.3,1,1.6,.06,1.2,0,xC(0x4a4640));
 // the lamps this house feeds, a scrap heap, coal, oil drums
 for(const [x,z] of[[-4,D/2+4],[4,D/2+4],[14,-1]])vnLampPost(x,0,z,4.2);vBeam([-4,4.2,D/2+4],[4,4.2,D/2+4],.02,iron,'vRope');
 for(let k=0;k<7;k++){const a=h3(k,1,2),b=h3(k,3,4);kput(['vPlate','vSheet','vPlateW'][k%3],[13+(a-.5)*3,.3+k*.06,-5+(b-.5)*2.4],qEuler(-Math.PI/2+(a-.5)*.7,a*3,(b-.5)*.5),[rr(1,1.9),rr(.8,1.5),1],null);}
 for(let k=0;k<3;k++)vPst('vTankR',-6+k*1.2,0,D/2+2,.4,1,null);kput('xPaintBall',[7,.7,D/2+3],null,[1.8,.8,1.6],xC(0x2a2622));
 vnFolk(0,D/2+6,3,2);}

const XTAG_GUILD={type:['civic','industry'],wealth:'civic',lit:true};
XA.def({key:'xa_guild_farm',name:"Farmers' Guild",family:'Guilds',tags:XTAG_GUILD,w:34,d:26,h:14,fw:17,fd:12,build:buildXaGuildFarm});
XA.def({key:'xa_guild_mine',name:"Miners' Guild",family:'Guilds',tags:XTAG_GUILD,w:34,d:30,h:15,fw:16,fd:12,build:buildXaGuildMine});
XA.def({key:'xa_guild_gold',name:"Goldsmiths' Guild",family:'Guilds',tags:XTAG_GUILD,w:30,d:24,h:20,fw:15,fd:12,build:buildXaGuildGold});
XA.def({key:'xa_guild_alch',name:"Alchemists' Guild",family:'Guilds',tags:XTAG_GUILD,w:30,d:22,h:19,fw:13,fd:10,build:buildXaGuildAlch});
XA.def({key:'xa_guild_mason',name:"Masons' Guild",family:'Guilds',tags:XTAG_GUILD,w:34,d:28,h:16,fw:17,fd:12,build:buildXaGuildMason});
XA.def({key:'xa_generator',name:'Generator',family:'Guilds',tags:{type:['industry','infrastructure'],wealth:'civic',lit:true},w:36,d:24,h:16,fw:15,fd:11,build:buildXaGenerator});
