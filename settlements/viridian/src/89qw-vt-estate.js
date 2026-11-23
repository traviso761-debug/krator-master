// ================================================================= VIRIDIAN — the estate's pieces (prefix vt)
// settlements/viridian/PLAN.md sections 5 and 6: the physic garden, a sample of the tea terraces, the grove's shade house
// and log yard, the spring house, the dry garden's grange, the High Garden's pluckers' shelter, a cloud hermitage. On the
// Qiblai kit's contract (QB.def), the colours from 89qv (vtC). Seeds:
//   34271 shade house   34281 log yard   34291 spring house   34301 grange   34311 shelter   34321-34323 hermitage
//   34331-34332 tea terrace plot   34341 physic garden
// The hedges and beds drawn here are the sheet's sample of each; on the page the estate's hedges and beds are placed by the
// estate's records (PLAN.md step V4: KRELIEF.terraces' treads, kits/crops' records, KRAND), not by these builders.

// a clipped tea hedge along local x, length L, its top at y+h: a row of overlapping leaf masses (the Qiblai city house's
// tea beds are the same form: qnTeaTouches)
function vtHedge(x,y,z,ry,L,h,C){const n=Math.max(2,Math.round(L/.8));for(let i=0;i<n;i++){const u=-L/2+L*(i+.5)/n,p=loc(x,z,u,0,ry);
 kput('qGiltBall',[p[0],y+h*.55,p[1]],null,[.55,h*.55,.6],(i+Math.round(x))%3?C.leaf:C.leaf2);}}
// a prayer-flag pole (a darchor): a pole h tall with the five colours hung down it in a column, base at the ground at (x,z).
// Stands in for qnFlags on the small records: xnPennants' rope is drawn half its length past its far end (a vRope geometry
// based at 0 under beam(), which centres; PLAN.md, "Found on the way")
function vtFlagPole(x,z,h,C){vPst('vPost',x,0,z,.05,h,C.dark);vBall('xGold',x,h+.06,z,.08,xC(XPAL.gold[0]));
 const cols=[0x2a5aa8,0xf4efe4,0xa8382a,0x2f7a4a,0xe8a030];for(let k=0;k<5;k++)vB('vClothB',x+.2,h-.55-k*.5,z,.36,.42,.02,0,xC(cols[k]));}
// a bed of herbs w x d: a stone kerb, the plants in rows (a herb's leaf mass, its flower colour on top every other one)
function vtBed(x,y,z,w,d,c,flower,C){vB('vStone',x,y,z,w,.22,d,0,C.stone);vB('vClayB',x,y+.22,z,w-.3,.05,d-.3,0,xC(0x4a3a28));
 for(let r=0;r<Math.max(1,Math.floor((w-.4)/.7));r++)for(let k=0;k<Math.max(1,Math.floor((d-.4)/.6));k++){const px=x-w/2+.5+r*.7,pz=z-d/2+.5+k*.6;
  kput('qGiltBall',[px,y+.42,pz],null,[.26,.22,.26],c);if((r+k)%2&&flower!=null)vBall('vBall',px,y+.66,pz,.08,xC(flower));}}

// ---------------------------------------------------------------- the shade house
// a lath house over the ginseng beds where the camphor grove is thin (PLAN.md section 5: ginseng wants deep shade): posts,
// a roof of laths spaced their own width apart, two long beds under it
function buildVtShade(G,o){reseed(34271);const C=vtC(),W=24,D=12,H=2.6;
 vnReg('Shade house',0,0,W/2+.5,H+.3,{note:'the ginseng beds under laths'});
 for(let i=0;i<=6;i++)for(const s of[-1,0,1])vPst('vPost',-W/2+.3+i*(W-.6)/6,0,s*(D/2-.3),.06,H,C.dark);
 for(const s of[-1,0,1])vB('vWood',0,H,s*(D/2-.3),W,.1,.12,0,C.dark);
 for(let i=0;i<Math.floor(W/.5);i++)vB('vWood',-W/2+.25+i*.5,H+.1,0,.22,.04,D,0,C.bamboo);
 for(const s of[-1,1])vtBed(0,0,s*2.8,W-1.6,3.4,xC(0x2e5a2a),0xc83a2a,C);}   /* ginseng: dark leaf, its red berries */
