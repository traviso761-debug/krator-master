// node core/clock/test-clock.js — the world clock's contract, each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;eval(fs.readFileSync(path.join(__dirname,'20-core-clock.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-9);
const run=(C,secs)=>{for(let i=0;i<secs*60;i++)C.step(1/60);return C;};

const H=run(KCLOCK.make({hour:15}),60);
ok('held by default: a minute later the hour has not moved, motion time has',near(H.hour,15)&&near(H.t,60,1e-6)&&!H.running,!near(H.t,60,1e-6));
const R=run(KCLOCK.make({hour:15,running:true}),180);
ok('running: three real minutes is one world hour (a 72-minute day)',near(R.hour,16,1e-6),near(R.hour,15));
ok('20 world hours per real hour',near(R.rate(),20),near(R.rate(),24));
const D=run(KCLOCK.make({hour:23.5,day:4,running:true}),180);
ok('midnight wraps the hour and counts the day',near(D.hour,.5,1e-6)&&D.day===5,D.day===4);
const S=KCLOCK.make({hour:10});S.set(-1);
ok('set wraps into 0..24',near(S.hour,23),near(S.hour,-1));
const F=KCLOCK.make({running:true});F.fixed=37.3;run(F,10);
ok('a pinned clock: t is the pin, dt is 0, the hour holds',F.t===37.3&&F.dt===0&&near(F.hour,12),F.t!==37.3);
const B=KCLOCK.make();B.step(5);B.step(-1);B.step(NaN);
ok('a long frame is capped at 0.1 s; negative and NaN steps count as nothing',near(B.t,.1),near(B.t,5.1));
const P=KCLOCK.make({running:true,scale:0});run(P,30);
ok('scale 0 pauses both axes',P.t===0&&near(P.hour,12),P.t>0);
const X=run(KCLOCK.make({hour:6,running:true}),45),Y=KCLOCK.make().load(JSON.parse(JSON.stringify(X.state())));
ok('state round-trips through JSON',near(Y.hour,X.hour)&&near(Y.t,X.t)&&Y.running===X.running&&Y.day===X.day,false);

// ---- the season (H7): on the sky model's year, south by default, with the GDScript twin's golden
const sky=fs.readFileSync(path.join(__dirname,'..','atmos','sky','89-atmos-e-skymodel.js'),'utf8');
const skyN=k=>+(sky.match(new RegExp('\\b'+k+':\\s*([0-9.]+)'))||[])[1];
ok('KCLOCK.YEAR is the sky model\'s year (yearD, startDay, solsticeDay)',['yearD','startDay','solsticeDay'].every(k=>KCLOCK.YEAR[k]===skyN(k)),skyN('yearD')!==365);
const sAt=yd=>KCLOCK.season(yd-KCLOCK.YEAR.startDay,0);   // the season on a day of the year
const mid=sAt(350),win=sAt(350-182.5),spr=sAt(258.75),aut=sAt(350+91.25-365);
ok('southern midsummer (day 350): summer +1, the wettest, named summer',near(mid.summer,1)&&near(mid.wet,1)&&mid.name==='summer'&&near(mid.phase,0),near(mid.summer,-1));
ok('half a year on: midwinter, the driest',near(win.summer,-1)&&near(win.dry,1)&&win.name==='winter',win.name==='summer');
ok('the spring equinox (258.75) is spring, the autumn one autumn, both half wet',spr.name==='spring'&&aut.name==='autumn'&&near(spr.wet,.5,1e-9)&&near(aut.wet,.5,1e-9),spr.name==='autumn');
const g0=KCLOCK.season(0,6);
ok('game start (day 0, startDay 259) is the southern spring',g0.name==='spring'&&near(g0.yearDay,259.25),g0.name==='autumn');
const N=KCLOCK.season(350-259,0,{latitude:30});
ok('north of the equator the year turns half round: day 350 is northern midwinter',near(N.summer,-1)&&N.name==='winter',N.name==='summer');
const L=KCLOCK.season(350-259,0,{lagD:60}),L2=KCLOCK.season(410-259,0,{lagD:60});
ok('lagD: the wet peaks lagD days after midsummer, the named season does not move',L.wet<.9&&near(L2.wet,1)&&L.name==='summer'&&near(L.summer,1),near(L.wet,1));
const shp=KCLOCK.season(300-259,0,{sharp:4}),pl=KCLOCK.season(300-259,0);
ok('sharp squares the wet toward two seasons (still 1 at midsummer, 0.5 at the equinox)',shp.wet>pl.wet&&near(KCLOCK.season(91,0,{sharp:4}).wet,1)&&near(KCLOCK.season(258.75-259,0,{sharp:4}).wet,.5,1e-9),shp.wet<=pl.wet);
ok('wetIn winter: a Mediterranean year is dry at midsummer',near(KCLOCK.season(91,0,{wetIn:'winter'}).dry,1),near(KCLOCK.season(91,0,{wetIn:'winter'}).wet,1));
ok('a year later the season is the same; a negative day wraps',near(KCLOCK.season(91+365,5).wet,KCLOCK.season(91,5).wet)&&near(KCLOCK.season(-1,0).yearDay,258),near(KCLOCK.season(-1,0).yearDay,-1));
const CS=KCLOCK.make({hour:18,day:40});
ok('C.season() reads the clock\'s own day and hour',JSON.stringify(CS.season({sharp:2}))===JSON.stringify(KCLOCK.season(40,18,{sharp:2})),false);
// the golden for kseason.gd (node core/clock/test-clock.js --write rewrites it)
const OPTS=[{},{latitude:12},{lagD:45},{sharp:3},{lagD:-20,sharp:1.5,wetIn:'winter'},{latitude:-5,year:{yearD:400,startDay:10,solsticeDay:200}}];
const gold={opts:OPTS,cases:[]};
for(const day of [0,0.5,17,91,182.6,300,365,-40,1234.9])for(const hour of [0,6.5,23.99])OPTS.forEach((o,k)=>gold.cases.push({day,hour,opts:k,s:KCLOCK.season(day,hour,o)}));
const GF=path.join(__dirname,'golden-season.json'),gtext=JSON.stringify(gold,null,1)+'\n';
if(process.argv.includes('--write'))fs.writeFileSync(GF,gtext);
ok('golden-season.json is current (the twin kseason.gd is tested on it)',fs.existsSync(GF)&&fs.readFileSync(GF,'utf8')===gtext,false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
