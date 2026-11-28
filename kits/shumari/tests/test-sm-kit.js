#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const T=require('../../../tools/ktest.js')(__filename);

const HERE=path.resolve(__dirname,'..');
const SRC=path.join(HERE,'src');
const CENSUS=JSON.parse(fs.readFileSync(path.resolve(HERE,'..','..','tools','trades_census.json'),'utf8'));

/* Evaluate pure [G data] fragments (26k-kit.js, 68-sm-trades.js, and 89-rows.js) in an isolated Node VM without browser globals */
const ctx={Math,Array,Object,Number,String};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(SRC,'26k-kit.js'),'utf8')+'\nthis.EX={KIT,SV_LIB,SM_GIANT_DOOR,SM_GIANT_MIN_DOOR,SM_GIANT_VAULT,SM_GIANT_MIN_VAULT,SM_HUMAN_DOOR,SM_HUMAN_MAX_DOOR,SM_STAIR_MIN_W,smDomeRadius,smDomeProfile,smDomeValid,smGiantValid};',ctx);
vm.runInContext(fs.readFileSync(path.join(SRC,'68-sm-trades.js'),'utf8')+'\nthis.SM_TRADES=SM_TRADES;',ctx);
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
T.neg(
 'solid wayside cairn marker rejects giant flag and passes as non-giant doorless shrine',
 r=>EX.smGiantValid(r),
 {key:'sm_wayside_cairn',giant:true,solidMarker:true,vaultH:0,doors:[]},
 {key:'sm_wayside_cairn',giant:false,solidMarker:true,vaultH:0,doors:[]}
);