QB.def({key:'qb_vt_shade',name:'Shade house (ginseng)',family:'Viridian Thought — the herbs',tags:QTAG('poor',['farm'],{job:'farming'}),w:24.5,d:12.5,h:3,fw:24,fd:12,nv:1,build:buildVtShade});

// ---------------------------------------------------------------- the log yard
// the inoculated logs of the moon caps and the rainbow brackets (PLAN.md section 5), stacked in cribs under a long thatch
// roof on posts in the grove's shade, a soaking trough at one end
function buildVtLogYard(G,o){reseed(34281);const C=vtC(),W=30,D=8,H=2.8,bark=xC(0x5a4632),thatch=xC(0x9a8458);
 vnReg('Log yard',0,0,W/2+.5,H+1,{note:'moon caps and rainbow brackets grown on logs'});
 for(let i=0;i<=5;i++)for(const s of[-1,1])vPst('vPost',-W/2+.6+i*(W-1.2)/5,0,s*(D/2-.5),.08,H,C.dark);
 vB('vThatchB',0,H,0,W,.45,D,0,thatch);
 for(let c=0;c<6;c++){const cx=-W/2+3+c*4.3;   /* a crib: logs laid crosswise in alternating courses */
  for(let k=0;k<5;k++)for(let j=0;j<3;j++){const y=.12+k*.2;
   if(k%2)kput('vPost',[cx-.9+j*.9,y,-1.2],qEuler(Math.PI/2,0,0),[.1,2.4,.1],bark);else kput('vPost',[cx+1.2,y,-.9+j*.9],qEuler(0,0,Math.PI/2),[.1,2.4,.1],bark);}
  for(let m=0;m<6;m++)vBall('vBall',cx-.8+(m%3)*.8,.2+Math.floor(m/3)*.4,-.02,.09,m%2?xC(0xe8a8c0):xC(0xd8803a),.05);}   /* the caps (pink) and brackets (banded orange) */
 vB('vStone',W/2-1.6,0,0,2.4,.6,D-2,0,C.stone);vB('xWaterB',W/2-1.6,.5,0,2.1,.04,D-2.3,0,xC(XPAL.water));}
QB.def({key:'qb_vt_log_yard',name:'Log yard',family:'Viridian Thought — the herbs',tags:QTAG('poor',['farm'],{job:'fungiculture'}),w:31,d:9,h:3.5,fw:30,fd:8,nv:1,build:buildVtLogYard});

// ---------------------------------------------------------------- the spring house
// the estate's water at the hollow's head (PLAN.md section 6, question 3): a small wash cube over the spring with a green
// band and a gilt finial, the stone tank in front, the rill leaving it down the slope, a wayside chorten beside it
function buildVtSpring(G,o){reseed(34291);const C=vtC(),P=.4,g=xC(xPick(XPAL.gold));
 vnReg('Spring house',0,0,7,5.6,{note:'the spring the estate\'s rills run from'});
 qnPlinth(0,-2,7,6,P,0,C.stone);const S=qnStack(0,P,-2,7,6,0,[3.2],C.sacred,'wash');
 const t=qnRoof(0,P+3.2,-2,S.w,S.d,0,C.sacred,{band:C.band,gold:true,parapet:.45});vBall('xGold',0,t+.2,-2,.25,g);
 qnDoor(0,P,1.02,0,1.2,2.0,{c:C.trim,step:false,val:false});
 vB('vStone',0,0,3.4,6,.9,3.2,0,C.stone);vB('xWaterB',0,.82,3.4,5.4,.05,2.6,0,xC(XPAL.water));
 vB('vStone',0,0,5.6,.9,.5,1.4,0,C.stone);vB('xWaterB',0,.42,5.7,.5,.04,1.4,0,xC(XPAL.water));   /* the rill's head */
 qnChorten(-4.8,0,3.6,.32);}
