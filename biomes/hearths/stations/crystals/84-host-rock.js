// ================================================================= HOST — the rock: the cavern's chunks on KGROUND's layers
// CAVE.C's chunks (KCAVERN surface nets, 1 m), drawn by core/terrain's KCAVERN.drawRock (one mesh per 64 m tile: a handful of draws, each culled by
// its box) with this page's weights. The rock is the rift fill's lake limestone (rock.limestone), iron-stained rust red on the drained storey's
// roofs and the walls between the crystals (rock.ironstain), with gypsum crust on the floors and the lower walls and in KKARST's crust band
// (ground.gypsum; on the active storey the band from the water to 6 m over it, wet): KGROUND's layers (43-core-ground.js), each on a weight per
// vertex (aIron, aGyp), sampled from the side on the walls (tri) with the relief's bump and cavity. ?kground=0 for the paint alone. The vents'
// wells and the fumarole show the sky: a disc of daylight over each.
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
const ROCK=(function(){const G=65535,Y1=SITE.net.levels[0].y,Y0=SITE.net.level,TB=SITE.net.table,mid=(Y0+Y1)/2;
 /* each vertex's storey floor (the nearer of the two), its height over it; the stain: up the drained storey's walls and over its roofs, patchy
    (core/rand's noise), faint below; the crust: on the floors, the lower walls and KKARST's crust band, and on the active storey from the water up */
 const R=KCAVERN.drawRock(CAVE.C,{THREE,material:MAT_ROCK,tile:64,attrs:['aGyp','aIron'],label:'Lake limestone and gypsum, iron-stained (the hold\'s rock)',name:'the cave\'s rock',
  weight:(x,y,z,nx,ny,nz,ch,i,w)=>{const up=y>mid,hf=y-(up?Y1:Y0),n1=KRAND.fbm(x*.045,y*.06,z*.045,3,71),crust=ch.w[i*4+3];
   w[1]=clamp((smooth(.6,5,hf)*(.5+.9*n1)+smooth(-.15,-.7,ny)*.5)*(up?1:.35),0,1);
   w[0]=ch.prim[i]===G?0:clamp(Math.max(smooth(.45,.85,ny)*smooth(9,1.5,hf)*.8,smooth(2.6,.4,hf)*.7,crust*.6,up?0:smooth(TB+7,TB+1,y)*.85),0,1);}});
 const grp=R.group;scene.add(grp);
 /* the daylight at each vent's top and the fumarole's: a disc of sky over the throat (unlit, unfogged) */
 const sky=new THREE.MeshBasicMaterial({color:0xe9eef4,fog:false});
 CAVE.throats.concat(CAVE.fumarole?[Object.assign({fum:true},CAVE.fumarole,{r:CAVE.fumarole.r*1.3})]:[]).forEach(T=>{const d=new THREE.Mesh(new THREE.CircleGeometry(T.r+1.2,24),sky);d.rotation.x=Math.PI/2;d.position.set(T.c[0],T.ground+2.5,T.c[1]);
  d.userData.host=true;d.userData.probeSkip=true;d.userData.inspectLabel=T.fum?'Daylight down the fumarole\'s shaft':'Daylight down the vent (the shelf\'s surface, '+Math.round(T.ground-T.y0)+' m up)';grp.add(d);});
 return R;})();
window._rock={meshes:ROCK.meshes,chunks:ROCK.chunks,tris:ROCK.tris,ms:ROCK.ms,kground:USE_KG};
