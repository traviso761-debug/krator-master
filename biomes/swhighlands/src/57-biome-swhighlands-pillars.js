// ================================================================= SW HIGHLANDS — the pillar rim's flora (station 4): trees, floor, far canopy
// The tableland's south-west edge (PLAN.md section 7, station 4; refs/01): red and white sandstone pillars in mist, the green floor
// between them. ANEMONE TREES (refs/03, right) clasp the pillars' flat tops and the fallen blocks below with their roots and lift a
// crown of teal tentacles: the tufts on the pillars in the painting. The floor: CUSHION SPONGES (the painting's dark green mounds),
// TORCH SPIKES (refs/03), BEAD CORAL (refs/20 D) and the rim's green turf; moss and cushions on the tops.
// The host's fields (station 4's stage owes them; BIOME-API.md): top (1 on a pillar's flat top), floor (1 on the green floor between
// the pillars), slope, wet (by Pan Riba and its seeps), block (1 by a fallen block). Every draw is KRAND's (SWHI.cells: world, cell,
// salt; each plant's form from KRAND.stream(its seed)).
// SWHI.pillarsSheet(x, z) lays every species and stage out in a row on any page's ground: the flora's preview before the station's
// stage exists (station 1's page draws it with ?sheet=pillars).
(function(){const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const T3=BIO.host.THREE,SP=SWHI.SPECIES,KEY=SWHI.KEY,PAL=SWHI.PAL,PICK=SWHI.PICK;
const Y=(x,z)=>BIO.terrainH(x,z);
const QE=(rx,ry,rz)=>new T3.Quaternion().setFromEuler(new T3.Euler(rx||0,ry||0,rz||0,'YXZ'));
SWHI.PILLARS={trees:[]};
// ---------------------------------------------------------------- zones
SWHI.pillarZones=function(x,z){const f=n=>BIO.field(n,x,z),top=f('top'),floor=f('floor'),slope=f('slope'),wet=f('wet'),block=f('block');
 const open=smooth(1.05,.6,slope);
 return{top,floor,slope,wet,block,open,
  anemTop:top*open,                                   // the pillars' tops: the anemone trees' own ground
  anemFloor:floor*open*(.06+.6*block),                // below: on and by the fallen blocks
  cushion:(floor*.45+top*.7)*open,
  torch:floor*open*(1-.7*wet),                        // the dry, sunny floor
  coral:(floor*.35+top*.25)*open*(1-.5*wet),
  turf:floor*open,moss:(top*.8+floor*wet*.6)*open};};
// ---------------------------------------------------------------- the builder
const curve=(a,c,b,n,r0,r1)=>{const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push({x:u*u*a[0]+2*u*t*c[0]+t*t*b[0],y:u*u*a[1]+2*u*t*c[1]+t*t*b[1],z:u*u*a[2]+2*u*t*c[2]+t*t*b[2],r:lerp(r0,r1,t)});}return o;};
const reg=o=>{if(!SWHI._muteT&&BIO.host.register)BIO.host.register(o);};
const B=SWHI.BUILD;
// THE ANEMONE TREE: roots clasping the stone (a boulder at its foot when T.block is its radius), a leaning pored trunk that curves back
// upright, a crown of teal tentacles fanned up and toward the lean, banded light and dark
B.anemone=function(T,st,lv,s){const S=SP[T.sp],full=lv===2,br=T.block||0,la=s.range(0,TAU),ca=Math.cos(la),sa=Math.sin(la);
 if(br>0){BIO.put('stone',[T.x,T.y0+br*.25,T.z],QE(s.range(-.2,.2),s.range(0,TAU),s.range(-.2,.2)),[br*1.25,br*1.1,br*1.25],PICK(PAL.stone,s.next()),{label:'A fallen block (an anemone tree\'s)'});st.blocks++;}
 const kh=br>0?br*1.25:T.H*.08,knot=[T.x,T.y0+kh,T.z];
 // the roots: down over the stone (or the flat top) and out, gripping
 const nr=full?s.int(6,8):4;for(let k=0;k<nr;k++){const a=k/nr*TAU+s.range(-.3,.3),c=Math.cos(a),sn=Math.sin(a),R=br>0?br*1.35:T.rb*s.range(2.8,4);
  const e=[T.x+c*R,br>0?Y(T.x+c*R,T.z+sn*R)-.2:T.y0-.25,T.z+sn*R],m=[T.x+c*R*.75,knot[1]+(br>0?br*.15:T.rb*.6),T.z+sn*R*.75];
  st.root+=BIO.tube('swanemone',curve(knot,m,e,full?4:2,T.rb*.55,T.rb*.12),PICK(PAL.anemRoot,s.next()),{seg:full?6:4});}
 // the trunk: stocky and swollen at its foot, bowed out over its knot and back (refs/03: an S), narrowing to the crown's neck
 const lean=T.H*s.range(.1,.22),th=T.H*.6,top=[T.x+ca*lean,T.y0+kh+th,T.z+sa*lean];
 const P=[];for(let i=0;i<=(full?9:4);i++){const t=i/(full?9:4),bow=Math.sin(t*Math.PI)*T.H*.16*(1-t*.4)*(1-1.3*smooth(.3,.75,t)),ox=ca*(lean*t+bow),oz=sa*(lean*t+bow);
  P.push({x:knot[0]+ox,y:knot[1]+th*t,z:knot[2]+oz,r:T.rb*(1.55-.85*Math.pow(t,.7))});}
 top[0]=P[P.length-1].x;top[2]=P[P.length-1].z;
 st.trunk+=BIO.tube('swanemone',P,PICK(PAL.anemBark,s.next()),{seg:full?10:6});
 // the crown: a plume of long tentacles from the trunk's head, fanned up and toward the lean, each curling over at its tip
 const nt=full?s.int(22,30):10,c0=PICK(PAL.anemTent,s.next()),c1=PICK(PAL.anemTentB,s.next());
 for(let k=0;k<nt;k++){const a=la+s.range(-1.2,1.2)+(k%4?0:Math.PI*s.range(.5,1)),up=s.range(.45,1.2),L=T.crownR*s.range(.9,1.5),c=Math.cos(a),sn=Math.sin(a);
  const e=[top[0]+c*L*(1-up*.4),top[1]+L*up*.7,top[2]+sn*L*(1-up*.4)],m=[top[0]+c*L*.2,top[1]+L*(up*.7+.25),top[2]+sn*L*.2];
  st.tent+=BIO.tube('swanemone',curve(top,m,[e[0],e[1]-L*.2,e[2]],full?6:3,T.rb*s.range(.2,.3),T.rb*.03+.01),k%2?c0:c1,{seg:full?5:3});}
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:Math.max(T.rb*3,br*1.4)+.6,h:T.H+kh});};

