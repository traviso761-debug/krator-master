// ================================================================= HOST — the breach's fine ground (2026-11-23; with 44r)
// The breach (44r) is ~50 m across and its shaft 20 m deep, finer than a station's 6.5 m ground mesh: the coarse cells under it are left out of
// the ground (THRONE_BREACH_CELLS, then breachSkip in the station's index loop) and drawn here eight times finer, the patch's border vertices on the
// coarse mesh's own edges (no crack). attr(x, z, k, L0, L1, L2): the station's own layer weights per vertex. null P: nothing.
function THRONE_BREACH_CELLS(P,N,S,sub){if(!P)return null;const cs=S/N,X0=-S/2,R=P.r*1.8;
 const i0=Math.floor((P.x-R-X0)/cs),i1=Math.ceil((P.x+R-X0)/cs),j0=Math.floor((P.z-R-X0)/cs),j1=Math.ceil((P.z+R-X0)/cs);
 return{i0,i1,j0,j1,sub:sub||8,cs,X0,S,x0:X0+i0*cs,z0:X0+j0*cs};}
function breachSkip(C,i,j){return !!C&&i>=C.i0&&i<C.i1&&j>=C.j0&&j<C.j1;}
function THRONE_BREACH_MESH(C,o){if(!C)return null;const nx=(C.i1-C.i0)*C.sub+1,nz=(C.j1-C.j0)*C.sub+1,cs=C.cs/C.sub,S=C.S,H=o.terrainH;
 const pos=new Float32Array(nx*nz*3),uv=new Float32Array(nx*nz*2),L0=new Float32Array(nx*nz*4),L1=new Float32Array(nx*nz*4),L2=new Float32Array(nx*nz*4);
 const gH=(i,j)=>H(C.X0+i*C.cs,C.X0+j*C.cs);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=C.x0+i*cs,z=C.z0+j*cs,bi=i===0||i===nx-1,bj=j===0||j===nz-1;let y;
  if(bi||bj){const gi=C.i0+i/C.sub,gj=C.j0+j/C.sub,i0=Math.floor(gi),j0=Math.floor(gj),fi=gi-i0,fj=gj-j0;
   y=bi&&bj?gH(i0,j0):bi?mix(gH(i0,j0),gH(i0,j0+1),fj):mix(gH(i0,j0),gH(i0+1,j0),fi);}else y=H(x,z);
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;o.attr(x,z,k,L0,L1,L2);}
 const idx=new Uint32Array((nx-1)*(nz-1)*6);let t=0;
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));g.setAttribute('aL2',new THREE.BufferAttribute(L2,4));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,o.mat);m.userData.probeSkip=true;m.userData.inspectLabel=o.label;scene.add(m);return m;}
