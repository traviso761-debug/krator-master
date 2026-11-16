// TARGET: city — the meditation gardens' flora, picked by colour (the owner, 2026-11-11: "pick flora tastefully by color...
// can import Rift, Rift-Rim, Oidong, opal valley, or high rift flora to get the right colors"; 2026-11-12: "work on gaps")
// Each corner garden (kits/qiblai qb_meditation_garden) wears the colours of its two monasteries and asks for its plants
// through qnMedPlant(kind, x, z, h, hex): this hook answers a role (the colour) and a kind from the biome kits sealed in
// gen/69r-flora-bundle.js (QC_FLORA: today's core/biome with the Rift, the Rift Rim, Oidong, the Vale of Xanadu and Opal
// Valley), or the page's own Vale (xaPlant: the gold of the ginkgo), at the builder's point carried to the world (KXF, as
// kput). A pick is one of
//   {kit, key}    a species grown whole by its kit's make and grow, scaled to the height the garden asked
//   {kin}         an Opal Valley tree (OPAL.KIN: a Vale of Xanadu species in Opal Valley's colours), made as its kit makes it
//   {put}         one of a kit's own floor plants drawn from its registered items (QC_FL_PUT: the Rift Rim's cushion anemone,
//                 the Vale's reeds, Opal Valley's prism fern and opal lotus pads), as that kit's floor pass draws them
//   {vale}        the page's own Vale of Xanadu (xaPlant's kinds)
// The asks are queued while the gardens build; qcFloraBake (90r, after the page's own biome) grows each from a seed of its
// pick and place and bakes them on the city's scene, its LOD on the frame hooks. A role and kind with no pick
// (QC_FL.stats.gaps) keeps the kit's stand-in.
const QC_FL={req:[],stats:{asked:0,grown:0,by:{},gaps:{}}};
const QC_FL_ROLE={0xa8302a:'crimson',0xd4b040:'gold',0x2a9a94:'turquoise',0x6a3a8a:'violet'};
const QC_FL_PICK={
 crimson:{tree:[{kin:'firebreaker'}],blossom:[{kit:'rift',key:'anemonestalk'}],shrub:[{kit:'rift',key:'anemonestalk'}],bed:[{put:'anemone'}]},
 gold:{tree:[{vale:'ginkgo'}],blossom:[{vale:'ginkgo'}],shrub:[{kit:'rift',key:'croton'}],bed:[{kit:'rift',key:'croton'}]},
 turquoise:{tree:[{kit:'riftrim',key:'bellfir'}],blossom:[{kit:'oidong',key:'chalice'}],shrub:[{kit:'rift',key:'curly'}],bed:[{put:'prismfern'}]},
 violet:{tree:[{kit:'oidong',key:'wisteria'},{kit:'rift',key:'fantree'}],blossom:[{kit:'oidong',key:'wisteria'}],shrub:[{kit:'rift',key:'purplefan'}],bed:[{kit:'rift',key:'pinesucculent'}]},
 any:{lotus:[{kit:'oidong',key:'giantlotus'}],reed:[{put:'reed'}],pad:[{put:'opalpad'}]},
};
const qcFlName=p=>p.kin?'opalvalley.'+p.kin:p.put?'put.'+p.put:p.vale?'vale.'+p.vale:p.kit+'.'+p.key;
if(typeof qnMedPlant==='function')qnMedPlant.use=function(kind,x,z,h,hex){QC_FL.stats.asked++;
 if(kind==='cypress')return false;   /* the kit's xnCypress: the page's own Vale (xaPlant) */
 const role=QC_FL_ROLE[hex],P=(role&&QC_FL_PICK[role]&&QC_FL_PICK[role][kind])||QC_FL_PICK.any[kind];
 if(!P){const g=(role||('#'+(hex|0).toString(16)))+' '+kind;QC_FL.stats.gaps[g]=qcD(QC_FL.stats.gaps[g],0)+1;return false;}
 const pick=P[Math.floor(rng()*P.length)];
 if(pick.vale)return typeof xaPlant==='function'&&xaPlant(pick.vale,x,0,z,h);
 if(typeof QC_FLORA==='undefined')return false;
 const v=new THREE.Vector3(x,0,z);if(KXF)v.applyMatrix4(KXF.m);
 QC_FL.req.push({pick,kind,x:v.x,y:v.y,z:v.z,h:kind==='bed'?.9:h});return true;};   /* a bed asks no height: a low plant */
