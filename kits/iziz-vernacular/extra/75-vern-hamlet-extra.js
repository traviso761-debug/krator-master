// ================================================================= IZIZ VERNACULAR (opt-in): the hamlet pieces the settlers' villages lacked
// OPT-IN (2026-11-24, settlements/hook S5): this file is in extra/, which vernacular.py's FILES do not list, so no page that
// reads the kit's src/ changes; a build lists it by name after the kit's fragments (settlements/hook/build.py IZV_EXTRA). It
// folds into src/72-vern-civic.js and src/73b-vern-works.js at the next all-builds rebuild (TODO.md, "Ride along").
//   vern_shrine   a village shrine of the Izani state religion: the pending piece of core/hamlet's iziz row (21: 9 x 12 m), a
//                 stepped stone plinth, a whitewashed cella under a copper pyramid with a finial, the offering niche lit on
//                 the front, two lamps on posts, a bell frame beside it
//   vern_sawpit   the settlers' timber works: an open saw shed on posts over a saw pit with a log across it, the log
//                 ramp, stacked logs, plank stacks under a lean-to, a sawhorse and a hoist frame
VERN.def({key:'vern_shrine',name:'Village shrine',family:'civic',tags:{type:['religious','civic'],wealth:'civic',lit:true},w:9,d:12,h:8,build:buildVernShrine});
VERN.def({key:'vern_sawpit',name:'Saw pit and timber yard',family:'works',tags:{type:['industry'],wealth:'poor',lit:false},w:20,d:14,h:7,build:buildVernSawpit});
function buildVernShrine(G,o){reseed(8211+(o.v|0));const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodMid)),trim=vC(vPick(VPAL.trim)),
  pl=vC(0xf1ece0),cu=vC(0xffffff),or=vC(vPick(VPAL.orange)),iron=vC(0x2e2a26),gold=vC(0xc9a24a);
 const W=5.4,D=6.6,P0=.35,P1=.35,PY=P0+P1,H=3.1,FZ=D/2;
 vnReg('Village shrine',0,0,5.2,8,{type:['religious','civic']});
 // the plinth in two steps, the front steps up to the door
 vB('vStone',0,0,0,W+2.2,P0,D+2.4,0,stD);vB('vStone',0,P0,0,W+1.1,P1,D+1.2,0,st);
 vnStairs(0,0,FZ+1.25,0,2.2,PY,3,'vStone',stD);
 // the cella: whitewashed walls, a cornice in orange trim, the copper pyramid and its finial
 vB('vPlaster',0,PY,0,W,H,D,0,pl);const top=vnCornice('vStone',0,PY+H,0,W,D,0,or,2);
 vnPyrRoof('vPyrCu',0,top,0,W,D,2.4,0,cu,.35);vPst('vFinial',0,top+2.3,0,.12,1.3,gold);vBall('vFinial',0,top+3.7,0,.26,gold);
 for(const s of[-1,1])vB('vStone',s*(W/2+.08),PY,0,.32,H,D+.1,0,st);   // the corner piers
 // the door and the offering niche beside it, lit; the orange band over the door
 vnDoor(-.9,PY,FZ,0,1.2,2.3,'vWood',wood,trim,false);
 vB('vStone',1.35,PY+.9,FZ+.12,1.1,1.3,.3,0,stD);vB('vPlaster',1.35,PY+1.0,FZ+.2,.8,.95,.12,0,IZ_ROOMC);vBall('vFinial',1.35,PY+1.12,FZ+.24,.12,gold);
 vnLamp(1.35,PY+2.35,FZ+.14,0);vB('vStone',-.2,PY+2.6,FZ+.06,3.2,.28,.12,0,or);
 for(const s of[-1,1])vnWin(s*(W/2),PY+1.6,-.4,s*Math.PI/2,.7,1.0,'lit','vStone',st,false);
 // two lamps on posts at the foot of the steps, the bell frame on the left, a bench on the right
 for(const s of[-1,1])vnLampPost(s*2.1,0,FZ+2.4,2.6);
 {const bx=-W/2-1.7,bz=1.2;for(const s of[-1,1])vPst('vPost',bx+s*.7,0,bz,.08,2.6,wood);vB('vWood',bx,2.6,bz,1.7,.16,.22,0,wood);
  vBall('vFinial',bx,2.15,bz,.32,vC(0x8a6a2a),1.3);vB('vIron',bx,2.4,bz,.05,.25,.05,0,iron);}
 vB('vStone',W/2+1.4,0,1.2,.45,.42,1.8,0,stD);vB('vWood',W/2+1.4,.42,1.2,.55,.07,1.9,0,wood);
 vnPlanter(-1.9,PY,-FZ-.7,1.2,.6,0,stD);vnPlanter(1.9,PY,-FZ-.7,1.2,.6,0,stD);
 vnFolk(0,FZ+3.2,2,.6);}
