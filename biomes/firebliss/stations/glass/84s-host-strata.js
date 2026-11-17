// ================================================================= HOST — the wall's beds: STATION 8, South Glass (PLAN.md section 11.2)
// KSTRATA's obsidian-pancake recipe (core/terrain/35-core-strata.js: 2-6 m ledges of flow-banded black and mahogany obsidian, grey rhyodacite, pale
// perlite crumble, frothy pumice partings, a rare fumarolic seam) painted on the dome's wall by its shader (core/terrain/host/35-core-strata-shade.js,
// the core path: the bed the GPU draws is the bed S.at reports). S.inject adds five data-texture samplers, which over MAT_GROUND's eight library layers,
// KHORIZON, snow and shadow would pass a GPU's 16 fragment texture units; so the wall's triangles (aRock > 0.05) draw on their own MAT_WALL sharing the
// ground's vertex buffers (no seam, +1 draw call, <= 15 samplers even with shadow). ?strata=0 the wall without its beds.
const GLASS_STRATA=(function(){if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined'||!BIO.strata||typeof KHOOK==='undefined')return null;
 const S=BIO.strata({recipe:'obsidian-pancake',seed:8301,range:[4000,5200],dip:[.574,-.819,.004],warp:[4,1.3],
  fold:{dir:[.574,-.819],wl:300,amp:12,phase:.2,sharp:.25,at:[0,0]},res:.25,private:true});
 /* the recipe's mean colour by share (linear), so a bed moves the layer's own grain toward its colour and the wall keeps the library's texture */
 const R=KSTRATA.recipe('obsidian-pancake'),lin=v=>Math.pow(v/255,2.2);let w=0,m=[0,0,0];
 for(const k in R.kinds){const K=R.kinds[k],c=K.col[0],p=K.p||0;m[0]+=p*lin(c>>16&255);m[1]+=p*lin(c>>8&255);m[2]+=p*lin(c&255);w+=p;}
 const MEAN='vec3('+m.map(v=>(v/w).toFixed(4)).join(',')+')';
 const MAT_WALL=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d6d2,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d6d2});
 MAT_WALL.onBeforeCompile=sh=>{
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;'+GA.map((a,i)=>'attribute float '+a+';varying float '+GV[i]+';').join(''))
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;'+GA.map((a,i)=>GV[i]+'='+a+';').join(''));
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+KCOLOR.GLSL+'\nvarying vec3 vGWP;'+GV.map(v=>'varying float '+v+';').join(''))
   .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 _gP=diffuseColor.rgb;'+(USE_KG?'\n/*KGROUND*/\n':'')+
    'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.36,0.35,0.34),vAshfall*0.55);diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
 if(USE_KG)KGROUND.hook(MAT_WALL,{key:'firebliss-glass-wall'+(KG_RELIEF?'r':'')+(KG_TRI?'t':''),at:'/*KGROUND*/',
  ...(KG_RELIEF?{relief:{bump:.075,cavity:.8,mesh:1}}:{}),...(KG_TRI?{tri:{from:.35,to:.7}}:{}),layers:[
   L_('ground.cinder','vScree*(1.0-vSnow*0.8)*(1.0-vRock)',{tint:'vec3(0.62,0.62,0.68)',name:'autobreccia and perlite talus'}),
   L_('stone.obsidian','vIce*(1.0-vSnow)*(1.0-vRock*0.7)',{name:'the glass carapace'}),
   L_('rock.basalt','vRock*(1.0-vSnow*0.6)',{tint:'_gP*1.5',name:'the wall (its beds: KSTRATA obsidian-pancake)'}),
   L_('ground.snow','vSnow',{amt:.9,name:'snow'})]});
 KHOOK.add(MAT_WALL,'firebliss-glass-strata',(sh)=>{S.inject(sh);
  KHOOK.f(sh,'vWet);}','vWet);}\nfloat fbGlassy=0.0;{vec3 sc=strataColor(vSWP,vSWN);float ws=clamp(vRock*1.15,0.0,1.0)*(1.0-vSnow*0.6);'+
   'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*clamp(sc/'+MEAN+',vec3(0.3),vec3(2.4)),ws*0.85);'+
   'fbGlassy=max(vIce*(1.0-vSnow),ws*(1.0-smoothstep(0.02,0.08,dot(sc,vec3(0.3333)))));}','firebliss-glass-strata');
  if(sh.fragmentShader.indexOf('#include <roughnessmap_fragment>')>=0)
   KHOOK.f(sh,'#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.2,fbGlassy*0.85);','firebliss-glass-strata');},
  {order:5,key:'firebliss-glass-strata'});
 let wallTris=0;
 GROUND_MESHES.slice().forEach(gm=>{const g=gm.geometry,rk=g.attributes.aRock&&g.attributes.aRock.array,ix=g.index&&g.index.array;if(!rk||!ix)return;
  const keep=[],wall=[];for(let i=0;i<ix.length;i+=3){const a=ix[i],b=ix[i+1],c=ix[i+2];
   if(rk[a]>.05||rk[b]>.05||rk[c]>.05)wall.push(a,b,c);else keep.push(a,b,c);}
  if(!wall.length)return;
  const u32=g.attributes.position.count>65535;
  g.setIndex(u32?new THREE.BufferAttribute(new Uint32Array(keep),1):keep);
  const wg=new THREE.BufferGeometry();for(const k in g.attributes)wg.setAttribute(k,g.attributes[k]);
  wg.setIndex(u32?new THREE.BufferAttribute(new Uint32Array(wall),1):wall);wg.computeBoundingSphere();
  const wm=new THREE.Mesh(wg,MAT_WALL);wm.receiveShadow=true;wm.userData.probeSkip=true;wm.userData.inspectLabel='South Glass: the obsidian-pancake wall (KSTRATA)';
  scene.add(wm);GROUND_MESHES.push(wm);wallTris+=wall.length/3;});
 return{S,mean:MEAN,mat:MAT_WALL,tris:wallTris};})();