// a kit's own floor plants, drawn from its registered items as its floor pass draws them (in that kit's registry); r: the ask,
// F: QC_FLORA. The Rift Rim's cushion anemone (riftrim 60's anemone: a dark dome under a tuft of red blooms), the Vale's reeds
// (xanadu 60's reed), Opal Valley's prism fern and opal lotus pad (opalvalley 55's buildOwn)
const QC_FL_PUT={
 anemone(F,r){const B=F.BIO,{rr,TAU,qEuler}=B.fn;for(let k=0;k<3;k++){const a=rr(0,TAU),d=k?rr(.3,.8):0,x=r.x+Math.cos(a)*d,z=r.z+Math.sin(a)*d,s=rr(.5,.9);
  B.put('cushion',[x,r.y-.05,z],qEuler(0,rr(0,TAU),0),[s*.55,s*.35,s*.55],new THREE.Color(0x2a2224));
  B.put('anemone',[x,r.y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s*1.05,s*.65,s*1.05],new THREE.Color(0xffffff));}},
 reed(F,r){const B=F.BIO,{rr,ri,TAU,qEuler}=B.fn,n=ri(3,5);for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.4,1.2):0,h=rr(1.4,2.4);
  B.put('reed',[r.x+Math.cos(a)*d,r.y-.05,r.z+Math.sin(a)*d],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*.8,h,h*.8],new THREE.Color(0x8a9a5a));}},
 prismfern(F,r){const B=F.BIO,{rr,ri,TAU,qEuler}=B.fn,P=F.kits.opalvalley.PAL,pk=L=>new THREE.Color(L[ri(0,L.length-1)]);
  for(let k=0;k<3;k++){const a=rr(0,TAU),d=k?rr(.3,.9):0,s=rr(.5,.9);
   B.put('opfern',[r.x+Math.cos(a)*d,r.y-.04,r.z+Math.sin(a)*d],qEuler(0,rr(0,TAU),0),[s,s*rr(.8,1.2),s],pk(P.fern),{n:[0,1,0],c2:pk(P.fernC2)});}},
 opalpad(F,r){const B=F.BIO,{rr,ri,TAU,qEuler}=B.fn,P=F.kits.opalvalley.PAL,pk=L=>new THREE.Color(L[ri(0,L.length-1)]),s=qcD(r.h,1);
  B.put('oppad',[r.x,r.y+.33,r.z],qEuler(0,rr(0,TAU),0),[s,1,s],pk(P.pad),{n:[0,1,0],c2:pk(P.padC2)});},
};
const QC_FL_PUTKIT={anemone:'riftrim',reed:'xanadu',prismfern:'opalvalley',opalpad:'opalvalley'};
// one ask grown: a species, an Opal Valley kin tree or a kit's floor plant
function qcFlGrow(F,r){const B=F.BIO,p=r.pick;
 if(p.put){const prev=B.kit(QC_FL_PUTKIT[p.put]);try{QC_FL_PUT[p.put](F,r);}finally{B.kit(prev);}return true;}
 let K,T;
 if(p.kin){const O=F.kits.opalvalley,k=O&&O.KIN.find(q=>q.key===p.kin);if(!k)return false;const prev=B.kit('opalvalley');
  try{K=O.KINS[k.key]||B.kin(k.from,Object.assign({key:k.key,name:k.name,tags:k.tags||{}},k.delta||{}));if(!K)return false;O.KINS[k.key]=K;
   T=K.make(r.x,r.y,r.z);if(r.h){const s=r.h/T.H;T.H=r.h;T.rb*=s;T.crownR*=s;}K.grow(T,2);}finally{B.kit(prev);}return true;}
 K=F.kits[p.kit];if(!K||!K.make)return false;const sp=K.SPECIES.findIndex(S=>S.key===p.key);if(sp<0)return false;
 T=K.make(sp,r.x,r.y,r.z);if(r.h){const s=r.h/T.H;T.H=r.h;T.rb*=s;T.crownR*=s;}   /* scaled whole: a garden's tree is the species in small */
 K.grow(T,2);return true;}
// grow the queued plants and bake them (90r calls it once the city and the page's own biome are built)
function qcFloraBake(){if(typeof QC_FLORA==='undefined'||!QC_FL.req.length)return null;const F=QC_FLORA,B=F.BIO,t0=performance.now();
 const grp=new THREE.Group();grp.name='qiblai-gardens-flora';scene.add(grp);
 B.init({THREE,scene:grp,terrainH:(x,z)=>terrainH(x,z),mask:()=>1,obstacles:[],
  ticks:fn=>{let last=null;FRAME_HOOKS.push(now=>{const t=(now==null?performance.now():now)/1000,dt=last==null?.016:Math.min(.1,t-last);last=t;fn(dt,t);});},
  seed:33960,origin:[[0,0]],center:[0,0],fields:{wet:()=>.8,cold:()=>.15},
  eye:()=>[camera.position.x,camera.position.y,camera.position.z],err:m=>console.warn('qiblai flora: '+m)});
 if(B.setSun)B.setSun([-.5,.76,.52]);
 for(const r of QC_FL.req){const n=qcFlName(r.pick);F.reseed(qcHash(n+':'+Math.round(r.x*10)+':'+Math.round(r.z*10)));
  try{if(qcFlGrow(F,r)){QC_FL.stats.grown++;QC_FL.stats.by[n]=qcD(QC_FL.stats.by[n],0)+1;}else QC_FL.stats.gaps['missing '+n]=qcD(QC_FL.stats.gaps['missing '+n],0)+1;}
  catch(e){reportErr('qiblai flora '+n+': '+(e&&e.message||e));}}
 const out=B.bake();if(B.lodTick)FRAME_HOOKS.push(()=>B.lodTick(camera));
 if(B.bakeImpostors&&typeof renderer!=='undefined'){try{B.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('qiblai flora impostors: '+(e&&e.message||e));}}
 QC_FL.stats.ms=Math.round(performance.now()-t0);QC_FL.stats.bake=out;return QC_FL.stats;}
window._gardensFlora=QC_FL.stats;
