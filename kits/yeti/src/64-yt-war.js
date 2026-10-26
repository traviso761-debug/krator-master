// prefix: yt
// ================================================================= WAR (PLAN.md sections 1 and 6, Y4)
// The war has a calendar: the Khaayken come down when their walls can stand. Below the pycrete line the winter forts are
// raised of seasonal pycrete for the raiding season and left to slump in spring (biomes/nwouterwall/PLAN.md section 5).
//   yt_winter_fort   a square curtain of pycrete blocks with a fighting walk and crenels, four drum towers, a gate between
//                    two of them, a lined command dome inside; v 0: autumn (fresh, the blocks glossy), v 1: spring (slumped:
//                    the weathered set, the crenels gone soft, the walls sagged, meltwater at the foot)
//   yt_watch_tower   a pycrete drum tower on a slab foot, a ladder to its platform, a brazier for the signal
//   yt_signal_cairn  the chain of fires along the ridges: a dry-stone cairn, its fire basket, an inuksuk pointing the way
/* a wall run from (ax,az) to (bx,bz): height h, thickness t, crenels on top; slump 0..1 sags it */
function ytFortWall(ax,az,bx,bz,h,t,mk,slump){const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);
 W(ax,0,az,Math.atan2(dx,dz),()=>{const hh=h*(1-.18*slump);
  psurf(mk,(u,v)=>{const z=u*L,sag=slump*.45*Math.sin(u*PI)*(.4+.6*v);return [-t/2-slump*.25*(1-v),hh*v-sag,z];},Math.max(2,Math.round(L/1.5)),3,P('ice'),{flip:false});
  psurf(mk,(u,v)=>{const z=u*L,sag=slump*.45*Math.sin(u*PI)*(.4+.6*v);return [t/2+slump*.25*(1-v),hh*v-sag,z];},Math.max(2,Math.round(L/1.5)),3,P('ice'),{flip:true});
  box(mk,0,hh-.12-slump*.3,L/2,t,.12,L,P('ice'));
  const nc=Math.floor(L/1.4);for(let i=0;i<nc;i++){const z=(i+.5)*L/nc,sg=slump*.45*Math.sin(z/L*PI);box(mk,t/2-.2,hh-.12-sg,z,.4,.65*(1-slump*.7),.7,P('ice'));}
  wkPad(0,L/2,t-.2,L,hh-.12-slump*.3);});}
function ytFortTower(x,z,r,h,mk,slump){const hh=h*(1-.15*slump);W(x,0,z,0,()=>{
 ytShell(mk,[[r+slump*.3,0],[r,hh*.5],[r-.05,hh]],P('ice'),{seg:20});
 const n=8;for(let i=0;i<n;i++){const a=i/n*TAU;box(mk,Math.cos(a)*(r-.15),hh,Math.sin(a)*(r-.15),.5,.7*(1-slump*.7),.32,P('ice'),-a);}
 cyl('larch',0,hh-.2,0,r-.05,.18,P('larchOld'),16);});}
/* the fort's command dome: lined, a lamp, the captain's chest (its own def so the cut-away opens it and not the fort) */
defBuilding({key:'yt_fort_dome',name:"Winter fort's command dome",seed:9807,w:8,d:8,h:4.2,cut:true,budget:40000,
 tags:{types:['civic'],wealth:'middle',style:'state',role:'command'},front:{x:0,z:3.4,yaw:0},
 note:"the fort's lined command dome, raised with the fort for the season",
 build(o){const sl=(o.v|0)%2?1:0,mk=sl?'pycreteOld':'course';CURREC.season=sl?'spring':'autumn';CURREC.layers=ytLayers('pycrete','autumn',{t:.4});
  CURREC.frost=ytFrost(CURREC.layers);CURREC.heat={stove:null,lamps:1,fuel:'fat',crownVent:.28,inlet:'the door',heated:true};
  const dr=[{arch:{hw:.9,hv:.8,ys:0},grow:-.03}];
  ytDome(mk,3.4,3.6,P('ice'),{doors:dr,rTop:.14,spiral:.5,seg:36,slump:sl*.6});ytDome('pycrete',3.0,3.2,P('ice'),{doors:dr,rTop:.14,inward:true,seg:36,slump:sl*.6});
  ytDome('hideCap',2.8,3.0,P('ice'),{doors:dr,rTop:.12,inward:true,seg:36,slump:sl*.6});ytCrownVent(.12,2.95-sl*.5,3.65-sl*.6);
  cyl('flag',0,0,0,2.8,.06,P('flag'),24);ytLamp(0,.06,-1.6,0);
  FURNISH('generic_chest',-1.4,.06,-1.2,.5);FURNISH('generic_rations',1.3,.06,-1.1,-.5);FURNISH('generic_writing_supplies',0,.06,-1.9,0);FURNISH('generic_water',1.6,.06,.6,0);
  door(0,0,3.4,0,1.6);}});
