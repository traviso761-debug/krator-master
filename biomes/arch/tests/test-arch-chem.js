// node biomes/arch/tests/test-arch-chem.js -- the Arch's chemistry and clocks (biomes/arch/PLAN.md section 3): springs, mixing, the gradient,
// where a curtain can stand, the energy a spring gives, nickel uptake, where life stops, Earth or native, the rifting episode.
// Each check carries a negative: a broken input that must fail. No browser.
const fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..','..','..');
global.window=global;
eval(fs.readFileSync(path.join(ROOT,'core','rand','08-core-rand.js'),'utf8')+';global.KRAND=KRAND;');
eval(fs.readFileSync(path.join(__dirname,'..','src','40-biome-arch-chem.js'),'utf8')+';global.ARCH=ARCH;');
eval(fs.readFileSync(path.join(__dirname,'..','src','41-biome-arch-sites.js'),'utf8')+';global.ARCH_SITES=ARCH_SITES;');
eval(fs.readFileSync(path.join(__dirname,'..','src','42-biome-arch-meeting.js'),'utf8'));
const A=ARCH;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,t)=>Math.abs(a-b)<=t;
// ---- the Nernst factor and the gradient (PLAN.md 3.2)
ok('60.2 mV per pH unit at 30 C, 59.2 at 25 C',near(A.NERNST(30),60.15,0.05)&&near(A.NERNST(25),59.16,0.05),near(A.NERNST(30),59.16,0.05));
ok('nine pH units at 30 C is about 540 mV ('+A.gradient(11.5,2.5,30).toFixed(0)+')',near(A.gradient(11.5,2.5,30),541,3),near(A.gradient(11.5,2.5,30),200,50));
ok('2.7-3.6 times a cell\'s 150-200 mV',A.gradient(11.5,2.5,30)/200>2.6&&A.gradient(11.5,2.5,30)/150<3.7,A.gradient(8,7,30)/150>2.6);
// ---- the springs stay in their types' ranges, and are deterministic
{let inr=true;for(const k of Object.keys(A.SPRINGS))for(let i=0;i<200;i++){const s=A.spring(k,77,i),R=A.SPRINGS[k];for(const q of ['pH','T','H2','Ni'])if(s[q]<R[q][0]-1e-9||s[q]>R[q][1]+1e-9)inr=false;}
 const s1=A.spring('typeII',77,3),s2=A.spring('typeII',77,3),s3=A.spring('typeII',78,3);
 ok('every spring\'s numbers inside its type\'s range (800 draws)',inr,false);
 ok('a spring is the same for the same seed and index, another for another seed',JSON.stringify(s1)===JSON.stringify(s2)&&s1.pH!==s3.pH,JSON.stringify(s1)===JSON.stringify(s3));
 ok('type II is hyperalkaline and carries hydrogen; type I does not',A.spring('typeII',1,0).pH>=11&&A.spring('typeII',1,0).H2>0&&A.spring('typeI',1,0).H2===0,A.spring('typeI',1,0).pH>=11);}
// ---- the charge balance round-trips and mixing behaves
{let worst=0;for(const pH of [1.5,2.5,4,6,7,8.2,9,10,11,11.9])for(const dic of [0,0.05,2,8]){const w={pH,dic};worst=Math.max(worst,Math.abs(A.pHof(A.anc(w),dic)-pH));}
 ok('pHof(anc(w)) gives back w\'s pH (worst '+worst.toExponential(1)+')',worst<1e-6,A.pHof(A.anc({pH:11,dic:0}),0)<10);}
{const alk={pH:11.5,dic:0.02,Ca:2,Mg:0,T:35},acid={pH:2.5,dic:4,Ca:0.5,Mg:2,T:50};
 const m0=A.mix(alk,acid,0),m1=A.mix(alk,acid,1),mh=A.mix(alk,acid,0.5);
 ok('mix at f=1 is the alkaline water, at f=0 the acid',near(m1.pH,11.5,1e-6)&&near(m0.pH,2.5,1e-6),near(m1.pH,2.5,1e-6));
 let mono=true,prev=-1;for(let f=0;f<=1.0001;f+=0.02){const p=A.mix(alk,acid,f).pH;if(p<prev-1e-9)mono=false;prev=p;}
 ok('more alkaline water never lowers the mixed pH',mono,false);
 const fN=(()=>{let lo=0,hi=1;for(let i=0;i<60;i++){const m=(lo+hi)/2;if(A.mix(alk,acid,m).pH<7)lo=m;else hi=m;}return lo;})();
 ok('the neutral mix needs '+(100*fN).toFixed(1)+'% alkaline water (OH- 3.2 mM against H+ 3.2 mM and the acid water\'s CO2, which buffers)',fN>0.3&&fN<0.7,fN<0.01);
 ok('the alkaline water oversaturates calcite with a little acid water\'s carbon; pure acid does not',A.mix(alk,acid,0.95).calcite&&!m0.calcite,m0.calcite);}
