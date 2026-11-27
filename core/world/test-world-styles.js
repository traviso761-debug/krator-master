// node core/world/test-world-styles.js — every biome overlay the scale model can hand a region has its own ground: a style
// and a palette in 41-world-fields.js BIOME_GROUND. Cuts no region: it reads the names the way
// tools/scale-model/extract_region.py does (the model's regions of kind 'biome', plus EXTRA_BIOMES, less OVERLAYS and
// TOOL_REGIONS_EXACT), adds every name in its KITS and WATER_OVERLAYS tables and in every region already cut
// (*/data/region.json "biomes"), and fails on any name WORLD.groundOf cannot answer. Before 2026-11-15 an unlisted name
// fell to the desert style and its terracotta palette with nothing failing (Xanadu, the SW Bay).
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
global.window=global;
eval(fs.readFileSync(path.join(ROOT,'core','terrain','38-core-relief.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'41-world-fields.js'),'utf8'));
let bad=0;const ok=(name,pass,neg,detail)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':'')+(detail?': '+detail:''));};

// ---- the model's regions (extract_region.py load_model_defaults: the JSON array `const defRegs = [...]`)
function jsArray(text,name){const at=text.indexOf('const '+name);if(at<0)return null;const s=text.indexOf('[',at);let d=0,str=false,esc=false;
 for(let i=s;i<text.length;i++){const c=text[i];if(str){if(esc)esc=false;else if(c==='\\')esc=true;else if(c==='"')str=false;}
  else if(c==='"')str=true;else if(c==='[')d++;else if(c===']'){d--;if(d===0)return JSON.parse(text.slice(s,i+1));}}return null;}
const SM=path.join(ROOT,'tools','scale-model');
const REGS=jsArray(fs.readFileSync(path.join(SM,'model','src','51-region-store.js'),'utf8'),'defRegs')||[];
// ---- extract_region.py's tables (Python literals of plain strings)
const PY=fs.readFileSync(path.join(SM,'extract_region.py'),'utf8');
const block=(name,open,close)=>{const m=PY.match(new RegExp('^'+name+'\\s*=\\s*\\'+open,'m'));if(!m)return null;const s=m.index+m[0].length;return PY.slice(s,PY.indexOf(close,s));};
const strs=t=>t==null?[]:[...t.matchAll(/(['"])((?:(?!\1).)*)\1/g)].map(m=>m[2].trim().toLowerCase());
const keys=t=>t==null?[]:[...t.matchAll(/(['"])((?:(?!\1).)*)\1\s*:/g)].map(m=>m[2].trim().toLowerCase());
const KITS={};{const t=block('KITS','{','\n}');if(t)for(const m of t.matchAll(/^\s*(['"])((?:(?!\1).)*)\1\s*:\s*(['"])((?:(?!\3).)*)\3/gm))KITS[m[2].trim().toLowerCase()]=m[4];}
const EXTRA=strs(block('EXTRA_BIOMES','(',')')),WATER=strs(block('WATER_OVERLAYS','(',')'));
const OVER=new Set(keys(block('OVERLAYS','{','}'))),TOOL=new Set(strs(block('TOOL_REGIONS_EXACT','{','}')));
ok('the model\'s regions are read (51-region-store.js defRegs)',REGS.length>50,false,REGS.length+' regions');
ok('extract_region.py\'s tables are read (KITS, OVERLAYS, TOOL_REGIONS_EXACT, EXTRA_BIOMES, WATER_OVERLAYS)',
 Object.keys(KITS).length>50&&OVER.size>=3&&TOOL.size>0&&EXTRA.length>0&&WATER.length>0,false,
 Object.keys(KITS).length+' kits, '+OVER.size+' overlays, '+TOOL.size+' tool polygons, '+EXTRA.length+' extra, '+WATER.length+' water');

// ---- every name a region can be handed
const names=new Map();const add=(n,src)=>{n=String(n).trim().toLowerCase();if(!names.has(n))names.set(n,src);};
for(const r of REGS){const n=(r.name||'').trim().toLowerCase();
 if((r.kind==='biome'||EXTRA.includes((r.name||'').toLowerCase()))&&!OVER.has(n)&&!TOOL.has(n))add(n,'the model');}
const fromModel=names.size;
Object.keys(KITS).forEach(n=>add(n,'extract_region.py KITS'));WATER.forEach(n=>add(n,'extract_region.py WATER_OVERLAYS'));
let cuts=0;for(const top of ['openworld','settlements'])for(const d of fs.readdirSync(path.join(ROOT,top)))for(const f of [path.join(ROOT,top,d,'data','region.json'),path.join(ROOT,top,d,'region','data','region.json')]){
 if(!fs.existsSync(f))continue;let j;try{j=JSON.parse(fs.readFileSync(f,'utf8'));}catch(e){continue;}
 if(Array.isArray(j.biomes)){cuts++;j.biomes.forEach(b=>add(b.name,top+'/'+d));}}
ok('every overlay name is gathered',fromModel>=60&&names.size>=fromModel,false,fromModel+' from the model, '+names.size+' in all (with '+cuts+' cut regions)');

// ---- each has its own style and palette, and the style and palette are whole
const G=WORLD.GROUND,SK=G.SKEYS,PK=Object.keys(G.PAL.desert);
const miss=[],partial=[],desert=[];
for(const [n,src] of names){const g=WORLD.groundOf(n);if(!g){miss.push(n+' ('+src+')');continue;}
 if(!SK.every(k=>typeof g.S[k]==='number'))partial.push(n+': style '+g.style);
 if(!PK.every(k=>typeof g.P[k]==='number'))partial.push(n+': palette '+g.pal);
 /* the desert's terracotta is the south-east desert's own (biomes/sedesert): another kit's overlay never takes it */
 if(g.pal==='desert'&&KITS[n]&&KITS[n]!=='sedesert')desert.push(n+' (kit '+KITS[n]+')');}
ok('every overlay the model can produce has a ground style and palette (41 BIOME_GROUND)',miss.length===0,false,miss.length?'NONE for '+miss.join(', '):names.size+' names');
ok('each style has every parameter and each palette every colour',partial.length===0,false,partial.join('; '));
ok('only the south-east desert\'s overlays take the desert palette',desert.length===0,false,desert.join(', '));
ok('every table entry names a style and a palette that exist',Object.keys(G.TABLE).every(n=>WORLD.groundOf(n)),false);
// negatives: a name the table does not hold, and a table entry whose style is gone, are refused (no silent desert)
ok('negative: a name with no entry is refused',WORLD.groundOf('no such biome')===null,WORLD.groundOf('no such biome')!==null);
{const k=Object.keys(G.TABLE)[0],was=G.TABLE[k];G.TABLE[k]=['no such style',was[1]];const r=WORLD.groundOf(k);G.TABLE[k]=was;
 ok('negative: an entry whose style does not exist is refused',r===null,r!==null);}
{const n=[...names.keys()][0],was=G.TABLE[n];delete G.TABLE[n];const r=WORLD.groundOf(n);G.TABLE[n]=was;
 ok('negative: a model name taken out of the table is caught',r===null,r!==null);}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
