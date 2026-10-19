// ================================================================= LONGSONG — the farms and the gardens (the plan as data)
// [G data] ROOMS.md section 5. Plain numbers and pure functions on LS: no THREE, no DOM, no Math.random. Every crop is a
// Crops kit id (kits/crops, read in place) that CROPS.forBiome('oidong') allows; the page checks it (FCHK.crops). The
// drawing is 85-ls-farms.js: it draws these records and decides nothing.
//
// A group is one of:
//   strips    fields in long strips side by side: run 'ns' (each strip runs north-south, the strips laid along x) or
//             'ew'; w: a strip's width; rot: the rotation, strip i sows rot[(i + off) % rot.length]; wallEvery: a
//             dry-stone wall between every n strips (and round the group)
//   terraces  contour terraces stepping up southward, d deep; terrace i sows rot[(i + off) % rot.length]; a riser wall
//             between each
//   pools     small walled pools of cell [w, d], all one crop
//   beds      raised beds of cell [w, d] with a path between, the crops cycled bed by bed
//   orchard   trees in rows, every sp m, the species cycled row by row
//   grove     trees or canes scattered at a density (a plant per `per` m2), seeded by cell (core/rand)
//   pasture   grazing (no crop): the herds below
// Each has an id, a name, a box (x0, x1, z0, z1), who works it, and `inside` when it lies inside the wall.
(function(P){'use strict';
const F={};
// ---------------------------------------------------------------- what the house needs (BLUEPRINT.md's numbers)
// residents: 200 monks, 50 lay scholars, 80 operatives, 100 wardens, 120 lay servants; grain: roasted and ground (the
// valley's tsampa), about 180 kg a head a year; the rain-fed yield an assumption (t/ha) per crop; fallow grazes
F.HOUSE={residents:550,festival:50,grainKg:180,
 yieldTHa:{frostoat:1.4,emmer:1.3,'basin-amaranth':1.1,'wild-rice':1.6,'helix-bean':.9,frostroot:9,flax:.6,saffron:.008,tea:.5},
 grain:['frostoat','emmer','basin-amaranth','wild-rice'],
 tithe:'the valley\'s villages (the Order\'s estate): grain, butter, wool and labour at harvest; and the caravans'};
const G=[];const g=o=>{G.push(o);return o;};
// ---------------------------------------------------------------- the fields outside the wall (ROOMS.md 5.1)
// the apron east and west of the rock, south of the stream's gravel fans (45-host-stage FANS) and outside the kora
g({id:'fields-east',kind:'strips',name:'The east fields',x0:250,x1:650,z0:-50,z1:230,run:'ns',w:14,wallEvery:4,off:0,
 rot:['frostoat','frostoat','helix-bean','frostroot','flax','fallow'],who:'lay servants and the valley\'s tenants; dzo pull the ploughs'});
g({id:'fields-west',kind:'strips',name:'The west fields',x0:-760,x1:-320,z0:-40,z1:220,run:'ns',w:14,wallEvery:4,off:2,
 rot:['frostoat','emmer','helix-bean','frostroot','frostoat','fallow'],who:'lay servants and the valley\'s tenants'});
g({id:'terraces-south',kind:'terraces',name:'The south terraces (the blueprint\'s barley terraces)',x0:-300,x1:300,z0:280,z1:520,d:20,off:1,
 rot:['emmer','frostoat','helix-bean','basin-amaranth','saffron','frostoat','fallow'],who:'lay servants'});
g({id:'tea-garden',kind:'terraces',name:'The tea garden',x0:-300,x1:60,z0:540,z1:640,d:10,off:0,rot:['tea'],rows:2.2,who:'lay servants; the novices at the picking'});
g({id:'rice-pools',kind:'pools',name:'The rice pools (fed by the leat)',x0:-200,x1:-112,z0:-262,z1:-244,cell:[11,9],crop:'wild-rice',who:'lay servants'});
g({id:'willow-beds',kind:'grove',name:'The willow beds (withies for the skeps, the baskets, the mill\'s screens)',x0:60,x1:220,z0:-264,z1:-255,crop:'willow',per:30,who:'lay servants'});
g({id:'bamboo-grove',kind:'grove',name:'The bamboo grove (the paper mill\'s pulp)',x0:-470,x1:-350,z0:-258,z1:-228,crop:'bamboo',per:9,who:'the paper mill'});
g({id:'chalice-beds',kind:'beds',name:'The chalice-grass beds (the paper\'s grass)',x0:-620,x1:-520,z0:-258,z1:-249,cell:[16,4.5],crops:['chalice-grass'],who:'the paper mill'});
g({id:'pasture-south',kind:'pasture',name:'The yak pastures (the apron\'s upper slope toward the valley wall)',x0:-1200,x1:1200,z0:700,z1:1600,who:'the herders'});
// ---------------------------------------------------------------- the gardens inside the wall (ROOMS.md 5.2)
g({id:'orchard-w',kind:'orchard',inside:true,name:'The ward\'s orchard and the beehives',x0:-194,x1:-114,z0:-38,z1:-4,sp:7,crops:['apricot','crabapple','cherry']});
g({id:'kitchen-e',kind:'beds',inside:true,name:'The kitchen gardens',x0:114,x1:194,z0:-38,z1:0,cell:[9,3.2],
 crops:['greens','helix-bean','frostroot','murnong','umbel-seed','greens','monks-sage','fiddlehead']});
g({id:'dye-garden',kind:'beds',inside:true,name:'The dye garden (the robes\' saffron, the Order\'s blue)',x0:-66,x1:-24,z0:-104,z1:-66,cell:[8,3],
 crops:['saffron','woad','broom','woad','saffron']});
g({id:'physic',kind:'beds',inside:true,name:'The physic terraces (the monks\' medicinal plants)',x0:-194,x1:-150,z0:24,z1:186,cell:[2.6,6],
 crops:['snow-lotus','valley-ginseng','monks-sage','sky-poppy','monks-sage','camphor']});
g({id:'orchard-upper',kind:'orchard',inside:true,name:'The upper orchards',x0:-38,x1:148,z0:183,z1:199,sp:6.5,crops:['persimmon','apricot','mulberry']});
F.GROUPS=G;
F.group=id=>G.find(o=>o.id===id)||null;
// the Mirror's lotus and the mushroom cellar are crops too (drawn by the kit and not at all)
F.OTHER=[{id:'mirror',crops:['lotus-root','lotus-silk'],name:'The Mirror of Longsong: lotus roots for the kitchen, the stems\' silk for the sutra wrappers'},
 {id:'mushroom-cellar',crops:['moon-cap'],works:['dark-beds'],name:'The mushroom cellar in the rock under the granaries (moon cap on cut bamboo)'}];

// ---------------------------------------------------------------- the farm's works and marks
// (the stream's south bank runs at z -260 to -272 along the front: the pools, beds and groves keep to dry ground north of it)
// the leat: from the stream upstream of the bridge (the stream runs west), along the south bank, under the track (the
// tsampa mill's wheel stands in it), into the ward under the north wall, along the paper mill's north side to its wheel;
// the tail race on from the wheel, out under the wall west of the corner tower, to the Mirror. Its levels fall all the
// way (the host's CANAL: from just under the stream's level at the intake to the pond's)
// (2026-10-19: the intake moved from 300 m to 1.1 km upstream, for the head a mill needs: about 3 m to the paper mill)
F.LEAT={pts:[[1100,-240],[960,-232],[760,-236],[560,-244],[400,-250],[300,-252],[220,-254],[40,-248],[-24,-240],[-100,-238],[-106,-226],[-108,-201],[-112,-194],[-150,-193.5]],w:2.2,name:'The leat (the paper mill\'s and the tsampa mill\'s water)'};
F.TAIL={pts:[[-150,-193.5],[-186,-193.5],[-186,-206],[-214,-224],[-246,-233]],w:1.8,name:'The tail race to the Mirror'};
F.WHEELS=[{id:'wheel-tsampa',at:'leat',x:-80,z:-238.6,r:2.4,name:'The tsampa mill\'s wheel (undershot, in the leat)'},
 {id:'wheel-paper',at:'leat',x:-150,z:-193.5,r:2.8,name:'The paper mill\'s wheel (undershot, in its race)'}];
F.MILL={id:'tsampa-mill',x:-80,z:-247.5,w:9,d:7,name:'The tsampa mill (roasting pans, a water-driven stone)'};
F.THRESH=[{id:'thresh-east',x:290,z:-72,r:10,name:'The east threshing floor'},{id:'thresh-west',x:-345,z:-62,r:10,name:'The west threshing floor'}];
F.SHRINES=[{id:'lhatho-east',x:640,z:-62,name:'The field shrine (the first sheaf, juniper, flags)'},{id:'lhatho-west',x:-760,z:-52,name:'The west field shrine'},
 {id:'lhatho-terraces',x:310,z:528,name:'The terraces\' shrine'}];
F.BEEWALL={x0:-192,x1:-118,z:-2,h:2.2,niches:18,name:'The bee wall (a willow skep in each niche: the lamps\' wax is the bees\')'};
F.DYEHOUSE={id:'dye-house',x:-45,z:-111,w:22,d:9,name:'The dye house (the vats; the drying poles hung with cloth)'};
// the herds: yak and dzo on the pastures, the herders' black tents and stone pens
F.HERDS=[{id:'herd-w',x:-620,z:900,n:16,r:70},{id:'herd-c',x:80,z:1150,n:20,r:80},{id:'herd-e',x:700,z:820,n:14,r:60}];
F.TENTS=[{id:'tent-w',x:-560,z:860},{id:'tent-c',x:150,z:1100},{id:'tent-e',x:640,z:780}];
F.PENS=[{id:'pen-w',x:-600,z:840,r:16},{id:'pen-c',x:110,z:1080,r:18},{id:'pen-e',x:680,z:760,r:14}];

// ---------------------------------------------------------------- the cells: which strip, terrace, pool, bed or tree
const inBox=(o,x,z,m)=>{m=m==null?0:m;return x>o.x0-m&&x<o.x1+m&&z>o.z0-m&&z<o.z1+m;};
F.inBox=inBox;
// the strips of a group: [{i, x0, x1, z0, z1, crop}]
F.strips=function(o){const R=[];if(o.kind==='strips'){const ns=o.run!=='ew',L=ns?o.x1-o.x0:o.z1-o.z0,n=Math.max(1,Math.round(L/o.w)),w=L/n;
  for(let i=0;i<n;i++){const crop=o.rot[(i+o.off)%o.rot.length];
   R.push(ns?{i,x0:o.x0+i*w,x1:o.x0+(i+1)*w,z0:o.z0,z1:o.z1,crop}:{i,x0:o.x0,x1:o.x1,z0:o.z0+i*w,z1:o.z0+(i+1)*w,crop});}}
 else if(o.kind==='terraces'){const n=Math.max(1,Math.round((o.z1-o.z0)/o.d)),d=(o.z1-o.z0)/n;
  for(let i=0;i<n;i++)R.push({i,x0:o.x0,x1:o.x1,z0:o.z0+i*d,z1:o.z0+(i+1)*d,crop:o.rot[(i+o.off)%o.rot.length]});}
 else if(o.kind==='pools'||o.kind==='beds'){const nx=Math.max(1,Math.floor((o.x1-o.x0)/o.cell[0])),nz=Math.max(1,Math.floor((o.z1-o.z0)/o.cell[1])),
   cw=(o.x1-o.x0)/nx,cd=(o.z1-o.z0)/nz,gap=o.kind==='beds'?Math.min(1,cd*.3):.6;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;
   R.push({i:k,x0:o.x0+i*cw+gap/2,x1:o.x0+(i+1)*cw-gap/2,z0:o.z0+j*cd+gap/2,z1:o.z0+(j+1)*cd-gap/2,crop:o.crop||o.crops[(j+i*3)%o.crops.length]});}}
 return R;};
// the trees of an orchard or a grove: [{x, z, crop, s}] (a grove's are seeded per 10 m cell: core/rand's rule)
F.trees=function(o){const T=[];
 if(o.kind==='orchard'){const nx=Math.max(1,Math.floor((o.x1-o.x0)/o.sp)),nz=Math.max(1,Math.floor((o.z1-o.z0)/o.sp));
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)T.push({x:o.x0+(i+.5)*(o.x1-o.x0)/nx,z:o.z0+(j+.5)*(o.z1-o.z0)/nz,crop:o.crops[j%o.crops.length],s:1});}
 else if(o.kind==='grove'&&typeof KRAND!=='undefined'){const C=10,seed=KRAND.child(4411,o.id),k=C*C/o.per;
  for(let cz=Math.floor(o.z0/C);cz<=Math.floor(o.z1/C);cz++)for(let cx=Math.floor(o.x0/C);cx<=Math.floor(o.x1/C);cx++){
   const s=KRAND.cell(seed,cx,cz),n=Math.floor(k)+(KRAND.unit(KRAND.hash(s,0))<k%1?1:0);
   for(let q=0;q<n;q++){const x=(cx+KRAND.unit(KRAND.hash(s,q,1)))*C,z=(cz+KRAND.unit(KRAND.hash(s,q,2)))*C;
    if(inBox(o,x,z))T.push({x,z,crop:o.crop,s:.75+.5*KRAND.unit(KRAND.hash(s,q,3))});}}}
 return T;};