QB.def({key:'qb_vt_spring',name:'Spring house and cistern',family:'Viridian Thought — the estate',tags:QTAG('civic',['infrastructure','religious']),w:12,d:13,h:6,fw:12,fd:12,nv:1,build:buildVtSpring});

// ---------------------------------------------------------------- the dry garden's grange
// the outstation on the rain-shadow spur, 6 km from the house (PLAN.md section 5): a walled yard, the lodge (two storeys,
// ten brothers), an open drying shed along one wall, a gate with the Order's banner, and a bed of the dry herbs by the gate
function buildVtGrange(G,o){reseed(34301);const C=vtC(),W=30,D=24,wh=2.2;
 vnReg('Dry garden grange',0,0,W/2+1,7,{note:'the dry garden\'s lodge and drying shed'});
 for(const s of[-1,1]){vB('xWashB',s*(W/2-.3),0,0,.6,wh,D,0,C.wash);vB('xBandB',s*(W/2-.3),wh,0,.66,.22,D,0,C.band);}
 vB('xWashB',0,0,-D/2+.3,W,wh,.6,0,C.wash);vB('xBandB',0,wh,-D/2+.3,W,.22,.66,0,C.band);
 for(const s of[-1,1]){vB('xWashB',s*(W/4+1.5),0,D/2-.3,W/2-3,wh,.6,0,C.wash);vB('xBandB',s*(W/4+1.5),wh,D/2-.3,W/2-3,.22,.66,0,C.band);}
 for(const s of[-1,1])qnCube(s*2.2,0,D/2-.3,.9,3.2,.9,0,C.wash,'wash');vtBanner(4,D/2+.8,5,C);
 const L=qnStack(-6,0,-D/2+4.4,14,7.6,0,[3.2,2.8],C.wall,'wash');
 qnWins(-6,0,-D/2+4.4,14,7.6,0,[3.2,2.8],L.k,{pitch:2.6,ww:.7,wh:.9,trim:C.trim,back:false,skip:[[-1.2,1.2]]});
 qnDoor(-6,0,-D/2+8.22,0,1.4,2.2,{c:C.trim,step:false});qnRoof(-6,L.y,-D/2+4.4,L.w,L.d,0,C.wall,{band:C.band,parapet:.5});
 for(let i=0;i<=4;i++)for(const e of[-1,1])vPst('vPost',W/2-4+e*2.6,0,-D/2+3+i*4.2,.07,2.8,C.dark);
 vB('vWood',W/2-4,2.8,-D/2+11.4,6,.14,17.4,0,C.tim);for(let i=0;i<4;i++)vtRack(W/2-4,0,-D/2+5+i*4.2,Math.PI/2,3,4,5,C);
 vtBed(-6,0,3.2,8,4,xC(0x9aa88a),0x8a5aa8,C);vtBed(-6,0,8,8,3,xC(0x6a7a4a),0xe8a030,C);}   /* monk's sage (silver), saffron (its violet flowers); the poppy and the rest */
QB.def({key:'qb_vt_grange',name:'Dry garden grange',family:'Viridian Thought — the estate',tags:QTAG('poor',['farm','multi-family dwelling'],{job:'farming'}),w:31,d:27,h:7,fw:30,fd:24,nv:1,build:buildVtGrange});

