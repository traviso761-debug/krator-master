// ================================================================= REPUBLICAN — the capital's institutions (round 9)
// Travis: "Let's make Roketstad the capital of the Iron Republic ... Add in all Republican civic buildings and guilds if
// not already present, and make 3 more." A republic that forges rockets keeps an ARSENAL, strikes its coin in a MINT, and
// its rocket-makers have a GUILD. All three in the East Highland manner: dressed stone below, frame storeys with their
// brackets, caihua and galleries above, Alpine / Russian roofs, the Republic's emblem on the civic fronts.
const HCAP={stone:[0xd8ccb0,0xcfc2a4,0xe0d4b8],slate:HPAL.slate};
function hnRustic(x,y,z,w,h,d,ry,c){vB('vStone',x,y,z,w,h,d,ry,c);const n=Math.floor(h/.55);for(let k=0;k<n;k++)for(const s of[-1,1]){const p=loc(x,z,0,s*(d/2+.02),ry);vB('vStone',p[0],y+k*.55+.02,p[1],w-.05,.05,.04,ry,c.clone().multiplyScalar(.82));}}   // rusticated: channelled courses
// ---------------------------------------------------------------- 1. the Arsenal of the Republic
// A long stone range round a drill court: the front range with a crenellated gate tower in the middle, two frame
// storeys over the stone ground floor on the side ranges, an earth-covered magazine at the back (a turf vault with a
// stone portal), racks of rockets on trestles in the court, the emblem over the gate and flags on the tower.
function buildHlRepArsenal(G,o){reseed(22001+(o.v|0));const W=46,D=34,S=.5,H1=4.2;
 const stone=hC(vPick(HCAP.stone)),ash=hC(vPick(HPAL.ashlar)),slate=hC(vPick(HCAP.slate)),red=hC(HPAL.red),gold=hC(HPAL.gold[0]),lit=vLit()?'lit':'glass',rust=hC(vPick(HSV.rust));
 vnReg('Arsenal of the Republic',0,0,24,20);
 hnSocle(0,0,0,W+1,S,D+1,0,null,ash);
 // the front range and its gate tower
 hnRustic(0,S,D/2-4,W,H1,8,0,stone);hnRBQuoins(0,S,D/2-4,W,H1,8,0,ash);hnFachBox(0,S+H1,D/2-4,W,3.2,8,0,null,null,lit);
 hnGable(0,S+H1+3.2,D/2-4,W,8,1.2,0,'hGableSc',slate,.6,'vGablePl',stone);
 vB('vStone',0,0,D/2+.2,9,S+H1+9,6,0,stone);hnRBQuoins(0,0,D/2+.2,9,S+H1+9,6,0,ash);vB('vDarkB',0,S,D/2+3.22,4.4,5,.1,0);
 for(let k=0;k<5;k++)for(const s of[-1,1]){const p=loc(0,D/2+.2,-4.5+k*2.25,s*3,0);vB('vStone',p[0],S+H1+9,p[1],1.2,1.2,.9,0,stone);}   // merlons
 hnEmblem(0,S+6.6,D/2+3.28,0,2.4);for(const s of[-1,1]){vPst('vPipe',s*3.8,S+H1+9,D/2+2.8,.06,6,hC(0x2e2a26));vB('hPaint',s*3.8+.9,S+H1+13.6,D/2+2.8,1.8,1.2,.03,0,red);}
 for(const u of[-19,-15,-11,11,15,19])vnWin(u,S+1.4,D/2+.02,0,1.2,1.8,lit,'vStone',ash);
 // the side ranges
 for(const s of[-1,1]){const x=s*(W/2-4);hnRustic(x,S,-2,8,H1,D-12,0,stone);hnFachBox(x,S+H1,-2,8,3,D-12,0,null,null,lit);hnGable(x,S+H1+3,-2,D-12,8,1.2,Math.PI/2,'hGableSc',slate,.6,'vGablePl',stone);}
 // the magazine: a turf vault behind a stone portal
 kput('hBatterRub',[0,S,-D/2+5],null,[W-18,5.5,9],hC(0x6a7a4a));vB('vStone',0,S,-D/2+9.6,8,4.2,1.2,0,stone);vB('vDarkB',0,S,-D/2+10.22,3,3,.08,0);vB('vIron',0,S+3,-D/2+10.3,3.4,.2,.1,0,rust);
 // the drill court: rocket racks on trestles
 for(let r=0;r<3;r++){const z=-2+r*4;for(const s of[-1,1])vB('vWood',s*4,S,z,.3,1.1,1.4,0,hC(vPick(HPAL.aged)));for(let k=0;k<4;k++){const x=-5+k*3.3;
  kput('hTankC',[x,S+1.35,z],qEuler(0,0,Math.PI/2),[.28,2.6,.28],hC(vPick([0x6a6a5a,0x8a3a2a])));kput('vConeI',[x+1.3,S+1.35,z],qEuler(0,0,-Math.PI/2),[.28,.6,.28],red);}}
 vnFolk(0,D/2+6,4,3);}
