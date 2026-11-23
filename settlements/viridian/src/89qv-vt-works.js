// ================================================================= VIRIDIAN — the tea works and the herb houses (prefix vt)
// settlements/viridian/PLAN.md sections 4, 5 and 7. The Order of Viridian Thought's head monastery and its master tea and
// herb estate on the Xanadu scarp (the owner, 2026-11-16: "plan the Viridian Thought head monastery / master tea and
// medicinal herb farm"). The Order's own buildings on the Qiblai kit's contract (QB.def, the qn* helpers), in its green
// (QSPOKE[3]). Seeds 34200-34399, settled with the Qiblai kit's session (2026-11-16):
//   34201-34203 withering loft   34211 rolling and firing hall   34221 packing house   34231 tasting room
//   34241 drying house   34251 still-room   34261 curing house   (89qw: 34271-34349, the estate's pieces)
// The dress (PLAN.md question 6, open): VT_DRESS 'wash' is the plan's recommendation, white wash on the working buildings
// and the green on the sacred buildings' upper blocks; 'green' puts the spoke's green on every wall. One line flips it.
const VT_DRESS='wash';
const VT_SP=QSPOKE[3];   /* the green spoke: wall 0x3f7a44, trim saffron, band 0x1f3f24 */
// the colours a builder takes: wall (a working building's), sacred (an upper block of a sacred one), band, trim, chest
function vtC(){const g=xC(VT_SP.wall).multiplyScalar(rr(.96,1.02)),w=xC(xPick(XPAL.wash));
 return{wall:VT_DRESS==='green'?g:w,sacred:g,wash:w,band:xC(VT_SP.band),trim:xC(VT_SP.trim),green:xC(VT_SP.wall),stone:xC(xPick(QSTONE)),
  tim:xC(xPick(XPAL.timber)),dark:xC(xPick(XPAL.dark)),bamboo:xC(0xc8b07a),leaf:xC(0x3a6a34),leaf2:xC(0x4e8040)};}
// a tray of leaf (a shallow bamboo tray on a rack's shelf, the leaf spread on it), centred at (x,y,z) in the frame ry
function vtTray(x,y,z,ry,w,d,C,full){vB('vWood',x,y,z,w,.05,d,ry,C.bamboo);if(full)vB('vClothB',x,y+.05,z,w-.12,.04,d-.12,ry,C.leaf);}
// a rack of n shelves of trays, its posts at the corners, base at y, along local x
function vtRack(x,y,z,ry,w,d,n,C){for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2-.05),sz*(d/2-.05),ry);vB('vWood',p[0],y,p[1],.08,n*.42+.2,.08,ry,C.tim);}
 for(let k=0;k<n;k++)vtTray(x,y+.3+k*.42,z,ry,w-.1,d-.1,C,(k+Math.round(x+z))%3!==0);}
// the Order's victory banner by a range's door: the gyaltsen (qnBanner) with its felt drum in the Order's green
function vtBanner(x,z,h,C){qnBanner(x,0,z,h,null,C.green);}

