// node core/terrain/test-therm.js — the ground's temperature (47-core-therm.js, KTHERM) and snow's mask from it, each check with a broken input that must fail.
// --write rewrites golden-therm.json, which ktherm.gd is held to.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'47-core-therm.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const K=KTHERM,V=[{id:'a',x:0,z:0,T:90,reach:200},{id:'b',kind:'line',pts:[[300,0],[300,300],[500,300]],T:60,reach:120,decay:2}];
const H=K.create({soil:-6,vents:V,detail:{amp:0}});

// ---- the vents and their sum
ok('at a vent the ground is the vent\'s T ('+H.heatAt(0,0)+')',Math.abs(H.heatAt(0,0)-90)<1e-9,Math.abs(K.create({soil:-6,vents:[]}).heatAt(0,0)-90)<1e-9);
ok('beyond every reach the ground is the soil, exactly',H.heatAt(-900,-900)===-6&&H.heatAt(0,201)===-6,H.heatAt(0,199)===-6);
ok('a line vent is as hot all along its length',Math.abs(H.heatAt(300,150)-60)<1e-9&&Math.abs(H.heatAt(400,300)-60)<1e-9,Math.abs(H.heatAt(400,420)-60)<1e-9);
let mono=true,last=Infinity;for(let d=0;d<=210;d+=5){const t=H.heatAt(-d,0);if(t>last+1e-12)mono=false;last=t;}
ok('the heat falls smoothly with distance, to nothing at the reach',mono,false);
const two=K.create({soil:0,vents:[{x:-30,z:0,T:50,reach:100},{x:30,z:0,T:50,reach:100}],detail:{amp:0}}),one=K.create({soil:0,vents:[{x:-30,z:0,T:50,reach:100}],detail:{amp:0}});
ok('two vents sum between them',two.heatAt(0,0)>one.heatAt(0,0)*1.5,two.heatAt(0,0)<=one.heatAt(0,0));
const hot=K.create({soil:0,vents:[{x:0,z:0,T:50,reach:100},{x:1,z:0,T:50,reach:100},{x:2,z:0,T:50,reach:100}],detail:{amp:0}});
ok('the sum never passes the hottest vent ('+hot.heatAt(1,0)+')',hot.heatAt(1,0)<=50,hot.heatAt(1,0)>50);
ok('a vent colder than the soil gives nothing',K.create({soil:20,vents:[{x:0,z:0,T:5,reach:50}]}).heatAt(0,0)===20,false);
const lin=K.create({soil:0,vents:[{x:0,z:0,T:100,reach:100,decay:0}],detail:{amp:0}});
ok('decay 0 is a straight line',Math.abs(lin.heatAt(50,0)-50)<1e-9,Math.abs(H.heatAt(100,0)-(-6+96*.5))<1e-9);
ok('a soil function and a soil raster are read',K.create({soil:(x,z)=>x*.01,vents:[]}).heatAt(500,0)===5&&Math.abs(K.create({soil:{x0:0,z0:0,cell:10,nx:2,nz:2,T:[0,10,0,10]},vents:[]}).heatAt(5,5)-5)<1e-12,false);

// ---- the detail
const D=K.create({soil:-6,vents:V,detail:{amp:3,seed:9}}),D2=K.create({soil:-6,vents:V,detail:{amp:3,seed:10}});
let moved=0;for(let a=0;a<40;a++)if(Math.abs(D.heatAt(a*4,a*2)-H.heatAt(a*4,a*2))>.05)moved++;
ok('the detail moves the hot ground ('+moved+' of 40 points)',moved>25,D.heatAt(40,20)===D2.heatAt(40,20));
ok('the detail leaves the country\'s soil exact',D.heatAt(-900,-900)===-6,false);
ok('the same seed, the same ground',K.create({soil:-6,vents:V,detail:{amp:3,seed:9}}).heatAt(77,33)===D.heatAt(77,33),false);

// ---- bake, contour, mask
const box=[-260,-260,260,260],F=H.bake({box,cell:8});
ok('a raster reads the field at its nodes, and between them to within a degree',Math.abs(K.fieldAt(F,0,0)-H.heatAt(4,4))<3&&Math.abs(K.fieldFns(F).temp(64,64)-H.heatAt(64,64))<1,false);
ok('the raster holds the same field twice',K.hash(F)===K.hash(H.bake({box,cell:8})),K.hash(F)===K.hash(D.bake({box,cell:8})));
const H1=K.create({soil:-6,vents:[V[0]],detail:{amp:0}}),cs=H1.contour(0,{box,cell:8}),L=cs[0];
ok('the 0 degree line round a vent is a closed loop',cs.length===1&&cs[0].closed&&cs[0].pts.length>30,H1.contour(500,{box,cell:8}).length>0);
ok('every contour point is on 0 degrees, to within a degree',L.pts.every(p=>Math.abs(H1.heatAt(p[0],p[1]))<1),L.pts.some(p=>Math.abs(H1.heatAt(p[0],p[1])-60)<1));
const rr=L.pts.map(p=>Math.hypot(p[0],p[1]));
ok('the loop stands where the vent\'s share gives 0 degrees ('+Math.min(...rr).toFixed(0)+'-'+Math.max(...rr).toFixed(0)+' m)',Math.min(...rr)>120&&Math.max(...rr)<200,false);
const op=K.contourOf({x0:0,z0:0,cell:1,nx:3,nz:2,T:[0,5,10,0,5,10]},7.5);
ok('a line that leaves the raster is open, with its ends on the edge',op.length===1&&!op[0].closed&&op[0].pts.length===2&&op[0].pts[0][0]===1.5,op[0].closed);
const sad=K.contourOf({x0:0,z0:0,cell:1,nx:2,nz:2,T:[10,0,0,10]},4);
ok('a saddle gives two lines, not a crossing',sad.length===2&&sad.every(c=>c.pts.length===2),false);
const M=H.snowMask({box,cell:8}),mk=(x,z)=>M.data[Math.round((z-M.z0)/M.cell)*M.nx+Math.round((x-M.x0)/M.cell)];
ok('the mask is bare on the warm ground, whole on the cold, and steps across the 0 degree line',mk(0,0)===0&&mk(-256,-256)===255,mk(0,0)===255);
ok('the mask is sized to its raster',M.data.length===M.nx*M.nz&&M.data instanceof Uint8Array,false);

