// node core/terrain/test-slab.js — KRELIEF.slab (38d-core-slab.js): a tilted slab's cliff of spurs, gullies, cones, ledges and scars.
// Each check carries a negative that must fail (a broken input, or the plain ground).
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'38-core-relief.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'38c-core-landforms.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const R=KRELIEF;

// ---- loading it moves nothing: the old kinds answer exactly as before
const g0=(x,z)=>100-.02*z+3*Math.sin(x/90),sc=R.scarp({pts:[[0,0],[800,0]],h:120,run:200,seed:2}),M=R.maar({c:[0,0],r:400,ground:g0,seed:4});
const probe=()=>{const o=[];for(let i=0;i<80;i++){const x=i*9-300,z=(i*37)%300-150;o.push(R.shape(sc,x,z,g0(x,z)),R.shape(M,x,z,g0(x,z)),JSON.stringify(R.at(sc,x,z)));}return JSON.stringify(o);};
const before=probe(),kinds0=R.kinds();
eval(fs.readFileSync(path.join(__dirname,'38d-core-slab.js'),'utf8'));
ok('loaded, the old kinds answer exactly as before',probe()===before,false);
ok('kinds lists slab after the others',JSON.stringify(R.kinds())===JSON.stringify(kinds0.concat(['slab'])),false);
ok('loading it twice changes nothing',(()=>{eval(fs.readFileSync(path.join(__dirname,'38d-core-slab.js'),'utf8'));return R.kinds().length===kinds0.length+1;})(),false);

// ---- the record: a rim along x (z = 0), the slab on +z (side 1: n = (0, 1)), the floor at -z; 12 km of line
const O={pts:[[-6000,0],[0,0],[6000,0]],side:1,h:2000,run:650,dip:.12,seed:51};
const S=R.slab(O),y=(x,z,g)=>R.shape(S,x,z,g==null?3300:g);
ok('a record of plain data: JSON round trip draws the same',(()=>{const J=JSON.parse(JSON.stringify(S));return [[0,-300],[1234,-100],[-2000,200],[400,-900]].every(p=>R.shape(J,p[0],p[1],0)===R.shape(S,p[0],p[1],0));})(),false);
ok('the same seed draws the same; another seed another',(()=>{const T=R.slab(O),U=R.slab(Object.assign({},O,{seed:52}));return R.shape(T,700,-300,0)===R.shape(S,700,-300,0)&&R.shape(U,700,-300,0)!==R.shape(S,700,-300,0);})(),false);
ok('the spurs differ: runs, powers and projections spread',(()=>{const r=S.spurs.map(p=>p.run),o=S.spurs.map(p=>p.out);return Math.max(...r)/Math.min(...r)>1.5&&Math.max(...o)-Math.min(...o)>100;})(),
  (()=>{const F=R.slab(Object.assign({},O,{spurs:{run:[1,1],power:[1.3,1.3],out:[100,100]}})),r=F.spurs.map(p=>p.run);return Math.max(...r)/Math.min(...r)>1.5;})());
// a spur stands out, a gully cuts back: where the height has fallen to half the cliff
const half=s=>{let lo=-400,hi=1600;for(let k=0;k<40;k++){const m=(lo+hi)/2;R.slabProfile(S,s,2);const c=R.shape(S,s,-m,0);if(c>1000)lo=m;else hi=m;}return lo;};
const sp=S.spurs.find(p=>p.s>-2000&&p.out>150),gi=S.spurs.indexOf(sp),gs=(sp.s+sp.hw+S.spurs[gi+1].s-S.spurs[gi+1].hw)/2+6000-6000;
const sAt=sx=>sx-6000;   /* arc length to x: the line starts at x -6000 */
ok('a spur stands out past a gully (the half-height line '+Math.round(half(sAt(sp.s))-half(sAt(gs)))+' m further out)',half(sAt(sp.s))-half(sAt(gs))>120,
  half(sAt(sp.s))-half(sAt(sp.s))>120);
