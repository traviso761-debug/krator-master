// ================================================================= ALTERNATES (towers group) — shared helpers + THE BOLE
// From-scratch alternate versions of six Ancient city types, after the user's
// arco1/arco2 reference sets (queue item 3). One builder per fragment:
//   8aj-alt-a-bole.js      THE BOLE       skyscraper: a tree of six twisted ribs carrying planted trays and three canopy saucers
//   8aj-alt-b-stack.js     THE PIERCED STACK  skyscraper: eight-lobed waisted shaft on cone pilotis, porthole skin, an oculus through it
//   8aj-alt-c-hotel.js     THE ATTRACTION hotel: a cluster of fluted parabolic spires on an arcaded podium
//   8aj-alt-d-flat.js      THE UNDULANT   flatiron: an acute wedge whose every floor edge waves, iron balconies, chimney warriors
//   8aj-alt-e-perch.js     THE RIG        perch: a two-deck platform on four lattice legs, a cup on a stem, the bridge between
//   8aj-alt-f-cult.js      THE BLOOM      cultural centre: a concrete flower over an amphitheatre, a wavy ring wall, porthole halls
// Decay: 0 intact, 1 ruined, 2 RECLAIMED (the ruin, reinhabited: shanties,
// tarps, gardens, ropes, fires at night), 3 rehabilitated (whole form, ruin
// materials; the scene loop sets HOLES=.55 and runs repairPass). Every builder
// is local to its own group at (gx,0,gz) and opens with its own reseed. Shown
// by the `alt-towers` target; see targets/alt-towers/NOTES.md.

const ALT_STATE=['intact','ruined','reclaimed','rehabilitated'];
// own port window: an 8-sided disc, 28 triangles (ovalI is 56)
kdef('altPortI',new THREE.CylinderGeometry(1,1,.5,8).rotateX(Math.PI/2),MAT.winIntact);
kdef('altPortD',new THREE.CylinderGeometry(1,1,.5,8).rotateX(Math.PI/2),MAT.winDead);
// a box into a merge list
function altBox(acc,cx,cy,cz,sx,sy,sz,ry){const g=new THREE.BoxGeometry(sx,sy,sz);if(ry)g.rotateY(ry);g.translate(cx,cy,cz);acc.push(g);return g;}
// an open tube from a to b, radius r0 at a and r1 at b
function altTube(acc,a,b,r0,r1,n){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz)||1e-3;
 const g=new THREE.CylinderGeometry(r1==null?r0:r1,r0,L,n||8,1,true);
 g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(_UP,new THREE.Vector3(dx/L,dy/L,dz/L))));
 g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);acc.push(g);return g;}
// a tube swept along a point list, radius rFn(v), v 0..1 along it
function altSweep(pts,rFn,nr,hole){const N=pts.length-1,X=new THREE.Vector3(1,0,0),Z=new THREE.Vector3(0,0,1);
 const fr=pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(N,i+1)];
  const t=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize();
  const n=new THREE.Vector3().crossVectors(t,Math.abs(t.x)>.9?Z:X).normalize();return[n,new THREE.Vector3().crossVectors(t,n)];});
 return gridSurface((u,v)=>{const i=Math.min(N,Math.round(v*N)),th=u*TAU,r=rFn(i/N),F=fr[i],p=pts[i];
  const c=Math.cos(th)*r,s=Math.sin(th)*r;
  return[p[0]+F[0].x*c+F[1].x*s,p[1]+F[0].y*c+F[1].y*s,p[2]+F[0].z*c+F[1].z*s];},nr||8,N,{uS:2,vS:N/3,hole});}
// one window cell by state: intact cyan, ruined dead, reclaimed dead or burning,
// rehabilitated dead or warm-lit (the new people's lamps)
function altWin(p,n,w,h,d){const q=qFacing(n);
 if(d===0){kput('cell',p,q,[w,h,1],CYAN.clone().multiplyScalar(rr(.75,1)));return;}
 if(d===2&&rng()<.16){fireWindow(p,n,q,w,h);return;}
 if(d===3&&rng()<.28){kput('cell',p,q,[w,h,1],WARM.clone().multiplyScalar(rr(.6,1)));return;}
 kput('cellD',p,q,[w,h,1],null);}
// a rope (or cable) between two points
function altRope(a,b,w){beam('tube',a,b,w||.14,w||.14);}
// A slack line: a sagging catenary of n pieces, for rope bridges and cables.
function altSag(a,b,sag,n,w,name){let p=a;for(let i=1;i<=n;i++){const t=i/n;
 const q=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-sag*4*t*(1-t),lerp(a[2],b[2],t)];beam(name||'tube',p,q,w||.14,w||.14);p=q;}}
