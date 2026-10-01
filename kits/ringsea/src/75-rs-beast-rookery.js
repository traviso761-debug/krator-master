// ---------------------------------------------------------------- vessel: Beast-Rider Rookery Raft
// A floating roost, so the flyers of Mav's Refuge can cross the Ring Sea in stages: three hulls under a
// broad deck, a three-level roost tower on the starboard side where the great crested flyers fold and
// sleep, a thatched longhouse for the riders aft, baskets of fish for the beasts, one tall green
// crab-claw sail with the gold feather of the riders. One flyer is always up on the tower top, wings
// open. (Ref: the wa'a kaulua and Tongan kalia, and the flyers of 84-flyers in Mav's Refuge.)
function rsRookeryClaw(g,W,H,P){rsCloth(g,W,H,'#2a5a3a',10,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#14301e';g.lineWidth=W*.02;rsPolyPath(g,P);g.stroke();
 const [cx,cy]=rsCentroid(P);g.strokeStyle='#e0b840';g.lineWidth=W*.02;g.beginPath();g.moveTo(cx-W*.12,cy+H*.14);g.quadraticCurveTo(cx,cy-H*.02,cx+W*.1,cy-H*.16);g.stroke();
 for(let i=0;i<9;i++){const t=i/9,x=lerp(cx-W*.1,cx+W*.08,t),y=lerp(cy+H*.12,cy-H*.13,t);for(const s of[-1,1]){g.beginPath();g.moveTo(x,y);g.lineTo(x+s*W*.06-W*.02,y+H*.03);g.stroke();}}g.restore();
 const n=P.length/2,a=P[n-1],b=P[n];const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,d=Math.hypot(a[0]-b[0],a[1]-b[1]);
 g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mx+d*.28,my-d*.12,d*.42,0,TAU);g.fill();g.globalCompositeOperation='source-over';}
// a great crested flyer at p facing yaw, scale k (1 = a 3 m body, 10 m span); spread opens the wings
function rsFlyer(B,p,yaw,k,col,spread){const q=qEuler(0,yaw,0);const P=(x,y,z)=>{const v=new THREE.Vector3(x*k,y*k,z*k).applyQuaternion(q);return[p[0]+v.x,p[1]+v.y,p[2]+v.z];};
 const C=col||0x2a8a6a,CREST=0xc83a24,BEAK=0xe8d8a0;rsSphere(B,'paint',.55*k,P(0,1.3,0),[1.5,.8,.75],C,12,8);
 rsTube(B,'paint',[P(.6,1.4,0),P(1.1,2,0),P(1.3,2.7,0)],.16*k,C,10,6);rsSphere(B,'paint',.24*k,P(1.35,2.8,0),[1.3,.9,.8],C,8,6);
 rsCone(B,'paint',.12*k,1.3*k,P(2.1,2.72,0),[0,yaw,-Math.PI/2+.12],BEAK,6);rsCone(B,'paint',.1*k,1*k,P(.9,3.05,0),[0,yaw,Math.PI/2+.5],CREST,5);
 for(const s of[-1,1]){rsLink(B,'paint',P(-.1,1,s*.25),P(-.2,0,s*.3),.05*k,0x3a3020,4);
  if(spread){const g=rsGrid((u,v)=>{const x=lerp(.5,-.6,v)+u*u*-.3,z=s*(.3+u*4.8),y=1.5+Math.sin(u*Math.PI)*.4-v*.1;const w=new THREE.Vector3(x*k,y*k,z*k).applyQuaternion(q);return[p[0]+w.x,p[1]+w.y,p[2]+w.z];},8,3);rsPut(B,'paint',g,null,null,null,C);}
  else{rsBox(B,'paint',[2.2*k,.9*k,.06*k],P(-.1,1.3,s*.45),new THREE.Quaternion().multiplyQuaternions(q,qEuler(s*.2,0,.25)),C);}}}
