// prefix: lt
// ================================================================= LOJ TWENNY: THE HOLD'S PLAN (PLAN.md sections 2-3) [G data]
// Loj Twenny (20), the first Tungang hold, as plain records on core/city's cavern setting (KCITY.cavern.lineHold): no THREE, no
// DOM. **At station 3 of the Line, the Twenny junction, under the great shaft** (the owner, 2026-11-11: openworld/PLAN-SETTLEMENTS.md
// question 16). A hold is a station on a line (kits/tungang/PLAN.md 5.1): the Ancients' station cavern is its spine, its platforms
// and mezzanines the hold's public ways; its streets run out through the station's own doors into the rock (the platforms' doors
// at the car floor, the mezzanines' doors at their deck), and down the branch tube in the east wall, at whose end stands the loj
// hall. Three decks (5.2): the quiet deck (+1, the mezzanines' level, 7.6: homes, red), the Line deck (0, the platforms, 1.8:
// public, green), the work deck (-1, -2.7: amber). The great shaft's foot on the west platform is the hold's way to the surface
// (the hoist, the Ice-cutters' ice down it).
// Frame: station 3's window (biomes/line/stations/station/48-line-window.js): x across (east +), z along the Line (south +,
// z = s - 217700), y up from the invert. The station's numbers are written here (LT.ST) so the plan runs without the page (the
// node test); the page checks they match LINE's (90-lt-checks.js, 'station-match').
//   LT.ST             station 3's cavern, platforms, mezzanines, stairs, bridges, doors, branch and shaft (as LINE has them)
//   LT.plan(o)        the hold's KCITY.cavern plan (o.world, o.edits): built once, cached as LT.H
//   LT.audit()        KCITY.cavern.audit of it
const LT={id:'loj-twenny',name:'Loj Twenny',num:20,world:20261120,
 site:{px:445,py:1266,station:3,km:218,rock:'rift fill',rockT:45,airT:28,cover:2200,shaft:2200},
 ST:{x0:-30,x1:22.5,lining:.6,z0:220,z1:680,crown:20,PY:1.8,DECK:7.6,
  platforms:{east:[15.3,22.5,300,600],west:[-30,-15.3,262,638],island:[-5.5,5.5,300,600]},
  mezz:{east:[19.5,22.5,320,580],west:[-30,-26.4,320,580]},
  stairs:{e:[[17.4,1.8,500],[17.4,7.6,476]],w:[[-21,1.8,500],[-21,7.6,476]],ie:[[3.6,1.8,420],[3.6,7.6,445]],iw:[[-3.6,1.8,420],[-3.6,7.6,445]]},
  bridgeZ:447.5,doors:{e:[330,380,520,570],w:[340,560]},mdoors:[340,380,420,500,540,580],
  branch:{z:411,pts:[[22.5,1.8,411],[45,1.8,413],[85,1.6,418]],w:8,h:6},shaft:{c:[-22,540],r:3.5}},
 DECKS:[{i:1,y:7.6,name:'the quiet deck',light:'red'},{i:0,y:1.8,name:'the Line deck',light:'green'},{i:-1,y:-2.7,name:'the work deck',light:'amber'}]};
/* the homes' frontage: the households' sets and the poor's cuts (kits/tungang TG.tg.BOX's w, d, h) */
LT.HOMES=[{key:'tg-set',w:7.4,d:8.6,h:2.6,weight:3},{key:'tg-cut',w:2.8,d:3.6,h:2.4,weight:2}];
LT.BOX={'tg-loj-hall':[14,17,6],'tg-signal-box':[6.4,5.2,3],'tg-carriage-house':[27,8.6,5.4],'tg-dark-beds':[12.4,14,3.2],'tg-cistern':[8.4,9.4,3.6],'tg-bath':[8.4,9.4,3.2],
 'tg-fan-house':[6.4,8.2,4.4],'tg-doors':[10,4.4,5],'tg-night-mouth':[3.4,16,3],'tg-last-stop':[7,12,3]};
