// ================================================================= ALT DOMESTIC (3 of 3): megastructure, factory, laboratory
// Same conventions as 8ak-alt-a-houses.js (decay 0 intact, 1 ruined, 2
// reclaimed, 3 rehabilitated; `brk` = parts have come down; `dd` = old fabric).
//
//   THE RAMPART (adMega)        a battered wall 760 m long and 230 m high whose
//        south face is a field of triangular relief facets, each carrying its
//        own embossed glyph panels; a giant arcade at its foot, buttresses
//        behind, three towers on the top.
//   THE PILOTIS WORKS (adFac)   a stack of heavy boxes raised on columns, a
//        dark banded drum, two sky-bridges between them, sawtooth halls and
//        stacks at their feet.
//   THE STAR LABORATORY (adLab) a domed drum with six radial lobes at two
//        levels, each ending in a great round eye window with a spoked frame,
//        reached by a ramp.

// A section [[z,y],...] extruded along x from x0 to x1.
function adExtX(acc,pts,x0,x1){const g=new THREE.ExtrudeGeometry(adShape(pts.map(p=>[-p[0],p[1]])),{depth:x1-x0,bevelEnabled:false,curveSegments:4});
 g.rotateY(Math.PI/2);g.translate(x0,0,0);adUV(g);if(acc)acc.push(g);return g;}
// A raw triangle list -> geometry (flat-shaded, metre UVs).
function adTris(P){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();return adUV(g);}

