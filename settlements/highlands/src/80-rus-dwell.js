// ================================================================= HIGHLANDS / RUSTIC — dwellings
// The villages north-east of the Republic: Norse and Alpine. Stone is only a footing or a ground storey; above it
// everything is log and board under wide, low shingle gables weighted with stones (Alpine) or steep turf and
// shingle gables with crossed horns (Norse). Balconies with cut-out boards and geraniums; the gable carries a
// painted crest. No electric light anywhere in the branch. Seeds 22000–22199 (this file), 22200–22499 (81).

// ---------------------------------------------------------------- Rustic kit items + helpers (prefix hRU / hnRU)
kdef('hRUBoardV',VBOX,MAT.woodV);                                              // upright boards (board-and-batten walls, staves)
kdef('hRUWater',VBOX,MAT.water);                                               // mill-race, troughs
kdef('hRUCone',VCONE,MAT.paint);                                              // painted cones: horns, tongues, finials
kdef('hRUDisc',new THREE.CylinderGeometry(1,1,1,12),MAT.paint);                // shields, target faces, wheel hubs (centred)
// equal-slope skirt roofs (the stave church's stacked tiers): frusta whose top rectangle is the wall the skirt
// leans on. One item per top/base ratio, named by it.
kdef('hRUSkirtA',vnWedgeGeo(8/12,12/16),MAT.shingle);                          // 8 x 12 core, 2 m skirt
kdef('hRUSkirtB',vnWedgeGeo(5.6/8,9.6/12),MAT.shingle);                        // 5.6 x 9.6 clerestory on the 8 x 12 core
kdef('hRUSkirtC',vnWedgeGeo(.6,.6),MAT.shingle);                               // square tower skirts

// Board-and-batten walls: an upright-board box with battens and painted corner boards.
function hnRUBoards(x,y,z,w,h,d,ry,c,batC,cornC,step){vB('hRUBoardV',x,y,z,w,h,d,ry,c);step=step||.7;const bc=batC||c.clone().multiplyScalar(.78);
 for(const s of[-1,1]){const n=Math.max(1,Math.round(w/step));for(let i=1;i<n;i++){const p=loc(x,z,-w/2+w*i/n,s*(d/2+.02),ry);vB('hRUBoardV',p[0],y,p[1],.08,h,.04,ry,bc);}
  const m=Math.max(1,Math.round(d/step));for(let i=1;i<m;i++){const p=loc(x,z,s*(w/2+.02),-d/2+d*i/m,ry);vB('hRUBoardV',p[0],y,p[1],.04,h,.08,ry,bc);}}
 const cc=cornC||bc;for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2+.03),sz*(d/2+.03),ry);vB('hPaint',p[0],y,p[1],.18,h,.18,ry,cc);}}
// Turf roof (torvtak): a steep-ish gable in turf slabs, the turf-stop log along both eaves, birch-bark edge and
// grass tufts on the slopes. Same signature as hnGable; returns the ridge y.
function hnRUTurf(x,y,z,w,d,pitch,ry,over,endItem,endC,tufts){const top=hnGable(x,y,z,w,d,pitch,ry,'hTurfB',hC(vPick(HPAL.turf)),over,endItem,endC);
 const drop=over*pitch,lc=hC(vPick(HPAL.aged));
 for(const s of[-1,1]){const p=loc(x,z,0,s*(d/2+over-.12),ry);kput('hLogX',[p[0],y-drop+.34,p[1]],qEuler(0,ry,0),[w+2*over,.1,.1],lc);}
 const n=tufts===undefined?Math.round(w*d/5):tufts;
 for(let k=0;k<n;k++){const u=rr(-w/2-over*.6,w/2+over*.6),v=rr(-d/2-over*.7,d/2+over*.7);const p=loc(x,z,u,v,ry);
  kput('vLeaf',[p[0],top-Math.abs(v)*pitch+.24,p[1]],qEuler(0,rng()*TAU,0),[rr(.2,.4),rr(.16,.28),rr(.2,.38)],hC(vPick([0x5f7a3a,0x6f8a44,0x7a8a4a,0x4f6a34])));}
 return top;}
