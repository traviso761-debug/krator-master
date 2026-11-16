// ================================================================= INTERIORS: the rooms behind a building's walls, planned and furnished once for every kit
// A kit opts in by naming its interior sets (kits/interiors/sets/<name>.js) in its build.py: engine.py interiors(sets) adds the
// interiors' core and the sets as a generated fragment that ends `const KIT_INTERIORS = {sets: [...]}`. Without it this file
// does nothing. With it (TODO.md, Viewers; MODULARITY-PLAN.md, "With step 2"):
//   - every placed building whose key has an item in the sets (`<key>#<v>` for variant v, else `<key>`; an item with `skip` has
//     none) is a unit of the host's cut-away (core/host/99-host-cutaway.js): X opens the one nearest the view at its ground
//     storey, [ ] (PageUp / PageDown, Shift + wheel) a storey up or down; its storeys are the item's levels, read from the data
//     without planning anything
//   - ?interiors=1 (or U, which reloads the page with it) plans every such building into rooms and furnishes them from the master
//     catalog through core/furnish (R.interior over kits/interiors), in a batch of their own; the kit's own pieces that stand
//     inside a planned body are left out (SVIX.replaced counts them), so a room is furnished once. Each room is registered in
//     core/tags as a `part` of its building and each piece as `furniture` of its room, before they are drawn; with core/walk on
//     the page the rooms' floors, walls, stairs and entry flights go into KWALK (IX.walk), so the walker climbs inside
//   - _api.interiors() (99-host-take.js) reports the sets, the items found, the units and what was placed
// The cut opens a unit with the host's clipping planes over its box, and the engine's own cut-away (the near half of every
// building with a `cut`, 27-mat.js) with it, so the storey is seen from any side.
const SVIX=(typeof KratorInteriors!=='undefined'&&typeof KIT_INTERIORS!=='undefined')?{sets:KIT_INTERIORS.sets.slice(),on:/[?&]interiors=1\b/.test(location.search),
 units:[],buildings:0,rooms:0,pieces:0,replaced:0,missing:0,errors:[],group:null,ms:0}:null;
/* the item a placed record takes: its variant's, else the key's; none for a skip */
function svixItem(rec){if(!SVIX||!rec)return null;const IXS=KratorInteriors.sets;
 for(const n of SVIX.sets){const S=IXS.byName[n];if(!S)continue;const it=(rec.v?S.byKey[rec.key+'#'+rec.v]:null)||S.byKey[rec.key];if(it)return it.skip?null:it;}return null;}
/* the item's footprints in the building's frame: each body's outer face, each explicit room's outline */
function svixPolys(it){return (it.bodies||[]).map(b=>({poly:b.poly,y:b.y||0})).concat((it.rooms||[]).map(r=>({poly:r.poly,y:r.y||0})));}
/* the storeys from the data: a body's levels (a count at its h, default 3 m, or [{h}]), a room's level and y; the lowest floor of each */
function svixLevels(it,baseY){const L=[];const put=(k,y,h)=>{if(!L[k])L[k]={y,h};else{L[k].y=Math.min(L[k].y,y);L[k].h=Math.max(L[k].h,h);}};
 for(const b of it.bodies||[]){let y=baseY+(b.y||0);const lv=Array.isArray(b.levels)?b.levels:Array.from({length:Math.max(1,b.levels|0)},()=>({h:b.h==null?3:b.h}));
  lv.forEach((l,k)=>{const h=l.h!=null?l.h:b.h!=null?b.h:3;put(k,y,h);y+=h;});}
 for(const r of it.rooms||[])put(r.level|0,baseY+(r.y||0),r.h==null?3:r.h);
 return L.filter(Boolean).sort((a,b)=>a.y-b.y).map((l,i)=>({y:l.y,h:l.h,name:i?'storey '+(i+1):'ground'}));}
/* the units for the host's cut-away: the footprint's box in the building's frame, its middle placed in the world. svixUnitsFor
   reads only {key, name, x, y, z, ry, tid?} and an item for each, so a page on another fork of this engine (kits/post-apoc) lists
   this file and calls it with its own records and its own interiors */
function svixUnits(){return SVIX?svixUnitsFor(REG.filter(r=>!r.parent),svixItem):[];}
function svixUnitsFor(recs,itemOf){const U=[];
 for(const rec of recs){const it=itemOf(rec);if(!it)continue;
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const P of svixPolys(it))for(const p of P.poly){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
  if(!(x1>x0&&z1>z0))continue;const levels=svixLevels(it,rec.y);if(!levels.length)continue;
  const cx=(x0+x1)/2,cz=(z0+z1)/2,c=Math.cos(rec.ry),s=Math.sin(rec.ry);
  U.push({id:rec.tid||rec.key+'@'+U.length,name:rec.name+' ('+it.key+')',key:it.key,x:rec.x+cx*c+cz*s,z:rec.z-cx*s+cz*c,ry:rec.ry,w:x1-x0,d:z1-z0,levels});}
 return U;}
/* is a world point inside one of the record's planned bodies (and under its top)? the kit's own piece there gives way to the rooms */
const _svixIn=new Map();
function svixInside(rec,wx,wy,wz){let F=_svixIn.get(rec);
 if(F===undefined){const it=svixItem(rec);F=null;if(it){const c=Math.cos(rec.ry),s=Math.sin(rec.ry),L=svixLevels(it,rec.y),top=L.length?L[L.length-1].y+L[L.length-1].h:rec.y+3;
   F={top,polys:svixPolys(it).map(P=>P.poly.map(p=>[rec.x+p[0]*c+p[1]*s,rec.z-p[0]*s+p[1]*c]))};}_svixIn.set(rec,F);}
 if(!F||wy>F.top)return false;
 for(const P of F.polys){let inn=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>wz)!==(b[1]>wz)&&wx<(b[0]-a[0])*(wz-a[1])/(b[1]-a[1])+a[0])inn=!inn;}if(inn)return true;}
 return false;}
