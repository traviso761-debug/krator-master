// ================================================================= IZIZ — ANCIENTS RECLAIMED: the two guilds
// Two Ancient buildings the later people have moved into and made their own. Each VERN builder wraps a vendored
// Ancients-kit builder at decay 3 (repaired) + repairPass(), then adds the guild's own vernacular accretion in the
// LOCAL frame (origin = the Ancient building's centre, +z = front, metres). Culture tag 'ancients-reclaimed'.
//   anc_salvagers_guild  — the Salvagers' Guild in the Laboratory ("the Reliquary", buildLab)   seed 7901
//   anc_mercenary_guild  — the Mercenary Guild in the Police station ("the Watch", buildPolice)  seed 7911
// Local helpers carry the vq prefix. Nothing here touches world coordinates: VERN.place owns the transform.
const VQ_IRON=0x2e2a26,VQ_PALISADE=0x7a5a3e;

// Run a kit builder inside a VERN builder: repaired state (HOLES .55), KOFF at the origin so the kit's kput and
// REGISTER land in the group frame (KXF carries the group transform), then the salvage dressing on the finished
// group, then the kit's REG volumes moved into world space + tagged. `stripFlora` drops the trees a d>0 kit
// builder scatters round itself (flora is never part of a building — the biome pass plants at placement time).
function vqWrapKit(G,builder,nameFn,stripFlora,mossR,holes){const c=VERN.cur,r0=c.r0;const nT=KIT.items.trunk.length,nL=KIT.items.leafCard.length,nM=KIT.items.moss.length;
 HOLES=holes==null?.55:holes;let H=null;try{H=withFlatGround(()=>builder(G,0,0,3));}finally{HOLES=1;KOFF=[0,0,0];}
 if(stripFlora){KIT.items.trunk.length=nT;KIT.items.leafCard.length=nL;}
 // the kit's ground-moss scatter runs far past the building (scatterMoss to r 120 on the lab): keep it within mossR of the plot
 if(mossR){const s=c.o.scale||1,R2=mossR*mossR*s*s,M=KIT.items.moss;let w=nM;for(let i=nM;i<M.length;i++){const dx=M[i].p[0]-c.x,dz=M[i].p[2]-c.z;if(dx*dx+dz*dz<=R2)M[w++]=M[i];}M.length=w;}
 if(H)repairPass(H,3);
 vnAdoptREG(r0,nameFn);return H;}

// Palisade along explicit local segments [[x0,z0],[x1,z1]] — the yards here lean on the Ancient fabric for one side.
function vqPalisade(segs,y,h){const c=vC(VQ_PALISADE);for(const s of segs){const L=Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1]);const n=Math.max(1,Math.round(L/.42));
 for(let i=0;i<=n;i++){const x=s[0][0]+(s[1][0]-s[0][0])*i/n,z=s[0][1]+(s[1][1]-s[0][1])*i/n;vPst('vPostB',x,y-.2,z,.2,h+rr(-.25,.25),c.clone().multiplyScalar(rr(.85,1.1)));kput('vConeI',[x,y+h-.15,z],null,[.2,.5,.2],c);}
 vBeam([s[0][0],y+h*.55,s[0][1]],[s[1][0],y+h*.55,s[1][1]],.14,c);}}
// Yard gate in a palisade line: two heavy posts, a lintel with a sign, leaves swung wide open INTO the yard (-z), lamps if lit.
function vqGate(x,y,z,ry,w,h,c){for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.35),0,ry);vPst('vPostB',p[0],y-.2,p[1],.3,h+1.1,c);kput('vConeI',[p[0],y+h+.85,p[1]],null,[.3,.6,.3],c);}
 vB('vWood',x,y+h+.45,z,w+1.6,.36,.42,ry,c);const sp=loc(x,z,0,.3,ry);kput('vWood',[sp[0],y+h-.1,sp[1]],vQ(ry,0,0),[w*.55,.8,.06],vC(vPick(VPAL.awning)));
 const a=1.15;for(const s of[-1,1]){const p=loc(x,z,s*(w/2-(w/4)*Math.cos(a)),-(w/4)*Math.sin(a),ry);kput('vWood',[p[0],y+(h-.3)/2+.05,p[1]],vQ(ry,0,0).multiply(qEuler(0,-s*a,0)),[w/2-.12,h-.3,.1],c.clone().multiplyScalar(.85));
  for(const yy of[.4,h-.7]){const b=loc(x,z,s*(w/2-(w/4)*Math.cos(a)),-(w/4)*Math.sin(a)-.07,ry);kput('vIron',[b[0],y+yy,b[1]],vQ(ry,0,0).multiply(qEuler(0,-s*a,0)),[w/2-.2,.1,.04],vC(VQ_IRON));}}
 if(vLit())for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.35),.32,ry);vnLamp(p[0],y+h+.1,p[1],ry);}}
