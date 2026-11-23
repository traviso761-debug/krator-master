// ================================================================= THE MARCHES — the two watch forts as records (PLAN.md sections 1 and 3, M1)  [G data]
// The forts' records read from the tune in place (core/region/data/xan-tune.js, XAN_TUNE: the forts are settlements of its valley
// spec, the musketeers T.muskets), never copied, and the plan the fort asset gives them (kits/xanadu 80f, XFORT.plan at size
// 'watch', checked by XFORT.check). No THREE, no DOM: the sheet's rows (targets/forts/89z-rows.js) and the node test
// (tests/test-marches.js) run this same code.
//   MRF.IDS                    the two forts this plan builds (march.e, the beacon fort, is settlements/beacon's)
//   MRF.records(T, XF, KR, V)  T XAN_TUNE, XF XFORT, KR KRAND, V a valley spec (default T.valley({sites:[]}, {}): the forts need no
//                              region plan) -> {P, faults, forts:[{id, name, px, people, state, parent, musketeers, garrison, seed}]}
//   MRF.garrison(people, mus, XF)   the PROPOSED split of a fort's people (PLAN.md section 3): the commander's household, foot
//                              (archers and spearmen), horse, the hired musketeers (the tune's), the gate tower gun's gunners, the
//                              relay post's rota (three watches of XFORT.post()'s men); foot takes the rest
//   MRF.pins()                 M3: the scale-model queue's records-only fort pins (listed, never written to the model)
const MRF=(function(){
 'use strict';
 const IDS=['march.w','march.s'];
 const garrison=(people,mus,XF)=>{const g={household:10,horse:25,musketeers:mus|0,gunners:5,postRota:XF.post().rota*3};
  g.foot=people-g.household-g.horse-g.musketeers-g.gunners-g.postRota;return g;};
 const px=s=>[Math.round(s.x/2000+1191),Math.round(s.z/2000+1569)];   /* XAN_TUNE.px inverted: 2 km a pixel from 1191,1569 */
 function records(T,XF,KR,V){V=V||T.valley({sites:[]},{});const P=XF.plan({size:'watch'});
  const forts=IDS.map(id=>{const s=V.settlements.find(q=>q.id===id);if(!s)throw new Error('XAN_TUNE has no '+id);const mus=(T.muskets.men[id]|0);
   return{id,name:s.name,px:px(s),people:s.people,state:s.state,parent:s.parent,musketeers:mus,garrison:garrison(s.people,mus,XF),
    seed:KR.child(20261123,id)>>>0};});
  return{P,faults:XF.check(P),forts,size:'watch',dress:'march'};}
 const pins=(R)=>R.forts.map(F=>({id:F.id==='march.w'?'smarchw0001':'smarchs0001',type:'fort',px:F.px,polity:'xanadu',name:F.name,tune:F.id,records_only:true,proposed:true}));
 return{IDS,records,garrison,pins};})();
if(typeof module!=='undefined')module.exports=MRF;
