// ================================================================= HIGHLANDS / REPUBLICAN — the guilds
// The Iron Republic's guildhalls, each after its trade: the Mercenary Guild's fortified hall of company banners,
// the Alchemists' laboratory and their bermed magazines of high explosive, the Farmers' hall and grain store, the
// Smiths' heavy stone hall of forges, the Mechanics' clockwork hall with its gears and orrery tower. Civic and
// electric; guild totems at the gates; the kit's helpers from 72/73 and the R-B helpers from 76-rep-civic.js.
// Seeds 21000–21199.

// ---------------------------------------------------------------- Mercenary Guild
// A fortified guildhall: rubble ground storey with slits, a tarred-log hall above hung with the companies'
// banners, corner turrets under tents, a walled forecourt entered between two winged crest totems under a
// flared gate roof on dougong, and a sanded sparring yard with pells and racks.
function buildHlRepGuildMerc(G,o){reseed(21001+(o.v|0));const HX=-4,HZ=-3,W=18,D=11,H1=4.4,H2=4.2;
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),tar=hC(vPick(HPAL.tar)).multiplyScalar(1.15),slate=hC(vPick(HPAL.slate)),red=hC(HPAL.red),gold=hC(HPAL.gold[0]),lit=vLit()?'lit':'glass';
 vnReg("Mercenary Guild",HX,HZ,11,16);
 vB('hRubB',HX,0,HZ,W,H1,D,0,rub);hnRBQuoins(HX,0,HZ,W,H1,D,0,ash);vB('vStone',HX,H1-.2,HZ,W+.3,.25,D+.3,0,ash);
 const FZ=HZ+D/2;for(const u of[-6,-3.4,3.4,6])vnWin(HX+u,1.4,FZ,0,.32,1.4,'open','vStone',ash);
 for(const s of[-1,1])hnRBWins(HX+s*W/2,1.4,HZ,s*Math.PI/2,D-3,3,.32,1.4,'open','vStone',ash);hnRBWins(HX,1.4,HZ-D/2,Math.PI,W-4,5,.32,1.4,'open','vStone',ash);
 hnRBIronDoor(HX,.3,FZ,0,2,3,'vStone',ash);vB('vStone',HX,0,FZ+.6,3.4,.3,1.2,0,ash);hnForm('hFormA',HX,3.55,FZ,0,2.4,.75);
 hnLogBox(HX,H1,HZ,W,H2,D,0,tar);const y3=H1+H2;
 const bays=[-6.4,-3.2,0,3.2,6.4];bays.forEach((u,i)=>{if(i%2===0)hnNal(HX+u,H1+1.1,FZ,0,1,1.8,lit,red,{keel:true});
  else{const p=loc(HX+u,FZ,0,.12,0);vB('vIron',p[0],y3-.55,p[1],1.5,.06,.06,0,hC(hRBIRON));vB('hPaint',p[0],H1+.35,p[1],1.2,3.2,.05,0,hC(vPick([HPAL.red,HPAL.teal,HPAL.ochre,HPAL.black])));
   hnForm('hFormV',HX+u,H1+.65,FZ+.12,0,.95,2.6);}});
 for(const s of[-1,1])hnRBNals(HX+s*W/2,H1+1.1,HZ,s*Math.PI/2,D-3,2,.9,1.6,lit,red,{});hnRBNals(HX,H1+1.1,HZ-D/2,Math.PI,W-3,4,.9,1.6,lit,red,{});
 hnGable(HX,y3,HZ,W,D,1.3,0,'hGableSc',slate,.7,'hGableLog',tar);hnBarge(HX,y3,HZ,W,D,1.3*D/2,0,.7,red,'lace');
 for(const s of[-1,1])hnForm('hFormT',HX+s*(W/2+.02),y3+.9,HZ,s*Math.PI/2,3,1.4);
 hnStoneChimney(HX+4,y3+2.5,HZ-2,4.6,.8);
 // corner turrets at the front
 for(const s of[-1,1]){const x=HX+s*(W/2+.3),z=FZ+.3;kput('hOctS',[x,0,z],null,[1.7,10.6,1.7],rub);for(const y of[4.2,8.6])kput('hOctS',[x,y,z],null,[1.82,.25,1.82],ash);
  for(const y of[2,6.2]){const p=loc(x,z,0,1.58,0);vnWin(p[0],y,p[1],0,.28,1.1,'open','vStone',ash);}
  const t=hnTent(x,10.6,z,2.1,4.6,'hTentSc',slate);vPst('vIron',x,t-.3,z,.04,1.2,hC(hRBIRON));vBall('hGold',x,t+.3,z,.14,gold);}
 // the forecourt: walls with merlons, the totem gate, flags of the companies
 const wall=(a,b)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=Math.atan2(b[0]-a[0],b[1]-a[1])-Math.PI/2,m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  vB('hRubB',m[0],0,m[1],L,2.4,.7,ry,rub);vB('vStone',m[0],2.4,m[1],L+.1,.16,.85,ry,ash);const n=Math.floor(L/1.4);for(let i=0;i<n;i++){const p=loc(m[0],m[1],-L/2+.7+i*L/n,0,ry);vB('hRubB',p[0],2.56,p[1],.6,.55,.7,ry,rub);}};
 wall([-14.5,11],[-2.6,11]);wall([2.6,11],[14.5,11]);wall([-14.5,FZ-1],[-14.5,11]);wall([14.5,-9],[14.5,11]);wall([5.5,-9],[14.5,-9]);wall([5.6,FZ],[14.2,FZ]);
 for(const s of[-1,1]){vB('vStone',s*2.6,0,11,1.4,.4,1.4,0,ash);hnTotem(s*2.6,.4,11,.5,8.4,0,{wings:1.8,wingAt:.84,painted:s>0});vPst('vPost',s*1.9,0,11,.16,4.5,tar);}
 vB('vWood',0,4.4,11,4.6,.3,.4,0,tar);hnBracketRow(0,4.95,11,0,3.8,2,.5);hnTier(0,5.5,11,3.8,1,1,0,'hHipSc',slate,.55,red);
 for(const s of[-1,1])kput('vWood',[s*1.2,1.9,9.9],qEuler(0,s*1.3,0),[1.9,3.8,.14],tar);
 vnPaving(HX,0,6.5,3,7,0,ash,6);[-12,-8,4,8].forEach((x,i)=>hnRBFlag(x,0,7.2,0,7,hC([HPAL.red,HPAL.teal,HPAL.black,HPAL.ochre][i])));
 // the sparring yard
 vB('hRBDirt',10,0,-.7,8,.05,11.5,0,hC(0xe0c8a0));for(const z of[-6,-3,0])FURNISH('hl_rep_training_butt',12.6,0,z,0,{v:1});   // the pells
 hnRBRack(7,-4,Math.PI/2,3);FURNISH('hl_rep_door_bench',7.2,0,2.6,Math.PI/2,{v:2});
 for(const [x,z,r] of[[9.4,-1.4,.9],[10.6,-.6,-2.2]]){kput('figB',[x,0,z],qEuler(0,r,0),1,hC(0x7a2a22));kput('figH',[x,0,z],null,1,hC(0xc9a17e));
  const p=[x+Math.sin(r)*.5,1.2,z+Math.cos(r)*.5];kput('vWood',p,qEuler(Math.PI/2.4,r,0),[.05,1.2,.05],hC(0x9a9a9a));}
 hnRBLamps([[-4.2,12.2],[4.2,12.2],[HX-2.4,FZ+1.6],[HX+2.4,FZ+1.6]],3.2);vnFolk(HX,7,3,3);}

