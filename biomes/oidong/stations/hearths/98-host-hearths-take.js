// ================================================================= HOST — the Cold Hearths' views, words and checks, handed to the passes' take (STATION_TAKE)
const STATION_TAKE={build:'oidong-hearths',title:'Krator biome — the Cold Hearths on the Oidong Valley\'s north rim',map:'The Cold Hearths',
 hint:"Station 3: one vent on the valley's north rim (Dsc, 4,330 m, 110 mm, the clearest sky of any vent on the model) and the hearth trees on its warm ground: black fans that open flat to the night sky and fold into silver spindles by day, the ember mat on the hottest ground, coal moss, stokers at the edge, rings of fallen dead stalks, the cold desert's cushions and snow lotus round it, the pilgrims' cairn at its edge. The vents keep the valley's pools open. Try #hour=22 (the fans open) (ideal type)",
 plant:it=>HEARTH.plantOfItem(it),
 views:()=>{const v=VENT,g=(x,z,dy)=>terrainH(x,z)+(dy||0),L=(cx,cz,dyc,tx,tz,dyt)=>[cx,g(cx,cz,dyc),cz,tx,g(tx,tz,dyt),tz],T=(window._field&&window._field.trees)||[];
  const near=T.slice().sort((a,b)=>Math.hypot(a.x-v.x-40,a.z-v.z-20)-Math.hypot(b.x-v.x-40,b.z-v.z-20))[0]||{x:v.x+40,z:v.z+20,H:2};
  return{'The Cold Hearths':L(v.x-150,v.z+170,24,v.x,v.z,2),'A hearth tree':[near.x+5,g(near.x+5,near.z+4,1.8),near.z+4,near.x,g(near.x,near.z,near.H*.9),near.z],
   'The ember mat at the vent':L(v.x+18,v.z+14,3.5,v.x,v.z,0),'Fallen stalks in the rings':L(v.x+175,v.z-60,3,v.x+150,v.z-30,.2),
   'The disc from the cairn':L(CAIRNS[0][0]+3,CAIRNS[0][1]+6,2.2,v.x,v.z,2),'Down to the valley':L(v.x,v.z+700,10,v.x,v.z+3500,-900)};},
 checks:(add,P)=>{const F=window._field||{trees:[],counts:{}},h=heatAt;
  add('the field placed: hearth trees, fans, ember mat, coal moss, stokers, tallow, dead stalks',HC.field(F.counts));
  add('hearth trees on 25-60 degC ground only (KTHERM)',HC.trees(F.trees));
  add('the ember mat on 60-95 degC ground only',HC.ember(P));
  add('the cold desert\'s plants off the warm ground (cushions, snow lotus under 8 degC)',HC.cold(P));
  add('the engine: open at night, shut at noon, open in an eclipse (HEARTH.work)',HC.work());},
 negatives:(add,P)=>{add('no stokers',HC.field(Object.assign({},(window._field||{}).counts,{stoker:0})));
  add('a hearth tree on cold ground',HC.trees([{x:900,z:900,heat:-3}]));add('an ember mat on cool ground',HC.ember([[900,0,900,'biome:hember']]));
  add('a cushion on the vent',HC.cold([[VENT.x,0,VENT.z,'biome:lobe']]));add('an engine open at noon',HC.work(()=>1));}};
const HC={field:c=>{const need=['hearth','fans','ember','coal','stoker','tallow','dead'],zero=need.filter(k=>!(c&&c[k]>0));return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+c[k]).join(', ')};},
 trees:T=>{const bad=T.filter(t=>{const v=t.heat!=null?t.heat:heatAt(t.x,t.z);return v<25||v>60;});return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' trees off 25-60 degC (first '+bad[0].heat.toFixed(1)+')':T.length+' hearth trees, all on 25-60 degC'};},
 ember:P=>{const E=P.filter(p=>p[3]==='biome:hember'),bad=E.filter(p=>{const v=heatAt(p[0],p[2]);return v<58||v>97;});return{ok:E.length>0&&!bad.length,detail:bad.length?bad.length+' mats off the hottest ground':E.length+' mats on 60-95 degC'};},
 cold:P=>{const C=P.filter(p=>p[3]==='biome:lobe'||p[3]==='biome:snowlotus'),bad=C.filter(p=>heatAt(p[0],p[2])>9);return{ok:C.length>0&&!bad.length,detail:bad.length?bad.length+' cold plants on warm ground':C.length+' cushions and lotus, none on the warm ground'};},
 work:f=>{const w=f||((t,o)=>HEARTH.work(t,o)),night=w(0,{sunAlt:-20}),noon=w(0,{sunAlt:50}),ecl=w(0,{sunAlt:50,hidden:1}),cloud=w(0,{sunAlt:-20,W:{cloud:1}});
  const ok=night>.95&&noon<.05&&ecl>.95&&cloud<.5;return{ok,detail:'night '+night.toFixed(2)+', noon '+noon.toFixed(2)+', eclipse '+ecl.toFixed(2)+', overcast night '+cloud.toFixed(2)};}};