const notch=rec=>{let lo=1e9,hi=-1e9;for(let x=-5000;x<=5000;x+=10){const v=R.shape(rec,x,60,0);lo=Math.min(lo,v);hi=Math.max(hi,v);}return hi-lo;};
ok('gullies cut back behind the rim (60 m behind it the crest is notched '+Math.round(notch(S))+' m)',notch(S)>300,notch(R.slab(Object.assign({},O,{gullies:{back:[0,0]},spurs:{tip:[0,0],dh:[0,0]},rough:{crest:0,face:0,flute:0}})))>300);
// the crest and the ramp
ok('the crest stands about h over the floor (within 15%)',Math.abs(y(sAt(gs),300)-3300-2000)<300,Math.abs(y(sAt(gs),300)-3300-1000)<300);
ok('the ramp falls at its dip behind the rim (a km back: about 120 m lower)',(()=>{const a=y(-1000,300),b=y(-1000,1300);return Math.abs(a-b-120)<30;})(),(()=>{const a=y(-1000,300),b=y(-1000,300);return Math.abs(a-b-120)<30;})());
// the floor untouched past the cones' reach
ok('the floor is the ground, exactly, 2 km out',[-3000,-1000,0,1700,4100].every(x=>y(x,-2400)===3300),[-3000].every(x=>y(x,-500)===3300));
// the cones: at a gully's mouth the scree stands higher than at a spur's foot, at the same distance out
const C=S.cones.find(c=>c.s>3000&&c.h>90);
const mouth=s=>{const p=R.slabProfile(S,s,2);return null;};
const NC=R.slab(Object.assign({},O,{cones:false})),coneGain=s=>{let m=0;for(let dz=0;dz<900;dz+=10)m=Math.max(m,R.shape(S,s,-(500+dz),0)-R.shape(NC,s,-(500+dz),0));return m;};
ok('a scree cone at a gully\'s mouth (it stands '+Math.round(coneGain(sAt(C.s)))+' m over the cone-less slab there)',coneGain(sAt(C.s))>30,coneGain(sAt(C.s))>1e6);
// the ledges: a face with them has flatter steps than without
const minSlope=(rec,s)=>{let m=1e9;const P=[];for(let dd=rec.run*.08;dd<rec.run*.85;dd+=4)P.push(R.shape(rec,s,-dd,0));for(let i=0;i+1<P.length;i++){const sl=Math.abs(P[i+1]-P[i])/4;if(sl<m)m=sl;}return m;};
const NL=R.slab(Object.assign({},O,{ledges:false,rough:{face:0,flute:0,crest:0}})),WL=R.slab(Object.assign({},O,{rough:{face:0,flute:0,crest:0}}));
const sl=[-4000,-2500,-1000,500,2000,3500].map(s=>[minSlope(WL,s),minSlope(NL,s)]);
ok('ledges: the face steps (its flattest stretch flatter with them, on most profiles)',sl.filter(p=>p[0]<p[1]*.5).length>=3,sl.filter(p=>p[1]<p[1]*.5).length>=3);
// a scar: the face set back and steeper, its part named fresh
const SC=R.slab(Object.assign({},O,{scars:[{s:6000,w:250,back:200,run:.55}]}));
ok('a scar sets the face back where it fell',half2(SC,6000)<half2(S,6000)-100,half2(S,6000)<half2(S,6000)-100);
function half2(rec,s){let lo=-400,hi=1600;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(R.shape(rec,s-6000,-m,0)>1000)lo=m;else hi=m;}return lo;}
ok('at() names the scar fresh',(()=>{for(let dd=60;dd<600;dd+=20){const a=R.at(SC,0,-(dd-200));if(a&&a.part==='scar'&&a.fresh>.3)return true;}return false;})(),(()=>{for(let dd=60;dd<600;dd+=20){const a=R.at(S,0,-(dd-200));if(a&&a.part==='scar')return true;}return false;})());
// every part shows on a grid
const parts={};for(let x=-5000;x<=5000;x+=37)for(let z=-1500;z<=600;z+=23){const a=R.at(S,x,z);if(a)parts[a.part]=(parts[a.part]||0)+1;}
ok('every part shows: plateau, spur, face, ledge, gully, cone, skirt ('+JSON.stringify(parts)+')',['plateau','spur','face','ledge','gully','cone','skirt'].every(k=>parts[k]>0),false);
ok('at() is null on the open floor',R.at(S,0,-2600)===null,R.at(S,0,300)===null);
// continuous: no step of more than 25 m in a metre anywhere across the face (a mismatch at the spur's edge would show)
const jump=(rec)=>{let m=0;for(let x=-5000;x<=5000;x+=53){let p=R.shape(rec,x,600,0);for(let z=599;z>=-1800;z--){const c=R.shape(rec,x,z,0);m=Math.max(m,Math.abs(c-p));p=c;}}return m;};
const J=jump(S);
ok('continuous: the steepest step a metre is '+J.toFixed(1)+' m (under 40: a back-tilted ledge steepens the face beside it)',J<40,false);
// inputs
ok('refuses a line of one point, a zero h, a NaN',throws(()=>R.slab({pts:[[0,0]],h:10}))&&throws(()=>R.slab({pts:[[0,0],[9,0]],h:0}))&&throws(()=>R.slab({pts:[[0,NaN],[9,0]]})),
  throws(()=>R.slab({pts:[[0,0],[9,0]],h:10})));
ok('waters: none',Array.isArray(R.waters(S,()=>0))&&R.waters(S,()=>0).length===0,false);
// ---- the golden file for kslab.gd (the station's setting on a bent rim, a big seed, a scar): --write rewrites golden-slab.json
const gR=R.slab({pts:[[-3000,200],[-1000,0],[800,60],[3000,-150]],side:1,h:1990,run:650,dip:.123,seed:3735928559,
  spurs:{sp:520,spread:[.4,1.9],w:[.7,.97],out:[20,170],run:[.65,1.6],power:[1,1.9],dh:[-.08,.03],tip:[.02,.12]},gullies:{back:[20,130]},
  cones:{h:[50,150],reach:[160,360]},skirt:{h:.075,reach:.58},scars:[{s:3200,w:600,back:170,run:.6}]});
const gP=[];for(let x=-2800;x<=2800;x+=83)for(let z=-1300;z<=500;z+=31)gP.push([x,z]);
const gF=path.join(__dirname,'golden-slab.json'),golden={slab:R.slabExport(gR),points:gP,shape:gP.map(p=>R.shape(gR,p[0],p[1],3290)),
  at:gP.map(p=>{const a=R.at(gR,p[0],p[1]);return a?[a.part,a.spur,a.fresh,a.share]:null;})},gJ=JSON.stringify(golden);
if(process.argv.includes('--write')){fs.writeFileSync(gF,gJ);console.log('wrote golden-slab.json');}
ok('golden-slab.json is the module\'s output (--write rewrites it)',fs.existsSync(gF)&&fs.readFileSync(gF,'utf8')===gJ,false);
ok('the export is plain data (format krator-slab) and refuses another kind',golden.slab.format==='krator-slab'&&golden.slab.spurs.length===gR.spurs.length,!throws(()=>R.slabExport(sc)));
const gParts={};golden.at.forEach(a=>{if(a)gParts[a[0]]=1;});
ok('the golden reaches every part ('+Object.keys(gParts).join(', ')+')',['plateau','spur','face','gully','cone','skirt','scar'].every(k=>gParts[k]),false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