// ================================================================= THE RAMPART (adMega)
// RUIN: a breach 150 m wide has opened in the middle — the wall down to 60 m at
// its floor, rising in jagged steps to full height at its flanks — with a talus
// fanning out on both sides, facet plates lying on it, and the east tower
// thrown down. RECLAIMED: a town has grown in the breach and on its talus,
// with a timber bridge strung across the gap and scaffolds up the flanks.
function buildAltMega(scene,gx,gz,d){reseed(9885+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,conc=CONC(d);
 REGISTER({name:'The Rampart ('+AD_STATE[d]+')',x:0,z:0,r:400,h:300});
 const L=760,H=230,ZF=y=>45-y*30/H,ZB=y=>-45+y*30/H,BX=-10;
 const bt=x=>{if(!brk)return H+1;const t=clamp(Math.abs(x-BX)/75,0,1);return 60+(H-60)*Math.pow(t,1.6)+(t<1?14*(fbm(x*.05,1,9885,2)-.5):0);};
 const nF=new THREE.Vector3(0,30/H,1).normalize(),PF=(x,y)=>[x,y,ZF(y)];
 // THE FACE: rows of triangles, each with a raised inner triangle (a relief frame)
 const tri=[],glyph=[];const T=(a,b,c)=>tri.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
 const NR=10,RH=H/NR,TW=30;
 for(let r=0;r<NR;r++){const y0=r*RH,y1=y0+RH,off=(r%2)*TW/2;
  for(let i=-1;i*TW/2<L+TW;i++){const xa=-L/2+i*TW/2-off;const up=(i%2===0);
   const A=up?[xa,y0]:[xa,y1],B=up?[xa+TW,y0]:[xa+TW,y1],C=up?[xa+TW/2,y1]:[xa+TW/2,y0];
   const cl=p=>[clamp(p[0],-L/2,L/2),p[1]];const a=cl(A),b=cl(B),c=cl(C);
   if(Math.abs(b[0]-a[0])<1&&Math.abs(c[0]-a[0])<1)continue;
   const cx=(a[0]+b[0]+c[0])/3,cy=(a[1]+b[1]+c[1])/3;if(cy>bt(cx))continue;
   const dep=4+2.5*h3(r,i,9885),k=.72;
   const pa=PF(...a),pb=PF(...b),pc=PF(...c);
   const inn=p=>{const q=[cx+(p[0]-cx)*k,cy+(p[1]-cy)*k];const w=PF(q[0],q[1]);return[w[0]+nF.x*dep,w[1]+nF.y*dep,w[2]+nF.z*dep];};
   const ia=inn(a),ib=inn(b),ic=inn(c);
   T(pa,pb,ib);T(pa,ib,ia);T(pb,pc,ic);T(pb,ic,ib);T(pc,pa,ia);T(pc,ia,ic);T(ia,ib,ic);
   // glyph panels on the raised face: a few embossed rectangles per facet
   if(Math.abs(b[0]-a[0])>TW*.8){const nG=3+((h3(i,r,1)*3)|0);
    for(let g=0;g<nG;g++){const u=rr(-.35,.35),v=rr(-.25,.25)*(up?1:-1),gw=rr(2,6),gh=rr(1.5,4.5);
     const q=PF(cx+u*TW*.5,cy+v*RH*.6);glyph.push([q[0]+nF.x*(dep+.4),q[1]+nF.y*(dep+.4),q[2]+nF.z*(dep+.4),gw,gh]);}}}}
 const solid=[adTris(tri)];
 // BACK FACE, TOP, ENDS
 solid.push(gridSurface((u,v)=>{const x=-L/2+u*L,y=v*H;return[x,y,ZB(y)];},152,46,{uS:L/8,vS:H/8,hole:(u,v)=>v*H>bt(-L/2+u*L)}));
 solid.push(gridSurface((u,v)=>{const x=-L/2+u*L,y=Math.min(H,bt(x)),zf=ZF(y)+(y<H?0:0),zb=ZB(y);return[x,y,lerp(zb,zf,v)];},brk?304:8,brk?6:1,{uS:L/8,vS:4}));
 for(const x of[-L/2,L/2])solid.push(gridSurface((u,v)=>{const y=v*H;return[x,y,lerp(ZB(y),ZF(y),u)];},4,8,{uS:10,vS:H/8}));
 // the front plane UNDER the facets, so no gap shows at the ends and the breach
 solid.push(gridSurface((u,v)=>{const x=-L/2+u*L,y=v*H;return[x,y,ZF(y)-.3];},152,46,{uS:L/8,vS:H/8,hole:(u,v)=>v*H>bt(-L/2+u*L)}));
 // buttresses behind, every 64 m
 for(let x=-L/2+40;x<L/2-20;x+=64){const top=Math.min(180,bt(x)-6);if(top<20)continue;
  adPrism(solid,[[x-6,ZB(0)],[x+6,ZB(0)],[x+3,ZB(0)-38],[x-3,ZB(0)-38]].map(p=>[p[0],p[1]]),0,top*.55);
  adPrism(solid,[[x-5,ZB(0)],[x+5,ZB(0)],[x+2,ZB(0)-20],[x-2,ZB(0)-20]],top*.55,top);}
 // three towers on the top (the east one thrown down in the ruin)
 for(const tx of[-280,40,250]){if(brk&&tx===40)continue;
  if(brk&&tx===250){const g=[];adBox(g,0,30,0,34,60,26);adBox(g,0,64,0,22,8,18);const m=meshMerged(g,MAT.concreteR,G);m.position.set(tx+30,0,95);m.rotation.set(0,.4,1.48);dropFragment(m,0,4);continue;}
  adBox(solid,tx,H+30,0,34,60,26);adBox(solid,tx,H+64,0,22,8,18);}
 meshMerged(solid,conc,G);
 for(const g of glyph){const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),nF);kput(BOXC(d),[g[0],g[1],g[2]],q,[g[3],g[4],.8],null);}
 // THE ARCADE: giant arched gates at the foot; lit slits in the top band
 for(let i=0;i<11;i++){const x=-300+i*60;if(bt(x)<50)continue;const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),nF);
  kput('archOpen',[x,18,ZF(18)+6.5],q,[3.4,4,8],null);}
 for(let r=0;r<3;r++)for(let i=0;i<64;i++){const x=-L/2+12+i*(L-24)/63,y=H-14-r*9;if(y>bt(x)-4)continue;
  const p=PF(x,y),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),nF);
  kput(d===0?'cell':'cellD',[p[0],p[1],p[2]+7.5],q,[4,1.3,1],d===0&&h3(r,i,3)<.55?WARM:DEAD);}
 // parapets
 for(let i=0;i<70;i++){const x=-L/2+6+i*(L-12)/69;if(bt(x)<H)continue;for(const z of[ZF(H)-1,ZB(H)+1])kput(BOXC(d),[x,H+2,z],null,[6,4,1.6],null);}
 if(brk){// the talus, both faces, and facet plates lying on it
  for(const s of[1,-1])for(let i=0;i<260;i++){const x=BX+rr(-110,110)*(1-Math.pow(rng(),2)*.5),q=Math.pow(rng(),1.6),z=s*(45+q*130),sz=rr(2,9)*(1.3-q);
   kput('rubble',[x,(1-q)*28*clamp(1-Math.abs(x-BX)/120,0,1)+sz*.3,z],qEuler(rng()*3,rng()*3,rng()*3),[sz*1.5,sz*.8,sz*1.3],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.3,.5)));}
  for(let i=0;i<14;i++)kput(BOXC(1),[BX+rr(-90,90),rr(3,14),rr(60,150)],qEuler(rr(-.4,.4),rng()*3,rr(-.4,.4)),[rr(14,28),2.5,rr(10,20)],null);
  // floors in section on the breach flanks
  for(let y=70;y<H-10;y+=13)for(const s of[-1,1]){let x=BX+s*75;for(let k=0;k<40&&Math.abs(bt(x)-y)>4;k++)x-=s*2;
   kput('boxCR',[x+s*1.5,y,0],null,[7,1.2,ZF(y)-ZB(y)-4],null);}}
 if(dd){mossOnSurface(G,0,0,0,220,4);vinesFromLedge(G,0,0,0,140,40,0,-200);stainsFromLedge(G,0,0,0,120,60,0,-200);}
 if(d===1)adTreesBox(-L/2,L/2,60,200,60);
 if(d===2){
  // the town in the breach: houses on the floor and the talus, terraces of
  // gardens, a timber bridge across the gap at 130 m, scaffolds up the flanks
  for(let i=0;i<70;i++){const x=BX+rr(-70,70),z=rr(-40,40),y=bt(x);if(y>100)continue;const w=rr(4,9),hh=rr(3,6),yaw=rr(-.2,.2);
   kput('shantyBox',[x,y+hh/2,z],qEuler(0,yaw,0),[w,hh,rr(4,8)],null);kput('shantyRoof',[x,y+hh+.25,z],qEuler(rr(.06,.2),yaw,0),[w*1.3,1,9],null);}
  for(let i=0;i<50;i++){const x=BX+rr(-90,90),q=rng(),z=45+q*110,y=(1-q)*28*clamp(1-Math.abs(x-BX)/120,0,1);
   kput(rng()<.5?'shantyBox':'planter',[x,y+1.4,z],qEuler(0,rng()*3,0),[rr(4,8),2.8,rr(4,7)],null);}
  const yb=130;let xl=BX-75,xr=BX+75;for(let k=0;k<60&&bt(xl)>yb;k++)xl+=1.5;for(let k=0;k<60&&bt(xr)>yb;k++)xr-=1.5;
  for(const z of[-3,3])beam('plank',[xl-6,yb,z],[xr+6,yb,z],.5,.5);
  for(let x=xl;x<xr;x+=2.2)kput('plank',[x,yb+.3,0],null,[1.8,.25,6.6],null);
  for(const s of[-1,1])for(let k=0;k<8;k++){const x=BX+s*(78+k*7),top=Math.min(bt(x)-2,170);
   beam('plank',[x,0,ZF(0)+8],[x,top,ZF(top)+8],.5,.5);for(let y=10;y<top;y+=12)beam('plank',[x-3.5,y,ZF(y)+8],[x+3.5,y,ZF(y)+8],.35,.35);}
  const fires=[];for(let i=0;i<11;i++){const x=-300+i*60;if(bt(x)<50||rng()<.4)continue;fires.push([x,14,ZF(14)+7.5,0,1,14,18]);}
  adReclaim(G,{up:120,fires,treeBox:[-L/2,L/2,70,200,50],figs:40,spread:80,cz:90,ok:p=>p[1]<bt(p[0])+2&&Math.abs(p[0]-BX)<90});}
 if(d===0||d===3)figures(0,90,14,120);
 KOFF=[0,0,0];return G;}

