// ---------- Galaxy class: planets, drawn in a shader ----------
// Original work. Every planet here is a sphere whose surface is worked out per pixel from 3D noise on the sphere's
// own coordinates, so it holds up from a thousand kilometres to a few: no texture, no vertex colours, no facets.
//
//   terran   oceans (deep to shallow, with the sun's glint on them), continents graded by height and latitude from
//            shore to forest to desert to rock, snow on peaks and caps, city lights on the night side
//   ice      the same land and sea frozen: pack ice cracked into floes, open water in the cracks
//   gas      bands sheared by turbulence, a great oval storm, darker belts
//   moon     grey regolith, maria, craters (a few dozen, each a bowl with a rim and rays)
//   lava     black crust split by glowing cracks, the cracks glowing on the night side
// A cloud deck (terran and ice) is a second sphere just above, its own noise warped into weather, turning a little
// faster than the ground. Rings are a shader of their own: ringlets and gaps from 1D noise, lit from both faces, and
// the planet's shadow across them. uSun is the sun's direction in the world, set every frame for all of them.
//
// The noise is Stefan Gustavson's and Ian McEwan's 3D simplex noise (webgl-noise, MIT licence).
export const PLANET_UNIFORMS=[];
const NOISE=`
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
float fbm(vec3 p,int o){float a=0.5,s=0.;for(int i=0;i<8;i++){if(i>=o)break;s+=a*snoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return s;}
float ridged(vec3 p,int o){float a=0.5,s=0.;for(int i=0;i<8;i++){if(i>=o)break;s+=a*(1.-abs(snoise(p)));p=p*2.1+vec3(3.3,1.1,7.7);a*=0.5;}return s;}
`;
const VS=`varying vec3 vO,vN,vW;void main(){vO=normalize(position);vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const LIGHT=`
  vec3 n=normalize(vN),v=normalize(cameraPosition-vW);float l=dot(n,uSun);
  float day=smoothstep(-0.08,0.25,l),dif=max(0.,l)*0.95+0.05*day;
  vec3 h=normalize(uSun+v);