// ---------------------------------------------------------------- the withering loft
// the flush's leaf is spread on trays and turned in the westerly through louvred walls (PLAN.md section 4: two ranges,
// 60 x 14 m, three floors, on the bench's windward edge). A wash ground storey (the weighing floor, its doors at the front
// and the porters' bench); two upper storeys of timber frame with louvres front and back, the tray racks seen between
// them; a flat roof and the green band. o.v: 0 whole, 1 a shorter one (40 m), 2 with a weighing yard under an awning.
function buildVtWither(G,o){const V=xV(o)%3;reseed(34201+V);const C=vtC(),L=V===1?40:60,D=14,P=.6,h0=3.6,hu=3.0,bay=3;
 vnReg('Withering loft'+(V===1?' (short)':''),0,0,L/2+1,P+h0+2*hu+1.2,{note:'the flush\'s leaf spread on trays and turned in the wind'});
 qnPlinth(0,0,L,D,P,0,C.stone);
 const S=qnStack(0,P,0,L,D,0,[h0],C.wall,'wash');
 qnWins(0,P,0,L,D,0,[h0],S.k,{pitch:4.2,ww:.8,wh:1.0,trim:C.trim,left:false,right:false,skip:[[-L/2+4,-L/2+8],[-2,2],[L/2-8,L/2-4]]});
 for(const u of[-L/2+6,0,L/2-6])qnDoor(u,P,D/2+.02,0,2.0,2.6,{c:C.trim,step:false});
 // the frame storeys: a floor, posts at every bay, louvres in each bay front and back, the end walls washed
 const y1=P+h0,Lu=L*S.k,Du=D*S.k,n=Math.round(Lu/bay);
 for(let s=0;s<2;s++){const yy=y1+s*hu;vB('vWood',0,yy,0,Lu,.18,Du,0,C.dark);
  for(let i=0;i<=n;i++){const x=-Lu/2+Lu*i/n;for(const sz of[-1,1])vB('vWood',x,yy+.18,sz*(Du/2-.1),.22,hu-.18,.22,0,C.tim);
   if(i<n){const xm=x+Lu/n/2;for(const sz of[-1,1])for(let k=0;k<4;k++)kput('vWood',[xm,yy+.7+k*.55,sz*(Du/2-.08)],qEuler(sz*.5,0,0),[Lu/n-.3,.04,.32],C.bamboo);}}
  for(const sx of[-1,1])vB('xWashB',sx*(Lu/2-.15),yy+.18,0,.3,hu-.18,Du,0,C.wall);
  for(let i=0;i<Math.floor(Lu/6);i++)for(const sz of[-1,1])vtRack(-Lu/2+3+i*6,yy+.18,sz*2.4,0,4.2,1.6,5,C);}
 const top=qnRoof(0,y1+2*hu,0,Lu,Du,0,C.wall,{band:C.band,parapet:.55});
 // the louvre vents on the roof: a row of low slatted lanterns
 for(let i=0;i<Math.floor(Lu/10);i++){const x=-Lu/2+5+i*10;vB('vWood',x,top-.5,0,3,.9,2,0,C.tim);vB('xWashB',x,top+.4,0,3.4,.2,2.4,0,C.wall);}
 if(V===2){const az=D/2+3.4;vB('vWood',0,P+2.9,az,18,.14,5,0,C.tim);for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*8.6,0,az+sz*2.2,.08,P+2.9,C.dark);
  for(let k=0;k<5;k++){const x=-6+k*3;vPst('vBarrel',x,0,az,.42,.7,C.bamboo);}   /* the leaf baskets waiting at the scale */
  vB('vIron',0,0,az-1.2,.12,2.2,.12,0,xC(0x2e2a26));vB('vIron',0,2.1,az-1.2,1.6,.08,.08,0,xC(0x2e2a26));}   /* the beam scale */
 vtBanner(-L/2+1.5,D/2+1.2,6.5,C);}
QB.def({key:'qb_vt_wither',name:'Withering loft',family:'Viridian Thought — the tea works',tags:QTAG('middle',['industry'],{job:'warehousing',note:'the tea\'s withering floors: trays in louvred storeys'}),w:62,d:28,h:13,fw:61,fd:15,nv:3,build:buildVtWither});

