// ---------- the stone of Arrakeen ----------
// Fan work. One material for everything built of it - the town, the wall, the works, the Residency - and one
// way of building: the battered mass, a box whose walls lean in so the wind goes over it and the sand does not
// lodge, standing a little into the ground. The material draws the pours, the streaks the weather has left
// down every face, and the slits that are all the windows anybody has here; at night some of the slits are
// lit, yellow, white and blue (the book's colours for the city through the haze).
//
// stoneKit(api) gives each caller its own geometry to add masses to (finish() puts it in the scene) over
// the one shared material.
let SHARED=null;
export function stoneKit(api){
  const {THREE,scene,animHooks,groundH}=api;
  if(!SHARED){
    const U={uNight:{value:0}};
    const COMMON=`float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return 0.5*n2(p)+0.25*n2(p*2.03+7.1)+0.125*n2(p*4.1+3.3);}
`;
    const stone=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true});
    stone.extensions={derivatives:true};
    stone.onBeforeCompile=sh=>{
      Object.assign(sh.uniforms,U);
      sh.vertexShader='varying vec3 vWP;varying vec3 vWN;\n'+sh.vertexShader.replace('#include <fog_vertex>',
        '#include <fog_vertex>\n vWP=(modelMatrix*vec4(transformed,1.0)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
      sh.fragmentShader='varying vec3 vWP;varying vec3 vWN;uniform float uNight;\n'+COMMON+sh.fragmentShader
        .replace('#include <color_fragment>',`#include <color_fragment>
   vec3 nrm=normalize(vWN);float wall=1.0-smoothstep(0.5,0.8,abs(nrm.y));
   vec2 tng=normalize(vec2(-nrm.z,nrm.x)+1e-5);float u=dot(vWP.xz,tng);float fw=length(fwidth(vWP));
   // the pours: a line every metre and a half, and a darker lift now and then
   float pour=1.0-smoothstep(0.0,0.06+fw,abs(fract(vWP.y/1.5)-0.5)*1.5-0.7);
   diffuseColor.rgb*=1.0-0.07*pour*wall*(1.0-smoothstep(0.3,1.5,fw));
   // the weathering: streaks down from every ledge
   float streak=smoothstep(0.45,0.85,fb(vec2(u*0.35,vWP.y*0.03)));
   diffuseColor.rgb*=1.0-0.18*streak*wall;
   diffuseColor.rgb*=0.93+0.1*fb(vWP.xz*0.08+vWP.y*0.05);
   // the slits: narrow and tall, in rows by storey, only on walls, not all of them open
   float cellU=floor(u/6.5),cellY=floor(vWP.y/4.6),su=fract(u/6.5),sy=fract(vWP.y/4.6);
   // (few of them, grouped two storeys tall, and gone at a distance, where they would only speckle the wall)
   float cellU2=floor(u/13.0),open=step(0.72,h1(vec2(cellU2,floor(vWP.y/9.2))));
   float slit=wall*open*(1.0-smoothstep(0.03,0.03+fw/6.5,abs(su-0.5)))*step(0.15,sy)*step(sy,0.9)*(1.0-smoothstep(0.25,0.6,fw));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.06,0.05,0.04),slit);
   float lit=wall*open*(1.0-smoothstep(0.03,0.03+fw/6.5,abs(su-0.5)))*step(0.15,sy)*step(sy,0.9)*step(0.45,h1(vec2(cellU+13.0,cellY)));   // lit ones show from anywhere
   vec3 lc=h1(vec2(cellU,cellY+7.0))<0.6?vec3(1.0,0.78,0.42):(h1(vec2(cellU+3.0,cellY))<0.5?vec3(0.95,0.95,0.9):vec3(0.55,0.72,1.0));`)
        .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=lc*lit*uNight*1.4;');
    };
    stone.customProgramCacheKey=()=>'arrakeen-stone';
    animHooks.push(()=>{U.uNight.value=api.nightF?api.nightF(api.hour()):0;});
    SHARED={U,stone,COMMON};
  }
  const {U,stone,COMMON}=SHARED;
  // ---- a battered mass: a box whose walls lean in by `bat` of the height, standing a little into the ground
  const pos=[],nor=[],col=[];const tmpN=new THREE.Vector3(),va=new THREE.Vector3(),vb=new THREE.Vector3();
  const tri=(a,b,c,rgb)=>{va.subVectors(b,a);vb.subVectors(c,a);tmpN.crossVectors(va,vb).normalize();
    for(const v of [a,b,c]){pos.push(v.x,v.y,v.z);nor.push(tmpN.x,tmpN.y,tmpN.z);col.push(rgb[0],rgb[1],rgb[2]);}};
  const quad=(a,b,c,d,rgb)=>{tri(a,b,c,rgb);tri(a,c,d,rgb);};
  function mass(x,z,w,d,rot,h,bat,rgb,y0,topRgb){
    const g=y0===undefined?groundH(x,z):y0,c=Math.cos(rot),s=Math.sin(rot),inset=Math.min(w,d)*0.45*Math.min(1,bat*h/Math.min(w,d)*2.2);
    const P=(u,v,y)=>new THREE.Vector3(x+c*u-s*v,y,z+s*u+c*v);
    const b=[P(-w/2,-d/2,g-3),P(w/2,-d/2,g-3),P(w/2,d/2,g-3),P(-w/2,d/2,g-3)];
    const tw=w/2-inset,td=d/2-inset,t=[P(-tw,-td,g+h),P(tw,-td,g+h),P(tw,td,g+h),P(-tw,td,g+h)];
    for(let i=0;i<4;i++){const j=(i+1)%4;quad(b[j],b[i],t[i],t[j],rgb);}
    quad(t[0],t[3],t[2],t[1],topRgb||rgb);
    return {top:g+h,tw,td,P};
  }
  function finish(name){
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeBoundingSphere();
    const m=new THREE.Mesh(geo,stone);m.castShadow=true;m.receiveShadow=true;m.userData.wireCat='building';m.name=name;scene.add(m);return m;}
  return {U,stone,COMMON,mass,quad,tri,finish};
}
