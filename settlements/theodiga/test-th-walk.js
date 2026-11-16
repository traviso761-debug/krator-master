/* node settlements/theodiga/test-th-walk.js: the walk graph (src/48-th-walk.js) on a town of the page's kind (streets meeting at
   their ends and part-way, a square, the three ways down the wall, the yard track and the bore's spur, silt and upland fields,
   the kora, the real Pilgrims' Stairs and the deck, the blueprint's arcology), each check with a negative (tools/ktest.js): the
   graph is one piece (everyone can reach everywhere); no edge leaps (a step on a street or a stair is short; only a door, a
   landing or an arcology bridge is long); every street node stands on its ground; no deck node stands in a pavilion, a stair
   well, the hall or the torn sector; a door is joined to a node near it; the same twice. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require('../../tools/ktest.js')(__filename);
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','settlements/theodiga/src/43-th-arc-program.js','settlements/theodiga/src/43-th-arc.js','settlements/theodiga/src/44-th-dome-today.js','settlements/theodiga/src/48-th-walk.js'].forEach(load);
const zc=x=>-140*(1-Math.pow(x/320,2)),ground=(x,z)=>440+.8*Math.sin(x/37)*Math.cos(z/41),floor=(x,z)=>2+Math.sin(x/30),bed=(x,z)=>280+z/200;
const ways=[{id:'a',w:8,pts:[[330,20],[700,20]]},{id:'b',w:6,pts:[[450,20],[450,-300]]},{id:'c',w:6,pts:[[600,-300],[600,300]]},{id:'d',w:5,pts:[[450,-150],[598,-150]]},{id:'e',w:5,pts:[[700,20],[900,40]]}];
const seg=(pts,w)=>({segs:pts.slice(1).map((b,i)=>({a:pts[i],b,w}))});
const descent={stair:seg([[330,440,10],[312,420,20],[300,400,18]],4),salvage:seg([[430,440,326],[340,300,520],[340,160,240],[336,0.4,390]],4),
 silt:seg([[470,440,-326],[350,350,-500],[342,276,-160]],4)};
const square={x0:345,x1:440,z0:-70,z1:10};
const works={track:{a:[336,390],b:[-100,390],w:6},bore:{x:341,z:479,spur:{pts:[[336,390],[325,479],[411,479]],w:5}}};
const fields=[];for(let i=0;i<24;i++)fields.push({id:'s'+i,corners:[[140+(i%6)*24,-180+Math.floor(i/6)*14],[162+(i%6)*24,-180+Math.floor(i/6)*14],[162+(i%6)*24,-168+Math.floor(i/6)*14],[140+(i%6)*24,-168+Math.floor(i/6)*14]],y:285});
for(let i=0;i<6;i++)fields.push({id:'u'+i,corners:[[1000+i*30,0],[1020+i*30,0],[1020+i*30,12],[1000+i*30,12]],y:441,upland:true});
const ST=TH_DOME_TODAY.stairs({zc,H:400,deckY:420}),units=TH_ARC_PROGRAM.filter(u=>u.area==='dome');
const pav=(x,z)=>units.some(u=>u.shape==='circle'?Math.hypot(x-u.cx,z-u.cz)<u.r+1.5:x>u.x0-1.5&&x<u.x1+1.5&&z>u.z0-1.5&&z<u.z1+1.5);
const well=(x,z)=>ST.some(s=>x>s.well.x0-1&&x<s.well.x1+1&&z>s.well.z0-1&&z<s.well.z1+1);
const torn=(x,z)=>{const a=Math.atan2(z+205,x),d=Math.abs(((a-(-Math.PI/2-.75))+3*Math.PI)%(2*Math.PI)-Math.PI);return d<.5&&Math.hypot(x,z+205)>60;};
const open=(x,z)=>pav(x,z)||well(x,z)||torn(x,z);
const O={ways,ground,square,descent,works,floor,fields,kora:{x0:-100,x1:286,zc,y:400,z:30.5},stairs:ST,deck:{cx:0,cz:-205,r:120,y:420,hall:44,open},
 arc:TH_ARC_PROGRAM.filter(u=>u.area!=='dome'),outline:TH_ARC.outline};
const G=TH_WALK.graph(O);
/* doors as the page joins them: a home on each street, a yard, a field, an arcology cell, a Dome hall */
const doors=[['h1',520,ground(520,26),26,['street','square']],['h2',604,ground(604,-200),-200,['street','square']],['y1',200,floor(200,396),396,['works']],
 ['f1',151,285,-174,['field','upland']],['c1',150,400,-86,['arc']],['dh',83,420,-207,['deck']]].map(([id,x,y,z,t])=>({id,x,z,node:G.join(id,x,y,z,t,80)}));
