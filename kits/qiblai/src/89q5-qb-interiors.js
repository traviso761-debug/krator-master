// ================================================================= QIBLAI — interiors (Q6; PLAN.md section 7)
// Four rooms the plan asks for: the sanctum of the Rainbow Temple (the Station as it was, whole, in gold at the centre under
// the dome; eight pillars in the eight monasteries' colours round it), the assembly hall of a great monastery (the dukhang:
// red columns in a grid, the monks' rows of low seats, the altar wall), the council chamber of the Hall of the Decree (the
// eight Prismarchs' thrones in two rows facing each other, one a spoke each, and the Sultan's seat on its dais at the head,
// kept empty under a white cloth), and the pilgrims' hostel's dormitory. Each draws two ways:
//   o.cut true (the sheet's default)  a cut-away on a plinth, the walls cut at 1.6 m, seen from above
//   o.cut false (the city, in place)  full height inside its building's storey (o.W, o.D: the storey's plan less its walls,
//                                     o.H its height), a lining on the walls, a ceiling, the doors where the building has them;
//                                     settlements/qiblai places it when the camera comes to the building (90t-qc-interiors.js)
// A builder draws the shell and the fixed pieces and records the room (QB_ROOMS: world outline, doors, the fixed pieces as
// fixtures the furniture keeps off); qnFurnishRooms (89q5f) furnishes it with the catalog's Xanadu pieces through
// kits/interiors. Seeds 33800-33899.
const QB_ROOMS=[];   // [{key, name, kind, culture, wealth, y, h, poly:[[x,z]…], doors:[…], fixtures:[…]}] in world metres
// a room in the running builder's local frame, recorded in world metres (VERN.cur's plot, yaw and scale). A fixture's front
// clearance is at least 0.4 m: kits/interiors' placer fits nothing against a wall when one fixture's is smaller (0.2, 0 or none;
// found 2026-11-11 with a node probe, KNOWN_ISSUES.md)
function qnRoomRec(name,kind,wealth,lpoly,y,h,ldoors,lfix){const c=VERN.cur,s=(c.o.scale==null?1:c.o.scale),W=(lx,lz)=>loc(c.x,c.z,lx*s,lz*s,c.ry);
 QB_ROOMS.push({key:c.D.key,name,kind,culture:'xanadu',wealth,y:((c.o.y==null?0:c.o.y))+y*s,h:h*s,poly:lpoly.map(p=>W(p[0],p[1])),
  doors:ldoors.map(d=>({at:W(d[0],d[1]),w:d[2]*s,to:'street',swing:'none'})),
  fixtures:(lfix||[]).map((f,i)=>{const p=W(f.x,f.z);return{id:c.D.key+'.fix.'+i,kind:f.kind,x:p[0],z:p[1],ry:((f.ry==null?0:f.ry))+c.ry,w:f.w*s,d:f.d*s,h:(f.h==null?1:f.h),clearance:{front:Math.max(.4,f.front==null?.6:f.front)}};})});}
