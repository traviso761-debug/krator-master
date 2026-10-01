// ================================================================ LAND BLOCK: chTank - silo and tank houses round a green
// A village of round houses: corrugated grain silos fitted with windows and
// doors, wrap-around timber decks on brackets, conical roofs (some ringed
// with solar panels), and houses made of a big tank lying on saddles with a
// container on top beside a tall rust tank with a walkway ring. Eight houses
// stand round a paved ring path about a green with a water tower; spurs
// run to each door, four paths out to the block's footways.
// Seeds 20820+d; each house's shape from chPRNG(20880+i).
// d=1: roofs fallen or askew, walls holed, decks broken, one silo burnt,
// trees growing up through the roofless ones, the water tower down.
// d=3: silos capped with container rooms and roof decks, rope bridges from
// deck to deck, shacks leaning on the drums, stalls on the ring, the water
// tower strung with bulbs to every house.
MAT.chTankG=new THREE.MeshStandardMaterial({color:0x6d7a4c,roughness:.6,metalness:.35,side:DS});
const CHT={cx:0,cz:-55,ring:24,rw:4,slot:37,
 houses:[   // type, size; slot i sits at angle 22.5 + 45 i degrees round the green
  {t:'silo',r:6.8,h:13,solar:true},{t:'tank',r:3,L:13},{t:'silo',r:4.6,h:9,annex:true},{t:'twin',r:4,h:11},
  {t:'silo',r:6.2,h:15,solar:false},{t:'silo',r:5.4,h:11,solar:true},{t:'tank',r:3.3,L:12},{t:'silo',r:4.4,h:10,annex:true}]};
// An oriented paving strip from A to B ([x,z]), w wide, at deck level.
function chStrip(G,A,B,w,d){const dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz);if(L<.5)return;const px=-dz/L*w/2,pz=dx/L*w/2;
 const n=Math.max(1,Math.round(L/4)),sd=rr(0,99);
 pbAdd(gridSurface((u,v)=>[A[0]+dx*u+px*(v*2-1),PORT.DECK+.03,A[1]+dz*u+pz*(v*2-1)],n,1,
  {uS:L/16,vS:w/16,hole:d>0?(u,v)=>h3(Math.floor(u*n),3,sd)<(d===1?.3:.1):null}),d>0?MAT.pkPaveR:MAT.pkPave,G);}
// A ring deck (annulus) at y from r0 to r1: boards, fascia, rail, brackets.
function chRingDeck(G,x,y,z,r0,r1,d,o){o=o||{};const sd=rr(0,99),hole=d===1?(u,v)=>fbm(u*5+sd,1.3,sd,2)<.42:null;
 pbAdd(gridSurface((u,v)=>{const a=u*TAU,r=lerp(r0,r1,v);return[x+Math.cos(a)*r,y,z+Math.sin(a)*r];},36,1,{uS:r1*TAU/4,vS:(r1-r0)/4,hole}),MAT.timber,G);
 pbAdd(gridSurface((u,v)=>{const a=u*TAU;return[x+Math.cos(a)*r1,y-v*.3,z+Math.sin(a)*r1];},36,1,{uS:r1*TAU/4,vS:.1,hole}),MAT.timber,G);
 const rc=d>0?new THREE.Color(0x8a5a3a):new THREE.Color(0x6a4a30),n=Math.round(r1*TAU/2.2);
 for(let i=0;i<n;i++){const a=i/n*TAU,u=i/n;if(hole&&hole(u,.5))continue;const px=x+Math.cos(a)*(r1-.1),pz=z+Math.sin(a)*(r1-.1);
  kput('chPole',[px,y,pz],d===1&&rng()<.3?qEuler(rr(-.4,.4),0,rr(-.4,.4)):null,[.05,1.05,.05],rc);
  const b=(i+1)/n*TAU;if(!(d===1&&rng()<.3))chBeam('chBar',[px,y+1,pz],[x+Math.cos(b)*(r1-.1),y+1,z+Math.sin(b)*(r1-.1)],.06,rc);
  if(i%3===0)chBeam('chBar',[x+Math.cos(a)*(r0+.1),y-1.8,z+Math.sin(a)*(r0+.1)],[x+Math.cos(a)*(r1-.3),y-.25,z+Math.sin(a)*(r1-.3)],.12,chFrameCol(d));}
 if(d!==1&&o.plants)for(let i=0;i<o.plants;i++){const a=rng()*TAU;kput('leafCard',[x+Math.cos(a)*(r1-.3),y+.2,z+Math.sin(a)*(r1-.3)],null,[.6,1.1,.6],new THREE.Color().setHSL(rr(.22,.32),.5,rr(.4,.6)));}}
