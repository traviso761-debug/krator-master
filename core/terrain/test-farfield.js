// node core/terrain/test-farfield.js — the far field's contract (44-core-farfield.js, KFAR), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'44-core-farfield.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const F=KFAR;

// ---- the lines: every cell to the inner edge (a square edge on a multiple falls on a line), then growing
const L=F.lines({cell:110,inner:8250,out:35000,grow:1.06});
ok('the lines run evenly to the inner edge and fall on its multiples',L.includes(-3300)&&L.includes(3300)&&L.includes(8250)&&L[L.indexOf(0)+1]===110,F.lines({cell:125,inner:8250}).includes(3300));
ok('beyond it each step grows, out to the outer edge exactly',L[L.length-1]===35000&&L[0]===-35000&&(L[L.length-2]-L[L.length-3])>(L[L.length-3]-L[L.length-4]),false);
ok('they ascend and mirror',L.every((v,i)=>i===0||v>L[i-1])&&L.every((v,i)=>v===-L[L.length-1-i]),false);
let threw=false;try{F.lines({cell:0});}catch(e){threw=true;}ok('a zero cell is refused',threw,false);

// ---- the grid: a ring round a 1 km square out to 4 km, lazy and dense, the same triangles
const h=(x,z)=>300*Math.exp(-((x-2500)*(x-2500)+z*z)/8e5)+20*Math.sin(x*.003)*Math.cos(z*.002);
const skip=(x0,z0,x1,z1)=>(x0>=-1000&&x1<=1000&&z0>=-1000&&z1<=1000)||Math.hypot((x0+x1)/2,(z0+z1)/2)>4000;
const col=(x,z,y,c)=>[.2+y/1000,.3,.2+c.r/1e4];
const lz=F.grid({cell:100,n:40,h,skip,color:col}),dn=F.grid({cell:100,n:40,h,skip,color:col,dense:true});
const tris=g=>{const out=[];for(let t=0;t<g.idx.length;t+=3){const v=[0,1,2].map(k=>{const i=g.idx[t+k];return [g.pos[3*i],g.pos[3*i+1].toFixed(3),g.pos[3*i+2]].join(',');});out.push(v.join('|'));}return out.sort().join(';');};
ok('the square and the far corners are left out ('+lz.count.tris+' triangles)',lz.count.tris>0&&lz.count.tris<80*80*2&&(()=>{for(let i=0;i<lz.pos.length;i+=3)if(Math.abs(lz.pos[i])<999&&Math.abs(lz.pos[i+2])<999)return false;return true;})(),
  F.grid({cell:100,n:40,h,color:col}).count.tris<80*80*2);
ok('lazy and dense lattices draw the same triangles',tris(lz)===tris(dn),tris(lz)===tris(F.grid({cell:100,n:40,h:(x,z)=>h(x,z)+1,skip,color:col})));
ok('a lazy lattice holds only the vertices its cells use, the dense one all ('+lz.count.verts+' of '+dn.count.verts+')',lz.count.verts<dn.count.verts&&dn.count.verts===81*81,false);
ok('the colour and the height are the callbacks\' (vertex 0)',Math.abs(lz.pos[1]-h(lz.pos[0],lz.pos[2]))<1e-3&&Math.abs(lz.col[0]-(.2+lz.pos[1]/1000))<1e-5,false);
ok('the same input gives the same lattice',F.hash(lz)===F.hash(F.grid({cell:100,n:40,h,skip,color:col})),F.hash(lz)===F.hash(dn));
ok('extra attributes come per vertex',(()=>{const g=F.grid({cell:100,n:10,h,color:col,attrs:{uv:{size:2,fn:(x,z)=>[x/170,z/170]},aDet:{size:1,fn:()=>.5}}});return g.attrs.uv.length===2*g.count.verts&&g.attrs.aDet.length===g.count.verts;})(),false);
threw=false;try{F.grid({cell:100,n:4});}catch(e){threw=true;}ok('a grid without a height is refused',threw,false);
threw=false;try{F.grid({cell:100,n:4,h,crest:{k:1}});}catch(e){threw=true;}ok('a crest pass on a lazy lattice is refused',threw,false);

// ---- the options: exaggeration past a distance, the planet's curvature, the crests
const flat=()=>100,base=F.grid({cell:500,n:40,h:flat,dense:true}),ex=F.grid({cell:500,n:40,h:flat,dense:true,exag:{from:5000,to:10000,k:1.3}});
const y=(g,x,z)=>g.at(x,z);
ok('exaggeration leaves the near field and lifts the far ('+y(ex,3000,0).toFixed(1)+', '+y(ex,15000,0).toFixed(1)+')',Math.abs(y(ex,3000,0)-100)<1e-9&&Math.abs(y(ex,15000,0)-130)<1e-6,Math.abs(y(base,15000,0)-130)<1e-6);
const cu=F.grid({cell:500,n:80,h:flat,dense:true,curve:{}});
ok('the curvature drops 40 km out by r^2/2R ('+(100-y(cu,40000,0)).toFixed(1)+' m)',Math.abs((100-y(cu,40000,0))-40000*40000/(2*4.81e6))<1e-3&&Math.abs(y(cu,0,0)-100)<1e-9,Math.abs(y(base,20000,0)-100)>1e-6);
const ridge=(x,z)=>Math.max(0,600-Math.abs(z-x*.2)*1.5),r0=F.grid({cell:200,n:30,h:ridge,dense:true}),r1=F.grid({cell:200,n:30,h:ridge,dense:true,crest:{k:.6}});
let lifted=0,lowered=0;for(let k=0;k<r0.H.length;k++){if(r1.H[k]>r0.H[k]+1e-9)lifted++;if(r1.H[k]<r0.H[k]-1e-9)lowered++;}
ok('the crest pass lifts the ridgeline ('+lifted+' points) and lowers nothing',lifted>10&&lowered===0,F.hash(r0)!==F.hash(r1)&&lifted===0);
ok('the colour reads the height before the options (c.h)',(()=>{let got=null;F.grid({cell:500,n:4,h:flat,dense:true,curve:{},color:(x,z,yy,c)=>{if(x===2000&&z===0)got=[yy,c.h];return [0,0,0];}});return got&&got[1]===100&&got[0]<100;})(),false);
ok('the lattice\'s height reader is bilinear and off the lattice NaN',Number.isNaN(base.at(1e6,0))&&Math.abs(base.at(123,456)-100)<1e-9,false);

