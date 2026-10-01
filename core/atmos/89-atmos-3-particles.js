// ================================================================= ATMOS — particles: chimney smoke and vent steam, fireflies, a mist ring, fog banks
// Each is one Points cloud animated in its vertex shader (no per-frame CPU work). Sizes are in world metres.
(function(){const A=ATMOS;
 const pmat=(vs,fs,additive,extra)=>new A.T.ShaderMaterial({uniforms:Object.assign({time:A.U.time,px:A.U.px,wind:A.U.wind,light:A.U.light,rain:A.U.rain,night:A.U.night,fog:A.U.fog,k:{value:0}},extra||{}),
  vertexShader:`uniform float time;uniform float px;uniform vec2 wind;uniform float light;uniform float rain;uniform float night;uniform float fog;uniform float k;attribute vec4 pp;varying float vA;varying vec3 vC;
   void main(){${vs}}`,fragmentShader:`varying float vA;varying vec3 vC;void main(){float d=length(gl_PointCoord-0.5);${fs}}`,
  transparent:true,depthWrite:false,fog:false,blending:additive?A.T.AdditiveBlending:A.T.NormalBlending});
 const cloud=(name,pos,pp,m,order)=>{const T=A.T,g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('pp',new T.Float32BufferAttribute(pp,4));
  const p=new T.Points(g,m);p.frustumCulled=false;p.renderOrder=order||3;p.name='atmos:'+name;A.add(p);A.noRay(p);A.stats[name]=pos.length/3;return p;};
 // SMOKE: emitters [x,y,z,kind] (0 chimney smoke, 1 steam, 2 spray); each particle loops its age, rising and drifting downwind
 A.smoke=(list,o)=>{o=o||{};if(!list.length)return null;const pos=[],pp=[];for(const e of list){const n=e[3]===0?(o.n||12):e[3]===1?14:16;for(let k=0;k<n;k++){pos.push(e[0],e[1],e[2]);pp.push(k/n+A.rr(-.02,.02),e[3],A.rnd(),A.rnd());}}
  return cloud('smoke',pos,pp,pmat(`float kind=pp.y;float rate=kind<0.5?0.11:(kind<1.5?0.3:0.45);float age=fract(time*rate+pp.x);
   float rise=kind<0.5?16.0:(kind<1.5?9.0:3.5);float drift=kind<0.5?9.0:(kind<1.5?4.0:1.5);
   vec3 p=position+vec3(wind.x,0.0,wind.y)*age*drift+vec3(0.0,age*rise,0.0)+vec3(sin(pp.z*6.28+age*3.0),0.0,cos(pp.w*6.28+age*2.5))*age*1.2;
   float s0=kind<0.5?1.2:0.8;float s1=kind<0.5?5.5:3.2;vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
   gl_PointSize=clamp(mix(s0,s1,age)*px/dd,1.0,256.0);vA=smoothstep(0.0,0.12,age)*(1.0-age)*(kind<0.5?0.35*(1.0-0.5*rain):0.32)*exp(-dd*0.0018);
   vC=(kind<0.5?vec3(0.46,0.44,0.42):vec3(0.92,0.94,0.96))*(0.3+0.7*light);gl_Position=projectionMatrix*mv;`,
   `float a=(1.0-smoothstep(0.1,0.5,d))*vA;if(a<0.004)discard;gl_FragColor=vec4(vC,a);`));};
 // FIREFLIES round centres [x,y,z]: n per centre, wandering within `spread` m, blinking, only at night and not in rain
 A.fireflies=(centres,o)=>{o=o||{};const n=o.n||6,sp=o.spread||5,pos=[],pp=[];for(const c of centres)for(let i=0;i<n;i++){pos.push(c[0]+A.rr(-sp,sp),c[1]+A.rr(.5,3.5),c[2]+A.rr(-sp,sp));pp.push(A.rnd()*6.28,A.rr(.5,1.1),A.rnd()*2,A.rr(.5,.9));}
  if(!pos.length)return null;return cloud('fireflies',pos,pp,pmat(`float t=time*pp.y+pp.x;vec3 p=position+vec3(sin(t*0.7)*1.8,sin(t*1.3+pp.z)*0.8+0.4,cos(t*0.6+pp.z*2.0)*1.8);
   float blink=pow(max(sin(time*(1.2+pp.z)+pp.x*6.0),0.0),5.0);vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
   gl_PointSize=clamp(pp.w*(0.5+blink)*px/dd*0.35,1.0,24.0);vA=blink*night*exp(-dd*0.004)*(1.0-rain);vC=vec3(0.75,1.0,0.35);gl_Position=projectionMatrix*mv;`,
   `float a=(1.0-smoothstep(0.0,0.5,d))*vA;if(a<0.003)discard;gl_FragColor=vec4(vC*a,a);`,true));};
 // a MIST RING drifting round a closed curve r(t) (a moat): `inner`..`outer` m out from it at heights y0..y1; thick at dawn
 // and in rain (k is set each frame from the hour and the rain)
 A.mistRing=(rFn,o)=>{o=o||{};const N=o.n||420,samples=256,R=[];for(let i=0;i<samples;i++)R.push(rFn(i/samples*Math.PI*2));
  const pos=[],pp=[];for(let i=0;i<N;i++){pos.push(A.rnd()*Math.PI*2,A.rr(o.inner||8,o.outer||38),A.rr(o.y0||-9,o.y1||-3));pp.push(A.rr(26,60),A.rr(-.004,.004),A.rnd()*6.28,A.rnd());}
  // each particle carries its own radius (the curve at its bearing plus its offset); it drifts slowly round in bearing
  for(let i=0;i<N;i++){const t=pos[i*3];pos[i*3+1]+=R[Math.floor(((t/(Math.PI*2))%1)*samples)];}
  const m=pmat(`float t=position.x+time*pp.y;float r=position.y;vec3 p=vec3(r*cos(t),position.z+sin(time*0.2+pp.z)*0.8,r*sin(t));vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
   gl_PointSize=clamp(pp.x*px/dd,1.0,220.0);vA=k*0.12*exp(-dd*0.0012)*smoothstep(4.0,30.0,dd);vC=mix(vec3(0.1,0.11,0.19),vec3(0.86,0.88,0.92),smoothstep(0.3,1.0,light));gl_Position=projectionMatrix*mv;`,
   `float a=(1.0-smoothstep(0.0,0.5,d))*vA;if(a<0.003)discard;gl_FragColor=vec4(vC,a);`);
  const p=cloud('mist',pos,pp,m);A.hook((t,h)=>{const v=Math.min(1,A.ss(4.3,5.5,h)*(1-A.ss(7.8,9.4,h))+.25*A.U.rain.value+.4*A.U.fog.value);m.uniforms.k.value=v;p.visible=v>.07;});return p;};
 // FOG BANKS: low soft sprites at the given points [x,y,z], seen only when the weather's fog is up
 A.fogBank=(points,o)=>{o=o||{};const pos=[],pp=[];for(const q of points){pos.push(q[0],q[1]+A.rr(1,8),q[2]);pp.push(A.rr(30,70),A.rnd()*6.28,A.rnd(),A.rnd());}
  const m=pmat(`vec3 p=position+vec3(wind.x,0.0,wind.y)*sin(time*0.05+pp.y)*14.0;p.y+=sin(time*0.13+pp.y)*0.8;vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
   gl_PointSize=clamp(pp.x*px/dd,1.0,220.0);vA=fog*0.16*smoothstep(3.0,25.0,dd)*exp(-dd*0.0009);vC=mix(vec3(0.14,0.15,0.2),vec3(0.86,0.87,0.9),smoothstep(0.3,1.0,light));gl_Position=projectionMatrix*mv;`,
   `float a=(1.0-smoothstep(0.0,0.5,d))*vA;if(a<0.003)discard;gl_FragColor=vec4(vC,a);`);
  const p=cloud('fogbank',pos,pp,m);A.hook(()=>{p.visible=A.U.fog.value>.01;});return p;};
})();
