// ================================================================= HIGHLANDS / RUSTIC — the village
// Stave church and longhall, the trades (shop and stalls, the inn, a scrap smithy, the mustering ground) and the
// farms (stabbur, watermill, Einhof farmhouse, fields with hay racks, animal pens). Norse and Alpine; stone only
// as footings and terraces; the carving is painted crests, dragon heads, carved portals and posts, a totem pair at
// the hall. No electric light. Seeds 22200–22499.

// ---------------------------------------------------------------- helpers (prefix hnRU)
// Market stall: four posts, a plank counter, a little shingle gable; goods by kind. Furniture, placed from the catalog;
// it burns the numbers the drawn stall drew (colours, goods, the crate behind).
function hnRUStall(x,z,ry,w,d,kind,c,rc){hlRngSkip((c?0:1)+(rc?0:1)+Math.round(w/.55)*(kind==='cheese'||kind==='fish'?2:4)+1);
 return FURNISH('hl_rus_stall',x,0,z,ry,{v:kind==='pots'?0:kind==='cheese'?2:kind==='fish'?3:1});}
// Wattle hurdle fence along a..b (local ground points): stakes and woven withies.
function hnRUWattle(a,b,h,c){h=h||1;c=c||hC(0x8a7250);const L=Math.hypot(b[0]-a[0],b[2]-a[2]);const n=Math.max(1,Math.round(L/.55));
 for(let i=0;i<=n;i++){const t=i/n;vPst('vPost',lerp(a[0],b[0],t),0,lerp(a[2],b[2],t),.035,h+.12,c);}
 const yaw=Math.atan2(b[0]-a[0],b[2]-a[2]);const m=[(a[0]+b[0])/2,0,(a[2]+b[2])/2];
 for(let k=0;k<4;k++)kput('vThatchB',[m[0],.2+k*(h-.25)/3,m[2]],qEuler(0,yaw,0),[.07,.2,L],c.clone().multiplyScalar(.85+.1*(k%2)));}
// Water trough, log bench, farm cart: furniture, placed from the catalog (each drew one colour)
function hnRUTrough(x,z,ry,L){rng();return FURNISH('hl_rus_trough',x,0,z,ry,{v:L>=2?1:0});}
function hnRUBench(x,z,ry,L,y){rng();return FURNISH('hl_rus_log_bench',x,y||0,z,ry,{v:L>2.5?1:0});}
function hnRUCart(x,z,ry,c){if(!c)rng();return hnFurn('hl_rus_cart',x,0,z,ry,{v:0},0,.77);}