// A sorted scrap heap with a low board rim: kind 0 rusted plates, 1 pipe offcuts, 2 ghost-white panel offcuts (the smithy idiom).
function vqHeap(x,y,z,r,n,kind){const c=vC(vPick(VPAL.woodPoor));for(let k=0;k<4;k++){const a=k*Math.PI/2;vB('vWood',x+Math.cos(a)*r,y,z+Math.sin(a)*r,.08,.55,r*2+.1,a,c);}
 for(let i=0;i<n;i++){const a=rng()*TAU,rad=Math.sqrt(rng())*(r-.4);const px=x+Math.cos(a)*rad,pz=z+Math.sin(a)*rad;const hgt=y+Math.pow(1-rad/r,1.4)*r*.55*rng()+.05;
  if(kind===0)kput('vRustB',[px,hgt,pz],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[rr(.5,1.4),rr(.03,.08),rr(.4,1.1)],null);
  else if(kind===1)kput('vPipeR',[px,hgt,pz],qEuler(Math.PI/2,rr(-.25,.25),rr(-.3,.3)),[rr(.05,.14),rr(.8,2.4),rr(.05,.14)],null);
  else kput('vPanelB',[px,hgt,pz],qEuler(rr(-.4,.4),rng()*TAU,rr(-.4,.4)),[rr(.6,1.4),.06,rr(.6,1.3)],null);}}
// A-frame of reclaimed pipe: legs spread along the frame's own z, meeting at (x,y+h,z).
function vqAFrame(x,y,z,ry,h,spread){const t=Math.atan2(spread,h),L=Math.hypot(spread,h)+.2;for(const s of[-1,1]){const p=loc(x,z,0,s*spread,ry);vPst('vPipeR',p[0],y,p[1],.13,L,null,vQ(ry,-s*t,0));}
 vB('vIron',x,y+h-.1,z,.5,.3,.3,ry,vC(VQ_IRON));}
// Beam balance for weighing scrap: post, cross beam, two pans on ropes, weights on one and a plate on the other.
function vqScales(x,y,z,ry){const iron=vC(VQ_IRON);vPst('vPipe',x,y,z,.09,2.6,iron);vB('vIron',x,y-.05,z,.9,.12,.9,ry,iron);vB('vIron',x,y+2.5,z,3.0,.1,.1,ry,iron);
 for(const s of[-1,1]){const p=loc(x,z,s*1.35,0,ry);vPst('vRope',p[0],y+1.2,p[1],.025,1.3,vC(0xa89878));vB('vIron',p[0],y+1.1,p[1],.95,.06,.95,ry,iron);
  if(s<0){for(let k=0;k<3;k++)vB('vIron',p[0]+rr(-.2,.2),y+1.16,p[1]+rr(-.2,.2),.22,.22,.22,rng(),iron);}else kput('vRustB',[p[0],y+1.24,p[1]],qEuler(0,rr(0,TAU),.05),[.8,.06,.6],null);}}