// ---------------------------------------------------------------- the pluckers' shelter
// in the High Garden (PLAN.md section 4): a small cube with an open lean-to on its front where the monks leave their back
// baskets and take their tea at noon, a small chorten and flags on the terrace's edge
function buildVtShelter(G,o){reseed(34311);const C=vtC();
 vnReg('Pluckers\' shelter',0,0,5,4.5,{note:'the High Garden\'s noon rest; the baskets\' rack'});
 const S=qnStack(0,0,-1.8,6,3.6,0,[2.8],C.sacred,'wash');qnRoof(0,2.8,-1.8,S.w,S.d,0,C.sacred,{band:C.band,parapet:.4});
 qnDoor(0,0,.02,0,1.1,2.0,{c:C.trim,step:false,val:false});
 vB('vWood',0,2.4,1.4,6,.12,2.8,0,C.tim);for(const s of[-1,1])vPst('vPost',s*2.8,0,2.6,.07,2.4,C.dark);
 vB('vWood',2,.5,2.4,2.6,.08,.5,0,C.tim);for(let i=0;i<4;i++)vPst('vBarrel',.9+i*.7,.58,2.4,.24,.5,C.bamboo);
 qnChorten(-3.6,0,2.6,.22);vtFlagPole(-3.6,1.2,4.2,C);}
QB.def({key:'qb_vt_shelter',name:'Pluckers shelter',family:'Viridian Thought — the estate',tags:QTAG('poor',['farm','religious'],{job:'farming'}),w:10,d:8,h:4,fw:9,fd:7,nv:1,build:buildVtShelter});

// ---------------------------------------------------------------- a cloud hermitage
// a cell on the scarp's face in the cloud bank (PLAN.md section 6, question 8): one small cube with its door and one
// window, a ledge of a terrace in front, prayer flags strung to a pole. o.v: three cells differing in height and flags
function buildVtHermitage(G,o){const V=xV(o)%3;reseed(34321+V);const C=vtC(),h=2.6+V*.3;
 vnReg('Cloud hermitage',0,0,3.4,h+1.8,{note:'a cell in the cloud on the scarp'});
 qnPlinth(0,0,5,5,.5,0,C.stone);const S=qnStack(0,.5,-.4,3.6,3.2,0,[h],C.wash,'wash');
 qnRoof(0,.5+h,-.4,S.w,S.d,0,C.wash,{band:C.band,parapet:.35});
 qnDoor(-.6,.5,1.22,0,.8,1.8,{c:C.trim,step:false,val:false});xnTibWin(.9,.5+1.1,1.22,0,.5,.6,'lit',C.trim,{noVal:true});
 vtFlagPole(1.9,1.9,3.9,C);}
QB.def({key:'qb_vt_hermitage',name:'Cloud hermitage',family:'Viridian Thought — the estate',tags:QTAG('poor',['religious']),w:6,d:6,h:4.5,fw:5,fd:5,nv:3,build:buildVtHermitage});

// ---------------------------------------------------------------- a tea terrace (the sheet's sample)
// two treads of the Low Garden (o.v 0) or the High Garden (o.v 1) with their riser between (PLAN.md section 6: at 16-18 %
// a 1.4 m rise gives a 7.8 m tread of three hedge rows; the High Garden's risers stone-faced, the Low Garden's earth), the
// rill along each tread's inner edge, a path across. On the page the terraces are KRELIEF.terraces and the hedges V4's
function buildVtTerracePlot(G,o){const V=xV(o)%2;reseed(34331+V);const C=vtC(),W=24,T=7.8,R=1.4,soil=xC(0x5a4632),faceC=V?C.stone:xC(0x6a5236);
 vnReg('Tea terrace ('+(V?'High':'Low')+' Garden)',0,0,W/2,R+1.4,{note:'two treads of clipped tea, the rill at the inner edge'});
 for(let t=0;t<2;t++){const y=t*R,zc=T/2-t*T;
  if(t)vB(V?'vStone':'vClayB',0,0,zc,W,y,T,0,faceC);vB('vClayB',0,y,zc,W,.08,T,0,soil);   /* the upper tread's fill, its front the riser */
  for(let r=0;r<3;r++)vtHedge(0,y+.08,zc+T/2-1.6-r*2.1,0,W-1.6,1.0,C);
  vB('vStone',0,y+.08,zc-T/2+.4,W,.12,.5,0,C.stone);vB('xWaterB',0,y+.12,zc-T/2+.4,W,.04,.28,0,xC(XPAL.water));}   /* the rill */
 for(let k=0;k<4;k++)vB('vStone',-W/2+1.2,k*.35,1.4-k*.4,1.4,.35,.4,0,C.stone);}   /* the path's steps up the riser (the upper tread's fill is the riser, at z 0) */