// ---------------------------------------------------------------- TEMPLE AND HALL
// Stave church: a tarred-stave core on a stone footing, wrapped by an arcaded ambulatory (svalgang) under a
// shingle skirt; a second skirt; a steep clerestory roof with dragon heads on both gables and small side gables;
// a ridge tower with its own skirt, belfry and a shingled spire; an apse with a round turret; a gabled porch before
// the carved portal. ~24 m to the finial.
function buildHlRusTemple(G,o){reseed(22201+(o.v|0));const W=8,D=12,F=.5,Y1=6,Y2=9.6,CW=5.6,CD=9.6;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(rr(1,1.2)),sh=hC(vPick(HPAL.tar)).multiplyScalar(1.45),bc=hC(0xc8b890),red=hC(HPAL.red);
 vnReg('Stave church (temple)',0,-1,11,24);
 hnSocle(0,0,0,12.6,F,16.6,0);
 // core staves + battens
 hnRUBoards(0,F,0,W,Y1-F,D,0,tar,null,tar.clone().multiplyScalar(.8),.45);
 // the ambulatory: parapet boards, arcade posts, keel arches, head beam, and the skirt roof over it
 const OW=12,OD=16;const sides=[[0,OD/2,0,OW],[0,-OD/2,Math.PI,OW],[OW/2,0,Math.PI/2,OD],[-OW/2,0,-Math.PI/2,OD]];
 for(const [sx,sz,a,L] of sides){const n=Math.round(L/1.35);
  for(let i=0;i<=n;i++){const u=-L/2+L*i/n;const p=loc(sx,sz,u,0,a);vPst('vPost',p[0],F,p[1],.1,2.3,tar);}
  for(let i=0;i<n;i++){const u=-L/2+L*(i+.5)/n;if(a===0&&Math.abs(u)<1.4)continue;const p=loc(sx,sz,u,.02,a);vB('hRUBoardV',p[0],F,p[1],L/n-.18,.9,.1,a,tar);
   kput('hKeelW',[p[0],F+1.75,p[1]],qEuler(0,a,0),[L/n-.2,.55,.1],tar.clone().multiplyScalar(1.3));}
  const h=loc(sx,sz,0,0,a);vB('vWood',h[0],F+2.3,h[1],L+.2,.22,.24,a,tar);}
 kput('hRUSkirtA',[0,2.5,0],null,[13,2,17],sh);
 // second skirt over the core wall, clerestory above
 kput('hRUSkirtB',[0,5.68,0],null,[8.8,1.28,12.8],sh);
 hnRUBoards(0,Y1,0,CW,Y2-Y1,CD,0,tar,null,tar.clone().multiplyScalar(.8),.45);
 for(const s of[-1,1])for(let k=-1;k<=1;k++){vnWin(s*CW/2,Y1+1.6,k*2.8,s*Math.PI/2,.36,.36,'open','hPaint',red);}
 for(const s of[-1,1])vnWin(1.2*s,Y1+1.6,CD/2,0,.36,.36,'open','hPaint',red);
 const pitch=1.6,rise=pitch*CW/2,ridge=Y2+rise;
 hnGable(0,Y2,0,CD,CW,pitch,Math.PI/2,'vShingleB',sh,.5,'vGableW',tar);hnBarge(0,Y2,0,CD,CW,rise,Math.PI/2,.5,bc,'horns');hnRUDragons(0,Y2,0,CD,CW,rise,Math.PI/2,.5,tar.clone().multiplyScalar(1.3),1.1);
 hnForm('hFormT',0,Y2+.5,CD/2+.02,0,2.6,1.3);
 // side gables on the clerestory
 for(const s of[-1,1]){hnGable(s*1.45,Y2-.2,0,2.9,2.6,1.3,0,'vShingleB',sh,.25,'vGableW',tar);hnBarge(s*1.45,Y2-.2,0,2.9,2.6,1.3*1.3,0,.25,bc,'horns');}
 // ridge tower: base, skirt, belfry, shingled spire with four small gables, finial
 const T=2.4,TB1=ridge+1;vB('hRUBoardV',0,ridge-1.4,0,T,TB1-ridge+1.4,T,0,tar);
 kput('hRUSkirtC',[0,TB1-.3,0],null,[T/.6,.8,T/.6],sh);
 const TB2=TB1+2.2;vB('hRUBoardV',0,TB1+.4,0,T,TB2-TB1-.4,T,0,tar);
 for(let k=0;k<4;k++){const a=k*Math.PI/2;const p=loc(0,0,0,T/2,a);vB('vDarkB',p[0],TB1+.8,p[1],.9,1.1,.1,a);kput('hKeelW',[...[loc(0,0,0,T/2+.04,a)].map(q=>[q[0],TB1+1.85,q[1]])[0]],qEuler(0,a,0),[1.1,.4,.08],bc);
  const g=loc(0,0,0,.95,a);hnGable(g[0],TB2-.15,g[1],1.5,1.1,1.5,a-Math.PI/2,'vShingleB',sh,.12,'vGableW',tar);}
 kput('hTentSh',[0,TB2-.1,0],null,[1.72,7.6,1.72],sh);const tip=TB2+7.4;
 vPst('vIron',0,tip-.3,0,.05,1.6,hC(0x2e2a26));vBall('hGold',0,tip+.9,0,.16,hC(HPAL.gold[0]));kput('hPaint',[.3,tip+1.1,0],null,[.6,.3,.03],hC(HPAL.gold[1]));
 // apse: a gabled chancel and a round turret
 vB('hRUBoardV',0,F,-7.6,4,3.7,3.4,0,tar);hnGable(0,F+3.7,-7.9,4,4,1.4,Math.PI/2,'vShingleB',sh,.3,'vGableW',tar);
 kput('hOctW',[0,F,-9.9],null,[1.5,3.1,1.5],tar);kput('hTentSh',[0,F+3.05,-9.9],null,[1.9,2.1,1.9],sh);
 kput('hOctW',[0,F+3.7+2.4,-8],null,[.45,1,.45],tar);kput('hTentSh',[0,F+3.7+3.35,-8],null,[.62,2.2,.62],sh);vBall('hGold',0,F+3.7+5.6,-8,.1,hC(HPAL.gold[0]));
 // porch and carved portal
 for(const sx of[-1,1])for(const z of[8.2,10])vPst('vPost',sx*1.3,F,z,.11,2.4,tar);
 hnGable(0,F+2.4,8.8,2.8,3,1.2,Math.PI/2,'vShingleB',sh,.3,'vGableW',tar);hnBarge(0,F+2.4,8.8,2.8,3,1.8,Math.PI/2,.3,bc,'horns');hnRUDragons(0,F+2.4,8.8,2.8,3,1.8,Math.PI/2,.3,tar.clone().multiplyScalar(1.3),.7);
 hnForm('hFormT',0,F+2.55,10.22,0,2.2,1.1);
 vnDoor(0,F,D/2,0,1.4,2.6,'vWood',tar,red.clone().multiplyScalar(.8),false);hnRUPortal(0,F,D/2+.03,0,1.4,2.6);
 for(const s of[-1,1])hnForm('hFormV',s*1.3,F+.3,10.14,0,.3,1.8);
 vnStairs(0,0,10.2+.5,0,2.6,F,2,'vStone',hC(vPick(HPAL.ashlar)));
 // churchyard: a few carved grave boards, a lychgate fence line
 for(let k=0;k<6;k++){const x=rr(-7,7),z=rr(-9,-4);if(Math.abs(x)<7.2&&z>-8.8)continue;FURNISH('hl_rus_grave_board',x,0,z,rr(-.2,.2));rng();}
 for(const s of[-1,1]){FURNISH('hl_rus_grave_board',s*7.6,0,rr(-6,4),rr(-.2,.2));rng();}   // rng: the motif the board drew
 vnFolk(1,13,3,2);}
