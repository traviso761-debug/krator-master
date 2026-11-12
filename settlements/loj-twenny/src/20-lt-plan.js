// prefix: lt
// ================================================================= LOJ TWENNY: THE HOLD'S PLAN (PLAN.md sections 2-3) [G data]
// Loj Twenny (20), the first Tungang hold, as plain records on core/city's cavern setting (KCITY.cavern.lineHold): no THREE, no
// DOM. A cavern loj in the rift fill at the far end of the 25 km branch from the Twenny junction (biomes/line/PLAN.md, the
// owner's answer 3): the branch's kept TERMINUS is its spine (a hold is a station on a line: kits/tungang/PLAN.md 5.1), two
// tracks between two side platforms in a vaulted hall, the branch shuttle from the junction running in on them; sidings off
// the platforms are its streets, the sets its houses; three decks 4.5 m apart (5.2): the quiet deck (+1, red, homes), the Line
// deck (0, green, public: the platforms, the loj hall, the signal box, the carriage houses), the work deck (-1, amber: the dark
// beds, the cistern, the fan house, the bath). The doors close the hold at the hall's mouth; the night mouth climbs from the
// quiet deck toward the surface; the last stop, the sealed siding of the dead, at the hold's abandoned end.
// Frame: x east (the branch comes in from the west, x < 0), z south, y up; the hall's invert y 0, the platforms 1.8 (the car
// floor: the Line's SEC.platformY), the decks 6.3, 1.8 and -2.7.
//   LT.HALL           the terminus hall's box, its tracks, its platforms (the drawing and the train read it)
//   LT.plan(o)        the hold's KCITY.cavern plan (o.world, o.edits): built once, cached as LT.H
//   LT.audit()        KCITY.cavern.audit of it
const LT={id:'loj-twenny',name:'Loj Twenny',num:20,world:20261120,
 /* the scale model's place (kits/tungang/PLAN.md 1.2; biomes/line/PLAN.md 1, 2.1): model pixel 457,1269 in the rift fill, the rock
    about 44 degC, 25 km east of the Twenny junction (bore km 218, station 3) by the branch */
 site:{px:457,py:1269,rock:'rift fill',rockT:44,airT:27,branchKm:25,junction:{station:3,km:218}},
 /* THE TERMINUS HALL: 157 m long, 22 m wide, a flattened vault 10.5 m to the crown; two guideways at z -2.6 and +2.6 (0.6 m
    high), the buffers at x 148; side platforms at the car floor (1.8 m) from the walls to 0.1 m off the cars */
 HALL:{x0:0,x1:157,z0:-11,z1:11,crown:10.5,spring:6,invert:0,
  tracks:[{id:'lt.t1',z:-2.6},{id:'lt.t2',z:2.6}],guide:{h:.6,w:2.8},car:{half:1.8,floor:1.2},buffers:148,
  platformY:1.8,platforms:[{id:'lt.pn',z0:-11,z1:-4.5,side:-1},{id:'lt.ps',z0:4.5,z1:11,side:1}],concourse:{x0:150,x1:157}},
 DECKS:[{i:1,y:6.3,name:'the quiet deck',light:'red'},{i:0,y:1.8,name:'the Line deck',light:'green'},{i:-1,y:-2.7,name:'the work deck',light:'amber'}]};
