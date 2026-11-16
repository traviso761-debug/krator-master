// prefix: res
// ================================================================= THE MINED GOODS' NODES (3): dug from the ground, peat, quartz sand, alabaster, bitumen
// The kinds are 42s-res-ore-mined.js (Gemini's trade model, 2026-11-16). On the library's sets where the page packs them
// (materials.json: peat ground.peat.hag, bog ground.sphagnum, qsand ground.park_sand tinted white, alabaster stone.alabaster;
// bitumen on the oil seep's tar set), vertex colours where it does not (a building kit reading this file in place).
//   peat        a bog cut: the sphagnum top over a bank of dark peat cut in spade-deep steps, black water in the cut's floor,
//               the turves set up to dry in little footings before it (more with the grade)
//   silica      a sand pit: a white quartz-sand rise cut clean, the trodden floor, washed sand heaped, a washing trough
//   alabaster   a quarry as the marble's: benches of honey-white alabaster, the cut blocks, thin sawn panes leaning on a
//               frame (cut thin, it lets the light through: Fulcrum's palace windows, Gemini's alabaster)
//   bitumen     a pitch lake: a wide skin of dark pitch crept into slow folds, a square cut dug blacker with rain standing in
//               it, the blocks cut out stacked to be carted (dug, not pumped: a mine's, where the oil seep is a derrick's)
RES_LOOK.peat={vein:[0x3a2a1e,0x2e2218,0x4a3626],lump:0x241a14,pile:0x5a4632,water:0x1a1612,bog:0x8a8a4a};
RES_LOOK.silica={vein:[0xf2f0ea,0xe8e4da,0xfaf8f2],lump:0xd8d4cc,pile:0xeeeae2};
RES_LOOK.alabaster={vein:[0xf2ece0,0xe8dcc6,0xf6f0e6],lump:0xf0e6d4,pile:0xe0d6c4,pane:0xf4dcae};
RES_LOOK.bitumen={vein:[0x1e1c1a,0x2a2622,0x34302a],lump:0x121110,pile:0x3a3630,water:0x4a5050};
function resPeat(S,rich){const L=RES_LOOK.peat,pk=resK('peat','earth'),bk=resK('bog','earth'),len=S*1.1,H=S*(.08+.02*rich);
 W(0,0,0,rr(-.3,.3),()=>{
  ellip(bk,0,0,-S*.38,len*.62,H*1.6,S*.36,MAT.bog?0xb8c47a:L.bog,0,16);   /* the bog rising behind the cut */
  box(pk,0,0,-S*.06,len,H,S*.12,resC(pk,L.vein[0]));
  box(pk,0,0,S*.02,len*.96,H*.55,S*.06,resC(pk,L.vein[1]));
  ellip('water',0,0,S*.12,len*.48,.004*S,S*.06,L.water,0,12);
  /* the turves stacked loose to dry in squat heaps (rickles), paler as they dry; more heaps with the grade */
  const nf=2+rich*2,t=.07*S,lay=[0,0,0,0,1,1,2];for(let f=0;f<nf;f++){const x=nf>1?(f/(nf-1)-.5)*len*.8:0,z=S*rr(.34,.46);
   W(x,0,z,rr(0,TAU),()=>{for(let k=0;k<lay.length;k++){const l=lay[k],sp=(1-l*.35)*t*.55;
    box('earth',rr(-1,1)*sp,l*t*.28,rr(-1,1)*sp,t*.7,t*.28,t*.36,pick([0x6a4e36,0x5e4430,0x7a5a3e]),rr(0,TAU));}});}
  for(let k=0;k<rich*4;k++)box(pk,rr(-.4,.4)*len,0,S*rr(.18,.28),.06*S,.025*S,.035*S,resC(pk,L.lump),rr(0,TAU));});}
function resSilica(S,rich){const L=RES_LOOK.silica,sk=resK('qsand','sand');
 W(0,0,0,rr(-.3,.3),()=>{
  ellip(sk,0,0,-S*.3,S*.66,S*(.14+.03*rich),S*.36,resC(sk,L.vein[1]),0,16);
  box(sk,0,0,-S*.08,S*.9,S*(.1+.03*rich),S*.12,resC(sk,L.vein[0]));
  ellip(sk,0,0,S*.12,S*.5,.01*S,S*.16,resC(sk,L.vein[2]),0,14);
  const nh=1+rich*2;for(let h=0;h<nh;h++){const r=(.09+.03*rich)*S*rr(.85,1.1);cone(sk,(h-(nh-1)/2)*S*.32,0,S*.42,r,r*.62,resC(sk,L.pile),12);}
  if(rich)W(S*.42,0,S*.12,PI/2+rr(-.2,.2),()=>{box('wood',0,0,0,.36*S,.06*S,.12*S,P('wood'));ellip('water',0,.06*S,0,.16*S,.004*S,.04*S,0x8aa8b0,0,10);});
  for(let k=0;k<4+rich*4;k++)sph('plain',rr(-.45,.45)*S,0,S*rr(.05,.3),rr(.01,.025)*S,pick([0xf4f2ec,0xd8d0c4,0xe8e6e0]),.7,6);});}
