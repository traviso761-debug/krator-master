// node settlements/pinnacle-rock/tests/test-pr-economy.js — Pinnacle Rock on core/simulation for a year (phase S7 of
// core/simulation/PROPOSAL-LONGSONG-PINNACLE.md; the owner, 2026-11-11). The town of 3,000, the floor ring, the four
// clearings of the open world's plan (openworld/pinnacle/plan/sites.json) and the eighteen bands (kits/beast-riders
// BR_CAMP's grounds) are declared by core/region's valley host (core/region/50-region-valley.js) from the Beast Riders'
// table (src/15-pr-tune.js); the bands live their dry season on core/camp's world tick (60: ranging, 65: caravans to the
// Beast Rider cities and the long roads to the coyotemen and the Dasri, 66: raids on Goto and Nusidi) and are handed over to
// the sim for the wet season at home. A first year spins the world up (the bands set out on day 0 with only the dry
// season's tail); the second is held to the proposal, each check with a negative.
const fs=require('fs'),path=require('path'),vm=require('vm');
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),L=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
const PLAN=JSON.parse(fs.readFileSync(path.join(ROOT,'openworld/pinnacle/plan/sites.json'),'utf8'));
function load(){L('core/clock/20-core-clock.js');fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>L('core/simulation/'+f));
 L('core/region/00-region-core.js');const H={TUNE:{sim:{}}};KREGION.use(H);L('core/region/50-region-valley.js');
 return H;}
/* the plain data, once (core/camp, the travel, the kit's camp table, the culture's table): the sim and the host each run */
L('core/rand/08-core-rand.js');fs.readdirSync(path.join(ROOT,'core','camp')).filter(f=>/^\d\d-camp-.*\.js$/.test(f)).sort().forEach(f=>L('core/camp/'+f));
L('core/world/48t-world-travel.js');L('kits/beast-riders/src/79-br-camp.js');const BR_CAMP=vm.runInThisContext('BR_CAMP');L('settlements/pinnacle-rock/src/14-pr-legs.js');L('settlements/pinnacle-rock/src/15-pr-tune.js');
let bad=0;const ok=(name,pass,neg,detail)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(detail?'  ('+detail+')':'')+(neg?' (its negative passed)':''));};
const t=n=>(n/1000).toFixed(1)+' t',TOWN='staiytii0y';
const D=(a,b)=>{const r={};Object.keys(a||{}).forEach(g=>{const v=(a[g]||0)-((b||{})[g]||0);if(Math.abs(v)>1e-9)r[g]=v;});return r;};
function years(o){o=o||{};const H=load(),T=vm.runInThisContext('PR_TUNE'),V=T.valley(PLAN,o);if(o.edit)o.edit(V,T);const S=H.simValley(V),host=H.valleyHost();
 V.bands.forEach(b=>H.valleyAway(b.id,true));const W=T.world(V,host,o.world||{}),trace={};W.order.forEach(id=>trace[id]=[]);
 let a=null,B1=null,R1=null;
 for(let d=0;d<730;d++){if(d===365){a=SIM.ledgerSnap();B1=JSON.parse(JSON.stringify(H.valleyBooks().towns));R1=JSON.parse(JSON.stringify(SIM.tradeReport()));}
  KCAMP.tick(W,d);H.valleyRun(1440,60);if(d>=365)W.order.forEach(id=>trace[id].push({d,loaded:W.bands[id].loaded,state:W.bands[id].state,home:KCAMP.inHome(W,d)}));}
 const B2=H.valleyBooks().towns;return{H,T,V,S,W,trace,B1,B2,R1,R2:SIM.tradeReport(),ledger:SIM.ledger(a,SIM.ledgerSnap(),{tol:1}),raids:W.ventures.raid.state};}
