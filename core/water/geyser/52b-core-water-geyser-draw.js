// ================================================================= WATER - drawing: hot springs and geyser columns
// [draw] + [G shader]. Needs 20 and 52-core-water-geyser.js, three.js r128 (o.THREE, or a global THREE) and, for a geyser's
// particles, core/rand. core/atmos is optional: bound (ATMOS.init), it supplies the default clock (ATMOS.hook's t), the night
// dimming of the light and the sun's direction; absent, the page passes its own uniforms or steps WATER.thermalStep(dt).
//
//   WATER.drawSpring(S, o)   a spring surface (WATER.spring) as a disc at its level, banded from its middle out by its
//        temperature and mineral (WATER.springGLSL, twin WATER.springColour), a boiling pool churning in rings of bubbles.
//        One material per ramp (o.mats, a Map the caller keeps, shares them). Returns {mesh, material, tris}.
//   WATER.drawGeyser(S, o)   a geyser (WATER.geyser) as one Points: a drop thrown up again and again (its age within its
//        flight, launched at (now - age), as hard as S's cycle says it played at that launch, so the column stands at once
//        wherever the clock is set), the steam that rolls downwind off it, the mist where the water lands. The cycle in its
//        shader is WATER.geyserGLSL (twin S.state); its clock offset is S.offAt() read each frame. Returns {points, material}.
//   o: {THREE, scene (added to when given), uniforms {uT, uSun, uSky, uLight, uScale, uWind} (shared, any missing are made),
//       fog (scene.fog), wind [x, z], renderOrder, onMaterial(m) (the page keeps its materials)}.
//   WATER.thermalUniforms(o) the shared set; WATER.thermalStep(dt) steps its clock when nothing else does.
// Meshes carry userData.probeSkip for the Points and userData.inspectLabel = the surface's name; they are named 'water:<name>'.
(function(){const W=WATER,TAU=Math.PI*2;
 const glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';};
 const AT=()=>{try{return typeof ATMOS!=='undefined'&&ATMOS&&ATMOS.hook?ATMOS:null;}catch(e){return null;}};
 const TH=o=>o.THREE||(typeof THREE!=='undefined'?THREE:null);
 let SOLO=null;
 // the shared uniforms: the page's where it gives them, else one module set (clock from ATMOS when bound, else thermalStep)
 W.thermalUniforms=o=>{o=o||{};const T=TH(o),U=o.uniforms||(o.uniforms={});
  const need=(k,v)=>{if(!U[k])U[k]={value:v};};
  const A=AT(),own=!U.uT;
  need('uT',0);need('uScale',600);need('uLight',1);
  need('uWind',new T.Vector2(o.wind?o.wind[0]:.5,o.wind?o.wind[1]:-.3));
  need('uSun',new T.Vector3(-.6,.55,.47).normalize());need('uSky',new T.Color(0xc8d4d4));
  if(own&&A&&!U.__hooked){U.__hooked=true;A.hook((t,hour)=>{U.uT.value=t;if(!o.fixedLight&&A.night&&hour!=null)U.uLight.value=1-.7*A.night(hour);});}
  SOLO=SOLO||U;return U;};
 W.thermalStep=dt=>{if(SOLO&&SOLO.uT)SOLO.uT.value+=dt;};
 const fogged=(T,o,spec)=>{const m=new T.ShaderMaterial(Object.assign({fog:true},spec,{uniforms:Object.assign(T.UniformsUtils.merge([T.UniformsLib.fog]),spec.uniforms||{})}));
  const f=o.fog;if(f){m.uniforms.fogColor.value=f.color;m.uniforms.fogDensity.value=f.density;}if(o.onMaterial)o.onMaterial(m);return m;};
 const tag=(m,S)=>{m.name='water:'+S.name;m.userData.inspectLabel=S.name;m.userData.water=S.id;return m;};

 // ---- the spring: the disc
 const springMat=(T,o,ramp,key)=>{const M=o.mats||(o.mats=new Map());if(M.has(key))return M.get(key);const U=W.thermalUniforms(o);
  const m=fogged(T,o,{side:T.DoubleSide,uniforms:{uT:U.uT,uSun:U.uSun,uSky:U.uSky,uLight:U.uLight},
   vertexShader:['#include <fog_pars_vertex>','attribute vec4 aP;varying vec3 vWP;varying vec4 vP;',
    'void main(){vP=aP;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
   fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec4 vP;',
    'float sm(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}',W.springGLSL(ramp),
    'void main(){float t=vP.x,temp=vP.y,boil=vP.z;vec3 c=thmColour(t,temp,vP.w);',
    // a boiling pool churns: rings of bubbles welling up at its middle
    ' float b=boil*sm(0.5,0.0,t)*(0.5+0.5*sin(t*40.0-uT*9.0))*sm(0.3,1.0,sin(uT*2.3+vWP.x)*0.5+0.5);c=mix(c,vec3('+W.THERMAL.foam.map(glf).join(',')+'),b*0.4);',
    ' vec3 n=normalize(vec3(0.015*sin(vWP.x*0.6+uT*1.1)+0.01*sin(vWP.z*0.9-uT*0.8)+b*0.05*sin(vWP.z*3.0),1.0,0.015*cos(vWP.z*0.5+uT*0.9)));',
    ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),3.0);',
    ' vec3 col=mix(c,uSky,0.04+fr*0.3);vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.8*vec3(1.0,0.95,0.85);',
    ' gl_FragColor=vec4(col*uLight,1.0);','#include <fog_fragment>','}'].join('\n')});
  M.set(key,m);return m;};
 W.drawSpring=(S,o)=>{o=o||{};const T=TH(o),q=S.thermal;if(!q)throw new Error('WATER.drawSpring: not a spring');
  let ramp=W.rampOf(q.ramp||q.mineral);const tk=q.tint;
  if(tk){const R2={};for(const n in ramp)R2[n]=[ramp[n][0]*tk[0],ramp[n][1]*tk[1],ramp[n][2]*tk[2]];ramp=R2;}   /* the tint multiplies every stop */
  const key=JSON.stringify(ramp),m=springMat(T,o,ramp,key),r=q.r,x=q.x,z=q.z,level=q.level,
   Rr=r*1.02,NR=Math.max(6,Math.round(r*.6)),NA=Math.max(24,Math.min(72,Math.round(r*4))),pos=[],aP=[],idx=[];
  for(let i=0;i<=NR;i++)for(let a=0;a<NA;a++){const t=i/NR,an=a/NA*TAU,wob=1+.04*Math.sin(an*5+x)*t;pos.push(x+Math.cos(an)*Rr*t*wob,level,z+Math.sin(an)*Rr*t*wob);aP.push(Math.min(1,t*Rr/r),q.temp,q.boil,q.milky);}
  for(let i=0;i<NR;i++)for(let a=0;a<NA;a++){const A=i*NA+a,B=i*NA+(a+1)%NA,C2=(i+1)*NA+a,D=(i+1)*NA+(a+1)%NA;idx.push(A,C2,B,B,C2,D);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('aP',new T.Float32BufferAttribute(aP,4));g.setIndex(idx);
  const mesh=tag(new T.Mesh(g,m),S);mesh.renderOrder=o.renderOrder==null?1:o.renderOrder;if(o.scene)o.scene.add(mesh);
  return{mesh,material:m,tris:idx.length/3};};

 // ---- the geyser: the column
 W.drawGeyser=(S,o)=>{o=o||{};const T=TH(o),U=W.thermalUniforms(o),GRAV=o.gravity==null?7.35:o.gravity;
  const m=fogged(T,o,{transparent:true,depthWrite:false,uniforms:{uT:U.uT,uScale:U.uScale,uLight:U.uLight,uWind:U.uWind,uCyc:{value:new T.Vector4(S.period||60,S.pre,S.dur,S.steam)},uOff:{value:0},uKind:{value:S.styleKind},uSeed:{value:S.wob},
    uH:{value:S.H},uSpread:{value:S.spread},uG:{value:GRAV},uDrop:{value:S.drop}},
  vertexShader:['#include <fog_pars_vertex>',W.geyserGLSL(),'attribute vec4 aS;attribute float aK;uniform float uT,uScale,uH,uSpread,uG,uDrop;uniform vec2 uWind;varying float vA;varying float vK;',
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
  Object.defineProperty(m.uniforms.uOff,'value',{get:()=>S.offAt(),set:()=>{}});   /* the record's clock: a kit's erupt moves it */
  const D=W.geyserParticles(S),geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(D.pos,3));geo.setAttribute('aS',new T.Float32BufferAttribute(D.aS,4));geo.setAttribute('aK',new T.Float32BufferAttribute(D.aK,1));
  const pts=tag(new T.Points(geo,m),S);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=o.renderOrder==null?4:o.renderOrder;if(o.scene)o.scene.add(pts);
  return{points:pts,material:m,count:D.count};};
})();
