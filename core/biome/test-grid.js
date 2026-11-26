// node core/biome/test-grid.js: the placer's core defaults (40-core-place.js, 20-core-kit.js; CORE-IMPROVEMENTS items 13, 7,
// 3c and 6), each check with a negative.
//   13  BIO.grid's cell form: a cell's draws are its own, so adding a pass, a box built alone or the page's stream moves nothing;
//       the numeric form draws exactly what the grid drew before (frozen below)
//   7   the cliff gate: on in the cell form, off in the numeric form unless the page or the pass asks; BIO.cliffCheck flags a
//       rooted item on a face, with its negative control
//   3c  the instance cap: BIO.err once at the first put over BIO.CAP, BIO.capReport, cap/capWhy, CAP_THROW
//   6   bucket meshes carry userData.probePoints (flat, one a 2 m cell), so a volume over a trunk reads full
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const THREE=require(path.join(ROOT,'kits','ancients','three.min.js'));
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
// the numeric grid as it was before the cell form (core/biome a5a5ca481), FROZEN: the numeric form must draw exactly this
const OLD_GRID=`BIO.grid=function(cell,rIn,rOut,accept,fn,opt){opt=opt||{};const o=opt.center||BIO.center(),N=Math.ceil(rOut*2/cell);let n=0;const D=opt.depth;
 const pk=opt.patch==null?.85:opt.patch,ps=opt.patchScale||.016;
 const B=opt.box;
 let ix0=0,ix1=N-1,iz0=0,iz1=N-1;
 if(B){ix0=Math.max(0,Math.floor((B[0]-(o[0]-rOut))/cell));ix1=Math.min(N-1,Math.ceil((B[2]-(o[0]-rOut))/cell));iz0=Math.max(0,Math.floor((B[1]-(o[1]-rOut))/cell));iz1=Math.min(N-1,Math.ceil((B[3]-(o[1]-rOut))/cell));}
 for(let iz=iz0;iz<=iz1;iz++)for(let ix=ix0;ix<=ix1;ix++){
  const x=o[0]-rOut+(ix+rng())*cell,z=o[1]-rOut+(iz+rng())*cell,u=rng();
  if(B&&(x<B[0]||z<B[1]||x>B[2]||z>B[3]))continue;
  const d=Math.hypot(x-o[0],z-o[1]);if(d<rIn||d>rOut)continue;
  let a=accept?accept(x,z,d):1;if(a<=0)continue;
  if(opt.reach){a*=BIO.reachW(opt.reach,x,z);if(a<=0)continue;}
  if(D){const dep=BIO.depth(x,z);if(dep<D[0]||dep>D[1])continue;}
  const m=opt.noMask?1:BIO.mask(x,z);if(m<=0)continue;
  const patch=pk>0?(1-pk*.5)+pk*fbm(x*ps+7,z*ps-3,9484,2):1;
  if(u>a*m*clamp(patch,0,1.15))continue;
  if(!BIO.clearOf(x,z,opt.pad||0))continue;
  fn(x,BIO.terrainH(x,z),z,d);n++;}
 return n;};`;
// a ground: flat, with a 60 m wall (slope 2.5) along x = 300..324, rock shown on the wall only
const H=(x,z)=>x<300?0:x>324?60:(x-300)*2.5;
function page(o){o=o||{};const ctx={console,Math,THREE};ctx.globalThis=ctx;vm.createContext(ctx);
 for(const f of ['core/rand/08-core-rand.js','core/biome/10-core-head.js','core/biome/20-core-kit.js','core/biome/40-core-place.js'])
  vm.runInContext(read(f)+(f.endsWith('10-core-head.js')?'\nthis.BIO=BIO;':''),ctx,{filename:f});
 const BIO=ctx.BIO,errs=[];
 BIO.init(Object.assign({THREE,scene:new THREE.Scene(),seed:11,err:m=>errs.push(m),terrainH:H,
  fields:o.noRock?{}:{rock:(x,z)=>x>=296&&x<=328?1:0},origin:[0,0]},o.host||{}));
 if(o.old)vm.runInContext('(function(){const {clamp,rng,fbm}=BIO.fn;'+OLD_GRID+'})();',ctx);
 return {BIO,errs,ctx};}