/* 4. Source fragment hygiene: all 59 defBuildings, unique seeds, sm prefix on 4x-7x, and row coverage */
const srcFiles=fs.readdirSync(SRC).filter(f=>f.endsWith('.js')).sort();
const seeds=new Map();
const defKeys=new Set();
const defNames=[];
let prefixClean=true;
for(const f of srcFiles){
 const txt=fs.readFileSync(path.join(SRC,f),'utf8');
 for(const m of txt.matchAll(/defBuilding\(\{[\s\S]*?\bkey\s*:\s*['"]([^'"]+)['"][\s\S]*?\bname\s*:\s*['"]([^'"]+)['"][\s\S]*?\bseed\s*:\s*(\d+)/g)){
  defKeys.add(m[1]);
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
T.ok('kit defines all 59 defBuildings with unique numeric seeds',defKeys.size===59&&seeds.size===59&&dupSeeds.length===0,'defs='+defKeys.size+' seeds='+seeds.size);
T.ok('every 4x-7x fragment carries prefix sm on all top-level declarations',prefixClean);

const rowKeys=new Set();
for(const fam of ctx.FAMILIES){
 for(const item of fam.keys){
  rowKeys.add(typeof item==='string'?item:item.key);
 }
}
const unplaced=[...defKeys].filter(k=>!rowKeys.has(k));
T.ok('every defBuilding is placed in 89-rows.js FAMILIES',unplaced.length===0,unplaced.join(','));

/* 5. Voth census trades table (SM_TRADES) covers every census row with zero gaps and valid def keys */
const tradeRows=ctx.SM_TRADES;
const byTrade=new Map(tradeRows.map(r=>[r.trade,r]));
const missingTrades=CENSUS.filter(c=>!byTrade.has(c.trade)).map(c=>c.trade);
const gapTrades=tradeRows.filter(r=>r.gap).map(r=>r.trade);
const badRefs=tradeRows.flatMap(r=>(r.keys||[]).filter(k=>!defKeys.has(k)));
T.ok(
 'SM_TRADES covers every Voth census trade with zero gaps and valid defBuilding keys',
 missingTrades.length===0&&gapTrades.length===0&&badRefs.length===0,
 'rows='+tradeRows.length+' missing='+missingTrades.length+' gaps='+gapTrades.length+' badRefs='+badRefs.join(',')
);

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

/* 6. Host consumer manifest (shumari.py), smDims(), multi-variant defs, and sealed SMK closure bundle (kit_bundle.py) */
const cp=require('child_process');
const bundleMetaJson=cp.execFileSync('python3',['-c',[
 'import json, os, sys',
 'sys.path.insert(0, ' + JSON.stringify(HERE) + ')',
 'import shumari, kit_bundle',
 'js, files = kit_bundle.bundle("SMK", resources=True)',
 'side = {}',
 'pf = kit_bundle.pack_fragment(side=side)',
 'open("/tmp/test_smk_bundle.js", "w", encoding="utf-8").write(js)',
 'print(json.dumps({"files": shumari.FILES, "dwell": shumari.set_files("dwellings"), "bundle_files": files, "bytes": len(js), "pack_loader": "KMAT.pack" in pf, "side_shumari": "shumari" in side and len(side["shumari"]) > 10000}))'
].join('; ')],{encoding:'utf8'});
const bMeta=JSON.parse(bundleMetaJson);
T.ok('shumari.py exports 17 foundation+building files and set_files subset',bMeta.files.length===17&&bMeta.dwell.length===10,'files='+bMeta.files.length+' dwell='+bMeta.dwell.length);
T.ok('kit_bundle.pack_fragment emits KMAT.pack sidecar loader and Shumari texture body',bMeta.pack_loader&&bMeta.side_shumari);
const smkJs=fs.readFileSync('/tmp/test_smk_bundle.js','utf8');
fs.unlinkSync('/tmp/test_smk_bundle.js');
let smkSyntaxOk=false;
try{
 new vm.Script(smkJs,{filename:'SMK-bundle.js'});
 smkSyntaxOk=true;
}catch(_e){
 smkSyntaxOk=false;
}
T.ok(
 'kit_bundle.py SMK closure parses cleanly with zero raw script tags and includes resources',
 smkSyntaxOk&&!/<\/?script/i.test(smkJs)&&bMeta.bundle_files.some(f=>f.includes('kits/resources/src/44r-res-nodes.js')),
 'bytes='+bMeta.bytes
);

/* Verify multi-variant town-fabric defs declare variants >= 2 */
const multiVarKeys=['sm_cadet_cell','sm_hearth_house','sm_terrace_house','sm_shop_house','sm_sword_villa','sm_bazaar_hall'];
const foundMulti=new Set();
for(const f of srcFiles){
 const txt=fs.readFileSync(path.join(SRC,f),'utf8');
 for(const m of txt.matchAll(/defBuilding\(\{[^}]*?\bkey\s*:\s*['"]([^'"]+)['"][^}]*?\bvariants\s*:\s*(\d+)/g)){
  if(+m[2]>=2)foundMulti.add(m[1]);
 }
}
T.ok(
 'core town-fabric dwellings and bazaar declare variants >= 2',
 multiVarKeys.every(k=>foundMulti.has(k)),
 [...foundMulti].join(',')
);

/* 7. Complete PBR surface & catalog/split furniture detail texture wiring */
const matsJson=JSON.parse(fs.readFileSync(path.join(HERE,'materials.json'),'utf8')).families;
const packJson=JSON.parse(fs.readFileSync(path.join(HERE,'tex','pack.json'),'utf8')).families;
const texDir=path.join(HERE,'tex');
const hasPackedMap=(fam,tbl)=>!!(tbl[fam]&&tbl[fam].files&&tbl[fam].files.map&&fs.existsSync(path.join(texDir,tbl[fam].files.map)));

const svLibBad=Object.entries(EX.SV_LIB).filter(([,fam])=>!matsJson[fam]||!hasPackedMap(fam,packJson)).map(([k,fam])=>k+'->'+fam);
T.ok(
 'every SV_LIB surface, opening, and resource material key resolves to a packed WebP family',
 svLibBad.length===0&&Object.keys(EX.SV_LIB).length>=35,
 svLibBad.length?svLibBad.join(','):'SV_LIB keys='+Object.keys(EX.SV_LIB).length
);

const furnCoreTxt=fs.readFileSync(path.resolve(HERE,'..','..','core','catalog','krator-furniture-core.js'),'utf8');
const catBlock=furnCoreTxt.match(/const CATALOG_MATERIALS = \{([\s\S]*?)\n\};/)[1];
const splitBlock=furnCoreTxt.match(/const FAMILY_SPLITS = \[([\s\S]*?)\n\];/)[1];
const reqFurnFams=new Set();
for(const m of catBlock.matchAll(/families:\s*\[([^\]]*)\]/g)){
 for(const s of m[1].matchAll(/'([^']*)'/g)){
  if(s[1]&&s[1]!=='glow'&&s[1]!=='glass')reqFurnFams.add(s[1]);
 }
}
for(const m of splitBlock.matchAll(/'([A-Za-z0-9_]+)'\s*\]/g)){
 if(m[1]!=='glow'&&m[1]!=='glass')reqFurnFams.add(m[1]);
}
const missFurnFams=[...reqFurnFams].sort().filter(fn=>!matsJson['f_'+fn]||!hasPackedMap('f_'+fn,packJson));
T.ok(
 'every opaque catalog render family and FAMILY_SPLITS texture family has a packed f_* detail map',
 reqFurnFams.size>=65&&missFurnFams.length===0,
 missFurnFams.length?'missing: '+missFurnFams.join(','):'f_* families='+reqFurnFams.size
);
T.neg(
 'packed family validator rejects nonexistent family and accepts packed terracotta',
 fn=>hasPackedMap(fn,packJson),
 'f_nonexistent_surface',
 'f_terracotta'
);

T.done();

