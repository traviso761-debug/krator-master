// prefix: lt
// ================================================================= TRADES AND FOOD: the combined craft-and-store halls, the granary, the windmill, the farm
// There are no shops (DESIGN.md section 4). Bronze and stone (casting, stonecutting, the armourer's corner), reed, weaving
// and lacquer, bone (the butchery: section 5, grim and orderly), the granary after Mohenjo-daro's (a brick podium with air
// channels under a reed superstructure), the panemone windmill (reed-mat sails on an upright shaft in a walled slot, turning)
// and a farm (placeholder crops, a frilled-lizard pen). Frame: origin on the ground at the plot centre, +z the front.
/* a craft hall: a battered room L x Wd of mk under a ribbed roof of rmk, a nested portal on the front (shared by every caste) */
function ltHall(L,Wd,wh,rh,mk,col,rmk,rcol,o){o=o||{};lzCutFloor(0);box(o.floorMk||'earthR',0,0,0,L+1.2,.14,Wd+1.2,o.floorCol||P('earthP'));
 const dh=lzDoorH(6),dw=dh*.62;
 lzBatterRoom(L,Wd,.14,wh,mk,col,{lean:o.lean||{front:.07,back:-.06,left:.1,right:-.05},front:[{s:L/2+(o.doorX||0),w:dw,h:dh,door:true},lzVent(4,1.4,wh*.6),lzVent(4,L-1.4,wh*.6)],
  back:o.back||[lzVent(4,L*.25,wh*.6),lzVent(4,L*.75,wh*.6)],skip:o.skip,mkf:o.mkf,colf:o.colf});
 lzNoCut(()=>lzPortal(o.doorX||0,.14,Wd/2+.05,0,dh,{mk:o.portalMk||'lacq'}));lzThreshold(o.doorX||0,Wd/2+.2,0,dw);
 lzRibRoof(L,Wd,wh+.1,wh+rh,o.n||9,{mk:rmk,col:rcol,over:.7,ribR:.15,past:o.past===undefined?.24:o.past,bend:.95,ext:.6,endMk:o.endMk||'reed',endCol:o.endCol||P('reedD')});}
defBuilding({key:'lz-hall-bronze',name:'Bronze and stone hall',seed:7201,caste:'all',cut:true,w:19,d:13,h:9.2,budget:120000,
 tags:{types:['industry'],wealth:'middle',role:'workshop',job:'smithing'},
 note:'casting (crucibles, moulds, the furnace in the yard) and stonecutting, with an armourer\'s corner: lamellae on lacquer racks, cord and rivets; basalt and baked brick walls, reed ribs; bronze only, no iron',
 build(o){ltHall(14,8.5,2.6,4.6,'basalt',P('basalt'),'thatch',P('reed'),{mkf:s=>s==='front'||s==='back'?'brick':'basalt',colf:s=>s==='front'||s==='back'?P('brick'):P('basalt'),portalMk:'bronze'});
  W(2.6,.14,8.5/2-.08*2.6-.05,0,()=>lzLeiwen(3.6,1.4,{cell:.45,mk:'bronze',back:'lacq'}));
  lzNoCut(()=>{FURNISH('generic_trade_forge',-5.2,.14,6.5,PI,{setting:'outdoor'});FURNISH('generic_trade_anvil',-3.6,.14,6.2,PI/2,{setting:'outdoor'});FURNISH('generic_trade_kiln',5.4,.14,6.6,PI,{setting:'outdoor'});
   smokeAt(5.4,2.2,6.6,{r:.3,kind:'fire'});});
  lzFurnRoom(13,7.5,.14,'common',{beds:0,noHearth:true,ceil:4.5,extra:[['lizardmen_common_workbench',-4.5,-2.2,0],['lizardmen_common_workbench',0,-2.4,0],['generic_trade_armour_stand',5.2,-2.4,0],['generic_trade_armour_stand',5.2,-.8,0],
   ['generic_trade_grindstone',-5.6,1.2,PI/2],['generic_trade_vat',4.8,1.6,-PI/2],['generic_crate',-1,2.2,0],['generic_trade_display',2,-2.4,0]]});}});
