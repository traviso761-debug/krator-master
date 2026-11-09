// ================================================================= HOST — the rock: the cavern's chunks on KGROUND's layers
// CAVE.C's chunks drawn by core/terrain's KCAVERN.drawRock (one mesh per 64 m tile) with this page's weights: the bay's grey limestone
// (rock.limestone, nwbay's own karst set), calcite on the floors, the lower walls and the flowstone's ground (stone.calcite), and the dark wet band
// at the waterline in the cenote's shaft (rock.wet). The ground's triangles inside the cenote's rim are dropped: the page draws no surface, and
// the shaft opens on a disc of daylight. ?kground=0 for the paint alone.
const USE_KG=typeof KGROUND!=='undefined'&&Q.get('kground')!=='0';
const MAT_ROCK=new THREE.MeshStandardMaterial({color:0xb8b4a8,roughness:.85,metalness:0,vertexColors:true,side:THREE.DoubleSide});
MAT_ROCK.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aCal;attribute float aWet;varying float vCal;varying float vWet;')
  .replace('#include <begin_vertex>','#include <begin_vertex>\nvCal=aCal;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vCal;varying float vWet;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 _rP=diffuseColor.rgb;'+(USE_KG?'\n/*KGROUND*/\n':'diffuseColor.rgb=mix(mix(_rP,vec3(0.86,0.82,0.72),vCal),_rP*0.45,vWet);')+'}');};
if(USE_KG)KGROUND.hook(MAT_ROCK,{key:'nwbay-caves-rock',at:'/*KGROUND*/',relief:{bump:.06,cavity:.6},tri:{from:.3,to:.65,far:140},layers:[
 KGROUND.layer('nwbay-caves','rock.limestone',{w:'1.0',amt:.85,gain:1.0,name:'the bay\'s grey limestone'}),
 KGROUND.layer('nwbay-caves','stone.calcite',{w:'vCal',amt:.9,gain:1.0,name:'calcite and flowstone'}),
 KGROUND.layer('nwbay-caves','rock.wet',{w:'vWet',amt:.9,gain:1.0,name:'the wet band at the waterline'})].filter(Boolean)});
const ROCK=(function(){const L=SITE.water.level;
 const R=KCAVERN.drawRock(CAVE.C,{THREE,material:MAT_ROCK,tile:64,attrs:['aCal','aWet'],ground:'drop',label:'The bay\'s limestone, drowned (calcite on the floors)',name:'the cave\'s rock',
  weight:(x,y,z,nx,ny,nz,ch,i,w)=>{const n1=KRAND.fbm(x*.05,y*.07,z*.05,3,37);
   w[0]=clamp(smooth(.4,.85,ny)*(.55+.6*n1)+ch.w[i*4+3]*.5,0,1);
   w[1]=clamp(smooth(L+3.5,L+.3,y)*smooth(L-1.5,L,y)*(.7+.4*n1),0,1);}});
 const grp=R.group;scene.add(grp);
 /* the daylight at the cenote's rim: a disc of sky (unlit, unfogged) */
 const d=new THREE.Mesh(new THREE.CircleGeometry(CE.r*CE.e*1.8,48),new THREE.MeshBasicMaterial({color:0xcfe0e4,fog:false}));d.rotation.x=Math.PI/2;d.position.set(CE.x,CE.rim+3.5,CE.z);
 d.userData.host=true;d.userData.probeSkip=true;d.userData.inspectLabel='Daylight over the cenote (the bay jungle, '+Math.round(CE.rim)+' m up)';grp.add(d);
 return R;})();
window._rock={meshes:ROCK.meshes,chunks:ROCK.chunks,tris:ROCK.tris,ms:ROCK.ms,kground:USE_KG};
