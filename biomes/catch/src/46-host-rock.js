// ================================================================= HOST — the stage's rock (KSTACKS bodies): the castellated lake-bed mesas
// A stage's ROCK is a list of core/terrain KSTACKS records (37-core-stacks.js): the old lake's sediment left standing as
// mesas and buttes when the wind took the rest (the White Dragon Mounds). Two meshes: the walls (pale bedded mudstone,
// rock.badland.bedded, each bed's band tinted by its hash) and the tops (wind-fluted silt, rock.yardang.silt). One
// registered volume per body, and an invisible anchor at each body's middle for the probe.
const ROCK_GEOS=[];
(function(){if(!ROCK.length)return;
 const lib=n=>{if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const e=KMAT.packed('catch',n);return e?{e,t:KMAT.textures(e,{aniso:8})}:null;};
 const RS=STAGE.rockSets||{},Lw=lib(RS.wall||'rock.wall'),Lt=lib(RS.top||'rock.top');   /* a stage may name its own sets and colours (the oasis's varnished crags) */
 const BAND=(RS.band||[0xd8cbb0,0xcab89a,0xe0d4bc,0xbfa888,0xd2c0a0]).map(h=>new THREE.Color(h)),TOPC=new THREE.Color(RS.topCol==null?0xd6c8aa:RS.topCol),c=new THREE.Color();
 const acc={wall:{pos:[],uv:[],col:[],idx:[]},top:{pos:[],uv:[],col:[],idx:[]}};
 const sW=Lw?Lw.e.scale[0]:8,sT=Lt?Lt.e.scale[0]:6;
 ROCK.forEach(B=>{const small=B.kind!=='mesa'&&B.kind!=='butte',m=KSTACKS.mesh(B,{step:small?2.5:5}),nv=m.part.length;
  const remap={wall:new Int32Array(nv).fill(-1),top:new Int32Array(nv).fill(-1)};
  for(let i=0;i<m.idx.length;i+=3){const isTop=m.part[m.idx[i]]===1,key=isTop?'top':'wall',A=acc[key],R=remap[key];
   for(let k=0;k<3;k++){const v=m.idx[i+k];if(R[v]<0){R[v]=A.pos.length/3;const x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2],b=B.beds[m.bed[v]];
     A.pos.push(x,y,z);
     if(isTop){A.uv.push(m.uv[2*v]/sT,m.uv[2*v+1]/sT);c.copy(TOPC);}
     else{A.uv.push(m.uv[2*v]/sW,m.uv[2*v+1]/sW);c.copy(BAND[KRAND.hash(B.seed,b.k,77)%BAND.length]).multiplyScalar(.7+.3*m.occ[v]);}
     A.col.push(c.r,c.g,c.b);}
    A.idx.push(R[v]);}}
  REGISTER({name:B.name||B.id,key:'rock.'+B.kind,x:B.x,z:B.z,y:B.y0,r:Math.min(B.R,small?B.R:B.R*.8),h:B.top-B.y0});});
 const mk=(A,L,label)=>{if(!A.idx.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(A.uv,2));
  const cl=new THREE.Float32BufferAttribute(A.col,3);for(let i=0;i<cl.count;i++){c.setRGB(cl.getX(i),cl.getY(i),cl.getZ(i)).convertSRGBToLinear();cl.setXYZ(i,c.r,c.g,c.b);}
  g.setAttribute('color',cl);g.setIndex(A.idx);g.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({map:L?L.t.map:null,normalMap:L?L.t.normalMap:null,roughnessMap:L?L.t.roughnessMap:null,roughness:1,metalness:0,vertexColors:true});
  const me=new THREE.Mesh(g,mat);me.userData.inspectLabel=label;me.userData.host=true;me.userData.rock=true;scene.add(me);ROCK_GEOS.push(g);return me;};
 {const A=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),ROCK.length),M4=new THREE.Matrix4();
  ROCK.forEach((B,i)=>{M4.makeTranslation(B.x,(B.y0+B.top)/2,B.z);A.setMatrixAt(i,M4);});A.userData.host=true;A.userData.inspectLabel='rock anchors';A.frustumCulled=false;scene.add(A);}
 mk(acc.wall,Lw,RS.wallLabel||'Lake-bed mudstone (an old lake\'s sediment, bedded, wind-cut into a castellated mesa)');
 mk(acc.top,Lt,RS.topLabel||'Wind-fluted silt (a mesa\'s top)');})();
drawCamps();   /* the stage's fire rings (45-host-scene.js fireRing) */
