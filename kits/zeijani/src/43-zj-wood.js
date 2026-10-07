// prefix: zw
// ================================================================= WOODEN DWELLINGS (PLAN.md 6.4): the outpost's, the hamlets', the villages'
// The kipuka's timber, thatch and daub; raised floors in the wet. Each def's rooms are its interiors item
// (kits/interiors/sets/zeijani.js), drawn here round the same outlines; the walk floors and walls come from the item too.
function zwGap(r,w){return (w/2+.06)/r;}
/* the partitions a planned body's rooms are divided by (the interiors planner's walls), drawn in the def's frame */
function zwPartitions(key,mk,col){const it=zjItem(key);if(!it||!it.bodies)return;const inst=KratorInteriors.sets.instantiate(it,0,0,0,{register:false,prefix:'draw.'});
 for(const B of inst.buildings)for(const Wl of B.walls){if(Wl.kind!=='partition')continue;const dx=Wl.b[0]-Wl.a[0],dz=Wl.b[1]-Wl.a[1],L=Math.hypot(dx,dz);if(L<.1)continue;
  const ux=dx/L,uz=dz/L,ry=Math.atan2(dx,dz),t=Wl.thick||.12,h=(Wl.h||2.6)-.05,cuts=[[0,L]];
  for(const q of Wl.openings||[]){const a=q.u-q.w/2,b=q.u+q.w/2;for(let i=cuts.length-1;i>=0;i--){const c=cuts[i];if(b<=c[0]||a>=c[1])continue;cuts.splice(i,1,...[[c[0],a],[b,c[1]]].filter(s=>s[1]-s[0]>.05));}
   if(q.door)box(mk,Wl.a[0]+ux*q.u,Wl.y+2.1,Wl.a[1]+uz*q.u,t,Math.max(.05,h-2.1),q.w,col,ry);}
  for(const c of cuts){const m=(c[0]+c[1])/2;box(mk,Wl.a[0]+ux*m,Wl.y,Wl.a[1]+uz*m,t,h,c[1]-c[0],col,ry);}}}

/* 1 the round wattle hut on low stilts under a conical thatch (refs 69fa, 6944) */
defBuilding({key:'zj_hut_a',name:'Round wattle hut on stilts',seed:4201,cut:true,tags:{types:['dwelling-single'],wealth:'poor',style:'wooden'},w:8,d:8,h:5.6,
 build(o){const g=zwGap(2.6,.9),daub=P('earth'),wd=P('woodD');
  zfStilts('log',0,0,2.25,2.25,.62,8,wd,.11);cyl('plank',0,.45,0,2.85,.15,P('wood'),22);
  zfDrum('earth',0,.6,0,2.62,2.0,daub,{a0:ZF_FRONT+g,a1:ZF_FRONT+TAU-g});zfDrum('earth',0,.6,0,2.52,2.0,P('plaster'),{a0:ZF_FRONT+g,a1:ZF_FRONT+TAU-g,inward:true});
  for(let i=0;i<10;i++){const a=ZF_FRONT+g+.05+i*(TAU-2*g-.1)/9;cyl('log',Math.cos(a)*2.66,.6,Math.sin(a)*2.66,.07,2.05,wd,6);}
  for(const s of [-1,1])cyl('log',s*.48,.6,2.6,.08,2.05,wd,7);box('log',0,2.5,2.6,1.15,.14,.2,wd);
  zfCone('thatch',0,2.45,0,3.35,3.1,P('thatch'),{layers:2});lathe('thatch',0,0,[[3.25,2.44],[.08,5.35]],24,P('thatch'),{inward:true});
  quad('hide',0,1.45,2.66,.86,1.6,P('hide'));
  box('wood',0,0,3.05,1.0,.2,.42,wd);box('wood',0,.3,2.88,1.0,.15,.3,wd);
  smokeAt(0,5.4,0,{r:.18});door(0,.6,2.6,0,.9);
  FURNISH('zeijani_olla',1.7,0,3.25,0,{v:0,setting:'outdoor'});FURNISH('zeijani_alecap_basket',-1.6,0,3.2,.4,{setting:'outdoor'});}});

/* 2 the oval plank hut with a steep thatch and a porch */
defBuilding({key:'zj_hut_b',name:'Oval plank hut with a porch',seed:4202,cut:true,tags:{types:['dwelling-single'],wealth:'poor',style:'wooden'},w:9,d:10,h:6.2,
 build(o){const g=zwGap(3.25,.9),wd=P('woodD');
  zfOval('ashlar',0,-.4,2.65,3.35,0,.42,P('tuffDark'));zfOval('ashlar',0,-.4,2.65,3.35,.42,.42,P('tuffDark'),{k1:0,up:true});
  zfOval('plank',0,-.4,2.55,3.25,.42,2.65,P('wood'),{a0:ZF_FRONT+g,a1:ZF_FRONT+TAU-g,rows:2});zfOval('plank',0,-.4,2.45,3.15,.42,2.65,P('wood'),{a0:ZF_FRONT+g,a1:ZF_FRONT+TAU-g,noflip:true});
  zfOval('thatch',0,-.4,3.15,3.9,2.45,6.1,P('thatch'),{k1:.02,rows:7,ex:1.25});zfOval('thatch',0,-.4,3.05,3.8,2.43,6.0,P('thatch'),{k1:.02,rows:7,ex:1.25,noflip:true});
  /* the porch: a plank deck, two posts, a lean thatch */
  box('plank',0,0,3.55,3.3,.4,1.7,P('wood'));for(const s of [-1,1])cyl('log',s*1.5,.4,4.25,.09,1.9,wd,7);
  plane4('thatch',[-1.75,2.7,2.55],[1.75,2.7,2.55],[-1.75,2.15,4.55],.14,P('thatch'));box('log',0,2.18,4.25,3.3,.12,.14,wd);
  for(const s of [-1,1])box('log',s*.5,.42,2.82,.12,2.1,.14,wd);box('log',0,2.45,2.82,1.12,.14,.16,wd);
  zfLeaf(0,.42,2.78,.9,2.0,P('wood'),-.55);door(0,.42,2.8,0,.9);
  FURNISH('zeijani_drying_trays',2.95,0,1.6,-PI/2,{setting:'outdoor'});FURNISH('zeijani_olla',-1.15,.4,3.9,0,{v:1,setting:'outdoor'});}});

