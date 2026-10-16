// ---------------------------------------------------------------- vessel: Islander Drua (the Kautoan great double canoe)
// When the island kingdom of Kautoa rivalled the Hykkousoi for the sea, this was its ship of the line: two
// double-ended hulls of unequal length (31 m and 25 m) lashed to nine crossbeams under one broad deck, a
// deckhouse of mats under a thatched gable, a raised steering stage aft where the chief stands, and one huge
// crab-claw sail of pandanus mat on a raked mast. She shunts rather than tacks: the tack is carried to the
// other end, the mast is re-raked in its step, and stern becomes bow, so both ends of the main hull carry a
// tack socket and both ends of each hull a carved figure post with the white island moon, shell discs on the
// strakes and cowrie streamers. Steered with great oars over the lee end. (Ref: the Fijian drua, Tongan kalia.)
function rsDruaClaw(g,W,H,P){rsCloth(g,W,H,'#c4a46a',1,'v');g.save();rsPolyPath(g,P);g.clip();
 // the plaited pandanus: narrow strips, and the seams where the mats are sewn together, running with the boom
 for(let i=0;i<40;i++){g.fillStyle=`rgba(90,60,24,${.05+.05*(i%2)})`;g.fillRect(0,H*i/40,W,H/80);}
 g.strokeStyle='rgba(70,44,18,.45)';g.lineWidth=2;for(let k=1;k<9;k++){g.beginPath();g.moveTo(0,H*(1-k/9));g.lineTo(W,H*(1-k/9)-H*.42);g.stroke();}
 // bark-brown and sea-teal bands along the yard and the boom, the white island moon in the belly
 g.strokeStyle='#2a6a6a';g.lineWidth=W*.05;rsPolyPath(g,P);g.stroke();g.strokeStyle='#4a2a14';g.lineWidth=W*.018;rsPolyPath(g,rsInset(P,W*.04));g.stroke();
 const n0=P.length/2,ta=P[0],tm=[(P[n0-1][0]+P[n0][0])/2,(P[n0-1][1]+P[n0][1])/2],R=Math.min(W,H)*.12,mx0=lerp(ta[0],tm[0],.52),my0=lerp(ta[1],tm[1],.52);g.fillStyle='#f0e8d4';g.beginPath();g.arc(mx0,my0,R,0,TAU);g.fill();
 g.strokeStyle='#2a6a6a';g.lineWidth=R*.12;g.beginPath();g.arc(mx0,my0,R*1.18,0,TAU);g.stroke();g.restore();
 // the hollow of the claw between the two spar tips
 const n=P.length/2,a=P[n-1],b=P[n];const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,d=Math.hypot(a[0]-b[0],a[1]-b[1]);
 g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mx+d*.3,my-d*.1,d*.33,0,TAU);g.fill();g.globalCompositeOperation='source-over';}
