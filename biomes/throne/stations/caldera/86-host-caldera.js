// ================================================================= HOST — the caldera's lava lake, its glow, the plume, the eruption, the penitentes, the frozen fumaroles
// As RECORDS first (README.md), then drawn. The lava lake: a crust of dark plates cracking, sliding and overturning on the
// lava, fountains here and there (all in its shader, on the clock); its glow, a warm light from the caldera (faint by day,
// strong at night: the summit glow); THE PLUME, a column of billows rising out of the lake and leaning away south-east on
// the high wind, lit orange from below at night; the plateau's PENITENTES (blades of hard snow the sun has carved, all
// leaning the same way); the frozen fumaroles on the crest (ice towers, steaming) and the steam down the wall.
const SUMMIT={lake:{x:LAKE.x,z:LAKE.z,r:LAKE.r,level:LAKE.level,outline:'lobed (LAKE.rAt)'},plume:0,penitentes:0,towers:0,fumaroles:FUMS.length};
const C3=h=>new THREE.Color(h);

// ---------------------------------------------------------------- the eruption (state)
// ERUPTION: a toggle (the owner's: "simulate an eruption"). The state is pure and eased (Godot ports it line for line, as the
// shared atmosphere's weather): E.on the switch; E.k 0..1 eases up in ~6 s and down in ~25 s (the fountains die first, the
// plume's ash hangs on); E.t the seconds since it began. Everything below reads E.k through its uniform (uErupt).
const ERUPT={on:false,k:0,t:0};
SUMMIT.eruptStep=(E,dt)=>{const g=E.on?1:0,r=E.on?dt/6:dt/25;E.k+=clamp(g-E.k,-r,r);E.t=E.on?E.t+dt:0;return E;};
const ERUPTU={value:0};

// ---------------------------------------------------------------- the lava lake
// Its outline lobed and ragged (LAKE.rAt). Its surface heaves in slow swells (3D, in the vertex shader; domed over the vents
// in an eruption). The crust: big plates (a moving Voronoi) with glowing cracks between them, each plate broken into small
// FACETS riding it (a second, finer Voronoi): each facet tilted its own way and shaded by the sun, the library's aa lava for
// its grain, thin glowing seams between the facets, some facets thin enough that the heat glows through. A plate now and
// then overturns. In an eruption the cracks widen, the plates overturn far more often and patches churn to bright lava.
const LAVAU={uT:{value:0},uNight:{value:0}};
const LAVATEX=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=KMAT.packed('throne','ground.lava');if(!P)return null;const t=KMAT.textures(P,{aniso:8}).map;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
// the vents (the eruption's: 86 below fills them) dome the surface over them as it erupts
const LAKEVENTS=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
// THE SURFACE (shared by the vertex and the fragment shader): slow swells and a heave travelling across it, the vents' domes
const LAVA_H='uniform float uT,uErupt;uniform vec3 uVents[4];'+
 'float lavaH(vec2 p){float h=1.3*sin(p.x*0.011+uT*0.21)*sin(p.y*0.013-uT*0.17)+0.7*sin((p.x+p.y)*0.027+uT*0.45)+0.35*sin(p.x*0.061-p.y*0.047+uT*0.8);'+
 ' for(int i=0;i<4;i++){vec2 d=p-uVents[i].xy;h+=uErupt*uVents[i].z*(5.0+1.5*sin(uT*3.0+float(i)))*exp(-dot(d,d)/1800.0);}return h;}';
