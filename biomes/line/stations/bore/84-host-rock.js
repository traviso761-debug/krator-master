// ================================================================= HOST — the rock: the cavern carved, and drawn only where it shows
// LINE.cavern() (48) carves the gallery, the niches and the vein's gallery in the rift fill (KCAVERN, 1 m: the lining hides the gallery's rock, so
// no finer lattice is needed). The lining (85) is a drawn shell inside the void, so the rock shows only where the lining opens: the niches in the
// east wall and the vein's gallery behind one of them. Only the chunks east of the east wall are meshed and drawn (KCAVERN.drawRock over that
// share of C.chunks); C.sdf answers for the whole void (the checks, the eyes). The rock: the rift fill, a pale grey-brown limestone and mudstone,
// stained where the vein runs (the rare earths' dark bands and copper's green: aVein near the vein's gallery). KGROUND's layers on the walls.
const CAVE_C=LINE.cavern();
const USE_KG=typeof KGROUND!=='undefined'&&Q.get('kground')!=='0';
const MAT_ROCK=new THREE.MeshStandardMaterial({color:0x9a8e7e,roughness:.92,metalness:0,vertexColors:true,side:THREE.DoubleSide});
MAT_ROCK.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aVein;varying float vVein;')
  .replace('#include <begin_vertex>','#include <begin_vertex>\nvVein=aVein;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vVein;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 _rP=diffuseColor.rgb;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   'diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(0.16,0.2,0.18),vec3(0.18,0.42,0.3),step(0.55,fract(vVein*7.0))),vVein*0.75);}');};
if(USE_KG)KGROUND.hook(MAT_ROCK,{key:'line-bore-rock',at:'/*KGROUND*/',relief:{bump:.06,cavity:.55},tri:{from:.3,to:.65,far:120},layers:[
 KGROUND.layer('line','rock.riftfill',{w:'1.0',amt:.85,gain:1.0,name:'rift fill (lake limestone and mudstone)'})].filter(Boolean)});
const ROCK=(function(){const all=CAVE_C.chunks,east=SEC.x1+SEC.lining-2,V=LINE.vein;
 /* the chunks behind the east wall: the niches and the vein's gallery */
 CAVE_C.chunks=all.filter(k=>{const p=k.split(',').map(Number);return (p[0]+1)*CAVE_C.chunk>east;});
 const R=KCAVERN.drawRock(CAVE_C,{THREE,material:MAT_ROCK,tile:64,attrs:['aVein'],label:'The rift fill round the Line (lake limestone and mudstone)',name:'the Line\'s rock',
  weight:(x,y,z,nx,ny,nz,ch,i,w)=>{let d=1e9;for(let j=0;j+1<V.pts.length;j++){const a=V.pts[j],b=V.pts[j+1],dx=b[0]-a[0],dz=b[2]-a[2],L=dx*dx+dz*dz,
   t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/L));d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[2]-dz*t));}
   /* the vein: a band 1.4 m high through the gallery's walls, dipping with it, patchy along its length (core/rand's noise) */
   const yv=V.pts[0][1]+1.3-(x-V.pts[0][0])*.012,band=smooth(.9,.2,Math.abs(y-yv));w[0]=clamp(band*smooth(6,1.5,d)*(.6+.6*KRAND.fbm(x*.2,y*.3,z*.2,3,91)),0,1);}});
 CAVE_C.chunks=all;
 scene.add(R.group);return R;})();
window._rock={meshes:ROCK.meshes,chunks:ROCK.chunks,tris:ROCK.tris,ms:ROCK.ms,kground:USE_KG};
