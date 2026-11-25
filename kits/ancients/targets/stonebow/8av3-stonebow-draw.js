// ================================================================= STONEBOW — Soleri's canyon-bridge arcology: the drawing
// Draws STONEBOW.plan() (8av0) across the Ching-Ma Porphyry Shut-In in three states:
//   buildStonebow(scene, gx, gz, 0)       Intact peak arcology (~200,000 residents, gleaming concrete & glazed skylit spine)
//   buildStonebow(scene, gx, gz, 1)       Cataclysm ruin (eastern Tourist Center & bay 4 breached, wrecks on canyon floor)
//   buildStonebowRefurb(scene, gx, gz, 0) Refurbished settlement centerpiece (~18,500 residents: warm re-glazed Crown, Bow,
//                                         City Center, braced bay 4, cable-stabilized Tourist Center, rooftop crop beds,
//                                         and sealed pylon bulkheads isolating the deep West/East delving-ruin vaults)
//
// Every placed object is registered in core/tags (KTAGS) before geometry is emitted, and named volumes go to REGISTER().
const SB_SITE={};

// Stratified canyon rock material: vertex-coloured from KSTRATA ('outland-redbeds' porphyry throat + 'carbonate-shelf' dolomite palisades)
MAT.sbCanyon=MAT.rock.clone();
MAT.sbCanyon.color.setHex(0xffffff);
MAT.sbCanyon.vertexColors=true;

// Refurbished inhabited skin: weathered concrete warmth with active warm window glow at night and dusk
MAT.sbKept=new THREE.MeshStandardMaterial({
 map:TEX.acResR,roughnessMap:TEX.concreteRM,color:0xc8bda8,
 emissive:0xffffff,emissiveMap:TEX.acResE,emissiveIntensity:0.46,roughness:1,metalness:0,side:DS
});
MAT.sbKeptWrk=new THREE.MeshStandardMaterial({
 map:TEX.acWrkR,roughnessMap:TEX.concreteRM,color:0xc2b7a2,
 emissive:0xffffff,emissiveMap:TEX.acWrkE,emissiveIntensity:0.52,roughness:1,metalness:0,side:DS
});

// Translucent skylight barrel vault material for the Cultural Center Crown & 9 spine light wells
MAT.sbSkylight=new THREE.MeshStandardMaterial({
 color:0x9ad0e2,emissive:0xffe0b2,emissiveIntensity:0.22,
 roughness:0.16,metalness:0.25,transparent:true,opacity:0.68,side:DS
});
MAT.sbSkylightR=new THREE.MeshStandardMaterial({
 color:0x4a5860,roughness:0.48,metalness:0.25,transparent:true,opacity:0.48,side:DS
});

// Instanced kit pieces for pylon lift cores, steel cables, salvage trusses, crop beds & polytunnels
kdef('sbCore',new THREE.CylinderGeometry(1,1,1,20),MAT.concrete);
kdef('sbCoreR',new THREE.CylinderGeometry(1,1,1,20),MAT.concreteR);
MAT.sbTunnel=new THREE.MeshStandardMaterial({color:0xe4eee8,roughness:0.42,metalness:0.05,transparent:true,opacity:0.64,side:DS});
kdef('sbTunnel',new THREE.CylinderGeometry(1,1,1,10,1,true,0,Math.PI).rotateZ(Math.PI/2),MAT.sbTunnel);
MAT.sbCrop=new THREE.MeshStandardMaterial({color:0x4c7c34,roughness:0.88,metalness:0,side:DS});
kdef('sbCrop',new THREE.BoxGeometry(1,1,1),MAT.sbCrop);
MAT.sbCable=new THREE.MeshStandardMaterial({color:0x363b40,roughness:0.38,metalness:0.55,side:DS});
kdef('sbCable',new THREE.BoxGeometry(1,1,1),MAT.sbCable);

function sbPaintStrata(geo,strataPorph,strataCarb,zSpan){
 const pos=geo.attributes.position,nrm=geo.attributes.normal,cnt=pos.count;
 const col=new Float32Array(cnt*3),tA={},tB={};
 const srgbToLin=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
 for(let i=0;i<cnt;i++){
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),ny=nrm?Math.abs(nrm.getY(i)):0.3;
  const sA=strataPorph.surface(x,Math.max(0,y),z,ny,tA);
  const sB=strataCarb.surface(x,Math.max(0,y),z,ny,tB);
  // Smooth undulating geological contact around y = 152 m (+/- 22 m) so triangle interpolation shows natural bedding
  const contactY=152+(KRAND.fbm((x+900)/180,(z+900)/180,0,2,12408)-0.5)*26;
  const w=clamp((y-contactY)/28+0.5,0,1),ws=w*w*(3-2*w);
  const cA=sA.colour,cB=ny>0.82&&y>415?sB.cover:sB.colour;
  const cr=lerp(cA[0],cB[0],ws),cg=lerp(cA[1],cB[1],ws),cb=lerp(cA[2],cB[2],ws);
  const mist=y<55?0.12*Math.max(0,1-Math.abs(z+540)/(zSpan*0.22)):0;
  col[i*3]=srgbToLin(Math.max(0,cr*(1-mist)+0.16*mist));
  col[i*3+1]=srgbToLin(Math.max(0,cg*(1-mist*0.4)+0.28*mist));
  col[i*3+2]=srgbToLin(Math.max(0,cb*(1-mist)+0.14*mist));
 }
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 return geo;
}

function sbDrawBoxShell(listWall,listRoof,listSoff,x0,x1,y0,y1,z0,z1,opt){
 opt=opt==null?{}:opt;
 const uTile=25.6,lx=x1-x0,lz=z1-z0,ly=y1-y0;
 const nx=Math.max(1,Math.round(lx/uTile)),nz=Math.max(1,Math.round(lz/uTile));
 if(!opt.openN)listWall.push(gridSurface((u,v)=>[lerp(x0,x1,u),lerp(y0,y1,v),z0],nx,1,{uS:lx/uTile,vS:ly/uTile}));
 if(!opt.openS)listWall.push(gridSurface((u,v)=>[lerp(x1,x0,u),lerp(y0,y1,v),z1],nx,1,{uS:lx/uTile,vS:ly/uTile}));
 if(!opt.openW)listWall.push(gridSurface((u,v)=>[x0,lerp(y0,y1,v),lerp(z1,z0,u)],nz,1,{uS:lz/uTile,vS:ly/uTile}));
 if(!opt.openE)listWall.push(gridSurface((u,v)=>[x1,lerp(y0,y1,v),lerp(z0,z1,u)],nz,1,{uS:lz/uTile,vS:ly/uTile}));
 if(listRoof)listRoof.push(gridSurface((u,v)=>[lerp(x0,x1,u),y1,lerp(z0,z1,v)],Math.max(2,nx),Math.max(2,nz),{uS:lx/16,vS:lz/16,hole:opt.roofHole||null}));
 if(listSoff)listSoff.push(gridSurface((u,v)=>[lerp(x0,x1,v),y0,lerp(z0,z1,u)],Math.max(2,nz),Math.max(2,nx),{uS:lz/16,vS:lx/16}));
}

