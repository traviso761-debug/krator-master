// The loader shared by test-gh-town.js (and a quick look at the records): core/rand, core/space, core/city, core/hamlet with the
// Xanadu row by name, the fort asset's plan (kits/xanadu 80f), Gihon's ground, town, ring and Landing; the Xanadu kit's boxes read
// from its defs (src and the opt-in extra/, Gihon's 88h among them), as Kirstabal's test reads them.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','core/space/20-core-space.js'].forEach(load);
fs.readdirSync(path.join(ROOT,'core','city')).filter(f=>/^\d\d-city-.*\.js$/.test(f)&&!/host|squares|radial|covered/.test(f)).sort().forEach(f=>load('core/city/'+f));
fs.readdirSync(path.join(ROOT,'core','hamlet')).filter(f=>/^(10|12|14|16|18|20|30)-hamlet-.*\.js$/.test(f)).sort().forEach(f=>load('core/hamlet/'+f));
KCITY.lib={SL,plan:()=>PLAN,tune:()=>TUNE,KSPACE,Raster,OCC,obb,obbCorners,segDist,polySegDist,resample,clamp,inPoly,cg:()=>CG};
load('kits/xanadu/src/80f-xa-fort-data.js');
['39g-gh-model.js','40-gh-ground.js','41-gh-town.js','42-gh-ring.js','43-gh-landing.js'].forEach(f=>load('settlements/gihon/src/'+f));
const DIMS={};
const KITF=d=>fs.readdirSync(path.join(ROOT,'kits','xanadu',d)).filter(f=>/\.js$/.test(f)).map(f=>path.join(ROOT,'kits','xanadu',d,f));
for(const F of KITF('src').concat(KITF('extra'))){const s=fs.readFileSync(F,'utf8');
 for(const m of s.matchAll(/key:'(xa_[a-z0-9_]+)'/g)){const seg=s.slice(m.index,m.index+900),g=k=>{const q=seg.match(new RegExp('[,{]'+k+':([0-9.]+)'));return q?+q[1]:null;};
  if(!DIMS[m[1]]&&g('w'))DIMS[m[1]]={w:g('w'),d:g('d'),h:g('h')||8,fw:g('fw')||g('w'),fd:g('fd')||g('d')};}
 for(const m of s.matchAll(/xa(?:Garden|Water)Def\('(xa_[a-z0-9_]+)'/g))if(!DIMS[m[1]])DIMS[m[1]]={w:8,d:8,h:5,fw:8,fd:8};}
{const m=fs.readFileSync(path.join(ROOT,'kits','xanadu','src','88f-xa-harbour.js'),'utf8').match(/const XH_BADGIR=\[([^\]]*)\]/);if(m)for(const k of m[1].match(/xa_[a-z0-9_]+/g))if(DIMS[k])DIMS[k+'_badgir']=Object.assign({},DIMS[k],{h:DIMS[k].h+2});}
for(const F of KITF('src').concat(KITF('extra')))for(const m of fs.readFileSync(F,'utf8').matchAll(/key:'(xa_[a-z0-9_]+)',baseKey:'(xa_[a-z0-9_]+)'/g))if(DIMS[m[2]])DIMS[m[1]]=DIMS[m[2]];
const dims=(k,v)=>DIMS[k]?{key:k,v:v||0,w:DIMS[k].w,d:DIMS[k].d,h:DIMS[k].h,fw:DIMS[k].fw,fd:DIMS[k].fd}:null;
module.exports={ROOT,DIMS,dims,load};
if(require.main===module){const t0=Date.now(),K=GH_TOWN.make({dims});
 console.log('town in '+(Date.now()-t0)+' ms: '+K.census.buildings+' buildings, '+K.census.people+' people (forbidden city '+K.census.fc+'); '+JSON.stringify(K.census.byCls));
 console.log('notes:',K.notes.slice(0,30).join(' | '));
 console.log('fc ward faults:',K.fc.ward&&K.fc.ward.plan.faults,'gates',K.fc.ward&&K.fc.ward.plan.gates.map(g=>g.id),'towers',K.fc.ward&&K.fc.ward.plan.towers.length,'terrace',JSON.stringify(K.fc.terrace));
 console.log('gardens',K.gardens.map(g=>g.name+' '+g.nu+'x'+g.nv).join(', '));console.log('outside',JSON.stringify(K.outside));console.log('river quays',K.riverQuays,'bridge',JSON.stringify(K.bridge).slice(0,200));
 const t1=Date.now(),R=GH_RING.make({dims});console.log('ring in '+(Date.now()-t1)+' ms',R.map(v=>v.id+' '+(v.error||(v.records||[]).length)).join(', '));
 const t2=Date.now(),Ld=GH_LANDING.make({dims});console.log('landing in '+(Date.now()-t2)+' ms',JSON.stringify(Ld.census),Ld.notes.slice(0,10).join(' | '));}
