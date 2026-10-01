// ================================================================= GATE ALT — "the Horns"
// Two ribbed horns rise from one stepped plinth, swell outward and curl back
// in, so their points almost meet 220 m over the road. The road goes through
// the plinth under a great parabolic arch, and a glazed bridge is slung between
// the horns at 100 m. Each horn is a lens in plan, deeper than it is wide, so
// from the road it reads slender and from the side massive. After arco1 #64
// and #65 (the pair of curved horn towers leaning to a near-meeting) and arco1
// #51 (the inward-curling petals of the Stone Flower).
// Ruin: the east horn snapped at 130 m and its point lies across the plain;
// the bridge parted in the middle and both halves hang from their horns.
function buildAltGate(scene,gx,gz,d){reseed(9912);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),SK=SHELL(d),acc=[],sk=[];
 REGISTER({name:'Gate alt — the Horns ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:140,h:230});
 const HH=220,PH=24,cx=(t,s)=>s*(62+26*Math.sin(Math.PI*t)-52*t*t*t),rad=t=>22*Math.pow(1-t,.8)+1.6,tSnap=fall?.6:2;
 const pt=(s,t,u)=>{const th=u*TAU,r=rad(t)*(1+.05*Math.pow(.5+.5*Math.cos(th*14),3));return[cx(t,s)+r*Math.cos(th),PH+t*(HH-PH),r*1.45*Math.sin(th)];};
 const hf=holeFn(d*.6,9912,null,1.2);
 const horn=(s,t0,t1,acc2,hole)=>{acc2.push(gridSurface((u,v)=>pt(s,lerp(t0,t1,v),u),56,Math.max(4,Math.round((t1-t0)*60)),
  {uS:30,vS:(t1-t0)*HH/8,hole}));};
 for(const s of[-1,1]){const snap=s>0&&fall;
  horn(s,0,snap?tSnap:1,sk,hf?(u,v)=>hf(u,v*(snap?tSnap:1)*HH):null);
  // a lid where the horn is cut, and the dark inside
  if(snap){const t=tSnap;sk.push(gridSurface((u,v)=>{const p=pt(s,t,u);return[lerp(cx(t,s),p[0],v),p[1]+fbm(u*5,v*3,1,2)*6-2,lerp(0,p[2],v)];},40,3,{uS:4,vS:2}));}
  mesh(gridSurface((u,v)=>{const t=v*(snap?tSnap:.96),p=pt(s,t,u),c=cx(t,s);return[lerp(c,p[0],.88),p[1],p[2]*.88];},24,20,{}),MAT.dark,G);
  // floor bands of light
  for(let y=PH+8;y<HH-12;y+=7){const t=(y-PH)/(HH-PH);if(snap&&t>tSnap-.02)break;const n=20;for(let k=0;k<n;k++){const u=(k+.5)/n;
   if(hf&&hf(u,t*HH))continue;const p=pt(s,t,u),q=pt(s,t,u+.5/n),dx=q[0]-p[0],dz=q[2]-p[2];
   kput('strip',[p[0]*1.0,p[1],p[2]],qEuler(0,-Math.atan2(dz,dx),0),[Math.hypot(dx,dz)*1.6,2,2],d>0?(altH(k,y,s)<.06?WARM:DEAD):(altH(k,y,s)<.7?CYAN:DEAD));}}}
 if(fall){// the fallen point of the east horn, lying east along the plain
  const F=new THREE.Group();F.position.set(160,0,40);F.rotation.order='YXZ';F.rotation.set(0,.5,-2.2);   // the point curls back, so it needs more than 90 degrees to lie downG.add(F);
  const fa=[];fa.push(gridSurface((u,v)=>{const t=lerp(tSnap,1,v),p=pt(1,t,u);return[p[0]-cx(tSnap,1),p[1]-PH-tSnap*(HH-PH),p[2]];},56,24,{uS:30,vS:10,hole:(u,v)=>fbm(u*5,v*4,8,2)<.3}));
  meshMerged(fa,SK,F);dropFragment(F,0,2);altHeap(150,40,40,120,3.5);altHeap(96,10,22,60,2.5);}
 meshMerged(sk,SK,G);
 // THE PLINTH: stepped, with the road arch through it
 const ps=new THREE.Shape();ps.moveTo(-150,0);ps.lineTo(150,0);ps.lineTo(150,PH);ps.lineTo(-150,PH);ps.lineTo(-150,0);
 const ar=new THREE.Path();const AW=54,AH=PH-4;ar.moveTo(-AW/2,0);for(let i=0;i<=24;i++){const x=-AW/2+AW*i/24;ar.lineTo(x,AH*(1-Math.pow(2*x/AW,2)));}ar.lineTo(AW/2,0);ps.holes.push(ar);
 const pg=new THREE.ExtrudeGeometry(ps,{depth:80,bevelEnabled:false,curveSegments:6});pg.translate(0,0,-40);
 const puv=pg.attributes.uv;for(let i=0;i<puv.count;i++)puv.setXY(i,puv.getX(i)/8,puv.getY(i)/8);acc.push(pg);
 for(let k=1;k<=3;k++)altBox(acc,0,k*1.5-.75,0,300+k*12,1.5,80+k*12);       // the steps round its foot
 altBox(acc,0,PH+1,0,286,2,72);
 // the arch soffit lined, and lamps on the road
 for(let k=-4;k<=4;k++)kput(d>0?'cellD':'cell',[k*5,AH*(1-Math.pow(k*10/AW,2))-1,0],qEuler(Math.PI/2,0,0),[3,40,1],d>0?null:WARM);
 // THE BRIDGE at 100 m
 const BY=100,tB=(BY-PH)/(HH-PH),xi=cx(tB,1)-rad(tB)*.9;
 if(!fall){altBox(acc,0,BY,0,2*xi,2,14);altBox(acc,0,BY+9,0,2*xi,1.2,14);
  if(d===0)kput('pane',[0,BY+4.5,7],null,[2*xi,7,1],null),kput('pane',[0,BY+4.5,-7],null,[2*xi,7,1],null);
  for(let x=-xi;x<=xi;x+=6)for(const z of[-7,7])kput(dd?'mullR':'mullW',[x,BY+4.5,z],null,[1,9,1],null);}
 else for(const s of[-1,1]){// each half hangs from its horn
  const P=new THREE.Group();P.position.set(s*xi,BY,0);P.rotation.set(0,0,s*1.15);G.add(P);
  const fa=[];altBox(fa,-s*xi/2*.9,0,0,xi*.9,2,14);altBox(fa,-s*xi/2*.9,9,0,xi*.9,1.2,14);meshMerged(fa,CM,P);
  useGroupXF(P);for(let x=0;x<xi*.9;x+=6)for(const z of[-7,7])kput('mullR',[-s*x,4.5,z],null,[1,9,1],null);endGroupXF();}
 altMerge(acc,CM,G);
 REGISTER({name:'Gate alt — the road arch',x:0,z:0,r:30,h:PH});
 REGISTER({name:'Gate alt — the bridge',x:0,z:0,r:60,h:16,y:BY-6});
 apron(G,0,0,160,200,d,.6);
 if(dd){mossOnRing(0,PH+2,0,100,50,3);for(const s of[-1,1])vinesOnRing(cx(.2,s),PH+40,0,rad(.2)*1.2,16,26);rubbleRing(0,0,0,150,180,50,2);altTrees(30,170,280,150,60);}
 else altTrees(14,180,280,150,60);
 figures(0,50,6,14);
 if(d===2){reseed(9937);
  for(const s of[-1,1])for(let y=PH+10;y<(s>0?120:180);y+=7){const t=(y-PH)/(HH-PH);for(let k=0;k<6;k++){const u=(k+.5)/6+.08;if(fbm(y*.05,k+s*3,6,2)<.48)continue;
   const p=pt(s,t,u),n=[p[0]-cx(t,s),0,p[2]],L=Math.hypot(n[0],n[2])||1;n[0]/=L;n[2]/=L;fireWindow(p,n,qFacing(n),3,2.4);}}
  altReclaim(G,{up:90,side:40,r:140,stalls:18,plots:16,people:26,key:'altGate'});}
 KOFF=[0,0,0];return G;}
