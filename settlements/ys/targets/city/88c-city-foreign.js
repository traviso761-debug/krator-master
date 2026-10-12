// ================================================================= YS CITY — the FOREIGN QUARTER: the foreign sets in the placer's slots (DESIGN §2, §6; PLAN P3)
// 88 reserved the quarter as PLACE.slots of kind 'foreign' ({foreign:'iziz'|'republic'|'voth', swap:[key globs], x,z,ry,
// w,d,y, box, block, standIn}) and drew a Hykkousoi house of the middle pool inside each until the sets landed. The sets
// are here now (build.py: the Iziz Vernacular dwellings and trade, the Highlands kit's Republican dwellings, the ported
// Voth embassy and the Historians' chapterhouse, and the Voth townhouses of 77-voth-townhouses.js), all on the one
// registry VERN (69c) that HL.def feeds too. This fragment runs in two steps:
//   AT LOAD (records only, before any draw: 88b's pass has not run yet): every foreign slot was sized by 88 to the
//   builder it wishes for (`slot.wish`, picked from its culture's set by the block's wealth) and takes that builder whole;
//   a slot without a wish picks a builder whose footprint fits its w x d within +1 m (turned 90° when that fits better,
//   scaled .92 or .86 when nothing fits whole), from a KRAND stream seeded by the slot's block cell and its index in the
//   block, so one block's edit moves nothing in another; the slot's stand-in record is spliced out of PLACE.blds and its
//   box freed (86-city-edits ysPlFree), so 88b never draws it; a slot nothing fits keeps its stand-in. The 'embassy' and
//   'chapterhouse' slots (88 ysPlCompound: a compound with a square of its own) take the Voth embassy and the Historians'
//   chapterhouse; only when 88 found no compound does the old search seat one in a block of its culture: a candidate
//   box behind a lane, facing it, where the only things in the way are that lane's small Hykkousoi houses and the
//   central infill, which it replaces.
//   IN THE DRAW PASS (a YS_BUILD hook after 88b's): VERN.place at (x, y, z) facing ry, the record's ground under it,
//   a stone pad 1.5 m deep under the footprint so a slope shows no gap under the base; every REG volume the builder made
//   is stamped culture:'iziz'|'republic'|'voth' (the chapterhouse 'historians'), type, wealth, decay 0, so the inspector
//   names it and tags-complete passes; the vern helpers' door marks (DOORS) become MARKS door records; a residence gets
//   a ROOM with its bed, store and food spots (ysFqRoom, estimated from the builder's main body). The accounting: TSTAT 'foreign:<culture>' per building (93z BUDGET.type).
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
// the foreign residences' rooms (DESIGN §7; Oct 12 2026): each builder centres its main body on its origin, with the body's
// width, depth and floor height as the constants on its first line; the plot's footprint adds the yard, the porch and
// the stoop. key -> [cx, cz, W, D, floor y] of the body (the Terem mansion: its main wing; the arcaded tenement: behind
// its arcade; the merchant's log house: over its storerooms). One room per residence on its main floor, inset .3 m
// for the walls, with a bed against the back wall, a store in the back corner and a food spot on the side, all clear of
// the front door; estimated from the body (`est:true`), not read off the builder's partitions.
const YS_FQ_BODY={vern_house_poor_a:[0,0,5.6,6.2,1.7],vern_house_poor_b:[0,0,6,5,.35],vern_house_poor_c:[0,0,6.6,6.4,.6],vern_house_mid_a:[0,0,8.4,8.8,.4],
 vern_house_mid_b:[0,0,9.4,9,.35],vern_house_mid_c:[0,0,11,7.2,.5],vern_house_rich_a:[0,0,14,12,.6],vern_house_rich_b:[0,0,12.4,11.6,.5],
 hl_rep_house_poor_a:[0,0,6.4,6.8,.45],hl_rep_house_poor_b:[0,0,8.2,5.4,.35],hl_rep_house_poor_c:[0,0,11.4,5,.42],hl_rep_house_mid_a:[0,0,8,11,.7],
 hl_rep_house_mid_b:[0,0,10,8,2.6],hl_rep_house_mid_c:[0,-1.35,14,7.3,.1],hl_rep_house_rich_a:[0,0,16,11,1.2],hl_rep_house_rich_b:[0,-1,10,8,2.2],
 hl_rep_house_rich_c:[0,0,16,12,.7],voth_townhouse_a:[0,0,11,9,.3],voth_townhouse_b:[0,0,4.6,4.6,1.3],voth_townhouse_c:[0,0,13.6,9.6,.3]};
