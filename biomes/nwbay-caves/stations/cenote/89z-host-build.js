// ================================================================= HOST — build: the records, the hazards, the bake (no flora), the shadows
// Every chamber and the cenote is registered (REGISTER: the inspector's volume and a core/tags record) after it is drawn from its record; the hazards
// are core/tags records (BIO.record) the hazard layer reads. Nothing grows in a drowned cave, so BIO bakes nothing. KSHADOW off (?shadow=1).
const SHADOW_ON=Q.get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
(function(){const t0=performance.now();
 CAVE.N2.chambers.forEach(c=>{const n=CAVE.dress.filter(r=>Math.hypot((r.x-c.c[0])/c.rx,(r.z-c.c[2])/c.rz)<=1).length;
  REGISTER({name:'A drowned chamber'+(n?': '+n+' speleothems':''),key:'cave.'+c.id,x:c.c[0],z:c.c[2],y:c.c[1],r:Math.max(c.rx,c.rz),h:c.h,
   tags:{cave:{id:c.id,kind:'chamber',flooded:!!c.flooded,rx:c.rx,rz:c.rz,h:c.h,crown:Math.round((c.c[1]+c.h)*10)/10}}});});
 REGISTER({name:CE.name+': '+Math.round(CE.rim-CE.floor)+' m from its rim to its floor, the water '+Math.round(SITE.water.level-CE.floor)+' m deep',key:'cave.cenote',x:CE.x,z:CE.z,y:CE.floor,
  r:CE.hall.rx,h:CE.rim-CE.floor,tags:{cave:{id:'cenote',kind:'cenote',nwbay:'SINKS[1]',sink:CE.sink}}});
 CAVE.hazards.forEach(H=>{const a=H.at;BIO.record({name:H.name,key:'hazard.'+H.id,x:a[0],z:a[2],y:a[1],r:H.r==null?3:H.r,h:H.h==null?4:H.h,ry:H.ry,tags:H.tags});});
 window._registered=REG.length;
 const b=BIO.bake();window._instances=b.inst+CAVE.dress.length;window._bakeCalls=b.calls;   /* the dress's pieces stand for the bake's instances (one mesh) */
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun:CENOTE_SUN,ground:terrainH});window._shadow.cast(scene);}catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:SITE.region,x:(CAVE.box[0]+CAVE.box[2])/2,z:(CAVE.box[1]+CAVE.box[3])/2,y:SITE.net.level-6,r:(CAVE.box[2]-CAVE.box[0])*.72,h:CE.rim-SITE.net.level+10});})();
