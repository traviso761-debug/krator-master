// ================================================================= ATMOS — dust: what the wind lifts off bare dry ground
// A box of soft sprites riding the camera (as the ash storm's veils), each on the ground where it is: the host's ground
// round the camera is baked into a small height map (64 x 64, re-baked only when the camera has gone a few cells) that
// the vertex shader reads, with the host's MASK (0..1: where dust can rise at all: bare, dry ground, not grass or water)
// in the same texels. A sprite shows only where the wind there (atmWind: the gusts as they cross the ground) passes the
// lift threshold: nothing in a calm, a puff as a gust front passes in a breeze, a ground blizzard streaming downwind in a
// gale (the owner, 2026-10-23: "dust should also pick up when the wind blows"). Opt-in: a build lists this file after the
// core and calls ATMOS.dust(o) once. Its numbers: PRESETS.dust (set here when a build's presets have none).
//   ATMOS.dust({ground, mask, color, n, box, lift, ride, alpha})   ->  the sprites (A.stats.dust); A.dustLift(x,z) on the CPU
(function(){const A=ATMOS;
 A.PRESETS.dust=A.PRESETS.dust||{n:4200,box:340,grid:64,
  // lift: the wind (ATMOS's units: 1 is the presets' breeze) where dust starts to rise and where it is at its thickest
  lift:[1,2.2],ride:6,          // ride: metres a sprite moves for a unit of wind a second (6 m/s a unit, the hosts' scale)
  height:[.3,3.2],plume:[.08,11],  // most skim the ground; plume[0] of them rise to plume[1] m
  size:[2.4,9],rate:.13,alpha:.55,color:[.74,.67,.55]};
 // the CPU twin of the shader's lift (for checks and hosts): 0..1 at (x, z) now, from the wind there and the mask
 A.dustLift=(x,z,mask)=>{const P=A.PRESETS.dust,w=A.windAt(A.clock?A.clock.t:A.U.time.value,x,z),s=Math.hypot(w[0],w[1]),
  t=Math.min(1,Math.max(0,(s-P.lift[0])/(P.lift[1]-P.lift[0])));return Math.pow(t*t*(3-2*t),.6)*(mask==null?1:mask);};
 A.dust=o=>{o=o||{};const T=A.T,P=Object.assign({},A.PRESETS.dust,o),F=A.glf,B=P.box/2,G=P.grid,E=P.box*1.2;
  const ground=o.ground||A.ground,mask=o.mask||(()=>1);
  // THE HEIGHT MAP: height in two bytes (1/64 m, +-512 m about the map's base), the mask in the third; any WebGL reads it
  const data=new Uint8Array(G*G*4),tex=new T.DataTexture(data,G,G,T.RGBAFormat);tex.magFilter=tex.minFilter=T.NearestFilter;tex.generateMipmaps=false;
  const HC={value:new T.Vector3(1e9,1e9,0)};
  const bake=(cx,cz)=>{const base=ground(cx,cz);for(let j=0;j<G;j++)for(let i=0;i<G;i++){const x=cx+((i+.5)/G-.5)*E,z=cz+((j+.5)/G-.5)*E,k=(j*G+i)*4;
    const e=Math.max(0,Math.min(65535,Math.round((ground(x,z)-base)*64)+32768));data[k]=e>>8;data[k+1]=e&255;data[k+2]=Math.round(Math.max(0,Math.min(1,mask(x,z)))*255);data[k+3]=255;}
   tex.needsUpdate=true;HC.value.set(cx,cz,base);};
  const snap=E/G*4;A.hook(()=>{const c=A.h.camera.position;if(Math.abs(c.x-HC.value.x)>E*.15||Math.abs(c.z-HC.value.y)>E*.15)bake(Math.round(c.x/snap)*snap,Math.round(c.z/snap)*snap);});
  const pos=[],pp=[];for(let i=0;i<P.n;i++){pos.push(A.rr(-B,B),0,A.rr(-B,B));pp.push(A.rnd(),A.rnd(),A.rr(P.size[0],P.size[1]),A.rnd());}
  const m=new T.ShaderMaterial({uniforms:{time:A.U.time,windOff:A.U.windOff,wind:A.U.wind,gustAmp:A.U.gustAmp,px:A.U.px,light:A.U.light,uHM:{value:tex},uHC:HC},
   transparent:true,depthWrite:false,fog:false,
   vertexShader:`uniform float time;uniform vec2 windOff;uniform vec2 wind;uniform float gustAmp;uniform float light;uniform sampler2D uHM;uniform vec3 uHC;attribute vec4 pp;varying float vA;
    ${A.GLSL_QUAD}
    ${A.GLSL_WIND}
    vec2 hmT(vec2 t){vec4 v=texture2D(uHM,(t+0.5)/${F(G)});return vec2((v.r*65280.0+v.g*255.0-32768.0)/64.0,v.b);}
    vec2 hm(vec2 xz){vec2 t=(xz-uHC.xy)/${F(E)}*${F(G)}+${F(G/2)}-0.5;t=clamp(t,0.0,${F(G-1.001)});vec2 i=floor(t),f=t-i;
     return mix(mix(hmT(i),hmT(i+vec2(1.0,0.0)),f.x),mix(hmT(i+vec2(0.0,1.0)),hmT(i+vec2(1.0,1.0)),f.x),f.y)+vec2(uHC.z,0.0);}
    void main(){vec3 p=ipos;vec2 d=windOff*${F(P.ride)}*(0.75+0.5*pp.x);
     p.xz=mod(p.xz-cameraPosition.xz+${F(B)}+d,${F(P.box)})-${F(B)}+cameraPosition.xz;
     float age=fract(time*${F(P.rate)}*(0.7+0.6*pp.w)+pp.x);
     vec2 g=hm(p.xz);float s=length(atmWind(time,p.xz,wind,gustAmp));float lift=pow(smoothstep(${F(P.lift[0])},${F(P.lift[1])},s),0.6)*g.y;   // eased up: a moderate wind already shows
     float plume=step(${F(1-P.plume[0])},pp.y);
     float h=mix(mix(${F(P.height[0])},${F(P.height[1])},pp.y*pp.y),${F(P.plume[1])}*(0.4+0.6*pp.y),plume)*(0.35+0.65*lift)*(0.25+0.75*sin(3.1416*age));
     p.y=g.x+h*0.5+pp.z*0.25;vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,0.5);
     float ps=clamp(pp.z*(1.0+plume*1.5)*(0.6+0.4*lift)*px/dd,1.0,900.0);
     vA=lift*sin(3.1416*age)*${F(P.alpha)}*smoothstep(2.0,8.0,dd)*(1.0-smoothstep(${F(B*.7)},${F(B*.98)},length(p.xz-cameraPosition.xz)));
     gl_Position=atmQuad(mv,ps);}`,
   fragmentShader:`uniform float light;varying float vA;varying vec2 vUv;void main(){float r=length(vUv-0.5);if(r>0.5||vA<0.003)discard;
    gl_FragColor=vec4(vec3(${P.color.map(F).join(',')})*(0.4+0.6*light),vA*smoothstep(0.5,0.05,r));}`});
  A.rec('dust',{preset:'dust',n:P.n,box:P.box,lift:P.lift,note:'dust off bare dry ground (the host\'s mask) where the wind there passes lift[0] (ATMOS units), thickest at lift[1]; sprites ride the camera on a baked height map'});
  return A.sprites('dust',{ipos:[3,pos],pp:[4,pp]},m,4);};
})();