/* 3 the lean-to against a rock face, its back room carved into the rock (the void plan: its interiors item) */
defBuilding({key:'zj_hut_c',name:'Lean-to with a carved back room',seed:4203,cut:true,tags:{types:['dwelling-single'],wealth:'poor',style:'wooden',rock:'tuff'},w:10,d:12,h:5.8,
 build(o){const wd=P('woodD'),it=zjItem('zj_hut_c');cvFromItem(it,{finish:'hewn'});
  box('plank',0,0,.9,4.6,.1,3.2,P('wood'));
  for(const s of [-1,1]){cyl('log',s*2.25,0,2.55,.1,2.15,wd,7);poly('plank',[[s*2.22,.1,-.58],[s*2.22,.1,2.5],[s*2.22,2.15,2.5],[s*2.22,3.0,-.58]],P('wood'),true);}
  for(const s of [-1,1])box('plank',s*1.42,.1,2.48,1.6,2.0,.08,P('wood'));box('plank',0,2.0,2.48,1.24,.15,.08,P('wood'));
  for(let i=0;i<5;i++){const x=-2.2+i*1.1;beam('log',[x,3.05,-.62],[x,2.12,2.7],.11,wd,true,6);}
  plane4('thatch',[-2.55,3.12,-.62],[2.55,3.12,-.62],[-2.55,2.18,2.85],.16,P('thatch'));
  /* the doorway cut in the face: worn jambs and a stone sill */
  for(const s of [-1,1])box('tuffHewn',s*.6,.05,-.6,.26,2.12,.2,P('white'));box('tuffHewn',0,2.17,-.6,1.46,.3,.2,P('white'));
  zfLeaf(0,.1,2.5,.9,1.95,P('wood'),-.35);door(0,.1,2.5,0,.9);
  FURNISH('zeijani_stone_stool',1.6,0,3.3,.3,{v:1,setting:'outdoor'});FURNISH('zeijani_jar_cradle',-3.5,0,1.2,PI/2,{setting:'outdoor'});}});

/* 4 the round timber house of the middle sort: two rooms under a domed thatch, a ribbed round door (ref fef0) */
defBuilding({key:'zj_house_wood',name:'Round timber house with a ribbed door',seed:4204,cut:true,tags:{types:['dwelling-single'],wealth:'middle',style:'wooden'},w:11,d:11,h:7,
 build(o){const g=zwGap(4.4,1.1),wd=P('woodD');
  zfDrum('ashlar',0,0,0,4.62,.5,P('tuffDark'),{seg:32});cyl('ashlar',0,.38,0,4.62,.12,P('tuffDark'),32);
  zfDrum('log',0,.5,0,4.45,2.75,P('wood'),{a0:ZF_FRONT+g,a1:ZF_FRONT+TAU-g,seg:32});zfDrum('plank',0,.5,0,4.18,2.7,P('wood'),{a0:ZF_FRONT+g,a1:ZF_FRONT+TAU-g,seg:32,inward:true});
  sector('log',0,0,4.15,4.47,ZF_FRONT+g-.02,ZF_FRONT+g+.02,.5,3.25,wd);sector('log',0,0,4.15,4.47,ZF_FRONT-g-.02,ZF_FRONT-g+.02,.5,3.25,wd);
  zwPartitions('zj_house_wood','plank',P('wood'));
  zfDome('thatch',0,3.12,0,5.1,3.45,P('thatch'),{seg:34,rows:10});lathe('thatch',0,0,[[4.9,3.1],[3.2,5.1],[.05,6.5]],32,P('thatch'),{inward:true,uv:'arc'});
  cyl('carved',0,6.5,0,.18,.42,wd,10);sph('carved',0,6.95,0,.16,wd,1,10);
  /* the round door in a carved frame, and round windows each side */
  box('log',0,2.62,4.42,1.5,.4,.3,wd);zfRoundDoor(0,1.56,4.48,.6,P('wood'));ring('carved',0,1.56,4.47,.66,.07,wd,0,PI/2,0);
  for(const s of [-1,1]){const a=ZF_FRONT+s*.75;ring('carved',Math.cos(a)*4.47,2.0,Math.sin(a)*4.47,.32,.05,wd,PI/2-a,PI/2,0);}
  box('wood',0,0,4.95,1.6,.26,.7,wd);door(0,.5,4.45,0,1.1);smokeAt(0,6.8,0,{r:.15});
  FURNISH('zeijani_stone_bench',2.2,0,5.2,0,{setting:'outdoor'});FURNISH('zeijani_olla',-2.0,0,5.0,0,{v:1,setting:'outdoor'});}});
