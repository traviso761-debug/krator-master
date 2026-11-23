// node core/minimap/decks/test-minimap-decks.js — the deck bands, marks and the line map (88b), each check with a negative.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','88-core-minimap.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'..','..','walk','20-core-walk.js'),'utf8'));
const plain=KMAP.create;                       /* the plan without 88b, to prove a plan that never asks is unchanged */
eval(fs.readFileSync(path.join(__dirname,'88b-core-minimap-decks.js'),'utf8'));
let bad=0,n=0;const ok=(name,pass,neg)=>{n++;const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
// a recording 2D context: every fill and stroke with its style
function rec(){const L=[];let fs='',ss='';return {L,get fillStyle(){return fs;},set fillStyle(v){fs=v;},get strokeStyle(){return ss;},set strokeStyle(v){ss=v;},lineWidth:1,lineCap:'',font:'',imageSmoothingEnabled:true,
 fillRect(...a){L.push(['fillRect',fs,...a.map(v=>+v.toFixed(2))]);},beginPath(){},moveTo(){},lineTo(){},closePath(){},arc(){},rect(){},fill(){L.push(['fill',fs]);},stroke(){L.push(['stroke',ss]);},
 fillText(t){L.push(['text',fs,t]);},measureText(t){return {width:t.length*4};},drawImage(){},setLineDash(){}};}
// ---- a plan that never calls the new functions draws and exports as before
const build=mk=>{const M=mk({frame:[0,100,0,100],size:100,palette:{a:'#c0a080'}});M.rect(10,20,10,20,{tag:'a',name:'one'});M.strip([0,50],[100,50],4,{col:'#44aa66',name:'way'});M.label(50,5,'Hold');return M;};
const A=build(plain),B=build(KMAP.create),ga=rec(),gb=rec();A.paint(ga,null);B.paint(gb,null);
ok('a plan with no band paints the same calls as 88 alone',JSON.stringify(ga.L)===JSON.stringify(gb.L),ga.L.length===0);
const ea=A.export(),eb=B.export();
ok('its export keeps every field 88 wrote, the same',['format','version','frame','size','bg','records','relief'].every(k=>JSON.stringify(ea[k])===JSON.stringify(eb[k])),false);
ok('and adds bands, heights, marks, schematic (empty)',eb.bands&&eb.bands.band===null&&eb.marks.length===0&&eb.schematic===null&&eb.heights.every(h=>h===null),'bands' in ea);
// ---- three decks of a hold, 4.5 m apart, overlapping in plan
const W=KWALK.create();
W.floor({rect:[0,60,0,20],y:0,name:'Platform'});W.floor({rect:[10,50,5,15],y:4.5,name:'Mezzanine'});W.floor({rect:[20,40,0,20],y:9,name:'Sets'});
const M=KMAP.create({frame:[0,60,0,60],size:120});M.walkBands(W,y=>y>6?'#6688aa':y>2?'#88aa66':'#aa8866');
ok('walkBands keeps each floor\'s height',M.records.map(r=>r.h).join()==='0,4.5,9',M.records.some(r=>r.h==null));
{const Wp=KWALK.create();Wp.poly({pts:[[0,0,4.5],[10,0,4.5],[10,8,4.5],[0,8,4.5]],name:'carved room'});const Mp=KMAP.create({frame:[0,20,0,20]});Mp.walkBands(Wp);
 const r=Mp.records[0];ok('a poly floor (a carved room) comes in as its box, with its height',r&&r.kind==='rect'&&r.rect.join()==='0,10,0,8'&&r.h===4.5,!r);}
ok('no band: bandOf is null',M.bandOf(M.records[0])===null,false);
const r0=M.rev();M.band(3,6);
ok('setting a band moves rev (the host repaints)',M.rev()!==r0,false);
ok('bandOf: below, in, above',M.records.map(r=>M.bandOf(r)).join()==='below,in,above',M.bandOf(M.records[1])!=='in');
const r1=M.rev();M.band(3,6);ok('the same band again does not move rev',M.rev()===r1,false);
const g=rec();M.paint(g,null);
const fills=g.L.filter(c=>c[0]==='fillRect').map(c=>c[1]);
ok('the deck in the band keeps its colour',fills.includes('#88aa66'),false);
ok('the decks out of it are dimmed toward the background',!fills.includes('#aa8866')&&!fills.includes('#6688aa'),fills.includes('#aa8866'));
const last=g.L.filter(c=>c[0]==='fillRect').pop();
ok('the band\'s deck is drawn on top',last[1]==='#88aa66',last[1]!=='#88aa66');
const arrows=g.L.filter(c=>c[0]==='fill'&&(c[1]==='#9fd3ff'||c[1]==='#e0a070')).map(c=>c[1]);
ok('an up arrow for the deck above, a down arrow for the deck below',arrows.join()==='#e0a070,#9fd3ff',arrows.length!==2);
ok('painting with a band leaves the records as they were',M.records.map(r=>r.col+'/'+r.y).join()==='#aa8866/0,#88aa66/4.5,#6688aa/9',false);
M.band(3,6,{marks:false});const g2=rec();M.paint(g2,null);
ok('marks: false draws no arrows',!g2.L.some(c=>c[0]==='fill'&&(c[1]==='#9fd3ff'||c[1]==='#e0a070')),false);
M.mark(30,10,-4.5,{name:'lift down'});const g3=rec();M.paint(g3,null);
ok('a hand mark is drawn (down: amber)',g3.L.some(c=>c[0]==='fill'&&c[1]==='#e0a070'),false);
M.band(null);const g4=rec();M.paint(g4,null);
ok('clearing the band brings every colour back',['#aa8866','#88aa66','#6688aa'].every(c=>g4.L.some(q=>q[0]==='fillRect'&&q[1]===c)),false);
// ---- the line map
const nodes=[{id:'s1',name:'Twenny',kind:'station',x:218,depth:900},{id:'j',kind:'junction',x:225,depth:905},{id:'g',name:'G2 gap',kind:'gap',x:235,depth:910},
 {id:'s2',name:'S1',kind:'station',x:240,depth:930},{id:'l',name:'Loj Twenny',kind:'loj',x:218,depth:870},{id:'sh',name:'great shaft',kind:'lift',x:212,depth:0}];
const edges=[{a:'s1',b:'j',line:'Line'},{a:'j',b:'g',line:'Line'},{a:'g',b:'s2',state:'gap',time:40},{a:'s1',b:'l',line:'branch'},{a:'s1',b:'sh',line:'shaft'}];
const L=M.schematic(nodes,edges,{title:'The Line',lines:{Line:'#4fb06a',branch:'#c24a3a',shaft:'#e8e8e8'}});
const lay=L.layout(320,160);
ok('the line map lays the stations along x by chainage',lay.byId.s1.px<lay.byId.j.px&&lay.byId.j.px<lay.byId.s2.px,lay.byId.s2.px<lay.byId.s1.px);
ok('depth runs down the page (the shaft head on top)',lay.byId.sh.py<lay.byId.l.py&&lay.byId.l.py<lay.byId.s2.py,lay.byId.sh.py>lay.byId.s2.py);
const gs=rec();L.paint(gs,320,160);
ok('a gap edge is labelled with its walk time',gs.L.some(c=>c[0]==='text'&&c[2]==='40 min walk'),false);
ok('every named node is labelled',['Twenny','G2 gap','S1','Loj Twenny','great shaft'].every(t=>gs.L.some(c=>c[0]==='text'&&c[2]===t)),false);
ok('L.at finds the node under a point',L.at(lay.byId.l.px+2,lay.byId.l.py-1,320,160).id==='l',L.at(1,1,320,160)!==null);
const ex=M.export();
ok('export carries the line map',ex.schematic&&ex.schematic.nodes.length===6&&ex.schematic.edges[2].state==='gap'&&ex.schematic.edges[2].time===40,false);
ok('export carries the marks and heights',ex.marks.length===1&&ex.marks[0].dy===-4.5&&ex.heights.filter(h=>h!=null).length===3,false);
let threw=false;try{KMAP.schematic([{id:'a'}],[{a:'a',b:'zz'}]);}catch(e){threw=/missing node/.test(e.message);}
ok('an edge to a missing node throws (negative)',threw,false);
threw=false;try{KMAP.schematic([{id:'a'},{id:'b'}],[{a:'a',b:'b',state:'broken'}]);}catch(e){threw=/solid or gap/.test(e.message);}
ok('an unknown edge state throws (negative)',threw,false);
threw=false;try{KMAP.schematic([{id:'a'},{id:'a'}],[]);}catch(e){threw=/duplicate/.test(e.message);}
ok('a duplicate node throws (negative)',threw,false);
console.log((n-bad)+' of '+n+' passed');process.exit(bad?1:0);
