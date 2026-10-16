// The Olympic Peninsula's land: what grows on it, the water over it and the weather on it. An extra, run once the
// engine has built the ground, the sea, the lakes, the roads and the landmarks. It reads ctx.olLand, the file
// tools/make-olympic.py writes beside the map. Adapted from Yellowstone's (src/yellowstone/nature.js), whose
// forest tiles, ground surfaces and clouds are the same machinery on a different country:
//
//   the ground's colour   recoloured from the land cover grid: conifer forest, the rainforest's valley floors,
//                         subalpine meadow, farmland, rock, snow and glacier, the timber blocks each at its age
//                         (fresh clearcut, young plantation, closed forest), beach and wetland
//   the forest            grown in tiles round the camera: Douglas-fir and western hemlock most places; on the
//                         rainforest floors Sitka spruce sixty and seventy metres tall and bigleaf maples, round and
//                         light; subalpine fir in spires near the treeline; red alder along the rivers and on the
//                         edges; and the timber, nothing on a fresh cut, a carpet of young firs, or the closed crop
//   the rivers            OpenStreetMap's rivers and named streams, as ribbons, a width each
//   the coast             the surf, a band of white along the Pacific shore that comes and goes with the swell (less
//                         on the Strait), and the sea stacks off it: rock columns with their hats of trees
//   the clouds            the marine layer's low heaps over the coast and the range, and their shadows
//   the boundary          the park's edge, faintly
import { hash3, mkRng } from '../core/rng.js';

