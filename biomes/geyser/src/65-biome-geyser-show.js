// ================================================================= GEYSER — the show: the springs, the mud, the steam, the eruptions
// What moves, all of it on the clock in its shaders (no per-frame CPU work but the uniforms), drawn through BIO.host's
// THREE and scene (a world binds them; Godot: these are spatial shaders and GPUParticles3D, the records in GEYSER.R):
//   THE SPRINGS   each a disc at its level, banded by temperature from its middle out: deep blue where it boils, then
//                 turquoise, and where it cools the mats reach in, green, yellow, orange (as Grand Prismatic). The
//                 pool geysers' and spouters' pools the same, boiling; the mats round them are the ground's (84)
//   THE MUD POTS  grey mud that swells into bubbles and bursts in rings (the Throne's geyser isle's)
//   THE STEAM     the fumaroles, the springs (the Great Prism's lit by its own colours from under), the hot run-off,
//                 leaning downwind
//   THE ERUPTIONS one Points per geyser. A drop is thrown up again and again: its age within its flight, launched at
//                 (now - age), as hard as the geyser's cycle (GEYSER.cycle, run here in GLSL) says it played at that
//                 launch; so the column stands at once wherever the clock is set (GEYSER.erupt moves it). Fountains
//                 burst wide; cones jet narrow; spouters never stop. Steam rises off the column and rolls downwind,
//                 roaring on after it (the steam phase); mist where the water lands.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm}=BIO.fn;
GEYSER.buildShow=function(opt){const T3=BIO.host.THREE,scene=BIO.host.scene,R=GEYSER.R,wind=R.spec&&R.spec.wind||[.5,-.3];reseed(650631);
 const SH=GEYSER.SHOW={t:0,U:{uT:{value:0},uScale:{value:600},uLight:{value:1},uWind:{value:new T3.Vector2(wind[0],wind[1])},uSun:{value:new T3.Vector3(-.6,.55,.47).normalize()},uSky:{value:new T3.Color(0xc8d4d4)}},mats:[]};
 const U=SH.U,fogU=()=>T3.UniformsUtils.merge([T3.UniformsLib.fog]);
 const mk=(o)=>{const m=new T3.ShaderMaterial(Object.assign({fog:true},o,{uniforms:Object.assign(fogU(),o.uniforms||{})}));for(const k in U)if(o.uniforms&&k in o.uniforms)m.uniforms[k]=U[k];
  if(scene.fog){m.uniforms.fogColor.value=scene.fog.color;m.uniforms.fogDensity.value=scene.fog.density;}SH.mats.push(m);return m;};
 const st={springs:0,pots:0,steam:0,drops:0};
 // ---------------------------------------------------------------- the springs
 const SPRING_MAT=mk({side:T3.DoubleSide,uniforms:{uT:U.uT,uSun:U.uSun,uSky:U.uSky,uLight:U.uLight},
  vertexShader:['#include <fog_pars_vertex>','attribute vec4 aP;varying vec3 vWP;varying vec4 vP;',
   'void main(){vP=aP;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec4 vP;',
   'float sm(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}',
   'void main(){float t=vP.x,temp=vP.y,boil=vP.z;',
   ' float m0=clamp(temp*0.78,0.08,0.86);vec3 deep=vec3(0.02,0.14,0.4),blue=vec3(0.08,0.5,0.72),green=vec3(0.36,0.62,0.28),yel=vec3(0.86,0.72,0.2),ora=vec3(0.82,0.4,0.1),rust=vec3(0.52,0.22,0.08);',
   ' vec3 c=mix(deep,blue,sm(0.0,m0,t));float u=(t-m0)/max(0.05,1.0-m0);c=mix(c,green,sm(0.0,0.12,u));c=mix(c,yel,sm(0.18,0.38,u));c=mix(c,ora,sm(0.42,0.66,u));c=mix(c,rust,sm(0.75,1.0,u));',
   // a boiling pool churns: rings of bubbles welling up at its middle
   ' c=mix(c,mix(vec3(0.16,0.55,0.66),vec3(0.42,0.78,0.82),sm(0.0,1.0,t)),vP.w);float b=boil*sm(0.5,0.0,t)*(0.5+0.5*sin(t*40.0-uT*9.0))*sm(0.3,1.0,sin(uT*2.3+vWP.x)*0.5+0.5);c=mix(c,vec3(0.75,0.88,0.9),b*0.4);',
   ' vec3 n=normalize(vec3(0.015*sin(vWP.x*0.6+uT*1.1)+0.01*sin(vWP.z*0.9-uT*0.8)+b*0.05*sin(vWP.z*3.0),1.0,0.015*cos(vWP.z*0.5+uT*0.9)));',
   ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),3.0);',
   ' vec3 col=mix(c,uSky,0.04+fr*0.3);vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.8*vec3(1.0,0.95,0.85);',
   ' gl_FragColor=vec4(col*uLight,1.0);','#include <fog_fragment>','}'].join('\n')});
 function disc(x,z,r,level,temp,boil,label,milky){const Rr=r*1.02,NR=Math.max(6,Math.round(r*.6)),NA=Math.max(24,Math.min(72,Math.round(r*4))),pos=[],aP=[],idx=[];
  for(let i=0;i<=NR;i++)for(let a=0;a<NA;a++){const t=i/NR,an=a/NA*TAU,wob=1+.04*Math.sin(an*5+x)*t;pos.push(x+Math.cos(an)*Rr*t*wob,level,z+Math.sin(an)*Rr*t*wob);aP.push(Math.min(1,t*Rr/r),temp,boil,milky?1:0);}
  for(let i=0;i<NR;i++)for(let a=0;a<NA;a++){const A=i*NA+a,B=i*NA+(a+1)%NA,C2=(i+1)*NA+a,D=(i+1)*NA+(a+1)%NA;idx.push(A,C2,B,B,C2,D);}
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('aP',new T3.Float32BufferAttribute(aP,4));g.setIndex(idx);
  const m=new T3.Mesh(g,SPRING_MAT);m.userData.inspectLabel=label;m.renderOrder=1;scene.add(m);st.springs++;BIO.tally(idx.length/3,0,1);return m;}
 R.springs.forEach(s=>{disc(s.x,s.z,s.r,s.level,s.temp,s.temp>.9?1:0,s.name,s.milky);BIO.register({name:s.name,spring:s.key,x:s.x,z:s.z,y:s.level-4,r:s.r*1.4,h:10});});
 R.geysers.forEach(g=>{if(g.kind!=='cone')disc(g.x,g.z,g.pool||2,g.level,1,1,g.name.replace(/ \(.*/,'')+'\'s pool');});
 // ---------------------------------------------------------------- the run-off's water
 const RUN_MAT=mk({transparent:true,depthWrite:false,side:T3.DoubleSide,uniforms:{uT:U.uT,uSun:U.uSun,uSky:U.uSky,uLight:U.uLight},
  vertexShader:['#include <fog_pars_vertex>','attribute vec3 aR;varying vec3 vWP;varying vec3 vR;',
   'void main(){vR=aR;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
  // vR: x the distance down the channel, y across it (-1..1), z its heat (0..1)
  fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vR;',
   'void main(){float s=vR.x,a=vR.y,h=vR.z;float fl=sin(s*2.2-uT*5.5+a*1.5)*0.5+sin(s*5.3-uT*8.0-a*2.5)*0.3+sin(s*11.0-uT*12.0)*0.15;',
   ' vec3 n=normalize(vec3(a*0.08+fl*0.06,1.0,fl*0.05));vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),4.0);',
   ' vec3 col=mix(vec3(0.5,0.62,0.55),vec3(0.62,0.82,0.88),smoothstep(0.35,0.7,h))*(0.85+0.15*fl);col=mix(col,uSky,fr*0.4);',
   ' float sp=pow(max(dot(n,normalize(uSun+V)),0.0),120.0);col+=sp*0.9*vec3(1.0,0.96,0.88);',
   ' float edge=1.0-smoothstep(0.55,1.0,abs(a));gl_FragColor=vec4(col*uLight,(0.34+0.3*smoothstep(0.3,0.8,fl*0.5+0.5)+sp*0.5)*edge);','#include <fog_fragment>','}'].join('\n')});
 {const pos=[],aR=[],idx=[];let n=0,tris=0;
  R.runoff.forEach(ch=>{const P=ch.P;let prev=false;   /* a new strip per channel */
   for(let i=0;i<P.length;i+=2){const p=P[i],q=P[Math.min(P.length-1,i+2)],o=P[Math.max(0,i-2)],dx=q[0]-o[0],dz=q[1]-o[1],l=Math.hypot(dx,dz)||1,px=-dz/l,pz=dx/l,w=GEYSER.chW(ch,p[2])*.95,T=GEYSER.chT(ch,p[2]);
    for(let k=0;k<5;k++){const t=k/4*2-1,x=p[0]+px*w*t,z=p[1]+pz*w*t;pos.push(x,BIO.terrainH(x,z)+.035,z);aR.push(p[2],t,clamp((T-R.amb)/(100-R.amb),0,1));}
    if(prev)for(let k=0;k<4;k++){const A=(n-1)*5+k,B=n*5+k;idx.push(A,B,A+1,A+1,B,B+1);tris+=2;}n++;prev=true;}
   prev=false;n=n;});
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('aR',new T3.Float32BufferAttribute(aR,3));g.setIndex(idx);
  const m=new T3.Mesh(g,RUN_MAT);m.userData.probeSkip=true;m.userData.inspectLabel='The run-off (hot water running over the sinter)';m.renderOrder=2;scene.add(m);BIO.tally(tris,0,1);st.runoff=tris;}
 // ---------------------------------------------------------------- the mud pots
 const MUD_MAT=mk({side:T3.DoubleSide,uniforms:{uT:U.uT,uLight:U.uLight},
  vertexShader:['#include <fog_pars_vertex>','attribute vec3 aM;uniform float uT;varying float vH;',
   'float bub(vec2 p,float s,float k){float per=1.6+0.9*fract(s*7.3+k*0.37),T=uT/per+fract(s*13.1+k*0.61),cyc=floor(T),ph=fract(T);',
   ' vec2 c=0.55*vec2(sin(s*91.0+k*2.1+cyc*1.7),cos(s*57.0+k*1.3+cyc*2.3));float d=length(p-c);',
   ' float grow=smoothstep(0.0,0.82,ph)*step(ph,0.86),rb=0.12+0.18*grow;float h=0.38*grow*exp(-d*d/(rb*rb));',
   ' float ring=step(0.86,ph)*(1.0-ph)*7.0;h+=0.05*ring*sin((d-(ph-0.86)*4.0)*28.0)*exp(-d*3.0);return h;}',
   'void main(){vec2 p=aM.xy;float s=aM.z,R=length(p);float h=0.0;for(int k=0;k<3;k++)h+=bub(p,s,float(k));h*=1.0-smoothstep(0.75,1.0,R);vH=h;',
   ' vec3 pos=position+vec3(0.0,h,0.0);vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['#include <fog_pars_fragment>','uniform float uLight;varying float vH;',
   'void main(){vec3 c=mix(vec3(0.32,0.29,0.26),vec3(0.66,0.63,0.58),clamp(vH*3.0,0.0,1.0));gl_FragColor=vec4(c*uLight,1.0);','#include <fog_fragment>','}'].join('\n')});
 R.mud.forEach(Pt=>{const NR=8,NA=28,pos=[],aM=[],idx=[],y=Pt.level,r=Pt.r*1.08;
  for(let i=0;i<=NR;i++)for(let a=0;a<NA;a++){const t=i/NR,an=a/NA*TAU,c=Math.cos(an)*t,s=Math.sin(an)*t;pos.push(Pt.x+c*r,y,Pt.z+s*r);aM.push(c,s,Pt.seed);}
  for(let i=0;i<NR;i++)for(let a=0;a<NA;a++){const A=i*NA+a,B=i*NA+(a+1)%NA,C2=(i+1)*NA+a,D=(i+1)*NA+(a+1)%NA;idx.push(A,C2,B,B,C2,D);}
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('aM',new T3.Float32BufferAttribute(aM,3));g.setIndex(idx);
  const m=new T3.Mesh(g,MUD_MAT);m.userData.inspectLabel='A mud pot (it bubbles)';m.frustumCulled=false;scene.add(m);st.pots++;BIO.tally(idx.length/3,0,1);});
 R.acid.forEach(a=>BIO.register({name:a.name,mud:true,x:a.x,z:a.z,y:BIO.terrainH(a.x,a.z)-4,r:a.r,h:14}));
 // ---------------------------------------------------------------- the steam
 // a puff loops up from its vent: aS (phase, rate, size, rise); aC its tint (the Prism's steam takes its colours from under)
 const STEAM_MAT=mk({transparent:true,depthWrite:false,uniforms:{uT:U.uT,uScale:U.uScale,uLight:U.uLight,uWind:U.uWind},
  vertexShader:['#include <fog_pars_vertex>','attribute vec4 aS;attribute vec3 aC;uniform float uT,uScale;uniform vec2 uWind;varying float vA;varying vec3 vC;',
   'void main(){vC=aC;float ph=fract(uT*aS.y+aS.x);vec3 p=position+vec3(sin(ph*6.0+aS.x*9.0)*aS.z*0.4+uWind.x*ph*aS.w*0.55,ph*aS.w,cos(ph*5.0+aS.x*7.0)*aS.z*0.4+uWind.y*ph*aS.w*0.55);',
   ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.8+ph*3.4)/max(1.0,-mvPosition.z);',
   ' vA=smoothstep(0.0,0.15,ph)*(1.0-ph)*0.26;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['#include <fog_pars_fragment>','uniform float uLight;varying float vA;varying vec3 vC;',
   'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5)discard;gl_FragColor=vec4(vC*mix(1.0,0.32,1.0-uLight),vA*(1.0-smoothstep(0.1,0.5,r)));','#include <fog_fragment>','}'].join('\n')});
 {const P=[],A=[],Cc=[],W=[.93,.94,.92];
  const add=(x,z,y,n,size,rise,rate,spread,tint)=>{for(let i=0;i<n;i++){P.push(x+rr(-spread,spread),y,z+rr(-spread,spread));A.push(rng(),rate*rr(.8,1.2),size*rr(.7,1.3),rise*rr(.7,1.3));const c=tint&&rng()<.6?tint:W;Cc.push(c[0],c[1],c[2]);}};
  R.fumaroles.forEach(f=>add(f.x,f.z,BIO.terrainH(f.x,f.z),Math.round(14+20*f.s),2.5+3.5*f.s,16+22*f.s,.07,1.4));
  R.springs.forEach(s=>{const tint=s.kind==='prismatic'?[.82,.9,.94]:null;add(s.x,s.z,s.level,Math.round((4+s.r*.9)*s.temp),2+s.r*.1,8+s.r*.35,.07,s.r*.7,tint);
   if(s.kind==='prismatic')add(s.x,s.z,s.level,Math.round(s.r*.6),2.5+s.r*.08,6+s.r*.2,.06,s.r*1.1,[.95,.82,.62]);});
  R.mud.forEach(m=>add(m.x,m.z,m.level,3,1.8,7,.1,.6));
  R.springs.forEach(s=>{if(s.milky)add(s.x,s.z+s.r*1.6,s.level-1,24,3.5,9,.05,s.r*1.4,[.95,.97,.97]);});
  R.flats.forEach(f=>{const n=Math.round(f.rx*f.rz/900);for(let k=0;k<n;k++){const a=rr(0,TAU),d=Math.sqrt(rng())*.8,x=f.x+Math.cos(a)*f.rx*d,z=f.z+Math.sin(a)*f.rz*d,g=GEYSER.at(x,z);if(g.heat<.2&&g.vent<.05)continue;add(x,z,BIO.terrainH(x,z)+.5,1,7,10,.025,4);}});
  R.runoff.forEach(ch=>{for(let i=0;i<ch.P.length;i+=4){const p=ch.P[i],T=GEYSER.chT(ch,p[2]);if(T<62)break;add(p[0],p[1],BIO.terrainH(p[0],p[1])+.2,1,2,6,.08,GEYSER.chW(ch,p[2])*.6);}});
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(P,3));g.setAttribute('aS',new T3.Float32BufferAttribute(A,4));g.setAttribute('aC',new T3.Float32BufferAttribute(Cc,3));
  const pts=new T3.Points(g,STEAM_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=3;scene.add(pts);st.steam=P.length/3;}
 // ---------------------------------------------------------------- the eruptions
 const GLSL_CYCLE=['uniform vec4 uCyc;uniform float uOff,uKind,uSeed;',
  'float sm(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}',
  // the water (0..1 of the column) and the steam at time t: GEYSER.cycle (46), the same maths
  'float wat(float t){if(uKind>1.5)return 0.72+0.28*sin(t*3.1+uSeed)*sin(t*1.7+uSeed*2.0);float P=uCyc.x,a=uCyc.y,b=a+uCyc.z,u=mod(t-uOff,P);',
  ' if(u<a)return 0.16*pow(max(0.0,sin(u*1.9+sin(u*0.7)*2.0)),6.0)*sm(0.0,a*0.4,u)*(0.5+0.5*u/a);',
  ' if(u<b){float v=u-a;return sm(0.0,2.5,v)*(1.0-0.3*sm(uCyc.z*0.5,uCyc.z,v))*sm(uCyc.z,uCyc.z-3.0,v);}return 0.0;}',
  'float stm(float t){if(uKind>1.5)return 0.35;float P=uCyc.x,a=uCyc.y,b=a+uCyc.z,c=b+uCyc.w,u=mod(t-uOff,P);',
  ' if(u<a)return 0.15+0.2*u/a;if(u<b)return 1.0;if(u<c)return 0.1+0.9*sm(c,b+2.0,u);return 0.1;}'].join('\n');
 const ERU_MAT=()=>mk({transparent:true,depthWrite:false,uniforms:{uT:U.uT,uScale:U.uScale,uLight:U.uLight,uWind:U.uWind,uCyc:{value:new T3.Vector4(60,6,8,8)},uOff:{value:0},uKind:{value:0},uSeed:{value:0},uH:{value:20},uSpread:{value:.06},uG:{value:GEYSER.GRAV},uDrop:{value:3}},
  vertexShader:['#include <fog_pars_vertex>',GLSL_CYCLE,'attribute vec4 aS;attribute float aK;uniform float uT,uScale,uH,uSpread,uG,uDrop;uniform vec2 uWind;varying float vA;varying float vK;',
   'void main(){vec3 p=position;float a=aS.y*6.2831853,alpha=0.0,size=aS.w;vK=aK;',
   ' if(aK<0.5){float sf=0.55+0.45*aS.z,v0=sqrt(2.0*uG*uH)*sf,L=2.0*v0/uG+0.8,age=fract(uT/L+aS.x)*L,tl=uT-age,w=wat(tl);',
   '  if(uKind>0.5&&uKind<1.5)w*=0.35+0.65*pow(0.5+0.5*sin(tl*2.3+sin(tl*0.9)*2.0+aS.y*2.0),2.0);',
   '  float vv=v0*sqrt(max(w,0.0)),spr=uSpread*(0.25+aS.z*1.2);vec3 d=normalize(vec3(cos(a)*spr,1.0,sin(a)*spr));',
   '  p+=d*vv*age+vec3(uWind.x,0.0,uWind.y)*age*age*0.7;p.y-=0.5*uG*age*age;',
   '  alpha=step(0.02,w)*step(position.y-uDrop,p.y)*0.8;size*=0.6+0.7*sqrt(w);}',
   ' else if(aK<1.5){float L=10.0,age=fract(uT/L+aS.x)*L,tl=uT-age,s=stm(tl),w=wat(tl);float top=uH*(0.3+0.7*aS.z)*sqrt(max(w,0.0));',
   '  p+=vec3(cos(a)*(0.6+age*0.8),top*(0.55+0.45*min(1.0,age/1.5))+age*(1.0+2.0*s),sin(a)*(0.6+age*0.8))+vec3(uWind.x,0.0,uWind.y)*age*age*0.3;',
   '  alpha=s*sm(0.0,1.2,age)*(1.0-age/L)*0.3;size*=(0.4+age*0.4)*(0.5+0.7*s);}',
   ' else{float L=4.0,age=fract(uT/L+aS.x)*L,tl=uT-age,w=wat(tl);float rad=uH*(0.08+uSpread*0.6)*(0.6+0.8*aS.z);',
   '  p+=vec3(cos(a)*rad*(1.0+age*0.2),age*1.2,sin(a)*rad*(1.0+age*0.2))+vec3(uWind.x,0.0,uWind.y)*age*1.5;p.y-=uDrop*0.8;',
   '  alpha=sm(0.05,0.3,w)*sm(0.0,0.6,age)*(1.0-age/L)*0.4;size*=1.0+age*0.5;}',
   ' vA=alpha;vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;float px=uScale*size/max(1.0,-mvPosition.z);if(aK<0.5&&px<2.5){alpha*=px/2.5;px=2.5;}gl_PointSize=alpha>0.001?px:0.0;','#include <fog_vertex>','}'].join('\n'),
  fragmentShader:['#include <fog_pars_fragment>','uniform float uLight;varying float vA;varying float vK;',
   'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5||vA<=0.0)discard;vec3 c=vK<0.5?vec3(0.93,0.97,1.0):vec3(0.95,0.95,0.93);',
   ' float e=vK<0.5?1.0-smoothstep(0.1,0.5,r):1.0-smoothstep(0.05,0.5,r);gl_FragColor=vec4(c*mix(1.0,0.3,1.0-uLight),vA*e);','#include <fog_fragment>','}'].join('\n')});
 SH.geysers=R.geysers.map((g,gi)=>{const m=ERU_MAT(),u=m.uniforms,P=[],AS=[],AK=[],kind=g.kind==='cone'?0:g.kind==='fountain'?1:2;
  u.uCyc.value.set(g.period||60,g.pre||0,g.dur||0,g.steam||0);u.uKind.value=kind;u.uSeed.value=gi*1.7;u.uH.value=g.H;u.uSpread.value=kind===0?.05:kind===1?.42:.3;
  u.uDrop.value=kind===0?(g.cone?g.cone.h:1)+g.mound.h*.5:.6;
  Object.defineProperty(u.uOff,'value',{get:()=>g.off||0,set:()=>{}});   /* the record's clock: GEYSER.erupt moves it */
  const big=clamp(g.H/60,.15,1),nW=Math.round((kind===2?300:kind===1?1200+5200*big:600+3200*big)),nS=Math.round(kind===2?70:180+800*big),nM=kind===2?0:Math.round(60+260*big);
  g.vents.forEach((v,vi)=>{const top=vi&&g.top2?g.top2:g.top,sc=g.kind==='cone'?(g.cone.r*.3):(g.pool||2)*.5,k=g.vents.length;
   for(let i=0;i<nW/k;i++){P.push(v[0]+rr(-1,1)*sc*.4,top,v[1]+rr(-1,1)*sc*.4);AS.push(rng(),rng(),rng(),rr(.8,2.0)*(kind===2?.6:kind===1?.6:1)*(.8+.6*big));AK.push(0);}
   for(let i=0;i<nS/k;i++){P.push(v[0]+rr(-1,1)*sc,top,v[1]+rr(-1,1)*sc);AS.push(rng(),rng(),rng(),rr(3,7)*(.6+.8*big));AK.push(1);}
   for(let i=0;i<nM/k;i++){P.push(v[0],top,v[1]);AS.push(rng(),rng(),rng(),rr(2.5,5)*(.6+.6*big));AK.push(2);}});
  const geo=new T3.BufferGeometry();geo.setAttribute('position',new T3.Float32BufferAttribute(P,3));geo.setAttribute('aS',new T3.Float32BufferAttribute(AS,4));geo.setAttribute('aK',new T3.Float32BufferAttribute(AK,1));
  const pts=new T3.Points(geo,m);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.userData.inspectLabel=g.name;pts.renderOrder=4;scene.add(pts);st.drops+=P.length/3;return pts;});
 SH.setScale=px=>{U.uScale.value=px;};
 SH.setLight=k=>{U.uLight.value=k;};
 BIO.tick(dt=>{SH.t+=dt;U.uT.value=SH.t;});
 return{show:st};};
})();
