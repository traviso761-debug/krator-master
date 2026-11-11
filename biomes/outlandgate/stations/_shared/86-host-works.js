// ================================================================= HOST — the people's works of a later station: plain records and boxes
// STAGE.works(W) builds them through W, before the kit (the flora keeps out of them through the stage's own footprint test):
//   W.box(set, x, y0, z, w, h, d, yaw)    a box standing on y0 (set: stone, dark, wood, cloth, silk, sinter)
//   W.gmin(x, z, r)                       the lowest ground under a footprint (a wall's foot sits below it)
//   W.rec({name, kind, x, z, y, r, h})    a core/tags record (REGISTER)
// Each piece is a record before the boxes are drawn (one InstancedMesh a set). Plain until the culture kit (kits/coyote; the Spider Lake
// people's own kit when it comes).
const WORKS=(function(){const out={pieces:0,records:0},INST={stone:[],dark:[],wood:[],cloth:[],silk:[],sinter:[]};
 if(!STAGE.works)return out;
 const Q=new THREE.Quaternion(),E=new THREE.Euler(),M4=new THREE.Matrix4(),P=new THREE.Vector3(),S=new THREE.Vector3();
 const W={box:(set,x,y0,z,w,h,d,yaw)=>{INST[set].push([x,y0+h/2,z,w,h,d,yaw==null?0:yaw]);out.pieces++;},
  gmin:(x,z,r)=>Math.min(terrainH(x-r,z),terrainH(x+r,z),terrainH(x,z-r),terrainH(x,z+r),terrainH(x,z)),
  rec:o=>{REGISTER(o);out.records++;}};
 try{Object.assign(out,STAGE.works(W)||{});}catch(e){reportErr('works: '+e.stack);}
 const MAT={stone:new THREE.MeshLambertMaterial({color:0xa8a090}),dark:new THREE.MeshLambertMaterial({color:0x4a4038}),wood:new THREE.MeshLambertMaterial({color:0x7a5a3e}),
  cloth:new THREE.MeshLambertMaterial({color:0xc8b48e}),silk:new THREE.MeshLambertMaterial({color:0xece6d8,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}),
  sinter:new THREE.MeshLambertMaterial({color:0xd8ccb0})};
 const geo=new THREE.BoxGeometry(1,1,1);out.meshes=[];
 for(const k in INST){const L=INST[k];if(!L.length)continue;const m=new THREE.InstancedMesh(geo,MAT[k],L.length);
  L.forEach((b,i)=>{P.set(b[0],b[1],b[2]);S.set(b[3],b[4],b[5]);Q.setFromEuler(E.set(0,b[6],0));M4.compose(P,Q,S);m.setMatrixAt(i,M4);});
  m.userData.host=true;m.userData.inspectLabel=STAGE.worksLabel||'The people\'s works (plain records until the culture kit)';m.frustumCulled=false;scene.add(m);out.meshes.push(m);}
 return out;})();