// ---------------------------------------------------------------- the rolling and firing hall
// one range of two halls under one roof line (PLAN.md section 4: the rolling hall 36 x 14, the firing hall 40 x 16 with
// sixteen charcoal woks and the chimney range): the rolling hall in front, its long face opened in tall windows over the
// twenty tables; the firing hall behind, a stove bench down its length with the woks set in it, a chimney for each pair
// of woks through the roof, the steaming room and the brick presses at its west end
function buildVtRollFire(G,o){reseed(34211);const C=vtC(),W=40,P=.6,Dr=14,Df=16,zr=Df/2,zf=-Dr/2,hR=4.6,hF=5.4;
 vnReg('Rolling and firing hall',0,0,W/2+1,P+hF+3,{note:'the leaf rolled on tables, killed and fired in sixteen woks'});
 qnPlinth(0,0,W,Dr+Df,P,0,C.stone);
 const R=qnStack(0,P,zr,W,Dr,0,[hR],C.wall,'wash');
 qnWins(0,P,zr,W,Dr,0,[hR],R.k,{pitch:3.4,ww:1.4,wh:2.2,sill:.9,trim:C.trim,back:false,left:false,right:false,skip:[[-2,2]]});
 qnDoor(0,P,zr+Dr/2+.02,0,2.4,3.0,{c:C.trim,step:false});
 qnRoof(0,P+hR,zr,R.w,R.d,0,C.wall,{band:C.band,parapet:.55});
 for(let i=0;i<10;i++)for(const sz of[-1,1]){const x=-W/2+3+i*3.7;vB('vWood',x,P,zr+sz*2.6,2.2,.85,1.1,0,C.tim);}   /* the rolling tables (seen through the windows) */
 const F=qnStack(0,P,zf,W,Df,0,[hF],C.wall,'wash');
 qnWins(0,P,zf,W,Df,0,[hF],F.k,{pitch:4,ww:.9,wh:1.2,sill:2.6,trim:C.trim,front:false,left:false,right:false});
 const ft=qnRoof(0,P+hF,zf,F.w,F.d,0,C.wall,{band:C.band,parapet:.55});
 // the stove bench and its woks, and a chimney for each pair through the roof
 vB('vStone',0,P,zf,W-8,.9,2.6,0,C.stone);
 for(let i=0;i<8;i++)for(const sz of[-1,1]){const x=-W/2+6+i*4;kput('vDomeS',[x,P+.95,zf+sz*.65],qEuler(Math.PI,0,0),[.55,.28,.55],xC(0x2e2a26));}
 for(let i=0;i<8;i++){const x=-W/2+6+i*4;qnCube(x,ft-.4,zf,1.0,2.6,1.0,0,C.wall,'wash');vB('vDarkB',x,ft+2.2,zf,.6,.08,.6,0);}
 // the steaming room and the presses: a lower cube at the west end, a brick press and a stack of pressed bricks
 const sx=-W/2-3.2;qnCube(sx,P,zf,6,3.4,9,0,C.wall,'wash');qnRoof(sx,P+3.4,zf,5.8,8.8,0,C.wall,{parapet:.4});
 vB('vWood',sx,0,zf+5.6,1.6,1.4,1.2,0,C.dark);for(let k=0;k<6;k++)vB('vClayB',sx+.6,.1+k*.14,zf+6.6,.3,.12,.2,0,xC(0x4a3a24));
 vB('vSack',W/2+1.4,0,zf-3,1.4,.9,1.2,0,xC(0x3a3632));vB('vSack',W/2+1.4,0,zf-1.4,1.4,.9,1.2,0,xC(0x3a3632));}   /* charcoal by the stoke door */
QB.def({key:'qb_vt_roll_fire',name:'Rolling and firing hall',family:'Viridian Thought — the tea works',tags:QTAG('middle',['industry'],{note:'twenty rolling tables; sixteen woks; the steaming room and the brick presses'}),w:54,d:32,h:10,fw:53,fd:31,nv:1,build:buildVtRollFire});