// Hand cart: plank bed on two hoop wheels, an axle, two shafts resting on the ground. `load` 0 empty, 1 plates, 2 crates.
function vqCart(x,y,z,ry,c,load){const iron=vC(VQ_IRON);vB('vWood',x,y+.72,z,2.3,.14,1.4,ry,c);
 for(const s of[-1,1]){const p=loc(x,z,0,s*.68,ry);vB('vWood',p[0],y+.86,p[1],2.3,.42,.06,ry,c);const q=loc(x,z,s*1.12,0,ry);vB('vWood',q[0],y+.86,q[1],.06,.42,1.4,ry,c);}
 for(const s of[-1,1]){const p=loc(x,z,.2,s*.8,ry);vBq('vHoop',p[0],y+.6,p[1],.58,.58,1,vQ(ry,0,0),iron);vB('vIron',p[0],y+.52,p[1],.16,.16,.1,ry,iron);}
 {const ax=loc(x,z,.2,-.85,ry);kput('vPipe',[ax[0],y+.6,ax[1]],vQ(ry,Math.PI/2,0),[.05,1.7,.05],iron);}   // axle: VPOST is base-at-0, so pivot at one wheel
 for(const s of[-1,1]){const a=loc(x,z,-1.15,s*.5,ry),b=loc(x,z,-2.6,s*.5,ry);vBeam([a[0],y+.75,a[1]],[b[0],y+.05,b[1]],.07,c);}
 if(load===1)for(let k=0;k<5;k++)kput('vRustB',[x+rr(-.3,.3),y+.85+k*.07,z+rr(-.2,.2)],qEuler(0,ry+rr(-.2,.2),0),[1.6,.05,1.0],null);
 else if(load===2){vnCrate(x,y+.8,z,.8,ry,c);const p=loc(x,z,.6,.3,ry);kput('vSack',[p[0],y+1.0,p[1]],qEuler(0,ry,0),[.4,.3,.34],vC(0xb8a080));}}
// Ridge tent: two poles and a ridge, two canted canvas slabs, guy ropes, a bedroll crate at the open end (+z of the tent).
function vqTent(x,y,z,ry,w,d,h,item,c){const wood=vC(vPick(VPAL.woodPoor));for(const s of[-1,1]){const p=loc(x,z,s*w/2,0,ry);vPst('vPost',p[0],y,p[1],.06,h,wood);}
 vB('vWood',x,y+h-.04,z,w+.3,.08,.08,ry,wood);const a=Math.atan2(h,d/2),L=Math.hypot(h,d/2)+.25;
 for(const s of[-1,1]){const p=loc(x,z,0,s*d/4,ry);kput(item,[p[0],y+h/2+.03,p[1]],vQ(ry,s*a,0),[w+.35,.06,L],c);
  for(const t of[-1,1]){const g0=loc(x,z,t*w/2,0,ry),g1=loc(x,z,t*(w/2+.9),s*(d/2+.9),ry);vBeam([g0[0],y+h-.1,g0[1]],[g1[0],y+.02,g1[1]],.025,vC(0xa89878),'vRope');}}
 const b=loc(x,z,w/2+.9,0,ry);vnCrate(b[0],y,b[1],.6,ry,wood);}
// Drill kit: a pell (post with a crossbar), an archery butt, a weapon rack of spears and blades against a rail.
function vqPell(x,y,z){const c=vC(0x6a5a48);vPst('vPostB',x,y,z,.16,2.0,c);vB('vWood',x,y+1.5,z,.9,.12,.12,0,c);vB('vWood',x,y+.6,z,.5,.5,.5,0,c);}
function vqButt(x,y,z,ry){vPst('vStave',x,y,z,.7,1.4,vC(0xc8a870));const p=loc(x,z,0,.72,ry);vBq('vHoop',p[0],y+.9,p[1],.4,.4,1,vQ(ry,0,0),vC(0xc9442a));vBq('vHoop',p[0],y+.9,p[1],.2,.2,1,vQ(ry,0,0),vC(0xe0a030));}
function vqRack(x,y,z,ry,n){const wood=vC(vPick(VPAL.woodMid)),iron=vC(VQ_IRON);const L=n*.5+.6;for(const s of[-1,1]){const p=loc(x,z,s*L/2,0,ry);vPst('vPost',p[0],y,p[1],.08,1.5,wood);}
 vB('vWood',x,y+1.35,z,L,.12,.14,ry,wood);vB('vWood',x,y+.2,z,L,.1,.5,ry,wood);
 for(let k=0;k<n;k++){const p=loc(x,z,-L/2+.5+k*.5,.28,ry);if(k%3===2)kput('vIron',[p[0],y+.75,p[1]],vQ(ry,.14,0),[.08,1.3,.03],iron);
  else{kput('vWood',[p[0],y+1.5,p[1]],vQ(ry,.15,0),[.05,3.0,.05],vC(0x5a4632));const t=loc(x,z,-L/2+.5+k*.5,.28-.22,ry);kput('vIron',[t[0],y+2.95,t[1]],vQ(ry,.15,0),[.06,.45,.02],iron);}}}
