// ================================================================= HOST — STATION 6 OF THE HEARTHS, THE STILLS (biomes/hearths/PLAN.md 7b, section 11 item 6; 2026-11-03)
// `python3 build.py --station stills` -> dist/geyser-stills.html. The showcase basin as the kit draws it (the Steampits: -1,440 m, 1.9 atm, +33 degC, the
// sea breeze from the south-west), with the hot-country cousin of the hearth trees on its boiling water, from biomes/hearths read in place (station.json
// "kin": 50 the records and parts, 57 the placement): a ring of STILL TREES at the rim of every boiling spring (temp .75 and over: the Great Prism, the
// funnels) and at the spray line of every geyser, their black sails held across the sea wind; GLASS STILLS by the springs gone cool; SPRAY MATS on the
// scalded ground inside each cone's spray line; SAIL CUPS down the run-off's 40-80 degC reach. Nothing between the rings: only boiling water feeds them.
// THE SAILS' TWO SCALARS (core/biome 35 and 35b, the breath and its turn), written each frame here:
//   - a geyser's ring folds its sails through the warning (pre) and the column and opens them with the steam's roar (HEARTH.sailFold on WATER.geyser's
//     S.state at the show's clock), so the Old Kettle's ring flinches shut before it blows; the springs' rings never fold;
//   - every sail turns from across the wind toward edge-on to the sun by day (HEARTH.sailTurn on the sky's sun), back across the wind at night.
// Placed before the one bake (88: STATION_BUILD), after the kit's trees (GEYSER.blocked keeps the rings off them).
function STATION_BUILD(){const R=GEYSER.R;if(!R||typeof HEARTH==='undefined'||!HEARTH.stills)return null;
 const runoff=R.runoff.map(ch=>{const P=[];for(let i=0;i<ch.P.length-1;i+=3){const a=ch.P[i],b=ch.P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;P.push([a[0],a[1],GEYSER.chT(ch,a[2]),dx/l,dz/l]);}return P;});
 const wet=(x,z)=>{const g=GEYSER.at(x,z);return g.spring>.3||g.terr>.5;};
 let F=null;BIO.cur='hearths/stills';   /* HEARTH's calls run in its own registry (its kitEnd wrapped them: build.py's 49m9) */
 try{F=HEARTH.stills({springs:R.springs.map(s=>({key:s.key,x:s.x,z:s.z,r:s.r,level:s.level,temp:s.temp})),
  geysers:R.geysers.map(g=>({key:g.key,x:g.x,z:g.z,sx:g.sprayX,sz:g.sprayZ,sprayR:g.sprayR,base:g.base,kind:g.kind})),
  runoff,wind:WIND,ground:terrainH,seed:7130,q:+(new URLSearchParams(location.search).get('q')||1),
  mask:(x,z)=>wet(x,z)||(GEYSER.blocked&&GEYSER.blocked(x,z,2))||FIELD.floor(x,z)<.3?0:1});}
 catch(e){reportErr('stills: '+e.stack);}
 window._field=F;
 /* the fold of each geyser's ring, and the sails' turn, once a frame */
 const rings=R.geysers.map((g,i)=>({g,i,key:'stills:'+g.key})).filter(r=>r.g.kind!=='spouter');
 tick(()=>{const SH=GEYSER.SHOW;if(SH&&SH.waters)rings.forEach(r=>{const S=SH.waters[r.i];if(S)BIO.breathState(r.key).value=HEARTH.sailFold(S.state(SH.t));});
  const d=new THREE.Vector3().subVectors(sun.position,sun.target.position).normalize(),alt=Math.asin(clamp(d.y,-1,1))*180/Math.PI;
  BIO.breathState('stills:turn').value=HEARTH.sailTurn(Math.atan2(d.z,d.x),sun.intensity<.02?-20:alt,WIND);});
 return F;}
