// ---------------------------------------------------------------- vessel: Dalab Lake Ferry
// Crosses the 54 km of the West Rift's great lake between Nulab's bay harbour and Ledge's lifts (settlements/nulab/PLAN.md
// sections 6-7, step N4): a 22 m beamy lake hull painted with Dalab's red-ochre waterline band and turquoise sheer stripe, a
// curled Dalab scroll stem (rsScroll), an aft passenger deckhouse under a shingle gable with cream-and-turquoise trim, twin
// square sails bordered with Dalab's stepped key band and eye-sun roundel, steering sweep and green-skinned Dalabite crew.
function rsDalabFerrySail(g,W,H,P){rsCloth(g,W,H,'#ece2c8',8,'v');g.save();rsPolyPath(g,P);g.clip();
 g.strokeStyle='#a8382a';g.lineWidth=W*.065;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='#2f9a8a';g.lineWidth=W*.024;rsPolyPath(g,rsInset(P,W*.055));g.stroke();
 const [cx,cy]=rsCentroid(P),R=Math.min(W,H)*.16;
 rsSymSun(g,cx,cy,R,'#d8a838','#2f9a8a');g.restore();}
function buildRsDalabFerry(){reseed(74100);
 const V={group:new THREE.Group(),anims:[]},B=rsBucket(),lin=rsLin;
 const HULL=lin(0x826341),RED=lin(0xa8382a),TQ=lin(0x2f9a8a),DARK=lin(0x3e2e1e),DECK=lin(0x987c58),CREAM=lin(0xe4d6b8),SH=lin(0x6e583e);
 const H=rsHull({L:22,B:6.8,fb:1.75,dr:1.15,sheerF:1.15,sheerA:.8,sp:2.2,pb:1.8,pa:2.0,q:.55,n:3.2,flare:.1,rakeF:1.5,rakeA:.6,transom:.48,keelEnd:.38,kp:3});
 rsHullMesh(B,H,'wood',(u,h)=>h>.86?TQ:h<.38?RED:HULL);rsFoam(B,H,.8);
 const dY=rsDeck(B,H,{bw:.55,col:DECK});rsWale(B,H,.86,.09,'paint',CREAM);rsWale(B,H,.42,.08,'wood',DARK);
 const bow=H.pt(1,0,1);rsSpine(B,H,.15,DARK,[[bow[0]+.55,bow[1]+.85],[bow[0]+.85,bow[1]+1.55]]);
 rsScroll(B,[bow[0]+.85,bow[1]+1.55,0],.55,1.25,.11,RED,1,'paint');
 /* aft passenger cabin under a shingled gable with Dalab cream cornice & turquoise frieze; forward passenger benches & sacks */
 const cx=-4.6,cy=dY(H.uAt(cx));
 rsCabin(B,{x:cx,y:cy,w:6.2,d:4.4,h:2.2,wall:CREAM,mk:'paint',win:4,winCol:0x223836,roof:'gable',roofMk:'wood',roofCol:SH,rh:.95,over:.38});
 rsBox(B,'paint',[6.36,.2,4.56],[cx,cy+2.05,0],null,TQ,2);rsBox(B,'paint',[6.36,.24,4.56],[cx,cy+.15,0],null,RED,2);
 for(const x of[-.2,2.0,4.2])rsBox(B,'wood',[.55,.46,4.6],[x,dY(H.uAt(x))+.24,0],null,DARK);
 for(let i=0;i<5;i++)rsSphere(B,'cloth',.42,[6.2+rr(-.8,.8),dY(H.uAt(6.2))+.28,rr(-1.4,1.4)],[1.2,.65,.85],lin(0xcbb992),8,6);
 /* mainmast amidships and foremast forward, both carrying Dalab square sails and streaming pennants */
 for(const [mx,mh,sw,key,colP] of[[1.2,9.2,4.6,'dalab-ferry-main',RED],[6.4,6.8,3.2,'dalab-ferry-fore',TQ]]){
  const base=dY(H.uAt(mx)),tp=[mx,base+mh,0];rsLink(B,'wood',[mx,base-.3,0],tp,.15,DARK,7,.1);
  rsRig(B,[mx,0]);const foot=1.55;
  const S=rsSail(B,{key,O:[mx+.16,base+foot,0],U:[0,0,1],V:[0,1,0],belly:-.58,A:t=>[(t-.5)*sw,mh-foot-.65],Bf:t=>[(t-.5)*sw*.94,0],draw:rsDalabFerrySail});
  rsSailEdge(B,S,1,.065,DARK);rsSailEdge(B,S,0,.055,DARK);
  rsRope(B,tp,[H.xAt(1,1),H.ys(1),0]);rsRope(B,tp,[H.xAt(0,1)+1.2,H.ys(0),0]);rsRigEnd(B);
  rsPennant(B,[mx,base+mh+.15,0],2.2,.42,[colP,lin(0xd8a838)]);}
 /* rudder, tiller and green-skinned Dalabite crew & passengers */
 {const p=H.pt(0,0,.32);rsBox(B,'wood',[1.1,1.8,.16],[p[0]-.42,p[1]-.2,0],null,DARK);rsLink(B,'wood',[p[0]+.2,H.ys(0)+.35,0],[p[0]+1.9,H.ys(0)+.65,0],.055,DARK);}
 rsFigure(B,[H.xAt(0,1)+2.0,dY(.08),.45],Math.PI,TQ,false,0x6a9a4a);
 for(const [x,z,cl] of[[-.2,-1.4,RED],[-.2,1.3,CREAM],[2.0,-.9,lin(0xd8a838)],[2.0,1.5,TQ],[4.2,.8,CREAM]])
  rsFigure(B,[x,dY(H.uAt(x))+.46,z],rr(0,TAU),cl,true,0x6a9a4a);
 rsBake(B,V.group,'dalabLakeFerry');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'dalabLakeFerry',name:'Dalab Lake Ferry',culture:'dalab',L:24,B:7.5,H:13,
 tags:{type:['ferry','passenger'],propulsion:['sail'],hull:'monohull',wealth:'middle',crew:3,role:'lake ferry to Ledge\'s lifts'},
 blurb:'Dalab\'s lake ferry on the West Rift\'s great lake: painted red-and-turquoise hull, curled prow, shingle cabin, twin stepped-fret square sails.',build:buildRsDalabFerry});