// ---- where a curtain can stand (PLAN.md 3.2)
{const good={alk:{pH:11.4,v:0.1,T:35},acid:{pH:2.6,v:0.15,T:45}};
 ok('a slow, cool, 8.8-unit meeting holds a curtain',A.canStand(good).ok,false);
 ok('a turbulent meeting (0.9 m/s) refuses one',!A.canStand({alk:good.alk,acid:{pH:2.6,v:0.9,T:45}}).ok,A.canStand({alk:good.alk,acid:{pH:2.6,v:0.9,T:45}}).ok);
 ok('a hot meeting (80 C) refuses one',!A.canStand({alk:good.alk,acid:{pH:2.6,v:0.1,T:80}}).ok,false);
 ok('a weak difference (pH 8.5 against 6) refuses one',!A.canStand({alk:{pH:8.5,v:.1,T:30},acid:{pH:6,v:.1,T:30}}).ok,false);
 ok('pH 0.6 on the acid side refuses one (nothing lives)',!A.canStand({alk:good.alk,acid:{pH:0.6,v:.1,T:40}}).ok,false);}
// ---- what a spring feeds
{const c=A.curtainMass(1,11.5,2.5);ok('1 L/s at pH 11.5 against 2.5: about 165 W ('+c.W.toFixed(0)+') and 330 kg at 10% and .05 W/kg ('+c.kg.toFixed(0)+')',near(c.W,165,10)&&near(c.kg,330,20),near(A.curtainMass(1,9,2.5).W,165,10));
 ok('the mass scales with the flow',near(A.curtainMass(10,11.5,2.5).kg,10*c.kg,1e-6),false);}
// ---- nickel uptake (PLAN.md 3.3)
{const soil={ni:3000,pH:6,caMg:0.1,n:0.2,p:0.2},rich={ni:5000,pH:5.5,caMg:0.05};
 const hy=['pycnandra','phyllanthus','geissois','hybanthus','berkheya','verdigris'].map(s=>[s,A.uptake(s,soil)]);
 ok('every hyperaccumulator passes 1,000 ug/g on serpentine laterite: '+hy.map(([s,u])=>s+' '+u.leaf.toFixed(0)).join(', '),hy.every(([s,u])=>u.hyper),false);
 const ex=['araucaria','agathis','costularia','metrosideros','nepenthes'].map(s=>A.uptake(s,rich).leaf);
 ok('no excluder passes 100 ug/g even on the richest ground (worst '+Math.max(...ex).toFixed(0)+')',Math.max(...ex)<100,A.uptake('pycnandra',rich).leaf<100);
 ok('Pycnandra\'s latex reaches about a fifth nickel on rich ground ('+(A.uptake('pycnandra',rich).latex/1e4).toFixed(1)+'%)',A.uptake('pycnandra',rich).latex>150000,A.uptake('pycnandra',{ni:30,pH:7}).latex>150000);
 ok('on ordinary ground (ni 30 mg/kg) a hoarder is not a hyperaccumulator',!A.uptake('pycnandra',{ni:30,pH:7}).hyper,A.uptake('pycnandra',{ni:30,pH:7}).hyper);
 let threw=false;try{A.uptake('oak',soil);}catch(e){threw=true;}ok('an unknown species throws',threw,false);}
{const s=A.syndrome({ni:4000,caMg:0.05,n:0.1,p:0.1}),o=A.syndrome({ni:40,caMg:3,n:1,p:1});
 ok('serpentine ground scores high on the syndrome ('+s.toFixed(2)+'), ordinary ground low ('+o.toFixed(2)+')',s>0.7&&o<0.1,o>0.7);
 ok('the stunt follows it (maquis to a quarter of the height)',A.stunt({ni:5000,caMg:0,n:0,p:0})<0.3&&A.stunt({ni:0,caMg:3,n:1,p:1})===1,false);}
