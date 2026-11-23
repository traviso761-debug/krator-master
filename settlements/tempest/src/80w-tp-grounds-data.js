// ================================================================= THE HOUSE OF THE TEMPEST — the grounds and the crest, as data (step 4)  [G data]
// The blueprint's sheet T0 (settlements/strongwall/tempest/BLUEPRINT.md: the crest round the House, 1,000 x 800 m) and the open
// grounds inside the curtain (T1), as records in TEMPEST's frame (x across, +z the front: from the blueprint's u, v by
// TEMPEST.fromBlueprint). The page tints its ground by them and draws their pieces on the drawn ground (targets/house/90s); the
// rules are plain functions on the records, node-tested with the layout (tests/test-tempest.js).
//
//   TP_GROUNDS.fields    [{id, kind, box:[x0,z0,x1,z1], note}]  the crest's ground: the terraces, the tea garden, the hives, the
//                        commons, the Maydan, the paddock, the threshing floors, the middens, the caravan halt, the thorn brake
//   TP_GROUNDS.tracks    [{id, kind, pts:[[x,z],...], w}]       the Strongwall road, the two sally tracks, the horse-archery track
//   TP_GROUNDS.pieces    [{id, kind, at:[x,z], ...}]            what stands on them: the paddock's walls, the byres, the hay barns
//                        and ricks, the tank, the threshing floors, the hives, the caravan halt's shed, the butts, the pells,
//                        the riders' targets
//   TP_GROUNDS.check(P, G)   [] when the grounds keep their rules, else one line per fault
const TP_GROUNDS=(function(){
 'use strict';
 const fb=(u,v)=>TEMPEST.fromBlueprint(u,v);
 const box=(u0,u1,v0,v1)=>{const a=fb(u0,v0),b=fb(u1,v1);return[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];};
 const F=(id,kind,u0,u1,v0,v1,note)=>({id,kind,box:box(u0,u1,v0,v1),note:note||''});
 const fields=[
  F('maydan','maydan',-100,250,130,230,'the riders\' ground before the North Sally Gate'),
  F('paddock','paddock',-420,-200,-360,-140,'the remounts\' walled night paddock'),
  F('byres','byres',-200,-130,-360,-300,'the milking herd, the herdsmen\'s huts'),
  F('tank','tank',-300,-220,-110,-40,'rain off the crest for the herds'),
  F('terraces.w','terraces',190,500,-400,120,'barley on the west flank, open under the Storm Tower'),
  F('terraces.se','terraces',-130,-5,-400,-160),F('terraces.sw','terraces',15,180,-400,-160),
  F('threshing','threshing',140,180,-150,-110),F('tea','tea',260,480,180,380),F('hives','hives',260,320,125,170,'the honey of the sacrament'),
  F('commons','commons',-500,-160,130,400,'the near corner of the commons'),
  F('hay','hay',-190,-140,-250,-160,'the year\'s hay, barns and ricks'),
  F('midden.s','midden',-60,-25,-150,-115),F('midden.n','midden',-70,-35,106,126),
  F('halt','halt',-240,-170,20,80,'the caravan halt before the barbican'),F('brake','brake',160,182,-42,-12,'the Founder\'s Way comes out here')];
 const T=(id,kind,w,pts)=>({id,kind,w,pts:pts.map(p=>fb(p[0],p[1]))});
 const tracks=[T('road.strongwall','road',6,[[-500,-150],[-300,-140],[-200,-90],[-162,-30]]),
  T('track.sally.n','track',4,[[-16,101],[0,230],[160,400]]),T('track.sally.s','track',4,[[-16,-101],[5,-140],[5,-400]]),
  T('track.archery','riding',3,[[-60,218],[240,218]])];
 /* the pieces: each at a point of the plan's frame, drawn by 90s on the drawn ground */
 const pieces=[],P=(id,kind,u,v,o)=>pieces.push(Object.assign({id,kind,at:fb(u,v)},o||{}));
 {const b=fields.find(f=>f.id==='paddock').box;pieces.push({id:'paddock.walls',kind:'walls',box:b,gate:'east',h:1.3});}   /* dry stone, its gate toward the House */
 P('byres.shed.a','shed',-180,-345,{w:30,d:9,h:3.4,ry:0});P('byres.shed.b','shed',-150,-315,{w:22,d:8,h:3.2,ry:0});
 for(let i=0;i<3;i++)P('hay.barn.'+i,'shed',-175,-235+i*28,{w:26,d:12,h:5,ry:0});
 for(let i=0;i<6;i++)P('hay.rick.'+i,'rick',-150,-245+i*14,{r:3.2,h:5});
 P('tank','tank',-260,-75,{w:70,d:58,depth:2.5});
 P('threshing.a','floor',151,-139,{r:9});P('threshing.b','floor',169,-121,{r:9});
 for(let i=0;i<10;i++)P('hive.'+i,'hive',268+(i%5)*11,136+Math.floor(i/5)*16,{});
 P('halt.shed','shed',-205,50,{w:34,d:10,h:3.6,ry:0});
 for(let i=0;i<4;i++)P('butt.'+i,'butt',74,-72+i*4.5,{});   /* the range's butts, shot at from its east end (T1 40, its stop bank behind) */
 for(let i=0;i<6;i++)P('pell.'+i,'pell',72+(i%3)*14,-20+Math.floor(i/3)*40,{});   /* the drill court's pells */
 for(let i=0;i<3;i++)P('target.'+i,'target',-20+i*100,222,{});   /* the horse-archery track's three targets (sheet T0) */
 /* ---------------------------------------------------------------- the rules */
 const inBox=(p,b,m)=>p[0]>=b[0]-(m||0)&&p[0]<=b[2]+(m||0)&&p[1]>=b[1]-(m||0)&&p[1]<=b[3]+(m||0);
 const ov=(p,q)=>Math.min(p[2],q[2])-Math.max(p[0],q[0])>.1&&Math.min(p[3],q[3])-Math.max(p[1],q[1])>.1;
 const RULES={
  'the crest\'s grounds lie outside the curtain':(Pl,G)=>{const O=Pl.wards.find(w=>w.id==='outer').poly,xs=O.map(p=>p[0]),zs=O.map(p=>p[1]),ob=[Math.min(...xs)-8,Math.min(...zs)-8,Math.max(...xs)+8,Math.max(...zs)+8];
   const bb=Pl.barbican,barb=[bb.at[0]-bb.w/2-4,bb.at[1]-bb.d/2,bb.at[0]+bb.w/2+4,bb.at[1]+bb.d/2+4];
   return G.fields.filter(f=>ov(f.box,ob)||ov(f.box,barb)).map(f=>f.id+' within the curtain or the barbican');},
  'no two of the crest\'s grounds overlap':(Pl,G)=>{const out=[];G.fields.forEach((f,i)=>G.fields.forEach((g,j)=>{if(j>i&&ov(f.box,g.box))out.push(f.id+' overlaps '+g.id);}));return out;},
  'the sally tracks leave from the sally gates':(Pl,G)=>['n','s'].filter(s=>{const g=Pl.gates.find(q=>q.id==='gate.sally.'+s),t=G.tracks.find(q=>q.id==='track.sally.'+s);return!g||!t||Math.hypot(t.pts[0][0]-g.at[0],t.pts[0][1]-g.at[1])>12;}).map(s=>'the '+s+' sally track does not start at its gate'),
  'the road reaches the barbican':(Pl,G)=>{const r=G.tracks.find(q=>q.id==='road.strongwall'),b=Pl.barbican,e=r.pts[r.pts.length-1];return Math.hypot(e[0]-(b.at[0]-b.w/2),e[1]-b.at[1])>20?['the Strongwall road ends '+Math.round(Math.hypot(e[0]-(b.at[0]-b.w/2),e[1]-b.at[1]))+' m from the barbican\'s south side']:[];},
  'every piece stands in its ground':(Pl,G)=>{const home={shed:['byres','hay','halt'],rick:['hay'],tank:['tank'],floor:['threshing','terraces.se','terraces.sw','terraces.w'],hive:['hives','commons','maydan'],target:['maydan']},
   area=id=>(G.fields.find(f=>f.id===id)||{}).box,inside=a=>Pl.areas.find(x=>x.id===a).box,out=[];
   G.pieces.forEach(p=>{if(p.kind==='walls'||p.kind==='butt'||p.kind==='pell'){const b=p.kind==='walls'?null:inside(p.kind==='butt'?'archery':'drill');if(b&&!inBox(p.at,b,4))out.push(p.id+' outside the '+(p.kind==='butt'?'range':'drill court'));return;}
    const hs=home[p.kind]||[];if(!hs.some(h=>area(h)&&inBox(p.at,area(h),2)))out.push(p.id+' outside '+hs.join(' or '));});return out;}};
 function check(Pl,G){const out=[];for(const k in RULES)RULES[k](Pl,G||this).forEach(f=>out.push(k+': '+f));return out;}
 const G={fields,tracks,pieces,RULES};G.check=(Pl,Gx)=>check(Pl,Gx||G);return G;})();
if(typeof module!=='undefined')module.exports=TP_GROUNDS;
