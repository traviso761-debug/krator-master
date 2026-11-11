// ================================================================= HOST — the rock: the cavern carved, and drawn only where it shows
// LINE.cavern() (48) carves the window (KCAVERN, 1 m). The lining (85) is a drawn shell inside the void, so the rock shows only where the lining
// opens or is gone: the window says which chunks (LINE.rockShows(x0, z0, size)) and how they are stained (LINE.rockWeight: aVein, the vein's
// band; LINE.gypWeight: aGyp, a hypogene chamber's gypsum crust). C.sdf answers for the whole void (the checks, the eyes). The rock is the rift
// fill, a pale grey-brown lake limestone and mudstone, on KGROUND's layer, unless the window names its own (LINE.rockLayer: the hot door's granite,
// the fault's breccia; materials.json's rock.* families).
const CAVE_C=LINE.cavern();
const USE_KG=typeof KGROUND!=='undefined'&&Q.get('kground')!=='0';
const MAT_ROCK=new THREE.MeshStandardMaterial({color:0x9a8e7e,roughness:.92,metalness:0,vertexColors:true,side:THREE.DoubleSide});
MAT_ROCK.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aVein;attribute float aGyp;varying float vVein;varying float vGyp;')
  .replace('#include <begin_vertex>','#include <begin_vertex>\nvVein=aVein;vGyp=aGyp;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vVein;varying float vGyp;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 _rP=diffuseColor.rgb;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   'diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(0.16,0.2,0.18),vec3(0.18,0.42,0.3),step(0.55,fract(vVein*7.0))),vVein*0.75);'+
   'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*0.55+vec3(0.3,0.29,0.27),vGyp*0.6);}');};
if(USE_KG)KGROUND.hook(MAT_ROCK,{key:'line-'+STATION.key+'-rock',at:'/*KGROUND*/',relief:{bump:.06,cavity:.55},tri:{from:.3,to:.65,far:120},layers:[
 KGROUND.layer('line',LINE.rockLayer==null?'rock.riftfill':LINE.rockLayer,{w:'1.0',amt:.85,gain:1.0,name:LINE.rockName==null?'rift fill (lake limestone and mudstone)':LINE.rockName})].filter(Boolean)});
const ROCK=(function(){const all=CAVE_C.chunks,cs=CAVE_C.chunk,VW=LINE.rockWeight,GW=LINE.gypWeight,tmp=[0];
 CAVE_C.chunks=all.filter(k=>{const p=k.split(',').map(Number);return LINE.rockShows(p[0]*cs,p[2]*cs,cs,p[1]*cs);});
 const R=KCAVERN.drawRock(CAVE_C,{THREE,material:MAT_ROCK,tile:64,attrs:['aVein','aGyp'],label:'The rift fill round the Line (lake limestone and mudstone)',name:'the Line\'s rock',
  weight:(x,y,z,nx,ny,nz,ch,i,w)=>{w[0]=0;w[1]=0;if(VW){tmp[0]=0;VW(x,y,z,tmp);w[0]=tmp[0];}if(GW)w[1]=GW(x,y,z,nx,ny,nz);}});
 CAVE_C.chunks=all;
 scene.add(R.group);return R;})();
window._rock={meshes:ROCK.meshes,chunks:ROCK.chunks,tris:ROCK.tris,ms:ROCK.ms,kground:USE_KG};