// the shell. doors: [[side, u, w]] (side 's' the front +z, 'n', 'e' +x, 'w'; u along the wall from its middle, w its width).
// Cut away: a plinth P high, a floor, four walls cut at ch with the doors' gaps, the band on the side walls' tops. In place:
// no plinth (the building's storey is under it), a floor, a lining 0.12 m thick set 0.45 m inside the building's wall (clear
// of its batter) with the doors' gaps, a ceiling with painted beams. Returns the floor top.
function qnIxShell(W,D,cut,P,H,wallC,floorC,doors,ceilC,floorIt){floorIt=floorIt||'qPlankB';const t=cut?.6:.12,o=cut?t/2:-t/2,h=cut?1.6:H,y0=cut?P:0;
 if(cut)qnPlinth(0,0,W+2*t,D+2*t,P,0);
 vB(floorIt,0,y0,0,W,.06,D,0,floorC);   /* the floor: Qiblai's floorboards or the sanctum's marble mosaic, in their own colours (floorC a light wash over them) */
 const wall=(side)=>{const along=side==='s'||side==='n'?W:D,gs=(doors||[]).filter(d=>d[0]===side).map(d=>[d[1]-d[2]/2,d[1]+d[2]/2]).sort((a,b)=>a[0]-b[0]);
  const seg=(u0,u1)=>{if(u1-u0<.05)return;const m=(u0+u1)/2,L=u1-u0;
   if(side==='s')vB('xWashB',m,y0,D/2+o,L,h,t,0,wallC);else if(side==='n')vB('xWashB',m,y0,-D/2-o,L,h,t,0,wallC);
   else if(side==='e')vB('xWashB',W/2+o,y0,m,t,h,L,0,wallC);else vB('xWashB',-W/2-o,y0,m,t,h,L,0,wallC);};
  let u=-along/2-(cut&&(side==='e'||side==='w')?t:0);const end=along/2+(cut&&(side==='e'||side==='w')?t:0);
  for(const [g0,g1] of gs){seg(u,g0);u=g1;}seg(u,end);
  if(!cut)for(const [g0,g1] of gs){const m=(g0+g1)/2,L=g1-g0,dh=Math.min(h-.4,3.6);   /* the lintel over a door gap, the dark reveal of the building's door behind it */
   if(side==='s')vB('xWashB',m,y0+dh,D/2+o,L,h-dh,t,0,wallC);else if(side==='n')vB('xWashB',m,y0+dh,-D/2-o,L,h-dh,t,0,wallC);
   else if(side==='e')vB('xWashB',W/2+o,y0+dh,m,t,h-dh,L,0,wallC);else vB('xWashB',-W/2-o,y0+dh,m,t,h-dh,L,0,wallC);}};
 for(const s of['s','n','e','w'])wall(s);
 if(cut){for(const s of[-1,1])vB('xBandB',s*(W/2+t/2),P+h,0,t+.06,.25,D+2*t,0,xC(xPick(XPAL.maroon)));}
 else{const cy=H-.3;vB('qLacqB',0,cy,0,W,.1,D,0,ceilC||xC(0x7a3a2a));   /* the ceiling, lacquered in the room's colour, the lacquered beams under it */
  const n=Math.max(2,Math.round(W/3));for(let i=0;i<=n;i++)vB('qLacqB',-W/2+W*i/n,cy-.22,0,.24,.22,D,0,xC(xPick(XPAL.dark)));
  for(const s of[-1,1])vB('xBandB',0,cy-.5,s*(D/2-.08),W,.32,.06,0,xC(xPick(XPAL.maroon)));
  for(const s of[-1,1])vB('xBandB',s*(W/2-.08),cy-.5,0,.06,.32,D,0,xC(xPick(XPAL.maroon)));}
 return y0+.06;}
// the room's parameters: the sheet's sizes by default, the building's storey in place
const qnIxDims=(o,W,D,H)=>({cut:o.cut!==false,W:o.W==null?W:o.W,D:o.D==null?D:o.D,H:o.H==null?H:o.H});
// a butter-lamp table: a low timber table under rows of gilt lamps (lit)
function qnLampTable(x,y,z,ry,w){const tim=xC(xPick(XPAL.dark));vB('vWood',x,y,z,w,.7,.6,ry,tim);const n=Math.max(3,Math.round(w/.22));
 for(let r=0;r<2;r++)for(let i=0;i<n;i++){const p=loc(x,z,-w/2+.11+i*(w-.22)/(n-1),-.15+r*.3,ry);vBall('qGiltBall',p[0],y+.78,p[1],.06,xC(0xf0b040));}}
// a column inside (xnCol's form on Qiblai's textured items): a stone base, the shaft lacquered in c, the capital's three tiers
// in c and capC, the two brackets
function qnIxCol(x,y,z,h,r,ry,c,capC){c=c||xC(xPick(XPAL.red));capC=capC||xC(XPAL.gold[0]);r=r||.18;ry=ry||0;
 vB('vStone',x,y-.05,z,r*3,.16,r*3,ry,xC(xPick(QSTONE)));vB('qLacqB',x,y+.1,z,r*2,h-.72,r*2,ry,c);
 vB('qLacqB',x,y+h-.62,z,r*3.2,.2,r*2.2,ry,capC);vB('qLacqB',x,y+h-.42,z,r*5.2,.24,r*2.4,ry,c);vB('qLacqB',x,y+h-.18,z,r*7.2,.18,r*2.6,ry,capC);
 for(const s of[-1,1]){const p=loc(x,z,s*r*2.6,0,ry);xnBracket(p[0],y+h-.42,p[1],ry+s*Math.PI/2,r*1.6,.24,r*2.2,capC,'qLacqArm',true);}}

