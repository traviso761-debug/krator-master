// prefix: ie
// ================================================================= KAUTOA'S DEFENCES: the wall, the gate, the watch tower, the barracks
// The old kingdom walled its towns in coral stone (the noble compounds' walls, 60-ie-east.js, grown to a rampart) and
// crowned the stone with a palisade of sharpened stakes, a walkway behind them, buffalo horns hung along it as trophies;
// the gate is a passage between two coral bastions under a fighting gallery roofed in the East's manner (a skirt of golden
// thatch and a spire with horns); the watch tower is a braced timber frame with a lookout hut under a spire with the moon;
// the barracks a long house on piles with two spires and a training yard. The West palisades in plain stakes (isPalisadeRun).
// Frame: origin on the ground at the plot centre, +z the front (the outside of a wall, the way in through the gate).
/* a run of wall along local x, L long, its outer face +z: a coral footing and wall, a stone coping, a palisade of sharpened
   stakes along the outer edge with rails behind, the walkway on top, horns on the palisade every 6 m; o.steps (metres between
   flights of stone steps up the inner face), o.ends (carved posts at both ends) */
function ieWallRun(L,o){o=o||{};const H=2.6,T=1.5,cv=P('carvN'),r=.13,ty=H+.14,n=Math.max(2,Math.floor(L/(r*2.1)));
 box('coral',0,0,0,L+.3,.7,T+.5,P('coral'));box('coral',0,.7,0,L,H-.7,T,P('coral'));box('stone',0,H,0,L+.1,.14,T+.12,P('stone'));
 for(let i=0;i<n;i++){const x=-L/2+r+i*(L-2*r)/(n-1),hh=1.7+h3(i,L,3)*.35,c=P('wood');cyl('wood',x,ty,T/2-.2,r,hh,c,7);cone('wood',x,ty+hh,T/2-.2,r,.4,c,7);}
 for(const yy of [ty+.45,ty+1.2])box('wood',0,yy,T/2-.2-r-.07,L,.16,.12,P('woodD'));
 box('planks',0,ty,-.2,L,.06,T-.75,P('planks'));
 for(let x=-L/2+3;x<L/2-1;x+=6)isHorns(x,ty+1.45,T/2-.02,0,.9);
 if(o.steps)for(let x=-L/2+o.steps/2;x<L/2;x+=o.steps)ieSteps(x,-T/2-.02,PI,ty,1.0,{rail:false});
 if(o.ends)for(const s of [-1,1])isPou(s*(L/2+.25),0,T/2+.35,H+1.6,.2,{mk:'carved',top:'figure',col:cv});}
defBuilding({key:'ie-wall',name:'Coral wall (Kautoa)',seed:6401,w:25.4,d:7,h:5.6,budget:120000,front:{x:0,z:1.0,yaw:0},
 tags:{types:['military','infrastructure'],wealth:'middle',style:'east',role:'town wall'},
 note:'a run of the town wall: battered coral stone on a footing, a stone coping, a palisade of sharpened stakes crowning it with a walkway behind, buffalo horns hung on the stakes, stone steps up the inner face, carved posts at the ends',
 build(o){ieWallRun(24,{steps:12,ends:true});}});
