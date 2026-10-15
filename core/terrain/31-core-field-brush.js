// ================================================================= CORE — the terrain field's brushes (ground edits)
// [G data] Ground brushes on a KFIELD (30-core-field.js): ROADMAP.md section 10, step 4 ("ground brushes on KFIELD"). A stroke
// is plain data, {x, z, r, mode, strength, y?}, and applying it writes the field's heights (the base grid and every inset
// whose grid it reaches) in a fixed order, so the same strokes in the same order give the same ground in the browser and in
// Godot. core/host's editor records each stroke as a core/edits ADD of a {class:'feature', kind:'ground'} record; undoing
// one replays the others from the field as baked (strokes do not commute). No THREE, no DOM, no Math.random.
//
//   KFIELD.stroke(f, s) -> [x0, z0, x1, z1]   apply one stroke; returns the box it may have changed (empty: null)
//     s.mode      'raise' | 'lower': up or down by `strength` metres at the centre, falling to 0 at r
//                 'flatten': towards s.y (default the height at the centre) by `strength` (0..1) at the centre
//                 'smooth': towards the mean of each point's four neighbours by `strength` (0..1) at the centre
//     falloff     w = (1 - (d/r)^2)^2 inside r, 0 outside: smooth to the edge, so a stroke leaves no step
//   KFIELD.snapshot(f) -> snap             the heights as they are (the base and each inset), to replay from
//   KFIELD.restore(f, snap)                put them back
//   KFIELD.replay(f, snap, strokes)        restore, then apply each stroke in order; returns the union box
//   KFIELD.strokeOf(rec)                   a stroke from an edit record ({key: mode, at:[x,y,z], r, strength, y?})
(function(root){
'use strict';
const K=root.KFIELD;if(!K)throw new Error('31-core-field-brush: load 30-core-field.js first');
const MODES={raise:1,lower:1,flatten:1,smooth:1};
function grids(f){return [f].concat(f.insets||[]);}
function boxOf(g){return [g.x0,g.z0,g.x0+(g.nx-1)*g.step,g.z0+(g.nz-1)*g.step];}
// one grid: the points within r of the centre, in row order; smooth reads the grid as it was before this stroke
function paint(g,s,y0){const r=s.r,r2=r*r,st=g.step,H=g.heights,nx=g.nx,nz=g.nz;
 const i0=Math.max(0,Math.ceil((s.x-r-g.x0)/st)),i1=Math.min(nx-1,Math.floor((s.x+r-g.x0)/st));
 const j0=Math.max(0,Math.ceil((s.z-r-g.z0)/st)),j1=Math.min(nz-1,Math.floor((s.z+r-g.z0)/st));
 if(i0>i1||j0>j1)return false;
 const src=s.mode==='smooth'?H.slice():null,at=(i,j)=>src[Math.min(nz-1,Math.max(0,j))*nx+Math.min(nx-1,Math.max(0,i))];
 let any=false;
 for(let j=j0;j<=j1;j++){const z=g.z0+j*st,dz=z-s.z;
  for(let i=i0;i<=i1;i++){const x=g.x0+i*st,dx=x-s.x,d2=dx*dx+dz*dz;if(d2>=r2)continue;
   const q=1-d2/r2,w=q*q,k=j*nx+i;let v=H[k];
   if(s.mode==='raise')v+=s.strength*w;
   else if(s.mode==='lower')v-=s.strength*w;
   else if(s.mode==='flatten')v+=(y0-v)*Math.min(1,s.strength*w);
   else{const m=(at(i-1,j)+at(i+1,j)+at(i,j-1)+at(i,j+1))/4;v+=(m-v)*Math.min(1,s.strength*w);}
   H[k]=v;any=true;}}
 return any;}
K.stroke=function(f,s){
 if(!s||!MODES[s.mode])throw new Error('KFIELD.stroke: mode must be raise, lower, flatten or smooth');
 if(!(s.r>0)||!isFinite(s.x)||!isFinite(s.z))throw new Error('KFIELD.stroke: a stroke needs x, z and r > 0');
 if(!isFinite(s.strength))throw new Error('KFIELD.stroke: a stroke needs a strength');
 const y0=s.mode==='flatten'?(s.y==null?f.h(s.x,s.z):+s.y):0;   // read once, before anything moves
 let any=false;for(const g of grids(f)){const b=boxOf(g);if(s.x+s.r<b[0]||s.x-s.r>b[2]||s.z+s.r<b[1]||s.z-s.r>b[3])continue;if(paint(g,s,y0))any=true;}
 if(!any)return null;
 for(const g of grids(f))if(g.stats)g.stats();
 return [s.x-s.r,s.z-s.r,s.x+s.r,s.z+s.r];};
K.snapshot=function(f){return grids(f).map(g=>g.heights.slice());};
K.restore=function(f,snap){const G=grids(f);if(snap.length!==G.length)throw new Error('KFIELD.restore: the snapshot has '+snap.length+' grids, the field '+G.length);
 G.forEach((g,k)=>{g.heights.set(snap[k]);if(g.stats)g.stats();});};
K.replay=function(f,snap,strokes){K.restore(f,snap);let u=null;
 for(const s of strokes){const b=K.stroke(f,s);if(b)u=u?[Math.min(u[0],b[0]),Math.min(u[1],b[1]),Math.max(u[2],b[2]),Math.max(u[3],b[3])]:b;}
 return u;};
K.strokeOf=function(rec){return {mode:rec.key,x:+rec.at[0],z:+rec.at[2],r:+rec.r,strength:+rec.strength,y:rec.y==null?null:+rec.y};};
})(typeof window!=='undefined'?window:globalThis);
