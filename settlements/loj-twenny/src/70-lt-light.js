// ================================================================= LOJ TWENNY: THE LIGHT (KCAVELIGHT: the lamp code and the wax light)
// [web] Every lamp is a record (core/cavelight): the Line's green down the platforms and the branch, the decks' ways in their
// colour (60-lt-scene.js), and each def's own lamps and its rooms' wax light (TG.tg.draw's light records, 64-lt-hold.js).
// The hold is all underground (ground: Infinity): the host keeps the eye dark-adapted (the cave's exposure, the ambient at its
// floor), and moves its pool of real lights to the records nearest the eye each frame. Light falls with depth: red homes over
// green Line over amber work (PLAN.md 5.2).
const LT_LIGHT=(function(){const recs=[];
 LT_LAMPS.forEach(r=>{const q=Object.assign({},r);delete q.deck;recs.push(q);});
 LT_HOLD.lights.forEach((l,i)=>{const kind=KCAVELIGHT.KINDS[l.kind]?l.kind:'wax',r={id:'lt.hold.'+i,kind,x:l.x,y:l.y,z:l.z,owner:l.owner||null};
  /* the kit's dimmed lamps (worn) keep their weaker intensity; wax keeps the kind's key light */
  if(kind!=='wax'&&l.intensity!=null)r.intensity=Math.min(KCAVELIGHT.KINDS[kind].intensity,l.intensity);recs.push(r);});
 KCAVELIGHT.addAll(recs.map(r=>KCAVELIGHT.make(r)));
 const CL=KCAVELIGHT.host({THREE,scene,renderer,camera,sun:null,hemi:LT_HEMI,ground:()=>Infinity,inVoid:(x,y,z)=>LTC.C.sdf(x,y,z)>0,pool:16,halos:true,
  exposure:{cave:1.45,floor:.16},fog:{surface:'#1c1712',cave:'#120f0c',near:[60,40],far:[300,190]}});
 return {CL,n:recs.length,byKind:recs.reduce((o,r)=>(o[r.kind]=(o[r.kind]||0)+1,o),{})};})();
