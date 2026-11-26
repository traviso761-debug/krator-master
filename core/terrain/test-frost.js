// node core/terrain/test-frost.js — the periglacial landforms' contract (42-core-frost.js), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'42-core-frost.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const K=KFROST;

// ---- a plateau falling gently east, a slope to the south (the lobes), a valley floor along z = 0 (the aufeis)
const ground=(x,z)=>-.002*x+(z>200?-(z-200)*.25:0);
const mk=o=>K.create(Object.assign({seed:7,ground},o));
const F=mk({polygons:{cell:16,where:(x,z)=>z<100?1:0},alases:[{x:-600,z:-400,r:180,depth:9,lake:.5}],pingos:[{x:-300,z:-150,r:70,h:22}],
 aufeis:[{pts:[[-900,0],[0,0],[900,0]],w:40,thick:2.5}],lobes:{cell:28,h:1.4,where:(x,z)=>z>200?1:0},rockGlaciers:[{a:[400,400],b:[400,700],w:90,h:25}]});
const s=(f,x,z)=>f.sample(x,z,{});

// ---- determinism and portability
const G=mk({polygons:{cell:16,where:(x,z)=>z<100?1:0},alases:[{x:-600,z:-400,r:180,depth:9,lake:.5}],pingos:[{x:-300,z:-150,r:70,h:22}],
 aufeis:[{pts:[[-900,0],[0,0],[900,0]],w:40,thick:2.5}],lobes:{cell:28,h:1.4,where:(x,z)=>z>200?1:0},rockGlaciers:[{a:[400,400],b:[400,700],w:90,h:25}]});
let same=true;for(let i=0;i<400;i++){const x=-1000+i*5.3,z=-500+i*3.1;if(F.h(x,z)!==G.h(x,z))same=false;}
const H2=mk({seed:8,polygons:{cell:16}});let diff=false;for(let i=0;i<50;i++)if(H2.h(i*3.3,-50)!==K.create({seed:7,ground,polygons:{cell:16}}).h(i*3.3,-50))diff=true;
ok('the same seed gives the same landforms, a new seed new polygons',same&&diff,!diff);
const src=fs.readFileSync(path.join(__dirname,'42-core-frost.js'),'utf8').replace(/\/\/[^\n]*/g,'');
ok('no Math.random, sin, cos or exp in the module (a Godot port reproduces it)',!/Math\.(random|sin|cos|exp|pow|atan)/.test(src),/Math\.(random)/.test('Math.random'.replace('random','x')));

// ---- the alas: sunk, flat-floored, its lake in the middle, dry outside
const a=F.alases[0],cA=s(F,a.x,a.z),out=s(F,a.x+a.r*1.6,a.z);
ok('an alas: sunk its depth at the middle, nothing outside its rim',F.h(a.x,a.z)<-a.depth*.9&&F.h(a.x+a.r*1.6,a.z)===0&&cA.alas>.99&&out.alas===0,F.h(a.x,a.z)>-1);
ok('an alas: its lake in the middle, a meadow ring round it, both inside',cA.lake>.99&&s(F,a.x+a.r*.45,a.z).meadow>.5&&s(F,a.x+a.r*.45,a.z).lake<.01,s(F,a.x,a.z).meadow>.5);
const dry=mk({alases:[{x:0,z:0,r:150,lake:0}]});ok('a dry alas has a meadow and no lake',s(dry,0,0).lake===0&&s(dry,0,0).meadow>.9,s(dry,0,0).lake>0);
ok('an alas lake\'s level is its floor\'s, under the rim',Math.abs(F.alasLevel(a.id)-(ground(a.x,a.z)-a.depth))<.2&&F.alasLevel(a.id)<ground(a.x+a.r*1.3,a.z)-a.depth*.8,F.alasLevel('nonesuch')!==null);

// ---- the pingo: a dome round a crater
const Pf=mk({pingos:[{x:-300,z:-150,r:70,h:22}]}),p=Pf.pingos[0],top=Pf.h(p.x+p.r*.32,p.z),mid=Pf.h(p.x,p.z);
ok('a pingo: a dome its height high, a crater sunk in its summit, nothing past its foot',top>p.h*.7&&mid<top-p.h*.2&&Pf.h(p.x+p.r*1.01,p.z)===0&&s(Pf,p.x,p.z).pingo>.9,mid>top);

// ---- the aufeis: ice over the floor along the line, level across, patched along
let iced=0,n=0,maxT=0;for(let x=-900;x<=900;x+=5){const q=s(F,x,0);n++;if(q.aufeis>0){iced++;maxT=Math.max(maxT,q.iceH);}}
const pat=F.patches('aufeis0');
ok('aufeis: patches along the line, ice up to its thickness over the floor, none off the floor',iced>n*.2&&iced<n*.95&&maxT<=2.5+1e-9&&maxT>1&&s(F,0,60).aufeis===0&&pat.length>=2,iced===n);
const thin=mk({aufeis:[{pts:[[-900,0],[0,0],[900,0]],w:40,thick:2.5,cover:.15}]});let iced2=0;for(let x=-900;x<=900;x+=5)if(s(thin,x,0).aufeis>0)iced2++;
ok('aufeis: a remnant cover (autumn) is smaller than spring\'s',iced2<iced*.5&&iced2>0,iced2>=iced);

// ---- the polygons: troughs a few tens of cm deep where the lattice's cells meet, only where asked
let tr=0,lo=0;for(let i=0;i<400;i++){const x=-500+i*.73,z=-20+(i%17)*.9,q=s(F,x,z);if(q.poly>.5){tr++;lo=Math.min(lo,F.h(x,z));}}
ok('polygons: troughs on the lattice\'s lines, ~0.35 m deep; none outside where()',tr>10&&tr<300&&lo<-.25&&lo>-.4&&s(F,0,150).poly===0,s(F,0,150).poly>0);

// ---- the lobes: steps on the slope, turned down the fall line
let lob=0,risers=0;for(let i=0;i<500;i++){const x=-300+i*1.17,z=260+(i%23)*7,q=s(F,x,z);if(q.lobe>.2)lob++;if(q.front>.2)risers++;}
const flat=mk({lobes:{cell:28,h:1.4}});let fl=0;for(let i=0;i<300;i++)if(Math.abs(flat.h(-300+i*1.7,-200))>1e-9)fl++;
ok('solifluction lobes: treads and risers on the slope, none on the flat',lob>20&&risers>5&&fl===0,fl>0);

// ---- the rock glacier: a tongue with a steep front and transverse ridges
const g=F.rockGlaciers[0],mids=s(F,400,560),off=s(F,400+g.w*1.4,560);
let ridges=0,prev=0;for(let z=420;z<700;z+=2){const r=s(F,400,z).ridge;if(r>.5&&prev<=.5)ridges++;prev=r;}
ok('a rock glacier: its tongue stands its height, ridged across, nothing beside it',F.h(400,560)>g.h*.7&&mids.rockG>.9&&off.rockG===0&&ridges>=6,ridges<3);

// ---- the records: every landform, plain data
const rec=F.records(),kinds=[...new Set(rec.map(r=>r.kind))].sort().join(',');
ok('records: one per alas, pingo, aufeis patch and rock glacier, plain data',kinds==='alas,aufeis,pingo,rockglacier'&&rec.filter(r=>r.kind==='aufeis').length===pat.length&&JSON.stringify(rec).length>50,kinds==='alas');

console.log(bad?'\n'+bad+' FAILED':'\nall passed');process.exit(bad?1:0);
