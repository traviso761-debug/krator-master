// ---------------------------------------------------------------- vessel: Voth Water Taxi
// The bay's water taxi (settlements/voth/src/78d-life-ferries-barges.js, lifeTaxiHull: 20 m x 3 m): a long slim
// open boat with a high curved prow, a long striped awning on six posts over the passengers, a life ring at the bow,
// a boatman standing at the stern with a sweep.
function buildRsVothTaxi(){reseed(73400);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const HULL=lin(0x8a7a68),BAND=lin(0x4b2a6e),DARK=lin(0x3a2c1e),POST=lin(0x6b5942),AWN=lin(0xe8dcbc),AWN2=lin(0x6a4a8f);
 const H=rsHull({L:20,B:3,fb:1.1,dr:.6,sheerF:2.2,sheerA:.9,sp:3,pb:1.6,pa:1.6,q:.55,n:3,flare:.1,rakeF:1.6,rakeA:.6,keelEnd:.3,kp:3});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?BAND:h<.35?DARK:HULL);rsFoam(B,H,.5);
 const dY=rsDeck(B,H,{bw:.3,col:lin(0x9a8468)});rsSpine(B,H,.1,DARK);
 // the high curved prow: a stem rising and curling forward off the bow
 {const p=H.pt(1,0,1);const pts=[];for(let i=0;i<=10;i++){const t=i/10;pts.push([p[0]+Math.sin(t*1.6)*1.4,p[1]+t*1.8,0]);}rsTube(B,'wood',pts,.16,BAND,20,6);}
 // the awning on six posts, a purple stripe down its middle and purple valances
 const xs=[-8,-2.5,3],aY=dY(.5)+2.6;for(const x of xs)for(const s of[-1,1])rsLink(B,'wood',[x,dY(H.uAt(x)),s*1.2],[x,aY,s*1.2],.06,POST,5);
 rsBox(B,'cloth',[13,.1,3.4],[-2.5,aY+.05,0],null,AWN);rsBox(B,'cloth',[13,.11,.9],[-2.5,aY+.06,0],null,AWN2);
 for(const s of[-1,1])rsBox(B,'cloth',[13,.5,.06],[-2.5,aY-.2,s*1.7],null,AWN2);rsSolid(B,[-9,aY-.4,-1.75],[4,aY+.2,1.75]);
 // benches, the life ring, the boatman with his sweep, passengers
 for(const x of[-6,-3,0,2.4])rsBox(B,'wood',[.4,.35,2.2],[x,dY(H.uAt(x))+.18,0],null,DARK);
 {const r=H.pt(.92,0,1);rsPut(B,'paint',new THREE.TorusGeometry(.42,.1,6,14),[r[0]-.6,r[1]+.5,0],[0,Math.PI/2,0],null,0xe8e0d0);}
 const sx=H.xAt(.05,1)+1;rsFigure(B,[sx,dY(.05),0],Math.PI,BAND,false,0x8a8aa0);rsLink(B,'wood',[sx-.2,dY(.05)+1.3,.2],[sx-3,H.ys(0)-1.4,.7],.05,POST,5);
 for(const [x,z] of[[-6,-.5],[-3,.5],[0,-.5],[2.4,.5]])rsFigure(B,[x,dY(H.uAt(x))+.35,z],rr(0,TAU),[lin(0x6a5a48),lin(0x8a6a3a),lin(0x3a4a5a)][Math.floor(rng()*3)],true,0x8a8aa0);
 rsBake(B,V.group,'vothTaxi');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'vothTaxi',name:'Voth Water Taxi',culture:'voth',L:22,B:4,H:5,
 tags:{type:['taxi','passenger'],propulsion:['sweep'],hull:'monohull',wealth:'middle',crew:1,role:'water taxi of the bay'},
 blurb:'A long slim Voth water taxi: a high curved prow, a long striped awning on six posts, a boatman at the sweep.',build:buildRsVothTaxi});