function ysFqRoom(f,bid,name){const B=YS_FQ_BODY[f.key];if(!B)return null;const s=f.scale||1,[cx,cz,W,D,fy]=B;
 const W2=(xl,zl)=>loc(f.x,f.z,(cx+xl)*s,(cz+zl)*s,f.ry);const hx=W/2-.3,hz=D/2-.3;
 const rm=ysRoom({building:name,bld:bid,key:f.key,kind:'bedroom',poly:[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].map(p=>W2(p[0],p[1])),y:f.y+fy*s,h:2.6,
  doors:[{at:W2(0,hz+.2),w:1.1,to:'street'}],windows:[],culture:f.culture,wealth:/rich/.test(f.key)?.8:/mid/.test(f.key)?.5:.2,residence:true,est:true});
 if(!rm)return null;const sp=(kind,lx,lz,w,d)=>{const p=W2(lx,lz);return ysSpot({room:rm.id,bld:bid,kind,x:p[0],z:p[1],ry:f.ry,w,d,est:true});};
 sp('bed',-hx+1.2,-hz+.6,2.1,1.0);sp('store',hx-.7,-hz+.45,1.2,.7);sp('food',hx-.5,0,.8,.8);return rm;}
// the trade buildings, the embassy and the chapterhouse (Oct 12 2026): their rooms read off the builders' own constants
// (71-vern-trade, 75-port-embassy, 76-port-chapterhouse; re-read them if those change), local to the building, +z the
// front: key -> [[kind, cx, cz, W, D, floor y, h, [door x, door z, w, to], [[spot kind, x, z, w, d, ry], ...]], ...].
// Kinds are the Ys kit's own (a shop unit is a 'store', as 71-hyk-shops's; a hearth room a 'hall'). Estimated (`est:true`).
const YS_FQ_ROOMS=(()=>{const R={};const row=(n,x0,dx,z,k,w,d)=>Array.from({length:n},(_,i)=>[k,x0+i*dx,z,w,d]);
 R.vern_shops=[-4.6,0,4.6].map(x=>['store',x,0,4.3,7.1,.3,3.3,[x+1.55,3.7,.9,'street'],[['counter',x-.7,2.7,2.2,.7],['store',x-1.4,-3.0,1.2,.7]]]);
 R.vern_tavern=[['tavern',0,0,15.6,9.6,.35,4,[0,5,1.5,'street'],[['hearth',-6,-4.2,1,1],['counter',4,-3.8,2.4,.7],['food',5.6,-4.2,.8,.8]]
   .concat(...[-4.5,0,4.5].map(x=>[['table',x,-.5,1.2,1.2],['seat',x,-2,1.2,.9],['seat',x,1,1.2,.9]]))]]
  .concat([-5.2,0,5.2].map(x=>['bedroom',x,-2.3,5,4.8,4.65,2.6,[x,.2,.9,'gallery'],[['bed',x-1,-4.1,2.1,1],['store',x+1.7,-4.2,1.2,.7],['food',x+1.8,-2.2,.8,.8]]]));
 R.vern_workshop_a=[['workshop',0,0,8.7,6.7,.2,3.4,[0,3.5,3,'street'],[['work',-2.4,1.8,3.2,.9],['work',2.4,2.2,2.4,.8],['store',3.3,-.7,.7,2]]]];
 R.vern_workshop_b=[['workshop',0,0,7.7,6.7,.3,3.2,[2.4,3.5,1,'street'],[['counter',-1.2,3,3.2,.6],['work',1.2,-1.2,1,1],['store',-2.8,-2.6,1.2,.7],['store',2.8,-2.6,1.2,.7]]]];
 R.vern_smithy=[['workshop',0,0,10.4,7.4,.2,3.8,[0,4,4,'street'],[['hearth',-2.6,-2.4,2.8,2],['work',.6,-.4,1.1,.6],['work',3.6,-2.8,3,.9],['store',-2.6,.2,1.6,1]]]];
 R.vern_market=[['court',0,0,24,17,.05,5,[0,8.5,4,'street'],row(5,-9.4,4.7,-5.1,'stall',2.4,1.6).concat(row(5,-9.4,4.7,5.1,'stall',2.4,1.6),row(3,-8,8,-1.6,'stall',2.4,1.6),row(3,-8,8,1.6,'stall',2.4,1.6))]];
 R.vern_warehouse=[['store',0,0,21.6,11.6,.9,5.2,[0,6,2.2,'street'],row(10,-9,2,-5.2,'store',1.2,.7).concat([['work',8,4.5,1.2,.7]])],
  ['hall',-13.6,3.5,4.2,4.4,0,3,[-13.6,5.9,1,'street'],[['table',-13.6,3.5,1.2,1.2],['store',-12.4,1.9,1.2,.7],['hearth',-15,1.8,.8,.8]]]];
 R.port_voth_embassy=[['hall',7.2,-8.6,11.3,8,.75,6,[4.8,-4,1.7,'court'],[['table',7.2,-8.6,2.4,1.2],['seat',7.2,-10.4,1.2,.9],['seat',7.2,-6.8,1.2,.9],['hearth',11,-11.4,1,1],['store',2.4,-11.8,1.2,.7]]],
  ['bedroom',7.2,-8.6,8.6,6,6.75,4.8,[7.2,-5.6,.9,'stair'],[['bed',4.4,-10.8,2.1,1],['store',10.4,-11,1.2,.7],['food',6.8,-10.8,.8,.8],['table',9.4,-7.6,1.2,1.2],['seat',9.4,-6.2,1.2,.9]]],
  ['library',-10,-8.5,4.4,4.4,1.35,6,[-10,-6.3,1.7,'court'],[['table',-10.6,-9.2,1.2,1.2],['seat',-8.6,-9.6,1.2,.9],['store',-11.75,-7.6,.7,1.2]]],
  ['hall',13,4,5,5.8,.35,3.4,[10.5,4,1,'court'],[['hearth',11.2,1.8,1,1],['food',14.5,2.5,.8,.8],['table',13,5,1.2,1.2],['store',14.8,6.4,1.2,.7]]],
  ['hall',-11,4.5,7.8,6.4,.75,5.6,[-7.2,4.5,1.6,'court'],[['table',-11,4.5,2.4,1.2],['seat',-11,2.4,2,.9],['seat',-11,6.6,2,.9],['shrine',-14.2,4.5,.8,1]]]];
 R.port_order_chapterhouse=[['library',0,-8.5,20,9.4,.45,8.6,[0,-3.6,2.4,'court'],[-7.5,-3.5,3.5,7.5].map(x=>['table',x,-8,2.4,1.2]).concat([-7.5,-3.5,3.5,7.5].map(x=>['seat',x,-5.7,2.4,.9]),
   row(7,-9,3,-12.6,'store',1.2,.7),[['shrine',0,-10.8,1,.8]])],
  ['library',-15.3,1.5,4.6,10.4,.45,4.6,[-12.9,1.5,1.2,'court'],row(7,-3,1.5,0,'store',.7,1.2).map(r=>[r[0],-16.9,r[1],r[3],r[4]]).concat([['table',-15,5.5,1.2,1.2]])],
  ['workshop',15.3,1.5,4.6,10.4,.45,4.6,[12.9,1.5,1.2,'court'],[-3,0,3,6].map(z=>['table',16.6,z,1,1.2]).concat([-3,0,3,6].map(z=>['seat',14.9,z,.9,1.2]),[['store',13.6,-2.9,.7,1.2]])]];
 return R;})();