// ---------------------------------------------------------------- the floor's put (shared by the pass and the sheet)
const FLOOR={
 cushion:(x,y,z,s)=>{const n=s.int(1,4);for(let j=0;j<n;j++){const a=s.range(0,TAU),d=s.range(0,1.6),w=s.range(.6,1.7),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
  BIO.put('cushion',[px,Y(px,pz)-.08,pz],QE(0,s.range(0,TAU),0),[w,w*s.range(.7,1.2),w],PICK([0xffffff,0xe8f0e0,0xf4ffe8],s.next()),{label:'Cushion sponge'});}return n;},
 torch:(x,y,z,s)=>{const n=s.int(1,3);for(let j=0;j<n;j++){const a=s.range(0,TAU),d=s.range(0,.9),h=s.range(.6,1.3),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
  BIO.put('torch',[px,Y(px,pz)-.04,pz],QE(s.range(-.08,.08),s.range(0,TAU),s.range(-.08,.08)),[h,h,h],PICK([0xffffff,0xfff0e8,0xf8f0f0],s.next()),{label:'Torch spike'});}return n;},
 coral:(x,y,z,s)=>{const h=s.range(.7,1.4);BIO.put('beadcoral',[x,y-.05,z],QE(0,s.range(0,TAU),0),[h,h*s.range(.85,1.15),h],PICK([0xffffff,0xfff0f8,0xf0e8f0],s.next()),{label:'Bead coral'});return 1;},
 turf:(x,y,z,s)=>{const w=s.range(.5,1);BIO.put('turf',[x,y-.04,z],QE(0,s.range(0,TAU),0),[w,w*s.range(.45,.8),w],PICK(PAL.rimTurf,s.next()),{label:'Rim turf'});return 1;},
 moss:(x,y,z,s)=>{const w=s.range(.6,1.2);BIO.put('moss',[x,y-.04,z],QE(0,s.range(0,TAU),0),[w,w*.4,w],PICK(PAL.rimMoss,s.next()),{label:'Native moss'});return 1;}};

