// ---------- sky: streaked deep blue, red sun, green moon, jungle horizon ----------
function skyTexture(){
  const w=1024,h=512,cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,h);
  gr.addColorStop(0,'#100c40');gr.addColorStop(0.35,'#1e1a70');gr.addColorStop(0.5,'#2c2a8c');gr.addColorStop(0.53,'#3a3a9c');
  gr.addColorStop(0.56,'#1a3e2a');gr.addColorStop(0.7,'#12301e');gr.addColorStop(1,'#0a1c12');
  g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let i=0;i<70;i++){const y=rr(20,250);g.strokeStyle=`rgba(${Math.floor(rr(110,170))},${Math.floor(rr(130,180))},${Math.floor(rr(200,240))},${rr(0.08,0.22)})`;g.lineWidth=rr(1,5);g.beginPath();
    for(let x=0;x<=w;x+=16)g.lineTo(x,y+Math.sin(x*0.02+i)*rr(2,6)+Math.sin(x*0.007+i*3)*8);g.stroke();}
  const t=new THREE.CanvasTexture(cv);return t;
}
const skyMat=new THREE.ShaderMaterial({uniforms:{map:{value:skyTexture()},izFog:ENV.izFog,izDust:ENV.izDust,izFlash:ENV.izFlash,izSunDir:ENV.izSunDir,izDay:ENV.izDay,izNight:ENV.izNight,izRain:ENV.izRain,izTime:ENV.izTime},side:THREE.BackSide,depthWrite:false,
  vertexShader:`varying vec2 izSkyUv;varying vec3 izDir;void main(){izSkyUv=uv;izDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform sampler2D map;uniform float izFog;uniform float izDust;uniform float izFlash;uniform vec3 izSunDir;uniform float izDay;uniform float izNight;uniform float izRain;uniform float izTime;varying vec2 izSkyUv;varying vec3 izDir;
float izH1(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){
  vec3 d=normalize(izDir);
  vec3 col=texture2D(map,izSkyUv).rgb*mix(vec3(0.36,0.38,0.64),vec3(1.0),izDay);
  float low=1.0-smoothstep(0.0,0.35,abs(izSunDir.y+0.02));
  vec2 sh=normalize(izSunDir.xz+vec2(1e-4));vec2 dh=normalize(d.xz+vec2(1e-4));
  float toward=pow(max(dot(sh,dh),0.0),3.0);
  float band=exp(-abs(d.y-0.02)*7.0);
  col+=(vec3(0.95,0.38,0.2)*toward+vec3(0.35,0.16,0.42)*(0.35+0.3*toward))*band*low*(1.0-0.7*izRain);
  vec3 q=d*240.0;vec3 cell=floor(q);vec3 f=fract(q)-0.5;float r=izH1(cell);
  float star=step(0.993,r)*(1.0-smoothstep(0.0,0.32,length(f)))*smoothstep(0.04,0.22,d.y);
  float tw=0.65+0.35*sin(izTime*(2.0+r*5.0)+r*60.0);
  col+=vec3(0.85,0.9,1.0)*star*tw*izNight*(1.0-izRain)*(0.6+0.4*fract(r*97.0));
  col=mix(col,vec3(dot(col,vec3(0.33)))*vec3(0.95,0.97,1.05)*0.8,izRain*0.7);
  col=mix(col,vec3(dot(col,vec3(0.33)))*1.25+vec3(0.06),izFog*0.75*(1.0-smoothstep(0.0,0.5,d.y)*0.5));
  col=mix(col,vec3(0.8,0.62,0.4)*(0.3+0.7*izDay),izDust*0.6);
  col+=vec3(0.45,0.47,0.55)*izFlash*(0.4+0.6*max(d.y,0.0));
  gl_FragColor=vec4(col,1.0);
}`});const sky=new THREE.Mesh(new THREE.SphereGeometry(2600,28,18),skyMat);scene.add(sky);
function sunTexture(){const s=256,cv=document.createElement('canvas');cv.width=cv.height=s;const g=cv.getContext('2d');
  g.beginPath();g.arc(128,128,100,0,7);g.fillStyle='#d5262d';g.fill();
  for(let i=0;i<40;i++){g.beginPath();g.arc(rr(50,206),rr(50,206),rr(8,30),rr(0,6),rr(0,6));g.strokeStyle='rgba(120,10,25,.55)';g.lineWidth=rr(2,5);g.stroke();}
  g.save();g.beginPath();g.arc(128,128,100,0,7);g.clip();for(let i=0;i<30;i++){g.beginPath();g.arc(rr(30,226),rr(30,226),rr(10,40),0,7);g.strokeStyle='rgba(255,90,80,.25)';g.lineWidth=2;g.stroke();}g.restore();
  g.strokeStyle='#ff6a3a';g.lineWidth=2;for(let i=0;i<64;i++){const a=i/64*Math.PI*2;g.beginPath();g.moveTo(128+103*Math.cos(a),128+103*Math.sin(a));g.lineTo(128+113*Math.cos(a),128+113*Math.sin(a));g.stroke();}
  return new THREE.CanvasTexture(cv);}
