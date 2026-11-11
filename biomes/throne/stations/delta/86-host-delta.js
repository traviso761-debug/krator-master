// ================================================================= HOST — the lava, the laze, the cones and the rafts (station 12, the lava delta)
//   THE LAVA     the channel down the old flank, over the pali's lip (a lava fall down its face) and across the bench to the entry: one ribbon
//                on core/atmos's lava in its channel mode (core/atmos/fx/89-atmos-fx-lava.js: aF across 0..1 and along in metres, the crust carried
//                down it, torn and cooler at the banks), as the tube's hot reach; it takes its material on the first frame (core/atmos binds after)
//   THE ENTRY    a warm light at the front where the lava meets the sea, and THE LAZE: a column of white acid steam off the entry, drifting
//                downwind (south-east, the westerlies'), its puffs looping on the clock (the caldera's steam points)
//   THE CONES    spatter blocks on the littoral cones' flanks (the kit's stones)
//   THE RAFTS    pumice rafts lying still on the sea off the delta and in the swash of the coves (static: core/water has no floaters yet)
const DELTAS={lava:0,laze:0,spatter:0,rafts:0};
const LAVA_W=LAVA.w*2;
TICKS.push(()=>{const m=DELTAS.lavaMesh;if(m&&!m.userData.lavaMat&&typeof ATMOS!=='undefined'&&ATMOS.lavaMaterial&&ATMOS.T)
 m.material=m.userData.lavaMat=ATMOS.lavaMaterial({name:LAVA.name,swell:false,scale:.06,crack:2.5,heat:1.8,channel:{width:LAVA_W,speed:1.2},sun:SUN_POS});});
(function(){const pos=[],F=[],idx=[];let n=0,len=0,prev=null;
 for(let s=LAVA.s0;s<=ENTRY.s+6;s+=2){const t=LAVA.t(s),c=xzOf(s,t),c2=xzOf(s+2,LAVA.t(s+2)),dx=c2[0]-c[0],dz=c2[1]-c[1],dl=Math.hypot(dx,dz)||1,nx=-dz/dl,nz=dx/dl;
  const w=LAVA.w*(1+.25*Math.sin(s*.013))*(s>paliS(t)?1.4:1),y=Math.max(terrainH(c[0],c[1])+.35,SEA+.25);
  if(prev)len+=Math.hypot(c[0]-prev[0],y-prev[1],c[1]-prev[2]);prev=[c[0],y,c[1]];
  pos.push(c[0]+nx*w,Math.max(terrainH(c[0]+nx*w,c[1]+nz*w)+.3,y-1),c[1]+nz*w,c[0]-nx*w,Math.max(terrainH(c[0]-nx*w,c[1]-nz*w)+.3,y-1),c[1]-nz*w);F.push(0,len,1,len);
  if(n)idx.push((n-1)*2,(n-1)*2+1,n*2,(n-1)*2+1,n*2+1,n*2);n++;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aF',new THREE.Float32BufferAttribute(F,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x2a0c04}));m.userData.inspectLabel=LAVA.name;m.userData.lava=true;m.userData.probeSkip=true;scene.add(m);DELTAS.lavaMesh=m;DELTAS.lava=n;
 /* the hazard (core/hazard: KHAZ.GROUND.lavaFlow): the channel in 200 m pieces, each its outline every 20 m in metres from its first point,
    its band from its lowest ground to its highest (the fall over the pali drops 280 m in one piece) */
 const SEG=200;for(let a=LAVA.s0;a<ENTRY.s+6;a+=SEG){const HL=[],HR=[],b=Math.min(a+SEG,ENTRY.s+6);let lo=1e9,hi=-1e9,o=null;
  for(let s=a;s<=b+1e-6;s+=20){const t=LAVA.t(s),c=xzOf(s,t),c2=xzOf(s+2,LAVA.t(s+2)),dx=c2[0]-c[0],dz=c2[1]-c[1],dl=Math.hypot(dx,dz)||1,nx=-dz/dl,nz=dx/dl,w=LAVA.w*1.6+4,y=Math.max(terrainH(c[0],c[1]),SEA);
   if(!o)o=c;lo=Math.min(lo,y);hi=Math.max(hi,y);HL.push([c[0]+nx*w-o[0],c[1]+nz*w-o[1]]);HR.unshift([c[0]-nx*w-o[0],c[1]-nz*w-o[1]]);}
  const hz=KHAZ.GROUND.lavaFlow(HL.concat(HR));hz.shape.y0=-3;hz.shape.h=hi-lo+8;
  REGISTER({name:LAVA.name,x:o[0],z:o[1],y:lo,r:SEG+20,h:hi-lo+8,lava:true,tags:{hazard:hz}});}})();
// the entry's glow: a warm light by the front, brighter at night
const ENTRY_LIGHT=new THREE.PointLight(0xff6a2a,1.2,260,2);ENTRY_LIGHT.position.set(ENTRY.x,SEA+6,ENTRY.z);scene.add(ENTRY_LIGHT);
_onLight.push(m=>{ENTRY_LIGHT.intensity=m==='night'?3:1.2;});
// THE LAZE: the caldera's steam points, white, a tall column leaning downwind (south-east: +s)
const LAZEU={uT:{value:0},uScale:{value:innerHeight*.5},uCol:{value:new THREE.Color(0xf4f4f0)}};
const LAZE_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,LAZEU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec4 aS;uniform float uT,uScale;varying float vA;',
  'void main(){float ph=fract(uT*aS.y+aS.x);vec3 p=position+vec3(sin(ph*6.0+aS.x*9.0)*aS.z*0.4+ph*aS.w*0.55,ph*aS.w,cos(ph*5.0+aS.x*7.0)*aS.z*0.4+ph*aS.w*0.55);',
  ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.6+ph*2.6)/max(1.0,-mvPosition.z);',
  ' vA=smoothstep(0.0,0.1,ph)*(1.0-ph)*0.55;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform vec3 uCol;varying float vA;',
  'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5)discard;gl_FragColor=vec4(uCol,vA*smoothstep(0.5,0.1,r));','#include <fog_fragment>','}'].join('\n')});