// ---------------------------------------------------------------- the pass (station 4)
const AGE=[[.15,.22,.4],[.45,.45,.75],[.85,.8,1.05],[1,1.05,1.3]],AGES=['sapling','young','mature','old'];
const mk=(x,y,z,sp,seed,lvOf,age)=>{const S=SP[sp],s=KRAND.stream(seed),u=s.next(),ai=age==null?(u<.15?0:u<.45?1:u<.85?2:3):age,A=AGE[ai],k=A[1]+(A[2]-A[1])*s.next();
 return{x,z,y0:y-.2,sp,seed,age:AGES[ai],H:s.range(S.H[0],S.H[1])*k,rb:s.range(S.rb[0],S.rb[1])*Math.sqrt(k),crownR:s.range(S.crownR[0],S.crownR[1])*Math.pow(k,.8),lv:lvOf(x,z)};};
const newSt=()=>({trunk:0,root:0,tent:0,blocks:0,heroes:0,light:0,far:0,cushion:0,torch:0,coral:0,turf:0,moss:0});
SWHI.buildPillars=function(box,q){q=q==null?1:q;const st=newSt(),TREES=SWHI.TREES;TREES.length=0;const HOLD=KSPACE.create({cell:12});
 const clearOf=(x,z,r)=>!HOLD.some(x,z,r,o=>Math.hypot(o.x-x,o.z-z)<o.r+r),hold=(x,z,r)=>HOLD.insert({x,z,r},x,z,r);
 const lvOf=(x,z)=>{const d=BIO.lodD(x,z);return d<SWHI.LOD.near?2:d<SWHI.LOD.tree?1:0;};
 const k=Math.sqrt(1/q);
 // the anemone trees: the pillars' tops first (dense, small: wind and thin soil), then the fallen blocks below
 SWHI.cells(9*k,701,box,(x,z)=>SWHI.pillarZones(x,z).anemTop*.7,(x,y,z,sd)=>{if(!clearOf(x,z,2.5))return false;
  const T=mk(x,y,z,KEY.anemonetree,sd,lvOf);T.H*=.8;TREES.push(T);hold(x,z,T.crownR*.7);return true;});
 SWHI.cells(28*k,702,box,(x,z)=>SWHI.pillarZones(x,z).anemFloor,(x,y,z,sd)=>{if(!clearOf(x,z,4))return false;
  const T=mk(x,y,z,KEY.anemonetree,sd,lvOf);T.block=KRAND.stream(sd^0x77).range(.9,2.2);TREES.push(T);hold(x,z,Math.max(T.crownR*.7,T.block*1.4));return true;});
 // the far canopy: octahedral impostors (core/biome 34), the hero baked again in place, its volume muted
 let IMP=null;
 if(typeof BIO.impostor==='function'){const set=BIO.impostorSet('swhighlands.pillars',{label:'Far trees'}),S=SP[KEY.anemonetree];
  const T0=TREES.find(T=>T.lv===2&&T.age==='mature')||TREES[0];
  if(T0){const T1=Object.assign({},T0);const rec=BIO.impostor('swhighlands.'+S.key,()=>{SWHI._muteT=true;try{B.anemone(Object.assign({},T1),newSt(),2,KRAND.stream(T1.seed^0x5157));}finally{SWHI._muteT=false;}},{set,at:[T1.x,T1.y0,T1.z],label:S.name+' (far)'});
   if(rec)IMP={rec,H:T1.H};}
  if(set.recs.length)BIO.impostorItem('impPillars',set,{label:'Far trees'});}
 const farImp=T=>{if(!IMP)return;BIO.impostorPut('impPillars',IMP.rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/IMP.H,null);st.far+=2;};
 TREES.forEach(T=>{BIO.owner=[T.x,T.z];const s=KRAND.stream(T.seed^0x5157);
  if(T.lv===0){BIO.range=null;BIO.minRange=0;farImp(T);}
  else{BIO.range=SWHI.LOD.tree;BIO.minRange=0;B.anemone(T,st,T.lv,s);if(T.lv===2)st.heroes++;else st.light++;BIO.range=1e9;BIO.minRange=SWHI.LOD.tree;farImp(T);}});
 BIO.owner=null;BIO.range=null;BIO.minRange=0;
 // THE FLOOR (to SWHI.LOD.floor; the cushions, the floor's largest bodies, to 520 m)
 const pass=(item,cell,salt,R,accept)=>{BIO.range=R;BIO.minRange=0;SWHI.cells(cell*k,salt,box,(x,z)=>BIO.lodD(x,z)<R?accept(SWHI.pillarZones(x,z)):0,(x,y,z,sd)=>{if(!clearOf(x,z,.4))return false;st[item]+=FLOOR[item](x,y,z,KRAND.stream(sd));return true;});};
 const L=SWHI.LOD.floor;
 pass('cushion',8,703,520,Z=>Z.cushion*.3);   /* the painting's mounds: scattered, the turf between */
 pass('torch',4.5,704,L,Z=>Z.torch*.3);
 pass('coral',8,705,L,Z=>Z.coral*.4);
 pass('turf',3.6,706,L,Z=>Z.turf*.6);   /* the floor's largest count: thinned to keep the pass under its 20 M budget (PERF.md) */
 pass('moss',3.4,707,L,Z=>Z.moss*.7);
 BIO.range=null;BIO.minRange=0;
 return{trees:TREES.length,heroes:st.heroes,light:st.light,far:TREES.length-st.heroes-st.light,bySpecies:'anemonetree:'+TREES.length,blocks:st.blocks,
  floor:{cushion:st.cushion,torch:st.torch,coral:st.coral,turf:st.turf,moss:st.moss},ages:TREES.reduce((m,T)=>{m[T.age]=(m[T.age]||0)+1;return m;},{}),tris:{trunk:st.trunk,roots:st.root,tentacles:st.tent,far:st.far}};};

