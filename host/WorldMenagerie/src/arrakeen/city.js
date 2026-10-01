// ---------- Arrakeen, built ----------
// Fan work; Dune belongs to the Herbert estate and every shape here is this project's own.
//
// The look is brutalist, for the reason the films' designer gave: a colonial power showing its force, in
// the heaviest material it has. So the town is masses rather than houses - thick walls that lean inward
// (battered, so the wind goes over them and the sand does not lodge), flat roofs, no windows but slits and
// light wells, because the whole point of a wall here is to keep the sun out and the cool in. Stepped and
// sloped like a ziggurat where it is big, weathered where the sand has been at it, and at night the slits
// glow yellow, white and blue, as the book has them through the haze.
//
// The plan is data/cities/arrakeen-city.json (tools/make-arrakeen.py). Everything is merged into a few
// meshes: one for the stone of the town, one for the rock, and instances for the windtraps, collectors and
// market canopies.
import { mkRng } from '../core/rng.js';
import { stoneKit } from './stone.js';

export function city(api){
  const {THREE,ctx,scene,animHooks,groundH}=api;
  const P=ctx.arrakeenCity;if(!P)return;
  const R=mkRng(10191);

  // the stone and the way a mass is built are src/arrakeen/stone.js's, shared with the Residency
  const ST=stoneKit(api),{U,stone,mass,quad,tri}=ST;
  const va=new THREE.Vector3(),vb=new THREE.Vector3(),tmpN=new THREE.Vector3();
  const COMMON=ST.COMMON;
  const SAND=[[0.74,0.61,0.45],[0.69,0.57,0.43],[0.78,0.65,0.48],[0.64,0.54,0.41],[0.72,0.58,0.42]];
  const pick=a=>a[Math.floor(R()*a.length)];
  const traps=[],collectors=[];

  // ---- the town ----
  for(const [x,z,w,d,a,h,court,nt] of P.blocks){
    const rgb=pick(SAND),m=mass(x,z,w,d,a,h,0.12,rgb);
    if(court){const cw=m.tw*0.45,cd=m.td*0.45;const q=(u,v)=>m.P(u,v,m.top+0.05);quad(q(-cw,-cd),q(-cw,cd),q(cw,cd),q(cw,-cd),[0.22,0.18,0.14]);}
    // a parapet lip on the street side, and the roof's clutter: windtraps and dew collectors
    for(let k=0;k<nt;k++){const [px,,pz]=m.P((R()-0.5)*m.tw*1.2,(R()-0.5)*m.td*1.2,0).toArray();traps.push([px,m.top,pz,-0.5+(R()-0.5)*0.3,0.8+R()*0.5]);}
    const nc=Math.floor(R()*4);for(let k=0;k<nc;k++){const e=R()<0.5?-1:1,[px,,pz]=m.P(e*m.tw*0.9,(R()-0.5)*m.td*1.6,0).toArray();collectors.push([px,m.top,pz]);}
  }
  // ---- the city wall and its towers: the heaviest batter of all, and slits for the watch ----
  for(const [a0,a1,r,th,h] of P.walls){const am=(a0+a1)/2,L=(a1-a0)*r*1.02;mass(Math.cos(am)*r,Math.sin(am)*r,L,th,am+Math.PI/2,h,0.3,[0.64,0.53,0.40]);}
  for(const [x,z,w,d,a,h] of P.towers){const m=mass(x,z,w,d,a,h,0.18,[0.60,0.50,0.38]);mass(x,z,m.tw*1.5,m.td*1.5,a,5,0.05,[0.56,0.46,0.35],m.top);}
  // the gates: a lintel of stone across each gap, high enough for a harvester to pass under
  for(const g of P.gates){const r=1500;mass(Math.cos(g)*r,Math.sin(g)*r,30,110,g,10,0.02,[0.58,0.48,0.36],groundH(Math.cos(g)*r,Math.sin(g)*r)+34);}
  // ---- the cisterns: a vault inside a wall of its own ----
  for(const [x,z,w,d,a,h] of P.cisterns){mass(x,z,w,d,a,h,0.25,[0.58,0.50,0.40]);
    for(const [u,v,ww,dd] of [[0,d/2+12,w+30,6],[0,-d/2-12,w+30,6],[w/2+12,0,6,d+30],[-w/2-12,0,6,d+30]]){const c=Math.cos(a),s=Math.sin(a);mass(x+c*u-s*v,z+s*u+c*v,ww,dd,a,22,0.08,[0.55,0.46,0.36]);}}
  // ---- the water market: a hall, stepped ----
  for(const [x,z,w,d,a,h] of P.market){const m=mass(x,z,w,d,a,h,0.1,[0.70,0.60,0.46]);mass(x,z,m.tw*1.2,m.td*1.2,a,6,0.2,[0.66,0.56,0.43],m.top);}
  // ---- the landing field: the control tower, sloped like everything, and the hangars ----
  for(const [x,z,w,d,a,h,kind] of P.field){
    if(kind==='control'){const m=mass(x,z,w,d,a,h,0.28,[0.58,0.52,0.44]);mass(x,z,m.tw*2.4,m.td*2.4,a,14,-0.2,[0.30,0.30,0.30],m.top);}
    else{const m=mass(x,z,w,d,a,h,0.35,[0.62,0.56,0.47]);const c=Math.cos(a),s=Math.sin(a),dz=d/2+0.2;   // the door: a dark slot across the whole front
      const g=groundH(x,z),Pd=(u,y)=>new THREE.Vector3(x+c*u-s*dz,y,z+s*u+c*dz);quad(Pd(-w*0.4,g),Pd(w*0.4,g),Pd(w*0.35,g+h*0.6),Pd(-w*0.35,g+h*0.6),[0.08,0.07,0.06]);}}
  // ---- out on the basin: the windtrap huts and their masts ----
  for(const [x,z,w,d,a,h] of P.huts){const m=mass(x,z,w,d,a,h,0.2,pick(SAND));traps.push([x,m.top,z,-0.5,1.3]);}
  for(const [x,z,w,d,a,h] of P.masts){const m=mass(x,z,w,d,a,h,0.08,[0.55,0.47,0.37]);traps.push([x,m.top,z,-0.5,1.6]);}
  ST.finish('arrakeen-town');

  // ---- the rock: buttes and fins standing in the ground, in beds, varnished ----
  const rock=new THREE.MeshLambertMaterial({color:0xffffff});
  rock.onBeforeCompile=sh=>{
    sh.vertexShader='varying vec3 vWP;varying vec3 vWN;\n'+sh.vertexShader.replace('#include <fog_vertex>',
      '#include <fog_vertex>\n vWP=(modelMatrix*vec4(transformed,1.0)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader='varying vec3 vWP;varying vec3 vWN;\n'+COMMON+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 {vec3 nrm=normalize(vWN);float y=vWP.y;vec2 q=vWP.xz;
  float beds=0.5+0.5*sin(y*0.11+2.0*fb(q*0.003))+0.25*sin(y*0.37+1.3);
  vec3 c=mix(vec3(0.55,0.36,0.24),vec3(0.70,0.50,0.34),clamp(beds*0.7,0.0,1.0))*(0.85+0.25*fb(vec2(q.x+q.y,y*0.2)*0.05));
  float steep=1.0-abs(nrm.y);
  c=mix(c,vec3(0.25,0.17,0.13),smoothstep(0.55,0.8,fb(vec2(dot(q,vec2(0.7,0.7))*0.03,y*0.004)))*steep*0.7);
  c=mix(c,vec3(0.78,0.62,0.44),smoothstep(0.7,0.95,nrm.y)*0.6);      // tops are paler: dusted with sand
  diffuseColor.rgb=c;}`);
  };
  rock.customProgramCacheKey=()=>'arrakeen-rock';
  {const rp=[],rn=[];const T=(a,b,c)=>{va.subVectors(b,a);vb.subVectors(c,a);tmpN.crossVectors(va,vb).normalize();for(const v of [a,b,c]){rp.push(v.x,v.y,v.z);rn.push(tmpN.x,tmpN.y,tmpN.z);}};
   const stack=([x,z,w,d,a,h])=>{const n=6+Math.floor(R()*4),g=groundH(x,z)-h*0.6-6,c=Math.cos(a),s=Math.sin(a);
     // a butte: a ring that narrows as it goes up, in two or three benches, like the ground's own terraces
     const tiers=2+Math.floor(R()*2),rings=[];let rw=w/2,rd=d/2,y=g;
     for(let t=0;t<=tiers;t++){const ring=[];for(let i=0;i<n;i++){const aa=i/n*Math.PI*2,j=0.8+R()*0.35;ring.push(new THREE.Vector3(x+c*Math.cos(aa)*rw*j-s*Math.sin(aa)*rd*j,y,z+s*Math.cos(aa)*rw*j+c*Math.sin(aa)*rd*j));}
       rings.push(ring);y+=(h*1.6+6)/tiers*(t<tiers?1:0);if(t<tiers){rw*=0.72+R()*0.15;rd*=0.72+R()*0.15;}}
     for(let t=0;t<tiers;t++){const A=rings[t],B=rings[t+1];for(let i=0;i<n;i++){const j=(i+1)%n;
       // a riser, then (except at the top) a bench: the next ring starts at this one's height, inset
       const top=A.map(v=>v.clone().setY(v.y+(B[0].y-A[0].y)));T(A[i],top[j],A[j]);T(A[i],top[i],top[j]);
       T(top[i],B[j],top[j]);T(top[i],B[i],B[j]);}}
     const L=rings[tiers],cN=L.reduce((v,p)=>v.add(p),new THREE.Vector3()).divideScalar(n);
     for(let i=0;i<n;i++)T(cN,L[(i+1)%n],L[i]);};
   for(const c of P.crags)stack(c);for(const c of P.sietch)stack(c);
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(rn,3));geo.computeBoundingSphere();
   const m=new THREE.Mesh(geo,rock);m.castShadow=true;m.receiveShadow=true;m.userData.wireCat='ground';scene.add(m);}

  // ---- the windtraps: a ribbed stack with vanes, all facing the one wind; and the dew collectors ----
  const metal=new THREE.MeshPhongMaterial({color:0x8d877c,specular:0x6a655c,shininess:26,flatShading:true});
  {const parts=[];const add=(g)=>parts.push(g);
   add(new THREE.CylinderGeometry(0.9,1.3,6,8).translate(0,3,0));
   for(let k=0;k<6;k++){const g=new THREE.BoxGeometry(0.18,5,1.1).translate(0,3.2,1.25);g.rotateY(k/6*Math.PI*2);add(g);}
   add(new THREE.CylinderGeometry(1.6,1.0,1.2,8).translate(0,6.4,0));
   add(new THREE.BoxGeometry(3.4,2.2,0.4).translate(0,7.6,1.2));                      // the scoop, into the wind
   const merged=mergeGeos(THREE,parts);
   const im=new THREE.InstancedMesh(merged,metal,traps.length),o=new THREE.Object3D();
   traps.forEach(([x,y,z,a,s],i)=>{o.position.set(x,y-0.3,z);o.rotation.set(0,a,0);o.scale.setScalar(s);o.updateMatrix();im.setMatrixAt(i,o.matrix);});
   im.castShadow=true;im.receiveShadow=true;scene.add(im);}
  {const im=new THREE.InstancedMesh(new THREE.ConeGeometry(0.6,1.6,6).translate(0,0.8,0),new THREE.MeshPhongMaterial({color:0xb8bcc0,specular:0xffffff,shininess:90,flatShading:true}),collectors.length),o=new THREE.Object3D();
   collectors.forEach(([x,y,z],i)=>{o.position.set(x,y,z);o.updateMatrix();im.setMatrixAt(i,o.matrix);});scene.add(im);}
  // ---- the market canopies ----
  {const CAN=[0xb9a077,0x9c8a6a,0xa8916d,0xc2ab84,0x8d7c60,0x8a4a2a,0x5a6a7a];
   const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,0.12,1),new THREE.MeshLambertMaterial({color:0xffffff}),P.stalls.length),o=new THREE.Object3D(),cc=new THREE.Color();
   P.stalls.forEach(([x,z,w,d,a,h],i)=>{o.position.set(x,groundH(x,z)+h,z);o.rotation.set(0.08,a,0);o.scale.set(w,1,d);o.updateMatrix();im.setMatrixAt(i,o.matrix);im.setColorAt(i,cc.setHex(CAN[i%CAN.length]));});
   im.instanceColor.needsUpdate=true;im.castShadow=true;scene.add(im);}

  ctx.details=Object.assign(ctx.details||{},{blocks:P.blocks.length,windtraps:traps.length,collectors:collectors.length,crags:P.crags.length});
}

function mergeGeos(THREE,list){
  const pos=[],nor=[];
  for(const g0 of list){const g=g0.index?g0.toNonIndexed():g0;g.computeVertexNormals();pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return g;
}
