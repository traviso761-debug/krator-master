// ================================================================= THE FELLGANG SET'S HOST API: TG.fg.draw and its kin (API.md)
// What a world calls to draw the Fellgang set from its own records, in place of riftrim's stand-ins (PLAN.md section 3.3.1:
// "it then calls the kit's TG.fg.draw(V, o) with the arguments FELLGANG.draw takes today"). The same code runs on this kit's
// sheet (its sample village, the sloped pad and the test wall: 91t-fg-sheet.js) and in the sealed bundle a world loads
// (tungang_bundle.py: TG). The station keeps its records: it registers them in core/tags before drawing (as now); a draw here
// is DRY (PLACE_DRY: nothing is added to the kit's registry, no furniture is placed) into buckets of its own, flushed into one
// group added to o.scene, so the station's own scene and registry are never touched.
//   TG.fg.draw(V, o)       V.records (KHAMLET.village's: {key, x, z, ry, ...}), o {scene, ground(x, z), seed, label, variant?,
//                          state?, pegs?, lost?, character? ('stony' | 'low' | null: by default the village's, from its focus)}: each record's def at x, z, ry, seated as the stand-ins were (the floor at
//                          the footprint's highest corner, the plinth to its lowest); returns the meshes (as FELLGANG.draw),
//                          with .group, .recs (each drawn record: key, bbox, fg counts), .missing (keys the kit lacks), .tris,
//                          .lights (the fires and lanterns: {x, y, z, r, g, b, big}) and .smokes (the smoke holes: {x, y, z, r})
//   TG.fg.ropes(list, o)   the Fowlers' rope records ({id, pts [[x,y,z]...], y0, top, family}) as fg-fixed-line
//   TG.fg.pieces(list, o)  road and wall pieces ({key, x, z, ry?, y?, v?, family?, face?}): fg-lantern-post, fg-wall-station,
//                          fg-nest-ledge, fg-burial-ledge, fg-halt, fg-wagon (y defaults to o.ground(x, z))
//   TG.fg.proto(key, o)    one def alone at the origin (dry, its own group): o {v, state, variant}
//   TG.fg.dims(key)        a key's box {w, d, h} (the stand-ins' FELLGANG.dims); TG.fg.BOX the boxes; TG.fg.ROW core/hamlet's row
//   TG.fg.check            the checks verify.py runs, for a station's --assert too: box(recs), plinth(recs, ground), rope(records, meshes)
/* draw fn() into fresh buckets in the world frame, dry, and flush them into a group: the engine's state is kept and restored.
   o.walk records floors, walls and ladders into global KWALK/KWALKBOX (37-wk-rec.js); o.doors registers svLeaf plate doors into
   global KDOOR/KDOORHOST and flushes their InstancedMeshes into G; o.furnish === false skips catalog furniture for far draws */
let FG_DOORS=0;
{const fgLeaf0=svLeaf;svLeaf=function(x,y,z,yaw,w,h,o){if(!FG_DOORS)return fgLeaf0(x,y,z,yaw,w,h,o);
 const d0=PLACE_DRY;PLACE_DRY=0;try{return fgLeaf0(x,y,z,yaw,w,h,o);}finally{PLACE_DRY=d0;}};}
