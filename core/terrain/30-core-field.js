// ================================================================= CORE — the terrain field (a baked heightmap)
// The ground as DATA: a Float32 heightmap in metres on a regular grid, named water surfaces on the same lattice, and
// an optional land-cover byte grid. A world bakes its terrainH(x,z) closure onto it once (KFIELD.bake) and from then
// on reads the field, so the ground the page plants on is the ground Godot draws and collides with (f.export() is the
// krator-field file; core/terrain/kfield.gd reads it and samples it with the same arithmetic). GODOT-PLAN.md Phase 2
// item 2. No THREE, no DOM, no Math.random: [G data].
//
// Axes: metres, +y up, x east, z south. Grid point (i,j) is at x = x0 + i*step, z = z0 + j*step; heights[j*nx + i].
//
//   KFIELD.create({x0, z0, step, nx, nz, heights?, water?, cover?, coverNames?, name?})   -> a field (heights zero)
//   KFIELD.bake(fn, box:[x0,z0,x1,z1], step, opt?)  -> a field: fn(x,z) at every grid point; the grid starts at the box's
//        corner and runs to its far edge (rounded up to a whole step). opt.name; opt.water: {name: (x,z)=>y or NaN}
//        bakes each water surface where fn(x,z) is a number (a function returning a non-finite value is dry there);
//        opt.waterBox: {name: [x0,z0,x1,z1]} bakes that surface only inside its box (a river's strip, a pond);
//        opt.insets: [{box, step, name}] bakes a finer field over each box (snapped out to the base lattice): where a
//        world draws its ground finer than the base step (a cliff, a cave mouth) the inset carries it
//   KFIELD.load(json)    -> a field from its export (or from the krator-field object itself)
//   f.h(x,z)             bilinear height, clamped at the grid's edges (the arithmetic order is fixed; kfield.gd repeats it)
//   f.insets             finer fields over windows of this one; h reads the first inset whose grid holds (x,z), edges
//                        included, else the base. f.addInset(g) checks g lies inside the base
//   f.normal(x,z)        the unit normal [nx,ny,nz] from central differences of h one step either side
//   f.sampler()          (x,z)=>f.h(x,z), to hand a world as its terrainH
//   f.at(i,j)            the stored height at a grid point (indices clamped)
//   f.water              {name: {level} | {i0,j0,nx,nz,heights}}: a flat level everywhere, or a surface on a window of
//                        the lattice (NaN where dry)
//   f.waterAt(name,x,z)  that surface's height, or KFIELD.DRY (-1e9) where it is dry: bilinear where all four corners are
//                        wet, else the nearest corner's value
//   f.waterH(x,z)        the highest wet surface, or KFIELD.DRY
//   f.cover              a Uint8Array on the grid (or null) and f.coverNames its legend; f.coverAt(x,z): the nearest point's
//   f.min, f.max         over the heights
//   f.export(opt?)       {format:'krator-field', version:1, convention, x0,z0,step,nx,nz, min,max, heights: base64 of
//                        little-endian Float32, water, cover?}. opt.box:[x0,z0,x1,z1] crops to the grid points that
//                        cover the box (one lattice point beyond each edge where there is one): the lattice is not moved;
//                        each inset that meets the box rides along as insets: [krator-field, ...], cropped the same way
//   KFIELD.b64(typed) / KFIELD.unb64(str, Type)   base64 of a typed array's bytes, little-endian
(function(root){
'use strict';
const DRY=-1e9;
const LE=new Uint8Array(new Uint16Array([1]).buffer)[0]===1;
function bytesOf(a){const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);if(LE)return u;
 const o=new Uint8Array(u.length),w=a.BYTES_PER_ELEMENT;for(let i=0;i<u.length;i+=w)for(let k=0;k<w;k++)o[i+k]=u[i+w-1-k];return o;}
function b64(a){const u=bytesOf(a);
 if(typeof Buffer!=='undefined')return Buffer.from(u.buffer,u.byteOffset,u.byteLength).toString('base64');
 let s='';const K=0x8000;for(let i=0;i<u.length;i+=K)s+=String.fromCharCode.apply(null,u.subarray(i,i+K));return btoa(s);}
function unb64(s,T){let u;
 if(typeof Buffer!=='undefined'){const b=Buffer.from(s,'base64');u=new Uint8Array(b.length);u.set(b);}
 else{const t=atob(s);u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);}
 const w=T.BYTES_PER_ELEMENT;if(!LE)for(let i=0;i<u.length;i+=w)for(let k=0;k<w>>1;k++){const c=u[i+k];u[i+k]=u[i+w-1-k];u[i+w-1-k]=c;}
 return new T(u.buffer,0,u.length/w);}
