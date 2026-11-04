// ================================================================= HOST — the bloodfalls' water on core/water (station 6)
//   THE FALLS   WATER.underIceFall (core/water ext/54: the Godthrone's bloodfalls kind): the brine out from under the ice margin at the rock step,
//               clear grey-green at the mouth and rusting red down the curtain by its age in the air (B.rustF), red icicles from the ice lip, the
//               stain on the ice and the rock and the fan below it (B.stainAt; the ground's rust field paints the same fan), the red pool at its
//               foot; drawn by WATER.drawBloodFall (the fall's own shader with the rust line, the pool with drawStill)
//   QOL ḌRĀI    the blood river: a WATER.flow down the valley's graded bed (45b: it never climbs), its look 'bloodriver' (the rust has settled,
//               the water dark and clear-ish), the riverweed down it (WATER.weed, drawn by WATER.drawWeed: crimson blades streaming with the
//               current, thickest in the rapids)
// No WATER.mirrorSwitch: the kit's only still is the pool under the falls, ~28 m across (BACKPORT.md: a large still); no breakers (no open
// water). The river meets no lake or sea on the map, so no plume.
{const env=new THREE.Scene(),WENV={environment:null};env.add(new THREE.Mesh(sky.geometry,sky.material));ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a8e92)});}
const BLOOD=(function(){const mx=FALL.x,mz=marginZ(mx),rock=preH(mx,mz-1.5)+.4,foot=[mx,mz+40,QOLBED(0)+.3];
 const B=WATER.underIceFall({name:'The bloodfalls',mouth:[mx,mz-.6,rock],dir:[0,1],width:4.5,drop:Math.max(8,rock-foot[2]),foot,ice:{top:terrainH(mx,mz-12),arch:1.8},
  pool:{r:26,depth:.9},tau:.45,   /* the look's 1 s rusts a 1.3 s fall to only 75% by its foot: the plan's fall is blood-red at the foot (a look decision: KNOWN_ISSUES.md) */
  stain:{length:90,spread:.45,face:2.5},icicles:{count:22,span:16,len:[.5,3.2]},seed:KRAND.hash(WORLD,66,0,0xB100D)});
 const D=WATER.drawBloodFall(B,{pick:true,renderOrder:1});
 if(D.mesh){D.mesh.userData.inspectLabel='The bloodfalls: iron brine out of the ice, rusting red as it falls';}
 if(D.pool&&D.pool.mesh){D.pool.mesh.userData.inspectLabel='The red pool under the falls (steams faintly on cold days)';D.pool.mesh.userData.probeSkip=true;}
 // the icicles: thin cones hung from the ice lip, red-stained near the mouth (B.icicles: KRAND by index)
 {const pos=[],col=[],idx=[],red=new THREE.Color(0x8e2a14).convertSRGBToLinear(),wh=new THREE.Color(0xd8e4ec).convertSRGBToLinear();
  B.icicles.forEach(c=>{const n0=pos.length/3,S=6;for(let k=0;k<S;k++){const a=k/S*Math.PI*2;pos.push(c.x+Math.cos(a)*c.r,c.y,c.z+Math.sin(a)*c.r);}pos.push(c.x,c.y-c.len,c.z);
   const q=wh.clone().lerp(red,c.stain*.85);for(let k=0;k<=S;k++)col.push(q.r,q.g,q.b);for(let k=0;k<S;k++)idx.push(n0+k,n0+(k+1)%S,n0+S);});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.25,metalness:0,side:THREE.DoubleSide}));m.userData.host=true;m.userData.inspectLabel='Icicles on the ice lip, red-stained over the mouth';scene.add(m);}
 REGISTER({name:'The bloodfalls and the red pool',x:mx,z:mz+20,y:foot[2]-2,r:40,h:rock-foot[2]+30,tags:{water:{kind:'bloodfall'}}});
 return{B,D};})();
const QOL_DRAW=(function(){const pts=[],ws=[];for(let i=0;i<QOL.pts.length;i++){const p=QOL.pts[i];if(i>0&&Math.max(Math.abs(p[0]-TERR.cx),Math.abs(p[1]-TERR.cz))>TERR.R*1.05)break;
  const s=_qd[i];if(s<60)continue;pts.push([p[0],p[1],QOLBED(s)+.45]);ws.push(Math.max(3,2*QW(s)*.32));}
 if(pts.length<3)return null;
 const F=WATER.withLook(WATER.flow({name:'Qol Ḍrāi, the blood river',pts,width:ws,speed:1.3}),'bloodriver');
 const d=WATER.drawFlow(F,WATER.lookDraw('bloodriver','flow',{rapids:[.1,.28],metalness:.05,envMapIntensity:.35,step:6,across:2,margin:2,renderOrder:1}));
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel='Qol Ḍrāi, the blood river (red with its riverweed, not its water)';
 const W=WATER.weed(F,{look:'bloodriver',seed:KRAND.hash(WORLD,67,0,0x3EED)}),DW=W.length?WATER.drawWeed(W,{width:.1,segs:5,sway:.14}):null;
 if(DW&&DW.mesh){DW.mesh.userData.inspectLabel='Red riverweed: a native water plant that thrives on the iron, crimson and purple in the rapids';DW.mesh.userData.probeSkip=true;}
 return{F,d,weed:W.length};})();
window._water={falls:!!BLOOD.D,river:!!QOL_DRAW,weed:QOL_DRAW?QOL_DRAW.weed:0};
