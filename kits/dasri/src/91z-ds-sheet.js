// ================================================================= SHEET EXTRAS: 1.75 m scale figures, labels & Cliffside / Rock-Pinnacle Showcase ([web])
// Runs at 91z (after 91f-furnish.js, before 92-world.js's first buildWorld()), so both the initial load and A.rebuild()
// populate:
//   1. KDRAWN ground registration (core/drawn) for the sheet's ground plane AND the sculpted Navajo sandstone cliffs/pinnacle
//   2. 1.75 m Dasri human scale figures + plinth identification cards beside every standalone site on the inspection rows
//   3. Scene A (west-south): Dar al-Hajar Sandstone Rock Pinnacle & Jabal Cliff Escarpment (ds_jabal_* in cliff:true mode)
//   4. Scene B (west-north): Stepped Dasri Canyon-Ledge Hamlet (ds_vil_* in cliff:true mode on 3 stepped rock benches)

/* ---- Sculpted stratified Navajo sandstone terrain definitions ---- */
const DS_JBL_CLIFF={
 x0:-238,x1:-92,z0:-114,z1:-22,
 ground(x,z){
  if(x<this.x0||x>this.x1||z<this.z0||z>this.z1)return 0;
  const strata=(y)=>Math.sin(y*1.35)*.16;
  /* 1. The Dar al-Hajar Rock Pinnacle centred at (-132, -53.5): steep flat-crowned sandstone spire at y = 13.5 m
        cradling the Sheikh's Palace, stepping down to an eastern shoulder bench at (-112.5, -52) y = 6.8 m! */
  const dxP=(x+132)/15.2,dzP=(z+53.5)/15.2,rP=Math.hypot(dxP,dzP);
  const dxS=(x+112.5)/12.6,dzS=(z+52.0)/13.2,rS=Math.hypot(dxS,dzS);
  const crag=(KRAND.vnoise(x*.14,0,z*.14,401)-.5)*1.15;
  let hSpire=0;
  if(rP<1.36){
   const t=clamp((1.34-rP)/.54,0,1);
   hSpire=Math.max(hSpire,13.5*(t*t*(3-2*t))+(rP<.76?0:crag*.55));
  }
  if(rS<1.34){
   const t=clamp((1.30-rS)/.5,0,1);
   hSpire=Math.max(hSpire,6.8*(t*t*(3-2*t))+(rS<.74?0:crag*.4));
  }
  /* 2. The Jabal Escarpment Cliff Wall along the north (-z): bench at y = 4.2 m, sheer sandstone cliff rising sharply at z = -84.2! */
  let hWall=0;
  if(x>=-234&&x<=-156){
   if(z<=-84.2){
    const dIn=-84.2-z;
    hWall=Math.min(32.0,4.2+dIn*2.85+crag*.65);
   }else if(z<=-70.0){
    const t=clamp((-70.0-z)/5.2,0,1);
    hWall=4.2*(t*t*(3-2*t));
   }
  }
  const h=Math.max(hSpire,hWall);
  return h>.05?h+strata(h)*(h>14.2?.75:.2):0;
 }
};

const DS_VIL_CLIFF={
 x0:-236,x1:-98,z0:-226,z1:-138,
 ground(x,z){
  if(x<this.x0||x>this.x1||z<this.z0||z>this.z1)return 0;
  const n=(KRAND.vnoise(x*.12,0,z*.12,709)-.5)*.4;
  /* Stepped sandstone canyon wall rising north (-z):
       z > -159.5: wadi floor (y = 0)
       z in [-177.5..-164.0]: Bench 1 at y = 5.5 m
       z in [-196.0..-182.0]: Bench 2 at y = 11.0 m
       z < -196.0: sheer upper canyon cliff rising sharply to 27 m */
  let h=0;
  if(z>-159.5)h=0;
  else if(z>-164.0){const t=(-159.5-z)/4.5;h=5.5*(t*t*(3-2*t));}
  else if(z>-177.5)h=5.5+n*.1;
  else if(z>-182.0){const t=(-177.5-z)/4.5;h=5.5+5.5*(t*t*(3-2*t));}
  else if(z>-196.0)h=11.0+n*.1;
  else{const dIn=-196.0-z;h=Math.min(27.0,11.0+dIn*2.5+n*.7);}
  const fx=Math.min(clamp((x-this.x0)/8,0,1),clamp((this.x1-x)/8,0,1));
  return h*fx;
 }
};

