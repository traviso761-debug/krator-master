// prefix: et
// ================================================================= DISPOSABLE WOODEN HARBOUR (tsunami-scoured moles & Farport outer quays)
// Knock-down, pegged cedar/cypress timber harbour buildings on braced tarred-pile cribs for low moles and tidal aprons
// below the megatsunami trimline (Arcodiga's SE Dam-Lee Mole now, Farport's outer storm quays later), where permanent
// masonry or dwellings are forbidden. Distinctively Eternian in silhouette and grammar: hexagonal plans alongside
// multi-bay transit sheds, stepped Art-Deco timber lintels and gable crowns, celadon/slate louvred shutters, timber
// oculus vents, ridge monitors, and closed-eyed lead ancestor masks over cargo portals.

/* Braced tarred-pile rectangular timber crib & sawn-plank deck (walkable via svFloor) */
function etWoodCrib(w,d,G,o){o=o||{};const tm=P('timber'),dk=P('timberL'),nx=Math.max(2,Math.round(w/3.6)),nz=Math.max(2,Math.round(d/3.6));
 for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const px=-w/2+i*w/nx,pz=-d/2+j*d/nz;
  if(i===0||i===nx||j===0||j===nz)box('timber',px,0,pz,.26,G,.26,tm);}
 for(const sz of [-1,1]){box('timber',0,G-.22,sz*(d/2-.13),w,.18,.22,tm);
  for(let i=0;i<nx;i++){const x0=-w/2+i*w/nx+.14,x1=-w/2+(i+1)*w/nx-.14;
   beam('timber',[x0,.08,sz*(d/2-.13)],[x1,G-.22,sz*(d/2-.13)],.09,tm);
   beam('timber',[x1,.08,sz*(d/2-.13)],[x0,G-.22,sz*(d/2-.13)],.09,tm);}}
 for(const sx of [-1,1])box('timber',sx*(w/2-.13),G-.22,0,.22,.18,d-.4,tm);
 box('planks',0,G-.08,0,w+.24,.12,d+.24,dk);
 svFloor([[-w/2+.08,-d/2+.08],[w/2-.08,-d/2+.08],[w/2-.08,d/2-.08],[-w/2+.08,d/2-.08]],G+.04);}

/* Braced 6-sided hexagonal tarred-pile timber crib matching etHex(R) */
function etWoodHexCrib(R,G){const tm=P('timber'),dk=P('timberL'),H=etHex(R);
 for(let i=0;i<6;i++){const a=H[i],b=H[(i+1)%6],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
  box('timber',a[0],0,a[1],.28,G,.28,tm);box('timber',mx,0,mz,.22,G,.22,tm);
  beam('timber',[a[0],G-.16,a[1]],[b[0],G-.16,b[1]],.18,tm);
  beam('timber',[a[0],.08,a[1]],[mx,G-.18,mz],.09,tm);beam('timber',[b[0],.08,b[1]],[mx,G-.18,mz],.09,tm);}
 prism('planks',etHex(R+.2),G-.1,G+.04,dk);
 svFloor(etHex(R-.12),G+.04);}

/* Stepped Art-Deco timber gable crown or lintel crest */
function etWoodCrown(x,y,z,w,steps,col){const c=col||P('timber');
 for(let i=0;i<(steps||3);i++){const ww=w-i*(w*.26);if(ww<.25)break;box('timber',x,y+i*.22,z,ww,.22,.24,c);}}

/* Board-and-batten heavy-timber enclosure with corner posts, vertical battens, knee braces, and stepped Deco surrounds */
function etWoodBoxWalls(w,d,y0,h,opens,o){o=o||{};const bd=o.col||P('timberL'),tm=P('timber'),sk=o.celadon?'shutterC':'shutter';
 etWalls(w,d,y0,h,'planks',bd,opens,{frame:tm,shutKey:sk,shutCol:P(sk),steps:o.steps});
 for(const sx of [-1,1])for(const sz of [-1,1])box('timber',sx*(w/2-.12),y0,sz*(d/2-.12),.32,h,.32,tm);
 const nx=Math.max(2,Math.round(w/3.2)),nz=Math.max(2,Math.round(d/3.2));
 for(let i=1;i<nx;i++){const xx=-w/2+i*w/nx;for(const sz of [-1,1]){
  if(!(sz===1&&Math.abs(xx)<1.8))box('timber',xx,y0,sz*(d/2+.02),.14,h,.1,tm);}}
 for(let j=1;j<nz;j++){const zz=-d/2+j*d/nz;for(const sx of [-1,1])box('timber',sx*(w/2+.02),y0,zz,.1,h,.14,tm);}
 box('timber',0,y0+h-.16,d/2+.03,w+.16,.16,.12,tm);box('timber',0,y0+h-.16,-d/2-.03,w+.16,.16,.12,tm);}