// Village hall: a Norse longhall on a low stone terrace reached by a wide flight of steps; tarred stave walls,
// a steep shingle roof with dragon heads and tall horned corner poles, a carved arcaded porch under painted
// brackets, a totem to each side of it, and a firepit with benches on the forecourt.
function buildHlRusHall(G,o){reseed(22211+(o.v|0));const TW=20,TD=36,TH=1.2,W=11,L=24,ZC=-4,H=3.6;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.1,1.3)),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.6),bc=hC(0xc8b890),red=hC(HPAL.red);
 vnReg('Village hall (civic)',0,-2,17,12.5);
 hnSocle(0,0,0,TW,TH,TD,0);
 const run=6*.32;vnStairs(0,0,TD/2+run/2,0,6,TH,6,'vStone',hC(vPick(HPAL.ashlar)));
 for(const s of[-1,1])vB('vStone',s*3.2,0,TD/2+run/2,.5,TH+.1,run,0,hC(vPick(HPAL.ashlar)));
 // the hall
 const zf=ZC+L/2;hnRUBoards(0,TH,ZC,W,H,L,0,tar,null,tar.clone().multiplyScalar(.75),.5);
 vB('vWood',0,TH,ZC,W+.2,.3,L+.2,0,tar.clone().multiplyScalar(.8));                              // sill beam
 const pitch=1.3,rise=pitch*W/2,ridge=TH+H+rise;
 hnGable(0,TH+H,ZC,L,W,pitch,Math.PI/2,'vShingleB',sh,.9,'vGableW',tar);hnBarge(0,TH+H,ZC,L,W,rise,Math.PI/2,.9,bc,'horns');hnRUDragons(0,TH+H,ZC,L,W,rise,Math.PI/2,.9,tar.clone().multiplyScalar(1.3),1.4);
 hnForm('hFormT',0,TH+H+3.5,zf+.02,0,3,1.5);
 for(const s of[-1,1])for(let k=0;k<5;k++){const z=ZC-9+k*4.5;vnWin(s*W/2,TH+1.7,z,s*Math.PI/2,.7,.6,'shut','hPaint',red);}
 for(const s of[-1,1])for(const z of[ZC-6,ZC+4]){vB('hRUBoardV',0,ridge-.4,z,1.2,1.1,1.2,0,tar);vnGableRoof(0,ridge+.7,z,1.6,1.4,.7,Math.PI/2,'vShingleB',sh,.25);}
 vnDoor(W/2,TH,ZC-6,Math.PI/2,1.1,2.1,'vWood',tar,tar,false);
 // tall horned poles at the front corners
 for(const s of[-1,1]){hlRngSkip(4);FURNISH('hl_rus_carved_pillar',s*(W/2+.45),TH,zf+.45,0,{v:1});}
 // arcaded porch: carved posts, keel arches, painted brackets, a steep gable with dragons
 const PZ=zf+3;for(let i=0;i<5;i++){const x=-3.2+i*1.6;hnTotemPost(x,TH,PZ-.2,.16,3.2,0);if(i<4)kput('hKeelW',[x+.8,TH+2.35,PZ-.2],null,[1.3,.85,.12],tar.clone().multiplyScalar(1.4));}
 for(const s of[-1,1])hnTotemPost(s*3.2,TH,zf+.4,.14,3.2,0);
 hnBracketRow(0,TH+3.25,PZ-.2,0,6.4,4,.42);
 hnGable(0,TH+3.4,zf+1.5,3.4,7,1.1,Math.PI/2,'vShingleB',sh,.35,'vGableW',tar);hnBarge(0,TH+3.4,zf+1.5,3.4,7,1.1*3.5,Math.PI/2,.35,bc,'dragon');
 hnForm('hFormT',0,TH+3.6,zf+3.22+.02,0,2.8,1.4);
 vnDoor(0,TH,zf,0,1.8,2.4,'vWood',tar,red.clone().multiplyScalar(.7),false);hnRUPortal(0,TH,zf+.03,0,1.8,2.4);
 // the totem pair
 for(const s of[-1,1])hnTotem(s*4.8,TH,zf+3.6,.36,6.8,0,{hat:true});
 // forecourt: firepit, log benches, shields on a rack
 const fz=zf+6.6;hnFirepit(0,TH,fz,1);
 for(const [bx,bz,r] of[[-2.7,fz,Math.PI/2],[2.7,fz,Math.PI/2],[-1.9,fz-1.9,Math.PI/4],[1.9,fz-1.9,-Math.PI/4]])hnRUBench(bx,bz,r,2,TH);
 for(const s of[-1,1]){vnBannerPole(s*(TW/2-1),TH,TD/2-1.5,Math.PI/2,6,hC(s<0?HPAL.red:HPAL.teal));}
 for(let k=0;k<4;k++)hnRUShield(-W/2-.1,TH+1.8,ZC+2+k*1.6,-Math.PI/2,.42,hC(vPick([HPAL.red,HPAL.teal,HPAL.white])),hC(HPAL.black));
 hnStoneChimney(W/2+.6,0,ZC-11,TH+H+2,.9);
 hnRUFolk(0,TH,TD/2-3.5,4,3.5);}

// ---------------------------------------------------------------- TRADE AND CRAFTS
// Shop cottage + market stalls: a log cottage with a shutter counter (top leaf propped up as an awning, bottom
// leaf let down as the counter), a painted sign, and three stalls under shingle gables before it.
function buildHlRusShops(G,o){reseed(22221+(o.v|0));const W=7.2,D=6,F=.4,H=2.7,Z=-4;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.8,.95)),sh=hC(vPick(HPAL.shingle)),trim=hC(vPick([HPAL.teal,HPAL.red,HPAL.blue])),dk=hC(vPick(HPAL.tar));
 vnReg('Shop cottage + stalls (market)',0,0,11,F+H+4);
 vB('hRubB',0,0,Z,W+.2,F,D+.2,0,hC(vPick(HPAL.rubble)));hnLogBox(0,F,Z,W,H,D,0,log);
 const top=hnGable(0,F+H,Z,W,D,1.05,0,'vShingleB',sh,.7,'hGableLog',log);hnBarge(0,F+H,Z,W,D,1.05*D/2,0,.7,trim,'horns');
 // shutter counter
 const cz=Z+D/2,cx=-1.1;hlRngSkip(12);FURNISH('hl_rus_shutter_counter',cx,F,cz+.53,0);   // its six pots drew 12 numbers
 vnDoor(1.9,F,cz,0,.95,2,'vWood',log,trim,false);vnStairs(1.9,0,cz+.45,0,1.2,F,2,'vWood',dk);
 hnSign(2.75,F+2.5,cz,0,null,.85);    // hanging sign across the street (the trade's symbol)
 vnWin(-W/2,F+1,Z,-Math.PI/2,.7,.8,'shut','hPaint',trim);hnStoneChimney(1.6,top-1.6,Z-.8,2,.6);
 // stalls
 const kinds=['pots','cloth','cheese','fish'];[[-6.3,1.6,.5],[6.4,1.6,-.5],[3.6,6.4,-.15]].forEach(([x,z,r],i)=>hnRUStall(x,z,r,2.8,1.9,kinds[(i+(o.v|0))%4]));
 hnSacks(5.6,0,-2.4,4);hnBarrel(-4.6,0,-1.6,.35,.9);hnCrate(-4.3,0,4.5,.8,.3);vnFolk(0,4.4,5,3.5);}
