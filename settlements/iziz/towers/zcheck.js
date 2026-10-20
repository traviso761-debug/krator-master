// The z-fighting check (the owner, 2026-10-19: "do z-fighting pass"). Run in a built Iziz page (towers/runcheck.py, or the
// console). Two surfaces fight when they lie in one plane, face the same way and overlap, and are drawn in different colours or
// materials. Two sources are searched:
//   boxes    every instance of a kit item whose geometry is the unit box (vB, vBq, kput of a box): its six faces, world-space,
//            binned by direction and plane offset (2 mm); in a bin, overlapping faces of different instances, item or colour
//   floors   every mesh's upward horizontal triangles (slabs, floors, rings, decks), binned by height (2 mm) and a 4 m cell, against
//            each other (different meshes) and against the boxes' tops
// IZZCHECK({list}) -> {pairs, byKey: {'itemA|itemB': n}, first: [{a, b, at, area}]}; a pair's key is its items or meshes' names
window.IZZCHECK=function(o){o=o||{};const EPS=.002,out=[],seen=new Set();
 const R=[];   // faces: {k: key, n: [nx,ny,nz], d, c: [cx,cy,cz], u: [ux,uy,uz], v: [vx,vy,vz], hu, hv, col, id}
 const v3=(x,y,z)=>new THREE.Vector3(x,y,z),q=new THREE.Quaternion();
 for(const n in KIT.items){const D=KIT.defs[n];if(!D||!D.geo||D.geo.type!=='BoxGeometry')continue;const P=D.geo.parameters||{};if(Math.abs((P.width||1)-1)>1e-6||Math.abs((P.height||1)-1)>1e-6)continue;
  const it=KIT.items[n];
  for(let i=0;i<it.length;i++){const e=it[i],s=typeof e.s==='number'?[e.s,e.s,e.s]:e.s||[1,1,1];if(e.q)q.copy(e.q);else q.identity();
   const ax=[v3(1,0,0).applyQuaternion(q),v3(0,1,0).applyQuaternion(q),v3(0,0,1).applyQuaternion(q)],h=[s[0]/2,s[1]/2,s[2]/2];
   const col=e.c?e.c.getHex():-1;
   for(let a=0;a<3;a++)for(const sg of[-1,1]){const nrm=ax[a].clone().multiplyScalar(sg);if(nrm.y<-.9)continue;   /* a box's underside lies on what carries it: never seen */
    const c=v3(e.p[0],e.p[1],e.p[2]).addScaledVector(ax[a],sg*h[a]);
    const b=(a+1)%3,cc=(a+2)%3;R.push({k:n,id:n+'#'+i,n:nrm,d:nrm.dot(c),c,u:ax[b],v:ax[cc],hu:h[b],hv:h[cc],col});}}}
 // the floors: upward horizontal triangles of plain meshes, merged per mesh into the boxes' list as small faces
 const T=[];scene.traverse(m=>{if(!m.isMesh||m.isInstancedMesh||!m.visible||!m.geometry||!m.geometry.attributes.position)return;if(m.userData&&m.userData.khost)return;
  const g=m.geometry,pa=g.attributes.position,ix=g.index,n=ix?ix.count:pa.count;if(n>600000)return;m.updateMatrixWorld();const M=m.matrixWorld;
  const A=v3(),B=v3(),C=v3();for(let t=0;t<n;t+=3){const i0=ix?ix.getX(t):t,i1=ix?ix.getX(t+1):t+1,i2=ix?ix.getX(t+2):t+2;
   A.fromBufferAttribute(pa,i0).applyMatrix4(M);B.fromBufferAttribute(pa,i1).applyMatrix4(M);C.fromBufferAttribute(pa,i2).applyMatrix4(M);
   if(Math.abs(A.y-B.y)>EPS||Math.abs(A.y-C.y)>EPS)continue;const ar=((B.x-A.x)*(C.z-A.z)-(C.x-A.x)*(B.z-A.z))/2;if(Math.abs(ar)<.01)continue;
   if(ar>0&&m.material.side!==THREE.DoubleSide)continue;   /* facing down (a ceiling, a slab's soffit): seen from below only */
   T.push({k:(m.name||(m.userData&&m.userData.inspectLabel)||m.material&&m.material.name||'mesh').slice(0,40),id:m.uuid,y:(A.y+B.y+C.y)/3,cx:(A.x+B.x+C.x)/3,cz:(A.z+B.z+C.z)/3,
    x0:Math.min(A.x,B.x,C.x),x1:Math.max(A.x,B.x,C.x),z0:Math.min(A.z,B.z,C.z),z1:Math.max(A.z,B.z,C.z),ar:Math.abs(ar),mat:m.material&&m.material.uuid});}});
 const ex={};const push=(a,b,at,area,nrm)=>{const key=[a,b].sort().join('|');if(!ex[key])ex[key]={at:at.map(v=>+v.toFixed(2)),n:nrm||'up',area:+area.toFixed(2)};const sk=key+'@'+at.map(v=>Math.round(v)).join(',');if(seen.has(sk))return;seen.add(sk);out.push({key,at:at.map(v=>+v.toFixed(2)),area:+area.toFixed(2)});};
 // boxes against boxes: bin by (direction, offset)
 const bins=new Map(),dk=f=>{const n=f.n;return[Math.round(n.x*50),Math.round(n.y*50),Math.round(n.z*50),Math.round(f.d/EPS),Math.floor(f.c.x/8),Math.floor(f.c.z/8)].join(',');};
 for(const f of R){const k=dk(f);let L=bins.get(k);if(!L)bins.set(k,L=[]);L.push(f);}
 const corners=f=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>f.c.clone().addScaledVector(f.u,a*f.hu).addScaledVector(f.v,b*f.hv));
 const overlap=(f,g)=>{// g's corners in f's frame: the overlap of two rectangles approximated by their bounds in f's (u, v)
  const P=corners(g).map(p=>{const d=p.clone().sub(f.c);return[d.dot(f.u),d.dot(f.v)];});
  const u0=Math.max(-f.hu,Math.min(...P.map(p=>p[0]))),u1=Math.min(f.hu,Math.max(...P.map(p=>p[0]))),v0=Math.max(-f.hv,Math.min(...P.map(p=>p[1]))),v1=Math.min(f.hv,Math.max(...P.map(p=>p[1])));
  return u1>u0&&v1>v0?(u1-u0)*(v1-v0):0;};
 for(const L of bins.values()){if(L.length<2||L.length>4000)continue;
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const f=L[i],g=L[j];if(f.id===g.id||f.k===g.k&&f.col===g.col)continue;
   if(f.c.distanceTo(g.c)>f.hu+f.hv+g.hu+g.hv)continue;const a=overlap(f,g);if(a>.02)push(f.k,g.k,[(f.c.x+g.c.x)/2,(f.c.y+g.c.y)/2,(f.c.z+g.c.z)/2],a,[f.n.x,f.n.y,f.n.z].map(v=>+v.toFixed(2)).join(',')+' '+f.id+'/'+g.id+' s'+[f.hu*2,f.hv*2].map(v=>v.toFixed(2))+'/'+[g.hu*2,g.hv*2].map(v=>v.toFixed(2)));}}
 // floors against floors (different meshes) and against box tops
 const fb=new Map(),cell=(x,z,y)=>Math.floor(x/4)+','+Math.floor(z/4)+','+Math.round(y/EPS);
 for(const t of T){for(let x=Math.floor(t.x0/4);x<=Math.floor(t.x1/4);x++)for(let z=Math.floor(t.z0/4);z<=Math.floor(t.z1/4);z++){const k=x+','+z+','+Math.round(t.y/EPS);let L=fb.get(k);if(!L)fb.set(k,L=[]);L.push(t);}}
 const ov=(a,b)=>{const w=Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0),d=Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0);return w>0&&d>0?w*d:0;};
 for(const L of fb.values()){if(L.length<2||L.length>3000)continue;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(a.id===b.id||a.mat===b.mat)continue;const s=ov(a,b);if(s>.05)push(a.k,b.k,[a.cx,a.y,a.cz],s);}}
 for(const f of R){if(f.n.y<.99)continue;const k0=Math.round(f.d/EPS);for(const dy of[-1,0,1]){const L=fb.get(Math.floor(f.c.x/4)+','+Math.floor(f.c.z/4)+','+(k0+dy));if(!L)continue;
   for(const t of L){const w=Math.min(t.x1,f.c.x+f.hu)-Math.max(t.x0,f.c.x-f.hu),d=Math.min(t.z1,f.c.z+f.hv)-Math.max(t.z0,f.c.z-f.hv);if(w>.1&&d>.1)push(f.k,t.k,[f.c.x,f.c.y,f.c.z],w*d);}}}
 const byKey={};for(const p of out)byKey[p.key]=(byKey[p.key]||0)+1;
 return{faces:R.length,floors:T.length,pairs:out.length,byKey,ex,first:out.slice(0,o.list||30)};};
