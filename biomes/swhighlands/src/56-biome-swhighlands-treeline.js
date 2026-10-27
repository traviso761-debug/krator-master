// ================================================================= SW HIGHLANDS — the treeline (station 6): trees, floor, far canopy
// The upper ramp's dry-summer woods under the crest (PLAN.md section 7, station 6; 3.4-4.9 km, Dsb and Dsc). BOTTLE BRUSHES on the
// sunny spurs (at 40 S the sunny slopes face north), WHORL COLUMNS in the shaded hollows and up to the treeline, shrinking to
// krummholz in its last 150 m; GLASS LEAF among the last trees and on the open ground; the FELLFIELD's stones above, and the
// eastern highlands' glass-tower plants on the scree (read in place: EHIGH.make / grow, when its fragments are on the page).
// The host's fields: upland (0 at 3.4 km .. 1 at 4.9 km), north (+1 a north-facing, sunny slope), slope, rock, scree, snow.
// Every draw is KRAND's (SWHI.cells: world, cell, salt; each plant's form from KRAND.stream(its seed)).
(function(){const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const T3=BIO.host.THREE,SP=SWHI.SPECIES,KEY=SWHI.KEY,PAL=SWHI.PAL,PICK=SWHI.PICK;
const Y=(x,z)=>BIO.terrainH(x,z);
const QE=(rx,ry,rz)=>new T3.Quaternion().setFromEuler(new T3.Euler(rx||0,ry||0,rz||0,'YXZ'));
const ALT=u=>3400+1500*u;
SWHI.TREELINE={trees:[],glass:[],treeAlt:4300};
// ---------------------------------------------------------------- zones
SWHI.treeZones=function(x,z){const f=n=>BIO.field(n,x,z),u=f('upland'),alt=ALT(u),north=f('north'),slope=f('slope'),rock=f('rock'),scree=f('scree'),snow=f('snow');
 const sunny=smooth(-.05,.4,north),shade=smooth(.05,-.4,north),open=smooth(1.05,.6,slope)*(1-snow);
 const tl=SWHI.TREELINE.treeAlt;
 return{alt,sunny,shade,slope,rock,scree,snow,open,
  bottle:smooth(3420,3600,alt)*smooth(4150,3950,alt)*(.25+.75*sunny),
  whorl:smooth(3500,3700,alt)*smooth(tl+60,tl-40,alt)*(.3+.7*shade+.2*sunny),
  krumm:smooth(tl-200,tl-60,alt),                                  // the last 150 m: the whorls shrink to krummholz
  glassleaf:smooth(3950,4150,alt)*smooth(5000,4800,alt),
  fell:smooth(tl-60,tl+120,alt),
  tower:smooth(tl+60,tl+250,alt)*(.4+.6*scree)};};
// ---------------------------------------------------------------- the builders
const curve=(a,c,b,n,r0,r1)=>{const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push({x:u*u*a[0]+2*u*t*c[0]+t*t*b[0],y:u*u*a[1]+2*u*t*c[1]+t*t*b[1],z:u*u*a[2]+2*u*t*c[2]+t*t*b[2],r:lerp(r0,r1,t)});}return o;};
const reg=o=>{if(!SWHI._muteT&&BIO.host.register)BIO.host.register(o);};
const B=SWHI.BUILD;
// THE WHORL COLUMN: a straight trunk carrying stacked whorls of teal bristles, widest near the foot and narrowing to the tip
B.whorl=function(T,st,lv,s){const S=SP[T.sp],full=lv===2,ln=s.range(0,.05),la=s.range(0,TAU),top=[T.x+Math.sin(ln)*Math.cos(la)*T.H,T.y0+T.H,T.z+Math.sin(ln)*Math.sin(la)*T.H];
 st.trunk+=BIO.tube('swwhorl',curve([T.x,T.y0-.4,T.z],[(T.x+top[0])/2,(T.y0+top[1])/2,(T.z+top[2])/2],top,full?6:3,T.rb,T.rb*.15),PICK(PAL.whorlBark,s.next()),{seg:full?7:5});
 const n=Math.max(3,Math.round((full?1:.6)*T.H/1.05)),c=PICK(PAL.whorl,s.next());
 for(let k=0;k<n;k++){const t=(k+.5)/n,y=T.y0+T.H*(.16+.82*t),r=Math.max(.5,T.crownR*Math.pow(1-t,.85)*s.range(.8,1.1)+.35);
  const px=T.x+(top[0]-T.x)*(y-T.y0)/T.H,pz=T.z+(top[2]-T.z)*(y-T.y0)/T.H;
  BIO.put('whorl',[px,y,pz],QE(0,s.range(0,TAU),0),[r,r,r],c,{label:'Whorl bristles'});st.whorls++;}
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:T.rb*1.5+.6,h:T.H});};
// THE BOTTLE BRUSH: a swollen water-storing trunk (widest a third of the way up), short limbs from its neck, a crown of bristle balls
B.bottle=function(T,st,lv,s){const S=SP[T.sp],full=lv===2,Ht=T.H*s.range(.5,.62),P=[];
 for(let i=0;i<=8;i++){const t=i/8;P.push({x:T.x,y:T.y0-.4+t*(Ht+.4),z:T.z,r:T.rb*(.45+.75*Math.sin(Math.PI*Math.min(1,t*1.15))*(1-.35*t))+T.rb*.12});}
 st.trunk+=BIO.tube('swbottle',P,PICK(PAL.bottleBark,s.next()),{seg:full?10:6});
 const neck=P[P.length-1],nl=full?s.int(6,9):4,c=PICK(PAL.brush,s.next());
 for(let k=0;k<nl;k++){const a=k/nl*TAU+s.range(-.3,.3),r=T.crownR*s.range(.45,.85),hy=T.y0+T.H*s.range(.78,.95),e=[T.x+Math.cos(a)*r,hy,T.z+Math.sin(a)*r];
  st.limb+=BIO.tube('swbottle',curve([neck.x,neck.y,neck.z],[(neck.x+e[0])/2,hy,(neck.z+e[2])/2],e,full?3:2,neck.r*.35,T.rb*.08),PICK(PAL.bottleBark,s.next()),{seg:4});
  const bs=T.crownR*s.range(.38,.55);BIO.put('brush',e,QE(0,s.range(0,TAU),0),[bs,bs*.85,bs],c,{label:'Bristle crown',n:[Math.cos(a)*.4,.9,Math.sin(a)*.4]});st.brushes++;}
 {const bs=T.crownR*.6;BIO.put('brush',[T.x,T.y0+T.H*.96,T.z],QE(0,s.range(0,TAU),0),[bs,bs*.8,bs],c,{label:'Bristle crown',n:[0,1,0]});st.brushes++;}
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:T.rb*1.8+.6,h:T.H});};

