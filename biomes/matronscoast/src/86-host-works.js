// ================================================================= HOST — site:yonni-* reserves & optional ?works=0 sealime heaps ([draw])
// Publishes clean site:yonni-* Spear-Queen plinth reserves into KTAGS.page (class: 'reserve', zero permanent buildings!)
// and optional ?works=0-toggleable shell-lime burning heaps, reed snail-creels & sinistral Queen-Shell marker cairns (class: 'furniture').
const WORKS=(function(){
 const res=SITE.reserves||[];
 const showWorks=new URLSearchParams(location.search).get('works')!=='0';
 const out={reserves:0,props:0};

 for(let i=0;i<res.length;i++){
  const R=res[i];
  const ry=DRAWN_H(R.x,R.z);
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:R.id,
    name:R.name,
    class:'landmark',
    at:[R.x,ry,R.z],
    r:R.r,
    h:R.h,
    tags:{biome:'matronscoast',culture:'yonni',role:'reserve'}
   });
   out.reserves++;
  }

  if(!showWorks)continue;

  /* Place ?works=0 non-building coastal shell-burner furniture right on the outer collar of the reserve */
  const wx=R.x+R.r*0.58,wz=R.z+R.r*0.32;
  const wy=DRAWN_H(wx,wz);
  const grp=new THREE.Group();
  grp.name='yonni-sealime-works-'+i;
  grp.userData.host=true;

  /* 1. Calcining Coquina Sealime Heap (conical mound of white-buff crushed snail shells) */
  const heapGeo=MATRON.G.makeSpheroidalRockGeo(9310+i,0.52,5);
  const heapMesh=new THREE.Mesh(heapGeo,MATRON.M.worksLime);
  heapMesh.position.set(wx,wy+0.36,wz);
  heapMesh.scale.set(2.2,1.15,2.0);
  heapMesh.castShadow=true;heapMesh.receiveShadow=true;
  heapMesh.userData.host=true;
  heapMesh.userData.inspectLabel='Yonni Calcined Conch-Shell Hydraulic Sealime Heap';
  grp.add(heapMesh);

  /* 2. Woven Coquina-Sedge Snail-Gathering Creels */
  const creelGeo=new THREE.CylinderGeometry(0.42,0.34,0.68,10,1);
  for(let k=0;k<2;k++){
   const cx=wx-2.1+k*1.05,cz=wz+1.4;
   const cy=DRAWN_H(cx,cz);
   const cm=new THREE.Mesh(creelGeo,MATRON.M.worksWicker);
   cm.position.set(cx,cy+0.30,cz);
   cm.rotation.z=k*0.08;
   cm.userData.host=true;
   cm.userData.inspectLabel='Plaited Coquina-Sedge Giant-Snail Creel';
   grp.add(cm);
  }

  /* 3. Sacred Lone-Born Sinistral Queen-Shell Way-Marker Cairn */
  const mx=wx+2.4,mz=wz-1.5,my=DRAWN_H(mx,mz);
  const cairnBase=new THREE.Mesh(MATRON.G.makeSpheroidalRockGeo(9320+i,0.72,4),MATRON.M.stoneCoquina);
  cairnBase.position.set(mx,my+0.42,mz);
  cairnBase.scale.set(0.95,0.85,0.95);
  cairnBase.userData.host=true;
  cairnBase.userData.inspectLabel='Yonni Spear-Queen Coquina Boundary Cairn';
  grp.add(cairnBase);

  const queenCrown=new THREE.Mesh(MATRON.G.shellSin,MATRON.M.shellNacre);
  queenCrown.position.set(mx,my+0.96,mz);
  queenCrown.scale.set(0.88,0.88,0.88);
  queenCrown.rotation.y=0.8;
  queenCrown.userData.host=true;
  queenCrown.userData.inspectLabel='Sacred 2% Sinistral Lone-Born Queen-Shell Regalia';
  grp.add(queenCrown);

  scene.add(grp);
  out.props+=4;

  REGISTER({
   tagId:'matronscoast:sealime-heap-'+SKEY,
   tagClass:'furniture',
   name:'Yonni Conch-Lime Burning Heap & Queen-Shell Cairn',
   x:wx,y:wy-1,z:wz,r:6.5,h:4.5,
   tags:{works:'sealime-burning',removable:true}
  });
 }
 return out;
})();
