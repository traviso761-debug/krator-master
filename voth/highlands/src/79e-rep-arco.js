// ================================================================= REPUBLICAN — the Fallen Arcology quarter (round 9, rebuilt round 10)
// Travis: "Include a small district built into a toppled and partly-broken arcology" (after a painting of a pyramid split
// in two, its halves leaning apart, a town packed into the cleft). Two leaning half-pyramids of Ancient stone faced in a
// labyrinth relief, a great broken slab fallen against the back, rubble and drifted earth at their feet; in the cleft a
// crowd of narrow frame towers; terraces cut into the triangular faces with huts on them and stairs zig-zagging up;
// a row of small houses and a stall at the cleft's mouth. The ruin is Ancient; everything on it is Republican.
TEX.hMaze=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#c4bba8';g.fillRect(0,0,w,h);const N=8,C=w/N;
 // a depth-first maze on an 8x8 grid (fixed seed: the same relief everywhere, as on the Ancients' own faces)
 let s=90217;const R=()=>(s=(s*16807)%2147483647)/2147483647;const seen=new Set(),st=[[0,0]];seen.add('0,0');const cut=[];
 while(st.length){const [cx,cy]=st[st.length-1];const nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[(cx+dx+N)%N,(cy+dy+N)%N]).filter(([x,y])=>!seen.has(x+','+y));
  if(!nb.length){st.pop();continue;}const nx=nb[Math.floor(R()*nb.length)];seen.add(nx[0]+','+nx[1]);cut.push([cx,cy,nx[0],nx[1]]);st.push(nx);}
 g.lineCap='square';for(const [lw,col,o] of[[C*.46,'#6e665a',0],[C*.3,'#8a8274',1.5]]){g.strokeStyle=col;g.lineWidth=lw;
  for(const [a,b,c,d] of cut){if(Math.abs(a-c)>1||Math.abs(b-d)>1)continue;g.beginPath();g.moveTo((a+.5)*C+o,(b+.5)*C+o);g.lineTo((c+.5)*C+o,(d+.5)*C+o);g.stroke();}}
 g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=2;for(let k=0;k<=N;k++){g.beginPath();g.moveTo(0,k*C);g.lineTo(w,k*C);g.stroke();}});