// the walls of a group: segments [x0, z0, x1, z1] (dry stone round it; between every wallEvery strips; terrace risers)
F.walls=function(o){const W=[];if(o.kind==='grove'||o.kind==='pasture'||o.inside)return W;
 W.push([o.x0,o.z0,o.x1,o.z0],[o.x1,o.z0,o.x1,o.z1],[o.x1,o.z1,o.x0,o.z1],[o.x0,o.z1,o.x0,o.z0]);
 if(o.kind==='strips'){const S=F.strips(o);for(let i=o.wallEvery;i<S.length;i+=o.wallEvery){const s=S[i];
   W.push(o.run!=='ew'?[s.x0,o.z0,s.x0,o.z1]:[o.x0,s.z0,o.x1,s.z0]);}}
 if(o.kind==='terraces')for(const s of F.strips(o).slice(1))W.push([o.x0,s.z0,o.x1,s.z0]);
 return W;};
// what is sown at (x, z): {group, cell, crop} or null; and the group alone
F.groupAt=(x,z)=>{for(const o of G)if(inBox(o,x,z))return o;return null;};
F.at=function(x,z){const o=F.groupAt(x,z);if(!o)return null;
 if(o.kind==='strips'||o.kind==='terraces'||o.kind==='pools'||o.kind==='beds'){for(const s of F.strips(o))if(x>=s.x0&&x<s.x1&&z>=s.z0&&z<s.z1)return {group:o,cell:s,crop:s.crop};
  return {group:o,cell:null,crop:null};}
 return {group:o,cell:null,crop:o.crop||null};};
