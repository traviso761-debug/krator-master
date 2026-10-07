// ================================================================= HOST — the springs, the mud pots, the steam, the geysers (the isle)
// All of it moves on the clock in its shaders (no per-frame CPU work but the uniforms):
//   THE SPRINGS   each a disc at its level, banded by temperature from its middle out: deep blue where it boils, then
//                 turquoise, and where it cools the mats reach in, green, yellow, orange (as Grand Prismatic); the acid
//                 spring milky. The bands are the spring's own (temp, 45); the mats round it are the ground's paint (84)
//   THE MUD POTS  grey mud that swells into bubbles and bursts in rings
//   THE STEAM     the fumaroles, the springs, the warm creek's head, the geysers between eruptions
//   THE GEYSERS   on a schedule (period, dur, H: 45): the Great Geyser's column 38 m, the Fountain's bursts out of its pool;
//                 water drops thrown up and falling back, and the steam cloud that rises off them and drifts downwind.
//                 window._api.erupt(key) starts one now (for a camera); GEYSER_STATE(key) says whether one is playing
// ---------------------------------------------------------------- the springs
const SPRINGU=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uSky:{value:new THREE.Color(0xd8dcd8)},uLight:{value:1}}]);
const SPRING_MAT=new THREE.ShaderMaterial({fog:true,uniforms:SPRINGU,
 vertexShader:['#include <fog_pars_vertex>','attribute vec3 aP;varying vec3 vWP;varying vec3 vP;',
  'void main(){vP=aP;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vP;',
  'void main(){float t=vP.x,temp=vP.y,acid=vP.z;',
  // the bands: the clear water to where the mats begin (later the cooler the spring), then green, yellow, orange, rust
  ' float m0=clamp(temp*0.78,0.08,0.86);vec3 deep=vec3(0.02,0.16,0.42),blue=vec3(0.08,0.52,0.72),green=vec3(0.36,0.62,0.28),yel=vec3(0.86,0.72,0.2),ora=vec3(0.8,0.4,0.1),rust=vec3(0.52,0.22,0.08);',
  ' vec3 c=mix(deep,blue,smoothstep(0.0,m0,t));',
  ' float u=(t-m0)/max(0.05,1.0-m0);c=mix(c,green,smoothstep(0.0,0.12,u));c=mix(c,yel,smoothstep(0.18,0.38,u));c=mix(c,ora,smoothstep(0.42,0.66,u));c=mix(c,rust,smoothstep(0.75,1.0,u));',
  ' c=mix(c,vec3(0.62,0.82,0.8),acid);c=mix(c,vec3(0.86,0.76,0.32),acid*smoothstep(0.7,1.0,t));',
  ' vec3 n=normalize(vec3(0.015*sin(vWP.x*0.6+uT*1.1)+0.01*sin(vWP.z*0.9-uT*0.8),1.0,0.015*cos(vWP.z*0.5+uT*0.9)));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),3.0);',
  ' vec3 col=mix(c,uSky,0.04+fr*0.22);vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.8*vec3(1.0,0.95,0.85);',
  ' gl_FragColor=vec4(col*uLight,1.0);','#include <fog_fragment>','}'].join('\n')});
