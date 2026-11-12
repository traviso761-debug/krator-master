// TARGET: city — the meditation gardens' flora, picked by colour (the owner, 2026-11-11: "pick flora tastefully by color...
// can import Rift, Rift-Rim, Oidong, opal valley, or high rift flora to get the right colors")
// Each corner garden (kits/qiblai qb_meditation_garden) wears the colours of its two monasteries and asks for its plants
// through qnMedPlant(kind, x, z, h, hex): this hook answers a role (the colour) and a kind with a species from the biome kits
// sealed in gen/69r-flora-bundle.js (QC_FLORA: today's core/biome with the Rift, the Rift Rim and Oidong), or the page's own
// Vale of Xanadu (xaPlant: the gold of the ginkgo), at the builder's point carried to the world (KXF, as kput). The asks are
// queued while the gardens build; qcFloraBake (90r, after the page's own biome) grows each one, scaled to the height the
// garden asked, from a seed of its kit, key and place, and bakes them on the city's scene, its LOD on the frame hooks. A role
// and kind with no species (QC_FL.stats.gaps) keeps the kit's stand-in: KNOWN_ISSUES.md lists them.
const QC_FL={req:[],stats:{asked:0,grown:0,by:{},gaps:{}}};
const QC_FL_ROLE={0xa8302a:'crimson',0xd4b040:'gold',0x2a9a94:'turquoise',0x6a3a8a:'violet',0x5e8a44:'green'};
// [kit, species key] by role and kind; 'xanadu' is the page's own Vale (xaPlant's kinds)
const QC_FL_PICK={
 crimson:{tree:[['rift','anemonestalk']],blossom:[['rift','anemonestalk']],shrub:[['rift','anemonestalk']]},
 gold:{tree:[['xanadu','ginkgo']],blossom:[['xanadu','ginkgo']],shrub:[['rift','croton']],bed:[['rift','croton']]},
 turquoise:{tree:[['riftrim','bellfir']],blossom:[['oidong','chalice']],shrub:[['rift','curly']],bed:[['rift','curly']]},
 violet:{tree:[['oidong','wisteria'],['rift','fantree']],blossom:[['oidong','wisteria']],shrub:[['rift','purplefan']],bed:[['rift','pinesucculent']]},
 any:{lotus:[['oidong','giantlotus']]},
};
if(typeof qnMedPlant==='function')qnMedPlant.use=function(kind,x,z,h,hex){QC_FL.stats.asked++;
 const role=QC_FL_ROLE[hex],P=(role&&QC_FL_PICK[role]&&QC_FL_PICK[role][kind])||QC_FL_PICK.any[kind];
 if(!P){const g=(role||('#'+(hex|0).toString(16)))+' '+kind;QC_FL.stats.gaps[g]=qcD(QC_FL.stats.gaps[g],0)+1;return false;}
 const pick=P[Math.floor(rng()*P.length)];
 if(pick[0]==='xanadu')return typeof xaPlant==='function'&&xaPlant(pick[1],x,0,z,h);
 if(typeof QC_FLORA==='undefined')return false;
 const v=new THREE.Vector3(x,0,z);if(KXF)v.applyMatrix4(KXF.m);
 QC_FL.req.push({kit:pick[0],key:pick[1],x:v.x,y:v.y,z:v.z,h:kind==='bed'?.9:h});return true;};   /* a bed asks no height: a low plant */
// grow the queued plants and bake them (90r calls it once the city and the page's own biome are built)
function qcFloraBake(){if(typeof QC_FLORA==='undefined'||!QC_FL.req.length)return null;const F=QC_FLORA,B=F.BIO,t0=performance.now();
 const grp=new THREE.Group();grp.name='qiblai-gardens-flora';scene.add(grp);
 B.init({THREE,scene:grp,terrainH:(x,z)=>terrainH(x,z),mask:()=>1,obstacles:[],
  ticks:fn=>{let last=null;FRAME_HOOKS.push(now=>{const t=(now==null?performance.now():now)/1000,dt=last==null?.016:Math.min(.1,t-last);last=t;fn(dt,t);});},
  seed:33960,origin:[[0,0]],center:[0,0],fields:{wet:()=>.8,cold:()=>.15},
  eye:()=>[camera.position.x,camera.position.y,camera.position.z],err:m=>console.warn('qiblai flora: '+m)});
 if(B.setSun)B.setSun([-.5,.76,.52]);
 for(const r of QC_FL.req){const K=F.kits[r.kit];if(!K||!K.make)continue;const sp=K.SPECIES.findIndex(S=>S.key===r.key);if(sp<0)continue;
  F.reseed(qcHash(r.kit+':'+r.key+':'+Math.round(r.x*10)+':'+Math.round(r.z*10)));
  const T=K.make(sp,r.x,r.y,r.z);if(r.h){const k=r.h/T.H;T.H=r.h;T.rb*=k;T.crownR*=k;}   /* scaled whole: a garden's tree is the species in small */
  try{K.grow(T,2);QC_FL.stats.grown++;const n=r.kit+'.'+r.key;QC_FL.stats.by[n]=qcD(QC_FL.stats.by[n],0)+1;}catch(e){reportErr('qiblai flora '+r.kit+'.'+r.key+': '+(e&&e.message||e));}}
 const out=B.bake();if(B.lodTick)FRAME_HOOKS.push(()=>B.lodTick(camera));
 if(B.bakeImpostors&&typeof renderer!=='undefined'){try{B.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('qiblai flora impostors: '+(e&&e.message||e));}}
 QC_FL.stats.ms=Math.round(performance.now()-t0);QC_FL.stats.bake=out;return QC_FL.stats;}
window._gardensFlora=QC_FL.stats;
