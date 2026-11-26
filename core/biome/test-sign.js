// node core/biome/test-sign.js — KSIGN (46-core-sign.js): animal sign from herd records. Each check carries a negative that must fail.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
eval(fs.readFileSync(path.join(__dirname,'46-core-sign.js'),'utf8'));
ok('make refuses to run without core/rand',throws(()=>KSIGN.make({herds:[],ground:()=>0})),false);
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
const src=fs.readFileSync(path.join(__dirname,'46-core-sign.js'),'utf8');
ok('loading it twice changes nothing',(()=>{const K=KSIGN;eval(src);return KSIGN===K;})(),false);

// a graben floor tilting gently east; a wall (impassable) across it at z 900-1000 with one gap, a cheap corridor at x 1400-1500
const ground=(x,z)=>2000+.02*x+5*Math.sin(z/300);
const wall=(x,z)=>z>900&&z<1000&&!(x>1400&&x<1500),corr=(x)=>x>1400&&x<1500;
const cost=(x,z)=>wall(x,z)?Infinity:corr(x)?-.5:0;
const water=[[1450,1600],[300,1700]];
const herds=[{id:'auroch',species:'aurochs',x:500,z:500,r:300,n:20,mass:3000,predators:true},{id:'bison',x:700,z:400,r:250,n:30,mass:900}];
const S=KSIGN.make({herds,ground,cost,water,world:3,reach:2000});
const near=(p,q,e)=>Math.hypot(p[0]-q[0],p[1]-q[1])<=e;
const wt=S.trails.filter(t=>t.to==='water');
ok('trails run from each herd\'s bedding ground to its water ('+wt.length+' water trails)',wt.length===4&&wt.every(t=>{const H=S.herds.find(h=>h.id===t.herd);return near(t.pts[0],H.bed,S.cell)&&H.water.some(w=>near(t.pts[t.pts.length-1],w,S.cell));}),
  KSIGN.make({herds,ground,cost,water,world:3,reach:100}).trails.some(t=>t.to==='water'));
const cellsOf=t=>{const o=[];for(let i=0;i+1<t.pts.length;i++){const a=t.pts[i],b=t.pts[i+1],n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/(S.cell/2)));for(let k=0;k<=n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}return o;};
ok('no trail crosses impassable ground: they go through the gap',S.trails.every(t=>cellsOf(t).every(p=>!wall(p[0],p[1])))&&wt.every(t=>cellsOf(t).some(p=>p[1]>900&&p[1]<1000&&corr(p[0]))),
  KSIGN.make({herds,ground,cost:()=>0,water,world:3,reach:2000}).trails.filter(t=>t.to==='water').every(t=>cellsOf(t).every(p=>!wall(p[0],p[1]))));
// the corridor: herds walk a cheap graben floor round a costly plateau (extra 2: three times the cost a metre)
const inC=(x,z)=>(x>=700&&x<800&&z>=400&&z<1800)||(z>=450&&z<550&&x>=450&&x<800)||(z>=1650&&z<1750&&x>=450&&x<800);
const cH=[{id:'elk',x:500,z:500,r:200,n:15,mass:400,water:[[500,1700]],pasture:[[520,520]]}];
const viaC=KSIGN.make({herds:cH,ground,cost:(x,z)=>inC(x,z)?0:2,world:3}),flatC=KSIGN.make({herds:cH,ground,cost:()=>0,world:3});
const corrShare=Sx=>{const c=cellsOf(Sx.trails.find(t=>t.to==='water'));return c.filter(p=>inC(p[0],p[1])).length/c.length;};
ok('trails follow the cheap corridors ('+(100*corrShare(viaC)).toFixed(0)+'% of the trail to water in one, '+(100*corrShare(flatC)).toFixed(0)+'% when it is no cheaper)',corrShare(viaC)>.85,corrShare(flatC)>.5);
const one=KSIGN.make({herds:[herds[0]],ground,cost,water,world:3,reach:2000}),two=S;
const tw=(Sx,id)=>Sx.trails.find(t=>t.id===id);
ok('herds share trails, and a shared trail is worn wider and deeper ('+tw(one,'auroch:water:0').w+' m alone, '+tw(two,'auroch:water:0').w+' m shared)',tw(two,'auroch:water:0').use>1.2&&tw(two,'auroch:water:0').w>tw(one,'auroch:water:0').w&&tw(two,'auroch:water:0').d>tw(one,'auroch:water:0').d,tw(one,'auroch:water:0').use>1);
const heavy=KSIGN.make({herds:[{id:'m',x:500,z:500,r:300,n:10,mass:6000}],ground,cost,water,world:3,reach:2000}),light=KSIGN.make({herds:[{id:'m',x:500,z:500,r:300,n:10,mass:60}],ground,cost,water,world:3,reach:2000});
ok('heavier beasts wear wider trails and browse higher',heavy.trails[0].w>light.trails[0].w&&heavy.browse[0].y>light.browse[0].y,false);
const wdist=w=>Math.min(...water.map(q=>Math.hypot(w.x-q[0],w.z-q[1])));
ok('wallows lie by the water only ('+S.wallows.length+', the farthest '+Math.max(...S.wallows.map(wdist)).toFixed(0)+' m out)',S.wallows.length>2&&S.wallows.every(w=>wdist(w)<=80+S.cell),light.wallows.length>0);
ok('dung along the trails and on the bedding ground ('+S.dung.length+'), its kind by the beast',S.dung.length>50&&S.dung.every(d=>['heap','pat','pellet'].includes(d.kind))&&S.dung.some(d=>d.herd==='auroch'&&d.kind==='heap')&&S.dung.some(d=>d.herd==='bison'&&d.kind==='pat'),false);
ok('bone yards at the water or at kill sites on a hunted herd\'s trails',S.boneyards.length>0&&S.boneyards.every(b=>b.at==='water'?wdist(b)<=40:b.at==='kill'),false);
ok('the browse line per herd, for the flora',S.browse.length===2&&S.browse.every(b=>b.y>1&&b.r>0),false);
const det=KSIGN.make({herds:herds.slice().reverse(),ground,cost,water,world:3,reach:2000});
ok('deterministic, whatever order the herds come in; another world draws other dung',JSON.stringify(det)===JSON.stringify(S),JSON.stringify(KSIGN.make({herds,ground,cost,water,world:4,reach:2000}).dung)===JSON.stringify(S.dung));
// a tile made alone with the same herds
const tile=[1000,600,1700,1300],T=KSIGN.make({herds,ground,cost,water,world:3,reach:2000,box:tile});
const inT=o=>{const r=o.r!=null?o.r:1;return o.x+r>=tile[0]&&o.x-r<tile[2]&&o.z+r>=tile[1]&&o.z-r<tile[3];};
const keyed=a=>JSON.stringify(a.slice().sort((p,q)=>p.id<q.id?-1:1));
ok('a tile alone gives the whole box\'s sign that reaches it (dung, wallows, bone yards, trails)',T.dung.length>0&&keyed(T.dung)===keyed(S.dung.filter(inT))&&keyed(T.wallows)===keyed(S.wallows.filter(inT))&&keyed(T.boneyards)===keyed(S.boneyards.filter(inT))&&
  T.trails.every(t=>JSON.stringify(t)===JSON.stringify(S.trails.find(s=>s.id===t.id))),keyed(KSIGN.make({herds,ground,cost,water,world:5,reach:2000,box:tile}).dung)===keyed(S.dung.filter(inT)));