function sbDeckSlab(list,x0,x1,y,z0,z1,th){
 const t=th==null?0.35:th;
 sbDrawBoxShell(list,list,list,x0,x1,y-t,y,z0,z1,{});
}

function sbDrawSite(scene,gx,gz,d,mode){
 // mode: 'intact' | 'ruined' | 'refurb'
 const isRuin=mode==='ruined',isRefurb=mode==='refurb',dd=(isRuin||isRefurb)?1:0;
 KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);

 // Far plane & horizon sky clamp so our 1.52 km canyon & 3-site showcase never clip or band black
 if(typeof camera!=='undefined'&&camera.far<35000){camera.far=35000;camera.updateProjectionMatrix();}
 if(typeof sky!=='undefined')sky.renderOrder=-1;
 if(typeof skyMat!=='undefined'&&skyMat.fragmentShader.indexOf('pow(h,.55)')>=0){
  skyMat.fragmentShader=skyMat.fragmentShader.replace('pow(h,.55)','pow(max(h,0.),.55)');
  skyMat.needsUpdate=true;
 }

 const P=STONEBOW.plan({seed:12400});
 const RU=isRuin?STONEBOW.ruin(P):null;
 const RF=isRefurb?STONEBOW.refurb(P):null;
 const D=P.dim,U=(a,b,c)=>STONEBOW.u(12400,a,b,c);

 // ---- 1. Register every placed structure, part & flora record in core/tags BEFORE drawing -------------------------
 {
  const T=KTAGS.stonebow||(KTAGS.stonebow=KTAGS.create({build:'ancients-stonebow'}));
  const pre=mode+'/',W=a=>[a[0]+gx,a[1],a[2]+gz];
  const bState=isRuin?'ruined':'intact';
  const B=T.add({
   id:pre+P.id,'class':'building',kind:'arcology',key:'ancients:stonebow',
   name:isRefurb?'Stonebow (refurbished centerpiece)':'Stonebow ('+mode+')',
   at:[gx,0,gz],r:760,h:D.CROWN_Y,
   tags:{culture:'ancient',types:['civic','dwelling-multi','infrastructure','industry','market'],state:bState,landmark:true}
  });
  const part=(id,kind,at,stOverride,extra)=>T.child(B.id,Object.assign({
   'class':'part',kind:kind,key:id,at:W(at),tags:{culture:'ancient',state:stOverride||bState}
  },extra||{}));

  for(const py of P.pylons)part(py.id,'pylon',[py.x,py.y0,py.z],null,{size:[py.w0,py.y1-py.y0,py.d0]});
  for(const hw of P.highways)part(hw.id,'viaduct',[0,hw.y,hw.z],null,{size:[D.LEN,hw.thick,hw.w]});
  for(const ul of P.uloops)part(ul.id,'viaduct',[ul.cx,ul.y,ul.cz],null,{r:ul.r});
  for(const tr of P.trusses){
   if(isRuin&&tr.bay===RU.brokenTrussBay&&tr.sz>0)continue;
   part(tr.id,'truss',[(tr.xa+tr.xb)*0.5,D.RY,tr.z0],null,{});
  }
  for(const bt of P.bowTiers)part(bt.id,'terrace',[0,bt.y,0],null,{size:[bt.x1-bt.x0,bt.h,bt.zHalf*2]});
  for(const wl of P.wells)part(wl.id,'lightwell',[wl.x,wl.y0,wl.z],null,{size:[wl.w,wl.y1-wl.y0,wl.d]});
  part(P.crown.id,'crown',[0,P.crown.y0,0],null,{size:[164,P.crown.y1-P.crown.y0,100]});
  part(P.cityArch.id,'arch',[0,P.cityArch.ySpring,0],null,{size:[D.ARCH_X*2,D.RY-P.cityArch.ySpring,176]});
  part(P.tourist.id,'bridge',[0,P.tourist.y0,0],isRuin?'ruined':'intact',{size:[D.TOUR_X*2,30,D.TOUR_Z*2]});
  for(const v of P.vaults)part(v.id,'vault',[(v.x0+v.x1)*0.5,v.y0,0],(isRuin||isRefurb)?'ruined':'intact',{});
  for(const mr of P.mechRoots)part(mr.id,'vault',[(mr.x0+mr.x1)*0.5,mr.y0,0],(isRuin||isRefurb)?'ruined':'intact',{});
  for(const wg of P.wings){
   const wSt=(isRuin||(isRefurb&&wg.tag==='ne'))?'ruined':'intact';
   part(wg.id,'wing',[wg.sx*520,wg.y0,wg.sz*210],wSt,{});
  }
  for(const bh of P.bulkheads)part(bh.id,'bulkhead',[bh.x,bh.y,bh.z],null,{});
  for(const dr of P.dress){
   T.child(B.id,{'class':'flora',kind:'tree',key:dr.id,at:W(dr.at),h:dr.h,tags:{culture:'ancient'}});
  }
  if(RF){
   for(const cr of RF.crops){
    T.child(B.id,{'class':'flora',kind:'crop',key:cr.id,at:W(cr.at),tags:{culture:'ancient'}});
   }
  }
 }

 // ---- 2. Inspector volumes (REGISTER): non-empty nested cylinders for click-to-inspect ----------------------------
 const titleState=isRefurb?'refurbished centerpiece':STATE(d);
 REGISTER({name:'Stonebow — canyon-bridge arcology ('+titleState+')',x:0,z:0,r:740,y:0,h:D.CROWN_Y+24});
 REGISTER({name:'Stonebow — Cultural Center and Skylight Crown',x:0,z:0,r:92,y:490,h:86});
 REGISTER({name:'Stonebow — Living-Working Upper Bow Megatruss',x:0,z:0,r:365,y:420,h:142});
 REGISTER({name:'Stonebow — City Center Compression Arch and Concourse',x:0,z:0,r:400,y:290,h:132});
 REGISTER({name:'Stonebow — Suspended Tourist Center Overlook',x:isRuin?-80:0,z:0,r:isRuin?115:195,y:164,h:42});
 REGISTER({name:'Stonebow — Ching-Ma Canyon Floor Park and Gorge Lifts',x:0,z:0,r:170,y:0,h:162});
 for(const py of P.pylons){
  REGISTER({name:'Stonebow — '+py.name,x:py.x,z:py.z,r:34,y:py.y0,h:py.y1-py.y0+8});
 }
 for(const ul of P.uloops){
  REGISTER({name:'Stonebow — '+ul.name,x:ul.cx,z:ul.cz,r:ul.r+18,y:D.RY-10,h:28});
 }
 for(const wg of P.wings){
  REGISTER({name:'Stonebow — '+wg.name,x:wg.sx*520,z:wg.sz*208,r:120,y:D.RY-4,h:38});
 }

 // ---- 3. Stratified Ching-Ma Porphyry & Dolomite Canyon (KSTRATA) -------------------------------------------------
 const strataPorph=KSTRATA.create({seed:12405,recipe:'outland-redbeds',range:[0,520],dip:[0.5,0.86,0.008],warp:[8,2.0]});
 const strataCarb=KSTRATA.create({seed:12406,recipe:'carbonate-shelf',range:[0,520],dip:[0.5,0.86,0.008],warp:[7,1.8]});
 const ROCK=[];
 const zMin=-760,zMax=760,zSpan=zMax-zMin,xOuter=820;

 // West and East stepped canyon walls (y = 0..420) + rim plateaus (x = rim..820) + outer drop skirts
 for(const s of [-1,1]){
  ROCK.push(sbPaintStrata(gridSurface((u,v)=>{
   const z=zMin+u*zSpan,y=v*D.RY;
   const x=STONEBOW.canyonWallX(s,z,y);
   return s>0?[x,y,z]:[x,y,zMin+(1-u)*zSpan];
  },96,46,{uS:48,vS:20}),strataPorph,strataCarb,zSpan));

  ROCK.push(sbPaintStrata(gridSurface((u,v)=>{
   const z=zMin+u*zSpan;
   const xRim=STONEBOW.canyonWallX(s,z,D.RY);
   const x=lerp(xRim,s*xOuter,v);
   const y=v===0?D.RY:STONEBOW.groundAt(x,z);
   return s>0?[x,y,z]:[x,y,zMin+(1-u)*zSpan];
  },84,18,{uS:48,vS:24}),strataPorph,strataCarb,zSpan));

  // Outer plateau side skirt down to y = 0 so the geological block is a closed solid from every angle
  ROCK.push(sbPaintStrata(gridSurface((u,v)=>{
   const z=zMin+u*zSpan,x=s*xOuter,yTop=STONEBOW.groundAt(x,z);
   return [x,v*yTop,z];
  },36,6,{uS:48,vS:16}),strataPorph,strataCarb,zSpan));
 }
 // Canyon floor shingle, park benches & upstream porphyry cataract sill (y = 0..35)
 ROCK.push(sbPaintStrata(gridSurface((u,v)=>{
  const z=zMin+v*zSpan;
  const wxW=STONEBOW.canyonWallX(-1,z,0)-6,wxE=STONEBOW.canyonWallX(1,z,0)+6;
  const x=lerp(wxW,wxE,u);
  return [x,STONEBOW.groundAt(x,z),z];
 },28,96,{uS:14,vS:48}),strataPorph,strataCarb,zSpan));

 meshMerged(ROCK,MAT.sbCanyon,G);

 // Cliff-toe talus boulders (KRAND-seeded, kept off the river channel)
 for(let k=0;k<64;k++){
  const s=k%2===0?-1:1;
  const bz=zMin+40+U(601,k,0)*(zSpan-80);
  const wx=STONEBOW.canyonWallX(s,bz,0);
  const bx=wx-s*(4+18*U(602,k,1));
  if(Math.abs(bx-STONEBOW.riverX(bz))<STONEBOW.riverW(bz)*0.5+5)continue;
  const sc=3.5+8.5*U(603,k,2),gy=STONEBOW.groundAt(bx,bz);
  const col=new THREE.Color().setHSL(0.03+0.04*U(604,k,0),0.22+0.15*U(605,k,1),0.26+0.14*U(606,k,2));
  kput('rubble',[bx,gy+sc*0.28,bz],qEuler(U(607,k,0)*3,U(608,k,1)*3,U(609,k,2)*3),[sc*1.2,sc*0.65,sc],col);
 }

 // ---- 4. Geometry collectors by material (keeps draw calls low & opaque meshes merged) ----------------------------
 const FRM=[],RES_KEPT=[],WRK_KEPT=[],RES_DEAD=[],WRK_DEAD=[],ROOF=[],SOFF=[],GLS=[],SKY_GLS=[],PATINA=[];
 const matFrame=dd?MAT.acFrameR:MAT.acFrame;
 const matResMain=isRuin?MAT.acResR:(isRefurb?MAT.sbKept:MAT.acRes);
 const matWrkMain=isRuin?MAT.acWrkR:(isRefurb?MAT.sbKeptWrk:MAT.acWrk);
 const boxFrame=BOXC(dd);
 const coreDef=dd?'sbCoreR':'sbCore';

 // ---- 5. Twin Outer Ancient Highways (z = +/-118) & Semicircular Hairpin U-Loops (x = +/-492) ---------------------
 for(const hw of P.highways){
  const z0=hw.z-hw.w*0.5,z1=hw.z+hw.w*0.5;
  // Continuous box-girder viaduct across the 1,520 m corridor
  sbDrawBoxShell(FRM,ROOF,SOFF,hw.x0,hw.x1,hw.y-hw.thick,hw.y,z0,z1,{});
  // Raised highway parapets & central transit guideway
  sbDrawBoxShell(FRM,FRM,null,hw.x0,hw.x1,hw.y,hw.y+1.6,z0,z0+1.1,{});
  sbDrawBoxShell(FRM,FRM,null,hw.x0,hw.x1,hw.y,hw.y+1.6,z1-1.1,z1,{});
  sbDrawBoxShell(FRM,FRM,null,hw.x0,hw.x1,hw.y,hw.y+0.9,hw.z-0.8,hw.z+0.8,{});
  // Rim approach piers outside the gorge (|x| = 456..744) anchoring viaducts down into groundAt without poking above soffit
  for(const sx of [-1,1]){
   for(let px=460;px<=740;px+=56){
    const x=sx*px,soffY=hw.y-hw.thick,gy=Math.min(soffY-3.5,STONEBOW.groundAt(x,hw.z)-2.5);
    const h=soffY-gy+0.2;
    kput(boxFrame,[x,gy+h*0.5,hw.z],null,[9,h,12],null);
   }
  }
 }
 // Semicircular rim U-loop viaducts connecting North & South highways at x = +/-492
 for(const ul of P.uloops){
  const rIn=ul.r-ul.w*0.5,rOut=ul.r+ul.w*0.5,y0=ul.y-ul.thick,y1=ul.y;
  const angFn=u=>ul.sx>0?(-Math.PI*0.5+u*Math.PI):(Math.PI*0.5+u*Math.PI);
  ROOF.push(gridSurface((u,v)=>{
   const a=angFn(u),r=lerp(rIn,rOut,v);
   return [ul.cx+Math.cos(a)*r,y1,ul.cz+Math.sin(a)*r];
  },36,3,{uS:24,vS:2}));
  SOFF.push(gridSurface((u,v)=>{
   const a=angFn(1-u),r=lerp(rIn,rOut,v);
   return [ul.cx+Math.cos(a)*r,y0,ul.cz+Math.sin(a)*r];
  },36,3,{uS:24,vS:2}));
  for(const rr of [rIn,rOut]){
   FRM.push(gridSurface((u,v)=>{
    const a=angFn(u);
    return [ul.cx+Math.cos(a)*rr,lerp(y0,y1+1.3,v),ul.cz+Math.sin(a)*rr];
   },36,2,{uS:24,vS:1}));
  }
  // Support columns under U-loop onto the plateau groundAt (strictly below soffit y0)
  for(let k=1;k<=5;k++){
   const a=angFn(k/6),cx=ul.cx+Math.cos(a)*ul.r,cz=ul.cz+Math.sin(a)*ul.r;
   const gy=Math.min(y0-3.5,STONEBOW.groundAt(cx,cz)-2.5),h=y0-gy+0.2;
   kput(boxFrame,[cx,gy+h*0.5,cz],null,[7,h,7],null);
  }
 }

 // ---- 6. Four Tapered Twin-Shaft Gate Pylons (x = +/-350, z = +/-118) ---------------------------------------------
 for(const py of P.pylons){
  // Root the pylon footing deep into the canyon wall rock below py.y0 so KRUINS sees solid ground contact
  const gFoot=Math.min(py.y0,STONEBOW.groundAt(py.x,py.z)-4);
  const yPortal0=py.portal.y0,yPortal1=py.portal.y1;
  // Lower shaft below highway portal (gFoot .. yPortal0), hollow around y = 386 for STONEBOW_INT pylon guardhouse
  sbDrawBoxShell(FRM,ROOF,SOFF,py.x-py.w0*0.5,py.x+py.w0*0.5,gFoot,yPortal0,py.z-py.d0*0.5,py.z+py.d0*0.5,{});
  sbDeckSlab(SOFF,py.x-py.w0*0.5+0.4,py.x+py.w0*0.5-0.4,385.95,py.z-py.d0*0.5+0.4,py.z+py.d0*0.5-0.4,0.35);

  // Portal side cheeks flanking the 24 m highway deck (y = 420..448), leaving the 24 m roadway wide open!
  const cheekD=(py.d0-D.HWY_W)*0.5;
  sbDrawBoxShell(FRM,ROOF,SOFF,py.x-20,py.x+20,yPortal0-0.3,yPortal1,py.z-py.d0*0.5,py.z-D.HWY_W*0.5,{});
  sbDrawBoxShell(FRM,ROOF,SOFF,py.x-20,py.x+20,yPortal0-0.3,yPortal1,py.z+D.HWY_W*0.5,py.z+py.d0*0.5,{});
  if(cheekD>2){
   // Transverse tie-bridges linking the gate pylons inward to the main bridge megatruss (z = +/-94)
   const zInA=py.sz<0?py.z+py.d0*0.5-0.5:-94-0.5;
   const zInB=py.sz<0?-94+0.5:py.z-py.d0*0.5+0.5;
   sbDrawBoxShell(FRM,ROOF,SOFF,py.x-16,py.x+16,D.RY-6,D.RY+4,Math.min(zInA,zInB),Math.max(zInA,zInB),{});
  }

  // Upper pylon watch house above highway portal (y = 448..486), hollow around y = 454 for STONEBOW_INT watch rooms
  sbDrawBoxShell(RES_KEPT,ROOF,SOFF,py.x-py.w1*0.5,py.x+py.w1*0.5,yPortal1-0.2,486,py.z-py.d1*0.5,py.z+py.d1*0.5,{});
  sbDeckSlab(SOFF,py.x-py.w1*0.5+0.4,py.x+py.w1*0.5-0.4,453.95,py.z-py.d1*0.5+0.4,py.z+py.d1*0.5-0.4,0.35);

  // Twin monumental cylindrical towers rising from the portal cross-head (y = 447..516), keeping the highway portal unobstructed
  for(const sh of py.shafts){
   const shY0=yPortal1-1.0,shH=py.y1-shY0;
   kput(coreDef,[sh.x,shY0+shH*0.5,sh.z],null,[sh.r,shH,sh.r],null);
   kput(boxFrame,[sh.x,py.y1+1.5,sh.z],null,[sh.r*2.15,3.0,sh.r*2.15],null);
  }
 }

 // ---- 7. Main CITY CENTER Compression Arch (x = -412..+412, y = 290..420) & 3-Storey Concourse --------------------
 {
  const nSeg=44,xA=-D.ARCH_X,xB=D.ARCH_X;
  // Coffered barrel arch soffit + top extrados tying into the canyon cliffs at both ends
  SOFF.push(gridSurface((u,v)=>{
   const x=lerp(xA,xB,u),y=STONEBOW.archSoffit(x);
   return [x,y,lerp(-94,94,v)];
  },nSeg,6,{uS:48,vS:12}));

  for(const sz of [-1,1]){
   const zFace=sz*94;
   // Deep twin parabolic arch ribs on north and south elevations
   FRM.push(gridSurface((u,v)=>{
    const x=lerp(xA,xB,u),y0=STONEBOW.archSoffit(x),y1=Math.min(D.RY,y0+10+18*Math.pow(Math.abs(x)/D.ARCH_X,1.4));
    return sz>0?[x,lerp(y0,y1,v),zFace]:[lerp(xB,xA,u),lerp(STONEBOW.archSoffit(lerp(xB,xA,u)),Math.min(D.RY,STONEBOW.archSoffit(lerp(xB,xA,u))+10+18*Math.pow(Math.abs(lerp(xB,xA,u))/D.ARCH_X,1.4)),v),zFace];
   },nSeg,2,{uS:48,vS:2}));
   // Vertical spandrel piers connecting the arch extrados up to the y = 420 main bridge deck
   for(let xp=-384;xp<=384;xp+=48){
    const ya=STONEBOW.archSoffit(xp)+6;
    if(D.RY-ya<4)continue;
    const h=D.RY-ya+1.0;
    kput(boxFrame,[xp,ya+h*0.5,sz*88],null,[7.5,h,9],null);
   }
  }
  // Anchor blocks keying the arch springings into the West & East canyon walls
  for(const sx of [-1,1]){
   const xSpr=sx*D.ARCH_X,gy=Math.min(D.ARCH_Y0,STONEBOW.groundAt(xSpr,0)-6);
   sbDrawBoxShell(FRM,ROOF,SOFF,xSpr-18,xSpr+18,gy,D.RY+1,-96,96,{});
  }

  // Hollow 3-storey CITY CENTER Concourse (x = -212..+212, z = -84..+84, y = 388..420)
  // Houses STONEBOW_INT 'city' storeys at y = 390, 400, 408
  sbDrawBoxShell(WRK_KEPT,ROOF,SOFF,-214,214,388,D.RY+0.4,-84,84,{});
  for(const sy of [389.95,399.95,407.95]){
   sbDeckSlab(SOFF,-213.5,213.5,sy,-83.5,83.5,0.35);
  }
  // Approach bridge spine decks from +/-214 out to +/-424 (linking City Center to the Gate Pylons & Rim Vaults)
  for(const sx of [-1,1]){
   const xa=sx<0?-426:213.5,xb=sx<0?-213.5:426;
   sbDrawBoxShell(WRK_KEPT,ROOF,SOFF,xa,xb,396,D.RY+0.4,-92,92,{});
  }
 }

 // ---- 8. Upper Living-Working BOW Megatruss, Stepped Residential Terraces & Spine Light Wells ---------------------
 {
  // Stepped hollow residential-working bow tiers (P.bowTiers: y = 428..528)
  for(let ti=0;ti<P.bowTiers.length;ti++){
   const bt=P.bowTiers[ti];
   const y0=ti===0?D.RY-0.3:P.bowTiers[ti-1].y+P.bowTiers[ti-1].h-0.4;
   const y1=bt.y+bt.h;
   // Ruin notch in bay 4 on upper tiers (x = 120..240, y > 442)
   const isBay4Hole=(u)=>isRuin&&ti>=2&&lerp(bt.x0,bt.x1,u)>118&&lerp(bt.x0,bt.x1,u)<238;
   // Punch spine light well openings out of roof slabs so the 9 wells read as deep vertical courts from overhead!
   const wellHole=(u,v)=>{
    const x=lerp(bt.x0,bt.x1,u),z=lerp(-bt.zHalf,bt.zHalf,v);
    if(isBay4Hole(u))return true;
    for(const wl of P.wells){
     if(wl.kind==='rosette'){if(Math.hypot(x-wl.x,z-wl.z)<wl.r-1.5)return true;}
     else if(Math.abs(x-wl.x)<wl.w*0.5-1.5&&Math.abs(z-wl.z)<wl.d*0.5-1.5)return true;
    }
    return false;
   };
   sbDrawBoxShell(RES_KEPT,ROOF,SOFF,bt.x0,bt.x1,y0,y1,-bt.zHalf,bt.zHalf,{roofHole:wellHole});

   // Continuous structural floor plate at STONEBOW_INT 'bow' heights (428, 444, 460, 476)
   if(ti<4){
    const fy=[427.95,443.95,459.95,475.95][ti];
    const xEnd=isRuin&&ti>=1?114:bt.x1-0.5;
    sbDeckSlab(SOFF,bt.x0+0.5,xEnd,fy,-bt.zHalf+0.5,bt.zHalf-0.5,0.35);
   }

   // Corbelled cantilevered garden promenade decks along North and South faces (Soleri plate 36 Inset 2)
   if(bt.cantilever>0){
    for(const sz of [-1,1]){
     const za=sz*bt.zHalf,zb=sz*(bt.zHalf+bt.cantilever);
     const z0=Math.min(za,zb),z1=Math.max(za,zb);
     sbDrawBoxShell(FRM,ROOF,SOFF,bt.x0+6,bt.x1-6,bt.y-1.4,bt.y+0.2,z0,z1,{});
     // Promenade balustrade
     sbDrawBoxShell(FRM,FRM,null,bt.x0+6,bt.x1-6,bt.y+0.2,bt.y+1.35,sz>0?z1-0.6:z0,sz>0?z1:z0+0.6,{});
    }
   }
  }

  // 6-bay X-braced megatruss across both faces (P.trusses): iconic Soleri diagonal steel/concrete exoskeleton
  for(const tr of P.trusses){
   const broken=isRuin&&tr.bay===RU.brokenTrussBay&&tr.sz>0;
   const braced=isRefurb&&tr.bay===RF.bracedTrussBay&&tr.sz>0;
   const zB=tr.z0+tr.sz*2.2;
   const pA0=[tr.xa,tr.ya0,zB],pB0=[tr.xb,tr.yb0,zB];
   const pA1=[tr.xa,tr.ya1,tr.zTopA+tr.sz*1.8],pB1=[tr.xb,tr.yb1,tr.zTopB+tr.sz*1.8];
   // Vertical megacolumns at bay boundaries
   rbeam(boxFrame,pA0,pA1,5.5,4.8,null);
   if(tr.bay===5)rbeam(boxFrame,pB0,pB1,5.5,4.8,null);
   if(broken){
    // Torn chord stubs attached to the standing columns (no floating pieces!)
    const pStubA=[lerp(pA1[0],pB1[0],0.26),lerp(pA1[1],pB1[1],0.26)-3,lerp(pA1[2],pB1[2],0.26)];
    rbeam(boxFrame,pA1,pStubA,4.2,4.0,null);
    continue;
   }
   if(braced){
    // Refurbished salvage steel-and-timber truss spanning the old bay-4 breach
    rbeam('sbCable',pA1,pB1,3.6,3.4,null);
    rbeam('sbCable',pA0,pB1,3.0,2.8,null);
    rbeam('sbCable',pB0,pA1,3.0,2.8,null);
   }else{
    // Upper bow chord + X-brace diagonals
    rbeam(boxFrame,pA1,pB1,5.2,4.6,null);
    rbeam(boxFrame,pA0,pB1,4.2,3.8,null);
    rbeam(boxFrame,pB0,pA1,4.2,3.8,null);
   }
  }

  // Nine Spine Light Wells + Twin Bronze/Glass Rosette Oculi (Soleri plate 35)
  for(const wl of P.wells){
   const wBroken=isRuin&&RU.brokenWells.indexOf(wl.index)>=0;
   if(wl.kind==='rosette'){
    // Circular bronze/verdigris rosette oculus wheel + radial spokes + glass dome
    const rO=wl.r,yO=wl.y1+1.5;
    PATINA.push(lathe({rFn:()=>rO+1.6,H:4.2,nu:32,nv:2}).translate(wl.x,yO-2.0,wl.z));
    PATINA.push(lathe({rFn:()=>rO*0.28,H:4.8,nu:20,nv:2}).translate(wl.x,yO-2.2,wl.z));
    for(let sp=0;sp<12;sp++){
     if(wBroken&&sp>6)continue;
     const a=(sp/12)*TAU;
     rbeam(boxFrame,[wl.x+Math.cos(a)*rO*0.25,yO,wl.z+Math.sin(a)*rO*0.25],[wl.x+Math.cos(a)*(rO+1.2),yO,wl.z+Math.sin(a)*(rO+1.2)],1.4,1.2,null);
    }
    if(!wBroken){
     SKY_GLS.push(gridSurface((u,v)=>{
      const a=u*TAU,rr=v*rO;
      return [wl.x+Math.cos(a)*rr,yO+0.8+3.6*(1-v*v),wl.z+Math.sin(a)*rr];
     },28,5,{uS:8,vS:2}));
    }
   }else if(wl.kind==='rect'){
    // Rectangular spine light-well shaft walls (lining the court from y = 420 up to bowTop) + perimeter curb
    sbDrawBoxShell(FRM,null,null,wl.x-wl.w*0.5,wl.x+wl.w*0.5,D.RY,wl.y1+2.2,wl.z-wl.d*0.5,wl.z+wl.d*0.5,{});
    if(!wBroken){
     // Arched translucent skylight hood over the light well
     SKY_GLS.push(gridSurface((u,v)=>{
      const x=lerp(wl.x-wl.w*0.5,wl.x+wl.w*0.5,u),zn=(v-0.5)*2;
      return [x,wl.y1+2.2+wl.skylightH*(1-zn*zn),wl.z+zn*wl.d*0.5];
     },10,8,{uS:6,vS:4}));
    }
   }
  }
 }

 // ---- 9. Stepped CULTURAL CENTER & SKYLIGHT CROWN (x = -82..+82, z = -50..+50, y = 492..570) ----------------------
 {
  const C=P.crown;
  // Hollow stepped Cultural Center shell housing STONEBOW_INT 'crown' storeys (y = 496, 508, 520)
  sbDrawBoxShell(WRK_KEPT,ROOF,SOFF,C.x0,C.x1,C.y0,536,C.z0,C.z1,{});
  for(const cy of [495.95,507.95,519.95]){
   sbDeckSlab(SOFF,C.x0+0.5,C.x1-0.5,cy,C.z0+0.5,C.z1-0.5,0.35);
  }
  // Upper lantern clerestory & monumental arched SKYLIGHT vault reaching y = 570 (+150 m above rim: Soleri plate 36 Inset 3)
  sbDrawBoxShell(FRM,ROOF,SOFF,-54,54,535.6,554,-30,30,{});
  // Transverse concrete arch ribs framing the crown skylight
  for(let rx=-48;rx<=48;rx+=16){
   FRM.push(gridSurface((u,v)=>{
    const zn=(u-0.5)*2,yBase=554+16*(1-zn*zn);
    return [rx+(v-0.5)*2.6,yBase,zn*28];
   },16,1,{uS:8,vS:1}));
  }
  SKY_GLS.push(gridSurface((u,v)=>{
   const x=lerp(-50,50,u),zn=(v-0.5)*2;
   return [x,553.8+16.2*(1-zn*zn),zn*28];
  },18,12,{uS:12,vS:6,hole:isRuin?(u,v)=>u>0.62&&Math.abs(v-0.5)<0.28:null}));
 }

 // ---- 10. Suspended TOURIST CENTER Bridge (y = 168..198), Diagonal Cliff Box-Struts & Canyon Cantilevers ----------
 {
  const TC=P.tourist;
  const tx1=isRuin?RU.brokenTouristX:TC.x1;
  // Boat-keel soffit + hollow 3-storey panorama bridge (houses STONEBOW_INT 'tourist' storeys at y = 174, 184)
  sbDrawBoxShell(WRK_KEPT,ROOF,SOFF,TC.x0,tx1,TC.y0,TC.y1,TC.z0,TC.z1,{});
  for(const ty of [173.95,183.95]){
   sbDeckSlab(SOFF,TC.x0+0.5,tx1-0.4,ty,TC.z0+0.5,TC.z1-0.5,0.35);
  }
  // Glazed panoramic ribbon windows along North & South river-viewing faces
  for(const sz of [-1,1]){
   GLS.push(gridSurface((u,v)=>{
    const x=lerp(TC.x0+8,tx1-6,u),y=lerp(174.5,181.5,v);
    return sz>0?[x,y,TC.z1+0.25]:[lerp(tx1-6,TC.x0+8,u),y,TC.z0-0.25];
   },24,2,{uS:20,vS:2}));
  }
  // Rooftop promenade balustrades & planted garden strips at y = 198
  sbDrawBoxShell(FRM,FRM,null,TC.x0,tx1,TC.y1,TC.y1+1.4,TC.z0,TC.z0+1.0,{});
  sbDrawBoxShell(FRM,FRM,null,TC.x0,tx1,TC.y1,TC.y1+1.4,TC.z1-1.0,TC.z1,{});
  if(!isRuin){
   for(let px=-156;px<=156;px+=39){
    kput('sbCrop',[px,TC.y1+0.45,-34],null,[22,0.8,7],null);
    kput('sbCrop',[px,TC.y1+0.45,34],null,[22,0.8,7],null);
   }
  }

  if(isRuin){
   // Ragged sheared floor/girder stubs projecting from the collapsed x = +28 break (touching main body!)
   for(let zStub=-42;zStub<=42;zStub+=14){
    const len=5+7*U(710,zStub+50,0);
    kput(boxFrame,[tx1+len*0.5-0.6,TC.y0+6,zStub],qEuler(0,0,-0.08),[len,2.2,4.5],null);
   }
   // Seated wreckage slabs on the canyon floor throat: positioned by exact rotated AABB min so KRUINS passes 100%!
   for(const w of RU.wrecks){
    const q=qEuler(w.rot[0],w.rot[1],w.rot[2]);
    const m4=new THREE.Matrix4().makeRotationFromQuaternion(q),el=m4.elements;
    const sx=w.size[0],sy=w.size[1],sz=w.size[2];
    const hx=0.5*(Math.abs(el[0])*sx+Math.abs(el[4])*sy+Math.abs(el[8])*sz);
    const hy=0.5*(Math.abs(el[1])*sx+Math.abs(el[5])*sy+Math.abs(el[9])*sz);
    const hz=0.5*(Math.abs(el[2])*sx+Math.abs(el[6])*sy+Math.abs(el[10])*sz);
    const gMin=Math.min(
     STONEBOW.groundAt(w.x,w.z),
     STONEBOW.groundAt(w.x-hx,w.z-hz),STONEBOW.groundAt(w.x+hx,w.z-hz),
     STONEBOW.groundAt(w.x-hx,w.z+hz),STONEBOW.groundAt(w.x+hx,w.z+hz)
    );
    kput(boxFrame,[w.x,gMin+hy-0.35,w.z],q,[sx,sy,sz],null);
   }
  }

  // Cliff Mechanical Roots (y = 252..300) anchored into rock + Diagonal Box-Struts + Stepped Canyon Cantilevers
  const mrTarget=sbIsIntactOrKept(mode,true)?WRK_KEPT:WRK_DEAD;
  for(const mr of P.mechRoots){
   // Extend cliff-side footing inward so it embeds solidly into groundAt on the canyon cliff
   const xRock=mr.sx<0?mr.x0-24:mr.x1+24;
   const xa=Math.min(mr.x0,xRock),xb=Math.max(mr.x1,xRock);
   sbDrawBoxShell(mrTarget,ROOF,SOFF,xa,xb,mr.y0,mr.y1,mr.z0,mr.z1,{});
   if(mr.sx>0){
    // Structural floor deck at y = 266 for STONEBOW_INT 'vaults-e' cliff mechanical hall
    sbDeckSlab(SOFF,xa+1,xb-1,265.95,mr.z0+1,mr.z1-1,0.35);
   }
   // Vertical cliff pilaster tying Mechanical Root up to the main Arch springing (y = 292..346)
   sbDrawBoxShell(FRM,ROOF,SOFF,mr.sx<0?-418:354,mr.sx<0?-354:418,mr.y1-1,346,-74,74,{});
   // Stepped cliff corbel buttress tying Lower Cantilever (204..224) & Upper Cantilever (236..258) solidly into Mechanical Root
   sbDrawBoxShell(FRM,ROOF,SOFF,mr.sx<0?-368:284,mr.sx<0?-284:368,202,256,-44,44,{});
  }

  for(const st of P.struts){
   if(isRuin&&st.role==='tourist'&&st.sx>0){
    // Collapsed eastern Tourist strut: leave only a short angled root stub anchored in the east cliff mechanical block
    const stubB=[lerp(st.a[0],st.b[0],0.22),lerp(st.a[1],st.b[1],0.22),st.a[2]];
    rbeam(boxFrame,st.a,stubB,st.h,st.w,null);
    continue;
   }
   rbeam(boxFrame,st.a,st.b,st.h,st.w,null);
  }

  // Four stepped canyon-wall cantilever overlooks framing the eye-shaped central canyon void (Soleri plate 36)
  for(const ct of P.cantilevers){
   const xCliff=ct.sx<0?ct.x0-38:ct.x1+38;
   const xa=Math.min(ct.x0,xCliff),xb=Math.max(ct.x1,xCliff);
   sbDrawBoxShell(WRK_KEPT,ROOF,SOFF,xa,xb,ct.y0,ct.y1,ct.z0,ct.z1,{});
  }

  // Refurbished high-tension stabilizer cables securing Tourist Center to the Gate Pylons
  if(RF){
   for(const cb of RF.stabilizerCables){
    rbeam('sbCable',cb.a,cb.b,1.1,1.1,null);
   }
  }
 }

 // ---- 11. Canyon-Floor Park, Footbridge & Twin Vertical Gorge Lift Towers (y = 0..172) ----------------------------
 {
  const pk=P.park;
  // Arched pedestrian footbridge across the Ching-Ma river at z = +56 (anchored on both riverbanks)
  const rxB=STONEBOW.riverX(pk.bridge.z),rwB=STONEBOW.riverW(pk.bridge.z)*0.5+14;
  const gBankW=STONEBOW.groundAt(rxB-rwB,pk.bridge.z)-0.8,gBankE=STONEBOW.groundAt(rxB+rwB,pk.bridge.z)-0.8;
  sbDrawBoxShell(FRM,ROOF,null,rxB-rwB-4,rxB-rwB+4,gBankW,pk.bridge.y+0.8,pk.bridge.z-4.5,pk.bridge.z+4.5,{});
  sbDrawBoxShell(FRM,ROOF,null,rxB+rwB-4,rxB+rwB+4,gBankE,pk.bridge.y+0.8,pk.bridge.z-4.5,pk.bridge.z+4.5,{});
  ROOF.push(gridSurface((u,v)=>{
   const x=lerp(rxB-rwB,rxB+rwB,u),arch=3.2*Math.sin(u*Math.PI);
   return [x,pk.bridge.y+arch,pk.bridge.z+(v-0.5)*pk.bridge.w];
  },18,2,{uS:8,vS:1}));

  // Twin vertical Gorge Lift towers connecting canyon-floor park up to Tourist Center (y = groundAt..172)
  for(const lf of pk.lifts){
   const gCorners=Math.min(
    STONEBOW.groundAt(lf.x,lf.z),
    STONEBOW.groundAt(lf.x-11,lf.z-11),STONEBOW.groundAt(lf.x+11,lf.z-11),
    STONEBOW.groundAt(lf.x-11,lf.z+11),STONEBOW.groundAt(lf.x+11,lf.z+11)
   );
   const gy=gCorners-0.45;
   const yTop=isRuin&&lf.sx>0?74:lf.y1;
   const h=yTop-gy;
   kput(coreDef,[lf.x,gy+h*0.5,lf.z],null,[lf.r,h,lf.r],null);
   // Base lobby pavilion seated cleanly at gCorners - 0.45
   sbDrawBoxShell(FRM,ROOF,SOFF,lf.x-11,lf.x+11,gy,gCorners+7.2,lf.z-11,lf.z+11,{});
  }
 }

 // ---- 12. Cut-and-Cover Rim Industrial Vaults (WAREHOUSING / AUTOMATED INDUSTRIES / FACTORIES) & Bulkheads --------
 {
  const vaultWall=(isRuin||isRefurb)?WRK_DEAD:WRK_KEPT;
  for(const vt of P.vaults){
   // Extend base to touch groundAt where rim meets cliff, and house STONEBOW_INT 'vaults-w'/'vaults-e' at y = 342, 358
   sbDrawBoxShell(vaultWall,ROOF,SOFF,vt.x0-0.4,vt.x1+0.4,vt.y0,vt.y1+0.3,vt.z0,vt.z1,{});
   if(vt.index===0){
    const vx0=vt.sx<0?-688:432,vx1=vt.sx<0?-432:688;
    for(const vy of [341.95,357.95]){
     sbDeckSlab(SOFF,vx0,vx1,vy,-86,86,0.35);
    }
   }
   // Barrel-vaulted rooftop skylights/monitors protruding above the rim terrace at y = 420..427 (vt avoids shadowing parameter v!)
   FRM.push(gridSurface((u,v)=>{
    const x=lerp(vt.x0+6,vt.x1-6,u),zn=(v-0.5)*2;
    return [x,D.RY+6.5*(1-zn*zn),zn*36];
   },8,8,{uS:8,vS:6}));
  }

  // Pylon Bulkhead Gates (sealed rusted blast doors in refurbished centerpiece isolating delving ruins!)
  for(const bh of P.bulkheads){
   if(isRefurb){
    kput('boxR',[bh.x,bh.y,bh.z],null,[4.5,24,48],null);
    rbeam('sbCable',[bh.x-2.6,bh.y-10,bh.z-20],[bh.x-2.6,bh.y+10,bh.z+20],1.6,1.4,null);
    rbeam('sbCable',[bh.x-2.6,bh.y+10,bh.z-20],[bh.x-2.6,bh.y-10,bh.z+20],1.6,1.4,null);
   }else{
    kput(boxFrame,[bh.x,bh.y,bh.z-26],null,[4.0,22,12],null);
    kput(boxFrame,[bh.x,bh.y,bh.z+26],null,[4.0,22,12],null);
   }
  }
 }

 // ---- 13. Four Splayed Polygonal Rim Neighborhood Wings with Circular Amphitheater Bowls (Soleri plates 34 & 35) --
 for(const wg of P.wings){
  const wingDead=isRuin||(isRefurb&&wg.tag==='ne');
  const wList=wingDead?RES_DEAD:RES_KEPT;
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const pt of wg.poly){
   x0=Math.min(x0,pt[0]);x1=Math.max(x1,pt[0]);
   z0=Math.min(z0,pt[1]);z1=Math.max(z1,pt[1]);
  }
  // Connect wing apron inward to the outer highway viaduct (|z| = 130..142) so it forms one continuous rim fabric
  const zJoin0=wg.sz<0?z1-2:128,zJoin1=wg.sz<0?-128:z0+2;
  sbDrawBoxShell(FRM,ROOF,null,wg.sx<0?-480:400,wg.sx<0?-400:480,D.RY-4,D.RY+4,Math.min(zJoin0,zJoin1),Math.max(zJoin0,zJoin1),{});

  // Polygonal perimeter walls + 3 stepped terrace tiers
  const Ppts=wg.poly;
  for(let i=0;i<Ppts.length;i++){
   const a=Ppts[i],b=Ppts[(i+1)%Ppts.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
   const gy=Math.min(D.RY-3,STONEBOW.groundAt((a[0]+b[0])*0.5,(a[1]+b[1])*0.5)-1.5);
   wList.push(gridSurface((u,v)=>[lerp(a[0],b[0],u),lerp(gy,wg.y1,v),lerp(a[1],b[1],u)],Math.max(2,Math.round(L/25.6)),1,{uS:L/25.6,vS:(wg.y1-gy)/25.6}));
  }
  // Roof terrace punched with the two recessed circular amphitheater bowls
  const bowlHole=(u,v)=>{
   const x=lerp(x0,x1,u),z=lerp(z0,z1,v);
   if(!sbPointInPoly(x,z,Ppts))return true;
   for(const bw of wg.bowls){if(Math.hypot(x-bw.cx,z-bw.cz)<bw.r-1.0)return true;}
   return false;
  };
  ROOF.push(gridSurface((u,v)=>[lerp(x0,x1,u),wg.y1,lerp(z0,z1,v)],24,18,{uS:(x1-x0)/16,vS:(z1-z0)/16,hole:bowlHole}));

  // Stepped circular amphitheater garden bowls (Soleri plate 34 & 35)
  for(const bw of wg.bowls){
   FRM.push(gridSurface((u,v)=>{
    const a=u*TAU,step=Math.floor(v*5)/5;
    const r=lerp(bw.r*0.26,bw.r,v),y=lerp(wg.y1-bw.depth,wg.y1,step);
    return [bw.cx+Math.cos(a)*r,y,bw.cz+Math.sin(a)*r];
   },28,10,{uS:12,vS:4}));
   ROOF.push(gridSurface((u,v)=>{
    const a=u*TAU,r=v*bw.r*0.28;
    return [bw.cx+Math.cos(a)*r,wg.y1-bw.depth,bw.cz+Math.sin(a)*r];
   },20,2,{uS:4,vS:2}));
  }
 }

 // ---- 14. Terrace, Wing & Canyon-Park Flora + Refurbished Rooftop Agriculture & Decay Dressing --------------------
 for(let i=0;i<P.dress.length;i++){
  const dr=P.dress[i];
  if(isRuin&&dr.zone==='bow'&&dr.at[0]>110)continue;
  const hScale=isRuin?1.25:1.0;
  VEG.tree(dr.at[0],dr.at[1],dr.at[2],i%3,dr.h*hScale);
 }

 if(RF){
  for(const cr of RF.crops){
   if(cr.kind==='greenhouse'){
    kput('sbTunnel',[cr.at[0],cr.at[1],cr.at[2]],null,[cr.size[0],cr.size[1],cr.size[2]*0.5],null);
   }else{
    kput('sbCrop',[cr.at[0],cr.at[1]+cr.size[1]*0.5,cr.at[2]],null,cr.size,null);
   }
  }
 }

 // Flush merged opaque geometry buckets
 meshMerged(FRM,matFrame,G);
 meshMerged(RES_KEPT,matResMain,G);
 meshMerged(WRK_KEPT,matWrkMain,G);
 meshMerged(RES_DEAD,MAT.acResR,G);
 meshMerged(WRK_DEAD,MAT.acWrkR,G);
 meshMerged(ROOF,CONC(dd),G);
 meshMerged(SOFF,CONC(dd),G);
 meshMerged(PATINA,MAT.verdigris,G);
 for(const g of GLS)mesh(g,dd&&isRuin?MAT.winDead:MAT.glass,G);
 for(const g of SKY_GLS)mesh(g,isRuin?MAT.sbSkylightR:MAT.sbSkylight,G);

 // Weathering moss & vines on ruined and delving surfaces
 if(isRuin){
  mossOnSurface(FRM,0,0,0,90,2.4);
  vinesFromLedge(FRM,0,0,0,44,22);
  stainsFromLedge(FRM,0,0,0,52,18);
 }else if(isRefurb){
  mossOnSurface(WRK_DEAD,0,0,0,36,2.0);
  stainsFromLedge(FRM,0,0,0,28,14);
 }

 // Scale human figures on the Tourist Center overlook & City Center plaza (intact & refurbished)
 if(!isRuin){
  figures(0,0,8,28);
 }

 // Emit core/water records for this canyon site (drawn in 90w-stonebow-water.js)
 if(typeof SBWATER!=='undefined'){
  SBWATER.canyon(d,{gx:gx,gz:gz,mode:mode});
 }

 SB_SITE[mode]={gx:gx,gz:gz,d:d,plan:P,ruin:RU,refurb:RF,group:G};
 KOFF=[0,0,0];
 return G;
}

function sbIsIntactOrKept(mode,isDelve){
 if(mode==='intact')return true;
 if(mode==='ruined')return false;
 return !isDelve;
}

function sbPointInPoly(x,z,poly){
 let inside=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const xi=poly[i][0],zi=poly[i][1],xj=poly[j][0],zj=poly[j][1];
  const dz=zj-zi,den=Math.abs(dz)>1e-9?dz:1e-9;
  const hit=((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/den+xi);
  if(hit)inside=!inside;
 }
 return inside;
}

function buildStonebow(scene,gx,gz,d){reseed(12400+d);return sbDrawSite(scene,gx,gz,d,d>0?'ruined':'intact');}
function buildStonebowRefurb(scene,gx,gz,d){reseed(12410+d);return sbDrawSite(scene,gx,gz,d,'refurb');}
