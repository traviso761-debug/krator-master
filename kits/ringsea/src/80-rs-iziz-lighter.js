// ---------------------------------------------------------------- vessel: Iziz Salvage Lighter
// How Iziz feeds its rebuilding: a flat, square-ended 28 m lighter in the Iziz orange with a teal
// sheer, its open well stacked with white composite panels and pipe cut from the Ancient towers,
// an A-frame derrick at the bow lifting another panel aboard, a little wheelhouse aft under an
// orange roof, and a single lug sail with the Iziz sun (core/sockets livery).
function rsIzizLug(g,W,H,P){rsFactionSail(g,W,H,P,RS_CULT.iziz,'sun',.2);}
function buildRsIzizLighter(){reseed(73000);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const OR=rsLin(RS_CULT.iziz.field),TEAL=rsLin(RS_CULT.iziz.edge),CREAM=rsLin(RS_CULT.iziz.ink),DK=0x3a2a1c,RUST=0x6a3a24;
 const H=rsHull({L:28,B:9,fb:2,dr:1.6,sheerF:.9,sheerA:.6,sp:2,pb:1.3,pa:1.3,q:.3,n:5,flare:.05,rakeF:2.2,rakeA:1.4,transom:.6,keelEnd:.9,kp:5});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?TEAL:h>.84?CREAM:h<.4?RUST:OR);rsFoam(B,H,1.2);
 const dY=rsDeck(B,H,{bw:.7,col:0x8a7a62});rsWale(B,H,.84,.1,'paint',TEAL);rsWale(B,H,.6,.1,'paint',TEAL);rsSpine(B,H,.2,DK);
 for(const s of[-1,1]){const p=H.pt(.5,s,.62),N=H.nrm(.5,s,.62);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),N);rsPut(B,'paint',new THREE.CircleGeometry(1.1,24),[p[0]+N.x*.06,p[1],p[2]+N.z*.06],q,null,CREAM);
  rsPut(B,'paint',new THREE.CircleGeometry(.62,20),[p[0]+N.x*.08,p[1],p[2]+N.z*.08],q,null,OR);rsPut(B,'paint',new THREE.CircleGeometry(.28,14),[p[0]+N.x*.1,p[1],p[2]+N.z*.1],q,null,CREAM);}
 // the open well: coamings, and the salvage: stacked white panels, pipe lengths, a tangle of cable
 const hy=dY(.5);for(const s of[-1,1])rsBox(B,'paint',[14,.6,.25],[0,hy+.3,s*3.2],null,OR);for(const s of[-1,1])rsBox(B,'paint',[.25,.6,6.4],[s*7,hy+.3,0],null,OR);
 for(let i=0;i<5;i++)for(let j=0;j<2;j++)rsBox(B,'ancient',[5.2,.25,2.4],[-3+j*6.2+rr(-.3,.3),hy+.2+i*.27,rr(-.4,.4)],[0,rr(-.08,.08),0],0xffffff,4);
 for(let i=0;i<5;i++)rsCyl(B,'ancient',.35,.35,5.5,[rr(-5,5),hy+1.7+(i%2)*.7,-2.2+i*.3],[0,0,Math.PI/2],0xffffff,12);
 rsTube(B,'rope',[[-5,hy+1.6,2],[-3,hy+2.2,2.4],[-1,hy+1.8,1.6],[1,hy+2,2.2]],.08,0x1a1a1a,20,5);
 // the A-frame derrick at the bow, a panel in the slings
 const dx=10.5,dyy=dY(H.uAt(dx));for(const s of[-1,1])rsLink(B,'metal',[dx,dyy,s*3],[dx+3.4,dyy+7.4,0],.16,OR,8);rsRope(B,[dx+3.4,dyy+7.4,0],[4,hy+1.5,0],.04);
 rsRope(B,[dx+3.4,dyy+7.4,0],[dx+3.4,dyy+2.4,0],.03);rsBox(B,'ancient',[3.6,.2,2],[dx+3.4,dyy+2.2,0],[0,.3,.08],0xffffff,4);for(const s of[-1,1])rsRope(B,[dx+3.4,dyy+3.8,0],[dx+3.4+s*1.6,dyy+2.3,0],.02);
 // the wheelhouse aft, the mast and the sun lug
 const wT=rsCabin(B,{x:-11,y:dY(.1),w:3.4,d:3.6,h:2.3,mk:'paint',wall:CREAM,win:2,winCol:0x101418,roof:'gable',roofMk:'paint',roofCol:OR,rh:.8,over:.25});
 rsLink(B,'wood',[-11,wT,0],[-11,wT+2.4,0],.04,DK,4);rsPennant(B,[-11,wT+2.4,0],2.4,.7,[OR,TEAL]);
 const mx=-6.2,mb=dY(H.uAt(mx)),mh=15;rsLink(B,'wood',[mx,mb-.3,0],[mx,mb+mh,0],.22,0x6a4a2c,8,.14);
 const S=rsSail(B,{key:'iziz-lug',O:[mx+.3,mb+3.2,.35],U:[1,0,0],V:[0,1,0],belly:-.9,nu:14,nv:10,A:t=>[lerp(-2.6,-3.4,t),lerp(0,11,t)],Bf:t=>[lerp(6,5.6,t),lerp(0,8.6,t)],draw:rsIzizLug});
 rsLink(B,'wood',S.at(1,0),S.at(1,1),.1,0x6a4a2c,6);rsLink(B,'wood',S.at(0,0),S.at(0,1),.09,0x6a4a2c,6);rsRope(B,[mx,mb+mh,0],S.at(1,.2));rsRope(B,[mx,mb+mh,0],[H.xAt(1,1),H.ys(1),0]);
 for(const [x,z] of[[-11,1.2],[8.5,2],[9.2,-2.4],[2,3.8]])rsFigure(B,[x,dY(H.uAt(x)),z],rr(0,TAU),[OR,TEAL,CREAM][Math.floor(rng()*3)]);
 rsBake(B,V.group,'izizLighter');V.deckY=hy;return V;}
RS_VESSEL({key:'izizLighter',name:'Iziz Salvage Lighter',culture:'iziz-vernacular',L:34,B:13,H:20,
 tags:{type:['cargo','lighter','salvage'],propulsion:['sail','poles'],hull:'monohull',wealth:'common',crew:10,role:'hauls Ancient panels and pipe to the Iziz yards'},
 blurb:'A flat orange lighter with a well of white Ancient panels and pipe, an A-frame derrick at the bow and a sun-marked lug sail.',build:buildRsIzizLighter});