const MAT_LAVA=new THREE.ShaderMaterial({fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,LAVAU,{uErupt:{value:0},uCrust:{value:LAVATEX},uVents:{value:LAKEVENTS},uSunDir:{value:new THREE.Vector3(...SUN_POS).normalize()},uC:{value:new THREE.Vector2(LAKE.x,LAKE.z)}}]),
 vertexShader:['#include <fog_pars_vertex>',LAVA_H,'varying vec3 vWP;varying vec3 vN;',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.0);vec2 p=wp.xz;float e=2.0,h=lavaH(p);wp.y+=h;',
  ' vN=normalize(vec3(lavaH(p-vec2(e,0.0))-lavaH(p+vec2(e,0.0)),2.0*e,lavaH(p-vec2(0.0,e))-lavaH(p+vec2(0.0,e))));',
  ' vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uNight,uErupt;uniform sampler2D uCrust;uniform vec3 uSunDir;uniform vec2 uC;varying vec3 vWP;varying vec3 vN;',
  // a hash without sin (Dave Hoskins' hash22): sin() of large arguments differs between GPUs and broke the noise into squares
  'vec2 h2(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}',
  'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h2(i).x,h2(i+vec2(1,0)).x,f.x),mix(h2(i+vec2(0,1)).x,h2(i+vec2(1,1)).x,f.x),f.y);}',
  // the crust is torn, not ruled: the Voronoi's coordinates warped by two octaves of noise, so every edge wiggles
  'vec2 warp(vec2 p){return vec2(vn(p*0.09)+0.5*vn(p*0.31+7.0),vn(p*0.09+3.1)+0.5*vn(p*0.31+11.0))-0.75;}',
  // a moving Voronoi: F1, F2 (the edge is F2-F1), the cell's id
  'vec3 vor(vec2 p,float tm,out vec2 id){vec2 c=floor(p),f=fract(p);float F1=8.0,F2=8.0;id=vec2(0.0);',
  ' for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j)),o=h2(c+g);o=0.5+0.3*sin(tm+6.2831*o);vec2 r=g+o-f;float d=dot(r,r);',   // a swing of .3: with a 3x3 search F2 is always the true second (.42 broke it: square seams)
  '  if(d<F1){F2=F1;F1=d;id=c+g;}else if(d<F2)F2=d;}return vec3(sqrt(F1),sqrt(F2),sqrt(F2)-sqrt(F1));}',
  'void main(){vec2 lp=vWP.xz-uC;float sp=1.0+3.0*uErupt;vec2 drift=vec2(uT*0.004,uT*0.003)*sp;',
  // THE PLATES (~50 m): the big crust plates, their cracks glowing; a plate now and then overturning
  ' vec2 wq=lp+warp(lp)*8.0;vec2 pid;vec3 P=vor(wq*0.019+drift,uT*0.15*sp,pid);float pw=(0.035+0.035*vn(lp*0.02))+0.07*uErupt,crack=1.0-smoothstep(0.0,pw,P.z);',
  ' float hs=h2(pid+floor(uT*0.05*sp)).x,over=step(0.975-0.25*uErupt,hs)*(0.5+0.5*sin(uT*2.0+hs*30.0))*smoothstep(0.0,0.25,P.z);',
  // THE FACETS (~9 m, riding the plates): each its own tilt, shade and heat; thin glowing seams between them
  ' vec2 wf=wq+warp(wq*2.3)*2.2;vec2 fid;vec3 Fv=vor(wf*0.11+drift*5.8,uT*0.05*sp,fid);vec2 fh=h2(fid+pid*1.31);',
  ' float sw=0.012+0.035*vn(wf*0.07+fh*9.0);float seam=1.0-smoothstep(0.0,sw+0.04*uErupt,Fv.z);seam*=(0.35+0.65*smoothstep(0.0,0.35,P.z))*smoothstep(0.0,0.4,vn(wf*0.05+3.0)+0.3*fh.y);',
  ' float thin=smoothstep(0.82,1.0,fh.x)+0.6*smoothstep(0.3,0.0,P.z);',   // some facets thin: the heat glows through them
  // the normal: the surface's swell, each facet tilted, the crust's grain
  ' vec3 tex='+(LAVATEX?'texture2D(uCrust,lp*0.11+fh*5.0).rgb;':'vec3(0.5+0.5*sin(vWP.x*0.9)*sin(vWP.z*0.8));'),
  ' vec3 N=normalize(vN+vec3((fh.x-0.5)*0.9,0.0,(fh.y-0.5)*0.9)*(0.4+0.6*smoothstep(0.0,0.2,Fv.z))+vec3(tex.r-0.5,0.0,tex.g-0.5)*0.6);',
  ' float lit=0.25+0.75*max(dot(N,uSunDir),0.0),spec=pow(max(dot(reflect(-uSunDir,N),normalize(cameraPosition-vWP)),0.0),24.0)*0.25;',
  ' vec3 crust=mix(vec3(0.07,0.06,0.055),vec3(0.36,0.31,0.27),pow(tex.r,1.4)*0.85+0.15*fh.y)*lit*(1.0-uNight*0.8)+spec*vec3(0.75,0.7,0.65)*(1.0-uNight)*(0.5+tex.g);',
  ' vec3 hot=mix(vec3(1.0,0.3,0.04),vec3(1.0,0.78,0.32),crack*crack);float heat=1.3+uNight*1.6+uErupt*1.2;',
  ' vec3 col=crust+vec3(0.85,0.18,0.02)*thin*(0.18+0.5*uNight+0.4*uErupt)*(0.6+0.4*tex.r);',
  ' col=mix(col,vec3(1.0,0.42,0.07)*heat*0.75,seam*0.85);',
  ' col=mix(col,hot*heat,max(crack,over));',
  ' col=mix(col,hot*(1.6+uNight),uErupt*0.25*smoothstep(0.3,0.7,h2(floor(lp*0.004+uT*0.02)).x));',   // whole patches churned to bright lava
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
['uT','uNight'].forEach(k=>MAT_LAVA.uniforms[k]=LAVAU[k]);MAT_LAVA.uniforms.uErupt=ERUPTU;MAT_LAVA.uniforms.fogColor.value=scene.fog.color;MAT_LAVA.uniforms.fogDensity.value=scene.fog.density;
// the surface: a polar grid out to the outline (and a little under the shore), fine enough for the swells (~5 m)
(function(){const NR=110,NS=420,pos=[],idx=[];pos.push(LAKE.x,LAKE.level,LAKE.z);
 for(let i=1;i<=NR;i++){const t=i/NR;for(let j=0;j<NS;j++){const a=j/NS*TAU,r=LAKE.rAt(a)*1.05*t;pos.push(LAKE.x+Math.cos(a)*r,LAKE.level,LAKE.z+Math.sin(a)*r);}}
 for(let j=0;j<NS;j++)idx.push(0,1+(j+1)%NS,1+j);
 for(let i=1;i<NR;i++){const a=1+(i-1)*NS,b=1+i*NS;for(let j=0;j<NS;j++){const j1=(j+1)%NS;idx.push(a+j,a+j1,b+j,a+j1,b+j1,b+j);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeBoundingSphere();g.boundingSphere.radius+=20;
 const m=new THREE.Mesh(g,MAT_LAVA);m.userData.inspectLabel=LAKE.name;m.userData.lava=true;scene.add(m);SUMMIT.lakeMesh=m;})();
TICKS.push(dt=>{LAVAU.uT.value+=dt;});
// its glow on the caldera (and, at night, on everything round it); far brighter in an eruption, flickering with the fountains
const GLOW=new THREE.PointLight(0xff6a2a,.5,6000,1.2);GLOW.position.set(LAKE.x,LAKE.level+180,LAKE.z);scene.add(GLOW);
TICKS.push((dt,t)=>{const e=ERUPT.k;GLOW.intensity=((LAVAU.uNight.value?3.2:.45)+e*(LAVAU.uNight.value?6:2.5))*(.9+.1*Math.sin(t*1.7)+.05*Math.sin(t*5.3)+e*.25*Math.sin(t*11.3)*Math.sin(t*3.1));});

// THE HEAT over the lake (83): sheets at 3 to 45 m over its surface, inside its lobed outline, the shimmer strongest over
// the middle and low down; an eruption doubles it
const HEATMATS=[];
(function(){for(const hh of [3,9,18,30,45]){const NA=72,NR=6,pos=[LAKE.x,LAKE.level+hh,LAKE.z],K=[1-hh/55],idx=[];
 for(let r=1;r<=NR;r++){const t=r/NR;for(let k=0;k<NA;k++){const a=k/NA*TAU,R=LAKE.rAt(a)*t*1.02;pos.push(LAKE.x+Math.cos(a)*R,LAKE.level+hh,LAKE.z+Math.sin(a)*R);K.push((r===NR?0:1-t*t*.6)*(1-hh/55));}}
 for(let k=0;k<NA;k++)idx.push(0,1+(k+1)%NA,1+k);
 for(let r=1;r<NR;r++){const A=1+(r-1)*NA,B=1+r*NA;for(let k=0;k<NA;k++){const k1=(k+1)%NA;idx.push(A+k,A+k1,B+k,A+k1,B+k1,B+k);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aK',new THREE.Float32BufferAttribute(K,1));g.setIndex(idx);HEATMATS.push(HEAT.sheet(g,14,.004).material);}})();   // (it is seen from the rim, ~600 m off: it fades slowly with distance)
TICKS.push(()=>{const k=1+ERUPT.k;HEATMATS.forEach(m=>m.uniforms.uAmp.value=14*k);});

// ---------------------------------------------------------------- the plume
// A column of billows: each rises up its own slot of the column on the clock, swelling as it goes; the column leans away on
// the high wind (quadratic with height). Each billow is LIT: a sphere's normal from its point coordinate, shaded by the sun
// (in view space), its edge broken by a noise (each billow its own turn of it), so the column has volume. Steam-grey with
// ash in it, its foot lit orange by the lava. In an eruption it rises twice as fast, swells, and darkens with ash.
const PNOISE=BIO.canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=fbm(x/18,y/18,8711,4);d[i]=d[i+1]=d[i+2]=v*255;d[i+3]=255;}g.putImageData(id,0,0);});
PNOISE.wrapS=PNOISE.wrapT=THREE.RepeatWrapping;PNOISE.encoding=THREE.LinearEncoding;
const PLUMEU={uT:{value:0},uScale:{value:innerHeight*.5},uNight:{value:0},uSunV:{value:new THREE.Vector3(0,1,0)}};
const MAT_PLUME=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,PLUMEU,{uLean:{value:new THREE.Vector2(...PLUME.lean)},uErupt:{value:0},uNoise:{value:PNOISE}}]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec4 aS;uniform float uT,uScale,uErupt;uniform vec2 uLean;varying float vA,vH,vS,vRot;',
  'void main(){float ph=fract(uT*aS.y*(1.0+uErupt)+aS.x),hh=ph*9000.0*(1.0+0.25*uErupt),r=(170.0+hh*0.3)*aS.z*(1.0+0.6*uErupt);vH=ph;vS=aS.w;vRot=aS.x*37.0;',
  ' float a=aS.x*40.0+uT*0.05;vec3 p=position+vec3(cos(a)*r,hh,sin(a)*r)+vec3(uLean.x,0.0,uLean.y)*hh*hh/4500.0;',
  ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=min(uScale*(280.0+hh*0.32)*(0.8+0.4*aS.w)*(1.0+0.5*uErupt)/max(1.0,-mvPosition.z),1400.0);',
  ' vA=smoothstep(0.0,0.04,ph)*(1.0-smoothstep(0.7,1.0,ph))*(0.55+0.3*uErupt);','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uNight,uErupt;uniform vec3 uSunV;uniform sampler2D uNoise;varying float vA,vH,vS,vRot;',
  'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);',
  // its edge broken by noise (turned per billow), so no billow is a disc
  ' float cs=cos(vRot),sn=sin(vRot);vec2 qr=mat2(cs,-sn,sn,cs)*q;float nz=texture2D(uNoise,qr*0.9+vec2(vS,vRot*0.1)).r;',
  ' float edge=0.5-0.16*nz;if(r>edge)discard;',
  // lit as a sphere: its normal in view space (y up the screen), against the sun's direction in view space
  ' vec3 N=normalize(vec3(q.x*2.0,-q.y*2.0,sqrt(max(0.0,1.0-4.0*r*r))));float lit=0.5+0.5*dot(N,uSunV);',
  ' vec3 day=mix(vec3(0.86,0.85,0.84),vec3(0.45,0.42,0.39),vS*0.7);day=mix(day,vec3(0.30,0.27,0.25),uErupt*0.7);',
  ' day*=0.45+0.7*lit*(0.85+0.3*nz);vec3 night=vec3(0.10,0.10,0.12);',
  ' vec3 glow=vec3(1.0,0.34,0.08)*(1.0-smoothstep(0.0,0.18+0.12*uErupt,vH))*(0.1+uNight*(1.3+0.5*uErupt)+uErupt*0.25);',
  ' vec3 col=mix(day,night,uNight)+glow*smoothstep(0.5,-0.1,q.y);col=min(col,vec3(1.2,0.75,0.5));',   // lit from below
  ' gl_FragColor=vec4(col,vA*smoothstep(edge,edge*0.35,r));','#include <fog_fragment>','}'].join('\n')});