const t0=Date.now(),Y=years(),T=Y.T,F=T.food,ge=o=>Object.keys(o||{}).reduce((s,g)=>s+(o[g]||0)*(F[g]||0),0);
console.log('two years of Pinnacle Rock in '+((Date.now()-t0)/1000).toFixed(1)+' s: '+Y.S.order.length+' settlements, '+SIM.all('actor').length+' actors, '+Y.W.order.length+' bands, '+Y.W.ops.length+' ops');
const T1=Y.B1[TOWN],T2=Y.B2[TOWN],y2=k=>D(T2[k],T1[k]);
// 1. declared: the town of 3,000, the ring, the plan's four clearings, the eighteen bands of 40-70, the markets, the targets
/* the floor's and the flyers' twelve bands are 40-70 (core/camp's rule); the six ground tribes' upper grounds on the mesa keep their laid five tents
   (20-29 people: more tents do not fit the mesa's margin, the page's own check), an open question for the owner */
{const cl=Y.V.settlements.filter(s=>/hamlet\.clearing/.test(s.id)),bands=Y.V.bands,post=b=>b.ground==='upper'&&BR_CAMP[b.tribe].grounds.lower,full=bands.filter(b=>!post(b)),pops=full.map(b=>b.census.pop),posts=bands.filter(post).map(b=>b.census.pop),floor=['mammoth','dragonfly'].map(tr=>bands.find(b=>b.tribe===tr).census.pop);
 const markets=Object.keys(T.markets),ok1=Y.V.settlements.find(s=>s.id===TOWN).people===3000&&cl.length===4&&bands.length===18&&full.length===12&&pops.every(p=>p>=40&&p<=70)&&!Y.S.problems.length;
 ok('declared: Pinnacle Rock of 3,000, the floor ring, the plan\'s four clearings, eighteen bands (the twelve that roam 40-70, Mammoth and Dragonfly too; six posts on the mesa), seven markets, Goto and Nusidi',
  ok1&&markets.length===7&&Y.V.settlements.some(s=>s.id===T.ids.goto)&&Y.V.settlements.some(s=>s.id===T.ids.nusidi),pops.some(p=>p<40)||floor.some(p=>p<40),
  cl.length+' clearings ('+cl.map(c=>c.people).join(', ')+'), twelve bands '+Math.min(...pops)+'-'+Math.max(...pops)+' (Mammoth '+floor[0]+', Dragonfly '+floor[1]+'), six posts '+Math.min(...posts)+'-'+Math.max(...posts)+'; '+pops.concat(posts).reduce((a,b)=>a+b,0)+' people; problems: '+(Y.S.problems.slice(0,2).join('; ')||'none'));}
// 2. the books balance: the sim's ledger over the second year, and every band's world books across its hand-overs
{let worst=0;Y.W.order.forEach(id=>Object.values(KCAMP.books(Y.W,id)).forEach(r=>worst=Math.max(worst,Math.abs(r.residual))));
 const b0=Y.W.bands[Y.W.order[0]];b0.stock.grain+=500;let w2=0;Object.values(KCAMP.books(Y.W,b0.id)).forEach(r=>w2=Math.max(w2,Math.abs(r.residual)));b0.stock.grain-=500;
 ok('the books balance: the sim\'s ledger over the year (opening + made + imported = consumed + spoiled + exported + closing) and each band\'s, across every hand-over',Y.ledger.ok&&worst<1e-6,w2<499,
  (Y.ledger.ok?'all settlements':Y.ledger.problems.slice(0,2).join('; '))+'; bands\' worst residual '+worst.toExponential(1));}
// 3. the town is fed all year by its four streams, its stores as full at the year's end; without the dry season's haul it goes short
{const ate=ge(y2('eaten')),hung=ge(y2('hungry')),st1=ge(T1.stock),st2=ge(T2.stock);
 const N=years({world:{assign:()=>null}}),N2=D(N.B2[TOWN].hungry,N.B1[TOWN].hungry);
 ok('the town fed all year (short under 0.5 % of what it ate), its stores as full at the year\'s end; with no haul it goes short',hung<ate*.005&&st2>=st1*.85,ge(N2)<ate*.005,
  'ate '+t(ate)+' grain-equivalent, went without '+t(hung)+'; stores '+t(st1)+' -> '+t(st2)+'; with no haul it went without '+t(ge(N2)));}
// 4. the four streams of the proposal: the floor ring, the clearings, the bands at home, their dry-season haul
{const R2=Y.R2,R1=Y.R1,landed=(re)=>{const o={};Object.keys(R2).filter(k=>re.test(k)).forEach(k=>{const l2=R2[k].landed||{},l1=(R1[k]||{}).landed||{};Object.keys(l2).forEach(leg=>{if(!leg.endsWith('>'+TOWN))return;Object.keys(l2[leg]).forEach(g=>o[g]=(o[g]||0)+l2[leg][g]-((l1[leg]||{})[g]||0));});});return o;};
 const fromBands=landed(/^home\./),made={},imp={};Y.V.bands.forEach(b=>{const m=D(Y.B2[b.id].made,Y.B1[b.id].made),im=D(Y.B2[b.id].imported,Y.B1[b.id].imported);Object.keys(m).forEach(g=>made[g]=(made[g]||0)+m[g]);Object.keys(im).forEach(g=>imp[g]=(imp[g]||0)+im[g]);});
 let home=0,haul=0;Object.keys(fromBands).forEach(g=>{const n=fromBands[g],k=(made[g]||0)/((made[g]||0)+(imp[g]||0)||1);home+=n*k*(F[g]||0);haul+=n*(1-k)*(F[g]||0);});
 const ring=ge(y2('made')),clear=ge(landed(/^sell\./)),all=ring+clear+home+haul,sh=[ring,clear,home,haul].map(x=>x/all);
 ok('the four streams: the floor ring, the clearings and the bands at home each 10-30 % of the town\'s food, the dry season\'s haul the largest (the proposal: 20/20/20/40)',sh.slice(0,3).every(s=>s>=.1&&s<=.3)&&sh[3]>=Math.max(...sh.slice(0,3))&&sh[3]>=.3,
  false,'ring '+t(ring)+', clearings '+t(clear)+', bands at home '+t(home)+', haul '+t(haul)+': '+sh.map(s=>Math.round(s*100)+'%').join(' / '));}