// ---------------------------------------------------------------- the sorting and packing house
// sieving, winnowing and grading on a ground floor of long tables, the store of graded tea above; in front the winnowing
// yard (two winnowing trays on frames, jars and the bamboo-wrapped bricks stacked for the road), the Order's chests
function buildVtPack(G,o){reseed(34221);const C=vtC(),W=30,D=12,P=.6,hs=[3.4,3.0];
 vnReg('Sorting and packing house',0,0,W/2+1,P+6.4+1,{note:'the tea sieved, graded, jarred and wrapped for the road'});
 qnPlinth(0,-2,W,D,P,0,C.stone);
 const S=qnStack(0,P,-2,W,D,0,hs,C.wall,'wash');
 qnWins(0,P,-2,W,D,0,hs,S.k,{pitch:2.8,ww:.8,wh:1.1,trim:C.trim,skip:[[-1.6,1.6]],val:true});
 qnDoor(0,P,-2+D/2+.02,0,2.0,2.6,{c:C.trim,step:false});
 qnRoof(0,S.y,-2,S.w,S.d,0,C.wall,{band:C.band,parapet:.55});
 qnPave(0,6.6,W,5,0);
 for(const x of[-9,-5]){vB('vWood',x,0,6.6,2.4,.9,1.4,0,C.tim);vB('vWood',x,.9,6.6,2.2,.06,1.2,0,C.bamboo);}   /* the winnowing trays on their frames */
 for(let i=0;i<12;i++)vPst('vClayPot',2+(i%6)*.9,0,5.6+Math.floor(i/6)*.9,.36,.75,xC(0x8a5a3a));   /* the sealed jars */
 for(let i=0;i<9;i++)vB('vWood',9+(i%3)*.8,Math.floor(i/3)*.62,7.2,.7,.6,.7,0,C.green);}   /* the Order's chests, as in Qiblai */
QB.def({key:'qb_vt_pack',name:'Sorting and packing house',family:'Viridian Thought — the tea works',tags:QTAG('middle',['industry'],{job:'warehousing'}),w:31,d:18,h:8,fw:31,fd:13,nv:1,build:buildVtPack});

// ---------------------------------------------------------------- the tasting room
// the buyers' pavilion in the court (PLAN.md section 4): a plinth, posts, a flat roof with the green band and a small gilt
// crown, open on three sides; inside the cupping table, its cups set out in rows to the north light, the grade jars on a
// shelf at the back wall
function buildVtTasting(G,o){reseed(34231);const C=vtC(),W=18,D=12,P=.8,H=3.6,g=xC(xPick(XPAL.gold));
 vnReg('Tasting room',0,0,W/2+1,P+H+2,{note:'the buyers taste the grades here'});
 qnPlinth(0,0,W,D,P,0,C.stone);
 for(let i=0;i<=5;i++)vB('vWood',-W/2+.8+i*(W-1.6)/5,P,D/2-.6,.32,H,.32,0,C.dark);
 for(const sx of[-1,1])for(let i=1;i<4;i++)vB('vWood',sx*(W/2-.8),P,D/2-.6-i*(D-1.2)/4,.32,H,.32,0,C.dark);
 qnCube(0,P,-D/2+.6,W,H,1.2,0,C.sacred,'wash');
 const top=qnRoof(0,P+H,0,W,D,0,C.sacred,{band:C.band,gold:true,parapet:.5});
 qnCrown(0,top,0,W*.3,D*.3,0,{pav:false,deer:false});
 vB('vWood',0,P,0,10,.8,1.4,0,C.dark);
 for(let i=0;i<14;i++)for(const s of[-1,1])vPst('vClayPot',-4.3+i*.66,P+.8,s*.35,.08,.09,xC(0xeee8dc));   /* the cupping bowls */
 for(let i=0;i<9;i++)vPst('vClayPot',-4+i,P+1.2,-D/2+1.45,.18,.4,i%2?C.green:xC(0x8a5a3a));xnFlight(0,0,D/2+.8,0,4,P,'vStone',C.stone);}
QB.def({key:'qb_vt_tasting',name:'Tasting room',family:'Viridian Thought — the tea works',tags:QTAG('civic',['market'],{job:'trading'}),w:19,d:15,h:7,fw:18,fd:12,nv:1,build:buildVtTasting});