['uT','uScale','uNight','uSunV'].forEach(k=>MAT_PLUME.uniforms[k]=PLUMEU[k]);MAT_PLUME.uniforms.uErupt=ERUPTU;MAT_PLUME.uniforms.fogColor.value=scene.fog.color;MAT_PLUME.uniforms.fogDensity.value=scene.fog.density;
(function(){reseed(8701);const P=[],A=[],N=2200;for(let i=0;i<N;i++){P.push(PLUME.x+rr(-LAKE.r*.4,LAKE.r*.4),PLUME.base,PLUME.z+rr(-LAKE.r*.4,LAKE.r*.4));A.push(i/N+rr(0,.002),rr(.008,.014),rr(.3,1),rng());}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));
 const pts=new THREE.Points(g,MAT_PLUME);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=3;scene.add(pts);SUMMIT.plume=N;})();
const _sv=new THREE.Vector3();
TICKS.push(dt=>{PLUMEU.uT.value+=dt;PLUMEU.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));
 _sv.copy(sun.position).normalize().transformDirection(camera.matrixWorldInverse);PLUMEU.uSunV.value.copy(_sv);});
REGISTER({name:PLUME.name,x:PLUME.x,z:PLUME.z,y:LAKE.level,r:LAKE.r*1.2,h:60,plume:true});

