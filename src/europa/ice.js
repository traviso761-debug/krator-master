// ---------- the ice ----------
// Original work; the geology is Europa's, from what the Galileo images show.
//
// The engine colours its ground by height and slope, which on Europa gives a white sheet. What the surface
// actually looks like, from the images:
//
//   the plains      bright, a little blue in the shadows, and scored everywhere by fine cracks running in
//                   families at every angle - the ridged plains are ridges on every scale down to metres
//   lineae          the long cracks, stained reddish-brown along both sides for a few hundred metres
//   chaos           rafts of the old plains, broken off, turned, tilted and frozen back into a darker,
//                   browner matrix of rubble
//   fresh frost     round anything venting: what goes up comes down as a new white skin
//
// The ground shader draws the plains, the stains, the chaos matrix, the frost and the station's aprons from
// the features themselves (data/cities/europa-ice.json, written by tools/make-europa.py), so their edges are
// sharp at any distance. The rafts are slabs built here. And the light is Europa's: the sun a hard white
// point, a twenty-fifth as bright as at Earth but with nothing to scatter it, so shadows are black except
// where Jupiter fills them.
//
// What vents - the bore, the stacks round the station - is here too, because in a vacuum a plume is nothing
// like smoke: every grain leaves the vent on its own ballistic arc, rises until the moon's weak gravity
// (1.31 m/s², an eighth of Earth's) turns it, and falls back as frost. No billowing, no drift, no cloud: a
// fountain with a sharp umbrella top and a sharp edge where it lands.
import { mkRng } from '../core/rng.js';
import { G, createGrains, jet } from './grains.js';