defBuilding({key:'lz-hall-reed',name:'Reed, weaving and lacquer hall',seed:7202,caste:'all',cut:true,w:19,d:13,h:9,budget:110000,
 tags:{types:['industry'],wealth:'middle',role:'workshop',job:'weaving'},
 note:'mats, screens, baskets and lacquerware: cane walls under a reed rib roof, a loom, drying racks of black and oxblood lacquer, reed bundles stacked outside; no garments',
 build(o){ltHall(14,8.5,2.4,4.4,'cane',P('cane'),'thatch',P('reedL'),{portalMk:'lacqR',endMk:'mat',endCol:P('reedL')});
  W(-2.8,.14,8.5/2-.08*2.4-.05,0,()=>lzLeiwen(3.2,1.3,{cell:.42,mk:'lacqR',back:'lacq'}));
  lzNoCut(()=>{for(let i=0;i<9;i++){const x=-6.8+i*.42;cyl('reed',x,0,6.2,.18,2.4+rr(-.3,.3),P('reed'),7);}
   for(let i=0;i<3;i++)ring('rope',-5.1,.7+i*.6,6.2,1.9,.03,P('reedD'),0,PI/2,0,16);});
  lzFurnRoom(13,7.5,.14,'common',{beds:0,noHearth:true,ceil:4.3,extra:[['lizardmen_common_loom',-4.6,-2.2,0],['lizardmen_common_workbench',.5,-2.4,0],['generic_trade_display',4.8,-2.4,0],['generic_basket',-5.4,1.8,0],['generic_basket',-4.4,2.1,.6],
   ['generic_floor_basket',5.2,1.4,0],['lizardmen_common_screen',2.8,.4,PI/2],['generic_trade_press',-1.5,1.6,PI/2]]});}});
/* the bone hall's stock: a carcass on a hook (a ribcage in bone over a hide), a hide on a frame, a bin of sorted bone */
function ltCarcass(x,y,z,ry,s,o){o=o||{};W(x,y,z,ry,()=>{beam('rope',[0,0,0],[0,-.5*s,0],.02,P('reedD'),true,5);
 const skull=o.skull!==false;ellip('hide',0,-1.1*s,0,.26*s,.62*s,.22*s,P('hideD'),0,10);
 for(let i=0;i<7;i++){const yy=-.72*s-i*.1*s;for(const k of [-1,1])tube('bones',t=>[k*Math.sin(t*PI*.9)*.3*s,yy-t*.1*s,Math.cos(t*PI*.9)*.24*s-.1*s],t=>[.018*s,.018*s],6,5,P('boneO'),{caps:true});}
 if(skull)sph('skull',0,-.5*s,0,.16*s,P('bone'),.85,10);for(const k of [-1,1])beam('bones',[k*.18*s,-1.6*s,0],[k*.24*s,-2.3*s,.05],.04*s,P('boneO'),true,6);});}
function ltHideFrame(x,z,ry,w,h){W(x,0,z,ry,()=>{for(const s of [-1,1])beam('bones',[s*w/2,0,0],[s*w/2,h+.3,0],.07,P('boneO'),true,6);beam('bones',[-w/2-.1,h,0],[w/2+.1,h,0],.06,P('boneO'),true,6);beam('bones',[-w/2-.1,.4,0],[w/2+.1,.4,0],.06,P('boneO'),true,6);
 psurf('hideP',(u,v)=>[(-w/2+.15)+(w-.3)*u+Math.sin(v*PI)*.05*(u-.5),.5+(h-.6)*v,.02*Math.sin(u*PI)*Math.sin(v*PI)],5,5,P('hideP'),{});
 for(const u of [.1,.3,.5,.7,.9])for(const yy of [.5,h-.1])beam('rope',[-w/2+.15+(w-.3)*u,yy,0],[-w/2+.15+(w-.3)*u+(u-.5)*.2,yy<1?.4:h,0],.012,P('reedD'),true,4);});}
function ltBoneBin(x,z,ry,w,d,n){W(x,0,z,ry,()=>{box('lacq',0,0,0,w,.5,d,P('lacq'));box('plain',0,.04,0,w-.1,.5,d-.1,P('black'));
 for(let i=0;i<n;i++){const a=rr(-.2,.2),L=d*rr(.5,.9);beam('bones',[-w/2+.1+rr(0,w-.2),.42+rr(0,.25),-L/2*Math.cos(a)],[-w/2+.1+rr(0,w-.2),.42+rr(0,.25),L/2*Math.cos(a)],.035,P(pick(['bone','boneO','boneD'])),true,5);}});}
