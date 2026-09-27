// ---------- dust ----------
// Fan work. Everything thrown into the air on Arrakis - a spice blow, the sand a worm throws up, a carryall's
// downwash, a storm - is dust in an atmosphere: it goes up, the air slows it, the wind takes it, and it hangs
// and thins before it settles. Soft round points in one buffer per look, each with its own life, fading as it
// goes; the drag and the wind are what make it read as dust rather than as grains in a vacuum (Europa's).

let DOT=null;
function dot(THREE){if(DOT)return DOT;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,0.9)');gr.addColorStop(0.5,'rgba(255,255,255,0.35)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.fillRect(0,0,64,64);return DOT=new THREE.CanvasTexture(c);}

export function createDust(api,{max=6000,size=18,color=0xc8a878,drag=0.6,gravity=2.5,wind=[3,0,1.5]}={}){
  const {THREE,scene,animHooks}=api;
  const pos=new Float32Array(max*3),vel=new Float32Array(max*3),life=new Float32Array(max),age=new Float32Array(max),sz=new Float32Array(max);
  for(let i=0;i<max;i++)pos[i*3+1]=-1e5;
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));
  const aA=new THREE.BufferAttribute(new Float32Array(max),1).setUsage(THREE.DynamicDrawUsage),aS=new THREE.BufferAttribute(sz,1).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('alpha',aA);geo.setAttribute('psize',aS);
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,
    uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{map:{value:dot(THREE)},uColor:{value:new THREE.Color(color)},uScale:{value:innerHeight/2}}]),
    vertexShader:`attribute float alpha;attribute float psize;uniform float uScale;varying float vA;
#include <fog_pars_vertex>
void main(){vA=alpha;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_PointSize=psize*uScale/max(1.0,-mvPosition.z);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
    fragmentShader:`uniform sampler2D map;uniform vec3 uColor;varying float vA;
#include <fog_pars_fragment>
void main(){vec4 t=texture2D(map,gl_PointCoord);gl_FragColor=vec4(uColor,t.a*vA);if(gl_FragColor.a<0.01)discard;
#include <fog_fragment>
}`});
  mat.uniforms.map.value=dot(THREE);
  const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.userData.noWire=true;pts.userData.noFingerprint=true;scene.add(pts);
  addEventListener('resize',()=>{mat.uniforms.uScale.value=innerHeight/2;});
  let next=0,live=0,last=performance.now();
  const W=wind;
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;if(!live)return;const k=Math.exp(-drag*dt),A=aA.array;
    for(let i=0;i<max;i++){if(life[i]<=0)continue;age[i]+=dt;
      if(age[i]>=life[i]){life[i]=0;live--;pos[i*3+1]=-1e5;A[i]=0;continue;}
      vel[i*3]=(vel[i*3]-W[0])*k+W[0];vel[i*3+1]=vel[i*3+1]*k-gravity*dt;vel[i*3+2]=(vel[i*3+2]-W[2])*k+W[2];
      pos[i*3]+=vel[i*3]*dt;pos[i*3+1]+=vel[i*3+1]*dt;pos[i*3+2]+=vel[i*3+2]*dt;
      const u=age[i]/life[i];A[i]=Math.min(1,u*6)*(1-u)*(1-u)*0.9;sz[i]+=dt*sz[i]*0.25;}
    geo.attributes.position.needsUpdate=true;aA.needsUpdate=true;aS.needsUpdate=true;});
  return {mat,
    emit(x,y,z,vx,vy,vz,lifeS,size0){const i=next;next=(next+1)%max;if(life[i]<=0)live++;pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;
      vel[i*3]=vx;vel[i*3+1]=vy;vel[i*3+2]=vz;life[i]=lifeS;age[i]=0;sz[i]=size0||size;},
    count:()=>live};
}
