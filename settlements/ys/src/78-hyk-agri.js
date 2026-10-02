// ================================================================= HYKKOUSOI — agriculture: the farm field, two farmhouses
// The outlying farms (DESIGN §2: up the river valley on the travertine terraces): poor-wealth, grey barnacle shell, no
// lamps (the lighting rule). A field of raised beds and salt pans between rimstone walls and water channels, with a tool
// shed; a farmhouse of fused barnacle cones with a byre; a long pod farmhouse with a drying-rack yard. Every plant is a
// planting spot for the biome (ROOMS of kind 'court' per bed, SPOTS of kind 'planting'). Uses the hykMil… helpers of
// 77-hyk-military.js. Seeds 30850–30899.
reseed(30899);
// a water channel between two low rimstone walls: a teal strip on the ground, the walls knuckled, from (x0,z0) to (x1,z1)
function hykAgriChannel(x0,z0,x1,z1,w,o){o=o||{};const col=o.col||hC(hPick(HPAL.barnacle));const water=o.water||hC(hPick(HPAL.lens),.9);const dx=x1-x0,dz=z1-z0;const L=Math.hypot(dx,dz)||1;const rx=-dz/L,rz=dx/L;
 hykPut('hkFloor',hykDeck([[x0,.025,z0],[(x0+x1)/2,.025,(z0+z1)/2],[x1,.025,z1]],w,{col:water}));
 for(const s of [-1,1]){const pts=[];const n=Math.max(3,Math.round(L/2.2));for(let i=0;i<=n;i++){const t=i/n;pts.push([x0+dx*t+rx*s*(w/2+.2),0,z0+dz*t+rz*s*(w/2+.2)]);}hykMilWall(pts,{r:.2,col,mat:'hkBarn'});}}
// a raised bed: a flat-topped mound of soil inside a rimstone kerb; registers a 'court' room with its planting spots. Returns the room
function hykAgriBed(cx,cz,rx,rz,o){o=o||{};const e=2.6,soil=o.soil||hC(0x6b573f),col=o.col||hC(hPick(HPAL.barnacle));
 hykPut('hkFloor',hykMilWeld(hykSurf((u,v)=>{const a=u*TAU;const q=hykMilSuperPt(cx,cz,rx*v,rz*v,e,a);return [q[0],.5*Math.pow(Math.max(0,1-Math.pow(v,8)),.6)+.01,q[1]];},40,6,{col:soil,uS:rx,vS:rz/2,flip:true}),40,6));
 {const pts=[];const n=44;for(let i=0;i<=n;i++){const q=hykMilSuperPt(cx,cz,rx*1.06,rz*1.08,e,i/n*TAU);pts.push([q[0],0,q[1]]);}hykMilWall(pts,{r:.22,col,mat:'hkBarn'});}
 const room=hykRoom('court',hykMilEllipsePoly(cx,cz,rx*.9,rz*.9,20,e),.45,2,{wealth:.15});
 for(const ox of [-2.4,-.8,.8,2.4])for(const oz of [-.5,.5])hykSpot(room,'planting',cx+ox*rx/3.8,cz+oz*rz/1.7,0,.8,.8);return room;}