// ---------------------------------------------------------------- the eruption: fountains and bombs
// LAVA FOUNTAINS out of the lake (a few vents, each a spray of glowing clots thrown up 100-400 m and falling back), and BOMBS
// (fewer, bigger, thrown far: out over the floor and against the wall), all ballistic in the vertex shader on the clock
// (p0 + v t + g t^2 / 2: Godot's GPUParticles3D does the same), cooling from yellow to dark red as they fall; nothing drawn
// while E.k is 0. Additive, so they glow over everything at night.
const FOUNTU={uT:{value:0},uScale:{value:innerHeight*.5}};
const MAT_FOUNT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,uniforms:{uT:FOUNTU.uT,uScale:FOUNTU.uScale,uErupt:ERUPTU},
 vertexShader:['attribute vec4 aV;attribute vec4 aS;uniform float uT,uScale,uErupt;varying float vA,vC,vK;',
  // aV.xyz the launch velocity, aV.w its flight time; aS: phase, size, vent spread, whether it is a bomb
  'void main(){float tt=fract(uT/aV.w+aS.x)*aV.w;vec3 p=position+aV.xyz*tt+vec3(0.0,-4.9,0.0)*tt*tt;',
  ' vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;float life=tt/aV.w;vC=life;vK=aS.z;',
  ' gl_PointSize=clamp(uScale*aS.y*(1.0-0.5*life)/max(1.0,-mv.z),0.0,64.0);',
  ' vA=step(fract(aS.x*13.7),uErupt)*smoothstep(0.0,0.03,life)*(1.0-smoothstep(0.85,1.0,life));}'].join('\n'),
 fragmentShader:['varying float vA,vC,vK;','void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5||vA<0.01)discard;',
  ' vec3 c=mix(vec3(1.0,0.72,0.3),vec3(1.0,0.3,0.04),smoothstep(0.0,0.4,vC));c=mix(c,vec3(0.35,0.06,0.02),smoothstep(0.5,1.0,vC));c*=0.55+0.45*vK;',
  ' gl_FragColor=vec4(c*1.25,vA*smoothstep(0.5,0.15,r));}'].join('\n')});
