// ================================================================= HOST — the fauna of a later station (PLAN.md section 4, kits/fauna)
// STAGE.fauna: {land (an id), rec (FAUNALANDS.land's record: biome, include, exclude, density, maxGroup, scale), ok(x, z) (the dry ground an
// animal may stand on), water(x, z) (where a swimmer may go: deep enough), people() -> [{key, name, x, z, ry, mode, why}] (the people's
// animals, by hand), drawR (900 m)}. The land's wild animals are placed by FAUNALANDS on a 400 m lattice by KRAND, each group and each animal
// a core/tags `life` record before anything is drawn (FAUNALANDS.register); the people's are each a record (kind 'fauna', core/tags' life
// class). Drawn within drawR of the eye (a few of a group's big ones; the bundle's builds run ~6 k triangles an animal). ?fauna=0 none.
var STATION_FAUNA;
const FAUNA=(function(){const out={groups:0,animals:0,drawn:0,people:0,missing:[]},Q=new URLSearchParams(location.search),SF=STAGE.fauna;
 if(!SF||Q.get('fauna')==='0'||typeof KratorFauna==='undefined'||typeof FAUNALANDS==='undefined')return out;
 FAUNALANDS.land(SF.land,SF.rec);
 const KF=KratorFauna,W=6150+(STAGE.seed==null?0:STAGE.seed),R=TERR.R-120,ok=(x,z)=>Math.abs(x)<R&&Math.abs(z)<R&&SF.ok(x,z);
 const cat=FAUNALANDS.catalog(KF.list().map(e=>KF.entry(e.key)));
 const plan=FAUNALANDS.plan({world:W,land:SF.land,catalog:cat,box:[-R,-R,R,R],cell:400,ground:terrainH,
  where:(role,x,z)=>role==='water'?!!(SF.water&&SF.water(x,z)):role==='flyer'?true:ok(x,z),
  height:(role,x,z,key,y,u)=>role==='flyer'?y+60+140*u:role==='water'?waterH(x,z)-.4:y});
 const T=BIO.tagReg();if(T)FAUNALANDS.register(T,plan,{});
 out.groups=plan.groups.length;out.animals=plan.animals.length;out.missing=plan.missing;
 const people=[];
 for(const p of (SF.people?SF.people():[])){const e=KF.entry(p.key);if(!e||!ok(p.x,p.z))continue;const y=terrainH(p.x,p.z),seed=KRAND.hash(W,Math.floor(p.x),Math.floor(p.z))%99999+1;
  const id=BIO.record({kind:'fauna',key:p.key,name:p.name+' ('+p.why+')',x:p.x,y,z:p.z,r:Math.max(e.w,e.d)*.6,h:e.h});
  people.push({key:p.key,name:p.name,role:'people',at:[p.x,y,p.z],ry:p.ry==null?0:p.ry,scale:1,size:[e.w,e.d,e.h],mode:p.mode||'idle',phase:10*KRAND.unit(seed),seed,variant:seed%e.variants,id:id&&id.id!=null?id.id:null,why:p.why});}
 out.people=people.length;STATION_FAUNA=people;
 const seen={},big=a=>a.role==='grazer'||a.role==='predator'||a.role==='flyer'||a.role==='water';
 const drawn=plan.animals.filter(a=>{if(!big(a))return false;seen[a.group]=(seen[a.group]==null?0:seen[a.group])+1;return seen[a.group]<=6;});
 const D=FAUNALANDS.draw(KF,scene,Object.assign({},plan,{animals:drawn.concat(people)}),{err:reportErr}),DR=SF.drawR==null?900:SF.drawR,R2=DR*DR;out.drawn=D.list.length;
 tick((dt,t)=>{const c=camera.position;for(const it of D.list){const dx=it.a.at[0]-c.x,dz=it.a.at[2]-c.z;it.g.visible=dx*dx+dz*dz<R2;}D.tick(t);});
 out.plan=plan;return out;})();
window._fauna={groups:FAUNA.groups,animals:FAUNA.animals,drawn:FAUNA.drawn,people:FAUNA.people,missing:FAUNA.missing};