// ---------------------------------------------------------------- the farm field
function hykAgriField(G,o){reseed(30850+(o.v|0));
 const grey=hC(hPick(HPAL.barnacle)),cream=hC(hPick(HPAL.shellWarm)),water=hC(hPick(HPAL.lens),.9),salt=hC(0xf4ebe4),bone=hC(hPick(HPAL.bone));const FY=.12;
 const RX=20.5,RZ=15,E=2.3;
 // the field wall, open at the front, a knuckle at each end
 {const pts=[];const d=.14,n=110;for(let i=0;i<=n;i++){const a=Math.PI/2+d+(TAU-2*d)*i/n;const q=hykMilSuperPt(0,0,RX,RZ,E,a);pts.push([q[0],0,q[1]]);}hykMilWall(pts,{r:.3,col:grey,mat:'hkBarn'});
  for(const p of [pts[0],pts[n]])kput('hkBall',[p[0],.38,p[2]],null,[.42,.4,.42],grey);}
 // the channels: the main one down the middle, two across between the bed rows, split at the crossings
 for(const [z0,z1] of [[-13.5,-5.9],[-4.1,.1],[1.9,13.5]])hykAgriChannel(0,z0,0,z1,1.2,{col:grey,water});
 for(const cz of [-5,1])for(const s of [-1,1])hykAgriChannel(s*.9,cz,s*12.4,cz,1.0,{col:grey,water});
 // six raised beds, three a side
 for(const s of [-1,1])for(const bz of [-8,-2,4])hykAgriBed(s*8,bz,3.8,1.7,{col:grey});
 // three salt pans stepped down the slope on the right: travertine rims, a crust of salt in each, drips under the lips
 {const pans=[[-7.5,.72],[0,.5],[7.5,.28]];for(const [pz,ph] of pans){const px=15.5,pr=3.0;
   const PL={H:ph+.1,cx:px,cz:pz,yBase:-.1,rFn:()=>pr+.1,nu:40,nv:4,noise:{amp:.035,su:6,sv:.6,seed:(pz*3|0)+7},rings:{n:3,amp:.03},col:cream};
   hykPut('hkShell',hykMilLathe(PL));hykPut('hkShell',hykMilLathe(Object.assign({},PL,{rFn:()=>pr-.02,flip:true})));   // the rim's inner face too: a pan is seen into
   hykPut('hkFloor',hykDisc(px,ph-.1,pz,pr,{col:salt,nu:32,lobes:{n:7,amp:.02}}));
   const rim=[];for(let i=0;i<=40;i++){const a=i/40*TAU;rim.push([px+(pr+.1)*Math.cos(a),ph-.18,pz+(pr+.1)*Math.sin(a)]);}hykMilWall(rim,{r:.17,col:cream,mat:'hkShell'});
   for(let i=0;i<7;i++){const a=rr(-1.0,1.0);const r=pr+.12;const h=rr(.18,.4)*ph/.5;kput('hkDrip',[px+r*Math.cos(a),ph-.05-h/2,pz+r*Math.sin(a)],qEuler(Math.PI,0,0),[h*.35,h,h*.35],cream);}
   hykPut('hkShell',hykMilFlare([px,.0,pz],[0,1,0],pr+.1,.6,{col:cream}));}}
 // the tool shed: a barnacle cone in the far corner, its door toward the field
 {const SX=-15.5,SZ=8.5;const sh={cx:SX,cz:SZ,rb:2.8,rt:1.8,h:3.6,dir:0,tilt:.18,mat:'hkBarn',col:grey,fluteN:14,seed:5,ventK:.22};const L=hykMilConeL(sh);sh.L=L;
  const ops=[];{const q=hykMilLatheAt(L,0,FY+1.1-L.yBase);ops.push({p:q.p,n:q.n,r:1.0,ky:1.1,kind:'door'});}{const q=hykMilLatheAt(L,Math.PI/2+.7,2.2);ops.push({p:q.p,n:q.n,r:.3,kind:'window'});}
  sh.ops=ops;hykMilCone(sh);for(const op of ops){if(op.kind==='door')hykDoor(op,{level:'ground'});else hykWin(op,{});}
  hykFloor(SX,SZ,FY,2.45,{});
  const room=hykRoom('store',hykCirclePoly(SX,SZ,2.2,12),FY,2.8,{doors:[[SX+L.rFn(FY+1.1-L.yBase),SZ,2.0]],wealth:.15});
  hykSpot(room,'store',SX-1.1,SZ+.6,.5,1.2,.7);hykSpot(room,'tool',SX-.4,SZ-1.2,-.3,.9,.6);hykSpot(room,'work',SX+.2,SZ+.9,0,1.0,1.0);
  for(let i=0;i<3;i++)kput('hkBall',[SX+2.2+i*.6,.28,SZ+2.0+rr(-.2,.2)],null,[.3,.28,.3],grey);}   // shell jars by the door
 hykReg('Farm field',0,0,22,4.6);}
