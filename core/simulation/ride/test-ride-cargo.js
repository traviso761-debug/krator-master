// node core/simulation/ride/test-ride-cargo.js — goods on the Line (PLAN-RIDING.md sections 5 and 8c): the lojes as books
// (SIM.lineEconomy), the trains as SIM.trade carriers, porters across the gap, the through-demand, the ledger; each check
// with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
const KV=require('./lab/kv-node.js');   /* the Line's cars (kits/motor-vehicles' built bundle) */
const CORE=path.join(__dirname,'..','..');
const SIMF=fs.readdirSync(path.join(CORE,'simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().map(f=>path.join('simulation',f));
const FILES=['rand/08-core-rand.js','sched/20-core-sched.js',...SIMF,'simulation/ride/78-sim-ride.js','simulation/ride/79-sim-ride-porters.js','simulation/ride/80-sim-ride-line.js','simulation/ride/lab/40-ride-lab-world.js'];
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
function run(opt,days,each){
  FILES.forEach(f=>(0,eval)(fs.readFileSync(path.join(CORE,f),'utf8')));
  const S=window.SIM,clock={h:0,d:0,t:0};S.init({seed:5,hour:()=>clock.h,day:()=>clock.d,t:()=>clock.t,err:()=>{}});
  const L=RIDELAB.trade(RIDELAB.declare({cars:KV}),opt||{});
  S.step();const snap0=S.ledgerSnap();const shortAt={};
  for(let m=1;m<days*1440;m++){clock.t+=60;clock.d=Math.floor(m/1440);clock.h=(m%1440)/60+1e-7;S.step();
    if(m===(days-1)*1440)L.lojes.forEach(J=>{shortAt[J.id]=Object.assign({},S.econ(J.id).short||{});});
    if(each)each(S,L,clock,m);}
  const lastShort={};L.lojes.forEach(J=>{const E=S.econ(J.id).short||{};lastShort[J.id]={};['grain','wax'].forEach(g=>{lastShort[J.id][g]=(E[g]||0)-((shortAt[J.id]||{})[g]||0);});});
  return {S,L,clock,snap0,lastShort};
}
/* what the lojes hold, what is aboard, what they used: with the start and what was made, every unit is accounted for */
const held=(S,L,g,skip)=>{let n=0;L.lojes.forEach(J=>{n+=(S.R.place[J.stop].stock[g]||0);});
  Object.values(L.routes).forEach(R=>{if(R===skip)return;R.carriers.forEach(C=>C.cargo.forEach(c=>{if(c.good===g)n+=c.n;}));});
  L.lojes.forEach(J=>{n+=(S.econ(J.id).used[g]||0);});return n;};
let consOk=true,consNeg=true,walkOk=true,walkNeg=true,sails=0;
const W=run({},4,(S,L,clock)=>{const M=L.economy.made;
  ['grain','wax'].forEach(g=>{if(Math.abs(held(S,L,g)-L.start[g]-M[g])>1e-6)consOk=false;if(Math.abs(held(S,L,g,L.routes.north)-L.start[g]-M[g])>1e-6)consNeg=false;});
  const C=L.routes.porters.carriers[0],lead=S.R.actor[L.porters.crew[0]],p=S.pose(lead,clock.t+30),walking=C.phase==='sail';
  if(walking)sails++;if(walking!==p.moving)walkOk=false;if(!walking!==p.moving)walkNeg=false;});
const {S,L}=W;
const landed=r=>(L.routes[r].landed||{});
ok('the lojes make and use by the hour with no buildings or people: Ledge made grain, Twenny wax, every loj ate',
  L.economy.made.grain>=2000&&L.economy.made.wax>=1600&&L.lojes.every(J=>(S.econ(J.id).used.grain||0)>0),false);
ok('grain goes the length of the Line: Ledge to the north gap by train, across the gap by porters, to Twenny by train',
  (landed('north')['ledge>gapn']||{}).grain>0&&(landed('porters')['gapn>gaps']||{}).grain>0&&(landed('south')['gaps>twenny']||{}).grain>0&&S.econ('twenny').imported.grain>0,false);
ok('and wax the other way, Twenny to Ledge',(landed('south')['twenny>gaps']||{}).wax>0&&(landed('porters')['gaps>gapn']||{}).wax>0&&(landed('north')['gapn>ledge']||{}).wax>0,false);
// what each good carried against its flow (grain toward Ledge, wax toward Twenny), against what it carried with it
const HOPS=[['north','ledge>gapn','gapn>ledge'],['porters','gapn>gaps','gaps>gapn'],['south','gaps>twenny','twenny>gaps']];
const carried=(g,back)=>HOPS.reduce((n,h)=>n+((landed(h[0])[(g==='grain')!==back?h[1]:h[2]]||{})[g]||0),0);
const backG=carried('grain',true),backW=carried('wax',true),fwdG=carried('grain',false),fwdW=carried('wax',false);
ok('goods barely go back toward the end that makes them (grain back '+backG+' of '+fwdG+', wax back '+backW+' of '+fwdW+': only the lojes\' own wants of their first stock)',
  backG<0.03*fwdG&&backW<0.03*fwdW&&fwdG>0&&fwdW>0,false);
ok('the gap lojes pass goods on: each imports grain and exports it again',['gapn','gaps'].every(id=>S.econ(id).imported.grain>0&&S.econ(id).exported.grain>0),false);
// the through-demand, where the gap is the bottleneck (the porters leave about once a day, resting ten hours at each end):
// with it each trip goes full and Twenny, at the far end, eats all its grain on the sixth day; without it (each hop serving
// only its own receiver's use) a trip carries what the gap loj itself wants and Twenny goes short every day
const full=run({portersStay:600},6),thin=run({through:false,portersStay:600},6);
const tw=full.lastShort.twenny.grain,twNo=thin.lastShort.twenny.grain;
ok('with the porters the bottleneck, Twenny\'s want is met on the sixth day (short '+tw+'); without the through-demand it falls short ('+twNo+')',tw===0&&twNo>0,!(twNo>0));
const stuck=run({portersStay:1e7},2);
ok('with the porters never leaving, nothing crosses the gap: Twenny gets no more grain than the south gap loj held at the start',
  (stuck.L.routes.porters.landed['gapn>gaps']||{}).grain===undefined&&(stuck.S.econ('twenny').imported.grain||0)<=40,false);
ok('grain and wax are conserved every minute: held, aboard, carried across or used = the start + what was made',consOk,consNeg);
const snap1=S.ledgerSnap(),LG=S.ledger(W.snap0,snap1);
S.R.place['gap.n.stop'].stock.grain=(S.R.place['gap.n.stop'].stock.grain||0)+50;
const LGbad=S.ledger(W.snap0,S.ledgerSnap());
ok('the books balance in every loj and on every leg, the rail legs and the porters\' (SIM.ledger)',LG.ok,LGbad.ok);
ok('the porters walk exactly while their route\'s carrier is on its way ('+sails+' minutes walking, '+L.porters.trips+' trips)',walkOk&&sails>0&&L.porters.trips>=4,walkNeg);
ok('the porters\' trips carried goods across',S.LOG.filter(e=>e.kind==='porters'&&e.cargo).length>0,false);
ok('the porters\' walk is the nav\'s route round the fall (a timed leg on the cavern, over 300 m)',(()=>{const a=S.R.actor[L.porters.crew[0]];return a.task&&a.task.legs[0].route.len>300;})(),false);
let threw=false;try{S.lineEconomy({id:'bad',goods:{grain:{}},lojes:[{id:'ledge',stop:'ledge.stop'},{id:'twenny',stop:'twenny.stop'}],links:[{from:'ledge',to:'nowhere',rail:'line.n'}]});}catch(e){threw=true;}
ok('a link to a loj the line does not have is refused',threw,false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
