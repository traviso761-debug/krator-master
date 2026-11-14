// Numenor's land: what grows on it, the water through it and the weather over it. An extra, run once the engine has
// built the ground, the sea, the roads and the landmarks. It reads ctx.nmLand, the file tools/make-numenor.py writes
// beside the map. Adapted from the Olympic Peninsula's (src/olympic/nature.js), whose forest tiles, ground surfaces,
// surf and clouds are the same machinery on a different country:
//
//   the ground's colour   from the land cover grid: the downs and pastures of Mittalmar, the grain of Orrostar and
//                         the King's land, the forests of Hyarrostar, the firs of Andustar, the heath of Forostar,
//                         the vines of Hyarnustar, the Nisimaldar round Eldanna, rock, sand, marsh
//   the forest            grown in tiles round the camera: oak and beech and the golden-flowered laurinque in the
//                         broadleaf woods; fir on the highlands; in the Nisimaldar the evergreens the Eldar brought,
//                         dark and glossy, and the oiolaire; willows in the marshes; hedgerow oaks and orchards
//   the rivers            the Siril, the Nunduine and the streams, as ribbons
//   the coast             the surf along every shore
//   the clouds            fair-weather heaps drifting in off the sea, and their shadows
// Fan work from Tolkien, whose world belongs to the Tolkien Estate; nothing from any book, film or game is used.
import { hash3, mkRng } from '../core/rng.js';

