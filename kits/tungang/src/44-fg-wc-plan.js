// prefix: fg
// ================================================================= WILDCAT: the scrap pueblo's plans and dress, as records (PLAN.md 1.3.1, 3.3)
// Wildcat is the Fellgangs' raiding village, about half Kimr: ONE great house the size of a Chaco great house (the owner,
// 2026-11-11: Pueblo Bonito's scale, 1,000 to 2,000 people at most) and two small scrap-pueblo hamlets. The plan is
// core/pueblo's (KPUEBLO.house: the room cells, storeys and terraces, plazas, kivas, ladders, the stockade's ring); this
// fragment holds the specs and the DRESS, the Kimr-and-Fellgang things on it, each a record placed here by KRAND from the
// plan's ids so the drawing (46-fg-wc-draw.js) only draws what it is given:
//   crest     aurochs skulls along the hero's parapets, the horned crest over the hero's rooms
//   trophies  poles round the round room: a Labber's helmet, a Lizard's scale, skulls, horns
//   deeds     the Deeds: every boast painted on the plaza face of the front block, and whether it was made good
//   slogans   NO SKABS man-high on the outer walls, a painted aurochs beside some
//   shells    glyptodont shells as domed cisterns on the terraces and in the plaza
//   drums     war drums and braziers by the round room (catalog pieces)
// Plain data ([G data]): KRAND and core/pueblo only, no three.js.
const FG_WC={
 /* the great house: a D (an arc of five rows stepping up to five storeys, a two-row front, a spine between two plazas), the
    round room in the west plaza, three small kivas, the stockade 24 m out at the knoll's foot */
 GREAT:{id:'wildcat',world:14530,shape:'D',R:74,rows:5,maxStoreys:5,frontRows:2,frontRise:1,frontMax:2,spineMax:2,ragged:.14,people:2.4,popMax:2000,
  kivas:{great:[0],small:3},enclosure:24,gateW:7},
 /* the hamlets: a U on the ford below (its yard open to the south, a low stockade) and an L by the pens */
 HAMLETS:[{id:'wildcat-ford',world:14531,shape:'U',pw:20,pd:16,rows:3,sideRows:2,maxStoreys:3,ragged:.18,people:2.4,kivas:{great:[],small:1},enclosure:8,gateW:4},
  {id:'wildcat-pens',world:14532,shape:'L',pw:24,pd:20,rows:4,sideRows:3,maxStoreys:3,ragged:.2,taperLen:4.2,people:2.4,kivas:{great:[],small:1}}],
 /* one block alone, for the sheet's row: five seeds, the hero's crest on the even ones */
 block(v){v=v|0;return {id:'wcblock'+v,world:14600+v,shape:'line',segs:[6,5,6,5,6][v%5],rows:3,maxStoreys:3,ragged:.15,hero:v%2===0,yard:5};},
 SLOGANS:['NO SKABS','NO SKABS','ALL OUT','HOLD FAST','DEEDS NOT WORDS'],
 cache:{}};
/* a plan, built once per spec id (the great house takes ~150 ms) */
function fgWcPlan(spec){const k=spec.id+':'+spec.world;return FG_WC.cache[k]||(FG_WC.cache[k]=KPUEBLO.house(spec));}
function fgWcU(P,a,b,salt){return KRAND.unit(KRAND.hash(P.world,a|0,b|0,salt|0));}
/* the edge of cell c on its side ('front' ...): {a, b, m (midpoint), n (outward normal), L, ry (the yaw whose +z is n)} */
function fgWcEdge(c,side){const e=KPUEBLO.edgeOf(c,side),n=KPUEBLO.outN(e[0],e[1],[c.cx,c.cz]),L=Math.hypot(e[1][0]-e[0][0],e[1][1]-e[0][1]);
 return {a:e[0],b:e[1],m:[(e[0][0]+e[1][0])/2,(e[0][1]+e[1][1])/2],n,L,ry:Math.atan2(n[0],n[1])};}
