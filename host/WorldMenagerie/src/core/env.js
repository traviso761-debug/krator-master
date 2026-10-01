// Shared shader inputs (updated once per frame) and the light/weather chunk every lit material receives.
// three.js r128 is the UMD build on window.THREE.
import {smooth} from './rng.js';
const THREE=window.THREE;
export function createEnv(){
const ENV={izFw:{value:new THREE.Vector4(0,0,0,250)},izFwC:{value:new THREE.Color(1,1,1)},izGust:{value:1},izFog:{value:0},izDust:{value:0},izFlash:{value:0},izHour:{value:15},izTime:{value:0},izDay:{value:1},izNight:{value:0},izRain:{value:0},izWet:{value:0},izLight:{value:1},izWind:{value:new THREE.Vector2(0.82,0.36)},izSunDir:{value:new THREE.Vector3(0,1,0)},izCloudMap:{value:null},izCloudOn:{value:1},izPx:{value:600}};
// a light's schedule is (on hour, off hour, flicker seed); off may run past midnight (25 = 01:00), a negative seed means no flicker on start-up
const GLSL_LIT=`float izLitAt(float h,vec3 t){float hh=h<12.0?h+24.0:h;float l=smoothstep(t.x,t.x+0.12,hh)*(1.0-smoothstep(t.y,t.y+0.12,hh));float age=hh-t.x;if(t.z>=0.0&&age>0.0&&age<0.22){l*=step(0.42,fract(sin(floor(age*70.0)*12.9898+t.z*78.233)*43758.5453));}return l;}
`;
function litAt(h,on,off){const hh=h<12?h+24:h;return smooth(on,on+0.12,hh)*(1-smooth(off,off+0.12,hh));}
const ENV_PARS=`uniform float izGust;uniform float izTime;uniform float izDay;uniform float izNight;uniform float izRain;uniform float izWet;uniform float izHour;uniform vec2 izWind;uniform sampler2D izCloudMap;uniform float izCloudOn;
varying vec3 izWp;varying float izUp;varying float izH;varying float izTopGap;varying float izSide;
`;
const ENV_VERT=`{
#ifdef USE_INSTANCING
mat4 izM=modelMatrix*instanceMatrix;
#else
mat4 izM=modelMatrix;
#endif
izWp=(izM*vec4(transformed,1.0)).xyz;
vec3 izN=normalize((izM*vec4(objectNormal,0.0)).xyz);
izUp=izN.y;izSide=1.0-abs(izN.y);
float izSy=length(izM[1].xyz);
izH=position.y*izSy;izTopGap=(1.0-position.y)*izSy;
}
`;
// clouds dim the direct light; rain darkens and cools upward faces; weathered materials get grime under their tops and a dark base band
const ENV_FRAG=`float izCloudShade=1.0;
{
float izC=texture2D(izCloudMap,(izWp.xz+izWind*izTime*14.0)*0.0011).r;
izCloudShade=1.0-mix(0.5*smoothstep(0.42,0.72,izC)*izCloudOn,0.45,izRain)*izDay;
float izW=izWet*(0.45+0.55*clamp(izUp,0.0,1.0));
diffuseColor.rgb*=1.0-0.3*izW;
diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.9,0.95,1.08),izW);
#ifdef IZ_WEATHER
float izU=izWp.x*1.4+izWp.z*1.13;float izCell=floor(izU);float izFr=fract(izU);
float izR=fract(sin(izCell*91.7+3.1)*43758.5453);
float izEdge=smoothstep(0.0,0.25,izFr)*(1.0-smoothstep(0.75,1.0,izFr));
float izStreak=izR*izEdge*(1.0-smoothstep(0.3,5.5+3.0*izR,izTopGap))*izSide;
float izBase=(1.0-smoothstep(0.0,2.2,izH))*izSide;
diffuseColor.rgb*=1.0-0.3*izStreak-0.24*izBase;
#endif
}
`;
// cloth hanging from its top edge (box geometry, y 0..1) ripples across its thin local x
const WIND_FLAG=a=>`{
#ifdef USE_INSTANCING
mat4 izMf=modelMatrix*instanceMatrix;
#else
mat4 izMf=modelMatrix;
#endif
float izSx=max(length(izMf[0].xyz),0.001);float izPh=izMf[3].x*0.37+izMf[3].z*0.23;
float izHang=clamp(1.0-position.y,0.0,1.0);float izGust=0.65+0.35*sin(izTime*0.7+izPh);
transformed.x+=izHang*izGust*(${a.toFixed(3)})/izSx*sin(izTime*2.6*sqrt(izGust)+position.z*2.4+izPh)*(1.0+izRain*0.6)*izGust;
}
`;
// reeds (cone geometry, y 0..1) bend from the root
const WIND_REED=a=>`{
#ifdef USE_INSTANCING
mat4 izMr=modelMatrix*instanceMatrix;
#else
mat4 izMr=modelMatrix;
#endif
float izSx=max(length(izMr[0].xyz),0.001);float izSz=max(length(izMr[2].xyz),0.001);float izPh=izMr[3].x*0.3+izMr[3].z*0.2;float izB=position.y*position.y;
transformed.x+=izB*(${a.toFixed(3)})/izSx*(0.6*sin(izTime*1.7+izPh)+0.4*sin(izTime*3.1+izPh*1.7))*(1.0+izRain)*izGust;
transformed.z+=izB*(${(a*0.5).toFixed(3)})/izSz*sin(izTime*1.3+izPh*2.3)*izGust;
}
`;
// hanging ivy (plane geometry, y -1..0, facing +z) sways out from the wall
const WIND_HANG=a=>`{
#ifdef USE_INSTANCING
mat4 izMh=modelMatrix*instanceMatrix;
#else
mat4 izMh=modelMatrix;
#endif
float izSz=max(length(izMh[2].xyz),0.001);float izPh=izMh[3].x*0.21+izMh[3].z*0.17;
float izHang=clamp(-position.y,0.0,1.0);
transformed.z+=izHang*izHang*(${a.toFixed(3)})/izSz*(0.6+0.4*sin(izTime*1.3+izPh))*(0.5+0.5*sin(izTime*2.1+position.x*3.0+izPh))*izGust;
}
`;
function applyEnv(sh,o){
  o=o||{};
  for(const k of ['izGust','izTime','izDay','izNight','izRain','izWet','izHour','izWind','izCloudMap','izCloudOn'])sh.uniforms[k]=ENV[k];
  let vs=ENV_PARS+(o.vpars||'')+sh.vertexShader,fs=(o.weather?'#define IZ_WEATHER\n':'')+ENV_PARS+(o.fpars||'')+sh.fragmentShader;
  if(o.K)vs=vs.replace('#include <uv_vertex>',`#ifdef USE_UV
{
#ifdef USE_INSTANCING
mat4 izMu=modelMatrix*instanceMatrix;
#else
mat4 izMu=modelMatrix;
#endif
vec3 izSc=vec3(length(izMu[0].xyz),length(izMu[1].xyz),length(izMu[2].xyz));
vUv=uv*vec2(max(izSc.x,izSc.z),izSc.y)*${o.K.toFixed(4)};
}
#endif`);
  if(o.lod){   // beyond a distance the object dithers out and is then not drawn at all (jungle: into the cut-outs; small details: simply gone)
    const L0=(Array.isArray(o.lod)?o.lod[0]:540).toFixed(1),L1=(Array.isArray(o.lod)?o.lod[1]:600).toFixed(1),L2=((Array.isArray(o.lod)?o.lod[1]:600)+10).toFixed(1);
    vs='varying float izLodF;\n'+vs.replace('#include <begin_vertex>',`#include <begin_vertex>
{
#ifdef USE_INSTANCING
vec3 izLo=(modelMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;
#else
vec3 izLo=(modelMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;
#endif
float izLd=distance(cameraPosition.xz,izLo.xz);izLodF=smoothstep(${L0},${L1},izLd);if(izLd>${L2})transformed*=0.0;
}`);
    fs='varying float izLodF;\n'+fs.replace('#include <map_fragment>','if(izLodF>0.001&&fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453)<izLodF)discard;\n#include <map_fragment>');}
  if(o.uvVar)vs=vs.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_UV\nvUv.x=(vUv.x+izVar)/3.0;\n#endif');
  const wind=o.wind?WIND_FLAG(o.wind):o.hang?WIND_HANG(o.hang):o.reed?WIND_REED(o.reed):'';
  vs=vs.replace('#include <begin_vertex>','#include <begin_vertex>\n'+wind+(o.vbody||'')+ENV_VERT);
  const mask=fs.includes('* getShadowMask();');   // clouds shade only the direct light when the chunk allows it
  fs=fs.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+(o.fbody||'')+ENV_FRAG+(mask?'':'diffuseColor.rgb*=izCloudShade;\n'));
  if(mask)fs=fs.replace('* getShadowMask();','* getShadowMask() * izCloudShade;');
  sh.vertexShader=vs;sh.fragmentShader=fs;
}
function setEnv(m,o){const key='env'+JSON.stringify(o,(k,v)=>typeof v==='string'&&v.length>40?v.length+':'+v.slice(0,40):v);m.onBeforeCompile=sh=>applyEnv(sh,o);m.customProgramCacheKey=()=>key+(o.id||'');m.userData.env=true;m.needsUpdate=true;return m;}
// unlit lamps: dim amber by day, full colour once their own schedule turns them on
function lampHook(m,id){m.onBeforeCompile=sh=>{sh.uniforms.izHour=ENV.izHour;
  sh.vertexShader='attribute vec3 izLightT;varying float izLit;uniform float izHour;\n'+GLSL_LIT+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nizLit=izLitAt(izHour,izLightT);');
  sh.fragmentShader='varying float izLit;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=mix(0.22,1.0,izLit);');};
  m.customProgramCacheKey=()=>'lamp'+(id||'');m.userData.env=true;return m;}
function withLightT(g,n){const c=g.clone();c.setAttribute('izLightT',new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1,n)*3),3));return c;}
function setLT(im,i,on,off,sd){const a=im.geometry.attributes.izLightT;if(!a||i>=a.count)return;a.array[i*3]=on;a.array[i*3+1]=off;a.array[i*3+2]=sd;}
return {ENV,GLSL_LIT,litAt,ENV_PARS,ENV_VERT,ENV_FRAG,applyEnv,setEnv,lampHook,withLightT,setLT};
}
