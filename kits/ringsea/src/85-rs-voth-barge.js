// ---------------------------------------------------------------- vessel: Voth River Barge
// The river barge of the Voth river trade (settlements/voth/src/78d-life-ferries-barges.js, lifeRBargeHull: 50 m x
// 14 m): a flat, boxy, shallow hull; a deckhouse aft and a smaller forecastle house; stacked cargo between; a short
// derrick mast; sweeps at the stern; bargemen.
function buildRsVothBarge(){reseed(73500);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const HULL=lin(0x4a3a28),DARK=lin(0x2a2016),DECK=lin(0x6a5a44),WALL=lin(0x7a6448),ROOF=lin(0x3a2a1c);
 const H=rsHull({L:50,B:14,fb:2.6,dr:1.6,sheerF:.8,sheerA:.6,sp:2.6,pb:3,pa:3,q:.25,n:6,flare:.04,rakeF:3,rakeA:2.2,keelEnd:.8,kp:3});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?DARK:h<.4?DARK:HULL);rsFoam(B,H,1.4);
 const dY=rsDeck(B,H,{bw:.7,col:DECK});rsWale(B,H,.86,.14,'wood',DARK);rsWale(B,H,.6,.12,'wood',DARK);rsSpine(B,H,.24,DARK);
 // the deckhouse aft (Voth's: 0.75 of the beam, 0.19 of the length, 3.5 high) and the forecastle house
 const ax=-18,top=rsCabin(B,{x:ax,y:dY(H.uAt(ax)),w:9.5,d:10.5,h:3.5,wall:WALL,win:5,winCol:0x2a2016,roof:'gable',roofMk:'wood',roofCol:ROOF,rh:1.4,over:.4});
 rsCabin(B,{x:20,y:dY(H.uAt(20)),w:7,d:9,h:2.6,wall:WALL,win:3,winCol:0x2a2016,roof:'flat',roofMk:'wood',roofCol:ROOF,over:.3});
 // the cargo: crates, barrels, sacks and canvas-covered stacks
 for(let i=0;i<34;i++){const x=rr(-11,14),z=rr(-5,5),y=dY(H.uAt(x));const k=i%4;
  if(k===0)rsBox(B,'wood',[2.4,1.8,2.4],[x,y+.9,z],[0,rr(-.2,.2),0],lin(0x7a6a4e));else if(k===1)rsCyl(B,'wood',.6,.6,1.3,[x,y+.65,z],null,lin(0x6a4a30),10);
  else if(k===2)rsSphere(B,'cloth',.55,[x,y+.35,z],[1.2,.6,.8],0xc8b890,8,6);else rsBox(B,'cloth',[3,1.6,2.6],[x,y+.8,z],null,lin(0x9a8a6a));}
 // the derrick mast and its boom, a Voth pennant
 const mx=-4,base=dY(H.uAt(mx));rsLink(B,'wood',[mx,base-.3,0],[mx,base+8,0],.22,DARK,8,.15);rsLink(B,'wood',[mx,base+1.2,0],[mx+7,base+4.5,3],.12,DARK,6);rsRope(B,[mx,base+8,0],[mx+7,base+4.5,3],.03);
 rsPennant(B,[mx,base+8.2,0],2.6,.6,[lin(0x4b2a6e),lin(0xd8cdb4)]);
 // the stern sweeps and the bargemen
 for(const s of[-1,1]){const p=H.pt(.03,s,1);rsLink(B,'wood',[p[0]+1,p[1]+.6,p[2]*.8],[p[0]-6,-.4,p[2]*1.3],.1,DARK,6);}
 for(const [x,z] of[[ax-4,2],[ax+5,-4],[2,5],[10,-4.6],[20,3]])rsFigure(B,[x,x===ax-4?top:dY(H.uAt(x)),z],rr(0,TAU),lin(0x6a5a48),false,0x8a8aa0);
 rsBake(B,V.group,'vothBarge');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'vothBarge',name:'Voth River Barge',culture:'voth',L:58,B:17,H:13,
 tags:{type:['cargo','barge','river'],propulsion:['sweep','pole'],hull:'flat',wealth:'poor',crew:8,role:'river freight'},
 blurb:'The Voth river barge: a flat boxy hull, a deckhouse aft and a forecastle house, stacked cargo, a derrick, stern sweeps.',build:buildRsVothBarge});
