// ================================================================= THE HOUSE: larger inside than out, loops, rewiring, depth, a drifting tape
// [G data] PLAN-ANOMALIES.md section 5 ("Space (the House)"), the owner 2026-11-09 ("a House of Leaves style bigger-on-the-inside facility, looping
// corridors"). Babel is the House (PLAN.md 9's themes), and this page is Babel's city. Plain records and pure functions; the host draws them
// (75-host-house.js) and moves the walker by them. Every space is an axis-aligned box in the House's own coordinates, far from the page (o.origin):
// it stands outside the world, so no terrain, LOD or tier reaches it. A THRESHOLD is a doorway LINE (along x or z, over a span of the other) crossed
// in one direction; crossing it moves the walker by the offset that maps that line onto the matching doorway line elsewhere, the eye and the feet
// alike, so the step through a door looks continuous and the walker comes out still moving the same way:
//   the DOOR    a concrete hut 3 m square on the valley's ground (o.door: its centre and ground height), its door to the south; through it
//               northward, the FOYER, 30 x 60 m and 12 m high, through a frame of the same size; back out of that frame southward, the hut's door
//   the LOOP    the corridor north of the foyer, in segments of 12 m: crossing the end of the fourth northward moves the walker one segment back,
//               so it never ends; turning round leads back to the foyer
//   the REWIRE  the east corridor's far door opens on one of three rooms by the visit count (KRAND.hash(seed, visit)): a closet 3 m square, a
//               hall 80 x 120 m and 40 m high, the descent; every room's door leads back to the east corridor
//   the DEPTH   the descent: a ramp falling 0.3 m a metre; crossing its foot moves the walker up 18 m and back 60 m, the same place on the slope,
//               and counts a level: it has no bottom
//   the TAPE    the west hallway, a dead end, is `drift` metres longer for each visit to the House (o.visits, the host's count)
//   AV.house(o) -> H      o {origin:[x, y, z], door:{x, z, y}, seed, visits (0..), drift (m a visit, .04)}
//   AV.houseFloor(H, x, z) -> the floor's height there, or null outside the House's spaces
//   AV.houseCross(H, a, b, st) -> null | {id, d:[dx, dy, dz], room?}   the threshold the move a -> b ([x, y, z]) crosses and its offset; st
//                         {visit, depth, inside} is the walker's state, which a crossing updates (otherwise pure)
(function(){
 const box=(id,x0,x1,z0,z1,y,h,kind,o)=>Object.assign({id,x0,x1,z0,z1,y,h,kind},o||{});
 AV.house=function(o){const O=o.origin,X=O[0],Y=O[1],Z=O[2],D=o.door,seed=o.seed|0,drift=o.drift==null?.04:o.drift,visits=o.visits|0;
  const SEG=12,NSEG=7,L0=60,tape=18+drift*visits,DZ=Z+30;   /* the loop's segment, how many are drawn, where it starts; the tape's length; the east-west doors' z */
  const S=[
   box('hut',D.x-1.5,D.x+1.5,D.z-1.5,D.z+1.5,D.y,3.2,'hut',{doors:[{side:'s',a:D.x-.6,b:D.x+.6,h:2.3}],world:true}),
   box('foyer',X-15,X+15,Z,Z+60,Y,12,'foyer',{doors:[{side:'s',a:X-.6,b:X+.6,h:2.3},{side:'n',a:X-2,b:X+2,h:3.6},{side:'e',a:DZ-2,b:DZ+2,h:3.6},{side:'w',a:DZ-2,b:DZ+2,h:3.6}],name:'the foyer'}),
   box('loop',X-2,X+2,Z+L0,Z+L0+SEG*NSEG,Y,3.6,'loop',{doors:[{side:'s',a:X-2,b:X+2,h:3.6}],seg:SEG,nseg:NSEG,name:'the north corridor'}),
   box('east',X+15,X+35,DZ-2,DZ+2,Y,3.6,'corridor',{doors:[{side:'w',a:DZ-2,b:DZ+2,h:3.6},{side:'e',a:DZ-.6,b:DZ+.6,h:2.3}],name:'the east corridor'}),
   box('tape',X-15-tape,X-15,DZ-2,DZ+2,Y,3.6,'tape',{doors:[{side:'e',a:DZ-2,b:DZ+2,h:3.6}],length:tape,name:'the west hallway'}),
   box('closet',X+200,X+203,DZ-1.5,DZ+1.5,Y,2.6,'room',{doors:[{side:'w',a:DZ-.6,b:DZ+.6,h:2.3}],name:'a closet'}),
   box('hall',X+400,X+480,DZ-60,DZ+60,Y,40,'room',{doors:[{side:'w',a:DZ-.6,b:DZ+.6,h:2.3}],name:'a hall too large to see across'}),
   box('descent',X+600,X+604,DZ-2,DZ+78,Y,4,'descent',{doors:[{side:'w',a:DZ-.6,b:DZ+.6,h:2.3}],slope:.3,flat:4,name:'the descent'})];
  /* the thresholds: a doorway line (axis 0: x = at, its span along z; axis 2: z = at, its span along x), the direction it is crossed in, the line
     it maps onto (to) or the rooms it opens on */
  const T=[
   {id:'in',axis:2,at:D.z-1.5,lo:D.x-.6,hi:D.x+.6,sign:1,d:[X-D.x,Y-D.y,Z-(D.z-1.5)]},
   {id:'out',axis:2,at:Z,lo:X-.6,hi:X+.6,sign:-1,d:[D.x-X,D.y-Y,(D.z-1.5)-Z]},
   {id:'loop',axis:2,at:Z+L0+SEG*4,lo:X-2,hi:X+2,sign:1,d:[0,0,-SEG]},
   {id:'rewire',axis:0,at:X+35,lo:DZ-.6,hi:DZ+.6,sign:1,rooms:['closet','hall','descent']},
   {id:'back',axis:0,lo:DZ-.6,hi:DZ+.6,sign:-1,rooms:['closet','hall','descent']},
   {id:'level',axis:2,at:DZ+74,lo:X+600,hi:X+604,sign:1,d:[0,18,-60],level:true}];
  const H={origin:O,door:D,seed,spaces:S,thresholds:T,seg:SEG,nseg:NSEG,tape,visits,drift,doorZ:DZ};
  H.space=id=>S.find(s=>s.id===id);
  return H;};
 AV.houseFloor=function(H,x,z){for(const s of H.spaces){if(s.world)continue;if(x<s.x0||x>s.x1||z<s.z0||z>s.z1)continue;
  if(s.kind==='descent')return s.y-Math.max(0,z-(s.z0+s.flat))*s.slope;return s.y;}return null;};
 /* the move a -> b crosses line `at` on axis `ax` going `sign`, inside the span */
 const crosses=(a,b,ax,at,sign,lo,hi)=>{const o=ax===2?0:2;if(b[o]<lo||b[o]>hi)return false;return sign>0?(a[ax]<at&&b[ax]>=at):(a[ax]>at&&b[ax]<=at);};
 AV.houseCross=function(H,a,b,st){
  for(const t of H.thresholds){
   if(t.id==='back'){for(const id of t.rooms){const s=H.space(id);if(crosses(a,b,0,s.x0,-1,t.lo,t.hi)){const e=H.space('east');return{id:'back',d:[e.x1-s.x0,e.y-s.y,0],room:'east'};}}continue;}
   if(!crosses(a,b,t.axis,t.at,t.sign,t.lo,t.hi))continue;
   if(t.rooms){const v=st.visit=(st.visit|0)+1,id=t.rooms[KRAND.hash(H.seed,v,17,0)%t.rooms.length],s=H.space(id),e=H.space('east');return{id:t.id,d:[s.x0-e.x1,s.y-e.y,0],room:id};}
   if(t.level)st.depth=(st.depth|0)+1;if(t.id==='in')st.inside=true;if(t.id==='out')st.inside=false;
   return{id:t.id,d:t.d.slice()};}
  return null;};
})();