// Dragon heads (Borgund): at each gable apex of a roof laid with hnGable/vnGableRoof (same x,y,z,w,d,rise,ry,over),
// a carved neck curls up and out along the ridge line and ends in an open-jawed head with a red tongue.
function hnRUDragons(x,y,z,w,d,rise,ry,over,c,s){s=s||1;c=c||hC(vPick(HPAL.tar));const N=hRot(ry,[0,0,1]),red=hC(HPAL.red),eye=hC(HPAL.teal);
 for(const sx of[-1,1]){const O=hRot(ry,[sx,0,0]);const a=loc(x,z,sx*(w/2+over-.1),0,ry);const A=[a[0],y+rise+.12,a[1]];
  const P=(o,u)=>[A[0]+O[0]*o*s,A[1]+u*s,A[2]+O[2]*o*s];
  hnMember('hPaint',P(-.3,-.1),P(.45,.55),.3*s,.2*s,N,c);hnMember('hPaint',P(.4,.5),P(1.05,.95),.26*s,.18*s,N,c);hnMember('hPaint',P(1,.93),P(1.35,1.05),.24*s,.18*s,N,c);
  hnOri('hPaint',P(1.6,1.02),O,N,[.62*s,.26*s,.22*s],c);                                                       // snout
  hnMember('hPaint',P(1.35,.88),P(1.85,.72),.1*s,.16*s,N,c);                                                    // lower jaw, open
  kput('hRUCone',P(1.75,.86),qFacing(O).multiply(qEuler(Math.PI/2,0,0)),[.05*s,.42*s,.05*s],red);               // tongue
  for(const sd of[-1,1]){const e=P(1.45,1.16);vBall('hPaintBall',e[0]+N[0]*sd*.12*s,e[1],e[2]+N[2]*sd*.12*s,.055*s,eye);}
  hnMember('hPaint',P(1.3,1.12),P(1.1,1.45),.07*s,.12*s,N,c);}}                                                 // crest curl
// Folk standing on a raised floor (terraces, decks).
function hnRUFolk(x,y,z,n,spread){for(let i=0;i<n;i++){const px=x+rr(-spread,spread),pz=z+rr(-spread,spread);kput('figB',[px,y,pz],qEuler(0,rng()*TAU,0),1,hC(vPick([0xe8d9b8,0xc9442a,0x2f8f8a,0x7a3d8a,0xe0a030,0x3b4a8a,0x8a6a3a])));kput('figH',[px,y,pz],null,1,hC(0xc9a17e));}}
// Carved portal: two tall formline boards as jambs, a crest board as lintel (door is placed separately).
function hnRUPortal(x,y,z,ry,w,h){for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.26),.03,ry);hnForm('hFormV',p[0],y,p[1],ry,.46,h+.1);}
 const p=loc(x,z,0,.04,ry);hnForm('hFormA',p[0],y+h+.08,p[1],ry,w+.9,(w+.9)*.38);}
// Painted round shield hung on a wall face (ry = outward), centred at y: furniture, placed from the catalog (its colours
// are the catalog's; c1, c2 are kept so the callers' random picks stay where they were).
function hnRUShield(x,y,z,ry,r,c1,c2){return hnFurn('hl_rus_shield',x,y-.43,z,ry,{},0,.135);}
// Box-built farm animals facing +z of ry: 'cow' | 'horse' | 'sheep' | 'goat' | 'pig'.
function hnRUBeast(x,z,ry,kind,c){const K={cow:[1.9,.75,.68,.62,.5],horse:[1.8,.7,.55,.85,.62],sheep:[1.0,.52,.5,.34,.3],goat:[.95,.42,.36,.45,.28],pig:[1.1,.5,.5,.28,.34]}[kind]||[1,.5,.5,.4,.3];
 const [L,H,Wd,LG,HD]=K;c=c||hC(vPick({cow:[0x6a4a34,0x8a6a4a,0xe8e0d0,0x3a2e28],horse:[0x5a3a26,0x3a2a20,0x8a6a48,0xb89a70],sheep:[0xe8e2d4,0xd8d0c0,0x4a4038],goat:[0xd8d0c0,0x8a7258,0x4a3a30],pig:[0xe0b0a0,0xc89a88,0x5a4a44]}[kind]||[0x8a6a4a]));
 const P=(u,v)=>loc(x,z,u,v,ry);const dk=c.clone().multiplyScalar(.6);
 let p=P(0,0);vB('hPaint',p[0],LG,p[1],Wd,H,L,ry,c);
 for(const su of[-1,1])for(const sv of[-1,1]){p=P(su*(Wd/2-.08),sv*(L/2-.14));vB('hPaint',p[0],0,p[1],.12,LG+.04,.12,ry,dk);}
 const neckUp=kind==='horse'?.55:kind==='pig'?0:.18;p=P(0,L/2+HD*.35);
 if(kind==='horse'){kput('hPaint',[p[0],LG+H+.2,p[1]],vQ(ry,-.7,0),[.26,.8,.32],c);p=P(0,L/2+.42);vB('hPaint',p[0],LG+H+.36,p[1],.26,.3,.62,ry,c);}
 else{vB('hPaint',p[0],LG+H*.45+neckUp,p[1],HD*.85,HD*.9,HD,ry,kind==='sheep'?dk:c);}
 if(kind==='cow'||kind==='goat'){for(const s of[-1,1]){const q=P(s*HD*.35,L/2+HD*.3);kput('vConeI',[q[0],LG+H*.45+neckUp+HD*.8,q[1]],vQ(ry,-.5,s*.5),[.04,kind==='goat'?.28:.2,.04],hC(0xe0d8c0));}}
 p=P(0,-L/2-.04);kput('hPaint',[p[0],LG+H*.5,p[1]],vQ(ry,.3,0),[.06,H*.9,.06],dk);}