// ---------------------------------------------------------------- 2. the Mint and Treasury
// Rusticated stone below (the coin must feel safe), a piano nobile of lattice curtain wall and caihua on bracketed
// posts, a Dutch-inclined gable with a gilded cupola and the Republic's emblem in the pediment; the strongroom annex
// with a round steel door; the coin press's stack behind.
function buildHlRepMint(G,o){reseed(22011+(o.v|0));const W=24,D=16,S=1,H1=4.6;
 const stone=hC(vPick(HCAP.stone)),ash=hC(vPick(HPAL.ashlar)),slate=hC(vPick(HCAP.slate)),gold=hC(HPAL.gold[0]),lit=vLit()?'lit':'glass',iron=hC(0x3a3430);
 vnReg('Mint and Treasury',0,0,14,S+H1+8+5);
 hnSocle(0,0,0,W+.6,S,D+.6,0,null,ash);hnRustic(0,S,0,W,H1,D,0,stone);hnRBQuoins(0,S,0,W,H1,D,0,ash);
 vnStairs(0,0,D/2+1.3,0,4,S,4,'vStone',ash);vnDoor(0,S,D/2+.02,0,2,3.2,'vStone',ash,hC(vPick(HPAL.tar)),false);
 for(const u of[-9,-5.5,5.5,9])vnWin(u,S+1.2,D/2,0,1.1,2,lit,'vStone',ash);
 hnFachBox(0,S+H1,0,W,3.6,D,0,null,null,lit);
 const top=hnGable(0,S+H1+3.6,0,W,D,1.1,0,'hGableSc',slate,.7,'vGablePl',stone);hnBarge(0,S+H1+3.6,0,W,D,1.1*D/2,0,.7,hC(HPAL.white),'lace');
 hnEmblem(0,S+H1+5.2,D/2+.2,0,1.8);
 kput('hOctP',[0,top-.4,0],null,[1.3,1.6,1.3],stone);hnOnion(0,top+1.2,0,1.05,'G',gold,0);                               // the gilded cupola
 // the strongroom and the press stack
 vB('vStone',W/2+3,0,-2,6,4.4,7,0,stone);hnRBQuoins(W/2+3,0,-2,6,4.4,7,0,ash);kput('vHoop',[W/2+6.02,2,-2],qEuler(0,Math.PI/2,0),[1.2,1.2,3],iron);
 vB('vIron',W/2+6.04,.8,-2,.08,2.4,2.4,0,iron);vnHipRoof('hHipSc',W/2+3,4.4,-2,6,7,1.6,0,slate,.4);
 hnStoneChimney(-W/2+2,0,-D/2-1,15,1.2);hnSignBoard(-7,S+H1-1,D/2+.05,0,3.4,.8,'scales');}
