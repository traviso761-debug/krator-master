// ================================================================= THE SCREAMER VILLAGE
// Everything the tribe built, as opposed to everything it moved into. The
// vocabulary is Amazonian post-apocalyptic: lashed hardwood posts, palm thatch,
// and flattened sheet salvaged off the arcology, against a ruined Ancient wall
// they quarried out of the industry sheds that did not survive.
//
// buildHexahedron runs first (ROWS insertion order) and leaves SCREAM behind
// with the surviving dwelling clusters, the shaft bundle's centre and the
// ground-terrace height function. Nothing here recomputes any of that.
let SCREAM=null,SCREAM_PROM=null,SCREAM_PLAZA=null;
const wrapPiV=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};

TEX.thatch=canvasTex(256,256,(g,w,h)=>{
 g.fillStyle='#6b5a33';g.fillRect(0,0,w,h);
 for(let i=0;i<2600;i++){const x=rng()*w,y=rng()*h,L=6+rng()*22,a=(rng()-.5)*.5;
  g.strokeStyle='rgba('+(104+rng()*58|0)+','+(88+rng()*48|0)+','+(48+rng()*30|0)+','+(.25+rng()*.5).toFixed(2)+')';
  g.lineWidth=1+rng()*1.8;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.sin(a)*3,y+L);g.stroke();}
 for(let i=0;i<9;i++){const y=i/9*h;g.strokeStyle='rgba(70,56,30,.30)';g.lineWidth=3;
  g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}},4,true);   // eager: draws from rng()
TEX.lash=canvasTex(128,256,(g,w,h)=>{
 g.fillStyle='#6a5038';g.fillRect(0,0,w,h);
 for(let i=0;i<420;i++){const x=rng()*w;g.strokeStyle='rgba('+(110+rng()*70|0)+','+(82+rng()*50|0)+','+(52+rng()*36|0)+',.5)';
  g.lineWidth=1+rng()*3;g.beginPath();g.moveTo(x,0);g.lineTo(x+(rng()-.5)*8,h);g.stroke();}
 for(let k=0;k<4;k++){const y=(k+.5)/4*h;g.strokeStyle='rgba(188,170,120,.75)';g.lineWidth=5;
  g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}},3,true);   // eager: draws from rng()