// chSilo(G,x,z,r,h,d,o) -> {deck:{y,r}, top}: a silo house facing angle o.face
// (radians, the door's direction). o: burnt, solar, cone (0 on, 1 askew, 2 fallen), cap (d=3 box on a flat roof).
function chSilo(G,x,z,r,h,d,o){o=o||{};const D=CH.D,burnt=!!o.burnt,mat=burnt?MAT.chSiloB:d===0?MAT.chSilo:MAT.chSiloR;
 const sd=rr(0,99),hole=d===1?(u,v)=>{const n=fbm(u*3+sd,v*2.2,sd,2);return n<.3+.25*v;}:null;
 pbAdd(gridSurface((u,v)=>{const a=v*TAU;return[x+Math.cos(a)*r,D+u*h,z+Math.sin(a)*r];},3,Math.max(20,Math.round(r*5)),{uS:h/2.5,vS:r*TAU/6,hole:hole?(u,v)=>hole(v,u):null}),mat,G);
 kput('slab',[x,D+.15,z],null,[r+.35,.3,r+.35],d>0?new THREE.Color(0x8a8278):new THREE.Color(0xc8c2b8));
 const deckY=D+Math.min(5.4,h*.46),deckR=r+1.7,fa=o.face||0;
 // two floors of windows in timber frames, the door toward the path
 for(const [fy,nw] of [[D+1.7,Math.max(3,Math.round(r*.9))],[deckY+1.7,Math.max(3,Math.round(r*.8))]]){if(fy+1>D+h)continue;
  for(let k=0;k<nw;k++){const a=fa+(k+.5)/nw*TAU+(fy>D+3?.35:0);if(fy<D+3&&Math.abs(Math.atan2(Math.sin(a-fa),Math.cos(a-fa)))<.35)continue;
   const nx=Math.cos(a),nz=Math.sin(a),q=qFacing([nx,0,nz]),w=rr(1.1,1.8),hh=rr(1.1,1.6);
   if(!burnt&&d!==1)kput('plank',[x+nx*(r+.02),fy,z+nz*(r+.02)],q,[w+.3,hh+.3,.1],new THREE.Color(0x8a5a36));
   chWinAt(x+nx*(r+.08),fy,z+nz*(r+.08),q,w,hh,d,d!==1&&!burnt&&rng()<.6,burnt,nx,nz);}}
 {const nx=Math.cos(fa),nz=Math.sin(fa),q=qFacing([nx,0,nz]);
  kput('plank',[x+nx*(r+.03),D+1.15,z+nz*(r+.03)],q,[1.3,2.4,.1],new THREE.Color(0x8a5a36));
  kput('pkDoor',[x+nx*(r+.1),D+1.1,z+nz*(r+.1)],q,[.95,2.1,1],d===1||burnt?new THREE.Color(0x3a2a22):new THREE.Color(0x9a2a2a));
  if(d!==1&&!burnt)kput('dot',[x+nx*(r+.3)+nz*.9,D+2.4,z+nz*(r+.3)-nx*.9],q,[.2,.16,.14],WARM);}
 // the wrap deck and a stair up to it, tangent to the drum
 if(!burnt||rng()<.5)chRingDeck(G,x,deckY,z,r,deckR,d,{plants:d===0?4:d===3?6:0});
 {const a=fa+1.1,nx=Math.cos(a),nz=Math.sin(a),tx=-nz,tz=nx,rise=deckY-D,run=rise*1.1;
  const bx=x+nx*(deckR+.7)-tx*run,bz=z+nz*(deckR+.7)-tz*run;
  if(!(d===1&&rng()<.5))kput('pkStair',[bx,D,bz],qFacing([tx,0,tz]),[1.1,rise/2,run/2.4],null);}
 // the roof: a cone (askew or on the ground at d=1), a vent, solar panels round the eave
 const top=D+h,cc=d===0?new THREE.Color().setHSL(rr(0,1)<.5?.0:.58,rr(.1,.4),rr(.28,.4)):new THREE.Color().setHSL(.06,.4,rr(.22,.3));
 const cone=o.cone||0;
 if(o.cap){chRingDeck(G,x,top+.1,z,0,r+.4,d,{});kput('chPole',[x,top-.2,z],null,[r*.95,.3,r*.95],new THREE.Color(0x6a5a4a));
  chUnit(x,top+.1,z,fa+Math.PI/2,r>5.5,d,{lit:.7,doorSide:1});
  kput('planter',[x+Math.cos(fa)*(r-1.2),top+.4,z+Math.sin(fa)*(r-1.2)],qEuler(0,-fa+Math.PI/2,0),[r*1.2,.6,1],null);
  for(let i=0;i<5;i++)kput('leafCard',[x+Math.cos(fa)*(r-1.2)+rr(-2,2),top+1,z+Math.sin(fa)*(r-1.2)+rr(-2,2)],qEuler(0,rng()*TAU,0),[rr(.5,.9),rr(.4,.7),rr(.5,.9)],new THREE.Color().setHSL(rr(.22,.32),.5,rr(.4,.6)));}
 else if(cone===0){kput('chCone',[x,top,z],null,[r*1.14,r*.52,r*1.14],cc);kput('chTank',[x,top+r*.48,z],null,[.5,.8,.5],cc);
  if(o.solar)for(let i=0;i<Math.round(r*1.6);i++){const a=i/Math.round(r*1.6)*TAU,R=r*.98;
   kput('pkSolar',[x+Math.cos(a)*R,top+r*.1,z+Math.sin(a)*R],qFacing([Math.cos(a),0,Math.sin(a)]).multiply(qEuler(.5,0,0)),[1.1,1,1],null);}}
 else if(cone===1)kput('chCone',[x+rr(-.6,.6),top-.4,z+rr(-.6,.6)],qEuler(rr(.2,.35),rng()*TAU,0),[r*1.14,r*.52,r*1.14],cc);
 else{const a=rng()*TAU;kput('chCone',[x+Math.cos(a)*(r+3.5),D+.3,z+Math.sin(a)*(r+3.5)],qEuler(Math.PI*.55,a,0),[r*1.1,r*.5,r*1.1],cc);
  VEG.tree(x+rr(-1,1),D,z+rr(-1,1),(rng()*3)|0,h+rr(1,4));}
 if(d===1){vinesOnRing(x,top,z,r+.1,Math.round(r*2),h*.8);scatterMoss(x,D,z,r,r+3,8,1.4);}
 if(d!==1&&!burnt&&rng()<.5)kput('pkDish',[x+Math.cos(fa+2.4)*(deckR-.6),deckY,z+Math.sin(fa+2.4)*(deckR-.6)],qEuler(0,rng()*TAU,0),1,null);
 return {deck:{y:deckY,r:deckR},top};}