/* Raised Eternian louvred timber ridge monitor for harbour sheds */
function etWoodMonitor(w,d,y,h,celadon){const tm=P('timber'),bd=P('timberL'),sc=P(celadon?'shutterC':'shutter');
 box('planks',0,y,0,w,h,d,bd);
 for(const sz of [-1,1])for(let k=1;k<Math.max(2,Math.floor(h/.2));k++)box('shutter',0,y+k*.19,sz*(d/2+.03),w-.36,.05,.06,sc);
 for(const sx of [-1,1])box('timber',sx*(w/2-.1),y,0,.22,h,.22,tm);
 etGable(w,d,y+h,Math.min(.9,d*.36),{mk:'planks',col:tm,ov:.28,gov:.22,wallMk:'planks',wallCol:bd});}

/* Timber stair flight from ground (0) up to a raised pile deck at y0, facing +z */
function etWoodEntryStair(x,zFront,y0,w){const run=Math.max(.55,(Math.ceil(y0/.19)-1)*.28);
 svStair(x,zFront+run+.08,0,y0,PI,{style:'solid',w:w||1.8,run:run,mk:'timber',col:P('timber')});}

/* 1. Disposable timber wharf transit shed: 4-bay pegged cedar cargo shed on braced piles, sliding plank cargo bays,
   celadon louvred clerestory, ridge monitor, and lead ancestor mask */
defBuilding({key:'et_wood_transit_shed',name:'Wooden transit shed',seed:7721,cut:true,w:20,d:11,h:9.2,budget:48000,
 tags:{types:['industry'],wealth:'middle',style:'common',job:'warehousing'},
 note:'a 4-bay pegged-timber wharf transit shed on braced tarred piles, sliding plank cargo doors, celadon louvres and a ridge monitor',
 build(o){const G=.65,W=18.6,D=8.8,H=3.9,tm=P('timber'),bd=P('timberL');
  etWoodCrib(W,D+.9,G);
  etWoodEntryStair(0,D/2+.45,G,2.2);
  etWoodBoxWalls(W,D,G,H,{
   front:[
    {x:-5.4,w:2.6,h:2.7,y:.05,gap:true},
    {x:0,w:1.5,h:2.4,door:true,maskMetal:'lead',leaf:tm},
    {x:5.4,w:2.6,h:2.7,y:.05,gap:true},
    {x:-2.7,w:1.1,h:1.2,y:1.25},{x:2.7,w:1.1,h:1.2,y:1.25},{x:-8.0,w:1.0,h:1.2,y:1.25},{x:8.0,w:1.0,h:1.2,y:1.25}],
   back:[{x:-5.4,w:1.3,h:1.3,y:1.2},{x:0,w:1.4,h:2.3,door:true,mask:false,leaf:tm},{x:5.4,w:1.3,h:1.3,y:1.2}],
   left:[{x:0,w:1.4,h:1.3,y:1.2}],right:[{x:0,w:1.4,h:1.3,y:1.2}]
  },{celadon:true,steps:false});
  /* Sliding plank cargo leaves pushed aside at both freight bays */
  for(const bx of [-5.4,5.4]){etStepHead(bx,G+2.82,D/2+.08,2.7,{mk:'timber',col:tm});
   for(const s of [-1,1])box('shutter',bx+s*1.95,G+.08,D/2+.12,1.25,2.65,.08,P('shutterC'));
   box('iron',bx,G+2.74,D/2+.14,5.2,.08,.08,P('iron'));}
  etGable(W,D,G+H,2.2,{mk:'planks',col:bd,ribs:.65,ribCol:tm,ov:.48,gov:.35,wallMk:'planks',wallCol:bd});
  for(const sx of [-1,1]){pushM(TF(sx*W/2,0,0,sx*PI/2));etOculus(0,G+H+1.05,0,.55,{mk:'timber',col:tm});popM();}
  etWoodMonitor(6.8,2.3,G+H+1.75,.95,true);
  FURNISH('generic_crate',-6.4,G,-2.2,0);FURNISH('job_bales',-3.8,G,-2.4,0);FURNISH('generic_barrel',3.6,G,-2.4,0);
  FURNISH('generic_sack',6.2,G,-2.2,.3);FURNISH('eternian_common_register_desk',1.8,G,1.6,PI);
  FURNISH('eternian_common_weighing_scale',-1.9,G,1.8,0);FURNISH('job_plank_stack',-6.2,G,1.9,0);FURNISH('generic_lamp_oil',1.8,G,1.6,0);}});