// Hitching rail and a water trough.
function vqHitch(x,y,z,ry,L){const c=vC(vPick(VPAL.woodMid));const n=Math.max(1,Math.round(L/2.5));for(let i=0;i<=n;i++){const p=loc(x,z,-L/2+L*i/n,0,ry);vPst('vPostB',p[0],y,p[1],.1,1.15,c);}vB('vWood',x,y+1.05,z,L+.2,.12,.12,ry,c);}
function vqTrough(x,y,z,ry){const c=vC(vPick(VPAL.woodPoor));vB('vWood',x,y,z,2.4,.62,.8,ry,c);vB('vDarkB',x,y+.5,z,2.2,.1,.6,ry);for(const s of[-1,1]){const p=loc(x,z,s*1.1,0,ry);vB('vIron',p[0],y+.1,p[1],.08,.5,.86,ry,vC(VQ_IRON));}}
// Trophy banners hung from a rope between two tall poles: orange and red cloth, a few torn short.
function vqBannerLine(x0,z0,x1,z1,y,h,n){const wood=vC(0x5a4632);for(const p of[[x0,z0],[x1,z1]]){vPst('vPost',p[0],y,p[1],.1,h,wood);vBall('vBall',p[0],y+h+.1,p[1],.14,vC(VQ_IRON));}
 vBeam([x0,y+h-.15,z0],[x1,y+h-.15,z1],.03,vC(0xa89878),'vRope');const ry=Math.atan2(x1-x0,z1-z0)+Math.PI/2;
 for(let k=0;k<n;k++){const t=(k+.5)/n;const px=x0+(x1-x0)*t,pz=z0+(z1-z0)*t;const bh=rr(1.6,2.6);kput('vCloth',[px,y+h-.2-bh/2,pz],vQ(ry,0,rr(-.05,.05)),[rr(.8,1.2),bh,1],vC(vPick([0xe07a2a,0xc9442a,0xe07a2a,0xb8552a,0xd8893c])));}}