// chTankHouse(G,x,z,yaw,r,L,d,o): a tank on its side on saddles, a container
// cabin on top with a deck, a tall rust tank with a walkway ring alongside.
function chTankHouse(G,x,z,yaw,r,L,d,o){o=o||{};const D=CH.D,c=Math.cos(yaw),s=Math.sin(yaw),P=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c],q=qEuler(0,yaw,0);
 const tc=d===0?new THREE.Color().setHSL(rr(.2,.28),.3,.42):new THREE.Color().setHSL(.07,.45,rr(.28,.36));
 const cy=D+r+.6,e=P(-L/2,0);
 kput('chTank',[e[0],cy,e[1]],q.clone().multiply(qEuler(0,0,-Math.PI/2)),[r,L,r],tc);
 for(const u of [-L*.3,L*.3]){const p=P(u,0);kput('chBar',[p[0],D+.5,p[1]],q,[1,1,r*1.6],new THREE.Color(0x9a948a));}
 // round windows and a door on the ends, portholes along the side
 for(const sg of [1,-1]){const p=P(sg*(L/2+.05),0),qe=qEuler(0,yaw+Math.PI/2*sg,0);
  if(sg>0)kput('pkDoor',[p[0],D+1.7,p[1]],qe,[1,2.1,1],d===1?new THREE.Color(0x3a2a22):new THREE.Color(0x2a4a6a));
  else{kput('chPort',[p[0],cy,p[1]],qe,[.9,.9,1],null);if(d!==1&&rng()<.7)kput('chLit',[p[0]+c*sg*-.06,cy,p[1]-s*sg*-.06],qe,[1.2,1.2,1],null);}}
 for(const u of [-L*.25,0,L*.25])for(const sd of [1,-1]){const p=P(u,sd*(r+.02)),nx=s*sd,nz=c*sd;
  kput('chPort',[p[0],cy+.3,p[1]],q,[.45,.45,1],d===1?new THREE.Color(0x222222):null);if(d!==1&&rng()<.55)kput('chLit',[p[0]+nx*.05,cy+.3,p[1]+nz*.05],q,[.6,.6,1],null);}
 const stepP=P(L/2+1.2,0);kput('plank',[stepP[0],D+.3,stepP[1]],q,[1.6,.6,2],null);
 // the cabin on top on a deck
 const topY=D+2*r+.7,deckw=L*.8;{const p=P(0,0);kput('plank',[p[0],topY-.1,p[1]],q,[deckw,.2,r*2+1],null);}
 const slide=d===1&&o.slide;
 if(slide){const p=P(rr(-2,2),r+3.5);kput(L>12.5?'pkCont40R':'pkCont20R',[p[0],D+.8,p[1]],qEuler(0,yaw+rr(-.4,.4),0).multiply(qEuler(.5,0,rr(-.1,.1))),1,chCol(1));}
 else{const big=L>=12.5;chUnit(x,topY,z,yaw,big&&deckw>12.3,d,{lit:.6,doorSide:1,endGlass:-1});
  chRail(...P(-deckw/2,r+.5),...P(deckw/2,r+.5),topY,d,d===1?.4:0);
  if(d===0){const ap=P(0,r+.2);kput('pkAwn',[ap[0],topY+2.5,ap[1]],qEuler(-.2,yaw,0),[L*.5,1,1.6],new THREE.Color().setHSL(rr(0,1),.45,.6));}}
 {const p=P(-L/2+1,r+1.3);kput('pkStair',[p[0],D,p[1]],qEuler(0,yaw+Math.PI/2,0),[1,(topY-D)/2,1.2],null);}
 // the tall tank with its walkway
 const tp=P(-L/2-.5,-(r+3.4)),tr=2.6,th=r*2+5;
 kput('chTank',[tp[0],D,tp[1]],null,[tr,th,tr],d===0?new THREE.Color(0xb86a3a):new THREE.Color(0x7a4a32));
 kput('chCone',[tp[0],D+th,tp[1]],null,[tr+.1,1,tr+.1],new THREE.Color(0x6a4a3a));
 chRingDeck(G,tp[0],D+th-1.6,tp[1],tr,tr+1.1,d,{});
 kput('pkLadder',[tp[0]+tr+.15,D+th-1.6,tp[1]],qEuler(0,Math.PI/2,0),[1,(th-1.6)/10,1],null);
 {const pp=P(-L/2+1,0);chBeam('spipe',[tp[0],D+th-.5,tp[1]],[pp[0],cy+r,pp[1]],.25,null);}
 if(d!==1){const lp=P(L/2+2.5,-2);chLamp(lp[0],D,lp[1],d,3);}
 else{const p=P(0,r+2);portRubble(p[0],D,p[1],3,8);}
 REGISTER({name:'Tank house',x,z,r:L/2+2,h:topY+CH.H-D,y:D});
 REGISTER({name:'Tall tank',x:tp[0],z:tp[1],r:tr+1.2,h:th+1,y:D});
 return {top:topY+CH.H};}
