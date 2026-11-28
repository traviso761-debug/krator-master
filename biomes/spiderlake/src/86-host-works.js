// ================================================================= HOST — site reserves & ?works=0 arachniculture frames ([draw])
// Registers site:spider-lake-weirs (1288, 220, Ham-Spi Silk Principality Seat Reserve) strictly clear of any buildings,
// and when ?works!=0 places removable cedar-and-porphyry Silk-Weir reeling frames (>= 0.06 m clear slot separation from
// silk edges), terracotta smudge-pots, and glowing oiled cocoon lanterns (all class: 'furniture', 100% textured).
const WORKS=(function(){
 const Q=new URLSearchParams(location.search),on=Q.get('works')!=='0';
 const group=new THREE.Group();
 group.name='spiderlake-works';
 group.userData.host=true;
 scene.add(group);
 const items=[],smudgePots=[],lanterns=[];
 SPIDERLAKE.WEIR_SLOTS.length=0;

 // Always register Silk Principality settlement reserves & station hazards in KTAGS (zero class === 'building' anywhere!)
 if(SITE.reserves&&SITE.reserves.length&&typeof KTAGS!=='undefined'&&KTAGS.page){
  for(let i=0;i<SITE.reserves.length;i++){
   const R=SITE.reserves[i],ry=DRAWN_H(R.x,R.z);
   KTAGS.page.add({
    id:R.id,name:R.name,class:'site',at:[R.x,ry,R.z],r:R.r,h:22,
    tags:{biome:'spiderlake',culture:'spider-lake',kit:R.kit,specRadiusM:R.specRadiusM,elevASL:+(SITE.baseElevM+ry).toFixed(1)}
   });
   REGISTER({tagId:R.id+':bench',tagClass:'site',name:R.name,x:R.x,y:ry-2,z:R.z,r:R.r,h:20,tags:{culture:'spider-lake'}});
  }
 }
 if(!HAZARDS.length&&typeof KHAZ!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
  const regHaz=(id,name,x,z,r,h,haz)=>{
   const y=DRAWN_H(x,z);
   const rec={id:id,name:name,class:'feature',at:[x,y,z],r:r,h:h,tags:{biome:'spiderlake',hazard:KHAZ.make(haz)}};
   KTAGS.page.add(rec);
   HAZARDS.push(rec);
  };
  if(SKEY==='spillway'){
   regHaz('spiderlake:spillway','Ham-Tsek 380 m3/s Breach Cataract Sweep',-110,0,85,24,{kind:'drown',effect:'drown',danger:0.75,dose:0.35,falloff:'smooth'});
   regHaz('spiderlake:snarecurtain','Peripheral Snare-Curtain Web Sheet (non-lethal 65% slow)',-25,4,68,26,{kind:'grab',effect:'hold',danger:0.25,dose:0.10,falloff:'linear'});
  }else if(SKEY==='narrows'){
   regHaz('spiderlake:snarecurtain','Golden Narrows Outer Funnel-Web Margin (non-lethal 65% slow)',12,-44,75,26,{kind:'grab',effect:'hold',danger:0.22,dose:0.08,falloff:'linear'});
  }else if(SKEY==='pavilion'){
   regHaz('spiderlake:snarecurtain','Canopy Funnel-Sheet Understory Tangler (non-lethal 65% slow)',0,-18,85,18,{kind:'grab',effect:'hold',danger:0.24,dose:0.10,falloff:'linear'});
   regHaz('spiderlake:broodguard','Arachneapolita Brood-Pavilion Guard Drum (< 2.5 m without Hum/smudge)',12,-28,28,16,{kind:'hunter',effect:'bleed',danger:0.30,dose:0.12,falloff:'smooth'});
  }else if(SKEY==='fen'){
   regHaz('spiderlake:thermalbath','Hot Alkaline Carbonate Vent Throat (+44.2 C scald center)',78,58,9.5,4,{kind:'heat',effect:'burn',danger:0.52,dose:0.24,falloff:'smooth'});
  }else if(SKEY==='haugel'){
   regHaz('spiderlake:thermalbath','Hau-Gel Upper Scalding Sinter Terrace Vent (+45.6 C scald center)',44,58,12.5,4,{kind:'heat',effect:'burn',danger:0.58,dose:0.28,falloff:'smooth'});
  }
 }

 const byMat=new Map();
 const addPart=(geo,mat,x,y,z,rx,ry,rz,label)=>{
  const m4=new THREE.Matrix4().compose(
   new THREE.Vector3(x,y,z),
   new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),
   new THREE.Vector3(1,1,1)
  );
  geo.applyMatrix4(m4);
  if(mat&&mat.vertexColors&&!geo.attributes.color){
   const vc=new Float32Array(geo.attributes.position.count*3);
   vc.fill(1.0);
   geo.setAttribute('color',new THREE.BufferAttribute(vc,3));
  }
  let bucket=byMat.get(mat);
  if(!bucket){bucket=[];byMat.set(mat,bucket);}
  bucket.push({geo:geo,label:label});
 };
 const flushParts=()=>{
  byMat.forEach((parts,mat)=>{
   if(!parts.length)return;
   let vTot=0,iTot=0;
   const wantCol=!!(mat&&mat.vertexColors);
   for(let i=0;i<parts.length;i++){
    const g=parts[i].geo;
    vTot+=g.attributes.position.count;
    iTot+=g.index?g.index.count:g.attributes.position.count;
   }
   const pos=new Float32Array(vTot*3),nrm=new Float32Array(vTot*3),uv=new Float32Array(vTot*2);
   const col=wantCol?new Float32Array(vTot*3):null;
   const idx=new Uint32Array(iTot);
   let vOff=0,iOff=0;
   for(let i=0;i<parts.length;i++){
    const g=parts[i].geo,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,C=g.attributes.color;
    const cnt=P.count;
    pos.set(P.array,vOff*3);
    if(N)nrm.set(N.array,vOff*3);
    if(U)uv.set(U.array,vOff*2);
    if(col){
     if(C)col.set(C.array,vOff*3);
     else col.fill(1.0,vOff*3,(vOff+cnt)*3);
    }
    if(g.index){
     const ia=g.index.array;
     for(let k=0;k<ia.length;k++)idx[iOff++]=ia[k]+vOff;
    }else{
     for(let k=0;k<cnt;k++)idx[iOff++]=vOff+k;
    }
    vOff+=cnt;
    g.dispose();
   }
   const mg=new THREE.BufferGeometry();
   mg.setAttribute('position',new THREE.BufferAttribute(pos,3));
   mg.setAttribute('normal',new THREE.BufferAttribute(nrm,3));
   mg.setAttribute('uv',new THREE.BufferAttribute(uv,2));
   if(col)mg.setAttribute('color',new THREE.BufferAttribute(col,3));
   mg.setIndex(new THREE.BufferAttribute(idx,1));
   mg.computeBoundingSphere();
   const m=new THREE.Mesh(mg,mat);
   m.castShadow=true;m.receiveShadow=true;
   m.userData.host=true;m.userData.inspectLabel=parts[0].label;
   group.add(m);
   items.push(m);
  });
 };

 // Build one removable cedar-and-porphyry Silk-Weir reeling frame (clear opening 3.20 x 2.22 m; silk inset 0.06 m on all 4 sides)
 function addWeirFrame(x,z,yaw,idx){
  const y0=DRAWN_H(x,z);
  const ca=Math.cos(yaw),sa=Math.sin(yaw);
  const postHalf=1.66;
  for(let s=-1;s<=1;s+=2){
   const px=x+ca*postHalf*s,pz=z+sa*postHalf*s,py=DRAWN_H(px,pz);
   addPart(new THREE.BoxGeometry(0.36,0.34,0.36),SPIDERLAKE.M.rockPorphyry,px,py+0.12,pz,0,yaw,0,'Porphyry Weir Socket Plinth');
   addPart(new THREE.CylinderGeometry(0.055,0.065,2.55,8),SPIDERLAKE.M.woodCedar,px,py+1.42,pz,0,yaw,0,'Removable Cedar Silk-Weir Upright');
   addPart(new THREE.CylinderGeometry(0.11,0.11,0.08,10),SPIDERLAKE.M.worksBronze,px,y0+2.58,pz,Math.PI*0.5,yaw,0,'Bronze Reeling Bobbin Sheave');
  }
  // Bottom crossbar center at y0 + 0.30 (top at y0 + 0.345); top crossbar center at y0 + 2.62 (bottom at y0 + 2.575)
  addPart(new THREE.CylinderGeometry(0.045,0.045,3.44,8),SPIDERLAKE.M.woodCedar,x,y0+0.30,z,0,yaw,Math.PI*0.5,'Cedar Weir Lower Crossbar');
  addPart(new THREE.CylinderGeometry(0.048,0.048,3.52,8),SPIDERLAKE.M.worksLacquer,x,y0+2.62,z,0,yaw,Math.PI*0.5,'Crimson-Lacquer Reeling Top Spindle');

  // Silk sheet spans [y0 + 0.41 .. y0 + 2.51] and width 3.08 m -> >= 0.06 m non-coplanar gap on all 4 edges!
  SPIDERLAKE.WEIR_SLOTS.push({x:x,y:y0+0.41,z:z,yaw:yaw,innerW:3.08,innerH:2.10,slotClearM:0.065});

  // Terracotta smudge-pot beside alternate frames for zero-kill 6-day calming
  if(idx%2===0){
   const sx=x+ca*2.25-sa*0.55,sz=z+sa*2.25+ca*0.55,sy=DRAWN_H(sx,sz);
   addPart(new THREE.CylinderGeometry(0.22,0.16,0.38,10),SPIDERLAKE.M.worksTerracotta,sx,sy+0.17,sz,0,yaw,0,'Terracotta Porphyry-Fern Smudge Pot');
   smudgePots.push([sx,sy+0.40,sz]);
  }
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:'spiderlake:weir-'+SKEY+'-'+idx,name:'Removable Cedar-and-Porphyry Silk-Weir Frame',
    class:'furniture',at:[x,y0,z],r:2.0,h:2.8,
    tags:{culture:'spider-lake',placement:'outdoor',type:'arachniculture-weir'}
   });
  }
 }

 function addCocoonLantern(x,z,idx){
  const y0=DRAWN_H(x,z);
  addPart(new THREE.CylinderGeometry(0.04,0.05,2.65,7),SPIDERLAKE.M.woodCedar,x,y0+1.25,z,0,idx*0.7,0,'Cedar Canal-Path Lantern Staff');
  addPart(new THREE.SphereGeometry(0.24,10,8),SPIDERLAKE.M.silkLantern,x,y0+2.48,z,0,0,0,'Oiled Gossamer-Cocoon Lantern');
  lanterns.push([x,y0+2.48,z,17.5,6.8]);
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:'spiderlake:lantern-'+SKEY+'-'+idx,name:'Oiled Gossamer-Cocoon Way Lantern',
    class:'furniture',at:[x,y0,z],r:0.6,h:2.7,
    tags:{culture:'spider-lake',placement:'outdoor',type:'lighting'}
   });
  }
 }

 if(on){
  if(SKEY==='spillway'){
   const frames=[[46,124,0.35],[56,128,0.35],[78,128,-0.25],[108,144,-0.40]];
   frames.forEach((f,i)=>addWeirFrame(f[0],f[1],f[2],i));
   [[52,135],[86,148],[-18,92]].forEach((p,i)=>addCocoonLantern(p[0],p[1],i));
  }else if(SKEY==='narrows'){
   // Placed outside the site:spider-lake-weirs core reserve along the skiff landing approach
   const frames=[[-98,118,0.52],[-86,124,0.52],[-74,130,0.52],[-112,110,0.48]];
   frames.forEach((f,i)=>addWeirFrame(f[0],f[1],f[2],i));
   [[-104,114],[-80,127],[-62,-22]].forEach((p,i)=>addCocoonLantern(p[0],p[1],i));
  }else if(SKEY==='pavilion'){
   // Structured arachniculture spindle-weir rows along the 3 cut dolomite/porphyry mulberry terraces
   const frames=[
    [-36,89,0.0],[-12,89,0.0],[12,89,0.0],[36,89,0.0],
    [-24,136,0.0],[0,136,0.0],[24,136,0.0],
    [-16,184,0.0],[16,184,0.0]
   ];
   frames.forEach((f,i)=>addWeirFrame(f[0],f[1],f[2],i));
   [[-24,86],[24,86],[0,133],[0,-14]].forEach((p,i)=>addCocoonLantern(p[0],p[1],i));
  }else if(SKEY==='fen'){
   const frames=[[12,16,0.35],[56,38,-0.30],[-4,66,0.15]];
   frames.forEach((f,i)=>addWeirFrame(f[0],f[1],f[2],i));
   [[18,22],[58,44],[-42,36]].forEach((p,i)=>addCocoonLantern(p[0],p[1],i));
  }else if(SKEY==='dolomite'){
   const frames=[[-12,-34,0.20],[38,-46,-0.35]];
   frames.forEach((f,i)=>addWeirFrame(f[0],f[1],f[2],i));
   [[8,-30],[26,-28]].forEach((p,i)=>addCocoonLantern(p[0],p[1],i));
  }else if(SKEY==='haugel'){
   const frames=[[-14,-82,0.12],[18,-82,-0.10],[-18,46,0.24]];
   frames.forEach((f,i)=>addWeirFrame(f[0],f[1],f[2],i));
   [[-4,-78],[28,42],[-38,-42]].forEach((p,i)=>addCocoonLantern(p[0],p[1],i));
  }else{
   // Station 6 (rampart): Ria hydrological divide cairns in secondary-ejecta & imperial porphyry (0 silk weirs above midge line!)
   [[-42,0],[0,4],[44,-2]].forEach((p,i)=>{
    const y0=DRAWN_H(p[0],p[1]);
    addPart(new THREE.CylinderGeometry(0.58,0.84,1.45,7),SPIDERLAKE.M.rockEjecta,p[0],y0+0.62,p[1],0,i*0.5,0,'Ria-Spider Watershed Divide Ejecta Cairn');
    addPart(new THREE.BoxGeometry(0.28,0.62,0.28),SPIDERLAKE.M.rockPorphyry,p[0],y0+1.55,p[1],0,i*0.5+0.3,0,'Carved Porphyry Treaty-Crest Capstone');
    if(typeof KTAGS!=='undefined'&&KTAGS.page){
     KTAGS.page.add({
      id:'spiderlake:divide-cairn-'+i,name:'Ria Watershed Divide Treaty Cairn',
      class:'furniture',at:[p[0],y0,p[1]],r:1.0,h:1.9,
      tags:{culture:'spider-lake',placement:'outdoor',type:'marker'}
     });
    }
   });
  }
  flushParts();
 }

 return{group:group,items:items,smudgePots:smudgePots,lanterns:lanterns};
})();
