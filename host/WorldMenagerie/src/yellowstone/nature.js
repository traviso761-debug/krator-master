// Yellowstone's land: what grows on it, the water running over it and the steam coming off it. An extra
// (src/engine/stages/06f-extras.js), run once the engine has built the ground, the lakes, the roads and the
// landmarks. It reads ctx.ysLand, the file tools/make-yellowstone.py writes beside the map:
//
//   the ground's colour   the engine colours terrain by height and slope, which on a plateau that is all one
//                         height paints the park one flat green. It is recoloured here from the land cover
//                         grid - lodgepole, meadow, sage, wetland, rock and snow, thermal ground, the 1988 burn -
//                         and the walls of the Grand Canyon of the Yellowstone get their yellow.
//   the forest            eighty per cent of the park is lodgepole pine, which is a hundred million trees. They
//                         are grown in tiles round the camera as it moves, thinned with distance, and dropped when
//                         it has gone; from high up the ground's colour carries it.
//   the rivers            OpenStreetMap's river and stream lines, as ribbons on the ground at their own width.
//   the steam             every basin, every mapped geyser and hot spring and every landmark that asked for it
//                         (ctx.ysSteam), in one set of points animated on the GPU.
//   the small springs     two thousand pools too small to be landmarks, as coloured discs.
//   the boundary          the park's edge, faintly.
import { hash3, mkRng } from '../core/rng.js';
import { softPoints } from './landmarks.js';