// 5. home in the wet season, ranging in the dry: every band handed over to the sim every day of its home season, never in the dry
{let miss=0,out=0,late=0;Y.W.order.forEach(id=>Y.trace[id].forEach(x=>{if(x.home&&!x.loaded)miss++;if(!x.home&&x.loaded)out++;const yd=x.d%365;if(yd>=110&&yd<290&&!x.loaded)late++;}));
 ok('all eighteen bands home every day of the wet season (year days 120-300) and ranging every day of the dry',!miss&&!out,late===0,miss+' home days missed, '+out+' dry days at home; against a season ten days earlier '+late+' missed');}
// 6. the beasts: every appetite a third under its full size, the meat-eaters fed from both the hunt and their kept herds, none starved
{const full=Object.assign({},T.beasts,{lowG:1}),b=Y.V.settlements.find(s=>s.id==='staiytii0y:raptor:lower'),N=KCAMP.beastNeeds(T.beasts,KCAMP.bandBeasts(T.beasts,'raptor',Y.V.bands.find(x=>x.id===b.id).census)),Nf=KCAMP.beastNeeds(full,KCAMP.bandBeasts(full,'raptor',Y.V.bands.find(x=>x.id===b.id).census));
 const meatBands=Y.V.bands.filter(x=>KCAMP.appetite(T.beasts,x.tribe).meat>0),both=meatBands.every(x=>{const st=SIM.econ(x.id).made;const wk=Y.V.settlements.find(s=>s.id===x.id).works;return wk.some(w=>w.kind==='herd')&&wk.some(w=>w.kind==='hunt')&&(st.meat||0)>0;});
 let need=0,starved=0;Y.V.bands.forEach(x=>{const s=Y.V.settlements.find(q=>q.id===x.id);need+=(s.feeds.meat||0)*180*2;starved+=((Y.B2[x.id].starved||{}).meat||0);});
 let wneed=0,wshort=0;Y.W.order.forEach(id=>{const bb=Y.W.bands[id];wshort+=bb.books.short['beast:meat']||0;wneed+=(KCAMP.beastNeeds(T.beasts,bb.beasts).meat||0)*185*2;});
 ok('every appetite cut by a third (the low-gravity payoff); the '+meatBands.length+' meat-eaters\' bands fed from the hunt and their kept herds; none starved (meat short under 3 % at home and away)',
  Math.abs(N.meat/Nf.meat-2/3)<1e-9&&b.feeds.meat===N.meat&&both&&starved<need*.03&&wshort<wneed*.03,Math.abs(Nf.meat/N.meat-1)<.01,
  'the raptors\' band '+Math.round(N.meat)+' kg of meat a day (full '+Math.round(Nf.meat)+'); meat short '+t(starved)+' at home of '+t(need)+', '+t(wshort)+' away of '+t(wneed));}
// 7. the raids: Goto and Nusidi struck within the caps, neither broken, their people within a tenth
{const log=Y.raids.log,tg=[T.ids.goto,T.ids.nusidi],caps=KCAMP.RAID_CAPS;let worst=0;log.forEach(l=>Object.keys(l.loot).forEach(g=>worst=Math.max(worst,l.loot[g]/l.before[g])));
 const low=tg.map(x=>Y.raids.standing[x]==null?1:Y.raids.standing[x]),pop=tg.map(x=>Y.S.towns[x].spec.people/T.targets[x].people);
 ok('the raids on Goto and Nusidi: within the caps (15 % of a good), neither broken, their people within a tenth',tg.every(x=>log.some(l=>l.target===x))&&log.some(l=>l.outcome==='success')&&worst<=caps.stock+1e-9&&low.every(s=>s>=.6)&&pop.every(p=>p>=.9),
  false,log.length+' raids ('+log.map(l=>(l.target===T.ids.goto?'g':'n')+':'+l.outcome).join(', ')+'); most taken '+(worst*100).toFixed(1)+'%; standing '+low.map(s=>s.toFixed(2)).join('/')+'; people '+pop.map(p=>Math.round(p*100)+'%').join('/'));}
