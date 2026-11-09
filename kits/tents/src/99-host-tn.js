// ================================================================= THE KIT'S PROBE FIELDS (verify.py --assert), after core/engine's
// 99-host-take.js has handed the page to core/host: added to window._api.
//   tents()        every placed tent: its key, role, trade, dress, wear, culture, interior summary, door count, parent
//   stakes()       the floating-stake audit: every stake's foot at or under the ground, its top above it
//   interiors()    the interiors placed (kits/interiors/sets/tents.js): rooms, pieces, the residence rule, what went missing
//   camps()        the two camps core/camp pitched: records, short, KCAMP.check, the band's census
//   doorsAudit()   every unlocked door opens (core/door: its leaf moves, its walk blocks switch off) and shuts again
//   reachAudit()   with every door open, each tent's floors are reached from the ground outside its door (KWALK.reach)
//   fingerprint()  a hash over the records, the furniture, the interiors' pieces and the doors: two builds must match
//   rebuild()      buildWorld() again, then the fingerprint
(function(){
 const A=window._api||(window._api={});
 const front=r=>{const f=r.front&&r.front.world;if(!f)return null;const y=f.yaw;return [f.x+Math.sin(y)*1.4,terrainH(f.x+Math.sin(y)*1.4,f.z+Math.cos(y)*1.4),f.z+Math.cos(y)*1.4];};
 const settle=n=>{for(let i=0;i<(n||40);i++)KDOOR.step(.1);};
 function fp(){let h=0x811c9dc5;const mix=s=>{for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}};
  for(const r of REG)mix(r.key+'|'+r.x.toFixed(3)+'|'+r.z.toFixed(3)+'|'+r.ry.toFixed(4)+'|'+r.tris+'|'+(r.tent?r.tent.dress+r.tent.wear+r.tent.patches:''));
  for(const f of SVF.placed)mix(f.key+'|'+f.x.toFixed(3)+'|'+f.z.toFixed(3)+'|'+(f.variant|0));
  for(const I of TN_INTERIORS)mix(I.key+'|'+I.kind+'|'+I.pieces+'|'+I.culture);
  mix(JSON.stringify(KDOOR.export().doors.map(d=>[d.id,d.kind,+d.at[0].toFixed(3),+d.at[2].toFixed(3)])));
  mix(String(SVF.batch.tris|0));return ('00000000'+h.toString(16)).slice(-8);}
 Object.assign(A,{
  tents(){return REG.filter(r=>r.tent).map(r=>Object.assign({key:r.key,tid:r.tid,parent:r.parent?r.parent.key:null,culture:r.tags.culture,types:r.tags.types,doors:r.doorCount,tris:r.tris},r.tent,{interior:r.interior||null}));},
  stakes(){const bad=TN_STAKES.filter(s=>s.foot>s.ground+.005||s.top<s.ground+.1);return {n:TN_STAKES.length,floating:bad.length,bad:bad.slice(0,12)};},
  interiors(){return TN_INTERIORS;},
  camps(){return Object.keys(TN_CAMPS).map(id=>{const c=TN_CAMPS[id];return {id,formation:c.formation,dress:c.dress,records:c.records.length,short:c.short,check:c.check,
   pop:c.census?c.census.pop:null,households:c.census?c.census.households.length:null,staffed:c.census?c.census.people.filter(p=>p.work).length:null,
   placed:REG.filter(r=>r.parent&&r.parent.key==='tn-camp-'+id).length};});},
  doorsAudit(){const L=KDOOR.list.filter(D=>!D.locked),bad=[];for(const D of L)KDOOR.open(D,{by:'probe'});settle(40);
   for(const D of L){const l=KDOOR.leaves(D)[0];if(D.open<.99||(D.blocks.length&&!D.blocks.every(b=>b.off)))bad.push(D.id+' open '+D.open.toFixed(2));if(!l||![l.p[0],l.p[1],l.p[2]].every(isFinite))bad.push(D.id+' no pose');}
   for(const D of L)KDOOR.close(D,{by:'probe'});settle(40);for(const D of L)if(D.open>.01||(D.blocks.length&&D.blocks.some(b=>b.off)))bad.push(D.id+' did not shut');
   const kinds={};for(const D of L)kinds[D.kind+(D.roll?'/roll':'')+(D.pair?'/pair':'')]=(kinds[D.kind+(D.roll?'/roll':'')+(D.pair?'/pair':'')]||0)+1;
   return {doors:L.length,locked:KDOOR.list.length-L.length,kinds,bad};},
  reachAudit(){const L=KDOOR.list.filter(D=>!D.locked);for(const D of L)KDOOR.open(D,{by:'probe'});settle(40);const out=[];
   for(const r of REG){if(!r.interior||!r.interior.floors)continue;const s=front(r);if(!s){out.push({key:r.key,tid:r.tid,why:'no front'});continue;}
    const b=r.bbox,box=[b.mn[0]-4,b.mx[0]+4,b.mn[2]-4,b.mx[2]+4];const R=KWALK.reach([s],{ground:terrainH,box});
    const mine=f=>String(f.tag).indexOf(r.interior.walkTag)===0;const un=R.unreached.filter(mine),ok=R.reached.filter(mine);
    if(un.length||!ok.length)out.push({key:r.key,tid:r.tid,dress:r.tent&&r.tent.dress,reached:ok.length,unreached:un.length});}
   for(const D of L)KDOOR.close(D,{by:'probe'});settle(40);
   return {tents:REG.filter(r=>r.interior&&r.interior.floors).length,bad:out};},
  fingerprint:fp,
  rebuild(){buildWorld();return fp();}
 });
})();
