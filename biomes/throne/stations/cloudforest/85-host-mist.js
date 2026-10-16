// ================================================================= HOST — the spray, the cloud over the ridge (the cloud forest)
// Both move on the clock in their shaders (no per-frame CPU work but the uniforms):
//   THE SPRAY     at each fall's foot, soft puffs that rise and drift
//   THE SPILL     the cloud pouring over the ridge's crest: slow sprites that slide down its lee face and thin to nothing
//                 (the foehn's edge: the heath beyond lies under clear air), thickest at the saddle and the low points
// The fog banks drifting through the woods are the shared atmosphere's (89: ATMOS.fogBank), shown while its fog is up.
const STEAMU={uT:{value:0},uScale:{value:innerHeight*.5},uCol:{value:new THREE.Color(0xeef0f0)},uK:{value:1}};
const STEAM_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,STEAMU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec4 aS;uniform float uT,uScale;varying float vA;',
  'void main(){float ph=fract(uT*aS.y+aS.x);vec3 p=position+vec3(sin(ph*6.0+aS.x*9.0)*aS.z*0.4+ph*aS.z*2.5,ph*aS.w,cos(ph*5.0+aS.x*7.0)*aS.z*0.4+ph*aS.z*1.2);',
  ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.6+ph*2.2)/max(1.0,-mvPosition.z);',
  ' vA=smoothstep(0.0,0.12,ph)*(1.0-ph)*0.5;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform vec3 uCol;varying float vA;',
  'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5)discard;gl_FragColor=vec4(uCol,vA*smoothstep(0.5,0.1,r));','#include <fog_fragment>','}'].join('\n')});
STEAM_MAT.uniforms.fogColor.value=scene.fog.color;STEAM_MAT.uniforms.fogDensity.value=scene.fog.density;
['uT','uScale','uCol'].forEach(k=>STEAM_MAT.uniforms[k]=STEAMU[k]);
(function(){reseed(8401);const P=[],A=[];
 const add=(x,z,y,n,size,rise,rate,spread)=>{for(let i=0;i<n;i++){P.push(x+rr(-spread,spread),y,z+rr(-spread,spread));A.push(rng(),rate*rr(.8,1.2),size*rr(.7,1.3),rise*rr(.7,1.3));}};
 FALLS.forEach(F=>add(F.foot[0],F.foot[2],F.foot[1],Math.round(10+F.drop*.6),2.5+F.drop*.06,6+F.drop*.15,.14,F.w*.7));
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));
 const pts=new THREE.Points(g,STEAM_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=2;scene.add(pts);})();

// ---------------------------------------------------------------- the spill
// each sprite a quadratic path: over the crest (C), a little down its lee (M), out over the heath (E), sliding and swelling
const SPILLU={uT:{value:0},uScale:{value:innerHeight*.5},uCol:{value:new THREE.Color(0xf2f4f4)},uK:{value:1}};
const SPILL_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,SPILLU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec3 aM;attribute vec3 aE;attribute vec4 aS;uniform float uT,uScale,uK;varying float vA;',
  'void main(){float t=fract(uT*aS.y+aS.x);vec3 a=mix(position,aM,t),b=mix(aM,aE,t),p=mix(a,b,t);',
  ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.7+t*1.3)/max(1.0,-mvPosition.z);',
  ' vA=smoothstep(0.0,0.1,t)*(1.0-t)*aS.w*uK;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform vec3 uCol;varying float vA;',
  'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5)discard;gl_FragColor=vec4(uCol,vA*smoothstep(0.5,0.05,r));','#include <fog_fragment>','}'].join('\n')});
SPILL_MAT.uniforms.fogColor.value=scene.fog.color;SPILL_MAT.uniforms.fogDensity.value=scene.fog.density;
['uT','uScale','uCol','uK'].forEach(k=>SPILL_MAT.uniforms[k]=SPILLU[k]);
const SPILL=(function(){reseed(8402);const P=[],M=[],E=[],A=[];let n=0;
 for(let k=0;k<4200;k++){const x=rr(-2500,2400),zc=RIDGE.zc(x),low=1-smooth(0,1,(ridgeCrest(x)-ridgeCrest(RIDGE.saddle.x))/90);if(rng()>.55+.45*low)continue;
  const yc=ridgeCrest(x)+rr(1,9),zm=zc+rr(25,60),ze=zc+rr(140,320),xe=x+rr(-40,40);
  P.push(x,yc,zc-rr(0,25));M.push(x+rr(-10,10),terrainH(x,zm)+rr(3,10),zm);E.push(xe,terrainH(xe,ze)+rr(2,8),ze);A.push(rng(),rr(.012,.025),rr(26,50),rr(.55,.85));n++;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aM',new THREE.Float32BufferAttribute(M,3));g.setAttribute('aE',new THREE.Float32BufferAttribute(E,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));
 const pts=new THREE.Points(g,SPILL_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=2;scene.add(pts);return{n};})();
TICKS.push(dt=>{STEAMU.uT.value+=dt;SPILLU.uT.value+=dt;const sc=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));STEAMU.uScale.value=sc;SPILLU.uScale.value=sc;});
_onLight.push(m=>{const c=m==='night'?0x3c4048:0xeef0f0;STEAMU.uCol.value.setHex(c);SPILLU.uCol.value.setHex(m==='night'?0x40444c:0xf2f4f4);});
_mark('mist');