export function ice(api){
  const {THREE,C,ctx,scene,animHooks,groundH,sun,ambient,hemi,mergeParts,ENV}=api;
  const I=ctx.europaIce;if(!I)return;
  const R=mkRng(1610);

  // ---- the ground ----
  const vec3s=(list,n)=>{const a=[];for(let i=0;i<n;i++){const v=list[i]||[0,0,-1];a.push(new THREE.Vector3(v[0],v[1],v[2]));}return a;};
  const U={
    uLin:{value:vec3s(I.lineae,4)},uNLin:{value:I.lineae.length},        // angle, offset, width
    uApr:{value:vec3s(I.aprons,4)},uNApr:{value:I.aprons.length},        // x, z, radius
    uChaos:{value:new THREE.Vector3(...I.sites.chaos)},
    uFrost:{value:new THREE.Vector3(I.sites.bore[0],I.sites.bore[1],520)},
  };
  const NOISE=`float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return 0.5*n2(p)+0.25*n2(p*2.03+7.1)+0.125*n2(p*4.1+3.3)+0.0625*n2(p*8.3+1.7);}
// one family of cracks: lines across direction a, sp apart, wandering, w wide, some broken off
float cracks(vec2 q,float a,float sp,float w,float fw,float seed){
  vec2 d=vec2(cos(a),sin(a));float s=dot(q,d)/sp+0.6*fb(q*0.004+seed)+seed;
  float cell=floor(s),on=step(0.35,h1(vec2(cell,seed)))*smoothstep(0.3,0.6,fb(vec2(dot(q,vec2(-d.y,d.x))*0.0015,cell)));
  float dist=abs(fract(s)-0.5)*sp,aa=max(fw,0.001);
  return on*(1.0-smoothstep(w*0.5,w*0.5+aa,dist))*(1.0-smoothstep(0.5*sp*0.05,sp*0.3,aa));}
`;
  const ICEFN=`
vec3 iceAt(vec2 q,float fw,float slope){
  // the plains: white with a cold blue cast, mottled at a kilometre and grained at a few metres
  float m=fb(q*0.0011),g=fb(q*0.06);
  vec3 c=mix(vec3(0.80,0.85,0.90),vec3(0.90,0.91,0.90),m);
  c=mix(c,c*vec3(0.95,0.93,0.90),smoothstep(0.55,0.8,fb(q*0.0003+4.0)));     // faint tan patches, a few km across
  c*=0.93+0.1*g;
  // the fine ridges and cracks: three families at their own angles and spacings, and a finer set under them
  float k=0.0;
  k=max(k,cracks(q,0.42,190.0,2.4,fw,1.3));
  k=max(k,cracks(q,-1.15,260.0,2.0,fw,2.7)*0.9);
  k=max(k,cracks(q,2.05,140.0,1.6,fw,4.1)*0.8);
  k=max(k,cracks(q,0.95,55.0,0.7,fw,6.2)*0.55);
  k=max(k,cracks(q,-0.5,70.0,0.8,fw,8.3)*0.5);
  c=mix(c,vec3(0.63,0.60,0.58),k*0.55);
  // the lineae: a dark crack down the middle, and the reddish-brown stain either side, mottled and ragged
  for(int i=0;i<4;i++){if(i>=uNLin)break;vec3 L=uLin[i];
    float d=abs(-q.x*sin(L.x)+q.y*cos(L.x)-L.y),rag=0.65+0.7*fb(q*0.006+float(i)*9.0);
    float st=1.0-smoothstep(L.z*0.25*rag,L.z*1.15*rag,d);
    c=mix(c,vec3(0.60,0.43,0.30)*(0.85+0.3*fb(q*0.03)),st*0.78);
    c=mix(c,vec3(0.36,0.28,0.22),(1.0-smoothstep(1.5,4.0+fw,d))*0.8);}
  // the chaos: the matrix between the rafts is darker and browner, rubble frozen in dirty ice
  {float d=length((q-uChaos.xy)*vec2(0.8,1.0));float ch=1.0-smoothstep(uChaos.z*0.55,uChaos.z,d);
   vec3 mat=mix(vec3(0.55,0.47,0.41),vec3(0.70,0.66,0.62),fb(q*0.02));
   c=mix(c,mat*(0.85+0.2*n2(q*0.4)),ch*0.8);}
  // fresh frost round the bore: what goes up the plume comes down as a new white skin, brightest near the hole
  {float d=length(q-uFrost.xy);float fr=1.0-smoothstep(uFrost.z*0.35,uFrost.z,d+60.0*fb(q*0.01));
   c=mix(c,vec3(0.95,0.97,1.0),fr*0.8);}
  // the aprons: sintered ice, graded flat, grey, with the rings they were rolled in and the dust of the traffic
  for(int i=0;i<4;i++){if(i>=uNApr)break;vec3 A=uApr[i];
    float d=length(q-A.xy),e=1.0-smoothstep(A.z-2.0-fw,A.z+fw,d);
    vec3 s=vec3(0.64,0.69,0.73)*(0.97+0.03*smoothstep(0.6,1.0,abs(sin(d*0.08))))*(0.95+0.08*n2(q*0.3));
    c=mix(c,s,e);
    c=mix(c,c*0.9,(1.0-smoothstep(A.z,A.z*1.35,d))*(1.0-e)*0.6);}              // the scuffed skirt round it
  // the flanks of steep ground are the fresh fracture faces: bluer, a little darker
  c=mix(c,c*vec3(0.84,0.9,1.0),smoothstep(0.12,0.45,slope));
  return c;}
`;
  const mat=new THREE.MeshLambertMaterial({color:0xffffff});
  mat.extensions={derivatives:true};
  mat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,U);
    sh.vertexShader='varying vec3 vWP;varying vec3 vWN;\n'+sh.vertexShader.replace('#include <fog_vertex>',
      '#include <fog_vertex>\n vWP=(modelMatrix*vec4(transformed,1.0)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader=`varying vec3 vWP;varying vec3 vWN;uniform vec3 uLin[4];uniform int uNLin;uniform vec3 uApr[4];uniform int uNApr;uniform vec3 uChaos;uniform vec3 uFrost;
`+NOISE+ICEFN+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 {vec2 q=vWP.xz;float fw=length(fwidth(q));float slope=1.0-clamp(normalize(vWN).y,0.0,1.0);
  diffuseColor.rgb=iceAt(q,fw,slope);}`);
  };
  mat.customProgramCacheKey=()=>'europa-ice';
  let nT=0;scene.traverse(o=>{if(o.isMesh&&o.name==='terrain'){o.material=mat;if(o.geometry.attributes.color)o.geometry.deleteAttribute('color');nT++;}});

  // ---- the rafts of the chaos, and the ridges' broken slabs ----
  // Each is an irregular slab: a polygon of 5-8 sides, stood on the matrix and tilted, reaching well below it
  // so that the tilt never lifts an edge off the ground. The top is the old plains surface, cracks and all; the
  // sides are fresh fracture, blue-grey.
  const slabMat=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true});
  slabMat.extensions={derivatives:true};
  slabMat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,U);
    sh.vertexShader='varying vec3 vWP;varying vec3 vWN;\n'+sh.vertexShader.replace('#include <fog_vertex>',
      '#include <fog_vertex>\n vWP=(modelMatrix*vec4(transformed,1.0)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader=`varying vec3 vWP;varying vec3 vWN;uniform vec3 uLin[4];uniform int uNLin;uniform vec3 uApr[4];uniform int uNApr;uniform vec3 uChaos;uniform vec3 uFrost;
`+NOISE+ICEFN+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 {vec2 q=vWP.xz;float fw=length(fwidth(q));float up=clamp(normalize(vWN).y,0.0,1.0);
  vec3 top=iceAt(q+vec2(3100.0,-1700.0),fw,0.0);            // the old plains, from somewhere else
  vec3 side=vec3(0.66,0.74,0.82)*(0.85+0.2*fb(vec2(q.x+q.y,vWP.y*3.0)*0.2));
  diffuseColor.rgb=mix(side,top,smoothstep(0.55,0.8,up))*vColor;}`);
  };
  slabMat.customProgramCacheKey=()=>'europa-slab';
  function slabs(list,deep){
    const pos=[],nor=[],col=[];const P=new THREE.Vector3(),N=new THREE.Vector3(),M=new THREE.Matrix4(),E=new THREE.Euler(),Q=new THREE.Quaternion(),S=new THREE.Vector3(1,1,1),NM=new THREE.Matrix3();
    for(const [x,z,w,d,rot,h,tx,tz,sides] of list){
      const n=sides,ring=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2+(R()-0.5)*0.5,r=0.78+R()*0.3;ring.push([Math.cos(a)*w/2*r,Math.sin(a)*d/2*r]);}
      const g=groundH(x,z),top=h,bot=-h*deep-8;
      E.set(tx,rot,tz,'YXZ');Q.setFromEuler(E);P.set(x,g,z);M.compose(P,Q,S);NM.getNormalMatrix(M);
      const tint=0.92+R()*0.12;
      const V=(u,y,v)=>new THREE.Vector3(u,y,v).applyMatrix4(M);
      const push=(a,b,c,nx,ny,nz)=>{N.set(nx,ny,nz).applyMatrix3(NM).normalize();for(const v of [a,b,c]){pos.push(v.x,v.y,v.z);nor.push(N.x,N.y,N.z);col.push(tint,tint,tint);}};
      // the top: a fan from the middle
      const c0=V(0,top,0);
      for(let i=0;i<n;i++){const [u0,v0]=ring[i],[u1,v1]=ring[(i+1)%n];push(c0,V(u1,top,v1),V(u0,top,v0),0,1,0);}
      // the sides
      for(let i=0;i<n;i++){const [u0,v0]=ring[i],[u1,v1]=ring[(i+1)%n];const nx=v1-v0,nz=-(u1-u0),l=Math.hypot(nx,nz)||1;
        const a=V(u0,top,v0),b=V(u1,top,v1),c=V(u1,bot,v1),e=V(u0,bot,v0);
        push(a,b,c,nx/l,0,nz/l);push(a,c,e,nx/l,0,nz/l);}
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    const m=new THREE.Mesh(geo,slabMat);m.castShadow=true;m.receiveShadow=true;m.userData.wireCat='ground';scene.add(m);return m;
  }
  slabs(I.rafts,1.2);slabs(I.shards,0.8);

  // the rubble between the rafts: broken ice, from a car's size to a house's
  {const n=I.rubble.length,m=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),n);
   const o=new THREE.Object3D(),c=new THREE.Color();
   I.rubble.forEach(([x,z,s,a],i)=>{o.position.set(x,groundH(x,z)-s*0.15,z);o.rotation.set(R()*3,a,R()*3);o.scale.set(s*(0.8+R()*0.6),s*(0.4+R()*0.5),s*(0.8+R()*0.6));o.updateMatrix();
     m.setMatrixAt(i,o.matrix);{const v=0.64+R()*0.24;m.setColorAt(i,c.setRGB(v,v+0.03,v+0.07));}});
   m.instanceColor.needsUpdate=true;m.castShadow=true;m.receiveShadow=true;m.userData.wireCat='ground';scene.add(m);}

  // ---- the light ----
  // A white sun, hard, and no sky light at all: the engine's sky and ambient are for a world with air. The fill
  // comes from below - the ice sends two thirds of the sunlight back up, so a wall facing away from the sun is
  // lit from the ground, and at night nothing is - and from Jupiter (sky.js).
  const sunUp=()=>Math.max(0,Math.min(1,ENV.izSunDir.value.y*5));
  // No air also means the sun is not dimmed near the horizon: it is as bright at five degrees up as at noon,
  // and then it is gone.
  animHooks.push(()=>{const u=sunUp(),y=ENV.izSunDir.value.y;sun.color.setRGB(1,0.99,0.97);sun.intensity=1.15*Math.max(0,Math.min(1,(y+0.005)*60));
    hemi.color.setRGB(0.02,0.025,0.035);hemi.groundColor.setRGB(0.62,0.68,0.74);hemi.intensity=0.08+0.62*u;
    ambient.intensity=0.05+0.06*u;});

  // ---- plumes ----
  // Every grain is its own projectile (src/europa/grains.js): v up, a little sideways, g down, until it lands.
  // The bore's plume is the tall one; the vents round the station are low jets. The events can make the bore
  // surge (ctx.europaPlume.surge).
  const bore={x:I.sites.bore[0],y:groundH(I.sites.bore[0],I.sites.bore[1])+6,z:I.sites.bore[1],v0:24,v1:34,side:2.4,rate:150};
  const vents=(ctx.europaVents||[]).map(([x,y,z])=>({x,y,z,v0:5,v1:9,side:1.2,rate:10}));
  const cap=(js,k)=>js.reduce((s,j)=>s+Math.ceil(j.rate*k*(2*j.v1*1.6/G)),0);
  const plumeS=createGrains(api,{max:cap([bore],2.2),size:3.2}),ventS=vents.length?createGrains(api,{max:cap(vents,1.1),size:1.4}):null;
  const runs=[[plumeS,[bore]],[ventS,vents]].filter(r=>r[0]);
  // start them full: a plume that has been running for months, not one that switched on as you arrived
  for(const [S,js] of runs)for(const j of js)for(let k=0,n=Math.floor(j.rate*2*j.v1/G);k<n;k++){const i=jet(S,R,j);S.advance(i,R()*2*S.vy(i)/G);}
  const surge={k:1,until:0};
  let last=performance.now();const acc=new Map();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const boost=now<surge.until?surge.k:1;
    for(const [S,js] of runs)for(const j of js){const b=j===bore?boost:1;let a=(acc.get(j)||0)+j.rate*b*dt;
      const jj=b>1?Object.assign({},j,{v0:j.v0*Math.sqrt(b),v1:j.v1*Math.sqrt(b)}):j;
      while(a>=1){a-=1;jet(S,R,jj);}acc.set(j,a);}});
  ctx.europaPlume={bore,surge:(k,sec)=>{surge.k=k;surge.until=performance.now()+sec*1000;}};
  const N=plumeS.count()+(ventS?ventS.count():0);

  ctx.details=Object.assign(ctx.details||{},{rafts:I.rafts.length,rubble:I.rubble.length,ridgeSlabs:I.shards.length,plumeGrains:N,iceTiles:nT});
}
