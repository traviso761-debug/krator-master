// ================================================================= LOJ TWENNY: THE LIGHT (KCAVELIGHT: the lamp code and the wax light)
// [web] Every lamp is a record (core/cavelight, whose first user the Line is): station 3's own (LINE.lamps: the green posts down the
// platforms and the galleries, the amber lamps at the station's rooms' doors; LINE.lights: the kept station's warm lamps and the
// light down the great shaft), the hold's ways in their colour (60-lt-scene.js), and each def's own lamps and its rooms' wax light
// (TG.tg.draw's light records, 64-lt-hold.js). All underground (ground: Infinity): the host keeps the eye dark-adapted and moves its
// pool of real lights to the records nearest the eye each frame. Light falls with depth: red homes over green Line over amber work.
const LT_LIGHT=(function(){const recs=[];
 LINE.lamps.forEach(l=>recs.push({id:l.id,kind:l.kind==='amber'?'lamp-amber':'lamp-green',x:l.x,y:l.y,z:l.z,on:l.on!==false,owner:'line'}));
 (LINE.lights||[]).forEach((l,i)=>recs.push({id:'line.light.'+i,kind:l.y>6?'work':'wax',x:l.x,y:l.y,z:l.z,owner:'line'}));
 LT_LAMPS.forEach(r=>{const q=Object.assign({},r);delete q.deck;recs.push(q);});
 LT_HOLD.lights.forEach((l,i)=>{const kind=KCAVELIGHT.KINDS[l.kind]?l.kind:'wax',r={id:'lt.hold.'+i,kind,x:l.x,y:l.y,z:l.z,owner:l.owner||null};
  /* the kit's dimmed lamps (worn) keep their weaker intensity; wax keeps the kind's key light */
  if(kind!=='wax'&&l.intensity!=null)r.intensity=Math.min(KCAVELIGHT.KINDS[kind].intensity,l.intensity);recs.push(r);});
 KCAVELIGHT.addAll(recs.map(r=>KCAVELIGHT.make(r)));
 const CL=KCAVELIGHT.host({THREE,scene,renderer,camera,sun:null,hemi:LT_HEMI,ground:()=>Infinity,inVoid:(x,y,z)=>CAVE_C.sdf(x,y,z)>0,pool:16,halos:true,
  exposure:{cave:1.35,floor:.46},fog:{surface:'#1c1712',cave:'#0e1010',near:[70,50],far:[320,240]}});
 return {CL,n:recs.length,byKind:recs.reduce((o,r)=>(o[r.kind]=(o[r.kind]||0)+1,o),{})};})();