// Tavern / inn: a big chalet — whitewashed stone ground storey, two log storeys with balconies, a wide low gable
// with the crest, a bench-lined porch along the front, a painted sign, barrels, and a stable lean-to with a horse.
function buildHlRusTavern(G,o){reseed(22231+(o.v|0));const W=14,D=11,H1=3,H2=2.8,H3=2.6;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.1,1.35)),white=hC(vPick(HPAL.stucco)),sh=hC(vPick(HPAL.shingle)),trim=hC(vPick([HPAL.teal,HPAL.red])),dk=log.clone().multiplyScalar(.8);
 const y2=H1,y3=H1+H2,y4=y3+H3;vnReg('Tavern and inn (tavern)',1.5,0,11,y4+5);
 vB('hRubB',0,0,0,W+.24,.5,D+.24,0,hC(vPick(HPAL.rubble)));vB('vPlaster',0,.5,0,W,H1-.5,D,0,white);
 for(const u of[-5,-2.6,2.6,5])vnWin(u,1.1,D/2,0,1,1.2,'glass','hPaint',trim,true);vnDoor(0,.5,D/2,0,1.5,2.2,'vWood',log,log,false);
 for(const z of[-3,0,3])vnWin(-W/2,1.1,z,-Math.PI/2,1,1.2,'glass','hPaint',trim,true);
 hnLogBox(0,y2,0,W,H2,D,0,log);hnLogBox(0,y3,0,W,H3,D,0,log);
 for(const u of[-5.4,-3.3,-1.1,1.1,3.3,5.4]){vnWin(u,y2+.8,D/2,0,.8,1.15,'glass','hPaint',trim,true);if(Math.abs(u)<5)vnWin(u,y3+.7,D/2,0,.75,1.05,'glass','hPaint',trim,true);}
 for(const z of[-3.4,0,3.4])for(const s of[-1,1]){vnWin(s*W/2,y2+.8,z,s*Math.PI/2,.8,1.1,'glass','hPaint',trim,true);vnWin(s*W/2,y3+.7,z,s*Math.PI/2,.75,1,'glass','hPaint',trim,true);}
 const pitch=.6,over=1.9,top=hnGable(0,y4,0,D,W,pitch,Math.PI/2,'vShingleB',sh,over,'hGableLog',log);
 hnBarge(0,y4,0,D,W,pitch*W/2,Math.PI/2,over,log.clone().multiplyScalar(1.3),'horns');
 for(let k=0;k<16;k++){const zz=rr(-D/2,D/2),xx=rr(.8,W/2+1);for(const s of[-1,1])kput('vRock',[s*xx,y4+pitch*(W/2-xx)+.28,zz],qEuler(rng(),rng(),0),[.26,.17,.24],hC(vPick(HPAL.rubble)));}
 hnForm('hFormT',0,y4+1.1,D/2+.03,0,3.6,1.7);
 const rail=log.clone().multiplyScalar(1.6);hnBalcony(0,y2+.05,D/2,0,W-.4,1.4,log,rail);hnBalcony(0,y3+.05,D/2,0,W-2.4,1.2,log,rail);hnBalcony(0,y4+.05,D/2,0,3.2,.8,log,rail,false);
 for(const u of[-6,-3,3,6])vB('vWood',u,y4+pitch*(W/2-Math.abs(u))-.24,D/2+over/2,.26,.32,over+.2,0,log);
 // porch along the front under the first balcony: posts at its edge, benches, tables
 for(let i=0;i<=4;i++){const x=-W/2+.5+i*(W-1)/4;vPst('vPost',x,0,D/2+1.3,.1,y2-1.1,log);}
 for(const s of[-1,1]){FURNISH('hl_rus_porch_set',s*3.8,0,D/2+1.8-.3375,0);for(const t of[-1,1])FURNISH('hl_rus_porch_bench',s*3.8+t*1.55,0,D/2+.35,0,{v:0});}   // the long wall bench: the set's own and a bench each side
 // painted sign on an iron bracket at the corner
 hnSign(W/2-.4,y2-.35,D/2,0,null,1);
 for(let k=0;k<5;k++)hnBarrel(-W/2-.6+(k%2)*.1,0,D/2-1-k*.8,.34,.9);hnBarrel(-W/2-.62,.9,D/2-1.4,.34,.9);
 // stable lean-to at +x: board back wall, posts, shed roof, a horse and hay
 const sx=W/2+2;vB('hRUBoardV',W/2+.05,0,-1,.1,2.8,D-2,0,dk);for(const z of[-5,-1,3])vPst('vPost',sx+1.4,0,z,.1,2.3,log);
 vnShedRoof(sx,2.3,-1,3.2,D-1,1,-Math.PI/2,'vShingleB',sh,.25,.12);vB('vWood',sx+1.4,1.1,-1,.1,.12,8,0,log);
 hnRUBeast(sx,.8,Math.PI/2,'horse');hnRUBeast(sx,-3,-Math.PI/2,'horse');FURNISH('hl_tri_haycock',sx-.2,0,-4.4,0,{v:0});
 hnStoneChimney(-2.5,top-2,-2,2.4,.8);vnFolk(0,D/2+4,4,3);}
