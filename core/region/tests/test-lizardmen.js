// node core/region/tests/test-lizardmen.js — the Lizardmen's country on core/simulation (steps Z0-Z2 of
// core/simulation/PROPOSAL-LIZARDMEN.md; the owner, 2026-11-16 and 2026-11-17). Z0: the places (core/region/data/lz-tune.js)
// declared by core/region's valley host on their own make and a stocked start. Z1: the Allotment (core/region/51-region-allot.js),
// the Interpreters' plan at each quarter-day, no money and no profit. Z2: the Coil Rounds: every load round its season's way,
// the gifts round the coil, the memory debts. Gila is held to its own records (settlements/gila/src/88-gl-records.js GL_REC),
// as settlements/kirstabal/test-ks-town.js holds Kirstabal to XAN_TUNE. Each negative is a pair (tools/ktest.js).
const fs=require('fs'),path=require('path');
const T=require('../../../tools/ktest.js')(__filename);
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const load=()=>{(0,eval)(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
 (0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);
 (0,eval)(rd('core/region/50-region-valley.js'));(0,eval)(rd('core/region/51-region-allot.js'));
 (0,eval)(rd('settlements/gila/src/88-gl-records.js'));(0,eval)(rd('core/region/data/lz-tune.js'));return H;};
const t=n=>(n/1000).toFixed(1)+' t';
/* a run: the spec edited, `days` stepped, books and ledger; `mid` (days) takes a snapshot on the way */
function run(days,o,edit,mid){const H=load(),V=LZ_TUNE.valley(o||{});if(edit)edit(V);const S=H.simValley(V),a=SIM.ledgerSnap();let M=null;
 if(mid){H.valleyRun(mid*1440,60);M={B:JSON.parse(JSON.stringify(H.valleyBooks().towns)),gifts:S.allot?JSON.parse(JSON.stringify(S.allot.gifts)):null};H.valleyRun((days-mid)*1440,60);}
 else H.valleyRun(days*1440,60);
 const b=SIM.ledgerSnap();return{H,V,S,B:H.valleyBooks().towns,M,ledger:SIM.ledger(a,b,{tol:1}),check:S.allot?H.allotCheck():null};}
const fedCheck=Bk=>{const bad=[];Object.keys(Bk).forEach(s=>{const x=Bk[s];if(!x.people)return;Object.keys(x.eaten).concat(Object.keys(x.hungry)).forEach(g=>{const e=x.eaten[g]||0,h=x.hungry[g]||0;if(h>(e+h)*.01&&bad.indexOf(s+' '+g)<0)bad.push(s+' '+g+' '+(100*h/(e+h)).toFixed(0)+'%');});});return{ok:!bad.length,bad};};
const diff=(A,B,s,f,g)=>((B[s][f]||{})[g]||0)-((A[s][f]||{})[g]||0);
const t0=Date.now();
const Y=run(731,{allot:true},null,366);   /* two years with the Allotment: the first on a stocked start, the second the plan's own (366-731: four quarter-days) */
console.log('two years of the Lizardmen in '+((Date.now()-t0)/1000).toFixed(1)+' s: '+Y.S.order.length+' places, '+Y.V.settlements.reduce((n,s)=>n+s.people,0)+' people, '+Y.S.allot.loads.length+' loads');

// ---- Z0: the places
// 1. declared at the owner's numbers: Basilisk (the capital, once Sauropolis) 15,000; Tuatara, Komodo, Gila and Iguana 3,000; the
//    Tubes 1,000; the warrens 30,000 in bulk; the two reliquaries; no problems
{const P=k=>Y.V.settlements.find(s=>s.id===k)||{},pp=ks=>ks.reduce((n,k)=>n+(P(k).people||0),0);
 const good=Y.S.order.length===10&&!Y.S.problems.length&&P('basilisk').people===15000&&pp(['tuatara','komodo','gila','iguana'])===12000&&
  P('tubes').people===1000&&pp(['warrens-east','warrens-west'])===30000&&P('reliquary-west').people===0&&P('warrens-east').scale===200;
 T.ok('declared: Basilisk 15,000; Tuatara, Komodo, Gila, Iguana 3,000 each; the Tubes 1,000; the warrens 30,000 at 200 a head; two reliquaries; no problems',good,
  Y.S.order.length+' places; problems: '+(Y.S.problems.slice(0,3).join('; ')||'none'));}
// 2. Z0's own test: each place on its own make for a season, on the stocked start, fed; the books balance
{const Z=run(91,{allot:false});const f=fedCheck(Z.B);
 T.ok('Z0: a season on their own make and the stocked start: every place fed, the books balanced, nothing moved',f.ok&&Z.ledger.ok&&!Z.S.allot,
  (f.bad.slice(0,4).join('; ')||'none short')+'; ledger '+(Z.ledger.ok?'ok':Z.ledger.problems.slice(0,2).join('; ')));
 const D=run(91,{allot:false,days:20});T.neg('Z0: on a twenty-day larder the season goes hungry',Bk=>fedCheck(Bk).ok,D.B,Z.B);}

// ---- Z1: the Allotment
// 3. the books: the ledger balances over the two years, and the plan's own: what it took is what landed and what is on the road
T.ok('Z1: two years\' books balance, every place and good; the plan took what it landed and holds on the road',Y.ledger.ok&&Y.check.ok,
 (Y.ledger.ok?'ledger ok':Y.ledger.problems.slice(0,2).join('; '))+'; '+(Y.check.ok?'the plan accounted':Y.check.problems.slice(0,3).join('; ')));
// 4. everyone fed for two years: the capital's grain from Iguana, everyone's salt from Gila's pans and the capital's
{const f=fedCheck(Y.B);T.ok('Z1: every place fed for two years: grain, produce, meat, fish, salt and bronze ware all under 1 % short',f.ok,f.bad.slice(0,5).join('; ')||'none short');
 const D=run(365,{allot:{moves:false}});
 T.neg('Z1: a plan that reckons and moves nothing leaves the towns without salt and the capital without grain',Bk=>fedCheck(Bk).ok,D.B,Y.B);}
// 5. the salt and the bronze: salt lands at every place that makes none; the hall casts from Tuatara's copper and Komodo's tin,
//    and its bronze reaches every smithy
{const B=Y.B,noSalt=Object.keys(B).filter(s=>B[s].people&&!(B[s].made.salt>0)&&!(B[s].imported.salt>0));
 const cast=B.basilisk.made.bronze||0,plan=Y.V.settlements.find(s=>s.id==='basilisk').plan.make.bronze*2,
  noBronze=Object.keys(B).filter(s=>s!=='basilisk'&&B[s].people&&!(B[s].imported.bronze>0));
 const good=!noSalt.length&&cast>=plan*.8&&(B.basilisk.imported.copper||0)>0&&(B.basilisk.imported.tin||0)>0&&!noBronze.length;
 T.ok('Z1: salt reaches every place that makes none; the hall casts its plan from Tuatara\'s copper and Komodo\'s tin; bronze reaches every smithy',good,
  'no salt: '+(noSalt.join(', ')||'none')+'; cast '+t(cast)+' of '+t(plan)+'; copper in '+t(B.basilisk.imported.copper||0)+', tin in '+t(B.basilisk.imported.tin||0)+'; no bronze: '+(noBronze.join(', ')||'none'));}
// 6. the command, not the market: when Iguana's harvest fails, the plan feeds the capital (its need weighs most) from below the
//    warrens' reserve; without that rule the capital goes short
{const fail=V=>{const s=V.settlements.find(x=>x.id==='iguana');s.works.find(w=>w.id==='iguana.grain').rate=0;s.plan.make.grain=0;};
 const Dp=run(548,{allot:true,days:60},fail),Nd=run(548,{allot:{deep:0},days:60},fail);   /* a year and a half on a sixty-day larder */
 const short=R=>{const x=R.B.basilisk;return(x.hungry.grain||0)/((x.eaten.grain||0)+(x.hungry.grain||0));};
 T.ok('Z1: Iguana\'s harvest fails: the plan sends grain from below the warrens\' reserve to the capital ('+Dp.S.allot.loads.filter(l=>l.deep).length+' such loads)',
  Dp.S.allot.loads.some(l=>l.deep&&l.good==='grain'&&l.to==='basilisk')&&short(Dp)<short(Nd),
  'the capital short of grain '+(100*short(Dp)).toFixed(1)+'% with the rule, '+(100*short(Nd)).toFixed(1)+'% without');
 T.neg('Z1: a plan that never sends from below a reserve leaves the capital shorter',R=>short(R)<=short(Dp)+1e-9&&R.S.allot.loads.some(l=>l.deep),Nd,Dp);}
// 7. GILA IS ITS RECORDS: the tune's Gila is GL_REC (people, each work's year, each good's need), and the second year's books
//    come out near the village's own: salt made ~300 t and ~275 t sent, bronze ~6 t in
{const G=LZ_TUNE.fromGila(GL_REC),P=Y.V.settlements.find(s=>s.id==='gila'),yr=x=>Object.fromEntries(Object.entries(x).map(([g,n])=>[g,Math.round(n)]));
 const same=G.people===P.people&&P.people===3000&&JSON.stringify(yr(G.make))===JSON.stringify(yr(P.plan.make))&&
  Object.keys(G.eat).every(g=>Math.abs(P.eats[g]*365*P.people-GL_REC.seasons.reduce((n,s)=>n+GL_REC.goods[g].need[s],0)*1000)<1);
 const A=Y.M.B,B=Y.B,saltMade=diff(A,B,'gila','made','salt'),saltOut=diff(A,B,'gila','exported','salt'),bronzeIn=diff(A,B,'gila','imported','bronze');
 const books=Math.abs(saltMade-300000)<=15000&&Math.abs(saltOut-275000)<=275000*.2&&Math.abs(bronzeIn-6000)<=6000*.35;
 T.ok('Gila held to GL_REC: 3,000 by caste, its works and needs the village\'s own; the second year makes '+t(saltMade)+' of salt, sends '+t(saltOut)+' (GL_REC 275 t) and takes '+t(bronzeIn)+' of bronze (6 t)',same&&books,
  'same records: '+same);
 const bad=Object.assign({},GL_REC,{castes:GL_REC.castes.map(c=>c.id==='tenders'?Object.assign({},c,{people:900}):c)});
 T.neg('Gila held to GL_REC: a tune built from records that drifted (900 Tenders) is not the village\'s',R=>LZ_TUNE.fromGila(R).people===P.people,bad,GL_REC);}

// ---- Z2: the Coil Rounds
// 8. no load goes straight: every load rides its season's way round its loop, a load for the other loop by the capital
const coilOK=loads=>loads.every(L=>{const C=LZ_TUNE.coil,want=Y.H.allotRoute(C,L.from,L.to,C.dir[L.season]);return want&&JSON.stringify(want)===JSON.stringify(L.via);});
{const L=Y.S.allot.loads,cross=L.filter(l=>l.via.indexOf('basilisk')>0&&l.via.indexOf('basilisk')<l.via.length-1),long=L.filter(l=>l.via.length>2);
 T.ok('Z2: every one of '+L.length+' loads rides the Coil its season\'s way ('+long.length+' past other stops, '+cross.length+' through the capital to the other loop)',coilOK(L)&&long.length>0&&cross.length>0);
 const straight=L.slice(0,3).concat([Object.assign({},L.find(l=>l.via.length>2),{via:[L.find(l=>l.via.length>2).from,L.find(l=>l.via.length>2).to]})]);
 T.neg('Z2: a load sent straight past its Coil stops is caught',coilOK,straight,L.slice(0,4));}
// 9. the gifts go round the whole coil once a year each way (bronze outward, bone inward); the memory debts are kept by id
{const G=Y.M.gifts,home=G.every(g=>g.laps===1&&g.holder===LZ_TUNE.allot.gifts.find(x=>x.id===g.id).holder),D=Y.S.allot.debts;
 T.ok('Z2: the four gifts are home after a year, once round the coil each way; '+D.length+' memory debts, '+D.filter(d=>d.settled).length+' settled by bone passing back',home&&D.length>0&&D.some(d=>d.settled),
  G.map(g=>g.id+' at '+g.holder+' x'+g.laps).join(', '));}
// 10. the relics go to the reliquaries: the Tubes' to the west's, Iguana's from the Pile to the east's
{const B=Y.B;T.ok('Z2: the relics are sunk in the reliquaries: west '+t(B['reliquary-west'].imported.relics||0)+' from the Tubes, east '+t(B['reliquary-east'].imported.relics||0)+' from Iguana',
  (B['reliquary-west'].imported.relics||0)>0&&(B['reliquary-east'].imported.relics||0)>0);}
console.log('in '+((Date.now()-t0)/1000).toFixed(1)+' s');
T.done();
