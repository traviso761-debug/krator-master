// ---------------------------------------------------------------- vessel: Beast-Rider Voyaging Canoe (wa'a kaulua)
// How the beast-riders of Mav's Refuge cross the Ring Sea when the flyers cannot carry the load:
// two 20 m dugout-and-plank hulls lashed to six crossbeams, a slatted platform between them with a
// thatched shelter, two maroon crab-claw sails, a great steering sweep, carved beast-heads at the
// bows and a tall perch amidships where a flyer can land and fold. (Ref: wa'a kaulua, Hokule'a.)
function rsCrabMaroon(g,W,H,P){rsCloth(g,W,H,'#6a1c2a',11,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#3a0c16';g.lineWidth=W*.02;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='rgba(240,200,120,.55)';g.lineWidth=W*.012;for(let k=0;k<3;k++){g.beginPath();g.arc(W*.1,H*.95,W*(.35+k*.07),-Math.PI*.5,0);g.stroke();}g.restore();
 // the hollow of the claw: cut the leech back in a curve between the two spar tips
 const n=P.length/2,a=P[n-1],b=P[n];const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,d=Math.hypot(a[0]-b[0],a[1]-b[1]);
 g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mx+d*.28,my-d*.12,d*.42,0,TAU);g.fill();g.globalCompositeOperation='source-over';}
