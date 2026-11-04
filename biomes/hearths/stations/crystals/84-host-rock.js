// ================================================================= HOST — the rock: the cavern's chunks on KGROUND's layers
// CAVE.C's chunks (KCAVERN surface nets, 1 m), merged into one mesh per 64 m tile (a handful of draws, each culled by its box). The rock is the rift
// fill's lake limestone (rock.limestone), iron-stained rust red on the roofs and the walls between the crystals (rock.ironstain), with gypsum crust
// on the floors and the lower walls and in KKARST's crust band (ground.gypsum): KGROUND's layers (43-core-ground.js), each on a weight this
// fragment writes per vertex (aIron, aGyp), sampled from the side on the walls (tri) with the relief's bump and cavity. The chunk's occlusion
// darkens the hollows (vertex colour). ?kground=0 for the paint alone. The vents' wells show the sky: a disc of daylight over each throat.
const USE_KG=typeof KGROUND!=='undefined'&&Q.get('kground')!=='0';
const MAT_ROCK=new THREE.MeshStandardMaterial({color:0xa88a76,roughness:.9,metalness:0,vertexColors:true,side:THREE.DoubleSide});
MAT_ROCK.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aGyp;attribute float aIron;varying float vGyp;varying float vIron;')
  .replace('#include <begin_vertex>','#include <begin_vertex>\nvGyp=aGyp;vIron=aIron;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vGyp;varying float vIron;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 _rP=diffuseColor.rgb;'+(USE_KG?'\n/*KGROUND*/\n':'diffuseColor.rgb=mix(mix(_rP,vec3(0.42,0.2,0.1),vIron*0.8),vec3(0.86,0.83,0.78),vGyp);')+'}');};
if(USE_KG)KGROUND.hook(MAT_ROCK,{key:'hearths-crystals-rock',at:'/*KGROUND*/',relief:{bump:.06,cavity:.55},tri:{from:.3,to:.65,far:160},layers:[
 KGROUND.layer('hearths','rock.limestone',{w:'1.0',amt:.85,gain:1.0,name:'lake limestone'}),
 KGROUND.layer('hearths','rock.ironstain',{w:'vIron',amt:.9,gain:1.0,name:'iron-stained limestone (rust red)'}),
 KGROUND.layer('hearths','ground.gypsum',{w:'vGyp',amt:.95,gain:1.0,name:'gypsum crust'})].filter(Boolean)});
const ROCK=(function(){const C=CAVE.C,G=65535,TILE=64,groups=new Map(),t0=performance.now();let chunks=0,tris=0;
 for(const key of C.chunks){const ch=C.meshChunk(key);if(!ch.idx.length)continue;chunks++;
  const gk=Math.floor(ch.origin[0]/TILE)+','+Math.floor(ch.origin[2]/TILE);let g=groups.get(gk);if(!g){g={pos:[],nrm:[],col:[],gyp:[],iron:[],idx:[],n:0};groups.set(gk,g);}
  const nv=ch.pos.length/3;
  for(let i=0;i<nv;i++){const x=ch.pos[i*3],y=ch.pos[i*3+1],z=ch.pos[i*3+2],ny=ch.nrm[i*3+1],hf=y-STOREY_Y;
   g.pos.push(x,y,z);g.nrm.push(ch.nrm[i*3],ny,ch.nrm[i*3+2]);
   const o=.42+.58*ch.occ[i];g.col.push(o,o*.97,o*.94);
   /* the stain: up the walls and over the roofs, patchy (core/rand's noise); the crust: on the floors, the lower walls and KKARST's crust band */
   const n1=KRAND.fbm(x*.045,y*.06,z*.045,3,71),crust=ch.w[i*4+3];
   g.iron.push(clamp(smooth(.6,5,hf)*(.5+.9*n1)+smooth(-.15,-.7,ny)*.5,0,1));
   g.gyp.push(clamp(Math.max(smooth(.45,.85,ny)*smooth(9,1.5,hf)*.8,smooth(2.6,.4,hf)*.7,crust*.6)*(ch.prim[i]===G?0:1),0,1));}
  for(let t=0;t<ch.idx.length;t++)g.idx.push(ch.idx[t]+g.n);g.n+=nv;tris+=ch.idx.length/3;}
 const grp=new THREE.Group();grp.name='the cave\'s rock';
 groups.forEach((g,gk)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(g.pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(g.nrm,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(g.col,3));geo.setAttribute('aGyp',new THREE.Float32BufferAttribute(g.gyp,1));geo.setAttribute('aIron',new THREE.Float32BufferAttribute(g.iron,1));
  geo.setIndex(g.n>65535?new THREE.Uint32BufferAttribute(g.idx,1):new THREE.Uint16BufferAttribute(g.idx,1));geo.computeBoundingSphere();geo.computeBoundingBox();
  const m=new THREE.Mesh(geo,MAT_ROCK);m.userData.host=true;m.userData.rock=true;m.userData.inspectLabel='Lake limestone and gypsum, iron-stained (the drained storey\'s rock)';m.name='rock '+gk;
  if(USE_KG&&KGROUND.cavityMesh)KGROUND.cavityMesh(m,{rings:[2,8],depth:[.3,2]});grp.add(m);});
 scene.add(grp);
 /* the daylight at each vent's top: a disc of sky over the throat (unlit, unfogged) */
 const sky=new THREE.MeshBasicMaterial({color:0xe9eef4,fog:false});
 CAVE.throats.forEach(T=>{const d=new THREE.Mesh(new THREE.CircleGeometry(T.r+1.2,24),sky);d.rotation.x=Math.PI/2;d.position.set(T.c[0],T.ground+2.5,T.c[1]);
  d.userData.host=true;d.userData.probeSkip=true;d.userData.inspectLabel='Daylight down the vent (the shelf\'s surface, '+Math.round(T.ground-T.y0)+' m up)';grp.add(d);});
 return {group:grp,meshes:groups.size,chunks,tris:Math.round(tris),ms:Math.round(performance.now()-t0)};})();
window._rock={meshes:ROCK.meshes,chunks:ROCK.chunks,tris:ROCK.tris,ms:ROCK.ms,kground:USE_KG};