function resAlabaster(S,rich){const L=RES_LOOK.alabaster,ak=resK('alabaster','plain'),steps=2+rich,W0=S,D0=S*.32;
 for(let s=0;s<steps;s++){const h=S*(.1+.02*rich),y=s*h,back=-s*D0*.55;box(ak,0,y,back-D0*.5,W0*(1-s*.12),h,D0,resC(ak,L.vein[s%3]));}
 const nb=1+rich*2;for(let i=0;i<nb;i++){const q=rr(.12,.18)*S;box(ak,rr(-.4,.4)*W0,0,S*rr(.25,.45),q*1.4,q*.7,q,resC(ak,L.lump),rr(-.25,.25));}
 W(-W0*.38,0,S*.5,rr(-.3,.3),()=>{box('wood',-.03*S,0,0,.02*S,.04*S,.2*S,P('woodD'));for(let p=0;p<1+rich;p++)box('glass',p*.04*S,0,0,.012*S,.2*S,.16*S,L.pane,0,0,.18);});
 resLoose(S,3+rich*4,[L.lump,L.pile],'plain');}
function resBitumen(S,rich){const L=RES_LOOK.bitumen,tk=resK('tar','plain'),R=.62*S;
 ellip(tk,0,0,0,R*1.2,.012*S,R,resC(tk,L.vein[1]),rr(0,TAU),18);
 const nf=6+rich*5;for(let i=0;i<nf;i++){const a=rr(0,TAU),r=R*rr(.15,.9);ellip(tk,Math.cos(a)*r*1.05,0,Math.sin(a)*r*.9,R*rr(.18,.3),.02*S*(1+rich*.2),R*rr(.06,.1),resC(tk,L.vein[i%3]),a+PI/2+rr(-.4,.4),10);}
 const cw=R*(.35+.08*rich);box('plain',0,.006*S,R*.2,cw,.008*S,cw*.7,L.lump);ellip('water',0,.016*S,R*.2,cw*.32,.003*S,cw*.2,L.water,0,10);
 const nb=2+rich*3;for(let i=0;i<nb;i++){const q=rr(.07,.1)*S,x=R*rr(.6,.9)*(i%2?1:-1),z=R*rr(.3,.65),y=i%3===2?q*.5:0;box(tk,x,y,z,q*1.3,q*.5,q,resC(tk,L.vein[(i+1)%3]),rr(-.3,.3));}
 for(let i=0;i<2+rich*2;i++){const a=rr(0,TAU),r=R*rr(.2,.8);sph('plain',Math.cos(a)*r,.016*S,Math.sin(a)*r,rr(.008,.016)*S,0x3a3a3a,.5,6);}}
{const node0=resNode;resNode=function(kind,grade){const G=RES_ORE.grades[grade],S=G.size,rich=G.rank;
 if(kind==='peat')return resPeat(S,rich);if(kind==='silica')return resSilica(S,rich);if(kind==='alabaster')return resAlabaster(S,rich);
 if(kind==='bitumen')return resBitumen(S,rich);return node0(kind,grade);};}
Object.assign(RES_NAME,{peat:'Peat cutting',silica:'Quartz sand',alabaster:'Alabaster',bitumen:'Pitch lake'});
Object.assign(RES_H,{peat:.2,silica:.28,alabaster:.62,bitumen:.12});
defBuilding({key:'node-peat-low',seed:6720,...resNodeDef('peat','low')});
defBuilding({key:'node-peat-medium',seed:6721,...resNodeDef('peat','medium')});
defBuilding({key:'node-peat-high',seed:6722,...resNodeDef('peat','high')});
defBuilding({key:'node-silica-low',seed:6730,...resNodeDef('silica','low')});
defBuilding({key:'node-silica-medium',seed:6731,...resNodeDef('silica','medium')});
defBuilding({key:'node-silica-high',seed:6732,...resNodeDef('silica','high')});
defBuilding({key:'node-alabaster-low',seed:6750,...resNodeDef('alabaster','low')});
defBuilding({key:'node-alabaster-medium',seed:6751,...resNodeDef('alabaster','medium')});
defBuilding({key:'node-alabaster-high',seed:6752,...resNodeDef('alabaster','high')});
defBuilding({key:'node-bitumen-low',seed:6760,...resNodeDef('bitumen','low')});
defBuilding({key:'node-bitumen-medium',seed:6761,...resNodeDef('bitumen','medium')});
defBuilding({key:'node-bitumen-high',seed:6762,...resNodeDef('bitumen','high')});
