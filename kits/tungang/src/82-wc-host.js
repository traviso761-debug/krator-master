// ================================================================= WILDCAT'S HOST API: TG.fg.pueblo and its kin (API.md, "Wildcat")
// What a world calls to draw a scrap pueblo from core/pueblo's plan, as TG.fg.draw draws a village from core/hamlet's:
//   TG.fg.wildcat()              the great house's plan (KPUEBLO.house(FG_WC.GREAT), built once); TG.fg.wildcatHamlets() the two
//                                hamlets'; TG.fg.wcSpec the specs (FG_WC), so a world can build its own plan
//   TG.fg.puebloRegister(P, T, o) the house's record and every room, kiva, ladder, plaza and piece of dress in core/tags
//                                registry T, before the draw (o {x, z, ry, ground, key, name}); returns {house, count}
//   TG.fg.pueblo(P, o)           draws it, DRY, at o.x, o.z, o.ry on o.ground: the floor at the highest ground under the
//                                footprint's hull (a knoll's flattened top), each column's footing down to its own ground;
//                                and its stockade on P.enclosure's ring unless o.stockade === false. Returns the meshes
//                                (fgDrawInto's: .group, .recs, .tris, .lights, .smokes) with .plan and .dress
//   TG.fg.check.pueblo(P, recs)  the plan's invariants (KPUEBLO.check) and the draw's counts, for a world's --assert
function fgWcSeat(P,o){const G=o.ground||terrainH,x=o.x==null?0:o.x,z=o.z==null?0:o.z,ry=o.ry==null?0:o.ry,c=Math.cos(ry),s=Math.sin(ry);
 const wx=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];let top=G(x,z),low=top;
 for(const p of P.hull){const q=wx(p[0],p[1]),g=G(q[0],q[1]);top=Math.max(top,g);low=Math.min(low,g);}
 return {x,z,ry,y:top,low,lo:low-top-.5,wx,gl:(lx,lz)=>{const q=wx(lx,lz);return G(q[0],q[1])-top;}};}
function fgWcKey(P,o){return o.key||(P.shape==='bar'?'fg-bc-greathouse':P.cells.length>150?'fg-wc-greathouse':'fg-wc-hamlet');}
/* a plan's dress: Barricade's for a wall across a pass, else Wildcat's */
function fgWcDressOf(P){return P.shape==='bar'&&typeof fgBcDress==='function'?fgBcDress(P):fgWcDress(P);}
TG.fg.wcSpec=FG_WC;
TG.fg.wildcat=()=>fgWcPlan(FG_WC.GREAT);
TG.fg.wildcatHamlets=()=>FG_WC.HAMLETS.map(fgWcPlan);
TG.fg.barricade=()=>fgBcPlan();TG.fg.bcSpec=FG_BC;
TG.fg.puebloRegister=function(P,T,o){o=o||{};const S=fgWcSeat(P,o),key=fgWcKey(P,o),D=DEFS[key],name=o.name||D.name;
 const house=T.add({'class':D.cls,kind:key,key,name,at:[S.x,S.y,S.z],ry:S.ry,size:[P.bounds.w,P.bounds.d,P.bounds.h],tags:Object.assign({},D.tags),
  note:'a scrap pueblo drawn by TG.fg.pueblo from core/pueblo\'s plan '+P.id+' ('+P.census.pop+' people in '+P.census.rooms+' rooms)',frag:KIT.frag});
 const at=(lx,ly,lz)=>{const q=S.wx(lx,lz);return [+q[0].toFixed(4),+(S.y+ly).toFixed(4),+q[1].toFixed(4)];};
 let n=fgWcRegister(P,o.dress||fgWcDressOf(P),T,house.id,at,S.ry,name);
 /* the rooms' and the kivas' furniture, each its room's child */
 n+=KPUEBLO.registerFurniture(P,T,FG_WC_LASTIDS,{culture:'fellgang',at,ry:S.ry,frag:KIT.frag});
 if(P.enclosure&&o.stockade!==false){const D2=DEFS['fg-wc-stockade'];T.child(house.id,{'class':D2.cls,kind:'fg-wc-stockade',key:'fg-wc-stockade',name:name+': the stockade',at:[S.x,S.y,S.z],ry:S.ry,
  size:[P.bounds.w+2*P.enclosure.margin,P.bounds.d+2*P.enclosure.margin,3],tags:Object.assign({},D2.tags),frag:KIT.frag});n++;}
 return {house,count:n};};
TG.fg.pueblo=function(P,o){o=o||{};const S=fgWcSeat(P,o),key=fgWcKey(P,o),dress=o.dress||fgWcDressOf(P);FG_WC_PEND.length=0;
 const out=fgDrawInto(Object.assign({name:'fellgang:'+P.id,label:o.label||DEFS[key].name+' (a Fellgang scrap pueblo, core/pueblo)'},o),()=>{
  const recs=[place(key,S.x,S.z,S.ry,{y:S.y,lo:S.lo,gl:S.gl,plan:P,dress,state:o.state})];
  if(P.enclosure&&o.stockade!==false)recs.push(place('fg-wc-stockade',S.x,S.z,S.ry,{y:S.y,lo:S.lo,gl:S.gl,ring:P.enclosure,state:o.state}));
  recs.forEach(r=>{if(r){r.id=P.id+(r.key==='fg-wc-stockade'?':stockade':'');r.top=S.y;r.low=S.low;}});return recs;});
 out.furniture=fgWcFlushFurniture(out.group,o);out.plan=P;out.dress=dress;
 /* the storey section: every material of this house clipped above the section's height (TG.fg.section) */
 fgWcClip(out.group,S.y,P.storey);return out;};
