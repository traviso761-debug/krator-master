// node settlements/skink/stress-lz.js <case> [days]   (from the repo root; Skink is in LZ_TUNE since 2026-11-17; NEWTIN=1 adds a second tin
// source at Iguana). The Lizardmen's economy (LZ_TUNE, the Allotment) run three years with one source cut, to find what runs
// short: settlements/skink/PLAN.md section 1. Cases: base, basSalt, gilaSalt, tin, copper, grain, meat. A plan tool, not a test.
const fs=require('fs'),path=require('path');
global.window=global;
const ROOT=process.cwd(),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const load=()=>{(0,eval)(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
 (0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);
 (0,eval)(rd('core/region/50-region-valley.js'));(0,eval)(rd('core/region/51-region-allot.js'));
 (0,eval)(rd('settlements/gila/src/88-gl-records.js'));(0,eval)(rd('core/region/data/lz-tune.js'));return H;};
const GOODS=['grain','produce','fish','meat_hide','salt','bronze_ware','bronze','copper','tin','lakecake'];
function stocks(B){const t={};Object.values(B).forEach(x=>GOODS.forEach(g=>{t[g]=(t[g]||0)+((x.stock||{})[g]||0);}));return t;}
function addNew(){const T=LZ_TUNE;if(T.byKey('saltlakes'))return;T.places.push({id:'saltlakes',key:'saltlakes',name:'the salt-lake village',px:691,py:1521,people:1500,diet:{grain:233.33,produce:83.33,meat_hide:50,salt:8.333,bronze_ware:2},make:{grain:300000,produce:125000,meat_hide:75000,salt:300000},smiths:true});
 const w=T.coil.loops.west;w.splice(w.indexOf('gila'),0,'saltlakes');if(T.coil.weight)T.coil.weight.saltlakes=2;}
function run(edit,label,days){const H=load();if(process.env.NEWTIN){const I=LZ_TUNE.byKey('iguana');I.make.tin=8000;}const V=LZ_TUNE.valley({allot:true});let n=0;if(edit)n=edit(V);H.simValley(V);
 H.valleyRun(366*1440,60);const s1=stocks(H.valleyBooks().towns);H.valleyRun((days-366)*1440,60);const B=H.valleyBooks().towns,s2=stocks(B);
 const out=[],tot={};Object.keys(B).forEach(s=>{const x=B[s];if(!x.people)return;Object.keys(x.hungry||{}).forEach(g=>{const e=(x.eaten||{})[g]||0,h=x.hungry[g]||0;tot[g]=tot[g]||[0,0];tot[g][0]+=e;tot[g][1]+=h;if(h>(e+h)*0.005)out.push(s+' '+g+' '+(100*h/(e+h)).toFixed(1)+'%');});});
 console.log('== '+label+' (works edited: '+n+')');
 console.log('  short >0.5%: '+(out.join('; ')||'none'));
 console.log('  stock t, day 366 -> '+days+': '+['grain','salt','fish','meat_hide','bronze','bronze_ware','copper','tin'].map(g=>g+' '+(s1[g]/1000).toFixed(0)+'->'+(s2[g]/1000).toFixed(0)).join(', '));}
const scale=(key,good,f)=>V=>{let n=0;V.settlements.forEach(s=>{if(key&&s.id!==key)return;(s.works||[]).forEach(w=>{if((w.out||[]).indexOf(good)>=0&&w.rate){w.rate*=f;n++;}});});return n;};
const days=+process.argv[3]||1096;
const which=process.argv[2]||'base';
const S={base:[null,'baseline'],
 basSalt:[scale('basilisk','salt',0.6),'Basilisk\'s pans at 60 % (a wet year: ~1,900 mm on open pans)'],
 gilaSalt:[scale('gila','salt',0.7),'Gila\'s salt at 70 %'],
 tin:[scale('komodo','tin',0.5),'Komodo\'s placers at 50 % (raided, or the rivers in flood)'],
 copper:[scale('tuatara','copper',0.7),'Tuatara\'s copper at 70 %'],
 grain:[scale('iguana','grain',0.75),'Iguana\'s grain at 75 %'],
 meat:[scale(null,'meat_hide',0.9),'meat and hide 10 % down everywhere']};
const [e,l]=S[which];run(e,l,days);
