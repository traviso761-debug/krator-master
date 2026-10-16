// node core/terrain/test-field.js — the terrain field's contract (30-core-field.js), each check with a broken input that
// must fail, and the golden vectors kfield.gd is held to (golden-field.json).
//   node core/terrain/test-field.js           'all passed'
//   node core/terrain/test-field.js --write   rewrite golden-field.json (the field and its samples)
'use strict';
const fs=require('fs'),path=require('path');
const K=require('./30-core-field.js');
const GOLD=path.join(__dirname,'golden-field.json');
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};

// the golden field: a fixed analytic surface (a tilted plane, a hill and a ripple) on a 23 x 17 grid at 2.5 m from
// (-20,-10). Sampling points are fixed (a lattice of awkward fractions plus the edges, corners and outside the grid)
const surf=(x,z)=>3+.15*x-.08*z+12*Math.exp(-((x-8)*(x-8)+(z-6)*(z-6))/60)+1.7*Math.sin(x*.41)*Math.cos(z*.27);
const BOX=[-20,-10,35,30],STEP=2.5;
const f=K.bake(surf,BOX,STEP,{name:'golden',water:{lake:(x,z)=>x<0&&z<5?4.25+.01*x:NaN,sea:-1.5},waterBox:{lake:[-20,-10,2,8]},insets:[{box:[0,0,10,7.6],step:.5,name:'fine'}]});
const cov=new Uint8Array(f.nx*f.nz);for(let j=0;j<f.nz;j++)for(let i=0;i<f.nx;i++)cov[j*f.nx+i]=(i*7+j*3)%5;f.setCover(cov,['sand','rock','scrub','water','ash']);
const PTS=[];for(let k=0;k<60;k++)PTS.push([-23+k*1.0379*1.07,-13+((k*37)%60)*.79]);
PTS.push([-20,-10],[35,30],[-20,30],[35,-10],[-100,-100],[100,100],[7.5,5],[7.49999,5.00001],[0,0],[-1.25,3.75],[2.3,4.1],[9.99,9.99],[10,10],[10.01,5],[1.5,2]);
const golden=()=>({field:f.export(),points:PTS,h:PTS.map(p=>f.h(p[0],p[1])),normal:PTS.map(p=>f.normal(p[0],p[1])),
 lake:PTS.map(p=>f.waterAt('lake',p[0],p[1])),waterH:PTS.map(p=>f.waterH(p[0],p[1])),cover:PTS.map(p=>f.coverAt(p[0],p[1]))});
if(process.argv.includes('--write')){fs.writeFileSync(GOLD,JSON.stringify(golden())+'\n');console.log('wrote '+GOLD);}

// the grid
ok('bake covers the box at the step (23 x 17 points from the corner)',f.nx===23&&f.nz===17&&f.x0===-20&&f.z0===-10,f.nx!==23);
ok('a grid point holds the closure at that point (float32)',f.at(4,6)===Math.fround(surf(-20+4*2.5,-10+6*2.5)),f.at(4,6)===Math.fround(surf(-20+5*2.5,-10+6*2.5)));
ok('h at a grid point is the stored value',f.h(-20+4*2.5,-10+6*2.5)===f.at(4,6),f.h(-20+4.5*2.5,-10+6*2.5)===f.at(4,6));
const mid=f.h(-20+4.5*2.5,-10+6.5*2.5),avg=(f.at(4,6)+f.at(5,6)+f.at(4,7)+f.at(5,7))/4;
ok('h at a cell centre is the mean of its four corners',Math.abs(mid-avg)<1e-12,Math.abs(f.h(-20+4.25*2.5,-10+6.5*2.5)-avg)<1e-12);
ok('h along a cell edge is linear between the two corners',Math.abs(f.h(-20+4.3*2.5,-10+6*2.5)-(f.at(4,6)+(f.at(5,6)-f.at(4,6))*.3))<1e-9,Math.abs(f.h(-20+4.3*2.5,-10+6*2.5)-(f.at(4,6)+(f.at(5,6)-f.at(4,6))*.4))<1e-9);
ok('outside the grid h clamps to the edge',f.h(-500,-10)===f.at(0,0)&&f.h(500,500)===f.at(22,16),f.h(-500,-10)===f.at(1,0));
ok('the far edge itself samples the last point (no read past the end)',f.h(35,30)===f.at(22,16)&&Number.isFinite(f.h(35,30)),!Number.isFinite(f.h(35,30)));
let worst=0;for(const p of PTS){const d=Math.abs(f.h(p[0],p[1])-surf(Math.min(35,Math.max(-20,p[0])),Math.min(30,Math.max(-10,p[1]))));if(d>worst)worst=d;}
ok('the bake follows its closure (bilinear error under 1 m on this surface at 2.5 m)',worst<1,worst===0);
const n=f.normal(7.5,5),nl=Math.hypot(...n);
ok('the normal is a unit vector pointing up',Math.abs(nl-1)<1e-12&&n[1]>0,n[1]<=0);
const flat=K.create({x0:0,z0:0,step:1,nx:4,nz:4,heights:new Float32Array(16).map((_,k)=>(k%4)*.5)});   // y = x/2
const nf=flat.normal(1.5,1.5);
ok('the normal of a plane rising east leans west',Math.abs(nf[0]+.5/Math.hypot(.5,1))<1e-12&&Math.abs(nf[2])<1e-12,nf[0]>=0);

