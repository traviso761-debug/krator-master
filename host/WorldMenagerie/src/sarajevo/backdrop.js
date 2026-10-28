// ---------- Sarajevo: the mountains round it ----------
// The map is five kilometres of valley; past its edge the engine lays a flat plate, which in a city ringed by
// mountains reads as a sea. Sarajevo's horizon is Igman and Bjelašnica to the south-west (the 1984 downhill), Trebević
// and Jahorina to the south-east, the hills of Ozren and Bukovik to the north. This draws them: the real ground 80 km
// across at 400 m (data/cities/sarajevo-far.json, made from the AWS terrarium tiles), one indexed mesh, its colour from
// the height (the valley's fields, beech and pine, the dwarf pine and bare karst over the tree line), fogged with the
// rest. Inside the map it sinks under the city's own ground; at its outer edge it falls away to the plate.
import {hash3} from '../core/rng.js';

export function backdrop(api){
  const {THREE,C,scene,OSM}=api;const K=C.backdrop;if(!K)return;
  const T=OSM.terrain,FAR=(typeof C.farLevel==='number')?C.farLevel:-1.5;
  // the map's own ground, in metres: the backdrop stays under it, a cell in from its edge
  const mx0=T?T.x0/10+T.step*2:-1e9,mz0=T?T.z0/10+T.step*2:-1e9,mx1=T?T.x0/10+(T.nx-3)*T.step:1e9,mz1=T?T.z0/10+(T.nz-3)*T.step:1e9;
  fetch(K.file).then(r=>r.json()).then(D=>{const N=D.n,S=D.step,half=-D.x0,taper=K.taper||6000,datum=K.datum||536.9;
    const pos=new Float32Array(N*N*3),col=new Float32Array(N*N*3),c=new THREE.Color();
    const BANDS=(K.colours||[[0,'#7d8064'],[750,'#4a6438'],[1050,'#3e5a34'],[1450,'#5d6e44'],[1700,'#8c8a76']]).map(([h,cl])=>[h,new THREE.Color(cl)]);
    const bandAt=asl=>{let i=0;while(i+1<BANDS.length&&asl>=BANDS[i+1][0])i++;if(i+1>=BANDS.length)return BANDS[i][1];const [h0,c0]=BANDS[i],[h1,c1]=BANDS[i+1],f=Math.max(0,Math.min(1,(asl-h0)/(h1-h0)));return c.copy(c0).lerp(c1,f*f*(3-2*f));};
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=D.x0+i*S,z=D.z0+j*S;let y=D.h[k];
      const asl=y+datum,edge=half-Math.max(Math.abs(x),Math.abs(z));
      if(x>mx0&&x<mx1&&z>mz0&&z<mz1)y=-250;                     // under the city's own ground
      else if(edge<taper)y=FAR+(y-FAR)*Math.max(0,edge/taper);   // down to the plate at the rim
      pos.set([x,y,z],k*3);
      // the slope darkens the colour a little, the hash breaks up the bands
      const dx=(D.h[j*N+Math.min(N-1,i+1)]-D.h[j*N+Math.max(0,i-1)])/(2*S),dz=(D.h[Math.min(N-1,j+1)*N+i]-D.h[Math.max(0,j-1)*N+i])/(2*S),sl=Math.min(1,Math.hypot(dx,dz)*1.6);
      const v=bandAt(asl+(hash3(i,j,5)-0.5)*120).clone().multiplyScalar(1-0.22*sl+(hash3(i,j,6)-0.5)*0.08);col.set([v.r,v.g,v.b],k*3);}
    const idx=new Uint32Array((N-1)*(N-1)*6);let q=0;
    for(let j=0;j+1<N;j++)for(let i=0;i+1<N;i++){const a=j*N+i,b=a+1,d=a+N,e=d+1;idx.set([a,d,b,b,d,e],q);q+=6;}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();g.computeBoundingSphere();
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.name='backdrop';
    m.userData.noFingerprint=true;m.userData.noWire=true;m.userData.noShadow=true;m.receiveShadow=false;m.castShadow=false;m.renderOrder=-1;scene.add(m);
    api.ctx.details=Object.assign(api.ctx.details||{},{backdrop:{n:N,step:S,tris:(N-1)*(N-1)*2}});
  }).catch(e=>api.report&&api.report('backdrop',e));
}
