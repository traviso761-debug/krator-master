// node core/region/tools/export-east-rift.js <out.json> — run a year of the East Rift (EAST_RIFT: the Xanadu Sultanate and
// Longsong's valley joined) and write its census: every settlement with its scale-model pixel, people, faction, works and
// the year's books (made, imported, exported, eaten, short, closing stock), every road with its kind and what it landed,
// the transfers and the merchant houses' cuts. The census page (the owner's artifact, 2026-11-16) reads this file.
const fs=require('fs'),path=require('path');
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
(0,eval)(rd('core/clock/20-core-clock.js'));
fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
(0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);(0,eval)(rd('core/region/50-region-valley.js'));
(0,eval)(rd('core/region/data/xan-tune.js'));(0,eval)(rd('settlements/longsong/src/15-ls-tune.js'));(0,eval)(rd('core/region/data/east-rift.js'));
const PX=JSON.parse(rd('openworld/xanadu-oidong-highrift/plan/sites.json')),PL=JSON.parse(rd('openworld/oidong-highrift/plan/sites.json'));
/* --catch: the Catch joined too (core/region/data/catch-tune.js CATCH_TUNE.join: its places, and the five groups' caravans
   through the crossing in place of the four Catch gateways; PROPOSAL-CATCH.md steps C3-C5) */
const withCatch=process.argv.indexOf('--catch')>=0;if(withCatch)(0,eval)(rd('core/region/data/catch-tune.js'));
const V0=EAST_RIFT.valley(PX,PL),V=withCatch?CATCH_TUNE.join(V0):V0,S=H.simValley(V),t0=Date.now();
for(let d=0;d<365;d++)H.valleyRun(1440,60);
const B=H.valleyBooks().towns,TR=SIM.tradeReport(),XF=SIM.transfersReport();
const round=o=>{const r={};for(const g in o||{}){const n=o[g];if(Math.abs(n)>=.05)r[g]=Math.round(n*10)/10;}return r;};
const px=s=>({px:Math.round((s.x/2000+1191)*10)/10,py:Math.round((s.z/2000+1569)*10)/10});
const kind=r=>{const id=r.id;
 if(/^trade\.gate\./.test(id))return'gateway';if(/^caravan/.test(id))return'caravan';if(/^lake\.|^round\.|^boats?\./.test(id)||r.stops)return'boat';
 if(/^expedition\.|^tears\.rift/.test(id))return'expedition';if(/^oil\./.test(id))return'oil';if(/\.sell\.|supply$/.test(id))return'house';
 if(r.share)return'tithe';return'trade';};
const out={generated:new Date().toISOString().slice(0,10),days:365,secs:Math.round((Date.now()-t0)/1000),
 factions:V.factions,goods:V.goods,
 settlements:V.settlements.map(s=>{const b=B[s.id]||{};return Object.assign({id:s.id,name:s.name,faction:s.faction,parent:s.parent||null,people:s.people,scale:s.scale==null?V.scale:s.scale,
   works:(s.works||[]).map(w=>({id:w.id,kind:w.kind,name:w.name||w.kind,crew:w.crew,out:w.out||(w.batch?Object.keys(w.batch.out):[]),season:w.season||null})),
   made:round(b.made),imported:round(b.imported),exported:round(b.exported),eaten:round(b.eaten),short:round(b.hungry),stock:round(b.stock)},s.faction==='gate'?{}:px(s));}),
 roads:V.roads.map(r=>{const T=TR[r.id]||{},landed={};Object.keys(T.landed||{}).forEach(leg=>{landed[leg]=round(T.landed[leg]);});const tithed={};Object.keys(T.tithed||{}).forEach(leg=>{tithed[leg]=round(T.tithed[leg]);});
   return{id:r.id,kind:kind(r),from:r.from,to:r.to,stops:r.stops||null,days:Math.round((r.minutes!=null?r.minutes:(r.legs||[]).reduce((a,b)=>a+b,0))/144)/10,carriers:r.carriers==null?1:r.carriers,landed,tithed,cut:(r.cut||[]).map(c=>({at:c.at,to:c.to,share:c.share,why:c.why||''}))};}),
 transfers:Object.keys(XF).map(id=>({id,from:(V.transfers.find(q=>q.id===id)||{}).from,to:(V.transfers.find(q=>q.id===id)||{}).to,sent:round(XF[id].sent),owed:round(XF[id].owed),times:XF[id].times})),
 cuts:Object.keys(S.cuts).map(r=>({road:r,taken:round(S.cuts[r].taken)})),
 gateways:XAN_TUNE.gateways.map(G=>({id:G.id,name:G.name,entry:G.entry,side:G.side,days:G.days,out:G.out,in:G.in}))};
const OUT=process.argv.slice(2).find(a=>a[0]!=='-')||'east-rift-census.json';
fs.writeFileSync(OUT,JSON.stringify(out));
console.log('wrote '+OUT+(withCatch?' (with the Catch)':'')+': '+out.settlements.length+' settlements, '+out.roads.length+' roads, a year in '+out.secs+' s');