// insets
const fine=f.insets[0],baseH=(x,z)=>K.bilinear(f.heights,f.nx,f.nz,(x-f.x0)/f.step,(z-f.z0)/f.step);
ok('an inset is snapped out to the base lattice',fine&&fine.x0===0&&fine.z0===0&&fine.x1===10&&fine.z1===10&&fine.nx===21,!fine||fine.z1===7.6);
ok('inside an inset h is the finer bake (the closure at its points)',f.h(1.5,2)===Math.fround(surf(1.5,2))&&baseH(1.5,2)!==f.h(1.5,2),baseH(1.5,2)===Math.fround(surf(1.5,2)));
ok('outside it the base answers',f.h(-5,1.3)===baseH(-5,1.3)&&f.h(10.01,5)===baseH(10.01,5),f.h(-5,1.3)!==baseH(-5,1.3));
let wi=0,wb=0;for(let k=0;k<400;k++){const x=(k%20)*.4987+.1,z=Math.floor(k/20)*.4987+.1;wi=Math.max(wi,Math.abs(f.h(x,z)-surf(x,z)));wb=Math.max(wb,Math.abs(baseH(x,z)-surf(x,z)));}
ok('the inset follows its closure closer than the base ('+wi.toFixed(4)+' m against '+wb.toFixed(4)+' m)',wi<wb/4,wi>=wb);
ok('an inset outside the field is refused',throws(()=>K.create({x0:0,z0:0,step:1,nx:3,nz:3}).addInset(K.create({x0:1,z0:1,step:.5,nx:6,nz:3}))),
 throws(()=>K.create({x0:0,z0:0,step:1,nx:3,nz:3}).addInset(K.create({x0:1,z0:1,step:.5,nx:3,nz:3}))));

// water
ok('a level is the same everywhere',f.waterAt('sea',1e4,-1e4)===-1.5,f.waterAt('sea',0,0)!==-1.5);
ok('a windowed surface is wet inside and DRY outside its extent',f.waterAt('lake',-10,0)>4&&f.waterAt('lake',30,25)===K.DRY,f.waterAt('lake',30,25)!==K.DRY);
ok('an unnamed surface is DRY',f.waterAt('nope',0,0)===K.DRY,f.waterAt('lake',-10,0)===K.DRY);
ok('waterH is the highest wet surface',f.waterH(-10,0)===f.waterAt('lake',-10,0)&&f.waterH(30,25)===-1.5,f.waterH(30,25)===K.DRY);
ok('where the lake ends (a dry corner), the nearest corner decides, not a blend with NaN',Number.isFinite(f.waterAt('lake',-1.3,0))&&Number.isFinite(f.waterAt('lake',.1,0)),Number.isNaN(f.waterAt('lake',-1.3,0)));
ok('cover is the nearest grid point',f.coverAt(-20+3.4*2.5,-10+2.6*2.5)===(3*7+3*3)%5,f.coverAt(-20+3.4*2.5,-10+2.6*2.5)===(4*7+3*3)%5&&(4*7+3*3)%5!==(3*7+3*3)%5);