/* 2. Hexagonal heavy-timber godown: the Eternal State's six-fold plan built in knock-down pegged timber & celadon shutters */
defBuilding({key:'et_wood_hex_warehouse',name:'Wooden hex warehouse',seed:7722,cut:true,w:14,d:14,h:11.4,budget:52000,
 tags:{types:['industry'],wealth:'middle',style:'common',job:'warehousing'},
 note:'a six-sided heavy-timber disposable godown on a braced hexagonal pile crib, two storeys, celadon shutters and a louvred cupola',
 build(o){const R=5.8,ap=R*ET_HEX_AP,G=.62,sh=2.75,tm=P('timber'),bd=P('timberL'),sc=P('shutterC');
  etWoodHexCrib(R,G);
  etWoodEntryStair(0,ap+.18,G,1.9);
  for(let s=0;s<2;s++){const y=G+s*sh;
   etHexFaces(ap,(k)=>{const op=[];
    if(s===0&&k===1)op.push({x:0,w:1.45,h:2.35,door:true,maskMetal:'lead',leaf:tm});
    else op.push({x:0,w:1.25,h:1.35,y:.9,shut:true});
    etWall(R,y,sh,'planks',bd,op,{frame:tm,shutKey:'shutterC',shutCol:sc,steps:false});});
   for(const q of etHex(R))box('timber',q[0],y,q[1],.34,sh,.34,tm);}
  /* Internal stair along face 4 (-z back) up to second timber loft floor */
  {const w=.9,zo=-(ap-.32),zi=zo+w+.12,run=R-.6,ph=PI/6+4*PI/3;
   W(0,0,0,Math.atan2(-Math.cos(ph),-Math.sin(ph)),()=>{
    svStair(-run/2,zo+(w/2+.05),G,G+sh,PI/2,{w:w,run:run,col:bd,scol:tm,rail:'left'});
    const fl=svClip(etHex(R-.22),[0,zi],[0,1]);prism('planks',fl,G+sh-.18,G+sh,bd);svFloor(fl,G+sh);});}
  const ry=G+2*sh;
  etHexHip(R,ry,3.0,{mk:'planks',col:bd,ov:.52,cap:tm});
  /* Hexagonal louvred cupola & verdigris finial */
  prism('timber',etHex(1.65),ry+2.45,ry+3.45,tm);
  pushM(TF(0,ry+2.5,0));etHexFaces(1.65*ET_HEX_AP,()=>{for(let k=0;k<4;k++)box('shutter',0,.15+k*.2,.04,1.2,.05,.06,sc);});popM();
  etHexHip(1.75,ry+3.45,1.05,{mk:'scale',col:P('verdigris'),ov:.25,cap:P('bronze')});
  cone('verdigris',0,ry+4.5,0,.18,.65,P('verdigris'),6);
  const placeHex=(key,face,ins,st)=>{const ph=PI/6+face*PI/3,r=ap-ins;
   FURNISH(key,r*Math.cos(ph),G+(st||0)*sh,r*Math.sin(ph),Math.atan2(-Math.cos(ph),-Math.sin(ph)));};
  placeHex('generic_crate',0,1.4,0);placeHex('job_bales',2,1.5,0);placeHex('generic_barrel',3,1.4,0);
  placeHex('generic_sack',5,1.4,0);placeHex('eternian_common_weighing_scale',0,2.6,0);
  placeHex('generic_crate',1,1.5,1);placeHex('generic_storage_jar',2,1.5,1);}});

