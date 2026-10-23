// ================================================================= THE KEPT STATE (kits/eternian/PLAN.md section 7, P5)
// The True Heirs keep the Ancients' bodies whole: polished, never patched. A pass over the bodies' materials, after the
// builders' fragments have made them (this file sorts after 88-plymouth.js and 89b-arcoindian.js):
//   the glazing (the kit's glass, Plymouth's window panes) becomes alabaster held in a bronze tracery grid: nobody can
//   make the Ancients' glass, so every lost pane was infilled with the grid (section 2, "the tracery's origin"); the grid
//   is drawn in world metres (mullions every 1.2 m, transoms every 1.6 m), so it keeps its size on any opening;
//   the shell's concrete is cleaned toward the Ancient white;
//   cyan strips run along the shell every 24 m of height, alive on about a fifth of their 30 m runs, the run chosen by a
//   hash of where it is (the Machine Talkers wake a circuit here and there), so the same runs are alive on every machine.
// The shader hooks chain onto whatever a material already had (the library binding, the glass fresnel).
const KEPT={bronze:new THREE.Color(0x9c7a3c),cyan:new THREE.Color(0x39d6e8),alive:.2};
function keptHook(m,key,frag){if(!m)return;const prev=m.onBeforeCompile;
 m.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vKW;').replace('#include <project_vertex>','#include <project_vertex>\n#ifdef USE_INSTANCING\nvKW=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\n#else\nvKW=(modelMatrix*vec4(transformed,1.)).xyz;\n#endif');   /* an instanced piece's world position takes its instance matrix */
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vKW;\nuniform vec3 uKBronze;uniform vec3 uKCyan;\nfloat kH(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}');
  sh.uniforms.uKBronze={value:KEPT.bronze};sh.uniforms.uKCyan={value:KEPT.cyan};
  sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+frag);};
 const k0=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>'';m.customProgramCacheKey=()=>k0()+'|kept-'+key;m.needsUpdate=true;}
/* the glazing: alabaster lit from within, the bronze grid over it */
const KEPT_TRACERY='{float mu=fract((vKW.x+vKW.z)/1.2),tr=fract(vKW.y/1.6),bw=.05;'+
 'float bar=max(step(mu,bw)+step(1.-bw,mu),step(tr,bw*.8)+step(1.-bw*.8,tr));bar=clamp(bar,0.,1.);'+
 'diffuseColor.rgb=mix(vec3(.94,.9,.82),uKBronze,bar);totalEmissiveRadiance=mix(vec3(1.,.9,.72)*.55,vec3(0.),bar);}';
/* the shell: the cyan strips, a fifth of the runs alive */
const KEPT_STRIPS='{float sy=fract(vKW.y/24.);float run=kH(floor(vec2(vKW.x+vKW.z,vKW.y)/vec2(30.,24.)));'+
 'float on=step(sy,.04)*step(run,'+KEPT.alive.toFixed(2)+');totalEmissiveRadiance+=uKCyan*on*2.4;diffuseColor.rgb=mix(diffuseColor.rgb,uKCyan,on);}';
function keptGlaze(m){if(!m)return;if(m.emissive)m.emissive.setHex(0xffffff);m.transparent=false;m.opacity=1;keptHook(m,'glaze',KEPT_TRACERY);}
function keptShell(m){if(!m)return;if(m.color)m.color.lerp(new THREE.Color(0xeeebe5),.18);keptHook(m,'shell',KEPT_STRIPS);}
for(const k of ['glass'])keptGlaze(MAT[k]);
for(const k of ['plyWall','plyKit','aiWall','aiBlk','aiTop','aiKit'])keptShell(MAT[k]);
/* nothing patched: Plymouth's corrugated tin becomes verdigris sheet, its tarps the State's green cloth */
if(MAT.plyTin){MAT.plyTin.map=null;MAT.plyTin.color.setHex(0x5e9c86);MAT.plyTin.roughness=.55;MAT.plyTin.metalness=.35;MAT.plyTin.needsUpdate=true;}
if(MAT.plyCloth){MAT.plyCloth.map=null;MAT.plyCloth.color.setHex(0x3f8a5a);MAT.plyCloth.needsUpdate=true;}