// Scrap smithy: an open-sided forge shed on posts under a shingle gable, a stone hearth with its ember and hood
// chimney, bellows, anvil on a stump, quench barrel, a tool rack, and outside the heap of salvage it lives on.
function buildHlRusSmithy(G,o){reseed(22241+(o.v|0));const W=7,D=5,H=2.6;
 const wd=hC(vPick(HPAL.aged)),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.8),dk=hC(0x2e2a26);
 vnReg('Scrap smithy (industry)',0,0,7,H+3.8);
 vB('vFlag',0,-.02,0,W,.08,D,0,hC(0x6a6258));
 for(const u of[-W/2,0,W/2])for(const s of[-1,1])vPst('vPostB',u*.96,0,s*(D/2-.1),.12,H,wd);
 for(const s of[-1,1])vB('vWood',0,H-.22,s*(D/2-.1),W+.2,.22,.22,0,wd);
 const top=hnGable(0,H,0,W,D,1,0,'vShingleB',sh,.6,'vGableW',wd);hnBarge(0,H,0,W,D,D/2,0,.6,wd.clone().multiplyScalar(1.2),'horns');
 vB('hRUBoardV',0,0,-D/2+.05,W-.4,1.5,.1,0,wd);                                                   // half-height back boards
 // the forge (hearth, ember, hood, bellows) and the smith's gear are furniture from the catalog; the chimney stack through
 // the roof is the shed's own, rising from the forge's cap (the drawn hearth and hood drew 2 numbers)
 hlRngSkip(2);FURNISH('hl_rus_forge',-2.1,0,-1.5,0);hnStoneChimney(-1.8,3.34,-1.6,top-3.34+.9,.62);
 FURNISH('hl_rus_anvil',0,0,.4,0);FURNISH('hl_rus_quench_barrel',1.3,0,-.6,0);FURNISH('hl_rus_grindstone',2.6,0,.8,0);
 hlRngSkip(6);FURNISH('hl_rus_tool_board',1.475,0,-D/2+.12,0);   // the tools hung on the back boards
 hlRngSkip(193);FURNISH('hl_rep_scrap_heap',6,0,-.1,0,{v:1});   // the salvage heap it lives on (it drew 193 numbers)
 hnWoodpile(-W/2-.8,0,0,Math.PI/2,3.6,1.4);vnFolk(.8,1.4,1,.3);vnFolk(0,D/2+2.5,1,1);}
// Mustering ground: a beaten field with a rail fence, weapon racks with spears and shields, pells (training posts),
// straw target butts, a raised lookout on four posts with a ladder, the horn post and the banners.
function buildHlRusMuster(G,o){reseed(22251+(o.v|0));const FW=32,FD=24;
 const wd=hC(vPick(HPAL.aged)),dk=hC(vPick(HPAL.tar)),straw=hC(0xc8b070);
 vnReg('Mustering ground (military)',0,0,19,8.5);
 vB('hPaint',0,-.03,0,FW,.06,FD,0,hC(0x8a7658));
 vnFence(0,0,0,FW+1,FD+1,0,wd,4,1.1);
 // weapon racks: A-frames with spears, shields hung on a board
 for(const [rx,rz] of[[-12,-9],[-6,-9]]){hlRngSkip(3);FURNISH('hl_rus_spear_rack',rx,0,rz-.04,0);}   // its three shields drew a colour each
 // pells
 for(let k=0;k<5;k++)FURNISH('hl_rus_pell',-10+k*2.6,0,-2,0);
 // target butts at the far end, archers' line
 for(const x of[-4,0,4])FURNISH('hl_rus_target_butt',x,0,-9.965,0);
 vB('vWood',0,.02,6,10,.04,.2,0,hC(0xefe7d6));
 // lookout on four posts
 const lx=11,lz=-7,LH=5;for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPostB',lx+sx*1.3,0,lz+sz*1.3,.14,LH+2.2,dk);
 for(const s of[-1,1]){beam('vWood',[lx+s*1.3,.3,lz-1.3],[lx-s*1.3,LH-.3,lz-1.3],.1,.1,dk);beam('vWood',[lx-1.3,.3,lz+s*1.3],[lx+1.3,LH-.3,lz+s*1.3],.1,.1,dk);}
 vB('vWood',lx,LH-.15,lz,3.2,.16,3.2,0,wd);for(const [a,b] of[[[-1.5,-1.5],[1.5,-1.5]],[[1.5,-1.5],[1.5,1.5]],[[-1.5,1.5],[-1.5,-1.5]],[[-1.5,1.5],[.2,1.5]]])hnDeckRail([lx+a[0],LH,lz+a[1]],[lx+b[0],LH,lz+b[1]],0,wd,1);
 vnPyrRoof('vPyrSh',lx,LH+2.2,lz,3,3,1.6,0,hC(vPick(HPAL.shingle)),.4);vnLadder(lx+.9,0,lz+1.9,0,LH+.2,wd);
 // horn post + banners
 FURNISH('hl_rus_horn_post',7.725,0,4.21,0);
 for(const [x,c] of[[-14,HPAL.red],[14,HPAL.teal]])vnBannerPole(x,0,FD/2-1,Math.PI/2,6.5,hC(c));
 hnRUBench(-8,8,0,3);hnRUBench(-3,8,0,3);hnBarrel(5,0,9,.34,.85);hnBarrel(5.8,0,9.2,.34,.85);
 vnFolk(-8,-.5,4,3);vnFolk(0,4,4,3);}

// ---------------------------------------------------------------- FARMS AND MILLS
// Stabbur: the raised storehouse — a log lower storey on posts standing on stone rat-guard slabs, a board upper
// storey oversailing on all four sides, a turf roof, a carved door and a stair that stops short of the threshold.
function buildHlRusGranary(G,o){reseed(22261+(o.v|0));const W=4,D=3.6,PH=.9,H1=2.1,H2=1.8,OV=.55;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.1,1.4)),wd=hC(vPick([...HPAL.falu,HPAL.tar[0]])),st=hC(vPick(HPAL.rubble));
 vnReg('Stabbur (granary)',0,0,4.5,PH+H1+H2+3.4);
 for(const sx of[-1,0,1])for(const sz of[-1,1]){const x=sx*(W/2-.3),z=sz*(D/2-.3);vB('hRubB',x,0,z,.5,.35,.5,0,st);vPst('vPostB',x,.35,z,.16,PH-.5,log);vB('vStone',x,PH-.15,z,.7,.1,.7,0,st);}
 vB('vWood',0,PH-.05,0,W+.1,.2,D+.1,0,log);const y1=PH+.15;hnLogBox(0,y1,0,W,H1,D,0,log,.28);
 const y2=y1+H1;vB('vWood',0,y2,0,W+2*OV,.18,D+2*OV,0,log);for(let i=0;i<5;i++){const u=-W/2+W*i/4;for(const s of[-1,1])vB('vWood',u,y2-.25,s*(D/2+OV/2),.16,.25,OV+.2,0,log);}
 hnRUBoards(0,y2+.18,0,W+2*OV-.1,H2,D+2*OV-.1,0,wd,null,hC(HPAL.white),.5);
 hnRUTurf(0,y2+.18+H2,0,W+2*OV,D+2*OV,1,0,.4,'hGableLog',wd,8);
 vnDoor(0,y1,D/2,0,.9,1.8,'vWood',log,log.clone().multiplyScalar(.7),false);hnRUPortal(0,y1,D/2+.03,0,.9,1.8);
 vnWin(0,y2+.8,D/2+OV,0,.5,.4,'open','hPaint',hC(HPAL.white));
 const sz0=D/2+.35+.3;vB('hRubB',0,0,sz0+.7,1.2,y1-.15,1.4,0,st);vnStairs(0,0,sz0+1.9,0,1.1,y1-.15,3,'vStone',st);   // stops short of the door
 hnSacks(2.8,0,1.6,3);vnFolk(2.2,D/2+2.2,1,.8);}