/* 3. Elevated wooden coaling & ore pocket bunker: X-braced timber trestle bents, sloped plank hoppers, chute gates & monitor */
defBuilding({key:'et_wood_coaling_bunker',name:'Wooden coaling bunker',seed:7723,w:18,d:12,h:10.4,budget:46000,front:{x:0,z:5.6,yaw:0},
 tags:{types:['industry'],wealth:'poor',style:'common',job:'warehousing'},
 note:'elevated heavy-timber coal and ore hopper pockets on X-braced bents, chute gates along the berth and a barrow gallery',
 build(o){const tm=P('timber'),bd=P('timberL'),ir=P('iron'),coal=new THREE.Color(P('stoneD')).multiplyScalar(.42);
  box('planks',0,0,0,16.8,.18,10.2,tm);
  /* 5 heavy X-braced timber bents (y = 0.18 .. 3.55 m) */
  for(let i=0;i<5;i++){const bx=-6.8+i*3.4;
   for(const sz of [-3.2,0,3.2])box('timber',bx,.18,sz,.36,3.4,.36,tm);
   box('timber',bx,3.42,0,.38,.32,7.2,tm);
   beam('timber',[bx,.3,-3.1],[bx,3.35,3.1],.14,tm);beam('timber',[bx,.3,3.1],[bx,3.35,-3.1],.14,tm);}
  for(const sz of [-3.2,3.2])box('timber',0,3.42,sz,14.2,.3,.34,tm);
  /* Sloped plank coal hopper bin (y = 3.6 .. 6.8 m) with external timber ribs */
  box('planks',0,3.7,0,14.0,3.1,6.4,bd);
  for(let i=0;i<6;i++){const rx=-6.5+i*2.6;for(const sz of [-1,1])box('timber',rx,3.65,sz*3.26,.22,3.2,.18,tm);}
  /* 4 front coal/ore delivery chutes + dark coal heaps along +z */
  for(const cx of [-5.1,-1.7,1.7,5.1]){
   beam('planks',[cx,4.15,3.15],[cx,2.35,4.65],.75,bd);
   box('iron',cx,4.25,3.32,.95,.95,.12,ir);beam('iron',[cx-.42,4.9,3.35],[cx-.42,2.45,4.55],.07,ir);
   ellip('stone',cx,.18,4.35,1.15,.65,.95,coal,0,8);}
  /* Upper barrow-monitor gallery (y = 6.8 .. 8.8 m) + stepped Deco timber crowns + wheeling ramp on -x */
  etWoodMonitor(13.6,3.4,6.8,1.55,true);
  for(const sx of [-1,1])etWoodCrown(sx*6.8,8.35,0,2.4,3,tm);
  etMask(0,7.55,1.82,.48,'lead');
  beam('timber',[-8.1,.18,-1.8],[-6.8,3.65,-1.8],.85,bd);
  for(let k=0;k<5;k++)box('timber',-8.0+k*.3,0,-1.8,.18,.65+k*.68,.9,tm);
  FURNISH('generic_barrel',-6.6,.18,4.0,0);FURNISH('generic_crate',6.6,.18,3.9,0);FURNISH('eternian_common_weighing_scale',0,.18,4.6,0);}});