if(SVIX&&SVIX.on){
 /* the kit's own pieces inside a planned body are left out: the interiors furnish those rooms */
 const svixFurnish0=FURNISH;
 FURNISH=function(key,lx,ly,lz,lry,o){let top=CURREC;while(top&&top.parent)top=top.parent;
  if(top&&!PLACE_DRY){const w=new THREE.Vector3(lx,ly||0,lz).applyMatrix4(CM);if(svixInside(top,w.x,w.y,w.z)){SVIX.replaced++;return null;}}
  return svixFurnish0(key,lx,ly,lz,lry,o);};
 /* the rooms and pieces registered before they are drawn (GODOT-PLAN.md rule 4), as kits/zeijani's 91f-furnish.js does */
 const svixTagAdapter=(base,rec,it)=>{const roomTid={};
  return Object.assign({},base,{build:(p,room)=>{let parent=rec.tid;
   if(room&&SVTAGS&&rec.tid){if(!roomTid[room.id]){const t=SVTAGS.child(rec.tid,{'class':'part',kind:'room',key:room.id,name:(room.kind||'room')+' of '+rec.name,
      at:[room.centroid[0],room.y,room.centroid[1]],ry:rec.ry,tags:{room:room.kind,culture:it.culture||KIT.culture,setting:'room'},note:Math.round(room.area)+' m2',frag:'kits/interiors/sets'});
     roomTid[room.id]=t.id;SVIX.rooms++;}parent=roomTid[room.id];}
   const A=KratorFurniture.FURN_BY_KEY[p.key];
   if(SVTAGS&&parent)SVTAGS.child(parent,{'class':'furniture',kind:A?A.type:'piece',key:p.key,name:A?A.name:p.key,at:[p.x,p.y,p.z],ry:p.ry,
     tags:{culture:A&&A.culture||it.culture||KIT.culture,setting:'room',room:room?room.kind:null,job:A&&A.job||undefined},frag:'kits/catalog'});
   SVIX.pieces++;return base.build(p,room);}});};
 const svixBuildWorld=buildWorld;
 buildWorld=function(){const W0=svixBuildWorld();const t0=performance.now();_svixIn.clear();
  const R=KFURN.create({catalog:KFURN.catalogOf(KratorFurniture),interiors:KratorInteriors,on:true,interiorsOn:true,walk:typeof KWALK!=='undefined'?KWALK:null,
   seed:(o,ctx)=>ctx.seed,draw:()=>({})});
  KFURN.useBatch(R,KratorFurniture,KratorInteriors,{indexed:true});SVIX.buildings=SVIX.rooms=SVIX.pieces=0;SVIX.errors.length=0;SVIX.R=R;
  for(const rec of REG){if(rec.parent)continue;const it=svixItem(rec);if(!it)continue;
   try{const fi=R.interior(it,rec.x,rec.z,rec.ry,svixTagAdapter(R.adapter,rec,it),{baseY:rec.y,prefix:(rec.tid||rec.key)+'.',seed:(DEFS[rec.key]&&DEFS[rec.key].seed|0)+(rec.v|0)*7});
    rec.interior=fi.summary;SVIX.buildings++;
    for(const id in fi.result.plans)for(const l of fi.result.plans[id].lights||[]){const k=Math.round(l.x/.6)+','+Math.round(l.y/.6)+','+Math.round(l.z/.6);
     if(HALOKEY.has(k))continue;HALOKEY.add(k);const c=hc(0xffc878);HALOS.push({x:l.x,y:l.y,z:l.z,r:c.r,g:c.g,b:c.b,big:false});}}
   catch(e){SVIX.errors.push(rec.key+': '+(e&&e.message||e));reportErr('interior '+rec.key+': '+(e&&e.stack||e));}}
  const g=SVIX.group=R.batch.flush(WORLD);g.name='interiors';g.userData.furniture=true;g.userData.interiors=true;
  g.traverse(m=>{if(m.isMesh){const f=m.material.userData.family;m.castShadow=f!=='glow'&&f!=='glass';m.receiveShadow=true;KFURN.linearColours(m.geometry);if(!m.material.map)svfDetail(m.material);}});
  SVIX.missing=Object.keys(R.missing||{}).length;SVIX.ms=Math.round(performance.now()-t0);
  if(typeof nightRebuild==='function')nightRebuild();
  return W0;};
}
/* U: the interiors on or off, by the query (the world is built once, at load) */
function svixToggle(){if(!SVIX)return false;const q=new URLSearchParams(location.search);if(SVIX.on)q.delete('interiors');else q.set('interiors','1');
 location.search=q.toString();return !SVIX.on;}
function svixReport(){if(!SVIX)return null;return {sets:SVIX.sets,on:SVIX.on,items:REG.filter(r=>!r.parent&&svixItem(r)).length,units:SVIX.units.length,
 buildings:SVIX.buildings,rooms:SVIX.rooms,pieces:SVIX.pieces,replaced:SVIX.replaced,missingKeys:SVIX.missing,errors:SVIX.errors.slice(),ms:SVIX.ms};}