// Watermill: a log mill house on a stone undercroft beside a race, an overshot wheel fed by a flume on trestles,
// millstones leaning at the door, sacks.
function buildHlRusMill(G,o){reseed(22271+(o.v|0));const W=6,D=5.5,S=1.2,H=2.7,R=2.2;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.75,.9)),sh=hC(vPick(HPAL.shingle)),wd=hC(vPick(HPAL.aged)),st=hC(vPick(HPAL.rubble));
 vnReg('Watermill (mill)',1.8,0,7,S+H+4.2);
 hnSocle(0,0,0,W,S,D,0);hnLogBox(0,S,0,W,H,D,0,log);
 const top=hnGable(0,S+H,0,W,D,1.1,0,'vShingleB',sh,.7,'hGableLog',log);hnBarge(0,S+H,0,W,D,1.1*D/2,0,.7,hC(HPAL.white),'horns');
 vnDoor(-1,S,D/2,0,1.1,2,'vWood',log,wd,false);vnStairs(-1,0,D/2+.8,0,1.3,S,4,'vStone',st);vnWin(1.3,S+1,D/2,0,.7,.8,'shut','vWood',log);
 vnWin(-W/2,S+1,0,-Math.PI/2,.7,.8,'shut','vWood',log);hnForm('hFormT',-(W/2+.02),S+H+.9,0,-Math.PI/2,1.8,.9);
 // the race along z past the +x wall, stone-lined
 const rx=W/2+1.1;vB('hRUWater',rx,-.04,0,1.6,.1,22,0);for(const s of[-1,1])vB('hRubB',rx+s*1.05,-.1,0,.5,.3,22,0,st);
 // the wheel: two rims, spokes, paddles, axle into the wall
 const wy=R+.3,N=16;for(const s of[-1,1]){const xx=rx+s*.4;for(let k=0;k<N;k++){const a0=k/N*TAU,a1=(k+1)/N*TAU;beam('vWood',[xx,wy+Math.cos(a0)*R,Math.sin(a0)*R],[xx,wy+Math.cos(a1)*R,Math.sin(a1)*R],.12,.12,wd);}
  for(let k=0;k<6;k++){const a=k/6*TAU;beam('vWood',[xx,wy,0],[xx,wy+Math.cos(a)*R,Math.sin(a)*R],.1,.1,wd);}}
 for(let k=0;k<N;k++){const a=(k+.5)/N*TAU;kput('vWood',[rx,wy+Math.cos(a)*(R-.15),Math.sin(a)*(R-.15)],qEuler(-a,0,0),[.9,.35,.05],wd);}
 beam('vWood',[W/2-.1,wy,0],[rx+.7,wy,0],.22,.22,hnRUDk(wd));
 // flume on trestles from upstream (-z), spilling onto the top of the wheel
 const fy=wy+R+.35;beam('vWood',[rx,fy,-11],[rx,fy,-.35],.7,.08,wd);for(const s of[-1,1])beam('vWood',[rx+s*.34,fy+.15,-11],[rx+s*.34,fy+.15,-.35],.06,.34,wd);
 vB('hRUWater',rx,fy+.05,-5.7,.56,.08,10.6,0);
 for(const z of[-10,-7,-4])for(const s of[-1,1])vPst('vPost',rx+s*.35,0,z,.08,fy,wd);
 // millstones, sacks, a cart
 FURNISH('hl_rus_millstones',-2.45,0,D/2+1.32,0);
 hnSacks(.6,0,D/2+1.4,5);hnRUCart(-W/2-2,1.5,.3);vnFolk(0,D/2+3,2,1.5);}