export function nature(api){
  const {THREE,ctx,C,scene,camera,renderer,animHooks,inWater,roadsNear,POIS,nightF,hour,B}=api;
  const groundH=ctx.ysHeight||api.groundH;   // the fine patches over the grid (landmarks.js)
  const land=ctx.ysLand;if(!land){api.report('nature',new Error('no land file'));return;}
  const Y=C.yellowstone||{};
  const col=h=>new THREE.Color(h);
  const lightNow=()=>0.3+0.7*(1-nightF(hour()));

  // ---- the land cover grid ----
  const cv=land.cover,CN=cv.nx*cv.nz,COVER=new Uint8Array(CN);
  {let k=0;for(let i=0;i<cv.rle.length;i+=2){COVER.fill(cv.rle[i],k,k+cv.rle[i+1]);k+=cv.rle[i+1];}}
  // the terrain grid and the cover grid are the same grid: same origin, same step
  const terr=[];scene.traverse(o=>{if(o.isMesh&&o.name==='terrain')terr.push(o);});
  const X0=B.x0,Z0=B.z0;
  const ST=cv.step;
  const coverAt=(x,z)=>{const i=Math.round((x-X0)/ST),j=Math.round((z-Z0)/ST);if(i<0||j<0||i>=cv.nx||j>=cv.nz)return 0;return COVER[j*cv.nx+i];};
  ctx.coverAt=coverAt;
  const datum=Y.datum||0;   // metres above sea level at y = 0, for the treeline and the snow

  // ---- the Grand Canyon of the Yellowstone: the river from the Upper Falls down to Tower ----
  const canyon=[];for(const w of api.WATERWAYS)if(w.name==='Yellowstone River')for(const p of w.pts){const [la]=ctx.toLatLon(p[0],p[1]);if(la>44.708&&la<44.905)canyon.push(p);}
  const cbb=api.bbox(canyon.length?canyon:[[0,0]]);
  const nearCanyon=(x,z)=>{if(!canyon.length||x<cbb.x0-1500||x>cbb.x1+1500||z<cbb.z0-1500||z>cbb.z1+1500)return 1e9;let d=1e9;for(let i=0;i<canyon.length;i+=2)d=Math.min(d,Math.hypot(x-canyon[i][0],z-canyon[i][1]));return d;};

  // ---- the ground's colour ----
  const PAL={forest:[col('#2a4226'),col('#34502c'),col('#223a22')],meadow:[col('#8c875a'),col('#7a8150'),col('#a09460')],sage:[col('#8f8e72'),col('#a09a78')],
    wet:[col('#5c7446'),col('#6f8450')],rock:[col('#7c756a'),col('#948b7d'),col('#665f56')],snow:col('#eef1f3'),thermal:[col('#aaa495'),col('#a28a6a'),col('#b7b0a1')],
    burn:[col('#48503a'),col('#3f5c34'),col('#555540')],canyon:[col('#d9b75a'),col('#d69a7c'),col('#e8dcc2'),col('#c58c48')]};
  const cc=new THREE.Color(),tmp=new THREE.Color();
  const mix3=(arr,t,u)=>cc.copy(arr[0]).lerp(arr[1],t).lerp(arr[2]||arr[0],u*0.6);
  function colourAt(x,y,z,ny){
    const slope=Math.sqrt(Math.max(0,1-ny*ny))/Math.max(0.05,ny),abs=y+datum;
    const cov=coverAt(x,z),h1=hash3(Math.round(x/150),Math.round(z/150),3),h2=hash3(Math.round(x/450),Math.round(z/450),5);
    switch(cov){
      case 1:mix3(PAL.meadow,h1,h2);break;
      case 2:mix3(PAL.sage,h1,0);break;
      case 3:mix3(PAL.wet,h1,0);break;
      case 4:mix3(PAL.rock,h1,h2);if(abs>3150&&slope<0.7&&h1>0.35)cc.lerp(PAL.snow,Math.min(1,(abs-3150)/250)*0.85);break;
      case 5:mix3(PAL.thermal,h1*0.5,h2);break;
      case 6:mix3(PAL.burn,h1,h2);break;
      case 7:cc.set('#8a866c');break;   // under a lake, which hides it; what shows is the shore the 150 m grid could not place
      default:mix3(PAL.forest,h1,h2);}
    // steep ground is bare, whatever is on the level either side of it
    if(cov!==7&&slope>0.55)cc.lerp(tmp.copy(PAL.rock[0]).lerp(PAL.rock[2],h1),Math.min(1,(slope-0.55)*1.6));
    // the canyon walls: rhyolite rotted by hot water to yellow, pink and white, in bands
    // (only on the walls themselves: on anything gentler it bled out over the plateau either side)
    if(slope>0.5){const dc=nearCanyon(x,z);if(dc<900){const band=Math.sin(abs*0.09+h1*2)*0.5+0.5;
      tmp.copy(PAL.canyon[0]).lerp(PAL.canyon[1],band).lerp(PAL.canyon[2],h2*0.5).lerp(PAL.canyon[3],h1*0.3);cc.lerp(tmp,Math.min(1,(slope-0.5)*2.5)*Math.min(1,(900-dc)/400));}}
    return cc;}
  // ---- what each point of the ground is, for the shader's textures ----
  // Two sets of four weights per vertex: forest, meadow, sage, thermal ground; rock, burn, wetland, snow. The
  // shader blends a surface for each (canopy, grass, sage bushes, sinter and its mats, strata, snags, pools,
  // snow) by how much of it is there, and gives the forest ragged edges instead of the soft blots a 150 m grid
  // of colours makes.
  const covW=(x,y,z,ny)=>{const c=coverAt(x,z),abs=y+datum,slope=Math.sqrt(Math.max(0,1-ny*ny))/Math.max(0.05,ny),A=[0,0,0,0],Bw=[0,0,0,0];
    if(c===4&&abs>3150&&slope<0.7)Bw[3]=255;else if(c===4||slope>0.8)Bw[0]=255;else if(c===0)A[0]=255;else if(c===1)A[1]=255;else if(c===2)A[2]=255;
    else if(c===5)A[3]=255;else if(c===6)Bw[1]=255;else if(c===3)Bw[2]=255;else A[1]=255;return [A,Bw];};
  const addCover=g=>{const p=g.attributes.position,n=g.attributes.normal,A=new Uint8Array(p.count*4),Bb=new Uint8Array(p.count*4);
    for(let i=0;i<p.count;i++){const [a,b]=covW(p.getX(i),p.getY(i),p.getZ(i),n.getY(i));A.set(a,i*4);Bb.set(b,i*4);}
    g.setAttribute('aCovA',new THREE.BufferAttribute(A,4,true));g.setAttribute('aCovB',new THREE.BufferAttribute(Bb,4,true));};
  let recoloured=0;
  for(const t of terr){const g=t.geometry,p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color;
    for(let i=0;i<p.count;i++){colourAt(p.getX(i),p.getY(i),p.getZ(i),n.getY(i));c.setXYZ(i,cc.r,cc.g,cc.b);recoloured++;}
    c.needsUpdate=true;addCover(g);
    // The ground casting shadows on itself does nothing useful here: the shadow box is a kilometre across and
    // the plateau is a hundred, and what it did draw was a dark band of acne across the Upper Geyser Basin.
    t.castShadow=false;}

  // ---- the fine patches: the coarse grid cut away under each, and the patch laid in ----
  for(const P of (groundH.patches||[])){
    for(const t of terr){const g=t.geometry,p=g.attributes.position,ix=g.index.array,keep=[];
      for(let i=0;i<ix.length;i+=3){const a=ix[i],b=ix[i+1],c=ix[i+2],cx=(p.getX(a)+p.getX(b)+p.getX(c))/3,cz=(p.getZ(a)+p.getZ(b)+p.getZ(c))/3;
        if(cx>P.x0&&cx<P.x1&&cz>P.z0&&cz<P.z1)continue;keep.push(a,b,c);}
      if(keep.length!==ix.length)g.setIndex(keep);}
    const pos=new Float32Array(P.nx*P.nz*3),idx=[];
    for(let j=0;j<P.nz;j++)for(let i=0;i<P.nx;i++){const k=j*P.nx+i;pos[k*3]=P.x0+i*P.step;pos[k*3+1]=P.h[k];pos[k*3+2]=P.z0+j*P.step;}
    for(let j=0;j+1<P.nz;j++)for(let i=0;i+1<P.nx;i++){const a=j*P.nx+i;idx.push(a,a+P.nx,a+1,a+1,a+P.nx,a+P.nx+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    const colr=new Float32Array(pos.length),nr=g.attributes.normal;
    for(let k=0;k<P.nx*P.nz;k++){colourAt(pos[k*3],pos[k*3+1],pos[k*3+2],nr.getY(k));colr[k*3]=cc.r;colr[k*3+1]=cc.g;colr[k*3+2]=cc.b;}
    g.setAttribute('color',new THREE.BufferAttribute(colr,3));g.computeBoundingSphere();addCover(g);
    const m=new THREE.Mesh(g,terr[0].material);m.name='terrain';m.userData.wireCat='ground';m.receiveShadow=true;scene.add(m);terr.push(m);
    // and coarser copies of it, every second and every fourth point, for when the camera is further off: the
    // fine one is two hundred thousand triangles, which is a lot to draw for a canyon ten kilometres away
    {const levels=[m];for(const st of [2,4]){const W=Math.floor((P.nx-1)/st),D=Math.floor((P.nz-1)/st),cp=new Float32Array((W+1)*(D+1)*3),cc2=new Float32Array((W+1)*(D+1)*3),ci=[];
        for(let j=0;j<=D;j++)for(let i=0;i<=W;i++){const v=(j*st)*P.nx+i*st,o=(j*(W+1)+i)*3;cp.set(pos.subarray(v*3,v*3+3),o);cc2.set(colr.subarray(v*3,v*3+3),o);}
        for(let j=0;j<D;j++)for(let i=0;i<W;i++){const a=j*(W+1)+i;ci.push(a,a+W+1,a+1,a+1,a+W+1,a+W+2);}
        const gc=new THREE.BufferGeometry();gc.setAttribute('position',new THREE.BufferAttribute(cp,3));gc.setAttribute('color',new THREE.BufferAttribute(cc2,3));gc.setIndex(ci);gc.computeVertexNormals();gc.computeBoundingSphere();addCover(gc);
        const mc=new THREE.Mesh(gc,terr[0].material);mc.name='terrain';mc.userData.wireCat='ground';mc.userData.lod=st;mc.receiveShadow=true;mc.visible=false;scene.add(mc);levels.push(mc);}
      const cx=(P.x0+P.x1)/2,cz=(P.z0+P.z1)/2,near=Y.patchNear||[3000,12000];let t0=0;
      animHooks.push(now=>{if(now-t0<300)return;t0=now;const d=Math.hypot(camera.position.x-cx,camera.position.z-cz),k=d<near[0]?0:d<near[1]?1:2;levels.forEach((q,i)=>{q.visible=i===k;});});}}

  // ---- the clouds: a summer afternoon's fair-weather cumulus, and their shadows going over the ground ----
  // Heaps of soft puffs a couple of kilometres over the plateau, whiter on top and grey underneath, drifting on
  // the wind and wrapping round the map. Their shadows are one texture the size of the map, a dark blob for
  // each cloud, slid under the ground's shader by the same wind and thrown off to the side away from the sun.
  const CL=(()=>{const W=B.x1-B.x0,Dz=B.z1-B.z0,R=mkRng(3907),N=Y.clouds===undefined?110:Y.clouds,S=512;
    const shadow=document.createElement('canvas');shadow.width=shadow.height=S;const sg=shadow.getContext('2d');
    const P=[],SZ=[],HT=[];
    for(let c=0;c<N;c++){const cx=B.x0+R()*W,cz=B.z0+R()*Dz,rad=700+R()*R()*1600,base=Y.cloudBase||2450,np=14+Math.floor(rad/60);
      for(let q=0;q<np;q++){const a=R()*Math.PI*2,d=Math.sqrt(R())*rad,top=1-d/rad,lift=Math.sqrt(Math.max(0,top))*rad*0.42*(0.3+0.7*R());
        P.push(cx+Math.cos(a)*d*1.25,base+lift,cz+Math.sin(a)*d*0.9);SZ.push(rad*(0.7+0.6*R())*(0.6+top*0.6));HT.push(Math.min(1,lift/(rad*0.5)));}
      // the shadow: a soft blob under it, drawn wrapped so it runs off one edge and on at the other
      for(const [ox,oz] of [[0,0],[S,0],[-S,0],[0,S],[0,-S]]){const u=(cx-B.x0)/W*S+ox,v=(cz-B.z0)/Dz*S+oz,r=rad/W*S*1.1;
        const gr=sg.createRadialGradient(u,v,0,u,v,r);gr.addColorStop(0,'rgba(0,0,0,0.9)');gr.addColorStop(0.6,'rgba(0,0,0,0.55)');gr.addColorStop(1,'rgba(0,0,0,0)');sg.fillStyle=gr;sg.fillRect(u-r,v-r,2*r,2*r);}}
    const shadowT=new THREE.CanvasTexture(shadow);shadowT.wrapS=shadowT.wrapT=THREE.RepeatWrapping;
    // a puff: a dozen soft blobs piled into a round, so that no two points look like discs
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
void main(){vec4 t=texture2D(uMap,gl_PointCoord);float shade=mix(0.7,1.0,clamp(vTop*1.1+0.1,0.0,1.0));
 gl_FragColor=vec4(uTint*shade*uLight,min(1.0,t.a*1.15));if(gl_FragColor.a<0.01)discard;
 #include <fog_fragment>
}`});
    const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.renderOrder=3;pts.name='clouds';pts.userData.noWire=true;pts.userData.noShadow=true;scene.add(pts);
    return {shadowT,U,W,Dz,pts,wind:new THREE.Vector2(Y.cloudWind?Y.cloudWind[0]:9,Y.cloudWind?Y.cloudWind[1]:3)};})();
  const cloudU={uCloud:{value:CL.shadowT},uCloudOff:{value:new THREE.Vector2()},uCloudSpan:{value:new THREE.Vector2(CL.W,CL.Dz)},uCloudOrigin:{value:new THREE.Vector2(B.x0,B.z0)},uCloudK:{value:0.3},uSunXZ:{value:new THREE.Vector2()}};
  animHooks.push(now=>{const t=now/1000,day=1-nightF(hour());CL.U.uOff.value.set(CL.wind.x*t,CL.wind.y*t);cloudU.uCloudOff.value.copy(CL.U.uOff.value);
    CL.U.uLight.value=0.12+0.88*day;cloudU.uCloudK.value=0.32*day;CL.U.uScale.value=renderer.domElement.clientHeight/(2*Math.tan(camera.fov*Math.PI/360));
    // a low sun lights the clouds warm, and throws their shadows long
    const sd=api.sun?api.sun.position.clone().sub(api.sun.target.position).normalize():new THREE.Vector3(0,1,0);const low=1-Math.min(1,Math.max(0,sd.y*2.2));
    CL.U.uTint.value.setRGB(1,1-0.22*low,1-0.42*low);cloudU.uSunXZ.value.set(sd.x,sd.z).multiplyScalar(1/Math.max(0.25,sd.y));});

  // ---- the ground's surface ----
  // Close to, each kind of ground has a surface of its own, blended by the weights above and let go before it
  // is finer than a pixel: the lodgepole's crowns and gaps; grass mottled green and straw; sage in grey-green
  // bushes; sinter, cracked into plates, with the orange and brown of the bacterial mats run out across it in
  // channels and the grey of wet runoff; rock in strata; the burn's grey snags over the young green; wet meadow
  // with standing water; snow. The forest's edges are torn by noise, not smoothed. The cloud shadows go over all.
  {const m=terr[0].material;m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,cloudU);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aCovA;attribute vec4 aCovB;varying vec4 vCA;varying vec4 vCB;varying vec3 vWp;')
      .replace('#include <project_vertex>','#include <project_vertex>\nvWp=(modelMatrix*vec4(transformed,1.0)).xyz;vCA=aCovA;vCB=aCovB;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec4 vCA;varying vec4 vCB;varying vec3 vWp;
uniform sampler2D uCloud;uniform vec2 uCloudOff;uniform vec2 uCloudSpan;uniform vec2 uCloudOrigin;uniform float uCloudK;uniform vec2 uSunXZ;
float ysH(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float ysN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(ysH(i),ysH(i+vec2(1,0)),f.x),mix(ysH(i+vec2(0,1)),ysH(i+vec2(1,1)),f.x),f.y);}`)
      .replace('#include <color_fragment>',`#include <color_fragment>
{vec2 p=vWp.xz;float w=fwidth(vWp.x)+fwidth(vWp.z);
 float n1=clamp(1.0-w/5.0,0.0,1.0),n2=clamp(1.0-w/30.0,0.0,1.0),n3=clamp(1.0-w/160.0,0.0,1.0);
 vec3 c=diffuseColor.rgb;
 // the forest's edge, torn: split the colour into forest and not-forest and put the line back through noise
 float wF=vCA.x;
 if(wF>0.02&&wF<0.98){vec3 F=vec3(0.17,0.27,0.155)*(0.85+0.3*ysN(p/300.0));vec3 O=clamp((c-wF*F)/max(0.08,1.0-wF),0.0,1.0);
   float e=ysN(p/110.0)*0.55+ysN(p/31.0)*0.3+ysN(p/9.0)*0.15;float sharp=smoothstep(0.38,0.62,wF+(e-0.5)*0.8);
   c=mix(c,mix(O,F,sharp),clamp(wF*12.0,0.0,1.0)*clamp((1.0-wF)*12.0,0.0,1.0));wF=sharp;}
 // the canopy
 {float crowns=ysN(p/7.0)*n2,clumps=ysN(p/60.0+13.0)*n3,broad=ysN(p/400.0+7.0);
  c*=mix(1.0,0.72+0.45*crowns+0.3*(clumps-0.5)+0.2*(broad-0.5),wF);}
 // grass: green and straw in drifts, finer mottling close to
 {float g=ysN(p/140.0+5.0);vec3 straw=vec3(0.66,0.6,0.38),lush=vec3(0.42,0.52,0.28);
  vec3 cg=c*(1.0+0.2*(ysN(p/3.0)-0.5)*n1+0.14*(ysN(p/22.0)-0.5)*n2);cg=mix(cg,mix(lush,straw,g)*(0.9+0.2*ysN(p/40.0)),0.22);c=mix(c,cg,vCA.y);}
 // sage: grey-green bushes on pale ground
 {float bush=smoothstep(0.62,0.72,ysN(p/2.6))*n1;vec3 cs=c*(1.0+0.1*(ysN(p/18.0)-0.5));cs=mix(cs,vec3(0.43,0.47,0.37),bush*0.55+0.12*n2*ysN(p/9.0));c=mix(c,cs,vCA.z);}
 // sinter: cracked plates, the mats run out in orange and brown along the runoff, grey where it is wet
 {float nc=clamp(1.0-w/2.0,0.0,1.0),plates=(1.0-smoothstep(0.0,0.03,abs(ysN(p/1.7)-0.5)))*-0.1*nc;
  float flow=ysN(vec2(p.x/55.0+ysN(p/90.0)*2.5,p.y/18.0+ysN(p/70.0)*2.0));float mat=smoothstep(0.66,0.74,flow)*n3;
  float wet=smoothstep(0.78,0.86,ysN(p/11.0+9.0))*n2;
  vec3 ct=c*(0.95+plates)*(1.0-0.06*ysN(p/1.3)*nc)*(1.0+0.08*(ysN(p/45.0)-0.5));ct=mix(ct,mix(vec3(0.8,0.5,0.2),vec3(0.52,0.34,0.2),ysN(p/12.0)),mat*0.6);ct=mix(ct,ct*vec3(0.8,0.84,0.86),wet*0.5);
  c=mix(c,ct,vCA.w);}
 // rock: strata across the slope and grit
 {vec3 cr=c*(0.84+0.28*ysN(vec2(p.x/30.0+p.y/41.0,vWp.y/3.5)))*(1.0+0.15*(ysN(p/2.0)-0.5)*n1);c=mix(c,cr,vCB.x);}
 // the burn: grey snags standing over the young green
 {float snag=smoothstep(0.78,0.86,ysN(p/4.5))*n2;vec3 cb=mix(c*(1.0+0.15*(ysN(p/20.0)-0.5)),vec3(0.5,0.49,0.46),snag*0.6);c=mix(c,cb,vCB.y);}
 // wetland: standing water in the hollows, reeds between
 {float pool=smoothstep(0.7,0.76,ysN(p/20.0+4.0))*n3;vec3 cw=mix(c*(1.0+0.16*(ysN(p/3.5)-0.5)*n1),vec3(0.2,0.3,0.34),pool*0.75);c=mix(c,cw,vCB.z);}
 // snow: blue in its shadows, drifted
 {vec3 cn=c*(0.94+0.08*ysN(p/12.0))*vec3(0.97,0.99,1.03);c=mix(c,cn,vCB.w);}
 // and over all of it the broadest variation, so no plain is one colour from edge to edge
 c*=1.0+0.1*(ysN(p/900.0+2.0)-0.5);
 // the cloud shadows
 {float h=max(0.0,2600.0-vWp.y);vec2 uv=(p-uCloudOrigin-uCloudOff-uSunXZ*h)/uCloudSpan;c*=1.0-uCloudK*texture2D(uCloud,uv).a;}
 diffuseColor.rgb=c;}`);};
    m.needsUpdate=true;}

  // ---- rivers and streams, as ribbons on the ground ----
  {const pos=[],idx=[];let nv=0;const dec=f=>{const o=[];for(let i=0;i<f.length;i+=2)o.push([f[i]/10,f[i+1]/10]);return o;};
    // (the streams are drawn only within a few kilometres, in tiles; the rivers always)
    const SP=[],SI=[],streamTiles=new Map();let snv=0;const TS=6000;
    for(const r of land.rivers){const pts=dec(r.p),w=r.w,stepL=w>10?40:90,lift=w>10?1.6:1.1,res=[];
      if(w<=10){let T=null,key=null,open=false;
        for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/stepL));for(let k=0;k<n;k++)res.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n]);}
        res.push(pts[pts.length-1]);
        for(let i=0;i<res.length;i++){const [x,z]=res[i];if(inWater(x,z)||!api.inMap(x,z,0)){open=false;continue;}
          const k=Math.floor(x/TS)+','+Math.floor(z/TS);if(k!==key){key=k;T=streamTiles.get(k);if(!T){T={P:[],I:[],n:0,x:(Math.floor(x/TS)+0.5)*TS,z:(Math.floor(z/TS)+0.5)*TS};streamTiles.set(k,T);}open=false;}
          const a=res[Math.max(0,i-1)],b=res[Math.min(res.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2,y=groundH(x,z)+lift;
          T.P.push(x+nx,y,z+nz,x-nx,y,z-nz);if(open)T.I.push(T.n-2,T.n,T.n-1,T.n-1,T.n,T.n+1);T.n+=2;open=true;}
        continue;}
      for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/stepL));for(let k=0;k<n;k++)res.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n]);}
      res.push(pts[pts.length-1]);
      let open=false;
      for(let i=0;i<res.length;i++){const [x,z]=res[i];
        // a river running into a lake stops at the shore; the lake is drawn at its own level
        if(inWater(x,z)||!api.inMap(x,z,0)){open=false;continue;}
        const a=res[Math.max(0,i-1)],b=res[Math.min(res.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2,y=groundH(x,z)+lift;
        pos.push(x+nx,y,z+nz,x-nx,y,z-nz);
        if(open)idx.push(nv-2,nv,nv-1,nv-1,nv,nv+1);
        nv+=2;open=true;}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshPhongMaterial({color:0x3d6e86,specular:0x9fc4e0,shininess:60,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));
    m.name='rivers';m.userData.wireCat='water';m.receiveShadow=true;scene.add(m);
    const tiles=[];for(const T of streamTiles.values()){if(!T.n)continue;const gs=new THREE.BufferGeometry();gs.setAttribute('position',new THREE.Float32BufferAttribute(T.P,3));gs.setIndex(T.I);gs.computeVertexNormals();gs.computeBoundingSphere();
      const ms=new THREE.Mesh(gs,m.material);ms.name='streams';ms.userData.wireCat='water';ms.receiveShadow=true;scene.add(ms);tiles.push({m:ms,x:T.x,z:T.z});nv+=T.n;}
    {let t0=0;animHooks.push(now=>{if(now-t0<400)return;t0=now;const p=camera.position,reach=Y.streamsNear||10000;for(const q of tiles)q.m.visible=Math.hypot(q.x-p.x,q.z-p.z)<reach;});}
    ctx.details=Object.assign(ctx.details||{},{riverVerts:nv});}

  // ---- the roads through the fine patches, which the engine was not given (tools/make-yellowstone.py) ----
  {const pos=[],colr=[],idx=[];let nv=0;const road=col('#4a4b4f'),trail=col((C.roadColours||{}).trail||'#b8a888');
    for(const r of (land.patchRoads||[])){const pts=[];for(let i=0;i<r.p.length;i+=2)pts.push([r.p[i]/10,r.p[i+1]/10]);
      const res=[];for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/10));for(let k=0;k<n;k++)res.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n]);}
      res.push(pts[pts.length-1]);const c=r.c==='trail'?trail:road,w=r.w/2;
      for(let i=0;i<res.length;i++){const a=res[Math.max(0,i-1)],b=res[Math.min(res.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w,nz=dx/l*w,[x,z]=res[i];
        pos.push(x+nx,groundH(x+nx,z+nz)+0.35,z+nz,x-nx,groundH(x-nx,z-nz)+0.35,z-nz);colr.push(c.r,c.g,c.b,c.r,c.g,c.b);
        if(i)idx.push(nv-2,nv,nv-1,nv-1,nv,nv+1);nv+=2;}}
    if(nv){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.setIndex(idx);g.computeVertexNormals();
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6}));m.name='patch roads';m.userData.wireCat='road';m.receiveShadow=true;scene.add(m);}}

  // ---- the park boundary ----
  {const pts=[];for(const r of land.boundary){for(let i=0;i<r.length;i+=2){const x=r[i]/10,z=r[i+1]/10;pts.push(new THREE.Vector3(x,groundH(x,z)+8,z));}}
    if(pts.length){const segs=[];for(let i=0;i+1<pts.length;i++)if(pts[i].distanceTo(pts[i+1])<5000)segs.push(pts[i],pts[i+1]);
      const l=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs),new THREE.LineBasicMaterial({color:0xf0d890,transparent:true,opacity:0.5}));
      l.userData.noWire=true;l.name='park boundary';scene.add(l);}}

  // ---- the small springs: every mapped pool not built as a landmark, a coloured disc ----
  {const LM=new Set(C.landmarks.map(L=>L.name.toLowerCase())),R=mkRng(4410);
    const springs=POIS.filter(p=>(p.kind==='hot_spring'||p.kind==='geyser')&&!LM.has(p.name.toLowerCase()));
    const cols=['#1d6fa8','#2f93b8','#5fb4b8','#8ab870','#d8b040','#d67a34','#b8683c'].map(col);
    const im=new THREE.InstancedMesh(new THREE.CircleGeometry(1,8).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-10}),springs.length);
    const rim=new THREE.InstancedMesh(new THREE.CircleGeometry(1,8).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xc9c2b0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}),springs.length);
    const d=new THREE.Object3D();
    springs.forEach((p,i)=>{const r=p.w?Math.max(1.5,p.w*0.55):1.5+R()*4,y=groundH(p.x,p.z)+0.25;d.position.set(p.x,y,p.z);d.scale.set(r,1,r*(0.8+R()*0.3));d.rotation.y=R()*6;d.updateMatrix();
      im.setMatrixAt(i,d.matrix);im.setColorAt(i,cols[p.kind==='geyser'?Math.floor(R()*3):Math.floor(R()*cols.length)]);
      d.position.y=y-0.05;d.scale.multiplyScalar(1.45);d.updateMatrix();rim.setMatrixAt(i,d.matrix);});
    for(const m of [im,rim]){m.receiveShadow=true;m.userData.far=12000;scene.add(m);}
    // every one of them steams, a little
    for(const p of springs){const r=p.w?p.w*0.5:3;ctx.ysSteam.push({x:p.x,y:groundH(p.x,p.z),z:p.z,s:p.kind==='geyser'?0.3:0.22,size:Math.max(3,r),rise:Math.max(8,r*2.5),n:1});}
    ctx.details=Object.assign(ctx.details||{},{smallSprings:springs.length});}

  // ---- the steam ----
  {const V=ctx.ysSteam||[];
    // the basins: vents scattered over the bare ground, as many as the basin is big and busy
    for(const b of land.basins){const bx=b.x/10,bz=b.z/10,n=Math.round((Y.steamPerBasin||90)*b.s*Math.min(3,b.r/800)),R=mkRng(Math.floor(bx+bz));
      for(let k=0;k<n;k++){const a=R()*6.28,r=Math.sqrt(R())*b.r*0.85,x=bx+Math.cos(a)*r,z=bz+Math.sin(a)*r;if(inWater(x,z))continue;
        V.push({x,y:groundH(x,z),z,s:0.25+R()*0.35,size:4+R()*10,rise:15+R()*35,n:1});}}
    let N=0;for(const v of V)N+=v.n||Math.max(2,Math.round(v.s*10));
    const pos=new Float32Array(N*3),seed=new Float32Array(N),prm=new Float32Array(N*4),tint=new Float32Array(N*3),R=mkRng(77);let k=0;
    for(const v of V){const n=v.n||Math.max(2,Math.round(v.s*10)),t=v.tint?col(v.tint):null;
      for(let i=0;i<n;i++){pos[k*3]=v.x;pos[k*3+1]=v.y;pos[k*3+2]=v.z;seed[k]=R();prm[k*4]=v.s;prm[k*4+1]=v.size;prm[k*4+2]=v.rise;prm[k*4+3]=7+R()*7;
        tint[k*3]=t?t.r:0.96;tint[k*3+1]=t?t.g:0.97;tint[k*3+2]=t?t.b:0.98;k++;}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aSeed',new THREE.BufferAttribute(seed,1));
    g.setAttribute('aPrm',new THREE.BufferAttribute(prm,4));g.setAttribute('aTint',new THREE.BufferAttribute(tint,3));g.computeBoundingSphere();
    const scaleU={value:600};
    const m=softPoints(THREE,`attribute float aSeed;attribute vec4 aPrm;attribute vec3 aTint;uniform vec2 uWind;uniform float uHumid;
void main(){
 float u=fract(uTime/aPrm.w+aSeed),rise=aPrm.z*uHumid;
 float j=fract(aSeed*91.7)-0.5,j2=fract(aSeed*57.3)-0.5;
 // up, spreading, and leaning away downwind as it goes
 vec3 p=position+vec3(j*aPrm.y*0.5+uWind.x*u*u*rise,u*rise,j2*aPrm.y*0.5+uWind.y*u*u*rise);
 vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;
 gl_PointSize=clamp(aPrm.y*(0.5+1.6*u)*(0.8+0.4*uHumid)*uScale/-mvPosition.z,0.0,700.0);
 vA=aPrm.x*0.5*smoothstep(0.0,0.12,u)*pow(1.0-u,1.5)*min(1.0,uHumid);vC=aTint;
 #include <fog_vertex>
}`,{uWind:{value:new THREE.Vector2(0.6,0.25)},uHumid:{value:1},uScale:scaleU});
    const pts=new THREE.Points(g,m);pts.name='steam';pts.userData.noShadow=true;pts.userData.noWire=true;pts.renderOrder=2;scene.add(pts);
    // Steam shows best on a cold still morning and hardly at all on a hot afternoon, which is true and also
    // what makes the basins look different at different hours.
    animHooks.push(now=>{const h=hour();m.uniforms.uTime.value=now/1000;m.uniforms.uLight.value=lightNow();
      m.uniforms.uHumid.value=1.35-0.55*Math.max(0,Math.min(1,(h-8)/5))+0.45*Math.max(0,Math.min(1,(h-18)/3));
      scaleU.value=renderer.domElement.clientHeight/(2*Math.tan(camera.fov*Math.PI/360));});
    ctx.details=Object.assign(ctx.details||{},{steamVents:V.length,steamPoints:N});}

  // ---- the forest ----
  // Four kinds of tree, each a unit geometry scaled per instance:
  //   lodgepole   most of the park: a bare trunk most of the way up and a narrow crown - they grow in stands so
  //               close they self-prune, which is what the name is from
  //   spruce-fir  Engelmann spruce and subalpine fir, high up and in the wet draws: a dark spire in tiers
  //   Douglas-fir the lower, drier north (Lamar, Mammoth, the Yellowstone below Tower): broad and blue-green
  //   aspen       in clones at the edges of the northern meadows and sage: white trunks, round light crowns
  // and the snags of the burn. Near the camera each is the whole tree; past a kilometre it is a three-sided
  // spike of its own colour - a twentieth of the triangles, and at that range nobody can tell.
  const merge=(parts)=>{const pos=[],colr=[];for(const [g0,c] of parts){const g=g0.index?g0.toNonIndexed():g0;pos.push(...g.attributes.position.array);for(let i=0;i<g.attributes.position.count;i++)colr.push(c[0],c[1],c[2]);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.computeVertexNormals();return g;};
  const BARK=[0.55,0.42,0.34],WHITE=[1,1,1];
  const GEO={
    lodge:merge([[new THREE.CylinderGeometry(0.018,0.03,0.42,4,1,true).translate(0,0.21,0),BARK],[new THREE.ConeGeometry(0.13,0.72,6,1,true).translate(0,0.64,0),WHITE]]),
    spruce:merge([[new THREE.CylinderGeometry(0.015,0.025,0.2,4,1,true).translate(0,0.1,0),BARK],[new THREE.ConeGeometry(0.2,0.45,7,1,true).translate(0,0.36,0),WHITE],
      [new THREE.ConeGeometry(0.15,0.38,7,1,true).translate(0,0.6,0),WHITE],[new THREE.ConeGeometry(0.09,0.3,6,1,true).translate(0,0.84,0),WHITE]]),
    doug:merge([[new THREE.CylinderGeometry(0.025,0.04,0.3,5,1,true).translate(0,0.15,0),BARK],[new THREE.ConeGeometry(0.26,0.55,7,1,true).translate(0,0.5,0),WHITE],[new THREE.ConeGeometry(0.17,0.4,7,1,true).translate(0,0.8,0),WHITE]]),
    aspen:merge([[new THREE.CylinderGeometry(0.018,0.026,0.55,5,1,true).translate(0,0.27,0),[0.86,0.84,0.8]],[new THREE.IcosahedronGeometry(0.13,0).scale(0.9,1.6,0.9).translate(0,0.66,0),WHITE],[new THREE.IcosahedronGeometry(0.1,0).scale(1,1.4,1).translate(0.07,0.52,0.04),WHITE],[new THREE.IcosahedronGeometry(0.09,0).scale(1,1.3,1).translate(-0.06,0.5,-0.05),WHITE]]),
    far:new THREE.ConeGeometry(0.16,0.95,3,1,true).translate(0,0.5,0)};
  const snagGeo=new THREE.CylinderGeometry(0.007,0.02,1,4,1,true).translate(0,0.5,0);
  const treeM=new THREE.MeshLambertMaterial({vertexColors:true}),farM=new THREE.MeshLambertMaterial(),snagM=new THREE.MeshLambertMaterial({color:0x6e6960});
  const TILE=Y.forestTile||800,NEAR=Y.forestNear||3200,PER=Y.forestPerTile||3400,FULL=Y.forestFull||1100;
  const tiles=new Map();
  const PALS={lodge:['#2e4a2a','#355530','#28422a','#3a5a32','#2c4630'],young:['#4f7a3a','#5a8440','#46703a'],spruce:['#1f3a26','#243f2a','#1b3322'],doug:['#2e4a38','#35503c','#2a4434'],aspen:['#5f7f3e','#6a8a44','#74904a','#7e9650']};
  for(const k in PALS)PALS[k]=PALS[k].map(col);
  // the Douglas-fir and aspen country: the lower, drier north of the park
  const northLow=(x,z,abs)=>{const [la]=ctx.toLatLon(x,z);return la>44.82&&abs<2250;};
  function buildTile(tx,tz){
    const R=mkRng(tx*73856093^tz*19349663),d=new THREE.Object3D(),L={lodge:[],spruce:[],doug:[],aspen:[]},S=[],FAR=[],FC=[];
    for(let k=0;k<PER;k++){const x=(tx+R())*TILE,z=(tz+R())*TILE,r=R(),cov=coverAt(x,z);
      // how likely a tree is here, by what grows here
      let p=0,young_=false,snag=false;
      if(cov===0)p=0.92;else if(cov===6){if(r<0.6){p=1;young_=true;}else if(r<0.68){p=1;snag=true;}}
      else if(cov===1)p=0.006;else if(cov===2)p=0.01;else if(cov===3)p=0.08;else if(cov===4)p=0.1;
      const y=groundH(x,z),abs=y+datum,north=northLow(x,z,abs);
      // aspen stand in clones at the meadow edges in the north
      const clone=north&&(cov===1||cov===2)&&hash3(Math.round(x/220),Math.round(z/220),9)>0.86;if(clone)p=0.35;
      if(R()>p)continue;
      if(!api.inMap(x,z,20)||inWater(x,z))continue;
      if(abs>3200)continue;   // the treeline
      if(roadsNear(x,z,5,q=>q.c!=='trail').length)continue;
      d.position.set(x,y-0.3,z);d.rotation.set(0,R()*6.28,0);
      if(snag){const h=6+R()*8;d.scale.set(h,h,h);d.updateMatrix();S.push(d.matrix.clone());continue;}
      const kind=clone?'aspen':young_?'lodge':(abs>2750||cov===3)&&R()<0.7?'spruce':north&&R()<0.6?'doug':'lodge';
      const h=young_?3+R()*6:kind==='spruce'?14+R()*14:kind==='doug'?16+R()*16:kind==='aspen'?8+R()*8:13+R()*14,wd=young_?1.4:kind==='doug'?1.1:1;
      d.scale.set(h*wd,h,h*wd);d.updateMatrix();const c=(young_?PALS.young:PALS[kind])[Math.floor(R()*(young_?3:PALS[kind].length))];
      L[kind].push([d.matrix.clone(),c]);FAR.push(d.matrix.clone());FC.push(c);}
    const cx=(tx+0.5)*TILE,cz=(tz+0.5)*TILE,sph=new THREE.Sphere(new THREE.Vector3(cx,groundH(cx,cz)+10,cz),TILE*0.75+40);
    const mk=(geo,mat,arr,cols)=>{if(!arr.length)return null;const g=new THREE.BufferGeometry();for(const a in geo.attributes)g.setAttribute(a,geo.attributes[a]);if(geo.index)g.setIndex(geo.index);g.boundingSphere=sph;
      const im=new THREE.InstancedMesh(g,mat,arr.length);arr.forEach((m,i)=>im.setMatrixAt(i,m));if(cols)cols.forEach((c,i)=>im.setColorAt(i,c));
      im.castShadow=false;im.receiveShadow=true;im.userData.noWire=true;im.userData.total=arr.length;scene.add(im);return im;};
    const near=[];for(const kind in L){const a=L[kind];if(a.length)near.push(mk(GEO[kind],treeM,a.map(q=>q[0]),a.map(q=>q[1])));}
    return {near,far:mk(GEO.far,farM,FAR,FC),s:mk(snagGeo,snagM,S,null),cx,cz,used:0};
  }
  let lastT=0,built=0;
  animHooks.push(now=>{if(now-lastT<200)return;lastT=now;
    const cp=camera.position,above=cp.y-groundH(cp.x,cp.z);
    // from high up the ground's colour is the forest; there is no point drawing trees nobody can see
    const reach=above>4500?0:NEAR*Math.max(0.35,Math.min(1,1.4-above/4000));
    const ti0=Math.floor((cp.x-reach)/TILE),ti1=Math.floor((cp.x+reach)/TILE),tj0=Math.floor((cp.z-reach)/TILE),tj1=Math.floor((cp.z+reach)/TILE);
    let made=0,tris=0;
    for(let tj=tj0;tj<=tj1&&reach>0;tj++)for(let ti=ti0;ti<=ti1;ti++){const key=ti+','+tj;const cx=(ti+0.5)*TILE,cz=(tj+0.5)*TILE,dist=Math.hypot(cx-cp.x,cz-cp.z);
      if(dist>reach+TILE*0.7)continue;
      let t=tiles.get(key);if(!t){if(made>=2)continue;t=buildTile(ti,tj);tiles.set(key,t);made++;built++;}
      t.used=now;}
    // thin with distance: the instances are in random order, so drawing the first part of them thins evenly;
    // near tiles draw the whole trees, far ones the spikes
    for(const [key,t] of tiles){const dist=Math.hypot(t.cx-cp.x,t.cz-cp.z),on=reach>0&&dist<=reach+TILE*0.7,full=on&&dist<FULL;
      const f=on?Math.max(0.1,Math.min(1,1.2-dist/(NEAR*0.85))):0;
      for(const im of t.near)if(im){im.visible=full;im.count=Math.max(1,Math.floor(im.userData.total*f));}
      if(t.far){t.far.visible=on&&!full;t.far.count=Math.max(1,Math.floor(t.far.userData.total*f));}
      if(t.s){t.s.visible=on&&dist<FULL*1.6;t.s.count=Math.max(1,Math.floor(t.s.userData.total*f));}
      // drop what has not been near the camera for a minute
      if(!on&&now-t.used>60000){for(const im of [...t.near,t.far,t.s])if(im){scene.remove(im);im.dispose();}tiles.delete(key);}}
    ctx.details.forestTiles=tiles.size;});
  ctx.details=Object.assign(ctx.details||{},{recoloured,forest:'lodgepole, spruce-fir, Douglas-fir and aspen in '+TILE+' m tiles within '+NEAR+' m, whole within '+FULL+' m'});
}