// ---------------------------------------------------------------- the sanctum of the Rainbow Temple
// The Station as it was, whole: at the centre, on a stepped dais, a gilt shrine with the eight-spoked wheel on each of its four
// faces (one to each door) and a small gilt dome; the eight pillars in a ring on the eight bearings, each painted in its
// monastery's colour with a hanging of that colour turned to the centre (the Rainbow Temple inside as out); butter lamps on
// tables at the four corners; the four aisles from the doors to the dais kept clear.
function buildQbIxSanctum(G,o){reseed(33831+(o.v|0));const X=qnIxDims(o,20,20,5.2),W=X.W,D=X.D,P=.9;
 const wash=xC(xPick(XPAL.wash)),floor=xC(0x8a6a48),g=xC(xPick(XPAL.gold)),stone=xC(xPick(QSTONE));
 vnReg('Sanctum of the Rainbow Temple (interior)',0,0,Math.hypot(W,D)/2,(X.cut?P:0)+X.H);
 const dw=X.cut?2.4:2.6,doors=[['s',0,dw],['n',0,dw],['e',0,dw],['w',0,dw]];
 const y=qnIxShell(W,D,X.cut,P,X.H,wash,xC(0xf4f0ea),doors,xC(0x2a4a7a),'qMarbleB');
 const fix=[],k=Math.min(W,D)/28;
 // the dais and the shrine
 vB('vStone',0,y,0,8*k,.35,8*k,0,stone);vB('vStone',0,y+.35,0,6*k,.35,6*k,0,stone);const sy=y+.7,sh=Math.min(3.0,X.H-1.6);
 vB('qGiltB',0,sy,0,3.4*k,sh,3.4*k,0,g);vB('xBandB',0,sy+sh,0,3.6*k,.2,3.6*k,0,xC(xPick(XPAL.maroon)));
 for(let a=0;a<4;a++){const ry=a*Math.PI/2,p=loc(0,0,0,1.7*k+.04,ry);qnWheel(p[0],sy+sh*.55,p[1],ry,Math.min(1.1,sh*.32)*Math.max(.7,k),xC(XPAL.gold[0]),QN_GILT_TEX);}
 kput('qGiltBulb',[0,sy+sh+.2,0],null,[1.1*k,Math.min(.9,X.H-sh-1.2)*k+.2,1.1*k],g);
 fix.push({kind:'dais',x:0,z:0,w:8*k,d:8*k,h:sh+1,front:1});
 // the eight pillars in their colours, a hanging on each turned to the centre; a cardinal one stands beside its aisle (on its
 // bearing's side, clockwise), the aisle from the door left clear
 const r=Math.min(W,D)*.32;
 for(let i=0;i<8;i++){const d=qnSpokeDir(i),side=i%2?0:dw/2+1.4,   /* a metre clear of the aisle: at 0.5 m the placer's grid closed the gap on one side */x=d[0]*r-d[1]*side,z=d[1]*r+d[0]*side,ry=Math.atan2(-x,-z),c=xC(QSPOKE[i].wall);
  qnIxCol(x,y,z,X.cut?2.2:X.H-.3,.26,ry,c,xC(XPAL.gold[0]));const h=loc(x,z,0,.32,ry),hh=X.cut?1.4:Math.min(2.6,X.H-1.6);
  vB('vClothB',h[0],y+(X.cut?.5:X.H-.6-hh),h[1],.9,hh,.04,ry,c);vB('vClothB',h[0],y+(X.cut?.4:X.H-.7-hh),h[1],.9,.12,.05,ry,xC(QSPOKE[i].band));
  fix.push({kind:'column',x,z,w:.8,d:.8,h:3,front:.4});}
 // the butter lamps at the four corners, turned to the shrine
 for(let a=0;a<4;a++){const q=Math.PI/4+a*Math.PI/2,x=Math.sin(q)*r*1.25,z=Math.cos(q)*r*1.25,ry=Math.atan2(-x,-z);qnLampTable(x,y,z,ry,2.2*Math.max(.8,k));
  fix.push({kind:'table',x,z,ry,w:2.4,d:.8,h:.9,front:.8});}
 // the four aisles from the doors to the dais, kept clear; each stops 0.8 m short of the dais and 1.6 m short of its doorway
 // (below), so the floor round the room stays one walk (an aisle that ran from the dais to the doorway cut the room into four
 // quarters the furnisher could not reach: 2026-11-15)
 for(let a=0;a<4;a++){const q=a*Math.PI/2,a0=4*k+.8,a1=D/2-1.2-1.6,L=a1-a0,m=(a0+a1)/2;if(L>.5)fix.push({kind:'aisle',x:Math.sin(q)*m,z:Math.cos(q)*m,ry:q,w:dw,d:L,h:.05,front:.4});}
 // the furnisher is told of the south door only (the shrine programme hangs its altar on the wall facing the door, and in a
 // room with a door in every wall it searched for minutes at the city's size: found 2026-11-15); the other three doorways
 // are kept clear as fixtures, their aisles to the dais above
 for(const [x,z,w,d] of[[0,-D/2+.6,dw+.8,1.2],[W/2-.6,0,1.2,dw+.8],[-W/2+.6,0,1.2,dw+.8]])fix.push({kind:'doorway',x,z,w,d,h:.05,front:.4});
 // furnished as an antechamber (lamps, benches, screens, hangings): the gilt shrine at the centre is the altar, so the shrine
 // programme's required altar on the back wall is not asked for (at the city's size it found no fit, and its backtracking ran
 // for minutes: 2026-11-15)
 qnRoomRec('Sanctum of the Rainbow Temple','antechamber',1,[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2]],y,X.H-.4,[[0,D/2,dw]],fix);}