(function(){reseed(8721);const P=[],V=[],S=[];
 const vents=[];for(let k=0;k<4;k++){const a=rr(0,TAU),d=LAKE.r*rr(0,.5);vents.push([LAKE.x+Math.cos(a)*d,LAKE.z+Math.sin(a)*d,rr(.6,1)]);}
 // the fountains: up and back into the lake
 for(let i=0;i<5000;i++){const v=vents[i%4],up=rr(35,85)*v[2],sp=rr(0,22)*rng(),a=rr(0,TAU),t=2*up/9.8;
  P.push(v[0]+rr(-14,14),LAKE.level+1,v[1]+rr(-14,14));V.push(Math.cos(a)*sp,up,Math.sin(a)*sp,t);S.push(rng(),rr(6,14),rng(),0);}
 // the bombs: thrown out over the floor and at the wall (they land below the launch: the flight runs past the apex to the floor)
 for(let i=0;i<500;i++){const v=vents[i%4],up=rr(55,95),sp=rr(30,80),a=rr(0,TAU),t=(up+Math.sqrt(up*up+2*9.8*20))/9.8;
  P.push(v[0],LAKE.level+1,v[1]);V.push(Math.cos(a)*sp,up,Math.sin(a)*sp,t);S.push(rng(),rr(10,18),0,1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aV',new THREE.Float32BufferAttribute(V,4));g.setAttribute('aS',new THREE.Float32BufferAttribute(S,4));
 const pts=new THREE.Points(g,MAT_FOUNT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=4;pts.visible=false;scene.add(pts);SUMMIT.fountains=pts;SUMMIT.vents=vents.length;vents.forEach((v,i)=>LAKEVENTS[i].set(v[0],v[1],v[2]));})();
// the eruption's tick: the state, the uniforms, the weather (ash falling; lightning in the plume every few seconds)
let _nextBolt=0,_wPrev=null;
TICKS.push((dt,t)=>{SUMMIT.eruptStep(ERUPT,dt);ERUPTU.value=ERUPT.k;FOUNTU.uT.value+=dt;FOUNTU.uScale.value=PLUMEU.uScale.value;SUMMIT.fountains.visible=ERUPT.k>.01;
 if(typeof ATMOS!=='undefined'&&ATMOS.W){if(ERUPT.on&&ERUPT.k>.4&&ATMOS.W.mode!=='ashfall'&&_wPrev===null){_wPrev=ATMOS.W.mode;ATMOS.W.mode='ashfall';}
  if(!ERUPT.on&&ERUPT.k<.05&&_wPrev!==null){ATMOS.W.mode=_wPrev;_wPrev=null;}
  if(ERUPT.k>.6&&t>_nextBolt&&ATMOS.strike){ATMOS.strike();_nextBolt=t+rr(2.5,7);}}});
SUMMIT.erupt=on=>{ERUPT.on=on==null?!ERUPT.on:!!on;const b=document.getElementById('eruptBtn');if(b)b.textContent=ERUPT.on?'Eruption: on':'Eruption';return ERUPT.on;};
SUMMIT.E=ERUPT;

// ---------------------------------------------------------------- the penitentes, the frozen fumaroles
const SNOW_MAT=BIO.solidMat(null);
// a penitente: a blade of hard snow, wide across, thin along, its tip a knife-edge, leaning a little toward the sun's noon
// a penitente: a blade of hard snow: wide across its row, thin along it, its crest blunt and notched, its faces fluted
BIO.def('penitente',(function(){const g=new THREE.CylinderGeometry(.16,.5,1,8,4);g.translate(0,.5,0);g.scale(1,1,.3);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),w=1+.12*Math.sin(x*11+y*3),top=y>.99?-.18*Math.abs(Math.sin(x*9)):0;p.setXYZ(i,x*w+.1*y*y,y+top,z*(1+.25*Math.sin(y*7)));}
 g.computeVertexNormals();return g;})(),SNOW_MAT,{label:'Penitentes (blades of hard snow)'});
BIO.def('icetower',(function(){const g=new THREE.LatheGeometry([[2.2,0],[2.0,.1],[1.6,.3],[1.3,.5],[1.05,.7],[.8,.88],[.55,.97],[.32,1.0],[.2,1.0]].map(q=>new THREE.Vector2(q[0]/2.2,q[1])),14),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),k=1+.22*Math.sin(a*3+y*7)+.12*Math.sin(a*5-y*13);p.setXYZ(i,x*k,y,z*k);}g.computeVertexNormals();return g;})(),SNOW_MAT,{label:'Frozen fumaroles (ice towers)'});
(function(){reseed(8702);const L=BIO.LOD(),yaw=Math.atan2(-SUN_POS[2],SUN_POS[0])*0;
 // the penitentes: dense near the cameras, thinning out; in rows (the sun carves them in lines east-west)
 // in rows: a band every ~1.4 m (north-south), blades every ~0.9 m along it; the rows wander a little
 BIO.grid(5,0,TERR.R-150,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>L.floor[0]*.75)return 0;return smooth(.3,.7,FIELD.pen(x,z))*(ld<90?1:.3);},   // near the cameras only (half a million blades was 28M triangles)
  (x0,y0,z0)=>{const pk=FIELD.pen(x0,z0);for(let r=0;r<4;r++){const zr=z0-2.1+r*1.4+.25*Math.sin(x0*.07+r);for(let c=0;c<6;c++){if(rng()<.15)continue;const x=x0-2.5+c*.9+rr(-.2,.2),z=zr+rr(-.15,.15),y=terrainH(x,z);
    const h=rr(.7,2.2)*(.6+.6*pk),w=rr(.9,1.25);BIO.put('penitente',[x,y-.12,z],qEuler(rr(-.05,.05),rr(-.1,.1),-.18+rr(-.06,.06)),[w,h,w],C3(0xf0f4f8).multiplyScalar(rr(.9,1.02)));SUMMIT.penitentes++;}}},
  {patch:.35,patchScale:.02,pad:0,noMask:true});
 // the frozen fumaroles: towers of ice round each fumarole on the crest's outer side
 FUMS.filter(F=>F.rim).forEach(F=>{for(let k=0,n=ri(1,3);k<n;k++){const a=rr(0,TAU),d=k?rr(3,10):0,x=F.x+Math.cos(a)*d,z=F.z+Math.sin(a)*d,h=rr(3,10)*(k?.7:1),r=rr(1.4,2.8);
  BIO.put('icetower',[x,terrainH(x,z)-.4,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[r,h,r],C3(0xe4eef6).multiplyScalar(rr(.95,1.03)));SUMMIT.towers++;}});
 // the cones' scoria: blocks of spatter strewn on their flanks (the kit's stones, in its registry)
 {const prev=BIO.kit('throne'),cur=BIO.cur;BIO.cur='throne/floor';CONES.forEach(C=>{for(let k=0;k<26;k++){const a=rr(0,TAU),d=C.r*Math.sqrt(rng())*.9,x=C.x+Math.cos(a)*d,z=C.z+Math.sin(a)*d,s=rr(.4,1.6);
   BIO.put('boulder',[x,terrainH(x,z)+s*.3,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[s,s*rr(.6,.9),s],C3(pick([0x5a2a22,0x3a2a26,0x6a3424])));}});BIO.cur=cur;BIO.kit(prev);}
 _mark('layout');})();