function dsCliffMesh(def,step,colHex){
 const x0=def.x0,x1=def.x1,z0=def.z0,z1=def.z1;
 const nx=Math.ceil((x1-x0)/step),nz=Math.ceil((z1-z0)/step);
 const g=new THREE.BoxGeometry(x1-x0,1,z1-z0,nx,4,nz);
 const pos=g.attributes.position,uv=g.attributes.uv;
 const L=KMAT.mode==='lib'?KMAT.packed(KIT.pack,'cliff'):null,ts=L?L.scale[0]:6.0;
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i)+(x0+x1)/2,z=pos.getZ(i)+(z0+z1)/2,yf=pos.getY(i)+.5;
  const topH=def.ground(x,z);
  const y=yf<=0?-.25:topH*yf;
  pos.setXYZ(i,x,y,z);
  /* 3D world-space UV blend so both vertical scarps AND horizontal rock benches carry crisp sandstone grain without stretching */
  uv.setXY(i,(x+z*.22)/ts,(y+z*.78)/ts);
 }
 g.computeVertexNormals();
 const mt=new THREE.MeshStandardMaterial({color:hc(colHex==null?0xc48a62:colHex),roughness:.92});
 if(L){
  const T=KMAT.textures(L,{aniso:TEXANISO});
  mt.map=T.map;mt.normalMap=T.normalMap;mt.roughnessMap=T.roughnessMap;
  if(mt.normalMap)mt.normalScale.set(1.15,1.15);
  matHook(mt,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));
 }
 const m=new THREE.Mesh(g,mt);
 m.name='terrain-cliff';
 m.receiveShadow=true;m.castShadow=true;
 m.userData.isGround=true;m.userData.ground=true;m.userData.probeSkip=true;
 return m;
}

/* 1.75 m Dasri human scale figure (instanced/merged into one clean Group for zero draw-call bloat!) */
function dsScaleFigures(sites){
 const G=new THREE.Group();G.name='scale-figures';G.userData.probeSkip=true;
 const mRobe=new THREE.MeshStandardMaterial({color:hc(0x284664),roughness:.85});
 const mSash=new THREE.MeshStandardMaterial({color:hc(0xb84a32),roughness:.8});
 const mSkin=new THREE.MeshStandardMaterial({color:hc(0xb68662),roughness:.78});
 const mWrap=new THREE.MeshStandardMaterial({color:hc(0xf2ede0),roughness:.82});
 const gLegs=new THREE.CylinderGeometry(.11,.13,.72,8);gLegs.translate(0,.36,0);
 const gTorso=new THREE.CylinderGeometry(.17,.22,.68,10);gTorso.translate(0,1.04,0);
 const gSash=new THREE.CylinderGeometry(.185,.19,.11,10);gSash.translate(0,.98,0);
 const gHead=new THREE.SphereGeometry(.115,10,8);gHead.translate(0,1.51,0);
 const gTurban=new THREE.CylinderGeometry(.135,.125,.14,10);gTurban.translate(0,1.68,0); /* Top = 1.75 m! */

 const n=sites.length;
 if(!n)return G;
 const iLegs=new THREE.InstancedMesh(gLegs,mWrap,n);
 const iTorso=new THREE.InstancedMesh(gTorso,mRobe,n);
 const iSash=new THREE.InstancedMesh(gSash,mSash,n);
 const iHead=new THREE.InstancedMesh(gHead,mSkin,n);
 const iTurb=new THREE.InstancedMesh(gTurban,mWrap,n);
 const M=new THREE.Matrix4();
 sites.forEach((S,idx)=>{
  const D=DEFS[S.key];
  const fx=S.x-D.w/2-1.15,fz=S.z+D.d/2-.35;
  M.makeTranslation(fx,0,fz);
  iLegs.setMatrixAt(idx,M);iTorso.setMatrixAt(idx,M);iSash.setMatrixAt(idx,M);iHead.setMatrixAt(idx,M);iTurb.setMatrixAt(idx,M);
 });
 for(const im of [iLegs,iTorso,iSash,iHead,iTurb]){
  im.instanceMatrix.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;
  im.frustumCulled=false;im.userData.probeSkip=true;
  G.add(im);
 }
 return G;
}

/* Crisp ground-plinth label boards in front of each standalone building (never uses getImageData!) */
function dsRowLabels(sites){
 const G=new THREE.Group();G.name='row-labels';G.userData.probeSkip=true;
 if(typeof document==='undefined')return G;
 const planeG=new THREE.PlaneGeometry(3.2,.72);
 sites.forEach(S=>{
  const D=DEFS[S.key];if(!D)return;
  const cv=document.createElement('canvas');cv.width=512;cv.height=116;
  const cx=cv.getContext&&cv.getContext('2d');
  if(!cx)return;
  const isUrb=/^ds_jabal_/.test(S.key);
  cx.fillStyle=isUrb?'#241d1a':'#33261b';
  cx.fillRect(0,0,512,116);
  cx.strokeStyle=isUrb?'#f4efe2':'#d4b488';
  cx.lineWidth=4;cx.strokeRect(4,4,504,108);
  cx.fillStyle=isUrb?'#f8f4ea':'#f0e2c8';
  cx.font='bold 26px system-ui, sans-serif';
  const vTag=S.o&&S.o.v?' (Shibam v1)':'';
  cx.fillText(S.key+vTag,18,44);
  cx.fillStyle='#d4b88e';
  cx.font='21px system-ui, sans-serif';
  cx.fillText((isUrb?'Jabal Urban':'Dasri Village')+'  |  '+D.w+' x '+D.d+' x '+D.h+' m  |  1.75 m fig',18,86);
  const tex=new THREE.CanvasTexture(cv);
  tex.encoding=THREE.sRGBEncoding;
  const mt=new THREE.MeshBasicMaterial({map:tex});
  const m=new THREE.Mesh(planeG,mt);
  m.position.set(S.x,.42,S.z+D.d/2+1.65);
  m.rotation.x=-.55;
  m.userData.probeSkip=true;
  G.add(m);
 });
 return G;
}