// ---------------------------------------------------------------- Alchemists' Guild (high explosives)
// The laboratory: a long stucco hall with a louvred ridge vent, stone fume stacks and iron flues, lightning rods
// on every stack, and a corrugated acid shed (the Iziz note). Well away from it, behind a fence hung with hazard
// pennants, three earth-bermed magazines with stone portals and iron doors between blast walls, each with its
// lightning mast; and a test range — a scorched strip, charred boards against an earth butt, craters and an
// observation bunker.
function buildHlRepGuildAlch(G,o){reseed(21011+(o.v|0));const LX=-12,LZ=3,W=20,D=10,S=.6,H=5;
 const cream=hC(vPick(HPAL.stucco)),ash=hC(vPick(HPAL.ashlar)),rub=hC(vPick(HPAL.rubble)),slate=hC(vPick(HPAL.slate)),tar=hC(vPick(HPAL.tar)).multiplyScalar(1.2),
  red=hC(HPAL.red),yel=hC(0xe0b030),turf=hC(vPick(HPAL.turf)),cu=hC(0x5aa08a),lit=vLit()?'lit':'glass';
 vnReg("Alchemists' Guild laboratory",LX,LZ,11,15);vnReg("Alchemists' magazines",13,-13,12,4);vnReg("Alchemists' test range",14,7,10,3);
 const rod=(x,y,z,h)=>{vPst('vPipeC',x,y,z,.035,h,cu);vBall('hGold',x,y+h,z,.07,hC(HPAL.gold[0]));};
 hnSocle(LX,0,LZ,W,S,D);hnStucco(LX,S,LZ,W,H,D,0,cream,ash);const y3=S+H,FZ=LZ+D/2;
 hnRBWins(LX,S+1,FZ,0,W-2,6,1.1,2.6,lit,'vStone',ash,i=>i===2||i===3);hnRBWins(LX,S+1,LZ-D/2,Math.PI,W-2,6,1.1,2.6,lit,'vStone',ash);
 hnRBWins(LX+W/2,S+1,LZ,Math.PI/2,D-3,2,1.1,2.6,lit,'vStone',ash);
 hnRBIronDoor(LX,S,FZ,0,2,3,'vStone',ash);vB('vStone',LX,0,FZ+.7,3.6,S,1.4,0,ash);vnStairs(LX,0,FZ+1.4+.32,0,2.6,S,2,'vStone',ash);
 for(const s of[-1,1]){hnTotemPost(LX+s*1.45,S,FZ+1.15,.17,3,0,true);hnRBPennant(LX+s*3.3,0,FZ+1.3,s*Math.PI/2,4.6,s<0?red:yel);}
 hnBracketRow(LX,S+3.1,FZ+1.15,0,3.2,2,.5);hnBochka(LX,S+3.65,FZ+.55,2.6,4,1.9,Math.PI/2,'hKeelSc',hC(vPick(HPAL.roofGreen)));hnForm('hFormT',LX,S+3.8,FZ+1.87,0,2.2,1);
 hnFrieze(LX,y3-.55,FZ+.02,0,W,.5);
 const top=hnGable(LX,y3,LZ,W,D,.95,0,'hGableSc',slate,.6,'vGablePl',cream);hnBarge(LX,y3,LZ,W,D,.95*D/2,0,.6,hC(HPAL.white),'lace');
 // ridge vent: a louvred monitor under its own little gable
 vB('vDarkB',LX,top-.3,LZ,12,1.2,1.4,0);for(const s of[-1,1])for(let k=0;k<3;k++)vB('vWood',LX,top-.1+k*.3,LZ+s*.72,12,.08,.14,0,tar);
 for(const s of[-1,1])vB('vWood',LX+s*6,top-.3,LZ,.2,1.2,1.5,0,tar);
 hnGable(LX,top+.9,LZ,12.2,1.8,.7,0,'hGableSc',slate,.3);
 // fume stacks and flues, lightning rods
 for(const x of[LX-6,LX,LX+6]){hnStoneChimney(x,y3+.5,LZ-2.4,8.6,1);vB('vIron',x,y3+9.3,LZ-2.4,1.3,.08,1.3,0,hC(hRBIRON));for(const sx of[-1,1])vB('vIron',x+sx*.55,y3+9.1,LZ-2.4,.06,.25,.06,0,hC(hRBIRON));rod(x,y3+9.4,LZ-2.4,2.6);}
 for(const x of[LX-3,LX+3]){vnChimney(x,y3+1,LZ+2.6,6.4,.24,true);kput('vConeI',[x,y3+7.5,LZ+2.6],null,[.5,.5,.5]);}
 rod(LX-W/2-.4,top-.6,LZ,3);rod(LX+W/2+.4,top-.6,LZ,3);
 // acid shed on the west end: salvage roof, carboys and barrels
 vnFrame(LX-W/2-2,0,LZ,3.6,2.8,D-1,0,tar,.12);vnShedRoof(LX-W/2-2,2.8,LZ,4,D,.8,-Math.PI/2,'vCorr',null,.3,.1);
 for(let i=0;i<5;i++){hnBarrel(LX-W/2-1.2-rr(0,1.6),0,LZ-3+i*1.3,.32,.85,hC(vPick([0x6a5a48,0x8a3a2a,0x3a5a4a])));}
 hlRngSkip(6);FURNISH('hl_rep_carboys',LX-W/2-2.85,0,LZ-1.1,0,{v:0});   // six carboys in their crates (6 colours)
 // the magazines: bermed cells, stone portals, iron doors, blast walls, lightning masts, a fence with pennants
 const MZ=-14;for(const x of[4,13,22]){kput('hRBBerm',[x,0,MZ],null,[7.6,3.3,7],turf);vB('vStone',x,0,MZ+3.1,3.8,2.9,1.3,0,ash);vB('vStone',x,2.9,MZ+3.1,4.2,.3,1.5,0,ash);
  vB('vIron',x,0,MZ+3.78,1.5,2.2,.08,0,hC(0x4a4640));for(const y of[.5,1.7])vB('vIron',x,y,MZ+3.84,1.5,.1,.04,0,hC(hRBIRON));
  vB('hPaint',x,2.35,MZ+3.8,1.6,.4,.04,0,yel);for(let k=0;k<4;k++)kput('hPaint',[x-.6+k*.4,2.55,MZ+3.83],qEuler(0,0,.6),[.1,.44,.02],hC(HPAL.black));
  vPst('vPipe',x+2.8,0,MZ+2.4,.08,9.5,hC(hRBIRON));rod(x+2.8,9.5,MZ+2.4,1.4);}
 for(const x of[8.5,17.5]){vB('hRubB',x,0,MZ+.5,1,3.4,8,0,rub);vB('vStone',x,3.4,MZ+.5,1.2,.18,8.2,0,ash);}
 vnFence(13,0,MZ+1,27,11,0,hC(0x6a5a48),3,1.4);
 [[-.5,-19.5],[26.5,-19.5],[-.5,-3.5],[26.5,-3.5],[11.5,-3.4],[14.5,-3.4]].forEach(([x,z],i)=>hnRBPennant(x,0,z,Math.PI/2,5,i%2?yel:red));
 // the test range
 vB('hRBDirt',15,0,7,20,.05,6,0,hC(0x5a4a3e));for(let i=0;i<7;i++)kput('vDarkB',[rr(8,24),.06,rr(4.8,9.2)],qEuler(0,rng()*3,0),[rr(.8,1.8),.02,rr(.8,1.6)]);
 kput('hRBBerm',[25.8,0,7],qEuler(0,Math.PI/2,0),[8,3,3],turf);
 for(const z of[5,7,9]){kput('vWood',[24.2,1,z],qEuler(0,0,rr(-.15,.15)),[.2,2,1.4],hC(0x2a2420));kput('vWood',[23.6,.15,z+rr(-.4,.4)],qEuler(0,rng()*3,Math.PI/2),[.12,1,.3],hC(0x2a2420));}
 vB('hRubB',7,0,7,3.4,2.2,3.2,0,rub);vB('hTurfB',7,2.2,7,3.8,.5,3.6,0,turf);vB('vDarkB',8.72,1.3,7,.1,.35,2,0);vPst('vPipe',7.6,2.7,6.2,.06,1.2,hC(hRBIRON));
 for(const s of[-1,1])hnRBPennant(15+s*9,0,10.6,Math.PI/2,5.5,red);hnRBFlag(4,0,11.5,0,6,red,false);
 hnTotem(LX+4.5,0,FZ+2.4,.36,6.5,0,{hat:true,painted:true});
 hnRBLamps([[LX-3,FZ+3],[LX+3,FZ+3],[13,-3.6]],3.4);vnFolk(LX,FZ+4,3,2.5);kput('figB',[7.8,0,9.3],null,1,hC(0x3a4a3a));kput('figH',[7.8,0,9.3],null,1,hC(0xc9a17e));}