SPRING_MAT.uniforms=SPRINGU;SPRING_MAT.uniforms.fogColor.value=scene.fog.color;SPRING_MAT.uniforms.fogDensity.value=scene.fog.density;
POOLS.forEach((P,i)=>{const R=P.r*1.3,NR=10,NA=56,pos=[],aP=[],idx=[];
 for(let r=0;r<=NR;r++)for(let a=0;a<NA;a++){const t=r/NR,an=a/NA*TAU;pos.push(P.x+Math.cos(an)*R*t,POOLL[i],P.z+Math.sin(an)*R*t);aP.push(Math.min(1,t*R/P.r),P.temp,P.acid?1:0);}
 for(let r=0;r<NR;r++)for(let a=0;a<NA;a++){const A=r*NA+a,B=r*NA+(a+1)%NA,C=(r+1)*NA+a,D=(r+1)*NA+(a+1)%NA;idx.push(A,C,B,B,C,D);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aP',new THREE.Float32BufferAttribute(aP,3));g.setIndex(idx);
 const m=new THREE.Mesh(g,SPRING_MAT);m.userData.inspectLabel=P.name;   // not probeSkip: the spring is what its registered volume holds
m.renderOrder=1;scene.add(m);
 REGISTER({name:P.name,x:P.x,z:P.z,y:POOLL[i]-4,r:P.r*1.6,h:10,spring:P.key});});

// ---------------------------------------------------------------- the mud pots
const MUDU=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uLight:{value:1}}]);
const MUD_MAT=new THREE.ShaderMaterial({fog:true,uniforms:MUDU,
 vertexShader:['#include <fog_pars_vertex>','attribute vec3 aM;uniform float uT;varying float vH;',
  'float bub(vec2 p,float s,float k){float per=1.6+0.9*fract(s*7.3+k*0.37),T=uT/per+fract(s*13.1+k*0.61),cyc=floor(T),ph=fract(T);',
  ' vec2 c=0.55*vec2(sin(s*91.0+k*2.1+cyc*1.7),cos(s*57.0+k*1.3+cyc*2.3));float d=length(p-c);',
  ' float grow=smoothstep(0.0,0.82,ph)*step(ph,0.86),rb=0.12+0.18*grow;float h=0.38*grow*exp(-d*d/(rb*rb));',
  ' float ring=step(0.86,ph)*(1.0-ph)*7.0;h+=0.05*ring*sin((d-(ph-0.86)*4.0)*28.0)*exp(-d*3.0);return h;}',
  'void main(){vec2 p=aM.xy;float s=aM.z,R=length(p);float h=0.0;for(int k=0;k<3;k++)h+=bub(p,s,float(k));h*=smoothstep(1.0,0.75,R);vH=h;',
  ' vec3 pos=position+vec3(0.0,h,0.0);vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uLight;varying float vH;',
  'void main(){vec3 c=mix(vec3(0.3,0.28,0.25),vec3(0.66,0.64,0.6),clamp(vH*3.0,0.0,1.0));gl_FragColor=vec4(c*uLight,1.0);','#include <fog_fragment>','}'].join('\n')});
MUD_MAT.uniforms=MUDU;MUD_MAT.uniforms.fogColor.value=scene.fog.color;MUD_MAT.uniforms.fogDensity.value=scene.fog.density;
MUD.pots.forEach(Pt=>{const NR=8,NA=28,pos=[],aM=[],idx=[],y=terrainH(Pt.x,Pt.z)+.04;
 for(let r=0;r<=NR;r++)for(let a=0;a<NA;a++){const t=r/NR,an=a/NA*TAU,c=Math.cos(an)*t,s=Math.sin(an)*t;pos.push(Pt.x+c*Pt.r,y,Pt.z+s*Pt.r);aM.push(c,s,Pt.seed);}
 for(let r=0;r<NR;r++)for(let a=0;a<NA;a++){const A=r*NA+a,B=r*NA+(a+1)%NA,C=(r+1)*NA+a,D=(r+1)*NA+(a+1)%NA;idx.push(A,C,B,B,C,D);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aM',new THREE.Float32BufferAttribute(aM,3));g.setIndex(idx);
 const m=new THREE.Mesh(g,MUD_MAT);m.userData.inspectLabel='A mud pot';m.frustumCulled=false;scene.add(m);Pt.y=y;});
REGISTER({name:MUD.name,x:MUD.x,z:MUD.z,y:terrainH(MUD.x,MUD.z)-3,r:MUD.r*1.3,h:10,mud:true});

// ---------------------------------------------------------------- the steam
const STEAMU={uT:{value:0},uScale:{value:innerHeight*.5},uCol:{value:new THREE.Color(0xeeeae4)}};
const STEAM_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,STEAMU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec4 aS;uniform float uT,uScale;varying float vA;',
  'void main(){float ph=fract(uT*aS.y+aS.x);vec3 p=position+vec3(sin(ph*6.0+aS.x*9.0)*aS.z*0.4+ph*aS.z*2.5,ph*aS.w,cos(ph*5.0+aS.x*7.0)*aS.z*0.4+ph*aS.z*1.2);',
  ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.6+ph*2.2)/max(1.0,-mvPosition.z);',
  ' vA=smoothstep(0.0,0.12,ph)*(1.0-ph)*0.5;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform vec3 uCol;varying float vA;',
  'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5)discard;gl_FragColor=vec4(uCol,vA*smoothstep(0.5,0.1,r));','#include <fog_fragment>','}'].join('\n')});
