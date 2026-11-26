// node core/atmos/test-smokegroups.js — steam and smoke in groups (fx/89-atmos-fx-smokegroups.js), each check with a negative.
const fs=require('fs'),path=require('path');
const FRAGS=['../shader/06-core-khook.js','../shader/06b-core-kcolor.js'].concat(fs.readdirSync(__dirname).filter(f=>/^89-atmos-.*\.js$/.test(f)).sort());
global.window=global;eval(FRAGS.map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;');
const A=ATMOS;
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
ok('without the file there is no smokeGroups (it is opt-in)',typeof A.smokeGroups==='undefined',false);
eval(fs.readFileSync(path.join(__dirname,'fx','89-atmos-fx-smokegroups.js'),'utf8'));
const T3=['../../kits/ancients/three.min.js','../../settlements/iziz/three.min.js'].map(p=>path.join(__dirname,p)).find(p=>fs.existsSync(p));
if(!T3){console.log('skip  (no three.min.js found)');process.exit(0);}
const THREE=require(T3),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,1.5,.5,5000);
A.init({THREE,scene,camera,hour:()=>6,onFrame:()=>{},ground:()=>0,seed:7,err:m=>{throw new Error(m);},viewH:720,pixelRatio:1});
const P=A.PRESETS.smoke,steamA=P.steam.alpha,chimA=P.chimney.alpha;
const G=A.smokeGroups({breath:{emitters:[[0,0,0,'steam'],[10,0,0,'steam']],k:0},vents:{emitters:[[50,0,0,'steam'],[60,0,0,'chimney']],k:.6,n:6},empty:{emitters:[]}});
const sa=n=>G.meshes[n].material.uniforms.SA.value;
ok('one cloud a group, each its own uniforms',G.meshes.breath&&G.meshes.vents&&G.meshes.breath!==G.meshes.vents&&sa('breath')!==sa('vents')&&G.meshes.empty===null,G.meshes.breath===G.meshes.vents);
ok('a group starts at its k',sa('breath')[1].w===0&&Math.abs(sa('vents')[1].w-steamA*.6)<1e-9&&Math.abs(sa('vents')[0].w-chimA*.6)<1e-9,sa('breath')[1].w===steamA);
G.set('breath',1);
ok('set scales that group\'s kinds and no other',Math.abs(sa('breath')[1].w-steamA)<1e-9&&Math.abs(sa('vents')[1].w-steamA*.6)<1e-9&&G.k('breath')===1,Math.abs(sa('vents')[1].w-steamA)<1e-9);
G.set('breath',.5);G.set('breath',.25);
ok('set is from the preset, not compounded',Math.abs(sa('breath')[1].w-steamA*.25)<1e-9,Math.abs(sa('breath')[1].w-steamA*.125)<1e-9);
ok('the presets themselves are untouched',P.steam.alpha===steamA,false);
ok('n per group is honoured',G.meshes.vents.geometry.instanceCount===12&&G.meshes.breath.geometry.instanceCount===2*P.steam.n,G.meshes.vents.geometry.instanceCount===2*P.steam.n);
A.export();
ok('the export carries the groups for the port',JSON.stringify(A.fx.find(r=>r.type==='smokeGroups').groups)===JSON.stringify({breath:{n:2,k:0},empty:{n:0,k:1},vents:{n:2,k:.6}}),false);
ok('an unknown group, a negative k, bad groups throw',throws(()=>G.set('nope',1))&&throws(()=>G.set('breath',-1))&&throws(()=>A.smokeGroups([]))&&throws(()=>A.smokeGroups({a:{}})),throws(()=>G.set('vents',2)));
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
