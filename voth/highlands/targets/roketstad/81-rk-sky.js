// ================================================================= KratorSky — the Krator skybox module (from claude/krator-sky.html, verbatim logic)
// Canon (krator-notes): tidally-locked moon of a Neptune–Saturn-class giant, 24 h day, ~40° S, giant fixed at
// altitude 25° azimuth 66° (NE, over Korona), obliquity ~23°, eclipse seasons round each equinox.
// Coordinates: x = east, y = up, z = south (north is −z). Azimuth clockwise from north.
// A target that wants it calls KratorSky.attach(scene,R) once and KratorSky.update(camPos,hour,day,dens) per frame,
// then applies KratorSky.lighting() to its sun / hemi / fog. A target that does not call attach pays nothing.
const KratorSky=(function(){
 const D=Math.PI/180;const LAT=-40*D,OBL=23*D,YEAR=360;
 const GIANT_ALT=25*D,GIANT_AZ=66*D,GIANT_ANG=14*D;
 const giantDir=new THREE.Vector3(Math.sin(GIANT_AZ)*Math.cos(GIANT_ALT),Math.sin(GIANT_ALT),-Math.cos(GIANT_AZ)*Math.cos(GIANT_ALT));
 function sunDir(hour,day){const dec=OBL*Math.sin(2*Math.PI*(day-80)/YEAR);const H=(hour-12)*15*D;
  const e=-Math.cos(dec)*Math.sin(H),n=Math.sin(dec)*Math.cos(LAT)-Math.cos(dec)*Math.sin(LAT)*Math.cos(H),u=Math.sin(dec)*Math.sin(LAT)+Math.cos(dec)*Math.cos(LAT)*Math.cos(H);
  return new THREE.Vector3(e,u,-n).normalize();}
 function altAz(v){return{alt:Math.asin(v.y)/D,az:((Math.atan2(v.x,-v.z)/D)+360)%360};}
 const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{sun:{value:new THREE.Vector3(0,1,0)},giant:{value:giantDir.clone()},dens:{value:1.6},ecl:{value:0},night:{value:0}},
  vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec3 vP;uniform vec3 sun,giant;uniform float dens,ecl,night;
  void main(){vec3 d=normalize(vP);float h=clamp(d.y,-0.1,1.0);float sh=sun.y;
   float dayF=smoothstep(-0.12,0.18,sh);float dusk=exp(-pow((sh-0.02)/0.16,2.0));
   float thick=clamp(dens/1.6,0.3,1.6);
   vec3 zenDay=mix(vec3(0.20,0.36,0.62),vec3(0.36,0.46,0.66),clamp((thick-0.7)*1.2,0.,1.));
   vec3 horDay=mix(vec3(0.78,0.84,0.90),vec3(0.86,0.70,0.52),clamp(thick-0.5,0.,1.));
   vec3 zenNight=vec3(0.015,0.02,0.045);vec3 horNight=vec3(0.06,0.05,0.09)*thick;
   float hp=pow(1.0-h,2.2+1.2*thick);
   vec3 day=mix(zenDay,horDay,hp);vec3 nite=mix(zenNight,horNight,hp);
   vec3 c=mix(nite,day,dayF);
   float sd=max(dot(d,normalize(sun)),0.0);
   vec3 duskCol=vec3(1.0,0.45,0.18);c+=duskCol*dusk*pow(sd,3.0)*(0.55+0.5*hp)*(1.0-0.6*ecl);
   c+=vec3(1.0,0.9,0.75)*pow(sd,64.0)*dayF*0.9*(1.0-ecl);c+=vec3(1.0,0.85,0.6)*pow(sd,8.0)*dayF*0.18*thick;
   float gd=max(dot(d,giant),0.0);c+=vec3(0.55,0.5,0.7)*pow(gd,10.0)*(1.0-dayF)*0.12;
   c*=1.0-0.75*ecl*smoothstep(-0.05,0.3,h);
   c=mix(c,c*0.6+vec3(0.12,0.08,0.06)*thick,(1.0-dayF)*0.4*(1.0-h));
   gl_FragColor=vec4(c,1.0);}`});
 const giantTex=(function(){const c=document.createElement('canvas');c.width=64;c.height=512;const g=c.getContext('2d');
  const bands=[[0.00,'#7d8fb0'],[0.08,'#9aa8c4'],[0.15,'#c7c2b6'],[0.22,'#8a98b8'],[0.30,'#dcd4c2'],[0.36,'#7e8db0'],[0.45,'#b9b2a6'],[0.52,'#6f80a6'],[0.60,'#d8cfbb'],[0.68,'#8896b6'],[0.76,'#c4bdb0'],[0.84,'#7688aa'],[0.92,'#a9b0c2'],[1.0,'#6f80a2']];
  const grd=g.createLinearGradient(0,0,0,512);bands.forEach(b=>grd.addColorStop(b[0],b[1]));g.fillStyle=grd;g.fillRect(0,0,64,512);
  for(let i=0;i<200;i++){g.fillStyle='rgba(255,255,255,'+(h3(i,1,2)*.08)+')';g.fillRect(h3(i,2,3)*64,h3(i,3,4)*512,h3(i,4,5)*30+4,h3(i,5,6)*3+1);}
  g.fillStyle='rgba(230,225,215,.35)';g.beginPath();g.ellipse(40,300,9,4,0,0,6.28);g.fill();
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
 const giantMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,
  uniforms:{map:{value:giantTex},L:{value:new THREE.Vector3(0,0,1)},haze:{value:0.3},ring:{value:1},tilt:{value:0.35},t:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform sampler2D map;uniform vec3 L;uniform float haze,ring,tilt,t;
  void main(){vec2 p=(vUv-0.5)*2.0;
   float R=0.42;vec2 q=p/R;float r2=dot(q,q);vec3 col=vec3(0.);float a=0.;
   float cs=cos(tilt),sn=sin(tilt);vec2 rp=vec2(q.x,q.y/max(sn,0.08));float rr=length(rp);
   float inRing=ring*smoothstep(1.35,1.4,rr)*(1.0-smoothstep(2.1,2.2,rr))*(0.55+0.45*sin(rr*40.0));
   float behind=step(0.0,q.y)*step(rr,1.0);
   if(r2<1.0){vec3 n=vec3(q.x,q.y,sqrt(max(0.0,1.0-r2)));
    float lat=asin(clamp(n.y,-1.,1.));float lon=atan(n.x,n.z);
    vec3 base=texture2D(map,vec2(lon/6.2832+t*0.02,lat/3.1416+0.5)).rgb;
    float lit=clamp(dot(n,normalize(L)),-1.0,1.0);float day=smoothstep(-0.08,0.25,lit);
    float limb=pow(max(0.0,n.z),0.45);
    col=base*(0.05+0.95*day)*limb+vec3(0.35,0.3,0.4)*0.05*(1.0-day);
    a=1.0;}
   else{a=0.0;}
   vec3 ringCol=vec3(0.85,0.82,0.78);float ringA=inRing*(1.0-behind)*(r2<1.0?0.0:1.0);
   float ringLit=clamp(dot(vec3(0.,1.,0.),normalize(L))*0.5+0.6,0.15,1.0);
   col=mix(col,ringCol*ringLit,ringA*0.7);a=max(a,ringA*0.7);
   float front=step(q.y,0.0)*step(r2,1.0)*inRing;col=mix(col,ringCol*ringLit,front*0.6);
   a*=1.0-haze;
   gl_FragColor=vec4(col,a);}`});
 const giant=new THREE.Mesh(new THREE.PlaneGeometry(1,1),giantMat);
 const sunTex=(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,250,235,1)');gr.addColorStop(0.18,'rgba(255,240,200,1)');gr.addColorStop(0.3,'rgba(255,200,120,0.35)');gr.addColorStop(1,'rgba(255,160,80,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
 const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:sunTex,fog:false,depthWrite:false,transparent:true,blending:THREE.AdditiveBlending}));
 const starGeo=new THREE.BufferGeometry();{const p=[],c=[];for(let i=0;i<2600;i++){const u=h3(i,7,1)*2-1,th=h3(i,8,2)*6.2832;const r=Math.sqrt(1-u*u);p.push(r*Math.cos(th),u,r*Math.sin(th));const k=h3(i,9,3);c.push(0.7+0.3*k,0.75+0.2*k,0.9);}
  starGeo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));starGeo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));}
 const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({size:2.2,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:0,fog:false,depthWrite:false}));
 const moon=new THREE.Sprite(new THREE.SpriteMaterial({map:(function(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#cfc8bc';g.beginPath();g.arc(32,32,28,0,6.28);g.fill();g.fillStyle='rgba(90,80,80,.35)';for(let i=0;i<8;i++){g.beginPath();g.arc(20+h3(i,1,9)*24,20+h3(i,2,9)*24,2+h3(i,3,9)*4,0,6.28);g.fill();}return new THREE.CanvasTexture(c);})(),fog:false,depthWrite:false,transparent:true}));
 const group=new THREE.Group();const dome=new THREE.Mesh(new THREE.SphereGeometry(1,48,24),skyMat);group.add(dome,giant,sun,stars,moon);group.traverse(o=>{o.userData.probeSkip=true;});
 const state={hour:12,day:200,dens:1.6,sun:new THREE.Vector3(),eclipse:0,ring:true};
 function attach(scene,R){group.scale.setScalar(R);group.userData.R=R;scene.add(group);return group;}
 function update(camPos,hour,day,dens){state.hour=hour;state.day=day;state.dens=dens;group.position.copy(camPos);
  const s=sunDir(hour,day);state.sun.copy(s);skyMat.uniforms.sun.value.copy(s);skyMat.uniforms.dens.value=dens;
  const ang=Math.acos(Math.max(-1,Math.min(1,s.dot(giantDir))));const ecl=s.y>0?Math.max(0,1-ang/GIANT_ANG):0;const eclF=ecl>0?Math.min(1,ecl*1.6):0;state.eclipse=eclF;skyMat.uniforms.ecl.value=eclF*0.9;
  giant.position.copy(giantDir).multiplyScalar(0.96);giant.lookAt(new THREE.Vector3(0,0,0));const size=2*0.96*Math.tan(GIANT_ANG)/0.42;   // /R of the shader: the quad is sized so the rings (2.2 disc radii) fit inside itgiant.scale.set(size,size,1);
  const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),giantDir).normalize();const upB=new THREE.Vector3().crossVectors(giantDir,right).normalize();
  giantMat.uniforms.L.value.set(s.dot(right),s.dot(upB),-s.dot(giantDir));giantMat.uniforms.haze.value=0.15+0.35*Math.max(0,dens-1)*0.7;giantMat.uniforms.ring.value=state.ring?1:0;giantMat.uniforms.t.value=hour/24;
  sun.position.copy(s).multiplyScalar(0.95);const ss=0.11*(1+0.5*Math.max(0,0.15-s.y)*6);sun.scale.set(ss,ss,1);sun.material.opacity=s.y>-0.08?1-eclF*0.85:0;
  const night=1-Math.min(1,Math.max(0,(s.y+0.1)/0.28));stars.material.opacity=night*0.9;stars.rotation.set(0,0,0);stars.rotateOnAxis(new THREE.Vector3(0,Math.sin(-LAT),Math.cos(-LAT)).normalize(),hour/24*6.2832);
  const ma=hour/6*6.2832;const md=new THREE.Vector3(Math.cos(ma)*0.9,0.25+0.2*Math.sin(ma*0.5),Math.sin(ma)*0.9).normalize();moon.position.copy(md).multiplyScalar(0.93);moon.scale.set(0.02,0.02,1);moon.material.opacity=md.y>0.05?0.9:0;
  return state;}
 function lighting(){const s=state.sun;const dayF=Math.min(1,Math.max(0,(s.y+0.12)/0.3));const dusk=Math.exp(-Math.pow((s.y-0.02)/0.16,2));const e=state.eclipse;
  const sunCol=new THREE.Color(1,0.96,0.9).lerp(new THREE.Color(1,0.55,0.3),dusk).multiplyScalar(1-0.85*e);
  const thick=Math.min(1.6,Math.max(0.3,state.dens/1.6));const hor=new THREE.Color(0.78,0.84,0.90).lerp(new THREE.Color(0.86,0.70,0.52),Math.min(1,Math.max(0,thick-0.5)));
  const fog=new THREE.Color(0.06,0.05,0.09).lerp(hor,dayF).lerp(new THREE.Color(1,0.5,0.25),dusk*0.5).multiplyScalar(1-0.6*e*dayF);
  return{sunDir:s.clone(),sunIntensity:1.7*dayF*(1-0.85*e),sunColor:sunCol,ambient:0.18+0.55*dayF*(1-0.6*e)+0.08*(1-dayF),fog,giantDir:giantDir.clone(),eclipse:e,isNight:dayF<0.05,dayF,dusk};}
 return{attach,update,lighting,sunDir,altAz,giantDir,state,GIANT_ANG};})();
window.KratorSky=KratorSky;