// ---- where life stops, Earth or native (PLAN.md 3.4, 3.5)
ok('pH 0.5 holds nothing',A.lifeAt({pH:0.5,T:40})==='none',A.lifeAt({pH:2,T:40})==='none');
ok('95 C holds nothing; 60 C holds native life',A.lifeAt({pH:6,T:95})==='none'&&A.lifeAt({pH:6,T:60})==='native',A.lifeAt({pH:6,T:60})==='earth');
ok('a pH 11.5 apron is native ground, pH 6 laterite Earth ground',A.lifeAt({pH:11.5,T:30})==='native'&&A.lifeAt({pH:6,T:28})==='earth',A.lifeAt({pH:11.5,T:30})==='earth');
ok('flowing spring water is native ground whatever its pH',A.lifeAt({pH:8.5,T:28,spring:true})==='native',false);
ok('lava two years old holds nothing; twenty years old not yet Earth (lag 30)',A.lifeAt({pH:7,lavaAge:2})==='none'&&!A.earthOk({pH:7,lavaAge:20})&&A.earthOk({pH:7,lavaAge:60}),A.earthOk({pH:7,lavaAge:20}));
ok('a Ca:Mg of .01 refuses Earth life; .05 allows it',!A.earthOk({pH:6.5,caMg:0.01})&&A.earthOk({pH:6.5,caMg:0.05}),A.earthOk({pH:6.5,caMg:0.01}));
// ---- the rifting episode (PLAN.md 3.6)
{const e1=A.episode(3,1200),e2=A.episode(3,1200),e3=A.episode(4,1200);
 ok('an episode is the same for the same segment and year',JSON.stringify(e1)===JSON.stringify(e2),false);
 ok('another segment has another clock',e1.recur!==e3.recur,e1.recur===e3.recur);
 let inr=true,states={};for(let s=0;s<40;s++){const e=A.episode(s,0);if(e.recur<250||e.recur>600||e.dur<2||e.dur>10||e.opening<1||e.opening>8)inr=false;}
 for(let y=0;y<4000;y++){states[A.episode(3,y).state]=1;}
 ok('recurrence 250-600 y, duration 2-10 y, opening 1-8 m on 40 segments',inr,false);
 ok('over 4,000 years a segment passes through every state: '+Object.keys(states).sort().join(', '),['eruption','inflation','intrusion','quiet'].every(k=>states[k]),false);
 const e=A.episode(3,500);ok('since + next is the recurrence',near(e.since+e.next,e.recur,1e-6),near(e.since+e.next,e.recur+1,1e-6));
 let cyc=true;for(let y=0;y<3000;y+=37){const a=A.episode(5,y),b=A.episode(5,y+a.recur);if(a.state!==b.state||!near(a.since,b.since,1e-6))cyc=false;}
 ok('the clock repeats with its recurrence',cyc,false);}
// ---- the confluence's meeting (PLAN.md 3.2, 11; 42): the curtains stand on the bench and stop where the outflow drops over the edge fault
{const S=ARCH_SITES.confluence,M=ARCH.meeting(S),M2=ARCH.meeting(S);
 const scarpS=(S.profile.scarpU[0]-ARCH.uOf(S.meet.x,S.meet.z))/((M.dir[0]+M.dir[1])*Math.SQRT1_2);
 ok('the curtains end at the edge fault (s '+M.end+', the fault at s '+scarpS.toFixed(0)+')',Math.abs(M.end-scarpS)<30,Math.abs(M.end-scarpS-200)<30);
 ok('every sample before the end can stand, none after',M.samples.every(x=>x.s<M.end?x.stand:!x.stand),M.samples.every(x=>x.stand));
 ok('the meeting is the same twice',JSON.stringify(M)===JSON.stringify(M2),false);
 ok('the halves keep apart while curtains stand (difference over 7 to the end) and mix after',M.samples.filter(x=>x.stand).every(x=>x.pHa-x.pHb>7)&&Math.abs(M.samples[M.samples.length-1].pHa-M.samples[M.samples.length-1].pHb)<.01,false);
 const fast=Object.assign({},S,{profile:Object.assign({},S.profile,{bench:.08})});
 ok('on a steeper bench (8%) no curtain can stand at all',ARCH.meeting(fast).end===0,ARCH.meeting(S).end===0);
 ok('the profile falls south-east and steps down the fault by its drop',ARCH.profile(S,-500)>ARCH.profile(S,0)&&ARCH.profile(S,S.profile.scarpU[0])-ARCH.profile(S,S.profile.scarpU[1])>S.profile.scarpDrop-1,false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