/* 4. Disposable wooden boat & lighter repair shed: open slipway portal, greased launch skids, hull ribs in frame, gable oculus */
defBuilding({key:'et_wood_boat_shed',name:'Wooden boat shed',seed:7724,cut:true,w:14,d:18,h:8.8,budget:48000,
 tags:{types:['industry'],wealth:'poor',style:'common',job:'carpentry'},
 note:'a timber-framed lighter and skiff repair boathouse with launch skids, a hull in frame, celadon shutters and a gable oculus',
 build(o){const G=.32,W=12.2,D=14.6,H=4.1,tm=P('timber'),bd=P('timberL');
  box('timber',0,0,-.5,W+.4,G,D+.4,tm);box('planks',0,G-.04,-.5,W-.2,.08,D-.2,bd);
  svFloor([[-W/2+.2,-D/2-.3],[W/2-.2,-D/2-.3],[W/2-.2,D/2-.7],[-W/2+.2,D/2-.7]],G+.04);
  pushM(TF(0,0,-.5));
  etWoodBoxWalls(W,D,G,H,{
   front:[{x:-1.4,w:5.2,h:3.45,y:.02,gap:true},{x:3.8,w:1.3,h:2.3,door:true,maskMetal:'lead',leaf:tm}],
   back:[{x:0,w:1.5,h:1.4,y:1.2},{x:-3.6,w:1.2,h:1.3,y:1.2},{x:3.6,w:1.2,h:1.3,y:1.2}],
   left:[{x:-3.5,w:1.3,h:1.3,y:1.15},{x:0,w:1.3,h:1.3,y:1.15},{x:3.5,w:1.3,h:1.3,y:1.15}],
   right:[{x:-3.5,w:1.3,h:1.3,y:1.15},{x:0,w:1.3,h:1.3,y:1.15},{x:3.5,w:1.3,h:1.3,y:1.15}]
  },{celadon:true,steps:false});
  etStepHead(-1.4,G+3.55,D/2+.08,5.3,{mk:'timber',col:tm});
  for(const s of [-1,1])box('shutter',-1.4+s*3.25,G+.06,D/2+.12,1.25,3.4,.08,P('shutterC'));
  etGable(W,D,G+H,2.45,{mk:'planks',col:bd,ribs:.6,ribCol:tm,ov:.46,gov:.35,wallMk:'planks',wallCol:bd});
  popM();
  etOculus(0,G+H+1.15,D/2-.48,.62,{mk:'timber',col:tm});
  /* Greased launch skids & wooden lighter hull ribs on keel blocks */
  for(const sx of [-2.4,-.4])beam('timber',[sx,G+.08,-5.2],[sx,.05,8.2],.2,tm);
  for(let k=0;k<8;k++)box('timber',-1.4,.12+.03*(8-k),8.0-k*1.55,2.5,.1,.18,bd);
  box('timber',-1.4,G+.35,-1.2,.24,.32,8.4,tm);
  for(let i=0;i<8;i++){const zz=-4.6+i*1.05,hw=1.55*Math.sin(PI*(i+.6)/8.6)+.35;
   pushM(TF(-1.4,G+.55,zz));ring('timber',0,.85,0,hw,.07,bd,0,PI/2);popM();}
  FURNISH('job_plank_stack',3.6,G,-4.8,0);FURNISH('job_saw_bench',3.2,G,-.8,PI/2);FURNISH('job_pole_rack',4.6,G,2.4,PI/2);
  FURNISH('generic_barrel',-4.6,G,-5.6,0);FURNISH('generic_crate',-4.5,G,-3.2,0);FURNISH('eternian_common_bench',3.6,G,4.4,PI);}});

