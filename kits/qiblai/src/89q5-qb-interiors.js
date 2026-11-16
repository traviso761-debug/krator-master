// ================================================================= QIBLAI — interiors (Q6; PLAN.md section 7)
// Three rooms the plan asks for, drawn as cut-aways on the sheet (walls cut at 1.6 m so the room is seen from above): the
// assembly hall of a great monastery (the dukhang: red columns in a grid, the monks' rows of low seats, the altar wall), the
// council chamber of the Hall of the Decree (the eight abbots' thrones in two rows facing each other, one a spoke each, and
// the Sultan's seat on its dais at the head, kept empty under a white cloth), and the pilgrims' hostel's dormitory. A
// builder draws the shell and the fixed pieces and records the room (QB_ROOMS: world outline, doors, the fixed pieces as
// fixtures the furniture keeps off); the sheet's furnishing pass (targets/kit/90q-qb-furnish.js) furnishes each with the
// catalog's Xanadu pieces through kits/interiors (furnishRoom) after the scene is built. Seeds 33800-33899.
const QB_ROOMS=[];   // [{key, name, kind, culture, wealth, y, h, poly:[[x,z]…], doors:[…], fixtures:[…]}] in world metres
// a room in the running builder's local frame, recorded in world metres (VERN.cur's plot, yaw and scale). A fixture's front
// clearance is at least 0.4 m: kits/interiors' placer fits nothing against a wall when one fixture's is smaller (0.2, 0 or none;
// found 2026-11-11 with a node probe, KNOWN_ISSUES.md)
function qnRoomRec(name,kind,wealth,lpoly,y,h,ldoors,lfix){const c=VERN.cur,s=(c.o.scale==null?1:c.o.scale),W=(lx,lz)=>loc(c.x,c.z,lx*s,lz*s,c.ry);
 QB_ROOMS.push({key:c.D.key,name,kind,culture:'xanadu',wealth,y:((c.o.y==null?0:c.o.y))+y*s,h:h*s,poly:lpoly.map(p=>W(p[0],p[1])),
  doors:ldoors.map(d=>({at:W(d[0],d[1]),w:d[2]*s,to:'street',swing:'none'})),
  fixtures:(lfix||[]).map((f,i)=>{const p=W(f.x,f.z);return{id:c.D.key+'.fix.'+i,kind:f.kind,x:p[0],z:p[1],ry:((f.ry==null?0:f.ry))+c.ry,w:f.w*s,d:f.d*s,h:(f.h==null?1:f.h),clearance:{front:Math.max(.4,f.front==null?.6:f.front)}};})});}
// the cut-away shell: a floor, four walls cut at height ch with door gaps on the front, a plinth; returns the floor top
function qnCutShell(W,D,P,ch,wallC,floorC,gaps){const t=.6;qnPlinth(0,0,W+2*t,D+2*t,P,0);
 vB('vWood',0,P,0,W,.06,D,0,floorC);
 for(const s of[-1,1]){vB('xWashB',s*(W/2+t/2),P,0,t,ch,D+2*t,0,wallC);vB('xWashB',0,P,-(D/2+t/2)*1,W,ch,t,0,wallC);}
 // the front wall with its door gaps
 let u=-W/2;const gs=(gaps||[]).slice().sort((a,b)=>a[0]-b[0]);for(const [g0,g1] of gs){if(g0>u)vB('xWashB',(u+g0)/2,P,D/2+t/2,g0-u,ch,t,0,wallC);u=g1;}
 if(u<W/2)vB('xWashB',(u+W/2)/2,P,D/2+t/2,W/2-u,ch,t,0,wallC);
 for(const s of[-1,1])vB('xBandB',s*(W/2+t/2),P+ch,0,t+.06,.25,D+2*t,0,xC(xPick(XPAL.maroon)));
 return P+.06;}