// export and load
const ex=f.export(),g=K.load(JSON.parse(JSON.stringify(ex)));
ok('the export says what it is',ex.format==='krator-field'&&ex.version===1&&ex.convention.units==='metres'&&ex.convention.up==='+y'&&ex.convention.x==='east'&&ex.convention.z==='south',ex.format!=='krator-field');
ok('heights are base64 of little-endian float32',Buffer.from(ex.heights,'base64').readFloatLE(4*(6*23+4))===f.at(4,6),Buffer.from(ex.heights,'base64').readFloatBE(4*(6*23+4))===f.at(4,6));
ok('min and max are the heights\' range',ex.min===Math.min(...f.heights)&&ex.max===Math.max(...f.heights),ex.min===ex.max);
ok('load(export) samples the same everywhere, bit for bit',PTS.every(p=>g.h(p[0],p[1])===f.h(p[0],p[1])&&g.waterH(p[0],p[1])===f.waterH(p[0],p[1])&&g.coverAt(p[0],p[1])===f.coverAt(p[0],p[1])),
 PTS.every(p=>K.load(Object.assign({},ex,{heights:K.b64(new Float32Array(f.heights.length))})).h(p[0],p[1])===f.h(p[0],p[1])));
const cr=f.export({box:[-6.2,1,9.9,12.4]}),c=K.load(cr);
ok('a crop keeps the lattice and covers the box',cr.x0===-7.5&&cr.z0===0&&cr.x0+(cr.nx-1)*cr.step>=9.9&&cr.z0+(cr.nz-1)*cr.step>=12.4,cr.x0===-6.2);
// (to rounding: the crop's corner is x0 + i0*step, so (x - corner)/step can differ from (x - x0)/step - i0 in the last bit)
const near=(a,b)=>Math.abs(a-b)<1e-9;
ok('a crop samples the same inside its box (to 1e-9 m)',[[-6,1.5],[0,7],[9.9,12.4],[3.3,9.1]].every(p=>near(c.h(p[0],p[1]),f.h(p[0],p[1]))&&near(c.waterH(p[0],p[1]),f.waterH(p[0],p[1]))),[[-6,1.5],[0,7]].every(p=>near(c.h(p[0]+1,p[1]),f.h(p[0],p[1]))));
ok('the export carries its insets, and a crop only those it meets',ex.insets&&ex.insets.length===1&&!f.export({box:[20,20,35,30]}).insets&&f.export({box:[5,5,30,30]}).insets[0].x0===5,!ex.insets);
ok('load(export) reads the inset back',g.insets.length===1&&g.h(1.5,2)===f.h(1.5,2),g.insets.length===0);
ok('a crop past the lake keeps only the level',!('lake' in f.export({box:[20,20,35,30]}).water)&&'sea' in f.export({box:[20,20,35,30]}).water,'lake' in f.export({box:[20,20,35,30]}).water);

// refusals
ok('a bad grid is refused',throws(()=>K.create({x0:0,z0:0,step:0,nx:2,nz:2}))&&throws(()=>K.create({x0:0,z0:0,step:1,nx:1.5,nz:2}))&&throws(()=>K.create({x0:0,z0:0,step:1,nx:2,nz:2,heights:[1,2,3]})),
 throws(()=>K.create({x0:0,z0:0,step:1,nx:2,nz:2})));
ok('a closure that returns NaN cannot be baked',throws(()=>K.bake((x,z)=>x>3?NaN:0,[0,0,5,5],1)),throws(()=>K.bake((x,z)=>0,[0,0,5,5],1)));
ok('load refuses another format or version',throws(()=>K.load({format:'krator-heightfield'}))&&throws(()=>K.load(Object.assign({},ex,{version:2}))),throws(()=>K.load(ex)));

// the golden file (what kfield.gd is held to)
if(fs.existsSync(GOLD)){const G=JSON.parse(fs.readFileSync(GOLD,'utf8')),now=golden();
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 ok('golden-field.json: the field is unchanged',same(G.field,now.field),same(G.field,Object.assign({},now.field,{step:3})));
 ok('golden-field.json: every sample is unchanged',same([G.h,G.normal,G.lake,G.waterH,G.cover],[now.h,now.normal,now.lake,now.waterH,now.cover]),same(G.h,now.h.map(v=>v+1e-9)));
 const L=K.load(G.field);ok('golden-field.json: loading the file gives its samples',G.points.every((p,k)=>L.h(p[0],p[1])===G.h[k]&&L.waterH(p[0],p[1])===G.waterH[k]),G.points.every((p,k)=>L.h(p[0]+.3,p[1])===G.h[k]));}
else{bad++;console.log('FAIL  golden-field.json is missing (node core/terrain/test-field.js --write)');}

// speed: a million samples (the flora pass reads the field this often)
let t=Date.now(),s=0;for(let k=0;k<1e6;k++)s+=f.h(-20+(k%997)*.0551,-10+(k%991)*.0403);t=Date.now()-t;
ok('a million samples in under four seconds, even on a loaded box ('+t+' ms)',t<4000&&Number.isFinite(s),!Number.isFinite(s));
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
