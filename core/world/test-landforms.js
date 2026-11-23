// node core/world/test-landforms.js — the landform records (43b-world-landforms.js; core/world/PLAN-RELIEF.md P4) on
// synthetic land, each check with an input that must fail it: records by cell from KRAND (any window, any order, the same
// records; two regions over one place agree), only where their style and the caprock allow, never on what keep() names or
// round a site; the ground stands up into them, a far chunk leaves small ones out; a pin is made at init on the ground.
const fs=require('fs'),path=require('path');
global.window=global;
for(const f of [['..','rand','08-core-rand.js'],['..','terrain','37-core-stacks.js'],['43b-world-landforms.js']])eval(fs.readFileSync(path.join(__dirname,...f),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const ground=(x,z)=>100+.01*x+20*KRAND.vnoise(x/3000,z/3000,.5,3);
const base={seed:77,ground,styleName:()=>'savanna',caprock:()=>1,keep:()=>false,sites:[]};
const ids=L=>L.map(B=>B.id+'@'+B.x.toFixed(2)+','+B.z.toFixed(2)).sort().join('|');
WLAND.reset();WLAND.init(Object.assign({ox:0,oz:0},base));
const A=WLAND.list(0,0,40000,40000);
const kinds={};A.forEach(B=>kinds[B.kind]=(kinds[B.kind]||0)+1);
console.log('      savanna over 40 km: '+A.length+' records '+JSON.stringify(kinds));
ok('a savanna holds buttes, kopjes and inselbergs',kinds.butte>20&&kinds.tor>20&&kinds.dome>3,false);
// any window, any order: the same records
WLAND.reset();WLAND.init(Object.assign({ox:0,oz:0},base));
const B1=WLAND.list(20000,20000,40000,40000).concat(WLAND.list(0,0,19999.99,40000)).concat(WLAND.list(20000,0,40000,19999.99));
ok('the same records whatever the window and the order they are asked for in',ids(B1)===ids(A),false);
// two regions over one place: a region whose origin is 10 km east sees the same records 10 km west of where it puts them
WLAND.reset();WLAND.init(Object.assign({ox:10000,oz:0},base,{ground:(x,z)=>ground(x+10000,z)}));
const C=WLAND.list(-10000,0,30000,40000).map(B=>Object.assign({},B,{x:B.x+10000}));
ok('two regions cut over one place place the same records ('+C.length+')',ids(C)===ids(A),false);
// the negative: keyed by the region's own frame (the cell's local index), the two would disagree
{const shifted=A.map(B=>Object.assign({},B,{x:B.x+700}));ok('(a frame offset by 700 m does not match: the check can fail)',ids(shifted)!==ids(A),false);}
// style and caprock decide
WLAND.reset();WLAND.init(Object.assign({ox:0,oz:0},base,{styleName:()=>'jungle'}));
ok('a jungle holds none ('+WLAND.list(0,0,40000,40000).length+')',WLAND.list(0,0,40000,40000).length===0,false);
WLAND.reset();WLAND.init(Object.assign({ox:0,oz:0},base,{caprock:()=>0}));
{const N=WLAND.list(0,0,40000,40000);ok('no caprock, no butte ('+N.filter(B=>B.kind==='butte').length+'), the kopjes still stand ('+N.filter(B=>B.kind==='tor').length+')',
 N.every(B=>B.kind!=='butte')&&N.some(B=>B.kind==='tor'),false);}
// keep(): nothing on what it names, nothing round a site
const lake=(x,z)=>Math.hypot(x-20000,z-20000)<6000;
WLAND.reset();WLAND.init(Object.assign({ox:0,oz:0},base,{keep:lake,sites:[{x:8000,z:8000}]}));
{const N=WLAND.list(0,0,40000,40000);
 ok('none on the kept ground or round a site ('+N.length+' elsewhere)',N.length>0&&N.every(B=>!lake(B.x,B.z)&&Math.hypot(B.x-20000,B.z-20000)>6000+B.R*.5&&Math.hypot(B.x-8000,B.z-8000)>3500),
  A.every(B=>!lake(B.x,B.z)));}
// the ground stands up into a butte; a far chunk leaves a kopje out
WLAND.reset();WLAND.init(Object.assign({ox:0,oz:0},base));
const bu=A.find(B=>B.kind==='butte'),to=A.find(B=>B.kind==='tor');
{const g=ground(bu.x,bu.z),h=WLAND.apply(g,bu.x,bu.z,0);ok('over a butte\'s middle the ground is its top ('+(h-g).toFixed(1)+' m over the land)',h>g+25&&Math.abs(h-bu.top)<4,false);}
{const g=ground(to.x,to.z);ok('a kopje stands at a near chunk ('+(WLAND.apply(g,to.x,to.z,0)-g).toFixed(1)+' m) and not at a far one (minWave 400)',
 WLAND.apply(g,to.x,to.z,0)>g+3&&WLAND.apply(g,to.x,to.z,400)===g,false);}
// the apron: round a butte's foot the ground rises toward its wall, and is unchanged well out
{const f=KSTACKS.foot([bu],bu.x,bu.z),R=bu.R;let up=0,far=0;
 for(let a=0;a<16;a++){const c=Math.cos(a/16*6.2832),s=Math.sin(a/16*6.2832);
  for(let r=R*.5;r<R*2.5;r+=2){const x=bu.x+c*r,z=bu.z+s*r,F=KSTACKS.foot([bu],x,z);if(F&&F.d>2&&F.d<6){if(WLAND.apply(ground(x,z),x,z,0)>ground(x,z)+1)up++;break;}}
  const x=bu.x+c*R*4,z=bu.z+s*R*4;if(WLAND.apply(ground(x,z),x,z,0)!==ground(x,z)&&!WLAND.at(x,z))far++;}
 void f;ok('a talus apron round a butte\'s foot ('+up+' of 16 directions), the land untouched four radii out',up>=12&&far===0,false);}
// a pin: made at init on the init's ground
WLAND.reset();WLAND.pin(o=>[Object.assign(KSTACKS.make({id:'pin',kind:'butte',x:5000,z:5000,y0:o.ground(5000,5000)-3,seed:1,tiers:[{h:203,r:300,e:1.2,ry:0}]}),{name:'pinned'})]);
WLAND.init(Object.assign({ox:0,oz:0},base,{styleName:()=>'jungle'}));
{const P=WLAND.pins(),g=ground(5000,5000),h=WLAND.apply(g,5000,5000,0);
 ok('a pin stands on the ground it was given ('+P.length+' pinned, its top '+(h-g).toFixed(0)+' m over the land)',P.length===1&&P[0].pinned&&h>g+180,false);}
// the fissures (relief P7): only on the High Rift; striking NNE (20 +- 8 degrees), en echelon; cut their depth at the middle;
// the land stays continuous across them
WLAND.reset();WLAND.init(Object.assign({ox:0,oz:0},base,{styleName:()=>'steps',caprock:()=>0,overlay:()=>'high rift'}));
{const F=WLAND.list(0,0,30000,30000).filter(B=>B.kind==='fissure');
 const strike=F.map(B=>Math.atan2(B.b[0]-B.a[0],-(B.b[1]-B.a[1]))*180/Math.PI);
 ok('the High Rift is cut by tension fissures ('+F.length+' over 30 km), every one striking 12 to 28 degrees east of north',F.length>60&&strike.every(a=>a>=12-1e-9&&a<=28+1e-9),false);
 const B=F.find(f=>f.d>15),g=ground(B.x,B.z),c=g-WLAND.apply(g,B.x,B.z,0);
 ok('a fissure cuts its depth at its middle ('+c.toFixed(1)+' of '+B.d.toFixed(1)+' m)',Math.abs(c-B.d)<.01,false);
 const ux=B.b[0]-B.a[0],uz=B.b[1]-B.a[1],ul=Math.hypot(ux,uz),nx=-uz/ul,nz=ux/ul;let worst=0,p=null;
 for(let s=-B.w;s<=B.w;s+=.02){const x=B.x+nx*s,z=B.z+nz*s,v=WLAND.apply(ground(x,z),x,z,0);if(p!=null)worst=Math.max(worst,Math.abs(v-p));p=v;}
 ok('the land is continuous across a fissure (the steepest 2 cm step '+worst.toFixed(2)+' m)',worst<1.2,false);
 WLAND.reset();WLAND.init(Object.assign({ox:0,oz:0},base,{styleName:()=>'steps',caprock:()=>0,overlay:()=>'opal valley'}));
 ok('none outside the High Rift ('+WLAND.list(0,0,30000,30000).filter(B=>B.kind==='fissure').length+')',WLAND.list(0,0,30000,30000).every(B=>B.kind!=='fissure'),false);}
// the master gja (relief P12): a world-absolute feature, placed where the region takes it in; its floor 310 m under the plateau
// beside it (cut to a level, so the model's broad trough under it is not cut twice), a shelf between, the land beyond its lip
// untouched, continuous across
{const plateau=3800,trough=(x,z)=>plateau-200*Math.exp(-(((x*.94+z*.34)/2500)**2)),ox=1569*2000,oz=1643*2000;
 WLAND.reset();WLAND.init({ox,oz,seed:77,ground:trough,styleName:()=>'jungle',overlay:()=>'',caprock:()=>0,keep:()=>false,sites:[],inside:()=>true});
 const G=WLAND.pins().find(B=>B.kind==='gja');
 const at=(s)=>{const ux=Math.sin(20*Math.PI/180),uz=-Math.cos(20*Math.PI/180),x=-uz*s,z=ux*s;return WLAND.apply(trough(x,z),x,z,0);};
 let lo=1e9;for(let s=-60;s<=60;s+=2)lo=Math.min(lo,at(s));
 let worst=0,p=null;for(let s=-400;s<=400;s+=.05){const v=at(s);if(p!=null)worst=Math.max(worst,Math.abs(v-p));p=v;}
 const ux=Math.sin(20*Math.PI/180),uz=-Math.cos(20*Math.PI/180),far=WLAND.apply(trough(-uz*900,ux*900),-uz*900,ux*900,0)-trough(-uz*900,ux*900);
 ok('the master gja: its floor at '+(G?(plateau-lo).toFixed(0):'-')+' m under the plateau (310), the land 900 m out untouched ('+far.toFixed(2)+'), the steepest 5 cm step '+worst.toFixed(2)+' m',
  G&&Math.abs(plateau-lo-310)<15&&Math.abs(far)<1e-9&&worst<2.5,false);
 WLAND.reset();WLAND.init({ox:0,oz:0,seed:77,ground:trough,styleName:()=>'jungle',overlay:()=>'',caprock:()=>0,keep:()=>false,sites:[],inside:(x,z)=>Math.hypot(x,z)<50000});
 ok('a region that does not take it in has no master gja',!WLAND.pins().some(B=>B.kind==='gja'),false);}
// determinism: two inits give the same records
WLAND.reset();WLAND.init(Object.assign({ox:0,oz:0},base));const D2=WLAND.list(0,0,40000,40000);
ok('deterministic: two inits, the same records',ids(D2)===ids(A)&&JSON.stringify(D2.map(B=>B.top))===JSON.stringify(A.map(B=>B.top)),false);
console.log(bad?bad+' FAILED':'all passed');
process.exit(bad?1:0);
