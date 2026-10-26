// ================================================================= HOST — the cut face's own surface (station 3)
// [draw] The face is not ground like the rest: it is the sphere's clean section through the Wall's beds, never weathered, so it
// takes a polished standard material (a satin roughness: the sun's glint spreads, as off sawn stone, without blowing out) over the ground mesh's cells where STAGE.faceK is
// strong, mapped so the beds run LEVEL across it (u along the lip, v by height: rock.cut.polished, 7 m a tile, from the library),
// tinted a little by height. Without the pack it is the ground's own colour, polished. The lichen discs lie on it (57).
const FACE_MESH=(function(){const g=GROUND.mesh.geometry,p=g.attributes.position,ix=g.index.array,pos=[],uv=[],col=[];
 const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('cut','ground.face'):null,T=1/12;   /* 12 m a tile: the beds read as bands metres thick */
 for(let t=0;t<ix.length;t+=3){const a=ix[t],b=ix[t+1],c=ix[t+2],cx=(p.getX(a)+p.getX(b)+p.getX(c))/3,cz=(p.getZ(a)+p.getZ(b)+p.getZ(c))/3;
  if(STAGE.faceK(cx,cz)<.45)continue;
  for(const v of [a,b,c]){const x=p.getX(v),y=p.getY(v)+.06,z=p.getZ(v);pos.push(x,y,z);uv.push(z*T,y*T);const k=.92+.08*Math.sin(y*.013);col.push(k,k*.985,k*.97);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
 const map=L?KMAT.textures(L,{aniso:8}).map:null;if(map){map.wrapS=map.wrapT=THREE.RepeatWrapping;}
 const mat=new THREE.MeshStandardMaterial({color:0xb4aca2,map,vertexColors:true,roughness:.52,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const m=new THREE.Mesh(geo,mat);m.userData.host=true;m.userData.inspectLabel='The cut face (the sphere\'s section through the Wall\'s beds, polished)';scene.add(m);
 return{mesh:m,mat,tris:pos.length/9};})();
