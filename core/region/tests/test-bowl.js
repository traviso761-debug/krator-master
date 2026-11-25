// node core/region/tests/test-bowl.js — the Bowl on core/simulation (step S2 of openworld/catch-bowl/PLAN-SIM.md
// section 3; the owner, 2026-11-24). The Bowl's six places (core/region/data/bowl-tune.js) declared by core/region's
// valley host at the abstract level, on their own make and a stocked start, for a year -- as C0 did for the Catch before
// its rounds were put on -- and then S2's SECOND HALF: the Bowl's five trade roads, and `BOWL_TUNE.join`, which puts the
// Bowl into the Catch-joined valley and brings the Train of Jabal home from its off-map pool to Jabal itself.
// Each negative is a pair (tools/ktest.js).
const fs=require('fs'),path=require('path');
const T=require('../../../tools/ktest.js')(__filename);
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const load=()=>{(0,eval)(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
 (0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);(0,eval)(rd('core/region/50-region-valley.js'));
 (0,eval)(rd('core/region/data/bowl-tune.js'));return H;};
const t=n=>(n/1000).toFixed(1)+' t';
function run(days,edit){const H=load(),V=BOWL_TUNE.valley({});if(edit)edit(V);const S=H.simValley(V);
 const a=SIM.ledgerSnap();H.valleyRun(days*1440,60);const b=SIM.ledgerSnap(),sites={};
 S.order.forEach(s=>(SIM.sitesReport(s)||[]).forEach(x=>{sites[x.id]=Object.assign({settlement:s},x);}));
 return{H,V,S,B:H.valleyBooks().towns,ledger:SIM.ledger(a,b,{tol:1}),sites};}
const t0=Date.now(),Y=run(365),B=Y.B;
console.log('a year of the Bowl in '+((Date.now()-t0)/1000).toFixed(1)+' s: '+Y.S.order.length+' settlements, '
 +Y.V.settlements.reduce((n,s)=>n+s.people,0)+' people at 1 actor to '+Y.V.scale);

// ---- the places
/* `arco` was Arcbeam until 2026-11-25, when the owner moved Arcbeam to the arachnoid canyons and left "an arcology
   TBD of about 10k + hinterlands" on the north road. The id is Arcbeam's old one, standing in until the new model
   issues one (core/region/data/bowl-tune.js, its header) */
const ID={jabal:'sa5o6dvjdv',mantis:'slw9dufqfs',solta:'s0zgu7u6yb',arco:'skz25tuq0w',parabola:'scyeauyek7',esper:'sq11desertw7'};
{const want=Object.values(ID).concat(['slw9dufqfs.ring','skz25tuq0w.ring']),got=Y.S.order.slice().sort();
 const good=want.every(x=>got.indexOf(x)>=0);
 T.ok('S2: the Bowl\'s six places run, and Mantis\'s and the north road\'s arcology\'s hinterlands with them -- eight settlements',good&&Y.S.order.length===8,
  Y.V.settlements.map(s=>s.id.replace(/^s/,'')+' '+s.people).join(', '));
 T.neg('a tune missing a place does not pass for the whole Bowl',
  x=>x.length===8,want.slice(1),want);}
// every place keeps its people fed off its own make and its stocked start: nobody starves in a year
{const hungry=Object.keys(B).filter(id=>{const b=B[id];return b&&b.short&&Object.keys(b.short).length>0;});
 T.ok('S2: a year on its own make and a 400-day start leaves no Bowl place short',hungry.length===0,
  hungry.length?hungry.join(', ')+' short':'six places, none short');
 T.neg('a place whose wells were never dug does run short',
  x=>x.length===0,['slw9dufqfs'],hungry);}
/* ---- S2's second half, part 1: THE BOWL'S FIVE TRADE ROADS (BOWL_TUNE.trade). Each is between two places this tune
   declares, so they run here as well as in the join. The one the plan names is Jabal -> Mantis: MANTIS BUYS ITS SALT
   FROM THE TRAIN, which is the grievance its Izani houses carry onto the Catch road (PLAN-SIM.md section 3, and the one
   pair in BOWL_TUNE.rivals). */
const RD=id=>Y.V.roads.find(r=>r.id===id),TR=BOWL_TUNE.trade.map(r=>r.id);
{const got=TR.filter(id=>!!RD(id)),lanes=Y.V.roads.filter(r=>/^lane\./.test(r.id));
 T.ok('S2: the Bowl\'s five trade roads are declared beside the two hinterland lanes, each measured off its own places',
  got.length===5&&lanes.length===2&&TR.every(id=>(RD(id)||{}).minutes>0),
  got.map(id=>id.replace('trade.','')+' '+Math.round(RD(id).minutes/1440)+' d').join(', '));
 T.neg('a road with no passage time is not a measured road',
  x=>x.every(r=>r.minutes>0),TR.map(id=>Object.assign({},RD(id),{minutes:0})),TR.map(id=>RD(id)));}
/* Esper's market is the arcology, not Jabal: its own record says "72 km from Arcbeam" and the model agrees to the
   kilometre, while Jabal is 486 km off. A village of 220 does not haul dates past a nearer buyer. */
{const E=RD('trade.esper.arcology'),km=E?Math.round(E.minutes/1440*BOWL_TUNE.speed):0;
 T.ok('S2: Esper sells into the arcology 90 km away, not Jabal 486 km away',!!E&&km>=70&&km<=110,
  'Esper to the arcology '+km+' km by road ('+Math.round(E.minutes/1440)+' d); its record says 72 km straight');
 T.neg('a road of 486 km is not the 72 km the record gives',
  x=>x>=70&&x<=110,486,km);}
/* THE BOWL CANNOT FEED ITSELF, and that is the point of S2 rather than a fault in it. Measured off the tune: the six
   places and two hinterlands eat more grain than the two rings grow, and NOBODY IN THE BOWL GROWS TEA AT ALL. Jabal is
   the sharp case -- 15,000 people, no hinterland of its own (the owner ruled rings for Mantis and the arcology, not for
   Jabal) and no grain source anywhere in the province. Its bread comes up the Dasri road from Xanadu, which is exactly
   why the Train of Jabal's home mattering is what S2 is about. PLAN-SIM.md section 3c. */
{const D=1/365,diet=BOWL_TUNE.diet;
 const eats=g=>BOWL_TUNE.places.reduce((n,P)=>n+(diet[P.kind][g]||0)*P.people*365,0)
  +BOWL_TUNE.places.filter(P=>P.ring).reduce((n,P)=>n+(diet.village[g]||0)*P.ring.people*365,0);
 const grows=g=>BOWL_TUNE.places.reduce((n,P)=>n+((P.make||{})[g]||0)+((P.pans||{})[g]||0)
  +(P.ring?((P.ring.make||{})[g]||0):0),0);
 const grain={eat:eats('grain'),grow:grows('grain')},tea={eat:eats('tea'),grow:grows('tea')};
 const jabalGrain=(diet.city.grain||0)*15000*365;
 T.ok('S2: the Bowl is short of its own bread and grows no tea at all, so the join has to feed it',
  grain.grow<grain.eat&&tea.grow===0&&jabalGrain>0,
  'grain: grows '+t(grain.grow)+' a year, eats '+t(grain.eat)+' -- short '+t(grain.eat-grain.grow)
  +' ('+Math.round(100*(grain.eat-grain.grow)/grain.eat)+' %); tea: grows '+t(tea.grow)+', eats '+t(tea.eat)
  +'; Jabal alone eats '+t(jabalGrain)+' with no hinterland and no Bowl source');
 T.neg('a province that grows more bread than it eats is not short of it',
  x=>x.grow<x.eat,{grow:grain.eat*1.2,eat:grain.eat},grain);}
/* ...and so the standalone valley's roads run EMPTY, which is right and not a bug: every place is stocked for 400 days
   (`T.valley`'s `days`), so inside a year nobody wants anything and no carrier loads. Run past the start and the salt
   moves. This is the check that proves the five roads carry goods and not just a declaration. */
{const L=run(520),landed={};
 L.V.roads.forEach(r=>{const R=SIM.tradeReport(r.id)||{},M=R.landed||{};
  Object.keys(M).forEach(k=>{const to=k.split('>')[1];Object.keys(M[k]).forEach(g=>{
   (landed[g]=landed[g]||{})[to]=(landed[g][to]||0)+M[k][g];});});});
 const salt=landed.salt||{},toMantis=salt[ID.mantis]||0,moved=Object.keys(salt).length;
 T.ok('S2: run past the stocked start and Solta\'s salt moves -- Mantis buys its salt from the Train, which is the grievance its houses carry onto the Catch road',
  toMantis>0&&moved>=2,
  '520 days: salt landed at '+(moved?Object.keys(salt).map(k=>k.replace(/^s/,'')+' '+t(salt[k])).join(', '):'nowhere')
  +'; the goods that moved at all: '+(Object.keys(landed).join(', ')||'none'));
 T.neg('a Bowl whose salt never reaches Mantis is not the one the grievance is written for',
  x=>(x[ID.mantis]||0)>0,Object.assign({},salt,{[ID.mantis]:0}),salt);}
// and the grievance is in the records: the Train and Mantis's houses are the tune's one wary pair
{const wary=Y.V.relations.filter(r=>r.stance==='wary'),pair=wary.some(r=>(r.a==='train'&&r.b==='mantishouses')||(r.a==='mantishouses'&&r.b==='train'));
 T.ok('S2: the Train and Mantis\'s Izani houses are wary of each other, and nobody else in the Bowl is',pair&&wary.length===2,
  wary.map(r=>r.a+'/'+r.b).join(', ')+' (a pair is two rows, one each way)');
 T.neg('a Bowl where every faction is friendly has lost its grievance',
  x=>x.some(r=>r.stance==='wary'),Y.V.relations.map(r=>Object.assign({},r,{stance:'friendly'})),Y.V.relations);}
// the books balance over the roads as well as the works
T.ok('S2: the Bowl\'s year balances with its roads running, every settlement and good',Y.ledger.ok,
  Y.ledger.ok?'all goods':Y.ledger.problems.slice(0,3).join('; '));
// the works: Jabal makes what a city of 15,000 makes, Solta rakes salt and gypsum, Mantis taps frankincense and resin
{const W=id=>(Y.V.settlements.find(s=>s.id===id).works||[]).map(w=>w.out[0]).filter(Boolean);
 const jab=W(ID.jabal),sol=W(ID.solta),man=W(ID.mantis);
 const good=jab.indexOf('brick')>=0&&jab.indexOf('cloth')>=0&&sol.indexOf('salt')>=0&&sol.indexOf('gypsum')>=0
  &&man.indexOf('frankincense')>=0&&man.indexOf('resin')>=0;
 T.ok('S2: Jabal makes a city\'s goods, Solta rakes salt and gypsum, Mantis taps frankincense and resin',good,
  'Jabal '+jab.join('/')+'; Solta '+sol.join('/')+'; Mantis '+man.join('/'));
 T.neg('a Solta with no pans is not the Train\'s salt works',
  x=>x.indexOf('salt')>=0&&x.indexOf('gypsum')>=0,sol.filter(g=>g!=='salt'),sol);}
// the seasons: the pans are raked in the cool months only, and Mantis's dates ripen in the monsoon only
{const seasonOf=(id,good)=>{const w=(Y.V.settlements.find(s=>s.id===id).works||[]).find(q=>q.out[0]===good);return w?w.season:undefined;};
 const good=seasonOf(ID.solta,'salt')==='pans'&&seasonOf(ID.mantis,'dates')==='monsoon'&&seasonOf(ID.jabal,'brick')===undefined;
 T.ok('S2: Solta\'s pans are worked in the cool months and Mantis\'s dates ripen in the monsoon, while a city\'s kilns run all year',good,
  'Solta salt '+seasonOf(ID.solta,'salt')+', Mantis dates '+seasonOf(ID.mantis,'dates')+', Jabal brick '+(seasonOf(ID.jabal,'brick')||'all year')
  +'; the windows '+JSON.stringify(BOWL_TUNE.calendar.windows));
 T.neg('a pan worked all year is not the Bowl\'s',x=>x==='pans',undefined,seasonOf(ID.solta,'salt'));}
// Jabal waters the trains: the Train of Jabal's home needs caravanserai wells and fodder yards of its own, or its rounds
// cannot set out (its two funduqs are in kits/dasri's urban register, so the tune owes them their water)
{const w=(Y.V.settlements.find(s=>s.id===ID.jabal).works||[]).filter(q=>/serai/.test(q.id));
 T.ok('S2: Jabal has the caravanserais\' wells and fodder yards the Train\'s rounds will set out from',w.length===2,
  w.map(q=>q.name+' ('+q.out[0]+')').join(', ')||'none');
 T.neg('a Jabal with no caravanserai cannot send a train out',x=>x.length===2,w.slice(1),w);}
// the Train holds both salt works, which the Izani houses of Mantis -- who once had Solta's -- resent
{const r=Y.V.relations.find(q=>(q.a==='train'&&q.b==='mantishouses')||(q.a==='mantishouses'&&q.b==='train'));
 T.ok('S2: the Train of Jabal and the Izani houses of Mantis are wary (the Train holds both salt works)',!!r&&r.stance==='wary',
  r?r.a+' / '+r.b+': '+r.stance:'no relation');
 T.neg('a friendly pair is not the salt grievance',x=>!!x&&x.stance==='wary',{a:'train',b:'mantishouses',stance:'friendly'},r);}
// ---- the two census rows that were open are ruled (the owner, 2026-11-24), and nothing carries a pending flag any more
{const Rl=BOWL_TUNE.ruled,P=id=>BOWL_TUNE.places.find(q=>q.id===id);
 const matched=Rl.every(c=>{const q=P(c.id);return q&&q.people===c.now&&(c.ring?(q.ring&&q.ring.people===c.ring):true);});
 const noFlags=BOWL_TUNE.places.every(q=>q.pending===undefined);
 T.ok('S2: Mantis is 15,000 and the north road\'s arcology 10,000, each with its hinterland, and no census row is pending any more',Rl.length===2&&matched&&noFlags,
  Rl.map(c=>c.ref+' '+c.id+': '+c.was+' -> '+c.now+' + '+c.ring+' in its ring').join('; '));
 T.neg('a place still carrying a pending flag is not a ruled census',
  x=>x.every(q=>q.pending===undefined),
  BOWL_TUNE.places.map(q=>q.id==='slw9dufqfs'?Object.assign({},q,{pending:'(b)'}):q),BOWL_TUNE.places);}
// ---- the hinterlands: each ring is a settlement of its own at a coarser scale, sending its make down to its town
{const ring=id=>Y.V.settlements.find(s=>s.id===id+'.ring'),lane=id=>Y.V.roads.find(r=>r.id==='lane.'+id);
 const M=ring('slw9dufqfs'),A=ring('skz25tuq0w');
 const good=!!M&&!!A&&M.scale===200&&A.scale===200&&!!lane('slw9dufqfs')&&!!lane('skz25tuq0w')
  &&M.works.some(w=>w.out[0]==='dates')&&A.works.some(w=>w.out[0]==='grain');
 T.ok('S2: Mantis and the north road\'s arcology each have a countryside of their own at 200 people an actor, with a lane carrying its make down to the town',good,
  (M?'Mantis ring '+M.people+' ('+M.works.length+' works)':'no Mantis ring')+'; '+(A?'the arcology\'s ring '+A.people+' ('+A.works.length+' works)':'no arcology ring'));
 T.neg('a town with no countryside has no lane to one',x=>!!x,lane('sa5o6dvjdv'),lane('slw9dufqfs'));}
// ---- the north road's arcology is a place whose NAME is unknown, not a place whose site is unknown: Arcbeam left on
//      2026-11-25 and its census, its market and its road stayed behind (bowl-tune.js's header)
{const A=BOWL_TUNE.places.find(p=>p.id==='skz25tuq0w');
 const good=!!A&&A.tbd===true&&A.people===10000&&A.px===1016&&A.py===1058&&!!A.ring&&A.site===undefined;
 T.ok('S2: the north road keeps its arcology\'s 10,000 and 6,000 at px 1016,1058 with only its name to be given',good,
  A?'"'+A.name.split(':')[0]+'", '+A.people+' + '+A.ring.people+' at px '+A.px+','+A.py+', tbd '+A.tbd:'missing');
 T.neg('a place still marked as having an open SITE is not one merely waiting for a name',
  x=>x.tbd===true&&x.site===undefined,Object.assign({},A,{site:'open'}),A);}
T.done();
