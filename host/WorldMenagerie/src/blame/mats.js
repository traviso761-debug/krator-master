// ---------- the City's materials: one grey, drawn five ways ----------
// Nihei draws the City in one material. Concrete, metal and whatever the Megastructure is made of all come out
// the same grey, and what tells them apart is the drawing on them: the seams ruled across a floor plate, the
// rows of arched windows on a wall the Builders copied from somewhere, the panels on the machine towers, the
// long vertical streaks down everything that hangs. So there is one material here too - Lambert, grey, lit
// from above - and a pattern written into its fragment shader, one per style:
//
//   mega      the Megastructure: floor and ceiling plates ruled into panels by seams at 1,600 m, 400 m and
//             100 m, each panel a slightly different grey; a shaft wall is banded. A vertical face on the edge
//             of the block is a cut face, and is drawn as one.
//   arcade    walls of arched windows in rows, grouped into bands, some bricked up, and stained downwards
//   machine   panels, vents, and here and there a lit window
//   concrete  joints, and streaks where water has run for a thousand years
//   hanging   long vertical striations, the grain of something that grew downwards
//
// Every pattern knows how big a pixel is (fwidth) and fades to its own average tone before it can shimmer,
// which is what lets a 16 m window and a 48 km floor share a shader.
//
// The section. Every material is double-sided, and a back face - which you only ever see from inside a solid,
// that is, where the clipping plane has cut it open - is drawn as poché: flat, unlit, unfogged and hatched,
// the way an architect's section fills in what the cut passes through. The Megastructure is near-black with a
// fine rule across it; everything else is a lighter grey. That is the whole trick behind the section view,
// and it is why nothing has to be capped.

const COMMON=`
varying vec3 vBW;varying vec3 vBN;varying float vSeed;
uniform float uBlockHalf;uniform vec4 uFloor;uniform vec4 uCeil;uniform vec4 uCut;uniform float uCutOn;uniform float uDim;
// Down in a layer it gets darker: the floor of a canyon a kilometre deep sees very little of the ceiling's glow.
// A little under the ceiling too. This is the cheapest depth cue there is, and Nihei uses it on every page.
float shade(float y){
  vec4 inL=step(uFloor,vec4(y))*step(vec4(y),uCeil);if(dot(inL,vec4(1.0))<0.5)return 1.0;
  float f=dot(inL,uFloor),c=dot(inL,uCeil),h=c-f;
  return (0.66+0.34*smoothstep(0.0,min(800.0,h*0.3),y-f))*(0.86+0.14*smoothstep(0.0,min(600.0,h*0.2),c-y));}
float bh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float bn2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(bh(i),bh(i+vec2(1,0)),f.x),mix(bh(i+vec2(0,1)),bh(i+vec2(1,1)),f.x),f.y);}
// a ruled line every 'period' world units, 'width' wide, that fades out before it can alias
float rule(float c,float period,float width){
  float fw=max(fwidth(c),1e-4);float d=abs(fract(c/period+0.5)-0.5)*period;
  float hw=max(width*0.5,fw*0.5);
  return (1.0-smoothstep(hw,hw+fw,d))*min(1.0,width/fw)*smoothstep(2.5,7.0,period/fw);}
float grid(vec2 p,float period,float width){return max(rule(p.x,period,width),rule(p.y,period,width));}
// how finely a pattern of this size is resolved here: 1 = crisp, 0 = smaller than a pixel
float resolved(vec2 p,float size){float fw=max(length(fwidth(p)),1e-4);return smoothstep(1.2,5.0,size/fw);}
// The inside of the Megastructure, as the cut shows it: laminations every 60 m and heavier every 240, long
// galleries running through it, and conduits - round voids in rows, which are what the Builders ran through it.
// q is the point on the cut, t the way along the cut face.
vec3 megaPoche(vec3 q,vec2 t){
  float u=dot(q.xz,t),v=q.y;
  vec3 c=vec3(0.095,0.1,0.105);
  c+=0.05*rule(v,60.0,2.0)+0.08*rule(v+30.0,240.0,5.0);
  vec2 cell=floor(vec2(u/260.0,v/200.0)),f=vec2(fract(u/260.0),fract(v/200.0))-0.5;
  float hc=bh(cell+vec2(7.0,3.0));
  if(hc<0.42){float r=(0.1+0.16*bh(cell))*200.0;float d=length(f*vec2(260.0,200.0))-r;float fw=max(fwidth(u),1e-3);
    float ring=1.0-smoothstep(0.0,fw*1.5+2.5,abs(d));float inside=1.0-smoothstep(-fw,fw,d);
    c=mix(c,vec3(0.2,0.205,0.21),inside);c=mix(c,vec3(0.4,0.41,0.42),ring*resolved(vec2(u,v),r*0.3));}
  float row=floor(v/90.0);if(bh(vec2(row,11.0))<0.18){float g=abs(fract(v/90.0)-0.5)*90.0;
    float gw=6.0+10.0*bh(vec2(row,5.0));c=mix(c,vec3(0.17,0.175,0.18),1.0-smoothstep(gw,gw+max(fwidth(v),1e-3),g));}
  return c;}
`;