// ---- far sprites (2026-11-02)
{const throws=f=>{try{f();return false;}catch(e){return true;}};
 const src=[{x:9000,z:0,y:100,r:400,n:40,size:[300,500],rise:[50,200],alpha:.5},{x:-9000,z:500,y:0,n:10,lag:.4,tint:[1,.8,.6]}],mk=o=>F.sprites(Object.assign({world:5,sources:src},o)),S=mk();
 ok('one sprite to a slot of each source',S.count===50&&S.pos.length===150&&S.size.length===50,false);
 ok('a source\'s sprites stand in its scatter, on its rise',(()=>{for(let i=0;i<40;i++){if(Math.hypot(S.pos[3*i]-9000,S.pos[3*i+2])>400.01||S.pos[3*i+1]<150||S.pos[3*i+1]>300||S.size[i]<300||S.size[i]>500)return false;}return true;})(),false);
 ok('deterministic by world, and the same items whatever comes later in the list',(()=>{const b=F.sprites({world:5,sources:[src[0]]});for(let i=0;i<120;i++)if(b.pos[i]!==S.pos[i])return false;return true;})(),mk({world:6}).pos[0]===S.pos[0]);
 ok('a cloud set is not the steam set',mk({kind:'cloud'}).kind==='cloud'&&mk({kind:'cloud'}).pos[0]!==S.pos[0],false);
 ok('o.shape stands a sprite on the relief as drawn',mk({shape:(x,z,y)=>y-1000}).pos[1]===Math.fround(S.pos[1]-1000),false);
 const a=F.spriteAt(S,0,1),b=F.spriteAt(S,0,.5),z=F.spriteAt(S,0,0);
 ok('the kit\'s value scales them: all at 1, less at .5',a.size===S.size[0]&&b.size<a.size&&b.alpha<a.alpha,false);
 ok('at 0 only a lag of 0 sprite is at nothing... and every sprite is gone',z.size===0&&z.alpha===0,false);
 ok('a lagging source stays shut until its lag',F.spriteAt(S,45,.3).size===0&&F.spriteAt(S,45,1).size>0,F.spriteAt(S,45,.3).size>0);
 const R=mk({range:[3000,20000]});
 ok('a range fades a sprite in past near and out before far',F.spriteAt(R,0,1,2000).alpha===0&&F.spriteAt(R,0,1,10000).alpha===R.alpha[0]&&F.spriteAt(R,0,1,21000).alpha===0,F.spriteAt(S,0,1,21000).alpha===0);
 const J=JSON.parse(JSON.stringify(F.itemsExport([S]))),Bk=F.itemsLoad(J)[0];
 ok('a set round the export is the same set',J.format==='krator-far-items'&&Bk.count===50&&Bk.pos[7]===S.pos[7]&&Bk.pos instanceof Float32Array,false);
 ok('a set of another kind goes through as it is (the metropolis\'s masses later)',F.itemsLoad(F.itemsExport([{kind:'mass',count:0,lod:[1,2]}]))[0].lod[1]===2,false);
 ok('no sources, a source with no place and another format are refused',throws(()=>F.sprites({sources:[]}))&&throws(()=>F.sprites({sources:[{x:0,z:0}]}))&&throws(()=>F.itemsLoad({format:'x'})),false);
 ok('a grid has no sprites and the grid\'s own answers are as they were',F.grid({lines:F.lines({cell:10,inner:40}),h:()=>1}).count.verts>0,false);
 const THREE=require(path.join(__dirname,'..','..','kits','ancients','three.min.js'));global.THREE=THREE;global.KHOOK=null;
 eval(fs.readFileSync(path.join(__dirname,'host','44-core-farfield-draw.js'),'utf8'));
 const u={value:.5},M=F.spriteMesh(S,{k:u,name:'far steam'});
 ok('spriteMesh: one instanced draw on the kit\'s uniform, not culled, no snow',M.geometry.instanceCount===50&&M.material.uniforms.uK===u&&M.frustumCulled===false&&M.userData.farField&&M.userData.noSnow,M.material.uniforms.uK.value!==.5);
 ok('a number for k works too; its fog comes from the scene',F.spriteMesh(S,{k:.2}).material.uniforms.uK.value===.2&&M.material.fog===true&&M.material.uniforms.fogColor!=null,false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