// ---------------------------------------------------------------- the assembly hall (a great monastery's dukhang)
// o.v a spoke (0-7): the hall's walls in its monastery's colour (QSPOKE), as the building's
function buildQbIxAssembly(G,o){reseed(33801+(o.v|0));const X=qnIxDims(o,22,16,4.4),W=X.W,D=X.D,P=.8;
 const red=o.v==null?xC(xPick(XPAL.redwall)):xC(QSPOKE[o.v%8].wall),floor=xC(0x8a6a48),seat=xC(xPick(XPAL.maroon)),g=xC(xPick(XPAL.gold)),tim=xC(xPick(XPAL.dark));
 vnReg('Assembly hall (interior)',0,0,Math.hypot(W,D)/2,(X.cut?P:0)+X.H);
 const y=qnIxShell(W,D,X.cut,P,X.H,red,xC(0xf0e8dc),[['s',0,3]],xC(0x6a2a24));
 const fix=[],ch=X.cut?3:X.H-.3;
 // the monks' rows either side of the aisle, facing it; the columns, red, in the side bays beyond the outermost row, 4.5 m
 // apart down the hall (never between the rows: a column in a 0.6 m gap between two rows walls them in, and the placer then
 // searches for a path it cannot find: found 2026-11-15, the page hung)
 const rows=Math.max(2,Math.min(4,Math.floor((W/2-4.5)/1.6))),E=2.6+1.5*(rows-1)+.45;
 for(const s of[-1,1])for(let r=0;r<rows;r++){const x=s*(2.6+r*1.5),L=D-7;vB('vWood',x,y,1,.9,.24,L,0,tim);vB('vClothB',x,y+.24,1,.8,.12,L-.2,0,seat);fix.push({kind:'bench',x,z:1,w:.9,d:L,h:.4,front:.4});}
 const nz=Math.max(2,Math.floor((D-4)/4.5)+1);
 for(let n=0;E+1.6+5*n<=W/2-1.2;n++)for(const s of[-1,1])for(let j=0;j<nz;j++){const x=s*(E+1.6+5*n),z=(j-(nz-1)/2)*4.5;
  qnIxCol(x,y,z,ch,.22,0,xC(XPAL.red),xC(XPAL.saffron));fix.push({kind:'column',x,z,w:.6,d:.6,h:3,front:.4});}
 // the back wall is the altar's (the catalog's Xanadu altar, placed by the shrine programme); the gilt image over it, and the
 // abbot's throne by the side wall in the back corner bay, facing the rows
 vB('qGiltB',0,y+.3,-D/2+.08,2.4,X.cut?1.25:Math.min(2.6,X.H-1.2),.12,0,g);
 const tz=-D/2+1.4,tx=W/2-1.4;vB('vWood',tx,y,tz,1.2,.6,1.2,0,tim);vB('vClothB',tx,y+.6,tz,1.1,.16,1.1,0,seat);vB('vWood',tx+.52,y+.6,tz,.16,1.1,1.2,0,tim);vB('vClothB',tx+.42,y+.8,tz,.04,.8,.9,0,xC(XPAL.saffron));
 fix.push({kind:'throne',x:tx,z:tz,ry:-Math.PI/2,w:1.6,d:1.6,h:1.6,front:.8});
 if(!X.cut)for(const s of[-1,1])qnLampTable(s*(W/2-2.4),y,-D/2+1.1,0,1.8);
 qnRoomRec('Assembly hall','shrine',.7,[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2]],y,X.H,[[0,D/2,3]],fix);}

