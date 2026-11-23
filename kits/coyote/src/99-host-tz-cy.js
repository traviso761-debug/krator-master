// ================================================================= THE KIT'S PROBE FIELDS (verify.py --assert), after core/engine's
// 99-host-take.js has handed the page to core/host: added to window._api.
//   carvings()     every carved record: its text, the line's hash and segments, and whether cyContour of the text gives
//                  the same hash (contour-text)
//   doorsAudit()   every unlocked door opens (core/door: its leaf moves, its walk blocks switch off) and shuts again
//   reachAudit()   with every door open, each building's targets (cyTarget: its floors, its roof) are on floors reached from
//                  the ground at its front (KWALK.reach): the roof by the outside ladder, the room down the hatch. The flood
//                  runs on a 0.2 m cell: a steep ladder is a stack of rungs (core/walk/box KWALKBOX.ladder) climbed by stepping
//                  between neighbouring cells, and against a wall the walker's radius leaves too few 0.4 m cells to step between
//   gateAudit()    C6: wall-closed (foot to foot, no gap between curtains and nodes), water-gate (core/water river passes
//                  under cy_water_gate's culverts), shrine-at-foot (runner shrine at the road's foot), no-golden-feathers
//   fingerprint()  a hash over the records, the carvings and the doors: two builds must match
//   rebuild()      buildWorld() again, then the fingerprint
(function(){
 const A=window._api||(window._api={});
 /* the sheet's ground plane (core/engine 90-scene.js) named, so the harness's eye check (drawn-ground) measures against it */
 if(typeof groundM!=='undefined')groundM.name='ground';
 const settle=n=>{for(let i=0;i<(n==null?40:n);i++)KDOOR.step(.1);};
 const front=r=>{const f=r.front&&r.front.world;if(!f)return null;const y=f.yaw,d=r.front.source==='declared'?.3:1.2,x=f.x+Math.sin(y)*d,z=f.z+Math.cos(y)*d;return [x,terrainH(x,z),z];};
 function fp(){let h=0x811c9dc5;const mix=s=>{for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}};
  for(const r of REG)mix(r.key+'|'+r.x.toFixed(3)+'|'+r.z.toFixed(3)+'|'+r.ry.toFixed(4)+'|'+r.tris+'|'+(r.carving?r.carving.hash:''));
  mix(JSON.stringify(KDOOR.export().doors.map(d=>[d.id,d.kind,+d.at[0].toFixed(3),+d.at[2].toFixed(3)])));
  return ('00000000'+h.toString(16)).slice(-8);}
 Object.assign(A,{
  carvings(){return REG.filter(r=>r.carving).map(r=>({key:r.key,tid:r.tid,text:r.carving.text,hash:r.carving.hash,segs:r.carving.segs,same:cyContour(r.carving.text).hash===r.carving.hash}));},
  doorsAudit(){const L=KDOOR.list.filter(D=>!D.locked),bad=[];for(const D of L)KDOOR.open(D,{by:'probe'});settle(40);
   for(const D of L){const l=KDOOR.leaves(D)[0];if(D.open<.99||(D.blocks.length&&!D.blocks.every(b=>b.off)))bad.push(D.id+' open '+D.open.toFixed(2));if(!l||![l.p[0],l.p[1],l.p[2]].every(isFinite))bad.push(D.id+' no pose');}
   for(const D of L)KDOOR.close(D,{by:'probe'});settle(40);for(const D of L)if(D.open>.01||(D.blocks.length&&D.blocks.some(b=>b.off)))bad.push(D.id+' did not shut');
   return {doors:L.length,locked:KDOOR.list.length-L.length,bad};},
  reachAudit(){const L=KDOOR.list.filter(D=>!D.locked);for(const D of L)KDOOR.open(D,{by:'probe'});settle(40);const out=[];let n=0;
   for(const r of REG){if(r.parent||!r.targets||!r.targets.length)continue;n++;const s=front(r);if(!s){out.push({key:r.key,why:'no front'});continue;}
    const b=r.bbox,box=[Math.min(b.mn[0]-5,s[0]-2),Math.max(b.mx[0]+5,s[0]+2),Math.min(b.mn[2]-5,s[2]-2),Math.max(b.mx[2]+5,s[2]+2)],R=   /* the flood's box holds its own start */KWALK.reach([s],{ground:terrainH,box,cell:.2}),got=new Set(R.reached);
    const miss=r.targets.filter(t=>!KWALK.floorsAt(t.x,t.z).some(f=>Math.abs(f[0]-t.y)<.35&&got.has(f[1])));
    if(miss.length)out.push({key:r.key,missed:miss.map(t=>t.name),reached:R.reached.length,unreached:R.unreached.length,capped:R.capped});}
   for(const D of L)KDOOR.close(D,{by:'probe'});settle(40);
   return {buildings:n,bad:out};},
  gateAudit(){
   const G=REG.find(r=>r.key==='cy_gate_wall'&&r.gateWall);
   if(!G)return {found:false};
   const W=G.gateWall,P=W.plan,gaps=[];
   for(let i=0;i<P.segs.length;i++){
    const A0=P.nodes[i],B0=P.nodes[i+1],S0=P.segs[i];
    const dA=Math.hypot(S0.ax-A0.x,S0.az-A0.z)-A0.w/2,dB=Math.hypot(S0.bx-B0.x,S0.bz-B0.z)-B0.w/2;
    if(dA>.05)gaps.push(S0.id+'->'+A0.id+' '+dA.toFixed(2));
    if(dB>.05)gaps.push(S0.id+'->'+B0.id+' '+dB.toFixed(2));}
   const wg=G.children.find(c=>c.key==='cy_water_gate'),wx=W.waterGateX[0],wz=W.waterGateX[1];
   const hAt=typeof WATER!=='undefined'?WATER.heightAt(wx,wz,0):null,flAt=typeof WATER!=='undefined'?WATER.flowAt(wx,wz):[0,0,0,0];
   const cul=wg&&wg.culverts;
   const taboo=REG.filter(r=>r.key!=='cy_phoenix_altar'&&/golden[- ]?(?:bird[- ]?)?feather|phoenix[- ]?feather/i.test((r.name||'')+' '+(DEFS[r.key]&&DEFS[r.key].note||'')));
   return {
    found:true,
    wallClosed:W.footDist[0]<=1&&W.footDist[1]<=1&&!gaps.length&&P.nodes.length>=5&&P.segs.length===P.nodes.length-1,
    wallDetail:P.nodes.length+' nodes, '+P.segs.length+' runs, feet '+W.footDist.map(d=>d.toFixed(2)).join('/')+' m, gaps '+(gaps.join(', ')||'none'),
    waterGate:!!(wg&&cul&&hAt!=null&&hAt>.3&&hAt<cul.crownY-1&&flAt[2]>.5),
    waterDetail:wg&&hAt!=null?'Hau-Gel h '+hAt.toFixed(2)+' m under crown '+cul.crownY+' m, speed '+flAt[2].toFixed(2)+' m/s':'no flow under cy_water_gate',
    shrineAtFoot:W.shrineDist<=10,
    shrineDetail:'cy_runner_shrine '+W.shrineDist.toFixed(2)+' m from road foot',
    noGoldenFeathers:!taboo.length,
    featherDetail:taboo.length?taboo.map(r=>r.key).join(', '):'no golden-bird feathers in any record'
   };},
  fingerprint:fp,
  rebuild(){buildWorld();return fp();}
 });
})();