// A hay-drying rack (hesje): posts with wires, hung with hay. Furniture, placed from the catalog (it drew 2 colours).
function hnRUHesje(x,z,ry,L,h){hlRngSkip(2);return FURNISH('hl_rus_hay_rack',x,0,z,ry,{v:L>6.2?1:0});}

// ---------------------------------------------------------------- POOR
// A — Norse turf-roofed log cabin (the "årestue"): low log walls on a few stones, a turf gable to the front whose
// roof runs on over a little porch on two posts, a stone chimney through the turf, a goat on the roof's edge.
function buildHlRusPoorA(G,o){reseed(22001+(o.v|0));const W=6,D=5,F=.3,H=2.3,P=1.6;
 const log=hC(vPick(HPAL.aged)).multiplyScalar(rr(.9,1.05)),dk=log.clone().multiplyScalar(.75);
 vnReg('Turf-roofed log cabin (poor)',0,.5,4.6,F+H+3.4);
 vB('hRubB',0,0,0,W+.2,F,D+.2,0,hC(vPick(HPAL.rubble)));hnLogBox(0,F,0,W,H,D,0,log,.3);
 const pitch=.95,ry=Math.PI/2,top=hnRUTurf(0,F+H,P/2,D+P,W,pitch,ry,.5,'hGableLog',log);
 // porch: plank deck, two posts under the front of the gable, a beam, a bench
 vB('vWood',0,0,D/2+P/2,W-.2,F,P,0,dk);for(const s of[-1,1]){vPst('vPostB',s*(W/2-.25),F,D/2+P-.2,.11,H,log);}
 vB('vWood',0,F+H-.24,D/2+P-.2,W+.1,.24,.24,0,log);
 vnDoor(0,F,D/2,0,.9,1.85,'vWood',log,dk,false);FURNISH('hl_rus_porch_bench',-1.9,F,D/2+.35,0,{v:0});
 vnWin(1.7,F+.95,D/2,0,.6,.6,'shut','vWood',log);for(const z of[-1.2])vnWin(W/2,F+.95,z,Math.PI/2,.6,.6,'open','vWood',log);
 vnStairs(0,0,D/2+P+.3,0,1.2,F,2,'vStone',hC(vPick(HPAL.rubble)));
 vnWin(0,F+H+.8,D/2+P+.02,0,.5,.5,'open','vWood',log);                                          // loft hatch in the gable
 hnStoneChimney(-1.3,F+H-.4,-1,top-F-H-.1,.62);
 hnWoodpile(-W/2-.75,0,.2,Math.PI/2,3.4,1.5);hnBarrel(W/2+.6,0,D/2+.6,.32,.8);
 hnRUBeast(W/2+2.3,-1.2,2.4,'goat');hnRUBeast(W/2+1.6,.6,1.6,'goat');
 vnFence(0,0,1,W+7,D+7,0,hC(vPick(HPAL.aged)),2,1);vnFolk(-1.5,D/2+P+2,1,1);}
// B — the poorest: a board-and-bamboo shack half dug into a sod bank, under a low turf roof, with an open
// woodshed on poles and a salvage stovepipe.
function buildHlRusPoorB(G,o){reseed(22011+(o.v|0));const W=5.2,D=4.2,H=2.1;
 const bam=hC(vPick(HPAL.bamboo)),wd=hC(vPick(HPAL.aged)),turf=hC(vPick(HPAL.turf));
 vnReg('Sod-bank shack (poor)',.6,0,4.6,H+2.6);
 // the bank: turf wedges behind and along both sides, the house cut into it
 kput('hGableTurf',[0,0,-D/2-.2],null,[W+3.4,1.7,5.2],turf);
 for(const s of[-1,1])kput('hGableTurf',[s*(W/2+.1),0,-.6],qEuler(0,Math.PI/2,0),[D+.2,1.25,3],turf);
 // walls: a bamboo-framed front on a board sill, board patches on the sides
 hnBambooBox(0,0,0,W,H-.3,D,0,bam);vB('vWood',0,H-.3,0,W+.2,.3,D+.2,0,wd);
 for(const [u,w] of[[-1.7,1.1],[1.6,1.3]])vB('vWood',u,.08,D/2+.1,w,rr(.9,1.4),.05,0,wd.clone().multiplyScalar(rr(.85,1.1)));
 vnDoor(.1,0,D/2+.12,0,.85,1.8,'vWood',wd,wd,false);vnWin(-1.4,1.1,D/2+.12,0,.55,.5,'open','vWood',wd);
 hnRUTurf(0,H,0,W,D,.62,0,.45,'hGableBM',bam,10);
 vnChimney(1.5,H+.4,-.8,1.5,.1,true);
 // woodshed: four poles, a board shed roof, the winter's wood
 const sx=W/2+1.7;for(const u of[-1,1])for(const v of[-1,1])vPst('vPost',sx+u*.9,0,v*1.4,.07,v<0?2.1:1.7,wd);
 vnShedRoof(sx,1.7,0,2,3,.4,0,'vWood',wd,.25,.08);hnWoodpile(sx,0,-.9,0,1.6,1.3);
 hnBarrel(sx+.4,0,.9,.28,.7);hnBambooRail([-W/2-2.6,0,D/2+2.6],[-W/2-2.6,0,-D/2-1],bam,.9);
 hnFirepit(-W/2-1,0,D/2+1.2,.45);hnRUBeast(-W/2-1.6,-.2,.8,'pig');vnFolk(1,D/2+1.8,1,1);}