function dsRegisterCliffSite(r,y,sceneName){
 const D=DEFS[r.key];if(!D||!SVTAGS)return null;
 return SVTAGS.add({
  'class':D.cls,kind:r.key,key:r.key,
  name:sceneName+' - '+D.name,
  at:[r.x,y,r.z],ry:r.ry==null?0:r.ry,size:[D.w,D.d,D.h],
  tags:Object.assign({},D.tags,{rock:'cliff-locked'}),
  note:'drawn by DASRI.draw in cliff:true mode flush against Navajo sandstone',
  frag:KIT.frag
 });
}

function dsBuildSheetExtras(W){
 const out={};
 if(typeof groundM!=='undefined'){
  groundM.name='ground';
  groundM.position.set(-40,0,-140);
  groundM.scale.set(1.4,1.4,1);
  groundM.updateMatrixWorld(true);
 }
 if(typeof KDRAWN!=='undefined'){
  KDRAWN.clear();
  if(typeof groundM!=='undefined')KDRAWN.add(KDRAWN.fromObject(groundM));
 }

 /* 1. 1.75 m scale figures & label cards on all standalone inspection row sites */
 W.add(dsScaleFigures(SITES));
 W.add(dsRowLabels(SITES));

 /* 2. Scene A: Dar al-Hajar Rock Pinnacle & Jabal Cliff Escarpment (Urban cliff-locked composition!) */
 const mJblCliff=dsCliffMesh(DS_JBL_CLIFF,1.4,0xc48860);
 W.add(mJblCliff);
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(mJblCliff,{cell:3.0}));

 const jabalCliffRecs=[
  /* Perched atop the Dar al-Hajar sandstone spire & its stepped east shoulder */
  {id:'cliff:jabal:palace', key:'ds_jabal_rock_palace',     x:-132.0, z:-53.5, ry:0, y:13.45, lo:-8.5, cliff:true},
  {id:'cliff:jabal:mansion',key:'ds_jabal_mansion_stepped', x:-112.5, z:-52.0, ry:0, y:6.75,  lo:-7.0, cliff:true},
  /* Locked flush against the sheer sandstone escarpment wall at z = -84.2 (each rear z - d/2 sits at -84.6, keyed into solid rock!) */
  {id:'cliff:jabal:rich',   key:'ds_jabal_house_rich',      x:-216.0, z:-78.7, ry:0, y:4.2,   lo:-5.2, cliff:true},
  {id:'cliff:jabal:shibam', key:'ds_jabal_house_mid',       x:-199.5, z:-80.0, ry:0, y:4.2,   lo:-5.2, cliff:true, v:1},
  {id:'cliff:jabal:poor',   key:'ds_jabal_house_poor',      x:-186.5, z:-80.9, ry:0, y:4.2,   lo:-5.2, cliff:true},
  {id:'cliff:jabal:tower',  key:'ds_jabal_call_tower',      x:-173.5, z:-81.2, ry:0, y:4.2,   lo:-5.2, cliff:true},
  /* At the foot of the spire: bazaar gate & salt factor warehouse */
  {id:'cliff:jabal:gate',   key:'ds_jabal_bazaar_gate',     x:-132.0, z:-29.5, ry:0, y:0,     lo:-.35, cliff:false},
  {id:'cliff:jabal:salt',   key:'ds_jabal_salt_warehouse',  x:-155.0, z:-62.0, ry:0, y:0,     lo:-.35, cliff:false}
 ];
 jabalCliffRecs.forEach(r=>dsRegisterCliffSite(r,r.y||0,'Jabal cliff showcase'));
 out.jabalCliff=DASRI.draw({id:'sheet-jabal-cliff',records:jabalCliffRecs},{
  scene:W,ground:DS_JBL_CLIFF.ground.bind(DS_JBL_CLIFF),seed:8901,
  label:'Dar al-Hajar sandstone pinnacle and Jabal cliff cluster'
 });

 /* 3. Scene B: Stepped Dasri Canyon-Ledge Hamlet (Bab al-Hawa / Wadi Cliff Village!) */
 const mVilCliff=dsCliffMesh(DS_VIL_CLIFF,1.4,0xbe8258);
 W.add(mVilCliff);
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(mVilCliff,{cell:3.0}));

 const vilCliffRecs=[
  /* Upper rock bench (y = 11.0 m, rear z - d/2 locked flush at z = -196.4 into the upper cliff wall!) */
  {id:'cliff:vil:elder',  key:'ds_vil_house_elder',  x:-182.0, z:-190.7, ry:0, y:11.0, lo:-5.8, cliff:true},
  {id:'cliff:vil:mid2',   key:'ds_vil_house_mid',    x:-166.0, z:-191.8, ry:0, y:11.0, lo:-5.8, cliff:true},
  {id:'cliff:vil:watch',  key:'ds_vil_watch_post',   x:-151.0, z:-193.1, ry:0, y:11.0, lo:-5.8, cliff:true},
  /* Stone cliff stair climbing from Bench 1 (5.5 m) up the riser to Bench 2 (11.0 m) */
  {id:'cliff:vil:stair2', key:'ds_vil_cliff_stair',  x:-195.5, z:-180.0, ry:0, y:5.5,  lo:-5.8, cliff:true},
  /* Middle rock bench (y = 5.5 m, rear z - d/2 locked flush at z = -178.0 into the Bench 2 riser!) */
  {id:'cliff:vil:mid1',   key:'ds_vil_house_mid',    x:-178.0, z:-173.4, ry:0, y:5.5,  lo:-5.8, cliff:true},
  {id:'cliff:vil:poor1',  key:'ds_vil_house_poor',   x:-164.0, z:-174.6, ry:0, y:5.5,  lo:-5.8, cliff:true},
  {id:'cliff:vil:granary',key:'ds_vil_granary',      x:-150.5, z:-174.2, ry:0, y:5.5,  lo:-5.8, cliff:true},
  /* Lower stone cliff stair climbing from Wadi Floor (0 m) up the riser to Bench 1 (5.5 m) */
  {id:'cliff:vil:stair1', key:'ds_vil_cliff_stair',  x:-138.5, z:-161.5, ry:0, y:0,    lo:-4.2, cliff:true},
  /* Wadi oasis foot (y = 0 m): saqiya well, way-shade sablah & salt shed */
  {id:'cliff:vil:well',   key:'ds_vil_saqiya_well',  x:-182.0, z:-149.5, ry:0, y:0,    lo:-.35, cliff:false},
  {id:'cliff:vil:sablah', key:'ds_vil_shade_loggia', x:-164.0, z:-150.0, ry:0, y:0,    lo:-.35, cliff:false},
  {id:'cliff:vil:salt',   key:'ds_vil_salt_shed',    x:-121.5, z:-151.0, ry:0, y:0,    lo:-.35, cliff:false}
 ];
 vilCliffRecs.forEach(r=>dsRegisterCliffSite(r,r.y||0,'Dasri canyon-ledge village'));
 out.vilCliff=DASRI.draw({id:'sheet-vil-cliff',records:vilCliffRecs},{
  scene:W,ground:DS_VIL_CLIFF.ground.bind(DS_VIL_CLIFF),seed:8902,
  label:'Dasri stepped canyon-ledge village flush on sandstone'
 });

 /* Check spatial non-overlap across all cliff showcase records on KSPACE.create */
 if(typeof KSPACE!=='undefined'){
  const sp=KSPACE.create({cell:12});
  const overlaps=[];
  for(const r of jabalCliffRecs.concat(vilCliffRecs)){
   const B=DS_BOX[r.key];if(!B)continue;
   const rad=Math.max(B.w,B.d)/2;
   const hit=sp.query(r.x,r.z,rad).filter(q=>
    Math.abs((q.y||0)-(r.y||0))<2.8&&
    Math.abs(q.x-r.x)<(B.w+q.w)/2-.4&&
    Math.abs(q.z-r.z)<(B.d+q.d)/2-.4
   );
   if(hit.length)overlaps.push(r.id+'<->'+hit[0].id);
   sp.insert({id:r.id,x:r.x,z:r.z,y:r.y||0,w:B.w,d:B.d},r.x,r.z,rad);
  }
  out.overlaps=overlaps;
 }
 out.scaleFigures=SITES.length;
 window._dsSheet=out;
 return out;
}

(function(){
 const dsPrevBW=buildWorld;
 buildWorld=function(){
  const W=dsPrevBW();
  try{dsBuildSheetExtras(W);}catch(err){reportErr('dsSheetExtras: '+(err.stack||err));}
  if(typeof nightRebuild==='function')nightRebuild();
  return W;
 };
})();
