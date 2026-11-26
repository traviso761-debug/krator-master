// ================================================================= UNDERGROUND TEST — the world: a small hold on KCAVERN  [G data]
// A test bed for core/host's underground pieces (core/host/UNDERGROUND.md), not a place: a hold in three decks 4.5 m apart (the
// Tungang plan's section 6.4 rule), a gallery on the lowest (8 m wide, the Line's section scaled down), stairs in from the side, a
// lift shaft to the surface 60 m up, a natural hall at the gallery's end (the crystal cave's case: no decks), a narrow way of 1.6 m
// (no room for a boom: first person), rock pillars in the hall, built crates (KWALK blocks) and ropes (blocks tagged thin).
// Axes: y up, x east, z south, metres. Plain data and KCAVERN calls: no THREE.
const UG={SURF:60,DECKS:[{y0:-1,y1:3.5,name:'Platform',y:0},{y0:3.5,y1:8,name:'Loj hall',y:4.5},{y0:8,y1:13,name:'Sets',y:9}],
 HALL:{c:[96,0,0],rx:18,rz:14,h:12},SHAFT:{c:[25,-9],r:2.6}};
const UGC=KCAVERN.create({ground:()=>UG.SURF,cell:.5,chunk:16,seed:61,walk:KWALK,minRock:.8});
(function(){const C=UGC,D=UG.DECKS;
 /* deck 0: the gallery, west to east, and on into the hall */
 C.tube({id:'gallery',pts:[[-70,0,0],[0,0,0],[86,0,0]],w:8,h:5.2,rock:'basalt'});
 C.hall({id:'hall',c:UG.HALL.c,rx:UG.HALL.rx,rz:UG.HALL.rz,h:UG.HALL.h});
 /* deck 1: the loj hall (a public way, 3.2 m clear) and a store off it */
 C.room({id:'loj',poly:[[-35,6],[20,6],[20,16],[-35,16]],y:D[1].y,h:3.2,ceil:'flat',r:.6,finish:'hewn'});
 C.room({id:'store',poly:[[-20,-16],[-5,-16],[-5,-6],[-20,-6]],y:D[1].y,h:2.6,ceil:'flat',r:.4,finish:'hewn'});
 /* deck 2: the sets (homes), offset in plan so the stair comes in from the side */
 C.room({id:'sets',poly:[[-10,18],[15,18],[15,27],[-10,27]],y:D[2].y,h:2.6,ceil:'flat',r:.4,finish:'plaster'});
 /* the narrow way off the sets: 1.6 m wide, 2.2 m high (first person only) */
 C.tube({id:'narrow',pts:[[15,9,22.5],[45,9,22.5],[52,9,30]],w:1.6,h:2.2,blend:.6});
 /* stairs, each in from the side: gallery to the loj hall, the loj hall to the sets, the gallery to the store */
 C.stair({id:'st.01',a:[-30,0,2.4],b:[-30,D[1].y,8],w:2,h:2.6});
 C.stair({id:'st.12',a:[5,D[1].y,13],b:[5,D[2].y,20],w:1.8,h:2.5});
 C.stair({id:'st.0s',a:[-12,0,-2.4],b:[-12,D[1].y,-8],w:2,h:2.6});
 /* the lift shaft from the gallery's side to the surface, and its head */
 C.shaft({id:'shaft',c:UG.SHAFT.c,y0:0,y1:UG.SURF+2,r0:UG.SHAFT.r,r1:UG.SHAFT.r});
 C.room({id:'shaftfoot',poly:[[19,-12],[31,-12],[31,-3],[19,-3]],y:0,h:3.4,ceil:'flat',r:.4});
 C.opening({id:'shafthead',c:UG.SHAFT.c,r:UG.SHAFT.r,kind:'well'});
 /* rock left standing in the hall: pillars the follow camera meets */
 [[88,-6],[101,5],[94,9],[106,-5]].forEach((p,i)=>C.monolith({id:'pillar'+i,poly:[[p[0]-1.2,p[1]-1.2],[p[0]+1.2,p[1]-1.2],[p[0]+1.2,p[1]+1.2],[p[0]-1.2,p[1]+1.2]],y0:-.2,y1:13,taper:.15}));
 C.build();})();
/* built things on the floors: crates (solid to the camera) and ropes (thin: never shorten the arm, they dither out) */
UG.PROPS=[];
(function(){const P=UG.PROPS,add=(kind,deck,x,y,z,w,h,d,tag)=>{const b=[x-w/2,x+w/2,z-d/2,z+d/2,y,y+h];P.push({kind,deck,x,y,z,w,h,d,tag});KWALK.block(b,tag);};
 add('crate',0,-40,0,-2.5,1.6,1.4,1.6,'crate');add('crate',0,-44,0,-2.6,1.2,1,1.2,'crate');add('crate',0,40,0,2.8,2,1.6,1.4,'crate');
 add('table',1,-8,4.5,11,2.4,.8,1.2,'table');add('table',1,8,4.5,9,2,.8,1,'table');add('bench',1,-20,4.5,14,3,.45,.5,'bench');
 add('crate',1,-16,4.5,-12,1.4,1.2,1.4,'crate');
 add('bed',2,-6,9,25,2,.5,1,'bed');add('bed',2,8,9,25,2,.5,1,'bed');add('table',2,2,9,21,1.6,.8,.9,'table');
 for(let i=0;i<5;i++)add('rope',null,58+i*6,.2,(i%2?1.2:-1.2),.06,4.8,.06,'rope thin');
 [[92,-1],[99,-7],[102,1]].forEach(p=>add('rope',null,p[0],0,p[1],.08,11.5,.08,'rope thin'));})();
/* the line map: the hold as stations on the Line, depth down the page */
UG.LINE={title:'The test hold, as a line map',lines:{gallery:'#4fb06a',stair:'#d4aa5a',shaft:'#e8e8e8',narrow:'#c24a3a'},
 nodes:[{id:'head',name:'shaft head',kind:'lift',x:25,depth:-60},{id:'foot',name:'shaft foot',kind:'junction',x:25,depth:0},
  {id:'west',name:'west platform',kind:'station',x:-60,depth:0},{id:'mid',name:'the hold',kind:'station',x:0,depth:0},{id:'hall',name:'the hall',kind:'station',x:96,depth:0},
  {id:'loj',name:'loj hall',kind:'loj',x:-10,depth:-4.5},{id:'sets',name:'sets',kind:'loj',x:2,depth:-9},{id:'end',name:'the narrow end',kind:'gap',x:52,depth:-9}],
 edges:[{a:'head',b:'foot',line:'shaft'},{a:'west',b:'mid',line:'gallery'},{a:'mid',b:'foot',line:'gallery'},{a:'foot',b:'hall',line:'gallery'},
  {a:'mid',b:'loj',line:'stair'},{a:'loj',b:'sets',line:'stair'},{a:'sets',b:'end',state:'gap',time:2}]};