const pts=(B,salt,cell,acc,opt)=>{const P=[];B.grid(salt,cell,acc||(()=>1),(x,y,z,seed)=>P.push([+x.toFixed(6),+z.toFixed(6),seed,B.fn.rng()]),opt);return P;};
const key=P=>JSON.stringify(P);
const onWall=L=>L.filter(p=>p[0]>=301&&p[0]<=323).length;

// ---------------------------------------------------------------- 13: the cell form
{const A=page(),B=page();
 const a1=pts(A.BIO,'ferns',10,null,{rOut:400});
 B.BIO.grid('rocks',7,()=>1,()=>{B.BIO.fn.rng();B.BIO.fn.rng();},{rOut:400});   /* a pass added before it, drawing in its fn */
 const b1=pts(B.BIO,'ferns',10,null,{rOut:400});
 ok(a1.length>500&&key(a1)===key(b1),'13: a pass added before moves nothing ('+a1.length+' ferns)');
 const s0=A.BIO.fn.rngState();A.BIO.grid('x',10,()=>1,()=>A.BIO.fn.rng(),{rOut:200});
 ok(A.BIO.fn.rngState()===s0,'13: the page\'s stream is put back after the grid');
 const C=page(),c=pts(C.BIO,'ferns',10,null,{rOut:400}).filter(p=>p[0]>=0&&p[0]<=100&&p[1]>=0&&p[1]<=100);
 const D=page(),d=pts(D.BIO,'ferns',10,null,{box:[0,0,100,100]});
 ok(d.length>20&&key(c)===key(d),'13: a box built alone draws what the full build draws in it ('+d.length+')');
 const E=page(),e=pts(E.BIO,'mosses',10,null,{rOut:400});ok(key(e)!==key(a1),'13 negative: another salt draws other cells');
 const F=page({host:{seed:12}}),f=pts(F.BIO,'ferns',10,null,{rOut:400});ok(key(f)!==key(a1),'13 negative: another world seed draws other cells');
 const G=page();G.BIO.kit('other');const g=pts(G.BIO,'ferns',10,null,{rOut:400});ok(key(g)!==key(a1),'13 negative: another kit draws other cells');
 let threw=0;try{page().BIO.grid('z',10,()=>1,()=>{});}catch(err){threw=1;}ok(threw,'13: the cell form wants a box or rOut');
 /* the stream-ordered numeric form shows the problem the cell form fixes */
 const N1=page(),n1=[],N2=page(),n2=[];N1.BIO.grid(10,0,300,()=>1,(x,y,z)=>n1.push(x));
 N2.BIO.fn.rng();N2.BIO.grid(10,0,300,()=>1,(x,y,z)=>n2.push(x));ok(key(n1)!==key(n2),'13 negative: the numeric form moves when a draw is added before it');}
{const O=page({old:true}),N=page(),a=[],b=[];
 const acc=(x,z,d)=>.6+.4*Math.sin(x*.01);
 O.BIO.grid(9,20,700,acc,(x,y,z,d)=>a.push([x,y,z,d,O.BIO.fn.rng()]),{patch:.7,pad:.5});
 N.BIO.grid(9,20,700,acc,(x,y,z,d)=>b.push([x,y,z,d,N.BIO.fn.rng()]),{patch:.7,pad:.5});
 ok(a.length>1000&&key(a)===key(b),'13: the numeric form draws exactly what the frozen grid drew ('+a.length+', the wall included: no gate)');}