// The pattern for each style. In: p (world position), n (world normal), base (the instance's grey).
// Out: the colour, and 'glow' for anything that lights itself.
const STYLE={
mega:`
 if(n.y>0.5||n.y<-0.5){
  vec2 q=p.xz;
  vec2 c4=floor(q/400.0),c16=floor(q/1600.0);
  float tone=0.86+0.1*bh(c4+vec2(3.1,7.7))+0.06*bh(c16);
  col*=mix(0.93,tone,resolved(q,400.0));
  col*=1.0-0.55*grid(q,1600.0,14.0);
  col*=1.0-0.3*grid(q,400.0,5.0);
  col*=1.0-0.16*grid(q+vec2(50.0),100.0,1.5);
  // the trenches: some of the 1,600 m seams are cut deep, and lit along their length
  vec2 t=abs(fract(q/1600.0+0.5)-0.5)*1600.0;
  float trench=step(0.55,bh(vec2(c16.y,1.0)))*(1.0-smoothstep(20.0,26.0,t.y))+step(0.62,bh(vec2(c16.x,2.0)))*(1.0-smoothstep(20.0,26.0,t.x));
  col*=1.0-0.35*clamp(trench,0.0,1.0)*resolved(q,60.0);
  float dots=(1.0-smoothstep(0.0,2.5,abs(fract(dot(q,vec2(1.0))/37.0)-0.5)*37.0))*clamp(trench,0.0,1.0)*resolved(q,40.0);
  glow+=vec3(0.9,0.95,1.0)*dots*0.8;
  if(n.y<-0.5)col*=0.72;
 }else{
  // the edge of the block, where the world stops: drawn as the cut it is
  if(max(abs(p.x),abs(p.z))>uBlockHalf-2.0){cut=1.0;}
  else{float b=rule(p.y,80.0,3.0)*0.5+rule(p.y,20.0,0.8)*0.25;col*=0.8-0.2*b;
   col*=0.9+0.1*bn2(vec2(atan(p.z,p.x)*80.0,p.y*0.01));}
 }`,
arcade:`
 if(abs(n.y)<0.5){
  vec2 t=normalize(vec2(-n.z,n.x));float u=dot(p.xz,t);float v=p.y;
  const float CW=7.0,CH=11.5;
  vec2 cell=floor(vec2(u/CW,v/CH));vec2 f=vec2(fract(u/CW),fract(v/CH));
  float band=mod(cell.y+floor(vSeed*9.0),9.0);           // eight rows of windows, then a blind band
  float cx=(f.x-0.5)*CW,cy=f.y*CH,rw=CW*0.25;
  float win=step(abs(cx),rw)*step(CH*0.14,cy)*step(cy,CH*0.6)+step(length(vec2(cx,cy-CH*0.6)),rw)*step(CH*0.6,cy);
  win*=step(0.5,band)*step(0.2,bh(cell+vSeed*31.0));
  float rs=resolved(vec2(u,v),CW*0.5);
  col*=mix(0.84,1.0-0.72*win,rs);
  col*=1.0-0.3*rule(v+floor(vSeed*9.0)*CH,CH*9.0,2.0);
  // stains running down from every sill
  float st=bn2(vec2(u*0.11,v*0.002+vSeed*9.0));col*=0.8+0.2*smoothstep(0.25,0.75,st);
  col*=0.9+0.1*bn2(vec2(u*0.004,v*0.0007+vSeed*4.0));
 }else{col*=0.9;col*=1.0-0.25*grid(p.xz,24.0,1.2);}`,
machine:`
 // No grid: a grid of panels is the one thing that tells the eye how big something is, and it always says
 // "small". Instead, bands of different treatment up the height - ribs at 3, 6 or 12 m, rows of slots,
 // blank plating - with a storey line every 4.2 m that is only there when you are close enough to see it.
 bool side=abs(n.y)<0.5;
 vec2 q=side?vec2(dot(p.xz,normalize(vec2(-n.z,n.x))),p.y):p.xz;
 if(side){
  float off=vSeed*48.0,bid=floor((q.y+off)/48.0);
  float bt=bh(vec2(bid,vSeed*17.0));
  col*=0.78+0.3*bt;
  float sp=bt<0.3?3.0:bt<0.62?6.0:12.0;
  col*=1.0-0.26*rule(q.x+vSeed*50.0,sp,sp*0.14);
  col*=1.0-0.12*rule(q.y,4.2,0.3);
  float slot=step(0.8,bt)*step(0.45,fract(q.y/4.2))*step(fract(q.y/4.2),0.8)*resolved(q,4.0);
  col*=1.0-0.45*slot;
  col*=1.0-0.4*rule(q.y+off,48.0,1.6);
  col*=0.9+0.1*bn2(vec2(q.x*0.05,q.y*0.01+vSeed*3.0));
  float lit=slot*step(0.985,bh(floor(vec2(q.x/2.5,q.y/4.2))+vSeed*7.0));
  glow+=mix(vec3(1.0,0.72,0.4),vec3(0.8,0.9,1.0),step(0.5,bh(floor(q/5.0))))*lit*1.1;
 }else{
  col*=0.86+0.1*bh(floor(q/24.0)+vSeed*3.0)*resolved(q,24.0);
  col*=1.0-0.18*grid(q+vSeed*40.0,24.0,0.6);
 }`,
concrete:`
 vec2 q=abs(n.y)<0.5?vec2(dot(p.xz,normalize(vec2(-n.z,n.x))),p.y):p.xz;
 col*=1.0-0.18*rule(q.y,12.0,0.4)-0.12*rule(q.x,18.0,0.4);
 float st=bn2(vec2(q.x*0.15,q.y*0.004+vSeed*5.0));col*=0.8+0.2*smoothstep(0.2,0.8,st);`,
hanging:`
 vec2 q=abs(n.y)<0.5?vec2(dot(p.xz,normalize(vec2(-n.z,n.x))),p.y):p.xz;
 float s=bn2(vec2(q.x*0.35,q.y*0.002+vSeed*11.0));
 col*=mix(0.88,0.6+0.4*s,resolved(q,3.0));
 col*=0.85+0.15*bn2(vec2(q.x*0.02,q.y*0.0008));`,
};

