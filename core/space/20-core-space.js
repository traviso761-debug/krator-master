// ================================================================= CORE — space: one spatial index (a uniform grid)
// [G data] Plain maths, no THREE, no DOM. The one spatial index the placement passes share (ROADMAP.md section 8,
// "One spatial index, not three"): the biome core's keep-clear and scatter read it today (core/biome/40-core-place.js);
// little-demo's flora buckets and core/city's footprint hash are to move onto it.
//
//   const S=KSPACE.create({cell:24})   a grid of square cells `cell` metres wide (a positive number; no default)
//   S.insert(item, x, z, r)            files item under every cell its square [x-r,x+r] x [z-r,z+r] touches
//                                      (r null means 0; below 0 files a point); returns its index (0, 1, 2...).
//                                      x, z and r are read as numbers (+x)
//   S.query(x, z, pad, out)            every item whose square, grown by pad, holds (x,z):
//                                        |x-ix| <= ir+pad  and  |z-iz| <= ir+pad
//                                      IN INSERTION ORDER (acceptance and the PRNG stream can depend on it), each
//                                      once. pad null means 0. `out`, if given, is emptied and filled (no allocation)
//   S.some(x, z, pad, fn)              fn(item) on query's items, in that order, until it returns true: true if it did
//   S.items, S.size()                  every item in insertion order; their count
//   S.clear()
//
// EXACT, not "a superset": query returns precisely what a linear scan of the items with the test above returns, in
// the same order (core/space/test-space.js proves it on random sets, items inserted after earlier queries included).
// A caller that wants discs tests them on what it gets back: a disc test (hypot < r+pad) passes only items the
// square test passes, so the answer is the scan's answer. Numbers that are not finite are kept and answer as the
// scan would (an item with a NaN coordinate is never returned; an infinite r covers everything finite); a cell range
// too wide for the grid (a huge r or pad, or a coordinate beyond 2^20 cells) is read by a scan instead.
// The index reads x, z and r once, at insert: an item moved later is not seen where it went (insert it again).
(function(root){
'use strict';
var LIM=1048576,      // cell indices stay inside +-2^20, so a key i*2^22+j is an exact integer and unique
    MUL=4194304,
    SPAN=64;          // an item covering more cells than this goes on the wide list every query reads
function slack(a,r){return 1e-9*(Math.abs(a)+r)+1e-6;}   // rounding room at the cell edges (only widens what is read)
function create(opt){
 var C=opt&&opt.cell;
 if(!(typeof C==='number'&&C>0&&isFinite(C)))throw new Error('KSPACE.create: cell must be a positive number of metres');
 var items=[],xs=[],zs=[],rs=[],seen=[],cells=new Map(),wide=[],tick=0,ids=[];
 function lo(a,r){return Math.floor((a-r-slack(a,r))/C);}
 function hi(a,r){return Math.floor((a+r+slack(a,r))/C);}
 function insert(item,x,z,r){
  x=+x;z=+z;r=r==null?0:+r;
  var id=items.length;items.push(item);xs.push(x);zs.push(z);rs.push(r);seen.push(0);
  var rr=r>0?r:0;
  if(!(isFinite(x)&&isFinite(z)&&isFinite(rr))){wide.push(id);return id;}
  var i0=lo(x,rr),i1=hi(x,rr),j0=lo(z,rr),j1=hi(z,rr);
  if(!(i0>-LIM&&i1<LIM&&j0>-LIM&&j1<LIM)||(i1-i0+1)*(j1-j0+1)>SPAN){wide.push(id);return id;}
  for(var i=i0;i<=i1;i++)for(var j=j0;j<=j1;j++){var k=i*MUL+j,b=cells.get(k);if(b===undefined)cells.set(k,b=[]);b.push(id);}
  return id;}
 function hit(id,x,z,pad){var e=rs[id]+pad;return Math.abs(x-xs[id])<=e&&Math.abs(z-zs[id])<=e;}
 function query(x,z,pad,out){
  x=+x;z=+z;pad=pad==null?0:+pad;
  if(out){out.length=0;}else out=[];
  var n=items.length;if(!n)return out;
  var p=pad>0?pad:0,i0,i1,j0,j1;
  var ok=isFinite(x)&&isFinite(z)&&isFinite(p);
  if(ok){i0=lo(x,p);i1=hi(x,p);j0=lo(z,p);j1=hi(z,p);
   ok=i0>-LIM&&i1<LIM&&j0>-LIM&&j1<LIM&&(i1-i0+1)*(j1-j0+1)<=n+16;}
  if(!ok){for(var q=0;q<n;q++)if(hit(q,x,z,pad))out.push(items[q]);return out;}   // the scan, in order
  var t=++tick,m=0,sorted=true,last=-1,id,b,k,i,j;
  ids.length=0;
  for(k=0;k<wide.length;k++){id=wide[k];seen[id]=t;if(hit(id,x,z,pad)){ids[m++]=id;last=id;}}
  for(i=i0;i<=i1;i++)for(j=j0;j<=j1;j++){b=cells.get(i*MUL+j);if(b===undefined)continue;
   for(k=0;k<b.length;k++){id=b[k];if(seen[id]===t)continue;seen[id]=t;
    if(hit(id,x,z,pad)){if(id<last)sorted=false;ids[m++]=id;last=id;}}}
  ids.length=m;if(!sorted)ids.sort(function(a,c){return a-c;});
  for(k=0;k<m;k++)out.push(items[ids[k]]);
  return out;}
 function some(x,z,pad,fn){var L=query(x,z,pad);for(var k=0;k<L.length;k++)if(fn(L[k]))return true;return false;}
 function clear(){items.length=0;xs.length=0;zs.length=0;rs.length=0;seen.length=0;wide.length=0;ids.length=0;cells.clear();}
 return {cell:C,insert:insert,query:query,some:some,items:items,size:function(){return items.length;},clear:clear};}
root.KSPACE={create:create,version:1};
})(typeof window!=='undefined'?window:globalThis);