/* ---------------------------------------------------------------- the dress */
function fgWcDress(P){const D={crest:[],trophies:[],deeds:[],slogans:[],shells:[],drums:[]},h=P.storey,byId=P.byId;
 /* the hero's parapets: a skull every ~1.3 m along each hero cell's front edge; the horned crest on the middlemost */
 const heroes=P.cells.filter(c=>c.hero);
 heroes.forEach((c,i)=>{const E=fgWcEdge(c,'front'),n=Math.max(2,Math.floor(E.L/1.3));
  for(let k=0;k<n;k++){const t=(k+.5)/n;D.crest.push({id:c.id+':skull:'+k,kind:'skull',x:E.a[0]+(E.b[0]-E.a[0])*t-E.n[0]*.16,z:E.a[1]+(E.b[1]-E.a[1])*t-E.n[1]*.16,y:c.storeys*h+.5,ry:E.ry});}});
 if(heroes.length){const c=heroes.slice().sort((a,b)=>Math.abs(a.t/a.len-.5)-Math.abs(b.t/b.len-.5))[0],E=fgWcEdge(c,'front');
  D.crest.push({id:c.id+':crest',kind:'crest',x:E.m[0]-E.n[0]*.3,z:E.m[1]-E.n[1]*.3,y:c.storeys*h+.5,ry:E.ry,span:Math.min(4.5,E.L*1.05)});}
 /* skulls on the parapets of some other tall columns (the back row's, every seventh) */
 P.cells.filter(c=>!c.hero&&c.storeys>=3&&!c.nb.back&&fgWcU(P,c.seg,c.row,71)<.18).forEach(c=>{const E=fgWcEdge(c,'back');D.crest.push({id:c.id+':skull:b',kind:'skull',x:E.m[0]-E.n[0]*.16,z:E.m[1]-E.n[1]*.16,y:c.storeys*h+.5,ry:E.ry});});
 /* the round room's trophy poles and drums */
 P.kivas.filter(k=>k.great).forEach(k=>{const n=6,what=['helmet','scale','skulls','horns','helmet','skulls'];
  for(let i=0;i<n;i++){const a=(i+fgWcU(P,i,1,72)*.5)/n*Math.PI*2,r=k.r+2.4;D.trophies.push({id:k.id+':trophy:'+i,x:k.x+Math.cos(a)*r,z:k.z+Math.sin(a)*r,what:what[i%what.length],h:4+fgWcU(P,i,2,72)*1.5});}
  for(let i=0;i<2;i++){const a=Math.PI*.25+i*Math.PI*1.1,r=k.r+1.2;D.drums.push({id:k.id+':drum:'+i,key:'fellgang_common_war_drum',x:k.x+Math.cos(a)*r,z:k.z+Math.sin(a)*r,ry:-a});}
  for(let i=0;i<2;i++){const a=Math.PI*.75+i*Math.PI,r=k.r+1.4;D.drums.push({id:k.id+':brazier:'+i,key:'fellgang_common_brazier',x:k.x+Math.cos(a)*r,z:k.z+Math.sin(a)*r,ry:0});}});
 /* the Deeds: three front-row faces on the plaza side nearest the last plaza's middle (the east plaza on a D) */
 {const pl=P.plazas[P.plazas.length-1],face=P.cells.filter(c=>c.block==='front'&&c.row===0&&!c.nb.front&&KPUEBLO.groundAt(P,c.cx+c.n[0]*(c.r+1),c.cz+c.n[1]*(c.r+1))===pl.id)
   .sort((a,b)=>a.seg-b.seg);
  /* two side by side with no ladder against them (a ladder climbs every third face), the pair nearest the plaza's middle */
  const climbed=new Set(P.ladders.map(L=>L.to)),runs=[];
  for(let i=0;i+1<face.length;i++){const r2=face.slice(i,i+2);if(r2[1].seg-r2[0].seg===1&&r2.every(c=>!climbed.has(c.id)))runs.push(r2);}
  runs.sort((a,b)=>Math.abs((a[0].cx+a[1].cx)/2-pl.cx)-Math.abs((b[0].cx+b[1].cx)/2-pl.cx));
  if(runs.length){const run=runs[0],E0=fgWcEdge(run[0],'front'),E2=fgWcEdge(run[1],'front'),n=18,boasts=[];
   for(let i=0;i<n;i++)boasts.push({made:fgWcU(P,i,3,73)<.62,mark:Math.floor(fgWcU(P,i,4,73)*6)});
   const x=(E0.m[0]+E2.m[0])/2,z=(E0.m[1]+E2.m[1])/2;D.deeds.push({id:P.id+':deeds',x:x+E0.n[0]*.03,z:z+E0.n[1]*.03,ry:E0.ry,w:Math.hypot(E2.m[0]-E0.m[0],E2.m[1]-E0.m[1])+E0.L*.8,y:.5,h:1.9,boasts,cells:run.map(c=>c.id)});}}
 /* NO SKABS on the outer walls: the tallest back faces, a few of them, an aurochs beside some */
 {const outer=P.cells.filter(c=>!c.nb.back&&c.storeys>=Math.max(2,P.census.maxStoreys-1)).sort((a,b)=>fgWcU(P,a.seg,a.row*7+a.bi,74)-fgWcU(P,b.seg,b.row*7+b.bi,74));
  const used=[];for(const c of outer){if(D.slogans.length>=(P.cells.length>150?5:1))break;if(used.some(u=>Math.hypot(u.cx-c.cx,u.cz-c.cz)<24))continue;used.push(c);
   /* man-high (1.7 m letters) where the wall runs on far enough each way; smaller, or none, near a block's end (the words and
      the aurochs beside them never pass the wall: 3 x 5 letters are (4n - 1) / 5 of their height long) */
   const E=fgWcEdge(c,'back'),i=D.slogans.length,text=FG_WC.SLOGANS[i%FG_WC.SLOGANS.length],aur=i%2===0,half=Math.min(c.t,c.len-c.t)*.92-(aur?1.6:0);
   const ch=Math.min(1.7,2*half/((text.length*4-1)/5));if(ch<.7){used.pop();continue;}
   D.slogans.push({id:c.id+':slogan',text,x:E.m[0]+E.n[0]*.05,z:E.m[1]+E.n[1]*.05,y:h*.9,ry:E.ry,ch:+ch.toFixed(2),aurochs:aur});}}
 /* glyptodont shells: cisterns on a few low terraces (a roof with a taller roof behind it), and one in each plaza */
 P.cells.filter(c=>c.storeys<=3&&c.nb.back&&byId[c.nb.back].storeys>c.storeys&&fgWcU(P,c.seg,c.row*7+c.bi,75)<.05).slice(0,8).forEach(c=>
  D.shells.push({id:c.id+':shell',x:c.cx,z:c.cz,y:c.storeys*h+.14,r:1.05+fgWcU(P,c.seg,1,75)*.35,ry:fgWcU(P,c.seg,2,75)*6.283}));
 P.plazas.forEach((pl,i)=>{for(let t=0;t<40;t++){const x=pl.cx+(fgWcU(P,i,t,76)-.5)*pl.w*.6,z=pl.cz+(fgWcU(P,i,t+50,76)-.5)*pl.d*.6;
  if(!KPUEBLO.inPoly(pl.pts,x,z)||KPUEBLO.clearance(pl.pts,x,z)<4||P.kivas.some(k=>Math.hypot(k.x-x,k.z-z)<k.r+5)||D.trophies.some(q=>Math.hypot(q.x-x,q.z-z)<3))continue;
  D.shells.push({id:pl.id+':shell',x,z,y:0,r:1.4,ry:fgWcU(P,i,t,77)*6.283});break;}});
 return D;}