function fgDrawInto(o,fn){const T={},keep={GB,GTARGET,CMS:CMS.slice(),CM,dry:PLACE_DRY,rec:CURREC,key:CURKEY,doors:DOORS_CUR,win:WINDOWS_CUR,cut:CUTC,sbs:SBS.slice(),sb:SB,wk:WK_HOST,dr:FG_DOORS};
 GB=T;GTARGET=T;resetCM();PLACE_DRY=1;CURREC=null;CURKEY=null;DOORS_CUR=null;WINDOWS_CUR=null;SBS.length=0;SB=null;
 WK_HOST=o.walk?1:0;FG_DOORS=o.doors&&typeof KDOOR!=='undefined'&&typeof KDOORHOST!=='undefined'?1:0;if(FG_DOORS)SV_OPEN.leaves.length=0;
 if(typeof FG_FURN_PENDING!=='undefined')FG_FURN_PENDING.length=0;
 const t0=GSTAT.tris,h0=HALOS.length,s0=SMOKES.length;let recs=[],leaves=[];
 try{recs=fn();if(FG_DOORS&&SV_OPEN.leaves.length)leaves=SV_OPEN.leaves.slice();}catch(err){reportErr('TG.fg: '+(err.stack||err));}
 finally{if(FG_DOORS)SV_OPEN.leaves.length=0;GB=keep.GB;GTARGET=keep.GTARGET;CMS.length=0;keep.CMS.forEach(m=>CMS.push(m));CM=keep.CM;PLACE_DRY=keep.dry;CURREC=keep.rec;CURKEY=keep.key;DOORS_CUR=keep.doors;WINDOWS_CUR=keep.win;CUTC=keep.cut;
  SBS.length=0;keep.sbs.forEach(b=>SBS.push(b));SB=keep.sb;WK_HOST=keep.wk;FG_DOORS=keep.dr;}
 const G=new THREE.Group();G.name=o.name||'fellgang';flushBuckets(T,G,o.shadow!==false);
 if(leaves.length){SV_OPEN.leaves.push(...leaves);svOpenFlush(G,{walk:false});SV_OPEN.leaves.length=0;}
 /* the furniture the builders asked for, in a bundle sealed with the catalog (tungang_bundle.py furniture=True): one batch */
 if(typeof FG_FURN_PENDING!=='undefined'&&FG_FURN_PENDING.length){
  if(o.furnish!==false){const FB=KratorFurniture.batch({indexed:true});for(const p of FG_FURN_PENDING)FB.place(p.key,p.x,p.y,p.z,p.ry,{variant:p.v,setting:'indoor'});
   const fg=FB.flush(G);fg.userData.furniture=true;fg.traverse(m=>{const c=m.geometry&&m.geometry.attributes.color;if(!c)return;const A=c.array,u8=A instanceof Uint8Array;
    for(let i=0;i<A.length;i++){const v=u8?A[i]/255:A[i],l=v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);A[i]=u8?Math.round(l*255):l;}c.needsUpdate=true;});G.userData.furniture=FG_FURN_PENDING.length;}
  FG_FURN_PENDING.length=0;}
 const out=G.children.slice();out.forEach(m=>{m.userData.host=true;m.userData.inspectLabel=o.label||'A Fellgang village';});
 if(out.length&&o.probe!==false)out[0].userData.probePoints=[].concat(...recs.filter(Boolean).map(r=>[r.x,r.y+1,r.z]));
 if(o.scene)o.scene.add(G);out.group=G;out.recs=recs.filter(Boolean);out.tris=Math.round(GSTAT.tris-t0);out.lights=HALOS.slice(h0);out.smokes=SMOKES.slice(s0);out.doorLeaves=leaves.length;return out;}
/* drystone threshold steps up to a building's main door on a slope (opt-in via o.steps on TG.fg.draw): drawn outside place() so
   rec.bbox stays the building's own contract box, and registered on KWALK so a walker climbs from the ground into the room */
function fgStepFlight(rec,G){if(!rec||!rec.doorCount||!rec.front||!rec.front.world)return null;
 const w=rec.front.world,ux=Math.sin(w.yaw),uz=Math.cos(w.yaw),tx=Math.cos(w.yaw),tz=-Math.sin(w.yaw);
 const ax=w.x+ux*.22,az=w.z+uz*.22,g0=G(ax,az),y1=rec.y+.06;if(y1-g0<.26)return null;
 let run=Math.min(4.2,Math.max(.55,(y1-g0)*1.45)),fx=w.x+ux*(.22+run),fz=w.z+uz*(.22+run),y0=G(fx,fz);
 for(let i=0;i<3;i++){run=Math.min(4.6,Math.max(.55,(y1-y0)*1.45));fx=w.x+ux*(.22+run);fz=w.z+uz*(.22+run);y0=G(fx,fz);}
 if(y1-y0<.24)return null;
 const n=Math.max(1,Math.ceil((y1-y0)/.2)),sw=1.45,go=run/n,sc=P('stoneD');
 WKOFF++;try{for(let k=0;k<n;k++){const t=(k+.5)/n,cx=fx+(ax-fx)*t,cz=fz+(az-fz)*t,top=y0+(y1-y0)*(k+1)/n,gb=Math.min(G(cx,cz),y0+(y1-y0)*k/n)-.3;
  if(top>gb+.04)W(cx,0,cz,w.yaw,()=>box('stoneD',0,gb,0,sw,top-gb,go+.03,sc));}}finally{WKOFF--;}
 if(typeof KWALK!=='undefined'){
  const ap=[[-sw/2,-.55],[sw/2,-.55],[sw/2,.26],[-sw/2,.26]].map(([a,b])=>[w.x+tx*a+ux*b,w.z+tz*a+uz*b,y1]);
  KWALK.poly({pts:ap,name:(rec.id||rec.key)+'.threshold',tag:'fg:threshold:'+(rec.id||rec.key)});
  KWALK.strip({a:[fx,fz,y0],b:[ax,az,y1],w:sw,name:(rec.id||rec.key)+'.steps',tag:'fg:steps:'+(rec.id||rec.key)});}
 return {n,x0:fx,z0:fz,y0,x1:ax,z1:az,y1,yaw:w.yaw};}
