/* ================================================================= STAGE 7 KROOMLIGHT CONTROLLER: room-graph daylight & 6-light pool
   Implements GRAPHICS-TERRAIN-PROPOSAL.md Stage 7 (I1-I4) over CURREC.rooms recorded by tbWallRing / tbRoom:
   - Links exterior windows, exterior doorways, 1-hop internal portals, and warm oil/crystal lamps into KROOMLIGHT.buildTable.
   - Drives a persistent 6-PointLight pool (zero shader recompiles, zero shadow-map sampler bloat) via KROOMLIGHT.pickPool
     whenever the camera enters an indoor room or cut-away (X) is active, with I1 exterior sun/sky attenuation indoors. */
(function(){
 if(typeof KROOMLIGHT==='undefined'||typeof THREE==='undefined'||typeof scene==='undefined')return;

 const RL_POOL=[];
 for(let i=0;i<6;i++){
  const pt=new THREE.PointLight(0xffc478,0,10,1.8);
  pt.castShadow=false;
  scene.add(pt);
  RL_POOL.push(pt);
 }

 let RL_ROOMS=[],RL_WINS=[],RL_LAMPS=[],RL_TABLE=null,RL_INDOOR_K=0,RL_SUN_BASE=null,RL_HEMI_BASE=null,RL_LAST_NIGHT=null;
 const COL_WIN=new THREE.Color(0xdcf0f4),COL_TMP=new THREE.Color();

 function boxVol(b){return Math.max(0.1,(b[3]-b[0])*(b[4]-b[1])*(b[5]-b[2]));}
 function inBox(b,x,y,z,padXZ,padY){
  const px=padXZ==null?0:padXZ,py=padY==null?0:padY;
  return x>=b[0]-px&&x<=b[3]+px&&y>=b[1]-py&&y<=b[4]+py&&z>=b[2]-px&&z<=b[5]+px;
 }

 function tbRoomAt(x,y,z){
  let best=null,bestV=1e18;
  for(let i=0;i<RL_ROOMS.length;i++){
   const r=RL_ROOMS[i];
   if(r.outdoor)continue;
   if(inBox(r.box,x,y,z,0.15,0.2)){
    const v=boxVol(r.box);
    if(v<bestV){bestV=v;best=r;}
   }
  }
  return best;
 }

 function tbNearestCutRoom(x,y,z){
  let best=null,bestD2=48*48;
  for(let i=0;i<RL_ROOMS.length;i++){
   const r=RL_ROOMS[i];
   if(r.outdoor)continue;
   const b=r.box,cx=(b[0]+b[3])*0.5,cy=(b[1]+b[4])*0.5,cz=(b[2]+b[5])*0.5;
   const dx=x-cx,dy=(y-cy)*0.5,dz=z-cz,d2=dx*dx+dy*dy+dz*dz;
   if(d2<bestD2){bestD2=d2;best=r;}
  }
  return best;
 }

 function tbRoomLightRebuild(){
  RL_ROOMS=[];RL_WINS=[];RL_LAMPS=[];
  for(const rec of REG){
   if(rec.parent||rec.cls!=='building')continue;
   const raw=(rec.rooms||[]).map(r=>({
    id:r.id,site:rec.key,box:r.box.slice(),outdoor:!!r.outdoor,vault:!!r.vault,
    skylight:!!r.skylight,doors:[],windows:[],lamps:[]
   }));
   const targs=rec.targets||[];
   for(const rm of raw){
    if(rm.outdoor)continue;
    const area=(rm.box[3]-rm.box[0])*(rm.box[5]-rm.box[2]);
    if(area>180){
     const hasOut=targs.some(t=>!t.indoor&&inBox(rm.box,t.x,t.y+0.5,t.z,0.2,0.6));
     const hasNested=raw.some(o=>o!==rm&&!o.outdoor&&boxVol(o.box)<boxVol(rm.box)*0.65&&
      inBox(rm.box,(o.box[0]+o.box[3])*0.5,(o.box[1]+o.box[4])*0.5,(o.box[2]+o.box[5])*0.5,0.2,0.5));
     if(hasOut&&hasNested)rm.outdoor=true;
    }
   }
   for(let ti=0;ti<targs.length;ti++){
    const t=targs[ti];
    if(!t.indoor)continue;
    const hit=raw.some(rm=>!rm.outdoor&&inBox(rm.box,t.x,t.y+0.6,t.z,0.35,0.6));
    if(!hit){
     raw.push({
      id:(rec.tid||rec.key)+'.tg'+(ti+1),site:rec.key,
      box:[+(t.x-3.0).toFixed(3),+t.y.toFixed(3),+(t.z-3.0).toFixed(3),+(t.x+3.0).toFixed(3),+(t.y+3.6).toFixed(3),+(t.z+3.0).toFixed(3)],
      outdoor:false,vault:false,skylight:true,doors:[{out:true,w:2.6}],windows:[],lamps:[]
     });
    }
   }
   for(const d of (rec.doors||[])){
    const touched=raw.filter(rm=>!rm.outdoor&&inBox(rm.box,d.wx,d.wy+0.8,d.wz,1.05,0.6));
    const dw=d.w==null?1.5:d.w;
    if(touched.length>=2){
     touched.sort((a,b)=>boxVol(a.box)-boxVol(b.box));
     const rA=touched[0],rB=touched[1];
     rA.doors.push({to:rB.id,w:dw});
     rB.doors.push({to:rA.id,w:dw});
    }else if(touched.length===1){
     touched[0].doors.push({out:true,w:dw});
    }
   }
   for(const w of (rec.windows||[])){
    const cands=raw.filter(rm=>!rm.outdoor&&inBox(rm.box,w.wx,w.wy+0.5,w.wz,1.05,0.6)).sort((a,b)=>boxVol(a.box)-boxVol(b.box));
    if(!cands.length)continue;
    const rm=cands[0],wh=w.h==null?1.4:w.h,ww=w.w==null?1.3:w.w;
    const wx=+(w.wx-Math.sin(w.yaw)*0.72).toFixed(3),wy=+(w.wy+wh*0.5).toFixed(3),wz=+(w.wz-Math.cos(w.yaw)*0.72).toFixed(3);
    const wRec={room:rm.id,x:wx,y:wy,z:wz,w:ww,h:wh};
    rm.windows.push(wRec);
    RL_WINS.push(wRec);
   }
   for(const rm of raw)RL_ROOMS.push(rm);
  }

  for(const h of (typeof HALOS!=='undefined'?HALOS:[])){
   const rm=tbRoomAt(h.x,h.y,h.z);
   if(!rm)continue;
   const lRec={
    room:rm.id,x:+h.x.toFixed(3),y:+(h.y+0.08).toFixed(3),z:+h.z.toFixed(3),
    amp:h.big?1.4:0.95,r:h.big?10.0:8.0,color:[Math.min(1,h.r*1.1),h.g,h.b*0.85]
   };
   rm.lamps.push(lRec);
   RL_LAMPS.push(lRec);
  }

  for(const rm of RL_ROOMS){
   if(rm.outdoor||rm.lamps.length>0)continue;
   const b=rm.box,cx=+((b[0]+b[3])*0.5).toFixed(3),cy=+(b[1]+Math.min(2.5,(b[4]-b[1])*0.72)).toFixed(3),cz=+((b[2]+b[5])*0.5).toFixed(3);
   const fb={room:rm.id,x:cx,y:cy,z:cz,amp:0.78,r:7.5,color:[1.0,0.78,0.46]};
   rm.lamps.push(fb);
   RL_LAMPS.push(fb);
  }

  RL_TABLE=KROOMLIGHT.buildTable({rooms:RL_ROOMS});
  return RL_TABLE;
 }

 const origSkyApply=typeof skyApply==='function'?skyApply:null;
 if(origSkyApply){
  skyApply=function(){
   origSkyApply();
   RL_SUN_BASE=sun.intensity;
   RL_HEMI_BASE=hemi.intensity;
   RL_LAST_NIGHT=SKY.night;
  };
 }
 RL_SUN_BASE=sun.intensity;
 RL_HEMI_BASE=hemi.intensity;
 RL_LAST_NIGHT=SKY.night;

 FRAME_HOOKS.push(function tbRoomLightTick(dt){
  if(!RL_TABLE)return;
  if(RL_LAST_NIGHT!==SKY.night){
   RL_SUN_BASE=sun.intensity;
   RL_HEMI_BASE=hemi.intensity;
   RL_LAST_NIGHT=SKY.night;
  }
  const c=camera.position;
  const inRoom=tbRoomAt(c.x,c.y,c.z);
  const cutOn=typeof ANIMU!=='undefined'&&ANIMU.uCut&&ANIMU.uCut.value>0.5;
  const wantIndoor=(inRoom&&!cutOn)?1:0;
  const step=Math.min(1,(dt==null?0.016:dt)*6.5);
  RL_INDOOR_K+=(wantIndoor-RL_INDOOR_K)*step;
  if(Math.abs(wantIndoor-RL_INDOOR_K)<0.002)RL_INDOOR_K=wantIndoor;

  const active=inRoom||(cutOn?tbNearestCutRoom(c.x,c.y,c.z):null);
  const sunUp=SKY.night?0:clamp(LIGHTDIR.y*1.35,0,1);

  if(RL_SUN_BASE!=null&&RL_HEMI_BASE!=null){
   if(RL_INDOOR_K>0.001&&inRoom){
    const row=RL_TABLE.byId[inRoom.id];
    const dayKeep=0.18+0.42*(row?row.daylight:0.35);
    sun.intensity=RL_SUN_BASE*lerp(1,dayKeep,RL_INDOOR_K);
    hemi.intensity=RL_HEMI_BASE*lerp(1,0.32+0.38*(row?row.daylight:0.35),RL_INDOOR_K);
   }else{
    sun.intensity=RL_SUN_BASE;
    hemi.intensity=RL_HEMI_BASE;
   }
  }

  if(!active||(NIGHT.on&&!inRoom&&!cutOn)){
   for(let i=0;i<RL_POOL.length;i++)RL_POOL[i].intensity=0;
   return;
  }
  const picks=KROOMLIGHT.pickPool({
   eye:[c.x,c.y,c.z],eyeRoom:active.id,table:RL_TABLE,
   count:RL_POOL.length,maxWindows:sunUp>0.08?3:0,heroShadows:2,
   sunUp,windows:RL_WINS,lamps:RL_LAMPS
  });
  const boost=inRoom?1.0:0.65;
  for(let i=0;i<RL_POOL.length;i++){
   const pt=RL_POOL[i],pk=picks[i];
   if(!pk){pt.intensity=0;continue;}
   pt.position.set(pk.at[0],pk.at[1],pk.at[2]);
   pt.distance=pk.range;
   if(pk.kind==='window'){
    pt.color.copy(COL_WIN);
    pt.intensity=pk.amp*boost*(inRoom?Math.max(0.35,RL_INDOOR_K):0.55);
   }else{
    COL_TMP.setRGB(pk.color[0],pk.color[1],pk.color[2]);
    pt.color.copy(COL_TMP);
    pt.intensity=pk.amp*boost*(NIGHT.on?0.45:1.0);
   }
  }
 });

 window._tbRoomLight={
  get table(){return RL_TABLE;},
  get rooms(){return RL_ROOMS;},
  get windows(){return RL_WINS;},
  get lamps(){return RL_LAMPS;},
  get indoorK(){return +RL_INDOOR_K.toFixed(3);},
  pool:RL_POOL,
  roomAt:tbRoomAt,
  rebuild:tbRoomLightRebuild
 };
 globalThis.tbRoomLightRebuild=tbRoomLightRebuild;
})();
