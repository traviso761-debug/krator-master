// ================================================================= ATMOS — particles: chimney smoke and vent steam, fireflies, a mist ring, fog banks, moths
// Each is one sprite cloud (A.sprites: camera-facing quads) animated in its vertex shader: a particle's position is a pure
// function of its seeds and the clock, with no per-frame CPU work and no state. Its numbers come from ATMOS.PRESETS
// (sizes in world metres), and each call records what it placed (A.rec) for ATMOS.export().
(function(){const A=ATMOS;
 const v3=c=>new A.T.Vector3(c[0],c[1],c[2]),F=v=>A.glf(v);
 // a particle material: vs/fs are the bodies of main(); head goes above main (extra uniforms and attributes)
 const pmat=(vs,fs,blend,extra,head)=>new A.T.ShaderMaterial({uniforms:Object.assign({time:A.U.time,px:A.U.px,wind:A.U.wind,gustAmp:A.U.gustAmp,light:A.U.light,rain:A.U.rain,night:A.U.night,fog:A.U.fog,k:{value:0}},extra||{}),
  vertexShader:`uniform float time;uniform vec2 wind;uniform float gustAmp;uniform float light;uniform float rain;uniform float night;uniform float fog;uniform float k;attribute vec4 pp;varying float vA;varying vec3 vC;
   ${A.GLSL_QUAD}
   ${A.GLSL_WIND}
   ${head||''}
   void main(){${vs}}`,fragmentShader:`varying float vA;varying vec3 vC;varying vec2 vUv;void main(){float d=length(vUv-0.5);${fs}}`,
  transparent:true,depthWrite:false,fog:false,blending:blend==='add'?A.T.AdditiveBlending:A.T.NormalBlending});
 // SMOKE: emitters [x,y,z,kind] (kind: a PRESETS.smoke name, or its index: 0 chimney, 1 steam, 2 spray); each particle
 // loops its age, rising and drifting downwind on the gust it met halfway up. o.n: particles per emitter (else the kind's n)
 A.smoke=(list,o)=>{o=o||{};if(!list.length)return null;const P=A.PRESETS.smoke,kinds=Object.keys(P).filter(k=>P[k]&&P[k].index!=null).sort((a,b)=>P[a].index-P[b].index);
  const kindOf=e=>typeof e[3]==='string'?P[e[3]].index:e[3];const pos=[],pp=[];
  for(const e of list){const ki=kindOf(e),n=o.n||P[kinds[ki]].n;for(let k=0;k<n;k++){pos.push(e[0],e[1],e[2]);pp.push(k/n+A.rr(-.02,.02),ki,A.rnd(),A.rnd());}}
  A.rec('smoke',{preset:'smoke',emitters:list.map(e=>[e[0],e[1],e[2],kinds[kindOf(e)]])});
  const SA=kinds.map(k=>new A.T.Vector4(P[k].rate,P[k].rise,P[k].drift,P[k].alpha)),SB=kinds.map(k=>new A.T.Vector4(P[k].size[0],P[k].size[1],P[k].rainDamp,P[k].wobble)),SC=kinds.map(k=>v3(P[k].color)),N=kinds.length;
  return A.sprites('smoke',{ipos:[3,pos],pp:[4,pp]},pmat(`int ki=int(pp.y+0.5);vec4 a=SA[0];vec4 b=SB[0];vec3 col=SC[0];
   for(int i=1;i<${N};i++){if(i==ki){a=SA[i];b=SB[i];col=SC[i];}}
   float rate=a.x;float age=fract(time*rate+pp.x);
   vec2 wv=atmWind(time-age/rate*0.5,ipos.xz,wind,gustAmp);vec3 p=ipos+vec3(wv.x,0.0,wv.y)*age*a.z+vec3(0.0,age*a.y,0.0)+vec3(sin(pp.z*6.28+age*3.0),0.0,cos(pp.w*6.28+age*2.5))*age*b.w;
   vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
   float ps=clamp(mix(b.x,b.y,age)*px/dd,1.0,${F(P.pxMax)});vA=smoothstep(0.0,${F(P.fadeIn)},age)*(1.0-age)*a.w*(1.0-b.z*rain)*exp(-dd*${F(P.distFade)});
   vC=col*(0.3+0.7*light);gl_Position=atmQuad(mv,ps);`,
   `float a=(1.0-smoothstep(0.1,0.5,d))*vA;if(a<0.004)discard;gl_FragColor=vec4(vC,a);`,P.blend,{SA:{value:SA},SB:{value:SB},SC:{value:SC}},
   `uniform vec4 SA[${N}];uniform vec4 SB[${N}];uniform vec3 SC[${N}];`));};
 // FIREFLIES round centres [x,y,z]: n per centre, wandering within `spread` m, blinking, only at night and not in rain
 A.fireflies=(centres,o)=>{o=o||{};const P=A.PRESETS.fireflies,n=o.n||P.n,sp=o.spread||P.spread,pos=[],pp=[];
  for(const c of centres)for(let i=0;i<n;i++){pos.push(c[0]+A.rr(-sp,sp),c[1]+A.rr(.5,3.5),c[2]+A.rr(-sp,sp));pp.push(A.rnd()*6.28,A.rr(.5,1.1),A.rnd()*2,A.rr(.5,.9));}
  if(!pos.length)return null;A.rec('fireflies',{preset:'fireflies',centres:centres.map(c=>[c[0],c[1],c[2]]),n,spread:sp});
  return A.sprites('fireflies',{ipos:[3,pos],pp:[4,pp]},pmat(`float t=time*pp.y+pp.x;vec3 p=ipos+vec3(sin(t*0.7)*1.8,sin(t*1.3+pp.z)*0.8+0.4,cos(t*0.6+pp.z*2.0)*1.8);
   float blink=pow(max(sin(time*(1.2+pp.z)+pp.x*6.0),0.0),5.0);vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
   float ps=clamp(pp.w*(0.5+blink)*px/dd*${F(P.size)},1.0,${F(P.pxMax)});vA=blink*night*exp(-dd*${F(P.distFade)})*(1.0-rain);vC=col;gl_Position=atmQuad(mv,ps);`,
   `float a=(1.0-smoothstep(0.0,0.5,d))*vA;if(a<0.003)discard;gl_FragColor=vec4(vC*a,a);`,P.blend,{col:{value:v3(P.color)}},'uniform vec3 col;'));};
 // a MIST RING drifting round a closed curve r(t) (a moat): `inner`..`outer` m out from it at heights y0..y1; thick at dawn
 // and in rain (k is set each frame from the hour and the rain)
 A.mistRing=(rFn,o)=>{o=o||{};const P=A.PRESETS.mist,N=o.n||P.n,samples=256,R=[];for(let i=0;i<samples;i++)R.push(rFn(i/samples*Math.PI*2));
  const pos=[],pp=[];for(let i=0;i<N;i++){pos.push(A.rnd()*Math.PI*2,A.rr(o.inner||8,o.outer||38),A.rr(o.y0||-9,o.y1||-3));pp.push(A.rr(P.size[0],P.size[1]),A.rr(-.004,.004),A.rnd()*6.28,A.rnd());}
  // each particle carries its own radius (the curve at its bearing plus its offset); it drifts slowly round in bearing
  for(let i=0;i<N;i++){const t=pos[i*3];pos[i*3+1]+=R[Math.floor(((t/(Math.PI*2))%1)*samples)];}
  A.rec('mist',{preset:'mist',curve:R.filter((r,i)=>i%4===0),inner:o.inner||8,outer:o.outer||38,y:[o.y0||-9,o.y1||-3],n:N,
   note:'curve: radius from the origin at 64 even bearings (bearing = angle from +x toward +z)'});
  const m=pmat(`float t=ipos.x+time*pp.y;float r=ipos.y;vec3 p=vec3(r*cos(t),ipos.z+sin(time*0.2+pp.z)*0.8,r*sin(t));vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
   float ps=clamp(pp.x*px/dd,1.0,${F(P.pxMax)});vA=k*${F(P.alpha)}*exp(-dd*${F(P.distFade)})*smoothstep(${F(P.nearFade[0])},${F(P.nearFade[1])},dd);vC=mix(cN,cD,smoothstep(0.3,1.0,light));gl_Position=atmQuad(mv,ps);`,
   `float a=(1.0-smoothstep(0.0,0.5,d))*vA;if(a<0.003)discard;gl_FragColor=vec4(vC,a);`,P.blend,{cN:{value:v3(P.night)},cD:{value:v3(P.day)}},'uniform vec3 cN;uniform vec3 cD;');
  const p=A.sprites('mist',{ipos:[3,pos],pp:[4,pp]},m);A.hook((t,h)=>{const v=Math.min(1,A.ss(4.3,5.5,h)*(1-A.ss(7.8,9.4,h))+.25*A.U.rain.value+.4*A.U.fog.value);m.uniforms.k.value=v;p.visible=v>.07;});return p;};
 // FOG BANKS: low soft sprites at the given points [x,y,z], seen only when the weather's fog is up
 A.fogBank=(points,o)=>{o=o||{};const P=A.PRESETS.fogbank,pos=[],pp=[];for(const q of points){pos.push(q[0],q[1]+A.rr(1,8),q[2]);pp.push(A.rr(P.size[0],P.size[1]),A.rnd()*6.28,A.rnd(),A.rnd());}
  A.rec('fogbank',{preset:'fogbank',points:points.map(q=>[q[0],q[1],q[2]])});
  const m=pmat(`vec2 wv=atmWind(time,ipos.xz,wind,gustAmp);vec3 p=ipos+vec3(wv.x,0.0,wv.y)*sin(time*0.05+pp.y)*${F(P.sway)};p.y+=sin(time*0.13+pp.y)*0.8;vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);
   float ps=clamp(pp.x*px/dd,1.0,${F(P.pxMax)});vA=fog*${F(P.alpha)}*smoothstep(${F(P.nearFade[0])},${F(P.nearFade[1])},dd)*exp(-dd*${F(P.distFade)});vC=mix(cN,cD,smoothstep(0.3,1.0,light));gl_Position=atmQuad(mv,ps);`,
   `float a=(1.0-smoothstep(0.0,0.5,d))*vA;if(a<0.003)discard;gl_FragColor=vec4(vC,a);`,P.blend,{cN:{value:v3(P.night)},cD:{value:v3(P.day)}},'uniform vec3 cN;uniform vec3 cD;');
  const p=A.sprites('fogbank',{ipos:[3,pos],pp:[4,pp]},m);A.hook(()=>{p.visible=A.U.fog.value>.01;});return p;};
 // MOTHS round lamp heads (A.lamps, or o.at: [[x,y,z,on,off]]): n per lamp on a share p of them (at most o.max lamps),
 // looping and jinking about the light while it is lit, at night, out of the rain, and not in a strong wind.
 // Seeded on a stream of their own, so adding them moves nothing else.
 A.moths=o=>{o=o||{};const P=A.PRESETS.moths,src=o.at||A.lamps,n=o.n||P.n,p=o.p==null?P.p:o.p,max=o.max||P.max,R=A.stream((o.seed||A.h.seed||1)*7+911);
  const pick=src.filter(()=>R()<p),step=Math.max(1,pick.length/max),pos=[],pp=[],lt=[],at=[];
  for(let i=0;i<pick.length;i+=step){const L=pick[Math.floor(i)];at.push(L.slice(0,5));for(let k=0;k<n;k++){pos.push(L[0],L[1]-.1,L[2]);pp.push(R()*6.28,.7+R()*.8,.35+R()*.9,R());lt.push(L[3],L[4]);}}
  if(!pos.length)return null;A.rec('moths',{preset:'moths',lamps:at,n,note:'lamps: [x,y,z,on,off] lamp heads; moths circle 0.35-1.25 m round each while it is lit'});
  return A.sprites('moths',{ipos:[3,pos],pp:[4,pp],lt:[2,lt]},pmat(`float t=time*pp.y+pp.x;
   vec3 o=vec3(sin(t*2.3)+0.5*sin(t*5.1+pp.x),0.6*sin(t*1.7+pp.w*6.0)+0.3*sin(t*7.3),cos(t*2.0)+0.5*cos(t*4.3+pp.x*2.0))*pp.z
    +0.07*vec3(sin(time*29.0+pp.x*9.0),sin(time*23.0+pp.w*7.0),cos(time*31.0+pp.x*5.0));
   vec4 mv=modelViewMatrix*vec4(ipos+o,1.0);float dd=max(-mv.z,0.5);float flap=0.55+0.45*sin(time*38.0+pp.x*20.0);
   float ps=clamp(${F(P.size)}*px/dd,1.0,${F(P.pxMax)});vA=atmLit(hour,lt)*night*(1.0-rain)*(1.0-0.6*fog)*(1.0-smoothstep(${F(P.windHide[0])},${F(P.windHide[1])},length(wind)))*(1.0-smoothstep(${F(P.fadeNear)},${F(P.fadeFar)},dd))*flap*${F(P.alpha)};
   vC=col;gl_Position=atmQuad(mv,ps);`,
   `float a=(1.0-smoothstep(0.15,0.5,d))*vA;if(a<0.004)discard;gl_FragColor=vec4(vC*a,a);`,P.blend,{hour:A.U.hour,col:{value:v3(P.color)}},'uniform float hour;uniform vec3 col;attribute vec2 lt;'+A.GLSL_LIT),5);};
})();
