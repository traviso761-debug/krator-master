// ---------- the section: the ground cut open, the way a survey draws it ----------
// The section view used to be a trick: the shaft and its chambers are drawn back-face only, so from outside the
// near wall is not there and you could see in. That shows the insides, but not what they are inside of - there
// was nothing between one chamber and the next, and nothing round the shaft but night. A survey section is
// the other way round: a plane through the ground, everything in front of it taken away, and the cut face
// coloured by what it passes through, with the voids left open.
//
// So in the section view:
//
//   the clip     the renderer gets one clipping plane through the shaft's axis, square to the way you are
//                looking, and everything on your side of it is not drawn - the surface, the rim, the near
//                half of every chamber. It turns as you turn.
//   the face     a plane on the cut, coloured in its fragment shader like the park's block diagram
//                (refs: flest_strata.png): a thin cap of grey laminated rock under the ground, a lumpy seam of
//                yellow fat, a pale membrane, and below that the organism laid down in beds - thick wet folds of
//                salmon and rose, each lit over its top and creased at its base, wrapping round lenses of
//                lavender tissue, with dark slit cavities and vessels - following the land and sagging round
//                the voids. It runs the whole width of the map, so the view is a block.
//   the voids    the shaft, the lungs, the seas, the baths, the passages and the unmapped tunnels are cut open
//                so you look into them; where a void holds fluid, the fluid is drawn in the cut up to its level.
//
// The voids come from ctx.pit.cavities (organism.js, springs.js, tunnels.js) and the shaft's radius from
// wallAt. Only this page does any of it, and only while the camera is in section (camera.js calls
// ctx.pitSection). The clipping plane is installed once, parked out of the way when the section is off, so
// turning the section on and off never recompiles a shader.
export function section(api){
  const {THREE,ctx,scene,camera,renderer,animHooks}=api;
  const P=ctx.pit;if(!P)return;
  const {AX,AZ,TOP,Y,wallAt,D0,DEEP}=P;
  const gh=P.groundH||api.groundH;

  // ---- the shaft's radius by depth, as a texture: two bytes a metre, a metre a texel ----
  const RN=4096,RD0=-50;
  const rad=new Uint8Array(RN*4);
  for(let i=0;i<RN;i++){const d=RD0+i,r=d<D0-34?0:Math.min(1023,wallAt(d));const v=Math.round(r*64);
    rad[i*4]=v>>8;rad[i*4+1]=v&255;rad[i*4+2]=0;rad[i*4+3]=255;}
  const radTex=new THREE.DataTexture(rad,RN,1,THREE.RGBAFormat);radTex.magFilter=radTex.minFilter=THREE.NearestFilter;radTex.needsUpdate=true;

  // ---- the voids, as a float texture: three texels each ----
  // Only the voids the cut actually passes through are handed to the shader - it walks the list for every
  // pixel of the face - so the texture is refilled whenever the cut turns (fill(), from orient()).
  const CAV=P.cavities||[];
  const NC=Math.max(1,CAV.length),cav=new Float32Array(NC*3*4);
  function fill(ux,uz){
    let n=0;const side=v=>(v.x-AX)*ux+(v.z-AZ)*uz;
    for(const c of CAV){
      if(c.kind==='ell'){if(Math.abs(side(c.c))>Math.max(c.r[0],c.r[2]))continue;
        cav.set([1,c.c.x,c.c.y,c.c.z, c.r[0],c.r[1],c.r[2],c.level!==undefined?c.level:-1e6],n*12);}
      else{const sa=side(c.a),sb=side(c.b);if(Math.min(Math.abs(sa),Math.abs(sb))>c.r&&sa*sb>0)continue;
        cav.set([2,c.a.x,c.a.y,c.a.z, c.b.x,c.b.y,c.b.z,c.r],n*12);}
      const f=c.fluid;cav.set(f?[f.r,f.g,f.b,1]:[0,0,0,0],n*12+8);n++;
    }
    U.uCavN.value=n;cavTex.needsUpdate=true;
  }
  const cavTex=new THREE.DataTexture(cav,NC*3,1,THREE.RGBAFormat,THREE.FloatType);cavTex.magFilter=cavTex.minFilter=THREE.NearestFilter;cavTex.needsUpdate=true;

  const U={uRad:{value:radTex},uCav:{value:cavTex},uCavN:{value:CAV.length},uCavW:{value:NC*3},
    uTop:{value:TOP},uAxis:{value:new THREE.Vector2(AX,AZ)},uD0:{value:D0}};
  const mat=new THREE.ShaderMaterial({uniforms:U,side:THREE.DoubleSide,
    extensions:{derivatives:true},
    vertexShader:`attribute float aG;varying vec3 vW;varying float vS;varying float vG;
void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;vS=position.x;vG=aG;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`
uniform sampler2D uRad;uniform sampler2D uCav;uniform float uCavN;uniform float uCavW;uniform float uTop;uniform vec2 uAxis;uniform float uD0;
varying vec3 vW;varying float vS;varying float vG;
float h1(float n){return fract(sin(n)*43758.5453);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float n=i.x+i.y*57.0+i.z*113.0;
 return mix(mix(mix(h1(n),h1(n+1.0),f.x),mix(h1(n+57.0),h1(n+58.0),f.x),f.y),mix(mix(h1(n+113.0),h1(n+114.0),f.x),mix(h1(n+170.0),h1(n+171.0),f.x),f.y),f.z);}
float fb(vec3 p){return 0.5*n3(p)+0.25*n3(p*2.03)+0.125*n3(p*4.1);}
vec4 cv(float i,float k){return texture2D(uCav,vec2((i*3.0+k+0.5)/uCavW,0.5));}
float shaftR(float d){vec4 t=texture2D(uRad,vec2((d+50.5)/4096.0,0.5));return (t.r*255.0*256.0+t.g*255.0)/64.0;}
// a line that fades out rather than shimmering when it is finer than a pixel
float line(float v,float w){float fw=fwidth(v);return (1.0-smoothstep(w,w+fw*1.5,abs(fract(v)-0.5)*2.0))*clamp(1.0-fw*0.8,0.0,1.0);}
void main(){
 vec3 p=vW;float d=uTop-p.y;float s=abs(vS);
 // ---- the nearest void, and how far into the wall this point is ----
 float R=shaftR(d);float dmin=R>0.0?s-R:1e6;vec3 fl=vec3(0.0);float fluid=0.0;float lev=-1e6;
 for(int i=0;i<160;i++){
  if(float(i)>=uCavN)break;
  vec4 a=cv(float(i),0.0),b=cv(float(i),1.0);float dd;
  if(a.x<1.5){vec3 q=(p-a.yzw)/b.xyz;float k=length(q);if(k>3.0)continue;dd=(k-1.0)*min(b.x,min(b.y,b.z));}
  else{vec3 pa=p-a.yzw,ba=b.xyz-a.yzw;float hh=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);dd=length(pa-ba*hh)-b.w;}
  if(dd<dmin){dmin=dd;vec4 c=cv(float(i),2.0);fl=c.rgb;fluid=c.a;lev=b.w;if(a.x>1.5)fluid=0.0;}
 }
 if(dmin<0.0){
  // inside a void: open, unless there is fluid in it and this is below the surface of it
  if(fluid>0.5&&p.y<lev){float rip=0.06*sin(p.x*0.2+p.z*0.17)+0.08*(1.0-smoothstep(0.0,3.0,lev-p.y));
   gl_FragColor=vec4(fl*(0.72+rip)+vec3(0.05),1.0);return;}
  discard;
 }
 // ---- the block: a thin cap of rock under the ground, and flesh the rest of the way down ----
 // After the park's block diagram (refs: flest_strata.png): the ground is a skin of grey laminated rock a
 // hundred-odd metres thick, a lumpy seam of yellow fat under it, a pale membrane, and below that the organism
 // itself, laid down in beds like sediment - salmon and rose bands, streaked with pale fibre, lenses of
 // lavender tissue, dark slit-shaped cavities and vessels winding through. Everything is measured from the
 // ground over the point, so the beds follow the land, and they sag round the voids.
 float db=vG-p.y;                                                           // depth below the ground here
 float wav=5.0*sin(p.x*0.0031+p.z*0.0023+1.3)+3.0*sin(p.x*0.0071-p.z*0.0059)+10.0*(fb(vec3(p.x*0.003,db*0.004,p.z*0.003))-0.5);
 float sag=60.0*exp(-max(s-max(R,95.0),0.0)/240.0)*smoothstep(20.0,160.0,db);   // round the shaft only: a nearest-void sag leaves seams
 float h=db+wav-sag;
 const float RC=112.0;                                                      // the rock cap
 float fat=RC+7.0+4.0*(n3(vec3(p.x*0.03,0.0,p.z*0.03))-0.5)+2.0*(n3(vec3(p.x*0.12,1.0,p.z*0.12))-0.5);
 vec3 col;
 if(h<4.0){col=vec3(0.64,0.58,0.48);}                                        // soil and caliche
 else if(h<RC){                                                              // laminated grey rock
  float bnd=fb(vec3(p.x*0.002,h*0.09,p.z*0.002));
  col=mix(vec3(0.24,0.26,0.27),vec3(0.62,0.64,0.64),smoothstep(0.3,0.7,bnd));
  col*=0.86+0.14*line(h*0.7+0.6*n3(vec3(p.x*0.02,h*0.1,p.z*0.02)),0.35);
  float crack=1.0-abs(n3(vec3(p.x*0.04,h*0.012,p.z*0.04))*2.0-1.0);
  col*=1.0-0.5*smoothstep(0.975,0.99,crack);
  col=mix(col,vec3(0.18,0.19,0.2),1.0-smoothstep(0.0,2.0,RC-h));            // dark at the base of the cap
 }
 else if(h<fat){float lump=n3(vec3(p.x*0.35,h*0.5,p.z*0.35));                // the fat seam
  col=mix(vec3(0.74,0.60,0.20),vec3(0.93,0.82,0.40),lump);}
 else if(h<fat+1.6){col=vec3(0.96,0.84,0.86);}                                // the membrane
 else if(h<fat+2.6){col=vec3(0.62,0.26,0.50);}                                // a purple rule under it
 else{
  float hf=h-fat;
  // Lenses of lavender tissue first, because the beds wrap round them: above a lens they bow up, below it
  // they bow down. The lens field's slope with depth says which side of one a point is on.
  vec3 lq=vec3(p.x*0.0012,hf*0.011,p.z*0.0012)+vec3(5.0);
  float Ln=n3(lq);
  float dL=n3(lq+vec3(0.0,0.2,0.0))-n3(lq-vec3(0.0,0.2,0.0));
  // the beds: thick rounded folds that swell, thin and pinch, like muscle laid down as sediment
  float warp=46.0*(fb(vec3(p.x*0.0011,hf*0.0016,p.z*0.0011))-0.5)+16.0*(n3(vec3(p.x*0.0045,hf*0.004,p.z*0.0045)+vec3(7.0))-0.5)+60.0*dL;
  warp+=9.0*sin(p.x*0.021+p.z*0.017+6.0*n3(vec3(p.x*0.002,hf*0.01,p.z*0.002)))*n3(vec3(p.x*0.003,hf*0.006,p.z*0.003)+vec3(2.0));   // folds wobble
  float hw=hf+warp,hb=hw/64.0+1.1*(n3(vec3(p.x*0.0009,hw*0.007,p.z*0.0009)+vec3(17.0))-0.5),bi=floor(hb);   // and are not all one thickness
  float t=pow(fract(hb),mix(0.75,1.35,h1(bi*7.13)));                        // each fold's belly sits a little differently
  vec3 base=mix(vec3(0.93,0.50,0.52),vec3(0.82,0.34,0.40),h1(bi*3.71));      // salmon to rose, bed by bed
  base=mix(base,vec3(0.95,0.60,0.60),0.35*n3(vec3(p.x*0.003,bi*1.7,p.z*0.003)));
  // lit from above: bright over the top of the fold, shading down into a dark crease at its base
  float lit=mix(0.78,1.08,smoothstep(0.0,0.3,t))*(1.0-0.42*smoothstep(0.62,1.0,t));
  col=base*lit;
  float cr=1.0-min(t,1.0-t)*2.0;                                            // 1 at the crease between folds
  col=mix(col,vec3(0.45,0.12,0.20),smoothstep(0.93,0.985,cr)*0.8);
  // fibre: soft streaks running along the folds, fading out before they are finer than a pixel
  float fz=fwidth(hw);
  float fib=n3(vec3(p.x*0.012,hw*0.45,p.z*0.012))-0.5;
  col*=1.0+0.22*fib*clamp(1.6-fz,0.0,1.0);
  float fib2=n3(vec3(p.x*0.004,hw*0.12,p.z*0.004)+vec3(3.0))-0.5;
  col*=1.0+0.18*fib2;
  // wet sheen: a broken glossy streak along the top of each fold
  float sh=exp(-pow((t-0.16)/0.07,2.0))*smoothstep(0.45,0.75,n3(vec3(p.x*0.006,bi*2.3,p.z*0.006)));
  sh*=0.6+0.4*n3(vec3(p.x*0.03,hw*0.3,p.z*0.03));
  col=mix(col,vec3(1.0,0.90,0.90),sh*0.55);
  // the lenses: swollen, soft-edged, paler at the heart, with a shadow under them in the flesh
  if(Ln>0.62){
   float m=smoothstep(0.68,0.69+fwidth(Ln),Ln);
   col*=1.0-0.28*(1.0-m)*smoothstep(0.62,0.68,Ln)*step(dL,0.0);             // the shadow below the lens
   vec3 lc=mix(vec3(0.66,0.38,0.60),vec3(0.86,0.64,0.80),smoothstep(0.69,0.84,Ln));
   lc*=1.0+0.35*clamp(dL*6.0,-0.6,0.6);                                     // lit on its upper face
   lc*=1.0-0.35*(1.0-smoothstep(0.69,0.72,Ln));                             // a darker rim
   lc*=1.0+0.1*(n3(vec3(p.x*0.01,hf*0.2,p.z*0.01))-0.5);
   col=mix(col,lc,m);
  }
  // dark slits: spindle-shaped cavities along the beds, a maroon lip round a speckled dark inside
  float Dk=n3(vec3(p.x*0.0026,hw*0.035,p.z*0.0026)+vec3(11.0));
  if(Dk>0.76){
   float lip=smoothstep(0.76,0.78,Dk),core=smoothstep(0.8,0.805+fwidth(Dk),Dk);
   vec3 dc=mix(vec3(0.34,0.07,0.16),vec3(0.13,0.02,0.06),n3(p*0.5));
   col=mix(col,col*0.72,lip*(1.0-core));
   col=mix(col,mix(vec3(0.55,0.16,0.26),dc,smoothstep(0.8,0.83,Dk)),core);
  }
  // vessels: fewer and thicker than fibre, a dark tube with a lighter edge, only in some of the ground
  float vm=smoothstep(0.42,0.6,n3(vec3(p.x*0.0015,hf*0.0015,p.z*0.0015)+vec3(31.0)));
  float v=1.0-abs(n3(vec3(p.x*0.0038,hf*0.0038,p.z*0.0038)+vec3(21.0))*2.0-1.0);
  float vw=fwidth(v);
  float tube=smoothstep(0.972-vw,0.972+vw,v)*vm;
  col=mix(col,mix(vec3(0.62,0.20,0.28),vec3(0.36,0.06,0.14),smoothstep(0.978,0.99,v)),tube);
 }
 // the edge of every void, inked
 col*=1.0-0.55*(1.0-smoothstep(0.0,1.4,dmin));
 gl_FragColor=vec4(col,1.0);
}`});
  mat.clipping=false;                                   // the face lies on the cut; it must not cut itself

  // ---- the face: a strip through the axis, its top edge on the ground along the cut ----
  const NCOL=241,W=3000,BOT=Y(DEEP+450);
  const pos=new Float32Array(NCOL*2*3),S=new Float32Array(NCOL);
  for(let i=0;i<NCOL;i++){const u=i/(NCOL-1)*2-1;S[i]=Math.sign(u)*W*Math.pow(Math.abs(u),1.7);
    pos.set([S[i],0,0, S[i],BOT,0],i*6);}
  const idx=[];for(let i=0;i+1<NCOL;i++){const a=i*2,b=a+1,c=a+2,e=a+3;idx.push(a,b,e,a,e,c);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setIndex(idx);
  const gAt=new Float32Array(NCOL*2);geo.setAttribute('aG',new THREE.BufferAttribute(gAt,1));   // the ground over each column
  const face=new THREE.Mesh(geo,mat);face.frustumCulled=false;face.visible=false;face.renderOrder=-2;
  face.userData.noWire=true;face.position.set(AX,0,AZ);scene.add(face);

  // ---- the clip ----
  const clip=new THREE.Plane(new THREE.Vector3(0,1,0),1e7);            // parked: keeps everything
  renderer.clippingPlanes=[clip];
  const S0={on:false,th:NaN};
  function orient(){
    const dx=camera.position.x-AX,dz=camera.position.z-AZ,l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l;
    clip.normal.set(-ux,0,-uz);clip.constant=ux*AX+uz*AZ+0.4;
    const th=Math.atan2(ux,uz);
    if(Math.abs(th-S0.th)>0.002||isNaN(S0.th)){
      S0.th=th;face.rotation.y=th;const cx=Math.cos(th),cz=-Math.sin(th);
      for(let i=0;i<NCOL;i++){const x=AX+S[i]*cx,z=AZ+S[i]*cz,g=gh(x,z);pos[i*6+1]=g-0.3;
        // inside the orifice the ground is the floor of the funnel; the beds carry on at the plain's level
        gAt[i*2]=gAt[i*2+1]=Math.max(g,Math.hypot(S[i],0)<300?TOP:g);}
      geo.attributes.position.needsUpdate=true;geo.attributes.aG.needsUpdate=true;
      fill(ux,uz);
    }
  }
  animHooks.push(()=>{if(S0.on)orient();});

  // ---- the key ----
  const KEY=[['#6e7274','Rock'],['#d8c050','Fat'],['#f2d4d8','Membrane'],['#e06a74','Flesh strata'],['#b884b0','Lenses'],['#4a1224','Cavities']];
  const key=document.createElement('div');key.id='sectionkey';key.setAttribute('aria-label','Section key');
  Object.assign(key.style,{position:'fixed',left:'12px',bottom:'64px',padding:'8px 10px',background:'rgba(20,10,12,0.82)',color:'#eadcd0',
    font:'12px/1.5 system-ui,sans-serif',borderRadius:'6px',display:'none',zIndex:15,pointerEvents:'none',maxWidth:'calc(100vw - 24px)'});
  key.innerHTML='<div style="font-weight:600;margin-bottom:2px">Section</div>'+KEY.map(k=>k?`<div><span style="display:inline-block;width:10px;height:10px;margin-right:6px;background:${k[0]};vertical-align:-1px"></span>${k[1]}</div>`:'<div style="height:6px"></div>').join('');
  document.body.appendChild(key);

  ctx.pitSection=on=>{
    S0.on=!!on;face.visible=S0.on;key.style.display=S0.on?'block':'none';
    if(S0.on){S0.th=NaN;orient();}else{clip.normal.set(0,1,0);clip.constant=1e7;}
  };
  ctx.details=Object.assign(ctx.details||{},{sectionVoids:CAV.length});
}