MAT.thatch=new THREE.MeshStandardMaterial({map:TEX.thatch,color:0xa8996f,roughness:1,metalness:0,side:DS});
MAT.lash  =new THREE.MeshStandardMaterial({map:TEX.lash,color:0xffffff,roughness:.96,metalness:0,side:DS});
MAT.scrap =new THREE.MeshStandardMaterial({map:TEX.corrugate||null,color:0x8a6a52,roughness:.72,metalness:.34,side:DS});
// Ironbark: fibrous red-brown, and much darker than the lashed-timber material
// the boles were borrowing -- against a jungle they were reading as bleached.
// BARK, one texture per hypertree species. The boles were wearing TEX.lash --
// the lashed-post texture, rope bands and all -- tinted, and at 22 repeats up
// a 300 m bole the bands read as nothing. A bole tile here is 10-20 m tall, so
// the features are at that scale: furrows, peel bands, streaks, wrinkles.
function flBarkTex(kind){return canvasTex(256,512,(g,w,h)=>{
 const base=['#5a3424','#d9d4c4','#8c8666','#7a6e5e','#b8a494'][kind];
 g.fillStyle=base;g.fillRect(0,0,w,h);
 if(kind===0||kind===4){                         // ironbark: deep vertical furrows (4: pale, for tinted boughs)
  for(let i=0;i<260;i++){const x=rng()*w,d=rng();
   g.strokeStyle='rgba('+(d<.5?'30,16,10':'140,80,52')+','+(.35+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?2+rng()*5:1+rng()*2;g.beginPath();g.moveTo(x,-10);
   g.bezierCurveTo(x+rr(-14,14),h*.33,x+rr(-14,14),h*.66,x+rr(-10,10),h+10);g.stroke();}
  for(let i=0;i<40;i++){g.fillStyle='rgba(20,10,6,.55)';           // black cracks
   const x=rng()*w,y=rng()*h;g.fillRect(x,y,rr(2,5),rr(20,90));}}
 else if(kind===1){                              // ghostwood: birch peel and lenticels
  for(let k=0;k<18;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'200,196,184':'236,232,222')+',.45)';
   g.fillRect(0,y,w,rr(6,30));}
  for(let i=0;i<120;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(50,44,38,'+(.5+rng()*.45).toFixed(2)+')';
   g.fillRect(x,y,rr(8,36),rr(1.5,4));}
  for(let i=0;i<30;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(120,110,96,.35)';g.fillRect(x,y,rr(2,6),rr(10,60));}}
 else if(kind===2){                              // prism gum: shed bark in coloured strips
  const C=['154,143,106','111,154,106','184,104,62','90,111,160','138,79,120','194,162,78','120,150,120'];
  for(let i=0;i<70;i++){const x=rng()*w,ww=rr(6,26),y0=rng()*h,L=rr(60,260);
   g.fillStyle='rgba('+C[Math.floor(rng()*C.length)]+','+(.45+rng()*.4).toFixed(2)+')';
   g.beginPath();g.moveTo(x,y0);g.lineTo(x+ww,y0+rr(-6,6));g.lineTo(x+ww+rr(-8,8),y0+L);g.lineTo(x+rr(-6,6),y0+L+rr(-8,8));g.closePath();g.fill();}
  for(let i=0;i<120;i++){const x=rng()*w;g.strokeStyle='rgba(60,50,40,'+(.15+rng()*.3).toFixed(2)+')';
   g.lineWidth=1+rng()*1.5;g.beginPath();g.moveTo(x,-5);g.lineTo(x+rr(-6,6),h+5);g.stroke();}}
 else{                                           // baobab: smooth, wrinkled across
  for(let i=0;i<160;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'60,52,44':'150,140,126')+','+(.15+rng()*.3).toFixed(2)+')';
   g.lineWidth=1+rng()*2;g.beginPath();g.moveTo(-5,y);g.bezierCurveTo(w*.3,y+rr(-8,8),w*.7,y+rr(-8,8),w+5,y+rr(-4,4));g.stroke();}
  for(let i=0;i<50;i++){const x=rng()*w,y=rng()*h,r=rr(6,20);g.fillStyle='rgba(90,80,70,.25)';
   g.beginPath();g.ellipse(x,y,r,r*.5,0,0,TAU);g.fill();}}
},undefined,true);}   // eager: it draws from rng(), so it must paint here, in stream order
TEX.bark0=flBarkTex(0);TEX.bark1=flBarkTex(1);TEX.bark2=flBarkTex(2);TEX.bark3=flBarkTex(3);TEX.bark4=flBarkTex(4);
MAT.bark=new THREE.MeshStandardMaterial({map:TEX.bark0,color:0xb09080,roughness:1,metalness:0,side:DS});
// the other three hypertree boles, after Girder's bark sets: ghostwood
// birch-pale, prism gum a warm olive under its streaks, baobab smooth grey-brown
MAT.barkG=new THREE.MeshStandardMaterial({map:TEX.bark1,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.barkP=new THREE.MeshStandardMaterial({map:TEX.bark2,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.barkB=new THREE.MeshStandardMaterial({map:TEX.bark3,color:0xffffff,roughness:1,metalness:0,side:DS});
// BOUGHS wore MAT.timber -- sawn boards with a gap every quarter metre, which
// on a limb is bamboo rings. A limb is bark: the ironbark furrow texture,
// tinted per instance to the species' bark colour, one tile along its length.
MAT.bough=new THREE.MeshStandardMaterial({map:TEX.bark4,color:0xffffff,roughness:1,metalness:0,side:DS});
KIT.defs.bough.mat=MAT.bough;
// the small trees' trunks, one kit item per species so the bark is the species'
[MAT.bark,MAT.barkG,MAT.barkP,MAT.barkB].forEach((m,i)=>{
 kdef('trunk'+i,new THREE.CylinderGeometry(.16,.4,1,8).translate(0,.5,0),m);
 // and a bough per species: a branch wears its trunk's bark, not a generic one
 kdef('bough'+i,new THREE.CylinderGeometry(.5,.5,1,7),m);});

kdef('thatchR',new THREE.ConeGeometry(.72,1,4,1).rotateY(Math.PI/4),MAT.thatch);
kdef('thatchH',new THREE.ConeGeometry(.72,1,6,1),MAT.thatch);
kdef('postW',new THREE.CylinderGeometry(.5,.62,1,7),MAT.lash);
kdef('doorD',new THREE.BoxGeometry(1,1,.3),MAT.dark);
kdef('scrapP',new THREE.BoxGeometry(1,1,.12),MAT.scrap);
// Ancient barrel vaults, used by the reoccupied ground-floor sheds. Declared
// here with the rest of the kdefs; buildHexahedron only needs them at call
// time, which is long after every fragment has loaded.
kdef('vaultW',new THREE.CylinderGeometry(.5,.5,1,14),MAT.concrete);
kdef('vaultR',new THREE.CylinderGeometry(.5,.5,1,14),MAT.concreteR);
const VAULTC=d=>d>0?'vaultR':'vaultW';

// A FLATIRON TOWER, in the Hexahedron's own language: a wedge plan with a
// rounded prow, stepped setbacks, dwelling cells on every tread and glazing on
// every riser, on a chamfered plinth under a crowning slab. The awnings are
// the tribe's, and they are allowed to cross the footprint.
function flatiron(G,cx,cz,y0,ang,L,Wd,H){
 const NF=15,RF=H/NF,TOPS=.34,ch=.10;
 const C=[[L*.60,0],[-L*.40,Wd*.5],[-L*.40,-Wd*.5]],P=[];
 for(let i=0;i<3;i++){const A=C[i],B=C[(i+1)%3];
  P.push([lerp(A[0],B[0],ch),lerp(A[1],B[1],ch)]);
  P.push([lerp(A[0],B[0],1-ch),lerp(A[1],B[1],1-ch)]);}
 const ca=Math.cos(ang),sa=Math.sin(ang);
 const pt=(p,s)=>{const n=P.length,q=(p-Math.floor(p))*n,i=Math.floor(q),f=q-i;
  const A=P[i],B=P[(i+1)%n];
  const lx=lerp(A[0],B[0],f)*s,lz=lerp(A[1],B[1],f)*s;
  return[cx+lx*ca-lz*sa,cz+lx*sa+lz*ca];};
 // outward normal from the outline tangent; the plan is wound CCW so it is
 // (dz,-dx), the same convention the Hexahedron uses
 const nrm=(p,s)=>{const A=pt(p-.004,s),B=pt(p+.004,s);
  const dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz)||1;return[dz/l,-dx/l];};
 const sc=k=>lerp(1,TOPS,Math.pow(k/NF,.95));
 const MF=[],big=Math.max(L,Wd);
 kput(SLABC(1),[cx,y0+2,cz],qEuler(0,-ang,0),[big*.60,4,big*.60],null);
 for(let k=0;k<NF;k++){const yy=y0+4+k*RF,s0=sc(k),s1=sc(k+1);
  MF.push(gridSurface((u,v)=>{const Q=pt(u,s0);return[Q[0],yy+v*RF,Q[1]];},60,2,{uS:22,vS:2}));
  MF.push(gridSurface((u,v)=>{const Q=pt(u,lerp(s0,s1,v));return[Q[0],yy+RF,Q[1]];},60,2,{uS:22,vS:2}));
  const nc=Math.max(6,Math.round(32*s0));
  for(let j=0;j<nc;j++){const p=(j+.5)/nc,N=nrm(p,s0),qf=qFacing([N[0],0,N[1]]);
   const Q=pt(p,lerp(s0,s1,.30)),hh=rr(3,6.5);
   kput(BOXC(1),[Q[0],yy+RF+hh*.5,Q[1]],qf,[rr(5,9),hh,rr(4,7)],null);
   const R2=pt(p,s0);
   for(let row=0;row<2;row++)
    kput('paneD',[R2[0]+N[0]*.4,yy+RF*(.28+row*.38),R2[1]+N[1]*.4],qf,[2.2,2.8,1],null);}
  // AWNINGS shade an opening, or they are a shelf over blank wall -- which is
  // what they were, sitting above the top window row on a band with no door.
  // Each one now gets a door and a pair of windows under it, and the canopy
  // drops to just above their heads.
  if(k%4===2)for(let j=0;j<7;j++){const p=(j+.5)/7,N=nrm(p,s0),Q=pt(p,s0);
   const qf=qFacing([N[0],0,N[1]]);
   kput('doorD',[Q[0]+N[0]*.45,yy+RF*.30,Q[1]+N[1]*.45],qf,[3.4,6.4,1],null);
   for(let sd=-1;sd<=1;sd+=2)
    kput('paneD',[Q[0]+N[0]*.45-N[1]*sd*4.2,yy+RF*.34,Q[1]+N[1]*.45+N[0]*sd*4.2],
     qf,[2.6,3.4,1],null);
   const ex=Q[0]+N[0]*16,ez=Q[1]+N[1]*16;
   for(let sd=-1;sd<=1;sd+=2)
    beam('postW',[Q[0]-N[1]*sd*7,yy+RF*.62,Q[1]+N[0]*sd*7],
     [ex-N[1]*sd*6,yy+RF*.50,ez+N[0]*sd*6],1.5,1.5);
   kput('thatchR',[(Q[0]+ex)*.5,yy+RF*.60,(Q[1]+ez)*.5],qf,[18,4,16],null);}}
 // THE ENTRANCE. It did not meet anything before: the door panel started below
 // the plinth it stands on, the arch was a third its size and floated clear of
 // it, and the steps ran DOWN from the plinth top past the deck. The threshold
 // is the plinth top (y0+4), the arch frames the door rather than sitting
 // beside it, the posts stand on the plinth, and the steps land on the deck.
 {const N=nrm(.5,1),D=pt(.5,1),q=qFacing([N[0],0,N[1]]),TH=y0+4;
  const P=(o1,o2,yy)=>[D[0]+N[0]*o1-N[1]*o2,yy,D[1]+N[1]*o1+N[0]*o2];
  // porch slab on the plinth, projecting out under the door
  {const A=P(5,0,TH+.7);kput(SLABC(1),[A[0],A[1],A[2]],q,[22,1.4,13],null);}
  {const A=P(.4,0,TH+5);kput('doorD',[A[0],A[1],A[2]],q,[8.4,10,1],null);}
  {const A=P(1.1,0,TH+5.4);kput('archOpen',[A[0],A[1],A[2]],q,[4.6,4.4,4.2],null);}
  for(let s2=-1;s2<=1;s2+=2){const A=P(4.4,s2*7.2,TH+6.5);
   kput('postW',[A[0],A[1],A[2]],null,[2.6,13,2.6],null);}
  {const A=P(4.4,0,TH+13.4);kput('postW',[A[0],A[1],A[2]],qEuler(0,-Math.atan2(N[0],-N[1]),1.5708),[2.4,17,2.4],null);}
  // three steps from the porch down to the plaza deck at y0
  for(let j=0;j<3;j++){const A=P(11+j*3.4,0,TH-1.1-j*1.2);
   kput(SLABC(1),[A[0],A[1],A[2]],q,[19-j*2.4,1.5,8],null);}}
 const top=y0+4+NF*RF;
 kput(SLABC(1),[cx,top+2,cz],qEuler(0,-ang,0),[big*.24,4,big*.24],null);
 // The canopy sat at top+4 while the posts carrying it ran to top+15, so it
 // was inside its own frame. It sits on them now.
 for(let q=0;q<8;q++){const a2=q/8*TAU;
  kput('postW',[cx+Math.cos(a2)*big*.20,top+15,cz+Math.sin(a2)*big*.20],null,[2.4,28,2.4],null);}
 // the canopy stands clear above the platform rather than sitting on it, so the
 // top terrace is a usable lookout and not a crawlspace
 kput('thatchH',[cx,top+33,cz],qEuler(0,.3,0),[big*.38,24,big*.38],null);
 meshMerged(MF,MAT.concreteR,G);
 return top;}

// --------------------------------------------------------------------------
function buildVillage(scene,gx,gz,d){reseed(9470+d);KOFF=[gx,0,gz];
 if(!SCREAM){reportErr('village: buildHexahedron left no SCREAM handoff');return null;}
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const {clusters:CL,com:COM,hexr:HEXR,plate:plateY}=SCREAM;
 const WR=HEXR*1.16;                              // the wall stands outside the mesa
 REGISTER({name:'Screamer village — the wall',x:0,z:0,r:WR+30,h:16});
 REGISTER({name:'Screamer village — the lobby',x:COM[0],z:COM[1],r:300,h:64});
 const MER=[],MTH=[],MSC=[];
 // ANTI-OVERLAP PRIORITY. Streets and walls, then the ancient dwellings, then
 // the tribe's own sheds, then farms and furniture -- each tier is placed
 // first and registered in OCC, so every later tier has to fit round it. OCC
 // is declared up here rather than down with the siting code because the wall
 // and the trails go in before anything is rejection-sampled.
 const OCC=[];
 const claim=(x,z,r,tag)=>{OCC.push({x:x,z:z,r:r,tag:tag||'fixed'});};
 // The ANCIENTS' ground works were never in the occupancy list: six sector
 // roads running 595 m out from the middle and the hexagon's own rim wall.
 // Farms were being laid straight across both. Claim them first -- they are
 // older than anything the tribe built and they are tier 1.
 if(SCREAM.roads)SCREAM.roads.forEach(R=>{
  for(let t=.16;t<=1.001;t+=.055)
   claim(R[0]*R[2]*t,R[1]*R[2]*t,17,'road');});

 // ---- the wall: ruined Ancient fabric, hexagonal, cylindrical guard towers --
 // Quarried out of the sheds that fell, so it is the same concrete as the
 // arcology, laid in a line that follows the hexagon the Ancients set out.
 const corner=e=>{const a=e/6*TAU;const R=hexR(WR,a);return[Math.cos(a)*R,Math.sin(a)*R,a];};
 const GATE=[0,3];                                // two gates, on opposite flats
 for(let e=0;e<6;e++){const A=corner(e),B=corner((e+1)%6);
  const n=34,gate=GATE.indexOf(e)>=0;
  for(let j=0;j<n;j++){const t=(j+.5)/n;
   if(gate&&Math.abs(t-.5)<.075)continue;         // the gateway
   const x=lerp(A[0],B[0],t),z=lerp(A[1],B[1],t);
   const ang=Math.atan2(B[1]-A[1],B[0]-A[0]);
   const y=plateY(x,z);
   // the parapet sags and breaks: this wall has stood a long time
   const hh=11*(.72+.5*fbm(t*7+e,1.3,9471,3))*(rng()<.06?.35:1);
   const seg=Math.hypot(B[0]-A[0],B[1]-A[1])/n*1.02;
   kput(BOXC(1),[x,y+hh*.5,z],qEuler(0,-ang,0),[seg,hh,rr(5.5,7)],null);
   claim(x,z,seg*.6,'wall');
   if(rng()<.30)kput(BOXC(1),[x,y+hh+1.1,z],qEuler(0,-ang,0),[seg*.8,2.2,4.4],null);
   // lashed hoarding along the walk, tribal work on an Ancient base
   if(rng()<.42)kput('postW',[x,y+hh+2.4,z],null,[1.3,rr(3,5),1.3],null);}
  // cylindrical guard tower on the corner
  const y=plateY(A[0],A[1]),TH2=rr(20,26);
  MER.push(lathe({rFn:yy=>10.5-1.6*clamp(yy/TH2,0,1)+.5*Math.sin(yy*.5),H:TH2,nu:26,nv:12,
   hole:holeFn(.55,9472+e,null,1.6)}).translate(A[0],y,A[1]));
  kput(SLABC(1),[A[0],y+TH2+1.2,A[1]],null,[12.5,2.4,12.5],null);
  kput('thatchH',[A[0],y+TH2+9,A[1]],qEuler(0,rng()*TAU,0),[17,15,17],null);
  for(let q=0;q<5;q++){const a2=q/5*TAU+e;
   kput('postW',[A[0]+Math.cos(a2)*10.5,y+TH2+5,A[1]+Math.sin(a2)*10.5],null,[1.4,7,1.4],null);}
  if(gate){ // gate posts and a lashed lintel on the flat this edge carries
   const mx=(A[0]+B[0])*.5,mz=(A[1]+B[1])*.5,ga=Math.atan2(B[1]-A[1],B[0]-A[0]);
   for(let q=-1;q<=1;q+=2){const px=mx-Math.sin(ga)*0+Math.cos(ga)*q*26,pz=mz+Math.sin(ga)*q*26;
    kput('postW',[px,plateY(px,pz)+11,pz],null,[4.5,22,4.5],null);}
   kput('postW',[mx,plateY(mx,mz)+23,mz],qEuler(0,-ga,1.5708),[3.2,56,3.2],null);}}

 // the wall circuit and the two gateways, handed on for the patrols and for
 // the warrior party that has to come in through one of them
 {const CIRC=[],GATES=[];
  for(let e=0;e<6;e++){const A=corner(e),B=corner((e+1)%6);
   CIRC.push([A[0],plateY(A[0],A[1])+8,A[1]]);
   if(GATE.indexOf(e)>=0){const mx=(A[0]+B[0])*.5,mz=(A[1]+B[1])*.5;
    GATES.push([mx,plateY(mx,mz)+.3,mz]);}}
  SCREAM.circuit=CIRC;SCREAM.gates=GATES;SCREAM.wallR=WR;}

 // ---- the lobby: a hexagon of doors round the foot of the shaft bundle ------
 // The Ancients left no way in at ground level, so the tribe cut one: a ring
 // wall against the bottom two storeys of the supports, with a door on every
 // face, and the whole thing roofed in thatch against the rains.
 {const LR=232,LH=46,cx=COM[0],cz=COM[1];
  for(let e=0;e<6;e++){const a0=e/6*TAU+.08,a1=(e+1)/6*TAU-.08;
   const n=16;
   for(let j=0;j<n;j++){const t=(j+.5)/n,a=lerp(a0,a1,t);
    const x=cx+Math.cos(a)*LR,z=cz+Math.sin(a)*LR,y=plateY(x,z);
    const seg=LR*(a1-a0)/n*1.03;
    kput(BOXC(1),[x,y+LH*.5,z],qEuler(0,-a,0),[7,LH,seg],null);
    if(j===Math.floor(n/2)||j===Math.floor(n/2)-3||j===Math.floor(n/2)+3)
     kput('doorD',[x+Math.cos(a)*3.6,y+7,z+Math.sin(a)*3.6],qFacing([Math.cos(a),0,Math.sin(a)]),[6,14,1],null);
    if(j%4===0)kput('postW',[x+Math.cos(a)*5,y+LH+3,z+Math.sin(a)*5],null,[2,7,2],null);}
   // thatch pitch over the walk, sloping out from the wall head
   const am=(a0+a1)*.5,mx=cx+Math.cos(am)*(LR+9),mz=cz+Math.sin(am)*(LR+9);
   kput('thatchR',[mx,plateY(mx,mz)+LH+11,mz],qEuler(0,-am,0),[32,22,LR*(a1-a0)*1.05],null);}
  stripRing(cx,LH+6,cz,LR+2,0,26);
  SCREAM.lobby=[cx+Math.cos(-1.9)*(LR+6),plateY(cx,cz)+.3,cz+Math.sin(-1.9)*(LR+6)];}

 // ---- foottrails, cluster to lobby -----------------------------------------
 // Beaten earth, not paving: a chain of trodden patches that wanders, because
 // nobody surveyed it. Each one runs from a cluster centroid to the nearest
 // point on the lobby ring rather than to its centre, which is where people
 // would actually walk to.
 CL.forEach((C,ci)=>{
  const a=Math.atan2(C.z-COM[1],C.x-COM[0]);
  const ex=COM[0]+Math.cos(a)*244,ez=COM[1]+Math.sin(a)*244;
  const n=Math.max(8,Math.round(Math.hypot(ex-C.x,ez-C.z)/13));
  for(let j=0;j<=n;j++){const t=j/n;
   const wob=Math.sin(t*Math.PI)*(fbm(t*4+ci,ci*.7,9473,2)-.5)*54;
   const x=lerp(C.x,ex,t)-Math.sin(a)*wob,z=lerp(C.z,ez,t)+Math.cos(a)*wob;
   kput(SLABC(1),[x,plateY(x,z)+.35,z],qEuler(0,rng()*TAU,0),[rr(5,8.5),.5,rr(5,8.5)],
    new THREE.Color(0x4a3524));
   claim(x,z,7,'trail');}});


 // ---- overlap bookkeeping ---------------------------------------------------
 // The ancient sheds have priority: they were here first, they keep their
 // positions AND their orientations, and everything the tribe put up since fits
 // round them. OCC starts as their footprints and grows as we build.
 SCREAM.sheds.forEach(q=>claim(q.x,q.z,q.r,'shed'));   // the ancient dwellings, tier 2
 // the lift is fixed infrastructure and cannot move, so it is claimed before
 // anything that CAN move gets a chance to take its ground
 {const PA=-1.5708,px=COM[0]+Math.cos(PA)*272,pz=COM[1]+Math.sin(PA)*272;claim(px,pz,34,'lift');}
 // ...and stay off the Ancients' rim wall, which the old 0.90 of WR did not
 const RIM=SCREAM.rim||620;
 const inWall=(x,z)=>{const m=Math.hypot(x,z);
  return m<hexR(WR,Math.atan2(z,x))*.90&&m<RIM*.93;};
 const free=(x,z,r,gap)=>{gap=gap==null?7:gap;
  if(!inWall(x,z))return false;
  if(Math.hypot(x-COM[0],z-COM[1])<288)return false;      // the lobby precinct
  for(const q of OCC)if(Math.hypot(x-q.x,z-q.z)<r+q.r+gap)return false;
  return true;};
 const siteNear=(C,r,rad)=>{for(let t=0;t<48;t++){
   const a=rng()*TAU,m=rad*(.7+.9*rng());
   const x=C.x+Math.cos(a)*m,z=C.z+Math.sin(a)*m;
   if(free(x,z,r)){claim(x,z,r,'built');return[x,z,a];}}
  return null;};
 // ConeGeometry(.72,1,4) rotated 45 deg is a square pyramid whose base corners
 // sit at 0.72*scale on each axis, so a footprint of L needs scale L/1.44.
 const pitch=(x,y,z,rot,L,Wd,h)=>kput('thatchR',[x,y,z],qEuler(0,-rot,0),[L/1.44,h,Wd/1.44],null);

 // ---- warehouses: big hexagons of lashed post, plank and salvaged sheet -----
 const warehouse=(x,z,rot,R)=>{const y=plateY(x,z),H=17;
  for(let k=0;k<6;k++){const am=(k+.5)/6*TAU+rot,av=k/6*TAU+rot;
   const mx=x+Math.cos(am)*R*.866,mz=z+Math.sin(am)*R*.866;
   kput('scrapP',[mx,y+H*.5,mz],qFacing([Math.cos(am),0,Math.sin(am)]),[R*1.02,H,1],null);
   kput('postW',[x+Math.cos(av)*R,y+H*.56,z+Math.sin(av)*R],null,[3.6,H*1.12,3.6],null);}
  // ConeGeometry sits centred on its origin: placing it at the wall head put
  // its base 12.8 m BELOW the head and swallowed the top of the walls. It has
  // to be lifted by half its own height.
  kput('thatchH',[x,y+H+R*.40,z],qEuler(0,-rot,0),[R*1.5,R*.8,R*1.5],null);
  kput('doorD',[x+Math.cos(rot)*R*.9,y+5.5,z+Math.sin(rot)*R*.9],qFacing([Math.cos(rot),0,Math.sin(rot)]),[8,11,1],null);
  for(let q=0;q<5;q++){const a2=rng()*TAU,m=R*(1.15+rng()*.5);   // stacked goods outside
   kput(BOXC(1),[x+Math.cos(a2)*m,y+rr(1,3),z+Math.sin(a2)*m],qEuler(0,rng()*TAU,0),[rr(3,7),rr(2,5),rr(3,7)],null);}};

 // ---- the captive's pen -----------------------------------------------------
 // Its own model, and it does not pretend to be anything else: a double ring of
 // sharpened posts with no gaps, one barred gate, a raised platform so a guard
 // can see the whole floor at once, and an open shelter with no walls.
 const captivePen=(x,z,rot,R)=>{const y=plateY(x,z);
  SCREAM.pen={x:x,z:z,y:y,r:R,rot:rot};
  REGISTER({name:"Screamer village — the captive's pen",x:x,z:z,r:R+14,h:26});
  for(let ring=0;ring<2;ring++){const rr2=R+ring*7,n=Math.round(rr2*.72);
   for(let k=0;k<n;k++){const a=k/n*TAU+ring*.09;
    if(ring===0&&Math.abs(wrapPiV(a-rot))<.20)continue;        // the gateway
    const px=x+Math.cos(a)*rr2,pz=z+Math.sin(a)*rr2;
    kput('postW',[px,y+rr(6,8),pz],qEuler(rr(-.05,.05),0,rr(-.05,.05)),[2.2,rr(12,16),2.2],null);
    kput('postW',[px,y+rr(13,16),pz],null,[1.4,3.4,1.4],null);}}   // sharpened heads
  // barred gate
  for(let q=0;q<4;q++)kput('postW',[x+Math.cos(rot)*R,y+3+q*3.2,z+Math.sin(rot)*R],
   qEuler(0,-rot,1.5708),[1.5,12,1.5],null);
  // open shelter, no walls
  pitch(x-Math.cos(rot)*R*.35,y+8,z-Math.sin(rot)*R*.35,rot+.4,R*.9,R*.65,7);
  for(let q=0;q<4;q++){const a2=q/4*TAU+rot;
   kput('postW',[x-Math.cos(rot)*R*.35+Math.cos(a2)*R*.4,y+4,z-Math.sin(rot)*R*.35+Math.sin(a2)*R*.4],null,[2,8,2],null);}
  // guard platform
  const gx2=x+Math.cos(rot+2.1)*(R+4),gz2=z+Math.sin(rot+2.1)*(R+4);
  for(let q=0;q<4;q++){const a2=q/4*TAU+.7;
   kput('postW',[gx2+Math.cos(a2)*4,y+9,gz2+Math.sin(a2)*4],null,[2.4,18,2.4],null);}
  kput(SLABC(1),[gx2,y+18.5,gz2],null,[8,1.4,8],null);
  kput('thatchH',[gx2,y+23,gz2],qEuler(0,rng()*TAU,0),[12,8,12],null);
  // fire pit and scatter
  kput(SLABC(1),[x,y+.4,z],null,[7,.8,7],new THREE.Color(0x30241c));
  rubbleRing(x,0,z,R*.3,R*.85,22,1.6);};

 // ---- longhouses ------------------------------------------------------------
 // FOUR walls and a proper gable. It had two long sides, no ends, and a hip
 // pyramid dropped on top of them -- which is what made it read as janky. The
 // roof is two real planes meeting at a ridge, built as geometry rather than a
 // cone, and the gable triangles close the ends under it.
 const longhouse=(x,z,rot,L,Wd)=>{const y=plateY(x,z),H=9,RH=7;
  const cr=Math.cos(rot),sr=Math.sin(rot);
  const at=(t,w,yy)=>[x+cr*t-sr*w,yy,z+sr*t+cr*w];
  for(let q=-1;q<=1;q+=2){                                  // the two long sides
   const P=at(0,q*Wd*.5,y+H*.5);
   kput('scrapP',[P[0],P[1],P[2]],qFacing([-sr*q,0,cr*q]),[L,H,1],null);}
  for(let q=-1;q<=1;q+=2){                                  // and the two ends
   const P=at(q*L*.5,0,y+H*.5);
   kput('scrapP',[P[0],P[1],P[2]],qFacing([cr*q,0,sr*q]),[Wd,H,1],null);}
  for(let j=0;j<=6;j++){const t=(j/6-.5)*L;                 // the post frame
   for(let q=-1;q<=1;q+=2){const P=at(t,q*Wd*.5,y+H*.62);
    kput('postW',[P[0],P[1],P[2]],null,[2,H*1.24,2],null);}}
  // the two roof planes, v=0 at the eave and v=1 at the ridge
  for(let sd=-1;sd<=1;sd+=2)
   MTH.push(gridSurface((u,v)=>{const t=(u-.5)*L*1.06,w=sd*(1-v)*Wd*.62;
    return at(t,w,y+H+v*RH);},14,3,{uS:L/3.2,vS:3}));
  // gable triangles, so there is no hole under the ridge at either end
  for(let q=-1;q<=1;q+=2)
   MSC.push(gridSurface((u,v)=>{const w=(u-.5)*Wd*(1-v);
    return at(q*L*.5,w,y+H+v*RH);},6,3,{uS:4,vS:3}));
  // the ridge pole, oversailing both gables
  {const A=at(-L*.56,0,y+H+RH),B=at(L*.56,0,y+H+RH);
   beam('postW',[A[0],A[1],A[2]],[B[0],B[1],B[2]],2.2,2.2);}
  const D=at(L*.5,0,y+4.4);
  kput('doorD',[D[0],D[1],D[2]],qFacing([cr,0,sr]),[5,8.4,1],null);};

 // ---- site them, near the clusters -----------------------------------------
 let nW=0,nL=0,penDone=false;
 CL.forEach(C=>{
  if(nW<4){const S=siteNear(C,36,C.r+78);
   if(S){nW++;
    if(!penDone&&nW===2){captivePen(S[0],S[1],S[2],30);penDone=true;}
    else warehouse(S[0],S[1],S[2],32);}}
  const want=1+(rng()<.5?1:0);
  for(let q=0;q<want&&nL<6;q++){const S=siteNear(C,26,C.r+62);
   if(S){nL++;longhouse(S[0],S[1],S[2],44,17);}}});
 if(!penDone&&CL.length){const S=siteNear(CL[0],34,CL[0].r+90);
  if(S)captivePen(S[0],S[1],S[2],30);}

 // ---- smithies and scrap heaps ----------------------------------------------
 // Where the salvaged sheet on every wall in this village comes from. Open-
 // sided sheds so the forge light gets out, a domed hearth with a stack, an
 // anvil, a quench trough, racks of stock, and the spoil heaps beside them.
 const scrapHeap=(hx,hz,R)=>{const y=plateY(hx,hz);
  for(let q=0;q<26;q++){const a=rng()*TAU,m=Math.sqrt(rng())*R;
   const px=hx+Math.cos(a)*m,pz=hz+Math.sin(a)*m;
   const lift=(1-m/R)*rr(1.5,5.5);
   if(rng()<.55)kput('scrapP',[px,y+lift,pz],qEuler(rr(-1.2,1.2),rng()*TAU,rr(-1.2,1.2)),
    [rr(3,9),rr(2,6),1],null);
   else kput(BOXC(1),[px,y+lift,pz],qEuler(rng()*3,rng()*3,rng()*3),
    [rr(1.5,4),rr(1,3),rr(1.5,4)],new THREE.Color(rng()<.5?0x7a4a2e:0x5a4230));}};
 const smithy=(x,z,rot,R)=>{const y=plateY(x,z);
  REGISTER({name:'Screamer village — a smithy',x:x,z:z,r:R*1.6,h:20});
  (SCREAM.smithies=SCREAM.smithies||[]).push([x,y,z,rot]);
  for(let k=0;k<4;k++){const a=k/4*TAU+rot+.785;
   kput('postW',[x+Math.cos(a)*R,y+6,z+Math.sin(a)*R],null,[2.8,12,2.8],null);}
  pitch(x,y+14,z,rot,R*2.4,R*2.1,6.5);
  // the hearth, and its stack going up through the roof
  const fx=x+Math.cos(rot)*R*.42,fz=z+Math.sin(rot)*R*.42;
  MER.push(lathe({rFn:yy=>R*.40*Math.pow(clamp(1-Math.pow(yy/(R*.55),2),0,1),.5),
   H:R*.55,nu:20,nv:6}).translate(fx,y,fz));
  kput(BOXC(1),[fx,y+R*.55+R*.5,fz],null,[R*.22,R*1.05,R*.22],null);
  if(d===0)stripRing(fx,y+1.2,fz,R*.46,0,10);
  // anvil on a block, quench trough, stock rack
  const ax=x-Math.cos(rot)*R*.30,az=z-Math.sin(rot)*R*.30;
  kput(BOXC(1),[ax,y+.9,az],qEuler(0,-rot,0),[3.4,1.8,2.2],null);
  kput(BOXC(1),[ax,y+2.4,az],qEuler(0,-rot,0),[3.8,1.2,1.4],new THREE.Color(0x4a3a30));
  const tx=x-Math.sin(rot)*R*.6,tz=z+Math.cos(rot)*R*.6;
  kput(BOXC(1),[tx,y+1,tz],qEuler(0,-rot,0),[5,2,2.4],new THREE.Color(0x3e342c));
  for(let q=0;q<7;q++)
   kput('postW',[x+Math.sin(rot)*R*.72+Math.cos(rot)*(q/6-.5)*R*1.4,y+3,
                 z-Math.cos(rot)*R*.72+Math.sin(rot)*(q/6-.5)*R*1.4],
    qEuler(rr(-.25,.25),0,rr(-.25,.25)),[1,rr(5,9),1],null);
  figures(x+Math.cos(rot)*R*1.3,z+Math.sin(rot)*R*1.3,3,14);};
 {let ns=0;
  for(let t=0;t<900&&ns<3;t++){
   const a=rng()*TAU,m=Math.sqrt(rng())*WR*.66;
   const x=Math.cos(a)*m,z=Math.sin(a)*m,R=22;
   if(!free(x,z,R*1.7,8))continue;
   claim(x,z,R*1.7,'built');ns++;
   const rot=Math.atan2(COM[1]-z,COM[0]-x);
   smithy(x,z,rot,R);
   for(let q=0;q<2;q++){                       // spoil heaps beside each
    const a2=rot+2.0+q*1.3,hr=rr(10,16);
    const hx=x+Math.cos(a2)*(R*1.9+hr),hz=z+Math.sin(a2)*(R*1.9+hr);
    if(!free(hx,hz,hr,4))continue;
    claim(hx,hz,hr,'built');scrapHeap(hx,hz,hr);}}}

 // ---- the millipede ranch --------------------------------------------------
 // Krator's giant millipedes, penned. Tier 3, so it is placed before any field
 // and the farms have to work round it rather than the other way about.
 const millipede=(mx,my,mz,ang,L)=>{
  const seg=Math.max(6,Math.round(L/4));
  for(let i=0;i<seg;i++){const t=i/(seg-1)-.5;
   const wob=Math.sin(t*7+ang)*L*.06;
   const px=mx+Math.cos(ang)*t*L-Math.sin(ang)*wob,pz=mz+Math.sin(ang)*t*L+Math.cos(ang)*wob;
   const r=1.9*(1-.45*Math.abs(t*2));
   kput('moss',[px,my+r*.8,pz],qEuler(0,-ang,0),[r*1.25,r,r*1.15],
    new THREE.Color(i%3===0?0xb8683e:0x4a2e22));
   for(let sd=-1;sd<=1;sd+=2)                             // legs
    kput('postW',[px-Math.sin(ang)*sd*r*1.15,my+r*.35,pz+Math.cos(ang)*sd*r*1.15],
     qEuler(sd*.5,-ang,0),[.34,r*1.3,.34],new THREE.Color(0x3a241c));}};
 {let placed=false;
  for(let t=0;t<600&&!placed;t++){
   const a=rng()*TAU,m=Math.sqrt(rng())*WR*.7;
   const x=Math.cos(a)*m,z=Math.sin(a)*m,R=74;
   if(!free(x,z,R,10))continue;
   claim(x,z,R,'built');placed=true;SCREAM.ranch=[x,plateY(x,z),z,R];
   const y=plateY(x,z),rot=Math.atan2(COM[1]-z,COM[0]-x);
   REGISTER({name:'Screamer village — the millipede ranch',x:x,z:z,r:R+8,h:14});
   // a double stockade, because they climb
   for(let ring=0;ring<2;ring++){const rr2=R-ring*6,n=Math.round(rr2*.62);
    for(let k=0;k<n;k++){const a2=k/n*TAU;
     if(ring===0&&Math.abs(wrapPiV(a2-rot))<.16)continue;
     kput('postW',[x+Math.cos(a2)*rr2,y+rr(3.6,4.6),z+Math.sin(a2)*rr2],
      qEuler(rr(-.04,.04),0,rr(-.04,.04)),[1.5,rr(7,9.5),1.5],null);}}
   // feeding troughs laid radially, a long shelter, and the stock
   for(let k=0;k<5;k++){const a2=rot+(k/5-.5)*1.7,m2=R*.55;
    const tx=x+Math.cos(a2)*m2,tz=z+Math.sin(a2)*m2;
    kput(BOXC(1),[tx,y+1.2,tz],qEuler(0,-a2,0),[R*.5,2.4,5],new THREE.Color(0x5a4630));}
   pitch(x+Math.cos(rot+2.5)*R*.52,y+9,z+Math.sin(rot+2.5)*R*.52,rot,R*.62,R*.34,7.5);
   for(let k=0;k<4;k++){const a2=k/4*TAU+rot;
    kput('postW',[x+Math.cos(rot+2.5)*R*.52+Math.cos(a2)*R*.24,y+4.5,
                  z+Math.sin(rot+2.5)*R*.52+Math.sin(a2)*R*.24],null,[2,9,2],null);}
   // the stock itself is animated by the life layer, not placed here
   figures(x+Math.cos(rot)*R*1.15,z+Math.sin(rot)*R*1.15,4,18);}}

 // ---- the ground orchard ----------------------------------------------------
 // The terraces and the plaza have fruit; the ground needs some too, or the
 // harvesters coming out of the dwellings have nowhere to go. Tier 3, placed
 // before the fields.
 const GFRUIT=[];
 for(let t=0;t<900&&GFRUIT.length<46;t++){
  const a=rng()*TAU,m=Math.sqrt(rng())*WR*.78;
  const x=Math.cos(a)*m,z=Math.sin(a)*m;
  if(!free(x,z,13,4))continue;
  claim(x,z,13,'built');
  const y=plateY(x,z),h=rr(9,16);
  FLORA.small(x,y,z,h,2);                       // prism gum, as on the balconies
  for(let q=0;q<4;q++)kput('bloom',[x+rr(-.3,.3)*h,y+h*rr(.6,.86),z+rr(-.3,.3)*h],
   qEuler(0,rng()*TAU,0),[h*.065,h*.065,h*.065],new THREE.Color(rng()<.5?0xd08a2a:0xc25a3a));
  GFRUIT.push([x,y,z]);}
 REGISTER({name:'Screamer village — the orchard ('+GFRUIT.length+' trees)',x:0,z:0,r:WR*.8,h:18});

 // ---- the elevator pylon ----------------------------------------------------
 // The Ancients left no way up from the ground and the lobby only reaches the
 // bottom two storeys of the supports, so the tribe built a lashed lattice mast
 // with a counterweighted car that runs the whole 600 m to the plaza. It is the
 // first moving thing in this kit, and what the TICKS list was added for.
 {const PA=-1.5708,PX=COM[0]+Math.cos(PA)*272,PZ=COM[1]+Math.sin(PA)*272;
  const y0=plateY(PX,PZ),TOP=(SCREAM_PLAZA?SCREAM_PLAZA.y:618);
  REGISTER({name:'Screamer village — the elevator pylon',x:PX,z:PZ,r:26,h:TOP-y0+20});
  const legs=[[-9,-9],[9,-9],[9,9],[-9,9]];
  for(const L of legs)for(let yy=y0;yy<TOP;yy+=26)
   kput('postW',[PX+L[0],yy+13,PZ+L[1]],null,[3.4,27,3.4],null);
  for(let yy=y0+13;yy<TOP-13;yy+=26)for(let k=0;k<4;k++){
   const A=legs[k],B=legs[(k+1)%4];
   beam('postW',[PX+A[0],yy,PZ+A[1]],[PX+B[0],yy+13,PZ+B[1]],1.7,1.7);}
  kput(SLABC(1),[PX,TOP+2,PZ],null,[17,3,17],null);
  kput('thatchH',[PX,TOP+4,PZ],qEuler(0,.3,0),[24,12,24],null);

  const car=new THREE.Group();
  const cm=new THREE.Mesh(new THREE.BoxGeometry(12,9,12),MAT.lash);cm.position.y=4.5;car.add(cm);
  const rf=new THREE.Mesh(new THREE.ConeGeometry(9.5,4.5,4),MAT.thatch);
  rf.position.y=11.2;rf.rotation.y=Math.PI/4;car.add(rf);
  car.position.set(PX,y0+2,PZ);G.add(car);
  const LO=y0+2,HI=TOP-5,SPD=24,RUN=(HI-LO)/SPD,DWELL=7,PER=2*(RUN+DWELL);
  tick((dt,t)=>{const u=t%PER;let h;
   if(u<RUN)h=u/RUN;
   else if(u<RUN+DWELL)h=1;
   else if(u<2*RUN+DWELL)h=1-(u-RUN-DWELL)/RUN;
   else h=0;
   car.position.y=LO+(HI-LO)*h;});}

 // ---- farms and livestock pens fill what is left ----------------------------
 // Every plot's long axis points at the foot of the tower. That is the way the
 // trails run and the way people walk to work, and it is what stops a field
 // system laid down by eye from looking like scattered confetti. Tier 4, so
 // they take whatever the walls, trails, dwellings and sheds have left, and
 // they pack to a 3 m gap rather than 7.
 let fields=0,pens=0;
 for(let t=0;t<9000&&fields+pens<260;t++){
  const a=rng()*TAU,m=Math.sqrt(rng())*WR*.88;
  const x=Math.cos(a)*m,z=Math.sin(a)*m,R=rr(12,24);
  if(!free(x,z,R,2))continue;
  claim(x,z,R,'built');
  const y=plateY(x,z);
  const rot=Math.atan2(COM[1]-z,COM[0]-x);          // long axis toward the tower
  if(rng()<.74){                                    // a field
   fields++;
   const L=R*1.9,Wd=R*1.15,nf=Math.max(4,Math.round(Wd/3.2));
   kput(BOXC(1),[x,y+.3,z],qEuler(0,-rot,0),[L,.6,Wd],new THREE.Color(0x4a3a24));
   for(let j=0;j<nf;j++){const u=(j+.5)/nf-.5;
    kput(BOXC(1),[x-Math.sin(rot)*u*Wd,y+.8,z+Math.cos(rot)*u*Wd],qEuler(0,-rot,0),
     [L*.94,.6,Wd/nf*.55],new THREE.Color(rng()<.25?0x55642c:0x334f24));}
   if(rng()<.3)kput('postW',[x+Math.cos(rot)*L*.5,y+2.4,z+Math.sin(rot)*L*.5],null,[1.3,5,1.3],null);
  }else{                                            // a livestock pen
   pens++;
   const n=Math.round(R*.55);
   for(let k=0;k<n;k++){const a2=k/n*TAU;
    if(Math.abs(wrapPiV(a2-rot))<.24)continue;      // the gate faces the tower
    kput('postW',[x+Math.cos(a2)*R,y+2.6,z+Math.sin(a2)*R],null,[1.4,5.2,1.4],null);}
   pitch(x+Math.cos(rot+2.4)*R*.55,y+5,z+Math.sin(rot+2.4)*R*.55,rot,R*.7,R*.5,4.5);
   for(let q=0;q<3;q++){const a2=rng()*TAU,mm=rng()*R*.7;
    kput('figB',[x+Math.cos(a2)*mm,y,z+Math.sin(a2)*mm],qEuler(0,rng()*TAU,0),[1.6,1.2,2.2],
     new THREE.Color(0x7a6a52));}}}
 REGISTER({name:'Screamer village — the fields ('+fields+' plots, '+pens+' pens)',x:0,z:0,r:WR*.9,h:8});

 // ---- the plaza -------------------------------------------------------------
 // The PLAZA is the lower city's roof: the only large flat open ground in the
 // whole structure, and the only part of it not roofed by the upper pyramid is
 // one point of the lower triangle. That is where the tribe meets, so that is
 // where the hall stands -- on the lower pyramid's own midline, sized to the
 // width the plan actually has that far out rather than to a number I liked.
 if(SCREAM_PLAZA){const Z=SCREAM_PLAZA,ZY=Z.y;
  // The plaza has its own occupancy list: it is a different surface 618 m up,
  // and nothing on the ground can collide with it.
  const PFRUIT=[];
  const POCC=[],pfree=(x,z,r)=>{for(const q of POCC)if(Math.hypot(x-q.x,z-q.z)<r+q.r+4)return false;return true;};
  const f=Z.apex*.46,A=[Z.o[0]+Z.ax[0]*f,Z.o[1]+Z.ax[1]*f];
  const room=Math.min(Z.halfAt(f)*.78,150);
  const DR=Math.min(62,room*.62),DH=DR*.88;
  REGISTER({name:"Screamer village — the orchard workers' residence",x:A[0],y:ZY,z:A[1],r:room,h:DH+26});
  kput(SLABC(1),[A[0],ZY+.5,A[1]],null,[room,1,room],new THREE.Color(0x6b5a42));
  // THE ORCHARD WORKERS' RESIDENCE. The Ancients' domed hall, patched rather
  // than rebuilt, and given over to the people who work the terrace orchards --
  // it is the one roofed building on the plaza and it sits between the fruit
  // and the gate they carry it through.
  const dome=y=>DR*Math.pow(clamp(1-Math.pow(y/DH,2),0,1),.58);
  MER.push(lathe({rFn:dome,H:DH,flutes:14,amp:.06,sharp:2,nu:56,nv:22,
   hole:(u,y)=>fbm(u*6,y*.08,9474,3)<.30||(Math.cos(u*TAU*14)<.2&&y>7&&y<DH*.8)})
   .translate(A[0],ZY+1,A[1]));
  for(let q=0;q<30;q++){const a2=rng()*TAU,yy=rr(4,DH*.86),r2=dome(yy);
   kput('thatchR',[A[0]+Math.cos(a2)*r2*1.03,ZY+1+yy,A[1]+Math.sin(a2)*r2*1.03],
    qFacing([Math.cos(a2),0,Math.sin(a2)]),[rr(9,17),rr(4,7),rr(9,17)],null);}
  for(let q=0;q<14;q++){const a2=q/14*TAU;                 // lashed ribs
   beam('postW',[A[0]+Math.cos(a2)*DR*1.05,ZY+1,A[1]+Math.sin(a2)*DR*1.05],
    [A[0]+Math.cos(a2)*9,ZY+DH+4,A[1]+Math.sin(a2)*9],2.4,2.4);}
  kput('thatchH',[A[0],ZY+DH+1,A[1]],qEuler(0,.3,0),[30,18,30],null);
  for(let q=0;q<20;q++){const a2=q/20*TAU;                 // the post ring
   kput('postW',[A[0]+Math.cos(a2)*(DR+16),ZY+6,A[1]+Math.sin(a2)*(DR+16)],null,[2.8,13,2.8],null);}
  stripRing(A[0],ZY+3,A[1],DR+15,0,20);
  // it is lived in: bunks and hammocks round the wall, chests and baskets of
  // the day's picking, a hearth in the middle, racks, looms and water jars.
  // Every piece comes from the shared FURN set, so the catalogue artifact and
  // this room can never drift apart.
  {const R2=DR*.66;
   for(let k=0;k<10;k++){const a2=k/10*TAU+.2,px=A[0]+Math.cos(a2)*R2,pz=A[1]+Math.sin(a2)*R2;
    if(k%3===0)FURN.hammock(px,ZY+3.4,pz,a2+1.5708,1.5);
    else FURN.bunk(px,ZY+1,pz,a2+1.5708,1.5);}
   for(let k=0;k<7;k++){const a2=k/7*TAU+.9,px=A[0]+Math.cos(a2)*(R2*.62),pz=A[1]+Math.sin(a2)*(R2*.62);
    if(k%3===0)FURN.chest(px,ZY+1,pz,a2,1.6);
    else if(k%3===1)FURN.basket(px,ZY+1,pz,a2,1.7);
    else FURN.jar(px,ZY+1,pz,a2,1.6);}
   FURN.hearth(A[0],ZY+1,A[1],0,2.4);
   for(let k=0;k<3;k++){const a2=k/3*TAU+.4;
    FURN.stool(A[0]+Math.cos(a2)*5.5,ZY+1,A[1]+Math.sin(a2)*5.5,a2,1.6);}
   for(let k=0;k<4;k++){const a2=k/4*TAU+1.1;
    FURN.rack(A[0]+Math.cos(a2)*(DR*.88),ZY+1,A[1]+Math.sin(a2)*(DR*.88),a2+1.5708,1.7);}
   FURN.loom(A[0]+Math.cos(2.4)*(DR*.45),ZY+1,A[1]+Math.sin(2.4)*(DR*.45),2.4,1.7);
   for(let k=0;k<3;k++){const a2=k/3*TAU+2.0;
    FURN.ladder(A[0]+Math.cos(a2)*(DR*.95),ZY+1,A[1]+Math.sin(a2)*(DR*.95),a2+3.14,1.6,DH*.55);}}
  figures(A[0],A[1],14,Math.round(room*.5));
  POCC.push({x:A[0],z:A[1],r:DR+20});

  // --- THE CHIEF'S PALACE: the flatiron, on the plaza's prow ---------------
  // Sized to the plan, not to a number I liked. The lower plan tapers at 15
  // deg, so a wedge whose width grows 0.536 per unit of length sits exactly on
  // the prow instead of overhanging it; at the surveyed point the deck is only
  // 46 m across and a 150x74 tower hung 17 m off each side, so the centre sits
  // on the plan's own axis.
  {const FL=144,FW=FL*.536,FA=Math.atan2(Z.ax[1],Z.ax[0]);
   const FX=Z.o[0]-3.4,FZ=Z.o[1]+Z.apex-96;
   const ftop=flatiron(G,FX,FZ,ZY,FA,FL,FW,212);
   REGISTER({name:"Screamer village — the chief's palace (the flatiron)",
    x:FX,y:ZY,z:FZ,r:88,h:ftop-ZY+26});
   // it is a watchtower as much as a palace: a lit ring at the door, standards
   // along the prow, and the chief's own people on the terrace
   stripRing(FX,ZY+3.4,FZ,FW*.62,0,16);
   for(let q=0;q<7;q++){const t=(q/6-.5)*FL*.78;
    const px=FX+Math.cos(FA)*t,pz=FZ+Math.sin(FA)*t;
    kput('postW',[px,ZY+9,pz],null,[1.8,18,1.8],null);
    kput('thatchR',[px,ZY+19,pz],qEuler(0,rng()*TAU,0),[7,5,7],null);}
   figures(FX-Math.cos(FA)*FL*.3,FZ-Math.sin(FA)*FL*.3,8,34);
   POCC.push({x:FX,z:FZ,r:94});}

  // --- the way in from the upper city, and the helipad ---------------------
  if(Z.door){const DX=Z.door[0],DZ=Z.door[1],DA=Z.doorAng,DY=Z.doorY;
   REGISTER({name:'Screamer village — the upper city gate',x:DX,y:ZY,z:DZ,r:26,h:34});
   kput('archOpen',[DX,DY+9,DZ],qFacing([Math.cos(DA),0,Math.sin(DA)]),[9,9,7],null);
   for(let q=-1;q<=1;q+=2)
    kput('postW',[DX-Math.sin(DA)*q*13,DY+11,DZ+Math.cos(DA)*q*13],null,[4,24,4],null);
   kput('postW',[DX,DY+24,DZ],qEuler(0,-DA,1.5708),[3,28,3],null);
   for(let j=0;j<7;j++){const t=j/6;                       // steps down to the deck
    kput(SLABC(1),[DX+Math.cos(DA)*t*32,lerp(DY,ZY,t)+.7,DZ+Math.sin(DA)*t*32],
     qEuler(0,-DA,0),[27-j*1.3,1.4,27-j*1.3],null);}
   POCC.push({x:DX,z:DZ,r:34});
   const HX=DX+Math.cos(DA)*96,HZ=DZ+Math.sin(DA)*96;
   REGISTER({name:'Screamer village — the helipad',x:HX,y:ZY,z:HZ,r:34,h:7});
   kput(SLABC(1),[HX,ZY+1.3,HZ],null,[30,2.6,30],null);
   kput(SLABC(1),[HX,ZY+2.8,HZ],null,[22,.8,22],new THREE.Color(0x2a2a2a));
   for(let q=0;q<8;q++){const a2=q/8*TAU;
    kput('postW',[HX+Math.cos(a2)*31,ZY+2.5,HZ+Math.sin(a2)*31],null,[1.4,5,1.4],null);}
   stripRing(HX,ZY+3.4,HZ,32,0,14);
   POCC.push({x:HX,z:HZ,r:38});
   SCREAM.gate=[DX,ZY+.2,DZ];}
  // GRASS over the whole surveyed triangle, then fruit trees wherever nothing
  // is built. Sampled barycentrically so the planting follows the plan rather
  // than a bounding box that would spill off the deck.
  {const PP=Z.poly;
   mesh(gridSurface((u,v)=>{
    const x=lerp(lerp(PP[0][0],PP[1][0],u),PP[2][0],v);
    const z=lerp(lerp(PP[0][1],PP[1][1],u),PP[2][1],v);
    return[x,ZY+.4,z];},60,60,{uS:34,vS:34}),MAT.lawn,G);
   for(let t=0;t<420;t++){
    let b1=rng(),b2=rng();if(b1+b2>1){b1=1-b1;b2=1-b2;}
    const b0=1-b1-b2;
    const x=PP[0][0]*b0+PP[1][0]*b1+PP[2][0]*b2;
    const z=PP[0][1]*b0+PP[1][1]*b1+PP[2][1]*b2;
    if(!pfree(x,z,11))continue;
    POCC.push({x:x,z:z,r:11});
    const h=rr(9,17);
    kput('trunk',[x,ZY+.6,z],null,[h*.16,h,h*.16],new THREE.Color(0x6e4e36));
    for(let b=0;b<3;b++)kput('leafy',[x+rr(-.2,.2)*h,ZY+.6+h*(.68+b*.16),z+rr(-.2,.2)*h],
     qEuler(rng(),rng(),rng()),[h*.36,h*.28,h*.36],new THREE.Color(0x2f5a2a));
    for(let q=0;q<4;q++)
     kput('leafy',[x+rr(-.3,.3)*h,ZY+.6+h*rr(.62,.86),z+rr(-.3,.3)*h],null,
      [h*.055,h*.055,h*.055],new THREE.Color(rng()<.5?0xd08a2a:0xc25a3a));
    PFRUIT.push([x,ZY+.6,z]);}}
  SCREAM.plazaFruit=PFRUIT;
  // drying racks, hide frames and fire pits, on the deck but off the plaza
  for(let q=0;q<38;q++){const a2=rng()*TAU,m=room*(1.1+rng()*1.6);
   const px=A[0]+Math.cos(a2)*m,pz=A[1]+Math.sin(a2)*m;
   // halfAt() is a linear approximation along the apex axis; off-axis it said
   // yes well past the deck edge and furniture ended up floating. onDeck()
   // tests the real outline.
   if(!Z.onDeck(px,pz)||!Z.onDeck(px+14,pz)||!Z.onDeck(px-14,pz)
      ||!Z.onDeck(px,pz+14)||!Z.onDeck(px,pz-14))continue;
   if(Z.inPlaza(px,pz))continue;                           // the plaza stays clear
   if(rng()<.45){for(let k=0;k<4;k++)
     kput('postW',[px+Math.cos(k/4*TAU)*7,ZY+4,pz+Math.sin(k/4*TAU)*7],null,[1.6,8,1.6],null);
    pitch(px,ZY+9,pz,rng()*TAU,18,14,4);}
   else kput(SLABC(1),[px,ZY+.8,pz],null,[rr(5,11),1,rr(5,11)],new THREE.Color(0x2e241c));}}

 // ---- the anti-overlap audit ------------------------------------------------
 // Every rejection-sampled item was tested against everything claimed before
 // it, so this should report zero. It is a regression check, not a discovery:
 // it fails loudly the next time something is placed without being tested, and
 // it is the only way to know the pass actually ran rather than looking right.
 {let bad=0,worst=0,worstPair='';
  for(let i=0;i<OCC.length;i++){const a=OCC[i];
   if(a.tag!=='built')continue;
   for(let j=0;j<OCC.length;j++){if(i===j)continue;const b=OCC[j];
    const d2=Math.hypot(a.x-b.x,a.z-b.z),pen=a.r+b.r-d2;
    if(pen>1.5){bad++;if(pen>worst){worst=pen;worstPair=a.tag+'/'+b.tag;}}}}
  window._overlaps=bad;window._worstOverlap=Math.round(worst);
  if(bad)reportErr('anti-overlap: '+bad+' intersections, worst '+worst.toFixed(1)
   +' m ('+worstPair+')');}

 // ---- hand the life layer its routes ----------------------------------------
 // Pairs only ever join two points on the SAME surface. An agent that walked
 // from the ground to a terrace 600 m up would be flying, and the cheapest way
 // to make sure that never happens is to never build the pair.
 const PAIRS=[];
 CL.forEach(C=>{const y=plateY(C.x,C.z);
  for(let q=0;q<3;q++){const F=GFRUIT[Math.floor(rng()*GFRUIT.length)];
   if(F)PAIRS.push([[C.x,y+.2,C.z],[F[0],F[1]+.2,F[2]]]);}});
 for(let q=0;q<10;q++){const F=GFRUIT[Math.floor(rng()*GFRUIT.length)];
  const a=rng()*TAU;                                  // and some out of the lobby
  if(F)PAIRS.push([[COM[0]+Math.cos(a)*240,plateY(COM[0],COM[1])+.2,COM[1]+Math.sin(a)*240],
                   [F[0],F[1]+.2,F[2]]]);}
 SCREAM.pairs=PAIRS;
 meshMerged(MER,MAT.concreteR,G);meshMerged(MTH,MAT.thatch,G);meshMerged(MSC,MAT.scrap,G);
 KOFF=[0,0,0];return G;}

// ================================================================= THE HYPERJUNGLE
// The belt of forest the village has cleared its ground out of. Its own build
// type so it carries its own triangle budget rather than eating the village's,
// and it thickens with distance: scrub at the wall line, closed canopy by a
// kilometre out, with emergents standing well clear of it.
function buildJungle(scene,gx,gz,d){reseed(9480+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 if(!SCREAM){reportErr('jungle: no SCREAM handoff');return G;}
 // THE HYPERJUNGLE IS THE BIOME KIT. Everything that used to be built here --
 // hypertrees, the canopy, the floor, the cleared belt -- now comes from
 // biomes/hyperjungle (src/75-biome-*, 76-*-biome-hyperjungle-*), bound to
 // this world in 75-biome-05-init.js. The village clearing is the mask; the
 // sun is the scene's; the kit bakes its own instanced meshes into the scene.
 const OUT=3400;
 REGISTER({name:'The hyperjungle (biome kit)',x:0,z:0,r:OUT,h:300});
 BIO.setScene(scene);BIO.setSun([sun.position.x,sun.position.y,sun.position.z]);
 // heroR 1900: this world's forest presets stand up to 1.9 km out, and a camera
 // inside the impostor ring sees blob crowns at close range
 const out=HYPERJUNGLE.build({R:OUT,heroR:1900,quality:1});
 const b=BIO.bake();
 window._jungle={trees:out.trees,hyper:out.hyper,far:out.far,saplings:out.saplings,bakeCalls:b.calls,bakeInst:b.inst};
 KOFF=[0,0,0];return G;}
