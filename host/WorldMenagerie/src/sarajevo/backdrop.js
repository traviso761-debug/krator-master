// ---------- Sarajevo: the mountains round it ----------
// The map is five kilometres of valley; past its edge the engine lays a flat plate, which in a city ringed by
// mountains reads as a sea. Sarajevo's horizon is Igman and Bjelašnica to the south-west (the 1984 downhill), Trebević
// and Jahorina to the south-east, the hills of Ozren and Bukovik to the north. This draws them: the real ground 80 km
// across at 400 m (data/cities/sarajevo-far.json, made from the AWS terrarium tiles), one indexed mesh, its colour from
// the height (the valley's fields, beech and pine, the dwarf pine and bare karst over the tree line), fogged with the
// rest. Inside the map it sinks under the city's own ground (and its deepest lake bed); at its outer edge it falls
// away to the plate.
import {hash3} from '../core/rng.js';

export function backdrop(api){
  const {THREE,C,scene,OSM}=api;const K=C.backdrop;if(!K)return;
  const T=OSM.terrain,FAR=(typeof C.farLevel==='number')?C.farLevel:-1.5;
  // the map's own ground, in metres: the backdrop stays under it, a cell in from its edge
  // and under its lowest point: a lake's bed may go deeper than the 250 m it used to sink (Crater Lake's is 594 m)
  let low=0;if(T)for(const v of T.h)if(v<low)low=v;const SINK=Math.min(-250,low/10-50);
  const mx0=T?T.x0/10+T.step*2:-1e9,mz0=T?T.z0/10+T.step*2:-1e9,mx1=T?T.x0/10+(T.nx-3)*T.step:1e9,mz1=T?T.z0/10+(T.nz-3)*T.step:1e9;
  // the map's own ground at a point, bilinear on its grid (for `hug`)
  const mapH=(x,z)=>{const fx=(x-T.x0/10)/T.step,fz=(z-T.z0/10)/T.step,i=Math.max(0,Math.min(T.nx-2,Math.floor(fx))),j=Math.max(0,Math.min(T.nz-2,Math.floor(fz))),u=Math.min(1,Math.max(0,fx-i)),v=Math.min(1,Math.max(0,fz-j)),h=T.h,n=T.nx;
    return ((h[j*n+i]*(1-u)+h[j*n+i+1]*u)*(1-v)+(h[(j+1)*n+i]*(1-u)+h[(j+1)*n+i+1]*u)*v)/10;};
  // the lowest of the map's ground within r of a point: a backdrop triangle spans a whole cell, so its corners go under
  // the lowest ground it covers, or it stands over the valleys between them as a plate
  const mapMin=(x,z,r)=>{const st=T.step,i0=Math.max(0,Math.floor((x-r-T.x0/10)/st)),i1=Math.min(T.nx-1,Math.ceil((x+r-T.x0/10)/st)),j0=Math.max(0,Math.floor((z-r-T.z0/10)/st)),j1=Math.min(T.nz-1,Math.ceil((z+r-T.z0/10)/st));
    let m=Infinity;for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const v=T.h[j*T.nx+i];if(v<m)m=v;}return m===Infinity?mapH(x,z):m/10;};
  fetch(K.file).then(r=>r.json()).then(D=>{const N=D.n,S=D.step,half=-D.x0,taper=K.taper||6000,datum=K.datum||536.9;
    const pos=new Float32Array(N*N*3),col=new Float32Array(N*N*3),c=new THREE.Color();
    const BANDS=(K.colours||[[0,'#7d8064'],[750,'#4a6438'],[1050,'#3e5a34'],[1450,'#5d6e44'],[1700,'#8c8a76']]).map(([h,cl])=>[h,new THREE.Color(cl)]);
    const bandAt=asl=>{let i=0;while(i+1<BANDS.length&&asl>=BANDS[i+1][0])i++;if(i+1>=BANDS.length)return BANDS[i][1];const [h0,c0]=BANDS[i],[h1,c1]=BANDS[i+1],f=Math.max(0,Math.min(1,(asl-h0)/(h1-h0)));return c.copy(c0).lerp(c1,f*f*(3-2*f));};
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=D.x0+i*S,z=D.z0+j*S;let y=D.h[k];
      const asl=y+datum,edge=half-Math.max(Math.abs(x),Math.abs(z));
      if(x>mx0&&x<mx1&&z>mz0&&z<mz1)y=K.hug==null?SINK:Math.min(y,mapMin(x,z,S)-K.hug);   // under the city's own ground (`hug` m under it: a mountain map, whose edge would otherwise show the backdrop's slope down to the sunk point)
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