// ---------------------------------------------------------------- THE SALVAGERS' GUILD — the Reliquary
// The lab tower at repaired decay, its colonnade and reactor hut; the guild's salvage yard in front of the arcade,
// beyond the apron's toe (z 46..74, 60 m wide): sorted scrap heaps, gantry, scales, sorting shed on pipe posts,
// carts, guild banners, palisade with a gate to the street, electric lamp posts (civic).
function buildAncSalvagers(G,o){reseed(7901+(o.v|0));
 const LG=vqWrapKit(G,buildLab,n=>"Salvagers' Guild — "+n,true,62,0);   // rust-skinned but whole (Travis): the guild keeps its Reliquary in one piece
 // the DOME, repaired (Travis): the kit's repaired lab still breaks its lattice dome open (its collapse field ignores HOLES).
 // Find the shell (r 17, 22 high) and its dark liner, drop both, and put back the whole ribbed dome in rust with its
 // panels glazed again — a guild that salvages Ancient glass has re-glazed its own roof.
 if(LG){let dome=null;const dead=[];LG.traverse(m=>{if(!m.isMesh)return;m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;const w=b.max.x-b.min.x,h=b.max.y-b.min.y;
   if(Math.abs(h-22)<1.5&&w>28&&w<36&&Math.abs(b.min.y)<.5){dead.push(m);if(!dome||w>dome.w)dome={w,m,y:m.position.y,x:m.position.x,z:m.position.z,parent:m.parent};}});
  if(dome){for(const m of dead)m.parent.remove(m);const R=17,Hd=22,dR=y=>R*Math.pow(clamp(1-Math.pow(y/Hd,2),0,1),.62);
   mesh(lathe({rFn:dR,H:Hd,flutes:24,amp:.07,sharp:2,nu:120,nv:36,hole:(u,y)=>Math.cos(u*TAU*24)<.35&&y<Hd*.82&&y>1.5}),MAT.rust,dome.parent,dome.x,dome.y,dome.z);
   mesh(lathe({rFn:y=>dR(y)*.94,H:Hd,nu:64,nv:24}),MAT.tGlassO||MAT.darkGlass,dome.parent,dome.x,dome.y,dome.z);}}
 reseed(7901+(o.v|0));   // the accretion runs on its own stream, so a kit change cannot move the yard about
 const wood=vC(vPick(VPAL.woodPoor)),iron=vC(VQ_IRON),org=vC(0xe07a2a);
 const YZ=60,YW=60,YD=28,YB=.2;   // yard centre z, width, depth, base height (a slab buries the apron's toe)
 vnReg("Salvagers' Guild — salvage yard",0,YZ,33,10);vnReg("Salvagers' Guild — colonnade to the reactor hut",62,0,30,9);vnReg("Salvagers' Guild — fallen spire",46,-40,14,7);
 vB('vStone',0,-.12,YZ,YW+2,YB+.12,YD+2,0,vC(0x7a7068));vnPaving(0,YB+.02,YZ,YW-4,YD-4,0,vC(0x6a625a),70);
 // palisade: sides, front with the gate, short returns toward the lab leaving the arcade approach open
 const z0=YZ-YD/2,z1=YZ+YD/2,hx=YW/2;
 vqPalisade([[[-hx,z0],[-hx,z1]],[[hx,z1],[hx,z0]],[[-hx,z1],[-4,z1]],[[4,z1],[hx,z1]],[[-hx,z0],[-16,z0]],[[16,z0],[hx,z0]]],YB,3.6);
 vqGate(0,YB,z1,0,7,4.2,vC(VQ_PALISADE));vnSign(-3.9,YB+3.2,z1+.4,0,org);
 for(const s of[-1,1])vnBannerPole(s*6.5,YB,z1-1.2,0,7.5,org);
 // sorting shed on pipe posts in the west corner: corrugate shed roof, sorting benches and bins beneath
 {const sx=-18,sz=z0+5,SW=14,SD=7,SH=3.4;for(const px of[-SW/2+.3,0,SW/2-.3])for(const pz of[-SD/2+.3,SD/2-.3])vPst('vPipeR',sx+px,YB,sz+pz,.13,SH+(pz<0?1.0:0),null);
  vB('vIron',sx,YB+SH+.95,sz-SD/2+.3,SW+.6,.18,.18,0,iron);vB('vIron',sx,YB+SH-.05,sz+SD/2-.3,SW+.6,.18,.18,0,iron);
  vnShedRoof(sx,YB+SH,sz,SW,SD,1.0,0,'vCorr',null,.9,.12);
  vB('vRustB',sx,YB,sz-SD/2+.2,SW-.4,SH-.2,.14,0);vnPatch(sx,YB,sz-SD/2+.1,Math.PI,SW,SH-.2,4);   // back wall of plate, patched
  for(let k=0;k<3;k++){const bx=sx-SW/2+2.4+k*4.6;vB('vWood',bx,YB,sz+1.2,3.4,.85,1.0,0,wood);for(let j=0;j<4;j++)kput(['vRustB','vPanelB','vIron','vRustB'][j],[bx+rr(-1.3,1.3),YB+.9,sz+1.2+rr(-.3,.3)],qEuler(0,rng()*TAU,0),[rr(.4,.9),.05,rr(.3,.7)],null);}
  for(let k=0;k<4;k++){const bx=sx-SW/2+1.6+k*3.2,bz=sz-1.4;for(const s of[-1,1]){vB('vWood',bx+s*1.2,YB,bz,.06,1.1,2.0,0,wood);vB('vWood',bx,YB,bz+s*.97,2.4,1.1,.06,0,wood);}
   const kind=k%3;for(let j=0;j<9;j++){const px=bx+rr(-.9,.9),pz=bz+rr(-.7,.7),py=YB+.2+rr(0,.7);if(kind===0)kput('vRustB',[px,py,pz],qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),[rr(.3,.7),.05,rr(.3,.7)],null);else if(kind===1)kput('vPipeR',[px,py,pz],qEuler(rr(-.4,.4),rng()*TAU,rr(1.2,1.9)),[rr(.04,.09),rr(.5,1.2),rr(.04,.09)],null);else kput('vPanelB',[px,py,pz],qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),[rr(.3,.7),.05,rr(.3,.7)],null);}}
  vnBannerPole(sx+SW/2+1.2,YB,sz-SD/2,0,6.5,org);}
 // the sorted heaps: plates, pipe, ghost-white panels; a stack of whole panels leaning on the east palisade
 vqHeap(9,YB,z0+6,3.4,46,0);vqHeap(18,YB,z0+7,3.0,34,1);vqHeap(24,YB,YZ+3,3.0,38,2);
 for(let k=0;k<6;k++)kput('vPanelB',[hx-1.0-k*.16,YB+1.7,YZ+8+rr(-.15,.15)],qEuler(0,rr(-.04,.04),.22+k*.03),[.1,3.4,rr(1.6,2.6)],null);
 for(let k=0;k<5;k++)kput('vPipeR',[-hx+1.2+k*.28,YB+.1,YZ+3+rr(-.3,.3)],qEuler(Math.PI/2,rr(-.05,.05),0),[rr(.08,.16),rr(3,5.5),rr(.08,.16)],null);   // long pipe stock lying along the west palisade
 // gantry: two pipe A-frames, a beam between, rope and pulley with a plate on the hook
 vqAFrame(8,YB,YZ+5,0,7,2.2);vqAFrame(17,YB,YZ+5,0,7,2.2);kput('vPipeR',[17.4,YB+6.95,YZ+5],qEuler(0,0,Math.PI/2),[.14,9.8,.14],null);
 vB('vIron',12.5,YB+6.5,YZ+5,.34,.5,.24,0,iron);vPst('vRope',12.5,YB+2.9,YZ+5,.03,3.6,vC(0xa89878));vB('vIron',12.5,YB+2.6,YZ+5,.3,.35,.1,0,iron);
 kput('vRustB',[12.5,YB+1.9,YZ+5],qEuler(0,.3,.08),[2.4,1.5,.08],null);
 // scales by the gate where loads are weighed in; carts; a water butt; a lamp post at each corner and two by the gate
 vqScales(-9,YB,YZ+7,.2);vqCart(-22,YB,YZ+7,.35,wood,1);vqCart(20,YB,YZ+10,-.5,wood,0);vqCart(-6,YB,z0+4,1.4,wood,2);
 vnWaterButt(hx-1.6,YB,z0+2,.55,1.2);vnCrate(-hx+2,YB,YZ+11,1.0,.3,wood);vnSacks(-hx+3.5,YB,YZ+11,3);
 for(const p of[[-hx+1.6,z1-1.6],[hx-1.6,z1-1.6],[-hx+1.6,z0+1.6],[hx-1.6,z0+1.6],[-9,z1-1.2],[9,z1-1.2]])vnLampPost(p[0],YB,p[1],4.2);
 vnFolk(-2,YZ+2,8,9);vnFolk(0,z1+4,3,3);}