function buildVernSawpit(G,o){reseed(8221+(o.v|0));const wood=vC(vPick(VPAL.woodMid)),stD=vC(vPick(VPAL.stoneDark)),bark=vC(0x5a4632),cut=vC(0xc8a57a),
  sheet=vC(0x8f8a80),earth=vC(0x5e4a36),iron=vC(0x2e2a26);
 vnReg('Saw pit',0,0,9,7,{type:['industry']});
 // the saw shed: six posts, a pitched roof of salvaged sheet, open on every side
 const SX=7,SZ=5.2,SH=3.6,sx0=-3.2;
 for(const i of[-1,0,1])for(const s of[-1,1])vPst('vPost',sx0+i*SX/2,0,s*SZ/2,.13,SH,wood);
 for(const s of[-1,1])vB('vWood',sx0,SH,s*SZ/2,SX+.3,.22,.22,0,wood);
 vnGableRoof(sx0,SH+.1,0,SX+.8,SZ+1.0,1.3,0,'vStone',sheet,.3,'vWood',wood,.08);
 // the saw pit: a dark pit lined with planks, the log across it on two trestle beams, the long saw
 vB('vRock',sx0,-.02,0,4.6,.06,1.6,0,earth);vB('vDarkB',sx0,-.01,0,4.2,.05,1.2,0,vC(0x1c1814));
 for(const s of[-1,1])vB('vWood',sx0,.02,s*.66,4.6,.14,.16,0,wood);
 for(const x of[-1.6,1.6])vB('vWood',sx0+x,.1,0,.3,.24,2.4,0,wood);
 vPst('vStave',sx0,.55,0,.32,5.4,bark,qEuler(0,0,Math.PI/2));vB('vWood',sx0+.6,.88,0,1.8,.08,.42,0,cut);   // the log, its sawn face
 vB('vIron',sx0+.2,.2,0,.04,2.2,.04,0,iron);vB('vWood',sx0+.2,2.35,0,.5,.06,.06,0,wood);                  // the pit saw standing in its cut
 // the log ramp and the log pile behind it, butts outward
 for(const z of[-1.1,1.1])vBeam([sx0+3.2,.95,z],[sx0+6.6,0,z],.14,wood);
 for(let r=0;r<3;r++)for(let k=0;k<4-r;k++){const z=-2.3+(k+r*.5)*1.3,y=.35+r*.62;vPst('vStave',5.4,y,z,.32,5.6,bark,qEuler(0,0,Math.PI/2));
  vBall('vFinial',8.2,y,z,.3,cut,.15);}
 // the planks under a lean-to on the far side, stickered in stacks
 {const lx=-3.2,lz=-5.0;vnShedRoof(lx,2.5,lz,8.0,2.4,.4,0,'vCopperB',sheet,.2,.08);for(const x of[-3.8,0,3.8])vPst('vPost',lx+x,0,lz+1.1,.09,2.5,wood);
  for(const x of[-2.2,1.6])for(let k=0;k<6;k++)vB('vWood',lx+x,.2+k*.16,lz,3.2,.1,1.5,0,k%2?cut:vC(0xb48f62));}
 // a sawhorse, a grindstone, the hoist frame over the ramp's head, offcuts and a water butt
 vB('vWood',0,.75,4.4,2.0,.12,.16,0,wood);for(const s of[-1,1])vBeam([s*.8,0,4.1],[s*.8,.75,4.4],.06,wood);
 vBall('vRock',-1.6,.5,4.6,.42,stD,.3);vB('vWood',-1.6,0,4.6,.5,.4,.12,0,wood);
 {const hx=sx0+3.6;for(const s of[-1,1])vBeam([hx,0,s*1.9],[hx,4.6,0],.11,wood);vB('vWood',hx,4.6,0,.2,.2,.6,0,wood);vB('vRope',hx,2.6,0,.03,2.0,.03,0,vC(0x8a7a5a));}
 for(let k=0;k<5;k++)vB('vWood',2.0+k*.45,.08,3.2+((k*7)%3)*.3,.9,.1,.18,k*.6,cut);
 vnWaterButt(-6.6,0,3.6,.5,1.1);vnFolk(sx0,3.2,2,.8);}