/* the meeting hall's variant: the station's, else the village's focus or id (the Fowlers' rope wall, the Ice-cutters' tally) */
function fgVariantOf(V,o){if(o&&o.variant)return o.variant;const f=V&&V.focus,id=V&&V.id||'';
 return f==='ice'||f==='quarry'||/ice/.test(id)?'icecut':'fowlers';}
/* seat one record as the stand-ins did: corners and centre of its box on the ground; the floor at the highest, the plinth to
   the lowest less .5 m (FELLGANG.draw's R.y and R.lo); gl(x, z) the ground under a local point, relative to the floor */
function fgSeat(r,B,G){const ry=r.ry==null?0:r.ry,c=Math.cos(ry),s=Math.sin(ry),wx=(lx,lz)=>[r.x+lx*c+lz*s,r.z-lx*s+lz*c],Y=[];
 for(const a of [-1,1])for(const b of [-1,1]){const p=wx(a*B.w/2,b*B.d/2);Y.push(G(p[0],p[1]));}Y.push(G(r.x,r.z));
 const top=Math.max(...Y),low=Math.min(...Y);return {y:top,lo:low-top-.5,low,gl:(lx,lz)=>{const p=wx(lx,lz);return G(p[0],p[1])-top;}};}
TG.fg.dims=k=>TG.fg.BOX[k]?{w:TG.fg.BOX[k].w,d:TG.fg.BOX[k].d,h:TG.fg.BOX[k].h}:null;
Object.defineProperty(TG.fg,'ROW',{get:()=>typeof KHAMLET!=='undefined'&&KHAMLET.CULTURES?KHAMLET.CULTURES.fellgang||null:null});
TG.fg.draw=function(V,o){o=o||{};const G=o.ground||terrainH,seed=o.seed==null?7400:o.seed,missing={},recs=V&&V.records||[];
 const hh=Math.max(6,Math.round((V&&V.census&&V.census.pop?V.census.pop:140)/5)),variant=fgVariantOf(V,o);
 /* the village's character biases its buildings' families: the Fowlers stacked and stony, the Ice-cutters low and barrow-like */
 const character=o.character!==undefined?o.character:variant==='icecut'?'low':'stony';
 const out=fgDrawInto(o,()=>recs.map((r,i)=>{if(!DEFS[r.key]){missing[r.key]=(missing[r.key]==null?0:missing[r.key])+1;return null;}const B=TG.fg.BOX[r.key]||{w:r.w,d:r.d,h:r.h},S=fgSeat(r,B,G);
  /* a building's look varies by a hash of the world seed and its index (core/rand), never by what was drawn before it */
  const v=r.v!=null?r.v|0:o.v!=null?o.v|0:KRAND.hash(seed,i,0x5f6)%97;
  const rec=place(r.key,r.x,r.z,r.ry==null?0:r.ry,{y:S.y,lo:S.lo,gl:S.gl,v,variant:r.variant||variant,state:r.state||o.state,pegs:r.pegs==null?(o.pegs==null?hh:o.pegs):r.pegs,slats:r.slats==null?o.slats:r.slats,lost:o.lost,character:r.character||character||null});
  if(rec){rec.id=r.id;rec.low=S.low;rec.top=S.y;if(o.steps)rec.stair=fgStepFlight(rec,G);}return rec;}));
 out.missing=missing;return out;};
TG.fg.ropes=function(list,o){o=o||{};return fgDrawInto(Object.assign({name:'fellgang:ropes',label:'The families\' ropes and ladders'},o),()=>(list||[]).map(R=>{const p0=R.pts&&R.pts[0];if(!p0)return null;
 const pts=R.pts.map(p=>[p[0]-p0[0],p[1]-p0[1],p[2]-p0[2]]),rec=place('fg-fixed-line',p0[0],p0[2],0,{y:p0[1],rope:{pts,family:R.family|0,y0:0,top:R.top-p0[1]},v:R.family|0});
 if(rec){rec.id=R.id;rec.rope=R;}return rec;}));};
TG.fg.pieces=function(list,o){o=o||{};const G=o.ground||terrainH;return fgDrawInto(Object.assign({name:'fellgang:pieces',label:'The Fellgangs\' road and wall'},o),()=>(list||[]).map((p,i)=>{if(!DEFS[p.key])return null;
 const rec=place(p.key,p.x,p.z,p.ry==null?0:p.ry,{y:p.y==null?G(p.x,p.z):p.y,v:p.v==null?KRAND.hash(o.seed==null?7401:o.seed,i,0x5f7)%97:p.v,family:p.family,face:p.face==null?false:p.face,state:p.state||o.state});
 if(rec)rec.id=p.id;return rec;}));};