/* 5. Two-storey wooden net-curing & salting loft: open braced pile stage below, overhanging celadon-louvred curing loft above */
defBuilding({key:'et_wood_net_loft',name:'Wooden net & curing loft',seed:7725,cut:true,w:16,d:10,h:9.2,budget:46000,
 tags:{types:['industry'],wealth:'poor',style:'poor',job:'fishing'},
 note:'an open-sided timber pile drying stage below, an overhanging slatted fish-smoking and net loft above with celadon shutters',
 build(o){const G=.42,W=14.2,D=8.2,sh=2.95,tm=P('timber'),bd=P('timberL');
  etWoodCrib(W,D,G);
  /* Open ground-floor post colonnade with knee braces + entry registration */
  for(let i=0;i<=4;i++)for(const sz of [-1,1]){const px=-W/2+.2+i*(W-.4)/4,pz=sz*(D/2-.2);
   box('timber',px,G,pz,.28,sh,.28,tm);
   if(i<4)beam('timber',[px,G+sh-.65,pz],[px+.65,G+sh-.05,pz],.1,tm);}
  box('timber',0,G+sh-.18,D/2-.2,W,.2,.28,tm);box('timber',0,G+sh-.18,-D/2+.2,W,.2,.28,tm);
  etStepHead(0,G+2.45,D/2-.06,2.2,{mk:'timber',col:tm});etMask(0,G+2.95,D/2+.02,.42,'lead');
  door(0,G,D/2-.15,0,2.0);
  /* Staircase up to overhanging upper curing loft (W+.6 x D+.6) */
  const SC=svStairCase({x0:-W/2+.4,x1:-W/2+1.45,z0:-D/2+.45,z1:D/2-.45},[G,G+sh],{w:.95,col:bd,scol:tm,rail:'right'});
  svWell('planks',0,G+sh-.18,0,W+.5,.2,D+.5,bd,SC.wells[0]);
  const UW=W+.6,UD=D+.6,uy=G+sh;
  etWoodBoxWalls(UW,UD,uy,2.75,{
   front:[{x:-4.6,w:1.3,h:1.3,y:.8},{x:-1.5,w:1.3,h:1.3,y:.8},{x:1.5,w:1.3,h:1.3,y:.8},{x:4.6,w:1.3,h:1.3,y:.8}],
   back:[{x:-3.6,w:1.3,h:1.2,y:.85},{x:0,w:1.3,h:1.2,y:.85},{x:3.6,w:1.3,h:1.2,y:.85}],
   left:[{x:0,w:1.3,h:1.2,y:.85}],right:[{x:0,w:1.3,h:1.2,y:.85}]
  },{celadon:true,steps:false});
  etGable(UW,UD,uy+2.75,2.05,{mk:'reed',col:P('reed'),ov:.48,gov:.35,wallMk:'planks',wallCol:bd});
  etWoodMonitor(4.8,1.8,uy+4.35,.75,true);
  FURNISH('job_net_frame',-4.2,G,-1.8,0);FURNISH('job_net_frame',4.2,G,-1.8,0);
  FURNISH('job_fish_tray',-1.2,G,1.4,0);FURNISH('job_fish_tray',1.6,G,1.4,0);
  FURNISH('generic_fish',1.6,G,1.4,0);FURNISH('generic_barrel',4.8,G,1.8,0);
  FURNISH('generic_basket',2.4,uy,-1.6,0);FURNISH('job_bales',-1.8,uy,-1.8,0);}});

