// ================================================================= STATION caverns — the karst under the limestone ridge: its plan (KKARST)
// The owner, 2026-11-03: limestone caverns in the SW highlands, "maybe a new station" (HANDOFF-REBUILD.md). biomes/KARST-SITES-5.1.md
// site 2, the ring folds: branchwork in the limestone ridges, the river cave the system's spring, a sinkhole chain on the ridge's up-dip
// side and in the soft valley beyond it, one older dry level left when the rivers cut the water gaps down. This station is station 1's
// ground (the ring folds) with the cave under it: the limestone ridge (RB, x ~1300), the river cave at its west foot (the KCARVE alcove),
// the gorge falling through its natural bridges into the sink, the east strike valley beyond the crest.
// src/45-host-stage.js calls SWHI_STATION_GROUND once the courses are laid and before the ground is baked; the ground it bakes reads the
// surface this returns (the sinks' dolines on KRELIEF) and its mask keeps the flora out of the wells. The drawing is 89x-host-caverns.js.
// No THREE here: records only.
//
//   the network   KKARST.network on the site's call: level G - 6, table G - 3 (G the river cave's floor: the spring's ground), the old
//                 level at G + 55, joints along the fold axis (the ridges run north-south) 40 m apart, sinks every 140 m (p .6),
//                 w 3-8, h 2.5-6, canyons 1.5-5 m, chambers p .2 (8-18 m, 5-12 m high), thin 10. GRADIENT .008, not the site's .02: at
//                 .02 the main level rose 30 m over the 1.5 km to the east valley and broke out under its floor (its floor stands only
//                 ~25 m over the spring's ground); the gorge's falls carry the steep part
//   the box       from the gorge's sink and the river cave east under the ridge to the east fold's foot: x 760 .. 2340, z -1500 .. 260
//   the spring    the RESURGENCE IS THE RIVER CAVE (station 1's mouth): the network's spring node a few metres behind the alcove's
//                 back, under its floor, and a sump riser up to under the floor at the back: the water boils up through the
//                 gravel there (a vauclusian spring) and runs out as the cave stream station 1 already draws. No door: the alcove
//                 is the mouth
//   the sinks     kept only on the ridge's up-dip (east) side and in the east valley, off the courses, the gorge, the bite, the
//                 farm and steep ground; a dropped sink's dead-end passages are pruned back to the junction it fed. Each kept sink
//                 is a doline (a bowl, KRELIEF 'doline'), its swallet choked under the soil (no well)
//   the old level cropped to rock: a passage of the old level with less than 12 m of rock over it is dropped, and the largest piece
//                 left is joined to the main level by a shaft (its node nearest a main-level node)
//   the gorge     the gorge stream's sink (station 1's still pool) drains in: a shaft from under its bed down to a passage that
//                 joins the nearest node of the network
//   skylights     a chamber whose roof is thin is a CENOTE (KKARST's own: a doline and a well); and the two dry chambers with the
//                 least rock over them (12-60 m) get a SKYLIGHT: a shaft from the crown to the ground and a well (refs/30, the
//                 river cave's roof holed by skylights). Every well cuts the page's ground (89x) and keeps the flora out (mask)
// Every number is the site's or the page's own; nothing draws a random number but KKARST (KRAND).
var SWHI_STATION_GROUND=function(P){
 if(typeof KKARST==='undefined'||typeof KRELIEF==='undefined')return null;
 const t0=performance.now(),W=P.WORLD^0x4A57,g1=P.g1,CV=P.CAVE,BOX=[760,-1500,2340,260];
 const mix=(a,b,t)=>a+(b-a)*t;
 // the river cave: its alcove opens west (n [-1, 0]); its back is depth metres in, at the floor CV.floorY
 const back=[CV.c[0]-CV.n[0]*CV.depth,CV.c[1]-CV.n[1]*CV.depth],G=CV.floorY;
 const spring=[back[0]+10,back[1]];
 const CALL={box:BOX,ground:g1,kind:'branch',table:G-3,joints:{angle:.04,sp:40},spring,sinks:{cell:140,p:.6},gradient:.008,w:[3,8],h:[2.5,6],canyon:[1.5,5],
  chamber:{p:.2,r:[8,18],h:[5,12]},thin:10};
 const N=KKARST.network(Object.assign({},CALL,{world:W,level:G-6}));
 /* THE OLD LEVEL is its own network (the same call at G + 55, its own world), its ids prefixed 'old:' and merged in as level 1: KKARST's
    `levels` names every level's sinks 'sink:i,j' alike, so two branch levels clash in KCAVERN (a core fix is owed: KNOWN_ISSUES.md) */
 {const O=KKARST.network(Object.assign({},CALL,{world:W+1,level:G+55})),px=s=>s==null?s:'old:'+s;
  O.nodes.forEach(n=>{n.id=px(n.id);n.level=1;N.nodes.push(n);});
  O.passages.forEach(p=>{p.id=px(p.id);p.a=px(p.a);p.b=px(p.b);p.level=1;p.section=p.section==='sump'?'phreatic':p.section;p.stream=false;N.passages.push(p);});   /* dry: its canyons cut when water ran in them */
  O.chambers.forEach(H=>{H.id=px(H.id);H.node=px(H.node);H.flooded=false;N.chambers.push(H);});
  O.sinks.forEach(s=>{s.id=px(s.id);s.node=px(s.node);s.level=1;N.sinks.push(s);});
  O.shafts.forEach(s=>{s.id=px(s.id);if(s.sink)s.sink=px(s.sink);N.shafts.push(s);});
  O.dolines.forEach(D=>{D.id=px(D.id);D.over=px(D.over);N.dolines.push(D);});}
 const add=[];
 let byId={};const reindex=()=>{byId={};N.nodes.forEach(n=>{byId[n.id]=n;});};reindex();
 const slope=(x,z)=>{const e=4;return Math.hypot(g1(x+e,z)-g1(x-e,z),g1(x,z+e)-g1(x,z-e))/(2*e);};
 // ---- off the page's features: the courses and their banks, the gorge, the cave's bite, steep ground (the farm is north of the box)
 const offFeatures=(x,z)=>{if(x<P.TERR.X0+60||x>P.TERR.X1-60||z<P.TERR.Z0+60||z>P.TERR.Z1-60)return false;
  const r=P.streamNear(x,z);if(r&&r.d<r.w+45)return false;
  if(x>700&&x<1300&&z>-1400&&z<-1100)return false;
  {const K=P.GORGE.sink;if(Math.hypot(x-K.x,z-K.z)<K.r+60)return false;}
  if(Math.hypot(x-P.BITE.x,z-P.BITE.z)<P.BITE.r+130)return false;
  return slope(x,z)<.45;};
 const upDip=(x,z)=>x>P.crestX(P.RB,z)-60;
 // ---- the sinks: kept on the up-dip side, off the features; the rest dropped with their dead ends
 const keep={};N.sinks.forEach(s=>{if(upDip(s.x,s.z)&&offFeatures(s.x,s.z))keep[s.id]=1;});
 const dropped=N.sinks.filter(s=>!keep[s.id]).length;
 N.sinks=N.sinks.filter(s=>keep[s.id]);
 N.shafts=N.shafts.filter(s=>!(s.kind==='sink'&&!keep[s.sink]));
 N.dolines=N.dolines.filter(D=>D.form==='bowl'?!!keep[D.over]:offFeatures(D.x,D.z));
 // ---- the old level, cropped to rock (12 m over its crown)
 const roofAt=(x,z,top)=>g1(x,z)-top;
 const deep=p=>{const a=byId[p.a],b=byId[p.b];return [0,.5,1].every(t=>roofAt(mix(a.x,b.x,t),mix(a.z,b.z,t),mix(a.y,b.y,t)+p.h)>12);};
 N.passages=N.passages.filter(p=>p.level===0||deep(p));
 // prune: dead ends no kept sink feeds (leaf nodes, not the spring, not a kept sink's), then nodes no passage reaches
 const sinkNode={};N.sinks.forEach(s=>{sinkNode[s.node]=1;});
 for(let it=0;it<400;it++){const deg={};N.passages.forEach(p=>{deg[p.a]=(deg[p.a]||0)+1;deg[p.b]=(deg[p.b]||0)+1;});
  const leaf=p=>[p.a,p.b].some(id=>deg[id]===1&&id!==N.spring.node&&!sinkNode[id]);const before=N.passages.length;
  N.passages=N.passages.filter(p=>!leaf(p));if(N.passages.length===before)break;}
 // the old level: its largest piece kept, joined to the main level by one shaft
 {const adj={};N.passages.forEach(p=>{if(p.level!==1)return;(adj[p.a]=adj[p.a]||[]).push(p.b);(adj[p.b]=adj[p.b]||[]).push(p.a);});
  const seen={};let best=[];Object.keys(adj).sort().forEach(s=>{if(seen[s])return;const comp=[],q=[s];seen[s]=1;while(q.length){const c=q.shift();comp.push(c);adj[c].forEach(m=>{if(!seen[m]){seen[m]=1;q.push(m);}});}if(comp.length>best.length)best=comp;});
  const inBest={};best.forEach(id=>{inBest[id]=1;});
  N.passages=N.passages.filter(p=>p.level!==1||inBest[p.a]);
  N.shafts=N.shafts.filter(s=>s.kind!=='level');
  N.sinks=N.sinks.filter(s=>s.level!==1||inBest[s.node]);
  const live={};N.passages.forEach(p=>{live[p.a]=1;live[p.b]=1;});live[N.spring.node]=1;
  if(best.length){let pair=null,bd=1e30;best.forEach(id=>{const n=byId[id];N.nodes.forEach(m=>{if(m.level!==0||!live[m.id])return;const d=Math.hypot(n.x-m.x,n.z-m.z);if(d<bd){bd=d;pair=[n,m];}});});
   if(pair){const s={id:'shaft:level1',c:[pair[0].x,pair[0].z],y0:pair[1].y,y1:pair[0].y+.2,r:2.2,kind:'level',from:pair[0].id,to:pair[1].id};N.shafts.push(s);
    /* the shaft stands at the upper node; its foot meets the main level by a short passage when the two are not one above the other */
    if(bd>1.5){const f={id:'sw:level1:foot',x:pair[0].x,y:pair[1].y,z:pair[0].z,level:0,deg:2};N.nodes.push(f);byId[f.id]=f;s.to=f.id;
     const pp={id:'sw:level1:foot:p',a:f.id,b:pair[1].id,level:0,w:3,h:3,section:'phreatic',canyon:0,stream:false,station:'old level'};N.passages.push(pp);add.push(pp);live[f.id]=1;}}}
  N.nodes=N.nodes.filter(n=>live[n.id]);
  const sk={};N.sinks.forEach(s=>{sk[s.id]=1;});N.shafts=N.shafts.filter(s=>s.kind!=='sink'||sk[s.sink]);N.dolines=N.dolines.filter(D=>D.form!=='bowl'||sk[D.over]);
  N.chambers=N.chambers.filter(H=>live[H.node]);N.dolines=N.dolines.filter(D=>D.form!=='cenote'||N.chambers.some(H=>H.id===D.over));}
 reindex();
 // ---- the spring: the network's spring node, and a sump riser up to under the alcove's floor at its back
 const sn=byId[N.spring.node];
 /* the riser's crown 2.8 m under the alcove's floor (the field there is the floor, under the hood): hidden, the water seeping up through the gravel */
 {const top={id:'sw:spring:riser',x:back[0]-3,y:G-5,z:back[1],level:0,deg:1},mid={id:'sw:spring:in',x:back[0]+4,y:G-6,z:back[1],level:0,deg:2};
  [mid,top].forEach(q=>{N.nodes.push(q);byId[q.id]=q;});
  const a={id:'sw:spring:p0',a:sn.id,b:mid.id,level:0,w:3.6,h:2.6,section:'sump',canyon:0,stream:false,station:'spring'},
   b={id:'sw:spring:p1',a:mid.id,b:top.id,level:0,w:2.6,h:2.2,section:'sump',canyon:0,stream:false,station:'spring'};
  N.passages.push(a,b);add.push(a,b);}
 // ---- the gorge's sink drains in: a node under its bed, a shaft up to the bed, a passage to the nearest node
 const GK=P.GORGE.sink;let gorge=null;
 {let m=null,bd=1e30;N.nodes.forEach(n=>{if(n.level!==0||/^sw:/.test(n.id))return;const d=Math.hypot(n.x-GK.x,n.z-GK.z);if(d<bd){bd=d;m=n;}});
  const y=Math.min(GK.floor-14,m.y+.4),foot={id:'sw:gorge:foot',x:GK.x,y,z:GK.z,level:0,deg:2};N.nodes.push(foot);byId[foot.id]=foot;
  const sh={id:'sw:gorge:shaft',c:[GK.x,GK.z],y0:y,y1:GK.floor-.8,r:1.6,kind:'sink',sink:'sw:gorge',station:'gorge'};N.shafts.push(sh);add.push(sh);
  /* on the joints, not across them: east under the ridge's flank to the node's line, then along the fold axis to it */
  const corner={id:'sw:gorge:corner',x:m.x,y:mix(y,m.y,Math.abs(m.x-GK.x)/(Math.abs(m.x-GK.x)+Math.abs(m.z-GK.z)||1)),z:GK.z,level:0,deg:2};N.nodes.push(corner);byId[corner.id]=corner;
  const sec=(a,b,h)=>Math.max(a.y,b.y)+h<N.table?'sump':Math.min(a.y,b.y)>N.table?'keyhole':'phreatic';
  const p={id:'sw:gorge:p',a:foot.id,b:corner.id,level:0,w:3.4,h:3.2,section:sec(foot,corner,3.2),canyon:0,stream:true,station:'gorge'},
   p2={id:'sw:gorge:p2',a:corner.id,b:m.id,level:0,w:3.4,h:3.2,section:sec(corner,m,3.2),canyon:0,stream:true,station:'gorge'};
  N.passages.push(p,p2);add.push(p,p2);gorge={foot,corner,shaft:sh,p,p2,to:m.id,d:bd};}
 // ---- the surface: the kept dolines on KRELIEF over the open ground
 const recs=KKARST.relief(N),surf=recs.length?KRELIEF.apply(g1,recs):g1;
 /* a sink's swallet is choked: its shaft stops 3 m under the doline's floor (no hole in the ground; the soil over it is the page's) */
 N.shafts.forEach(s=>{if(s.kind==='sink'&&!/^sw:/.test(s.id))s.y1=Math.min(s.y1,surf(s.c[0],s.c[1])-3);});
 // ---- skylights: under the ridge the rock is 100-230 m thick, so the network's own chambers have none. In the east valley, where the
 // main level runs 15-45 m under the floor, two junctions (a node where three passages meet, the two with the least rock, 250 m apart
 // at least) are opened into chambers (13 x 10 m, 9 m high) and each gets a SKYLIGHT: a shaft from its crown to the ground, and a well
 const cen={};N.dolines.forEach(D=>{if(D.form==='cenote')cen[D.over]=D;});
 {const deg={};N.passages.forEach(p=>{deg[p.a]=(deg[p.a]||0)+1;deg[p.b]=(deg[p.b]||0)+1;});const has={};N.chambers.forEach(H=>{has[H.node]=1;});
  const near=(x,z)=>{const r=P.streamNear(x,z);return r&&r.d<r.w+45;};
  const cand=N.nodes.filter(n=>n.level===0&&!/^sw:/.test(n.id)&&deg[n.id]>=3&&!has[n.id]&&n.x>P.crestX(P.RB,n.z)+200&&!near(n.x,n.z)&&slope(n.x,n.z)<.7)
   .map(n=>({n,roof:surf(n.x,n.z)-(n.y+9)})).filter(q=>q.roof>14&&q.roof<45).sort((a,b)=>a.roof-b.roof||(a.n.id<b.n.id?-1:1));
  const pick=[];cand.forEach(q=>{if(pick.length<2&&pick.every(o=>Math.hypot(o.n.x-q.n.x,o.n.z-q.n.z)>250))pick.push(q);});
  pick.forEach((q,i)=>{const H={id:'sw:sky'+i+':chamber',node:q.n.id,c:[q.n.x,q.n.y,q.n.z],rx:13,rz:10,h:9,flooded:q.n.y<N.table,station:'skylight'};N.chambers.push(H);add.push(H);});}
 const sky=N.chambers.filter(H=>H.station==='skylight').map(H=>({H,roof:surf(H.c[0],H.c[2])-(H.c[1]+H.h)}))
  .map((q,i)=>{const H=q.H,g=surf(H.c[0],H.c[2]),r=mix(3.2,4.6,KRAND.unit(KRAND.hash(W,i,0x5C1)));
   const sh={id:'sw:skylight'+i,c:[H.c[0],H.c[2]],y0:H.c[1]+H.h*.6,y1:g+3,r,kind:'skylight',over:H.id,station:'skylight'};N.shafts.push(sh);add.push(sh);H.skylight=sh.id;
   return {H,sh,roof:q.roof,g,well:{x:H.c[0],z:H.c[2],r:r*1.15}};});
 // ---- the wells (KCAVERN openings that cut the ground): the cenotes' and the skylights'; the rim wide enough that the page's 6 m grid
 // is cut whole inside it and the cavern meshes the ground to its edge (89x)
 const RIM=9,wells=N.dolines.filter(D=>D.form==='cenote').map(D=>({id:D.id+':well',x:D.x,z:D.z,r:D.r,rim:RIM,kind:'cenote'})).concat(sky.map(s=>({id:s.sh.id+':well',x:s.well.x,z:s.well.z,r:s.well.r,rim:RIM,kind:'skylight'})));
 const mask=(x,z)=>{for(const w of wells)if(Math.hypot(x-w.x,z-w.z)<w.r+RIM+2)return 0;return 1;};
 return {N,surf,mask,recs,spring,back,G,gorge,sky,wells,RIM,box:BOX,add,dropped,ms:Math.round(performance.now()-t0)};};