// ---------------------------------------------------------------- the council chamber of the Hall of the Decree
function buildQbIxHall(G,o){reseed(33811+(o.v|0));const X=qnIxDims(o,24,18,5.2),W=X.W,D=X.D,P=1.0;
 const red=xC(xPick(XPAL.redwall)),floor=xC(0x7a5a3a),g=xC(xPick(XPAL.gold)),seat=xC(xPick(XPAL.maroon)),white=xC(XPAL.white),tim=xC(xPick(XPAL.dark)),gilt=xC(XPAL.gold[0]);
 vnReg('Council chamber of the Prismarchy (interior)',0,0,Math.hypot(W,D)/2,(X.cut?P:0)+X.H);
 const sd=o.sideDoors?[['s',-W*.225,1.8],['s',W*.225,1.8]]:[];
 const y=qnIxShell(W,D,X.cut,P,X.H,red,xC(0xe8dccc),[['s',0,3.6]].concat(sd),xC(0x5a1c1c));
 const fix=[];
 // the Sultan's seat: a dais at the head, the throne of gilded carved wood with its high back, a white cloth over it (the seat
 // kept empty)
 vB('vStone',0,y,-D/2+2.2,6,.5,3.2,0,xC(xPick(QSTONE)));vB('vWood',0,y+.5,-D/2+1.4,1.6,.55,1.2,0,gilt);vB('vWood',0,y+1.05,-D/2+.9,1.6,1.8,.22,0,gilt);
 kput('vCloth',[0,y+.95,-D/2+1.45],qEuler(-1.2,0,0),[1.7,1.4,1],white);qnWheel(0,y+2.4,-D/2+.8,0,.5,g,QN_GILT_TEX);
 fix.push({kind:'dais',x:0,z:-D/2+2.2,w:6,d:3.2,h:2.8,front:1});
 // the eight Prismarchs' thrones, four a side facing the aisle: timber, a cloth cushion, a hanging of the spoke's colour on the back
 const cols=QSPOKE.map(S=>S.wall),tx=Math.min(W*.22,8),tz0=-D*.2,tdz=Math.min(2.8,(D*.62)/3);   /* each abbot's hanging in his monastery's colour */
 for(let i=0;i<8;i++){const s=i<4?-1:1,k=i%4,x=s*tx,z=tz0+k*tdz,ry=-s*Math.PI/2;
  vB('vStone',x,y,z,1.8,.25,1.8,0,xC(xPick(QSTONE)));const b=loc(x,z,0,-.6,ry);vB('vWood',x,y+.25,z,1.1,.36,1.1,ry,tim);vB('vClothB',x,y+.61,z,1.0,.14,1.0,ry,seat);vB('vWood',b[0],y+.75,b[1],1.1,1.2,.16,ry,tim);const h=loc(x,z,0,-.5,ry);vB('vClothB',h[0],y+.85,h[1],.9,.95,.04,ry,xC(cols[i]));
  fix.push({kind:'throne',x,z,ry,w:1.8,d:1.8,h:2,front:.8});}
 // the long carpet up the aisle to the empty seat, kept clear of furniture from the dais to 4 m short of the door
 vB('qRugB',0,y,0,2.4,.03,D-5,0,xC(XPAL.red));   /* a wool runner, dyed red */fix.push({kind:'aisle',x:0,z:.5,w:2.6,d:D-9,h:.05,front:.4});
 if(!X.cut){for(let i=0;i<8;i++){const u=-W/2+2+i*(W-4)/7;vB('vClothB',u,y+X.H-3.4,-D/2+.1,1.2,2.6,.04,0,xC(cols[i]));}   /* the eight colours hung on the back wall */
  for(const s of[-1,1])qnLampTable(s*(W/2-2),y,-D/2+1,0,2.0);}
 const rd=[[0,D/2,3.6]].concat(sd.map(d=>[d[1],D/2,d[2]]));
 qnRoomRec('Council chamber of the Prismarchy','hall',.9,[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2]],y,X.H,rd,fix);}

