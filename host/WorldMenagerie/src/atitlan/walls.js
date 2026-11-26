// ---------- Lake Atitlán: the walls of the houses ----------
// Two things nearly every house round the lake shows on its walls, which the engine's one colour a building cannot:
//   the zócalo   a band of darker paint along the foot of the wall, knee to waist high, against the splash of the
//                rain and the mud of the street: maroon, bottle green, navy, charcoal, or the wall's own colour
//                deepened (C.walls.zocalo, a share of houses, `band` m high)
//   obra gris    the upper floor built in bare grey block and never rendered: the ground floor painted, the floor
//                over it the grey of the block (C.walls.grey, a share of the houses of two
//                floors or more, from `floor` m up)
// On the footprints in `zones` ([lat, lon, radius]) under `maxH`, outside `skip` (Santa Catarina's painted walls).
// One mesh of vertex-coloured quads just proud of the walls; none of it in the fingerprint.
import {hash3} from '../core/rng.js';

export function walls(api){
  const {THREE,C,scene,FOOTPRINTS,P}=api;const K=C.walls;if(!K||!FOOTPRINTS)return;
  const zs=l=>(l||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r];}),ZONES=zs(K.zones),SKIP=zs(K.skip),
    inA=(A,x,z)=>A.some(([zx,zz,r])=>(x-zx)**2+(z-zz)**2<r*r);
  const ZOC=(K.colours||['#6a2a2a','#2a4a32','#2a3456','#3a3a3c','#7a3a2a','#1e5a6a']).map(h=>new THREE.Color(h));
  const BLOCK=[new THREE.Color('#9a968e'),new THREE.Color('#8e8a82'),new THREE.Color('#a4a098')],MORTAR=new THREE.Color('#b4b0a6');
  const pos=[],col=[];let nZ=0,nG=0;const c=new THREE.Color();
  const quad=(p,q,nx,nz,y0,y1,cc)=>{const a=[p[0]+nx,y0,p[1]+nz],b=[q[0]+nx,y0,q[1]+nz],d=[q[0]+nx,y1,q[1]+nz],e=[p[0]+nx,y1,p[1]+nz];pos.push(...a,...b,...d,...a,...d,...e);for(let k=0;k<6;k++)col.push(cc.r,cc.g,cc.b);};
  for(const f of FOOTPRINTS){const r=f.ring;if(!r||r.length<3)continue;const H=f.h-f.g;if(H>(K.maxH||12)||H<2.4)continue;
    let cx=0,cz=0;for(const [x,z] of r){cx+=x;cz+=z;}cx/=r.length;cz/=r.length;if(!inA(ZONES,cx,cz)||inA(SKIP,cx,cz))continue;
    const zoc=hash3(cx,cz,81)<(K.zocalo===undefined?0.6:K.zocalo),grey=H>=(K.floor||3)+2.2&&hash3(cx,cz,82)<(K.grey===undefined?0.3:K.grey);if(!zoc&&!grey)continue;
    let A=0;for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length];A+=p[0]*q[1]-q[0]*p[1];}const sg=A>0?1:-1;
    const zc=ZOC[Math.floor(hash3(cx,cz,83)*ZOC.length)],band=(K.band||0.9)*(0.8+hash3(cz,cx,84)*0.5),gc=BLOCK[Math.floor(hash3(cx,cz,85)*BLOCK.length)],fl=f.g+(K.floor||3);
    if(zoc)nZ++;if(grey)nG++;
    for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<0.8)continue;const nx=(q[1]-p[1])/L*sg,nz=-(q[0]-p[0])/L*sg;
      if(zoc)quad(p,q,nx*0.05,nz*0.05,f.g+0.05,f.g+band,zc);
      if(grey){quad(p,q,nx*0.05,nz*0.05,fl,f.h-0.05,gc);
        // the slab's edge between the floors (the block's courses want a texture: core/materials/PROMPTS-NEEDED.md)
        c.copy(MORTAR);quad(p,q,nx*0.07,nz*0.07,fl-0.25,fl,c.multiplyScalar(0.92));}}}
  if(!pos.length)return;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-3}));
  m.name='walls';m.receiveShadow=true;m.userData.noFingerprint=true;scene.add(m);
  api.ctx.details=Object.assign(api.ctx.details||{},{walls:{zocalo:nZ,grey:nG,tris:pos.length/9}});
}
