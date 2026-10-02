// node core/sched/test-sched.js — the schedule functions' contract, each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;eval(fs.readFileSync(path.join(__dirname,'20-core-sched.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const S=KSCHED,near=(a,b,e)=>Math.abs(a-b)<(e||1e-9);

// a lifter: 14 s up, 6 s docked, 13 s down, in a 36 s period (Homeworld's)
const T=S.timeline({period:36,segments:[{dur:14,from:[0,0,0],to:[0,100,0],name:'up'},{dur:6,from:[0,100,0],name:'docked'},{dur:13,from:[0,100,0],to:[0,0,0],name:'down'}]});
ok('starts at the bottom',near(T.at(0).value[1],0),near(T.at(0).value[1],100));
ok('half way up at 7 s (smooth ease is symmetric)',near(T.at(7).value[1],50),near(T.at(7).value[1],0));
ok('holds while docked',T.at(16).name==='docked'&&near(T.at(16).value[1],100),T.at(16).name==='up');
ok('holds the last value after the segments end',near(T.at(34).value[1],0)&&T.at(34).seg===2,!near(T.at(34).value[1],0));
ok('repeats every period',near(T.at(7+36*5).value[1],T.at(7).value[1])&&T.at(7+36*5).cycle===5,T.at(7+36*5).cycle===0);
ok('negative time wraps the same way',near(T.at(-29).value[1],T.at(7).value[1]),false);
const T2=S.timeline({period:36,phase:6,segments:T.export().segments});
ok('a phase offsets one craft from the next',near(T2.at(1).value[1],T.at(7).value[1]),near(T2.at(1).value[1],T.at(1).value[1]));
ok('the export is plain data',JSON.stringify(T.export()).indexOf('docked')>0&&T.export().segments[1].to[1]===100,false);
let threw=false;try{S.timeline({period:10,segments:[{dur:8,from:0,to:1},{dur:5,from:1}]});}catch(e){threw=true;}
ok('segments longer than the period are refused',threw,false);

// slots
const sl=S.slots(4,60,12);ok('slots spread over the period',sl.length===4&&sl.every((p,i)=>i===0||p-sl[i-1]>=12),sl.length!==4);
threw=false;try{S.slots(6,60,12);}catch(e){threw=true;}ok('slots that cannot fit are refused',threw,false);

// eruption: every 120 s for 20 s
const E=S.eruption({interval:120,duration:20});
ok('quiet between eruptions',E.at(60).amp===0&&!E.at(60).on,E.at(60).on);
ok('full strength mid-eruption',near(E.at(8).amp,1)&&E.at(8).on,E.at(8).amp<.5);
ok('dies away at the end, to the tail',E.at(19.99).amp<.2&&E.at(19.99).amp>0,E.at(19.99).amp>.9);
ok('splashing before it goes',E.at(110).amp>0&&E.at(110).amp<=.2,E.at(110).amp===0&&E.at(111).amp===0&&E.at(112).amp===0);
ok('the cloud lingers after',E.at(30).cloud>.5&&E.at(70).cloud===0,E.at(30).cloud===0);
ok('the same time gives the same strength',E.at(1234.5).amp===S.eruption({interval:120,duration:20}).at(1234.5).amp,false);
threw=false;try{S.eruption({interval:10,duration:20});}catch(e){threw=true;}ok('a duration longer than the interval is refused',threw,false);

// formation: leader heading +x; right is +z (south)
const F=S.formation([0,10,0],0,[[5,10,0],[-5,10,2]]);
ok('a wingman sits behind and to the right',near(F[0][0],-10)&&near(F[0][2],5),near(F[0][0],10));
ok('offsets turn with the leader',(()=>{const G=S.formation([0,0,0],Math.PI/2,[[0,10,0]]);return near(G[0][2],-10,1e-6)&&near(G[0][0],0,1e-6);})(),false);
ok('up is up',near(F[1][1],12),false);

// approach
const A=S.approach({from:9000,lateral:[200,40]});
ok('it closes from the start to the berth',near(A.at(0).dist,9000)&&near(A.at(1).dist,0),A.at(1).dist>0);
ok('it slows as it arrives (more ground covered early)',A.at(.5).dist<4500,A.at(.5).dist>=4500);
ok('lateral offset merges into the lane',near(A.at(0).lateral[0],200)&&near(A.at(.95).lateral[0],0),A.at(.95).lateral[0]>1);
ok('it aligns only at the end',A.at(.5).align===0&&near(A.at(1).align,1),A.at(.5).align>0);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
