// node core/region/tests/test-east-rift.js — the Xanadu Sultanate and Longsong's valley as one economy for a year (step X2
// of core/simulation/PROPOSAL-XANADU.md; the owner, 2026-11-16): EAST_RIFT (core/region/data/east-rift.js) joins XAN_TUNE
// and LS_TUNE, unchanged, on core/region's valley host. It holds the join, not either side's own year (their own tests do):
// declared, the books, everyone fed (Longsong never short), the fealty and the esteem once, Longsong's caravan to Strongbow
// (salt and iron in, books and lenses out, never grain; the Sultan's toll), the Order's goods out by Iziz, the scales, the time.
const fs=require('fs'),path=require('path');
const T=require('../../../tools/ktest.js')(__filename);
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const load=()=>{(0,eval)(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
 (0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);(0,eval)(rd('core/region/50-region-valley.js'));
 (0,eval)(rd('core/region/data/xan-tune.js'));(0,eval)(rd('settlements/longsong/src/15-ls-tune.js'));(0,eval)(rd('core/region/data/east-rift.js'));return H;};
const PX=JSON.parse(rd('openworld/xanadu-oidong-highrift/plan/sites.json')),PL=JSON.parse(rd('openworld/oidong-highrift/plan/sites.json'));
const t=n=>(n/1000).toFixed(1)+' t',LS='sq80bzd7ep',SB='sfgtxw10kr';
function run(days){const H=load(),V=EAST_RIFT.valley(PX,PL);const S=H.simValley(V);
 const a=SIM.ledgerSnap();for(let d=0;d<days;d++)H.valleyRun(1440,60);const b=SIM.ledgerSnap();
 return{H,V,S,B:H.valleyBooks(),trade:SIM.tradeReport(),xfer:SIM.transfersReport(),ledger:SIM.ledger(a,b,{tol:1}),actors:SIM.all('actor').length,cuts:JSON.parse(JSON.stringify(S.cuts))};}
const t0=Date.now(),Y=run(365),B=Y.B.towns,secs=(Date.now()-t0)/1000;
console.log('a year of the East Rift in '+secs.toFixed(1)+' s: '+Y.S.order.length+' settlements, '+Y.actors+' actors, '+Math.round(Y.V.settlements.reduce((n,s)=>n+s.people,0))+' people');
const landed=(r,leg)=>((Y.trade[r]||{}).landed||{})[leg]||{};
// 1. declared: the Sultanate's settlements and Longsong's 24 (its off-map market gone), no problems
{const ls=Y.V.settlements.filter(s=>s.scale===EAST_RIFT.lsScale),mkt=Y.S.order.indexOf(LS_TUNE.caravan.market)>=0;
 T.ok('the East Rift declared: the Sultanate and Longsong\'s 24 settlements at 10 people an actor, the off-map market gone, no problems',ls.length===24&&!mkt&&!Y.S.problems.length,
  Y.S.order.length+' settlements, '+ls.length+' of Longsong\'s; problems: '+(Y.S.problems.slice(0,3).join('; ')||'none'));
 T.neg('a Longsong settlement left at the Sultanate\'s scale is caught',V=>V.settlements.filter(s=>s.scale===EAST_RIFT.lsScale).length===24,
  (()=>{const V=EAST_RIFT.valley(PX,PL);delete V.settlements.find(s=>s.id===LS).scale;return V;})(),Y.V);}
// 2. the books balance
T.ok('the year\'s books balance, every settlement of both',Y.ledger.ok,Y.ledger.ok?'all goods':Y.ledger.problems.slice(0,3).join('; '));
// 3. everyone fed, each side to its own test's standard: every Sultanate settlement under 1 % short of grain; Longsong's valley
//    under 1.5 % short in all (test-ls-economy's three-year check: its camps run a little short in the first year on their own,
//    0.56 % valley-wide), and the house itself never
const lsIds=new Set(Y.V.settlements.filter(s=>s.scale===EAST_RIFT.lsScale).map(s=>s.id));
const fedCheck=Bk=>{const bad=[];let le=0,lh=0;Object.keys(Bk).forEach(s=>{const x=Bk[s];if(!x.people)return;const e=x.eaten.grain||0,h=x.hungry.grain||0;
  if(lsIds.has(s)){le+=e;lh+=h;if(s===LS&&h>0)bad.push('Longsong '+(100*h/(e+h)).toFixed(1)+'%');}else if(h>(e+h)*.01)bad.push(s+' '+(100*h/(e+h)).toFixed(1)+'%');});
 if(lh>(le+lh)*.015)bad.push('Longsong\'s valley '+(100*lh/(le+lh)).toFixed(2)+'%');return{ok:!bad.length,bad,ls:100*lh/Math.max(1,le+lh)};};
{const F=fedCheck(B);T.ok('everyone fed: every Sultanate settlement under 1 % short of grain, Longsong\'s valley under 1.5 % in all, the house never short',F.ok,F.bad.slice(0,6).join(', ')||'all fed; Longsong\'s valley '+F.ls.toFixed(2)+' % short');
 T.neg('Longsong a day short is caught',Bk=>fedCheck(Bk).ok,Object.assign({},B,{[LS]:Object.assign({},B[LS],{hungry:{grain:5}})}),B);}
// 4. the fealty to the citadel and the esteem from it, once each
const xferCheck=X=>['fealty.longsong','esteem.longsong'].every(id=>X[id]&&X[id].times===1)&&Y.V.transfers.find(q=>q.id==='fealty.longsong').to==='xan.citadel';
{const X=Y.xfer;T.ok('Longsong\'s grant of fealty to the Sultan\'s citadel and the grants of esteem from it, once each',xferCheck(X),
  ['fealty.longsong','esteem.longsong'].map(id=>id+': '+(X[id]?X[id].times+'x, owed '+(Object.entries(X[id].owed||{}).filter(([,n])=>n>0).map(([g,n])=>g+' '+Math.round(n)).join(', ')||'nothing'):'absent')).join('; '));
 T.neg('a grant that fell twice is caught',xferCheck,Object.assign({},X,{'esteem.longsong':Object.assign({},X['esteem.longsong'],{times:2})}),X);}
// 5. Longsong's caravan: salt and iron up to Longsong, books and lenses down to Strongbow, never grain; the Sultan's toll
const cvCheck=(up,down,toll)=>(up.salt||0)>0&&(up.iron||0)>0&&((down.books||0)>0||(down.lenses||0)>0)&&!(up.grain||down.grain)&&toll>0;
{const up=landed('caravan.longsong',SB+'>'+LS),down=landed('caravan.longsong',LS+'>'+SB),c=(Y.cuts['caravan.longsong']||{taken:{}}).taken,toll=Object.keys(c).filter(k=>k.startsWith('xan.citadel:')).reduce((n,k)=>n+c[k],0);
 T.ok('Longsong\'s caravan to Strongbow: salt and iron up, books and lenses down, never grain; the Sultan\'s toll at the lift',cvCheck(up,down,toll),
  'up '+Object.entries(up).map(([g,n])=>g+' '+(n>1000?t(n):Math.round(n))).join(', ')+'; down '+Object.entries(down).map(([g,n])=>g+' '+(n>1000?t(n):Math.round(n))).join(', ')+'; the toll '+Object.entries(c).map(([k,n])=>k.split(':')[1]+' '+Math.round(n)).join(', '));
 T.neg('grain on the caravan is caught',u=>cvCheck(u,down,toll),Object.assign({},up,{grain:500}),up);}
// 6. the Order's goods on out by the Iziz gateway
const izCheck=L=>(L.books||0)+(L.lenses||0)+(L.paper||0)>0;
{const L=landed('trade.gate.iziz',SB+'>gate.iziz');T.ok('the Order\'s books, paper and lenses go on out by the Iziz gateway',izCheck(L),
  'books '+Math.round(L.books||0)+', lenses '+Math.round(L.lenses||0)+', paper '+t(L.paper||0));
 T.neg('a gateway that took none is caught',izCheck,{},L);}
// 7. Longsong's own year holds inside the join: its crafts made, its granary as full at the year's end
{const l=B[LS],books=l.made.books||0,lenses=l.made.lenses||0;
 T.ok('Longsong\'s crafts work inside the join: books and lenses made',books>5&&lenses>5,'books '+Math.round(books)+', lenses '+Math.round(lenses)+', its grain at the year\'s end '+t(l.stock.grain||0));}
// 8. the time: a year in under four minutes
T.ok('a year of the East Rift in under four minutes ('+Y.actors+' actors)',secs<240,secs.toFixed(0)+' s');
T.done();