// ---------------------------------------------------------------- MIDDLE
// A — Alpine chalet: whitewashed stone ground storey, log upper storey, a wide low gable to the front with two
// tiers of balcony, stones on the shingle, the thunderbird crest in the gable.
function buildHlRusMidA(G,o){reseed(22101+(o.v|0));const W=11,D=10,H1=2.8,H2=2.8;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1,1.25)),white=hC(vPick(HPAL.stucco)),sh=hC(vPick(HPAL.shingle)),trim=hC(vPick([HPAL.red,HPAL.teal,HPAL.white]));
 vnReg('Alpine chalet (middle)',0,0,8.5,H1+H2+5.5);
 vB('hRubB',0,0,0,W+.2,.5,D+.2,0,hC(vPick(HPAL.rubble)));vB('vPlaster',0,.5,0,W,H1-.5,D,0,white);
 for(const u of[-3.2,3.2])vnWin(u,1.1,D/2,0,.9,1.1,'glass','hPaint',trim,true);vnDoor(0,.5,D/2,0,1.1,2.1,'vWood',log,log,false);
 vnStairs(0,0,D/2+.55,0,1.6,.5,2,'vStone',hC(vPick(HPAL.ashlar)));
 for(const z of[-2.5,2.5])vnWin(W/2,1.1,z,Math.PI/2,.8,1,'glass','hPaint',trim,true);
 hnLogBox(0,H1,0,W,H2,D,0,log);
 for(const u of[-3.4,-1.2,1.2,3.4])vnWin(u,H1+.8,D/2,0,.8,1.1,'glass','hPaint',trim,true);
 for(const z of[-2.5,1])vnWin(W/2,H1+.8,z,Math.PI/2,.8,1.1,'glass','hPaint',trim,true);
 const pitch=.58,top=hnGable(0,H1+H2,0,D,W,pitch,Math.PI/2,'vShingleB',sh,1.5,'hGableLog',log);
 for(let k=0;k<12;k++){const zz=rr(-D/2,D/2),xx=rr(.8,W/2);for(const s of[-1,1])kput('vRock',[s*xx,H1+H2+pitch*(W/2-xx)+.28,zz],qEuler(rng(),rng(),0),[.24,.16,.22],hC(vPick(HPAL.rubble)));}   // stones on the shingle
 hnBarge(0,H1+H2,0,D,W,pitch*W/2,Math.PI/2,1.5,log.clone().multiplyScalar(1.2),'horns');
 hnForm('hFormT',0,H1+H2+1.2,D/2+.02,0,2.8,1.3);
 // balconies: across the upper storey front and a small one in the gable
 const rail=log.clone().multiplyScalar(1.5);hnBalcony(0,H1+.05,D/2,0,W-.6,1.3,log,rail);hnBalcony(0,H1+H2+.05,D/2,0,3.4,.9,log,rail,false);
 // purlin ends under the eaves, carved
 for(const u of[-4.5,-1.5,1.5,4.5])vB('vWood',u,H1+H2+pitch*(W/2-Math.abs(u))-.2,D/2+.9,.24,.3,1.8,0,log);
 hnStoneChimney(-2,top-1.6,-2.2,2.2,.7);
 hnWoodpile(W/2+.9,0,0,Math.PI/2,D-2,1.8);FURNISH('hl_rus_porch_bench',-2.2,0,D/2+.9,0,{v:1});             // woodpile under the eave, bench
 hnWaterButt(-W/2-.7,0,D/2-1,.4,1);vnFolk(1,D/2+3,2,1.8);}
