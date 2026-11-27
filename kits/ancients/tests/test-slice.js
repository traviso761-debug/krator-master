// node kits/ancients/tests/test-slice.js — Slice (Soleri's 26. Theology) [G data] plan, interior program & modern-condition checks
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..');
const T=require('../../../tools/ktest.js')(__filename);

const ctx={Math,console};
vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','kits/ancients/targets/slice/8av0-slice-plan.js']){
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.SLICE=typeof SLICE!=="undefined"?SLICE:this.SLICE;',ctx,{filename:f});
}

const SL=ctx.SLICE;
const P=SL.plan({seed:12420});
const S=P.stats;
const RU=SL.ruin(P);
const MG=SL.modernGuide(P,RU);

console.log(JSON.stringify({
 coveredHa:S.surfaceCoveredHa,grossHa:S.grossFloorHa,litHa:S.litFloorHa,
 pop:S.population,density:S.densityPerHa,jobs:S.jobs,
 recCap:S.recreationCapacity,parkHa:S.openParkHa,pools:S.pools,
 units:S.programUnits,sanctuaryPop:MG.summary.eye_sanctuary.sustainableModernPop
}));

T.ok('plan is deterministic across runs',JSON.stringify(P)===JSON.stringify(SL.plan({seed:12420})));
T.ok('different seed produces distinct dress positions',JSON.stringify(SL.dress(P,null))!==JSON.stringify(SL.dress(SL.plan({seed:12425}),null)));
T.ok('population matches Soleri 26. Theology scale (~13 000 at ~378/ha over 34 ha)',
 S.population>=11500&&S.population<=14500&&S.surfaceCoveredHa===34&&S.height===560,
 'got pop='+S.population+' density='+S.densityPerHa+'/ha');
T.ok('all four program categories (live, work, recreation, civic) are populated',
 S.byCategory.live.count>=8&&S.byCategory.work.count>=5&&S.byCategory.recreation.count>=4&&S.byCategory.civic.count>=5,
 JSON.stringify(S.byCategory));
T.ok('subterranean Automated Industries galleries have zero daylight housing (Kowloon/Soleri rule)',
 P.program.filter(u=>u.zone==='subterranean_work').every(u=>u.category!=='live'&&u.litM2===0));
T.ok('lenticular eye geometry tapers cleanly to equator y = 456 m at |x| = 360 and spans 410..536 m at x = 0',
 SL.eyeTopY(0)===536&&SL.eyeBotY(0)===410&&SL.eyeTopY(360)===456&&SL.eyeBotY(-360)===456&&SL.inEye(0,470)&&!SL.inEye(365,456));
T.ok('four side caverns (research, museums, anthro, pavilion), 36 shaft tiers, 26 battered wall steps and 6 rear skylight courts exist',
 P.caverns.length===4&&P.shaftBands.length===36&&P.dwallSteps.length===26&&P.skylights.length===6&&P.portals.length===2);

const allIds=[P.industries.id,P.park.id,P.dwall.id,P.shaft.id,P.dome.id,P.fan.id]
 .concat(P.eyeWings.map(x=>x.id),P.caverns.map(x=>x.id),P.skylights.map(x=>x.id),
  P.portals.map(x=>x.id),P.pools.map(x=>x.id),P.cores.map(x=>x.id),
  P.slotRibs.map(x=>x.id),P.program.map(x=>x.id));
T.ok('every structural and interior program record has a unique stable id',new Set(allIds).size===allIds.length,
 'count '+allIds.length+' vs unique '+new Set(allIds).size);

const intactReach=SL.reach(P,['entry.gorge'],new Set());
const allMainNodes=[P.industries.id,P.park.id,P.dwall.id,P.shaft.id,P.dome.id,P.fan.id]
 .concat(P.eyeWings.map(x=>x.id),P.caverns.map(x=>x.id),P.skylights.map(x=>x.id),P.portals.map(x=>x.id));
T.ok('intact circulation connects the gorge floor through the Learning Shaft to the Eye Dome, side caverns, skylight courts and transit portals',
 allMainNodes.every(id=>intactReach.has(id)),
 'missing: '+allMainNodes.filter(id=>!intactReach.has(id)).join(', '));

T.ok('in the ruin, the mid-shaft blowout cuts off the Upper Eye Sanctuary from the lower gorge and sunken trench',!MG.gorgeTouchesEye);
T.ok('in the ruin, the Coffered Dome and East Skylight Sanctuary remain reachable from the plateau transit portals and hex drums',MG.domeReachableFromPlateau);
T.ok('modern guide classifies eye_sanctuary, trench_town, isolated_west and collapsed zones cleanly',
 MG.summary.eye_sanctuary.units>=10&&MG.summary.trench_town.units>=5&&MG.summary.isolated_west.units>=3&&MG.summary.collapsed.units>=1&&
 MG.summary.eye_sanctuary.sustainableModernPop>=350&&MG.summary.eye_sanctuary.sustainableModernPop<=3500,
 JSON.stringify(MG.summary));

/* Negative checks (T.neg: must fail on the faulty input and pass on the fixed input) */
T.neg('subterranean Automated Industries rule rejects windowless basement housing',
 units=>units.every(u=>u.zone!=='subterranean_work'||(u.category!=='live'&&u.litM2===0)),
 [{zone:'subterranean_work',category:'live',litM2:600}],
 P.program);

T.neg('modern sanctuary isolation check catches an unbroken mid-shaft core',
 blocked=>!SL.reach(P,['entry.gorge'],blocked).has('slice.dome'),
 new Set(['slice.stair.shaft.west']),
 SL.blockedCarriers(RU));

T.done();
