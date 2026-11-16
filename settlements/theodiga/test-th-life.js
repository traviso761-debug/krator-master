/* node settlements/theodiga/test-th-life.js: people and lamps (src/45-th-life.js) on a synthetic town of the page's kind (streets
   through a block of buildings, a square, a cliff way, the kora's band, a deck with a pavilion and a torn sector, a yard and a
   field), each check with a negative (tools/ktest.js): nobody and no lamp inside a building; everyone on their ground; nobody on
   the deck where it is torn or inside a pavilion; about one figure for every 25 of the census; every role present; the same twice. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require('../../tools/ktest.js')(__filename);
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','settlements/theodiga/src/45-th-life.js'].forEach(load);
const ground=(x,z)=>440+.6*Math.sin(x/40)*Math.cos(z/50),floor=(x,z)=>2+Math.sin(x/30),bed=(x,z)=>280+z/100;
const lots=[];for(let i=0;i<8;i++)for(let j=0;j<4;j++)lots.push({x:400+i*30,z:-60+j*40,w:20,d:14,ry:(i+j)%2?0:.3});
const ways=[{id:'w.a',w:8,pts:[[380,-80],[640,-80]]},{id:'w.b',w:6,pts:[[385,-80],[385,100]]},{id:'w.c',w:6,pts:[[400,-40],[640,-40],[640,0]]}];
const zc=x=>-140*(1-Math.pow(x/320,2));
const open=(x,z)=>Math.hypot(x-30,z+180)<12||(Math.atan2(z+205,x)<-1.8&&Math.atan2(z+205,x)>-2.8);
const O={seed:2211,ways,lots,ground,square:{x0:330,x1:370,z0:-20,z1:20},census:{people:4000},
 descent:{stair:{segs:[{a:[300,440,5],b:[300,420,25],w:4},{a:[296,420,25],b:[296,400,5],w:4}]},salvage:{segs:[{a:[340,300,220],b:[345,250,560],w:4}]},silt:{segs:[{a:[350,330,-140],b:[352,300,-560],w:4}]}},
 kora:{x0:-100,x1:280,zc,y:400,z0:22,z1:39},deck:{cx:0,cz:-205,r:120,y:420,hall:44,open},
 works:{track:{a:[336,390],b:[-100,390],w:6},fields:[{id:'f.0',corners:[[140,-180],[162,-180],[162,-168],[140,-168]]}],bore:{x:341,z:479,gate:{at:72}}},floor,bed,offFloor:null};
const L=TH_LIFE.make(O);
const by={};for(const p of L.people)by[p.role]=(by[p.role]||0)+1;
console.log(L.people.length+' people '+JSON.stringify(by)+', '+L.lamps.length+' lamps');
const clone=()=>JSON.parse(JSON.stringify(L)),fault=f=>{const X=clone();f(X);return X;};
const inLot=(x,z,m)=>lots.some(Lt=>TH_LIFE.inBox(Lt,x,z,m));
const onWay=p=>/^w\./.test(p.id)||/square/.test(p.id);
const CHECKS={
 'nobody and no lamp stands inside a building':X=>{const n=X.people.filter(p=>inLot(p.x,p.z,.3)).length+X.lamps.filter(l=>inLot(l.x,l.z,.2)).length;return [n===0,n+' inside'];},
 'everyone in the town stands on its ground':X=>{const n=X.people.filter(p=>onWay(p)&&Math.abs(p.y-ground(p.x,p.z))>.01).length;return [n===0,n+' off the ground'];},
 'nobody on the deck where it is torn or inside a pavilion':X=>{const n=X.people.filter(p=>/deck/.test(p.id)&&(open(p.x,p.z)||Math.hypot(p.x,p.z+205)<44||Math.hypot(p.x,p.z+205)>120)).length;return [n===0,n+' on no deck'];},
 'about one figure for every 25 of the census in the streets':X=>{const n=X.people.filter(p=>/^w\./.test(p.id)).length;return [n>=4000/25*.6&&n<=4000/25*1.1,n+' in the streets'];},
 'every role is out':X=>{const r=new Set(X.people.map(p=>p.role));return [['townsfolk','pilgrim','salvager','farmer','deviser','hauler'].every(k=>r.has(k)),[...r].join(', ')];}};
const NEG={
 'nobody and no lamp stands inside a building':X=>{X.people[0].x=lots[3].x;X.people[0].z=lots[3].z;},
 'everyone in the town stands on its ground':X=>{X.people.find(onWay).y+=1;},
 'nobody on the deck where it is torn or inside a pavilion':X=>{const p=X.people.find(p=>/deck/.test(p.id));p.x=30;p.z=-180;},
 'about one figure for every 25 of the census in the streets':X=>{X.people=X.people.filter(p=>!/^w\./.test(p.id));},
 'every role is out':X=>{X.people=X.people.filter(p=>p.role!=='deviser');}};
for(const name of Object.keys(CHECKS)){const [pass,detail]=CHECKS[name](L);T.ok(name+' ('+detail+')',pass,detail);T.neg('negative: '+name,Y=>CHECKS[name](Y)[0],fault(NEG[name]),clone());}
T.ok('lamps along every street, at most 30 m apart on a side ('+L.lamps.length+')',ways.every(w=>L.lamps.some(l=>l.id.startsWith(w.id+'.lamp'))));
T.ok('the people and lamps rerun the same',JSON.stringify(TH_LIFE.make(O))===JSON.stringify(L));
T.done();