// the station's words, views and checks (99-host-take.js: STATION_TAKE)
const STATION_TAKE={build:'geyser-stills',types:{'hearths/stills':'pass'},title:'Krator biome — the Stills in the geyser basin (the Steampits)',
 hint:"The Stills: the hot-country cousin of the hearth trees on the geyser basin's boiling water (the Steampits, -1,440 m, 1.9 atm, +33 °C: water boils at ~119 °C here). Still trees ring every boiling spring at its rim and every geyser at its spray line, 15-30 m heat-pipe stalks with their feet in the boiling water and black sails held across the sea wind, turned edge-on to the sun by day; a geyser's ring folds its sails through the warning and the column and opens them as the steam falls. Glass stills stand by the springs gone cool, spray mats cover the scalded ground inside the spray line, sail cups line the warm run-off. R sets off the nearest geyser; #hour=13 for midday (ideal type)",
 erupt:{'The Old Kettle\'s ring':'kettle'},
 views:()=>{const g=LAYOUT.geysers.find(q=>q.key==='kettle'),s=LAYOUT.springs.find(q=>q.key==='prism'),T=(window._field&&window._field.trees)||[];
  const near=T.slice().sort((a,b)=>Math.hypot(a.x-s.x,a.z-s.z)-Math.hypot(b.x-s.x,b.z-s.z))[0]||{x:s.x+s.r,z:s.z,y:s.level,H:20};
  return{'The Old Kettle\'s ring':toward(g.x-60,g.z+80,g.x,g.z,g.sprayR+70,6,14),'The stills round the Great Prism':toward(s.x+s.r+60,s.z+s.r+40,s.x,s.z,s.r+90,22,6),
   'A still tree':[near.x+14,near.y+4,near.z+12,near.x,near.y+near.H*.8,near.z],'The sails across the wind':toward(s.x-s.r-30,s.z-20,s.x,s.z,s.r+50,8,14)};},
 checks:(add,P)=>{const F=window._field||{trees:[],counts:{},rings:[]};
  add('the Stills placed: still trees, sails, glass stills, spray mats, sail cups',SCHK.field(F.counts));
  add('still trees only at boiling water (a spring at .75 or over, a geyser\'s spray line)',SCHK.rings(F.trees));
  add('a geyser\'s ring folds through its warning and column, open at rest (HEARTH.sailFold)',SCHK.fold());
  add('the sails across the wind at night, turned toward edge-on to the sun by day (HEARTH.sailTurn)',SCHK.turn());},
 negatives:(add,P)=>{add('no glass stills',SCHK.field(Object.assign({},(window._field||{}).counts,{glass:0})));
  add('a still tree at a cool spring',SCHK.rings([{ring:1+LAYOUT.springs.findIndex(s=>s.temp<.75)}]));
  add('a ring open in the column',SCHK.fold(()=>0));add('sails that never turn',SCHK.turn(()=>0));}};
const SCHK={field:c=>{const need=['still','sails','glass','spraymat','sailcup'],zero=need.filter(k=>!(c&&c[k]>0));return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+c[k]).join(', ')};},
 rings:T=>{const bad=T.filter(t=>t.ring<100&&!((LAYOUT.springs[t.ring-1]||{temp:0}).temp>=.75));return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' still trees off the boiling water':T.length+' still trees, all at boiling springs or spray lines'};},
 fold:f=>{const w=f||HEARTH.sailFold,pre=w({phase:'pre'}),col=w({phase:'column'}),rest=w({phase:'rest'}),tail=w({phase:'steam',steam:.1});
  return{ok:pre>.95&&col>.95&&rest<.05&&tail<.05,detail:'warning '+pre.toFixed(2)+', column '+col.toFixed(2)+', rest '+rest.toFixed(2)+', the steam\'s end '+tail.toFixed(2)};},
 turn:f=>{const w=f||HEARTH.sailTurn,night=w(1.2,-20,WIND),noon=w(1.2,60,WIND),am=w(-.4,30,WIND);
  return{ok:Math.abs(night)<1e-6&&Math.abs(noon)>.01&&Math.abs(noon-am)>.005,detail:'night '+night.toFixed(3)+', noon '+noon.toFixed(3)+', morning '+am.toFixed(3)+' (turns of 2 pi)'};}};
