// ================================================================= HOST — STATION 3: the walk-in geode on the maar's rim (PLAN.md section 7, S7; biomes/CRYSTAL-CAVES-5.1.md site 3)
// The basalt plateau's flows hold amethyst geodes, the maars' hot water the silica that filled them. The explosion that blew the maar threw a block of a
// flow top onto the rim; it lies split open along its geode, the broken face toward the pit. core/terrain's KGEODE (39f) on a KCAVERN (39), drawn by
// KCAVERN.drawRock and KGEODE.draw (39e, 39g), as biomes/scablands draws its coulee's (src/87g-host-geodes.js): the block's mass and pocket, the
// amethyst lining aimed at the pocket's middle, the agate rind on its walls. Registered; an obstacle for the plants. ?geode=0 none.
const GEODE=(function(){if(new URLSearchParams(location.search).get('geode')==='0'||typeof KGEODE==='undefined'||typeof KCAVERN==='undefined')return null;const t0=performance.now();
 const g=SITE.geode,a=Math.atan2(g.z,g.x),r=SITE.maar.r+90,x=Math.cos(a)*r,z=Math.sin(a)*r,face=Math.atan2(-z,-x);   /* on the rim, its face to the pit */
 const C=KCAVERN.create({ground:terrainH,cell:.25,chunk:16,seed:9890});
 const BK=KGEODE.block(C,{id:'geode-block',x,z,ground:terrainH,face,world:9890,name:'The walk-in geode on the rim: a block of a flow top thrown out by the maar, split open along its geode'});
 C.build();
 const LINING=KGEODE.line(C,BK,{world:9890,n:6000,len:[.12,.36]});
 OBSTACLES.push({x:BK.x,z:BK.z,r:6.5});
 const USE_KGG=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0';
 const lib=n=>{const L=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('siphon',n):null;return L?KMAT.textures(L,{aniso:4}):null;};
 const MB=new THREE.MeshStandardMaterial({color:USE_KGG?0xa09890:0x4a4440,roughness:.95,metalness:0,vertexColors:true});
 MB.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aRind;varying float vRind;').replace('#include <begin_vertex>','#include <begin_vertex>\nvRind=aRind;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vRind;').replace('#include <map_fragment>','#include <map_fragment>\n'+(USE_KGG?'/*KGROUND*/':'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.72,0.74,0.8),vRind);'));};
 if(USE_KGG)KGROUND.hook(MB,{key:'siphon-geode-block',at:'/*KGROUND*/',tri:{from:.2,to:.6,far:120},layers:[
  KGROUND.layer('siphon','basalt',{w:'1.0',amt:.9,gain:1.0,name:'vesicular basalt (the flow top)'}),
  KGROUND.layer('siphon','agate',{w:'vRind',amt:.95,gain:1.0,name:'the agate rind'})].filter(Boolean)});
 const P=BK.pocket,PI=C.prims.findIndex(q=>q.id===P.id);
 const RK=KCAVERN.drawRock(C,{THREE,material:MB,tile:64,attrs:['aRind'],ground:'drop',label:BK.name,name:'the geode block',weight:(x,y,z,nx,ny,nz,ch,i,w)=>{w[0]=ch.prim[i]===PI?1:0;}});
 RK.group.children.forEach(m=>{m.userData.host=true;m.userData.geode=true;});scene.add(RK.group);
 const LAMP={value:.5};
 const D=KGEODE.draw([],{THREE,points:LINING,lamp:LAMP,tint:0x7240b8,maps:{skin:(lib('basalt')||{}).map||null,agate:(lib('agate')||{}).map||null,amethyst:(lib('amethyst')||{}).map||null}});
 const pp=[];LINING.forEach(q=>pp.push(q.x,q.y,q.z));D.group.userData.probePoints=pp;scene.add(D.group);tick(()=>D.update(camera.position));D.update(camera.position);
 REGISTER({name:BK.name+' (a pocket '+(P.r*2).toFixed(1)+' m across, '+LINING.length+' amethyst points)',key:'geode.block',x:BK.x,z:BK.z,y:BK.y0,r:6,h:BK.y1-BK.y0+2,
  tags:{geode:{kind:'block',pocket:{c:P.c,r:P.r,h:P.h},face:BK.face}}});
 window._geode={lining:LINING.length,pocket:+(P.r*2).toFixed(2),x:Math.round(BK.x),z:Math.round(BK.z),tris:D.tris+RK.tris,ms:Math.round(performance.now()-t0)};
 return {block:BK,lining:LINING,cavern:C,draw:D,rock:RK};})();