const CONVENTION={units:'metres',up:'+y',x:'east',z:'south',grid:'row j is z0 + j*step, column i is x0 + i*step; heights[j*nx + i]',
 sample:'bilinear, clamped at the edges: u=(x-x0)/step, i=floor(u) (at most nx-2), a+(b-a)*fu along x, then along z'};

// the bilinear sample of a grid H (nx by nz) at lattice coordinates (u,v). THE ORDER IS THE CONTRACT: kfield.gd's
// _bilinear repeats it operation for operation so the two engines agree to the last bit on the same float32 data
function bilinear(H,nx,nz,u,v){
 if(u<0)u=0;else if(u>nx-1)u=nx-1;
 if(v<0)v=0;else if(v>nz-1)v=nz-1;
 let i=Math.floor(u),j=Math.floor(v);
 if(i>nx-2)i=nx-2;if(i<0)i=0;
 if(j>nz-2)j=nz-2;if(j<0)j=0;
 const fu=u-i,fv=v-j,k=j*nx+i;
 const i1=nx>1?1:0,j1=nz>1?nx:0;
 const a=H[k],b=H[k+i1],c=H[k+j1],d=H[k+j1+i1];
 const top=a+(b-a)*fu,bot=c+(d-c)*fu;
 return top+(bot-top)*fv;}

