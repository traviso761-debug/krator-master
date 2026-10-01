// ---------------------------------------------------------------- vessel: Islander Lakatoi
// The trading raft of the island potters, sailed out once a year with the monsoon and home again with
// sago: four dugout hulls lashed side by side under one platform, thatched deckhouses at both ends,
// and two tall crab-claw sails of woven pandanus with long hooked tips, side by side amidships. The
// deck is stacked with clay pots in nets; feather streamers fly from every spar. (Ref: the lakatoi.)
function rsPandanusClaw(g,W,H,P){rsCloth(g,W,H,'#c8a868',1,'v');g.save();rsPolyPath(g,P);g.clip();for(let i=0;i<24;i++){g.fillStyle=`rgba(90,60,20,${.06+.05*(i%2)})`;g.fillRect(0,H*i/24,W,H/48);g.fillRect(W*i/24,0,W/48,H);}
 g.fillStyle='rgba(110,40,20,.55)';for(let r=0;r<5;r++){const y=H*(.2+r*.14);for(let x=0;x<W;x+=W*.08){g.beginPath();g.moveTo(x,y);g.lineTo(x+W*.04,y-H*.03);g.lineTo(x+W*.08,y);g.closePath();g.fill();}}
 g.strokeStyle='#6a4a20';g.lineWidth=W*.02;rsPolyPath(g,P);g.stroke();g.restore();
 const n=P.length/2,a=P[n-1],b=P[n];const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,d=Math.hypot(a[0]-b[0],a[1]-b[1]);
 g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mx+d*.2,my-d*.2,d*.48,0,TAU);g.fill();g.globalCompositeOperation='source-over';}
function buildRsIslanderLakatoi(){reseed(72600);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const LOG=0x5a3a24,DK=0x2a1c12,DECK=0xa88a5a;
 const hs=[-4.5,-1.5,1.5,4.5].map(z0=>{const H=rsHull({L:16,B:1.3,fb:.8,dr:.55,sheerF:.6,sheerA:.5,sp:2.4,pb:2.4,pa:2.4,q:.55,n:2.4,flare:.15,rakeF:.5,rakeA:.5,keelEnd:.15,z0});
  rsHullMesh(B,H,'wood',(u,h,s)=>h>.85?DK:LOG,48,8);rsFoam(B,H,.35);rsSpine(B,H,.06,DK);return H;});
 const yT=hs[0].ys(.5)+.1;for(const x of[-5.5,-3,-.5,2,4.5])rsBox(B,'wood',[.25,.22,10.6],[x,yT+.1,0],null,0x6a4a30);
 for(let i=0;i<26;i++){const x=lerp(-6.2,6.2,i/25);rsBox(B,'wood',[.5,.08,10.2],[x,yT+.26,0],null,new THREE.Color(DECK).offsetHSL(0,0,rr(-.03,.03)));}
 const yD=yT+.3;
 // thatched deckhouses fore and aft
 for(const x of[-4.6,4.6])rsCabin(B,{x,y:yD,w:2.6,d:7,h:1.5,mk:'thatch',wall:0xb89a64,roof:'gable',roofMk:'thatch',roofCol:0xc8b27c,rh:1.5,over:.35});
 // the pots, stacked in nets amidships
 for(let i=0;i<22;i++){const x=rr(-2.6,2.6),z=rr(-4.2,4.2),y=yD+(i%3)*.45;if(Math.abs(z)<.6&&Math.abs(x)<1)continue;rsSphere(B,'paint',.3,[x,y+.28,z],[1,.85,1],[0xb05a30,0x9a4a28,0xc06a3a][i%3],10,8);rsCyl(B,'paint',.12,.16,.16,[x,y+.58,z],null,0x8a3a20,8);}
 // two crab-claw sails side by side, masts leaning aft
 for(const z of[-2.2,2.2]){const mx=2.4;rsLink(B,'wood',[mx,yD,z],[mx-.7,yD+8.5,z],.12,0x5a3a24,8,.08);
  const S=rsSail(B,{key:'lakatoi-claw',O:[mx,yD+.3,z],U:[-1,0,0],V:[0,1,0],belly:.8*Math.sign(z),nu:24,nv:12,
   A:t=>[t*2.2+Math.sin(Math.PI*t)*.7-Math.pow(t,6)*1.6,t*14],Bf:t=>[t*5.4+Math.pow(t,5)*1.2,t*3.2+Math.sin(Math.PI*t)*.9+Math.pow(t,5)*2.4],draw:rsPandanusClaw});
  rsSailEdge(B,S,0,.09,0x6a4a2c,0,1.05);rsSailEdge(B,S,1,.08,0x6a4a2c,0,1.05);rsRope(B,S.at(.55,0),[mx+5.5,yD,z]);
  const tip=S.at(1.05,0);rsPennant(B,tip,2.2,.25,[0xe8e0c8,0x2a2a2a,0xc83a24]);}
 rsLink(B,'wood',[-6.5,yD+.8,0],[-10,-.8,.4],.08,0x6a4a30,6);
 for(const [x,z] of[[-6.2,.5],[0,.4],[3.8,-3.8],[6,3.5]])rsFigure(B,[x,yD,z],rr(0,TAU),[0xe0d0b0,0x8a3a1c,0x2a6a8a][Math.floor(rng()*3)],false,0x6a4028);
 rsBake(B,V.group,'islanderLakatoi');V.deckY=yD;return V;}
RS_VESSEL({key:'islanderLakatoi',name:'Islander Lakatoi',culture:'ringsea-islander',L:19,B:11,H:17,
 tags:{type:['merchant','trading raft'],propulsion:['sail','paddles'],hull:'multihull',wealth:'common',crew:20,role:'the annual pot-trading voyage'},
 blurb:'Four dugouts lashed under one deck, thatched houses fore and aft, pots in nets, and two tall pandanus crab-claw sails.',build:buildRsIslanderLakatoi});