// ---------------------------------------------------------------- the assembly hall (a great monastery's dukhang)
function buildQbIxAssembly(G,o){reseed(33801+(o.v|0));const W=22,D=16,P=.8,ch=1.6;
 const red=xC(xPick(XPAL.redwall)),floor=xC(0x8a6a48),seat=xC(xPick(XPAL.maroon)),g=xC(xPick(XPAL.gold)),tim=xC(xPick(XPAL.dark));
 vnReg('Assembly hall (interior)',0,0,13,P+4);
 const y=qnCutShell(W,D,P,ch,red,floor,[[-1.6,1.6]]);
 const fix=[];
 // the columns: red, in a 4 x 3 grid, their capitals cut with the walls; the monks' rows between them, facing the aisle
 for(let i=0;i<4;i++)for(let j=0;j<3;j++){const x=-7.5+i*5,z=-4.5+j*4.5;if(Math.abs(x)<3)continue;xnCol(x,y,z,ch+1.4,.22,0,xC(XPAL.red),xC(XPAL.saffron));fix.push({kind:'column',x,z,w:.6,d:.6,h:3,front:.2});}
 for(const s of[-1,1])for(let r=0;r<3;r++){const x=s*(2.6+r*1.5);vB('vWood',x,y,1,.9,.24,D-7,0,tim);vB('vClothB',x,y+.24,1,.8,.12,D-7.2,0,seat);fix.push({kind:'bench',x,z:1,w:.9,d:D-7,h:.4,front:.4});}
 // the back wall is the altar's (the catalog's Xanadu altar, placed by the shrine programme); the gilt image over it on the
 // wall, and the abbot's throne by the side wall in the back corner bay, facing the rows (timber, a cloth cushion and back)
 vB('xGoldB',0,y+.3,-D/2+.08,2.4,1.25,.12,0,g);   /* under the cut (ch): the cut-away shows no wall above it */
 const tz=-D/2+1.4,tx=W/2-1.4;vB('vWood',tx,y,tz,1.2,.6,1.2,0,tim);vB('vClothB',tx,y+.6,tz,1.1,.16,1.1,0,seat);vB('vWood',tx+.52,y+.6,tz,.16,1.1,1.2,0,tim);vB('vClothB',tx+.42,y+.8,tz,.04,.8,.9,0,xC(XPAL.saffron));
 fix.push({kind:'throne',x:tx,z:tz,ry:-Math.PI/2,w:1.6,d:1.6,h:1.6,front:.8});
 qnRoomRec('Assembly hall','shrine',.7,[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2]],y,4.4,[[0,D/2,3]],fix);}