function makeField(o){
 for(const k of ['x0','z0','step','nx','nz'])if(!(typeof o[k]==='number'&&isFinite(o[k])))throw new Error('KFIELD: '+k+' must be a finite number');
 const nx=o.nx|0,nz=o.nz|0,step=+o.step;
 if(nx<1||nz<1||nx!==o.nx||nz!==o.nz)throw new Error('KFIELD: nx and nz must be whole numbers of at least 1');
 if(!(step>0))throw new Error('KFIELD: step must be positive');
 const H=o.heights?(o.heights instanceof Float32Array?o.heights:Float32Array.from(o.heights)):new Float32Array(nx*nz);
 if(H.length!==nx*nz)throw new Error('KFIELD: heights holds '+H.length+' values, the grid '+(nx*nz));
 const f={name:o.name||'',x0:+o.x0,z0:+o.z0,step,nx,nz,heights:H,water:{},cover:null,coverNames:o.coverNames||null};
 const x0=f.x0,z0=f.z0;
 const IN=[];f.insets=IN;
 const base=(x,z)=>bilinear(H,nx,nz,(x-x0)/step,(z-z0)/step);
 f.h=(x,z)=>{for(let k=0;k<IN.length;k++){const g=IN[k];if(x>=g.x0&&z>=g.z0&&x<=g.x1&&z<=g.z1)return g.h(x,z);}return base(x,z);};
 f.addInset=(g)=>{const b=g.box(),B=[x0,z0,x0+(nx-1)*step,z0+(nz-1)*step],e=1e-6*step;
  if(b[0]<B[0]-e||b[1]<B[1]-e||b[2]>B[2]+e||b[3]>B[3]+e)throw new Error('KFIELD.addInset: the inset ['+b+'] is not inside the field ['+B+']');
  g.x1=b[2];g.z1=b[3];IN.push(g);return f;};
 f.sampler=()=>f.h;
 f.at=(i,j)=>{i=i<0?0:i>nx-1?nx-1:i|0;j=j<0?0:j>nz-1?nz-1:j|0;return H[j*nx+i];};
 f.normal=(x,z)=>{const s=step,ex=f.h(x-s,z)-f.h(x+s,z),ez=f.h(x,z-s)-f.h(x,z+s),ey=2*s,l=Math.sqrt(ex*ex+ey*ey+ez*ez);return[ex/l,ey/l,ez/l];};
 f.box=()=>[x0,z0,x0+(nx-1)*step,z0+(nz-1)*step];
 f.stats=()=>{let mn=Infinity,mx=-Infinity;for(let i=0;i<H.length;i++){const v=H[i];if(v<mn)mn=v;if(v>mx)mx=v;}f.min=mn;f.max=mx;return{min:mn,max:mx};};
 // water: a level everywhere, or a surface on a window of the lattice (NaN where dry)
 f.setWater=(name,w)=>{if(typeof w==='number')w={level:w};
  if(w.level!==undefined){if(!isFinite(w.level))throw new Error('KFIELD water '+name+': level must be finite');f.water[name]={level:+w.level};return f;}
  const W={i0:w.i0|0,j0:w.j0|0,nx:w.nx|0,nz:w.nz|0,heights:w.heights instanceof Float32Array?w.heights:Float32Array.from(w.heights)};
  if(W.nx<1||W.nz<1||W.i0<0||W.j0<0||W.i0+W.nx>nx||W.j0+W.nz>nz)throw new Error('KFIELD water '+name+': its window is outside the grid');
  if(W.heights.length!==W.nx*W.nz)throw new Error('KFIELD water '+name+': heights holds '+W.heights.length+', the window '+(W.nx*W.nz));
  f.water[name]=W;return f;};
 f.waterAt=(name,x,z)=>{const W=f.water[name];if(!W)return DRY;if(W.level!==undefined)return W.level;
  const u=(x-x0)/step-W.i0,v=(z-z0)/step-W.j0;
  if(u<-.5||v<-.5||u>W.nx-.5||v>W.nz-.5)return DRY;
  const A=W.heights,cu=u<0?0:u>W.nx-1?W.nx-1:u,cv=v<0?0:v>W.nz-1?W.nz-1:v;
  let i=Math.floor(cu),j=Math.floor(cv);if(i>W.nx-2)i=W.nx-2;if(i<0)i=0;if(j>W.nz-2)j=W.nz-2;if(j<0)j=0;
  const i1=W.nx>1?1:0,j1=W.nz>1?W.nx:0,k=j*W.nx+i,a=A[k],b=A[k+i1],c=A[k+j1],d=A[k+j1+i1];
  if(a===a&&b===b&&c===c&&d===d)return bilinear(A,W.nx,W.nz,u,v);
  const r=Math.round(cu),s=Math.round(cv),n=A[s*W.nx+r];return n===n?n:DRY;};
 f.waterH=(x,z)=>{let best=DRY;for(const k in f.water){const y=f.waterAt(k,x,z);if(y>best)best=y;}return best;};
 f.setCover=(bytes,names)=>{const C=bytes instanceof Uint8Array?bytes:Uint8Array.from(bytes);if(C.length!==nx*nz)throw new Error('KFIELD cover: '+C.length+' values, the grid '+(nx*nz));
  f.cover=C;if(names)f.coverNames=names;return f;};
 f.coverAt=(x,z)=>{if(!f.cover)return 0;let i=Math.round((x-x0)/step),j=Math.round((z-z0)/step);i=i<0?0:i>nx-1?nx-1:i;j=j<0?0:j>nz-1?nz-1:j;return f.cover[j*nx+i];};
 // the krator-field object; opt.box crops to the lattice points covering the box (the lattice does not move)
 f.export=(opt)=>{opt=opt||{};let i0=0,j0=0,i1=nx-1,j1=nz-1;
  if(opt.box){const b=opt.box;i0=Math.max(0,Math.floor((b[0]-x0)/step));j0=Math.max(0,Math.floor((b[1]-z0)/step));
   i1=Math.min(nx-1,Math.ceil((b[2]-x0)/step));j1=Math.min(nz-1,Math.ceil((b[3]-z0)/step));
   if(i1<i0||j1<j0)throw new Error('KFIELD.export: the box misses the field');}
  const cx=i1-i0+1,cz=j1-j0+1,crop=(A,T,w,ox,oy)=>{const o=new T(cx*cz);for(let j=0;j<cz;j++)for(let i=0;i<cx;i++)o[j*cx+i]=A[(j+j0-oy)*w+(i+i0-ox)];return o;};
  const Hc=(i0===0&&j0===0&&cx===nx&&cz===nz)?H:crop(H,Float32Array,nx,0,0);
  let mn=Infinity,mx=-Infinity;for(let i=0;i<Hc.length;i++){const v=Hc[i];if(v<mn)mn=v;if(v>mx)mx=v;}
  const water={};for(const k in f.water){const W=f.water[k];if(W.level!==undefined){water[k]={level:W.level};continue;}
   const a0=Math.max(i0,W.i0),b0=Math.max(j0,W.j0),a1=Math.min(i1,W.i0+W.nx-1),b1=Math.min(j1,W.j0+W.nz-1);if(a1<a0||b1<b0)continue;
   const wx=a1-a0+1,wz=b1-b0+1,o=new Float32Array(wx*wz);for(let j=0;j<wz;j++)for(let i=0;i<wx;i++)o[j*wx+i]=W.heights[(j+b0-W.j0)*W.nx+(i+a0-W.i0)];
   water[k]={i0:a0-i0,j0:b0-j0,nx:wx,nz:wz,heights:b64(o)};}
  const out={format:'krator-field',version:1,convention:CONVENTION,name:f.name,x0:x0+i0*step,z0:z0+j0*step,step,nx:cx,nz:cz,min:mn,max:mx,
   heights:b64(Hc),water};
  if(f.cover){out.cover=b64(crop(f.cover,Uint8Array,nx,0,0));if(f.coverNames)out.coverNames=f.coverNames;}
  if(IN.length){const bx=opt.box||f.box(),ins=[];
   for(const g of IN){if(g.x1<bx[0]||g.z1<bx[1]||g.x0>bx[2]||g.z0>bx[3])continue;
    ins.push(g.export({box:[Math.max(bx[0],g.x0),Math.max(bx[1],g.z0),Math.min(bx[2],g.x1),Math.min(bx[3],g.z1)]}));}
   if(ins.length)out.insets=ins;}
  return out;};
 if(o.water)for(const k in o.water)f.setWater(k,o.water[k]);
 if(o.cover)f.setCover(o.cover,o.coverNames);
 f.stats();
 return f;}