let maskSame=true;for(let i=0;i<60;i++){const x=tile[0]+(i*37)%700,z=tile[1]+(i*53)%700,a=KSIGN.maskAt(T,x,z),b=KSIGN.maskAt(S,x,z);if(JSON.stringify(a)!==JSON.stringify(b))maskSame=false;}
ok('and the same masks there',maskSame,false);
const onTrail=wt[0].pts[1];const m=KSIGN.maskAt(S,onTrail[0],onTrail[1]),far=KSIGN.maskAt(S,9000,9000),bed=KSIGN.maskAt(S,500,500);
ok('maskAt: a trail reads on its line, the bedding ground is trampled, and far from the herds every mask is 0',m.trail===1&&bed.trample>.4&&Object.values(far).every(v=>v===0),Object.values(KSIGN.maskAt(S,500,500)).every(v=>v===0));
const W0=S.wallows[0],D0=S.dung[0];
ok('maskAt reads the wallows and the dung',KSIGN.maskAt(S,W0.x,W0.z).wallow===1&&KSIGN.maskAt(S,D0.x,D0.z).dung===1&&KSIGN.maskAt(S,W0.x+W0.r+1,W0.z).wallow===0,false);
const J=JSON.parse(JSON.stringify(KSIGN.export(S))),L=KSIGN.load(J);
ok('export and load: plain JSON that reads the same masks',(()=>{for(let i=0;i<80;i++){const x=(i*71)%1800,z=(i*43)%1800;if(JSON.stringify(KSIGN.maskAt(L,x,z))!==JSON.stringify(KSIGN.maskAt(S,x,z)))return false;}return true;})(),throws(()=>KSIGN.load(J))||!throws(()=>KSIGN.load({kind:'x'})));
const lands={id:'h1',gid:'3,4,grazer,0',key:'aurochs',at:[500,2010,500],r:300,n:12};
ok('a FAUNALANDS herd record is read as it is (id, key, at)',KSIGN.make({herds:[lands],ground,cost,water,world:3,reach:2000}).herds[0].species==='aurochs'&&KSIGN.make({herds:[lands],ground,cost,water,world:3,reach:2000}).trails.length>0,false);
ok('bad inputs throw (no ground, a herd without an id or a place, two herds with one id)',throws(()=>KSIGN.make({herds})) &&throws(()=>KSIGN.make({herds:[{x:0,z:0}],ground}))&&throws(()=>KSIGN.make({herds:[{id:'a'}],ground}))&&throws(()=>KSIGN.make({herds:[herds[0],herds[0]],ground})),
  throws(()=>KSIGN.make({herds,ground})));
ok('the fragment uses no THREE, no DOM, no Math.random and no canvas',!/THREE\.|document\.|window\.|Math\.random\(|getImageData/.test(src),!/Math\.random\(/.test('Math.random()'));

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