// ---------------------------------------------------------------- THE MERCENARY GUILD — the Watch
// The hex police block at repaired decay with its tower, vehicle wing and perimeter wall; the guild's muster yard in
// front of the wall (z 46..84, 92 m wide) closed by a palisade with a gate: rostrum with trophy banners, pells,
// archery butts, weapon racks, a tent row for the hired blades, hitching rail and troughs, lamp posts (civic).
// The kit's own wall gap is on the east (vehicle-bay) side, so the yard uses the kit's front wall + pylons as its
// back and the palisade meets the pylons at x = ±46. NB the kit's pad is a 160 m concrete DISC (slabCR r 80): the
// measured footprint is x ±80, z -80..90, and the def's w/d say so.
function buildAncMercenaries(G,o){reseed(7911+(o.v|0));
 vqWrapKit(G,buildPolice,n=>"Mercenary Guild — "+n,true,0);
 reseed(7911+(o.v|0));
 const wood=vC(vPick(VPAL.woodMid)),iron=vC(VQ_IRON),org=vC(0xe07a2a);
 // the kit's pad is a CYLINDER (slabCR, r 80, top at y .8), so the yard is a rectangular platform at the pad's height that
 // runs out past its round edge at the corners and the gate; steps take the gate down to the ground
 const YZ=65,YW=92,YD=38,YB=.85;const z0=YZ-YD/2,z1=YZ+YD/2,hx=YW/2;
 vnReg("Mercenary Guild — muster yard",0,YZ,48,10);
 vB('vStone',0,-.12,YZ,YW+2,YB+.12,YD+2,0,vC(0x8a8480));vnPaving(0,YB+.02,YZ+3,YW-8,YD-10,0,vC(0x6a625a),110);
 vnStairs(0,0,z1+2.0,0,7.5,YB,4,'vStone',vC(0x8a8480));
 vqPalisade([[[-hx,45.6],[-hx,z1]],[[hx,z1],[hx,45.6]],[[-hx,z1],[-4.5,z1]],[[4.5,z1],[hx,z1]]],YB,4.2);
 vqGate(0,YB,z1,0,8,4.6,vC(VQ_PALISADE));
 // gate towers: a timber platform on four posts either side with a corrugate cap, a watchman's rail, banners
 for(const s of[-1,1]){const gx=s*7.5;for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPostB',gx+sx*1.1,YB,z1-1.4+sz*1.1,.16,7.2,wood);
  vB('vWood',gx,YB+5.0,z1-1.4,2.8,.2,2.8,0,wood);for(let k=0;k<8;k++){const a=k/8*TAU;vPst('vPost',gx+Math.cos(a)*1.3,YB+5.2,z1-1.4+Math.sin(a)*1.3,.06,1.0,wood);}
  vnHipRoof('vHipC',gx,YB+7.2,z1-1.4,2.8,2.8,1.3,0,null,.6);vnLadder(gx+s*1.7,YB,z1-1.4,s*Math.PI/2,5.0,wood);vnBannerPole(s*12.5,YB,z1-1.2,0,8,org);}
 // rostrum against the Watch's wall: timber stage on posts, steps to the front, rail behind, orange canopy, trophy banners strung above
 {const rx=0,rz=z0+5.5,RW=8,RD=4.5,RH=1.3;for(let i=0;i<4;i++)for(const s of[-1,1])vPst('vPostB',rx-RW/2+.4+i*(RW-.8)/3,YB-.2,rz+s*(RD/2-.4),.14,RH+.2,wood);
  vB('vWood',rx,YB+RH-.2,rz,RW,.2,RD,0,wood);for(const s of[-1,1])vB('vWood',rx+s*(RW/2-.05),YB+RH-.9,rz,.1,.7,RD,0,wood);
  vnStairs(rx,YB,rz+RD/2+.7,0,2.4,RH,4,'vWood',wood);
  for(let k=0;k<7;k++)vB('vWood',rx-RW/2+.2+k*(RW-.4)/6,YB+RH,rz-RD/2+.15,.07,1.0,.07,0,wood);vB('vWood',rx,YB+RH+.95,rz-RD/2+.15,RW,.1,.1,0,wood);
  for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',rx+sx*(RW/2-.3),YB+RH,rz+sz*(RD/2-.3),.09,3.4,wood);
  kput('vClothB',[rx,YB+RH+3.45,rz],vQ(0,.1,0),[RW+1.0,.06,RD+1.0],org);vB('vWood',rx+RW/2-1.2,YB+RH,rz+RD/2-1.0,1.0,1.1,.5,0,wood);   // canopy, lectern
  vqBannerLine(-15,z0+1.8,15,z0+1.8,YB,9.5,9);vnBannerPole(rx-RW/2-1.6,YB,rz,0,8.5,org);vnBannerPole(rx+RW/2+1.6,YB,rz,0,8.5,vC(0xc9442a));}
 // weapon racks flanking the rostrum, a spear-stack, crates of gear
 vqRack(-13,YB,z0+3.2,0,9);vqRack(13,YB,z0+3.2,0,9);vnCrate(-16,YB,z0+6,1.0,.2,wood);vnCrate(16.2,YB,z0+6.2,.9,-.3,wood);vnSacks(17.5,YB,z0+8,3);
 // tent row for the hired blades along the west palisade; a fire circle of stones between them
 for(let k=0;k<6;k++){const tz=z0+4.5+k*5.4;const canvas=k%3===1?['vClothB',vC(vPick(VPAL.awning))]:['vTarpB',vC(vPick([0xb8a080,0xa89070,0x9a8a70]))];vqTent(-hx+5.2,YB,tz,Math.PI/2,4.2,3.4,2.5,canvas[0],canvas[1]);}
 {const fx=-hx+11.5,fz=YZ+2;for(let k=0;k<9;k++){const a=k/9*TAU;kput('vRock',[fx+Math.cos(a)*1.1,YB+.12,fz+Math.sin(a)*1.1],qEuler(0,a,0),[.5,.3,.4],vC(0x7a7068));}for(let k=0;k<3;k++)vBall('vEmber',fx+rr(-.3,.3),YB+.16,fz+rr(-.3,.3),.16);
  for(const s of[-1,1])vB('vWood',fx+s*2.6,YB,fz,.5,.45,2.4,0,wood);}
 // drill ground: pells in a row, three archery butts against a board backstop on the east side
 for(let k=0;k<5;k++)vqPell(-22+k*4,YB,z1-8);
 {const bx=hx-6;for(let k=0;k<3;k++)vqButt(bx,YB,z0+8+k*6,-Math.PI/2);for(let k=0;k<5;k++)vB('vWood',hx-2.6,YB,z0+4+k*4.3,.12,2.4,4.2,0,wood);vB('vWood',hx-2.6,YB+2.3,z0+12.6,.16,.14,21.6,0,wood);
  for(let k=0;k<3;k++){vB('vWood',bx-1.4,YB,z0+8+k*6,.08,1.2,.08,0,wood);}}
 // hitching rail and troughs by the gate on the east, a water butt, lamp posts, folk
 vqHitch(hx-8,YB,z1-6,Math.PI/2,10);vqTrough(hx-11,YB,z1-3.2,Math.PI/2);vqTrough(hx-11,YB,z1-9,Math.PI/2);vnWaterButt(hx-2.2,YB,z1-2.2,.55,1.2);
 for(const p of[[-hx+1.8,z1-1.8],[hx-1.8,z1-1.8],[-hx+1.8,z0+1.8],[hx-1.8,z0+1.8],[-20,YZ],[20,YZ]])vnLampPost(p[0],YB,p[1],4.4);
 vnFolk(-4,YZ+4,10,11);vnFolk(4,z0+9,5,4);vnFolk(0,z1+5,3,3);}

const VTAG_ANC_GUILD={culture:'ancients-reclaimed',wealth:'civic',lit:true,role:'guild'};
VERN.def({key:'anc_salvagers_guild',name:"Salvagers' Guild (the Reliquary)",family:'ancients-reclaimed',tags:Object.assign({type:['civic','industry']},VTAG_ANC_GUILD),w:174,d:140,h:87,build:buildAncSalvagers});
VERN.def({key:'anc_mercenary_guild',name:'Mercenary Guild (the Watch)',family:'ancients-reclaimed',tags:Object.assign({type:['civic','military']},VTAG_ANC_GUILD),w:160,d:170,h:40,build:buildAncMercenaries});