const KFIELD={DRY,b64,unb64,bilinear,CONVENTION,
 create:makeField,
 bake(fn,box,step,opt){opt=opt||{};if(!box||box.length!==4)throw new Error('KFIELD.bake: box is [x0,z0,x1,z1]');
  if(!(step>0))throw new Error('KFIELD.bake: step must be positive');
  const x0=box[0],z0=box[1],nx=Math.ceil((box[2]-x0)/step-1e-9)+1,nz=Math.ceil((box[3]-z0)/step-1e-9)+1,H=new Float32Array(nx*nz);
  for(let j=0;j<nz;j++){const z=z0+j*step;for(let i=0;i<nx;i++){const y=fn(x0+i*step,z);if(!isFinite(y))throw new Error('KFIELD.bake: terrainH('+(x0+i*step)+','+z+') is '+y);H[j*nx+i]=y;}}
  const f=makeField({x0,z0,step,nx,nz,heights:H,name:opt.name});
  if(opt.water)for(const k in opt.water){const wf=opt.water[k];
   if(typeof wf==='number'){f.setWater(k,wf);continue;}
   const wb=(opt.waterBox&&opt.waterBox[k])||[x0,z0,x0+(nx-1)*step,z0+(nz-1)*step];
   const i0=Math.max(0,Math.floor((wb[0]-x0)/step)),j0=Math.max(0,Math.floor((wb[1]-z0)/step)),i1=Math.min(nx-1,Math.ceil((wb[2]-x0)/step)),j1=Math.min(nz-1,Math.ceil((wb[3]-z0)/step));
   const wx=i1-i0+1,wz=j1-j0+1,W=new Float32Array(wx*wz);
   for(let j=0;j<wz;j++)for(let i=0;i<wx;i++){const y=wf(x0+(i+i0)*step,z0+(j+j0)*step);W[j*wx+i]=(typeof y==='number'&&isFinite(y)&&y>DRY*.5)?y:NaN;}
   f.setWater(k,{i0,j0,nx:wx,nz:wz,heights:W});}
  for(const q of (opt.insets||[])){const b=q.box,I0=Math.max(0,Math.floor((b[0]-x0)/step+1e-9)),J0=Math.max(0,Math.floor((b[1]-z0)/step+1e-9)),
    I1=Math.min(nx-1,Math.ceil((b[2]-x0)/step-1e-9)),J1=Math.min(nz-1,Math.ceil((b[3]-z0)/step-1e-9));
   if(!(q.step>0&&q.step<step))throw new Error('KFIELD.bake: an inset\'s step must be finer than the base\'s');
   f.addInset(KFIELD.bake(fn,[x0+I0*step,z0+J0*step,x0+I1*step,z0+J1*step],q.step,{name:q.name||'inset'}));}
  return f;},
 load(j){if(typeof j==='string')j=JSON.parse(j);
  if(!j||j.format!=='krator-field')throw new Error('KFIELD.load: not a krator-field');
  if(j.version!==1)throw new Error('KFIELD.load: version '+j.version+' (this reads 1)');
  const H=typeof j.heights==='string'?unb64(j.heights,Float32Array):Float32Array.from(j.heights);
  const f=makeField({x0:j.x0,z0:j.z0,step:j.step,nx:j.nx,nz:j.nz,heights:H,name:j.name});
  for(const k in (j.water||{})){const w=j.water[k];if(w.level!==undefined)f.setWater(k,w.level);
   else f.setWater(k,{i0:w.i0,j0:w.j0,nx:w.nx,nz:w.nz,heights:typeof w.heights==='string'?unb64(w.heights,Float32Array):w.heights});}
  if(j.cover)f.setCover(typeof j.cover==='string'?unb64(j.cover,Uint8Array):j.cover,j.coverNames);
  for(const g of (j.insets||[]))f.addInset(KFIELD.load(g));
  return f;}};
root.KFIELD=KFIELD;
if(typeof module!=='undefined'&&module.exports)module.exports=KFIELD;
})(typeof window!=='undefined'?window:globalThis);
