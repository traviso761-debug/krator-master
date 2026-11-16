// node core/anomaly/test-anomaly.js -- KANOM (20-core-anomaly.js): the records, the strength, the combined reading, the walk,
// the squash, the time owed, the hazards and the vocabulary rows; each check with a negative (PLAN-ANOMALIES.md 4 and 14).
'use strict';
const fs=require('fs'),path=require('path');
const C=p=>path.join(__dirname,'..',p);
require(C('rand/08-core-rand.js'));
const KT=require(C('tags/50-core-tags.js'));require(C('tags/52-core-tags-vocab.js'));
eval(fs.readFileSync(C('biome/37-core-traps.js'),'utf8'));
eval(fs.readFileSync(C('hazard/20-core-hazard.js'),'utf8'));
const V=KT.VOCAB,before=JSON.stringify(V);
const N=require(path.join(__dirname,'20-core-anomaly.js'));const H=globalThis.KHAZ;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const near=(a,b,e)=>Math.abs(a-b)<=(e==null?1e-9:e);

// ---- the vocabulary: the three rows and the key go in, nothing else moves; a page without the module keeps its own
const V2=JSON.parse(JSON.stringify(V));['crushing','aging','lift'].forEach(k=>delete V2.hazardKinds[k]);delete V2.keys.anomaly;
ok('loading core/anomaly adds crushing, aging, lift and tags.anomaly, and nothing else',JSON.stringify(V2)===before&&V.hazardKinds.crushing&&V.hazardKinds.lift&&V.keys.anomaly==='object',JSON.stringify(V)===before);
V.hazardKinds.lift.danger=.33;N.install();
ok('install never overwrites a row the page already has',V.hazardKinds.lift.danger===.33,V.hazardKinds.lift.danger===N.HAZARD_KINDS.lift.danger);V.hazardKinds.lift.danger=N.HAZARD_KINDS.lift.danger;
ok('the rows are well formed for core/hazard',['crushing','aging','lift'].every(k=>{const r=V.hazardKinds[k];return r.danger>=0&&r.danger<=1&&V.hazardFalloffs.indexOf(r.falloff)>=0&&r.nav&&/^#[0-9a-f]{6}$/.test(r.tell.colour)&&(r.effect==null||V.hazardEffects.indexOf(r.effect)>=0);}),false);

// ---- records: checked and filled
const R=N.create({seed:7});
const still=R.add({kind:'time',shape:{type:'circle',at:[0,0],r:600},time:1e-4,rim:200});
const press=R.add({kind:'gravity',shape:{type:'circle',at:[2000,0],r:500},g:3,rim:150});
const poly=R.add({kind:'bend',shape:{type:'poly',pts:[[-100,1000],[100,1000],[100,1200],[-100,1200]]},bend:.002,rim:40});
ok('records take ids in add order, a seed from core/rand and the kind\'s tell',still.id==='anom_00001'&&press.id==='anom_00002'&&still.seed===KRAND.hash(7,1,N.PRESETS.salt)&&still.tell.fx==='stillness'&&press.tell.fx==='pall',still.seed===press.seed);
ok('an unknown kind, a bad shape, a zero radius or a rate of 0 is refused',throws(()=>R.add({kind:'magic',shape:{type:'circle',at:[0,0],r:1}}))&&throws(()=>R.add({kind:'time',shape:{type:'square'}}))&&throws(()=>R.add({kind:'time',shape:{type:'circle',at:[0,0],r:0}}))&&throws(()=>R.add({kind:'time',time:0,shape:{type:'circle',at:[0,0],r:5}}))&&throws(()=>R.add({kind:'gravity',g:0,shape:{type:'circle',at:[0,0],r:5}}))&&throws(()=>R.add({kind:'time',shape:{type:'poly',pts:[[0,0],[1,1]]}})),
  throws(()=>N.create().add({kind:'time',shape:{type:'circle',at:[0,0],r:5}})));
ok('a duplicate id is refused',throws(()=>R.add({id:'anom_00001',kind:'time',shape:{type:'circle',at:[9e4,0],r:5}})),false);

// ---- the strength: 0 outside, the ramp over the rim, full inside it
const s=(rec,x,z,y)=>N.strength(rec,x,z,y);
ok('strength is 0 outside the shape and at its edge',s(still,601,0)===0&&s(still,600,0)===0&&s(poly,0,999)===0&&s(poly,0,1300)===0,s(still,0,0)===0);
ok('it ramps from the edge to the rim and is full inside the rim',s(still,500,0)>0&&s(still,500,0)<1&&near(s(still,400,0),1)&&near(s(still,0,0),1)&&s(still,450,0)>s(still,550,0),s(still,550,0)>=s(still,450,0));
ok('a polygon\'s strength ramps from its edges inward',s(poly,0,1100)===1&&s(poly,95,1100)>0&&s(poly,95,1100)<1,s(poly,0,1100)<1);
const band=R.add({kind:'time',shape:{type:'circle',at:[0,5000],r:100},y0:0,y1:50,time:.5});
ok('a height band holds only its heights',s(band,0,5000,10)===1&&s(band,0,5000,80)===0&&s(band,0,5000)===1,s(band,0,5000,80)>0);

// ---- at: free when absent; the combination
const A0=R.at(9e5,0,9e5);
ok('no record in reach: KANOM.NORMAL, the same frozen object, every reader unchanged',A0===N.NORMAL&&Object.isFrozen(A0)&&A0.g===1&&A0.time===1&&A0.bend===0&&N.walk(A0)===N.WALK0&&N.squash(A0)===N.IDENTITY,A0!==N.NORMAL);
ok('an empty registry reads NORMAL',N.create().at(0,0,0)===N.NORMAL,false);
const Ac=R.at(0,0,0),Ap=R.at(2000,0,0);
ok('the Stilled Ground\'s core reads time 1e-4 and nothing else',near(Ac.time,1e-4,1e-12)&&Ac.g===1&&Ac.ids.join()==='anom_00001',Ac.time===1);
ok('the Press\'s core reads 3 g',near(Ap.g,3,1e-9)&&Ap.time===1,Ap.g===1);
const half=R.add({kind:'gravity',shape:{type:'circle',at:[0,-9000],r:300},g:3,strength:.5});
ok('half strength is the geometric half: 3 g at .5 is sqrt(3) g',near(R.at(0,0,-9000).g,Math.sqrt(3),1e-9),near(R.at(0,0,-9000).g,2,1e-9));
const R2=N.create({seed:7}),a=R2.add({kind:'gravity',shape:{type:'circle',at:[0,0],r:400},g:2}),b=R2.add({kind:'gravity',shape:{type:'circle',at:[0,0],r:400},g:3});
const R3=N.create({seed:7});R3.add({id:'anom_00002',kind:'gravity',shape:{type:'circle',at:[0,0],r:400},g:3});R3.add({id:'anom_00001',kind:'gravity',shape:{type:'circle',at:[0,0],r:400},g:2});
ok('overlaps multiply (2 g in 3 g is 6 g) in id order whatever the add order',near(R2.at(0,0,0).g,6,1e-9)&&R2.at(0,0,0).ids.join()===R3.at(0,0,0).ids.join(),!near(R2.at(0,0,0).g,6,1e-9));
const Rl=N.create();Rl.add({kind:'gravity',shape:{type:'circle',at:[0,0],r:400},g:-1});
ok('a reversed record reads negative gravity at its core',Rl.at(0,0,0).g<0&&Rl.at(399,0,0).g>0,Rl.at(0,0,0).g>0);
ok('near finds the records within reach of a point',R.near(2000,0,0).map(r=>r.id).indexOf('anom_00002')>=0&&R.near(2000,0,0).map(r=>r.id).indexOf('anom_00001')<0,R.near(9e5,0,10).length>0);

// ---- the walk: heavy and slow; never stuck
const Wp=N.walk(Ap),Ws=N.walk(Ac),Wr=N.walk(R.at(550,0,0));
ok('3 g slows the walk, lowers the eye, shortens the step and the bob',Wp.speed<.5&&Wp.eye<1&&Wp.eye>.6&&near(Wp.step,1/3)&&Wp.bob<Wp.step,Wp.speed>=1);
ok('slow time slows the walk, more toward the core',Ws.speed<Wr.speed&&Wr.speed<1&&Ws.eye===1,Ws.speed>=Wr.speed);
ok('the walk never falls below the floor: a walker can always leave',N.walk({g:1e6,time:1e-12}).speed===N.PRESETS.walk.min&&Ws.speed>=N.PRESETS.walk.min,N.walk({g:1e6,time:1e-12}).speed<N.PRESETS.walk.min);
ok('light gravity and fast time leave the walk as it is',N.walk({g:.5,time:3})===N.WALK0,false);

// ---- the squash
const Q=N.squash(3);
ok('under 3 g a thing is shorter, spreads, sinks a little and keeps a third of its storeys',Q.sy<1&&Q.sxz>1&&Q.sink>0&&Q.sink<=.5&&near(Q.floors,1/3)&&near(N.squash(Ap).sy,Q.sy,1e-9),Q.sy>=1);
ok('at 1 g and below nothing is squashed',N.squash(1)===N.IDENTITY&&N.squash(.3)===N.IDENTITY&&N.squash({g:-1})===N.IDENTITY,N.squash(1.01)===N.IDENTITY);

// ---- the time owed
const S=N.owed({},1e-4,10);
ok('ten seconds at the core owe the world a day at most',S.owed===N.PRESETS.owedCap&&S.aged===0,S.owed<N.PRESETS.owedCap);
const S2=N.owed({},.5,10),S3=N.owed({},1,10),S4=N.owed({},4,10);
ok('half speed owes as long again; normal time owes nothing; fast time ages instead',near(S2.owed,10)&&S3.owed===0&&S3.aged===0&&S4.owed===0&&near(S4.aged,30),S3.owed>0);
ok('a bad rate or dt changes nothing',JSON.stringify(N.owed({owed:5},0,10))==='{"owed":5,"aged":0}'&&N.owed({owed:5},.5,-1).owed===5,N.owed({owed:5},.5,1).owed===5);

// ---- hazards
const hs=N.hazardOf(still),hp=N.hazardOf(press);
ok('the Stilled Ground is core/hazard\'s stasis at its rate; the Press is crushing, fatal at the core',hs.kind==='time'&&hs.time.scale===1e-4&&hp.kind==='crushing'&&H.make(hp).danger===1&&hp.dose>0,hp.kind!=='crushing');
ok('the bend, a light zone and a reversed one: none, none, lift',N.hazardOf(poly)===null&&N.hazardOf(N.create().add({kind:'gravity',g:.5,shape:{type:'circle',at:[0,0],r:5}}))===null&&N.hazardOf(Rl.list()[0]).kind==='lift',N.hazardOf(poly)!==null);
const T=KT.create({build:'test-anomaly'}),Rr=N.create({seed:3});Rr.add({kind:'time',shape:{type:'circle',at:[100,100],r:300},time:.01});Rr.add({kind:'gravity',shape:{type:'circle',at:[3000,0],r:300},g:2.5});
const regs=Rr.register(T);
ok('register puts each record in core/tags with its anomaly and its hazard, before anything is drawn',regs.length===2&&regs[0].tags.anomaly.kind==='time'&&regs[1].tags.hazard.kind==='crushing'&&H.list(T).length===2,H.list(T).length!==2);
const at0=H.at(100,100,0,0,T),at1=H.at(3000,0,0,0,T),out=H.at(9000,9000,0,0,T);
ok('core/hazard then finds them where they are and nowhere else',at0.length===1&&at0[0].kind==='time'&&at1.length===1&&at1[0].kind==='crushing'&&out.length===0,out.length>0);
ok('KHAZ.timeScale slows time at the stilled core',H.timeScale(100,100,0,0,T)<.05,H.timeScale(9000,9000,0,0,T)!==1);
Rr.add({kind:'gravity',shape:{type:'circle',at:[-3000,0],r:200},g:4});
ok('a record added after register goes in too',H.list(T).length===3,H.list(T).length!==3);
ok('zones list the hurting ones with the avoid flag',Rr.zones().length===3&&Rr.zones().every(z=>z.avoid),Rr.zones().length!==3);

// ---- determinism: the same calls, the same export
const mk=()=>{const r=N.create({seed:42});r.add({kind:'time',shape:{type:'circle',at:[5,5],r:50},time:.1});r.add({kind:'gravity',shape:{type:'poly',pts:[[0,0],[10,0],[10,10]]},g:2});return JSON.stringify(r.export());};
ok('the same calls give the same records, byte for byte; another seed does not',mk()===mk(),mk()===JSON.stringify(N.create({seed:43}).export()));
ok('the page registry delegates (KANOM.add, KANOM.at) and resets',(()=>{N.reset({seed:2});N.add({kind:'time',shape:{type:'circle',at:[0,0],r:10},time:.5});return N.at(0,0,0).time<1&&N.list().length===1;})(),N.reset().list().length!==0);

// ---- the walker binding: a stand-in camera; the zone's factors on, the walker's own speed and eye back on leaving
eval(fs.readFileSync(path.join(__dirname,'host','90-anomaly-walker.js'),'utf8'));
const V3=(x,y,z)=>({x,y,z});const cam={ctl:{target:V3(2000,1.7,0),eye:1.7,speed:2,walk:true}},Wk=N.bindWalker(cam,{anom:R,hook:()=>{}});
Wk.step(1/60);const inSp=cam.ctl.speed,inEye=cam.ctl.eye;
ok('walking into the Press: the speed and the eye fall by KANOM.walk',Wk.state.inside&&near(inSp,2*N.walk(R.at(2000,0,0)).speed,1e-9)&&inEye<1.7,!Wk.state.inside);
cam.ctl.speed*=1.1;cam.ctl.target=V3(9e5,0,9e5);Wk.step(1/60);
ok('walking out: the walker\'s own speed (with its wheel) and eye come back exactly',near(cam.ctl.speed,2.2,1e-9)&&cam.ctl.eye===1.7&&!Wk.state.inside,cam.ctl.speed===inSp*1.1);
cam.ctl.target=V3(0,1.7,0);for(let i=0;i<60;i++)Wk.step(1/60);
ok('a second at the stilled core owes the world 9,999 s',near(Wk.state.owed,1e4-1,1e-6),Wk.state.owed===0);
cam.ctl.walk=false;Wk.step(1/60);
ok('flying, the zone does nothing',near(cam.ctl.speed,2.2,1e-9)&&cam.ctl.eye===1.7,cam.ctl.eye!==1.7);
cam.ctl.walk=true;cam.ctl.target=V3(2000,1.7,0);Wk.step(1/60);Wk.unbind();Wk.step(1/60);
ok('unbind puts the walker back and the step does nothing after',near(cam.ctl.speed,2.2,1e-9)&&cam.ctl.eye===1.7,cam.ctl.eye!==1.7);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
