// ================================================================= EASTERN NOMAD KIT — the Khan (caravanserai)
// buildCaravanserai({w,d,seed}): a walled court. Outer walls with merlons and four
// round corner towers; a tall gate portal (pishtaq) with a pointed arch in the
// middle of the +z side; inside, a ring of rooms behind an arcade of arches on
// all four sides, a flat roof with a parapet; a well and troughs in the court.
// `ring` is the depth of the walls + rooms + arcade: the host blocks that band
// in the walkable grid and leaves the court and the gate passage open.
(function(){
const K0=NOMAD.kit,DYE=NOMAD.DYE;
function buildCaravanserai({w=40,d=36,seed=1}={}){
 const K=K0(seed),r=K.rnd,W=Math.max(24,w),D=Math.max(22,d),hx=W/2,hz=D/2,wt=1.4,wh=6.6,ring=9,gate=5;
 const wash=0xcaa27a,trim=0xe2cfae;
 // the outer wall, in pieces so the gate is a gap
 K.color(wash,1);
 K.block('adobe',0,0,-hz+wt/2,W,wh,wt);K.block('adobe',-hx+wt/2,0,0,wt,wh,D);K.block('adobe',hx-wt/2,0,0,wt,wh,D);
 const gw=(W-gate)/2;K.block('adobe',-(gate/2+gw/2),0,hz-wt/2,gw,wh,wt);K.block('adobe',gate/2+gw/2,0,hz-wt/2,gw,wh,wt);
 // a plinth band and the merlons
 K.color(wash,.82);K.block('adobe',0,0,-hz+wt/2,W+.3,.7,wt+.3);K.block('adobe',-hx+wt/2,0,0,wt+.3,.7,D+.3);K.block('adobe',hx-wt/2,0,0,wt+.3,.7,D+.3);
 K.color(trim,1);const mer=(x,z,along)=>K.block('adobe',x,wh,z,along?.7:wt,.7,along?wt:.7);
 for(let x=-hx+1;x<hx-.5;x+=1.5){mer(x,-hz+wt/2,false);if(Math.abs(x)>gate/2+3)mer(x,hz-wt/2,false);}
 for(let z=-hz+1;z<hz-.5;z+=1.5){mer(-hx+wt/2,z,true);mer(hx-wt/2,z,true);}
 // the corner towers
 for(const sx of [-1,1])for(const sz of [-1,1]){const x=sx*(hx-.6),z=sz*(hz-.6);K.color(wash,.96);K.cyl('adobe',x,0,z,2.3,2.6,wh+2.2,16);
  K.color(trim,1);K.cyl('adobe',x,wh+2.2,z,2.5,2.4,.4,16);for(let k=0;k<10;k++){const a=k/10*NOMAD.TAU;K.block('adobe',x+Math.sin(a)*2.2,wh+2.6,z+Math.cos(a)*2.2,.6,.6,.6,a);}
  K.color(null,1);K.block('dark',x+sx*.2,wh-.6,z+sz*2.45,.3,.7,.08);}
 // the gate portal: a tall frame standing proud of the wall, a pointed arch, a dark passage soffit
 const ph=11.5,pw=gate+5,pd=2.4,pz=hz+pd/2-.6;
 K.color(wash,1.04);K.block('adobe',-(gate/2+1.25),0,pz,2.5,ph,pd);K.block('adobe',gate/2+1.25,0,pz,2.5,ph,pd);
 const spring=wh*.92;K.block('adobe',0,spring+gate*.5+1.2,pz,pw,ph-spring-gate*.5-1.2,pd);
 K.color(trim,1);K.arch('adobe',0,spring,gate/2,.5,pz-pd/2-.01,pz+pd/2+.01,11,true);
 K.color(trim,.98);K.block('adobe',0,ph,pz,pw+.6,.5,pd+.4);for(let x=-pw/2+.5;x<=pw/2-.4;x+=1.3)K.block('adobe',x,ph+.5,pz,.6,.7,pd);
 // the portal's tile panel: a band of glazed dye-colour squares above the arch
 for(let k=0;k<7;k++){K.color([DYE.indigo,DYE.cream,DYE.saffron][k%3],1);K.block('canvas',-2.1+k*.7,spring+gate*.5+2.2,pz+pd/2+.02,.6,.6,.05);}
 K.color(null,1);K.block('dark',0,wh-.1,hz-wt/2,gate,.25,wt+pd);
 // inside: the rooms, the arcade in front of them, the roof over both, a parapet on its inner edge
 const iz=hz-wt,ix=hx-wt,rd=4.4,ad=ring-wt-rd,ah=4.2;
 const sides=[{ax:'z',s:-1,len:W-2*wt},{ax:'z',s:1,len:W-2*wt},{ax:'x',s:-1,len:D-2*wt-2*(rd+ad)},{ax:'x',s:1,len:D-2*wt-2*(rd+ad)}];
 for(const S of sides){const n=Math.max(3,Math.floor(S.len/4)),bay=S.len/n;
  for(let k=0;k<n;k++){const t=-S.len/2+bay*(k+.5),isGate=S.ax==='z'&&S.s>0&&Math.abs(t)<gate*.7;
   // place a point on this side: along = t, depth = q measured inward from the outer wall
   const P=(along,q)=>S.ax==='z'?[along,S.s*(iz-q)]:[S.s*(ix-q),along];
   // the room's front wall with its door, then the arcade's pier and arch
   K.color(wash,.9);const [fx,fz]=P(t,rd);const yaw=S.ax==='z'?0:Math.PI/2;
   if(!isGate){K.box('adobe',fx,ah/2,fz,bay-.02,ah,.5,yaw);K.color(null,1);const [dx,dz]=P(t,rd+.27);K.box('dark',dx,1,dz,1,2,.06,yaw);}
   const [qx,qz]=P(t-bay/2,ring-wt);K.color(wash,1);K.box('adobe',qx,ah/2,qz,.9,ah,.9,yaw);
   const [cx2,cz2]=P(t,ring-wt);
   // the arch (built in the xy plane, then turned for the x sides)
   const A=K0(seed+k*31+(S.s>0?7:0)+(S.ax==='x'?101:0));A.color(trim,1);A.arch('adobe',0,ah-1.9,bay/2-.45,.45,-.45,.45,9,true);A.color(wash,1);A.block('adobe',0,ah-.2,0,bay,.9,.9);
   const g=A.finish({});g.position.set(cx2,0,cz2);g.rotation.y=yaw;g.updateMatrixWorld(true);
   for(const m of g.children){const pos=m.geometry.attributes.position,v=new THREE.Vector3();
    K.color(trim,1);for(let i=0;i<pos.count;i+=3){const tri=[0,1,2].map(o=>{v.fromBufferAttribute(pos,i+o).applyMatrix4(g.matrixWorld);return[v.x,v.y,v.z];});K.tri(m.userData.nomadMat,tri[0],tri[1],tri[2]);}
    m.geometry.dispose();}}
  // the roof slab over rooms and arcade, and its parapet facing the court
  K.color(wash,.95);const L=S.len,rc=S.ax==='z'?[0,S.s*(iz-(ring-wt)/2)]:[S.s*(ix-(ring-wt)/2),0];
  if(S.ax==='z')K.block('adobe',rc[0],ah+.4,rc[1],L,.45,ring-wt);else K.block('adobe',rc[0],ah+.4,rc[1],ring-wt,.45,L);
  const pp=S.ax==='z'?[0,S.s*(iz-(ring-wt))]:[S.s*(ix-(ring-wt)),0];K.color(trim,1);
  if(S.ax==='z')K.block('adobe',pp[0],ah+.85,pp[1],L,.6,.3);else K.block('adobe',pp[0],ah+.85,pp[1],.3,.6,L);}
 // the court: packed paving, the well with its frame and bucket, troughs, bales and a few sacks
 K.color(0xb8a080,1);K.block('stone',0,0,0,W-2*ring,.08,D-2*ring);
 K.color(0x9a8068,1);K.cyl('stone',0,0,0,1.3,1.4,.9,16);K.color(null,1);K.cyl('dark',0,.88,0,1.05,1.05,.04,16);
 K.color(0x6a4a32,1);K.beam('wood',[-1.2,.9,0],[-1.2,3,0],.08);K.beam('wood',[1.2,.9,0],[1.2,3,0],.08);K.beam('wood',[-1.4,3,0],[1.4,3,0],.07);K.beam('wood',[0,3,0],[0,1.8,0],.015);
 K.color(0x8a7058,1);for(const sx of [-1,1]){K.block('stone',sx*(W/2-ring-2.2),0,-D*.12,1,.7,5);K.block('stone',sx*(W/2-ring-2.2),0,D*.12,1,.7,5);}
 for(let k=0;k<8;k++){K.color([DYE.cream,DYE.umber,DYE.olive][k%3],.9+r()*.2);const a=r()*NOMAD.TAU,rr=4+r()*3;K.cyl('canvas',Math.cos(a)*rr,0,Math.sin(a)*rr,.32,.38,.8,8);}
 return K.finish({kind:'building',name:'The Khan (caravanserai)',culture:'eastern-nomad',types:['tavern/inn','market/shop'],
  footprint:[[-hx,-hz],[hx,-hz],[hx,hz],[pw/2,hz],[pw/2,hz+pd-.6],[-pw/2,hz+pd-.6],[-pw/2,hz],[-hx,hz]],height:ph+1.2,family:'khan',seed:seed>>>0,ring,gate,portalDepth:pd});}
window.buildCaravanserai=buildCaravanserai;
})();
