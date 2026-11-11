// ================================================================= HOST — build: the records, the hazards, the bake (no flora), the shadows
// Every chamber, the Marble Hall and its cupolas, the wells and the hazards are registered (REGISTER: the inspector's volume and a core/tags
// record) after they are drawn from their records. Nothing grows in the dark, so BIO bakes nothing. KSHADOW is off at page load (?shadow=1:
// the lamp's shadows). Forked from biomes/hearths' (its hold's volumes and its fumarole left out).
const SHADOW_ON=Q.get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
(function(){const t0=performance.now(),Hl=CAVE.hall;
 const nm=c=>c.storey===0?(CAVE.hot.includes(c)?'A feeder pool (the lower storey: the rising water, scalding)':'A warm pool of the lower storey'):
  (CAVE.hot.includes(c)?'A chamber over a feeder (the dry storey: warm air up its well)':'A chamber of the dry storey (white marble, gypsum crust)');
 // the Marble Hall first (the inspector names the smallest volume holding a point: a chamber inside it names itself)
 REGISTER({name:Hl.name+' ('+(Hl.rx*2)+' x '+(Hl.rz*2)+' m, '+Hl.h+' m to its crown; '+CAVE.hallCupolas.length+' cupolas in its roof; '+(SITE.G+Hl.c[1]).toFixed(0)+' m, 6.2 km of rock overhead)',
  key:'cave.marble-hall',x:Hl.c[0],z:Hl.c[2],y:Hl.c[1],r:Math.max(Hl.rx,Hl.rz),h:Hl.h,tags:{cave:{id:Hl.id,kind:'hall',storey:Hl.storey,rx:Hl.rx,rz:Hl.rz,h:Hl.h,temp:Math.round(CAVE.temp(Hl.c[0],Hl.c[2]))}}});
 CAVE.hallCupolas.forEach(u=>REGISTER({name:'A cupola in the Marble Hall\'s roof (dissolved upward by the rising water)',key:'cave.'+u.id,x:u.c[0],z:u.c[2],y:u.c[1],r:u.r,h:u.h,tags:{cave:{id:u.id,kind:'cupola'}}}));
 CAVE.chambers.forEach(c=>{if(c.id===Hl.net)return;const Hy=CAVE.hypo.filter(r=>r.chamber===c.id&&r.kind==='chandelier');
  REGISTER({name:nm(c)+(Hy.length?': '+Hy.length+' gypsum chandeliers':''),key:'cave.'+c.id,x:c.c[0],z:c.c[2],y:c.c[1],r:Math.max(c.rx,c.rz),h:c.h,
   tags:{cave:{id:c.id,kind:'chamber',storey:c.storey,feeder:c.feeder,rx:c.rx,rz:c.rz,h:c.h,flooded:!!c.flooded,temp:Math.round(CAVE.temp(c.c[0],c.c[2]))}}});});
 CAVE.wells.forEach(W=>REGISTER({name:W.name,key:'cave.'+W.id,x:W.c[0],z:W.c[1],y:W.level-1,r:W.r+1,h:W.mouth-W.level+2,tags:{cave:{id:W.id,kind:'well',temp:W.temp,sulphur:true}}}));
 // the hazards (KKARST's: falls down the wells, bad air over the lower storey's water, the acid; the scalding pools), recorded in core/tags
 // before anything reads them; not the inspector's volumes, which name what is drawn
 CAVE.hazards.forEach(H=>{const a=H.at;BIO.record({name:H.name,key:'hazard.'+H.id,x:a[0],z:a[2],y:a[1],r:H.r==null?3:H.r,h:H.h==null?4:H.h,ry:H.ry,tags:H.tags});});
 window._registered=REG.length;
 const b=BIO.bake();window._instances=b.inst+(CRYSTALS.sel?CRYSTALS.sel.count:0)+(CRYSTALS.blades?CRYSTALS.blades.count:0);window._bakeCalls=b.calls;
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun:LAMP,ground:terrainH});window._shadow.cast(scene);}catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 /* the whole box: both storeys, from under the lower storey's water to the hall's crown */
 REGISTER({name:SITE.region+': both storeys round the Marble Hall',x:CAVE.centre[0],z:CAVE.centre[1],y:SITE.net.level-4,r:SITE.half*1.42,h:-SITE.net.level+Hl.h+20});})();