// B — Norse falu-red board house on a stone footing: long side to the front, a steep shingle roof with crossed
// horn bargeboards, a cross-gable (ark) over the carved door, white window trim, a turf-roofed stabbur-style
// woodshed at the side.
function buildHlRusMidB(G,o){reseed(22111+(o.v|0));const W=9.4,D=6.6,F=.65,H=2.9;
 const red=hC(vPick(HPAL.falu)),white=hC(HPAL.white),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.7),dark=hC(vPick(HPAL.tar));
 vnReg('Falu-red board house (middle)',0,0,7,F+H+4.6);
 hnSocle(0,0,0,W+.3,F,D+.3,0);hnRUBoards(0,F,0,W,H,D,0,red,red.clone().multiplyScalar(.8),white);
 vB('hPaint',0,F+H-.18,0,W+.12,.18,D+.12,0,white);                                              // painted top plate
 const pitch=1.25,rise=pitch*D/2,top=hnGable(0,F+H,0,W,D,pitch,0,'vShingleB',sh,.6,'hGableLog',red.clone().multiplyScalar(.9));
 hnBarge(0,F+H,0,W,D,rise,0,.6,white,'horns');
 // front: carved portal under a cross gable, four windows in white frames
 const aw=2.6,bz=D/2+1.2;hnRUBoards(0,F,D/2+.5,aw,H+1.9,1.4,0,red,null,white);vnWin(0,F+H+.35,bz,0,.8,.9,'glass','hPaint',white);
 vnDoor(0,F,bz,0,1,2.0,'hPaint',white,dark,false);hnRUPortal(0,F,bz+.04,0,1,2.0);
 for(const s of[-1,1])vnWin(s*aw/2,F+1,D/2+.5,s*Math.PI/2,.4,.9,'glass','hPaint',white);
 for(const u of[-3.6,-2.1,2.1,3.6])vnWin(u,F+.95,D/2,0,.72,1.05,'glass','hPaint',white,false);
 hnGable(0,F+H+1.9,D/2-.8,4,aw,1.1,Math.PI/2,'vShingleB',sh,.35,'hGableLog',red);hnBarge(0,F+H+1.9,D/2-.8,4,aw,1.1*aw/2,Math.PI/2,.35,white,'horns');
 vnStairs(0,0,bz+.5,0,1.8,F,3,'vStone',hC(vPick(HPAL.ashlar)));
 for(const s of[-1,1]){vnWin(s*W/2,F+.95,-1.3,s*Math.PI/2,.72,1.05,'glass','hPaint',white);vnWin(s*W/2,F+H+.9,0,s*Math.PI/2,.6,.8,'glass','hPaint',white);
  hnForm('hFormT',s*(W/2+.02),F+H+1.9,0,s*Math.PI/2,2,1);}
 hnStoneChimney(1.6,top-1.9,-.3,2.4,.62);
 // woodshed: turf-roofed lean-to at the -x gable
 const x0=-W/2-1.1;for(const v of[-1,1])vPst('vPost',x0-.9,0,v*2.2,.08,2,dark);vnShedRoof(x0,2,0,1.9,4.8,.5,-Math.PI/2,'hTurfB',hC(vPick(HPAL.turf)),.2,.14);
 hnWoodpile(x0,0,0,Math.PI/2,4,1.6);
 vnFence(0,0,1,W+7,D+8,0,hC(vPick(HPAL.aged)),2.4,1.1);vnFolk(2,D/2+2.6,2,1.5);}

// ---------------------------------------------------------------- RICH
// A — the big Alpine farmhouse (Bauernhaus): whitewashed stone ground storey, two log storeys with balconies
// wrapping the front and the sunny side, a wide low gable under stones, the painted crest in the gable, and the
// barn under the same ridge behind, with its hay door and a ramp.
function hnRUBalcony(x,y,z,ry,w,d,c,railC,flowers,openEnd){c=c||hC(vPick(HPAL.tar));railC=railC||c;
 const dc=loc(x,z,0,d/2,ry);vB('vWood',dc[0],y-.14,dc[1],w,.14,d,ry,c);
 const n=Math.max(2,Math.round(w/1.4));for(let i=0;i<=n;i++){const u=-w/2+w*i/n;hnMember('vWood',hnOn(x,y-1.1,z,ry,u,.05),hnOn(x,y-.16,z,ry,u,d*.9),.14,.12,hRot(ry,[1,0,0]),c);}
 const fr=loc(x,z,0,d-.03,ry);kput('hLaceB',[fr[0],y+.5,fr[1]],qEuler(0,ry,0),[w-.1,.95,1],railC);vB('vWood',fr[0],y+.98,fr[1],w+.06,.1,.14,ry,c);
 for(const s of[-1,1]){if(s===openEnd)continue;const p=loc(x,z,s*(w/2-.03),d/2,ry);kput('hLaceB',[p[0],y+.5,p[1]],qEuler(0,ry+Math.PI/2,0),[d,.95,1],railC);vB('vWood',p[0],y+.98,p[1],.14,.1,d,ry,c);}
 if(flowers!==false){const fb=loc(x,z,0,d+.12,ry);vB('vWood',fb[0],y+.9,fb[1],w-.4,.22,.22,ry,c);
  for(let k=0;k<Math.round(w*2);k++){const p=loc(x,z,rr(-w/2+.3,w/2-.3),d+.14,ry);kput('vLeaf',[p[0],y+1.14,p[1]],null,[rr(.14,.22),.14,.16],hC(0x3f7a34));
   kput('hPaintBall',[p[0]+rr(-.08,.08),y+1.24,p[1]+rr(-.05,.05)],null,[.08,.07,.08],hC(vPick([0xd0302a,0xe04a3a,0xc02848,0xf0f0f0])));}}}
