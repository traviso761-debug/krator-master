// node core/water/test-shore.js — the shore from the ground (core/water/ext/58, 2026-10-27, PRACTICE.md section 2 item 4): an open surface's mask
// flooded over its ground from its seeds and dilated a cell, so its edges lie over ground that rises above the level and the shore the eye sees is
// the ground's contour. Judged by WATER.audit's open-edge rule (ext/57), with the shape-drawn mask as the negative.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const files=['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js','core/water/21-core-water-shore.js',
 'core/water/22-core-water-flow.js','core/water/ext/57-core-water-audit.js','core/water/ext/58-core-water-shore.js'];
global.window=global;
eval(files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;global.WATER=WATER;');
const W=WATER;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
// the case (eastabyss's): a lake whose shape is an ellipse, its shore a beach rising over the level, but east of it a low flat under the level
// joined to it (the lake runs on over it in truth), a hollow under the level cut off from it, a channel band that the river's ribbon owns
const inLake=(x,z)=>Math.hypot(x/300,z/180)-1;   /* < 0 inside the ellipse */
const ground=(x,z)=>{let g=-2+3.5*Math.max(0,inLake(x,z))*4;   /* the beach rises out of the ellipse */
 if(x>250&&Math.abs(z)<120)g=Math.min(g,-.4+.002*(x-250));   /* the low flat east of the lake, under the level out to x ~450 */
 if(Math.hypot(x+380,z-150)<35)g=Math.min(g,-.8);   /* the hollow, cut off */
 return g;};
const box=[-500,-300,600,300],shape={x0:box[0],z0:box[1],cell:8,nx:Math.round((box[2]-box[0])/8),nz:Math.round((box[3]-box[1])/8)};
shape.data=new Uint8Array(shape.nx*shape.nz);for(let j=0;j<shape.nz;j++)for(let i=0;i<shape.nx;i++)shape.data[j*shape.nx+i]=inLake(box[0]+(i+.5)*8,box[1]+(j+.5)*8)*300<24?255:0;
/* each lake audited alone (the audit exempts water another surface owns), then taken off the list */
const edges=S=>{const r=W.audit({ground,surfaces:[S]}).filter(f=>f.rule==='open-edge');W.surfaces.splice(W.surfaces.indexOf(S),1);return r;};
const e0=edges(W.open({name:'shape lake',level:0,field:0,bounds:box,mask:shape}));
const M=W.maskFromGround({box,cell:8,level:0,ground,seed:(x,z)=>inLake(x,z)<0}),e1=edges(W.open({name:'ground lake',level:0,field:0,bounds:box,mask:M}));
ok('the shape\'s mask leaves cut edges where the ground runs on under the level (open-edge: '+e0.length+', the worst '+(e0.length?Math.max(...e0.map(f=>f.by)).toFixed(2):0)+' m under)',e0.length>5,false);
ok('...the mask flooded over the ground leaves none: every edge lies over ground above the level ('+e1.length+' open-edge; '+M.flooded+' cells flooded from '+M.seeds+' seeds, '+M.data.filter(v=>v).length+' with the dilation)',e1.length===0,false);
const at=(Mk,x,z)=>{const i=Math.floor((x-Mk.x0)/Mk.cell),j=Math.floor((z-Mk.z0)/Mk.cell);return Mk.data[j*Mk.nx+i]>127;};
ok('the flood runs over the joined flat (x 400: water) and not into the hollow cut off from it (x -380: dry, its ground '+ground(-380,150)+' m), nor up the beach',at(M,400,0)&&!at(M,-380,150)&&!at(M,0,290),!at(shape,400,0)===false);
// a limit: a channel band left to a ribbon is the one straight edge left, and only there
const band=(x,z)=>!(x>300&&Math.abs(z-40)<20),M2=W.maskFromGround({box,cell:8,level:0,ground,seed:(x,z)=>inLake(x,z)<0,limit:band}),e2=edges(W.open({name:'banded lake',level:0,field:0,bounds:box,mask:M2}));ok('with a limit (a river\'s band) the only cut edges are along that band ('+e2.length+', all within 30 m of its line)',e2.length>0&&e2.every(f=>f.x>290&&Math.abs(f.z-40)<30),false);
let threw=0;try{W.maskFromGround({box,cell:8,ground});}catch(e){threw++;}try{W.maskFromGround({box,cell:8,seed:()=>true});}catch(e){threw++;}ok('...a call without a seed or a ground is refused',threw===2,false);
const M3=W.maskFromGround({box,cell:8,level:0,ground,seed:(x,z)=>inLake(x,z)<0,dilate:0}),e3=edges(W.open({name:'undilated lake',level:0,field:0,bounds:box,mask:M3}));
ok('...negative: undilated, the mask\'s half-way line falls inside the last wet cells and the audit finds the edges again ('+e3.length+')',e3.length>0,false);
console.log(bad?'\n'+bad+' FAILED':'\nall passed');process.exit(bad?1:0);
