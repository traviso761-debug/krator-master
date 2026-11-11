// ================================================================= HOST — build: the records, the hazards, the bake (no flora), the shadows
// Every chamber, crystal group, reserved volume and hazard is registered (REGISTER: the inspector's volume and a core/tags record) after it is
// drawn from its record. Nothing grows in the drained storey, so BIO bakes nothing. KSHADOW is off at page load (?shadow=1: the vents' light through
// the beams; the owner's 2026-11-03 default).
const SHADOW_ON=Q.get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
(function(){const t0=performance.now(),F=CAVE.focus,y0=STOREY_Y;
 const HCN=c=>(SITE.hold.storeys[c.storey]||{chambers:{}}).chambers[c.id];
 const nm=c=>c.id===F.id?'The Cave of Crystals':c.storey===1&&CAVE.hot.includes(c)?'The west crystal chamber':c.storey===0&&CAVE.hot.includes(c)?'A feeder pool (scalding, under '+(c.id==='ch:n0:-11,-3'?'the Cave of Crystals':'the west crystal chamber')+')':
  (HCN(c)||(c.storey===0?'A warm pool of the active storey':'A chamber of the drained storey'));
 // the chambers (KKARST's records, both storeys), the feeder wells, the fumarole
 CAVE.chambers.forEach(c=>{const B=CAVE.beams.filter(r=>r.chamber===c.id&&r.kind==='beam'),Hy=CAVE.hypo.filter(r=>r.chamber===c.id&&r.kind==='chandelier');
  REGISTER({name:nm(c)+(B.length?': '+B.length+' selenite beams to '+Math.max(...B.map(r=>r.len)).toFixed(1)+' m':'')+(Hy.length?': '+Hy.length+' gypsum chandeliers':''),
   key:'cave.'+c.id,x:c.c[0],z:c.c[2],y:c.c[1],r:Math.max(c.rx,c.rz),h:c.h,
   tags:{cave:{id:c.id,kind:'chamber',storey:c.storey,feeder:c.feeder,rx:c.rx,rz:c.rz,h:c.h,flooded:!!c.flooded,temp:Math.round(CAVE.temp(c.c[0],c.c[2]))}}});});
 CAVE.wells.forEach(W=>REGISTER({name:W.name,key:'cave.'+W.id,x:W.c[0],z:W.c[1],y:W.level-1,r:W.r+1,h:W.mouth-W.level+2,tags:{cave:{id:W.id,kind:'well',temp:W.temp,sulphur:true}}}));
 if(CAVE.fumarole){const Fm=CAVE.fumarole;REGISTER({name:Fm.name,key:'cave.fumarole',x:Fm.c[0],z:Fm.c[1],y:Fm.y0,r:Fm.r*1.6,h:Fm.ground-Fm.y0,tags:{cave:{id:'fumarole',kind:'fumarole',temp:Fm.T}}});}
 // the hold's reserved volumes: a cylinder round each for the inspector and the probe; the record itself is HOLD's
 CAVE.HOLD.volumes.forEach(V=>{const s=V.shape;let x,z,r;
  if(s.type==='ellipse'){x=s.c[0];z=s.c[1];r=Math.max(s.rx,s.rz);}else{const P=s.type==='poly'?s.pts:s.pts.map(p=>[p[0],p[2]]);x=P.reduce((a,p)=>a+p[0],0)/P.length;z=P.reduce((a,p)=>a+p[1],0)/P.length;
   r=Math.max(...P.map(p=>Math.hypot(p[0]-x,p[1]-z)))+(s.w?s.w/2:0);}
  const ys=s.type==='capsule'?s.pts.map(p=>p[1]):[V.floor];
  REGISTER({name:V.name+' (reserved for the hold: '+V.kind+', storey '+V.storey+', '+V.temp+' degC)',key:V.id,x,z,y:Math.min(...ys),r,h:Math.max(...ys)-Math.min(...ys)+V.clear,
   tags:{hold:{id:V.id,kind:V.kind,storey:V.storey,temp:V.temp,area:Math.round(V.area),clear:V.clear}}});});
 // the hazards (KHAZ: heat with soak and slip over each hot chamber, the scalding pools, the fumarole; KKARST's drowning, falls, gas and acid), recorded
 // in core/tags before anything reads them (BIO.record: the hazard layer and KTAGS.hazardAt read them); not the inspector's volumes, which name what
 // is drawn (a sump's drowning holds no drawn thing)
 CAVE.hazards.forEach(H=>{const a=H.at;BIO.record({name:H.name,key:'hazard.'+H.id,x:a[0],z:a[2],y:a[1],r:H.r==null?3:H.r,h:H.h==null?4:H.h,ry:H.ry,tags:H.tags});});
 window._registered=REG.length;
 const b=BIO.bake();window._instances=b.inst+(CRYSTALS.sel?CRYSTALS.sel.count:0)+(CRYSTALS.blades?CRYSTALS.blades.count:0);window._bakeCalls=b.calls;
 if(SHADOW_ON){try{const L=VENT_SUN||LAMP;window._shadow=KSHADOW.attach({renderer,scene,camera,sun:L,ground:terrainH});window._shadow.cast(scene);}catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 /* the whole box: both storeys, from under the water to the drained storey's crowns */
 REGISTER({name:SITE.region.replace('the drained storey','both storeys'),x:CAVE.centre[0],z:CAVE.centre[1],y:SITE.net.level-4,r:SITE.half*1.42,h:-SITE.net.level+8});})();