// every crop the plan sows (the check reads it): ids, with the groups that sow each
F.sown=function(){const S={};const add=(c,id)=>{if(!c||c==='fallow')return;(S[c]=S[c]||[]).push(id);};
 for(const o of G){if(o.rot)o.rot.forEach(c=>add(c,o.id));if(o.crops)o.crops.forEach(c=>add(c,o.id));if(o.crop)add(o.crop,o.id);}
 for(const o of F.OTHER)o.crops.forEach(c=>add(c,o.id));return S;};
// the hectares of each crop sown this year, and the house's grain from its own fields against its need
F.provision=function(){const ha={};for(const o of G){if(o.kind==='orchard'||o.kind==='grove'||o.kind==='pasture')continue;
  for(const s of F.strips(o)){if(s.crop==='fallow')continue;ha[s.crop]=(ha[s.crop]||0)+(s.x1-s.x0)*(s.z1-s.z0)/1e4;}}
 const H=F.HOUSE,need=(H.residents+H.festival*.2)*H.grainKg/1000;let own=0;
 for(const c of H.grain)own+=(ha[c]||0)*(H.yieldTHa[c]||0);
 return {ha,needT:need,ownT:own,share:own/need,tithe:H.tithe};};
// what the Oidong kit may plant: the wild edges of a garden a little, nothing on a field, pool or bed; the pasture is
// the kit's ground, thinned (the herds graze it open); a grove's own trees are the farm's
F.plant=function(x,z){const o=F.groupAt(x,z);if(!o)return null;if(o.kind==='pasture')return .3;if(o.kind==='orchard')return .12;return 0;};
P.FARMS=F;})(LS);