defBuilding({key:'lz-hall-bone',name:'Bone hall',seed:7203,caste:'all',cut:true,w:19,d:14,h:9,budget:130000,
 tags:{types:['industry'],wealth:'middle',role:'workshop',job:'tanning'},
 note:'butchery, tanning and bone carving: carcasses on hooks sorted by part (human, Lizardman and hexapod side by side, dried and brown), hides on frames (human hides among them), bone sorted into stock bins by length; black lacquer walls, bone ribs; no ritual, no trophies: the horror is in how orderly it is',
 build(o){ltHall(14,9,2.8,4.6,'lacq',P('lacq'),'hide',P('hideD'),{portalMk:'ivory',endMk:'hide',endCol:P('hideD'),n:11,past:.3});
  /* the hooks: a bone beam the length of the hall, the stock hung from it by kind */
  const hy=2.9;beam('bones',[-6.5,hy,-1.2],[6.5,hy,-1.2],.1,P('boneO'),true,7);
  const hangs=[[-5.6,1.0,true],[-4.4,.95,true],[-3.3,1.1,true],[-1.8,1.45,false],[-.2,1.6,true],[1.5,1.7,true],[3.2,.9,true],[4.3,.9,true],[5.5,1.05,true]];
  for(const [x,s,sk] of hangs)ltCarcass(x,hy,-1.2,rr(-.3,.3),s,{skull:sk});
  for(const [x,z,ry] of [[-5.8,2.2,PI/2],[5.8,2.2,-PI/2],[-5.8,-3.4,PI/2]])ltHideFrame(x,z,ry,2.2,2.3);
  ltBoneBin(5.4,-3.2,0,2.4,1.1,30);ltBoneBin(2.6,-3.4,.1,2.2,1.0,24);ltBoneBin(-.6,-3.6,-.08,2.0,1.0,18);
  /* outside: the next load on a sledge, under a hide */
  lzNoCut(()=>{W(6.2,0,6.6,.4,()=>{for(const s of [-1,1])beam('wood',[s*.6,.1,-1.6],[s*.6,.1,1.6],.08,P('reedD'),true,6);box('hide',0,.15,0,1.4,.6,2.6,P('hide'));});});
  lzFurnRoom(13,8,.14,'common',{beds:0,noHearth:true,ceil:4.5,extra:[['lizardmen_common_workbench',0,1.2,0],['generic_trade_vat',-3.2,1.4,0],['generic_trade_bin',3.2,1.6,0],['generic_trade_barrel',-2.4,3.0,0],['lizardmen_common_rack',-4.8,-.2,PI/2]]});}});
/* ---------------------------------------------------------------- the granary: a brick podium with air channels under a reed superstructure */
defBuilding({key:'lz-granary',name:'Granary',seed:7204,caste:3,cut:true,w:14,d:11,h:9.6,budget:90000,
 tags:{types:['industry','infrastructure'],wealth:'middle',role:'store',job:'farming'},
 note:'after the Great Granary of Mohenjo-daro: a baked-brick podium of eleven blocks with air channels between them under a ribbed reed superstructure, reached by a log stair; the Rift yam and trumpet pods inside in baskets',
 build(o){const L=10,Wd=7,py=1.9;lzCutFloor(py);
  /* the podium: brick blocks in a 2 x 6 grid with channels between, odd by DESIGN: 11 (one corner block missing: the stair bay) */
  lzNoCut(()=>{let k=0;for(let i=0;i<6;i++)for(let j=0;j<2;j++){if(i===5&&j===1)continue;k++;box('brick',-L/2+.9+i*1.7,0,-Wd/2+1.5+j*3.6,1.5,py,3.0,P('brick'));}
   box('brick',0,py-.1,0,L+.6,.28,Wd+.6,P('brick'));
   lzHorn(L/2+.4,py+.2,Wd/2-.6,PI,2.2,.1,{curl:.4,mk:'horn'});lzHorn(-L/2-.4,py+.2,Wd/2-.6,PI,2.2,.1,{curl:.4,mk:'horn'});});
  const dh=lzDoorH(3),dw=dh*.62;
  lzBatterRoom(L-.6,Wd-.6,py+.18,2.2,'reed',P('reed'),{lean:{front:.06,back:-.05,left:.1,right:-.03},front:[{s:(L-.6)/2+2.2,w:dw,h:dh,door:true},lzVent(3,1.2,1.3)],back:[lzVent(3,2,1.3),lzVent(3,L-2.6,1.3)]});
  lzRibRoof(L-.6,Wd-.6,py+2.25,py+6.6,9,{mk:'thatch',col:P('reedL'),over:.6,ribR:.13,past:.26,bend:.95,ext:.5,endMk:'reed',endCol:P('reedD')});
  /* the stair: logs notched, up the front at the stair bay */
  /* the stair: nine log treads from the ground up to the podium's front edge, on two notched stringers */
  lzNoCut(()=>{W(L/2-.2,0,Wd/2+.3,0,()=>{const run=2.2;for(let i=0;i<9;i++){const t=(i+1)/9;box('wood',0,t*py-.12,run*(1-t)+.12,1.2,.12,.34,P('reedD'));}for(const s of [-1,1])beam('wood',[s*.62,0,run+.3],[s*.62,py+.05,-.1],.1,P('reedD'),true,6);});});
  lzThreshold(2.2,Wd/2-.3,0,dw);
  for(const [x,z] of [[-3.2,-1.6],[-1.8,-1.9],[-.2,-1.7],[1.4,-1.9],[2.8,-1.6],[-2.8,.4],[-1.0,.6],[.8,.4]])FURNISH(pick(['generic_basket','generic_floor_basket','generic_sack','generic_storage_jar']),x,py+.18,z,rr(0,TAU));
  FURNISH('generic_veg_basket',-3.8,py+.18,1.8,0);FURNISH('lizardmen_common_board',3.4,py+.18,-2.2,0);FURNISH_HANG('lizardmen_common_hanging',0,py+5,0,0);}});
