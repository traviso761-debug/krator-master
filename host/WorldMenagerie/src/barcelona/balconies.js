// ---------- Barcelona: the balconies of the Eixample and the old city ----------
// What makes a Barcelona street is its balconies: on every floor of every block above the shops, one to each tall
// window, a slab of stone and a railing of wrought iron, often with the green or brown roller blinds (persianes) let
// down over the doors behind, and flowers and washing on them. Here each street front of a mapped footprint gets one
// to each bay of its windows (the facade texture's grid: C.facade.bay along the perimeter from the first vertex,
// C.facade.floor up), on every floor but the ground one; a wall with another building just outside it is a party
// wall and gets none.
// Built by tile near the camera (C.balconies.far metres), one tile a frame, nearest first, as streetlife does, and as
// instances of one small mesh coloured by instance: a city of them at once would be millions of triangles.
// Config: "balconies": {"far": m, "tile": m, "types": [...], "minH": m, "maxH": m, "where": [[s,w,n,e], ...],
// "blinds": share}. Map data (c) OpenStreetMap contributors, ODbL.
import {mkRng} from '../core/rng.js';

export function balconies(api){
  const {THREE,C,scene,FOOTPRINTS,buildingsAt,inPoly,animHooks,camera,P,nightF,hour}=api;const K=C.balconies;if(!K)return;
  const FAR=K.far||380,TILE=K.tile||200,BAY=(C.facade&&C.facade.bay)||4.2,FLOOR=(C.facade&&C.facade.floor)||3.6;
  const TYPES=new Set(K.types||['yes','apartments','residential','house','commercial','retail','hotel','office']);
  const WHERE=(K.where||[]).map(([s,w,n,e])=>{const [x0,z1]=P([s,w]),[x1,z0]=P([n,e]);return {x0,x1,z0,z1};});
  const inWhere=(x,z)=>!WHERE.length||WHERE.some(b=>x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1);
  // the balcony, built facing +z from a wall at z=0: the slab, the railing's top rail, its bars as a dark panel, the
  // two ends, and the blind over the doors behind (drawn or not, by instance colour: a raised blind is the wall's)
  const parts=[];const bx=(w,h,d,x,y,z,c)=>{const g=new THREE.BoxGeometry(w,h,d).translate(x,y,z).toNonIndexed();const n=g.attributes.position.count,cc=new Float32Array(n*3);for(let i=0;i<n;i++)cc.set(c,i*3);g.setAttribute('color',new THREE.BufferAttribute(cc,3));g.deleteAttribute('uv');parts.push(g);};
  const STONE=[0.82,0.78,0.7],IRON=[0.16,0.16,0.17],BARS=[0.3,0.3,0.31];
  // the bars read as a grey screen at any distance a balcony is drawn: a solid dark panel read as a box
  bx(1.9,0.16,0.85,0,0,0.42,STONE);bx(1.9,0.06,0.06,0,1.0,0.82,IRON);bx(1.9,0.06,0.06,0,0.2,0.82,IRON);bx(1.86,0.74,0.015,0,0.58,0.83,BARS);for(const s of [-1,1])bx(0.05,0.95,0.8,s*0.93,0.55,0.42,IRON);
  const geo=(()=>{let n=0;for(const g of parts)n+=g.attributes.position.count;const p=new Float32Array(n*3),nn=new Float32Array(n*3),c=new Float32Array(n*3);let o=0;
    for(const g of parts){p.set(g.attributes.position.array,o*3);nn.set(g.attributes.normal.array,o*3);c.set(g.attributes.color.array,o*3);o+=g.attributes.position.count;}
    const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(p,3));G.setAttribute('normal',new THREE.BufferAttribute(nn,3));G.setAttribute('color',new THREE.BufferAttribute(c,3));return G;})();
  const blindGeo=new THREE.PlaneGeometry(1.3,1.5).translate(0,1.05,0.04);
  const mat=new THREE.MeshLambertMaterial({vertexColors:true});const blindM=new THREE.MeshLambertMaterial({color:0xffffff,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const BLINDS=[[0.29,0.4,0.27],[0.36,0.27,0.18],[0.3,0.42,0.3],[0.52,0.44,0.3],[0.24,0.3,0.24]].map(c=>new THREE.Color(c[0],c[1],c[2]));
  // which footprints, by tile
  const tiles=new Map();
  for(const f of FOOTPRINTS){const H=f.h-f.g;if(!TYPES.has(f.t||'yes')||H<(K.minH||9)||H>(K.maxH||45)||f.m-f.g>0.5||f.ring.length<3)continue;
    const [x0,z0]=f.ring[0];if(!inWhere(x0,z0))continue;const k=Math.floor(x0/TILE)+','+Math.floor(z0/TILE);let t=tiles.get(k);
    if(!t){t={k,cx:(Math.floor(x0/TILE)+0.5)*TILE,cz:(Math.floor(z0/TILE)+0.5)*TILE,fs:[],mesh:null};tiles.set(k,t);}t.fs.push(f);}
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),pos=new THREE.Vector3(),one=new THREE.Vector3(1,1,1),col=new THREE.Color();
  const outside=(x,z)=>buildingsAt(x,z,0).some(b=>inPoly(x,z,b.ring));
  let nBalc=0;
  function build(t){const list=[],blinds=[];
    for(const f of t.fs){const r=f.ring,H=f.h-f.g,nf=Math.floor(H/FLOOR);if(nf<2)continue;const R=mkRng((f.hsh||0)*1e6|0);
      // which way is out: the ring's winding
      let a=0;for(let i=0;i<r.length;i++){const p=r[i],q2=r[(i+1)%r.length];a+=p[0]*q2[1]-q2[0]*p[1];}const sg=a>0?1:-1;
      let s0=0;for(let i=0;i<r.length;i++){const [ax,az]=r[i],[bx2,bz]=r[(i+1)%r.length],L=Math.hypot(bx2-ax,bz-az);if(L<0.5){s0+=L;continue;}
        const ux=(bx2-ax)/L,uz=(bz-az)/L;let nx=uz*sg,nz=-ux*sg;
        // the outward normal must lead out of the footprint; a wall with a neighbour against it is a party wall
        const mx=ax+ux*L/2,mz=az+uz*L/2;if(inPoly(mx+nx*0.6,mz+nz*0.6,r)){nx=-nx;nz=-nz;}
        if(L<2.4||outside(mx+nx*2.5,mz+nz*2.5)){s0+=L;continue;}
        const ry=Math.atan2(nx,nz);
        // the bays of the window grid that fall on this wall, clear of its corners
        for(let s=Math.ceil((s0)/BAY-0.5)*BAY+BAY/2;s<s0+L;s+=BAY){const u=s-s0;if(u<1.1||u>L-1.1)continue;const px=ax+ux*u,pz=az+uz*u;
          const blind=R()<(K.blinds==null?0.35:K.blinds);
          for(let fl=1;fl<nf;fl++){const y=f.g+fl*FLOOR+0.05;list.push([px,y,pz,ry]);if(blind&&R()<0.6)blinds.push([px,y,pz,ry,BLINDS[(R()*BLINDS.length)|0]]);}}
        s0+=L;}}
    if(!list.length)return null;const g=new THREE.Group();
    const im=new THREE.InstancedMesh(geo,mat,list.length);list.forEach(([x,y,z,ry],i)=>{q.setFromAxisAngle(Y,ry);m4.compose(pos.set(x,y,z),q,one);im.setMatrixAt(i,m4);});
    im.castShadow=false;im.receiveShadow=true;im.frustumCulled=false;im.userData.noFingerprint=true;g.add(im);
    if(blinds.length){const bm=new THREE.InstancedMesh(blindGeo,blindM,blinds.length);blinds.forEach(([x,y,z,ry,c],i)=>{q.setFromAxisAngle(Y,ry);m4.compose(pos.set(x,y,z),q,one);bm.setMatrixAt(i,m4);bm.setColorAt(i,c);});
      bm.userData.noFingerprint=true;bm.frustumCulled=false;g.add(bm);}
    nBalc+=list.length;return g;}
  const live=new Set();let last=0;
  animHooks.push(now=>{if(now-last<200)return;last=now;const cx=camera.position.x,cz=camera.position.z,cy=camera.position.y;
    // from high over the city they are too small to see: none are built above 900 m
    const far=cy>900?0:FAR;let best=null,bd=1e18;
    for(const t of tiles.values()){const d=Math.hypot(t.cx-cx,t.cz-cz)-TILE*0.7;
      if(t.mesh&&d>far*1.4){scene.remove(t.mesh);t.mesh.traverse(o=>{if(o.isInstancedMesh)o.dispose();});t.mesh=null;live.delete(t);continue;}
      if(!t.mesh&&!t.none&&d<far&&d<bd){bd=d;best=t;}}
    if(best){const g=build(best);if(g){best.mesh=g;scene.add(g);live.add(best);}else best.none=true;}});
  api.ctx.details=Object.assign(api.ctx.details||{},{balconyTiles:tiles.size});
  window.__balconies=()=>nBalc;
}
