// prefix: dv
// ================================================================= FLUME-FORGE, ROTATING OVERSHOT WATERWHEELS, INTERIORS & ORE WORKINGS (DV3)
// Animated cliffside overshot waterwheels, solid 3D gravity V-flume timber chutes with opaque flowing whitewater (`flumeWater`)
// & 30 m red-cypress logs, outward-wound verdigris copper forge spark-hoods, interior furnishing helpers & ore linkers.

function dvFurn(list){for(const e of list)FURNISH(e[0],e[1],e[2],e[3],e[4]==null?0:e[4],e[5]);}

function dvFurnRoom(cx,cz,wIn,dIn,y,tier,o){
 o=o||{};
 const rugKey=tier==='rich'&&wIn>=4.2?'dv_court_carpet':'dv_rug_kilim';
 const rugH=rugKey==='dv_court_carpet'?.052:.048;
 const hasRug=tier!=='poor'&&wIn>=3.2&&dIn>=3.0;
 if(hasRug)FURNISH(rugKey,cx,y,cz,0);
 const yOn=hasRug?y+rugH+.004:y;

 if(o.mode==='feast'){
  FURNISH(tier==='rich'&&wIn>=4.2?'dv_feast_table_brandy':'dv_common_table',cx,yOn,cz-.25,0);
  FURNISH('dv_carved_chair',cx-.85,yOn,cz-.25,PI/2);
  FURNISH('dv_carved_chair',cx+.85,yOn,cz-.25,-PI/2);
  FURNISH('dv_qvevri_rack',cx-wIn/2+.48,y,cz-dIn/2+.55,0);
  FURNISH('dv_brazier_copper',cx+wIn/2-.65,y+.006,cz+dIn/2-.75,0);
 }else{
  const bedKey=tier==='rich'?'dv_court_mepe_bed':tier==='poor'?'dv_poor_pallet':'dv_common_alcove_bed';
  FURNISH(bedKey,cx-wIn/2+.95,y,cz-dIn/2+1.1,0);
  if(wIn>=4.2&&dIn>=4.0){
   FURNISH('dv_dedabodzi_hearth',cx+.65,yOn,cz+.15,0);
  }else{
   FURNISH('dv_brazier_copper',cx+.55,yOn,cz+.35,0);
  }
  FURNISH('dv_rack_buckler_sword',cx+wIn/2-.32,y,cz-.35,-PI/2);
  FURNISH('dv_chest_jade_inlay',cx+wIn/2-.42,y,cz+dIn/2-.65,-PI/2);
  if(dIn>=4.2)FURNISH('dv_shelves_provisions',cx-wIn/2+.36,y+.005,cz+dIn/2-.85,PI/2);
 }
 if(o.ceilingY)FURNISH_HANG('dv_chandelier_bronze',cx,o.ceilingY,cz,0);
}

/* ---------------------------------------------------------------- 1. Multi-Axis Animated Spinners (Overshot Waterwheels!) */
const DV_SPINNERS=[];
function dvSpinnerReset(){DV_SPINNERS.length=0;}
function dvSpinner(x,y,z,axis,speed,drawFn){
 const B={},keepT=GTARGET,keepCMS=CMS.slice(),keepCM=CM,keepSB=SB,subBB={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9]};
 const wPos=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 const fwd=new THREE.Vector3(0,0,1).transformDirection(CM);
 const parentYaw=Math.atan2(fwd.x,fwd.z);
 GTARGET=B;SB=subBB;resetCM();
 try{drawFn();}finally{
  GTARGET=keepT;CMS.length=0;for(const m of keepCMS)CMS.push(m);CM=keepCM;SB=keepSB;
 }
 if(SB&&isFinite(subBB.mn[0])){
  for(let k=0;k<3;k++){
   const off=k===0?wPos.x:k===1?wPos.y:wPos.z;
   SB.mn[k]=Math.min(SB.mn[k],subBB.mn[k]+off);SB.mx[k]=Math.max(SB.mx[k],subBB.mx[k]+off);
  }
 }
 DV_SPINNERS.push({buckets:B,x:wPos.x,y:wPos.y,z:wPos.z,yaw:parentYaw,axis:axis||'x',speed:speed==null?1.15:speed,group:null});
}
function dvSpinnerFlush(parent){
 for(const s of DV_SPINNERS){
  const wrap=new THREE.Group();wrap.position.set(s.x,s.y,s.z);wrap.rotation.y=s.yaw;
  const g=new THREE.Group();
  flushBuckets(s.buckets,g,true);
  wrap.add(g);parent.add(wrap);s.group=g;
 }
}
FRAME_HOOKS.push(()=>{
 const t=ANIMU.uTime.value;
 for(const s of DV_SPINNERS){
  if(!s.group)continue;
  if(s.axis==='x')s.group.rotation.x=t*s.speed;
  else if(s.axis==='z')s.group.rotation.z=t*s.speed;
  else s.group.rotation.y=t*s.speed;
 }
});