/* ---------------------------------------------------------------- the windmill: a vertical-axis panemone in a walled slot, turning */
const LT_SPIN=[],LT_R=new THREE.Matrix4();
function ltSpinner(x,y,z,rate,fn){const B={},keep=GTARGET,H=CM.clone().multiply(TF(x,y,z,0));GTARGET=B;
 try{lzNoCut(()=>W(x,y,z,0,fn));}finally{GTARGET=keep;}if(!PLACE_DRY)LT_SPIN.push({B,H,Hi:H.clone().invert(),rate,phase:LT_SPIN.length*.9,g:null});}
function ltSpinFrame(){const t=ANIMU.uTime.value;for(const e of LT_SPIN){if(!e.g)continue;LT_R.makeRotationY(t*e.rate+e.phase);e.g.matrix.copy(e.H).multiply(LT_R).multiply(e.Hi);e.g.matrixWorldNeedsUpdate=true;}}
FRAME_HOOKS.push(ltSpinFrame);
{const ltBuildWorld=buildWorld;buildWorld=function(){LT_SPIN.length=0;const r=ltBuildWorld();
 for(const e of LT_SPIN){const g=new THREE.Group();g.matrixAutoUpdate=false;g.name='lt-spinner';flushBuckets(e.B,g,true);WORLD.add(g);e.g=g;}ltSpinFrame();return r;};}
defBuilding({key:'lz-windmill',name:'Panemone windmill',seed:7205,caste:2,cut:false,w:13,d:13,h:14,budget:80000,
 tags:{types:['industry','infrastructure'],wealth:'middle',role:'mill',job:'milling'},
 note:'a Persian panemone: seven reed-mat sails on an upright shaft, turning inside a slot between two curved basalt walls that catch the wind on one side only; the shaft runs down through a skeletal tower of bone to the millstones in a brick base',
 build(o){const R=4.2,H=9.5;
  /* the base and the two curved walls of the slot (open to the north-east and the south-west) */
  W(0,0,0,PI/4,()=>lzBatterRoom(6.2,6.2,0,1.6,'brick',P('brick'),{lean:{front:0,back:0,left:0,right:0},front:[lzDoor(2,3.1)]}));box('brick',0,1.6,0,6.4,.2,6.4,P('brick'),PI/4);
  for(const [a0,a1] of [[.35,2.2],[PI+.35,PI+2.2]])sector('cyclo',0,0,R+.5,R+1.1,a0,a1,0,H*.72,P('basalt'),14);
  /* the skeletal tower: seven bone legs leaning in to a collar, the shaft inside */
  for(let i=0;i<7;i++){const a=i*TAU/7;beam('bones',[Math.cos(a)*2.6,1.6,Math.sin(a)*2.6],[Math.cos(a)*.6,H+1.2,Math.sin(a)*.6],.11,P('boneO'),true,7);
   if(i%2)beam('bones',[Math.cos(a)*2.3,H*.5,Math.sin(a)*2.3],[Math.cos(a+TAU/7)*2.3,H*.5,Math.sin(a+TAU/7)*2.3],.07,P('boneO'),true,6);}
  ring('bones',0,H+1.2,0,.7,.1,P('boneO'),0,0,0,14);
  cyl('wood',0,1.6,0,.16,H+1.6,P('reedD'),8);
  ltSpinner(0,0,0,.55,()=>{for(let i=0;i<7;i++){const a=i*TAU/7;W(0,0,0,-a,()=>{beam('cane',[.3,H*.3,0],[R*.78,H*.32,0],.06,P('cane'),true,6);beam('cane',[.3,H*.95,0],[R*.78,H*.97,0],.06,P('cane'),true,6);
    psurf('mat',(u,v)=>[.4+(R*.75-.4)*u,H*.32+(H*.63)*v,.02*Math.sin(u*PI)],4,4,P('reedL'),{});psurf('mat',(u,v)=>[.4+(R*.75-.4)*u,H*.32+(H*.63)*v,-.02*Math.sin(u*PI)],4,4,P('reedL'),{flip:true});});}
   cyl('bronzeC',0,H*.28,0,.5,.3,P('bronze'),12);});
  /* the mill door and the grain outside */
  const dh=lzDoorH(2);W(0,0,0,PI/4,()=>lzPortal(0,0,3.14,0,dh,{mk:'lacq'}));
  FURNISH('generic_sack',3.4,0,3.0,.3,{setting:'outdoor'});FURNISH('generic_sack',2.8,0,3.8,1.1,{setting:'outdoor'});FURNISH('job_sheaf_rack',-4.6,0,-3.2,PI/4,{setting:'outdoor'});}});