MAT.hMaze=hStd({map:TEX.hMaze,roughness:.95});vWorldUV(MAT.hMaze,.09);
kdef('hMazeW',VGABLE,MAT.hMaze);kdef('hMazeB',VBOX,MAT.hMaze);
// Round 10 (Travis: "run quality pass on the fallen arcology district, make it look more like a fallen space ship"):
// the arcology is one of the Launch Arcologies that came down again — a plated hull some 24 m across, broken in two on
// impact. The fore half lies nose-down in the earth it ploughed up (a berm and a furrow before it); the aft half,
// slewed off line, still carries its engine bells and fins, one fin snapped off and driven into the ground. At the
// break the decks stand exposed, ribs and torn plates hanging; a band of the Ancients' labyrinth relief runs round both
// halves. The town is the same as before: frame towers packed into the cleft, terraces cantilevered off the flanks
// with huts on them and stairs zig-zagging up, houses on the crown, an airlock turned into a lantern-lit gate.
TEX.hShip=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#8c8a84';g.fillRect(0,0,w,h);let s=4411;const R=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let r=0;r<4;r++)for(let c=0;c<4;c++){const v=Math.floor(138+R()*16);g.fillStyle=`rgb(${v+6},${v+4},${v})`;g.fillRect(c*64+2,r*64+2,60,60);   // plates, each its own tone
  g.fillStyle='rgba(40,34,30,.5)';for(let k=0;k<6;k++){g.beginPath();g.arc(c*64+6+k*10.4,r*64+5,1.3,0,TAU);g.fill();g.beginPath();g.arc(c*64+6+k*10.4,r*64+59,1.3,0,TAU);g.fill();}}
 g.strokeStyle='rgba(30,26,24,.55)';g.lineWidth=1.5;for(let k=0;k<=4;k++){g.beginPath();g.moveTo(0,k*64);g.lineTo(w,k*64);g.stroke();g.beginPath();g.moveTo(k*64,0);g.lineTo(k*64,h);g.stroke();}
 for(let k=0;k<14;k++){const x=R()*w,y=R()*h,l=20+R()*70;const gr=g.createLinearGradient(x,y,x,y+l);gr.addColorStop(0,'rgba(60,40,30,.45)');gr.addColorStop(1,'rgba(60,40,30,0)');g.fillStyle=gr;g.fillRect(x,y,3+R()*5,l);}   // rust runs
 for(let k=0;k<5;k++){const x=R()*w,y=R()*h;const gr=g.createRadialGradient(x,y,0,x,y,30+R()*30);gr.addColorStop(0,'rgba(20,16,14,.35)');gr.addColorStop(1,'rgba(20,16,14,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);}});   // re-entry scorch
TEX.hShip.repeat.set(12,6);MAT.hShip=hStd({map:TEX.hShip,roughness:.62,metalness:.35});
TEX.hShipW=TEX.hShip.clone();TEX.hShipW.needsUpdate=true;TEX.hShipW.repeat.set(1,1);MAT.hShipW=hStd({map:TEX.hShipW,roughness:.62,metalness:.35});vWorldUV(MAT.hShipW,1/16);
kdef('hShipB',VBOX,MAT.hShipW);
TEX.hMazeBand=TEX.hMaze.clone();TEX.hMazeBand.needsUpdate=true;TEX.hMazeBand.repeat.set(24,1);MAT.hMazeBand=hStd({map:TEX.hMazeBand,roughness:.9});
kdef('hShipC',new THREE.CylinderGeometry(1,1,1,40,1,true),MAT.hShip);                                  // hull, centred, axis y
kdef('hShipBand',new THREE.CylinderGeometry(1,1,1,40,1,true),MAT.hMazeBand);
kdef('hShipNose',new THREE.LatheGeometry([[1,0],[.97,.18],[.9,.36],[.78,.54],[.6,.7],[.38,.85],[.16,.96],[0,1]].map(p=>new THREE.Vector2(p[0],p[1])),40),MAT.hShip);
kdef('hShipBell',new THREE.CylinderGeometry(.42,1,1,24,1,true),MAT.rust);                               // engine bell: narrow at +y
kdef('hShipDisc',new THREE.CylinderGeometry(1,1,1,40).translate(0,.5,0),MAT.hShip);                    // thrust plate, base at y=0
kdef('hShipCap',new THREE.CircleGeometry(1,40),MAT.void);                                              // the dark inside of a broken end
function buildHlRepArcoQuarter(G,o){reseed(22201+(o.v|0));
 const ash=hC(vPick(HPAL.ashlar)),log=hC(vPick(HPAL.aged)),corr=hC(vPick(HSV.corr)),sh=hC(vPick(HPAL.shingle)),sand=hC(0x9a8260),rust=hC(vPick(HSV.rust)),iron=hC(0x3a3430),lit=vLit()?'lit':'glass';
 const hull=hC(0xb4b0a6),dark=hC(0x2a2624),bell=hC(0x4a4440);
 vnReg('The Fallen Arcology',0,-2,46,22);vnReg('Arcology quarter',0,4,16,18);
 const R=12,Q=P=>qEuler(0,P.yaw,0).multiply(qEuler(0,0,Math.PI/2));                                  // hull axis along local x of the half
 const A={cx:-26,cz:-1,L:38,yaw:.07,yc:R*.58},B={cx:27,cz:1.5,L:38,yaw:-.13,yc:R*.66};
 const ax=(P,u,y,oz)=>{const p=loc(P.cx,P.cz,u,oz||0,P.yaw);return[p[0],y,p[1]];};
 const flankZ=(P,y)=>Math.sqrt(Math.max(0,R*R-(y-P.yc)*(y-P.yc)));
 for(const P of[A,B]){kput('hShipC',[P.cx,P.yc,P.cz],Q(P),[R,P.L,R],hull);
  kput('hShipBand',ax(P,P===A?-6:6,P.yc,0),Q(P),[R+.06,3.2,R+.06],hC(0xd0c6b2));                     // the labyrinth band
  for(let k=0;k<=6;k++){const u=-P.L/2+.4+(P.L-.8)*k/6;kput('vHoop',ax(P,u,P.yc,0),qEuler(0,P.yaw+Math.PI/2,0),[R+.05,R+.05,1.6],hC(0x6a6258));}   // frame rings
  // the ship's own ports: rows of dark slots on the front flank at two deck levels
  for(const th of[1.2,1.7])for(let k=0;k<9;k++){const u=-P.L/2+3+k*(P.L-6)/8,y=P.yc+R*Math.cos(th),z=R*Math.sin(th)+.05;
   const p=ax(P,u,y,z);kput('vDarkB',p,qEuler(0,P.yaw,0).multiply(qEuler(-(Math.PI/2-th),0,0)),[1.6,.55,.12],null);}}
 // what stands on the hull: a dorsal superstructure with a strip of ports on the aft half, antennae and a dish; long
 // tanks slung low along both flanks of each half on struts, half in the earth
 {const u0=-4,sp=ax(B,u0,B.yc+R-.6,0);kput('hShipB',[sp[0],sp[1]+1.6,sp[2]],qEuler(0,B.yaw,0),[20,3.2,5.5],hull);kput('hShipB',ax(B,u0-3,B.yc+R+3.6,0),qEuler(0,B.yaw,0),[10,2,4],hull);
  for(const oz of[2.78,-2.78]){const w=ax(B,u0,B.yc+R+1.7,oz);kput('vDarkB',w,qEuler(0,B.yaw,0),[17,.6,.08],null);}
  for(const [u,h] of[[4,9],[6.5,6]]){const m=ax(B,u,B.yc+R+.9,0);vPst('vPipe',m[0],m[1],m[2],.12,h,iron);for(let k=1;k<4;k++)vB('vIron',m[0],m[1]+h*k/4,m[2],1.6-k*.3,.08,.08,B.yaw,iron);}
  const d=ax(B,-11,B.yc+R+.2,0);hnDish(d[0],d[1],d[2],B.yaw+.6,2.2);}
 for(const P of[A,B])for(const s of[-1,1]){const oz=s*(R-.2),y=P.yc-R*.5;const c=ax(P,0,y,oz);kput('hTankC',c,Q(P),[2,P.L*.62,2],hull.clone().multiplyScalar(.82));
  for(const u of[-P.L*.22,0,P.L*.22]){const a=ax(P,u,y+1.4,oz),b=ax(P,u,y+2.6,s*(R-2.4));beam('vIron',a,b,.3,.3,iron);}}
 // the break: dark insides, the decks standing out, ribs and torn plates
 for(const [P,e] of[[A,1],[B,-1]]){const u=e*P.L/2;const cp=ax(P,u-e*.3,P.yc,0);kput('hShipCap',cp,qEuler(0,P.yaw+e*Math.PI/2,0),[R-.1,R-.1,1],null);
  for(const dy of[-6,-2.2,1.6,5.4]){const hw=flankZ(P,P.yc+dy)-.4,p=ax(P,u+e*rr(.4,2.4),P.yc+dy,0);kput('boxCR',p,qEuler(0,P.yaw,0),[rr(2.5,5),.35,2*hw],hC(vPick(HSV.conc)));
   for(let k=0;k<3;k++){const q=ax(P,u+e*rr(.5,3),P.yc+dy-.2,rr(-hw,hw));beam('vIron',q,[q[0]+e*rr(.5,2),q[1]-rr(1,3),q[2]+rr(-.5,.5)],.14,.14,iron);}}   // dangling conduit
  kput('vHoop',ax(P,u,P.yc,0),qEuler(0,P.yaw+Math.PI/2,0).multiply(qEuler(0,0,rr(-.15,.15))),[R+.1,R+.1,2],rust);
  for(let k=0;k<5;k++){const a=rr(0,TAU),p=ax(P,u+e*rr(.5,2),P.yc+Math.cos(a)*R,Math.sin(a)*R);kput('hHullSeg',p,qEuler(0,P.yaw,0).multiply(qEuler(a+rr(-.4,.4),0,Math.PI/2+e*rr(.3,.8))),[rr(2,4),rr(2,4),rr(2,4)],hull.clone().multiplyScalar(.8));}}
 // the nose, ploughed in: the berm and the furrow it pushed up
 kput('hShipNose',ax(A,-A.L/2,A.yc,0),Q(A),[R,10,R],hull);
 for(const [u,oz,r,hh] of[[-A.L/2-8,0,11,.45],[-A.L/2-4,-12,7,.4],[-A.L/2-4,12,7,.4],[-A.L/2+4,-13,6,.35],[-A.L/2+4,13,6,.35]]){const p=ax(A,u,0,oz);kput('hRCHeap',[p[0],-.05,p[2]],qEuler(0,rng()*TAU,0),[r,r*hh,r*1.2],sand);}
 // the stern: the thrust plate, five engine bells, the fins — one snapped off and standing in the earth
 {const u=B.L/2;const bp=ax(B,u+.3,B.yc,0);kput('hShipDisc',[bp[0],bp[1],bp[2]],Q(B).multiply(qEuler(0,0,Math.PI)),[R-.3,1.2,R-.3],hull.clone().multiplyScalar(.7));
  for(const [dy,dz,s] of[[0,0,3.4],[5.4,0,2.4],[-4.4,0,2.4],[.4,5.6,2.4],[.4,-5.6,2.4]]){const p=ax(B,u+.6+s*1.1,B.yc+dy,dz);kput('hShipBell',p,Q(B),[s,s*2.2,s],bell.clone().multiplyScalar(rr(.8,1.1)));}
  for(const [a,broken] of[[0,false],[2.3,false],[-2.3,true]]){if(broken)continue;const p=ax(B,u-4,B.yc+Math.cos(a)*(R+4),Math.sin(a)*(R+4));kput('vRustB',p,qEuler(0,B.yaw,0).multiply(qEuler(-a,0,0)),[9,8,.5],hull.clone().multiplyScalar(.75));}
  const f=ax(B,u-6,0,-R-7);kput('vRustB',[f[0],3,f[2]],qEuler(.5,.9,.35),[9,8,.5],hull.clone().multiplyScalar(.7));kput('hRCHeap',[f[0],-.05,f[2]],null,[3,.8,3],sand);}
 // debris: plates and rocks strewn along the line of the fall
 for(let k=0;k<30;k++){const x=rr(-50,52),z=rr(13,24)*(rng()<.7?1:-1);if(Math.abs(x)<9&&z>0)continue;
  if(rng()<.5)kput(vPick(['vPlate','vSheet','vPlateW']),[x,.3,z],qEuler(-Math.PI/2+rr(-.4,.4),rng()*TAU,0),[rr(1.5,4),rr(1,3),1],null);else kput('vRock',[x,rr(.2,.8),z],qEuler(rng(),rng(),0),[rr(.6,2),rr(.4,1.2),rr(.6,1.8)],hC(vPick(HPAL.rubble)));}
 // the cleft: a crowd of narrow frame towers, 2-4 storeys, jettied, under steep little gables
 for(let i=0;i<6;i++){const x=rr(-1.6,1.6)+(i%2?1.1:-1.1),z=-13+i*5.2,n=hri(2,4),w=rr(3,3.8);let y=0;
  for(let k=0;k<n;k++){const ww=w+(k?.5:0);hnFachBox(x,y,z,ww,2.6,ww,0,null,null,lit);if(k<n-1)hnJetty(x,y+2.6+.1,z,ww+.5,ww+.5,0,hC(vPick(HPAL.redwood)),.25);y+=2.7;}
  hnGable(x,y,z,w+.6,w+.6,1.8,rng()<.5?0:Math.PI/2,rng()<.6?'vCorr':'vShingleB',rng()<.6?corr:sh,.35,'vGableW',log);
  if(i%2)hnCable([x,y-.3,z],[x+(rng()<.5?-8:8),y+3,z],hC(0x3a3028));}
 // the airlock in the aft half's flank, a gate now: lanterns along its lintel
 {const y0=0,zf=flankZ(B,3.2)+.1,p=ax(B,-8,y0,zf);vB('vDarkB',p[0],y0,p[2],5,6,.5,B.yaw);const l=ax(B,-8,6.2,zf+.35);vB('vIron',l[0],6.1,l[2],6,.4,.5,B.yaw,iron);
  for(let k=0;k<4;k++){const q=ax(B,-10+k*1.3,5.9,zf+.6);hnLantern(q[0],5.9,q[2]);}}
 // terraces cantilevered off the front flanks: a platform on raking beams, a hut, a carved balustrade
 const terr=(P,u,y)=>{const fz=flankZ(P,y)+1.6,c=ax(P,u,y,fz);const x=c[0],z=c[2];vB('boxCR',x,y-.35,z,7,.35,3.6,P.yaw,ash);
  for(const s of[-1,1]){const a=ax(P,u+s*3,y-.35,fz+1.5),b=ax(P,u+s*3,Math.max(.2,y-4),flankZ(P,Math.max(.2,y-4))-.2);beam('vWood',a,b,.22,.22,log);}
  const h=ax(P,u-1,y,fz-.3);hnFachBox(h[0],y,h[2],3.6,2.4,2.8,P.yaw,null,null,lit);hnGable(h[0],y+2.4,h[2],3.6,2.8,1.6,P.yaw,'vShingleB',sh,.3,'vGableW',log);
  const r=ax(P,u+1,y+.45,fz+1.78);kput('hRailC',r,qEuler(0,P.yaw,0),[4.8,.7,1],log);return[x,y,z];};
 const t1=terr(A,-4,5),t2=terr(A,-12,11),t3=terr(A,3,15.5),t4=terr(B,-1,6),t5=terr(B,9,12.5);
 for(const [a,b] of[[ax(A,-8,0,flankZ(A,.5)+3),t1],[t1,t2],[t2,t3],[ax(B,4,0,flankZ(B,.5)+3),t4],[t4,t5]]){
  const dy=b[1]-a[1],steps=Math.round(dy/.25);const mx=(a[0]+b[0])/2,mz=Math.max(a[2],b[2])+1.9;vnStairs(mx,a[1],mz,Math.PI/2,1,dy,steps,'vWood',log);}
 // houses on the crown of the fore half, a mast with the Republic's flag and a line of bunting across the cleft
 for(const [u,w] of[[-14,4.2],[-8,3.6]]){const p=ax(A,u,A.yc+R-.4,0);vB('boxCR',p[0],p[1]-.2,p[2],w+1,.3,w+1,A.yaw,ash);hnFachBox(p[0],p[1]+.1,p[2],w,2.5,w,A.yaw,null,null,lit);hnGable(p[0],p[1]+2.6,p[2],w+.4,w+.4,1.7,A.yaw,'vCorr',corr,.35,'vGableW',log);}
 {const m=ax(A,-2,A.yc+R-.2,0);hnMast(m[0],m[1],m[2],1.2,8);vB('hPaint',m[0]+.8,m[1]+7,m[2],1.5,1,.03,0,hC(HPAL.red));hnEmblem(m[0]+.8,m[1]+7.5,m[2]+.03,0,.7);
  const n=ax(B,-4,B.yc+R-.2,0);hnBunting([m[0],m[1]+5,m[2]],[n[0],n[1]+1.5,n[2]],12);}
 // the mouth of the cleft: small houses, a stall, a lamp
 for(const [key,x,z,ry] of[['hl_rep_house_poor_a',-12,24,0],['hl_rep_lantern_stall',12,24.5,0],['hl_rep_house_poor_b',-23,26,.1]]){if(VERN.defs[key])hnSub(key,x,0,z,ry);}
 hnStall(0,0,19,0);vnLampPost(3,0,17,3.8);vnFolk(0,18,4,4);}
HL.def({key:'hl_rep_arco_quarter',name:'The Fallen Arcology',branch:'republican',family:'Monuments',tags:{type:['multi-family dwelling','ruin'],wealth:'poor',lit:true,salvage:true,landmark:true},w:118,d:70,h:34,build:buildHlRepArcoQuarter});
