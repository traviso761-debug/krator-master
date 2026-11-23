// ================================================================= XANADU — the slate town wall (after Chiang Mai's thin brick wall)
// Opt-in (2026-11-17; settlements/kirstabal, the owner: "a wall made of slate similar to the thin brick wall of chiang mai"),
// read in place by name as 87k is (settlements/kirstabal kit.json "external"), so no other page changes. Thin-coursed slate
// laid like Chiang Mai's narrow bricks: a battered-free curtain on a base course, a parapet of tall merlons with stepped
// peaks and a loophole under each, a low inner parapet; the gate is two tall stepped pillars either side of the road (Tha
// Phae's), the timber leaves standing open against them; a square bastion at each corner (the jaeng); a buttress where the
// wall turns. core/city lays the wall as records (KCITY.site.wall: its runs, its gates square to the road through them, its
// towers); the world places these along them.
//   xa_slate_wall     a run of curtain, o.len metres long (16 by default) along local x, its outer face +z
//   xa_slate_gate     the gate: the road along local x, the pillars at +-z, a stub of wall on to either side; o.pass (9 m)
//   xa_slate_bastion  the corner bastion, 13 m square, its merlons all round
//   xa_slate_tower    the buttress at a turn of the wall: local z along the wall
// The stone is MAT.xSlate (item xSlateB): a pale grey on the kit's stone map (the slate's colour is the bound set's), world-unit UVs; a page with a library family
// named xSlate in its pack binds it (KMAT.bindMat). Each builder opens with its own reseed (34131-34134); none draws rnd().
MAT.xSlate=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xd2d8de,roughness:.92,metalness:0});vWorldUV(MAT.xSlate,1/2);
MAT.xSlateD=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xb8c0c8,roughness:.95,metalness:0});vWorldUV(MAT.xSlateD,1/2);
kdef('xSlateB',VBOX,MAT.xSlate);kdef('xSlateDB',VBOX,MAT.xSlateD);
const XSW={H:5,T:2.6,step:2.4,cOut:xC(0xffffff),cBase:xC(0xffffff)};
/* a stretch of curtain from x0 to x1 (local), outer face +z: the body, the base course, the outer parapet of merlons (stepped
   peaks, a loophole under each), the inner parapet */
function xswRun(x0,x1,H,T){const L=x1-x0,cx=(x0+x1)/2;if(L<.5)return;
 vB('xSlateDB',cx,0,0,L,.7,T+.5,0,XSW.cBase);   /* the base course */
 vB('xSlateB',cx,0,0,L,H,T,0,XSW.cOut);
 vB('xSlateB',cx,H,T/2-.3,L,.9,.6,0,XSW.cOut);   /* the parapet's foot */
 vB('xSlateB',cx,H,-T/2+.2,L,.55,.4,0,XSW.cOut);   /* the inner parapet */
 const n=Math.max(1,Math.round(L/XSW.step));
 for(let k=0;k<n;k++){const x=x0+(k+.5)*L/n;
  vB('xSlateB',x,H+.9,T/2-.3,1.05,1.25,.6,0,XSW.cOut);vB('xSlateB',x,H+2.15,T/2-.3,.7,.28,.5,0,XSW.cOut);vB('xSlateB',x,H+2.43,T/2-.3,.36,.26,.42,0,XSW.cOut);
  vB('vDarkB',x,1.05,T/2+.02,.26,.26,.05,0);vB('vDarkB',x,H+1.25,T/2+.01,.18,.18,.05,0);}}
function buildXaSlateWall(G,o){reseed(34131);const L=o.len==null?16:o.len;vnReg('Town wall (slate)',0,0,L/2,XSW.H+2.7);xswRun(-L/2,L/2,XSW.H,XSW.T);}
XA.def({key:'xa_slate_wall',name:'Town wall (slate)',family:'Slate wall',tags:{type:['defense'],wealth:'civic',lit:false},w:16,d:3.1,h:7.8,fw:16,fd:3.1,build:buildXaSlateWall});
/* the gate: the road runs along x; the pillars, 4.6 m along the road and 4.2 across, rise to 7.6 m and step in to 8.8, crowned
   with merlons; the curtain runs on along z either side for 9.5 m; the leaves stand open against the pillars; a tall timber
   post at the outer corner of one pillar, the gate's name on a slate plaque on the other */