// ---------------------------------------------------------------- the preview sheet
// a row of anemone trees (each stage, then two on fallen blocks), and before it a bed of each floor plant; along heading a from (x, z).
// Drawn whole (no LOD); returns the specimens' positions for the views
SWHI.pillarsSheet=function(x0,z0,a){a=a==null?0:a;const ca=Math.cos(a),sa=Math.sin(a),st=newSt(),P=(u,v)=>[x0+ca*u-sa*v,z0+sa*u+ca*v],out={trees:[],beds:{}};
 BIO.range=null;BIO.minRange=0;
 [[0,null],[1,null],[2,null],[3,null],[2,1.6],[3,2.2]].forEach((q,i)=>{const p=P(i*11,0),T=mk(p[0],Y(p[0],p[1]),p[1],KEY.anemonetree,KRAND.hash(BIO.host.seed>>>0,i,0x5E7),()=>2,q[0]);
  if(q[1])T.block=q[1];BIO.owner=[T.x,T.z];B.anemone(T,st,2,KRAND.stream(T.seed^0x5157));out.trees.push(T);});
 BIO.owner=null;
 ['cushion','torch','coral','turf','moss'].forEach((item,i)=>{const c=P(i*12+2,-14),n=item==='turf'||item==='moss'?22:item==='coral'?6:9;out.beds[item]=c;
  for(let j=0;j<n;j++){const s=KRAND.stream(KRAND.hash(BIO.host.seed>>>0,i,j,0x5E8)),r=s.range(0,4.5),b=s.range(0,TAU),x=c[0]+Math.cos(b)*r,z=c[1]+Math.sin(b)*r;st[item]+=FLOOR[item](x,Y(x,z),z,s);}});
 out.st=st;return out;};

