// ---------- the Water, and Bywater Pool ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// "no more than a winding black ribbon, bordered with leaning alder-trees": a small slow river, dark, a few
// metres across, with the sky in it. One ribbon down the line tools/make-shire.py planned, at the level of the
// water, with the current moving a little foam along it; the Pool at Bywater is a still sheet of the same.

export function water(api){
  const {THREE,ctx,scene,animHooks}=api;
  const V=ctx.plan;if(!V)return;
  const U={uT:{value:0},uLight:{value:1},uSky:{value:new THREE.Color(0.7,0.8,0.88)}};
  const VS=`attribute vec2 aUV;varying vec2 vUV;varying vec3 vWP;
#include <fog_pars_vertex>
void main(){vUV=aUV;vec4 w=modelMatrix*vec4(position,1.0);vWP=w.xyz;vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
  const FS=`uniform float uT;uniform float uLight;uniform vec3 uSky;uniform float uSpeed;varying vec2 vUV;varying vec3 vWP;
#include <fog_pars_fragment>
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
void main(){
 float flow=vUV.x-uT*uSpeed;
 float st=0.5*n2(vec2(flow*0.12,vUV.y*2.0))+0.5*n2(vec2(flow*0.5,vUV.y*6.0));
 vec3 deep=vec3(0.10,0.18,0.20),edge=vec3(0.24,0.32,0.28);
 vec3 col=mix(deep,edge,smoothstep(0.55,1.0,abs(vUV.y)));
 vec3 V=normalize(cameraPosition-vWP);
 float fres=pow(1.0-abs(V.y),4.0);
 col=mix(col,uSky,0.25+0.5*fres);
 col=mix(col,vec3(0.85,0.9,0.9),smoothstep(0.78,0.95,st)*0.25);
 col*=uLight;
 gl_FragColor=vec4(col,1.0);
#include <fog_fragment>
}`;
  const mk=speed=>{const m=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,fog:true,
    uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uSpeed:{value:speed}}])});Object.assign(m.uniforms,{uT:U.uT,uLight:U.uLight,uSky:U.uSky});return m;};
  const riverM=mk(0.6),poolM=mk(0.05);
  // the river: resample the line every 3 m so it bends smoothly
  const W=V.water,st=[];
  for(let i=0;i+1<W.length;i++){const a=W[i],b=W[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));
    for(let k=0;k<n;k++){const t=k/n,s=t*t*(3-2*t);st.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t]);}}
  st.push(W[W.length-1]);
  // a gentle meander on top of the planned line, so the ribbon winds
  for(let i=0;i<st.length;i++){const a=st[Math.max(0,i-1)],b=st[Math.min(st.length-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;
    const m=Math.sin(i*0.045)*1.6;st[i]=[st[i][0]-dz/l*m,st[i][1]+dx/l*m,st[i][2],st[i][3]];}
  {const pos=[],uv=[],idx=[];let u=0;
   for(let i=0;i<st.length;i++){const a=st[Math.max(0,i-1)],b=st[Math.min(st.length-1,i+1)],p=st[i];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
     if(i>0)u+=Math.hypot(p[0]-st[i-1][0],p[1]-st[i-1][1]);
     for(const v of [-1,-0.5,0,0.5,1]){pos.push(p[0]-dz*v*p[3],p[2]+0.1,p[1]+dx*v*p[3]);uv.push(u,v);}}
   for(let i=0;i<st.length-1;i++)for(let k=0;k<4;k++){const a=i*5+k;idx.push(a,a+1,a+5,a+1,a+6,a+5);}   // wound to face up
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aUV',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
   const m=new THREE.Mesh(g,riverM);m.userData.wireCat='water';m.userData.noWire=true;scene.add(m);}
  // the Pool
  {const P=V.sites.pool,g=new THREE.CircleGeometry(1,48);g.rotateX(-Math.PI/2);
   const p=g.attributes.position,uv=[];for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);uv.push(x*P.rx,Math.min(1,Math.hypot(x,z)));}
   g.setAttribute('aUV',new THREE.Float32BufferAttribute(uv,2));
   const m=new THREE.Mesh(g,poolM);m.scale.set(P.rx*1.02,1,P.rz*1.02);m.position.set(P.x,P.y+0.1,P.z);m.userData.noWire=true;scene.add(m);}
  // the pond by the Party Tree, from the films: small, still, with willows over it (country.js)
  {const P=V.sites.pond;if(P){const g=new THREE.CircleGeometry(1,40);g.rotateX(-Math.PI/2);
   const p=g.attributes.position,uv=[];for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);uv.push(x*P.rx,Math.min(1,Math.hypot(x,z)));}
   g.setAttribute('aUV',new THREE.Float32BufferAttribute(uv,2));
   const m=new THREE.Mesh(g,poolM);m.scale.set(P.rx,1,P.rz);m.position.set(P.x,P.y+0.1,P.z);m.userData.noWire=true;scene.add(m);}}
  const nf=()=>api.nightF?api.nightF(api.hour()):0;
  animHooks.push(now=>{U.uT.value=now/1000;const n=nf();U.uLight.value=1-0.8*n;U.uSky.value.setRGB(0.7-0.6*n,0.8-0.65*n,0.88-0.65*n);});
  ctx.shireWater={stations:st};
}
