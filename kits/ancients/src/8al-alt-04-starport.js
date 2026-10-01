// ================================================================= STARPORT ALT — "the Saucer Deck"
// A landing deck 180 m across, a dish with an upturned rim and a coned
// soffit, carried 70 m up on four raking legs that splay out to the plain, and
// round a central core. Under it a terminal of stacked glazed rings steps up
// toward the core; on it a control saucer on a short stem and two craft on
// their pads. Three pad towers stand off behind, each a stalk carrying a stack
// of small landing discs and a saucer head. After arco1 #80 (the disc raised on
// raking pylons over a tiered terminal) and arco1 #8 (pads stacked on a stalk).
// Ruin: a sector of the deck broke away with its leg and lies on the plain
// below; the deck lists toward the gap; one pad tower is down.
function buildAltStarport(scene,gx,gz,d){reseed(9908);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),SK=SHELL(d),acc=[],sk=[];
 REGISTER({name:'Starport alt — the Saucer Deck ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:120,h:100});
 const DY=72,DR=90,brk=fall?[.1,1.4]:null;            // the broken sector (azimuth range, radians: front-east)
 const inBrk=a=>brk&&a>brk[0]&&a<brk[1];
 // the terminal: four glazed rings stepping in toward the core
 const tiers=[[62,0,7],[52,7,6],[42,13,6],[32,19,6]];
 for(const[r,y,h]of tiers){altRev(acc,0,0,r,y+h,r-10,y+h,0,TAU,64);altRev(acc,0,0,r,y+h-.8,r,y+h,0,TAU,64);
  if(d===0)mesh(lathe({rFn:()=>r-1.5,H:h-1.6,nu:64,nv:1}),MAT.glass,G,0,y+.4,0);
  mesh(lathe({rFn:()=>r-3,H:h-1.6,nu:48,nv:1}),MAT.dark,G,0,y+.4,0);
  mullions(0,y+.4,0,r-1.2,h-1.6,Math.round(r*.8),d);
  for(let k=0;k<Math.round(r*.5);k++){const a=k/Math.round(r*.5)*TAU;if(dd&&altH(r,k,1)<.5)continue;
   kput('hedge',[(r-5)*Math.cos(a),y+h+.5,(r-5)*Math.sin(a)],qEuler(0,-a,0),[1.2,1,TAU*(r-5)/Math.round(r*.5)*.7],new THREE.Color().setHSL(.27,.45,.33));}}
 // the core, from the plain to the deck
 altCyl(acc,0,0,0,10,8,DY-2,32);
 for(let k=0;k<6;k++){const a=k/6*TAU;kput(d>0?'boxD':'darkPane',[9.2*Math.cos(a),45,9.2*Math.sin(a)],qFacing([Math.cos(a),0,Math.sin(a)]),[2,40,1],null);}
 // THE DECK, in its own group so a ruin can list it
 const D=new THREE.Group();D.position.set(0,DY,0);G.add(D);if(fall)D.rotation.set(.06,0,-.05);
 useGroupXF(D);const da=[],hole=brk?(u)=>inBrk(u*TAU):null;
 altRev(da,0,0,6,0,DR,0,0,TAU,96,hole);                     // the deck top
 altRev(da,0,0,DR,0,DR+3,2.5,0,TAU,96,hole);                // the upturned rim
 altRev(da,0,0,DR+3,2.5,DR+3,-1,0,TAU,96,hole);             // its edge
 altRev(da,0,0,DR+3,-1,40,-9,0,TAU,96,hole);                // the coned soffit
 altRev(da,0,0,40,-9,9,-3,0,TAU,48,hole);
 meshMerged(da,SK,D);
 // pad markings, a control saucer on a stem
 for(const[px,pz]of[[-45,-20],[30,-45],[-20,45]]){if(inBrk(Math.atan2(pz,px)+(pz<0?TAU:0)))continue;
  kput('slab',[px,.15,pz],null,[16,.3,16],new THREE.Color(dd?0x3a3530:0x2c3036));kput(dd?'ringR':'ringW',[px,.35,pz],qEuler(Math.PI/2,0,0),[13,13,4],null);}
 const cs=[];altCyl(cs,0,0,0,4,4,10,16);altRev(cs,0,0,0,10,22,13,0,TAU,48);altRev(cs,0,0,22,13,20,17,0,TAU,48);altRev(cs,0,0,20,17,0,19,0,TAU,48);
 meshMerged(cs,SK,D);
 if(d===0){mesh(lathe({rFn:()=>21.2,H:3,nu:48,nv:1}),MAT.glass,D,0,13.6,0);stripRing(0,15.2,0,21.6,d,32);}
 else{mesh(lathe({rFn:()=>21,H:3,nu:48,nv:1}),MAT.dark,D,0,13.6,0);}
 endGroupXF();
 // two craft on their pads: a delta wing and a fuselage
 const craft=(x,z,ry,P)=>{const c=[];altFin(c,[[-10,0],[10,0],[0,22]],.7,0,0,0,0);c[0].rotateX(-Math.PI/2);c[0].rotateY(ry);c[0].translate(x,1.6,z);
  altBox(c,x,2.4,z,3.2,2.4,16,ry);mesh(c.length>1?civMergeGeo(c):c[0],SK,P);};
 if(!fall)craft(-45,-20,.6,D);else{// one craft slid off with the broken sector
  craft(-45,-20,.6,D);}
 // the four raking legs (the one under the broken sector lies with it)
 const legs=[Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4];
 for(const a of legs){const pr=[[96,0],[110,0],[60,DY-6],[48,DY-6]];
  if(inBrk(a)){// it buckled: the foot stands, the rest lies across the plain
   altFin(acc,[[96,0],[110,0],[99,26],[88,22]],6,0,0,0,-a);
   const F=new THREE.Group();F.position.set(Math.cos(a)*150,0,Math.sin(a)*150);F.rotation.order='YXZ';F.rotation.set(Math.PI/2,-a+.5,0);G.add(F);
   const fa=[];altFin(fa,[[0,0],[14,0],[-26,46],[-38,46]],6,0,0,0,0);meshMerged(fa,CM,F);dropFragment(F,0,.6);continue;}
  altFin(acc,pr,6,0,0,0,-a);
  kput(dd?'plateR':'plateW',[Math.cos(a)*103,1,Math.sin(a)*103],qEuler(0,-a,0),[18,2,9],null);}
 if(fall){// the broken sector: a wedge of deck lying tilted on the plain below the gap
  const F=new THREE.Group();const am=(brk[0]+brk[1])/2;F.position.set(Math.cos(am)*112,0,Math.sin(am)*112);F.rotation.set(.12,0,-.1);G.add(F);
  const fa=[];altRev(fa,0,0,30,0,DR,0,brk[0]+.03,brk[1]-.03,24);altRev(fa,0,0,DR,0,DR+3,2.5,brk[0]+.03,brk[1]-.03,24);
  altRev(fa,0,0,DR+3,-1,40,-9,brk[0]+.03,brk[1]-.03,24);
  for(const g of fa)g.translate(-Math.cos(am)*60,0,-Math.sin(am)*60);meshMerged(fa,SK,F);dropFragment(F,0,1.5);
  altHeap(Math.cos(am)*84,Math.sin(am)*84,30,110,3);
  // the second craft, nose down in the debris
  const cr=new THREE.Group();cr.position.set(Math.cos(am)*70,0,Math.sin(am)*70);cr.rotation.set(-.5,1.1,.3);G.add(cr);craft(0,0,0,cr);dropFragment(cr,0,1);}
 else craft(30,-45,-1.1,D);
 // three pad towers behind the deck (north), a stalk with stacked discs and a saucer head
 const tw=[[-130,-160,58],[0,-190,74],[130,-160,64]];
 tw.forEach(([x,z,H],ti)=>{
  if(fall&&ti===2){// down: the stalk lies along the plain, its discs scattered
   const F=new THREE.Group();F.position.set(x+20,0,z+30);F.rotation.order='YXZ';F.rotation.set(Math.PI/2-.05,2.2,0);G.add(F);
   const fa=[];altCyl(fa,0,0,0,3,3,H,12);altRev(fa,0,0,0,H,16,H+3,0,TAU,32);meshMerged(fa,SK,F);dropFragment(F,0,.8);
   altCyl(acc,x,0,z,3.6,3.6,9,12);altHeap(x,z,9,20,1.6);return;}
  altCyl(sk,x,0,z,3,2.6,H,12);
  for(let k=0;k<4;k++){const y=H*(.35+k*.14),a=k*2.1,r=9;altRev(sk,x+Math.cos(a)*r,z+Math.sin(a)*r,0,y,7,y,0,TAU,24);
   altRev(sk,x+Math.cos(a)*r,z+Math.sin(a)*r,7,y,6,y-1.2,0,TAU,24);beam(dd?'strutR':'strutW',[x,y-2,z],[x+Math.cos(a)*r,y-.4,z+Math.sin(a)*r],.8,.8);}
  altRev(sk,x,z,0,H,16,H+2,0,TAU,40);altRev(sk,x,z,16,H+2,13,H+5,0,TAU,40);altRev(sk,x,z,13,H+5,0,H+6,0,TAU,40);
  if(d===0)stripRing(x,H+2.4,z,15.6,d,20);});
 altMerge(acc,CM,G);altMerge(sk,SK,G);
 REGISTER({name:'Starport alt — the terminal rings',x:0,z:0,r:64,h:26});
 REGISTER({name:'Starport alt — pad towers',x:0,z:-175,r:150,h:82});
 apron(G,0,0,66,84,d,.4);
 if(dd){mossOnRing(0,25,0,30,24,2);vinesOnRing(0,DY-8,0,60,26,18);rubbleRing(0,0,0,62,90,60,1.8);altTrees(26,90,200,70,70);}
 else altTrees(12,100,200,70,70);
 figures(0,80,6,20);
 if(d===2){reseed(9933);
  // the deck is a village: huts round the rim, fires under the coned soffit
  for(let k=0;k<40;k++){const a=rr(0,TAU);if(inBrk(a))continue;const r=rr(55,84),x=r*Math.cos(a),z=r*Math.sin(a),yaw=rng()*TAU;
   const p=new THREE.Vector3(x,0,z).applyEuler(D.rotation);
   kput('shantyBox',[p.x,DY+p.y+1.5,p.z],qEuler(0,yaw,0),[rr(3,5),3,rr(3,4)],null);kput('shantyRoof',[p.x,DY+p.y+3.2,p.z],qEuler(.15,yaw,0),[5.5,1,5],null);}
  for(let k=0;k<12;k++){const a=rr(0,TAU),r=rr(64,100);if(inBrk(a))continue;firePit('altPort',r*Math.cos(a),0,r*Math.sin(a),rr(.8,1.4));}
  for(const[r,y]of[[62,0],[52,7],[42,13]])for(let k=0;k<10;k++){const a=k/10*TAU+rr(0,.3);if(fbm(a*2,y*.1,3,2)<.45)continue;
   const n=[Math.cos(a),0,Math.sin(a)];fireWindow([(r-1.6)*n[0],y+3.5,(r-1.6)*n[2]],n,qFacing(n),rr(4,7),3);}
  altReclaim(G,{up:60,side:30,r:118,stalls:16,plots:14,people:24,key:'altPort'});}
 KOFF=[0,0,0];return G;}