function buildRsBeastWaa(){reseed(71400);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const HULL=0x5e1e14,BLK=0x1e1612,LASH=0xc8b080,DECK=0x9a7a52;
 const hulls=[-2.8,2.8].map(z0=>{const H=rsHull({L:20,B:1.8,fb:1.15,dr:.75,sheerF:1.3,sheerA:1.1,sp:2.6,pb:2.8,pa:2.6,q:.6,n:2.4,flare:.18,rakeF:.9,rakeA:.7,keelEnd:.25,z0});
  rsHullMesh(B,H,'wood',(u,h,s)=>h>.88?BLK:h<.3?0x2a1a14:HULL,60,10);rsFoam(B,H,.5);rsDeck(B,H,{bw:.25,col:0x3a2a1c});rsSpine(B,H,.1,BLK);rsWale(B,H,.9,.06,'rope',LASH);return H;});
 const H=hulls[1];const yT=H.ys(.5)+.1;
 // crossbeams and lashings, the platform, the rails
 for(const x of[-6.5,-3.8,-1.2,1.4,4,6.6]){rsBox(B,'wood',[.28,.26,7.2],[x,yT+.1,0],null,0x6a4a30);for(const z of[-2.8,2.8])rsBox(B,'rope',[.4,.34,.5],[x,yT+.1,z],null,LASH);}
 for(let i=0;i<22;i++){const x=lerp(-6.2,6.2,i/21);rsBox(B,'wood',[.5,.08,4.2],[x,yT+.28,0],[0,rr(-.02,.02),0],DECK);}
 for(const s of[-1,1]){for(let i=0;i<7;i++){const x=lerp(-6,6,i/6);rsLink(B,'wood',[x,yT+.3,s*2.1],[x,yT+1.1,s*2.1],.04,0x6a4a30,5);}rsLink(B,'wood',[-6.2,yT+1.1,s*2.1],[6.2,yT+1.1,s*2.1],.05,0x6a4a30,5);}
 // the thatched shelter
 {const x=-2.2,w=3.2,h=1.7;for(const s of[-1,1]){const L=Math.hypot(1.25,h)+.3;const g=rsUV(new THREE.BoxGeometry(w,.14,L),2);rsPut(B,'thatch',g,[x,yT+.3+h/2,s*.62],[s*Math.atan2(h,1.25),0,0],null,0xc8b27c);}
  rsLink(B,'wood',[x-w/2-.2,yT+.3+h+.05,0],[x+w/2+.2,yT+.3+h+.05,0],.07,0x5a3a24);}
 // carved beast-heads at the four ends, pennants of flyer plumes
 for(const Hh of hulls){for(const e of[0,1]){const p=Hh.pt(e,0,1);const dir=e?1:-1;rsTube(B,'wood',[[p[0],p[1],p[2]],[p[0]+dir*.4,p[1]+.9,p[2]],[p[0]+dir*.2,p[1]+1.7,p[2]]],.13,0x3a2418,10,8);
   const hp=[p[0]+dir*.3,p[1]+1.95,p[2]];rsSphere(B,'wood',.3,hp,[1.3,1,.8],0x4a2e1c,10,8);rsCone(B,'wood',.12,.5,[hp[0]+dir*.45,hp[1]-.05,hp[2]],[0,0,-dir*Math.PI/2],0x4a2e1c,6);
   for(const s of[-1,1])rsSphere(B,'paint',.07,[hp[0]+dir*.2,hp[1]+.1,hp[2]+s*.2],null,0xf0e0a0,6,5);rsPennant(B,[hp[0],hp[1]+.3,hp[2]],1.6,.3,[0x2aa878,0xe8c040,0x2a6ad8]);}}
 // the flyer's perch amidships
 rsLink(B,'wood',[1.2,yT+.3,0],[1.2,yT+6.2,0],.12,0x4a2e1c,8);rsLink(B,'wood',[1.2,yT+6.2,-1.4],[1.2,yT+6.2,1.4],.1,0x4a2e1c,8);for(const s of[-1,1])rsRope(B,[1.2,yT+6.2,s*1.4],[1.2,yT+.4,s*2.8]);
 // two masts and crab-claw sails, the claws raked aft
 [[4.6,12],[-5,10.5]].forEach(([mx,mh])=>{const base=yT+.3;rsLink(B,'wood',[mx,base,0],[mx-.6,base+mh*.55,0],.13,0x5a3a24,8,.09);
  rsRig(B,[[mx,base,0],[mx-.6,base+mh*.55,0]]);const S=rsSail(B,{key:'beast-crab',O:[mx,base+.3,0],U:[-1,0,0],V:[0,1,0],belly:.9,nu:22,nv:12,
   A:t=>[t*mh*.22+Math.sin(Math.PI*t)*.8,t*mh],Bf:t=>[t*mh*.62,t*mh*.34+Math.sin(Math.PI*t)*mh*.08],draw:rsCrabMaroon});
  rsSailEdge(B,S,0,.09,0x6a4a2c,0,1.04);rsSailEdge(B,S,1,.08,0x6a4a2c,0,1.02);rsRope(B,S.at(.6,0),[mx+5,yT+.3,0]);rsRope(B,S.at(1,1),[mx-7,yT+.4,2]);});rsRigEnd(B);
 // the steering sweep, the crew
 rsLink(B,'wood',[-8.5,yT+1.4,.6],[-13,-.9,1.2],.09,0x6a4a30,6);rsBox(B,'wood',[1.4,.08,.5],[-12.6,-.7,1.15],[0,0,.45],0x6a4a30);
 for(const [x,z] of[[-8,1],[-2,1.5],[0,-1.2],[3,1.4],[6.5,-.8]])rsFigure(B,[x,yT+.3,z],rr(-.5,.5),[0x6a1c2a,0x2a5a3a,0xd8c08a][Math.floor(rng()*3)],false,0x6a4028);
 rsOars(V,H,{name:'paddles',points:[[-5.5,yT+.55,3.5],[-3,yT+.55,3.5],[2.8,yT+.55,3.5]],len:2.7,inb:.2,r:.03,bladeL:.55,bladeW:.2,col:0x6a4a30,sweep:.5,lift:.3,rate:.6,pitch:1.1,immerse:.15});
 rsBake(B,V.group,'beastWaa');V.deckY=yT+.3;return V;}
RS_VESSEL({key:'beastWaa',name:'Beast-Rider Voyaging Canoe',culture:'beast-rider',L:22,B:9,H:15,
 tags:{type:['voyager','double canoe'],propulsion:['sail','paddles'],hull:'catamaran',wealth:'common',crew:16,role:'deep-sea voyaging and cargo'},
 blurb:"Twin hulls under a slatted deck, a thatched shelter, two maroon crab-claw sails and a flyer's perch.",build:buildRsBeastWaa});