export function nature(api){
  const {THREE,ctx,C,scene,camera,renderer,animHooks,inWater,roadsNear,nightF,hour,B,groundH}=api;
  const land=ctx.nmLand;if(!land){api.report('nature',new Error('no land file'));return;}
  const Y=C.numenor||{};
  const col=h=>new THREE.Color(h);
  const lightNow=()=>0.3+0.7*(1-nightF(hour()));
  const unrle=(rle,n)=>{const a=new Uint8Array(n);let k=0;for(let i=0;i<rle.length;i+=2){a.fill(rle[i],k,k+rle[i+1]);k+=rle[i+1];}return a;};

  // ---- the land cover grid ----
  // 0 pasture  1 farmland  2 broadleaf  3 fir  4 heath  5 vineyard  6 rock  7 water  8 beach  9 marsh  10 nisimaldar  11 town
  const cv=land.cover,CN=cv.nx*cv.nz,COVER=unrle(cv.rle,CN);
  const terr=[];scene.traverse(o=>{if(o.isMesh&&o.name==='terrain')terr.push(o);});
  const X0=B.x0,Z0=B.z0,ST=cv.step;
  const cellAt=(x,z)=>{const i=Math.round((x-X0)/ST),j=Math.round((z-Z0)/ST);if(i<0||j<0||i>=cv.nx||j>=cv.nz)return -1;return j*cv.nx+i;};
  // a cell the grid calls sea can be dry along the shore (the coast runs between the grid points): it takes the cover
  // of the nearest dry cell beside it, or the strand
  const coverAt=(x,z)=>{const k=cellAt(x,z);if(k<0)return 7;const c=COVER[k];if(c!==7||groundH(x,z)<0.3)return c;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const q=cellAt(x+dx*ST,z+dz*ST);if(q>=0&&COVER[q]!==7&&COVER[q]!==11)return COVER[q];}return 8;};
  // the grid is a kilometre; a tree asks for its cover at a position shaken by up to half a cell, so a wood's edge
  // wanders instead of running along the grid
  const vn=(x,z,s)=>{const i=Math.floor(x),j=Math.floor(z),f=x-i,g=z-j,F=f*f*(3-2*f),G=g*g*(3-2*g),h=(a,b)=>{const t=Math.sin(a*127.1+b*311.7+s*74.7)*43758.5453;return t-Math.floor(t);};
    return (h(i,j)*(1-F)+h(i+1,j)*F)*(1-G)+(h(i,j+1)*(1-F)+h(i+1,j+1)*F)*G;};
  const coverSoft=(x,z)=>coverAt(x+(vn(x/700,z/700,1)-0.5)*ST*1.1,z+(vn(x/700,z/700,2)-0.5)*ST*1.1);
  ctx.coverAt=coverAt;

  // ---- the ground's colour ----
  const PAL={pasture:[col('#6e9a48'),col('#7aa650'),col('#88aa58')],farm:[col('#b4a860'),col('#a8a85a'),col('#c2b46c')],broad:[col('#3a6a2e'),col('#447432'),col('#30602a')],
    fir:[col('#24442c'),col('#2a4a30'),col('#203c28')],heath:[col('#7a6a6e'),col('#8a7272'),col('#6e6a58')],vine:[col('#7a8a44'),col('#8a9050'),col('#6e7e40')],
    rock:[col('#8a8478'),col('#9a9488'),col('#76716a')],beach:[col('#e0d4b0'),col('#d4c8a4'),col('#e8dcbc')],wet:[col('#5a7a52'),col('#6a8458')],
    nisi:[col('#2e5a3a'),col('#36643e'),col('#2a5234')],town:col('#b8b0a0')};
  const cc=new THREE.Color(),tmp=new THREE.Color();
  const mix3=(arr,t,u)=>cc.copy(arr[0]).lerp(arr[1],t).lerp(arr[2]||arr[0],u*0.6);
  function colourAt(x,y,z,ny){
    const slope=Math.sqrt(Math.max(0,1-ny*ny))/Math.max(0.05,ny),cov=coverAt(x,z),h1=hash3(Math.round(x/200),Math.round(z/200),3),h2=hash3(Math.round(x/600),Math.round(z/600),5);
    switch(cov){
      case 1:mix3(PAL.farm,h1,h2);break;
      case 2:mix3(PAL.broad,h1,h2);break;
      case 3:mix3(PAL.fir,h1,h2);break;
      case 4:mix3(PAL.heath,h1,h2);break;
      case 5:mix3(PAL.vine,h1,h2);break;
      case 6:mix3(PAL.rock,h1,h2);break;
      case 7:cc.set('#4a6a5a');break;   // under the sea or the lake: what shows is the shore the grid could not place
      case 8:mix3(PAL.beach,h1,0);break;
      case 9:mix3(PAL.wet,h1,0);break;
      case 10:mix3(PAL.nisi,h1,h2);break;
      case 11:cc.copy(PAL.town).lerp(PAL.pasture[0],0.35*h1);break;
      default:mix3(PAL.pasture,h1,h2);}
    if(cov!==7&&slope>0.7)cc.lerp(tmp.copy(PAL.rock[0]).lerp(PAL.rock[2],h1),Math.min(1,(slope-0.7)*1.5));
    if(y<3&&cov!==7&&cov!==8&&slope<0.2)cc.lerp(PAL.beach[0],Math.max(0,(3-y)/3)*0.6);   // the strand
    return cc;}
  // what each point is, for the shader: A = forest, grass, sand, fields; B = rock, vines, marsh, heath
  const covW=(x,y,z,ny)=>{const c=coverAt(x,z),slope=Math.sqrt(Math.max(0,1-ny*ny))/Math.max(0.05,ny),A=[0,0,0,0],Bw=[0,0,0,0];
    if(c===6||slope>0.9)Bw[0]=255;else if(c===2||c===3||c===10)A[0]=255;else if(c===0||c===11)A[1]=255;else if(c===8)A[2]=255;
    else if(c===1)A[3]=255;else if(c===5)Bw[1]=255;else if(c===9)Bw[2]=255;else if(c===4)Bw[3]=255;else A[1]=255;return [A,Bw];};
  const addCover=g=>{const p=g.attributes.position,n=g.attributes.normal,A=new Uint8Array(p.count*4),Bb=new Uint8Array(p.count*4);
    for(let i=0;i<p.count;i++){const [a,b]=covW(p.getX(i),p.getY(i),p.getZ(i),n.getY(i));A.set(a,i*4);Bb.set(b,i*4);}
    g.setAttribute('aCovA',new THREE.BufferAttribute(A,4,true));g.setAttribute('aCovB',new THREE.BufferAttribute(Bb,4,true));};
  let recoloured=0;
  for(const t of terr){const g=t.geometry,p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color;
    for(let i=0;i<p.count;i++){colourAt(p.getX(i),p.getY(i),p.getZ(i),n.getY(i));c.setXYZ(i,cc.r,cc.g,cc.b);recoloured++;}
    c.needsUpdate=true;addCover(g);t.castShadow=false;}

  // ---- the clouds: fair-weather heaps drifting in off the sea ----
  const CL=(()=>{const W=B.x1-B.x0,Dz=B.z1-B.z0,R=mkRng(1938),N=Y.clouds===undefined?160:Y.clouds,S=512;
    const shadow=document.createElement('canvas');shadow.width=shadow.height=S;const sg=shadow.getContext('2d');
    const P=[],SZ=[],HT=[];
    for(let c=0;c<N;c++){const cx=B.x0+R()*W,cz=B.z0+R()*Dz,rad=1400+R()*R()*4200,base=(Y.cloudBase||1500)*(0.7+R()*0.6),np=14+Math.floor(rad/80);
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
  // Each kind of ground gets a surface of its own close to, let go before it is finer than a pixel: the canopy's
  // crowns and gaps; grass and pasture in drifts; sand with its tide line; the fields in strips, each its own crop and
  // its own way, hedged; rock in strata; the vines in rows following the hill; marsh with standing water; heath in
  // purple and brown tussocks. The forest's edge is torn by noise. Cloud shadows over all.
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
 // the fields: blocks of a few hundred metres, each its own crop (ripe, green, ploughed, stubble) with its rows
 // running its own way, a hedge round it
 {vec2 q=p+vec2(olN(p/1400.0),olN(p/1400.0+9.0))*520.0+vec2(olN(p/300.0+4.0),olN(p/300.0+6.0))*90.0;vec2 sz=vec2(260.0,190.0)*(0.8+0.6*olN(p/4000.0));vec2 cell=floor(q/sz);vec2 f=fract(q/sz);
  float k=olH(cell);vec3 crop=k<0.3?vec3(0.78,0.68,0.36):k<0.55?vec3(0.46,0.6,0.28):k<0.75?vec3(0.48,0.38,0.26):vec3(0.7,0.64,0.44);
  float ang=olH(cell+3.0)*3.14159;vec2 d=vec2(cos(ang),sin(ang));float rows=0.5+0.5*sin(dot(p,d)*1.4);
  vec3 cf=mix(c,crop,0.32)*(0.94+0.08*rows*n1)*(0.95+0.1*olN(p/30.0));
  float hedge=(1.0-smoothstep(0.0,0.035,min(min(f.x,1.0-f.x),min(f.y,1.0-f.y))))*n3;cf=mix(cf,vec3(0.18,0.3,0.14),hedge*0.85);
  c=mix(c,cf,vCA.w);}
 {vec3 cr=c*(0.84+0.28*olN(vec2(p.x/30.0+p.y/41.0,vWp.y/3.5)))*(1.0+0.15*(olN(p/2.0)-0.5)*n1);c=mix(c,cr,vCB.x);}
 // the vines: rows following the hill, brown earth between
 {float rows=smoothstep(0.35,0.65,sin(p.x*1.6+olN(p/60.0)*12.0)*0.5+0.5)*n1,tufts=olN(p/2.2)*n1;vec3 cy=c*(0.86+0.2*rows+0.12*(tufts-0.5));c=mix(c,cy,vCB.y);}
 {float pool=smoothstep(0.7,0.76,olN(p/20.0+4.0))*n3;vec3 cw=mix(c*(1.0+0.16*(olN(p/3.5)-0.5)*n1),vec3(0.2,0.3,0.32),pool*0.75);c=mix(c,cw,vCB.z);}
 // heath: tussocks of heather, purple where it is in flower, brown and grey between, a stone here and there
 {float tus=olN(p/2.5)*n1,flw=smoothstep(0.5,0.8,olN(p/18.0+3.0)),stone=smoothstep(0.88,0.92,olN(p/7.0+11.0))*n2;
  vec3 ch=c*(0.86+0.26*tus);ch=mix(ch,vec3(0.5,0.32,0.46),flw*0.4);ch=mix(ch,vec3(0.62,0.6,0.56),stone*0.7);c=mix(c,ch,vCB.w);}
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
    // clear rivers off grass and stone
    const m=new THREE.Mesh(g,new THREE.MeshPhongMaterial({color:0x3e7a9a,specular:0x9fc4d0,shininess:50,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));
    m.name='rivers';m.userData.wireCat='water';m.receiveShadow=true;scene.add(m);
    const tiles=[];for(const T of streamTiles.values()){if(!T.n)continue;const gs=new THREE.BufferGeometry();gs.setAttribute('position',new THREE.Float32BufferAttribute(T.P,3));gs.setIndex(T.I);gs.computeVertexNormals();gs.computeBoundingSphere();
      const ms=new THREE.Mesh(gs,m.material);ms.name='streams';ms.userData.wireCat='water';ms.receiveShadow=true;scene.add(ms);tiles.push({m:ms,x:T.x,z:T.z});nv+=T.n;}
    {let t0=0;animHooks.push(now=>{if(now-t0<400)return;t0=now;const p=camera.position,reach=Y.streamsNear||12000;for(const q of tiles)q.m.visible=Math.hypot(q.x-p.x,q.z-p.z)<reach;});}
    ctx.details=Object.assign(ctx.details||{},{riverVerts:nv});}


  // ---- the surf: a band of foam along every shore ----
  // It is drawn just over the water along the coastline, on the sea side, in two ribbons (the break and the wash)
  // whose whiteness runs along them in waves and comes and goes with the sets.
  {const pos=[],uv=[],idx=[];let nv=0;const dec=f=>{const o=[];for(let i=0;i<f.length;i+=2)o.push([f[i]/10,f[i+1]/10]);return o;};
    const W0=B.x0+(B.x1-B.x0)*0.0;
    for(const r of land.coast){const pts=dec(r),res=[];
      for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/30));for(let k=0;k<n;k++)res.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n]);}
      let open=false,s=0;
      for(let i=0;i<res.length;i++){const [x,z]=res[i],a=res[Math.max(0,i-1)],b=res[Math.min(res.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;
        // the coast runs with the land on the left (tools/make-numenor.py): the sea is to the right
        const sx=dz/l,sz=-dx/l,pac=true,wid=60;
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


  // ---- the forest ----
  // Each tree is a unit geometry scaled per instance; near the camera the whole tree, past a kilometre a spike.
  //   fir       the firs of Andustar's highlands and Forostar's sheltered places: tiered and dark
  //   spruce    (the broad dark evergreen) the Nisimaldar's trees, glossy, round-shouldered, never bare
  //   subalpine a dark narrow spire: the oiolaire among the Nisimaldar, cypresses by the houses
  //   maple     (the round broadleaf) oak and beech in Hyarrostar's forests, the hedgerow oaks, the orchards,
  //             willows by the water; the laurinque in flower, gold
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
  const PALS={fir:['#22402a','#28462c','#1e3a26','#2c4a30','#243e28'],young:['#7a9a50','#8aa458','#6a8c48'],spruce:['#26503a','#2c5a40','#224a34','#30603e'],subalpine:['#1c3a2a','#203e2c','#18342a'],
    maple:['#3e6e2e','#4a7a34','#548438','#386628','#5a8a3e'],gold:['#d8b030','#e4c040','#c8a028'],willow:['#7a9a5a','#8aa864','#6e8e52'],orchard:['#5e8e3e','#6a9a44','#f0e8e8']};
  for(const k in PALS)PALS[k]=PALS[k].map(col);
  const nearRiver=(()=>{const g=new Map(),S2=500;for(const r of land.rivers){for(let i=0;i<r.p.length;i+=2){const x=r.p[i]/10,z=r.p[i+1]/10,k=Math.floor(x/S2)+','+Math.floor(z/S2);g.set(k,1);}}
    return (x,z)=>g.has(Math.floor(x/S2)+','+Math.floor(z/S2));})();
  function buildTile(tx,tz){
    const R=mkRng(tx*73856093^tz*19349663),d=new THREE.Object3D(),L={fir:[],spruce:[],subalpine:[],maple:[]},S=[],FAR=[],FC=[];
    for(let k=0;k<PER;k++){const x=(tx+R())*TILE,z=(tz+R())*TILE,cov=coverSoft(x,z);
      // how thickly each kind of country is wooded
      const p=cov===2?0.92:cov===3?0.85:cov===10?0.9:cov===9?0.08:cov===5?0.05:cov===1?0.012:cov===0?0.018:cov===4?0.008:cov===11?0.02:0;
      if(R()>p)continue;
      const y=groundH(x,z);
      if(y<1.5||!api.inMap(x,z,20)||inWater(x,z))continue;
      if(y>1500)continue;   // the treeline, on the mountain and the highest of Andustar
      if(roadsNear(x,z,6,q=>q.c!=='trail').length)continue;
      d.position.set(x,y-0.3,z);d.rotation.set(0,R()*6.28,0);
      let kind,h,wd=1,c;
      if(cov===3){kind=y<300&&R()<0.25?'maple':'fir';h=kind==='fir'?18+R()*20:12+R()*8;}
      else if(cov===10){const r=R();kind=r<0.22?'subalpine':r<0.3?'maple':'spruce';h=kind==='subalpine'?16+R()*14:kind==='spruce'?14+R()*12:12+R()*8;wd=kind==='spruce'?1.25:1;}
      else if(cov===2){kind=R()<0.08?'fir':'maple';h=kind==='fir'?18+R()*14:16+R()*14;wd=1.15;if(kind==='maple'&&R()<0.07)c=PALS.gold[Math.floor(R()*3)];}
      else if(cov===9||nearRiver(x,z)&&R()<0.5){kind='maple';h=8+R()*6;wd=1.3;c=PALS.willow[Math.floor(R()*3)];}
      else if(cov===5){kind='maple';h=4+R()*3;wd=1.2;c=PALS.orchard[Math.floor(R()*3)];}
      else if(cov===11){kind=R()<0.3?'subalpine':'maple';h=kind==='subalpine'?10+R()*8:9+R()*7;}
      else {kind='maple';h=12+R()*10;wd=1.2;}
      d.scale.set(h*wd,h,h*wd);d.updateMatrix();c=c||PALS[kind][Math.floor(R()*PALS[kind].length)];
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
  ctx.details=Object.assign(ctx.details||{},{recoloured,forest:'oak and beech, fir, the Nisimaldar, willows and orchards in '+TILE+' m tiles within '+NEAR+' m, whole within '+FULL+' m'});
}