function buildXaSlateGate(G,o){reseed(34132);const P=o.pass==null?9:o.pass,PT=4.2,PD=4.6,PH=7.6,T=XSW.T,stub=9.5,timber=xC(0x6b5a46),post=xC(0x7c7466);
 vnReg('Gate (slate)',0,0,P/2+PT+stub,PH+3);
 for(const s of[-1,1]){const z=s*(P/2+PT/2);
  vB('xSlateDB',0,0,z,PD+.5,.8,PT+.5,0,XSW.cBase);vB('xSlateB',0,0,z,PD,PH,PT,0,XSW.cOut);vB('xSlateB',0,PH,z,PD-1,1.2,PT-.8,0,XSW.cOut);
  for(const dx of[-1.2,0,1.2]){vB('xSlateB',dx,PH+1.2,z,.8,.9,PT-1.2,0,XSW.cOut);vB('xSlateB',dx,PH+2.1,z,.45,.35,PT-1.6,0,XSW.cOut);}
  for(let k=0;k<4;k++)vB('vDarkB',PD/2+.02,1.3+k*1.5,z,.05,.3,.3,0);
  /* the curtain on beyond the pillar, along z (its own frame: a run along x turned a quarter) */
  {const z0=s*(P/2+PT),z1=s*(P/2+PT+stub),cz=(z0+z1)/2;
   vB('xSlateDB',0,0,cz,T+.5,.7,stub,0,XSW.cBase);vB('xSlateB',0,0,cz,T,XSW.H,stub,0,XSW.cOut);
   vB('xSlateB',T/2-.3,XSW.H,cz,.6,.9,stub,0,XSW.cOut);vB('xSlateB',-T/2+.2,XSW.H,cz,.4,.55,stub,0,XSW.cOut);
   const n=Math.round(stub/XSW.step);for(let k=0;k<n;k++){const zz=Math.min(z0,z1)+(k+.5)*stub/n;
    for(const sx of[-1,1]){vB('xSlateB',sx*(T/2-.3),XSW.H+.9,zz,.6,1.25,1.05,0,XSW.cOut);vB('xSlateB',sx*(T/2-.3),XSW.H+2.15,zz,.5,.28,.7,0,XSW.cOut);}}}
  /* the leaf, open against the pillar's inner face */
  vB('vWood',-.2,0,s*(P/2-.16),P/2-.4,5.4,.22,0,timber);vB('vWood',-.2,2.6,s*(P/2-.3),P/2-.6,.25,.1,0,xC(0x4e4234));}
 vPst('vPost',PD/2+.4,0,P/2+.5,.3,8.4,post);   /* the tall timber post by the passage */
 vB('vDarkB',PD/2+.03,3.2,-(P/2+PT/2),.06,1.5,2.4,0);   /* the gate's name, on a slate plaque */
 vB('xSlateDB',0,-.05,0,PD+1,.12,P,0,XSW.cBase);}   /* the threshold */
XA.def({key:'xa_slate_gate',name:'Gate (slate)',family:'Slate wall',tags:{type:['defense'],wealth:'civic',lit:false},w:6,d:36,h:10,fw:6,fd:36,build:buildXaSlateGate});
/* the corner bastion (the jaeng): a square platform a little higher than the curtain, merlons all round */
function buildXaSlateBastion(G,o){reseed(34133);const S=13,H=XSW.H+.8;vnReg('Corner bastion (slate)',0,0,S*.75,H+2.7);
 vB('xSlateDB',0,0,0,S+.8,.8,S+.8,0,XSW.cBase);vB('xSlateB',0,0,0,S,H,S,0,XSW.cOut);
 for(let f=0;f<4;f++){const ry=f*Math.PI/2,n=5;
  for(let k=0;k<n;k++){const t=-S/2+(k+.5)*S/n,p=loc(0,0,t,S/2-.3,ry);
   vB('xSlateB',p[0],H,p[1],f%2?.6:1.1,.9,f%2?1.1:.6,0,XSW.cOut);vB('xSlateB',p[0],H+.9,p[1],f%2?.6:1.05,1.25,f%2?1.05:.6,0,XSW.cOut);
   vB('xSlateB',p[0],H+2.15,p[1],f%2?.5:.7,.28,f%2?.7:.5,0,XSW.cOut);const q=loc(0,0,t,S/2+.02,ry);vB('vDarkB',q[0],1.2,q[1],f%2?.05:.3,.3,f%2?.3:.05,0);}}}
XA.def({key:'xa_slate_bastion',name:'Corner bastion (slate)',family:'Slate wall',tags:{type:['defense'],wealth:'civic',lit:false},w:13.8,d:13.8,h:9,fw:13.8,fd:13.8,build:buildXaSlateBastion});
/* the buttress at a turn of the wall: across the curtain, a little proud of it each side and a step higher; z along the wall */
function buildXaSlateTower(G,o){reseed(34134);const W=XSW.T+2.2,D=12.6,H=XSW.H+.6;vnReg('Wall buttress (slate)',0,0,D/2,H+2.7);
 vB('xSlateDB',0,0,0,W+.5,.8,D+.4,0,XSW.cBase);vB('xSlateB',0,0,0,W,H,D,0,XSW.cOut);
 for(const sx of[-1,1])for(let k=0;k<5;k++){const z=-D/2+(k+.5)*D/5;vB('xSlateB',sx*(W/2-.3),H,z,.6,1.2,1.05,0,XSW.cOut);vB('xSlateB',sx*(W/2-.3),H+1.2,z,.5,.28,.7,0,XSW.cOut);}}
XA.def({key:'xa_slate_tower',name:'Wall buttress (slate)',family:'Slate wall',tags:{type:['defense'],wealth:'civic',lit:false},w:4.8,d:12.6,h:8.2,fw:4.8,fd:12.6,build:buildXaSlateTower});
