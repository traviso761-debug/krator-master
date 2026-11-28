// node kits/ancients/tests/test-arcoindian3.js — Arcoindian III [G data] plan, interior program & modern-condition checks
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..');
const T=require('../../../tools/ktest.js')(__filename);

const ctx={Math,console};
vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','kits/ancients/targets/arcoindian3/8au0-arcoindian3-plan.js']){
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.ARCO3=typeof ARCO3!=="undefined"?ARCO3:this.ARCO3;',ctx,{filename:f});
}

const A=ctx.ARCO3;
const P=A.plan({seed:12400});
const S=P.stats;
const RU=A.ruin(P);
const MG=A.modernGuide(P,RU);

console.log(JSON.stringify({
 grossHa:S.grossFloorHa,litHa:S.litFloorHa,pop:S.population,jobs:S.jobs,
 recCap:S.recreationCapacity,gardensHa:S.openGardenHa,pools:S.pools,
 units:S.programUnits,sanctuaryPop:MG.summary.sanctuary.sustainableModernPop
}));

T.ok('plan is deterministic across runs',JSON.stringify(P)===JSON.stringify(A.plan({seed:12400})));
T.ok('different seed produces distinct dress positions',JSON.stringify(A.dress(P,null))!==JSON.stringify(A.dress(A.plan({seed:12405}),null)));
T.ok('population is in the Arcoindian city scale (18 000 to 42 000)',S.population>=18000&&S.population<=42000,'got '+S.population);
T.ok('all four program categories (live, work, recreation, civic) are populated',
 S.byCategory.live.count>=20&&S.byCategory.work.count>=14&&S.byCategory.recreation.count>=25&&S.byCategory.civic.count>=2);
T.ok('deep cliff galleries have zero daylight housing (Kowloon rule)',
 P.program.filter(u=>u.zone==='deep_cliff').every(u=>u.category!=='live'&&u.litM2===0));
T.ok('all eight fluted towers, six spine terraces, twelve oculus courts and twenty-four emerald pools exist',
 P.towers.length===8&&P.terraces.length===6&&P.courts.length===12&&P.pools.length===24&&P.bridges.length===7);

const allIds=[P.quay.id,P.vault.id]
 .concat(P.terraces.map(x=>x.id),P.towers.map(x=>x.id),P.bridges.map(x=>x.id),
  P.courts.map(x=>x.id),P.pools.map(x=>x.id),P.cores.map(x=>x.id),P.program.map(x=>x.id));
T.ok('every structural and interior program record has a unique stable id',new Set(allIds).size===allIds.length,
 'count '+allIds.length+' vs unique '+new Set(allIds).size);

const intactReach=A.reach(P,['entry.river'],new Set());
const allMainNodes=[P.quay.id,P.vault.id]
 .concat(P.terraces.map(x=>x.id),P.towers.map(x=>x.id),P.courts.map(x=>x.id),P.deepGalleries.map(x=>x.id));
T.ok('intact circulation connects the river quay to every terrace, court, fluted tower, deep gallery and the barrel vault',
 allMainNodes.every(id=>intactReach.has(id)),
 'missing: '+allMainNodes.filter(id=>!intactReach.has(id)).join(', '));

T.ok('in the ruin, the Crown Barrel Vault and Upper Sanctuary are cut off from the flooded river quay',!MG.riverTouchesRim);
T.ok('in the ruin, the Crown Barrel Vault and East Sanctuary remain reachable from the guarded plateau rim stair',MG.vaultReachableFromRim);
T.ok('modern guide classifies sanctuary, river salvage, isolated west and collapsed units cleanly',
 MG.summary.sanctuary.units>=18&&MG.summary.river_salvage.units>=8&&MG.summary.isolated_west.units>=6&&MG.summary.collapsed.units>=2&&
 MG.summary.sanctuary.sustainableModernPop>=400&&MG.summary.sanctuary.sustainableModernPop<=3500,
 JSON.stringify(MG.summary));

/* Negative checks (T.neg: must fail on the faulty input and pass on the fixed input) */
T.neg('daylight housing rule rejects a deep windowless dwelling unit',
 units=>units.every(u=>u.zone!=='deep_cliff'||(u.category!=='live'&&u.litM2===0)),
 [{zone:'deep_cliff',category:'live',litM2:500}],
 P.program);

T.neg('modern sanctuary isolation check catches an unbroken lower lift core',
 blocked=>!A.reach(P,['entry.river'],blocked).has('arco3.vault'),
 new Set(['arco3.stair.west.0']),
 A.blockedCarriers(RU));

T.done();