export function makeMats(THREE){
  const U={uCut:{value:new THREE.Vector4(0,0,1,0)},uCutOn:{value:0},uBlockHalf:{value:24000},uFloor:{value:new THREE.Vector4(-1e9,-1e9,-1e9,-1e9)},uCeil:{value:new THREE.Vector4(-1e9,-1e9,-1e9,-1e9)}};
  // mk('mega',{color}) - a Lambert material with the style's pattern and the section's poché
  function mk(style,o){
    o=o||{};
    const m=new THREE.MeshLambertMaterial({color:o.color!==undefined?o.color:0xb4b8bc,side:THREE.DoubleSide,
      vertexColors:false,emissive:0x000000});
    m.extensions={derivatives:true};
    const poche=o.poche||(style==='mega'?'vec3(0.10,0.105,0.11)':'vec3(0.46,0.47,0.48)');
    const hatch=style==='mega'?'0.1':'0.08';
    m.onBeforeCompile=sh=>{
      Object.assign(sh.uniforms,U);sh.uniforms.uDim=o.dim||{value:1};
      sh.vertexShader='varying vec3 vBW;varying vec3 vBN;varying float vSeed;\n'+sh.vertexShader.replace('#include <fog_vertex>',`#include <fog_vertex>
 vec4 bw=vec4(transformed,1.0);vec3 bnrm=objectNormal;vec3 ic=vec3(0.0);
 #ifdef USE_INSTANCING
 bw=instanceMatrix*bw;bnrm=mat3(instanceMatrix)*bnrm;ic=instanceMatrix[3].xyz;
 #endif
 vBW=(modelMatrix*bw).xyz;vBN=normalize(mat3(modelMatrix)*bnrm);vSeed=fract(sin(dot(ic,vec3(12.9898,78.233,37.719)))*43758.5453);`);
      sh.fragmentShader=COMMON+sh.fragmentShader
        .replace('#include <color_fragment>',`#include <color_fragment>
 vec3 glow=vec3(0.0);float cut=0.0;
 {vec3 p=vBW;vec3 n=normalize(vBN);vec3 col=diffuseColor.rgb;
 ${STYLE[style]}
 ${style==='mega'?'':'col*=shade(p.y);'}
 diffuseColor.rgb=col;}`)
        .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=glow;')
        .replace('#include <dithering_fragment>',`#include <dithering_fragment>
 // poché: what the cut passes through, flat and hatched, and never fogged
 gl_FragColor.rgb*=uDim;
 if(!gl_FrontFacing||cut>0.5){
  float h=step(0.5,fract((gl_FragCoord.x+gl_FragCoord.y)/7.0));
  vec3 pc=${poche};
  ${style==='mega'?`
  // where on the cut this pixel is: the back face is behind it, so follow the ray back to the plane
  vec3 q=vBW;vec2 tan2=normalize(vec2(-vBN.z,vBN.x)+vec2(1e-5,0.0));
  if(uCutOn>0.5&&cut<0.5){vec3 dir=vBW-cameraPosition;float dn=dot(uCut.xyz,dir);
   if(abs(dn)>1e-6){float tt=-(dot(uCut.xyz,cameraPosition)+uCut.w)/dn;if(tt>0.0&&tt<1.0)q=cameraPosition+dir*tt;}
   tan2=normalize(vec2(-uCut.z,uCut.x)+vec2(1e-5,0.0));}
  pc=megaPoche(q,tan2);`:''}
  gl_FragColor=vec4(pc*(1.0-${hatch}*h)*uDim,1.0);
 }`);
    };
    // every variant of the shader has to be told apart, or three.js hands them all the first one it compiled
    m.customProgramCacheKey=()=>'blame-'+style;
    return m;
  }
  return {mk,U};
}