STEAM_MAT.uniforms.fogColor.value=scene.fog.color;STEAM_MAT.uniforms.fogDensity.value=scene.fog.density;
['uT','uScale','uCol'].forEach(k=>STEAM_MAT.uniforms[k]=STEAMU[k]);
(function(){reseed(8401);const P=[],A=[];
 const add=(x,z,y,n,size,rise,rate,spread)=>{spread=spread||1.5;for(let i=0;i<n;i++){P.push(x+rr(-spread,spread),y,z+rr(-spread,spread));A.push(rng(),rate*rr(.8,1.2),size*rr(.7,1.3),rise*rr(.7,1.3));}};
 STEAM.forEach(S=>add(S.x,S.z,terrainH(S.x,S.z),Math.round(8+16*S.s),3.5+4*S.s,20+26*S.s,.07));
 POOLS.forEach((p,i)=>add(p.x,p.z,POOLL[i],Math.round(4+p.r*.6*p.temp),2+p.r*.12,8+p.r*.4,.08,p.r*.6));
 MUD.pots.forEach(p=>add(p.x,p.z,p.y,3,1.6,6,.1,.5));
 // the fall's spray where it meets the sea
 if(FALL)add(FALL.x+FALL.dx*FALL.reach,FALL.z+FALL.dz*FALL.reach,SEA,30,3.5,9,.16,FALL.w*.6);
 GEYSERS.forEach(G=>add(G.x,G.z,terrainH(G.x,G.z)+(G.ch||0),10,3,16,.08,1));
 // the warm creek's first 300 m
 {const C=GULLIES.find(g=>g.warm);for(let i=0;i<C.pts.length*.4;i+=2){const p=C.pts[i];add(p[0],p[1],terrainH0(p[0],p[1])+.4,2,2.5,7,.06,3);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));
 const pts=new THREE.Points(g,STEAM_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=2;scene.add(pts);})();

// ---------------------------------------------------------------- the geysers
// Each particle is thrown up again and again while its geyser plays: its age within its own flight (v0 up, gravity
// down), launched at (the eruption's clock - age); drawn only if that launch fell inside the eruption. The jet's
// strength rises over the first seconds and fails at the end. The wind (from the north-west) leans the column
const WIND=[.55,0,.42];
const GEYU={uT:{value:0},uScale:{value:innerHeight*.5},uLight:{value:1},uClock:{value:new THREE.Vector4(0,0,0,0)},uPer:{value:new THREE.Vector4(1,1,1,1)},uDur:{value:new THREE.Vector4(0,0,0,0)},uH:{value:new THREE.Vector4(0,0,0,0)}};
const GEY_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,GEYU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec4 aG;attribute vec4 aS;uniform float uScale;uniform vec4 uClock,uPer,uDur,uH;varying float vA;varying float vSteam;',
  'float pick4(vec4 v,float i){return i<0.5?v.x:(i<1.5?v.y:(i<2.5?v.z:v.w));}',
  'void main(){float gi=aG.x,steam=aG.y,spread=aG.z;float cyc=pick4(uClock,gi),dur=pick4(uDur,gi),H=pick4(uH,gi);',
  ' float sf=0.55+0.5*aS.z,g=9.8;vec3 p=position;float a=aS.y*6.2831853;float alpha=0.0,size=aS.w;',
  ' if(steam<0.5){float v0=sqrt(2.0*g*H)*sf;float L=2.0*v0/g;float age=fract(cyc/L+aS.x)*L;float launch=cyc-age;',
  '  float on=step(0.0,launch)*step(launch,dur);float env=smoothstep(0.0,2.0,launch)*smoothstep(dur,dur-3.0,launch);v0*=0.45+0.55*env;',
  '  vec3 d=normalize(vec3(cos(a)*spread*(0.3+aS.z),1.0,sin(a)*spread*(0.3+aS.z)));float y=v0*d.y*age-0.5*g*age*age;',
  '  p+=vec3(d.x*v0*age,y,d.z*v0*age)+vec3(0.55,0.0,0.42)*age*age*0.9;alpha=on*step(-0.5,y)*0.55;size*=0.7+0.6*env;}',
  ' else{float L=9.0;float age=fract(cyc/L+aS.x)*L;float launch=cyc-age;float on=step(0.0,launch)*step(launch,dur+4.0);',
  '  float top=H*(0.5+0.5*aS.z);p+=vec3(cos(a)*2.0,top*min(1.0,age/2.5)+age*2.6,sin(a)*2.0)+vec3(0.55,0.0,0.42)*age*age*0.35;',
  '  alpha=on*smoothstep(0.0,1.0,age)*(1.0-age/L)*0.45;size*=1.0+age*0.9;}',
  ' vA=alpha;vSteam=steam;vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=alpha>0.0?uScale*size/max(1.0,-mvPosition.z):0.0;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uLight;varying float vA;varying float vSteam;',
  'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5||vA<=0.0)discard;vec3 c=mix(vec3(0.94,0.97,1.0),vec3(0.95,0.95,0.93),vSteam);',
  ' gl_FragColor=vec4(c*uLight,vA*smoothstep(0.5,mix(0.25,0.05,vSteam),r));','#include <fog_fragment>','}'].join('\n')});