export function nature(api){
  const {THREE,ctx,C,scene,camera,renderer,animHooks,inWater,roadsNear,nightF,hour,B,groundH}=api;
  const land=ctx.olLand;if(!land){api.report('nature',new Error('no land file'));return;}
  const Y=C.olympic||{};
  const col=h=>new THREE.Color(h);
  const lightNow=()=>0.3+0.7*(1-nightF(hour()));
  const unrle=(rle,n)=>{const a=new Uint8Array(n);let k=0;for(let i=0;i<rle.length;i+=2){a.fill(rle[i],k,k+rle[i+1]);k+=rle[i+1];}return a;};

  // ---- the land cover grid, and the timber's ages ----
  const cv=land.cover,CN=cv.nx*cv.nz,COVER=unrle(cv.rle,CN),AGE=unrle(land.age.rle,CN);
  const terr=[];scene.traverse(o=>{if(o.isMesh&&o.name==='terrain')terr.push(o);});
  const X0=B.x0,Z0=B.z0,ST=cv.step;
  const cellAt=(x,z)=>{const i=Math.round((x-X0)/ST),j=Math.round((z-Z0)/ST);if(i<0||j<0||i>=cv.nx||j>=cv.nz)return -1;return j*cv.nx+i;};
  const coverAt=(x,z)=>{const k=cellAt(x,z);return k<0?7:COVER[k];};
  const ageAt=(x,z)=>{const k=cellAt(x,z);return k<0?2:AGE[k];};
  ctx.coverAt=coverAt;
  // a timber block's age, to the block (the grid cell is 200 m and the blocks are cut along their own edges): the
  // cell's own age, unless a neighbour's is the block's and the block's edge is nearer
  const TB=600,blockAge=(x,z)=>{const n=(u,v,s)=>{const i=Math.floor(u),j=Math.floor(v),f=u-i,g=v-j,F=f*f*(3-2*f),G=g*g*(3-2*g),h=(a,b)=>{const t=Math.sin(a*127.1+b*311.7+s*74.7)*43758.5453;return t-Math.floor(t);};
      return (h(i,j)*(1-F)+h(i+1,j)*F)*(1-G)+(h(i,j+1)*(1-F)+h(i+1,j+1)*F)*G;};
    const jx=(n(x/900,z/900,41)-0.5)*TB*0.6,jz=(n(x/900,z/900,43)-0.5)*TB*0.6,bi=Math.floor((x+jx+3e5)/TB),bj=Math.floor((z+jz+3e5)/TB),t=Math.sin(bi*127.1+bj*311.7+7*74.7)*43758.5453,r=t-Math.floor(t);
    return r<0.16?0:r<0.48?1:2;};   // the same blocks as tools/make-olympic.py, at full resolution

  // ---- the ground's colour ----
  const PAL={forest:[col('#24402a'),col('#2c4a2e'),col('#1e3824')],rain:[col('#3a5a2a'),col('#466a30'),col('#33502a')],meadow:[col('#7c8a4e'),col('#8a9050'),col('#9a9a62')],
    farm:[col('#8a9a52'),col('#a0a060'),col('#7a8a48')],rock:[col('#76726a'),col('#8a857c'),col('#5e5a54')],snow:col('#f0f3f6'),ice:col('#cfe0ea'),
    fresh:[col('#7a6448'),col('#8a7454'),col('#6a5840')],young:[col('#5a8a3a'),col('#6a9440'),col('#4e7c36')],closed:[col('#2a4a2e'),col('#30502e'),col('#264428')],
    beach:[col('#b8ac90'),col('#a89c80'),col('#c8bca0')],wet:[col('#5a6e46'),col('#6a7a4e')],town:col('#7a7a70')};
  const cc=new THREE.Color(),tmp=new THREE.Color();
  const mix3=(arr,t,u)=>cc.copy(arr[0]).lerp(arr[1],t).lerp(arr[2]||arr[0],u*0.6);
  function colourAt(x,y,z,ny){
    const slope=Math.sqrt(Math.max(0,1-ny*ny))/Math.max(0.05,ny),cov=coverAt(x,z),h1=hash3(Math.round(x/200),Math.round(z/200),3),h2=hash3(Math.round(x/600),Math.round(z/600),5);
    switch(cov){
      case 1:mix3(PAL.rain,h1,h2);break;
      case 2:mix3(PAL.meadow,h1,h2);break;
      case 3:mix3(PAL.farm,h1,h2);break;
      case 4:mix3(PAL.rock,h1,h2);break;
      case 5:cc.copy(PAL.snow).lerp(PAL.ice,h1*0.5);break;
      case 6:{const a=blockAge(x,z);mix3(a===0?PAL.fresh:a===1?PAL.young:PAL.closed,h1,h2);break;}
      case 7:cc.set('#4a5a50');break;   // under the sea or a lake: what shows is the shore the grid could not place
      case 8:mix3(PAL.beach,h1,0);break;
      case 9:mix3(PAL.wet,h1,0);break;
      default:mix3(PAL.forest,h1,h2);}
    if(cov!==7&&cov!==5&&slope>0.7)cc.lerp(tmp.copy(PAL.rock[0]).lerp(PAL.rock[2],h1),Math.min(1,(slope-0.7)*1.5));
    if(y<3&&cov!==7&&cov!==8&&slope<0.2)cc.lerp(PAL.beach[0],Math.max(0,(3-y)/3)*0.6);   // the strand
    return cc;}
  // what each point is, for the shader: forest, meadow/farm, sand, clearcut; rock, young timber, wetland, snow
  const covW=(x,y,z,ny)=>{const c=coverAt(x,z),slope=Math.sqrt(Math.max(0,1-ny*ny))/Math.max(0.05,ny),A=[0,0,0,0],Bw=[0,0,0,0];
    if(c===5)Bw[3]=255;else if(c===4||slope>0.9)Bw[0]=255;else if(c===0||c===1)A[0]=255;else if(c===2||c===3)A[1]=255;else if(c===8)A[2]=255;
    else if(c===6){const a=blockAge(x,z);if(a===0)A[3]=255;else if(a===1)Bw[1]=255;else A[0]=255;}else if(c===9)Bw[2]=255;else A[1]=255;return [A,Bw];};
  const addCover=g=>{const p=g.attributes.position,n=g.attributes.normal,A=new Uint8Array(p.count*4),Bb=new Uint8Array(p.count*4);
    for(let i=0;i<p.count;i++){const [a,b]=covW(p.getX(i),p.getY(i),p.getZ(i),n.getY(i));A.set(a,i*4);Bb.set(b,i*4);}
    g.setAttribute('aCovA',new THREE.BufferAttribute(A,4,true));g.setAttribute('aCovB',new THREE.BufferAttribute(Bb,4,true));};
  let recoloured=0;
  for(const t of terr){const g=t.geometry,p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color;
    for(let i=0;i<p.count;i++){colourAt(p.getX(i),p.getY(i),p.getZ(i),n.getY(i));c.setXYZ(i,cc.r,cc.g,cc.b);recoloured++;}
    c.needsUpdate=true;addCover(g);t.castShadow=false;}

  // ---- the clouds: the marine layer's heaps, low over the coast and banked against the range ----
  const CL=(()=>{const W=B.x1-B.x0,Dz=B.z1-B.z0,R=mkRng(1938),N=Y.clouds===undefined?160:Y.clouds,S=512;
    const shadow=document.createElement('canvas');shadow.width=shadow.height=S;const sg=shadow.getContext('2d');
    const P=[],SZ=[],HT=[];
    for(let c=0;c<N;c++){const cx=B.x0+R()*W*(R()<0.55?0.45:1),cz=B.z0+R()*Dz,rad=900+R()*R()*2600,base=(Y.cloudBase||1500)*(0.7+R()*0.6),np=14+Math.floor(rad/80);   // more of them over the west, off the Pacific
      for(let q=0;q<np;q++){const a=R()*Math.PI*2,d=Math.sqrt(R())*rad,top=1-d/rad,lift=Math.sqrt(Math.max(0,top))*rad*0.32*(0.3+0.7*R());
        P.push(cx+Math.cos(a)*d*1.3,base+lift,cz+Math.sin(a)*d*0.9);SZ.push(rad*(0.7+0.6*R())*(0.6+top*0.6));HT.push(Math.min(1,lift/(rad*0.4)));}
      for(const [ox,oz] of [[0,0],[S,0],[-S,0],[0,S],[0,-S]]){const u=(cx-B.x0)/W*S+ox,v=(cz-B.z0)/Dz*S+oz,r=rad/W*S*1.1;
        const gr=sg.createRadialGradient(u,v,0,u,v,r);gr.addColorStop(0,'rgba(0,0,0,0.9)');gr.addColorStop(0.6,'rgba(0,0,0,0.55)');gr.addColorStop(1,'rgba(0,0,0,0)');sg.fillStyle=gr;sg.fillRect(u-r,v-r,2*r,2*r);}}
    const shadowT=new THREE.CanvasTexture(shadow);shadowT.wrapS=shadowT.wrapT=THREE.RepeatWrapping;
    const puffT=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=mkRng(88);
      for(let q=0;q<22;q++){const a=r()*6.28,d=r()*30,x=64+Math.cos(a)*d,y=64+Math.sin(a)*d*0.8,rr=18+r()*24,gr=g.createRadialGradient(x,y,0,x,y,rr);
        gr.addColorStop(0,'rgba(255,255,255,0.32)');gr.addColorStop(0.6,'rgba(255,255,255,0.12)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);}return new THREE.CanvasTexture(c);})();
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('aSize',new THREE.Float32BufferAttribute(SZ,1));geo.setAttribute('aTop',new THREE.Float32BufferAttribute(HT,1));
    const U=Object.assign({uMap:{value:puffT},uOff:{value:new THREE.Vector2()},uOrigin:{value:new THREE.Vector2(B.x0,B.z0)},uSpan:{value:new THREE.Vector2(W,Dz)},uScale:{value:600},uLight:{value:1},uTint:{value:new THREE.Color(1,1,1)}},THREE.UniformsLib.fog);
    const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,fog:true,
      vertexShader:`attribute float aSize;attribute float aTop;uniform vec2 uOff;uniform vec2 uOrigin;uniform vec2 uSpan;uniform float uScale;varying float vTop;
#include <fog_pars_vertex>
void main(){vec3 p=position;p.x=uOrigin.x+mod(p.x-uOrigin.x+uOff.x,uSpan.x);p.z=uOrigin.y+mod(p.z-uOrigin.y+uOff.y,uSpan.y);
 vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=clamp(aSize*uScale/-mvPosition.z,0.0,900.0);vTop=aTop;
 #include <fog_vertex>
}`,
      fragmentShader:`uniform sampler2D uMap;uniform float uLight;uniform vec3 uTint;varying float vTop;
#include <fog_pars_fragment>
void main(){vec4 t=texture2D(uMap,gl_PointCoord);float shade=mix(0.62,1.0,clamp(vTop*1.1+0.1,0.0,1.0));
 gl_FragColor=vec4(uTint*shade*uLight,min(1.0,t.a*1.15));if(gl_FragColor.a<0.01)discard;
 #include <fog_fragment>
}`});
    const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.renderOrder=3;pts.name='clouds';pts.userData.noWire=true;pts.userData.noShadow=true;scene.add(pts);
    return {shadowT,U,W,Dz,pts,wind:new THREE.Vector2(Y.cloudWind?Y.cloudWind[0]:11,Y.cloudWind?Y.cloudWind[1]:2)};})();   // the westerlies, off the sea
  const cloudU={uCloud:{value:CL.shadowT},uCloudOff:{value:new THREE.Vector2()},uCloudSpan:{value:new THREE.Vector2(CL.W,CL.Dz)},uCloudOrigin:{value:new THREE.Vector2(B.x0,B.z0)},uCloudK:{value:0.3},uSunXZ:{value:new THREE.Vector2()}};
  animHooks.push(now=>{const t=now/1000,day=1-nightF(hour());CL.U.uOff.value.set(CL.wind.x*t,CL.wind.y*t);cloudU.uCloudOff.value.copy(CL.U.uOff.value);
    CL.U.uLight.value=0.12+0.88*day;cloudU.uCloudK.value=0.34*day;CL.U.uScale.value=renderer.domElement.clientHeight/(2*Math.tan(camera.fov*Math.PI/360));
    const sd=api.sun?api.sun.position.clone().sub(api.sun.target.position).normalize():new THREE.Vector3(0,1,0);const low=1-Math.min(1,Math.max(0,sd.y*2.2));
    CL.U.uTint.value.setRGB(1,1-0.22*low,1-0.42*low);cloudU.uSunXZ.value.set(sd.x,sd.z).multiplyScalar(1/Math.max(0.25,sd.y));});

  // ---- the ground's surface ----
  // Each kind of ground gets a surface of its own close to, let go before it is finer than a pixel: the conifer
  // canopy's crowns and gaps; grass and pasture in drifts; sand with the driftwood line along it; a fresh clearcut's
  // slash and stumps on brown earth, the skid roads across it; rock in strata; young plantation in rows; wetland
  // with standing water; snow and glacier ice, crevassed. The forest's edge is torn by noise. Cloud shadows over all.
  {const m=terr[0].material;m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,cloudU);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aCovA;attribute vec4 aCovB;varying vec4 vCA;varying vec4 vCB;varying vec3 vWp;')
      .replace('#include <project_vertex>','#include <project_vertex>\nvWp=(modelMatrix*vec4(transformed,1.0)).xyz;vCA=aCovA;vCB=aCovB;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec4 vCA;varying vec4 vCB;varying vec3 vWp;
uniform sampler2D uCloud;uniform vec2 uCloudOff;uniform vec2 uCloudSpan;uniform vec2 uCloudOrigin;uniform float uCloudK;uniform vec2 uSunXZ;
float olH(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float olN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(olH(i),olH(i+vec2(1,0)),f.x),mix(olH(i+vec2(0,1)),olH(i+vec2(1,1)),f.x),f.y);}`)
      .replace('#include <color_fragment>',`#include <color_fragment>
{vec2 p=vWp.xz;float w=fwidth(vWp.x)+fwidth(vWp.z);
 float n1=clamp(1.0-w/5.0,0.0,1.0),n2=clamp(1.0-w/30.0,0.0,1.0),n3=clamp(1.0-w/160.0,0.0,1.0);
 vec3 c=diffuseColor.rgb;
 float wF=vCA.x;
 if(wF>0.02&&wF<0.98){vec3 F=vec3(0.14,0.25,0.15)*(0.85+0.3*olN(p/300.0));vec3 O=clamp((c-wF*F)/max(0.08,1.0-wF),0.0,1.0);
   float e=olN(p/110.0)*0.55+olN(p/31.0)*0.3+olN(p/9.0)*0.15;float sharp=smoothstep(0.38,0.62,wF+(e-0.5)*0.8);
   c=mix(c,mix(O,F,sharp),clamp(wF*12.0,0.0,1.0)*clamp((1.0-wF)*12.0,0.0,1.0));wF=sharp;}
 {float crowns=olN(p/8.0)*n2,clumps=olN(p/70.0+13.0)*n3,broad=olN(p/500.0+7.0);
  c*=mix(1.0,0.7+0.48*crowns+0.3*(clumps-0.5)+0.2*(broad-0.5),wF);}
 {float g=olN(p/140.0+5.0);vec3 straw=vec3(0.62,0.6,0.38),lush=vec3(0.4,0.54,0.28);
  vec3 cg=c*(1.0+0.2*(olN(p/3.0)-0.5)*n1+0.14*(olN(p/22.0)-0.5)*n2);cg=mix(cg,mix(lush,straw,g)*(0.9+0.2*olN(p/40.0)),0.2);c=mix(c,cg,vCA.y);}
 // sand: ripples, wet and dark toward the sea, the pale drift line and its logs
 {float rip=olN(vec2(p.x/1.4+olN(p/30.0)*3.0,p.y/6.0))*n1;vec3 cs=c*(0.94+0.1*rip)*(1.0+0.08*(olN(p/25.0)-0.5));
  float logs=smoothstep(0.8,0.86,olN(vec2(p.x/3.0,p.y/22.0)))*n2;cs=mix(cs,vec3(0.72,0.68,0.6),logs*0.7);c=mix(c,cs,vCA.z);}
 // a fresh clearcut: brown earth, grey slash in windrows, stumps, the skid roads
 {float slash=smoothstep(0.55,0.7,olN(vec2(p.x/6.0,p.y/2.5+olN(p/40.0)*4.0)))*n2,stump=smoothstep(0.86,0.9,olN(p/1.6))*n1,skid=1.0-smoothstep(0.0,0.03,abs(olN(p/120.0)-0.5));
  vec3 ck=c*(0.92+0.16*olN(p/9.0));ck=mix(ck,vec3(0.56,0.53,0.48),slash*0.55);ck=mix(ck,vec3(0.34,0.27,0.2),stump*0.8);ck=mix(ck,vec3(0.62,0.56,0.46),skid*0.5*n3);c=mix(c,ck,vCA.w);}
 {vec3 cr=c*(0.84+0.28*olN(vec2(p.x/30.0+p.y/41.0,vWp.y/3.5)))*(1.0+0.15*(olN(p/2.0)-0.5)*n1);c=mix(c,cr,vCB.x);}
 // young plantation: firs in rows, the rows following the hill, brown between
 {float rows=smoothstep(0.35,0.65,sin(p.x*1.6+olN(p/60.0)*12.0)*0.5+0.5)*n1,tufts=olN(p/2.2)*n1;vec3 cy=c*(0.86+0.2*rows+0.12*(tufts-0.5));c=mix(c,cy,vCB.y);}
 {float pool=smoothstep(0.7,0.76,olN(p/20.0+4.0))*n3;vec3 cw=mix(c*(1.0+0.16*(olN(p/3.5)-0.5)*n1),vec3(0.2,0.3,0.32),pool*0.75);c=mix(c,cw,vCB.z);}
 // snow and ice: blue in its shadows, the glaciers crevassed across their flow
 {float crev=(1.0-smoothstep(0.0,0.04,abs(olN(vec2(p.x/14.0,p.y/60.0))-0.5)))*n2;vec3 cn=c*(0.94+0.08*olN(p/12.0))*vec3(0.97,0.99,1.03);cn=mix(cn,vec3(0.5,0.62,0.7),crev*0.45);c=mix(c,cn,vCB.w);}
 c*=1.0+0.1*(olN(p/900.0+2.0)-0.5);
 {float h=max(0.0,1800.0-vWp.y);vec2 uv=(p-uCloudOrigin-uCloudOff-uSunXZ*h)/uCloudSpan;c*=1.0-uCloudK*texture2D(uCloud,uv).a;}
 diffuseColor.rgb=c;}`);};
    m.needsUpdate=true;}

  // ---- rivers and streams, as ribbons on the ground ----
  {const pos=[],idx=[];let nv=0;const dec=f=>{const o=[];for(let i=0;i<f.length;i+=2)o.push([f[i]/10,f[i+1]/10]);return o;};
    const streamTiles=new Map();const TS=6000;
    for(const r of land.rivers){const pts=dec(r.p),w=r.w,stepL=w>10?40:90,lift=w>10?1.6:1.1,res=[];
      for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/stepL));for(let k=0;k<n;k++)res.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n]);}
      res.push(pts[pts.length-1]);
      if(w<=10){let T=null,key=null,open=false;
        for(let i=0;i<res.length;i++){const [x,z]=res[i];if(inWater(x,z)||!api.inMap(x,z,0)){open=false;continue;}
          const k=Math.floor(x/TS)+','+Math.floor(z/TS);if(k!==key){key=k;T=streamTiles.get(k);if(!T){T={P:[],I:[],n:0,x:(Math.floor(x/TS)+0.5)*TS,z:(Math.floor(z/TS)+0.5)*TS};streamTiles.set(k,T);}open=false;}
          const a=res[Math.max(0,i-1)],b=res[Math.min(res.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2,y=groundH(x,z)+lift;
          T.P.push(x+nx,y,z+nz,x-nx,y,z-nz);if(open)T.I.push(T.n-2,T.n,T.n-1,T.n-1,T.n,T.n+1);T.n+=2;open=true;}
        continue;}
      let open=false;
      for(let i=0;i<res.length;i++){const [x,z]=res[i];if(inWater(x,z)||!api.inMap(x,z,0)){open=false;continue;}
        const a=res[Math.max(0,i-1)],b=res[Math.min(res.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2,y=groundH(x,z)+lift;
        pos.push(x+nx,y,z+nz,x-nx,y,z-nz);if(open)idx.push(nv-2,nv,nv-1,nv-1,nv,nv+1);nv+=2;open=true;}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    // glacial rivers: the Hoh and the Elwha run milky green-grey with rock flour off the ice
    const m=new THREE.Mesh(g,new THREE.MeshPhongMaterial({color:0x5a8a88,specular:0x9fc4d0,shininess:50,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));
    m.name='rivers';m.userData.wireCat='water';m.receiveShadow=true;scene.add(m);
    const tiles=[];for(const T of streamTiles.values()){if(!T.n)continue;const gs=new THREE.BufferGeometry();gs.setAttribute('position',new THREE.Float32BufferAttribute(T.P,3));gs.setIndex(T.I);gs.computeVertexNormals();gs.computeBoundingSphere();
      const ms=new THREE.Mesh(gs,m.material);ms.name='streams';ms.userData.wireCat='water';ms.receiveShadow=true;scene.add(ms);tiles.push({m:ms,x:T.x,z:T.z});nv+=T.n;}
    {let t0=0;animHooks.push(now=>{if(now-t0<400)return;t0=now;const p=camera.position,reach=Y.streamsNear||12000;for(const q of tiles)q.m.visible=Math.hypot(q.x-p.x,q.z-p.z)<reach;});}
    ctx.details=Object.assign(ctx.details||{},{riverVerts:nv});}

  // ---- the park boundary ----
  {const pts=[];for(const r of land.boundary){for(let i=0;i<r.length;i+=2){const x=r[i]/10,z=r[i+1]/10;pts.push(new THREE.Vector3(x,Math.max(0,groundH(x,z))+10,z));}pts.push(null);}
    const segs=[];for(let i=0;i+1<pts.length;i++)if(pts[i]&&pts[i+1]&&pts[i].distanceTo(pts[i+1])<6000)segs.push(pts[i],pts[i+1]);
    if(segs.length){const l=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs),new THREE.LineBasicMaterial({color:0xf0d890,transparent:true,opacity:0.45}));
      l.userData.noWire=true;l.name='park boundary';scene.add(l);}}

  // ---- the surf: a band of foam along every shore, wide and busy on the open Pacific, thin on the Strait ----
  // It is drawn just over the water along the coastline, on the sea side, in two ribbons (the break and the wash)
  // whose whiteness runs along them in waves and comes and goes with the sets.
  {const pos=[],uv=[],idx=[];let nv=0;const dec=f=>{const o=[];for(let i=0;i<f.length;i+=2)o.push([f[i]/10,f[i+1]/10]);return o;};
    const W0=B.x0+(B.x1-B.x0)*0.0;
    for(const r of land.coast){const pts=dec(r),res=[];
      for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/30));for(let k=0;k<n;k++)res.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n]);}
      let open=false,s=0;
      for(let i=0;i<res.length;i++){const [x,z]=res[i],a=res[Math.max(0,i-1)],b=res[Math.min(res.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;
        // OSM coastlines run with the land on the left: the sea is to the right
        const sx=dz/l,sz=-dx/l,[la,lo]=ctx.toLatLon(x,z),pac=lo<-124.15||(lo<-123.9&&la<47.7),wid=pac?70:18;
        if(!api.inMap(x,z,0)){open=false;continue;}
        if(i)s+=Math.hypot(x-res[i-1][0],z-res[i-1][1]);
        pos.push(x-sx*4,0.9,z-sz*4,x+sx*wid,0.9,z+sz*wid);uv.push(s,0,s,pac?1:0.4);
        if(open)idx.push(nv-2,nv,nv-1,nv-1,nv,nv+1);nv+=2;open=true;}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();
    const U=Object.assign({uTime:{value:0},uLight:{value:1}},THREE.UniformsLib.fog);
    const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,fog:true,
      vertexShader:`varying vec2 vUv;
#include <fog_pars_vertex>
void main(){vUv=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
      fragmentShader:`uniform float uTime;uniform float uLight;varying vec2 vUv;
#include <fog_pars_fragment>
float h(float x){return fract(sin(x*12.9898)*43758.5453);}
void main(){float s=vUv.x,v=vUv.y;
 // the waves come in toward the shore across the band (v from 1 out at sea to 0 at the beach), breaking in lines
 float big=step(0.6,v+0.4);float t=uTime*0.12;
 float lines=0.0;for(int k=0;k<3;k++){float ph=fract(t+float(k)/3.0+h(floor(s/180.0))*0.3);float d=abs((1.0-v)-ph);lines+=smoothstep(0.08,0.0,d)*(0.6+0.4*sin(s*0.05+float(k)*2.1));}
 float wash=smoothstep(0.25,0.0,v)*(0.6+0.4*sin(s*0.02+uTime*0.6));
 float a=clamp(lines*0.55+wash*0.7,0.0,0.92)*(0.75+0.25*sin(s*0.007+uTime*0.08));
 gl_FragColor=vec4(vec3(0.95,0.97,0.98)*uLight,a);if(a<0.02)discard;
#include <fog_fragment>
}`});
    const m=new THREE.Mesh(g,mat);m.name='surf';m.userData.noWire=true;m.userData.noShadow=true;m.renderOrder=2;scene.add(m);
    animHooks.push(now=>{U.uTime.value=now/1000;U.uLight.value=lightNow();m.visible=camera.position.y<(Y.surfFar||9000)*2;});
    ctx.details=Object.assign(ctx.details||{},{surfVerts:nv});}

  // ---- the sea stacks: rock columns off the coast, with their hats of trees ----
  {const st=land.stacks||[],R=mkRng(4471);const rockG=new THREE.CylinderGeometry(0.75,1,1,7,3).translate(0,0.5,0),capG=new THREE.ConeGeometry(1,1,6).translate(0,0.5,0);
    {const p=rockG.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),a=Math.atan2(p.getZ(i),p.getX(i));const k=1+0.18*Math.sin(a*3+y*5)+0.1*Math.sin(a*7-y*9);p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k);}rockG.computeVertexNormals();}
    const rk=new THREE.InstancedMesh(rockG,new THREE.MeshLambertMaterial({color:0x4a4640,flatShading:true}),Math.max(1,st.length));
    const tr=new THREE.InstancedMesh(capG,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),Math.max(1,st.length*3));
    const d=new THREE.Object3D(),TC=[col('#1e3824'),col('#24402a'),col('#2a4a2e')];let ni=0,nt=0;
    for(const s of st){const x=s.x/10,z=s.z/10,r=Math.min(120,s.r),g0=Math.min(0,groundH(x,z))-4,h=Math.max(12,r*(1.2+R()*1.6));
      d.position.set(x,g0,z);d.rotation.set(0,R()*6,0);d.scale.set(r,h-g0,r*(0.7+R()*0.6));d.updateMatrix();rk.setMatrixAt(ni++,d.matrix);
      if(r>14)for(let k=0;k<Math.min(3,Math.floor(r/14));k++){const a=R()*6.28,rr=R()*r*0.5,th=6+R()*Math.min(30,r*0.6);d.position.set(x+Math.cos(a)*rr,h-1,z+Math.sin(a)*rr);d.rotation.set(0,0,0);d.scale.set(th*0.3,th,th*0.3);d.updateMatrix();tr.setMatrixAt(nt,d.matrix);tr.setColorAt(nt,TC[nt%3]);nt++;}}
    rk.count=Math.max(1,ni);tr.count=Math.max(1,nt);rk.castShadow=tr.castShadow=true;rk.receiveShadow=true;rk.name='sea stacks';scene.add(rk,tr);
    ctx.details=Object.assign(ctx.details||{},{seaStacks:ni});}

  // ---- the forest ----
  // Each tree is a unit geometry scaled per instance; near the camera the whole tree, past a kilometre a spike.
  //   fir       Douglas-fir and western hemlock, most of the forest: a long clean trunk and a narrow tiered crown
  //   spruce    Sitka spruce in the rainforest and along the coast: huge, buttressed, a broad ragged crown
  //   subalpine subalpine fir and mountain hemlock near the treeline: a dark narrow spire
  //   maple     bigleaf maple on the rainforest floors, and red alder by the rivers: round, light green
  const merge=(parts)=>{const pos=[],colr=[];for(const [g0,c] of parts){const g=g0.index?g0.toNonIndexed():g0;pos.push(...g.attributes.position.array);for(let i=0;i<g.attributes.position.count;i++)colr.push(c[0],c[1],c[2]);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.computeVertexNormals();return g;};
  const BARK=[0.45,0.34,0.27],WHITE=[1,1,1],MOSS=[0.55,0.62,0.36];
  const GEO={
    fir:merge([[new THREE.CylinderGeometry(0.014,0.03,0.4,5,1,true).translate(0,0.2,0),BARK],[new THREE.ConeGeometry(0.16,0.42,7,1,true).translate(0,0.5,0),WHITE],
      [new THREE.ConeGeometry(0.12,0.34,7,1,true).translate(0,0.72,0),WHITE],[new THREE.ConeGeometry(0.07,0.26,6,1,true).translate(0,0.9,0),WHITE]]),
    spruce:merge([[new THREE.CylinderGeometry(0.022,0.05,0.42,6,1,true).translate(0,0.21,0),BARK],[new THREE.ConeGeometry(0.26,0.5,8,1,true).translate(0,0.55,0),WHITE],
      [new THREE.ConeGeometry(0.19,0.36,7,1,true).translate(0.03,0.8,0),WHITE],[new THREE.IcosahedronGeometry(0.08,0).translate(-0.12,0.48,0.05),WHITE]]),
    subalpine:merge([[new THREE.CylinderGeometry(0.012,0.02,0.15,4,1,true).translate(0,0.07,0),BARK],[new THREE.ConeGeometry(0.11,0.95,6,1,true).translate(0,0.55,0),WHITE]]),
    maple:merge([[new THREE.CylinderGeometry(0.025,0.04,0.5,5,1,true).translate(0,0.25,0),MOSS],[new THREE.IcosahedronGeometry(0.2,0).scale(1.2,0.8,1.2).translate(0,0.66,0),WHITE],
      [new THREE.IcosahedronGeometry(0.15,0).scale(1,0.8,1).translate(0.15,0.55,0.06),WHITE],[new THREE.IcosahedronGeometry(0.14,0).scale(1,0.8,1).translate(-0.13,0.56,-0.08),WHITE]]),
    far:new THREE.ConeGeometry(0.16,0.95,3,1,true).translate(0,0.5,0)};
  const snagGeo=new THREE.CylinderGeometry(0.01,0.025,1,4,1,true).translate(0,0.5,0);
  const treeM=new THREE.MeshLambertMaterial({vertexColors:true}),farM=new THREE.MeshLambertMaterial(),snagM=new THREE.MeshLambertMaterial({color:0x7a7268});
  const TILE=Y.forestTile||800,NEAR=Y.forestNear||3600,PER=Y.forestPerTile||3800,FULL=Y.forestFull||1100;
  const tiles=new Map();
  const PALS={fir:['#22402a','#28462c','#1e3a26','#2c4a30','#243e28'],young:['#4e7e38','#5a8a3e','#467236'],spruce:['#2a4a2e','#32522e','#26442a'],subalpine:['#1c3424','#203a28','#18301e'],maple:['#5a8a3a','#6a9440','#74a046','#4e7c36']};
  for(const k in PALS)PALS[k]=PALS[k].map(col);
  const nearRiver=(()=>{const g=new Map(),S2=500;for(const r of land.rivers){if(r.w<10)continue;for(let i=0;i<r.p.length;i+=2){const x=r.p[i]/10,z=r.p[i+1]/10,k=Math.floor(x/S2)+','+Math.floor(z/S2);g.set(k,1);}}
    return (x,z)=>g.has(Math.floor(x/S2)+','+Math.floor(z/S2));})();
  function buildTile(tx,tz){
    const R=mkRng(tx*73856093^tz*19349663),d=new THREE.Object3D(),L={fir:[],spruce:[],subalpine:[],maple:[]},S=[],FAR=[],FC=[];
    for(let k=0;k<PER;k++){const x=(tx+R())*TILE,z=(tz+R())*TILE,r=R(),cov=coverAt(x,z);
      let p=0,young_=false,snag=false,rain=false;
      if(cov===0)p=0.95;else if(cov===1){p=0.9;rain=true;}
      else if(cov===6){const a=blockAge(x,z);if(a===0){p=r<0.04?1:0;snag=true;}else if(a===1){p=1;young_=true;}else p=0.95;}
      else if(cov===2)p=0.05;else if(cov===3)p=0.012;else if(cov===9)p=0.06;else if(cov===4)p=0.04;
      if(R()>p)continue;
      const y=groundH(x,z);
      if(y<1.5||!api.inMap(x,z,20)||inWater(x,z))continue;
      if(y>1750)continue;   // the treeline
      if(roadsNear(x,z,6,q=>q.c!=='trail').length)continue;
      d.position.set(x,y-0.3,z);d.rotation.set(0,R()*6.28,0);
      if(snag){const h=3+R()*5;d.scale.set(h,h,h);d.updateMatrix();S.push(d.matrix.clone());continue;}
      const coast=y<60&&hash3(Math.round(x/300),Math.round(z/300),4)>0.4;
      const kind=young_?'fir':y>1300&&R()<0.75?'subalpine':rain?(R()<0.35?'maple':'spruce'):coast&&R()<0.5?'spruce':nearRiver(x,z)&&y<500&&R()<0.3?'maple':'fir';
      const h=young_?2.5+R()*6:kind==='spruce'?(rain?40+R()*30:25+R()*20):kind==='subalpine'?8+R()*12:kind==='maple'?(rain?18+R()*12:12+R()*8):(y>900?18+R()*14:30+R()*28);
      const wd=young_?1.3:kind==='spruce'?1.1:1;
      d.scale.set(h*wd,h,h*wd);d.updateMatrix();const c=(young_?PALS.young:PALS[kind])[Math.floor(R()*(young_?3:PALS[kind].length))];
      L[kind].push([d.matrix.clone(),c]);FAR.push(d.matrix.clone());FC.push(c);}
    const cx=(tx+0.5)*TILE,cz=(tz+0.5)*TILE,sph=new THREE.Sphere(new THREE.Vector3(cx,groundH(cx,cz)+20,cz),TILE*0.75+60);
    const mk=(geo,mat,arr,cols)=>{if(!arr.length)return null;const g=new THREE.BufferGeometry();for(const a in geo.attributes)g.setAttribute(a,geo.attributes[a]);if(geo.index)g.setIndex(geo.index);g.boundingSphere=sph;
      const im=new THREE.InstancedMesh(g,mat,arr.length);arr.forEach((m,i)=>im.setMatrixAt(i,m));if(cols)cols.forEach((c,i)=>im.setColorAt(i,c));
      im.castShadow=false;im.receiveShadow=true;im.userData.noWire=true;im.userData.total=arr.length;scene.add(im);return im;};
    const near=[];for(const kind in L){const a=L[kind];if(a.length)near.push(mk(GEO[kind],treeM,a.map(q=>q[0]),a.map(q=>q[1])));}
    return {near,far:mk(GEO.far,farM,FAR,FC),s:mk(snagGeo,snagM,S,null),cx,cz,used:0};
  }
  let lastT=0;
  animHooks.push(now=>{if(now-lastT<200)return;lastT=now;
    const cp=camera.position,above=cp.y-Math.max(0,groundH(cp.x,cp.z));
    const reach=above>5000?0:NEAR*Math.max(0.35,Math.min(1,1.4-above/4500));
    const ti0=Math.floor((cp.x-reach)/TILE),ti1=Math.floor((cp.x+reach)/TILE),tj0=Math.floor((cp.z-reach)/TILE),tj1=Math.floor((cp.z+reach)/TILE);
    let made=0;
    for(let tj=tj0;tj<=tj1&&reach>0;tj++)for(let ti=ti0;ti<=ti1;ti++){const key=ti+','+tj;const cx=(ti+0.5)*TILE,cz=(tj+0.5)*TILE,dist=Math.hypot(cx-cp.x,cz-cp.z);
      if(dist>reach+TILE*0.7)continue;
      let t=tiles.get(key);if(!t){if(made>=2)continue;t=buildTile(ti,tj);tiles.set(key,t);made++;}
      t.used=now;}
    for(const [key,t] of tiles){const dist=Math.hypot(t.cx-cp.x,t.cz-cp.z),on=reach>0&&dist<=reach+TILE*0.7,full=on&&dist<FULL;
      const f=on?Math.max(0.1,Math.min(1,1.2-dist/(NEAR*0.85))):0;
      for(const im of t.near)if(im){im.visible=full;im.count=Math.max(1,Math.floor(im.userData.total*f));}
      if(t.far){t.far.visible=on&&!full;t.far.count=Math.max(1,Math.floor(t.far.userData.total*f));}
      if(t.s){t.s.visible=on&&dist<FULL*1.6;t.s.count=Math.max(1,Math.floor(t.s.userData.total*f));}
      if(!on&&now-t.used>60000){for(const im of [...t.near,t.far,t.s])if(im){scene.remove(im);im.dispose();}tiles.delete(key);}}
    ctx.details.forestTiles=tiles.size;});
  ctx.details=Object.assign(ctx.details||{},{recoloured,forest:'fir, spruce, subalpine fir and maple in '+TILE+' m tiles within '+NEAR+' m, whole within '+FULL+' m'});
}
