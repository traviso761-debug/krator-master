// ================================================================= HOST — station 4's structure: CUBE, the ruined Arcube (massing)
// The Ancients kit's Arcube (kits/ancients, target arcube) in its ruined state, baked to CUBE_MASS (44c-host-cube-data.js, by
// stations/bake_cube.py: the target's ruined site, vertices clustered on an 8 m grid) and stood on the plinth at the origin (45m).
// MASSING (the owner, 2026-10-27: "an existing arccube model but it will need some modifications eventually; but for now it's good
// for massing"): its shape and the colours of its surfaces, not its detail. Its own build (and the survivors who live in it, the
// Tungangs' Loj Nahn) is the settlement work's. The old plaza's flat paving is dropped (the plinth's paint takes its place, 45m
// MAP_PAINT); the upright pieces where they meet the ground (piers, walls, the fallen corner and tower, the rubble) are obstacles,
// so nothing roots in them, while the forest grows on under the keel, 86 m over the plinth. Its shell goes to RIFT.dress: moss,
// plants and hanging growth on its ledges, soffits and walls. Host-only: no plant is placed in this file.
// the concrete from the material library (materials.json towerConcrete), UVs in world metres / 6, as src/85's tower
function hostTowerLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('rift',n):null;if(!L)return fb;
 const t=KMAT.textures(L,{aniso:8}).map;t.repeat.set(6/L.scale[0],6/L.scale[1]);return t;}
function buildTestTower(){
 const M=CUBE_MASS,dec=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;};
 const q=new Uint16Array(dec(M.pos).buffer),c8=dec(M.col),ib=dec(M.idx),I=M.i16?new Uint16Array(ib.buffer):new Uint32Array(ib.buffer);
 const P=new Float32Array(M.n*3);for(let i=0;i<M.n;i++)for(let k=0;k<3;k++)P[i*3+k]=M.lo[k]+q[i*3+k]/65535*(M.hi[k]-M.lo[k])+(k===1?PLINTH.y:0);   /* on the plinth */
 REGISTER({name:'Cube (the ruined Arcube, massing)',x:0,z:0,y:PLINTH.y,r:1250,h:M.hi[1]});
 // the triangles kept (not the flat paving: all three under 4 m), as a soup with flat normals and world UVs (6 m a unit, as the tower's)
 const pos=[],col=[],uv=[],cells={};
 for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],d=I[t+2],ya=P[a*3+1],yb=P[b*3+1],yd=P[d*3+1],lo=Math.min(ya,yb,yd),hi=Math.max(ya,yb,yd);
  if(hi<PLINTH.y+4)continue;
  for(const v of [a,b,d]){pos.push(P[v*3],P[v*3+1],P[v*3+2]);col.push(c8[v*3]/255,c8[v*3+1]/255,c8[v*3+2]/255);uv.push((P[v*3]+P[v*3+2])/6,P[v*3+1]/6);}
  /* an upright piece at the ground: its 24 m cell an obstacle */
  if(lo<PLINTH.y+30&&hi-lo>6){const cx=Math.floor((P[a*3]+P[b*3]+P[d*3])/72),cz=Math.floor((P[a*3+2]+P[b*3+2]+P[d*3+2])/72),k=cx+','+cz;cells[k]=Math.max(cells[k]||0,hi);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
 const TEXC=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=200+(fbm(x/18,y/18,2.2,3)-.5)*60+(fbm(x/3,y/3,8,1)-.5)*24;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);});
 /* the baked colours average .41 (the target's materials times its decay darkening, lit there by a standard material and its own
    environment); under this page's Lambert they read near black, so the material lifts them 1.75 times (a pale weathered render) */
 const mat=new THREE.MeshLambertMaterial({map:hostTowerLib('towerConcrete',TEXC),vertexColors:true,color:new THREE.Color(1.75,1.72,1.64)});
 const m=new THREE.Mesh(geo,mat);m.userData.inspectLabel='Cube, the ruined Arcube (massing from kits/ancients)';m.userData.host=true;scene.add(m);
 for(const k in cells){const [cx,cz]=k.split(',').map(Number);OBSTACLES.push({x:(cx+.5)*24,z:(cz+.5)*24,r:18,y0:PLINTH.y-5,y1:cells[k]+10});}
 /* SHELLS (core/biome/40-core-place.js): the whole mass, one share */
 return [{geos:[geo],share:1}];}