// ---------------------------------------------------------------- Farmers' Guild
// A guildhall gable-end to the market: ochre render below, pine logs above, a red scale roof with a gilded sheaf
// in the gable over the plough-and-sheaf crest; a market porch on carved posts with dougong and stalls of
// produce; beside it a tall log grain store on staddle stones under a shingle tent, and a loaded cart.
function buildHlRepGuildFarm(G,o){reseed(21021+(o.v|0));const HX=-6,HZ=-2,W=11,D=16,S=.5,H1=3.4,H2=3;
 const wall=hC(vPick(HPAL.saxon)),log=hC(vPick(HPAL.pine)),roof=hC(vPick(HPAL.roofRed)),ash=hC(vPick(HPAL.ashlar)),sh=hC(vPick(HPAL.shingle)),tar=hC(vPick(HPAL.tar)).multiplyScalar(1.3),
  gold=hC(HPAL.gold[0]),white=hC(HPAL.white),trim=hC(vPick([HPAL.teal,HPAL.red])),lit=vLit()?'lit':'glass';
 vnReg("Farmers' Guild",HX,HZ,9,15);vnReg("Farmers' grain store",8,-3,4.5,13);
 hnSocle(HX,0,HZ,W,S,D);hnStucco(HX,S,HZ,W,H1,D,0,wall,ash);const FZ=HZ+D/2,y2=S+H1,y3=y2+H2;
 vnDoor(HX,S,FZ,0,1.8,2.6,'vStone',ash,tar,false);for(const u of[-3.4,3.4])vnWin(HX+u,S+.9,FZ,0,1,1.6,lit,'vStone',ash);
 for(const s of[-1,1])hnRBWins(HX+s*W/2,S+.9,HZ,s*Math.PI/2,D-3,4,1,1.6,lit,'vStone',ash);
 hnLogBox(HX,y2,HZ,W,H2,D,0,log);hnRBNals(HX,y2+.8,FZ,0,W-1,3,.85,1.3,lit,white,{accent:trim,shutters:true});
 for(const s of[-1,1])hnRBNals(HX+s*W/2,y2+.8,HZ,s*Math.PI/2,D-2,4,.85,1.3,lit,white,{});
 hnGable(HX,y3,HZ,D,W,1.3,Math.PI/2,'hGableSc',roof,.7,'hGableLog',log);hnBarge(HX,y3,HZ,D,W,1.3*W/2,Math.PI/2,.7,white,'lace');
 // the gable: loft door and hoist, the crest, the gilded sheaf
 vnWin(HX,y3+.3,FZ+.02,0,1.2,1.5,'shut','vWood',tar);vB('vWood',HX,y3+1.98,FZ+.6,.2,.2,1.4,0,tar);vPst('vRope',HX,y3+.8,FZ+1.2,.02,1.2,hC(0xb8a888));
 hnForm('hFormA',HX,y3+2.3,FZ,0,2.4,1);
 const sy=y3+4.1,sz=FZ+.18;kput('hRBDisc',[HX,sy+.55,sz-.05],null,[.95,.95,.06],hC(HPAL.teal));
 for(let i=0;i<13;i++){const t=(i/12-.5)*.75;kput('hGoldB',[HX+Math.sin(t)*.55,sy+.6,sz],qEuler(0,0,-t),[.07,1.5,.07],gold);vBall('hGold',HX+Math.sin(t)*1.28,sy+.6+Math.cos(t)*.75,sz,.09,gold,.18);}
 vB('hGoldB',HX,sy+.3,sz+.04,.5,.18,.12,0,gold);
 // market porch
 vB('vStone',HX,0,FZ+2.1,W+.4,.25,4.2,0,ash);const posts=[-5,-1.7,1.7,5];for(const u of posts)hnTotemPost(HX+u,.25,FZ+3.8,.18,2.65,0,Math.abs(u)<3);
 hnBracketRow(HX,2.9,FZ+3.8,0,W,4,.5);vnShedRoof(HX,3.35,FZ+2.1,W+.2,4.2,1.1,0,'hGableSc',roof,.4);
 for(const u of[-3.4,0,3.4]){hlRngSkip(36);FURNISH('hl_rep_produce_counter',HX+u,.25,FZ+2.4,0);}   // its produce drew 36 numbers
 hnSacks(HX-4.6,.25,FZ+1.1,4);hnCrate(HX+4.6,.25,FZ+1.2,.8,.2);
 hnTotem(HX+W/2+1.2,0,FZ+3.9,.34,6,0,{hat:true});
 // the grain store on staddle stones
 const GX=8,GZ=-3,GF=.9;for(const u of[-2.4,0,2.4])for(const v of[-2.4,0,2.4]){vPst('vPostS',GX+u,0,GZ+v,.18,GF-.12,ash);vB('vStone',GX+u,GF-.14,GZ+v,.62,.14,.62,0,ash);}
 vB('vWood',GX,GF,GZ,6.3,.25,6.3,0,tar);hnLogBox(GX,GF+.25,GZ,6,6.6,6,0,log);const gt=GF+6.85;
 vnDoor(GX,GF+.25,GZ+3,0,1.2,2,'vWood',tar,tar,false);vnStairs(GX,0,GZ+3.4+.48,0,1.3,GF+.25,3,'vWood',tar);
 vnWin(GX,GF+4.2,GZ+3.02,0,1,1.3,'shut','vWood',tar);vB('vWood',GX,gt-.4,GZ+3.6,.2,.2,1.6,0,tar);vPst('vRope',GX,GF+3.8,GZ+4.3,.02,gt-GF-4.2,hC(0xb8a888));
 hnFrieze(GX,gt-.55,GZ+3.02,0,6,.5);
 const tp=hnTent(GX,gt,GZ,4.7,5.4,'hTentSh',sh);vPst('vIron',GX,tp-.3,GZ,.04,.9,hC(hRBIRON));vBall('hGold',GX,tp+.35,GZ,.2,gold);
 // cart, hay rick
 const CX=8,CZ=4.6;hlRngSkip(20);hnFurn('hl_rep_farm_cart',CX,0,CZ,0,{v:0},0,1.025);   // the loaded cart (its sacks drew 20 numbers)
 rng();FURNISH('hl_rep_haystack',14,0,-6,0,{v:1});   // the hay rick
 hnRBLamps([[HX-3,FZ+5.5],[HX+3,FZ+5.5]],3.2);vnFolk(HX,FZ+4.6,4,3.5);vnFolk(CX,CZ+1,1,1);}