function buildHlRusRichA(G,o){reseed(22151+(o.v|0));const W=13,D=11,DB=10,H1=3,H2=2.8,H3=2.6;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.05,1.3)),white=hC(vPick(HPAL.stucco)),sh=hC(vPick(HPAL.shingle)),trim=hC(vPick([HPAL.red,HPAL.teal,HPAL.red])),barn=hC(vPick(HPAL.aged));
 const y2=H1,y3=H1+H2,y4=H1+H2+H3,zc=-DB/2;   // roof centre over house + barn
 vnReg('Alpine farmhouse (rich)',0,zc,13,y4+5);
 // house: stone ground storey, two log storeys
 vB('hRubB',0,0,0,W+.24,.6,D+.24,0,hC(vPick(HPAL.rubble)));vB('vPlaster',0,.6,0,W,H1-.6,D,0,white);
 for(const s of[-1,1])for(let k=0;k<5;k++)vB('vStone',s*(W/2-.25),.6+k*.48,D/2+.02,.56,.44,.08,0,hC(vPick(HPAL.ashlar)));   // painted corner quoins
 vnDoor(0,.6,D/2,0,1.3,2.2,'vStone',hC(vPick(HPAL.ashlar)),log,false);vnStairs(0,0,D/2+.6,0,2,.6,2,'vStone',hC(vPick(HPAL.ashlar)));
 hnForm('hFormA',0,2.95,D/2+.03,0,1.8,.8);
 for(const u of[-4.4,-2.3,2.3,4.4])vnWin(u,1.2,D/2,0,.9,1.15,'glass','hPaint',trim,true);
 for(const z of[-3,0,3])vnWin(W/2,1.2,z,Math.PI/2,.9,1.15,'glass','hPaint',trim,true);
 hnLogBox(0,y2,0,W,H2,D,0,log);hnLogBox(0,y3,0,W,H3,D,0,log);
 for(const u of[-4.6,-2.4,-.6,1.2,3,4.8]){vnWin(u,y2+.8,D/2,0,.8,1.15,'glass','hPaint',trim,true);if(Math.abs(u)<4)vnWin(u,y3+.7,D/2,0,.75,1.05,'glass','hPaint',trim,true);}
 for(const z of[-3.2,-1,1.4,3.6]){vnWin(W/2,y2+.8,z,Math.PI/2,.8,1.1,'glass','hPaint',trim,true);vnWin(W/2,y3+.7,z,Math.PI/2,.75,1,'glass','hPaint',trim,true);}
 for(const z of[-3,1])vnWin(-W/2,y2+.8,z,-Math.PI/2,.8,1.1,'glass','hPaint',trim,true);
 // barn behind: aged boards, big doors on the side, a hay ramp at the back
 const bz=-D/2-DB/2;hnRUBoards(0,0,bz,W,y4,DB,0,barn,null,barn.clone().multiplyScalar(.8));
 vB('hRubB',0,0,bz,W+.24,.6,DB+.24,0,hC(vPick(HPAL.rubble)));
 for(const s of[-1,1]){const p=[W/2+.05,0,bz+s*1.4];vB('vDarkB',p[0],0,p[2],.1,3.2,2.4,0);vB('vWood',p[0]+.08,0,p[2],.08,3.1,2.3,0,barn.clone().multiplyScalar(.85));}
 vnWin(W/2,5,bz,Math.PI/2,1.6,1.6,'shut','vWood',barn);
 // the hay ramp (Tenne): an earth ramp with a timber bridge to the loft door at the back
 vB('vDarkB',0,y2,-D/2-DB-.04,3,2.8,.1,0);beam('vWood',[0,.1,-D/2-DB-6.5],[0,y2-.05,-D/2-DB-.1],3,.2,barn);
 for(const t of[.35,.7])for(const s of[-1,1])vPst('vPost',s*1.35,0,-D/2-DB-6.5*(1-t)-.1,.1,y2*t-.1,barn);
 for(const s of[-1,1])hnDeckRail([s*1.5,.1,-D/2-DB-6.5],[s*1.5,y2-.05,-D/2-DB-.1],0,barn,1);
 // one roof over both, ridge running front to back
 const RL=D+DB,pitch=.56,over=1.9,top=hnGable(0,y4,zc,RL,W,pitch,Math.PI/2,'vShingleB',sh,over,'hGableLog',log);
 hnBarge(0,y4,zc,RL,W,pitch*W/2,Math.PI/2,over,log.clone().multiplyScalar(1.3),'horns');
 for(let k=0;k<22;k++){const zz=rr(zc-RL/2,zc+RL/2),xx=rr(.8,W/2+1);for(const s of[-1,1])kput('vRock',[s*xx,y4+pitch*(W/2-xx)+.28,zz],qEuler(rng(),rng(),0),[.26,.17,.24],hC(vPick(HPAL.rubble)));}
 hnForm('hFormT',0,y4+1.15,D/2+.03,0,3.6,1.7);vnWin(-2.4,y4+.3,D/2,0,.6,.8,'glass','hPaint',trim);vnWin(2.4,y4+.3,D/2,0,.6,.8,'glass','hPaint',trim);
 for(const u of[-5.6,-2.8,2.8,5.6])vB('vWood',u,y4+pitch*(W/2-Math.abs(u))-.24,D/2+over/2,.26,.32,over+.2,0,log);   // carved purlin ends
 // balconies: the first floor wraps front + sunny side, the second floor across the front
 const rail=log.clone().multiplyScalar(1.6);
 hnRUBalcony(0,y2+.05,D/2,0,W+.1,1.4,log,rail,true,-1);hnRUBalcony(W/2,y2+.05,.7,Math.PI/2,D-1.6,1.4,log,rail,true);
 hnRUBalcony(0,y3+.05,D/2,0,W-2,1.2,log,rail,true);hnBalcony(0,y4+.05,D/2,0,3.2,.8,log,rail,false);
 // outside stair up the -x side to the first-floor balcony
 const SX=-W/2-.75;vB('vWood',SX,y2-.19,D/2+.7,1.3,.14,1.4,0,log);for(const s of[-1,1])vPst('vPost',SX+s*.55,0,D/2+1.3,.07,y2-.19,log);
 vnStairs(SX,0,D/2-1.4,Math.PI,1.2,y2-.1,10,'vWood',log);
 hnDeckRail([SX-.65,0,D/2-3],[SX-.65,y2-.1,D/2],0,log,1);hnDeckRail([SX-.65,y2-.1,D/2],[SX-.65,y2-.1,D/2+1.4],0,log,1);
 // fountain trough, woodpile, bench, a cow
 FURNISH('hl_rus_fountain_trough',4.35,0,D/2+3,0);
 hnWoodpile(-W/2-.9,0,-2.5,Math.PI/2,5,1.9);FURNISH('hl_rus_porch_bench',2.4,0,D/2+1,0,{v:1});
 hnStoneChimney(-2.2,top-2,-1.5,2.4,.8);hnRUBeast(W/2+3,bz+1,-.4,'cow');hnRUBeast(W/2+3.5,bz-2.4,.3,'cow');
 vnFolk(0,D/2+4,3,2.2);}