defBuilding({key:'yt_winter_fort',name:'Winter fort (seasonal pycrete)',seed:9801,w:30,d:30,h:7.5,budget:200000,
 tags:{types:['civic'],wealth:'middle',style:'state',role:'fort'},
 note:"raised of seasonal pycrete for the raiding season below the line: a square curtain with a fighting walk and crenels, four drum towers, a gate, a lined command dome; v 1 is the spring, the fort slumping",
 build(o){const sl=(o.v|0)%2?1:0,mk=sl?'pycreteOld':'course',S=24,h=4.4,t=1.4;
  CURREC.season=sl?'spring':'autumn';CURREC.layers=[{k:'pycrete',m:t}];CURREC.heat={stove:null,heated:false,crownVent:0};CURREC.slump=sl;
  const c=S/2;for(const [ax,az,bx,bz] of [[-c,-c,c,-c],[c,-c,c,c],[-c,c,-c,-c]])ytFortWall(ax,az,bx,bz,h,t,mk,sl);
  ytFortWall(c,c,2.2,c,h,t,mk,sl);ytFortWall(-2.2,c,-c,c,h,t,mk,sl);
  for(const [x,z] of [[-c,-c],[c,-c],[c,c],[-c,c]])ytFortTower(x,z,2.2,6.2,mk,sl);
  for(const s of [-1,1])ytFortTower(s*2.6,c,1.5,5.4,mk,sl);box('larch',0,0,c,3.4,3.0,.25,P('larchOld'));box('larch',0,3.0,c,4.2,.3,1.6,P('larch'));
  place('yt_fort_dome',0,-4,0,{y:0,v:sl});
  for(const [x,z] of [[-7,6],[7,6],[-8,-8],[8,-6]])FURNISH('generic_crate',x,0,z,0);
  /* the spring's meltwater: a fan of standing water along the foot of each wall, outside and in */
  if(sl)for(const [x,z,w,d] of [[0,-c,S+4,3.2],[c,0,3.2,S+4],[-c,0,3.2,S+4],[0,c,S+4,3.2]])box('ice',x,.012,z,w,.012,d,P('ice'));
  door(0,0,c+.2,0,3.2);}});
defBuilding({key:'yt_watch_tower',name:'Watch tower',seed:9803,w:6,d:6,h:9.6,budget:50000,
 tags:{types:['civic'],wealth:'middle',style:'common',role:'tower'},
 note:'a pycrete drum tower on a slab foot: a larch ladder inside to its platform, crenels, a brazier for the signal fire',
 build(o){CURREC.season='winter';CURREC.layers=[{k:'pycrete',m:.6}];CURREC.heat={stove:null,heated:false,crownVent:0};
  cyl('slab',0,0,0,2.4,.6,P('slab'),20);W(0,.6,0,0,()=>{ytFortTower(0,0,1.9,7.4,'course',0);
   W(1.0,0,0,0,()=>{for(const s of [-1,1])pole('larch',[s*.22,0,0],[s*.22,7.3,0],.03,P('larch'));for(let i=1;i<24;i++)pole('larch',[-.22,i*.3,0],[.22,i*.3,0],.02,P('larch'));wkLadder(0,0,0,0,7.3,0);});
   W(0,7.3,0,0,()=>{cyl('plain',0,0,0,.35,.4,jc(YT_IRON,.03),10,.45);box('glow',0,.42,0,.4,.1,.4,P('flame'));haloAt(0,.7,0,0xff8a30,true);});
   box('slab',0,0,1.85,1.0,1.8,.4,P('slab'));});door(0,0,2.4,0,1);}});
defBuilding({key:'yt_signal_cairn',name:'Signal cairn and inuksuk',seed:9805,w:4.4,d:3.6,h:2.6,budget:20000,
 tags:{types:['infrastructure'],wealth:'poor',style:'poor',role:'cairn'},
 note:'one of the chain of fires along the ridges: a dry-stone cairn with its fire basket of larch and dung, and an inuksuk pointing along the route',
 build(o){CURREC.season='winter';CURREC.layers=[];CURREC.heat={stove:null,heated:false,crownVent:0,open:true};
  ytShell('slab',ytCorbelProf(1.1,1.5,0,.25,.2),P('slab'),{seg:16});W(0,1.5,0,0,()=>{cyl('plain',0,0,0,.25,.35,jc(YT_IRON,.03),8,.35);box('larch',0,.2,0,.5,.12,.5,P('larchOld'));});
  W(1.9,0,.3,.4,()=>{box('slab',-.18,0,0,.25,.7,.25,P('slab'));box('slab',.18,0,0,.25,.7,.25,P('slab'));box('slab',0,.7,0,1.1,.2,.28,P('slab'));box('slab',0,.9,0,.3,.42,.26,P('slab'));box('slab',0,1.32,0,.24,.2,.22,P('slab'));box('slab',.62,.6,0,.3,.14,.22,P('slab'));});
  door(0,0,1.6,0,1);}});