// ---------------------------------------------------------------- the herb drying house
// two open halls of slatted racks either side of a whitewashed court (PLAN.md section 5; the form shared with Kirstabal's
// latex house), a closed store at the back with a smoke-free stove for the wet months, the court laid with drying mats
function buildVtDrying(G,o){reseed(34241);const C=vtC(),W=40,D=30,P=.5,Hh=4.2;
 vnReg('Herb drying house',0,0,W/2+1,P+Hh+2,{note:'the simples dried on racks in the shade and the wind'});
 qnPlinth(0,0,W,D,P,0,C.stone);qnPave(0,2,W-16,D-12,0,P);
 for(const s of[-1,1]){const x=s*(W/2-4);   /* the two open halls along the court's sides */
  for(let i=0;i<=6;i++){const z=-D/2+1+i*(D-2)/6;for(const e of[-1,1])vB('vWood',x+e*3.4,P,z,.24,Hh,.24,0,C.tim);}
  const r=qnRoof(x,P+Hh,0,7.6,D-1,0,C.wall,{band:C.band,parapet:.4});
  for(let i=0;i<6;i++){const z=-D/2+3.3+i*(D-2)/6;vtRack(x,P,z,Math.PI/2,3.6,5.2,7,C);}
  for(let k=0;k<8;k++)kput('qGiltBall',[x-s*2.9,P+3.2,-D/2+3+k*3.3],null,[.25,.6,.25],k%2?C.leaf:C.leaf2);}   /* bunches hung from the eaves */
 const Sb=qnStack(0,P,-D/2+3,W-16,6,0,[3.8],C.wall,'wash');qnRoof(0,P+3.8,-D/2+3,Sb.w,Sb.d,0,C.wall,{band:C.band,parapet:.5});
 qnWins(0,P,-D/2+3,W-16,6,0,[3.8],Sb.k,{pitch:3,ww:.7,wh:.9,trim:C.trim,back:false,left:false,right:false,skip:[[-1.4,1.4]]});
 qnDoor(0,P,-D/2+6.02,0,1.8,2.4,{c:C.trim,step:false});qnCube(W/2-12,P+3.8,-D/2+1.4,.8,1.8,.8,0,C.wall,'wash');
 for(let i=0;i<5;i++)for(let j=0;j<3;j++)vB('vClothB',-6+i*3,P+.02,0+j*3.4,2.4,.02,2.6,0,xC(0xb8a070));   /* the mats */
 for(let i=0;i<10;i++)vB('vClothB',-5.4+(i%5)*3,P+.04,Math.floor(i/5)*3.4,1.8,.06,1.8,0,i%3?C.leaf2:C.leaf);}   /* the leaf spread on them */
QB.def({key:'qb_vt_drying',name:'Herb drying house',family:'Viridian Thought — the herbs',tags:QTAG('poor',['industry','farm'],{job:'healing'}),w:41,d:31,h:7,fw:40,fd:30,nv:1,build:buildVtDrying});