// THE RECLAIMED DRESSING. The ruin, taken back by a later people: shacks of
// corrugated sheet on the flat surfaces it still has, gardens in timber boxes,
// tarps on poles, water butts, and fire. Runs on the finished group, like
// repairPass, so it lands on what the builder actually left standing; yMin
// keeps it off the ground plane round the foot.
function altReclaim(G,n,yMin,key){
 for(const f of upFaces(G,n,.82)){const p=f.p;if(p[1]<yMin)continue;const r=rng(),yaw=rng()*TAU;
  if(r<.42){const w=rr(2.5,6),h=rr(2.2,3.4),dp=rr(2.5,5),q=qEuler(0,yaw,0),nn=[Math.sin(yaw),0,Math.cos(yaw)];
   kput('shantyBox',[p[0],p[1]+h/2,p[2]],q,[w,h,dp],null);
   kput('shantyRoof',[p[0],p[1]+h+.15,p[2]],qEuler(rr(.06,.2),yaw,0),[w*1.25,1,dp*1.25],null);
   const wp=[p[0]+nn[0]*(dp/2+.05),p[1]+h*.55,p[2]+nn[2]*(dp/2+.05)];
   if(rng()<.45)fireWindow(wp,nn,q,1.1,.9);else kput('dot',wp,q,[.9,.7,1],WARM);
   if(rng()<.3)kput('spipe',[p[0]+w*.3*Math.cos(yaw),p[1]+h+1.2,p[2]-w*.3*Math.sin(yaw)],null,[.22,2.6,.22],null);}
  else if(r<.54)firePit(key,p[0],p[1],p[2],rr(.7,1.3));
  else if(r<.72){kput('planter',[p[0],p[1]+.35,p[2]],qEuler(0,yaw,0),[rr(2,4.5),.7,rr(1.2,2.2)],null);
   for(let k=0;k<3;k++)kput('moss',[p[0]+rr(-1.2,1.2),p[1]+.9,p[2]+rr(-.8,.8)],null,[.8,.5,.8],new THREE.Color().setHSL(rr(.24,.34),.55,.3));}
  else if(r<.86){const w=rr(4,8),dp=rr(3,6);
   for(const s of[-1,1])kput('plank',[p[0]+s*w*.45*Math.cos(yaw),p[1]+1.4,p[2]-s*w*.45*Math.sin(yaw)],null,[.18,2.8,.18],null);
   kput('patchTarp',[p[0],p[1]+2.9,p[2]],qEuler(-Math.PI/2+rr(-.25,.25),yaw,0),[w,dp,1],null);}
  else kput('waterButt',[p[0],p[1]+1.1,p[2]],null,[1.1,2.2,1.1],null);}}
// a ladder of planks up a face, from a to b (rails and rungs)
function altLadder(a,b,side){const dx=side[0]*.5,dz=side[2]*.5;
 beam('plank',[a[0]-dx,a[1],a[2]-dz],[b[0]-dx,b[1],b[2]-dz],.14,.14);beam('plank',[a[0]+dx,a[1],a[2]+dz],[b[0]+dx,b[1],b[2]+dz],.14,.14);
 const L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),n=Math.floor(L/1.2);
 for(let i=1;i<n;i++){const t=i/n,c=[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
  beam('plank',[c[0]-dx,c[1],c[2]-dz],[c[0]+dx,c[1],c[2]+dz],.1,.1);}}

