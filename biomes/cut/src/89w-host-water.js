// ================================================================= HOST - the lake on core/water (stations with water)
// [draw] core/water (core/water/README.md): the upper lake as ONE open surface over the page's 2.2 R square (the CDLOD mesh, a
// calm swell and a share of the shared wave field, the bed baked from terrainH, a shore grid flooded from the lake's side so the
// water stops where the beach does), and the far lake out to the horizon as a second flat surface a hand lower, masked off over
// the near one (swbay's outer water). The sky in the water is the shared sky's own scene (89s-host-sky.js), recaptured as the
// hour moves. A station with no water (STAGE.water null) records the stage's dry state with core/water so the export's water
// section says so (WATER_STATE).
let LAKE_DRAW=null,FAR_DRAW=null;
const WATER_STATE={level:WATER_LEVEL,lakes:[]};
if(STAGE.water){
 {const WENV={environment:null};ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.35,.42,.29])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
 const lin=c=>new THREE.Color(c).convertSRGBToLinear();
 const BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
 /* the lake's side of the page: down the floor from the shore (STAGE.up points up it) */
 const seedXZ=[-STAGE.up[0]*TERR.R*.95,-STAGE.up[1]*TERR.R*.95];
 const LAKE=WATER.open({name:STAGE.water.name,level:WATER_LEVEL,swell:[[.05,40,280,0,.04],[.03,16,240,1.3,.03]],field:.1,bounds:BOX,
  bed:terrainH,bedBox:BOX,bedCell:8,shore:{seeds:[seedXZ]}});
 LAKE_DRAW=WATER.draw(LAKE,{renderOrder:1,roughness:.18,metalness:.05,envMapIntensity:.24,
  shallow:lin(STAGE.water.shallow==null?0x6aa89a:STAGE.water.shallow),deep:lin(STAGE.water.deep==null?0x1e4a5a:STAGE.water.deep)});
 LAKE_DRAW.mesh.userData.inspectLabel=STAGE.water.name;
 /* the far lake: flat, 0.12 m under, out to 30 km on the lake's side; off over the near surface's box */
 const FB=[-30000,-30000,30000,30000],c=100,nx=600,d=new Uint8Array(nx*nx),m=60;
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const x=FB[0]+(i+.5)*c,z=FB[1]+(j+.5)*c,inside=x>BOX[0]+m+c&&x<BOX[2]-m-c&&z>BOX[1]+m+c&&z<BOX[3]-m-c;
  const lakeSide=x*STAGE.up[0]+z*STAGE.up[1]<-200;d[j*nx+i]=!inside&&lakeSide?255:0;}
 const FAR=WATER.open({name:STAGE.water.name+' (to the far shore)',level:WATER_LEVEL-.12,swell:[],field:0,bounds:FB,mask:{x0:FB[0],z0:FB[1],cell:c,nx,nz:nx,data:d}});
 FAR_DRAW=WATER.draw(FAR,{renderOrder:0,roughness:.2,metalness:.05,envMapIntensity:.24,shallow:lin(0x2a5a64),deep:lin(0x1e4a5a)});
 FAR_DRAW.mesh.userData.inspectLabel=STAGE.water.name;
 WATER_STATE.lakes.push(STAGE.water.name);}
// a station's still pool (the wall's cistern, the face's snowmelt tarn): WATER.still over its polygon, drawn flat with the sky in it
let POOL_DRAW=null;
if(STAGE.pool){if(!STAGE.water){const WENV={environment:null};ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.35,.42,.29])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
 const P=WATER.still(STAGE.pool);POOL_DRAW=WATER.drawStill(P,{color:new THREE.Color(STAGE.pool.color==null?0x3a6a6a:STAGE.pool.color).convertSRGBToLinear(),renderOrder:1});
 if(POOL_DRAW&&POOL_DRAW.mesh)POOL_DRAW.mesh.userData.inspectLabel=STAGE.pool.name;WATER_STATE.lakes.push(STAGE.pool.name);}
