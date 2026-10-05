// ================================================================= YS CITY — the FOREIGN QUARTER: the foreign sets in the placer's slots (DESIGN §2, §6; PLAN P3)
// 88 reserved the quarter as PLACE.slots of kind 'foreign' ({foreign:'iziz'|'republic'|'voth', swap:[key globs], x,z,ry,
// w,d,y, box, block, standIn}) and drew a Hykkousoi house of the middle pool inside each until the sets landed. The sets
// are here now (build.py: the Iziz Vernacular dwellings and trade, the Highlands kit's Republican dwellings, the ported
// Voth embassy and the Historians' chapterhouse, and the Voth townhouses of 77-voth-townhouses.js), all on the one
// registry VERN (69c) that HL.def feeds too. This fragment runs in two steps:
//   AT LOAD (records only, before any draw: 88b's pass has not run yet): every foreign slot picks a builder whose
//   footprint fits its w x d within +1 m (turned 90° when that fits better, scaled .92 or .86 when nothing fits whole;
//   whole and unturned preferred), from a KRAND stream seeded by the slot's block cell and its index in the block, so
//   one block's edit moves nothing in another; the slot's stand-in record is spliced out of PLACE.blds and its box
//   freed (86-city-edits ysPlFree), so 88b never draws it; a slot nothing fits keeps its stand-in. The chapterhouse slot
//   takes the Historians' chapterhouse. The Voth embassy (36 x 34 m, bigger than any plot) finds its own ground in a
//   Voth block: a candidate box behind a lane, facing it, where the only things in the way are that lane's small
//   Hykkousoi houses (why 'foreign quarter lane'), which it replaces; the same search seats the chapterhouse in a
//   Republic block when 88 could not reserve its square.
//   IN THE DRAW PASS (a YS_BUILD hook after 88b's): VERN.place at (x, y, z) facing ry, the record's ground under it,
//   a stone pad 1.5 m deep under the footprint so a slope shows no gap under the base; every REG volume the builder made
//   is stamped culture:'iziz'|'republic'|'voth' (the chapterhouse 'historians'), type, wealth, decay 0, so the inspector
//   names it and tags-complete passes; the vern helpers' door marks (DOORS) become MARKS door records. No ROOM records
//   (DESIGN §7, a known gap). The accounting: TSTAT 'foreign:<culture>' per building (93z BUDGET.type).
//   BEFORE THE BAKE (kbake wrapped): the kit instances this pass put down are taken out of KIT.items and merged into
//   one world-space mesh per material, vertex-coloured, so 128 buildings over three kits cost ~25 draw calls, not one
//   InstancedMesh per kit item (the kit's own bake draws the rest as before). FURNISH (the Highlands kit's furniture
//   from the master catalog) is not vendored: the stub below counts the calls and places nothing.
const YS_FQ={SEED:KRAND.child(PLACE.SEED,'foreign'),n:0,estDoors:0,filled:0,kept:0,byCulture:{},byKey:{},embassy:null,chapterhouse:null,furnish:{},items:{},dropped:0,lanesCleared:0,merge:null};
const YS_FQ_LABEL={iziz:'Iziz',republic:'Republican',voth:'Voth',historians:'Historians\''};
const YS_FQ_PAD={iziz:0x9a8468,republic:0x7e776c,voth:0x6e6a62,historians:0xb08860};   // the pad under each: sandstone, fieldstone, ashlar, laterite
const YS_FQ_SCALES=[1,.92,.86];
function FURNISH(key){YS_FQ.furnish[key]=(YS_FQ.furnish[key]||0)+1;return null;}   // 73-hl-carve's furniture hook: the catalog is not here
// a swap-list glob ('vern_*', 'hl_rep_*', 'voth_townhouse_*', 'voth_embassy') against the registry; 'voth_embassy' names the
// ported key 'port_voth_embassy', so a glob also matches the key without its 'port_' prefix
function ysFqGlob(g){const rx=new RegExp('^'+String(g).replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*')+'$');return k=>rx.test(k)||rx.test(k.replace(/^port_/,''));}
function ysFqPool(swap){const ms=(swap||[]).map(ysFqGlob);return VERN.order.filter(k=>ms.some(m=>m(k)));}
// every (builder, turn, scale) that fits a w x d plot within +1 m: the largest scale that fits, per builder and turn
function ysFqFits(w,d,pool){const out=[];for(const k of pool){const D=VERN.defs[k];if(!D||!(D.w>0&&D.d>0))continue;
 for(const rot of [0,1])for(const s of YS_FQ_SCALES){const fw=(rot?D.d:D.w)*s,fd=(rot?D.w:D.d)*s;if(fw<=w+1&&fd<=d+1){out.push({key:k,rot,scale:s,w:fw,d:fd,wt:(rot?.3:1)*(s===1?1:s===.92?.45:.25)});break;}}}
 return out;}
// weighted pick; a builder not yet standing in the quarter weighs six times more (the kit audit's boost, 88 ysPlPick)
function ysFqPick(st,fits){let tot=0;const w=fits.map(f=>{const v=f.wt*(YS_FQ.byKey[f.key]?1:6);tot+=v;return v;});let r=st.next()*tot;for(let i=0;i<fits.length;i++){r-=w[i];if(r<=0)return fits[i];}return fits[fits.length-1];}
function ysFqClashes(B){const seen=new Set(),out=[];for(const k of ysPlKeys(B)){const L=PLACE.grid.get(k);if(!L)continue;for(const o of L){if(seen.has(o))continue;seen.add(o);if(ysPlHit(B,o))out.push(o);}}return out;}
function ysFqDrop(r){const i=PLACE.blds.indexOf(r);if(i<0)return false;PLACE.blds.splice(i,1);if(typeof ysPlFree==='function')ysPlFree(r.box);return true;}
// a filled slot's record: what the draw pass places. The fill box is squared to the slot (a turned builder's w and d swap)
function ysFqFill(slot,f,st,culture){const ry=slot.ry+(f.rot?(st.chance(.5)?Math.PI/2:-Math.PI/2):0);
 return {key:f.key,rot:f.rot,scale:f.scale,v:st.int(0,3),ry,pry:slot.ry,culture,x:slot.x,z:slot.z,y:slot.y,w:f.w,d:f.d,box:ysPlBox(slot.x,slot.z,f.w/2,f.d/2,slot.ry,'foreign:'+f.key)};}
// ---------------------------------------------------------------- at load: the records
(function(){const FQ=LAYOUT.blocks.filter(b=>b.use==='foreign').sort((p,q)=>Math.hypot(p.x-CITY.HEAD[0],p.z-CITY.HEAD[1])-Math.hypot(q.x-CITY.HEAD[0],q.z-CITY.HEAD[1]));
 const cultureOf={};FQ.forEach((b,i)=>{cultureOf[b.i+','+b.j]=i<2?'iziz':i<4?'republic':'voth';});   /* 88's rule: Iziz nearest the market, then the Republic, Voth furthest */
 const idx={};
 for(const slot of PLACE.slots){if(slot.kind!=='foreign'&&slot.kind!=='chapterhouse')continue;
  const [bi,bj]=String(slot.block||'0,0').split(',').map(Number);const n=idx[slot.block]=(idx[slot.block]||0)+1;
  const st=KRAND.stream(KRAND.child(KRAND.cell(YS_FQ.SEED,bi,bj),slot.kind+':'+(n-1)));
  const culture=slot.kind==='chapterhouse'?'historians':slot.foreign;
  const pool=slot.kind==='chapterhouse'?['port_order_chapterhouse']:ysFqPool(slot.swap);
  const fits=ysFqFits(slot.w,slot.d,pool).filter(f=>slot.kind!=='chapterhouse'||f.scale===1);
  if(!fits.length){YS_FQ.kept++;continue;}
  const f=ysFqPick(st,fits);slot.fill=ysFqFill(slot,f,st,culture);
  if(slot.standIn){if(ysFqDrop(slot.standIn))YS_FQ.dropped++;slot.standInDropped=slot.standIn.key;slot.standIn=null;}
  YS_FQ.byKey[f.key]=(YS_FQ.byKey[f.key]||0)+1;YS_FQ.byCulture[culture]=(YS_FQ.byCulture[culture]||0)+1;YS_FQ.filled++;
  if(slot.kind==='chapterhouse')YS_FQ.chapterhouse=slot.fill;}
 // a compound (the embassy; the chapterhouse when 88 found no square): behind a lane of one of its culture's blocks,
 // facing the lane, where only that lane's small houses are in the way. Candidates: each quarter of each block, the
 // box's near edge 22..43 m from the block's axis (the lane runs along it), its centre 32..64 m along the lane; the
 // one that clears the fewest houses wins, ties to the first (block order, quarter order, nearest the lane)
 const byBox=new Map();for(const r of PLACE.blds)byBox.set(r.box,r);
 function compound(key,blocks,culture,name){const D=VERN.defs[key];if(!D||!blocks.length)return null;let best=null;
  search:for(const b of blocks)for(const [qu,qv] of [[1,1],[1,-1],[-1,1],[-1,-1]])for(const uo of [22,25,28,31,34,37,40,43])for(const vo of [48,40,56,32,64]){
   const c=ysPlAt(b,qu*(uo+D.d/2+1),qv*vo);const ry=ysPlFacing(-qu*PL_U[0],-qu*PL_U[1]);const B=ysPlBox(c[0],c[1],D.w/2+1,D.d/2+1,ry,'foreign:'+key);
   const cl=ysFqClashes(B);const recs=cl.map(o=>byBox.get(o));if(recs.some(r=>!r||r.why!=='foreign quarter lane'))continue;
   const n0=Object.assign({},PLACE.refused);const y=ysPlGround(B,{slope:3});PLACE.refused=n0;if(y==null)continue;
   if(recs.length>3)continue;const score=recs.length*4+(uo-22)/3;   /* a house cleared costs what 12 m of setback costs */
   if(!best||score<best.score)best={b,B,recs,y,ry,x:c[0],z:c[1],score};if(!best.score)break search;}
  if(!best)return null;for(const r of best.recs)if(ysFqDrop(r))YS_FQ.lanesCleared++;ysPlTake(best.B);
  const st=KRAND.stream(KRAND.child(KRAND.cell(YS_FQ.SEED,best.b.i,best.b.j),key));
  YS_FQ.byKey[key]=(YS_FQ.byKey[key]||0)+1;YS_FQ.byCulture[culture]=(YS_FQ.byCulture[culture]||0)+1;
  return {key,rot:0,scale:1,v:st.int(0,3),ry:best.ry,pry:best.ry,culture,x:best.x,z:best.z,y:best.y,w:D.w,d:D.d,box:best.B,block:best.b.i+','+best.b.j,compound:name,cleared:best.recs.length};}
 YS_FQ.embassy=compound('port_voth_embassy',FQ.filter(b=>cultureOf[b.i+','+b.j]==='voth'),'voth','the Voth embassy');
 if(!YS_FQ.chapterhouse)YS_FQ.chapterhouse=compound('port_order_chapterhouse',FQ.filter(b=>cultureOf[b.i+','+b.j]==='republic'),'historians','the Historians\' chapterhouse');
})();
// ---------------------------------------------------------------- the draw pass: after 88b (its hook was pushed first)
YS_BUILD.push(function(scene){const t0=performance.now();window.DOORS=window.DOORS||[];const n0={};for(const n in KIT.items)n0[n]=KIT.items[n].length;
 let built=0,fail=0,doors=0;const WHITE=new THREE.Color(1,1,1);
 const place=f=>{const D=VERN.defs[f.key];if(!D){fail++;return;}TSTAT.cur='foreign:'+f.culture+'/0';const t=tcur();t.n=(t.n||0)+1;const r0=REG.length,d0=DOORS.length;
  let G=null;try{G=withFlatGround(()=>VERN.place(scene,f.key,f.x,f.z,f.ry,{v:f.v,scale:f.scale,y:f.y}));}catch(e){reportErr('foreign '+f.key+' '+e.stack);}
  if(G){KOFF=[0,0,0];KXF=null;vB('vStone',f.x,f.y-1.52,f.z,f.w+.4,1.54,f.d+.4,f.pry,vC(YS_FQ_PAD[f.culture]||0x888078));   /* the pad: the slope's gap filled under the base */
   const bid=f.bld='fq:'+f.culture+':'+(++YS_FQ.n);const L=YS_FQ_LABEL[f.culture];for(let i=r0;i<REG.length;i++){const r=REG[i];r.bld=bid;
    r.tags=Object.assign({},r.tags,{culture:f.culture,type:(r.tags&&r.tags.type&&r.tags.type.length)?r.tags.type:(D.tags.type||['single-family dwelling']),wealth:(r.tags&&r.tags.wealth)||D.tags.wealth||'middle',decay:0,foreign:true,kit:D.tags.kit||D.tags.culture});
    r.cls=r.cls||'building';r.type=r.type||f.key;r.own=r.own||'foreign:'+f.culture;if(!/^(Voth|Chapterhouse|Historians)/.test(r.name))r.name=L+' '+r.name;}
   if(DOORS.length===d0){const dd=(f.rot?f.w:f.d)/2*f.scale;DOORS.push({x:f.x+Math.sin(f.ry)*dd,z:f.z+Math.cos(f.ry)*dd,ry:f.ry,y:f.y,key:f.key,est:true});YS_FQ.estDoors++;}   /* no door recorded (the Highlands' own door helper, the embassy's gate): the middle of the front */
   for(let i=d0;i<DOORS.length;i++){const d=DOORS[i];ysMark({bld:bid,key:f.key,kind:'door',est:!!d.est,x:d.x,y:d.y,z:d.z,nx:Math.sin(d.ry),nz:Math.cos(d.ry),w:1.6,h:2.4,level:'ground',culture:f.culture,step:[d.x+Math.sin(d.ry),d.z+Math.cos(d.ry)],thresh:[d.x-Math.sin(d.ry),d.z-Math.cos(d.ry)]});doors++;}
   f.G=G;f.drawn=true;built++;}else fail++;
  TSTAT.cur=null;};
 for(const s of PLACE.slots)if(s.fill)place(s.fill);
 if(YS_FQ.embassy)place(YS_FQ.embassy);
 if(YS_FQ.chapterhouse&&!YS_FQ.chapterhouse.drawn)place(YS_FQ.chapterhouse);
 for(const n in KIT.items){const a=n0[n]||0,b=KIT.items[n].length;if(b>a)YS_FQ.items[n]=[a,b];}   /* this pass's instances, per kit item: merged before the bake */
 const tris={};for(const k in TSTAT.by)if(/^foreign:/.test(k))tris[k.split('/')[0].slice(8)]=Math.round(TSTAT.by[k].tris);
 window._foreign={filled:YS_FQ.filled,kept:YS_FQ.kept,dropped:YS_FQ.dropped,lanesCleared:YS_FQ.lanesCleared,byCulture:YS_FQ.byCulture,byKey:YS_FQ.byKey,built,fail,doors,tris,
  embassy:YS_FQ.embassy?{x:Math.round(YS_FQ.embassy.x),z:Math.round(YS_FQ.embassy.z),block:YS_FQ.embassy.block,cleared:YS_FQ.embassy.cleared,drawn:!!YS_FQ.embassy.drawn}:null,
  chapterhouse:YS_FQ.chapterhouse?{x:Math.round(YS_FQ.chapterhouse.x),z:Math.round(YS_FQ.chapterhouse.z),block:YS_FQ.chapterhouse.block,onSquare:!YS_FQ.chapterhouse.compound,drawn:!!YS_FQ.chapterhouse.drawn}:null,
  estimatedDoors:YS_FQ.estDoors,furnishSkipped:Object.values(YS_FQ.furnish).reduce((a,b)=>a+b,0),ms:Math.round(performance.now()-t0)};});
// ---------------------------------------------------------------- before the bake: this pass's instances merged by material
// Each instance's geometry is cloned under its matrix with the instance colour times the material's as a vertex colour; one
// mesh per texture map (and material type, metal or dull, side, normal map, emissive: the map-less colour materials of one
// kind share a mesh), the material cloned white with vertexColors, so the tint reads as it did instanced. The
// night kit (FIREKIT) and transparent items stay instanced. The accounting is untouched: the triangles were charged at kput.
function ysFqMerge(parent){const by=new Map();let inst=0;const m=new THREE.Matrix4(),pos=new THREE.Vector3(),sc=new THREE.Vector3(),q0=new THREE.Quaternion();const WHITE=new THREE.Color(1,1,1);
 for(const n in YS_FQ.items){const [a,b]=YS_FQ.items[n];const def=KIT.defs[n];const it=KIT.items[n];if(!def||!it||b>it.length)continue;
  if(FIREKIT.indexOf(n)>=0||def.mat.transparent||Array.isArray(def.mat))continue;
  const mine=it.slice(a,b);if(!mine.length)continue;
  const M=def.mat;const key=[M.map?M.map.uuid:'nomap',M.type,M.metalness>.5?'metal':'dull',M.side,M.normalMap?M.normalMap.uuid:'',M.emissive?M.emissive.getHex():0,M.alphaTest||0].join('|');
  if(!by.has(key))by.set(key,{mat:M,geos:[]});const E=by.get(key);const mc=M.color||WHITE;
  for(const o of mine){pos.set(o.p[0],o.p[1],o.p[2]);const s=typeof o.s==='number'?sc.set(o.s,o.s,o.s):sc.set(o.s[0],o.s[1],o.s[2]);m.compose(pos,o.q||q0,s);
   const g=def.geo.clone();g.applyMatrix4(m);const nv=g.attributes.position.count;const C=new Float32Array(nv*3);const c=o.c||WHITE;const cr=c.r*mc.r,cg=c.g*mc.g,cb=c.b*mc.b;for(let i=0;i<nv;i++){C[i*3]=cr;C[i*3+1]=cg;C[i*3+2]=cb;}
   g.setAttribute('color',new THREE.BufferAttribute(C,3));E.geos.push(g);inst++;}
  KIT.items[n]=it.slice(0,a).concat(it.slice(b));}
 let meshes=0;const cur=TSTAT.cur;TSTAT.cur=null;
 for(const E of by.values()){const mat=E.mat.clone();if(E.mat.onBeforeCompile)mat.onBeforeCompile=E.mat.onBeforeCompile;mat.vertexColors=true;if(mat.color)mat.color.set(0xffffff);   /* the colour is in the vertices now */
  const M=meshMerged(E.geos,mat,parent);if(M){M.userData.own='foreign';meshes++;}}
 TSTAT.cur=cur;if(window._foreign)window._foreign.merge={instances:inst,meshes};return {instances:inst,meshes};}
const _ysFqBake=kbake;
kbake=function(parent){try{YS_FQ.merge=ysFqMerge(parent);}catch(e){reportErr('foreign merge '+e.stack);}return _ysFqBake(parent);};