// ---------------------------------------------------------------- 7: the cliff gate
{const B=page().BIO;
 ok(B.cliff(100,0)===0&&B.cliff(312,0)>.99&&B.cliffW(312,0)===0,'7: cliff is 0 on the flat and 1 on the rock wall');
 ok(page({noRock:true}).BIO.cliff(312,0)>.99,'7: a host with no rock field: slope alone');
 ok(page({host:{fields:{rock:(x,z)=>0}}}).BIO.cliff(312,0)===0,'7: a steep face showing no rock is not a cliff');
 ok(page({host:{cliff:(x,z)=>.5}}).BIO.cliffW(0,0)===.5,'7: a host\'s own cliff(x,z) wins');
 const g=pts(B,'trees',3,null,{box:[200,-100,420,100]});ok(g.length>500&&onWall(g)===0,'7: the cell form keeps the wall bare ('+g.length+' placed)');
 const h=pts(page().BIO,'lichen',3,null,{box:[200,-100,420,100],cliff:true});ok(onWall(h)>100,'7: a pass with cliff:true grows on the wall ('+onWall(h)+')');
 const n=[];page().BIO.grid(3,0,500,()=>1,(x,y,z)=>n.push([x]),{center:[310,0],box:[200,-100,420,100]});
 ok(onWall(n)>100,'7 negative: the numeric form is not gated by default ('+onWall(n)+' on the wall)');
 const n2=[];page({host:{cliffGate:true}}).BIO.grid(3,0,500,()=>1,(x,y,z)=>n2.push([x]),{center:[310,0],box:[200,-100,420,100]});
 ok(n2.length>500&&onWall(n2)===0,'7: BIO.init({cliffGate:true}) gates the numeric form');
 const n3=[];page().BIO.grid(3,0,500,()=>1,(x,y,z)=>n3.push([x]),{center:[310,0],box:[200,-100,420,100],cliff:'gate'});
 ok(n3.length>500&&onWall(n3)===0,'7: opt.cliff \'gate\' gates one numeric pass');
 const s=[];page({host:{cliffGate:true}}).BIO.scatter(300,0,60,1,(x,y,z)=>s.push([x]),{center:[312,0]});
 ok(onWall(s)===0&&s.length>50,'7: scatter is gated under cliffGate ('+s.length+')');}
{const B=page().BIO,mat=new THREE.MeshBasicMaterial(),geo=new THREE.PlaneGeometry(1,1);
 B.def('fern',geo,mat);B.def('lichen',geo,mat,{cliff:true});B.def('moss',geo,mat);
 B.grid('fern',4,()=>1,(x,y,z)=>B.put('fern',[x,y,z],null,1),{box:[200,-60,420,60]});
 B.grid('lichen',4,()=>1,(x,y,z)=>B.put('lichen',[x,y,z],null,1),{box:[200,-60,420,60],cliff:true});
 B.put('moss',[312,H(312,0)+40,0],null,1);   /* not rooted: hung 40 m up the face */
 B.bake();let r=B.cliffCheck({R:500});
 ok(r.ok&&r.checked>1000&&r.control&&r.control.flagged,'7: cliffCheck passes a gated page, its control on the face flagged ('+r.checked+' checked)');
 r=B.cliffCheck({R:500,points:[{x:312,z:0,label:'tree 7'}]});ok(!r.ok&&r.bad[0].item==='tree 7','7: the kit\'s own records (opt.points) are checked');
 const C=page().BIO;C.def('fern',geo,mat);C.grid(3,0,500,()=>1,(x,y,z)=>C.put('fern',[x,y,z],null,1),{center:[310,0],box:[200,-60,420,60]});C.bake();
 r=C.cliffCheck({R:500});ok(!r.ok&&r.bad[0]&&r.bad[0].item==='fern'&&r.bad[0].n>50,'7 negative: an ungated pass on the wall fails cliffCheck ('+(r.bad[0]?r.bad[0].n:0)+')');
 const L=page().BIO;L.def('fern',geo,mat);L.cliffItem('fern');L.grid(3,0,500,()=>1,(x,y,z)=>L.put('fern',[x,y,z],null,1),{center:[310,0],box:[200,-60,420,60]});L.bake();
 ok(L.cliffCheck({R:500}).ok,'7: BIO.cliffItem marks an item that belongs on faces');
 r=page({host:{terrainH:(x,z)=>0}}).BIO.cliffCheck({R:300});ok(r.ok&&r.control===null,'7: a map with no cliff: no control, nothing to fail');}

