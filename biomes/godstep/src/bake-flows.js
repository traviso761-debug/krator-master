// The stair's frozen flows, baked once (build.py runs it when its inputs change; node only):
//   node bake-flows.js <out.json> <hash>
// It reads core/rand, core/terrain's field, relief and lava (KLAVA, its layers: 46b) and the FLOWS-INPUT block of 45b-host-model.js
// (the stair, the cones, FLOW_BAKE: the eruptions), runs KLAVA.bakeLayers and writes {hash, nx, nz, x0, z0, cell, dh (base64 Uint16,
// cm), age (base64 Uint8), eruptions, lip}: lip is KLAVA.column at the head step's lip on the axis (the flows the front's top shows,
// bottom up: {eruption, th}). Deterministic: the same inputs give the same bytes on every machine (KRAND, no Math.random).
const fs=require('fs'),path=require('path'),vm=require('vm');
const HERE=__dirname,ROOT=path.join(HERE,'..','..','..'),out=process.argv[2],hash=process.argv[3]||'';
const read=p=>fs.readFileSync(p,'utf8');
const model=read(path.join(HERE,'45b-host-model.js')),a=model.indexOf('/*FLOWS-INPUT-BEGIN'),b=model.indexOf('/*FLOWS-INPUT-END*/');
if(a<0||b<0)throw new Error('bake-flows: no FLOWS-INPUT block in 45b-host-model.js');
globalThis.window=globalThis;
for(const f of ['core/rand/08-core-rand.js','core/terrain/30-core-field.js','core/terrain/38-core-relief.js','core/terrain/46-core-lava.js','core/terrain/46b-core-lava-layers.js'])vm.runInThisContext(read(path.join(ROOT,f)),{filename:f});
vm.runInThisContext(`const clamp=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{let t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 const WORLD=0x6057,KR=KRAND,vn=(x,z,sd)=>KR.vnoise(x,0,z,sd),fb=(x,z,o,sd)=>KR.fbm(x,0,z,o,sd);
 ${model.slice(a,b)}
 globalThis.__B=KLAVA.bakeLayers(Object.assign({h:flowH0},FLOW_BAKE));
 globalThis.__LIP=(function(){let d0=ST.lip;for(let d=ST.lip-800;d<ST.lip+800;d+=4){const p=xzDA(d,0),c=KRELIEF.at(STAIR,p[0],p[1],-1e9);if(c&&c.part!=='top'){d0=d;break;}}return xzDA(d0-60,0);})();`,{filename:'45b FLOWS-INPUT'});
const B=globalThis.__B,u16=new Uint16Array(B.dh.length);for(let k=0;k<u16.length;k++)u16[k]=Math.max(0,Math.min(65535,Math.round(B.dh[k]*100)));
const K=globalThis.KFIELD,L=globalThis.__LIP,col=KLAVA.column(B,L[0],L[1],{min:.05}).map(c=>({eruption:c.eruption,th:Math.round(c.th*100)/100}));
fs.writeFileSync(out,JSON.stringify({format:'godstep-flows',hash,nx:B.nx,nz:B.nz,x0:B.x0,z0:B.z0,cell:B.cell,
 eruptions:B.eruptions.map(e=>({volume:Math.round(e.volume),frozen:Math.round(e.frozen),lost:Math.round(e.lost),steps:e.steps,seconds:e.seconds,done:e.done,quenched:e.quenched})),
 lip:col,dh:K.b64(u16),age:K.b64(B.age)})+'\n');
console.log('bake-flows: '+B.nx+' x '+B.nz+' cells at '+B.cell+' m in '+B.ms+' ms; lip column '+JSON.stringify(col)+' -> '+out);