// ================================================================= THE PILOTIS WORKS (adFac)
// THE STACK: four heavy concrete boxes, each 36 x 13 x 30 m, slid alternately
// east and west and parted by a recessed band of dark glazing, on a podium
// held 12 m up on a grid of square columns. THE DRUM: a dark glass cylinder
// 84 m high banded every six metres. Two enclosed sky-bridges join them at 40
// and 58 m. Three sawtooth halls lie to the south, two stacks to the east, and
// conveyor tubes climb from the halls into the stack's belly.
// RUIN: the top box has slid off and hangs tilted over the east edge; the lower
// bridge lies broken on the yard and the upper one hangs from the drum; the
// drum is glazed only to 40 m, bare mullions above; the middle hall's roof is
// down; one stack lies across the halls.
function buildAltFactory(scene,gx,gz,d){reseed(9890+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,conc=CONC(d);
 REGISTER({name:'The Pilotis works ('+AD_STATE[d]+')',x:0,z:10,r:170,h:110});
 REGISTER({name:'The Pilotis works — the stack',x:-60,z:0,r:30,h:80});
 const SX=-60,DX=40,DZ=-10,DR=14,DH=84,solid=[],dark=[];
 kput(dd?'boxCR':'boxC',[0,.2,15],null,[300,.4,150],null);
 // pilotis and podium
 for(let i=0;i<4;i++)for(let j=0;j<3;j++)adBox(solid,SX-15+i*10,6,-11+j*11,2.2,12,2.2);
 adBox(solid,SX,13,0,40,2,34);
 // THE STACK
 const boxY=k=>14+k*15,bx=k=>SX+(k%2?3:-3);
 for(let k=0;k<4;k++){const g=adBox(null,0,6.5,0,36,13,30);const slid=brk&&k===3;
  if(slid){g.applyMatrix4(new THREE.Matrix4().makeRotationZ(-.32));g.translate(bx(k)+11,boxY(k)-1.5,2);}else g.translate(bx(k),boxY(k),0);
  solid.push(g);if(k<3||!brk)adBox(dark,SX,boxY(k)+14,0,30,2.2,24);}
 adBox(solid,SX+4,boxY(4)+(brk?-17:0)+3,-4,12,6,10);
 // window slots on every face of every box (fire in the reclaimed ones)
 const fm=d===2?fireMask('adFac',48,8,9892,3):null,fires=[];
 for(let k=0;k<4;k++){if(brk&&k===3)continue;for(let row=0;row<2;row++)for(let f=0;f<4;f++)for(let i=0;i<8;i++){
  const y=boxY(k)+3.6+row*5.6,t=-14+i*4,n=[[0,1],[1,0],[0,-1],[-1,0]][f],hw=f%2?15:18;
  const x=bx(k)+(f%2?n[0]*18.3:t),z=f%2?t*.8:n[1]*15.3,q=qFacing([n[0],0,n[1]]);
  kput(d===0?'cell':'cellD',[x,y,z],q,[2.6,2.4,1],d===0&&h3(k,i,f+row)<.4?WARM:DEAD);
  if(fm&&fm(f*12+i,k*2+row))fires.push([x,y,z,n[0],n[1],2.4,2.2]);}}
 // THE DRUM: dark glass banded every 6 m; glazed only to 40 m in the ruin, mullions above
 const gH=brk?40:DH;
 mesh(lathe({rFn:()=>DR,H:gH,nu:40,nv:6,cut:brk?gH:null,jag:brk?3:0,seed:9891}),MAT.darkGlass,G,DX,0,DZ);
 for(let y=6;y<=DH;y+=6){if(brk&&y>40&&h3(y,1,9890)<.35)continue;kput(dd?'slabCR':'slabC',[DX,y,DZ],null,[DR+.6,.7,DR+.6],null);}
 if(brk)for(let i=0;i<32;i++){const a=i/32*TAU;kput('strutR',[DX+DR*Math.cos(a),40+(DH-40)/2,DZ+DR*Math.sin(a)],null,[.3,DH-40,.3],null);}
 adBox(solid,DX,DH+2,DZ,10,4,10);kput(dd?'pipeR':'pipe',[DX,DH+12,DZ],null,[.5,16,.5],null);
 if(d===0)for(let i=0;i<40;i++){const a=i/40*TAU;kput('strip',[DX+(DR+.7)*Math.cos(a),DH-3,DZ+(DR+.7)*Math.sin(a)],qEuler(0,-a+Math.PI/2,0),[2.2,1,1],CYAN);}
 // SKY-BRIDGES: from the stack's east face (x=SX+18) to the drum's west face
 for(const y of[40,58]){const len=DX-DR-(SX+18)+1,cx=(SX+18+DX-DR)/2;
  if(brk&&y===40){for(const s of[-1,1]){const g=adBox(null,0,0,0,len/2-1,5,6);g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rr(-.1,.1),rr(-.3,.3),s*.25)));
    g.translate(cx+s*len/4,3,8+s*3);solid.push(g);}continue;}
  if(brk&&y===58){const g=adBox(null,-len/2,0,0,len,5,6);g.applyMatrix4(new THREE.Matrix4().makeRotationZ(.9));g.translate(DX-DR,y,DZ+4);solid.push(g);continue;}
  adBox(solid,cx,y,DZ*.4,len,5,6);
  for(let i=0;i<9;i++)kput(d===0?'cell':'cellD',[cx-len/2+4+i*(len-8)/8,y+.4,DZ*.4+3.1],null,[3.4,1.6,1],d===0?WARM:DEAD);}
 // THE HALLS: sawtooth roofs, glazed north lights (the middle roof is down in the ruin)
 const saw=(x0,x1)=>{const pts=[[x0,0],[x1,0],[x1,9]];for(let x=x1;x>x0+.1;x-=12){pts.push([x,15]);pts.push([Math.max(x0,x-12),9]);}return pts;};
 for(let h=0;h<3;h++){const x0=-135+h*82,x1=x0+72;
  if(brk&&h===1){adExtZ(solid,[[x0,0],[x1,0],[x1,9],[x0,9]],48,50);adExtZ(solid,[[x0,0],[x1,0],[x1,9],[x0,9]],86,88);
   adExtZ(solid,saw(x0,x1),48,58);adExtZ(solid,saw(x0,x1),80,88);
   for(let i=0;i<50;i++)kput('rubble',[rr(x0,x1),rr(.5,2),rr(58,80)],qEuler(rng()*3,rng()*3,rng()*3),[rr(1,3),rr(.5,1.4),rr(1,3)],null);continue;}
  adExtZ(solid,saw(x0,x1),48,88);
  for(let x=x1;x>x0+.1;x-=12)for(let z=52;z<86;z+=6)kput(d===0?'pane':'paneD',[x-.2,12,z],qEuler(0,Math.PI/2,0),[5.6,5.6,1],null);}
 // conveyors from the halls up into the podium
 for(const [x,z] of[[-110,48],[-30,48]])beam(dd?'pipeR':'pipe',[x,9,z],[SX+(x<-60?-12:12),13,14],2.2,2.2);
 // STACKS (one lies across the halls in the ruin)
 for(const [x,z,i] of[[115,-40,0],[135,-15,1]]){const g=lathe({rFn:y=>5-2*y/100,H:100,nu:20,nv:4});
  if(brk&&i===1){const m=mesh(g,MAT.concreteR,G);m.position.set(x-40,0,z+60);m.rotation.set(0,.3,Math.PI/2-.06);dropFragment(m,9,.3);continue;}
  g.translate(x,0,z);solid.push(g);kput(dd?'ringR':'ringW',[x,96,z],qEuler(Math.PI/2,0,0),3.4,null);}
 meshMerged(solid,conc,G);meshMerged(dark,WIN(d),G);
 if(brk){adRubbleLine([SX+18,-15],[SX+18,15],1,0,14,60,2);adRubbleArc(DX,DZ,0,TAU,()=>DR+1,10,40,1.4);}
 if(dd){mossOnSurface(G,0,0,0,120,1.6);vinesFromLedge(G,0,0,0,60,12,SX,0);stainsFromLedge(G,0,0,0,40,14,SX,0);}
 if(d===1){scatterMoss(0,0,15,20,140,80,2);adTreesBox(-150,150,96,150,24);adTreesBox(-150,-100,-70,30,10);}
 if(d===2){
  // tarps over the fallen hall roof, gardens in the yard, a plank way up to the podium
  for(let i=0;i<4;i++)adTarp([-53+i*18,9.5,58],[-53+i*18,9.5,80],15);
  for(let i=0;i<10;i++)kput('planter',[-130+i*26,.45,110],null,[20,.6,10],null);
  for(let i=0;i<60;i++)kput('moss',[rr(-140,130),.95,110+rr(-4,4)],null,[1,.6,1],new THREE.Color().setHSL(rr(.22,.32),.55,.32));
  beam('plank',[SX+20,0,20],[SX+12,13,12],.4,3);
  adReclaim(G,{up:90,fires,treeBox:[-150,150,120,160,20],figs:24,spread:60,cz:30,minY:8});}
 if(d===0||d===3)figures(0,30,10,60);
 KOFF=[0,0,0];return G;}