function ysFqRooms(f,bid,name){const L=YS_FQ_ROOMS[f.key];if(!L)return 0;const s=f.scale||1,W2=(x,z)=>loc(f.x,f.z,x*s,z*s,f.ry);let n=0;
 for(const [kind,cx,cz,W,D,fy,h,dr,spots] of L){const hx=W/2,hz=D/2;
  const rm=ysRoom({building:name,bld:bid,key:f.key,kind,poly:[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].map(p=>W2(cx+p[0],cz+p[1])),y:f.y+fy*s,h:h*s,
   doors:[{at:W2(dr[0],dr[1]),w:dr[2],to:dr[3]}],windows:[],culture:f.culture,wealth:/rich|embassy|chapterhouse/.test(f.key)?.8:.5,residence:kind==='bedroom',est:true});
  if(!rm)continue;n++;for(const [k,x,z,w,d,ry] of spots){const p=W2(x,z);ysSpot({room:rm.id,bld:bid,kind:k,x:p[0],z:p[1],ry:f.ry+(ry||0),w,d,est:true});}}
 return n;}
// ---------------------------------------------------------------- at load: the records
(function(){const FQ=LAYOUT.blocks.filter(b=>b.use==='foreign').sort((p,q)=>Math.hypot(p.x-CITY.HEAD[0],p.z-CITY.HEAD[1])-Math.hypot(q.x-CITY.HEAD[0],q.z-CITY.HEAD[1]));
 const cultureOf={};FQ.forEach((b,i)=>{cultureOf[b.i+','+b.j]=i<2?'iziz':i<4?'republic':'voth';});   /* 88's rule: Iziz nearest the market, then the Republic, Voth furthest */
 const idx={};
 for(const slot of PLACE.slots){if(slot.kind!=='foreign'&&slot.kind!=='chapterhouse'&&slot.kind!=='embassy')continue;
  const [bi,bj]=String(slot.block||'0,0').split(',').map(Number);const n=idx[slot.block]=(idx[slot.block]||0)+1;
  const st=KRAND.stream(KRAND.child(KRAND.cell(YS_FQ.SEED,bi,bj),slot.kind+':'+(n-1)));
  const culture=slot.kind==='chapterhouse'?'historians':slot.kind==='embassy'?'voth':slot.foreign;
  const pool=slot.kind==='chapterhouse'?['port_order_chapterhouse']:slot.kind==='embassy'?['port_voth_embassy']:ysFqPool(slot.swap);
  /* the plot was sized to the builder it wished for (88 ysPlForeignPick): that one, whole and unturned */
  const W=slot.wish&&VERN.defs[slot.wish]?[{key:slot.wish,rot:0,scale:1,w:VERN.defs[slot.wish].w,d:VERN.defs[slot.wish].d,wt:1}]:null;
  const fits=W||ysFqFits(slot.w,slot.d,pool).filter(f=>slot.kind==='foreign'||f.scale===1);
  if(!fits.length){YS_FQ.kept++;continue;}
  const f=ysFqPick(st,fits);slot.fill=ysFqFill(slot,f,st,culture);
  if(slot.standIn){if(ysFqDrop(slot.standIn))YS_FQ.dropped++;slot.standInDropped=slot.standIn.key;slot.standIn=null;}
  YS_FQ.byKey[f.key]=(YS_FQ.byKey[f.key]||0)+1;YS_FQ.byCulture[culture]=(YS_FQ.byCulture[culture]||0)+1;YS_FQ.filled++;
  if(slot.kind==='chapterhouse')YS_FQ.chapterhouse=slot.fill;
  if(slot.kind==='embassy'){Object.assign(slot.fill,{compound:'the Voth embassy',block:slot.block,cleared:0});YS_FQ.embassy=slot.fill;}}
 // a compound (the embassy; the chapterhouse when 88 found no square): behind a lane of one of its culture's blocks,
 // facing the lane, where only that lane's small houses and the central infill are in the way. Candidates: each quarter of each block, the
 // box's near edge 22..43 m from the block's axis (the lane runs along it), its centre 32..64 m along the lane; the
 // one that clears the fewest houses wins, ties to the first (block order, quarter order, nearest the lane)
 const byBox=new Map();for(const r of PLACE.blds)byBox.set(r.box,r);
 function compound(key,blocks,culture,name){const D=VERN.defs[key];if(!D||!blocks.length)return null;let best=null;
  search:for(const b of blocks)for(const [qu,qv] of [[1,1],[1,-1],[-1,1],[-1,-1]])for(const uo of [22,25,28,31,34,37,40,43])for(const vo of [48,40,56,32,64]){
   const c=ysPlAt(b,qu*(uo+D.d/2+1),qv*vo);const ry=ysPlFacing(-qu*PL_U[0],-qu*PL_U[1]);const B=ysPlBox(c[0],c[1],D.w/2+1,D.d/2+1,ry,'foreign:'+key);
   const cl=ysFqClashes(B);const recs=cl.map(o=>byBox.get(o));if(recs.some(r=>!r||!/^(foreign quarter lane|central infill)$/.test(r.why)))continue;   /* only the lane's houses and the infill (88 section 6) give way */
   const n0=Object.assign({},PLACE.refused);const y=ysPlGround(B,{slope:3});PLACE.refused=n0;if(y==null)continue;
   const lane=recs.filter(r=>r.why==='foreign quarter lane').length;if(lane>3||recs.length>12)continue;const score=lane*4+(recs.length-lane)+(uo-22)/3;   /* a lane house cleared costs what 12 m of setback costs, an infill house a quarter of that */
   if(!best||score<best.score)best={b,B,recs,y,ry,x:c[0],z:c[1],score};if(!best.score)break search;}
  if(!best)return null;for(const r of best.recs)if(ysFqDrop(r))YS_FQ.lanesCleared++;ysPlTake(best.B);
  const st=KRAND.stream(KRAND.child(KRAND.cell(YS_FQ.SEED,best.b.i,best.b.j),key));
  YS_FQ.byKey[key]=(YS_FQ.byKey[key]||0)+1;YS_FQ.byCulture[culture]=(YS_FQ.byCulture[culture]||0)+1;
  return {key,rot:0,scale:1,v:st.int(0,3),ry:best.ry,pry:best.ry,culture,x:best.x,z:best.z,y:best.y,w:D.w,d:D.d,box:best.B,block:best.b.i+','+best.b.j,compound:name,cleared:best.recs.length};}
 if(!YS_FQ.embassy)YS_FQ.embassy=compound('port_voth_embassy',FQ.filter(b=>cultureOf[b.i+','+b.j]==='voth'),'voth','the Voth embassy');   /* 88 reserves both compounds now; this is the fallback */
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
   if(/dwelling/.test(((D.tags&&D.tags.type)||[]).join(' '))&&ysFqRoom(f,bid,L+' '+D.name))YS_FQ.rooms=(YS_FQ.rooms||0)+1;   /* a residence's room and its spots */
   else{const nr=ysFqRooms(f,bid,(/^(Voth|Chapterhouse|Order)/.test(D.name)?'':L+' ')+D.name);if(nr){YS_FQ.tradeRooms=(YS_FQ.tradeRooms||0)+nr;YS_FQ.tradeBlds=(YS_FQ.tradeBlds||0)+1;}}   /* the trade buildings', the embassy's and the chapterhouse's rooms */
   f.G=G;f.drawn=true;built++;}else fail++;
  TSTAT.cur=null;};
 for(const s of PLACE.slots)if(s.fill)place(s.fill);
 if(YS_FQ.embassy&&!YS_FQ.embassy.drawn)place(YS_FQ.embassy);
 if(YS_FQ.chapterhouse&&!YS_FQ.chapterhouse.drawn)place(YS_FQ.chapterhouse);
 for(const n in KIT.items){const a=n0[n]||0,b=KIT.items[n].length;if(b>a)YS_FQ.items[n]=[a,b];}   /* this pass's instances, per kit item: merged before the bake */
 const tris={};for(const k in TSTAT.by)if(/^foreign:/.test(k))tris[k.split('/')[0].slice(8)]=Math.round(TSTAT.by[k].tris);
 window._foreign={filled:YS_FQ.filled,rooms:YS_FQ.rooms||0,tradeRooms:YS_FQ.tradeRooms||0,tradeBlds:YS_FQ.tradeBlds||0,kept:YS_FQ.kept,dropped:YS_FQ.dropped,lanesCleared:YS_FQ.lanesCleared,byCulture:YS_FQ.byCulture,byKey:YS_FQ.byKey,built,fail,doors,tris,
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