HYK.def({key:'hyk_farm_field',name:'Farm field',family:'agriculture',row:'Agriculture',w:42,d:31,h:4.6,tags:{type:['farm'],wealth:'poor',lit:false},build:hykAgriField});
// ---------------------------------------------------------------- farmhouse 1: fused barnacle cones with a byre
// A hall cone (hearth under the vent), a lower sleeping cone grown onto its flank and opened into it, a wide low byre cone
// on the other flank with the beasts' door, a walled yard with a trough in front of the byre.
function hykAgriFarmByre(G,o){reseed(30860+(o.v|0));
 const grey=hC(hPick(HPAL.barnacle)),grey2=hC(hPick(HPAL.barnacle)),bone=hC(hPick(HPAL.bone)),water=hC(hPick(HPAL.lens),.9);const FY=.12;
 const HX=0,HZ=-1,SX=-4.7,SZ=.4,BX=4.9,BZ=-.2;
 const hall={cx:HX,cz:HZ,rb:3.6,rt:2.5,h:5.0,dir:Math.PI/2+.4,tilt:.18,mat:'hkBarn',col:grey,fluteN:16,seed:3,ventK:.2};const Lh=hykMilConeL(hall);hall.L=Lh;
 const sleep={cx:SX,cz:SZ,rb:2.7,rt:1.9,h:3.9,dir:Math.PI+.5,tilt:.2,mat:'hkBarn',col:grey2,fluteN:14,seed:4,ventK:.18};const Ls=hykMilConeL(sleep);sleep.L=Ls;
 const byre={cx:BX,cz:BZ,rb:3.1,rt:2.3,h:3.1,dir:Math.PI/2,tilt:.22,mat:'hkBarn',col:grey,fluteN:18,seed:6,vent:false};const Lb=hykMilConeL(byre);byre.L=Lb;
 const dy=FY+1.1-Lh.yBase;const thS=Math.atan2(SZ-HZ,SX-HX),thH=Math.atan2(HZ-SZ,HX-SX);
 // the hall: the front door, the door into the sleeping cone, windows
 const hops=[];{const q=hykMilLatheAt(Lh,Math.PI/2,dy);hops.push({p:q.p,n:q.n,r:1.0,ky:1.1,kind:'door'});}{const q=hykMilLatheAt(Lh,thS,FY+1.08-Lh.yBase);hops.push({p:q.p,n:q.n,r:1.0,ky:1.08,kind:'pass'});}
 for(const [th,y,r] of [[Math.PI/2+1.3,2.4,.36],[Math.PI/2-1.25,2.5,.34],[-Math.PI/2,2.7,.32]]){const q=hykMilLatheAt(Lh,th,y);hops.push({p:q.p,n:q.n,r,kind:'window'});}
 hall.ops=hops;hykMilCone(hall);for(const op of hops){if(op.kind==='door')hykDoor(op,{level:'ground'});else if(op.kind==='pass')hykDoor(op,{level:'ground',room:'hall',depth:.5});else hykWin(op,{});}
 hykFloor(HX,HZ,FY,3.2,{});
 // the sleeping cone, opened toward the hall; a fillet where the two shells meet
 const sops=[];{const q=hykMilLatheAt(Ls,thH,FY+1.08-Ls.yBase);sops.push({p:q.p,n:q.n,r:1.0,ky:1.08,kind:'pass'});}
 for(const [th,y,r] of [[Math.PI,1.9,.32],[Math.PI/2+.5,2.0,.28]]){const q=hykMilLatheAt(Ls,th,y);sops.push({p:q.p,n:q.n,r,kind:'window'});}
 sleep.ops=sops;hykMilCone(sleep);for(const op of sops){if(op.kind==='pass')hykDoor(op,{level:'ground',room:'bedroom',depth:.5});else hykWin(op,{});}
 hykFloor(SX,SZ,FY,2.35,{});
 {const r=Lh.rFn(1.8)-.25;hykPut('hkBarn',hykMilFlare([HX+r*Math.cos(thS),1.5,HZ+r*Math.sin(thS)],[Math.cos(thS),0,Math.sin(thS)],1.8,.9,{col:grey2}));}
 // the byre: the wide low door, a slit window, the fillet onto the hall
 const bops=[];{const q=hykMilLatheAt(Lb,Math.PI/2,FY+1.08-Lb.yBase);bops.push({p:q.p,n:q.n,r:1.2,ky:.95,kind:'door'});}{const q=hykMilLatheAt(Lb,0,1.8);bops.push({p:q.p,n:q.n,r:.3,kind:'window'});}
 byre.ops=bops;hykMilCone(byre);for(const op of bops){if(op.kind==='door')hykDoor(op,{level:'ground'});else hykWin(op,{open:true});}
 hykFloor(BX,BZ,FY,2.7,{col:hC(0x6a5a48)});
 {const thB=Math.atan2(BZ-HZ,BX-HX);const r=Lh.rFn(1.4)-.25;hykPut('hkBarn',hykMilFlare([HX+r*Math.cos(thB),1.2,HZ+r*Math.sin(thB)],[Math.cos(thB),0,Math.sin(thB)],2.0,1.0,{col:grey}));}
 // the yard: a low wall round the byre's front with a gap on the right, a shell trough of water
 hykMilWall(hykMilArc(5.5,0,3.0,4.3,3.5,.35,Math.PI+.25),{r:.26,col:grey,mat:'hkBarn'});
 hykPut('hkBarn',hykMilLathe({H:.5,cx:7.2,cz:3.4,yBase:0,rFn:y=>.55+.25*y,nu:22,nv:4,lobes:{n:2,amp:.3},col:grey2}));hykPut('hkFloor',hykDisc(7.2,.38,3.4,.6,{col:water,nu:16,lobes:{n:2,amp:.3}}));
 // rooms: the hall (hearth under the vent, a table, the larder), the bedroom, the stall
 const hallRoom=hykRoom('hall',hykCirclePoly(HX,HZ,2.9,14),FY,3.4,{doors:[[HX,HZ+Lh.rFn(dy),2.0],[HX+Lh.rFn(dy)*Math.cos(thS),HZ+Lh.rFn(dy)*Math.sin(thS),2.0,'bedroom']],wealth:.2});
 hykSpot(hallRoom,'hearth',0,-2.2,0,.9,.9);hykSpot(hallRoom,'table',.9,-.3,0,1.2,1.0);hykSpot(hallRoom,'food',-1.6,-2.0,0,.8,.8);
 const bed=hykRoom('bedroom',hykCirclePoly(SX,SZ,2.1,12),FY,2.6,{doors:[[SX+Ls.rFn(dy)*Math.cos(thH),SZ+Ls.rFn(dy)*Math.sin(thH),2.0,'hall']],residence:true,wealth:.2});
 hykSpot(bed,'bed',-5.5,.4,Math.PI/2,2.1,1.0);hykSpot(bed,'store',-4.4,1.75,0,1.2,.7);hykSpot(bed,'food',-4.4,-.9,0,.8,.8);
 const stall=hykRoom('stall',hykCirclePoly(BX,BZ,2.6,12),FY,2.4,{doors:[[BX,BZ+Lb.rFn(FY+1.08-Lb.yBase),2.4]],wealth:.2});
 hykSpot(stall,'tool',6.0,-1.4,.4,.9,.6);hykSpot(stall,'store',3.7,-1.2,.9,1.2,.7);
 hykReg('Farmhouse with byre',0,.5,10,6.4);}