// ---------------------------------------------------------------- the pilgrims' hostel dormitory
function buildQbIxHostel(G,o){reseed(33821+(o.v|0));const X=qnIxDims(o,16,10,3.2),W=X.W,D=X.D,P=.7;
 const wash=xC(xPick(XPAL.wash)),floor=xC(0x9a7a58);
 vnReg('Hostel dormitory (interior)',0,0,Math.hypot(W,D)/2,(X.cut?P:0)+X.H);
 const y=qnIxShell(W,D,X.cut,P,X.H,wash,xC(0xf0e8dc),[['s',0,2]],xC(0x8a6a4a));
 // a stove on the back wall (the furnisher keeps off it); the rest the catalog's beds, chests and lamps
 vB('vStone',0,y,-D/2+.6,1.4,1.0,1.0,0,xC(xPick(QSTONE)));vPst('vPostS',0,y+1.0,-D/2+.6,.18,(X.cut?1.6:X.H-.3)-1.0,xC(0x5a5048));
 qnRoomRec('Hostel dormitory','barracks',.35,[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2]],y,X.H,[[0,D/2,2]],[{kind:'stove',x:0,z:-D/2+.6,w:1.4,d:1.0,h:1.2,front:.8}]);}

// ---------------------------------------------------------------- a great monastery's gate hall
// The passage through the gate tower from the street to the court (the owner, 2026-11-16: "fancy interiors to ... monasteries"):
// the four guardian kings of the quarters painted on its side walls, two a side in gilt frames (white and blue on the right,
// red and gold on the left), each a dark figure with a gilt crown on his colour; a rail of hand prayer wheels (the Song drums)
// along each wall under them; butter lamps by the court door; the floor marble, the walls and ceiling in the spoke's colours.
// The passage between the doors is the doors' own clearance (a fixture down it, door to door, cut the room in two).
function buildQbIxGateHall(G,o){reseed(33841+(o.v|0));const X=qnIxDims(o,9,7,4.2),W=X.W,D=X.D,P=.6;
 const SP=QSPOKE[(o.v|0)%8],g=xC(xPick(XPAL.gold)),gl=xC(XPAL.gold[0]),dark=xC(0x2a1e18),tim=xC(xPick(XPAL.dark));
 vnReg('Gate hall (interior)',0,0,Math.hypot(W,D)/2,(X.cut?P:0)+X.H);
 const y=qnIxShell(W,D,X.cut,P,X.H,xC(SP.wall),xC(0xf0e8dc),[['s',0,2.6],['n',0,2.6]],xC(SP.band),'qMarbleB');
 const ph=X.cut?1.2:Math.min(2.5,X.H-1.6),pw=D/2-.6,kings=[0xe8e4dc,0x2a5aa8,0xb02a24,0xd8a830],fix=[];
 for(let i=0;i<4;i++){const s=i<2?1:-1,z=(i%2?-1:1)*D/4,x=s*(W/2-.08);
  vB('qGiltB',x,y+.98,z,.04,ph+.16,pw+.16,0,g);vB('vClothB',x-s*.03,y+1.06,z,.03,ph,pw,0,xC(kings[i]));
  vB('vClothB',x-s*.05,y+1.2,z,.02,ph*.72,pw*.42,0,dark);vBall('qGiltBall',x-s*.07,y+1.2+ph*.72+.08,z,.12,gl);}
 for(const s of[-1,1]){const x=s*(W/2-.4),n=Math.max(3,Math.floor((D-1.4)/.5));vB('vWood',x,y,0,.36,.3,D-1.2,0,tim);
  for(let j=0;j<n;j++)kput('qSongDrum',[x,y+.3,-(D-1.6)/2+j*(D-1.6)/(n-1)],null,[.15,.42,.15],null);
  fix.push({kind:'rail',x,z:0,w:.5,d:D-1.2,h:.8,front:.4});
  if(!X.cut){qnLampTable(s*(W/2-1.5),y,-D/2+.75,0,1.2);fix.push({kind:'lamps',x:s*(W/2-1.5),z:-D/2+.75,w:1.2,d:.6,h:.9,front:.4});}}
 qnRoomRec('Gate hall','antechamber',.6,[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2]],y,X.H,[[0,D/2,2.6],[0,-D/2,2.6]],fix);}
