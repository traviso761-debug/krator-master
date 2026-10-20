// ================================================================= 89x. THE Z-FIGHTING PASS: coplanar faces pulled apart before the kit is baked
// The owner (2026-10-19): "there is z fighting right before the threshold, and multiple other places; do z-fighting pass".
// Two surfaces fight when they lie in one plane, face the same way and overlap. Most in Iziz are kit boxes (vB, vBq, kput of a
// unit box) whose faces meet another box's or a floor's: a plate on a wall, a sill in a floor, a partition's top at a wall's.
// When the interiors are on (the city, the test sheet), kbake first runs IZDEFIGHT.run(): every unit-box instance's faces, in
// world space, binned by direction and plane (2 mm); of two overlapping faces of different item or colour, the box with the
// smaller face is shrunk 6 mm on that axis about its centre, so its face falls 3 mm behind the other's (where they overlap the
// two boxes overlap in volume, so no gap opens). A box top in the plane of a floor mesh's upward face is shrunk the same way.
// Deterministic (no draws: the order is the items' own), and nothing moves in a page without interiors.
// towers/zcheck.js (IZZCHECK) measures what is left.
const IZDEFIGHT={n:0,floors:0,
 run(){const EPS=.002,R=[],v3=(x,y,z)=>new THREE.Vector3(x,y,z),q=new THREE.Quaternion();
  for(const n in KIT.items){const D=KIT.defs[n];if(!D||!D.geo||D.geo.type!=='BoxGeometry')continue;const P=D.geo.parameters||{};
   if(Math.abs((P.width||1)-1)>1e-6||Math.abs((P.height||1)-1)>1e-6||Math.abs((P.depth||1)-1)>1e-6)continue;
   const it=KIT.items[n];
   for(let i=0;i<it.length;i++){const e=it[i];if(typeof e.s==='number')e.s=[e.s,e.s,e.s];else if(!e.s)e.s=[1,1,1];const s=e.s;if(e.q)q.copy(e.q);else q.identity();
    const ax=[v3(1,0,0).applyQuaternion(q),v3(0,1,0).applyQuaternion(q),v3(0,0,1).applyQuaternion(q)],col=e.c?e.c.getHex():-1;
    for(let a=0;a<3;a++)for(const sg of[-1,1]){const nrm=ax[a].clone().multiplyScalar(sg);if(nrm.y<-.9)continue;   /* an underside lies on what carries it */
     const c=v3(e.p[0],e.p[1],e.p[2]).addScaledVector(ax[a],sg*s[a]/2),b=(a+1)%3,cc=(a+2)%3;
     R.push({e,a,k:n,col,n:nrm,d:nrm.dot(c),c,u:ax[b],v:ax[cc],hu:s[b]/2,hv:s[cc]/2});}}}
  const bins=new Map();for(const f of R){const k=[Math.round(f.n.x*50),Math.round(f.n.y*50),Math.round(f.n.z*50),Math.round(f.d/EPS),Math.floor(f.c.x/8),Math.floor(f.c.z/8)].join(',');let L=bins.get(k);if(!L)bins.set(k,L=[]);L.push(f);}   /* and by 8 m of ground: a plane holds every window row of a row of towers */
  const shrunk=new Set(),shrink=(f)=>{const key=f.e;const tag=f.a;if(!shrunk.has(key))shrunk.add(key);const k2=key.__zs||(key.__zs={});if(k2[tag])return;if(f.e.s[f.a]<.02)return;k2[tag]=1;f.e.s[f.a]-=.006;IZDEFIGHT.n++;};
  const area=(f,g)=>{let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const [x,y] of[[-1,-1],[1,-1],[1,1],[-1,1]]){const p=g.c.clone().addScaledVector(g.u,x*g.hu).addScaledVector(g.v,y*g.hv).sub(f.c),pu=p.dot(f.u),pv=p.dot(f.v);u0=Math.min(u0,pu);u1=Math.max(u1,pu);v0=Math.min(v0,pv);v1=Math.max(v1,pv);}
   const w=Math.min(f.hu,u1)-Math.max(-f.hu,u0),h=Math.min(f.hv,v1)-Math.max(-f.hv,v0);return w>0&&h>0?w*h:0;};
  for(const L of bins.values()){if(L.length<2||L.length>6000)continue;
   for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const f=L[i],g=L[j];if(f.e===g.e||f.k===g.k&&f.col===g.col)continue;
    if(f.c.distanceTo(g.c)>f.hu+f.hv+g.hu+g.hv)continue;if(area(f,g)<.004)continue;shrink(f.hu*f.hv<=g.hu*g.hv?f:g);}}
  // box tops in a floor mesh's plane
  const F=new Map(),A=v3(),B=v3(),C=v3();
  scene.traverse(m=>{if(!m.isMesh||m.isInstancedMesh||!m.geometry||!m.geometry.attributes.position)return;const g=m.geometry,pa=g.attributes.position,ix=g.index,n=ix?ix.count:pa.count;if(n>300000)return;
   m.updateMatrixWorld();const M=m.matrixWorld;for(let t=0;t<n;t+=3){const i0=ix?ix.getX(t):t,i1=ix?ix.getX(t+1):t+1,i2=ix?ix.getX(t+2):t+2;
    A.fromBufferAttribute(pa,i0).applyMatrix4(M);B.fromBufferAttribute(pa,i1).applyMatrix4(M);C.fromBufferAttribute(pa,i2).applyMatrix4(M);
    if(Math.abs(A.y-B.y)>EPS||Math.abs(A.y-C.y)>EPS)continue;const ar=((B.x-A.x)*(C.z-A.z)-(C.x-A.x)*(B.z-A.z))/2;if(Math.abs(ar)<.01)continue;
    const r={y:A.y,x0:Math.min(A.x,B.x,C.x),x1:Math.max(A.x,B.x,C.x),z0:Math.min(A.z,B.z,C.z),z1:Math.max(A.z,B.z,C.z)};
    for(let x=Math.floor(r.x0/4);x<=Math.floor(r.x1/4);x++)for(let z=Math.floor(r.z0/4);z<=Math.floor(r.z1/4);z++){const k=x+','+z;let L=F.get(k);if(!L)F.set(k,L=[]);L.push(r);}}});
  for(const f of R){if(f.n.y<.99)continue;const L=F.get(Math.floor(f.c.x/4)+','+Math.floor(f.c.z/4));if(!L)continue;
   for(const r of L){if(Math.abs(r.y-f.c.y)>EPS)continue;if(Math.min(r.x1,f.c.x+f.hu)-Math.max(r.x0,f.c.x-f.hu)>.05&&Math.min(r.z1,f.c.z+f.hv)-Math.max(r.z0,f.c.z-f.hv)>.05){shrink(f);IZDEFIGHT.floors++;break;}}}
  for(const n in KIT.items)for(const e of KIT.items[n])if(e.__zs)delete e.__zs;
  window._defight={shrunk:IZDEFIGHT.n,floors:IZDEFIGHT.floors};return IZDEFIGHT.n;}};
if(typeof kbake==='function'){const kb0=kbake;kbake=function(){if(VERN.interiors)try{IZDEFIGHT.run();}catch(e){reportErr('defight: '+(e&&e.message||e));}return kb0.apply(this,arguments);};}
