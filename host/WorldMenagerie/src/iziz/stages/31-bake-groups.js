// ---------- merge the plain parts of a moving group into one mesh with vertex colours (fewer draw calls) ----------
const VCM=setEnv(new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true}),{id:'vc'});VCM.userData.env=true;
function bakeGroup(g,keep){g.updateMatrix();const parts=g.children.filter(c=>c.isMesh&&!c.isInstancedMesh&&c.material&&c.material.isMeshLambertMaterial&&c.material.side!==THREE.DoubleSide&&!c.material.transparent&&!(keep&&keep(c)));
  if(parts.length<2)return 0;const pos=[],nor=[],colA=[],idx=[];let base=0;
  for(const m of parts){m.updateMatrix();const e=m.matrix.elements,G=m.geometry,P=G.attributes.position,Nn=G.attributes.normal;if(!P)continue;
    // normal matrix: inverse transpose of the upper 3x3
    const a=e[0],b=e[4],c2=e[8],d=e[1],f=e[5],h=e[9],k=e[2],l=e[6],n=e[10],det=a*(f*n-h*l)-b*(d*n-h*k)+c2*(d*l-f*k)||1;
    const N=[(f*n-h*l)/det,-(d*n-h*k)/det,(d*l-f*k)/det,-(b*n-c2*l)/det,(a*n-c2*k)/det,-(a*l-b*k)/det,(b*h-c2*f)/det,-(a*h-c2*d)/det,(a*f-b*d)/det];
    const cc=m.material.color;
    for(let i=0;i<P.count;i++){const x=P.array[i*3],y=P.array[i*3+1],z=P.array[i*3+2];pos.push(e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14]);
      const nx=Nn?Nn.array[i*3]:0,ny=Nn?Nn.array[i*3+1]:1,nz=Nn?Nn.array[i*3+2]:0;let ox=N[0]*nx+N[1]*ny+N[2]*nz,oy=N[3]*nx+N[4]*ny+N[5]*nz,oz=N[6]*nx+N[7]*ny+N[8]*nz;const ol=Math.hypot(ox,oy,oz)||1;nor.push(ox/ol,oy/ol,oz/ol);colA.push(cc.r,cc.g,cc.b);}
    const I=G.index?(G.index.array||G.index):null;if(I)for(let i=0;i<I.length;i++)idx.push(base+I[i]);else for(let i=0;i<P.count;i++)idx.push(base+i);
    base+=P.count;g.remove(m);}
  const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));mg.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));mg.setAttribute('color',new THREE.Float32BufferAttribute(colA,3));mg.setIndex(idx);
  const mm=new THREE.Mesh(mg,VCM);mm.userData.baked=true;g.add(mm);return parts.length-1;}
ctx.bakeGroup=bakeGroup;
await stage('boats');
section('boats',()=>{
