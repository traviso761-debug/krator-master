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
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
