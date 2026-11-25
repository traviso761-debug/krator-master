// node core/region/tests/test-bowl.js — the Bowl on core/simulation (step S2 of openworld/catch-bowl/PLAN-SIM.md
// section 3; the owner, 2026-11-24). S2's first half: the Bowl's six places (core/region/data/bowl-tune.js) declared by
// core/region's valley host at the abstract level, on their own make and a stocked start, for a year -- as C0 did for the
// Catch before its rounds were put on. The rounds (BOWL_TUNE.join: the Train of Jabal's home becoming a town instead of
// an off-map pool) come after. Each negative is a pair (tools/ktest.js).
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
const ID={jabal:'sa5o6dvjdv',mantis:'slw9dufqfs',solta:'s0zgu7u6yb',arcbeam:'skz25tuq0w',parabola:'scyeauyek7',esper:'sq11desertw7'};
{const want=Object.values(ID).concat(['slw9dufqfs.ring','skz25tuq0w.ring']),got=Y.S.order.slice().sort();
 const good=want.every(x=>got.indexOf(x)>=0);
 T.ok('S2: the Bowl\'s six places run, and Mantis\'s and Arcbeam\'s hinterlands with them -- eight settlements',good&&Y.S.order.length===8,
  Y.V.settlements.map(s=>s.id.replace(/^s/,'')+' '+s.people).join(', '));
 T.neg('a tune missing a place does not pass for the whole Bowl',
  x=>x.length===8,want.slice(1),want);}
// every place keeps its people fed off its own make and its stocked start: nobody starves in a year
{const hungry=Object.keys(B).filter(id=>{const b=B[id];return b&&b.short&&Object.keys(b.short).length>0;});
 T.ok('S2: a year on its own make and a 400-day start leaves no Bowl place short',hungry.length===0,
  hungry.length?hungry.join(', ')+' short':'six places, none short');
 T.neg('a place whose wells were never dug does run short',
  x=>x.length===0,['slw9dufqfs'],hungry);}
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
 T.ok('S2: Mantis is 15,000 and Arcbeam 10,000, each with its hinterland, and no census row is pending any more',Rl.length===2&&matched&&noFlags,
  Rl.map(c=>c.ref+' '+c.id+': '+c.was+' -> '+c.now+' + '+c.ring+' in its ring').join('; '));
 T.neg('a place still carrying a pending flag is not a ruled census',
  x=>x.every(q=>q.pending===undefined),
  BOWL_TUNE.places.map(q=>q.id==='slw9dufqfs'?Object.assign({},q,{pending:'(b)'}):q),BOWL_TUNE.places);}
// ---- the hinterlands: each ring is a settlement of its own at a coarser scale, sending its make down to its town
{const ring=id=>Y.V.settlements.find(s=>s.id===id+'.ring'),lane=id=>Y.V.roads.find(r=>r.id==='lane.'+id);
 const M=ring('slwl')||ring('slw9dufqfs'),A=ring('skz25tuq0w');
 const good=!!M&&!!A&&M.scale===200&&A.scale===200&&!!lane('slw9dufqfs')&&!!lane('skz25tuq0w')
  &&M.works.some(w=>w.out[0]==='dates')&&A.works.some(w=>w.out[0]==='grain');
 T.ok('S2: Mantis and Arcbeam each have a countryside of their own at 200 people an actor, with a lane carrying its make down to the town',good,
  (M?'Mantis ring '+M.people+' ('+M.works.length+' works)':'no Mantis ring')+'; '+(A?'Arcbeam ring '+A.people+' ('+A.works.length+' works)':'no Arcbeam ring'));
 T.neg('a town with no countryside has no lane to one',x=>!!x,lane('sa5o6dvjdv'),lane('slw9dufqfs'));}
T.done();