LAZE_MAT.uniforms.fogColor.value=scene.fog.color;LAZE_MAT.uniforms.fogDensity.value=scene.fog.density;
['uT','uScale','uCol'].forEach(k=>LAZE_MAT.uniforms[k]=LAZEU[k]);
TICKS.push(dt=>{LAZEU.uT.value+=dt;});
(function(){reseed(12803);const P=[],A=[];
 for(let i=0;i<900;i++){const a=rr(0,TAU),d=rr(0,26);P.push(ENTRY.x+Math.cos(a)*d,SEA+.5,ENTRY.z+Math.sin(a)*d);A.push(rng(),.035*rr(.8,1.2),rr(7,16),rr(90,240));}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));
 const pts=new THREE.Points(g,LAZE_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=2;scene.add(pts);DELTAS.laze=P.length/3;
 REGISTER({name:'The laze (acid steam off the entry: do not breathe it)',x:ENTRY.x+60,z:ENTRY.z+60,y:SEA,r:140,h:240,laze:true,
  tags:{hazard:{kind:'acid',danger:.7,dose:1,falloff:'linear',shape:{type:'cyl',r:140,h:240,y0:0},tell:{sign:'white steam off the entry, leaning downwind'}}}});})();
// the cones' spatter and the rafts (the kit's stones, in its registry)
(function(){reseed(12804);const C3=c=>new THREE.Color(c),prev=BIO.kit('throne'),cur=BIO.cur;BIO.cur='throne/floor';
 LCONES.forEach(C=>{for(let k=0;k<40;k++){const a=rr(0,TAU),d=C.r*Math.sqrt(rng())*1.1,x=C.x+Math.cos(a)*d,z=C.z+Math.sin(a)*d,s=rr(.3,1.4);
  BIO.put('boulder',[x,terrainH(x,z)+s*.25,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[s,s*rr(.5,.9),s],C3(pick([0x5a2a22,0x3a2a26,0x6a3424,0x1e1a1a])));DELTAS.spatter++;}});
 // the rafts: off the delta, drifted down the coast; and caught in the coves' swash
 for(let k=0;k<1400;k++){const t=ENTRY.t+rr(-900,900),s=frontS(t)+rr(-10,420),c=xzOf(s,t);if(terrainH(c[0],c[1])>SEA-.4)continue;
  const sz=rr(.3,2.4)*(rng()<.1?3:1);BIO.put('boulder',[c[0],SEA-sz*.06,c[1]],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[sz,sz*.14,sz*rr(.7,1)],C3(pick([0xd8d0c0,0xc8c0b0,0xb8b0a0])));DELTAS.rafts++;}
 BIO.cur=cur;BIO.kit(prev);_mark('layout');})();