QB.def({key:'qb_vt_terrace_plot',name:'Tea terrace (sample)',family:'Viridian Thought — the estate',tags:QTAG('poor',['farm'],{job:'farming'}),w:24.5,d:16,h:3,fw:24,fd:16,nv:2,build:buildVtTerracePlot});

// ---------------------------------------------------------------- the physic garden
// the wet herbs' walled garden behind the cloister (PLAN.md sections 5 and 6, the brief's "herb gardens"): eight beds in two
// rows of four either side of a rill that runs down the garden's axis from a small pavilion at its head, the nursery's
// cuttings beds along the back wall, the low wash wall with its green band, the gate at the foot. The eight beds' plants
// here are a sample (leaf colour and flower); on the page each bed's crop is picked from kits/crops (V4)
const VT_BEDS=[[0x2e5a2a,0xc83a2a],[0x4e7a3c,null],[0x6a8e4a,0xf6f2ea],[0x3a6a34,0xe8a8c0],[0x5a7a3a,0xe8c040],[0x2f5a3a,null],[0x7a8a5a,0x8a5aa8],[0x4a6a3a,0xa8382a]];
function buildVtPhysic(G,o){reseed(34341);const C=vtC(),W=60,D=78,wh=2.0,g=xC(xPick(XPAL.gold));
 vnReg('Physic garden',0,0,W/2+1,6,{note:'eight beds of the wet herbs and the nursery'});
 for(const s of[-1,1]){vB('xWashB',s*(W/2-.3),0,0,.6,wh,D,0,C.wash);vB('xBandB',s*(W/2-.3),wh,0,.66,.24,D,0,C.band);}
 vB('xWashB',0,0,-D/2+.3,W,wh,.6,0,C.wash);vB('xBandB',0,wh,-D/2+.3,W,.24,.66,0,C.band);
 for(const s of[-1,1]){vB('xWashB',s*(W/4+1.5),0,D/2-.3,W/2-3,wh,.6,0,C.wash);vB('xBandB',s*(W/4+1.5),wh,D/2-.3,W/2-3,.24,.66,0,C.band);}
 for(const s of[-1,1])qnCube(s*2.2,0,D/2-.3,1,3,1,0,C.sacred,'wash');
 qnPave(0,0,3.4,D-14,0,0);vB('vStone',0,0,2,1.4,.18,D-18,0,C.stone);vB('xWaterB',0,.16,2,.9,.04,D-18.2,0,xC(XPAL.water));   /* the axis path and its rill */
 for(let i=0;i<8;i++){const s=i<4?-1:1,k=i%4,bx=s*13,bz=-D/2+19+k*13.5;vtBed(bx,0,bz,19,10,xC(VT_BEDS[i][0]),VT_BEDS[i][1],C);}
 for(let i=0;i<10;i++)vtBed(-W/2+4+i*5.6,0,-D/2+4.6,4.6,4.4,xC(0x3a6a34),null,C);   /* the nursery: tea cuttings */
 // the pavilion at the head of the axis, over the rill's source
 const pz=-D/2+11.5;qnPlinth(0,pz,7,6,.6,0,C.stone);for(const sx of[-1,1])for(const sz of[-1,1])vB('vWood',sx*2.8,.6,pz+sz*2.3,.3,3,.3,0,C.dark);
 const t=qnRoof(0,3.6,pz,7,6,0,C.sacred,{band:C.band,gold:true,parapet:.4});vBall('xGold',0,t+.25,pz,.3,g);}
QB.def({key:'qb_vt_physic',name:'Physic garden',family:'Viridian Thought — the herbs',tags:QTAG('civic',['farm','religious'],{job:'healing'}),w:61,d:79,h:6,fw:60,fd:78,nv:1,build:buildVtPhysic});