GEY_MAT.uniforms.fogColor.value=scene.fog.color;GEY_MAT.uniforms.fogDensity.value=scene.fog.density;
['uT','uScale','uLight','uClock','uPer','uDur','uH'].forEach(k=>GEY_MAT.uniforms[k]=GEYU[k]);
const GEY_OFF={};   // per geyser: an offset onto the clock (erupt() sets it so the cycle starts now)
(function(){reseed(8501);const P=[],AG=[],AS=[];
 GEYSERS.forEach((G,gi)=>{const by=G.pool?POOLL[POOLS.findIndex(p=>p.geyser===G.key)]:terrainH(G.x,G.z)+G.ch,spread=G.pool?.42:.07;G.top=by;
  GEYU.uPer.value.setComponent(gi,G.period);GEYU.uDur.value.setComponent(gi,G.dur);GEYU.uH.value.setComponent(gi,G.H);GEY_OFF[G.key]=G.ph;
  for(let i=0,n=G.pool?900:2600;i<n;i++){P.push(G.x+rr(-.4,.4)*(G.pool?G.pool*.5:1),by,G.z+rr(-.4,.4)*(G.pool?G.pool*.5:1));AG.push(gi,0,spread,0);AS.push(rng(),rng(),rng(),rr(1.0,2.2));}
  for(let i=0,n=G.pool?220:700;i<n;i++){P.push(G.x+rr(-1,1),by,G.z+rr(-1,1));AG.push(gi,1,0,0);AS.push(rng(),rng(),rng(),rr(4,8));}
  REGISTER({name:G.name,x:G.x,z:G.z,y:terrainH(G.x,G.z)-2,r:G.mound,h:G.H+10,geyser:G.key});});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aG',new THREE.Float32BufferAttribute(AG,4));g.setAttribute('aS',new THREE.Float32BufferAttribute(AS,4));
 const pts=new THREE.Points(g,GEY_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=3;scene.add(pts);})();
let GEY_T=0;
const geyClock=G=>{const c=(GEY_T+GEY_OFF[G.key])%G.period;return c<0?c+G.period:c;};
const GEYSER_STATE=key=>{const G=GEYSERS.find(g=>g.key===key);const c=geyClock(G);return{playing:c<G.dur,clock:c,next:c<G.dur?0:G.period-c};};
function erupt(key){const G=GEYSERS.find(g=>g.key===key);if(!G)return false;GEY_OFF[key]=-(GEY_T%G.period)+.01;return true;}
TICKS.push(dt=>{GEY_T+=dt;SPRINGU.uT.value+=dt;MUDU.uT.value+=dt;STEAMU.uT.value+=dt;
 const sc=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));STEAMU.uScale.value=sc;GEYU.uScale.value=sc;
 GEYSERS.forEach((G,gi)=>GEYU.uClock.value.setComponent(gi,geyClock(G)));});
_onLight.push(m=>{const k=m==='night'?.18:1;SPRINGU.uLight.value=k;MUDU.uLight.value=k;GEYU.uLight.value=m==='night'?.3:1;STEAMU.uCol.value.setHex(m==='night'?0x40444c:0xeeeae4);});
_mark('springs');
