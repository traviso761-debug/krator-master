// ---------- M87*, the first black hole ever imaged ----------
// The picture is a shader on a quad over the whole screen. For each pixel a ray of light is followed backwards
// from the camera through the black hole's curved space (Schwarzschild: in units of its radius, a photon's
// acceleration is -3/2 h^2 x / r^5, h its angular momentum), a step at a time, smaller close in. It ends in the
// horizon (black), or out in the sky, where a star field and the galaxy's own glow are looked up in the direction
// it is leaving by, so the stars behind are lensed; on the way it may cross the accretion disk (from the innermost
// stable orbit at 3 radii out to K.disk[1]) once, twice or three times, which is why the far side of the disk shows
// over the top of the shadow and under it, and the thin bright photon ring round it. Each crossing adds the disk's
// light: hotter inwards, its colour shifted and its brightness raised to the fourth power of the Doppler factor of
// the gas orbiting at up to half the speed of light (the near side, coming towards you, is the bright one) and the
// gravitational redshift. Along the spin axis, the jet. The disk is drawn thin and bright, as a textbook or a film
// draws it: M87*'s own glow is fainter, thicker, and in radio light.
// K: scale (world units to one Schwarzschild radius), disk [inner, outer] in radii, jet (brightness), exposure.
export function blackHole(api,kit,K){
  const {THREE}=api;
  const S=K.scale||20,group=new THREE.Group();
  const U={uCam:{value:new THREE.Vector3()},uInvProj:{value:new THREE.Matrix4()},uCamWorld:{value:new THREE.Matrix4()},uTime:{value:0},
    uRin:{value:(K.disk||[3,14])[0]},uRout:{value:(K.disk||[3,14])[1]},uJet:{value:K.jet==null?0.06:K.jet},uExp:{value:K.exposure||1.1},uTpk:{value:K.peakK||5200}};
  const mat=new THREE.ShaderMaterial({uniforms:U,depthTest:false,depthWrite:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
    fragmentShader:`
precision highp float;
uniform vec3 uCam;uniform mat4 uInvProj,uCamWorld;uniform float uTime,uRin,uRout,uJet,uExp,uTpk;varying vec2 vUv;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec3 kelvin(float T){T=clamp(T,1000.,40000.)/100.;vec3 c;
  c.r=T<=66.?1.:clamp(1.292936*pow(T-60.,-0.1332047),0.,1.);
  c.g=T<=66.?clamp(0.3900816*log(T)-0.6318414,0.,1.):clamp(1.1298909*pow(T-60.,-0.0755148),0.,1.);
  c.b=T>=66.?1.:(T<=19.?0.:clamp(0.5432068*log(T-10.)-1.1962541,0.,1.));return c;}
vec3 sky(vec3 d){float phi=atan(d.z,d.x),th=acos(clamp(d.y,-1.,1.));vec3 col=vec3(0.);
  for(int L=0;L<3;L++){float sc=L==0?90.:(L==1?200.:420.);vec2 g=vec2(phi/6.2832*sc*2.,th/3.1416*sc),id=floor(g),f=fract(g)-0.5;
    float r=h21(id+float(L)*17.);if(r>0.93){vec2 o=vec2(h21(id+3.1),h21(id+7.7))-0.5;float dd=length(f-o*0.6),b=(r-0.93)/0.07;
      col+=mix(vec3(1.,.82,.66),vec3(.72,.82,1.),h21(id+9.))*b*b*smoothstep(0.16,0.,dd)*(L==0?2.2:1.2);}}
  // M87 is a giant elliptical galaxy: its own stars are a warm haze all round, thicker towards its middle
  col+=vec3(0.03,0.022,0.015)*(0.4+0.6*pow(max(0.,dot(d,normalize(vec3(-0.35,0.25,-1.)))),2.));
  return col;}
vec3 tone(vec3 c){return vec3(1.)-exp(-c*uExp);}
void main(){
  vec2 ndc=vUv*2.-1.;vec4 p=uInvProj*vec4(ndc,1.,1.);p/=p.w;vec3 v=normalize((uCamWorld*vec4(p.xyz,0.)).xyz),x=uCam;
  const float RF=48.;
  float R0=length(x);
  if(R0>RF){float b=dot(x,v),c=dot(x,x)-RF*RF,disc=b*b-c;if(disc<0.||b>0.){gl_FragColor=vec4(tone(sky(v)),1.);return;}x+=v*(-b-sqrt(disc));}
  vec3 hv=cross(x,v);float h2=dot(hv,hv);
  vec3 col=vec3(0.);float tr=1.;bool hole=false;
  float fmax=0.488;
  for(int i=0;i<420;i++){
    float r=length(x);
    if(r<1.0){hole=true;break;}
    if(r>RF+1.&&dot(x,v)>0.)break;
    float dt=clamp(0.05*r*r/(1.+r),0.015,1.2);
    // the jet along the spin axis, brighter on the side that comes towards M87's line of sight (+y)
    float ay=abs(x.y),rho=length(x.xz);
    if(ay>1.4){float w=0.22+0.085*ay;col+=tr*vec3(.55,.68,1.)*exp(-rho*rho/(w*w))*exp(-ay/36.)*smoothstep(1.4,3.5,ay)*dt*uJet*(x.y>0.?1.:0.3);}
    vec3 xo=x,a=-1.5*h2*x/pow(r,5.);v+=a*dt*0.5;x+=v*dt;r=length(x);a=-1.5*h2*x/pow(r,5.);v+=a*dt*0.5;
    if(xo.y*x.y<0.){float f=xo.y/(xo.y-x.y);vec3 q=mix(xo,x,f);float rq=length(q.xz);
      if(rq>uRin&&rq<uRout){
        float beta=min(0.95,sqrt(0.5/(rq-1.))),gam=1./sqrt(1.-beta*beta);
        vec3 ph=normalize(vec3(-q.z,0.,q.x));float cs=dot(ph,-normalize(v));
        float g=(1./(gam*(1.-beta*cs)))*sqrt(1.-1./rq);
        float fr=pow(rq/uRin,-0.75)*pow(1.-sqrt(uRin/rq),0.25)/fmax;
        float an=atan(q.z,q.x),om=pow(rq,-1.5)*2.2,s=an-uTime*om+1.6*log(rq);
        float n=0.5+0.5*(0.55+0.45*sin(s*7.))*(0.6+0.4*sin(rq*6.+s*3.))+0.15*h21(vec2(floor(rq*8.),floor(s*12.)));
        float al=0.92*smoothstep(uRin,uRin+0.25,rq)*smoothstep(uRout,uRout-4.,rq);
        vec3 em=kelvin(uTpk*fr*g)*pow(fr,2.)*pow(g,4.)*n*1.5;
        col+=tr*em*al;tr*=1.-al;if(tr<0.02)break;}}
  }
  if(!hole)col+=tr*sky(normalize(v));
  gl_FragColor=vec4(tone(col),1.);
}`});
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);quad.frustumCulled=false;quad.renderOrder=-100;quad.userData.noWire=true;group.add(quad);
  // something to click: the shadow
  const hit=new THREE.Mesh(new THREE.SphereGeometry(S*2.6,24,16),new THREE.MeshBasicMaterial({visible:false}));hit.userData.noWire=true;
  hit.userData.info={name:'M87*',info:K.info||''};group.add(hit);
  let on=false;
  // the camera as it is drawn this frame (the turntable moves it after the animation hooks run)
  quad.onBeforeRender=(r,s,cam)=>{U.uCam.value.copy(cam.position).multiplyScalar(1/S);U.uCamWorld.value.copy(cam.matrixWorld);U.uInvProj.value.copy(cam.projectionMatrixInverse);U.uTime.value=performance.now()/1000;};
  const r=x=>x*S;
  return {group,ownSky:true,pick:[hit],view:K.view||{az:0.6,el:0.09,d:r(34)},active(v){on=v;},hud:()=>'M87* · 6.5 billion suns · 55 million light years'};
}