function hnRUDk(c){return c.clone().multiplyScalar(.7);}
// Einhof farmhouse: dwelling and byre under one long low roof. The house end: whitewashed stone ground storey,
// log upper storey with a balcony round the gable; the byre end: rubble ground storey (the stalls) under a board
// hay loft with slatted vents; stones on the shingle; a dung heap, a cart, cows.
function buildHlRusFarmhouse(G,o){reseed(22281+(o.v|0));const L=20,D=10,H1=2.8,H2=2.6,XH=-5.5;   // house part x<-1, byre x>-1
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.1,1.35)),white=hC(vPick(HPAL.stucco)),sh=hC(vPick(HPAL.shingle)),trim=hC(vPick([HPAL.red,HPAL.teal,HPAL.white])),barn=hC(vPick(HPAL.aged)),st=hC(vPick(HPAL.rubble));
 vnReg('Einhof farmhouse (farm)',0,0,12,H1+H2+4.2);
 const HW=9,BW=L-HW;const hx=-L/2+HW/2,bx=L/2-BW/2;
 // house
 vB('hRubB',hx,0,0,HW+.2,.5,D+.2,0,st);vB('vPlaster',hx,.5,0,HW,H1-.5,D,0,white);hnLogBox(hx,H1,0,HW,H2,D,0,log);
 vnDoor(hx+1.8,.5,D/2,0,1.1,2.1,'vWood',log,log,false);vnStairs(hx+1.8,0,D/2+.5,0,1.5,.5,2,'vStone',hC(vPick(HPAL.ashlar)));
 for(const u of[-2.8,-.6])vnWin(hx+u,1.1,D/2,0,.85,1.05,'glass','hPaint',trim,true);
 for(const z of[-2.6,0,2.6]){vnWin(-L/2,1.1,z,-Math.PI/2,.85,1.05,'glass','hPaint',trim,true);vnWin(-L/2,H1+.75,z,-Math.PI/2,.8,1.05,'glass','hPaint',trim,true);}
 for(const u of[-3,-1,1,3])vnWin(hx+u,H1+.75,D/2,0,.8,1.05,'glass','hPaint',trim,true);
 // byre: rubble walls, small windows, the stall door; board hay loft above with slats and a loft door
 vB('hRubB',bx,0,0,BW,H1,D,0,st);for(const u of[-3.5,-1,1.5])vnWin(bx+u,1.2,D/2,0,.5,.5,'open','vWood',barn);
 vnDoor(bx+3.4,0,D/2,0,1.5,2.2,'vWood',barn,barn,false);
 hnRUBoards(bx,H1,0,BW,H2,D,0,barn,null,barn.clone().multiplyScalar(.8));
 for(let k=0;k<6;k++)vB('vDarkB',bx-4+k*1.2,H1+.9,D/2+.03,.12,1.2,.06,0);
 vB('vDarkB',bx+2.6,H1+.3,D/2+.05,1.8,1.8,.08,0);vB('vWood',bx+2.6,H1+.3,D/2+.1,1.7,1.7,.06,0,barn);
 // one roof, ridge along x
 const pitch=.62,over=1.5,top=hnGable(0,H1+H2,0,L,D,pitch,0,'vShingleB',sh,over,'hGableLog',log);
 hnBarge(0,H1+H2,0,L,D,pitch*D/2,0,over,log.clone().multiplyScalar(1.3),'horns');
 for(let k=0;k<20;k++){const xx=rr(-L/2,L/2),zz=rr(.8,D/2+.8);for(const s of[-1,1])kput('vRock',[xx,H1+H2+pitch*(D/2-zz)+.28,s*zz],qEuler(rng(),rng(),0),[.26,.17,.24],st);}
 hnForm('hFormT',-L/2-.03,H1+H2+.9,0,-Math.PI/2,2.8,1.4);
 // balcony along the house front and round the -x gable
 const rail=log.clone().multiplyScalar(1.6);hnBalcony(hx+.2,H1+.05,D/2,0,HW-.6,1.2,log,rail);hnBalcony(-L/2,H1+.05,0,-Math.PI/2,D-1,1.2,log,rail);
 hnStoneChimney(hx,top-1.3,-.9,1.8,.7);
 // yard
 kput('vRock',[bx+1,.1,D/2+3.5],null,[1.7,.7,1.2],hC(0x4a3a2a));kput('vRock',[bx+1.6,.1,D/2+3.2],null,[1,.55,.8],hC(0x5a4632));vB('vWood',bx+1,0,D/2+2.1,3.6,.35,.12,0,barn);   // dung heap on its curb
 hnRUCart(bx-3,D/2+4.2,-.6);hnRUBeast(bx+5,D/2+3,.7,'cow');hnRUBeast(bx+6.5,D/2+5.2,2.2,'cow');
 hnWoodpile(hx,0,-D/2-.8,0,6,1.6);vnFolk(hx,D/2+3.2,2,1.5);}
// Farm fields: strips of grain, greens and fallow in a rail fence, hay-drying racks, a field barn, a scarecrow.
function buildHlRusFarm(G,o){reseed(22291+(o.v|0));const FW=50,FD=35;
 const wd=hC(vPick(HPAL.aged));
 vnReg('Farm fields (farm)',0,0,30,3);
 const strips=7,sw=(FW-4)/strips;
 for(let i=0;i<strips;i++){const x=-FW/2+2+sw*(i+.5),kind=(i+(o.v|0))%4;
  vB('hPaint',x,-.03,-1,sw-.4,.08,FD-6,0,hC(0x6a5238).multiplyScalar(rr(.9,1.1)));
  if(kind===0)for(let r=0;r<5;r++)vB('vThatchB',x-sw/2+.6+r*(sw-1.2)/4,0,-1,.5,.75,FD-7,0,hC(vPick([0xd8b860,0xc8a850,0xe0c070])));   // grain
  else if(kind===1)for(let r=0;r<6;r++)vB('hTurfB',x-sw/2+.5+r*(sw-1)/5,0,-1,.34,.35,FD-7,0,hC(vPick([0x6a9a4a,0x5a8a3a])));         // greens in rows
  else if(kind===2)for(let r=0;r<5;r++)vB('hPaint',x-sw/2+.6+r*(sw-1.2)/4,0,-1,.3,.18,FD-7,0,hC(0x5a4430));                        // ploughed ridges
  else vB('hTurfB',x,0,-1,sw-.8,.16,FD-7,0,hC(vPick(HPAL.turf)));}                                                                 // hay meadow
 vnFence(0,0,0,FW,FD,0,wd,5,1.1);
 for(const [x,z,r] of[[-16,14.2,0],[4,14.2,0],[16,-6,Math.PI/2]])hnRUHesje(x,z,r,7.5);
 // field barn (løe): board walls, turf roof
 const bx=-FW/2+4,bz=-FD/2+3.5;hnRUBoards(bx,0,bz,5,2.6,4,0,wd,null,null,.8);hnRUTurf(bx,2.6,bz,5,4,.9,0,.4,'vGableW',wd,6);
 vB('vDarkB',bx,0,bz+2.03,1.6,2,.06,0);
 // scarecrow
 FURNISH('hl_rus_scarecrow',6,0,-2,0);
 vnFolk(-6,6,3,5);}
