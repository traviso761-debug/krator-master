// ---------- the water: the Bruinen, its fall, and the streams that come over the rim ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// "the voice of hurrying water in a rocky bed at the bottom"; "flowing fast and noisily, as mountain-streams
// do". The engine draws water as flat polygons, and a mountain river is not flat: it comes down its valley.
// So the Bruinen is one ribbon down the line tools/make-rivendell.py planned, at the level of the water at
// every station, and its shader moves foam down it at the speed of the current - white where the bed drops,
// which is the rapids at the head of the valley and the fall across the river below the bridge, and dark and
// quick in between.
//
// Every side stream is the same ribbon, in four pieces: a runnel across the moor, a cascade down the wooded
// slope under the rim, a sheet down the rock face - laid a couple of metres out from the face and following it
// down, not hanging in the air - and a brook across the floor to the river. Mist stands at the foot of each.

export function water(api){
  const {THREE,ctx,scene,animHooks,groundH}=api;
  const V=ctx.valley;if(!V)return;
  const nightF=()=>api.nightF?api.nightF(api.hour()):0;
  const U={uT:{value:0},uLight:{value:1},uSky:{value:new THREE.Color(0.72,0.8,0.86)}};

  const VS=`attribute float aSlope;attribute vec2 aUV;varying vec2 vUV;varying float vSlope;varying vec3 vWP;
#include <fog_pars_vertex>
void main(){vUV=aUV;vSlope=aSlope;vec4 w=modelMatrix*vec4(position,1.0);vWP=w.xyz;vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
  const FS=`uniform float uT;uniform float uLight;uniform vec3 uSky;uniform float uSpeed;uniform float uSheet;
varying vec2 vUV;varying float vSlope;varying vec3 vWP;
#include <fog_pars_fragment>
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return 0.5*n2(p)+0.25*n2(p*2.1+3.1)+0.125*n2(p*4.3+7.7);}
void main(){
 float u=vUV.x,v=vUV.y;                                      // u: metres downstream; v: -1..1 across
 float flow=u-uT*uSpeed;
 float st=fb(vec2(flow*0.07,v*2.2+0.3*n2(vec2(flow*0.02,v))));
 float fine=fb(vec2(flow*0.35,v*9.0));
 float white=clamp(vSlope*9.0,0.0,1.0);                        // where the bed drops the water is white
 float edge=smoothstep(0.62,1.0,abs(v));
 float foam=clamp(white*(0.55+0.6*st)+smoothstep(0.62,0.78,st)*0.45+edge*0.35*fine,0.0,1.0);
 foam=mix(foam,0.7+0.3*fine,uSheet);                         // a fall is foam all the way down
 vec3 deep=vec3(0.13,0.30,0.33),shallow=vec3(0.38,0.52,0.50);
 vec3 col=mix(deep,shallow,edge*0.8+0.2*st);
 vec3 V=normalize(cameraPosition-vWP);
 float fres=pow(1.0-abs(V.y),3.0)*(1.0-uSheet);
 col=mix(col,uSky,0.35*fres+0.1);
 col=mix(col,vec3(0.93,0.96,0.97),foam);
 col*=uLight;
 float a=mix(1.0,(1.0-smoothstep(0.55,1.0,abs(v)))*(0.55+0.45*fine),uSheet);
 gl_FragColor=vec4(col,a);
#include <fog_fragment>
}`;
  const mk=(speed,sheet)=>{const m=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,fog:true,transparent:!!sheet,depthWrite:!sheet,side:THREE.DoubleSide,
    uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uSpeed:{value:speed},uSheet:{value:sheet?1:0}}])});
    Object.assign(m.uniforms,{uT:U.uT,uLight:U.uLight,uSky:U.uSky});return m;};
  const riverM=mk(2.6,false),brookM=mk(1.8,false),fallM=mk(9,true);

  // A ribbon down a line of [x,z,y,halfWidth] stations; u runs downstream in metres, aSlope is the drop per
  // metre there. `across` is how many vertices wide.
  function ribbon(pts,across,mat,lift){
    const pos=[],uv=[],sl=[],idx=[];let u=0;const n=pts.length;
    for(let i=0;i<n;i++){
      const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)],p=pts[i];
      let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
      if(i>0)u+=Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1],p[2]-pts[i-1][2]);
      const drop=Math.max(0,(a[2]-b[2])/Math.max(0.5,Math.hypot(b[0]-a[0],b[1]-a[1])));
      for(let k=0;k<across;k++){const v=k/(across-1)*2-1;
        pos.push(p[0]-dz*v*p[3],p[2]+(lift||0),p[1]+dx*v*p[3]);uv.push(u,v);sl.push(drop);}
    }
    for(let i=0;i<n-1;i++)for(let k=0;k<across-1;k++){const a=i*across+k;idx.push(a,a+across,a+1,a+1,a+across,a+across+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('aUV',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('aSlope',new THREE.Float32BufferAttribute(sl,1));g.setIndex(idx);
    g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.userData.noWire=true;m.userData.wireCat='water';scene.add(m);return m;
  }

  // ---- the Bruinen ----
  ribbon(V.river.map(r=>[r[0],r[1],r[2],r[3]]),7,riverM,0.05);

  // ---- the falls ----
  const mists=[];
  const mistTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
    const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,0.8)');gr.addColorStop(0.5,'rgba(240,244,246,0.35)');gr.addColorStop(1,'rgba(230,236,240,0)');
    g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const mistM=new THREE.SpriteMaterial({map:mistTex,transparent:true,depthWrite:false,opacity:0.55,fog:true});
  function mist(x,y,z,s,n){for(let i=0;i<n;i++){const sp=new THREE.Sprite(mistM);sp.userData.noWire=true;
    sp.position.set(x+(Math.random()-0.5)*s*0.6,y+s*0.2,z+(Math.random()-0.5)*s*0.6);sp.scale.setScalar(s*(0.6+Math.random()*0.6));scene.add(sp);
    mists.push({sp,x:sp.position.x,y:sp.position.y,z:sp.position.z,s:sp.scale.x,ph:Math.random()*6.28});}}

  V.falls.forEach((f,fi)=>{
    const w=2.2+(fi*37%5)*0.8;
    // the runnel on the moor, and the cascade down the wooded slope to the lip
    const run=f.moor.map(p=>[p[0],p[1],p[2],w*0.7]);
    run.push([f.lip[0],f.lip[1],f.lip[2]+0.4,w*0.9]);
    const dense=[];for(let i=0;i<run.length-1;i++){const a=run[i],b=run[i+1],n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/8));
      for(let k=0;k<n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;dense.push([x,z,groundH(x,z)+0.45,a[3]+(b[3]-a[3])*t]);}}
    dense.push(run[run.length-1]);
    ribbon(dense,4,brookM,0);
    // the sheet down the face: for every few metres of height, find where the face is at that height on the
    // line from the lip to the foot, and hang the water just in front of it
    const L=f.lip,F=f.foot,dx=F[0]-L[0],dz=F[1]-L[1],dl=Math.hypot(dx,dz)||1,ox=dx/dl,oz=dz/dl;
    const sheet=[];const N=Math.max(8,Math.ceil(f.drop/5));
    for(let k=0;k<=N;k++){const y=L[2]-f.drop*k/N;
      let lo=0,hi=1;for(let it=0;it<18;it++){const m=(lo+hi)/2;const gy=groundH(L[0]+dx*m,L[1]+dz*m);if(gy>y)lo=m;else hi=m;}
      const x=L[0]+dx*lo+ox*2.4,z=L[1]+dz*lo+oz*2.4;
      sheet.push([x,z,y,w*(1+k/N*0.6)]);}
    // a sheet is vertical: its ribbon is laid across the face, not across the water's path
    const pos=[],uv=[],sl=[],idx=[];const px=-oz,pz=ox;
    sheet.forEach((s,i)=>{for(let k=0;k<3;k++){const v=k-1;pos.push(s[0]+px*v*s[3],s[2],s[1]+pz*v*s[3]);uv.push((L[2]-s[2]),v);sl.push(1);}});
    for(let i=0;i<sheet.length-1;i++)for(let k=0;k<2;k++){const a=i*3+k;idx.push(a,a+3,a+1,a+1,a+3,a+4);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aUV',new THREE.Float32BufferAttribute(uv,2));
    g.setAttribute('aSlope',new THREE.Float32BufferAttribute(sl,1));g.setIndex(idx);g.computeBoundingSphere();
    const m=new THREE.Mesh(g,fallM);m.userData.noWire=true;m.renderOrder=2;scene.add(m);
    // and the brook from the foot to the river
    const brook=[];const bx=f.bank[0]-F[0],bz=f.bank[1]-F[1],bn=Math.max(2,Math.ceil(Math.hypot(bx,bz)/6));
    for(let k=0;k<=bn;k++){const t=k/bn,x=F[0]+bx*t,z=F[1]+bz*t;brook.push([x,z,groundH(x,z)+0.35,w*0.8]);}
    ribbon(brook,4,brookM,0);
    mist(F[0]+ox*6,F[2],F[1]+oz*6,12+f.drop*0.08,6);
  });
  // spray off the fall across the river
  {const fx=V.fallX,r=V.river.reduce((b,q)=>Math.abs(q[0]-fx)<Math.abs(b[0]-fx)?q:b,V.river[0]);mist(r[0]-6,r[2]-4,r[1],10,5);}

  animHooks.push(now=>{
    const t=now/1000;U.uT.value=t;
    const nf=nightF();U.uLight.value=1-0.78*nf;U.uSky.value.setRGB(0.72-0.6*nf,0.8-0.62*nf,0.86-0.6*nf);
    for(const m of mists){const k=Math.sin(t*0.7+m.ph);m.sp.position.y=m.y+k*1.5+((t*2+m.ph*3)%6);
      m.sp.material.opacity=0.45;m.sp.scale.setScalar(m.s*(1+0.12*k));}
  });
  ctx.details=Object.assign(ctx.details||{},{falls:V.falls.length});
}
