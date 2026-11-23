// ---------------------------------------------------------------- vessel: Dalab Grain Barge
// Carries Nulab's tithe grain, dried fish and copper/bronze north across the great lake to Ledge's lifts and down the level reach
// of the Chimes Riba (settlements/nulab/PLAN.md sections 5-7, step N4): a 36 m flat-bottomed bluff hull reinforced at the bows
// with salvaged Line hex-plate strakes, thatched aft deckhouse, open hold of grain sacks, terracotta jars and copper ingots,
// heavy lugger/derrick mast, stern sweeps and green-skinned Dalabite bargemen.
function rsDalabBargeSail(g,W,H,P){rsCloth(g,W,H,'#dfc99c',7,'h');g.save();rsPolyPath(g,P);g.clip();
 g.fillStyle='#a8382a';g.fillRect(0,H*.12,W,H*.09);g.fillStyle='#2f9a8a';g.fillRect(0,H*.24,W,H*.05);
 g.strokeStyle='#6a4628';g.lineWidth=W*.04;rsPolyPath(g,P);g.stroke();g.restore();}
function buildRsDalabBarge(){reseed(74200);
 const V={group:new THREE.Group(),anims:[]},B=rsBucket(),lin=rsLin;
 const HULL=lin(0x5c462e),DARK=lin(0x2e2216),RED=lin(0x9e3628),TQ=lin(0x2f9a8a),DECK=lin(0x786246),TH=lin(0xb0985a),COP=lin(0xc47e38);
 const H=rsHull({L:36,B:9.8,fb:2.1,dr:1.35,sheerF:.85,sheerA:.65,sp:2.5,pb:2.8,pa:2.8,q:.28,n:5.4,flare:.05,rakeF:2.4,rakeA:1.8,transom:.68,keelEnd:.65,kp:3});
 rsHullMesh(B,H,'wood',(u,h)=>h>.88?RED:h<.38?DARK:HULL);rsFoam(B,H,1.15);
 const dY=rsDeck(B,H,{bw:.62,col:DECK});rsWale(B,H,.86,.12,'wood',DARK);rsWale(B,H,.56,.1,'paint',TQ);rsSpine(B,H,.2,DARK);
 /* salvaged Ancient Line hex-plate rubbing strakes armouring the bluff bows */
 for(const s of[-1,1]){const p=H.pt(.9,s,.68),N=H.nrm(.9,s,.68);
  rsBox(B,'hex',[3.8,.85,.12],[p[0],p[1],p[2]+N.z*.06],[0,-s*.28,0],lin(0x9aa0a4),2);}
 /* thatched aft cabin (-x) and low foredeck locker (+x) */
 const ax=-12.6,top=rsCabin(B,{x:ax,y:dY(H.uAt(ax)),w:6.8,d:7.0,h:2.7,wall:lin(0xa87846),win:4,winCol:0x241c14,roof:'hip',roofMk:'thatch',roofCol:TH,rh:1.5,over:.45});
 rsCabin(B,{x:13.8,y:dY(H.uAt(13.8)),w:4.4,d:5.8,h:1.8,wall:lin(0x8a6842),win:2,winCol:0x241c14,roof:'flat',roofMk:'wood',roofCol:DARK,over:.25});
 /* open cargo waist: canvas-tarped grain stacks, bound grain sacks, terracotta tithe jars and gleaming copper ingots */
 for(const x of[-4.8,1.4])rsBox(B,'cloth',[4.6,1.85,5.8],[x,dY(H.uAt(x))+.94,0],null,lin(0xcab892));
 for(let i=0;i<22;i++){const x=rr(-7.5,9.5),z=rr(-3.4,3.4),y=dY(H.uAt(x)),k=i%3;
  if(k===0)rsSphere(B,'cloth',.5,[x,y+.34,z],[1.25,.62,.85],lin(0xd2c29c),8,6);
  else if(k===1)rsCyl(B,'paint',.28,.36,.82,[x,y+.42,z],null,lin(0x9c5838),9);
  else rsBox(B,'metal',[.75,.28,.45],[x,y+.16,z],[0,rr(-.3,.3),0],COP,1);}
 /* heavy lugger & cargo-derrick mast forward of the hold, square lug sail, Dalab pennant */
 const mx=6.8,base=dY(H.uAt(mx)),mh=10.6,tp=[mx,base+mh,0];
 rsLink(B,'wood',[mx,base-.3,0],tp,.2,DARK,8,.13);
 rsLink(B,'wood',[mx,base+1.4,0],[mx-5.4,base+4.6,2.1],.11,DARK,6);rsRope(B,[mx,base+8.8,0],[mx-5.4,base+4.6,2.1],.03);
 rsRig(B,[mx,0]);
 const S=rsSail(B,{key:'dalab-barge',O:[mx+.2,base+2.1,0],U:[0,0,1],V:[0,1,0],belly:-.65,A:t=>[(t-.5)*5.8,mh-2.9],Bf:t=>[(t-.5)*5.4,0],draw:rsDalabBargeSail});
 rsSailEdge(B,S,1,.08,DARK);rsSailEdge(B,S,0,.06,DARK);
 rsRope(B,tp,[H.xAt(1,1),H.ys(1),0]);rsRope(B,tp,[ax+3.4,top-.4,0]);rsRigEnd(B);
 rsPennant(B,[mx,base+mh+.2,0],2.8,.52,[RED,lin(0xd8a838),TQ]);
 /* twin stern sweeps and Dalabite bargemen */
 for(const s of[-1,1]){const p=H.pt(.03,s,1);rsLink(B,'wood',[p[0]+.8,p[1]+.5,p[2]*.82],[p[0]-5.2,-.35,p[2]*1.25],.095,DARK,6);}
 for(const [x,z,cl] of[[ax-2.6,1.4,RED],[ax+4.0,-2.8,TQ],[-1.2,3.4,lin(0xd8a838)],[9.8,-2.4,lin(0xe0d2b4)]])
  rsFigure(B,[x,x===ax-2.6?top-.1:dY(H.uAt(x)),z],rr(0,TAU),cl,false,0x6a9a4a);
 rsBake(B,V.group,'dalabGrainBarge');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'dalabGrainBarge',name:'Dalab Grain Barge',culture:'dalab',L:38,B:10.5,H:14,
 tags:{type:['cargo','barge','river'],propulsion:['sail','sweep'],hull:'flat',wealth:'peasant',crew:6,role:'lake and Chimes Riba grain and copper barge'},
 blurb:'Dalab\'s 36 m grain and ore barge: salvaged Line bow strakes, thatched aft house, grain sacks and copper ingots, lug-and-derrick mast.',build:buildRsDalabBarge});
