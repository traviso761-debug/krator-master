// ================================================================= OFFICE ALT 3 — "the Sail Fins"
// A long office slab bowed in plan, its convex face hung with balconies, and
// struck through every second bay by a tall sail-shaped fin: wide at the foot,
// sweeping up in a hollow curve to a point well above the roof. Seen along the
// face the fins overlap like a row of sails. After arco1 #6 (the bowed slab of
// sawtooth fins and stacked balconies) and the fin vocabulary of arco1 #31.
// Ruin: a run of bays east of centre pancaked down to the second floor, three
// fins snapped and lie at the foot, the balconies half gone, the glass gone.
function buildAltOfficeFins(scene,gx,gz,d){reseed(9907);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),SK=SHELL(d),acc=[],fin=[];
 REGISTER({name:'Office alt 3 — the Sail Fins ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:6,r:68,h:76});
 const Rc=130,A=.44,NB=18,FH=3.4,NF=16,H=NF*FH,DP=15,CZ=-Rc+14;   // CZ: the plan's centre of curvature
 const dth=2*A/NB,P=(r,th)=>[r*Math.sin(th),r*Math.cos(th)+CZ];
 const jc=12,down=j=>fall&&Math.abs(j-jc)<=1.5;
 // the slab, one box per bay; a collapsed bay keeps two floors and a heap of pancaked slabs
 for(let j=0;j<NB;j++){const th=-A+(j+.5)*dth,L=Rc*dth+.06,c=P(Rc-DP/2,th);
  const h=down(j)?FH*2+(altH(j,1,2)*3):fall&&Math.abs(j-jc)<=2.5?H-FH*(2+Math.round(altH(j,2,1)*3)):H;
  acBox(acc,c[0],h/2,c[1],L,h,DP,th);
  if(down(j)){for(let k=0;k<5;k++){const cc=P(Rc-DP/2+rr(-2,4),th+rr(-.3,.3)*dth);
    acBox(acc,cc[0],h+.6+k*1.1,cc[1],L*rr(.8,1.05),.7,DP*rr(.7,1),th+rr(-.15,.15),rr(-.18,.18),rr(-.12,.12));}
   const hp=P(Rc+8,th);altHeap(hp[0],hp[1],10,26,2.2);}
  // windows and balconies, storey by storey
  for(let f=0;f<NF;f++){const y=f*FH+FH*.5;if(y>h-.5)break;const q=qFacing([Math.sin(th),0,Math.cos(th)]);
   const w=P(Rc+.08,th),b=P(Rc+1.3,th),r=P(Rc+2.6,th);
   if(d===0){kput('darkPane',[w[0],y+.2,w[1]],q,[L*.72,FH*.62,1],null);
    if(altH(j,f,3)<.3)kput('cell',[w[0]+Math.sin(th)*.25,y+.2,w[1]+Math.cos(th)*.25],q,[L*.6,FH*.5,1],altH(f,j,3)<.5?WARM:CYAN);}
   else{kput('boxD',[w[0]-Math.sin(th)*.3,y+.2,w[1]-Math.cos(th)*.3],q,[L*.72,FH*.62,1],null);civWin('paneD',[w[0],y+.2,w[1]],q,[L*.72,FH*.62,1],.25);}
   if(f===0)continue;
   const gone=dd&&altH(j*1.7,f,9)<(fall?.4:.15);if(gone)continue;
   acBox(fin,b[0],y-FH*.5+.15,b[1],L*.86,.3,2.6,th);                        // balcony floor
   acBox(fin,r[0],y-FH*.5+.75,r[1],L*.86,1.2,.25,th);                       // its rounded-off parapet
   const aw=P(Rc+1.9,th);
   if(d===0||altH(f,j,5)<.25)kput(d===0?'boxW':'boxR',[aw[0],y+FH*.5-.35,aw[1]],qEuler(0,th,0).multiply(qEuler(-.35,0,0)),[L*.8,.12,2.6],
    d===0?new THREE.Color().setHSL(altH(j,0,0)<.5?.03:.07,.65,.52):null);}}
 // the roof and the two blind end walls
 for(const s of[-1,1]){const th=s*(A+.012),c=P(Rc-DP/2,th);acBox(acc,c[0],H/2+1,c[1],1.6,H+2,DP+2,th);}
 // THE FINS, at every second bay line and at both ends
 const prof=[[-4,0],[16,0],[15.4,6]],curve=[];for(let t=0;t<=1.0001;t+=.1)curve.push([15.4*Math.pow(1-t,1.7)+.8*t,6+t*(H+14)]);
 const fullP=prof.concat(curve.slice(1)).concat([[-.5,H+11],[-4,H+6]]);
 let fi=0;for(let j=0;j<=NB;j+=2,fi++){const th=-A+j*dth,c=P(Rc,th),ry=th-Math.PI/2;
  const snap=fall&&(fi===2||fi===5||fi===7);
  if(!snap){altFin(acc,fullP,1.4,c[0],0,c[1],ry);continue;}
  const yc=H*(.35+altH(fi,1,1)*.25),lo=[[-4,0],[16,0],[15.4,6]];let k=1;
  for(;k<curve.length&&curve[k][1]<yc;k++)lo.push(curve[k]);
  const ac=lerp(curve[k-1][0],curve[k][0],(yc-curve[k-1][1])/(curve[k][1]-curve[k-1][1]));
  lo.push([ac,yc],[ac*.55,yc+3.5],[ac*.2,yc-1.5],[-4,yc+1]);altFin(acc,lo,1.4,c[0],0,c[1],ry);
  // the snapped head: everything above yc, lying in the forecourt
  const hi=[[ac,yc]].concat(curve.slice(k)).concat([[-.5,H+11],[-4,H+6],[-4,yc+1]]).map(p=>[p[0],p[1]-yc]);
  const F=new THREE.Group(),fp=P(Rc+22+fi*2,th+(fi%2?.04:-.04));F.position.set(fp[0],0,fp[1]);F.rotation.order='YXZ';F.rotation.set(Math.PI/2-.08,ry+.6*(fi%2?1:-1),.1);G.add(F);
  const fa=[];altFin(fa,hi,1.4,0,0,0,0);meshMerged(fa,CM,F);dropFragment(F,0,.5);altHeap(fp[0],fp[1],8,14,1.6);}
 altMerge(acc,CM,G);altMerge(fin,SK,G);
 // roof plant and a forecourt pool along the curve
 for(let j=1;j<NB;j+=3){const th=-A+j*dth;if(down(j))continue;const c=P(Rc-DP/2,th);kput(PLATE(d),[c[0],H+2,c[1]],qEuler(0,th,0),[6,4,6],null);}
 const pool=gridSurface((u,v)=>{const th=lerp(-A*.8,A*.8,u),r=Rc+20+v*8;const p=P(r,th);return[p[0],.12,p[1]];},40,1,{uS:30,vS:1});
 mesh(pool,dd?MAT.turfR:MAT.water,G);
 apron(G,0,0,58,80,d,.4);
 if(dd){for(let j=0;j<NB;j++){const th=-A+(j+.5)*dth;const v=P(Rc+2.6,th);vinesOnRing(v[0],H*rr(.3,.95),v[1],1.5,2,12);}
  rubbleRing(0,0,-6,50,72,40,1.6);altTrees(20,60,110,70,40);}
 else altTrees(10,64,110,70,40);
 figures(0,40,5,20);
 if(d===2){reseed(9932);
  for(let j=0;j<NB;j++){if(down(j))continue;const th=-A+(j+.5)*dth,q=qFacing([Math.sin(th),0,Math.cos(th)]);
   for(let f=1;f<NF-3;f++){if(fbm(j*.3,f*.35,11,2)<.5)continue;const w=P(Rc+.3,th);fireWindow([w[0],f*FH+FH*.5,w[1]],[Math.sin(th),0,Math.cos(th)],q,Rc*dth*.6,FH*.5);}}
  acReclaim(G,{up:70,side:36,r:60,stalls:10,plots:10,people:16,key:'altOffF'});}
 KOFF=[0,0,0];return G;}
