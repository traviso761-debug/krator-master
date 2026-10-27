// ================================================================= SW HIGHLANDS — the trees and the fallen wood
// Zones from the host's fields, three builders, the placement pass and the far canopy. EVERY DRAW IS KRAND's (core/rand): a
// candidate tree is drawn from KRAND.hash(world, cell i, cell j, salt) and its whole form from KRAND.stream(its own seed), so a
// tile built alone draws what it draws in a full build (biomes/WORLD.md) and no tree moves when another pass changes.
// THE LOD (GRAPHIC-LOAD.md): heroes within SWHI.LOD.near of the spine in full, out to SWHI.LOD.tree (800 m) a lighter form, and
// beyond, and for every hero past its range, an octahedral impostor (core/biome 34-core-impostor.js).
(function(){const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const T3=BIO.host.THREE,SP=SWHI.SPECIES,KEY=SWHI.KEY,PAL=SWHI.PAL,PICK=SWHI.PICK;
const Y=(x,z)=>BIO.terrainH(x,z);
SWHI.LOD={tree:800,near:450,floor:420,far:1e9};
SWHI.TREES=[];SWHI.LOGS=[];
const QE=(rx,ry,rz)=>{const e=new T3.Euler(rx||0,ry||0,rz||0,'YXZ');return new T3.Quaternion().setFromEuler(e);};

// ---------------------------------------------------------------- zones from the fields
// forest: everywhere off the bald, the farm and the cliffs; cove: the hollows (the lattice oaks' and bead cones' own ground)
SWHI.zones=function(x,z){const f=n=>BIO.field(n,x,z);const bald=f('bald'),farm=f('farm'),slope=f('slope'),cove=f('cove'),crest=f('crest'),valley=f('valley');
 const open=Math.max(bald,farm);const forest=(1-open)*smooth(1.15,.7,slope);
 return{forest,cove,crest,valley,bald,farm,slope,wet:f('wet'),flow:f('flow'),rock:f('rock'),cold:f('cold'),north:f('north')};};

// ---------------------------------------------------------------- the trees' keep-clear (core/space)
let HOLD=null;
const clearOf=(x,z,r)=>{if(!HOLD)return true;return !HOLD.some(x,z,r,q=>Math.hypot(q.x-x,q.z-z)<q.r+r);};
const hold=(x,z,r)=>{HOLD.insert({x,z,r},x,z,r);};
// the host's volumes, muted while an impostor's tree is built again
let MUTE=false;const reg=o=>{if(!MUTE&&BIO.host.register)BIO.host.register(o);};

// ---------------------------------------------------------------- the builders
// each takes (T, st, lv, s): the tree, the pass's counts, its level (2 full, 1 light) and its own KRAND stream
const B={};
const col=(arr,u)=>PICK(arr,u);
// a quadratic curve a -> b with control c, n+1 points, radius from r0 to r1
const curve=(a,c,b,n,r0,r1)=>{const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push({x:u*u*a[0]+2*u*t*c[0]+t*t*b[0],y:u*u*a[1]+2*u*t*c[1]+t*t*b[1],z:u*u*a[2]+2*u*t*c[2]+t*t*b[2],r:lerp(r0,r1,t)});}return o;};
// THE LATTICE OAK: n cords braided round an open axis (each in turn weaving in and out, so the trunk has gaps right through
// it), flaring into roots at the foot; at the trunk's top each cord runs on out and up as a bough, forking once; every bough's
// and twig's end holds a green cup-pad, and in each pad a few blue parasol fruits stand
B.lattice=function(T,st,lv,s){const S=SP[T.sp],full=lv===2,n=full?s.int(5,7):4,Ht=T.H*s.range(.42,.52),steps=full?12:6,seg=full?7:5;
 const tw=s.range(1.1,1.7)*Math.PI*(s.chance(.5)?1:-1),cc=col(PAL.cord,s.next()),pads=[];
 for(let c=0;c<n;c++){const a0=c/n*TAU+s.range(-.15,.15),P=[];
  for(let i=0;i<=steps;i++){const t=i/steps,a=a0+tw*t,flare=1+.9*Math.pow(1-t,4),R=T.rb*(1.15-.4*t)*flare+T.rb*.22*Math.sin(t*TAU*2+c*Math.PI);
   P.push({x:T.x+Math.cos(a)*R,y:T.y0-.6+t*(Ht+.6),z:T.z+Math.sin(a)*R,r:T.rb*.34*(1-.3*t)*(1+.35*Math.pow(1-t,3))});}
  st.trunk+=BIO.tube('swcord',P,cc,{seg});
  // the bough: on out along the cord's last heading, and up
  const top=P[P.length-1],ae=a0+tw+s.range(-.35,.35),reach=T.crownR*s.range(.5,.95),hb=T.y0+T.H*s.range(.72,.94);
  const end=[T.x+Math.cos(ae)*reach,hb,T.z+Math.sin(ae)*reach],ctl=[T.x+Math.cos(ae)*reach*.35,top.y+(hb-top.y)*.85,T.z+Math.sin(ae)*reach*.35];
  const bough=curve([top.x,top.y,top.z],ctl,end,full?5:3,top.r*1.05,T.rb*.2);st.limb+=BIO.tube('swcord',bough,cc,{seg:full?6:4});
  pads.push(end);
  // a pad on a short spur part way along the bough (the crown in tiers, not one ring of pads)
  {const f=bough[Math.max(1,Math.round(bough.length*.45)-1)],as=ae+s.range(-1.2,1.2),rs=reach*s.range(.2,.35),e3=[f.x+Math.cos(as)*rs,f.y+T.H*s.range(.02,.08),f.z+Math.sin(as)*rs];
   st.limb+=BIO.tube('swcord',curve([f.x,f.y,f.z],[(f.x+e3[0])/2,e3[1],(f.z+e3[2])/2],e3,2,f.r*.6,T.rb*.1),cc,{seg:4});pads.push(e3);}
  // a fork at 60%: a twig out to a second pad
  if(full||c%2===0){const f=bough[Math.round(bough.length*.6)-1],af=ae+s.range(.5,1)*(s.chance(.5)?1:-1),rf=reach*s.range(.35,.6);
   const e2=[f.x+Math.cos(af)*rf,f.y+T.H*s.range(.04,.14),f.z+Math.sin(af)*rf];
   st.limb+=BIO.tube('swcord',curve([f.x,f.y,f.z],[(f.x+e2[0])/2,e2[1],(f.z+e2[2])/2],e2,full?3:2,f.r*.8,T.rb*.11),cc,{seg:4});pads.push(e2);}}
 // the cup-pads and their fruits
 for(const p of pads){const r=T.crownR*s.range(.3,.42)*(full?1:1.2),tilt=s.range(0,.22),ya=s.range(0,TAU);
  BIO.put('cuppad',[p[0],p[1]-.15,p[2]],QE(tilt,ya,0),[r,r*s.range(.8,1.1),r],col(PAL.pad,s.next()));st.pads++;
  if(full){const nf=s.int(4,8);for(let k=0;k<nf;k++){const a=s.range(0,TAU),d=r*s.range(.1,.55),fs=s.range(.32,.5);
   BIO.put('parasol',[p[0]+Math.cos(a)*d,p[1]+r*.12,p[2]+Math.sin(a)*d],QE(s.range(-.2,.2),s.range(0,TAU),0),fs,col(PAL.parasol,s.next()),{label:'Parasol fruit'});st.fruit++;}}}
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:T.rb*1.6+1,h:T.H});};
// THE BEAD CONE: a spongy ribbed stalk, a tall cone of a cap, strings of gold eggs hung round its rim
B.cone=function(T,st,lv,s){const S=SP[T.sp],full=lv===2,lean=s.range(0,.08),ya=s.range(0,TAU),hs=T.H*.7,sr=T.rb/.5;
 BIO.put('conestalk',[T.x,T.y0-.3,T.z],QE(lean,ya,0),[sr,hs+.3,sr],col(PAL.coneStalk,s.next()));
 const tx=T.x+Math.sin(lean)*Math.cos(ya)*hs,tz=T.z-Math.sin(lean)*Math.sin(ya)*hs,ty=T.y0+hs*Math.cos(lean)-.2,cr=T.crownR;
 BIO.put('conecap',[tx,ty,tz],QE(0,s.range(0,TAU),0),[cr,(T.H-hs)/1.5,cr],col(PAL.coneCap,s.next()));st.caps++;
 const ne=full?s.int(5,9):3;for(let k=0;k<ne;k++){const a=k/ne*TAU+s.range(-.2,.2),d=cr*s.range(.72,.92),l=s.range(1.4,3.2);
  BIO.put('eggs',[tx+Math.cos(a)*d,ty+.1,tz+Math.sin(a)*d],QE(0,s.range(0,TAU),0),[1.1,l,1.1],col(PAL.egg,s.next()),{label:'Gold eggs'});st.eggs++;}
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:cr,h:T.H});};
// THE PILLAR CAP: three to six pale pillars leaning in from a wide stance to meet under a broad magenta-violet cap; green bulb
// fruits hang from its gills
B.pillars=function(T,st,lv,s){const S=SP[T.sp],full=lv===2,n=s.int(3,6),cr=T.crownR,yt=T.y0+T.H*.84,a0=s.range(0,TAU);
 const cc=col(PAL.pillar,s.next());
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+s.range(-.25,.25),rf=cr*s.range(.38,.55),fx=T.x+Math.cos(a)*rf,fz=T.z+Math.sin(a)*rf,fy=Y(fx,fz)-.5;
  const tx=T.x+Math.cos(a)*cr*.12,tz=T.z+Math.sin(a)*cr*.12,mid=[(fx+tx)/2+Math.cos(a)*rf*.18,(fy+yt)/2,(fz+tz)/2+Math.sin(a)*rf*.18];
  st.trunk+=BIO.tube('swpillar',curve([fx,fy,fz],mid,[tx,yt+.5,tz],full?8:4,T.rb*s.range(.9,1.1),T.rb*.7),cc,{seg:full?8:5});}
 BIO.put('pcap',[T.x,yt,T.z],QE(s.range(-.04,.04),s.range(0,TAU),s.range(-.04,.04)),[cr,cr*s.range(.9,1.1),cr],col(PAL.capTop,s.next()));st.caps++;
 const nb=full?s.int(10,18):0;for(let k=0;k<nb;k++){const a=s.range(0,TAU),d=cr*s.range(.3,.85),bs=s.range(.3,.55);
  BIO.put('pbulb',[T.x+Math.cos(a)*d,yt+.05,T.z+Math.sin(a)*d],QE(s.range(-.15,.15),s.range(0,TAU),0),bs,col(PAL.bulbFruit,s.next()),{label:'Bulb fruit'});st.fruit++;}
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:cr,h:T.H});};
// A FALLEN CORD (a dead lattice oak's): a log lying on the ground along its heading, smothered in log crust (teal-and-gold plates
// on top, orange shelves down its sides)
B.log=function(Lg,st,s){const n=8,P=[];for(let i=0;i<=n;i++){const t=i/n,x=Lg.x+Lg.dx*Lg.L*t,z=Lg.z+Lg.dz*Lg.L*t;P.push({x,y:Y(x,z)+Lg.r*.7,z,r:Lg.r*(1-.25*t)});}
 st.logs+=BIO.tube('swlog',P,col(PAL.log,s.next()),{seg:7,cap:true});
 const nc=s.int(6,12);for(let k=0;k<nc;k++){const t=s.range(.05,.95),p=P[Math.floor(t*n)],side=s.chance(.5)?1:-1,nx=-Lg.dz*side,nz=Lg.dx*side,r=p.r*1.02;
  if(s.chance(.55)){BIO.put('crust',[p.x+nx*r,p.y+s.range(-.3,.4)*p.r,p.z+nz*r],new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0,0,1),new T3.Vector3(nx,0,nz)),s.range(.25,.5),col(PAL.crust.slice(2),s.next()),{label:'Log crust'});}
  else BIO.put('plate',[p.x,p.y+p.r*.92,p.z],QE(0,s.range(0,TAU),0),s.range(.25,.55),col(PAL.crust.slice(0,2),s.next()),{label:'Log crust'});st.crust++;}
 reg({name:'Fallen cords (log crust)',key:'flora.logcrust',kind:'flora',x:Lg.x+Lg.dx*Lg.L/2,z:Lg.z+Lg.dz*Lg.L/2,y:Y(Lg.x,Lg.z),r:Lg.L/2+1,h:Lg.r*2+1.5});};