// ---------------------------------------------------------------- the pass
SWHI.buildTreeline=function(box,q){q=q==null?1:q;const st={trunk:0,limb:0,whorls:0,brushes:0,heroes:0,light:0,far:0,glassTowers:0,glassleaf:0,stones:0,moss:0,turf:0,tubes:0,sprouts:0,buttons:0,byS:SP.map(()=>0)};
 const TREES=SWHI.TREES;TREES.length=0;const HOLD=KSPACE.create({cell:12});
 const clearOf=(x,z,r)=>!HOLD.some(x,z,r,o=>Math.hypot(o.x-x,o.z-z)<o.r+r),hold=(x,z,r)=>HOLD.insert({x,z,r},x,z,r);
 const lvOf=(x,z)=>{const d=BIO.lodD(x,z);return d<SWHI.LOD.near?2:d<SWHI.LOD.tree?1:0;};
 /* AGE (the owner, 2026-10-27: the woods read samey): each tree's own draw sets its stage, saplings 15%, young 30%, mature 40%, old 15%,
    scaling its height, girth and crown; k the treeline's krummholz shrink on top */
 const AGE=[[.15,.22,.4],[.45,.45,.75],[.85,.8,1.05],[1,1.05,1.3]];
 const mk=(x,y,z,sp,seed,k)=>{const S=SP[sp],s=KRAND.stream(seed),u=s.next(),A=AGE[u<.15?0:u<.45?1:u<.85?2:3],a=A[1]+(A[2]-A[1])*s.next();k=(k==null?1:k)*a;
  return{x,z,y0:y-.3,sp,seed,age:u<.15?'sapling':u<.45?'young':u<.85?'mature':'old',H:s.range(S.H[0],S.H[1])*k,rb:s.range(S.rb[0],S.rb[1])*Math.sqrt(k),crownR:s.range(S.crownR[0],S.crownR[1])*Math.pow(k,.8),lv:lvOf(x,z)};};
 /* STANDS: the woods thick in some places, open in others (a KRAND field, 400 m across) */
 const stand=(x,z)=>.25+.95*smooth(.36,.62,KRAND.fbm(x*.0025+3,.4,z*.0025-7,3,611));
 const k=Math.sqrt(1/q);
 // the bottle brushes first (they hold their sunny spurs), then the whorl columns, shrinking over the treeline's last 150 m
 SWHI.cells(27*k,601,box,(x,z)=>{const Z=SWHI.treeZones(x,z);return Z.bottle*Z.open*.75*stand(x,z);},(x,y,z,sd)=>{if(!clearOf(x,z,3.5))return false;
  const T=mk(x,y,z,KEY.bottlebrush,sd);TREES.push(T);hold(x,z,T.crownR*.8);return true;});
 SWHI.cells(23*k,602,box,(x,z)=>{const Z=SWHI.treeZones(x,z);return Z.whorl*Z.open*.85*stand(x+500,z-300);},(x,y,z,sd)=>{if(!clearOf(x,z,2.2))return false;
  const Z=SWHI.treeZones(x,z),T=mk(x,y,z,KEY.whorlcolumn,sd,1-.72*Z.krumm);TREES.push(T);hold(x,z,Math.max(1.2,T.crownR*.55));return true;});
 // the far canopy: octahedral impostors (core/biome 34), one hero of each species baked again in place, its volume muted
 const IMPS=[];
 if(typeof BIO.impostor==='function'){const set=BIO.impostorSet('swhighlands.treeline',{label:'Far trees'});
  [KEY.whorlcolumn,KEY.bottlebrush].forEach(sp=>{const S=SP[sp],T0=TREES.find(T=>T.sp===sp&&T.lv===2&&T.H>S.H[0]*.9)||TREES.find(T=>T.sp===sp);if(!T0)return;const T1=Object.assign({},T0);
   const rec=BIO.impostor('swhighlands.'+S.key,()=>{SWHI._muteT=true;try{B[S.habit](Object.assign({},T1),Object.assign({},st),2,KRAND.stream(T1.seed^0x5157));}finally{SWHI._muteT=false;}},{set,at:[T1.x,T1.y0,T1.z],label:S.name+' (far)'});
   if(rec)IMPS[sp]={rec,H:T1.H};});
  if(set.recs.length)BIO.impostorItem('impTreeline',set,{label:'Far trees'});}
 const farImp=T=>{const I=IMPS[T.sp];if(!I)return;BIO.impostorPut('impTreeline',I.rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/I.H,null);st.far+=2;};
 TREES.forEach(T=>{BIO.owner=[T.x,T.z];const S=SP[T.sp],s=KRAND.stream(T.seed^0x5157);
  if(T.lv===0){BIO.range=null;BIO.minRange=0;farImp(T);}
  else{BIO.range=SWHI.LOD.tree;BIO.minRange=0;B[S.habit](T,st,T.lv,s);if(T.lv===2)st.heroes++;else st.light++;BIO.range=1e9;BIO.minRange=SWHI.LOD.tree;farImp(T);}
  st.byS[T.sp]++;});
 BIO.owner=null;BIO.range=null;BIO.minRange=0;
 // THE GLASS TOWER PLANTS (biomes/ehighlands, read in place): small (1.6-3.8 m), drawn near only; each from its own KRAND cell and seed
 const G=SWHI.TREELINE.glass;G.length=0;
 if(typeof EHIGH!=='undefined'&&EHIGH.grow){const gi=EHIGH.SPECIES.findIndex(S=>S.key==='glasstower');
  if(gi>=0){const GS=EHIGH.SPECIES[gi];BIO.range=500;BIO.minRange=0;
   SWHI.cells(12*k,603,box,(x,z)=>{if(BIO.lodD(x,z)>650)return 0;const Z=SWHI.treeZones(x,z);return Z.tower*Z.open*.35;},(x,y,z,sd)=>{if(!clearOf(x,z,1.2))return false;
    const s=KRAND.stream(sd),T={x,z,y0:y-.3,sp:gi,H:s.range(GS.H[0],GS.H[1]),rb:s.range(GS.rb[0],GS.rb[1]),crownR:s.range(GS.crownR[0],GS.crownR[1]),seed:sd%999999};
    BIO.fn.reseed(sd);BIO.owner=[x,z];EHIGH.grow(T,2);G.push(T);hold(x,z,1);st.glassTowers++;return true;});
   BIO.owner=null;BIO.range=null;}}
 // THE FLOOR: glass leaf, moss under the whorls, the dry turf on the sunny ground, the fellfield's stones (to 420 m; the stones to 700)
 const pass=(item,cell,salt,R,accept,put)=>{BIO.range=R;BIO.minRange=0;SWHI.cells(cell*k,salt,box,(x,z)=>BIO.lodD(x,z)<R?accept(SWHI.treeZones(x,z)):0,(x,y,z,sd)=>{if(!clearOf(x,z,.3))return false;put(x,y,z,KRAND.stream(sd));st[item]++;return true;});};
 const L=SWHI.LOD.floor;
 pass('glassleaf',3.2,604,L,Z=>Z.glassleaf*Z.open*(.35+.4*Z.fell),(x,y,z,s)=>{const w=s.range(.5,1.1);BIO.put('glassleaf',[x,y-.05,z],QE(0,s.range(0,TAU),0),[w,w*s.range(.8,1.3),w],PICK(PAL.glass,s.next()),{label:'Glass leaf'});});
 pass('moss',3.6,605,L,Z=>Z.whorl*Z.shade*.8*Z.open,(x,y,z,s)=>{const w=s.range(.6,1.2);BIO.put('moss',[x,y-.04,z],QE(0,s.range(0,TAU),0),[w,w*.4,w],PICK(PAL.moss,s.next()),{label:'Native moss'});});
 pass('turf',3.2,606,L,Z=>(Z.sunny*.55+.15)*(1-Z.fell*.7)*Z.open,(x,y,z,s)=>{const w=s.range(.5,.95);BIO.put('turf',[x,y-.04,z],QE(0,s.range(0,TAU),0),[w,w*s.range(.4,.7),w],PICK(PAL.turfDry,s.next()),{label:'Ridge turf'});});
/* THE UNDERSTOREY (the owner, 2026-10-27: more of it, shrub-like fungoids): tube shrubs in clumps under and between the trees, cup-pad
    sprouts in the shaded woods, bead-cone buttons in their wettest shade */
 pass('tubes',5,608,L,Z=>(Z.whorl*.55+Z.bottle*.5)*Z.open,(x,y,z,s)=>{const n=s.int(1,4);for(let j=0;j<n;j++){const a=s.range(0,TAU),d=s.range(0,1.8),w=s.range(.28,.75);const px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
  BIO.put('tubeshrub',[px,Y(px,pz)-.05,pz],QE(s.range(-.12,.12),s.range(0,TAU),s.range(-.12,.12)),[w*1.3,w*s.range(.7,1.3),w*1.3],PICK(PAL.tube,s.next()),{label:'Tube shrub'});}});
 pass('sprouts',4.5,609,L,Z=>Z.whorl*Z.shade*.6*Z.open,(x,y,z,s)=>{const n=s.int(2,5);for(let j=0;j<n;j++){const a=s.range(0,TAU),d=s.range(0,1.4),h=s.range(.2,.5),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
  BIO.put('sprout',[px,Y(px,pz)-.05,pz],QE(s.range(-.18,.18),s.range(0,TAU),s.range(-.18,.18)),[h,h,h],PICK(PAL.sproutTl,s.next()),{label:'Pad sprouts (young lattice oaks)'});}});
 pass('buttons',9,610,L,Z=>Z.whorl*Z.shade*.3*Z.open,(x,y,z,s)=>{const n=s.int(1,3);for(let j=0;j<n;j++){const a=s.range(0,TAU),d=s.range(0,1),h=s.range(.3,.7),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
  BIO.put('button',[px,Y(px,pz)-.05,pz],QE(0,s.range(0,TAU),0),[h,h,h],PICK(PAL.coneCap,s.next()),{label:'Bead cone buttons'});}});
 pass('stones',4,607,700,Z=>Z.fell*.5+Z.scree*.3,(x,y,z,s)=>{const w=s.range(.15,.65);BIO.put('stone',[x,y-w*.25,z],QE(s.range(-.3,.3),s.range(0,TAU),s.range(-.3,.3)),[w,w,w],PICK(PAL.stone,s.next()),{label:'Fellfield stones'});});
 BIO.range=null;BIO.minRange=0;
 return{trees:TREES.length,heroes:st.heroes,light:st.light,far:TREES.length-st.heroes-st.light,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).filter(x=>!/:0$/.test(x)).join(' '),
  whorls:st.whorls,brushes:st.brushes,glassTowers:st.glassTowers,floor:{glassleaf:st.glassleaf,moss:st.moss,turf:st.turf,stones:st.stones,tubes:st.tubes,sprouts:st.sprouts,buttons:st.buttons},ages:SWHI.TREES.reduce((m,T)=>{m[T.age]=(m[T.age]||0)+1;return m;},{}),tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
})();