// ---------------------------------------------------------------- the still-room and dispensary
// a two-storey cube (PLAN.md section 5): the stills and the syrup kitchen behind, the camphor steam-still in a side yard
// under a lean-to (its copper head and worm), the dispensary's counter window on the front under an awning with the
// drawers of simples seen behind it, the Bitter Room a windowless locked cube at the back corner
function buildVtStill(G,o){reseed(34251);const C=vtC(),W=22,D=16,P=.6,hs=[3.6,3.2],cu=xC(0xb06a3a);
 vnReg('Still-room and dispensary',0,0,W/2+5,P+6.8+3,{note:'the remedies compounded and given; the Bitter Room locked'});
 qnPlinth(-3,0,W,D,P,0,C.stone);
 const S=qnStack(-3,P,0,W,D,0,hs,C.wall,'wash');
 qnWins(-3,P,0,W,D,0,hs,S.k,{pitch:2.8,ww:.8,wh:1.1,trim:C.trim,skip:[[-5,1]],val:true});
 qnDoor(1.8,P,D/2+.02,0,1.6,2.4,{c:C.trim,step:false});
 vB('vWinLit',-5.4,P+1.0,D/2+.04,4.0,1.3,.08,0);vB('vWood',-5.4,P+.9,D/2+.4,4.4,.12,.8,0,C.dark);   /* the counter window */
 for(let i=0;i<6;i++)for(let j=0;j<3;j++)vB('vWood',-7.1+i*.7,P+1.05+j*.42,D/2-.3,.62,.36,.3,0,C.tim);   /* the drawers of simples behind it */
 vB('vClothB',-5.4,P+2.7,D/2+.9,5,.06,1.8,0,C.green);for(const s of[-1,1])vPst('vPost',-5.4+s*2.4,P,D/2+1.75,.05,2.7,C.dark);
 const top=qnRoof(-3,S.y,0,S.w,S.d,0,C.wall,{band:C.band,parapet:.55});
 qnCube(-3+W/2-3,top-.3,-D/2+3,1.2,3,1.2,0,C.wall,'wash');vB('vDarkB',-3+W/2-3,top+2.62,-D/2+3,.7,.06,.7,0);   /* the stills' flue */
 // the Bitter Room: a low windowless cube at the back corner, an iron-bound door
 qnCube(-3-W/2+3,P,-D/2-2,5,3,4,0,C.wall,'wash');qnRoof(-3-W/2+3,P+3,-D/2-2,4.9,3.9,0,C.wall,{parapet:.35});vB('vIron',-3-W/2+3,P,-D/2-4.04,1.1,2,.08,0,xC(0x2e2a26));
 // the camphor still in the side yard: a lean-to on posts, the stone firebox, the copper head and its worm to the tub
 const yx=W/2+.6,yz=-1;vB('vWood',yx,P+3.1,yz,6,.14,8,0,C.tim);for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',yx+sx*2.7,P,yz+sz*3.7,.07,3.1,C.dark);
 vB('vStone',yx,P,yz-1.5,1.8,1.1,1.8,0,C.stone);kput('vDomeC',[yx,P+1.1,yz-1.5],null,[.75,1.1,.75],cu);
 kput('vPipeC',[yx,P+2.0,yz-1.5],qEuler(Math.PI/2.6,0,0),[.07,2.6,.07],cu);vPst('vTank',yx,P,yz+1.6,.6,1.1,C.tim);
 for(let i=0;i<4;i++)vPst('vClayPot',yx-1.8+i*1.2,P,yz+3.2,.25,.55,xC(0x8a5a3a));}
QB.def({key:'qb_vt_still',name:'Still-room and dispensary',family:'Viridian Thought — the herbs',tags:QTAG('civic',['civic','industry'],{job:'healing'}),w:33,d:25,h:10,fw:31,fd:22,nv:1,build:buildVtStill});

// ---------------------------------------------------------------- the curing house
// a cool, dark store half sunk into the slope (PLAN.md section 5): the roots' cellar (ginseng and madder in sand beds),
// a low wash cube over it with vents, a ramp down to the cellar door, no windows but the slit vents
function buildVtCuring(G,o){reseed(34261);const C=vtC(),W=20,D=14;
 vnReg('Curing house',0,0,W/2+1,4.2,{note:'the roots cured in sand beds in the dark'});
 vB('vStone',0,-1.2,0,W,1.6,D,0,C.stone);
 const S=qnStack(0,.4,0,W,D,0,[2.8],C.wall,'wash');qnRoof(0,3.2,0,S.w,S.d,0,C.wall,{band:C.band,parapet:.45});
 for(let i=0;i<5;i++)for(const sz of[-1,1])vB('vDarkB',-8+i*4,1.8,sz*(D/2+.01),.6,.18,.04,0);   /* the slit vents */
 for(let i=0;i<3;i++)qnCube(-6+i*6,3.2,0,.8,1.2,.8,0,C.wall,'wash');
 vB('vStone',0,-1.2,D/2+2.2,3,.2,4.4,0,C.stone);for(const s of[-1,1])vB('vStone',s*1.6,-1.2,D/2+2.2,.3,1.6,4.4,0,C.stone);
 qnDoor(0,-1.0,D/2+.02,0,1.4,2.1,{c:C.trim,step:false,val:false});}
QB.def({key:'qb_vt_curing',name:'Curing house',family:'Viridian Thought — the herbs',tags:QTAG('poor',['industry'],{job:'healing'}),w:21,d:24,h:5,fw:20,fd:15,nv:1,build:buildVtCuring});
