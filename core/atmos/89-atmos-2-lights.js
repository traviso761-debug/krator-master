// ================================================================= ATMOS — the evening: searchlight beams, spot cones, beacons, braziers, floodlights
// Beams and cones are additive cones whose brightness fades along their length (no real lights: they cost nothing per
// fragment). Each has an on/off window in hours; the glow layer puts a soft sprite at its source. Real PointLights are
// only made by floodLight(); a host should keep those to a handful (every lit material pays for every light).
(function(){const A=ATMOS;
 const fadeCone=(len,rad,seg)=>{const g=new A.T.ConeGeometry(rad,len,seg||12,1,true).translate(0,-len/2,0);const p=g.attributes.position,c=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const f=1-Math.min(1,Math.abs(p.getY(i))/len),v=f*f;c[i*3]=c[i*3+1]=c[i*3+2]=v;}g.setAttribute('color',new A.T.BufferAttribute(c,3));return g;};   // apex at the origin, opening toward -y
 const beamMat=hex=>new A.T.MeshBasicMaterial({color:hex||0xfff2d0,vertexColors:true,transparent:true,opacity:0,blending:A.T.AdditiveBlending,depthWrite:false,side:A.T.DoubleSide,fog:false});
 const housing=()=>A.lam(0x2a2826,.6);
 // a SEARCHLIGHT on a tower: sweeps ±sweep rad about `heading` (bearing, x toward z), tilted `tilt` below the horizontal.
 // o.sky: points up and wanders round the sky instead (palace roofs).
 A.sweepBeam=(x,y,z,o)=>{o=o||{};const T=A.T,piv=new T.Group();piv.position.set(x,y,z);A.add(piv);A.noRay(piv);
  const hm=new T.Mesh(A.geo('post'),housing());hm.scale.set(1.3,1.4,1.3);hm.position.y=-.7;piv.add(hm);
  const m=beamMat(o.color);const cone=new T.Mesh(fadeCone(o.len||220,o.rad||9),m);
  const tilt=new T.Group();piv.add(tilt);tilt.add(cone);if(o.sky){cone.rotation.x=Math.PI;}else tilt.rotation.x=-(Math.PI/2-(o.tilt||.12));
  const on=o.on!=null?o.on:17.9,off=o.off!=null?o.off:29.7,ph=A.rr(0,6.28),rate=A.rr(.2,.35),base=Math.PI/2-(o.heading||0),sw=o.sweep==null?.7:o.sweep;
  A.glowAdd(x,y+.6,z,[1,.95,.8],o.glow||9,on,off);
  A.hook((t,h)=>{const l=A.litAt(h,on,off);m.opacity=(o.opacity||.2)*l;cone.visible=l>.01;
   if(o.sky){piv.rotation.z=.5*Math.sin(t*rate+ph);piv.rotation.y=t*.25+ph;}else piv.rotation.y=base+sw*Math.sin(t*rate+ph);});return piv;};
 // a fixed SPOT CONE from (x,y,z) along dir (world vector): a gate lamp throwing light down on a bridge
 A.spotCone=(x,y,z,dir,o)=>{o=o||{};const T=A.T,m=beamMat(o.color);const c=new T.Mesh(fadeCone(o.len||120,o.rad||14),m);c.position.set(x,y,z);
  c.quaternion.setFromUnitVectors(new T.Vector3(0,-1,0),new T.Vector3(dir[0],dir[1],dir[2]).normalize());A.add(c);A.noRay(c);
  const on=o.on!=null?o.on:17.75,off=o.off!=null?o.off:29.8;A.glowAdd(x,y,z,[1,.95,.8],o.glow||10,on,off);
  A.hook((t,h)=>{const l=A.litAt(h,on,off);m.opacity=(o.opacity||.13)*l;c.visible=l>.01;});return c;};
 // a rotating BEACON: two thin cones back to back, red by default, faint by day
 A.beacon=(x,y,z,o)=>{o=o||{};const T=A.T,g=new T.Group();g.position.set(x,y,z);A.add(g);A.noRay(g);const m=beamMat(o.color||0xff6040);const geo=fadeCone(o.len||90,o.rad||4,10);
  for(const a of[0,Math.PI]){const w=new T.Group();w.rotation.y=a;const c=new T.Mesh(geo,m);c.rotation.x=-(Math.PI/2-.05);w.add(c);g.add(w);}
  A.glowAdd(x,y,z,[1,.3,.2],o.glow||10,0,30);A.hook(t=>{m.opacity=.35*A.U.night.value+.05;g.rotation.y=t*1.5;});return g;};
 // a BRAZIER: an iron bowl on a post, a flickering flame (scaled to nothing when out)
 A.brazier=(x,y,z,o)=>{o=o||{};A.set('brazier','post',A.lam(0x5c4a3a,.7));A.put('brazier',[x,y,z,.4,2.2,.4,0]);A.put('brazier',[x,y+2.2,z,1.05,.7,1.05,0]);
  const T=A.T,fm=A.mat('flame',()=>new T.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.92,depthWrite:false}));const f=new T.Mesh(A.geo('cone'),fm);f.position.set(x,y+2.85,z);A.add(f);A.noRay(f);
  const on=o.on!=null?o.on:17.5,off=o.off!=null?o.off:29.9;A.glowAdd(x,y+3.6,z,[1,.6,.2],o.glow||7,on,off);
  A.hook((t,h)=>{const l=A.litAt(h,on,off),k=(.85+.2*Math.sin(t*7+x))*l;f.visible=l>.01;f.scale.set(.75*k+.001,1.7*k+.001,.75*k+.001);});return f;};
 // a scheduled FLOODLIGHT (a real PointLight), warming up from dim orange as it comes on
 A.floodLight=(x,y,z,o)=>{o=o||{};const L=new A.T.PointLight(0xffd9a0,0,o.dist||140,o.decay||1.6);L.position.set(x,y,z);A.add(L);const on=o.on!=null?o.on:17.1,off=o.off!=null?o.off:22.3;
  A.glowAdd(x,y,z,[1,.85,.6],o.glow||12,on,off);
  A.hook((t,h)=>{const hh=h<12?h+24:h,w=Math.min(1,Math.max(0,(hh-on)/.45));L.intensity=(o.intensity||1.1)*A.litAt(h,on,off)*(.3+.7*w);L.color.setRGB(1,.54+.31*w,.23+.4*w);});return L;};
 // THE GLOW LAYER: one Points cloud over every registered light; a light's sprite follows its hours, a night light the night
 A.buildGlow=()=>{const n=A.glow.length;if(!n)return null;const T=A.T;const pos=new Float32Array(n*3),col=new Float32Array(n*3),sz=new Float32Array(n),lt=new Float32Array(n*2);
  A.glow.forEach((g,i)=>{pos.set([g[0],g[1],g[2]],i*3);col.set([g[3],g[4],g[5]],i*3);sz[i]=g[6];lt[i*2]=g[7];lt[i*2+1]=g[8];});
  const gg=new T.BufferGeometry();gg.setAttribute('position',new T.BufferAttribute(pos,3));gg.setAttribute('color',new T.BufferAttribute(col,3));gg.setAttribute('psize',new T.BufferAttribute(sz,1));gg.setAttribute('lt',new T.BufferAttribute(lt,2));
  const cv=document.createElement('canvas');cv.width=cv.height=64;const c2=cv.getContext('2d');const gr=c2.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.18,'rgba(255,255,255,.75)');gr.addColorStop(.5,'rgba(255,255,255,.18)');gr.addColorStop(1,'rgba(255,255,255,0)');c2.fillStyle=gr;c2.fillRect(0,0,64,64);
  const gm=new T.ShaderMaterial({uniforms:{map:{value:new T.CanvasTexture(cv)},hour:A.U.hour,night:A.U.night,px:A.U.px,rain:A.U.rain},transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,
   vertexShader:`attribute float psize;attribute vec3 color;attribute vec2 lt;uniform float hour;uniform float night;uniform float px;uniform float rain;varying vec3 vC;varying float vA;${A.GLSL_LIT}
    void main(){float f=lt.x<0.0?0.25+0.75*night:(lt.x==0.0?1.0:atmLit(hour,lt));vec4 mv=modelViewMatrix*vec4(position,1.0);float d=max(-mv.z,1.0);
     gl_PointSize=clamp(psize*px/d*(0.6+0.4*f)*(1.0+0.4*rain),2.0,160.0);vA=exp(-d*0.0022)*f*(0.15+0.85*night);vC=color;gl_Position=projectionMatrix*mv;}`,
   fragmentShader:`uniform sampler2D map;varying vec3 vC;varying float vA;void main(){float a=texture2D(map,gl_PointCoord).a*vA;if(a<0.004)discard;gl_FragColor=vec4(vC*a*1.7,a);}`});
  const pts=new T.Points(gg,gm);pts.frustumCulled=false;pts.renderOrder=6;pts.name='atmos:glow';A.add(pts);A.noRay(pts);A.stats.glow=n;return pts;};
})();