// ---- export
const J=JSON.parse(JSON.stringify(D.export())),H2=K.load(J);
ok('the export loads to the same field',K.hash(H2.bake({box,cell:8}))===K.hash(D.bake({box,cell:8})),K.hash(H2.bake({box,cell:8}))===K.hash(H.bake({box,cell:8})));
const fs2=K.create({soil:(x,z)=>x*.01,vents:V,detail:{amp:0}}),J2=JSON.parse(JSON.stringify(fs2.export({box,cell:16})));
ok('a soil function is baked into the export',Array.isArray(J2.soil.T)&&Math.abs(K.load(J2).heatAt(-240,-200)-fs2.heatAt(-240,-200))<1e-9,false);
ok('a soil function with no box cannot be exported',throws(()=>fs2.export()),throws(()=>fs2.export({box,cell:16})));
ok('a vent with no reach, a line of one point and a wrong kind are refused',throws(()=>K.create({vents:[{x:0,z:0,T:9}]}))&&throws(()=>K.create({vents:[{kind:'line',pts:[[0,0]],T:9,reach:5}]}))&&throws(()=>K.create({vents:[{kind:'ring',x:0,z:0,T:9,reach:5}]})),false);
ok('a load of something else is refused',throws(()=>K.load({format:'krator-field'})),false);

// ---- snow's mask (core/atmos/fx/89-atmos-fx-snowcover.js, ATMOS.snowBare): the shader takes it only when asked
{const vm=require('vm'),THREE=require(path.join(__dirname,'..','..','kits','ancients','three.min.js'));
 const ctx={console,Math,THREE,Uint8Array,Float32Array};ctx.globalThis=ctx;ctx.window=ctx;vm.createContext(ctx);require('../shader/06-core-khook.js');ctx.KHOOK=globalThis.KHOOK;
 for(const f of['89-atmos-0-core.js','89-atmos-0p-presets.js','fx/89-atmos-fx-snowcover.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..','atmos',f),'utf8')+'\nthis.ATMOS=ATMOS;',ctx,{filename:f});
 const A=ctx.ATMOS;A.T=THREE;A.U=A.U||{};A.rec=()=>{};const s0=A.snowGLSL();
 ok('with no mask the snow\'s shader has no word of it',!/atmSnowBare/.test(s0),false);
 ok('ATMOS.snowBare before the page\'s ATMOS.T is refused',(()=>{const t=A.T;A.T=null;const r=throws(()=>A.snowBare(M));A.T=t;return r;})(),false);
 const tex=A.snowBare(M),s1=A.snowGLSL();
 ok('with one the snow is multiplied by it, off the box it lies',/uniform sampler2D atmSnowBare/.test(s1)&&/return line\*atmSnowBareAt\(wp\.xz\)\*/.test(s1)&&/return 1\.0/.test(s1),s1===s0);
 ok('the mask\'s texels sit on the raster\'s nodes',Math.abs(A.U.snowBareBox.value.x-(M.x0-M.cell/2))<1e-3&&Math.abs(A.U.snowBareBox.value.z-M.nx*M.cell)<1e-3,false);
 ok('the texture is the mask\'s bytes',tex.image.data===M.data&&tex.image.width===M.nx&&tex.image.height===M.nz,false);
 ok('a mask of no size is refused',throws(()=>A.snowBare({nx:2,nz:2,data:new Uint8Array(3)})),false);}

// ---- the golden file for ktherm.gd
const gF=path.join(__dirname,'golden-therm.json'),gS={x0:-300,z0:-300,cell:300,nx:3,nz:3,T:[-8,-7,-6,-7,-6,-5,-6,-5,-4]},gH=K.create({soil:gS,vents:V,detail:{amp:2,scale:.03,seed:77}});
const pts=[];for(let i=0;i<40;i++)pts.push([-280+i*17.3,-250+((i*97)%500)]);
const gB=gH.bake({box:[-120,-120,120,120],cell:16}),golden={therm:gH.export(),points:pts,heat:pts.map(p=>gH.heatAt(p[0],p[1])),contour0:K.contourOf(gB,0),contour25:K.contourOf(gB,25),mask:Array.from(gH.snowMask({box:[-120,-120,120,120],cell:16}).data)};
const js=JSON.stringify(golden);
if(process.argv.includes('--write')){fs.writeFileSync(gF,js);console.log('wrote golden-therm.json');}
ok('golden-therm.json is the module\'s output (--write rewrites it)',fs.existsSync(gF)&&fs.readFileSync(gF,'utf8')===js,false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
