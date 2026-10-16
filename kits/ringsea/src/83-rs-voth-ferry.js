// ---------------------------------------------------------------- vessel: Voth Bay Ferry
// The canton ferry of the Voth bay (settlements/voth/src/78d-life-ferries-barges.js, ferry() in 65b-town-props.js:
// 16 m x 6 m): a beamy open boat with a passenger cabin aft where the cargo used to go, a single mast with a square
// cream sail, a ferryman at the tiller and passengers on the benches.
function rsVothFerrySail(g,W,H,P){rsCloth(g,W,H,'#e8dcbc',6,'v');g.save();rsPolyPath(g,P);g.clip();g.fillStyle='#4b2a6e';g.fillRect(0,H*.78,W,H*.08);g.restore();}
function buildRsVothFerry(){reseed(73300);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const HULL=lin(0x6b5942),DARK=lin(0x3a2c1e),DECK=lin(0x8a7458),CAB=lin(0xd8cdb4),ROOF=lin(0x4b2a6e);
 const H=rsHull({L:16,B:6,fb:1.6,dr:1,sheerF:.9,sheerA:.6,sp:2,pb:1.6,pa:2,q:.5,n:3.4,flare:.1,rakeF:1.2,rakeA:.4,transom:.55,keelEnd:.4,kp:3});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?DARK:h<.4?DARK:HULL);rsFoam(B,H,.7);
 const dY=rsDeck(B,H,{bw:.6,col:DECK});rsWale(B,H,.86,.08,'wood',DARK);rsSpine(B,H,.14,DARK);
 // the passenger cabin aft, under a purple canopy roof
 const cx=-3.4;rsCabin(B,{x:cx,y:dY(H.uAt(cx)),w:4.4,d:3.6,h:2,wall:CAB,win:3,winCol:0x2a2016,roof:'gable',roofMk:'cloth',roofCol:ROOF,rh:.7,over:.3});
 // benches forward
 for(const x of[.6,2.6])rsBox(B,'wood',[.5,.45,4.2],[x,dY(H.uAt(x))+.25,0],null,DARK);
 // the mast and its square sail
 const mx=2.9,base=dY(H.uAt(mx)),mh=7,tp=[mx,base+mh,0];rsLink(B,'wood',[mx,base-.3,0],tp,.14,DARK,6,.1);
 rsRig(B,[mx,0]);const w=3.4,foot=1.4;
 const S=rsSail(B,{key:'voth-ferry',O:[mx+.15,base+foot,0],U:[0,0,1],V:[0,1,0],belly:-.5,A:t=>[(t-.5)*w,mh-foot-.6],Bf:t=>[(t-.5)*w*.94,0],draw:rsVothFerrySail});
 rsSailEdge(B,S,1,.06,DARK);rsSailEdge(B,S,0,.05,DARK);rsRope(B,tp,[H.xAt(1,1),H.ys(1),0]);rsRope(B,tp,[H.xAt(0,1)+1,H.ys(0),0]);rsRigEnd(B);
 // the tiller and the people: the ferryman aft, passengers on the benches
 {const p=H.pt(0,0,.3);rsBox(B,'wood',[1,1.6,.16],[p[0]-.4,p[1]-.2,0],null,DARK);rsLink(B,'wood',[p[0]+.2,H.ys(0)+.3,0],[p[0]+1.6,H.ys(0)+.6,0],.05,DARK);}
 rsFigure(B,[H.xAt(0,1)+1.8,dY(.08),.4],Math.PI,lin(0x4b2a6e),false,0x8a8aa0);
 for(const [x,z] of[[.6,-1.2],[.6,1.1],[2.6,-.6],[2.6,1.4]])rsFigure(B,[x,dY(H.uAt(x))+.45,z],rr(0,TAU),[lin(0x6a5a48),lin(0x8a6a3a),lin(0x3a4a5a)][Math.floor(rng()*3)],true,0x8a8aa0);
 rsBake(B,V.group,'vothFerry');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'vothFerry',name:'Voth Bay Ferry',culture:'voth',L:18,B:7,H:10,
 tags:{type:['ferry','passenger'],propulsion:['sail'],hull:'monohull',wealth:'middle',crew:1,role:'canton ferry of the bay'},
 blurb:'The Voth canton ferry: a beamy open boat with a passenger cabin aft under a purple canopy, one square cream sail.',build:buildRsVothFerry});
