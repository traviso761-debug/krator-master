// ---------------------------------------------------------------- vessel: Iziz Dhoni
// The coaster of the Iziz settlers: a 15 m lime-washed hull with a teal sheer band, its stem swept up
// into the tall curved post of the dhoni and ending in a carved finial; one raked mast and a great
// cream lateen on a long yard; a palm-thatched shade aft over the helm, fish baskets and water jars
// forward. It carries the Iziz vernacular's ochre and teal out onto the Ring Sea. (Ref: Maldives dhoni.)
function rsLateenCream(g,W,H,P){rsCloth(g,W,H,'#ece2c8',10,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#a89468';g.lineWidth=W*.02;rsPolyPath(g,P);g.stroke();
 g.fillStyle='rgba(180,90,40,.8)';const [cx,cy]=rsCentroid(P);for(let i=0;i<3;i++){g.beginPath();g.moveTo(cx-W*.08+i*W*.08,cy+H*.08);g.lineTo(cx-W*.04+i*W*.08,cy-H*.02);g.lineTo(cx+i*W*.08,cy+H*.08);g.closePath();g.fill();}g.restore();}
function buildRsIzizDhoni(){reseed(71800);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const WHITE=0xe8e2d2,TEAL=0x2a8a8a,OCHRE=0xc88a3a,DK=0x3a2a1c;
 const H=rsHull({L:15,B:4.2,fb:1.4,dr:.95,sheerF:1.6,sheerA:.9,sp:2.4,pb:2.3,pa:1.9,q:.6,n:2.4,flare:.12,rakeF:1.4,rakeA:.4,transom:.25,keelEnd:.3});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?TEAL:h>.84?OCHRE:h<.34?0x7a3020:WHITE);rsFoam(B,H,.6);
 const dY=rsDeck(B,H,{bw:.4,col:0xa88a62});rsWale(B,H,.9,.06,'wood',DK);
 // the dhoni's stem: sweeping up from the stem head into a tall inward-curling post
 const pb=H.pt(1,0,1);rsSpine(B,H,.14,DK,[[pb[0]+.5,pb[1]+.8],[pb[0]+.7,pb[1]+2],[pb[0]+.5,pb[1]+3.2],[pb[0]+.05,pb[1]+3.9]]);
 rsCone(B,'paint',.16,.6,[pb[0]-.1,pb[1]+4.2,0],[0,0,.6],OCHRE,6);
 for(const s of[-1,1])for(let i=0;i<3;i++)rsDecal(B,H,.9-i*.035,s,.87,.12,OCHRE,'paint',8,.06);
 // the shade and the helm aft; baskets and jars forward
 {const x=-4.6,y=dY(.2);for(const a of[-1,1])for(const b of[-1,1])rsLink(B,'wood',[x+a*1.3,y,b*1.3],[x+a*1.3,y+2.1,b*1.3],.05,DK,5);
  for(const s of[-1,1])rsPut(B,'thatch',rsUV(new THREE.BoxGeometry(3.2,.12,1.7),2),[x,y+2.35,s*.72],[s*.32,0,0],null,0xc0aa70);rsSolid(B,[x-1.6,y+2,-1.5],[x+1.6,y+2.7,1.5]);
  rsFigure(B,[-6.2,dY(.08),0],0,0xe8dcc0);rsLink(B,'wood',[-6.8,dY(.06)+.9,0],[-7.8,-.8,0],.06,DK,5);rsBox(B,'wood',[.9,1.2,.1],[-7.7,-.9,0],null,DK);}
 for(let i=0;i<6;i++){const x=rr(1.5,4),z=rr(-1.2,1.2);rsCyl(B,i%2?'thatch':'paint',.3,.22,.5,[x,dY(H.uAt(x))+.25,z],null,i%2?0xc8a870:0xb86a3a,10);}
 // the mast (raked forward), the long yard and the lateen
 const mx=1.2,base=dY(H.uAt(mx)),mh=9.5,rk=.12;const top=[mx+Math.sin(rk)*mh,base+mh,0];rsLink(B,'wood',[mx,base-.2,0],top,.14,0x6a4a2c,8,.09);
 const tack=[7.2,1.4],peak=[-7.6,12.2],clew=[-2.1,1.4];   // the clew stays forward of the shade
 rsRig(B,[[mx,base-.2,0],top]);const S=rsSail(B,{key:'iziz-lateen',O:[0,base,.32],U:[1,0,0],V:[0,1,0],belly:-.9,nu:20,nv:10,
  A:t=>[lerp(tack[0],peak[0],t),lerp(tack[1],peak[1],t)+Math.sin(Math.PI*t)*.5],Bf:t=>[lerp(clew[0],peak[0],t)+Math.sin(Math.PI*t)*.4,lerp(clew[1],peak[1],t)],draw:rsLateenCream});
 const yd=[];for(let k=0;k<=16;k++)yd.push(S.at(k/16,0));yd.unshift([yd[0][0]+1,yd[0][1]-.4,yd[0][2]]);rsTube(B,'wood',yd,t=>.13*(1-.5*Math.abs(t-.35)),0x7a5634,40,6);
 rsRope(B,top,S.at(.45,0));rsRope(B,S.at(0,1),[-6,dY(.1)+.4,1.4]);rsRope(B,top,[H.xAt(0,1),H.ys(0),0]);rsRope(B,yd[0],[pb[0],pb[1]+.2,0]);rsRigEnd(B);
 // round 2: a painted chevron strake, a small mizzen lateen, rods out over the side, fish drying on
 // a line to the stem, a pennant off the stem finial, a lantern at the helm
 for(const a of rsAlong(H,.12,.9,22,.87)){const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),a.n).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2));
  rsPut(B,'paint',new THREE.CircleGeometry(.16,3),[a.p[0]+a.n.x*.06,a.p[1],a.p[2]+a.n.z*.06],q,null,a.u*22%2<1?OCHRE:0x1a5a6a);}
 {const mz=-6.1,bz=dY(H.uAt(mz));rsLink(B,'wood',[mz,bz-.2,0],[mz-.3,bz+7.6,0],.08,0x6a4a2c,6,.05);
  const S2=rsSail(B,{key:'iziz-lateen-small',O:[0,bz,-.22],U:[1,0,0],V:[0,1,0],belly:.4,nu:10,nv:6,A:t=>[lerp(-5.4,-9.6,t),lerp(3,7.6,t)],Bf:t=>[lerp(-8.8,-9.6,t),lerp(2.9,7.6,t)],draw:rsLateenCream});
  rsLink(B,'wood',[-5,bz+2.7,-.22],[-10,bz+7.9,-.22],.06,0x7a5634,5);}
 for(const s of[-1,1]){const b=[2.8,dY(H.uAt(2.8))+.3,s*1.6];rsLink(B,'wood',b,[4.2,b[1]+3.2,s*4.6],.03,0x9a8a58,4);rsRope(B,[4.2,b[1]+3.2,s*4.6],[4.4,-.1,s*5],.006,0xe8e0c8);}
 {const a=[top[0]-.1,base+3.2,0],b=[pb[0]+.3,pb[1]+1.6,0];rsRope(B,a,b,.012);for(let i=1;i<9;i++){const t=i/9;rsBox(B,'paint',[.08,.45,.14],[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.25,0],null,0xa8b0b0);}}
 rsLink(B,'wood',[pb[0]+.1,pb[1]+4.4,0],[pb[0]+.1,pb[1]+5.6,0],.02,DK,4);rsPennant(B,[pb[0]+.1,pb[1]+5.6,0],1.8,.4,[TEAL,OCHRE]);
 rsSphere(B,'glow',.14,[-5.9,dY(.1)+2,.9],[1,1.3,1],0xffa050,8,6);
 for(const [x,z] of[[2.5,-.8],[4.5,.6]])rsFigure(B,[x,dY(H.uAt(x)),z],rr(0,TAU),[0xe8dcc0,0x2a8a8a][Math.floor(rng()*2)]);
 rsBake(B,V.group,'izizDhoni');V.deckY=base;return V;}
RS_VESSEL({key:'izizDhoni',name:'Iziz Dhoni',culture:'iziz-vernacular',L:18,B:6,H:14,
 tags:{type:['merchant','fishing','coaster'],propulsion:['sail'],hull:'monohull',wealth:'middle',crew:6,role:'coastal trader and fisher'},
 blurb:'A lime-washed hull with the tall curled dhoni stem, a cream lateen on a long yard, a thatched shade aft.',build:buildRsIzizDhoni});