// ---------------------------------------------------------------- shared by the other stations' flora (58, 59, 59c)
// SWHI.FL.mk: a tree record (its stage from its own draw, or the one given); SWHI.FL.draw: the heroes, the light forms and the far
// impostors of every species in TREES (one hero of each baked in place); SWHI.FL.lay: a preview sheet's row of trees and its beds
SWHI.FL={mk,AGE,AGES,QE,curve,reg,
 lvOf:(x,z)=>{const d=BIO.lodD(x,z);return d<SWHI.LOD.near?2:d<SWHI.LOD.tree?1:0;},
 draw(TREES,st,setKey,itemKey,heroOf){const IMPS=[];
  if(typeof BIO.impostor==='function'){const set=BIO.impostorSet('swhighlands.'+setKey,{label:'Far trees'});
   [...new Set(TREES.map(T=>T.sp))].forEach(sp=>{const S=SP[sp],T0=(heroOf&&heroOf(sp))||TREES.find(T=>T.sp===sp&&T.lv===2&&T.age==='mature')||TREES.find(T=>T.sp===sp);if(!T0)return;const T1=Object.assign({},T0);
    const rec=BIO.impostor('swhighlands.'+S.key,()=>{SWHI._muteT=true;try{B[S.habit](Object.assign({},T1),Object.assign({},st),2,KRAND.stream(T1.seed^0x5157));}finally{SWHI._muteT=false;}},{set,at:[T1.x,T1.y0,T1.z],label:S.name+' (far)'});
    if(rec)IMPS[sp]={rec,H:T1.H};});
   if(set.recs.length)BIO.impostorItem(itemKey,set,{label:'Far trees'});}
  const farImp=T=>{const I=IMPS[T.sp];if(!I)return;BIO.impostorPut(itemKey,I.rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/I.H,null);st.far=(st.far||0)+2;};
  TREES.forEach(T=>{BIO.owner=[T.x,T.z];const s=KRAND.stream(T.seed^0x5157);
   if(T.lv===0){BIO.range=null;BIO.minRange=0;farImp(T);}
   else{BIO.range=SWHI.LOD.tree;BIO.minRange=0;B[SP[T.sp].habit](T,st,T.lv,s);if(T.lv===2)st.heroes=(st.heroes||0)+1;else st.light=(st.light||0)+1;BIO.range=1e9;BIO.minRange=SWHI.LOD.tree;farImp(T);}});
  BIO.owner=null;BIO.range=null;BIO.minRange=0;},
 /* trees: [[speciesKey, stage 0-3, (T) => extra fields], ...] spaced gap m along the heading; beds: [[label, put(x, y, z, stream) -> count, n, r], ...]
    bedGap m apart, 14 m before the row */
 lay(x0,z0,a,o){a=a==null?0:a;const ca=Math.cos(a),sa=Math.sin(a),P=(u,v)=>[x0+ca*u-sa*v,z0+sa*u+ca*v],out={trees:[],beds:{},st:{}},gap=o.gap||11,bg=o.bedGap||12;
  BIO.range=null;BIO.minRange=0;
  (o.trees||[]).forEach((q,i)=>{const p=P(i*gap,0),T=mk(p[0],Y(p[0],p[1]),p[1],KEY[q[0]],KRAND.hash(BIO.host.seed>>>0,i,0x5E9,o.salt||0),()=>2,q[1]);
   if(q[2])Object.assign(T,q[2](T,P,i*gap));BIO.owner=[T.x,T.z];B[SP[T.sp].habit](T,out.st,2,KRAND.stream(T.seed^0x5157));out.trees.push(T);});
  BIO.owner=null;
  (o.beds||[]).forEach((b,i)=>{const c=P(i*bg+2,-14);out.beds[b[0]]=c;
   for(let j=0;j<b[2];j++){const s=KRAND.stream(KRAND.hash(BIO.host.seed>>>0,i,j,0x5EA,o.salt||0)),r=s.range(0,b[3]||4.5),t=s.range(0,TAU),x=c[0]+Math.cos(t)*r,z=c[1]+Math.sin(t)*r;out.st[b[0]]=(out.st[b[0]]||0)+(b[1](x,Y(x,z),z,s)||0);}});
  return out;}};
SWHI.SHEETS={pillars:SWHI.pillarsSheet};
SWHI.FLOOR_PILLARS=FLOOR;   /* the torch spikes, bead coral and cushions grow on Span's tableland too (59) */
})();