/* one def built alone at the origin (y 0, front +z), dry, into a group of its own: TG.fg.proto(key, {v, state, variant}).
   verify.py measures the worn state this way (no rebuild of the sheet); a world can instance it */
TG.fg.proto=function(key,o){return fgDrawInto({name:key,probe:false,label:DEFS[key]?DEFS[key].name:key},()=>[place(key,0,0,0,Object.assign({y:0},o||{}))]);};
/* ---------------------------------------------------------------- the checks (verify.py --assert; a station's too) */
TG.fg.check={
 /* every drawn record's measured box against its key's box (w, d along the local axes: a record at ry 0; h from the floor):
    never more than tol past it on any axis, and filling at least fill.w, fill.d of its w, d and fill.h of its h (the box is an
    upper bound: the owner's variation in size and massing, 2026-11-11) */
 box(recs,tol,fill){tol=tol==null?.5:tol;fill=fill||{w:.65,d:.65,h:.75};const bad=[],rows=[];for(const r of recs){const B=TG.fg.BOX[r.key]||(DEFS[r.key]&&{w:DEFS[r.key].w,d:DEFS[r.key].d,h:DEFS[r.key].h});if(!B||!r.bbox)continue;
  const b=r.bbox,bw=b.mx[0]-b.mn[0],bd=b.mx[2]-b.mn[2],bh=b.mx[1]-r.y,over=bw>B.w+tol||bd>B.d+tol||bh>B.h+tol,under=bw<B.w*fill.w||bd<B.d*fill.d||bh<B.h*fill.h;
  const s=r.key+(r.v?'#'+r.v:'')+(r.fg&&r.fg.family?' ('+r.fg.family+')':'')+' '+bw.toFixed(2)+'x'+bd.toFixed(2)+'x'+bh.toFixed(2);rows.push(s+' of '+B.w+'x'+B.d+'x'+B.h);
  if(over||under)bad.push(s+(over?' past ':' under ')+B.w+'x'+B.d+'x'+B.h);}
  return {ok:!bad.length&&rows.length>0,bad,rows};},
 /* the plinth reaches the footprint's lowest corner: the drawn foot at or under it, the floor at the highest */
 plinth(recs,G){const bad=[];for(const r of recs){const B=TG.fg.BOX[r.key];if(!B||!r.bbox)continue;const S=fgSeat(r,B,G);
  if(r.bbox.mn[1]>S.low+.02||Math.abs(r.y-S.y)>.02)bad.push(r.key+' foot '+r.bbox.mn[1].toFixed(2)+' vs lowest corner '+S.low.toFixed(2)+', floor '+r.y.toFixed(2)+' vs '+S.y.toFixed(2));}
  return {ok:!bad.length&&recs.length>0,bad,fall:Math.max(0,...recs.filter(r=>r.top!=null).map(r=>r.top-r.low))};},
 /* the fixed line follows its record: every vertex of its cable and cordage within tol of the record's polyline, and every
    record point within tol of a vertex (the line neither strays nor stops short) */
 rope(list,meshes,tol){tol=tol==null?.12:tol;const Rs=Array.isArray(list)?list:[list];const V=[];for(const m of meshes){if(m.userData.mk!=='cable'&&m.userData.mk!=='cord')continue;const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3)V.push([a[i],a[i+1],a[i+2]]);}
  const seg=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L0=dx*dx+dy*dy+dz*dz,L=L0>0?L0:1;let t=((p[0]-a[0])*dx+(p[1]-a[1])*dy+(p[2]-a[2])*dz)/L;t=t<0?0:t>1?1:t;return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t,p[2]-a[2]-dz*t);};
  let far=0;for(const v of V){let d=1e9;for(const R of Rs){const pts=R.pts;for(let k=1;k<pts.length&&d>=tol*.5;k++){const q=seg(v,pts[k-1],pts[k]);if(q<d)d=q;}}if(d>far)far=d;}
  let gap=0;for(const p of [].concat(...Rs.map(R=>R.pts))){let d=1e9;for(const v of V){const q=Math.hypot(v[0]-p[0],v[1]-p[1],v[2]-p[2]);if(q<d)d=q;if(d<tol*.5)break;}if(d>gap)gap=d;}
  return {ok:V.length>0&&far<=tol&&gap<=tol,far:+far.toFixed(3),gap:+gap.toFixed(3),verts:V.length};}};
