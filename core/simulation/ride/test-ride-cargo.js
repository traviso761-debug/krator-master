// node core/simulation/ride/test-ride-cargo.js — goods on the Line (PLAN-RIDING.md section 5): the trains as SIM.trade
// carriers, porters across the gap, the books reconciled by the ledger; each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
const CORE=path.join(__dirname,'..','..');
const SIMF=fs.readdirSync(path.join(CORE,'simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().map(f=>path.join('simulation',f));
const FILES=['rand/08-core-rand.js','sched/20-core-sched.js',...SIMF,'simulation/ride/78-sim-ride.js','simulation/ride/79-sim-ride-porters.js','simulation/ride/lab/40-ride-lab-world.js'];
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
function run(opt,days,each){
  FILES.forEach(f=>(0,eval)(fs.readFileSync(path.join(CORE,f),'utf8')));
  const S=window.SIM,clock={h:0,d:0,t:0};S.init({seed:5,hour:()=>clock.h,day:()=>clock.d,t:()=>clock.t,err:()=>{}});
  const L=RIDELAB.trade(RIDELAB.declare({}),opt||{});
  S.step();const snap0=S.ledgerSnap();
  for(let m=1;m<days*1440;m++){clock.t+=60;clock.d=Math.floor(m/1440);clock.h=(m%1440)/60+1e-7;S.step();if(each)each(S,L,clock,m);}
  return {S,L,clock,snap0};
}
const held=(S,L,g,skip)=>{let n=0;L.lojes.forEach(J=>{n+=(S.R.place[J.stop+'.stop'].stock[g]||0);});
  Object.values(L.routes).forEach(R=>{if(R===skip)return;R.carriers.forEach(C=>C.cargo.forEach(c=>{if(c.good===g)n+=c.n;}));});
  L.lojes.forEach(J=>{const E=S.econ(J.id);n+=(E.used[g]||0);});return n;};
let consOk=true,consNeg=true,walkOk=true,walkNeg=true,sails=0;
const W=run({},3,(S,L,clock)=>{
  ['grain','wax'].forEach(g=>{if(Math.abs(held(S,L,g)-L.start[g])>1e-6)consOk=false;if(Math.abs(held(S,L,g,L.routes.north)-L.start[g])>1e-6)consNeg=false;});
  const C=L.routes.porters.carriers[0],lead=S.R.actor[L.porters.crew[0]],p=S.pose(lead,clock.t+30),walking=C.phase==='sail';
  if(walking)sails++;if(walking!==p.moving)walkOk=false;if(!walking!==p.moving)walkNeg=false;});
const {S,L}=W;
const landed=r=>(L.routes[r].landed||{});
ok('grain goes the length of the Line: Ledge to the north gap by train, across the gap by porters, to Twenny by train',
  (landed('north')['ledge>gapn']||{}).grain>0&&(landed('porters')['gapn>gaps']||{}).grain>0&&(landed('south')['gaps>twenny']||{}).grain>0&&S.econ('twenny').imported.grain>0,false);
ok('and wax the other way, Twenny to Ledge',(landed('south')['twenny>gaps']||{}).wax>0&&(landed('porters')['gaps>gapn']||{}).wax>0&&(landed('north')['gapn>ledge']||{}).wax>0,false);
const stuck=run({portersStay:1e7},2);
ok('with the porters never leaving, nothing crosses the gap (the trace\'s negative)',(stuck.L.routes.porters.landed['gapn>gaps']||{}).grain===undefined&&!(stuck.S.econ('twenny').imported.grain>0),false);
ok('grain and wax are conserved every minute: in the stores, aboard, carried across, or used',consOk,consNeg);
const snap1=S.ledgerSnap(),LG=S.ledger(W.snap0,snap1);
S.R.place['gap.n.stop'].stock.grain=(S.R.place['gap.n.stop'].stock.grain||0)+50;
const LGbad=S.ledger(W.snap0,S.ledgerSnap());
ok('the books balance in every loj and on every leg, the rail legs and the porters\' (SIM.ledger)',LG.ok,LGbad.ok);
ok('the porters walk exactly while their route\'s carrier is on its way ('+sails+' minutes walking, '+L.porters.trips+' trips)',walkOk&&sails>0&&L.porters.trips>=4,walkNeg);
const crossing=S.LOG.filter(e=>e.kind==='porters'&&e.cargo);
ok('the porters\' trips carried goods across',crossing.length>0,false);
ok('the porters\' walk is the nav\'s route round the fall (a timed leg on the cavern, over 300 m)',(()=>{const a=S.R.actor[L.porters.crew[0]];return a.task&&a.task.legs[0].route.len>300;})(),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
