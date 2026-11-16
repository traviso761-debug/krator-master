// node core/simulation/test-season.js — the seasons (77-sim-6-season.js, phase S1 of PROPOSAL-LONGSONG-PINNACLE.md) on a
// toy world: a field that makes only in its harvest window, a herd whose milk follows the quarters, the season's turns
// heard by a hook, and a world with no calendar unchanged. Each check with a negative.
const fs=require('fs'),path=require('path');
global.window=global;
const FILES=['77-sim-0-core.js','77-sim-1-world.js','77-sim-2-places.js','77-sim-3-actors.js','77-sim-4-nav.js','77-sim-5-motion.js','77-sim-5r-routes.js',
 '77-sim-6-economy.js','77-sim-6-govern.js','77-sim-6-items.js','77-sim-6-season.js','77-sim-7-ledger.js','77-sim-7-lod.js'];
(0,eval)(fs.readFileSync(path.join(__dirname,'..','clock','20-core-clock.js'),'utf8'));
let bad=0;const ok=(name,pass,neg,detail)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(detail?'  ('+detail+')':'')+(neg?' (its negative passed)':''));};
const YEAR={yearD:96,startDay:0,solsticeDay:0};   /* a short year (96 days, four quarters of 24) so a year runs fast */
function world(o){
  FILES.forEach(f=>(0,eval)(fs.readFileSync(path.join(__dirname,f),'utf8')));
  const S=window.SIM,clock={m:0,h:0,d:0,t:0};
  S.init({seed:3,hour:()=>clock.h,day:()=>clock.d,t:()=>clock.t});
  ['SLEEP','WORK','HERD'].forEach(a=>S.activity({id:a,indoor:a==='SLEEP'}));
  S.faction({id:'vale'});S.settlement({id:'vale',faction:'vale',name:'The vale'});S.org({id:'folk',faction:'vale'});
  S.nav.layer('pedestrian',{nodes:[{id:0,x:0,y:0,z:0},{id:1,x:40,y:0,z:0}],edges:[{id:0,a:0,b:1,kind:'ground',len:40,w:4}]});
  S.place({id:'home',kind:'home',x:0,z:0,activities:{SLEEP:4},settlement:'vale'});
  S.place({id:'field',kind:'field',x:40,z:0,activities:{WORK:4},settlement:'vale'});
  S.place({id:'byre',kind:'byre',x:40,z:0,activities:{WORK:2},settlement:'vale'});
  S.place({id:'granary',kind:'granary',x:0,z:0,activities:{WORK:1},settlement:'vale'});
  S.withEcon('vale',()=>{S.economy({goods:{grain:{},milk:{}},every:60});
   S.store('granary',{kind:'warehouse'});
   S.recipe('field',{out:['grain'],rate:1,season:o.season,seasonRate:o.seasonRate});
   S.recipe('byre',{out:[],rate:0,herd:{out:['milk'],rate:.5,seasonRate:o.herdRate}});});
  S.role({id:'farmer',org:'folk',sched:[[0,'SLEEP'],[6,'WORK'],[18,'SLEEP']]});
  S.actor({id:'f1',role:'farmer',home:'home',work:'field'});S.actor({id:'f2',role:'farmer',home:'home',work:'field'});
  for(let i=0;i<4;i++)S.actor({id:'cow'+i,role:'farmer',home:'byre',herd:'byre'});
  if(o.cal)S.calendar(o.cal);
  return{S,clock};}
function run(W,days,each){const {S,clock}=W;const end=clock.m+days*1440;
 for(;clock.m<end;clock.m++){clock.d=Math.floor(clock.m/1440);clock.h=(clock.m%1440+.5)/60;clock.t+=1;S.step();if(each&&clock.m%1440===0)each(clock.d);}}
const made=(S,g)=>{let n=0;S.withEcon('vale',()=>{n=(S.ECON.made[g]||0);});return n;};
const CAL={year:YEAR,windows:{harvest:[60,72]}};

// 1. the season itself: its quarters and its windows at the sim's own day
{const W=world({cal:CAL});const S=W.S;
 const a=S.season(0),b=S.season(65*1440),c=S.season(30*1440);
 ok('the season is core/clock\'s, read at the sim\'s day and hour: quarters turn, a window opens and closes',
  a&&b&&a.name!==c.name&&b.windows.harvest&&!a.windows.harvest&&S.inSeason('harvest',65*1440)&&!S.inSeason('harvest',10*1440),
  S.inSeason('harvest',10*1440),a&&[a.name,c.name,b.name].join(' / '));}
// 2. a field that makes only at harvest: across a year, every unit made inside the window
{const W=world({cal:CAL,season:'harvest'}),S=W.S,byDay={};let last=0;
 run(W,96,d=>{const m=made(S,'grain');byDay[d-1]=m-last;last=m;});
 const days=Object.keys(byDay).filter(d=>byDay[d]>0).map(Number),inWin=days.every(d=>d>=60&&d<72);
 const N=world({cal:CAL}),NS=N.S;let nlast=0,ndays=0;run(N,96,d=>{const m=made(NS,'grain');if(m>nlast)ndays++;nlast=m;});
 ok('a harvest recipe makes only in its window (and its hours out of season are booked "out of season")',days.length>3&&inWin,ndays<20,
  days.length+' days made, '+Math.round(last)+' grain; the unseasoned field '+ndays+' days');}
// 3. a herd's milk by the quarter: more in summer than in winter
{const W=world({cal:CAL,herdRate:{summer:1.5,winter:.25}}),S=W.S,q={};let last=0;
 run(W,96,d=>{const m=made(S,'milk'),Sn=S.season((d-1)*1440);q[Sn.name]=(q[Sn.name]||0)+m-last;last=m;});
 const N=world({cal:CAL}),NS=N.S,nq={};let nl=0;run(N,96,d=>{const m=made(NS,'milk'),Sn=NS.season((d-1)*1440);nq[Sn.name]=(nq[Sn.name]||0)+m-nl;nl=m;});
 ok('a herd\'s yield follows its seasonRate (summer over winter)',q.summer>q.winter*3,Math.abs(nq.summer-nq.winter)>nq.summer*.2,
  'summer '+Math.round(q.summer)+', winter '+Math.round(q.winter)+'; flat '+Math.round(nq.summer)+' / '+Math.round(nq.winter));}
// 4. the turns are heard: four quarters and the window's open and close in a year
{const W=world({cal:CAL}),S=W.S,heard=[];S.onSeason((now,before)=>heard.push(before.name+'>'+now.name+(now.windows.harvest?'+h':'')));
 run(W,96);
 ok('the season\'s turns are heard (S.onSeason): the quarters and the harvest window',heard.length>=5&&heard.some(h=>h.endsWith('+h')),heard.length<2,heard.join(', '));}
// 5. no calendar: nothing changes (the season factors 1, the field makes every day)
{const A=world({season:'harvest'}),B=world({});run(A,6);run(B,6);
 ok('without a calendar a seasonal recipe makes as any other',made(A.S,'grain')===made(B.S,'grain')&&made(A.S,'grain')>0,false,Math.round(made(A.S,'grain'))+' and '+Math.round(made(B.S,'grain')));}
console.log(bad?'\n'+bad+' FAILED':'\nOK');process.exit(bad?1:0);
