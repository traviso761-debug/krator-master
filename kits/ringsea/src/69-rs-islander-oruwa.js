// ---------------------------------------------------------------- vessel: Islander Oruwa (outrigger fishing canoe)
// The everyday boat of the Ring Sea islands: a 9 m dugout built up with sewn washstrakes, one log float
// on two bent booms to windward, a tall rectangular sail of bark-dyed cloth with the white moon of the
// islands, stretched between two spars. Two fishers, a net bundle, a bailer. (Ref: Sri Lankan oruwa.)
function rsMoonSail(g,W,H,P){rsCloth(g,W,H,'#8a5a32',8,'h');g.save();rsPolyPath(g,P);g.clip();for(let i=0;i<10;i++){g.fillStyle=`rgba(40,20,10,${.05+.06*h3(i,1,1)})`;g.fillRect(0,H*i/10,W,H/20);}
 g.fillStyle='#f0e8d4';g.beginPath();g.arc(W*.52,H*.46,Math.min(W,H)*.2,0,TAU);g.fill();g.strokeStyle='#4a2a14';g.lineWidth=W*.02;rsPolyPath(g,P);g.stroke();g.restore();}
function buildRsIslanderOruwa(){reseed(71900);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const LOG=0x6a4a30,DK=0x2e2018,STR=0x8a6a44;
 const H=rsHull({L:9.2,B:.85,fb:.75,dr:.45,sheerF:.5,sheerA:.45,sp:2.4,pb:2.2,pa:2.2,q:.55,n:2.6,flare:.28,rakeF:.4,rakeA:.4,keelEnd:.12});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.66?STR:LOG,48,8);rsFoam(B,H,.35);rsDeck(B,H,{y:.1,col:0x5a3a24,uA:.1,uB:.9});rsWale(B,H,.66,.03,'rope',0xc8b080);rsSpine(B,H,.06,DK);
 // the float and the two bent booms to starboard
 const F=rsHull({L:5.2,B:.36,fb:.18,dr:.16,sheerF:.15,sheerA:.1,pb:2,pa:2,q:.5,n:2,z0:3.6,keelEnd:0});rsHullMesh(B,F,'wood',()=>0x5a4028,24,6);rsFoam(B,F,.25);
 for(const x of[-1.4,1.6]){const y=H.ys(.5);rsTube(B,'wood',[[x,y+.05,-.4],[x,y+.25,1.2],[x,y+.1,2.6],[x,.2,3.6]],.07,0x7a5a38,20,6);rsRope(B,[x,.22,3.45],[x,.05,3.6],.03,0xc8b080);}
 // mast and the two-spar sail
 const mx=.4,y0=H.ys(.5);rsLink(B,'wood',[mx,.1,0],[mx,y0+6.4,0],.07,0x6a4a2c,6,.05);for(const s of[-1,1])rsRope(B,[mx,y0+6.4,0],[mx,y0,s*.45]);rsRope(B,[mx,y0+6.4,0],[mx,.3,3.6]);
 rsRig(B,[mx,0]);const S=rsSail(B,{key:'islander-moon',O:[mx-.2,y0+.5,.12],U:[-.98,0,-.2],V:[0,1,0],belly:.35,nu:10,nv:10,
  A:t=>[lerp(-.6,3.2,t),lerp(5.8,6.6,t)],Bf:t=>[lerp(-.4,3,t),lerp(.3,.1,t)],draw:rsMoonSail});
 rsSailEdge(B,S,0,.06,0x7a5a38,-.05,1.05);rsSailEdge(B,S,1,.05,0x7a5a38,-.05,1.05);rsRigEnd(B);
 rsFigure(B,[-3,.1,0],0,0xe0d0b0,true,0x6a4028);rsFigure(B,[2.2,.1,0],Math.PI,0x2a6a8a,true,0x6a4028);
 rsLink(B,'wood',[-3.4,.9,.2],[-5.6,-.5,.4],.04,0x7a5a38,5);rsSphere(B,'rope',.35,[1.3,.4,0],[1.4,.6,1],0x9a8a60,8,6);
 rsBake(B,V.group,'islanderOruwa');V.deckY=.1;return V;}
RS_VESSEL({key:'islanderOruwa',name:'Islander Oruwa',culture:'ringsea-islander',L:10,B:5,H:8,
 tags:{type:['fishing','outrigger canoe'],propulsion:['sail','paddles'],hull:'outrigger',wealth:'poor',crew:2,role:'inshore fishing'},
 blurb:'A sewn-plank dugout with one log float, and a tall bark-brown sail bearing the white island moon.',build:buildRsIslanderOruwa});