// ---------------------------------------------------------------- Guild of Smiths
// A heavy stone hall of rubble and ashlar with buttresses and a steep slate roof pierced by three great forge
// stacks, glowing; iron-bound double doors under the guild crest and a row of dougong; a giant anvil and hammer
// on a plinth before it, gilt on the face; an open forge shed on the east side.
function buildHlRepGuildSmith(G,o){reseed(21031+(o.v|0));const HZ=-3,W=18,D=11,H=6;
 const rub=hC(vPick(HPAL.rubble)).multiplyScalar(.9),ash=hC(vPick(HPAL.ashlar)),slate=hC(vPick(HPAL.slate)),tar=hC(vPick(HPAL.tar)).multiplyScalar(1.2),
  iron=hC(0x5a5c62),gold=hC(HPAL.gold[0]),red=hC(HPAL.red),lit=vLit()?'lit':'glass';
 vnReg("Guild of Smiths",0,HZ,11,17);vnReg("Smiths' forge shed",12.2,HZ,3,5);
 vB('hRubB',0,0,HZ,W,H,D,0,rub);hnRBQuoins(0,0,HZ,W,H,D,0,ash);vB('vStone',0,0,HZ,W+.3,.6,D+.3,0,ash);vB('vStone',0,H-.35,HZ,W+.3,.35,D+.3,0,ash);
 const FZ=HZ+D/2;
 for(const s of[-1,1])for(const z of[HZ-3.5,HZ,HZ+3.5]){vB('hRubB',s*(W/2+.45),0,z,.9,4.2,1.3,0,rub);kput('hGableRub',[s*(W/2+.45),4.2,z],qEuler(0,Math.PI/2,0),[1.3,.8,.9],rub);}
 for(const s of[-1,1]){vB('hRubB',s*(W/2-.6),0,FZ+.45,1.3,4.2,.9,0,rub);kput('hGableRub',[s*(W/2-.6),4.2,FZ+.45],null,[1.3,.8,.9],rub);}
 hnRBIronDoor(0,.6,FZ,0,3.2,3.6,'vStone',ash,tar);vnStairs(0,0,FZ+2.4+.48,0,4,.6,3,'vStone',ash);hnForm('hFormA',0,4.35,FZ,0,2.6,.8);hnFrieze(0,H-.9,FZ+.02,0,W-3.4,.45);
 for(const u of[-5.5,-3,3,5.5]){vnWin(u,2,FZ,0,1,2.4,lit,'vStone',ash);hnRBBars(u,2,FZ,0,1,2.4);}
 for(const s of[-1,1])for(const z of[HZ-1.75,HZ+1.75])vnWin(s*W/2,2.4,z,s*Math.PI/2,.9,2,lit,'vStone',ash);
 for(const s of[-1,1]){vB('vStone',s*2.5,.6,FZ+1.9,.6,3.7,.6,0,ash);vB('vStone',s*2.5,0,FZ+1.9,.8,.6,.8,0,ash);}vB('vStone',0,0,FZ+1.2,6,.6,2.4,0,ash);
 hnBracketRow(0,4.5,FZ+1.9,0,5.6,3,.55);hnTier(0,5.2,FZ+1.1,5.4,1.8,1.2,0,'hHipSc',slate,.6,red);
 const top=hnGable(0,H,HZ,W,D,1.2,0,'hGableSc',slate,.7,'vGableSt',ash);hnBarge(0,H,HZ,W,D,1.2*D/2,0,.7,tar,'lace');
 for(const x of[-5.5,0,5.5]){hnStoneChimney(x,top-2.4,HZ-.6,6.4,1.4);vBall('vEmber',x,top+4.05,HZ-.6,.36,null,.06);vB('vIron',x,top+4.6,HZ-.6,1.1,.08,1.1,0,hC(hRBIRON));for(const sx of[-1,1])vB('vIron',x+sx*.5,top+4.1,HZ-.6,.06,.5,.06,0,hC(hRBIRON));}
 // the giant anvil and hammer
 const AX=-6.2,AZ=FZ+5.2;FURNISH('hl_rep_giant_anvil',AX-.3,0,AZ,0);   // the giant anvil and hammer on their plinth
 // the forge shed
 const SX=12.2;for(const z of[HZ-4,HZ,HZ+4])vPst('vPost',SX+1.6,0,z,.14,2.9,tar);vnShedRoof(SX,2.9,HZ,9,3.6,1,-Math.PI/2,'vShingleB',hC(vPick(HPAL.shingle)),.3);
 FURNISH('hl_rep_hooded_forge',SX,0,HZ-1.6,0,{v:0});   // the hooded forge, its stack through the shed roof
 FURNISH('hl_rep_anvil',SX,0,HZ+1,0,{v:1});hnBarrel(SX+.6,0,HZ+2.4,.35,.8);vB('vWood',SX-.2,.5,HZ-3.2,.8,.3,1.2,0,hC(0x6a4a30));
 kput('figB',[SX+.8,0,HZ-.2],qEuler(0,-1.2,0),1,hC(0x4a3a30));kput('figH',[SX+.8,0,HZ-.2],null,1,hC(0xc9a17e));
 vnPaving(0,0,FZ+2.4,6,3,0,ash,5);hnRBLamps([[-3.4,FZ+4.2],[3.4,FZ+4.2]],3.4);vnFolk(2.5,AZ+2.5,3,2.5);}