// B — the chieftain's hall-house: a long tarred-log hall on a stone footing, dragon-head bargeboards, a steep
// shingle roof with a smoke turret, a gabled porch before a carved portal, shields along the wall, and at one end
// a two-storey "loft" tower with an overhanging gallery and a pyramid roof.
function buildHlRusRichB(G,o){reseed(22161+(o.v|0));const W=18,D=8,F=.7,H=3.2;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.1,1.3)),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.62),trim=hC(HPAL.red),bc=hC(0xb89468);
 vnReg("Chieftain's hall-house (rich)",1,0,12,F+H+8);
 hnSocle(0,0,0,W+.3,F,D+.3,0);hnLogBox(0,F,0,W,H,D,0,tar);
 const pitch=1.2,rise=pitch*D/2,top=hnGable(0,F+H,0,W,D,pitch,0,'vShingleB',sh,.8,'hGableLog',tar);
 hnBarge(0,F+H,0,W,D,rise,0,.8,bc,'horns');hnRUDragons(0,F+H,0,W,D,rise,0,.8,tar.clone().multiplyScalar(1.2),1.1);
 for(const s of[-1,1])hnFrieze(s*(W/4+.9),F+H-.5,D/2+.02,0,W/2-2.6,.45);
 for(const s of[-1,1])hnForm('hFormT',s*(W/2+.02),F+H+1.4,0,s*Math.PI/2,3,1.5);
 // smoke turret on the ridge
 vB('hRUBoardV',-3,top-.3,0,1.2,1,1.2,0,tar);vnGableRoof(-3,top+.7,0,1.6,1.4,.8,0,'vShingleB',sh,.25);
 // porch before the portal: posts, a steep little gable (ridge along z), dragon ends
 const pd=2.6;vB('vWood',0,0,D/2+pd/2,3.6,F,pd,0,tar.clone().multiplyScalar(.8));vnStairs(0,0,D/2+pd+.5,0,2.4,F,3,'vStone',hC(vPick(HPAL.ashlar)));
 const PH=3.4;for(const s of[-1,1])hnTotemPost(s*1.45,F,D/2+pd-.25,.17,PH,0);vB('vWood',0,F+PH,D/2+pd-.25,3.3,.22,.3,0,tar);
 hnGable(0,F+PH+.2,D/2+pd/2-.1,pd+.2,3.4,1.25,Math.PI/2,'vShingleB',sh,.35,'vGableW',tar);hnBarge(0,F+PH+.2,D/2+pd/2-.1,pd+.2,3.4,1.25*1.7,Math.PI/2,.35,bc,'dragon');
 hnForm('hFormT',0,F+PH+.35,D/2+pd+.1,0,2.4,1.2);
 vnDoor(0,F,D/2,0,1.4,2.05,'vWood',tar,tar.clone().multiplyScalar(.7),false);hnRUPortal(0,F,D/2+.03,0,1.4,2.05);
 for(const u of[-6.8,-4.6,4.6])vnWin(u,F+1.1,D/2,0,.7,.8,'shut','hPaint',trim);
 for(const u of[-7.8,-5.7,-3.5,2.7,5.7])hnRUShield(u,F+1.7,D/2,0,.42,hC(vPick([HPAL.red,HPAL.teal,HPAL.white,HPAL.ochre])),hC(vPick([HPAL.black,HPAL.white])));
 // the loft tower at +x: two storeys, the upper oversailing with a gallery, pyramid roof
 const tx=W/2+3.9,tw=4.2,TH1=3.2,TH2=2.8;hnSocle(tx,0,0,tw+.3,F,tw+.3,0);hnLogBox(tx,F,0,tw,TH1,tw,0,tar);
 const ty=F+TH1;vB('vWood',tx,ty-.02,0,tw+1.8,.2,tw+1.8,0,tar);hnLogBox(tx,ty+.18,0,tw,TH2,tw,0,tar,.25);
 for(let k=0;k<4;k++){const a=k*Math.PI/2;const f=loc(tx,0,0,(tw+1.8)/2-.05,a);kput('hLaceB',[f[0],ty+.68,f[1]],qEuler(0,a,0),[tw+1.7,.95,1],bc);vB('vWood',f[0],ty+1.14,f[1],a%Math.PI?.14:tw+1.8,.1,a%Math.PI?tw+1.8:.14,0,tar);}
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',tx+sx*(tw/2+.8),ty+.18,sz*(tw/2+.8),.09,TH2,tar);
 for(let i=0;i<5;i++){const u=-tw/2-.7+i*(tw+1.4)/4;for(const s of[-1,1])hnMember('vWood',[tx+u,ty-1,s*tw/2],[tx+u,ty-.05,s*(tw/2+.8)],.14,.12,[1,0,0],tar);}
 vnWin(tx,ty+1.1,tw/2,0,.6,.8,'shut','hPaint',trim);vnWin(tx+tw/2,F+1.1,0,Math.PI/2,.6,.7,'shut','hPaint',trim);
 vnDoor(tx,F,tw/2,0,.9,1.9,'vWood',tar,tar,false);vnStairs(tx,0,tw/2+.55,0,1.2,F,2,'vStone',hC(vPick(HPAL.ashlar)));
 const ttop=ty+.18+TH2;kput('vPyrSh',[tx,ttop-.3,0],null,[tw+2.6,3.8,tw+2.6],sh);vB('vWood',tx,ttop-.52,0,tw+2.66,.24,tw+2.66,0,tar);
 vPst('vPost',tx,ttop+3.3,0,.07,1.3,tar);kput('vConeI',[tx,ttop+4.5,0],null,[.12,.5,.12],hC(HPAL.red));
 hnStoneChimney(4,top-2.2,-1.2,2.8,.8);
 // yard: firepit, a banner pole, a rack of shields, folk
 hnFirepit(-5,0,D/2+4.5,.8);vnBannerPole(6,0,D/2+3,0,6.5,hC(HPAL.red));hnBarrel(-W/2-.8,0,2,.35,.9);hnBarrel(-W/2-.8,0,1.1,.35,.9);
 vnFolk(-2,D/2+5,3,2.5);}

