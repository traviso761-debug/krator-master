// ================================================================= FLEETBORN COVE — core/export (krator-world) contributors (FCOVE_EXPORT)  [draw]
// Extends core/export (07-core-export.js, 09-core-export-adapters.js, 10-core-export-scene.js) without clashing with
// biome/tags/atmos/water contributors so EXPORT.world({box: [-700, -900, 900, 750], build: 'settlements/fleetborn-cove'})
// populates every section cleanly with 0 errors and 0 broken joins:
//   - items, buckets, materials, textures (by: 'fcove'): Arcoforte, kits/port d=3, graving cradles, paktong rotors,
//     tide-mill, White Stacks causeway, 529 m spar log-chute, SKK Shore-kin villages, and 89c..89h vessels.
//   - water: injects KTIDE site parameters {px: 236, py: 242, sliceBox: [226, 232, 246, 252], meanRange: 11} so Godot's
//     ktide.gd (KratorTide) reconstructs the exact cove macrotide.
//   - fixtures: exterior portal doors + structured Arcoforte marginal zones/sockets, cradles/rotors/causeway, SKK village
//     buildings, 529 m spar log-chute, and 34 moored + 2 careened fleet berths.
//   - interiors & furniture: Arcoforte's habitable Fleet-born & Shore-kin socketed cutaway units, rooms, links, walls & pieces.
//   - sim: SIM.export() + FCOVE_SIM 92-day paktong stocks/ledger, 5-fleet schedule, and FCOVE_LIFE summary.
const FCOVE_EXPORT=(function initFcoveExport(){
 'use strict';
 const LY=FCOVE_LAYOUT,AF=LY.arcoforte;
 const TG=(typeof KTAGS!=='undefined'&&KTAGS)?KTAGS.page:null;
 const BY={by:'fcove'};

 function reg(section,fn){
  if(typeof EXPORT!=='undefined'&&EXPORT&&typeof EXPORT.register==='function'){
   EXPORT.register(section,fn,BY);
  }else{
   (window.EXPORT_QUEUE=window.EXPORT_QUEUE||[]).push([section,fn,BY]);
  }
 }

 /* 1. Attach KTIDE site parameters onto WATER.PRESETS.tide so WATER.export() / 09-core-export-adapters always carries it */
 const TIDE_EXPORT_META=Object.freeze({
  px:236,
  py:242,
  originPx:[236,242],
  sliceBox:[226,232,246,252],
  meanRange:11,
  syzygyPeriodD:45.5,
  doubleDarkPeriodD:91,
  sillMaxMps:FCOVE_TIDE.SPEC.sill.vMax,
  slackMaxMps:FCOVE_TIDE.SPEC.sill.slackMaxMps,
  causewayExposeM:FCOVE_TIDE.SPEC.causeway.exposeLevel
 });
 if(typeof WATER!=='undefined'&&WATER&&WATER.PRESETS){
  WATER.PRESETS.tide=Object.assign({},TIDE_EXPORT_META);
 }

 /* 2. Pre-register exterior doors and key berth/work fixtures in KTAGS.page so registry & fixtures agree 1:1 */
 if(TG&&typeof TG.add==='function'){
  const addFix=rec=>{
   if(TG.get&&TG.get(rec.id))return TG.get(rec.id);
   return TG.add(rec);
  };
  if(typeof KDOOR!=='undefined'&&Array.isArray(KDOOR.list)){
   for(let i=0;i<KDOOR.list.length;i++){
    const d=KDOOR.list[i];
    if(!d||!/^af\.door\./.test(d.id))continue;
    addFix({
     id:'fix.'+d.id,
     'class':'fixture',
     kind:'door',
     key:'arcoforte:portal_door',
     parent:'site:fleetborn-arcoforte',
     name:'Arcoforte Portal Door ('+d.id.replace(/^af\.door\./,'')+')',
     at:[+d.at[0].toFixed(2),+d.at[1].toFixed(2),+d.at[2].toFixed(2)],
     ry:+(d.yaw==null?0:d.yaw).toFixed(4),
     size:[d.w==null?3.6:d.w,0.28,d.h==null?3.6:d.h],
     tags:{culture:'ancient',door:d.locked?'gate':'double',state:d.locked?'ruined':'intact'}
    });
   }
  }
  LY.cradles.forEach(c=>{
   const p=LY.XZ(c.s,c.a0+1.0);
   addFix({
    id:'fix.gate.'+c.id,
    'class':'fixture',
    kind:'caisson_gate',
    key:'fcove:jammed_caisson',
    parent:'fcove.'+c.id,
    name:c.name+' Jammed-Open Paktong Sill Gate',
    at:[+p[0].toFixed(2),c.sill,+p[1].toFixed(2)],
    ry:+LY.portYaw.toFixed(4),
    size:[c.w,2.4,6.8],
    tags:{culture:'cflit-qbon',door:'gate',state:'salvage'}
   });
  });
  LY.sillRotors.units.forEach(u=>{
   addFix({
    id:'fix.'+u.id,
    'class':'fixture',
    kind:'rotor_unit',
    key:'fcove:paktong_rotor',
    parent:LY.sillRotors.id,
    name:'Reversible Paktong Sill Rotor #'+(u.index+1)+' ('+u.side+')',
    at:[u.x,u.hubY,u.z],
    ry:+Math.atan2(LY.axis[0],LY.axis[1]).toFixed(4),
    size:[u.bladeR*2,3.2,u.pierTopY-u.bedY],
    tags:{culture:'cflit-qbon',state:'intact'}
   });
  });
  FCOVE_SCENE.moored.forEach(m=>{
   const v=m.spec;
   addFix({
    id:'fix.berth.'+v.id.replace(/^fcove\./,''),
    'class':'fixture',
    kind:'mooring_berth',
    key:'fcove:mooring_ring',
    parent:v.id,
    name:v.name+' Nephrite & Paktong Mooring Berth',
    at:[v.x,0,v.z],
    ry:v.yaw,
    size:[v.r*1.4,v.r*1.4,4.0],
    tags:{culture:v.culture==='hueru-kuran'?'hueru-kuran':'cflit-qbon',state:'intact'}
   });
  });
 }

 /* 3. Scene Reader for Fleetborn Cove's non-biome buildings, cradles, spar chute, SKK villages & vessels */
 function buildOwnerLookup(){
  if(!TG)return()=>null;
  const C=48,grid=new Map();
  const recs=TG.records||[];
  for(let i=0;i<recs.length;i++){
   const r=recs[i];
   if(!r||r.removed||r.set||!r.uid||!Array.isArray(r.at))continue;
   const cls=r['class'];
   if(cls!=='building'&&cls!=='prop'&&cls!=='vessel'&&cls!=='landmark')continue;
   const rad=r.size?Math.hypot(r.size[0],r.size[1])*0.55:(r.r==null?8:r.r);
   if(rad>260||rad<=0)continue;
   const h=r.size?r.size[2]:(r.h==null?12:r.h);
   const v={id:r.id,x:r.at[0],z:r.at[2],r:rad+2.5,y0:r.at[1]-4,y1:r.at[1]+h+6,area:rad*rad};
   const i0=Math.floor((v.x-v.r)/C),i1=Math.floor((v.x+v.r)/C);
   const j0=Math.floor((v.z-v.r)/C),j1=Math.floor((v.z+v.r)/C);
   for(let gx=i0;gx<=i1;gx++){
    for(let gz=j0;gz<=j1;gz++){
     const k=gx+','+gz;
     let L=grid.get(k);
     if(!L){L=[];grid.set(k,L);}
     L.push(v);
    }
   }
  }
  return function ownerAt(x,y,z){
   const L=grid.get(Math.floor(x/C)+','+Math.floor(z/C));
   if(!L)return null;
   let best=null;
   for(let i=0;i<L.length;i++){
    const v=L[i],dx=x-v.x,dz=z-v.z;
    if(dx*dx+dz*dz<=v.r*v.r&&y>=v.y0&&y<=v.y1&&(!best||v.area<best.area)){
     if(TG.get(v.id)&&!TG.get(v.id).removed)best=v;
    }
   }
   return best?best.id:null;
  };
 }

 function isExcludedHierarchy(m){
  for(let p=m;p;p=p.parent){
   if(!p.name&&!p.userData)continue;
   if(p.userData&&(p.userData.khost||p.userData.fcoveLife||p.userData.door||p.userData.farField))return'host/life/far';
   if(p.userData&&p.userData.kind==='vessel')return'vessel (exported as instanced item)';
   if(p.name&&p.name.indexOf('fcove:fleet-')===0)return'moored fleet (exported as instanced item)';
   if(p.name==='arcoforte:interiors'||p.name==='arcoforte:doors')return'lazy cutaway interiors';
  }
  return null;
 }

 const rsUnitCache=new Map();
 function getVesselUnitBuckets(rsKey){
  if(rsUnitCache.has(rsKey))return rsUnitCache.get(rsKey);
  const res=[];
  if(typeof FCOVE_RINGSEA==='undefined'||!FCOVE_RINGSEA||typeof FCOVE_RINGSEA.make!=='function'){
   rsUnitCache.set(rsKey,res);
   return res;
  }
  const made=FCOVE_RINGSEA.make(rsKey);
  if(!made||!made.group){rsUnitCache.set(rsKey,res);return res;}
  made.group.updateMatrixWorld(true);
  const byMat=new Map(),v3=new THREE.Vector3(),n3=new THREE.Matrix3();
  made.group.traverse(m=>{
   if(!m.isMesh||!m.geometry||!m.geometry.attributes||!m.geometry.attributes.position)return;
   const m0=Array.isArray(m.material)?m.material[0]:m.material;
   if(!m0||m0.isShaderMaterial||m0.isRawShaderMaterial||m0.blending===THREE.AdditiveBlending)return;
   const g=m.geometry,at=g.attributes,Pp=at.position,Nn=at.normal,Uv=at.uv,Cc=at.color,Ix=g.index;
   let B=byMat.get(m0);
   if(!B){B={mat:m0,pos:[],nor:[],uv:[],col:[],hasUv:false,hasCol:false};byMat.set(m0,B);}
   if(Uv)B.hasUv=true;
   if(Cc)B.hasCol=true;
   n3.getNormalMatrix(m.matrixWorld);
   const cnt=Ix?Ix.count:Pp.count;
   for(let i=0;i<cnt;i++){
    const iv=Ix?Ix.getX(i):i;
    v3.fromBufferAttribute(Pp,iv).applyMatrix4(m.matrixWorld);
    B.pos.push(v3.x,v3.y,v3.z);
    if(Nn){v3.fromBufferAttribute(Nn,iv).applyMatrix3(n3).normalize();B.nor.push(v3.x,v3.y,v3.z);}
    else B.nor.push(0,1,0);
    B.uv.push(Uv?Uv.getX(iv):0,Uv?Uv.getY(iv):0);
    B.col.push(Cc?Cc.getX(iv):1,Cc?Cc.getY(iv):1,Cc?Cc.getZ(iv):1);
   }
  });
  let mi=0;
  byMat.forEach(B=>{
   if(!B.pos.length)return;
   res.push({
    subIdx:mi++,
    mat:B.mat,
    pos:new Float32Array(B.pos),
    nor:new Float32Array(B.nor),
    uv:B.hasUv?new Float32Array(B.uv):null,
    col:B.hasCol?new Float32Array(B.col):null
   });
  });
  rsUnitCache.set(rsKey,res);
  return res;
 }

 function appendInstancedVessels(ctx,C,own,out){
  if(!FCOVE_SCENE||typeof EXPORT==='undefined'||typeof EXPORT.pack!=='function')return;
  const byKey=new Map();
  const m4=new THREE.Matrix4(),eu=new THREE.Euler(0,0,0,'YXZ'),q4=new THREE.Quaternion(),pos=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const addSpec=(rsKey,id,x,y,z,yaw,roll)=>{
   if(!rsKey||!ctx.inBox(x,z))return;
   let L=byKey.get(rsKey);
   if(!L){L=[];byKey.set(rsKey,L);}
   eu.set(0,yaw==null?0:yaw,roll==null?0:roll,'YXZ');
   q4.setFromEuler(eu);
   pos.set(x,y,z);
   m4.compose(pos,q4,one);
   L.push({id:id,els:m4.elements.slice()});
  };
  (FCOVE_SCENE.careened||[]).forEach(cv=>{
   const sp=cv.spec,gp=cv.group;
   if(!sp||!gp||gp.visible===false)return;
   addSpec(sp.rsKey,sp.id,gp.position.x,gp.position.y,gp.position.z,gp.rotation.y,gp.rotation.z);
  });
  (FCOVE_SCENE.moored||[]).forEach(mv=>{
   const sp=mv.spec,gp=mv.group;
   if(!sp||(gp&&gp.visible===false))return;
   const wy=gp?gp.position.y:0;
   addSpec(sp.rsKey,sp.id,sp.x,wy,sp.z,sp.yaw,0);
  });
  byKey.forEach((insts,rsKey)=>{
   const subs=getVesselUnitBuckets(rsKey);
   if(!subs.length||!insts.length)return;
   const n=insts.length,mats=new Float32Array(n*16);
   const owners=[];
   for(let i=0;i<n;i++){
    mats.set(insts[i].els,i*16);
    owners.push(TG&&TG.get(insts[i].id)?insts[i].id:null);
   }
   const packedMats=EXPORT.pack(mats);
   for(let s=0;s<subs.length;s++){
    const sb=subs[s];
    const mid=C.matOf(sb.mat,null);
    const gg={position:EXPORT.pack(sb.pos),normal:EXPORT.pack(sb.nor)};
    if(sb.uv)gg.uv=EXPORT.pack(sb.uv);
    if(sb.col)gg.color=EXPORT.pack(sb.col);
    const nm='vessel:'+rsKey+'~'+sb.subIdx;
    out.items.push({
     id:'fcove/'+nm,
     name:nm,
     kit:'ringsea',
     label:'Ring Sea Vessel '+rsKey,
     material:mid,
     lod:null,
     count:n,
     dynamic:true,
     visible:true,
     closed:false,
     geometry:gg,
     matrices:packedMats,
     colours:null,
     owners:owners.slice(),
     extras:{}
    });
   }
  });
 }

 function assembleScene(ctx){
  if(typeof EXPORT==='undefined'||typeof EXPORT.sceneReader!=='function')return{items:[],buckets:[],materials:[],textures:[]};
  const bioSet=new Set(typeof BIO!=='undefined'&&Array.isArray(BIO.baked)?BIO.baked:[]);
  const waterMeshes=new Set();
  if(typeof WATER!=='undefined'&&Array.isArray(WATER.drawn)){
   WATER.drawn.forEach(d=>{
    if(d&&d.mesh)waterMeshes.add(d.mesh);
    if(d&&d.plunge)waterMeshes.add(d.plunge);
   });
  }
  if(FCOVE_SCENE&&FCOVE_SCENE.basinWaterMesh)waterMeshes.add(FCOVE_SCENE.basinWaterMesh);
  if(typeof COVE_TIDE!=='undefined'&&COVE_TIDE.T&&Array.isArray(COVE_TIDE.T.plungeMeshes)){
   COVE_TIDE.T.plungeMeshes.forEach(pm=>{if(pm&&pm.mesh)waterMeshes.add(pm.mesh);});
  }

  const skipCommon=m=>{
   if(bioSet.has(m)||(m.userData&&m.userData.biome))return'biome mesh (exported by biome)';
   if(waterMeshes.has(m))return'water surface (exported by water)';
   if(typeof GROUND!=='undefined'&&m===GROUND)return'terrain ground mesh';
   if(typeof FAR!=='undefined'&&FAR&&m===FAR.mesh)return'farfield mesh';
   if(typeof sky!=='undefined'&&m===sky)return'sky dome';
   if(typeof giant!=='undefined'&&(m===giant||m===giantRing))return'gas giant';
   if(m.visible===false)return'hidden mesh';
   return isExcludedHierarchy(m);
  };

  const reader=EXPORT.sceneReader({
   name:'fcove',
   source:'fcove',
   scene:scene,
   tags:TG,
   owner:buildOwnerLookup(),
   skipInstanced:skipCommon,
   skipMesh:skipCommon
  });
  return reader.assemble(ctx,appendInstancedVessels);
 }

 const SC=ctx=>ctx.memo('fcove-scene',()=>assembleScene(ctx));
 reg('items',ctx=>SC(ctx).items);
 reg('buckets',ctx=>SC(ctx).buckets);
 reg('materials',ctx=>SC(ctx).materials);
 reg('textures',ctx=>SC(ctx).textures);

 /* 4. FIXTURES: structured Arcoforte / drydock / Shore-kin / spar-chute / fleet manifest + KTAGS fixture records */
 reg('fixtures',ctx=>{
  if(ctx.out&&ctx.out.water&&!ctx.out.water.tide){
   ctx.out.water.tide=Object.assign({},TIDE_EXPORT_META,{
    spec:FCOVE_TIDE.SPEC,
    data:typeof KTIDE_DATA!=='undefined'?KTIDE_DATA:null
   });
  }
  const afBuilt=FCOVE_SCENE?FCOVE_SCENE.arcoforte:null;
  const W=FCOVE_SCENE?FCOVE_SCENE.world:null;
  const vData=W?W.villagesData:null;

  const fxRecs=[];
  if(TG){
   for(let i=0;i<TG.records.length;i++){
    const r=TG.records[i];
    if(!r||r['class']!=='fixture'||r.removed||r.set||!r.at)continue;
    if(!ctx.inBox(r.at[0],r.at[2]))continue;
    const par=r.parent?TG.get(r.parent):null;
    const baseY=par&&par.at?par.at[1]:0;
    fxRecs.push({
     id:r.id,
     uid:r.uid,
     'class':'fixture',
     kind:r.kind,
     parent:r.parent||null,
     name:r.name,
     at:r.at.slice(),
     ry:r.ry==null?0:r.ry,
     size:r.size?r.size.slice():[2,0.5,2],
     tags:Object.assign({},r.tags),
     host:{wall:null,side:'outside',sill:+(r.at[1]-baseY).toFixed(2)}
    });
   }
  }

  return{
   format:'krator-fixtures',
   version:1,
   build:ctx.build||'settlements/fleetborn-cove',
   arcoforte:{
    id:AF.id,
    state:afBuilt?afBuilt.state:'marginal',
    zones:afBuilt&&afBuilt.plan?Object.assign({},afBuilt.plan.zones):null,
    sockets:afBuilt&&afBuilt.intHost?afBuilt.intHost.zoneSockets():{bastions:'fleetborn',ring:'fleetborn',harbour:'shorekin'},
    frame:{x:AF.x,y0:AF.y0,z:AF.z,yaw:AF.yaw,span:AF.span}
   },
   drydock:{
    cradles:LY.cradles,
    portSegments:LY.portSegs,
    sillRotors:LY.sillRotors,
    tideMill:LY.tideMill,
    smeltHearth:LY.smeltHearth,
    causeway:LY.causeway
   },
   shorekin:{
    harbourWorks:LY.harbourWorks,
    sparChute:Object.assign({},LY.sparChute,{axialSpanM:LY.sparChute.sHead-LY.sparChute.sFoot}),
    villages:vData?vData.villages.map(v=>({
     id:v.spec.id,
     name:v.spec.name,
     focus:v.spec.focus,
     pop:v.pop,
     minY:v.minY,
     maxY:v.maxY,
     buildingCount:v.village.records.length,
     clientContract:v.clientContract
    })):[]
   },
   fleets:{
    caretakerHulls:FCOVE_SIM.CARETAKER_HULLS,
    visitingBerths:LY.fleetSlots
   },
   records:fxRecs
  };
 });

 /* 5. INTERIORS: Arcoforte habitable cutaway zones (Rooms, Doors, Stairs & Partition Walls) */
 reg('interiors',ctx=>{
  const afBuilt=FCOVE_SCENE?FCOVE_SCENE.arcoforte:null;
  const intHost=afBuilt?afBuilt.intHost:null;
  if(!intHost||!intHost.built||!Array.isArray(intHost.built.units))return null;
  const regIds=ctx.out&&ctx.out.registry&&Array.isArray(ctx.out.registry.records)
   ?new Set(ctx.out.registry.records.map(r=>r.id))
   :null;

  const buildings=[];
  for(let ui=0;ui<intHost.built.units.length;ui++){
   const u=intHost.built.units[ui];
   if(!u||!u.kept)continue;
   const bId='int.'+u.id;
   if(regIds&&!regIds.has(bId))continue;
   if(!regIds&&TG&&!TG.get(bId))continue;

   const storeys=[];
   const links=[];
   const walls=[];
   const roomIds=new Set();
   const doorsByRoom=new Map();

   for(let si=0;si<u.storeys.length;si++){
    const st=u.storeys[si];
    const rooms=[];
    for(let ri=0;ri<(st.rooms||[]).length;ri++){
     const R=st.rooms[ri];
     if(!R||!Array.isArray(R.poly)||R.poly.length<3||roomIds.has(R.id))continue;
     roomIds.add(R.id);
     doorsByRoom.set(R.id,[]);
     rooms.push({
      id:R.id,
      kind:R.kind||'hall',
      poly:R.poly.map(p=>[+p[0].toFixed(2),+p[1].toFixed(2)]),
      y:+(R.y==null?st.y:R.y).toFixed(2),
      h:+(R.h==null?st.h:R.h).toFixed(2),
      doors:[]
     });
    }
    if(!rooms.length)continue;

    const stWalls=st.walls||[];
    for(let wi=0;wi<stWalls.length;wi++){
     const Wl=stWalls[wi],pts=Wl&&Wl.pts;
     if(!pts||pts.length<2)continue;
     const wh=+(Wl.broken?1.0:Math.min(st.h,3.6)).toFixed(2);
     for(let pi=0;pi+1<pts.length;pi++){
      walls.push({
       id:st.id+'.w'+wi+'.'+pi,
       kind:'partition',
       a:[+pts[pi][0].toFixed(2),+pts[pi][1].toFixed(2)],
       b:[+pts[pi+1][0].toFixed(2),+pts[pi+1][1].toFixed(2)],
       y:+st.y.toFixed(2),
       h:wh,
       col:true
      });
     }
     if(Wl.door&&Wl.door.at&&rooms.length>=1){
      const lid=st.id+'.door.'+wi;
      const rA=rooms[wi%rooms.length].id;
      const rB=rooms.length>1?rooms[(wi+1)%rooms.length].id:'outside';
      const dx=+Wl.door.at[0].toFixed(2),dz=+Wl.door.at[1].toFixed(2),dy=+st.y.toFixed(2);
      links.push({
       id:lid,
       kind:'door',
       a:rA,
       b:rB,
       at:[dx,dy,dz],
       from:[dx,dy,dz],
       to:[dx,dy,dz]
      });
      doorsByRoom.get(rA).push(lid);
      if(rB!=='outside'&&doorsByRoom.has(rB))doorsByRoom.get(rB).push(lid);
     }
    }

    storeys.push({
     k:st.level==null?si:st.level,
     y:+st.y.toFixed(2),
     h:+st.h.toFixed(2),
     rooms:rooms
    });
   }

   if(!storeys.length)continue;
   for(let si=0;si+1<storeys.length;si++){
    const sA=storeys[si],sB=storeys[si+1];
    const rA=sA.rooms[0].id,rB=sB.rooms[0].id;
    const p0=sA.rooms[0].poly[0];
    links.push({
     id:u.id+'.stair.'+si,
     kind:'stair',
     a:rA,
     b:rB,
     at:[p0[0],sA.y,p0[1]],
     from:[p0[0],sA.y,p0[1]],
     to:[p0[0],sB.y,p0[1]]
    });
   }

   for(let si=0;si<storeys.length;si++){
    const rms=storeys[si].rooms;
    for(let ri=0;ri<rms.length;ri++){
     rms[ri].doors=doorsByRoom.get(rms[ri].id)||[];
    }
   }

   const hw=(u.w==null?(u.r==null?20:u.r*2):u.w)*0.5;
   const hd=(u.d==null?(u.r==null?20:u.r*2):u.d)*0.5;
   buildings.push({
    id:bId,
    name:u.name,
    zone:u.zone,
    storeys:storeys,
    links:links,
    walls:walls,
    yard:{y:storeys[0].y,poly:[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]]}
   });
  }

  if(!buildings.length)return null;
  return{
   format:'krator-interiors',
   version:1,
   frame:'arcoforte-local (parented under site:fleetborn-arcoforte frame)',
   buildings:buildings
  };
 });

 /* 6. FURNITURE: Fleet-born & Shore-kin socket placements registered by KFURN in Arcoforte */
 reg('furniture',ctx=>{
  if(!TG)return null;
  const pieces=new Map();
  const placements=[];
  for(let i=0;i<TG.records.length;i++){
   const r=TG.records[i];
   if(!r||r['class']!=='furniture'||r.removed||r.set||!r.at)continue;
   if(!ctx.inBox(r.at[0],r.at[2]))continue;
   const v=r.tags&&r.tags.variant!=null?r.tags.variant:0;
   const pid=(r.key||'piece')+'/'+v+'/0';
   if(!pieces.has(pid)){
    pieces.set(pid,{
     id:pid,
     entry:{
      key:r.key,
      variant:v,
      role:r.kind||'furniture',
      anchor:'floor',
      size:r.size?r.size.slice():[1,1,1],
      tags:Object.assign({},r.tags)
     },
     lights:null,
     mesh:null
    });
   }
   placements.push({
    record:r.id,
    piece:pid,
    at:r.at.slice(),
    ry:r.ry==null?0:r.ry,
    parent:r.parent||null,
    room:r.tags&&r.tags.room?r.tags.room:null
   });
  }
  if(!placements.length)return null;
  const afInt=FCOVE_SCENE&&FCOVE_SCENE.arcoforte&&FCOVE_SCENE.arcoforte.intHost?FCOVE_SCENE.arcoforte.intHost:null;
  return{
   format:'krator-furniture',
   version:1,
   sockets:afInt?afInt.zoneSockets():{bastions:'fleetborn',ring:'fleetborn',harbour:'shorekin'},
   pieces:Array.from(pieces.values()),
   placements:placements
  };
 });

 /* 7. SIM: SIM.export() + FCOVE_SIM 92-day stocks/ledger/fleet schedule + FCOVE_LIFE summary */
 reg('sim',()=>{
  if(typeof SIM==='undefined'||typeof SIM.export!=='function')return null;
  const base=SIM.export();
  const W=FCOVE_SCENE?FCOVE_SCENE.world:null;
  const clk=(typeof KHOST!=='undefined'&&KHOST.host)?KHOST.host.clock:null;
  const curDay=clk?clk.day:90;
  return Object.assign({},base,{
   fcove:{
    tide:Object.assign({},TIDE_EXPORT_META,{spec:FCOVE_TIDE.SPEC}),
    dayState:W?W.dayState(curDay):null,
    metrics:W?W.metrics:null,
    audit:W?W.audit():null,
    fleetSchedule:W?W.dailyLog.map(d=>({
     day:d.day,
     phase:d.phase,
     range:d.range,
     smeltActive:d.smeltActive,
     paktongSmelted:d.paktongSmelted,
     fleetsInCove:d.fleetsInCove,
     fleetIds:d.fleetIds,
     mootPop:d.mootPop
    })):[],
    lifeSummary:(typeof FCOVE_LIFE!=='undefined'&&FCOVE_LIFE)?FCOVE_LIFE.status():null
   }
  });
 });

 function exportWorld(boxOpt){
  const box=boxOpt||[-700,-900,900,750];
  return EXPORT.world({box:box,build:'settlements/fleetborn-cove',sky:128});
 }

 return{
  DEFAULT_BOX:[-700,-900,900,750],
  PROFILE:['registry','items','buckets','materials','textures','terrain','stage','atmos','water','fixtures','interiors','furniture','sim'],
  tideMeta:TIDE_EXPORT_META,
  exportWorld:exportWorld
 };
})();
window.FCOVE_EXPORT=FCOVE_EXPORT;