defBuilding({key:'ie-gate',name:'Town gate (Kautoa)',seed:6402,w:30.5,d:9,h:16,budget:200000,
 tags:{types:['military','infrastructure'],wealth:'rich',style:'east',role:'town gate'},
 note:'the town gate: a passage between two coral bastions painted with woven bands, heavy plank doors swung in, carved lintels; above it a fighting gallery behind a carved parapet under a skirt of golden thatch with a spire and horns; carved posts with horns and standing stones before it, the wall running off either side',
 build(o){const H=4.2,bw=5,bd=4.4,gw=3.4,cv=P('carvN'),gy=H+.16;
  /* the bastions and the wall either side */
  for(const s of [-1,1])W(s*(gw/2+bw/2),0,0,0,()=>{box('coral',0,0,0,bw+.3,.8,bd+.3,P('coral'));box('coral',0,.8,0,bw,H-.8,bd,P('coral'));box('stone',0,H,0,bw+.15,.16,bd+.15,P('stone'));
   box('patGableE',0,H-1.3,bd/2+.01,bw-.8,.9,.02,WHITE);});
  for(const s of [-1,1])W(s*(gw/2+bw+4),0,0,0,()=>ieWallRun(8,{}));
  /* the gateway: carved lintels, the doors swung inward, iron studs */
  for(const z of [bd/2-.3,-bd/2+.3])box('carved',0,H-.65,z,gw+.6,.65,.55,cv);box('patGableE',0,H-.55,bd/2+.03,gw-.2,.4,.02,WHITE);
  for(const s of [-1,1])W(s*gw/2,0,bd/2-.7,-s*1.2,()=>{box('planks',-s*gw/4,0,0,gw/2-.06,H-.75,.14,P('woodD'));
   for(const y of [.6,1.6,2.6])for(const k of [.2,.5,.8])sph('iron',-s*gw/2*k,y,.08,.05,P('iron'),1,6);box('wood',-s*gw/4,1.5,.08,gw/2-.2,.14,.06,P('wood'));});
  door(0,0,bd/2,0,gw);
  /* the fighting gallery: a deck over the bastions and the passage, carved posts, a parapet with woven panels, the roof */
  const GW=gw+2*bw;isDeck(GW,bd+.4,gy+.12,{col:P('planks'),beam:false});
  for(const x of isSpan(-GW/2+.25,GW/2-.25,5))for(const z of [-bd/2,bd/2])isPou(x,gy+.12,z,2.2,.14,{mk:'carved',n:2,col:cv});
  for(const [x,z,ry,L] of [[0,bd/2+.1,0,GW],[GW/2+.1,0,PI/2,bd+.4],[-GW/2-.1,0,-PI/2,bd+.4]])W(x,0,z,ry,()=>{box('carved',0,gy+.12,0,L,1.0,.2,cv);box('patGableE',0,gy+.24,.11,L-.6,.7,.02,WHITE);});
  ieRoofE({hw:GW/2+.8,hd:bd/2+1.0,eY:gy+2.3,skirtH:1.3,skirtS:.55,towerH:7,towerS:.3,topSx:.16,topSz:.05,sq:8,th:.28,finial:'horns',facade:'patGableE'});
  isLadder(gw/2+bw/2,-bd/2-.25,PI,gy+.12,{});
  ieFurn([['generic_trade_weapon_rack',-4.6,gy+.12,-bd/2+.35,0],['generic_trade_weapon_rack',4.6,gy+.12,-bd/2+.35,0],['islander_common_bench',0,gy+.12,-bd/2+.4,0],['generic_barrel',-6.2,gy+.12,-1.2,0]]);
  /* before the gate: carved posts with horns, standing stones, the flags */
  for(const s of [-1,1]){isPou(s*(gw/2+.55),0,bd/2+.9,4.6,.26,{mk:'carved',top:'horns',col:cv});isMenhir(s*3.6,bd/2+2.2,1.8,.3);isFlag(s*6.2,-bd/2-.6,10.5,{ry:s>0?0:PI});}}});
defBuilding({key:'ie-watchtower',name:'Watch tower (Kautoa)',seed:6403,cut:true,w:7.6,d:8,h:20.5,budget:120000,front:{x:.8,z:3.9,yaw:0},
 tags:{types:['military'],wealth:'middle',style:'east',role:'watch tower'},
 note:'the watch tower: four battered timber legs on footing stones, braced in three tiers, ladders by way of a landing to a lookout platform; a hut with a woven parapet on carved corner posts under a skirt and spire of golden thatch with the moon on its ridge; racks of spears and a chest up there for the watch',
 build(o){const ph=11,b0=2.3,b1=1.75,cv=P('carvN'),bAt=y=>lerp(b0,b1,y/ph),pt=(sx,sz,y)=>[sx*bAt(y),y,sz*bAt(y)];
  isNoCut(()=>{for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){sph('stone',sx*b0,.1,sz*b0,.45,P('stone'),.5,8);pole('wood',pt(sx,sz,0),pt(sx,sz,ph-.1),.2,P('wood'),8);}
   const tiers=[.4,3.9,7.4,ph-.25];
   for(let k=0;k<tiers.length;k++){const y=tiers[k];for(const [a,b] of [[[-1,-1],[1,-1]],[[1,-1],[1,1]],[[1,1],[-1,1]],[[-1,1],[-1,-1]]]){
     beam('wood',pt(a[0],a[1],y),pt(b[0],b[1],y),.14,P('woodD'));
     if(k<tiers.length-1){const y2=tiers[k+1];beam('wood',pt(a[0],a[1],y),pt(b[0],b[1],y2),.1,P('wood'));beam('wood',pt(b[0],b[1],y),pt(a[0],a[1],y2),.1,P('wood'));}}}
   for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])beam('wood',pt(sx,sz,ph-1.6),[sx*2.5,ph-.15,sz*2.5],.12,P('woodD'));
   /* the landing and the ladders */
   isDeck(1.5,1.2,5.5,{x:.8,z:2.65,col:P('planks'),beam:false});for(const x of [.15,1.45])pole('wood',[x,5.2,3.2],[x,0,3.5],.06,P('wood'),6);
   isLadder(.8,3.25,0,5.5,{lean:.7});W(.8,5.5,2.62,0,()=>isLadder(0,0,0,ph-5.5,{lean:.38}));});
  /* the platform and the lookout hut */
  isCutFloor(ph);isDeck(5.2,5.2,ph,{col:P('planks')});
  isWalls(5,5,ph,1.1,'bamboo',P('bamboo'),{front:[],back:[],left:[],right:[]});
  for(const [x,z,ry,L] of [[0,2.57,0,5],[0,-2.57,PI,5],[2.57,0,PI/2,5],[-2.57,0,-PI/2,5]])W(x,0,z,ry,()=>box('patWeave',0,ph+.08,0,L-.4,.85,.02,WHITE));
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])isPou(sx*2.42,ph,sz*2.42,2.4,.13,{mk:'carved',n:2,col:cv});
  ieRoofE({hw:3.2,hd:3.2,eY:ph+2.35,skirtH:1.0,skirtS:.55,towerH:4.0,towerS:.5,topSx:.22,topSz:.07,sq:6,th:.22,finial:'moon'});
  ieFurn([['generic_trade_weapon_rack',-2.2,ph,.2,PI/2],['islander_common_bench',2.2,ph,0,-PI/2],['islander_common_chest',-1.0,ph,-2.1,0],['generic_barrel',1.5,ph,-1.9,0]]);
  FURNISH_HANG('islander_common_hanging',0,ph+2.3,0,0);}});
