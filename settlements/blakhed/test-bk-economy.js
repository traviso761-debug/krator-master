// node settlements/blakhed/test-bk-economy.js — step B5 of settlements/blakhed/PLAN.md (W1, W3, W4):
//   1. WR_BLAKHED.valley runs a full year on core/region's valley host with balanced books and no SIM problems;
//   2. Blakhed (4,850) and the Stairhead (150) = 5,000, the 12 hamlets match BK_RING.HAMLETS, and everyone is fed
//      (Blakhed 0 hungry, every settlement under 1 % short);
//   3. The gorge stair brings Nulab's grain, timber, cloth and iron up to Blakhed and carries ice, rope and eggs down;
//   4. Dalab's tenth toll in kind (ice, eggs, rope) lands in `dalab.blakhed`'s books;
//   5. The drovers bring the western fells' salt, the Fowlers bring eggs and honey, and the Ice-cutters' winter sledge road
//      waits during the thaw and delivers clear lake ice in winter;
//   6. WR_BLAKHED.join(XAN_TUNE.valley) replaces `gate.dalab.blakhed` and `gate.dalab.nulab` on `caravan.great` with real
//      `wr.blakhed` and `wr.nulab`: Xanadu's exports land at Blakhed, the Golden Tears' mission takes its cut, Dalab's factors
//      move them down the stair to Nulab, Shelf's salt/iron/wine/pearls still reach Erehwon, and the joined books balance.
// Every check paired with a negative (tools/ktest.js).
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require(path.join(ROOT,'tools','ktest.js'))(__filename);
global.window=global;
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const runFile=p=>vm.runInThisContext(rd(p),{filename:p});
function loadHost(){
 runFile('core/clock/20-core-clock.js');
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>runFile('core/simulation/'+f));
 runFile('core/region/00-region-core.js');
 const H={TUNE:{sim:{}}};KREGION.use(H);
 runFile('core/region/50-region-valley.js');
 runFile('core/region/data/xan-tune.js');
 runFile('settlements/blakhed/sim/wr-blakhed.js');
 return H;}
loadHost();
function runSpec(V,days){
 const H=loadHost(),S=H.simValley(V),a=SIM.ledgerSnap();
 for(let d=0;d<days;d++)H.valleyRun(1440,60);
 const b=SIM.ledgerSnap();
 return{H,V,S,B:H.valleyBooks(),trade:SIM.tradeReport(),ledger:SIM.ledger(a,b,{tol:1}),actors:SIM.all('actor').length,cuts:JSON.parse(JSON.stringify(S.cuts))};}

/* ---- Part A: Blakhed's own West Rift district for 365 days (W1, W4) */
const t0=Date.now(),Y=runSpec(WR_BLAKHED.valley(),365),B=Y.B.towns,ms=Date.now()-t0;
console.log('Blakhed year in '+(ms/1000).toFixed(2)+' s: '+Y.S.order.length+' settlements, '+Y.actors+' actors');
const landed=(tr,r,leg)=>((tr[r]||{}).landed||{})[leg]||{};