// the depth-only pane in a street doorway (QB_IX_PORTAL, 89q5s): (x, y, z) the sill's middle on the face, ry the face's outward
// yaw, w x h. Drawn at renderOrder -1, after the room (-2) and before the body whose solid face it hides
function qnIxPortal(x,y,z,ry,w,h){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),QB_IX_PORTAL);m.position.set(x,y+h/2,z);m.rotation.y=ry;
 m.renderOrder=-1;m.castShadow=m.receiveShadow=false;m.raycast=()=>{};m.userData.probeSkip=true;m.name='portal';return m;}
QB.def({key:'qb_ix_sanctum',name:'Sanctum of the Rainbow Temple (interior)',family:'Interiors (cut-away)',tags:QTAG('civic',['religious'],{landmark:true,note:'the Station as it was, whole, at the centre; the eight colours round it; cut away'}),w:22,d:22,h:5,nv:1,eyes:[['above',0,13,0,-1,9]],build:buildQbIxSanctum});
QB.def({key:'qb_ix_assembly',name:'Assembly hall (interior)',family:'Interiors (cut-away)',tags:QTAG('civic',['religious'],{note:'a great monastery\'s assembly hall, cut away'}),w:24,d:18,h:5,nv:1,eyes:[['above',0,13,0,-1,9]],build:buildQbIxAssembly});
QB.def({key:'qb_ix_hall',name:'Council chamber of the Prismarchy (interior)',family:'Interiors (cut-away)',tags:QTAG('civic',['civic'],{note:'the Hall of the Decree\'s chamber: the eight abbots and the empty seat, cut away'}),w:26,d:20,h:5,nv:1,eyes:[['above',0,14,0,-1,10]],build:buildQbIxHall});
QB.def({key:'qb_ix_gatehall',name:'Gate hall of a great monastery (interior)',family:'Interiors (cut-away)',tags:QTAG('civic',['religious'],{note:'the passage through the gate tower: the four guardian kings, the prayer wheels, cut away'}),w:10,d:8,h:5,nv:1,eyes:[['above',0,9,0,-1,6]],build:buildQbIxGateHall});
QB.def({key:'qb_ix_hostel',name:'Hostel dormitory (interior)',family:'Interiors (cut-away)',tags:QTAG('civic',['tavern/inn']),w:18,d:12,h:4,nv:1,eyes:[['above',0,10,0,-1,7]],build:buildQbIxHostel});
