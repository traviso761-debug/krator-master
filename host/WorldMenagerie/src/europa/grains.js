// ---------- grains on ballistic arcs ----------
// Everything thrown up on Europa - the bore's plume, the vents, a lander's blast, an impact's ejecta, a linea
// venting - is the same thing: grains leaving on their own trajectories under 1.31 m/s² with nothing to slow
// them, and gone when they land. One ring buffer of points per look (size and colour), stepped every frame.

export const G=1.315;                                       // m/s² at Europa's surface

let DOT=null;
function dotTexture(THREE){
  if(DOT)return DOT;
  const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');const gr=g.createRadialGradient(16,16,0,16,16,16);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.4,'rgba(240,248,255,0.7)');gr.addColorStop(1,'rgba(230,242,255,0)');
  g.fillStyle=gr;g.fillRect(0,0,32,32);
  return DOT=new THREE.CanvasTexture(c);
}

// createGrains(api, {max, size, color, opacity, additive}) -> {emit(x,y,z, vx,vy,vz, floorY), burst(...), count()}
export function createGrains(api,{max=4000,size=2,color=0xf2f8ff,opacity=0.9,additive=false}={}){
  const {THREE,scene,animHooks}=api;
  const pos=new Float32Array(max*3),vel=new Float32Array(max*3),floor=new Float32Array(max),alive=new Uint8Array(max);
  for(let i=0;i<max;i++)pos[i*3+1]=-1e5;
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));
  const mat=new THREE.PointsMaterial({color,map:dotTexture(THREE),size,sizeAttenuation:true,transparent:true,opacity,depthWrite:false,alphaTest:0.02,
    blending:additive?THREE.AdditiveBlending:THREE.NormalBlending});
  const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.userData.noWire=true;pts.userData.noFingerprint=true;scene.add(pts);
  let next=0,live=0,last=performance.now();
  const S={pts,mat,
    emit(x,y,z,vx,vy,vz,fl){const i=next;next=(next+1)%max;if(!alive[i])live++;
      pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;vel[i*3]=vx;vel[i*3+1]=vy;vel[i*3+2]=vz;floor[i]=fl;alive[i]=1;return i;},
    // move one grain on by t seconds (used to start a plume full, as if it had been running for months)
    advance(i,t){vel[i*3+1]-=G*t;pos[i*3]+=vel[i*3]*t;pos[i*3+1]+=vel[i*3+1]*t+0.5*G*t*t;pos[i*3+2]+=vel[i*3+2]*t;},
    vy(i){return vel[i*3+1];},
    count:()=>live};
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;if(!live)return;
    for(let i=0;i<max;i++){if(!alive[i])continue;
      vel[i*3+1]-=G*dt;pos[i*3]+=vel[i*3]*dt;pos[i*3+1]+=vel[i*3+1]*dt;pos[i*3+2]+=vel[i*3+2]*dt;
      if(vel[i*3+1]<0&&pos[i*3+1]<floor[i]){alive[i]=0;live--;pos[i*3+1]=-1e5;}}
    geo.attributes.position.needsUpdate=true;});
  return S;
}

// a jet: grains per second leaving (x, y, z) upward at v0..v1 m/s, `side` m/s of sideways scatter
export function jet(S,R,j){const a=R()*Math.PI*2,sd=j.side*Math.sqrt(R());
  return S.emit(j.x,j.y,j.z,Math.cos(a)*sd+(j.dx||0),j.v0+(j.v1-j.v0)*R(),Math.sin(a)*sd+(j.dz||0),j.floor!==undefined?j.floor:j.y-6);}