function buildRsIslanderDrua(){reseed(73800);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const BARK=0x4a2e1c,DK=0x1e1612,SAND=0xc8b080,TEAL=0x2a6a6a,MOON=0xf0e8d4,DECK=0xa88a5a,SPAR=0x5a3a24;
 // the two hulls: the long one to starboard (toward the camera), the short one to port
 const HK=rsHull({L:31,B:2.4,fb:1.55,dr:1,sheerF:1,sheerA:1,sp:2.6,pb:2.6,pa:2.6,q:.6,n:2.6,flare:.15,rakeF:.9,rakeA:.9,keelEnd:.35,z0:3.2});
 const HC=rsHull({L:25,B:1.9,fb:1.35,dr:.85,sheerF:.9,sheerA:.9,sp:2.6,pb:2.6,pa:2.6,q:.6,n:2.6,flare:.15,rakeF:.8,rakeA:.8,keelEnd:.3,z0:-4.4});
 for(const H of[HK,HC]){rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?DK:h>.83?TEAL:h>.79?SAND:h<.3?0x241812:BARK,72,10);rsFoam(B,H,.55);
  rsDeck(B,H,{bw:.22,col:0x3a2a1c});rsSpine(B,H,.12,DK);rsWale(B,H,.86,.05,'rope',SAND);
  // the white moon on the outer side at both ends, ringed in teal
  const so=H===HK?1:-1;for(const u of[.17,.83]){rsDecal(B,H,u,so,.6,.5,TEAL,'paint',20,.04);rsDecal(B,H,u,so,.6,.4,MOON,'paint',20,.07);}
  // shell discs along the top strake toward each end
  for(const s of[-1,1])for(const u0 of[.05,.8])for(let i=0;i<6;i++){const u=u0+i*.025,p=H.pt(u,s,.93),N=H.nrm(u,s,.93);rsSphere(B,'paint',.07,[p[0]+N.x*.04,p[1],p[2]+N.z*.04],[1,1,.45],0xf4eee0,6,4);}
  // carved figure posts at both ends: stacked heads, a white moon disc, a cowrie streamer
  for(const e of[0,1]){const p=H.pt(e,0,1),dir=e?1:-1,k=H===HK?1:.85;
   rsTube(B,'wood',[[p[0]-dir*.1,p[1]-.2,p[2]],[p[0]+dir*.25,p[1]+.9*k,p[2]],[p[0]+dir*.2,p[1]+2.2*k,p[2]],[p[0]+dir*.05,p[1]+3.1*k,p[2]]],.16,DK,14,8);
   for(let j=0;j<3;j++){const y=p[1]+(.8+j*.75)*k,x=p[0]+dir*(.24-j*.05);rsSphere(B,'wood',.24,[x+dir*.06,y,p[2]],[1,1.15,.9],j%2?BARK:0x3a2418,8,6);
    for(const s of[-1,1])rsSphere(B,'paint',.05,[x+dir*.24,y+.06,p[2]+s*.1],null,MOON,5,4);rsBox(B,'wood',[.12,.08,.3],[x+dir*.27,y-.1,p[2]],null,0x6a2a18);}
   const top=[p[0]+dir*.05,p[1]+3.25*k,p[2]];rsCyl(B,'paint',.42*k,.42*k,.06,top,[Math.PI/2,0,0],MOON,18);rsCyl(B,'paint',.5*k,.5*k,.04,top,[Math.PI/2,0,0],TEAL,18);
   rsPennant(B,[top[0],top[1]+.45,top[2]],2.2,.22,[MOON,SAND,TEAL]);}}
 // nine crossbeams on saddles, lashed; the deck of athwartship planks; yD is the deck
 const yB=HK.ys(.5)+.12,yD=yB+.22;
 for(let i=0;i<9;i++){const x=lerp(-10,10,i/8);rsBox(B,'wood',[.32,.28,10.4],[x,yB,-.5],null,0x6a4a30);
  rsBox(B,'wood',[.5,yB-HC.ys(HC.uAt(x))-.1,.6],[x,(yB+HC.ys(HC.uAt(x)))/2-.07,-4.4],null,0x5a3a24);
  for(const z of[-4.4,3.2])rsBox(B,'rope',[.46,.38,.62],[x,yB,z],null,SAND);}
 for(let i=0;i<34;i++){const x=lerp(-9.8,9.8,i/33);rsBox(B,'wood',[.56,.08,7.8],[x,yB+.18,-.3],[0,rr(-.015,.015),0],new THREE.Color(DECK).offsetHSL(0,0,rr(-.04,.03)));}
 // the deckhouse: mat walls, a thatched gable; gable ends closed, a white moon over the door
 const hx=-1.6,hz=-.7,hw=6.4,hd=4.2,hh=1.9,rh=1.7;
 rsCabin(B,{x:hx,y:yD,z:hz,w:hw,d:hd,h:hh,mk:'thatch',wall:0xb89a64,roof:'gable',roofMk:'thatch',roofCol:0xc8b27c,rh,over:.4,win:2,winCol:0x2a1c12});
 for(const s of[-1,1]){const sh=new THREE.Shape();sh.moveTo(-hd/2,0);sh.lineTo(hd/2,0);sh.lineTo(0,rh);sh.lineTo(-hd/2,0);
  rsPut(B,'thatch',rsUV(new THREE.ShapeGeometry(sh),2),[hx+s*hw/2,yD+hh,hz],[0,Math.PI/2,0],null,0xa88a54);}
 rsBox(B,'paint',[.06,1.4,1],[hx+hw/2+.03,yD+.7,hz],null,0x1a1410);rsCyl(B,'paint',.42,.42,.05,[hx+hw/2+.06,yD+hh+.62,hz],[0,0,Math.PI/2],MOON,18);
 rsLink(B,'wood',[hx-hw/2-.5,yD+hh+rh+.06,hz],[hx+hw/2+.5,yD+hh+rh+.06,hz],.09,0x5a3a24,6);
 // the raised steering stage aft, on posts, railed; the chief, two steersmen, the royal streamer of Kautoa
 const sx0=-10.4,sx1=-7.4,sz0=-1.6,sz1=2.6,sy=yD+2.3;
 for(const x of[sx0+.15,(sx0+sx1)/2,sx1-.15])for(const z of[sz0+.15,sz1-.15])rsLink(B,'wood',[x,yD,z],[x,sy,z],.1,0x5a3a24,6);
 rsBox(B,'wood',[sx1-sx0,.14,sz1-sz0],[(sx0+sx1)/2,sy-.07,(sz0+sz1)/2],null,0x7a5a38);
 for(const z of[sz0+.1,sz1-.1])rsLink(B,'wood',[sx0,sy+.95,z],[sx1,sy+.95,z],.04,0x5a3a24,5);rsLink(B,'wood',[sx0+.1,sy+.95,sz0],[sx0+.1,sy+.95,sz1],.04,0x5a3a24,5);
 for(const x of[sx0+.1,sx1-.1])for(const z of[sz0+.1,sz1-.1])rsLink(B,'wood',[x,sy,z],[x,sy+.95,z],.04,0x5a3a24,5);
 for(let i=0;i<6;i++){const y=yD+.3+i*.36;rsLink(B,'wood',[sx1+.15,y,.2],[sx1+.15,y,.9],.035,0x6a4a30,4);}for(const z of[.2,.9])rsLink(B,'wood',[sx1+.25,yD,z],[sx1+.05,sy+.4,z],.04,0x6a4a30,4);
 rsFigure(B,[-8.6,sy,1],0,0xf0e8d4,false,0x6a4028);rsFigure(B,[-9.8,sy,-.8],Math.PI,TEAL,false,0x6a4028);rsFigure(B,[-9.7,sy,2.1],Math.PI,0x8a5a32,false,0x6a4028);
 rsLink(B,'wood',[sx0+.3,sy,sz0+.3],[sx0+.3,sy+6.5,sz0+.3],.06,DK,5);rsPennant(B,[sx0+.3,sy+6.5,sz0+.3],4.2,.8,[MOON,TEAL,0x4a2a14,TEAL]);
 // the steering oars over the stern of each hull
 rsLink(B,'wood',[-13.2,HK.ys(.08)+.4,3.95],[-18.2,-1.4,4.5],.12,0x6a4a30,6);rsBox(B,'wood',[2.6,1,.12],[-17.6,-1.05,4.43],[0,0,.68],0x6a4a30);
 rsLink(B,'wood',[-10.8,HC.ys(.08)+.4,-5],[-15.4,-1.2,-5.5],.1,0x6a4a30,6);rsBox(B,'wood',[2.2,.8,.1],[-14.9,-.9,-5.45],[0,0,.7],0x6a4a30);
 // tack sockets at both ends of the long hull (she shunts), the mast step
 for(const x of[12.5,-12.5])rsBox(B,'wood',[.6,.5,.6],[x,HK.ys(HK.uAt(x))+.15,2.6],null,0x3a2418);
 const mf=[4.5,yD,2.95],mh=[5.6,yD+9.4,2.95];rsBox(B,'wood',[1,.4,.9],[mf[0],yD+.2,mf[2]],null,0x3a2418);
 // the mast, raked toward the bow; the crab-claw: the yard rises from the tack at the bow, the boom runs aft
 rsLink(B,'wood',[mf[0],yD-.1,mf[2]],mh,.2,SPAR,8,.13);
 rsRig(B,[mf,mh]);const S=rsSail(B,{key:'drua-claw',O:[12.5,HK.ys(HK.uAt(12.5))+.45,2.6],U:[-1,0,0],V:[0,1,0],belly:1.2,nu:24,nv:12,
  A:t=>[t*19+Math.sin(Math.PI*t)*1.5,t*20.5],Bf:t=>[t*22.5,t*6.2+Math.sin(Math.PI*t)*1.2],draw:rsDruaClaw});
 rsSailEdge(B,S,0,.15,SPAR,0,1.04);rsSailEdge(B,S,1,.13,SPAR,0,1.03);
 rsRope(B,[mh[0],mh[1]+.2,mh[2]],S.at(.36,0),.035);rsRope(B,S.at(.75,1),[-9.6,sy+.9,2.4],.03);
 for(const u of[.25,.5,.75]){const p=S.at(u,0);rsPennant(B,[p[0],p[1]+.2,p[2]],1.4,.12,[MOON,SAND]);}
 {const p=S.at(1.04,0);rsPennant(B,p,3,.3,[MOON,TEAL,0x4a2a14]);const q=S.at(1.03,1);rsPennant(B,q,2,.2,[MOON,TEAL]);}rsRigEnd(B);
 rsRope(B,mh,[15.4,HK.ys(1)+.2,3.2]);for(const x of[2.4,6.4])rsRope(B,mh,[x,yB,4.45]);
 // the crew, cargo for the voyage, spears racked against the house, paddles stowed
 for(const [x,z,c] of[[1.6,-3.4,TEAL],[-.2,2.2,0x8a5a32],[3.4,.4,SAND],[-6.4,-2.8,0xf0e8d4],[6.2,-2.2,TEAL],[-5.4,1.8,0x8a5a32],[2.6,-1.8,0x6a2a18]])
  rsFigure(B,[x,yD,z],rr(0,TAU),c,false,0x6a4028);
 for(const [x,z] of[[7.2,-3.4],[7.6,-2.6],[8.4,-3.3],[-6.4,-.4],[-6.9,.3]])rsFigure(B,[x,yD,z],Math.PI/2,[TEAL,SAND,0x8a5a32][Math.floor(rng()*3)],true,0x6a4028);
 for(let i=0;i<9;i++){const x=rr(5.5,9),z=rr(-1.2,1.6);rsSphere(B,'thatch',.32,[x,yD+.28,z],[1,.8,1],0xb89a5a,8,6);}
 for(let i=0;i<4;i++)rsCyl(B,'paint',.22,.26,.6,[-5.8+i*.55,yD+.3,-3.2],null,0x8a5a2a,8);
 for(let i=0;i<10;i++){const x=hx-hw/2+.6+i*.55;rsLink(B,'wood',[x,yD,hz-hd/2-.35],[x+.2,yD+2.6,hz-hd/2-.15],.025,0x5a4028,4);rsCone(B,'paint',.045,.28,[x+.21,yD+2.74,hz-hd/2-.15],null,0xb0b4b8,4);}
 for(let i=0;i<6;i++)rsLink(B,'wood',[-9+i*.5,yB+.32,-3.9],[-6+i*.5,yB+.32,-3.6],.04,0x8a6a44,4);
 rsBake(B,V.group,'islanderDrua');V.deckY=yD;return V;}
RS_VESSEL({key:'islanderDrua',name:'Islander Drua',culture:'ringsea-islander',L:33,B:12,H:24,
 tags:{type:['warship','double canoe','voyager'],propulsion:['sail','paddles'],hull:'catamaran',wealth:'royal',crew:150,role:'the Kautoan ship of the line: war, tribute and deep-sea voyaging'},
 blurb:'The Kautoan great double canoe: unequal hulls under one deck, a thatched deckhouse, a steering stage and a huge shunting crab-claw sail.',build:buildRsIslanderDrua});