HYK.def({key:'hyk_farmhouse_1',name:'Farmhouse with byre',family:'agriculture',row:'Agriculture',w:18,d:14,h:6.2,tags:{type:['single-family dwelling','farm'],wealth:'poor',lit:false},build:hykAgriFarmByre});
// ---------------------------------------------------------------- farmhouse 2: a long pod with a drying-rack yard
// One low oblong pod under a lens dome, a smoke hole over the hearth, a partition with a lipped doorway between hall and
// bedroom; a grain cone grown onto its back corner; three bone drying racks hung with salt-fish strips in a walled yard.
function hykAgriFarmRack(G,o){reseed(30870+(o.v|0));
 const grey=hC(hPick(HPAL.barnacle)),grey2=hC(hPick(HPAL.barnacle),.92),bone=hC(hPick(HPAL.bone)),lens=hC(hPick(HPAL.lens));const FY=.12;
 const P={a:5.2,b:2.9,c:3.6,e1:.9,e2:.78};const cy=P.b*.82;const E=2/P.e2;
 const openings=[{th:0,el:hykMilPodEl(P,FY+1.1),r:1.0,ky:1.1,kind:'door'},{th:1.15,el:.22,r:.42,kind:'window'},{th:-1.15,el:.22,r:.42,kind:'window'},{th:Math.PI,el:.35,r:.4,kind:'window'},{th:Math.PI/2,el:.18,r:.42,kind:'window'},{th:-Math.PI/2+.6,el:.3,r:.36,kind:'window'},
  {th:Math.atan2(-2.4,-1.2),el:1.15,r:.3,kind:'vent'}];
 const pod=hykMilPod(Object.assign({},P,{cy,nu:60,nv:30,noise:{amp:.028,su:4,sv:3,seed:12},col:grey,openings,hollow:{t:.08,col:grey2}}));
 hykPut('hkBarn',pod.geo);hykPut('hkIn',pod.inner,true);
 for(const op of pod.openings){if(op.kind==='door')hykDoor(op,{level:'ground'});else if(op.kind==='vent')hykWin(op,{open:true});else hykWin(op,{});}
 hykMilSkirt(0,0,P.a*.9,P.c*.9,E,1.3,{col:grey,mat:'hkBarn',y0:FY-.12});
 hykMilPave(0,0,P.a*.86,P.c*.86,FY,{e:E,inside:true,lobes:{n:1,amp:0},n:48});
 // the lens dome on the crown, off the vent, its lip sunk into the shell
 {const DX=.5,DZ=-.2,DY=cy+P.b-.3;hykPut('hkBarn',hykMilLathe({H:1.3,cx:DX,cz:DZ,yBase:DY,rFn:y=>1.5*Math.sqrt(Math.max(0,1-Math.pow(y/1.3,2.2)))+.04,nu:28,nv:10,rings:{n:3,amp:.03},col:grey2}));
  kput('hkLip',[DX,DY+.03,DZ],qEuler(Math.PI/2,0,0),[1.58,1.58,1.0],grey2);for(let i=0;i<8;i++){const a=i/8*TAU+.2;kput('hkLens',[DX+1.36*Math.cos(a),DY+.52,DZ+1.36*Math.sin(a)],null,.2,lens);}}
 // the partition: a shell curtain across the pod at x = .9 with a lipped doorway, both faces drawn
 {const top=(x,z)=>{const k=.92;const q=Math.pow(Math.abs(x)/(P.a*k),2/P.e2)+Math.pow(Math.abs(z)/(P.c*k),2/P.e2);return cy+P.b*k*Math.pow(Math.max(0,1-Math.pow(q,P.e2/P.e1)),P.e1/2);};
  const hole=(u,v,p)=>{const dz=p[2]-1.0,dy=p[1]-(FY+1.08);return Math.abs(dz)<.95&&(dy<0||dz*dz/.9+dy*dy/1.12<1);};
  for(const s of [-1,1]){hykPut('hkIn',hykSurf((u,v)=>{const z=-3.4+6.8*u;const t=top(.9,z);return [.9+s*.04,FY-.05+v*(t-FY+.1),z];},24,10,{col:grey2,uS:1.7,vS:1,flip:s<0,hole}),true);}
  hykDoor({p:[.9,FY+1.08,1.0],n:[1,0,0],r:.95,ky:1.12},{level:'ground',room:'bedroom',depth:.3});}
 // the grain cone on the back corner, a hatch in its flank, filleted onto the pod
 {const GX=-6.4,GZ=-1.6;const gr={cx:GX,cz:GZ,rb:1.7,rt:1.1,h:2.8,dir:Math.PI,tilt:.2,mat:'hkBarn',col:grey2,fluteN:12,seed:8,ventK:.25};const Lg=hykMilConeL(gr);gr.L=Lg;
  const ops=[];{const q=hykMilLatheAt(Lg,Math.PI/2,1.5);ops.push({p:q.p,n:q.n,r:.36,kind:'window'});}gr.ops=ops;hykMilCone(gr);for(const op of ops)hykWin(op,{open:true});
  hykPut('hkBarn',hykMilFlare([-4.75,1.0,GZ],[-1,0,0],1.3,.7,{col:grey2}));}
 // the drying yard: three bone racks hung with salt-fish strips, a low wall round them
 for(const rx of [7.0,8.6,10.2]){for(const z of [-1.4,1.4]){kput('hkPost',[rx,1.05,z],null,[.05,2.1,.05],bone);kput('hkBall',[rx,2.12,z],null,[.09,.08,.09],bone);hykPut('hkBone',hykMilFlare([rx,.02,z],[0,1,0],.05,.22,{col:bone}));}
  for(const y of [1.25,1.95])hykPut('hkBone',hykTube([[rx,y,-1.4],[rx,y,0],[rx,y,1.4]],()=>.035,{seg:6,col:bone}));
  for(let i=0;i<5;i++){const z=-1.1+i*.55;kput('hkWeedCard',[rx,1.95-.42,z],qEuler(0,Math.PI/2,0),[.3,.8,1],hC(hPick(HPAL.barnacle),.8));}}
 hykMilWall(hykMilArc(8.3,0,0,4.2,3.3,-2.4,2.4,36),{r:.24,col:grey,mat:'hkBarn'});
 // rooms: the hall (hearth under the smoke hole, a table, the larder) and the bedroom beyond the partition
 const outline=hykMilEllipsePoly(0,0,P.a*.85,P.c*.85,40,E);
 const hall=hykRoom('hall',outline.map(p=>[Math.min(p[0],.85),p[1]]),FY,3.2,{doors:[[0,P.c*.95,2.0],[.9,1.0,1.9,'bedroom']],wealth:.2});
 hykSpot(hall,'hearth',-2.4,-1.2,0,.9,.9);hykSpot(hall,'table',-1.0,.6,0,1.2,1.0);hykSpot(hall,'food',-3.2,.9,0,.8,.8);
 const bed=hykRoom('bedroom',outline.map(p=>[Math.max(p[0],.95),p[1]]),FY,3.0,{doors:[[.9,1.0,1.9,'hall']],residence:true,wealth:.2});
 hykSpot(bed,'bed',3.0,-.4,Math.PI/2,2.1,1.0);hykSpot(bed,'store',1.9,-1.9,0,1.2,.7);hykSpot(bed,'food',2.4,1.7,0,.8,.8);
 hykReg('Farmhouse with drying yard',1.5,0,10.5,6.6);}
HYK.def({key:'hyk_farmhouse_2',name:'Farmhouse with drying yard',family:'agriculture',row:'Agriculture',w:19,d:14,h:6.4,tags:{type:['single-family dwelling','farm'],wealth:'poor',lit:false},build:hykAgriFarmRack});
