// ================================================================= HOST — build: the records, the hazards, the bake (no flora)
// Every chamber, mouth, collapse doline, site and spring is registered (REGISTER: the inspector's volume and a core/tags record) once it is
// drawn from its record. The hazards are core/tags records (BIO.record: the hazard layer and KTAGS.hazardAt read them), not the inspector's
// volumes (a drowning holds no drawn thing). Nothing grows in the maze, so BIO bakes nothing; its instances are the dress's records.
(function(){const t0=performance.now(),M=CAVE.M;
 const SN=['the lowest storey','the middle storey','the top storey'];
 CAVE.chambers.forEach(c=>{const s=M[c.node].level,D=CAVE.dolines.find(q=>q.over===c.id),L=CAVE.loj&&CAVE.loj.chamber===c.id;
  REGISTER({name:(L?CAVE.loj.name:D?'A chamber open to the sky (its roof fell: a collapse doline)':'A chamber of '+SN[s])+(c.flooded?' (the perched water)':''),
   key:'cave.'+c.id,x:c.c[0],z:c.c[2],y:c.c[1],r:Math.max(c.rx,c.rz),h:c.h,
   tags:{cave:{id:c.id,kind:'chamber',storey:s,rx:c.rx,rz:c.rz,h:c.h,flooded:!!c.flooded,doline:D?D.id:null,rock:'gypsum'}}});});
 CAVE.mouths.forEach(m=>REGISTER({name:'A mouth on the scarp ('+SN[m.storey]+(m.wet?', a spring':'')+(m.drop>=SITE.fallFrom?', '+Math.round(m.drop)+' m over the face':'')+')',
  key:'cave.'+m.id,x:m.at[0],z:m.at[2],y:m.at[1]-1,r:Math.max(3,m.w),h:m.h+2,tags:{cave:{id:m.id,kind:'mouth',storey:m.storey,passage:m.passage,wet:m.wet,drop:Math.round(m.drop*10)/10}}}));
 CAVE.dolines.forEach(D=>{const g=SITE.ground(D.x,D.z),fl=D.floor==null?g-D.depth:D.floor;
  REGISTER({name:'A collapse doline on the table ('+Math.round(g-fl)+' m deep, into a top-storey chamber)',key:'cave.'+D.id,x:D.x,z:D.z,y:fl,r:D.r+2,h:g-fl+2,tags:{cave:{id:D.id,kind:'doline',form:D.form,over:D.over}}});});
 if(CAVE.ancients){const A=CAVE.ancients,len=A.east[0]-A.end[0];
  REGISTER({name:A.name,key:A.id,x:A.end[0]+Math.min(len,30)/2,z:A.end[2],y:A.at[1]-.5,r:Math.min(len,30)/2+2,h:A.h+1,
   tags:{site:{id:A.id,kind:A.kind,line:A.line,storey:A.storey,passage:A.passage,w:A.w,h:A.h,note:A.note},cave:{id:A.prim,kind:'gallery',finish:'hewn'}}});}
 if(CAVE.loj){const Lj=CAVE.loj;Lj.walls.forEach(W=>REGISTER({name:'A dry-stone wall across a passage (the walled chamber)',key:W.id,x:W.at[0],z:W.at[2],y:W.at[1]-1,r:W.w/2+1.5,h:W.h+2,
  tags:{site:{id:Lj.id,kind:Lj.kind,wall:W.id,passage:W.passage,note:Lj.note}}}));}
 WATERS.springs.forEach(s=>REGISTER({name:s.K.name,key:'water.'+s.id,x:s.at[0],z:s.at[2],y:s.at[1]-1,r:4,h:3,tags:{water:{id:s.id,kind:'karstspring',rock:'gypsum'}}}));
 // the hazards: KKARST's (the perched water's drowning, the level shafts' falls) and the station's (the dolines' and the high mouths' falls)
 CAVE.hazards.forEach(H=>{const a=H.at,sh=H.tags.hazard.shape||{};BIO.record({name:H.name,key:'hazard.'+H.id,x:a[0],z:a[2],y:a[1],r:H.r==null?(sh.r==null?Math.max(1,(sh.w==null?2:sh.w)/2):sh.r):H.r,
  h:H.h==null?(sh.h==null?2:sh.h):H.h,ry:H.ry,tags:H.tags});});
 window._registered=REG.length;
 const b=BIO.bake();window._instances=b.inst+CAVE.dress.length;window._bakeCalls=b.calls;
 window._buildMs=Math.round(performance.now()-t0);
 /* the whole page: the three storeys and the table over them */
 const B=CAVE.box;REGISTER({name:SITE.region+': the gypsum maze, three storeys',x:CAVE.centre[0],z:CAVE.centre[1],y:SITE.net.level-3,r:Math.hypot(B[2]-B[0],B[3]-B[1])/2,h:-SITE.net.level+8});})();