// The water tower on the green: a lattice of four legs, a tank with a cone
// and a gallery, a ladder. d=1 it has come down across the green.
function chWaterTower(G,x,z,d){const D=CH.D,H=13,fc=d===0?new THREE.Color(0x3a5a6a):new THREE.Color(0x6a4430),tc=d===0?new THREE.Color(0xd8d4cc):new THREE.Color(0x8a5a40);
 if(d===1){const a=.6;kput('chTank',[x+H*.8,D+3.4,z+H*.3],qEuler(0,a,Math.PI/2*.92),[3.4,5,3.4],tc);
  kput('chCone',[x+H*1.2,D+1.5,z+H*.6],qEuler(1.2,a,.3),[3.6,2,3.6],tc);
  for(const sx of [-1,1])for(const sz of [-1,1])chBeam('chBar',[x+sx*2.2,D,z+sz*2.2],[x+sx*2.2+H*.7,D+.3+rr(0,2),z+sz*2.2+H*.25],.18,fc);
  REGISTER({name:'Fallen water tower',x:x+6,z:z+3,r:9,h:7,y:D});return null;}
 const L=(sx,sz,f)=>[x+sx*lerp(2.6,1.9,f),D+H*f,z+sz*lerp(2.6,1.9,f)];
 for(const sx of [-1,1])for(const sz of [-1,1])chBeam('chBar',L(sx,sz,0),L(sx,sz,1),.2,fc);
 for(let k=1;k<4;k++){const f=k/4;const C=[[-1,-1],[1,-1],[1,1],[-1,1]];for(let j=0;j<4;j++){const a=C[j],b=C[(j+1)%4];chBeam('chBar',L(a[0],a[1],f),L(b[0],b[1],f),.1,fc);chBeam('chBar',L(a[0],a[1],f-.25),L(b[0],b[1],f),.07,fc);}}
 kput('chTank',[x,D+H,z],null,[3.4,5,3.4],tc);kput('chCone',[x,D+H+5,z],null,[3.6,1.8,3.6],new THREE.Color(0x4a4e54));
 chRingDeck(G,x,D+H,z,3.4,4.6,d,{});
 kput('pkLadder',[x+2.3,D+H,z],qEuler(0,Math.PI/2,0),[1,H/10,1],null);
 REGISTER({name:'Water tower',x,z,r:4.6,h:H+7,y:D});
 return [x,D+H+5.5,z];}