/* the homes' frontage: the households' sets and the poor's cuts (kits/tungang TG.tg.BOX's w, d, h) */
LT.HOMES=[{key:'tg-set',w:7.4,d:8.6,h:2.6,weight:3},{key:'tg-cut',w:2.8,d:3.6,h:2.4,weight:2}];
LT.spec=function(o){o=o||{};const P=LT.HALL,y=P.platformY,B=k=>({w:{'tg-loj-hall':14,'tg-signal-box':6.4,'tg-carriage-house':27,'tg-dark-beds':12.4,'tg-cistern':8.4,'tg-bath':8.4,'tg-fan-house':6.4,'tg-doors':10,'tg-night-mouth':3.4,'tg-last-stop':7}[k],
  d:{'tg-loj-hall':17,'tg-signal-box':5.2,'tg-carriage-house':8.6,'tg-dark-beds':14,'tg-cistern':9.4,'tg-bath':9.4,'tg-fan-house':8.2,'tg-doors':4.4,'tg-night-mouth':16,'tg-last-stop':12}[k],
  h:{'tg-loj-hall':6,'tg-signal-box':3,'tg-carriage-house':5.4,'tg-dark-beds':3.2,'tg-cistern':3.6,'tg-bath':3.2,'tg-fan-house':4.4,'tg-doors':5,'tg-night-mouth':3,'tg-last-stop':3}[k]});
 const civ=(id,key,way,s,side,x)=>Object.assign({id,key,way,s,side,at:'wall'},B(key),x||{});
 return {id:LT.id,world:o.world==null?LT.world:o.world,decks:LT.DECKS,
  /* the hall: carved by the page (the Line's lining, its vault): prim none here, its box for the rock rule's joins */
  spaces:[{id:'lt.hall',kind:'platform',x:(P.x0+P.x1)/2,y:P.invert,z:0,w:P.x1-P.x0,d:P.z1-P.z0,h:P.crown,deck:0,prim:'room'}],
  spine:{id:'lt.pn',pts:[[3,y,-7.75],[150,y,-7.75]],w:6.5,h:7,deck:0,kind:'gallery',prim:'none',space:'lt.hall'},
  spines:[{id:'lt.ps',pts:[[3,y,7.75],[150,y,7.75]],w:6.5,h:7,deck:0,kind:'gallery',prim:'none',space:'lt.hall'}],
  /* the concourse across the buffers' end: from the north platform's end east, across, and back to the south's */
  links:[{id:'lt.concourse',kind:'passage',a:'lt.pn:b',b:'lt.ps:b',pts:[[150,y,-7.75],[155,y,-7.75],[155,y,7.75],[150,y,7.75]],w:4,h:6,deck:0,prim:'none',joins:['lt.hall']}],
  sidings:[
   /* the north side: the quiet deck's homes up a ramp (cream over red), the carriage siding on the Line deck, more homes up a stair (cream over green) */
   {id:'lt.n1',at:24,side:-1,len:58,deck:1,drop:'ramp',band:'cream-red',district:'homes-west',w:3,h:2.9},
   {id:'lt.n2',at:66,side:-1,len:34,deck:0,band:'red',district:'carriages',w:3.6,h:5.6},
   {id:'lt.n3',at:112,side:-1,len:52,deck:1,drop:'stair',band:'cream-green',district:'homes-east',w:3,h:2.9},
   /* the south side: the work deck down a stair (plain red), the old siding of the last stop on the Line deck, a third homes siding up a ramp */
   {id:'lt.s1',from:'lt.ps',at:30,side:1,len:62,deck:-1,drop:'stair',band:'red',district:'works',w:3.4,h:3.6},
   {id:'lt.s2',from:'lt.ps',at:80,side:1,len:40,deck:0,band:'red',district:'old end',w:3,h:2.9},
   {id:'lt.s3',from:'lt.ps',at:118,side:1,len:46,deck:1,drop:'ramp',band:'cream-red',district:'homes-south',w:3,h:2.9}],
  civic:[
   /* on the Line deck: the doors across the hall's mouth (their guard cut in the south wall), the signal box by them, the loj hall
      at the buffers' end facing down the hall (the landmark: PLAN.md 5.4) */
   civ('lt.doors','tg-doors','lt.ps',4.5,1,{span:22,h:9}),civ('lt.signal-box','tg-signal-box','lt.pn',10,-1),
   civ('lt.loj-hall','tg-loj-hall','lt.concourse',12.75,-1,{loj:20}),
   /* the carriage siding: two carriage houses facing across it */
   civ('lt.carriage-a','tg-carriage-house','lt.n2',17,-1,{num:301}),civ('lt.carriage-b','tg-carriage-house','lt.n2',17,1,{num:302}),
   /* the work deck: two dark beds, the cistern, the fan house, the bath */
   civ('lt.beds-a','tg-dark-beds','lt.s1',10,-1),civ('lt.beds-b','tg-dark-beds','lt.s1',26,-1),civ('lt.cistern','tg-cistern','lt.s1',8,1),
   civ('lt.fan-house','tg-fan-house','lt.s1',20,1),civ('lt.bath','tg-bath','lt.s1',32,1),civ('lt.beds-c','tg-dark-beds','lt.s1',44,1),
   /* the old end: the last stop sealed at the siding's end; the night mouth climbing from the end of the east homes */
   civ('lt.last-stop','tg-last-stop','lt.s2',33,-1),civ('lt.night-mouth','tg-night-mouth','lt.n3',48,1)],
  fill:[{way:'lt.n1',defs:LT.HOMES,salt:1},{way:'lt.n3',defs:LT.HOMES,salt:3,to:44},{way:'lt.s3',defs:LT.HOMES,salt:5},
   {way:'lt.s2',defs:[LT.HOMES[1]],salt:7,to:26},{way:'lt.s1',defs:[LT.HOMES[1]],sides:[-1],salt:9,from:34}],
  /* wealth from the loj hall's end; the hold has moved east with its heat over the centuries: its west and old ends worn */
  hub:'lt.pn:b',reach:260,heart:'lt.pn:b',worn:160,abandoned:212,
  /* the works, the gate and the box are kept whatever their distance: the hold's work and its doors never go to ruin (edits by id) */
  edits:LT.KEEP.map(id=>({id,op:'set',fields:{state:'kept'}})).concat(o.edits||[])};};
LT.KEEP=['lt.doors','lt.signal-box','lt.beds-a','lt.beds-b','lt.beds-c','lt.cistern','lt.fan-house','lt.bath'];
LT.plan=function(o){if(LT.H&&!o)return LT.H;const H=KCITY.cavern.lineHold(LT.spec(o));
 /* the berth numbers: each home a number by its siding and slot (the Line's count: the hold is 20, its berths 2xx) */
 let n=200;for(const s of H.sites)if(s.key==='tg-set'||s.key==='tg-cut'){s.num=n;n+=s.key==='tg-set'?2:1;}
 if(!o)LT.H=H;return H;};
LT.audit=function(H){return KCITY.cavern.audit(H||LT.plan());};