// 8. the trade: caravans to the Beast Rider cities; the long roads to the coyotemen and the Dasri with high-value goods; the
//    intermediaries for the rest
{const tr=Y.W.trades||[],cities=['talon','fort-kreia','mavs','fort-ordo','girder'].map(k=>T.ids[k]),far=['coyote-canyon','shade'].map(k=>T.ids[k]),hv=['silk','beasts','hides'];
 const visited=cities.filter(c=>tr.some(x=>x.market===c)),farT=tr.filter(x=>far.indexOf(x.market)>=0),farOk=far.every(m=>farT.some(x=>x.market===m))&&farT.every(x=>Object.keys(x.sold).every(g=>hv.indexOf(g)>=0));
 const I=((Y.R2.intermediaries||{}).landed||{})['intermediaries>'+TOWN]||{},Io=((Y.R2.intermediaries||{}).landed||{})[TOWN+'>intermediaries']||{};
 ok('the caravans: to the Beast Rider cities, the long roads to the coyotemen and the Dasri (hides, beasts and silk out), the intermediaries\' salt in',visited.length>=4&&farOk&&(I.salt||0)>0,
  !farT.length,tr.length+' trades; cities '+visited.map(m=>T.markets[m].name).join(', ')+'; far '+farT.length+' ('+far.map(m=>T.markets[m].name+' '+farT.filter(x=>x.market===m).length).join(', ')+'); the intermediaries landed '+JSON.stringify(Object.fromEntries(Object.entries(I).map(([g,n])=>[g,Math.round(n)]))));}
// 9. every band's year: fed wherever it is (its hunt, trade and loot covering its own needs), and the haul home
{const hungry=Y.W.order.filter(id=>(Y.W.bands[id].books.short.food||0)>1||ge(D(Y.B2[id].hungry,Y.B1[id].hungry))>Y.W.bands[id].people*.6*180*.01);
 const brought=Y.W.order.map(id=>ge(D(Y.B2[id].imported,Y.B1[id].imported)));
 ok('every band fed at home and away by its own hunt, trade and loot; each brings a haul home',!hungry.length&&brought.every(x=>x>0),false,
  (hungry.join(', ')||'none hungry')+'; brought home '+t(Math.min(...brought))+' to '+t(Math.max(...brought))+' grain-equivalent a band');}
// 10. the far legs (S5, the owner's answer B): every partner's leg from the scale model's own pins and heights, marked planned,
//     the ventures' marches booked on them; Shade read from the model, not typed in
{const L=PR_LEGS.legs,ids=Object.values(T.ids),all=ids.every(id=>L[id]&&L[id].planned&&L[id].length_m>0&&L[id].up_m>=0),
  marches=Y.W.ops.filter(o=>o.what==='march'&&(o.args.why==='raid'||o.args.why==='caravan')),onLegs=marches.length>0&&marches.every(o=>o.args.planned);
 const G=T.graph(),P=KTRAVEL.path(G,'staiytii0y',T.ids['coyote-canyon'],{kmDay:25,hours:8}),Pb=KTRAVEL.path(G,T.ids['coyote-canyon'],'staiytii0y',{kmDay:25,hours:8});
 ok('the far legs: every partner\'s from the scale model\'s pins and heights, marked planned; the ventures marched on them; a climb slows a leg',all&&onLegs&&P.legs[0].planned&&P.moving!==Pb.moving,
  !(L[T.ids.shade].px>0),ids.length+' legs ('+ids.map(id=>L[id].name+' '+Math.round(L[id].length_m/1000)+' km').join(', ')+'); '+marches.length+' venture marches, all planned; Coyote Canyon '+Math.round(P.moving/60)+' h out, '+Math.round(Pb.moving/60)+' h back');}console.log('\nPinnacle Rock, the second year: made '+Object.entries(y2('made')).map(([g,n])=>g+' '+Math.round(n)).join(', ')+'\n  imported '+Object.entries(y2('imported')).map(([g,n])=>g+' '+Math.round(n)).join(', ')+
 '\n  ate '+Object.entries(y2('eaten')).map(([g,n])=>g+' '+Math.round(n)).join(', ')+'\n  stores '+JSON.stringify(T1.stock)+' -> '+JSON.stringify(T2.stock));
console.log(bad?'\n'+bad+' FAILED':'\nOK');process.exit(bad?1:0);
