// ================================================================= HOST — THE FAUNA (PLAN.md section 4, kits/fauna)
// The gap joins two worlds, and its animals do: the land 'outlandgate.narrows' (kits/fauna's FAUNALANDS, its pool the wild animals tagged
// for the biome `outlandgate`: the Outlands' leak north on the night wind and the river, the plains grazer's herds, the outland stalker
// after them, the carrion hexapod, the ostrich, the golden bird soaring over the floor) placed on a 400 m lattice by KRAND, each group
// and each animal a core/tags `life` record before anything is drawn (FAUNALANDS.register); and the people's animals by hand:
//   THE RUNNER BIRDS   the trickster's form runs the ancient roads (PLAN.md section 6): along the god's road, one every ~600 m
//   THE CARAVANS       the Izani caravans' bactrian camels and donkeys round the camp outside the wall, waiting on the toll
//   THE GOATS          the Tierhounds' herds on the floor south of the fort
// Drawn within 900 m of the eye (the land's big ones; the bundle's builds run ~6 k triangles an animal); animated on the page's motion time.
// ?fauna=0 none.
FAUNALANDS.land('outlandgate.narrows',{biome:'outlandgate',land:'narrows',scale:[.95,1.05],exclude:['runner-bird'],density:{grazer:.45,predator:.08,flyer:.06},maxGroup:12});
const FAUNA=(function(){const out={groups:0,animals:0,drawn:0,people:0,missing:[]},Q=new URLSearchParams(location.search);
 if(Q.get('fauna')==='0'||typeof KratorFauna==='undefined'||typeof FAUNALANDS==='undefined')return out;
 const KF=KratorFauna,W=6150,R=TERR.R-120;
 const ok=(x,z,pad)=>Math.abs(x)<R&&Math.abs(z)<R&&!inWorks(x,z,pad==null?4:pad)&&waterH(x,z)<-1e8&&terrainH(x,z)-LVL(z)>.3;
 // ---- the land's wild animals
 const cat=FAUNALANDS.catalog(KF.list().map(e=>KF.entry(e.key)));
 const plan=FAUNALANDS.plan({world:W,land:'outlandgate.narrows',catalog:cat,box:[-R,-R,R,R],cell:400,ground:terrainH,
  where:(role,x,z)=>role==='water'?false:role==='flyer'?true:ok(x,z),height:(role,x,z,key,y,u)=>role==='flyer'?y+60+140*u:y});
 const T=BIO.tagReg();if(T)FAUNALANDS.register(T,plan,{});
 out.groups=plan.groups.length;out.animals=plan.animals.length;out.missing=plan.missing;
 // ---- the people's animals: each a record (kind 'fauna': core/tags' life class), then drawn with the land's
 const people=[],rec=(key,name,x,z,ry,mode,why)=>{const y=terrainH(x,z),e=KF.entry(key);if(!e)return;const seed=KRAND.hash(W,Math.floor(x),Math.floor(z))%99999+1;
  const id=BIO.record({kind:'fauna',key,name:name+' ('+why+')',x,y,z,r:Math.max(e.w,e.d)*.6,h:e.h});
  people.push({key,name,role:'people',at:[x,y,z],ry,scale:1,size:[e.w,e.d,e.h],mode,phase:10*KRAND.unit(seed),seed,variant:seed%e.variants,id:id&&id.id!=null?id.id:null,why});};
 for(let z=-3000;z<=3000;z+=600){const s=KRAND.unit(KRAND.hash(W,z,1)),x=roadX(z)+(s<.5?-1:1)*(7+5*s);if(ok(x,z,0))rec('runner-bird','Runner bird',x,z,s*6.28,s<.5?'walk':'idle','the trickster\'s form, on the god\'s road');}
 for(let k=0;k<9;k++){const a=k*2.1+.9,d=CAMP.r*(.75+.35*KRAND.unit(KRAND.hash(W,k,7))),x=CAMP.x+Math.cos(a)*d,z=CAMP.z+Math.sin(a)*d;
  if(ok(x,z,-CAMP.r))rec(k%2?'donkey':'bactrian-camel',k%2?'Donkey':'Bactrian camel',x,z,a+1.6,'graze','an Izani caravan\'s, waiting on the toll');}
 for(let k=0;k<12;k++){const a=KRAND.unit(KRAND.hash(W,k,9))*6.28,d=40+60*KRAND.unit(KRAND.hash(W,k,10)),x=GATE.fort.x+Math.cos(a)*d,z=GATE.fort.z+GATE.fort.d/2+90+Math.sin(a)*d*.6;
  if(ok(x,z))rec('goat','Goat',x,z,a,'graze','the Tierhounds\' herd');}
 out.people=people.length;OUTLANDGATE_FAUNA=people;
 // ---- draw: the land's big ones (grazers, predators, a few a group) and every one of the people's
 const seen={},big=a=>a.role==='grazer'||a.role==='predator'||a.role==='flyer';
 const drawn=plan.animals.filter(a=>{if(!big(a))return false;seen[a.group]=(seen[a.group]==null?0:seen[a.group])+1;return seen[a.group]<=6;});
 const D=FAUNALANDS.draw(KF,scene,Object.assign({},plan,{animals:drawn.concat(people)}),{err:reportErr}),R2=900*900;out.drawn=D.list.length;
 tick((dt,t)=>{const c=camera.position;for(const it of D.list){const dx=it.a.at[0]-c.x,dz=it.a.at[2]-c.z;it.g.visible=dx*dx+dz*dz<R2;}D.tick(t);});
 out.plan=plan;return out;})();
var OUTLANDGATE_FAUNA;
window._fauna={groups:FAUNA.groups,animals:FAUNA.animals,drawn:FAUNA.drawn,people:FAUNA.people,missing:FAUNA.missing};