const HRU_SF={type:['single-family dwelling']},HRU_MF={type:['multi-family dwelling']};
HL.def({key:'hl_rus_house_poor_a',name:'Turf-roofed log cabin',branch:'rustic',family:'Dwellings',tags:Object.assign({wealth:'poor',lit:false},HRU_SF),w:14,d:14,h:7,build:buildHlRusPoorA});
HL.def({key:'hl_rus_house_poor_b',name:'Sod-bank shack',branch:'rustic',family:'Dwellings',tags:Object.assign({wealth:'poor',lit:false},HRU_SF),w:12,d:10,h:5,build:buildHlRusPoorB});
HL.def({key:'hl_rus_house_mid_a',name:'Alpine chalet',branch:'rustic',family:'Dwellings',tags:Object.assign({wealth:'middle',lit:false},HRU_SF),w:15,d:14,h:10,build:buildHlRusMidA});
HL.def({key:'hl_rus_house_mid_b',name:'Falu-red board house',branch:'rustic',family:'Dwellings',tags:Object.assign({wealth:'middle',lit:false},HRU_SF),w:17,d:15,h:9,build:buildHlRusMidB});
HL.def({key:'hl_rus_house_rich_a',name:'Alpine farmhouse',branch:'rustic',family:'Dwellings',tags:Object.assign({wealth:'rich',lit:false},HRU_MF),w:22,d:30,h:14,build:buildHlRusRichA});
HL.def({key:'hl_rus_house_rich_b',name:"Chieftain's hall-house",branch:'rustic',family:'Dwellings',tags:Object.assign({wealth:'rich',lit:false},HRU_SF),w:34,d:18,h:13,build:buildHlRusRichB});