/* ---------------------------------------------------------------- the rooms' furniture in a host's draw */
/* the queued pieces (fgWcPlace) built through the catalog's batch in 40 m chunks, each a group the frame shows only near the
   camera (or while the section is open): a great house holds some 2,000 pieces, and a room's walls hide them from outside */
const FG_WC_CHUNKS=[];
function fgWcFlushFurniture(G,o){const n=FG_WC_PEND.length;if(!n||typeof KratorFurniture==='undefined'||!KratorFurniture.batch){FG_WC_PEND.length=0;return {pieces:0,chunks:0};}
 const by={};for(const p of FG_WC_PEND){const k=Math.floor(p.x/40)+','+Math.floor(p.z/40);(by[k]||(by[k]=[])).push(p);}
 let placed=0,missing=0,chunks=0;
 for(const k of Object.keys(by).sort()){const L=by[k],B=KratorFurniture.batch({indexed:true});let cx=0,cz=0;
  for(const p of L){if(!KratorFurniture.has(p.key)){missing++;continue;}B.place(p.key,p.x,p.y,p.z,p.ry,{variant:p.v,setting:'indoor'});placed++;cx+=p.x;cz+=p.z;}
  const g=B.flush(G);g.userData.furniture=true;g.userData.furnChunk=[cx/L.length,cz/L.length];chunks++;FG_WC_CHUNKS.push(g);
  /* the batch's colours are sRGB bytes: to linear floats, as the engine's own furnishing pass does (KFURN.linearColours) */
  g.traverse(m=>{if(!m.isMesh)return;if(typeof KFURN!=='undefined'&&KFURN.linearColours)KFURN.linearColours(m.geometry);else{const c=m.geometry.attributes.color;if(c&&!(c.array instanceof Float32Array)){const A=c.array,k=A instanceof Uint8Array?255:1,o=new Float32Array(A.length);
    for(let i=0;i<A.length;i++){const v=A[i]/k;o[i]=v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}m.geometry.setAttribute('color',new THREE.BufferAttribute(o,c.itemSize==null?3:c.itemSize));}}
   m.castShadow=false;m.receiveShadow=true;if(typeof svfDetail==='function'&&!m.material.map)svfDetail(m.material);});}
 FG_WC_PEND.length=0;return {pieces:placed,missing,chunks};}
/* ---------------------------------------------------------------- the storey section */
/* each house's own clipping plane (its materials cloned, so nothing else on the page is cut): TG.fg.section(level) opens every
   house at that storey (1: the ground floor, 2: the next...), 'kiva' (or 0) opens the kivas at the plaza's level, null closes */
const FG_WC_CLIPS=[];let FG_WC_SECTION=null;
function fgWcClip(G,y0,h){if(typeof THREE==='undefined')return;const plane=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6),mats=new Map();
 G.traverse(m=>{if(!m.isMesh)return;const one=M=>{if(!mats.has(M)){const c=M.clone();c.clippingPlanes=[plane];c.clipShadows=true;c.onBeforeCompile=M.onBeforeCompile;c.customProgramCacheKey=M.customProgramCacheKey;if(M.userData)c.userData=Object.assign({},M.userData);mats.set(M,c);}return mats.get(M);};
  m.material=Array.isArray(m.material)?m.material.map(one):one(m.material);});
 FG_WC_CLIPS.push({plane,y0,h});if(FG_WC_SECTION!=null)fgWcSectionSet(FG_WC_SECTION);}
function fgWcSectionSet(level){FG_WC_SECTION=level;for(const c of FG_WC_CLIPS)c.plane.constant=level==null?1e6:(level==='kiva'||level===0)?c.y0-.05:c.y0+(level-1)*c.h+1.6;
 if(typeof renderer!=='undefined')renderer.localClippingEnabled=level!=null||renderer.localClippingEnabled;return level;}
TG.fg.section=fgWcSectionSet;
/* the furniture's chunks: shown within 90 m of the camera, or 260 m while the section is open */
function fgWcChunksTick(cam){if(!cam)return;for(const g of FG_WC_CHUNKS){const c=g.userData.furnChunk,d=Math.hypot(cam.position.x-c[0],cam.position.z-c[1]);g.visible=d<(FG_WC_SECTION!=null?260:90);}}
TG.fg.chunksTick=fgWcChunksTick;
TG.fg.check.pueblo=function(P,recs){const C=KPUEBLO.checkAll(P),bad=Object.keys(C).filter(k=>!C[k].ok).map(k=>k+': '+C[k].bad.slice(0,3).join('|'));
 const r=(recs||[]).find(q=>q&&q.fg&&q.fg.plan===P.id),S=r&&r.fg||{};
 if(!r)bad.push('not drawn');else{if(S.cells!==P.cells.length)bad.push('cells drawn '+S.cells+' of '+P.cells.length);
  if(S.kivas!==P.kivas.length)bad.push('kivas drawn '+S.kivas+' of '+P.kivas.length);
  if(S.doors!==P.rooms.filter(q=>q.face==='door').length)bad.push('doors drawn '+S.doors);
  if(S.hatches!==P.hatches.length)bad.push('hatches drawn '+S.hatches);}
 return {ok:!bad.length&&!P.errors.length,bad:bad.concat(P.errors),census:P.census,drawn:S};};