function moonTexture(){const s=256,cv=document.createElement('canvas');cv.width=cv.height=s;const g=cv.getContext('2d');
  g.beginPath();g.arc(128,128,100,0,7);g.fillStyle='#3e9a3a';g.fill();
  g.save();g.beginPath();g.arc(128,128,100,0,7);g.clip();
  for(let i=0;i<28;i++){g.beginPath();g.ellipse(rr(30,226),rr(30,226),rr(6,26),rr(4,14),rr(0,3),0,7);g.fillStyle=pick(['#2b6fd8','#3b8fe0','#1f56b8']);g.fill();}
  for(let i=0;i<30;i++){g.beginPath();g.arc(rr(30,226),rr(30,226),rr(4,12),0,7);g.fillStyle='rgba(120,220,90,.5)';g.fill();}
  const sh=g.createRadialGradient(70,110,20,128,128,110);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(0.75,'rgba(0,10,30,0.15)');sh.addColorStop(1,'rgba(0,10,30,0.75)');g.fillStyle=sh;g.fillRect(0,0,s,s);g.restore();
  return new THREE.CanvasTexture(cv);}
const sunSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:sunTexture(),fog:false,depthWrite:false}));sunSprite.scale.set(380,380,1);scene.add(sunSprite);
// the green moon keeps its place in the painting but waxes and wanes over eight days; a small pale moon crosses the sky every twenty hours
const MOONS=(()=>{const base=moonTexture().image,base2=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');const R=mkRng(606);
    g.beginPath();g.arc(64,64,52,0,7);g.fillStyle='#cfc6ea';g.fill();g.save();g.beginPath();g.arc(64,64,52,0,7);g.clip();
    for(let i=0;i<22;i++){g.beginPath();g.arc(12+R()*104,12+R()*104,2+R()*9,0,7);g.fillStyle=`rgba(120,105,160,${0.2+R()*0.3})`;g.fill();}g.restore();return cv;})();
  const make=(src,size)=>{const cv=document.createElement('canvas');cv.width=cv.height=size;const tex=new THREE.CanvasTexture(cv);return {src,cv,tex,step:-1};};
  const draw=(m,phase)=>{const step=Math.floor(phase*32);if(step===m.step)return;m.step=step;const S=m.cv.width,g=m.cv.getContext('2d'),r=S*0.39;g.clearRect(0,0,S,S);g.drawImage(m.src,0,0,S,S);
    const p=(step+0.5)/32,off=2*r*(p<0.5?p*2:(p-1)*2);   // shadow disc slides across: new at 0, full at 0.5
    g.save();g.globalCompositeOperation='source-atop';g.beginPath();g.arc(S/2+off,S/2,r*1.02,0,7);g.fillStyle='rgba(6,10,28,0.9)';g.fill();g.restore();m.tex.needsUpdate=true;};
  return {a:make(base,256),b:make(base2,128),draw};})();
ctx.moons=MOONS;
const moonSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:MOONS.a.tex,fog:false,depthWrite:false,transparent:true}));moonSprite.scale.set(180,180,1);scene.add(moonSprite);
const moon2=new THREE.Sprite(new THREE.SpriteMaterial({map:MOONS.b.tex,fog:false,depthWrite:false,transparent:true}));moon2.scale.set(70,70,1);scene.add(moon2);