/* 6. Two-storey wooden harbour chandlery & sail/cooperage loft: shop front below, upper loading doors & projecting cathead hoist */
defBuilding({key:'et_wood_chandlery',name:'Wooden harbour chandlery',seed:7726,cut:true,w:12,d:10,h:9.6,budget:46000,
 tags:{types:['shop'],wealth:'middle',style:'common',job:'trading'},
 note:'a two-storey timber harbour shop and sail-loft (v=1 cooperage), shop counter below and a cathead hoist beam under the gable',
 build(o){const v=(o&&o.v)|0,G=.55,W=10.6,D=8.4,sh=2.9,tm=P('timber'),bd=P('timberL');
  etWoodCrib(W,D+.7,G);
  etWoodEntryStair(W/2-1.5,D/2+.35,G,1.7);
  const SC=svStairCase({x0:-W/2+.35,x1:-W/2+1.4,z0:-D/2+.4,z1:D/2-.4},[G,G+sh],{w:.95,col:bd,scol:tm,rail:'right'});
  svWell('planks',0,G+sh-.18,0,W-.4,.2,D-.4,bd,SC.wells[0]);
  etWoodBoxWalls(W,D,G,sh,{
   front:[{x:-1.3,w:3.2,h:2.45,y:.08,gap:true},{x:W/2-1.5,w:1.25,h:2.3,door:true,maskMetal:'lead',leaf:tm}],
   back:[{x:1.5,w:1.2,h:1.3,y:.95}],left:[{x:0,w:1.1,h:1.2,y:1.0}],right:[{x:0,w:1.1,h:1.2,y:1.0}]
  },{celadon:v===0,steps:false});
  /* Timber shop counter & pent awning over the ground chandlery bay */
  box('timber',-1.3,G,D/2-.45,3.0,.95,.48,tm);box('planks',-1.3,G+2.65,D/2+.45,3.8,.12,.85,bd);
  etWoodBoxWalls(W,D,G+sh,2.75,{
   front:[{x:-3.2,w:1.1,h:1.3,y:.85},{x:0,w:1.6,h:2.1,y:.15,dark:true},{x:3.2,w:1.1,h:1.3,y:.85}],
   back:[{x:-2.2,w:1.1,h:1.2,y:.9},{x:2.2,w:1.1,h:1.2,y:.9}],
   left:[{x:0,w:1.1,h:1.2,y:.9}],right:[{x:0,w:1.1,h:1.2,y:.9}]
  },{celadon:v===0,steps:false});
  /*Gable facing +z (ridge along z) with projecting cathead hoist beam & slung cargo!*/
  pushM(TF(0,0,0,PI/2));
  etGable(D,W,G+sh+2.75,2.25,{mk:'planks',col:bd,ribs:.6,ribCol:tm,ov:.45,gov:.35,wallMk:'planks',wallCol:bd});
  popM();
  etWoodCrown(0,G+sh+5.0,D/2+.15,1.8,3,tm);
  /* Cathead hoist beam & rope block over upper loft door */
  box('timber',0,G+sh+2.35,D/2+.45,.24,.26,1.55,tm);
  cyl('bronze',0,G+sh+2.12,D/2+1.05,.16,.08,P('bronze'),10);
  box('iron',0,G+sh+.75,D/2+1.05,.04,1.4,.04,P('iron'));
  box('planks',0,G+sh+.25,D/2+1.05,.72,.58,.68,bd);
  if(v===0){
   FURNISH('job_bales',1.2,G,-2.2,0);FURNISH('generic_crate',3.2,G,-2.4,0);FURNISH('eternian_common_register_desk',-1.2,G,1.4,0);
   FURNISH('generic_lamp_oil',-1.2,G,1.4,0);FURNISH('job_pole_rack',2.4,G+sh,-2.2,0);FURNISH('generic_sewing',0,G+sh,1.2,0);
   FURNISH('eternian_common_chest',-1.8,G+sh,-2.4,0);
  }else{
   FURNISH('generic_barrel',1.0,G,-2.2,0);FURNISH('generic_barrel',2.4,G,-2.2,0);FURNISH('generic_storage_jar',3.5,G,-1.8,0);
   FURNISH('eternian_common_weighing_scale',-1.2,G,1.6,0);FURNISH('generic_crate',1.8,G+sh,-2.2,0);
   FURNISH('generic_sack',-.8,G+sh,-2.2,0);FURNISH('eternian_common_table',1.2,G+sh,1.2,0);}}});

/* 7. Hexagonal wooden harbour-tally & weighbridge kiosk: plank veranda around a 6-sided clerk pavilion, ogee shingle roof & bell */
defBuilding({key:'et_wood_tally_kiosk',name:'Wooden tally kiosk',seed:7727,cut:true,w:9,d:9,h:8.8,budget:36000,
 tags:{types:['civic'],wealth:'middle',style:'common',job:'trading'},
 note:'a hexagonal wooden customs and weigh-tally kiosk with a wrap-around plank veranda, celadon shutters and a harbour bell',
 build(o){const Rv=3.85,R=2.85,ap=R*ET_HEX_AP,G=.58,H=2.95,tm=P('timber'),bd=P('timberL'),sc=P('shutterC');
  etWoodHexCrib(Rv,G);
  etWoodEntryStair(0,Rv*ET_HEX_AP+.16,G,1.6);
  /* Outer hexagonal veranda posts & low timber rail (open on face 1 entry) */
  const HV=etHex(Rv-.15);
  for(let i=0;i<6;i++){const a=HV[i],b=HV[(i+1)%6];
   box('timber',a[0],G,a[1],.2,H,.2,tm);
   beam('timber',[a[0],G+H-.12,a[1]],[b[0],G+H-.12,b[1]],.16,tm);
   if(i!==1)beam('timber',[a[0],G+.82,a[1]],[b[0],G+.82,b[1]],.1,bd);}
  etHexFaces(ap,(k)=>{const op=[];
   if(k===1)op.push({x:0,w:1.2,h:2.25,door:true,maskMetal:'lead',leaf:tm});
   else op.push({x:0,w:1.15,h:1.3,y:.88,shut:true});
   etWall(R,G,H,'planks',bd,op,{frame:tm,shutKey:'shutterC',shutCol:sc,steps:false});});
  for(const q of etHex(R))box('timber',q[0],G,q[1],.26,H,.26,tm);
  /* Hanging bronze harbour bell on face 0 veranda post */
  box('timber',HV[1][0]+.35,G+2.35,HV[1][1],.65,.12,.12,tm);
  cone('bronze',HV[1][0]+.58,G+1.88,HV[1][1],.24,.42,P('bronze'),10);
  etOgee(Rv+.15,G+H,3.05,{mk:'scale',seg:6,a0:0,col:P('verdigris'),band:tm,finial:.95});
  FURNISH('eternian_common_register_desk',0,G,-.35,0);FURNISH('eternian_common_weighing_scale',1.15,G,.55,-.6);
  FURNISH('generic_strongbox',-1.2,G,-.9,.4);FURNISH('eternian_common_bench',-1.25,G,.65,1.0);
  FURNISH('generic_tea_set',0,G,-.35,0);}});

