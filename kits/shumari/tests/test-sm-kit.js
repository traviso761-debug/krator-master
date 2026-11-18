#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const T=require('../../../tools/ktest.js')(__filename);

const HERE=path.resolve(__dirname,'..');
const SRC=path.join(HERE,'src');

/* Evaluate pure [G data] fragments (26k-kit.js and 89-rows.js) in an isolated Node VM without browser globals */
const ctx={Math,Array,Object,Number,String};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(SRC,'26k-kit.js'),'utf8')+'\nthis.EX={KIT,SM_GIANT_DOOR,SM_GIANT_MIN_DOOR,SM_GIANT_VAULT,SM_GIANT_MIN_VAULT,SM_HUMAN_DOOR,SM_HUMAN_MAX_DOOR,SM_STAIR_MIN_W,smDomeRadius,smDomeProfile,smDomeValid,smGiantValid};',ctx);
vm.runInContext(fs.readFileSync(path.join(SRC,'89-rows.js'),'utf8')+'\nthis.FAMILIES=FAMILIES;',ctx);
const EX=ctx.EX;

/* 1. Kit metadata & Mamluk dome profile geometry */
T.ok('kit culture is shumari',EX.KIT.culture==='shumari',EX.KIT.culture);
const prof=EX.smDomeProfile(8.0,6.56,20);
const rBase=prof[0].r,rMid=EX.smDomeRadius(0.55,8.0),rTop=prof[prof.length-1].r;
T.ok('mamluk dome starts at drum radius and closes to pointed apex',Math.abs(rBase-4.0)<1e-6&&rTop===0,'rBase='+rBase+' rTop='+rTop);
T.ok('mamluk dome stays high-shouldered above mid-height',rMid>2.55&&rMid<3.35,'rMid='+rMid);

/* 2. Dome handedness & proportion rules + negative controls */
T.neg(
 'saucer dome ratio is rejected while high-shouldered mamluk ratio passes',
 d=>EX.smDomeValid(d),
 {key:'sm_regiment_qubba',style:'spiral',hand:1,span:8.0,h:3.2},
 {key:'sm_regiment_qubba',style:'spiral',hand:1,span:8.0,h:6.56}
);
T.neg(
 'mirror spiral on living regimental qubba is rejected',
 d=>EX.smDomeValid(d),
 {key:'sm_regiment_qubba',style:'spiral',hand:-1,span:7.8,h:6.45},
 {key:'sm_regiment_qubba',style:'spiral',hand:1,span:7.8,h:6.45}
);
T.neg(
 'right-handed spiral on Doriyan memorial stele is rejected',
 d=>EX.smDomeValid(d),
 {key:'sm_doriyan_stele',style:'spiral',hand:1,span:6.2,h:5.08},
 {key:'sm_doriyan_stele',style:'spiral',hand:-1,span:6.2,h:5.08}
);
T.ok(
 'carved star-relief dome passes smDomeValid',
 EX.smDomeValid({key:'sm_regiment_qubba',style:'carved',hand:0,span:7.8,h:6.45})
);

/* 3. Free Giant vs human Hearth doorway & vault clearance rules + negative controls */
T.neg(
 'giant building with human 2.25 m doorway is rejected',
 r=>EX.smGiantValid(r),
 {key:'sm_regiment_qubba',giant:true,vaultH:8.8,doors:[{h:2.25,locked:false}]},
 {key:'sm_regiment_qubba',giant:true,vaultH:8.8,doors:[{h:4.4,locked:false}]}
);
T.neg(
 'giant building with low 3.4 m ceiling vault is rejected',
 r=>EX.smGiantValid(r),
 {key:'sm_sample_pishtaq',giant:true,vaultH:3.4,doors:[{h:4.4,locked:false}]},
 {key:'sm_sample_pishtaq',giant:true,vaultH:5.6,doors:[{h:4.4,locked:false}]}
);
T.neg(
 'human hearth building with 4.4 m Giant portal is rejected',
 r=>EX.smGiantValid(r),
 {key:'sm_sample_hearth_bay',giant:false,vaultH:3.4,doors:[{h:4.4,locked:false}]},
 {key:'sm_sample_hearth_bay',giant:false,vaultH:3.4,doors:[{h:2.25,locked:false}]}
);

/* 4. Source fragment hygiene: unique seeds, sm prefix on 4x-7x, and clean view/def names */
const srcFiles=fs.readdirSync(SRC).filter(f=>f.endsWith('.js')).sort();
const seeds=new Map();
const defNames=[];
let prefixClean=true;
for(const f of srcFiles){
 const txt=fs.readFileSync(path.join(SRC,f),'utf8');
 for(const m of txt.matchAll(/defBuilding\(\{[\s\S]*?\bkey\s*:\s*['"]([^'"]+)['"][\s\S]*?\bname\s*:\s*['"]([^'"]+)['"][\s\S]*?\bseed\s*:\s*(\d+)/g)){
  defNames.push(m[2]);
  seeds.set(m[3],(seeds.get(m[3])||0)+1);
 }
 if(/^[4-7]\d/.test(f)){
  if(!/^(?:\/\/|\/\*)\s*prefix:\s*sm\b/.test(txt))prefixClean=false;
  for(const dm of txt.matchAll(/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)){
   if(!dm[1].toLowerCase().startsWith('sm'))prefixClean=false;
  }
 }
}
const dupSeeds=[...seeds.entries()].filter(([,n])=>n>1);
T.ok('every defBuilding has a unique numeric seed',seeds.size>=4&&dupSeeds.length===0,'seeds='+seeds.size);
T.ok('every 4x-7x fragment carries prefix sm on all top-level declarations',prefixClean);

const viewsTxt=fs.readFileSync(path.join(SRC,'92s-sm-views.js'),'utf8');
const viewNames=[...viewsTxt.matchAll(/VIEWS\[['"]([^'"]+)['"]\]/g)].map(m=>m[1]);
const famNames=ctx.FAMILIES.map(f=>f.name);
const cleanName=s=>typeof s==='string'&&s.length>0&&!/[:\\/*?"<>|']/.test(s);
T.ok(
 'all family, building, and custom view names avoid apostrophes and colons',
 [...famNames,...defNames,...viewNames].every(cleanName)
);
T.neg(
 'name validator rejects apostrophes and colons',
 s=>cleanName(s),
 "Amir's qubba: north",
 'Regimental qubba - spiral'
);

T.done();
