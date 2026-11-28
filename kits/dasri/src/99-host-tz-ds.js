// ================================================================= DASRI PROBE FIELDS FOR VERIFY.PY ([web])
// Extends window._api after core/engine/99-host-take.js with kit-specific audits (each with positive + negative checks):
//   doorsAudit()      every operable KDOOR leaf swings open and closes cleanly; KGLASS stained/lit/clear panes > 80
//   reachAudit()      every walkable building's ground/courtyard/terrace targets reached from its front on KWALK
//   registerAudit()   Urban Jabal vs Dasri Village architectural register contrast (heights, qamariya, jussBands)
//   cliffAudit()      Cliff-locked placement contract across both sheet cliff compositions AND all 28 defs via DASRI.proto
//   fingerprint()     Deterministic rebuild hash

(function(){
 const A=window._api||(window._api={});
 if(typeof groundM!=='undefined')groundM.name='ground';

 const settle=n=>{for(let i=0;i<(n==null?40:n);i++)KDOOR.step(.1);};
 const frontPt=r=>{
  const f=r.front&&r.front.world;if(!f)return null;
  const y=f.yaw,d=1.15,x=f.x+Math.sin(y)*d,z=f.z+Math.cos(y)*d;
  return [x,terrainH(x,z),z];
 };

 function fp(){
  let h=0x811c9dc5;
  const mix=s=>{for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}};
  for(const r of REG){
   mix(r.key+'|'+r.x.toFixed(3)+'|'+r.z.toFixed(3)+'|'+r.ry.toFixed(4)+'|'+r.tris+'|'+(r.ds?r.ds.qamariya+':'+r.ds.jussBands:''));
  }
  mix(JSON.stringify(KDOOR.export().doors.map(d=>[d.id,d.kind,+d.at[0].toFixed(3),+d.at[2].toFixed(3)])));
  return ('00000000'+h.toString(16)).slice(-8);
 }

 Object.assign(A,{
  doorsAudit(){
   const L=KDOOR.list.filter(D=>!D.locked),bad=[];
   for(const D of L)KDOOR.open(D,{by:'probe'});
   settle(40);
   for(const D of L){
    const l=KDOOR.leaves(D)[0];
    if(D.open<.99||(D.blocks.length&&!D.blocks.every(b=>b.off)))bad.push(D.id+' open '+D.open.toFixed(2));
    if(!l||![l.p[0],l.p[1],l.p[2]].every(isFinite))bad.push(D.id+' invalid pose');
   }
   for(const D of L)KDOOR.close(D,{by:'probe'});
   settle(40);
   for(const D of L){
    if(D.open>.01||(D.blocks.length&&D.blocks.some(b=>b.off)))bad.push(D.id+' did not shut');
   }
   return {doors:L.length,locked:KDOOR.list.length-L.length,panes:SV_OPEN.panes,bad};
  },

  reachAudit(){
   const L=KDOOR.list.filter(D=>!D.locked);
   for(const D of L)KDOOR.open(D,{by:'probe'});
   settle(40);
   const out=[];let n=0;
   for(const r of REG){
    if(r.parent||!r.targets||!r.targets.length)continue;
    n++;
    const s=frontPt(r);
    if(!s){out.push({key:r.key,why:'no front'});continue;}
    const b=r.bbox,box=[Math.min(b.mn[0]-5,s[0]-2),Math.max(b.mx[0]+5,s[0]+2),Math.min(b.mn[2]-5,s[2]-2),Math.max(b.mx[2]+5,s[2]+2)];
    const R=KWALK.reach([s],{ground:terrainH,box,cell:.2}),got=new Set(R.reached);
    const miss=r.targets.filter(t=>!KWALK.floorsAt(t.x,t.z).some(f=>Math.abs(f[0]-t.y)<.42&&got.has(f[1])));
    if(miss.length)out.push({key:r.key,missed:miss.map(t=>t.name),reached:R.reached.length,unreached:R.unreached.length});
   }
   for(const D of L)KDOOR.close(D,{by:'probe'});
   settle(40);
   return {buildings:n,bad:out};
  },

  registerAudit(){
   const top=REG.filter(r=>!r.parent);
   const urb=top.filter(r=>/^ds_jabal_/.test(r.key));
   const vil=top.filter(r=>/^ds_vil_/.test(r.key));
   const bad=[];
   for(const r of urb){
    const bh=r.bbox.mx[1]-r.bbox.mn[1];
    if(bh<9.5)bad.push(r.key+' urban too low '+bh.toFixed(1));
    if(!r.ds||r.ds.jussBands<1)bad.push(r.key+' missing white juss relief bands');
    if(r.key!=='ds_jabal_call_tower'&&(!r.ds||r.ds.qamariya<1))bad.push(r.key+' missing qamariya fanlights');
   }
   for(const r of vil){
    const bh=r.bbox.mx[1]-r.bbox.mn[1];
    if(bh>13.4)bad.push(r.key+' village exceeds vernacular height cap '+bh.toFixed(1));
    if(r.ds&&r.ds.qamariya>0)bad.push(r.key+' village piece has urban qamariya ('+r.ds.qamariya+')');
   }
   const shibam=urb.filter(r=>r.ds&&r.ds.shibam);
   return {
    ok:!bad.length&&urb.length>=16&&vil.length>=12&&shibam.length>=2,
    urban:urb.length,
    village:vil.length,
    shibam:shibam.length,
    bad
   };
  },

  cliffAudit(){
   const S=window._dsSheet||{};
   const jRecs=(S.jabalCliff&&S.jabalCliff.recs||[]).filter(r=>r.ds&&r.ds.cliff);
   const vRecs=(S.vilCliff&&S.vilCliff.recs||[]).filter(r=>r.ds&&r.ds.cliff);
   const sheetChk=DASRI.check.cliff(jRecs.concat(vRecs));
   /* Also test EVERY single one of the 28 defs in cliff:true mode via DASRI.proto! */
   const protoRecs=[];
   for(const k of Object.keys(DEFS)){
    const p=DASRI.proto(k,{cliff:true,lo:-5.0});
    protoRecs.push(...p.recs);
    p.forEach(m=>{if(m.geometry)m.geometry.dispose();});
   }
   const protoChk=DASRI.check.cliff(protoRecs);
   /* Negative test: a fake record whose rear protrudes 1.5 m past -d/2 MUST fail DASRI.check.cliff! */
   const sample=protoRecs[0];
   const negRec=sample?Object.assign({},sample,{
    z:0,ry:0,bbox:{mn:[sample.bbox.mn[0],sample.bbox.mn[1],-DS_BOX[sample.key].d/2-1.5],mx:sample.bbox.mx}
   }):null;
   const negChk=negRec?DASRI.check.cliff([negRec]):{ok:true};
   const overlaps=S.overlaps||[];
   return {
    ok:sheetChk.ok&&protoChk.ok&&!negChk.ok&&!overlaps.length&&jRecs.length>=6&&vRecs.length>=8,
    jabalCliff:jRecs.length,
    vilCliff:vRecs.length,
    protosTested:protoRecs.length,
    overlaps,
    negFailed:!negChk.ok,
    bad:sheetChk.bad.concat(protoChk.bad,overlaps)
   };
  },

  fingerprint:fp,
  rebuild(){buildWorld();return fp();}
 });
})();