LT.spec=function(o){o=o||{};const S=LT.ST,PY=S.PY,DK=S.DECK,P=S.platforms,M=S.mezz,mid=a=>(a[0]+a[1])/2,wid=a=>a[1]-a[0];
 const civ=(id,key,way,s,side,x)=>{const b=LT.BOX[key];return Object.assign({id,key,way,s,side,at:'wall',w:b[0],d:b[1],h:b[2]},x||{});};
 const on=(id,way,s,x,y,z)=>({id,on:{way,s},x,y,z});
 return {id:LT.id,world:o.world==null?LT.world:o.world,decks:LT.DECKS,
  /* the Ancients' stairs to the mezzanines are long and shallow (5.8 m over 24 m): risers by the step rule down to 6 cm */
  tune:{riser:[.06,.2]},
  /* the station cavern: carved by the Line's own shape (the page's cavern takes LINE's primitives); here its box, so the rock rule
     keeps every site out of its lining */
  spaces:[{id:'lt.station',kind:'platform',x:(S.x0-S.lining+S.x1+S.lining)/2,y:-S.lining,z:(S.z0+S.z1)/2,w:S.x1-S.x0+2*S.lining,d:S.z1-S.z0,h:S.crown+S.lining,deck:0,prim:'room'}],
  /* the spines: the east platform (the hold's side), the west platform and its apron, the island, the two mezzanines */
  spine:{id:'lt.pe',pts:[[mid(P.east),PY,P.east[2]],[mid(P.east),PY,P.east[3]]],w:wid(P.east),h:9,deck:0,kind:'gallery',prim:'none',space:'lt.station'},
  spines:[{id:'lt.pw',pts:[[mid(P.west),PY,P.west[2]],[mid(P.west),PY,P.west[3]]],w:wid(P.west),h:9,deck:0,kind:'gallery',prim:'none',space:'lt.station'},
   {id:'lt.pi',pts:[[0,PY,P.island[2]],[0,PY,P.island[3]]],w:wid(P.island),h:9,deck:0,kind:'gallery',prim:'none',space:'lt.station'},
   {id:'lt.me',pts:[[mid(M.east),DK,M.east[2]],[mid(M.east),DK,M.east[3]]],w:wid(M.east),h:3,deck:1,kind:'ledge',prim:'none',space:'lt.station'},
   {id:'lt.mw',pts:[[mid(M.west),DK,M.west[2]],[mid(M.west),DK,M.west[3]]],w:wid(M.west),h:3,deck:1,kind:'ledge',prim:'none',space:'lt.station'}],
  /* the nodes along them: the stairs' feet and heads, the footbridges' ends, the branch's mouth, the shaft's foot, the stores and
     the Fixers' shop behind the east platform's doors, the market on the island */
  nodes:[on('lt.pe@500','lt.pe',200,mid(P.east),PY,500),on('lt.me@476','lt.me',156,mid(M.east),DK,476),
   on('lt.pw@500','lt.pw',238,mid(P.west),PY,500),on('lt.mw@476','lt.mw',156,mid(M.west),DK,476),
   on('lt.pi@420','lt.pi',120,0,PY,420),on('lt.me@447','lt.me',127.5,mid(M.east),DK,S.bridgeZ),on('lt.mw@447','lt.mw',127.5,mid(M.west),DK,S.bridgeZ),
   {id:'lt.be',x:3.6,y:DK,z:S.bridgeZ},{id:'lt.bw',x:-3.6,y:DK,z:S.bridgeZ},
   on('lt.pe@411','lt.pe',111,mid(P.east),PY,411),{id:'lt.way:end',x:85,y:1.6,z:418},
   on('lt.pw@540','lt.pw',278,mid(P.west),PY,540),on('lt.pe@330','lt.pe',30,mid(P.east),PY,330),on('lt.pe@520','lt.pe',220,mid(P.east),PY,520),
   on('lt.pi@350','lt.pi',50,0,PY,350)],
  /* the links (the host draws and carves them: prim none): the stairs, the footbridges, the branch (the hold's main street east) */
  links:[{id:'lt.stair.e',kind:'stair',a:'lt.pe@500',b:'lt.me@476',pts:S.stairs.e,w:1.8,h:3,prim:'none',joins:['lt.station']},
   {id:'lt.stair.w',kind:'stair',a:'lt.pw@500',b:'lt.mw@476',pts:S.stairs.w,w:1.8,h:3,prim:'none',joins:['lt.station']},
   {id:'lt.stair.ie',kind:'stair',a:'lt.pi@420',b:'lt.be',pts:S.stairs.ie,w:1.8,h:3,prim:'none',joins:['lt.station']},
   {id:'lt.stair.iw',kind:'stair',a:'lt.pi@420',b:'lt.bw',pts:S.stairs.iw,w:1.8,h:3,prim:'none',joins:['lt.station']},
   {id:'lt.bridge.e',kind:'passage',a:'lt.be',b:'lt.me@447',pts:[[3.6,DK,S.bridgeZ],[mid(M.east),DK,S.bridgeZ]],w:5,h:3,deck:1,prim:'none',joins:['lt.station']},
   {id:'lt.bridge.w',kind:'passage',a:'lt.bw',b:'lt.mw@447',pts:[[-3.6,DK,S.bridgeZ],[mid(M.west),DK,S.bridgeZ]],w:5,h:3,deck:1,prim:'none',joins:['lt.station']},
   {id:'lt.way',kind:'gallery',a:'lt.pe@411',b:'lt.way:end',pts:S.branch.pts,w:S.branch.w,h:S.branch.h,prim:'none',district:'the loj\'s way',joins:['lt.station']}],
  sidings:[
   /* the quiet deck: out through the mezzanines' doors (cream over red, cream over green); the west's far end the old end */
   {id:'lt.n1',from:'lt.me',at:60,side:-1,len:58,deck:1,band:'cream-red',district:'homes east',w:2.4,h:2.6},
   {id:'lt.n2',from:'lt.me',at:220,side:-1,len:50,deck:1,band:'cream-green',district:'homes east',w:2.4,h:2.6},
   {id:'lt.n3',from:'lt.mw',at:100,side:1,len:52,deck:1,band:'cream-red',district:'homes west',w:2.4,h:2.6},
   {id:'lt.n4',from:'lt.mw',at:20,side:1,len:46,deck:1,band:'red',district:'old end',w:2.4,h:2.6},
   /* the work deck: down a stair from the west platform's workshop door (plain red) */
   {id:'lt.s1',from:'lt.pw',at:298,side:1,len:62,deck:-1,drop:'stair',band:'red',district:'works',w:3.4,h:3.6}],
  civic:[
   /* the Line deck: the signal box at the west platform's signal room, the cistern and the fan house at the east platform's doors,
      the gate across the branch's mouth, two carriage houses facing across the branch */
   civ('lt.signal-box','tg-signal-box','lt.pw',78,1),civ('lt.cistern','tg-cistern','lt.pe',80,-1),civ('lt.fan-house','tg-fan-house','lt.pe',270,-1),
   civ('lt.doors','tg-doors','lt.way',10,1,{span:8,h:6}),
   civ('lt.carriage-a','tg-carriage-house','lt.way',40,-1,{num:301}),civ('lt.carriage-b','tg-carriage-house','lt.way',40,1,{num:302}),
   /* the work deck: three dark beds and the bath */
   civ('lt.beds-a','tg-dark-beds','lt.s1',10,-1),civ('lt.beds-b','tg-dark-beds','lt.s1',26,-1),civ('lt.bath','tg-bath','lt.s1',10,1),civ('lt.beds-c','tg-dark-beds','lt.s1',28,1),
   /* the night mouth at the end of the west homes (its climb up toward the shaft's hoist room: the way to the surface); the last
      stop at the old end */
   civ('lt.night-mouth','tg-night-mouth','lt.n3',48,1),civ('lt.last-stop','tg-last-stop','lt.n4',40,-1)],
  /* the loj hall at the branch's end, facing back down it: the landmark (PLAN.md 5.4) */
  sites:[{id:'lt.loj-hall',at:'wall',key:'tg-loj-hall',way:'lt.way',x:85,y:1.6,z:418,ry:-Math.PI/2,w:14,d:17,h:6,tier:'civic',loj:20,district:'the loj\'s way'}],
  fill:[{way:'lt.n1',defs:LT.HOMES,salt:1,from:3},{way:'lt.n2',defs:LT.HOMES,salt:3,from:3},{way:'lt.n3',defs:LT.HOMES,salt:5,from:3,to:42},
   {way:'lt.n4',defs:[LT.HOMES[1]],salt:7,from:3,to:32},{way:'lt.s1',defs:[LT.HOMES[1]],sides:[-1],salt:9,from:42}],
  /* wealth from the loj hall; the hold grew out from the station: the west mezzanine's far ends the oldest, worn and abandoned */
  hub:'lt.way:end',reach:480,heart:'lt.way:end',worn:360,abandoned:430,
  /* the works, the gate and the box are kept whatever their distance: the hold's work and its doors never go to ruin (edits by id) */
  edits:LT.KEEP.map(id=>({id,op:'set',fields:{state:'kept'}})).concat(o.edits||[])};};
LT.KEEP=['lt.doors','lt.signal-box','lt.beds-a','lt.beds-b','lt.beds-c','lt.cistern','lt.fan-house','lt.bath','lt.night-mouth'];
LT.plan=function(o){if(LT.H&&!o)return LT.H;const H=KCITY.cavern.lineHold(LT.spec(o));
 /* the berth numbers: each home a number by its siding and slot (the Line's count: the hold is 20, its berths 2xx) */
 let n=200;for(const s of H.sites)if(s.key==='tg-set'||s.key==='tg-cut'){s.num=n;n+=s.key==='tg-set'?2:1;}
 if(!o)LT.H=H;return H;};
LT.audit=function(H){return KCITY.cavern.audit(H||LT.plan());};