// ---------------------------------------------------------------- the steam
const STEAMU={uT:{value:0},uScale:{value:innerHeight*.5},uCol:{value:new THREE.Color(0xf2f4f6)}};
const STEAM_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,STEAMU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec4 aS;uniform float uT,uScale;varying float vA;',
  'void main(){float ph=fract(uT*aS.y+aS.x);vec3 p=position+vec3(sin(ph*6.0+aS.x*9.0)*aS.z*0.4+ph*aS.z*2.5,ph*aS.w,cos(ph*5.0+aS.x*7.0)*aS.z*0.4+ph*aS.z*1.2);',
  ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.6+ph*2.2)/max(1.0,-mvPosition.z);',
  ' vA=smoothstep(0.0,0.12,ph)*(1.0-ph)*0.5;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform vec3 uCol;varying float vA;',
  'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5)discard;gl_FragColor=vec4(uCol,vA*smoothstep(0.5,0.1,r));','#include <fog_fragment>','}'].join('\n')});
STEAM_MAT.uniforms.fogColor.value=scene.fog.color;STEAM_MAT.uniforms.fogDensity.value=scene.fog.density;
['uT','uScale','uCol'].forEach(k=>STEAM_MAT.uniforms[k]=STEAMU[k]);
(function(){reseed(8703);const P=[],A=[];
 const add=(x,z,y,n,size,rise,rate)=>{for(let i=0;i<n;i++){P.push(x+rr(-1.2,1.2),y,z+rr(-1.2,1.2));A.push(rng(),rate*rr(.8,1.2),size*rr(.7,1.3),rise*rr(.7,1.3));}};
 FUMS.forEach(F=>add(F.x,F.z,terrainH(F.x,F.z)+(F.rim?6:0),Math.round(10+14*F.s),4+4*F.s,26+26*F.s,.07));
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));
 const pts=new THREE.Points(g,STEAM_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=2;scene.add(pts);})();
TICKS.push(dt=>{STEAMU.uT.value+=dt;STEAMU.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));});
_onLight.push(m=>{const n=m==='night';STEAMU.uCol.value.setHex(n?0x40444c:0xf2f4f6);LAVAU.uNight.value=n?1:0;PLUMEU.uNight.value=n?1:0;});
