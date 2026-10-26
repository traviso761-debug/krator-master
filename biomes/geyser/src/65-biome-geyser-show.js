// ================================================================= GEYSER — the show: the springs, the mud, the steam, the eruptions
// What moves, all of it on the clock in its shaders (no per-frame CPU work but the uniforms), drawn through BIO.host's
// THREE and scene (a world binds them; Godot: these are spatial shaders and GPUParticles3D, the records in GEYSER.R). The springs
// and the geysers' columns are core/water's kinds since 2026-10-20 (WATER.spring, WATER.geyser: core/water 52 and 52b read in place):
// this fragment lays the records into them and draws them through WATER.drawSpring and WATER.drawGeyser:
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
 // ---------------------------------------------------------------- the springs and the pools of the pool geysers: core/water (52, 52b)
 // WATER.spring is a still surface with a temperature and a mineral ramp, WATER.drawSpring its disc, banded from the middle out
 // (deep blue where it boils, turquoise, and where it cools the mats reach in, green, yellow, orange: as Grand Prismatic)
 const WOPT={THREE:T3,scene:null,uniforms:U,fog:scene.fog,wind:[wind[0],wind[1]],mats:new Map(),onMaterial:m=>SH.mats.push(m)},WORLD=650631;
 SH.springs=[];SH.pools=[];
 function disc(S,label){const D=WATER.drawSpring(S,WOPT);D.mesh.userData.inspectLabel=label;scene.add(D.mesh);st.springs++;BIO.tally(D.tris,0,1);return D.mesh;}
 R.springs.forEach(s=>{const S=WATER.spring({key:s.key,name:s.name,x:s.x,z:s.z,r:s.r,level:s.level,temp:s.temp,milky:s.milky,kind:s.kind});SH.springs.push(S);disc(S,s.name);BIO.register({name:s.name,spring:s.key,x:s.x,z:s.z,y:s.level-4,r:s.r*1.4,h:10});});
 R.geysers.forEach(g=>{if(g.kind!=='cone'){const nm=g.name.replace(/ \(.*/,'')+"'s pool";SH.pools.push(disc(WATER.spring({key:g.key+':pool',name:nm,x:g.x,z:g.z,r:g.pool||2,level:g.level,temp:1,boil:1,steam:0}),nm));}});
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
  SH.springs.forEach(S=>S.thermal.steam.forEach(q=>{if(q.group!=='milky')add(q.x,q.z,q.y,q.n,q.size,q.rise,q.rate,q.spread,q.tint);}));   /* the springs' puffs: WATER.spring's plan */
  R.mud.forEach(m=>add(m.x,m.z,m.level,3,1.8,7,.1,.6));
  SH.springs.forEach(S=>S.thermal.steam.forEach(q=>{if(q.group==='milky')add(q.x,q.z,q.y,q.n,q.size,q.rise,q.rate,q.spread,q.tint);}));
  R.flats.forEach(f=>{const n=Math.round(f.rx*f.rz/900);for(let k=0;k<n;k++){const a=rr(0,TAU),d=Math.sqrt(rng())*.8,x=f.x+Math.cos(a)*f.rx*d,z=f.z+Math.sin(a)*f.rz*d,g=GEYSER.at(x,z);if(g.heat<.2&&g.vent<.05)continue;add(x,z,BIO.terrainH(x,z)+.5,1,7,10,.025,4);}});
  R.runoff.forEach(ch=>{for(let i=0;i<ch.P.length;i+=4){const p=ch.P[i],T=GEYSER.chT(ch,p[2]);if(T<62)break;add(p[0],p[1],BIO.terrainH(p[0],p[1])+.2,1,2,6,.08,GEYSER.chW(ch,p[2])*.6);}});
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(P,3));g.setAttribute('aS',new T3.Float32BufferAttribute(A,4));g.setAttribute('aC',new T3.Float32BufferAttribute(Cc,3));
  const pts=new T3.Points(g,STEAM_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=3;scene.add(pts);st.steam=P.length/3;}
 // ---------------------------------------------------------------- the eruptions: WATER.geyser (core/water 52), drawn by WATER.drawGeyser
 // One Points per geyser. A drop is thrown up again and again: its age within its flight, launched at (now - age), as hard as
 // the geyser's cycle (WATER.geyser's state(t), run in GLSL in the shader: the same maths as GEYSER.cycle) says it played at that
 // launch; so the column stands at once wherever the clock is set (GEYSER.erupt moves its offset, read each frame).
 SH.waters=R.geysers.map((g,gi)=>WATER.geyser({key:g.key,name:g.name,vents:g.vents,top:g.top,top2:g.top2,H:g.H,style:g.kind,period:g.period,pre:g.pre,dur:g.dur,steam:g.steam,
  off:()=>g.off||0,wob:gi*1.7,pool:g.pool,cone:g.cone,mound:g.mound,world:WORLD}));   /* wob: the spouter's wobble phase, as the shader had it */
 SH.geysers=SH.waters.map(S=>{const D=WATER.drawGeyser(S,Object.assign({},WOPT,{scene,gravity:GEYSER.GRAV}));st.drops+=D.count;return D.points;});
 SH.setScale=px=>{U.uScale.value=px;};
 SH.setLight=k=>{U.uLight.value=k;};
 BIO.tick(dt=>{SH.t+=dt;U.uT.value=SH.t;});
 return{show:st};};
})();