function buildRsBeastRookery(){reseed(72500);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const HULL=0x5e1e14,BLK=0x1e1612,LASH=0xc8b080,DECK=0x9a7a52,POST=0x4a2e1c;
 const hulls=[[0,24,2.4],[-5.8,18,1.6],[5.8,18,1.6]].map(([z0,L,Bm])=>{const H=rsHull({L,B:Bm,fb:1.2,dr:.8,sheerF:1.2,sheerA:1,sp:2.6,pb:2.8,pa:2.6,q:.6,n:2.4,flare:.18,rakeF:.9,rakeA:.7,keelEnd:.25,z0});
  rsHullMesh(B,H,'wood',(u,h,s)=>h>.88?BLK:h<.3?0x2a1a14:HULL,60,10);rsFoam(B,H,.5);rsSpine(B,H,.1,BLK);return H;});
 const H=hulls[0],yT=H.ys(.5)+.1;
 for(const x of[-8,-5,-2,1,4,7])rsBox(B,'wood',[.3,.28,13],[x,yT+.1,0],null,0x6a4a30);
 for(let i=0;i<30;i++){const x=lerp(-8.4,8.4,i/29);rsBox(B,'wood',[.56,.08,12],[x,yT+.28,0],[0,rr(-.01,.01),0],new THREE.Color(DECK).offsetHSL(0,0,rr(-.03,.03)));}
 const yD=yT+.32;
 // the longhouse aft, thatched
 rsCabin(B,{x:-6.5,y:yD,w:4.2,d:6,h:1.8,mk:'wood',wall:0x7a5a38,win:2,roof:'gable',roofMk:'thatch',roofCol:0xc8b27c,rh:1.6,over:.4});
 // the roost tower on the starboard side: four posts, three perch decks, ladders
 const tx=0,tz=3.8,lv=[3.8,7.6,11.4];for(const a of[-1,1])for(const b of[-1,1])rsLink(B,'wood',[tx+a*1.6,yD,tz+b*1.6],[tx+a*1.3,yD+lv[2]+.2,tz+b*1.3],.14,POST,6);
 lv.forEach((h,i)=>{const w=3.6-i*.3;rsBox(B,'wood',[w,.16,w],[tx,yD+h,tz],null,0x8a6a44);rsSolid(B,[tx-w/2,yD+h-.1,tz-w/2],[tx+w/2,yD+h+.2,tz+w/2]);
  for(const s of[-1,1]){rsLink(B,'wood',[tx-w/2-.3,yD+h+.6,tz+s*(w/2+.2)],[tx+w/2+.3,yD+h+.6,tz+s*(w/2+.2)],.08,POST,5);}});
 rsSolid(B,[tx-1.8,yD,tz-1.8],[tx+1.8,yD+lv[2]+.3,tz+1.8]);
 for(let i=0;i<14;i++)rsLink(B,'wood',[tx-1.9,yD+i*.8,tz-.3],[tx-1.9,yD+i*.8,tz+.3],.04,POST,4);
 // the flyers: two folded on the lower perches, one on the rail, one spread on the top
 rsFlyer(B,[tx-.4,yD+lv[0]+.08,tz],.4,.8,0x2a8a6a);rsFlyer(B,[tx+.5,yD+lv[1]+.08,tz-.3],2.6,.75,0x3a7a8a);rsFlyer(B,[tx,yD+lv[2]+.08,tz],-.3,.85,0x2aa07a,true);
 rsFlyer(B,[3.5,yD,-3.8],Math.PI*.8,.7,0x4a8a5a);
 for(let i=0;i<6;i++){const x=rr(-3,3),z=rr(-5,-2);rsCyl(B,'thatch',.4,.3,.6,[x,yD+.3,z],null,0xb89a60,10);rsSphere(B,'paint',.2,[x,yD+.62,z],[1.4,.5,.6],0xa8b8c0,6,4);}
 // one tall crab-claw on the centre hull, forward of the tower
 const mx=6.5;rsLink(B,'wood',[mx,yD,0],[mx-.8,yD+8,0],.14,0x5a3a24,8,.1);
 const S=rsSail(B,{key:'rookery-claw',O:[mx,yD+.4,0],U:[-1,0,0],V:[0,1,0],belly:1,nu:22,nv:12,A:t=>[t*3+Math.sin(Math.PI*t)*.9,t*13.5],Bf:t=>[t*6.8,t*4.4+Math.sin(Math.PI*t)*1.1],draw:rsRookeryClaw});
 rsSailEdge(B,S,0,.1,0x6a4a2c,0,1.04);rsSailEdge(B,S,1,.09,0x6a4a2c,0,1.02);rsRope(B,S.at(.6,0),[mx+6,yT+.3,0]);
 rsLink(B,'wood',[-9.5,yT+1.4,.6],[-14,-.9,1.2],.09,0x6a4a30,6);
 for(const [x,z] of[[-9,1],[-2,-2],[1.5,2.2],[5,-1.8]])rsFigure(B,[x,yD,z],rr(-.6,.6),[0x6a1c2a,0x2a5a3a,0xd8c08a][Math.floor(rng()*3)],false,0x6a4028);
 rsBake(B,V.group,'beastRookery');V.deckY=yD;return V;}
RS_VESSEL({key:'beastRookery',name:'Beast-Rider Rookery Raft',culture:'beast-rider',L:26,B:16,H:17,
 tags:{type:['carrier','roost','trimaran'],propulsion:['sail','paddles'],hull:'trimaran',wealth:'common',crew:14,role:'flyer staging post at sea'},
 blurb:'Three hulls under a broad deck, a three-level roost tower of crested flyers, a thatched longhouse, a green crab-claw sail.',build:buildRsBeastRookery});