// ---------------------------------------------------------------- 3c: the instance cap
{const W=page(),warns=[],cw=console.warn;console.warn=m=>warns.push(m);try{W.BIO.CAP=5;W.BIO.def('w',new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial());for(let i=0;i<9;i++)W.BIO.put('w',[0,0,0],null,1);}finally{console.warn=cw;}
 ok(warns.length===1&&!W.errs.length&&W.BIO.capReport().length===1,'3c: by default a console warning and capReport, no BIO.err (an old page still passes verify)');}
{const P=page({host:{capErr:true}}),B=P.BIO,mat=new THREE.MeshBasicMaterial(),geo=new THREE.PlaneGeometry(1,1);B.CAP=100;
 B.def('lily',geo,mat);B.def('grass',geo,mat,{cap:1000,capWhy:'a lawn'});B.def('reed',geo,mat,{cap:1000});
 B.cur='floor';for(let i=0;i<150;i++){B.put('lily',[i,0,0],null,1);B.put('grass',[i,0,1],null,1);}
 const e=P.errs.filter(m=>/instance cap/.test(m)),r=B.capReport();
 ok(e.length===1&&/lily/.test(e[0])&&/floor/.test(e[0]),'3c: capErr: one BIO.err at the first put over the cap, naming the item and the pass');
 ok(r.length===1&&r[0].item==='lily'&&r[0].count===150&&r[0].cap===100,'3c: capReport names it with its count');
 ok(B.items.lily.count===150,'3c: the item still draws every instance (no look change)');
 ok(P.errs.some(m=>/reed.*no capWhy/.test(m)),'3c: a cap with no capWhy is reported');
 const Q=page({host:{capThrow:true}});Q.BIO.CAP=10;Q.BIO.def('x',geo,mat);let threw=0;try{for(let i=0;i<20;i++)Q.BIO.put('x',[0,0,0],null,1);}catch(err){threw=1;}
 ok(threw,'3c: capThrow throws at the first put over');
 const R=page().BIO;R.CAP=100;R.def('y',geo,mat);for(let i=0;i<60;i++)R.put('y',[0,0,0],null,1);R.bake();for(let i=0;i<60;i++)R.put('y',[0,0,0],null,1);
 ok(R.capReport().length===1,'3c: counted across bakes');
 const S=page();S.BIO.def('z',geo,mat);for(let i=0;i<1000;i++)S.BIO.put('z',[0,0,0],null,1);ok(!S.BIO.capReport().length&&!S.errs.length,'3c negative: under the default cap, nothing');}

// ---------------------------------------------------------------- 6: probe points from the drawers
{const B=page().BIO,mat=new THREE.MeshLambertMaterial();B.bucket('bark',mat);
 B.tube('bark',[{x:500,y:0,z:500,r:.6},{x:500,y:12,z:500,r:.4}],0x664422,{seg:8});
 B.tube('bark',[{x:-500,y:0,z:-500,r:.6},{x:-500,y:12,z:-500,r:.4}],0x664422,{seg:8});
 B.bake();const m=B.baked.find(o=>o.name==='biome:bark'),pp=m&&m.userData.probePoints;
 ok(pp&&ArrayBuffer.isView(pp)&&pp.BYTES_PER_ELEMENT===4&&pp.length%3===0&&m.userData.probeDrawer==='BIO.bucket:bark','6: a bucket mesh carries flat probePoints and its drawer');
 const inVol=v=>{let n=0;for(let i=0;i<pp.length;i+=3){const dx=pp[i]-v.x,dz=pp[i+2]-v.z;if(dx*dx+dz*dz<=v.r*v.r&&pp[i+1]>=v.y-2&&pp[i+1]<=v.y+v.h+5)n++;}return n;};
 ok(inVol({x:500,y:0,z:500,r:2,h:12})>0&&inVol({x:-500,y:0,z:-500,r:2,h:12})>0,'6: each trunk\'s volume holds points ('+pp.length/3+' points for '+m.userData.tris+' triangles)');
 const bc=new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
 ok(Math.hypot(bc.x-500,bc.z-500)>2&&Math.hypot(bc.x+500,bc.z+500)>2,'6 negative: the box centre alone reads both volumes empty');
 ok(inVol({x:0,y:0,z:0,r:50,h:20})===0,'6 negative: an empty volume reads empty');
 const Q=page().BIO;Q.PROBE_CELL=0;Q.bucket('bark',mat);Q.tube('bark',[{x:0,y:0,z:0,r:.5},{x:0,y:5,z:0,r:.5}],0x664422);Q.bake();
 ok(!Q.baked[0].userData.probePoints,'6: BIO.PROBE_CELL 0 turns it off');}
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