/* Cliffside Overshot Timber & Iron-Banded Waterwheel (uses opaque animated `flumeWater` spout & cascade!) */
function dvWaterwheel(x,y,z,r,w,axle,speed,o){
 o=o||{};const rad=r==null?2.25:r,ww=w==null?.86:w,ax=axle||'x',spd=speed==null?1.2:speed;
 const cyCol=P('cypress'),wdCol=P('wood'),pkCol=P('planks'),irCol=P('iron'),bzCol=P('bronze'),wtCol=P('flumeWater'),fmCol=P('flumeFoam');
 dvNoCut(()=>svNoWalk(()=>{
  for(const sg of [-1,1]){
   const bx=ax==='x'?x+sg*(ww/2+.22):x,bz=ax==='z'?z+sg*(ww/2+.22):z;
   box('basalt',bx,y-.36,bz,.34,.36,.34,P('basalt'));
   box('bronze',bx,y+.006,bz,.22,.14,.22,bzCol);
  }
  /* solid 3D timber launder trough + opaque rushing `flumeWater` stream & foaming overshot cascade */
  if(o.spout!==false){
   const sy=y+rad+.28,sw=Math.max(.36,ww-.34),sxCheek=sw*.5+.035,swWater=Math.max(.22,sw-.14);
   if(ax==='x'){
    box('planks',x,sy,z-.85,sw,.12,1.78,pkCol);
    for(const sx of [-sxCheek,sxCheek])box('cypress',x+sx,sy+.125,z-.85,.065,.16,1.76,cyCol);
    box('flumeWater',x,sy+.13,z-.78,swWater,.085,1.62,wtCol);
    cyl('flumeWater',x,y+rad*.38,z+.32,.13,rad*.82,fmCol,8);
   }else{
    box('planks',x-.85,sy,z,1.78,.12,sw,pkCol);
    for(const sz of [-sxCheek,sxCheek])box('cypress',x-.85,sy+.125,z+sz,1.76,.16,.065,cyCol);
    box('flumeWater',x-.78,sy+.13,z,1.62,.085,swWater,wtCol);
    cyl('flumeWater',x+.32,y+rad*.38,z,.13,rad*.82,fmCol,8);
   }
  }
 }));
 dvSpinner(x,y,z,ax,spd,()=>{
  const rotY=ax==='x'?PI/2:0;
  W(0,0,0,rotY,()=>{
   svNoWalk(()=>{
    tube('iron',t=>[0,0,(t-.5)*(ww+.52)],()=>[.13,.13],3,8,irCol,{caps:true});
    tube('bronze',t=>[0,0,(t-.5)*(ww+.12)],()=>[.24,.24],3,10,bzCol,{caps:true});
    for(let k=0;k<4;k++){
     const a=k*PI/4,ca=Math.cos(a),sa=Math.sin(a);
     for(const sz of [-(ww/2-.11),(ww/2-.11)]){
      beam('wood',[-ca*(rad-.14),-sa*(rad-.14),sz],[ca*(rad-.14),sa*(rad-.14),sz],.075,wdCol);
     }
    }
    const nSeg=20;
    for(const sz of [-(ww/2-.045),(ww/2-.045)]){
     for(let i=0;i<nSeg;i++){
      const a0=i/nSeg*TAU,a1=(i+1)/nSeg*TAU;
      beam('cypress',[Math.cos(a0)*(rad-.12),Math.sin(a0)*(rad-.12),sz],[Math.cos(a1)*(rad-.12),Math.sin(a1)*(rad-.12),sz],.14,cyCol);
      beam('iron',[Math.cos(a0)*(rad+.03),Math.sin(a0)*(rad+.03),sz],[Math.cos(a1)*(rad+.03),Math.sin(a1)*(rad+.03),sz],.045,irCol);
     }
    }
    const nPad=16,pw=Math.max(.18,ww-.22);
    for(let i=0;i<nPad;i++){
     const a=i/nPad*TAU,px=Math.cos(a)*(rad-.1),py=Math.sin(a)*(rad-.1);
     beam('planks',[px,py,-pw/2],[px,py,pw/2],.055,pkCol,false,undefined,.26);
    }
   });
  });
 });
}