/* 8. Heavy timber wharf crane & capstan stage: braced timber crib, slewing sheerlegs jib crane, wooden capstan & tally hood */
defBuilding({key:'et_wood_crane_stage',name:'Wooden crane stage',seed:7728,w:12,d:10,h:11.8,budget:36000,front:{x:0,z:4.8,yaw:0},
 tags:{types:['infrastructure'],wealth:'poor',style:'common',job:'trading'},
 note:'a heavy timber slewing jib-crane and four-bar capstan on a braced timber wharf crib, cargo slings and a tally hood',
 build(o){const G=.72,W=10.8,D=8.4,tm=P('timber'),bd=P('timberL'),br=P('bronze'),ir=P('iron');
  etWoodCrib(W,D,G);
  etWoodEntryStair(-3.2,D/2+.12,G,1.6);
  /* Bronze mooring bollards along +z berth edge */
  for(const bx of [-4.4,0,4.4])cyl('bronze',bx,G,D/2-.45,.16,.58,br,8);
  /* Heavy slewing king-post mast, raking twin jib booms, iron tie-rods & slung crate */
  pushM(TF(1.4,G,-.4));
   box('timber',0,0,0,1.6,.42,1.6,tm);
   cyl('timber',0,.4,0,.28,8.8,tm,10);
   for(const sx of [-.65,.65])beam('timber',[sx*2.2,0,-1.8],[0,5.2,0],.2,tm);
   for(const sx of [-.22,.22])beam('timber',[sx,3.2,0],[sx*.5,8.9,4.2],.22,bd);
   beam('iron',[0,8.9,0],[0,8.85,4.15],.07,ir);
   cyl('bronze',0,8.45,4.15,.22,.14,br,10);
   box('iron',0,4.1,4.15,.04,4.35,.04,ir);
   box('planks',0,2.85,4.15,1.25,1.15,1.15,bd);
  popM();
  /* 4-bar wooden capstan at (-2.4, G, .8) */
  cyl('timber',-2.4,G,.8,.32,1.05,tm,10);cyl('bronze',-2.4,G+.98,.8,.38,.12,br,10);
  box('timber',-2.4,G+.88,.8,2.4,.09,.09,bd);box('timber',-2.4,G+.88,.8,.09,.09,2.4,bd);
  /* Compact open-fronted timber tally & winch shelter hood at (-3.2, G, -2.4) */
  pushM(TF(-3.2,G,-2.4));
   box('planks',0,0,-1.05,3.2,2.45,.16,bd);
   for(const sx of [-1.5,1.5]){box('timber',sx,0,1.0,.18,2.25,.18,tm);box('planks',sx,0,0,.14,2.35,2.1,bd);}
   etPent(3.4,2.3,2.25,2.75,{mk:'planks',col:tm,ov:.35});
   etWoodCrown(0,2.35,1.05,1.6,2,tm);etMask(0,1.95,-.92,.38,'lead');
  popM();
  FURNISH('generic_crate',3.8,G,-2.4,0);FURNISH('generic_barrel',3.9,G,.2,0);
  FURNISH('job_bales',3.6,G,2.1,.2);FURNISH('eternian_common_weighing_scale',-3.2,G,-2.2,0);}});