const P=TH_WALK.parts(G);
console.log(G.nodes.length+' nodes, '+G.edges.length+' edges, '+P.length+' part(s) (largest '+P[0].length+')');
const LONG={door:1,landing:1,bridge:1,field:1};
const CHECKS={
 'the graph is one piece':X=>{const p=TH_WALK.parts(X);return [p.length===1,p.length+' parts'+(p.length>1?' (strays: '+p.slice(1).map(q=>q.length+' '+q[0]).join('; ')+')':'')];},
 'no edge leaps (only a door, a landing, a field path or a bridge is long)':X=>{const bad=X.edges.filter(e=>!LONG[e.kind]&&e.len>9);return [bad.length===0,bad.length+' long edges'+(bad[0]?' (e.g. '+bad[0].a+' - '+bad[0].b+' '+bad[0].len+' m)':'')];},
 'every street and square node stands on its ground':X=>{const bad=X.nodes.filter(n=>(n.tag==='street'||n.tag==='square')&&Math.abs(n.y-ground(n.x,n.z))>.02);return [bad.length===0,bad.length+' off'];},
 'no deck node in a pavilion, a well, the hall or the torn sector':X=>{const bad=X.nodes.filter(n=>n.tag==='deck'&&(open(n.x,n.z)||Math.hypot(n.x,n.z+205)<46));return [bad.length===0&&X.nodes.some(n=>n.tag==='deck'),bad.length+' on no floor'];},
 'a door is joined to a node near it':X=>{const bad=doors.filter(d=>{const e=X.edges.find(e=>e.a==='door.'+d.id);return !e||e.len>80;});return [bad.length===0,bad.map(d=>d.id).join(', ')||'6 doors'];}};
const clone=()=>{const X=TH_WALK.graph(O);doors.forEach(d=>X.join(d.id,d.x,(d.y==null?null:d.y),d.z,null,80));return X;};
const NEG={
 'the graph is one piece':X=>{X.edges=X.edges.filter(e=>!(e.kind==='landing'&&/way\.stair/.test(e.a)));},
 'no edge leaps (only a door, a landing, a field path or a bridge is long)':X=>{X.edges.push({id:'x',a:X.nodes[0].id,b:X.nodes[X.nodes.length-1].id,kind:'floor',len:300});},
 'every street and square node stands on its ground':X=>{X.nodes.find(n=>n.tag==='street').y+=3;},
 'no deck node in a pavilion, a well, the hall or the torn sector':X=>{const n=X.nodes.find(n=>n.tag==='deck');n.x=83;n.z=-207;},
 'a door is joined to a node near it':X=>{const e=X.edges.find(e=>e.a==='door.h1');e.len=500;}};
for(const name of Object.keys(CHECKS)){const [pass,detail]=CHECKS[name](G);T.ok(name+' ('+detail+')',pass,detail);
 const F=TH_WALK.graph(O);doors.forEach(d=>F.join(d.id,d.x,null,d.z,null,80));NEG[name](F);T.ok('negative: '+name+' is caught',!CHECKS[name](F)[0]);}
T.ok('the graph rebuilds the same',JSON.stringify(TH_WALK.graph(O).edges)===JSON.stringify(TH_WALK.graph(O).edges));
T.done();