defBuilding({key:'ie-barracks',name:'Barracks (Kautoa)',seed:6404,cut:true,w:17,d:18.5,h:12.5,budget:150000,
 tags:{types:['military','dwelling-multi'],wealth:'middle',style:'east',role:'barracks'},
 note:'the barracks of the war-band: a long plank house on piles under one skirt with two spires, buffalo horns on the veranda posts, two doors and two stairs; bunks along the back wall, lockers, racks of spears and an armour stand; a fenced training yard before it with dummies and an archery butt, the moon flag',
 build(o){const fy=1.4,w=13,d=6;
  const r=ieHouse({w,d,floorY:fy,wallH:2.3,ver:.8,verFront:1.6,roof:{over:.8,skirtH:1.5,skirtS:.6,towerH:6,towerS:.24,topSx:.12,topSz:.04,sq:9},
   towers:[[-3.4,0,1],[3.4,0,1]],wallMk:'planks',wallCol:P('planks'),
   front:[{x:-3.4,w:1.1,h:1.9,door:true},{x:3.4,w:1.1,h:1.9,door:true},{x:0,w:.8,y:.9,h:.7},{x:-5.6,w:.7,y:.9,h:.7},{x:5.6,w:.7,y:.9,h:.7}],back:[{x:-3,w:.7,y:.9,h:.7},{x:3,w:.7,y:.9,h:.7}],
   stair:'stair',stairX:-3.4,stairW:1.1,finial:'horns',hornPosts:true});
  for(const [x,z,ry,L] of [[0,-d/2-.07,PI,w],[w/2+.07,0,PI/2,d],[-w/2-.07,0,-PI/2,d]])W(x,0,z,ry,()=>box('patGableE',0,fy+1.75,0,L-.4,.45,.02,WHITE));
  isNoCut(()=>isStair(3.4,r.Dz1+.02,0,0,fy,1.1));
  /* the room: bunks along the back, lockers, the racks and the armour, a table with benches */
  for(const x of [-5.6,-4.4,-3.2,1.2,2.4,3.6])FURNISH('generic_trade_bunk',x,fy,-d/2+1.12,0);
  ieFurn([['generic_trade_locker',-1.6,fy,-d/2+.38,0],['generic_trade_locker',-.6,fy,-d/2+.38,0],['generic_trade_weapon_rack',-w/2+.3,fy,1.0,PI/2],['generic_trade_weapon_rack',w/2-.3,fy,1.0,-PI/2],
   ['generic_trade_armour_stand',5.6,fy,-1.5,-PI/2],['islander_common_low_table',0,fy,1.4,0],['islander_common_bench',-1.2,fy,1.4,PI/2],['islander_common_bench',1.2,fy,1.4,-PI/2]]);
  FURNISH_HANG('islander_common_hanging',0,fy+2.3+1.0,.6,0);
  /* the training yard */
  isNoCut(()=>{box('earth',0,0,10.2,14,.03,6.6,P('earth'));for(const [x,z,ry,L] of [[-7,10.2,PI/2,6.6],[7,10.2,PI/2,6.6],[-4.3,13.5,0,5.4],[4.3,13.5,0,5.4]])W(x,0,z,ry,()=>isFenceRun(L,1.2));
   isFlag(-6.4,7.6,9,{});});
  ieFurn([['islander_training_training_dummy',-4,0,10.8,0,{setting:'outdoor'}],['islander_training_training_dummy',-1.6,0,10.8,0,{setting:'outdoor'}],['islander_training_training_dummy',.8,0,10.8,0,{setting:'outdoor'}],
   ['islander_training_archery_butt',4.8,0,12.4,PI,{setting:'outdoor'}],['generic_trade_weapon_rack',6.3,0,9,-PI/2,{setting:'outdoor'}]]);}});