// ================================================================= THE STAR LABORATORY (adLab)
// A domed drum 24 m across with six lobes radiating from it, alternately on
// the ground and lifted 7 m on piers. Each lobe is a squarish tube that swells
// toward its end and closes in a great round eye: a glass disc in a thick
// frame, with a ring and eight spokes. A ramp climbs from the south to a portal
// in the drum, between two lobes.
// RUIN: the south-east lifted lobe has broken off its piers and lies on the
// plinth; every eye is shattered to its spokes; the dome is holed; the ramp has
// failed in the middle. RECLAIMED: the lobes are houses with salvage walls in
// their eyes, fires behind them at night, gardens on the plinth.
function buildAltLab(scene,gx,gz,d){reseed(9895+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,conc=CONC(d);
 REGISTER({name:'The Star laboratory ('+AD_STATE[d]+')',x:0,z:10,r:64,h:30});
 const DR=12,DHt=18,solid=[],hold=holeFn(dd,9895,null,2);
 kput(dd?'slabCR':'slabC',[0,.3,0],null,[36,.6,36],null);
 solid.push(lathe({rFn:()=>DR,H:DHt,nu:48,nv:4}));
 solid.push(lathe({rFn:y=>DR*Math.sqrt(clamp(1-Math.pow(y/7,2),0,1))+.4,H:7,nu:48,nv:8,hole:hold?(u,y)=>hold(u,y*3):null}).translate(0,DHt,0));
 kput(dd?'ringR':'ringW',[0,DHt+6.6,0],qEuler(Math.PI/2,0,0),3,null);
 for(let i=0;i<24;i++){const a=i/24*TAU;kput(d===0?'ovalI':'ovalD',[(DR+.1)*Math.cos(a),DHt-2.2,(DR+.1)*Math.sin(a)],qFacing([Math.cos(a),0,Math.sin(a)]),[.7,.7,1],null);}
 // LOBES
 const HW=4.6,HH=4.6,NS=24,sec=th=>{const r=se(th,4);return[HW*r*Math.cos(th),HH*r*Math.sin(th)];};
 const lobeRings=(a,yc,s0,s1)=>{const c=Math.cos(a),s=Math.sin(a),out=[];
  for(const t of[0,.25,.6,.85,1]){const sd=lerp(s0,s1,t),k=1+.16*Math.pow(t,2);
   const R=[];for(let j=0;j<NS;j++){const p=sec(j/NS*TAU);R.push([sd*c-s*p[0]*k,yc+p[1]*k,sd*s+c*p[0]*k]);}out.push(R);}
  return out;};
 // the eye: a frame (superellipse with a round hole) facing out along a, at radius s1
 const eyeFrame=(a,yc,s1,k)=>{const sh=new THREE.Shape();for(let j=0;j<=NS;j++){const p=sec(j/NS*TAU);j?sh.lineTo(p[0]*k,p[1]*k):sh.moveTo(p[0]*k,p[1]*k);}
  const hp=new THREE.Path();hp.absarc(0,0,3.6,0,TAU,false);sh.holes.push(hp);const g=new THREE.ShapeGeometry(sh,16);
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(qFacing([Math.cos(a),0,Math.sin(a)])).setPosition(s1*Math.cos(a),yc,s1*Math.sin(a)));return adUV(g);};
 const fires=[],eyes=[];
 for(let i=0;i<6;i++){const a=Math.PI/2+Math.PI/6+i*Math.PI/3,up=i%2===1,yc=up?11.8:4.8,S1=27;
  if(brk&&i===5){// broken off: a stump at the drum, the rest on the plinth
   adLoft(solid,lobeRings(a,yc,DR-2,15).slice(0,3),true);
   const fr=adLoft(null,lobeRings(a,yc,15,S1).slice(2),true);const fg=[fr,eyeFrame(a,yc,S1,1.16)];
   const m=meshMerged(fg,MAT.concreteR,G);m.position.set(Math.cos(a)*30,0,Math.sin(a)*30);m.rotation.set(.1,.25,-.18);dropFragment(m,0,.3);continue;}
  adLoft(solid,lobeRings(a,yc,DR-2,S1),true);solid.push(eyeFrame(a,yc,S1,1.16));
  if(up)for(const s of[-1,1]){const px=21*Math.cos(a)-Math.sin(a)*s*2.6,pz=21*Math.sin(a)+Math.cos(a)*s*2.6;adBox(solid,px,(yc-HH)/2,pz,1.8,yc-HH,1.8,-a);}
  eyes.push([a,yc,S1]);}
 // eyes: glass, ring and spokes (the glass gone in the ruin; salvage in the reclaimed)
 for(const[a,yc,S1]of eyes){const c=Math.cos(a),s=Math.sin(a),q=qFacing([c,0,s]),p=[S1*c,yc,S1*s];
  if(d===0){const g=new THREE.CircleGeometry(3.6,24);g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q).setPosition(p[0]-c*.3,p[1],p[2]-s*.3));mesh(g,MAT.glass,G);}
  kput(dd?'ringR':'ringW',[p[0]+c*.2,p[1],p[2]+s*.2],q,3.6,null);kput(dd?'ringR':'ringW',[p[0]+c*.2,p[1],p[2]+s*.2],q,1.6,null);
  for(let k=0;k<8;k++){if(brk&&h3(k,a,1)<.3)continue;const th=k/8*TAU,ex=Math.cos(th),ey=Math.sin(th);
   beam(dd?'strutR':'strutW',[p[0]+c*.2-s*ex*1.6,p[1]+ey*1.6,p[2]+s*.2+c*ex*1.6],[p[0]+c*.2-s*ex*3.6,p[1]+ey*3.6,p[2]+s*.2+c*ex*3.6],.22,.22);}
  if(d===2){kput('patchSheet',[p[0]-c*.4,p[1]-1.2,p[2]-s*.4],q,[6.4,2.6,1],null);kput('patchBoard',[p[0]-c*.4,p[1]+1.5,p[2]-s*.4],q.clone().multiply(qEuler(0,0,.1)),[5,2.4,1],null);
   fires.push([p[0]-c*.5,p[1]+.2,p[2]-s*.5,c,s,1.4,1.2]);}}
 // THE RAMP: a sloped deck with parapets, from the south up to the portal
 const ramp=(z0,z1,y0,y1)=>{const R=(z,y,w,h)=>[[-w,y,z],[w,y,z],[w,y+h,z],[-w,y+h,z]];
  adLoft(solid,[R(z0,y0-.8,3.6,.8),R(z1,y1-.8,3.6,.8)]);for(const s of[-1,1])adLoft(solid,[[[s*3.6,y0,z0],[s*3.2,y0,z0],[s*3.2,y0+1.1,z0],[s*3.6,y0+1.1,z0]],[[s*3.6,y1,z1],[s*3.2,y1,z1],[s*3.2,y1+1.1,z1],[s*3.6,y1+1.1,z1]]]);};
 const rY=z=>8*(64-z)/(64-DR+.5);
 if(brk){ramp(64,44,rY(64)+.01,rY(44));ramp(36,DR-.5,rY(36),rY(DR-.5));adRubbleLine([-3,36],[3,44],0,0,3,24,1.4);
  const g=[];adBox(g,0,0,0,7,.8,8);const m=meshMerged(g,MAT.concreteR,G);m.position.set(1,0,40);m.rotation.set(.35,.1,.15);dropFragment(m,0,.1);}
 else ramp(64,DR-.5,.01,8);
 for(const s of[-1,1])adBox(solid,s*2.4,(8+(brk?0:0))/2,DR-.2,1.2,8,1.2);
 kput('archOpen',[0,10.3,DR+.2],null,[.7,.55,1],null);
 meshMerged(solid,conc,G);
 if(brk){adRubbleArc(0,0,Math.PI/3-.3,Math.PI/3+.3,()=>14,14,40,1.4);}
 if(dd){mossOnSurface(G,0,0,0,50,1.2);vinesFromLedge(G,0,0,0,30,8,0,0);stainsFromLedge(G,0,0,0,24,8,0,0);}
 if(d===1){scatterMoss(0,0,0,20,46,40,1.6);trees(0,0,40,62,12);}
 if(d===2){
  for(let i=0;i<5;i++){const z=58-i*8;kput('shantyRoof',[5.6,3+rY(z),z],qEuler(0,0,-.2),[3,1,6],new THREE.Color().setHSL(rng(),.4,.6));}
  for(let i=0;i<8;i++){const a=rr(0,TAU);if(Math.sin(a)>.6)continue;kput('planter',[30*Math.cos(a),.95,30*Math.sin(a)],qEuler(0,-a,0),[3,.7,5],null);}
  adReclaim(G,{up:40,fires,trees:[40,64,14],figs:12,spread:24,cz:20,minY:.4});}
 if(d===0||d===3)figures(0,44,5,8);
 KOFF=[0,0,0];return G;}