/* ---------------------------------------------------------------- 2. Solid 3D Gravity Timber V-Flume Chute & 30 m Red-Cypress Logs (DV3)
   Built from solid 85 mm thick 3D tilted plank slabs (`box` -> 100% solid inside, outside, underneath & at ends!)
   and filled with opaque UV-flowing mountain whitewater (`flumeWater`). */
function dvCypressLog(p0,p1,rLog){
 const r=rLog==null?.28:rLog,dx=p1[0]-p0[0],dy=p1[1]-p0[1],dz=p1[2]-p0[2],L=Math.hypot(dx,dy,dz);
 if(L<.2)return;
 const ux=dx/L,uy=dy/L,uz=dz/L;
 svNoWalk(()=>{
  tube('cypress',t=>[lerp(p0[0]+ux*.012,p1[0]-ux*.012,t),lerp(p0[1]+uy*.012,p1[1]-uy*.012,t),lerp(p0[2]+uz*.012,p1[2]-uz*.012,t)],
   ()=>[r,r],Math.max(4,Math.ceil(L/3)),10,P('cypress'),{caps:false});
  for(const sg of [0,1]){
   const a=sg===0?p0:[p1[0]-ux*.045,p1[1]-uy*.045,p1[2]-uz*.045];
   const b=sg===0?[p0[0]+ux*.045,p0[1]+uy*.045,p0[2]+uz*.045]:p1;
   tube('endgrain',t=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)],()=>[r*.96,r*.96],2,10,P('endgrain'),{caps:true});
  }
 });
}