`;
const FS={
terran:`uniform vec3 uSun,uC0,uC1,uC2,uC3;uniform float uSeed,uSea;varying vec3 vO,vN,vW;${NOISE}
void main(){vec3 p=vO*1.6+uSeed;
  float e=fbm(p,6)+0.35*ridged(p*2.2,3)-0.18,lat=abs(vO.y);
  ${LIGHT}
  vec3 col;float spec=0.;
  if(e<uSea){float d=clamp((uSea-e)*4.,0.,1.);col=mix(uC0*1.5,uC0*0.55,d);spec=pow(max(0.,dot(n,h)),90.)*0.9*day;}
  else{float a=clamp((e-uSea)*3.,0.,1.);float dry=smoothstep(0.15,0.0,lat)*0.7+0.4*fbm(p*3.+5.,2);
    col=mix(mix(uC1,uC2,clamp(dry,0.,1.)),vec3(0.42,0.38,0.34),smoothstep(0.35,0.75,a));
    col*=0.85+0.25*snoise(p*24.);}
  float ice=smoothstep(0.78,0.86,lat+0.06*snoise(p*6.))+smoothstep(0.55,0.62,e)*0.9;col=mix(col,uC3,clamp(ice,0.,1.));
  vec3 c=col*dif+vec3(1.,.95,.85)*spec;
  // the cities, on land, on the night side
  float city=step(uSea+0.03,e)*smoothstep(0.78,0.9,snoise(p*55.)*0.5+0.5)*smoothstep(0.62,0.8,snoise(p*4.+2.)*0.5+0.5)*(1.-day)*(1.-ice)*(1.-smoothstep(uSea+0.2,uSea+0.4,e));
  c+=vec3(1.,.72,.38)*city*0.7;
  gl_FragColor=vec4(c,1.);}`,
ice:`uniform vec3 uSun,uC0,uC1,uC2,uC3;uniform float uSeed,uSea;varying vec3 vO,vN,vW;${NOISE}
void main(){vec3 p=vO*1.6+uSeed;
  float e=fbm(p,6);float cr=ridged(p*5.,5);float crack=smoothstep(0.88,0.97,cr);
  ${LIGHT}
  vec3 col=mix(uC1,uC3,smoothstep(-0.3,0.4,e));col=mix(col,uC2,0.35*fbm(p*9.,3)+0.2);col=mix(col,uC0*0.7,crack);
  float spec=pow(max(0.,dot(n,h)),40.)*0.35*day;
  gl_FragColor=vec4(col*dif+vec3(spec),1.);}`,
gas:`uniform vec3 uSun,uC0,uC1,uC2,uC3;uniform float uSeed,uT;varying vec3 vO,vN,vW;${NOISE}
void main(){vec3 p=vO;float y=p.y;
  float w=fbm(vec3(p.x*2.,y*9.,p.z*2.)+uSeed+vec3(uT*0.01,0.,0.),5);
  float b=y*7.5+w*0.9+0.25*snoise(vec3(p.x*6.,y*30.,p.z*6.)+uSeed);
  float k=0.5+0.5*sin(b*3.14159);float k2=0.5+0.5*sin(b*1.7+1.);
  vec3 col=mix(mix(uC0,uC1,k),mix(uC2,uC3,k),k2*0.7);
  // the great storm: an oval in the southern belt, its own swirl
  vec2 so=vec2(atan(p.z,p.x)-1.2,(y+0.32)*4.);float sd=length(so*vec2(1.,1.8));
  float st=smoothstep(0.32,0.12,sd);col=mix(col,vec3(0.78,0.42,0.28)*(0.85+0.3*snoise(vec3(so*9.,uSeed))),st);
  ${LIGHT}
  float limb=pow(max(0.,dot(n,v)),0.35);
  gl_FragColor=vec4(col*dif*(0.75+0.25*limb),1.);}`,
moon:`uniform vec3 uSun,uC0,uC1,uC2,uC3;uniform float uSeed;varying vec3 vO,vN,vW;${NOISE}
float hash(float n){return fract(sin(n)*43758.5453);}
void main(){vec3 p=vO*1.6+uSeed;
  float m=smoothstep(0.1,0.35,fbm(p*0.9,4));vec3 col=mix(uC2,uC0,m)*(0.82+0.3*fbm(p*14.,4));
  vec3 n0=normalize(vN);float shade=0.;
  for(int i=0;i<36;i++){float fi=float(i)+uSeed*7.;vec3 c=normalize(vec3(hash(fi)-0.5,hash(fi+1.3)-0.5,hash(fi+2.7)-0.5));
    float r=0.04+0.16*pow(hash(fi+4.1),3.),d=acos(clamp(dot(vO,c),-1.,1.))/r;
    if(d<1.){shade-=0.32*(1.-d*d);}else if(d<1.25){shade+=0.25*(1.-(d-1.)/0.25);}
    else if(d<3.&&hash(fi+5.)>0.75){shade+=0.12*(1.-(d-1.25)/1.75)*smoothstep(0.6,1.,snoise(vO*60.+fi));}}
  col*=1.+shade;
  ${LIGHT}
  gl_FragColor=vec4(col*dif,1.);}`,
lava:`uniform vec3 uSun,uC0,uC1,uC2,uC3;uniform float uSeed,uT;varying vec3 vO,vN,vW;${NOISE}
void main(){vec3 p=vO*1.8+uSeed;
  float cr=ridged(p*2.2+fbm(p*1.5,3),5),c=smoothstep(0.74,0.9,cr)*0.9+smoothstep(0.9,0.97,cr)*0.4;float pool=smoothstep(0.28,0.42,fbm(p*0.9,4));
  vec3 crust=mix(uC0,uC1,fbm(p*8.,3)*0.5+0.5);
  ${LIGHT}
  float glow=max(c,pool)*(0.75+0.25*sin(uT*0.8+cr*20.));
  vec3 hot=mix(vec3(1.,.25,.03),vec3(1.,.75,.3),glow);
  gl_FragColor=vec4(crust*dif*(1.-glow)+hot*glow*1.6,1.);}`,
clouds:`uniform vec3 uSun;uniform float uSeed,uT,uK;varying vec3 vO,vN,vW;${NOISE}
void main(){vec3 p=vO*2.2+uSeed;
  vec3 q=vec3(fbm(p+vec3(0.,0.,uT*0.004),3),fbm(p+vec3(5.2,1.3,2.8),2),0.);
  float c=fbm(p+q*1.6+vec3(uT*0.003,0.,0.),5);c=smoothstep(0.02,0.5,c)*uK;
  c*=1.-0.6*smoothstep(0.7,0.95,abs(vO.y));
  ${LIGHT}
  float rim=pow(1.-max(0.,dot(n,v)),2.);
  gl_FragColor=vec4(vec3(1.)*dif*(0.9+0.2*rim),c*(0.15+0.85*day));}`,
};

export function planetMesh(THREE,o){
  const R=o.R,type=o.type||'terran',seg=o.seg||128;
  const cs=(o.colours||['#1b4a7a','#2f6a44','#8f7c54','#e8eff4']).map(c=>new THREE.Color(c));
  const uni={uSun:{value:new THREE.Vector3(1,0,0)},uSeed:{value:o.seed||1.7},uSea:{value:o.sea==null?0.02:o.sea},uT:{value:0},
    uC0:{value:cs[0]},uC1:{value:cs[1]},uC2:{value:cs[2]},uC3:{value:cs[3]},uK:{value:o.cloudK==null?0.85:o.cloudK}};
  PLANET_UNIFORMS.push(uni);
  // the planet's group stays put; its surface and clouds turn inside it (the rings must not wobble with them)
  const g=new THREE.Group(),sp=new THREE.Group();g.add(sp);g.userData.spinner=sp;
  const m=new THREE.Mesh(new THREE.SphereGeometry(R,seg,Math.round(seg*0.66)),new THREE.ShaderMaterial({uniforms:uni,vertexShader:VS,fragmentShader:FS[type]}));
  sp.add(m);
  if(o.clouds){const cm=new THREE.Mesh(new THREE.SphereGeometry(R*1.008,seg,Math.round(seg*0.66)),new THREE.ShaderMaterial({uniforms:uni,vertexShader:VS,fragmentShader:FS.clouds,transparent:true,depthWrite:false}));
    sp.add(cm);g.userData.clouds=cm;}
  if(o.ring)g.add(ringMesh(THREE,R,o.ring,uni));
  g.traverse(x=>{x.userData.noWire=true;x.frustumCulled=false;});
  g.userData.spin=o.spin==null?2e-5:o.spin;
  return g;
}

// rings: ringlets and gaps from noise along the radius; the side away from the sun lit through them, dimmer; the
// planet's shadow where the line to the sun passes through the planet
function ringMesh(THREE,R,o,pu){
  const inner=(o.inner||1.4)*R,outer=(o.outer||2.4)*R,c=new THREE.Color(o.colour||'#cdbf9e');
  const uni={uSun:pu.uSun,uC:{value:c},uIn:{value:inner},uOut:{value:outer},uR:{value:R},uSeed:pu.uSeed};
  const m=new THREE.Mesh(new THREE.RingGeometry(inner,outer,256,4),new THREE.ShaderMaterial({uniforms:uni,transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`varying vec3 vW,vL,vC0;varying vec3 vN;void main(){vL=position;vC0=(modelMatrix*vec4(0.,0.,0.,1.)).xyz;vN=normalize(mat3(modelMatrix)*vec3(0.,0.,1.));vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`uniform vec3 uSun,uC;uniform float uIn,uOut,uR,uSeed;varying vec3 vW,vL,vN,vC0;
      float h(float x){return fract(sin(x*127.1+uSeed)*43758.5453);}
      float n1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h(i),h(i+1.),f);}
      void main(){float r=(length(vL.xy)-uIn)/(uOut-uIn);
        float d=0.55*n1(r*40.)+0.3*n1(r*130.)+0.15*n1(r*420.);d=smoothstep(0.25,0.75,d);
        d*=1.-smoothstep(0.58,0.62,r)*(1.-smoothstep(0.62,0.66,r))*0.9;   // a dark division
        d*=smoothstep(0.,0.05,r)*(1.-smoothstep(0.92,1.,r));
        // the planet's shadow: from this point towards the sun, does the ray pass within the planet?
        vec3 o=vW-vC0;float b=dot(o,uSun);float sh=1.;
        if(b<0.){float q=dot(o,o)-b*b;sh=smoothstep(uR*uR*0.92,uR*uR*1.04,q);}
        float lit=abs(dot(normalize(vN),uSun));float back=step(0.,dot(vN,uSun))==step(0.,dot(vN,cameraPosition-vW))?1.:0.55;
        vec3 col=uC*(0.85+0.3*n1(r*200.));float a=d*0.85;
        gl_FragColor=vec4(col*(0.2+0.9*lit)*back*sh,a);}`}));
  m.rotation.x=-Math.PI/2;
  const t=new THREE.Group();t.add(m);t.rotation.z=o.tilt==null?0.35:o.tilt;return t;
}