SWHI.BUILD=B;

// ---------------------------------------------------------------- placement by cell (core/rand)
// one candidate per cell, jittered, accepted against accept(x,z) times the host's mask; seeded by (world, i, j, salt) only
function cells(cell,salt,box,accept,fn){const W=BIO.host.seed>>>0,u=(i,j,k)=>KRAND.unit(KRAND.hash(W,i,j,salt,k));let n=0;
 for(let j=Math.floor(box[1]/cell);j<=Math.floor(box[3]/cell);j++)for(let i=Math.floor(box[0]/cell);i<=Math.floor(box[2]/cell);i++){
  const x=(i+u(i,j,1))*cell,z=(j+u(i,j,2))*cell;if(x<box[0]||x>box[2]||z<box[1]||z>box[3])continue;
  const a=accept(x,z);if(a<=0)continue;const m=BIO.mask(x,z);if(m<=0||u(i,j,3)>a*m)continue;
  if(!BIO.clearOf(x,z,0))continue;if(fn(x,Y(x,z),z,KRAND.hash(W,i,j,salt,4)))n++;}
 return n;}
SWHI.cells=cells;

// ---------------------------------------------------------------- the pass
SWHI.buildTrees=function(box,q){q=q==null?1:q;const st={trunk:0,limb:0,pads:0,fruit:0,caps:0,eggs:0,logs:0,crust:0,heroes:0,light:0,far:0,byS:SP.map(()=>0)};
 const TREES=SWHI.TREES;TREES.length=0;SWHI.LOGS.length=0;HOLD=KSPACE.create({cell:20});
 const lvOf=(x,z)=>{const d=BIO.lodD(x,z);return d<SWHI.LOD.near?2:d<SWHI.LOD.tree?1:0;};
 const mk=(x,y,z,sp,seed)=>{const S=SP[sp],s=KRAND.stream(seed);return{x,z,y0:y-.3,sp,seed,H:s.range(S.H[0],S.H[1]),rb:s.range(S.rb[0],S.rb[1]),crownR:s.range(S.crownR[0],S.crownR[1]),lv:lvOf(x,z)};};
 // THE PILLAR CAPS first: the bald's own, at its middle, and a few lone caps on the other crests, each holding its clearing
 {const T=mk(BALD_AT[0],Y(BALD_AT[0],BALD_AT[1]),BALD_AT[1],KEY.pillarcap,KRAND.hash(BIO.host.seed,7,7,7));T.H=24;T.crownR=12.5;T.bald=true;TREES.push(T);hold(T.x,T.z,T.crownR*1.6);}
 cells(420,301,box,(x,z)=>{const Z=SWHI.zones(x,z);return Z.crest>.85&&Z.bald<.1&&Z.farm<.1?.35:0;},(x,y,z,sd)=>{if(!clearOf(x,z,60))return false;
  const T=mk(x,y,z,KEY.pillarcap,sd);TREES.push(T);hold(x,z,T.crownR*1.4);return true;});
 // THE LATTICE OAKS: the coves' closed canopy first (its own cells), then the open flanks, thinner on the crests
 cells(21*Math.sqrt(1/q),306,box,(x,z)=>{const Z=SWHI.zones(x,z);return Z.forest*smooth(.25,.7,Z.cove)*.95*(1-.7*Z.flow);},(x,y,z,sd)=>{
  if(BIO.depth(x,z)>-.3||!clearOf(x,z,4))return false;const T=mk(x,y,z,KEY.latticeoak,sd);TREES.push(T);hold(x,z,T.rb*2.4+2);return true;});
 cells(30*Math.sqrt(1/q),302,box,(x,z)=>{const Z=SWHI.zones(x,z);return Z.forest*(.32+.3*Z.cove+.3*Z.valley)*(1-.5*Z.crest)*(1-.7*Z.flow);},(x,y,z,sd)=>{
  if(BIO.depth(x,z)>-.3||!clearOf(x,z,4))return false;const T=mk(x,y,z,KEY.latticeoak,sd);TREES.push(T);hold(x,z,T.rb*2.4+2);return true;});
 // THE BEAD CONES: under the oaks in the coves, a few on the lower flanks
 cells(20*Math.sqrt(1/q),303,box,(x,z)=>{const Z=SWHI.zones(x,z);return Z.forest*(.6*Z.cove+.08*Z.valley)*(1-Z.crest)*(1-.8*Z.flow);},(x,y,z,sd)=>{
  if(BIO.depth(x,z)>-.3||!clearOf(x,z,1.5))return false;const T=mk(x,y,z,KEY.beadcone,sd);TREES.push(T);hold(x,z,T.rb*1.6+1);return true;});
 // THE FALLEN CORDS in the coves (heroes only: close detail)
 cells(60,304,box,(x,z)=>{const Z=SWHI.zones(x,z);return BIO.lodD(x,z)<SWHI.LOD.near?Z.forest*Z.cove*.7:0;},(x,y,z,sd)=>{const s=KRAND.stream(sd),a=s.range(0,TAU),L=s.range(9,18);
  const Lg={x,z,dx:Math.cos(a),dz:Math.sin(a),L,r:s.range(.35,.6),seed:sd};const ex=x+Lg.dx*L,ez=z+Lg.dz*L;
  if(BIO.mask(ex,ez)<.5||!clearOf(x,z,1)||!clearOf(ex,ez,1)||Math.abs(Y(ex,ez)-y)>L*.35)return false;SWHI.LOGS.push(Lg);return true;});
 // OCTAHEDRAL IMPOSTORS (core/biome 34-core-impostor.js, R6): a far tree, and every hero past its range, is one quad showing its
 // species baked from 8 x 8 directions. Each species bakes one of its own heroes, built again in place with the host's
 // volumes muted; every tree draws from its own stream, so drawing a quad instead of a crown moves nothing
 const IMPS=[];
 if(typeof BIO.impostor==='function'){const set=BIO.impostorSet('swhighlands.trees',{label:'Far trees'});
  SP.forEach((S,sp)=>{const T0=TREES.find(T=>T.sp===sp&&T.lv===2)||TREES.find(T=>T.sp===sp);if(!T0)return;const T1=Object.assign({},T0);
   const rec=BIO.impostor('swhighlands.'+S.key,()=>{MUTE=true;try{B[S.habit](Object.assign({},T1),Object.assign({},st,{byS:st.byS.slice()}),2,KRAND.stream(T1.seed^0x5157));}finally{MUTE=false;}},{set,at:[T1.x,T1.y0,T1.z],label:S.name+' (far)'});
   if(rec)IMPS[sp]={rec,H:T1.H,R:T1.crownR};});
  if(set.recs.length)BIO.impostorItem('impTrees',set,{label:'Far trees'});}
 const farImp=T=>{const I=IMPS[T.sp];if(!I)return false;const k=T.sp===KEY.pillarcap?T.crownR/I.R:T.H/I.H;BIO.impostorPut('impTrees',I.rec,[T.x,T.y0,T.z],(T.seed%628)/100,k,null);st.far+=2;return true;};
 TREES.forEach(T=>{BIO.owner=[T.x,T.z];const S=SP[T.sp],s=KRAND.stream(T.seed^0x5157);
  if(T.lv===0){BIO.range=null;BIO.minRange=0;farImp(T);}
  else{BIO.range=SWHI.LOD.tree;BIO.minRange=0;B[S.habit](T,st,T.lv,s);if(T.lv===2)st.heroes++;else st.light++;
   BIO.range=1e9;BIO.minRange=SWHI.LOD.tree;farImp(T);}
  st.byS[T.sp]++;});
 BIO.range=SWHI.LOD.tree;BIO.minRange=0;SWHI.LOGS.forEach(Lg=>{BIO.owner=[Lg.x,Lg.z];B.log(Lg,st,KRAND.stream(Lg.seed^0x106));});
 BIO.owner=null;BIO.range=null;BIO.minRange=0;
 return{trees:TREES.length,heroes:st.heroes,light:st.light,far:TREES.length-st.heroes-st.light,logs:SWHI.LOGS.length,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),
  pads:st.pads,fruit:st.fruit,eggs:st.eggs,crust:st.crust,tris:{trunk:st.trunk,limbs:st.limb,logs:st.logs,far:st.far}};};
// the bald's pillar cap stands at the bald's middle (the host's BALD), handed in by SWHI.build
let BALD_AT=[0,0];SWHI.setBald=(x,z)=>{BALD_AT=[x,z];};
// approximate canopy top: the tallest crown over the point
SWHI._canopyH=function(x,z){let h=0;for(const T of SWHI.TREES){if(Math.abs(x-T.x)<20&&Math.abs(z-T.z)<20&&Math.hypot(x-T.x,z-T.z)<Math.max(3,T.crownR))h=Math.max(h,T.y0+T.H);}return h||(BIO.terrainH(x,z)+2);};
})();