// ---------------------------------------------------------------- Mechanics' Guild (clockwork)
// A hall of glazed workshop bays below and half-timber above, its front gable and upper storey hung with great
// exposed gear wheels in brass and iron; a sawtooth-roofed glazed workshop on the west; and the octagonal clock
// and orrery tower — clock faces, an open belvedere in which the planets turn on brass rings about a gilt sun,
// a green helm dome and a gear on the finial.
function buildHlRepGuildMech(G,o){reseed(21041+(o.v|0));const HX=-1,HZ=-2,W=18,D=10,S=.6,H1=4.4,H2=3.4,TX=13.6,TZ=-1.4;
 const cream=hC(vPick(HPAL.stucco)),beamC=hC(vPick(HPAL.redwood)),slate=hC(vPick(HPAL.slate)),ash=hC(vPick(HPAL.ashlar)),grn=hC(vPick(HPAL.roofGreen)),
  tar=hC(vPick(HPAL.tar)).multiplyScalar(1.3),gold=hC(HPAL.gold[0]),iron=hC(hRBIRON),lit=vLit()?'lit':'glass';
 vnReg("Mechanics' Guild",HX,HZ,10,15);vnReg("Mechanics' clock tower",TX,TZ,4.6,30);
 hnSocle(HX,0,HZ,W,S,D);hnStucco(HX,S,HZ,W,H1,D,0,cream,ash);const FZ=HZ+D/2,y2=S+H1,y3=y2+H2;
 for(const u of[-7,-3.6,3.6,7]){vnWin(HX+u,S+.5,FZ,0,2.4,3,lit,'vIron',iron);for(const d of[-.4,.4]){const p=loc(HX+u,FZ,d,.1,0);vB('vIron',p[0],S+.5,p[1],.05,3,.1,0,iron);}}
 vnDoor(HX,S,FZ,0,1.8,3.2,'vStone',ash,tar,false);vB('vStone',HX,0,FZ+.6,3,S,1.2,0,ash);hnForm('hFormA',HX,S+3.45,FZ,0,2.6,.85);
 hnRBWins(HX,S+.8,HZ-D/2,Math.PI,W-2,5,1.6,2.4,lit,'vIron',iron);hnRBWins(HX+W/2,S+.8,HZ,Math.PI/2,D-3,2,1.6,2.4,lit,'vIron',iron);
 hnFachBox(HX,y2,HZ,W,H2,D,0,cream,beamC,lit);
 hnGable(HX,y3,HZ,W,D,1.2,0,'hGableSc',slate,.6,'vGablePl',cream);hnBarge(HX,y3,HZ,W,D,6,0,.6,beamC,'lace');
 hnGable(HX,y3,FZ-2,4,7,1.2,Math.PI/2,'hGableSc',slate,.5,'vGablePl',cream);hnBarge(HX,y3,FZ-2,4,7,4.2,Math.PI/2,.5,beamC,'lace');
 // the gears: a train across the upper storey and one in the gable
 const GZ=FZ+.28;hnRBGear(HX,y2+1.7,GZ,0,1.55,.24,false,.1);hnRBGear(HX+2.35,y2+1.1,GZ+.06,0,.95,.2,true,.3);hnRBGear(HX-2.2,y2+2.2,GZ+.06,0,.8,.2,true,.6);
 hnRBGear(HX+3.3,y2+2.45,GZ,0,.55,.18,false,.2);hnRBGear(HX,y3+1.4,FZ+.12,0,1.05,.2,false,.4);hnRBGear(HX+1.15,y3+.55,FZ+.16,0,.45,.16,true,.1);
 hnBracketRow(HX-6,y3-.7,FZ,0,4.6,2,.5);hnBracketRow(HX+6,y3-.7,FZ,0,4.6,2,.5);
 // the sawtooth workshop on the west end
 const AX=HX-W/2-3.2;vB('vPlaster',AX,0,HZ,6.4,4,D,0,cream);hnRBWins(AX,.9,HZ+D/2,0,5,2,2,2.4,lit,'vIron',iron);hnRBWins(AX-3.2,.9,HZ,-Math.PI/2,D-2,3,1.6,2.2,lit,'vIron',iron);
 for(let i=0;i<3;i++){const z0=HZ-D/2+i*D/3;vnShedRoof(AX,4,z0+D/6,6.4,D/3,1.4,Math.PI,'hGableSc',slate,.15,.14);vB('vWinGlass',AX,4,z0+D/3-.08,6.2,1.36,.1,0);
  for(let k=0;k<6;k++)vB('vIron',AX-2.6+k*1.05,4,z0+D/3-.02,.05,1.36,.06,0,iron);}
 // the clock tower (Travis: after the clocktower reference) — the guild's own, a great clockwork wheel across its face
 hnRBClockTower(TX,TZ,{B:6.5,TH:9.5,roof:grn,oak:tar.clone().multiplyScalar(1.15),tar,rub:hC(vPick(HPAL.rubble)),ash,bigGear:true});
 // yard
 vnPaving(HX,0,FZ+2.6,5,3,0,ash,5);hnTotem(HX-4,0,FZ+2.2,.34,6,0,{painted:true,hat:true});
 FURNISH('hl_rep_workbench',HX+5.5,0,FZ+1.6,0,{v:2});hnCrate(HX+7.2,0,FZ+1.4,.8,.3);
 hnRBLamps([[HX-2.6,FZ+4],[HX+2.6,FZ+4],[TX-1.5,TZ+5.6]],3.4);vnFolk(HX,FZ+4,3,3);}

