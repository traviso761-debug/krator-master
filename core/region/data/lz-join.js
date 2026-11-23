// core/region/data/lz-join.js — LZ_JOIN [G data]: the Xanadu Sultanate and the Lizardmen's country as one valley (step Z5 of
// core/simulation/PROPOSAL-LIZARDMEN.md; the owner, 2026-11-17: "let's get them in the simulation as a presence; next step,
// implement raiding"). It joins two tunes read beside it, unchanged, as EAST_RIFT joins Xanadu and Longsong:
//   XAN_TUNE (core/region/data/xan-tune.js), the Sultanate, at its own scale (50 people an actor, its countrysides 200);
//   LZ_TUNE (core/region/data/lz-tune.js), the Lizardmen, at theirs (each of their settlements carries `scale`), with the
//   Allotment (core/region/51-region-allot.js) and the raids (core/region/52-region-raid.js).
// The join:
//   - the two frames are one already (LZ_TUNE.px is Xanadu's: metres from px 1191,1569);
//   - the settlements, goods and factions are put together (no id or unit is shared: the test checks);
//   - the Lizardmen are hostile to every faction (LORE 6.20: "they never trade or treat"); no road joins the two, so the only
//     links are the raids: this is the one run where they touch the Sultanate's ledger;
//   - the raids' targets are the Sultanate's own settlements (the Marches' forts, its villages, the Golden Tears' camp),
//     raided in their own books: the take leaves their warehouses (booked exported), a fort's `state` is set on its record.
//   LZ_JOIN.valley(Px, o) -> the joined valley spec. o: {scale (the Sultanate's), raids (true; false leaves them out: the
//   negative), allot (true)}
var LZ_JOIN=(function(){'use strict';
const J={};
J.valley=function(Px,o){o=o||{};
 const X=XAN_TUNE.valley(Px,{scale:o.scale}),L=LZ_TUNE.valley({allot:o.allot!==false,raids:o.raids===false?false:{offMap:false}});
 const ids=new Set(X.settlements.map(s=>s.id)),clash=L.settlements.filter(s=>ids.has(s.id)).map(s=>s.id);
 if(clash.length)throw new Error('LZ_JOIN: settlement ids in both tunes: '+clash.join(', '));
 const goods=Object.assign({},X.goods);Object.keys(L.goods).forEach(g=>{if(goods[g]&&goods[g].unit!==L.goods[g].unit)throw new Error('LZ_JOIN: '+g+' in '+goods[g].unit+' and '+L.goods[g].unit);goods[g]=goods[g]||L.goods[g];});
 const factions=X.factions.concat(L.factions.filter(f=>!X.factions.some(x=>x.id===f.id)));
 const relations=X.relations.concat(X.factions.map(f=>({a:LZ_TUNE.faction.id,b:f.id,stance:'hostile'})));
 const V=Object.assign({},X,{goods,factions,relations,settlements:X.settlements.concat(L.settlements)});
 if(L.allot)V.allot=L.allot;
 if(L.raids){const miss=L.raids.targets.filter(t=>!ids.has(t.id)).map(t=>t.id);if(miss.length)throw new Error('LZ_JOIN: raid targets not in the Sultanate: '+miss.join(', '));V.raids=L.raids;}
 return V;};
if(typeof module!=='undefined'&&module.exports)module.exports=J;
return J;})();