// 1. declared, hamlet list matches 69bo-bk-ring.js, books balance
{const ringSrc=rd('settlements/blakhed/src/69bo-bk-ring.js');
 const ringIds=[...ringSrc.matchAll(/\['(bk\.h\.[a-z-]+)'/g)].map(m=>m[1]);
 const sameHamlets=W=>W.hamlets.length===12&&W.hamlets.every((h,i)=>h[0]===ringIds[i]);
 T.ok('Blakhed\'s valley declared: 20 settlements, the 12 hamlets match 69bo-bk-ring.js, and the year\'s ledger balances',
  !Y.S.problems.length&&Y.S.order.length===20&&sameHamlets(WR_BLAKHED)&&Y.ledger.ok,
  Y.S.order.length+' settlements; ledger: '+(Y.ledger.ok?'clean':Y.ledger.problems.slice(0,3).join('; ')));
 T.neg('a hamlet list missing one of 69bo-bk-ring.js\'s hamlets is caught',sameHamlets,{hamlets:WR_BLAKHED.hamlets.slice(0,11)},WR_BLAKHED);}

// 2. everyone fed: Blakhed and the Stairhead never hungry, every settlement under 1 % short on food
const fedOk=Bk=>{const bad=[];
 Object.keys(Bk).forEach(id=>{const x=Bk[id];if(!x.people)return;
  ['grain','potato','dairy','meat','salt'].forEach(g=>{const e=x.eaten[g]||0,h=x.hungry[g]||0;if(e+h<=0)return;
   if((id==='wr.blakhed'||id==='wr.stairhead')&&h>0)bad.push(id+':'+g+' '+h);
   else if(h>(e+h)*.01)bad.push(id+':'+g+' '+(100*h/(e+h)).toFixed(1)+'%');});});
 return{ok:!bad.length,bad};};
{const F=fedOk(B);
 T.ok('everyone fed over 365 days: Blakhed and the Stairhead 0 hungry, every hamlet and road partner under 1 % short',F.ok,
  F.bad.slice(0,5).join(', ')||'Blakhed ate '+Math.round((B['wr.blakhed'].eaten.grain||0)/1000)+' t grain, '+Math.round((B['wr.blakhed'].eaten.salt||0)/1000)+' t salt');
 T.neg('a hungry Blakhed is caught',Bk=>fedOk(Bk).ok,Object.assign({},B,{'wr.blakhed':Object.assign({},B['wr.blakhed'],{hungry:{grain:50}})}),B);}

// 3. the gorge stair: basin grain, timber, cloth and iron up; ice, rope and eggs down
const stairOk=(up,dn)=>(up.grain||0)>=250000&&(up.timber||0)>5000&&(up.iron||0)>2000&&(up.cloth||0)>1000&&(dn.ice||0)>=500000&&(dn.rope||0)>10000&&(dn.eggs||0)>5000;
{const up=landed(Y.trade,'wr.road.stair','wr.nulab>wr.blakhed'),dn=landed(Y.trade,'wr.road.stair','wr.blakhed>wr.nulab');
 T.ok('the gorge stair works both ways: Nulab\'s grain (~'+Math.round((up.grain||0)/1000)+' t), timber, cloth and iron up; Blakhed\'s ice (~'+Math.round((dn.ice||0)/1000)+' t), rope and eggs down',
  stairOk(up,dn),'up grain '+Math.round(up.grain||0)+', iron '+Math.round(up.iron||0)+'; down ice '+Math.round(dn.ice||0)+', rope '+Math.round(dn.rope||0)+', eggs '+Math.round(dn.eggs||0));
 T.neg('a stair carrying no grain up is caught',u=>stairOk(u,dn),Object.assign({},up,{grain:0}),up);}

// 4. Dalab's tenth toll in kind lands in dalab.blakhed
const tollOk=c=>(c['dalab.blakhed:ice']||0)>=50000&&(c['dalab.blakhed:rope']||0)>=1000&&(c['dalab.blakhed:eggs']||0)>=500;
{const c=(Y.cuts['wr.road.stair']||{taken:{}}).taken;
 T.ok('Dalab\'s tenth toll at the Stairhead lands in dalab.blakhed in ice, rope and eggs',tollOk(c),
  'ice '+Math.round(c['dalab.blakhed:ice']||0)+' kg, rope '+Math.round(c['dalab.blakhed:rope']||0)+' kg, eggs '+Math.round(c['dalab.blakhed:eggs']||0)+' kg');
 T.neg('a missing ice toll is caught',tollOk,Object.assign({},c,{'dalab.blakhed:ice':0}),c);}

// 5. drovers' salt, Fowlers' eggs/honey, Ice-cutters' winter sledge road (waits in thaw, lands ice in winter)
const roadsOk=(dr,fw,ic,icRep)=>(dr.salt||0)>=45000&&(fw.eggs||0)>=20000&&(fw.honey||0)>=5000&&(ic.ice||0)>=150000&&(icRep.waited||0)>0;
{const dr=landed(Y.trade,'wr.road.drove','wr.drovers>wr.blakhed'),fw=landed(Y.trade,'wr.road.north','wr.fowlers>wr.blakhed'),
  ic=landed(Y.trade,'wr.road.ice','wr.icecutters>wr.blakhed'),icRep=Y.trade['wr.road.ice']||{};
 T.ok('the rim roads work: drovers\' salt ('+Math.round((dr.salt||0)/1000)+' t), Fowlers\' eggs and honey, and Ice-cutters\' winter lake ice ('+Math.round((ic.ice||0)/1000)+' t, waited '+icRep.waited+' h in the thaw)',
  roadsOk(dr,fw,ic,icRep),'salt '+Math.round(dr.salt||0)+', eggs '+Math.round(fw.eggs||0)+', lake ice '+Math.round(ic.ice||0));
 T.neg('an ice road left open in the thaw (waited 0) is caught',rep=>roadsOk(dr,fw,ic,rep),{waited:0},icRep);}

/* ---- Part B: W3 join with XAN_TUNE (gate.dalab.blakhed and gate.dalab.nulab replaced on the Annual Great Caravan) */
const PX=JSON.parse(rd('openworld/xanadu-oidong-highrift/plan/sites.json'));
const t1=Date.now();
loadHost();
const XV=XAN_TUNE.valley(PX,{scale:100}),JV=WR_BLAKHED.join(XV),J=runSpec(JV,365);
const jSecs=(Date.now()-t1)/1000;
console.log('Xanadu + Blakhed W3 join year in '+jSecs.toFixed(1)+' s: '+J.S.order.length+' settlements, '+J.actors+' actors');

// 6. stand-ins gone, real wr.blakhed & wr.nulab on caravan.great, ledger balances
const joinShapeOk=V=>{const ids=new Set(V.settlements.map(s=>s.id)),cg=V.roads.find(r=>r.id==='caravan.great');
 return !ids.has('gate.dalab.blakhed')&&!ids.has('gate.dalab.nulab')&&ids.has('gate.dalab.shelf')&&ids.has('wr.blakhed')&&ids.has('wr.nulab')&&
  cg.stops.includes('wr.blakhed')&&cg.stops.includes('wr.nulab')&&!cg.stops.includes('gate.dalab.blakhed');};
T.ok('W3 join declared: gate.dalab.blakhed and gate.dalab.nulab replaced by wr.blakhed and wr.nulab on caravan.great, books balance',
 joinShapeOk(J.V)&&!J.S.problems.length&&J.ledger.ok,
 'stops: '+J.V.roads.find(r=>r.id==='caravan.great').stops.join(' -> '));
T.neg('leaving gate.dalab.blakhed in the settlements is caught',joinShapeOk,
 Object.assign({},J.V,{settlements:J.V.settlements.concat([{id:'gate.dalab.blakhed'}])}),J.V);

// 7. the Great Caravan lands Xanadu's exports at real wr.blakhed, Golden Tears' mission takes its cut, Dalab's factors forward down the stair, and Shelf's imports still land at Erehwon
const caravanOk=(toBk,toEr,stairDn,tearsCut)=>{
 const xTot=Object.values(toBk).reduce((a,b)=>a+b,0),tCut=Object.keys(tearsCut).filter(k=>k.startsWith('tears.blakhed:')).reduce((n,k)=>n+tearsCut[k],0);
 const fwd=['cacao','tea','silk','sulfur'].some(g=>(stairDn[g]||0)>0);
 return xTot>5000&&Object.keys(toBk).filter(g=>toBk[g]>0).length>=3&&tCut>50&&fwd&&(toEr.salt||0)>500000&&(toEr.wine||0)>500;};
{const toBk=landed(J.trade,'caravan.great','s57bkv9741>wr.blakhed'),toEr=landed(J.trade,'caravan.great','gate.dalab.shelf>s57bkv9741'),
  stairDn=landed(J.trade,'wr.road.stair','wr.blakhed>wr.nulab'),c=(J.cuts['caravan.great']||{taken:{}}).taken;
 T.ok('the Annual Great Caravan lands Xanadu\'s exports at wr.blakhed, tears.blakhed takes its cut, Dalab\'s factors send them down the stair to wr.nulab, and Shelf\'s salt and wine reach Erehwon',
  caravanOk(toBk,toEr,stairDn,c),
  'to Blakhed '+Math.round(Object.values(toBk).reduce((a,b)=>a+b,0))+' kg; to Erehwon salt '+Math.round(toEr.salt||0)+' kg, wine '+Math.round(toEr.wine||0)+' kg');
 T.neg('a caravan that landed nothing at wr.blakhed is caught',bk=>caravanOk(bk,toEr,stairDn,c),{},toBk);}

T.done();
