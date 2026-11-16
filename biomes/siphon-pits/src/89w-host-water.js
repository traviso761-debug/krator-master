// ================================================================= HOST — the water (core/water; PLAN.md sections 3 and 6). highrift's 89w, the station's own surfaces:
//   terraces  the braided meltwater: each braid a WATER.flow on the cobble floor (KRELIEF.wadi's), milky with glacial flour, its bars standing out of it
//   pitfloor  the vent well: a WATER.geyser on the diatreme's vent (the model's vent kind 3 px off, brought onto the page); the mud pots WATER.spring (boiling,
//             milky grey-brown); a hot pool at each fumarole's foot
//   scarp, arete: none (frozen ground and bare basalt; the pits' floors hold no standing water)
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a6660)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const SPRING_MATS=new Map(),GEYSER_MATS=new Map(),GEYSER_U={uScale:{value:900}};
TICKS.push(()=>{GEYSER_U.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));});
function spring(key,name,x,z,r,level,temp,mineral,o){const S=WATER.spring(Object.assign({key,name,x,z,r,level,temp,mineral,milky:.3,boil:temp>.9?1:0,steam:0},o||{}));
 const d=WATER.drawSpring(S,{THREE,scene,fog:scene.fog,mats:SPRING_MATS,renderOrder:1});d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=name;return S;}
const W_OUT={};
if(SKEY==='terraces'){W_OUT.braids=0;
 for(const b of L.BR){const pts=[];for(let x=TERR.R*1.05;x>=-TERR.R*1.05;x-=20)pts.push([x,L.zc(x)+b.q(x),L.level(x)]);pts.reverse();   /* downstream: west to east */
  const F=WATER.flow({name:'A meltwater braid',pts,width:b.w,speed:1.4,rapids:[.02,.06]});
  const D=WATER.drawFlow(F,{shallow:lin(0xa8b8b4),deep:lin(0x5a7a7c),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.4,step:10,across:5,margin:1,depthBias:2,renderOrder:2,pick:true});
  D.mesh.userData.inspectLabel='A meltwater braid (glacial flour from the Stalker glaciers)';W_OUT.braids++;}
 REGISTER({name:'The braided bed (the meltwater\'s floods)',x:0,z:L.zc(0),y:L.floorAt(0)-2,r:2600,h:8,tags:{hazard:{kind:'drown',danger:.4}}});}
if(SKEY==='pitfloor'){const G=SITE.geyser,y=terrainH(G.x,G.z);
 const S=WATER.geyser({key:'pitfloor-geyser',name:'The vent well (the diatreme\'s geyser)',vents:[[G.x,G.z]],top:y+.6,H:G.H,style:G.style,period:G.period,pre:G.period*.15,dur:G.period*.18,steam:G.period*.2,pool:3,world:9803});
 const P=WATER.drawGeyser(S,{THREE,scene,uniforms:GEYSER_U,fog:scene.fog,wind:[.1,-.05],gravity:7.4,mats:GEYSER_MATS}).points;P.userData.inspectLabel='The vent well';
 /* its hazard is the vent's record (48) */W_OUT.geyser=true;
 SITE.mud.forEach((m,i)=>{spring('mud'+i,'A mud pot (boiling)',m[0],m[1],m[2]*.92,SITE.base-.15,1,'iron',{milky:.95});
  REGISTER({name:'A mud pot (boiling: it scalds)',x:m[0],z:m[1],y:SITE.base-3,r:m[2],h:6,tags:{hazard:{kind:'heat',danger:.7}}});});
 W_OUT.mud=SITE.mud.length;}
if(WATER.breakupFlows)WATER.breakupFlows();
window._water=Object.assign({station:SKEY,surfaces:WATER.surfaces.length},W_OUT);