function dvLogFlumeSeg(p0,p1,w,o){
 o=o||{};const fw=w==null?1.35:w,dx=p1[0]-p0[0],dy=p1[1]-p0[1],dz=p1[2]-p0[2];
 const Lh=Math.hypot(dx,dz),L3=Math.hypot(dx,dy,dz);
 if(Lh<.25)return;
 const yaw=Math.atan2(dx,dz),pitch=-Math.atan2(dy,Lh),px=Math.cos(yaw),pz=-Math.sin(yaw);
 const xm=(p0[0]+p1[0])*.5,ym=(p0[1]+p1[1])*.5,zm=(p0[2]+p1[2])*.5;
 const pkCol=o.pkCol==null?P('planks'):o.pkCol,wdCol=o.wdCol==null?P('wood'):o.wdCol;
 const cyCol=o.cyCol==null?P('cypress'):o.cyCol,wtCol=o.wtCol==null?P('flumeWater'):o.wtCol;
 const zTrim=o.seamless?.008:.02;

 dvNoCut(()=>svNoWalk(()=>{
  /* pitched 3D chute frame: solid keel beam + twin 85 mm thick 3D V-tilted plank walls + cypress gunwales + opaque rushing flumeWater */
  dvAuditShell('flume',xm,ym+fw*.18,zm,()=>{
   WX(xm,ym,zm,yaw,pitch,0,()=>{
    box('wood',0,-.205,0,.22,.15,L3-zTrim*2,wdCol);
    for(const sg of [-1,1]){
     box('planks',sg*fw*.27,fw*.17,0,fw*.62,.085,L3-zTrim,pkCol,0,0,sg*.64);
     box('cypress',sg*(fw*.51+.045),fw*.39,0,.085,.085,L3-zTrim*1.5,cyCol);
    }
    box('flumeWater',0,fw*.19,0,fw*.48,.095,L3-zTrim*1.4,wtCol);
   });
  });

  /* optional V-cradle bents & battered timber trestle legs planted cleanly into ground (`yGroundFn` or `yGround`) */
  if(o.bents){
   const nb=o.bents===true?Math.max(2,Math.round(Lh/3.6)):o.bents;
   const uStart=o.skipFirstBent?1:0;
   for(let i=uStart;i<nb;i++){
    const u=nb<2?.5:i/(nb-1),bx=lerp(p0[0],p1[0],u),by=lerp(p0[1],p1[1],u)-.22,bz=lerp(p0[2],p1[2],u);
    const yg=o.yGroundFn?o.yGroundFn(bx,bz):(o.yGround==null?0:o.yGround);
    if(by-yg<.32)continue;
    const hBent=by-yg,spread=.55+hBent*.13;
    /* V-cradle crossbeam carrying the chute */
    beam('cypress',[bx-px*(fw*.55),by+.08,bz-pz*(fw*.55)],[bx+px*(fw*.55),by+.08,bz+pz*(fw*.55)],.13,cyCol);
    beam('wood',[bx-px*spread,yg,bz-pz*spread],[bx-px*.32,by+.02,bz-pz*.32],.15,wdCol);
    beam('wood',[bx+px*spread,yg,bz+pz*spread],[bx+px*.32,by+.02,bz+pz*.32],.15,wdCol);
    if(hBent>2.2){
     const ym1=lerp(yg,by,.54),sp1=lerp(spread,.32,.54);
     beam('wood',[bx-px*sp1,ym1,bz-pz*sp1],[bx+px*sp1,ym1,bz+pz*sp1],.11,cyCol);
    }
    if(hBent>5.5){
     const ym2=lerp(yg,by,.28),sp2=lerp(spread,.32,.28);
     beam('wood',[bx-px*sp2,ym2,bz-pz*sp2],[bx+px*sp2,ym2,bz+pz*sp2],.12,cyCol);
    }
   }
  }
  if(o.log!==false){
   const tA=o.logT0==null?.12:o.logT0,tB=o.logT1==null?.88:o.logT1,rL=o.logR==null?.26:o.logR;
   dvCypressLog([lerp(p0[0],p1[0],tA),lerp(p0[1],p1[1],tA)+rL+.24,lerp(p0[2],p1[2],tA)],
                [lerp(p0[0],p1[0],tB),lerp(p0[1],p1[1],tB)+rL+.24,lerp(p0[2],p1[2],tB)],rL);
  }
 }));
}

/* ---------------------------------------------------------------- 3. Patinated Verdigris Copper Forge Spark-Hood (Cu = 130)
   Built via `dvFrustum4` so all 4 sloped copper hood faces have guaranteed outward normals! */
function dvSparkHood(cx,y0,cz,wBot,h,o){
 o=o||{};const wb=wBot==null?1.85:wBot,hh=h==null?2.2:h,vdCol=P('verdigris'),bzCol=P('bronze');
 svNoWalk(()=>{
  dvFrustum4('verdigris',cx,cz,wb,wb,.64,.64,y0+.08,y0+hh*.62,vdCol,{caps:true,kind:'hood'});
  box('bronze',cx,y0,cz,wb+.06,.075,wb+.06,bzCol);
  cyl('verdigris',cx,y0+hh*.62+.006,cz,.34,hh*.38,vdCol,10);
  cone('bronze',cx,y0+hh+.08,cz,.48,.24,bzCol,10);
 });
 if(o.smoke!==false)smokeAt(cx,y0+hh+.15,cz);
}

