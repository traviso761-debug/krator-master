// ================================================================= HOST — the apron's blocks (PLAN.md sections 6 and 14)
// The BLOCKS (45: KSTACKS butte records from KRAND hashes, kept apart with KSPACE) registered, then drawn as one mesh (KSTACKS.mesh, weathered by
// KSTACKS.weather) on one material: the library's vesicular basalt (rock.basalt.vesicular through KMAT.packed, materials.json `blockRock`) projected on
// three axes, each block tinted by the flow it came from (the dark colonnade or the red-brown flow top: SLAB_STRATA's kinds), its notches and
// undersides dark (KSTACKS' occ). The beds are not drawn on the blocks: they rode down tumbled, so the slab's world-frame beds would lie.
// The big blocks' voids (the gaps under their overhangs and between them) hold the night's CO2 (PLAN.md section 11; KCAVERN's talus caves are owed).
function hostLib(n){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('slabfields',n):null;if(!L)return null;
 const c=hostLib.c||(hostLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}));}
const ROCK_LIB=hostLib('blockRock');
const ROCK_GRAIN=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=200+(KRAND.fbm(x/11,.3,y/11,3,71)-.5)*90+(KRAND.h3(x,y,1,72)-.5)*30;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const BLOCK_MAT=(function(){const m=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true});
 m.onBeforeCompile=sh=>{sh.uniforms.uRG={value:ROCK_LIB?ROCK_LIB.map:ROCK_GRAIN};sh.uniforms.uRGs={value:1/4};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBWP;varying vec3 vBWN;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvBWP=(modelMatrix*vec4(transformed,1.0)).xyz;vBWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uRG;uniform float uRGs;varying vec3 vBWP;varying vec3 vBWN;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 n=abs(normalize(vBWN));n/=n.x+n.y+n.z;',
    ' vec3 t=texture2D(uRG,vBWP.zy*uRGs).rgb*n.x+texture2D(uRG,vBWP.xz*uRGs).rgb*n.y+texture2D(uRG,vBWP.xy*uRGs).rgb*n.z;',
    ' diffuseColor.rgb*=t*1.9;}'].join('\n'));};
 m.customProgramCacheKey=()=>'slab-block';return m;})();
(function(){const col=new THREE.Color(),FLOW=[0x3e3a36,0x47423c,0x36322e],TOP=[0x5a3e34,0x66463a];
 BLOCKS.forEach((S,i)=>REGISTER({name:S.name,key:'rock.block',kind:'rock',x:S.x,z:S.z,y:S.y0,r:S.r,h:S.top-S.y0+2}));
 // the voids of the big blocks: CO2 on still nights (pooled a metre and a half over the floor)
 BLOCKS.filter(S=>S.big).slice(0,SITE.gas.voids).forEach(S=>REGISTER({name:'The void under a big block (cold air and, on still nights, CO2)',x:S.x,z:S.z-S.r*.9,y:S.y0-1,r:S.r*.6,h:4,
  tags:{hazard:{kind:'gas',danger:.6,falloff:'none',shape:{type:'cyl',r:S.r*.6,h:3,pool:1.5},tell:{sign:'a cold breath from the gap; no lichen on its floor'}}}}));
 const pos=[],uv=[],idx=[],cl=[];
 BLOCKS.forEach((S,i)=>{const m=KSTACKS.mesh(S,{step:3});KSTACKS.weather(S,m,{ground:landH});const o=pos.length/3;
  const h=KRAND.hash(WORLD,1200+i,3)/4294967296;col.set((h<.7?FLOW:TOP)[Math.floor(h*97)%(h<.7?3:2)]).convertSRGBToLinear();
  for(let v=0;v<m.pos.length/3;v++){pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);uv.push(m.uv[2*v],m.uv[2*v+1]);const k=.35+.65*m.occ[v];cl.push(col.r*k,col.g*k,col.b*k);}
  for(const j of m.idx)idx.push(o+j);});
 if(!pos.length)return;
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));g.setIndex(idx);g.computeVertexNormals();
 const me=new THREE.Mesh(g,BLOCK_MAT);me.userData.host=true;me.userData.rock=true;me.userData.inspectLabel='Blocks of the Anvil\'s flood basalt, carried down by the landslide';
 me.userData.probePoints=[].concat(...BLOCKS.map(S=>[S.x,(S.y0+S.top)/2,S.z]));   /* flat x,y,z: one point a block (core/host 95) */scene.add(me);window._blocks={n:BLOCKS.length,big:BLOCKS.filter(S=>S.big).length,talus:BLOCKS.filter(S=>S.talus).length,tris:idx.length/3};})();
