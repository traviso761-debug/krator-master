// ================================================================= HOST — the chaos's wild knobs (KSTACKS, drawn on the ground)
// The region's "isolated flat-topped mesas and knobby pyramids" (its note) at the scale a page can show: SITE.knobs as KSTACKS bodies (45), meshed
// here with the library's banded gneiss (rock.dome) and KSTACKS' occlusion in the vertex colours. Seated 4 m into the ground (45: y0). Each is
// registered before it is drawn. The Hall's five carved stacks are not here: the Hall's own builder draws them (89g).
const KNOB_MAT=(function(){const P=KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('labyrinth','rock.dome'):null,T=P?KMAT.textures(P,{aniso:8}):{};
 return new THREE.MeshStandardMaterial({map:T.map||null,normalMap:T.normalMap||null,color:0xb4ab9c,roughness:.95,metalness:0,vertexColors:true});})();
const KNOB_DRAW=(function(){let tris=0;
 KNOBS.forEach((S,i)=>{REGISTER({name:'A knob of the chaos ('+S.kind+', '+Math.round(S.top-S.y0)+' m)',kind:'landform',x:S.x,z:S.z,y:S.y0,r:S.R,h:S.top-S.y0,tags:{kind:'knob',variant:S.kind}});
  const m=KSTACKS.mesh(S,{step:S.kind==='spire'?4:6}),n=m.pos.length/3,g=new THREE.BufferGeometry(),col=new Float32Array(n*3),uv=new Float32Array(n*2);
  for(let k=0;k<n;k++){const o=1-.32*(m.occ?m.occ[k]:0);col[3*k]=col[3*k+1]=col[3*k+2]=o;uv[2*k]=m.uv[2*k]/8;uv[2*k+1]=m.uv[2*k+1]/8;}
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(m.pos),3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setIndex(n>65535?new THREE.BufferAttribute(new Uint32Array(m.idx),1):new THREE.BufferAttribute(new Uint16Array(m.idx),1));g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,KNOB_MAT);mesh.userData.host=true;mesh.userData.inspectLabel='A knob of the chaos';mesh.name='host:knob.'+i;scene.add(mesh);tris+=m.idx.length/3;});
 return{n:KNOBS.length,tris};})();
