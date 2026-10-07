// ================================================================= HOST — the live fire (an effect that leaves its trail)
// Light a fire anywhere (F, then click the ground; or the "A wildfire running" view): CRATERDRY.fireRun (52) spreads it
// through the fuel the burn history left, under the wind, and gives every 20 m cell an arrival time. That map is a
// half-float texture (FIREU, 84) that every patched shader reads with the fire's clock:
//   the ground (84)       a flickering flame line at the front, char spreading behind it, embers smouldering for minutes
//   foliage               below the flame height (CRATERDRY.FLAME_H) it glows, blackens and burns away; crowns above it
//                         scorch brown at the edge of the heat and survive (the long trunks' whole point)
//   trunks, stems, stones blacken below the flame height and glow while they burn
//   the air               flames along the active front, smoke columns rising and leaning downwind, a warm light
// The clock is the fire's own, seconds since ignition times a speed (x1, x10, x60): a fire that takes half an hour to run
// its course can be watched in three minutes. Nothing is rebuilt: the trail is the map and the clock, so a game can ask
// any point how it stands (FIREFX.state(x,z): unburnt, burning, smouldering, burnt). This is the prototype of the
// core/atmos fire module NOTES.md plans: the arrival map is [G data] (52), the shader text [G shader], the rest [web].
const FIREFX=(function(){
 const st={run:null,t:0,speed:10,on:false,armed:false,tex:null,acc:0,P:null};
 const FH=CRATERDRY.FLAME_H.toFixed(1);
 // ---- the arrival map as a texture (three r128's DataUtils may not have toHalfFloat: a float to half bits by hand)
 const f32=new Float32Array(1),i32=new Int32Array(f32.buffer);
 function half(v){f32[0]=v;const x=i32[0],s=(x>>>16)&0x8000;const e=((x>>>23)&0xff)-112,m=x&0x7fffff;if(e<=0)return s;if(e>=31)return s|0x7bff;return s|(e<<10)|(m>>>13);}
 function texOf(r){const N=r.N,d=new Uint16Array(N*N*4);
  for(let k=0;k<N*N;k++){const a=r.arrive[k];d[k*4]=half(a<Infinity?a:60000);d[k*4+1]=half(r.H[k]);d[k*4+3]=half(1);}
  const t=new THREE.DataTexture(d,N,N,THREE.RGBAFormat,THREE.HalfFloatType);t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.flipY=false;t.needsUpdate=true;return t;}

 // ---- the plants' materials: a patch over whatever hook they already carry (the foliage's, the iridescence's)
 const LEAF='{vec2 fc=fireCell(vFireWP.xz);float tt=fc.x,hA=vFireWP.y-fc.y,low=1.0-smoothstep('+FH+'-2.0,'+FH+'+2.0,hA);'+
  'if(tt>0.0&&low>0.0){float k=smoothstep(0.0,18.0,tt)*low;if(fireHash(vFireWP*2.0)<k*0.97)discard;'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.05,0.03,0.02),smoothstep(0.0,8.0,tt)*low);}'+
  // above the flames the heat still browns the lower crown: the crisp edge of a survivor
  'if(tt>0.0){float sc=smoothstep(0.0,40.0,tt)*(1.0-low)*(1.0-smoothstep('+FH+'*1.4,'+FH+'*1.9,hA));diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.8,0.5,0.22),sc*0.85);}}';
 const WOOD='{vec2 fc=fireCell(vFireWP.xz);float tt=fc.x,hA=vFireWP.y-fc.y,low=1.0-smoothstep('+FH+'*1.3-2.0,'+FH+'*1.3+2.0,hA);'+
  'if(tt>0.0)diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*0.1+vec3(0.01),smoothstep(0.0,14.0,tt)*low);}';
 const GLOW=k=>'{vec2 fc=fireCell(vFireWP.xz);float tt=fc.x,hA=vFireWP.y-fc.y,low=1.0-smoothstep('+FH+(k==='leaf'?'':'*1.3')+'-2.0,'+FH+(k==='leaf'?'':'*1.3')+'+2.0,hA);'+
  'float fl=0.6+0.4*sin(uFireRT*12.0+vFireWP.x*1.3+vFireWP.y*0.7)*sin(uFireRT*8.0+vFireWP.z*1.1);'+
  'float g='+(k==='leaf'?'smoothstep(-3.0,0.0,tt)*(1.0-smoothstep(4.0,18.0,tt))*1.5':'smoothstep(0.0,2.0,tt)*(1.0-smoothstep(10.0,80.0,tt))*0.9*smoothstep(0.55,0.9,0.5+0.5*sin(vFireWP.y*3.1+2.0*sin(vFireWP.x*2.3+vFireWP.z*1.7)))')+';'+
  'gl_FragColor.rgb+=vec3(1.0,0.42,0.08)*g*fl*low;}';
 const PATCHED=new Set();
 function patch(m){if(!m||PATCHED.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial)||m===MAT_GROUND)return;PATCHED.add(m);
  const kind=m.userData&&m.userData.bio&&m.userData.bio.kind==='leaf'?'leaf':'wood';
  const prev=m.onBeforeCompile,pk=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):null;
  m.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);Object.assign(sh.uniforms,FIREU);
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vFireWP;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvFireWP=(modelMatrix*instanceMatrix*vec4(transformed,1.0)).xyz;\n#else\nvFireWP=(modelMatrix*vec4(transformed,1.0)).xyz;\n#endif');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vFireWP;'+FIRE_GLSL)
    .replace('#include <color_fragment>','#include <color_fragment>\n'+(kind==='leaf'?LEAF:WOOD))
    .replace('#include <dithering_fragment>','#include <dithering_fragment>\n'+GLOW(kind));};
  m.customProgramCacheKey=()=>(pk?pk():'')+'|fire|'+kind;m.needsUpdate=true;}
 scene.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh)||o===GROUND)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(patch);});

 // ---- flames and smoke: camera-facing quads, one instanced draw each, refilled four times a second from the cells
 // that caught in the last half-minute (flames) or the last seven minutes (smoke). A cell is drawn when its hash is under
 // the pool's share, so the same cells stay chosen as the window slides and nothing jumps.
 function pool(n,frag,blend,vert){const g=new THREE.InstancedBufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([-.5,0,0,.5,0,0,.5,1,0,-.5,1,0],3));g.setIndex([0,1,2,0,2,3]);
  const P=new THREE.InstancedBufferAttribute(new Float32Array(n*4),4),Q=new THREE.InstancedBufferAttribute(new Float32Array(n*4),4);
  P.setUsage(THREE.DynamicDrawUsage);Q.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aP',P);g.setAttribute('aQ',Q);g.instanceCount=0;
  const m=new THREE.ShaderMaterial({uniforms:{uT:FIREU.uFireT,uRT:FIREU.uFireRT,uWind:{value:new THREE.Vector3(FIRE_WIND[0],0,FIRE_WIND[1])},
    fogColor:{value:scene.fog.color},fogDensity:{value:scene.fog.density}},
   vertexShader:'attribute vec4 aP,aQ;uniform float uT,uRT;uniform vec3 uWind;varying vec2 vUv;varying float vA,vF,vT;varying float vFogDepth;\nvoid main(){vUv=position.xy;vT=0.0;'+vert+
    'vec4 mv=viewMatrix*vec4(wp,1.0);vFogDepth=-mv.z;gl_Position=projectionMatrix*mv;}',
   fragmentShader:'uniform vec3 fogColor;uniform float fogDensity;varying vec2 vUv;varying float vA,vF,vT;varying float vFogDepth;\nvoid main(){'+frag+
    'float fd=1.0-exp(-fogDensity*fogDensity*vFogDepth*vFogDepth);'+(blend===THREE.AdditiveBlending?'c*=1.0-fd*0.85;':'c=mix(c,fogColor,fd);')+'gl_FragColor=vec4(c,a);}',
   transparent:true,depthWrite:false,blending:blend});
  const M=new THREE.Mesh(g,m);M.frustumCulled=false;M.renderOrder=blend===THREE.AdditiveBlending?3:2;M.userData.probeSkip=true;scene.add(M);M.n=n;return M;}
 // a flame: a tongue standing on its cell, swelling as the front arrives, flickering, leaning downwind at its tip, dying
 // over half a minute; its size from the fuel (old scrub burns tallest)
 const FLAMES=pool(900,
  'float x=abs(vUv.x+0.12*sin(vUv.y*7.0+vT)*vUv.y)*2.0,y=vUv.y;float w=(1.0-pow(y,1.5))*(0.8+0.18*sin(y*11.0-vT*1.7));'+
  'float a=smoothstep(w,w*0.45,x)*smoothstep(0.0,0.06,y)*vA;float core=smoothstep(w*0.65,0.0,x)*(1.0-y*0.9);'+
  'vec3 c=mix(vec3(0.95,0.2,0.03),vec3(1.0,0.88,0.45),core)*(1.25+0.35*vF);',THREE.AdditiveBlending,
  'float age=uT-aP.w,grow=smoothstep(-2.0,2.0,age),life=1.0-smoothstep(5.0,20.0,age),fl=0.7+0.3*sin(uRT*13.0+aQ.y*40.0)*sin(uRT*7.0+aQ.y*17.0);vT=uRT*6.0+aQ.y*31.0;'+
  'float h=aQ.x*aQ.w*grow*life*fl,w=aQ.x*0.7*grow*life;vA=grow*life;vF=fl;'+
  'vec3 R=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);vec3 wp=aP.xyz+R*position.x*w+vec3(0.0,position.y*h,0.0)+uWind*position.y*position.y*h*0.45;');
 // smoke: puffs rising off every burning and smouldering cell, growing and thinning as they climb, carried downwind; dense
 // air keeps the column low and lets it spread. The puffs run on real time, the column's life on the fire's clock.
 const SMOKE=pool(700,
  'vec2 d=vUv*vec2(2.0,2.0)-vec2(0.0,1.0);float a=smoothstep(1.0,0.2,length(d))*vA;vec3 c=mix(vec3(0.17,0.155,0.14),vec3(0.55,0.53,0.5),vF);',THREE.NormalBlending,
  'float age=uT-aP.w,P=13.0+aQ.y*9.0,ph=fract(uRT/P+aQ.y*7.31),act=smoothstep(0.0,12.0,age)*(1.0-smoothstep(120.0,420.0,age));'+
  'float hh=ph*(30.0+aQ.w*45.0),s=aQ.x*(0.6+2.6*ph);vA=act*smoothstep(0.0,0.1,ph)*(1.0-ph)*0.85;vF=ph;'+
  'vec3 R=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),U=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);'+
  'vec3 wp=aP.xyz+vec3(0.0,hh,0.0)+uWind*hh*1.4+R*position.x*s+U*(position.y-0.5)*s;');
 // the fire's light: one warm point light on the active front's centre (made now, at zero, so no shader recompiles)
 const LIGHT=new THREE.PointLight(0xff7a2a,0,700,1.2);scene.add(LIGHT);
 const hsh=k=>{const v=Math.sin(k*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 function fill(M,a,b,kind){const r=st.run,cnt=b-a,P=M.geometry.attributes.aP.array,Q=M.geometry.attributes.aQ.array,share=M.n/Math.max(1,cnt);let m=0,sx=0,sz=0;
  const per=kind?1:3;
  for(let q=a;q<b&&m<M.n;q++){const k0=r.order[q];if(hsh(k0*(kind?3:1))>=share/per)continue;
   for(let u=0;u<per&&m<M.n;u++){const k=k0,hu=u*101;
   const i=k%r.N,j=(k-i)/r.N,x=r.x0+(i+hsh(k+7+hu)-.5)*r.cs,z=r.z0+(j+hsh(k+13+hu)-.5)*r.cs,y=terrainH(x,z),fu=CRATERDRY.fuelK(CRATERDRY.FIRE.last[k])*CRATERDRY.FIRE.base[k];
   if(!kind&&fu<.08)continue;
   P[m*4]=x;P[m*4+1]=y-.2;P[m*4+2]=z;P[m*4+3]=r.arrive[k];
   if(kind===0){Q[m*4]=1.8+2.6*fu*(.7+.6*hsh(k+hu+9));Q[m*4+1]=hsh(k+3+hu);Q[m*4+3]=1.6+1.1*hsh(k+5+hu);sx+=x;sz+=z;}else{Q[m*4]=10+14*hsh(k+11);Q[m*4+1]=hsh(k+17);Q[m*4+3]=hsh(k+19);}
   m++;}}
  M.geometry.instanceCount=m;M.geometry.attributes.aP.needsUpdate=true;M.geometry.attributes.aQ.needsUpdate=true;return{m,cx:m?sx/m:0,cz:m?sz/m:0};}
 function refresh(){if(!st.on||!st.run)return;const r=st.run,t=st.t;
  const f=fill(FLAMES,...r.range(t-22,t+3),0);fill(SMOKE,...r.range(t-420,t),1);
  if(f.m){LIGHT.position.set(f.cx,terrainH(f.cx,f.cz)+18,f.cz);LIGHT.intensity=Math.min(2.2,.25+f.m/160);}else LIGHT.intensity=0;
  st.active=f.m;}
 function light(x,z,o){o=o||{};const r=CRATERDRY.fireRun({x,z,wind:FIRE_WIND,maxT:2400});if(!r.ok)return r;
  if(st.tex)st.tex.dispose();st.tex=texOf(r);st.run=r;st.t=o.t||0;st.on=true;if(o.speed)st.speed=o.speed;
  FIREU.uFireTex.value=st.tex;FIREU.uFireGrid.value.set(r.x0,r.z0,r.cs,r.N);FIREU.uFireOn.value=1;FIREU.uFireT.value=st.t;refresh();status();return r;}
 function out(){st.on=false;st.run=null;FIREU.uFireOn.value=0;FLAMES.geometry.instanceCount=0;SMOKE.geometry.instanceCount=0;LIGHT.intensity=0;status();}
 TICKS.push((dt,now)=>{FIREU.uFireRT.value=now;if(!st.on)return;st.t+=dt*st.speed;FIREU.uFireT.value=st.t;st.acc+=dt;if(st.acc>.25){st.acc=0;refresh();status();}});

 // ---- where the preset fire is lit: upwind of the spine's points, on old fuel, the one that runs the farthest
 st.P=(function(){let best=null;
  for(const o of BIO.host.origin){const x=o[0]-FIRE_WIND[0]*220,z=o[1]-FIRE_WIND[1]*220;if(Math.hypot(x,z)>TERR.R*.8||CRATERDRY.ageAt(x,z)<7)continue;
   const r=CRATERDRY.fireRun({x,z,wind:FIRE_WIND,maxT:420});if(r.ok&&(!best||r.order.length>best.n))best={x:r.x,z:r.z,n:r.order.length};}
  return best||{x:0,z:0,n:0};})();
 const PRESET_T=260;
 function presetView(){const r=CRATERDRY.fireRun({x:st.P.x,z:st.P.z,wind:FIRE_WIND,maxT:PRESET_T+5});if(!r.ok)return[st.P.x+200,terrainH(st.P.x+200,st.P.z)+40,st.P.z,st.P.x,terrainH(st.P.x,st.P.z),st.P.z];
  // the HEAD of the fire (the burning cell farthest downwind), framed from the side and a little behind it: the flames in
 // the middle ground, the char and the smoke behind them, the unburnt scrub ahead
 const[a,b]=r.range(PRESET_T-12,PRESET_T);let cx=r.x,cz=r.z,best=-1e9;
 for(let q=a;q<b;q++){const k=r.order[q],i=k%r.N,j=(k-i)/r.N,x=r.x0+i*r.cs,z=r.z0+j*r.cs,d=x*FIRE_WIND[0]+z*FIRE_WIND[1];if(d>best){best=d;cx=x;cz=z;}}
 const px=-FIRE_WIND[1],pz=FIRE_WIND[0],ex=cx+px*170-FIRE_WIND[0]*70,ez=cz+pz*170-FIRE_WIND[1]*70;
 return[ex,terrainH(ex,ez)+26,ez,cx-FIRE_WIND[0]*20,terrainH(cx,cz)+5,cz-FIRE_WIND[1]*20];}

 // ---- the controls: a row of buttons, F to arm a click-to-light, the status
 const bar=document.createElement('div');bar.id='firebar';bar.style.cssText='display:flex;gap:4px;align-items:center;flex-wrap:wrap';
 const btn=(t,f,ti)=>{const b=document.createElement('button');b.textContent=t;b.title=ti||'';b.onclick=f;bar.appendChild(b);return b;};
 const bArm=btn('Light a fire (F)',()=>arm(!st.armed),'then click the ground');
 btn('×1',()=>{st.speed=1;status();},'real time');btn('×10',()=>{st.speed=10;status();});btn('×60',()=>{st.speed=60;status();});
 btn('Put it out',out);
 const lab=document.createElement('span');lab.style.cssText='font:12px ui-monospace,monospace;color:#f0dcc4;background:rgba(0,0,0,.45);padding:3px 7px;border-radius:4px';bar.appendChild(lab);
 document.getElementById('ui').appendChild(bar);
 function arm(on){st.armed=on;bArm.style.outline=on?'2px solid #ff8a30':'';renderer.domElement.style.cursor=on?'crosshair':'';status();}
 function status(){lab.textContent=st.armed?'click the ground to light a fire':!st.on?'no fire':'fire '+(st.t/60).toFixed(1)+' min · ×'+st.speed+' · '+(st.active||0)+' flames';}
 addEventListener('keydown',e=>{if(e.key==='f'||e.key==='F')arm(!st.armed);});
 const ray=new THREE.Raycaster();
 function click(cx,cy){ray.setFromCamera(new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1),camera);const h=ray.intersectObject(GROUND,false)[0];arm(false);
  if(!h)return null;const r=light(h.point.x,h.point.z,{t:0});if(!r.ok){lab.textContent='nothing burns there: '+r.why;}return r;}
 status();
 return{light,out,click,presetView,preset:()=>light(st.P.x,st.P.z,{t:PRESET_T,speed:10}),armed:()=>st.armed,
  state:(x,z)=>!st.on||!st.run?'unburnt':st.run.state(x,z,st.t),get t(){return st.t;},set t(v){st.t=v;FIREU.uFireT.value=v;refresh();},
  get speed(){return st.speed;},set speed(v){st.speed=v;},get run(){return st.run;},P:st.P,patched:()=>PATCHED.size,pools:{FLAMES,SMOKE},refresh};})();
