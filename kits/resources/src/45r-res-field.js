// prefix: res
// ================================================================= THE NODE FIELD: resource nodes over the whole world, by cell
// kits/resources/PLACEMENT-RESEARCH.md features 1-3; GEOLOGY.md is the data's format. [G data]: no three.js, no DOM; Godot
// runs the same integers (core/rand's krand.gd). The scale model's geology is baked offline (tools/scale-model/geology.py)
// into kits/resources/data/geology.json: per ~4 km cell a province byte, a mask byte and one prospectivity byte (0-255)
// per family. Here every family's placement cell (FIELD.cells, m) takes at most one candidate, seeded by
// KRAND.cell(KRAND.child(world, 'res:' + family), ix, iz), so any tile builds alone, in any order, in either engine:
//   draws  hash(s,2), hash(s,3): the position, jittered inside the cell less an inset each side (a spacing of 2 x inset x
//          cell with no neighbour reads); hash(s,1): KEPT when floor(unit x 255) < the prospectivity of the data cell the
//          position falls in (nearest cell: nothing interpolated); hash(s,4): the grade, tilted up by the prospectivity
//   drop   a kept candidate on water or a cliff is DROPPED, never re-rolled: the host's ground(x, z) says
//          ({water, slope}), else the baked mask's water and cliff bits
//   ids    'res:<family>:<ix>:<iz>'; the baked placers (gold, tin carried down the rivers) 'res:placer-<family>:<river>:<k>'
//   owner  owner-placed nodes ({id, kind, grade, x, z}) replace the field's node of the same id, or add one; a delta by id
//          ({grade?, x?, z?, removed?}) edits or removes a field node (core/edits' ops map onto both)
// World frame: metres from the scale model's top-left, x east, z south: x = map px x 2000, z = map py x 2000 (the full grid,
// 2 km a px). A host in a local frame (an open world's region: x = (px - cx) x 2000) passes origin {x: cx*2000, z: cy*2000}
// and gets local x, z (gx, gz stay global).
//   RES_GEO.load(data)                 the baked data (RES_GEODATA on a page; the JSON in node or Godot); decodes lazily
//   RES_GEO.cellOf(gx, gz)             {i, j} of the data cell, or null off the grid
//   RES_GEO.at(gx, gz)                 {province, ruin, mask, p: {family: byte}} or null
//   RES_GEO.prospect(family, gx, gz)   the family's byte there (0 off the grid)
//   RES_GEO.candidate(family, ix, iz, o)   the one candidate of a cell: {id, kind, grade, gx, gz, p, kept, drop}
//   RES_GEO.nodesIn(tile, o)           tile {x0, z0, x1, z1} in the host's frame (global unless o.origin): every node
//                                      whose position lies in [x0, x1) x [z0, z1), placers and owner nodes included;
//                                      o: {families, world, origin, ground(x, z), maxSlope (0.7), owner: [...], deltas:
//                                      {id: {...}}, placers (true), stats ({} to receive kept/dropped counts)}
//   RES_GEO.near(x, z, kind, r, o)     the nodes of a kind within r of (x, z), nearest first (a tie: the higher grade)
//   RES_GEO.register(T, nodes, o)      registers each node in core/tags (class prop, kind res-node, key node-<kind>-<grade>,
//                                      its own id), y from o.height(x, z); returns the records. Register before drawing.
// Also globalThis.KRES (the same object).
const RES_GEO=(function(){
 const GR={low:0,medium:1,high:2};
 let D=null,L={},N=0,W=0,H=0,SU=0,SV=0;
 /* base64 by hand (no atob, no Buffer: the same few lines in GDScript, or Marshalls.base64_to_raw) */
 const B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',B64I=new Int16Array(128).fill(-1);
 for(let i=0;i<64;i++)B64I[B64.charCodeAt(i)]=i;
 function b64(s){let n=s.length;while(n&&s[n-1]==='=')n--;const o=new Uint8Array(Math.floor(n*3/4));let a=0,bits=0,k=0;
  for(let i=0;i<n;i++){a=(a<<6)|B64I[s.charCodeAt(i)];bits+=6;if(bits>=8){bits-=8;o[k++]=(a>>bits)&255;}}return o;}
 function unrle(s){const b=b64(s),o=new Uint8Array(N);let k=0;for(let i=0;i+1<b.length;i+=2){const r=b[i]+1,v=b[i+1];o.fill(v,k,k+r);k+=r;}
  if(k!==N)throw new Error('kits/resources: a geology layer decodes to '+k+' bytes, not '+N);return o;}
 function layer(k){if(!D)throw new Error('kits/resources: RES_GEO.load(data) first');if(!L[k]){if(!D.layers[k])return null;L[k]=unrle(D.layers[k]);}return L[k];}
 const G={};
 G.load=function(d){if(!d||d.format!=='krator-geology')throw new Error('kits/resources: not krator-geology data');
  D=d;L={};W=d.grid.w;H=d.grid.h;N=W*H;SU=(W-1)/(d.grid.fullW-1);SV=(H-1)/(d.grid.fullH-1);return G;};
 G.data=function(){return D;};
 G.cellOf=function(gx,gz){if(!D)return null;const i=Math.floor(gx/D.grid.px_m*SU+.5),j=Math.floor(gz/D.grid.px_m*SV+.5);
  return i<0||j<0||i>=W||j>=H?null:{i:i,j:j};};
 G.prospect=function(f,gx,gz){const c=G.cellOf(gx,gz),a=layer(f);return c&&a?a[c.j*W+c.i]:0;};
 G.at=function(gx,gz){const c=G.cellOf(gx,gz);if(!c)return null;const k=c.j*W+c.i,pr=layer('province')[k],p={};
  for(const f of D.families)p[f]=layer(f)[k];
  return {province:D.provinces[pr&127],ruin:(pr&D.ruinBit)>0,mask:layer('mask')[k],p:p};};
 function gradeOf(u,p){const g=D.field.grade,q=u*(1.15-g.tilt*p/255);return q<g.high?'high':q<g.medium?'medium':'low';}
 function dropOf(gx,gz,o){const X=gx-o.ox,Z=gz-o.oz;
  if(o.ground){const g=o.ground(X,Z);if(!g)return 'ground';if(g.water)return 'water';if(g.slope!=null&&g.slope>o.maxSlope)return 'cliff';return null;}
  const c=G.cellOf(gx,gz);if(!c)return 'off';const m=layer('mask')[c.j*W+c.i];return m&1?'water':m&2?'cliff':null;}
 function opts(o){o=o||{};return {world:o.world==null?D.field.world:o.world,ox:o.origin?o.origin.x:0,oz:o.origin?o.origin.z:0,
  ground:o.ground||null,maxSlope:o.maxSlope==null?.7:o.maxSlope};}
 const seeds={};
 function base(world,f){const k=world+':'+f;return seeds[k]!=null?seeds[k]:(seeds[k]=KRAND.child(world,'res:'+f));}
 G.candidate=function(f,ix,iz,o0){const o=o0&&o0.ox!=null?o0:opts(o0),C=D.field.cells[f],ins=D.field.inset;if(!C)return null;
  const s=KRAND.cell(base(o.world,f),ix,iz);
  const gx=(ix+ins+(1-2*ins)*KRAND.unit(KRAND.hash(s,2)))*C,gz=(iz+ins+(1-2*ins)*KRAND.unit(KRAND.hash(s,3)))*C;
  const p=G.prospect(f,gx,gz),kept=Math.floor(KRAND.unit(KRAND.hash(s,1))*255)<p;
  const r={id:'res:'+f+':'+ix+':'+iz,kind:f,grade:gradeOf(KRAND.unit(KRAND.hash(s,4)),p),gx:gx,gz:gz,p:p,kept:kept,drop:null,src:'field'};
  if(kept)r.drop=dropOf(gx,gz,o);return r;};
 function inTile(t,x,z){return x>=t.x0&&x<t.x1&&z>=t.z0&&z<t.z1;}
 G.nodesIn=function(tile,o0){const o=opts(o0),O=o0||{},st=O.stats||null,fams=O.families||D.field.families,out=[],dl=O.deltas||{};
  const gt={x0:tile.x0+o.ox,z0:tile.z0+o.oz,x1:tile.x1+o.ox,z1:tile.z1+o.oz},own={};
  (O.owner||[]).forEach(n=>{own[n.id]=n;});
  const put=(r)=>{const d=dl[r.id];if(d){if(d.removed)return;if(d.grade)r.grade=d.grade;if(d.x!=null){r.gx=d.x+o.ox;}if(d.z!=null){r.gz=d.z+o.oz;}r.edited=true;}
   if(own[r.id])return;r.x=r.gx-o.ox;r.z=r.gz-o.oz;out.push(r);};
  for(const f of fams){const C=D.field.cells[f];if(!C)continue;
   const i0=Math.floor(gt.x0/C),i1=Math.floor(gt.x1/C),j0=Math.floor(gt.z0/C),j1=Math.floor(gt.z1/C);
   for(let iz=j0;iz<=j1;iz++)for(let ix=i0;ix<=i1;ix++){const c=G.candidate(f,ix,iz,o);
    if(!c.kept||!inTile(gt,c.gx,c.gz))continue;
    if(c.drop){if(st)st[c.drop]=(st[c.drop]||0)+1;continue;}
    if(st)st.kept=(st.kept||0)+1;delete c.kept;delete c.drop;put(c);}}
  if(O.placers!==false)for(const p of D.placers){if(fams.indexOf(p.kind)<0||!inTile(gt,p.x,p.z))continue;
   const dr=dropOf(p.x,p.z,o);if(dr){if(st)st[dr]=(st[dr]||0)+1;continue;}
   put({id:p.id,kind:p.kind,grade:p.grade,gx:p.x,gz:p.z,p:G.prospect(p.kind,p.x,p.z),src:'placer',placer:true,river:p.river});}
  for(const n of O.owner||[]){if(dl[n.id]&&dl[n.id].removed)continue;if(!inTile(tile,n.x,n.z)||fams.indexOf(n.kind)<0)continue;
   out.push({id:n.id,kind:n.kind,grade:n.grade,x:n.x,z:n.z,gx:n.x+o.ox,gz:n.z+o.oz,p:G.prospect(n.kind,n.x+o.ox,n.z+o.oz),src:'owner'});}
  return out;};
 G.near=function(x,z,kind,r,o0){const O=Object.assign({},o0||{},{families:[kind]});
  const ns=G.nodesIn({x0:x-r,z0:z-r,x1:x+r,z1:z+r},O).map(n=>(n.dist=Math.hypot(n.x-x,n.z-z),n)).filter(n=>n.dist<=r);
  ns.sort((a,b)=>a.dist-b.dist||GR[b.grade]-GR[a.grade]||(a.id<b.id?-1:1));return ns;};
 G.register=function(T,nodes,o){o=o||{};return nodes.map(n=>{const K=RES_ORE.kinds[n.kind],Gd=RES_ORE.grades[n.grade];
  if(!K||!Gd)throw new Error('kits/resources: no node kind '+n.kind+' / grade '+n.grade);
  const y=o.height?o.height(n.x,n.z):0;
  return T.add({id:n.id,'class':'prop',kind:'res-node',key:resNodeKey(n.kind,n.grade),name:(K.name+', '+n.grade+' grade'+(n.placer?' (placer)':'')),
   at:[n.x,y,n.z],r:Gd.size*.85,h:Gd.size*.6,frag:'kits/resources/45r',
   tags:{culture:'generic',role:'resource node',rock:n.kind,level:n.grade,harvest:{item:K.item,efficiency:Gd.yield,works:K.works}}});});};
 return G;})();
globalThis.RES_GEO=RES_GEO;globalThis.KRES=RES_GEO;
if(typeof RES_GEODATA!=='undefined'&&RES_GEODATA)RES_GEO.load(RES_GEODATA);   /* the page's baked data (build.py: 45q-res-geodata.js) */