/* ---------------------------------------------------------------- 4. Drystone Apricot Terraces & Vardzieti Mine Workings */
function dvCropTerrace(cx,cz,w,d,y0,steps){
 const n=steps==null?3:steps,dd=d/n,dh=.48,cbCol=P('cobble'),eaCol=P('earth'),tfCol=P('turf');
 dvNoCut(()=>svNoWalk(()=>{
  for(let i=0;i<n;i++){
   const zc=cz-d/2+dd*(i+.5),yt=y0+dh*(n-i);
   box('cobble',cx,y0+.005,zc+dd/2-.14,w,yt-y0,.26,cbCol);
   box('earth',cx,y0+.008,zc-.14,w-.16,yt-y0-.055,dd-.3,eaCol);
   box('turf',cx,yt-.04,zc-.14,w-.28,.06,dd-.42,tfCol);
  }
 }));
}

function dvAdit(x,z,ry,o){
 o=o||{};const w=o.w==null?2.5:o.w,h=o.h==null?2.7:o.h;
 dvNoCut(()=>W(x,0,z,ry||0,()=>{
  svNoWalk(()=>{
   for(let i=0;i<6;i++){
    const xx=lerp(-4.5,4.5,i/5),hh=rr(3.8,5.5)*(1-Math.abs(xx)/11);
    if(Math.abs(xx)<w/2+.35)continue;
    box('colBasalt',xx,.008*i,-1.7,1.62,hh,2.55,P('colBasalt'),rr(-.07,.07));
   }
   box('tuff',0,h+.32,-1.7,w+1.5,2.4,2.55,P('tuff'));
   box('earth',0,.005,-1.5,w,.045,2.45,P('earth'));
   box('basalt',0,.06,-2.68,w-.1,h-.06,.08,0x18161a);
   for(const s of [-1,1])box('cypress',s*(w/2-.13),.056,-.42,.24,h-.056,.24,P('cypress'));
   box('cypress',0,h+.005,-.42,w+.24,.26,.32,P('cypress'));
   dvSkarnArch(0,h+.27,-.24,0,w+.18,{h:.38});
  });
 }));
}

function dvOreHeap(x,z,metal,s){
 const sc=s==null?1:s,L=(typeof RES_LOOK!=='undefined'&&RES_LOOK[metal])||({pile:0x6a3a24,lump:0x2a2624});
 const mk=metal==='coal'?'coal':metal==='tin'?'cassiterite':metal==='copper'?'malachite':metal==='saltpeter'?'efflor':'gossan';
 dvNoCut(()=>W(x,0,z,0,()=>svNoWalk(()=>{
  cone(mk,0,0,0,.92*sc,.68*sc,L.pile,10);
  for(let i=0;i<7;i++){
   const a=i/7*TAU+.2,r=(.55+(i%2)*.22)*sc;
   sph(mk,Math.cos(a)*r,.08*sc,Math.sin(a)*r,.11*sc,i%2?L.pile:L.lump,.7,6);
  }
 })));
}

function dvOreLinks(){
 const nodes=REG.filter(r=>r.kind==='res-node').map(r=>({id:r.tid||r.key,key:r.key,kind:r.tags.rock,grade:r.tags.level,x:r.x,z:r.z}));
 const mines=REG.filter(r=>!r.parent&&resWorksOf(r)).map(r=>({id:r.tid||r.key,key:r.key,works:resWorksOf(r),x:r.x,z:r.z}));
 return {nodes,mines:mines.map(m=>Object.assign({},m,{source:resSource(m,nodes)}))};
}
globalThis.dvOreLinks=dvOreLinks;
