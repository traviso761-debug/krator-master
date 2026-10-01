// ---------- particles: morning mist in the chasm, spray at the outfall, chimney smoke, vent steam, fireflies, rain ----------
await stage('particles');
section('particles',()=>{
const FX={};
const soft=`float izD=length(gl_PointCoord-0.5);`;
function pointsMat(vs,fs,additive){return new THREE.ShaderMaterial({uniforms:{izFog:ENV.izFog,izTime:ENV.izTime,izPx:ENV.izPx,izWind:ENV.izWind,izLight:ENV.izLight,izRain:ENV.izRain,izNight:ENV.izNight,izMist:{value:0}},
  vertexShader:`uniform float izFog;uniform float izTime;uniform float izPx;uniform vec2 izWind;uniform float izLight;uniform float izRain;uniform float izNight;uniform float izMist;attribute vec4 izP;varying float vA;varying vec3 vC;
float izWallR(float t){return 235.0+22.0*sin(3.0*t+1.0)+10.0*sin(7.0*t+2.0)+6.0*sin(11.0*t);}
void main(){${vs}}`,
  fragmentShader:`varying float vA;varying vec3 vC;void main(){${soft}${fs}}`,transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending});}
// vents at the spaceport fuel farm (world positions of two points on the bund)
{const fa=195*Math.PI/180,th=Math.PI/2-fa,fx=SP.x+62*Math.cos(fa),fz=SP.z+62*Math.sin(fa),yb=SPH-0.2+1.4;
 for(const v of [[-16.5,-9.5],[16.5,9.5]]){const x=fx+v[0]*Math.cos(th)+v[1]*Math.sin(th),z=fz-v[0]*Math.sin(th)+v[1]*Math.cos(th);
   scene.add(mesh(cyl(0.45,0.55,5,8),lamC(0x8a8c90),x,yb+2.5,z,1,1,1,0));scene.add(mesh(cyl(0.6,0.6,0.4,8),lamC(0x5c5a54),x,yb+5,z,1,1,1,0));SMOKE.push([x,yb+5.3,z,1]);}}
// emitters: smoke, steam and spray share one point cloud; each particle's age loops
{const pos=[],pp=[];for(const e of SMOKE){const n=e[3]===0?14:e[3]===1?16:18;for(let k=0;k<n;k++){pos.push(e[0],e[1],e[2]);pp.push(k/n+xrr(-0.02,0.02),e[3],xr(),xr());}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('izP',new THREE.Float32BufferAttribute(pp,4));
 const m=pointsMat(`float kind=izP.y;float rate=kind<0.5?0.11:(kind<1.5?0.3:0.45);float age=fract(izTime*rate+izP.x);
  float rise=kind<0.5?16.0:(kind<1.5?9.0:3.5);float drift=kind<0.5?9.0:(kind<1.5?4.0:1.5);
  vec3 p=position+vec3(izWind.x,0.0,izWind.y)*age*drift+vec3(0.0,age*rise,0.0)+vec3(sin(izP.z*6.28+age*3.0),0.0,cos(izP.w*6.28+age*2.5))*age*(kind<1.5?1.2:0.8);
  float s0=kind<0.5?1.2:(kind<1.5?0.8:0.9);float s1=kind<0.5?5.5:(kind<1.5?3.2:3.0);
  vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
  gl_PointSize=clamp(mix(s0,s1,age)*izPx/dd,1.0,256.0);
  vA=smoothstep(0.0,0.12,age)*(1.0-age)*(kind<0.5?0.35*(1.0-0.5*izRain):0.32)*exp(-dd*0.0018);
  vC=(kind<0.5?vec3(0.46,0.44,0.42):vec3(0.92,0.94,0.96))*(0.3+0.7*izLight);
  gl_Position=projectionMatrix*mv;`,
  `float a=(1.0-smoothstep(0.1,0.5,izD))*vA;if(a<0.004)discard;gl_FragColor=vec4(vC,a);`);
 const pts=new THREE.Points(g,m);pts.frustumCulled=false;pts.renderOrder=3;scene.add(pts);FX.smoke=pts;}
// chasm mist: big soft sprites drifting round the ring, thickest in the early morning and when it rains
{const N=420,pos=[],pp=[];for(let i=0;i<N;i++){pos.push(xr()*Math.PI*2,xrr(8,38),-9.2+xrr(0,6));pp.push(xrr(26,60),xrr(-0.004,0.004),xr()*6.28,xr());}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('izP',new THREE.Float32BufferAttribute(pp,4));
 const m=pointsMat(`float t=position.x+izTime*izP.y;float r=izWallR(t)+position.y;
  vec3 p=vec3(r*cos(t),position.z+sin(izTime*0.2+izP.z)*0.8,r*sin(t));
  vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
  gl_PointSize=clamp(izP.x*izPx/dd,1.0,220.0);
  vA=izMist*0.12*exp(-dd*0.0012)*smoothstep(4.0,30.0,dd);
  vC=mix(vec3(0.1,0.11,0.19),vec3(0.86,0.88,0.92),smoothstep(0.3,1.0,izLight));
  gl_Position=projectionMatrix*mv;`,
  `float a=(1.0-smoothstep(0.0,0.5,izD))*vA;if(a<0.003)discard;gl_FragColor=vec4(vC,a);`);
 const pts=new THREE.Points(g,m);pts.frustumCulled=false;pts.renderOrder=3;scene.add(pts);FX.mist=pts;
 animHooks.push(()=>{const h=ctx.hour||0;const v=Math.min(1,smooth(4.3,5.5,h)*(1-smooth(7.8,9.4,h))+0.2*ENV.izRain.value+0.05);m.uniforms.izMist.value=v;pts.visible=v>0.07;});}   // the 0.05 floor is too faint to see but not too cheap to draw
// fog banks: low soft sprites over the city and the chasm on foggy mornings
{const N=700,pos=[],pp=[];const R=mkRng(505);for(let i=0;i<N;i++){const t=R()*Math.PI*2,r=Math.sqrt(R())*(wallR(t)+40),x=r*Math.cos(t),z=r*Math.sin(t);pos.push(x,Math.max(terrainH(x,z),-9)+1+R()*7,z);pp.push(30+R()*40,R()*6.28,R(),R());}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('izP',new THREE.Float32BufferAttribute(pp,4));
 const m=pointsMat(`vec3 p=position+vec3(izWind.x,0.0,izWind.y)*sin(izTime*0.05+izP.y)*14.0;p.y+=sin(izTime*0.13+izP.y)*0.8;
  vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
  gl_PointSize=clamp(izP.x*izPx/dd,1.0,220.0);
  vA=izFog*0.16*smoothstep(3.0,25.0,dd)*exp(-dd*0.0009);
  vC=mix(vec3(0.14,0.15,0.2),vec3(0.86,0.87,0.9),smoothstep(0.3,1.0,izLight));
  gl_Position=projectionMatrix*mv;`,
  `float a=(1.0-smoothstep(0.0,0.5,izD))*vA;if(a<0.003)discard;gl_FragColor=vec4(vC,a);`);
 const pts=new THREE.Points(g,m);pts.frustumCulled=false;pts.renderOrder=3;scene.add(pts);FX.fogbank=pts;
 animHooks.push(()=>{pts.visible=ENV.izFog.value>0.01&&!FX.rainOff;});}
// fireflies around the glowing plants
{const N=Math.min(600,GLOWFERNS.length/3*2),pos=[],pp=[];for(let i=0;i<N;i++){const k=Math.floor(xr()*GLOWFERNS.length/3)*3;
   pos.push(GLOWFERNS[k]+xrr(-4,4),GLOWFERNS[k+1]+xrr(0.5,3.5),GLOWFERNS[k+2]+xrr(-4,4));pp.push(xr()*6.28,xrr(0.5,1.1),xr()*2,xrr(0.5,0.9));}
 if(N>0){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('izP',new THREE.Float32BufferAttribute(pp,4));
 const m=pointsMat(`float t=izTime*izP.y+izP.x;
  vec3 p=position+vec3(sin(t*0.7)*1.8,sin(t*1.3+izP.z)*0.8+0.4,cos(t*0.6+izP.z*2.0)*1.8);
  float blink=pow(max(sin(izTime*(1.2+izP.z)+izP.x*6.0),0.0),5.0);
  vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
  gl_PointSize=clamp(izP.w*(0.5+blink)*izPx/dd,1.0,24.0);
  vA=blink*izNight*exp(-dd*0.004)*(1.0-izRain);vC=vec3(0.75,1.0,0.35);
  gl_Position=projectionMatrix*mv;`,
  `float a=(1.0-smoothstep(0.0,0.5,izD))*vA;if(a<0.003)discard;gl_FragColor=vec4(vC*a,a);`,true);
 const pts=new THREE.Points(g,m);pts.frustumCulled=false;pts.renderOrder=3;scene.add(pts);FX.fireflies=pts;}}
// rain: streaks in a box that travels with the camera
{const N=7000,pos=new Float32Array(N*6),end=new Float32Array(N*2);
 for(let i=0;i<N;i++){const x=xrr(-120,120),y=xrr(-120,120),z=xrr(-120,120);pos.set([x,y,z,x,y,z],i*6);end[i*2+1]=1;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('izEnd',new THREE.BufferAttribute(end,1));
 const m=new THREE.ShaderMaterial({uniforms:{izTime:ENV.izTime,izWind:ENV.izWind,izLight:ENV.izLight,izRain:ENV.izRain},transparent:true,depthWrite:false,
  vertexShader:`uniform float izTime;uniform vec2 izWind;uniform float izRain;attribute float izEnd;varying float vA;
void main(){vec3 p=position;
  p.y=mod(p.y-izTime*60.0,240.0)-120.0+cameraPosition.y;
  p.xz=mod(p.xz-cameraPosition.xz+120.0+izWind*izTime*6.0,240.0)-120.0+cameraPosition.xz;
  vec3 dir=normalize(vec3(izWind.x*0.25,-1.0,izWind.y*0.25));
  p+=dir*izEnd*2.4;
  vec4 mv=viewMatrix*vec4(p,1.0);float d=length(mv.xyz);
  vA=izRain*(1.0-smoothstep(50.0,120.0,d))*(0.35+0.65*izEnd);
  gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform float izLight;varying float vA;void main(){gl_FragColor=vec4(vec3(0.72,0.77,0.86)*(0.35+0.65*izLight),vA*0.42);}`});
 const rain=new THREE.LineSegments(g,m);rain.frustumCulled=false;rain.renderOrder=4;scene.add(rain);FX.rain=rain;
 animHooks.push(()=>{rain.visible=ENV.izRain.value>0.01&&!FX.rainOff;});}
ctx.fx=Object.assign(ctx.fx||{},{particles:FX});
});