function buildChTank(scene,gx,gz,d,opt){reseed(20820+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=CH.D,C=CHT,h=opt.W/2,L=opt.LAND,F=CH.FOOT,cx=C.cx,cz=C.cz;
 chPerimeter(G,opt,d,{fence:'hedge',gaps:{S:[[cx-2,cx+2]],N:[[cx-2,cx+2]],W:[[cz-2,cz+2]],E:[[cz-2,cz+2]]}});
 // the ring path and the four paths out
 {const r0=C.ring-C.rw/2,r1=C.ring+C.rw/2,sd=rr(0,99);
  pbAdd(gridSurface((u,v)=>{const a=u*TAU,r=lerp(r1,r0,v);return[cx+Math.cos(a)*r,D+.03,cz+Math.sin(a)*r];},72,1,
   {uS:C.ring*TAU/16,vS:C.rw/16,hole:d>0?(u,v)=>h3(Math.floor(u*72),5,sd)<(d===1?.3:.08):null}),d>0?MAT.pkPaveR:MAT.pkPave,G);
  chStrip(G,[cx,cz+r1-.5],[cx,-F],4,d);chStrip(G,[cx,cz-r1+.5],[cx,-L+F],4,d);chStrip(G,[cx-r1+.5,cz],[-h+F,cz],4,d);chStrip(G,[cx+r1-.5,cz],[h-F,cz],4,d);}
 // the houses
 const decks=[];
 C.houses.forEach((H,i)=>{const R=chPRNG(20880+i),a=(22.5+45*i)*Math.PI/180,hx=cx+Math.cos(a)*C.slot,hz=cz+Math.sin(a)*C.slot,face=a+Math.PI;
  const rb=R(),burnt=d===1&&i===5,cone=d===1?(rb<.45?2:rb<.7?1:0):0;
  const ex=H.t==='tank'?H.r+1.5:H.t==='twin'?H.r*.6:(H.r+1.7);
  chStrip(G,[hx+Math.cos(face)*(ex-.5),hz+Math.sin(face)*(ex-.5)],[cx+Math.cos(a)*(C.ring+C.rw/2-.5),cz+Math.sin(a)*(C.ring+C.rw/2-.5)],2.4,d);
  if(H.t==='silo'){const S=chSilo(G,hx,hz,H.r,H.h+(d===3&&!H.solar?0:0),d,{face,burnt,solar:H.solar&&d!==1,cone,cap:d===3&&R()<.6});
   decks.push({x:hx,z:hz,y:S.deck.y,r:S.deck.r});
   if(H.annex){const ta=face+Math.PI/2,ax=hx+Math.cos(ta)*(H.r+3.4),az=hz+Math.sin(ta)*(H.r+3.4);
    chUnit(ax,D,az,-ta,false,d,{burnt,lit:.6,doorSide:0,endGlass:1});
    if(d===0)portGarden(hx+Math.cos(ta+1.2)*(H.r+4),D,hz+Math.sin(ta+1.2)*(H.r+4),5,3,d);}
   REGISTER({name:'Silo house',x:hx,z:hz,r:H.r+1.9,h:H.h+H.r*.5,y:D});}
  else if(H.t==='twin'){const ta=face+Math.PI/2,o=H.r+2.2,p=[[hx+Math.cos(ta)*o,hz+Math.sin(ta)*o],[hx-Math.cos(ta)*o,hz-Math.sin(ta)*o]];
   p.forEach((q,k)=>{const S=chSilo(G,q[0],q[1],H.r,H.h-k*2,d,{face,cone:d===1?(k?2:1):0,solar:k===0&&d!==1});if(k===0)decks.push({x:q[0],z:q[1],y:S.deck.y,r:S.deck.r});});
   // a container bridging the two at deck level: the shared room
   const by=D+Math.min(5.4,(H.h-2)*.46)+.1;
   if(d===1)kput('pkCont20R',[hx+Math.cos(face)*3,D+.9,hz+Math.sin(face)*3],qEuler(0,-ta,0).multiply(qEuler(.4,0,.1)),1,chCol(1));
   else{chUnit(hx,by,hz,-ta,false,d,{lit:.7,doorSide:0,endGlass:0});for(const s of [-1,1])kput('chBar',[hx+Math.cos(ta)*s*2,(D+by)/2,hz+Math.sin(ta)*s*2],null,[.18,by-D,.18],chFrameCol(d));}
   REGISTER({name:'Twin silo house',x:hx,z:hz,r:o+H.r*.2+1,h:H.h+H.r*.5,y:D});}
  else{chTankHouse(G,hx,hz,-(a+Math.PI/2),H.r,H.L,d,{slide:rb<.6});}
  if(d===0)portFigures(hx+Math.cos(face)*(ex+2),D,hz+Math.sin(face)*(ex+2),2,1.5);
  if(d===3){portFigures(hx+Math.cos(face)*(ex+2),D,hz+Math.sin(face)*(ex+2),4,2);
   // a shack leaning on the house, a washing line to the next one
   const sa=face+Math.PI*.6,sx=hx+Math.cos(sa)*(ex+1.6),sz=hz+Math.sin(sa)*(ex+1.6);
   kput('shantyBox',[sx,D+1.2,sz],qEuler(0,-sa,0),[3,2.4,2.6],null);kput('shantyRoof',[sx,D+2.55,sz],qEuler(.15,-sa,0),[3.6,1,3.2],null);}
  if(d===1){portTrees(hx-8,hz-8,hx+8,hz+8,2,D,5,10);portWeeds(hx-10,hz-10,hx+10,hz+10,30,D);}});
 // the green: the water tower, beds, benches, people
 const wt=chWaterTower(G,cx,cz,d);
 if(d!==1){for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;portGarden(cx+Math.cos(a)*13,D,cz+Math.sin(a)*13,6,4,d);}
  for(let k=0;k<4;k++){const a=k*Math.PI/2;chTable(cx+Math.cos(a)*9,cz+Math.sin(a)*9,a);}
  portFigures(cx,D,cz,d===3?14:7,16);chFirePit(cx+7,cz-15,d);
  for(let k=0;k<8;k++){const a=(k+.5)/8*TAU;chLamp(cx+Math.cos(a)*(C.ring+C.rw/2+.6),D,cz+Math.sin(a)*(C.ring+C.rw/2+.6),d,3.2);}}
 else{portWeeds(-h+2,-L+2,h-2,-2,200,D);portTrees(cx-18,cz-18,cx+18,cz+18,6,D,5,11);}
 if(d===0)for(const [x,z] of [[-44,-10],[44,-10],[-44,-100],[44,-100],[-20,-12],[20,-98]])VEG.tree(x,D,z,(rng()*3)|0,rr(5,8));
 if(d===3){
  if(wt)for(const dk of decks)chBulbs(wt,[dk.x,dk.y+2.5,dk.z],10,1.2);
  for(let k=0;k<10;k++){const a=(k+.5)/10*TAU;portStall(cx+Math.cos(a)*(C.ring-3.2),D,cz+Math.sin(a)*(C.ring-3.2),-a-Math.PI/2);}
  // rope bridges from deck to deck round the ring
  for(let i=0;i<decks.length;i++){const A=decks[i],B=decks[(i+1)%decks.length],dd=Math.hypot(B.x-A.x,B.z-A.z);if(dd>32)continue;
   const ux=(B.x-A.x)/dd,uz=(B.z-A.z)/dd;chBridge([A.x+ux*A.r,A.y,A.z+uz*A.r],[B.x-ux*B.r,B.y,B.z-uz*B.r],1.2,.6);}
  portWeeds(-h+4,-L+4,h-4,-4,40,D);}
 KOFF=[0,0,0];return G;}
PORT_SEG({key:'chTank',name:'Silo and tank houses',cls:'seg',W:110,LAND:110,SEA:0,place:'land',decays:[0,1,3],norepair:true,
  stamps:chStampsFor({0:'grass',1:'soil',3:'dry'},[[-20,-75,20,-35,{0:'grass',1:'soil',3:'grass'}]]),build:buildChTank});