// Animal pens: a rail paddock with cows and a horse, a wattle fold with sheep, a pig pen, a turf-roofed shelter,
// troughs, a hay rack.
function buildHlRusPens(G,o){reseed(22301+(o.v|0));
 const wd=hC(vPick(HPAL.aged)),dk=hC(vPick(HPAL.tar));
 vnReg('Animal pens (farm)',0,0,13,3.4);
 vB('hPaint',0,-.03,0,26,.06,18,0,hC(0x7a6a4a));
 // rail paddock (-x)
 vnFence(-6.5,0,0,12,16,0,wd,2.5,1.3);for(const [x,z,r,k] of[[-9,-3,.4,'cow'],[-5,2,-1.2,'cow'],[-8,4,2.1,'horse'],[-4,-4,.9,'cow']])hnRUBeast(x,z,r,k);
 hnRUTrough(-2,5.5,Math.PI/2,2.2);
 // shelter: board back, posts, turf shed roof, hay rack
 const sx=-6.5,sz=-6.4;vB('hRUBoardV',sx,0,sz-1.4,8,2.4,.12,0,dk);for(const u of[-4,0,4])vPst('vPost',sx+u*.97,0,sz+1.3,.1,2,dk);
 vnShedRoof(sx,2,sz,8.4,3,.5,0,'hTurfB',hC(vPick(HPAL.turf)),.3,.16);FURNISH('hl_tri_haycock',sx+2,0,sz-.45,0,{v:0});
 // wattle fold (+x, front) with sheep
 const wx=6.5,wz=3.5,ww=11,wdz=8;const C=[[wx-ww/2,wz-wdz/2],[wx+ww/2,wz-wdz/2],[wx+ww/2,wz+wdz/2],[wx-ww/2,wz+wdz/2]];
 for(let i=0;i<4;i++){const a=C[i],b=C[(i+1)%4];if(i===2){hnRUWattle([a[0],0,a[1]],[wx+1,0,b[1]],1);hnRUWattle([wx-1,0,b[1]],[b[0],0,b[1]],1);}else hnRUWattle([a[0],0,a[1]],[b[0],0,b[1]],1);}
 for(let k=0;k<7;k++)hnRUBeast(wx+rr(-4.2,4.2),wz+rr(-2.8,2.8),rr(0,TAU),k<5?'sheep':'goat');
 hnRUTrough(wx+3.5,wz-3,0,1.6);
 // pig pen (+x, back): low plank walls, a little turf hut
 const px=6.5,pz=-5,pw=8,pd=5;for(const [a,b] of[[[px-pw/2,pz-pd/2],[px+pw/2,pz-pd/2]],[[px+pw/2,pz-pd/2],[px+pw/2,pz+pd/2]],[[px+pw/2,pz+pd/2],[px-pw/2,pz+pd/2]],[[px-pw/2,pz+pd/2],[px-pw/2,pz-pd/2]]]){
  const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);kput('vWood',[(a[0]+b[0])/2,.45,(a[1]+b[1])/2],qEuler(0,yaw,0),[.08,.9,L],wd);}
 for(const [x,z] of[[px-pw/2,pz-pd/2],[px+pw/2,pz-pd/2],[px+pw/2,pz+pd/2],[px-pw/2,pz+pd/2]])vPst('vPost',x,0,z,.08,1.05,dk);
 vB('hRUBoardV',px+2.5,0,pz-1,2.2,1.3,1.8,0,wd);hnRUTurf(px+2.5,1.3,pz-1,2.2,1.8,.7,0,.2,'vGableW',wd,3);
 for(let k=0;k<3;k++)hnRUBeast(px-2+k*1.5,pz+rr(-1,1),rr(0,TAU),'pig');hnRUTrough(px-2,pz-1.8,0,1.4);
 vnFolk(0,8.5,2,2);}

const HRU_T=(type,wealth)=>({type,wealth,lit:false});
HL.def({key:'hl_rus_temple',name:'Stave church',branch:'rustic',family:'Temple and hall',tags:Object.assign(HRU_T(['religious'],'civic'),{landmark:true}),w:16,d:26,h:25,build:buildHlRusTemple});
HL.def({key:'hl_rus_hall',name:'Village hall',branch:'rustic',family:'Temple and hall',tags:HRU_T(['civic'],'civic'),w:22,d:40,h:13,build:buildHlRusHall});
HL.def({key:'hl_rus_shops',name:'Shop cottage and stalls',branch:'rustic',family:'Trade and crafts',tags:HRU_T(['market/shop'],'middle'),w:18,d:16,h:7,build:buildHlRusShops});
HL.def({key:'hl_rus_tavern',name:'Rustic inn',branch:'rustic',family:'Trade and crafts',tags:HRU_T(['tavern/inn'],'middle'),w:22,d:20,h:14,build:buildHlRusTavern});
HL.def({key:'hl_rus_smithy',name:'Scrap smithy',branch:'rustic',family:'Trade and crafts',tags:HRU_T(['industry'],'poor'),w:18,d:10,h:7,build:buildHlRusSmithy});
HL.def({key:'hl_rus_muster',name:'Mustering ground',branch:'rustic',family:'Trade and crafts',tags:HRU_T(['military'],'civic'),w:34,d:26,h:9,build:buildHlRusMuster});
HL.def({key:'hl_rus_granary',name:'Stabbur',branch:'rustic',family:'Farms and mills',tags:HRU_T(['farm'],'middle'),w:8,d:10,h:8,build:buildHlRusGranary});
HL.def({key:'hl_rus_mill',name:'Watermill',branch:'rustic',family:'Farms and mills',tags:HRU_T(['farm','industry'],'middle'),w:16,d:24,h:8,build:buildHlRusMill});
HL.def({key:'hl_rus_farmhouse',name:'Einhof farmhouse',branch:'rustic',family:'Farms and mills',tags:HRU_T(['farm','multi-family dwelling'],'middle'),w:26,d:22,h:10,build:buildHlRusFarmhouse});
HL.def({key:'hl_rus_farm',name:'Farm fields',branch:'rustic',family:'Farms and mills',tags:HRU_T(['farm'],'middle'),w:51,d:36,h:3,build:buildHlRusFarm});
HL.def({key:'hl_rus_pens',name:'Animal pens',branch:'rustic',family:'Farms and mills',tags:HRU_T(['farm'],'middle'),w:27,d:19,h:4,build:buildHlRusPens});
