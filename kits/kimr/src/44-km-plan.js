// prefix: km
// ================================================================= THE KIMR HOUSE: its plan and dress, as records (KIMR.md section 3, LORE.md 6.24)
// A clan's pueblo on its rock (the owner, 2026-11-11: "grab the pueblo builder and build me an example house"). The room
// blocks are core/pueblo's (KPUEBLO.house: a U of stepped blocks round a yard open to the front, the matrilineal house's rooms,
// stores below and homes above, the hero's rooms on the back block's top terrace, doors onto terraces, roof hatches, ladders,
// the reach graph). core/pueblo has no platform yet (its README: "a spec field for a platform under the blocks is the expected
// addition"), so the ROCK is this kit's record: a battered plinth under the blocks, 7-10 m high; the blocks stand on its top
// (their y 0), and everything the Kimr keep below it is dress here:
//   rock      the plinth: the blocks' box and a margin (a ledge on three sides, the landing in front), its height and batter
//   entries   the long ladders from the floor up the rock's front face (pulled up at night; KIMR.md rule 3)
//   round     the round room (the kiva's place) below the rock, half sunk, roofed with a glyptodont's shell
//   pen       the walled pen (korl) of stacked mammoth bones, its gate to the front
//   dung      the dung-cake walls stacked against the rock's foot
//   crest     the Aurochs skull on its post on the hero's roof, facing the front (the gate, east, in the Labyrinth)
//   ribs      mammoth ribs set upright in the outer parapets: the spiked palisade (KIMR.md rule 7)
//   hands     ochre hand-prints by the doors, one for each child born in the room (KIMR.md, "Painting")
//   racks     drying racks of pole and bone on two terraces, hung with hide and meat
// Plain data ([G data]): KRAND and core/pueblo only, no three.js. Every draw is KRAND.hash(world, a, b, salt).
const KM_HOUSE={
 /* the example house: a U, its yard 12 x 10 m open to the front; the back block three rows deep stepping up to four storeys,
    the side blocks two rows; no kivas on the yard (the round room is below the rock), no stockade (the rock is the wall) */
 spec(v){v=v|0;return {id:'kimr-house'+v,world:21100+v,shape:'U',pw:12+(v%3)*2,pd:10,rows:3,sideRows:2,maxStoreys:4,ragged:.06,people:2.2,popMax:400,
  kivas:{great:[],small:0},ladderEvery:3};},
 cache:{}};
function kmPlan(spec){const k=spec.id+':'+spec.world;return KM_HOUSE.cache[k]||(KM_HOUSE.cache[k]=KPUEBLO.house(spec));}
function kmU(P,a,b,salt){return KRAND.unit(KRAND.hash(P.world,a|0,b|0,salt|0));}
/* the edge of cell c on its side ('front' ...): {a, b, m (midpoint), n (outward normal), L, ry (the yaw whose +z is n)} */
function kmEdge(c,side){const e=KPUEBLO.edgeOf(c,side),n=KPUEBLO.outN(e[0],e[1],[c.cx,c.cz]),L=Math.hypot(e[1][0]-e[0][0],e[1][1]-e[0][1]);
 return {a:e[0],b:e[1],m:[(e[0][0]+e[1][0])/2,(e[0][1]+e[1][1])/2],n,L,ry:Math.atan2(n[0],n[1])};}
/* ---------------------------------------------------------------- the site: the rock and everything below it */
/* o.rock (a world's own rock, 2026-11-12: biomes/labyrinth's Mesas stands the house on a knob of the chaos): any of {x0, x1, z0,
   z1 (its top edge in the plan's frame), h (its top over the floor in front), batter (its foot's run over h), drawn} over the
   kit's; drawn false: the world draws the rock (kmBuild draws no plinth), the dress below it stands on the floor past its foot */