// ---------------------------------------------------------------- 3. the Rocketeers' Guild
// The guildhall of the town's own craft: a frame hall on a stone socle with a gallery, caihua and a Dutch gable; beside
// it a timber test tower of four bracketed stages gripping a painted rocket upright, a blast wall of rubble and earth
// at its foot, a flame trench; the rocket on the sign.
function buildHlRepRocketGuild(G,o){reseed(22021+(o.v|0));const S=.8;
 const stone=hC(vPick(HCAP.stone)),ash=hC(vPick(HPAL.ashlar)),slate=hC(vPick(HCAP.slate)),red=hC(HPAL.red),post=hC(vPick(HFRAME.post)),white=hC(HPAL.white),lit=vLit()?'lit':'glass';
 vnReg("Rocketeers' Guild",-4,0,10,12);vnReg('Rocket test tower',8,-2,5,34);
 hnSocle(-4,0,0,15,S,11,0,null,ash);hnRustic(-4,S,0,14,3.8,10,0,stone);vnDoor(-4,S,5.02,0,1.8,2.8,'vStone',ash,hC(vPick(HPAL.tar)),false);
 hnFachBox(-4,S+3.8,0,14,3.2,10,0,null,null,lit);hnGable(-4,S+7,0,14,10,1.3,0,'hGableSc',slate,.6,'vGablePl',stone);hnSign(3.2,S+2.6,5.1,0,'rocket');hnEmblem(-4,S+3,5.12,0,1.4);
 // the test tower: four stages of posts, each capped by bracket sets, platforms, a ladder
 const tx=8,tz=-2,TW=4.4;let y=0;for(let k=0;k<4;k++){const h=7-k*.8;for(const sx of[-1,1])for(const sz of[-1,1]){kput('hCol',[tx+sx*TW/2,y,tz+sz*TW/2],null,[.2,h,.2],post);hnDougong(tx+sx*TW/2,y+h,tz+sz*TW/2,Math.atan2(sx,sz),.4);}
  y+=h;vB('vWood',tx,y+.36,tz,TW+1.4,.2,TW+1.4,0,hC(vPick(HPAL.aged)));kput('hRailC',[tx,y+.9,tz+TW/2+.6],null,[TW+1.2,.7,1],hC(vPick(HPAL.aged)));
  for(const sx of[-1,1])beam('vWood',[tx+sx*TW/2,y-h+.4,tz-TW/2],[tx-sx*TW/2,y-.4,tz-TW/2],.14,.14,hC(vPick(HPAL.aged)));}
 kput('hCaihua',[tx,y+.46,tz+TW/2+.72],null,[TW+1.3,.18,1],null);
 // the rocket, upright in the tower: body, bands, nose, four fins
 const rb=.9;kput('hTankC',[tx,1.8+11,tz],null,[rb,22,rb],hC(0xe0dccf));for(const yy of[5,11,17])kput('vHoop',[tx,1.8+yy,tz],qEuler(Math.PI/2,0,0),[rb*1.02,rb*1.02,1],red);
 kput('vConeI',[tx,1.8+22+0,tz],null,[rb,3.2,rb],red);for(let k=0;k<4;k++){const a=k*Math.PI/2;const p=loc(tx,tz,0,rb+.7,a);kput('hPaint',[p[0],3.2,p[1]],qEuler(0,a,0),[.08,3,1.4],red);}
 vB('vIron',tx,0,tz,3,1.8,3,0,hC(0x3a3430));vB('vDarkB',tx,.02,tz+3,2,.1,4,0);                                           // the stand and the flame trench
 kput('hBatterRub',[tx+5.5,0,tz],null,[2.2,4,9],hC(0x6a7a4a));}
HL.def({key:'hl_rep_arsenal',name:'Arsenal of the Republic',branch:'republican',family:'Military',tags:Object.assign({type:['military','industry'],landmark:true},HRB_CIVIC),w:48,d:44,h:24,build:buildHlRepArsenal});
HL.def({key:'hl_rep_mint',name:'Mint and Treasury',branch:'republican',family:'Civic',tags:Object.assign({type:['civic'],landmark:true},HRB_CIVIC),w:34,d:20,h:18,build:buildHlRepMint});
HL.def({key:'hl_rep_guild_rocket',name:"Rocketeers' Guild",branch:'republican',family:'Guilds',tags:Object.assign({type:['guild'],landmark:true},HRB_CIVIC),w:26,d:14,h:30,build:buildHlRepRocketGuild});
