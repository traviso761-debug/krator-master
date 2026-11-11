// ================================================================= HOST — the rock bodies of a later station (core/terrain KSTACKS)
// STAGE.rocks: KSTACKS records (the West Bench's basalt dike ribs, the Upper Gate Tarn's flood-carried erratics: the stage makes them on its
// ground), drawn one mesh a kind in vertex colour (the kind's palette by bed, darkened by the mesh's occlusion: the notches and undersides),
// each registered; an invisible anchor at each body's middle so the registry's occupancy finds it. The flora keeps off them: the stage's mask
// reads their feet (KSTACKS.foot).
const ROCK_COL={fin:[0x3e3a38,0x4a4542,0x34302e],balanced:[0x8a8478,0x968e80,0x7a746a],spire:[0x6e6a64,0x7a746c],butte:[0x6a625a,0x7a7068],mesa:[0x6a625a,0x7a7068]};
const ROCKS=(function(){const R=STAGE.rocks||[];if(!R.length)return R;
 const acc={},c=new THREE.Color();
 R.forEach(B=>{const m=KSTACKS.mesh(B,{step:B.kind==='balanced'?.8:2.5}),k=B.kind,A=acc[k]||(acc[k]={pos:[],col:[],idx:[]}),n0=A.pos.length/3,
   P=(STAGE.rockCol&&STAGE.rockCol[k])||ROCK_COL[k]||ROCK_COL.balanced;
  for(let v=0;v<m.part.length;v++){A.pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);c.setHex(P[KRAND.hash(B.seed>>>0,m.bed[v],77)%P.length]).multiplyScalar(.6+.4*m.occ[v]);A.col.push(c.r,c.g,c.b);}
  for(let i=0;i<m.idx.length;i++)A.idx.push(n0+m.idx[i]);
  REGISTER({name:B.name||('A '+k),key:'rock.'+k,kind:'rock',x:B.x,z:B.z,y:B.y0,r:B.R,h:B.top-B.y0});});
 for(const k in acc){const A=acc[k];if(!A.idx.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(A.col,3));g.setIndex(A.idx);g.computeVertexNormals();
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,color:0xd8d2cc});mat.customProgramCacheKey=()=>'ogate-rock';
  const me=new THREE.Mesh(g,mat);me.userData.host=true;me.userData.rock=true;me.userData.inspectLabel=(STAGE.rockName&&STAGE.rockName[k])||('Rock: '+k);scene.add(me);}
 {const A=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),R.length),M4=new THREE.Matrix4();
  R.forEach((B,i)=>{M4.makeTranslation(B.x,(B.y0+B.top)/2,B.z);A.setMatrixAt(i,M4);});A.userData.host=true;A.userData.inspectLabel='rock anchors';A.frustumCulled=false;scene.add(A);}
 return R;})();
