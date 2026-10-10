// ================================================================= HOST — the sea and the creek
// THE SEA: a grid over the shore (its depth per vertex: the surf's foam where it is shallow) and a far ring to the horizon,
// one shader: teal-green over the black sand, darker out deep, the sky in it at a low angle, the sun's glitter, waves.
// THE CREEK: a ribbon at its bed + depth, flowing (the bed's fall makes it white over the rapids), warm below where the
// basin's run-off joins it (a little greener, and steaming: the kit's show steams it). The springs, pools and terraces
// are the kit's (65; the terraces' pools in the ground's shader, 84).
const WATERU={uT:{value:0},uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uSky:{value:new THREE.Color(0xc8d4d4)},uLight:{value:1}};
const MAT_SEA=new THREE.ShaderMaterial({fog:true,transparent:true,depthWrite:false,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,WATERU]),
 vertexShader:['#include <fog_pars_vertex>','attribute float aD;varying vec3 vWP;varying float vD;',
  'void main(){vD=aD;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec3 vWP;varying float vD;',
  'void main(){vec2 p=vWP.xz;float w1=sin(p.x*0.06+p.y*0.11-uT*1.1),w2=sin(p.x*0.17-p.y*0.09-uT*1.7),w3=sin(p.x*0.41+p.y*0.37-uT*2.6);',
  ' vec3 n=normalize(vec3(0.05*w1+0.03*w2+0.02*w3,1.0,0.06*cos(p.y*0.11+p.x*0.06-uT*1.1)+0.03*w3));vec3 V=normalize(cameraPosition-vWP);',
  ' float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),4.0);vec3 deep=vec3(0.05,0.17,0.19),shal=vec3(0.14,0.32,0.3);',
  ' vec3 col=mix(shal,deep,smoothstep(0.5,9.0,vD));col=mix(col,uSky*0.92,0.08+fr*0.72);col+=pow(max(dot(n,normalize(uSun+V)),0.0),220.0)*1.4*vec3(1.0,0.94,0.82);',
  // the surf: foam lines running in where it is shallow
  ' float sf=(1.0-smoothstep(0.1,1.4,vD))*(0.5+0.5*sin(vD*5.0-uT*1.6+sin(p.x*0.05)*2.0));col=mix(col,vec3(0.9,0.92,0.9),sf*0.55);',
  ' gl_FragColor=vec4(col*uLight,mix(0.86,0.97,smoothstep(0.0,2.0,vD))*smoothstep(-0.1,0.15,vD));','#include <fog_fragment>','}'].join('\n')});
MAT_SEA.uniforms.fogColor.value=scene.fog.color;MAT_SEA.uniforms.fogDensity.value=scene.fog.density;
['uT','uSun','uSky','uLight'].forEach(k=>MAT_SEA.uniforms[k]=WATERU[k]);
const SEA_MESH=(function(){const x0=-1700,x1=1700,z0=560,z1=1700,cs=8,nx=(x1-x0)/cs,nz=(z1-z0)/cs,W=nx+1,pos=[],aD=[],idx=[];
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=x0+i*cs,z=z0+j*cs;pos.push(x,SEA,z);aD.push(SEA-terrainH(x,z));}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*W+i,b=a+W;if(aD[a]<-1&&aD[a+1]<-1&&aD[b]<-1&&aD[b+1]<-1)continue;idx.push(a,b,a+1,b,b+1,a+1);}
 // the far ring: four quads round the grid out to the horizon (deep)
 const F=9000,base=pos.length/3;[[-F,z0,x0,F],[x1,z0,F,F],[x0,z1,x1,F],[-F,-F*.05+z0,F,z0]].forEach((r,q)=>{if(q===3)return;const k=base+q*4;
  pos.push(r[0],SEA-.02,r[1],r[2],SEA-.02,r[1],r[2],SEA-.02,r[3],r[0],SEA-.02,r[3]);aD.push(20,20,20,20);idx.push(k,k+3,k+1,k+1,k+3,k+2);});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aD',new THREE.Float32BufferAttribute(aD,1));g.setIndex(idx);
 const m=new THREE.Mesh(g,MAT_SEA);m.userData.probeSkip=true;m.userData.inspectLabel='The Ring Sea';m.renderOrder=1;m.frustumCulled=false;scene.add(m);return m;})();

const MAT_CREEK=new THREE.ShaderMaterial({fog:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,WATERU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec3 aF;varying vec3 vWP;varying vec3 vF;',
  'void main(){vF=aF;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vF;',
  // vF: x the distance down the creek, y across (-1..1), z the fall (0 still .. 1 a rapid) ; the warm reach a little green
  'void main(){float s=vF.x,a=vF.y,rap=vF.z;float fl=sin(s*0.9-uT*4.0+a*2.0)*0.5+sin(s*2.3-uT*6.5-a*3.0)*0.3;',
  ' vec3 n=normalize(vec3(a*0.05+fl*0.04*(1.0+rap*3.0),1.0,fl*0.05));vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),4.0);',
  ' vec3 col=mix(vec3(0.1,0.16,0.12),vec3(0.16,0.26,0.2),0.5+0.5*fl);col=mix(col,uSky*0.85,0.06+fr*0.6);',
  ' float foam=rap*smoothstep(0.2,0.9,sin(s*1.7-uT*9.0+a*4.0)*0.5+0.5+fl*0.4);col=mix(col,vec3(0.86,0.9,0.88),clamp(foam,0.0,0.85));',
  ' col+=pow(max(dot(n,normalize(uSun+V)),0.0),140.0)*0.8*vec3(1.0,0.95,0.85);',
  ' gl_FragColor=vec4(col*uLight,(1.0-smoothstep(0.82,1.0,abs(a)))*0.92);','#include <fog_fragment>','}'].join('\n')});
MAT_CREEK.uniforms.fogColor.value=scene.fog.color;MAT_CREEK.uniforms.fogDensity.value=scene.fog.density;
['uT','uSun','uSky','uLight'].forEach(k=>MAT_CREEK.uniforms[k]=WATERU[k]);
const CREEK_MESH=(function(){const P=CREEK.P,pos=[],aF=[],idx=[];let n=0;
 for(let i=0;i<P.length;i+=2){const a=P[Math.max(0,i-2)],b=P[Math.min(P.length-1,i+2)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,px=-dz/l,pz=dx/l;
  const lev=CREEK.bed[i]+CREEK.depth;if(lev<SEA+.05)break;
  const j0=Math.max(0,i-6),j1=Math.min(P.length-1,i+6),fall=(CREEK.bed[j0]-CREEK.bed[j1])/Math.max(1,CREEK.s[j1]-CREEK.s[j0]),rap=smooth(.02,.09,fall),w=CREEK.w[i]*1.22;
  for(let k=0;k<5;k++){const t=k/4*2-1;pos.push(P[i][0]+px*w*t,lev,P[i][1]+pz*w*t);aF.push(CREEK.s[i],t,rap);}
  if(n)for(let k=0;k<4;k++){const A=(n-1)*5+k,B=n*5+k;idx.push(A,B,A+1,A+1,B,B+1);}n++;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aF',new THREE.Float32BufferAttribute(aF,3));g.setIndex(idx);
 const m=new THREE.Mesh(g,MAT_CREEK);m.userData.probeSkip=true;m.userData.inspectLabel=CREEK.name;m.renderOrder=1;scene.add(m);return m;})();
TICKS.push(dt=>{WATERU.uT.value+=dt;});
_onLight.push(m=>{WATERU.uLight.value=m==='night'?.2:1;});
_mark('water');
