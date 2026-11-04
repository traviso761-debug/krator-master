// ================================================================= HOST - the lake on core/water
// [draw] core/water (core/water/README.md): the valley lake and its drowned inlets as ONE open surface over the page's 2.2 R square (the
// CDLOD mesh, a calm swell and a share of the shared wave field, the bed baked from terrainH, a shore grid flooded from the model's water
// cells so the water stops where the ground rises past the lake's level), and the far lake out to 30 km as a second flat surface a hand
// lower, masked to the model's water cells (the drowned river trenches north and south of the ridge, the lake beyond to the south),
// off over the near one. The sky in the water is the shared sky's own scene (89s-host-sky.js), recaptured as the hour moves.
let LAKE_DRAW=null,FAR_DRAW=null;
const WATER_STATE={level:WATER_LEVEL,lakes:[]};
{const WENV={environment:null};ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.35,.42,.29])).convertSRGBToLinear(),
  key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
/* the flood's seeds: the model's water cells inside the page (the inlets), at their cell centres, where the ground lies under the lake */
const WATER_SEEDS=(function(){const G=AV_REGION.grid,out=[];G.water.forEach(w=>{const x=G.x0+w[0]*G.dx,z=G.z0+w[1]*G.dz;if(Math.abs(x)<BOX[2]-200&&Math.abs(z)<BOX[3]-200&&terrainH(x,z)<WATER_LEVEL-1)out.push([x,z]);});
 if(!out.length)out.push([0,BOX[3]-300]);return out;})();
const LAKE=WATER.open({name:STAGE.water.name,level:WATER_LEVEL,swell:[[.05,40,280,0,.04],[.03,16,240,1.3,.03]],field:.1,bounds:BOX,
 bed:terrainH,bedBox:BOX,bedCell:8,shore:{seeds:WATER_SEEDS}});
LAKE_DRAW=WATER.draw(LAKE,{renderOrder:1,roughness:.2,metalness:.05,envMapIntensity:.22,shallow:lin(STAGE.water.shallow),deep:lin(STAGE.water.deep)});
LAKE_DRAW.mesh.userData.inspectLabel=STAGE.water.name;
/* the far lake: flat, 0.12 m under, to 30 km, where the model has water; off over the near surface's box */
{const FB=[-30000,-30000,30000,30000],c=100,nx=600,d=new Uint8Array(nx*nx),m=60,M=STAGE.model;
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const x=FB[0]+(i+.5)*c,z=FB[1]+(j+.5)*c,inside=x>BOX[0]+m+c&&x<BOX[2]-m-c&&z>BOX[1]+m+c&&z<BOX[3]-m-c;
  d[j*nx+i]=!inside&&M.water(x,z)!=null?255:0;}
 const FAR=WATER.open({name:STAGE.water.name+' (to the far shore)',level:WATER_LEVEL-.12,swell:[],field:0,bounds:FB,mask:{x0:FB[0],z0:FB[1],cell:c,nx,nz:nx,data:d}});
 FAR_DRAW=WATER.draw(FAR,{renderOrder:0,roughness:.22,metalness:.05,envMapIntensity:.22,shallow:lin(0x2a4a54),deep:lin(0x1a3440)});
 FAR_DRAW.mesh.userData.inspectLabel=STAGE.water.name;}
WATER_STATE.lakes.push(STAGE.water.name);