/* ---------------------------------------------------------------- the farm: placeholder crops, a frilled-lizard pen, a drystone wall */
defBuilding({key:'lz-farm',name:'Farm',seed:7206,caste:3,cut:false,w:26,d:20,h:4,budget:90000,
 tags:{types:['industry'],wealth:'poor',role:'farm',job:'farming'},
 note:'the Drovers\' fields: rows of carrot frill greens and trumpet pods and a yam mound (PLACEHOLDER crops: the biome and fruit work owns them), a frilled-lizard pen walled in basalt, a burden beast at the plough',
 build(o){box('earthR',0,0,0,25,.08,19,P('earthP'));
  /* the rows: ridged earth with the greens on it */
  for(let r=0;r<7;r++){const z=-8+r*2.2;box('earth',-4,0,z,15,.3,.9,P('earth'));for(let i=0;i<17;i++){const x=-11.3+i*.9;const k=r%3;
   if(k===0){for(let f=0;f<5;f++){const a=f*TAU/5+r;ellip('plain',x+Math.cos(a)*.18,.3,z+Math.sin(a)*.18,.08,.22,.05,P('moss'),a,5);}}
   else if(k===1){cyl('plain',x,.3,z,.025,.9,P('moss'),4);for(let f=0;f<3;f++)cone('plain',x+rr(-.1,.1),.6+f*.2,z+rr(-.1,.1),.1,.22,P('spore'),6);}
   else ellip('plain',x,.3,z,.3,.18,.3,P('moss'),0,6);}}
  /* the pen: a drystone wall round the frilled lizards, a gate of bone */
  const px=8,pz=-3;W(px,0,pz,0,()=>{for(const [x,z,ry,L] of [[0,3.5,0,7],[0,-3.5,0,7],[3.5,0,PI/2,7],[-3.5,0,PI/2,7]])W(x,0,z,ry,()=>{for(let i=0;i<Math.floor(L/.55);i++)box('basalt',-L/2+.3+i*.55,0,0,.52,.9+rr(-.15,.15),.5,P(pick(['basalt','basaltD'])),rr(-.1,.1));});
   for(const s of [-1,1])lzHorn(s*.7,.9,3.5,0,1.1,.07,{curl:.6,mk:'horn'});});
  for(const [x,z,ry] of [[px-1.5,pz-1,0],[px+1.2,pz+1.4,2.2],[px+.2,pz-2.2,4.1]])place('frilled',x,z,ry,{mode:'idle',activity:'REST'});
  /* the plough team at the end of the rows */
  place('burden',-4,8.2,PI/2,{mode:'idle',activity:'WORK'});W(-1,0,8.2,PI/2,()=>{beam('wood',[0,.2,0],[0,1.2,-1.6],.08,P('reedD'),true,6);box('bronzeC',0,0,0,.14,.6,.5,P('bronze'));});
  FURNISH('generic_trade_trough',px+4.6,0,pz+2,PI/2,{setting:'outdoor'});FURNISH('generic_veg_basket',-10,0,9,0,{setting:'outdoor'});FURNISH('job_winnowing_mat',6,0,7,0,{setting:'outdoor'});
  door(px,0,pz+3.5,0,1.4);}});