// ---------------------------------------------------------------- THE BOLE
// A tree, not a tower with trees on it. Six ribs rise out of the plain from a
// splayed root-foot 88 m out, twist a third of a turn as they gather in to a
// 30 m waist, and branch at 210 m into three canopy saucers stacked off-axis
// round a slim core that runs up through all three. Between the root and the
// waist the ribs carry seven planted trays, each with a glazed drum of rooms
// under it, narrowing as they rise. (arco1 #18 the tree arcology on its splayed
// legs, #111 the twisted trunk under stacked rings, arco2 #42 the desert tree
// tower, arco1 #16 the balconied drum tower.)
// Ruin: the top saucer has come down and lies on the plain, its two ribs end
// in torn stubs, the middle saucer has dropped at one edge, the core is
// snapped, tray decks are holed, the glass is gone and the trays run wild.
function buildAltBole(scene,gx,gz,d){reseed(9802+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,brk=d===1||d===2,rec=d===2,skin=SHELL(d);
 const SK=[],DK=[],LW=[],GL=[],GU=[];
 REGISTER({name:'The Bole ('+ALT_STATE[d]+')',x:0,z:0,r:100,h:345});
 // the rib radius from the axis at height y: root splay, waist, spread to the crown
 const HR=260,rad=y=>{const t=clamp(y/HR,0,1);return 15+73*Math.pow(1-t,3)+22*t*t;};
 const SAU=[{x:-38,z:-20,y:262,R:70},{x:42,z:-8,y:286,R:56},{x:-4,z:38,y:310,R:46}];
 const fallen=brk?2:-1;                      // the top saucer comes down in the ruin
 // THE RIBS
 const NR=6,ribs=[];
 for(let i=0;i<NR;i++){const a0=i/NR*TAU+.3,pts=[];
  for(let k=0;k<=26;k++){const y=k/26*208,a=a0+.55*y/HR,r=rad(y);pts.push([r*Math.cos(a),y,r*Math.sin(a)]);}
  const S=SAU[i%3],P=pts[pts.length-1],ea=a0+1.1;
  const E=[S.x+S.R*.55*Math.cos(ea),S.y-7,S.z+S.R*.55*Math.sin(ea)],C=[P[0]*1.05,P[1]+40,P[2]*1.05];
  let nb=16;if(i%3===fallen)nb=9;             // a torn stub where its saucer used to be
  for(let k=1;k<=nb;k++){const t=k/16,u=1-t;pts.push([u*u*P[0]+2*u*t*C[0]+t*t*E[0],u*u*P[1]+2*u*t*C[1]+t*t*E[1],u*u*P[2]+2*u*t*C[2]+t*t*E[2]]);}
  ribs.push(pts);
  SK.push(altSweep(pts,v=>2.2+1.3*(1-v)+3.4*Math.pow(1-v,7),10));
  // the root foot: a pad where each rib meets the ground
  kput(dd?'boxCR':'boxC',[pts[0][0],.8,pts[0][2]],qEuler(0,-a0,0),[14,1.6,10],null);
  if(i%3===fallen){const T=pts[pts.length-1];kput('plateR',[T[0],T[1]-3,T[2]],qEuler(rr(-.6,.6),rr(0,3),rr(-.6,.6)),[3,7,1],null);
   altRope(T,[T[0]+rr(-4,4),T[1]-rr(18,40),T[2]+rr(-4,4)],.3);}}
 // THE CORE: fluted, through all three saucers to a lantern; snapped in the ruin
 const CH=brk?296:332,coreR=y=>11.5-2.5*y/332;
 const hc=holeFn(dd*.6,9803,brk?CH:null,1.4);
 SK.push(lathe({rFn:coreR,H:332,cut:CH,jag:brk?6:0,flutes:12,amp:.07,nu:48,nv:30,seed:9804,hole:hc}));
 GU.push(lathe({rFn:y=>coreR(y)*.9,H:332,cut:CH-2,nu:24,nv:4}));
 for(let y=226;y<CH-6;y+=5.5)for(let k=0;k<10;k++){const th=(k+.5)/10*TAU+(Math.floor(y/5.5)%2)*.31;
  if(SAU.some(S=>Math.abs(y-S.y)<6))continue;if(hc&&hc(th/TAU,y))continue;
  const r=coreR(y)+.4;altWin([r*Math.cos(th),y,r*Math.sin(th)],[Math.cos(th),0,Math.sin(th)],1.4,2.4,d);}
 if(!brk){kput('finial',[0,340,0],null,[3.4,6,3.4],null);kput(dd?'postR':'postW',[0,352,0],null,[.6,22,.6],null);
  kput('ringW',[0,333,0],qEuler(Math.PI/2,0,0),[12,12,12],null);}
 // THE TRAYS: deck, lawn, parapet and a glazed drum of rooms under each
 const TR=[];
 for(let k=0;k<7;k++){const y=36+k*30,r=rad(y)+3.5,rD=r*.7,hf=holeFn(dd*.7,9805+k*3,null,1.1);
  TR.push({y,r,rD});
  const ann=(yy)=>gridSurface((u,v)=>{const th=u*TAU,rr2=lerp(rD-1,r,v);return[rr2*Math.cos(th),yy,rr2*Math.sin(th)];},56,3,
   {uS:r*TAU/8,vS:2,hole:hf&&brk?(u,v)=>hf(u,v*40+k*9):null});
  SK.push(ann(y),ann(y-1.8));
  SK.push(gridSurface((u,v)=>{const th=u*TAU;return[r*Math.cos(th),y-1.8+v*3,r*Math.sin(th)];},64,1,{uS:r*TAU/8,vS:.4,
   hole:hf&&brk?(u,v)=>hf(u,40+k*9):null}));
  // lawn ring (a planted terrace) on the deck
  if(!(brk&&k===3))LW.push(gridSurface((u,v)=>{const th=u*TAU,rr2=lerp(rD+2,r-1.5,v);return[rr2*Math.cos(th),y+.12,rr2*Math.sin(th)];},48,1,
   {uS:6,vS:1,hole:hf&&brk?(u,v)=>hf(u,v*40+k*9):null}));
  // the drum under it, 28 m of rooms: glass and lit cells intact, dark and holed in the ruin
  {const h0=k===0?0:y-30+.2,h1=y-1.8;
   const dr=lathe({rFn:()=>rD*.97,H:h1-h0,nu:40,nv:6,hole:brk?holeFn(.8,9806+k,null,1.5):null});dr.translate(0,h0,0);DK.push(dr);
   if(!dd){const g=lathe({rFn:()=>rD,H:h1-h0,nu:40,nv:2});g.translate(0,h0,0);GL.push(g);}
   for(let yy=h0+2.6;yy<h1-1;yy+=4.2){if(brk)kput('slab',[0,yy-1.6,0],null,[rD*.96,.5,rD*.96],new THREE.Color(0x2a2622));
    const n=Math.round(rD*TAU/5);for(let j=0;j<n;j++){const th=(j+.5)/n*TAU;if(brk&&rng()<.35)continue;
     altWin([(rD+.25)*Math.cos(th),yy,(rD+.25)*Math.sin(th)],[Math.cos(th),0,Math.sin(th)],2.6,1.9,d);}
    if(!dd)for(let j=0;j<n;j+=2){const th=j/n*TAU;kput('mullW',[(rD+.3)*Math.cos(th),yy,(rD+.3)*Math.sin(th)],qEuler(0,-th,0),[1,4.2,1],null);}}}
  // trees on the lawn: trimmed intact, a thicket in the ruin
  const nt=brk?16:9;for(let j=0;j<nt;j++){const th=rng()*TAU,rr2=rr(rD+3,r-2.5);
   VEG.tree(rr2*Math.cos(th),y,rr2*Math.sin(th),j%3,brk?rr(6,12):rr(4,7));}
  stripRing(0,y-2.4,0,r+.2,dd,48);
  if(brk&&k%2)mossOnRing(0,y,0,rr(rD+2,r-2),30,2.6);
 }
 // THE SAUCERS
 const saucer=(S,ox,oy,oz,hole,P)=>{const R=S.R,A=[],L=[];
  A.push(gridSurface((u,v)=>{const th=u*TAU,r=v*R;return[ox+r*Math.cos(th),oy-11*(1-v*v),oz+r*Math.sin(th)];},64,8,{uS:R*TAU/8,vS:R/8,hole}));
  A.push(gridSurface((u,v)=>{const th=u*TAU,r=v*R;return[ox+r*Math.cos(th),oy+.6,oz+r*Math.sin(th)];},64,4,{uS:R*TAU/8,vS:R/8,hole}));
  A.push(gridSurface((u,v)=>{const th=u*TAU;return[ox+R*Math.cos(th),oy+lerp(-.4,2.4,v),oz+R*Math.sin(th)];},96,1,{uS:R*TAU/8,vS:.4,hole}));
  L.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(14,R-2,v);return[ox+r*Math.cos(th),oy+.75,oz+r*Math.sin(th)];},48,3,{uS:6,vS:3,hole}));
  return{A,L};};
 SAU.forEach((S,i)=>{
  if(i===fallen){
   // down on the plain to the south-east, on its edge in its own crater of rubble
   const F=new THREE.Group();F.rotation.set(.32,.6,-.22);F.position.set(150,0,95);G.add(F);
   const hf=holeFn(.9,9807,null,1.3),s=saucer(S,0,0,0,(u,v)=>hf(u,v*60)||(v>.55&&u>.3&&u<.42));
   meshMerged(s.A,MAT.rust,F);meshMerged(s.L,MAT.turfR,F);dropFragment(F,0,4);
   useGroupXF(F);for(let j=0;j<14;j++){const th=rng()*TAU,r=rr(16,S.R-4);VEG.tree(r*Math.cos(th),.8,r*Math.sin(th),j%3,rr(6,13));}
   endGroupXF();
   rubbleRing(150,0,95,20,70,90,4);
   REGISTER({name:'The Bole: fallen saucer',x:150,y:0,z:95,r:74,h:60});
   return;}
  const T=new THREE.Group();T.position.set(S.x,S.y,S.z);G.add(T);
  if(brk&&i===1)T.rotation.set(.0,0,-.16);       // dropped at its outer edge
  const hf=brk?holeFn(.55,9808+i,null,1.2):null,s=saucer(S,0,0,0,hf?(u,v)=>hf(u,v*60):null);
  meshMerged(s.A,skin,T);meshMerged(s.L,dd?MAT.turfR:MAT.lawn,T);
  useGroupXF(T);
  stripRing(0,-1,0,S.R-.6,dd,44);
  // a glass pavilion and a grove on each deck
  if(!dd)mesh(new THREE.SphereGeometry(9,24,10,0,TAU,0,Math.PI/2),MAT.glass,T,S.R*.45,.6,0);
  else kput(dd?'ringR':'ringW',[S.R*.45,.8,0],qEuler(Math.PI/2,0,0),[9,9,9],null);
  const nt=brk?22:12;for(let j=0;j<nt;j++){const th=rng()*TAU,r=rr(16,S.R-4);
   if(!dd&&Math.hypot(r*Math.cos(th)-S.R*.45,r*Math.sin(th))<11)continue;
   VEG.tree(r*Math.cos(th),.75,r*Math.sin(th),j%3,brk?rr(7,14):rr(5,9));}
  for(let j=0;j<24;j++){const th=j/24*TAU;kput(dd?'postR':'postW',[(S.R-.6)*Math.cos(th),2.6,(S.R-.6)*Math.sin(th)],null,[.25,1.4,.25],null);}
  endGroupXF();
  REGISTER({name:'The Bole: canopy saucer '+(i+1),x:S.x,y:S.y-12,z:S.z,r:S.R,h:16});});
 // the ground: a stone disc between the roots, an apron, people
 kput(SLABC(d),[0,.6,0],null,[96,1.2,96],null);
 apron(G,0,0,96,128,dd,1.2);
 meshMerged(SK,skin,G);meshMerged(DK,MAT.dark,G);meshMerged(GU,MAT.guts,G);
 if(LW.length)meshMerged(LW,dd?MAT.turfR:MAT.lawn,G);
 if(GL.length)meshMerged(GL,MAT.glass,G);
 if(brk){rubbleRing(0,0,0,26,110,170,4.5);scatterMoss(0,0,0,30,150,120,4);vinesFromLedge(SK,0,0,0,140,24,0,0);
  trees(0,0,100,220,40);stainsFromLedge(SK,0,0,0,40,18,0,0);}
 else{trees(0,0,130,200,16);figures(0,118,10,14);}
 if(rec){
  KOFF=[gx,0,gz];altReclaim(G,260,30,'altBole');
  // hoists from the first saucer and from the trays to the ground, ladders up two ribs
  for(let i=0;i<5;i++){const a=rng()*TAU,T=TR[(rng()*4)|0];altRope([(T.r-.5)*Math.cos(a),T.y,(T.r-.5)*Math.sin(a)],[(T.r+1)*Math.cos(a),0,(T.r+1)*Math.sin(a)],.12);
   kput('waterButt',[(T.r+1)*Math.cos(a),.9,(T.r+1)*Math.sin(a)],null,[1,1.8,1],null);}
  for(const i of[0,3]){const P=ribs[i];for(let k=0;k<5;k++){const a=P[k],b=P[k+1];altLadder([a[0],a[1]+.3,a[2]+3.4],[b[0],b[1]+.3,b[2]+3.4],[1,0,0]);}}
  // a rope bridge across from the second tray to the fallen saucer's crater, a market on the plinth
  for(let j=0;j<10;j++){const a=rng()*TAU,r=rr(40,85),yaw=rng()*TAU;kput('patchTarp',[r*Math.cos(a),3.4,r*Math.sin(a)],qEuler(-Math.PI/2+rr(-.2,.2),yaw,0),[rr(5,9),rr(4,7),1],null);
   for(const s of[-1,1])kput('plank',[r*Math.cos(a)+s*2.4*Math.cos(yaw),2.1,r*Math.sin(a)-s*2.4*Math.sin(yaw)],null,[.2,2.6,.2],null);
   firePit('altBole',r*Math.cos(a)+3,1.25,r*Math.sin(a),.8);}
  figures(60,60,24,40);}
 KOFF=[0,0,0];return G;}