function kmSite(P,o){const B=P.bounds,h=P.storey,u=(a,b,s)=>kmU(P,a,b,s);
 /* the rock: a ledge of 2.5 m round the blocks, a 6 m landing in front of the yard; 7 to 10 m high, battered 12 degrees */
 const rock=Object.assign({x0:B.x0-2.5,x1:B.x1+2.5,z0:B.z0-2.5,z1:B.z1+6,h:+(7+u(1,1,31)*3).toFixed(2),batter:.21},o&&o.rock||{});
 const foot=rock.h*rock.batter;   /* the batter's run: the rock's foot stands this far out from its top edge */
 const S={rock,entries:[],round:null,pen:null,dung:[],crest:[],ribs:[],hands:[],racks:[]};
 /* two long ladders up the front face, either side of the landing's middle; their feet on the floor */
 for(const s of [-1,1]){const x=s*Math.min(3.2,(rock.x1-rock.x0)/4);S.entries.push({id:P.id+':entry:'+(s<0?'w':'e'),x,z:rock.z1+foot+.6,y0:-rock.h,y1:0,ry:0});}
 /* the round room: below the rock's front-left corner, clear of the batter and the ladders */
 const rr=2.8;S.round={id:P.id+':round',x:rock.x0+rr+1.2,z:rock.z1+foot+rr+3.4,r:rr,depth:1.6,wall:.9,y:-rock.h};
 /* the pen: below the front-right corner, 11 x 8 m, its gate to the front */
 const pw=11,pd=8;S.pen={id:P.id+':pen',x0:rock.x1-pw,x1:rock.x1,z0:rock.z1+foot+2.2,z1:rock.z1+foot+2.2+pd,gate:{x:rock.x1-pw/2,w:2.6},y:-rock.h};
 /* the dung walls against the rock's foot: a run on each side face, 4 to 7 m long */
 for(const s of [-1,1]){const L=4+u(s+5,2,32)*3,zc=(rock.z0+rock.z1)/2+(u(s+5,3,32)-.5)*4;
  S.dung.push({id:P.id+':dung:'+(s<0?'w':'e'),x:s<0?rock.x0-foot-.5:rock.x1+foot+.5,z:zc,L:+L.toFixed(2),h:+(1.1+u(s+5,4,32)*.5).toFixed(2),ry:Math.PI/2,y:-rock.h});}
 /* the crest: on the hero's middle roof, near its front edge, facing the front */
 const heroes=P.cells.filter(c=>c.hero);
 if(heroes.length){const c=heroes.slice().sort((a,b)=>Math.abs(a.t/a.len-.5)-Math.abs(b.t/b.len-.5))[0],E=kmEdge(c,'front');
  S.crest.push({id:c.id+':crest',x:E.m[0]-E.n[0]*.9,z:E.m[1]-E.n[1]*.9,y:c.storeys*h,ry:E.ry,post:2.4,span:2.2});}
 /* the ribs: every outer face over two storeys (no cell behind it, or beside it on a side block's outer side), a rib every 1.1 m */
 P.cells.forEach(c=>{for(const side of ['back','left','right']){if(c.nb[side])continue;const E=kmEdge(c,side);
  /* only the faces that look outward from the house (away from its middle), not the yard's */
  if(E.n[0]*E.m[0]+E.n[1]*E.m[1]<0||c.storeys<2)continue;const n=Math.max(2,Math.floor(E.L/1.1));
  S.ribs.push({id:c.id+':ribs:'+side,cell:c.id,side,x:E.m[0],z:E.m[1],ry:E.ry,L:+E.L.toFixed(3),y:c.storeys*h+.45,n});}});
 /* the hand-prints: by each door, as many as the children born in the room (0 to 4) */
 P.rooms.filter(r=>r.face==='door').forEach((r,i)=>{const k=Math.floor(kmU(P,i,7,33)*5);if(k)S.hands.push({id:r.id+':hands',room:r.id,n:k,seed:i});});
 /* the drying racks: on the two lowest terraces of the back block with a taller cell behind them */
 P.cells.filter(c=>c.block==='back'&&c.nb.back&&P.byId[c.nb.back].storeys>c.storeys).sort((a,b)=>a.storeys-b.storeys||kmU(P,a.seg,1,34)-kmU(P,b.seg,1,34)).slice(0,2)
  .forEach(c=>S.racks.push({id:c.id+':rack',x:c.cx,z:c.cz,y:c.storeys*h,ry:Math.atan2(c.n[0],c.n[1])+Math.PI/2,L:Math.min(2.8,(P.along==null?4.2:P.along)*.7)}));
 /* the whole site's box, and the offset that puts its middle at the def's origin */
 const x0=Math.min(rock.x0-foot-1.6,S.round.x-rr-1),x1=Math.max(rock.x1+foot+1.6,S.pen.x1+.5),z0=rock.z0-foot-1,z1=Math.max(S.round.z+rr+1,S.pen.z1+.6);
 const top=P.bounds.h+.45+(S.crest.length?S.crest[0].post+1.2:0);
 S.box={w:+(x1-x0).toFixed(2),d:+(z1-z0).toFixed(2),h:+(rock.h+top).toFixed(2)};S.off=[-(x0+x1)/2,-(z0+z1)/2];
 return S;}
KM.spec=KM_HOUSE;KM.plan=v=>kmPlan(KM_HOUSE.spec(v));KM.site=kmSite;   /* KM.site(P, {rock}) */