// ---------- canvas textures ----------
export function cloudTexture(THREE){
  // a heap of soft discs, brighter on top - the cumulus Nihei draws inside the Plain, which has weather
  const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
  let s=91;const r=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
  for(let i=0;i<46;i++){
    const a=r()*Math.PI*2,d=Math.pow(r(),0.7)*70,x=128+Math.cos(a)*d*1.3,y=138+Math.sin(a)*d*0.55-(1-d/70)*14,rad=26+r()*34*(1-d/110);
    const gr=g.createRadialGradient(x,y-rad*0.25,0,x,y,rad);
    gr.addColorStop(0,'rgba(255,255,255,0.55)');gr.addColorStop(0.55,'rgba(236,240,244,0.32)');gr.addColorStop(1,'rgba(220,226,232,0)');
    g.fillStyle=gr;g.beginPath();g.arc(x,y,rad,0,Math.PI*2);g.fill();
  }
  const t=new THREE.CanvasTexture(c);return t;
}
export function dotTexture(THREE){
  const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');
  const gr=g.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.3,'rgba(255,255,255,0.8)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c);
}
// the ribbed ducts: rings round a flexible hose, one rib a texel row
export function ribTexture(THREE){
  const c=document.createElement('canvas');c.width=64;c.height=8;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,64,0);
  gr.addColorStop(0,'#1c1d1f');gr.addColorStop(0.25,'#6d7075');gr.addColorStop(0.45,'#a9acb0');gr.addColorStop(0.62,'#55585c');gr.addColorStop(1,'#1c1d1f');
  g.fillStyle=gr;g.fillRect(0,0,64,8);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  return t;
}
