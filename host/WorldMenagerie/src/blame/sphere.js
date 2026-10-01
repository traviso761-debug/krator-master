// ---------- the City, all of it ----------
// Nihei's own figure for the size of the City is a sphere about as wide as Jupiter's orbit: 1.6 billion
// kilometres across, round the Sun, like a Dyson sphere. This is that, drawn at its size, in a scene of its
// own with a unit of a million kilometres - the block in the other scene would be a fortieth of a unit thick
// here, so the two could never share a depth buffer, let alone a camera.
//
// What is known and what is not. The diameter is Nihei's. That the City began on the Earth and swallowed it,
// and the Moon, is NOiSE's. How deep it goes - whether it is a shell, or solid from the Earth's old orbit out,
// or something else - the manga never says; it only says the layers are thousands and the space inside one of
// them can be as big as Jupiter. So this draws it from where the Earth was out to the skin, in layers, and the
// section says so. The layers are not to scale: at the size they are drawn they would be too thin to see,
// which is the whole point of the page, and the overlay says that as well.

export function createSphere(THREE,C){
  const scene=new THREE.Scene();
  const R=C.city.diameterKm/2/1e6;                 // 800 units: the skin
  const RIN=C.city.innerKm/1e6;                    // 149.6: where the Earth was
  const AU=149.6;

  // ---- the stars ----
  {let s=1872;const r=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
   for(const [n,size,c] of [[5000,1.1,0x9aa4b4],[700,1.8,0xe8ecf4],[120,2.6,0xffffff]]){
    const p=new Float32Array(n*3);
    for(let i=0;i<n;i++){const a=r()*Math.PI*2,b=Math.acos(2*r()-1),d=60000;p[i*3]=Math.sin(b)*Math.cos(a)*d;p[i*3+1]=Math.cos(b)*d;p[i*3+2]=Math.sin(b)*Math.sin(a)*d;}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
    scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:c,size,sizeAttenuation:false,fog:false})));}}

  // ---- the Sun, inside ----
  const glow=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
    const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(255,248,230,1)');gr.addColorStop(0.08,'rgba(255,236,200,0.95)');
    gr.addColorStop(0.3,'rgba(255,210,150,0.25)');gr.addColorStop(1,'rgba(255,190,120,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);return new THREE.CanvasTexture(c);})();
  const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,depthWrite:false,transparent:true,blending:THREE.AdditiveBlending}));
  sun.scale.setScalar(90);scene.add(sun);

  // ---- the orbits: the ones inside, and the Earth's, and Jupiter's ----
  const orbits=[];
  const ring=(r,color,dash)=>{const pts=[];for(let i=0;i<=360;i++){const a=i/360*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r));}
    const g=new THREE.BufferGeometry().setFromPoints(pts);
    const m=dash?new THREE.LineDashedMaterial({color,dashSize:r*0.03,gapSize:r*0.03,transparent:true,opacity:0.8}):new THREE.LineBasicMaterial({color,transparent:true,opacity:0.7});
    const l=new THREE.Line(g,m);if(dash)l.computeLineDistances();scene.add(l);orbits.push(l);return l;};
  ring(57.9,0x8a8272);ring(108.2,0xa89a78);ring(AU,0x7fa6c8,true);ring(227.9,0xb07a5a,true);ring(778.5,0xc9a878,true);
  // the Earth, where it was: grey, wrapped
  const earth=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([-AU,0,0],3)),
    new THREE.PointsMaterial({color:0x9aa0a8,size:5,sizeAttenuation:false}));
  scene.add(earth);

  // ---- the skin ----
  // Ruled into panels like the floor of the Plain, and pricked with lights, and lit on the inside by the Sun it
  // is built round. From outside there is nothing to light it but the stars; it is given a little light from
  // one side all the same, so that it reads as a ball and not a hole in the sky.
  const LOG_V='#include <common>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n';
  const LOG_F='#include <common>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\n';
  const skin=new THREE.Mesh(new THREE.SphereGeometry(R,192,96),new THREE.ShaderMaterial({
    side:THREE.DoubleSide,clipping:true,extensions:{derivatives:true},
    uniforms:{uR:{value:R}},
    vertexShader:LOG_V+`varying vec3 vP;varying vec3 vN;
void main(){vP=position;vN=normalize(normal);vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;
#include <logdepthbuf_vertex>
#include <clipping_planes_vertex>
}`,
    fragmentShader:LOG_F+`uniform float uR;varying vec3 vP;varying vec3 vN;
float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float rl(float c,float per,float w){float fw=max(fwidth(c),1e-5);float d=abs(fract(c/per+0.5)-0.5)*per;float hw=max(w*0.5,fw*0.5);
 return (1.0-smoothstep(hw,hw+fw,d))*min(1.0,w/fw)*smoothstep(2.5,7.0,per/fw);}
void main(){
#include <clipping_planes_fragment>
 #include <logdepthbuf_fragment>
 vec3 n=normalize(vP);float lon=atan(n.z,n.x)*uR,lat=asin(clamp(n.y,-1.0,1.0))*uR;vec2 q=vec2(lon*sqrt(max(0.0,1.0-n.y*n.y)),lat);
 vec2 c=floor(q/18.0),c2=floor(q/5.0);
 float tone=0.86+0.08*hh(c)+0.06*hh(c2);
 float s=max(rl(q.x,144.0,1.6),rl(q.y,144.0,1.6))*0.5+max(rl(q.x+9.0,36.0,0.5),rl(q.y+9.0,36.0,0.5))*0.22+max(rl(q.x,9.0,0.15),rl(q.y,9.0,0.15))*0.12;
 float lit=step(0.985,hh(floor(q/2.5)))*smoothstep(2.0,6.0,2.5/max(length(fwidth(q)),1e-5));
 vec3 col;
 if(gl_FrontFacing){
  float k=0.18+0.55*max(0.0,dot(n,normalize(vec3(-0.5,0.35,0.6))));
  col=vec3(0.52,0.54,0.57)*tone*k*(1.0-s)+vec3(0.85,0.9,1.0)*lit*0.5;
 }else{
  // the inside of the skin, facing the Sun
  col=vec3(0.66,0.6,0.52)*tone*(1.0-s*0.8)*0.75+vec3(1.0,0.85,0.6)*lit*0.4;
 }
 gl_FragColor=vec4(col,1.0);
}`}));
  scene.add(skin);

  // ---- the cut face: the City in section ----
  // A disc in the plane of the cut, turned to face you with it. From the Sun out to where the Earth was it is
  // empty; from there to the skin it is layers - drawn a hundred and sixty of them, of all thicknesses, dark
  // Megastructure and lighter space between - that fade to a grey tone where they get finer than a pixel.
  const cut=new THREE.Mesh(new THREE.RingGeometry(RIN,R,720,8),new THREE.ShaderMaterial({
    side:THREE.DoubleSide,extensions:{derivatives:true},uniforms:{uIn:{value:RIN},uR:{value:R}},
    vertexShader:'#include <common>\n#include <logdepthbuf_pars_vertex>\nvarying vec2 vQ;void main(){vQ=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);\n#include <logdepthbuf_vertex>\n}',
    fragmentShader:'#include <common>\n#include <logdepthbuf_pars_fragment>\n'+`uniform float uIn;uniform float uR;varying vec2 vQ;
float hh(float n){return fract(sin(n*91.7)*43758.5453);}
void main(){
 #include <logdepthbuf_fragment>
 float r=length(vQ);float t=(r-uIn)/(uR-uIn);
 // The layers: 90 bands of uneven thickness, mostly Megastructure, with the space of a layer a pale gap in
 // each - and inside every band, finer ones, because there are thousands and 90 is only what fits.
 float u=t*90.0;float i=floor(u);float f=fract(u);
 float gap=0.12+0.42*hh(i)*hh(i+3.0);           // the part of each band that is a layer's space
 float fw=fwidth(u);
 float m=1.0-smoothstep(gap-fw,gap+fw,f);
 m=mix(m,gap,smoothstep(0.08,0.3,fw));
 float u2=t*900.0,f2=fract(u2),fw2=fwidth(u2);
 float fine=(1.0-smoothstep(0.1-fw2,0.1+fw2,f2))*(1.0-smoothstep(0.05,0.2,fw2));
 vec3 mega=vec3(0.085,0.09,0.095),space=vec3(0.66,0.68,0.7)*(0.8+0.25*hh(i+7.0));
 vec3 col=mix(mega,space,m);
 col=mix(col,vec3(0.3,0.31,0.32),fine*0.5*(1.0-m));
 float h=step(0.5,fract((gl_FragCoord.x+gl_FragCoord.y)/7.0));col*=1.0-0.2*h*(1.0-m);
 col=mix(col,vec3(0.14,0.13,0.12),smoothstep(0.985,1.0,t));   // the skin
 gl_FragColor=vec4(col,1.0);
}`}));
  cut.visible=false;scene.add(cut);

  // The cut is the skin's own clipping plane (renderer.localClippingEnabled), not the renderer's, so the orbits
  // and the Sun inside stay whole. Off, it is parked a long way behind everything.
  const clip=new THREE.Plane(new THREE.Vector3(0,0,-1),1e9);
  skin.material.clippingPlanes=[clip];
  const tmp=new THREE.Vector3();
  function update(camera,section){
    cut.visible=section;
    if(!section){clip.constant=1e9;return;}
    {
      // A fixed plane through the Sun, square to the ecliptic, so that you can walk round the cut and see
      // the hemisphere behind it; the half on your side is the one taken away.
      const sgn=camera.position.z>0?-1:1;
      clip.normal.set(0,0,sgn);clip.constant=0;
      cut.position.set(0,0,sgn*0.02);
    }
  }
  // the places the overlay labels
  const labels=[
    {text:'THE SUN',sub:'inside it',pos:new THREE.Vector3(0,0,0),always:true,dy:22},
    {text:'THE EARTH',sub:'where it was: swallowed, with the Moon',pos:new THREE.Vector3(-AU,0,0),section:true,dx:-8},
    {text:'MARS\'S ORBIT',sub:'inside the City',pos:new THREE.Vector3(227.9,0,0),section:true},
    {text:'JUPITER\'S ORBIT',sub:'where Jupiter was, there is a room the size of Jupiter',pos:new THREE.Vector3(-778.5,0,0),section:true,dx:-8},
  ];
  return {scene,R,RIN,AU,update,clip,labels,skin,cut};
}
