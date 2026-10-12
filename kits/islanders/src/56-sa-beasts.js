// prefix: sa
// ================================================================= THE ANIMALS: the farms' pigs, hens and ducks, the water buffalo
// The animals are the fauna kit's (kits/fauna: KratorFauna, 39-fauna-bundle.js, the 'farm' file). This fragment places them
// as defs of class `life` with a life record (SV_LIFE: faction Ring Sea Islanders, the subculture as sub-faction, a job, a
// schedule and the fauna kit's data). The buffalo is the West's wealth and its feasts' (its horns crown the gables); pigs
// and fowl are kept by every household. The machinery (saCapture, saFauna, saFlush, the frame hook) is the Ash Nomads' and
// the Scyvoi kit's. Frame: origin on the ground under the belly, +z the head.
const SA_LIST=[];
function saReset(){SA_LIST.length=0;}
function saFauna(key,opt,mode){const g=KratorFauna.build(key,opt);const box=new THREE.Box3().setFromObject(g);
 if(SB&&isFinite(box.min.x)){const v=new THREE.Vector3();for(let i=0;i<8;i++){v.set(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).applyMatrix4(CM);
  for(let k=0;k<3;k++){SB.mn[k]=Math.min(SB.mn[k],v.getComponent(k));SB.mx[k]=Math.max(SB.mx[k],v.getComponent(k));}}}
 GSTAT.tris+=g.userData.tris;const e={g,world:CM.clone(),mode:mode||'idle',phase:(SA_LIST.length*1.37)%TAU,tack:null};SA_LIST.push(e);return e;}
function saLife(key,o){const L=KratorFauna.lifeOf(key);return svLife(CURREC,{job:o.job,activity:o.activity,band:o.band,extra:{diet:L.diet,feeding:L.feeding,
 activityPattern:L.activity,temperament:L.temperament,fleeDistance:L.fleeDistance,aggression:L.aggression,traits:L.traits,yields:L.yields,life:L.life,
 schedule:L.schedule}});}
/* a herd animal: one def per species; p.sub ('west' | 'east') names the sub-faction */
function saHerd(key,name,seed,fauna,o){const E=KratorFauna.entry(fauna),D=(o.v!==undefined&&E.variantDims)?E.variantDims[o.v]:E;
 return defBuilding({key,name,seed,cls:'life',kind:fauna,w:D.w+.3,d:D.d+.3,h:D.h+.3,budget:30000,front:{x:0,z:D.d/2,yaw:0},tags:{role:o.role||'livestock'},note:o.note,frag:'kits/fauna',
  build(p){saFauna(fauna,{variant:o.v!==undefined?o.v:(p.v|0),seed:seed+(p.seed|0)},p.mode||o.mode||'graze');
   saLife(fauna,{job:o.job||'livestock',activity:p.activity||o.activity||'GRAZE',band:IS_SUB[p.sub||'west'].band});}});}
saHerd('pig','Pig',5601,'pig',{note:'a household pig: every house keeps one or two under its floor'});
saHerd('hen','Hen',5602,'hen',{mode:'idle',activity:'FORAGE',note:'yard fowl'});
saHerd('duck','Duck',5603,'duck',{mode:'idle',activity:'FORAGE',note:'ducks of the paddies and the taro ponds'});
saHerd('buffalo','Water buffalo',5604,'water-buffalo',{role:'draught',job:'draught',note:"the West's wealth and the beast of its feasts: it ploughs the paddies; its horns crown the gables"});
function saFlush(parent){for(const e of SA_LIST){const g=e.g;g.matrixAutoUpdate=false;g.matrix.copy(e.world);parent.add(g);
 if(e.tack){const T=new THREE.Group();g.add(T);flushBuckets(e.tack,T,true);}}}
FRAME_HOOKS.push(()=>{const t=ANIMU.uTime.value;for(const e of SA_LIST)KratorFauna.animate(e.g,t,e.mode,{phase:e.phase});});