// ---------------------------------------------------------------- the council chamber of the Hall of the Decree
function buildQbIxHall(G,o){reseed(33811+(o.v|0));const W=24,D=18,P=1.0,ch=1.6;
 const red=xC(xPick(XPAL.redwall)),floor=xC(0x7a5a3a),g=xC(xPick(XPAL.gold)),seat=xC(xPick(XPAL.maroon)),white=xC(XPAL.white),tim=xC(xPick(XPAL.dark)),gilt=xC(XPAL.gold[0]);
 vnReg('Council chamber of the Prismarchy (interior)',0,0,14,P+4);
 const y=qnCutShell(W,D,P,ch,red,floor,[[-1.8,1.8]]);
 const fix=[];
 // the Sultan's seat: a dais at the head, the throne of gilded carved wood with its high back, a white cloth over it (the seat\n // kept empty)
 vB('vStone',0,y,-D/2+2.2,6,.5,3.2,0,xC(xPick(QSTONE)));vB('vWood',0,y+.5,-D/2+1.4,1.6,.55,1.2,0,gilt);vB('vWood',0,y+1.05,-D/2+.9,1.6,1.8,.22,0,gilt);
 kput('vCloth',[0,y+.95,-D/2+1.45],qEuler(-1.2,0,0),[1.7,1.4,1],white);qnWheel(0,y+2.4,-D/2+.8,0,.5,g);
 fix.push({kind:'dais',x:0,z:-D/2+2.2,w:6,d:3.2,h:2.8,front:1});
 // the eight Prismarchs' thrones, four a side facing the aisle: timber, a cloth cushion, a hanging of the spoke's colour on the back
 const cols=QSPOKE.map(S=>S.wall);   /* each abbot's hanging in his monastery's colour */
 for(let i=0;i<8;i++){const s=i<4?-1:1,k=i%4,x=s*5.2,z=-3.6+k*2.8,ry=-s*Math.PI/2;
  vB('vStone',x,y,z,1.8,.25,1.8,0,xC(xPick(QSTONE)));const b=loc(x,z,0,-.6,ry);vB('vWood',x,y+.25,z,1.1,.36,1.1,ry,tim);vB('vClothB',x,y+.61,z,1.0,.14,1.0,ry,seat);vB('vWood',b[0],y+.75,b[1],1.1,1.2,.16,ry,tim);const h=loc(x,z,0,-.5,ry);vB('vClothB',h[0],y+.85,h[1],.9,.95,.04,ry,xC(cols[i]));
  fix.push({kind:'throne',x,z,ry,w:1.8,d:1.8,h:2,front:.8});}
 // the long carpet up the aisle to the empty seat
 // the aisle is kept clear of furniture from the dais to 4 m short of the door (a walker gets round it from the door)
 vB('vClothB',0,y,0,2.4,.03,D-5,0,xC(XPAL.red));fix.push({kind:'aisle',x:0,z:.5,w:2.6,d:9,h:.05,front:0});
 qnRoomRec('Council chamber of the Prismarchy','hall',.9,[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2]],y,5.2,[[0,D/2,3.6]],fix);}

// ---------------------------------------------------------------- the pilgrims' hostel dormitory
function buildQbIxHostel(G,o){reseed(33821+(o.v|0));const W=16,D=10,P=.7,ch=1.6;
 const wash=xC(xPick(XPAL.wash)),floor=xC(0x9a7a58);
 vnReg('Hostel dormitory (interior)',0,0,9.5,P+3.4);
 const y=qnCutShell(W,D,P,ch,wash,floor,[[-1,1]]);
 // a stove on the back wall (the furnisher keeps off it); the rest the catalog's beds, chests and lamps
 vB('vStone',0,y,-D/2+.6,1.4,1.0,1.0,0,xC(xPick(QSTONE)));vPst('vPostS',0,y+1.0,-D/2+.6,.18,ch+1.2,xC(0x5a5048));
 qnRoomRec('Hostel dormitory','barracks',.35,[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2]],y,3.2,[[0,D/2,2]],[{kind:'stove',x:0,z:-D/2+.6,w:1.4,d:1.0,h:1.2,front:.8}]);}

QB.def({key:'qb_ix_assembly',name:'Assembly hall (interior)',family:'Interiors (cut-away)',tags:QTAG('civic',['religious'],{note:'a great monastery\'s assembly hall, cut away'}),w:24,d:18,h:5,nv:1,eyes:[['above',0,13,0,-1,9]],build:buildQbIxAssembly});
QB.def({key:'qb_ix_hall',name:'Council chamber of the Prismarchy (interior)',family:'Interiors (cut-away)',tags:QTAG('civic',['civic'],{note:'the Hall of the Decree\'s chamber: the eight abbots and the empty seat, cut away'}),w:26,d:20,h:5,nv:1,eyes:[['above',0,14,0,-1,10]],build:buildQbIxHall});
QB.def({key:'qb_ix_hostel',name:'Hostel dormitory (interior)',family:'Interiors (cut-away)',tags:QTAG('civic',['tavern/inn']),w:18,d:12,h:4,nv:1,eyes:[['above',0,10,0,-1,7]],build:buildQbIxHostel});