const HRB_GUILD={wealth:'civic',lit:true};
HL.def({key:'hl_rep_guild_merc',name:"Mercenary Guild",branch:'republican',family:'Guilds',tags:Object.assign({type:['civic']},HRB_GUILD),w:30,d:24,h:17,build:buildHlRepGuildMerc});
HL.def({key:'hl_rep_guild_alch',name:"Alchemists' Guild",branch:'republican',family:'Guilds',tags:Object.assign({type:['civic','industry']},HRB_GUILD),w:52,d:34,h:18,build:buildHlRepGuildAlch});
HL.def({key:'hl_rep_guild_farm',name:"Farmers' Guild",branch:'republican',family:'Guilds',tags:Object.assign({type:['civic']},HRB_GUILD),w:34,d:24,h:17,build:buildHlRepGuildFarm});
HL.def({key:'hl_rep_guild_smith',name:"Guild of Smiths",branch:'republican',family:'Guilds',tags:Object.assign({type:['civic','industry']},HRB_GUILD),w:30,d:26,h:17,build:buildHlRepGuildSmith});
HL.def({key:'hl_rep_guild_mech',name:"Mechanics' Guild",branch:'republican',family:'Guilds',tags:Object.assign({type:['civic','industry']},HRB_GUILD),w:40,d:22,h:31,build:buildHlRepGuildMech});
