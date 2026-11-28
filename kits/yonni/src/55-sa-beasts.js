// prefix: sa
// ================================================================= LIVESTOCK & MOUNTS (kits/fauna, read via KratorFauna)
// Coastal sheep, Scoured-Hills goats, Sarmatian-inflected Spear-Queen steppe horses, and yard hens, each registered as
// class `life` in KTAGS and carrying faction, sub-faction, job, and 24-hour schedule data in SV_LIFE.
const SA_LIST=[];
function saReset(){SA_LIST.length=0;}
function saFauna(key,opt,mode){
 const g=KratorFauna.build(key,opt);const bx=new THREE.Box3().setFromObject(g);
 if(SB&&isFinite(bx.min.x)){
  const v=new THREE.Vector3();
  for(let i=0;i<8;i++){
   v.set(i&1?bx.max.x:bx.min.x,i&2?bx.max.y:bx.min.y,i&4?bx.max.z:bx.min.z).applyMatrix4(CM);
   for(let k=0;k<3;k++){SB.mn[k]=Math.min(SB.mn[k],v.getComponent(k));SB.mx[k]=Math.max(SB.mx[k],v.getComponent(k));}
  }
 }
 GSTAT.tris+=g.userData.tris;
 const e={g,world:CM.clone(),mode:mode||'idle',phase:(SA_LIST.length*1.37)%TAU};SA_LIST.push(e);return e;
}
function saLife(key,o){
 const L=KratorFauna.lifeOf(key);
 return svLife(CURREC,{job:o.job,activity:o.activity,band:o.band,extra:{
  diet:L.diet,feeding:L.feeding,activityPattern:L.activity,temperament:L.temperament,
  fleeDistance:L.fleeDistance,aggression:L.aggression,traits:L.traits,yields:L.yields,life:L.life,schedule:L.schedule
 }});
}
function saHerd(key,name,seed,fauna,o){
 const E=KratorFauna.entry(fauna),D=(o.v!=null&&E.variantDims)?E.variantDims[o.v]:E;
 return defBuilding({key,name,seed,cls:'life',kind:fauna,w:D.w+.35,d:D.d+.35,h:D.h+.35,budget:30000,
  front:{x:0,z:D.d/2,yaw:0},tags:{role:o.role||'livestock'},note:o.note,frag:'kits/fauna',
  build(p){
   p=p||{};
   saFauna(fauna,{variant:o.v!=null?o.v:(p.v|0),seed:seed+(p.seed|0)},p.mode||o.mode||'graze');
   saLife(fauna,{job:o.job||'herding',activity:p.activity||o.activity||'GRAZE',band:YN_SUB[p.sub||'freestanding'].band});
  }});
}
saHerd('ynb-sheep','Yonni coastal wool-sheep',7601,'sheep',{note:'Thick-fleeced coastal mountain sheep yielding Yonni carnelian-dyed wool and milk.'});
saHerd('ynb-goat','Scoured-Hills crag goat',7602,'goat',{note:'Sure-footed crag goat of the Scoured Hills ledges.'});
saHerd('ynb-horse','Spear-Queen steppe war-mount',7603,'horse',{role:'mount',job:'trading',mode:'idle',activity:'REST',note:'Hardy Sarmatian-lineage mountain horse ridden by Field-Queens and scouts.'});
saHerd('ynb-hen','Coastal yard hen',7604,'hen',{mode:'idle',activity:'FORAGE',note:'Yard fowl kept around Yonni round-tower compounds.'});
function saFlush(parent){
 for(const e of SA_LIST){const g=e.g;g.matrixAutoUpdate=false;g.matrix.copy(e.world);parent.add(g);}
}
FRAME_HOOKS.push(()=>{const t=ANIMU.uTime.value;for(const e of SA_LIST)KratorFauna.animate(e.g,t,e.mode,{phase:e.phase});});
