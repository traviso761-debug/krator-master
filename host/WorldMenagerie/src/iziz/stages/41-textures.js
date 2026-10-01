// ---------- textures: procedural canvas maps, tiled in world units via a vertex-shader hook ----------
await stage('textures');
section('textures',()=>{
function texCanvas(size,fn){const cv=document.createElement('canvas');cv.width=cv.height=size;const g=cv.getContext('2d');fn(g,size);const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
function speckle(g,size,n,lo,hi,a){for(let i=0;i<n;i++){const v=Math.floor(rr(lo,hi));g.fillStyle=`rgba(${v},${v},${v},${a})`;g.fillRect(rnd()*size,rnd()*size,rr(1,4),rr(1,4));}}
const TEX={
  sand:texCanvas(256,(g,S)=>{g.fillStyle='#e6dccb';g.fillRect(0,0,S,S);speckle(g,S,6000,120,255,0.18);
    const rows=6;for(let r=0;r<rows;r++){const y=r*S/rows;g.fillStyle='rgba(60,40,20,0.16)';g.fillRect(0,y,S,2);const off=(r%2)*S/6;for(let c=0;c<3;c++){g.fillRect((off+c*S/3)%S,y,1.5,S/rows);}
      g.fillStyle=`rgba(255,255,255,${rr(0,0.06)})`;g.fillRect(0,y+2,S,S/rows-2);}}),
  ashlar:texCanvas(256,(g,S)=>{g.fillStyle='#e4d6c2';g.fillRect(0,0,S,S);const rows=4,cols=3;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=((r%2)*S/(cols*2)+c*S/cols)%S,y=r*S/rows,v=Math.floor(rr(-14,14));g.fillStyle=`rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)/100})`;g.fillRect(x,y,S/cols,S/rows);}
    speckle(g,S,3000,80,255,0.16);
    for(let r=0;r<rows;r++){g.fillStyle='rgba(50,30,15,0.28)';g.fillRect(0,r*S/rows,S,3);for(let c=0;c<cols;c++){g.fillRect(((r%2)*S/(cols*2)+c*S/cols)%S,r*S/rows,2.5,S/rows);}}}),
  timber:texCanvas(256,(g,S)=>{g.fillStyle='#d9c4a6';g.fillRect(0,0,S,S);const planks=8;
    for(let p=0;p<planks;p++){const x=p*S/planks,v=Math.floor(rr(-12,12));g.fillStyle=`rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)/100})`;g.fillRect(x,0,S/planks,S);
      g.fillStyle='rgba(40,25,10,0.35)';g.fillRect(x,0,2,S);
      for(let k=0;k<7;k++){g.strokeStyle=`rgba(70,45,20,${rr(0.08,0.22)})`;g.lineWidth=rr(0.6,1.6);g.beginPath();const gx=x+rr(3,S/planks-3);g.moveTo(gx,0);for(let y=0;y<=S;y+=16)g.lineTo(gx+Math.sin(y*0.05+k)*1.5,y);g.stroke();}}}),
  concrete:texCanvas(256,(g,S)=>{g.fillStyle='#d8d4cc';g.fillRect(0,0,S,S);speckle(g,S,9000,90,230,0.14);
    g.fillStyle='rgba(30,30,30,0.18)';g.fillRect(0,S/2-1,S,2);g.fillRect(S/2-1,0,2,S);
    for(let i=0;i<10;i++){g.fillStyle='rgba(40,40,40,0.06)';g.beginPath();g.ellipse(rnd()*S,rnd()*S,rr(8,30),rr(4,12),rr(0,3),0,7);g.fill();}}),
  metal:texCanvas(256,(g,S)=>{g.fillStyle='#d4d2cc';g.fillRect(0,0,S,S);
    for(let y=0;y<S;y+=2){g.fillStyle=`rgba(0,0,0,${rr(0,0.12)})`;g.fillRect(0,y,S,1);}
    g.fillStyle='rgba(20,20,20,0.3)';g.fillRect(0,S/2-1,S,2);for(let x=8;x<S;x+=24){g.beginPath();g.arc(x,S/2+6,2,0,7);g.fill();g.beginPath();g.arc(x,S/2-6,2,0,7);g.fill();}}),
  stripes:texCanvas(128,(g,S)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#ffffff':'#cfc4b0';g.fillRect(i*S/8,0,S/8,S);}speckle(g,S,800,150,255,0.15);}),
  shingle:texCanvas(256,(g,S)=>{g.fillStyle='#c9b394';g.fillRect(0,0,S,S);const rows=8,cols=6;
    for(let r=0;r<rows;r++){const y=r*S/rows,off=(r%2)*S/(cols*2);for(let c=-1;c<=cols;c++){const x=off+c*S/cols,v=Math.floor(rr(-16,12));
      g.fillStyle=`rgb(${201+v},${179+v},${148+v})`;g.fillRect(x+1,y,S/cols-2,S/rows-1);
      g.fillStyle='rgba(40,25,10,0.45)';g.fillRect(x+1,y+S/rows-3,S/cols-2,3);g.fillRect(x,y,1.5,S/rows);
      g.fillStyle='rgba(255,255,255,0.08)';g.fillRect(x+1,y,S/cols-2,2);}}}),
  bark:texCanvas(128,(g,S)=>{g.fillStyle='#cdbfa8';g.fillRect(0,0,S,S);for(let i=0;i<70;i++){g.strokeStyle=`rgba(50,30,15,${rr(0.15,0.45)})`;g.lineWidth=rr(0.8,2.5);g.beginPath();const x=rnd()*S;g.moveTo(x,0);for(let y=0;y<=S;y+=12)g.lineTo(x+Math.sin(y*0.08+i)*2,y);g.stroke();}
    speckle(g,S,900,60,200,0.2);}),
  leaf:texCanvas(128,(g,S)=>{g.fillStyle='#d6d6c8';g.fillRect(0,0,S,S);speckle(g,S,1400,90,255,0.2);
    g.strokeStyle='rgba(30,60,30,0.35)';g.lineWidth=2;g.beginPath();g.moveTo(S/2,0);g.lineTo(S/2,S);g.stroke();
    for(let y=6;y<S;y+=10){g.strokeStyle='rgba(30,60,30,0.22)';g.lineWidth=1;g.beginPath();g.moveTo(S/2,y);g.lineTo(S,y+8);g.moveTo(S/2,y);g.lineTo(0,y+8);g.stroke();}}),
  canopy:texCanvas(128,(g,S)=>{g.fillStyle='#d2d6c4';g.fillRect(0,0,S,S);for(let i=0;i<260;i++){const v=Math.floor(rr(-40,30));g.fillStyle=`rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)/100})`;g.beginPath();g.ellipse(rnd()*S,rnd()*S,rr(3,9),rr(2,5),rr(0,3),0,7);g.fill();}}),
  paving:texCanvas(256,(g,S)=>{g.fillStyle='#8a8a8a';g.fillRect(0,0,S,S);const n=5;
    for(let r=0;r<n;r++)for(let c=0;c<n;c++){const x=c*S/n+(r%2)*S/(2*n),y=r*S/n,v=Math.floor(rr(-18,18));g.fillStyle=`rgb(${138+v},${138+v},${138+v})`;g.fillRect(x+2,y+2,S/n-4,S/n-4);}
    g.fillStyle='rgba(20,20,20,0.5)';for(let r=0;r<=n;r++){g.fillRect(0,r*S/n-1,S,2);}for(let r=0;r<n;r++)for(let c=0;c<=n;c++){g.fillRect(c*S/n+(r%2)*S/(2*n)-1,r*S/n,2,S/n);}
    speckle(g,S,3000,60,200,0.2);for(let i=0;i<6;i++){g.strokeStyle='rgba(20,20,20,0.35)';g.lineWidth=1;g.beginPath();let x=rnd()*S,y=rnd()*S;g.moveTo(x,y);for(let k=0;k<6;k++){x+=rr(-12,12);y+=rr(-12,12);g.lineTo(x,y);}g.stroke();}}),
  grass:texCanvas(256,(g,S)=>{g.fillStyle='#7f8a70';g.fillRect(0,0,S,S);for(let i=0;i<900;i++){const v=Math.floor(rr(-45,45));g.fillStyle=`rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)/100})`;g.beginPath();g.ellipse(rnd()*S,rnd()*S,rr(2,7),rr(1,3),rr(0,3),0,7);g.fill();}
    for(let i=0;i<500;i++){g.strokeStyle=`rgba(${Math.floor(rr(20,60))},${Math.floor(rr(50,90))},${Math.floor(rr(20,50))},0.35)`;g.lineWidth=1;g.beginPath();const x=rnd()*S,y=rnd()*S;g.moveTo(x,y);g.lineTo(x+rr(-3,3),y-rr(3,8));g.stroke();}}),
  detail:texCanvas(256,(g,S)=>{g.fillStyle='#808080';g.fillRect(0,0,S,S);speckle(g,S,14000,40,220,0.25);for(let i=0;i<60;i++){g.fillStyle=`rgba(${Math.floor(rr(60,200))},${Math.floor(rr(60,200))},${Math.floor(rr(60,200))},0.12)`;g.beginPath();g.arc(rnd()*S,rnd()*S,rr(4,22),0,7);g.fill();}})
};
const SCALE={sand:0.12,ashlar:0.08,timber:0.22,concrete:0.06,metal:0.16,stripes:0.55,shingle:0.18,bark:0.35,leaf:0.3,canopy:0.25};
const uvHook=K=>sh=>{sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>',`#ifdef USE_UV
#ifdef USE_INSTANCING
mat4 _m=modelMatrix*instanceMatrix;
#else
mat4 _m=modelMatrix;
#endif
vec3 _sc=vec3(length(_m[0].xyz),length(_m[1].xyz),length(_m[2].xyz));
vUv=uv*vec2(max(_sc.x,_sc.z),_sc.y)*${K.toFixed(4)};
#endif`);};
const done=new Set();
scene.traverse(o=>{if(!o.isMesh)return;const mats=Array.isArray(o.material)?o.material:[o.material];
  for(const m of mats){if(!m||done.has(m)||!m.isMeshLambertMaterial||m.userData.env)continue;done.add(m);
    const key=m.userData.tex;let K=null;if(key&&TEX[key]&&!m.map){m.map=TEX[key];K=SCALE[key];}
    setEnv(m,{K,weather:!!m.userData.weather,wind:m.userData.wind||0,reed:m.userData.reed||0,lod:m.userData.lod||false});}});
ctx.envMats=done.size;
// terrain: a world-space detail map on top of the painted street canvas so the ground holds up close
terrainMat.userData.env=true;terrainMat.customProgramCacheKey=()=>'terrain';
terrainMat.onBeforeCompile=sh=>{applyEnv(sh,{fbody:`{
float izPud=izGray*smoothstep(0.52,0.72,texture2D(detailMap,vWxz*0.021).r)*izWet;
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.15,0.16,0.23)*(0.45+0.55*izDay),izPud*0.7);
vec2 izCl=floor(vWxz*1.6);vec2 izFq=fract(vWxz*1.6)-0.5;float izHr=fract(sin(dot(izCl,vec2(12.9898,78.233)))*43758.5453);
float izAg=fract(izTime*1.1+izHr);float izRg=(1.0-smoothstep(0.0,0.06,abs(length(izFq)-izAg*0.48)))*(1.0-izAg);
totalEmissiveRadiance+=vec3(0.45,0.5,0.6)*izRg*izRain*izGray*0.25*(0.3+0.7*izDay);
}
`});   // puddles on paving when wet, rings while it rains
  sh.uniforms.detailMap={value:TEX.detail};sh.uniforms.pavingMap={value:TEX.paving};sh.uniforms.grassMap={value:TEX.grass};
  sh.vertexShader='varying vec2 vWxz;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWxz=(modelMatrix*vec4(position,1.0)).xz;');
  sh.fragmentShader='uniform sampler2D detailMap;uniform sampler2D pavingMap;uniform sampler2D grassMap;\nvarying vec2 vWxz;\n'+sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
  float izGray=0.0;
  {vec3 c=diffuseColor.rgb;float gray=1.0-clamp((abs(c.r-c.g)+abs(c.g-c.b))*9.0,0.0,1.0);float green=clamp((c.g-c.r)*6.0,0.0,1.0);
   float earth=0.7+0.6*texture2D(detailMap,vWxz*0.09).r;float pav=0.35+1.3*texture2D(pavingMap,vWxz*0.16).r;float gr=0.45+1.1*texture2D(grassMap,vWxz*0.12).r;
   diffuseColor.rgb*=mix(mix(earth,gr,green),pav,gray);izGray=gray;}`);};
terrainMat.needsUpdate=true;
});
