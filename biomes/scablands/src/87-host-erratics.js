// ================================================================= HOST — the erratics drawn (records: 45b-host-stage.js ERRATICS)
// The dam's broken concrete and the flood's basalt boulders, each kind merged into one mesh in world space: a block or a
// slab is a box broken irregular (its corners and edges knocked off by a hash of its place: no two alike), its rebar rods
// bent out of its broken sides; a boulder a knocked-about icosahedron. Textured from this overlay's own library pack
// (materials.json: concrete.rust.streaked, rock.basalt.vesicular), plain colours without it. Drawn after the stage's
// records were registered and made obstacles (the kit plants round them).
const ERRATIC_MESH=(function(){const T=THREE,u=(h,k)=>KRAND.unit(KRAND.hash(h,k));
 const lib=n=>{const L=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('scablands',n):null;return L?Object.assign({scale:L.scale[0]},KMAT.textures(L,{aniso:4})):null;};
 const CON=lib('concrete'),BAS=lib('basalt');
 const mat={concrete:new T.MeshStandardMaterial(Object.assign({color:0xffffff,roughness:1,metalness:0},CON?{map:CON.map,normalMap:CON.normalMap||null,roughnessMap:CON.roughnessMap||null}:{color:0x9a958c})),
  basalt:new T.MeshStandardMaterial(Object.assign({color:0xffffff,roughness:1,metalness:0},BAS?{map:BAS.map,normalMap:BAS.normalMap||null,roughnessMap:BAS.roughnessMap||null}:{color:0x4a4440})),
  rebar:new T.MeshStandardMaterial({color:0x6a3e26,roughness:.75,metalness:.45})};
 const buf={concrete:{P:[],N:[],U:[]},basalt:{P:[],N:[],U:[]},rebar:{P:[],N:[],U:[]}},M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),NM=new T.Matrix3();
 // add a geometry, posed by matrix m, to a buffer (uvs in metres over the set's scale: world x and z, or y on a steep face)
 function add(B,g,m,sc){g=g.index?g.toNonIndexed():g;g.applyMatrix4(m);g.computeVertexNormals();const p=g.attributes.position.array,nn=g.attributes.normal.array;
  for(let i=0;i<p.length;i+=3){B.P.push(p[i],p[i+1],p[i+2]);B.N.push(nn[i],nn[i+1],nn[i+2]);const ax=Math.abs(nn[i]),az=Math.abs(nn[i+2]);
   B.U.push((ax>az?p[i+2]:p[i])/sc,(Math.abs(nn[i+1])>.7?p[i+2]:p[i+1])/sc);}}
 for(const e of ERRATICS){E.set(e.pitch,e.yaw,e.roll,'YXZ');Q.setFromEuler(E);
  if(e.kind==='boulder'){const g=new T.IcosahedronGeometry(1,1),p=g.attributes.position;
   for(let i=0;i<p.count;i++){V.fromBufferAttribute(p,i);const k=.78+.4*u(e.seed,40+Math.round((V.x*3+V.y*7+V.z*11)*10)%97);p.setXYZ(i,V.x*k,V.y*k,V.z*k);}
   M.compose(V.set(e.x,e.y+e.sy*.5,e.z),Q,new T.Vector3(e.sx/2,e.sy/2,e.sz/2));add(buf.basalt,g,M,BAS?BAS.scale:3);continue;}
  // a block: a box of 3 x 2 x 3 cells, every vertex but the faces' middles pushed in by up to a quarter (the breaks)
  const g=new T.BoxGeometry(1,1,1,3,2,3),p=g.attributes.position;
  for(let i=0;i<p.count;i++){V.fromBufferAttribute(p,i);const edge=(Math.abs(V.x)>.49?1:0)+(Math.abs(V.y)>.49?1:0)+(Math.abs(V.z)>.49?1:0);
   if(edge>=2){const k=KRAND.hash(e.seed,Math.round(V.x*6+3),Math.round(V.y*6+3),Math.round(V.z*6+3)),d=.06+.22*KRAND.unit(k);p.setXYZ(i,V.x*(1-d),V.y*(1-d*(e.kind==='slab'?.3:1)),V.z*(1-d));}}
  // a slab is a piece of the dam's face: its top bowed (the face's curve)
  if(e.kind==='slab')for(let i=0;i<p.count;i++){V.fromBufferAttribute(p,i);if(V.y>0)p.setY(i,V.y+.18*(1-4*V.x*V.x));}
  M.compose(V.set(e.x,e.y+e.sy*.5,e.z),Q,new T.Vector3(e.sx,e.sy,e.sz));add(buf.concrete,g,M,CON?CON.scale:3);
  // the rebar: rods out of the broken sides, bent once (where they came out of the concrete, then drooping)
  for(let b=0;b<e.bars;b++){const h=KRAND.hash(e.seed,90+b),side=Math.floor(u(h,1)*4),a=u(h,2)-.5,yb=u(h,3)-.5,len=.8+1.8*u(h,4),bend=.3+.9*u(h,5);
   const base=new T.Vector3(side<2?(side?.5:-.5):a*.8,yb*.7,side<2?a*.8:(side===2?.5:-.5)).multiply(new T.Vector3(e.sx,e.sy,e.sz)).multiplyScalar(.92);
   const out=new T.Vector3(side<2?(side?1:-1):0,0,side<2?0:(side===2?1:-1));
   const seg=(p0,dir,L)=>{const g2=new T.CylinderGeometry(.025,.025,L,5,1,true);g2.translate(0,L/2,0);const m2=new T.Matrix4().compose(p0,new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dir.clone().normalize()),new T.Vector3(1,1,1));
    m2.premultiply(new T.Matrix4().compose(new T.Vector3(e.x,e.y+e.sy*.5,e.z),Q,new T.Vector3(1,1,1)));add(buf.rebar,g2,m2,1);};
   const L1=len*.45,p1=base.clone().addScaledVector(out,L1),d2=out.clone().add(new T.Vector3(0,-bend,0)).add(new T.Vector3(u(h,6)-.5,0,u(h,7)-.5).multiplyScalar(.6));
   seg(base,out,L1);seg(p1,d2,len-L1);}}
 const G=new T.Group();G.name='erratics';
 for(const k in buf){const B=buf[k];if(!B.P.length)continue;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(B.P,3));
  g.setAttribute('normal',new T.Float32BufferAttribute(B.N,3));g.setAttribute('uv',new T.Float32BufferAttribute(B.U,2));
  const m=new T.Mesh(g,mat[k]);m.userData.inspectLabel=k==='basalt'?'Erratics: basalt boulders':k==='rebar'?'Erratics: the rebar':'Erratics: the dam\'s broken concrete';G.add(m);}
 // a marker an erratic for the probe (core/host samples a merged mesh by its box, an instanced one by every instance):
 // no triangles, never drawn (KNOWN_ISSUES.md; the dam bed's debris does the same)
 const mk=new T.InstancedMesh(new T.BufferGeometry(),mat.concrete,ERRATICS.length),MM=new T.Matrix4();
 ERRATICS.forEach((e,i)=>mk.setMatrixAt(i,MM.makeTranslation(e.x,e.y+e.sy*.4,e.z)));mk.visible=false;mk.userData.probeMarker=true;G.add(mk);
 scene.add(G);window._erratics=ERRATICS.length;return G;})();
